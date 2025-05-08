(function () {
    'use strict';

    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.4.3', // Обновленная версия
        debug: true,
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

    // Локализация (без изменений)
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Интерфейс MOD',
            en: 'Interface MOD',
            uk: 'Інтерфейс MOD'
        },
        // ... остальные переводы без изменений ...
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
                        // ... остальные опции без изменений ...
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
            console.log('InterfaceMod: Lampa.Settings exists:', !!Lampa.Settings);
            console.log('InterfaceMod: Lampa.Settings.main exists:', !!Lampa.Settings?.main);
            console.log('InterfaceMod: Lampa.Settings.main().menu exists:', !!Lampa.Settings?.main?.().menu);
            console.log('InterfaceMod: Lampa.Settings.add exists:', !!Lampa.Settings?.add);
        }

        // Попытка добавить настройки через Lampa.Settings.add
        if (Lampa.Settings && typeof Lampa.Settings.add === 'function') {
            Lampa.Settings.add(menu[0]);
            if (InterFaceMod.debug) {
                console.log('InterfaceMod: Settings menu added via Lampa.Settings.add');
            }
        }
        // Попытка добавить настройки через Lampa.Settings.main().menu с задержкой
        else {
            setTimeout(function () {
                if (Lampa.Settings && typeof Lampa.Settings.main === 'function' && Lampa.Settings.main().menu) {
                    Lampa.Settings.main().menu.unshift(menu[0]);
                    if (InterFaceMod.debug) {
                        console.log('InterfaceMod: Settings menu added via Lampa.Settings.main().menu');
                    }
                } else {
                    console.warn('InterfaceMod: Cannot add settings menu - Lampa.Settings.main().menu and Lampa.Settings.add are unavailable');
                }
            }, 2000); // Увеличенная задержка 2 секунды
        }
    }

    // Остальные функции без изменений
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

    function removeVoteColors() {
        $('.card__vote, .full-start__rate, .full-start-new__rate').css({
            background: '',
            color: '',
            padding: '',
            borderRadius: ''
        });
    }

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
            // ... остальные темы без изменений ...
        };
        style.textContent = themes[theme] || '';
        document.head.appendChild(style);
    }

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
