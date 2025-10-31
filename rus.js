(function() {
    'use strict';

    Lampa.Platform.tv();

    // SVG-иконка для меню
    function getMenuIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';
    }

    const currentDate = new Date().toISOString().substr(0, 10);

    // Подборки русских новинок
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

    // Основная коллекция (список подборок)
    function getMainCollection(params, onSuccess) {
        const data = {
            collection: true,
            total_pages: 1,
            results: russianCollections.map(item => ({
                title: item.title,
                img: item.img,
                hpu: item.request
            }))
        };
        onSuccess(data);
    }

    // Полная страница (запрос к TMDB)
    function getFullPage(params, onSuccess, onError) {
        const network = new Lampa.Reguest();
        const url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + params.url + '&page=' + (params.page || 1);
        network.native(url, (response) => {
            response.title = params.title;
            onSuccess(response);
        }, onError);
    }

    // Компонент для коллекции
    function createCollectionComponent() {
        const component = new Lampa.Component();
        component.create = function() {
            getMainCollection(this.params, this.build.bind(this));
        };
        component.nextPageReuest = function(params, onSuccess, onError) {
            getFullPage(params, onSuccess, onError);
        };
        component.render = function(data, card, empty) {
            empty.visible = false;
            empty.onEnter = () => {
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

    // Регистрация компонента
    Lampa.Component.add('rus_movie', createCollectionComponent);

    // === ДОБАВЛЕНИЕ В МЕНЮ (РАБОТАЕТ В 1.11+) ===
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Удаляем старый пункт
            if (Lampa.Menu.get('rus_movie')) {
                Lampa.Menu.remove('rus_movie');
            }

            // Добавляем новый
            Lampa.Menu.add({
                title: 'Русское',
                icon: getMenuIcon(),
                page: {
                    component: 'rus_movie',
                    url: '',
                    title: 'Русское',
                    source: 'main',
                    page: 1
                }
            }, 'rus_movie');

            // Центрируем текст (опционально)
            setTimeout(() => {
                const $text = $('.menu__item[data-name="rus_movie"] .menu__text');
                if ($text.length) $text.css('text-align', 'center');
            }, 200);
        }
    });

    // === ГЛАВНАЯ СТРАНИЦА (адаптировано под новое API) ===
    class MainPageRenderer {
        constructor() {
            this.sources = [];
        }

        get(url, params, onSuccess, onError) {
            const network = new Lampa.Reguest();
            const fullUrl = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
            network.native(fullUrl, onSuccess, onError);
        }

        main(params = {}, onSuccess, onError) {
            const ranges = [
                {start: 2023, end: 2025}, {start: 2020, end: 2022},
                {start: 2017, end: 2019}, {start: 2014, end: 2016},
                {start: 2011, end: 2013}
            ];
            const r1 = ranges[Math.floor(Math.random() * ranges.length)];
            const r2 = ranges[Math.floor(Math.random() * ranges.length)];
            const sort1 = ['popularity.desc', 'vote_count.desc', 'vote_average.desc', 'revenue.desc'][Math.floor(Math.random() * 4)];
            const sort2 = ['popularity.desc', 'vote_average.desc', 'revenue.desc'][Math.floor(Math.random() * 3)];

            const self = this;
            const lines = [];

            const addLine = (url, title, options = {}) => {
                lines.push(cb => {
                    self.get(url, params, data => {
                        Object.assign(data, { title }, options);
                        cb(data);
                    }, cb);
                });
            };

            // Основные линии
            addLine('trending/all/day', 'В тренде (день)', { small: true, line_type: 'small' });
            lines.push(cb => cb({
                source: 'main',
                results: Lampa.TimeTable.get().slice(0, 20),
                title: 'Недавно просмотренное',
                nomore: true
            }));
            addLine('trending/all/week', 'В тренде (неделя)');
            addLine('trending/tv/week', 'Популярные сериалы');
            addLine(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${currentDate}`, 'Русские фильмы', { small: true, wide: true });
            addLine(`discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'Русские сериалы');
            addLine('movie/popular', 'Популярные фильмы');
            addLine(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${currentDate}`, 'Русские мультфильмы', { small: true, line_type: 'small' });
            addLine('movie/now_playing', 'Сейчас в кино');
            addLine('movie/upcoming', 'Скоро в кино');
            addLine(`discover/movie?primary_release_date.gte=${r2.start}-01-01&primary_release_date.lte=${r2.end}-12-31&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=${sort2}`, 'Подборки русских фильмов', { line_type: 'top' });
            addLine(`discover/tv?first_air_date.gte=${r1.start}-01-01&first_air_date.lte=${r1.end}-12-31&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=${sort1}`, 'Подборки русских сериалов', { line_type: 'wide' });
            addLine(`discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=${currentDate}`, 'Русские новинки', { collection: true, wide: true });
            addLine(`discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'ТНТ');
            addLine(`discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'KION');
            addLine(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'Wink', { collection: true, line_type: 'small' });
            addLine(`discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'OKKO');
            addLine(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'КиноПоиск');
            addLine(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'Start');
            addLine(`discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${currentDate}`, 'Premier');
            addLine('movie/top_rated', 'Топ фильмы', { line_type: 'wide' });
            addLine('tv/top_rated', 'Топ сериалы', { line_type: 'wide' });

            // Жанры (если есть)
            if (params.genres) {
                params.genres.forEach(g => {
                    lines.push(cb => {
                        self.get('discover/movie?with_genres=' + g.id, params, data => {
                            data.title = Lampa.Lang.translate(g.title.replace(/[^a-z_]/g, ''));
                            cb(data);
                        }, cb);
                    });
                });
            }

            Lampa.Api.show(lines, 6, onSuccess, onError, 'movie');
        }
    }

    // === ИНТЕГРАЦИЯ В ГЛАВНУЮ СТРАНИЦУ ===
    if (Lampa.Storage.get('rus_movie_main', true)) {
        const renderer = new MainPageRenderer();
        if (Lampa.Api.sources.tmdb) {
            Object.assign(Lampa.Api.sources.tmdb, renderer);
        }
    }

    // === НАСТРОЙКИ ===
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'native', default: true },
        field: {
            name: 'Русские новинки на главной',
            description: 'Показывать подборки русских новинок. Перезапустите приложение после изменения.'
        },
        onRender: () => {
            setTimeout(() => {
                const $target = $('div[data-name="interface_size"]');
                if ($target.length) {
                    const $param = $('div[data-name="rus_movie_main"]');
                    if ($param.length && !$param.parent().is($target.parent())) {
                        $param.insertAfter($target);
                    }
                }
            }, 100);
        }
    });

    // === МЕТАДАННЫЕ ПЛАГИНА ===
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = {
        type: 'movie',
        version: '1.2.0',
        name: 'Русское',
        description: 'Русские фильмы, сериалы и новинки на главной странице и в меню.',
        component: 'rus_movie_main'
    };

})();
