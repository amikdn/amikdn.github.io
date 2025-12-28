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
    canvas.style.transition = 'opacity 0.5s ease'; // Плавное исчезновение/появление
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Массив снежинок
    const snowflakes = [];
    const flakeCount = 120; // Количество снежинок — можно изменить

    let animationId = null; // Для управления анимацией

    // Установка размеров canvas
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

    // Функция анимации
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

    // Функция включения снега
    function startSnow() {
        if (animationId === null) {
            canvas.style.opacity = '1';
            animate();
        }
    }

    // Функция выключения снега
    function stopSnow() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
            canvas.style.opacity = '0'; // Плавно скрываем
        }
    }

    // Запуск снега сразу
    startSnow();

    // Отслеживаем события плеера
    Lampa.Listener.follow('player', function (e) {
        if (e.type === 'start' || e.type === 'play') {
            // Плеер открылся или началось воспроизведение — скрываем снег
            stopSnow();
        } else if (e.type === 'stop' || e.type === 'end' || e.type === 'close') {
            // Плеер закрылся — возвращаем снег
            startSnow();
        }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        resizeCanvas();
        createSnowflakes();
    });
})();
