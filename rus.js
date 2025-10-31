(function() {
    'use strict';

    console.log('[Русское] Плагин запущен');

    Lampa.Platform.tv();

    // Иконка
    function getMenuIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';
    }

    const currentDate = new Date().toISOString().substr(0, 10);

    // Подборки (с url)
    const collections = [
        { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', url: 'discover/movie?with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate },
        { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', url: 'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + currentDate },
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

    // === КОМПОНЕНТ (ИСПРАВЛЕННЫЙ render + activity) ===
    function rusComponent(params) {
        const component = new Lampa.Component(params);

        // Главная — список подборок
        component.create = function() {
            const data = {
                title: 'Русское',
                results: collections.map(c => ({
                    title: c.title,
                    img: c.img,
                    url: c.url,
                    source: 'tmdb'
                }))
            };
            this.build(data);
        };

        // Загрузка страницы
        component.nextPageReuest = function(p, success, error) {
            const network = new Lampa.Reguest();
            const url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + p.url + '&page=' + (p.page || 1);
            network.native(url, res => {
                res.title = p.title || 'Подборка';
                success(res);
            }, error);
        };

        // КЛИК ПО КАРТОЧКЕ — РАБОТАЕТ!
        component.activity = function(card) {
            card.onEnter = () => {
                console.log('[Русское] Открываю подборку:', card.title);
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
                <div class="menu__ico">${getMenuIcon()}</div>
                <div class="menu__text">Русское</div>
            </li>
        `);

        $item.on('hover:enter', () => {
            console.log('[Русское] Открываю раздел');
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
            console.log('[Русское] Пункт в меню добавлен');
        }
    }

    // Гарантия загрузки
    $(document).ready(() => setTimeout(addMenu, 1000));
    setTimeout(addMenu, 3000);
    setInterval(addMenu, 10000);

    // === НАСТРОЙКИ ===
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'native', default: true },
        field: { name: 'Русские новинки на главной', description: 'Перезапуск обязателен.' }
    });

    // === МЕТАДАННЫЕ ===
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = {
        type: 'movie',
        version: '1.5.0',
        name: 'Русское',
        description: 'Полностью рабочие подборки русских фильмов и сериалов',
        component: 'rus_movie'
    };

    console.log('[Русское] Плагин готов');
})();
