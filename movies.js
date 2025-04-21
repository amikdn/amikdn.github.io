(function () {
    'use strict';

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

    var RU_MOVIES = [
        { name: 'Start',      networkId: '2493' },
        { name: 'Premier',    networkId: '2859' },
        { name: 'KION',       networkId: '4085' },
        { name: 'Okko',       networkId: '3871' },
        { name: 'КиноПоиск',  networkId: '3827' },
        { name: 'Wink',       networkId: '5806' },
        { name: 'ИВИ',        networkId: '3923' },
        { name: 'Смотрим',    networkId: '5000' },
        { name: 'Первый',     networkId: '558'  },
        { name: 'СТС',        networkId: '806'  },
        { name: 'ТНТ',        networkId: '1191' },
        { name: 'Пятница',    networkId: '3031' },
        { name: 'Россия 1',   networkId: '412'  },
        { name: 'НТВ',        networkId: '1199' }
    ];

    var EN_MOVIES = [
        { name: 'Netflix',         networkId: '213'  },
        { name: 'Apple TV',        networkId: '2552' },
        { name: 'HBO',             networkId: '49'   },
        { name: 'SyFy',            networkId: '77'   },
        { name: 'NBC',             networkId: '6'    },
        { name: 'TV New Zealand',  networkId: '1376' },
        { name: 'Hulu',            networkId: '453'  },
        { name: 'ABC',             networkId: '49'   },
        { name: 'CBS',             networkId: '16'   },
        { name: 'Amazon Prime',    networkId: '1024' }
    ];

    function addLocalization () {
        if (Lampa && Lampa.Lang) {
            Lampa.Lang.add({
                movieamikdn_ru:    { ru: 'RU Movies',     en: 'RU Movies'    },
                movieamikdn_en:    { ru: 'EN Movies',     en: 'EN Movies'    },
                movieamikdn_title: { ru: 'Online Movies', en: 'Online Movies'}
            });
        }
    }

    /*
     *  SVG‑иконки для RU / EN
     */
    function getSVGIcon (type) {
        return type === 'ru'
            ? '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="8" y="0" fill="#fff"/><rect width="24" height="8" y="8" fill="#0039a6"/><rect width="24" height="8" y="16" fill="#d52b1e"/></svg>'
            : '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="#00247d"/><text x="12" y="16" font-size="12" fill="#fff" text-anchor="middle" font-family="Arial">EN</text></svg>';
    }

    function removeMenuButtons () {
        $('.movieamikdn-btn-ru, .movieamikdn-btn-en').remove();
    }

    function addMenuButtons () {
        if (MovieAmikdn.debug) console.log('movieamikdn: addMenuButtons');

        removeMenuButtons();

        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) {
            if (MovieAmikdn.debug) console.log('movieamikdn: меню не найдено');
            return;
        }

        // --- RU кнопка ---
        if (MovieAmikdn.settings.show_ru) {
            var $btnRU = $(`
                <li class="menu__item selector movieamikdn-btn-ru">
                    <div class="menu__ico">${getSVGIcon('ru')}</div>
                    <div class="menu__text">Movies</div>
                </li>`);
            $btnRU.on('hover:enter', function () { openMoviesModal('ru'); });
            $menu.append($btnRU);
        }

        // --- EN кнопка ---
        if (MovieAmikdn.settings.show_en) {
            var $btnEN = $(`
                <li class="menu__item selector movieamikdn-btn-en">
                    <div class="menu__ico">${getSVGIcon('en')}</div>
                    <div class="menu__text">Movies</div>
                </li>`);
            $btnEN.on('hover:enter', function () { openMoviesModal('en'); });
            $menu.append($btnEN);
        }
    }

    function getLogoPathFromCache (networkId) {
        if (!(Lampa && Lampa.TMDB && Lampa.TMDB.networks)) return null;
        for (var i = 0; i < Lampa.TMDB.networks.length; i++) {
            if (String(Lampa.TMDB.networks[i].id) === String(networkId)) {
                return Lampa.TMDB.networks[i].logo_path || null;
            }
        }
        return null;
    }

    function getMovieLogo (networkId, name, cb) {
        var logoPath = getLogoPathFromCache(networkId);
        if (logoPath) {
            var url = (Lampa.TMDB && Lampa.TMDB.image)
                ? Lampa.TMDB.image('t/p/w300' + logoPath)
                : 'https://image.tmdb.org/t/p/w300' + logoPath;
            cb('<img src="' + url + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
            return;
        }
        var apiUrl = Lampa.TMDB.api('network/' + networkId + '?api_key=' + Lampa.TMDB.key());
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                if (data && data.logo_path) {
                    var imgUrl = (Lampa.TMDB && Lampa.TMDB.image)
                        ? Lampa.TMDB.image('t/p/w300' + data.logo_path)
                        : 'https://image.tmdb.org/t/p/w300' + data.logo_path;
                    cb('<img src="' + imgUrl + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
                } else {
                    cb('<div style="font-size:22px;line-height:44px;color:#222;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + name.charAt(0) + '</div>');
                }
            },
            error: function () {
                cb('<div style="font-size:22px;line-height:68px;color:#222;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + name.charAt(0) + '</div>');
            }
        });
    }

    function openMovieCatalog (networkId, name) {
        var sort = MovieAmikdn.settings.sort_mode;
        if (sort === 'release_date.desc') sort = 'first_air_date.desc';
        if (sort === 'release_date.asc')  sort = 'first_air_date.asc';
        Lampa.Activity.push({
            url:       'discover/tv',
            title:     name,
            networks:  networkId,
            sort_by:   sort,
            component: 'category_full',
            source:    'tmdb',
            card_type: true,
            page:      1
        });
    }

    function activateCardsController ($root) {
        var ctrlName = 'movieamikdn-cards';
        var $cards   = $root.find('.movieamikdn-card.selector');
        var last = 0;

        function perRow () {
            if ($cards.length < 2) return 1;
            var top0 = $cards.eq(0).offset().top;
            for (var i = 1; i < $cards.length; i++) if ($cards.eq(i).offset().top !== top0) return i;
            return $cards.length;
        }
        function focus (idx) {
            $cards.removeClass('focus').attr('tabindex', '-1');
            if (!$cards.eq(idx).length) return;
            $cards.eq(idx).addClass('focus').attr('tabindex', '0').focus();
            var el = $cards.get(idx);
            if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            last = idx;
        }

        Lampa.Controller.add(ctrlName, {
            toggle ()        { Lampa.Controller.collectionSet($root); focus(last); },
            up     ()        { var i = last - perRow(); if (i >= 0) focus(i); },
            down   ()        { var i = last + perRow(); if (i < $cards.length) focus(i); },
            left   ()        { if (last > 0) focus(last - 1); },
            right  ()        { if (last < $cards.length - 1) focus(last + 1); },
            back   ()        { Lampa.Modal.close(); Lampa.Controller.toggle('menu'); },
            enter  ()        { $cards.eq(last).trigger('hover:enter'); }
        });

        Lampa.Controller.toggle(ctrlName);
    }

    /*
     *  Модальное окно со списком сервисов (карточки‑логотипы)
     */
    function openMoviesModal (type) {
        var list     = type === 'ru' ? RU_MOVIES : EN_MOVIES;
        var enabled  = type === 'ru' ? MovieAmikdn.settings.ru_movies : MovieAmikdn.settings.en_movies;
        var filtered = list.filter(function (m) { return enabled[m.networkId]; });

        var title = (type === 'ru' ? 'Русские' : 'Зарубежные') + ' онлайн‑сервисы';
        var $header = $('<div class="movieamikdn-modal-header"></div>')
            .append('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#00dbde" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="#fc00ff"/></svg>')
            .append('<span class="movieamikdn-modal-title">' + title + '</span>');

        var $cards = $('<div class="movieamikdn-cards"></div>');
        filtered.forEach(function (svc) {
            var $card  = $('<div class="movieamikdn-card selector"></div>');
            var $logo  = $('<div class="movieamikdn-card__logo"></div>');
            getMovieLogo(svc.networkId, svc.name, function (html) { $logo.html(html); });
            $card.append($logo).append('<div class="movieamikdn-card__name">' + svc.name + '</div>');
            $card.on('hover:enter', function () {
                Lampa.Modal.close();
                openMovieCatalog(svc.networkId, svc.name);
            });
            $cards.append($card);
        });

        var $wrap = $('<div></div>').append($header).append($cards);
        Lampa.Modal.open({
            html:   $wrap,
            title:  '',
            size:   'full',
            onBack: function () { Lampa.Modal.close(); Lampa.Controller.toggle('menu'); }
        });

        setTimeout(function () { activateCardsController($cards); }, 100);
    }

    /*
     *  Модальные окна для включения / отключения сервисов (RU / EN)
     */
    function buildToggleModal (type) {
        var LIST    = type === 'ru' ? RU_MOVIES : EN_MOVIES;
        var STATE   = type === 'ru' ? MovieAmikdn.settings.ru_movies : MovieAmikdn.settings.en_movies;
        var title   = 'Включение ' + (type === 'ru' ? 'RU' : 'EN') + ' Муви';
        var size    = type === 'ru' ? 'small' : 'medium';

        var $cont = $('<div class="movieamikdn-movie-btns" style="display:flex;flex-direction:column;align-items:center;padding:20px;"></div>');
        LIST.forEach(function (svc, idx) {
            var on  = !!STATE[svc.networkId];
            var $btn = $('<div class="movieamikdn-movie-btn selector" tabindex="' + (idx === 0 ? '0' : '-1') + '"></div>');
            function render () {
                var icon = on ? '✔' : '✖';
                $btn.html('<span class="movieamikdn-movie-btn__icon">' + icon + '</span><span class="movieamikdn-movie-btn__name">' + svc.name + '</span>');
                $btn.toggleClass('enabled', on);
            }
            render();
            $btn.on('hover:enter', function () {
                on = !on;
                STATE[svc.networkId] = on;
                saveSettings();
                render();
            });
            $cont.append($btn);
        });

        Lampa.Modal.open({
            title: title,
            html:  $cont,
            size:  size,
            onBack: function () { Lampa.Modal.close(); Lampa.Controller.toggle('settings'); }
        });

        setTimeout(function () {
            var $btns = $cont.find('.movieamikdn-movie-btn');
            var ctrl  = 'movieamikdn-' + type + '-btns';
            var pos   = 0;
            function foc (i) {
                $btns.removeClass('focus').attr('tabindex', '-1');
                $btns.eq(i).addClass('focus').attr('tabindex', '0').focus();
                pos = i;
            }
            Lampa.Controller.add(ctrl, {
                toggle () { Lampa.Controller.collectionSet($btns); foc(pos); },
                up    () { if (pos > 0) foc(pos - 1); },
                down  () { if (pos < $btns.length - 1) foc(pos + 1); },
                back  () { Lampa.Modal.close(); Lampa.Controller.toggle('settings'); },
                enter () { $btns.eq(pos).trigger('hover:enter'); }
            });
            Lampa.Controller.toggle(ctrl);
        }, 100);
    }

    function showRuMoviesSettings () { buildToggleModal('ru'); }
    function showEnMoviesSettings () { buildToggleModal('en'); }

    /*
     *  Стили (минимально то, что необходимо)
     */
    function addStyles () {
        var css = '<style id="movieamikdn-styles">'
            + '.movieamikdn-cards{max-height:70vh;overflow-y:auto;display:flex;flex-wrap:wrap;justify-content:center;border-radius:18px;}'
            + '.movieamikdn-card{width:120px;height:120px;background:rgba(24,24,40,.95);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:.2s;margin:12px;box-shadow:0 2px 12px rgba(233,64,87,.08);border:1.5px solid rgba(233,64,87,.08);}'
            + '.movieamikdn-card.selector:hover,.movieamikdn-card.selector:focus{box-shadow:0 0 24px #e94057,0 0 30px #f27121;background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);outline:none;border-color:#e94057;}'
            + '.movieamikdn-card__logo{width:84px;height:84px;background:#918d8db8;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;color:#222;font-weight:bold;margin-bottom:10px;box-shadow:0 2px 8px rgba(233,64,87,.08);}'
            + '.movieamikdn-card__name{color:#fff;font-size:16px;text-align:center;text-shadow:0 2px 8px rgba(233,64,87,.15);}'
            + '.movieamikdn-modal-header{display:flex;align-items:center;justify-content:center;margin-bottom:28px;width:100%;}'
            + '.movieamikdn-modal-header svg{width:34px;height:34px;margin-right:16px;flex-shrink:0;}'
            + '.movieamikdn-modal-title{font-size:1.6em;font-weight:bold;background:linear-gradient(90deg,#8a2387,#e94057,#f27121);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(233,64,87,.15);}'
            + '.movieamikdn-movie-btn{max-width:500px;min-width:260px;margin:0 auto 18px;display:flex;align-items:center;padding:0 0 0 32px;height:68px;font-size:1.6em;color:#888;background:rgba(24,24,40,.95);border-radius:14px;transition:.2s;}'
            + '.movieamikdn-movie-btn__icon{font-size:1.3em;margin-right:24px;width:32px;display:flex;align-items:center;justify-content:center;}'
            + '.movieamikdn-movie-btn.enabled .movieamikdn-movie-btn__icon{color:#fff;}'
            + '.movieamikdn-movie-btn.enabled .movieamikdn-movie-btn__name{color:#fff;}'
            + '.movieamikdn-movie-btn.focus{background:linear-gradient(90deg,#e94057 0%,#f27121 100%);color:#fff !important;outline:none;box-shadow:0 0 0 2px #e94057,0 0 12px #f27121;}'
            + '</style>';
        if (!$('#movieamikdn-styles').length) $('head').append(css);
    }

    var STORAGE_KEY = 'movieamikdn_settings';

    var SORT_MODES = {
        'popularity.desc':  'Популярные',
        'release_date.desc':'По дате (новые)',
        'release_date.asc': 'По дате (старые)',
        'vote_average.desc':'По рейтингу',
        'vote_count.desc':  'По количеству голосов'
    };

    function loadSettings () {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) try { Object.assign(MovieAmikdn.settings, JSON.parse(saved)); } catch (e) {}

        if (!MovieAmikdn.settings.ru_movies) {
            MovieAmikdn.settings.ru_movies = {};
            RU_MOVIES.forEach(function (s) { MovieAmikdn.settings.ru_movies[s.networkId] = true; });
        }
        if (!MovieAmikdn.settings.en_movies) {
            MovieAmikdn.settings.en_movies = {};
            EN_MOVIES.forEach(function (s) { MovieAmikdn.settings.en_movies[s.networkId] = true; });
        }
        if (!MovieAmikdn.settings.sort_mode) MovieAmikdn.settings.sort_mode = 'popularity.desc';
    }

    function saveSettings () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MovieAmikdn.settings));
        if (MovieAmikdn.debug) console.log('movieamikdn: settings saved');
    }

    function addSettingsComponent () {
        Lampa.SettingsApi.addComponent({
            component: 'movieamikdn',
            name:      'Онлайн муви',
            icon:      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { name: 'show_ru', type: 'trigger', default: MovieAmikdn.settings.show_ru },
            field: { name: 'Показывать RU‑Movies на главной' },
            onChange (v) { MovieAmikdn.settings.show_ru = v; saveSettings(); refreshMenuButtons(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { name: 'show_en', type: 'trigger', default: MovieAmikdn.settings.show_en },
            field: { name: 'Показывать EN‑Movies на главной' },
            onChange (v) { MovieAmikdn.settings.show_en = v; saveSettings(); refreshMenuButtons(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { type: 'button', component: 'ru_movies_list' },
            field: { name: 'Включение RU‑муви', description: 'Выберите, какие RU сервисы показывать' },
            onChange: showRuMoviesSettings
        });

        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: { type: 'button', component: 'en_movies_list' },
            field: { name: 'Включение EN‑муви', description: 'Выберите, какие EN сервисы показывать' },
            onChange: showEnMoviesSettings
        });

        Lampa.SettingsApi.addParam({
            component: 'movieamikdn',
            param: {
                name:    'sort_mode',
                type:    'select',
                values:  SORT_MODES,
                default: MovieAmikdn.settings.sort_mode
            },
            field: { name: 'Режим сортировки' },
            onChange (v) { MovieAmikdn.settings.sort_mode = v; saveSettings(); }
        });
    }

    function refreshMenuButtons () {
        removeMenuButtons();
        addMenuButtons();
    }

    function startPlugin () {
        loadSettings();
        addLocalization();
        addStyles();
        addSettingsComponent();

        if (MovieAmikdn.debug) console.log('movieamikdn: init complete', MovieAmikdn.settings);

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') setTimeout(refreshMenuButtons, 1000);
        });
        Lampa.Listener.follow('settings', function (e) {
            if (e.type === 'update') refreshMenuButtons();
        });
        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'open') refreshMenuButtons();
        });
    }

    startPlugin();

    window.movieamikdn = MovieAmikdn;

})();
