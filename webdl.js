(function () {
    'use strict';

    // Ждем полной загрузки приложения Lampa
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            console.log('[refine_filter.js] Приложение готово, инициализация плагина');

            // Функция для добавления пункта меню "Уточнить"
            function addRefineMenuItem() {
                // Проверяем, открыт ли раздел "Торренты"
                const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                       document.querySelector('.activity--active .torrent-list');
                if (!isTorrentsPage) {
                    console.log('[refine_filter.js] Раздел торрентов не активен, ждем 500 мс');
                    setTimeout(addRefineMenuItem, 500);
                    return;
                }

                const qualityItem = Array.from(document.querySelectorAll('.selectbox-item__title'))
                    .find(el => el.textContent.trim() === 'Качество');
                if (!qualityItem) {
                    console.warn('[refine_filter.js] Элемент "Качество" не найден, повторная попытка...');
                    setTimeout(addRefineMenuItem, 500);
                    return;
                }

                // Проверяем, не добавлен ли уже пункт "Уточнить"
                if (document.querySelector('.selectbox-item__title[data-refine="true"]')) {
                    console.log('[refine_filter.js] Пункт "Уточнить" уже добавлен');
                    return;
                }

                // Создаем пункт меню "Уточнить"
                const refineItem = document.createElement('div');
                refineItem.className = 'selectbox-item selector';
                refineItem.innerHTML = `
                    <div class="selectbox-item__title" data-refine="true">Уточнить</div>
                    <div class="selectbox-item__subtitle">Не выбрано</div>
                `;

                // Вставляем пункт после "Качество"
                qualityItem.parentElement.insertAdjacentElement('afterend', refineItem);

                // Создаем подменю
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
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="WEB-DL">
                                        <div class="selectbox-item__title">WEB-DL</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="WEB-DLRip">
                                        <div class="selectbox-item__title">WEB-DLRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="BDRip">
                                        <div class="selectbox-item__title">BDRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Вставляем подменю
                refineItem.insertAdjacentElement('afterend', submenu);

                // Обработчик клика на "Уточнить"
                refineItem.addEventListener('click', function () {
                    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                    console.log('[refine_filter.js] Подменю "Уточнить":', submenu.style.display);
                });

                // Обработчики для пунктов подменю
                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const value = item.dataset.value || item.querySelector('.selectbox-item__title').textContent.trim();
                        const subtitle = refineItem.querySelector('.selectbox-item__subtitle');
                        subtitle.textContent = value === 'Отмена' ? 'Не выбрано' : value;

                        // Переключаем состояние чекбокса
                        if (value !== 'Отмена') {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === value);
                            });
                        } else {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                        }

                        filterResultsByRefine(value === 'Отмена' ? '' : value);
                        submenu.style.display = 'none';
                        console.log('[refine_filter.js] Выбран фильтр:', value);
                    });
                });

                console.log('[refine_filter.js] Пункт "Уточнить" и подменю добавлены');
            }

            // Запускаем добавление пункта меню
            addRefineMenuItem();

            // Отслеживание изменений в DOM для повторного добавления при смене раздела
            const observer = new MutationObserver(() => {
                if (document.querySelector('.menu__item[data-action="mytorrents"].active') &&
                    !document.querySelector('.selectbox-item__title[data-refine="true"]')) {
                    addRefineMenuItem();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

    // Функция фильтрации результатов
    function filterResultsByRefine(filterValue) {
        try {
            // Проверяем, активен ли раздел торрентов
            const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                   document.querySelector('.activity--active .torrent-list');
            if (!isTorrentsPage) {
                console.log('[refine_filter.js] Фильтрация не выполняется: раздел торрентов не активен');
                return;
            }

            // Получаем данные из хранилища Lampa
            let results = Lampa.Storage.get('torrents_data', '[]');
            if (typeof results === 'string') {
                results = JSON.parse(results);
            }

            if (!results || !Array.isArray(results)) {
                console.error('[refine_filter.js] Нет данных для фильтрации или данные некорректны');
                Lampa.Utils.message?.('Нет данных для фильтрации') || alert('Нет данных для фильтрации');
                return;
            }

            // Фильтруем результаты
            let filteredResults = results;
            if (filterValue) {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    const title = result.Title || '';
                    const titleLower = title.toLowerCase();
                    const ffprobe = result.info?.ffprobe?.video || '';
                    return (
                        (filterLower === 'web-dl' && titleLower.includes('web-dl')) ||
                        (filterLower === 'web-dlrip' && titleLower.includes('webdl-rip')) ||
                        (filterLower === 'bdrip' && titleLower.includes('bdrip'))
                    );
                });
            }

            console.log('[refine_filter.js] Отфильтрованные результаты:', filteredResults);

            // Проверяем результаты
            if (filteredResults.length === 0) {
                Lampa.Utils.message?.(`Не найдено результатов для фильтра: ${filterValue}`) ||
                    alert(`Не найдено результатов для фильтра: ${filterValue}`);
                return;
            }

            // Отображаем результаты
            if (typeof Lampa.Torrents.render === 'function') {
                Lampa.Torrents.render(filteredResults);
            } else {
                console.error('[refine_filter.js] Метод Lampa.Torrents.render не найден');
                Lampa.Utils.message?.('Ошибка отображения результатов') || alert('Ошибка отображения результатов');
                renderResultsFallback(filteredResults);
            }
        } catch (error) {
            console.error('[refine_filter.js] Ошибка при фильтрации:', error);
            Lampa.Utils.message?.('Ошибка при фильтрации результатов') || alert('Ошибка при фильтрации результатов');
        }
    }

    // Альтернативная функция рендеринга
    function renderResultsFallback(results) {
        const container = document.querySelector('.torrent-list') || document.createElement('div');
        if (!container.classList.contains('torrent-list')) {
            container.className = 'torrent-list';
            document.querySelector('.activity--active')?.appendChild(container);
        }

        container.innerHTML = '';

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'torrent-item';
            item.innerHTML = `
                <div class="torrent-item__title">${result.Title || 'Без названия'}</div>
                <div class="torrent-item__ffprobe">
                    <div class="m-video">${result.info?.ffprobe?.video || 'Неизвестно'}</div>
                </div>
                <div>Размер: ${result.info?.sizeName || 'Неизвестно'}</div>
                <div>Сиды: ${result.Seeders || 0}, Пиры: ${result.Peers || 0}</div>
                ${result.MagnetUri ? `<a href="${result.MagnetUri}" target="_blank">Скачать</a>` : ''}
            `;
            container.appendChild(item);
        });
    }

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        .selectbox-item.selector { display: block !important; visibility: visible !important; }
        .selectbox-item__title { cursor: pointer; padding: 10px; }
        .refine-submenu { 
            position: absolute; 
            background: #2a2a2a; 
            z-index: 1000; 
            border: 1px solid #444; 
            border-radius: 4px;
            min-width: 150px;
        }
        .selectbox-item--checkbox .selectbox-item__checkbox { 
            width: 18px; 
            height: 18px; 
            border: 1px solid #ccc; 
            display: inline-block; 
            margin-left: 8px; 
            vertical-align: middle;
        }
        .selectbox-item--checkbox.selected .selectbox-item__checkbox { 
            background: #007bff; 
            border-color: #007bff; 
            position: relative;
        }
        .selectbox-item--checkbox.selected .selectbox-item__checkbox::after {
            content: '✔';
            color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
        }
        .torrent-item { 
            margin-bottom: 15px; 
            padding: 10px; 
            border: 1px solid #444; 
            border-radius: 4px; 
        }
        .torrent-item__title { font-size: 16px; font-weight: bold; }
        .torrent-item a { color: #007bff; text-decoration: none; }
        .torrent-item a:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);

    console.log('[refine_filter.js] Плагин успешно инициализирован');
})();
