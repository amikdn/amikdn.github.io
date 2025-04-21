(function () {
    'use strict';

    // Основной объект плагина
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

    // Список русских онлайн‑сервисов
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
    // Список иностранных онлайн‑сервисов
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

    // Локализация
    function addLocalization() {
        if (Lampa && Lampa.Lang) {
            Lampa.Lang.add({
                movieamikdn_ru: {
                    ru: 'RU Онлайн‑кино',
                    en: 'RU Movies'
                },
                movieamikdn_en: {
                    ru: 'EN Онлайн‑кино',
                    en: 'EN Movies'
                },
                movieamikdn_title: {
                    ru: 'Онлайн‑сервисы',
                    en: 'Online Services'
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
        $('.movieamikdn-btn-ru').remove();
        $('.movieamikdn-btn-en').remove();
    }

    // Добавление кнопок в главное меню
    function addMenuButtons() {
        if (MovieAmikdn.debug) {
            console.log('movieamikdn: addMenuButtons вызвана');
            console.log('movieamikdn: show_ru =', MovieAmikdn.settings.show_ru);
            console.log('movieamikdn: show_en =', MovieAmikdn.settings.show_en);
        }

        // Удаляем существующие кнопки, если они есть
        $('.menu__item.movieamikdn-btn-ru, .menu__item.movieamikdn-btn-en').remove();

        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) {
            if (MovieAmikdn.debug) console.log('movieamikdn: меню не найдено');
            return;
        }

        // RU
        if (String(MovieAmikdn.settings.show_ru).toLowerCase() !== 'false') {
            var icoRU = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="currentColor" dominant-baseline="middle">RU</text></svg>`;
            var $btnRU = $(`
                <li class="menu__item selector movieamikdn-btn-ru">
                    <div class="menu__ico">${icoRU}</div>
                    <div class="menu__text">Онлайн‑кино</div>
                </li>`);
            $btnRU.on('hover:enter', function() { openMoviesModal('ru'); });
            $menu.append($btnRU);
        }

        // EN
        if (String(MovieAmikdn.settings.show_en).toLowerCase() !== 'false') {
            var icoEN = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="currentColor" dominant-baseline="middle">EN</text></svg>`;
            var $btnEN = $(`
                <li class="menu__item selector movieamikdn-btn-en">
                    <div class="menu__ico">${icoEN}</div>
                    <div class="menu__text">Онлайн‑кино</div>
                </li>`);
            $btnEN.on('hover:enter', function() { openMoviesModal('en'); });
            $menu.append($btnEN);
        }
    }

    // Получить объект сети TMDB
    function getNetworkData(networkId) {
        if (Lampa && Lampa.TMDB && Lampa.TMDB.networks) {
            return Lampa.TMDB.networks.find(function(n) { return String(n.id) === String(networkId); });
        }
        return null;
    }

    // Получить logo_path из кэша
    function getLogoPathFromCache(networkId) {
        var n = getNetworkData(networkId);
        return n ? n.logo_path || null : null;
    }

    // Получить логотип
    function getMovieLogo(networkId, name, cb) {
        var logo = getLogoPathFromCache(networkId);
        if (logo) {
            var url = Lampa.TMDB && Lampa.TMDB.image ? Lampa.TMDB.image('t/p/w300' + logo) : 'https://image.tmdb.org/t/p/w300' + logo;
            cb('<img src="' + url + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
            return;
        }
        var apiUrl = Lampa.TMDB.api('network/' + networkId + '?api_key=' + Lampa.TMDB.key());
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(d) {
                if (d && d.logo_path) {
                    var imgUrl = Lampa.TMDB && Lampa.TMDB.image ? Lampa.TMDB.image('t/p/w300' + d.logo_path) : 'https://image.tmdb.org/t/p/w300' + d.logo_path;
                    cb('<img src="' + imgUrl + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
                } else {
                    cb('<div style="font-size:22px;line-height:44px;color:#222;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + name.charAt(0) + '</div>');
                }
            },
            error: function() {
                cb('<div style="font-size:22px;line-height:68px;color:#222;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + name.charAt(0) + '</div>');
            }
        });
    }

    // Открыть каталог
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

    // --- Контроллер карточек ---
    function activateCardsController($c) {
        var name = 'movieamikdn-cards';
        var $cards = $c.find('.movieamikdn-card.selector');
        var last = 0;
        function perRow() {
            if ($cards.length < 2) return 1;
            var top = $cards.eq(0).offset().top;
            for (var i = 1; i < $cards.length; i++) if ($cards.eq(i).offset().top !== top) return i;
            return $cards.length;
        }
        function focus(idx) {
            $cards.removeClass('focus').attr('tabindex', '-1');
            if ($cards.eq(idx).length) {
                $cards.eq(idx).addClass('focus').attr('tabindex', '0').focus();
                var el = $cards.get(idx);
                if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                last = idx;
            }
        }
        Lampa.Controller.add(name, {
            toggle: function() { Lampa.Controller.collectionSet($c); focus(last); },
            up:    function() { var i = last - perRow(); if (i >= 0) focus(i); },
            down:  function() { var i = last + perRow(); if (i < $cards.length) focus(i); },
            left:  function() { if (last > 0) focus(last - 1); },
            right: function() { if (last + 1 < $cards.length) focus(last + 1); },
            back:  function() { Lampa.Modal.close(); Lampa.Controller.toggle('menu'); },
            enter: function() { $cards.eq(last).trigger('hover:enter'); }
        });
        Lampa.Controller.toggle(name);
    }

    // Открытие модального окна
    function openMoviesModal(type) {
        var list   = type === 'ru' ? RU_MOVIES : EN_MOVIES;
        var enabled= type === 'ru' ? MovieAmikdn.settings.ru_movies : MovieAmikdn.settings.en_movies;
        var filt   = list.filter(function(it) { return enabled[it.networkId]; });
        var title  = type === 'ru' ? 'Русские сервисы' : 'Foreign services';
        var svg    = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#00dbde" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="#fc00ff"/></svg>';
        var $hdr   = $('<div class="movieamikdn-modal-header"></div>').append(svg).append('<span class="movieamikdn-modal-title">' + title + '</span>');
        var $cont  = $('<div class="movieamikdn-cards"></div>');
        filt.forEach(function(c) {
            var $card = $('<div class="movieamikdn-card selector"></div>');
            var $logo = $('<div class="movieamikdn-card__logo"></div>');
            getMovieLogo(c.networkId, c.name, function(html){ $logo.html(html); });
            $card.append($logo).append('<div class="movieamikdn-card__name">' + c.name + '</div>')
                 .on('hover:enter', function(){ Lampa.Modal.close(); openMovieCatalog(c.networkId, c.name); });
            $cont.append($card);
        });
        var $wrap = $('<div></div>').append($hdr).append($cont);
        Lampa.Modal.open({ title:'', html:$wrap, onBack:function(){ Lampa.Modal.close(); Lampa.Controller.toggle('menu'); }, size:'full' });
        setTimeout(function(){ activateCardsController($cont); },100);
    }

    // Стили
    function addStyles() {
        if ($('#movieamikdn-styles').length) return;
        var css = '<style id="movieamikdn-styles">'
            + '.movieamikdn-cards{max-height:70vh;overflow-y:auto;display:flex;flex-wrap:wrap;justify-content:center;border-radius:18px;}'
            + '.movieamikdn-card{width:120px;height:120px;background:rgba(24,24,40,.95);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:.2s;margin:12px;box-shadow:0 2px 12px rgba(233,64,87,.08);border:1.5px solid rgba(233,64,87,.08);}'
            + '.movieamikdn-card.selector:focus,.movieamikdn-card.selector:hover{box-shadow:0 0 24px #e94057,0 0 30px #f27121;background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);outline:none;border:1.5px solid #e94057;}'
            + '.movieamikdn-card__logo{width:84px;height:84px;background:#918d8db8;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;color:#222;font-weight:bold;margin-bottom:10px;box-shadow:0 2px 8px rgba(233,64,87,.08);}'
            + '.movieamikdn-card__name{color:#fff;font-size:16px;text-align:center;text-shadow:0 2px 8px rgba(233,64,87,.15);}'
            + '.movieamikdn-modal-header{display:flex;align-items:center;justify-content:center;margin-bottom:28px;width:100%;}'
            + '.movieamikdn-modal-header svg{width:34px;height:34px;flex-shrink:0;margin-right:16px;}'
            + '.movieamikdn-modal-title{font-size:1.6em;font-weight:bold;color:#fff;background:linear-gradient(90deg,#8a2387,#e94057,#f27121);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;max-width:90vw;white-space:normal;text-shadow:0 2px 8px rgba(233,64,87,.15);}'
            + '@media(max-width:600px){.movieamikdn-modal-title{font-size:1em;}}'
            + '</style>';
        $('head').append(css);
    }

    // --- НАСТРОЙКИ ---
    var STORAGE_KEY = 'movieamikdn_settings';
    var SORT_MODES = {
        'popularity.desc':'Популярные',
        'release_date.desc':'По дате (новые)',
        'release_date.asc':'По дате (старые)',
        'vote_average.desc':'По рейтингу',
        'vote_count.desc':'По количеству голосов'
    };

    function loadSettings() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (MovieAmikdn.debug) console.log('movieamikdn: load settings', saved);
        if (saved) try { Object.assign(MovieAmikdn.settings, JSON.parse(saved)); } catch(e) { console.error(e); }
        if (!MovieAmikdn.settings.ru_movies) {
            MovieAmikdn.settings.ru_movies = {};
            RU_MOVIES.forEach(function(c){ MovieAmikdn.settings.ru_movies[c.networkId] = true; });
        }
        if (!MovieAmikdn.settings.en_movies) {
            MovieAmikdn.settings.en_movies = {};
            EN_MOVIES.forEach(function(c){ MovieAmikdn.settings.en_movies[c.networkId] = true; });
        }
        if (!MovieAmikdn.settings.sort_mode) MovieAmikdn.settings.sort_mode = 'popularity.desc';
    }

    function saveSettings() {
        if (MovieAmikdn.debug) console.log('movieamikdn: save settings', MovieAmikdn.settings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MovieAmikdn.settings));
    }

    // UI для включения/отключения сервисов
    function buildToggleModal(list, store, title) {
        var $c = $('<div class="movieamikdn-movie-btns" style="display:flex;flex-direction:column;align-items:center;padding:20px;"></div>');
        list.forEach(function(it, idx){
            var en = store[it.networkId];
            var $b = $('<div class="movieamikdn-movie-btn selector" tabindex="'+(idx?'-1':'0')+'"></div>');
            var icon = en ? '✔' : '✖';
            $b.html('<span class="movieamikdn-movie-btn__icon">'+icon+'</span><span class="movieamikdn-movie-btn__name">'+it.name+'</span>')
              .toggleClass('enabled', en)
              .on('hover:enter', function(){
                  var now = !store[it.networkId];
                  store[it.networkId] = now;
                  saveSettings();
                  var ic = now ? '✔' : '✖';
                  $b.toggleClass('enabled', now).find('.movieamikdn-movie-btn__icon').text(ic);
              });
            $c.append($b);
        });
        Lampa.Modal.open({ title: title, html: $c, size:'small', onBack:function(){ Lampa.Modal.close(); Lampa.Controller.toggle('settings'); }});
        setTimeout(function(){
            var $b = $c.find('.movieamikdn-movie-btn');
            var name = title.replace(/\s+/g,'-').toLowerCase();
            var last = 0;
            function foc(i){ $b.removeClass('focus').attr('tabindex','-1'); if($b.eq(i).length){ $b.eq(i).addClass('focus').attr('tabindex','0').focus(); last=i; } }
            Lampa.Controller.add(name,{ toggle:function(){ Lampa.Controller.collectionSet($b); foc(last); }, up:function(){ if(last>0)foc(last-1); }, down:function(){ if(last<$b.length-1)foc(last+1); }, left:function(){}, right:function(){}, back:function(){ Lampa.Modal.close(); Lampa.Controller.toggle('settings'); }, enter:function(){ $b.eq(last).trigger('hover:enter'); } });
            Lampa.Controller.toggle(name);
        },100);
    }

    function showRuMoviesSettings(){ buildToggleModal(RU_MOVIES, MovieAmikdn.settings.ru_movies, 'Включение RU онлайн‑кино'); }
    function showEnMoviesSettings(){ buildToggleModal(EN_MOVIES, MovieAmikdn.settings.en_movies, 'Включение EN онлайн‑кино'); }

    // Компонент настроек
    function addSettingsComponent() {
        Lampa.SettingsApi.addComponent({ component:'movieamikdn', name:'Онлайн‑кино', icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="currentColor"/></svg>' });
        Lampa.SettingsApi.addParam({ component:'movieamikdn', param:{ type:'button', component:'about' }, field:{ name:'О плагине', description:'Информация и поддержка' }, onChange:showAbout });
        Lampa.SettingsApi.addParam({ component:'movieamikdn', param:{ name:'show_ru', type:'trigger', default:MovieAmikdn.settings.show_ru }, field:{ name:'Показывать RU на главной' }, onChange:function(v){ MovieAmikdn.settings.show_ru=v; saveSettings(); refreshMenuButtons(); }});
        Lampa.SettingsApi.addParam({ component:'movieamikdn', param:{ name:'show_en', type:'trigger', default:MovieAmikdn.settings.show_en }, field:{ name:'Показывать EN на главной' }, onChange:function(v){ MovieAmikdn.settings.show_en=v; saveSettings(); refreshMenuButtons(); }});
        Lampa.SettingsApi.addParam({ component:'movieamikdn', param:{ type:'button', component:'ru_list' }, field:{ name:'Включение RU', description:'Выбрать RU сервисы' }, onChange:showRuMoviesSettings });
        Lampa.SettingsApi.addParam({ component:'movieamikdn', param:{ type:'button', component:'en_list' }, field:{ name:'Включение EN', description:'Выбрать EN сервисы' }, onChange:showEnMoviesSettings });
        Lampa.SettingsApi.addParam({ component:'movieamikdn', param:{ name:'sort_mode', type:'select', values:SORT_MODES, default:MovieAmikdn.settings.sort_mode }, field:{ name:'Режим сортировки' }, onChange:function(v){ MovieAmikdn.settings.sort_mode=v; saveSettings(); }});
    }

    // Обновление меню
    function refreshMenuButtons() {
        $('.menu__item.movieamikdn-btn-ru, .menu__item.movieamikdn-btn-en').remove();
        addMenuButtons();
    }

    // Инициализация
    function startPlugin() {
        loadSettings();
        addLocalization();
        addStyles();
        addSettingsComponent();
        if (MovieAmikdn.debug) console.log('movieamikdn: init complete', MovieAmikdn.settings);
        Lampa.Listener.follow('app', function(e){ if(e.type==='ready') setTimeout(refreshMenuButtons,1000); });
        Lampa.Listener.follow('settings', function(e){ if(e.type==='update') refreshMenuButtons(); });
        Lampa.Listener.follow('menu', function(e){ if(e.type==='open') refreshMenuButtons(); });
    }

    startPlugin();

    // Экспорт
    window.movieamikdn = MovieAmikdn;

})();
