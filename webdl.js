(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.4',
        debug: false, // Отладка отключена
        settings: {
            enabled: true,
            quality_filter: 'any'
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
            const bitrate = (size * 8) / durationSeconds / 1000000;
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

    // Оптимизация Canvas
    function optimizeCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        return ctx;
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
                    if (TorrentQuality.debug) console.error(`[torrent_quality.js] Ошибка парсинга Lampa.Storage.get('${key}'):`, e);
                    data = [];
                }
            }
            if (Array.isArray(data) && data.length > 0) {
                if (TorrentQuality.debug) console.log(`[torrent_quality.js] Найдены данные в Lampa.Storage.get('${key}')`, data);
                results = data;
                break;
            }
        }

        // Проверяем Lampa.Torrents
        if (!results.length && Lampa.Torrents) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Torrents[key] && Array.isArray(Lampa.Torrents[key]) && Lampa.Torrents[key].length > 0) {
                    results = Lampa.Torrents[key];
                    if (TorrentQuality.debug) console.log(`[torrent_quality.js] Найдены данные в Lampa.Torrents.${key}:`, results);
                    break;
                }
            }
        }

        // Проверяем Lampa.Activity
        if (!results.length && Lampa.Activity?.active?.()?.data) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Activity.active().data[key] && Array.isArray(Lampa.Activity.active().data[key]) && Lampa.Activity.active().data[key].length > 0) {
                    results = Lampa.Activity.active().data[key];
                    if (TorrentQuality.debug) console.log(`[torrent_quality.js] Найдены данные в Lampa.Activity.active().data.${key}:`, results);
                    break;
                }
            }
        }

        // Проверяем DOM
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
                        subtitles: subtitles
                    };
                });
                if (TorrentQuality.debug) console.log('[torrent_quality.js] Извлечены данные из DOM:', results);
            }
        }

        return results;
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
            if (!isTorrentsPage) return;

            // Получаем данные торрентов
            let results = getTorrentsData();
            if (!results || !Array.isArray(results) || results.length === 0) {
                Lampa.Utils.message?.('Нет данных для фильтрации торрентов') || alert('Нет данных для фильтрации торрентов');
                return;
            }

            // Сбрасываем результаты перед новой фильтрацией
            let filteredResults = results;

            // Фильтруем результаты
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    const title = result.Title || result.title || result.Name || result.name || '';
                    if (!title || typeof title !== 'string') return false;
                    const titleLower = title.toLowerCase().replace(/[- ]/g, '');
                    if (filterLower === 'web-dl') {
                        return (titleLower.includes('webdl') || titleLower.includes('webdl')) && !titleLower.includes('webdlrip');
                    } else if (filterLower === 'web-dlrip') {
                        return titleLower.includes('webdlrip') || titleLower.includes('webdl rip');
                    } else if (filterLower === 'bdrip') {
                        return titleLower.includes('bdrip') || titleLower.includes('bd rip');
                    }
                    return false;
                });
            }

            if (filteredResults.length === 0) {
                Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}`) || alert(`Не найдено торрентов для фильтра: ${filterValue}`);
                return;
            }

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
            document.querySelector('.activity--active')?.appendChild(container);
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

            const item = document.createElement('div');
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
            container.appendChild(item);
        });
    }

    // Инициализация плагина
    function startPlugin() {
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Качество Торрентов',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>' +
                  '<path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79-4-4-4z" fill="currentColor"/>' +
                  '</svg>'
        });

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
                if (!(element instanceof HTMLElement)) return;

                var container = element.closest('.settings-param') || element.closest('.settings__content') || element.parentElement;
                if (!container) return;

                if (container.querySelector('.selectbox__content.torrent-quality-submenu')) return;

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

                container.appendChild(submenu);

                var title = container.querySelector('.settings-param__name') || element.querySelector('.settings-param__name') || element.querySelector('span') || element;
                if (title) {
                    title.addEventListener('click', function () {
                        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                        var settingsContent = container.closest('.settings__content') || document.querySelector('.settings__content');
                        if (settingsContent) {
                            settingsContent.querySelectorAll('.selectbox__content').forEach(content => {
                                if (content !== submenu) content.style.display = 'none';
                            });
                        }
                    });
                }

                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', function () {
                        var value = item.dataset.value || item.querySelector('.selectbox-item__title').textContent.trim();
                        value = value === 'Сброс' ? 'any' : value.toLowerCase();
                        var subtitle = container.querySelector('.settings-param__value') || element.querySelector('.settings-param__value');
                        if (subtitle) subtitle.textContent = value === 'any' ? 'Любое' : value.toUpperCase();

                        if (value !== 'any') {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === value);
                            });
                        } else {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                        }

                        TorrentQuality.settings.quality_filter = value;
                        Lampa.Storage.set('torrent_quality_filter', value);
                        filterTorrents(value);
                        submenu.style.display = 'none';
                    });
                });
            },
            onChange: function (value) {
                TorrentQuality.settings.quality_filter = value;
                Lampa.Storage.set('torrent_quality_filter', value);
                filterTorrents(value);
            }
        });

        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');

        function applyFilterOnTorrentsLoad() {
            if (TorrentQuality.settings.enabled) {
                filterTorrents(TorrentQuality.settings.quality_filter);
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'active' && (e.data?.action === 'mytorrents' || e.data?.action === 'torrents')) {
                applyFilterOnTorrentsLoad();
            }
        });

        Lampa.Listener.follow('torrents', function (e) {
            if (e.type === 'load' || e.type === 'update' || e.type === 'torrent_load' || e.type === 'torrent_update') {
                applyFilterOnTorrentsLoad();
            }
        });

        let retryCount = 0;
        const maxRetries = 5;
        function retryFilter() {
            if (retryCount < maxRetries) {
                applyFilterOnTorrentsLoad();
                retryCount++;
                setTimeout(retryFilter, 3000);
            }
        }
        setTimeout(retryFilter, 3000);

        if (window.appready) {
            applyFilterOnTorrentsLoad();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') applyFilterOnTorrentsLoad();
            });
        }

        // Инициализация Canvas
        optimizeCanvas();
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Качество Торрентов',
        version: '1.1.4',
        description: 'Фильтрация торрентов по качеству (WEB-DL, WEB-DLRip, BDRip) для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
