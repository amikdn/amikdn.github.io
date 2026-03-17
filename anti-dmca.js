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
        if (url.indexOf(TMDB_HOST) !== -1) {
            if (url.indexOf('/images') !== -1) {
                var bm = url.match(cardPathRe);
                if (bm && blockedCards[bm[1] + '_' + bm[2]]) {
                    log('fixUrl: /images для заблокированного', bm[1], bm[2], '→ напрямую на TMDB');
                    return url;
                }
            }
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

    function fetchImages(id, type) {
        var key = type + '_' + id;
        if (imagesCache[key]) return imagesCache[key];
        var lang = getLang();
        var url = directTmdbUrl(type, id, '/images', 'api_key=' + getApiKey() + '&include_image_language=' + lang + ',en,null');
        log('fetchImages →', type, id);
        var p = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            ownXhrs.add(xhr);
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && (data.logos || data.backdrops || data.posters)) { resolve(data); return; }
                } catch (e) {}
                delete imagesCache[key];
                reject();
            };
            xhr.onerror = function () { delete imagesCache[key]; reject(); };
            xhr.send();
        });
        imagesCache[key] = p;
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
        if (typeof args[1] === 'string' && !ownXhrs.has(this)) args[1] = fixUrl(args[1]);
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
        var handled = false;

        function handleBlocked() {
            if (handled) return true;
            var respUrl = xhr.responseURL || reqUrl;
            if (!cardPathRe.test(respUrl)) return false;

            var text = '';
            try { text = (xhr.responseText || '').trim(); } catch (e) {}
            if (!blockedRe.test(text)) return false;

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
            if (origOnError) origOnError.call(xhr);
        };

        return origSend.apply(this, arguments);
    };

    // --- fetch ---
    if (typeof fetch !== 'undefined') {
        var origFetch = window.fetch;
        window.fetch = function (url, opts) {
            if (typeof url === 'string') url = fixUrl(url);
            return origFetch.call(this, url, opts);
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
