Lampa.Platform.tv();

(function () {
  'use strict';

  /** Дефолтные настройки для трёх кнопок (позиции 1-3 слева направо) */
  const defaults = {
    1: { action: 'movie',   svg: `<svg><use xlink:href="#sprite-movie"></use></svg>`,   name: 'Фильмы' },
    2: { action: 'tv',      svg: `<svg><use xlink:href="#sprite-tv"></use></svg>`,      name: 'Сериалы' },
    3: { action: 'cartoon', svg: `<svg><use xlink:href="#sprite-cartoon"></use></svg>`, name: 'Мультфильмы' }
  };

  /** CSS — чёрная внутренняя тень + белая обводка, фон бара полностью прозрачный, иконки в landscape меньше */
  const css = `
  .navigation-bar__body {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      padding: 6px 2px !important;
      background: transparent !important;
      border-top: none !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      box-sizing: border-box;
      scrollbar-width: none;
  }
  .navigation-bar__body::-webkit-scrollbar { display: none; }

  .navigation-bar__item {
      flex: 1 1 0 !important;
      min-width: 55px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center;
      justify-content: center;
      height: 64px !important;
      margin: 0 3px !important;
      background: linear-gradient(to top, rgba(80,80,80,0.35), rgba(30,30,35,0.25)) !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.5) !important;
      border-radius: 14px !important;
      transition: background .3s ease, transform .2s ease, border-color .3s ease, box-shadow .3s ease !important;
      box-sizing: border-box;
      overflow: hidden !important;
  }

  .navigation-bar__item:hover,
  .navigation-bar__item.active {
      background: linear-gradient(to top, rgba(100,100,100,0.45), rgba(40,40,45,0.35)) !important;
      border-color: rgba(255,255,255,0.25) !important;
      box-shadow: inset 0 0 8px rgba(0,0,0,0.6) !important;
      transform: translateY(-3px);
  }

  .navigation-bar__icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px !important;
  }

  .navigation-bar__icon svg {
      width: 26px !important;
      height: 26px !important;
      fill: currentColor;
  }

  .navigation-bar__label {
      font-size: 10px !important;
      color: #fff !important;
      opacity: 0.95 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 4px !important;
      margin-top: -2px !important;
      box-sizing: border-box !important;
  }

  @media (max-width: 900px) {
      .navigation-bar__item { 
          height: 60px !important; 
          min-width: 50px !important;
          margin: 0 2px !important;
      }
      .navigation-bar__icon svg { width: 24px !important; height: 24px !important; }
      .navigation-bar__label { font-size: 9.5px !important; }
  }
  @media (max-width: 600px) {
      .navigation-bar__body { padding: 6px 1px !important; }
      .navigation-bar__item { 
          height: 56px !important; 
          min-width: 45px !important;
          margin: 0 2px !important;
      }
      .navigation-bar__icon { width: 26px; height: 26px; margin-bottom: 1px !important; }
      .navigation-bar__icon svg { width: 24px !important; height: 24px !important; }
      .navigation-bar__label { font-size: 9px !important; margin-top: -1px !important; }
  }

  /* Уменьшено до 20×20px (контейнер .navigation-bar__icon и svg внутри в горизонтальном режиме) */
  @media (orientation: landscape) {
      .navigation-bar__body {
          display: none !important;
      }
      .navigation-bar__item {
          flex: none !important;
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 10px !important;
          padding: 0 !important;
          transition: transform .2s ease !important;
          align-self: center !important;
      }
      .navigation-bar__item:hover,
      .navigation-bar__item.active {
          background: transparent !important;
          transform: scale(1.15);
      }
      .navigation-bar__icon {
          width: 20px !important;  /* ← размер контейнера иконки */
          height: 20px !important; /* ← размер контейнера иконки */
          margin-bottom: 0 !important;
          padding: 0 !important;
      }
      .navigation-bar__icon svg {
          width: 20px !important;  /* ← размер самой SVG-иконки */
          height: 20px !important; /* ← размер самой SVG-иконки */
      }
      .navigation-bar__label {
          display: none !important;
      }
  }`;

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

  function init(){
    injectCSS();
    addItem('1', defaults[1].action, defaults[1].svg, defaults[1].name);
    addItem('2', defaults[2].action, defaults[2].svg, defaults[2].name);
    addItem('3', defaults[3].action, defaults[3].svg, defaults[3].name);

    adjustPosition();

    const mql = window.matchMedia('(orientation: landscape)');
    mql.addEventListener('change', adjustPosition);
    window.addEventListener('orientationchange', adjustPosition);
    window.addEventListener('resize', adjustPosition);
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
