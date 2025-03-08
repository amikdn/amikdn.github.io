(function(){
    'use strict';

    /**
     * ==========================================
     * 1) ОБЪЯВЛЯЕМ ИСТОЧНИК "KP" (переработка кода)
     * ==========================================
     */
    var network = new Lampa.Reguest();
    var cache = {};
    var total_cnt = 0;
    var proxy_cnt = 0;
    var good_cnt = 0;
    var menu_list = [];
    var genres_map = {};
    var countries_map = {};
    var CACHE_SIZE = 100;
    var CACHE_TIME = 1000 * 60 * 60;
    var SOURCE_NAME = 'KP';
    var SOURCE_TITLE = 'KP';

    // Простейшая функция "start_typing", чтобы поиск не ломался
    // (Lampa ждёт, что discovery имеет такой метод).
    function discovery_start_typing(query, onComplete){
        // Возвращаем пустой массив результатов
        onComplete([]);
    }

    // Запросы к kinopoiskapiunofficial.tech
    function get(method, oncomplite, onerror) {
        var use_proxy = total_cnt >= 10 && good_cnt > total_cnt / 2;
        if(!use_proxy) total_cnt++;
        var kp_prox = 'https://cors.kp556.workers.dev:8443/';
        var url = 'https://kinopoiskapiunofficial.tech/' + method;

        network.timeout(15000);
        network.silent(
            (use_proxy ? kp_prox : '') + url,
            function (json) {
                oncomplite(json);
            },
            function(a,c){
                use_proxy = !use_proxy && (proxy_cnt < 10 || good_cnt > proxy_cnt/2);
                if(use_proxy && (a.status==429 || (a.status==0 && a.statusText!=='timeout'))){
                    proxy_cnt++;
                    network.timeout(15000);
                    network.silent(
                        kp_prox + url,
                        function (json) {
                            good_cnt++;
                            oncomplite(json);
                        },
                        onerror,
                        false,
                        { headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
                    );
                }
                else onerror(a,c);
            },
            false,
            { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
        );
    }

    function getCache(key){
        var res = cache[key];
        if(res){
            var cache_timestamp = Date.now() - CACHE_TIME;
            if(res.timestamp > cache_timestamp) return res.value;
            // else чистим устаревшее
            for(var ID in cache){
                var node = cache[ID];
                if(!node || node.timestamp <= cache_timestamp){
                    delete cache[ID];
                }
            }
        }
        return null;
    }

    function setCache(key, value){
        var timestamp = Date.now();
        var size = Object.keys(cache).length;
        if(size >= CACHE_SIZE){
            var cache_timestamp = timestamp - CACHE_TIME;
            // почистим
            for(var ID in cache){
                var node = cache[ID];
                if(!node || node.timestamp <= cache_timestamp){
                    delete cache[ID];
                }
            }
            size = Object.keys(cache).length;
            if(size >= CACHE_SIZE){
                // в лоб
                var timestamps = [];
                for(var _ID in cache){
                    var _node = cache[_ID];
                    timestamps.push(_node.timestamp || 0);
                }
                timestamps.sort(function(a,b){return a-b});
                cache_timestamp = timestamps[Math.floor(timestamps.length/2)];
                for(var _ID2 in cache){
                    var _node2 = cache[_ID2];
                    if(!_node2 || _node2.timestamp<=cache_timestamp) delete cache[_ID2];
                }
            }
        }
        cache[key] = {timestamp, value};
    }

    function getFromCache(method, oncomplite, onerror){
        var json = getCache(method);
        if(json){
            setTimeout(()=>oncomplite(json,true),10);
        }
        else{
            get(method, oncomplite, onerror);
        }
    }

    function clearNetwork(){
        network.clear();
    }

    // Преобразование данных KP => формат Lampa
    function convertElem(elem){
        // FILM / VIDEO => movie, TV_SERIES => tv
        var type = (!elem.type || elem.type==='FILM' || elem.type==='VIDEO') ? 'movie' : 'tv';
        var kinopoisk_id = elem.kinopoiskId || elem.filmId || 0;
        var kp_rating = +elem.rating || +elem.ratingKinopoisk || 0;
        var title = elem.nameRu || elem.nameEn || elem.nameOriginal || '';
        var original_title = elem.nameOriginal || elem.nameEn || elem.nameRu || '';
        var adult = false;

        var result = {
            source: SOURCE_NAME,
            type: type,
            adult: false,
            id: SOURCE_NAME+'_'+kinopoisk_id,
            title: title,
            original_title: original_title,
            overview: elem.description || elem.shortDescription || '',
            img: elem.posterUrlPreview || elem.posterUrl || '',
            background_image: elem.coverUrl || elem.posterUrl || elem.posterUrlPreview || '',
            genres: [],
            production_companies: [],
            production_countries: [],
            vote_average: kp_rating,
            vote_count: elem.ratingVoteCount || elem.ratingKinopoiskVoteCount || 0,
            kinopoisk_id: kinopoisk_id,
            kp_rating: kp_rating,
            imdb_id: elem.imdbId || '',
            imdb_rating: elem.ratingImdb || 0
        };

        // genres
        if(elem.genres){
            var a_genres = [];
            elem.genres.forEach(g=>{
                if(g.genre==='для взрослых') adult=true;
                a_genres.push({
                    id: (genres_map[g.genre]||0),
                    name: g.genre,
                    url: ''
                });
            });
            result.genres = a_genres;
        }
        // countries
        if(elem.countries){
            var a_countries = [];
            elem.countries.forEach(c=>{
                a_countries.push({name:c.country});
            });
            result.production_countries = a_countries;
        }
        // adult?
        result.adult = adult;

        // year / date
        var first_air_date = (elem.year && elem.year!=='null') ? elem.year : '';
        var last_air_date  = '';
        if(type==='tv'){
            if(elem.startYear && elem.startYear!=='null') first_air_date=elem.startYear;
            if(elem.endYear && elem.endYear!=='null')   last_air_date=elem.endYear;
        }
        // distributions => maybe set first_air_date
        // ... (пропускаем детали)
        if(type==='tv'){
            result.name = title;
            result.original_name = original_title;
            result.first_air_date = first_air_date;
            if(last_air_date) result.last_air_date=last_air_date;
        }
        else{
            result.release_date= first_air_date;
        }

        return result;
    }

    // Запрос списка (search, category, etc.)
    function getList(method, params={}, oncomplite, onerror){
        var url = method;
        if(params.query){
            // keyword=...
            try{
                var clean_query = decodeURIComponent(params.query).trim();
                if(!clean_query) {
                    onerror();
                    return;
                }
                // encode
                url += (url.indexOf('?')>=0 ? '&':'?')+'keyword='+ encodeURIComponent(clean_query);
            }catch(e){
                onerror();
                return;
            }
        }
        var page = params.page||1;
        url += (url.indexOf('?')>=0 ? '&':'?')+'page='+page;

        getFromCache(url,(json,cached)=>{
            var items = [];
            if(json.items && json.items.length) items=json.items;
            else if(json.films && json.films.length) items=json.films;
            else if(json.releases && json.releases.length) items=json.releases;
            if(!cached && items.length) setCache(url,json);

            var results = items.map(convertElem).filter(e=>!e.adult);
            var total_pages = json.pagesCount || json.totalPages || 1;

            oncomplite({
                results,
                url: method,
                page: page,
                total_pages: total_pages,
                total_results: 0,
                more: (total_pages>page)
            });
        }, onerror);
    }

    // Получить детали
    function _getById(id, params, oncomplite, onerror){
        var url='api/v2.2/films/'+id;
        var film=getCache(url);
        if(film){
            setTimeout(()=>oncomplite(convertElem(film)),10);
        }
        else{
            get(url, (film)=>{
                if(film.kinopoiskId){
                    // tv => seasons?
                    var type = (!film.type || film.type==='FILM'||film.type==='VIDEO') ? 'movie':'tv';
                    // ... можно запрашивать seasons, similars, etc.
                    // чтобы не усложнять, уберём, либо оставим пример
                    oncomplite(convertElem(film));
                }
                else onerror();
            }, onerror);
        }
    }
    function getById(id, params={}, oncomplite, onerror){
        // перед получением деталей грузим фильтры
        menu({},()=>{
            _getById(id, params, oncomplite, onerror);
        });
    }

    // Основная "главная" (вызов при source:KP) - обычно Lampa может звать "main"
    function main(params={}, oncomplite, onerror){
        // просто набор популярных
        var parts_data = [
            (call)=>{
                getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS', params, (json)=>{
                    json.title='Популярные фильмы (TOP_100)';
                    call(json);
                }, call);
            },
            (call)=>{
                getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS', params, (json)=>{
                    json.title='Топ 250 фильмов';
                    call(json);
                }, call);
            }
        ];
        var parts_limit=5;
        function loadPart(partLoaded, partEmpty){
            Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
        }
        menu({},()=>{
            loadPart(oncomplite, onerror);
        });
        return loadPart;
    }

    // Категории
    function category(params={}, oncomplite, onerror){
        // просто "заглушка"
        // можно вывести, например, "continues" + "recomends"
        var parts_data = [
            (call)=>{
                call({results:[], title:'(KP) Пустая категория'});
            }
        ];
        var parts_limit=3;
        function loadPart(partLoaded, partEmpty){
            Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
        }
        menu({},()=>{
            loadPart(oncomplite, onerror);
        });
        return loadPart;
    }

    // Поиск
    function search(params={}, oncomplite){
        // делим на movie/tv
        var status = new Lampa.Status(1);
        status.onComplite = (data)=>{
            let items=[];
            if(data.query && data.query.results){
                // Разделим на movie/tv
                let all = data.query.results;
                let mov = all.filter(e=> e.type==='movie');
                let tv  = all.filter(e=> e.type==='tv');
                if(mov.length) items.push({results: mov, title:'Фильмы (KP)', type:'movie'});
                if(tv.length)  items.push({results: tv,  title:'Сериалы (KP)',type:'tv'});
            }
            oncomplite(items);
        };
        // Запрос
        getList('api/v2.1/films/search-by-keyword', params, (json)=>{
            status.append('query', json);
        }, status.error.bind(status));
    }

    // discovery
    function discovery(){
        return {
            title: SOURCE_TITLE,
            search: search,
            // заглушка start_typing
            start_typing: discovery_start_typing,
            params:{ align_left:true, object:{ source:SOURCE_NAME } },
            onMore:(params)=>{
                Lampa.Activity.push({
                    url: 'api/v2.1/films/search-by-keyword',
                    title: 'Поиск - '+params.query,
                    component: 'category_full',
                    page:1,
                    query: encodeURIComponent(params.query),
                    source: SOURCE_NAME
                });
            },
            onCancel: network.clear.bind(network)
        };
    }

    // Персона (не обязательно)
    function person(params={}, oncomplite){
        // заглушка
        oncomplite({});
    }

    // Меню-фильтры
    function menu(options, oncomplite){
        if(menu_list.length){
            oncomplite(menu_list);
        }
        else{
            get('api/v2.2/films/filters',(j)=>{
                // Заполним genres_map, countries_map
                if(j.genres){
                    j.genres.forEach(g=>{
                        menu_list.push({
                            id:g.id,
                            title:g.genre,
                            url:'',
                            hide:(g.genre==='для взрослых'),
                            separator:(!g.genre)
                        });
                        genres_map[g.genre]=g.id;
                    });
                }
                if(j.countries){
                    j.countries.forEach(c=>{
                        countries_map[c.country]=c.id;
                    });
                }
                oncomplite(menu_list);
            },()=>{
                oncomplite([]);
            });
        }
    }

    function seasons(tv, from, oncomplite){
        // заглушка
        oncomplite({});
    }
    function menuCategory(params, oncomplite){
        oncomplite([]);
    }

    // Собираем
    var KP_SOURCE = {
        SOURCE_NAME: SOURCE_NAME,
        SOURCE_TITLE: SOURCE_TITLE,
        main,
        menu,
        full:getById,
        list,
        category,
        clear:clearNetwork,
        person,
        seasons,
        menuCategory,
        discovery: discovery()
    };

    /**
     * ==========================================
     * 2) РЕГИСТРАЦИЯ ИСТОЧНИКА 'KP'
     * ==========================================
     */
    function registerKPSource(){
        if(Lampa.Api.sources[SOURCE_NAME]){
            // Уже есть
            Lampa.Noty.show('Источник KP уже зарегистрирован другим плагином');
            return;
        }
        // Регистрируем
        Lampa.Api.sources[SOURCE_NAME] = KP_SOURCE;
        Object.defineProperty(Lampa.Api.sources, SOURCE_NAME, {
            get(){ return KP_SOURCE; }
        });
        // Пропишем в Params (список источников)
        var sources;
        if(Lampa.Params.values && Lampa.Params.values.source){
            sources = Object.assign({}, Lampa.Params.values.source);
            sources[SOURCE_NAME] = SOURCE_TITLE;
        }
        else{
            sources = {};
            let ALL = ['tmdb','cub','pub','filmix'];
            ALL.forEach(n=>{
                if(Lampa.Api.sources[n]) sources[n] = n.toUpperCase();
            });
            sources[SOURCE_NAME] = SOURCE_TITLE;
        }
        // По умолчанию оставим tmdb
        Lampa.Params.select('source', sources, 'tmdb');
    }

    /**
     * ==========================================
     * 3) СОБСТВЕННАЯ ACTIVITY для категорий
     * ==========================================
     */
    Lampa.Component.add('kp_source_menu',{
        create(){
            const _this = this;
            this.html = document.createElement('div');
            this.html.classList.add('kp-source-menu');

            // Пример категорий
            const categories = [
                {title:'Популярные Фильмы', url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'},
                {title:'Топ Фильмы',        url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS'},
                {title:'Росс. фильмы',      url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'},
                {title:'Росс. сериалы',     url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES'}
            ];

            categories.forEach(cat=>{
                let item = document.createElement('div');
                item.classList.add('kp-cat-item','selector');
                item.textContent = cat.title;
                item.addEventListener('hover:enter', ()=>{
                    Lampa.Activity.push({
                        url: cat.url,
                        title: cat.title,
                        component: 'category_full',
                        source: SOURCE_NAME,
                        card_type: true,
                        page:1
                    });
                });
                this.html.appendChild(item);
            });

            this.addBlock(this.html);
            // При готовности
            this.start = ()=>{
                Lampa.Controller.toggle('content');
            };
        },
        back(){
            Lampa.Controller.toggle('menu');
        }
    });

    /**
     * ==========================================
     * 4) ДОБАВЛЯЕМ КНОПКУ «КИНОПОИСК» В МЕНЮ
     * ==========================================
     */
    function addKpMenuButton(){
        const ITEM_TV_SELECTOR = '[data-action="tv"]';

        // Иконка
        const iconKP = `
            <svg width="32" height="32" viewBox="0 0 192 192" fill="currentColor">
              <g fill-rule="evenodd">
                <path d="M20,4H172a16,16,0,0,1,16,16V172a16,16,0,0,1-16,16H20a16,16,0,0,1-16-16V20A16,16,0,0,1,20,4Z" fill="currentColor"/>
                <path d="M96.5,20,66.1,75.733V20H40.767V172H66.1V116.267L96.5,172h35.467C116.767,153.422,95.2,133.578,80,115c28.711,16.889,63.789,35.044,92.5,51.933v-30.4C148.856,126.4,108.644,115.133,85,105c23.644,3.378,63.856,7.889,87.5,11.267v-30.4L85,90c27.022-11.822,60.478-22.711,87.5-34.533v-30.4C143.789,41.956,108.711,63.11,80,80Z" fill="#000" />
              </g>
            </svg>
        `;

        const li = document.createElement('li');
        li.classList.add('menu__item','selector');
        li.setAttribute('data-action','kp_source_menu');
        li.innerHTML = `
            <div class="menu__ico">${iconKP}</div>
            <div class="menu__text">Кинопоиск</div>
        `;
        li.addEventListener('hover:enter', ()=>{
            // Открываем нашу Activity
            Lampa.Activity.push({
                title: 'Кинопоиск',
                component: 'kp_source_menu',
                page:1
            });
        });

        // Вставляем после пункта ТВ
        const tv_item = Lampa.Menu.render().querySelector(ITEM_TV_SELECTOR);
        if(tv_item && tv_item.parentNode){
            tv_item.parentNode.insertBefore(li, tv_item.nextSibling);
        }
    }

    /**
     * ==========================================
     * 5) ЗАПУСК ПЛАГИНА
     * ==========================================
     */
    function init(){
        registerKPSource(); // регистрируем источник
        addKpMenuButton();  // добавляем кнопку в меню
    }

    if(window.appready){
        init();
    }
    else{
        Lampa.Listener.follow('app',(e)=>{
            if(e.type==='ready'){
                init();
            }
        });
    }

})();
