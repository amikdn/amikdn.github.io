(function () {
    'use strict';
    Lampa.Platform.tv();

    // Определение прокси TMDB
    var tmdb_proxy = {
        name: 'TMDB Proxy with Fixes',
        version: '1.0.3',
        description: 'Проксирование постеров и API сайта TMDB с дополнительными исправлениями',
        path_image: 'tmdbimage.abmsx.tech/',
        path_api: 'apitmdb.' + (Lampa.Manifest && Lampa.Manifest.cub_domain ? Lampa.Manifest.cub_domain : 'cub.red') + '/3/'
    };

    // Переопределение URL изображения TMDB
    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? Lampa.Utils.protocol() + tmdb_proxy.path_image + url : base;
    };

    // Переопределение URL API TMDB
    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? '//tmdb.abmsx.tech/3/' + url : base;
    };

    // Удаление элемента настроек прокси в настройках TMDB
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });

    // Инициализация для обработки заблокированных запросов и модификаций настроек
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

    // Запуск init, если приложение готово, иначе прослушивание события ready
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
