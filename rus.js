(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '1.2.0';

    // Хранилище
    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
    let menuObserver = null;
    let isMenuInjected = false;

    // === Получение данных торрентов ===
    function getTorrentsData() {
        const items = document.querySelectorAll('.torrent-item');
        return Array.from(items).map(item => {
            const title = item.querySelector('.torrent-item__title')?.textContent.trim() || 'Без названия';
            return {
                Title: title,
                MagnetUri: item.querySelector('a[href*="magnet:"]')?.href || ''
            };
        });
    }

    // === Сброс фильтра ===
    function resetFilter() {
        allTorrents = [...originalTorrents];
        if (!allTorrents.length) {
            allTorrents = getTorrentsData();
            originalTorrents = [...allTorrents];
        }
        Lampa.Storage.set('tq_filter', 'any');
        return true;
    }

    // === Очистка ===
    function clearTorrents() {
        originalTorrents = [];
        allTorrents = [];
    }

    // === Фильтрация ===
    function filterTorrents(filterValue) {
        try {
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
            }

            if (filterValue === 'any') {
                renderResults(allTorrents);
                return;
            }

            const lower = filterValue.toLowerCase();
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

            if (!filtered.length && filterValue !== 'any') {
                Lampa.Utils.message?.(`Нет торрентов: ${filterValue.toUpperCase()}`) || alert('Ничего не найдено');
            }

            renderResults(filtered);
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

    // === Вставка в меню фильтров ===
    function injectIntoFilterMenu() {
        const menu = document.querySelector('.selectbox__content .scroll__body');
        if (!menu || isMenuInjected) return;

        // Ищем пункт "Качество"
        const qualityItem = Array.from(menu.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Качество'
        );
        if (!qualityItem) return;

        // Удаляем старое
        menu.querySelectorAll('.tq-filter-item').forEach(el => el.remove());

        // Создаём чекбоксы
        const filters = [
            { title: 'WEB-DL', value: 'web-dl' },
            { title: 'WEB-DLRip', value: 'web-dlrip' },
            { title: 'Open Matte', value: 'openmatte' }
        ];

        let insertAfter = qualityItem;
        filters.forEach(f => {
            const div = document.createElement('div');
            div.className = 'selectbox-item selector selectbox-item--checkbox tq-filter-item';
            div.dataset.value = f.value;
            div.innerHTML = `
                <div class="selectbox-item__title">${f.title}</div>
                <div class="selectbox-item__checkbox"></div>
            `;
            menu.insertBefore(div, insertAfter.nextSibling);
            insertAfter = div;

            // Клик
            div.addEventListener('click', () => {
                const value = div.dataset.value;

                // Снимаем выделение
                menu.querySelectorAll('.tq-filter-item').forEach(el => {
                    el.classList.toggle('selected', el === div);
                });

                // Сохраняем
                Lampa.Storage.set('tq_filter', value);
                filterTorrents(value);

                // Обновляем подзаголовок "Качество"
                const subtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                if (subtitle) subtitle.textContent = f.title;

                // Закрываем меню
                const content = menu.closest('.selectbox__content');
                if (content) content.style.display = 'none';
            });
        });

        // Восстанавливаем выбор
        const saved = Lampa.Storage.get('tq_filter', 'any');
        if (saved !== 'any') {
            const active = menu.querySelector(`.tq-filter-item[data-value="${saved}"]`);
            if (active) {
                active.classList.add('selected');
                const subtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                if (subtitle) subtitle.textContent = active.querySelector('.selectbox-item__title').textContent;
            }
        }

        // Перехват "Сбросить фильтр"
        const resetBtn = Array.from(menu.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
        );
        if (resetBtn && !resetBtn.dataset.tqHooked) {
            const oldClick = resetBtn.onclick;
            resetBtn.onclick = function () {
                if (oldClick) oldClick.apply(this, arguments);
                menu.querySelectorAll('.tq-filter-item').forEach(el => el.classList.remove('selected'));
                const subtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                if (subtitle) subtitle.textContent = 'Любое';
                Lampa.Storage.set('tq_filter', 'any');
                filterTorrents('any');
            };
            resetBtn.dataset.tqHooked = '1';
        }

        isMenuInjected = true;
    }

    // === Наблюдение за открытием меню ===
    function startMenuObserver() {
        if (menuObserver) return;

        menuObserver = new MutationObserver(() => {
            const menu = document.querySelector('.selectbox__content');
            if (menu && menu.style.display !== 'none') {
                injectIntoFilterMenu();
            }
        });

        const target = document.body;
        menuObserver.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // === URL изменение ===
    function setupUrlChange() {
        const push = history.pushState;
        const replace = history.replaceState;

        history.pushState = function () {
            push.apply(this, arguments);
            handleUrlChange();
        };
        history.replaceState = function () {
            replace.apply(this, arguments);
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

    // === Применение при загрузке ===
    function applyFilterOnLoad() {
        clearTorrents();
        const torrents = getTorrentsData();
        if (torrents.length) {
            const filter = Lampa.Storage.get('tq_filter', 'any');
            filterTorrents(filter);
        } else {
            const container = document.querySelector('.torrent-list');
            if (container) {
                const obs = new MutationObserver(() => {
                    if (document.querySelectorAll('.torrent-item').length) {
                        obs.disconnect();
                        const filter = Lampa.Storage.get('tq_filter', 'any');
                        filterTorrents(filter);
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

    // === Автозапуск ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // Экспорт (если нужно)
    window[PLUGIN_NAME] = { version: VERSION };
})();
