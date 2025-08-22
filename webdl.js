(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.1',
        debug: true, // Включаем отладку
        settings: {
            enabled: true,
            quality_filter: 'any' // По умолчанию "Любое"
        }
    };

    // Функция форматирования даты
    function formatDate(dateString) {
        if (!dateString) return 'Неизвестно';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        } catch (e) {
            return 'Неизвестно';
        }
    }

    // Функция форматирования битрейта
    function formatBitrate(size, duration) {
        if (!size || !duration) return 'Неизвестно';
        try {
            const durationSeconds = parseDuration(duration);
            if (!durationSeconds) return 'Неизвестно';
            const bitrate = (size * 8) / durationSeconds / 1000000; // Мбит/с
            return `${bitrate.toFixed(2)} Мбит/с`;
        } catch (e) {
            return 'Неизвестно';
        }
    }

    // Функция парсинга длительности
    function parseDuration(duration) {
        if (!duration) return 0;
        const parts = duration.split(':');
        if (parts.length < 3) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }

    // Функция получения данных торрентов
    function getTorrentsData() {
        let results = [];
        const possibleKeys = ['torrents_data', 'torrent_data', 'results', 'torrent_results', 'torrents'];

        // Проверяем Lampa.Storage
        for (const key of possibleKeys) {
            let data = Lampa.Storage.get(key, '[]');
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error(`[torrent_quality.js] Ошибка парсинга ${key}:`, e);
                    data = [];
                }
            }
            if (Array.isArray(data) && data.length > 0) {
                if (TorrentQuality.debug) {
                    console.log(`[torrent_quality.js] Найдены данные в Lampa.Storage.get('${key}')`, data);
                }
                results = data;
                break;
            }
        }

        // Проверяем Lampa.Torrents
        if (!results.length && Lampa.Torrents) {
            const possibleTorrentsKeys = ['data', 'results', 'items', 'list'];
            for (const key of possibleTorrentsKeys) {
                if (Lampa.Torrents[key] && Array.isArray(Lampa.Torrents[key]) && Lampa.Torrents[key].length > 0) {
                    results = Lampa.Torrents[key];
                    if (TorrentQuality.debug) {
                        console.log(`[torrent_quality.js] Найдены данные в Lampa.Torrents.${key}:`, results);
                    }
                    break;
                }
            }
        }

        // Проверяем Lampa.Activity
        if (!results.length && Lampa.Activity?.active?.()?.data) {
            const possibleActivityKeys = ['torrents', 'results', 'items', 'list'];
            for (const key of possibleActivityKeys) {
                if (Lampa.Activity.active().data[key] && Array.isArray(Lampa.Activity.active().data[key]) && Lampa.Activity.active().data[key].length > 0) {
                    results = Lampa.Activity.active().data[key];
                    if (TorrentQuality.debug) {
                        console.log(`[torrent_quality.js] Найдены данные в Lampa.Activity.active().data.${key}:`, results);
                    }
                    break;
                }
            }
        }

        // Дополнительная отладка: выводим все доступные ключи и объекты
        if (TorrentQuality.debug) {
            console.log('[torrent_quality.js] Все ключи Lampa.Storage.cache:', Object.keys(Lampa.Storage.cache || {}));
            console.log('[torrent_quality.js] Lampa.Torrents:', Lampa.Torrents);
            console.log('[torrent_quality.js] Lampa.Activity.active():', Lampa.Activity?.active?.());
        }

        return results;
    }

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
                var container = element.closest('.settings-param') || element.closest('.settings__content') || element.parentElement;
                if (!container) {
                    console.error('[torrent_quality.js] Контейнер (.settings-param, .settings__content или parentElement) не найден для element:', element);
                    return;
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
                var title = container.querySelector('.settings-param__name') || element.querySelector('.settings-param__name') || element.querySelector('span') || element;
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

        // Применяем фильтр при загрузке или изменении активности
        function applyFilterOnTorrentsLoad() {
            if (TorrentQuality.settings.enabled) {
                filterTorrents(TorrentQuality.settings.quality_filter);
            }
        }

        // Проверяем, активен ли раздел торрентов
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'active' && e.data?.action === 'mytorrents') {
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Раздел "Торренты" активирован');
                }
                applyFilterOnTorrentsLoad();
            }
        });

        // Ждем загрузки данных торрентов
        Lampa.Listener.follow('torrents', function (e) {
            if (e.type === 'load' || e.type === 'update') {
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Событие загрузки торрентов:', e);
                }
                applyFilterOnTorrentsLoad();
            }
        });

        // Дополнительно: таймер для проверки данных, если события не срабатывают
        setTimeout(() => {
            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Проверка данных через таймер');
            }
            applyFilterOnTorrentsLoad();
        }, 5000);

        // Инициализация при старте
        if (window.appready) {
            applyFilterOnTorrentsLoad();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    applyFilterOnTorrentsLoad();
                }
            });
        }
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        try {
            // Проверяем, активен ли раздел торрентов
            const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                   document.querySelector('.activity--active .torrent-list') ||
                                   Lampa.Activity?.active?.()?.data?.action === 'mytorrents';
            if (!isTorrentsPage) {
                console.log('[torrent_quality.js] Фильтрация не выполняется: раздел торрентов не активен');
                return;
            }

            // Получаем данные торрентов
            let results = getTorrentsData();

            // Проверяем, есть ли данные
            if (!results || !Array.isArray(results) || results.length === 0) {
                console.warn('[torrent_quality.js] Данные торрентов отсутствуют:', results);
                Lampa.Utils.message?.('Нет данных для фильтрации торрентов. Проверьте настройки Lampa или загрузку торрентов.') ||
                    alert('Нет данных для фильтрации торрентов. Проверьте настройки Lampa или загрузку торрентов.');
                return;
            }

            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Исходные данные торрентов:', results);
                // Проверяем наличие поля Title или альтернативных полей
                results.forEach((item, index) => {
                    console.log(`[torrent_quality.js] Элемент ${index}:`, {
                        Title: item.Title,
                        title: item.title,
                        Name: item.Name,
                        name: item.name,
                        HasTitle: !!item.Title || !!item.title || !!item.Name || !!item.name,
                        TitleType: typeof (item.Title || item.title || item.Name || item.name),
                        PublishDate: item.PublishDate,
                        Tracker: item.Tracker,
                        Size: item.Size,
                        Seeders: item.Seeders,
                        Peers: item.Peers
                    });
                });
            }

            // Фильтруем результаты
            let filteredResults = results;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    // Проверяем возможные поля для заголовка
                    const title = result.Title || result.title || result.Name || result.name || '';
                    if (!title || typeof title !== 'string') {
                        console.warn('[torrent_quality.js] Пропущен элемент без заголовка или с некорректным заголовком:', result);
                        return false;
                    }
                    const titleLower = title.toLowerCase().replace(/[- ]/g, ''); // Удаляем дефисы и пробелы
                    // Учитываем все возможные вариации написания
                    return (
                        (filterLower === 'web-dl' && (titleLower.includes('webdl') || titleLower.includes('web dl'))) ||
                        (filterLower === 'web-dlrip' && (titleLower.includes('webdlrip') || titleLower.includes('web dlrip') || titleLower.includes('webdl rip'))) ||
                        (filterLower === 'bdrip' && (titleLower.includes('bdrip') || titleLower.includes('bd rip')))
                    );
                });
            }

            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Отфильтрованные результаты:', filteredResults);
                console.log('[torrent_quality.js] Количество отфильтрованных результатов:', filteredResults.length);
            }

            if (filteredResults.length === 0) {
                console.warn('[torrent_quality.js] Не найдено торрентов для фильтра:', filterValue);
                console.log('[torrent_quality.js] Проверьте, содержат ли элементы торрентов поле Title с ожидаемыми значениями (WEB-DL, WEB-DLRip, BDRip)');
                Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}. Проверьте данные торрентов или сбросьте другие фильтры.`) ||
                    alert(`Не найдено торрентов для фильтра: ${filterValue}. Проверьте данные торрентов или сбросьте другие фильтры.`);
                return;
            }

            // Отображаем результаты
            renderResultsFallback(filteredResults);
            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Результаты отрендерены через renderResultsFallback:', filteredResults.length);
            }
        } catch (error) {
            console.error('[torrent_quality.js] Ошибка при фильтрации:', error);
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
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
            const title = result.Title || result.title || result.Name || result.name || 'Без названия';
            const resolution = result.ffprobe?.find(f => f.codec_type === 'video')?.width && result.ffprobe?.find(f => f.codec_type === 'video')?.height
                ? `${result.ffprobe.find(f => f.codec_type === 'video').width}x${result.ffprobe.find(f => f.codec_type === 'video').height}`
                : 'Неизвестно';
            const audio = result.ffprobe?.find(f => f.codec_type === 'audio')?.channel_layout || 'Неизвестно';
            const trackers = result.Tracker || 'Неизвестно';
            const publishDate = formatDate(result.PublishDate);
            const sizeName = result.info?.sizeName || (result.Size ? (result.Size / 1024 / 1024 / 1024).toFixed(2) + ' ГБ' : 'Неизвестно');
            const bitrate = result.ffprobe?.find(f => f.codec_type === 'video')?.bit_rate && result.ffprobe?.find(f => f.codec_type === 'audio')?.duration
                ? formatBitrate(result.Size, result.ffprobe.find(f => f.codec_type === 'audio').duration)
                : 'Неизвестно';
            const voices = result.languages?.join(', ') || result.info?.voices?.join(', ') || 'Неизвестно';

            const item = document.createElement('div');
            item.className = 'torrent-item';
            item.innerHTML = `
                <div class="torrent-item__title">${title}</div>
                <div class="torrent-item__ffprobe">
                    <div class="m-video">${resolution}</div>
                    <div class="m-audio">${audio}</div>
                    <div class="m-voices">${voices}</div>
                </div>
                <div>${publishDate}</div>
                <div>${trackers}</div>
                <div>Битрейт: ${bitrate}</div>
                <div>Раздают: ${result.Seeders || 0}</div>
                <div>Качают: ${result.Peers || 0}</div>
                <div>${sizeName}</div>
                ${result.MagnetUri ? `<a href="${result.MagnetUri}" target="_blank">Скачать</a>` : ''}
            `;
            container.appendChild(item);
        });

        if (TorrentQuality.debug) {
            console.log('[torrent_quality.js] Результаты отрендерены через renderResultsFallback:', results.length);
        }
    }

    // Инициализация плагина
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
        version: '1.1.1',
        description: 'Фильтрация торрентов по качеству (WEB-DL, WEB-DLRip, BDRip) для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;

})();
