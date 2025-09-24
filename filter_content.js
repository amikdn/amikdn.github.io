(function() {
    'use strict';

    console.log('Content Filter: Starting plugin initialization');

    // Проверка доступности Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Content Filter: Lampa is not defined');
        alert('Content Filter: Lampa is not defined');
        return;
    }

    // Объект для хранения состояния фильтров
    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: true, // Принудительно включено
        history_filter_enabled: false
    };

    // Объект с фильтрами
    var filters = {
        filters: [
            // Фильтр азиатского контента
            function(data) {
                if (!settings.asian_filter_enabled) return data;
                console.log('Content Filter: Applying Asian filter');
                return data.filter(function(item) {
                    if (!item || !item.original_language) return true;
                    var lang = item.original_language.toLowerCase(),
                        asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLangs.indexOf(lang) === -1;
                });
            },
            // Фильтр контента на другом языке
            function(data) {
                if (!settings.language_filter_enabled) return data;
                console.log('Content Filter: Applying language filter');
                return data.filter(function(item) {
                    if (!item) return true;
                    var appLang = Lampa.Storage.get('language'),
                        original = item.original_name || item.original_title,
                        translated = item.title || item.name;
                    if (item.original_language === appLang) return true;
                    if (item.original_language !== appLang && translated !== original) return true;
                    return false;
                });
            },
            // Фильтр низкорейтингового контента
            function(data) {
                if (!settings.rating_filter_enabled) return data;
                console.log('Content Filter: Applying rating filter');
                return data.filter(function(item) {
                    if (!item) {
                        console.log('Content Filter: Skipping empty item in rating filter');
                        return true;
                    }
                    var isSpecial = item.media_type === 'person' || 
                                   item.type === 'Trailer' || 
                                   item.site === 'YouTube' || 
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
            // Фильтр просмотренного контента
            function(data) {
                if (!settings.history_filter_enabled) return data;
                console.log('Content Filter: Applying history filter');
                var history = Lampa.Storage.get('history', '{}'),
                    favorites = Lampa.Storage.cache('favorite', 300, []);
                return data.filter(function(item) {
                    if (!item || !item.original_language) return true;
                    var mediaType = item.media_type || (item.seasons ? 'tv' : 'movie'),
                        favorite = Lampa.Favorite.check(item),
                        viewed = !!favorite && !!favorite.view,
                        thrown = !!favorite && favorite.thrown;
                    if (thrown) return false;
                    if (!viewed) return true;
                    if (viewed && mediaType === 'movie') return false;
                    var historyEpisodes = getHistoryEpisodes(item.id, history),
                        favoriteEpisodes = getFavoriteEpisodes(item.id, favorites),
                        allEpisodes = mergeEpisodes(historyEpisodes, favoriteEpisodes),
                        isWatched = isFullyWatched(item.original_name || item.original_title, allEpisodes);
                    return !isWatched;
                });
            }
        ],
        apply: function(data) {
            console.log('Content Filter: Applying filters to', data.length, 'items');
            var result = Lampa.Utils.clone(data);
            for (var i = 0; i < this.filters.length; i++) {
                result = this.filters[i](result);
            }
            console.log('Content Filter: After filters, remaining', result.length, 'items');
            return result;
        }
    };

    // Получение списка просмотренных эпизодов из истории
    function getHistoryEpisodes(id, history) {
        var show = history.history.filter(function(item) {
            return item.id === id && Array.isArray(item.episodes) && item.episodes.length > 0;
        })[0];
        if (!show) return [];
        var episodes = show.episodes.filter(function(ep) {
            return ep.season_number > 0 && ep.episode_count > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
        if (episodes.length === 0) return [];
        var result = [];
        for (var i = 0; i < episodes.length; i++) {
            var season = episodes[i];
            for (var ep = 1; ep <= season.episode_count; ep++) {
                result.push({ season_number: season.season_number, episode_number: ep });
            }
        }
        return result;
    }

    // Получение списка эпизодов из избранного
    function getFavoriteEpisodes(id, favorites) {
        var show = favorites.filter(function(item) {
            return item.id === id;
        })[0] || {};
        if (!Array.isArray(show.items) || show.items.length === 0) return [];
        return show.items.filter(function(ep) {
            return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
    }

    // Объединение списков эпизодов
    function mergeEpisodes(history, favorites) {
        var all = history.concat(favorites), unique = [];
        for (var i = 0; i < all.length; i++) {
            var ep = all[i], exists = false;
            for (var j = 0; j < unique.length; j++) {
                if (unique[j].season_number === ep.season_number && unique[j].episode_number === ep.episode_number) {
                    exists = true;
                    break;
                }
            }
            if (!exists) unique.push(ep);
        }
        return unique;
    }

    // Проверка, просмотрен ли контент
    function isFullyWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (var i = 0; i < episodes.length; i++) {
            var ep = episodes[i],
                hash = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join('')),
                timeline = Lampa.Timeline.view(hash);
            if (timeline.percent === 0) return false;
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
                history_filter: { ru: 'Приховувати переглянуте', en: 'Hide Watched Content', uk: 'Приховувати переглянуте' },
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
            if (!Lampa.SettingsApi || !Lampa.Settings) {
                console.error('Content Filter: Lampa.SettingsApi or Lampa.Settings is not available');
                alert('Content Filter: Settings API is not available');
                return;
            }

            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name !== 'settings') return;
                console.log('Content Filter: Settings opened');
                var settingsMain = Lampa.Settings.main();
                if (!settingsMain) {
                    console.error('Content Filter: Lampa.Settings.main() is not available');
                    alert('Content Filter: Settings main is not available');
                    return;
                }
                var componentExists = settingsMain.render().querySelector('[data-component="content_filters"]');
                if (!componentExists) {
                    console.log('Content Filter: Adding content_filters component');
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                    console.log('Content Filter: Component content_filters added');
                } else {
                    console.log('Content Filter: Component content_filters already exists');
                }
                settingsMain.update();
                console.log('Content Filter: Settings updated');
            });

            // Добавление пункта в раздел "Интерфейс"
            console.log('Content Filter: Adding interface param');
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'content_filters',
                    type: 'static',
                    default: true
                },
                field: {
                    name: Lampa.Lang.translate('content_filters'),
                    description: 'Настройка отображения карточек по фильтрам'
                },
                onRender: function(element) {
                    console.log('Content Filter: Rendering interface param');
                    element.on('hover:enter', function() {
                        console.log('Content Filter: Opening content_filters settings');
                        Lampa.Settings.open('content_filters');
                        Lampa.Controller.enabled().controller.back = function() {
                            Lampa.Settings.open('interface');
                        };
                    });
                }
            });

            // Добавление параметров фильтров
            console.log('Content Filter: Adding filter params');
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: {
                    name: 'asian_filter_enabled',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: Lampa.Lang.translate('asian_filter'),
                    description: Lampa.Lang.translate('asian_filter_desc')
                },
                onChange: function(value) {
                    console.log('Content Filter: asian_filter_enabled changed to', value);
                    settings.asian_filter_enabled = value;
                    Lampa.Storage.set('asian_filter_enabled', value);
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
                    name: Lampa.Lang.translate('language_filter'),
                    description: Lampa.Lang.translate('language_filter_desc')
                },
                onChange: function(value) {
                    console.log('Content Filter: language_filter_enabled changed to', value);
                    settings.language_filter_enabled = value;
                    Lampa.Storage.set('language_filter_enabled', value);
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: {
                    name: 'rating_filter_enabled',
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: Lampa.Lang.translate('rating_filter'),
                    description: Lampa.Lang.translate('rating_filter_desc')
                },
                onChange: function(value) {
                    console.log('Content Filter: rating_filter_enabled changed to', value);
                    settings.rating_filter_enabled = value;
                    Lampa.Storage.set('rating_filter_enabled', value);
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
                    name: Lampa.Lang.translate('history_filter'),
                    description: Lampa.Lang.translate('history_filter_desc')
                },
                onChange: function(value) {
                    console.log('Content Filter: history_filter_enabled changed to', value);
                    settings.history_filter_enabled = value;
                    Lampa.Storage.set('history_filter_enabled', value);
                }
            });

            console.log('Content Filter: Settings initialized');
        } catch (e) {
            console.error('Content Filter: Error initializing settings', e);
            alert('Content Filter: Error initializing settings: ' + e.message);
        }
    }

    // Загрузка сохранённых настроек
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

    // Проверка URL для фильтрации
    function isValidUrl(url) {
        var isValid = url.indexOf(Lampa.TMDB.api('')) > -1 && 
                      url.indexOf('/search') === -1 && 
                      url.indexOf('/person/') === -1;
        console.log('Content Filter: Checking URL', url, 'Valid:', isValid);
        return isValid;
    }

    // Проверка необходимости добавления кнопки "Ещё"
    function needsMoreButton(data) {
        var isValid = !!data && 
                      Array.isArray(data.results) && 
                      data.original_length !== data.results.length && 
                      data.page === 1 && 
                      !!data.total_pages && 
                      data.total_pages > 1;
        console.log('Content Filter: Checking more button need', isValid);
        return isValid;
    }

    // Основная функция инициализации
    function initialize() {
        console.log('Content Filter: Initializing plugin');
        try {
            loadSettings();
            addTranslations();
            addSettings();

            // Применение фильтров к данным
            Lampa.Listener.follow('request_success', function(e) {
                console.log('Content Filter: Processing request_success for URL', e.params.url);
                if (isValidUrl(e.params.url) && e.data && Array.isArray(e.data.results)) {
                    console.log('Content Filter: Original results length', e.data.results.length);
                    e.data.original_length = e.data.results.length;
                    e.data.results = filters.apply(e.data.results);
                    console.log('Content Filter: Filtered results length', e.data.results.length);
                } else {
                    console.log('Content Filter: Skipping request_success, invalid URL or data');
                }
            });

            console.log('Content Filter: Plugin initialized successfully');
            if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                Lampa.Noty.show('Плагин Фильтр контента загружен');
            } else {
                alert('Content Filter: Plugin loaded');
            }
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
