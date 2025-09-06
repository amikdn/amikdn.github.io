(function () {
    'use strict';

    // Временное логирование для отладки (можно закомментировать после проверки)
    window.console = window.console || {};
    window.console.log = window.console.log || function () {};

    // Проверка платформы
    if (typeof Lampa !== 'undefined' && Lampa.Platform) {
        Lampa.Platform.tv();
    } else {
        console.log('Lampa или Lampa.Platform недоступен');
    }

    // Фильтры контента
    var filtersConfig = {
        asian_filter_enabled: Lampa.Storage.get('asian_filter_enabled', false),
        language_filter_enabled: Lampa.Storage.get('language_filter_enabled', false),
        quality_filter_enabled: Lampa.Storage.get('quality_filter_enabled', false),
        rating_filter_enabled: Lampa.Storage.get('rating_filter_enabled', false),
        history_filter_enabled: Lampa.Storage.get('history_filter_enabled', false)
    };

    var contentFilters = {
        filters: [
            // Фильтр азиатского контента
            function (items) {
                if (!filtersConfig.asian_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item || !item.original_language) return true;
                    var lang = item.original_language.toLowerCase();
                    var asianLanguages = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLanguages.indexOf(lang) === -1;
                });
            },
            // Фильтр языка
            function (items) {
                if (!filtersConfig.language_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item) return true;
                    var defaultLang = Lampa.Storage.get('language');
                    var originalTitle = item.original_title || item.original_name;
                    var title = item.title || item.name;
                    if (item.original_language === defaultLang) return true;
                    if (item.original_language !== defaultLang && title !== originalTitle) return true;
                    return false;
                });
            },
            // Фильтр рейтинга
            function (items) {
                if (!filtersConfig.rating_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!item) return true;
                    return item.vote_average && item.vote_average >= 6;
                });
            },
            // Фильтр истории просмотров
            function (items) {
                if (!filtersConfig.history_filter_enabled) return items;
                var favorite = Lampa.Storage.get('favorite', '{}');
                var timetable = Lampa.Storage.get('timetable', 0x12c, []);
                return items.filter(function (item) {
                    if (!item || !item.original_language) return true;
                    var mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    var favoriteData = Lampa.Favorite.check(item);
                    var isWatched = favoriteData && favoriteData.view;
                    var isThrown = favoriteData && favoriteData.thrown;
                    if (isThrown) return false;
                    if (!isWatched) return true;
                    if (isWatched && mediaType === 'movie') return false;
                    var favoriteSeasons = getFavoriteSeasons(item.id, favorite);
                    var timetableSeasons = getTimetableSeasons(item.id, timetable);
                    var allSeasons = mergeSeasons(favoriteSeasons, timetableSeasons);
                    return !isFullyWatched(item.original_title || item.original_name, allSeasons);
                });
            }
        ],
        apply: function (items) {
            var result = Lampa.Arrays.clone(items);
            for (var i = 0; i < this.filters.length; i++) {
                result = this.filters[i](result);
            }
            return result;
        }
    };

    // Функции для работы с историей просмотров
    function getFavoriteSeasons(id, favorite) {
        var card = favorite.card.filter(function (c) {
            return c.id === id && Array.isArray(c.seasons) && c.seasons.length > 0;
        })[0];
        if (!card) return [];
        var seasons = card.seasons.filter(function (s) {
            return s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date();
        });
        if (seasons.length === 0) return [];
        var result = [];
        seasons.forEach(function (season) {
            for (var i = 1; i <= season.episode_count; i++) {
                result.push({ season_number: season.season_number, episode_number: i });
            }
        });
        return result;
    }

    function getTimetableSeasons(id, timetable) {
        var entry = timetable.filter(function (t) {
            return t.id === id;
        })[0] || {};
        if (!Array.isArray(entry.episodes) || entry.episodes.length === 0) return [];
        return entry.episodes.filter(function (e) {
            return e.season_number > 0 && e.air_date && new Date(e.air_date) < new Date();
        });
    }

    function mergeSeasons(favoriteSeasons, timetableSeasons) {
        var allSeasons = favoriteSeasons.concat(timetableSeasons);
        var uniqueSeasons = [];
        allSeasons.forEach(function (season) {
            var exists = uniqueSeasons.some(function (s) {
                return s.season_number === season.season_number && s.episode_number === season.episode_number;
            });
            if (!exists) uniqueSeasons.push(season);
        });
        return uniqueSeasons;
    }

    function isFullyWatched(title, seasons) {
        if (!seasons || seasons.length === 0) return false;
        for (var i = 0; i < seasons.length; i++) {
            var season = seasons[i];
            var hash = Lampa.Utils.hash([season.season_number, season.season_number > 10 ? ':' : '', season.episode_number, title].join(''));
            var viewData = Lampa.Timeline.view(hash);
            if (viewData.percent === 0) return false;
        }
        return true;
    }

    // Добавление кнопки "Ещё"
    function addMoreButton() {
        if (!Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') {
            if (Lampa && Lampa.Noty) {
                Lampa.Noty.show('Ошибка: Lampa.Listener недоступен для кнопки "Ещё"');
            }
            console.log('Lampa.Listener недоступен для addMoreButton');
            return;
        }
        Lampa.Listener.follow('line', function (event) {
            if (event.type !== 'append' || !isValidData(event.data)) return;
            var $line = $(findLineElement(event.body, '.items-line')).find('.items-line__head');
            if ($line.find('.items-line__more').length !== 0) return;
            var moreButton = document.createElement('div');
            moreButton.classList.add('items-line__more', 'selector');
            moreButton.innerText = Lampa.Lang.translate('more');
            moreButton.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: event.data.url,
                    title: event.data.title_category || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: event.params.genres,
                    filter: event.data.filter,
                    source: event.data.source || event.params.object.source
                });
            });
            $line.append(moreButton);
        });

        Lampa.Listener.follow('line', function (event) {
            if (event.type !== 'append' || !isValidData(event.data)) return;
            if (event.items.length === event.data.results.length && Lampa.Controller.own(event.line)) {
                Lampa.Controller.collectionAppend(event.line.more());
            }
        });
    }

    // Проверка данных для добавления кнопки
    function isValidData(data) {
        return data && Array.isArray(data.results) && data.original_length !== data.results.length && data.page === 1 && data.total_pages && data.total_pages > 1;
    }

    // Поиск элемента .items-line
    function findLineElement(element, selector) {
        if (element && element.matches && element.matches(selector)) return element;
        var current = element;
        while (current && current !== document) {
            if (current.matches && current.matches(selector)) return current;
            if (current.msMatchesSelector && current.msMatchesSelector(selector)) return current;
            if (current.webkitMatchesSelector && current.webkitMatchesSelector(selector)) return current;
            if (current.mozMatchesSelector && current.mozMatchesSelector(selector)) return current;
            if (current.oMatchesSelector && current.oMatchesSelector(selector)) return current;
            if (current.className && current.className.indexOf(selector.replace('.', '')) !== -1) return current;
            current = current.parentElement || current.parentNode;
        }
        return null;
    }

    // Фильтрация запросов
    function filterRequests() {
        if (!Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') {
            if (Lampa && Lampa.Noty) {
                Lampa.Noty.show('Ошибка: Lampa.Listener недоступен для фильтрации запросов');
            }
            console.log('Lampa.Listener недоступен для filterRequests');
            return;
        }
        Lampa.Listener.follow('request_secuses', function (event) {
            if (!isValidUrl(event.params.url) || !event.data || !Array.isArray(event.data.results)) return;
            event.data.original_length = event.data.results.length;
            event.data.results = contentFilters.apply(event.data.results);
        });
    }

    // Проверка URL
    function isValidUrl(url) {
        if (!Lampa || !Lampa.TMDB || typeof Lampa.TMDB.api !== 'function') return false;
        return url.indexOf(Lampa.TMDB.api('')) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
    }

    // Добавление параметров в настройки
    function addSettings() {
        if (!Lampa || !Lampa.SettingsApi || !Lampa.SettingsApi.listener || typeof Lampa.SettingsApi.listener.follow !== 'function') {
            if (Lampa && Lampa.Noty) {
                Lampa.Noty.show('Ошибка: Lampa.SettingsApi.listener недоступен для настроек');
            }
            console.log('Lampa.SettingsApi.listener недоступен для addSettings');
            return;
        }

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

        Lampa.SettingsApi.listener.follow('open', function (event) {
            if (event.name === 'main') {
                if (Lampa.Settings.main().render().find('[data-component="content_filters"]').length === 0) {
                    Lampa.Settings.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                }
                Lampa.Settings.main().render();
                Lampa.Settings.main().render().find('[data-component="content_filters"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('content_filters'), description: 'Настройка отображения карточек по фильтрам' },
            onRender: function (element) {
                setTimeout(function () {
                    var title = Lampa.Lang.translate('content_filters');
                    $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                element.on('hover:enter', function () {
                    Lampa.Settings.create('content_filters');
                    Lampa.Settings.main().controller.back = function () {
                        Lampa.Settings.create('main');
                    };
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('asian_filter'), description: Lampa.Lang.translate('asian_filter_desc') },
            onChange: function (value) {
                filtersConfig.asian_filter_enabled = value;
                Lampa.Storage.set('asian_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'language_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('language_filter'), description: Lampa.Lang.translate('language_filter_desc') },
            onChange: function (value) {
                filtersConfig.language_filter_enabled = value;
                Lampa.Storage.set('language_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'quality_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('quality_filter'), description: Lampa.Lang.translate('quality_filter_desc') },
            onChange: function (value) {
                filtersConfig.quality_filter_enabled = value;
                Lampa.Storage.set('quality_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'rating_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('rating_filter'), description: Lampa.Lang.translate('rating_filter_desc') },
            onChange: function (value) {
                filtersConfig.rating_filter_enabled = value;
                Lampa.Storage.set('rating_filter_enabled', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'history_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('history_filter'), description: Lampa.Lang.translate('history_filter_desc') },
            onChange: function (value) {
                filtersConfig.history_filter_enabled = value;
                Lampa.Storage.set('history_filter_enabled', value);
            }
        });
    }

    // Перехват создания карточек
    function interceptCardBuild() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        if (!Lampa || !Lampa.Card || !Lampa.Card.prototype) {
            if (Lampa && Lampa.Noty) {
                Lampa.Noty.show('Ошибка: Lampa.Card недоступен');
            }
            console.log('Lampa.Card недоступен для interceptCardBuild');
            return;
        }
        Object.defineProperty(Lampa.Card.prototype, 'build', {
            get: function () {
                return this._build;
            },
            set: function (value) {
                this._build = function () {
                    value.apply(this);
                    if (Lampa.Listener) {
                        Lampa.Listener.send('card', { type: 'card', object: this });
                    }
                }.bind(this);
            }
        });
    }

    // Скрытие карточек с качеством TS
    function hideLowQualityCards() {
        if (!Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') {
            if (Lampa && Lampa.Noty) {
                Lampa.Noty.show('Ошибка: Lampa.Listener недоступен для фильтрации качества');
            }
            console.log('Lampa.Listener недоступен для hideLowQualityCards');
            return;
        }
        Lampa.Listener.follow('card', function (event) {
            if (event.type !== 'card' || !filtersConfig.quality_filter_enabled) return;
            setTimeout(function () {
                if (!event.object || !event.object.card) return;
                var quality = event.object.card.querySelector('.card__quality div');
                if (quality && quality.textContent.trim().toUpperCase() === 'TS') {
                    event.object.card.style.display = 'none';
                }
            }, 0);
        });
    }

    // Инициализация плагина
    function initializePlugin() {
        // Проверка всех зависимостей
        if (!Lampa ||
            !Lampa.Listener ||
            typeof Lampa.Listener.follow !== 'function' ||
            !Lampa.SettingsApi ||
            !Lampa.SettingsApi.listener ||
            typeof Lampa.SettingsApi.listener.follow !== 'function' ||
            !Lampa.Card ||
            !Lampa.TMDB) {
            console.log('Зависимости недоступны, повторная попытка через 100 мс:', {
                Lampa: !!Lampa,
                Listener: !!(Lampa && Lampa.Listener),
                SettingsApi: !!(Lampa && Lampa.SettingsApi),
                SettingsApiListener: !!(Lampa && Lampa.SettingsApi && Lampa.SettingsApi.listener),
                Card: !!(Lampa && Lampa.Card),
                TMDB: !!(Lampa && Lampa.TMDB)
            });
            setTimeout(initializePlugin, 100); // Повторить через 100 мс
            return;
        }

        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        interceptCardBuild();
        addSettings();
        addMoreButton();
        filterRequests();
        hideLowQualityCards();

        if (!window.appready) {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready') {
                    interceptCardBuild();
                    addSettings();
                    addMoreButton();
                    filterRequests();
                    hideLowQualityCards();
                }
            });
        }
    }

    // Запуск инициализации
    console.log('Запуск плагина filter_content2.js');
    initializePlugin();
})();
