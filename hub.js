Lampa.Platform.tv();

(function () {
  'use strict';

  /** Дефолтные настройки для трёх кнопок */
  const defaults = {
    1: { action: 'movie',   svg: `<svg><use xlink:href="#sprite-movie"></use></svg>`,   name: 'Фильмы' },
    2: { action: 'tv',      svg: `<svg><use xlink:href="#sprite-tv"></use></svg>`,      name: 'Сериалы' },
    3: { action: 'cartoon', svg: `<svg><use xlink:href="#sprite-cartoon"></use></svg>`, name: 'Мультфильмы' }
  };

  /** CSS — Адаптив + Тема для всех устройств + Логика роста кнопок */
  const css = `
  /* ТЕМА ДЛЯ ВСЕХ УСТРОЙСТВ (МЕНЮ, НАСТРОЙКИ И Т.Д.) */
  body .menu__item, html body .menu__item, body .menu .menu__item,
  body .settings-folder, body .settings-param, html body .settings-folder, html body .settings-param,
  body .selectbox-item, html body .selectbox-item,
  body .full-start__button, html body .full-start__button,
  body .player-panel .button, html body .player-panel .button {
      background: linear-gradient(to top, rgba(80,80,80,0.35), rgba(30,30,35,0.25)) !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.5) !important;
      border-radius: 14px !important;
      transition: all .3s ease !important;
  }

  body .menu__item:hover, body .menu__item.focus, body .menu__item.traverse,
  body .settings-folder.focus, body .settings-param.focus,
  body .selectbox-item.focus, body .full-start__button.focus, body .full-start__button:hover,
  body .player-panel .button.focus, body .player-panel .button:hover {
      background: linear-gradient(to top, rgba(100,100,100,0.45), rgba(40,40,45,0.35)) !important;
      border-color: rgba(255,255,255,0.25) !important;
      box-shadow: inset 0 0 8px rgba(0,0,0,0.6) !important;
  }

  body .menu__content, html body .menu__content {
      background: linear-gradient(to top, rgba(80,80,80,0.2), rgba(30,30,35,0.15)) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.4) !important;
      border-radius: 12px !important;
  }

  /* НИЖНИЙ БАР */
  .navigation-bar__body {
      display: flex !important;
      justify-content: center !important;
      align-items: flex-end !important; /* Выравнивание по нижнему краю для роста вверх */
      width: 100% !important;
      padding: 6px 2px !important;
      background: transparent !important;
      border-top: none !important;
      overflow: visible !important;
      box-sizing: border-box;
      height: 80px !important; /* Фиксированная высота контейнера */
  }

  .navigation-bar__item {
      flex: 1 1 0 !important;
      min-width: 55px !important;
      max-width: 110px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center;
      justify-content: center;
      height: 64px !important; /* Обычная высота */
      margin: 0 3px !important;
      background: linear-gradient(to top, rgba(80,80,80,0.35), rgba(30,30,35,0.25)) !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.5) !important;
      border-radius: 14px !important;
      transition: height .2s ease, background .3s ease, border-color .3s ease !important;
      position: relative !important;
  }

  /* ТОЛЬКО ТРИ ОСНОВНЫЕ КНОПКИ РАСТУТ ВВЕРХ НА 4px */
  .navigation-bar__item[data-position="1"].active,
  .navigation-bar__item[data-position="2"].active,
  .navigation-bar__item[data-position="3"].active {
      height: 68px !important; /* 64 + 4 */
      background: linear-gradient(to top, rgba(100,100,100,0.45), rgba(40,40,45,0.35)) !important;
      border-color: rgba(255,255,255,0.25) !important;
  }

  /* ОСТАЛЬНЫЕ КНОПКИ (ДОМОЙ, ПОИСК И Т.Д.) НЕ МЕНЯЮТСЯ */
  .navigation-bar__item.active:not([data-position="1"]):not([data-position="2"]):not([data-position="3"]) {
      height: 64px !important;
      transform: none !important;
  }

  .navigation-bar__icon svg {
      width: 26px !important;
      height: 26px !important;
      fill: currentColor;
  }

  .navigation-bar__label {
      font-size: 10px !important;
      color: #fff !important;
      white-space: nowrap !important;
      text-align: center !important;
  }

  /* ГОРИЗОНТАЛЬНЫЙ РЕЖИМ (ВЕРХНИЙ БАР) */
  @media (orientation: landscape) {
      .navigation-bar__body { display: none !important; }
      .navigation-bar__item {
          flex: none !important;
          height: 32px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 10px !important;
      }
      /* Выбранная основная кнопка смещается вниз на 2px */
      .navigation-bar__item[data-position="1"].active,
      .navigation-bar__item[data-position="2"].active,
      .navigation-bar__item[data-position="3"].active {
          transform: translateY(2px) !important;
          height: 32px !important;
          background: transparent !important;
      }
      .navigation-bar__label { display: none !important; }
  }
  `;

  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function injectCSS(){
    if(!$('#menu-glass-style-all')){
      const st=document.createElement('style');
      st.id='menu-glass-style-all';
      st.textContent=css;
      document.head.appendChild(st);
    }
  }

  function emulateSidebarClick(action){
    for(const el of $$('.menu__item[data-action], .selector')){
      if(el.dataset.action === action){
        el.click();
        return true;
      }
    }
    return false;
  }

  function removeActiveFromMain(){
    $$('.navigation-bar__item[data-position="1"], .navigation-bar__item[data-position="2"], .navigation-bar__item[data-position="3"]')
      .forEach(el => el.classList.remove('active'));
  }

  function addItem(position, defaultAction, defaultSvg, defaultName){
    const bar = $('.navigation-bar__body');
    if(!bar || bar.querySelector(`[data-position="${position}"]`)) return;

    const savedAction = localStorage.getItem(`bottom_bar_${position}_action`) || defaultAction;
    const savedSvg = localStorage.getItem(`bottom_bar_${position}_svg`) || defaultSvg;
    const savedName = localStorage.getItem(`bottom_bar_${position}_name`) || defaultName;

    const div = document.createElement('div');
    div.className = 'navigation-bar__item';
    div.dataset.action = savedAction;
    div.dataset.position = position;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'navigation-bar__icon';
    iconDiv.innerHTML = savedSvg;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'navigation-bar__label';
    labelDiv.textContent = savedName;

    div.appendChild(iconDiv);
    div.appendChild(labelDiv);

    const search = bar.querySelector('.navigation-bar__item[data-action="search"]');
    if(search) bar.insertBefore(div, search);
    else bar.appendChild(div);

    div.addEventListener('click', () => {
      removeActiveFromMain();
      div.classList.add('active');
      emulateSidebarClick(div.dataset.action);
    });
  }

  function updateActiveState() {
    const mainItems = $$('.navigation-bar__item[data-position="1"], .navigation-bar__item[data-position="2"], .navigation-bar__item[data-position="3"]');
    const activeMenu = $('.menu__item.focus, .menu__item.active');
    
    if (activeMenu) {
      const action = activeMenu.dataset.action;
      mainItems.forEach(item => {
        if (item.dataset.action === action) item.classList.add('active');
        else item.classList.remove('active');
      });
    }
  }

  function initBar(){
    addItem('1', defaults[1].action, defaults[1].svg, defaults[1].name);
    addItem('2', defaults[2].action, defaults[2].svg, defaults[2].name);
    addItem('3', defaults[3].action, defaults[3].svg, defaults[3].name);

    // Слушатель для всех кнопок навигации (чтобы сбрасывать актив у основных)
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.navigation-bar__item');
      if (navItem) {
        const pos = navItem.dataset.position;
        if (pos !== '1' && pos !== '2' && pos !== '3') {
          removeActiveFromMain();
        }
      }
    });

    const observer = new MutationObserver(updateActiveState);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // ЗАПУСК: Стили инжектим сразу, бар инициализируем по готовности
  injectCSS();

  const mo = new MutationObserver(() => {
    if($('.navigation-bar__body')){
      mo.disconnect();
      initBar();
    }
  });
  mo.observe(document.documentElement, {childList: true, subtree: true});
})();
