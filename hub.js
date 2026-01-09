Lampa.Platform.tv();

(function () {
  'use strict';

  var InterFaceMod = {
    settings: {
      theme: 'default'
    }
  };

  /** Дефолтные настройки для трёх кнопок (позиции 1-3 слева направо) */
  const defaults = {
    1: { action: 'movie',   svg: `<svg><use xlink:href="#sprite-movie"></use></svg>`,   name: 'Фильмы' },
    2: { action: 'tv',      svg: `<svg><use xlink:href="#sprite-tv"></use></svg>`,      name: 'Сериалы' },
    3: { action: 'cartoon', svg: `<svg><use xlink:href="#sprite-cartoon"></use></svg>`, name: 'Мультфильмы' }
  };

  /** CSS — улучшенная адаптивность и поддержка тем */
  const css = `
  :root {
      --nb-item-height: 64px;
      --nb-item-min-width: 55px;
      --nb-icon-size: 28px;
      --nb-svg-size: 26px;
      --nb-label-size: 10px;
      --nb-gap: 6px;
      --nb-item-bg: linear-gradient(to top, rgba(80,80,80,0.35), rgba(30,30,35,0.25));
      --nb-item-border: 1px solid rgba(255,255,255,0.12);
      --nb-item-shadow: inset 0 0 6px rgba(0,0,0,0.5);
      --nb-item-radius: 14px;
      --nb-active-bg: linear-gradient(to top, rgba(100,100,100,0.45), rgba(40,40,45,0.35));
      --nb-active-border: rgba(255,255,255,0.4);
      --nb-active-shadow: inset 0 0 8px rgba(0,0,0,0.6), 0 0 10px rgba(255,255,255,0.1);
      --nb-active-text: #fff;
  }

  .navigation-bar__body {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      padding: 8px 4px !important;
      background: transparent !important;
      border-top: none !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      box-sizing: border-box;
      scrollbar-width: none;
      gap: var(--nb-gap) !important;
  }
  .navigation-bar__body::-webkit-scrollbar { display: none; }

  .navigation-bar__item {
      flex: 1 1 0 !important;
      min-width: var(--nb-item-min-width) !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center;
      justify-content: center;
      height: var(--nb-item-height) !important;
      background: var(--nb-item-bg) !important;
      border: var(--nb-item-border) !important;
      box-shadow: var(--nb-item-shadow) !important;
      border-radius: var(--nb-item-radius) !important;
      transition: all .3s ease !important;
      box-sizing: border-box;
      overflow: hidden !important;
      position: relative;
      color: #fff !important;
  }

  .navigation-bar__item.active {
      background: var(--nb-active-bg) !important;
      border-color: var(--nb-active-border) !important;
      box-shadow: var(--nb-active-shadow) !important;
      transform: translateY(-2px);
      color: var(--nb-active-text) !important;
  }

  .navigation-bar__icon {
      width: var(--nb-icon-size);
      height: var(--nb-icon-size);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px !important;
  }

  .navigation-bar__icon svg {
      width: var(--nb-svg-size) !important;
      height: var(--nb-svg-size) !important;
      fill: currentColor;
  }

  .navigation-bar__label {
      font-size: var(--nb-label-size) !important;
      color: inherit !important;
      opacity: 0.9 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 4px !important;
      margin-top: -1px !important;
      box-sizing: border-box !important;
  }

  /* Адаптивность под разные разрешения */
  @media (max-width: 1200px) {
      :root {
          --nb-item-height: 62px;
          --nb-item-min-width: 52px;
          --nb-icon-size: 27px;
          --nb-svg-size: 25px;
      }
  }
  @media (max-width: 900px) {
      :root {
          --nb-item-height: 58px;
          --nb-item-min-width: 48px;
          --nb-icon-size: 26px;
          --nb-svg-size: 24px;
          --nb-label-size: 9.5px;
          --nb-gap: 4px;
      }
  }
  @media (max-width: 600px) {
      :root {
          --nb-item-height: 54px;
          --nb-item-min-width: 42px;
          --nb-icon-size: 24px;
          --nb-svg-size: 22px;
          --nb-label-size: 9px;
          --nb-gap: 3px;
      }
      .navigation-bar__body { padding: 6px 2px !important; }
  }
  @media (max-width: 400px) {
      :root {
          --nb-item-height: 50px;
          --nb-item-min-width: 38px;
          --nb-icon-size: 22px;
          --nb-svg-size: 20px;
          --nb-label-size: 8px;
          --nb-gap: 2px;
      }
  }

  /* Landscape Mode */
  @media (orientation: landscape) {
      .navigation-bar__body {
          display: none !important;
      }
      .navigation-bar__item {
          flex: none !important;
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 10px !important;
          padding: 0 !important;
          align-self: center !important;
      }
      .navigation-bar__item.active {
          background: transparent !important;
          transform: scale(1.1);
          box-shadow: none !important;
          border-color: transparent !important;
      }
      .navigation-bar__icon {
          width: 24px !important;
          height: 24px !important;
          margin-bottom: 0 !important;
      }
      .navigation-bar__icon svg {
          width: 22px !important;
          height: 22px !important;
      }
      .navigation-bar__label {
          display: none !important;
      }
  }

  /* ТЕМЫ ОФОРМЛЕНИЯ */
  body[data-nb-theme="neon"] .navigation-bar__item.active {
      background: linear-gradient(to right, #ff00ff, #00ffff) !important;
      box-shadow: 0 0 20px rgba(255,0,255,0.4) !important;
      border: none !important;
      color: #fff !important;
  }
  body[data-nb-theme="dark_night"] .navigation-bar__item.active {
      background: linear-gradient(to right, #8a2387, #e94057, #f27121) !important;
      box-shadow: 0 0 30px rgba(233,64,87,0.3) !important;
      border: none !important;
      color: #fff !important;
  }
  body[data-nb-theme="blue_cosmos"] .navigation-bar__item.active {
      background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59) !important;
      box-shadow: 0 0 30px rgba(18,194,233,0.3) !important;
      border: none !important;
      color: #fff !important;
  }
  body[data-nb-theme="sunset"] .navigation-bar__item.active {
      background: linear-gradient(to right, #ff6e7f, #bfe9ff) !important;
      box-shadow: 0 0 15px rgba(255,110,127,0.3) !important;
      color: #2d1f3d !important;
      border: none !important;
  }
  body[data-nb-theme="emerald"] .navigation-bar__item.active {
      background: linear-gradient(to right, #43cea2, #185a9d) !important;
      box-shadow: 0 4px 15px rgba(67,206,162,0.3) !important;
      border: none !important;
      color: #fff !important;
  }
  body[data-nb-theme="aurora"] .navigation-bar__item.active {
      background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99) !important;
      box-shadow: 0 0 20px rgba(170,75,107,0.3) !important;
      border: none !important;
      color: #fff !important;
  }
  body[data-nb-theme="bywolf_mod"] .navigation-bar__item.active {
      background: linear-gradient(to right, #fc00ff, #00dbde) !important;
      box-shadow: 0 0 30px rgba(252,0,255,0.3) !important;
      border: none !important;
      color: #fff !important;
  }
  `;

  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function injectCSS(){
    if(!$('#menu-glass-auto-style')){
      const st=document.createElement('style');
      st.id='menu-glass-auto-style';
      st.textContent=css;
      document.head.appendChild(st);
    }
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-nb-theme', theme);
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

  function showIconPicker(position, div, iconEl, labelEl, defaultAction, defaultSvg, defaultName){
    const options = [];
    const seenActions = new Set();

    $$('.menu__item[data-action]').forEach(el => {
      const action = el.dataset.action;
      if(action && !seenActions.has(action)){
        seenActions.add(action);

        const nameEl = el.querySelector('.menu__text');
        const name = nameEl ? nameEl.textContent.trim() : action;

        if(action === 'main' || action === 'settings' || name === 'Редактировать'){
          return;
        }

        const ico = el.querySelector('.menu__ico');
        let svg = '';

        if(ico){
          const svgEl = ico.querySelector('svg');
          if(svgEl){
            svg = svgEl.outerHTML;
          }
        }

        if(svg){
          options.push({name, action, svg});
        }
      }
    });

    if(options.length === 0) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#1e1e24;padding:20px;border-radius:16px;max-width:95%;max-height:90%;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(0,0,0,0.6);';

    const title = document.createElement('h3');
    title.textContent = 'Настройка кнопки';
    title.style.cssText = 'text-align:center;color:#fff;margin:0 0 16px;font-size:18px;';
    modal.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:16px;overflow-y:auto;padding:4px;flex:1;';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:10px;border-radius:12px;transition:background .2s;';
      item.innerHTML = `
        <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
          ${opt.svg}
        </div>
        <span style="font-size:13px;color:#fff;text-align:center;word-break:break-word;">${opt.name}</span>
      `;
      const svgEl = item.querySelector('svg');
      if(svgEl){
        svgEl.style.width = '48px';
        svgEl.style.height = '48px';
      }
      item.addEventListener('click', () => {
        div.dataset.action = opt.action;
        localStorage.setItem(`bottom_bar_${position}_action`, opt.action);
        iconEl.innerHTML = opt.svg;
        localStorage.setItem(`bottom_bar_${position}_svg`, opt.svg);
        labelEl.textContent = opt.name;
        localStorage.setItem(`bottom_bar_${position}_name`, opt.name);
        overlay.remove();
      });
      grid.appendChild(item);
    });

    const reset = document.createElement('div');
    reset.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;justify-content:center;padding:16px;cursor:pointer;';
    reset.innerHTML = `<span style="color:#ff5555;font-size:16px;">Сбросить на стандарт</span>`;
    reset.addEventListener('click', () => {
      div.dataset.action = defaultAction;
      localStorage.removeItem(`bottom_bar_${position}_action`);
      iconEl.innerHTML = defaultSvg;
      localStorage.removeItem(`bottom_bar_${position}_svg`);
      labelEl.textContent = defaultName;
      localStorage.removeItem(`bottom_bar_${position}_name`);
      overlay.remove();
    });
    grid.appendChild(reset);

    modal.appendChild(grid);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
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

    div.addEventListener('click', () => emulateSidebarClick(div.dataset.action));

    // Long press
    let timer;
    const start = () => {
      timer = setTimeout(() => showIconPicker(position, div, iconDiv, labelDiv, defaultAction, defaultSvg, defaultName), 700);
    };
    const cancel = () => clearTimeout(timer);

    div.addEventListener('touchstart', start);
    div.addEventListener('touchend', cancel);
    div.addEventListener('touchmove', cancel);
    div.addEventListener('touchcancel', cancel);

    div.addEventListener('mousedown', e => {
      if(e.button === 0){
        start();
        const up = () => { cancel(); document.removeEventListener('mouseup', up); };
        document.addEventListener('mouseup', up);
      }
    });
  }

  function adjustPosition() {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    const bar = $('.navigation-bar__body');
    const actions = $('.head__actions');
    if (!bar || !actions) return;

    const items = $$('.navigation-bar__item');

    if (isLandscape) {
      items.forEach(item => {
        if (!actions.contains(item)) {
          const target = actions.querySelector('.head__action.open--search') || actions.firstChild;
          actions.insertBefore(item, target);
        }
      });
    } else {
      items.forEach(item => {
        if (!bar.contains(item)) {
          const target = bar.querySelector('.navigation-bar__item[data-action="search"]') || null;
          bar.insertBefore(item, target);
        }
      });
    }
  }

  function startPlugin() {
    injectCSS();

    // Настройки темы
    Lampa.SettingsApi.addComponent({
      component: 'nb_settings',
      name: 'Настройки меню',
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });

    Lampa.SettingsApi.addParam({
      component: 'nb_settings',
      param: {
        name: 'nb_theme',
        type: 'select',
        values: {
          default: 'Стандартная',
          bywolf_mod: 'Bywolf_mod',
          dark_night: 'Dark Night',
          blue_cosmos: 'Blue Cosmos',
          neon: 'Neon',
          sunset: 'Dark MOD',
          emerald: 'Emerald',
          aurora: 'Aurora'
        },
        default: 'default'
      },
      field: {
        name: 'Тема нижнего меню',
        description: 'Выберите тему оформления для кнопок меню'
      },
      onChange: function (v) {
        InterFaceMod.settings.theme = v;
        Lampa.Storage.set('nb_theme', v);
        applyTheme(v);
      }
    });

    InterFaceMod.settings.theme = Lampa.Storage.get('nb_theme', 'default');
    applyTheme(InterFaceMod.settings.theme);

    addItem('1', defaults[1].action, defaults[1].svg, defaults[1].name);
    addItem('2', defaults[2].action, defaults[2].svg, defaults[2].name);
    addItem('3', defaults[3].action, defaults[3].svg, defaults[3].name);

    adjustPosition();

    const mql = window.matchMedia('(orientation: landscape)');
    mql.addEventListener('change', adjustPosition);
    window.addEventListener('orientationchange', adjustPosition);
    window.addEventListener('resize', adjustPosition);
  }

  function init(){
    if (window.appready) {
      startPlugin();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
      });
    }
  }

  const mo = new MutationObserver(() => {
    const bar = $('.navigation-bar__body');
    if(bar){
      mo.disconnect();
      init();
    }
  });

  mo.observe(document.documentElement, {childList: true, subtree: true});
  if($('.navigation-bar__body')){
    mo.disconnect();
    init();
  }
})();
