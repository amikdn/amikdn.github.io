(function () {
    'use strict';

    // Состояние фильтров
    let filtersState = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    // ======================= ФИЛЬТРЫ =======================
    let Filters = {
        filters: [
            // Фильтр азиатского контента
            function (items) {
                if (!filtersState.asian_filter_enabled) return items;
                return items.filter(it => {
                    if (!it || !it.original_language) return true;
                    let lang = it.original_language.toLowerCase();
                    let asianLangs = [
                        'ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te',
                        'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne',
                        'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az',
                        'kk', 'ky', 'tg', 'tk', 'uz'
                    ];
                    return asianLangs.indexOf(lang) === -1;
                });
            },
            // Фильтр по языку
            function (items) {
                if (!filtersState.language_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    let defLang = Lampa.Storage.get('language', 'en');
                    let origTitle = it.original_title || it.original_name;
                    let title = it.title || it.name;

                    if (it.original_language === defLang) return true;
                    if (it.original_language !== defLang && title !== origTitle) return true;
                    return false;
                });
            },
            // Фильтр по рейтингу
            function (items) {
                if (!filtersState.rating_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    if (it.type === 'trailer' || it.type === 'Trailer' || it.site === 'YouTube') return true;
                    if (!it.vote_average || it.vote_average === 0) return false;
                    return it.vote_average >= 6;
                });
            },
            // Фильтр по истории
            function (items) {
                if (!filtersState.history_filter_enabled) return items;

                let history = Lampa.Storage.get('history', '{}');
                let cache = Lampa.Storage.get('history_cache', []);

                return items.filter(it => {
                    if (!it || !it.original_language) return true;

                    let type = it.media_type;
                    if (!type) type = it.episode_count ? 'tv' : 'movie';

                    // генерируем id для поиска в Timeline
                    let id = Lampa.Utils.hash((it.id || (it.original_title || it.original_name || '')) + '_' + type);
                    let viewed = Lampa.Timeline.view(id);

                    if (viewed && viewed.thrown) return false;
                    if (viewed && viewed.percent && type === 'movie') return false;

                    let episodes1 = collectSeasonsFromTMDB(it.id, history);
                    let episodes2 = collectSeasonsFromCache(it.id, cache);
                    let merged = mergeUniqueEpisodes(episodes1, episodes2);
                    let watchedAll = isWatchedAll(it.original_title || it.original_name, merged);

                    return !watchedAll;
                });
            }
        ],

        apply: function (items) {
            let result = Lampa.Arrays.clone(items);
            for (let i = 0; i < this.filters.length; i++) {
                result = this.filters[i](result);
            }
            return result;
        }
    };

    // ======================= ХЕЛПЕРЫ =======================
    function collectSeasonsFromTMDB(id, history) {
        let entry = history.history
            ? history.history.find(x => x.id === id && Array.isArray(x.seasons) && x.seasons.length > 0)
            : null;
        if (!entry) return [];

        let valid = entry.seasons.filter(season =>
            season.season_number > 0 &&
            season.episode_count > 0 &&
            season.air_date &&
            new Date(season.air_date) < new Date()
        );
        if (valid.length === 0) return [];

        let episodes = [];
        for (let s of valid) {
            for (let e = 1; e <= s.episode_count; e++) {
                episodes.push({
                    season_number: s.season_number,
                    episode_number: e
                });
            }
        }
        return episodes;
    }

    function collectSeasonsFromCache(id, cache) {
        let entry = cache.find(x => x.id === id) || {};
        if (!Array.isArray(entry.seasons) || entry.seasons.length === 0) return [];
        return entry.seasons.filter(season =>
            season.season_number > 0 &&
            season.air_date &&
            new Date(season.air_date) < new Date()
        );
    }

    function mergeUniqueEpisodes(arr1, arr2) {
        let merged = arr1.concat(arr2);
        let unique = [];
        for (let ep of merged) {
            if (!unique.find(x => x.season_number === ep.season_number && x.episode_number === ep.episode_number)) {
                unique.push(ep);
            }
        }
        return unique;
    }

    function isWatchedAll(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let ep of episodes) {
            let id = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join(''));
            let timeline = Lampa.Timeline.view(id);
            if (!timeline || timeline.percent === 0) return false;
        }
        return true;
    }

    // ======================= ЛОКАЛИЗАЦИЯ =======================
    function setupLang() {
        Lampa.Lang.add({
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
                ru: 'Скрываем карточки, названия которых не переведены на язык по умолчанию',
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
                ru: 'Убрать просмотренный контент',
                en: 'Hide Watched Content',
                uk: 'Приховувати переглянуте'
            },
            history_filter_desc: {
                ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть',
                en: 'Hide cards from your viewing history',
                uk: 'Сховати картки з вашої історії перегляду'
            }
        });
    }

    // ======================= НАСТРОЙКИ =======================
    function setupSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'content_filters',
            param: {
                name: 'content_filters',
                type: 'group',
                default: true
            },
            field: {
                name: 'Фильтр контента',
                description: 'Настройка отображения карточек по фильтрам',
                icon: 'filter'
            },
            onRender: function (elem) {
                setTimeout(() => {
                    let uiSection = $('div[data-name="interface_size"]').closest('.settings-param');
                    if (uiSection.length) {
                        uiSection.after(elem);
                    }
                }, 50);
            }
        });

        [
            { key: 'asian_filter_enabled', title: 'asian_filter', desc: 'asian_filter_desc' },
            { key: 'language_filter_enabled', title: 'language_filter', desc: 'language_filter_desc' },
            { key: 'rating_filter_enabled', title: 'rating_filter', desc: 'rating_filter_desc' },
            { key: 'history_filter_enabled', title: 'history_filter', desc: 'history_filter_desc' }
        ].forEach(f => {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: {
                    name: f.key,
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: Lampa.Lang.translate(f.title),
                    description: Lampa.Lang.translate(f.desc),
                    icon: 'dot-circle'
                },
                onChange: v => {
                    filtersState[f.key] = v;
                    Lampa.Storage.set(f.key, v);
                }
            });
        });
    }

    // ======================= ИНИЦИАЛИЗАЦИЯ =======================
    function init() {
        filtersState.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        filtersState.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        filtersState.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
        filtersState.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);

        setupLang();
        setupSettings();

        Lampa.Listener.follow('request_secuses', e => {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    init();
})();
