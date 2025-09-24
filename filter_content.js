// Глобальные настройки фильтров
var filterSettings = {
    asian_filter_enabled: false,
    language_filter_enabled: false,
    rating_filter_enabled: false,
    history_filter_enabled: false
};

// Объект фильтров и их применение
var contentFilters = {
    filters: [
        // Фильтрация азиатского контента
        function filterAsianContent(data) {
            if (!filterSettings.asian_filter_enabled) {
                console.log('Asian filter disabled');
                return data;
            }
            if (!Array.isArray(data)) {
                console.log('Invalid data for Asian filter:', data);
                return data;
            }
            console.log('Applying Asian filter');
            return data.filter(item => {
                if (!item || !item.original_language) return true;
                var lang = item.original_language.toLowerCase();
                var asianLanguages = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                return asianLanguages.indexOf(lang) === -1;
            });
        },
        // Фильтрация контента на другом языке
        function filterLanguageContent(data) {
            if (!filterSettings.language_filter_enabled) {
                console.log('Language filter disabled');
                return data;
            }
            if (!Array.isArray(data)) {
                console.log('Invalid data for Language filter:', data);
                return data;
            }
            console.log('Applying Language filter');
            return data.filter(item => {
                if (!item) return true;
                var defaultLanguage = Lampa.Lang.translate('language') || 'en';
                var title = item.title || item.original_name;
                var originalTitle = item.original_title || item.original_name;
                if (item.original_language === defaultLanguage) return true;
                if (item.original_language !== defaultLanguage && originalTitle !== title) return true;
                return false;
            });
        },
        // Фильтрация низкорейтингового контента
        function filterLowRatedContent(data) {
            if (!filterSettings.rating_filter_enabled) {
                console.log('Rating filter disabled');
                return data;
            }
            if (!Array.isArray(data)) {
                console.log('Invalid data for Rating filter:', data);
                return data;
            }
            console.log('Applying Rating filter');
            return data.filter(item => {
                if (!item) return true;
                var isSpecialContent = item.media_type === 'movie' || 
                                      item.title === 'Trailer' || 
                                      item.source === 'YouTube' || 
                                      (item.original_name && item.original_title && item.original_title.toLowerCase().indexOf('trailer') !== -1);
                if (isSpecialContent) return true;
                if (!item.vote_average || item.vote_average === 0) return false;
                return item.vote_average >= 6;
            });
        },
        // Фильтрация просмотренного контента
        function filterWatchedContent(data) {
            if (!filterSettings.history_filter_enabled) {
                console.log('History filter disabled');
                return data;
            }
            if (!Array.isArray(data)) {
                console.log('Invalid data for History filter:', data);
                return data;
            }
            console.log('Applying History filter');
            var history = Lampa.Storage.get('history', '{}');
            var favorites = Lampa.Storage.cache('favorite', 300, []);
            return data.filter(item => {
                if (!item || !item.original_language) return true;
                var mediaType = item.media_type || (item.seasons ? 'tv' : 'movie');
                var favoriteData = Lampa.Favorite.check(item);
                var isFavorite = favoriteData && favoriteData.favorite;
                var isThrown = favoriteData && favoriteData.thrown;
                if (isThrown) return false;
                if (!isFavorite) return true;
                if (isFavorite && mediaType === 'movie') return false;
                var watchedEpisodes = getWatchedEpisodes(item.id, history);
                var favoriteEpisodes = getFavoriteEpisodes(item.id, favorites);
                var allEpisodes = mergeEpisodes(watchedEpisodes, favoriteEpisodes);
                var isWatched = isFullyWatched(item.title || item.original_name, allEpisodes);
                return !isWatched;
            });
        }
    ],
    apply: function(data) {
        console.log('Applying filters to', data.length, 'items');
        var result = Lampa.Arrays.clone(data);
        for (var i = 0; i < this.filters.length; i++) {
            result = this.filters[i](result);
            console.log('After filter', i, ':', result.length, 'items');
        }
        return result;
    }
};

