(function () {
  'use strict';

  // =============================
  // 0) Функция-запрос к Кинопоиску (KP_API)
  // =============================

  var KP_API = (function(){
    var network = new Lampa.Reguest();
    var X_API_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616'; // пример ключа

    /**
     * Запрос к kinopoiskapiunofficial.tech
     * @param {string} method - например: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1'
     * @param {function} oncomplite - колбэк успеха
     * @param {function} onerror - колбэк ошибки
     */
    function get(method, oncomplite, onerror){
      var url = 'https://kinopoiskapiunofficial.tech/' + method;

      // network.silent(url, success, fail, post_data=false, extra_headers={...})
      network.silent(
        url,
        function(json){
          oncomplite(json);
        },
        function(a, c){
          if (onerror) onerror(a, c);
        },
        false,
        {
          headers: {
            'X-API-KEY': X_API_KEY
          }
        }
      );
    }

    // Можно расширять другими методами (кеш, прокси и т.п.)
    return {
      get: get
    };
  })();


  // =============================
  // 1) Добавляем кнопку "Кинопоиск" в меню Lampa
  // =============================

  Lampa.Platform.tv();

  var ITEM_TV_SELECTOR = '[data-action="tv"]';
  var ITEM_MOVE_TIMEOUT = 2000;

  function moveItemAfter(item, after) {
    return setTimeout(function () {
      $(item).insertAfter($(after));
    }, ITEM_MOVE_TIMEOUT);
  }

  // Функция для добавления кнопки
  function addMenuButton(newItemAttr, newItemText, iconHTML, onEnterHandler) {
    var NEW_ITEM_ATTR = newItemAttr;
    var NEW_ITEM_SELECTOR = '[' + NEW_ITEM_ATTR + ']';

    var field = $(`
      <li class="menu__item selector" ${NEW_ITEM_ATTR}>
        <div class="menu__ico">${iconHTML}</div>
        <div class="menu__text">${newItemText}</div>
      </li>
    `);

    field.on('hover:enter', onEnterHandler);

    if (window.appready) {
      Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
      moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
          moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
        }
      });
    }
  }

  // Иконка для кнопки
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
    function () {
      // При клике - открываем нашу Activity
      Lampa.Activity.push({
        title: 'Кинопоиск - Категории',
        component: 'kp_categories', // название компонента
        page: 1
      });
    }
  );


  // =============================
  // 2) Регистрируем новый компонент "kp_categories"
  // =============================

  Lampa.Component.add('kp_categories', function (activity) {
    var root = document.createElement('div');
    root.classList.add('kp-categories-container');

    // Создаём прокручиваемую область
    var scroll = new Lampa.Scroll({
      mask: true,
      over: true
    });
    var scrollContent = scroll.render(true); // DOM-элемент

    // Блок, куда будем складывать карточки
    var body = document.createElement('div');
    body.classList.add('kp-categories-body');

    // Вставляем всё
    scrollContent.appendChild(body);
    root.appendChild(scrollContent);

    // Массив для карточек
    var cards = [];
    var lastFocused;

    /**
     * Загружаем список "Топ-100 популярных фильмов" (пример)
     * через KP_API.get(...)
     */
    function loadTopFilms() {
      activity.loader(true);

      // Пример запроса к "TOP_100_POPULAR_FILMS"
      // В ответ придёт JSON вида { films: [...], pagesCount: ... }
      KP_API.get(
        'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1',
        function(json){
          // json.films — массив
          var items = json.films || [];
          createCards(items);
          activity.loader(false);
          activity.toggle();
        },
        function(error){
          console.log('KP_API error:', error);
          activity.loader(false);
          Lampa.Noty.show('Ошибка запроса к Кинопоиску');
          activity.toggle();
        }
      );
    }

    /**
     * Создаём карточки по массиву фильмов
     */
    function createCards(items){
      items.forEach(function(item){
        // item: { filmId, nameRu, posterUrlPreview, ... }
        var cardData = {
          title: item.nameRu || item.nameEn || 'Без названия',
          img: item.posterUrlPreview || '',
          // Можно добавить описание, год и т.д.
          year: item.year || ''
        };

        // Создаём карточку Lampa
        var card = new Lampa.Card(cardData, { object: activity });
        card.create();

        // События
        card.onFocus = function (target, elemData) {
          lastFocused = target;
          scroll.update(card.render(true));
        };

        card.onEnter = function () {
          // При клике — переходим в список фильмов (или детальную)
          Lampa.Activity.push({
            url: 'api/v2.2/films/' + item.filmId,
            title: cardData.title,
            component: 'full',   // можно 'category_full', но для одиночного фильма лучше 'full'
            source: 'KP',
            card_type: true,
            page: 1
          });
        };

        // Добавляем в DOM
        body.appendChild(card.render(true));
        cards.push(card);
      });
    }

    // Метод create() — вызывается при инициализации
    this.create = function() {
      // Запускаем загрузку
      loadTopFilms();
    };

    // При старте
    this.start = function() {
      // Настраиваем контроллер
      Lampa.Controller.add('content', {
        toggle: () => {
          Lampa.Controller.collectionSet(false, root); 
          Lampa.Controller.collectionFocus(lastFocused, false, root);
        },
        left: () => {
          if (Lampa.Navigator.canmove('left')) {
            Lampa.Navigator.move('left');
          } else {
            Lampa.Controller.toggle('menu');
          }
        },
        right: () => {
          if (Lampa.Navigator.canmove('right')) {
            Lampa.Navigator.move('right');
          }
        },
        up: () => {
          if (Lampa.Navigator.canmove('up')) {
            Lampa.Navigator.move('up');
          } else {
            Lampa.Controller.toggle('head');
          }
        },
        down: () => {
          if (Lampa.Navigator.canmove('down')) {
            Lampa.Navigator.move('down');
          }
        },
        back: () => {
          Lampa.Activity.backward();
        }
      });

      Lampa.Controller.toggle('content');
    };

    // Дополнительно:
    this.pause = function(){};
    this.stop  = function(){};
    this.render = function(internal){
      if (internal) return root;    // DOM-элемент
      return $(root);              // jQuery
    };
    this.destroy = function(){
      scroll.destroy();
      cards.forEach(function(c){ c.destroy && c.destroy(); });
      cards = [];
      root.remove();
    };
  });

})();
