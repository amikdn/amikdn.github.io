(function(){
  'use strict';

  // =============================
  // 1. Логика запросов к Кинопоиску (из "rg.txt" сокращённая)
  // =============================

  var network = new Lampa.Reguest();
  var cache   = {};
  var total_cnt = 0, proxy_cnt = 0, good_cnt = 0;
  var CACHE_SIZE = 100;
  var CACHE_TIME = 1000 * 60 * 60;
  var SOURCE_NAME  = 'KP';
  var SOURCE_TITLE = 'KP';
  var genres_map   = {};
  var countries_map= {};
  var menu_list    = [];

  /**
   * Очистить network
   */
  function clear(){
    network.clear();
  }

  /**
   * Храним кэш (чтобы не стучать постоянно к API)
   */
  function getCache(key){
    var res = cache[key];
    if(res){
      var limit = Date.now() - CACHE_TIME;
      if(res.timestamp > limit) return res.value;
      // иначе чистим старые записи
      for(var k in cache){
        if(cache[k].timestamp < limit) delete cache[k];
      }
    }
    return null;
  }
  function setCache(key, val){
    var now = Date.now();
    cache[key] = { timestamp: now, value: val };

    // Если кэша слишком много — чистим
    if(Object.keys(cache).length >= CACHE_SIZE){
      var limit = now - CACHE_TIME;
      for(var k in cache){
        if(cache[k].timestamp < limit) delete cache[k];
      }
    }
  }

  /**
   * Запрос с учётом прокси
   */
  function get(method, oncomplite, onerror){
    var use_proxy = (total_cnt >= 10 && good_cnt > total_cnt/2);
    if(!use_proxy) total_cnt++;

    var kp_prox = 'https://cors.kp556.workers.dev:8443/';
    var url = 'https://kinopoiskapiunofficial.tech/' + method;

    network.timeout(15000);
    network.silent((use_proxy ? kp_prox : '') + url,
      function(json){
        oncomplite(json);
      },
      function(a,c){
        // если вернулся 429 (лимит) или 0 (CORS), пробуем прокси
        var can_retry_proxy = (!use_proxy) && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
        if(can_retry_proxy && (a.status==429 || (a.status==0 && a.statusText!=='timeout'))){
          proxy_cnt++;
          network.timeout(15000);
          network.silent(kp_prox+url, function(js){
            good_cnt++;
            oncomplite(js);
          }, onerror,false,{headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}});
        }
        else onerror(a,c);
      },
      false,
      { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616' } }
    );
  }

  function getFromCache(method, oncomplite, onerror){
    var cached = getCache(method);
    if(cached){
      setTimeout(function(){
        oncomplite(cached, true);
      },10);
    }
    else{
      get(method, function(json){
        setCache(method, json);
        oncomplite(json, false);
      }, onerror);
    }
  }

  /**
   * Преобразовать ответ Кинопоиска в формат карточки Lampa
   */
  function convertElem(elem){
    var type = (!elem.type || elem.type==='FILM' || elem.type==='VIDEO') ? 'movie' : 'tv';
    var kid  = elem.kinopoiskId || elem.filmId || 0;
    var kp_rating = +elem.rating || +elem.ratingKinopoisk || 0;
    var title  = elem.nameRu || elem.nameEn || elem.nameOriginal || '';
    var original = elem.nameOriginal || elem.nameEn || elem.nameRu || '';
    var adult = false;

    var item = {
      source: SOURCE_NAME,
      type:   type,
      adult:  false,
      id:     SOURCE_NAME+'_'+kid,
      title:  title,
      original_title:  original,
      overview:        elem.description || elem.shortDescription || '',
      img:             elem.posterUrlPreview || elem.posterUrl || '',
      background_image:elem.coverUrl || elem.posterUrl || elem.posterUrlPreview || '',
      genres: [],
      production_companies: [],
      production_countries: [],
      vote_average: kp_rating,
      vote_count:   elem.ratingVoteCount || elem.ratingKinopoiskVoteCount || 0,
      kinopoisk_id: kid,
      kp_rating:    kp_rating,
      imdb_id:      elem.imdbId || '',
      imdb_rating:  elem.ratingImdb || 0
    };

    // жанры
    if(elem.genres){
      item.genres = elem.genres.map(function(g){
        if(g.genre==='для взрослых') adult=true;
        return {
          id: (g.genre && genres_map[g.genre])||0,
          name: g.genre,
          url:''
        };
      });
    }
    // страны
    if(elem.countries){
      item.production_countries = elem.countries.map(function(c){
        return {name: c.country};
      });
    }

    item.adult = adult;

    // Год/даты
    var first_date = (elem.year && elem.year!=='null') ? elem.year : '';
    var last_date  = '';
    if(type==='tv'){
      if(elem.startYear && elem.startYear!=='null') first_date = elem.startYear;
      if(elem.endYear   && elem.endYear!=='null')   last_date  = elem.endYear;
      item.name = title;
      item.original_name = original;
      item.first_air_date = first_date;
      if(last_date) item.last_air_date = last_date;
    }
    else{
      item.release_date = first_date;
    }

    return item;
  }

  // =============================
  // 2. Минимальная реализация source: 'KP', чтобы работали category_full и т.д.
  // =============================
  var KpSource = {
    // Обязательные поля
    discovery: function(){
      // Если кто-то вдруг вызовет discovery, вернём болванку
      return {
        title: SOURCE_TITLE,
        search: function(p,c){ c([]); },
        onMore: function(){},
        onCancel: function(){}
      };
    },
    clear: clear,

    // Для "category_full" нужен метод list
    list: function(params={}, oncomplite, onerror){
      // params.url — например "api/v2.2/films/top?type=TOP_100_POPULAR_FILMS"
      var method = params.url;
      if(!method){
        onerror();
        return;
      }
      // Подгрузка конкретной страницы
      var page = params.page||1;
      var fullurl = method + (method.indexOf('?')>=0 ? '&':'?') + 'page='+page;

      getFromCache(fullurl, function(json){
        if(!json||!json.items) {
          onerror();
          return;
        }
        var items = json.items || json.films || [];
        var results = items.map(convertElem);

        var pagesCount = json.pagesCount || json.totalPages || 1;
        oncomplite({
          results: results,
          page: page,
          total_pages: pagesCount,
          more: page<pagesCount
        });
      }, onerror);
    },

    // Для "category_full" нужен метод full
    full: function(params={}, oncomplite, onerror){
      // Нужно достать kinopoisk_id из params.card
      var card = params.card||{};
      if(card.source!==SOURCE_NAME) {
        onerror();
        return;
      }
      var kid = card.kinopoisk_id || 0;
      if(!kid){
        // иногда в id лежит 'KP_12345'
        if((card.id||'').indexOf('KP_')===0) kid = (card.id||'').replace('KP_','');
      }
      if(!kid){
        onerror();
        return;
      }
      // Запрашиваем детали
      var url = 'api/v2.2/films/'+kid;
      getFromCache(url, function(film){
        if(!film || !film.kinopoiskId){
          onerror();
          return;
        }
        var item = convertElem(film);
        // Для полноты "category_full" ещё persons, collection, simular...
        // Но если нужно — делаем. Упростим.
        oncomplite({
          movie: item
        });
      }, onerror);
    },

    // Остальные методы можно оставить пустыми
    category: function(p,c){ c(); },
    main:     function(p,c){ c(); },
    person:   function(p,c){ c({}); },
    seasons:  function(tv, from, c){ c({}); },
    menuCategory: function(p,c){ c([]); }
  };

  // Регистрируем в Api, но НЕ добавляем в Params.select
  if(!Lampa.Api.sources[SOURCE_NAME]){
    Lampa.Api.sources[SOURCE_NAME] = KpSource;
  }

  // =============================
  // 3. Создаём компонент "kp_categories" — страница с большими иконками
  // =============================

  function KpCategoriesComponent(){
    var self = this;
    var categories = [
      { title:'Популярные Фильмы', url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
      { title:'Топ Фильмы',         url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
      { title:'Популярные российские фильмы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
      { title:'Популярные российские сериалы',url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
      { title:'Популярные российские мини-сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES' },
      { title:'Популярные Сериалы', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
      { title:'Популярные Телешоу', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
    ];

    // Основная DOM-обёртка
    this.create = function(){
      this.activity.loader(true);

      // Создадим корневой DOM-элемент (чтобы не было "html.querySelectorAll is not a function")
      this.html = document.createElement('div');
      this.html.classList.add('kp-categories');

      // Используем Lampa.Scroll, чтобы была прокрутка
      this.scroll = new Lampa.Scroll({
        mask:true,
        over:true
      });
      this.scroll.render().classList.add('kp-categories__scroll');

      // Вставляем заголовок (опционально)
      var head = document.createElement('div');
      head.classList.add('kp-categories__title');
      head.innerText = 'Кинопоиск - Категории';
      this.scroll.append(head);

      // Создаём сетку категорий
      var wrap = document.createElement('div');
      wrap.classList.add('kp-categories__grid');

      categories.forEach(function(cat){
        var item = document.createElement('div');
        item.classList.add('kp-categories__item','selector');

        // Внутри — иконка + название
        var icon = document.createElement('div');
        icon.classList.add('kp-categories__icon');
        // Вставим SVG одну и ту же (или разную), для примера
        icon.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 16c0 2.828 0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 
             0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16v-4c0-2.828 0-4.243.879-5.121C3.757 
             6 5.172 6 8 6h8c2.828 0 4.243 0 5.121.879C22 7.757 22 9.172 22 12z"/>
            <path stroke-linecap="round" d="m9 2 3 3.5L15 2m1 4v16"/>
            <path fill="currentColor" d="M20 16a1 1 0 1 0-2 0 1 1 0 0 0 2 0m0-4a1 1 0 
             1 0-2 0 1 1 0 0 0 2 0"/>
          </svg>
        `;
        item.appendChild(icon);

        var label = document.createElement('div');
        label.classList.add('kp-categories__label');
        label.textContent = cat.title;
        item.appendChild(label);

        // При фокусе / клике
        item.addEventListener('hover:enter', function(){
          // Переходим в список (category_full) с source: 'KP'
          Lampa.Activity.push({
            url: cat.url,
            title: cat.title,
            component: 'category_full',
            source: SOURCE_NAME, // используем наш скрытый source
            card_type: true,
            page: 1
          });
        });

        wrap.appendChild(item);
      });

      this.scroll.append(wrap);
      this.html.appendChild(this.scroll.render());
    };

    // Когда страница показывается
    this.start = function(){
      this.activity.loader(false);
      // Регистрируем контроллер
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
    this.render= function(){
      return this.html;
    };
  }

  // Регистрируем наш компонент под именем 'kp_categories'
  Lampa.Component.add({
    name: 'kp_categories',
    constructor: KpCategoriesComponent,
    version: '1.0.0'
  });

  // =============================
  // 4. Добавляем кнопку «Кинопоиск» в меню
  // =============================
  function addMenuButton(attr, text, icon, onEnter){
    var field = document.createElement('li');
    field.className = 'menu__item selector';
    field.setAttribute(attr.split('=')[0], attr.split('=')[1].replace(/"/g,''));

    var ico = document.createElement('div');
    ico.className = 'menu__ico';
    ico.innerHTML = icon;

    var txt = document.createElement('div');
    txt.className = 'menu__text';
    txt.textContent= text;

    field.appendChild(ico);
    field.appendChild(txt);

    field.addEventListener('hover:enter', onEnter);

    // дождёмся, когда Lampa.Menu уже готов
    if(window.appready){
      var menu = Lampa.Menu.render();
      var tv_item = menu.querySelector('[data-action="tv"]');
      if(tv_item){
        tv_item.parentNode.insertBefore(field, tv_item.nextSibling);
      }
    }
    else{
      Lampa.Listener.follow('app', function(e){
        if(e.type==='ready'){
          var menu = Lampa.Menu.render();
          var tv_item = menu.querySelector('[data-action="tv"]');
          if(tv_item){
            tv_item.parentNode.insertBefore(field, tv_item.nextSibling);
          }
        }
      });
    }
  }

  // SVG-иконка «К»
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
    'data-action="kp_button"',
    'Кинопоиск',
    iconKP,
    function(){
      // при нажатии открываем нашу страницу "kp_categories"
      Lampa.Activity.push({
        url: '',
        title: 'Кинопоиск',
        component: 'kp_categories',
        page: 1
      });
    }
  );

})();
