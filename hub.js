Lampa.Platform.tv();

(function () {
  'use strict';

  /** SVG-иконки */
  const MOVIE_SVG = `<svg><use xlink:href="#sprite-movie"></use></svg>`;
  const TV_SVG = `<svg><use xlink:href="#sprite-tv"></use></svg>`;
  
  /** Inline SVG для мультфильмов — стилизована под мульт/анимацию */
  const MULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="currentColor" d="M15 2c-2.71 0-5.05 1.54-6.22 3.78C7.5 4.44 5.74 3.62 3.85 3.62 1.6 3.62 0 5.22 0 7.47v9.06c0 2.25 1.6 3.85 3.85 3.85 1.89 0 3.65-.82 4.93-2.16C9.95 20.4 12.29 22 15 22c4.08 0 7.4-3.32 7.4-7.4S19.08 2 15 2zm0 18c-3.03 0-5.6-2.57-5.6-5.6S11.97 8.8 15 8.8s5.6 2.57 5.6 5.6-2.57 5.6-5.6 5.6zM8.15 15.34c-.86-.5-1.82-.76-2.8-.76-1.98 0-3.6-1.62-3.6-3.6S3.37 7.38 5.35 7.38c.98 0 1.94.26 2.8.76l.79-1.37C7.83 6.28 6.73 6 5.35 6c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.38 0 2.48-.28 3.63-.77l-.83-1.37z"/>
  </svg>`;

  /** CSS */
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
  }

  .navigation-bar__label {
      display: none !important;
  }

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
      if(el.dataset && el.dataset.action === action){
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
    
    div.addEventListener('click', () => {
      const activeActivity = Lampa.Activity.active();
      const isSearch = activeActivity && activeActivity.component === 'search';
      
      if (isSearch) {
        Lampa.Activity.back();
        setTimeout(() => emulateSidebarClick(action), 600);
      } else {
        emulateSidebarClick(action);
      }
    });
  }

  function updateActive(){
    $$('.navigation-bar__item').forEach(item => item.classList.remove('active'));
    
    const activeMenu = $$('.menu__item.active, .selector.active');
    if(activeMenu.length > 0){
      const act = activeMenu[0].dataset.action;
      const barItem = $(`.navigation-bar__item[data-action="${act}"]`);
      if(barItem) barItem.classList.add('active');
    }
  }

  function forceShowBar(){
    const nav = $('.navigation-bar');
    if(nav){
      nav.style.setProperty('display', 'flex', 'important');
      nav.style.setProperty('visibility', 'visible', 'important');
      nav.style.setProperty('opacity', '1', 'important');
      nav.style.setProperty('transform', 'translateY(0)', 'important');
    }
    const body = $('.navigation-bar__body');
    if(body){
      body.style.setProperty('display', 'flex', 'important');
    }
  }

  function init(){
    injectCSS();
    addItem('movie', MOVIE_SVG);
    addItem('tv', TV_SVG);
    addItem('mult', MULT_SVG); // Изменено на 'mult' — это стандартный action для раздела "Мультфильмы" в большинстве сборок Lampa с Cub/онлайн

    forceShowBar();
    updateActive();

    setInterval(forceShowBar, 500);
    setInterval(updateActive, 800);
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
