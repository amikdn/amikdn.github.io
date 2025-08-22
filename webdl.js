(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.15',
        debug: true, // Оставлено true для отладки
        settings: {
            enabled: true,
            quality_filter: 'any'
        }
    };

    // Хранилище полного списка торрентов
    let originalTorrents = [];
    let allTorrents = [];

    // Функция форматирования даты
    function formatDate(dateString, context) {
        if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
            if (TorrentQuality.debug) console.log(`[torrent_quality.js] Неверная или пустая дата: ${dateString}`);
            return 'Неизвестно';
        }

        // Словарь для русских месяцев
        const monthMap = {
            'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
            'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };

        // Проверяем формат "ДД ММММ" (например, "17 Августа")
        const match = dateString.match(/^(\d{1,2})\s+([а-яё]+)$/i);
        if (match) {
            const day = parseInt(match[1], 10);
            const monthName = match[2].toLowerCase();
            const month = monthMap[monthName];
            if (month !== undefined && day >= 1 && day <= 31) {
                // Пытаемся извлечь год из context или Lampa.Activity.active().movie
                let year = new Date().getFullYear() - 1; // Запасной год: 2024
                if (context && context.Title) {
                    const yearMatch = context.Title.match(/(\((\d{4})\)|\[(\d{4})\]|Год:\s*(\d{4})|(\d{4}))/i);
                    if (yearMatch) {
                        const foundYear = yearMatch[2] || yearMatch[3] || yearMatch[4] || yearMatch[5];
                        if (foundYear && parseInt(foundYear, 10) >= 1900 && parseInt(foundYear, 10) <= new Date().getFullYear()) {
                            year = parseInt(foundYear, 10);
                            if (TorrentQuality.debug) console.log(`[torrent_quality.js] Извлечён год ${year} из Title: ${context.Title}`);
                        }
                    }
                }
                // Проверяем Lampa.Activity.active().movie, если год не найден
                if (year === new Date().getFullYear() - 1 && Lampa.Activity?.active?.()?.movie?.year) {
                    const movieYear = parseInt(Lampa.Activity.active().movie.year, 10);
                    if (movieYear >= 1900 && movieYear <= new Date().getFullYear()) {
                        year = movieYear;
                        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Извлечён год ${year} из Lampa.Activity.active().movie.year`);
                    }
                }
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            }
            if (TorrentQuality.debug) console.log(`[torrent_quality.js] Не удалось распознать дату: ${dateString}, context:`, context);
            return 'Неизвестно';
        }

        // Пробуем стандартный формат даты
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                if (TorrentQuality.debug) console.log(`[torrent_quality.js] Неверный формат даты: ${dateString}`);
                return 'Неизвестно';
            }
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            if (TorrentQuality.debug) console.error(`[torrent_quality.js] Ошибка парсинга даты "${dateString}":`, e);
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

    // Функция получения данных торрентов из Lampa
    function getTorrentsData() {
        let results = [];
        const possibleObjectKeys = ['data', 'results', 'items', 'list', 'torrents'];

        // Проверяем Lampa.Torrents
        if (Lampa.Torrents) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Torrents[key] && Array.isArray(Lampa.Torrents[key]) && Lampa.Torrents[key].length > 0) {
                    results = Lampa.Torrents[key].map(torrent => ({
                        Title: torrent.title || torrent.name || torrent.Title || torrent.Name || 'Без названия',
                        PublishDate: torrent.date || torrent.publish_date || torrent.PublishDate,
                        Tracker: torrent.tracker || torrent.Tracker,
                        Size: torrent.size || torrent.Size || 0,
                        Seeders: torrent.seeders || torrent.Seeders || 0,
                        Peers: torrent.peers || torrent.Peers || 0,
                        ffprobe: torrent.ffprobe || {
                            video: { width: 0, height: 0 },
                            audio: { channel_layout: 'Неизвестно' }
                        },
                        languages: torrent.languages || torrent.voices || [],
                        subtitles: torrent.subtitles || [],
                        MagnetUri: torrent.magnet || torrent.MagnetUri
                    }));
                    if (TorrentQuality.debug) console.log(`[torrent_quality.js] Найдены данные в Lampa.Torrents.${key}: ${results.length} элементов`, results);
                    break;
                }
            }
        }

        // Проверяем Lampa.Activity
        if (!results.length && Lampa.Activity?.active?.()?.data) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Activity.active().data[key] && Array.isArray(Lampa.Activity.active().data[key]) && Lampa.Activity.active().data[key].length > 0) {
                    results = Lampa.Activity.active().data[key].map(torrent => ({
                        Title: torrent.title || torrent.name || torrent.Title || torrent.Name || 'Без названия',
                        PublishDate: torrent.date || torrent.publish_date || torrent.PublishDate,
                        Tracker: torrent.tracker || torrent.Tracker,
                        Size: torrent.size || torrent.Size || 0,
                        Seeders: torrent.seeders || torrent.Seeders || 0,
                        Peers: torrent.peers || torrent.Peers || 0,
                        ffprobe: torrent.ffprobe || {
                            video: { width: 0, height: 0 },
                            audio: { channel_layout: 'Неизвестно' }
                        },
                        languages: torrent.languages || torrent.voices || [],
                        subtitles: torrent.subtitles || [],
                        MagnetUri: torrent.magnet || torrent.MagnetUri
                    }));
                    if (TorrentQuality.debug) console.log(`[torrent_quality.js] Найдены данные в Lampa.Activity.active().data.${key}: ${results.length} элементов`, results);
                    break;
                }
            }
        }

        // Запасной вариант: проверяем DOM
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
                        MagnetUri: item.querySelector('a[href*="magnet:"]')?.href
                    };
                });
                if (TorrentQuality.debug) console.log(`[torrent_quality.js] Извлечены данные из DOM: ${results.length} элементов`, results);
            }
        }

        if (TorrentQuality.debug && results.length === 0) {
            console.warn('[torrent_quality.js] Данные торрентов не найдены ни в одном источнике');
            console.log('[torrent_quality.js] Lampa.Torrents:', Lampa.Torrents);
            console.log('[torrent_quality.js] Lampa.Activity.active():', Lampa.Activity?.active?.());
        }

        return results;
    }

    // Функция сброса фильтра
    function resetFilter() {
        allTorrents = [...originalTorrents];
        if (!allTorrents || !Array.isArray(allTorrents) || allTorrents.length === 0) {
            allTorrents = getTorrentsData();
            originalTorrents = [...allTorrents];
            if (!allTorrents || allTorrents.length === 0) {
                if (TorrentQuality.debug) console.warn('[torrent_quality.js] resetFilter: Данные торрентов пусты');
                return false;
            }
        }
        TorrentQuality.settings.quality_filter = 'any';
        Lampa.Storage.set('torrent_quality_filter', 'any');
        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Фильтр сброшен, allTorrents: ${allTorrents.length}`);
        return true;
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        try {
            // Инициализируем originalTorrents, если пусто
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
                if (!originalTorrents.length) {
                    if (TorrentQuality.debug) console.warn('[torrent_quality.js] originalTorrents пуст при фильтрации');
                    return;
                }
            }

            // Сбрасываем фильтр, если он не "any"
            if (filterValue !== 'any') {
                resetFilter();
            }

            if (!allTorrents || allTorrents.length === 0) {
                resetFilter();
                if (!allTorrents || allTorrents.length === 0) {
                    if (TorrentQuality.debug) console.warn('[torrent_quality.js] allTorrents пуст после сброса');
                    return;
                }
            }

            // Фильтруем результаты
            let filteredResults = allTorrents;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = allTorrents.filter(result => {
                    const title = result.Title || result.title || result.Name || result.name || '';
                    if (!title || typeof title !== 'string') {
                        if (TorrentQuality.debug) console.warn('[torrent_quality.js] Пропущен элемент без корректного заголовка:', result);
                        return false;
                    }
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
                if (TorrentQuality.debug) console.warn(`[torrent_quality.js] Фильтр ${filterValue} не нашел результатов`);
                return;
            }

            renderResults(filteredResults);
            if (TorrentQuality.debug) console.log(`[torrent_quality.js] Отфильтровано ${filteredResults.length} торрентов для ${filterValue}`);
        } catch (error) {
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
            if (TorrentQuality.debug) console.error('[torrent_quality.js] Ошибка при фильтрации:', error);
        }
    }

    // Функция рендеринга (скрытие/показ элементов вместо переписывания DOM)
    function renderResults(results) {
        const torrentItems = document.querySelectorAll('.torrent-item');
        if (!torrentItems.length) {
            if (TorrentQuality.debug) console.warn('[torrent_quality.js] Не найдено элементов .torrent-item для рендеринга');
            return renderResultsFallback(results); // Запасной рендеринг, если DOM пуст
        }

        const resultTitles = results.map(r => r.Title.toLowerCase());
        torrentItems.forEach(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.toLowerCase() || '';
            item.style.display = resultTitles.includes(title) ? 'block' : 'none';
        });

        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Отрендерено ${results.length} торрентов`);
    }

    // Запасная функция рендеринга (если DOM пуст)
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
            const publishDate = formatDate(result.PublishDate, result);
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

        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Отрендерено (fallback) ${results.length} торрентов`);
    }

    // Инициализация плагина
    function startPlugin() {
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Фильтр',
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
                name: 'Фильтр',
                description: 'Выберите параметры для фильтрации торрентов'
            },
            onRender: function (element) {
                if (!(element instanceof HTMLElement)) return;

                var container = element.closest('.settings-param') || element.closest('.settings__content') || element.parentElement;
                if (!container) return;

                if (container.querySelector('.selectbox__content')) return;

                var submenu = document.createElement('div');
                submenu.className = 'selectbox__content layer--height';
                submenu.style.height = '945px';
                submenu.style.display = 'none';
                submenu.innerHTML = `
                    <div class="selectbox__head">
                        <div class="selectbox__title">Фильтр</div>
                    </div>
                    <div class="selectbox__body layer--wheight" style="max-height: unset; height: 894.016px;">
                        <div class="scroll scroll--mask scroll--over">
                            <div class="scroll__content">
                                <div class="scroll__body" style="transform: translate3d(0px, 0px, 0px);">
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Сбросить фильтр</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Качество</div>
                                        <div class="selectbox-item__subtitle">Любое</div>
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
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">HDR</div>
                                        <div class="selectbox-item__subtitle">Не выбрано</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Dolby Vision</div>
                                        <div class="selectbox-item__subtitle">Не выбрано</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Субтитры</div>
                                        <div class="selectbox-item__subtitle">Не выбрано</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Перевод</div>
                                        <div class="selectbox-item__subtitle">Любой</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Язык</div>
                                        <div class="selectbox-item__subtitle">Любой</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Сезон</div>
                                        <div class="selectbox-item__subtitle">Любой</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Трекер</div>
                                        <div class="selectbox-item__subtitle">Любой</div>
                                    </div>
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Год</div>
                                        <div class="selectbox-item__subtitle">Любой</div>
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
                        const titleText = item.querySelector('.selectbox-item__title').textContent.trim();
                        let value = item.dataset.value || titleText;
                        let subtitle = item.querySelector('.selectbox-item__subtitle');

                        if (titleText === 'Сбросить фильтр') {
                            resetFilter();
                            if (subtitle) subtitle.textContent = 'Любое';
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                            submenu.querySelectorAll('.selectbox-item__subtitle').forEach(sub => {
                                const parentTitle = sub.parentElement.querySelector('.selectbox-item__title').textContent;
                                sub.textContent = parentTitle === 'Качество' || parentTitle === 'Перевод' || parentTitle === 'Язык' || parentTitle === 'Сезон' || parentTitle === 'Трекер' || parentTitle === 'Год' ? 'Любой' : 'Не выбрано';
                            });
                            filterTorrents('any');
                        } else if (titleText === 'Качество') {
                            value = 'any';
                            if (subtitle) subtitle.textContent = 'Любое';
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                            TorrentQuality.settings.quality_filter = value;
                            Lampa.Storage.set('torrent_quality_filter', value);
                            filterTorrents(value);
                        } else if (item.dataset.value) {
                            value = item.dataset.value.toLowerCase();
                            if (subtitle) subtitle.textContent = value.toUpperCase();
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === value);
                            });
                            TorrentQuality.settings.quality_filter = value;
                            Lampa.Storage.set('torrent_quality_filter', value);
                            filterTorrents(value);
                        }

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
                resetFilter();
                filterTorrents(TorrentQuality.settings.quality_filter);
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'active' && (e.data?.action === 'mytorrents' || e.data?.action === 'torrents' || e.data?.component === 'torrents')) {
                if (TorrentQuality.debug) console.log('[torrent_quality.js] Активирован раздел торрентов:', e);
                applyFilterOnTorrentsLoad();
            }
        });

        Lampa.Listener.follow('torrents', function (e) {
            if (e.type === 'load' || e.type === 'update' || e.type === 'torrent_load' || e.type === 'torrent_update') {
                if (TorrentQuality.debug) console.log('[torrent_quality.js] Событие загрузки торрентов:', e);
                applyFilterOnTorrentsLoad();
            }
        });

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
        name: 'Фильтр Торрентов',
        version: '1.1.15',
        description: 'Фильтрация торрентов по качеству и другим параметрам для текущего фильма'
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
