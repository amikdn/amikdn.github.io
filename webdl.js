(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.0.1',
        debug: true, // Включаем отладку для диагностики
        settings: {
            enabled: true,
            quality_filter: 'any' // По умолчанию "Любое"
        }
    };

    // Функция инициализации плагина
    function startPlugin() {
        // Добавляем компонент настроек
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Качество Торрентов',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>' +
                  '<path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79-4-4-4z" fill="currentColor"/>' +
                  '</svg>'
        });

        // Добавляем параметр "Качество Торрентов"
        Lampa.SettingsApi.addParam({
            component: 'torrent_quality',
            param: {
                name: 'quality_filter',
                type: 'select',
                values: {
                    any: 'Любое',
                    'web-dl': 'WEB-DL',
                    'web-dlrip': 'WEB-DLRip',
                    bdrip: 'BDRip'
                },
                default: 'any'
            },
            field: {
                name: 'Качество Торрентов',
                description: 'Выберите качество для фильтрации торрентов'
            },
            onRender: function (element) {
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] onRender вызван, element:', element);
                }

                // Проверяем, что element является DOM-элементом
                if (!(element instanceof HTMLElement)) {
                    console.error('[torrent_quality.js] element не является DOM-элементом:', element);
                    return;
                }

                // Находим контейнер настроек
                var container = element.closest('.settings-param') || element.closest('.settings__content');
                if (!container) {
                    console.error('[torrent_quality.js] Контейнер (.settings-param или .settings__content) не найден для element:', element);
                    // Пробуем альтернативный контейнер
                    container = document.querySelector('.settings__content') || element.parentElement;
                    if (!container) {
                        console.error('[torrent_quality.js] Альтернативный контейнер не найден, подменю не будет добавлено');
                        return;
                    }
                }
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Найден контейнер:', container);
                }

                // Проверяем, не добавлено ли уже подменю
                if (container.querySelector('.selectbox__content.torrent-quality-submenu')) {
                    if (TorrentQuality.debug) {
                        console.log('[torrent_quality.js] Подменю уже добавлено, пропускаем');
                    }
                    return;
                }

                // Создаем подменю
                var submenu = document.createElement('div');
                submenu.className = 'selectbox__content layer--height torrent-quality-submenu';
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
                                        <div class="selectbox-item__title">Сброс</div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dl">
                                        <div class="selectbox-item__title">WEB-DL</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dlrip">
                                        <div class="selectbox-item__title">WEB-DLRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="bdrip">
                                        <div class="selectbox-item__title">BDRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Вставляем подменю
                try {
                    container.appendChild(submenu);
                    if (TorrentQuality.debug) {
                        console.log('[torrent_quality.js] Подменю успешно добавлено в контейнер');
                    }
                } catch (e) {
                    console.error('[torrent_quality.js] Ошибка при добавлении подменю:', e);
                    return;
                }

                // Находим заголовок параметра
                var title = container.querySelector('.settings-param__name') || element.querySelector('.settings-param__name');
                if (!title) {
                    console.warn('[torrent_quality.js] Заголовок .settings-param__name не найден, пробуем альтернативный селектор');
                    title = element.querySelector('span') || element;
                }
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Найден заголовок:', title);
                }

                // Обработчик клика на заголовок параметра
                if (title) {
                    title.addEventListener('click', function () {
                        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                        // Скрываем другие подменю
                        var settingsContent = container.closest('.settings__content') || document.querySelector('.settings__content');
                        if (settingsContent) {
                            settingsContent.querySelectorAll('.selectbox__content').forEach(content => {
                                if (content !== submenu) content.style.display = 'none';
                            });
                        }
                        console.log('[torrent_quality.js] Подменю "Качество":', submenu.style.display);
                    });
                } else {
                    console.error('[torrent_quality.js] Не удалось найти заголовок для привязки события клика');
                }

                // Обработчики для пунктов подменю
                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', function () {
                        var value = item.dataset.value || item.querySelector('.selectbox-item__title').textContent.trim();
                        value = value === 'Сброс' ? 'any' : value.toLowerCase();
                        var subtitle = container.querySelector('.settings-param__value') || element.querySelector('.settings-param__value');
                        if (subtitle) {
                            subtitle.textContent = value === 'any' ? 'Любое' : value.toUpperCase();
                        } else {
                            console.warn('[torrent_quality.js] Не найден .settings-param__value для обновления текста');
                        }

                        // Переключаем состояние чекбокса
                        if (value !== 'any') {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === value);
                            });
                        } else {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                        }

                        // Сохраняем выбранное значение
                        TorrentQuality.settings.quality_filter = value;
                        Lampa.Storage.set('torrent_quality_filter', value);
                        filterTorrents(value);
                        submenu.style.display = 'none';
                        console.log('[torrent_quality.js] Выбран фильтр:', value);
                    });
                });
            },
            onChange: function (value) {
                TorrentQuality.settings.quality_filter = value;
                Lampa.Storage.set('torrent_quality_filter', value);
                filterTorrents(value);
                console.log('[torrent_quality.js] Изменено качество через настройки:', value);
            }
        });

        // Загружаем сохраненное значение
        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');

        // Применяем фильтр при загрузке
        if (TorrentQuality.settings.enabled && TorrentQuality.settings.quality_filter !== 'any') {
            filterTorrents(TorrentQuality.settings.quality_filter);
        }
    }

    // Функция фильтрации торрентов
    function filterTorrents(filterValue) {
        try {
            // Проверяем, активен ли раздел торрентов
            const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                   document.querySelector('.activity--active .torrent-list');
            if (!isTorrentsPage) {
                console.log('[torrent_quality.js] Фильтрация не выполняется: раздел торрентов не активен');
                return;
            }

            // Получаем данные из хранилища Lampa
            let results = Lampa.Storage.get('torrents_data', '[]');
            if (typeof results === 'string') {
                results = JSON.parse(results);
            }

            if (!results || !Array.isArray(results)) {
                console.error('[torrent_quality.js] Нет данных для фильтрации или данные некорректны');
                Lampa.Utils.message?.('Нет данных для фильтрации') || alert('Нет данных для фильтрации');
                return;
            }

            // Фильтруем результаты
            let filteredResults = results;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    const title = result.Title || '';
                    const titleLower = title.toLowerCase();
                    return (
                        (filterLower === 'web-dl' && titleLower.includes('web-dl')) ||
                        (filterLower === 'web-dlrip' && titleLower.includes('webdl-rip')) ||
                        (filterLower === 'bdrip' && titleLower.includes('bdrip'))
                    );
                });
            }

            console.log('[torrent_quality.js] Отфильтрованные результаты:', filteredResults);

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
                console.error('[torrent_quality.js] Метод Lampa.Torrents.render не найден');
                Lampa.Utils.message?.('Ошибка отображения результатов') || alert('Ошибка отображения результатов');
                renderResultsFallback(filteredResults);
            }
        } catch (error) {
            console.error('[torrent_quality.js] Ошибка при фильтрации:', error);
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

    // Ждем готовности приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Качество Торрентов',
        version: '1.0.1',
        description: 'Фильтрация торрентов по качеству (WEB-DL, WEB-DLRip, BDRip)'
    };
    window.torrent_quality = TorrentQuality;

})();
