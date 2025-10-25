(function () {
    'use strict';

    // --- Переводы для интерфейса ---
    if (window.Lampa && Lampa.Lang) {
        Lampa.Lang.add({
            logo_toggle_name: {
                ru: "Логотип вместо заголовка",
                en: "Logo Instead of Title",
                uk: "Логотип замість заголовка"
            },
            logo_toggle_desc: {
                ru: "Заменяет текстовый заголовок фильма логотипом",
                en: "Replaces movie text title with a logo",
                uk: "Замінює текстовий заголовок логотипом"
            },
            settings_show: {
                ru: "Показать",
                en: "Show",
                uk: "Показати"
            },
            settings_hide: {
                ru: "Скрыть",
                en: "Hide",
                uk: "Приховати"
            },
            info_panel_logo_height_name: {
                ru: "Размер логотипа",
                en: "Logo Size",
                uk: "Висота логотипу"
            },
            info_panel_logo_height_desc: {
                ru: "Максимальная высота логотипа",
                en: "Maximum logo height",
                uk: "Максимальна висота логотипу"
            }
        });
    }

    // --- Регистрация настроек в интерфейсе ---
    if (window.Lampa && Lampa.SettingsApi) {
        // Добавление категории настроек
        Lampa.SettingsApi.addComponent({
            component: 'additional_ratings',
            name: Lampa.Lang.translate('additional_ratings_title'),
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" xml:space="preserve" width="32" height="32" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>'
        });

        // Добавление переключателя для отображения логотипа вместо заголовка
        Lampa.SettingsApi.addParam({
            component: 'additional_ratings',
            param: {
                name: 'show_logo_instead_of_title',
                type: 'select',
                values: {
                    'true': Lampa.Lang.translate('settings_show'),
                    'false': Lampa.Lang.translate('settings_hide')
                },
                'default': 'false'
            },
            field: {
                name: Lampa.Lang.translate('logo_toggle_name'),
                description: Lampa.Lang.translate('logo_toggle_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('show_logo_instead_of_title', value);
            }
        });

        // Добавление настройки высоты логотипа
        Lampa.SettingsApi.addParam({
            component: 'additional_ratings',
            param: {
                name: 'info_panel_logo_max_height',
                type: 'select',
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
                'default': '100'
            },
            field: {
                name: Lampa.Lang.translate('info_panel_logo_height_name'),
                description: Lampa.Lang.translate('info_panel_logo_height_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('info_panel_logo_max_height', value);
            }
        });
    } else {
        console.error("Логотип: Lampa.SettingsApi недоступен. Настройки не могут быть созданы.");
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
                console.error("create.update: Элемент 'html' не готов.");
                return;
            }
            if (!data || !data.id || !data.title) {
                console.warn("create.update: Получены неполные данные.", data);
                return;
            }

            // Установка фонового изображения
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));

            // Определение настройки отображения логотипа
            var storageKey = 'show_logo_instead_of_title';
            var showLogos = (Lampa.Storage.get(storageKey, 'false') === 'true' || Lampa.Storage.get(storageKey, false) === true);

            // Установка заголовка или логотипа
            if (showLogos && data.method && data.title) {
                this.displayLogoOrTitle(data);
            } else if (data.title) {
                html.find('.new-interface-info__title').text(data.title);
            } else {
                html.find('.new-interface-info__title').empty();
            }
        };

        // Метод для отображения логотипа или заголовка
        this.displayLogoOrTitle = function(movieData) {
            if (!html) return;
            var titleElement = html.find('.new-interface-info__title');
            if (!titleElement.length) return;

            if (!movieData || !movieData.id || !movieData.method || !movieData.title) {
                console.warn("displayLogoOrTitle: Получены невалидные данные.");
                titleElement.empty();
                return;
            }

            var id = movieData.id;
            titleElement.text(movieData.title);

            if (!network) {
                console.error("displayLogoOrTitle: Глобальная сеть недоступна.");
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

                var currentTitleElement = html ? html.find('.new-interface-info__title') : null;
                if (currentTitleElement && currentTitleElement.length) {
                    if (logoPath) {
                        var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '100');
                        if (!/^\d+$/.test(selectedHeight)) {
                            console.warn(`Недопустимая высота логотипа '${selectedHeight}' в хранилище, используется значение по умолчанию '100'.`);
                            selectedHeight = '100';
                        }

                        var imageSize = 'original';
                        var styleAttr = `max-height: ${selectedHeight}px; max-width: 100%; vertical-align: middle; margin-bottom: 0.1em;`;
                        var imgUrl = Lampa.TMDB.image('/t/p/' + imageSize + logoPath);
                        var imgTagHtml = `<img src="${imgUrl}" style="${styleAttr}" alt="${movieData.title} Logo" />`;
                        currentTitleElement.empty().html(imgTagHtml);
                    } else {
                        currentTitleElement.text(movieData.title);
                    }
                }
            }, function(xhr, status) {
                console.error(`displayLogoOrTitle (ID ${id}): Ошибка API ${status}. Устанавливается текстовый заголовок.`);
                var currentTitleElement = html ? html.find('.new-interface-info__title') : null;
                if (currentTitleElement && currentTitleElement.length) {
                    if (movieData && movieData.title) {
                        currentTitleElement.text(movieData.title);
                    } else {
                        currentTitleElement.empty();
                    }
                }
            });
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
        if (!window.Lampa || !Lampa.Utils || !Lampa.Lang || !Lampa.Storage || !Lampa.TMDB || !Lampa.Reguest || !Lampa.Api) {
            console.error("Логотип: Отсутствуют необходимые компоненты Lampa.");
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
                            var id = movie.id;
                            var initialTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");

                            if (initialTargetElement.length > 0) {
                                initialTargetElement.text(movie.title);
                                if (!network) {
                                    console.error("Listener (Full): Глобальная сеть недоступна.");
                                    return;
                                }

                                var apiKey = Lampa.TMDB.key();
                                var language = Lampa.Storage.get('language');
                                var apiUrl = Lampa.TMDB.api((movie.method === 'tv' ? 'tv/' : 'movie/') + id + '/images?api_key=' + apiKey + '&language=' + language);

                                network.clear();
                                network.timeout(7000);
                                network.silent(apiUrl, function (response) {
                                    var logoPath = null;
                                    if (response && response.logos && response.logos.length > 0) {
                                        var pngLogo = response.logos.find(logo => logo.file_path && !logo.file_path.endsWith('.svg'));
                                        logoPath = pngLogo ? pngLogo.file_path : response.logos[0].file_path;
                                    }

                                    var currentTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");
                                    if (currentTargetElement.length > 0) {
                                        if (logoPath) {
                                            var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '60');
                                            if (!/^\d+$/.test(selectedHeight)) {
                                                selectedHeight = '75';
                                            }
                                            var imageSize = 'original';
                                            var styleAttr = `margin-top: 5px; max-height: ${selectedHeight}px; max-width: 100%; vertical-align: middle;`;
                                            var imgUrl = Lampa.TMDB.image('/t/p/' + imageSize + logoPath);
                                            var imgTagHtml = `<img src="${imgUrl}" style="${styleAttr}" alt="${movie.title} Logo" />`;
                                            currentTargetElement.empty().html(imgTagHtml);
                                        } else {
                                            currentTargetElement.text(movie.title);
                                        }
                                    }
                                }, function(xhr, status) {
                                    console.error(`Listener (Full ID: ${id}): Ошибка API ${status}. Устанавливается текстовый заголовок.`);
                                    var currentTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");
                                    if (currentTargetElement && currentTargetElement.length) {
                                        currentTargetElement.text(movie.title);
                                    }
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error("Логотип (Full): Ошибка в обработчике:", e);
                }
            });
        } else {
            console.error("Логотип: Lampa.Listener или глобальная сеть недоступны. Замена логотипа на карточке отключена.");
        }
    }

    // Запуск плагина, если он еще не инициализирован
    if (!window.plugin_interface_ready) startPlugin();
})();