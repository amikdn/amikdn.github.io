(function () {
    'use strict';
    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '23.0.0';
    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
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
                        return title.includes('webdlrip') || title.includes('web-dlrip');
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
        const historyDiv = document.querySelector('.watched-history.selector');
        if (!historyDiv) return;
        // Очистка
        historyDiv.innerHTML = '';
        historyDiv.classList.remove('watched-history');
        historyDiv.classList.add('selectbox-item');
        historyDiv.dataset.name = 'webdl';
        // Добавление title и subtitle
        const titleDiv = document.createElement('div');
        titleDiv.className = 'selectbox-item__title';
        titleDiv.textContent = 'WebDL';
        historyDiv.appendChild(titleDiv);
        const subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'selectbox-item__subtitle';
        historyDiv.appendChild(subtitleDiv);
        // Обновление subtitle
        const updateSubtitle = () => {
            const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
            const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
            subtitleDiv.textContent = titles[saved];
        };
        updateSubtitle();
        // Установка click
        historyDiv.addEventListener('click', () => {
            const currentValue = Lampa.Storage.get('tq_webdl_filter', 'any');
            const params = {
                title: 'WebDL',
                items: [
                    { title: 'WEB-DL', value: 'web-dl', selected: currentValue === 'web-dl' },
                    { title: 'WEB-DLRip', value: 'web-dlrip', selected: currentValue === 'web-dlrip' },
                    { title: 'Open Matte', value: 'openmatte', selected: currentValue === 'openmatte' }
                ],
                onSelect: (item) => {
                    const current = Lampa.Storage.get('tq_webdl_filter', 'any');
                    const newValue = current === item.value ? 'any' : item.value;
                    Lampa.Storage.set('tq_webdl_filter', newValue);
                    filterTorrents(newValue);
                    updateSubtitle();
                    // Обновление selected в DOM
                    setTimeout(() => {
                        const modal = document.querySelector('.selectbox');
                        if (modal) {
                            modal.querySelectorAll('.selectbox-item').forEach(el => {
                                const text = el.querySelector('.selectbox-item__title')?.textContent;
                                if (text && ['WEB-DL', 'WEB-DLRip', 'Open Matte'].includes(text)) {
                                    el.classList.toggle('selected', text === item.title && newValue !== 'any');
                                }
                            });
                        }
                    }, 10);
                    return false; // Модалка не закрывается
                },
                onBack: () => {
                    Lampa.Select.hide();
                }
            };
            Lampa.Select.show(params);
        });
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
                    applyFilterOnLoad();
                }
            }
        }
    }
    // === Применение фильтра ===
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
        if (!window.appready) {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') start();
            });
            return;
        }
        hookHistoryDiv();
        setupUrlChange();
        applyFilterOnLoad();
    }
    start();
})();
