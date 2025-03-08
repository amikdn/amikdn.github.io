(function () {
  'use strict';

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

  // Добавляем пункт в меню
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

  // SVG-иконка для кнопки
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

  // Добавляем пункт "Кинопоиск"
  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function () {
      // Вместо Select.show() — создаём новую Activity
      Lampa.Activity.push({
        title: 'Кинопоиск - Категории',
        component: 'kp_categories', // наш компонент
        page: 1
      });
    }
  );

  // =============================
  // 2) Создаём компонент kp_categories (новая Activity)
  // =============================

  // Регистрируем компонент
  Lampa.Component.add('kp_categories', function (activity) {
    // Создаём корневой DOM
    var root = document.createElement('div');
    root.classList.add('kp-categories-container');

    // Создаём скролл
    var scroll = new Lampa.Scroll({
      mask: true,
      over: true
    });
    var scrollContent = scroll.render(true); // это DOM-элемент скролла

    // Внутренний блок для карточек
    var body = document.createElement('div');
    body.classList.add('kp-categories-body');

    // Вставляем body внутрь скролла
    scrollContent.appendChild(body);
    // Вставляем скролл в root
    root.appendChild(scrollContent);

    // Список категорий (пример)
    var categories = [
      { title: 'Популярные Фильмы', url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
      { title: 'Топ Фильмы',        url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
      { title: 'Росс. фильмы',      url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
      { title: 'Росс. сериалы',     url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
      { title: 'Сериалы',           url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
      { title: 'Телешоу',           url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
    ];

    var cards = [];  // массив созданных карточек
    var lastFocused; // кто в фокусе

    // Создаём контент
    this.create = function() {
      activity.loader(true); // показываем лоадер

      // Для каждой категории создаём карточку
      categories.forEach(function(cat) {
        // Пример данных для карточки
        var cardData = {
          title: cat.title,
          // можно хранить доп. данные, например: cat.url
        };

        // Создаём Lampa.Card
        var card = new Lampa.Card(cardData, { object: activity, card_category: true });
        card.create();

        // onFocus
        card.onFocus = function (target, elemData) {
          lastFocused = target;
          scroll.update(card.render(true));
        };

        // onEnter
        card.onEnter = function () {
          // Переходим на список фильмов/сериалов
          Lampa.Activity.push({
            url: cat.url,
            title: cat.title,
            component: 'category_full',
            source: 'KP',
            card_type: true,
            page: 1
          });
        };

        // Добавляем карточку в DOM
        body.appendChild(card.render(true));
        cards.push(card);
      });

      activity.loader(false); // убираем лоадер
      activity.toggle();      // показываем контент
    };

    // При первом показе
    this.start = function() {
      // Регистрируем контроллер
      Lampa.Controller.add('content', {
        toggle: () => {
          // Включаем управление
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

      // Переключаемся на контроллер
      Lampa.Controller.toggle('content');
    };

    // Пауза (необязательно)
    this.pause = function() {};
    // Стоп (необязательно)
    this.stop = function() {};
    // Уничтожение
    this.destroy = function() {
      scroll.destroy();
      cards.forEach(function(c) { c.destroy && c.destroy(); });
      cards = [];
      root.remove();
    };

    // Важно: render(true) => вернуть чистый DOM
    // render(false) => вернуть jQuery
    this.render = function(internal) {
      if (internal) {
        return root;    // DOM-элемент
      }
      return $(root);   // jQuery-обёртка
    };
  });

})();
