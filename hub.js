(function () {
  'use strict';

  // Защита от повторной загрузки
  if (window.__snowfx_loaded__) return;
  window.__snowfx_loaded__ = true;

  // Ключи настроек
  const KEY_ENABLED = 'snowfx_enabled';
  const KEY_DENSITY = 'snowfx_density';   // 0=авто, 1=мало, 2=средне, 3=много
  const KEY_SETTLE  = 'snowfx_settle';    // оседание на карточках
  const KEY_SHAKE   = 'snowfx_shake';     // стряхивание на мобильных

  // SVG-иконка снежинки для меню (как в оригинале)
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

  // === Вспомогательные функции ===
  function storageGet(key, def) {
    try { return Lampa.Storage.get(key, def); } catch (e) { return def; }
  }

  function isTizen() {
    try { return Lampa.Platform.is('tizen'); } catch (e) {}
    return /Tizen/i.test(navigator.userAgent || '');
  }

  function isAndroid() {
    try { return Lampa.Platform.is('android'); } catch (e) {}
    return /Android/i.test(navigator.userAgent || '');
  }

  function isMobileUA() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  }

  function prefersReduceMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // === Canvas и спрайт снежинки ===
  let fallCanvas = null, fallCtx = null;
  let accCanvas = null, accCtx = null;
  let sprite = null;
  let W = 0, H = 0, dpr = 1;

  function makeSprite() {
    if (sprite) return;
    const c = document.createElement('canvas');
    c.width = c.height = 12;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(6, 6, 5, 0, Math.PI * 2);
    ctx.fill();
    sprite = c;
  }

  function ensureCanvases() {
    if (!document.body) return;

    makeSprite();

    if (!fallCanvas) {
      fallCanvas = document.createElement('canvas');
      fallCanvas.id = 'snowfx_fall';
      fallCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999999;';
      document.body.appendChild(fallCanvas);
      fallCtx = fallCanvas.getContext('2d', { alpha: true });
    }

    if (!accCanvas) {
      accCanvas = document.createElement('canvas');
      accCanvas.id = 'snowfx_acc';
      accCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999998;';
      document.body.appendChild(accCanvas);
      accCtx = accCanvas.getContext('2d', { alpha: true });
    }

    resize();
  }

  function removeCanvases() {
    if (fallCanvas && fallCanvas.parentNode) fallCanvas.parentNode.removeChild(fallCanvas);
    if (accCanvas && accCanvas.parentNode) accCanvas.parentNode.removeChild(accCanvas);
    fallCanvas = fallCtx = accCanvas = accCtx = null;
  }

  function resize() {
    if (!fallCanvas || !accCanvas) return;

    dpr = isTizen() ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth || 1;
    H = window.innerHeight || 1;

    fallCanvas.width = accCanvas.width = W * dpr;
    fallCanvas.height = accCanvas.height = H * dpr;

    fallCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    accCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    resetAccumulationHard();
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

  function applyFlakeCount(count) {
    count = Math.max(20, count | 0);
    while (flakes.length < count) flakes.push(spawnFlake());
    if (flakes.length > count) flakes.length = count;
  }

  // === Оседание на карточках ===
  let surfaces = [];

  function looksLikePoster(el) {
    try {
      const r = el.getBoundingClientRect();
      if (r.width < 90 || r.height < 90) return false;

      if (el.querySelector('img')) {
        const img = el.querySelector('img');
        const ir = img.getBoundingClientRect();
        if (ir.width > 70 && ir.height > 70) return true;
      }

      const style = getComputedStyle(el);
      if (style.backgroundImage && style.backgroundImage !== 'none') return true;
    } catch (e) {}
    return false;
  }

  function getCardElements() {
    const selectors = [
      '.card__view', '.items__item .card__view', '.full-start__poster',
      '.card', '[data-card]', '[data-type="card"]'
    ];
    const list = [];
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => list.push(el));
      } catch (e) {}
    });

    const uniq = [];
    const seen = new Set();
    list.forEach(el => {
      if (!el || seen.has(el)) return;
      seen.add(el);
      if (looksLikePoster(el)) uniq.push(el);
    });
    return uniq;
  }

  function buildSurfaces() {
    if (cfg_tizen || !cfg_settle) {
      surfaces = [];
      return;
    }

    const cards = getCardElements();
    const max = isAndroid() ? 40 : 55;
    surfaces = [];

    cards.slice(0, max).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H) return;
      if (r.width > W * 0.82 || r.height > H * 0.95) return;

      const y = r.top + 2;
      if (y < 0 || y > H) return;

      const x1 = r.left + 10;
      const x2 = r.right - 10;
      if (x2 - x1 < 60) return;

      surfaces.push({ x1, x2, y });
    });
  }

  function drawAccumulated(x, y, r, a) {
    if (!accCtx || !sprite) return;
    accCtx.globalAlpha = a;
    const size = (r * 2) | 0;
    accCtx.drawImage(sprite, x - size/2, y - size/2, size, size);
    accCtx.globalAlpha = 1;
  }

  function resetAccumulationHard() {
    if (!accCtx || cfg_tizen || !cfg_settle) return;
    accCtx.clearRect(0, 0, W, H);
    surfaces = [];
    setTimeout(buildSurfaces, 200);
  }

  function resetAccumulationSoft() {
    if (!accCtx || cfg_tizen || !cfg_settle) return;

    let fadeRaf = 0;
    const start = performance.now();
    const duration = 320;

    function fade() {
      accCtx.save();
      accCtx.globalCompositeOperation = 'destination-out';
      accCtx.fillStyle = 'rgba(0,0,0,0.22)';
      accCtx.fillRect(0, 0, W, H);
      accCtx.restore();

      if (performance.now() - start < duration) {
        fadeRaf = requestAnimationFrame(fade);
      } else {
        accCtx.clearRect(0, 0, W, H);
        surfaces = [];
        setTimeout(buildSurfaces, 160);
      }
    }
    if (fadeRaf) cancelAnimationFrame(fadeRaf);
    fadeRaf = requestAnimationFrame(fade);
  }

  // === Анимация ===
  let running = false;
  let rafId = 0;
  let lastTs = 0;

  function drawFrame(dt) {
    fallCtx.clearRect(0, 0, W, H);

    flakes.forEach(f => {
      f.y += f.vy * (dt / 16.67);
      f.x += f.vx * (dt / 16.67);
      if (!cfg_tizen) f.x += Math.sin(f.y * 0.01) * 0.3;

      // Оседание
      if (cfg_settle && !cfg_tizen) {
        // На дне экрана
        if (f.y >= H - 10) {
          drawAccumulated(f.x, H - 10, f.r, Math.min(0.9, f.a + 0.1));
          f.y = -10;
          f.x = Math.random() * W;
          return;
        }

        // На карточках
        for (const s of surfaces) {
          if (f.x >= s.x1 && f.x <= s.x2 && f.y >= s.y - 3 && f.y <= s.y + 3) {
            drawAccumulated(f.x, s.y - 1, f.r, Math.min(0.9, f.a + 0.15));
            if (Math.random() < 0.5) drawAccumulated(f.x + Math.random() * 8 - 4, s.y - 1, f.r * 0.85, Math.min(0.8, f.a));
            f.y = -10;
            f.x = Math.random() * W;
            return;
          }
        }
      }

      // Вылет за пределы
      if (f.y > H + 10) { f.y = -10; f.x = Math.random() * W; }
      if (f.x < -10) f.x = W + 10;
      if (f.x > W + 10) f.x = -10;

      fallCtx.globalAlpha = f.a;
      const size = (f.r * 2) | 0;
      fallCtx.drawImage(sprite, f.x - size/2, f.y - size/2, size, size);
    });
    fallCtx.globalAlpha = 1;
  }

  function loop(ts) {
    if (!running) return;
    if (document.hidden) { rafId = requestAnimationFrame(loop); return; }

    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    if (dt >= 1000 / 60) {
      lastTs = ts - (dt % (1000 / 60));
      drawFrame(dt);
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || prefersReduceMotion()) return;
    ensureCanvases();
    if (!fallCtx) return;

    window.addEventListener('resize', resize);
    flakes = [];
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

  // === Прокрутка — сбрасываем оседание ===
  let scrollTimer = 0;
  function onScroll() {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = 0;
      resetAccumulationSoft();
    }, 120);
  }
  document.addEventListener('scroll', onScroll, true);
  document.addEventListener('wheel', onScroll, { passive: true });
  document.addEventListener('touchmove', onScroll, { passive: true });

  // === Настройки ===
  function computeConfig() {
    const tizen = isTizen();
    const density = Number(storageGet(KEY_DENSITY, 0)) || 0;

    let target = 120;
    if (tizen) target = 45;
    else if (density === 1) target = 90;
    else if (density === 2) target = 160;
    else if (density === 3) target = 240;
    else if (isAndroid()) target = 200;
    else target = 180;

    return {
      enabled: !!Number(storageGet(KEY_ENABLED, 1)),
      flakes: target,
      settle: tizen ? 0 : Number(storageGet(KEY_SETTLE, 1)),
      tizen: tizen
    };
  }

  function applyConfig() {
    const cfg = computeConfig();
    cfg_flakes = cfg.flakes;
    cfg_settle = cfg.settle;
    cfg_tizen = cfg.tizen;

    if (cfg.enabled && Lampa.Activity.active().component !== 'player') {
      start();
      applyFlakeCount(cfg_flakes);
    } else {
      stop();
    }
  }

  // === Добавляем в меню Lampa ===
  function addSettings() {
    if (!Lampa.SettingsApi) return;

    Lampa.SettingsApi.addComponent({
      component: 'snowfx',
      name: 'Снег',
      icon: SNOW_ICON
    });

    Lampa.SettingsApi.addParam({
      component: 'snowfx',
      param: { name: KEY_ENABLED, type: 'select', values: { 0: 'Выкл', 1: 'Вкл' }, default: 1 },
      field: { name: 'Снег на экранах', description: 'Главная, фильмы, сериалы, категории' }
    });

    Lampa.SettingsApi.addParam({
      component: 'snowfx',
      param: { name: KEY_DENSITY, type: 'select', values: { 0: 'Авто', 1: 'Мало', 2: 'Средне', 3: 'Много' }, default: 0 },
      field: { name: 'Плотность снега', description: 'На Tizen ограничена' }
    });

    Lampa.SettingsApi.addParam({
      component: 'snowfx',
      param: { name: KEY_SETTLE, type: 'select', values: { 0: 'Выкл', 1: 'Вкл' }, default: 1 },
      field: { name: 'Оседание на карточках', description: 'Снег накапливается на постерах. При прокрутке плавно исчезает.' }
    });

    // Стряхивание (пока отключено — можно включить позже)
    // Lampa.SettingsApi.addParam({ ... KEY_SHAKE ... });
  }

  // === Запуск ===
  function init() {
    addSettings();
    applyConfig();

    // Реагируем на смену активности и плеер
    Lampa.Listener.follow('activity', e => {
      if (e.type === 'start') applyConfig();
    });

    if (Lampa.Player && Lampa.Player.listener) {
      Lampa.Player.listener.follow('start', () => { stop(); });
      Lampa.Player.listener.follow('destroy', () => { applyConfig(); });
    }

    // Следим за изменением настроек
    setInterval(applyConfig, 800);
  }

  // Ждём загрузки Lampa
  if (window.Lampa) init();
  else {
    let tries = 0;
    const wait = setInterval(() => {
      if (window.Lampa || tries++ > 30) {
        clearInterval(wait);
        if (window.Lampa) init();
      }
    }, 300);
  }
})();
