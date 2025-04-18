(function () {
    'use strict';

    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.2.0',
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
            colored_elements: true
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

                // по структуре "seasons"
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
                }
                // fallback на last_episode_to_air
                else if (movie.last_episode_to_air) {
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

                // next_episode_to_air уточняет airedEpisodes
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
            } catch (e) {
                // парсинг мог упасть — игнорируем
            }

            var isTV = false;
            if (meta.type === 'tv' || meta.card_type === 'tv' ||
                meta.seasons || meta.number_of_seasons > 0 ||
                meta.episodes || meta.number_of_episodes > 0 ||
                meta.is_series) {
                isTV = true;
            }
            if (!isTV) {
                if ($(card).hasClass('card--tv') || $(card).data('type') === 'tv') isTV = true;
                else if ($(card).find('.card__type, .card__temp').text().match(/(сезон|серия|эпизод|ТВ|TV)/i)) isTV = true;
            }

            var lbl = $('<div class="content-label"></div>');
            if (isTV) {
                lbl.addClass('serial-label').text('Сериал').data('type', 'serial');
            } else {
                lbl.addClass('movie-label').text('Фильм').data('type', 'movie');
            }
            view.append(lbl);
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
            neon: `
                body { background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
                    background: linear-gradient(to right, #ff00ff, #00ffff);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255,0,255,0.4);
                    text-shadow: 0 0 10px rgba(255,255,255,0.5);
                    border: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff00ff;
                    box-shadow: 0 0 20px #00ffff;
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    box-shadow: 0 0 15px rgba(255,0,255,0.3);
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(1.2) saturate(1.3);
                }
                .settings__content, .settings-input__content,
                .selectbox__content, .modal__content {
                    background: rgba(15,2,33,0.95);
                    border: 1px solid rgba(255,0,255,0.1);
                }
            `,
            dark_night: `
                body { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
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
                .settings__content, .settings-input__content,
                .selectbox__content, .modal__content {
                    background: rgba(10,10,10,0.95);
                    border: 1px solid rgba(233,64,87,0.1);
                    box-shadow: 0 0 30px rgba(242,113,33,0.1);
                }
            `,
            blue_cosmos: `
                body { background: linear-gradient(135deg, #0b365c 0%, #144d80 50%, #0c2a4d 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
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
                .settings__content, .settings-input__content,
                .selectbox__content, .modal__content {
                    background: rgba(11,54,92,0.95);
                    border: 1px solid rgba(18,194,233,0.1);
                    box-shadow: 0 0 30px rgba(196,113,237,0.1);
                }
            `,
            sunset: `
                body { background: linear-gradient(135deg, #2d1f3d 0%, #614385 50%, #516395 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
                    background: linear-gradient(to right, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                    box-shadow: 0 0 15px rgba(255,110,127,0.3);
                    font-weight: bold;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff6e7f;
                    box-shadow: 0 0 15px rgba(255,110,127,0.5);
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
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
                    background: linear-gradient(to right, #43cea2, #185a9d);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(67,206,162,0.3);
                    border-radius: 5px;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 3px solid #43cea2;
                    box-shadow: 0 0 20px rgba(67,206,162,0.4);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #43cea2, #185a9d);
                }
                .full-start__background {
                    opacity: 0.85;
                    filter: brightness(1.1) saturate(1.2);
                }
                .settings__content, .settings-input__content,
                .selectbox__content, .modal__content {
                    background: rgba(26,42,58,0.98);
                    border: 1px solid rgba(67,206,162,0.1);
                }
            `,
            aurora: `
                body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
                    background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(170,75,107,0.3);
                    transform: scale(1.02);
                    transition: all 0.3s ease;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #aa4b6b;
                    box-shadow: 0 0 25px rgba(170,75,107,0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #aa4b6b, #3b8d99);
                    transform: scale(1.05);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: contrast(1.1) brightness(1.1);
                }
                .settings__content, .settings-input__content,
                .selectbox__content, .modal__content {
                    background: rgba(15,2,33,0.95);
                }
            `,
            bywolf_mod: `
                body { background: linear-gradient(135deg, #090227 0%, #170b34 50%, #261447 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover,
                .settings-folder.focus, .settings-param.focus,
                .selectbox-item.focus, .full-start__button.focus,
                .full-descr__tag.focus, .player-panel .button.focus {
                    background: linear-gradient(to right, #fc00ff, #00dbde);
                    color: #fff;
                    box-shadow: 0 0 30px rgba(252,0,255,0.3);
                    animation: cosmic-pulse 2s infinite;
                }
                @keyframes cosmic-pulse {
                    0%   { box-shadow: 0 0 20px rgba(252,0,255,0.3); }
                    50%  { box-shadow: 0 0 30px rgba(0,219,222,0.3); }
                    100% { box-shadow: 0 0 20px rgba(252,0,255,0.3); }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #fc00ff;
                    box-shadow: 0 0 30px rgba(0,219,222,0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(to right, #fc00ff, #00dbde);
                    animation: cosmic-pulse 2s infinite;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.3) contrast(1.1);
                }
                .settings__content, .settings-input__content,
                .selectbox__content, .modal__content {
                    background: rgba(9,2,39,0.95);
                    border: 1px solid rgba(252,0,255,0.1);
                    box-shadow: 0 0 30px rgba(0,219,222,0.1);
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

    /*** 7) ИНИЦИАЛИЗАЦИЯ ***/
    function startPlugin() {
        // компонент настроек
        Lampa.SettingsApi.addComponent({
            component: 'season_info',
            name: 'Интерфейс мод',
                icon: ''
     + '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
     +   '<path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/>'
     +   '<path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/>'
     +   '<path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/>'
     + '</svg>'
        });

        // режим серий
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'seasons_info_mode',
                type: 'select',
                values: {
                    none: 'Выключить',
                    aired: 'Актуальная информация',
                    total: 'Полное количество'
                },
                default: 'aired'
            },
            field: {
                name: 'Информация о сериях',
                description: 'Выберите как отображать информацию о сериях и сезонах'
            },
            onChange: function (v) {
                InterFaceMod.settings.seasons_info_mode = v;
                InterFaceMod.settings.enabled = (v !== 'none');
                Lampa.Settings.update();
            }
        });

        // позиция лейбла
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'label_position',
                type: 'select',
                values: {
                    'top-right': 'Верхний правый угол',
                    'top-left': 'Верхний левый угол',
                    'bottom-right': 'Нижний правый угол',
                    'bottom-left': 'Нижний левый угол'
                },
                default: 'top-right'
            },
            field: {
                name: 'Расположение лейбла о сериях',
                description: 'Выберите позицию лейбла на постере'
            },
            onChange: function (v) {
                InterFaceMod.settings.label_position = v;
                Lampa.Settings.update();
                Lampa.Noty.show('Для применения изменений откройте карточку сериала заново');
            }
        });

        // показать все кнопки
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: { name: 'show_buttons', type: 'trigger', default: true },
            field: { name: 'Показывать все кнопки', description: 'Отображать все кнопки действий в карточке' },
            onChange: function (v) {
                InterFaceMod.settings.show_buttons = v;
                Lampa.Settings.update();
            }
        });

        // тип контента
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: { name: 'season_info_show_movie_type', type: 'trigger', default: true },
            field: { name: 'Изменить лейблы типа', description: 'Изменить "TV" на "Сериал" и добавить лейбл "Фильм"' },
            onChange: function (v) {
                InterFaceMod.settings.show_movie_type = v;
                Lampa.Settings.update();
            }
        });

        // тема
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'theme_select',
                type: 'select',
                values: {
                    default: 'Нет',
                    bywolf_mod: 'Bywolf_mod',
                    dark_night: 'Dark Night bywolf',
                    blue_cosmos: 'Blue Cosmos',
                    neon: 'Neon',
                    sunset: 'Dark MOD',
                    emerald: 'Emerald V1',
                    aurora: 'Aurora'
                },
                default: 'default'
            },
            field: { name: 'Тема интерфейса', description: 'Выберите тему оформления интерфейса' },
            onChange: function (v) {
                InterFaceMod.settings.theme = v;
                Lampa.Settings.update();
                applyTheme(v);
            }
        });

        // цвет рейтингов
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: { name: 'colored_ratings', type: 'trigger', default: true },
            field: { name: 'Цветные рейтинги', description: 'Изменять цвет рейтинга в зависимости от оценки' },
            onChange: function (v) {
                var active = document.activeElement;
                InterFaceMod.settings.colored_ratings = v;
                Lampa.Settings.update();
                setTimeout(function () {
                    if (v) {
                        setupVoteColorsObserver();
                        setupVoteColorsForDetailPage();
                    } else {
                        $('.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate')
                            .css('color', '');
                    }
                    if (active && document.body.contains(active)) active.focus();
                }, 0);
            }
        });

        // цвет элементов
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: { name: 'colored_elements', type: 'trigger', default: true },
            field: { name: 'Цветные элементы', description: 'Отображать статусы сериалов и возрастные ограничения цветными' },
            onChange: function (v) {
                InterFaceMod.settings.colored_elements = v;
                Lampa.Settings.update();
                if (v) {
                    colorizeSeriesStatus();
                    colorizeAgeRating();
                } else {
                    $('.full-start__status').css({ backgroundColor: '', color: '', borderRadius: '', display: '' });
                    $('.full-start__pg').css({ backgroundColor: '', color: '' });
                }
            }
        });

        // загрузить сохранённые
        InterFaceMod.settings.seasons_info_mode    = Lampa.Storage.get('seasons_info_mode', 'aired');
        InterFaceMod.settings.label_position       = Lampa.Storage.get('label_position', 'top-right');
        InterFaceMod.settings.show_buttons         = Lampa.Storage.get('show_buttons', true);
        InterFaceMod.settings.show_movie_type      = Lampa.Storage.get('season_info_show_movie_type', true);
        InterFaceMod.settings.theme                = Lampa.Storage.get('theme_select', 'default');
        InterFaceMod.settings.colored_ratings      = Lampa.Storage.get('colored_ratings', true);
        InterFaceMod.settings.colored_elements     = Lampa.Storage.get('colored_elements', true);

        // применить тему сразу
        applyTheme(InterFaceMod.settings.theme);

        // запустить
        if (InterFaceMod.settings.enabled) addSeasonInfo();
        showAllButtons();
        changeMovieTypeLabels();
        if (InterFaceMod.settings.colored_ratings) {
            setupVoteColorsObserver();
            setupVoteColorsForDetailPage();
        }
        if (InterFaceMod.settings.colored_elements) {
            colorizeSeriesStatus();
            colorizeAgeRating();
        }
    }

    // ждём готовности
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

    // manifest & экспорт
    Lampa.Manifest.plugins = {
        name: 'Интерфейс мод',
        version: '2.2.0',
        description: 'Улучшенный интерфейс для приложения Lampa'
    };
    window.season_info = InterFaceMod;

})();
