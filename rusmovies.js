;(function () {
    'use strict';

    Lampa.Platform.tv();

    // Плагин: пункт "Русское" в меню + отдельная страница с большими иконками-коллекциями (без подборок на главной)
    (function () {
        function initPlugin() {
            if (window.plugin_rus_movie_ready) return;
            window.plugin_rus_movie_ready = true;

            var currentDate = new Date().toISOString().substr(0, 10);

            var collections = [
                { title: 'Русские фильмы', img: 'https://amikdn.github.io/img/rus_movie.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + currentDate },
                { title: 'Русские сериалы', img: 'https://amikdn.github.io/img/rus_tv.jpg', request: 'discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=' + currentDate },
                { title: 'Русские мультфильмы', img: 'https://amikdn.github.io/img/rus_mult.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + currentDate },
                { title: 'Start', img: 'https://amikdn.github.io/img/start.jpg', request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'Premier', img: 'https://amikdn.github.io/img/premier.jpg', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'KION', img: 'https://amikdn.github.io/img/kion.jpg', request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'ИВИ', img: 'https://amikdn.github.io/img/ivi.jpg', request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'Okko', img: 'https://amikdn.github.io/img/okko.jpg', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'КиноПоиск', img: 'https://amikdn.github.io/img/kinopoisk.jpg', request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'Wink', img: 'https://amikdn.github.io/img/wink.jpg', request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'СТС', img: 'https://amikdn.github.io/img/sts.jpg', request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'ТНТ', img: 'https://amikdn.github.io/img/tnt.jpg', request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate }
            ];

            function collectionMain(params, onSuccess, onError) {
                var data = {
                    collection: true,
                    total_pages: 1,
                    results: collections.map(function (item) {
                        return {
                            title: item.title,
                            img: item.img,
                            hpu: item.request
                        };
                    })
                };
                onSuccess(data);
            }

            function collectionFull(params, onSuccess, onError) {
                var network = new Lampa.Reguest();
                var url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + params.url + '&page=' + (params.page || 1);
                network.native(url, function (data) {
                    data = data || { results: [] };
                    data.title = params.title || '';
                    onSuccess(data);
                }, function () {
                    onSuccess({ results: [], title: params.title || '' });
                });
            }

            var collectionApi = {
                main: collectionMain,
                full: collectionFull,
                clear: function () {}
            };

            function RusMovieCollection(params) {
                var category = new Lampa.InteractionCategory(params);

                category.create = function () {
                    collectionApi.main(params, this.build.bind(this), this.empty.bind(this));
                };

                category.nextPageReuest = function (obj, success, error) {
                    collectionApi.main(obj, success.bind(this), error.bind(this));
                };

                category.cardRender = function (card, data, render) {
                    render.onMenu = false;
                    render.onEnter = function () {
                        Lampa.Activity.push({
                            url: data.hpu,
                            title: data.title,
                            component: 'category_full',
                            source: 'tmdb',
                            page: 1
                        });
                    };
                };

                return category;
            }

            var manifest = {
                type: 'video',
                version: '1.0.0',
                name: 'Русское',
                description: 'Русские новинки',
                component: 'rus_movie'
            };

            if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
            Lampa.Manifest.plugins.rus_movie = manifest;

            Lampa.Component.add('rus_movie', RusMovieCollection);

            // Скрытие фона при открытии коллекции
            Lampa.Storage.listener.follow('change', function (e) {
                if (e.name === 'activity') {
                    var active = Lampa.Activity.active();
                    if (active && active.component === 'rus_movie') {
                        $('.background').hide();
                    } else {
                        setTimeout(function () { $('.background').show(); }, 2000);
                    }
                }
            });

            // Добавление пункта в меню (с защитой от дублирования и усиленной проверкой)
            function addMenuItem() {
                if ($('.menu__item[data-action="ru_movie"]').length > 0) return;

                var menuIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';

                var $menuItem = $(
                    '<li class="menu__item selector" data-action="ru_movie">' +
                    '<div class="menu__ico">' + menuIcon + '</div>' +
                    '<div class="menu__text">Русское</div>' +
                    '</li>'
                );

                $menuItem.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: manifest.name,
                        component: 'rus_movie',
                        page: 1
                    });
                    $('.card').css('text-align', 'center');
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
