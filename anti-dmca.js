(function () {
    'use strict';

    var LOG = function (step, msg, data) {
        var args = ['[anti-dmca] ' + step + ': ' + msg];
        if (data !== undefined) args.push(data);
        console.log.apply(console, args);
    };

    var tmdbProxyHost = 'apitmdb.cub.rip';
    var tmdbDirectHost = 'api.themoviedb.org';
    function fixTmdbUrl(url) {
        if (typeof url !== 'string') return url;
        if (url.indexOf(tmdbProxyHost) !== -1) url = url.replace(tmdbProxyHost, tmdbDirectHost);
        if (url.indexOf('themoviedb.org') !== -1 && url.indexOf('/tv/') !== -1 && url.indexOf('/season/0') !== -1) {
            url = url.replace(/\/season\/0\b/, '/season/1');
        }
        return url;
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
            LOG('start', 'уже инициализирован, выход');
            return;
        }

        if (typeof Lampa === 'undefined') {
            LOG('start', 'ОШИБКА: Lampa не найдена');
            return;
        }

        if (!window.lampa_settings) {
            LOG('start', 'ОШИБКА: window.lampa_settings нет');
            return;
        }

        LOG('start', 'проверка API Lampa', {
            Utils: !!Lampa.Utils,
            Listener: !!Lampa.Listener,
            Storage: !!Lampa.Storage,
            Activity: !!Lampa.Activity,
            Controller: !!Lampa.Controller
        });

        window.anti_dmca_plugin = true;

        if (typeof Lampa.Listener.send === 'function') {
            var origSend = Lampa.Listener.send.bind(Lampa.Listener);
            Lampa.Listener.send = function (type, data) {
                if (type === 'request_secuses' && data && typeof data === 'object' && !Array.isArray(data) && data.blocked) {
                    delete data.blocked;
                }
                return origSend(type, data);
            };
            LOG('start', 'перехват send: флаг blocked убирается из ответов');
        }

        var defaultSource = Lampa.Storage.get('source', 'cub');
        var keepDcmaEmpty = function () {
            Lampa.Utils.dcma = function () { return undefined };
            if (window.lampa_settings && window.lampa_settings.dcma) window.lampa_settings.dcma.length = 0;
        };
        try {
            Object.defineProperty(window.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
            LOG('start', 'lampa_settings.dcma всегда пустой (перехват)');
        } catch (e) {
            window.lampa_settings.dcma = [];
            LOG('start', 'lampa_settings.dcma очищен');
        }
        keepDcmaEmpty();
        LOG('start', 'инициализация ок, источник по умолчанию:', defaultSource);

        setInterval(keepDcmaEmpty, 400);

        if (window.jQuery && window.jQuery.ajax) {
            var origAjax = window.jQuery.ajax;
            window.jQuery.ajax = function (urlOrSettings, options) {
                var s = typeof urlOrSettings === 'object' && urlOrSettings !== null
                    ? Object.assign({}, urlOrSettings)
                    : (options ? Object.assign({ url: urlOrSettings }, options) : { url: urlOrSettings });
                if (s.url && typeof s.url === 'string') {
                    if (s.url.indexOf('/undefined/') !== -1 && typeof Lampa !== 'undefined' && Lampa.Activity && typeof Lampa.Activity.active === 'function') {
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
                        if (data && typeof data === 'object' && !Array.isArray(data) && data.blocked) {
                            delete data.blocked;
                        }
                        return origSuccess.apply(this, arguments);
                    };
                }
                return origAjax.call(this, s);
            };
            LOG('start', 'jQuery.ajax перехвачен (TMDB URL + убираем blocked из success)');
        }
        if (window.jQuery && window.jQuery.ajaxPrefilter) {
            window.jQuery.ajaxPrefilter(function (opts) {
                var orig = opts.dataFilter;
                opts.dataFilter = function (data, type) {
                    if (orig) data = orig.apply(this, arguments);
                    if (data && typeof data === 'object' && !Array.isArray(data) && data.blocked) delete data.blocked;
                    return data;
                };
            });
            LOG('start', 'jQuery ajaxPrefilter: blocked убирается из всех JSON-ответов');
        }

        LOG('start', 'готово (перехват blocked + пустой dcma + TMDB напрямую)');
    }

    if (typeof Lampa === 'undefined') {
        LOG('init', 'Lampa ещё нет, ждём app ready');
    }

    if (window.appready) {
        LOG('init', 'appready=true, вызываем start()');
        start();
    } else {
        LOG('init', 'ждём событие app ready');
        if (typeof Lampa !== 'undefined' && Lampa.Listener) {
            Lampa.Listener.follow('app', function (event) {
                LOG('app', 'событие app', event.type);
                if (event.type === 'ready') {
                    start();
                }
            });
        } else {
            LOG('init', 'ОШИБКА: нельзя подписаться на app — Lampa.Listener нет');
        }
    }
})();
