(function () {
    'use strict';
    Lampa.Platform.tv();

    (function () {
        'use strict';

        function init() {
            // Подписка на событие для обработки заблокированных запросов
            Lampa.Listener.follow('request_secuses', function (event) {
                if (event.data.blocked) {
                    var activeActivity = Lampa.Activity.active();
                    activeActivity.source = 'tmdb';
                    Lampa.Storage.set('source', 'tmdb', true);
                    Lampa.Activity.replace(activeActivity);
                    Lampa.Storage.set('source', 'cub', true);

                }
            });

            // Интервал для проверки и модификации настроек
            var interval = setInterval(function () {
                if (typeof window.lampa_settings !== 'undefined' && (window.lampa_settings.fixdcma || window.lampa_settings.dcma)) {
                    clearInterval(interval);
                    if (window.lampa_settings.dcma) {
                        window.lampa_settings.dcma = false;
                    }
                }
            }, 100);
        }

        // Запуск init, если приложение готово, иначе прослушивание события 'app' для события ready
        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready') {
                    init();
                }
            });
        }
    })();
})();
