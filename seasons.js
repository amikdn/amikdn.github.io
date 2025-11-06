(function () {
    'use strict';
    // --- Защита от повторного запуска плагина ---
    // Проверяем, был ли плагин уже инициализирован
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
   
    // Инициализируем глобальный объект плагина
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;
    // === НАСТРОЙКИ ПЛАГИНА ===
    var CONFIG = {
        tmdbApiKey: '4ef0d7355d9ffb5151e987764708ce96', // API ключ для доступа к TMDB
        cacheTime: 24 * 60 * 60 * 1000, // Время хранения кэша (24 часа)
        enabled: true, // Активировать/деактивировать плагин
        language: 'uk' // Язык для запросов к TMDB
    };
    // === СТИЛИ ДЛЯ МЕТОК СЕЗОНА ===
    var style = document.createElement('style');
    style.textContent = `
    /* Стиль для ЗАВЕРШЕННЫХ сезонов (зеленая метка) */
    .card--season-complete {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(61, 161, 141, 0.8); /* Зеленый цвет */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
   
    /* Стиль для НЕЗАВЕРШЕННЫХ сезонов (желтая метка с прогрессом) */
    .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(255, 193, 7, 0.8); /* Желтый цвет */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
   
    /* Общие стили для текста в метках - ОДИНАКОВЫЕ ДЛЯ ОБОИХ ТИПОВ */
    .card--season-complete div,
    .card--season-progress div {
        text-transform: uppercase;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; /* Тот же шрифт */
        font-weight: 700; /* Тот же жирный шрифт */
        font-size: 1.05em; /* Тот же размер */
        padding: 0.3em 0.4em; /* Тот же отступ */
        white-space: nowrap; /* Тот же перенос */
        display: flex; /* Тот же flex */
        align-items: center; /* Тот же выравнивание */
        gap: 4px; /* Тот же промежуток */
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
   
    /* Цвет текста для завершенных сезонов (белый на зеленом) */
    .card--season-complete div {
        color: #ffffff; /* Белый текст для лучшей видимости на зеленом фоне */
    }
   
    /* Цвет текста для незавершенных сезонов (черный на желтом) */
    .card--season-progress div {
        color: #000000; /* Черный текст для лучшей видимости на желтом фоне */
    }
   
    /* Класс для плавного показа метки */
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1; /* Полная видимость при показе */
    }
   
    /* Адаптация для мобильных устройств */
    @media (max-width: 768px) {
        .card--season-complete div,
        .card--season-progress div {
            font-size: 0.95em; /* Немного меньший размер шрифта на мобильных */
            padding: 0.22em 0.5em; /* Добавлены МЕНЬШИЕ ОТСТУПЫ НА МОБИЛЬНЫХ */
        }
    }
    `;
    // Добавляем стили в головную часть документа
    document.head.appendChild(style);
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    /**
     * Определяет тип медиа на основе данных карточки
     * @param {Object} cardData - данные карточки
     * @returns {string} - тип медиа ('tv', 'movie', 'unknown')
     */
    function getMediaType(cardData) {
        // Если данные отсутствуют - возвращаем 'unknown'
        if (!cardData) return 'unknown';
       
        // Проверка на сериал (наличие названия или даты первого эфира)
        if (cardData.name || cardData.first_air_date) return 'tv';
       
        // Проверка на фильм (наличие названия или даты релиза)
        if (cardData.title || cardData.release_date) return 'movie';
       
        // Если тип не определен
        return 'unknown';
    }
    // Инициализация кэша из localStorage
    // Используем localStorage для хранения кэшированных данных
    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');
    /**
     * Загружает данные сериала из TMDB API с использованием кэша
     * @param {number} tmdbId - ID сериала в базе TMDB
     * @returns {Promise} - промис с данными сериала
     */
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            // Проверка кэша: если данные есть и не просрочены - используем их
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }
            // Проверка корректности API ключа
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Пожалуйста, вставьте корректный TMDB API ключ'));
            }
            // Формирование URL для запроса к TMDB API
            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
           
            // Выполнение HTTP запроса к TMDB API
            fetch(url)
                .then(response => response.json()) // Преобразуем ответ в JSON
                .then(function(data) {
                    // Проверка на ошибку от API
                    if (data.success === false) throw new Error(data.status_message);
                    // Сохранение данных в кэш с текущей меткой времени
                    cache[tmdbId] = {
                        data: data,
                        timestamp: Date.now()
                    };
                    // Сохраняем обновленный кэш в localStorage
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                    // Возвращаем полученные данные
                    resolve(data);
                })
                .catch(reject); // Передаем ошибку дальше
        });
    }
    /**
     * Проверяет состояние сезона и возвращает информацию о прогрессе
     * @param {Object} tmdbData - данные сериала из TMDB
     * @returns {Object|boolean} - информация о прогрессе или false
     */
    function getSeasonProgress(tmdbData) {
        // Проверка наличия необходимых данных
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
       
        // Последний выпущенный эпизод
        var lastEpisode = tmdbData.last_episode_to_air;
       
        // Поиск текущего сезона (сезоны с номером > 0, чтобы исключить специальные сезоны)
        var currentSeason = tmdbData.seasons.find(s =>
            s.season_number === lastEpisode.season_number && s.season_number > 0
        );
       
        // Если сезон не найден
        if (!currentSeason) return false;
       
        // Общее количество эпизодов в сезоне
        var totalEpisodes = currentSeason.episode_count || 0;
       
        // Количество выпущенных эпизодов
        var airedEpisodes = lastEpisode.episode_number || 0;
       
        // Возвращаем объект с детальной информацией о прогрессе
        return {
            seasonNumber: lastEpisode.season_number, // Номер текущего сезона
            airedEpisodes: airedEpisodes, // Количество выпущенных эпизодов
            totalEpisodes: totalEpisodes, // Общее количество эпизодов
            isComplete: airedEpisodes >= totalEpisodes // Завершен ли сезон
        };
    }
    /**
     * Создает DOM-элемент метки сезона
     * @param {string} content - текстовое содержимое метки
     * @param {boolean} isComplete - завершен ли сезон
     * @param {boolean} loading - является ли это временной меткой загрузки
     * @returns {HTMLElement} - созданный элемент метки
     */
    function createBadge(content, isComplete, loading) {
        // Создаем новый div элемент для метки
        var badge = document.createElement('div');
       
        // Выбираем CSS класс в зависимости от состояния сезона
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
       
        // Устанавливаем класс элемента (добавляем 'loading' если это временная метка)
        badge.className = badgeClass + (loading ? ' loading' : '');
       
        // Устанавливаем HTML содержимое метки
        badge.innerHTML = `<div>${content}</div>`;
       
        // Возвращаем созданный элемент
        return badge;
    }
    /**
     * Выравнивает метку сезона относительно метки качества
     * @param {HTMLElement} cardEl - элемент карточки
     * @param {HTMLElement} badge - элемент метки сезона
     */
    function adjustBadgePosition(cardEl, badge) {
        // Находим метку качества видео в карточке
        let quality = cardEl.querySelector('.card__quality');
       
        if (quality && badge) {
            // СЛУЧАЙ 1: Есть метка качества - размещаем метку сезона выше нее
           
            // Получаем фактическую высоту метки качества
            let qHeight = quality.offsetHeight;
           
            // Получаем значение нижнего отступа метки качества из CSS
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0;
           
            // Устанавливаем позицию метки сезона (выше метки качества)
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else if (badge) {
            // СЛУЧАЙ 2: Метки качества нет - размещаем метку сезона в стандартном положении
            badge.style.bottom = '0.50em'; // Стандартный нижний отступ
        }
    }
    // === ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С МЕТКАМИ КАЧЕСТВА ===
   
    /**
     * Обновляет позиции всех меток сезона при изменениях в карточке
     * Используется при добавлении/удалении меток качества
     * @param {HTMLElement} cardEl - элемент карточки
     */
    function updateBadgePositions(cardEl) {
        // Находим все метки сезона в карточке (обоих типов)
        var badges = cardEl.querySelectorAll('.card--season-complete, .card--season-progress');
       
        // Для каждой найденной метки обновляем позицию
        badges.forEach(function(badge) {
            adjustBadgePosition(cardEl, badge);
        });
    }
    // === НАБЛЮДЕНИЕ ЗА ИЗМЕНЕНИЯМИ МЕТОК КАЧЕСТВА ===
    // Создаем наблюдатель для отслеживания добавления/удаления меток качества
    var qualityObserver = new MutationObserver(function(mutations) {
        // Перебираем все найденные изменения
        mutations.forEach(function(mutation) {
           
            // Проверяем добавленные узлы (новые метки качества)
            mutation.addedNodes?.forEach(function(node) {
                // Проверяем, добавлена ли метка качества
                if (node.classList && node.classList.contains('card__quality')) {
                    // Находим родительскую карточку для этой метки качества
                    var cardEl = node.closest('.card');
                    if (cardEl) {
                        // Обновляем позицию метки сезона при добавлении метки качества
                        // Используем задержку для гарантии что DOM обновился
                        setTimeout(() => {
                            updateBadgePositions(cardEl);
                        }, 100);
                    }
                }
            });
           
            // Проверяем удаленные узлы (удаленные метки качества)
            mutation.removedNodes?.forEach(function(node) {
                if (node.classList && node.classList.contains('card__quality')) {
                    // Находим родительскую карточку для удаленной метки качества
                    var cardEl = node.closest('.card');
                    if (cardEl) {
                        // Обновляем позицию метки сезона при удалении метки качества
                        setTimeout(() => {
                            updateBadgePositions(cardEl);
                        }, 100);
                    }
                }
            });
        });
    });
    /**
     * Добавляет метку статуса сезона к карточке сериала
     * @param {HTMLElement} cardEl - элемент карточки
     */
    function addSeasonBadge(cardEl) {
        // Проверка: карточка уже обработана или отсутствует
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        // Проверка: готовы ли данные карточки (если нет - откладываем обработку)
        if (!cardEl.card_data) {
            // Вызываем функцию снова через requestAnimationFrame
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }
        // Получаем данные карточки
        var data = cardEl.card_data;
        // Проверка: это сериал (только для сериалов показываем метку)
        if (getMediaType(data) !== 'tv') return;
        // Находим контейнер для меток (элемент .card__view)
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        // Удаление предыдущих меток обоих типов (если они существуют)
        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        oldBadges.forEach(function(badge) {
            badge.remove();
        });
        // Создание временной метки загрузки (по умолчанию - для незавершенных сезонов)
        var badge = createBadge('...', false, true);
       
        // Добавление метки в DOM
        view.appendChild(badge);
       
        // ВЫЗОВ 1: Первое выравнивание сразу после добавления в DOM
        adjustBadgePosition(cardEl, badge);
        // === НАБЛЮДЕНИЕ ЗА МЕТКОЙ КАЧЕСТВА В ЭТОЙ КАРТОЧКЕ ===
        // Подключаем наблюдатель для отслеживания изменений меток качества
        try {
            qualityObserver.observe(view, {
                childList: true, // Наблюдение за добавлением/удалением дочерних элементов
                subtree: true // Наблюдение за всеми вложенными элементами
            });
        } catch (e) {
            // Обработка возможных ошибок при наблюдении
            console.log('Ошибка наблюдения за метками качества:', e);
        }
        // Обозначение карточки как обработанной (статус: загрузка)
        cardEl.setAttribute('data-season-processed', 'loading');
        // Загрузка данных сериала из TMDB
        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                // Получаем информацию о прогрессе сезона
                var progressInfo = getSeasonProgress(tmdbData);
               
                // Проверяем, удалось ли получить информацию
                if (progressInfo) {
                    var content = '';
                    var isComplete = progressInfo.isComplete;
                   
                    if (isComplete) {
                        // ДЛЯ ЗАВЕРШЕННЫХ СЕЗОНОВ: "S1 ✓" (зеленая метка)
                        content = `S${progressInfo.seasonNumber} ✓`;
                    } else {
                        // ДЛЯ НЕЗАВЕРШЕННЫХ СЕЗОНОВ: "S1 5/10" (желтая метка с прогрессом)
                        content = `S${progressInfo.seasonNumber} ${progressInfo.airedEpisodes}/${progressInfo.totalEpisodes}`;
                    }
                   
                    // Обновляем метку с правильным классом и содержимым
                    badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = `<div>${content}</div>`;
                   
                    // ВЫЗОВ 2: Выравнивание после обновления содержимого метки
                    adjustBadgePosition(cardEl, badge);
                    // Задержка для плавного показа метки
                    setTimeout(() => {
                        // Добавляем класс для плавного показа
                        badge.classList.add('show');
                       
                        // ВЫЗОВ 3: Финальное выравнивание после показа
                        adjustBadgePosition(cardEl, badge);
                    }, 50);
                    // Обозначение карточки как обработанной (статус: завершено или в процессе)
                    cardEl.setAttribute('data-season-processed', isComplete ? 'complete' : 'in-progress');
                } else {
                    // Если не удалось получить информацию о сезоне - удаляем метку
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'error');
                }
            })
            .catch(function(error) {
                // Обработка ошибок загрузки данных
                console.log('SeasonBadgePlugin ошибка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }
    // === СИСТЕМА НАБЛЮДЕНИЯ ЗА НОВЫМИ КАРТОЧКАМИ ===
    // Создаем наблюдатель за изменениями в DOM
    var observer = new MutationObserver(function(mutations) {
        // Перебираем все найденные изменения
        mutations.forEach(function(mutation) {
            // Перебираем все добавленные узлы
            mutation.addedNodes?.forEach(function(node) {
                // Проверка, что это HTML-элемент (не текстовый узел)
                if (node.nodeType !== 1) return;
                // Если добавленный элемент является карточкой - обрабатываем его
                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadge(node);
                }
                // Если добавленный контейнер содержит карточки - обрабатываем все внутренние карточки
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadge);
                }
            });
        });
    });
    // === ОБРАБОТЧИК ИЗМЕНЕНИЯ РАЗМЕРА ОКНА ===
    // Добавляем обработчик события изменения размера окна
    window.addEventListener('resize', function() {
        // Обновляем позиции всех меток при изменении размера окна
        var allBadges = document.querySelectorAll('.card--season-complete, .card--season-progress');
        allBadges.forEach(function(badge) {
            var cardEl = badge.closest('.card');
            if (cardEl) {
                adjustBadgePosition(cardEl, badge);
            }
        });
    });
    /**
     * Основная функция инициализации плагина
     */
    function initPlugin() {
        // Проверка активности плагина
        if (!CONFIG.enabled) return;
        // Список контейнеров, где могут находиться карточки
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length > 0) {
            // Подключение наблюдателя к каждому найденному контейнеру
            containers.forEach(container => {
                try {
                    observer.observe(container, {
                        childList: true, // Наблюдение за добавлением/удалением детей
                        subtree: true // Наблюдение за всеми потомками
                    });
                } catch (e) {
                    console.log('Ошибка наблюдения за контейнером:', e);
                }
            });
        } else {
            // Если контейнеры не найдены - наблюдаем за всем документом
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        // Обработка уже существующих карточек на странице
        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            // Задержка для избежания одновременной загрузки большого количества карточек
            setTimeout(() => addSeasonBadge(card), index * 300);
        });
    }
    // === СИСТЕМА ЗАПУСКА ПЛАГИНА ===
    // ВАРИАНТ 1: Если приложение уже готово (стандартный случай)
    if (window.appready) {
        initPlugin();
    }
    // ВАРИАНТ 2: Для Lampa Framework (ждем событие готовности)
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    }
    // ВАРИАНТ 3: Резервный вариант (запуск через 2 секунды)
    else {
        setTimeout(initPlugin, 2000);
    }
})();