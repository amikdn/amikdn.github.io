(function(){
    'use strict';

    /**
     * Шаг 1. "Чиним" глобальный поиск:
     * Для каждого источника, у которого нет discovery.start_typing,
     * прописываем пустую функцию. Тогда Lampa не будет падать.
     */
    function fixSearchForAllSources(){
        // Перебираем все зарегистрированные источники
        for(let name in Lampa.Api.sources){
            let src = Lampa.Api.sources[name];
            // Если нет discovery — создаём
            if(!src.discovery) src.discovery = {};
            // Если нет метода start_typing — добавляем заглушку
            if(typeof src.discovery.start_typing !== 'function'){
                src.discovery.start_typing = function(query, onComplete){
                    // Возвращаем пустой массив результатов
                    onComplete([]);
                };
            }
        }
    }

    /**
     * Шаг 2. Добавляем кнопку "Кинопоиск" в главное меню после пункта ТВ
     */
    function addKpMenuButton(){
        const ITEM_TV_SELECTOR = '[data-action="tv"]';

        // Иконка (просто пример)
        const iconKP = `
            <svg width="32" height="32" viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <g fill-rule="evenodd">
                <path d="M20,4H172a16,16,0,0,1,16,16V172a16,16,0,0,1-16,16H20a16,16,0,0,1-16-16V20A16,16,0,0,1,20,4Z" fill="currentColor"/>
                <path d="M96.5,20,66.1,75.733V20H40.767V172H66.1V116.267L96.5,172h35.467C116.767,153.422,95.2,133.578,80,115c28.711,16.889,63.789,35.044,92.5,51.933v-30.4C148.856,126.4,108.644,115.133,85,105c23.644,3.378,63.856,7.889,87.5,11.267v-30.4L85,90c27.022-11.822,60.478-22.711,87.5-34.533v-30.4C143.789,41.956,108.711,63.11,80,80Z" fill="#000" />
              </g>
            </svg>
        `;

        // Создаём элемент <li> с классами
        const field = document.createElement('li');
        field.classList.add('menu__item','selector');
        // data-action, чтобы стили не конфликтовали
        field.setAttribute('data-action','kp_fake');
        field.innerHTML = `
            <div class="menu__ico">${iconKP}</div>
            <div class="menu__text">Кинопоиск</div>
        `;

        // При клике открываем нашу Activity
        field.addEventListener('hover:enter', ()=>{
            Lampa.Activity.push({
                title: 'Кинопоиск',
                component: 'kp_fake_categories',
                page: 1
            });
        });

        // Ищем пункт ТВ и вставляем кнопку после него
        const tv_item = Lampa.Menu.render().querySelector(ITEM_TV_SELECTOR);
        if(tv_item && tv_item.parentNode){
            tv_item.parentNode.insertBefore(field, tv_item.nextSibling);
        }
    }

    /**
     * Шаг 3. Определяем компонент Activity "kp_fake_categories":
     * Тут будет список (или иконки) категорий Кинопоиска.
     */
    Lampa.Component.add('kp_fake_categories',{
        // Метод create() вызывается, когда Activity открывается
        create(){
            const _this = this;

            // Корневой элемент, куда помещаем верстку
            this.html = document.createElement('div');
            this.html.classList.add('kp-fake-list');

            // Пример набора категорий
            // В url используем api/v2.2/... — далее "KP-плагин" это обработает
            const categories = [
                { title: 'Популярные Фильмы', url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
                { title: 'Топ Фильмы',          url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
                { title: 'Росс. фильмы',        url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
                { title: 'Росс. сериалы',       url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
                // добавьте остальные
            ];

            // Создаём элементы-«карточки»
            categories.forEach(cat=>{
                const item = document.createElement('div');
                item.classList.add('kp-fake-item','selector');
                item.innerHTML = `<div class="kp-fake-title">${cat.title}</div>`;

                // При клике (enter) переходим в category_full
                item.addEventListener('hover:enter', ()=>{
                    Lampa.Activity.push({
                        url: cat.url,
                        title: cat.title,
                        component: 'category_full',
                        source: 'KP',     // <-- нужен плагин, который обрабатывает source=KP
                        card_type: true,
                        page: 1
                    });
                });

                this.html.appendChild(item);
            });

            // Добавляем в Activity
            this.addBlock(this.html);

            // Когда всё готово, активируем контроллер
            this.start = ()=>{
                Lampa.Controller.toggle('content');
            }
        },
        // Метод back() вызывается при кнопке «назад»
        back(){
            // Возвращаемся в меню
            Lampa.Controller.toggle('menu');
        }
    });


    /**
     * Запускаем всё после готовности Lampa
     */
    function initPlugin(){
        fixSearchForAllSources();
        addKpMenuButton();
    }

    if(window.appready){
        initPlugin();
    }
    else{
        Lampa.Listener.follow('app', function(e){
            if(e.type === 'ready'){
                initPlugin();
            }
        });
    }
})();
