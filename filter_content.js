(function () {
    'use strict';

    // Настройки фильтров
    var settings = {
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false,
        ts_filter_enabled: false
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

    function settingEnabled(value) {
        return value === true || value === 'true' || value === '1' || value === 1;
    }

    function mediaType(item) {
        if (!item) return 'movie';
        var type = item.media_type || item.type || item.method;
        if (type === 'tv' || type === 'movie') return type;
        return item.name || item.original_name || item.first_air_date || item.number_of_seasons ? 'tv' : 'movie';
    }

    function isTsText(value) {
        if (value == null) return false;
        var text = String(value).toLowerCase().replace(/ё/g, 'е');
        return /(^|[\s,;:/|()\[\]{}._-])(ts|тс|telesync|telesynch)(?=$|[\s,;:/|()\[\]{}._-])/i.test(text);
    }

    function hasTsQuality(item) {
        if (!item) return false;
        var values = [
            item.quality,
            item.video_quality,
            item.release_quality,
            item.source_quality,
            item.resolution,
            item.info && item.info.quality,
            item.Info && item.Info.quality,
            item.card && item.card.quality,
            item.card && item.card.release_quality,
            item.data && item.data.quality,
            item.data && item.data.release_quality
        ];
        for (var i = 0; i < values.length; i++) {
            if (isTsText(values[i])) return true;
        }
        return false;
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

            // Фильтр качества TS. Проверяет поля ответа и общий кэш card_overlay.
            function (items) {
                if (!settings.ts_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    return !hasTsQuality(item);
                });
            },

            function (items) {
                if (!settings.history_filter_enabled) return items;

                return items.filter(function (item) {
                    if (!isMediaContent(item) || !item.id) return true;
                    var status = Lampa.Favorite.check(item) || {};
                    return !status.viewed && !status.thrown;
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
            ts_filter: { ru: 'Убрать качество TS' },
            ts_filter_desc: { ru: 'Скрываем карточки с отметкой качества TS в данных Lampa' },
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

        ['asian', 'language', 'rating', 'history', 'ts'].forEach(function (type) {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: type + '_filter_enabled', type: 'trigger', default: false },
                field: {
                    name: Lampa.Lang.translate(type + '_filter'),
                    description: Lampa.Lang.translate(type + '_filter_desc')
                },
                onChange: function (value) {
                    var enabled = settingEnabled(value);
                    settings[type + '_filter_enabled'] = enabled;
                    Lampa.Storage.set(type + '_filter_enabled', enabled);
                    if (type === 'ts') applyTsDomFilter();
                }
            });
        });
    }

    function loadSettings() {
        settings.asian_filter_enabled = settingEnabled(Lampa.Storage.get('asian_filter_enabled', false));
        settings.language_filter_enabled = settingEnabled(Lampa.Storage.get('language_filter_enabled', false));
        settings.rating_filter_enabled = settingEnabled(Lampa.Storage.get('rating_filter_enabled', false));
        settings.history_filter_enabled = settingEnabled(Lampa.Storage.get('history_filter_enabled', false));
        settings.ts_filter_enabled = settingEnabled(Lampa.Storage.get('ts_filter_enabled', false));
    }

    var tsQualityObserver = null;

    function hideTsCard(card) {
        if (!card || card.nodeType !== 1 || card.getAttribute('data-content-filter-ts') === '1') return;
        card.setAttribute('data-content-filter-ts', '1');
        card.setAttribute('data-content-filter-ts-display', card.style.display || '');
        card.style.setProperty('display', 'none', 'important');
    }

    function restoreTsCard(card) {
        if (!card || card.getAttribute('data-content-filter-ts') !== '1') return;
        var previous = card.getAttribute('data-content-filter-ts-display') || '';
        card.removeAttribute('data-content-filter-ts');
        card.removeAttribute('data-content-filter-ts-display');
        if (previous) card.style.setProperty('display', previous);
        else card.style.removeProperty('display');
    }

    function cardHasNativeTs(card) {
        if (!card) return false;
        if (hasTsQuality(card.card_data || card.data || null)) return true;
        if (isTsText(card.getAttribute('data-quality')) || isTsText(card.getAttribute('data-release-quality'))) return true;
        var qualityNodes = card.querySelectorAll('.card__quality, .tag--quality, [data-quality], [data-release-quality]');
        for (var i = 0; i < qualityNodes.length; i++) {
            var node = qualityNodes[i];
            if (isTsText(node.textContent) || isTsText(node.getAttribute('data-quality')) || isTsText(node.getAttribute('data-release-quality'))) return true;
        }
        return false;
    }

    function processNativeTsCard(card) {
        if (!card) return;
        if (settings.ts_filter_enabled && cardHasNativeTs(card)) hideTsCard(card);
        else restoreTsCard(card);
    }

    function processTsQualityNode(node) {
        if (!node || node.nodeType !== 1) return;
        var card = node.matches && node.matches('.card') ? node : closest(node, '.card');
        if (card) processNativeTsCard(card);
        if (node.querySelectorAll) {
            var cards = node.querySelectorAll('.card');
            for (var i = 0; i < cards.length; i++) processNativeTsCard(cards[i]);
        }
    }

    function applyTsDomFilter() {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) processNativeTsCard(cards[i]);
    }

    function startTsQualityObserver() {
        if (tsQualityObserver || typeof MutationObserver === 'undefined') return;
        tsQualityObserver = new MutationObserver(function (mutations) {
            if (!settings.ts_filter_enabled) return;
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                var added = mutation.addedNodes || [];
                for (var j = 0; j < added.length; j++) processTsQualityNode(added[j]);
                var card = closest(mutation.target, '.card');
                if (card) processNativeTsCard(card);
            }
        });
        try { tsQualityObserver.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
        applyTsDomFilter();
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
        try { console.log('[filter_content] v1.3-native-ts active'); } catch (e) {}

        loadSettings();
        addRussianTranslations();
        addSettings();
        startTsQualityObserver();

        Lampa.Listener.follow('line', function (e) {
            if (!settings.ts_filter_enabled || (e.type !== 'visible' && e.type !== 'append')) return;
            setTimeout(applyTsDomFilter, 50);
        });

        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'visible' || !needMoreButton(e.data)) return;
            var head = $(closest(e.body, '.items-line')).find('.items-line__head');
            if (head.find('.items-line__more').length) return;

            var more = document.createElement('div');
            more.classList.add('items-line__more', 'selector');
            more.innerText = Lampa.Lang.translate('more');
            more.addEventListener('hover:enter', function () {
                var params = e.params || {};
                Lampa.Activity.push({
                    url: e.data.url,
                    title: e.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: params.genres,
                    filter: e.data.filter,
                    source: e.data.source || (params.object ? params.object.source : '')
                });
            });
            head.append(more);
        });

        // Автозагрузка
        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'append' || !needMoreButton(e.data)) return;
            if (!Array.isArray(e.items) || !e.line || typeof e.line.more !== 'function') return;
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
;
