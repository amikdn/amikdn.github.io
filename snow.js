(function () {
    'use strict';

    Lampa.Platform.tv();

    let canvas = null;
    let ctx = null;
    let snowflakes = [];
    const flakeCount = 120;
    let animationId = null;

    // Создаём canvas и запускаем снег
    function createSnow() {
        if (canvas) return; // Уже создан

        canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');
        resizeCanvas();
        createSnowflakes();
        animate();
    }

    // Удаляем canvas полностью
    function removeSnow() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
            canvas = null;
            ctx = null;
            snowflakes = [];
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createSnowflakes() {
        snowflakes = [];
        for (let i = 0; i < flakeCount; i++) {
            snowflakes.push({
                x: Math.random() * (canvas ? canvas.width : window.innerWidth),
                y: Math.random() * (canvas ? canvas.height : window.innerHeight),
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.5,
                drift: Math.random() * 2 - 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    function animate() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        snowflakes.forEach(flake => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.fill();

            flake.y += flake.speed;
            flake.x += flake.drift + Math.sin(flake.angle) * 0.5;
            flake.angle += 0.01;

            if (flake.y > canvas.height + flake.radius) {
                flake.y = -flake.radius;
                flake.x = Math.random() * canvas.width;
            }
        });

        animationId = requestAnimationFrame(animate);
    }

    // Проверка активности плеера
    function isPlayerActive() {
        const active = Lampa.Activity.active();
        if (!active) return false;
        const name = active.component || active.name || '';
        return name.includes('player') || name === 'fullstart' || name === 'viewer' || name.includes('video');
    }

    // Основной цикл проверки
    setInterval(() => {
        if (isPlayerActive()) {
            removeSnow();
        } else {
            createSnow();
        }
    }, 300);

    // Инициализация при загрузке
    if (!isPlayerActive()) {
        createSnow();
    }

    // Ресайз
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (canvas) createSnowflakes();
    });
})();
