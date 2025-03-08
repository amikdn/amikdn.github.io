(function(){
  'use strict';

  // =============================
  // 1. Минимальная логика для Кинопоиска
  // =============================

  var network = new Lampa.Reguest();
  var cache   = {};
  var total_cnt = 0, proxy_cnt = 0, good_cnt = 0;
  var CACHE_SIZE = 100;
  var CACHE_TIME = 1000 * 60 * 60;

  var SOURCE_NAME  = 'KP';           // Короткое имя
  var SOURCE_TITLE = 'Кинопоиск';    // Заголовок

  function clear(){
    network.clear();
  }
  function getCache(key){
    var it = cache[key];
    if(it){
      var limit = Date.now() - CACHE_TIME;
      if(it.timestamp > limit) return it.value;

      // чистим устаревшее
      for(var k in cache){
        if(cache[k].timestamp < limit) delete cache[k];
      }
    }
    return null;
  }
  function setCache(key, val){
    var now = Date.now();
    cache[key] = { timestamp: now, value: val };
    if(Object.keys(cache).length>=CACHE_SIZE){
      var limit = now - CACHE_TIME;
      for(var k in cache){
        if(cache[k].timestamp < limit) delete cache[k];
      }
    }
  }

  // Запрос к API Кинопоиска (через прокси, если нужно)
  function get(method, oncomplite, onerror){
    var use_proxy = (total_cnt>=10 && good_cnt>total_cnt/2);
    if(!use_proxy) total_cnt++;

    var kp_prox = 'https://cors.kp556.workers.dev:8443/';
    var url = 'https://kinopoiskapiunofficial.tech/' + method;

    network.timeout(15000);
    network.silent(
      (use_proxy? kp_prox:'')+url,
      function(json){
        oncomplite(json);
      },
      function(a,c){
        var can_retry = !use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
        if(can_retry && (a.status==429 || (a.status==0 && a.statusText!=='timeout'))){
          proxy_cnt++;
          network.timeout(15000);
          network.silent(kp_prox+url,
            function(js){
              good_cnt++;
              oncomplite(js);
            },
            onerror,
            false,
            { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616' } }
          );
        }
        else onerror(a,c);
      },
      false,
      { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
    );
  }

  // Берём из кэша или делаем запрос
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

  // Простейшее преобразование полей ответа
  function convertElem(elem){
    var type = (!elem.type||elem.type==='FILM'||elem.type==='VIDEO') ? 'movie':'tv';
    var kid  = elem.kinopoiskId||elem.filmId||0;
    var rating = +(elem.rating||elem.ratingKinopoisk||0);

    var item = {
      source: SOURCE_NAME,
      type:   type,
      adult:  false,
      id:     SOURCE_NAME+'_'+kid,
      title:  elem.nameRu || elem.nameEn || elem.nameOriginal || '',
      original_title: elem.nameOriginal || elem.nameEn || elem.nameRu || '',
      overview: elem.description || elem.shortDescription || '',
      img:      elem.posterUrlPreview || elem.posterUrl || '',
      background_image: elem.coverUrl || elem.posterUrl || elem.posterUrlPreview || '',
      vote_average: rating,
      vote_count:   elem.ratingVoteCount || elem.ratingKinopoiskVoteCount || 0,
      kinopoisk_id: kid,
      kp_rating:    rating,
      imdb_id:      elem.imdbId || '',
      imdb_rating:  elem.ratingImdb || 0
    };
    return item;
  }

  // =============================
  // 2. Объект источника: Lampa.Api.sources['KP']
  // =============================
  var KpSource = {
    clear: clear,

    // Для component:'category_full', source:'KP'
    list: function(params={}, oncomplite, onerror){
      if(!params.url) return onerror();
      var page = params.page||1;
      // Пример: api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=2
      var full = params.url+(params.url.indexOf('?')>=0?'&':'?')+'page='+page;

      getFromCache(full, function(json){
        if(!json || !json.items) return onerror();

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

    // Для карточки
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
        if(!film || !film.kinopoiskId) return onerror();
        var item = convertElem(film);
        oncomplite({ movie: item });
      }, onerror);
    },

    // Доп. методы для совместимости
    category: function(p,cb){ cb(); },
    main:     function(p,cb){ cb(); },

    // ВАЖНО: discovery(), чтобы поиск не ломался
    // и действительно искал по Кинопоиску
    discovery: function(){
      return {
        title: SOURCE_TITLE,
        search: {
          // когда пользователь нажимает Enter в поиске
          start: function(params, onReady){
            var query = (params.query||'').trim();
            if(!query){
              onReady([]);
              return;
            }
            // Пример запроса к api/v2.1/films/search-by-keyword
            var url = 'api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(query);
            getFromCache(url, function(json){
              if(!json || !json.films) {
                onReady([]);
                return;
              }
              var arr = (json.films||[]).map(convertElem).filter(e=>!e.adult);

              // разбиваем на "Фильмы" / "Сериалы"
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
            }, function(){
              onReady([]);
            });
          },
          // во время набора текста
          start_typing: function(query, onChange){
            // Можно сделать "подсказки", но для простоты — пусто
          },
          // когда очистили строку поиска
          empty: function(){
            // ничего не делаем
          },
          // при нажатии "назад" внутри поиска
          back: function(){
            // ничего не делаем
          }
        },
        onMore: function(params){
          // "Показать ещё" в результатах поиска
          Lampa.Activity.push({
            url: 'api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(params.query),
            title: Lampa.Lang.translate('search')+' - '+params.query,
            component:'category_full',
            source: SOURCE_NAME,
            page:1
          });
        },
        onCancel: function(){
          clear();
        }
      };
    },

    person:   function(p,cb){ cb({}); },
    seasons:  function(tv, from, cb){ cb({}); },
    menuCategory:function(p,cb){ cb([]); }
  };

  // =============================
  // 3. Регистрируем источник + добавляем в общий список
  //    (чтобы в поиске был виден "Кинопоиск" и "Все источники" не ломались)
  // =============================
  if(!Lampa.Api.sources[SOURCE_NAME]){
    Lampa.Api.sources[SOURCE_NAME] = KpSource;
  }
  // Добавляем в настройки "source" (чтобы при выборе "All" тоже был учтён)
  if(!window.kp_source_plugin){
    window.kp_source_plugin = true;
    var old_sources = Lampa.Params.values && Lampa.Params.values.source
                      ? Object.assign({}, Lampa.Params.values.source)
                      : {};
    old_sources[SOURCE_NAME] = SOURCE_TITLE;
    Lampa.Params.select('source', old_sources, 'tmdb');
  }

  // =============================
  // 4. Страница «kp_categories» с крупными иконками
  // =============================
  function KpCategories(){
    var self = this;
    var categories = [
      { title:'Популярные Фильмы',  url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
      { title:'Топ Фильмы',         url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
      { title:'Популярные российские фильмы',  url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
      { title:'Популярные российские сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
      { title:'Популярные российские мини-сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES' },
      { title:'Популярные Сериалы', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
      { title:'Популярные Телешоу', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
    ];

    this.create = function(){
      this.activity.loader(true);

      this.html = document.createElement('div');
      this.html.classList.add('kp-categories');

      this.scroll = new Lampa.Scroll({ mask:true, over:true });
      this.scroll.render().classList.add('kp-categories__scroll');

      var head = document.createElement('div');
      head.classList.add('kp-categories__title');
      head.innerText = 'Кинопоиск - Категории';
      this.scroll.append(head);

      var wrap = document.createElement('div');
      wrap.classList.add('kp-categories__grid');

      categories.forEach(function(cat){
        var item = document.createElement('div');
        item.classList.add('kp-categories__item','selector');

        var icon = document.createElement('div');
        icon.classList.add('kp-categories__icon');
        icon.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="1.5">
            <path d="M22 16c0 2.828 0 4.243-.879 5.121C20.243 22 
             18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 
             20.243 2 18.828 2 16v-4c0-2.828 0-4.243.879-5.121C3.757 
             6 5.172 6 8 6h8c2.828 0 4.243 0 5.121.879C22 
             7.757 22 9.172 22 12z"/>
            <path stroke-linecap="round" 
             d="m9 2 3 3.5L15 2m1 4v16"/>
            <path fill="currentColor" 
             d="M20 16a1 1 0 1 0-2 
             0 1 1 0 0 0 2 0m0-4a1 1 0 1 0-2 
             0 1 1 0 0 0 2 0"/>
          </svg>
        `;
        item.appendChild(icon);

        var label = document.createElement('div');
        label.classList.add('kp-categories__label');
        label.textContent = cat.title;
        item.appendChild(label);

        item.addEventListener('hover:enter', function(){
          Lampa.Activity.push({
            url: cat.url,
            title: cat.title,
            component: 'category_full',
            source: SOURCE_NAME,
            card_type: true,
            page: 1
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

  // =============================
  // 5. Кнопка «Кинопоиск» в меню (с большими иконками)
  // =============================
  function addMenuButton(attr, text, icon, handler){
    var field = document.createElement('li');
    field.className = 'menu__item selector';

    var [attrName,attrVal] = attr.split('=');
    attrName = attrName.trim();         // data-action
    attrVal  = attrVal.replace(/"/g,''); // kp
    field.setAttribute(attrName, attrVal);

    var ico = document.createElement('div');
    ico.className = 'menu__ico';
    ico.innerHTML = icon;

    var txt = document.createElement('div');
    txt.className = 'menu__text';
    txt.textContent = text;

    field.appendChild(ico);
    field.appendChild(txt);

    field.addEventListener('hover:enter', handler);

    if(window.appready){
      let $menu = Lampa.Menu.render(); // jQuery-объект
      $menu.find('[data-action="tv"]').after(field);
    }
    else{
      Lampa.Listener.follow('app',function(e){
        if(e.type==='ready'){
          let $menu = Lampa.Menu.render();
          $menu.find('[data-action="tv"]').after(field);
        }
      });
    }
  }

  var iconKP = `
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

  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function(){
      Lampa.Activity.push({
        url:'',
        title:'Кинопоиск',
        component:'kp_categories',
        page:1
      });
    }
  );

})();
