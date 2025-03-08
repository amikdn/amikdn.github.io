(function(){
    'use strict';

    /**
     * 1) Minimal helper to fetch from Kinopoisk
     */
    const KP_API_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616';

    function kpGet(method, onComplete, onError){
        const corsProxy   = 'https://cors.kp556.workers.dev:8443/';
        const baseUrl     = 'https://kinopoiskapiunofficial.tech/';
        const fullUrl     = baseUrl + method;
        const useProxy    = false;

        const network = new Lampa.Reguest();
        network.timeout(15000);

        const requestUrl  = useProxy ? (corsProxy + fullUrl) : fullUrl;
        const requestOpts = { headers: { 'X-API-KEY': KP_API_KEY } };

        network.silent(
            requestUrl,
            (json)=>{ onComplete(json); },
            (err)=>{
                // fallback with proxy if 429
                if(!useProxy && err.status === 429){
                    network.timeout(15000);
                    network.silent(corsProxy+fullUrl,
                        (js)=>{ onComplete(js); },
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
     * 2) Convert a KP item to a Lampa card object
     */
    function kpConvert(item){
        const type  = (!item.type || item.type==='FILM' || item.type==='VIDEO') ? 'movie' : 'tv';
        const id    = item.kinopoiskId || item.filmId || 0;
        const title = item.nameRu || item.nameEn || item.nameOriginal || 'No title';
        const poster= item.posterUrlPreview || item.posterUrl || '';

        return {
            id:       'kp_' + id,
            title:    title,
            release_date:   (item.year ? String(item.year) : ''),
            vote_average:   item.ratingKinopoisk || item.rating || 0,
            poster:         poster,
            img:            poster,
            source:         'kp_plugin',
            overview:       item.description || '',
        };
    }

    /**
     * 3) Load a category from Kinopoisk
     */
    function loadKpCategory(kpMethod, page, onDone, onError){
        let url = kpMethod;
        if(!url.includes('page=')){
            url += (url.includes('?') ? '&' : '?') + 'page=' + page;
        }
        kpGet(url,
            (json)=>{
                let arr = [];
                if(json.items) arr = json.items;
                else if(json.films) arr = json.films;
                const results = arr.map(kpConvert);
                const total   = json.totalPages || json.pagesCount || 1;
                onDone({ results, page, total_pages: total });
            },
            onError
        );
    }

    /**
     * 4) Define custom activity “kp_category” using Lampa.Activity.extend()
     *    so older Lampa versions won't throw “directive is not a function”.
     */
    Lampa.Activity.extend('kp_category', function(){
        let html, scroll, infobox;
        let state = {
            method: '',
            title:  '',
            page:   1,
            total:  1,
            lastData: []
        };

        /**
         * This “create” method is called automatically by Lampa after activity is constructed.
         */
        this.create = ()=>{
            this.activity.loader(true);

            // standard list template
            html    = Lampa.Template.js('list');
            scroll  = new Lampa.Scroll({ mask:true, over:true });
            scroll.render().addClass('layer--wheight');
            infobox = Lampa.Template.js('list_info');

            html.find('.list__sort').append(infobox);

            // do loading
            loadKpCategory(
                state.method,
                state.page,
                (data)=>{
                    state.total = data.total_pages;
                    state.lastData = data.results;
                    this.build(data.results);
                },
                (err)=>{
                    this.empty();
                }
            );
        };

        /**
         * “start” is called automatically, with the same “params” that were used in Activity.push
         * e.g. { url:..., title:..., page:1, component:'kp_category' }
         */
        this.start = (params)=>{
            state.method = params.url || '';
            state.title  = params.title || 'Кинопоиск';
            state.page   = params.page  || 1;
            this.activity.poster = ''; // no poster
        };

        this.build = (items)=>{
            this.activity.loader(false);

            if(!items || !items.length){
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
                card.on('hover:focus', ()=>{
                    scroll.update(card);
                });
                card.on('hover:enter', ()=>{
                    // open modal or do something
                    Lampa.Modal.open({
                        title: elem.title,
                        html:  Lampa.Template.js('about', { text: elem.overview || '—' }),
                        size:  'medium',
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
        };

        this.empty = ()=>{
            let empty = Lampa.Template.js('list_empty');
            html.find('.list__body').empty().append(empty);
            this.activity.toggle();
        };

        /**
         * “render” must return the main HTML of the activity
         */
        this.render = ()=>{
            return html;
        };

        this.pause = ()=>{};
        this.resume= ()=>{};

        /**
         * “back” is called when user presses back
         */
        this.back = ()=>{
            Lampa.Activity.backward();
        };

        /**
         * “destroy” is called when activity is destroyed
         */
        this.destroy = ()=>{
            scroll.destroy();
            html.remove();
            infobox.remove();
        };
    });

    /**
     * 5) Show categories in a Lampa.Select
     */
    function openKpCategoriesMenu(){
        Lampa.Select.show({
            title: 'Кинопоиск',
            items: [
                { title:'Популярные Фильмы',  url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
                { title:'Топ Фильмы',         url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
                { title:'Популярные российские фильмы',  url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
                { title:'Популярные российские сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
                { title:'Популярные Сериалы', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
                { title:'Популярные Телешоу', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
            ],
            onSelect: (item)=>{
                // push activity
                Lampa.Activity.push({
                    url:   item.url,
                    title: item.title,
                    page:  1,
                    component: 'kp_category'
                });
            },
            onBack: ()=>{
                Lampa.Controller.toggle('menu');
            }
        });
    }

    /**
     * 6) Add “Кинопоиск” button to the main menu
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

    // 7) Wait for app to be ready, then add button
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
