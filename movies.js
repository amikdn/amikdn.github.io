(function () {
    'use strict';

    // Основной объект плагина
    var CinemaAmikdn = {
        name: 'cinemaamikdn',
        version: '2.1.1',
        debug: true,
        settings: {
            enabled: true,
            show_ru: true,
            show_en: true
        }
    };

    // Список русских кинотеатров
    var RU_CINEMAS = [
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
    // Список иностранных кинотеатров
    var EN_CINEMAS = [
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

    // Локализация
    function addLocalization() {
        if (Lampa && Lampa.Lang) {
            Lampa.Lang.add({
                cinemaamikdn_ru: {
                    ru: 'RU Кинотеатры',
                    en: 'RU Cinemas'
                },
                cinemaamikdn_en: {
                    ru: 'EN Кинотеатры',
                    en: 'EN Cinemas'
                },
                cinemaamikdn_title: {
                    ru: 'Онлайн кинотеатры',
                    en: 'Online Cinemas'
                }
            });
        }
    }

    // SVG иконки
    function getSVGIcon(type) {
        if (type === 'ru') {
            return '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="8" y="0" fill="#fff"/><rect width="24" height="8" y="8" fill="#0039a6"/><rect width="24" height="8" y="16" fill="#d52b1e"/></svg>';
        } else {
            return '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="#00247d"/><text x="12" y="16" font-size="12" fill="#fff" text-anchor="middle" font-family="Arial">EN</text></svg>';
        }
    }

    // Удалить кнопки из главного меню
    function removeMenuButtons() {
        $('.cinemaamikdn-btn-ru').remove();
        $('.cinemaamikdn-btn-en').remove();
    }

    // Добавление кнопок в главное меню (в стиле @cinemas.js)
    function addMenuButtons() {
        if (CinemaAmikdn.debug) {
            console.log('cinemaamikdn: addMenuButtons вызвана');
            console.log('cinemaamikdn: show_ru =', CinemaAmikdn.settings.show_ru);
            console.log('cinemaamikdn: show_en =', CinemaAmikdn.settings.show_en);
        }

        // Удаляем существующие кнопки, если они есть
        $('.menu__item.cinemaamikdn-btn-ru, .menu__item.cinemaamikdn-btn-en').remove();

        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) {
            if (CinemaAmikdn.debug) {
                console.log('cinemaamikdn: меню не найдено');
            }
            return;
        }

        // RU Кинотеатры
        if (String(CinemaAmikdn.settings.show_ru).toLowerCase() !== 'false') {
            if (CinemaAmikdn.debug) {
                console.log('cinemaamikdn: добавляем RU кнопку');
            }
            var icoRU = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
                <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" 
                      font-weight="700" fill="currentColor" dominant-baseline="middle">
                    RU
                </text>
            </svg>`;
            var $btnRU = $(`
                <li class="menu__item selector cinemaamikdn-btn-ru">
                    <div class="menu__ico">${icoRU}</div>
                    <div class="menu__text">Кинотеатры</div>
                </li>
            `);
            $btnRU.on('hover:enter', function () {
                openCinemasModal('ru');
            });
            $menu.append($btnRU);
        }

        // EN Кинотеатры
        if (String(CinemaAmikdn.settings.show_en).toLowerCase() !== 'false') {
            if (CinemaAmikdn.debug) {
                console.log('cinemaamikdn: добавляем EN кнопку');
            }
            var icoEN = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
                <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" 
                      font-weight="700" fill="currentColor" dominant-baseline="middle">
                    EN
                </text>
            </svg>`;
            var $btnEN = $(`
                <li class="menu__item selector cinemaamikdn-btn-en">
                    <div class="menu__ico">${icoEN}</div>
                    <div class="menu__text">Кинотеатры</div>
                </li>
            `);
            $btnEN.on('hover:enter', function () {
                openCinemasModal('en');
            });
            $menu.append($btnEN);
        }
    }

    // Получить объект сети TMDB по networkId
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

    // Получить logo_path из Lampa.TMDB.networks
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

    // Получить логотип (асинхронно): только из кэша Lampa.TMDB.networks, иначе буква
    function getCinemaLogo(networkId, name, callback) {
        var logoPath = getLogoPathFromCache(networkId);
        if (logoPath) {
            var url = Lampa.TMDB && Lampa.TMDB.image ? Lampa.TMDB.image('t/p/w300' + logoPath) : 'https://image.tmdb.org/t/p/w300' + logoPath;
            callback('<img src="' + url + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
            return;
        }
        // Пробуем через прокси (как в @cinemas.js)
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

    // Открытие каталога только сериалов по networkId
    function openCinemaCatalog(networkId, name) {
        var sort = CinemaAmikdn.settings.sort_mode;
        // Для сериалов корректируем сортировку по дате
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

    // --- Контроллер для карточек кинотеатров ---
    function activateCardsController($container) {
        var name = 'cinemaamikdn-cards';
        var $cards = $container.find('.cinemaamikdn-card.selector');
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
                // Прокрутка к карточке, если она не видна
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

    // Открытие модального окна с кинотеатрами (с логотипами и фильтрацией)
    function openCinemasModal(type) {
        var cinemas = type === 'ru' ? RU_CINEMAS : EN_CINEMAS;
        var enabled = type === 'ru' ? CinemaAmikdn.settings.ru_cinemas : CinemaAmikdn.settings.en_cinemas;
        var filtered = [];
        for (var i = 0; i < cinemas.length; i++) {
            if (enabled[cinemas[i].networkId]) filtered.push(cinemas[i]);
        }
        var titleText = type === 'ru' ? 'Русские онлайн кинотеатры' : 'Иностранные онлайн кинотеатры';
        var svgIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#00dbde" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="#fc00ff"/></svg>';
        var $header = $('<div class="cinemaamikdn-modal-header"></div>');
        $header.append(svgIcon);
        $header.append('<span class="cinemaamikdn-modal-title">' + titleText + '</span>');
        var $container = $('<div class="cinemaamikdn-cards"></div>');
        for (var j = 0; j < filtered.length; j++) {
            (function (c) {
                var $card = $('<div class="cinemaamikdn-card selector"></div>');
                var $logo = $('<div class="cinemaamikdn-card__logo"></div>');
                getCinemaLogo(c.networkId, c.name, function(logoHtml) {
                    $logo.html(logoHtml);
                });
                $card.append($logo);
                $card.append('<div class="cinemaamikdn-card__name">' + c.name + '</div>');
                $card.on('hover:enter', function () {
                    Lampa.Modal.close();
                    openCinemaCatalog(c.networkId, c.name);
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

    // Добавление стилей
    function addStyles() {
        var style = '<style id="cinemaamikdn-styles">'
            + '.cinemaamikdn-cards { max-height: 70vh; overflow-y: auto; display: flex; flex-wrap: wrap; justify-content: center; border-radius: 18px; }'
            + '.cinemaamikdn-card { width: 120px; height: 120px; background: rgba(24,24,40,0.95); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: box-shadow 0.2s, background 0.2s; margin: 12px; box-shadow: 0 2px 12px rgba(233, 64, 87, 0.08); border: 1.5px solid rgba(233, 64, 87, 0.08); }'
            + '.cinemaamikdn-card.selector:focus, .cinemaamikdn-card.selector:hover { box-shadow: 0 0 24px #e94057, 0 0 30px #f27121; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); outline: none; border: 1.5px solid #e94057; }'
            + '.cinemaamikdn-card__logo { width: 84px; height: 84px; background: #918d8db8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #222; font-weight: bold; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(233, 64, 87, 0.08); }'
            + '.cinemaamikdn-card__name { color: #fff; font-size: 16px; text-align: center; text-shadow: 0 2px 8px rgba(233, 64, 87, 0.15); }'
            + '.cinemaamikdn-modal-header { display: flex; flex-direction: row; align-items: center; justify-content: center; margin-bottom: 28px; width: 100%; }'
            + '.cinemaamikdn-modal-header svg { width: 34px !important; height: 34px !important; min-width: 34px; min-height: 34px; max-width: 34px; max-height: 34px; display: inline-block; flex-shrink: 0; margin-right: 16px; }'
            + '.cinemaamikdn-modal-title { font-size: 1.6em; font-weight: bold; color: #fff; background: linear-gradient(90deg, #8a2387, #e94057, #f27121); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; max-width: 90vw; word-break: break-word; white-space: normal; display: inline-block; text-shadow: 0 2px 8px rgba(233, 64, 87, 0.15); }'
            + '@media (max-width: 600px) { .cinemaamikdn-modal-title { font-size: 1em; } }'
            + '</style>';
        if (!$('#cinemaamikdn-styles').length) $('head').append(style);
    }

    // --- НАСТРОЙКИ ---
    var STORAGE_KEY = 'cinemaamikdn_settings';
    // Список режимов сортировки TMDB
    var SORT_MODES = {
        'popularity.desc': 'Популярные',
        'release_date.desc': 'По дате (новые)',
        'release_date.asc': 'По дате (старые)',
        'vote_average.desc': 'По рейтингу',
        'vote_count.desc': 'По количеству голосов'
    };

    // Загрузка настроек из localStorage
    function loadSettings() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (CinemaAmikdn.debug) {
            console.log('cinemaamikdn: загружаем настройки из localStorage', saved);
        }
        if (saved) {
            try {
                var obj = JSON.parse(saved);
                for (var k in obj) {
                    CinemaAmikdn.settings[k] = obj[k];
                    if (CinemaAmikdn.debug) {
                        console.log('cinemaamikdn: загружена настройка', k, '=', obj[k]);
                    }
                }
            } catch (e) {
                if (CinemaAmikdn.debug) {
                    console.error('cinemaamikdn: ошибка при загрузке настроек', e);
                }
            }
        }
        // Для каждого кинотеатра отдельная настройка
        if (!CinemaAmikdn.settings.ru_cinemas) {
            CinemaAmikdn.settings.ru_cinemas = {};
            for (var i = 0; i < RU_CINEMAS.length; i++) {
                CinemaAmikdn.settings.ru_cinemas[RU_CINEMAS[i].networkId] = true;
            }
        }
        if (!CinemaAmikdn.settings.en_cinemas) {
            CinemaAmikdn.settings.en_cinemas = {};
            for (var j = 0; j < EN_CINEMAS.length; j++) {
                CinemaAmikdn.settings.en_cinemas[EN_CINEMAS[j].networkId] = true;
            }
        }
        if (!CinemaAmikdn.settings.sort_mode) {
            CinemaAmikdn.settings.sort_mode = 'popularity.desc';
        }
        // Инициализация настроек отображения кнопок
        if (typeof CinemaAmikdn.settings.show_ru === 'undefined') {
            CinemaAmikdn.settings.show_ru = true;
        }
        if (typeof CinemaAmikdn.settings.show_en === 'undefined') {
            CinemaAmikdn.settings.show_en = true;
        }
        if (CinemaAmikdn.debug) {
            console.log('cinemaamikdn: итоговые настройки', CinemaAmikdn.settings);
        }
    }

    // Сохранение настроек
    function saveSettings() {
        if (CinemaAmikdn.debug) console.log('cinemaamikdn: сохраняем настройки', CinemaAmikdn.settings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CinemaAmikdn.settings));
    }

    // Модальное окно для включения/отключения RU кинотеатров
    function showRuCinemasSettings() {
        var $container = $('<div class="cinemaamikdn-cinema-btns" style="display:flex;flex-direction:column;align-items:center;padding:20px;"></div>');
        for (var i = 0; i < RU_CINEMAS.length; i++) {
            (function(c, idx) {
                var enabled = CinemaAmikdn.settings.ru_cinemas[c.networkId];
                var $btn = $('<div class="cinemaamikdn-cinema-btn selector" tabindex="' + (idx === 0 ? '0' : '-1') + '"></div>');
                var icon = enabled ? '<span class="cinemaamikdn-cinema-btn__icon">✔</span>' : '<span class="cinemaamikdn-cinema-btn__icon">✖</span>';
                var nameHtml = '<span class="cinemaamikdn-cinema-btn__name">' + c.name + '</span>';
                $btn.toggleClass('enabled', enabled);
                $btn.html(icon + nameHtml);
                $btn.on('hover:enter', function() {
                    var now = !CinemaAmikdn.settings.ru_cinemas[c.networkId];
                    CinemaAmikdn.settings.ru_cinemas[c.networkId] = now;
                    saveSettings();
                    $btn.toggleClass('enabled', now);
                    var icon = now ? '<span class="cinemaamikdn-cinema-btn__icon">✔</span>' : '<span class="cinemaamikdn-cinema-btn__icon">✖</span>';
                    $btn.html(icon + nameHtml);
                });
                $container.append($btn);
            })(RU_CINEMAS[i], i);
        }
        Lampa.Modal.open({
            title: 'Включение RU Кинотеатров',
            html: $container,
            size: 'small',
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings');
            }
        });
        setTimeout(function() {
            var $btns = $container.find('.cinemaamikdn-cinema-btn');
            var name = 'cinemaamikdn-ru-btns';
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

    // Модальное окно для включения/отключения EN кинотеатров
    function showEnCinemasSettings() {
        var $container = $('<div class="cinemaamikdn-cinema-btns" style="display:flex;flex-direction:column;align-items:center;padding:20px;"></div>');
        for (var i = 0; i < EN_CINEMAS.length; i++) {
            (function(c, idx) {
                var enabled = CinemaAmikdn.settings.en_cinemas[c.networkId];
                var $btn = $('<div class="cinemaamikdn-cinema-btn selector" tabindex="' + (idx === 0 ? '0' : '-1') + '"></div>');
                var icon = enabled ? '<span class="cinemaamikdn-cinema-btn__icon">✔</span>' : '<span class="cinemaamikdn-cinema-btn__icon">✖</span>';
                var nameHtml = '<span class="cinemaamikdn-cinema-btn__name">' + c.name + '</span>';
                $btn.toggleClass('enabled', enabled);
                $btn.html(icon + nameHtml);
                $btn.on('hover:enter', function() {
                    var now = !CinemaAmikdn.settings.en_cinemas[c.networkId];
                    CinemaAmikdn.settings.en_cinemas[c.networkId] = now;
                    saveSettings();
                    $btn.toggleClass('enabled', now);
                    var icon = now ? '<span class="cinemaamikdn-cinema-btn__icon">✔</span>' : '<span class="cinemaamikdn-cinema-btn__icon">✖</span>';
                    $btn.html(icon + nameHtml);
                });
                $container.append($btn);
            })(EN_CINEMAS[i], i);
        }
        Lampa.Modal.open({
            title: 'Включение EN Кинотеатров',
            html: $container,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings');
            }
        });
        setTimeout(function() {
            var $btns = $container.find('.cinemaamikdn-cinema-btn');
            var name = 'cinemaamikdn-en-btns';
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

    // Основной компонент настроек
    function addSettingsComponent() {
        Lampa.SettingsApi.addComponent({
            component: 'cinemaamikdn',
            name: 'Онлайн кинотеатры',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="currentColor"/></svg>'
        });
        // О плагине
        Lampa.SettingsApi.addParam({
            component: 'cinemaamikdn',
            param: { type: 'button', component: 'about' },
            field: { name: 'О плагине', description: 'Информация и поддержка' },
            onChange: showAbout
        });
        // Показывать RU Кинотеатры на главной
        Lampa.SettingsApi.addParam({
            component: 'cinemaamikdn',
            param: { name: 'show_ru', type: 'trigger', default: CinemaAmikdn.settings.show_ru },
            field: { name: 'Показывать RU Кинотеатры на главной' },
            onChange: function(val) {
                if (CinemaAmikdn.debug) {
                    console.log('cinemaamikdn: show_ru изменено на', val);
                }
                CinemaAmikdn.settings.show_ru = val;
                saveSettings();
                refreshMenuButtons();
            }
        });
        // Показывать EN Кинотеатры на главной
        Lampa.SettingsApi.addParam({
            component: 'cinemaamikdn',
            param: { name: 'show_en', type: 'trigger', default: CinemaAmikdn.settings.show_en },
            field: { name: 'Показывать EN Кинотеатры на главной' },
            onChange: function(val) {
                if (CinemaAmikdn.debug) {
                    console.log('cinemaamikdn: show_en изменено на', val);
                }
                CinemaAmikdn.settings.show_en = val;
                saveSettings();
                refreshMenuButtons();
            }
        });
        // Кнопка для отдельного меню RU
        Lampa.SettingsApi.addParam({
            component: 'cinemaamikdn',
            param: { type: 'button', component: 'ru_cinemas_list' },
            field: { name: 'Включение RU Кинотеатров', description: 'Выбрать какие RU сервисы показывать' },
            onChange: showRuCinemasSettings
        });
        // Кнопка для отдельного меню EN
        Lampa.SettingsApi.addParam({
            component: 'cinemaamikdn',
            param: { type: 'button', component: 'en_cinemas_list' },
            field: { name: 'Включение EN Кинотеатров', description: 'Выбрать какие EN сервисы показывать' },
            onChange: showEnCinemasSettings
        });
        // Режим сортировки
        Lampa.SettingsApi.addParam({
            component: 'cinemaamikdn',
            param: {
                name: 'sort_mode',
                type: 'select',
                values: SORT_MODES,
                default: CinemaAmikdn.settings.sort_mode
            },
            field: { name: 'Режим сортировки' },
            onChange: function(val) {
                CinemaAmikdn.settings.sort_mode = val;
                saveSettings();
            }
        });
    }

    // Функция для полного обновления кнопок меню
    function refreshMenuButtons() {
        $('.menu__item.cinemaamikdn-btn-ru, .menu__item.cinemaamikdn-btn-en').remove();
        addMenuButtons();
    }

    // Инициализация
    function startPlugin() {
        loadSettings();
        addLocalization();
        addStyles();
        addSettingsComponent();
        if (CinemaAmikdn.debug) {
            console.log('cinemaamikdn: настройки загружены', CinemaAmikdn.settings);
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
        // Новый слушатель: обновлять кнопки при каждом открытии меню
        Lampa.Listener.follow('menu', function(e) {
            if (e.type === 'open') {
                refreshMenuButtons();
            }
        });
        if (CinemaAmikdn.debug) {
            console.log('cinemaamikdn: плагин инициализирован');
        }
    }

    startPlugin();

    // Экспорт
    window.cinemaamikdn = CinemaAmikdn;

})();
