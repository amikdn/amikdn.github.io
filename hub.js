
(function() {
    'use strict';

    Lampa.Platform.tv();

    const customIcons = {
        "Огонь!": "#sprite-fire",
        "Топ 100 - Фильмы": "#sprite-top",
        "Топ 250": "#sprite-top",

        "Гонки": "#sprite-play",
        "Американский футбол": "#sprite-play",

        "Боевик": "#sprite-fire",
        "Приключения": "#sprite-search",
        "Комедия": "#sprite-like",
        "Ужасы": "#sprite-bell",
        "Триллер": "#sprite-lock",
        "Фантастика": "#sprite-star",
        "Фэнтези": "#sprite-star",
        "Криминал": "#sprite-lock",
        "Романтика": "#sprite-like",
        "Драма": "#sprite-person",
        "Семейный": "#sprite-home",
        "Мультфильмы": "#sprite-cartoon",
        "Аниме": "#sprite-anime",
    };

    function startPlugin() {
        console.log('Плагин иконок запущен — без лишних таймеров');

        function replaceIcons() {
            try {
                document.querySelectorAll('.items-line__head .full-person').forEach(block => {
                    try {
                        const nameEl = block.querySelector('.full-person__name');
                        if (!nameEl) return;

                        const name = nameEl.textContent.trim();
                        const sprite = customIcons[name];
                        if (!sprite) return;

                        const photoDiv = block.querySelector('.full-person__photo');
                        if (!photoDiv) return;

                        block.classList.add('full-person--svg');
                        photoDiv.innerHTML = `<svg><use xlink:href="${sprite}"></use></svg>`;
                        photoDiv.style.backgroundImage = '';

                        // Цвета (по вкусу)
                        if (name.includes("Гонки") || name.includes("футбол")) {
                            photoDiv.style.backgroundColor = 'rgb(220, 20, 20)';
                        } else if (name === "Огонь!") {
                            photoDiv.style.backgroundColor = 'rgb(253, 69, 24)';
                        } else {
                            photoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                        }
                    } catch (e) {}
                });
            } catch (e) {}
        }

        // Один начальный вызов (с небольшой задержкой на всякий)
        setTimeout(replaceIcons, 3000);

        // Observer — основной механизм, лёгкий и эффективный
        if (document.body) {
            const observer = new MutationObserver(replaceIcons);  // Прямой вызов, без лишнего таймера
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
