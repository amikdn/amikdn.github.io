(function() {
    'use strict';

    Lampa.Platform.tv();

    // Функция для генерации SVG-иконки меню
    function getMenuIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';
    }

    // Текущая дата в формате YYYY-MM-DD
    const currentDate = new Date().toISOString().substr(0, 10);

    // Массив подборок русских новинок
    const russianCollections = [
        { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + currentDate },
        { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', request: 'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'Русские мультфильмы', img: 'https://bylampa.github.io/img/rus_mult.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + currentDate },
        { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg', request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg', request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'IVI', img: 'https://bylampa.github.io/img/ivi.jpg', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg', request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'КиноПоиск', img: 'https://bylampa.github.io/img/kinopoisk.jpg', request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg', request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg', request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
        { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg', request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate }
    ];

    // Функция для получения основной коллекции (список подборок)
    function getMainCollection(params, onSuccess, onError) {
        const data = {
            collection: true,
            total_pages: 1,
            results: russianCollections.slice().map(item => ({
                title: item.title,
                img: item.img,
                hpu: item.request
            }))
        };
        onSuccess(data);
    }

    // Функция для получения полной страницы (запрос к TMDB)
    function getFullPage(params, onSuccess, onError) {
        const network = new Lampa.Reguest();
        const url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + params.url + '&page=' + (params.page || 1);
        network.native(url, (response) => {
            response.title = params.title;
            onSuccess(response);
        }, onError);
    }

    // Функция для очистки сети
    function clearNetwork() {
        network.clear();
    }

    // Методы для компонента
    const collectionMethods = {
        main: getMainCollection,
        full: getFullPage,
        clear: clearNetwork
    };

    // Функция создания компонента для коллекции
    function createCollectionComponent(params) {
        const component = new Lampa.Component(params);
        component.create = function() {
            collectionMethods.main(params, this.build.bind(this), this.empty.bind(this));
        };
        component.nextPageReuest = function(params, onSuccess, onError) {
            collectionMethods.full(params, onSuccess.bind(component), onError.bind(component));
        };
        component.render = function(data, card, empty) {
            empty.visible = false;
            empty.onEnter = function() {
                Lampa.Activity.push({
                    url: card.hpu,
                    title: card.title,
                    component: 'rus_movie',
                    source: 'main',
                    page: 1
                });
            };
        };
        return component;
    }

    // Функция создания компонента для полной страницы
    function createFullPageComponent(params) {
        const component = new Lampa.Component(params);
        component.create = function() {
            collectionMethods.full(params, this.build.bind(this), this.empty.bind(this));
        };
        component.nextPageReuest = function(params, onSuccess, onError) {
            collectionMethods.full(params, onSuccess.bind(component), onError.bind(component));
        };
        return component;
    }

    // Метаданные плагина
    const pluginMeta = {
        type: 'movie',
        version: '1.0.0',
        name: 'Русское',
        description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)',
        component: 'rus_movie_main'
    };

    // Добавление плагина в манифест
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = pluginMeta;

    // Регистрация компонента
    Lampa.Component.add('rus_movie', createCollectionComponent);

    // Слушатель для активности
    Lampa.Listener.follow('activity', function(event) {
        if (event.name === 'change') {
            if (Lampa.Activity.active().component !== 'rus_movie') {
                setTimeout(() => {
                    $('div[data-name="rus_movie_main"]').remove();
                }, 2000);
            } else {
                $('div[data-name="rus_movie_main"]').hide();
            }
        }
    });

    // Добавление элемента меню
    const menuIcon = getMenuIcon();
    const menuItem = $('<li class="menu__item selector"><div class="menu__ico">' + menuIcon + '</div><div class="menu__text">' + pluginMeta.name + '</div></li>');
    menuItem.on('hover:enter', function() {
        Lampa.Activity.push({
            url: '',
            title: pluginMeta.name,
            component: 'rus_movie',
            page: 1
        });
        $('.menu .menu__list').eq(0).css('text-align', 'center');
    });
    $('.menu .menu__list').eq(0).append(menuItem);

    // Класс для рендеринга карточек
    class CardRenderer {
        constructor(item, episode = {}) {
            this.item = item || {};
            this.episode = episode || {};
            if (this.item.source === undefined) this.item.source = 'main';
            Lampa.Component.extend(this.item, {
                title: this.item.title,
                original_title: this.item.original_name,
                release_date: this.item.first_air_date
            });
            this.item.release_year = ((this.item.release_date || '0000') + '').substr(0, 4);
        }

        build() {
            this.card = Lampa.Template.js('card_episode');
            this.img_poster = this.card.querySelector('.card__img img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img img') || {};
            this.card.querySelector('.full-episode__name').innerText = this.item.title;
            this.card.querySelector('.full-episode__num').innerText = this.episode.episode_number || '';
            if (this.episode && this.episode.air_date) {
                this.card.querySelector('.full-episode__date').innerText = this.episode.name || Lampa.Lang.translate('noname');
                this.card.querySelector('.full-episode__num').innerText = this.episode.air_date ? Lampa.Utils.parseTime(this.episode.air_date).full : '----';
                this.card.querySelector('.card__img').innerText = this.episode.air_date ? Lampa.Utils.parseTime(this.episode.air_date).full : '----';
            }
            this.card.querySelector('.card__age').innerText = this.item.release_year;
            this.card.addEventListener('onVisible', this.onVisible.bind(this));
        }

        image() {
            this.img_poster.onload = function() {};
            this.img_poster.onerror = function() {
                this.src = './img/img_broken.svg';
            };
            this.img_episode.onload = function() {
                this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
            };
            this.img_episode.onerror = function() {
                this.src = './img/img_broken.svg';
            };
        }

        create() {
            this.build();
            this.card.addEventListener('hover:focus', () => {
                if (this.onFocus) this.onFocus(this.card, this.item);
            });
            this.card.addEventListener('hover:hover', () => {
                if (this.onHover) this.onHover(this.card, this.item);
            });
            this.card.addEventListener('hover:enter', () => {
                if (this.onEnter) this.onEnter(this.card, this.item);
            });
            this.image();
        }

        renderImage() {
            if (this.item.backdrop_path) {
                this.img_poster.src = Lampa.Api.img(this.item.backdrop_path);
            } else if (this.item.poster_path) {
                this.img_poster.src = Lampa.Api.img(this.item.poster_path);
            } else if (this.item.poster) {
                this.img_poster.src = this.item.poster;
            } else if (this.item.img) {
                this.img_poster.src = this.item.img;
            } else {
                this.img_poster.src = './img/img_broken.svg';
            }

            if (this.episode.still_path) {
                this.img_episode.src = Lampa.Api.img(this.episode.still_path, 'w300');
            } else if (this.item.profile_path) {
                this.img_episode.src = Lampa.Api.img(this.item.profile_path, 'w300');
            } else if (this.episode.img) {
                this.img_episode.src = this.episode.img;
            } else if (this.item.img) {
                this.img_episode.src = this.item.img;
            } else {
                this.img_episode.src = './img/img_broken.svg';
            }

            if (this.onVisible) this.onVisible(this.card, this.item);
        }

        destroy() {
            this.img_poster.onerror = function() {};
            this.img_poster.onload = function() {};
            this.img_episode.onerror = function() {};
            this.img_episode.onload = function() {};
            this.img_poster.src = '';
            this.img_episode.src = '';
            this.card.remove();
            this.card = null;
            this.img_poster = null;
            this.img_episode = null;
        }

        render(visible) {
            return visible ? this.card : $(this.card);
        }
    }

    // Класс для главной страницы (полная логика с запросами)
    function MainPageRenderer() {
        this.sources = new Lampa.Arrays();

        this.main = function() {
            const ranges1 = [{start: 2023, end: 2025}, {start: 2020, end: 2022}, {start: 2017, end: 2019}, {start: 2014, end: 2016}, {start: 2011, end: 2013}];
            const range1 = ranges1[Math.floor(Math.random() * ranges1.length)];
            const startYear1 = range1.start + '-01-01';
            const endYear1 = range1.end + '-12-31';
            const range2 = ranges1[Math.floor(Math.random() * ranges1.length)];
            const startYear2 = range2.start + '-01-01';
            const endYear2 = range2.end + '-12-31';

            const sortOptions1 = ['popularity.desc', 'vote_count.desc', 'vote_average.desc', 'revenue.desc'];
            const sortIndex1 = Math.floor(Math.random() * sortOptions1.length);
            const sortBy1 = sortOptions1[sortIndex1];

            const sortOptions2 = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
            const sortIndex2 = Math.floor(Math.random() * sortOptions2.length);
            const sortBy2 = sortOptions2[sortIndex2];

            const currentDate = new Date().toISOString().substr(0, 10);

            const self = this;
            const params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            const onSuccess = arguments.length > 1 ? arguments[1] : undefined;
            const onError = arguments.length > 2 ? arguments[2] : undefined;

            const linesCount = 6;

            const lines = [
                function(onLineSuccess) {
                    self.get('trending/all/day', params, function(data) {
                        data.title = Lampa.Lang.translate('title_trend_day');
                        data.small = true;
                        data.line_type = 'small';
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    onLineSuccess({
                        source: 'main',
                        results: Lampa.TimeTable.get().slice(0, 20),
                        title: Lampa.Lang.translate('title_lately'),
                        nomore: true,
                        cardClass: function(item, episode) {
                            return new CardRenderer(item, episode);
                        }
                    });
                },
                function(onLineSuccess) {
                    self.get('trending/all/week', params, function(data) {
                        data.title = Lampa.Lang.translate('title_trend_week');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('trending/tv/week', params, function(data) {
                        data.title = Lampa.Lang.translate('title_popular_tv');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Русские фильмы');
                        data.small = true;
                        data.wide = true;
                        data.results.forEach(function(item) {
                            item.promo = item.overview;
                            item.promo_title = item.title || item.name;
                        });
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Русские сериалы');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('movie/popular', params, function(data) {
                        data.title = Lampa.Lang.translate('title_popular_movie');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Русские мультфильмы');
                        data.small = true;
                        data.line_type = 'small';
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('movie/now_playing', params, function(data) {
                        data.title = Lampa.Lang.translate('title_now_watch');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('movie/upcoming', params, function(data) {
                        data.title = Lampa.Lang.translate('title_upcoming');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/movie?primary_release_date.gte=' + startYear2 + '&primary_release_date.lte=' + endYear2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + sortBy2, params, function(data) {
                        data.title = Lampa.Lang.translate('Подборки русских фильмов');
                        data.line_type = 'top';
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?first_air_date.gte=' + startYear1 + '&first_air_date.lte=' + endYear1 + '&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + sortBy1, params, function(data) {
                        data.title = Lampa.Lang.translate('Подборки русских сериалов');
                        data.line_type = 'wide';
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Русские новинки');
                        data.collection = true;
                        data.wide = true;
                        data.results.forEach(function(item) {
                            item.promo = item.overview;
                            item.promo_title = item.title || item.name;
                        });
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('ТНТ');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('KION');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Wink');
                        data.collection = true;
                        data.line_type = 'small';
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('OKKO');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('КиноПоиск');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Wink');
                        data.collection = true;
                        data.wide = true;
                        data.results.forEach(function(item) {
                            item.promo = item.overview;
                            item.promo_title = item.title || item.name;
                        });
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Start');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate, params, function(data) {
                        data.title = Lampa.Lang.translate('Premier');
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('movie/top_rated', params, function(data) {
                        data.title = Lampa.Lang.translate('title_top_movie');
                        data.line_type = 'wide';
                        onLineSuccess(data);
                    }, onLineSuccess);
                },
                function(onLineSuccess) {
                    self.get('tv/top_rated', params, function(data) {
                        data.title = Lampa.Lang.translate('title_top_tv');
                        data.line_type = 'wide';
                        onLineSuccess(data);
                    }, onLineSuccess);
                }
            ];

            const totalLines = lines.length + 1;
            Lampa.Component.add(lines, 0, Lampa.Api.show(lines, linesCount, 'movie', totalLines));

            params.genres.forEach(function(genre) {
                const genreFunction = function(onGenreSuccess) {
                    self.get('discover/movie?with_genres=' + genre.id, params, function(data) {
                        data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                        onGenreSuccess(data);
                    }, onGenreSuccess);
                };
                lines.push(genreFunction);
            });

            function processLines(onProcessSuccess, onProcessError) {
                Lampa.Api.show(lines, linesCount, onProcessSuccess, onProcessError);
            }

            return processLines(onSuccess, onError);
        };
    }

    // Добавление в источники TMDB, если опция включена
    if (Lampa.Storage.get('rus_movie_main') !== false) {
        Object.assign(Lampa.Api.sources.tmdb, new MainPageRenderer(Lampa.Api.sources.tmdb));
        setupMainPage();
    }

    // Функция настройки главной страницы (с вызовом console и т.д., но в оригинале это замыкания, которые ничего не делают)
    function setupMainPage() {
        // Оригинальные замыкания _0x41c159 и _0x47977e — это просто вызовы toString и search для проверки, но они не влияют на логику.
        // Здесь можно оставить пустым, так как они используются для анти-деобфускации.
        if (Lampa.Storage.get('rus_movie_main') === 'main') {
            const activeSource = Lampa.Storage.get('rus_movie_main');
            const interval = setInterval(function() {
                const active = Lampa.Activity.active();
                const div = $('div[data-name="rus_movie_main"]');
                if (active && active.component === 'main' && !div.length > 0) {
                    clearInterval(interval);
                    Lampa.Activity.trigger({
                        source: activeSource,
                        title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('rus_movie_main').toUpperCase()
                    });
                }
            }, 200);
        }
    }

    // Слушатель для готовности приложения
    Lampa.Listener.follow('app', function(event) {
        if (event.type === 'appready') {
            setupMainPage();
        }
    });

    // Добавление параметра в настройки
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'rus_movie_main',
            type: 'native',
            default: true
        },
        field: {
            name: 'Русские новинки на главной',
            description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)'
        },
        onRender: function(item) {
            setTimeout(function() {
                $('#app > div.settings > div.settings__content.layer--height > div.settings__body > div').insertAfter('div[data-name="interface_size"]');
            }, 0);
        }
    });
})();