// Получение списка просмотренных эпизодов из истории
function getWatchedEpisodes(id, history) {
    var historyItem = history.filter(item => item.id === id && Array.isArray(item.episodes) && item.episodes.length > 0)[0];
    if (!historyItem) return [];
    var episodes = historyItem.episodes.filter(episode => 
        episode.season_number > 0 && 
        episode.episode_number > 0 && 
        episode.air_date && 
        new Date(episode.air_date) < new Date()
    );
    if (episodes.length === 0) return [];
    var result = [];
    for (var i = 0; i < episodes.length; i++) {
        var episode = episodes[i];
        for (var episodeNum = 1; episodeNum <= episode.episode_number; episodeNum++) {
            result.push({
                season_number: episode.season_number,
                episode_number: episodeNum
            });
        }
    }
    return result;
}

// Получение списка избранных эпизодов
function getFavoriteEpisodes(id, favorites) {
    var favoriteItem = favorites.filter(item => item.id === id)[0] || {};
    if (!Array.isArray(favoriteItem.seasons) || favoriteItem.seasons.length === 0) return [];
    return favoriteItem.seasons.filter(season => 
        season.season_number > 0 && 
        season.air_date && 
        new Date(season.air_date) < new Date()
    );
}

// Объединение списков эпизодов
function mergeEpisodes(watchedEpisodes, favoriteEpisodes) {
    var combined = watchedEpisodes.concat(favoriteEpisodes);
    var uniqueEpisodes = [];
    for (var i = 0; i < combined.length; i++) {
        var episode = combined[i];
        var exists = false;
        for (var j = 0; j < uniqueEpisodes.length; j++) {
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

// Проверка, полностью ли просмотрен контент
function isFullyWatched(title, episodes) {
    if (!episodes || episodes.length === 0) return false;
    for (var i = 0; i < episodes.length; i++) {
        var episode = episodes[i];
        var key = Lampa.Utils.hash([episode.season_number, episode.season_number > 10 ? ':' : '', episode.episode_number, title].join(''));
        var timelineData = Lampa.Timeline.view(key);
        if (timelineData.percent === 0) return false;
    }
    return true;
}

// Добавление переводов для настроек плагина
function addTranslations() {
    Lampa.Lang.translate({
        content_filters: {
            ru: 'Фильтр контента',
            en: 'Content Filter',
            uk: 'Фільтр контенту'
        },
        asian_filter: {
            ru: 'Убрать азиатский контент',
            en: 'Remove Asian Content',
            uk: 'Прибрати азіатський контент'
        },
        asian_filter_desc: {
            ru: 'Скрываем карточки азиатского происхождения',
            en: 'Hide cards of Asian origin',
            uk: 'Сховати картки азіатського походження'
        },
        language_filter: {
            ru: 'Убрать контент на другом языке',
            en: 'Remove Other Language Content',
            uk: 'Прибрати контент іншою мовою'
        },
        language_filter_desc: {
            ru: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию',
            en: 'Hide cards not translated to the default language',
            uk: 'Сховати картки, які не перекладені на мову за замовчуванням'
        },
        rating_filter: {
            ru: 'Убрать низкорейтинговый контент',
            en: 'Remove Low-Rated Content',
            uk: 'Прибрати низько рейтинговий контент'
        },
        rating_filter_desc: {
            ru: 'Скрываем карточки с рейтингом ниже 6.0',
            en: 'Hide cards with a rating below 6.0',
            uk: 'Сховати картки з рейтингом нижче 6.0'
        },
        history_filter: {
            ru: 'Приховувати переглянуте',
            en: 'Hide Watched Content',
            uk: 'Сховати картки з вашої історії перегляду'
        },
        history_filter_desc: {
            ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть',
            en: 'Hide cards from your viewing history',
            uk: 'Сховати картки з вашої історії перегляду'
        }
    });
}

// Настройка параметров фильтров в интерфейсе
function setupSettings() {
    console.log('Setting up content filters');
    Lampa.Settings.listener.follow('open', function(event) {
        if (event.name == 'main') {
            if (Lampa.Settings.main().render().find('[data-component="content_filters"]').length == 0) {
                console.log('Adding content_filters component');
                Lampa.SettingsApi.addComponent({
                    component: 'content_filters',
                    name: Lampa.Lang.translate('content_filters')
                });
                Lampa.Settings.main().update();
            }
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'content_filters',
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
            console.log('Rendering content_filters param');
            element.on('hover:enter', function() {
                Lampa.Settings.show('content_filters');
                Lampa.Controller.back = function() {
                    Lampa.Settings.show('main');
                };
            });
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
            name: Lampa.Lang.translate('asian_filter'),
            description: Lampa.Lang.translate('asian_filter_desc')
        },
        onChange: function(value) {
            console.log('asian_filter_enabled set to:', value);
            filterSettings.asian_filter_enabled = value;
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
            console.log('language_filter_enabled set to:', value);
            filterSettings.language_filter_enabled = value;
            Lampa.Storage.set('language_filter_enabled', value);
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
            name: Lampa.Lang.translate('rating_filter'),
            description: Lampa.Lang.translate('rating_filter_desc')
        },
        onChange: function(value) {
            console.log('rating_filter_enabled set to:', value);
            filterSettings.rating_filter_enabled = value;
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
            console.log('history_filter_enabled set to:', value);
            filterSettings.history_filter_enabled = value;
            Lampa.Storage.set('history_filter_enabled', value);
        }
    });
}

// Загрузка сохранённых настроек
function loadSettings() {
    console.log('Loading settings');
    filterSettings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
    filterSettings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
    filterSettings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
    filterSettings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);
    console.log('Loaded settings:', filterSettings);
}

// Проверка, применима ли фильтрация к URL
function isFilterableUrl(url) {
    console.log('Checking URL:', url);
    var isValid = url.includes('api.themoviedb.org');
    console.log('URL is filterable:', isValid);
    return isValid;
}

// Проверка, есть ли дополнительные страницы контента
function hasMorePages(data) {
    return !!data && 
           Array.isArray(data.results) && 
           data.results.length !== data.original_length && 
           data.page === 1 && 
           !!data.total_pages && 
           data.total_pages > 1;
}

// Поиск ближайшего элемента по селектору
function findClosestElement(element, selector) {
    if (element && element.matches) return element.matches(selector) ? element : null;
    var current = element;
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

// Инициализация плагина
function initializePlugin() {
    if (window.content_filter_plugin) return;
    window.content_filter_plugin = true;
    console.log('Plugin initialized');

    // Установка слушателя для обработки коллекций
    if (!window.lampa_listener_extensions) {
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Manifest.plugins, 'appready', {
            get: function() {
                return this._build;
            },
            set: function(value) {
                this._build = function() {
                    value.apply(this);
                    Lampa.Listener.send('appready', { type: 'appready', object: this });
                }.bind(this);
            }
        });
    }

    loadSettings();
    addTranslations();
    setupSettings();

    // Добавление кнопки фильтра в интерфейс
    Lampa.Listener.follow('view', function(event) {
        if (event.type !== 'more' || !hasMorePages(event.data)) return;
        var lineElement = $(findClosestElement(event.card, '.items-line')).find('.items-line__head');
        if (lineElement.find('.items-line__more').length !== 0) return;
        var filterButton = document.createElement('div');
        filterButton.classList.add('items-line__more');
        filterButton.classList.add('selector');
        filterButton.innerText = Lampa.Lang.translate('filter');
        filterButton.addEventListener('hover:enter', function() {
            Lampa.Activity.push({
                url: event.data.url,
                title: event.data.title || Lampa.Lang.translate('title_category'),
                component: 'category_full',
                page: 1,
                genres: event.data.genres,
                filter: event.data.filter,
                source: event.data.source || event.data.params.source
            });
        });
        lineElement.append(filterButton);
    });

    // Обработка добавления элементов
    Lampa.Listener.follow('append', function(event) {
        if (event.type !== 'append' || !hasMorePages(event.data)) return;
        if (event.items.length === event.data.results.length) {
            Lampa.Controller.enabled(event.line) && Lampa.Controller[event.line].more();
        }
    });

    // Фильтрация данных при запросе
    Lampa.Listener.follow('request_secuses', function(event) {
        console.log('request_secuses event triggered:', event.params.url, event.data);
        if (isFilterableUrl(event.params.url) && event.data && Array.isArray(event.data.results)) {
            console.log('Applying filters to results:', event.data.results.length);
            event.data.original_length = event.data.results.length;
            event.data.results = contentFilters.apply(event.data.results);
            console.log('Filtered results:', event.data.results.length);
        } else {
            console.log('Filter skipped: Invalid URL or data structure', {
                isValidUrl: isFilterableUrl(event.params.url),
                hasData: !!event.data,
                hasResults: event.data && Array.isArray(event.data.results)
            });
        }
    });
}

// Запуск плагина
if (window.lampa) {
    initializePlugin();
} else {
    Lampa.Listener.follow('app', function(event) {
        if (event.type === 'appready') initializePlugin();
    });
}
