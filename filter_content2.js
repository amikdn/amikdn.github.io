(function() {
    'use strict';

    // Инициализация платформы Lampa
    Lampa.Platform.tv();

    // Настройки фильтров
    const filterSettings = {
        asian_filter_enabled: Lampa.Storage.get('asian_filter_enabled', false),
        language_filter_enabled: Lampa.Storage.get('language_filter_enabled', false),
        quality_filter_enabled: Lampa.Storage.get('quality_filter_enabled', false),
        rating_filter_enabled: Lampa.Storage.get('rating_filter_enabled', false),
        history_filter_enabled: Lampa.Storage.get('history_filter_enabled', false)
    };

    // Фильтры контента
    const contentFilters = {
        filters: [
            // Фильтр азиатского контента
            function(items) {
                if (!filterSettings.asian_filter_enabled) return items;
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    const lang = item.original_language.toLowerCase();
                    const asianLanguages = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLanguages.indexOf(lang) === -1;
                });
            },
            // Фильтр по языку
            function(items) {
                if (!filterSettings.language_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    const defaultLang = Lampa.Storage.get('language');
                    const originalTitle = item.original_title || item.original_name;
                    const title = item.title || item.name;
                    return item.original_language === defaultLang || title !== originalTitle;
                });
            },
            // Фильтр по рейтингу
            function(items) {
                if (!filterSettings.rating_filter_enabled) return items;
                return items.filter(item => item && item.vote_average >= 6);
            },
            // Фильтр по истории просмотров
            function(items) {
                if (!filterSettings.history_filter_enabled) return items;
                const favoriteData = Lampa.Storage.get('favorite', '{}');
                const timelineData = Lampa.Storage.get('timetable', 300, []);
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    let mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    const favorite = Lampa.Favorite.check(item);
                    const isInFavorite = favorite && favorite.own;
                    const isThrown = favorite && favorite.thrown;
                    if (isThrown) return false;
                    if (!isInFavorite) return true;
                    if (isInFavorite && mediaType === 'movie') return false;
                    const favoriteEpisodes = getFavoriteEpisodes(item.id, favoriteData);
                    const timelineEpisodes = getTimelineEpisodes(item.id, timelineData);
                    const allEpisodes = combineEpisodes(favoriteEpisodes, timelineEpisodes);
                    return !isAllEpisodesWatched(item.original_title || item.original_name, allEpisodes);
                });
            },
            // Фильтр по качеству TS
            function(items) {
                if (!filterSettings.quality_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    const quality = item.quality || '';
                    return quality.toLowerCase() !== 'ts';
                });
            }
        ],
        apply: function(items) {
            let result = Lampa.Arrays.clone(items);
            for (let filter of this.filters) {
                result = filter(result);
            }
            return result;
        }
    };

    // Получение эпизодов из избранного
    function getFavoriteEpisodes(id, favoriteData) {
        const card = favoriteData.card?.find(item => item.id === id && Array.isArray(item.seasons) && item.seasons.length > 0);
        if (!card) return [];
        const episodes = card.seasons.filter(season => 
            season.season_number > 0 && season.episode_count > 0 && season.air_date && new Date(season.air_date) < new Date()
        );
        if (episodes.length === 0) return [];
        const result = [];
        for (let season of episodes) {
            for (let episode = 1; episode <= season.episode_count; episode++) {
                result.push({ season_number: season.season_number, episode_number: episode });
            }
        }
        return result;
    }

    // Получение эпизодов из таймлайна
    function getTimelineEpisodes(id, timelineData) {
        const item = timelineData.find(item => item.id === id) || {};
        if (!Array.isArray(item.episodes) || item.episodes.length === 0) return [];
        return item.episodes.filter(episode => 
            episode.season_number > 0 && episode.air_date && new Date(episode.air_date) < new Date()
        );
    }

    // Объединение эпизодов
    function combineEpisodes(favoriteEpisodes, timelineEpisodes) {
        const combined = favoriteEpisodes.concat(timelineEpisodes);
        const result = [];
        for (let episode of combined) {
            if (!result.some(e => e.season_number === episode.season_number && e.episode_number === episode.episode_number)) {
                result.push(episode);
            }
        }
        return result;
    }

    // Проверка, просмотрены ли все эпизоды
    function isAllEpisodesWatched(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let episode of episodes) {
            const hash = Lampa.Utils.hash([episode.season_number, episode.season_number > 10 ? ':' : '', episode.episode_number, title].join(''));
            const progress = Lampa.Timeline.get(hash);
            if (progress.percent === 0) return false;
        }
        return true;
    }

    // Проверка валидности URL
    function isValidUrl(url) {
        return url.indexOf(Lampa.TMDB.api('')) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
    }

    // Проверка данных
    function isValidData(data) {
        return data && Array.isArray(data.results) && 
               data.original_length !== data.results.length && 
               data.page === 1 && 
               data.total_pages && data.total_pages > 1;
    }

    // Поиск ближайшего элемента
    function findClosest(element, selector) {
        if (element && element.matches?.(selector)) return element;
        let current = element;
        while (current && current !== document) {
            if (current.matches?.(selector)) return current;
            if (current.className?.indexOf(selector.replace('.', '')) !== -1) return current;
            current = current.parentElement || current.parentNode;
        }
        return null;
    }

    // Добавление переводов
    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
            asian_filter: { ru: 'Убрать азиатский контент', en: 'Remove Asian Content', uk: 'Прибрати азіатський контент' },
            asian_filter_desc: { ru: 'Скрываем карточки азиатского происхождения', en: 'Hide cards of Asian origin', uk: 'Сховати картки азіатського походження' },
            language_filter: { ru: 'Убрать контент на другом языке', en: 'Remove Other Language Content', uk: 'Прибрати контент іншою мовою' },
            language_filter_desc: { ru: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию', en: 'Hide cards not translated to the default language', uk: 'Сховати картки, які не перекладені на мову за замовчуванням' },
            quality_filter: { ru: 'Убрать контент с качеством TS', en: 'Remove TS Quality Content', uk: 'Прибрати контент з якістю TS' },
            quality_filter_desc: { ru: 'Скрываем карточки, на которых есть отметки качества TS', en: 'Hide cards marked as TS quality', uk: 'Сховати картки, позначені як TS' },
            rating_filter: { ru: 'Убрать низкорейтинговый контент', en: 'Remove Low-Rated Content', uk: 'Прибрати низько рейтинговий контент' },
            rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0', en: 'Hide cards with a rating below 6.0', uk: 'Сховати картки з рейтингом нижче 6.0' },
            history_filter: { ru: 'Убрать просмотренный контент', en: 'Hide Watched Content', uk: 'Приховувати переглянуте' },
            history_filter_desc: { ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть', en: 'Hide cards from your viewing history', uk: 'Сховати картки з вашої історії перегляду' }
        });
    }

    // Добавление настроек
    function addSettings() {
        Lampa.SettingsApi.listener.follow('open', (e) => {
            if (e.name !== 'main') return;
            if (Lampa.Settings.main().render().find('[data-component="content_filters"]').length === 0) {
                Lampa.SettingsApi.addComponent({
                    component: 'content_filters',
                    name: Lampa.Lang.translate('content_filters')
                });
            }
            Lampa.Settings.main().render();
            Lampa.Settings.main().render().find('[data-component="content_filters"]').addClass('hide');
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'content_filters', type: 'static', default: true },
            field: { name: Lampa.Lang.translate('content_filters'), description: 'Настройка отображения карточек по фильтрам' },
            onRender: (element) => {
                setTimeout(() => {
                    const title = Lampa.Lang.translate('content_filters');
                    $(`.settings-param > div:contains("${title}")`).parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                element.on('hover:enter', () => {
                    Lampa.Settings.create('content_filters');
                    Lampa.Settings.render().controller.back = () => Lampa.Settings.create('main');
                });
            }
        });

        const filters = [
            { name: 'asian_filter_enabled', title: 'asian_filter', desc: 'asian_filter_desc' },
            { name: 'language_filter_enabled', title: 'language_filter', desc: 'language_filter_desc' },
            { name: 'quality_filter_enabled', title: 'quality_filter', desc: 'quality_filter_desc' },
            { name: 'rating_filter_enabled', title: 'rating_filter', desc: 'rating_filter_desc' },
            { name: 'history_filter_enabled', title: 'history_filter', desc: 'history_filter_desc' }
        ];

        for (let filter of filters) {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: filter.name, type: 'trigger', default: false },
                field: {
                    name: Lampa.Lang.translate(filter.title),
                    description: Lampa.Lang.translate(filter.desc)
                },
                onChange: (value) => {
                    filterSettings[filter.name] = value;
                    Lampa.Storage.set(filter.name, value);
                }
            });
        }
    }

    // Перехват построения карточек
    function overrideCardBuild() {
        Object.defineProperty(Lampa.Card.prototype, 'build', {
            get: function() { return this._build; },
            set: function(func) {
                this._build = () => {
                    func.apply(this);
                    Lampa.Listener.follow('card', { type: 'build', object: this });
                };
            }
        });
    }

    // Основная функция плагина
    function initPlugin() {
        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        overrideCardBuild();
        addTranslations();
        addSettings();

        // Скрытие карточек с качеством TS
        Lampa.Listener.follow('card', (e) => {
            if (e.type !== 'build' || !filterSettings.quality_filter_enabled) return;
            if (!e.object?.card) return;
            const quality = e.object.card.querySelector('.card__quality div');
            if (quality?.textContent.trim().toLowerCase() === 'ts') {
                e.object.card.style.display = 'none';
            }
        });

        // Добавление кнопки "Больше"
        Lampa.Listener.follow('line', (e) => {
            if (e.type !== 'append' || !isValidData(e.data)) return;
            const head = $(findClosest(e.body, '.items-line')).find('.items-line__head');
            if (head.find('.items-line__more').length !== 0) return;
            const moreButton = document.createElement('div');
            moreButton.classList.add('items-line__more', 'selector');
            moreButton.innerText = Lampa.Lang.translate('more');
            moreButton.addEventListener('hover:enter', () => {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title_category || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: e.params.genres,
                    filter: e.data.filter,
                    source: e.data.source || e.params.object.source
                });
            });
            head.append(moreButton);
        });

        // Автоматический вызов кнопки "Больше"
        Lampa.Listener.follow('line', (e) => {
            if (e.type !== 'append' || !isValidData(e.data)) return;
            if (e.items.length === e.data.results.length && Lampa.Controller.own(e.line)) {
                Lampa.Controller.collectionAppend(e.line.more());
            }
        });

        // Применение фильтров к данным
        Lampa.Listener.follow('request_secuses', (e) => {
            if (!isValidUrl(e.params.url) || !e.data || !Array.isArray(e.data.results)) return;
            e.data.original_length = e.data.results.length;
            e.data.results = contentFilters.apply(e.data.results);
        });
    }

    // Инициализация плагина
    if (window.content_filter_plugin) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
