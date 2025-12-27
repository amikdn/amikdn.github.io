(function () {
    'use strict';

    Lampa.Platform.tv();

    // Создаём canvas
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
    const flakeCount = 120; // Можно менять количество

    let animationId = null;
    let isPlayerActive = false; // Флаг: открыт ли плеер

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

    // Проверка, открыт ли плеер (по классам body)
    function checkPlayerStatus() {
        const active = document.body.classList.contains('fullscreen') || 
                       document.body.classList.contains('player-active');
        
        if (active && !isPlayerActive) {
            // Плеер открылся — останавливаем анимацию
            isPlayerActive = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем снег
        } else if (!active && isPlayerActive) {
            // Плеер закрылся — возобновляем
            isPlayerActive = false;
            animate();
        }
    }

    // Анимация снега
    function animate() {
        if (isPlayerActive) return;

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

    // Запуск анимации
    animate();

    // Обработчики событий
    window.addEventListener('resize', () => {
        resizeCanvas();
        createSnowflakes();
    });

    // Наблюдатель за изменениями классов body (для отслеживания открытия/закрытия плеера)
    const observer = new MutationObserver(checkPlayerStatus);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

})();
