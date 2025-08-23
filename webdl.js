(function () {
    'use strict';

    // Объект плагина
    const TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.34',
        debug: false,
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
        return results;
    }

    // Функция сброса фильтра
    function resetFilter() {
        allTorrents = [...originalTorrents];
        if (!allTorrents.length) {
            allTorrents = getTorrentsData();
            originalTorrents = [...allTorrents];
            if (!allTorrents.length) {
                return false;
            }
        }
        TorrentQuality.settings.quality_filter = 'any';
        Lampa.Storage.set('torrent_quality_filter', 'any');
        return true;
    }

    // Функция очистки списков и DOM
    function clearTorrents() {
        originalTorrents = [];
        allTorrents = [];
        const container = document.querySelector('.torrent-list');
        if (container) container.innerHTML = '';
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        try {
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
                if (!originalTorrents.length) {
                    return;
                }
            }

            if (filterValue !== 'any') {
                resetFilter();
            }

            if (!allTorrents.length) {
                resetFilter();
                if (!allTorrents.length) {
                    return;
                }
            }

            let filteredResults = allTorrents;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = allTorrents.filter(result => {
                    const title = result.Title?.toLowerCase().replace(/[- ]/g, '') || '';
                    if (!title) {
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
                return;
            }

            renderResults(filteredResults);
        } catch (error) {
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
        }
    }

    // Функция рендеринга
    function renderResults(results) {
        const torrentItems = document.querySelectorAll('.torrent-item');
        if (!torrentItems.length) {
            return;
        }

        const resultTitles = results.map(r => r.Title.toLowerCase());
        torrentItems.forEach(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.toLowerCase() || '';
            item.style.display = resultTitles.includes(title) ? 'block' : 'none';
        });
    }

    // Отслеживание изменений URL с помощью history API
    function setupUrlChangeObserver() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            handleUrlChange();
        };
        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            handleUrlChange();
        };

        window.addEventListener('popstate', handleUrlChange);

        function handleUrlChange() {
            const currentUrl = window.location.search;
            if (currentUrl !== lastUrl) {
                const newTitle = document.querySelector('.full-start-new__title')?.textContent?.trim() || currentUrl;
                if (newTitle && newTitle !== currentMovieTitle) {
                    clearTorrents();
                    currentMovieTitle = newTitle;
                    lastUrl = currentUrl;
                    applyFilterOnTorrentsLoad();
                }
            }
        }
    }

    // Применение фильтра при загрузке торрентов
    function applyFilterOnTorrentsLoad() {
        if (!TorrentQuality.settings.enabled) return;
        clearTorrents();
        resetFilter();
        const torrents = getTorrentsData();
        if (torrents.length) {
            filterTorrents(TorrentQuality.settings.quality_filter);
        } else {
            const container = document.querySelector('.torrent-list');
            if (container) {
                const observer = new MutationObserver((mutations, obs) => {
                    if (document.querySelectorAll('.torrent-item').length) {
                        obs.disconnect();
                        resetFilter();
                        filterTorrents(TorrentQuality.settings.quality_filter);
                    }
                });
                observer.observe(container, { childList: true, subtree: true });
                setTimeout(() => observer.disconnect(), 15000); // Остановить через 15 секунд
            }
        }
    }

    // Инициализация плагина
    function startPlugin() {
        // Интервальный опрос для поиска simple-button и selectbox__content
        const interval = setInterval(() => {
            console.log('[torrent_quality.js] Checking for simple-button');
            const filterButton = document.querySelector('[class*="simple-button"]');
            if (filterButton && filterButton.querySelector('.selectbox__content')) {
                console.log('[torrent_quality.js] Found simple-button with selectbox__content');
                addTorrentFilters(filterButton.querySelector('.selectbox__content'));
                clearInterval(interval);
            }
        }, 500);
        setTimeout(() => clearInterval(interval), 30000); // Остановить через 30 секунд

        // Обработчик клика по simple-button
        document.addEventListener('click', e => {
            const filterButton = e.target.closest('[class*="simple-button"]');
            if (filterButton && filterButton.querySelector('.selectbox__content')) {
                console.log('[torrent_quality.js] Clicked simple-button with selectbox__content');
                addTorrentFilters(filterButton.querySelector('.selectbox__content'));
            }
        });

        function addTorrentFilters(selectboxContent) {
            // Проверяем, не добавлены ли уже наши пункты
            if (selectboxContent.querySelector('.torrent-quality-filters')) {
                console.log('[torrent_quality.js] Torrent filters already added');
                return;
            }

            const scrollBody = selectboxContent.querySelector('.scroll__body');
            if (!scrollBody) {
                console.log('[torrent_quality.js] .scroll__body not found');
                return;
            }

            // Находим пункт "Указать название"
            const specifyTitleItem = Array.from(scrollBody.querySelectorAll('.selectbox-item.selector')).find(item => {
                const title = item.querySelector('.selectbox-item__title');
                return title && title.textContent.trim() === 'Указать название';
            });

            // HTML для пунктов фильтрации
            const filtersHtml = `
                <style>
                    .torrent-quality-debug { border: 1px solid red; display: block !important; visibility: visible !important; position: relative; z-index: 1000; min-height: 20px; }
                    .torrent-quality-filters { margin: 10px 0; padding: 5px; background: rgba(0,0,0,0.8); }
                    .torrent-quality-filter { cursor: pointer; padding: 5px; display: block !important; min-height: 20px; }
                </style>
                <div class="settings-param-title torrent-quality-filters torrent-quality-debug"><span>Фильтры торрентов</span></div>
                <div class="selectbox-item selector torrent-quality-filter torrent-quality-debug" data-action="reset">
                    <div class="selectbox-item__title">Сбросить фильтр</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter torrent-quality-debug" data-action="quality" data-value="any">
                    <div class="selectbox-item__title">Качество</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
                <div class="selectbox-item selector selectbox-item--checkbox torrent-quality-filter torrent-quality-debug" data-value="web-dl">
                    <div class="selectbox-item__title">WEB-DL</div>
                    <div class="selectbox-item__checkbox"></div>
                </div>
                <div class="selectbox-item selector selectbox-item--checkbox torrent-quality-filter torrent-quality-debug" data-value="web-dlrip">
                    <div class="selectbox-item__title">WEB-DLRip</div>
                    <div class="selectbox-item__checkbox"></div>
                </div>
                <div class="selectbox-item selector selectbox-item--checkbox torrent-quality-filter torrent-quality-debug" data-value="openmatte">
                    <div class="selectbox-item__title">Open Matte</div>
                    <div class="selectbox-item__checkbox"></div>
                </div>
            `;

            // Вставляем после "Указать название" или в начало scroll__body
            if (specifyTitleItem) {
                console.log('[torrent_quality.js] Found specify title item');
                specifyTitleItem.insertAdjacentHTML('afterend', filtersHtml);
            } else {
                console.log('[torrent_quality.js] Specify title item not found, inserting at start');
                scrollBody.insertAdjacentHTML('afterbegin', filtersHtml);
            }
            console.log('[torrent_quality.js] Inserted torrent filters');

            // Добавляем обработчики событий для новых пунктов
            scrollBody.querySelectorAll('.torrent-quality-filter').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    const value = item.dataset.value;
                    const subtitle = item.querySelector('.selectbox-item__subtitle');

                    if (action === 'reset') {
                        resetFilter();
                        if (subtitle) subtitle.textContent = 'Все';
                        scrollBody.querySelectorAll('.torrent-quality-filter.selectbox-item--checkbox').forEach(el => el.classList.remove('selected'));
                        scrollBody.querySelectorAll('.torrent-quality-filter .selectbox-item__subtitle').forEach(sub => {
                            const parentTitle = sub.parentElement.querySelector('.selectbox-item__title').textContent;
                            sub.textContent = parentTitle === 'Качество' ? 'Все' : '';
                        });
                        filterTorrents('any');
                    } else if (action === 'quality') {
                        if (subtitle) subtitle.textContent = 'Все';
                        scrollBody.querySelectorAll('.torrent-quality-filter.selectbox-item--checkbox').forEach(el => el.classList.remove('selected'));
                        TorrentQuality.settings.quality_filter = 'any';
                        Lampa.Storage.set('torrent_quality_filter', 'any');
                        filterTorrents('any');
                    } else if (value) {
                        if (subtitle) subtitle.textContent = value === 'web-dl' ? 'WEB-DL' : value === 'web-dlrip' ? 'WEB-DLRip' : 'Open Matte';
                        scrollBody.querySelectorAll('.torrent-quality-filter.selectbox-item--checkbox').forEach(el => {
                            el.classList.toggle('selected', el.dataset.value === value);
                        });
                        TorrentQuality.settings.quality_filter = value;
                        Lampa.Storage.set('torrent_quality_filter', value);
                        filterTorrents(value);
                    }

                    // Закрываем меню после выбора
                    selectboxContent.style.display = 'none';
                });
            });
        }

        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');
        if (window.appready) {
            setupUrlChangeObserver();
            applyFilterOnTorrentsLoad();
            // Проверяем при загрузке
            const interval = setInterval(() => {
                console.log('[torrent_quality.js] Checking for simple-button on app ready');
                const filterButton = document.querySelector('[class*="simple-button"]');
                if (filterButton && filterButton.querySelector('.selectbox__content')) {
                    console.log('[torrent_quality.js] Found simple-button with selectbox__content on app ready');
                    addTorrentFilters(filterButton.querySelector('.selectbox__content'));
                    clearInterval(interval);
                }
            }, 500);
            setTimeout(() => clearInterval(interval), 30000);
        } else {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') {
                    setupUrlChangeObserver();
                    applyFilterOnTorrentsLoad();
                    // Проверяем после app ready
                    const interval = setInterval(() => {
                        console.log('[torrent_quality.js] Checking for simple-button after app ready');
                        const filterButton = document.querySelector('[class*="simple-button"]');
                        if (filterButton && filterButton.querySelector('.selectbox__content')) {
                            console.log('[torrent_quality.js] Found simple-button with selectbox__content after app ready');
                            addTorrentFilters(filterButton.querySelector('.selectbox__content'));
                            clearInterval(interval);
                        }
                    }, 500);
                    setTimeout(() => clearInterval(interval), 30000);
                }
            });
        }

        // Попытка подписки на событие Lampa
        Lampa.Listener.follow('filter_menu', e => {
            if (e.type === 'render') {
                console.log('[torrent_quality.js] Detected filter_menu render event');
                const selectboxContent = document.querySelector('.selectbox__content');
                if (selectboxContent) {
                    addTorrentFilters(selectboxContent);
                }
            }
        });
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Фильтр Торрентов',
        version: '1.1.34',
        description: 'Фильтрация торрентов по качеству для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
