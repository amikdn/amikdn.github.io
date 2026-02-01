Lampa.Platform.tv();

(function () {
  'use strict';

  /** Дефолтные настройки для трёх кнопок (позиции 1-3 слева направо) */
  var defaults = {
    1: { action: 'movie',   svg: '<svg><use xlink:href="#sprite-movie"></use></svg>',   name: 'Фильмы' },
    2: { action: 'tv',      svg: '<svg><use xlink:href="#sprite-tv"></use></svg>',      name: 'Сериалы' },
    3: { action: 'cartoon', svg: '<svg><use xlink:href="#sprite-cartoon"></use></svg>', name: 'Мультфильмы' }
  };

  /** CSS: нижняя панель и окно выбора. Многострочная строка через конкатенацию для старых движков. */
  var css = [
    '.navigation-bar__body {',
    '  display: flex !important; justify-content: center !important; align-items: center !important;',
    '  width: 100% !important; padding: 6px 2px !important; background: transparent !important;',
    '  border-top: none !important; overflow-x: auto !important; overflow-y: hidden !important;',
    '  box-sizing: border-box; scrollbar-width: none;',
    '}',
    '.navigation-bar__body::-webkit-scrollbar { display: none; }',
    '.navigation-bar__item {',
    '  flex: 1 1 0 !important; min-width: 55px !important; display: flex !important; flex-direction: column !important;',
    '  align-items: center; justify-content: center; height: 64px !important; margin: 0 3px !important;',
    '  background: linear-gradient(to top, rgba(80,80,80,0.35), rgba(30,30,35,0.25)) !important;',
    '  border: 1px solid rgba(255,255,255,0.12) !important; box-shadow: inset 0 0 6px rgba(0,0,0,0.5) !important;',
    '  border-radius: 14px !important; transition: background .3s ease, transform .2s ease, border-color .3s ease, box-shadow .3s ease !important;',
    '  box-sizing: border-box; overflow: hidden !important;',
    '}',
    '.navigation-bar__item:hover, .navigation-bar__item.active {',
    '  background: linear-gradient(to top, rgba(100,100,100,0.45), rgba(40,40,45,0.35)) !important;',
    '  border-color: rgba(255,255,255,0.25) !important; box-shadow: inset 0 0 8px rgba(0,0,0,0.6) !important; transform: translateY(-3px);',
    '}',
    '.navigation-bar__icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px !important; }',
    '.navigation-bar__icon svg { width: 26px !important; height: 26px !important; }',
    '.navigation-bar__label {',
    '  font-size: 10px !important; color: #fff !important; opacity: 0.95 !important; white-space: nowrap !important;',
    '  overflow: hidden !important; text-overflow: ellipsis !important; width: 100% !important; text-align: center !important;',
    '  padding: 0 4px !important; margin-top: -2px !important; box-sizing: border-box !important;',
    '}',
    '@media (max-width: 900px) {',
    '  .navigation-bar__item { height: 60px !important; min-width: 50px !important; margin: 0 2px !important; }',
    '  .navigation-bar__icon svg { width: 24px !important; height: 24px !important; }',
    '  .navigation-bar__label { font-size: 9.5px !important; }',
    '}',
    '@media (max-width: 600px) {',
    '  .navigation-bar__body { padding: 6px 1px !important; }',
    '  .navigation-bar__item { height: 56px !important; min-width: 45px !important; margin: 0 2px !important; }',
    '  .navigation-bar__icon { width: 26px; height: 26px; margin-bottom: 1px !important; }',
    '  .navigation-bar__icon svg { width: 24px !important; height: 24px !important; }',
    '  .navigation-bar__label { font-size: 9px !important; margin-top: -1px !important; }',
    '}',
    '@media (orientation: landscape) {',
    '  .navigation-bar__body { display: none !important; }',
    '  .navigation-bar__item { flex: none !important; width: auto !important; height: auto !important; min-width: 0 !important; min-height: 0 !important;',
    '    background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important;',
    '    margin: 0 10px !important; padding: 0 !important; transition: transform .2s ease !important; align-self: center !important; }',
    '  .navigation-bar__item:hover, .navigation-bar__item.active { background: transparent !important; transform: scale(1.15); }',
    '  .navigation-bar__icon { width: 20px !important; height: 20px !important; margin-bottom: 0 !important; padding: 0 !important; }',
    '  .navigation-bar__icon svg { width: 20px !important; height: 20px !important; }',
    '  .navigation-bar__label { display: none !important; }',
    '}',
    '.phone-menu-picker-overlay {',
    '  position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75);',
    '  display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 10px; box-sizing: border-box;',
    '}',
    '@supports (padding: constant(safe-area-inset-top)) {',
    '  .phone-menu-picker-overlay { padding: constant(safe-area-inset-top) constant(safe-area-inset-right) constant(safe-area-inset-bottom) constant(safe-area-inset-left); }',
    '}',
    '@supports (padding: env(safe-area-inset-top)) {',
    '  .phone-menu-picker-overlay { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }',
    '}',
    '.phone-menu-picker-modal { background: #1e1e24; padding: 12px; border-radius: 12px; max-width: 96%; max-height: 88vh; overflow: hidden;',
    '  display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.6); box-sizing: border-box; width: 100%; }',
    '.phone-menu-picker-title { text-align: center; color: #fff; margin: 0 0 10px; font-size: 16px; font-weight: 600; }',
    '.phone-menu-picker-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; overflow-y: auto; padding: 4px; flex: 1; min-height: 100px; -webkit-overflow-scrolling: touch; }',
    '.phone-menu-picker-grid .picker-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 8px; border-radius: 10px; transition: background 0.2s; }',
    '.phone-menu-picker-grid .picker-item:hover { background: rgba(255,255,255,0.1); }',
    '.phone-menu-picker-grid .picker-icon-wrap { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }',
    '.phone-menu-picker-grid .picker-icon-wrap svg { width: 40px; height: 40px; }',
    '.phone-menu-picker-grid .picker-name { font-size: 11px; color: #fff; text-align: center; word-break: break-word; }',
    '.phone-menu-picker-reset { grid-column: 1 / -1; text-align: center; padding: 12px; cursor: pointer; color: #ff5555; font-size: 14px; }',
    '@media (min-width: 360px) {',
    '  .phone-menu-picker-modal { padding: 16px; border-radius: 14px; }',
    '  .phone-menu-picker-title { font-size: 17px; margin-bottom: 12px; }',
    '  .phone-menu-picker-grid { gap: 12px; min-height: 120px; }',
    '  .phone-menu-picker-grid .picker-icon-wrap { width: 50px; height: 50px; margin-bottom: 8px; }',
    '  .phone-menu-picker-grid .picker-icon-wrap svg { width: 46px; height: 46px; }',
    '  .phone-menu-picker-grid .picker-name { font-size: 12px; }',
    '}',
    '@media (min-width: 480px) {',
    '  .phone-menu-picker-modal { padding: 20px; border-radius: 16px; max-width: 420px; }',
    '  .phone-menu-picker-title { font-size: 18px; }',
    '  .phone-menu-picker-grid { gap: 16px; min-height: 140px; }',
    '  .phone-menu-picker-grid .picker-icon-wrap { width: 56px; height: 56px; }',
    '  .phone-menu-picker-grid .picker-icon-wrap svg { width: 48px; height: 48px; }',
    '  .phone-menu-picker-grid .picker-name { font-size: 13px; }',
    '}',
    '@media (min-width: 768px) {',
    '  .phone-menu-picker-overlay { padding: 20px; }',
    '  .phone-menu-picker-modal { max-width: 480px; max-height: 85vh; }',
    '}'
  ].join('\n');

  var $  = function(s,r){ r = r || document; return r.querySelector(s); };
  var $$ = function(s,r){ r = r || document; var n = r.querySelectorAll(s); return Array.prototype.slice.call(n); };

  /** Разворачивает <use xlink:href="#sprite-..."> в полный inline SVG, чтобы иконка отображалась в Storage Manager и не заливалась белым. */
  function resolveSvgToInline(svgString){
    if(!svgString || typeof svgString !== 'string') return svgString;
    if(svgString.indexOf('xlink:href') === -1 && svgString.indexOf('href="#') === -1) return svgString;
    var div = document.createElement('div');
    div.innerHTML = svgString;
    var useEl = div.querySelector('use');
    if(!useEl) return svgString;
    var href = useEl.getAttribute('xlink:href') || useEl.getAttribute('href') || '';
    if(href.indexOf('#') !== 0) return svgString;
    var id = href.slice(1);
    var sym = document.getElementById(id);
    if(!sym) return svgString;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var vb = sym.getAttribute('viewBox') || '0 0 24 24';
    svg.setAttribute('viewBox', vb);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var children = [];
    for(var k = 0; k < sym.childNodes.length; k++) children.push(sym.childNodes[k]);
    for(var k = 0; k < children.length; k++) svg.appendChild(children[k].cloneNode(true));
    return svg.outerHTML;
  }

  function injectCSS(){
    if(!$('#menu-glass-auto-style')){
      var st = document.createElement('style');
      st.id = 'menu-glass-auto-style';
      st.textContent = css;
      document.head.appendChild(st);
    }
  }

  /** Пытается открыть боковое меню Lampa (клик по кнопке меню в шапке). */
  function openSidebarIfClosed(){
    var menuBtn = document.querySelector('.head__menu, .header__menu, [data-action="menu"], .sidebar__toggle, .drawer__toggle, .head__action[data-action="menu"], .drawer .head__action');
    if(menuBtn){
      triggerClick(menuBtn);
      return true;
    }
    var headActions = document.querySelectorAll('.head__action');
    for(var i = 0; i < headActions.length; i++){
      var node = headActions[i];
      if(node.className && node.className.indexOf('navigation-bar') !== -1) continue;
      var act = node.getAttribute('data-action');
      if(act === 'menu' || act === 'sidebar'){
        triggerClick(node);
        return true;
      }
    }
    var firstHeadAction = document.querySelector('.head__actions .head__action:not(.navigation-bar__item)');
    if(firstHeadAction){
      triggerClick(firstHeadAction);
      return true;
    }
    return false;
  }

  /** Симулирует реальный клик (для приложений, которые не реагируют на .click()). */
  function triggerClick(el){
    if(!el) return;
    try{
      el.click();
    } catch(e){}
    try{
      var ev = document.createEvent('MouseEvents');
      ev.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      el.dispatchEvent(ev);
    } catch(e){}
  }

  /** Находит пункт меню по action и кликает. Ищет только внутри левого меню (sidebar). */
  function findAndClickMenuItem(action){
    var root = getLeftMenuRoot();
    var list = root ? root.querySelectorAll('.menu__item[data-action], .menu__item[data-id], .selector[data-action], .selector[data-id], .menu__item, .selector') : [];
    for(var i = 0; i < list.length; i++){
      var el = list[i];
      var v = (el.getAttribute && el.getAttribute('data-action')) || (el.getAttribute && el.getAttribute('data-id'));
      if(v && v === action){
        triggerClick(el);
        return true;
      }
    }
    for(var j = 0; j < list.length; j++){
      var el2 = list[j];
      var nameEl = el2.querySelector('.menu__text, .selector__text, .selector-title');
      var text = nameEl ? nameEl.textContent.trim() : (el2.textContent || '').trim().replace(/\s+/g, ' ');
      if(text && text === action){
        triggerClick(el2);
        return true;
      }
    }
    return false;
  }

  function emulateSidebarClick(action){
    if(!action) return false;
    if(typeof Lampa !== 'undefined' && Lampa.Go){
      try{ Lampa.Go(action); return true; } catch(e){}
    }
    if(findAndClickMenuItem(action)) return true;
    openSidebarIfClosed();
    setTimeout(function(){
      if(!findAndClickMenuItem(action)){
        var byAttr = document.querySelectorAll('.menu__item[data-action], .menu__item[data-id], .selector[data-action], .selector[data-id]');
        for(var a = 0; a < byAttr.length; a++){
          var el = byAttr[a];
          var v = el.getAttribute('data-action') || el.getAttribute('data-id');
          if(v && v === action){ triggerClick(el); return; }
        }
        var byText = document.querySelectorAll('.menu__item, .selector');
        for(var b = 0; b < byText.length; b++){
          var el2 = byText[b];
          var nameEl = el2.querySelector('.menu__text, .selector__text, .selector-title');
          var text = nameEl ? nameEl.textContent.trim() : (el2.textContent || '').trim().replace(/\s+/g, ' ');
          if(text && text === action){ triggerClick(el2); return; }
        }
      }
    }, 280);
    return true;
  }

  /** Иконка-заглушка для пунктов без своей иконки (плагины) */
  var fallbackSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm3.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

  /** Контейнер только левого меню Lampa (боковая панель). Не ищем в других разделах. */
  function getLeftMenuRoot(){
    var sidebarMenu = document.querySelector('.sidebar .menu, .sidebar .selector');
    if(sidebarMenu) return sidebarMenu.parentElement;
    var sidebar = document.querySelector('.sidebar, .sidebar__body');
    if(sidebar) return sidebar;
    var menu = document.querySelector('.menu');
    return menu || null;
  }

  /** Собирает пункты только из левого меню Lampa (sidebar). Другие разделы не сканируются. */
  function collectMenuSections(){
    var out = [];
    var seen = {};
    var root = getLeftMenuRoot();
    if(!root) return out;

    function add(el){
      var action = (el.getAttribute('data-action') || el.getAttribute('data-id') || '').trim();
      var nameEl = el.querySelector('.menu__text, .selector__text, .selector-title, .text');
      var name = (nameEl && nameEl.textContent) ? nameEl.textContent.trim() : '';
      if(!name) name = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      var key = action || name || ('item_' + out.length);
      if(!key || seen[key]) return;
      if(action === 'main' || action === 'settings') return;
      if(name && (name.indexOf('Редактировать') !== -1 || name.indexOf('Настройки') !== -1)) return;
      seen[key] = true;

      var ico = el.querySelector('.menu__ico, .selector__ico, .selector-icon, .ico');
      var svg = '';
      if(ico){
        var svgEl = ico.querySelector('svg');
        if(svgEl) svg = svgEl.outerHTML;
      }
      if(!svg){
        var firstSvg = el.querySelector('svg');
        if(firstSvg) svg = firstSvg.outerHTML;
      }
      if(!svg) svg = fallbackSvg;
      svg = resolveSvgToInline(svg) || svg;
      out.push({ name: name || key, action: key, svg: svg });
    }

    var selectors = [
      '.menu__item[data-action]', '.menu__item[data-id]', '.menu__item',
      '.selector[data-action]', '.selector[data-id]', '.selector'
    ];
    for(var i = 0; i < selectors.length; i++){
      var list = root.querySelectorAll(selectors[i]);
      for(var j = 0; j < list.length; j++){
        add(list[j]);
      }
    }
    return out;
  }

  function renderOptionsGrid(grid, options, position, div, iconEl, labelEl, overlay, defaultAction, defaultSvg, defaultName){
    grid.innerHTML = '';
    for(var i = 0; i < options.length; i++){
      var opt = options[i];
      var item = document.createElement('div');
      item.className = 'picker-item';
      item.innerHTML = '<div class="picker-icon-wrap">' + opt.svg + '</div><span class="picker-name">' + (opt.name || '') + '</span>';
      var svgEl = item.querySelector('svg');
      if(svgEl){ svgEl.style.width = '48px'; svgEl.style.height = '48px'; }
      if(opt.action !== '_'){
        (function(o, a, s, n){
          item.addEventListener('click', function(){
            var svgToSave = resolveSvgToInline(s) || s;
            div.setAttribute('data-action', a);
            localStorage.setItem('bottom_bar_' + position + '_action', a);
            iconEl.innerHTML = svgToSave;
            localStorage.setItem('bottom_bar_' + position + '_svg', svgToSave);
            labelEl.textContent = n;
            localStorage.setItem('bottom_bar_' + position + '_name', n);
            if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
          });
        })(opt, opt.action, opt.svg, opt.name);
      } else {
        item.style.pointerEvents = 'none';
        item.style.opacity = '0.7';
      }
      grid.appendChild(item);
    }
    var reset = document.createElement('div');
    reset.className = 'phone-menu-picker-reset';
    reset.textContent = 'Сбросить на стандарт';
    reset.addEventListener('click', function(){
      var defaultSvgResolved = resolveSvgToInline(defaultSvg) || defaultSvg;
      div.setAttribute('data-action', defaultAction);
      localStorage.removeItem('bottom_bar_' + position + '_action');
      iconEl.innerHTML = defaultSvgResolved;
      localStorage.setItem('bottom_bar_' + position + '_svg', defaultSvgResolved);
      labelEl.textContent = defaultName;
      localStorage.removeItem('bottom_bar_' + position + '_name');
      if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
    grid.appendChild(reset);
  }

  function showIconPicker(position, div, iconEl, labelEl, defaultAction, defaultSvg, defaultName){
    var overlay = document.createElement('div');
    overlay.className = 'phone-menu-picker-overlay';
    overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.parentNode && overlay.parentNode.removeChild(overlay); });

    var modal = document.createElement('div');
    modal.className = 'phone-menu-picker-modal';

    var title = document.createElement('h3');
    title.textContent = 'Настройка кнопки';
    title.className = 'phone-menu-picker-title';
    modal.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'phone-menu-picker-grid';
    var options = collectMenuSections();
    if(options.length === 0) return;
    renderOptionsGrid(grid, options, position, div, iconEl, labelEl, overlay, defaultAction, defaultSvg, defaultName);

    modal.appendChild(grid);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function addItem(position, defaultAction, defaultSvg, defaultName){
    var bar = $('.navigation-bar__body');
    if(!bar || bar.querySelector('[data-position="' + position + '"]')) return;

    var savedAction = localStorage.getItem('bottom_bar_' + position + '_action') || defaultAction;
    var savedSvg = localStorage.getItem('bottom_bar_' + position + '_svg') || defaultSvg;
    var savedName = localStorage.getItem('bottom_bar_' + position + '_name') || defaultName;
    savedSvg = resolveSvgToInline(savedSvg) || savedSvg;

    var div = document.createElement('div');
    div.className = 'navigation-bar__item';
    div.setAttribute('data-action', savedAction);
    div.setAttribute('data-position', position);

    var iconDiv = document.createElement('div');
    iconDiv.className = 'navigation-bar__icon';
    iconDiv.innerHTML = savedSvg;

    var labelDiv = document.createElement('div');
    labelDiv.className = 'navigation-bar__label';
    labelDiv.textContent = savedName;

    div.appendChild(iconDiv);
    div.appendChild(labelDiv);

    var search = bar.querySelector('.navigation-bar__item[data-action="search"]');
    if(search) bar.insertBefore(div, search);
    else bar.appendChild(div);

    div.addEventListener('click', function(){ emulateSidebarClick(div.getAttribute('data-action')); });

    var timer;
    function start(){
      timer = setTimeout(function(){ showIconPicker(position, div, iconDiv, labelDiv, defaultAction, defaultSvg, defaultName); }, 700);
    }
    function cancel(){ clearTimeout(timer); }

    div.addEventListener('touchstart', start);
    div.addEventListener('touchend', cancel);
    div.addEventListener('touchmove', cancel);
    div.addEventListener('touchcancel', cancel);

    div.addEventListener('mousedown', function(e){
      if(e.button === 0){
        start();
        function up(){ cancel(); document.removeEventListener('mouseup', up); }
        document.addEventListener('mouseup', up);
      }
    });
  }

  function adjustPosition() {
    var mq = window.matchMedia && window.matchMedia('(orientation: landscape)');
    var isLandscape = mq ? mq.matches : (window.orientation === 90 || window.orientation === -90);
    var bar = $('.navigation-bar__body');
    var actions = $('.head__actions');
    if (!bar || !actions) return;

    var items = $$('.navigation-bar__item');
    var i, target;

    if (isLandscape) {
      for (i = 0; i < items.length; i++) {
        if (!actions.contains(items[i])) {
          target = actions.querySelector('.head__action.open--search') || actions.firstChild;
          actions.insertBefore(items[i], target);
        }
      }
    } else {
      for (i = 0; i < items.length; i++) {
        if (!bar.contains(items[i])) {
          target = bar.querySelector('.navigation-bar__item[data-action="search"]') || null;
          bar.insertBefore(items[i], target);
        }
      }
    }
  }

  function init(){
    injectCSS();
    addItem('1', defaults[1].action, defaults[1].svg, defaults[1].name);
    addItem('2', defaults[2].action, defaults[2].svg, defaults[2].name);
    addItem('3', defaults[3].action, defaults[3].svg, defaults[3].name);

    adjustPosition();

    var mql = window.matchMedia && window.matchMedia('(orientation: landscape)');
    if(mql && mql.addEventListener) mql.addEventListener('change', adjustPosition);
    window.addEventListener('orientationchange', adjustPosition);
    window.addEventListener('resize', adjustPosition);
  }

  var mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(function() {
    var bar = $('.navigation-bar__body');
    if(bar){ mo.disconnect(); init(); }
  }) : null;

  if(mo){
    mo.observe(document.documentElement, {childList: true, subtree: true});
  }
  if($('.navigation-bar__body')){
    if(mo) mo.disconnect();
    init();
  }
})();
