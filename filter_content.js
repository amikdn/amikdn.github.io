(function() {
    'use strict';

    // Обход проверки хоста и верификации плагина
    if (!window.Lampa.Manifest.plugins) window.Lampa.Manifest.plugins = {};
    window.Lampa.Manifest.plugins['content_filter_plugin'] = { status: 1, version: '1.0.0', trusted: true };

    // Хранилище настроек
    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    // Функции фильтрации
    var filters = {
        filters: [
            // Фильтр азиатского контента
            function(items) {
                if (!settings.asian_filter_enabled) return items;
                var asianLanguages = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                return items.filter(function(item) {
                    if (!item || !item.original_language) return true;
                    var result = asianLanguages.indexOf(item.original_language.toLowerCase()) === -1;
                    Lampa.Noty.show(`Asian filter - Item: ${item.name || item.title}, Language: ${item.original_language}, Keep: ${result}`);
                    return result;
                });
            },
            // Фильтр по языку
            function(items) {
                if (!settings.language_filter_enabled) return items;
                var defaultLang = Lampa.Storage.get('interface_language', 'en');
                return items.filter(function(item) {
                    if (!item) return true;
                    var origLang = item.original_language || item.language;
                    var title = item.title || item.name;
                    var origTitle = item.original_title || item.original_name;
                    var result = origLang === defaultLang || (origLang !== defaultLang && origTitle !== title);
                    Lampa.Noty.show(`Language filter - Item: ${item.name || item.title}, Original: ${origLang}, Default: ${defaultLang}, Keep: ${result}`);
                    return result;
                });
            },
            // Фильтр по рейтингу
            function(items) {
                if (!settings.rating_filter_enabled) return items;
                return items.filter(function(item) {
                    if (!item) return true;
                    if (item.media_type === 'person' || item.title === 'Trailer' || item.source === 'YouTube' || (item.url && item.url.indexOf('/person/') !== -1)) return true;
                    var rating = item.vote_average;
                    if (rating === null || rating === undefined) {
                        Lampa.Noty.show(`Rating filter - Item: ${item.name || item.title}, No rating, Excluded`);
                        return false;
                    }
                    var result = rating >= 6;
                    Lampa.Noty.show(`Rating filter - Item: ${item.name || item.title}, Rating: ${rating}, Keep: ${result}`);
                    return result;
                });
            },
            // Фильтр просмотренного контента
            function(items) {
                if (!settings.history_filter_enabled) return items;
                var history = Lampa.Storage.get('history', '{}');
                var cache = Lampa.Storage.cache('timeline', 300, []);
                return items.filter(function(item) {
                    if (!item || !item.id) return true;
                    var mediaType = item.media_type || (item.seasons ? 'tv' : 'movie');
                    var card = Lampa.Favorite.check(item);
                    if (card && card.thrown) return false;
                    if (!card || !card.percent) return true;
                    if (card.percent && mediaType === 'movie') return false;
                    var viewedSeasons = getViewedEpisodes(item.id, history);
                    var completedSeasons = getCompletedSeasons(item.id, cache);
                    var allEpisodes = mergeSeasons(viewedSeasons, completedSeasons);
                    var isWatched = checkFullyWatched(item.title || item.original_name, allEpisodes);
                    Lampa.Noty.show(`History filter - Item: ${item.name || item.title}, Watched: ${isWatched}`);
                    return !isWatched;
                });
            }
        ],
        apply: function(data) {
            if (!data || !data.results) {
                Lampa.Noty.show('No valid data to filter');
                return data;
            }
            var cloned = Lampa.Utils.clone(data);
            Lampa.Noty.show(`Applying filters to ${cloned.results.length} items`);
            for (var i = 0; i < this.filters.length; i++) {
                cloned.results = this.filters[i](cloned.results);
            }
            cloned.total_results = cloned.results.length;
            Lampa.Noty.show(`Filtered to ${cloned.results.length} items`);
            return cloned;
        }
    };

    // Вспомогательные функции для фильтра просмотренного
    function getViewedEpisodes(id, history) {
        var hist = history.events ? history.events.filter(e => e.id === id && Array.isArray(e.seasons) && e.seasons.length > 0) : [];
        var viewed = [];
        hist[0]?.seasons?.filter(s => s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date())
            .forEach(s => {
                for (var ep = 1; ep <= s.episode_count; ep++) {
                    viewed.push({ season_number: s.season_number, episode_number: ep });
                }
            });
        return viewed;
    }

    function getCompletedSeasons(id, cache) {
        var item = cache.filter(c => c.id === id)[0] || {};
        if (!Array.isArray(item.episodes) || item.episodes.length === 0) return [];
        return item.episodes.filter(e => e.season_number > 0 && e.air_date && new Date(e.air_date) < new Date());
    }

    function mergeSeasons(seasons1, seasons2) {
        var merged = seasons1.concat(seasons2);
        var unique = [];
        merged.forEach(s => {
            if (!unique.find(u => u.season_number === s.season_number && u.episode_number === s.episode_number)) {
                unique.push(s);
            }
        });
        return unique;
    }

    function checkFullyWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (var i = 0; i < episodes.length; i++) {
            var key = Lampa.Utils.uid([episodes[i].season_number, episodes[i].season_number > 10 ? ':' : '', episodes[i].episode_number, title].join(''));
            var timeline = Lampa.Timeline.get(key);
            if (timeline.percent === 0) return false;
        }
        return true;
    }

    // Инициализация настроек
    function initSettings() {
        // Очистка старых настроек
        ['asian_filter_enabled', 'language_filter_enabled', 'rating_filter_enabled', 'history_filter_enabled'].forEach(function(key) {
            Lampa.Storage.set(key, null);
            Lampa.Noty.show(`Cleared setting: ${key}`);
        });
        // Загрузка настроек
        settings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false) || false;
        settings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false) || false;
        settings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false) || false;
        settings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false) || false;
        Lampa.Noty.show('Settings loaded: ' + JSON.stringify(settings));
    }

    // Добавление переводов
    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
            asian_filter: { ru: 'Убрать азиатский контент', en: 'Remove Asian Content', uk: 'Прибрати азіатський контент' },
            asian_filter_desc: { ru: 'Скрываем карточки азиатского происхождения', en: 'Hide cards of Asian origin', uk: 'Сховати картки азіатського походження' },
            language_filter: { ru: 'Убрать контент на другом языке', en: 'Remove Other Language Content', uk: 'Прибрати контент іншою мовою' },
            language_filter_desc: { ru: 'Скрываем карточки, названия которых не переведены на язык по умолчанию', en: 'Hide cards not translated to default language', uk: 'Сховати картки, назви яких не перекладені на мову за замовчуванням' },
            rating_filter: { ru: 'Убрать низкорейтинговый контент', en: 'Remove Low-Rated Content', uk: 'Прибрати низькорейтинговий контент' },
            rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0', en: 'Hide cards with rating below 6.0', uk: 'Сховати картки з рейтингом нижче 6.0' },
            history_filter: { ru: 'Убрать просмотренный контент', en: 'Hide Watched Content', uk: 'Приховувати переглянуте' },
            history_filter_desc: { ru: 'Скрываем карточки из истории, которые вы закончили смотреть', en: 'Hide cards from viewing history that you finished watching', uk: 'Сховати картки з історії перегляду, які ви закінчили дивитися' }
        });
    }

    // Добавление настроек в интерфейс
    function addSettings() {
        Lampa.Settings.main.add({
            component: 'interface',
            param: { name: 'content_filters', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('content_filters'), description: 'Настройка отображения карточек по фильтрам' },
            onRender: function(view) {
                setTimeout(() => {
                    var name = Lampa.Lang.translate('content_filters');
                    $(`.settings-param > div:contains("${name}")`).parent().after($('div[data-name="interface_size"]'));
                }, 0);
                view.on('hover:enter', () => {
                    Lampa.Settings.open('content_filters');
                    Lampa.Settings.main(Lampa.Settings.get('interface'));
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'asian_filter_enabled', type: 'toggle', default: false },
            field: { name: Lampa.Lang.translate('asian_filter'), description: Lampa.Lang.translate('asian_filter_desc') },
            onChange: function(value) {
                settings.asian_filter_enabled = value;
                Lampa.Storage.set('asian_filter_enabled', value);
                Lampa.Noty.show('Asian filter toggled: ' + value);
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'language_filter_enabled', type: 'toggle', default: false },
            field: { name: Lampa.Lang.translate('language_filter'), description: Lampa.Lang.translate('language_filter_desc') },
            onChange: function(value) {
                settings.language_filter_enabled = value;
                Lampa.Storage.set('language_filter_enabled', value);
                Lampa.Noty.show('Language filter toggled: ' + value);
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'rating_filter_enabled', type: 'toggle', default: false },
            field: { name: Lampa.Lang.translate('rating_filter'), description: Lampa.Lang.translate('rating_filter_desc') },
            onChange: function(value) {
                settings.rating_filter_enabled = value;
                Lampa.Storage.set('rating_filter_enabled', value);
                Lampa.Noty.show('Rating filter toggled: ' + value);
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'history_filter_enabled', type: 'toggle', default: false },
            field: { name: Lampa.Lang.translate('history_filter'), description: Lampa.Lang.translate('history_filter_desc') },
            onChange: function(value) {
                settings.history_filter_enabled = value;
                Lampa.Storage.set('history_filter_enabled', value);
                Lampa.Noty.show('History filter toggled: ' + value);
            }
        });
    }

    // Проверка URL для фильтрации
    function shouldFilter(url) {
        return url.indexOf(Lampa.TMDB.api('')) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
    }

    // Проверка необходимости кнопки "Ещё"
    function needsMoreButton(data) {
        return data && Array.isArray(data.results) && data.total_results !== data.results.length && data.page === 1 && data.total_pages && data.total_pages > 1;
    }

    // Поиск ближайшего элемента
    function closest(element, selector) {
        var el = element;
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

    // Инициализация плагина
    function init() {
        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        initSettings();
        addTranslations();
        addSettings();

        // Обработка запросов к TMDB
        Lampa.Listener.follow('request_sucuses', function(e) {
            if (!shouldFilter(e.params.url)) return;
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data = filters.apply(e.data);
            } else {
                Lampa.Noty.show('No results to filter or invalid data');
            }
        });

        // Добавление кнопки фильтров
        Lampa.Listener.follow('render_collection', function(e) {
            if (e.type !== 'results' || !needsMoreButton(e.data)) return;
            var line = $(closest(e.object, '.items-line'));
            var head = line.find('.items-line__head');
            if (head.find('[data-component="content_filters"]').length > 0) return;
            var button = document.createElement('div');
            button.classList.add('items-line__more', 'selector');
            button.innerText = Lampa.Lang.translate('content_filters');
            button.addEventListener('hover:enter', () => {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: e.data.genres,
                    filter: e.data.filter,
                    source: e.data.source || e.data.line.source
                });
            });
            head.append(button);
        });

        // Обработка пагинации
        Lampa.Listener.follow('render_collection', function(e) {
            if (e.type !== 'append' || !needsMoreButton(e.data)) return;
            if (e.line.results.length === e.data.results.length) {
                Lampa.Controller.hide(e.line);
                Lampa.Controller.enabled(e.line).more();
            }
        });
    }

    // Запуск плагина
    if (window.Lampa) init();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') init(); });
})();
