(function () {
    'use strict';

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

            // Установка заголовка или логотипа
            if (data.method && data.title) {
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
            var apiKey = '4ef0d7355d9ffb5151e987764708ce96'; // API-ключ из предоставленного кода
            var language = Lampa.Storage.get('language', 'ru');
            var apiUrl = `http://tmdbapi.bylampa.online/3/${method === 'tv' ? 'tv' : 'movie'}/${id}/images?api_key=${apiKey}&language=${language}`;

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
                        var imageSize = 'w500';
                        var styleAttr = `margin-top: 0.3em; margin-bottom: 0.1em; max-height: 2.8em; max-width: 100%; vertical-align: middle;`;
                        var imgUrl = `http://tmdbimg.bylampa.online/t/p/${imageSize}${logoPath}`;
                        var imgTagHtml = `<img src="${imgUrl}" style="${styleAttr}" alt="${movieData.title} Логотип" />`;
                        currentTitleElement.empty().html(imgTagHtml);
                    } else {
                        currentTitleElement.text(movieData.title);
                    }
                }
            }, function(xhr, status) {
                var currentTitleElement = html ? html.find('.new-interface-info__title') : null;
                if (currentTitleElement && currentTitleElement.length && movieData.title) {
                    currentTitleElement.text(movieData.title);
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
                try {
                    if (eventData.type === 'complite') {
                        var movie = eventData.data.movie;
                        if (movie && movie.id && movie.title) {
                            movie.method = movie.name ? 'tv' : 'movie';
                            var id = movie.id;
                            var render = eventData.object.activity.render();
                            var titleElements = $(['.full-start-new__title', '.full-start__title'], render);

                            // Скрытие дополнительных элементов, как в предоставленном коде
                            $('.full-start-new__tagline, .full-start__title-original', render).hide();

                            if (titleElements.length > 0) {
                                titleElements.text(movie.title);
                                if (!network) {
                                    return;
                                }

                                var apiKey = '4ef0d7355d9ffb5151e987764708ce96'; // API-ключ из предоставленного кода
                                var language = Lampa.Storage.get('language', 'ru');
                                var apiUrl = `http://tmdbapi.bylampa.online/3/${movie.method}/${id}/images?api_key=${apiKey}&language=${language}`;

                                network.clear();
                                network.timeout(7000);
                                network.silent(apiUrl, function (response) {
                                    var logoPath = null;
                                    if (response && response.logos && response.logos.length > 0) {
                                        var pngLogo = response.logos.find(logo => logo.file_path && !logo.file_path.endsWith('.svg'));
                                        logoPath = pngLogo ? pngLogo.file_path : response.logos[0].file_path;
                                    }

                                    var currentTitleElements = $(['.full-start-new__title', '.full-start__title'], render);
                                    if (currentTitleElements.length > 0) {
                                        if (logoPath) {
                                            var imageSize = 'w500';
                                            var styleAttr = window.innerWidth > 585
                                                ? `margin-top: 0.3em; margin-bottom: 0.1em; max-height: 2.8em; max-width: 100%; vertical-align: middle;`
                                                : `margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em; max-width: 100%; vertical-align: middle;`;
                                            var imgUrl = `http://tmdbimg.bylampa.online/t/p/${imageSize}${logoPath}`;
                                            var imgTagHtml = `<img src="${imgUrl}" style="${styleAttr}" alt="${movie.title} Логотип" />`;
                                            currentTitleElements.empty().html(imgTagHtml);
                                        } else {
                                            currentTitleElements.text(movie.title);
                                        }
                                    }
                                }, function(xhr, status) {
                                    var currentTitleElements = $(['.full-start-new__title', '.full-start__title'], render);
                                    if (currentTitleElements.length > 0 && movie.title) {
                                        currentTitleElements.text(movie.title);
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
