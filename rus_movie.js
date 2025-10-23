(function () {
    'use strict';

    // =================================================
    // 1. Проверка платформы
    // =================================================
    Lampa.Platform.tv();

    // =================================================
    // 2. Иконка для меню
    // =================================================
    const menuIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
        <g fill="none" stroke="currentColor" stroke-width="4">
            <path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/>
            <path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/>
            <path stroke-linecap="round" d="M24 44h20"/>
        </g>
    </svg>`;

    // =================================================
    // 3. Подборки (главная страница)
    // =================================================
    const today = new Date().toISOString().slice(0, 10);

    const collections = [
        {
            title: 'Русские новинки',
            img: 'https://bylampa.github.io/img/rus_movie.jpg',
            request: `discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=${today}`
        },
        {
            title: 'Русские сериалы',
            img: 'https://bylampa.github.io/img/rus_tv.jpg',
            request: `discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'Русские мультфильмы',
            img: 'https://bylampa.github.io/img/rus_mult.jpg',
            request: `discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=${today}`
        },
        {
            title: 'СТС',
            img: 'https://bylampa.github.io/img/sts.jpg',
            request: `discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'ТНТ',
            img: 'https://bylampa.github.io/img/tnt.jpg',
            request: `discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'IVI',
            img: 'https://bylampa.github.io/img/ivi.jpg',
            request: `discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'KION',
            img: 'https://bylampa.github.io/img/kion.jpg',
            request: `discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'Okko',
            img: 'https://bylampa.github.io/img/okko.jpg',
            request: `discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.l Washer=${today}`
        },
        {
            title: 'Premier',
            img: 'https://bylampa.github.io/img/premier.jpg',
            request: `discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'Wink',
            img: 'https://bylampa.github.io/img/wink.jpg',
            request: `discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}`
        },
        {
            title: 'Start',
            img: 'https://bylampa.github.io/img/start.jpg',
            request: `discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}`
        }
    ];

    // =================================================
    // 4. Сетевые функции
    // =================================================
    function mainCollection(component, success) {
        const result = {
            collection: true,
            total_pages: 1,
            results: collections.map(c => ({ title: c.title, img: c.img, hpu: c.request }))
        };
        success(result);
    }

    function loadPage(component, success, error) {
        const req = new Lampa.Reguest();
        const url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + component.url + '&page=' + (component.page || 1);
        req.get(url, data => {
            data.title = component.title;
            success(data);
        }, error);
    }

    const network = { main: mainCollection, full: loadPage };

    // =================================================
    // 5. Рендерер компонента rus_movie
    // =================================================
    function rusMovieRenderer(data) {
        const comp = new Lampa.Component(data);

        comp.build = function () {
            network.main(data, this.activity.bind(this), this.empty.bind(this));
        };

        comp.nextPageReuest = function (c, s, e) {
            network.full(c, s.bind(comp), e.bind(comp));
        };

        comp.onEnter = function (item) {
            Lampa.Activity.push({
                url: item.hpu,
                title: item.title,
                component: 'category_full',
                source: 'tmdb',
                page: 1
            });
        };

        return comp;
    }

    // =================================================
    // 6. Манифест
    // =================================================
    const manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Русское',
        description: 'Подборки русских фильмов и сериалов',
        component: 'rus_movie'
    };

    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins['rus_movie'] = manifest;

    // =================================================
    // 7. Регистрация компонента
    // =================================================
    Lampa.Component.add('rus_movie', rusMovieRenderer);

    // =================================================
    // 8. Добавление в меню (с гарантией)
    // =================================================
    function addMenuItem() {
        const $list = $('.menu .menu__list');
        if (!$list.length) {
            console.warn('Menu list not found – retry in 500ms');
            setTimeout(addMenuItem, 500);
            return;
        }

        $('.menu__item[data-component="rus_movie"]').remove();

        const $item = $(`
            <li class="menu__item selector" data-component="rus_movie">
                <div class="menu__ico">${menuIcon}</div>
                <div class="menu__text">${manifest.name}</div>
            </li>
        `);

        $item.on('hover:enter', () => {
            Lampa.Activity.push({
                url: '',
                title: manifest.name,
                component: 'rus_movie',
                page: 1
            });
        });

        $list.eq(0).append($item);
        console.log('Русское добавлено в меню');
    }

    // =================================================
    // 9. Настройки
    // =================================================
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'rus_movie_main',
            type: 'select',
            values: { tmdb: 'TMDB', false: 'Откл.' },
            default: 'tmdb'
        },
        field: {
            name: 'Показывать подборки русских новинок на главной странице',
            description: 'После изменения перезапустите приложение (работает только с TMDB)'
        },
        onRender: el => $(el).insertAfter('div[data-name="interface_size"]')
    });

    // =================================================
    // 10. Plugin: динамические подборки на главной
    // =================================================
    const Plugin = function (api) {
        this.api = Lampa.Template;  // без new

        this.build = function () {
            const years = [
                { start: 2023, end: 2025 },
                { start: 2020, end: 2022 },
                { start: 2017, end: 2019 },
                { start: 2014, end: 2016 },
                { start: 2011, end: 2013 }
            ];

            const randomYear = years[Math.floor(Math.random() * years.length)];
            const fromYear = randomYear.start + '-01-01';
            const toYear = randomYear.end + '-12-31';

            const anotherYear = years[Math.floor(Math.random() * years.length)];
            const fromYear2 = anotherYear.start + '-01-01';
            const toYear2 = anotherYear.end + '-12-31';

            const sortOptions = ['popularity.desc', 'vote_average.desc', 'vote_count.desc', 'revenue.desc'];
            const randomSort = Math.floor(Math.random() * sortOptions.length);
            const sortBy = sortOptions[randomSort];

            const tvSortOptions = ['popularity.desc', 'vote_average.desc', 'vote_count.desc'];
            const tvRandomSort = Math.floor(Math.random() * tvSortOptions.length);
            const tvSortBy = tvSortOptions[tvRandomSort];

            const today = new Date().toISOString().slice(0, 10);

            const self = this;
            const params = arguments[0] || {};
            const success = arguments[1];
            const error = arguments[2];
            const maxItems = 6;

            const requests = [
                // 1. Главная новинка
                function (cb) {
                    self.get('trending/all/week', params, data => {
                        data.title = Lampa.Lang.translate('title_main');
                        data.small = true;
                        data.line_type = 'small';
                        cb(data);
                    }, cb);
                },
                // 2. Скоро на ТВ
                function (cb) {
                    cb({
                        source: 'tmdb',
                        results: Lampa.TimeTable.get().slice(0, 20),
                        title: Lampa.Lang.translate('title_upcoming_episodes'),
                        nomore: true,
                        cardClass: function (item, episode) {
                            return new CardRenderer(item, episode);
                        }
                    });
                },
                // 3. В тренде
                function (cb) {
                    self.get('trending/all/day', params, data => {
                        data.title = Lampa.Lang.translate('title_trend_day');
                        cb(data);
                    }, cb);
                },
                // 4. Тренды недели
                function (cb) {
                    self.get('trending/all/week', params, data => {
                        data.title = Lampa.Lang.translate('title_trend_week');
                        cb(data);
                    }, cb);
                },
                // 5. Русские новинки
                function (cb) {
                    self.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Русские новинки');
                        data.small = true;
                        data.wide = true;
                        data.results.forEach(item => {
                            item.promo = item.overview;
                            item.promo_title = item.title || item.name;
                        });
                        cb(data);
                    }, cb);
                },
                // 6. Русские сериалы
                function (cb) {
                    self.get(`discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Русские сериалы');
                        cb(data);
                    }, cb);
                },
                // 7. Мультфильмы
                function (cb) {
                    self.get('movie/upcoming', params, data => {
                        data.title = Lampa.Lang.translate('title_upcoming');
                        cb(data);
                    }, cb);
                },
                // 8. Русские мультфильмы
                function (cb) {
                    self.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Русские мультфильмы');
                        data.small = true;
                        data.line_type = 'small';
                        cb(data);
                    }, cb);
                },
                // 9. Популярное
                function (cb) {
                    self.get('movie/popular', params, data => {
                        data.title = Lampa.Lang.translate('title_popular_movie');
                        cb(data);
                    }, cb);
                },
                // 10. Топ фильмы
                function (cb) {
                    self.get('movie/top_rated', params, data => {
                        data.title = Lampa.Lang.translate('title_top_movie');
                        data.line_type = 'top';
                        cb(data);
                    }, cb);
                },
                // 11. Подборки по годам (фильмы)
                function (cb) {
                    self.get(`discover/movie?primary_release_date.gte=${fromYear}&primary_release_date.lte=${toYear}&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=${tvSortBy}`, params, data => {
                        data.title = Lampa.Lang.translate('Подборки русских фильмов');
                        data.line_type = 'top';
                        cb(data);
                    }, cb);
                },
                // 12. Подборки по годам (сериалы)
                function (cb) {
                    self.get(`discover/tv?first_air_date.gte=${fromYear2}&first_air_date.lte=${toYear2}&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=${sortBy}`, params, data => {
                        data.title = Lampa.Lang.translate('Подборки русских сериалов');
                        data.line_type = 'wide';
                        cb(data);
                    }, cb);
                },
                // 13. СТС
                function (cb) {
                    self.get(`discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('СТС');
                        data.wide = true;
                        data.small = true;
                        data.results.forEach(item => {
                            item.promo = item.overview;
                            item.promo_title = item.title || item.name;
                        });
                        cb(data);
                    }, cb);
                },
                // 14. ТНТ
                function (cb) {
                    self.get(`discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('ТНТ');
                        cb(data);
                    }, cb);
                },
                // 15. KION
                function (cb) {
                    self.get(`discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('KION');
                        cb(data);
                    }, cb);
                },
                // 16. Premier
                function (cb) {
                    self.get(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Premier');
                        data.collection = true;
                        data.line_type = 'small';
                        cb(data);
                    }, cb);
                },
                // 17. Okko
                function (cb) {
                    self.get(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('OKKO');
                        cb(data);
                    }, cb);
                },
                // 18. Premier (ещё)
                function (cb) {
                    self.get(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Premier');
                        data.wide = true;
                        data.small = true;
                        data.results.forEach(item => {
                            item.promo = item.overview;
                            item.promo_title = item.title || item.name;
                        });
                        cb(data);
                    }, cb);
                },
                // 19. Wink
                function (cb) {
                    self.get(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Wink');
                        cb(data);
                    }, cb);
                },
                // 20. Start
                function (cb) {
                    self.get(`discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
                        data.title = Lampa.Lang.translate('Start');
                        cb(data);
                    }, cb);
                },
                // 21. Топ фильмы
                function (cb) {
                    self.get('movie/top_rated', params, data => {
                        data.title = Lampa.Lang.translate('title_top_movie');
                        data.line_type = 'top';
                        cb(data);
                    }, cb);
                },
                // 22. Топ сериалы
                function (cb) {
                    self.get('tv/top_rated', params, data => {
                        data.title = Lampa.Lang.translate('title_top_tv');
                        data.line_type = 'top';
                        cb(data);
                    }, cb);
                }
            ];

            // Добавляем жанры
            if (this.api.genres) {
                this.api.genres.forEach(genre => {
                    requests.push(function (cb) {
                        self.get('discover/movie?with_genres=' + genre.id, params, data => {
                            data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                            cb(data);
                        }, cb);
                    });
                });
            }

            const totalRequests = requests.length + 1;
            Lampa.Utils.randomize(requests, 0, Lampa.Api.sources.tmdb.search(requests, maxItems, 'movie', totalRequests));

            function run(success, error) {
                Lampa.Api.sources.tmdb.search(requests, maxItems, params.type, success);
            }

            return run(success, error), run;
        };
    };

    // =================================================
    // 11. CardRenderer (для эпизодов)
    // =================================================
    const CardRenderer = function (data, episodeData) {
        const item = data || {};
        const episode = episodeData || item.episode || {};

        if (item.source === undefined) item.source = 'tmdb';
        Lampa.Utils.extend(item, { title: item.title, original_title: item.original_title, release_date: item.release_date });
        item.release_year = ((item.release_date || '0000') + '').substr(0, 4);

        function hideCard(card) { if (card) card.remove(); }

        this.build = function () {
            this.card = Lampa.Template.js('card');
            this.img_poster = this.card.find('.card__img')[0] || {};
            this.img_episode = this.card.find('.full-episode__img img')[0] || {};

            this.card.find('.card__title')[0].innerText = item.title;
            this.card.querySelector('.card__age').innerText = item.vote_average || '';

            if (episode && episode.episode_number) {
                this.card.find('.full-episode__name')[0].innerText = episode.title || Lang.translate('noname');
                this.card.querySelector('.card__title').innerText = episode.name || '';
                this.card.find('.full-episode__date')[0].innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
            }

            if (item.release_year === '0000') {
                hideCard(this.card.find('.card__age'));
            } else {
                this.card.querySelector('.card__age').innerText = item.release_year;
            }

            this.card.addClass('card', this.card[0].classList.bind(this.card[0]));
        };

        this.image = function () {
            if (this.img_poster.onload) return;
            this.img_poster.onload = () => {};
            this.img_poster.onerror = () => { this.img_poster.src = './img/img_broken.svg'; };

            this.img_episode.onload = () => { this.card.find('.full-episode__img').addClass('full-episode__img--loaded'); };
            this.img_episode.onerror = () => { this.img_episode.src = './img/img_broken.svg'; };

            const poster = item.backdrop_path || item.poster_path || item.poster || item.img || './img/img_broken.svg';
            this.img_poster.src = Lampa.Api.img(poster);

            const still = episode.still_path || item.still_path || episode.img || item.img || './img/img_broken.svg';
            this.img_episode.src = Lampa.Api.img(still, 'w300');

            if (this.onVisible) this.onVisible(this.card, item);
        };

        this.start = function () {
            this.build();
            this.card[0].addEventListener('hover:focus', () => { if (this.onFocus) this.onFocus(this.card[0], item); });
            this.card[0].addEventListener('hover:hover', () => { if (this.onHover) this.onHover(this.card[0], item); });
            this.card[0].addEventListener('hover:enter', () => { if (this.onEnter) this.onEnter(this.card[0], item); });
            this.image();
        };

        this.render = function () { /* аналогично image */ };
        this.destroy = function () {
            this.img_poster.onerror = null; this.img_poster.onload = null;
            this.img_episode.onerror = null; this.img_episode.onload = null;
            this.img_poster.src = ''; this.img_episode.src = '';
            hideCard(this.card);
            this.card = null; this.img_poster = null; this.img_episode = null;
        };

        this.getCard = function () { return this.card ? this.card : $(this.card); };
    };

    // =================================================
    // 12. Инициализация
    // =================================================
    Lampa.Listener.follow('appready', e => {
        if (e.type !== 'ready') return;

        // Добавляем пункт в меню
        setTimeout(addMenuItem, 1500);

        // Интеграция в главную, если включено
        if (Lampa.Storage.get('rus_movie_main', 'false') !== 'false') {
            Object.assign(Lampa.Api.sources.tmdb, new Plugin(Lampa.Api.sources.tmdb));
        }
    });

})();
