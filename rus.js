(function() {
    'use strict';

    console.log('[Русское] Плагин загружен');

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
    function getMainCollection(params, onSuccess, onError) {
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

    // Компонент для коллекции (исправлен: добавлены params)
    function createCollectionComponent(params) {
        console.log('[Русское] Создаю компонент с params:', params);
        const component = new Lampa.Component(params);
        component.create = function() {
            getMainCollection(params, this.build.bind(this), this.empty.bind(this));
        };
        component.nextPageReuest = function(params, onSuccess, onError) {
            getFullPage(params, onSuccess.bind(this), onError.bind(this));
        };
        component.render = function(data, card, empty) {
            empty.visible = false;
            card.onEnter = function() {
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

    // === ДОБАВЛЕНИЕ В МЕНЮ (DOM-вставка в appready, как в примерах плагинов) ===
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'appready') {
            console.log('[Русское] appready сработал, добавляю меню');
            setTimeout(() => {
                // Удаляем старый элемент, если есть
                const oldItem = $('.menu__item[data-plugin="rus_movie"]');
                if (oldItem.length) {
                    oldItem.remove();
                    console.log('[Русское] Удалил старый элемент меню');
                }

                // Создаём новый элемент
                const menuIcon = getMenuIcon();
                const menuItem = $(`
                    <li class="menu__item selector" data-plugin="rus_movie">
                        <div class="menu__ico">${menuIcon}</div>
                        <div class="menu__text">Русское</div>
                    </li>
                `);

                // Обработчик клика
                menuItem.on('hover:enter', function() {
                    console.log('[Русское] Клик по меню');
                    Lampa.Activity.push({
                        url: '',
                        title: 'Русское',
                        component: 'rus_movie',
                        source: 'main',
                        page: 1
                    });
                });

                // Вставляем в меню (перед последним элементом или в конец)
                const menuList = $('.menu .menu__list').eq(0);
                if (menuList.length) {
                    menuList.append(menuItem);
                    console.log('[Русское] Добавил элемент в меню');
                    // Центрируем текст
                    menuItem.find('.menu__text').css('text-align', 'center');
                } else {
                    console.error('[Русское] Меню не найдено!');
                }
            }, 500); // Задержка для полной загрузки DOM
        }
    });

    // === ГЛАВНАЯ СТРАНИЦА (упрощённо, без Object.assign, чтобы не ломать) ===
    if (Lampa.Storage.get('rus_movie_main', true)) {
        console.log('[Русское] Включаю на главной');
        // Добавляем метод main в Api.sources.tmdb, если существует
        if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb) {
            const originalMain = Lampa.Api.sources.tmdb.main;
            Lampa.Api.sources.tmdb.main = function(params, onSuccess, onError) {
                // Вызываем оригинал, если есть
                if (originalMain) originalMain.call(this, params, onSuccess, onError);
                // Добавляем русские подборки как линию
                const line = {
                    title: 'Русские новинки',
                    url: 'discover/movie?with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate,
                    component: 'full',
                    cardClass: createCollectionComponent
                };
                onSuccess(line);
            };
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
        onRender: function() {
            setTimeout(() => {
                const $target = $('div[data-name="interface_size"]');
                const $param = $('div[data-name="rus_movie_main"]');
                if ($target.length && $param.length && !$param.parent().is($target.parent())) {
                    $param.insertAfter($target);
                }
            }, 100);
        }
    });

    // === МЕТАДАННЫЕ ПЛАГИНА ===
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = {
        type: 'movie',
        version: '1.2.1',
        name: 'Русское',
        description: 'Русские фильмы, сериалы и новинки на главной странице и в меню.',
        component: 'rus_movie_main'
    };

    console.log('[Русское] Плагин инициализирован');
})();
