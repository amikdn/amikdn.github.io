(function () {
    'use strict';

    // Указываем платформу (для Lampa — TV)
    Lampa.Platform.tv();

    // Создаём canvas для снега
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Массив снежинок
    const snowflakes = [];
    const flakeCount = 120; // Количество снежинок (можно менять)

    let animationId = null;

    // Функция инициализации размеров canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // Создаём снежинки
    function createSnowflakes() {
        snowflakes.length = 0;
        for (let i = 0; i < flakeCount; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,        // Размер от 1 до 4px
                speed: Math.random() * 1.5 + 0.5,     // Скорость падения
                opacity: Math.random() * 0.5 + 0.5,   // Прозрачность
                drift: Math.random() * 2 - 1,         // Горизонтальное смещение (ветер)
                angle: Math.random() * Math.PI * 2    // Для лёгкого вращения/колебания
            });
        }
    }
    createSnowflakes();

    // Анимация
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        snowflakes.forEach(flake => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.fill();

            flake.y += flake.speed;
            flake.x += flake.drift + Math.sin(flake.angle) * 0.5; // Лёгкое покачивание
            flake.angle += 0.01;

            if (flake.y > canvas.height + flake.radius) {
                flake.y = -flake.radius;
                flake.x = Math.random() * canvas.width;
            }
        });

        animationId = requestAnimationFrame(animate);
    }

    // Запуск анимации
    animate();

    // Проверка: в плеере ли мы
    function isInPlayer() {
        try {
            const active = Lampa.Activity.active();
            if (active) {
                const name = active.component || active.name || '';
                return name.includes('player') || name === 'fullstart' || name === 'viewer';
            }
        } catch (e) {}
        return false;
    }

    // Listener на смену экранов
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'show') {
            if (isInPlayer()) {
                canvas.style.display = 'none'; // Скрываем полностью
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            } else {
                canvas.style.display = 'block'; // Показываем
                if (!animationId) animate(); // Возобновляем анимацию
            }
        }
    });

    // При изменении размера окна — пересоздаём снежинки и меняем canvas
    window.addEventListener('resize', () => {
        resizeCanvas();
        createSnowflakes();
    });

    // Опционально: можно убрать снег по клику или через какое-то время
    // canvas.addEventListener('click', () => canvas.remove());
})();
