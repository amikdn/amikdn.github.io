(function () {
  'use strict';

  /**
   * 0) Создаём объект KP_API для запросов к kinopoiskapiunofficial.tech
   */
  var KP_API = (function(){
    var network = new Lampa.Reguest();
    var API_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616'; // пример ключа

    function get(method, onSuccess, onError){
      var url = 'https://kinopoiskapiunofficial.tech/' + method;

      network.silent(
        url,
        function(json){ onSuccess(json); },
        function(a,c){ if(onError) onError(a,c); },
        false,
        {
          headers: { 'X-API-KEY': API_KEY }
        }
      );
    }

    return {
      get: get
    };
  })();


  /**
   * 1) Добавляем кнопку «Кинопоиск» в главное меню
   */
  var ITEM_TV_SELECTOR = '[data-action="tv"]';
  var ITEM_MOVE_TIMEOUT = 2000;

  function moveItemAfter(item, after) {
    return setTimeout(function () {
      $(item).insertAfter($(after));
    }, ITEM_MOVE_TIMEOUT);
  }

  function addMenuButton(attr, text, icon, onEnter){
    var SELECTOR = '[' + attr + ']';

    var btn = $(`
      <li class="menu__item selector" ${attr}>
        <div class="menu__ico">${icon}</div>
        <div class="menu__text">${text}</div>
      </li>
    `);

    btn.on('hover:enter', onEnter);

    function doInsert(){
      Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(btn);
      moveItemAfter(SELECTOR, ITEM_TV_SELECTOR);
    }

    if (window.appready) {
      doInsert();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if(e.type === 'ready') doInsert();
      });
    }
  }

  // Иконка для «Кинопоиск»
  var iconKP = `
    <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
      <g fill="none" fill-rule="evenodd">
        <g fill="currentColor" fill-rule="nonzero">
          <path fill-rule="evenodd" d="
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
          "/>
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

  // Создаём пункт «Кинопоиск»
  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function(){
      // По нажатию открываем новую Activity "kp_categories"
      Lampa.Activity.push({
        title: 'Кинопоиск',
        component: 'kp_categories',
        page: 1
      });
    }
  );


  /**
   * 2) Регистрируем новый компонент "kp_categories"
   */
  Lampa.Component.add('kp_categories', function(activity){

    // Основной корневой DOM-элемент
    var root = document.createElement('div');
    root.classList.add('kp-cats');

    // Скролл
    var scroll = new Lampa.Scroll({ mask:true, over:true });
    var scrollContent = scroll.render(true); // DOM-узел

    // Контейнер под карточки
    var body = document.createElement('div');
    body.classList.add('kp-cats__body');

    // Добавляем в DOM
    scrollContent.appendChild(body);
    root.appendChild(scrollContent);

    // Массив карточек
    var items = [];
    var last;

    /**
     * Загружаем TOP_100_POPULAR_FILMS
     */
    function loadData(){
      activity.loader(true);

      KP_API.get(
        'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1',
        function(json){
          var films = json.films || [];
          createCards(films);
          activity.loader(false);
          activity.toggle(); // показать экран
        },
        function(err){
          console.log('KP_API error:', err);
          Lampa.Noty.show('Ошибка Кинопоиск');
          activity.loader(false);
          activity.toggle();
        }
      );
    }

    /**
     * Создаём карточки
     */
    function createCards(films){
      films.forEach(function(f){
        var cardData = {
          title: f.nameRu || f.nameEn || 'Без названия',
          img: f.posterUrlPreview || '',
          year: f.year || '',
        };

        // Card Lampa
        var card = new Lampa.Card(cardData, {object: activity});
        card.create();

        card.onFocus = function(target){
          last = target;
          scroll.update(card.render(true));
        };
        card.onEnter = function(){
          // Открыть детальную карточку
          Lampa.Activity.push({
            url: 'api/v2.2/films/' + f.filmId,
            title: cardData.title,
            component: 'full',
            source: 'KP',
            page: 1
          });
        };

        // Добавляем в DOM
        body.appendChild(card.render(true));
        items.push(card);
      });
    }

    // Методы компонента
    this.create = function(){
      loadData();
    };

    this.start = function(){
      // Настраиваем контроллер
      Lampa.Controller.add('content',{
        toggle: ()=>{
          // передаём чистый DOM
          Lampa.Controller.collectionSet(false, this.render(true));
          Lampa.Controller.collectionFocus(last, false, this.render(true));
        },
        left: ()=>{
          if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: ()=>{
          if (Lampa.Navigator.canmove('right')) Lampa.Navigator.move('right');
        },
        up: ()=>{
          if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: ()=>{
          if (Lampa.Navigator.canmove('down')) Lampa.Navigator.move('down');
        },
        back: ()=>{
          activity.backward();
        }
      });

      Lampa.Controller.toggle('content');
    };

    // Возвращаем DOM
    this.render = function(internal){
      if(internal) return root;    // DOM-узел
      return $(root);             // jQuery
    };

    // Необязательно
    this.pause = function(){};
    this.stop = function(){};
    this.destroy = function(){
      scroll.destroy();
      items.forEach(function(c){ c.destroy(); });
      items = [];
      root.remove();
    };
  });

})();
