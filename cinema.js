(function () {
    'use strict';

    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    var filterProcessor = {
        filters: [
            // Фильтр азиатского контента
            function (items) {
                if (!settings.asian_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item || !item.original_language) return true;
                    var lang = item.original_language.toLowerCase();
                    var asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLangs.indexOf(lang) === -1;
                });
            },

            // Фильтр языка (скрывать контент, не переведённый на язык по умолчанию)
            function (items) {
                if (!settings.language_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item) return true;
                    var defaultLang = Lampa.Storage.get('language');
                    var original = item.original_title || item.original_name;
                    var translated = item.title || item.name;
                    if (item.original_language === defaultLang) return true;
                    if (item.original_language !== defaultLang && translated !== original) return true;
                    return false;
                });
            },

            // Фильтр низкого рейтинга (< 6.0)
            function (items) {
                if (!settings.rating_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item) return true;
                    var isSpecial = item.media_type === 'video' ||
                                    item.type === 'Trailer' ||
                                    item.site === 'YouTube' ||
                                    (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecial) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },

            // Фильтр просмотренного контента (отключён в текущей версии)
            function (items) {
                return items;
            }
        ],

        apply: function (data) {
            var results = Lampa.Arrays.clone(data);
            for (var i = 0; i < this.filters.length; i++) {
                results = this.filters[i](results);
            }
            return results;
        }
    };

    // Перехват build у карточек (для отправки события)
    function initCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Card.prototype, 'build', {
            get: function () {
                return this['_build'];
            },
            set: function (value) {
                this['_build'] = function () {
                    value.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                }.bind(this);
            }
        });
    }

    // Добавление переводов только на русский
    function addRussianTranslations() {
        Lampa.Lang.add({
            content_filters: { ru: 'Фильтр контента' },
            asian_filter: { ru: 'Убрать азиатский контент' },
            asian_filter_desc: { ru: 'Скрываем карточки азиатского происхождения' },
            language_filter: { ru: 'Убрать контент на другом языке' },
            language_filter_desc: { ru: 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию' },
            rating_filter: { ru: 'Убрать низкорейтинговый контент' },
            rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0' },
            history_filter: { ru: 'Убрать просмотренный контент' },
            history_filter_desc: { ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть' }
        });
    }

    // Добавление настроек плагина
    function addSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                if (Lampa.Settings.main().render().find('[data-component="content_filters"]').length === 0) {
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                }
                Lampa.Settings.main().update();
                Lampa.Settings.main().render().find('[data-component="content_filters"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters', type: 'static', default: true },
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            },
            onRender: function (element) {
                setTimeout(function () {
                    var title = Lampa.Lang.translate('content_filters');
                    $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                element.on('hover:enter', function () {
                    Lampa.Settings.create('content_filters');
                    Lampa.Controller.enabled().controller.back = function () {
                        Lampa.Settings.create('interface');
                    };
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('asian_filter'),
                description: Lampa.Lang.translate('asian_filter_desc')
            },
            onChange: function (value) {
                settings.asian_filter_enabled = value;
                Lampa.Storage.set('asian_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'language_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('language_filter'),
                description: Lampa.Lang.translate('language_filter_desc')
            },
            onChange: function (value) {
                settings.language_filter_enabled = value;
                Lampa.Storage.set('language_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'rating_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('rating_filter'),
                description: Lampa.Lang.translate('rating_filter_desc')
            },
            onChange: function (value) {
                settings.rating_filter_enabled = value;
                Lampa.Storage.set('rating_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'history_filter_enabled', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('history_filter'),
                description: Lampa.Lang.translate('history_filter_desc')
            },
            onChange: function (value) {
                settings.history_filter_enabled = value;
                Lampa.Storage.set('history_filter_enabled', value);
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

    // Проверка условия для добавления кнопки "ещё"
    function needMoreButton(data) {
        return !!data && Array.isArray(data.results) &&
               data.original_length !== data.results.length &&
               data.page === 1 && !!data.total_pages && data.total_pages > 1;
    }

    // Polyfill для closest
    function closest(element, selector) {
        if (element && element.closest) return element.closest(selector);
        var el = element;
        while (el && el !== document) {
            if (el.matches) {
                if (el.matches(selector)) return el;
            } else if (el.msMatchesSelector && el.msMatchesSelector(selector)) return el;
            else if (el.webkitMatchesSelector && el.webkitMatchesSelector(selector)) return el;
            else if (el.mozMatchesSelector && el.mozMatchesSelector(selector)) return el;
            else if (el.oMatchesSelector && el.oMatchesSelector(selector)) return el;
            el = el.parentElement || el.parentNode;
        }
        return null;
    }

    // Основная инициализация плагина
    function initPlugin() {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
        Lampa.Manifest.plugins.push({ name: 'Content Filter', version: '1.0.0' });

        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        initCardListener();
        loadSettings();
        addRussianTranslations();
        addSettings();

        // Добавление кнопки "ещё" в строки с фильтрованным контентом
        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'visible' || !needMoreButton(e.data)) return;
            var head = $(closest(e.body, '.items-line')).find('.items-line__head');
            if (head.find('.items-line__more').length !== 0) return;

            var moreBtn = document.createElement('div');
            moreBtn.classList.add('items-line__more', 'selector');
            moreBtn.innerText = Lampa.Lang.translate('more');
            moreBtn.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: e.params.genres,
                    filter: e.data.filter,
                    source: e.data.source || e.params.object.source
                });
            });
            head.append(moreBtn);
        });

        // Автозагрузка следующей страницы при скролле
        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'append' || !needMoreButton(e.data)) return;
            if (e.items.length === e.data.results.length && Lampa.Controller.own(e.line)) {
                Lampa.Controller.collectionAppend(e.line.more());
            }
        });

        // Применение фильтров к результатам запроса
        Lampa.Listener.follow('request_secuses', function (e) {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.original_length = e.data.results.length;
                e.data.results = filterProcessor.apply(e.data.results);
            }
        });
    }

    initPlugin();
})();
