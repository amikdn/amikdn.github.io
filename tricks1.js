(function(){
    'use strict';

    /**
     * ================================
     * 1) Создаём источник "KP"
     * ================================
     */
    var network = new Lampa.Reguest();
    var cache = {};
    var total_cnt = 0;
    var proxy_cnt = 0;
    var good_cnt  = 0;

    var menu_list    = [];      // фильтры (жанры и т.п.)
    var genres_map   = {};
    var countries_map= {};

    var CACHE_SIZE   = 100;
    var CACHE_TIME   = 1000*60*60;

    var SOURCE_NAME  = 'KP';    // Внутреннее имя источника
    var SOURCE_TITLE = 'Кинопоиск'; // Как будет отображаться в списке источников

    // Заглушка, чтобы поиск не ломался
    function discovery_start_typing(query, onComplete){
        // Возвращаем пустые результаты
        onComplete([]);
    }

    // Запрос к kinopoiskapiunofficial
    function get(method, oncomplite, onerror){
        var use_proxy = (total_cnt>=10 && good_cnt>total_cnt/2);
        if(!use_proxy) total_cnt++;

        var kp_prox = 'https://cors.kp556.workers.dev:8443/';
        var url = 'https://kinopoiskapiunofficial.tech/' + method;

        network.timeout(15000);
        network.silent(
            (use_proxy ? kp_prox : '') + url,
            function(json){
                oncomplite(json);
            },
            function(a,c){
                use_proxy = !use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
                if(use_proxy && (a.status==429 || (a.status==0 && a.statusText!=='timeout'))){
                    proxy_cnt++;
                    network.timeout(15000);
                    network.silent(
                        kp_prox+url,
                        function(j){
                            good_cnt++;
                            oncomplite(j);
                        },
                        onerror,
                        false,
                        {headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}}
                    );
                }
                else onerror(a,c);
            },
            false,
            {headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}}
        );
    }

    // Кэш
    function getCache(key){
        var r = cache[key];
        if(r){
            var now = Date.now();
            var old = now - CACHE_TIME;
            if(r.timestamp>old) return r.value;

            // иначе чистим устаревшее
            for(var k in cache){
                var node=cache[k];
                if(!node || node.timestamp<old){
                    delete cache[k];
                }
            }
        }
        return null;
    }
    function setCache(key, value){
        var now = Date.now();
        var size=Object.keys(cache).length;
        if(size>=CACHE_SIZE){
            // почистим
            var old= now - CACHE_TIME;
            for(var k in cache){
                var node=cache[k];
                if(!node || node.timestamp<old) delete cache[k];
            }
            size=Object.keys(cache).length;
            if(size>=CACHE_SIZE){
                // грубо
                var stamps=[];
                for(var kk in cache){
                    stamps.push(cache[kk].timestamp);
                }
                stamps.sort((a,b)=>a-b);
                var limit= stamps[Math.floor(stamps.length/2)];
                for(var kk2 in cache){
                    if(cache[kk2].timestamp<limit) delete cache[kk2];
                }
            }
        }
        cache[key]={timestamp: now, value:value};
    }
    function getFromCache(method, oncomplite, onerror){
        var c = getCache(method);
        if(c){
            setTimeout(()=>oncomplite(c,true),10);
        }
        else{
            get(method, oncomplite, onerror);
        }
    }
    function clearNetwork(){
        network.clear();
    }

    // Преобразование элемента
    function convertElem(elem){
        // FILM => movie, TV_SERIES => tv
        var type = (!elem.type || elem.type==='FILM' || elem.type==='VIDEO') ? 'movie':'tv';
        var kinopoisk_id= elem.kinopoiskId||elem.filmId||0;
        var kp_rating   = +elem.rating|| +elem.ratingKinopoisk||0;
        var title       = elem.nameRu||elem.nameEn||elem.nameOriginal||'';
        var orig        = elem.nameOriginal||elem.nameEn||elem.nameRu||'';
        var adult       = false;

        var obj = {
            source: SOURCE_NAME,
            type,
            adult:false,
            id: SOURCE_NAME+'_'+kinopoisk_id,
            title,
            original_title: orig,
            overview: elem.description||elem.shortDescription||'',
            img: elem.posterUrlPreview||elem.posterUrl||'',
            background_image: elem.coverUrl||elem.posterUrl||'',
            genres: [],
            production_companies:[],
            production_countries:[],
            vote_average: kp_rating,
            vote_count:   elem.ratingVoteCount||elem.ratingKinopoiskVoteCount||0,
            kinopoisk_id,
            kp_rating,
            imdb_id: elem.imdbId||'',
            imdb_rating: elem.ratingImdb||0
        };

        // Жанры
        if(elem.genres){
            var arr=[];
            elem.genres.forEach(g=>{
                if(g.genre==='для взрослых') adult=true;
                arr.push({
                    id:(genres_map[g.genre]||0),
                    name: g.genre,
                    url:''
                });
            });
            obj.genres=arr;
        }
        // Страны
        if(elem.countries){
            var c=[];
            elem.countries.forEach(a=>{
                c.push({name:a.country});
            });
            obj.production_countries=c;
        }
        // adult
        obj.adult=adult;

        // Пример: год
        var first_air_date=(elem.year && elem.year!=='null')?elem.year:'';
        var last_air_date = '';
        if(type==='tv'){
            if(elem.startYear && elem.startYear!=='null') first_air_date=elem.startYear;
            if(elem.endYear   && elem.endYear!=='null')   last_air_date=elem.endYear;
        }
        if(type==='tv'){
            obj.name= title;
            obj.original_name=orig;
            obj.first_air_date= first_air_date;
            if(last_air_date) obj.last_air_date= last_air_date;
        }
        else{
            obj.release_date= first_air_date;
        }

        return obj;
    }

    // Вспомогательный метод "getList"
    function getList(method, params, oncomplite, onerror){
        var url= method;
        if(params.query){
            try{
                var dec = decodeURIComponent(params.query).trim();
                if(!dec){
                    onerror();
                    return;
                }
                url+=( url.indexOf('?')>=0?'&':'?' )+'keyword='+ encodeURIComponent(dec);
            }catch(e){
                onerror();
                return;
            }
        }
        var page= params.page||1;
        url+=( url.indexOf('?')>=0?'&':'?' )+'page='+page;

        getFromCache(url,(json,cached)=>{
            var items=[];
            if(json.items && json.items.length) items=json.items;
            else if(json.films && json.films.length) items=json.films;
            else if(json.releases && json.releases.length) items=json.releases;

            if(!cached && items.length) setCache(url,json);

            var results= items.map(convertElem).filter(e=>!e.adult);
            var total_pages= json.pagesCount||json.totalPages||1;

            oncomplite({
                results,
                url:method,
                page,
                total_pages,
                total_results:0,
                more:(total_pages>page)
            });
        }, onerror);
    }

    /**
     * 2) Пишем функции, которые Lampa ждёт: main, list, full, category, search, etc.
     */
    // main
    function main(params={}, oncomplite, onerror){
        // Например, выдадим 2 подборки
        var tasks=[
            (call)=>{
                getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS', params,(json)=>{
                    json.title='Популярное (100)';
                    call(json);
                }, call);
            },
            (call)=>{
                getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS', params,(json)=>{
                    json.title='Топ 250';
                    call(json);
                }, call);
            }
        ];
        var parts_limit=5;

        function loadPart(partLoaded, partEmpty){
            Lampa.Api.partNext(tasks, parts_limit, partLoaded, partEmpty);
        }
        // Загрузим фильтры
        menu({},()=>{
            loadPart(oncomplite, onerror);
        });
        return loadPart;
    }

    // list
    function list(params={}, oncomplite, onerror){
        var method = params.url;
        if(!method && params.genres){
            method='api/v2.2/films?order=NUM_VOTE&genres='+params.genres;
        }
        getList(method, params, oncomplite, onerror);
    }

    // full
    function _getById(id, params, oncomplite, onerror){
        var url='api/v2.2/films/'+id;
        var film=getCache(url);
        if(film){
            setTimeout(()=> oncomplite( convertElem(film) ),10);
        }
        else{
            get(url,(f)=>{
                if(f.kinopoiskId){
                    oncomplite( convertElem(f) );
                }
                else onerror();
            }, onerror);
        }
    }
    function full(params={}, oncomplite, onerror){
        // ищем id
        var kinopoisk_id='';
        if(params.card && params.card.source===SOURCE_NAME){
            if(params.card.kinopoisk_id) kinopoisk_id=params.card.kinopoisk_id;
            else{
                // например "KP_12345"
                let sid= (params.card.id+'');
                if(sid.indexOf(SOURCE_NAME+'_')===0){
                    kinopoisk_id= sid.substring(SOURCE_NAME.length+1);
                    params.card.kinopoisk_id= kinopoisk_id;
                }
            }
        }
        if(!kinopoisk_id) {
            onerror();
            return;
        }
        // грузим
        menu({},()=>{
            _getById(kinopoisk_id, params, (json)=>{
                // Lampa требует: onComplite нужно передавать объект через new Lampa.Status
                let status= new Lampa.Status(4);
                status.onComplite= oncomplite;
                // "movie" "persons" "collection" "simular"
                status.append('movie',json);
                status.append('persons',json && json.persons);
                status.append('collection',json && json.collection);
                status.append('simular',json && json.simular);
            }, onerror);
        });
    }

    // category
    function category(params={}, oncomplite, onerror){
        // можно вывести "continues" + "recomends", но для простоты пусто
        var tasks=[
            (call)=>{
                call({results:[], title:'(KP) Пустая категория'});
            }
        ];
        var parts_limit=3;
        function loadPart(partLoaded, partEmpty){
            Lampa.Api.partNext(tasks, parts_limit, partLoaded, partEmpty);
        }
        menu({},()=>{
            loadPart(oncomplite, onerror);
        });
        return loadPart;
    }

    // search
    function search(params={}, oncomplite){
        // Поиск. Разделим на movie/tv
        var st= new Lampa.Status(1);
        st.onComplite=(data)=>{
            let items=[];
            if(data.query && data.query.results){
                let all = data.query.results;
                let mov = all.filter(e=> e.type==='movie');
                let tv  = all.filter(e=> e.type==='tv');
                if(mov.length) items.push({results:mov, title:'Фильмы (KP)', type:'movie'});
                if(tv.length)  items.push({results:tv,  title:'Сериалы (KP)', type:'tv'});
            }
            oncomplite(items);
        };
        // делаем запрос
        getList('api/v2.1/films/search-by-keyword', params, (json)=>{
            st.append('query', json);
        }, st.error.bind(st));
    }

    // discovery
    function discovery(){
        return {
            title: SOURCE_TITLE,
            search,  // функция
            // метод, чтобы не ломался поиск
            start_typing: discovery_start_typing,
            params:{ align_left:true, object:{ source: SOURCE_NAME } },
            onMore:(params)=>{
                // при нажатии "Показать ещё"
                Lampa.Activity.push({
                    url: 'api/v2.1/films/search-by-keyword',
                    title: 'Поиск (KP) - '+params.query,
                    component:'category_full',
                    page:1,
                    query:encodeURIComponent(params.query),
                    source: SOURCE_NAME
                });
            },
            onCancel: clearNetwork
        };
    }

    // person
    function person(params={}, oncomplite){
        // заглушка
        oncomplite({});
    }

    // menu
    function menu(options, oncomplite){
        if(menu_list.length){
            oncomplite(menu_list);
        }
        else{
            get('api/v2.2/films/filters',(j)=>{
                if(j.genres){
                    j.genres.forEach(g=>{
                        menu_list.push({
                            id:g.id,
                            title:g.genre,
                            url:'',
                            hide:(g.genre==='для взрослых'),
                            separator:(!g.genre)
                        });
                        genres_map[g.genre]= g.id;
                    });
                }
                if(j.countries){
                    j.countries.forEach(c=>{
                        countries_map[c.country]= c.id;
                    });
                }
                oncomplite(menu_list);
            },()=>{
                oncomplite([]);
            });
        }
    }
    // seasons, menuCategory
    function seasons(tv, from, oncomplite){
        // заглушка
        oncomplite({});
    }
    function menuCategory(params, oncomplite){
        oncomplite([]);
    }

    // Собираем объект источника
    var KP_PLUGIN = {
        SOURCE_NAME,
        SOURCE_TITLE,
        main,
        list,
        full,
        category,
        search,
        person,
        menu,
        seasons,
        menuCategory,
        clear: clearNetwork,
        discovery: discovery()
    };


    /**
     * ================================
     * 3) Регистрируем источник "KP"
     * ================================
     */
    function registerKP(){
        if(Lampa.Api.sources[SOURCE_NAME]){
            // уже зарегистрирован
            Lampa.Noty.show('Источник «KP» уже есть, конфликт!');
            return;
        }
        Lampa.Api.sources[SOURCE_NAME] = KP_PLUGIN;
        Object.defineProperty(Lampa.Api.sources, SOURCE_NAME, {
            get(){ return KP_PLUGIN; }
        });

        // добавим в Params (список источников)
        var sources;
        if(Lampa.Params.values && Lampa.Params.values.source){
            sources = Object.assign({}, Lampa.Params.values.source);
            sources[SOURCE_NAME] = SOURCE_TITLE;
        }
        else{
            sources = {};
            // какие есть в Api
            for(var k in Lampa.Api.sources){
                if(k==='tmdb'||k==='cub'||k==='pub'||k==='filmix'){
                    sources[k] = k.toUpperCase();
                }
            }
            sources[SOURCE_NAME]=SOURCE_TITLE;
        }
        // по умолчанию оставим tmdb
        Lampa.Params.select('source', sources, 'tmdb');
    }

    /**
     * ================================
     * 4) Компонент Activity с категориями
     * ================================
     */
    Lampa.Component.add('kp_menu_custom',{
        // create
        create(){
            let _this=this;
            this.html = document.createElement('div');
            this.html.classList.add('kp-menu-custom');

            // список категорий
            let cats = [
                {title:'Популярные Фильмы', url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'},
                {title:'Топ Фильмы (250)', url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS'},
                {title:'Росс. фильмы',     url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'},
                {title:'Росс. сериалы',    url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES'},
            ];

            cats.forEach(cat=>{
                let item=document.createElement('div');
                item.classList.add('selector','kp-cat-item');
                item.textContent= cat.title;
                item.addEventListener('hover:enter',()=>{
                    Lampa.Activity.push({
                        url: cat.url,
                        title: cat.title,
                        component: 'category_full',
                        source: SOURCE_NAME,
                        card_type:true,
                        page:1
                    });
                });
                this.html.appendChild(item);
            });

            this.addBlock(this.html);

            this.start = ()=>{
                // когда откроется
                Lampa.Controller.toggle('content');
            };
        },
        back(){
            // кнопка "назад"
            Lampa.Controller.toggle('menu');
        }
    });

    /**
     * ================================
     * 5) Кнопка «Кинопоиск» в меню
     * ================================
     */
    function addMenuButton(){
        const ITEM_TV_SELECTOR='[data-action="tv"]';

        let icon=`
          <svg width="32" height="32" viewBox="0 0 192 192" fill="currentColor">
            <g fill-rule="evenodd">
              <path d="M20,4H172a16,16,0,0,1,16,16V172a16,16,0,0,1-16,16H20a16,16,0,0,1-16-16V20A16,16,0,0,1,20,4Z" fill="currentColor"/>
              <path d="M96.5,20,66.1,75.733V20H40.767V172H66.1V116.267L96.5,172h35.467C116.767,153.422,95.2,133.578,80,115c28.711,16.889,63.789,35.044,92.5,51.933v-30.4C148.856,126.4,108.644,115.133,85,105c23.644,3.378,63.856,7.889,87.5,11.267v-30.4L85,90c27.022-11.822,60.478-22.711,87.5-34.533v-30.4C143.789,41.956,108.711,63.11,80,80Z" fill="#000" />
            </g>
          </svg>
        `;

        let li=document.createElement('li');
        li.classList.add('menu__item','selector');
        li.innerHTML=`
          <div class="menu__ico">${icon}</div>
          <div class="menu__text">Кинопоиск</div>
        `;
        li.addEventListener('hover:enter',()=>{
            // Открываем нашу компоненту
            Lampa.Activity.push({
                title:'Кинопоиск',
                component:'kp_menu_custom',
                page:1
            });
        });

        let tv_item=Lampa.Menu.render().querySelector(ITEM_TV_SELECTOR);
        if(tv_item && tv_item.parentNode){
            tv_item.parentNode.insertBefore(li, tv_item.nextSibling);
        }
    }

    /**
     * ================================
     * 6) Инициализация плагина
     * ================================
     */
    function init(){
        registerKP();
        addMenuButton();
    }

    if(window.appready){
        init();
    }
    else{
        Lampa.Listener.follow('app',function(e){
            if(e.type==='ready'){
                init();
            }
        });
    }

})();
