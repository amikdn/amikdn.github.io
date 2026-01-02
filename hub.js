Lampa.Platform.tv();

(function () {
  'use strict';

  /** SVG-иконки через спрайт */
  const MOVIE_SVG = `<svg><use xlink:href="#sprite-movie"></use></svg>`;
  const TV_SVG = `<svg><use xlink:href="#sprite-tv"></use></svg>`;
  const MULT_SVG = `<svg><use xlink:href="#sprite-mult"></use></svg>`; // Иконка мультфильмов

  /** CSS — без тяжёлых эффектов, нижний бар всегда на месте */
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

  .navigation-bar__label {
      display: none !important;
  }

  /* Принудительно держим основной контейнер бара видимым */
  .navigation-bar {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      transform: translateY(0) !important;
  }

  @media (max-width: 900px) {
      .navigation-bar__item { 
          height: 58px !important; 
          margin: 0 3px !important;
      }
  }
  @media (max-width: 600px) {
      .navigation-bar__body {
          padding: 6px 6px !important;
      }
      .navigation-bar__item { 
          height: 54px !important; 
          border-radius: 12px !important;
          margin: 0 3px !important;
      }
      .navigation-bar__icon svg { 
          width: 20px !important; 
          height: 20px !important; 
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
    for(const el of $$('.menu__item, .selector')){
      if(el.dataset && el.dataset.action && el.dataset.action === action){
        el.click();
        return true;
      }
    }
    return false;
  }

  function addItem(action, svg){
    const bar = $('.navigation-bar__body');
    if(!bar || bar.querySelector(`[data-action="${action}"]`)) return;
    
    const div = document.createElement('div');
    div.className = 'navigation-bar__item';
    div.dataset.action = action;
    div.innerHTML = `<div class="navigation-bar__icon">${svg}</div>`;
    
    const search = bar.querySelector('.navigation-bar__item[data-action="search"]');
    if(search) {
      bar.insertBefore(div, search);
    } else {
      bar.appendChild(div);
    }
    
    div.addEventListener('click', () => emulateSidebarClick(action));
  }

  function init(){
    injectCSS();
    addItem('movie', MOVIE_SVG);
    addItem('tv', TV_SVG);
    addItem('mult', MULT_SVG);

    // Принудительно держим бар видимым (особенно в поиске и после закрытия клавиатуры)
    const forceShowBar = () => {
      const nav = $('.navigation-bar');
      if (nav) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('visibility', 'visible', 'important');
        nav.style.setProperty('opacity', '1', 'important');
        nav.style.setProperty('transform', 'translateY(0)', 'important');
      }
      const body = $('.navigation-bar__body');
      if (body) {
        body.style.setProperty('display', 'flex', 'important');
      }
    };

    forceShowBar();
    setInterval(forceShowBar, 500);
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
