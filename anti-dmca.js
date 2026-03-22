(function () {
    'use strict';

    var LOG = true;
    var LOG_URLS = true;
    function log() { if (LOG && typeof console !== 'undefined' && console.log) console.log.apply(console, ['[anti-dmca]'].concat(Array.prototype.slice.call(arguments))); }
    function logUrl(label, urlBefore, urlAfter) {
        if (!LOG_URLS || typeof console === 'undefined' || !console.log) return;
        if (urlAfter === undefined || urlAfter === urlBefore) {
            if (urlBefore) console.log('[anti-dmca]', label, urlBefore);
        } else {
            console.log('[anti-dmca]', label, urlBefore, '→', urlAfter);
        }
    }

    var TMDB_HOST = 'api.themoviedb.org';
    var API_KEY = '4ef0d7355d9ffb5151e987764708ce96';

    /** Нативный fetch до патча — для запросов к TMDB на Android WebView часто работает надёжнее XHR */
    var nativeFetch = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch.bind(window) : null;

    var cardPathRe = /\/3\/(movie|tv)\/(\d+)(?:\/|$|\?)/;
    var subPathRe = /\/3\/(?:movie|tv)\/\d+\/([^\/\?]+)/;
    var seasonNumRe = /\/season\/(\d+)(?:\/|$|\?)/;
    var blockedRe = /^\s*\{\s*"blocked"\s*:\s*true\s*\}\s*$/;

    /** Набор XHR, которые плагин сам создал для подмены — не перехватываются повторно */
    var ownXhrs = new WeakSet();

    /** ID карточек, для которых зеркало вернуло blocked — /images для них идёт напрямую на TMDB */
    var blockedCards = {};

    function isMirrorTmdb(url) {
        return typeof url === 'string' && (url.indexOf('apitmdb.') !== -1 || url.indexOf('tmdb.') !== -1) && url.indexOf(TMDB_HOST) === -1;
    }

    /* Запросы зеркал не трогаем — Lampa сама подставляет нужное зеркало. Только подменяем ответ при blocked/ошибке. */

    /** Как в proxy.js: tmdb.abmsx.tech при proxy_tmdb, иначе api.themoviedb.org — в обоих случаях одинаковая схема. */
    var PROXY_API_HOST = 'tmdb.abmsx.tech';

    /**
     * URL только для подмены (fetchCard / fetchImages / fetchSeason).
     * НЕ вызываем Lampa.TMDB.api() — в Cub он часто отдаёт apitmdb.cub.rip (зеркало), снова blocked.
     * Явно как proxy.js: proxy_tmdb → tmdb.abmsx.tech, иначе api.themoviedb.org.
     */
    function directTmdbUrl(type, id, suffix, params) {
        var path = type + '/' + id + (suffix || '') + '?' + params;
        try {
            var proto = (typeof Lampa !== 'undefined' && Lampa.Utils && typeof Lampa.Utils.protocol === 'function')
                ? Lampa.Utils.protocol() : 'https://';
            var useProxy = Lampa.Storage && typeof Lampa.Storage.field === 'function' && Lampa.Storage.field('proxy_tmdb');
            return (useProxy ? proto + PROXY_API_HOST + '/3/' : proto + TMDB_HOST + '/3/') + path;
        } catch (e) {}
        return 'https://' + TMDB_HOST + '/3/' + path;
    }

    function getLang() {
        try { return Lampa.Storage.get('language') || 'ru'; } catch (e) {}
        return (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'ru';
    }

    function getApiKey() {
        try { if (Lampa.TMDB && typeof Lampa.TMDB.key === 'function') return Lampa.TMDB.key(); } catch (e) {}
        return API_KEY;
    }

    /** Кэш Promise по ключу */
    var cardCache = {};
    var imagesCache = {};
    var seasonCache = {};

    function fetchCard(id, type) {
        var key = type + '_' + id;
        if (cardCache[key]) return cardCache[key];
        var lang = getLang();
        var append = type === 'tv'
            ? 'credits,external_ids,videos,recommendations,similar,content_ratings'
            : 'credits,external_ids,videos,recommendations,similar';
        var url = directTmdbUrl(type, id, '', 'api_key=' + getApiKey() + '&language=' + lang + '&append_to_response=' + append);
        log('fetchCard →', type, id);
        if (LOG_URLS) logUrl('fetchCard ссылка', url, undefined);
        var p;
        if (nativeFetch) {
            p = nativeFetch(url).then(function (r) { return r.json(); }).then(function (data) {
                if (data && data.id) return data;
                delete cardCache[key];
                return Promise.reject();
            }).catch(function () { delete cardCache[key]; return Promise.reject(); });
        } else {
            p = new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                ownXhrs.add(xhr);
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (data && data.id) { resolve(data); return; }
                    } catch (e) {}
                    delete cardCache[key];
                    reject();
                };
                xhr.onerror = function () { delete cardCache[key]; reject(); };
                xhr.send();
            });
        }
        cardCache[key] = p;
        return p;
    }

    function fetchImages(id, type, isRetry) {
        var key = type + '_' + id;
        if (!isRetry && imagesCache[key]) return imagesCache[key];
        var lang = getLang();
        var url = directTmdbUrl(type, id, '/images', 'api_key=' + getApiKey() + '&include_image_language=' + lang + ',en,null');
        log('fetchImages →', type, id, isRetry ? '(retry)' : '');
        if (LOG_URLS) logUrl('fetchImages ссылка', url, undefined);
        var p;
        if (nativeFetch) {
            var timeoutMs = 15000;
            p = Promise.race([
                nativeFetch(url).then(function (r) { return r.json(); }).then(function (data) {
                    if (data && (data.logos || data.backdrops || data.posters)) return data;
                    return Promise.reject();
                }),
                new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, timeoutMs); })
            ]).catch(function () {
                delete imagesCache[key];
                if (!isRetry) return fetchImages(id, type, true);
                return Promise.reject();
            });
        } else {
            p = new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                ownXhrs.add(xhr);
                var done = false;
                var t = setTimeout(function () {
                    if (done) return;
                    done = true;
                    xhr.abort();
                    if (!isRetry) {
                        delete imagesCache[key];
                        fetchImages(id, type, true).then(resolve, reject);
                    } else reject();
                }, 15000);
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4 || done) return;
                    done = true;
                    clearTimeout(t);
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (data && (data.logos || data.backdrops || data.posters)) { resolve(data); return; }
                    } catch (e) {}
                    if (!isRetry) { delete imagesCache[key]; fetchImages(id, type, true).then(resolve, reject); }
                    else { delete imagesCache[key]; reject(); }
                };
                xhr.onerror = function () {
                    if (done) return;
                    done = true;
                    clearTimeout(t);
                    if (!isRetry) { delete imagesCache[key]; fetchImages(id, type, true).then(resolve, reject); }
                    else { delete imagesCache[key]; reject(); }
                };
                xhr.send();
            });
        }
        if (!isRetry) imagesCache[key] = p;
        return p;
    }

    function fetchSeason(tvId, seasonNum) {
        var key = 'tv_' + tvId + '_s' + seasonNum;
        if (seasonCache[key]) return seasonCache[key];
        var lang = getLang();
        var url = directTmdbUrl('tv', tvId, '/season/' + seasonNum, 'api_key=' + getApiKey() + '&language=' + lang);
        log('fetchSeason → tv', tvId, 'season', seasonNum);
        if (LOG_URLS) logUrl('fetchSeason ссылка', url, undefined);
        var p;
        if (nativeFetch) {
            p = nativeFetch(url).then(function (r) { return r.json(); }).then(function (data) {
                if (data && (data.id !== undefined || data.episodes)) return data;
                delete seasonCache[key];
                return Promise.reject();
            }).catch(function () { delete seasonCache[key]; return Promise.reject(); });
        } else {
            p = new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                ownXhrs.add(xhr);
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (data && (data.id !== undefined || data.episodes)) { resolve(data); return; }
                    } catch (e) {}
                    delete seasonCache[key];
                    reject();
                };
                xhr.onerror = function () { delete seasonCache[key]; reject(); };
                xhr.send();
            });
        }
        seasonCache[key] = p;
        return p;
    }

    function patchXhr(xhr, realData, subPath) {
        var out, outText;
        if (subPath && realData[subPath] !== undefined) {
            out = realData[subPath];
            outText = JSON.stringify(out);
        } else {
            out = realData;
            outText = JSON.stringify(realData);
        }
        try { Object.defineProperty(xhr, 'responseText', { get: function () { return outText; }, configurable: true }); } catch (e) {}
        try { Object.defineProperty(xhr, 'response', { get: function () { return out; }, configurable: true }); } catch (e) {}
        try { Object.defineProperty(xhr, 'status', { value: 200, configurable: true }); } catch (e) {}
    }

    var isLikelyWebView = typeof navigator !== 'undefined' && /Android|webview|Lampa/i.test(navigator.userAgent || '');
    log('скрипт загружен, применяю патчи XHR/fetch', isLikelyWebView ? '(WebView/Android)' : '');
    if (isLikelyWebView && nativeFetch) log('внутренние запросы к TMDB через native fetch');

    // --- XHR.open: сохраняем URL для проверки в send, запросы не меняем ---
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (typeof url === 'string') this.__admca_url = url;
        if (LOG_URLS && !ownXhrs.has(this) && typeof url === 'string' && (cardPathRe.test(url) || isMirrorTmdb(url)))
            log('XHR.open', (arguments[0] || 'GET'), url);
        return origOpen.apply(this, arguments);
    };

    // --- XHR.send: перехватываем blocked только для TMDB movie/tv ---
    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        var xhr = this;
        if (ownXhrs.has(xhr)) return origSend.apply(this, arguments);

        var reqUrl = xhr.__admca_url || '';
        if (!cardPathRe.test(reqUrl) && !isMirrorTmdb(reqUrl)) {
            return origSend.apply(this, arguments);
        }

        var origOnReady = xhr.onreadystatechange;
        var origOnLoad = xhr.onload;
        var origOnError = xhr.onerror;
        var origOnAbort = xhr.onabort;
        var handled = false;

        function handleBlocked() {
            if (handled) return true;
            var respUrl = xhr.responseURL || reqUrl;
            if (!cardPathRe.test(respUrl)) return false;

            var text = '';
            try { text = (xhr.responseText || '').trim(); } catch (e) {}
            var isBlocked = blockedRe.test(text);
            var isFailed = !isBlocked && (xhr.status === 0 || xhr.status >= 400 || !text);
            if (!isBlocked && !isFailed) return false;

            var m = respUrl.match(cardPathRe);
            if (!m) return false;

            handled = true;
            var type = m[1], id = m[2];
            var sm = respUrl.match(subPathRe);
            var sub = sm ? sm[1] : null;

            blockedCards[type + '_' + id] = true;
            if (LOG_URLS) log('подмена по запросу (blocked/failed)', respUrl);

            function done() {
                if (origOnReady) origOnReady.call(xhr);
                if (origOnLoad) origOnLoad.call(xhr);
            }

            if (sub === 'images') {
                fetchImages(id, type).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена images', type, id);
                    done();
                }, function () {
                    log('fetchImages не удался', type, id);
                    patchXhr(xhr, { id: parseInt(id, 10), logos: [], backdrops: [], posters: [] }, null);
                    done();
                });
            } else if (sub === 'season' && type === 'tv') {
                var sn = respUrl.match(seasonNumRe);
                var seasonNum = sn ? parseInt(sn[1], 10) : 1;
                fetchSeason(id, seasonNum).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена season', type, id, 's' + seasonNum);
                    done();
                }, function () { log('fetchSeason не удался', type, id); done(); });
            } else {
                fetchCard(id, type).then(function (data) {
                    patchXhr(xhr, data, sub);
                    log('подмена', sub || 'main', type, id);
                    done();
                }, function () { log('fetchCard не удался', type, id); done(); });
            }
            return true;
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) { if (origOnReady) origOnReady.call(xhr); return; }
            if (!handleBlocked()) { if (origOnReady) origOnReady.call(xhr); }
        };
        xhr.onload = function () {
            if (!handled) {
                if (!handleBlocked()) { if (origOnLoad) origOnLoad.call(xhr); }
            }
        };
        xhr.onerror = function () {
            if (handled) { if (origOnError) origOnError.call(xhr); return; }
            if (!cardPathRe.test(reqUrl)) { if (origOnError) origOnError.call(xhr); return; }
            var me = reqUrl.match(cardPathRe);
            if (!me) { if (origOnError) origOnError.call(xhr); return; }
            handled = true;
            var type = me[1], id = me[2];
            var smer = reqUrl.match(subPathRe);
            var sub = smer ? smer[1] : null;
            blockedCards[type + '_' + id] = true;
            if (LOG_URLS) log('подмена по запросу (error)', reqUrl);
            function doneErr() {
                if (origOnReady) origOnReady.call(xhr);
                if (origOnLoad) origOnLoad.call(xhr);
            }
            if (sub === 'images') {
                fetchImages(id, type).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена images (error)', type, id);
                    doneErr();
                }, function () {
                    patchXhr(xhr, { id: parseInt(id, 10), logos: [], backdrops: [], posters: [] }, null);
                    doneErr();
                });
            } else if (sub === 'season' && type === 'tv') {
                var sne = reqUrl.match(seasonNumRe);
                var seasonNumE = sne ? parseInt(sne[1], 10) : 1;
                fetchSeason(id, seasonNumE).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена season (error)', type, id);
                    doneErr();
                }, function () { doneErr(); });
            } else {
                fetchCard(id, type).then(function (data) {
                    patchXhr(xhr, data, sub);
                    log('подмена', sub || 'main', '(error)', type, id);
                    doneErr();
                }, function () { doneErr(); });
            }
        };
        xhr.onabort = function () {
            if (handled) { if (origOnAbort) origOnAbort.call(xhr); return; }
            if (!cardPathRe.test(reqUrl)) { if (origOnAbort) origOnAbort.call(xhr); return; }
            var m = reqUrl.match(cardPathRe);
            if (!m) { if (origOnAbort) origOnAbort.call(xhr); return; }
            handled = true;
            var type = m[1], id = m[2];
            var sm = reqUrl.match(subPathRe);
            var sub = sm ? sm[1] : null;
            blockedCards[type + '_' + id] = true;
            if (LOG_URLS) log('подмена по запросу (abort)', reqUrl);
            function doneAbort() {
                if (origOnReady) origOnReady.call(xhr);
                if (origOnLoad) origOnLoad.call(xhr);
            }
            if (sub === 'images') {
                fetchImages(id, type).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена images (abort)', type, id);
                    doneAbort();
                }, function () {
                    patchXhr(xhr, { id: parseInt(id, 10), logos: [], backdrops: [], posters: [] }, null);
                    doneAbort();
                });
            } else if (sub === 'season' && type === 'tv') {
                var sna = reqUrl.match(seasonNumRe);
                var seasonNumA = sna ? parseInt(sna[1], 10) : 1;
                fetchSeason(id, seasonNumA).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена season (abort)', type, id);
                    doneAbort();
                }, function () { doneAbort(); });
            } else {
                fetchCard(id, type).then(function (data) {
                    patchXhr(xhr, data, sub);
                    log('подмена', sub || 'main', '(abort)', type, id);
                    doneAbort();
                }, function () { doneAbort(); });
            }
        };

        return origSend.apply(this, arguments);
    };

    // --- fetch: перехват ответов blocked/failed и подмена (для мобильной Lampa) ---
    if (typeof fetch !== 'undefined') {
        var origFetch = window.fetch;
        window.fetch = function (url, opts) {
            var requestedUrl = typeof url === 'string' ? url : '';
            if (LOG_URLS && cardPathRe.test(requestedUrl))
                log('fetch запрос', requestedUrl);
            return origFetch.call(this, url, opts).then(function (response) {
                if (!cardPathRe.test(requestedUrl)) return response;
                return response.clone().text().then(function (text) {
                    var t = (text || '').trim();
                    var isBlocked = blockedRe.test(t);
                    var isFailed = !response.ok || response.status === 0 || !t;
                    if (!isBlocked && !isFailed) return response;
                    var m = requestedUrl.match(cardPathRe);
                    if (!m) return response;
                    var type = m[1], id = m[2];
                    var sm = requestedUrl.match(subPathRe);
                    var sub = sm ? sm[1] : null;
                    blockedCards[type + '_' + id] = true;
                    log('fetch: подмена', sub || 'main', type, id);
                    if (LOG_URLS) log('fetch подмена по запросу', requestedUrl);
                    if (sub === 'images') {
                        return fetchImages(id, type).then(function (data) {
                            return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
                        }).catch(function () { return response; });
                    }
                    if (sub === 'season' && type === 'tv') {
                        var snf = requestedUrl.match(seasonNumRe);
                        var seasonNumF = snf ? parseInt(snf[1], 10) : 1;
                        return fetchSeason(id, seasonNumF).then(function (data) {
                            return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
                        }).catch(function () { return response; });
                    }
                    return fetchCard(id, type).then(function (data) {
                        var out = sub && data[sub] !== undefined ? data[sub] : data;
                        return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
                    }).catch(function () { return response; });
                }).catch(function () { return response; });
            }).catch(function (err) {
                if (!cardPathRe.test(requestedUrl)) throw err;
                var m = requestedUrl.match(cardPathRe);
                if (!m) throw err;
                var type = m[1], id = m[2];
                var sm = requestedUrl.match(subPathRe);
                var sub = sm ? sm[1] : null;
                blockedCards[type + '_' + id] = true;
                log('fetch: подмена при ошибке', sub || 'main', type, id);
                if (LOG_URLS) log('fetch подмена при ошибке по запросу', requestedUrl);
                if (sub === 'images') {
                    return fetchImages(id, type).then(function (data) {
                        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
                    });
                }
                if (sub === 'season' && type === 'tv') {
                    var snfc = requestedUrl.match(seasonNumRe);
                    var seasonNumFc = snfc ? parseInt(snfc[1], 10) : 1;
                    return fetchSeason(id, seasonNumFc).then(function (data) {
                        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
                    });
                }
                return fetchCard(id, type).then(function (data) {
                    var out = sub && data[sub] !== undefined ? data[sub] : data;
                    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
                });
            });
        };
    }

    // --- start: снимаем DMCA-ограничения в Lampa ---
    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;
        log('start: плагин инициализируется');
        window.anti_dmca_plugin = true;

        Lampa.Utils.dcma = function () { return undefined; };
        try {
            Object.defineProperty(window.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) { window.lampa_settings.dcma = []; }

        var tmdbSource = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (tmdbSource && typeof tmdbSource.parseCountries === 'function') {
            var origPC = tmdbSource.parseCountries;
            tmdbSource.parseCountries = function () {
                var r = origPC.apply(this, arguments);
                return Array.isArray(r) ? r : [];
            };
        }
    }

    if (window.appready) {
        log('appready уже true');
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        log('ожидаю событие app ready');
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') { log('событие app ready'); start(); }
        });
    } else {
        log('Lampa/Listener не найден при загрузке');
    }
})();
