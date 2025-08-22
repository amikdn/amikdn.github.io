(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.6', // Увеличиваем версию
        debug: false, // Отладка отключена
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
        const possibleStorageKeys = ['torrents_data', 'torrent_data', 'results', 'torrent_results', 'torrents', 'torrent_list'];
        const possibleObjectKeys = ['data', 'results', 'items', 'list', 'torrents'];

        // Проверяем Lampa.Storage
        for (const key of possibleStorageKeys) {
            let data = Lampa.Storage.get(key, '[]');
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    data = [];
                }
            }
            if (Array.isArray(data) && data.length > 0) {
                results = data;
                break;
            }
        }

        // Проверяем Lampa.Torrents
        if (!results.length && Lampa.Torrents) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Torrents[key] && Array.isArray(Lampa.Torrents[key]) && Lampa.Torrents[key].length > 0) {
                    results = Lampa.Torrents[key];
                    break;
                }
            }
        }

        // Проверяем Lampa.Activity
        if (!results.length && Lampa.Activity?.active?.()?.data) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Activity.active().data[key] && Array.isArray(Lampa.Activity.active().data[key]) && Lampa.Activity.active().data[key].length > 0) {
                    results = Lampa.Activity.active().data[key];
                    break;
                }
            }
        }

        // Дополнительная проверка DOM для извлечения данных
        if (!results.length) {
            const torrentItems = document.querySelectorAll('.torrent-item');
            if (torrentItems.length > 0) {
                results = Array.from(torrentItems).map(item => {
                    const title = item.querySelector('.torrent-item__title')?.textContent || 'Без названия';
                    const ffprobe = {
                        video: {
                            width: parseInt(item.querySelector('.m-video')?.textContent?.split('x')[0]) || 0,
                            height: parseInt(item.querySelector('.m-video')?.textContent?.split('x')[1]) || 0
                        },
                        audio: {
                            channel_layout: item.querySelector('.m-channels')?.textContent || 'Неизвестно'
                        }
                    };
                    const voices = Array.from(item.querySelectorAll('.m-audio')).map(el => el.textContent);
                    const subtitles = Array.from(item.querySelectorAll('.m-subtitle')).map(el => el.textContent);
                    return {
                        Title: title,
                        PublishDate: item.querySelector('.torrent-item__date')?.textContent,
                        Tracker: item.querySelector('.torrent-item__tracker')?.textContent,
                        Size: parseFloat(item.querySelector('.torrent-item__size')?.textContent) * 1024 * 1024 * 1024 || 0,
                        Seeders: parseInt(item.querySelector('.torrent-item__seeds span')?.textContent) || 0,
                        Peers: parseInt(item.querySelector('.torrent-item__grabs span')?.textContent) || 0,
                        ffprobe: ffprobe,
                        languages: voices,
                        subtitles: subtitles,
                        element: item // Сохраняем DOM-элемент
                    };
                });
            }
        }

        return results;
    }

    // Функция оптимизации canvas
    function optimizeCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        return ctx;
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        try {
            // Проверяем, активен ли раздел торрентов
            const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                   document.querySelector('.menu__item[data-action="torrents"].active') ||
                                   document.querySelector('.activity--active .torrent-list') ||
                                   Lampa.Activity?.active?.()?.data?.action === 'mytorrents' ||
                                   Lampa.Activity?.active?.()?.data?.action === 'torrents';
            if (!isTorrentsPage) {
                return;
            }

            // Получаем данные торрентов
            let results = getTorrentsData();

            // Проверяем, есть ли данные
            if (!results || !Array.isArray(results) || results.length === 0) {
                Lampa.Utils.message?.('Нет данных для фильтрации торрентов.') || alert('Нет данных для фильтрации торрентов.');
                return;
            }

            // Сбрасываем фильтрацию и фильтруем результаты
            let filteredResults = results;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    const title = result.Title || result.title || result.Name || result.name || '';
                    if (!title || typeof title !== 'string') {
                        return false;
                    }
                    const titleLower = title.toLowerCase().replace(/[- ]/g, '');
                    return (
                        (filterLower === 'web-dl' && (titleLower.includes('webdl') && !titleLower.includes('webdlrip'))) ||
                        (filterLower === 'web-dlrip' && (titleLower.includes('webdlrip') || titleLower.includes('webdl rip'))) ||
                        (filterLower === 'bdrip' && (titleLower.includes('bdrip') || titleLower.includes('bd rip')))
                    );
                });
            }

            if (filteredResults.length === 0) {
                Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}.`) || alert(`Не найдено торрентов для фильтра: ${filterValue}.`);
                return;
            }

            // Отображаем результаты
            renderResultsFallback(filteredResults);
        } catch (error) {
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
        }
    }

    // Функция рендеринга
    function renderResultsFallback(results) {
        const container = document.querySelector('.torrent-list') || document.createElement('div');
        if (!container.classList.contains('torrent-list')) {
            container.className = 'torrent-list';
            const activityContainer = document.querySelector('.activity--active');
            if (activityContainer) {
                activityContainer.appendChild(container);
            } else {
                return; // Прерываем, если нет активного контейнера
            }
        }

        container.innerHTML = '';

        results.forEach(result => {
            const title = result.Title || result.title || result.Name || result.name || 'Без названия';
            const resolution = result.ffprobe?.video?.width && result.ffprobe?.video?.height
                ? `${result.ffprobe.video.width}x${result.ffprobe.video.height}`
                : 'Неизвестно';
            const audio = result.ffprobe?.audio?.channel_layout || 'Неизвестно';
            const trackers = result.Tracker || 'Неизвестно';
            const publishDate = formatDate(result.PublishDate);
            const sizeName = result.Size ? (result.Size / 1024 / 1024 / 1024).toFixed(2) + ' ГБ' : 'Неизвестно';
            const bitrate = result.ffprobe?.video?.bit_rate && result.ffprobe?.audio?.duration
                ? formatBitrate(result.Size, result.ffprobe.audio.duration)
                : 'Неизвестно';
            const voices = result.languages?.join(', ') || result.info?.voices?.join(', ') || 'Неизвестно';
            const subtitles = result.subtitles?.join(', ') || 'Неизвестно';

            const item = result.element || document.createElement('div');
            if (!result.element) {
                item.className = 'torrent-item selector layer--visible layer--render';
                item.innerHTML = `
                    <div class="torrent-item__title">${title}</div>
                    <div class="torrent-item__ffprobe">
                        <div class="m-video">${resolution}</div>
                        <div class="m-channels">${audio}</div>
                        ${result.languages ? result.languages.map(v => `<div class="m-audio">${v}</div>`).join('') : `<div class="m-audio">${voices}</div>`}
                        ${result.subtitles ? result.subtitles.map(s => `<div class="m-subtitle">${s}</div>`).join('') : `<div class="m-subtitle">${subtitles}</div>`}
                    </div>
                    <div class="torrent-item__details">
                        <div class="torrent-item__date">${publishDate}</div>
                        <div class="torrent-item__tracker">${trackers}</div>
                        <div class="torrent-item__seeds">Раздают: <span>${result.Seeders || 0}</span></div>
                        <div class="torrent-item__grabs">Качают: <span>${result.Peers || 0}</span></div>
                        <div class="torrent-item__size">${sizeName}</div>
                    </div>
                    ${result.MagnetUri ? `<a href="${result.MagnetUri}" target="_blank">Скачать</a>` : ''}
                `;
            }
            container.appendChild(item);
        });
    }

    // Функция инициализации плагина
    function startPlugin() {
        // Добавляем компонент настроек
        try {
            Lampa.SettingsApi.addComponent({
                component: 'torrent_quality',
                name: 'Качество Торрентов',
                icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>' +
                      '<path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79-4-4-4z" fill="currentColor"/>' +
                      '</svg>'
            });
        } catch (e) {
            return; // Прерываем, если не удалось добавить компонент
        }

        // Добавляем параметр "Качество Торрентов"
        try {
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
                    // Проверяем, является ли element корректным
                    try {
                        const nativeElement = element instanceof jQuery ? element.get(0) : element;
                        if (!nativeElement || !(nativeElement instanceof HTMLElement)) {
                            return; // Прерываем, если элемент некорректен
                        }

                        // Находим контейнер настроек
                        const container = nativeElement.closest('.settings-param') || nativeElement.closest('.settings__content') || nativeElement.parentElement;
                        if (!container || !(container instanceof HTMLElement)) {
                            return; // Прерываем, если контейнер не найден
                        }

                        // Проверяем, не добавлено ли уже подменю
                        if (container.querySelector('.selectbox__content.torrent-quality-submenu')) {
                            return;
                        }

                        // Создаем подменю
                        const submenu = document.createElement('div');
                        submenu.className = 'selectbox__content layer--height torrent-quality-submenu';
                        submenu.style.display = 'none';
                        submenu.innerHTML = `
                            <div class="selectbox__head">
                                <div class="selectbox__title">Качество</div>
                            </div>
                            <div class="selectbox__body">
                                <div class="scroll">
                                    <div class="scroll__content">
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
                        `;

                        // Вставляем подменю
                        container.appendChild(submenu);

                        // Находим заголовок параметра
                        const title = container.querySelector('.settings-param__name') || nativeElement.querySelector('.settings-param__name') || nativeElement.querySelector('span') || nativeElement;
                        if (!(title instanceof HTMLElement)) {
                            return;
                        }

                        // Обработчик клика на заголовок параметра
                        title.addEventListener('click', function () {
                            submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                            const settingsContent = container.closest('.settings__content') || document.querySelector('.settings__content');
                            if (settingsContent) {
                                settingsContent.querySelectorAll('.selectbox__content').forEach(content => {
                                    if (content !== submenu) content.style.display = 'none';
                                });
                            }
                        });

                        // Обработчики для пунктов подменю
                        submenu.querySelectorAll('.selectbox-item').forEach(item => {
                            item.addEventListener('click', function () {
                                const value = item.dataset.value || item.querySelector('.selectbox-item__title')?.textContent?.trim() || 'any';
                                const normalizedValue = value === 'Сброс' ? 'any' : value.toLowerCase();
                                const subtitle = container.querySelector('.settings-param__value') || nativeElement.querySelector('.settings-param__value');
                                if (subtitle) {
                                    subtitle.textContent = normalizedValue === 'any' ? 'Любое' : normalizedValue.toUpperCase();
                                }

                                // Переключаем состояние чекбокса
                                if (normalizedValue !== 'any') {
                                    submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                        el.classList.toggle('selected', el.dataset.value === normalizedValue);
                                    });
                                } else {
                                    submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                        el.classList.remove('selected');
                                    });
                                }

                                // Сохраняем выбранное значение
                                TorrentQuality.settings.quality_filter = normalizedValue;
                                Lampa.Storage.set('torrent_quality_filter', normalizedValue);
                                filterTorrents(normalizedValue);
                                submenu.style.display = 'none';
                            });
                        });
                    } catch (e) {
                        // Прерываем, если произошла ошибка
                        return;
                    }
                },
                onChange: function (value) {
                    try {
                        if (!value || typeof value !== 'string') return; // Пропускаем некорректные значения
                        TorrentQuality.settings.quality_filter = value;
                        Lampa.Storage.set('torrent_quality_filter', value);
                        filterTorrents(value);
                    } catch (e) {
                        return;
                    }
                }
            });
        } catch (e) {
            return; // Прерываем, если не удалось добавить параметр
        }

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
            if (e.type === 'active' && (e.data?.action === 'mytorrents' || e.data?.action === 'torrents')) {
                applyFilterOnTorrentsLoad();
            }
        });

        // Ждем загрузки данных торрентов
        Lampa.Listener.follow('torrents', function (e) {
            if (e.type === 'load' || e.type === 'update' || e.type === 'torrent_load' || e.type === 'torrent_update') {
                applyFilterOnTorrentsLoad();
            }
        });

        // Обрабатываем событие парсинга торрентов
        Lampa.Listener.follow('torrent_parser', function (e) {
            if (e.type === 'parse' || e.type === 'parsed') {
                applyFilterOnTorrentsLoad();
            }
        });

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

    // Инициализация плагина
    try {
        if (window.appready) {
            startPlugin();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') startPlugin();
            });
        }
    } catch (e) {
        return; // Прерываем, если не удалось инициализировать плагин
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Качество Торрентов',
        version: '1.1.6',
        description: 'Фильтрация торрентов по качеству (WEB-DL, WEB-DLRip, BDRip) для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;
})();
