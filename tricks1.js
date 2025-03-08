(function(){
  'use strict';

  /**
   * ======== 1. ЛОГИКА ДЛЯ API КИНОПОИСКА (И КЭШ) ========
   */

  var network   = new Lampa.Reguest();
  var cache     = {};
  var total_cnt = 0, proxy_cnt=0, good_cnt=0;
  var CACHE_SIZE = 100, CACHE_TIME = 1000*60*60;

  var SOURCE_NAME  = 'KP';          // Уникальное имя
  var SOURCE_TITLE = 'Кинопоиск';   // Как будет отображаться

  function clear(){
    network.clear();
  }

  function getCache(key){
    var it = cache[key];
    if(!it) return null;
    var limit = Date.now() - CACHE_TIME;
    if(it.timestamp>limit) return it.value;
    // чистим старьё
    for(var k in cache){
      if(cache[k].timestamp<limit) delete cache[k];
    }
    return null;
  }
  function setCache(key,val){
    var now = Date.now();
    cache[key] = {timestamp:now, value:val};
    // Если переполнен, тоже чистим
    if(Object.keys(cache).length>=CACHE_SIZE){
      var limit = now - CACHE_TIME;
      for(var k in cache){
        if(cache[k].timestamp<limit) delete cache[k];
      }
    }
  }

  // Запрос к kinopoiskapiunofficial.tech
  function get(method, oncomplite, onerror){
    var use_proxy = (total_cnt>=10 && good_cnt>total_cnt/2);
    if(!use_proxy) total_cnt++;

    var base = 'https://kinopoiskapiunofficial.tech/';
    var kp_prox = 'https://cors.kp556.workers.dev:8443/';

    var url = base + method;
    network.timeout(15000);

    network.silent(
      (use_proxy? kp_prox:'') + url,
      function(json){
        oncomplite(json);
      },
      function(a,c){
        // Если 429, попробуем прокси
        var can_retry = !use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
        if(can_retry && (a.status===429 || (a.status===0 && a.statusText!=='timeout'))){
          proxy_cnt++;
          network.timeout(15000);
          network.silent(
            kp_prox+url,
            function(js){
              good_cnt++;
              oncomplite(js);
            },
            onerror,
            false,
            { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
          );
        }
        else onerror(a,c);
      },
      false,
      { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
    );
  }

  // Запрос с кэшем
  function getFromCache(method, oncomplite, onerror){
    var c = getCache(method);
    if(c){
      setTimeout(function(){ oncomplite(c,true); },10);
    }
    else{
      get(method, function(json){
        if(json) setCache(method,json);
        oncomplite(json,false);
      }, onerror);
    }
  }

  // Простейшая конвертация элемента
  function convertElem(elem){
    var type = (!elem.type||elem.type==='FILM'||elem.type==='VIDEO') ? 'movie':'tv';
    var kid  = elem.kinopoiskId||elem.filmId||0;
    var rating = +(elem.rating||elem.ratingKinopoisk||0);

    return {
      source:       SOURCE_NAME,
      type:         type,
      adult:        false,
      id:           SOURCE_NAME+'_'+kid,

      title:        elem.nameRu||elem.nameEn||elem.nameOriginal||'',
      original_title: elem.nameOriginal||elem.nameEn||elem.nameRu||'',
      overview:     elem.description||elem.shortDescription||'',

      img:          elem.posterUrlPreview||elem.posterUrl||'',
      background_image: elem.coverUrl||elem.posterUrl||elem.posterUrlPreview||'',

      vote_average: rating,
      vote_count:   elem.ratingVoteCount||elem.ratingKinopoiskVoteCount||0,

      kinopoisk_id: kid,
      kp_rating:    rating,
      imdb_id:      elem.imdbId||'',
      imdb_rating:  elem.ratingImdb||0
    };
  }


  /**
   * ======== 2. СОЗДАЁМ ОБЪЕКТ-ИСТОЧНИК ДЛЯ LAMPA ========
   */
  var KpSource = {

    clear: clear,

    // Для "категории" (component: 'category_full')
    list: function(params={}, oncomplite, onerror){
      if(!params.url) return onerror();
      var page = params.page||1;
      var full_url = params.url + (params.url.indexOf('?')>=0?'&':'?') + 'page='+page;

      getFromCache(full_url, function(json){
        if(!json||!json.items) return onerror();

        var arr = (json.items||[]).map(convertElem);
        var total = json.pagesCount||json.totalPages||1;

        oncomplite({
          results: arr,
          page: page,
          total_pages: total,
          more: page<total
        });
      }, onerror);
    },

    // Полные данные
    full: function(params={}, oncomplite, onerror){
      var card = params.card||{};
      if(card.source!==SOURCE_NAME) return onerror();

      var kid = card.kinopoisk_id||0;
      if(!kid && (card.id||'').indexOf('KP_')===0){
        kid = (card.id||'').replace('KP_','');
      }
      if(!kid) return onerror();

      var url = 'api/v2.2/films/'+kid;
      getFromCache(url, function(film){
        if(!film||!film.kinopoiskId) return onerror();

        // Обычная структура full-ответа:
        var movieObj = convertElem(film);
        oncomplite({ movie: movieObj });
      }, onerror);
    },

    // Заглушки (чтобы движок не ругался)
    main: function(p,cb){ cb(); },
    category: function(p,cb){ cb(); },
    person: function(p,cb){ cb({}); },
    seasons: function(tv,arr,cb){ cb({}); },
    menuCategory: function(p,cb){ cb([]); },

    // Важная часть — discovery() с корректным search
    discovery: function(){
      return {
        title: SOURCE_TITLE,
        // Методы поиска
        search: {
          // Нажали Enter
          start: function(params, onReady){
            var query = (params.query||'').trim();
            if(!query){
              onReady([]);
              return;
            }
            var url = 'api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(query);
            getFromCache(url, function(json){
              if(!json||!json.films) return onReady([]);

              var arr = (json.films||[]).map(convertElem).filter(e=>!e.adult);
              var movies = arr.filter(a=>a.type==='movie');
              var tv     = arr.filter(a=>a.type==='tv');
              var result = [];

              if(movies.length){
                result.push({
                  title: Lampa.Lang.translate('menu_movies'),
                  results: movies,
                  type: 'movie'
                });
              }
              if(tv.length){
                result.push({
                  title: Lampa.Lang.translate('menu_tv'),
                  results: tv,
                  type: 'tv'
                });
              }
              onReady(result);
            },function(){
              onReady([]);
            });
          },
          // При вводе символов
          start_typing: function(query, onChange){
            // Можно просто вызывать onChange(query)
            onChange(query);
          },
          // Когда очистили строку
          empty: function(){},
          // Нажали «Back»
          back: function(){}
        },
        // «Показать ещё»
        onMore: function(params){
          Lampa.Activity.push({
            url: 'api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(params.query),
            title: Lampa.Lang.translate('search')+' - '+params.query,
            component: 'category_full',
            source: SOURCE_NAME,
            page: 1
          });
        },
        // Когда вышли
        onCancel: function(){
          clear();
        }
      };
    }

  };

  /**
   * ======== 3. РЕГИСТРИРУЕМ ИСТОЧНИК ========
   */
  if(!Lampa.Api.sources[SOURCE_NAME]){
    Lampa.Api.sources[SOURCE_NAME] = KpSource;
  }
  if(!window.kp_source_plugin){
    window.kp_source_plugin = true;
    // Добавим в список источников
    var old_src = Lampa.Params.values.source || {};
    old_src[SOURCE_NAME] = SOURCE_TITLE;
    Lampa.Params.select('source', old_src, 'tmdb');
  }

  /**
   * ======== 4. КОМПОНЕНТ kp_categories — СТРАНИЦА С ИКОНКАМИ ========
   */
  function KpCategories(){
    var self = this;
    var cats = [
      { title:'Популярные Фильмы',  url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
      { title:'Топ Фильмы',         url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
      { title:'Популярные российские фильмы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
      { title:'Популярные российские сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
      { title:'Популярные российские мини-сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES' },
      { title:'Популярные Сериалы', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
      { title:'Популярные Телешоу', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
    ];

    this.create = function(){
      this.activity.loader(true);

      this.html = document.createElement('div');
      this.html.classList.add('kp-cats');

      this.scroll = new Lampa.Scroll({mask:true, over:true});
      this.scroll.render().classList.add('kp-cats__scroll');

      let head = document.createElement('div');
      head.classList.add('kp-cats__head');
      head.textContent = 'Категории Кинопоиск';
      this.scroll.append(head);

      let wrap = document.createElement('div');
      wrap.classList.add('kp-cats__wrap');

      cats.forEach(cat=>{
        let item = document.createElement('div');
        item.classList.add('kp-cats__item','selector');

        item.innerHTML = `
          <div class="kp-cats__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 16c0 2.828 0 4.243-.879 5.121C20.243 
                22 18.828 22 16 22H8c-2.828 0-4.243 
                0-5.121-.879C2 20.243 2 18.828 2 
                16v-4c0-2.828 0-4.243.879-5.121C3.757 
                6 5.172 6 8 6h8c2.828 0 4.243 
                0 5.121.879C22 7.757 22 9.172 22 12z"/>
              <path stroke-linecap="round" 
                d="m9 2 3 3.5L15 2m1 4v16"/>
              <path fill="currentColor" 
                d="M20 16a1 1 0 1 0-2 
                0 1 1 0 0 0 2 0m0-4a1 1 0 1 0-2 
                0 1 1 0 0 0 2 0"/>
            </svg>
          </div>
          <div class="kp-cats__label">${cat.title}</div>
        `;

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

        wrap.appendChild(item);
      });

      this.scroll.append(wrap);
      this.html.appendChild(this.scroll.render());
    };

    this.start = function(){
      this.activity.loader(false);
      Lampa.Controller.add('content',{
        toggle: ()=>{
          Lampa.Controller.collectionSet(this.scroll.render());
          Lampa.Controller.collectionFocus(false,this.scroll.render());
        },
        left: ()=>{
          Lampa.Controller.toggle('menu');
        },
        back: ()=>{
          Lampa.Activity.backward();
        }
      });
      Lampa.Controller.toggle('content');
    };
    this.pause = function(){};
    this.stop  = function(){};
    this.render= function(){ return this.html; };
  }

  Lampa.Component.add({
    name: 'kp_categories',
    constructor: KpCategories,
    version: '1.0.0'
  });

  /**
   * ======== 5. КНОПКА "КИНОПОИСК" В МЕНЮ ========
   */
  function addMenuButton(attr, label, svg, onEnter){
    let li = document.createElement('li');
    li.className = 'menu__item selector';

    let [attrName, attrVal] = attr.split('=');
    attrName=attrName.trim(); attrVal=attrVal.replace(/"/g,'');
    li.setAttribute(attrName, attrVal);

    let ico = document.createElement('div');
    ico.className = 'menu__ico';
    ico.innerHTML = svg;

    let txt = document.createElement('div');
    txt.className = 'menu__text';
    txt.textContent = label;

    li.appendChild(ico);
    li.appendChild(txt);

    li.addEventListener('hover:enter', onEnter);

    function insert(){
      let $menu = Lampa.Menu.render();
      let tv = $menu.find('[data-action="tv"]');
      if(tv.length) tv.after(li);
    }

    if(window.appready) insert();
    else{
      Lampa.Listener.follow('app',(e)=>{
        if(e.type==='ready') insert();
      });
    }
  }

  let iconKP=`
    <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
      <g fill="none" fill-rule="evenodd">
        <g fill="currentColor" fill-rule="nonzero">
          <path fill-rule="evenodd"
            d="
              M20,4 H172 A16,16 0 0 1 188,20
              V172 A16,16 0 0 1 172,188
              H20 A16,16 0 0 1 4,172
              V20 A16,16 0 0 1 20,4 Z

              M20,18 H172 A2,2 0 0 1 174,20
              V172 A2,2 0 0 1 172,174
              H20 A2,2 0 0 1 18,172
              V20 A2,2 0 0 1 20,18 Z
            " />
          <g transform="translate(-10.63, 0)">
            <path
              d="
                M96.5 20 L66.1 75.733 V20
                H40.767 v152
                H66.1 v-55.733
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
                L131.967 20 z
              " />
          </g>
        </g>
      </g>
    </svg>
  `;

  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function(){
      Lampa.Activity.push({
        title:'Кинопоиск',
        component:'kp_categories',
        page:1
      });
    }
  );

})();
