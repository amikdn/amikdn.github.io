(function () {
    'use strict';

    let filtersState = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false,
    };

    let Filters = {
        filters: [
            // азиатский контент
            function (items) {
                if (!filtersState.asian_filter_enabled) return items;
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    let lang = item.original_language.toLowerCase();
                    let asianLangs = ['ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur',
                        'pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az',
                        'kk','ky','tg','tk','uz'];
                    return asianLangs.indexOf(lang) === -1;
                });
            },
            // язык
            function (items) {
                if (!filtersState.language_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    let defLang = Lampa.Storage.get('language');
                    let orig = item.original_title || item.original_name;
                    let name = item.title || item.name;
                    if (item.original_language === defLang) return true;
                    if (item.original_language !== defLang && name !== orig) return true;
                    return false;
                });
            },
            // рейтинг
            function (items) {
                if (!filtersState.rating_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },
            // просмотренное
            function (items) {
                if (!filtersState.history_filter_enabled) return items;
                let history = Lampa.Storage.get('history', '{}');
                return items.filter(item => {
                    if (!item) return true;
                    let viewed = Lampa.Timeline.hash(item);
                    if (viewed && viewed.percent >= 1) return false;
                    return true;
                });
            }
        ],
        apply(items) {
            let result = Lampa.Arrays.clone(items);
            this.filters.forEach(f => result = f(result));
            return result;
        }
    };

    // Переводы
    function initLang() {
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
                ru: 'Скрывать карточки азиатского происхождения',
                en: 'Hide cards of Asian origin',
                uk: 'Сховати картки азіатського походження'
            },
            language_filter: {
                ru: 'Убрать контент на другом языке',
                en: 'Remove Other Language Content',
                uk: 'Прибрати контент іншою мовою'
            },
            language_filter_desc: {
                ru: 'Скрывать карточки, не переведённые на язык по умолчанию',
                en: 'Hide cards not translated to the default language',
                uk: 'Сховати картки без перекладу на мову за замовчуванням'
            },
            rating_filter: {
                ru: 'Убрать низкорейтинговый контент',
                en: 'Remove Low-Rated Content',
                uk: 'Прибрати контент з низьким рейтингом'
            },
            rating_filter_desc: {
                ru: 'Скрывать карточки с рейтингом ниже 6.0',
                en: 'Hide cards with rating below 6.0',
                uk: 'Сховати картки з рейтингом нижче 6.0'
            },
            history_filter: {
                ru: 'Убрать просмотренное',
                en: 'Hide Watched Content',
                uk: 'Приховувати переглянуте'
            },
            history_filter_desc: {
                ru: 'Скрывать карточки из истории просмотров',
                en: 'Hide cards from viewing history',
                uk: 'Сховати картки з історії перегляду'
            }
        });
    }

    // Настройки
    function initSettings() {
        // Раздел
        Lampa.SettingsApi.addComponent({
            component: 'content_filter_plugin',
            name: 'filters', // уникальный id
            icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 18h4v-2h-4v2m-7-6h18v-2H3v2m3-6h12V4H6v2Z"/></svg>',
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            }
        });

        // Переключатели
        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('asian_filter'),
                description: Lampa.Lang.translate('asian_filter_desc')
            },
            onChange: v => {
                filtersState.asian_filter_enabled = v;
                Lampa.Storage.set('asian_filter_enabled', v);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'language_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('language_filter'),
                description: Lampa.Lang.translate('language_filter_desc')
            },
            onChange: v => {
                filtersState.language_filter_enabled = v;
                Lampa.Storage.set('language_filter_enabled', v);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'rating_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('rating_filter'),
                description: Lampa.Lang.translate('rating_filter_desc')
            },
            onChange: v => {
                filtersState.rating_filter_enabled = v;
                Lampa.Storage.set('rating_filter_enabled', v);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filter_plugin',
            param: { name: 'history_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('history_filter'),
                description: Lampa.Lang.translate('history_filter_desc')
            },
            onChange: v => {
                filtersState.history_filter_enabled = v;
                Lampa.Storage.set('history_filter_enabled', v);
            }
        });
    }

    function init() {
        initLang();
        initSettings();

        // Перехват запросов и применение фильтров
        Lampa.Listener.follow('request_secuses', e => {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    // Регистрация плагина
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push({
        name: 'Content Filter',
        description: 'Фильтрация карточек по языку, рейтингу, истории',
        version: '1.1.0',
        author: 'Custom'
    });

    init();
})();
