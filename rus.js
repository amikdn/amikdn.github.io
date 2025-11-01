(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '1.7.0';

    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
    let isInjected = false;
    let menuObserver = null;

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

    // === Вставка в меню ===
    function injectWebDLFilter() {
        if (isInjected) return;

        const titleEl = document.querySelector('.selectbox__title');
        if (!titleEl || titleEl.textContent !== 'Фильтр') return;

        const scrollBody = titleEl.closest('.selectbox__content')?.querySelector('.scroll__body');
        if (!scrollBody) return;

        // Удаляем старое
        scrollBody.querySelectorAll('.tq-webdl-group').forEach(el => el.remove());

        // Ищем "Субтитры"
        const insertBefore = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Субтитры'
        );

        // === ГЛАВНЫЙ ПУНКТ (НАД ПОДПУНКТАМИ) ===
        const mainItem = document.createElement('div');
        mainItem.className = 'selectbox-item selector tq-webdl-group';
        mainItem.innerHTML = `<div class="selectbox-item__title">WEB-DL</div><div class="selectbox-item__subtitle">Любое</div>`;

        // === ПОДПУНКТЫ (НИЖЕ) ===
        const filters = [
            { title: 'WEB-DL', value: 'web-dl' },
            { title: 'WEB-DLRip', value: 'web-dlrip' },
            { title: 'Open Matte', value: 'openmatte' }
        ];

        const subItems = [];
        filters.forEach(f => {
            const sub = document.createElement('div');
            sub.className = 'selectbox-item selector selectbox-item--checkbox tq-webdl-group';
            sub.dataset.value = f.value;
            sub.innerHTML = `<div class="selectbox-item__title">${f.title}</div><div class="selectbox-item__checkbox"></div>`;
            sub.style.marginLeft = '20px';
            subItems.push(sub);
        });

        // === ВСТАВКА: ГЛАВНЫЙ → ПОДПУНКТЫ → ПЕРЕД "Субтитры" ===
        let current = insertBefore;
        scrollBody.insertBefore(mainItem, current);
        subItems.forEach(sub => {
            sub.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                // Снимаем выделение
                subItems.forEach(el => el.classList.toggle('selected', el === sub));

                // Сохраняем и фильтруем
                Lampa.Storage.set('tq_webdl_filter', sub.dataset.value);
                filterTorrents(sub.dataset.value);

                // Обновляем подзаголовок
                mainItem.querySelector('.selectbox-item__subtitle').textContent =
                    sub.querySelector('.selectbox-item__title').textContent;

                // ЗАКРЫВАЕМ МЕНЮ ЧЕРЕЗ КНОПКУ "НАЗАД"
                const backBtn = document.querySelector('.selectbox__head .selector[onclick*="back"]') ||
                                document.querySelector('.selectbox__head .selector');
                if (backBtn && backBtn.onclick) {
                    backBtn.onclick();
                } else if (backBtn) {
                    backBtn.click();
                }
            });
            scrollBody.insertBefore(sub, current);
        });

        // === Восстановление выбора ===
        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        if (saved !== 'any') {
            const active = subItems.find(el => el.dataset.value === saved);
            if (active) {
                active.classList.add('selected');
                mainItem.querySelector('.selectbox-item__subtitle').textContent =
                    active.querySelector('.selectbox-item__title').textContent;
            }
        }

        // === Сброс ===
        const resetBtn = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
        );
        if (resetBtn && !resetBtn.dataset.tqHooked) {
            const old = resetBtn.onclick;
            resetBtn.onclick = function (e) {
                if (old) old.call(this, e);
                subItems.forEach(el => el.classList.remove('selected'));
                mainItem.querySelector('.selectbox-item__subtitle').textContent = 'Любое';
                Lampa.Storage.set('tq_webdl_filter', 'any');
                filterTorrents('any');
            };
            resetBtn.dataset.tqHooked = '1';
        }

        isInjected = true;
    }

    // === Наблюдатель ===
    function startObserver() {
        if (menuObserver) return;

        menuObserver = new MutationObserver(() => {
            injectWebDLFilter();
        });

        menuObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
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
                    isInjected = false;
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
            setupUrlChange();
            startObserver();
            applyFilterOnLoad();
        } else {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') {
                    setupUrlChange();
                    startObserver();
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
