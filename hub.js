(function() {
    'use strict';

    // Только безопасные замены: встроенные спрайты Lampa или URL на фото
    const customIcons = {
        // Специальные
        "Огонь!": "#sprite-fire",
        "Топ 100 - Фильмы": "#sprite-top",

        // Жанры — только встроенные спрайты (они точно есть и не сломают приложение)
        "Гонки": "#sprite-speed",              // Спидометр — идеально для гонок
        "Боевик": "#sprite-fire",              // Огонь как экшн
        "Ужасы": "#sprite-ghost",               // Призрак (есть в спрайте Lampa)
        "Комедия": "#sprite-smile",             // Смайлик (если есть, иначе заменит на огонь)
        "Фантастика": "#sprite-star",           // Звезда
        "Романтика": "#sprite-heart",           // Сердце
        "Триллер": "#sprite-search",            // Лупа (напряжение, расследование)
        "Семейный": "#sprite-home",             // Домик
    };

    function replaceIcon(block) {
        try {
            const nameEl = block.querySelector('.full-person__name');
            if (!nameEl) return;

            const name = nameEl.textContent.trim();
            const sprite = customIcons[name];
            if (!sprite || !sprite.startsWith('#sprite-')) return;

            const photoDiv = block.querySelector('.full-person__photo');
            if (!photoDiv) return;

            // Делаем SVG из встроенного спрайта
            block.classList.add('full-person--svg');
            photoDiv.innerHTML = `<svg><use xlink:href="${sprite}"></use></svg>`;

            // Цвета фона (по желанию)
            if (name === "Гонки") photoDiv.style.backgroundColor = 'rgb(220, 20, 20)';
            else if (name === "Ужасы") photoDiv.style.backgroundColor = 'rgb(100, 0, 100)';
            else if (name === "Огонь!") photoDiv.style.backgroundColor = 'rgb(253, 69, 24)';
            else photoDiv.style.backgroundColor = 'rgba(255,255,255,0.15)';

            photoDiv.style.backgroundImage = '';
        } catch (e) {
            console.error('Ошибка в плагине иконок:', e);
        }
    }

    function processAll() {
        try {
            document.querySelectorAll('.items-line__head .full-person--svg, .items-line__head .full-person').forEach(replaceIcon);
        } catch (e) {}
    }

    const observer = new MutationObserver(processAll);

    // Запуск с задержкой, чтобы Lampa успела загрузиться
    setTimeout(() => {
        processAll();
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('Безопасный плагин иконок запущен');
    }, 3000);  // Ждём 3 секунды после загрузки
})();
