(function(){
    'use strict';

    /**
     * 1) We only run our init code after Lampa is ready
     */
    if(window.appready) init();
    else {
        Lampa.Listener.follow('app',function(e){
            if(e.type === 'ready') init();
        });
    }

    /**
     * 2) Main init
     */
    function init(){
        // 2.1) Create our minimal source "kp_lite" if not already present
        if(!Lampa.Api.sources['kp_lite']){
            Lampa.Api.sources['kp_lite'] = {
                // “main” is used if user opens the “Main” tab on this source, but we’ll just return empty
                main: function(params={}, oncomplite, onerror){
                    oncomplite({ results:[], title:'KP Lite', more:false });
                },

                // “discovery” is used by Lampa’s search UI for this source - we’ll just return empty
                discovery: function(){
                    return {
                        title: 'KP Lite',
                        search: (p,cb)=>{ cb([]); }, // do not break global search
                        onMore:  (p)=>{},
                        onCancel:()=>{}
                    };
                },

                // The main method that Lampa’s “category_full” uses to load items
                list: function(params={}, oncomplite, onerror){
                    let page   = params.page || 1;
                    let method = params.url || '';
                    if(!method) return onerror();

                    kpFetch(method, page, (data)=>{
                        oncomplite(data); // {results, page, total_pages}
                    }, onerror);
                },

                // “full” details are never used here, so we can just onerror
                full: function(params={}, oncomplite, onerror){
                    onerror();
                },

                // “category” is not used in standard flows here, return empty
                category: function(params={}, oncomplite, onerror){
                    oncomplite({results:[],title:'',more:false});
                },

                // optional cleanup
                clear: function(){}
            };
        }

        // 2.2) Add the “Кинопоиск” button to Lampa’s main menu
        addMenuButton();
    }

    /**
     * 3) The function to fetch from Kinopoisk
     */
    function kpFetch(method, page, onDone, onError){
        // Example method: "api/v2.2/films/top?type=TOP_100_POPULAR_FILMS"
        const base   = 'https://kinopoiskapiunofficial.tech/';
        let   url    = base + method;

        // if no “page=” param is present, add one
        if(!url.includes('page=')){
            url += (url.includes('?') ? '&' : '?') + 'page=' + page;
        }

        const net = new Lampa.Reguest();
        net.timeout(15000);

        net.silent(
            url,
            (json)=>{
                let items = [];
                if(json.items) items = json.items;
                else if(json.films) items = json.films;

                let results = items.map(elem=>{
                    let kp_id   = elem.kinopoiskId || elem.filmId || 0;
                    let poster  = elem.posterUrlPreview || elem.posterUrl || '';
                    let title   = elem.nameRu || elem.nameEn || elem.nameOriginal || 'Без названия';
                    let rating  = elem.ratingKinopoisk || elem.rating || 0;
                    let year    = elem.year ? String(elem.year) : '';

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
                onDone({ results: results, page: page, total_pages: total });
            },
            (err)=>{
                onError(err);
            },
            false,
            {
                headers: { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' }
            }
        );
    }

    /**
     * 4) Show a “Select” with categories
     */
    function openKpCategoriesMenu(){
        Lampa.Select.show({
            title: 'Кинопоиск',
            items: [
                { title: 'Популярные Фильмы',                url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
                { title: 'Топ Фильмы',                       url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
                { title: 'Популярные российские фильмы',     url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
                { title: 'Популярные российские сериалы',    url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
                { title: 'Популярные российские мини-сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES'},
                { title: 'Популярные Сериалы',               url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
                { title: 'Популярные Телешоу',               url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
            ],
            onSelect: (item)=>{
                // push a standard category_full activity, but with our “kp_lite” source
                Lampa.Activity.push({
                    url:        item.url,
                    title:      item.title,
                    component:  'category_full',
                    source:     'kp_lite',
                    card_type:  true,
                    page:       1
                });
            },
            onBack: ()=>{
                Lampa.Controller.toggle('menu');
            }
        });
    }

    /**
     * 5) Add a new button to Lampa’s main menu
     */
    function addMenuButton(){
        const iconKP = `
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
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

        const ITEM_TV_SELECTOR = '[data-action="tv"]';
        const menu = Lampa.Menu.render();

        const newItem = $(`
          <li class="menu__item selector" data-action="kp_plugin_btn">
            <div class="menu__ico">${iconKP}</div>
            <div class="menu__text">Кинопоиск</div>
          </li>
        `);

        newItem.on('hover:enter', ()=>{
            openKpCategoriesMenu();
        });

        // Insert after the "TV" menu item
        menu.find(ITEM_TV_SELECTOR).after(newItem);
    }

})();
