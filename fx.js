(function () {
    'use strict';

    var tmdb_proxy = {
        name: 'TMDB Proxy',
        version: '1.0.3',
        description: 'РџСЂРѕРєСЃРёСЂРѕРІР°РЅРёРµ РїРѕСЃС‚РµСЂРѕРІ Рё API СЃР°Р№С‚Р° TMDB',
        // path_image: 'imagetmdb.cub.red/',
        path_image: 'tmdbimage.abmsx.tech/',
        path_api: 'apitmdb.' + (Lampa.Manifest && Lampa.Manifest.cub_domain ? Lampa.Manifest.cub_domain : 'cub.red') + '/3/'
    };

    function account(url){
        var email = Lampa.Storage.get('account_email')
        if(email) url = Lampa.Utils.addUrlComponent(url,'account_email=' + encodeURIComponent(email))
        return url
    }

    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? Lampa.Utils.protocol() + tmdb_proxy.path_image + url : base;
    };

    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? '//tmdb.abmsx.tech/3/' + url : base;
    };

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });

})();
