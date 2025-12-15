
(function() {
    'use strict';

    Lampa.Platform.tv();

    // Кастомные замены иконок
    // Ключ — точное название (как в .full-person__name)
    // Значение — существующий #sprite-id из встроенного спрайта
    const customIcons = {
        // Специальные
        "Огонь!": "#sprite-fire",
        "Топ 100 - Фильмы": "#sprite-top",
        "Топ 250": "#sprite-top",

        // Жанры и категории (подбери под себя)
        "Гонки": "#sprite-speed",          // Если есть, иначе заменить на другой (в твоём спрайте speed нет — используй #sprite-fire или #sprite-play)
        "Американский футбол": "#sprite-play",  // Иконка play — как мяч/спорт
        "Боевик": "#sprite-fire",          // Огонь = экшн
        "Приключения": "#sprite-search",   // Лупа = поиск приключений
        "Комедия": "#sprite-like",         // Лайк = смех
        "Ужасы": "#sprite-fire",           // Огонь или #sprite-bell (колокольчик страха)
        "Триллер": "#sprite-search",
        "Фантастика": "#sprite-star",
        "Фэнтези": "#sprite-star",
        "Криминал": "#sprite-lock",        // Замок
        "Романтика": "#sprite-like",       // Лайк как любовь
        "Драма": "#sprite-person",
        "Семейный": "#sprite-home",
        "Мультфильмы": "#sprite-cartoon",  // Специально для мультов!
        "Аниме": "#sprite-anime",

        // Добавь свои по аналогии, например:
        // "Новинки": "#sprite-fire",
        // "Сериалы": "#sprite-tv",
    };

    function startPlugin() {
        console.log('Плагин кастомных иконок для Lampa запущен');

        function replaceIcons() {
            try {
                document.querySelectorAll('.items-line__head .full-person').forEach(block => {
                    try {
                        const nameEl = block.querySelector('.full-person__name');
                        if (!nameEl) return;

                        const name = nameEl.textContent.trim();
                        const sprite = customIcons[name];
                        if (!sprite) return;  // Если нет в списке — оставляем оригинал

                        const photoDiv = block.querySelector('.full-person__photo');
                        if (!photoDiv) return;

                        // Делаем SVG из спрайта
                        block.classList.add('full-person--svg');
                        photoDiv.innerHTML = `<svg><use xlink:href="${sprite}"></use></svg>`;
                        photoDiv.style.backgroundImage = '';

                        // Кастомные цвета фона
                        if (name === "Гонки" || name === "Американский футбол") {
                            photoDiv.style.backgroundColor = 'rgb(220, 20, 20)'; // Красный для спорта
                        } else if (name === "Ужасы") {
                            photoDiv.style.backgroundColor = 'rgb(80, 0, 120)'; // Фиолетовый
                        } else if (name === "Комедия") {
                            photoDiv.style.backgroundColor = 'rgb(255, 190, 0)'; // Оранжевый
                        } else if (name === "Огонь!") {
                            photoDiv.style.backgroundColor = 'rgb(253, 69, 24)';
                        } else if (name === "Романтика") {
                            photoDiv.style.backgroundColor = 'rgb(220, 50, 100)'; // Розовый
                        } else {
                            photoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // По умолчанию как у жанров
                        }
                    } catch (e) { console.error('Ошибка в блоке:', e); }
                });
            } catch (e) { console.error('Ошибка replaceIcons:', e); }
        }

        // Замена с задержками для стабильности
        setTimeout(replaceIcons, 2000);
        setTimeout(replaceIcons, 5000);
        setTimeout(replaceIcons, 10000);

        // Наблюдатель за новыми разделами
        if (document.body) {
            const observer = new MutationObserver(() => {
                setTimeout(replaceIcons, 1000);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    // Ожидание готовности Lampa
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
