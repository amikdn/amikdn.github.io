(function () {
    'use strict';

    var LOG = function (step, msg, data) {
        var args = ['[anti-dmca] ' + step + ': ' + msg];
        if (data !== undefined) args.push(data);
        console.log.apply(console, args);
    };

    LOG('init', 'скрипт загружен');

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

        var tmdbProxyHost = 'apitmdb.cub.rip';
        var tmdbDirectHost = 'api.themoviedb.org';
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[1] === 'string' && args[1].indexOf(tmdbProxyHost) !== -1) {
                args[1] = args[1].replace(tmdbProxyHost, tmdbDirectHost);
            }
            return origOpen.apply(this, args);
        };
        if (typeof fetch !== 'undefined') {
            var origFetch = window.fetch;
            window.fetch = function (url, opts) {
                if (typeof url === 'string' && url.indexOf(tmdbProxyHost) !== -1) {
                    url = url.replace(tmdbProxyHost, tmdbDirectHost);
                }
                return origFetch.call(this, url, opts);
            };
        }
        LOG('start', 'запросы к ' + tmdbProxyHost + ' перенаправлены на ' + tmdbDirectHost);

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
