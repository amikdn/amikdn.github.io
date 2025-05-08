(function () {
    'use strict';

    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.2.1',
        debug: false,
        settings: {
            enabled: true,
            buttons_mode: 'default',
            show_movie_type: true,
            theme: 'default',
            colored_ratings: true,
            seasons_info_mode: 'aired',
            show_episodes_on_main: false,
            label_position: 'top-right',
            show_buttons: true,
            colored_elements: true,
            info_panel: true,
            stylize_titles: false,
            buttons_style_mode: 'default'
        }
    };

    /*** 1) СЕЗОНЫ И ЭПИЗОДЫ ***/
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
                        } else if (seasonAired && s.episode_count) {
                            airedEpisodes += s.episode_count;
                        }
                    });
                } else if (movie.last_episode_to_air) {
                    airedSeasons = movie.last_episode_to_air.season_number || 0;
                    if (movie.season_air_dates) {
                        airedEpisodes = movie.season_air_dates.reduce(function (sum, s) {
                            return sum + (s.episode_count || 0);
                        }, 0);
                    } else {
                        var ls = movie.last_episode_to_air;
                        if (movie.seasons) {
                            movie.seasons.forEach(function (s) {
                                if (s.season_number === 0) return;
                                if (s.season_number < ls.season_number) airedEpisodes += s.episode_count || 0;
                                else if (s.season_number === ls.season_number) airedEpisodes += ls.episode_number;
                            });
                        } else {
                            var prev = 0;
                            for (var i = 1; i < ls.season_number; i++) prev += 10;
                            airedEpisodes = prev + ls.episode_number;
                        }
                    }
                }

                if (movie.next_episode_to_air && totalEpisodes > 0) {
                    var ne = movie.next_episode_to_air, rem = 0;
                    if (movie.seasons) {
                        movie.seasons.forEach(function (s) {
                            if (s.season_number === ne.season_number) {
                                rem += (s.episode_count || 0) - ne.episode_number + 1;
                            } else if (s.season_number > ne.season_number) {
                                rem += s.episode_count || 0;
                            }
                        });
                    }
                    if (rem > 0) {
                        var calc = totalEpisodes - rem;
                        if (calc >= 0 && calc <= totalEpisodes) airedEpisodes = calc;
                    }
                }

                if (!airedSeasons) airedSeasons = totalSeasons;
                if (!airedEpisodes) airedEpisodes = totalEpisodes;
                if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) airedEpisodes = totalEpisodes;

                function plural(n, one, two, five) {
                    var m = Math.abs(n) % 100;
                    if (m >= 5 && m <= 20) return five;
                    m %= 10;
                    if (m === 1) return one;
                    if (m >= 2 && m <= 4) return two;
                    return five;
                }
                function getStatusText(st) {
                    if (st === 'Ended') return 'Завершён';
                    if (st === 'Canceled') return 'Отменён';
                    if (st === 'Returning Series') return 'Выходит';
                    if (st === 'In Production') return 'В производстве';
                    return st || 'Неизвестно';
                }

                var displaySeasons, displayEpisodes;
                if (InterFaceMod.settings.seasons_info_mode === 'aired') {
                    displaySeasons = airedSeasons;
                    displayEpisodes = airedEpisodes;
                } else {
                    displaySeasons = totalSeasons;
                    displayEpisodes = totalEpisodes;
                }
                var seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                var episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                var isCompleted = (status === 'Ended' || status === 'Canceled');
                var bgColor = isCompleted ? 'rgba(33,150,243,0.8)' : 'rgba(244,67,54,0.8)';

                var info = $('<div class="season-info-label"></div>');
                if (isCompleted) {
                    info.append($('<div>').text(displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText));
                    info.append($('<div>').text(getStatusText(status)));
                } else {
                    var txt = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
                    if (InterFaceMod.settings.seasons_info_mode === 'aired' && totalEpisodes > 0 && airedEpisodes < totalEpisodes && airedEpisodes > 0) {
                        txt = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText + ' из ' + totalEpisodes;
                    }
                    info.append($('<div>').text(txt));
                }

                var positions = {
                    'top-right':  { top: '1.4em', right: '-0.8em' },
                    'top-left':   { top: '1.4em', left: '-0.8em' },
                    'bottom-right': { bottom: '1.4em', right: '-0.8em' },
                    'bottom-left':  { bottom: '1.4em', left: '-0.8em' }
                };
                var pos = positions[InterFaceMod.settings.label_position] || positions['top-right'];
                info.css($.extend({
                    position: 'absolute',
                    backgroundColor: bgColor,
                    color: 'white',
                    padding: '0.4em 0.6em',
                    borderRadius: '0.3em',
                    fontSize: '0.8em',
                    zIndex: 999,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2em',
                    backdropFilter: 'blur(2px)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }, pos));

                setTimeout(function () {
                    var poster = $(data.object.activity.render()).find('.full-start-new__poster');
                    if (poster.length) {
                        poster.css('position', 'relative').append(info);
                    }
                }, 100);
            }
        });
    }

    /*** 2) ВСЕ КНОПКИ ***/
    function showAllButtons() {
        var style = document.createElement('style');
        style.id = 'interface_mod_buttons_style';
        style.innerHTML = `
            .full-start-new__buttons, .full-start__buttons {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 10px !important;
            }
        `;
        document.head.appendChild(style);

        if (Lampa.FullCard) {
            var orig = Lampa.FullCard.build;
            Lampa.FullCard.build = function (data) {
                var card = orig(data);
                card.organizeButtons = function () {
                    var el = card.activity && card.activity.render();
                    if (!el) return;
                    var cont = el.find('.full-start-new__buttons').length
                        ? el.find('.full-start-new__buttons')
                        : el.find('.full-start__buttons').length
                            ? el.find('.full-start__buttons')
                            : el.find('.buttons-container');
                    if (!cont.length) return;
                    var selectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button'
                    ];
                    var all = [];
                    selectors.forEach(function (s) {
                        el.find(s).each(function () { all.push(this); });
                    });
                    if (!all.length) return;
                    var cats = { online: [], torrent: [], trailer: [], other: [] }, seen = {};
                    all.forEach(function (b) {
                        var t = $(b).text().trim();
                        if (!t || seen[t]) return;
                        seen[t] = true;
                        var c = b.className || '';
                        if (c.includes('online')) cats.online.push(b);
                        else if (c.includes('torrent')) cats.torrent.push(b);
                        else if (c.includes('trailer')) cats.trailer.push(b);
                        else cats.other.push(b);
                    });
                    var order = ['online', 'torrent', 'trailer', 'other'];
                    var toggle = Lampa.Controller.enabled().name === 'full_start';
                    if (toggle) Lampa.Controller.toggle('settings_component');
                    cont.children().detach();
                    cont.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' });
                    order.forEach(function (o) {
                        cats[o].forEach(function (btn) { cont.append(btn); });
                    });
                    if (toggle) setTimeout(function () { Lampa.Controller.toggle('full_start'); }, 100);
                };
                card.onCreate = function () {
                    if (InterFaceMod.settings.show_buttons) {
                        setTimeout(card.organizeButtons, 300);
                    }
                };
                return card;
            };
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' && e.object && e.object.activity && InterFaceMod.settings.show_buttons && !Lampa.FullCard) {
                setTimeout(function () {
                    var el = e.object.activity.render();
                    var cont = el.find('.full-start-new__buttons').length
                        ? el.find('.full-start-new__buttons')
                        : el.find('.full-start__buttons').length
                            ? el.find('.full-start__buttons')
                            : el.find('.buttons-container');
                    if (!cont.length) return;
                    cont.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' });
                    var selectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button'
                    ];
                    var all = [];
                    selectors.forEach(function (s) {
                        el.find(s).each(function () { all.push(this); });
                    });
                    if (!all.length) return;
                    var cats = { online: [], torrent: [], trailer: [], other: [] }, seen = {};
                    all.forEach(function (b) {
                        var t = $(b).text().trim();
                        if (!t || seen[t]) return;
                        seen[t] = true;
                        var c = b.className || '';
                        if (c.includes('online')) cats.online.push(b);
                        else if (c.includes('torrent')) cats.torrent.push(b);
                        else if (c.includes('trailer')) cats.trailer.push(b);
                        else cats.other.push(b);
                    });
                    var order = ['online', 'torrent', 'trailer', 'other'];
                    var toggle = Lampa.Controller.enabled().name === 'full_start';
                    if (toggle) Lampa.Controller.toggle('settings_component');
                    order.forEach(function (o) {
                        cats[o].forEach(function (btn) { cont.append(btn); });
                    });
                    if (toggle) setTimeout(function () { Lampa.Controller.toggle('full_start'); }, 100);
                }, 300);
            }
        });

        new MutationObserver(function (muts) {
            if (!InterFaceMod.settings.show_buttons) return;
            var need = false;
            muts.forEach(function (m) {
                if (m.type === 'childList' &&
                    (m.target.classList.contains('full-start-new__buttons') ||
                     m.target.classList.contains('full-start__buttons') ||
                     m.target.classList.contains('buttons-container'))) {
                    need = true;
                }
            });
            if (need) {
                setTimeout(function () {
                    var act = Lampa.Activity.active();
                    if (act && act.activity.card && typeof act.activity.card.organizeButtons === 'function') {
                        act.activity.card.organizeButtons();
                    }
                }, 100);
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    /*** 3) ТИП КОНТЕНТА ***/
    function changeMovieTypeLabels() {
        var style = $(`<style id="movie_type_styles">
            .content-label { position: absolute!important; top: 1.4em!important; left: -0.8em!important; color: white!important; padding: 0.4em 0.4em!important; border-radius: 0.3em!important; font-size: 0.8em!important; z-index: 10!important; }
            .serial-label { background-color: #3498db!important; }
            .movie-label  { background-color: #2ecc71!important; }
            body[data-movie-labels="on"] .card--tv .card__type { display: none!important; }
        </style>`);
        $('head').append(style);
        $('body').attr('data-movie-labels', InterFaceMod.settings.show_movie_type ? 'on' : 'off');

        function addLabel(card) {
            if (!InterFaceMod.settings.show_movie_type) return;
            if ($(card).find('.content-label').length) return;
            var view = $(card).find('.card__view');
            if (!view.length) return;

            var meta = {}, tmp;
            try {
                tmp = $(card).attr('data-card');
                if (tmp) meta = JSON.parse(tmp);
                tmp = $(card).data();
                if (tmp && Object.keys(tmp).length) meta = Object.assign(meta, tmp);
                if (Lampa.Card && $(card).attr('id')) {
                    var c = Lampa.Card.get($(card).attr('id'));
                    if (c) meta = Object.assign(meta, c);
                }
                var id = $(card).data('id') || $(card).attr('data-id') || meta.id;
                if (id && Lampa.Storage.cache('card_' + id)) {
                    meta = Object.assign(meta, Lampa.Storage.cache('card_' + id));
                }
            } catch (e) {}

            var isTV = false;
            if (meta.type === 'tv' || meta.card_type === 'tv' ||
                meta.seasons || meta.number_of_seasons > 0 ||
                meta.episodes || meta.number_of_episodes > 0 ||
                meta.is_series) {
                isTV = true;
            }
            if (!isTV) {
                if ($(card).hasClass('card--tv') || $(card).data('type') === 'tv') isTV = true;
                else if ($(card).find('.card__type, .card__temp').text().match(/(сезон|серия|эпизод| mississippi | ТВ | сериал | эпизод | Фильм )/)
            }

            function processAll() {
                if (!InterFaceMod.settings.show_movie_type) return;
                $('.card').each(function () { addLabel(this); });
            }

            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' && e.data.movie) {
                    var poster = $(e.object.activity.render()).find('.full-start__poster');
                    if (!poster.length) return;
                    var m = e.data.movie;
                    var isTV = m.number_of_seasons > 0 || m.seasons || m.type === 'tv';
                    if (InterFaceMod.settings.show_movie_type) {
                        poster.find('.content-label').remove();
                        var lbl = $('<div class="content-label"></div>').css({
                            position: 'absolute', top: '1.4em', left: '-0.8em',
                            color: 'white', padding: '0.4em', borderRadius: '0.3em',
                            fontSize: '0.8em', zIndex: 10
                        });
                        if (isTV) {
                            lbl.addClass('serial-label').text('Сериал').css('backgroundColor', '#3498db');
                        } else {
                            lbl.addClass('movie-label').text('Фильм').css('backgroundColor', '#2ecc71');
                        }
                        poster.css('position', 'relative').append(lbl);
                    }
                }
            });

            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    if (m.addedNodes) {
                        $(m.addedNodes).find('.card').each(function () { addLabel(this); });
                    }
                    if (m.type === 'attributes' &&
                        ['class', 'data-card', 'data-type'].includes(m.attributeName) &&
                        $(m.target).hasClass('card')) {
                        addLabel(m.target);
                    }
                });
            }).observe(document.body, {
                childList: true, subtree: true,
                attributes: true, attributeFilter: ['class', 'data-card', 'data-type']
            });

            processAll();
            setInterval(processAll, 2000);
        }

        /*** 4) ТЕМЫ ОФОРМЛЕНИЯ ***/
        function applyTheme(theme) {
            $('#interface_mod_theme').remove();
            if (theme === 'default') return;
            var style = $('<style id="interface_mod_theme"></style>');
            var themes = {
                default: '',
                neon: `
                    body { background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #4d0099 100%); color: #ffffff; }
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                glow_outline: `
                    body { background: #0a0a0a; color: #f5f5f5; }
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
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
                dark_night: `
                    body { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%); color: #ffffff; }
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus {
                        background: linear-gradient(to right, #8a2387, #e94057, #f27121);
                        color: #fff;
                        box-shadow: 0 0 30px rgba(233,64,87,0.3);
                        animation: night-pulse 2s infinite;
                    }
                    @keyframes night-pulse {
                        0%   { box-shadow: 0 0 20px rgba(233,64,87,0.3); }
                        50%  { box-shadow: 0 0 30px rgba(242,113,33,0.3); }
                        100% { box-shadow: 0 0 20px rgba(138,35,135,0.3); }
                    }
                    .card.focus .card__view::after, .card.hover .card__view::after {
                        border: 2px solid #e94057;
                        box-shadow: 0 0 30px rgba(242,113,33,0.5);
                    }
                    .head__action.focus, .head__action.hover {
                        background: linear-gradient(45deg, #8a2387, #f27121);
                        animation: night-pulse 2s infinite;
                    }
                    .full-start__background {
                        opacity: 0.8;
                        filter: saturate(1.3) contrast(1.1);
                    }
                    .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                        background: rgba(10,10,10,0.95);
                        border: 1px solid rgba(233,64,87,0.1);
                        box-shadow: 0 0 30px rgba(242,113,33,0.1);
                    }
                `,
                blue_cosmos: `
                    body { background: linear-gradient(135deg, #0b365c 0%, #144d80 50%, #0c2a4d 100%); color: #ffffff; }
                    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, 
                    .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus {
                        background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
                        color: #fff;
                        box-shadow: 0 0 30px rgba(18,194,233,0.3);
                        animation: cosmos-pulse 2s infinite;
                    }
                    @keyframes cosmos-pulse {
                        0%   { box-shadow: 0 0 20px rgba(18,194,233,0.3); }
                        50%  { box-shadow: 0 0 30px rgba(196,113,237,0.3); }
                        100% { box-shadow: 0 0 20px rgba(246,79,89,0.3); }
                    }
                    .card.focus .card__view::after, .card.hover .card__view::after {
                        border: 2px solid #12c2e9;
                        box-shadow: 0 0 30px rgba(196,113,237,0.5);
                    }
                    .head__action.focus, .head__action.hover {
                        background: linear-gradient(45deg, #12c2e9, #f64f59);
                        animation: cosmos-pulse 2s infinite;
                    }
                    .full-start__background {
                        opacity: 0.8;
                        filter: saturate(1.3) contrast(1.1);
                    }
                    .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                        background: rgba(11,54,92,0.95);
                        border: 1px solid rgba(18,194,233,0.1);
                        box-shadow: 0 0 30px rgba(196,113,237,0.1);
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
                        box-shadow: 00 10px rgba(0, 57, 115, 0.5);
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

            style.html(themes[theme] || '');
            $('head').append(style);
        }

        /*** 5) ЦВЕТНЫЕ РЕЙТИНГИ И СТАТУСЫ ***/
        function updateVoteColors() {
            if (!InterFaceMod.settings.colored_ratings) return;
            function apply(el) {
                var m = $(el).text().match(/(\d+(\.\d+)?)/);
                if (!m) return;
                var v = parseFloat(m[0]);
                var c = v <= 3 ? 'red'
                      : v < 6  ? 'orange'
                      : v < 8  ? 'cornflowerblue'
                      : 'lawngreen';
                $(el).css('color', c);
            }
            $('.card__vote').each(function(){ apply(this); });
            $('.full-start__rate, .full-start-new__rate').each(function(){ apply(this); });
            $('.info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function(){ apply(this); });
        }
        function setupVoteColorsObserver() {
            if (!InterFaceMod.settings.colored_ratings) return;
            setTimeout(updateVoteColors, 500);
            new MutationObserver(function(){ setTimeout(updateVoteColors, 100); })
                .observe(document.body, { childList: true, subtree: true });
        }
        function setupVoteColorsForDetailPage() {
            if (!InterFaceMod.settings.colored_ratings) return;
            Lampa.Listener.follow('full', function (d) {
                if (d.type === 'complite') setTimeout(updateVoteColors, 100);
            });
        }

        /*** 6) ЦВЕТНЫЕ ЭЛЕМЕНТЫ (СТАТУС, AGE) ***/
        function colorizeSeriesStatus() {
            if (!InterFaceMod.settings.colored_elements) return;
            var map = {
                completed: { bg: 'rgba(46,204,113,0.8)', text: 'white' },
                canceled:  { bg: 'rgba(231,76,60,0.8)',  text: 'white' },
                ongoing:   { bg: 'rgba(243,156,18,0.8)',  text: 'black' },
                production:{ bg: 'rgba(52,152,219,0.8)',  text: 'white' },
                planned:   { bg: 'rgba(155,89,182,0.8)',  text: 'white' },
                pilot:     { bg: 'rgba(230,126,34,0.8)',  text: 'white' },
                released:  { bg: 'rgba(26,188,156,0.8)',  text: 'white' },
                rumored:   { bg: 'rgba(149,165,166,0.8)', text: 'white' },
                post:      { bg: 'rgba(0,188,212,0.8)',  text: 'white' }
            };
            function apply(el) {
                var t = $(el).text().trim().toLowerCase();
                var cfg = null;
                if (t.includes('заверш') || t.includes('ended'))      cfg = map.completed;
                else if (t.includes('отмен') || t.includes('canceled'))cfg = map.canceled;
                else if (t.includes('выход') || t.includes('ongoing')) cfg = map.ongoing;
                else if (t.includes('производств') || t.includes('production')) cfg = map.production;
                else if (t.includes('заплан') || t.includes('planned'))       cfg = map.planned;
                else if (t.includes('пилот') || t.includes('pilot'))           cfg = map.pilot;
                else if (t.includes('выпущ') || t.includes('released'))       cfg = map.released;
                else if (t.includes('слух') || t.includes('rumored'))         cfg = map.rumored;
                else if (t.includes('скоро') || t.includes('post'))            cfg = map.post;
                if (cfg) {
                    $(el).css({
                        backgroundColor: cfg.bg,
                        color: cfg.text,
                        borderRadius: '0.3em',
                        display: 'inline-block'
                    });
                }
            }
            $('.full-start__status').each(function(){ apply(this); });
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    if (m.addedNodes) {
                        $(m.addedNodes).find('.full-start__status').each(function(){ apply(this); });
                    }
                });
            }).observe(document.body, { childList: true, subtree: true });
            Lampa.Listener.follow('full', function(d) {
                if (d.type === 'complite') {
                    setTimeout(function(){
                        $(d.object.activity.render()).find('.full-start__status').each(function(){ apply(this); });
                    },100);
                }
            });
        }

        function colorizeAgeRating() {
            if (!InterFaceMod.settings.colored_elements) return;
            var groups = {
                kids:        ['G','TV-Y','0+','3+'],
                children:    ['PG','TV-PG','6+','7+'],
                teens:       ['PG-13','TV-14','12+','13+','14+'],
                almostAdult: ['R','16+','17+'],
                adult:       ['NC-17','18+','X']
            };
            var colors = {
                kids:        { bg: '#2ecc71', text: 'white' },
                children:    { bg: '#3498db', text: 'white' },
                teens:       { bg: '#f1c40f', text: 'black' },
                almostAdult: { bg: '#e67e22', text: 'white' },
                adult:       { bg: '#e74c3c', text: 'white' }
            };
            function apply(el) {
                var t = $(el).text().trim();
                var grp = null;
                for (var key in groups) {
                    groups[key].forEach(function (r) {
                        if (t.includes(r)) grp = key;
                    });
                    if (grp) break;
                }
                if (grp) {
                    $(el).css({
                        backgroundColor: colors[grp].bg,
                        color: colors[grp].text,
                        borderRadius: '0.3em'
                    });
                }
            }
            $('.full-start__pg').each(function(){ apply(this); });
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    if (m.addedNodes) {
                        $(m.addedNodes).find('.full-start__pg').each(function(){ apply(this); });
                    }
                });
            }).observe(document.body, { childList: true, subtree: true });
            Lampa.Listener.follow('full', function(d) {
                if (d.type === 'complite') {
                    setTimeout(function(){
                        $(d.object.activity.render()).find('.full-start__pg').each(function(){ apply(this); });
                    },100);
                }
            });
        }

        /*** 7) НОВАЯ ИНФО-ПАНЕЛЬ ***/
        function newInfoPanel() {
            if (!InterFaceMod.settings.info_panel) {
                $('.info-unified-line').remove();
                return;
            }

            Lampa.Listener.follow('full', function(data) {
                if (data.type === 'complite') {
                    setTimeout(function() {
                        var details = $('.full-start-new__details');
                        if (!details.length) return;

                        var unifiedLine = $('<div class="info-unified-line"></div>').css({
                            'display': 'flex',
                            'flex-wrap': 'wrap',
                            'gap': '8px',
                            'margin-bottom': '10px'
                        });

                        var infoItems = [];

                        if (data.movie.release_date || data.movie.first_air_date) {
                            var year = (data.movie.release_date || data.movie.first_air_date).split('-')[0];
                            infoItems.push({
                                text: year,
                                style: {
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                }
                            });
                        }

                        if (data.movie.genres && data.movie.genres.length) {
                            var genres = data.movie.genres.map(function(genre) {
                                return genre.name;
                            }).join(', ');
                            infoItems.push({
                                text: genres,
                                style: {
                                    'background-color': 'rgba(46, 204, 113, 0.8)',
                                    'color': 'white'
                                }
                            });
                        }

                        if (data.movie.production_countries && data.movie.production_countries.length) {
                            var countries = data.movie.production_countries.map(function(country) {
                                return country.name;
                            }).join(', ');
                            infoItems.push({
                                text: countries,
                                style: {
                                    'background-color': 'rgba(241, 196, 15, 0.8)',
                                    'color': 'white'
                                }
                            });
                        }

                        if (data.movie.runtime) {
                            var runtime = data.movie.runtime + ' мин';
                            infoItems.push({
                                text: runtime,
                                style: {
                                    'background-color': 'rgba(231, 76, 60, 0.8)',
                                    'color': 'white'
                                }
                            });
                        }

                        infoItems.forEach(function(item) {
                            var itemElement = $('<span class="info-unified-item"></span>')
                                .text(item.text)
                                .css({
                                    'padding': '4px 8px',
                                    'border-radius': '4px',
                                    'font-size': '0.9em',
                                    ...item.style
                                });
                            unifiedLine.append(itemElement);
                        });

                        details.find('span').remove();
                        details.prepend(unifiedLine);
                    }, 300);
                }
            });
        }

        /*** 8) НОВЫЙ СТИЛЬ ЗАГОЛОВКОВ ***/
        function stylizeCollectionTitles() {
            if (!InterFaceMod.settings.stylize_titles) {
                var oldStyle = document.getElementById('stylized-titles-css');
                if (oldStyle) oldStyle.remove();
                return;
            }

            var styleElement = document.createElement('style');
            styleElement.id = 'stylized-titles-css';
            styleElement.innerHTML = `
                .collection__title, .selector.collection__item {
                    background: linear-gradient(to right, #6b7280, #1f2937);
                    color: #ffffff;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    margin-bottom: 10px;
                    transition: all 0.3s ease;
                }
                .collection__title:hover, .selector.collection__item:hover {
                    background: linear-gradient(to right, #9ca3af, #4b5563);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }
            `;
            document.head.appendChild(styleElement);
        }

        /*** 9) СТИЛЬ КНОПОК ***/
function updateButtonStyle() {
    var styleElement = document.getElementById('button-style-css');
    if (styleElement) styleElement.remove();

    if (InterFaceMod.settings.buttons_style_mode === 'default') return;

    styleElement = document.createElement('style');
    styleElement.id = 'button-style-css';
    var css = '';

    if (InterFaceMod.settings.buttons_style_mode === 'rounded') {
        css = `
            .full-start__button, .full-start-new__button, .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button {
                border-radius: 12px !important;
                padding: 10px 20px !important;
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2) !important;
                transition: all 0.3s ease !important;
            }
            .full-start__button:hover, .full-start-new__button:hover, .custom-online-btn:hover, .custom-torrent-btn:hover, .main2-more-btn:hover, .simple-button:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3) !important;
            }
            .full-start__button.focus, .full-start-new__button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus {
                background: linear-gradient(to right, #4a5568, #2d3748) !important;
                color: #ffffff !important;
            }
        `;
    } else if (InterFaceMod.settings.buttons_style_mode === 'minimal') {
        css = `
            .full-start__button, .full-start-new__button, .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button {
                border-radius: 4px !important;
                padding: 8px 16px !important;
                border: 1px solid #4a5568 !important;
                background: transparent !important;
                color: #e2e8f0 !important;
                transition: all 0.3s ease !important;
            }
            .full-start__button:hover, .full-start-new__button:hover, .custom-online-btn:hover, .custom-torrent-btn:hover, .main2-more-btn:hover, .simple-button:hover {
                background: #4a5568 !important;
                color: #ffffff !important;
            }
            .full-start__button.focus, .full-start-new__button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus {
                background: #2d3748 !important;
                color: #ffffff !important;
                border-color: #ffffff !important;
            }
        `;
    } else if (InterFaceMod.settings.buttons_style_mode === 'glow') {
        css = `
            .full-start__button, .full-start-new__button, .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button {
                border-radius: 8px !important;
                padding: 10px 20px !important;
                background: linear-gradient(to right, #1a202c, #2d3748) !important;
                color: #e2e8f0 !important;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.2) !important;
                transition: all 0.3s ease !important;
            }
            .full-start__button:hover, .full-start-new__button:hover, .custom-online-btn:hover, .custom-torrent-btn:hover, .main2-more-btn:hover, .simple-button:hover {
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.4) !important;
                transform: translateY(-1px) !important;
            }
            .full-start__button.focus, .full-start-new__button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.6) !important;
                background: linear-gradient(to right, #4a5568, #718096) !important;
                color: #ffffff !important;
            }
        `;
    }

    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
}

/*** 10) ИНИЦИАЛИЗАЦИЯ И НАСТРОЙКИ ***/
function init() {
    if (!InterFaceMod.settings.enabled) return;

    addSeasonInfo();
    showAllButtons();
    changeMovieTypeLabels();
    applyTheme(InterFaceMod.settings.theme);
    setupVoteColorsObserver();
    setupVoteColorsForDetailPage();
    colorizeSeriesStatus();
    colorizeAgeRating();
    newInfoPanel();
    stylizeCollectionTitles();
    updateButtonStyle();
}

function createSettingsMenu() {
    var menu = {
        title: 'Interface Mod',
        subtitle: 'Настройки оформления интерфейса',
        items: [
            {
                title: 'Включить плагин',
                selected: InterFaceMod.settings.enabled,
                onSelect: function () {
                    InterFaceMod.settings.enabled = !InterFaceMod.settings.enabled;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    if (InterFaceMod.settings.enabled) init();
                    else location.reload();
                }
            },
            {
                title: 'Тема оформления',
                subtitle: InterFaceMod.settings.theme,
                items: [
                    { title: 'По умолчанию', value: 'default' },
                    { title: 'Неон', value: 'neon' },
                    { title: 'Закат', value: 'sunset' },
                    { title: 'Изумруд', value: 'emerald' },
                    { title: 'Аврора', value: 'aurora' },
                    { title: 'ByWolf Mod', value: 'bywolf_mod' },
                    { title: 'Минимализм', value: 'minimalist' },
                    { title: 'Светящийся контур', value: 'glow_outline' },
                    { title: 'Линии меню', value: 'menu_lines' },
                    { title: 'Тёмный изумруд', value: 'dark_emerald' },
                    { title: 'Тёмная ночь', value: 'dark_night' },
                    { title: 'Голубой космос', value: 'blue_cosmos' },
                    { title: 'Неоновый пульс', value: 'neon_pulse' },
                    { title: 'Кибер-зелёный', value: 'cyber_green' },
                    { title: 'Электрический синий', value: 'electric_blue' },
                    { title: 'Малиновое свечение', value: 'crimson_glow' },
                    { title: 'Волновое движение', value: 'wave_motion' },
                    { title: 'Пульсирующий ритм', value: 'pulse_beat' },
                    { title: 'Радужный переход', value: 'rainbow_shift' },
                    { title: 'Чистый тёмный', value: 'clean_dark' },
                    { title: 'Сланцево-синий', value: 'slate_blue' },
                    { title: 'Светлый минимализм', value: 'light_minimal' }
                ],
                onSelect: function (item) {
                    InterFaceMod.settings.theme = item.value;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    applyTheme(item.value);
                }
            },
            {
                title: 'Показывать тип контента',
                selected: InterFaceMod.settings.show_movie_type,
                onSelect: function () {
                    InterFaceMod.settings.show_movie_type = !InterFaceMod.settings.show_movie_type;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    changeMovieTypeLabels();
                }
            },
            {
                title: 'Цветные рейтинги',
                selected: InterFaceMod.settings.colored_ratings,
                onSelect: function () {
                    InterFaceMod.settings.colored_ratings = !InterFaceMod.settings.colored_ratings;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    setupVoteColorsObserver();
                    setupVoteColorsForDetailPage();
                }
            },
            {
                title: 'Цветные элементы (статус, возраст)',
                selected: InterFaceMod.settings.colored_elements,
                onSelect: function () {
                    InterFaceMod.settings.colored_elements = !InterFaceMod.settings.colored_elements;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    colorizeSeriesStatus();
                    colorizeAgeRating();
                }
            },
            {
                title: 'Информация о сезонах',
                subtitle: InterFaceMod.settings.seasons_info_mode,
                items: [
                    { title: 'Выпущенные', value: 'aired' },
                    { title: 'Все', value: 'total' },
                    { title: 'Отключить', value: 'none' }
                ],
                onSelect: function (item) {
                    InterFaceMod.settings.seasons_info_mode = item.value;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    addSeasonInfo();
                }
            },
            {
                title: 'Положение метки сезонов',
                subtitle: InterFaceMod.settings.label_position,
                items: [
                    { title: 'Верх-право', value: 'top-right' },
                    { title: 'Верх-лево', value: 'top-left' },
                    { title: 'Низ-право', value: 'bottom-right' },
                    { title: 'Низ-лево', value: 'bottom-left' }
                ],
                onSelect: function (item) {
                    InterFaceMod.settings.label_position = item.value;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    addSeasonInfo();
                }
            },
            {
                title: 'Показывать все кнопки',
                selected: InterFaceMod.settings.show_buttons,
                onSelect: function () {
                    InterFaceMod.settings.show_buttons = !InterFaceMod.settings.show_buttons;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    showAllButtons();
                }
            },
            {
                title: 'Новая инфо-панель',
                selected: InterFaceMod.settings.info_panel,
                onSelect: function () {
                    InterFaceMod.settings.info_panel = !InterFaceMod.settings.info_panel;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    newInfoPanel();
                }
            },
            {
                title: 'Новый стиль заголовков',
                selected: InterFaceMod.settings.stylize_titles,
                onSelect: function () {
                    InterFaceMod.settings.stylize_titles = !InterFaceMod.settings.stylize_titles;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    stylizeCollectionTitles();
                }
            },
            {
                title: 'Стиль кнопок',
                subtitle: InterFaceMod.settings.buttons_style_mode,
                items: [
                    { title: 'По умолчанию', value: 'default' },
                    { title: 'Скруглённые', value: 'rounded' },
                    { title: 'Минималистичные', value: 'minimal' },
                    { title: 'Светящиеся', value: 'glow' }
                ],
                onSelect: function (item) {
                    InterFaceMod.settings.buttons_style_mode = item.value;
                    Lampa.Storage.set('interface_mod_settings', InterFaceMod.settings);
                    updateButtonStyle();
                }
            }
        ]
    };

    Lampa.SettingsApi.addParam({
        component: 'interface',
        name: 'interface_mod',
        type: 'menu',
        place: 'after',
        field: 'interface',
        value: menu
    });
}

/*** 11) ЛОКАЛИЗАЦИЯ ***/
function setupLocalization() {
    Lampa.Lang.add({
        interface_mod_title: {
            ru: 'Interface Mod',
            en: 'Interface Mod',
            uk: 'Interface Mod'
        },
        interface_mod_subtitle: {
            ru: 'Настройки оформления интерфейса',
            en: 'Interface customization settings',
            uk: 'Налаштування оформлення інтерфейсу'
        },
        interface_mod_enable: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        interface_mod_theme: {
            ru: 'Тема оформления',
            en: 'Theme',
            uk: 'Тема оформлення'
        },
        interface_mod_show_movie_type: {
            ru: 'Показывать тип контента',
            en: 'Show content type',
            uk: 'Показувати тип контенту'
        },
        interface_mod_colored_ratings: {
            ru: 'Цветные рейтинги',
            en: 'Colored ratings',
            uk: 'Кольорові рейтинги'
        },
        interface_mod_colored_elements: {
            ru: 'Цветные элементы (статус, возраст)',
            en: 'Colored elements (status, age)',
            uk: 'Кольорові елементи (статус, вік)'
        },
        interface_mod_seasons_info: {
            ru: 'Информация о сезонах',
            en: 'Seasons information',
            uk: 'Інформація про сезони'
        },
        interface_mod_label_position: {
            ru: 'Положение метки сезонов',
            en: 'Seasons label position',
            uk: 'Положення мітки сезонів'
        },
        interface_mod_show_buttons: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_info_panel: {
            ru: 'Новая инфо-панель',
            en: 'New info panel',
            uk: 'Нова інформаційна панель'
        },
        interface_mod_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style',
            uk: 'Новий стиль заголовків'
        },
        interface_mod_buttons_style: {
            ru: 'Стиль кнопок',
            en: 'Button style',
            uk: 'Стиль кнопок'
        }
    });
}

/*** 12) ЗАГРУЗКА НАСТРОЕК ***/
function loadSettings() {
    var saved = Lampa.Storage.get('interface_mod_settings', '{}');
    InterFaceMod.settings = $.extend(InterFaceMod.settings, saved);
}

/*** 13) СТАРТ ПЛАГИНА ***/
$(document).ready(function () {
    loadSettings();
    setupLocalization();
    createSettingsMenu();
    if (InterFaceMod.settings.enabled) init();
});
})();
