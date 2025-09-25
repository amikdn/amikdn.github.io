(function () {
    'use strict';

    let filtersState = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    let Filters = {
        filters: [
            // фильтр азиатского контента
            function (items) {
                if (!filtersState.asian_filter_enabled) return items;
                const asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                return items.filter(item => {
                    if (!item || !item.original_language) return true;
                    return asianLangs.indexOf(item.original_language.toLowerCase()) === -1;
                });
            },
            // фильтр по языку
            function (items) {
                if (!filtersState.language_filter_enabled) return items;
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
            // фильтр по рейтингу
            function (items) {
                if (!filtersState.rating_filter_enabled) return items;
                return items.filter(item => {
                    if (!item) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },
            // фильтр просмотренного
            function (items) {
                if (!filtersState.history_filter_enabled) return items;
                let history = Lampa.Storage.get('history', '{}');
                let cache = Lampa.Storage.get('cache', []);

                return items.filter(item => {
                    if (!item || !item.original_language) return true;

                    let type = item.media_type;
                    if (!type) type = item.seasons ? 'tv' : 'movie';

                    let viewed = Lampa.Timeline.view(item);

                    if (viewed && viewed.percent === 100) return false;

                    return true;
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
        Lampa.SettingsApi.addComponent({
            component: 'content_filters',
            name: Lampa.Lang.translate('content_filters'),
            type: 'button',
            default: true,
            onRender: fixSettingsUI
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
            onChange: v => {
                filtersState.asian_filter_enabled = v;
                Lampa.Storage.set('asian_filter_enabled', v);
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
            onChange: v => {
                filtersState.language_filter_enabled = v;
                Lampa.Storage.set('language_filter_enabled', v);
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
            onChange: v => {
                filtersState.rating_filter_enabled = v;
                Lampa.Storage.set('rating_filter_enabled', v);
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
            onChange: v => {
                filtersState.history_filter_enabled = v;
                Lampa.Storage.set('history_filter_enabled', v);
            }
        });
    }

    function fixSettingsUI() {
        setTimeout(() => {
            let filterBlock = $(`.settings-param[data-component="content_filters"]`);
            let interfaceBlock = $(`.settings-param[data-component="interface"]`);

            if (filterBlock.length && interfaceBlock.length) {
                interfaceBlock.after(filterBlock);
            }

            filterBlock.find('.settings-param__name').text('Фильтр контента');

            if (!filterBlock.find('.settings-param__icon').length) {
                filterBlock.prepend(`<div class="settings-param__icon"><i class="fas fa-filter"></i></div>`);
            }
        }, 200);
    }

    function init() {
        addLangs();
        addSettings();

        filtersState.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        filtersState.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        filtersState.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
        filtersState.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);

        // перехватываем запросы и фильтруем
        Lampa.Listener.follow('request_secuses', function (e) {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.results = Filters.apply(e.data.results);
            }
        });
    }

    // ждём готовности приложения
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
