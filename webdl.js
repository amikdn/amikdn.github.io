(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.19',
        debug: true, // Оставлено true для отладки
        settings: {
            enabled: true,
            quality_filter: 'any'
        }
    };

    // Хранилище полного списка торрентов
    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null; // Для отслеживания текущего фильма по заголовку

    // Функция получения данных торрентов из DOM
    function getTorrentsData() {
        const torrentItems = document.querySelectorAll('.torrent-item');
        let results = [];
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
                    PublishDate: item.querySelector('.torrent-item__date')?.textContent || 'Неизвестно',
                    Tracker: item.querySelector('.torrent-item__tracker')?.textContent || 'Неизвестно',
                    Size: parseFloat(item.querySelector('.torrent-item__size')?.textContent) * 1024 * 1024 * 1024 || 0,
                    Seeders: parseInt(item.querySelector('.torrent-item__seeds span')?.textContent) || 0,
                    Peers: parseInt(item.querySelector('.torrent-item__grabs span')?.textContent) || 0,
                    ffprobe: ffprobe,
                    languages: voices,
                    subtitles: subtitles,
                    MagnetUri: item.querySelector('a[href*="magnet:"]')?.href || ''
                };
            });
            if (TorrentQuality.debug) console.log(`[torrent_quality.js] Извлечены данные из DOM: ${results.length} элементов`, results);
        } else {
            if (TorrentQuality.debug) console.warn('[torrent_quality.js] Не найдено элементов .torrent-item в DOM');
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

    // Функция очистки списков и DOM
    function clearTorrents() {
        originalTorrents = [];
        allTorrents = [];
        const container = document.querySelector('.torrent-list');
        if (container) container.innerHTML = '';
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Очищены списки и DOM');
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
                    const title = result.Title || '';
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
            const title = result.Title || 'Без названия';
            const resolution = result.ffprobe?.video?.width && result.ffprobe?.video?.height
                ? `${result.ffprobe.video.width}x${result.ffprobe.video.height}`
                : 'Неизвестно';
            const audio = result.ffprobe?.audio?.channel_layout || 'Неизвестно';
            const trackers = result.Tracker || 'Неизвестно';
            const publishDate = result.PublishDate || 'Неизвестно';
            const sizeName = result.Size ? (result.Size / 1024 / 1024 / 1024).toFixed(2) + ' ГБ' : 'Неизвестно';
            const voices = result.languages?.join(', ') || 'Неизвестно';
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

    // Настройка MutationObserver для отслеживания смены фильма
    function setupMovieChangeObserver() {
        const targetNode = document.querySelector('.full-start-new__title');
        if (!targetNode) {
            if (TorrentQuality.debug) console.warn('[torrent_quality.js] Элемент .full-start-new__title не найден для MutationObserver');
            return;
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const newTitle = targetNode.textContent.trim();
                    if (newTitle && newTitle !== currentMovieTitle) {
                        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Смена фильма по DOM: ${currentMovieTitle} -> ${newTitle}`);
                        clearTorrents();
                        currentMovieTitle = newTitle;
                        applyFilterOnTorrentsLoad();
                    }
                }
            });
        });

        observer.observe(targetNode, {
            childList: true,
            characterData: true,
            subtree: true
        });

        if (TorrentQuality.debug) console.log('[torrent_quality.js] MutationObserver установлен на .full-start-new__title');
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
                clearTorrents(); // Очищаем при каждой загрузке торрентов
                resetFilter();
                filterTorrents(TorrentQuality.settings.quality_filter);
            }
        }

        // Отслеживание событий activity
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'active' || e.type === 'push' || e.type === 'toggle') {
                const activeMovie = Lampa.Activity.active()?.movie;
                const newTitle = activeMovie?.title || document.querySelector('.full-start-new__title')?.textContent?.trim() || e.data?.title || JSON.stringify(activeMovie);
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Событие activity:', { type: e.type, data: e.data, activeMovie: Lampa.Activity.active() });
                }
                if (newTitle && newTitle !== currentMovieTitle) {
                    if (TorrentQuality.debug) console.log(`[torrent_quality.js] Смена фильма по activity: ${currentMovieTitle} -> ${newTitle}`);
                    clearTorrents();
                    currentMovieTitle = newTitle;
                    applyFilterOnTorrentsLoad();
                }
            }
        });

        // Отслеживание событий torrents
        Lampa.Listener.follow('torrents', function (e) {
            if (e.type === 'load' || e.type === 'update' || e.type === 'torrent_load' || e.type === 'torrent_update') {
                if (TorrentQuality.debug) console.log('[torrent_quality.js] Событие torrents:', e);
                applyFilterOnTorrentsLoad();
            }
        });

        // Инициализация MutationObserver при запуске
        if (window.appready) {
            setupMovieChangeObserver();
            applyFilterOnTorrentsLoad();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    setupMovieChangeObserver();
                    applyFilterOnTorrentsLoad();
                }
            });
        }
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Фильтр Торрентов',
        version: '1.1.19',
        description: 'Фильтрация торрентов по качеству для текущего фильма'
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
