(function () {
    'use strict';

    // --- Функция для отображения подменю настроек логотипа ---
    function showLogoSettings() {
        // Проверка наличия необходимых компонентов
        if (!Lampa.Select || !Lampa.Controller) {
            return;
        }

        // Определение элементов для диалога
        var items = [
            {
                title: "Логотип вместо заголовка",
                subtitle: "Заменяет текстовый заголовок фильма логотипом",
                name: 'show_logo_instead_of_title',
                checkbox: true,
                checked: Lampa.Storage.get('show_logo_instead_of_title', 'false') === 'true',
                default: false
            },
            {
                title: "Размер логотипа",
                subtitle: "Максимальная высота логотипа",
                name: 'info_panel_logo_max_height',
                values: {
                    '50': '50px',
                    '75': '75px',
                    '100': '100px',
                    '125': '125px',
                    '150': '150px',
                    '175': '175px',
                    '200': '200px',
                    '225': '225px',
                    '250': '250px',
                    '300': '300px',
                    '350': '350px',
                    '400': '400px',
                    '450': '450px',
                    '500': '500px'
                },
                value: Lampa.Storage.get('info_panel_logo_max_height', '100')
            }
        ];

        // Получение текущего контекста контроллера для корректного возврата
        var currentController = Lampa.Controller.enabled().name;

        // Отображение диалога с настройками
        Lampa.Select.show({
            title: "Логотип вместо названия",
            items: items,
            onBack: function () {
                Lampa.Controller.toggle(currentController || 'settings_component');
            },
            onCheck: function (item) {
                // Обработка переключателя "Логотип вместо заголовка"
                if (item.name === 'show_logo_instead_of_title') {
                    var newValue = !Lampa.Storage.get('show_logo_instead_of_title', 'false') === 'true';
                    Lampa.Storage.set('show_logo_instead_of_title', newValue);
                    item.checked = newValue;

                    // Обновление текущей карточки или панели
                    updateInterface();
                }
            },
            onSelect: function (item) {
                // Обработка выбора "Размер логотипа"
                if (item.name === 'info_panel_logo_max_height' && item.selected) {
                    Lampa.Storage.set('info_panel_logo_max_height', item.selected);
                    item.value = item.selected;

                    // Обновление текущей карточки или панели
                    updateInterface();
                }
            }
        });
    }

    // --- Вспомогательная функция для обновления интерфейса ---
    function updateInterface() {
        if (Lampa.Activity.active().activity) {
            var currentActivity = Lampa.Activity.active().activity;
            var render = currentActivity.render();
            var movie = currentActivity.movie || {};
            if (render && movie.id && movie.title) {
                var titleElement = $(render).find(".full-start-new__title, .new-interface-info__title");
                if (titleElement.length) {
                    var showLogos = Lampa.Storage.get('show_logo_instead_of_title', 'false') === 'true';
                    if (showLogos && movie.method) {
                        updateLogoDisplay(movie, titleElement);
                    } else {
                        titleElement.text(movie.title);
                    }
                }
            }
        }
    }

    // --- Вспомогательная функция для обновления отображения логотипа ---
    function updateLogoDisplay(movieData, titleElement) {
        if (!movieData || !movieData.id || !movieData.method || !movieData.title || !titleElement.length) {
            titleElement.empty();
            return;
        }

        var id = movieData.id;
        titleElement.text(movieData.title);

        if (!network) {
            return;
        }

        var method = movieData.method;
        var apiKey = Lampa.TMDB.key();
        var language = Lampa.Storage.get('language');
        var apiUrl = Lampa.TMDB.api((method === 'tv' ? 'tv/' : 'movie/') + id + '/images?api_key=' + apiKey + '&language=' + language);

        network.clear();
        network.timeout(7000);
        network.silent(apiUrl, function (response) {
            var logoPath = null;
            if (response && response.logos && response.logos.length > 0) {
                var pngLogo = response.logos.find(logo => logo.file_path && !logo.file_path.endsWith('.svg'));
                logoPath = pngLogo ? pngLogo.file_path : response.logos[0].file_path;
            }

            if (titleElement.length) {
                if (logoPath) {
                    var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '100');
                    if (!/^\d+$/.test(selectedHeight)) {
                        selectedHeight = '100';
                    }

                    var imageSize = 'original';
                    var styleAttr = `max-height: ${selectedHeight}px; max-width: 100%; vertical-align: middle; margin-bottom: 0.1em;`;
                    var imgUrl = Lampa.TMDB.image('/t/p/' + imageSize + logoPath);
                    var imgTagHtml = `<img src="${imgUrl}" style="${styleAttr}" alt="${movieData.title} Logo" />`;
                    titleElement.empty().html(imgTagHtml);
                } else {
                    titleElement.text(movieData.title);
                }
            }
        }, function(xhr, status) {
            if (titleElement.length && movieData.title) {
                titleElement.text(movieData.title);
            }
        });
    }

    // --- Регистрация кнопки в разделе "Интерфейс" ---
    if (window.Lampa && Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_settings_button',
                type: 'button'
            },
            field: {
                name: "Логотип вместо названия",
                description: "Настройки отображения логотипа вместо заголовка"
            },
            onRender: function () {
                setTimeout(() => {
                    $('.settings-param > div:contains("Логотип вместо названия")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
            },
            onChange: function () {
                showLogoSettings();
            }
        });
    }

    // --- Экземпляр сети ---
    var network = (window.Lampa && Lampa.Reguest) ? new Lampa.Reguest() : null;

    // --- Функция create (обработчик информационной панели) ---
    function create() {
        var html;

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function(data) {
            if (!html) {
                return;
            }
            if (!data || !data.id || !data.title) {
                return;
            }

            // Установка фонового изображения
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));

            // Определение настройки отображения логотипа
            var storageKey = 'show_logo_instead_of_title';
            var showLogos = (Lampa.Storage.get(storageKey, 'false') === 'true' || Lampa.Storage.get(storageKey, false) === true);

            // Установка заголовка или логотипа
            if (showLogos && data.method && data.title) {
                updateLogoDisplay(data, html.find('.new-interface-info__title'));
            } else if (data.title) {
                html.find('.new-interface-info__title').text(data.title);
            } else {
                html.find('.new-interface-info__title').empty();
            }
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            html.remove();
            html = null;
        };
    }

    // --- Инициализация плагина ---
    function startPlugin() {
        if (!window.Lampa || !Lampa.Utils || !Lampa.Storage || !Lampa.TMDB || !Lampa.Reguest || !Lampa.Api) {
            return;
        }

        window.plugin_interface_ready = true;

        // Добавление слушателя для замены заголовка логотипом на карточке
        if (Lampa.Listener && network) {
            Lampa.Listener.follow("full", function(eventData) {
                var storageKey = 'show_logo_instead_of_title';
                try {
                    var showLogos = (Lampa.Storage.get(storageKey, 'false') === 'true' || Lampa.Storage.get(storageKey, false) === true);
                    if (eventData.type === 'complite' && showLogos) {
                        var movie = eventData.data.movie;
                        if (movie && movie.id && movie.title) {
                            movie.method = movie.name ? 'tv' : 'movie';
                            var initialTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");

                            if (initialTargetElement.length > 0) {
                                updateLogoDisplay(movie, initialTargetElement);
                            }
                        }
                    }
                } catch (e) {}
            });
        }
    }

    // Запуск плагина при готовности приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') startPlugin();
        });
    }
})();
