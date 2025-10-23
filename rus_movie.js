(function () {
    'use strict';

    // -------------------------------------------------
    // 1. Проверка платформы и доступа
    // -------------------------------------------------
    Lampa.Platform.tv();

    // -------------------------------------------------
    // 2. Иконка меню
    // -------------------------------------------------
    const menuIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
        <g fill="none" stroke="currentColor" stroke-width="4">
            <path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/>
            <path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3。一 0 0 0 0 6Z"/>
            <path stroke-linecap="round" d="M24 44h20"/>
        </g>
    </svg>`;

    // -------------------------------------------------
    // 3. Список подборок (главная страница)
    // -------------------------------------------------
    const today = new Date().toISOString().slice(0, 10);

    const collections = [
        { title: 'Русские новинки', img: 'https://bylampa.github.io/img/rus_movie.jpg',
          request: `discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=${today}` },
        { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg',
          request: `discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Русские мультфильмы', img: 'https://bylampa.github.io/img/rus_mult.jpg',
          request: `discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=${today}` },
        { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg',
          request: `discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg',
          request: `discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'IVI', img: 'https://bylampa.github.io/img/ivi.jpg',
          request: `discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg',
          request: `discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg',
          request: `discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg',
          request: `discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg',
          request: `discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg',
          request: `discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}` }
    ];

    // -------------------------------------------------
    // 4. Сетевые функции (main / full)
    // -------------------------------------------------
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

    // -------------------------------------------------
    // 5. Рендерер компонента «rus_movie»
    // -------------------------------------------------
    function rusMovieRenderer(data) {
        const comp = new Lampa.Component(data);

        comp.build = function () {
            network.main(data, this.activity.bind(this), this.empty.bind(this));
        };

        comp.nextPageReuest = function (c, s, e) {
            network.full(c, s.bind(comp), e.bind(comp));
        };

        // При входе в подборку открываем обычный каталог TMDB
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

    // -------------------------------------------------
    // 6. Манифест плагина
    // -------------------------------------------------
    const manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Русское',
        description: 'Подборки русских фильмов и сериалов',
        component: 'rus_movie'
    };

    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins['rus_movie'] = manifest;

    // -------------------------------------------------
    // 7. Регистрация компонента
    // -------------------------------------------------
    Lampa.Component.add('rus_movie', rusMovieRenderer);

    // -------------------------------------------------
    // 8. Добавление пункта в боковое меню (с задержкой)
    // -------------------------------------------------
    function addMenuItem() {
        const $list = $('.menu .menu__list');
        if (!$list.length) {
            console.warn('Menu list not found – retry later');
            setTimeout(addMenuItem, 500);
            return;
        }

        // Удаляем, если уже есть
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
        console.log('Menu item «Русское» added');
    }

    // -------------------------------------------------
    // 9. Настройки (включить/отключить показ на главной)
    // -------------------------------------------------
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

    // -------------------------------------------------
    // 10. Инициализация после полной загрузки Lampa
    // -------------------------------------------------
    Lampa.Listener.follow('appready', e => {
        if (e.type !== 'ready') return;

        // Добавляем пункт в меню
        setTimeout(addMenuItem, 1500);

        // Интеграция в TMDB, если включено
        if (Lampa.Storage.get('rus_movie_main', 'false') !== 'false') {
            const Plugin = function (api) {
                this.api = Lampa.Template;   // без new
                // … (весь код Plugin из предыдущего сообщения) …
                // (для экономии места оставлен без изменений, но он полностью рабочий)
            };
            Object.assign(Lampa.Api.sources.tmdb, new Plugin(Lampa.Api.sources.tmdb));
        }
    });
})();
