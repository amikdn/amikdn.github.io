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
                    if (!title) return false;
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
                Lampa.Utils.message?.(`Не найдено торрентов: ${filterValue.toUpperCase()}`) || alert(`Не найдено: ${filterValue}`);
                return;
            }

            renderResults(filteredResults);
        } catch (error) {
            console.error('[TorrentQuality] Filter error:', error);
            Lampa.Utils.message?.('Ошибка фильтрации') || alert('Ошибка');
        }
    }

    // Функция рендеринга
    function renderResults(results) {
        const torrentItems = document.querySelectorAll('.torrent-item');
        if (!torrentItems.length) return;

        const resultTitles = results.map(r => r.Title.toLowerCase());
        torrentItems.forEach(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.toLowerCase() || '';
            item.style.display = resultTitles.includes(title) ? 'block' : 'none';
        });
    }

    // Отслеживание изменений URL
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

    // Применение фильтра при загрузке
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
                setTimeout(() => observer.disconnect(), 5000);
            }
        }
    }

    // Инициализация плагина
    function startPlugin() {
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Фильтр WEB-DL',
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
                name: 'Фильтр качества',
                description: 'Фильтрация по типу рипа (встраивается в меню)'
            },
            onRender: function (element) {
                if (!(element instanceof HTMLElement)) return;

                // Ждём, пока откроется меню фильтров
                setTimeout(() => {
                    const container = document.querySelector('.torrents-filter .scroll__content .scroll__body');
                    if (!container) return;

                    // Удаляем старые (на случай повторного рендера)
                    container.querySelectorAll('.selectbox-item[data-quality-filter]').forEach(el => el.remove());

                    const qualityItem = Array.from(container.children).find(item => 
                        item.querySelector('.selectbox-item__title')?.textContent === 'Качество'
                    );
                    if (!qualityItem) return;

                    const insertAfter = qualityItem;

                    // Создание пункта
                    function createOption(title, value) {
                        const item = document.createElement('div');
                        item.className = 'selectbox-item selector selectbox-item--checkbox';
                        item.dataset.qualityFilter = value;
                        item.dataset.value = value;
                        item.innerHTML = `
                            <div class="selectbox-item__title">${title}</div>
                            <div class="selectbox-item__checkbox"></div>
                        `;
                        return item;
                    }

                    const options = [
                        createOption('WEB-DL', 'web-dl'),
                        createOption('WEB-DLRip', 'web-dlrip'),
                        createOption('Open Matte', 'openmatte')
                    ];

                    options.forEach((opt, i) => {
                        insertAfter.parentNode.insertBefore(opt, insertAfter.nextSibling);
                        if (i < options.length - 1) insertAfter.parentNode.insertBefore(options[i + 1], opt.nextSibling);
                    });

                    const qualitySubtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                    const updateSubtitle = () => {
                        const active = container.querySelector('.selectbox-item--checkbox.selected[data-quality-filter]')?.querySelector('.selectbox-item__title')?.textContent || 'Любое';
                        if (qualitySubtitle) qualitySubtitle.textContent = active;
                    };

                    // Клик по чекбоксу
                    container.querySelectorAll('.selectbox-item--checkbox[data-quality-filter]').forEach(item => {
                        item.addEventListener('click', function () {
                            const value = this.dataset.value;

                            container.querySelectorAll('.selectbox-item--checkbox[data-quality-filter]').forEach(el => {
                                el.classList.toggle('selected', el === this);
                            });

                            TorrentQuality.settings.quality_filter = value;
                            Lampa.Storage.set('torrent_quality_filter', value);
                            filterTorrents(value);
                            updateSubtitle();

                            // Закрываем меню
                            const menu = container.closest('.selectbox__content');
                            if (menu) menu.style.display = 'none';
                        });
                    });

                    // Сброс
                    const resetItem = Array.from(container.children).find(item => 
                        item.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
                    );
                    if (resetItem && !resetItem.dataset.tqHooked) {
                        const oldOnclick = resetItem.onclick;
                        resetItem.onclick = function () {
                            if (oldOnclick) oldOnclick.apply(this, arguments);
                            container.querySelectorAll('.selectbox-item--checkbox[data-quality-filter]').forEach(el => el.classList.remove('selected'));
                            updateSubtitle();
                            resetFilter();
                            filterTorrents('any');
                        };
                        resetItem.dataset.tqHooked = '1';
                    }

                    // Восстановление текущего фильтра
                    const current = TorrentQuality.settings.quality_filter;
                    if (current && current !== 'any') {
                        const active = container.querySelector(`[data-value="${current}"]`);
                        if (active) {
                            active.classList.add('selected');
                            updateSubtitle();
                        }
                    }
                }, 100);
            },
            onChange: function (value) {
                TorrentQuality.settings.quality_filter = value;
                Lampa.Storage.set('torrent_quality_filter', value);
                if (window.appready) filterTorrents(value);
            }
        });

        // Загружаем сохранённое
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

    // Запуск
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
