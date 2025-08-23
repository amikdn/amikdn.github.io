(function () {
    'use strict';

    // Объект плагина
    const TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.25', // Обновлена версия
        debug: true,
        settings: {
            enabled: true,
            quality_filter: 'any'
        }
    };

    // Хранилище данных
    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;

    // Функция получения данных торрентов из DOM
    function getTorrentsData() {
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция getTorrentsData');
        const torrentItems = document.querySelectorAll('.torrent-item');
        const results = Array.from(torrentItems).map(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.trim() || 'Без названия';
            const ffprobe = {
                video: {
                    width: parseInt(item.querySelector('.m-video')?.textContent?.split('x')[0]) || 0,
                    height: parseInt(item.querySelector('.m-video')?.textContent?.split('x')[1]) || 0
                },
                audio: {
                    channel_layout: item.querySelector('.m-channels')?.textContent?.trim() || 'Неизвестно'
                }
            };
            const voices = Array.from(item.querySelectorAll('.m-audio')).map(el => el.textContent.trim());
            const subtitles = Array.from(item.querySelectorAll('.m-subtitle')).map(el => el.textContent.trim());
            return {
                Title: title,
                PublishDate: item.querySelector('.torrent-item__date')?.textContent?.trim() || 'Неизвестно',
                Tracker: item.querySelector('.torrent-item__tracker')?.textContent?.trim() || 'Неизвестно',
                Size: parseFloat(item.querySelector('.torrent-item__size')?.textContent) * 1024 * 1024 * 1024 || 0,
                Seeders: parseInt(item.querySelector('.torrent-item__seeds span')?.textContent) || 0,
                Peers: parseInt(item.querySelector('.torrent-item__grabs span')?.textContent) || 0,
                ffprobe: ffprobe,
                languages: voices,
                subtitles: subtitles,
                MagnetUri: item.querySelector('a[href*="magnet:"]')?.href || ''
            };
        });

        if (TorrentQuality.debug) {
            console.log(`[torrent_quality.js] getTorrentsData: Извлечены данные из DOM: ${results.length} элементов`, results);
            if (!results.length) console.warn('[torrent_quality.js] getTorrentsData: Не найдено элементов .torrent-item в DOM');
        }
        return results;
    }

    // Функция сброса фильтра
    function resetFilter() {
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция resetFilter');
        allTorrents = [...originalTorrents];
        if (!allTorrents.length) {
            allTorrents = getTorrentsData();
            originalTorrents = [...allTorrents];
            if (!allTorrents.length) {
                if (TorrentQuality.debug) console.warn('[torrent_quality.js] resetFilter: Данные торрентов пусты');
                return false;
            }
        }
        TorrentQuality.settings.quality_filter = 'any';
        Lampa.Storage.set('torrent_quality_filter', 'any');
        if (TorrentQuality.debug) console.log(`[torrent_quality.js] resetFilter: Фильтр сброшен, allTorrents: ${allTorrents.length}`);
        return true;
    }

    // Функция очистки списков и DOM
    function clearTorrents() {
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция clearTorrents');
        originalTorrents = [];
        allTorrents = [];
        const container = document.querySelector('.torrent-list');
        if (container) container.innerHTML = '';
        if (TorrentQuality.debug) console.log('[torrent_quality.js] clearTorrents: Очищены списки и DOM');
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Вызвана функция filterTorrents с параметром filterValue: ${filterValue}`);
        try {
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
                if (!originalTorrents.length) {
                    if (TorrentQuality.debug) console.warn('[torrent_quality.js] filterTorrents: originalTorrents пуст при фильтрации');
                    return;
                }
            }

            if (filterValue !== 'any') {
                resetFilter();
            }

            if (!allTorrents.length) {
                resetFilter();
                if (!allTorrents.length) {
                    if (TorrentQuality.debug) console.warn('[torrent_quality.js] filterTorrents: allTorrents пуст после сброса');
                    return;
                }
            }

            let filteredResults = allTorrents;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = allTorrents.filter(result => {
                    const title = result.Title?.toLowerCase().replace(/[- ]/g, '') || '';
                    if (!title) {
                        if (TorrentQuality.debug) console.warn('[torrent_quality.js] filterTorrents: Пропущен элемент без корректного заголовка:', result);
                        return false;
                    }
                    if (filterLower === 'web-dl') {
                        return (title.includes('webdl') || title.includes('web-dl')) && !title.includes('webdlrip') && !title.includes('web-dlrip');
                    } else if (filterLower === 'web-dlrip') {
                        return title.includes('webdlrip') || title.includes('web-dlrip');
                    } else if (filterLower === 'openmatte') {
                        return title.includes('openmatte') || title.includes('open-matte');
                    }
                    return false;
                });
            }

            if (!filteredResults.length) {
                Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}`) || alert(`Не найдено торрентов для фильтра: ${filterValue}`);
                if (TorrentQuality.debug) console.warn(`[torrent_quality.js] filterTorrents: Фильтр ${filterValue} не нашел результатов`);
                return;
            }

            renderResults(filteredResults);
            if (TorrentQuality.debug) console.log(`[torrent_quality.js] filterTorrents: Отфильтровано ${filteredResults.length} торрентов для ${filterValue}`);
        } catch (error) {
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
            if (TorrentQuality.debug) console.error('[torrent_quality.js] filterTorrents: Ошибка при фильтрации:', error);
        }
    }

    // Функция рендеринга
    function renderResults(results) {
        if (TorrentQuality.debug) console.log(`[torrent_quality.js] Вызвана функция renderResults с ${results.length} результатами`);
        const torrentItems = document.querySelectorAll('.torrent-item');
        if (!torrentItems.length) {
            if (TorrentQuality.debug) console.warn('[torrent_quality.js] renderResults: Не найдено элементов .torrent-item для рендеринга');
            return; // Просто выходим, если элементы не найдены
        }

        const resultTitles = results.map(r => r.Title.toLowerCase());
        torrentItems.forEach(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.toLowerCase() || '';
            item.style.display = resultTitles.includes(title) ? 'block' : 'none';
        });

        if (TorrentQuality.debug) console.log(`[torrent_quality.js] renderResults: Отрендерено ${results.length} торрентов`);
    }

    // Отслеживание изменений URL с помощью history API
    function setupUrlChangeObserver() {
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция setupUrlChangeObserver');
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            if (TorrentQuality.debug) console.log('[torrent_quality.js] Перехвачен history.pushState с аргументами:', args);
            originalPushState.apply(this, args);
            handleUrlChange();
        };
        history.replaceState = function (...args) {
            if (TorrentQuality.debug) console.log('[torrent_quality.js] Перехвачен history.replaceState с аргументами:', args);
            originalReplaceState.apply(this, args);
            handleUrlChange();
        };

        window.addEventListener('popstate', handleUrlChange);

        function handleUrlChange() {
            if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция handleUrlChange');
            const currentUrl = window.location.search;
            if (currentUrl !== lastUrl) {
                const newTitle = document.querySelector('.full-start-new__title')?.textContent?.trim() || currentUrl;
                if (newTitle && newTitle !== currentMovieTitle) {
                    if (TorrentQuality.debug) console.log(`[torrent_quality.js] handleUrlChange: Смена фильма по URL: ${currentMovieTitle} -> ${newTitle}, URL: ${lastUrl} -> ${currentUrl}`);
                    clearTorrents();
                    currentMovieTitle = newTitle;
                    lastUrl = currentUrl;
                    applyFilterOnTorrentsLoad();
                }
            }
        }

        if (TorrentQuality.debug) console.log('[torrent_quality.js] setupUrlChangeObserver: Отслеживание URL запущено через history API');
    }

    // Применение фильтра при загрузке торрентов
    function applyFilterOnTorrentsLoad() {
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция applyFilterOnTorrentsLoad');
        if (!TorrentQuality.settings.enabled) return;
        clearTorrents();
        resetFilter();
        filterTorrents(TorrentQuality.settings.quality_filter);
    }

    // Инициализация плагина
    function startPlugin() {
        if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция startPlugin');
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Фильтр',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79-4-4-4z" fill="currentColor"/></svg>'
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
                    openmatte: 'Open Matte'
                },
                default: 'any'
            },
            field: {
                name: 'Фильтр',
                description: 'Выберите параметры для фильтрации торрентов'
            },
            onRender: function (element) {
                if (TorrentQuality.debug) console.log('[torrent_quality.js] Вызвана функция onRender в Lampa.SettingsApi.addParam');
                if (!(element instanceof HTMLElement)) return;

                const container = element.closest('.settings-param') || element.closest('.settings__content') || element.parentElement;
                if (!container || container.querySelector('.selectbox__content')) return;

                const submenu = document.createElement('div');
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
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="openmatte">
                                        <div class="selectbox-item__title">Open Matte</div>
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

                const title = container.querySelector('.settings-param__name') || element.querySelector('.settings-param__name') || element.querySelector('span') || element;
                if (title) {
                    title.addEventListener('click', () => {
                        if (TorrentQuality.debug) console.log('[torrent_quality.js] Событие: Клик по заголовку настроек для показа/скрытия подменю');
                        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                        document.querySelectorAll('.selectbox__content').forEach(content => {
                            if (content !== submenu) content.style.display = 'none';
                        });
                    });
                }

                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', () => {
                        if (TorrentQuality.debug) console.log('[torrent_quality.js] Событие: Клик по элементу подменю:', item.querySelector('.selectbox-item__title').textContent.trim());
                        const titleText = item.querySelector('.selectbox-item__title').textContent.trim();
                        let value = item.dataset.value || titleText;
                        const subtitle = item.querySelector('.selectbox-item__subtitle');

                        if (titleText === 'Сбросить фильтр') {
                            resetFilter();
                            if (subtitle) subtitle.textContent = 'Любое';
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => el.classList.remove('selected'));
                            submenu.querySelectorAll('.selectbox-item__subtitle').forEach(sub => {
                                const parentTitle = sub.parentElement.querySelector('.selectbox-item__title').textContent;
                                sub.textContent = parentTitle === 'Качество' || parentTitle === 'Перевод' || parentTitle === 'Язык' || parentTitle === 'Сезон' || parentTitle === 'Трекер' || parentTitle === 'Год' ? 'Любой' : 'Не выбрано';
                            });
                            filterTorrents('any');
                        } else if (titleText === 'Качество') {
                            value = 'any';
                            if (subtitle) subtitle.textContent = 'Любое';
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => el.classList.remove('selected'));
                            TorrentQuality.settings.quality_filter = value;
                            Lampa.Storage.set('torrent_quality_filter', value);
                            filterTorrents(value);
                        } else if (item.dataset.value) {
                            value = item.dataset.value.toLowerCase();
                            if (subtitle) subtitle.textContent = value === 'web-dl' ? 'WEB-DL' : value === 'web-dlrip' ? 'WEB-DLRip' : 'Open Matte';
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
                if (TorrentQuality.debug) console.log(`[torrent_quality.js] Вызвана функция onChange с параметром value: ${value}`);
                TorrentQuality.settings.quality_filter = value;
                Lampa.Storage.set('torrent_quality_filter', value);
                filterTorrents(value);
            }
        });

        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');
        if (window.appready) {
            setupUrlChangeObserver();
            applyFilterOnTorrentsLoad();
        } else {
            Lampa.Listener.follow('app', e => {
                if (TorrentQuality.debug) console.log(`[torrent_quality.js] Событие: Lampa.Listener app ${e.type}`);
                if (e.type === 'ready') {
                    setupUrlChangeObserver();
                    applyFilterOnTorrentsLoad();
                }
            });
        }
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Фильтр Торрентов',
        version: '1.1.25',
        description: 'Фильтрация торрентов по качеству для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (TorrentQuality.debug) console.log(`[torrent_quality.js] Событие: Lampa.Listener app ${e.type} (вне startPlugin)`);
            if (e.type === 'ready') startPlugin();
        });
    }
})();
