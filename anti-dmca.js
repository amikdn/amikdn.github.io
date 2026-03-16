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
        window.lampa_settings.dcma = [];
        LOG('start', 'lampa_settings.dcma очищен');

        Lampa.Utils.dcma = function () { return undefined };
        var defaultSource = Lampa.Storage.get('source', 'cub');
        LOG('start', 'инициализация ок, defaultSource =', defaultSource);

        Lampa.Listener.follow('request_secuses', function (event) {
            var data = event.data;
            var isObject = data && typeof data === 'object' && !Array.isArray(data);
            if (typeof data === 'string') {
                LOG('event', 'request_secuses: data = строка (это загрузка плагина, не блокировка)');
                return;
            }
            if (isObject) {
                LOG('event', 'request_secuses: data = объект', Object.keys(data));
                if (data.blocked) {
                    LOG('bypass', 'обнаружена блокировка, запуск обхода');
                    window.lampa_settings.dcma = [];
                    try {
                        var active = Lampa.Activity.active();
                        active.source = 'tmdb';
                        Lampa.Storage.set('source', 'tmdb', true);
                        setTimeout(function () {
                            try { Lampa.Controller.toggle('content'); } catch (e) { LOG('bypass', 'ОШИБКА toggle:', e); }
                            setTimeout(function () {
                                try {
                                    Lampa.Activity.replace(active);
                                    Lampa.Storage.set('source', defaultSource, true);
                                    LOG('bypass', 'обход выполнен');
                                } catch (e) { LOG('bypass', 'ОШИБКА replace:', e); }
                            }, 300);
                        }, 250);
                    } catch (e) { LOG('bypass', 'ОШИБКА:', e); }
                }
            }
        });

        var knownEvents = ['request_success', 'request_failed', 'content_blocked', 'dmca_blocked', 'blocked', 'error', 'content_error'];
        knownEvents.forEach(function (name) {
            try {
                Lampa.Listener.follow(name, function (event) {
                    LOG('event', 'другое событие: ' + name, event.data !== undefined ? (typeof event.data === 'object' ? Object.keys(event.data || {}) : event.data) : 'нет data');
                });
            } catch (e) {}
        });

        setInterval(function () {
            if (window.lampa_settings && window.lampa_settings.dcma && window.lampa_settings.dcma.length > 0) {
                window.lampa_settings.dcma = [];
                LOG('interval', 'dcma снова заполнен — очищен (запасной обход)');
            }
        }, 2000);

        if (typeof Lampa.Listener.send === 'function') {
            var origSend = Lampa.Listener.send;
            Lampa.Listener.send = function (type, data) {
                if (typeof data === 'object' && data && (data.blocked || type.indexOf('block') !== -1 || type.indexOf('dmca') !== -1)) {
                    LOG('event', 'Listener.send: ' + type, data);
                }
                return origSend.apply(this, arguments);
            };
            LOG('start', 'перехват Listener.send включён (логируем только block/dmca)');
        }

        LOG('start', 'подписка на request_secuses + запасная очистка dcma каждые 2 сек');
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
