(function() {
    'use strict';

    console.log('Content Filter: Starting plugin initialization');

    // Проверка доступности Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Content Filter: Lampa is not defined');
        alert('Content Filter: Lampa is not defined');
        return;
    }

    // Объект для хранения состояния фильтров
    var settings = {
        rating_filter_enabled: true // Принудительно включено
    };

    // Объект с фильтрами
    var filters = {
        apply: function(data) {
            if (!data || !Array.isArray(data)) {
                console.log('Content Filter: Invalid data, skipping filter');
                return data;
            }
            console.log('Content Filter: Applying rating filter to', data.length, 'items');
            var result = data.filter(function(item) {
                if (!item) {
                    console.log('Content Filter: Skipping empty item');
                    return true;
                }
                var isSpecial = item.media_type === 'person' || 
                               item.type === 'Trailer' || 
                               item.site === 'YouTube' || 
                               (item.card && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                if (isSpecial) {
                    console.log('Content Filter: Allowing special item:', item.name || item.title);
                    return true;
                }
                if (!item.vote_average || item.vote_average < 6) {
                    console.log('Content Filter: Filtering out item:', item.name || item.title, 'Rating:', item.vote_average || 'none');
                    return false;
                }
                console.log('Content Filter: Allowing item:', item.name || item.title, 'Rating:', item.vote_average);
                return true;
            });
            console.log('Content Filter: After filter, remaining', result.length, 'items');
            return result;
        }
    };

    // Добавление переводов
    function addTranslations() {
        console.log('Content Filter: Adding translations');
        try {
            Lampa.Lang.translate({
                content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
                rating_filter: { ru: 'Убрать низкорейтинговый контент', en: 'Remove Low-Rated Content', uk: 'Прибрати низько рейтинговий контент' },
                rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0', en: 'Hide cards with a rating below 6.0', uk: 'Сховати картки з рейтингом нижче 6.0' }
            });
            console.log('Content Filter: Translations added');
        } catch (e) {
            console.error('Content Filter: Error adding translations', e);
            alert('Content Filter: Error adding translations: ' + e.message);
        }
    }

    // Добавление настроек
    function addSettings() {
        console.log('Content Filter: Initializing settings');
        try {
            if (!Lampa.SettingsApi || !Lampa.Settings) {
                console.error('Content Filter: Settings API is not available');
                alert('Content Filter: Settings API is not available');
                return;
            }

            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name !== 'settings') return;
                console.log('Content Filter: Settings opened');
                var settingsMain = Lampa.Settings.main();
                if (!settingsMain) {
                    console.error('Content Filter: Lampa.Settings.main() is not available');
                    alert('Content Filter: Settings main is not available');
                    return;
                }
                var componentExists = settingsMain.render().querySelector('[data-component="content_filters"]');
                if (!componentExists) {
                    console.log('Content Filter: Adding content_filters component');
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                    Lampa.SettingsApi.addParam({
                        component: 'content_filters',
                        param: { name: 'rating_filter_enabled', type: 'trigger', default: true },
                        field: { name: Lampa.Lang.translate('rating_filter'), description: Lampa.Lang.translate('rating_filter_desc') },
                        onChange: function(value) {
                            console.log('Content Filter: rating_filter_enabled changed to', value);
                            settings.rating_filter_enabled = value;
                            Lampa.Storage.set('rating_filter_enabled', value);
                        }
                    });
                    settingsMain.update();
                    console.log('Content Filter: Component content_filters added');
                } else {
                    console.log('Content Filter: Component content_filters already exists');
                }
            });

            console.log('Content Filter: Adding interface param');
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'content_filters', type: 'static', default: true },
                field: { name: Lampa.Lang.translate('content_filters'), description: 'Настройка фильтрации контента' },
                onRender: function(element) {
                    console.log('Content Filter: Rendering interface param');
                    element.on('hover:enter', function() {
                        console.log('Content Filter: Opening content_filters settings');
                        settingsMain.render().querySelector('[data-component="content_filters"]').click();
                    });
                }
            });

            console.log('Content Filter: Settings initialized');
        } catch (e) {
            console.error('Content Filter: Error initializing settings', e);
            alert('Content Filter: Error initializing settings: ' + e.message);
        }
    }

    // Загрузка сохранённых настроек
    function loadSettings() {
        console.log('Content Filter: Loading filter settings');
        try {
            settings.rating_filter_enabled = Lampa.Storage.get('rating_filter_enabled', true);
            console.log('Content Filter: Filter settings loaded', settings);
        } catch (e) {
            console.error('Content Filter: Error loading filter settings', e);
            alert('Content Filter: Error loading settings: ' + e.message);
        }
    }

    // Проверка URL для фильтрации
    function isValidUrl(url) {
        var isValid = url.indexOf(Lampa.TMDB.api('')) > -1 && 
                      url.indexOf('/search') === -1 && 
                      url.indexOf('/person/') === -1;
        console.log('Content Filter: Checking URL', url, 'Valid:', isValid);
        return isValid;
    }

    // Основная функция инициализации
    function initialize() {
        console.log('Content Filter: Initializing plugin');
        try {
            loadSettings();
            addTranslations();
            addSettings();

            // Применение фильтров
            Lampa.Listener.follow('request_success', function(e) {
                console.log('Content Filter: Processing request_success for URL', e.params.url);
                if (isValidUrl(e.params.url) && e.data && Array.isArray(e.data.results)) {
                    console.log('Content Filter: Original results length', e.data.results.length);
                    e.data.original_length = e.data.results.length;
                    e.data.results = filters.apply(e.data.results);
                    console.log('Content Filter: Filtered results length', e.data.results.length);
                } else {
                    console.log('Content Filter: Skipping request_success, invalid URL or data');
                }
            });

            console.log('Content Filter: Plugin initialized successfully');
            alert('Content Filter: Plugin loaded');
        } catch (e) {
            console.error('Content Filter: Error initializing plugin', e);
            alert('Content Filter: Error initializing plugin: ' + e.message);
        }
    }

    // Инициализация плагина
    if (window.content_filter_plugin) {
        console.log('Content Filter: Plugin already loaded, running initialization');
        initialize();
    } else {
        console.log('Content Filter: Setting up app listener');
        window.content_filter_plugin = true;
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'appready') {
                console.log('Content Filter: App ready, initializing plugin');
                initialize();
            }
        });
    }
})();
