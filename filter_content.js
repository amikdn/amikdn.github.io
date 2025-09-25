(function () {
    'use strict';

    let filtersState = {
        asian: false,
        language: false,
        rating: false,
        history: false
    };

    let Filters = {
        filters: [
            // Убрать азиатский контент
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
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },
            // Фильтр просмотренного
            function (items) {
                if (!filtersState.history) return items;

                let history = Lampa.Storage.get('history', '{}');
                let timetable = Lampa.Storage.get('timetable', []);

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
            for (let f of this.filters) {
                result = f(result);
            }
            return result;
        }
    };

    // собрать эпизоды из истории
    function collectEpisodesFromHistory(id, history) {
        let data = history[id];
        if (!data || !Array.isArray(data.episodes)) return [];
        return data.episodes.filter(ep =>
            ep.season_number > 0 &&
            ep.episode_number > 0 &&
            ep.air_date &&
            new Date(ep.air_date) < new Date()
        );
    }

    // собрать эпизоды из расписания
    function collectEpisodesFromTimetable(id, timetable) {
        let item = timetable.find(el => el.id === id) || {};
        if (!Array.isArray(item.seasons)) return [];
        return item.seasons.filter(season =>
            season.season_number > 0 &&
            season.air_date &&
            new Date(season.air_date) < new Date()
        );
    }

    // объединение эпизодов
    function mergeEpisodes(a, b) {
        let all = a.concat(b);
        let uniq = [];
        for (let ep of all) {
            if (!uniq.find(u => u.season_number === ep.season_number && u.episode_number === ep.episode_number)) {
                uniq.push(ep);
            }
        }
        return uniq;
    }

    // проверка — все ли эпизоды просмотрены
    function allWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let ep of episodes) {
            let hash = Lampa.Timeline.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join(''));
            let viewed = Lampa.Timeline.view(hash);
            if (viewed.percent === 0) return false;
        }
        return true;
    }

    function addLangs() {
        Lampa.Lang.add({
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
                ru: 'Скрываем карточки, названия которых не переведены на язык по умолчанию',
                en: 'Hide cards not translated to the default language',
                uk: 'Сховати картки, які не перекладені на мову за замовчуванням'
            },
            rating_filter: {
                ru: 'Убрать низкорейтинговый контент',
                en: 'Remove Low-Rated Content',
                uk: 'Сховати картки з рейтингом нижче 6.0'
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

    function addSettings() {
        // заголовок «Фильтр контента» под «Размер интерфейса»
        let header = Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters_header', type: 'static' },
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            }
        });

        // вставляем после пункта interface_size
        setTimeout(() => {
            let target = document.querySelector('div[data-name="interface_size"]');
            if (target && header && header.render) {
                target.parentNode.insertBefore(header.render(), target.nextSibling);
            }
        }, 10);

        // переключатели
        [
            ['asian', 'asian_filter', 'asian_filter_desc'],
            ['language', 'language_filter', 'language_filter_desc'],
            ['rating', 'rating_filter', 'rating_filter_desc'],
            ['history', 'history_filter', 'history_filter_desc']
        ].forEach(([key, name, desc]) => {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: `${key}_filter_enabled`, type: 'trigger', default: false },
                field: { name: Lampa.Lang.translate(name), description: Lampa.Lang.translate(desc) },
                onChange: v => {
                    filtersState[key] = v;
                    Lampa.Storage.set(`${key}_filter_enabled`, v);
                }
            });
        });
    }

    function init() {
        addLangs();
        addSettings();

        filtersState.asian = Lampa.Storage.get('asian_filter_enabled', false);
        filtersState.language = Lampa.Storage.get('language_filter_enabled', false);
        filtersState.rating = Lampa.Storage.get('rating_filter_enabled', false);
        filtersState.history = Lampa.Storage.get('history_filter_enabled', false);

        Lampa.Listener.follow('request_secuses', e => {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') init();
        });
    }
})();
