(function () {
    'use strict';

    // Включенные фильтры (по умолчанию выключены)
    let filtersState = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false,
    };

    // Логика применения фильтров
    let Filters = {
        filters: [
            // Фильтр азиатского контента
            function (items) {
                if (!filtersState.asian_filter_enabled) return items;

                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    let lang = item.original_language.toLowerCase();
                    let asianLangs = [
                        'ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur',
                        'pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az',
                        'kk','ky','tg','tk','uz'
                    ];
                    return asianLangs.indexOf(lang) === -1;
                });
            },

            // Фильтр по языку
            function (items) {
                if (!filtersState.language_filter_enabled) return items;

                return items.filter(item => {
                    if (!item) return true;

                    let defLang = Lampa.Storage.get('language');
                    let title = item.original_title || item.original_name;
                    let name = item.title || item.name;

                    if (item.original_language === defLang) return true;
                    if (item.original_language !== defLang && name !== title) return true;

                    return false;
                });
            },

            // Фильтр по рейтингу
            function (items) {
                if (!filtersState.rating_filter_enabled) return items;

                return items.filter(item => {
                    if (!item) return true;

                    let isTrailer =
                        item.type === 'trailer' ||
                        item.name === 'Trailer' ||
                        item.site === 'YouTube' ||
                        (item.title && item.title && item.title.toLowerCase().indexOf('trailer') !== -1);

                    if (isTrailer) return true;

                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },

            // Фильтр просмотренной истории
            function (items) {
                if (!filtersState.history_filter_enabled) return items;

                let history = Lampa.Storage.get('history', '{}');
                let cache = Lampa.Storage.cache('timeline', 300, []);

                return items.filter(item => {
                    if (!item || !item.original_language) return true;

                    let mediaType = item.media_type;
                    if (!mediaType) mediaType = item.seasons ? 'tv' : 'movie';

                    let viewed = Lampa.Timeline.hash(item);
                    let hasHistory = viewed && viewed.percent;
                    let thrown = viewed && viewed.thrown;

                    if (thrown) return false;
                    if (!hasHistory) return true;
                    if (hasHistory && mediaType === 'movie') return false;

                    // Проверка серий и сезонов
                    let episodesWatched = getWatchedEpisodes(item.id, history);
                    let episodesCache = getCachedEpisodes(item.id, cache);
                    let merged = mergeEpisodes(episodesWatched, episodesCache);

                    return !checkTimeline(item.title || item.original_name, merged);
                });
            },
        ],

        // Применение фильтров
        apply: function (items) {
            let filtered = Lampa.Arrays.clone(items);
            for (let i = 0; i < this.filters.length; i++) {
                filtered = this.filters[i](filtered);
            }
            return filtered;
        },
    };

    // Проверка просмотренных эпизодов
    function getWatchedEpisodes(id, history) {
        let found = history.timeline.filter(obj => {
            return obj.id === id && Array.isArray(obj.seasons) && obj.seasons.length > 0;
        })[0];
        if (!found) return [];

        let result = [];
        found.seasons.filter(season => {
            return season.season_number > 0 &&
                season.episode_count > 0 &&
                season.air_date &&
                new Date(season.air_date) < new Date();
        }).forEach(season => {
            for (let i = 1; i <= season.episode_count; i++) {
                result.push({ season_number: season.season_number, episode_number: i });
            }
        });
        return result;
    }

    // Кэшированные эпизоды
    function getCachedEpisodes(id, cache) {
        let found = cache.filter(obj => obj.id === id)[0] || {};
        if (!Array.isArray(found.episodes) || found.episodes.length === 0) return [];
        return found.episodes.filter(ep => {
            return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
    }

    // Слияние эпизодов
    function mergeEpisodes(a, b) {
        let arr = a.concat(b);
        let unique = [];
        arr.forEach(ep => {
            let exists = unique.some(e => e.season_number === ep.season_number && e.episode_number === ep.episode_number);
            if (!exists) unique.push(ep);
        });
        return unique;
    }

    // Проверка прогресса в таймлайне
    function checkTimeline(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let ep of episodes) {
            let hash = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join(''));
            let progress = Lampa.Timeline.view(hash);
            if (progress.percent === 0) return false;
        }
        return true;
    }

    // Переводы
    function initLang() {
        Lampa.Lang.add({
            content_filters: {
                ru: 'Фильтр контента',
                en: 'Content Filter',
                uk: 'Фільтр контенту',
            },
            asian_filter: {
                ru: 'Убрать азиатский контент',
                en: 'Remove Asian Content',
                uk: 'Прибрати азіатський контент',
            },
            asian_filter_desc: {
                ru: 'Скрываем карточки азиатского происхождения',
                en: 'Hide cards of Asian origin',
                uk: 'Сховати картки азіатського походження',
            },
            language_filter: {
                ru: 'Убрать контент на другом языке',
                en: 'Remove Other Language Content',
                uk: 'Прибрати контент іншою мовою',
            },
            language_filter_desc: {
                ru: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию',
                en: 'Hide cards not translated to the default language',
                uk: 'Сховати картки, які не перекладені на мову за замовчуванням',
            },
            rating_filter: {
                ru: 'Убрать низкорейтинговый контент',
                en: 'Remove Low-Rated Content',
                uk: 'Прибрати низько рейтинговий контент',
            },
            rating_filter_desc: {
                ru: 'Скрываем карточки с рейтингом ниже 6.0',
                en: 'Hide cards with a rating below 6.0',
                uk: 'Сховати картки з рейтингом нижче 6.0',
            },
            history_filter: {
                ru: 'Убрать просмотренный контент',
                en: 'Hide Watched Content',
                uk: 'Приховувати переглянуте',
            },
            history_filter_desc: {
                ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть',
                en: 'Hide cards from your viewing history',
                uk: 'Сховати картки з вашої історії перегляду',
            },
        });
    }

    // Настройки
    function initSettings() {
        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('asian_filter'),
                description: Lampa.Lang.translate('asian_filter_desc'),
            },
            onChange: v => {
                filtersState.asian_filter_enabled = v;
                Lampa.Storage.set('asian_filter_enabled', v);
            },
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'language_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('language_filter'),
                description: Lampa.Lang.translate('language_filter_desc'),
            },
            onChange: v => {
                filtersState.language_filter_enabled = v;
                Lampa.Storage.set('language_filter_enabled', v);
            },
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'rating_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('rating_filter'),
                description: Lampa.Lang.translate('rating_filter_desc'),
            },
            onChange: v => {
                filtersState.rating_filter_enabled = v;
                Lampa.Storage.set('rating_filter_enabled', v);
            },
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'history_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('history_filter'),
                description: Lampa.Lang.translate('history_filter_desc'),
            },
            onChange: v => {
                filtersState.history_filter_enabled = v;
                Lampa.Storage.set('history_filter_enabled', v);
            },
        });
    }

    // Инициализация
    function init() {
        initLang();
        initSettings();

        Lampa.Listener.follow('request_secuses', e => {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    // Регистрация плагина
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push({ name: 'Content Filter', version: '1.0.0' });

    init();
})();
