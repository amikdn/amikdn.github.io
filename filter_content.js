(function () {
    'use strict';

    // --- Состояние фильтров ---
    let filtersState = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    // --- Работа с историей ---
    function collectSeasonsFromTMDB(itemId, historyObj) {
        let found = historyObj.history.filter(x => x.id === itemId && Array.isArray(x.seasons) && x.seasons.length > 0)[0];
        if (!found) return [];
        let ready = [];
        found.seasons.filter(season => season.season_number > 0 && season.episode_count > 0 && season.air_date && new Date(season.air_date) < new Date())
            .forEach(season => {
                for (let ep = 1; ep <= season.episode_count; ep++) {
                    ready.push({ season_number: season.season_number, episode_number: ep });
                }
            });
        return ready;
    }

    function collectSeasonsFromCache(itemId, cache) {
        let found = cache.filter(x => x.id === itemId)[0] || {};
        if (!Array.isArray(found.seasons) || found.seasons.length === 0) return [];
        return found.seasons.filter(s => s.season_number > 0 && s.air_date && new Date(s.air_date) < new Date());
    }

    function mergeUniqueEpisodes(a, b) {
        let all = a.concat(b);
        let unique = [];
        all.forEach(ep => {
            if (!unique.find(x => x.season_number === ep.season_number && x.episode_number === ep.episode_number)) {
                unique.push(ep);
            }
        });
        return unique;
    }

    function isWatchedAll(title, episodes) {
        if (!episodes || episodes.length === 0) return false;
        for (let ep of episodes) {
            let hash = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join(''));
            let tm = Lampa.Timeline.view(hash);
            if (tm.percent === 0) return false;
        }
        return true;
    }

    // --- Основная фильтрация ---
    let Filters = {
        filters: [
            // Азиатский
            function (items) {
                if (!filtersState.asian_filter_enabled) return items;
                let asianLangs = ['ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur','pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az','kk','ky','tg','tk','uz'];
                return items.filter(it => {
                    if (!it || !it.original_language) return true;
                    return asianLangs.indexOf(it.original_language.toLowerCase()) === -1;
                });
            },
            // Языковой
            function (items) {
                if (!filtersState.language_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    let defLang = Lampa.Storage.get('language');
                    let orig = it.original_title || it.original_name;
                    let name = it.title || it.name;
                    if (it.original_language === defLang) return true;
                    if (it.original_language !== defLang && name !== orig) return true;
                    return false;
                });
            },
            // Рейтинговый
            function (items) {
                if (!filtersState.rating_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    let isTrailer = it.type === 'trailer' || it.name === 'Trailer' || it.source === 'YouTube';
                    if (isTrailer) return true;
                    if (!it.vote_average || it.vote_average === 0) return false;
                    return it.vote_average >= 6;
                });
            },
            // История
            function (items) {
                if (!filtersState.history_filter_enabled) return items;
                let history = Lampa.Storage.get('history', '{}');
                let cache = Lampa.Utils.cache('history', 300, []);

                return items.filter(it => {
                    if (!it || !it.original_language) return true;

                    let type = it.media_type;
                    if (!type) type = it.episode_count ? 'tv' : 'movie';

                    let viewed = Lampa.Timeline.hash(it);
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
        apply(items) {
            let res = Lampa.Arrays.clone(items);
            this.filters.forEach(f => res = f(res));
            return res;
        }
    };

    // --- tmdbCheck (всегда true) ---
    function tmdbCheck() {
        return true;
    }

    // --- Локализация ---
    function initLang() {
        Lampa.Lang.add({
            content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
            asian_filter: { ru: 'Убрать азиатский контент', en: 'Remove Asian Content', uk: 'Прибрати азіатський контент' },
            asian_filter_desc: { ru: 'Скрывать карточки азиатского происхождения', en: 'Hide cards of Asian origin', uk: 'Сховати картки азіатського походження' },
            language_filter: { ru: 'Убрать контент на другом языке', en: 'Remove Other Language Content', uk: 'Прибрати контент іншою мовою' },
            language_filter_desc: { ru: 'Скрывать карточки, не переведённые на язык по умолчанию', en: 'Hide cards not translated to the default language', uk: 'Сховати картки без перекладу на мову за замовчуванням' },
            rating_filter: { ru: 'Убрать низкорейтинговый контент', en: 'Remove Low-Rated Content', uk: 'Прибрати контент з низьким рейтингом' },
            rating_filter_desc: { ru: 'Скрывать карточки с рейтингом ниже 6.0', en: 'Hide cards with rating below 6.0', uk: 'Сховати картки з рейтингом нижче 6.0' },
            history_filter: { ru: 'Убрать просмотренное', en: 'Hide Watched Content', uk: 'Приховувати переглянуте' },
            history_filter_desc: { ru: 'Скрывать карточки из истории просмотров', en: 'Hide cards from viewing history', uk: 'Сховати картки з історії перегляду' }
        });
    }

    // --- Настройки ---
    function initSettings() {
        // Раздел "Фильтр контента"
        Lampa.SettingsApi.addComponent({
            component: 'content_filter_plugin',
            param: { name: 'content_filters', type: 'static', default: true },
            icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 18h4v-2h-4v2m-7-6h18v-2H3v2m3-6h12V4H6v2Z"/></svg>',
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            }
        });

        // Переместить под "Интерфейс"
        setTimeout(() => {
            let interfaceLabel = Lampa.Lang.translate('interface');
            let interfaceDiv = $(`.settings-param > div:contains("${interfaceLabel}")`);
            let filtersDiv = $(`.settings-param > div:contains("${Lampa.Lang.translate('content_filters')}")`);
            if (interfaceDiv.length && filtersDiv.length) {
                filtersDiv.insertAfter(interfaceDiv);
            }
        }, 200);

        // Переключатели
        [
            ['asian_filter_enabled','asian_filter','asian_filter_desc'],
            ['language_filter_enabled','language_filter','language_filter_desc'],
            ['rating_filter_enabled','rating_filter','rating_filter_desc'],
            ['history_filter_enabled','history_filter','history_filter_desc']
        ].forEach(([key,name,desc]) => {
            Lampa.SettingsApi.addParam({
                component: 'content_filter_plugin',
                param: { name: key, type: 'trigger', default: false },
                field: {
                    name: Lampa.Lang.translate(name),
                    description: Lampa.Lang.translate(desc)
                },
                onChange: v => {
                    filtersState[key] = v;
                    Lampa.Storage.set(key, v);
                }
            });
        });
    }

    // --- Хук на Card.render ---
    function hookCardRender() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;

        Object.defineProperty(Lampa.Card.prototype, 'render', {
            get() {
                return this._render;
            },
            set(fn) {
                this._render = function () {
                    fn.apply(this);
                    Lampa.Listener.send('lampa_listener_extensions', { type: 'render', object: this });
                }.bind(this);
            }
        });
    }

    // --- События line ---
    function lineEvents() {
        Lampa.Listener.follow('line', e => {
            if (e.type !== 'build' || !tmdbCheck(e.data)) return;

            let lineRoot = $(closest(e.target, '.items-line')).find('.items-line__head');
            let exists = lineRoot.find('.items-line__more').length !== 0;
            if (exists) return;

            let btn = document.createElement('div');
            btn.classList.add('items-line__more','selector');
            btn.innerText = Lampa.Lang.translate('content_filters');
            btn.addEventListener('hover:enter', () => {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('content_filters'),
                    component: 'filters',
                    page: 1,
                    genres: e.params.genres,
                    filter: e.data.filter,
                    source: e.data.source || e.params.source.site
                });
            });
            lineRoot.append(btn);
        });

        Lampa.Listener.follow('line', e => {
            if (e.type !== 'append' || !tmdbCheck(e.data)) return;
            if (e.items.length === e.data.results.length) {
                if (Lampa.Settings.collectionAppend(e.line)) {
                    Lampa.Controller.back(e.line.more());
                }
            }
        });
    }

    // --- closest (кроссбраузерный) ---
    function closest(el, selector) {
        while (el && el !== document) {
            if (el.matches && el.matches(selector)) return el;
            el = el.parentElement || el.parentNode;
        }
        return null;
    }

    // --- Основное ---
    function init() {
        initLang();
        initSettings();
        hookCardRender();
        lineEvents();

        // Загрузить состояния
        filtersState.asian_filter_enabled    = Lampa.Storage.get('asian_filter_enabled', false);
        filtersState.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        filtersState.rating_filter_enabled   = Lampa.Storage.get('rating_filter_enabled', false);
        filtersState.history_filter_enabled  = Lampa.Storage.get('history_filter_enabled', false);

        // Перехват TMDB-результатов
        Lampa.Listener.follow('request_secuses', e => {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    // --- Регистрация ---
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push({
        name: 'Content Filter',
        description: 'Фильтрация карточек по языку, рейтингу, истории и происхождению',
        version: '1.0.0',
        author: 'Deobfuscated'
    });

    init();
})();
