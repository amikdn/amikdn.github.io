(function () {
    'use strict';

    // Проверяем, что плагин ещё не загружен
    if (window.content_filter_plugin) return;
    window.content_filter_plugin = true;

    // Объект для хранения настроек фильтров
    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    // Переводы для интерфейса
    function addTranslations() {
        Lampa.Lang.add({
            content_filters: {
                ru: 'Фильтр интерфейса',
                en: 'Content Filter',
                uk: 'Фільтр інтерфейсу',
                be: 'Фільтр інтэрфейсу',
                pt: 'Filtro de Conteúdo',
                zh: '内容过滤器'
            },
            asian_filter: {
                ru: 'Убрать азиатский контент',
                en: 'Remove Asian Content',
                uk: 'Прибрати азіатський контент',
                be: 'Схаваць азіяцкі кантэнт',
                pt: 'Ocultar conteúdo asiático',
                zh: '隐藏亚洲内容'
            },
            asian_filter_desc: {
                ru: 'Скрываем карточки азиатского происхождения',
                en: 'Hide cards of Asian origin',
                uk: 'Сховати картки азіатського походження',
                be: 'Схаваць карткі азіяцкага паходжання',
                pt: 'Oculta cartões de origem asiática',
                zh: '隐藏亚洲来源的卡片'
            },
            language_filter: {
                ru: 'Убрать контент на другом языке',
                en: 'Remove Other Language Content',
                uk: 'Прибрати контент іншою мовою',
                be: 'Схаваць кантэнт на іншай мове',
                pt: 'Remover conteúdo em outro idioma',
                zh: '移除其他语言内容'
            },
            language_filter_desc: {
                ru: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию',
                en: 'Hide cards not translated to the default language',
                uk: 'Сховати картки, які не перекладені на мову за замовчуванням',
                be: 'Схаваць карткі, якія не перакладзены на мову па змаўчанні',
                pt: 'Ocultar cartões não traduzidos para o idioma padrão',
                zh: '隐藏未翻译为默认语言的卡片'
            },
            rating_filter: {
                ru: 'Убрать низкорейтинговый контент',
                en: 'Remove Low-Rated Content',
                uk: 'Прибрати низько рейтинговий контент',
                be: 'Схаваць нізка рэйтынгавы кантэнт',
                pt: 'Remover conteúdo de baixa classificação',
                zh: '移除低评分内容'
            },
            rating_filter_desc: {
                ru: 'Скрываем карточки с рейтингом ниже 6.0',
                en: 'Hide cards with a rating below 6.0',
                uk: 'Сховати картки з рейтингом нижче 6.0',
                be: 'Схаваць карткі з рэйтынгам ніжэй за 6.0',
                pt: 'Ocultar cartões com classificação abaixo de 6.0',
                zh: '隐藏评分低于6.0的卡片'
            },
            history_filter: {
                ru: 'Убрать просмотренный контент',
                en: 'Hide Watched Content',
                uk: 'Приховувати переглянуте',
                be: 'Схаваць прагледжанае',
                pt: 'Ocultar conteúdo assistido',
                zh: '隐藏已观看内容'
            },
            history_filter_desc: {
                ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть',
                en: 'Hide cards from your viewing history',
                uk: 'Сховати картки з вашої історії перегляду',
                be: 'Схаваць карткі з вашай гісторыі прагляду',
                pt: 'Ocultar cartões do seu histórico de visualização',
                zh: '隐藏您的观看历史中的卡片'
            }
        });
    }

    // Загрузка сохранённых настроек
    function loadSettings() {
        settings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        settings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        settings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
        settings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);
    }

    // Функция фильтрации контента
    var contentFilters = {
        apply: function (items) {
            if (!Array.isArray(items)) return items;

            return items.filter(function (item) {
                var pass = true;

                // Фильтр азиатского контента
                if (settings.asian_filter_enabled) {
                    var asianCountries = ['China', 'Japan', 'South Korea', 'Thailand', 'India', 'Hong Kong', 'Taiwan'];
                    var isAsian = item.production_countries && item.production_countries.some(function (country) {
                        return asianCountries.includes(country.name);
                    });
                    if (isAsian) pass = false;
                }

                // Фильтр по языку
                if (pass && settings.language_filter_enabled) {
                    var currentLang = Lampa.Storage.get('language', 'ru');
                    var langMap = {
                        'ru': ['Russian'],
                        'en': ['English'],
                        'uk': ['Ukrainian'],
                        'be': ['Belarusian'],
                        'pt': ['Portuguese'],
                        'zh': ['Chinese']
                    };
                    var allowedLanguages = langMap[currentLang] || ['English'];
                    var hasLanguage = item.spoken_languages && item.spoken_languages.some(function (lang) {
                        return allowedLanguages.includes(lang.name);
                    });
                    if (!hasLanguage) pass = false;
                }

                // Фильтр по рейтингу
                if (pass && settings.rating_filter_enabled) {
                    var rating = item.vote_average || 0;
                    if (rating < 6) pass = false;
                }

                // Фильтр просмотренного
                if (pass && settings.history_filter_enabled) {
                    var history = Lampa.Favorite.get('history') || [];
                    var isWatched = history.some(function (h) {
                        return h.id === item.id && h.media_type === (item.media_type || (item.original_name ? 'tv' : 'movie'));
                    });
                    if (isWatched) pass = false;
                }

                return pass;
            });
        }
    };

    // Проверка, нужно ли обрабатывать ответ API
    function shouldProcessResponse(source) {
        var sources = ['tmdb', 'cub', 'rezka', 'kp', 'okko'];
        return sources.includes(source);
    }

    // Проверка, нужно ли добавлять кнопку "Ещё"
    function shouldAddMoreButton(data) {
        return data && Array.isArray(data.results) && data.results.length > 0 && data.total_results > data.results.length;
    }

    // Поиск ближайшего родителя
    function closest(element, selector) {
        while (element && !element.matches(selector)) {
            element = element.parentElement;
        }
        return element;
    }

    // Добавление компонента и параметров в настройки
    function addSettings() {
        console.log('Content Filter Plugin: Attempting to add content_filters component');

        // Проверяем, что Lampa.Settings доступен
        if (!Lampa.Settings || !Lampa.Settings.main) {
            console.warn('Content Filter Plugin: Lampa.Settings is not available yet');
            return;
        }

        // Добавляем компонент content_filters
        if (!Lampa.Settings.main().component().find('[data-component="content_filters"]').length) {
            Lampa.SettingsApi.addComponent({
                component: 'content_filters',
                name: Lampa.Lang.translate('content_filters')
            });
            console.log('Content Filter Plugin: content_filters component added');
        }

        // Добавляем статический параметр для открытия подменю
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'content_filters',
                type: 'static',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            },
            onRender: function (element) {
                setTimeout(function () {
                    var name = Lampa.Lang.translate('content_filters');
                    $('.settings-param > div:contains("' + name + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                element.on('hover:enter', function () {
                    Lampa.Settings.open('content_filters');
                    Lampa.Controller.main().params.back = function () {
                        Lampa.Settings.open('interface');
                    };
                });
            }
        });

        // Добавляем параметры фильтров
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'asian_filter_enabled',
                type: 'trigger',
                default: settings.asian_filter_enabled
            },
            field: {
                name: Lampa.Lang.translate('asian_filter'),
                description: Lampa.Lang.translate('asian_filter_desc')
            },
            onChange: function (value) {
                settings.asian_filter_enabled = value;
                Lampa.Storage.set('asian_filter_enabled', value);
                console.log('Content Filter Plugin: asian_filter_enabled set to', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'language_filter_enabled',
                type: 'trigger',
                default: settings.language_filter_enabled
            },
            field: {
                name: Lampa.Lang.translate('language_filter'),
                description: Lampa.Lang.translate('language_filter_desc')
            },
            onChange: function (value) {
                settings.language_filter_enabled = value;
                Lampa.Storage.set('language_filter_enabled', value);
                console.log('Content Filter Plugin: language_filter_enabled set to', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'rating_filter_enabled',
                type: 'trigger',
                default: settings.rating_filter_enabled
            },
            field: {
                name: Lampa.Lang.translate('rating_filter'),
                description: Lampa.Lang.translate('rating_filter_desc')
            },
            onChange: function (value) {
                settings.rating_filter_enabled = value;
                Lampa.Storage.set('rating_filter_enabled', value);
                console.log('Content Filter Plugin: rating_filter_enabled set to', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: {
                name: 'history_filter_enabled',
                type: 'trigger',
                default: settings.history_filter_enabled
            },
            field: {
                name: Lampa.Lang.translate('history_filter'),
                description: Lampa.Lang.translate('history_filter_desc')
            },
            onChange: function (value) {
                settings.history_filter_enabled = value;
                Lampa.Storage.set('history_filter_enabled', value);
                console.log('Content Filter Plugin: history_filter_enabled set to', value);
            }
        });

        // Принудительно обновляем меню настроек
        Lampa.Settings.main().update();
        console.log('Content Filter Plugin: Settings menu updated');

        // Добавляем компонент в меню "Интерфейс" при его открытии
        Lampa.Listener.follow('app', function (e) {
            if (e.name === 'settings' && e.component === 'interface') {
                var settingsMain = Lampa.Settings.main();
                if (!settingsMain.component().find('[data-component="content_filters"]').length) {
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                    console.log('Content Filter Plugin: Re-added content_filters component in interface menu');
                }
                settingsMain.component().find('[data-component="content_filters"]').addClass('show');
                settingsMain.update();
                console.log('Content Filter Plugin: Interface menu updated with content_filters');
            }
        });
    }

    // Инициализация слушателей
    function initListener() {
        // Обработка ответа API
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!shouldProcessResponse(e.params.source) || !e.data || !Array.isArray(e.data.results)) return;
            e.data.original_length = e.data.results.length;
            e.data.results = contentFilters.apply(e.data.results);
            console.log('Content Filter Plugin: Filtered API response, results length:', e.data.results.length);
        });

        // Обработка события добавления карточек
        Lampa.Listener.follow('append', function (e) {
            if (e.type !== 'card' || !shouldAddMoreButton(e.data)) return;
            var itemsLine = $(closest(e.element, '.items-line')).find('.items-line__head');
            var hasMoreButton = itemsLine.find('.items-line__more').length !== 0;
            if (hasMoreButton) return;

            var moreButton = document.createElement('div');
            moreButton.classList.add('items-line__more', 'selector');
            moreButton.innerText = Lampa.Lang.translate('more');
            moreButton.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: e.data.genres,
                    filter: e.data.filter,
                    source: e.data.source || e.data.params.source
                });
            });
            itemsLine.append(moreButton);
            console.log('Content Filter Plugin: Added "More" button to items line');
        });

        // Обработка события добавления строки
        Lampa.Listener.follow('append', function (e) {
            if (e.type !== 'line' || !shouldAddMoreButton(e.data)) return;
            if (e.data.results.length === e.data.original_length) {
                Lampa.Controller.collectionAppend(e.line);
                Lampa.Controller.enabled(e.line).more();
                console.log('Content Filter Plugin: Processed line append, enabled more button');
            }
        });
    }

    // Основная функция запуска плагина
    function startPlugin() {
        console.log('Content Filter Plugin: Starting plugin initialization');

        // Добавляем плагин в манифест
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
        Lampa.Manifest.plugins.push({
            name: 'Content Filter',
            version: '1.0.0'
        });

        // Инициализируем компоненты плагина
        initListener();
        loadSettings();
        addTranslations();

        // Ждём события appready для инициализации настроек
        Lampa.Listener.follow('app', function (e) {
            if (e.name === 'appready') {
                console.log('Content Filter Plugin: App is ready, initializing settings');
                addSettings();
            }
        });

        // Проверяем, если Lampa.Settings уже доступен, вызываем addSettings сразу
        if (Lampa.Settings && Lampa.Settings.main) {
            console.log('Content Filter Plugin: Lampa.Settings is available, calling addSettings immediately');
            addSettings();
        }
    }

    // Запускаем плагин
    startPlugin();
})();
