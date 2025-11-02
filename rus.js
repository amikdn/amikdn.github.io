(function () {
    'use strict';
    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '3.0.0';
    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
    let isHooked = false;

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    // === Получение торрентов ===
    function getTorrentsData() {
        const items = document.querySelectorAll('.torrent-item');
        return Array.from(items).map(item => {
            const titleEl = item.querySelector('.torrent-item__title');
            const magnetEl = item.querySelector('a[href*="magnet:"]');
            return {
                Title: titleEl ? titleEl.textContent.trim() : 'Без названия',
                MagnetUri: magnetEl ? magnetEl.href : ''
            };
        });
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
            let filtered = allTorrents;
            if (value && value !== 'any') {
                const lower = value.toLowerCase();
                filtered = allTorrents.filter(result => {
                    const title = result.Title ? result.Title.toLowerCase().replace(/[- ]/g, '') : '';
                    if (lower === 'web-dl') {
                        return (title.includes('webdl') || title.includes('web-dl')) && !title.includes('webdlrip') && !title.includes('web-dlrip');
                    }
                    if (lower === 'web-dlrip') {
                        return title.includes('webdlrip') || title.includes('web-dlrip') || title.includes('webrip') || title.includes('web-rip');
                    }
                    if (lower === 'openmatte') {
                        return title.includes('openmatte') || title.includes('open-matte');
                    }
                    return false;
                });
            }
            renderResults(filtered);
        } catch (e) {
            Lampa.Utils?.message?.('Ошибка фильтрации');
        }
    }

    // === Рендер ===
    function renderResults(results) {
        const items = document.querySelectorAll('.torrent-item');
        const titles = results.map(r => r.Title.toLowerCase());
        items.forEach(item => {
            const titleEl = item.querySelector('.torrent-item__title');
            const title = titleEl ? titleEl.textContent.toLowerCase() : '';
            item.style.display = titles.includes(title) ? 'block' : 'none';
        });
    }

    // === Перемещение фильтра в div watched-history ===
    function hookHistoryDiv() {
        if (isHooked) return;
        const historyDiv = document.querySelector('.watched-history.selector');
        if (!historyDiv) return;
        isHooked = true;
        // Сохраняем структуру, меняем содержимое body
        const bodyDiv = historyDiv.querySelector('.watched-history__body');
        if (bodyDiv) {
            bodyDiv.innerHTML = '<span></span>';
        }
        const filterSpan = bodyDiv.querySelector('span');
        historyDiv.dataset.name = 'webdl';
        // Перемещение в контейнер фильтров
        const qualityItem = document.querySelector('[data-name="quality"]');
        if (qualityItem) {
            const container = qualityItem.parentNode;
            container.insertBefore(historyDiv, qualityItem.nextSibling);
            setTimeout(() => {
                Lampa.Controller.collectionAppend(historyDiv);
                Lampa.Controller.collectionSet(container);
            }, 100);
        }
        // Обновление текста
        const updateFilterText = () => {
            const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
            const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
            if (filterSpan) filterSpan.textContent = `Фильтр WEB DL: ${titles[saved]}`;
        };
        updateFilterText();
        // Установка hover:enter для цикличного переключения
        $(historyDiv).on('hover:enter', () => {
            const filters = ['any', 'web-dl', 'web-dlrip', 'openmatte'];
            let current = Lampa.Storage.get('tq_webdl_filter', 'any');
            let index = filters.indexOf(current);
            let newValue = filters[(index + 1) % filters.length];
            Lampa.Storage.set('tq_webdl_filter', newValue);
            filterTorrents(newValue);
            updateFilterText();
        });
    }

    // === Observer для обнаружения div ===
    function setupHistoryObserver() {
        const observer = new MutationObserver(() => {
            hookHistoryDiv();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // === Observer для изменений в списке торрентов ===
    function setupTorrentsObserver() {
        const container = document.querySelector('.torrent-list');
        if (!container) return;
        const observer = new MutationObserver(debounce(() => {
            if (document.querySelectorAll('.torrent-item').length > 0) {
                clearTorrents();
                filterTorrents(Lampa.Storage.get('tq_webdl_filter', 'any'));
            }
        }, 500));
        observer.observe(container, { childList: true, subtree: true });
        // Применить сразу, если торренты уже есть
        if (document.querySelectorAll('.torrent-item').length > 0) {
            clearTorrents();
            filterTorrents(Lampa.Storage.get('tq_webdl_filter', 'any'));
        }
    }

    // === Handler для сброса фильтра ===
    function setupResetHandler() {
        const observer = new MutationObserver(() => {
            const resetTitle = document.querySelector('.selectbox-item__title');
            if (resetTitle && resetTitle.textContent.trim() === 'Сбросить фильтр') {
                const resetItem = resetTitle.parentNode;
                if (resetItem && !resetItem.dataset.hooked) {
                    resetItem.dataset.hooked = 'true';
                    $(resetItem).on('hover:enter', () => {
                        Lampa.Storage.set('tq_webdl_filter', 'any');
                        const filterSpan = document.querySelector('.watched-history__body span');
                        const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
                        if (filterSpan) filterSpan.textContent = `Фильтр WEB DL: ${titles['any']}`;
                    });
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // === URL смена ===
    function setupUrlChange() {
        const origPush = history.pushState;
        const origReplace = history.replaceState;
        history.pushState = function (...args) {
            origPush.apply(this, args);
            handleUrlChange();
        };
        history.replaceState = function (...args) {
            origReplace.apply(this, args);
            handleUrlChange();
        };
        window.addEventListener('popstate', handleUrlChange);
        function handleUrlChange() {
            const url = window.location.search;
            if (url !== lastUrl) {
                const newTitle = document.querySelector('.full-start-new__title')?.textContent.trim() || url;
                if (newTitle && newTitle !== currentMovieTitle) {
                    clearTorrents();
                    currentMovieTitle = newTitle;
                    lastUrl = url;
                    isHooked = false;
                }
            }
        }
    }

    // === Запуск ===
    function start() {
        if (!window.appready) {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') start();
            });
            return;
        }
        setupHistoryObserver();
        setupTorrentsObserver();
        setupResetHandler();
        setupUrlChange();
    }
    start();
})();
