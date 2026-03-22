(function () {
    'use strict';

    var TMDB_HOST = 'api.themoviedb.org';
    var API_KEY = '4ef0d7355d9ffb5151e987764708ce96';

    var nativeFetch = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch.bind(window) : null;

    var cardPathRe = /\/3\/(movie|tv)\/(\d+)(?:\/|$|\?)/;
    var subPathRe = /\/3\/(?:movie|tv)\/\d+\/([^\/\?]+)/;
    var seasonNumRe = /\/season\/(\d+)(?:\/|$|\?)/;
    var blockedRe = /^\s*\{\s*"blocked"\s*:\s*true\s*\}\s*$/;

    var ownXhrs = new WeakSet();

    var blockedCards = {};

    function isMirrorTmdb(url) {
        return typeof url === 'string' && (url.indexOf('apitmdb.') !== -1 || url.indexOf('tmdb.') !== -1) && url.indexOf(TMDB_HOST) === -1;
    }

    var PROXY_API_HOST = 'tmdb.abmsx.tech';

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

    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (typeof url === 'string') this.__admca_url = url;
        return origOpen.apply(this, arguments);
    };

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
                    done();
                }, function () {
                    patchXhr(xhr, { id: parseInt(id, 10), logos: [], backdrops: [], posters: [] }, null);
                    done();
                });
            } else if (sub === 'season' && type === 'tv') {
                var sn = respUrl.match(seasonNumRe);
                var seasonNum = sn ? parseInt(sn[1], 10) : 1;
                fetchSeason(id, seasonNum).then(function (data) {
                    patchXhr(xhr, data, null);
                    done();
                }, function () { done(); });
            } else {
                fetchCard(id, type).then(function (data) {
                    patchXhr(xhr, data, sub);
                    done();
                }, function () { done(); });
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
                    doneErr();
                }, function () { doneErr(); });
            } else {
                fetchCard(id, type).then(function (data) {
                    patchXhr(xhr, data, sub);
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
                    doneAbort();
                }, function () { doneAbort(); });
            } else {
                fetchCard(id, type).then(function (data) {
                    patchXhr(xhr, data, sub);
                    doneAbort();
                }, function () { doneAbort(); });
            }
        };

        return origSend.apply(this, arguments);
    };

    if (typeof fetch !== 'undefined') {
        var origFetch = window.fetch;
        window.fetch = function (url, opts) {
            var requestedUrl = typeof url === 'string' ? url : '';
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

    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;
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
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
