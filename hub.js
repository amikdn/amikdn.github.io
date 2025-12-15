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

    function replaceIcons() {
        try {
            document.querySelectorAll('.items-line__head .full-person').forEach(block => {
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

                // Цвета
                if (name.includes("Гонки") || name.includes("футбол")) {
                    photoDiv.style.backgroundColor = 'rgb(220, 20, 20)';
                } else if (name === "Огонь!") {
                    photoDiv.style.backgroundColor = 'rgb(253, 69, 24)';
                } else {
                    photoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
            });
        } catch (e) {}
    }

    function startPlugin() {
        console.log('Плагин иконок запущен — без observer');

        // Замена сразу и с задержками
        setTimeout(replaceIcons, 3000);
        setTimeout(replaceIcons, 8000);

        // На основные события Lampa (главная, каталог и т.д.)
        Lampa.Listener.follow('full', () => setTimeout(replaceIcons, 1000));
        Lampa.Listener.follow('view', () => setTimeout(replaceIcons, 1000));
        Lampa.Listener.follow('activity', () => setTimeout(replaceIcons, 1000));
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
