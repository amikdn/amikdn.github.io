(function () {
  'use strict';

  // =============================
  // Часть 1. Добавление кнопки "Кинопоиск" в меню Lampa
  // =============================

  Lampa.Platform.tv();

  var ITEM_TV_SELECTOR = '[data-action="tv"]';
  var ITEM_MOVE_TIMEOUT = 2000;

  // Функция для перемещения элемента в меню
  function moveItemAfter(item, after) {
    return setTimeout(function () {
      $(item).insertAfter($(after));
    }, ITEM_MOVE_TIMEOUT);
  }

  // Функция для добавления кнопки в меню
  function addMenuButton(newItemAttr, newItemText, iconHTML, onEnterHandler) {
    var NEW_ITEM_ATTR = newItemAttr;
    var NEW_ITEM_SELECTOR = '[' + NEW_ITEM_ATTR + ']';

    // Создаём пункт меню
    var field = $(`
      <li class="menu__item selector" ${NEW_ITEM_ATTR}>
        <div class="menu__ico">${iconHTML}</div>
        <div class="menu__text">${newItemText}</div>
      </li>
    `);

    // Обработка нажатия
    field.on('hover:enter', onEnterHandler);

    // Вставляем пункт после кнопки TV
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

  // Иконка для кнопки "Кинопоиск"
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

  // Добавляем кнопку «Кинопоиск» в меню
  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function () {
      // Вместо Select.show — переходим в нашу новую Activity
      Lampa.Activity.push({
        component: 'kp_categories',
        // Можем передавать любые данные
        title: 'Кинопоиск - Категории',
        source: 'KP', 
        page: 1
      });
      console.log("Нажата кнопка Кинопоиск -> открываем Activity kp_categories");
    }
  );

  // =============================
  // Часть 2. Опциональный объект KP_PLUGIN (если нужно как источник)
  // =============================

  if (!window.KP_PLUGIN) {
    // Сюда можно вставить ваш уже имеющийся код kp_source_plugin,
    // если нужно регистрировать KP как полноценный источник.
    // Если вам не нужно регистрировать как источник — можно убрать.
    window.KP_PLUGIN = {
      // Заглушка
      SOURCE_NAME: 'KP',
      SOURCE_TITLE: 'KP',
      clear: function(){},
      // ...и т.д.
    };
  }

  // =============================
  // Часть 3. Создаём компонент «kp_categories»
  // =============================

  // Это Activity, которое будет открываться при нажатии на кнопку «Кинопоиск».
  // Здесь мы формируем DOM, возвращаем его в render(true),
  // и даём Лампе управлять через collectionSet/collectionFocus.

  Lampa.Component.add('kp_categories', function KpCategories(activity) {
    // 1) Создаём корневой элемент (DOM)
    var html = document.createElement('div');
    html.classList.add('kp-categories-container');

    // 2) Создаём скролл
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var scrollContent = scroll.render(true);

    // 3) Внутренний контейнер для карточек
    var body = document.createElement('div');
    body.classList.add('kp-categories-body');

    // Вставляем body в scrollContent
    scrollContent.appendChild(body);

    // Вставляем scrollContent в корневой html
    html.appendChild(scrollContent);

    // Список категорий (просто пример)
    var categories = [
      { title: 'Популярные Фильмы', url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS' },
      { title: 'Топ Фильмы',        url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS' },
      { title: 'Популярные российские фильмы',  url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' },
      { title: 'Популярные российские сериалы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' },
      { title: 'Популярные Сериалы',            url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' },
      { title: 'Популярные Телешоу',            url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW' }
    ];

    // Храним Card-объекты, чтобы потом их уничтожить
    var items = [];
    var lastFocused; // кто был в фокусе

    // Метод create (вызывается при создании)
    this.create = function() {
      // Создаём карточки
      categories.forEach((cat) => {
        // Простой объект для Card
        var elemData = { title: cat.title };

        // Создаём Card
        var card = new Lampa.Card(elemData, { object: activity, card_category: true });
        card.create();

        // onFocus — когда карточка в фокусе
        card.onFocus = (target) => {
          lastFocused = target;
          scroll.update(card.render(true)); 
        };

        // onEnter — при клике Enter
        card.onEnter = () => {
          // Переходим на category_full
          Lampa.Activity.push({
            url: cat.url,
            title: cat.title,
            component: 'category_full',
            source: 'KP',
            card_type: true,
            page: 1
          });
        };

        // Вставляем в body
        body.appendChild(card.render(true));
        items.push(card);
      });

      // Отключаем лоадер
      activity.loader(false);

      // Делаем toggle (переход на слой content)
      activity.toggle();
    };

    // Метод start (вызывается при первом показе)
    this.start = function() {
      // Регистрируем контроллер content
      Lampa.Controller.add('content', {
        toggle: () => {
          Lampa.Controller.collectionSet(false, html);
          Lampa.Controller.collectionFocus(lastFocused, false, html);
        },
        left: () => {
          if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: () => {
          if (Lampa.Navigator.canmove('right')) Lampa.Navigator.move('right');
        },
        up: () => {
          if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: () => {
          if (Lampa.Navigator.canmove('down')) Lampa.Navigator.move('down');
        },
        back: () => {
          Lampa.Activity.backward();
        }
      });

      // Переключаемся на «content»
      Lampa.Controller.toggle('content');
    };

    // Пауза (необязательно)
    this.pause = function() {};
    // Стоп (необязательно)
    this.stop = function() {};
    // Уничтожение
    this.destroy = function() {
      scroll.destroy();
      items.forEach(c => c.destroy && c.destroy());
      items = [];
      if (html) html.remove();
    };

    // Важно: render(true) должен вернуть DOM-элемент, а render(false) — jQuery
    this.render = function(js) {
      return js ? html : $(html);
    };
  });

})();
