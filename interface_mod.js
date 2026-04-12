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
            seasons_info_mode: 'none',
            show_episodes_on_main: false,
            label_position: 'top-right',
            show_buttons: false,
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
            // ИСПРАВЛЕНИЕ: Не добавляем лейблы внутри окна онлайн/эксплорера
            if ($(card).closest('.explorer, .layer--online, .select-box').length) {
                $(card).find('.content-label').remove();
                return;
            }
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

            var isPerson = $(card).hasClass('card--person') || $(card).closest('.scroll--persons, .items--persons, .crew').length > 0;
            if (isPerson) return;

            var hasMovieTraits = $(card).find('.card__age').length > 0 ||
                                 $(card).find('.card__vote').length > 0 ||
                                 /\b(19|20)\d{2}\b/.test($(card).text());
            if (!isTV && !hasMovieTraits) return;

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
        var old = document.getElementById('interface_mod_theme');
        if (old) old.remove();
        if (!theme || theme === 'default') return;

        var b = '.menu__item, .settings-folder, .settings-param, .selectbox-item, .full-start__button, .full-descr__tag, .player-panel .button, .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button, .menu__version';
        var f = '.menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus';
        var c = '.card.focus .card__view::after, .card.hover .card__view::after';
        var m = '.settings__content, .settings-input__content, .selectbox__content, .modal__content';
        var performanceCss = b + ' { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out, color 0.2s ease-out !important; } ';

        var themeCss = {
            emerald_v1: 
                'body { background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important; color: #dfdfdf !important; } ' +
                b + ' { border-radius: 1.0em !important; } ' +
                f + ' { background: linear-gradient(to right, #1a594d, #0e3652) !important; color: #fff !important; box-shadow: 0 2px 8px rgba(26,89,77,.25) !important; } ' +
                c + ' { border: 2px solid #1a594d !important; box-shadow: 0 0 10px rgba(26,89,77,.35) !important; border-radius: 1.0em !important; } ' +
                m + ' { background: rgba(12,22,25,.97) !important; border: 1px solid rgba(26,89,77,.12) !important; border-radius: 1.0em !important; }',
                
            emerald_v2: 
                'body { background: radial-gradient(1200px 600px at 70% 10%, #214a57 0%, transparent 60%), linear-gradient(135deg, #112229 0%, #15303a 45%, #0f1c22 100%) !important; color:#e6f2ef !important; } ' +
                b + ' { border-radius: .85em !important; } ' +
                f + ' { background: linear-gradient(90deg, rgba(38,164,131,0.95), rgba(18,94,138,0.95)) !important; color:#fff !important; -webkit-backdrop-filter: blur(2px) !important; backdrop-filter: blur(2px) !important; box-shadow:0 6px 18px rgba(18,94,138,.35) !important; } ' +
                c + ' { border: 3px solid rgba(38,164,131,0.9) !important; box-shadow: 0 0 20px rgba(38,164,131,.45) !important; border-radius: .9em !important; } ' +
                m + ' { background: rgba(10,24,29,0.98) !important; border: 1px solid rgba(38,164,131,.15) !important; border-radius: .9em !important; }',
                
            aurora: 
                'body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important; color: #ffffff !important; } ' +
                b + ' { border-radius: .85em !important; } ' +
                f + ' { background: linear-gradient(90deg, #aa4b6b, #6b6b83, #3b8d99) !important; color:#fff !important; box-shadow: 0 0 20px rgba(170,75,107,.35) !important; } ' +
                c + ' { border: 2px solid #aa4b6b !important; box-shadow: 0 0 22px rgba(170,75,107,.45) !important; border-radius: .9em !important; } ' +
                m + ' { background: rgba(20, 32, 39, 0.98) !important; border: 1px solid rgba(59,141,153,.18) !important; border-radius: .9em !important; }',
                
            netflix: 
                'body { background: #141414 !important; color: #ffffff !important; } ' +
                b + ' { border-radius: 0.4em !important; } ' +
                f + ' { background: #E50914 !important; color: #fff !important; box-shadow: 0 4px 15px rgba(229,9,20,.4) !important; } ' +
                c + ' { border: 3px solid #E50914 !important; box-shadow: 0 0 18px rgba(229,9,20,.5) !important; border-radius: 0.4em !important; } ' +
                m + ' { background: rgba(20, 20, 20, 0.98) !important; border: 1px solid rgba(229,9,20,.25) !important; border-radius: 0.4em !important; }',
                
            spotify: 
                'body { background: linear-gradient(135deg, #282828 0%, #121212 40%, #000000 100%) !important; color: #ffffff !important; } ' +
                b + ' { border-radius: 2em !important; } ' +
                f + ' { background: #1DB954 !important; color: #000 !important; box-shadow: 0 4px 15px rgba(29,185,84,.3) !important; font-weight: bold !important; } ' +
                c + ' { border: 3px solid #1DB954 !important; box-shadow: 0 0 15px rgba(29,185,84,.4) !important; border-radius: 0.6em !important; } ' +
                m + ' { background: rgba(18, 18, 18, 0.98) !important; border: 1px solid rgba(29,185,84,.2) !important; border-radius: 0.6em !important; }',
                
            cyberpunk: 
                'body { background: linear-gradient(135deg, #09090e 0%, #1a0b2e 100%) !important; color: #e0e0e0 !important; } ' +
                b + ' { border-radius: 0.3em !important; } ' +
                f + ' { background: linear-gradient(90deg, #ff003c, #00f0ff) !important; color: #fff !important; box-shadow: 0 0 15px rgba(255,0,60,.6) !important; } ' +
                c + ' { border: 2px solid #00f0ff !important; box-shadow: 0 0 20px rgba(0,240,255,.6), inset 0 0 10px rgba(255,0,60,.4) !important; border-radius: 0.3em !important; } ' +
                m + ' { background: rgba(10, 10, 15, 0.96) !important; border: 1px solid #ff003c !important; border-radius: 0.3em !important; }',
                
            amoled: 
                'body { background: #000000 !important; color: #dfdfdf !important; } ' +
                b + ' { border-radius: 0.5em !important; } ' +
                f + ' { background: #bb86fc !important; color: #000 !important; box-shadow: 0 0 12px rgba(187,134,252,.5) !important; font-weight: 600 !important; } ' +
                c + ' { border: 2px solid #bb86fc !important; box-shadow: 0 0 15px rgba(187,134,252,.4) !important; border-radius: 0.5em !important; } ' +
                m + ' { background: #0a0a0a !important; border: 1px solid rgba(187,134,252,.2) !important; border-radius: 0.5em !important; }',
                
            ocean: 
                'body { background: radial-gradient(circle at top right, #122238, #050a14) !important; color: #e6f1ff !important; } ' +
                b + ' { border-radius: 0.4em !important; } ' +
                f + ' { background: rgba(100,255,218,0.15) !important; color: #64ffda !important; box-shadow: 0 0 15px rgba(100,255,218,.25), inset 0 0 0 1px #64ffda !important; -webkit-backdrop-filter: blur(4px) !important; backdrop-filter: blur(4px) !important; } ' +
                c + ' { border: 2px solid #64ffda !important; box-shadow: 0 0 20px rgba(100,255,218,.3) !important; border-radius: 0.4em !important; } ' +
                m + ' { background: rgba(10, 18, 32, 0.98) !important; border: 1px solid rgba(100,255,218,.2) !important; border-radius: 0.4em !important; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important; }',

            dark_mint: 
                'body { background: linear-gradient(135deg, #050e0d 0%, #0a1614 50%, #11211e 100%) !important; color: #e6f2ef !important; } ' +
                b + ' { border-radius: 0.6em !important; } ' +
                f + ' { background: rgba(0, 184, 148, 0.15) !important; color: #00b894 !important; box-shadow: 0 0 15px rgba(0, 184, 148, 0.25), inset 0 0 0 1px #00b894 !important; -webkit-backdrop-filter: blur(4px) !important; backdrop-filter: blur(4px) !important; } ' +
                c + ' { border: 2px solid #00b894 !important; box-shadow: 0 0 20px rgba(0, 184, 148, 0.3) !important; border-radius: 0.8em !important; } ' +
                m + ' { background: rgba(5, 11, 10, 0.98) !important; border: 1px solid rgba(0, 184, 148, 0.2) !important; border-radius: 0.6em !important; }', 
                
            mint: 
                'body { background: linear-gradient(135deg, #122220 0%, #1c3633 50%, #254a46 100%) !important; color: #ffffff !important; } ' +
                b + ' { border-radius: 0.6em !important; } ' +
                f + ' { background: rgba(46, 204, 113, 0.15) !important; color: #2ecc71 !important; box-shadow: 0 0 15px rgba(46, 204, 113, 0.25), inset 0 0 0 1px #2ecc71 !important; -webkit-backdrop-filter: blur(4px) !important; backdrop-filter: blur(4px) !important; } ' +
                c + ' { border: 2px solid #2ecc71 !important; box-shadow: 0 0 20px rgba(46, 204, 113, 0.3) !important; border-radius: 0.8em !important; } ' +
                m + ' { background: rgba(18, 34, 32, 0.98) !important; border: 1px solid rgba(46, 204, 113, 0.2) !important; border-radius: 0.6em !important; }',  
                
            prime: 
                'body { background: linear-gradient(135deg, #1e2b3c 0%, #232f3e 100%) !important; color: #ffffff !important; } ' +
                b + ' { border-radius: 0.4em !important; } ' +
                f + ' { background: #00a8e1 !important; color: #fff !important; box-shadow: 0 4px 12px rgba(0, 168, 225, 0.4) !important; } ' +
                c + ' { border: 2px solid #00a8e1 !important; box-shadow: 0 0 15px rgba(0, 168, 225, 0.4) !important; border-radius: 0.4em !important; } ' +
                m + ' { background: rgba(30, 43, 60, 0.98) !important; border: 1px solid rgba(0, 168, 225, 0.2) !important; border-radius: 0.4em !important; }',
                
            twitch: 
                'body { background: radial-gradient(circle at 50% 0%, #201533 0%, #0e0e10 80%) !important; color: #efeff1 !important; } ' +
                b + ' { border-radius: 0.4em !important; } ' +
                f + ' { background: #9146FF !important; color: #fff !important; box-shadow: 0 4px 15px rgba(145, 70, 255, 0.4) !important; } ' +
                c + ' { border: 2px solid #9146FF !important; box-shadow: 0 0 15px rgba(145, 70, 255, 0.4) !important; border-radius: 0.4em !important; } ' +
                m + ' { background: rgba(24, 24, 27, 0.98) !important; border: 1px solid rgba(145, 70, 255, 0.2) !important; border-radius: 0.4em !important; }',
                
            apple: 
                'body { background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%) !important; color: #ffffff !important; } ' +
                b + ' { border-radius: 0.8em !important; } ' +
                f + ' { background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.15) 100%) !important; color: #fff !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 0 1.5px rgba(255, 255, 255, 0.6) !important; -webkit-backdrop-filter: blur(15px) !important; backdrop-filter: blur(15px) !important; } ' +
                c + ' { border: 2px solid rgba(255, 255, 255, 0.8) !important; box-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important; border-radius: 0.8em !important; } ' +
                m + ' { background: rgba(30, 30, 30, 0.2) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; border-radius: 1em !important; -webkit-backdrop-filter: blur(12px) !important; backdrop-filter: blur(12px) !important; }',
                
            hulu: 
                'body { background: radial-gradient(ellipse at top, #1a3020 0%, #0f1210 80%) !important; color: #ffffff !important; } ' +
                b + ' { border-radius: 0.4em !important; } ' +
                f + ' { background: #1ce783 !important; color: #000 !important; font-weight: bold !important; box-shadow: 0 4px 15px rgba(28, 231, 131, 0.3) !important; } ' +
                c + ' { border: 2px solid #1ce783 !important; box-shadow: 0 0 15px rgba(28, 231, 131, 0.3) !important; border-radius: 0.4em !important; } ' +
                m + ' { background: rgba(15, 18, 16, 0.98) !important; border: 1px solid rgba(28, 231, 131, 0.2) !important; border-radius: 0.4em !important; }'
        };

        var st = document.createElement('style');
        st.id = 'interface_mod_theme';
        st.textContent = performanceCss + (themeCss[theme] || ''); 
        document.head.appendChild(st);
    }

