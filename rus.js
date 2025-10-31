(function() {
    'use strict';

    console.log('[Русское] Плагин запущен');

    Lampa.Platform.tv();

    // Иконка
    function getIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';
    }

    const API_KEY = '4ef0d7355d9ffb5151e987764708ce96';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const currentDate = new Date().toISOString().split('T')[0];

    // === ПОДБОРКИ ===
    const collections = [
        { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', url: `discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=${currentDate}` },
        { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', url: `discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${currentDate}` },
        { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg', url: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc' },
        { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg', url: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc' },
        { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg', url: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc' },
        { title: 'IVI', img: 'https://bylampa.github.io/img/ivi.jpg', url: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc' },
        { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg', url: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc' },
        { title: 'КиноПоиск', img: 'https://bylampa.github.io/img/kinopoisk.jpg', url: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc' },
        { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg', url: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc' },
        { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg', url: 'discover/tv?with_networks=806&sort_by=first_air_date.desc' },
        { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg', url: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc' }
    ];

    // === КОМПОНЕНТ rus_movie ===
    function rusComponent(params) {
        const component = new Lampa.Component(params);

        // Главная — список подборок
        component.create = function() {
            const data = {
                collection: true,  // ВАЖНО: ВКЛЮЧАЕМ
                total_pages: 1,
                results: collections.map(c => ({
                    title: c.title,
                    img: c.img,
                    url: c.url,
                    source: 'tmdb'
                }))
            };
            this.build(data);
        };

        // Загрузка TMDB
        component.nextPageReuest = function(p, onSuccess, onError) {
            const url = `${BASE_URL}/${p.url}&api_key=${API_KEY}&language=ru&page=${p.page || 1}`;
            console.log('[Русское] Загружаю:', url);

            const network = new Lampa.Reguest();
            network.native(url, res => {
                res.title = p.title || 'Подборка';
                onSuccess(res);
            }, onError);
        };

        // КЛИК ПО КАРТОЧКЕ — РАБОТАЕТ ТОЛЬКО С collection: true
        component.render = function(data, card) {
            card.onEnter = () => {
                console.log('[Русское] Клик по:', card.title);
                Lampa.Activity.push({
                    url: card.url,
                    title: card.title,
                    component: 'full',
                    source: 'tmdb',
                    page: 1
                });
            };
        };

        return component;
    }

    Lampa.Component.add('rus_movie', rusComponent);

    // === МЕНЮ ===
    function addMenu() {
        $('.menu__item[data-rus]').remove();

        const $item = $(`
            <li class="menu__item selector" data-rus="true">
                <div class="menu__ico">${getIcon()}</div>
                <div class="menu__text">Русское</div>
            </li>
        `);

        $item.on('hover:enter', () => {
            Lampa.Activity.push({
                url: '',
                title: 'Русское',
                component: 'rus_movie',
                page: 1
            });
        });

        const $menu = $('.menu .menu__list').first();
        if ($menu.length) {
            $menu.append($item);
            $item.find('.menu__text').css('text-align', 'center');
        }
    }

    // Гарантия загрузки
    $(document).ready(() => setTimeout(addMenu, 1000));
    setTimeout(addMenu, 3000);
    setInterval(addMenu, 10000);

    // === МЕТАДАННЫЕ ===
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = {
        type: 'movie',
        version: '2.1.0',
        name: 'Русское',
        description: 'Рабочие русские подборки через TMDB',
        component: 'rus_movie'
    };

    console.log('[Русское] Плагин готов');
})();
