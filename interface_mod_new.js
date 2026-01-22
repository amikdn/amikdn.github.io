(function () {
    'use strict';

    // Полифилл для String.prototype.startsWith для ES5
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // Локализация
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Интерфейс MOD',
            en: 'Interface MOD',
            uk: 'Інтерфейс MOD'
        },
        interface_mod_new_about_plugin: {
            ru: 'О плагине',
            en: 'About plugin',
            uk: 'Про плагін'
        },
        interface_mod_new_show_movie_type: {
            ru: 'Показывать лейблы типа',
            en: 'Show type labels',
            uk: 'Показувати мітки типу'
        },
        interface_mod_new_show_movie_type_desc: {
            ru: 'Показывать лейблы "Фильм" и "Сериал" на постере',
            en: 'Show "Movie" and "Series" labels on poster',
            uk: 'Показувати мітки "Фільм" і "Серіал" на постері'
        },
        interface_mod_new_label_serial: {
            ru: 'Сериал',
            en: 'Series',
            uk: 'Серіал'
        },
        interface_mod_new_label_movie: {
            ru: 'Фильм',
            en: 'Movie',
            uk: 'Фільм'
        },
        interface_mod_new_info_panel: {
            ru: 'Новая инфо-панель',
            en: 'New info panel',
            uk: 'Нова інфо-панель'
        },
        interface_mod_new_info_panel_desc: {
            ru: 'Цветная и перефразированная строка информации о фильме/сериале',
            en: 'Colored and rephrased info line about movie/series',
            uk: 'Кольорова та перефразована інформаційна панель'
        },
        interface_mod_new_colored_ratings: {
            ru: 'Цветной рейтинг',
            en: 'Colored rating',
            uk: 'Кольоровий рейтинг'
        },
        interface_mod_new_colored_ratings_desc: {
            ru: 'Включить цветовое выделение рейтинга',
            en: 'Enable colored rating highlight',
            uk: 'Увімкнути кольорове виділення рейтингу'
        },
        interface_mod_new_colored_status: {
            ru: 'Цветные статусы',
            en: 'Colored statuses',
            uk: 'Кольорові статуси'
        },
        interface_mod_new_colored_status_desc: {
            ru: 'Включить цветовое выделение статуса сериала',
            en: 'Enable colored series status',
            uk: 'Увімкнути кольоровий статус серіалу'
        },
        interface_mod_new_colored_age: {
            ru: 'Цветные возрастные ограничения',
            en: 'Colored age ratings',
            uk: 'Кольорові вікові обмеження'
        },
        interface_mod_new_colored_age_desc: {
            ru: 'Включить цветовое выделение возрастных ограничений',
            en: 'Enable colored age rating highlight',
            uk: 'Увімкнути кольорове виділення вікових обмежень'
        },
        interface_mod_new_show_all_buttons: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode: {
            ru: 'Стиль кнопок',
            en: 'Button style',
            uk: 'Стиль кнопок'
        },
        interface_mod_new_buttons_style_mode_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_buttons_style_mode_all: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode_custom: {
            ru: 'Пользовательский',
            en: 'Custom',
            uk: 'Користувацький'
        },
        interface_mod_new_theme_select: {
            ru: 'Тема интерфейса',
            en: 'Interface theme',
            uk: 'Тема інтерфейсу'
        },
        interface_mod_new_theme_select_desc: {
            ru: 'Выберите тему оформления интерфейса',
            en: 'Choose interface theme',
            uk: 'Виберіть тему оформлення інтерфейсу'
        },
        interface_mod_new_theme_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_theme_minimalist: {
            ru: 'Минималистичная',
            en: 'Minimalist',
            uk: 'Мінімалістична'
        },
        interface_mod_new_theme_glow_outline: {
            ru: 'Светящийся контур',
            en: 'Glowing outline',
            uk: 'Світловий контур'
        },
        interface_mod_new_theme_menu_lines: {
            ru: 'Меню с линиями',
            en: 'Menu with lines',
            uk: 'Меню з лініями'
        },
        interface_mod_new_theme_dark_emerald: {
            ru: 'Тёмный Emerald',
            en: 'Dark Emerald',
            uk: 'Темний Emerald'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style',
            uk: 'Новий стиль заголовків'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включает стильное оформление заголовков подборок с анимацией и спецэффектами',
            en: 'Enables stylish titles with animation and special effects',
            uk: 'Включає стильне оформлення заголовків підборівок з анімацією та спеціальними ефектами'
        },
        interface_mod_new_enhance_detailed_info: {
            ru: 'Увеличенная информация Beta',
            en: 'Enhanced detailed info Beta',
            uk: 'Збільшена інформація Beta'
        },
        interface_mod_new_enhance_detailed_info_desc: {
            ru: 'Включить увеличенную информацию о фильме/сериале',
            en: 'Enable enhanced detailed info about movie/series',
            uk: 'Увімкнути збільшену інформацію про фільм/серіал'
        }
    });

    // Настройки по умолчанию
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
        enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false)
    };
    
    // Информация о плагине
    var aboutPluginData = null;
    