/*** 5) ЦВЕТНЫЕ РЕЙТИНГИ И СТАТУСЫ ***/
function updateVoteColors() {
    if (!InterFaceMod.settings.colored_ratings) return;

    function apply(el) {
        // ИСПРАВЛЕНИЕ: ИСПРАВЛЕНИЕ: Не красим explorer-card (окно выбора серий)
        if ($(el).closest('.explorer').length) return;
        
        var text = $(el).text().trim();
        var m = text.match(/(\d+[\.,]\d+|\d+)/);
        if (!m) return;
        var v = parseFloat(m[0].replace(',', '.'));
        if (isNaN(v)) return;

        var c = v <= 3 ? 'red'
              : v < 6  ? 'orange'
              : v < 8  ? 'cornflowerblue'
              : 'lawngreen';

        $(el).css('color', c);
    }

    // ИСПРАВЛЕНИЕ: Убрали .explorer-card__head-rate span из списка селекторов
    $('.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function(){
        apply(this);
    });
}

function setupVoteColorsObserver() {
    if (!InterFaceMod.settings.colored_ratings) return;

    setTimeout(updateVoteColors, 500);

    new MutationObserver(function(){
        setTimeout(updateVoteColors, 100);
    }).observe(document.body, { childList: true, subtree: true });
}

