(function() {
    'use strict';

    // Важно: указываем платформу (особенно для ТВ-версий)
    Lampa.Platform.tv();

    // === Твои кастомные иконки ===
    // Ключ — точное название категории (проверь в приложении, регистр важен!)
    // Значение — только встроенные спрайты Lampa (безопасно и работает везде)
    const customIcons = {
        // Специальные разделы
        "Огонь!": "#sprite-fire",
        "Топ 100 - Фильмы": "#sprite-top",
        "Топ 250": "#sprite-top",

        // Жанры (встроенные спрайты Lampa)
        "Гонки": "#sprite-speed",           // Спидометр — идеально для гонок 🏎️
        "Боевик": "#sprite-fire",           // Огонь = экшн
        "Приключения": "#sprite-compass",   // Компас (есть в спрайте)
        "Комедия": "#sprite-smile",         // Смайлик
        "Ужасы": "#sprite-ghost",           // Призрак 👻
        "Триллер": "#sprite-search",        // Лупа = расследование
        "Фантастика": "#sprite-star",       // Звезда
        "Фэнтези": "#sprite-magic",         // Волшебство (если есть, иначе заменить на #sprite-star)
        "Криминал": "#sprite-lock",         // Замок или наручники
        "Романтика": "#sprite-heart",       // Сердце ❤️
        "Драма": "#sprite-theater",         // Маски театра
        "Семейный": "#sprite-home",         // Домик
        "Вестерн": "#sprite-hat",           // Ковбойская шляпа (если есть)
        "Мультфильмы": "#sprite-smile",     // Или другой подходящий
    };

    // Основная функция плагина
    function startPlugin() {
        console.log('Плагин кастомных иконок запущен');

        function replaceIcons() {
            document.querySelectorAll('.items-line__head .full-person').forEach(block => {
                const nameEl = block.querySelector('.full-person__name');
                if (!nameEl) return;

                const name = nameEl.textContent.trim();
                const sprite = customIcons[name];
                if (!sprite) return;

                const photoDiv = block.querySelector('.full-person__photo');
                if (!photoDiv) return;

                // Делаем SVG из спрайта
                block.classList.add('full-person--svg');
                photoDiv.innerHTML = `<svg><use xlink:href="${sprite}"></use></svg>`;
                photoDiv.style.backgroundImage = '';

                // Кастомные цвета фона (по желанию)
                if (name === "Гонки") {
                    photoDiv.style.backgroundColor = 'rgb(220, 20, 20)'; // Красный
                } else if (name === "Ужасы") {
                    photoDiv.style.backgroundColor = 'rgb(80, 0, 120)'; // Тёмно-фиолетовый
                } else if (name === "Комедия") {
                    photoDiv.style.backgroundColor = 'rgb(255, 190, 0)'; // Оранжевый
                } else if (name === "Огонь!") {
                    photoDiv.style.backgroundColor = 'rgb(253, 69, 24)';
                } else if (name === "Романтика") {
                    photoDiv.style.backgroundColor = 'rgb(220, 50, 100)'; // Розовый
                } else {
                    photoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // По умолчанию
                }
            });
        }

        // Первичная замена
        replaceIcons();

        // Наблюдатель за новыми загруженными блоками
        const observer = new MutationObserver(replaceIcons);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // === Правильное ожидание готовности Lampa ===
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
