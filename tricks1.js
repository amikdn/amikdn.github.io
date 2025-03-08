(function () {
    'use strict';

    /**
     * Ждём, пока приложение Lampa будет готово
     */
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }

    /**
     * Основная точка входа
     */
    function initPlugin() {
        /**
         * 1) Регистрируем во встроенных источниках новый источник "kp_fake",
         *    чтобы:
         *    - Глобальный поиск не ломался (у нас есть discovery.start_typing)
         *    - Можно было открывать category_full (метод list, main и т.д.)
         *    - Название "kp_fake" — любое, лишь бы не конфликтовать с другими.
         */
        if (!Lampa.Api.sources['kp_fake']) {
            Lampa.Api.sources['kp_fake'] = {
                /**
                 * discovery: не функция, а объект
                 *  - так Lampa в некоторых версиях берёт discovery.start_typing
                 *  - search(...) вызывается глобальным поиском
                 */
                discovery: {
                    title: 'KinoPoisk Lite',
                    search: function (params, onComplete) {
                        // Возвращаем пустой массив, чтобы не было ошибок
                        onComplete([]);
                    },
                    onMore: function (params) {},
                    onCancel: function () {},
                    start_typing: function (query, onComplete) {
                        // Чтобы Lampa не падала
                        onComplete([]);
                    }
                },

                /**
                 * Метод main — когда Lampa пытается показать "Главную" вкладку
                 * для этого источника. Вернём пустые данные, чтобы не упало.
                 */
                main: function (params = {}, onComplete, onError) {
                    onComplete({
                        results: [],
                        more: false,
                        title: 'KinoPoisk Lite'
                    });
                },

                /**
                 * Метод list — когда заходим в category_full, Lampa просит
                 * "дай мне список". Мы возвращаем, к примеру, заглушку.
                 */
                list: function (params = {}, onComplete, onError) {
                    // Вы можете сделать реальный запрос, например:
                    //   getListFromKP(params, onComplete, onError);
                    // а пока вернём пусто
                    onComplete({
                        results: [],
                        more: false
                    });
                },

                /**
                 * Метод category — аналогично. Если Lampa спросит "category",
                 * вернём заглушку
                 */
                category: function (params = {}, onComplete, onError) {
                    onComplete({
                        results: [],
                        more: false
                    });
                },

                /**
                 * Метод full — карточка фильма/сериала.
                 * Если зайдут в карточку с source=kp_fake, отдадим пусто.
                 */
                full: function (params = {}, onComplete, onError) {
                    onComplete({});
                },

                /**
                 * person — если вдруг будут искать "актёра"
                 */
                person: function (params = {}, onComplete) {
                    onComplete({});
                },

                /**
                 * seasons — для сериалов
                 */
                seasons: function (tv, from, onComplete) {
                    onComplete({});
                },

                /**
                 * menuCategory — не используем
                 */
                menuCategory: function (params, onComplete) {
                    onComplete([]);
                },

                /**
                 * clear — если нужно почистить запросы
                 */
                clear: function () {}
            };
        }

        /**
         * 2) Создаём кнопку «Кинопоиск» в левом меню,
         *    по Enter открываем Activity со списком категорий (крупные иконки),
         *    как в «TV Show стриминги».
         */
        createKinoPoiskButton();
    }

    /**
     * Функция добавляет пункт "Кинопоиск" в главное меню Lampa
     */
    function createKinoPoiskButton() {
        var MENU_SELECTOR = '[data-action="tv"]'; // после кнопки "TV"
        var TIMEOUT = 2000;

        // Иконка "K"
        var iconSVG = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="192"
                height="192"
                viewBox="0 0 192 192"
            >
              <g fill="none" fill-rule="evenodd">
                <g fill="currentColor" fill-rule="nonzero">
                  <path
                    fill-rule="evenodd"
                    d="
                      M20,4
                      H172
                      A16,16 0 0 1 188,20
                      V172
                      A16,16 0 0 1 172,188
                      H20
                      A16,16 0 0 1 4,172
                      V20
                      A16,16 0 0 1 20,4
                      Z

                      M20,18
                      H172
                      A2,2 0 0 1 174,20
                      V172
                      A2,2 0 0 1 172,174
                      H20
                      A2,2 0 0 1 18,172
                      V20
                      A2,2 0 0 1 20,18
                      Z
                    "
                  />
                  <g transform="translate(-10.63, 0)">
                    <path
                      d="
                        M96.5 20
                        L66.1 75.733
                        V20
                        H40.767
                        v152
                        H66.1
                        v-55.733
                        L96.5 172
                        h35.467
                        C116.767 153.422 95.2 133.578 80 115
                        c28.711 16.889 63.789 35.044 92.5 51.933
                        v-30.4
                        C148.856 126.4 108.644 115.133 85 105
                        c23.644 3.378 63.856 7.889 87.5 11.267
                        v-30.4
                        L85 90
                        c27.022-11.822 60.478-22.711 87.5-34.533
                        v-30.4
                        C143.789 41.956 108.711 63.11 80 80
                        L131.967 20
                        z
                      "
                    />
                  </g>
                </g>
              </g>
            </svg>
        `;

        // Сам пункт меню
        var li = document.createElement('li');
        li.className = 'menu__item selector';
        li.setAttribute('data-action', 'kp_fake');
        li.innerHTML = `
            <div class="menu__ico">${iconSVG}</div>
            <div class="menu__text">Кинопоиск</div>
        `;

        // При клике открываем нашу Activity
        li.addEventListener('hover:enter', function () {
            openKinoPoiskCategories();
        });

        // Ждём, пока меню будет отрендерено
        function waitMenu() {
            setTimeout(function () {
                var menu = Lampa.Menu.render();
                var tvItem = menu.querySelector(MENU_SELECTOR);
                if (tvItem) {
                    tvItem.insertAdjacentElement('afterend', li);
                }
            }, TIMEOUT);
        }

        if (window.appready) waitMenu();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') waitMenu();
            });
        }
    }

    /**
     * 3) Создаём Activity со списком категорий (иконки, крупные надписи),
     *    чтобы было «как в плагине TV Show стриминги».
     */
    function openKinoPoiskCategories() {
        Lampa.Activity.push({
            // Уникальный name для идентификации
            // (не обязательно "kp_fake_menu", но пусть так)
            url: '',
            title: 'Кинопоиск',
            component: 'kp_fake_menu',
            page: 1
        });
    }

    /**
     * 4) Реализуем компонент Activity «kp_fake_menu» — это «экран»,
     *    в котором выводим категории крупными иконками.
     */
    Lampa.Component.add({
        name: 'kp_fake_menu',
        /**
         * Обязательный метод create, Lampa его вызовет
         */
        create: function () {
            var _this = this;

            // 1) Создаём основной скролл
            this.core_box = Lampa.Template.js('scroll');
            this.scroll = new Lampa.Scroll({
                mask: true,
                over: true
            });
            this.scroll.render(this.core_box);

            // 2) Массив категорий (название + иконка + URL)
            var categories = [
                {
                    title: 'Популярные фильмы',
                    url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',
                    icon: '<svg width="64" height="64" ...>...</svg>'
                },
                {
                    title: 'Топ фильмы',
                    url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS',
                    icon: '<svg width="64" height="64" ...>...</svg>'
                },
                {
                    title: 'Популярные российские фильмы',
                    url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM',
                    icon: '<svg width="64" height="64" ...>...</svg>'
                },
                // Добавьте остальные...
            ];

            // 3) Рисуем каждый пункт категории как <div class="card ...">
            //    Можно взять Template.js('card') или вручную.
            categories.forEach(function (cat) {
                // Создаём элемент
                var item = document.createElement('div');
                item.className = 'card selector card--category';

                // Внутри делаем иконку + название
                item.innerHTML = `
                    <div class="card__icons">
                        <div class="card__icons-inner">
                            ${cat.icon}
                        </div>
                    </div>
                    <div class="card__title">${cat.title}</div>
                `;

                // При клике → открываем category_full
                item.addEventListener('hover:enter', function () {
                    Lampa.Activity.push({
                        url: cat.url,
                        title: cat.title,
                        component: 'category_full',
                        // Указываем наш источник "kp_fake"
                        source: 'kp_fake',
                        page: 1,
                        card_type: true
                    });
                });

                _this.scroll.append(item);
            });

            // 4) Навешиваем стандартные методы
            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(_this.core_box);
                        Lampa.Controller.collectionFocus(false, _this.core_box);
                    },
                    up: function () {
                        Lampa.Controller.scrollTo(_this.scroll.render(), false, -1);
                    },
                    down: function () {
                        Lampa.Controller.scrollTo(_this.scroll.render(), false, 1);
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });

                Lampa.Controller.toggle('content');
            };

            this.pause = function () {};
            this.stop = function () {};
            this.render = function () {
                return _this.core_box;
            };
            this.destroy = function () {
                _this.scroll.destroy();
                _this.core_box.remove();
            };
        }
    });
})();