function setupVoteColorsForDetailPage() {
    if (!InterFaceMod.settings.colored_ratings) return;

    Lampa.Listener.follow('full', function (d) {
        if (d.type === 'complite') {
            setTimeout(updateVoteColors, 100);
        }
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
        kids:        { bg: '#2ecc71', text: 'white' },   // зелёный
        children:    { bg: '#3498db', text: 'white' },   // синий
        teens:       { bg: '#f1c40f', text: 'black' },    // жёлтый
        almostAdult: { bg: '#e67e22', text: 'white' },   // оранжевый
        adult:       { bg: '#e74c3c', text: 'white' }    // красный
    };

    function apply(el) {
        // ИСПРАВЛЕНИЕ: Не красим элементы внутри explorer (окно выбора серий)
        if ($(el).closest('.explorer').length) return;

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
                borderRadius: '0.3em',
                padding: '0.2em 0.4em',
                display: 'inline-block'
            });
        }
    }

    // ИСПРАВЛЕНИЕ: Убрали .explorer-card__head-age из селекторов
    $('.full-start__pg').each(function(){ apply(this); });

    // Наблюдатель за новыми элементами
    new MutationObserver(function (muts) {
        muts.forEach(function (m) {
            if (m.addedNodes) {
                // ИСПРАВЛЕНИЕ: Убрали .explorer-card__head-age
                $(m.addedNodes).find('.full-start__pg').each(function(){ apply(this); });
                if ($(m.addedNodes).hasClass('full-start__pg')) {
                    apply(m.addedNodes);
                }
            }
        });
    }).observe(document.body, { childList: true, subtree: true });

    // При открытии детальной карточки (на всякий случай)
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
                default: 'none'
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
            param: { name: 'show_buttons', type: 'trigger', default: false },
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
                    'default': 'По умолчанию',
                    'emerald_v1': 'Изумруд V1',
                    'emerald_v2': 'Изумруд V2',
                    'aurora': 'Аврора',
                    'netflix': 'Netflix стиль',
                    'spotify': 'Spotify Dark',
                    'cyberpunk': 'Киберпанк неон',
                    'amoled': 'AMOLED Black',
                    'ocean': 'Ocean Glass',
                    'mint': 'Mint Fresh',
                    'dark_mint': 'Dark Mint',
                    'prime': 'Prime Blue',
                    'twitch': 'Twitch Dark',
                    'apple': 'Apple Glass',
                    'hulu': 'Hulu Green'
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

        function moveAfterInterface() {
            var $folders = $('.settings-folder');
            var $interface = $folders.filter(function () {
                return $(this).data('component') === 'interface';
            });
            var $mod = $folders.filter(function () {
                return $(this).data('component') === 'season_info';
            });
            if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
        }

        var moveTries = 0,
            moveTimer = setInterval(function () {
                moveAfterInterface();
                if (++moveTries >= 40) clearInterval(moveTimer);
            }, 150);

        new MutationObserver(function () {
            moveAfterInterface();
        }).observe(document.body, { childList: true, subtree: true });

        // загрузить сохранённые
        InterFaceMod.settings.seasons_info_mode    = Lampa.Storage.get('seasons_info_mode', 'none');
        InterFaceMod.settings.label_position       = Lampa.Storage.get('label_position', 'top-right');
        InterFaceMod.settings.show_buttons         = Lampa.Storage.get('show_buttons', false);
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
