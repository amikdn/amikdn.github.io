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

        var bypassCooldownMs = 3000;
        var lastBypassTime = 0;

        Lampa.Listener.follow('request_secuses', function (event) {
            var data = event.data;
            if (typeof data === 'string') return;
            var isObject = data && typeof data === 'object' && !Array.isArray(data);
            if (!isObject || !data.blocked) return;

            var now = Date.now();
            if (now - lastBypassTime < bypassCooldownMs) return;
            lastBypassTime = now;

            LOG('bypass', 'блокировка → обход (раз в ' + (bypassCooldownMs / 1000) + ' сек)');
            keepDcmaEmpty();
            try {
                Lampa.Storage.set('source', 'tmdb', true);
                setTimeout(function () {
                    try { Lampa.Controller.toggle('content'); } catch (e) {}
                    setTimeout(function () {
                        Lampa.Storage.set('source', defaultSource, true);
                        keepDcmaEmpty();
                    }, 400);
                }, 300);
            } catch (e) {}
        });

        setInterval(keepDcmaEmpty, 400);

        LOG('start', 'готово (обход при blocked, cooldown ' + bypassCooldownMs / 1000 + ' сек)');
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
