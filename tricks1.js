(function(){
    'use strict';

    /**
     * Minimal helper for making requests to kinopoiskapiunofficial.tech,
     * with the user’s own API key.  If you have a different key, replace below.
     */
    const KP_API_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616';

    // Basic GET function with optional CORS proxy
    function kpGet(method, onComplete, onError){
        const corsProxy   = 'https://cors.kp556.workers.dev:8443/'; 
        const baseUrl     = 'https://kinopoiskapiunofficial.tech/';
        const fullUrl     = baseUrl + method;
        const useProxy    = false; // set to true if you want to force the CORS proxy

        // Lampa’s built‐in Reguest
        const network = new Lampa.Reguest();
        network.timeout(15000);

        const requestUrl  = useProxy ? (corsProxy + fullUrl) : fullUrl;
        const requestOpts = { 
            headers: { 'X-API-KEY': KP_API_KEY }
        };

        network.silent(
            requestUrl,
            (json)=>{
                onComplete(json);
            },
            (err)=>{
                // fallback attempt with proxy if not used yet
                if(!useProxy && err.status === 429){
                    const secondUrl = corsProxy + fullUrl;
                    network.timeout(15000);
                    network.silent(secondUrl,
                        (js)=>{
                            onComplete(js);
                        },
                        (e)=>{ onError(e); },
                        false,
                        requestOpts
                    );
                }
                else onError(err);
            },
            false,
            requestOpts
        );
    }

    /**
     * Convert one KP item to Lampa’s standard card object
     */
    function kpConvert(item){
        const type = (!item.type || item.type==='FILM' || item.type==='VIDEO') ? 'movie' : 'tv';
        const id   = item.kinopoiskId || item.filmId || 0;
        const title= item.nameRu || item.nameEn || item.nameOriginal || 'No title';
        const poster= item.posterUrlPreview || item.posterUrl || '';

        return {
            id:       'kp_' + id,
            title:    title,
            original_title: item.nameOriginal || '',
            release_date:   (item.year ? String(item.year) : ''),
            vote_average:   item.ratingKinopoisk || item.rating || 0,
            poster:         poster,
            img:            poster,      // Lampa also uses “img”
            source:         'kp_plugin', // for reference
            // overview etc. can be added:
            overview:       item.description || '',
            // ...
        };
    }

    /**
     * Load a category from Kinopoisk:
     * e.g.  top-100, top-250, or “api/v2.2/films?order=NUM_VOTE&type=TV_SERIES” etc.
     * Then convert results into Lampa card array.
     */
    function loadKpCategory(kpMethod, page, onDone, onError){
        // we add page param if needed
        // for top-lists: “?page=2” or for “api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=2”
        let url = kpMethod;
        if(!url.includes('page=')){
            url += (url.includes('?') ? '&' : '?') + 'page=' + page;
        }

        kpGet(url,
            (json)=>{
                // Usually items are in json.items or json.films
                let arr = [];
                if(json.items) arr = json.items;
                else if(json.films) arr = json.films;
                // convert each item
                const results = arr.map(kpConvert);
                // total pages
                const total = json.totalPages || json.pagesCount || 1;

                onDone({
                    results: results,
                    page:    page,
                    total_pages: total
                });
            },
            onError
        );
    }

    /**
     * Our custom Activity “kp_category” which shows items from a chosen Kinopoisk method in Lampa’s card grid.
     */
    function createKpCategoryActivity(){
        // Use standard Lampa component logic
        let html, scroll, infobox;
        let state = {
            method: '',     // e.g. “api/v2.2/films/top?type=TOP_100_POPULAR_FILMS”
            title:  '',
            page:   1,
            total:  1,
            filter: {},
            lastData: []
        };

        return {
            // Called once when created
            create(){
                this.activity.loader(true);

                html   = Lampa.Template.js('list');  // standard card-list layout
                scroll = new Lampa.Scroll({ mask: true, over: true });
                scroll.render().addClass('layer--wheight');
                infobox= Lampa.Template.js('list_info');

                // Put info top
                html.find('.list__sort').append(infobox);

                // Wait for method, then load data
                this.load();
            },

            // Called from outside to pass {url, title, page} etc
            start(params){
                // e.g. params.url= 'api/v2.2/films/top?type=TOP_250_BEST_FILMS'
                state.method = params.url || '';
                state.title  = params.title || 'Kinopoisk';
                state.page   = params.page || 1;
                this.activity.poster = '';  // no poster for the list
            },

            load(){
                loadKpCategory(
                    state.method, 
                    state.page,
                    (data)=>{
                        state.total = data.total_pages;
                        state.lastData = data.results;

                        // build card items
                        this.build(data.results);
                    },
                    (err)=>{
                        this.empty();
                    }
                );
            },

            build(items){
                this.activity.loader(false);

                if(!items.length){
                    this.empty();
                    return;
                }

                items.forEach(elem=>{
                    let card = Lampa.Template.js('card', { 
                        title: elem.title, 
                        release_year: (elem.release_date || '').slice(0,4),
                        vote_average: elem.vote_average 
                    });

                    card.find('.card__img').attr('src', elem.poster || './img/img_broken.svg');
                    card.on('hover:focus',(evt)=>{
                        // focus
                        scroll.update(card);
                    });
                    card.on('hover:enter',(evt)=>{
                        // open item details
                        Lampa.Modal.open({
                            title: elem.title,
                            html: Lampa.Template.js('about',{ text:elem.overview || '—'}),
                            size: 'medium',
                            onBack:()=>{
                                Lampa.Modal.close();
                                Lampa.Controller.toggle('content');
                            }
                        });
                    });

                    scroll.append(card);
                });

                html.find('.list__body').empty().append(scroll.render());
                this.activity.toggle();
            },

            empty(){
                let empty = Lampa.Template.js('list_empty');
                html.find('.list__body').empty().append(empty);
                this.activity.toggle();
            },

            // handle “back” or other
            back(){
                Lampa.Activity.backward();
            },

            render(){
                return html;
            },

            pause(){},
            resume(){},
            destroy(){
                scroll.destroy();
                html.remove();
                infobox.remove();
            }
        };
    }

    // Register our custom “kp_category” as an Activity factory
    Lampa.Activity.directive('kp_category', createKpCategoryActivity);

    /**
     * Show a custom menu of categories with large icons, then open the “kp_category” activity.
     * You can style the HTML or add more categories as you like.
     */
    function openKpCategoriesMenu(){
        // We create an Activity with big clickable icons, or you can do a simpler Lampa.Select
        // Here is a simple approach with Lampa.Select, each item -> onSelect => push “kp_category”

        Lampa.Select.show({
            title: 'Кинопоиск',
            items: [
                {
                    title: 'Популярные Фильмы',
                    url:   'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'
                },
                {
                    title: 'Топ Фильмы',
                    url:   'api/v2.2/films/top?type=TOP_250_BEST_FILMS'
                },
                {
                    title: 'Популярные российские фильмы',
                    url:   'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'
                },
                {
                    title: 'Популярные российские сериалы',
                    url:   'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES'
                },
                {
                    title: 'Популярные Сериалы',
                    url:   'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES'
                },
                {
                    title: 'Популярные Телешоу',
                    url:   'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW'
                }
            ],
            onSelect: (item)=>{
                Lampa.Activity.push({
                    url:     item.url,
                    title:   item.title,
                    page:    1,
                    component: 'kp_category'  // our custom
                });
            },
            onBack: ()=>{
                Lampa.Controller.toggle('menu');
            }
        });
    }

    /**
     * Add a button “Кинопоиск” to Lampa’s main menu after the “TV” item.
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

        menu.find(ITEM_TV_SELECTOR).after(newItem);
    }

    // If app is already ready, just do it; else wait
    if(window.appready){
        addMenuButton();
    }
    else{
        Lampa.Listener.follow('app',(e)=>{
            if(e.type==='ready'){
                addMenuButton();
            }
        });
    }
})();
