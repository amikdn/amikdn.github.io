(function () {
    'use strict';

    // Настройки фильтров
    var settings = {
        'asian_filter_enabled': false,
        'language_filter_enabled': false,
        'rating_filter_enabled': false,
        'history_filter_enabled': false
    };

    // Функции фильтрации
    var contentFilters = {
        filters: [
            // Фильтр азиатского контента
            function (items) {
                if (!settings.asian_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item || !item.original_language) return true;
                    var lang = item.original_language.toLowerCase();
                    var asianLanguages = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLanguages.indexOf(lang) === -1;
                });
            },
            // Фильтр контента на другом языке
            function (items) {
                if (!settings.language_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item) return true;
                    var defaultLang = Lampa.Lang.get('interface');
                    var originalName = item.original_name || item.original_title;
                    var name = item.name || item.title;
                    if (item.original_language === defaultLang) return true;
                    if (item.original_language !== defaultLang && name !== originalName) return true;
                    return false;
                });
            },
            // Фильтр низкорейтингового контента
            function (items) {
                if (!settings.rating_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item) return true;
                    var isSpecial = item.media_type === 'person' || item.title === 'Trailer' || item.source === 'YouTube' || (item.url && item.title && item.title.toLowerCase().indexOf('/person/') !== -1);
                    if (isSpecial) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },
            // Фильтр просмотренного контента
            function (items) {
                if (!settings.history_filter_enabled) return items;
                var history = Lampa.Storage.get('history', '{}');
                var viewed = Lampa.Storage.cache('viewed', 300, []);
                return items.filter(function (item) {
                    if (!item || !item.original_language) return true;
                    var mediaType = item.media_type || (item.seasons ? 'tv' : 'movie');
                    var hash = Lampa.Favorite.hash(item);
                    var isFavorite = hash && hash.follow;
                    var isThrown = hash && hash.thrown;
                    if (isThrown) return false;
                    if (!isFavorite) return true;
                    if (isFavorite && mediaType === 'movie') return false;
                    var historyItems = getHistory(item.id, history);
                    var viewedItems = getViewed(item.id, viewed);
                    var combinedItems = combineHistoryAndViewed(historyItems, viewedItems);
                    var isWatched = isFullyWatched(item.original_name || item.original_title, combinedItems);
                    return !isWatched;
                });
            }
        ],
        apply: function (items) {
            var result = Lampa.Arrays.clone(items);
            for (var i = 0; i < this.filters.length; i++) {
                result = this.filters[i](result);
            }
            return result;
        }
    };

    // Инициализация слушателя событий
    function initListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Listener.static, 'ready', {
            get: function () {
                return this._ready;
            },
            set: function (callback) {
                this._ready = function () {
                    callback.apply(this);
                    Lampa.Listener.send('ready', { type: 'ready', object: this });
                }.bind(this);
            }
        });
    }

    // Получение истории просмотров
    function getHistory(id, history) {
        var item = history.results.filter(function (entry) {
            return entry.id === id && Array.isArray(entry.episodes) && entry.episodes.length > 0;
        })[0];
        if (!item) return [];
        var episodes = item.episodes.filter(function (ep) {
            return ep.season_number > 0 && ep.episode_number > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
        if (episodes.length === 0) return [];
        var result = [];
        for (var i = 0; i < episodes.length; i++) {
            var ep = episodes[i];
            for (var j = 1; j <= ep.episode_number; j++) {
                result.push({
                    season_number: ep.season_number,
                    episode_number: j
                });
            }
        }
        return result;
    }

    // Получение просмотренных элементов
    function getViewed(id, viewed) {
        var item = viewed.filter(function (entry) {
            return entry.id === id;
        })[0] || {};
        if (!Array.isArray(item.episodes) || item.episodes.length === 0) return [];
        return item.episodes.filter(function (ep) {
            return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
    }

    // Объединение истории и просмотренных элементов
    function combineHistoryAndViewed(historyItems, viewedItems) {
        var combined = historyItems.concat(viewedItems);
        var result = [];
        for (var i = 0; i < combined.length; i++) {
            var item = combined[i];
            var exists = false;
            for (var j = 0; j < result.length; j++) {
                if (result[j].season_number === item.season_number && result[j].episode_number === item.episode_number) {
                    exists = true;
                    break;
                }
            }
            if (!exists) result.push(item);
        }
        return result;
    }

    // Проверка, полностью ли просмотрен контент
    function isFullyWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (var i = 0; i < episodes.length; i++) {
            var ep = episodes[i];
            var key = Lampa.Utils.join([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title]);
            var progress = Lampa.Timeline.view(key);
            if (progress.percent === 0) return false;
        }
        return true;
    }

    // Добавление переводов
    function addTranslations() {
        Lampa.Lang.translate({
            'content_filters': {
                'ru': 'Фильтр контента',
                'en': 'Content Filter',
                'uk': 'Фільтр контенту'
            },
            'asian_filter': {
                'ru': 'Убрать азиатский контент',
                'en': 'Remove Asian Content',
                'uk': 'Прибрати азіатський контент'
            },
            'asian_filter_desc': {
                'ru': 'Скрываем карточки азиатского происхождения',
                'en': 'Hide cards of Asian origin',
                'uk': 'Сховати картки азіатського походження'
            },
            'language_filter': {
                'ru': 'Убрать контент на другом языке',
                'en': 'Remove Other Language Content',
                'uk': 'Прибрати контент іншою мовою'
            },
            'language_filter_desc': {
                'ru': 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию',
                'en': 'Hide cards not translated to the default language',
                'uk': 'Сховати картки, які не перекладені на мову за замовчуванням'
            },
            'rating_filter': {
                'ru': 'Убрать низкорейтинговый контент',
                'en': 'Remove Low-Rated Content',
                'uk': 'Прибрати низько рейтинговий контент'
            },
            'rating_filter_desc': {
                'ru': 'Скрываем карточки с рейтингом ниже 6.0',
                'en': 'Hide cards with a rating below 6.0',
                'uk': 'Сховати картки з рейтингом нижче 6.0'
            },
            'history_filter': {
                'ru': 'Приховувати переглянуте',
                'en': 'Hide Watched Content',
                'uk': 'Сховати картки з вашої історії перегляду'
            },
            'history_filter_desc': {
                'ru': 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть',
                'en': 'Hide cards from your viewing history',
                'uk': 'Сховати картки з вашої історії перегляду'
            }
        });
    }

    // Добавление параметров в настройки
    function addSettings() {
        Lampa.Listener.follow('app', function (e) {
            if (e.name == 'settings') {
                if (Lampa.Settings.main().component().find('[data-component="content_filters"]').length == 0) {
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                }
                Lampa.Settings.main().update();
                Lampa.Settings.main().component().find('[data-component="content_filters"]').addClass('show');
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
            onRender: function (element) {
                setTimeout(function () {
                    var name = Lampa.Lang.translate('content_filters');
                    $('.settings-param > div:contains("' + name + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                element.on('hover:enter', function () {
                    Lampa.Settings.open('content_filters');
                    Lampa.Controller.main().params.back = function () {
                        Lampa.Settings.open('main');
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
            onChange: function (value) {
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
            onChange: function (value) {
                settings.language_filter_enabled = value;
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
            onChange: function (value) {
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
            onChange: function (value) {
                settings.history_filter_enabled = value;
                Lampa.Storage.set('history_filter_enabled', value);
            }
        });
    }

    // Загрузка настроек
    function loadSettings() {
        settings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        settings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        settings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
        settings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);
    }

    // Проверка необходимости обработки ответа
    function shouldProcessResponse(source) {
        return true;
    }

    // Проверка необходимости добавления кнопки "Ещё"
    function shouldAddMoreButton(data) {
        return data && Array.isArray(data.results) && data.results.length !== data.original_length && data.page === 1 && data.total_pages && data.total_pages > 1;
    }

    // Поиск ближайшего элемента по селектору
    function closest(element, selector) {
        if (element && element.closest) return element.closest(selector);
        var current = element;
        while (current && current !== document) {
            if (current.matches) {
                if (current.matches(selector)) return current;
            } else if (current.msMatchesSelector) {
                if (current.msMatchesSelector(selector)) return current;
            } else if (current.webkitMatchesSelector) {
                if (current.webkitMatchesSelector(selector)) return current;
            } else if (current.mozMatchesSelector) {
                if (current.mozMatchesSelector(selector)) return current;
            } else if (current.oMatchesSelector) {
                if (current.oMatchesSelector(selector)) return current;
            } else if (current.className && current.className.indexOf(selector.replace('.', '')) !== -1) {
                return current;
            }
            current = current.parentElement || current.parentNode;
        }
        return null;
    }

    // Основная функция плагина
    function startPlugin() {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
        Lampa.Manifest.plugins.push({
            name: 'Content Filter',
            version: '1.0.0'
        });

        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        initListener();
        loadSettings();
        addTranslations();
        addSettings();

        // Обработка события добавления карточек
        Lampa.Listener.follow('append', function (e) {
            if (e.type !== 'card' || !shouldAddMoreButton(e.data)) return;
            var itemsLine = $(closest(e.element, '.items-line')).find('.items-line__head');
            var hasMoreButton = itemsLine.find('.items-line__more').length !== 0;
            if (hasMoreButton) return;

            var moreButton = document.createElement('div');
            moreButton.classList.add('items-line__more');
            moreButton.classList.add('selector');
            moreButton.innerText = Lampa.Lang.translate('more');
            moreButton.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: e.data.genres,
                    filter: e.data.filter,
                    source: e.data.source || e.data.params.source
                });
            });
            itemsLine.append(moreButton);
        });

        // Обработка события добавления строки
        Lampa.Listener.follow('append', function (e) {
            if (e.type !== 'line' || !shouldAddMoreButton(e.data)) return;
            if (e.data.results.length === e.data.original_length) {
                Lampa.Controller.collectionAppend(e.line);
                Lampa.Controller.enabled(e.line).more();
            }
        });

        // Обработка ответа API
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!shouldProcessResponse(e.params.source) || !e.data || !Array.isArray(e.data.results)) return;
            e.data.original_length = e.data.results.length;
            e.data.results = contentFilters.apply(e.data.results);
        });
    }

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
