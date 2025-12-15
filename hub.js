
(function() {
    'use strict';

    // === НАСТРОЙКА КАСТОМНЫХ ИКОНОК ===
    // Ключ — точное название категории (как в .full-person__name, регистр важен!)
    // Значение — инлайн SVG (рекомендую) или "#sprite-имя" для встроенного спрайта
    const customIcons = {
        // Специальные разделы (не жанры)
        "Огонь!": "#sprite-fire",  // Можно заменить на свой SVG
        "Топ 100 - Фильмы": "#sprite-top",

        // Жанровые категории (основные в Lampa)
        "Боевик": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,  // Взрыв/экшн (можно заменить на пистолет или кулак)

        "Приключения": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>`,  // Компас или карта

        "Комедия": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,  // Смеющееся лицо 😄

        "Драма": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10"/><path d="M12 14v8"/><circle cx="12" cy="12" r="10"/></svg>`,  // Маски театра (трагедия/комедия)

        "Ужасы": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2s-8 4-8 10c0 8 8 10 8 10s8-2 8-10c0-6-8-10-8-10z"/><circle cx="8" cy="10" r="2"/><circle cx="16" cy="10" r="2"/><path d="M9 14s1.5 3 3 3 3-3 3-3"/></svg>`,  // Призрак 👻

        "Триллер": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8V4l8-2 8 2v6.2c0 7.3-8 11.8-8 11.8z"/><path d="M12 8v4"/><circle cx="12" cy="15" r="1"/></svg>`,  // Нож или напряжение

        "Фантастика": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 5 2 8-6.5-4-6.5 4 2-8L3 9h7z"/></svg>`,  // Звезда/космос

        "Фэнтези": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 5 2 8-6.5-4-6.5 4 2-8L3 9h7z"/></svg>`,  // Волшебная палочка или дракон

        "Криминал": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>`,  // Наручники или маска

        "Детектив": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="6"/><path d="M12 16h.01"/><path d="M2 12h20"/></svg>`,  // Лупа

        "Романтика": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,  // Сердце ❤️

        "Семейный": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a4 4 0 1 0-8 0"/><path d="M12 14c-4 0-8 2-8 6h16c0-4-4-6-8-6z"/></svg>`,  // Дом с семьёй

        "Вестерн": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-10 8h4v12h12v-12h4l-10-8z"/></svg>`,  // Ковбойская шляпа

        "Гонки": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-5l-9-7-6 4v3H5z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,  // Гоночный болид 🏎️

        // Добавьте другие жанры по аналогии:
        // "Мультфильмы": `<svg ... ваш код ... </svg>`,
        // "Аниме": "#sprite-anime",  // Если есть в спрайте
    };

    // Функция замены иконки в одном блоке
    function replaceIcon(block) {
        const nameEl = block.querySelector('.full-person__name');
        if (!nameEl) return;

        const name = nameEl.textContent.trim();
        const iconData = customIcons[name];
        if (!iconData) return;

        const photoDiv = block.querySelector('.full-person__photo');
        if (!photoDiv) return;

        // Всегда делаем SVG-тип (даже если это встроенный спрайт)
        block.classList.add('full-person--svg');

        // Если это встроенный спрайт (#sprite-...)
        if (typeof iconData === 'string' && iconData.startsWith('#')) {
            photoDiv.innerHTML = `<svg><use xlink:href="${iconData}"></use></svg>`;
        } else {
            // Инлайн SVG
            photoDiv.innerHTML = iconData;
        }

        // === НАСТРОЙКА ЦВЕТА ФОНА ПО КАТЕГОРИЯМ ===
        // Добавьте/измените здесь свои цвета (RGB или rgba)
        if (name === "Гонки") {
            photoDiv.style.backgroundColor = 'rgb(220, 20, 20)';  // Красный Ferrari
        } else if (name === "Ужасы") {
            photoDiv.style.backgroundColor = 'rgb(100, 0, 100)';  // Тёмно-фиолетовый
        } else if (name === "Комедия") {
            photoDiv.style.backgroundColor = 'rgb(255, 200, 0)';  // Жёлтый/оранжевый
        } else if (name === "Огонь!") {
            photoDiv.style.backgroundColor = 'rgb(253, 69, 24)';  // Оригинальный оранжевый
        } else {
            photoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';  // Полупрозрачный по умолчанию
        }

        // Очистка старого контента
        photoDiv.style.backgroundImage = '';
    }

    // Обработка всех блоков
    function processAll() {
        document.querySelectorAll('.items-line__head .full-person').forEach(replaceIcon);
    }

    // Наблюдатель за DOM
    const observer = new MutationObserver(processAll);

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            processAll();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        processAll();
        observer.observe(document.body, { childList: true, subtree: true });
    }

    console.log('Плагин кастомных иконок для категорий Lampa загружен!');
})();
