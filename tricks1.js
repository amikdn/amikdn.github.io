(function(){
    'use strict';

    /**
     * 1) Определяем объект «KP» — это новый источник.
     *    Упрощённый вариант: методы main, list, full, search и discovery
     */
    function createKpSource(){
        // Проверим, вдруг уже есть источник «KP»
        if(!Lampa.Api || Lampa.Api.sources['KP']){
            return;
        }

        // Простейшая заглушка
        const KP_SOURCE = {
            // Главная страница
            main(params={}, oncomplite, onerror){
                // Пример: возвращаем пустые результаты,
                // либо можно сделать getList('api/v2.2/films/top?...') и т.д.
                oncomplite({
                    results: [],
                    total_pages: 1,
                    page: 1
                });
            },

            // Список (например, категория)
            list(params={}, oncomplite, onerror){
                // Заглушка
                oncomplite({
                    results: [],
                    total_pages: 1,
                    page: 1
                });
            },

            // Подробно о фильме/сериале
            full(params={}, oncomplite, onerror){
                // Заглушка
                oncomplite({});
            },

            // Категории (для вкладки «Категория»)
            category(params={}, oncomplite, onerror){
                // Заглушка
                oncomplite({
                    results: [],
                    total_pages: 1,
                    page: 1
                });
            },

            // Поиск
            search(params={}, oncomplite){
                // Просто вернём пустое, чтобы не ломать поиск
                oncomplite([]);
            },

            // Экран Discovery (когда в поиске переключаются Источники)
            discovery(){
                return {
                    title: 'KP',          // Название в списке Discovery
                    search: this.search,  // Метод поиска
                    onMore(params){},     // не обязательно
                    onCancel(){ /*очистка запросов*/ }
                };
            }
        };

        // Регистрируем источник
        Lampa.Api.sources['KP'] = KP_SOURCE;

        // Добавим «KP» в список источников (Lampa.Params.values.source)
        let sources = Object.assign({}, Lampa.Params.values.source || {});
        sources['KP'] = 'Кинопоиск'; // Название
        Lampa.Params.select('source', sources, 'tmdb'); 
    }

    /**
     * 2) Добавляем в меню Lampa кнопку «Кинопоиск»
     */
    function createKpMenuButton(){
        // Пример иконки (SVG)
        let iconKP = `
          <svg width="32" height="32" viewBox="0 0 192 192" fill="currentColor">
            <!-- ваш SVG-код иконки -->
            <rect x="4" y="4" width="184" height="184" rx="16" ry="16"/>
            <path d="M96 20 L66 76 V20H40V172H66V116L96 172H132 ...Z"/>
          </svg>
        `;

        // Сам пункт меню (через jQuery)
        let field = $(`
            <li class="menu__item selector" data-action="kp_plugin">
                <div class="menu__ico">${iconKP}</div>
                <div class="menu__text">Кинопоиск</div>
            </li>
        `);

        // При клике: откроем Select с категориями (просто пример)
        field.on('hover:enter', ()=>{
            Lampa.Select.show({
                title: 'Кинопоиск',
                items: [
                    { title: 'Популярные Фильмы', data: { url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' } },
                    { title: 'Топ 250', data: { url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS' } },
                    // ... и т.д. ...
                ],
                onSelect(item){
                    // При выборе — открываем Activity
                    Lampa.Activity.push({
                        url: item.data.url,
                        title: item.title,
                        component: 'category_full', // либо 'category'
                        source: 'KP',              // важно! => пойдёт в наш источник
                        card_type: true,
                        page: 1
                    });
                },
                onBack(){
                    // Вернуться в меню
                    Lampa.Controller.toggle('menu');
                }
            });
        });

        // Получаем jQuery-объект меню
        let $menu = Lampa.Menu.render();

        // Ищем кнопку [data-action="tv"], после которой вставим
        let tv_item = $menu.find('[data-action="tv"]');

        if(tv_item.length){
            tv_item.after(field);
        }
        else{
            // Если не нашли, то добавим в конец
            $menu.append(field);
        }
    }

    /**
     * Инициализация плагина
     */
    function initPlugin(){
        createKpSource();
        createKpMenuButton();
    }

    // Запускаем либо сразу, либо при готовности приложения
    if(window.appready){
        initPlugin();
    }
    else{
        Lampa.Listener.follow('app',(e)=>{
            if(e.type === 'ready'){
                initPlugin();
            }
        });
    }

})();
