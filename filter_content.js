(function() {
    'use strict';

    if (window.contentFilterInitialized) return;
    window.contentFilterInitialized = true;

    const translations = {
        content_filters: 'Фильтр контента',
        content_filters_desc: 'Настройка отображения карточек по фильтрам',
        asian_filter: 'Убрать азиатский контент',
        asian_filter_desc: 'Скрываем карточки азиатского происхождения',
        language_filter: 'Убрать контент на другом языке',
        language_filter_desc: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию',
        rating_filter: 'Убрать низкорейтинговый контент',
        rating_filter_desc: 'Скрываем карточки с рейтингом ниже 6.0',
        history_filter: 'Убрать просмотренный контент',
        history_filter_desc: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть'
    };

    const filterSettings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    const contentFilters = {
        filters: [
            function(items) {
                if (!filterSettings.asian_filter_enabled) return items;
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    const lang = item.original_language.toLowerCase();
                    const asianLanguages = [
                        'ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn',
                        'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo',
                        'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'
                    ];
                    return asianLanguages.indexOf(lang) === -1;
                });
            },
            function(items) {
                if (!filterSettings.language_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    const defaultLang = Lampa.Lang.translate('language') || 'ru';
                    const originalTitle = item.original_title || item.original_name;
                    const title = item.title || item.name;
                    return item.original_language === defaultLang || title !== originalTitle;
                });
            },
            function(items) {
                if (!filterSettings.rating_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    const isSpecialContent = item.media_type === 'movie' ||
                                             item.type === 'Trailer' ||
                                             item.source === 'YouTube' ||
                                             (item.card && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecialContent) return true;
                    return item.vote_average && item.vote_average >= 6;
                });
            },
            function(items) {
                if (!filterSettings.history_filter_enabled) return items;
                const history = Lampa.Storage.get('history', '{}');
                const favorites = Lampa.Storage.cache('favorite', 300, []);
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    let mediaType = item.media_type || (item.seasons ? 'tv' : 'movie');
                    const favoriteData = Lampa.Favorite.check(item);
                    const isFavorite = !!favoriteData && !!favoriteData.favorite;
                    const isThrown = !!favoriteData && favoriteData.thrown;
                    if (isThrown) return false;
                    if (!isFavorite) return true;
                    if (isFavorite && mediaType === 'movie') return false;
                    const historyEpisodes = getHistoryEpisodes(item.id, history);
                    const favoriteEpisodes = getFavoriteEpisodes(item.id, favorites);
                    const allEpisodes = mergeEpisodes(historyEpisodes, favoriteEpisodes);
                    return !isFullyWatched(item.original_title || item.original_name, allEpisodes);
                });
            }
        ],
        apply: function(items) {
            let filteredItems = Lampa.Arrays.clone(items);
            for (let i = 0; i < this.filters.length; i++) {
                filteredItems = this.filters[i](filteredItems);
            }
            return filteredItems;
        }
    };

    function getHistoryEpisodes(id, history) {
        const historyItem = history.filter(item => item.id === id && Array.isArray(item.episodes) && item.episodes.length > 0)[0];
        if (!historyItem) return [];
        const episodes = historyItem.episodes.filter(ep => 
            ep.season_number > 0 && ep.episode_number > 0 && ep.air_date && new Date(ep.air_date) < new Date()
        );
        if (episodes.length === 0) return [];
        const result = [];
        for (let i = 0; i < episodes.length; i++) {
            const episode = episodes[i];
            for (let epNum = 1; epNum <= episode.episode_number; epNum++) {
                result.push({
                    season_number: episode.season_number,
                    episode_number: epNum
                });
            }
        }
        return result;
    }

    function getFavoriteEpisodes(id, favorites) {
        const favoriteItem = favorites.filter(item => item.id === id)[0] || {};
        if (!Array.isArray(favoriteItem.items) || favoriteItem.items.length === 0) return [];
        return favoriteItem.items.filter(item => 
            item.season_number > 0 && item.air_date && new Date(item.air_date) < new Date()
        );
    }

    function mergeEpisodes(historyEpisodes, favoriteEpisodes) {
        const allEpisodes = historyEpisodes.concat(favoriteEpisodes);
        const uniqueEpisodes = [];
        for (let i = 0; i < allEpisodes.length; i++) {
            const episode = allEpisodes[i];
            let exists = false;
            for (let j = 0; j < uniqueEpisodes.length; j++) {
                if (uniqueEpisodes[j].season_number === episode.season_number && 
                    uniqueEpisodes[j].episode_number === episode.episode_number) {
                    exists = true;
                    break;
                }
            }
            if (!exists) uniqueEpisodes.push(episode);
        }
        return uniqueEpisodes;
    }

    function isFullyWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let i = 0; i < episodes.length; i++) {
            const episode = episodes[i];
            const key = Lampa.Utils.hash([episode.season_number, episode.season_number > 10 ? ':' : '', episode.episode_number, title].join(''));
            const timeline = Lampa.Timeline.view(key);
            if (timeline.percent === 0) return false;
        }
        return true;
    }

    function shouldApplyFilters(url) {
        return true;
    }

    function shouldShowMoreButton(data) {
        return !!data && 
               Array.isArray(data.results) && 
               data.original_length !== data.results.length && 
               data.page === 1 && 
               !!data.total_pages && 
               data.total_pages > 1;
    }

    function findClosestElement(element, selector) {
        if (element && element.matches && element.matches(selector)) return element;
        let current = element;
        while (current && current !== document) {
            if (current.msMatchesSelector && current.msMatchesSelector(selector)) return current;
            if (current.webkitMatchesSelector && current.webkitMatchesSelector(selector)) return current;
            if (current.mozMatchesSelector && current.mozMatchesSelector(selector)) return current;
            if (current.oMatchesSelector && current.oMatchesSelector(selector)) return current;
            if (current.className && current.className.indexOf(selector.replace('.', '')) !== -1) return current;
            current = current.parentElement || current.parentNode;
        }
        return null;
    }

    function addEventListenerExtension() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Manifest.plugins, 'open', {
            get: function() {
                return this._open;
            },
            set: function(callback) {
                this._open = function() {
                    callback.apply(this);
                    Lampa.Listener.send('open', { type: 'open', object: this });
                }.bind(this);
            }
        });
    }

    function initFilterSettings() {
        filterSettings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        filterSettings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        filterSettings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
        filterSettings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);
    }

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'content_filters',
            name: translations.content_filters
        });

        Lampa.Listener.follow('settings_component', function(e) {
            if (e.name === 'content_filters') {
                $(e.element).hide();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'asian_filter_enabled',
                type: 'trigger',
                default: false
            },
            field: {
                name: translations.asian_filter,
                description: translations.asian_filter_desc
            },
            onChange: function(value) {
                filterSettings.asian_filter_enabled = value;
                Lampa.Storage.set('asian_filter_enabled', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'language_filter_enabled',
                type: 'trigger',
                default: false
            },
            field: {
                name: translations.language_filter,
                description: translations.language_filter_desc
            },
            onChange: function(value) {
                filterSettings.language_filter_enabled = value;
                Lampa.Storage.set('language_filter_enabled', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'rating_filter_enabled',
                type: 'trigger',
                default: false
            },
            field: {
                name: translations.rating_filter,
                description: translations.rating_filter_desc
            },
            onChange: function(value) {
                filterSettings.rating_filter_enabled = value;
                Lampa.Storage.set('rating_filter_enabled', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'history_filter_enabled',
                type: 'trigger',
                default: false
            },
            field: {
                name: translations.history_filter,
                description: translations.history_filter_desc
            },
            onChange: function(value) {
                filterSettings.history_filter_enabled = value;
                Lampa.Storage.set('history_filter_enabled', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'content_filters',
                type: 'static',
                default: true
            },
            field: {
                name: translations.content_filters,
                description: translations.content_filters_desc
            },
            onRender: function(element) {
                setTimeout(function() {
                    const componentName = translations.content_filters;
                    const targetElement = $(`.settings-param > div:contains("${componentName}")`);
                    const interfaceSizeElement = $('div[data-name="interface_size"], .settings-param[data-name="interface_size"], .settings-param[title*="Размер интерфейса"]');
                    if (targetElement.length && interfaceSizeElement.length) {
                        targetElement.parent().insertAfter(interfaceSizeElement.last());
                    } else {
                        const interfaceMenu = Lampa.Settings.main().render().find('[data-component="interface"] .settings--list');
                        if (targetElement.length && interfaceMenu.length) {
                            targetElement.parent().prependTo(interfaceMenu);
                        }
                    }
                }, 0);

                element.on('hover:enter', function() {
                    Lampa.Settings.show('content_filters');
                });
            }
        });
    }

    function initPlugin() {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
        Lampa.Manifest.plugins.push({
            name: 'Content Filter',
            version: '1.0.0'
        });

        addEventListenerExtension();
        initFilterSettings();
        addSettings();

        Lampa.Listener.follow('more', function(event) {
            if (event.type !== 'open' || !shouldShowMoreButton(event.data)) return;
            const lineElement = $(findClosestElement(event.body, '.items-line')).find('.items-line__head');
            if (lineElement.find('.items-line__more').length !== 0) return;
            const moreButton = document.createElement('div');
            moreButton.classList.add('items-line__more');
            moreButton.classList.add('selector');
            moreButton.innerText = Lampa.Lang.translate('more') || 'Ещё';
            moreButton.addEventListener('hover:enter', function() {
                Lampa.Activity.push({
                    url: event.data.url,
                    title: event.data.title || Lampa.Lang.translate('title_category') || 'Категория',
                    component: 'category_full',
                    page: 1,
                    genres: event.data.genres,
                    filter: event.data.filter,
                    source: event.data.source || event.data.params.source.site
                });
            });
            lineElement.append(moreButton);
        });

        Lampa.Listener.follow('more', function(event) {
            if (event.type !== 'append' || !shouldShowMoreButton(event.data)) return;
            if (event.items.length === event.data.results.length) {
                Lampa.Controller.visible(event.line) && Lampa.Controller.enabled().more();
            }
        });

        Lampa.Listener.follow('request_secuses', function(event) {
            if (shouldApplyFilters(event.params.url) && event.data && Array.isArray(event.data.results)) {
                event.data.original_length = event.data.results.length;
                event.data.results = contentFilters.apply(event.data.results);
            }
        });
    }

    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            initPlugin();
        }
    });
})();
