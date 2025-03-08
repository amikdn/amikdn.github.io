(function(){
  'use strict';

  // =============================
  // 1. Логика запросов к Кинопоиску
  // =============================

  var network = new Lampa.Reguest();
  var cache   = {};
  var total_cnt = 0, proxy_cnt = 0, good_cnt = 0;
  var CACHE_SIZE = 100;
  var CACHE_TIME = 1000 * 60 * 60;

  var SOURCE_NAME  = 'KP'; // Короткое имя
  var SOURCE_TITLE = 'Кинопоиск'; // Просто заголовок (не попадёт в выбор источника)

  var genres_map   = {};
  var countries_map= {};
  var menu_list    = [];

  function clear(){
    network.clear();
  }

  function getCache(key){
    var res = cache[key];
    if(res){
      var limit = Date.now() - CACHE_TIME;
      if(res.timestamp > limit) return res.value;

      // чистим старые
      for(var k in cache){
        if(cache[k].timestamp < limit) delete cache[k];
      }
    }
    return null;
  }
  function setCache(key, val){
    var now = Date.now();
    cache[key] = { timestamp: now, value: val };
    // если слишком много
    if(Object.keys(cache).length >= CACHE_SIZE){
      var limit = now - CACHE_TIME;
      for(var k in cache){
        if(cache[k].timestamp < limit) delete cache[k];
      }
    }
  }

  // Запрос к Кинопоиску + прокси
  function get(method, oncomplite, onerror){
    var use_proxy = (total_cnt>=10 && good_cnt>total_cnt/2);
    if(!use_proxy) total_cnt++;

    var kp_prox = 'https://cors.kp556.workers.dev:8443/';
    var url = 'https://kinopoiskapiunofficial.tech/' + method;

    network.timeout(15000);
    network.silent(
      (use_proxy?kp_prox:'')+url,
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
            {headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}}
          );
        }
        else onerror(a,c);
      },
      false,
      { headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
    );
  }

  // Обёртка, чтобы не стучать дважды
  function getFromCache(method, oncomplite, onerror){
    var c = getCache(method);
    if(c){
      setTimeout(function(){ oncomplite(c,true); },10);
    }
    else{
      get(method, function(json){
        setCache(method,json);
        oncomplite(json,false);
      }, onerror);
    }
  }

  // Упрощённое преобразование
  function convertElem(elem){
    var type = (!elem.type||elem.type==='FILM'||elem.type==='VIDEO') ? 'movie':'tv';
    var kid  = elem.kinopoiskId || elem.filmId || 0;
    var kp_rating = +elem.rating|| +elem.ratingKinopoisk||0;

    var title    = elem.nameRu || elem.nameEn || elem.nameOriginal || '';
    var original = elem.nameOriginal || elem.nameEn || elem.nameRu || '';

    var item = {
      source: SOURCE_NAME,
      type:   type,
      adult:  false,
      id:     SOURCE_NAME+'_'+kid,
      title:  title,
      original_title: original,
      overview: elem.description || elem.shortDescription || '',
      img:      elem.posterUrlPreview || elem.posterUrl || '',
      background_image: elem.coverUrl || elem.posterUrl || elem.posterUrlPreview||'',
      vote_average: kp_rating,
      vote_count:   elem.ratingVoteCount||elem.ratingKinopoiskVoteCount||0,
      kinopoisk_id: kid,
      kp_rating:    kp_rating,
      imdb_id:      elem.imdbId||'',
      imdb_rating:  elem.ratingImdb||0,
      genres: [],
      production_countries: []
    };
    // жанры
    if(elem.genres) {
      elem.genres.forEach(function(g){
        item.genres.push({
          id: (g.genre && genres_map[g.genre])||0,
          name: g.genre
        });
      });
    }
    // страны
    if(elem.countries){
      elem.countries.forEach(function(c){
        item.production_countries.push({ name:c.country });
      });
    }

    return item;
  }

  // =============================
  // 2. Минимальный объект source: 'KP'
  // =============================
  var KpSource = {
    clear: clear,

    // нужно для component:'category_full'
    list: function(params={}, oncomplite, onerror){
      var url = params.url;
      if(!url) return onerror();

      var page = params.page||1;
      var full = url+(url.indexOf('?')>=0 ? '&':'?')+'page='+page;

      getFromCache(full, function(json){
        if(!json || !json.items) return onerror();

        var items = json.items||[];
        var results = items.map(convertElem);

        var pages = json.pagesCount||json.totalPages||1;
        oncomplite({
          results: results,
          page: page,
          total_pages: pages,
          more: page<pages
        });
      }, onerror);
    },

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

        var item = convertElem(film);
        oncomplite({ movie:item });
      }, onerror);
    },

    // Остальное пустые
    category: function(p,c){ c(); },
    main:     function(p,c){ c(); },
    discovery:function(){ return { title:SOURCE_TITLE, search:()=>{}, onMore:()=>{}, onCancel:()=>{} };},
    person:   function(p,c){ c({}); },
    seasons:  function(tv, from, c){ c({}); },
    menuCategory:function(p,c){ c([]); }
  };

  // Регистрируем, НО НЕ ДОБАВЛЯЕМ В ПАРАМЕТРЫ
  if(!Lampa.Api.sources[SOURCE_NAME]){
    Lampa.Api.sources[SOURCE_NAME] = KpSource;
  }

  // =============================
  // 3. Компонент "kp_categories" (Activity со списком иконок)
  // =============================
  function KpCategories(){
    var self = this;

    // Список категорий
    var categories = [
      { title:'Популярные Фильмы',  url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
      { title:'Топ Фильмы',         url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
      { title:'Популярные российские фильмы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
      { title:'Популярные российские сериалы',url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
      { title:'Популярные российские мини-сериалы', url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES' },
      { title:'Популярные Сериалы', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
      { title:'Популярные Телешоу', url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
    ];

    this.create = function(){
      this.activity.loader(true);

      // корневой DOM
      this.html = document.createElement('div');
      this.html.classList.add('kp-categories');

      // скролл
      this.scroll = new Lampa.Scroll({mask:true, over:true});
      this.scroll.render().classList.add('kp-categories__scroll');

      // заголовок
      var head = document.createElement('div');
      head.classList.add('kp-categories__title');
      head.innerText = 'Кинопоиск - Категории';
      this.scroll.append(head);

      // сетка
      var wrap = document.createElement('div');
      wrap.classList.add('kp-categories__grid');

      categories.forEach(function(cat){
        var item = document.createElement('div');
        item.classList.add('kp-categories__item','selector');

        // иконка
        var icon = document.createElement('div');
        icon.classList.add('kp-categories__icon');
        icon.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 16c0 2.828 0 4.243-.879 5.121C20.243 22 18.828 22 16 
             22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 
             16v-4c0-2.828 0-4.243.879-5.121C3.757 6 5.172 6 8 
             6h8c2.828 0 4.243 0 5.121.879C22 7.757 22 9.172 22 12z"/>
            <path stroke-linecap="round" d="m9 2 3 3.5L15 2m1 4v16"/>
            <path fill="currentColor" d="M20 16a1 1 0 1 0-2 
             0 1 1 0 0 0 2 0m0-4a1 1 0 1 0-2 
             0 1 1 0 0 0 2 0"/>
          </svg>
        `;
        item.appendChild(icon);

        // надпись
        var label = document.createElement('div');
        label.classList.add('kp-categories__label');
        label.textContent = cat.title;
        item.appendChild(label);

        item.addEventListener('hover:enter',function(){
          // переходим в список
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
          // Важно передать DOM-элемент
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

  // Регистрируем компонент
  Lampa.Component.add({
    name: 'kp_categories',
    constructor: KpCategories,
    version: '1.0.0'
  });

  // =============================
  // 4. Кнопка «Кинопоиск» в меню (без querySelector)
  // =============================

  function addMenuButton(newItemAttr, newItemText, iconHTML, onEnterHandler){
    // Создаём <li> вручную
    var field = document.createElement('li');
    field.className = 'menu__item selector';

    // Парсим атрибут data-action="..."
    var attrName = newItemAttr.split('=')[0]; // data-action
    var attrVal  = newItemAttr.split('=')[1].replace(/"/g,''); // kp
    field.setAttribute(attrName, attrVal);

    // Иконка
    var ico = document.createElement('div');
    ico.className = 'menu__ico';
    ico.innerHTML = iconHTML;

    // Текст
    var txt = document.createElement('div');
    txt.className = 'menu__text';
    txt.textContent = newItemText;

    field.appendChild(ico);
    field.appendChild(txt);

    // При клике
    field.addEventListener('hover:enter', onEnterHandler);

    // Ждём готовности приложения
    if(window.appready){
      var $menu = Lampa.Menu.render(); // это jQuery
      $menu.find('[data-action="tv"]').after(field);
    }
    else{
      Lampa.Listener.follow('app', function (event){
        if(event.type==='ready'){
          var $menu = Lampa.Menu.render(); // jQuery
          $menu.find('[data-action="tv"]').after(field);
        }
      });
    }
  }

  // Иконка "K"
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

  // Добавляем пункт «Кинопоиск»
  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function(){
      // Переход в нашу Activity
      Lampa.Activity.push({
        url: '',
        title: 'Кинопоиск',
        component: 'kp_categories',
        page: 1
      });
    }
  );

})();
