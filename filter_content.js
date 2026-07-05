(function () {
    'use strict';

    // Настройки фильтров
    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false
    };

    // Функция проверки, является ли элемент медиа-контентом
    function isMediaContent(item) {
        if (!item) return false;
        
        // Если это явно расширение/плагин по типу
        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || 
                typeLower === 'extension' || 
                typeLower === 'theme' ||
                typeLower === 'addon') {
                return false;
            }
        }
        
        // Если есть явные поля расширений (и нет медиа-полей)
        var hasExtensionFields = (item.plugin !== undefined || 
                                 item.extension !== undefined ||
                                 (item.type && item.type === 'extension') ||
                                 (item.type && item.type === 'plugin'));
        
        // Медиа-контент должен иметь специфичные поля для фильмов/сериалов
        // Проверяем наличие характерных медиа-полей
        var hasMediaFields = 
            item.original_language !== undefined ||
            item.vote_average !== undefined ||
            item.media_type !== undefined ||
            item.first_air_date !== undefined ||
            item.release_date !== undefined ||
            item.original_title !== undefined ||
            item.original_name !== undefined ||
            (item.genre_ids && Array.isArray(item.genre_ids)) ||
            (item.genres && Array.isArray(item.genres));
        
        // Если есть поля расширений, но нет медиа-полей - это не медиа-контент
        if (hasExtensionFields && !hasMediaFields) return false;
        
        // Если нет медиа-полей вообще, это не медиа-контент
        if (!hasMediaFields) return false;
        
        return true;
    }

    // Процессор фильтров
    var filterProcessor = {
        filters: [
            // Фильтр азиатского контента
            function (items) {
                if (!settings.asian_filter_enabled) return items;
                return items.filter(function (item) {
                    // Пропускаем элементы, которые не являются медиа-контентом
                    if (!isMediaContent(item)) return true;
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
                    // Пропускаем элементы, которые не являются медиа-контентом
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;
                    var defaultLang = Lampa.Storage.get('language') || 'ru';
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
                    // Пропускаем элементы, которые не являются медиа-контентом
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;

                    var isSpecial = 
                        item.media_type === 'video' ||
                        item.type === 'Trailer' ||
                        item.site === 'YouTube' ||
                        (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);

                    if (isSpecial) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },

            // 4. Просмотренный контент
            function (items) {
                if (!settings.history_filter_enabled) return items;

                var favorite = Lampa.Storage.get('favorite', '{}');
                var timeline = Lampa.Storage.cache('timetable', 300, []);

                return items.filter(function (item) {
                    // Пропускаем элементы, которые не являются медиа-контентом
                    if (!isMediaContent(item)) return true;
                    if (!item || !item.id) return true;

                    var mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');

                    var card = Lampa.Favorite.check(item);
                    var hasHistory = card && card.history;
                    var isThrown = card && card.thrown;

                    if (isThrown) return false;
                    if (!hasHistory) return true;
                    if (hasHistory && mediaType === 'movie') return false;

                    var watchedFromFavorite = getWatchedEpisodesFromFavorite(item.id, favorite);
                    var watchedFromTimeline = getWatchedEpisodesFromTimeline(item.id, timeline);
                    var allWatchedEpisodes = mergeWatchedEpisodes(watchedFromFavorite, watchedFromTimeline);
                    var title = item.original_title || item.original_name || item.title || item.name || '';
                    var isFullyWatched = isSeriesFullyWatched(title, allWatchedEpisodes);

                    return !isFullyWatched;
                });
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

    // Вспомогательные функции для просмотренного
    function getWatchedEpisodesFromFavorite(id, favoriteData) {
        var card = (favoriteData.card || []).find(function (c) {
            return c.id === id && Array.isArray(c.seasons) && c.seasons.length > 0;
        });
        if (!card) return [];

        var airedSeasons = card.seasons.filter(function (s) {
            return s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date();
        });

        var episodes = [];
        airedSeasons.forEach(function (season) {
            for (var ep = 1; ep <= season.episode_count; ep++) {
                episodes.push({ season_number: season.season_number, episode_number: ep });
            }
        });
        return episodes;
    }

    function getWatchedEpisodesFromTimeline(id, timelineData) {
        var entry = (timelineData || []).find(function (e) { return e.id === id; }) || {};
        if (!Array.isArray(entry.episodes) || entry.episodes.length === 0) return [];

        return entry.episodes.filter(function (ep) {
            return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
    }

    function mergeWatchedEpisodes(arr1, arr2) {
        var merged = (arr1 || []).concat(arr2 || []);
        var unique = [];
        merged.forEach(function (ep) {
            var exists = unique.some(function (u) {
                return u.season_number === ep.season_number && u.episode_number === ep.episode_number;
            });
            if (!exists) unique.push(ep);
        });
        return unique;
    }

    function isSeriesFullyWatched(title, watchedEpisodes) {
        if (!watchedEpisodes || watchedEpisodes.length === 0) return false;

        for (var i = 0; i < watchedEpisodes.length; i++) {
            var ep = watchedEpisodes[i];
            var hash = Lampa.Utils.hash([
                ep.season_number,
                ep.season_number > 10 ? ':' : '',
                ep.episode_number,
                title
            ].join(''));
            var view = Lampa.Timeline.view(hash);
            if (!view || view.percent < 100) return false;
        }
        return true;
    }

    function initCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(Lampa.Card.prototype, 'build', {
            get: function () { return this._build; },
            set: function (value) {
                this._build = function () {
                    value.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                }.bind(this);
            }
        });
    }

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
            history_filter_desc: { ru: 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть' },
            more: { ru: 'ещё' },
            title_category: { ru: 'Категория' }
        });
    }

    function addSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var render = Lampa.Settings.main().render();
                if (render.find('[data-component="content_filters"]').length === 0) {
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                }
                Lampa.Settings.main().update();
                render.find('[data-component="content_filters"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters', type: 'static', default: true },
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: 'Настройка отображения карточек по фильтрам'
            },
            onRender: function (el) {
                setTimeout(function () {
                    var title = Lampa.Lang.translate('content_filters');
                    $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                el.on('hover:enter', function () {
                    Lampa.Settings.create('content_filters');
                    Lampa.Controller.enabled().controller.back = function () {
                        Lampa.Settings.create('interface');
                    };
                });
            }
        });

        ['asian', 'language', 'rating', 'history'].forEach(function (type) {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: type + '_filter_enabled', type: 'trigger', default: false },
                field: {
                    name: Lampa.Lang.translate(type + '_filter'),
                    description: Lampa.Lang.translate(type + '_filter_desc')
                },
                onChange: function (value) {
                    settings[type + '_filter_enabled'] = value;
                    Lampa.Storage.set(type + '_filter_enabled', value);
                }
            });
        });
    }

    function loadSettings() {
        settings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        settings.language_filter_enabled = Lampa.Storage.get('language_filter_enabled', false);
        settings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', false);
        settings.history_filter_enabled = Lampa.Storage.get('history_filter_enabled', false);
    }

    function needMoreButton(data) {
        if (!data || !Array.isArray(data.results)) return false;
        var orig = data.original_length || 0;
        return orig > data.results.length && data.page === 1 && data.total_pages > 1;
    }

    function closest(el, selector) {
        if (el && el.closest) return el.closest(selector);
        while (el && el !== document) {
            if (el.matches && el.matches(selector)) return el;
            el = el.parentElement || el.parentNode;
        }
        return null;
    }

    function initPlugin() {
        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        initCardListener();
        loadSettings();
        addRussianTranslations();
        addSettings();

        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'visible' || !needMoreButton(e.data)) return;
            var head = $(closest(e.body, '.items-line')).find('.items-line__head');
            if (head.find('.items-line__more').length) return;

            var more = document.createElement('div');
            more.classList.add('items-line__more', 'selector');
            more.innerText = Lampa.Lang.translate('more');
            more.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: e.params.genres,
                    filter: e.data.filter,
                    source: e.data.source || (e.params.object ? e.params.object.source : '')
                });
            });
            head.append(more);
        });

        // Автозагрузка
        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'append' || !needMoreButton(e.data)) return;
            if (e.items.length === e.data.results.length && Lampa.Controller.own(e.line)) {
                Lampa.Controller.collectionAppend(e.line.more());
            }
        });

        // Применение фильтров
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            
            // Проверяем URL на наличие ключевых слов расширений/магазина
            var url = e.url || (e.data && e.data.url) || '';
            var urlStr = typeof url === 'string' ? url.toLowerCase() : '';
            if (urlStr.indexOf('extension') !== -1 ||
                urlStr.indexOf('plugin') !== -1 ||
                urlStr.indexOf('store') !== -1 ||
                urlStr.indexOf('market') !== -1 ||
                urlStr.indexOf('магазин') !== -1) {
                return; // Не применяем фильтры к расширениям/магазину
            }
            
            // Проверяем компонент - расширения/магазин могут иметь специфичные компоненты
            var component = e.component || (e.data && e.data.component) || '';
            var componentStr = typeof component === 'string' ? component.toLowerCase() : '';
            if (componentStr.indexOf('extension') !== -1 ||
                componentStr.indexOf('plugin') !== -1 ||
                componentStr.indexOf('store') !== -1 ||
                componentStr.indexOf('market') !== -1) {
                return; // Не применяем фильтры к расширениям/магазину
            }
            
            // Если массив пустой, пропускаем (может быть расширения/магазин)
            if (e.data.results.length === 0) return;
            
            // Проверяем, содержит ли массив хотя бы один элемент медиа-контента
            // Если все элементы не являются медиа-контентом, не применяем фильтры
            var hasMediaContent = e.data.results.some(function(item) {
                return isMediaContent(item);
            });
            
            // Если это не медиа-контент (расширения/магазин), не применяем фильтры
            if (!hasMediaContent) return;
            
            e.data.original_length = e.data.results.length;
            e.data.results = filterProcessor.apply(e.data.results);
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
