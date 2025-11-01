(function () {
    'use strict';

    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '1.9.0';

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
            const title = item.querySelector('.selectbox-item__title')?.textContent.toLowerCase() || '';
            item.style.display = titles.includes(title) ? 'block' : 'none';
        });
    }

    // === Открытие модального окна WEB-DL ===
    function openWebDLModal(mainItem) {
        const modalHtml = `
            <div class="selectbox__content layer--height">
                <div class="selectbox__head">
                    <div class="selector selectbox__back">Назад</div>
                    <div class="selectbox__title">WEB-DL</div>
                </div>
                <div class="selectbox__body layer--wheight">
                    <div class="scroll scroll--mask scroll--over">
                        <div class="scroll__content">
                            <div class="scroll__body">
                                <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dl">
                                    <div class="selectbox-item__title">WEB-DL</div>
                                    <div class="selectbox-item__checkbox"></div>
                                </div>
                                <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dlrip">
                                    <div class="selectbox-item__title">WEB-DLRip</div>
                                    <div class="selectbox-item__checkbox"></div>
                                </div>
                                <div class="selectbox-item selector selectbox-item--checkbox" data-value="openmatte">
                                    <div class="selectbox-item__title">Open Matte</div>
                                    <div class="selectbox-item__checkbox"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Создаём модалку
        const modal = document.createElement('div');
        modal.className = 'layer layer--active';
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);

        // Обновляем подзаголовок
        const updateSubtitle = (value) => {
            const titles = { 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
            mainItem.querySelector('.selectbox-item__subtitle').textContent = titles[value] || 'Любое';
        };

        // Восстанавливаем выбор
        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        if (saved !== 'any') {
            const active = modal.querySelector(`[data-value="${saved}"]`);
            if (active) active.classList.add('selected');
            updateSubtitle(saved);
        }

        // Обработчики
        modal.querySelectorAll('.selectbox-item--checkbox').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;

                modal.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                    el.classList.toggle('selected', el === item);
                });

                Lampa.Storage.set('tq_webdl_filter', value);
                filterTorrents(value);
                updateSubtitle(value);

                // Закрываем модалку
                modal.remove();
            });
        });

        // Кнопка "Назад"
        modal.querySelector('.selectbox__back').addEventListener('click', () => {
            modal.remove();
        });

        // Закрытие по клику вне
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // === Вставка в меню ===
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
        mainItem.innerHTML = `<div class="selectbox-item__title">WEB-DL</div><div class="selectbox-item__subtitle">Любое</div>`;

        // Клик — открываем модалку
        mainItem.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openWebDLModal(mainItem);
        });

        scrollBody.insertBefore(mainItem, insertBefore || null);

        // === Восстановление подзаголовка ===
        const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
        if (saved !== 'any') {
            const titles = { 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
            mainItem.querySelector('.selectbox-item__subtitle').textContent = titles[saved];
        }

        // === Сброс ===
        const resetBtn = Array.from(scrollBody.children).find(el =>
            el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
        );
        if (resetBtn && !resetBtn.dataset.tqHooked) {
            const old = resetBtn.onclick;
            resetBtn.onclick = function (e) {
                if (old) old.call(this, e);
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

    // Автозапуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    window[PLUGIN_NAME] = { version: VERSION };
})();
