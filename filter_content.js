(function() {
    'use strict';
    console.log('Content Filter: Starting plugin initialization');

    // Объект настроек
    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: true, // Включён по умолчанию
        history_filter_enabled: false
    };

    // Объект фильтров
    var filters = {
        filters: [
            // Фильтр азиатского контента
            function(data) {
                if (!settings.asian_filter_enabled) return data;
                console.log('Content Filter: Applying asian filter');
                return data.filter(function(item) {
                    if (!item || !item.original_language) {
                        console.log('Content Filter: Allowing item (no original_language)', item.name || item.title);
                        return true;
                    }
                    var lang = item.original_language.toLowerCase(),
                        asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    var allow = asianLangs.indexOf(lang) === -1;
                    console.log('Content Filter: Item', item.name || item.title, 'Lang:', lang, 'Allow:', allow);
                    return allow;
                });
            },
            // Фильтр языка
            function(data) {
                if (!settings.language_filter_enabled) return data;
                console.log('Content Filter: Applying language filter');
                return data.filter(function(item) {
                    if (!item) {
                        console.log('Content Filter: Allowing empty item');
                        return true;
                    }
                    var appLang = Lampa.Lang.translate('language'),
                        title = item.original_title || item.title,
                        name = item.original_name || item.name;
                    if (item.original_language === appLang) {
                        console.log('Content Filter: Allowing item (same language)', item.name || item.title);
                        return true;
                    }
                    if (item.original_language !== appLang && name !== title) {
                        console.log('Content Filter: Allowing item (translated)', item.name || item.title);
                        return true;
                    }
                    console.log('Content Filter: Filtering out item (not translated)', item.name || item.title);
                    return false;
                });
            },
            // Фильтр рейтинга
            function(data) {
                if (!settings.rating_filter_enabled) return data;
                console.log('Content Filter: Applying rating filter to', data.length, 'items');
                return data.filter(function(item) {
                    if (!item) {
                        console.log('Content Filter: Allowing empty item');
                        return true;
                    }
                    var isSpecial = item.media_type === 'person' || item.type === 'Trailer' || item.site === 'YouTube' ||
                                    (item.card && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecial) {
                        console.log('Content Filter: Allowing special item:', item.name || item.title);
                        return true;
                    }
                    if (!item.vote_average || item.vote_average < 6) {
                        console.log('Content Filter: Filtering out item:', item.name || item.title, 'Rating:', item.vote_average || 'none');
                        return false;
                    }
                    console.log('Content Filter: Allowing item:', item.name || item.title, 'Rating:', item.vote_average);
                    return true;
                });
            },
            // Фильтр истории
            function(data) {
                if (!settings.history_filter_enabled) return data;
                console.log('Content Filter: Applying history filter');
                var history = Lampa.Storage.get('history', '{}'),
                    favorite = Lampa.Storage.cache('favorite', 300, []);
                return data.filter(function(item) {
                    if (!item || !item.media_type) {
                        console.log('Content Filter: Allowing item (no media_type)', item.name || item.title);
                        return true;
                    }
                    var mediaType = item.media_type || (item.seasons ? 'tv' : 'movie'),
                        favoriteData = Lampa.Favorite.check(item),
                        isViewed = !!favoriteData && !!favoriteData.view,
                        isThrown = !!favoriteData && favoriteData.thrown;
                    if (isThrown) {
                        console.log('Content Filter: Filtering out thrown item:', item.name || item.title);
                        return false;
                    }
                    if (!isViewed) {
                        console.log('Content Filter: Allowing item (not viewed)', item.name || item.title);
                        return true;
                    }
                    if (isViewed && mediaType === 'movie') {
                        console.log('Content Filter: Filtering out viewed movie:', item.name || item.title);
                        return false;
                    }
                    var historyEpisodes = getHistoryEpisodes(item.id, history),
                        favoriteEpisodes = getFavoriteEpisodes(item.id, favorite),
                        allEpisodes = mergeEpisodes(historyEpisodes, favoriteEpisodes),
                        isFullyViewed = checkFullyViewed(item.original_name || item.name, allEpisodes);
                    console.log('Content Filter: Item', item.name || item.title, 'Fully viewed:', isFullyViewed);
                    return !isFullyViewed;
                });
            }
        ],
        apply: function(data) {
            console.log('Content Filter: Applying all filters to', data.length, 'items');
            var result = Lampa.Arrays.clone(data);
            for (var i = 0; i < this.filters.length; i++) {
                result = this.filters[i](result);
            }
            console.log('Content Filter: After all filters, remaining', result.length, 'items');
            return result;
        }
    };

    // Вспомогательные функции для истории
    function getHistoryEpisodes(id, history) {
        var episodes = history.view?.filter(item => item.id === id && Array.isArray(item.episodes) && item.episodes.length > 0)[0]?.episodes || [];
        return episodes.filter(ep => ep.season_number > 0 && ep.episode_number > 0 && ep.air_date && new Date(ep.air_date) < new Date());
    }

    function getFavoriteEpisodes(id, favorite) {
        var episodes = favorite.filter(item => item.id === id)[0]?.seasons || [];
        return episodes.filter(ep => ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date());
    }

    function mergeEpisodes(historyEpisodes, favoriteEpisodes) {
        var allEpisodes = historyEpisodes.concat(favoriteEpisodes), uniqueEpisodes = [];
        for (var i = 0; i < allEpisodes.length; i++) {
            var ep = allEpisodes[i], exists = false;
            for (var j = 0; j < uniqueEpisodes.length; j++) {
                if (uniqueEpisodes[j].season_number === ep.season_number && uniqueEpisodes[j].episode_number === ep.episode_number) {
                    exists = true;
                    break;
                }
            }
            if (!exists) uniqueEpisodes.push(ep);
        }
        return uniqueEpisodes;
    }

    function checkFullyViewed(name, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (var i = 0; i < episodes.length; i++) {
            var ep = episodes[i],
                key = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, name].join('')),
                percent = Lampa.Timeline.percent(key);
            if (percent === 0) return false;
        }
        return true;
    }

    // Добавление переводов
    function addTranslations() {
        console.log('Content Filter: Adding translations');
        try {
            Lampa.Lang.translate({
                content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
                asian_filter: { ru: 'Убрать азиатский контент', en: 'Remove Asian Content', uk: 'Прибрати азіатський контент' },
                asian_filter_desc: { ru: 'Скрываем карточки азиатского происхождения', en: 'Hide cards of Asian origin', uk: 'Сховати картки азіатського походження' },
                language_filter: { ru: 'Убрать контент на другом языке', en: 'Remove Other Language Content', uk: 'Прибрати контент іншою мовою' },
                language_filter_desc: { ru: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию', en: 'Hide cards not translated to the default language', uk: 'Сховати картки, які не перекладені на мову за замовчуванням' },
                rating_filter: { ru: 'Убрать низкорейтинговый контент', en: 'Remove Low-Rated Content', uk: 'Прибрати низько рейтинговий контент' },
                rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0', en: 'Hide cards with a rating below 6.0', uk: 'Сховати картки з рейтингом нижче 6.0' },
                history_filter: { ru: 'Убрать просмотренный контент', en: 'Hide Watched Content', uk: 'Приховувати переглянуте' },
                history_filter_desc: { ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть', en: 'Hide cards from your viewing history', uk: 'Сховати картки з вашої історії перегляду' }
            });
            console.log('Content Filter: Translations added');
        } catch (e) {
            console.error('Content Filter: Error adding translations', e);
            alert('Content Filter: Error adding translations: ' + e.message);
        }
    }

    // Добавление настроек
    function addSettings() {
        console.log('Content Filter: Initializing settings');
        try {
            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name !== 'settings') return;
                console.log('Content Filter: Settings opened');
                var settingsMain = Lampa.Settings.main();
                if (!settingsMain) {
                    console.error('Content Filter: Lampa.Settings.main() is not available');
                    alert('Content Filter: Settings main is not available');
                    return;
                }
                var componentExists = settingsMain.render().find('[data-component="content_filters"]').length !== 0;
                if (!componentExists) {
                    console.log('Content Filter: Adding content_filters component');
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                    Lampa.SettingsApi.addParam({
                        component: 'content_filters',
                        param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
                        field: { name: Lampa.Lang.translate('asian_filter'), description: Lampa.Lang.translate('asian_filter_desc') },
                        onChange: function(value) {
                            console.log('Content Filter: asian_filter_enabled changed to', value);
                            settings.asian_filter_enabled = value;
                            Lampa.Storage.set('asian_filter_enabled', value);
                        }
                    });
                    Lampa.SettingsApi.addParam({
                        component: 'content_filters',
                        param: { name: 'language_filter_enabled', type: 'trigger', default: false },
                        field: { name: Lampa.Lang.translate('language_filter'), description: Lampa.Lang.translate('language_filter_desc') },
                        onChange: function(value) {
                            console.log('Content Filter: language_filter_enabled changed to', value);
                            settings.language_filter_enabled = value;
                            Lampa.Storage.set('language_filter_enabled', value);
                        }
                    });
                    Lampa.SettingsApi.addParam({
                        component: 'content_filters',
                        param: { name: 'rating_filter_enabled', type: 'trigger', default: true },
                        field: { name: Lampa.Lang.translate('rating_filter'), description: Lampa.Lang.translate('rating_filter_desc') },
                        onChange: function(value) {
                            console.log('Content Filter: rating_filter_enabled changed to', value);
                            settings.rating_filter_enabled = value;
                            Lampa.Storage.set('rating_filter_enabled', value);
                        }
                    });
                    Lampa.SettingsApi.addParam({
                        component: 'content_filters',
                        param: { name: 'history_filter_enabled', type: 'trigger', default: false },
                        field: { name: Lampa.Lang.translate('history_filter'), description: Lampa.Lang.translate('history_filter_desc') },
                        onChange: function(value) {
                            console.log('Content Filter: history_filter_enabled changed to', value);
                            settings.history_filter_enabled = value;
                            Lampa.Storage.set('history_filter_enabled', value);
                        }
                    });
                    settingsMain.update();
                    console.log('Content Filter: Component content_filters added');
                } else {
                    console.log('Content Filter: Component content_filters already exists');
                }
            });

            console.log('Content Filter: Adding interface param');
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'content_filters', type: 'static', default: true },
                field: { name: Lampa.Lang.translate('content_filters'), description: 'Настройка отображения карточек по фильтрам' },
                onRender: function(element) {
                    console.log('Content Filter: Rendering interface param');
                    setTimeout(function() {
                        var title = Lampa.Lang.translate('content_filters');
                        $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                    }, 0);
                    element.on('hover:enter', function() {
                        console.log('Content Filter: Opening content_filters settings');
                        Lampa.Settings.main().render().find('[data-component="content_filters"]').click();
                    });
                }
            });

            console.log('Content Filter: Settings initialized');
        } catch (e) {
            console.error('Content Filter: Error initializing settings', e);
            alert('Content Filter: Error initializing settings: ' + e.message);
        }
    }

    // Загрузка настроек
    function loadSettings() {
        console.log('Content Filter: Loading filter settings');
        try {
            settings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
            settings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
            settings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', true);
            settings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);
            console.log('Content Filter: Filter settings loaded', settings);
        } catch (e) {
            console.error('Content Filter: Error loading filter settings', e);
            alert('Content Filter: Error loading settings: ' + e.message);
        }
    }

    // Проверка URL
    function isValidUrl(url) {
        var isValid = url.indexOf(Lampa.TMDB.api('')) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
        console.log('Content Filter: Checking URL', url, 'Valid:', isValid);
        return isValid;
    }

    // Проверка данных для кнопки "Ещё"
    function shouldAddMoreButton(data) {
        return !!data && Array.isArray(data.results) && data.original_length !== data.results.length && 
               data.page === 1 && !!data.total_pages && data.total_pages > 1;
    }

    // Поиск элемента по селектору
    function findElement(start, selector) {
        var el = start;
        while (el && el !== document) {
            if (el.matches && el.matches(selector)) return el;
            if (el.msMatchesSelector && el.msMatchesSelector(selector)) return el;
            if (el.webkitMatchesSelector && el.webkitMatchesSelector(selector)) return el;
            if (el.mozMatchesSelector && el.mozMatchesSelector(selector)) return el;
            if (el.oMatchesSelector && el.oMatchesSelector(selector)) return el;
            if (el.className && el.className.indexOf(selector.replace('.', '')) !== -1) return el;
            el = el.parentElement || el.parentNode;
        }
        return null;
    }

    // Основная функция инициализации
    function initialize() {
        console.log('Content Filter: Initializing plugin');
        try {
            loadSettings();
            addTranslations();
            addSettings();

            // Добавление кнопки "Ещё"
            Lampa.Listener.follow('line', function(e) {
                if (e.type !== 'ready' || !shouldAddMoreButton(e.data)) return;
                var line = $(findElement(e.items, '.items-line')).find('.items-line__head'),
                    hasMore = line.find('.items-line__more').length !== 0;
                if (hasMore) return;
                var moreButton = document.createElement('div');
                moreButton.classList.add('items-line__more');
                moreButton.classList.add('selector');
                moreButton.innerText = Lampa.Lang.translate('more');
                moreButton.addEventListener('hover:enter', function() {
                    Lampa.Activity.push({
                        url: e.data.url,
                        title: e.data.title || Lampa.Lang.translate('title_category'),
                        component: 'category_full',
                        page: 1,
                        genres: e.data.genres,
                        filter: e.data.filter,
                        source: e.data.source || e.data.results.source
                    });
                });
                line.append(moreButton);
            });

            // Скрытие кнопки "Ещё"
            Lampa.Listener.follow('line', function(e) {
                if (e.type !== 'ready' || !shouldAddMoreButton(e.data)) return;
                if (e.data.results.length === e.data.original_length) {
                    Lampa.Controller.hide(e.line);
                    Lampa.Controller.enabled(e.line).more();
                }
            });

            // Применение фильтров
            Lampa.Listener.follow('request_secuses', function(e) {
                console.log('Content Filter: Processing request_secuses for URL', e.params.url, 'Data:', e.data);
                if (isValidUrl(e.params.url) && e.data && Array.isArray(e.data.results)) {
                    console.log('Content Filter: Original results length', e.data.results.length);
                    e.data.results.forEach(item => {
                        console.log('Item:', item.name || item.title, 'Rating:', item.vote_average || 'none', 'Fields:', Object.keys(item || {}));
                    });
                    e.data.original_length = e.data.results.length;
                    e.data.results = filters.apply(e.data.results);
                    console.log('Content Filter: Filtered results length', e.data.results.length);
                } else {
                    console.log('Content Filter: Skipping request_secuses, invalid URL or data');
                }
            });

            console.log('Content Filter: Plugin initialized successfully');
            alert('Content Filter: Plugin loaded');
        } catch (e) {
            console.error('Content Filter: Error initializing plugin', e);
            alert('Content Filter: Error initializing plugin: ' + e.message);
        }
    }

    // Инициализация плагина
    if (window.content_filter_plugin) {
        console.log('Content Filter: Plugin already loaded, running initialization');
        initialize();
    } else {
        console.log('Content Filter: Setting up app listener');
        window.content_filter_plugin = true;
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'appready') {
                console.log('Content Filter: App ready, initializing plugin');
                initialize();
            }
        });
    }
})();
