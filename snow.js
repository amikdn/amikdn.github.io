(function () {
    'use strict';

    Lampa.Platform.tv();

    let canvas = null;
    let ctx = null;
    let snowflakes = [];
    let animationId = null;
    const flakeCount = 120;

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
        resizeCanvas();
        createFlakes();
        animate();
    }

    function destroySnow() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (canvas) {
            canvas.remove();
            canvas = null;
            ctx = null;
            snowflakes = [];
        }
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function createFlakes() {
        snowflakes = [];
        const width = canvas ? canvas.width : window.innerWidth;
        const height = canvas ? canvas.height : window.innerHeight;
        for (let i = 0; i < flakeCount; i++) {
            snowflakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.5,
                drift: Math.random() * 2 - 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    function animate() {
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

    // Ключевой Listener — реагирует на смену активности
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'show') {
            const active = Lampa.Activity.active();
            if (active && (active.name === 'player' || active.component === 'player' || active.component === 'fullstart' || active.component === 'viewer')) {
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
        resizeCanvas();
        if (canvas) createFlakes();
    });
})();
