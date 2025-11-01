(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '3.0.0';

    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;

    // === Получение торрентов ===
    function getTorrentsData() {
        const items = document.querySelectorAll('.torrent-item');
        return Array.from(items).map(item => ({
            Title: item.querySelector('.torrent-item__title')?.textContent.trim() || 'Без названия',
            MagnetUri: item.querySelector('a[href*="magnet:"]')?.href || ''
        }));
    }

    // === Сброс ===
    function resetFilter() {
        allTorrents = [...originalTorrents];
        if (!allTorrents.length) {
            allTorrents = getTorrentsData();
            originalTorrents = [...allTorrents];
        }
        Lampa.Storage.set('tq_webdl_filter', 'any');
    }

    // === Очистка ===
    function clearTorrents() {
        originalTorrents = [];
        allTorrents = [];
    }

    // === Фильтрация ===
    function filterTorrents(value) {
        try {
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
            }

            if (value === 'any') {
                renderResults(allTorrents);
                return;
            }

            const lower = value.toLowerCase();
            const filtered = allTorrents.filter(t => {
                const title = t.Title.toLowerCase().replace(/[- ]/g, '');
                if (lower === 'web-dl') {
                    return (title.includes('webdl') || title.includes('web-dl')) &&
                           !title.includes('webdlrip') && !title.includes('web-dlrip');
                }
                if (lower === 'web-dlrip') {
                    return title.includes('webdlrip') || title.includes('web-dlrip');
                }
                if (lower === 'openmatte') {
                    return title.includes('openmatte') || title.includes('open-matte');
                }
                return false;
            });

            renderResults(filtered);
            if (!filtered.length) {
                Lampa.Utils.message?.(`Нет: ${value.toUpperCase()}`) || alert('Ничего не найдено');
            }
        } catch (e) {
            console.error('[TQ] Filter error:', e);
        }
    }

    // === Рендер ===
    function renderResults(results) {
        const items = document.querySelectorAll('.torrent-item');
        const titles = results.map(r => r.Title.toLowerCase());
        items.forEach(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.toLowerCase() || '';
            item.style.display = titles.includes(title) ? 'block' : 'none';
        });
    }

    // === Добавление фильтра через Lampa.Filter ===
    function addWebDLFilter() {
        if (window.tq_webdl_added) return;
        window.tq_webdl_added = true;

        Lampa.Filter.add('webdl', {
            title: 'WEB-DL',
            items: [
                { title: 'Любое', value: 'any' },
                { title: 'WEB-DL', value: 'web-dl' },
                { title: 'WEB-DLRip', value: 'web-dlrip' },
                { title: 'Open Matte', value: 'openmatte' }
            ],
            onSelect: (value) => {
                Lampa.Storage.set('tq_webdl_filter', value);
                filterTorrents(value);
            },
            onReset: () => {
                Lampa.Storage.set('tq_webdl_filter', 'any');
                filterTorrents('any');
            }
        });

        // Восстановление выбора
        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        if (saved !== 'any') {
            Lampa.Filter.set('webdl', saved);
        }
    }

    // === URL смена ===
    function setupUrlChange() {
        const origPush = history.pushState;
        const origReplace = history.replaceState;

        history.pushState = function (...args) {
            origPush.apply(history, args);
            handleUrlChange();
        };
        history.replaceState = function (...args) {
            origReplace.apply(history, args);
            handleUrlChange();
        };
        window.addEventListener('popstate', handleUrlChange);

        function handleUrlChange() {
            const url = window.location.search;
            if (url !== lastUrl) {
                const title = document.querySelector('.full-start-new__title')?.textContent.trim();
                if (title && title !== currentMovieTitle) {
                    clearTorrents();
                    currentMovieTitle = title;
                    lastUrl = url;
                    applyFilterOnLoad();
                }
            }
        }
    }

    // === Применение ===
    function applyFilterOnLoad() {
        clearTorrents();
        const torrents = getTorrentsData();
        if (torrents.length) {
            filterTorrents(Lampa.Storage.get('tq_webdl_filter', 'any'));
        } else {
            const container = document.querySelector('.torrent-list');
            if (container) {
                const obs = new MutationObserver(() => {
                    if (document.querySelectorAll('.torrent-item').length) {
                        obs.disconnect();
                        filterTorrents(Lampa.Storage.get('tq_webdl_filter', 'any'));
                    }
                });
                obs.observe(container, { childList: true, subtree: true });
                setTimeout(() => obs.disconnect(), 5000);
            }
        }
    }

    // === Запуск ===
    function start() {
        if (window.appready) {
            addWebDLFilter();
            setupUrlChange();
            applyFilterOnLoad();
        } else {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') {
                    addWebDLFilter();
                    setupUrlChange();
                    applyFilterOnLoad();
                }
            });
        }
    }

    start();
})();
