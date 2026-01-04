(function () {
    'use strict';
    Lampa.Platform.tv();
    (function () {
        function initPlugin() {
            if (window.plugin_rus_movie_ready) return;
            window.plugin_rus_movie_ready = true;

            var currentDate = new Date().toISOString().substr(0, 10);

            var collections = [
                { title: 'Русские фильмы', img: 'https://amikdn.github.io/img/rus_movie.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + currentDate },
                { title: 'Русские сериалы', img: 'https://amikdn.github.io/img/rus_tv.jpg', request: 'discover/tv?sort_by=first_air_date.desc&with_original_language=ru&first_air_date.lte=' + currentDate },
                { title: 'Русские мультфильмы', img: 'https://amikdn.github.io/img/rus_mult.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + currentDate },
                { title: 'Start', img: 'https://amikdn.github.io/img/start.jpg', request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'Premier', img: 'https://amikdn.github.io/img/premier.jpg', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'KION', img: 'https://amikdn.github.io/img/kion.jpg', request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'ИВИ', img: 'https://amikdn.github.io/img/ivi.jpg', request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'Okko', img: 'https://amikdn.github.io/img/okko.jpg', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'КиноПоиск', img: 'https://amikdn.github.io/img/kinopoisk.jpg', request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'Wink', img: 'https://amikdn.github.io/img/wink.jpg', request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'СТС', img: 'https://amikdn.github.io/img/sts.jpg', request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate },
                { title: 'ТНТ', img: 'https://amikdn.github.io/img/tnt.jpg', request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate }
            ];

            function addMenuItem() {
                if ($('.menu__item[data-action="rus_movie"]').length > 0) return;

                var menuIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';

                var $menuItem = $(
                    '<li class="menu__item selector" data-action="rus_movie">' +
                    '<div class="menu__ico">' + menuIcon + '</div>' +
                    '<div class="menu__text">Русское</div>' +
                    '</li>'
                );

                $menuItem.on('hover:enter', function () {
                    var items = collections.map(function (item) {
                        var html = '<div class="settings-folder" style="padding:0!important">' +
                            '<div style="width:100%;height:10em;overflow:hidden;border-radius:0.6em;margin-bottom:0.5em">' +
                            '<img src="' + item.img + '" style="width:100%;height:100%;object-fit:cover"/>' +
                            '</div>' +
                            '<div style="font-size:1.3em;text-align:center">' + item.title + '</div>' +
                            '</div>';
                        return { title: html, data: item };
                    });

                    Lampa.Select.show({
                        title: 'Русское',
                        items: items,
                        onSelect: function (a) {
                            Lampa.Activity.push({
                                url: a.data.request,
                                title: a.data.title,
                                component: 'category_full',
                                source: 'tmdb',
                                card_type: 'true',
                                page: 1
                            });
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('menu');
                        }
                    });
                });

                var menuLists = $('.menu .menu__list');
                if (menuLists.length > 0) {
                    menuLists.each(function () {
                        $(this).append($menuItem.clone(true));
                    });
                }
            }

            function tryAddMenu() {
                if (typeof $ !== 'undefined' && $('.menu .menu__list').length > 0) {
                    addMenuItem();
                } else {
                    setTimeout(tryAddMenu, 200);
                }
            }

            tryAddMenu();
        }

        if (window.appready) {
            initPlugin();
        } else {
            var listener = Lampa.Listener || (Lampa.Events && Lampa.Events.on);
            if (listener && typeof listener.follow === 'function') {
                listener.follow('app', function (e) {
                    if (e.type === 'ready') initPlugin();
                });
            } else if (listener && typeof listener.on === 'function') {
                listener.on('ready', initPlugin);
            } else {
                setTimeout(initPlugin, 500);
            }
        }
    })();
})();
