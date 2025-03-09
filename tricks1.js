(function(){
  'use strict';

  /**
   * ============================
   * 1) Добавляем кнопку «Кинопоиск» в меню
   * ============================
   */

  // Селектор для пункта "ТВ", после которого вставим кнопку
  var ITEM_TV_SELECTOR = '[data-action="tv"]';
  var ITEM_MOVE_TIMEOUT = 2000;

  // Функция для "отложенной" вставки
  function moveItemAfter(item, after) {
    return setTimeout(function () {
      $(item).insertAfter($(after));
    }, ITEM_MOVE_TIMEOUT);
  }

  // Добавляем кнопку в меню
  function addMenuButton(newItemAttr, newItemText, iconHTML, onEnterHandler){
    var NEW_ITEM_ATTR = newItemAttr;
    var NEW_ITEM_SELECTOR = '['+NEW_ITEM_ATTR+']';
    var field = $(`
      <li class="menu__item selector" ${NEW_ITEM_ATTR}>
        <div class="menu__ico">${iconHTML}</div>
        <div class="menu__text">${newItemText}</div>
      </li>
    `);
    field.on('hover:enter', onEnterHandler);

    function appendButton(){
      // Меню уже готово, пытаемся вставить
      var $menu = $(Lampa.Menu.render());
      var $tv = $menu.find(ITEM_TV_SELECTOR);
      if($tv.length){
        $tv.after(field);
        moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
      }
    }

    if(window.appready){
      appendButton();
    } else {
      Lampa.Listener.follow('app',function(e){
        if(e.type==='ready'){
          appendButton();
        }
      });
    }
  }

  // Иконка для кнопки «Кинопоиск»
  var iconKP = `
    <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
      <g fill="none" fill-rule="evenodd">
        <g fill="currentColor" fill-rule="nonzero">
          <!-- Кольцевая рамка -->
          <path fill-rule="evenodd" d="
            M20,4 H172 A16,16 0 0 1 188,20
            V172 A16,16 0 0 1 172,188
            H20 A16,16 0 0 1 4,172
            V20 A16,16 0 0 1 20,4
            Z
            M20,18 H172 A2,2 0 0 1 174,20
            V172 A2,2 0 0 1 172,174
            H20 A2,2 0 0 1 18,172
            V20 A2,2 0 0 1 20,18
            Z
          "/>
          <!-- Буква K -->
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

  /**
   * 2) Создаём «страницу» (компонент) kp_categories,
   *    которая показывает сетку с категориями (иконки + названия)
   *    вместо Select.show()
   */
  (function createKpCategories(){
    // Наш список категорий:
    var categories = [
      {
        title: 'Популярные Фильмы',
        url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <rect x="6" y="10" width="36" height="22" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="4"/>
            <path d="M24 32v8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <path d="M16 40h16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        title: 'Топ Фильмы',
        url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <path fill="currentColor" d="M24 4L4 44h40L24 4z"/>
          </svg>
        `
      },
      {
        title: 'Популярные российские фильмы',
        url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4"/>
            <path d="M24 12v12l8 8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `
      },
      {
        title: 'Популярные российские сериалы',
        url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <rect x="6" y="8" width="36" height="28" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="4"/>
            <path d="M6 20h36" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        title: 'Популярные российские мини-сериалы',
        url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <rect x="6" y="8" width="36" height="28" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="4"/>
            <path d="M24 8v28" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        title: 'Популярные Сериалы',
        url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <rect x="4" y="4" width="40" height="28" rx="2" ry="2" stroke="currentColor" stroke-width="4" fill="none"/>
            <path d="M4 28h40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <path d="M24 32v8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        title: 'Популярные Телешоу',
        url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW',
        svg: `
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
            <rect x="4" y="8" width="40" height="28" rx="2" ry="2" stroke="currentColor" stroke-width="4" fill="none"/>
            <path d="M16 8l16 0" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <path d="M24 36v8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        `
      }
    ];

    function KpCategories(){
      var scroll = new Lampa.Scroll({ mask: true, over: true });
      var html = Lampa.Template.js('list'); 
      // Можно было бы вручную, но проще использовать "list"

      this.create = function(){
        scroll.minus(); 
        scroll.body().addClass('kp-cat__scroll');

        // Генерируем карточки
        categories.forEach(cat=>{
          let item = Lampa.Template.js('card', {});
          // Меняем вид card
          item.querySelector('.card__img').innerHTML = cat.svg;
          item.querySelector('.card__img').style.background = 'none';
          item.querySelector('.card__title').textContent = cat.title;
          // Удалим "просмотров" и т.д.
          let view = item.querySelector('.card__view');
          if(view) view.remove();

          // При клике — переходим в список
          item.addEventListener('hover:enter',()=>{
            Lampa.Activity.push({
              url: cat.url,
              title: cat.title,
              component: 'category_full',
              source: 'KP',
              card_type: true,
              page: 1
            });
          });

          scroll.append(item);
        });

        // Вставляем в html
        html.querySelector('.list__body').append(scroll.render());
        return html;
      };

      this.start = function(){
        Lampa.Controller.add('content', {
          toggle: ()=>{
            Lampa.Controller.collectionSet( this.render() );
          },
          back: this.back
        });
        Lampa.Controller.toggle('content');
      };

      this.back = function(){
        Lampa.Activity.backward();
      };

      this.render = function(){
        return html;
      };

      this.destroy = function(){
        scroll.destroy();
        if(html) html.remove();
        scroll = null;
        html = null;
      };
    }

    // Регистрируем в Lampa
    Lampa.Component.add('kp_categories', KpCategories);
  })();

  // При нажатии на кнопку — открываем компонент kp_categories
  function onKpButtonEnter(){
    Lampa.Activity.push({
      component: 'kp_categories'
    });
  }

  // Добавляем кнопку «Кинопоиск»
  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    onKpButtonEnter
  );


  /**
   * ============================
   * 3) Подключаем исходник «KP» (ваш же рабочий код) 
   *    и регистрируем источник
   * ============================
   */
  if(!window.KP_PLUGIN){
    window.KP_PLUGIN = (function(){
      'use strict';

      // ... (далее ровно ваш код «кп финал урааааа.txt», 
      //     без Select.show, т.к. мы уже сделали свою логику)

      var network = new Lampa.Reguest();
      var cache = {};
      var total_cnt = 0;
      var proxy_cnt = 0;
      var good_cnt = 0;
      var menu_list = [];
      var genres_map = {};
      var countries_map = {};
      var CACHE_SIZE = 100;
      var CACHE_TIME = 1000*60*60;
      var SOURCE_NAME = 'KP';
      var SOURCE_TITLE= 'KP';

      // ... ниже – функции get, getComplite, etc.
      // (Берём всё из вашего «кп финал урааааа.txt» начиная со слов: 
      //    "function get(method, oncomplite, onerror){...}" 
      //    и заканчивая "})();"
      //    чтобы не перепечатывать здесь 200+ строк, 
      //    оставляю укороченный вариант для примера.)

      // Для наглядности всё ужато:
      function get(method,oncomplite,onerror){ /* ... */ }
      function getList(method,params,oncomplite,onerror){ /* ... */ }
      function full(params,oncomplite,onerror){ /* ... */ }
      function list(params,oncomplite,onerror){ /* ... */ }
      function main(params,oncomplite,onerror){ /* ... */ }
      function category(params,oncomplite,onerror){ /* ... */ }
      function search(params,oncomplite){ /* ... */ }
      function person(params,oncomplite){ /* ... */ }
      function kpMenu(options,oncomplite){ /* ... */ }
      function clear(){ /* ... */ }

      return {
        SOURCE_NAME: SOURCE_NAME,
        SOURCE_TITLE: SOURCE_TITLE,
        main: main,
        menu: kpMenu,
        full: full,
        list: list,
        category: category,
        clear: clear,
        person: person,
        seasons: function(tv, from, oncomplite){ /* ... */ },
        menuCategory:function(params,oncomplite){ oncomplite([]); },
        discovery: function(){
          // ...
          return {
            title: SOURCE_TITLE,
            search: search,
            params: { align_left:true, object:{source: SOURCE_NAME} },
            onMore: function(params){ /* ... */ },
            onCancel: network.clear.bind(network)
          };
        }
      };
    })();
  }

  // Регистрируем источник
  (function registerKpSource(){
    function addPlugin(){
      if(Lampa.Api.sources['KP']){
        Lampa.Noty.show('Установлен плагин несовместимый с kp_source');
        return;
      }
      Lampa.Api.sources['KP'] = KP_PLUGIN;
      Object.defineProperty(Lampa.Api.sources, 'KP', {
        get:function(){return KP_PLUGIN;}
      });

      var sources;
      if(Lampa.Params.values && Lampa.Params.values['source']){
        sources = Object.assign({}, Lampa.Params.values['source']);
        sources['KP'] = KP_PLUGIN.SOURCE_TITLE;
      } else {
        sources = {};
        var ALL_SOURCES = [
          { name:'tmdb', title:'TMDB' },
          { name:'cub', title:'CUB' },
          { name:'pub', title:'PUB' },
          { name:'filmix', title:'FILMIX' },
          { name:'KP', title: KP_PLUGIN.SOURCE_TITLE }
        ];
        ALL_SOURCES.forEach(function(s){
          if(Lampa.Api.sources[s.name]) sources[s.name] = s.title;
        });
      }
      // добавляем KP в выпадающий список "Источник"
      Lampa.Params.select('source', sources, 'tmdb');
    }

    if(window.appready) addPlugin();
    else {
      Lampa.Listener.follow('app',function(e){
        if(e.type==='ready') addPlugin();
      });
    }
  })();

})();
