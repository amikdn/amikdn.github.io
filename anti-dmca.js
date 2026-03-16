(function () {
    'use strict';

    var LOG = function (step, msg, data) {
        var args = ['[anti-dmca] ' + step + ': ' + msg];
        if (data !== undefined) args.push(data);
        console.log.apply(console, args);
    };

    var tmdbProxyHost = 'apitmdb.cub.rip';
    var tmdbDirectHost = 'api.themoviedb.org';

    function fixUrl(url) {
        if (typeof url !== 'string') return url;
        if (url.indexOf(tmdbProxyHost) !== -1) url = url.replace(tmdbProxyHost, tmdbDirectHost);
        return url;
    }

    (function patchNetwork() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[1] === 'string') args[1] = fixUrl(args[1]);
            return origOpen.apply(this, args);
        };
        if (typeof fetch !== 'undefined') {
            var origFetch = window.fetch;
            window.fetch = function (url, opts) {
                if (typeof url === 'string') url = fixUrl(url);
                return origFetch.call(this, url, opts);
            };
        }
    })();

    LOG('init', 'скрипт загружен');

    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;

        window.anti_dmca_plugin = true;

        // 1. Принудительно tmdb как источник
        Lampa.Storage.set('source', 'tmdb');
        LOG('start', 'источник переключён на tmdb');

        // 2. dcma всегда пустой
        Lampa.Utils.dcma = function () { return undefined };
        try {
            Object.defineProperty(window.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) {
            window.lampa_settings.dcma = [];
        }

        // 3. parseCountries — всегда массив
        var tmdbSource = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (tmdbSource && typeof tmdbSource.parseCountries === 'function') {
            var origPC = tmdbSource.parseCountries;
            tmdbSource.parseCountries = function (movie) {
                var r = origPC.apply(this, arguments);
                return Array.isArray(r) ? r : [];
            };
            LOG('start', 'parseCountries пропатчен');
        }

        // 4. Перенаправление apitmdb.cub.rip → api.themoviedb.org в jQuery
        if (window.jQuery && window.jQuery.ajax) {
            var origAjax = window.jQuery.ajax;
            window.jQuery.ajax = function (urlOrSettings, options) {
                if (typeof urlOrSettings === 'object' && urlOrSettings && typeof urlOrSettings.url === 'string') {
                    urlOrSettings.url = fixUrl(urlOrSettings.url);
                } else if (typeof urlOrSettings === 'string') {
                    urlOrSettings = fixUrl(urlOrSettings);
                }
                return origAjax.call(this, urlOrSettings, options);
            };
        }

        LOG('start', 'готово (tmdb напрямую, dcma пуст, countries safe)');
    }

    if (window.appready) {
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
