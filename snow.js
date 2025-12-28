(function () {
    'use strict';

    if (window.__snowfx_loaded__) return;
    window.__snowfx_loaded__ = true;

    // Ключи хранения настроек
    var KEY_ENABLED = 'snowfx_enabled';
    var KEY_DENSITY = 'snowfx_density'; // 0 auto, 1 low, 2 mid, 3 high
    var KEY_SETTLE  = 'snowfx_settle';  // 0 off, 1 on
    var KEY_SIZE    = 'snowfx_flake_size'; // 0 auto, 1 small, 2 medium, 3 large, 4 huge
    var KEY_FALL_SPEED = 'snowfx_fall_speed'; // 0 auto, 1 slow, 2 medium, 3 fast
    var KEY_IN_CARD = 'snowfx_in_card'; // 0 off, 1 on (в карточке фильма)

    // Платформы
    function isTizen() {
        return /Tizen/i.test(navigator.userAgent || '');
    }
    function isAndroid() {
        return /Android/i.test(navigator.userAgent || '');
    }

    // Хранение
    function storageGet(key, def) {
        try { return Lampa.Storage.get(key, def); } catch (e) { return def; }
    }
    function num(v, def) {
        v = Number(v); return isNaN(v) ? def : v;
    }

    // Детекция плеера (фоллбек)
    function detectActuallyInPlayer() {
        try {
            var vids = document.getElementsByTagName('video');
            for (var i = 0; i < vids.length; i++) {
                var v = vids[i];
                if (v && !v.paused && !v.ended) return true;
            }
        } catch (e) {}
        try {
            var el = document.querySelector('.player, .player__content, .player__video, .player-layer, .video-player');
            if (el && el.offsetWidth > 0 && el.offsetHeight > 0) return true;
        } catch (e) {}
        return false;
    }

    // Разрешённые экраны (главная, каталоги и т.д.)
    var ALLOWED_COMPONENTS = {
        main:1, home:1, start:1, movies:1, movie:1, tv:1, series:1, serial:1, category:1, catalog:1, genre:1
    };
    var DETAILS_COMPONENTS = { full:1, details:1, detail:1, card:1, info:1 };

    function isAllowedActivity(e) {
        var c = (e && (e.component || (e.object && e.object.component))) || '';
        return !!ALLOWED_COMPONENTS[c];
    }
    function isDetailsActivity(e) {
        var c = (e && (e.component || (e.object && e.object.component))) || '';
        return !!DETAILS_COMPONENTS[c];
    }

    // Canvas и снежинки
    let canvas = null;
    let ctx = null;
    let flakes = [];
    let animationId = null;

    function createSnow() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        createFlakes();
        animate();
    }

    function destroySnow() {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = null;
        if (canvas) { canvas.remove(); canvas = null; ctx = null; flakes = []; }
    }

    function resize() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function createFlakes() {
        flakes = [];
        var density = num(storageGet(KEY_DENSITY, 0), 0);
        var platform = isTizen() ? 'tizen' : isAndroid() ? 'android' : 'desktop';
        var count = density === 1 ? 100 : density === 2 ? 180 : density === 3 ? 250 : 150; // примерные значения
        if (platform === 'tizen') count = 60; // меньше на ТВ

        for (var i = 0; i < count; i++) {
            flakes.push({
                x: Math.random() * (canvas.width || window.innerWidth),
                y: Math.random() * (canvas.height || window.innerHeight),
                r: Math.random() * 3 + 1,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.5,
                drift: Math.random() * 2 - 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flakes.forEach(f => {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
            ctx.fill();

            f.y += f.speed;
            f.x += f.drift + Math.sin(f.angle) * 0.5;
            f.angle += 0.01;

            if (f.y > canvas.height + f.r) {
                f.y = -f.r;
                f.x = Math.random() * canvas.width;
            }
        });
        animationId = requestAnimationFrame(animate);
    }

    // Основная логика: Listener на activity
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'show') {
            var inPlayer = detectActuallyInPlayer();
            var allowed = isAllowedActivity(e);
            var inDetails = isDetailsActivity(e);
            var showInCard = storageGet(KEY_IN_CARD, '1') === '1';

            if (inPlayer || !allowed || (inDetails && !showInCard)) {
                destroySnow();
            } else {
                createSnow();
            }
        }
    });

    // Инициализация
    createSnow();

    // Ресайз
    window.addEventListener('resize', () => {
        resize();
        if (canvas) createFlakes();
    });
})();
