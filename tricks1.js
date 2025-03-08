(function(){
    'use strict';

    /**
     * Ждём готовности приложения
     */
    if(window.appready) init();
    else {
        Lampa.Listener.follow('app',function(e){
            if(e.type === 'ready') init();
        });
    }

    function init(){
        // 1) Создаём упрощённый источник "kp_lite",
        //    чтобы не ломать поиск и не вызывать ошибок
        if(!Lampa.Api.sources['kp_lite']){
            Lampa.Api.sources['kp_lite'] = {
                /**
                 * Если Lampa решит вызвать discovery (поиск) для нашего источника —
                 * вернём «заглушку», чтобы ничего не ломалось.
                 * Некоторые старые версии вызывают discovery().start_typing().
                 */
                discovery: function(){
                    return {
                        title: 'KP Lite',
                        search: function(params, onResult){ onResult([]); },
                        onMore: function(p){},
                        onCancel: function(){},
                        start_typing: function(query, onResult){ onResult([]); } // важно!
                    };
                },

                // Главная вкладка — вернём пусто
                main: function(params, onComplete, onError){
                    onComplete({results:[], more:false, title:'KP Lite'});
                },

                /**
                 * Основной метод, когда Lampa открывает component:'category_full', source:'kp_lite'
                 */
                list: function(params, onComplete, onError){
                    let page   = params.page || 1;
                    let method = params.url  || '';

                    if(!method) return onError();

                    // Пример запроса на Кинопоиск
                    kpLiteFetch(method, page, (data)=>{
                        onComplete(data); // {results, page, total_pages,...}
                    }, onError);
                },

                // Детали карточки — не реализуем
                full: function(params, onComplete, onError){
                    onError();
                },

                // category — тоже не используем
                category: function(params, onComplete, onError){
                    onComplete({results:[], more:false});
                },

                clear: function(){}
            };
        }

        // 2) Регистрируем «Activity» для показа категорий
        //    (по аналогии с плагином «TV Show стриминги»)
        Lampa.Activity.listener.follow('kp_categories', function(e){
            /**
             * e.type может быть: create, start, pause, stop, render
             * e.object — это экземпляр активити
             */
            if(e.type === 'create'){
                let activity = e.object;

                // Создаём заготовку: слой + скролл
                let html   = Lampa.Template.js('scroll');  // в некоторых старых сборках можно: Lampa.Template.get('scroll_body')
                let scroll = new Lampa.Scroll({mask:true, over:true});
                scroll.body().addClass('kp-cats__body');

                // Добавляем scroll внутрь layer__body
                html.find('.layer__body').append(scroll.render());

                // Список категорий (иконки/названия)
                let items = [
                    { title:'Популярные Фильмы',                  url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
                    { title:'Топ Фильмы',                         url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
                    { title:'Популярные российские фильмы',       url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
                    { title:'Популярные российские сериалы',      url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
                    { title:'Популярные российские мини-сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES' },
                    { title:'Популярные Сериалы',                 url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
                    { title:'Популярные Телешоу',                 url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
                ];

                items.forEach(cat=>{
                    // Пример простого оформления
                    let card = $(`
                        <div class="card folder">
                            <div class="card__view">
                                <div class="card__img"></div>
                            </div>
                            <div class="card__title">${cat.title}</div>
                        </div>
                    `);

                    // По Enter — открываем component:'category_full'
                    card.on('hover:enter', ()=>{
                        Lampa.Activity.push({
                            url:       cat.url,
                            title:     cat.title,
                            component: 'category_full',
                            source:    'kp_lite',
                            page:      1
                        });
                    });

                    scroll.append(card);
                });

                // Чтобы Lampa знала, что рисовать
                activity.render = function(){
                    return html;
                };
            }
            else if(e.type === 'start'){
                // Устанавливаем фокус
                let activity = e.object;

                Lampa.Controller.add('kp_categories',{
                    toggle: ()=>{
                        // сообщаем Lampa, где коллекция для навигации
                        Lampa.Controller.collectionSet(activity.render().find('.card'), activity.render());
                        // фокус на первую
                        Lampa.Controller.collectionFocus(activity.render().find('.card')[0], activity.render());
                    },
                    back: ()=>{
                        Lampa.Activity.backward(); // назад
                    }
                });

                Lampa.Controller.toggle('kp_categories');
            }
            else if(e.type==='pause'){
                // при сворачивании
            }
            else if(e.type==='stop'){
                // при закрытии
            }
            else if(e.type==='render'){
                // при перерисовке
            }
        });

        // 3) Добавляем пункт «Кинопоиск» в меню
        addMenuButton();
    }


    /**
     * Функция для запроса на Кинопоиск
     */
    function kpLiteFetch(method, page, done, fail){
        let base = 'https://kinopoiskapiunofficial.tech/';
        let url  = base + method;

        // добавим &page=, если не задано
        if(!url.includes('page=')){
            url += (url.includes('?') ? '&' : '?') + 'page=' + page;
        }

        let net = new Lampa.Reguest();
        net.timeout(15000);

        net.silent(url, (json)=>{
            let items = [];
            if(json.items) items = json.items;
            else if(json.films) items = json.films;
            
            let results = items.map(elem=>{
                let kp_id  = elem.kinopoiskId || elem.filmId || 0;
                let poster = elem.posterUrlPreview || elem.posterUrl || '';
                let title  = elem.nameRu || elem.nameEn || elem.nameOriginal || 'Без названия';
                let rating = elem.ratingKinopoisk || elem.rating || 0;
                let year   = elem.year ? String(elem.year) : '';

                return {
                    id:     'kp_' + kp_id,
                    title:  title,
                    poster: poster,
                    img:    poster,
                    release_date: year,
                    vote_average: rating,
                    source: 'kp_lite'
                };
            });

            let total = json.totalPages || json.pagesCount || 1;

            done({
                results:     results,
                page:        page,
                total_pages: total
            });
        }, (err)=>{
            fail(err);
        }, false, {
            headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616' }
        });
    }


    /**
     * Добавить кнопку в меню
     */
    function addMenuButton(){
        const ITEM_TV_SELECTOR = '[data-action="tv"]';
        let menu = Lampa.Menu.render();

        let icon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 192 192">
            <g fill="none" fill-rule="evenodd">
              <g fill="currentColor" fill-rule="nonzero">
                <path fill-rule="evenodd"
                  d="M20,4H172a16,16,0,0,1,16,16V172a16,16,0,0,1-16,16H20a16,16,0,0,1-16-16V20A16,16,0,0,1,20,4Zm0,14H172a2,2,0,0,1,2,2V172a2,2,0,0,1-2,2H20a2,2,0,0,1-2-2V20A2,2,0,0,1,20,18Z"/>
                <g transform="translate(-10.63, 0)">
                  <path d="
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
                  "/>
                </g>
              </g>
            </g>
          </svg>
        `;

        let li = $(`
          <li class="menu__item selector" data-action="kp_categories_btn">
            <div class="menu__ico">${icon}</div>
            <div class="menu__text">Кинопоиск</div>
          </li>
        `);

        li.on('hover:enter', ()=>{
            // Переходим в нашу Activity "kp_categories"
            Lampa.Activity.push({
                title: 'Кинопоиск',
                component: 'kp_categories'
            });
        });

        menu.find(ITEM_TV_SELECTOR).after(li);
    }

})();
