Lampa.Platform.tv();

(function () {
  'use strict';

  /** SVG-иконки по умолчанию */
  const MOVIE_SVG = `<svg><use xlink:href="#sprite-movie"></use></svg>`;
  const TV_SVG = `<svg><use xlink:href="#sprite-tv"></use></svg>`;
  const CARTOON_SVG = `<svg><use xlink:href="#sprite-cartoon"></use></svg>`;

  /** Все доступные иконки для выбора */
  const iconOptions = [
    { name: 'Главная',      svg: `<svg><use xlink:href="#sprite-home"></use></svg>` },
    { name: 'Лента',        svg: `<svg><use xlink:href="#sprite-feed"></use></svg>` },
    { name: 'Фильмы',       svg: `<svg><use xlink:href="#sprite-movie"></use></svg>` },
    { name: 'Мультфильмы',  svg: `<svg><use xlink:href="#sprite-cartoon"></use></svg>` },
    { name: 'Сериалы',      svg: `<svg><use xlink:href="#sprite-tv"></use></svg>` },
    { name: 'Персоны',      svg: `<svg><use xlink:href="#sprite-person"></use></svg>` },
    { name: 'Каталог',      svg: `<svg><use xlink:href="#sprite-catalog"></use></svg>` },
    { name: 'Фильтр',       svg: `<svg><use xlink:href="#sprite-filter"></use></svg>` },
    { name: 'Релизы',       svg: `<svg><use xlink:href="#sprite-hd"></use></svg>` },
    { name: 'Аниме',        svg: `<svg><use xlink:href="#sprite-anime"></use></svg>` },
    { name: 'Избранное',    svg: `<svg><use xlink:href="#sprite-favorite"></use></svg>` },
    { name: 'История',      svg: `<svg><use xlink:href="#sprite-history"></use></svg>` },
    { name: 'Подписки',     svg: `<svg><use xlink:href="#sprite-subscribes"></use></svg>` },
    { name: 'Расписание',   svg: `<svg><use xlink:href="#sprite-calendar"></use></svg>` },
    { name: 'Торренты',     svg: `<svg><use xlink:href="#sprite-torrent"></use></svg>` },
    { name: 'Настройки',    svg: `<svg><use xlink:href="#sprite-settings"></use></svg>` },
    { name: 'Информация',   svg: `<svg><use xlink:href="#sprite-info"></use></svg>` },
    { name: 'Консоль',      svg: `<svg><use xlink:href="#sprite-console"></use></svg>` },
    { name: 'Спорт',        svg: `<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M256 0C114.617 0 0 114.617 0 256C0 397.383 114.617 512 256 512C397.383 512 512 397.383 512 256C511.842 114.684 397.316 0.157867 256 0ZM265.137 73.8037L354.133 38.2293C364.234 42.8001 374.004 48.0668 383.375 53.9915L383.609 54.1376C392.817 59.9718 401.618 66.4258 409.95 73.4549L410.667 74.0789C414.401 77.261 418.037 80.5557 421.571 83.9584C422.017 84.3957 422.483 84.8117 422.929 85.2587C426.632 88.874 430.221 92.6035 433.692 96.4416C433.98 96.7669 434.254 97.1083 434.542 97.4336C437.587 100.846 440.516 104.379 443.358 107.971C444.042 108.825 444.725 109.679 445.388 110.533C448.47 114.525 451.454 118.587 454.271 122.779L436.529 198.196L349.242 227.295L265.158 160.017L265.137 73.8037ZM66.6037 110.582C67.2661 109.729 67.9413 108.876 68.6251 108.025C71.4302 104.467 74.3355 100.989 77.3376 97.5957C77.6629 97.2373 77.9627 96.8704 78.2837 96.512C81.7313 92.6675 85.3063 88.9392 89.0027 85.3333C89.4283 84.9173 89.8528 84.48 90.2987 84.096C93.804 80.7151 97.4099 77.4401 101.111 74.2752L101.965 73.5584C110.222 66.5809 118.94 60.1665 128.058 54.3584L128.39 54.1451C137.706 48.2341 147.418 42.9732 157.458 38.4L246.863 73.8037V159.991L162.775 227.259L75.488 198.213L57.7461 122.796C60.5748 118.636 63.5286 114.563 66.6037 110.582ZM56.3211 386.945C53.8104 383.118 51.4108 379.22 49.1253 375.254L48.5707 374.295C46.2959 370.347 44.142 366.33 42.112 362.25L42.0416 362.122C37.7657 353.538 34.013 344.703 30.8043 335.666V335.583C29.2875 331.316 27.904 326.946 26.6251 322.55L26.1621 320.929C24.9867 316.784 23.9253 312.608 22.9792 308.404C22.896 307.991 22.7915 307.6 22.7083 307.191C20.6129 297.659 19.1071 288.006 18.1995 278.288L70.2955 215.775L156.979 244.667L182.138 345.292L140.8 400.291L56.3211 386.945ZM312.825 488.046C308.558 489.104 304.179 490.017 299.801 490.837C299.187 490.958 298.563 491.058 297.95 491.171C294.221 491.838 290.45 492.409 286.671 492.875C285.663 493.004 284.662 493.141 283.659 493.263C280.149 493.67 276.608 493.979 273.058 494.234C271.941 494.308 270.837 494.421 269.721 494.492C265.183 494.771 260.608 494.933 256 494.933C251.779 494.933 247.584 494.821 243.413 494.6C242.909 494.6 242.425 494.516 241.92 494.479C238.208 494.267 234.512 493.988 230.825 493.629L230.4 493.55C222.32 492.674 214.289 491.393 206.337 489.712L155.862 410.683L196.55 356.429H315.45L356.804 411.042L312.825 488.046ZM489.355 307.2C489.267 307.609 489.167 308.004 489.079 308.413C488.128 312.615 487.066 316.791 485.896 320.938L485.437 322.559C484.167 326.942 482.772 331.288 481.254 335.591V335.675C478.047 344.712 474.295 353.546 470.017 362.129L469.946 362.258C467.91 366.335 465.756 370.352 463.488 374.304L462.933 375.263C460.666 379.231 458.27 383.125 455.75 386.938L371.558 400.212L329.934 345.258L355.079 244.658L441.762 215.766L493.858 278.279C492.954 288.003 491.45 297.662 489.355 307.2Z" fill="currentColor"></path></svg>` },
    { name: 'В качестве',   svg: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path d="M3.577 8.9v.03h1.828V5.898h-.062a47 47 0 0 0-1.766 3.001z"></path><path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm2.372 3.715l.435-.714h1.71v3.93h.733v.957h-.733V11H5.405V9.888H2.5v-.971c.574-1.077 1.225-2.142 1.872-3.202m7.73-.714h1.306l-2.14 2.584L13.5 11h-1.428l-1.679-2.624l-.615.7V11H8.59V5.001h1.187v2.686h.057L12.102 5z"></path></g></svg>` },
    { name: 'Клубничка',    svg: `<svg viewBox="0 0 200 243" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M187.714 130.727C206.862 90.1515 158.991 64.2019 100.983 64.2019C42.9759 64.2019 -4.33044 91.5669 10.875 130.727C26.0805 169.888 63.2501 235.469 100.983 234.997C138.716 234.526 168.566 171.303 187.714 130.727Z" stroke="currentColor" stroke-width="15"></path><path d="M102.11 62.3146C109.995 39.6677 127.46 28.816 169.692 24.0979C172.514 56.1811 135.338 64.2018 102.11 62.3146Z" stroke="currentColor" stroke-width="15"></path><path d="M90.8467 62.7863C90.2285 34.5178 66.0667 25.0419 31.7127 33.063C28.8904 65.1461 68.8826 62.7863 90.8467 62.7863Z" stroke="currentColor" stroke-width="15"></path><path d="M100.421 58.5402C115.627 39.6677 127.447 13.7181 85.2149 9C82.3926 41.0832 83.5258 35.4214 100.421 58.5402Z" stroke="currentColor" stroke-width="15"></path><rect x="39.0341" y="98.644" width="19.1481" height="30.1959" rx="9.57407" fill="currentColor"></rect><rect x="90.8467" y="92.0388" width="19.1481" height="30.1959" rx="9.57407" fill="currentColor"></rect><rect x="140.407" y="98.644" width="19.1481" height="30.1959" rx="9.57407" fill="currentColor"></rect><rect x="116.753" y="139.22" width="19.1481" height="30.1959" rx="9.57407" fill="currentColor"></rect><rect x="64.9404" y="139.22" width="19.1481" height="30.1959" rx="9.57407" fill="currentColor"></rect><rect x="93.0994" y="176.021" width="19.1481" height="30.1959" rx="9.57407" fill="currentColor"></rect></svg>` }
  ];

  const actionNames = {
    movie: 'Фильмы',
    tv: 'Сериалы',
    cartoon: 'Мультфильмы'
  };

  /** CSS (без изменений + небольшие дополнения для модалки) */
  const css = `
  .navigation-bar__body {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      padding: 6px 8px !important;
      background: rgba(20,20,25,0.85) !important;
      border-top: 1px solid rgba(255,255,255,0.08);
      overflow: hidden !important;
      box-sizing: border-box;
  }

  .navigation-bar__item {
      flex: 1 1 0 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      height: 62px !important;
      min-width: 0 !important;
      margin: 0 4px !important;
      background: rgba(255,255,255,0.08) !important;
      border-radius: 14px !important;
      transition: background .25s ease !important;
      box-sizing: border-box;
  }

  .navigation-bar__item:hover,
  .navigation-bar__item.active {
      background: rgba(255,255,255,0.18) !important;
  }

  .navigation-bar__icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .navigation-bar__icon svg {
      width: 22px !important;
      height: 22px !important;
      fill: currentColor;
  }

  .navigation-bar__label { display: none !important; }

  @media (max-width: 900px) {
      .navigation-bar__item { height: 58px !important; margin: 0 3px !important; }
  }
  @media (max-width: 600px) {
      .navigation-bar__body { padding: 6px 6px !important; }
      .navigation-bar__item { height: 54px !important; border-radius: 12px !important; margin: 0 3px !important; }
      .navigation-bar__icon svg { width: 20px !important; height: 20px !important; }
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
    for(const el of $$('.menu__item, .selector')){
      if(el.dataset.action === action){
        el.click();
        return true;
      }
    }
    return false;
  }

  function showIconPicker(action, iconEl, defaultSvg){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#1e1e24;padding:20px;border-radius:16px;max-width:95%;max-height:85%;overflow-y:auto;box-shadow:0 10px 30px rgba(0,0,0,0.6);';

    const title = document.createElement('h3');
    title.textContent = `Иконка для ${actionNames[action] || action}`;
    title.style.cssText = 'text-align:center;color:#fff;margin:0 0 20px 0;font-size:18px;';
    modal.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill, minmax(80px,1fr));gap:16px;justify-items:center;';

    iconOptions.forEach(opt => {
      const optDiv = document.createElement('div');
      optDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:8px;border-radius:10px;transition:background .2s;';
      optDiv.innerHTML = `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;">${opt.svg}</div><span style="font-size:13px;color:#fff;text-align:center;">${opt.name}</span>`;
      const svg = optDiv.querySelector('svg');
      if(svg){
        svg.style.width = '40px';
        svg.style.height = '40px';
      }
      optDiv.addEventListener('click', () => {
        iconEl.innerHTML = opt.svg;
        localStorage.setItem('custom_bottom_icon_' + action, opt.svg);
        overlay.remove();
      });
      optDiv.addEventListener('touchstart', () => optDiv.style.background = 'rgba(255,255,255,0.15)');
      optDiv.addEventListener('touchend', () => optDiv.style.background = '');
      grid.appendChild(optDiv);
    });

    // Кнопка сброса
    const resetDiv = document.createElement('div');
    resetDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:80px;cursor:pointer;padding:8px;border-radius:10px;transition:background .2s;';
    resetDiv.innerHTML = `<span style="color:#ff5555;font-size:14px;">Сбросить</span>`;
    resetDiv.addEventListener('click', () => {
      iconEl.innerHTML = defaultSvg;
      localStorage.removeItem('custom_bottom_icon_' + action);
      overlay.remove();
    });
    grid.appendChild(resetDiv);

    modal.appendChild(grid);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function addItem(action, defaultSvg){
    const bar = $('.navigation-bar__body');
    if(!bar || bar.querySelector(`[data-action="${action}"]`)) return;

    const div = document.createElement('div');
    div.className = 'navigation-bar__item';
    div.dataset.action = action;

    const savedSvg = localStorage.getItem('custom_bottom_icon_' + action);
    const svg = savedSvg || defaultSvg;
    div.innerHTML = `<div class="navigation-bar__icon">${svg}</div>`;

    const search = bar.querySelector('.navigation-bar__item[data-action="search"]');
    if(search) bar.insertBefore(div, search);
    else bar.appendChild(div);

    div.addEventListener('click', () => emulateSidebarClick(action));

    // Long press для замены иконки (700 мс)
    let timer;
    const startLongPress = () => {
      timer = setTimeout(() => showIconPicker(action, div.querySelector('.navigation-bar__icon'), defaultSvg), 700);
    };
    const cancelLongPress = () => clearTimeout(timer);

    div.addEventListener('touchstart', startLongPress);
    div.addEventListener('touchend', cancelLongPress);
    div.addEventListener('touchmove', cancelLongPress);
    div.addEventListener('touchcancel', cancelLongPress);

    // Поддержка на ПК (долгое удержание левой кнопки мыши)
    div.addEventListener('mousedown', (e) => {
      if(e.button === 0){
        startLongPress();
        const up = () => {
          cancelLongPress();
          document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mouseup', up);
      }
    });
  }

  function init(){
    injectCSS();
    addItem('movie', MOVIE_SVG);
    addItem('tv', TV_SVG);
    addItem('cartoon', CARTOON_SVG);
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
