(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '10.0.0';

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

            if (!filtered.length && value !== 'any') {
                Lampa.Utils?.message?.('Нет: ' + value.toUpperCase());
            }
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

    // === Добавление опций в пункт "Качество" ===
    function enhanceQualityModal() {
        const qualityItem = document.querySelector('[data-name="quality"]');
        if (!qualityItem || qualityItem.dataset.tqHooked) return;

        const originalClick = qualityItem.onclick;
        qualityItem.onclick = function (e) {
            e.stopPropagation();

            // Оригинальные опции качества
            const originalItems = Lampa.Select.data.items || [];

            // Наши опции
            const webdlItems = [
                { title: 'WEB-DL', value: 'web-dl' },
                { title: 'WEB-DLRip', value: 'web-dlrip' },
                { title: 'Open Matte', value: 'openmatte' }
            ];

            // Объединяем
            const allItems = [
                ...originalItems,
                ...webdlItems
            ];

            Lampa.Select.show({
                title: 'Качество',
                items: allItems,
                onSelect: function (item) {
                    // Если выбрана наша опция
                    if (webdlItems.find(i => i.value === item.value)) {
                        Lampa.Storage.set('tq_webdl_filter', item.value);
                        filterTorrents(item.value);
                        // Обновляем подзаголовок "Качество"
                        const subtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                        if (subtitle) subtitle.textContent = item.title;
                    } else {
                        // Оригинальная логика Lampa
                        if (originalClick) {
                            const fakeEvent = { target: qualityItem };
                            originalClick.call(qualityItem, fakeEvent);
                        }
                    }
                },
                onBack: function () {
                    Lampa.Modal.close();
                }
            });
        };

        qualityItem.dataset.tqHooked = '1';
    }

    // === Мониторинг открытия меню фильтров ===
    function startMonitoring() {
        const observer = new MutationObserver(() => {
            if (document.querySelector('.selectbox__title')?.textContent === 'Фильтр') {
                enhanceQualityModal();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Также при смене URL
        setInterval(() => {
            if (document.querySelector('.selectbox__title')?.textContent === 'Фильтр') {
                enhanceQualityModal();
            }
        }, 1000);
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

        setupUrlChange();
        startMonitoring();
        applyFilterOnLoad();
    }

    start();
})();
