(function () {
    'use strict';

    var LOG = function (step, msg, data) {
        var args = ['[anti-dmca] ' + step + ': ' + msg];
        if (data !== undefined) args.push(data);
        console.log.apply(console, args);
    };

    var tmdbProxyHost = 'apitmdb.cub.rip';
    var tmdbDirectHost = 'api.themoviedb.org';

    function toArr(v) {
        if (Array.isArray(v)) return v;
        if (v == null) return [];
        if (typeof v === 'string') return [v];
        try { return [].concat(v); } catch (e) { return []; }
    }

    function fixTmdbUrl(url) {
        if (typeof url !== 'string') return url;
        if (url.indexOf(tmdbProxyHost) !== -1) url = url.replace(tmdbProxyHost, tmdbDirectHost);
        if (url.indexOf('themoviedb.org') !== -1 && url.indexOf('/tv/') !== -1 && url.indexOf('/season/0') !== -1) {
            url = url.replace(/\/season\/0\b/, '/season/1');
        }
        return url;
    }

    var seen = null;
    function deepProxy(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            if (seen && seen.has(obj)) return obj;
            if (!seen) seen = new WeakSet();
            seen.add(obj);
            var out = [];
            for (var i = 0; i < obj.length; i++) out.push(deepProxy(obj[i]));
            return out;
        }
        if (seen && seen.has(obj)) return obj;
        if (!seen) seen = new WeakSet();
        seen.add(obj);
        return new Proxy(obj, {
            get: function (target, key) {
                var v = target[key];
                if (key === 'countries' || key === 'production_countries') {
                    return toArr(v);
                }
                if (v !== null && typeof v === 'object') return deepProxy(v);
                return v;
            }
        });
    }

    function wrapResponse(data) {
        if (!data || typeof data !== 'object') return data;
        seen = new WeakSet();
        try {
            return deepProxy(data);
        } catch (e) {
            return data;
        }
    }

    (function patchTmdbUrl() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[1] === 'string') args[1] = fixTmdbUrl(args[1]);
            return origOpen.apply(this, args);
        };
        if (typeof fetch !== 'undefined') {
            var origFetch = window.fetch;
            window.fetch = function (url, opts) {
                if (typeof url === 'string') url = fixTmdbUrl(url);
                return origFetch.call(this, url, opts);
            };
        }
    })();
    LOG('init', 'скрипт загружен (XHR/fetch → ' + tmdbDirectHost + ')');

    function start() {
        if (window.anti_dmca_plugin) {
            LOG('start', 'уже инициализирован');
            return;
        }
        if (typeof Lampa === 'undefined' || !window.lampa_settings) {
            LOG('start', 'ОШИБКА: Lampa не готова');
            return;
        }

        window.anti_dmca_plugin = true;

        if (typeof Lampa.Listener.send === 'function') {
            var origSend = Lampa.Listener.send.bind(Lampa.Listener);
            Lampa.Listener.send = function (type, data) {
                if (type === 'request_secuses' && data && typeof data === 'object' && !Array.isArray(data) && data.blocked) {
                    delete data.blocked;
                }
                return origSend(type, data);
            };
            LOG('start', 'перехват send: blocked убирается');
        }

        var keepDcmaEmpty = function () {
            Lampa.Utils.dcma = function () { return undefined };
            if (window.lampa_settings.dcma) window.lampa_settings.dcma.length = 0;
        };
        try {
            Object.defineProperty(window.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) {
            window.lampa_settings.dcma = [];
        }
        keepDcmaEmpty();
        setInterval(keepDcmaEmpty, 400);

        if (window.jQuery && window.jQuery.ajax) {
            var origAjax = window.jQuery.ajax;
            window.jQuery.ajax = function (urlOrSettings, options) {
                var s = typeof urlOrSettings === 'object' && urlOrSettings !== null
                    ? Object.assign({}, urlOrSettings)
                    : (options ? Object.assign({ url: urlOrSettings }, options) : { url: urlOrSettings });
                if (s.url && typeof s.url === 'string') {
                    if (s.url.indexOf('/undefined/') !== -1 && Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function') {
                        try {
                            var active = Lampa.Activity.active();
                            var id = active && (active.id || active.movie_id || active.tv_id || (active.item && (active.item.id || active.item.movie_id || active.item.tv_id)));
                            if (id != null && String(id).match(/^\d+$/)) {
                                s.url = s.url.replace(/\/undefined\//g, '/' + id + '/');
                            }
                        } catch (e) {}
                    }
                    s.url = fixTmdbUrl(s.url);
                }
                if (typeof s.success === 'function') {
                    var origSuccess = s.success;
                    s.success = function (data, textStatus, jqXHR) {
                        if (data && typeof data === 'object') {
                            if (!Array.isArray(data) && data.blocked) delete data.blocked;
                            data = wrapResponse(data);
                        }
                        return origSuccess.call(this, data, textStatus, jqXHR);
                    };
                }
                return origAjax.call(this, s);
            };
            LOG('start', 'jQuery.ajax перехвачен (TMDB + Proxy для countries)');
        }

        if (window.jQuery && window.jQuery.ajaxPrefilter) {
            window.jQuery.ajaxPrefilter(function (opts) {
                var orig = opts.dataFilter;
                opts.dataFilter = function (data, type) {
                    if (orig) data = orig.apply(this, arguments);
                    if (data && typeof data === 'object') {
                        if (!Array.isArray(data) && data.blocked) delete data.blocked;
                        data = wrapResponse(data);
                    }
                    return data;
                };
            });
        }

        LOG('start', 'готово');
    }

    if (window.appready) {
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
