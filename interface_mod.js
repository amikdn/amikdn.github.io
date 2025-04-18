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

    function addSeasonInfo() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && data.data.movie.number_of_seasons) {
                if (InterFaceMod.settings.seasons_info_mode === 'none') return;
                var movie = data.data.movie;
                var status = movie.status;
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
                        airedEpisodes = movie.season_air_dates.reduce(function(sum, season) {
                            return sum + (season.episode_count || 0);
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
                                for (var i = 1; i < lastSeason; i++) {
                                    prevSeasonsEpisodes += 10;
                                }
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
                    if (totalEpisodes > 0) {
                        var episodesInNextSeason = 0;
                        var remainingEpisodes = 0;
                        if (movie.seasons) {
                            movie.seasons.forEach(function(season) {
                                if (season.season_number === nextSeason) {
                                    episodesInNextSeason = season.episode_count || 0;
                                    remainingEpisodes = (season.episode_count || 0) - nextEpisode + 1;
                                } else if (season.season_number > nextSeason) {
                                    remainingEpisodes += season.episode_count || 0;
                                }
                            });
                        }
                        if (remainingEpisodes > 0) {
                            var calculatedAired = totalEpisodes - remainingEpisodes;
                            if (calculatedAired >= 0 && calculatedAired <= totalEpisodes) {
                                airedEpisodes = calculatedAired;
                            }
                        }
                    }
                }

                if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) {
                    airedEpisodes = totalEpisodes;
                }

                function plural(number, one, two, five) {
                    let n = Math.abs(number);
                    n %= 100;
                    if (n >= 5 && n <= 20) {
                        return five;
                    }
                    n %= 10;
                    if (n === 1) {
                        return one;
                    }
                    if (n >= 2 && n <= 4) {
                        return two;
                    }
                    return five;
                }

                function getStatusText(status) {
                    if (status === 'Ended') return 'Завершён';
                    if (status === 'Canceled') return 'Отменён';
                    if (status === 'Returning Series') return 'Выходит';
                    if (status === 'In Production') return 'В производстве';
                    return status || 'Неизвестно';
                }

                var displaySeasons, displayEpisodes, seasonsText, episodesText;
                var isCompleted = (status === 'Ended' || status === 'Canceled');
                var bgColor = isCompleted ? 'rgba(33, 150, 243, 0.8)' : 'rgba(244, 67, 54, 0.8)';

                if (InterFaceMod.settings.seasons_info_mode === 'aired') {
                    displaySeasons = airedSeasons;
                    displayEpisodes = airedEpisodes;
                    seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                    episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                } else if (InterFaceMod.settings.seasons_info_mode === 'total') {
                    displaySeasons = totalSeasons;
                    displayEpisodes = totalEpisodes;
                    seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                    episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                } else {
                    return;
                }

                var infoElement = $('<div class="season-info-label"></div>');

                if (isCompleted) {
                    var seasonEpisodeText = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
                    var statusText = getStatusText(status);
                    infoElement.append($('<div></div>').text(seasonEpisodeText)).append($('<div></div>').text(statusText));
                } else {
                    var text = '';
                    if (InterFaceMod.settings.seasons_info_mode === 'aired') {
                        if (totalEpisodes > 0 && airedEpisodes < totalEpisodes) {
                            if (airedEpisodes > 0) {
                                text = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText + ' из ' + totalEpisodes;
                            } else {
                                text = displaySeasons + ' ' + seasonsText + ' ' + totalEpisodes + ' ' + episodesText;
                            }
                        } else {
                            text = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText;
                        }
                    } else {
                        text = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
                    }
                    infoElement.append($('<div></div>').text(text));
                }

                var positionStyles = {
                    'top-right': { position: 'absolute', top: '1.4em', right: '-0.8em' },
                    'top-left': { position: 'absolute', top: '1.4em', left: '-0.8em' },
                    'bottom-right': { position: 'absolute', bottom: '1.4em', right: '-0.8em' },
                    'bottom-left': { position: 'absolute', bottom: '1.4em', left: '-0.8em' }
                };
                var position = InterFaceMod.settings.label_position || 'top-right';
                var positionStyle = positionStyles[position] || positionStyles['top-right'];
                var commonStyles = {
                    'background-color': bgColor,
                    'color': 'white',
                    'padding': '0.4em 0.6em',
                    'border-radius': '0.3em',
                    'font-size': '0.8em',
                    'z-index': '999',
                    'text-align': 'center',
                    'white-space': 'nowrap',
                    'line-height': '1.2em',
                    'backdrop-filter': 'blur(2px)',
                    'box-shadow': '0 2px 5px rgba(0, 0, 0, 0.2)'
                };
                var allStyles = $.extend({}, commonStyles, positionStyle);

                infoElement.css(allStyles);

                setTimeout(function() {
                    var poster = $(data.object.activity.render()).find('.full-start-new__poster');
                    if (poster.length) {
                        poster.css('position', 'relative');
                        poster.append(infoElement);
                    }
                }, 100);
            }
        });
    }

    function showAllButtons() {
        var buttonStyle = document.createElement('style');
        buttonStyle.id = 'interface_mod_buttons_style';
        buttonStyle.innerHTML = `
            .full-start-new__buttons, .full-start__buttons { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; }
        `;
        document.head.appendChild(buttonStyle);
        var originFullCard;
        if (Lampa.FullCard) {
            originFullCard = Lampa.FullCard.build;
            Lampa.FullCard.build = function(data) {
                var card = originFullCard(data);
                card.organizeButtons = function() {
                    var activity = card.activity;
                    if (!activity) return;
                    var element = activity.render();
                    if (!element) return;
                    var targetContainer = element.find('.full-start-new__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.full-start__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.buttons-container');
                    if (!targetContainer.length) return;
                    var allButtons = [];
                    var buttonSelectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button',
                        '.full-start-new__buttons .button',
                        '.full-start__buttons .button'
                    ];
                    buttonSelectors.forEach(function(selector) {
                        element.find(selector).each(function() {
                            allButtons.push(this);
                        });
                    });
                    if (allButtons.length === 0) return;
                    var categories = { online: [], torrent: [], trailer: [], other: [] };
                    var addedButtonTexts = {};
                    $(allButtons).each(function() {
                        var button = this;
                        var buttonText = $(button).text().trim();
                        var className = button.className || '';
                        if (!buttonText || addedButtonTexts[buttonText]) return;
                        addedButtonTexts[buttonText] = true;
                        if (className.includes('online')) categories.online.push(button);
                        else if (className.includes('torrent')) categories.torrent.push(button);
                        else if (className.includes('trailer')) categories.trailer.push(button);
                        else categories.other.push(button);
                    });
                    var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                    var needToggle = Lampa.Controller.enabled().name === 'full_start';
                    if (needToggle) Lampa.Controller.toggle('settings_component');
                    targetContainer.children().detach();
                    targetContainer.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' });
                    buttonSortOrder.forEach(function(category) {
                        categories[category].forEach(function(button) {
                            targetContainer.append(button);
                        });
                    });
                    if (needToggle) {
                        setTimeout(function() { Lampa.Controller.toggle('full_start'); }, 100);
                    }
                };
                card.onCreate = function() {
                    if (InterFaceMod.settings.show_buttons) {
                        setTimeout(function() { card.organizeButtons(); }, 300);
                    }
                };
                return card;
            };
        }
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.object && e.object.activity && InterFaceMod.settings.show_buttons && !Lampa.FullCard) {
                setTimeout(function() {
                    var fullContainer = e.object.activity.render();
                    var targetContainer = fullContainer.find('.full-start-new__buttons') || fullContainer.find('.full-start__buttons') || fullContainer.find('.buttons-container');
                    if (!targetContainer.length) return;
                    targetContainer.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' });
                    var allButtons = [];
                    var buttonSelectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button',
                        '.full-start-new__buttons .button',
                        '.full-start__buttons .button'
                    ];
                    buttonSelectors.forEach(function(selector) { fullContainer.find(selector).each(function() { allButtons.push(this); }); });
                    if (allButtons.length === 0) return;
                    var categories = { online: [], torrent: [], trailer: [], other: [] };
                    var addedButtonTexts = {};
                    $(allButtons).each(function() {
                        var button = this;
                        var buttonText = $(button).text().trim();
                        var className = button.className || '';
                        if (!buttonText || addedButtonTexts[buttonText]) return;
                        addedButtonTexts[buttonText] = true;
                        if (className.includes('online')) categories.online.push(button);
                        else if (className.includes('torrent')) categories.torrent.push(button);
                        else if (className.includes('trailer')) categories.trailer.push(button);
                        else categories.other.push(button);
                    });
                    var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                    var needToggle = Lampa.Controller.enabled().name === 'full_start';
                    if (needToggle) Lampa.Controller.toggle('settings_component');
                    buttonSortOrder.forEach(function(category) { categories[category].forEach(function(button) { targetContainer.append(button); }); });
                    if (needToggle) setTimeout(function() { Lampa.Controller.toggle('full_start'); }, 100);
                }, 300);
            }
        });
        var buttonObserver = new MutationObserver(function(mutations) {
            if (!InterFaceMod.settings.show_buttons) return;
            var needReorganize = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && (mutation.target.classList.contains('full-start-new__buttons') || mutation.target.classList.contains('full-start__buttons') || mutation.target.classList.contains('buttons-container'))) {
                    needReorganize = true;
                }
            });
            if (needReorganize) {
                setTimeout(function() {
                    if (Lampa.FullCard && Lampa.Activity.active() && Lampa.Activity.active().activity.card && typeof Lampa.Activity.active().activity.card.organizeButtons === 'function') {
                        Lampa.Activity.active().activity.card.organizeButtons();
                    }
                }, 100);
            }
        });
        buttonObserver.observe(document.body, { childList: true, subtree: true });
    }

    function changeMovieTypeLabels() {
        var styleTag = $('<style id="movie_type_styles"></style>').html(`
            .content-label { position: absolute !important; top: 1.4em !important; left: -0.8em !important; color: white !important; padding: 0.4em 0.4em !important; border-radius: 0.3em !important; font-size: 0.8em !important; z-index: 10 !important; }
            .serial-label { background-color: #3498db !important; }
            .movie-label { background-color: #2ecc71 !important; }
            body[data-movie-labels="on"] .card--tv .card__type { display: none !important; }
        `);
        $('head').append(styleTag);
        $('body').attr('data-movie-labels', InterFaceMod.settings.show_movie_type ? 'on' : 'off');

        function addLabelToCard(card) {
            if (!InterFaceMod.settings.show_movie_type) return;
            if ($(card).find('.content-label').length) return;
            var view = $(card).find('.card__view');
            if (!view.length) return;
            var metadata = {};
            try {
                var cardData = $(card).attr('data-card');
                if (cardData) metadata = JSON.parse(cardData);
                var jqData = $(card).data();
                if (jqData && Object.keys(jqData).length > 0) metadata = Object.assign(metadata, jqData);
                if (Lampa.Card && $(card).attr('id')) {
                    var cardObj = Lampa.Card.get($(card).attr('id'));
                    if (cardObj) metadata = Object.assign(metadata, cardObj);
                }
                if (Lampa.Storage && Lampa.Storage.cache) {
                    var itemId = $(card).data('id') || $(card).attr('data-id') || (metadata.id || null);
                    var cachedData = itemId && Lampa.Storage.cache('card_' + itemId);
                    if (cachedData) metadata = Object.assign(metadata, cachedData);
                }
            } catch (e) {}

            var is_tv = false;
            if (metadata) {
                if (['tv','serial'].includes(metadata.type) || ['tv','serial'].includes(metadata.card_type)) is_tv = true;
                else if (metadata.seasons || metadata.number_of_seasons > 0 || metadata.seasons_count > 0) is_tv = true;
                else if (metadata.episodes || metadata.number_of_episodes > 0) is_tv = true;
                else if (metadata.isSeries || metadata.is_series || metadata.isSerial || metadata.is_serial) is_tv = true;
            }
            if (!is_tv) {
                if ($(card).hasClass('card--tv') || $(card).data('card_type')==='tv' || $(card).data('type')==='tv') is_tv = true;
                else if ($(card).find('.card__type, .card__temp').text().match(/(сезон|серия|эпизод|ТВ|TV)/i)) is_tv = true;
            }

            var label = $('<div class="content-label"></div>');
            if (is_tv) { label.addClass('serial-label').text('Сериал').data('type','serial'); }
            else { label.addClass('movie-label').text('Фильм').data('type','movie'); }

            view.append(label);
        }

        function updateCardLabel(card) {
            if (!InterFaceMod.settings.show_movie_type) return;
            $(card).find('.content-label').remove();
            addLabelToCard(card);
        }

        function processAllCards() {
            if (!InterFaceMod.settings.show_movie_type) return;
            $('.card').each(function() { addLabelToCard(this); });
        }

        Lampa.Listener.follow('full', function(data) {
            if (data.type==='complite' && data.data.movie) {
                var movie=data.data.movie;
                var posterContainer=$(data.object.activity.render()).find('.full-start__poster');
                if (posterContainer.length) {
                    var is_tv = movie.number_of_seasons>0||movie.seasons||movie.season_count>0||movie.type==='tv'||movie.card_type==='tv';
                    if (InterFaceMod.settings.show_movie_type) {
                        posterContainer.find('.content-label').remove();
                        var label=$('<div class="content-label"></div>').css({position:'absolute',top:'1.4em',left:'-0.8em',color:'white',padding:'0.4em 0.4em',borderRadius:'0.3em',fontSize:'0.8em',zIndex:10});
                        if (is_tv) { label.addClass('serial-label').text('Сериал').css('backgroundColor','#3498db'); }
                        else { label.addClass('movie-label').text('Фильм').css('backgroundColor','#2ecc71'); }
                        posterContainer.css('position','relative').append(label);
                    }
                }
            }
        });

        var observer=new MutationObserver(function(mutations){
            var needCheck=false;
            var cardsToUpdate=new Set();
            mutations.forEach(function(mutation){
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function(node){ if ($(node).hasClass('card')) { cardsToUpdate.add(node); needCheck=true; } else if ($(node).find('.card').length) { $(node).find('.card').each(function(){cardsToUpdate.add(this);}); needCheck=true;} });
                }
                if (mutation.type==='attributes' && ['class','data-card','data-type'].includes(mutation.attributeName) && $(mutation.target).hasClass('card')) {cardsToUpdate.add(mutation.target);needCheck=true;}
            });
            if (needCheck) { setTimeout(function(){cardsToUpdate.forEach(function(card){updateCardLabel(card);});},100);} 
        });
        observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-card','data-type']});
        processAllCards();
        setInterval(processAllCards,2000);
    }

    function applyTheme(theme) {
        $('#interface_mod_theme').remove();
        if (theme==='default') return;
        var style=$('<style id="interface_mod_theme"></style>');
        var themes={
            neon:`body{background:linear-gradient(135deg,#0d0221 0%,#150734 50%,#1f0c47 100%);color:#fff;}...`,
            dark_night:`body{background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0f0f0f 100%);color:#fff;}...`,
            blue_cosmos:`body{background:linear-gradient(135deg,#0b365c 0%,#144d80 50%,#0c2a4d 100%);color:#fff;}...`,
            sunset:`body{background:linear-gradient(135deg,#2d1f3d 0%,#614385 50%,#516395 100%);color:#fff;}...`,
            emerald:`body{background:linear-gradient(135deg,#1a2a3a 0%,#2C5364 50%,#203A43 100%);color:#fff;}...`,
            aurora:`body{background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%);color:#fff;}...`,
            bywolf_mod:`body{background:linear-gradient(135deg,#090227 0%,#170b34 50%,#261447 100%);color:#fff;}...`
        };
        style.html(themes[theme]||'');
        $('head').append(style);
    }

    function updateVoteColors() {
        if (!InterFaceMod.settings.colored_ratings) return;
        function applyColorByRating(el){var match=$(el).text().match(/(\d+(\.\d+)?)/); if(!match) return; var vote=parseFloat(match[0]); if(vote<=3)$(el).css('color','red');else if(vote<6)$(el).css('color','orange');else if(vote<8)$(el).css('color','cornflowerblue');else $(el).css('color','lawngreen');}
        $('.card__vote').each(function(){applyColorByRating(this);});
        $('.full-start__rate,.full-start-new__rate').each(function(){applyColorByRating(this);});
        $('.info__rate,.card__imdb-rate,.card__kinopoisk-rate').each(function(){applyColorByRating(this);});
    }

    function setupVoteColorsObserver() {
        if (!InterFaceMod.settings.colored_ratings) return;
        setTimeout(updateVoteColors,500);
        new MutationObserver(function(){setTimeout(updateVoteColors,100);}).observe(document.body,{childList:true,subtree:true});
    }

    function setupVoteColorsForDetailPage() {
        if (!InterFaceMod.settings.colored_ratings) return;
        Lampa.Listener.follow('full',function(data){if(data.type==='complite'){setTimeout(updateVoteColors,100);}});
    }

    function colorizeSeriesStatus() {
        if (!InterFaceMod.settings.colored_elements) return;
        function applyStatusColor(el){var txt=$(el).text().trim().toLowerCase();var colors={completed:{bg:'rgba(46,204,113,0.8)',text:'white'},canceled:{bg:'rgba(231,76,60,0.8)',text:'white'},ongoing:{bg:'rgba(243,156,18,0.8)',text:'black'},production:{bg:'rgba(52,152,219,0.8)',text:'white'},planned:{bg:'rgba(155,89,182,0.8)',text:'white'},pilot:{bg:'rgba(230,126,34,0.8)',text:'white'},released:{bg:'rgba(26,188,156,0.8)',text:'white'},rumored:{bg:'rgba(149,165,166,0.8)',text:'white'},post:{bg:'rgba(0,188,212,0.8)',text:'white'}};
            var cfg=null;
            if(txt.includes('заверш')||txt.includes('ended'))cfg=colors.completed;
            else if(txt.includes('отмен')||txt.includes('canceled'))cfg=colors.canceled;
            else if(txt.includes('выход')||txt.includes('ongoing'))cfg=colors.ongoing;
            else if(txt.includes('производств')||txt.includes('production'))cfg=colors.production;
            else if(txt.includes('запланир')||txt.includes('planned'))cfg=colors.planned;
            else if(txt.includes('пилот')||txt.includes('pilot'))cfg=colors.pilot;
            else if(txt.includes('выпущ')||txt.includes('released'))cfg=colors.released;
            else if(txt.includes('слух')||txt.includes('rumored'))cfg=colors.rumored;
            else if(txt.includes('скоро')||txt.includes('post'))cfg=colors.post;
            if(cfg)$(el).css({backgroundColor:cfg.bg,color:cfg.text,borderRadius:'0.3em',display:'inline-block'});
        }
        $('.full-start__status').each(function(){applyStatusColor(this);});
        new MutationObserver(function(muts){muts.forEach(function(m){if(m.addedNodes)$(m.addedNodes).find('.full-start__status').each(function(){applyStatusColor(this);});});}).observe(document.body,{childList:true,subtree:true});
        Lampa.Listener.follow('full',function(data){if(data.type==='complite'&&data.data.movie){setTimeout(function(){$(data.object.activity.render()).find('.full-start__status').each(function(){applyStatusColor(this);});},100);}});
    }

    function colorizeAgeRating() {
        if (!InterFaceMod.settings.colored_elements) return;
        function applyAgeRatingColor(el){var txt=$(el).text().trim();var groups={kids:['G','TV-Y','0+'],children:['PG','TV-PG','6+'],teens:['PG-13','TV-14','12+'],almostAdult:['R','16+'],adult:['NC-17','18+']};var colors={kids:{bg:'#2ecc71',text:'white'},children:{bg:'#3498db',text:'white'},teens:{bg:'#f1c40f',text:'black'},almostAdult:{bg:'#e67e22',text:'white'},adult:{bg:'#e74c3c',text:'white'}};var group=null;for(var g in groups){groups[g].forEach(function(r){if(txt.includes(r))group=g;});if(group)break;}if(group)$(el).css({backgroundColor:colors[group].bg,color:colors[group].text,borderRadius:'0.3em'});
        }
        $('.full-start__pg').each(function(){applyAgeRatingColor(this);});
        new MutationObserver(function(muts){muts.forEach(function(m){if(m.addedNodes)$(m.addedNodes).find('.full-start__pg').each(function(){applyAgeRatingColor(this);});});}).observe(document.body,{childList:true,subtree:true});
        Lampa.Listener.follow('full',function(data){if(data.type==='complite'&&data.data.movie){setTimeout(function(){$(data.object.activity.render()).find('.full-start__pg').each(function(){applyAgeRatingColor(this);});},100);}});
    }

    function startPlugin() {
        Lampa.SettingsApi.addComponent({ component: 'season_info', name: 'Интерфейс мод', icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>' });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'seasons_info_mode', type: 'select', values: { none: 'Выключить', aired: 'Актуальная информация', total: 'Полное количество' }, default: 'aired' }, field: { name: 'Информация о сериях', description: 'Выберите как отображать информацию о сериях и сезонах' }, onChange: function(value){ InterFaceMod.settings.seasons_info_mode=value; InterFaceMod.settings.enabled = value!=='none'; Lampa.Settings.update(); } });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'label_position', type: 'select', values: { 'top-right':'Верхний правый угол','top-left':'Верхний левый угол','bottom-right':'Нижний правый угол','bottom-left':'Нижний левый угол' }, default: 'top-right' }, field: { name: 'Расположение лейбла о сериях', description: 'Выберите позицию лейбла на постере' }, onChange: function(value){ InterFaceMod.settings.label_position=value; Lampa.Settings.update(); Lampa.Noty.show('Для применения изменений откройте карточку сериала заново'); } });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'show_buttons', type: 'trigger', default: true }, field: { name: 'Показывать все кнопки', description: 'Отображать все кнопки действий в карточке' }, onChange: function(value){ InterFaceMod.settings.show_buttons=value; Lampa.Settings.update(); } });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'season_info_show_movie_type', type: 'trigger', default: true }, field: { name: 'Изменить лейблы типа', description: 'Изменить "TV" на "Сериал" и добавить лейбл "Фильм"' }, onChange: function(value){ InterFaceMod.settings.show_movie_type=value; Lampa.Settings.update(); } });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'theme_select', type: 'select', values: { default: 'Нет', bywolf_mod: 'Bywolf_mod', dark_night: 'Dark Night bywolf', blue_cosmos: 'Blue Cosmos', neon: 'Neon', sunset: 'Dark MOD', emerald: 'Emerald V1', aurora: 'Aurora' }, default: 'default' }, field: { name: 'Тема интерфейса', description: 'Выберите тему оформления интерфейса' }, onChange: function(value){ InterFaceMod.settings.theme=value; Lampa.Settings.update(); applyTheme(value); } });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'colored_ratings', type: 'trigger', default: true }, field: { name: 'Цветные рейтинги', description: 'Изменять цвет рейтинга в зависимости от оценки' }, onChange: function(value){ var activeElement=document.activeElement; InterFaceMod.settings.colored_ratings=value; Lampa.Settings.update(); setTimeout(function(){ if(value){ setupVoteColorsObserver(); setupVoteColorsForDetailPage(); } else { $('.card__vote,.full-start__rate,.full-start-new__rate,.info__rate,.card__imdb-rate,.card__kinopoisk-rate').css('color',''); } if(activeElement&&document.body.contains(activeElement)) activeElement.focus(); },0); } });
        Lampa.SettingsApi.addParam({ component: 'season_info', param: { name: 'colored_elements', type: 'trigger', default: true }, field: { name: 'Цветные элементы', description: 'Отображать статусы сериалов и возрастные ограничения цветными' }, onChange: function(value){ InterFaceMod.settings.colored_elements=value; Lampa.Settings.update(); if(value){ colorizeSeriesStatus(); colorizeAgeRating(); } else { $('.full-start__status').css({backgroundColor:'',color:'',borderRadius:'',display:''}); $('.full-start__pg').css({backgroundColor:'',color:''}); } } });

        InterFaceMod.settings.show_buttons = Lampa.Storage.get('show_buttons', true);
        InterFaceMod.settings.show_movie_type = Lampa.Storage.get('season_info_show_movie_type', true);
        InterFaceMod.settings.theme = Lampa.Storage.get('theme_select', 'default');
        InterFaceMod.settings.colored_ratings = Lampa.Storage.get('colored_ratings', true);
        InterFaceMod.settings.colored_elements = Lampa.Storage.get('colored_elements', true);
        InterFaceMod.settings.seasons_info_mode = Lampa.Storage.get('seasons_info_mode', 'aired');
        InterFaceMod.settings.show_episodes_on_main = Lampa.Storage.get('show_episodes_on_main', false);
        InterFaceMod.settings.label_position = Lampa.Storage.get('label_position', 'top-right');
        InterFaceMod.settings.enabled = (InterFaceMod.settings.seasons_info_mode !== 'none');

        applyTheme(InterFaceMod.settings.theme);
        if (InterFaceMod.settings.enabled) addSeasonInfo();
        showAllButtons();
        changeMovieTypeLabels();
        if (InterFaceMod.settings.colored_ratings) { setupVoteColorsObserver(); setupVoteColorsForDetailPage(); }
        if (InterFaceMod.settings.colored_elements) { colorizeSeriesStatus(); colorizeAgeRating(); }

        Lampa.Settings.listener.follow('open', function(e){ setTimeout(function(){ var interfaceMod=$('.settings-folder[data-component="season_info"]'); var interfaceStandard=$('.settings-folder[data-component="interface"]'); if(interfaceMod.length&&interfaceStandard.length) interfaceMod.insertAfter(interfaceStandard); },100); });
    }

    if (window.appready) { startPlugin(); } else { Lampa.Listener.follow('app', function(event){ if (event.type === 'ready') startPlugin(); }); }

    Lampa.Manifest.plugins = { name: 'Интерфейс мод', version: '2.2.0', description: 'Улучшенный интерфейс для приложения Lampa' };
    window.season_info = InterFaceMod;
})();