// Основные настройки плагина (удалено - перенесено в addSettings)

    // Функция для добавления лейблов на карточки
    function changeMovieTypeLabels() {
        // Стили для лейблов
        var styleTag = $('<style id="movie_type_styles_new"></style>').html(`
            .content-label-new {
                position: absolute!important;
                left: 0.3em!important;
                bottom: 0.3em!important;
                background: rgba(0,0,0,0.5)!important;
                color: #fff!important;
                font-size: 1.3em!important;
                padding: 0.2em 0.5em!important;
                -webkit-border-radius: 1em!important;
                -moz-border-radius: 1em!important;
                border-radius: 1em!important;
                font-weight: 700;
                z-index: 10!important;
            }
            .serial-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3498db!important;
            }
            .movie-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #2ecc71!important;
            }
            /* Скрываем встроенный лейбл TV только при включенной функции */
            body[data-movie-labels-new="on"] .card--tv .card__type {
                display: none!important;
            }
        `);
        $('head').append(styleTag);

        // Устанавливаем атрибут для body
        if (settings.show_movie_type) {
            $('body').attr('data-movie-labels-new', 'on');
        } else {
            $('body').attr('data-movie-labels-new', 'off');
        }

        // Функция для добавления лейбла к карточке
        function addLabelToCard(card) {
            if (!settings.show_movie_type) return;
            var $card = $(card);
            var $view = $card.find('.card__view');
            if (!$view.length || $card.find('.content-label-new').length) return;
            var is_tv = false;
            var cardText = $card.text().toLowerCase();
            if ($card.hasClass('card--tv') || $card.find('.card__type').text().trim() === 'TV') {
                is_tv = true;
            }
            var isUnwantedContent = false;
            if ($card.parents('.sisi-results, .sisi-videos, .sisi-section').length ||
                $card.closest('[data-component="sisi"]').length ||
                $card.closest('[data-name*="sisi"]').length) {
                isUnwantedContent = true;
            }
            if (window.location.href.indexOf('sisi') !== -1) {
                isUnwantedContent = true;
            }
            if ($card.find('.card__quality, .card__time').length) {
                isUnwantedContent = true;
            }
            if (/(xxx|porn|эрот|секс|порно|для взрослых|sex|adult|erotica|ass|boobs|milf|teen|amateur|anal|webcam|private|18\+)/i.test(cardText)) {
                isUnwantedContent = true;
            }
            if (!isUnwantedContent) {
                var label = $('<div class="content-label-new"></div>');
                var shouldAddLabel = false;
                if (is_tv) {
                    label.addClass('serial-label-new');
                    label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                    shouldAddLabel = true;
                } else {
                    var hasMovieTraits = $card.find('.card__age').length ||
                        $card.find('.card__vote').length ||
                        /\b(19|20)\d{2}\b/.test(cardText) ||
                        /(фильм|movie|полнометражный)/i.test(cardText);
                    if (hasMovieTraits) {
                        label.addClass('movie-label-new');
                        label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        shouldAddLabel = true;
                    }
                }
                if (shouldAddLabel) {
                    $view.append(label);
                }
            }
        }

        // Обновление лейбла при изменении данных карточки
        function updateCardLabel(card) {
            if (!settings.show_movie_type) return;
            $(card).find('.content-label-new').remove();
            addLabelToCard(card);
        }

        // Обработка всех карточек
        function processAllCards() {
            if (!settings.show_movie_type) return;
            $('.card').each(function() {
                addLabelToCard(this);
            });
        }

        // Слушатель для карточек в детальном представлении
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                var movie = data.data.movie;
                var posterContainer = $(data.object.activity.render()).find('.full-start__poster');
                if (posterContainer.length && movie) {
                    var is_tv = false;
                    if (movie.number_of_seasons > 0 || movie.seasons || movie.season_count > 0) {
                        is_tv = true;
                    } else if (movie.type === 'tv' || movie.card_type === 'tv') {
                        is_tv = true;
                    }
                    if (settings.show_movie_type) {
                        var existingLabel = posterContainer.find('.content-label-new');
                        if (existingLabel.length) {
                            existingLabel.remove();
                        }
                        var label = $('<div class="content-label-new"></div>');
                        if (is_tv) {
                            label.addClass('serial-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                        } else {
                            label.addClass('movie-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        }
                        posterContainer.css('position', 'relative');
                        posterContainer.append(label);
                    }
                }
            }
        });

        // MutationObserver для новых карточек и изменений
        var observer = new MutationObserver(function(mutations) {
            var needCheck = false;
            var cardsToUpdate = new Set();
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if ($(node).hasClass('card')) {
                            cardsToUpdate.add(node);
                            needCheck = true;
                        } else if ($(node).find('.card').length) {
                            $(node).find('.card').each(function() {
                                cardsToUpdate.add(this);
                            });
                            needCheck = true;
                        }
                    }
                }
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' ||
                        mutation.attributeName === 'data-card' ||
                        mutation.attributeName === 'data-type')) {
                    var targetNode = mutation.target;
                    if ($(targetNode).hasClass('card')) {
                        cardsToUpdate.add(targetNode);
                        needCheck = true;
                    }
                }
            });
            if (needCheck) {
                setTimeout(function() {
                    cardsToUpdate.forEach(function(card) {
                        updateCardLabel(card);
                    });
                }, 100);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-card', 'data-type']
        });
        processAllCards();
    }

    // Добавление настройки в меню Lampa
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });
        
        // Перемещаем пункт "Интерфейс MOD" сразу после "Интерфейс" (без зацикливания)
        function moveModSettingsFolder() {
            var $folders = $('.settings-folder');
            var $interface = $folders.filter(function() {
                return $(this).data('component') === 'interface';
            });
            var $mod = $folders.filter(function() {
                return $(this).data('component') === 'interface_mod_new';
            });
            if ($interface.length && $mod.length) {
                // Проверяем, не стоит ли уже на нужном месте
                if ($mod.prev()[0] !== $interface[0]) {
                    $mod.insertAfter($interface);
                }
            }
        }
        
        // Настройка типа фильмов
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'movie_type',
                type: 'select',
                values: {
                    default: 'По умолчанию',
                    all: 'Все',
                    main2: 'Основной 2'
                },
                default: 'main2'
            },
            field: {
                name: 'Тип отображения фильмов',
                description: 'Выберите стиль отображения фильмов в интерфейсе'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_mod_new_movie_type', value);
                Lampa.Settings.update();
                changeMovieTypeLabels();
            }
        });

        // Панель информации
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'info_panel',
                type: 'switch',
                default: true
            },
            field: {
                name: 'Информационная панель',
                description: 'Показывать расширенную информацию о контенте'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_mod_new_info_panel', value);
                Lampa.Settings.update();
            }
        });

        // Цвета рейтингов
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'vote_colors',
                type: 'switch',
                default: true
            },
            field: {
                name: 'Цветные рейтинги',
                description: 'Включить цветовое оформление рейтингов'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_mod_new_vote_colors', value);
                Lampa.Settings.update();
            }
        });

        // Стиль кнопок
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'buttons_style',
                type: 'select',
                values: {
                    default: 'По умолчанию',
                    all: 'Все',
                    main2: 'Основной 2'
                },
                default: 'main2'
            },
            field: {
                name: 'Стиль кнопок',
                description: 'Выберите стиль отображения кнопок в интерфейсе'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_mod_new_buttons_style_mode', value);
                Lampa.Settings.update();
            }
        });

        // Темы оформления
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'theme',
                type: 'select',
                values: {
                    default: 'По умолчанию',
                    aurora: 'Aurora',
                    emerald: 'Emerald V1'
                },
                default: 'default'
            },
            field: {
                name: 'Тема оформления',
                description: 'Выберите тему оформления интерфейса'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_mod_new_themes', value);
                Lampa.Settings.update();
            }
        });

        // Стилизация заголовков
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'stylize_titles',
                type: 'switch',
                default: false
            },
            field: {
                name: 'Стилизованные заголовки',
                description: 'Включить специальное оформление заголовков'
            },
            onChange: function(value) {
                Lampa.Storage.set('stylized-titles-css', value);
                Lampa.Settings.update();
            }
        });

        // Расширенная информация
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'enhanced_detailed_info',
                type: 'switch',
                default: false
            },
            field: {
                name: 'Расширенная информация',
                description: 'Показывать дополнительную информацию о фильмах и сериалах'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_mod_new_enhanced_detailed_info', value);
                Lampa.Settings.update();
            }
        });
        
        setTimeout(function() {
            moveModSettingsFolder();
        }, 100);
    }

    // Функция склонения слов
    function plural(number, one, two, five) {
        var n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    // Вспомогательные функции для инфо-панели
    function calculateAverageEpisodeDuration(movie) {
        if (!movie || typeof movie !== 'object') return 0;
        var totalDuration = 0, episodeCount = 0;
        // Фильтруем неадекватные значения (больше 200 минут)
        if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length > 0) {
            var filtered = movie.episode_run_time.filter(function(duration) {
                return duration > 0 && duration <= 200;
            });
            if (filtered.length > 0) {
                filtered.forEach(function(duration) {
                    totalDuration += duration;
                    episodeCount++;
                });
            }
        } else if (movie.seasons && Array.isArray(movie.seasons)) {
            movie.seasons.forEach(function(season) {
                if (season.episodes && Array.isArray(season.episodes)) {
                    season.episodes.forEach(function(episode) {
                        if (episode.runtime && episode.runtime > 0 && episode.runtime <= 200) {
                            totalDuration += episode.runtime;
                            episodeCount++;
                        }
                    });
                }
            });
        }
        if (episodeCount > 0) return Math.round(totalDuration / episodeCount);
        // Если не нашли адекватных значений — пробуем last_episode_to_air.runtime
        if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
            return movie.last_episode_to_air.runtime;
        }
        // Если всё равно ничего — возвращаем 0
        return 0;
    }
    function formatDurationMinutes(minutes) {
        if (!minutes || minutes <= 0) return '';
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        var result = '';
        if (hours > 0) {
            result += hours + ' ' + plural(hours, 'час', 'часа', 'часов');
            if (mins > 0) result += ' ' + mins + ' ' + plural(mins, 'минута', 'минуты', 'минут');
        } else {
            result += mins + ' ' + plural(mins, 'минута', 'минуты', 'минут');
        }
        return result;
    }

    // Основная функция новой инфо-панели
    function newInfoPanel() {
        if (!settings.info_panel) return;
        var colors = {
            seasons: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            episodes: { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
            duration: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            next: { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
            genres: {
                'Боевик': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'Приключения': { bg: 'rgba(39, 174, 96, 0.8)', text: 'white' },
                'Мультфильм': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'Комедия': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
                'Криминал': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Документальный': { bg: 'rgba(22, 160, 133, 0.8)', text: 'white' },
                'Драма': { bg: 'rgba(142, 68, 173, 0.8)', text: 'white' },
                'Семейный': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'Фэнтези': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'История': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
                'Ужасы': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Музыка': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'Детектив': { bg: 'rgba(52, 73, 94, 0.8)', text: 'white' },
                'Мелодрама': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
                'Фантастика': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
                'Триллер': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Военный': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' },
                'Вестерн': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
                'Боевик и Приключения': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'Детский': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'Новости': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'Реалити-шоу': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
                'НФ и Фэнтези': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
                'Мыльная опера': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
                'Ток-шоу': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
                'Война и Политика': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' }
            }
        };
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && settings.info_panel) {
                setTimeout(function() {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;
                    var movie = data.data.movie;
                    var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');
                    var originalDetails = details.html();
                    details.empty();
                    var newContainer = $('<div>').css({
                        'display': 'flex',
                        'flex-direction': 'column',
                        'width': '100%',
                        'gap': '0.6em',
                        'margin': '0.6em 0 0.6em 0'
                    });
                    var firstRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.4em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var secondRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.4em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var thirdRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.4em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var durationElement = null, seasonElements = [], episodeElements = [], nextEpisodeElements = [], genreElements = [];
                    var tempContainer = $('<div>').html(originalDetails);
                    // Удаляем стандартные метки о следующей серии
                    tempContainer.find('span').filter(function() {
                        var t = $(this).text();
                        return t.indexOf('Следующая:') !== -1 || t.indexOf('Осталось дней:') !== -1;
                    }).remove();
                    tempContainer.find('span').each(function() {
                        var $span = $(this);
                        var text = $span.text();
                        if ($span.hasClass('full-start-new__split')) return;
                        var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                        // Универсальное перефразирование сезонов
                        var matchSeasons = text.match(/Сезон(?:ы)?:?\s*(\d+)/i);
                        if (matchSeasons) {
                            var n = parseInt(matchSeasons[1], 10);
                            $span.text(n + ' ' + plural(n, 'Сезон', 'Сезона', 'Сезонов'));
                            $span.css($.extend({}, baseStyle, { 'background-color': colors.seasons.bg, 'color': colors.seasons.text }));
                            seasonElements.push($span.clone());
                            return;
                        }
                        // Универсальное перефразирование серий
                        var matchEpisodes = text.match(/Серии?:?\s*(\d+)/i);
                        if (matchEpisodes) {
                            var n = parseInt(matchEpisodes[1], 10);
                            $span.text(n + ' ' + plural(n, 'Серия', 'Серии', 'Серий'));
                            $span.css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                            episodeElements.push($span.clone());
                            return;
                        }
                        // Обычная обработка (жанры и др.)
                        var genres = text.split(' | ');
                        if (genres.length > 1) {
                            var $genresContainer = $('<div>').css({ 'display': 'flex', 'flex-wrap': 'wrap', 'align-items': 'center' });
                            for (var i = 0; i < genres.length; i++) {
                                var genre = genres[i].trim();
                                var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                                var $badge = $('<span>').text(genre).css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text, 'margin': '0.2em' }));
                                $genresContainer.append($badge);
                            }
                            genreElements.push($genresContainer);
                        } else {
                            var genre = text.trim();
                            var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                            $span.css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text, 'margin': '0.2em' }));
                            genreElements.push($span.clone());
                        }
                    });
                    // --- КОРРЕКТНЫЙ ВЫВОД СЕРИЙ ДЛЯ СЕРИАЛОВ + МЕТКА О СЛЕДУЮЩЕЙ СЕРИИ ---
                    if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)) {
                        var totalEpisodes = 0;
                        var airedEpisodes = 0;
                        var currentDate = new Date();
                        var hasEpisodes = false;
                        movie.seasons.forEach(function(season) {
                            if (season.season_number === 0) return;
                            if (season.episode_count) totalEpisodes += season.episode_count;
                            if (season.episodes && Array.isArray(season.episodes) && season.episodes.length) {
                                hasEpisodes = true;
                                season.episodes.forEach(function(episode) {
                                    if (episode.air_date) {
                                        var epAirDate = new Date(episode.air_date);
                                        if (epAirDate <= currentDate) airedEpisodes++;
                                    }
                                });
                            } else if (season.air_date) {
                                var airDate = new Date(season.air_date);
                                if (airDate <= currentDate && season.episode_count) airedEpisodes += season.episode_count;
                            }
                        });
                        // ВЫВОД В КОНСОЛЬ для отладки
                        console.log('[interface_mod_new] airedEpisodes:', airedEpisodes, 'totalEpisodes:', totalEpisodes, movie);
                        // Если нет подробных данных по эпизодам, но есть next_episode_to_air
                        if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
                            var nextSeason = movie.next_episode_to_air.season_number;
                            var nextEpisode = movie.next_episode_to_air.episode_number;
                            var remainingEpisodes = 0;
                            movie.seasons.forEach(function(season) {
                                if (season.season_number === nextSeason) {
                                    remainingEpisodes = (season.episode_count || 0) - nextEpisode + 1;
                                } else if (season.season_number > nextSeason) {
                                    remainingEpisodes += season.episode_count || 0;
                                }
                            });
                            if (remainingEpisodes > 0 && totalEpisodes > 0) {
                                var calculatedAired = totalEpisodes - remainingEpisodes;
                                if (calculatedAired >= 0 && calculatedAired <= totalEpisodes) {
                                    airedEpisodes = calculatedAired;
                                }
                            }
                        }
                        // Формируем строку для серий
                        var episodesText = '';
                        if (totalEpisodes > 0 && airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                            episodesText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серия', 'Серии', 'Серий') + ' из ' + totalEpisodes;
                        } else if (totalEpisodes > 0) {
                            episodesText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серия', 'Серии', 'Серий');
                        }
                        // --- Новый порядок строк ---
                        // 1 строка: сезоны и серии
                        firstRow.empty();
                        seasonElements.forEach(function(el) { firstRow.append(el); });
                        // Удаляем все бейджи серий из episodeElements, чтобы не было дублирования
                        // и всегда показываем только наш кастомный бейдж
                        if (episodesText) {
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $badge = $('<span>').text(episodesText).css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                            firstRow.append($badge);
                        }
                        // 2 строка: только метка о следующей серии
                        secondRow.empty();
                        if (movie.next_episode_to_air && movie.next_episode_to_air.air_date && airedEpisodes < totalEpisodes) {
                            var nextDate = new Date(movie.next_episode_to_air.air_date);
                            var today = new Date();
                            nextDate.setHours(0,0,0,0);
                            today.setHours(0,0,0,0);
                            var diffDays = Math.floor((nextDate.getTime() - today.getTime()) / (1000*60*60*24));
                            var nextText = '';
                            if (diffDays === 0) nextText = 'Следующая серия уже сегодня';
                            else if (diffDays === 1) nextText = 'Следующая серия уже завтра';
                            else if (diffDays > 1) nextText = 'Следующая серия через ' + diffDays + ' ' + plural(diffDays, 'день', 'дня', 'дней');
                            if (nextText) {
                                var nextStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'background-color': colors.next.bg, 'color': colors.next.text, 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                                var $nextBadge = $('<span>').text(nextText).css(nextStyle);
                                secondRow.append($nextBadge);
                            }
                        }
                        // 3 строка: длительность серии
                        thirdRow.empty();
                        var avgDuration = calculateAverageEpisodeDuration(movie);
                        if (avgDuration > 0) {
                            var durationText = 'Длительность серии ≈ ' + formatDurationMinutes(avgDuration);
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                            thirdRow.append($avgDurationBadge);
                        }
                        // 4 строка: жанры
                        var genresRow = $('<div>').css({'display':'flex','flex-wrap':'wrap','align-items':'center'});
                        genreElements.forEach(function(el) { genresRow.append(el); });
                        // Очищаем и добавляем строки в контейнер
                        newContainer.empty();
                        newContainer.append(firstRow);
                        if (secondRow.children().length) newContainer.append(secondRow);
                        if (thirdRow.children().length) newContainer.append(thirdRow);
                        if (genresRow.children().length) newContainer.append(genresRow);
                        details.append(newContainer);
                        return;
                    }
                    // --- КОНЕЦ БЛОКА О СЛЕДУЮЩЕЙ СЕРИИ ---
                    // --- ДОПОЛНИТЕЛЬНАЯ ОБРАБОТКА ДЛЯ ФИЛЬМОВ ---
                    if (!isTvShow && movie && movie.runtime > 0) {
                        // Удаляем стандартные бейджи с временем (HH:MM) и 'Длительность серии ≈ ...' из tempContainer
                        tempContainer.find('span').filter(function() {
                            var t = $(this).text().trim();
                            return /^\d{2}:\d{2}$/.test(t) || t.indexOf('Длительность серии ≈') === 0;
                        }).remove();
                        // Также удаляем такие бейджи из genreElements (если вдруг попали)
                        genreElements = genreElements.filter(function(el) {
                            var t = $(el).text().trim();
                            return !/^\d{2}:\d{2}$/.test(t);
                        });
                        // Формируем строку длительности
                        var mins = movie.runtime;
                        var hours = Math.floor(mins / 60);
                        var min = mins % 60;
                        var text = 'Длительность фильма: ';
                        if (hours > 0) text += hours + ' ' + plural(hours, 'час', 'часа', 'часов');
                        if (min > 0) text += (hours > 0 ? ' ' : '') + min + ' мин.';
                        var $badge = $('<span>').text(text).css({
                            'border-radius': '0.3em',
                            'border': '0px',
                            'font-size': '1.3em',
                            'padding': '0.2em 0.6em',
                            'display': 'inline-block',
                            'white-space': 'nowrap',
                            'line-height': '1.2em',
                            'background-color': colors.duration.bg,
                            'color': colors.duration.text,
                            'margin': '0.2em',
                            'margin-right': '0.4em',
                            'margin-bottom': '0.2em'
                        });
                        secondRow.empty().append($badge);
                    } else if (isTvShow) {
                        var avgDuration = calculateAverageEpisodeDuration(movie);
                        if (avgDuration > 0) {
                            var durationText = 'Длительность серии ≈ ' + formatDurationMinutes(avgDuration);
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                            secondRow.prepend($avgDurationBadge);
                        }
                    }
                    // --- КОНЕЦ ДОПОЛНИТЕЛЬНОЙ ОБРАБОТКИ ДЛЯ ФИЛЬМОВ ---
                    if (durationElement) firstRow.append(durationElement);
                    seasonElements.forEach(function(el) { firstRow.append(el); });
                    episodeElements.forEach(function(el) { firstRow.append(el); });
                    nextEpisodeElements.forEach(function(el) { firstRow.append(el); });
                    genreElements.forEach(function(el) { thirdRow.append(el); });
                    newContainer.append(firstRow).append(secondRow).append(thirdRow);
                    details.append(newContainer);
                }, 100);
            }
        });
    }

    // === ЦВЕТНЫЕ РЕЙТИНГИ, СТАТУСЫ И ВОЗРАСТНЫЕ ОГРАНИЧЕНИЯ ===
    function updateVoteColors() {
        if (!settings.colored_ratings) return;
        function applyColorByRating(element) {
            var voteText = $(element).text().trim();
            var match = voteText.match(/(\d+(\.\d+)?)/);
            if (!match) return;
            var vote = parseFloat(match[0]);
            if (vote >= 0 && vote <= 3) {
                $(element).css('color', 'red');
            } else if (vote > 3 && vote < 6) {
                $(element).css('color', 'orange');
            } else if (vote >= 6 && vote < 8) {
                $(element).css('color', 'cornflowerblue');
            } else if (vote >= 8 && vote <= 10) {
                $(element).css('color', 'lawngreen');
            }
        }
        $(".card__vote").each(function() { applyColorByRating(this); });
        $(".full-start__rate, .full-start-new__rate").each(function() { applyColorByRating(this); });
        $(".info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function() { applyColorByRating(this); });
    }
    function setupVoteColorsObserver() {
        if (!settings.colored_ratings) return;
        setTimeout(updateVoteColors, 500);
        var observer = new MutationObserver(function() { setTimeout(updateVoteColors, 100); });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    function setupVoteColorsForDetailPage() {
        if (!settings.colored_ratings) return;
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(updateVoteColors, 100);
            }
        });
    }
    function colorizeSeriesStatus() {
        function applyStatusColor(statusElement) {
            var statusText = $(statusElement).text().trim();
            var statusColors = {
                'completed': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'canceled': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'ongoing': { bg: 'rgba(243, 156, 18, 0.8)', text: 'black' },
                'production': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'planned': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'pilot': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
                'released': { bg: 'rgba(26, 188, 156, 0.8)', text: 'white' },
                'rumored': { bg: 'rgba(149, 165, 166, 0.8)', text: 'white' },
                'post': { bg: 'rgba(0, 188, 212, 0.8)', text: 'white' }
            };
            var bgColor = '', textColor = '';
            if (statusText.includes('Заверш') || statusText.includes('Ended')) { bgColor = statusColors.completed.bg; textColor = statusColors.completed.text; }
            else if (statusText.includes('Отмен') || statusText.includes('Canceled')) { bgColor = statusColors.canceled.bg; textColor = statusColors.canceled.text; }
            else if (statusText.includes('Онгоинг') || statusText.includes('Выход') || statusText.includes('В процессе') || statusText.includes('Return')) { bgColor = statusColors.ongoing.bg; textColor = statusColors.ongoing.text; }
            else if (statusText.includes('производстве') || statusText.includes('Production')) { bgColor = statusColors.production.bg; textColor = statusColors.production.text; }
            else if (statusText.includes('Запланировано') || statusText.includes('Planned')) { bgColor = statusColors.planned.bg; textColor = statusColors.planned.text; }
            else if (statusText.includes('Пилотный') || statusText.includes('Pilot')) { bgColor = statusColors.pilot.bg; textColor = statusColors.pilot.text; }
            else if (statusText.includes('Выпущенный') || statusText.includes('Released')) { bgColor = statusColors.released.bg; textColor = statusColors.released.text; }
            else if (statusText.includes('слухам') || statusText.includes('Rumored')) { bgColor = statusColors.rumored.bg; textColor = statusColors.rumored.text; }
            else if (statusText.includes('Скоро') || statusText.includes('Post')) { bgColor = statusColors.post.bg; textColor = statusColors.post.text; }
            if (bgColor) {
                $(statusElement).css({
                    'background-color': bgColor,
                    'color': textColor,
                    'border-radius': '0.3em',
                    'border': '0px',
                    'font-size': '1.3em',
                    'display': 'inline-block'
                });
            }
        }
        $('.full-start__status').each(function() { applyStatusColor(this); });
        var statusObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__status').each(function() { applyStatusColor(this); });
                        if ($(node).hasClass('full-start__status')) { applyStatusColor(node); }
                    }
                }
            });
        });
        statusObserver.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__status').each(function() { applyStatusColor(this); });
                }, 100);
            }
        });
    }
    function colorizeAgeRating() {
        function applyAgeRatingColor(ratingElement) {
            var ratingText = $(ratingElement).text().trim();
            var ageRatings = {
                kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
                children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
                teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
                almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
                adult: ['NC-17', '18+', '18', 'X']
            };
            var colors = {
                kids: { bg: '#2ecc71', text: 'white' },
                children: { bg: '#3498db', text: 'white' },
                teens: { bg: '#f1c40f', text: 'black' },
                almostAdult: { bg: '#e67e22', text: 'white' },
                adult: { bg: '#e74c3c', text: 'white' }
            };
            var group = null;
            for (var groupKey in ageRatings) {
                if (ageRatings[groupKey].includes(ratingText)) { group = groupKey; break; }
                for (var i = 0; i < ageRatings[groupKey].length; i++) {
                    if (ratingText.includes(ageRatings[groupKey][i])) { group = groupKey; break; }
                }
                if (group) break;
            }
            if (group) {
                $(ratingElement).css({
                    'background-color': colors[group].bg,
                    'color': colors[group].text,
                    'border-radius': '0.3em',
                    'font-size': '1.3em',
                    'border': '0px'
                });
            }
        }
        $('.full-start__pg').each(function() { applyAgeRatingColor(this); });
        var ratingObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                        if ($(node).hasClass('full-start__pg')) { applyAgeRatingColor(node); }
                    }
                }
            });
        });
        ratingObserver.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                }, 100);
            }
        });
    }
    // === КОНЕЦ ЦВЕТНЫХ ФУНКЦИЙ ===

    // Функция для генерации цвета из строки
    function stringToColor(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
    
    // Функция для извлечения иконки из элемента
    function extractProviderIcon(btn) {
        var iconHtml = '';
        
        // Проверяем SVG
        if (btn.find('svg').length) {
            var icon = btn.find('svg').clone();
            // Сохраняем оригинальный viewBox, если он есть
            var originalViewBox = icon.attr('viewBox');
            // Удаляем все атрибуты, кроме xmlns и viewBox
            icon.removeAttr('width height style x y class version xml:space');
            if (!originalViewBox) {
                // Устанавливаем viewBox только если его нет
                icon.attr('viewBox', '0 0 512 512');
            }
            // Устанавливаем фиксированный размер для отображения
            icon.attr({
                width: 32,
                height: 32,
                style: 'width:32px;height:32px;display:block;'
            });
            
            // Проверяем, чтобы внутри были path элементы
            if (icon.find('path').length === 0 && icon.find('g').length === 0) {
                // Если внутри нет path, возможно это просто контейнер, достаём весь HTML
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    btn.find('svg').parent().html() + '</div>';
            } else {
                iconHtml = icon[0].outerHTML;
            }
        }
        // Проверяем изображения
        else if (btn.find('img').length) {
            var imgSrc = btn.find('img').attr('src');
            iconHtml = '<img src="' + imgSrc + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
        }
        // Проверяем элементы с классом ico
        else if (btn.find('.ico').length) {
            var icoElement = btn.find('.ico').clone();
            // Если в ico содержится svg, сохраняем его целиком
            if (icoElement.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    icoElement.html() + '</div>';
            } else {
                icoElement.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = icoElement[0].outerHTML;
            }
        }
        // Проверяем элементы с классом button__ico
        else if (btn.find('.button__ico').length) {
            var buttonIco = btn.find('.button__ico').clone();
            // Если в button__ico содержится svg, сохраняем его целиком
            if (buttonIco.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    buttonIco.html() + '</div>';
            } else {
                buttonIco.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = buttonIco[0].outerHTML;
            }
        }
        // Проверяем элементы с фоновым изображением
        else {
            var elemWithBg = btn.find('[style*="background-image"]');
            if (elemWithBg.length) {
                var bgStyle = elemWithBg.css('background-image');
                if (bgStyle && bgStyle.indexOf('url') !== -1) {
                    iconHtml = '<div style="width:32px;height:32px;display:block;background-image:' + bgStyle + ';background-size:contain;background-position:center;background-repeat:no-repeat;"></div>';
                }
            }
            // Ищем другие возможные иконки
            else {
                var possibleIcons = btn.find('.icon, .logo, [class*="icon"], [class*="logo"]').first();
                if (possibleIcons.length) {
                    // Если в иконке есть svg, сохраняем весь внутренний HTML
                    if (possibleIcons.find('svg').length) {
                        iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                            possibleIcons.html() + '</div>';
                    } else {
                        var possibleIcon = possibleIcons.clone();
                        possibleIcon.attr('style', 'width:32px;height:32px;display:block;');
                        iconHtml = possibleIcon[0].outerHTML;
                    }
                }
                // Проверяем data-атрибуты
                else {
                    var dataIcon = btn.attr('data-icon') || btn.attr('data-logo');
                    if (dataIcon) {
                        if (dataIcon && (dataIcon.indexOf('<svg') === 0 || dataIcon.indexOf('<img') === 0)) {
                            iconHtml = dataIcon;
                        } else if (dataIcon && (dataIcon.indexOf('http') === 0 || dataIcon.indexOf('/') === 0)) {
                            iconHtml = '<img src="' + dataIcon + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
                        }
                    }
                    // Если ничего не найдено, используем первую букву
                    else {
                        var providerName = btn.text().trim();
                        if (providerName) {
                            var firstLetter = providerName.charAt(0).toUpperCase();
                            var backgroundColor = stringToColor(providerName);
                            iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background-color:' + backgroundColor + ';color:white;border-radius:50%;font-weight:bold;font-size:18px;">' + firstLetter + '</div>';
                        }
                    }
                }
            }
        }
        return iconHtml;
    }

    // Функция для создания меню кнопки "Ещё"
    function createMoreButtonMenu(otherButtons) {
        return function() {
            var items = [];
            otherButtons.forEach(function(btn) {
                var btnText = btn.text().trim();
                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                var iconHtml = extractProviderIcon(btn);
                
                items.push({
                    title: btnText,
                    icon: iconHtml,
                    subtitle: subtitle,
                    btn: btn
                });
            });
            
            Lampa.Select.show({
                title: 'Дополнительные опции',
                items: items,
                onSelect: function(selected) {
                    if (selected && selected.btn) {
                        selected.btn.trigger('hover:enter');
                    }
                },
                onBack: function() {}
            });
            
            setTimeout(function() {
                $('.selectbox-item').each(function(i) {
                    if (items[i]) {
                        var iconHtml = '';
                        if (items[i].icon) {
                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                        }
                        
                        $(this).css({
                            'position': 'relative',
                            'padding-left': items[i].icon ? '56px' : '16px'
                        }).prepend(iconHtml);
                        
                        // Исправим размер иконок для лучшей видимости
                        $(this).find('.menu__ico svg').css({
                            'width': '100%',
                            'height': '100%',
                            'max-width': '32px',
                            'max-height': '32px'
                        });
                        
                        // Подгоняем размер SVG внутри контейнера
                        $(this).find('.menu__ico svg > *').each(function() {
                            // Если viewBox не задан или некорректен, устанавливаем его
                            var svg = $(this).closest('svg');
                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                // Пробуем определить правильный viewBox по содержимому
                                var paths = svg.find('path');
                                if (paths.length) {
                                    svg.attr('viewBox', '0 0 512 512');
                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                }
                            }
                        });
                        
                        // Добавим анимацию при наведении
                        $(this).on('hover:focus hover:hover', function(){
                            $(this).find('.menu__ico').css({
                                'transform': 'translateY(-50%) scale(1.1)',
                                'transition': 'all 0.3s'
                            });
                        }).on('hover:blur', function(){
                            $(this).find('.menu__ico').css({
                                'transform': 'translateY(-50%)',
                                'transition': 'all 0.3s'
                            });
                        });
                    }
                });
            }, 50);
        };
    }

    // === ОТОБРАЖЕНИЕ ВСЕХ КНОПОК ===
    function showAllButtons() {
        // УБИРАЕМ глобальное добавление стиля normalize_svg_icons_style
        // (Больше не добавляем document.head.appendChild(normalizeIconsStyle))
        // ... остальной код ...

        // --- кастомные кнопки для режима main2 ---
        if (!document.getElementById('interface_mod_new_buttons_style')) {
            var buttonStyle = document.createElement('style');
            buttonStyle.id = 'interface_mod_new_buttons_style';
            buttonStyle.innerHTML = `
                .full-start-new__buttons, .full-start__buttons {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 0.7em !important;
                }
                    .custom-online-btn { background-color: #2f2f2fd1; box-shadow: 0 0 13px #00b2ff; margin: 0.6em; margin-right: 1.1em; }
                    .custom-torrent-btn { background-color: #2f2f2fd1; box-shadow: 0 0 13px #00ff40; }
                    .main2-more-btn { background-color: #2f2f2fd1; margin-left: 1.4em; font-weight: bold; box-shadow: 0 0 13px #e67e22; }
                
                @media (max-width: 600px) {
                    .custom-online-btn { background-color: #2f2f2fd1; box-shadow: 0 0 8px #00b2ff; margin: 0.8em; }
                    .custom-torrent-btn { background-color: #2f2f2fd1; box-shadow: 0 0 8px #00ff40; }
                    .main2-more-btn { background-color: #2f2f2fd1; margin-left: 1.4em; font-weight: bold; box-shadow: 0 0 8px #e67e22; }

                    
                     .full-start__button.focus,
                     .custom-online-btn.focus,
                     .custom-torrent-btn.focus,
                     .main2-more-btn.focus {
                        background: none;
                        background-color: #2f2f2fd1;
                        color: #fff;
                        filter: none;
                    }
                }
            `;
            document.head.appendChild(buttonStyle);
        }

        var originFullCard;
        if (Lampa.FullCard) {
            originFullCard = Lampa.FullCard.build;
            Lampa.FullCard.build = function(data) {
                var card = originFullCard(data);
                card.organizeButtons = function() {
                    var activity = card.activity;
                    if (!activity) return;
                    var element = activity.render();
                    if (!element) return;
                    var targetContainer = element.find('.full-start-new__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.full-start__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.buttons-container');
                    if (!targetContainer.length) return;

                    var allButtons = [];
                    var buttonSelectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button',
                        '.full-start-new__buttons .button',
                        '.full-start__buttons .button'
                    ];
                    buttonSelectors.forEach(function(selector) {
                        element.find(selector).each(function() {
                            allButtons.push(this);
                        });
                    });
                    if (allButtons.length === 0) return;

                    var categories = {
                        online: [],
                        torrent: [],
                        trailer: [],
                        other: []
                    };
                    var addedButtonTexts = {};
                    $(allButtons).each(function() {
                        var button = this;
                        var buttonText = $(button).text().trim();
                        var className = button.className || '';
                        if (!buttonText || addedButtonTexts[buttonText]) return;
                        addedButtonTexts[buttonText] = true;
                        if (className.includes('online')) {
                            categories.online.push(button);
                        } else if (className.includes('torrent')) {
                            categories.torrent.push(button);
                        } else if (className.includes('trailer')) {
                            categories.trailer.push(button);
                        } else {
                            categories.other.push(button);
                        }
                    });
                    var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                    var needToggle = Lampa.Controller.enabled().name === 'full_start';
                    if (needToggle) Lampa.Controller.toggle('settings_component');
                    var originalElements = targetContainer.children().detach();
                    targetContainer.css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.7em'
                    });
                    buttonSortOrder.forEach(function(category) {
                        categories[category].forEach(function(button) {
                            targetContainer.append(button);
                        });
                    });
                    // --- кастомные кнопки для режима main2 ---
                    if (settings.buttons_style_mode === 'main2') {
                        // Сохраняем все оригинальные онлайн-кнопки до их скрытия/перемещения (только уникальные)
                        var allOnlineButtons = [];
                        var seenOnlineTexts = {};
                        $(allButtons).each(function() {
                            var btn = $(this);
                            if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                                var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                                if (!seenOnlineTexts[key]) {
                                    allOnlineButtons.push(btn);
                                    seenOnlineTexts[key] = true;
                                }
                            }
                        });
                        allButtons.forEach(function(btn) { $(btn).hide(); });
                        var origOnline = targetContainer.find('.full-start__button.view--online');
                        var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                        origOnline.hide();
                        origTorrent.hide();
                        targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();
                        // Кнопка Онлайн (большая) - БЕЗ инлайн-стилей
                        var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                            .text('Онлайн')
                            .attr('data-subtitle', 'Lampac v1.4.8')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); });
                        // Меню выбора онлайн-провайдера
                        var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');
                        function showOnlineMenu() {
                            if (allOnlineButtons.length === 0) {
                                Lampa.Noty.show('Нет онлайн-провайдера');
                                return;
                            }
                            if (allOnlineButtons.length === 1) {
                                allOnlineButtons[0].trigger('hover:enter');
                                return;
                            }
                            var items = [];
                            for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                var btn = allOnlineButtons[idx];
                                var iconHtml = extractProviderIcon(btn);
                                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                items.push({
                                    title: btn.text().trim(),
                                    icon: iconHtml,
                                    subtitle: subtitle,
                                    idx: idx
                                });
                            }
                            Lampa.Select.show({
                                title: 'Выберите онлайн-провайдера',
                                items: items,
                                onSelect: function(selected) {
                                    if (selected && typeof selected.idx !== 'undefined') {
                                        allOnlineButtons[selected.idx].trigger('hover:enter');
                                    }
                                },
                                onBack: function() {}
                            });
                            setTimeout(function() {
                                $('.selectbox-item').each(function(i) {
                                    if (items[i]) {
                                        var iconHtml = '';
                                        if (items[i].icon) {
                                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                        }
                                        
                                        $(this).css({
                                            'position': 'relative',
                                            'padding-left': items[i].icon ? '56px' : '16px'
                                        }).prepend(iconHtml);
                                        
                                        // Исправим размер иконок для лучшей видимости
                                        $(this).find('.menu__ico svg').css({
                                            'width': '100%',
                                            'height': '100%',
                                            'max-width': '32px',
                                            'max-height': '32px'
                                        });
                                        
                                        // Подгоняем размер SVG внутри контейнера
                                        $(this).find('.menu__ico svg > *').each(function() {
                                            // Если viewBox не задан или некорректен, устанавливаем его
                                            var svg = $(this).closest('svg');
                                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                // Пробуем определить правильный viewBox по содержимому
                                                var paths = svg.find('path');
                                                if (paths.length) {
                                                    svg.attr('viewBox', '0 0 512 512');
                                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                }
                                            }
                                        });
                                        
                                        // Добавим анимацию при наведении
                                        $(this).on('hover:focus hover:hover', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%) scale(1.1)',
                                                'transition': 'all 0.3s'
                                            });
                                        }).on('hover:blur', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%)',
                                                'transition': 'all 0.3s'
                                            });
                                        });
                                    }
                                });
                            }, 50);
                        }
                        onlineBtn.on('hover:enter', function() {
                            if (allOnlineButtons.length === 0) {
                                Lampa.Noty.show('Нет онлайн-провайдера');
                                return;
                            }
                            if (allOnlineButtons.length === 1) {
                                allOnlineButtons[0].trigger('hover:enter');
                                return;
                            }
                            var items = [];
                            for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                var btn = allOnlineButtons[idx];
                                var iconHtml = extractProviderIcon(btn);
                                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                items.push({
                                    title: btn.text().trim(),
                                    icon: iconHtml,
                                    subtitle: subtitle,
                                    idx: idx
                                });
                            }
                            Lampa.Select.show({
                                title: 'Выберите онлайн-провайдера',
                                items: items,
                                onSelect: function(selected) {
                                    if (selected && typeof selected.idx !== 'undefined') {
                                        allOnlineButtons[selected.idx].trigger('hover:enter');
                                    }
                                },
                                onBack: function() {}
                            });
                            setTimeout(function() {
                                $('.selectbox-item').each(function(i) {
                                    if (items[i]) {
                                        var iconHtml = '';
                                        if (items[i].icon) {
                                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                        }
                                        
                                        $(this).css({
                                            'position': 'relative',
                                            'padding-left': items[i].icon ? '56px' : '16px'
                                        }).prepend(iconHtml);
                                        
                                        // Исправим размер иконок для лучшей видимости
                                        $(this).find('.menu__ico svg').css({
                                            'width': '100%',
                                            'height': '100%',
                                            'max-width': '32px',
                                            'max-height': '32px'
                                        });
                                        
                                        // Подгоняем размер SVG внутри контейнера
                                        $(this).find('.menu__ico svg > *').each(function() {
                                            // Если viewBox не задан или некорректен, устанавливаем его
                                            var svg = $(this).closest('svg');
                                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                // Пробуем определить правильный viewBox по содержимому
                                                var paths = svg.find('path');
                                                if (paths.length) {
                                                    svg.attr('viewBox', '0 0 512 512');
                                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                }
                                            }
                                        });
                                        
                                        // Добавим анимацию при наведении
                                        $(this).on('hover:focus hover:hover', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%) scale(1.1)',
                                                'transition': 'all 0.3s'
                                            });
                                        }).on('hover:blur', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%)',
                                                'transition': 'all 0.3s'
                                            });
                                        });
                                    }
                                });
                            }, 50);
                        });
                        // Навигация по меню с пульта
                        onlineMenu.on('keydown', function(e) {
                            if (e.key === 'Back' || e.key === 'Escape') {
                                onlineMenu.hide();
                                onlineBtn.addClass('focus');
                            }
                        });
                        onlineMenu.on('focusout', function() {
                            setTimeout(function() {
                                if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                            }, 100);
                        });
                        // Кнопка Торрент (большая) - БЕЗ инлайн-стилей
                        var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                            .text('Торрент')
                            .attr('data-subtitle', 'Торрент')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); })
                            .on('hover:enter', function() {
                                if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                                else Lampa.Noty.show('Нет торрент-провайдера');
                            });
                        // Собираем остальные кнопки
                        var otherButtons = [];
                        // Сохраняем тексты онлайн-кнопок, чтобы избежать дублирования
                        var onlineButtonTexts = {};
                        allOnlineButtons.forEach(function(btn) {
                            var text = $(btn).text().trim();
                            if (text) {
                                onlineButtonTexts[text] = true;
                            }
                        });
                        
                        // Список элементов, которые нужно скрыть из меню "Ещё"
                        var hideButtonTexts = {
                            'Смотреть': true,
                            'Подписаться': true
                        };
                        
                        $(allButtons).each(function() {
                            var btn = $(this);
                            var btnText = btn.text().trim();
                            // Проверяем, что кнопка не является онлайн или торрент, не дублирует онлайн-кнопки и не в списке скрытых
                            if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                                !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                                otherButtons.push(btn.clone(true, true).removeClass('focus'));
                            }
                        });
                        // Кнопка "Ещё" (большая) - БЕЗ инлайн-стилей
                        var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); });
                        
                        // Открытие меню по нажатию кнопки "Ещё"
                        moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));
                        
                        // Вставляем элементы
                        targetContainer.prepend(moreBtn);
                        targetContainer.prepend(torrentBtn);
                        targetContainer.prepend(onlineBtn);
                        targetContainer.prepend(onlineMenu);
                        // Сброс инлайн-стилей для кастомных кнопок (на всякий случай)
                        setTimeout(function() {
                            targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                                this.removeAttribute('style');
                            });
                        }, 10);
                        // Контейнер как controller
                        targetContainer.addClass('controller');
                        Lampa.Controller.enable('full_start');
                        setTimeout(function() {
                            onlineBtn.addClass('focus');
                        }, 100);
                    }
                    // --- конец блока кастомных кнопок main2 ---
                    if (needToggle) {
                        setTimeout(function() {
                            Lampa.Controller.toggle('full_start');
                        }, 100);
                    }
                };
                card.onCreate = function() {
                    if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
                        setTimeout(function() {
                            card.organizeButtons();
                        }, 300);
                    }
                };
                return card;
            };
        }
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.object && e.object.activity) {
                if ((settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') && !Lampa.FullCard) {
                    setTimeout(function() {
                        var fullContainer = e.object.activity.render();
                        var targetContainer = fullContainer.find('.full-start-new__buttons');
                        if (!targetContainer.length) targetContainer = fullContainer.find('.full-start__buttons');
                        if (!targetContainer.length) targetContainer = fullContainer.find('.buttons-container');
                        if (!targetContainer.length) return;
                        targetContainer.css({
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.7em'
                        });
                        var allButtons = [];
                        var buttonSelectors = [
                            '.buttons--container .full-start__button',
                            '.full-start-new__buttons .full-start__button',
                            '.full-start__buttons .full-start__button',
                            '.buttons-container .button',
                            '.full-start-new__buttons .button',
                            '.full-start__buttons .button'
                        ];
                        buttonSelectors.forEach(function(selector) {
                            fullContainer.find(selector).each(function() {
                                allButtons.push(this);
                            });
                        });
                        if (allButtons.length === 0) return;
                        var categories = {
                            online: [],
                            torrent: [],
                            trailer: [],
                            other: []
                        };
                        var addedButtonTexts = {};
                        $(allButtons).each(function() {
                            var button = this;
                            var buttonText = $(button).text().trim();
                            var className = button.className || '';
                            if (!buttonText || addedButtonTexts[buttonText]) return;
                            addedButtonTexts[buttonText] = true;
                            if (className.includes('online')) {
                                categories.online.push(button);
                            } else if (className.includes('torrent')) {
                                categories.torrent.push(button);
                            } else if (className.includes('trailer')) {
                                categories.trailer.push(button);
                            } else {
                                categories.other.push(button);
                            }
                        });
                        var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                        var needToggle = Lampa.Controller.enabled().name === 'full_start';
                        if (needToggle) Lampa.Controller.toggle('settings_component');
                        var originalElements = targetContainer.children().detach();
                        buttonSortOrder.forEach(function(category) {
                            categories[category].forEach(function(button) {
                                targetContainer.append(button);
                            });
                        });
                        // --- кастомные кнопки для режима main2 ---
                        if (settings.buttons_style_mode === 'main2') {
                            // Сохраняем все оригинальные онлайн-кнопки до их скрытия/перемещения (только уникальные)
                            var allOnlineButtons = [];
                            var seenOnlineTexts = {};
                            $(allButtons).each(function() {
                                var btn = $(this);
                                if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                                    var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                                    if (!seenOnlineTexts[key]) {
                                        allOnlineButtons.push(btn);
                                        seenOnlineTexts[key] = true;
                                    }
                                }
                            });
                            allButtons.forEach(function(btn) { $(btn).hide(); });
                            var origOnline = targetContainer.find('.full-start__button.view--online');
                            var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                            origOnline.hide();
                            origTorrent.hide();
                            targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();
                            // Кнопка Онлайн (большая) - БЕЗ инлайн-стилей
                            var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                                .text('Онлайн')
                                .attr('data-subtitle', 'Lampac v1.4.8')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); });
                            // Меню выбора онлайн-провайдера
                            var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');
                            function showOnlineMenu() {
                                if (allOnlineButtons.length === 0) {
                                    Lampa.Noty.show('Нет онлайн-провайдера');
                                    return;
                                }
                                if (allOnlineButtons.length === 1) {
                                    allOnlineButtons[0].trigger('hover:enter');
                                    return;
                                }
                                var items = [];
                                for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                    var btn = allOnlineButtons[idx];
                                    var iconHtml = extractProviderIcon(btn);
                                    var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                    items.push({
                                        title: btn.text().trim(),
                                        icon: iconHtml,
                                        subtitle: subtitle,
                                        idx: idx
                                    });
                                }
                                Lampa.Select.show({
                                    title: 'Выберите онлайн-провайдера',
                                    items: items,
                                    onSelect: function(selected) {
                                        if (selected && typeof selected.idx !== 'undefined') {
                                            allOnlineButtons[selected.idx].trigger('hover:enter');
                                        }
                                    },
                                    onBack: function() {}
                                });
                                setTimeout(function() {
                                    $('.selectbox-item').each(function(i) {
                                        if (items[i]) {
                                            var iconHtml = '';
                                            if (items[i].icon) {
                                                iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                            }
                                            
                                            $(this).css({
                                                'position': 'relative',
                                                'padding-left': items[i].icon ? '56px' : '16px'
                                            }).prepend(iconHtml);
                                            
                                            // Исправим размер иконок для лучшей видимости
                                            $(this).find('.menu__ico svg').css({
                                                'width': '100%',
                                                'height': '100%',
                                                'max-width': '32px',
                                                'max-height': '32px'
                                            });
                                            
                                            // Подгоняем размер SVG внутри контейнера
                                            $(this).find('.menu__ico svg > *').each(function() {
                                                // Если viewBox не задан или некорректен, устанавливаем его
                                                var svg = $(this).closest('svg');
                                                if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                    // Пробуем определить правильный viewBox по содержимому
                                                    var paths = svg.find('path');
                                                    if (paths.length) {
                                                        svg.attr('viewBox', '0 0 512 512');
                                                        svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                    }
                                                }
                                            });
                                            
                                            // Добавим анимацию при наведении
                                            $(this).on('hover:focus hover:hover', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%) scale(1.1)',
                                                    'transition': 'all 0.3s'
                                                });
                                            }).on('hover:blur', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%)',
                                                    'transition': 'all 0.3s'
                                                });
                                            });
                                        }
                                    });
                                }, 50);
                            }
                            onlineBtn.on('hover:enter', function() {
                                if (allOnlineButtons.length === 0) {
                                    Lampa.Noty.show('Нет онлайн-провайдера');
                                    return;
                                }
                                if (allOnlineButtons.length === 1) {
                                    allOnlineButtons[0].trigger('hover:enter');
                                    return;
                                }
                                var items = [];
                                for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                    var btn = allOnlineButtons[idx];
                                    var iconHtml = extractProviderIcon(btn);
                                    var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                    items.push({
                                        title: btn.text().trim(),
                                        icon: iconHtml,
                                        subtitle: subtitle,
                                        idx: idx
                                });
                                }
                                Lampa.Select.show({
                                    title: 'Выберите онлайн-провайдера',
                                    items: items,
                                    onSelect: function(selected) {
                                        if (selected && typeof selected.idx !== 'undefined') {
                                            allOnlineButtons[selected.idx].trigger('hover:enter');
                                        }
                                    },
                                    onBack: function() {}
                                });
                                setTimeout(function() {
                                    $('.selectbox-item').each(function(i) {
                                        if (items[i]) {
                                            var iconHtml = '';
                                            if (items[i].icon) {
                                                iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                            }
                                            
                                            $(this).css({
                                                'position': 'relative',
                                                'padding-left': items[i].icon ? '56px' : '16px'
                                            }).prepend(iconHtml);
                                            
                                            // Исправим размер иконок для лучшей видимости
                                            $(this).find('.menu__ico svg').css({
                                                'width': '100%',
                                                'height': '100%',
                                                'max-width': '32px',
                                                'max-height': '32px'
                                            });
                                            
                                            // Подгоняем размер SVG внутри контейнера
                                            $(this).find('.menu__ico svg > *').each(function() {
                                                // Если viewBox не задан или некорректен, устанавливаем его
                                                var svg = $(this).closest('svg');
                                                if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                    // Пробуем определить правильный viewBox по содержимому
                                                    var paths = svg.find('path');
                                                    if (paths.length) {
                                                        svg.attr('viewBox', '0 0 512 512');
                                                        svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                    }
                                                }
                                            });
                                            
                                            // Добавим анимацию при наведении
                                            $(this).on('hover:focus hover:hover', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%) scale(1.1)',
                                                    'transition': 'all 0.3s'
                                                });
                                            }).on('hover:blur', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%)',
                                                    'transition': 'all 0.3s'
                                                });
                                            });
                                        }
                                    });
                                }, 50);
                            });
                            // Навигация по меню с пульта
                            onlineMenu.on('keydown', function(e) {
                                if (e.key === 'Back' || e.key === 'Escape') {
                                    onlineMenu.hide();
                                    onlineBtn.addClass('focus');
                                }
                            });
                            onlineMenu.on('focusout', function() {
                                setTimeout(function() {
                                    if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                                }, 100);
                            });
                            // Кнопка Торрент (большая) - БЕЗ инлайн-стилей
                            var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                                .text('Торрент')
                                .attr('data-subtitle', 'Торрент')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); })
                                .on('hover:enter', function() {
                                    if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                                    else Lampa.Noty.show('Нет торрент-провайдера');
                                });
                            // Собираем остальные кнопки
                            var otherButtons = [];
                            // Сохраняем тексты онлайн-кнопок, чтобы избежать дублирования
                            var onlineButtonTexts = {};
                            allOnlineButtons.forEach(function(btn) {
                                var text = $(btn).text().trim();
                                if (text) {
                                    onlineButtonTexts[text] = true;
                                }
                            });
                            
                            // Список элементов, которые нужно скрыть из меню "Ещё"
                            var hideButtonTexts = {
                                'Смотреть': true,
                                'Подписаться': true
                            };
                            
                            $(allButtons).each(function() {
                                var btn = $(this);
                                var btnText = btn.text().trim();
                                // Проверяем, что кнопка не является онлайн или торрент, не дублирует онлайн-кнопки и не в списке скрытых
                                if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                                    !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                                    otherButtons.push(btn.clone(true, true).removeClass('focus'));
                                }
                            });
                            // Кнопка "Ещё" (большая) - БЕЗ инлайн-стилей
                            var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); });
                            
                            // Открытие меню по нажатию кнопки "Ещё"
                            moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));
                            
                            // Вставляем элементы
                            targetContainer.prepend(moreBtn);
                            targetContainer.prepend(torrentBtn);
                            targetContainer.prepend(onlineBtn);
                            targetContainer.prepend(onlineMenu);
                            // Сброс инлайн-стилей для кастомных кнопок (на всякий случай)
                            setTimeout(function() {
                                targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                                    this.removeAttribute('style');
                                });
                            }, 10);
                            // Контейнер как controller
                            targetContainer.addClass('controller');
                            Lampa.Controller.enable('full_start');
                            setTimeout(function() {
                                onlineBtn.addClass('focus');
                            }, 100);
                        }
                        // --- конец блока кастомных кнопок main2 ---
                        if (needToggle) {
                            setTimeout(function() {
                                Lampa.Controller.toggle('full_start');
                            }, 100);
                        }
                    }, 300);
                }
            }
        });
        var buttonObserver = new MutationObserver(function(mutations) {
            if (settings.buttons_style_mode !== 'all' && settings.buttons_style_mode !== 'main2') return;
            var needReorganize = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' &&
                    (mutation.target.classList.contains('full-start-new__buttons') ||
                        mutation.target.classList.contains('full-start__buttons') ||
                        mutation.target.classList.contains('buttons-container'))) {
                    needReorganize = true;
                }
            });
            if (needReorganize) {
                setTimeout(function() {
                    if (Lampa.FullCard && Lampa.Activity.active() && Lampa.Activity.active().activity.card) {
                        if (typeof Lampa.Activity.active().activity.card.organizeButtons === 'function') {
                            Lampa.Activity.active().activity.card.organizeButtons();
                        }
                    }
                }, 100);
            }
        });
        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Функция для применения тем
    function applyTheme(theme) {
        // Удаляем предыдущие стили темы
        const oldStyle = document.querySelector('#interface_mod_theme');
        if (oldStyle) oldStyle.remove();

        // Если выбрано "По умолчанию", просто удаляем стили
        if (theme === 'default') {
            // Деактивируем все внешние темы
            document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
                el.disabled = true;
            });
            return;
        }

        // Проверяем, есть ли внешняя тема
        var externalThemeStyle = document.querySelector('#theme-style-' + theme);
        if (externalThemeStyle) {
            // Деактивируем все внешние темы
            document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
                el.disabled = true;
            });
            // Активируем нужную тему
            externalThemeStyle.disabled = false;
            return;
        }

        // Создаем новый стиль для встроенных тем
        const style = document.createElement('style');
        style.id = 'interface_mod_theme';

        // Определяем стили для разных тем
        const themes = {
            neon: `
                body { background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #ff00ff, #00ffff);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                    border: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff00ff;
                    box-shadow: 0 0 20px #00ffff;
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(1.2) saturate(1.3);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(15, 2, 33, 0.95);
                    border: 1px solid rgba(255, 0, 255, 0.1);
                }
            `,
            sunset: `
                body { background: linear-gradient(135deg, #2d1f3d 0%, #614385 50%, #516395 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                    box-shadow: 0 0 15px rgba(255, 110, 127, 0.3);
                    font-weight: bold;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff6e7f;
                    box-shadow: 0 0 15px rgba(255, 110, 127, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.2) contrast(1.1);
                }
            `,
            emerald: `
                body { background: linear-gradient(135deg, #1a2a3a 0%, #2C5364 50%, #203A43 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #43cea2, #185a9d);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(67, 206, 162, 0.3);
                    border-radius: 5px;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 3px solid #43cea2;
                    box-shadow: 0 0 20px rgba(67, 206, 162, 0.4);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #43cea2, #185a9d);
                }
                .full-start__background {
                    opacity: 0.85;
                    filter: brightness(1.1) saturate(1.2);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(26, 42, 58, 0.98);
                    border: 1px solid rgba(67, 206, 162, 0.1);
                }
            `,
            aurora: `
                body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(170, 75, 107, 0.3);
                    transform: scale(1.02);
                    transition: all 0.3s ease;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #aa4b6b;
                    box-shadow: 0 0 25px rgba(170, 75, 107, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #aa4b6b, #3b8d99);
                    transform: scale(1.05);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: contrast(1.1) brightness(1.1);
                }
            `,
            bywolf_mod: `
                body { background: linear-gradient(135deg, #090227 0%, #170b34 50%, #261447 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #fc00ff, #00dbde);
                    color: #fff;
                    box-shadow: 0 0 30px rgba(252, 0, 255, 0.3);
                    animation: cosmic-pulse 2s infinite;
                }
                @keyframes cosmic-pulse {
                    0% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(0, 219, 222, 0.3); }
                    100% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3); }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #fc00ff;
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #fc00ff, #00dbde);
                    animation: cosmic-pulse 2s infinite;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.3) contrast(1.1);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(9, 2, 39, 0.95);
                    border: 1px solid rgba(252, 0, 255, 0.1);
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.1);
                }
            `,
            minimalist: `
                body { background: #121212; color: #e0e0e0; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: #2c2c2c;
                    color: #ffffff;
                    box-shadow: none;
                    border-radius: 3px;
                    border-left: 3px solid #3d3d3d;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 1px solid #3d3d3d;
                    box-shadow: none;
                }
                .head__action.focus, .head__action.hover {
                    background: #2c2c2c;
                }
                .full-start__background {
                    opacity: 0.6;
                    filter: grayscale(0.5) brightness(0.7);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(18, 18, 18, 0.95);
                    border: 1px solid #2c2c2c;
                }
                .selectbox-item + .selectbox-item {
                    border-top: 1px solid #2c2c2c;
                }
                .card__title, .card__vote, .full-start__title, .full-start__rate, .full-start-new__title, .full-start-new__rate {
                    color: #e0e0e0;
                }
            `,
            glow_outline: `
                body { background: #0a0a0a; color: #f5f5f5; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: rgba(40, 40, 40, 0.8);
                    color: #fff;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 1;
                }
                .menu__item.focus::before, .settings-folder.focus::before, .settings-param.focus::before, .selectbox-item.focus::before,
                .custom-online-btn.focus::before, .custom-torrent-btn.focus::before, .main2-more-btn.focus::before, .simple-button.focus::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    z-index: -1;
                    border-radius: 5px;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: glowing 1.5s linear infinite;
                }
                @keyframes glowing {
                    0% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff; }
                    50% { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff; }
                    100% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff; }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: none;
                    box-shadow: 0 0 0 2px #fff, 0 0 10px #0ff, 0 0 15px rgba(0, 255, 255, 0.5);
                    animation: card-glow 1.5s ease-in-out infinite alternate;
                }
                @keyframes card-glow {
                    from { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff; }
                    to { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff; }
                }
                .head__action.focus, .head__action.hover {
                    background: #292929;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.5);
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(0.8) contrast(1.2);
                }
            `,
            menu_lines: `
                body { background: #121212; color: #f5f5f5; }
                .menu__item {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #303030 0%, #404040 100%);
                    color: #fff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    border-left: 3px solid #808080;
                    border-bottom: 1px solid #808080;
                }
                .settings-folder, .settings-param {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                }
                .settings-folder + .settings-folder {
                    border-top: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #808080;
                    box-shadow: 0 0 10px rgba(128, 128, 128, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: #404040;
                    border-left: 3px solid #808080;
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(0.8);
                }
                .menu__list {
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }
                .selectbox-item + .selectbox-item {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
            `,
            dark_emerald: `
                body { background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%); color: #dfdfdf; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #1a594d, #0e3652);
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(26, 89, 77, 0.2);
                    border-radius: 3px;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #1a594d;
                    box-shadow: 0 0 10px rgba(26, 89, 77, 0.3);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #1a594d, #0e3652);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: brightness(0.9) saturate(1.1);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(12, 22, 25, 0.97);
                    border: 1px solid rgba(26, 89, 77, 0.1);
                }
            `
        };

        style.textContent = themes[theme] || '';
        document.head.appendChild(style);
    }

    // Функция для загрузки внешних тем
    function loadExternalThemes(callback) {
        var themeUrl = 'https://bywolf88.github.io/lampa-plugins/theme.json';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', themeUrl, true);
        xhr.timeout = 5000;
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var externalThemes = JSON.parse(xhr.responseText);
                    if (externalThemes && typeof externalThemes === 'object') {
                        callback(null, externalThemes);
                    } else {
                        callback('Invalid themes data format', null);
                    }
                } catch (e) {
                    callback('Error parsing themes data: ' + e.message, null);
                }
            } else {
                callback('HTTP Error: ' + xhr.status, null);
            }
        };
        xhr.onerror = function() {
            callback('Network error', null);
        };
        xhr.ontimeout = function() {
            callback('Request timeout', null);
        };
        xhr.send();
    }

    // Функция для стилизации заголовков подборок
    function stylizeCollectionTitles() {
        if (!settings.stylize_titles) return;
        
        // Удаляем предыдущие стили, если они были
        var oldStyle = document.getElementById('stylized-titles-css');
        if (oldStyle) oldStyle.remove();
        
        // Создаем новый стиль
        var styleElement = document.createElement('style');
        styleElement.id = 'stylized-titles-css';
        
        // CSS для стилизации заголовков
        var css = `
            .items-line__title {
                font-size: 2.4em;
                display: inline-block;
                background: linear-gradient(45deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%);
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient-text 3s ease infinite;
                font-weight: 800;
                text-shadow: 0 1px 3px rgba(0,0,0,0.2);
                position: relative;
                padding: 0 5px;
                z-index: 1;
            }
            
            .items-line__title::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, transparent, #784BA0, transparent);
                z-index: -1;
                transform: scaleX(0);
                transform-origin: bottom right;
                transition: transform 0.5s ease-out;
                animation: line-animation 3s ease infinite;
            }
            
            .items-line__title::after {
                content: '';
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                background: rgba(0,0,0,0.05);
                border-radius: 6px;
                z-index: -2;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .items-line:hover .items-line__title::before {
                transform: scaleX(1);
                transform-origin: bottom left;
            }
            
            .items-line:hover .items-line__title::after {
                opacity: 1;
            }
            
            @keyframes gradient-text {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes line-animation {
                0% { transform: scaleX(0.2); opacity: 0.5; }
                50% { transform: scaleX(1); opacity: 1; }
                100% { transform: scaleX(0.2); opacity: 0.5; }
            }
        `;
        
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        
        // Добавляем наблюдатель за появлением новых заголовков
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // только элементы
                            var titles = node.querySelectorAll('.items-line__title');
                            if (titles.length) {
                                // Можно добавить дополнительные манипуляции с заголовками, если нужно
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Функция для увеличенной информации
    function enhanceDetailedInfo() {
        if (!settings.enhance_detailed_info) return;
        
        // Если уже добавлен стиль, удаляем
        var oldStyle = document.getElementById('enhanced-info-css');
        if (oldStyle) oldStyle.remove();
        
        // Добавляем CSS для увеличенной информации
        var enhancedInfoStyle = document.createElement('style');
        enhancedInfoStyle.id = 'enhanced-info-css';
        enhancedInfoStyle.textContent = `
             // CSS для увеличения информации
             .full-start-new__details {
                 font-size: 1.9em;
             }
             
             .full-start-new__details > * {
                 font-size: 1.9em;
                 margin: 0.1em;
             }

             .full-start-new__buttons, .full-start__buttons {
                 font-size: 1.4em !important;
             }
             
             .full-start__button {
                 font-size: 1.8em;
             }

             .full-start-new__rate-line {
                 font-size: 1.5em;
                 margin-bottom: 1em;
             }

             .full-start-new__poster {
                 display: none;
             }
             
             .full-start-new__left {
                 display: none;
             }
             
             .full-start-new__right {
                 width: 100%;
             }
             
             .full-descr__text {
                 font-size: 1.8em;
                 line-height: 1.4;
                 font-weight: 600;
                 width: 100%;
             }
             
             .info-unified-line {
                 display: flex;
                 flex-wrap: wrap;
                 align-items: center;
                 gap: 0.5em;
                 margin-bottom: 0.5em;
             }
             
             .info-unified-item {
                 border-radius: 0.3em;
                 border: 0px;
                 font-size: 1.3em;
                 padding: 0.2em 0.6em;
                 display: inline-block;
                 white-space: nowrap;
                 line-height: 1.2em;
             }
             
             /* Увеличиваем описание фильма */
             .full-start-new__title {
                 font-size: 2.2em !important;
             }
             
             .full-start-new__tagline {
                 font-size: 1.4em !important;
             }
             
             .full-start-new__desc {
                 font-size: 1.6em !important;
                 margin-top: 1em !important;
             }
             
             /* Увеличиваем шрифт для информационной панели */
             .full-start-new__info {
                 font-size: 1.4em !important;
             }
             
             /* Адаптация под мобильные устройства */
             @media (max-width: 768px) {
                 .full-start-new__title {
                     font-size: 1.8em !important;
                 }
                 
                 .full-start-new__desc {
                     font-size: 1.4em !important;
                 }
                 
                 .full-start-new__details {
                     font-size: 1.5em;
                 }
                 
                 .full-start-new__details > * {
                     font-size: 1.5em;
                     margin: 0.3em;
                 }
                 
                 .full-descr__text {
                     font-size: 1.5em;
                 }
             }
        `;
        document.head.appendChild(enhancedInfoStyle);
        
        // Добавляем обработчик для объединения информации в одну строку
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && settings.enhance_detailed_info) {
                setTimeout(function() {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;
                    
                    // Ищем информацию о сезонах, сериях и длительности
                    var seasonText = '';
                    var episodeText = '';
                    var durationText = '';
                    
                    // Собираем данные из существующих элементов
                    details.find('span').each(function() {
                        var text = $(this).text().trim();
                        
                        if (text.match(/Сезон(?:ы)?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сезон(?:а|ов)?/i)) {
                            seasonText = text;
                        } else if (text.match(/Серии?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сери(?:я|и|й)/i)) {
                            episodeText = text;
                        } else if (text.match(/Длительность/i) || text.indexOf('≈') !== -1) {
                            durationText = text;
                        }
                    });
                    
                    // Если нашли хотя бы два элемента информации, объединяем их
                    if ((seasonText && episodeText) || (seasonText && durationText) || (episodeText && durationText)) {
                        // Создаем новый контейнер для объединенной строки
                        var unifiedLine = $('<div class="info-unified-line"></div>');
                        
                        // Добавляем информацию о сезонах, если есть
                        if (seasonText) {
                            var seasonItem = $('<span class="info-unified-item"></span>')
                                .text(seasonText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(seasonItem);
                        }
                        
                        // Добавляем информацию о сериях, если есть
                        if (episodeText) {
                            var episodeItem = $('<span class="info-unified-item"></span>')
                                .text(episodeText)
                                .css({
                                    'background-color': 'rgba(46, 204, 113, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(episodeItem);
                        }
                        
                        // Добавляем информацию о длительности, если есть
                        if (durationText) {
                            var durationItem = $('<span class="info-unified-item"></span>')
                                .text(durationText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(durationItem);
                        }
                        
                        // Удаляем старые элементы с этой информацией
                        details.find('span').each(function() {
                            var text = $(this).text().trim();
                            if (text === seasonText || text === episodeText || text === durationText) {
                                $(this).remove();
                            }
                        });
                        
                        // Добавляем объединенную строку в начало деталей
                        details.prepend(unifiedLine);
                    }
                }, 300);
            }
        });
    }

    // Инициализация
    function startPlugin() {
        // Загружаем темы и добавляем настройки
        addSettings();
        changeMovieTypeLabels();
        newInfoPanel();
        if (settings.colored_ratings) {
            updateVoteColors();
            setupVoteColorsObserver();
            setupVoteColorsForDetailPage();
        }
        colorizeSeriesStatus();
        colorizeAgeRating();
        if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
            showAllButtons();
        }
        
        // Применяем выбранную тему
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        
        // Применяем стилизацию заголовков, если включено
        if (settings.stylize_titles) {
            stylizeCollectionTitles();
        }
        
        // Применяем увеличенную информацию, если включено
        if (settings.enhance_detailed_info) {
            enhanceDetailedInfo();
        }
    }

    // Запуск после готовности приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }
})();
