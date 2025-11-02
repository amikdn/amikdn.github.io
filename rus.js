(function() {
    'use strict';

    // Объект плагина
    const TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.28',
        debug: true,  // Включили debug для логов
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
        if (TorrentQuality.debug) console.log('Получено торрентов из DOM:', results.length);
        return results;
    }

    // Функция сброса фильтра
    function resetFilter() {
        if (!originalTorrents.length) {
            originalTorrents = getTorrentsData();
            allTorrents = [...originalTorrents];
            if (!allTorrents.length) {
                if (TorrentQuality.debug) console.log('Нет торрентов для сброса');
                return false;
            }
        } else {
            allTorrents = [...originalTorrents];
        }
        TorrentQuality.settings.quality_filter = 'any';
        Lampa.Storage.set('torrent_quality_filter', 'any');
        renderResults(allTorrents);  // Показываем все торренты
        if (TorrentQuality.debug) console.log('Фильтр сброшен');
        return true;
    }

    // Функция очистки списков (без очистки DOM)
    function clearTorrents() {
        originalTorrents = [];
        allTorrents = [];
        if (TorrentQuality.debug) console.log('Списки торрентов очищены');
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        try {
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
                if (!originalTorrents.length) {
                    if (TorrentQuality.debug) console.log('Нет торрентов для фильтрации');
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

            if (!filteredResults.length && filterValue !== 'any') {
                Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}`) || alert(`Не найдено торрентов для фильтра: ${filterValue}`);
                if (TorrentQuality.debug) console.log('Нет результатов для фильтра:', filterValue);
                return;
            }

            renderResults(filteredResults);
            if (TorrentQuality.debug) console.log('Фильтрация применена, результатов:', filteredResults.length);
        } catch (error) {
            if (TorrentQuality.debug) console.log('Ошибка фильтрации:', error);
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
        }
    }

    // Функция рендеринга (показ/скрытие элементов)
    function renderResults(results) {
        const torrentItems = document.querySelectorAll('.torrent-item');
        if (!torrentItems.length) {
            if (TorrentQuality.debug) console.log('Нет элементов торрентов для рендеринга');
            return;
        }

        const resultTitles = results.map(r => r.Title.toLowerCase());
        torrentItems.forEach(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.toLowerCase() || '';
            item.style.display = resultTitles.includes(title) ? 'block' : 'none';
        });
        if (TorrentQuality.debug) console.log('Рендеринг завершен, видимых элементов:', resultTitles.length);
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
                    if (TorrentQuality.debug) console.log('URL изменился, применяем фильтр для нового контента');
                }
            }
        }
    }

    // Применение фильтра при загрузке торрентов
    function applyFilterOnTorrentsLoad() {
        if (!TorrentQuality.settings.enabled) return;
        const torrents = getTorrentsData();
        if (torrents.length) {
            resetFilter();
            filterTorrents(TorrentQuality.settings.quality_filter);
        } else {
            const container = document.querySelector('.torrent-list');
            if (container) {
                const observer = new MutationObserver((mutations, obs) => {
                    const newTorrents = getTorrentsData();
                    if (newTorrents.length) {
                        obs.disconnect();
                        resetFilter();
                        filterTorrents(TorrentQuality.settings.quality_filter);
                        if (TorrentQuality.debug) console.log('Торренты загружены, фильтр применен');
                    }
                });
                observer.observe(container, { childList: true, subtree: true });
                setTimeout(() => observer.disconnect(), 10000); // Увеличили таймаут до 10 сек
            }
        }
    }

    // Функция добавления фильтров в меню "Качество"
    function addQualityFilters() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            mutation.addedNodes.forEach(function(node) {
                                if (node && node.classList && node.classList.contains('selectbox__content')) {
                                    const title = node.querySelector('.selectbox__title');
                                    if (title && title.textContent.trim() === 'Качество') {
                                        const body = node.querySelector('.scroll__body');
                                        if (body && !body.querySelector('[data-value="web-dl"]')) {
                                            if (TorrentQuality.debug) console.log('Добавляем фильтры качества в меню');
                                            const newFilters = [
                                                { label: 'WEB-DL', value: 'web-dl' },
                                                { label: 'WEB-DLRip', value: 'web-dlrip' },
                                                { label: 'Open Matte', value: 'openmatte' }
                                            ];
                                            newFilters.forEach(function(filter) {
                                                const item = document.createElement('div');
                                                item.className = 'selectbox-item selector selectbox-item--checkbox';
                                                item.dataset.value = filter.value;
                                                item.innerHTML = `
                                                    <div class="selectbox-item__title">${filter.label}</div>
                                                    <div class="selectbox-item__checkbox"></div>
                                                `;
                                                body.appendChild(item);

                                                item.addEventListener('click', function() {
                                                    body.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                                        if (el !== item) el.classList.remove('selectbox-item--checked');
                                                    });
                                                    item.classList.toggle('selectbox-item--checked');
                                                    const value = item.classList.contains('selectbox-item--checked') ? filter.value : 'any';
                                                    TorrentQuality.settings.quality_filter = value;
                                                    Lampa.Storage.set('torrent_quality_filter', value);
                                                    filterTorrents(value);
                                                    if (TorrentQuality.debug) console.log('Выбран фильтр:', value);
                                                });
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    });
                });

                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
    }

    // Инициализация плагина
    function startPlugin() {
        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');
        if (window.appready) {
            setupUrlChangeObserver();
            applyFilterOnTorrentsLoad();
            addQualityFilters();
        } else {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') {
                    setupUrlChangeObserver();
                    applyFilterOnTorrentsLoad();
                    addQualityFilters();
                }
            });
        }
        if (TorrentQuality.debug) console.log('Плагин запущен, версия:', TorrentQuality.version);
    }

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
