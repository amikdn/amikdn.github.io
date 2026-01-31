(function () {
    'use strict';
    Lampa.Platform.tv();
    var plugin = {
        name: 'TMDB Proxy Only for Blocked',
        version: '1.0.4',
        description: 'Проксирование постеров и API сайта TMDB только при обнаружении блокировки (Anti-DMCA)'
    };
    
    plugin.path_image = Lampa.Utils.protocol() + 'tmdbimage.abmsx.tech/';
    plugin.path_api = Lampa.Utils.protocol() + 'tmdb.abmsx.tech/3/';

    // Переопределяем функцию загрузки изображений
    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        // Используем прокси ТОЛЬКО если активен флаг dcma (сработал Anti-DMCA)
        // Если контент не заблокирован, грузим напрямую (быстрее)
        return (window.lampa_settings && window.lampa_settings.dcma) ? plugin.path_image + url : base;
    };

    // Переопределяем функцию запросов к API
    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        // Используем прокси ТОЛЬКО если активен флаг dcma (сработал Anti-DMCA)
        return (window.lampa_settings && window.lampa_settings.dcma) ? plugin.path_api + url : base;
    };

    window.lampa_settings = window.lampa_settings || {};
    window.lampa_settings.dcma = false; // По умолчанию выключен (прямой запрос)
    window.lampa_settings.disable_features = window.lampa_settings.disable_features || {};
    window.lampa_settings.disable_features.dmca = true;

    function start() {
        if (window.anti_dmca_plugin) {
            return;
        }
        window.anti_dmca_plugin = true;
        
        Lampa.Utils.dcma = function () {
            return undefined;
        };
        
        var defaultSource = Lampa.Storage.get('source', 'cub');

        Lampa.Listener.follow('request_secuses', function (event) {
            if (event.data.blocked) {
                // Включаем режим обхода блокировки
                window.lampa_settings.dcma = []; 
                
                var active = Lampa.Activity.active();
                active.source = 'tmdb';
                Lampa.Storage.set('source', 'tmdb', true);
                Lampa.Activity.replace(active);
                Lampa.Storage.set('source', defaultSource, true);
            } 
            // Примечание: Код не сбрасывает dcma обратно в false автоматически,
            // чтобы при последующих запросах в рамках сессии прокси продолжал работать,
            // если блокировка сохраняется. При необходимости сброса можно добавить:
            // else { window.lampa_settings.dcma = false; }
        });

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'tmdb') {
                e.body.find('[data-parent="proxy"]').remove();
            }
        });
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                start();
            }
        });
    }
})();
