(function() {
    'use strict';

    console.log('Content Filter: Starting plugin initialization');

    // Проверка доступности Lampa
    function waitForLampa(callback) {
        if (window.Lampa && typeof window.Lampa === 'object') {
            console.log('Content Filter: Lampa is available');
            callback(window.Lampa);
        } else {
            console.log('Content Filter: Lampa not available, retrying...');
            setTimeout(function() {
                waitForLampa(callback);
            }, 500);
        }
    }

    // Объект для хранения состояния фильтров
    var settings = {
        rating_filter_enabled: true // Принудительно включено для теста
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

    // Добавление настроек (упрощённая версия)
    function addSettings(Lampa) {
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
                        name: 'Фильтр контента'
                    });
                    Lampa.SettingsApi.addParam({
                        component: 'content_filters',
                        param: { name: 'rating_filter_enabled', type: 'trigger', default: true },
                        field: { name: 'Убрать низкорейтинговый контент', description: 'Скрываем карточки с рейтингом ниже 6.0' },
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
                field: { name: 'Фильтр контента', description: 'Настройка фильтрации контента' },
                onRender: function(element) {
                    console.log('Content Filter: Rendering interface param');
                    element.on('hover:enter', function() {
                        console.log('Content Filter: Opening content_filters settings');
                        // Избегаем Lampa.Settings.open
                        Lampa.Settings.main().render().querySelector('[data-component="content_filters"]').click();
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
    function loadSettings(Lampa) {
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
    function isValidUrl(url, Lampa) {
        var isValid = url.indexOf(Lampa.TMDB.api('')) > -1 && 
                      url.indexOf('/search') === -1 && 
                      url.indexOf('/person/') === -1;
        console.log('Content Filter: Checking URL', url, 'Valid:', isValid);
        return isValid;
    }

    // Основная функция инициализации
    function initialize(Lampa) {
        console.log('Content Filter: Initializing plugin');
        try {
            loadSettings(Lampa);
            addSettings(Lampa);

            // Применение фильтров
            Lampa.Listener.follow('request_success', function(e) {
                console.log('Content Filter: Processing request_success for URL', e.params.url);
                if (isValidUrl(e.params.url, Lampa) && e.data && Array.isArray(e.data.results)) {
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

    // Ожидание Lampa
    waitForLampa(function(Lampa) {
        if (window.content_filter_plugin) {
            console.log('Content Filter: Plugin already loaded, running initialization');
            initialize(Lampa);
        } else {
            console.log('Content Filter: Setting up app listener');
            window.content_filter_plugin = true;
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'appready') {
                    console.log('Content Filter: App ready, initializing plugin');
                    initialize(Lampa);
                }
            });
        }
    });
})();
