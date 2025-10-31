(function () {
    'use strict';
    Lampa.Platform.tv();

    var plugin = {
        name: 'TMDB My Proxy',
        version: '1.0.1',
        description: 'Проксирование постеров и API сайта TMDB',
        path_image: Lampa.Utils.protocol() + 'tmdbimg.bylampa.online/',
        path_api: Lampa.Utils.protocol() + 'tmdbapi.bylampa.online/3/'
    };

    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? plugin.path_image + url : base;
    };

    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? plugin.path_api + url : base;
    };

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });
})();
