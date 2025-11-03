(function () {
    'use strict';
    Lampa.Platform.tv();

    // Plugin definition for TMDB proxy
    var plugin = {
        name: 'TMDB My Proxy with Fixes',
        version: '1.0.1',
        description: 'Проксирование постеров и API сайта TMDB с дополнительными исправлениями',
        path_image: Lampa.Utils.protocol() + 'tmdbimg.bylampa.online/',
        path_api: Lampa.Utils.protocol() + 'tmdbapi.bylampa.online/3/'
    };

    // Override TMDB image URL
    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? plugin.path_image + url : base;
    };

    // Override TMDB API URL
    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? plugin.path_api + url : base;
    };

    // Remove proxy settings element in TMDB settings
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });

    // Initialization for handling blocked requests and settings modifications
    function init() {
        // Subscribe to event for handling blocked requests
        Lampa.Listener.follow('request_secuses', function (event) {
            if (event.data.blocked) {
                var activeActivity = Lampa.Activity.active();
                activeActivity.source = 'tmdb';
                Lampa.Storage.set('source', 'tmdb', true);
                Lampa.Activity.replace(activeActivity);
                Lampa.Storage.set('source', 'cub', true);
            }
        });

        // Interval for checking and modifying settings
        var interval = setInterval(function () {
            if (typeof window.lampa_settings !== 'undefined' && (window.lampa_settings.fixdcma || window.lampa_settings.dcma)) {
                clearInterval(interval);
                if (window.lampa_settings.dcma) {
                    window.lampa_settings.dcma = false;
                }
            }
        }, 100);
    }

    // Run init if app is ready, otherwise listen for ready event
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
