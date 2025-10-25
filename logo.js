(function () {
    'use strict';

    // --- Регистрация настроек в разделе "Интерфейс" ---
    if (window.Lampa && Lampa.SettingsApi) {
        // Добавление заголовка "Логотип вместо названия"
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_settings_title',
                type: 'title'
            },
            field: {
                name: "Логотип вместо названия"
            },
            onRender: function () {
                setTimeout(() => {
                    $('.settings-param > div:contains("Логотип вместо названия")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
            }
        });

        // Добавление переключателя для отображения логотипа вместо заголовка
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'show_logo_instead_of_title',
                type: 'select',
                values: {
                    'true': "Показать",
                    'false': "Скрыть"
                },
                'default': 'true'
            },
            field: {
                name: "Логотип вместо заголовка",
                description: "Заменяет текстовый заголовок фильма логотипом"
            },
            onRender: function () {
                setTimeout(() => {
                    $('.settings-param > div:contains("Логотип вместо заголовка")').parent().insertAfter($('div[data-name="logo_settings_title"]'));
                }, 0);
            },
            onChange: function(value) {
                Lampa.Storage.set('show_logo_instead_of_title', value);
            }
        });

        // Добавление настройки высоты логотипа
        Lampa.SettingsApi.addParam({
            component: 'interface',
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
                name: "Размер логотипа",
                description: "Максимальная высота логотипа"
            },
            onRender: function () {
                setTimeout(() => {
                    $('.settings-param > div:contains("Размер логотипа")').parent().insertAfter($('div[data-name="show_logo_instead_of_title"]'));
                }, 0);
            },
            onChange: function(value) {
                Lampa.Storage.set('info_panel_logo_max_height', value);
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

                var currentTitleElement = html ? html.find('.new-interface-info__title') : null;
                if (currentTitleElement && currentTitleElement.length) {
                    if (logoPath) {
                        var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '100');
                        if (!/^\d+$/.test(selectedHeight)) {
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
                            var id = movie.id;
                            var initialTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");

                            if (initialTargetElement.length > 0) {
                                initialTargetElement.text(movie.title);
                                if (!network) {
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

                                    var currentTitleElement = $(eventData.object.activity.render()).find(".full-start-new__title");
                                    if (currentTitleElement && currentTitleElement.length) {
                                        if (logoPath) {
                                            var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '60');
                                            if (!/^\d+$/.test(selectedHeight)) {
                                                selectedHeight = '75';
                                            }
                                            var imageSize = 'original';
                                            var styleAttr = `margin-top: 5px; max-height: ${selectedHeight}px; max-width: 100%; vertical-align: middle;`;
                                            var imgUrl = Lampa.TMDB.image('/t/p/' + imageSize + logoPath);
                                            var imgTagHtml = `<img src="${imgUrl}" style="${styleAttr}" alt="${movie.title} Logo" />`;
                                            currentTitleElement.empty().html(imgTagHtml);
                                        } else {
                                            currentTitleElement.text(movie.title);
                                        }
                                    }
                                }, function(xhr, status) {
                                    var currentTitleElement = $(eventData.object.activity.render()).find(".full-start-new__title");
                                    if (currentTitleElement && currentTitleElement.length) {
                                        currentTitleElement.text(movie.title);
                                    }
                                });
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
