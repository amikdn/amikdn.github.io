(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.1.3',
        debug: false,
        settings: {
            enabled: true,
            quality_filter: 'any'
        }
    };

    // Функция форматирования даты
    function formatDate(dateString) {
        if (!dateString) return 'Неизвестно';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        } catch (e) {
            return 'Неизвестно';
        }
    }

    // Функция форматирования битрейта
    function formatBitrate(size, duration) {
        if (!size || !duration) return 'Неизвестно';
        try {
            const durationSeconds = parseDuration(duration);
            if (!durationSeconds) return 'Неизвестно';
            const bitrate = (size * 8) / durationSeconds / 1000000;
            return `${bitrate.toFixed(2)} Мбит/с`;
        } catch (e) {
            return 'Неизвестно';
        }
    }

    // Функция парсинга длительности
    function parseDuration(duration) {
        if (!duration) return 0;
        const parts = duration.split(':');
        if (parts.length < 3) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }

    // Функция получения данных торрентов
    function getTorrentsData() {
        let results = [];
        const possibleStorageKeys = ['torrents_data', 'torrent_data', 'results', 'torrent_results', 'torrents', 'torrent_list'];
        const possibleObjectKeys = ['data', 'results', 'items', 'list', 'torrents'];

        for (const key of possibleStorageKeys) {
            let data = Lampa.Storage.get(key, '[]');
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    data = [];
                }
            }
            if (Array.isArray(data) && data.length > 0) {
                results = data;
                break;
            }
        }

        if (!results.length && Lampa.Torrents) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Torrents[key] && Array.isArray(Lampa.Torrents[key]) && Lampa.Torrents[key].length > 0) {
                    results = Lampa.Torrents[key];
                    break;
                }
            }
        }

        if (!results.length && Lampa.Activity?.active?.()?.data) {
            for (const key of possibleObjectKeys) {
                if (Lampa.Activity.active().data[key] && Array.isArray(Lampa.Activity.active().data[key]) && Lampa.Activity.active().data[key].length > 0) {
                    results = Lampa.Activity.active().data[key];
                    break;
                }
            }
        }

        if (!results.length) {
            const torrentItems = document.querySelectorAll('.torrent-item');
            if (torrentItems.length > 0) {
                results = Array.from(torrentItems).map(item => {
                    const title = item.querySelector('.torrent-item__title')?.textContent || 'Без названия';
                    const ffprobe = {
                        video: {
                            width: parseInt(item.querySelector('.m-video')?.textContent?.split('x')[0]) || 0,
                            height: parseInt(item.querySelector('.m-video')?.textContent?.split('x')[1]) || 0
                        },
                        audio: {
                            channel_layout: item.querySelector('.m-channels')?.textContent || 'Неизвестно'
                        }
                    };
                    const voices = Array.from(item.querySelectorAll('.m-audio')).map(el => el.textContent);
                    const subtitles = Array.from(item.querySelectorAll('.m-subtitle')).map(el => el.textContent);
                    return {
                        Title: title,
                        PublishDate: item.querySelector('.torrent-item__date')?.textContent,
                        Tracker: item.querySelector('.torrent-item__tracker')?.textContent,
                        Size: parseFloat(item.querySelector('.torrent-item__size')?.textContent) * 1024 * 1024 * 1024 || 0,
                        Seeders: parseInt(item.querySelector('.torrent-item__seeds span')?.textContent) || 0,
                        Peers: parseInt(item.querySelector('.torrent-item__grabs span')?.textContent) || 0,
                        ffprobe: ffprobe,
                        languages: voices,
                        subtitles: subtitles,
                        element: item
                    };
                });
            }
        }

        return results;
    }

    // Функция добавления кнопки
    function addQualityButton(parentElement) {
        if (parentElement.querySelector('.quality-button')) return;

        const button = document.createElement('div');
        button.className = 'head__action selector quality-button';
        button.innerHTML = '<svg style="width: 24px; height: 24px;" viewBox="0 0 24 24"><path fill="currentColor" d="M7,3V6H5V8H7V11H9V8H11V6H9V3H7M12,6H15V9H18V6H21V4H12V6M15,13V15H18V18H15V20H21V13H15M7,13V16H5V18H7V21H9V18H11V16H9V13H7Z"/></svg>';
        button.title = 'Фильтр по качеству';

        const headActions = parentElement.querySelector('.head__actions') || parentElement;
        headActions.appendChild(button);

        button.addEventListener('click', function () {
            const qualityItem = parentElement.querySelector('.selectbox-item__title[data-quality]');
            showQualityMenu(qualityItem);
        });
    }

    // Функция показа меню качества
    function showQualityMenu(qualityItem) {
        Lampa.Select.show({
            title: 'Качество',
            items: [
                { title: 'Любое', subtitle: 'any' },
                { title: 'WEB-DLRip', subtitle: 'web-dlrip' },
                { title: 'WEB-DL', subtitle: 'web-dl' },
                { title: 'BDRip', subtitle: 'bdrip' }
            ],
            onSelect: function (item) {
                if (qualityItem) {
                    const subtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                    subtitle.textContent = item.title;
                }
                TorrentQuality.settings.quality_filter = item.subtitle;
                Lampa.Storage.set('torrent_quality_filter', item.subtitle);
                filterTorrents(item.subtitle);
            },
            onBack: function () {
                Lampa.Select.close();
            }
        });
    }

    // Функция инициализации плагина
    function startPlugin() {
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Качество Торрентов',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>' +
                  '<path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79-4-4-4z" fill="currentColor"/>' +
                  '</svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'torrent_quality',
            param: {
                name: 'quality_filter',
                type: 'select',
                values: {
                    any: 'Любое',
                    'web-dl': 'WEB-DL',
                    'web-dlrip': 'WEB-DLRip',
                    bdrip: 'BDRip'
                },
                default: 'any'
            },
            field: {
                name: 'Качество Торрентов',
                description: 'Выберите качество для фильтрации торрентов'
            },
            onRender: function (element) {
                const nativeElement = element instanceof jQuery ? element[0] : element;
                if (!(nativeElement instanceof HTMLElement)) return;

                const container = nativeElement.closest('.settings-param') || nativeElement.closest('.settings__content') || nativeElement.parentElement;
                if (!container) return;

                if (container.querySelector('.selectbox__content.torrent-quality-submenu')) return;

                const submenu = document.createElement('div');
                submenu.className = 'selectbox__content layer--height torrent-quality-submenu';
                submenu.style.height = '945px';
                submenu.style.display = 'none';
                submenu.innerHTML = `
                    <div class="selectbox__head">
                        <div class="selectbox__title">Качество</div>
                    </div>
                    <div class="selectbox__body layer--wheight" style="max-height: unset; height: 899.109px;">
                        <div class="scroll scroll--mask scroll--over">
                            <div class="scroll__content">
                                <div class="scroll__body" style="transform: translate3d(0px, 0px, 0px);">
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Сброс</div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dl">
                                        <div class="selectbox-item__title">WEB-DL</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dlrip">
                                        <div class="selectbox-item__title">WEB-DLRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="bdrip">
                                        <div class="selectbox-item__title">BDRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                container.appendChild(submenu);

                const title = container.querySelector('.settings-param__name') || nativeElement.querySelector('.settings-param__name') || nativeElement.querySelector('span') || nativeElement;
                if (title) {
                    title.addEventListener('click', function () {
                        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                        const settingsContent = container.closest('.settings__content') || document.querySelector('.settings__content');
                        if (settingsContent) {
                            settingsContent.querySelectorAll('.selectbox__content').forEach(content => {
                                if (content !== submenu) content.style.display = 'none';
                            });
                        }
                    });
                }

                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const value = item.dataset.value || item.querySelector('.selectbox-item__title').textContent.trim();
                        const filterValue = value === 'Сброс' ? 'any' : value.toLowerCase();
                        const subtitle = container.querySelector('.settings-param__value') || nativeElement.querySelector('.settings-param__value');
                        if (subtitle) {
                            subtitle.textContent = filterValue === 'any' ? 'Любое' : filterValue.toUpperCase();
                        }

                        if (filterValue !== 'any') {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === filterValue);
                            });
                        } else {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                        }

                        TorrentQuality.settings.quality_filter = filterValue;
                        Lampa.Storage.set('torrent_quality_filter', filterValue);
                        filterTorrents(filterValue);
                        submenu.style.display = 'none';
                    });
                });
            },
            onChange: function (value) {
                TorrentQuality.settings.quality_filter = value;
                Lampa.Storage.set('torrent_quality_filter', value);
                filterTorrents(value);
            }
        });

        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'render' && e.name === 'torrents') {
                const element = e.element instanceof jQuery ? e.element[0] : e.element;
                if (!element) return;

                const selectbox = element.querySelector('.selectbox__content');
                if (!selectbox) return;

                if (!selectbox.querySelector('.selectbox-item__title[data-quality]')) {
                    const qualityItem = document.createElement('div');
                    qualityItem.className = 'selectbox-item selector';
                    qualityItem.innerHTML = `<div class="selectbox-item__title" data-quality="true">Качество</div><div class="selectbox-item__subtitle">${TorrentQuality.settings.quality_filter === 'any' ? 'Любое' : TorrentQuality.settings.quality_filter.toUpperCase()}</div>`;
                    const scrollBody = selectbox.querySelector('.scroll__body');
                    if (scrollBody && scrollBody.children[1]) {
                        scrollBody.insertBefore(qualityItem, scrollBody.children[1]);
                    } else {
                        scrollBody.appendChild(qualityItem);
                    }

                    qualityItem.addEventListener('click', function () {
                        showQualityMenu(qualityItem);
                    });
                }

                addQualityButton(element);
            }
        });

        Lampa.Listener.follow('selectbox', function (e) {
            if (e.type === 'select' && e.item.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр') {
                const qualityItem = document.querySelector('.selectbox-item__title[data-quality]');
                if (qualityItem) {
                    qualityItem.nextElementSibling.textContent = 'Любое';
                    TorrentQuality.settings.quality_filter = 'any';
                    Lampa.Storage.set('torrent_quality_filter', 'any');
                    filterTorrents('any');
                }
            }
        });

        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');

        function applyFilterOnTorrentsLoad() {
            if (TorrentQuality.settings.enabled) {
                filterTorrents(TorrentQuality.settings.quality_filter);
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'active' && (e.data?.action === 'mytorrents' || e.data?.action === 'torrents')) {
                applyFilterOnTorrentsLoad();
            }
        });

        Lampa.Listener.follow('torrents', function (e) {
            if (e.type === 'load' || e.type === 'update' || e.type === 'torrent_load' || e.type === 'torrent_update') {
                applyFilterOnTorrentsLoad();
            }
        });

        if (window.appready) {
            applyFilterOnTorrentsLoad();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    applyFilterOnTorrentsLoad();
                }
            });
        }
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                               document.querySelector('.menu__item[data-action="torrents"].active') ||
                               document.querySelector('.activity--active .torrent-list') ||
                               Lampa.Activity?.active?.()?.data?.action === 'mytorrents' ||
                               Lampa.Activity?.active?.()?.data?.action === 'torrents';
        if (!isTorrentsPage) return;

        // Сбрасываем текущий фильтр
        const items = document.querySelectorAll('.torrent-item');
        items.forEach(item => {
            item.style.display = '';
        });

        let results = getTorrentsData();
        if (!results || !Array.isArray(results) || results.length === 0) {
            Lampa.Utils.message?.('Нет данных для фильтрации торрентов.') || alert('Нет данных для фильтрации торрентов.');
            return;
        }

        if (filterValue && filterValue !== 'any') {
            const filterLower = filterValue.toLowerCase();
            results.forEach(result => {
                const title = result.Title || result.title || result.Name || result.name || '';
                if (!title || typeof title !== 'string' || !result.element) return;
                const titleLower = title.toLowerCase().replace(/[- ]/g, '');
                let shouldShow = false;
                if (filterLower === 'web-dl') {
                    shouldShow = (titleLower.includes('webdl') || titleLower.includes('web dl')) && !titleLower.includes('webdlrip') && !titleLower.includes('web dlrip');
                } else if (filterLower === 'web-dlrip') {
                    shouldShow = titleLower.includes('webdlrip') || titleLower.includes('web dlrip') || titleLower.includes('webdl rip');
                } else if (filterLower === 'bdrip') {
                    shouldShow = titleLower.includes('bdrip') || titleLower.includes('bd rip');
                }
                if (!shouldShow) {
                    result.element.style.display = 'none';
                }
            });
        }

        if (document.querySelectorAll('.torrent-item:not([style*="display: none"])').length === 0) {
            Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}.`) || alert(`Не найдено торрентов для фильтра: ${filterValue}.`);
        }
    }

    // Исправление Canvas
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'canvas') {
            const originalGetContext = element.getContext;
            element.getContext = function (contextType, attributes) {
                const attrs = attributes || {};
                attrs.willReadFrequently = true;
                return originalGetContext.call(this, contextType, attrs);
            };
        }
        return element;
    };

    // Инициализация плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Качество Торрентов',
        version: '1.1.3',
        description: 'Фильтрация торрентов по качеству (WEB-DL, WEB-DLRip, BDRip) для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;
})();
