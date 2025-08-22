(function () {
    'use strict';

    // Ждем полной загрузки приложения Lampa
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            console.log('[refine_filter.js] Приложение готово, добавляем пункт "Уточнить" в меню фильтров');

            // Функция для добавления пункта меню с попытками ожидания DOM
            function addRefineMenuItem() {
                const qualityItem = Array.from(document.querySelectorAll('.selectbox-item__title'))
                    .find(el => el.textContent.trim() === 'Качество');
                if (!qualityItem) {
                    console.warn('[refine_filter.js] Элемент "Качество" еще не найден, повторная попытка...');
                    setTimeout(addRefineMenuItem, 500); // Повторяем через 500 мс
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

                // Создаем подменю для "Уточнить"
                const submenu = document.createElement('div');
                submenu.className = 'selectbox__content layer--height refine-submenu';
                submenu.style.display = 'none';
                submenu.innerHTML = `
                    <div class="selectbox__head">
                        <div class="selectbox__title">Уточнить</div>
                    </div>
                    <div class="selectbox__body layer--wheight">
                        <div class="scroll scroll--mask scroll--over">
                            <div class="scroll__content">
                                <div class="scroll__body">
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Отмена</div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox">
                                        <div class="selectbox-item__title">WEB-DL</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox">
                                        <div class="selectbox-item__title">WEBDL-Rip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox">
                                        <div class="selectbox-item__title">BDRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Вставляем подменю после основного пункта
                refineItem.insertAdjacentElement('afterend', submenu);

                // Обработчик клика на "Уточнить" для показа/скрытия подменю
                refineItem.addEventListener('click', function () {
                    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                    console.log('[refine_filter.js] Подменю "Уточнить" открыто/закрыто');
                });

                // Обработчики для пунктов подменю
                submenu.querySelectorAll('.selectbox-item__title').forEach(item => {
                    item.addEventListener('click', function () {
                        const value = item.textContent.trim();
                        refineItem.querySelector('.selectbox-item__subtitle').textContent = value === 'Отмена' ? 'Не выбрано' : value;
                        filterResultsByRefine(value === 'Отмена' ? '' : value);
                        submenu.style.display = 'none'; // Закрываем подменю после выбора
                        console.log('[refine_filter.js] Выбран фильтр:', value);
                    });
                });

                console.log('[refine_filter.js] Пункт "Уточнить" и подменю добавлены');
            }

            // Запускаем добавление пункта меню
            addRefineMenuItem();
        }
    });

    // Функция для фильтрации результатов по BDRip, WEB-DL или WEBDL-Rip
    function filterResultsByRefine(filterValue) {
        try {
            // Получаем данные из хранилища Lampa
            let results = Lampa.Storage.get('torrents_data', '[]');
            if (typeof results === 'string') {
                results = JSON.parse(results);
            }

            if (!results || !Array.isArray(results)) {
                console.error('[refine_filter.js] Нет данных для фильтрации или данные некорректны');
                if (typeof Lampa.Utils.message === 'function') {
                    Lampa.Utils.message('Нет данных для фильтрации');
                } else {
                    alert('Нет данных для фильтрации');
                }
                return;
            }

            // Фильтруем результаты по выбранному значению
            let filteredResults = results;
            if (filterValue) {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    if (!result.Title) return false;
                    const titleLower = result.Title.toLowerCase();
                    return (
                        (filterLower === 'web-dl' && titleLower.includes('web-dl')) ||
                        (filterLower === 'webdl-rip' && titleLower.includes('webdl-rip')) ||
                        (filterLower === 'bdrip' && titleLower.includes('bdrip'))
                    );
                });
            }

            console.log('[refine_filter.js] Отфильтрованные результаты:', filteredResults);

            // Проверяем, есть ли результаты
            if (filteredResults.length === 0) {
                if (typeof Lampa.Utils.message === 'function') {
                    Lampa.Utils.message('Не найдено результатов для фильтра: ' + filterValue);
                } else {
                    alert('Не найдено результатов для фильтра: ' + filterValue);
                }
                return;
            }

            // Отображаем результаты в интерфейсе Lampa
            if (typeof Lampa.Torrents.render === 'function') {
                Lampa.Torrents.render(filteredResults);
            } else {
                console.error('[refine_filter.js] Метод Lampa.Torrents.render не найден');
                if (typeof Lampa.Utils.message === 'function') {
                    Lampa.Utils.message('Ошибка отображения результатов');
                } else {
                    alert('Ошибка отображения результатов');
                }
                renderResultsFallback(filteredResults);
            }
        } catch (error) {
            console.error('[refine_filter.js] Ошибка при фильтрации:', error);
            if (typeof Lampa.Utils.message === 'function') {
                Lampa.Utils.message('Ошибка при фильтрации результатов');
            } else {
                alert('Ошибка при фильтрации результатов');
            }
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
            .refine-submenu { position: absolute; background: #fff; z-index: 1000; }
            .selectbox-item.selector { display: block !important; visibility: visible !important; }
            .selectbox-item__title { cursor: pointer; }
            .selectbox-item--checkbox .selectbox-item__checkbox { 
                width: 20px; height: 20px; border: 1px solid #ccc; display: inline-block; margin-left: 10px; 
            }
            .selectbox-item--checkbox.selected .selectbox-item__checkbox { 
                background: #007bff; border-color: #007bff; 
            }
        `;
        document.head.appendChild(style);
    }

    // Добавляем CSS для видимости пункта меню
    const style = document.createElement('style');
    style.textContent = `
        .selectbox-item.selector { display: block !important; visibility: visible !important; }
        .selectbox-item__title { cursor: pointer; }
    `;
    document.head.appendChild(style);

    console.log('[refine_filter.js] Плагин инициализирован');
})();
