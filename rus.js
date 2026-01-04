;(function () {
    'use strict';

    Lampa.Platform.tv();

    // Полный плагин: пункт "Русское" в меню + отдельный компонент с большими иконками + расширение главной страницы
    (function () {
        function initPlugin() {
            if (window.plugin_rus_movie_ready) return;
            window.plugin_rus_movie_ready = true;

            var currentDate = new Date().toISOString().substr(0, 10);

            var collections = [
                { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + currentDate },
                { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', request: 'discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=' + currentDate },
                { title: 'Русские мультфильмы', img: 'https://bylampa.github.io/img/rus_mult.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + currentDate },
                { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg', request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg', request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'ИВИ', img: 'https://bylampa.github.io/img/ivi.jpg', request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'КиноПоиск', img: 'https://bylampa.github.io/img/kinopoisk.jpg', request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg', request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg', request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
                { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg', request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate }
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
                    data.title = params.title;
                    onSuccess(data);
                }, onError || function () { onSuccess({ results: [] }); });
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

            Lampa.Storage.listener.follow('change', function (e) {
                if (e.name === 'activity') {
                    if (Lampa.Activity.active().component !== 'rus_movie') {
                        setTimeout(function () { $('.background').show(); }, 2000);
                    } else {
                        $('.background').hide();
                    }
                }
            });

            // Добавление пункта в меню с усиленной проверкой
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

                var menuList = $('.menu .menu__list');
                if (menuList.length > 0) {
                    menuList.eq(0).append($menuItem);
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

            // Кастомная карточка сериалов
            function CustomSeriesCard(card) {
                var next = card.next_episode_to_air || {};

                if (card.source === undefined) card.source = 'tmdb';

                Lampa.Arrays.extend(card, {
                    title: card.name,
                    original_title: card.original_name,
                    release_date: card.first_air_date
                });

                card.release_year = (card.first_air_date || '0000').substr(0, 4);

                function hide(el) {
                    if (el) el.remove();
                }

                this.build = function () {
                    this.card = Lampa.Template.js('card_episode');
                    this.img_poster = this.card.querySelector('.card__img') || {};
                    this.img_episode = this.card.querySelector('.full-episode__img img') || {};

                    this.card.querySelector('.card__title').innerText = card.title;
                    this.card.querySelector('.full-episode__num').innerText = card.unwatched || '';

                    if (next && next.air_date) {
                        this.card.querySelector('.full-episode__name').innerText = next.name || Lampa.Lang.translate('noname');
                        this.card.querySelector('.full-episode__num').innerText = next.episode_number || '';
                        this.card.querySelector('.full-episode__date').innerText = next.air_date ? Lampa.Utils.parseTime(next.air_date).full : '----';
                    }

                    if (card.release_year === '0000') hide(this.card.querySelector('.card__age'));
                    else this.card.querySelector('.card__age').innerText = card.release_year;

                    this.card.addEventListener('visible', this.visible.bind(this));
                };

                this.image = function () {
                    this.img_poster.onload = function () {};
                    this.img_poster.onerror = function () { this.img_poster.src = './img/img_broken.svg'; };
                    this.img_episode.onload = function () {
                        this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
                    }.bind(this);
                    this.img_episode.onerror = function () { this.img_episode.src = './img/img_broken.svg'; };
                };

                this.create = function () {
                    this.build();
                    this.card.addEventListener('hover:focus', () => { if (this.onFocus) this.onFocus(this.card, card); });
                    this.card.addEventListener('hover:hover', () => { if (this.onHover) this.onHover(this.card, card); });
                    this.card.addEventListener('hover:enter', () => { if (this.onEnter) this.onEnter(this.card, card); });
                    this.image();
                };

                this.visible = function () {
                    if (card.poster_path) this.img_poster.src = Lampa.Api.img(card.poster_path);
                    else if (card.profile_path) this.img_poster.src = Lampa.Api.img(card.profile_path);
                    else if (card.poster) this.img_poster.src = card.poster;
                    else if (card.img) this.img_poster.src = card.img;
                    else this.img_poster.src = './img/img_broken.svg';

                    if (next.still_path) this.img_episode.src = Lampa.Api.img(next.still_path, 'w300');
                    else if (card.backdrop_path) this.img_episode.src = Lampa.Api.img(card.backdrop_path, 'w300');
                    else if (next.img) this.img_episode.src = next.img;
                    else if (card.img) this.img_episode.src = card.img;
                    else this.img_episode.src = './img/img_broken.svg';

                    if (this.onVisible) this.onVisible(this.card, card);
                };

                this.destroy = function () {
                    this.img_poster.onerror = function () {};
                    this.img_poster.onload = function () {};
                    this.img_episode.onerror = function () {};
                    this.img_episode.onload = function () {};
                    this.img_poster.src = '';
                    this.img_episode.src = '';
                    hide(this.card);
                    this.card = null;
                    this.img_poster = null;
                    this.img_episode = null;
                };

                this.render = function (rendered) {
                    return rendered ? this.card : $(this.card);
                };
            }

            // Расширение главной страницы tmdb
            function extendTmdbMain() {
                if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) return;

                var originalMain = Lampa.Api.sources.tmdb.main.bind(Lampa.Api.sources.tmdb);

                Lampa.Api.sources.tmdb.main = function (params, onSuccess, onError) {
                    originalMain(params, function (originalLines) {
                        var currentDate = new Date().toISOString().substr(0, 10);

                        var yearGroups = [
                            { start: 2023, end: 2025 },
                            { start: 2020, end: 2022 },
                            { start: 2017, end: 2019 },
                            { start: 2014, end: 2016 },
                            { start: 2011, end: 2013 }
                        ];
                        var randomGroup1 = yearGroups[Math.floor(Math.random() * yearGroups.length)];
                        var randomGroup2 = yearGroups[Math.floor(Math.random() * yearGroups.length)];

                        var sortOptions1 = ['vote_count.desc', 'vote_average.desc', 'popularity.desc', 'revenue.desc'];
                        var sortOptions2 = ['vote_count.desc', 'popularity.desc', 'revenue.desc'];

                        var randomSort1 = sortOptions1[Math.floor(Math.random() * sortOptions1.length)];
                        var randomSort2 = sortOptions2[Math.floor(Math.random() * sortOptions2.length)];

                        var network = new Lampa.Reguest();

                        var addedLines = [
                            function (success) {
                                network.get('movie/now_playing', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_now_watch') || 'Сейчас в кино';
                                    data.collection = true;
                                    data.line_type = 'collection';
                                    success(data);
                                }, function () { success({ results: [], title: 'Сейчас в кино' }); });
                            },
                            function (success) {
                                var lately = (Lampa.TimeTable.lately && Lampa.TimeTable.lately() || []).slice(0, 20);
                                success({
                                    source: 'tmdb',
                                    results: lately,
                                    title: Lampa.Lang.translate('title_upcoming_episodes') || 'Скоро новые серии',
                                    nomore: true,
                                    cardClass: function (card) { return new CustomSeriesCard(card); }
                                });
                            },
                            function (success) {
                                network.get('trending/all/day', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_trend_day') || 'Тренды дня';
                                    success(data);
                                }, function () { success({ results: [], title: 'Тренды дня' }); });
                            },
                            function (success) {
                                network.get('trending/all/week', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_trend_week') || 'Тренды недели';
                                    success(data);
                                }, function () { success({ results: [], title: 'Тренды недели' }); });
                            },
                            function (success) {
                                network.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Русские фильмы';
                                    data.small = true;
                                    data.wide = true;
                                    data.results.forEach(function (item) {
                                        item.promo = item.overview || '';
                                        item.promo_title = item.title || item.name || '';
                                    });
                                    success(data);
                                }, function () { success({ results: [], title: 'Русские фильмы' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Русские сериалы';
                                    success(data);
                                }, function () { success({ results: [], title: 'Русские сериалы' }); });
                            },
                            function (success) {
                                network.get('movie/upcoming', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_upcoming') || 'Скоро в кино';
                                    success(data);
                                }, function () { success({ results: [], title: 'Скоро в кино' }); });
                            },
                            function (success) {
                                network.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Русские мультфильмы';
                                    data.collection = true;
                                    data.line_type = 'collection';
                                    success(data);
                                }, function () { success({ results: [], title: 'Русские мультфильмы' }); });
                            },
                            function (success) {
                                network.get('movie/popular', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_popular_movie') || 'Популярные фильмы';
                                    success(data);
                                }, function () { success({ results: [], title: 'Популярные фильмы' }); });
                            },
                            function (success) {
                                network.get('trending/tv/week', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_popular_tv') || 'Популярные сериалы';
                                    success(data);
                                }, function () { success({ results: [], title: 'Популярные сериалы' }); });
                            },
                            function (success) {
                                network.get('discover/movie?primary_release_date.gte=' + randomGroup2.start + '-01-01&primary_release_date.lte=' + randomGroup2.end + '-12-31&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomSort2, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Подборки русских фильмов';
                                    data.line_type = 'top';
                                    success(data);
                                }, function () { success({ results: [], title: 'Подборки русских фильмов' }); });
                            },
                            function (success) {
                                network.get('discover/tv?first_air_date.gte=' + randomGroup1.start + '-01-01&first_air_date.lte=' + randomGroup1.end + '-12-31&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + randomSort1, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Подборки русских сериалов';
                                    data.line_type = 'top';
                                    success(data);
                                }, function () { success({ results: [], title: 'Подборки русских сериалов' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Start';
                                    data.small = true;
                                    data.wide = true;
                                    data.results.forEach(function (item) {
                                        item.promo = item.overview || '';
                                        item.promo_title = item.title || item.name || '';
                                    });
                                    success(data);
                                }, function () { success({ results: [], title: 'Start' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Premier';
                                    success(data);
                                }, function () { success({ results: [], title: 'Premier' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'KION';
                                    success(data);
                                }, function () { success({ results: [], title: 'KION' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'ИВИ';
                                    data.collection = true;
                                    data.line_type = 'collection';
                                    success(data);
                                }, function () { success({ results: [], title: 'ИВИ' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'OKKO';
                                    success(data);
                                }, function () { success({ results: [], title: 'OKKO' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'КиноПоиск';
                                    success(data);
                                }, function () { success({ results: [], title: 'КиноПоиск' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'Wink';
                                    data.small = true;
                                    data.wide = true;
                                    data.results.forEach(function (item) {
                                        item.promo = item.overview || '';
                                        item.promo_title = item.title || item.name || '';
                                    });
                                    success(data);
                                }, function () { success({ results: [], title: 'Wink' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'СТС';
                                    success(data);
                                }, function () { success({ results: [], title: 'СТС' }); });
                            },
                            function (success) {
                                network.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function (data) {
                                    data = data || { results: [] };
                                    data.title = 'ТНТ';
                                    success(data);
                                }, function () { success({ results: [], title: 'ТНТ' }); });
                            },
                            function (success) {
                                network.get('movie/top_rated', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_top_movie') || 'Топ фильмы';
                                    data.line_type = 'top';
                                    success(data);
                                }, function () { success({ results: [], title: 'Топ фильмы' }); });
                            },
                            function (success) {
                                network.get('tv/top_rated', params, function (data) {
                                    data = data || { results: [] };
                                    data.title = Lampa.Lang.translate('title_top_tv') || 'Топ сериалы';
                                    data.line_type = 'top';
                                    success(data);
                                }, function () { success({ results: [], title: 'Топ сериалы' }); });
                            }
                        ];

                        try {
                            Lampa.Arrays.insert(addedLines, 0, Lampa.Api.partPersons(addedLines, 6, 'movie', addedLines.length + 1));
                        } catch (e) {}

                        if (params.genres && params.genres.movie) {
                            params.genres.movie.forEach(function (genre) {
                                addedLines.push(function (success) {
                                    network.get('discover/movie?with_genres=' + genre.id, params, function (data) {
                                        data = data || { results: [] };
                                        data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                                        success(data);
                                    }, function () { success({ results: [] }); });
                                });
                            });
                        }

                        var allLines = addedLines.concat(originalLines || []);

                        onSuccess(allLines);
                    }, onError || function () {});
                };
            }

            // Настройка
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'rus_movie_main', type: 'trigger', default: true },
                field: { name: 'Русские новинки на главной', description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)' },
                onRender: function (el) {
                    setTimeout(function () {
                        var sizeEl = $('div[data-name="interface_size"]');
                        if (sizeEl.length) sizeEl.after(el);
                    }, 0);
                }
            });

            // Автообновление главной при смене на tmdb
            if (Lampa.Storage.get('source') === 'tmdb') {
                var currentSource = Lampa.Storage.get('source');
                var interval = setInterval(function () {
                    var active = Lampa.Activity.active();
                    var settingsOpen = $('div.settings__content.layer--height > div.settings__body > div').length > 0;
                    if (active && active.component === 'main' && !settingsOpen) {
                        clearInterval(interval);
                        Lampa.Activity.replace({
                            source: currentSource,
                            title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase()
                        });
                    }
                }, 200);
            }

            // Запуск расширения главной, если включено
            if (Lampa.Storage.get('rus_movie_main') !== false) {
                extendTmdbMain();
            }
        }

        // Запуск плагина
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
