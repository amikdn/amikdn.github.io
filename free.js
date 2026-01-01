(function () {
    'use strict';
    Lampa.Platform.tv();
    var plugin = {
        name: 'TMDB Proxy with Anti-DMCA',
        version: '1.0.3',
        description: 'Проксирование постеров и API сайта TMDB с отключением DMCA-фич и обходом блокировок'
    };
    plugin.path_image = Lampa.Utils.protocol() + 'tmdbimg.bylampa.online/';
    plugin.path_api = Lampa.Utils.protocol() + 'tmdbapi.bylampa.online/3/';

    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? plugin.path_image + url : base;
    };

    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? plugin.path_api + url : base;
    };

    window.lampa_settings = window.lampa_settings || {};
    window.lampa_settings.dcma = false;
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
                window.lampa_settings.dcma = [];
                var active = Lampa.Activity.active();
                active.source = 'tmdb';
                Lampa.Storage.set('source', 'tmdb', true);
                Lampa.Activity.replace(active);
                Lampa.Storage.set('source', defaultSource, true);
            }
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
