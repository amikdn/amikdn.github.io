(function () {
    'use strict';
    const PLUGIN_NAME = 'torrent_quality';
    const VERSION = '23.0.0';
    let originalTorrents = [];
    let allTorrents = [];
    let currentMovieTitle = null;
    let lastUrl = window.location.search;
    let isHooked = false;
    const titles = { 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
    const titlesReverse = Object.fromEntries(Object.entries(titles).map(([k, v]) => [v, k]));
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
    function filterTorrents(filters) {
        try {
            if (!Array.isArray(filters)) filters = [];
            if (!originalTorrents.length) {
                originalTorrents = getTorrentsData();
                allTorrents = [...originalTorrents];
            }
            let filtered = allTorrents;
            if (filters.length) {
                filtered = allTorrents.filter(result => {
                    const title = result.Title ? result.Title.toLowerCase().replace(/[- ]/g, '') : '';
                    return filters.some(lower => {
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
        const titlesLower = results.map(r => r.Title.toLowerCase());
        items.forEach(item => {
            const titleEl = item.querySelector('.torrent-item__title');
            const title = titleEl ? titleEl.textContent.toLowerCase() : '';
            item.style.display = titlesLower.includes(title) ? 'block' : 'none';
        });
    }
    // === ТОГГЛ + МОДАЛКА ОСТАЁТСЯ ОТКРЫТОЙ ===
    function injectWebdlIntoQuality() {
        if (isHooked) return;
        isHooked = true;
        const originalShow = Lampa.Select.show;
        Lampa.Select.show = function (params) {
            if (params.title === 'Качество' || (params.items && params.items[0]?.title?.match(/1080p|720p|4K/i))) {
                const currentValues = Lampa.Storage.get('tq_webdl_filters', []);
                const webdlItems = [
                    { title: 'WEB-DL', value: 'web-dl', selected: currentValues.includes('web-dl') },
                    { title: 'WEB-DLRip', value: 'web-dlrip', selected: currentValues.includes('web-dlrip') },
                    { title: 'Open Matte', value: 'openmatte', selected: currentValues.includes('openmatte') }
                ];
                if (Array.isArray(params.items)) {
                    params.items = params.items.concat(webdlItems);
                }
                const originalOnSelect = params.onSelect || function() {};
                params.onSelect = function (item) {
                    const isWebdl = ['web-dl', 'web-dlrip', 'openmatte'].includes(item.value);
                    if (isWebdl) {
                        let filters = Lampa.Storage.get('tq_webdl_filters', []);
                        if (filters.includes(item.value)) {
                            filters = filters.filter(v => v !== item.value);
                        } else {
                            filters.push(item.value);
                        }
                        Lampa.Storage.set('tq_webdl_filters', filters);
                        filterTorrents(filters);
                        // Обновляем подзаголовок
                        setTimeout(() => {
                            const qualityItem = document.querySelector('[data-name="quality"]');
                            const subtitle = qualityItem?.querySelector('.selectbox-item__subtitle');
                            if (subtitle) {
                                subtitle.textContent = filters.length ? filters.map(v => titles[v]).join(', ') : 'Любое';
                            }
                        }, 50);
                        // Обновляем checked в DOM и удаляем selected
                        setTimeout(() => {
                            const modal = document.querySelector('.selectbox');
                            if (modal) {
                                modal.querySelectorAll('.selectbox-item').forEach(el => {
                                    const text = el.querySelector('.selectbox-item__title')?.textContent;
                                    if (text && titlesReverse[text]) {
                                        el.classList.remove('selected');
                                        if (filters.includes(titlesReverse[text])) {
                                            el.classList.add('selectbox-item--checked');
                                        } else {
                                            el.classList.remove('selectbox-item--checked');
                                        }
                                    }
                                });
                                // Делаем модалку видимой
                                modal.style.display = 'block';
                                modal.style.opacity = '1';
                                modal.style.visibility = 'visible';
                            }
                        }, 10);
                        return false;
                    }
                    return originalOnSelect(item);
                };
            }
            const result = originalShow.call(this, params);
            // Добавляем стиль checkbox после рендера и удаляем selected
            setTimeout(() => {
                const modal = document.querySelector('.selectbox');
                if (modal) {
                    modal.querySelectorAll('.selectbox-item').forEach(el => {
                        const text = el.querySelector('.selectbox-item__title')?.textContent.trim();
                        if (text && ['WEB-DL', 'WEB-DLRip', 'Open Matte'].includes(text)) {
                            el.classList.add('selectbox-item--checkbox');
                            el.classList.remove('selected');
                            if (!el.querySelector('.selectbox-item__checkbox')) {
                                const checkbox = document.createElement('div');
                                checkbox.className = 'selectbox-item__checkbox';
                                el.appendChild(checkbox);
                            }
                            const filters = Lampa.Storage.get('tq_webdl_filters', []);
                            if (filters.includes(titlesReverse[text])) {
                                el.classList.add('selectbox-item--checked');
                            } else {
                                el.classList.remove('selectbox-item--checked');
                            }
                        }
                    });
                }
            }, 50);
            return result;
        };
    }
    // === Сброс фильтра ===
    function hookResetButton() {
        const observer = new MutationObserver(() => {
            const resetBtn = Array.from(document.querySelectorAll('.selectbox-item__title'))
                .find(el => el.textContent === 'Сбросить фильтр');
            if (resetBtn && !resetBtn.dataset.tqHooked) {
                const old = resetBtn.onclick;
                resetBtn.onclick = function () {
                    if (old) old.apply(this, arguments);
                    Lampa.Storage.set('tq_webdl_filters', []);
                    filterTorrents([]);
                    setTimeout(() => {
                        const qualityItem = document.querySelector('[data-name="quality"]');
                        const subtitle = qualityItem?.querySelector('.selectbox-item__subtitle');
                        if (subtitle) subtitle.textContent = 'Любое';
                    }, 100);
                    // Убираем класс checked и selected
                    setTimeout(() => {
                        document.querySelectorAll('.selectbox-item').forEach(el => {
                            const text = el.querySelector('.selectbox-item__title')?.textContent;
                            if (text && ['WEB-DL', 'WEB-DLRip', 'Open Matte'].includes(text)) {
                                el.classList.remove('selectbox-item--checked');
                                el.classList.remove('selected');
                            }
                        });
                    }, 50);
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
            filterTorrents(Lampa.Storage.get('tq_webdl_filters', []));
        } else {
            const container = document.querySelector('.torrent-list');
            if (container) {
                const obs = new MutationObserver(() => {
                    if (document.querySelectorAll('.torrent-item').length) {
                        obs.disconnect();
                        filterTorrents(Lampa.Storage.get('tq_webdl_filters', []));
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
        setTimeout(() => {
            const saved = Lampa.Storage.get('tq_webdl_filters', []);
            const qualityItem = document.querySelector('[data-name="quality"]');
            const subtitle = qualityItem?.querySelector('.selectbox-item__subtitle');
            if (subtitle) subtitle.textContent = saved.length ? saved.map(v => titles[v]).join(', ') : 'Любое';
        }, 1000);
    }
    start();
})();
