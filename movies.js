(function () {
    'use strict';

    var MovieAmikdn = {
        name:    'movieamikdn',
        version: '2.2.1',        
        debug:   true,
        settings: {
            enabled:  true,
            show_ru:  true,
            show_en:  true
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
        { name: 'Netflix',        networkId: '213'  },
        { name: 'Apple TV',       networkId: '2552' },
        { name: 'HBO',            networkId: '49'   },
        { name: 'SyFy',           networkId: '77'   },
        { name: 'NBC',            networkId: '6'    },
        { name: 'TV New Zealand', networkId: '1376' },
        { name: 'Hulu',           networkId: '453'  },
        { name: 'ABC',            networkId: '49'   },
        { name: 'CBS',            networkId: '16'   },
        { name: 'Amazon Prime',   networkId: '1024' }
    ];

    function addLocalization () {
        if (Lampa && Lampa.Lang) {
            Lampa.Lang.add({
                movieamikdn_ru:    { ru: 'RU Кинотеатры',     en: 'RU Movies'    },
                movieamikdn_en:    { ru: 'EN Кинотеатры',     en: 'EN Movies'    },
                movieamikdn_title: { ru: 'Online Кинотеатры', en: 'Online Movies'}
            });
        }
    }

    function removeMenuButtons () {
        $('.movieamikdn-btn-ru, .movieamikdn-btn-en').remove();
    }

    function addMenuButtons () {
        if (MovieAmikdn.debug) {
            console.log('movieamikdn: addMenuButtons');
            console.log('  show_ru =', MovieAmikdn.settings.show_ru);
            console.log('  show_en =', MovieAmikdn.settings.show_en);
        }

        removeMenuButtons();

        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) {
            if (MovieAmikdn.debug) console.log('movieamikdn: меню не найдено');
            return;
        }

        if (String(MovieAmikdn.settings.show_ru).toLowerCase() !== 'false') {
            var icoRU = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="currentColor" dominant-baseline="middle">RU</text></svg>`;
            var $btnRU = $(`<li class="menu__item selector movieamikdn-btn-ru"><div class="menu__ico">${icoRU}</div><div class="menu__text">Кинотеатры</div></li>`);
            $btnRU.on('hover:enter', function () { openMoviesModal('ru'); });
            $menu.append($btnRU);
        }

        if (String(MovieAmikdn.settings.show_en).toLowerCase() !== 'false') {
            var icoEN = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="currentColor" dominant-baseline="middle">EN</text></svg>`;
            var $btnEN = $(`<li class="menu__item selector movieamikdn-btn-en"><div class="menu__ico">${icoEN}</div><div class="menu__text">Кинотеатры</div></li>`);
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
            var url = (Lampa.TMDB && Lampa.TMDB.image) ? Lampa.TMDB.image('t/p/w300' + logoPath) : 'https://image.tmdb.org/t/p/w300' + logoPath;
            cb('<img src="' + url + '" alt="' + name + '" style="max-width:68px;max-height:68px;">');
            return;
        }
        var apiUrl = Lampa.TMDB.api('network/' + networkId + '?api_key=' + Lampa.TMDB.key());
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                if (data && data.logo_path) {
                    var imgUrl = (Lampa.TMDB && Lampa.TMDB.image) ? Lampa.TMDB.image('t/p/w300' + data.logo_path) : 'https://image.tmdb.org/t/p/w300' + data.logo_path;
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
            toggle ()        { L
