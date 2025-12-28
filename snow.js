(function () {
    'use strict';

    Lampa.Platform.tv();

    // Создаём canvas для снега
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    canvas.style.transition = 'opacity 0.7s ease'; // Плавное исчезновение
    canvas.style.opacity = '1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const snowflakes = [];
    const flakeCount = 120; // Количество снежинок

    let animationId = null;

    // Размеры canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // Создание снежинок
    function createSnowflakes() {
        snowflakes.length = 0;
        for (let i = 0; i < flakeCount; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.5,
                drift: Math.random() * 2 - 1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    createSnowflakes();

    // Анимация снега
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

    // Включить снег
    function startSnow() {
        if (animationId === null) {
            canvas.style.opacity = '1';
            animate();
        }
    }

    // Выключить снег
    function stopSnow() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        canvas.style.opacity = '0';
    }

    // Проверка: открыт ли сейчас плеер
    function isPlayerActive() {
        const active = Lampa.Activity.active();
        return active && active.name === 'player';
    }

    // Основная логика: каждые 500 мс проверяем состояние
    setInterval(() => {
        if (isPlayerActive()) {
            stopSnow();
        } else {
            startSnow();
        }
    }, 500);

    // Запуск снега сразу (если не в плеере)
    if (!isPlayerActive()) {
        startSnow();
    }

    // При ресайзе окна
    window.addEventListener('resize', () => {
        resizeCanvas();
        createSnowflakes();
    });
})();
