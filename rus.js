(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '12.0.0';

    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
    let isHooked = false;

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

    // === Добавление опций в модальное окно "Качество" ===
    function injectWebdlIntoQuality() {
        if (isHooked) return;
        isHooked = true;

        const originalShow = Lampa.Select.show;
        Lampa.Select.show = function (params) {
            // Проверяем, что это модалка "Качество"
            if (params.title === 'Качество' || (params.items && params.items[0]?.title?.includes('1080p'))) {
                const webdlItems = [
                    { title: 'WEB-DL', value: 'web-dl' },
                    { title: 'WEB-DLRip', value: 'web-dlrip' },
                    { title: 'Open Matte', value: 'openmatte' }
                ];

                // Добавляем в конец
                if (params.items) {
                    params.items = params.items.concat(webdlItems);
                }

                // Переопределяем onSelect
                const originalOnSelect = params.onSelect;
                params.onSelect = function (item) {
                    const isWebdl = webdlItems.some(i => i.value === item.value);
                    if (isWebdl) {
                        Lampa.Storage.set('tq_webdl_filter', item.value);
                        filterTorrents(item.value);

                        // Обновляем подзаголовок
                        const qualityItem = document.querySelector('[data-name="quality"]');
                        const subtitle = qualityItem?.querySelector('.selectbox-item__subtitle');
                        if (subtitle) subtitle.textContent = item.title;

                        Lampa.Modal.close();
                    } else if (originalOnSelect) {
                        originalOnSelect(item);
                    }
                };
            }

            // Вызываем оригинал
            return originalShow.call(this, params);
        };
    }

    // === Сброс при нажатии "Сбросить фильтр" ===
    function hookResetButton() {
        const observer = new MutationObserver(() => {
            const resetBtn = document.querySelector('.selectbox-item__title');
            if (resetBtn && resetBtn.textContent === 'Сбросить фильтр' && !resetBtn.dataset.tqHooked) {
                const old = resetBtn.onclick;
                resetBtn.onclick = function () {
                    if (old) old.apply(this, arguments);
                    Lampa.Storage.set('tq_webdl_filter', 'any');
                    filterTorrents('any');

                    const qualityItem = document.querySelector('[data-name="quality"]');
                    const subtitle = qualityItem?.querySelector('.selectbox-item__subtitle');
                    if (subtitle) subtitle.textContent = 'Любое';
                };
                resetBtn.dataset.tqHooked = '1';
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

        injectWebdlIntoQuality();
        hookResetButton();
        setupUrlChange();
        applyFilterOnLoad();

        // Принудительное обновление подзаголовка
        setTimeout(() => {
            const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
            const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
            const qualityItem = document.querySelector('[data-name="quality"]');
            const subtitle = qualityItem?.querySelector('.selectbox-item__subtitle');
            if (subtitle) subtitle.textContent = titles[saved];
        }, 1000);
    }

    start();
})();
