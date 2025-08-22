(function () {
    'use strict';

    // Ждем полной загрузки приложения Lampa
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            console.log('[refine_filter.js] Приложение готово, добавляем пункт "Уточнить" в меню фильтров');

            // Находим элемент меню "Качество"
            const qualityItem = document.querySelector('.selectbox-item__title[title="Качество"]');
            if (!qualityItem) {
                console.error('[refine_filter.js] Элемент "Качество" не найден в меню');
                Lampa.Notice.show('Ошибка: Не удалось найти пункт "Качество" в меню');
                return;
            }

            // Создаем новый пункт меню "Уточнить"
            const refineItem = document.createElement('div');
            refineItem.className = 'selectbox-item selector';
            refineItem.innerHTML = `
                <div class="selectbox-item__title">Уточнить</div>
                <div class="selectbox-item__subtitle">Не выбрано</div>
            `;

            // Вставляем новый пункт после "Качество"
            qualityItem.parentElement.insertAdjacentElement('afterend', refineItem);

            // Добавляем обработчик клика для открытия поля ввода
            refineItem.addEventListener('click', function () {
                // Создаем или находим поле ввода
                let refineInput = document.querySelector('.w2 .filter-label');
                if (!refineInput) {
                    console.log('[refine_filter.js] Поле ввода "Уточнить" не найдено, создаем новое');
                    const inputContainer = document.createElement('div');
                    inputContainer.className = 'w2';
                    inputContainer.innerHTML = `
                        <div class="filter-label">Уточнить</div>
                        <input name="refine" placeholder="Например BDRip, WEB-DL">
                    `;
                    document.querySelector('.selectbox__body').appendChild(inputContainer);
                    refineInput = inputContainer.querySelector('input[name="refine"]');
                } else {
                    refineInput = document.querySelector('input[name="refine"]');
                }

                // Показываем поле ввода
                refineInput.parentElement.style.display = 'block';

                // Обновляем подзаголовок при вводе
                refineInput.addEventListener('input', function () {
                    const value = refineInput.value.trim();
                    refineItem.querySelector('.selectbox-item__subtitle').textContent = value || 'Не выбрано';
                    filterResultsByRefine(value);
                });

                console.log('[refine_filter.js] Пункт "Уточнить" активирован');
            });

            console.log('[refine_filter.js] Пункт "Уточнить" добавлен в меню');
        }
    });

    // Функция для фильтрации результатов по BDRip или WEB-DL
    function filterResultsByRefine(refineValue) {
        try {
            // Получаем данные из хранилища Lampa
            let results = Lampa.Storage.get('torrents_data', '[]');
            if (typeof results === 'string') {
                results = JSON.parse(results);
            }

            if (!results || !Array.isArray(results)) {
                console.error('[refine_filter.js] Нет данных для фильтрации или данные некорректны');
                Lampa.Notice.show('Нет данных для фильтрации');
                return;
            }

            // Фильтруем результаты по значению из поля ввода
            const filterValue = refineValue.toLowerCase().trim();
            let filteredResults = results;

            if (filterValue) {
                filteredResults = results.filter(result => {
                    if (!result.Title) return false;
                    const titleLower = result.Title.toLowerCase();
                    return (
                        (filterValue.includes('bdrip') && titleLower.includes('bdrip')) ||
                        (filterValue.includes('web-dl') && 
                         (titleLower.includes('web-dl') || titleLower.includes('webdl-rip')))
                    );
                });
            }

            console.log('[refine_filter.js] Отфильтрованные результаты:', filteredResults);

            // Проверяем, есть ли результаты
            if (filteredResults.length === 0) {
                Lampa.Notice.show('Не найдено результатов для фильтра: ' + refineValue);
                return;
            }

            // Отображаем результаты в интерфейсе Lampa
            if (typeof Lampa.Torrents.render === 'function') {
                Lampa.Torrents.render(filteredResults);
            } else {
                console.error('[refine_filter.js] Метод Lampa.Torrents.render не найден');
                Lampa.Notice.show('Ошибка отображения результатов');
                renderResultsFallback(filteredResults);
            }
        } catch (error) {
            console.error('[refine_filter.js] Ошибка при фильтрации:', error);
            Lampa.Notice.show('Ошибка при фильтрации результатов');
        }
    }

    // Альтернативная функция рендеринга результатов
    function renderResultsFallback(results) {
        const container = document.querySelector('.torrent-list') || document.createElement('div');
        if (!container.classList.contains('torrent-list')) {
            container.className = 'torrent-list';
            document.body.appendChild(container);
        }

        container.innerHTML = ''; // Очищаем контейнер

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'torrent-item';
            item.innerHTML = `
                <h3>${result.Title || 'Без названия'}</h3>
                <p>Качество: ${result.info && result.info.quality ? result.info.quality + 'p' : 'Неизвестно'}</p>
                <p>Размер: ${result.info && result.info.sizeName ? result.info.sizeName : 'Неизвестно'}</p>
                <p>Сиды: ${result.Seeders || 0}, Пиры: ${result.Peers || 0}</p>
                ${result.MagnetUri ? `<a href="${result.MagnetUri}" target="_blank">Скачать</a>` : ''}
            `;
            container.appendChild(item);
        });

        // Базовые стили для отображения
        const style = document.createElement('style');
        style.textContent = `
            .torrent-list { padding: 20px; }
            .torrent-item { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
            .torrent-item h3 { margin: 0; font-size: 16px; }
            .torrent-item p { margin: 5px 0; }
            .torrent-item a { color: #007bff; text-decoration: none; }
            .torrent-item a:hover { text-decoration: underline; }
            .w2 { padding: 10px; }
            .w2 .filter-label { font-weight: bold; margin-bottom: 5px; }
            .w2 input[name="refine"] { width: 100%; padding: 8px; }
        `;
        document.head.appendChild(style);
    }

    // Добавляем CSS для видимости пункта меню
    const style = document.createElement('style');
    style.textContent = `
        .selectbox-item.selector { display: block !important; visibility: visible !important; }
        .selectbox-item__title[title="Уточнить"] { cursor: pointer; }
    `;
    document.head.appendChild(style);

    console.log('[refine_filter.js] Плагин инициализирован');
})();
