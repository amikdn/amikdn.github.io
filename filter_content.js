(function () {
    'use strict';

    // Состояние фильтров
    let filtersState = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false,
    };

    // Фильтры
    let Filters = {
        filters: [
            // Азиатский контент
            function (items) {
                if (!filtersState.asian_filter_enabled) return items;
                return items.filter(it => {
                    if (!it || !it.original_language) return true;
                    let asian = [
                        'ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur',
                        'pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az',
                        'kk','ky','tg','tk','uz'
                    ];
                    return asian.indexOf(it.original_language.toLowerCase()) === -1;
                });
            },
            // Язык
            function (items) {
                if (!filtersState.language_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    let def = Lampa.Storage.get('language');
                    let orig = it.original_title || it.original_name;
                    let name = it.title || it.name;
                    if (it.original_language === def) return true;
                    if (it.original_language !== def && name !== orig) return true;
                    return false;
                });
            },
            // Рейтинг
            function (items) {
                if (!filtersState.rating_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    if (!it.vote_average || it.vote_average === 0) return false;
                    return it.vote_average >= 6;
                });
            },
            // Просмотренное
            function (items) {
                if (!filtersState.history_filter_enabled) return items;
                return items.filter(it => {
                    if (!it) return true;
                    let viewed = Lampa.Timeline.hash(it);
                    return !(viewed && viewed.percent >= 1);
                });
            }
        ],
        apply(items) {
            let res = Lampa.Arrays.clone(items);
            this.filters.forEach(f => res = f(res));
            return res;
        }
    };

    // Локализация
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
        // Добавляем раздел
        Lampa.SettingsApi.addComponent({
            component: 'content_filter_plugin',
            param: { name: 'content_filters', type: 'static', default: true },
            icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 18h4v-2h-4v2m-7-6h18v-2H3v2m3-6h12V4H6v2Z"/></svg>',
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            }
        });

        // Перемещаем под "Интерфейс"
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

    // Основная инициализация
    function init() {
        initLang();
        initSettings();

        // применяем фильтры ко всем данным TMDB
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
        description: 'Фильтрация карточек по языку, рейтингу и истории',
        version: '1.3.0',
        author: 'Custom'
    });

    init();
})();
