(function () {
    'use strict';

    let filtersState = {
        asian: false,
        language: false,
        rating: false,
        history: false
    };

    const Filters = {
        filters: [
            // Азиатский контент
            function (items) {
                if (!filtersState.asian) return items;
                const asianLangs = [
                    'ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn',
                    'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo',
                    'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'
                ];
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    return asianLangs.indexOf(item.original_language.toLowerCase()) === -1;
                });
            },
            // Фильтр по языку
            function (items) {
                if (!filtersState.language) return items;
                let lang = Lampa.Storage.get('language', 'ru');
                return items.filter(item => {
                    if (!item) return true;
                    let origTitle = item.original_title || item.original_name;
                    let title = item.title || item.name;
                    if (item.original_language === lang) return true;
                    if (item.original_language !== lang && title !== origTitle) return true;
                    return false;
                });
            },
            // Фильтр по рейтингу
            function (items) {
                if (!filtersState.rating) return items;
                return items.filter(item => {
                    if (!item) return true;
                    if (item.media_type === 'person' || item.title_category === 'Trailer') return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },
            // Фильтр просмотренного
            function (items) {
                if (!filtersState.history) return items;

                let history = Lampa.Storage.get('history', '{}');
                let timetable = Lampa.Utils.cache('timetable', 300, []);

                return items.filter(item => {
                    if (!item) return true;

                    let mediaType = item.media_type;
                    if (!mediaType) mediaType = item.seasons ? 'tv' : 'movie';

                    let viewed = Lampa.Timeline.view(item);
                    if (viewed && viewed.percent === 100) return false;

                    if (mediaType === 'movie') return true;

                    let watchedEpisodes = collectEpisodesFromHistory(item.id, history);
                    let airedEpisodes = collectEpisodesFromTimetable(item.id, timetable);
                    let allEpisodes = mergeEpisodes(watchedEpisodes, airedEpisodes);

                    return !allWatched(item.original_title || item.original_name, allEpisodes);
                });
            }
        ],
        apply: function (items) {
            let result = Lampa.Arrays.clone(items);
            for (let f of this.filters) result = f(result);
            return result;
        }
    };

    // --- Вспомогательные функции для сериалов ---

    function collectEpisodesFromHistory(id, historyObj) {
        let entry = (historyObj.history || []).find(h => h.id === id && Array.isArray(h.seasons) && h.seasons.length > 0);
        if (!entry) return [];

        let result = [];
        entry.seasons.filter(season =>
            season.season_number > 0 && season.episode_count > 0 && season.air_date && new Date(season.air_date) < new Date()
        ).forEach(season => {
            for (let i = 1; i <= season.episode_count; i++) {
                result.push({
                    season_number: season.season_number,
                    episode_number: i
                });
            }
        });
        return result;
    }

    function collectEpisodesFromTimetable(id, timetable) {
        let entry = timetable.find(h => h.id === id) || {};
        if (!Array.isArray(entry.episodes) || entry.episodes.length === 0) return [];
        return entry.episodes.filter(ep => ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date());
    }

    function mergeEpisodes(list1, list2) {
        let merged = list1.concat(list2);
        let unique = [];
        for (let ep of merged) {
            if (!unique.find(e => e.season_number === ep.season_number && e.episode_number === ep.episode_number)) {
                unique.push(ep);
            }
        }
        return unique;
    }

    function allWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let ep of episodes) {
            let hash = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join(''));
            let viewed = Lampa.Timeline.hash(hash);
            if (viewed.percent === 0) return false;
        }
        return true;
    }

    // --- Настройки ---

    function addLangs() {
        Lampa.Lang.add({
            content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
            asian_filter: { ru: 'Убрать азиатский контент', en: 'Remove Asian Content', uk: 'Прибрати азіатський контент' },
            asian_filter_desc: { ru: 'Скрываем карточки азиатского происхождения', en: 'Hide cards of Asian origin', uk: 'Сховати картки азіатського походження' },
            language_filter: { ru: 'Убрать контент на другом языке', en: 'Remove Other Language Content', uk: 'Прибрати контент іншою мовою' },
            language_filter_desc: { ru: 'Скрываем карточки, названия которых не переведены на язык по умолчанию', en: 'Hide cards not translated to the default language', uk: 'Сховати картки, які не перекладені на мову за замовчуванням' },
            rating_filter: { ru: 'Убрать низкорейтинговый контент', en: 'Remove Low-Rated Content', uk: 'Сховати картки з рейтингом нижче 6.0' },
            rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0', en: 'Hide cards with a rating below 6.0', uk: 'Сховати картки з рейтингом нижче 6.0' },
            history_filter: { ru: 'Убрать просмотренный контент', en: 'Hide Watched Content', uk: 'Приховувати переглянуте' },
            history_filter_desc: { ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть', en: 'Hide cards from your viewing history', uk: 'Сховати картки з вашої історії перегляду' }
        });
    }

    function addSettings() {
        // Группа настроек "Фильтр контента"
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters', type: 'group', default: true },
            field: { name: Lampa.Lang.translate('content_filters'), description: 'Настройка отображения карточек по фильтрам' }
        });

        const opts = [
            ['asian', 'asian_filter', 'asian_filter_desc'],
            ['language', 'language_filter', 'language_filter_desc'],
            ['rating', 'rating_filter', 'rating_filter_desc'],
            ['history', 'history_filter', 'history_filter_desc']
        ];

        opts.forEach(([key, name, desc]) => {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: key, type: 'trigger', default: false },
                field: { name: Lampa.Lang.translate(name), description: Lampa.Lang.translate(desc) },
                onChange: v => { filtersState[key] = v; Lampa.Storage.set(`${key}_filter_enabled`, v); }
            });
        });
    }

    // --- Вставка кнопки "Фильтр контента" в списки ---

    function injectFilterButton() {
        Lampa.Listener.follow('line', e => {
            if (!e.data || !Array.isArray(e.data.results)) return;

            let line = $(e.node).closest('.items-line');
            if (!line.length || line.find('.items-line__more[data-filter-content]').length) return;

            let btn = document.createElement('div');
            btn.classList.add('items-line__more', 'selector');
            btn.innerText = Lampa.Lang.translate('content_filters');
            btn.dataset.filterContent = '1';

            btn.addEventListener('hover:enter', () => {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('content_filters'),
                    component: 'filter_content_plugin',
                    page: 1,
                    genres: e.data.genres,
                    filter: e.data.filter,
                    source: e.data.source
                });
            });

            line.find('.items-line__head').append(btn);
        });
    }

    // --- Инициализация ---

    function init() {
        addLangs();
        addSettings();
        injectFilterButton();

        filtersState.asian = Lampa.Storage.get('asian_filter_enabled', false);
        filtersState.language = Lampa.Storage.get('language_filter_enabled', false);
        filtersState.rating = Lampa.Storage.get('rating_filter_enabled', false);
        filtersState.history = Lampa.Storage.get('history_filter_enabled', false);

        Lampa.Listener.follow('request_secuses', e => {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') init(); });
})();
