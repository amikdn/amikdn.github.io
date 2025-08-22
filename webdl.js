(function () {
    'use strict';

    // Ждем полной загрузки приложения Lampa
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            console.log('[refine_filter.js] Приложение готово, инициализация плагина');

            // Функция для настройки обработчика кнопки "Фильтр"
            function setupFilterButtonListener() {
                const filterButton = document.querySelector('.simple-button.simple-button--filter.filter--filter.selector');
                if (!filterButton) {
                    console.warn('[refine_filter.js] Кнопка "Фильтр" не найдена, повторная попытка...');
                    setTimeout(setupFilterButtonListener, 500);
                    return;
                }

                // Удаляем предыдущие обработчики, чтобы избежать дублирования
                filterButton.removeEventListener('click', handleFilterButtonClick);
                filterButton.addEventListener('click', handleFilterButtonClick);

                console.log('[refine_filter.js] Обработчик кнопки "Фильтр" установлен');
            }

            // Обработчик клика на кнопку "Фильтр"
            function handleFilterButtonClick() {
                console.log('[refine_filter.js] Кнопка "Фильтр" нажата, пытаемся заменить пункт "Трекер"');
                // Даем время на открытие панели фильтров
                setTimeout(replaceTrackerMenuItem, 100);
            }

            // Функция для замены пункта "Трекер" на "Качество"
            function replaceTrackerMenuItem(attempt = 0) {
                // Проверяем, активен ли раздел торрентов
                const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                       document.querySelector('.activity--active .torrent-list');
                if (!isTorrentsPage) {
                    console.log('[refine_filter.js] Раздел торрентов не активен, ждем 500 мс');
                    if (attempt < 5) {
                        setTimeout(() => replaceTrackerMenuItem(attempt + 1), 500);
                    }
                    return;
                }

                // Находим пункт "Трекер"
                const trackerItem = Array.from(document.querySelectorAll('.selectbox-item__title'))
                    .find(el => el.textContent.trim() === 'Трекер');
                if (!trackerItem) {
                    if (attempt < 5) {
                        console.warn('[refine_filter.js] Элемент "Трекер" не найден, попытка', attempt + 1);
                        setTimeout(() => replaceTrackerMenuItem(attempt + 1), 500);
                    } else {
                        console.error('[refine_filter.js] Элемент "Трекер" не найден после 5 попыток');
                    }
                    return;
                }

                // Заменяем текст "Трекер" на "Качество"
                trackerItem.textContent = 'Качество';
                trackerItem.dataset.refine = 'true'; // Метка для предотвращения повторной замены

                // Находим существующий контейнер подменю
                const trackerParent = trackerItem.closest('.selectbox-item.selector');
                let submenu = trackerParent.nextElementSibling;
                if (!submenu || !submenu.classList.contains('selectbox__content')) {
                    console.warn('[refine_filter.js] Подменю для "Трекер" не найдено, создаем новое');
                    submenu = document.createElement('div');
                    submenu.className = 'selectbox__content layer--height';
                    trackerParent.insertAdjacentElement('afterend', submenu);
                }

                // Заменяем содержимое подменю
                submenu.style.height = '945px';
                submenu.style.display = 'none';
                submenu.innerHTML = `
                    <div class="selectbox__head">
                        <div class="selectbox__title">Качество</div>
                    </div>
                    <div class="selectbox__body layer--wheight" style="max-height: unset; height: 899.109px;">
                        <div class="scroll scroll--mask scroll--over">
                            <div class="scroll__content">
                                <div class="scroll__body" style="transform: translate3d(0px, 0px, 0px);">
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Любое</div>
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

                // Находим контейнер selectbox animate
                const selectbox = trackerItem.closest('.selectbox.animate');
                if (selectbox) {
                    selectbox.querySelector('.selectbox__content').style.display = 'none';
                    submenu.style.display = 'block';
                }

                // Обработчик клика на "Качество"
                trackerParent.addEventListener('click', function () {
                    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                    if (selectbox) {
                        selectbox.querySelectorAll('.selectbox__content').forEach(content => {
                            if (content !== submenu) content.style.display = 'none';
                        });
                    }
                    console.log('[refine_filter.js] Подменю "Качество":', submenu.style.display);
                });

                // Обработчики для пунктов подменю
                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const value = item.dataset.value || item.querySelector('.selectbox-item__title').textContent.trim();
                        const subtitle = trackerParent.querySelector('.selectbox-item__subtitle');
                        subtitle.textContent = value === 'Любое' ? 'Любое' : value;

                        // Переключаем состояние чекбокса
                        if (value !== 'Любое') {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === value);
                            });
                        } else {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                        }

                        filterResultsByRefine(value === 'Любое' ? '' : value);
                        submenu.style.display = 'none';
                        console.log('[refine_filter.js] Выбран фильтр:', value);
                    });
                });

                console.log('[refine_filter.js] Пункт "Трекер" заменен на "Качество" с подменю');
            }

            // Запускаем обработчик кнопки "Фильтр"
            setupFilterButtonListener();

            // Отслеживание изменений в DOM
            const observer = new MutationObserver(() => {
                if (document.querySelector('.menu__item[data-action="mytorrents"].active') &&
                    !document.querySelector('.selectbox-item__title[data-refine="true"]') &&
                    document.querySelector('.simple-button--filter')) {
                    setupFilterButtonListener();
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

    console.log('[refine_filter.js] Плагин успешно инициализирован');
})();
