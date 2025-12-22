(function () {
    'use strict';

    if (window.__snowfx_loaded__) return;
    window.__snowfx_loaded__ = true;

    const KEY_ENABLED = 'snowfx_enabled';
    const KEY_DENSITY = 'snowfx_density';
    const KEY_SETTLE  = 'snowfx_settle';

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

    function storageGet(key, def) {
        try { return Lampa.Storage.get(key, def); } catch (e) { return def; }
    }

    function isTizen() {
        try { return Lampa.Platform.is('tizen'); } catch (e) { return false; }
    }

    function prefersReduceMotion() {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    }

    let inPlayer = false;

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

        clearAccumulation();
        createSnowflakes();
    }

    let snowflakes = [];
    let cfg_flakeCount = 120;
    let cfg_settle = 1;
    let cfg_tizen = false;
    let prev_settle = 1;

    function createSnowflakes() {
        snowflakes = [];
        for (let i = 0; i < cfg_flakeCount; i++) {
            snowflakes.push({
                x: Math.random() * W,
                y: Math.random() * H - H * 0.5,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.5,
                drift: Math.random() * 2 - 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    let surfaces = [];

    function buildSurfaces() {
        if (cfg_tizen || !cfg_settle) {
            surfaces = [];
            return;
        }
        const sels = ['.card__view', '.card', '[data-card]', '.full-start__poster', '.poster'];
        const cards = [];
        sels.forEach(sel => {
            try { document.querySelectorAll(sel).forEach(el => cards.push(el)); } catch (e) {}
        });

        surfaces = [];
        const max = 60;
        for (let i = 0; i < cards.length && i < max; i++) {
            const r = cards[i].getBoundingClientRect();
            if (r.bottom < 0 || r.top > H) continue;
            if (r.width > W * 0.9) continue;
            const y = r.top + 2;
            if (y < 0 || y > H) continue;
            const x1 = r.left + 10;
            const x2 = r.right - 10;
            if (x2 - x1 < 60) continue;
            surfaces.push({ x1, x2, y });
        }
    }

    function drawAccDot(x, y, radius, opacity) {
        if (!accCtx || !sprite) return;
        accCtx.globalAlpha = opacity;
        const size = (radius * 2) | 0;
        accCtx.drawImage(sprite, x - size/2, y - size/2, size, size);
        accCtx.globalAlpha = 1;
    }

    function clearAccumulation() {
        if (!accCtx) return;
        accCtx.clearRect(0, 0, W, H);
        surfaces = [];
    }

    let fadeRaf = 0;
    function shakeOffAccumulation() {
        if (!accCtx || cfg_tizen || !cfg_settle || fadeRaf) return;

        const start = performance.now();
        const duration = 300;

        function step() {
            const progress = Math.min((performance.now() - start) / duration, 1);
            accCtx.save();
            accCtx.globalCompositeOperation = 'destination-out';
            accCtx.fillStyle = 'rgba(0,0,0,0.9)';
            accCtx.fillRect(0, 0, W, H);
            accCtx.restore();

            if (progress < 1) {
                fadeRaf = requestAnimationFrame(step);
            } else {
                fadeRaf = 0;
                clearAccumulation();
            }
        }
        fadeRaf = requestAnimationFrame(step);
    }

    let running = false;
    let rafId = 0;

    function animate() {
        if (!running) return;

        fallCtx.clearRect(0, 0, W, H);

        if (cfg_settle && !cfg_tizen) buildSurfaces();

        snowflakes.forEach(flake => {
            fallCtx.beginPath();
            fallCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            fallCtx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            fallCtx.fill();

            flake.y += flake.speed;
            flake.x += flake.drift + Math.sin(flake.angle) * 0.5;
            flake.angle += 0.01;

            let settled = false;

            if (cfg_settle && !cfg_tizen) {
                if (flake.y > H - 10) {
                    drawAccDot(flake.x, H - 10, flake.radius, Math.min(0.9, flake.opacity + 0.1));
                    settled = true;
                } else {
                    for (const s of surfaces) {
                        if (flake.x >= s.x1 && flake.x <= s.x2 && flake.y >= s.y - 5 && flake.y <= s.y + 5) {
                            drawAccDot(flake.x, s.y - 1, flake.radius, Math.min(0.9, flake.opacity + 0.15));
                            if (Math.random() < 0.5) drawAccDot(flake.x + Math.random()*10-5, s.y - 1, flake.radius*0.85, Math.min(0.8, flake.opacity));
                            settled = true;
                            break;
                        }
                    }
                }
            }

            if (settled || flake.y > H + flake.radius) {
                flake.y = -flake.radius - Math.random() * H * 0.3;
                flake.x = Math.random() * W;
                flake.angle = Math.random() * Math.PI * 2;
            }
        });

        rafId = requestAnimationFrame(animate);
    }

    function start() {
        if (running || prefersReduceMotion()) return;
        ensureCanvases();
        createSnowflakes();
        running = true;
        rafId = requestAnimationFrame(animate);
    }

    function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        running = false;
        removeCanvases();
        snowflakes = [];
    }

    let scrollDebounce = 0;
    function onScroll() {
        if (scrollDebounce || !cfg_settle) return;
        scrollDebounce = setTimeout(() => {
            scrollDebounce = 0;
            shakeOffAccumulation(); // только накопленный снег
        }, 100);
    }
    document.addEventListener('scroll', onScroll, true);
    document.addEventListener('wheel', onScroll, {passive:true});
    document.addEventListener('touchmove', onScroll, {passive:true});

    function computeConfig() {
        const tizen = isTizen();
        const density = parseInt(storageGet(KEY_DENSITY, '0'), 10) || 0;

        let count = 120;
        if (tizen) count = 45;
        else if (density === 1) count = 90;
        else if (density === 2) count = 180;
        else if (density === 3) count = 240;

        const settle = tizen ? 0 : parseInt(storageGet(KEY_SETTLE, '1'), 10);

        return {
            enabled: !!parseInt(storageGet(KEY_ENABLED, '1'), 10),
            flakeCount: count,
            settle: settle,
            tizen: tizen
        };
    }

    function applyConfig(forceClear = false) {
        const cfg = computeConfig();
        const settleChanged = cfg.settle !== prev_settle;

        cfg_flakeCount = cfg.flakeCount;
        cfg_settle = cfg.settle;
        cfg_tizen = cfg.tizen;
        prev_settle = cfg.settle;

        if (forceClear || settleChanged) {
            clearAccumulation();
        }

        const shouldRun = cfg.enabled && !inPlayer;

        if (shouldRun) {
            start();
        } else {
            stop();
        }
    }

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
            field: { name: 'Снег', description: 'На всех экранах кроме плеера' }
        });

        Lampa.SettingsApi.addParam({
            component: 'snowfx',
            param: { name: KEY_DENSITY, type: 'select', values: {0:'Авто',1:'Мало',2:'Средне',3:'Много'}, default:0 },
            field: { name: 'Плотность снега', description: 'На Tizen ограничена' }
        });

        Lampa.SettingsApi.addParam({
            component: 'snowfx',
            param: { name: KEY_SETTLE, type: 'select', values: {0:'Выкл',1:'Вкл'}, default:1 },
            field: { name: 'Оседание на постерах', description: 'Снег накапливается на карточках и большом постере' }
        });
    }

    function init() {
        addSettings();

        try {
            Lampa.Listener.follow('activity', e => {
                if (e.type === 'start') {
                    applyConfig(true); // полная очистка при смене экрана
                }
            });
        } catch (e) {}

        try {
            if (Lampa.Player && Lampa.Player.listener) {
                Lampa.Player.listener.follow('start', () => { inPlayer = true; stop(); });
                Lampa.Player.listener.follow('destroy', () => { inPlayer = false; applyConfig(); });
            }
        } catch (e) {}

        setInterval(() => applyConfig(), 800);
        applyConfig(true);
    }

    if (window.Lampa) init();
    else {
        const timer = setInterval(() => {
            if (window.Lampa) { clearInterval(timer); init(); }
        }, 300);
    }
})();
