(function () {
    'use strict';

    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.4.1', // Обновленная версия
        debug: true, // Включено для диагностики
        settings: {
            enabled: true,
            show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
            info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
            colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
            buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
            theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
            stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
            enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false),
            seasons_info_mode: 'aired',
            show_episodes_on_main: false,
            label_position: 'top-right',
            show_buttons: true,
            colored_elements: true
        }
    };

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
            uk: 'Включає стильне оформлення заголовків підборок з анімацією та спеціальними ефектами'
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
        },
        interface_mod_new_theme_neon_pulse: {
            ru: 'Неоновый пульс',
            en: 'Neon Pulse',
            uk: 'Неоновий пульс'
        },
        interface_mod_new_theme_cyber_green: {
            ru: 'Кибер-зеленый',
            en: 'Cyber Green',
            uk: 'Кібер-зелений'
        },
        interface_mod_new_theme_electric_blue: {
            ru: 'Электрический синий',
            en: 'Electric Blue',
            uk: 'Електричний синій'
        },
        interface_mod_new_theme_crimson_glow: {
            ru: 'Малиновое свечение',
            en: 'Crimson Glow',
            uk: 'Малинове сяйво'
        },
        interface_mod_new_theme_wave_motion: {
            ru: 'Волновое движение',
            en: 'Wave Motion',
            uk: 'Хвильовий рух'
        },
        interface_mod_new_theme_pulse_beat: {
            ru: 'Пульсирующий ритм',
            en: 'Pulse Beat',
            uk: 'Пульсуючий ритм'
        },
        interface_mod_new_theme_rainbow_shift: {
            ru: 'Радужный переход',
            en: 'Rainbow Shift',
            uk: 'Райдужний перехід'
        },
        interface_mod_new_theme_clean_dark: {
            ru: 'Чистый темный',
            en: 'Clean Dark',
            uk: 'Чистий темний'
        },
        interface_mod_new_theme_slate_blue: {
            ru: 'Сланцево-синий',
            en: 'Slate Blue',
            uk: 'Сланцево-синій'
        },
        interface_mod_new_theme_light_minimal: {
            ru: 'Светлый минимал',
            en: 'Light Minimal',
            uk: 'Світлий мінімал'
        }
    });

    // Функция для добавления настроек
    function addSettings() {
        var menu = [{
            title: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            submenu: [{
                title: Lampa.Lang.translate('interface_mod_new_about_plugin'),
                action: 'about'
            }, {
                title: Lampa.Lang.translate('interface_mod_new_show_movie_type'),
                switch: {
                    checked: InterFaceMod.settings.show_movie_type,
                    onToggle: function (checked) {
                        InterFaceMod.settings.show_movie_type = checked;
                        Lampa.Storage.set('interface_mod_new_show_movie_type', checked);
                        changeMovieTypeLabels();
                    }
                }
            }, {
                title: Lampa.Lang.translate('interface_mod_new_info_panel'),
                switch: {
                    checked: InterFaceMod.settings.info_panel,
                    onToggle: function (checked) {
                        InterFaceMod.settings.info_panel = checked;
                        Lampa.Storage.set('interface_mod_new_info_panel', checked);
                        newInfoPanel();
                    }
                }
            }, {
                title: Lampa.Lang.translate('interface_mod_new_colored_ratings'),
                switch: {
                    checked: InterFaceMod.settings.colored_ratings,
                    onToggle: function (checked) {
                        InterFaceMod.settings.colored_ratings = checked;
                        Lampa.Storage.set('interface_mod_new_colored_ratings', checked);
                        if (checked) {
                            updateVoteColors();
                            setupVoteColorsObserver();
                            setupVoteColorsForDetailPage();
                        } else {
                            removeVoteColors();
                        }
                    }
                }
            }, {
                title: Lampa.Lang.translate('interface_mod_new_buttons_style_mode'),
                select: {
                    options: [
                        { value: 'default', title: Lampa.Lang.translate('interface_mod_new_buttons_style_mode_default') },
                        { value: 'all', title: Lampa.Lang.translate('interface_mod_new_buttons_style_mode_all') },
                        { value: 'custom', title: Lampa.Lang.translate('interface_mod_new_buttons_style_mode_custom') }
                    ],
                    selected: InterFaceMod.settings.buttons_style_mode,
                    onSelect: function (value) {
                        InterFaceMod.settings.buttons_style_mode = value;
                        Lampa.Storage.set('interface_mod_new_buttons_style_mode', value);
                        styleButtons();
                        if (value === 'all' || value === 'main2') {
                            showAllButtons();
                        }
                    }
                }
            }, {
                title: Lampa.Lang.translate('interface_mod_new_theme_select'),
                select: {
                    options: [
                        { value: 'default', title: Lampa.Lang.translate('interface_mod_new_theme_default') },
                        { value: 'minimalist', title: Lampa.Lang.translate('interface_mod_new_theme_minimalist') },
                        { value: 'glow_outline', title: Lampa.Lang.translate('interface_mod_new_theme_glow_outline') },
                        { value: 'menu_lines', title: Lampa.Lang.translate('interface_mod_new_theme_menu_lines') },
                        { value: 'dark_emerald', title: Lampa.Lang.translate('interface_mod_new_theme_dark_emerald') },
                        { value: 'neon_pulse', title: Lampa.Lang.translate('interface_mod_new_theme_neon_pulse') },
                        { value: 'cyber_green', title: Lampa.Lang.translate('interface_mod_new_theme_cyber_green') },
                        { value: 'electric_blue', title: Lampa.Lang.translate('interface_mod_new_theme_electric_blue') },
                        { value: 'crimson_glow', title: Lampa.Lang.translate('interface_mod_new_theme_crimson_glow') },
                        { value: 'wave_motion', title: Lampa.Lang.translate('interface_mod_new_theme_wave_motion') },
                        { value: 'pulse_beat', title: Lampa.Lang.translate('interface_mod_new_theme_pulse_beat') },
                        { value: 'rainbow_shift', title: Lampa.Lang.translate('interface_mod_new_theme_rainbow_shift') },
                        { value: 'clean_dark', title: Lampa.Lang.translate('interface_mod_new_theme_clean_dark') },
                        { value: 'slate_blue', title: Lampa.Lang.translate('interface_mod_new_theme_slate_blue') },
                        { value: 'light_minimal', title: Lampa.Lang.translate('interface_mod_new_theme_light_minimal') }
                    ],
                    selected: InterFaceMod.settings.theme,
                    onSelect: function (value) {
                        InterFaceMod.settings.theme = value;
                        Lampa.Storage.set('interface_mod_new_theme_select', value);
                        applyTheme(value);
                    }
                }
            }, {
                title: Lampa.Lang.translate('interface_mod_new_stylize_titles'),
                switch: {
                    checked: InterFaceMod.settings.stylize_titles,
                    onToggle: function (checked) {
                        InterFaceMod.settings.stylize_titles = checked;
                        Lampa.Storage.set('interface_mod_new_stylize_titles', checked);
                        stylizeCollectionTitles();
                    }
                }
            }, {
                title: Lampa.Lang.translate('interface_mod_new_enhance_detailed_info'),
                switch: {
                    checked: InterFaceMod.settings.enhance_detailed_info,
                    onToggle: function (checked) {
                        InterFaceMod.settings.enhance_detailed_info = checked;
                        Lampa.Storage.set('interface_mod_new_enhance_detailed_info', checked);
                        enhanceDetailedInfo();
                    }
                }
            }]
        }];

        // Логирование для диагностики
        if (InterFaceMod.debug) {
            console.log('InterfaceMod: Lampa.SettingsApi exists:', !!Lampa.SettingsApi);
            console.log('InterfaceMod: Lampa.SettingsApi.addParam exists:', !!Lampa.SettingsApi?.addParam);
        }

        // Добавляем меню настроек
        try {
            Lampa.Settings.main().menu.unshift(menu[0]);
        } catch (e) {
            console.error('InterfaceMod: Failed to add settings menu:', e);
        }
    }

    // Функция для изменения лейблов типа контента
    function changeMovieTypeLabels() {
        if (!InterFaceMod.settings.show_movie_type) {
            $('.card__type').remove();
            return;
        }

        Lampa.Listener.follow('card', function (e) {
            if (e.card && e.card.title) {
                var type = e.card.number_of_seasons ? 'series' : 'movie';
                var labelText = type === 'series' ? Lampa.Lang.translate('interface_mod_new_label_serial') : Lampa.Lang.translate('interface_mod_new_label_movie');
                var label = $('<div class="card__type">' + labelText + '</div>');
                var card = $(e.element);

                card.find('.card__type').remove();
                card.find('.card__view').append(label);

                label.css({
                    position: 'absolute',
                    top: InterFaceMod.settings.label_position.includes('top') ? '10px' : 'auto',
                    bottom: InterFaceMod.settings.label_position.includes('bottom') ? '10px' : 'auto',
                    right: InterFaceMod.settings.label_position.includes('right') ? '10px' : 'auto',
                    left: InterFaceMod.settings.label_position.includes('left') ? '10px' : 'auto',
                    background: type === 'series' ? 'rgba(46, 204, 113, 0.8)' : 'rgba(52, 152, 219, 0.8)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                });
            }
        });
    }

    // Новая инфо-панель
    function newInfoPanel() {
        if (!InterFaceMod.settings.info_panel) {
            $('.info-unified-line').remove();
            return;
        }

        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(function () {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;

                    var movie = data.data.movie;
                    var unifiedLine = $('<div class="info-unified-line"></div>');

                    // Жанры
                    if (movie.genres && movie.genres.length) {
                        var genresText = movie.genres.map(g => g.name).join(', ');
                        var genreItem = $('<span class="info-unified-item"></span>')
                            .text(genresText)
                            .css({
                                'background-color': 'rgba(46, 204, 113, 0.8)',
                                'color': 'white'
                            });
                        unifiedLine.append(genreItem);
                    }

                    // Страна
                    if (movie.production_countries && movie.production_countries.length) {
                        var countriesText = movie.production_countries.map(c => c.name).join(', ');
                        var countryItem = $('<span class="info-unified-item"></span>')
                            .text(countriesText)
                            .css({
                                'background-color': 'rgba(52, 152, 219, 0.8)',
                                'color': 'white'
                            });
                        unifiedLine.append(countryItem);
                    }

                    // Год
                    if (movie.release_date || movie.first_air_date) {
                        var year = (movie.release_date || movie.first_air_date).split('-')[0];
                        var yearItem = $('<span class="info-unified-item"></span>')
                            .text(year)
                            .css({
                                'background-color': 'rgba(231, 76, 60, 0.8)',
                                'color': 'white'
                            });
                        unifiedLine.append(yearItem);
                    }

                    // Режиссер
                    if (movie.credits && movie.credits.crew) {
                        var director = movie.credits.crew.find(c => c.job === 'Director');
                        if (director) {
                            var directorItem = $('<span class="info-unified-item"></span>')
                                .text(director.name)
                                .css({
                                    'background-color': 'rgba(155, 89, 182, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(directorItem);
                        }
                    }

                    details.prepend(unifiedLine);
                }, 300);
            }
        });

        // Добавляем стили для инфо-панели
        var infoPanelStyle = document.createElement('style');
        infoPanelStyle.id = 'info-panel-css';
        infoPanelStyle.textContent = `
            .info-unified-line {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.5em;
                margin-bottom: 0.5em;
            }
            .info-unified-item {
                border-radius: 0.3em;
                font-size: 1.3em;
                padding: 0.2em 0.6em;
                display: inline-block;
                white-space: nowrap;
                line-height: 1.2em;
            }
        `;
        document.head.appendChild(infoPanelStyle);
    }

    // Обновление цветов рейтинга
    function updateVoteColors() {
        $('.card__vote').each(function () {
            var vote = parseFloat($(this).text());
            if (isNaN(vote)) return;

            var color;
            if (vote >= 8) color = '#2ecc71';
            else if (vote >= 6) color = '#f1c40f';
            else color = '#e74c3c';

            $(this).css({
                background: color,
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px'
            });
        });
    }

    // Наблюдатель за изменениями рейтинга
    function setupVoteColorsObserver() {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    $(mutation.addedNodes).find('.card__vote').each(function () {
                        updateVoteColors();
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Цвета рейтинга на странице деталей
    function setupVoteColorsForDetailPage() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && InterFaceMod.settings.colored_ratings) {
                setTimeout(function () {
                    var rate = $('.full-start__rate, .full-start-new__rate');
                    rate.each(function () {
                        var vote = parseFloat($(this).text());
                        if (isNaN(vote)) return;

                        var color;
                        if (vote >= 8) color = '#2ecc71';
                        else if (vote >= 6) color = '#f1c40f';
                        else color = '#e74c3c';

                        $(this).css({
                            background: color,
                            color: '#fff',
                            padding: '3px 8px',
                            borderRadius: '4px'
                        });
                    });
                }, 300);
            }
        });
    }

    // Удаление цветов рейтинга
    function removeVoteColors() {
        $('.card__vote, .full-start__rate, .full-start-new__rate').css({
            background: '',
            color: '',
            padding: '',
            borderRadius: ''
        });
    }

    // Показ всех кнопок
    function showAllButtons() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(function () {
                    var buttons = $('.full-start__buttons, .full-start-new__buttons');
                    buttons.find('.button').show();
                }, 300);
            }
        });
    }

    // Стилизация кнопок
    function styleButtons() {
        if (InterFaceMod.settings.buttons_style_mode !== 'custom') {
            $('.custom-online-btn, .custom-torrent-btn').removeClass('custom-online-btn custom-torrent-btn');
            return;
        }

        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(function () {
                    var buttons = $('.full-start__buttons, .full-start-new__buttons');
                    buttons.find('.button').each(function () {
                        var button = $(this);
                        if (button.text().toLowerCase().includes('онлайн')) {
                            button.addClass('custom-online-btn');
                        } else if (button.text().toLowerCase().includes('торрент')) {
                            button.addClass('custom-torrent-btn');
                        }
                    });
                }, 300);
            }
        });

        // Добавляем стили для кнопок
        var buttonStyle = document.createElement('style');
        buttonStyle.id = 'button-style-css';
        buttonStyle.textContent = `
            .custom-online-btn {
                background: linear-gradient(to right, #3498db, #2980b9);
                color: #fff;
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            .custom-online-btn:hover, .custom-online-btn.focus {
                background: linear-gradient(to right, #2980b9, #3498db);
                box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
                transform: scale(1.05);
            }
            .custom-torrent-btn {
                background: linear-gradient(to right, #e74c3c, #c0392b);
                color: #fff;
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            .custom-torrent-btn:hover, .custom-torrent-btn.focus {
                background: linear-gradient(to right, #c0392b, #e74c3c);
                box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(buttonStyle);
    }

    // Применение темы
    function applyTheme(theme) {
        var style = document.createElement('style');
        style.id = 'interface-mod-theme';

        var oldStyle = document.getElementById('interface-mod-theme');
        if (oldStyle) oldStyle.remove();

        var themes = {
            default: '',
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
            `,
            neon_pulse: `
                body { background: linear-gradient(135deg, #000428 0%, #004e92 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #ff00ff, #00ffff);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                    border: none;
                    animation: neon-pulse 2s infinite;
                }
                @keyframes neon-pulse {
                    0% { box-shadow: 0 0 10px rgba(255, 0, 255, 0.4); }
                    50% { box-shadow: 0 0 25px rgba(255, 0, 255, 0.8); }
                    100% { box-shadow: 0 0 10px rgba(255, 0, 255, 0.4); }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff00ff;
                    box-shadow: 0 0 20px #00ffff;
                    animation: card-pulse 2s infinite;
                }
                @keyframes card-pulse {
                    0% { box-shadow: 0 0 10px #00ffff; }
                    50% { box-shadow: 0 0 25px #00ffff; }
                    100% { box-shadow: 0 0 10px #00ffff; }
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(0, 4, 40, 0.95);
                    border: 1px solid rgba(0, 78, 146, 0.2);
                }
            `,
            cyber_green: `
                body { background: #0a0f0d; color: #7adb92; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: #0a3622;
                    color: #7adb92;
                    border: 1px solid #7adb92;
                    box-shadow: 0 0 10px rgba(122, 219, 146, 0.5);
                    text-shadow: 0 0 5px rgba(122, 219, 146, 0.7);
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 1px solid #7adb92;
                    box-shadow: 0 0 15px rgba(122, 219, 146, 0.5);
                }
                .card__title, .card__vote, .card__title-original {
                    color: #7adb92;
                    text-shadow: 0 0 5px rgba(122, 219, 146, 0.3);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(10, 15, 13, 0.95);
                    border: 1px solid rgba(122, 219, 146, 0.2);
                }
            `,
            electric_blue: `
                body { background: linear-gradient(135deg, #000000 0%, #0c0c2b 100%); color: #00e1ff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: rgba(0, 45, 100, 0.7);
                    color: #00e1ff;
                    box-shadow: 0 0 15px rgba(0, 225, 255, 0.6);
                    border: 1px solid #00e1ff;
                    text-shadow: 0 0 10px rgba(0, 225, 255, 0.8);
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #00e1ff;
                    box-shadow: 0 0 20px rgba(0, 225, 255, 0.7);
                }
                .head__action.focus, .head__action.hover {
                    background: rgba(0, 45, 100, 0.7);
                    box-shadow: 0 0 15px rgba(0, 225, 255, 0.6);
                    border: 1px solid #00e1ff;
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(0.8) contrast(1.2) saturate(1.2);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(0, 12, 43, 0.93);
                    border: 1px solid rgba(0, 225, 255, 0.2);
                }
            `,
            crimson_glow: `
                body { background: linear-gradient(135deg, #190000 0%, #360000 100%); color: #ff5a5a; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #8e0000, #ff0000);
                    color: #ffffff;
                    box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
                    border: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff0000;
                    box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(to right, #8e0000, #ff0000);
                    box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: brightness(0.8) contrast(1.2) saturate(1.3);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(20, 0, 0, 0.95);
                    border: 1px solid rgba(255, 0, 0, 0.2);
                }
            `,
            wave_motion: `
                body { background: linear-gradient(135deg, #000, #1e2d61); color: #7dc7ff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(90deg, #003973, #1e5799, #007cb9, #003973);
                    background-size: 300% 100%;
                    color: #fff;
                    box-shadow: 0 0 10px rgba(0, 57, 115, 0.5);
                    animation: wave-bg 3s ease infinite;
                }
                @keyframes wave-bg {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid transparent;
                    background: linear-gradient(90deg, #003973, #1e5799, #007cb9, #003973);
                    background-size: 300% 100%;
                    animation: wave-border 3s ease infinite;
                    box-shadow: 0 0 15px rgba(0, 57, 115, 0.5);
                }
                @keyframes wave-border {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(0, 13, 30, 0.93);
                    border: 1px solid rgba(0, 149, 255, 0.2);
                }
            `,
            pulse_beat: `
                body { background: #111111; color: #e0e0e0; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: #333333;
                    color: #ffffff;
                    animation: pulse 1.5s ease-in-out infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                    100% { transform: scale(1); }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #555555;
                    box-shadow: 0 0 10px rgba(85, 85, 85, 0.7);
                    animation: card-pulse 1.5s ease-in-out infinite;
                }
                @keyframes card-pulse {
                    0% { box-shadow: 0 0 5px rgba(85, 85, 85, 0.5); }
                    50% { box-shadow: 0 0 15px rgba(85, 85, 85, 0.8); }
                    100% { box-shadow: 0 0 5px rgba(85, 85, 85, 0.5); }
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(17, 17, 17, 0.95);
                    border: 1px solid rgba(85, 85, 85, 0.2);
                }
            `,
            rainbow_shift: `
                body { background: #0a0a0a; color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(90deg, #ff0000, #ffa500, #ffff00, #008000, #0000ff, #4b0082, #ee82ee);
                    background-size: 700% 100%;
                    color: #ffffff;
                    text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
                    animation: rainbow 8s linear infinite;
                    border: none;
                }
                @keyframes rainbow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: none;
                    background: linear-gradient(90deg, #ff0000, #ffa500, #ffff00, #008000, #0000ff, #4b0082, #ee82ee);
                    background-size: 700% 100%;
                    animation: rainbow 8s linear infinite;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(10, 10, 10, 0.95);
                    border: 1px solid rgba(128, 128, 128, 0.2);
                }
            `,
            clean_dark: `
                body { background: #121212; color: #e0e0e0; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
            slate_blue: `
                body { background: #1a202c; color: #e2e8f0; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: #2d3748;
                    color: #ffffff;
                    box-shadow: none;
                    border-radius: 2px;
                    border-bottom: 2px solid #4a5568;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 1px solid #4a5568;
                    box-shadow: none;
                }
                .head__action.focus, .head__action.hover {
                    background: #2d3748;
                    border-bottom: 2px solid #4a5568;
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(0.8);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(26, 32, 44, 0.97);
                    border: 1px solid #4a5568;
                }
                .card__title, .full-start__title, .full-start-new__title {
                    color: #e2e8f0;
                }
            `,
            light_minimal: `
                body { background: #f5f5f5; color: #333333; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: #e0e0e0;
                    color: #333333;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border-radius: 3px;
                    border: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 1px solid #cccccc;
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
                }
                .head__action.focus, .head__action.hover {
                    background: #e0e0e0;
                    color: #333333;
                }
                .full-start__background {
                    opacity: 0.9;
                    filter: brightness(1.1);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(255, 255, 255, 0.98);
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
                }
                .card__title, .card__vote, .full-start__title, .full-start__rate, .full-start-new__title, .full-start-new__rate {
                    color: #333333;
                }
            `
        };

        style.textContent = themes[theme] || '';
        document.head.appendChild(style);
    }

    // Стилизация заголовков подборок
    function stylizeCollectionTitles() {
        if (!InterFaceMod.settings.stylize_titles) {
            var oldStyle = document.getElementById('stylized-titles-css');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var styleElement = document.createElement('style');
        styleElement.id = 'stylized-titles-css';
        styleElement.textContent = `
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
        document.head.appendChild(styleElement);

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1) {
                            var titles = node.querySelectorAll('.items-line__title');
                            if (titles.length) {
                                // Дополнительные действия при необходимости
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

    // Увеличенная информация
    function enhanceDetailedInfo() {
        if (!InterFaceMod.settings.enhance_detailed_info) {
            var oldStyle = document.getElementById('enhanced-info-css');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var enhancedInfoStyle = document.createElement('style');
        enhancedInfoStyle.id = 'enhanced-info-css';
        enhancedInfoStyle.textContent = `
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
            .full-start-new__info {
                font-size: 1.4em !important;
            }
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

        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && InterFaceMod.settings.enhance_detailed_info) {
                setTimeout(function () {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;

                    var seasonText = '';
                    var episodeText = '';
                    var durationText = '';

                    details.find('span').each(function () {
                        var text = $(this).text().trim();
                        if (text.match(/Сезон(?:ы)?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сезон(?:а|ов)?/i)) {
                            seasonText = text;
                        } else if (text.match(/Серии?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сери(?:я|и|й)/i)) {
                            episodeText = text;
                        } else if (text.match(/Длительность/i) || text.indexOf('≈') !== -1) {
                            durationText = text;
                        }
                    });

                    if ((seasonText && episodeText) || (seasonText && durationText) || (episodeText && durationText)) {
                        var unifiedLine = $('<div class="info-unified-line"></div>');

                        if (seasonText) {
                            var seasonItem = $('<span class="info-unified-item"></span>')
                                .text(seasonText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(seasonItem);
                        }

                        if (episodeText) {
                            var episodeItem = $('<span class="info-unified-item"></span>')
                                .text(episodeText)
                                .css({
                                    'background-color': 'rgba(46, 204, 113, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(episodeItem);
                        }

                        if (durationText) {
                            var durationItem = $('<span class="info-unified-item"></span>')
                                .text(durationText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(durationItem);
                        }

                        details.find('span').each(function () {
                            var text = $(this).text().trim();
                            if (text === seasonText || text === episodeText || text === durationText) {
                                $(this).remove();
                            }
                        });

                        details.prepend(unifiedLine);
                    }
                }, 300);
            }
        });
    }

    // Информация о сезонах и эпизодах
    function addSeasonInfo() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && data.data.movie.number_of_seasons) {
                if (InterFaceMod.settings.seasons_info_mode === 'none') return;

                var movie = data.data.movie;
                var status = movie.status;
                var totalSeasons = movie.number_of_seasons || 0;
                var totalEpisodes = movie.number_of_episodes || 0;
                var airedSeasons = 0, airedEpisodes = 0;
                var now = new Date();

                if (movie.seasons) {
                    movie.seasons.forEach(function (s) {
                        if (s.season_number === 0) return;
                        var seasonAired = s.air_date && new Date(s.air_date) <= now;
                        if (seasonAired) airedSeasons++;
                        if (s.episodes) {
                            s.episodes.forEach(function (ep) {
                                if (ep.air_date && new Date(ep.air_date) <= now) {
                                    airedEpisodes++;
                                }
                            });
                        }
                    });
                }

                var seasonText = airedSeasons + '/' + totalSeasons + ' сезонов';
                var episodeText = airedEpisodes + '/' + totalEpisodes + ' серий';
                var infoLine = $('<div class="season-info-line"></div>');

                if (InterFaceMod.settings.seasons_info_mode === 'aired') {
                    infoLine.append('<span class="season-info-item">' + seasonText + '</span>');
                    infoLine.append('<span class="season-info-item">' + episodeText + '</span>');
                }

                $('.full-start-new__details').prepend(infoLine);

                var seasonInfoStyle = document.createElement('style');
                seasonInfoStyle.textContent = `
                    .season-info-line {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5em;
                        margin-bottom: 0.5em;
                    }
                    .season-info-item {
                        background: rgba(46, 204, 113, 0.8);
                        color: white;
                        padding: 0.2em 0.6em;
                        border-radius: 0.3em;
                        font-size: 1.3em;
                    }
                `;
                document.head.appendChild(seasonInfoStyle);
            }
        });
    }

    // Инициализация плагина
    function startPlugin() {
        addSettings();
        changeMovieTypeLabels();
        newInfoPanel();
        if (InterFaceMod.settings.colored_ratings) {
            updateVoteColors();
            setupVoteColorsObserver();
            setupVoteColorsForDetailPage();
        }
        styleButtons();
        if (InterFaceMod.settings.buttons_style_mode === 'all' || InterFaceMod.settings.buttons_style_mode === 'main2') {
            showAllButtons();
        }
        if (InterFaceMod.settings.theme) {
            applyTheme(InterFaceMod.settings.theme);
        }
        if (InterFaceMod.settings.stylize_titles) {
            stylizeCollectionTitles();
        }
        if (InterFaceMod.settings.enhance_detailed_info) {
            enhanceDetailedInfo();
        }
        addSeasonInfo();
    }

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
