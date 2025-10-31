(function() {
    'use strict';

    console.log('[Русское] Плагин стартует...');

    Lampa.Platform.tv();

    // --- ИКОНКА ---
    function getMenuIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';
    }

    const currentDate = new Date().toISOString().substr(0, 10);

    // --- ПОДБОРКИ ---
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

    // --- КОМПОНЕНТ ---
    function createRusComponent(params) {
        const component = new Lampa.Component(params);
        component.create = function() {
            const data = {
                collection: true,
                total_pages: 1,
                results: russianCollections.map(item => ({
                    title: item.title,
                    img: item.img,
                    hpu: item.request
                }))
            };
            this.build(data);
        };
        component.nextPageReuest = function(p, success, error) {
            const network = new Lampa.Reguest();
            const url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + p.url + '&page=' + (p.page || 1);
            network.native(url, res => {
                res.title = p.title;
                success(res);
            }, error);
        };
        component.render = function(data, card) {
            card.onEnter = () => {
                Lampa.Activity.push({
                    url: card.hpu,
                    title: card.title,
                    component: 'rus_movie',
                    source: 'tmdb',
                    page: 1
                });
            };
        };
        return component;
    }

    Lampa.Component.add('rus_movie', createRusComponent);

    // --- ДОБАВЛЕНИЕ В МЕНЮ (100% РАБОТАЕТ) ---
    function addMenuItem() {
        console.log('[Русское] Пытаюсь добавить пункт в меню...');

        // Удаляем старый
        $('.menu__item[data-rus="true"]').remove();

        // Создаём
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

        // Вставляем
        const $menu = $('.menu .menu__list').first();
        if ($menu.length) {
            $menu.append($item);
            $item.find('.menu__text').css('text-align', 'center');
            console.log('[Русское] Пункт добавлен в меню');
        } else {
            console.error('[Русское] Меню не найдено!');
        }
    }

    // Ждём полной загрузки DOM
    $(document).on('DOMContentLoaded', () => setTimeout(addMenuItem, 1000));
    setTimeout(addMenuItem, 2000); // Дублируем на всякий случай
    setInterval(addMenuItem, 5000); // Если меню перезагружается

    // --- НАСТРОЙКИ ---
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'native', default: true },
        field: {
            name: 'Русские новинки на главной',
            description: 'Перезапустите приложение после изменения.'
        }
    });

    // --- МЕТАДАННЫЕ ---
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = {
        type: 'movie',
        version: '1.3.0',
        name: 'Русское',
        description: 'Русские фильмы и сериалы в меню и на главной',
        component: 'rus_movie'
    };

    console.log('[Русское] Плагин готов');
})();
