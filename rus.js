(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '1.3.0';

    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
    let menuObserver = null;
    let isInjected = false;

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
        return true;
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

            if (!filtered.length) {
                Lampa.Utils.message?.(`Нет: ${value.toUpperCase()}`) || alert('Ничего не найдено');
            }
            renderResults(filtered);
        } catch (e) {
            console.error('[TQ] Error:', e);
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

    // === Вставка в меню ===
    function injectWebDLFilter() {
        const scrollBody = document.querySelector('.selectbox__content .scroll__body');
        if (!scrollBody || isInjected) return;

        // Удаляем старое
        scrollBody.querySelectorAll('.tq-webdl-group').forEach(el => el.remove());

        // Ищем, куда вставить — после "Dolby Vision" или перед "Субтитры"
        const insertBeforeItem = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Субтитры'
        ) || null;

        // === Создаём главный пункт "WEB-DL" ===
        const mainItem = document.createElement('div');
        mainItem.className = 'selectbox-item selector tq-webdl-group';
        mainItem.innerHTML = `
            <div class="selectbox-item__title">WEB-DL</div>
            <div class="selectbox-item__subtitle">Любое</div>
        `;

        // === Создаём подменю ===
        const subItems = [
            { title: 'WEB-DL', value: 'web-dl' },
            { title: 'WEB-DLRip', value: 'web-dlrip' },
            { title: 'Open Matte', value: 'openmatte' }
        ];

        subItems.forEach(filter => {
            const sub = document.createElement('div');
            sub.className = 'selectbox-item selector selectbox-item--checkbox tq-webdl-group';
            sub.dataset.value = filter.value;
            sub.innerHTML = `
                <div class="selectbox-item__title">${filter.title}</div>
                <div class="selectbox-item__checkbox"></div>
            `;

            // Клик
            sub.addEventListener('click', () => {
                const value = sub.dataset.value;

                // Снимаем выделение
                scrollBody.querySelectorAll('.tq-webdl-group.selectbox-item--checkbox').forEach(el => {
                    el.classList.toggle('selected', el === sub);
                });

                // Сохраняем
                Lampa.Storage.set('tq_webdl_filter', value);
                filterTorrents(value);

                // Обновляем подзаголовок
                mainItem.querySelector('.selectbox-item__subtitle').textContent = filter.title;

                // Закрываем меню
                const menu = scrollBody.closest('.selectbox__content');
                if (menu) menu.style.display = 'none';
            });

            scrollBody.insertBefore(sub, insertBeforeItem);
        });

        // Вставляем главный пункт
        scrollBody.insertBefore(mainItem, insertBeforeItem);

        // === Восстановление выбора ===
        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        if (saved !== 'any') {
            const active = scrollBody.querySelector(`.tq-webdl-group[data-value="${saved}"]`);
            if (active) {
                active.classList.add('selected');
                mainItem.querySelector('.selectbox-item__subtitle').textContent =
                    active.querySelector('.selectbox-item__title').textContent;
            }
        }

        // === Перехват "Сбросить фильтр" ===
        const resetBtn = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
        );
        if (resetBtn && !resetBtn.dataset.tqHooked) {
            const oldClick = resetBtn.onclick;
            resetBtn.onclick = function () {
                if (oldClick) oldClick.apply(this, arguments);

                scrollBody.querySelectorAll('.tq-webdl-group.selectbox-item--checkbox').forEach(el => {
                    el.classList.remove('selected');
                });
                mainItem.querySelector('.selectbox-item__subtitle').textContent = 'Любое';
                Lampa.Storage.set('tq_webdl_filter', 'any');
                filterTorrents('any');
            };
            resetBtn.dataset.tqHooked = '1';
        }

        isInjected = true;
    }

    // === Наблюдение за меню ===
    function startMenuObserver() {
        if (menuObserver) return;

        menuObserver = new MutationObserver(() => {
            const menu = document.querySelector('.selectbox__content');
            if (menu && menu.style.display !== 'none' && !isInjected) {
                injectWebDLFilter();
            }
        });

        menuObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // === URL смена ===
    function setupUrlChange() {
        const push = history.pushState;
        const replace = history.replaceState;
        history.pushState = (...args) => { push.apply(this, args); handleUrlChange(); };
        history.replaceState = (...args) => { replace.apply(this, args); handleUrlChange(); };
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

    // === Применение при загрузке ===
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
            setupUrlChange();
            startMenuObserver();
            applyFilterOnLoad();
        } else {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') {
                    setupUrlChange();
                    startMenuObserver();
                    applyFilterOnLoad();
                }
            });
        }
    }

    // Автозапуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    window[PLUGIN_NAME] = { version: VERSION };
})();
