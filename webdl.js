(function () {
    'use strict';

    // Объект плагина
    const TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.28',
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
                setTimeout(() => observer.disconnect(), 5000); // Остановить через 5 секунд
            }
        }
    }

    // Инициализация плагина
    function startPlugin() {
        // Отслеживание появления .simple-button--filter и добавление пунктов фильтрации
        const observer = new MutationObserver((mutations, obs) => {
            const filterButton = document.querySelector('.simple-button--filter.selector.filter--search');
            if (!filterButton) return;

            let selectboxContent = filterButton.querySelector('.selectbox__content.layer--height');
            if (!selectboxContent) {
                // Если selectbox__content ещё не создан, ждём его появления
                const innerObserver = new MutationObserver((innerMutations, innerObs) => {
                    selectboxContent = filterButton.querySelector('.selectbox__content.layer--height');
                    if (selectboxContent) {
                        innerObs.disconnect();
                        addTorrentFilters(selectboxContent);
                    }
                });
                innerObserver.observe(filterButton, { childList: true, subtree: true });
                setTimeout(() => innerObserver.disconnect(), 5000); // Остановить через 5 секунд
            } else {
                addTorrentFilters(selectboxContent);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000); // Остановить через 5 секунд

        function addTorrentFilters(selectboxContent) {
            // Проверяем, не добавлены ли уже наши пункты
            if (selectboxContent.querySelector('.torrent-quality-filters')) return;

            const scrollBody = selectboxContent.querySelector('.scroll__body');
            if (!scrollBody) return;

            // Добавляем раздел "Фильтры торрентов"
            const filtersHtml = `
                <div class="settings-param-title torrent-quality-filters"><span>Фильтры торрентов</span></div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="reset">
                    <div class="selectbox-item__title">Сбросить фильтр</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="quality" data-value="any">
                    <div class="selectbox-item__title">Качество</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
                <div class="selectbox-item selector selectbox-item--checkbox torrent-quality-filter" data-value="web-dl">
                    <div class="selectbox-item__title">WEB-DL</div>
                    <div class="selectbox-item__checkbox"></div>
                </div>
                <div class="selectbox-item selector selectbox-item--checkbox torrent-quality-filter" data-value="web-dlrip">
                    <div class="selectbox-item__title">WEB-DLRip</div>
                    <div class="selectbox-item__checkbox"></div>
                </div>
                <div class="selectbox-item selector selectbox-item--checkbox torrent-quality-filter" data-value="openmatte">
                    <div class="selectbox-item__title">Open Matte</div>
                    <div class="selectbox-item__checkbox"></div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="hdr">
                    <div class="selectbox-item__title">HDR</div>
                    <div class="selectbox-item__subtitle">Не выбрано</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="dolby-vision">
                    <div class="selectbox-item__title">Dolby Vision</div>
                    <div class="selectbox-item__subtitle">Не выбрано</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="subtitles">
                    <div class="selectbox-item__title">Субтитры</div>
                    <div class="selectbox-item__subtitle">Не выбрано</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="translation">
                    <div class="selectbox-item__title">Перевод</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="language">
                    <div class="selectbox-item__title">Язык</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="season">
                    <div class="selectbox-item__title">Сезон</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="tracker">
                    <div class="selectbox-item__title">Трекер</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
                <div class="selectbox-item selector torrent-quality-filter" data-action="year">
                    <div class="selectbox-item__title">Год</div>
                    <div class="selectbox-item__subtitle">Все</div>
                </div>
            `;

            scrollBody.insertAdjacentHTML('beforeend', filtersHtml);

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
                            sub.textContent = parentTitle === 'Качество' || parentTitle === 'Перевод' || parentTitle === 'Язык' || parentTitle === 'Сезон' || parentTitle === 'Трекер' || parentTitle === 'Год' ? 'Все' : 'Не выбрано';
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
        } else {
            Lampa.Listener.follow('app', e => {
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
        version: '1.1.28',
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
