(function(){
  'use strict';

  /**
   * 1) Создаём (или уже имеем) источник «KP»
   *    (код, регистрирующий source:'KP', здесь опущен для краткости —
   *    предполагаем, что у вас уже есть работающий KP_PLUGIN).
   * 
   *    Пример кода источника вы показывали ранее, где:
   *    Lampa.Api.sources['KP'] = { main, list, full, search, ... }
   */


  /**
   * 2) Создаём компонент «kp_categories»
   */
  Lampa.Component.add('kp_categories', function(){
    // Приватные переменные компонента
    let scroll;
    let html;

    /**
     * Вызывается один раз при создании экземпляра компонента
     */
    this.create = function(){
      // 1) Создадим скролл
      scroll = new Lampa.Scroll({
        mask: true,    // «маска» для затемнения
        over: true,    // скролл «над» основным слоем
      });

      // 2) Создадим массив категорий
      const categories = [
        {
          title: 'Популярные Фильмы',
          icon: '<svg width="60" height="60" fill="currentColor" ...>...</svg>',
          url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'
        },
        {
          title: 'Топ Фильмы',
          icon: '<svg ...>...</svg>',
          url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS'
        },
        {
          title: 'Популярные российские фильмы',
          icon: '<svg ...>...</svg>',
          url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'
        },
        // ... и т.д.
      ];

      // 3) Будем добавлять верстку
      //    Для каждого элемента создаём DIV с классами folder + selector,
      //    чтобы выглядело похоже на стандартные папки.
      categories.forEach(cat=>{
        let item = document.createElement('div');
        item.classList.add('folder','selector'); // важны классы .folder и .selector

        // Внутренний html
        // .folder__icon и .folder__name — так Lampa обычно оформляет «папки»
        item.innerHTML = `
          <div class="folder__icon">${cat.icon}</div>
          <div class="folder__name">${cat.title}</div>
        `;

        // Обработка клика «enter»
        item.addEventListener('hover:enter', ()=>{
          Lampa.Activity.push({
            url: cat.url,
            title: cat.title,
            component: 'category_full',
            source: 'KP',     // источник
            card_type: true,
            page: 1
          });
        });

        // Добавляем в scroll
        scroll.append(item);
      });

      // 4) Сам DOM-элемент scroll
      html = scroll.render();

      // Событие «назад» — закрыть компонент
      // (можно настроить иначе, если нужно)
      this.listener.follow('back',()=>{
        Lampa.Activity.backward();
      });
    };

    /**
     * Запуск компонента: передаём управление Lampa.Controller
     */
    this.start = function(){
      // Регистрируем «content» — тогда стрелки/enter будут работать
      Lampa.Controller.add('content',{
        type: 'main',
        control: this,
        back: ()=>{
          this.listener.send('back');
        }
      });
      // Передаём управление
      Lampa.Controller.toggle('content');
    };

    /**
     * Функции «пауз» и «стопов» — пока пустые
     */
    this.pause = function(){};
    this.stop  = function(){};

    /**
     * Метод render — возвращает корневой DOM
     */
    this.render = function(){
      return html;
    };

    /**
     * Уничтожение
     */
    this.destroy = function(){
      scroll && scroll.destroy();
      scroll = null;
      html   = null;
    };
  });


  /**
   * 3) Добавляем кнопку «Кинопоиск» в меню
   */
  function addKpMenuButton(){
    // Иконка:
    let iconKP = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="192"
        height="192"
        viewBox="0 0 192 192"
      >
        <!-- ... -->
      </svg>
    `;

    let ITEM_TV_SELECTOR = '[data-action="tv"]';
    let attr = 'data-action="kp_menu"';
    let sel  = '['+attr+']';

    let field = $(`
      <li class="menu__item selector" ${attr}>
        <div class="menu__ico">${iconKP}</div>
        <div class="menu__text">Кинопоиск</div>
      </li>
    `);

    field.on('hover:enter', ()=>{
      // При клике — открываем наш компонент
      Lampa.Activity.push({
        title: 'Кинопоиск',
        component: 'kp_categories'
      });
    });

    function moveItemAfter(itemSel, afterSel){
      setTimeout(()=>{
        $(itemSel).insertAfter($(afterSel));
      },2000);
    }

    if(window.appready){
      Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
      moveItemAfter(sel, ITEM_TV_SELECTOR);
    }
    else{
      Lampa.Listener.follow('app',(e)=>{
        if(e.type==='ready'){
          Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
          moveItemAfter(sel, ITEM_TV_SELECTOR);
        }
      });
    }
  }

  // Вызываем добавление кнопки
  addKpMenuButton();

})();
