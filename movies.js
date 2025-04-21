(function () {
    'use strict';

    // Main plugin object
    var MovieAmikdn = {
        name: 'movieamikdn',
        version: '2.1.1',
        debug: true,
        settings: {
            enabled: true,
            show_ru: true,
            show_en: true
        }
    };

    // List of Russian movie services
    var RU_MOVIES = [
        { name: 'Start', networkId: '2493' },
        { name: 'Premier', networkId: '2859' },
        { name: 'KION', networkId: '4085' },
        { name: 'Okko', networkId: '3871' },
        { name: 'КиноПоиск', networkId: '3827' },
        { name: 'Wink', networkId: '5806' },
        { name: 'ИВИ', networkId: '3923' },
        { name: 'Смотрим', networkId: '5000' },
        { name: 'Первый', networkId: '558' },
        { name: 'СТС', networkId: '806' },
        { name: 'ТНТ', networkId: '1191' },
        { name: 'Пятница', networkId: '3031' },
        { name: 'Россия 1', networkId: '412' },
        { name: 'НТВ', networkId: '1199' }
    ];
    // List of international movie services
    var EN_MOVIES = [
        { name: 'Netflix', networkId: '213' },
        { name: 'Apple TV', networkId: '2552' },
        { name: 'HBO', networkId: '49' },
        { name: 'SyFy', networkId: '77' },
        { name: 'NBC', networkId: '6' },
        { name: 'TV New Zealand', networkId: '1376' },
        { name: 'Hulu', networkId: '453' },
        { name: 'ABC', networkId: '49' },
        { name: 'CBS', networkId: '16' },
        { name: 'Amazon Prime', networkId: '1024' }
    ];

    // Localization
    function addLocalization() {
        if (Lampa && Lampa.Lang) {
            Lampa.Lang.add({
                movieamikdn_ru: {
                    ru: 'RU Муви',
                    en: 'RU Movies'
                },
                movieamikdn_en: {
                    ru: 'EN Муви',
                    en: 'EN Movies'
                },
                movieamikdn_title: {
                    ru: 'Онлайн муви',
                    en: 'Online Movies'
                }
            });
        }
    }

    // SVG icons
    function getSVGIcon(type) {
        if (type === 'ru') {
            return '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="8" y="0" fill="#fff"/><rect width="24" height="8" y="8" fill="#0039a6"/><rect width="24" height="8" y="16" fill="#d52b1e"/></svg>';
        } else {
            return '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="#00247d"/><text x="12" y="16" font-size="12" fill="#fff" text-anchor="middle" font-family="Arial">EN</text></svg>';
        }
    }

    // Remove buttons from main menu
    function removeMenuButtons() {
        $('.movieamikdn-btn-ru').remove();
        $('.movieamikdn-btn-en').remove();
    }

    // Add buttons to main menu
    function addMenuButtons() {
        if (MovieAmikdn.debug) {
            console.log('movieamikdn: addMenuButtons called');
            console.log('movieamikdn: show_ru =', MovieAmikdn.settings.show_ru);
            console.log('movieamikdn: show_en =', MovieAmikdn.settings.show_en);
        }

        $('.menu__item.movieamikdn-btn-ru, .menu__item.movieamikdn-btn-en').remove();

        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) {
            if (MovieAmikdn.debug) {
                console.log('movieamikdn: menu not found');
            }
            return;
        }

        // RU Movies
        if (String(MovieAmikdn.settings.show_ru).toLowerCase() !== 'false') {
            if (MovieAmikdn.debug) {
                console.log('movieamikdn: adding RU button');
            }
            var ico = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
                <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" 
                      font-weight="700" fill="currentColor" dominant-baseline="middle">
                    RU
                </text>
            </svg>`;
            var $btnRU = $(`
                <li class="menu__item selector movieamikdn-btn-ru">
                    <div class="menu__ico">${ico}</div>
                    <div class="menu__text">Муви</div>
                </li>
            `);
            $btnRU.on('hover:enter', function () {
                openMoviesModal('ru');
            });
            $menu.append($btnRU);
        }

        // EN Movies
        if (String(MovieAmikdn.settings.show_en).toLowerCase() !== 'false') {
            if (MovieAmikdn.debug) {
                console.log('movieamikdn: adding EN button');
            }
            var ico = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
                <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" 
                      font-weight="700" fill="currentColor" dominant-baseline="middle">
                    EN
                </text>
            </svg>`;
            var $btnEN = $(`
                <li class="menu__item selector movieamikdn-btn-en">
                    <div class="menu__ico">${ico}</div>
                    <div class="menu__text">Муви</div>
                </li>
            `);
            $btnEN.on('hover:enter', function () {
                openMoviesModal('en');
            });
            $menu.append($btnEN);
        }
    }

    // Get network data
    function getNetworkData(networkId) {
        if (Lampa && Lampa.TMDB && Lampa.TMDB.networks) {
            for (var i = 0; i < Lampa.TMDB.networks.length; i++) {
                if (String(Lampa.TMDB.networks[i].id) === String(networkId)) {
                    return Lampa.TMDB.networks[i];
                }
            }
        }
        return null;
    }

    // Get logo path from cache
    function getLogoPathFromCache(networkId) {
        if (Lampa && Lampa.TMDB && Lampa.TMDB.networks) {
            for (var i = 0; i < Lampa.TMDB.networks.length; i++) {
                if (String(Lampa.TMDB.networks[i].id) === String(networkId)) {
                    return Lampa.TMDB.networks[i].logo_path || null;
                }
            }
        }
        return null;
    }

    // Get movie logo
    function getMovieLogo(networkId, name, callback) {
        var logoPath = getLogoPathFromCache(networkId);
        if (logoPath) {
            var url = Lampa.TMDB && Lampa.TMDB.image ? Lampa.TMDB.image('t/p/w300' + logoPath) : 'https://image.tmdb.org/t/p/w300' + logoPath;
            callback('<img src="' + url + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
            return;
        }
        var apiUrl = Lampa.TMDB.api('network/' + networkId + '?api_key=' + Lampa.TMDB.key());
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                if (data && data.logo_path) {
                    var imgUrl = Lampa.TMDB && Lampa.TMDB.image ? Lampa.TMDB.image('t/p/w300' + data.logo_path) : 'https://image.tmdb.org/t/p/w300' + data.logo_path;
                    callback('<img src="' + imgUrl + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
                } else {
                    callback('<div style="font-size:22px;line-height:44px;color:#222;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + name.charAt(0) + '</div>');
                }
            },
            error: function () {
                callback('<div style="font-size:22px;line-height:68px;color:#222;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + name.charAt(0) + '</div>');
            }
        });
    }

    // Open movie catalog
    function openMovieCatalog(networkId, name) {
        var sort = MovieAmikdn.settings.sort_mode;
        if (sort === 'release_date.desc') sort = 'first_air_date.desc';
        if (sort === 'release_date.asc') sort = 'first_air_date.asc';
        Lampa.Activity.push({
            url: 'discover/tv',
            title: name,
            networks: networkId,
            sort_by: sort,
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1
        });
    }

    // Activate cards controller
    function activateCardsController($container) {
        var name = 'movieamikdn-cards';
        var $cards = $container.find('.movieamikdn-card.selector');
        var lastFocus = 0;
        function getCardsPerRow() {
            if ($cards.length < 2) return 1;
            var firstTop = $cards.eq(0).offset().top;
            for (var i = 1; i < $cards.length; i++) {
                if ($cards.eq(i).offset().top !== firstTop) {
                    return i;
                }
            }
            return $cards.length;
        }
        function updateFocus(index) {
            $cards.removeClass('focus').attr('tabindex', '-1');
            if ($cards.eq(index).length) {
                $cards.eq(index).addClass('focus').attr('tabindex', '0').focus();
                var card = $cards.get(index);
                if (card && card.scrollIntoView) {
                    card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
                lastFocus = index;
            }
        }
        Lampa.Controller.add(name, {
            toggle: function() {
                Lampa.Controller.collectionSet($container);
                updateFocus(lastFocus);
            },
            up: function() {
                var perRow = getCardsPerRow();
                var idx = lastFocus - perRow;
                if (idx >= 0) updateFocus(idx);
            },
            down: function() {
                var perRow = getCardsPerRow();
                var idx = lastFocus + perRow;
                if (idx < $cards.length) updateFocus(idx);
            },
            left: function() {
                var idx = lastFocus - 1;
                if (idx >= 0) updateFocus(idx);
            },
            right: function() {
                var idx = lastFocus + 1;
                if (idx < $cards.length) updateFocus(idx);
            },
            back: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            },
            enter: function() {
                $cards.eq(lastFocus).trigger('hover:enter');
            }
        });
        Lampa.Controller.toggle(name);
    }

    // Open modal with movies
    function openMoviesModal(type) {
        var movies = type === 'ru' ? RU_MOVIES : EN_MOVIES;
        var enabled = type === 'ru' ? MovieAmikdn.settings.ru_movies : MovieAmikdn.settings.en_movies;
        var filtered = [];
        for (var i = 0; i < movies.length; i++) {
            if (enabled[movies[i].networkId]) filtered.push(movies[i]);
        }
        var titleText = type === 'ru' ? 'Русские онлайн муви' : 'Иностранные онлайн муви';
        var svgIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#00dbde" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="#fc00ff"/></svg>';
        var $header = $('<div class="movieamikdn-modal-header"></div>');
        $header.append(svgIcon);
        $header.append('<span class="movieamikdn-modal-title">' + titleText + '</span>');
        var $container = $('<div class="movieamikdn-cards"></div>');
        for (var j = 0; j < filtered.length; j++) {
            (function (c) {
                var $card = $('<div class="movieamikdn-card selector"></div>');
                var $logo = $('<div class="movieamikdn-card__logo"></div>');
                getMovieLogo(c.networkId, c.name, function(logoHtml) {
                    $logo.html(logoHtml);
                });
                $card.append($logo);
                $card.append('<div class="movieamikdn-card__name">' + c.name + '</div>');
                $card.on('hover:enter', function () {
                    Lampa.Modal.close();
                    openMovieCatalog(c.networkId, c.name);
                });
                $container.append($card);
            })(filtered[j]);
        }
        var $wrap = $('<div></div>');
        $wrap.append($header).append($container);
        Lampa.Modal.open({
            title: '',
            html: $wrap,
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            },
            size: 'full'
        });
        setTimeout(function() {
            activateCardsController($container);
        }, 100);
    }

    // Add styles
    function addStyles() {
        var style = '<style id="movieamikdn-styles">'
            + '.movieamikdn-cards { max-height: 70vh; overflow-y: auto; display: flex; flex-wrap: wrap; justify-content: center; border-radius: 18px; }'
            + '.movieamikdn-card { width: 120px; height: 120px; background: rgba(24,24,40,0.95); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: box-shadow 0.2s, background 0.2s; margin: 12px; box-shadow: 0 2px 12px rgba(233, 64, 87, 0.08); border: 1.5px solid rgba(233, 64, 87, 0.08); }'
            + '.movieamikdn-card.selector:focus, .movieamikdn-card.selector:hover { box-shadow: 0 0 24px #e94057, 0 0 30px #f27121; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); outline: none; border: 1.5px solid #e94057; }'
            + '.movieamikdn-card__logo { width: 84px; height: 84px; background: #918d8db8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #222; font-weight: bold; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(233, 64, 87, 0.08); }'
            + '.movieamikdn-card__name { color: #fff; font-size: 16px; text-align: center; text-shadow: 0 2px 8px rgba(233, 64, 87, 0.15); }'
            + '.movieamikdn-modal-header { display: flex; flex-direction: row; align-items: center; justify-content: center; margin-bottom: 28px; width: 100%; }'
            + '.movieamikdn-modal-header svg { width: 34px !important; height: 34px !important; min-width: 34px; min-height: 34px; max-width: 34px; max-height: 34px; display: inline-block; flex-shrink: 0; margin-right: 16px; }'
            + '.movieamikdn-modal-title { font-size: 1.6em; font-weight: bold; color: #fff; background: linear-gradient(90deg, #8a2387, #e94057, #f27121); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; max-width: 90vw; word-break: break-word; white-space: normal; display: inline-block; text-shadow: 0 2px 8px rgba(233, 64, 87, 0.15); }'
            + '</style>';
        if (!$('#movieamikdn-styles').length) $('head').append(style);
    }

    // SETTINGS ---
    var STORAGE_KEY = 'movieamikdn_settings';
    var SORT_MODES = {
        'popularity.desc': 'Популярные',
        'release_date.desc': 'По дате (новые)',
        'release_date.asc': 'По дате (старые)',
        'vote_average.desc': 'По рейтингу',
        'vote_count.desc': 'По количеству голосов'
    };

    // Load settings
    function loadSettings() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (MovieAmikdn.debug) {
            console.log('movieamikdn: loading settings from localStorage', saved);
        }
        if (saved) {
            try {
                var obj = JSON.parse(saved);
                for (var k in obj) {
                    MovieAmikdn.settings[k] = obj[k];
                }
            } catch (e) {
                if (MovieAmikdn.debug) console.error('movieamikdn: error loading settings', e);
            }
        }
        // Per movie service setting
        if (!MovieAmikdn.settings.ru_movies) {
            MovieAmikdn.settings.ru_movies = {};
            for (var i = 0; i < RU_MOVIES.length; i++) {
                MovieAmikdn.settings.ru_movies[RU_MOVIES[i].networkId] = true;
            }
        }
        if (!MovieAmikdn.settings.en_movies) {
            MovieAmikdn.settings.en_movies = {};
            for (var j = 0; j < EN_MOVIES.length; j++) {
                MovieAmikdn.settings.en_movies[EN_MOVIES[j].networkId] = true;
            }
        }
        if (!MovieAmikdn.settings.sort_mode) {
            MovieAmikdn.settings.sort_mode = 'popularity.desc';
        }
        if (typeof MovieAmikdn.settings.show_ru === 'undefined') {
            MovieAmikdn.settings.show_ru = true;
        }
        if (typeof MovieAmikdn.settings.show_en === 'undefined') {
            MovieAmikdn.settings.show_en = true;
        }
    }

    function saveSettings() {
        if (MovieAmikdn.debug) {
            console.log('movieamikdn: saving settings', MovieAmikdn.settings);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MovieAmikdn.settings));
    }

    // Settings modals
    function showRuMoviesSettings() {
        var $container = $('<div class="movieamikdn-movie-btns" style="display:flex;flex-direction:column;align-items:center;padding:20px;"></div>');
        for (var i = 0; i < RU_MOVIES.length; i++) {
            (function(c, idx) {
                var enabled = MovieAmikdn.settings.ru_movies[c.networkId];
                var $btn = $('<div class="movieamikdn-movie-btn selector" tabindex="' + (idx === 0 ? '0' : '-1') + '"></div>');
                var icon = enabled ? '<span class="movieamikdn-movie-btn__icon">✔</span>' : '<span class="movieamikdn-movie-btn__icon">✖</span>';
                var nameHtml = '<span class="movieamikdn-movie-btn__name">' + c.name + '</span>';
                $btn.toggleClass('enabled', enabled);
                $btn.html(icon + nameHtml);
                $btn.on('hover:enter', function() {
                    var now = !MovieAmikdn.settings.ru_movies[c.networkId];
                    MovieAmikdn.settings.ru_movies[c.networkId] = now;
                    saveSettings();
                    $btn.toggleClass('enabled', now);
                    var icon = now ? '<span class="movieamikdn-movie-btn__icon">✔</span>' : '<span class="movieamikdn-movie-btn__icon">✖</span>';
                    $btn.html(icon + nameHtml);
                });
                $container.append($btn);
            })(RU_MOVIES[i], i);
        }
        Lampa.Modal.open({
            title: 'Включение RU Муви',
            html: $container,
            size: 'small',
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings');
            }
        });
        setTimeout(function() {
            var $btns = $container.find('.movieamikdn-movie-btn');
            var name = 'movieamikdn-ru-btns';
            var lastFocus = 0;
            function updateFocus(index) {
                $btns.removeClass('focus').attr('tabindex', '-1');
                if ($btns.eq(index).length) {
                    $btns.eq(index).addClass('focus').attr('tabindex', '0').focus();
                    var btn = $btns.get(index);
                    if (btn && btn.scrollIntoView) {
                        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                    lastFocus = index;
                }
            }
            Lampa.Controller.add(name, {
                toggle: function() {
                    Lampa.Controller.collectionSet($btns);
                    updateFocus(lastFocus);
                },
                up: function() {
                    if (lastFocus > 0) updateFocus(lastFocus - 1);
                },
                down: function() {
                    if (lastFocus < $btns.length - 1) updateFocus(lastFocus + 1);
                },
                left: function() {},
                right: function() {},
                back: function() {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings');
                },
                enter: function() {
                    $btns.eq(lastFocus).trigger('hover:enter');
                }
            });
            Lampa.Controller.toggle(name);
        }, 100);
    }

    function showEnMoviesSettings() {
        var $container = $('<div class="movieamikdn-movie-btns" style="display:flex;flex-direction:column;align-items:center;padding:20px;"></div>');
        for (var i = 0; i < EN_MOVIES.length; i++) {
            (function(c, idx) {
                var enabled = MovieAmikdn.settings.en_movies[c.networkId];
                var $btn = $('<div class="movieamikdn-movie-btn selector" tabindex="' + (idx === 0 ? '0' : '-1') + '"></div>');
                var icon = enabled ? '<span class="movieamikdn-movie-btn__icon">✔</span>' : '<span class="movieamikdn-movie-btn__icon">✖</span>';
                var nameHtml = '<span class="movieamikdn-movie-btn__name">' + c.name + '</span>';
                $btn.toggleClass('enabled', enabled);
                $btn.html(icon + nameHtml);
                $btn.on('hover:enter', function() {
                    var now = !MovieAmikdn.settings.en_movies[c.networkId];
                    MovieAmikdn.settings.en_movies[c.networkId] = now;
                    saveSettings();
                    $btn.toggleClass('enabled', now);
                    var icon = now ? '<span class="movieamikdn-movie-btn__icon">✔</span>' : '<span class="movieamikdn-movie-btn__icon">✖</span>';
                    $btn.html(icon + nameHtml);
                });
                $container.append($btn);
            })(EN_MOVIES[i], i);
        }
        Lampa.Modal.open({
            title: 'Включение EN Муви',
            html: $container,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings');
            }
        });
        setTimeout(function() {
            var $btns = $container.find('.movieamikdn-movie-btn');
            var name = 'movieamikdn-en-btns';
            var lastFocus = 0;
            function updateFocus(index) {
                $btns.removeClass('focus').attr('tabindex', '-1');
                if ($btns.eq(index).length) {
                    $btns.eq(index).addClass('focus').attr('tabindex', '0').focus();
                    var btn = $btns.get(index);
                    if (btn && btn.scrollIntoView) {
                        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                    lastFocus = index;
                }
            }
            Lampa.Controller.add(name, {
                toggle: function() {
                    Lampa.Controller.collectionSet($btns);
                    updateFocus(lastFocus);
                },
                up: function() {
                    if (lastFocus > 0) updateFocus(lastFocus - 1);
                },
                down: function() {
                    if (lastFocus < $btns.length - 1) updateFocus(lastFocus + 1);
                },
                left: function() {},
                right: function() {},
                back: function() {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings');
                },
                enter: function() {
                    $btns.eq(lastFocus).trigger('hover:enter');
                }
            });
            Lampa.Controller.toggle(name);
        }, 100);
    }

    // Add settings component
    function addSettingsComponent() {
        Lampa.SettingsApi.addComponent({
            component: 'movieamikdn',
            name: 'Онлайн муви',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="currentColor"/></svg>'
        });
        // About
        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { type: 'button', component: 'about' },
            field: { name: 'О плагине', description: 'Информация и поддержка' },
            onChange: function() { Lampa.Noty.show('MovieAmikdn v2.1.1'); }
        });
        // Show RU movies
        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { name: 'show_ru', type: 'trigger', default: MovieAmikdn.settings.show_ru },
            field: { name: 'Показывать RU Муви на главной' },
            onChange: function(val) {
                MovieAmikdn.settings.show_ru = val;
                saveSettings();
                refreshMenuButtons();
            }
        });
        // Show EN movies
        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { name: 'show_en', type: 'trigger', default: MovieAmikdn.settings.show_en },
            field: { name: 'Показывать EN Муви на главной' },
            onChange: function(val) {
                MovieAmikdn.settings.show_en = val;
                saveSettings();
                refreshMenuButtons();
            }
        });
        // RU list button
        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { type: 'button', component: 'ru_movies_list' },
            field: { name: 'Включение RU Муви', description: 'Выбрать какие RU сервисы показывать' },
            onChange: showRuMoviesSettings
        });
        // EN list button
        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { type: 'button', component: 'en_movies_list' },
            field: { name: 'Включение EN Муви', description: 'Выбрать какие EN сервисы показывать' },
            onChange: showEnMoviesSettings
        });
        // Sort mode
        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: {
                name: 'sort_mode',
                type: 'select',
                values: SORT_MODES,
                default: MovieAmikdn.settings.sort_mode
            },
            field: { name: 'Режим сортировки' },
            onChange: function(val) {
                MovieAmikdn.settings.sort_mode = val;
                saveSettings();
            }
        });
    }

    // Refresh menu buttons
    function refreshMenuButtons() {
        $('.menu__item.movieamikdn-btn-ru, .menu__item.movieamikdn-btn-en').remove();
        addMenuButtons();
    }

    // Init
    function startPlugin() {
        loadSettings();
        addLocalization();
        addStyles();
        addSettingsComponent();
        if (MovieAmikdn.debug) {
            console.log('movieamikdn: settings loaded', MovieAmikdn.settings);
        }
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(refreshMenuButtons, 1000);
            }
        });
        Lampa.Listener.follow('settings', function(e) {
            if (e.type === 'update') {
                refreshMenuButtons();
            }
        });
        Lampa.Listener.follow('menu', function(e) {
            if (e.type === 'open') {
                refreshMenuButtons();
            }
        });
        if (MovieAmikdn.debug) console.log('movieamikdn: plugin initialized');
    }

    startPlugin();

    // Export
    window.movieamikdn = MovieAmikdn;

})();
