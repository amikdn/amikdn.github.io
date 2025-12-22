(function () {
  'use strict';

  // Защита от повторной загрузки
  if (window.__snowfx_loaded__) return;
  window.__snowfx_loaded__ = true;

  // Ключи настроек
  const KEY_ENABLED = 'snowfx_enabled';
  const KEY_DENSITY = 'snowfx_density';   // 0=авто, 1=мало, 2=средне, 3=много
  const KEY_SETTLE  = 'snowfx_settle';    // оседание на карточках

  // Иконка снежинки для меню
  const SNOW_ICON = `
    <svg class="snowfx-menu-icon" width="88" height="83" viewBox="0 0 88 83" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
        <path d="M40 7H48V76H40Z"/>
        <path d="M10 37H78V45H10Z"/>
        <path d="M19.8 22.2L26.2 15.8L68.2 57.8L61.8 64.2Z"/>
        <path d="M61.8 15.8L68.2 22.2L26.2 64.2L19.8 57.8Z"/>
        <path d="M34 10H54V18H34Z"/>
        <path d="M34 65H54V73H34Z"/>
        <path d="M12 31H20V51H12Z"/>
        <path d="M68 31H76V51H68Z"/>
      </g>
    </svg>`;

  // === Утилиты ===
  function storageGet(key, def) {
    try {
      if (Lampa && Lampa.Storage && Lampa.Storage.get) return Lampa.Storage.get(key, def);
    } catch (e) {}
    return def;
  }

  function isTizen() {
    try { return Lampa.Platform.is('tizen'); } catch (e) { return false; }
  }

  function prefersReduceMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // Разрешённые экраны
  const ALLOWED_COMPONENTS = {
    main:1, home:1, start:1, cub:1,
    movies:1, movie:1, tv:1, series:1, serial:1, serials:1,
    tvshow:1, tvshows:1, category:1, categories:1,
    catalog:1, genre:1, genres:1
  };

  let currentActivity = 'main'; // по умолчанию считаем разрешённым
  let inPlayer = false;

  // === Canvas и спрайт ===
  let fallCanvas = null, fallCtx = null;
  let accCanvas = null, accCtx = null;
  let sprite = null;
  let W = 0, H = 0, dpr = 1;

  function makeSprite() {
    if (sprite) return;
    const c = document.createElement('canvas');
    c.width = c.height = 12;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, 6, 5, 0, Math.PI * 2);
    ctx.fill();
    sprite = c;
  }

  function ensureCanvases() {
    if (fallCanvas) return;

    makeSprite();

    fallCanvas = document.createElement('canvas');
    fallCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999999;';
    document.body.appendChild(fallCanvas);
    fallCtx = fallCanvas.getContext('2d');

    accCanvas = document.createElement('canvas');
    accCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999998;';
    document.body.appendChild(accCanvas);
    accCtx = accCanvas.getContext('2d');

    window.addEventListener('resize', resize);
    resize();
  }

  function removeCanvases() {
    if (fallCanvas && fallCanvas.parentNode) fallCanvas.parentNode.removeChild(fallCanvas);
    if (accCanvas && accCanvas.parentNode) accCanvas.parentNode.removeChild(accCanvas);
    fallCanvas = fallCtx = accCanvas = accCtx = null;
  }

  function resize() {
    if (!fallCanvas) return;
    dpr = isTizen() ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth || 1;
    H = window.innerHeight || 1;

    fallCanvas.width = accCanvas.width = W * dpr;
    fallCanvas.height = accCanvas.height = H * dpr;

    fallCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    accCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    resetAccumulation();
  }

  // === Снежинки ===
  let flakes = [];
  let cfg_flakes = 120;
  let cfg_settle = 1;
  let cfg_tizen = false;

  function spawnFlake() {
    return {
      x: Math.random() * W,
      y: Math.random() * H - H,
      r: Math.random() * 2 + 1,
      vy: Math.random() * 0.8 + 0.7,
      vx: Math.random() * 0.6 - 0.3,
      a: Math.random() * 0.5 + 0.5
    };
  }

  function applyFlakeCount(n) {
    n = Math.max(20, n | 0);
    while (flakes.length < n) flakes.push(spawnFlake());
    if (flakes.length > n) flakes.length = n;
  }

  // === Оседание ===
  let surfaces = [];

  function getCardElements() {
    const selectors = ['.card__view', '.card', '[data-card]'];
    const list = [];
    selectors.forEach(s => {
      try { document.querySelectorAll(s).forEach(el => list.push(el)); } catch (e) {}
    });
    return list.filter(el => {
      try {
        const r = el.getBoundingClientRect();
        return r.width > 80 && r.height > 80;
      } catch (e) { return false; }
    });
  }

  function buildSurfaces() {
    if (cfg_tizen || !cfg_settle) {
      surfaces = [];
      return;
    }
    const cards = getCardElements();
    surfaces = [];
    const max = 50;
    cards.slice(0, max).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top > H || r.bottom < 0) return;
      if (r.width > W * 0.9) return;
      surfaces.push({
        x1: r.left + 10,
        x2: r.right - 10,
        y: r.top + 2
      });
    });
  }

  function drawAccumulated(x, y, r, a) {
    if (!accCtx || !sprite) return;
    accCtx.globalAlpha = a;
    const s = (r * 2) | 0;
    accCtx.drawImage(sprite, x - s/2, y - s/2, s, s);
    accCtx.globalAlpha = 1;
  }

  function resetAccumulation() {
    if (!accCtx) return;
    accCtx.clearRect(0, 0, W, H);
    setTimeout(buildSurfaces, 300);
  }

  // === Анимация ===
  let running = false;
  let rafId = 0;

  function loop() {
    if (!running) return;
    fallCtx.clearRect(0, 0, W, H);

    flakes.forEach(f => {
      f.y += f.vy;
      f.x += f.vx + (cfg_tizen ? 0 : Math.sin(f.y * 0.01) * 0.3);

      if (cfg_settle && !cfg_tizen) {
        if (f.y >= H - 10) {
          drawAccumulated(f.x, H - 10, f.r, f.a);
          f.y = -10; f.x = Math.random() * W;
        } else {
          for (const s of surfaces) {
            if (f.x > s.x1 && f.x < s.x2 && Math.abs(f.y - s.y) < 5) {
              drawAccumulated(f.x, s.y, f.r, f.a + 0.1);
              if (Math.random() < 0.4) drawAccumulated(f.x + Math.random()*8-4, s.y-1, f.r*0.8, f.a);
              f.y = -10; f.x = Math.random() * W;
              break;
            }
          }
        }
      }

      if (f.y > H + 10) { f.y = -10; f.x = Math.random() * W; }

      fallCtx.globalAlpha = f.a;
      const s = (f.r * 2) | 0;
      fallCtx.drawImage(sprite, f.x - s/2, f.y - s/2, s, s);
    });
    fallCtx.globalAlpha = 1;

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || prefersReduceMotion()) return;
    ensureCanvases();
    applyFlakeCount(cfg_flakes);
    buildSurfaces();
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    running = false;
    removeCanvases();
    flakes = [];
  }

  // === Прокрутка ===
  let scrollTimer = 0;
  function onScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(resetAccumulation, 150);
  }
  document.addEventListener('scroll', onScroll, true);
  document.addEventListener('wheel', onScroll, {passive:true});
  document.addEventListener('touchmove', onScroll, {passive:true});

  // === Конфиг ===
  function computeConfig() {
    const tizen = isTizen();
    const density = parseInt(storageGet(KEY_DENSITY, '0')) || 0;

    let flakes = 120;
    if (tizen) flakes = 45;
    else if (density === 1) flakes = 90;
    else if (density === 2) flakes = 160;
    else if (density === 3) flakes = 240;

    return {
      enabled: !!parseInt(storageGet(KEY_ENABLED, '1')),
      flakes: flakes,
      settle: tizen ? 0 : parseInt(storageGet(KEY_SETTLE, '1')),
      tizen: tizen
    };
  }

  function applyConfig() {
    const cfg = computeConfig();
    cfg_flakes = cfg.flakes;
    cfg_settle = cfg.settle;
    cfg_tizen = cfg.tizen;

    const shouldRun = cfg.enabled && !inPlayer && ALLOWED_COMPONENTS[currentActivity];

    if (shouldRun) {
      start();
      applyFlakeCount(cfg.flakes);
    } else {
      stop();
    }
  }

  // === Настройки в меню ===
  function addSettings() {
    if (!Lampa.SettingsApi) return;

    Lampa.SettingsApi.addComponent({
      component: 'snowfx',
      name: 'Снег',
      icon: SNOW_ICON
    });

    Lampa.SettingsApi.addParam({
      component: 'snowfx',
      param: { name: KEY_ENABLED, type: 'select', values: {0:'Выкл',1:'Вкл'}, default:1 },
      field: { name: 'Снег', description: 'На главных экранах и в каталогах' }
    });

    Lampa.SettingsApi.addParam({
      component: 'snowfx',
      param: { name: KEY_DENSITY, type: 'select', values: {0:'Авто',1:'Мало',2:'Средне',3:'Много'}, default:0 },
      field: { name: 'Плотность снега', description: 'На Tizen всегда низкая' }
    });

    Lampa.SettingsApi.addParam({
      component: 'snowfx',
      param: { name: KEY_SETTLE, type: 'select', values: {0:'Выкл',1:'Вкл'}, default:1 },
      field: { name: 'Оседание на карточках', description: 'Снег накапливается сверху постеров' }
    });
  }

  // === Запуск ===
  function init() {
    addSettings();

    // Слушаем смену экрана
    try {
      Lampa.Listener.follow('activity', e => {
        if (e.type === 'start' && e.component) {
          currentActivity = e.component;
          applyConfig();
        }
      });
    } catch (e) {}

    // Слушаем плеер
    try {
      if (Lampa.Player && Lampa.Player.listener) {
        Lampa.Player.listener.follow('start', () => { inPlayer = true; stop(); });
        Lampa.Player.listener.follow('destroy', () => { inPlayer = false; applyConfig(); });
      }
    } catch (e) {}

    // Реагируем на изменение настроек
    setInterval(applyConfig, 1000);

    applyConfig();
  }

  // Ждём Lampa
  if (window.Lampa) init();
  else {
    const timer = setInterval(() => {
      if (window.Lampa) {
        clearInterval(timer);
        init();
      }
    }, 300);
  }
})();
