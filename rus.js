(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '2.4.0';

    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
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

    // === Модальное окно ===
    function openWebDLModal(mainItem) {
        const options = [
            { title: 'Любое', value: 'any' },
            { title: 'WEB-DL', value: 'web-dl' },
            { title: 'WEB-DLRip', value: 'web-dlrip' },
            { title: 'Open Matte', value: 'openmatte' }
        ];

        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');

        Lampa.Select.show({
            title: 'WEB-DL',
            items: options,
            selected: options.findIndex(o => o.value === saved),
            onSelect: (item) => {
                Lampa.Storage.set('tq_webdl_filter', item.value);
                filterTorrents(item.value);
                mainItem.querySelector('.selectbox-item__subtitle').textContent = item.title;
            },
            onBack: () => {
                Lampa.Modal.close();
            }
        });
    }

    // === Вставка в меню (ПУЛЬТ РАБОТАЕТ) ===
    function injectWebDLFilter() {
        const titleEl = document.querySelector('.selectbox__title');
        if (!titleEl || titleEl.textContent !== 'Фильтр') return;

        const scrollBody = titleEl.closest('.selectbox__content')?.querySelector('.scroll__body');
        if (!scrollBody) return;

        if (scrollBody.querySelector('.tq-webdl-main')) return;

        const insertBefore = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Субтитры'
        );

        // === Главный пункт ===
        const mainItem = document.createElement('div');
        mainItem.className = 'selectbox-item selector tq-webdl-main';
        mainItem.setAttribute('tabindex', '0'); // ← КЛЮЧЕВОЕ ДЛЯ ПУЛЬТА
        mainItem.innerHTML = `
            <div class="selectbox-item__title">WEB-DL</div>
            <div class="selectbox-item__subtitle">Любое</div>
        `;

        // === ПУЛЬТ: Enter открывает модалку ===
        mainItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                openWebDLModal(mainItem);
            }
        });

        // === Клик мышью (опционально) ===
        mainItem.addEventListener('click', (e) => {
            e.stopPropagation();
            openWebDLModal(mainItem);
        });

        // === Фокус при вставке ===
        setTimeout(() => {
            mainItem.focus();
        }, 100);

        scrollBody.insertBefore(mainItem, insertBefore || null);

        // === Восстановление подзаголовка ===
        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
        mainItem.querySelector('.selectbox-item__subtitle').textContent = titles[saved];

        // === Сброс ===
        const resetBtn = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
        );
        if (resetBtn && !resetBtn.dataset.tqHooked) {
            const old = resetBtn.onclick;
            resetBtn.onclick = function () {
                if (old) old.apply(this, arguments);
                mainItem.querySelector('.selectbox-item__subtitle').textContent = 'Любое';
                Lampa.Storage.set('tq_webdl_filter', 'any');
                filterTorrents('any');
            };
            resetBtn.dataset.tqHooked = '1';
        }
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

    start();
})();
