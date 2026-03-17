(function () {
    'use strict';

    var LOG = true;
    function log() { if (LOG && typeof console !== 'undefined' && console.log) console.log.apply(console, ['[anti-dmca]'].concat(Array.prototype.slice.call(arguments))); }

    var TMDB_HOST = 'api.themoviedb.org';
    var API_KEY = '4ef0d7355d9ffb5151e987764708ce96';

    var cardPathRe = /\/3\/(movie|tv)\/(\d+)(?:\/|$|\?)/;
    var subPathRe = /\/3\/(?:movie|tv)\/\d+\/([^\/\?]+)/;
    var blockedRe = /^\s*\{\s*"blocked"\s*:\s*true\s*\}\s*$/;

    /** Набор XHR, которые плагин сам создал для подмены — не перехватываются повторно */
    var ownXhrs = new WeakSet();

    /** ID карточек, для которых зеркало вернуло blocked — /images для них идёт напрямую на TMDB */
    var blockedCards = {};

    function isMirrorTmdb(url) {
        return typeof url === 'string' && (url.indexOf('apitmdb.') !== -1 || url.indexOf('tmdb.') !== -1) && url.indexOf(TMDB_HOST) === -1;
    }

    function getCubDomain() {
        try {
            if (typeof Lampa !== 'undefined' && Lampa.Manifest && Lampa.Manifest.cub_domain)
                return Lampa.Manifest.cub_domain;
            var use = typeof localStorage !== 'undefined' && localStorage.getItem('cub_domain');
            if (use) return use;
        } catch (e) {}
        return 'cub.rip';
    }

    function getLampaTmdbOrigin() {
        try {
            var protocol = (typeof Lampa !== 'undefined' && Lampa.Utils && typeof Lampa.Utils.protocol === 'function')
                ? Lampa.Utils.protocol() : ((typeof localStorage !== 'undefined' && localStorage.getItem('protocol')) || 'https') + '://';
            return (protocol.replace(/\/+$/, '') || 'https:') + '//apitmdb.' + getCubDomain();
        } catch (e) {}
        return 'https://apitmdb.cub.rip';
    }

    function fixUrl(url) {
        if (typeof url !== 'string') return url;

        var bm = url.match(cardPathRe);
        if (bm && isMirrorTmdb(url)) {
            url = url.replace(/https?:\/\/[^\/]+/, 'https://' + TMDB_HOST);
            var sm = url.match(subPathRe);
            log('fixUrl: зеркало→TMDB', bm[1], bm[2], sm ? sm[1] : 'main');
            return url;
        }
        if (bm && url.indexOf(TMDB_HOST) !== -1) return url;

        if (url.indexOf(TMDB_HOST) !== -1) {
            var origin = getLampaTmdbOrigin();
            url = url.replace('https://' + TMDB_HOST, origin).replace('http://' + TMDB_HOST, origin);
        }
        return url;
    }

    function directTmdbUrl(type, id, suffix, params) {
        return 'https://' + TMDB_HOST + '/3/' + type + '/' + id + (suffix || '') + '?' + params;
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

    function fetchCard(id, type) {
        var key = type + '_' + id;
        if (cardCache[key]) return cardCache[key];
        var lang = getLang();
        var append = type === 'tv'
            ? 'credits,external_ids,videos,recommendations,similar,content_ratings'
            : 'credits,external_ids,videos,recommendations,similar';
        var url = directTmdbUrl(type, id, '', 'api_key=' + getApiKey() + '&language=' + lang + '&append_to_response=' + append);
        log('fetchCard →', type, id);
        var p = new Promise(function (resolve, reject) {
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
        cardCache[key] = p;
        return p;
    }

    function fetchImages(id, type, isRetry) {
        var key = type + '_' + id;
        if (!isRetry && imagesCache[key]) return imagesCache[key];
        var lang = getLang();
        var url = directTmdbUrl(type, id, '/images', 'api_key=' + getApiKey() + '&include_image_language=' + lang + ',en,null');
        log('fetchImages →', type, id, isRetry ? '(retry)' : '');
        var p = new Promise(function (resolve, reject) {
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
        if (!isRetry) imagesCache[key] = p;
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

    log('скрипт загружен, применяю патчи XHR/fetch');

    // --- XHR.open: сохраняем URL для быстрой проверки в send, заменяем api.themoviedb.org на зеркало ---
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (typeof url === 'string') this.__admca_url = url;
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[1] === 'string' && !ownXhrs.has(this)) {
            args[1] = fixUrl(args[1]);
        }
        return origOpen.apply(this, args);
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

            function done() {
                if (origOnReady) origOnReady.call(xhr);
                if (origOnLoad) origOnLoad.call(xhr);
            }

            if (sub === 'images') {
                fetchImages(id, type).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена images', type, id);
                    done();
                }, function () { log('fetchImages не удался', type, id); done(); });
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
            function doneErr() {
                if (origOnReady) origOnReady.call(xhr);
                if (origOnLoad) origOnLoad.call(xhr);
            }
            if (sub === 'images') {
                fetchImages(id, type).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена images (error)', type, id);
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
            function doneAbort() {
                if (origOnReady) origOnReady.call(xhr);
                if (origOnLoad) origOnLoad.call(xhr);
            }
            if (sub === 'images') {
                fetchImages(id, type).then(function (data) {
                    patchXhr(xhr, data, null);
                    log('подмена images (abort)', type, id);
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
            var inputUrl = typeof url === 'string' ? url : '';
            url = fixUrl(url);
            var requestedUrl = typeof url === 'string' ? url : inputUrl;
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
                    if (sub === 'images') {
                        return fetchImages(id, type).then(function (data) {
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
                if (sub === 'images') {
                    return fetchImages(id, type).then(function (data) {
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
