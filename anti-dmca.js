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
            LOG('event', 'request_secuses вызван', {
                hasData: !!event.data,
                blocked: event.data ? event.data.blocked : 'нет event.data',
                fullEvent: event
            });

            if (event.data && event.data.blocked) {
                LOG('bypass', 'обнаружена блокировка, запуск обхода');

                window.lampa_settings.dcma = [];
                LOG('bypass', 'dcma снова очищен');

                try {
                    var active = Lampa.Activity.active();
                    LOG('bypass', 'Activity.active()', active);

                    active.source = 'tmdb';
                    Lampa.Storage.set('source', 'tmdb', true);
                    LOG('bypass', 'источник переключён на tmdb');

                    setTimeout(function () {
                        try {
                            Lampa.Controller.toggle('content');
                            LOG('bypass', 'Controller.toggle("content") выполнен');
                        } catch (e) {
                            LOG('bypass', 'ОШИБКА в toggle:', e);
                        }
                        setTimeout(function () {
                            try {
                                Lampa.Activity.replace(active);
                                Lampa.Storage.set('source', defaultSource, true);
                                LOG('bypass', 'Activity.replace и возврат источника выполнены');
                            } catch (e) {
                                LOG('bypass', 'ОШИБКА в replace:', e);
                            }
                        }, 300);
                    }, 250);
                } catch (e) {
                    LOG('bypass', 'ОШИБКА в обходе:', e);
                }
            } else {
                LOG('event', 'блокировка не сработала (нет event.data.blocked)');
            }
        });

        LOG('start', 'подписка на request_secuses установлена');
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
