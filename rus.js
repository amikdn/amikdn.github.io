(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '9.0.0';

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

    // === Модальное окно ===
    function openWebDLModal() {
        const options = [
            { title: 'Любое', value: 'any' },
            { title: 'WEB-DL', value: 'web-dl' },
            { title: 'WEB-DLRip', value: 'web-dlrip' },
            { title: 'Open Matte', value: 'openmatte' }
        ];

        Lampa.Select.show({
            title: 'WEB-DL',
            items: options,
            onSelect: function (item) {
                Lampa.Storage.set('tq_webdl_filter', item.value);
                filterTorrents(item.value);
                updateSubtitle(item.title);
            }
        });
    }

    // === Обновление подзаголовка ===
    function updateSubtitle(text) {
        const el = document.querySelector('[data-name="webdl"] .selectbox-item__subtitle');
        if (el) el.textContent = text;
    }

    // === Добавление в систему фокуса (100% ПУЛЬТ) ===
    function addToController() {
        if (!Lampa.Controller || !Lampa.Controller.add) return;

        Lampa.Controller.add('filter', {
            toggle: function () {
                const item = document.querySelector('[data-name="webdl"]');
                if (item) {
                    Lampa.Controller.focus(item);
                    openWebDLModal();
                }
            },
            right: function () {
                Lampa.Controller.move('right');
            },
            left: function () {
                Lampa.Controller.move('left');
            },
            up: function () {
                Lampa.Controller.move('up');
            },
            down: function () {
                Lampa.Controller.move('down');
            },
            back: function () {
                Lampa.Activity.backward();
            }
        });
    }

    // === Вставка в меню (только DOM) ===
    function injectWebDLItem() {
        const titleEl = document.querySelector('.selectbox__title');
        if (!titleEl || titleEl.textContent !== 'Фильтр') return;

        const scrollBody = titleEl.closest('.selectbox__content')?.querySelector('.scroll__body');
        if (!scrollBody || scrollBody.querySelector('[data-name="webdl"]')) return;

        const insertBefore = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Субтитры'
        ) || null;

        const mainItem = document.createElement('div');
        mainItem.className = 'selectbox-item selector';
        mainItem.dataset.name = 'webdl';
        mainItem.dataset.type = 'selectbox';
        mainItem.dataset.action = 'select';
        mainItem.innerHTML = `
            <div class="selectbox-item__title">WEB-DL</div>
            <div class="selectbox-item__subtitle">Любое</div>
        `;

        mainItem.addEventListener('click', function (e) {
            e.stopPropagation();
            openWebDLModal();
        });

        scrollBody.insertBefore(mainItem, insertBefore);

        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
        updateSubtitle(titles[saved]);

        // Сброс
        const resetBtn = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
        );
        if (resetBtn && !resetBtn.dataset.tqHooked) {
            const old = resetBtn.onclick;
            resetBtn.onclick = function () {
                if (old) old.apply(this, arguments);
                updateSubtitle('Любое');
                Lampa.Storage.set('tq_webdl_filter', 'any');
                filterTorrents('any');
            };
            resetBtn.dataset.tqHooked = '1';
        }

        // Добавляем в контроллер
        addToController();
    }

    // === Мониторинг меню ===
    function startMonitoring() {
        const observer = new MutationObserver(() => {
            if (document.querySelector('.selectbox__title')?.textContent === 'Фильтр') {
                injectWebDLItem();
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

        setupUrlChange();
        startMonitoring();
        applyFilterOnLoad();
    }

    start();
})();
