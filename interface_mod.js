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
            colored_ratings: true,
            seasons_info_mode: 'aired',
            show_episodes_on_main: false,
            label_position: 'top-right',
            show_buttons: true,
            colored_elements: true
        }
    };

    function addSeasonInfo() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && data.data.movie.number_of_seasons) {
                if (InterFaceMod.settings.seasons_info_mode === 'none') return;
                var movie = data.data.movie;
                var totalSeasons = movie.number_of_seasons || 0;
                var totalEpisodes = movie.number_of_episodes || 0;
                var airedSeasons = 0;
                var airedEpisodes = 0;
                var currentDate = new Date();
                if (movie.seasons) {
                    movie.seasons.forEach(function(season) {
                        if (season.season_number === 0) return;
                        var seasonAired = false;
                        var seasonEpisodes = 0;
                        if (season.air_date) {
                            var airDate = new Date(season.air_date);
                            if (airDate <= currentDate) {
                                seasonAired = true;
                                airedSeasons++;
                            }
                        }
                        if (season.episodes) {
                            season.episodes.forEach(function(episode) {
                                if (episode.air_date) {
                                    var epAirDate = new Date(episode.air_date);
                                    if (epAirDate <= currentDate) {
                                        seasonEpisodes++;
                                        airedEpisodes++;
                                    }
                                }
                            });
                        } else if (seasonAired && season.episode_count) {
                            seasonEpisodes = season.episode_count;
                            airedEpisodes += seasonEpisodes;
                        }
                    });
                } else if (movie.last_episode_to_air) {
                    airedSeasons = movie.last_episode_to_air.season_number || 0;
                    if (movie.season_air_dates) {
                        airedEpisodes = movie.season_air_dates.reduce(function(sum, s) {
                            return sum + (s.episode_count || 0);
                        }, 0);
                    } else if (movie.last_episode_to_air.episode_number) {
                        var lastSeason = movie.last_episode_to_air.season_number;
                        var lastEpisode = movie.last_episode_to_air.episode_number;
                        if (movie.seasons) {
                            airedEpisodes = 0;
                            movie.seasons.forEach(function(season) {
                                if (season.season_number === 0) return;
                                if (season.season_number < lastSeason) {
                                    airedEpisodes += season.episode_count || 0;
                                } else if (season.season_number === lastSeason) {
                                    airedEpisodes += lastEpisode;
                                }
                            });
                        } else {
                            var prevSeasonsEpisodes = 0;
                            if (lastSeason > 1) {
                                prevSeasonsEpisodes = (lastSeason - 1) * 10;
                            }
                            airedEpisodes = prevSeasonsEpisodes + lastEpisode;
                        }
                    }
                }
                if (airedSeasons === 0) airedSeasons = totalSeasons;
                if (airedEpisodes === 0) airedEpisodes = totalEpisodes;
                if (movie.next_episode_to_air) {
                    var nextSeason = movie.next_episode_to_air.season_number;
                    var nextEpisode = movie.next_episode_to_air.episode_number;
                    if (totalEpisodes > 0 && movie.seasons) {
                        var remaining = 0;
                        movie.seasons.forEach(function(season) {
                            if (season.season_number === nextSeason) {
                                remaining += (season.episode_count || 0) - nextEpisode + 1;
                            } else if (season.season_number > nextSeason) {
                                remaining += season.episode_count || 0;
                            }
                        });
                        var calcAired = totalEpisodes - remaining;
                        if (calcAired >= 0 && calcAired <= totalEpisodes) {
                            airedEpisodes = calcAired;
                        }
                    }
                }
                if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) {
                    airedEpisodes = totalEpisodes;
                }
                function plural(n, one, two, five) {
                    var x = Math.abs(n) % 100;
                    if (x >= 5 && x <= 20) return five;
                    x = x % 10;
                    if (x === 1) return one;
                    if (x >= 2 && x <= 4) return two;
                    return five;
                }
                function getStatusText(st) {
                    if (st === 'Ended') return 'Завершён';
                    if (st === 'Canceled') return 'Отменён';
                    if (st === 'Returning Series') return 'Выходит';
                    if (st === 'In Production') return 'В производстве';
                    return st || 'Неизвестно';
                }
                var status = movie.status;
                var isCompleted = (status === 'Ended' || status === 'Canceled');
                var bgColor = isCompleted ? 'rgba(33, 150, 243, 0.8)' : 'rgba(244, 67, 54, 0.8)';
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
                var text = '';
                if (isCompleted) {
                    text = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText + '\n' + getStatusText(status);
                } else {
                    if (InterFaceMod.settings.seasons_info_mode === 'aired' && totalEpisodes > 0 && airedEpisodes < totalEpisodes && airedEpisodes > 0) {
                        text = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText + ' из ' + totalEpisodes;
                    } else {
                        text = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
                    }
                }
                var info = $('<div class="season-info-label">' + text + '</div>');
                var pos = InterFaceMod.settings.label_position || 'top-right';
                var posStyles = {
                    'top-right': { top: '1.4em', right: '-0.8em' },
                    'top-left': { top: '1.4em', left: '-0.8em' },
                    'bottom-right': { bottom: '1.4em', right: '-0.8em' },
                    'bottom-left': { bottom: '1.4em', left: '-0.8em' }
                };
                var styles = $.extend({ position: 'absolute', backgroundColor: bgColor, color: 'white', padding: '0.4em 0.6em', borderRadius: '0.3em', fontSize: '0.8em', zIndex: '999', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.2em', backdropFilter: 'blur(2px)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }, posStyles[pos]);
                info.css(styles);
                setTimeout(function() {
                    var poster = $(data.object.activity.render()).find('.full-start-new__poster');
                    poster.css('position', 'relative').append(info);
                }, 100);
            }
        });
    }

    function showAllButtons() {
        var style = document.createElement('style');
        style.innerHTML = '.full-start-new__buttons, .full-start__buttons { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; }';
        document.head.appendChild(style);
        var originBuild = Lampa.FullCard && Lampa.FullCard.build;
        if (originBuild) {
            Lampa.FullCard.build = function(data) {
                var card = originBuild(data);
                card.organizeButtons = function() {
                    var el = card.activity.render();
                    var container = el.find('.full-start-new__buttons, .full-start__buttons, .buttons-container');
                    var buttons = [];
                    ['.full-start__button', '.button'].forEach(function(sel) {
                        container.find(sel).each(function() { buttons.push(this); });
                    });
                    var cats = { online: [], torrent: [], trailer: [], other: [] };
                    var seen = {};
                    buttons.forEach(function(btn) {
                        var txt = $(btn).text().trim();
                        if (!txt || seen[txt]) return; seen[txt] = true;
                        var cls = btn.className || '';
                        if (cls.includes('online')) cats.online.push(btn);
                        else if (cls.includes('torrent')) cats.torrent.push(btn);
                        else if (cls.includes('trailer')) cats.trailer.push(btn);
                        else cats.other.push(btn);
                    });
                    container.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' }).empty();
                    ['online','torrent','trailer','other'].forEach(function(cat) {
                        cats[cat].forEach(function(b) { container.append(b); });
                    });
                };
                card.onCreate = function() { if (InterFaceMod.settings.show_buttons) setTimeout(card.organizeButtons, 300); };
                return card;
            };
        }
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && !Lampa.FullCard) {
                setTimeout(showAllButtons, 300);
            }
        });
        new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                if (m.addedNodes.length && InterFaceMod.settings.show_buttons) {
                    if (Lampa.FullCard && Lampa.Activity.active().activity.card.organizeButtons) {
                        setTimeout(function() { Lampa.Activity.active().activity.card.organizeButtons(); }, 100);
                    }
                }
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    function changeMovieTypeLabels() {
        var styleTag = $('<style>').html('.content-label { position:absolute; top:1.4em; left:-0.8em; color:white; padding:0.4em 0.4em; border-radius:0.3em; font-size:0.8em; z-index:10; } .serial-label{background-color:#3498db;} .movie-label{background-color:#2ecc71;} body[data-movie-labels="off"] .card--tv .card__type{display:none;}');
        $('head').append(styleTag);
        $('body').attr('data-movie-labels', InterFaceMod.settings.show_movie_type ? 'on' : 'off');
        function processCard(card) {
            if (!InterFaceMod.settings.show_movie_type) return;
            if ($(card).find('.content-label').length) return;
            var view = $(card).find('.card__view'); if (!view.length) return;
            var data = {}, cd = $(card).attr('data-card'); try { if (cd) data = JSON.parse(cd); } catch(e){}
            var djd = $(card).data(); if (djd) Object.assign(data, djd);
            var is_tv = data.type==='tv'||data.seasons||data.number_of_seasons>0;
            if (!is_tv) {
                if ($(card).hasClass('card--tv')||$(card).data('card_type')==='tv') is_tv = true;
            }
            var lbl = $('<div class="content-label"></div>').addClass(is_tv?'serial-label':'movie-label').text(is_tv?'Сериал':'Фильм');
            view.append(lbl);
        }
        function scan() { $('.card').each(function() { processCard(this); }); }
        Lampa.Listener.follow('full', function(d) { if (d.type==='complite') scan(); });
        new MutationObserver(function(m){ m.forEach(function(x){ if(x.addedNodes.length){ scan(); } }); }).observe(document.body, { childList:true, subtree:true });
        setInterval(scan, 2000);
    }

    function updateVoteColors() {
        function apply(el) {
            var txt = $(el).text(), m = txt.match(/(\d+(\.\d+)?)/); if(!m) return;
            var v = parseFloat(m[0]);
            var c = v<=3? 'red': v<6?'orange': v<8?'cornflowerblue':'lawngreen';
            $(el).css('color', c);
        }
        $('.card__vote, .full-start__rate, .info__rate, .card__imdb-rate').each(function(){ apply(this); });
    }

    function setupVoteColorsObserver() {
        setTimeout(updateVoteColors, 500);
        new MutationObserver(function(){ setTimeout(updateVoteColors,100); }).observe(document.body,{childList:true, subtree:true});
    }

    function setupVoteColorsForDetailPage() {
        Lampa.Listener.follow('full', function(d){ if (d.type==='complite') setTimeout(updateVoteColors,100); });
    }

    function colorizeSeriesStatus() {
        function apply(el) {
            var txt=$(el).text(); var bg, txtc;
            if(/Заверш|Ended/.test(txt)){ bg='rgba(46,204,113,0.8)'; txtc='white'; }
            else if(/Отмен|Canceled/.test(txt)){ bg='rgba(231,76,60,0.8)'; txtc='white'; }
            else if(/Онгоинг|Выходит/.test(txt)){ bg='rgba(243,156,18,0.8)'; txtc='black'; }
            else if(/производстве|Production/.test(txt)){ bg='rgba(52,152,219,0.8)'; txtc='white'; }
            if(bg) $(el).css({ backgroundColor:bg, color:txtc, borderRadius:'0.3em', display:'inline-block', fontSize:'1.3em' });
        }
        $('.full-start__status').each(function(){ apply(this); });
        new MutationObserver(function(m){ m.forEach(function(mut){ $(mut.target).find('.full-start__status').each(function(){ apply(this); }); }); }).observe(document.body,{childList:true, subtree:true});
        Lampa.Listener.follow('full', function(d){ if(d.type==='complite') setTimeout(function(){ $('.full-start__status').each(function(){ apply(this); }); },100); });
    }

    function colorizeAgeRating() {
        var map={kids:['0+','3+'],children:['6+','7+'],teens:['12+','13+'],almostAdult:['16+','17+'],adult:['18+']};
        var cols={kids:{bg:'#2ecc71',tc:'white'},children:{bg:'#3498db',tc:'white'},teens:{bg:'#f1c40f',tc:'black'},almostAdult:{bg:'#e67e22',tc:'white'},adult:{bg:'#e74c3c',tc:'white'}};
        function apply(el){ var txt=$(el).text(); for(var g in map){ if(map[g].some(function(x){return txt.includes(x);})){ $(el).css({ backgroundColor:cols[g].bg, color:cols[g].tc, borderRadius:'0.3em', fontSize:'1.3em' }); return; } }}
        $('.full-start__pg').each(function(){ apply(this); });
        new MutationObserver(function(m){ m.forEach(function(mut){ $(mut.target).find('.full-start__pg').each(function(){ apply(this); }); }); }).observe(document.body,{childList:true, subtree:true});
        Lampa.Listener.follow('full', function(d){ if(d.type==='complite') setTimeout(function(){ $('.full-start__pg').each(function(){ apply(this); }); },100); });
    }

    function startPlugin() {
        Lampa.SettingsApi.addComponent({ component: 'season_info', name: 'Интерфейс мод', icon: '' });
        Lampa.SettingsApi.addParam({ component: 'season_info', param:{ name:'seasons_info_mode', type:'select', values:{ none:'Выключить', aired:'Актуальная информация', total:'Полное количество' }, default:'aired'}, field:{ name:'Информация о сериях', description:'Выберите как отображать информацию о сериях и сезонах'}, onChange:function(v){ InterFaceMod.settings.seasons_info_mode=v; InterFaceMod.settings.enabled = (v!=='none'); Lampa.Settings.update(); }});
        Lampa.SettingsApi.addParam({ component:'season_info', param:{ name:'label_position', type:'select', values:{ 'top-right':'Верхний правый угол','top-left':'Верхний левый угол','bottom-right':'Нижний правый угол','bottom-left':'Нижний левый угол'}, default:'top-right'}, field:{ name:'Позиция метки', description:''}, onChange:function(v){ InterFaceMod.settings.label_position=v; Lampa.Settings.update(); }});
        Lampa.SettingsApi.addParam({ component:'season_info', param:{ name:'show_buttons', type:'trigger', default:true}, field:{ name:'Показывать кнопки', description:''}, onChange:function(v){ InterFaceMod.settings.show_buttons=v; Lampa.Settings.update(); }});
        Lampa.SettingsApi.addParam({ component:'season_info', param:{ name:'season_info_show_movie_type', type:'trigger', default:true}, field:{ name:'Тип метки', description:''}, onChange:function(v){ InterFaceMod.settings.show_movie_type=v; Lampa.Settings.update(); }});
        Lampa.SettingsApi.addParam({ component:'season_info', param:{ name:'colored_ratings', type:'trigger', default:true}, field:{ name:'Цветные рейтинги', description:''}, onChange:function(v){ InterFaceMod.settings.colored_ratings=v; Lampa.Settings.update(); setupVoteColorsObserver(); setupVoteColorsForDetailPage(); }});
        Lampa.SettingsApi.addParam({ component:'season_info', param:{ name:'colored_elements', type:'trigger', default:true}, field:{ name:'Цветные элементы', description:''}, onChange:function(v){ InterFaceMod.settings.colored_elements=v; Lampa.Settings.update(); colorizeSeriesStatus(); colorizeAgeRating(); }});

        InterFaceMod.settings.show_buttons = Lampa.Storage.get('show_buttons', true);
        InterFaceMod.settings.show_movie_type = Lampa.Storage.get('season_info_show_movie_type', true);
        InterFaceMod.settings.colored_ratings = Lampa.Storage.get('colored_ratings', true);
        InterFaceMod.settings.colored_elements = Lampa.Storage.get('colored_elements', true);
        InterFaceMod.settings.seasons_info_mode = Lampa.Storage.get('seasons_info_mode', 'aired');
        InterFaceMod.settings.show_episodes_on_main = Lampa.Storage.get('show_episodes_on_main', false);
        InterFaceMod.settings.label_position = Lampa.Storage.get('label_position', 'top-right');
        InterFaceMod.settings.enabled = (InterFaceMod.settings.seasons_info_mode !== 'none');

        if (InterFaceMod.settings.enabled) addSeasonInfo();
        showAllButtons();
        changeMovieTypeLabels();
        if (InterFaceMod.settings.colored_ratings) { setupVoteColorsObserver(); setupVoteColorsForDetailPage(); }
        if (InterFaceMod.settings.colored_elements) { colorizeSeriesStatus(); colorizeAgeRating(); }

        Lampa.Listener.follow('open', function(e){ setTimeout(function(){ var mod = $('.settings-folder[data-component="season_info"]'), std = $('.settings-folder[data-component="interface"]'); if(mod.length&&std.length) mod.insertAfter(std); },100); });
    }

    if (window.appready) startPlugin(); else Lampa.Listener.follow('app', function(evt){ if(evt.type==='ready') startPlugin(); });

    Lampa.Manifest.plugins = { name:'Интерфейс мод', version:'2.2.0', description:'Улучшенный интерфейс для приложения Lampa' };
    window.season_info = InterFaceMod;
})();
