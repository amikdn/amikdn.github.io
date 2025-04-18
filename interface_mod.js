(function () {
    'use strict';

    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.2.0',
        settings: {
            enabled: true,
            buttons_mode: 'default', // 'default', 'main_buttons', 'all_buttons'
            show_movie_type: true,
            theme: 'default',
            colored_ratings: true,
            seasons_info_mode: 'aired',
            show_episodes_on_main: false,
            label_position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
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
                
                console.log('Детальная информация о сериале:', movie.title || movie.name);
                console.log('Структура данных сериала:', JSON.stringify(movie, null, 2));
                
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
                        
                        console.log('Сезон ' + season.season_number + ': вышло ' + seasonEpisodes + ' из ' + (season.episode_count || 0) + ' серий');
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
                        
                        console.log('Последний вышедший: сезон ' + lastSeason + ', эпизод ' + lastEpisode);
                        
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
                    console.log('Следующий эпизод:', movie.next_episode_to_air);
                    
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
                            console.log('Вычисленные вышедшие серии (по next_episode):', calculatedAired);
                            
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
                    
                    var line1 = $('<div></div>').text(seasonEpisodeText);
                    var line2 = $('<div></div>').text(statusText);
                    
                    infoElement.append(line1).append(line2);
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
                    
                    console.log('Режим отображения:', InterFaceMod.settings.seasons_info_mode);
                    console.log('Вышедшие серии:', airedEpisodes);
                    console.log('Всего серий:', totalEpisodes);
                    console.log('Отображаемый текст:', text);
                    
                    infoElement.append($('<div></div>').text(text));
                }
                
                var positionStyles = {
                    'top-right': {
                        'position': 'absolute',
                        'top': '1.4em',
                        'right': '-0.8em',
                        'left': 'auto',
                        'bottom': 'auto'
                    },
                    'top-left': {
                        'position': 'absolute',
                        'top': '1.4em',
                        'left': '-0.8em',
                        'right': 'auto',
                        'bottom': 'auto'
                    },
                    'bottom-right': {
                        'position': 'absolute',
                        'bottom': '1.4em',
                        'right': '-0.8em',
                        'top': 'auto',
                        'left': 'auto'
                    },
                    'bottom-left': {
                        'position': 'absolute',
                        'bottom': '1.4em',
                        'left': '-0.8em',
                        'top': 'auto',
                        'right': 'auto'
                    }
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
                    console.log('Информация о сериале:', {
                        title: movie.title || movie.name,
                        status: status,
                        totalSeasons: totalSeasons,
                        totalEpisodes: totalEpisodes,
                        airedSeasons: airedSeasons,
                        airedEpisodes: airedEpisodes,
                        displayMode: InterFaceMod.settings.seasons_info_mode
                    });
                    
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
            .full-start-new__buttons, .full-start__buttons {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 10px !important;
            }
        `;
        document.head.appendChild(buttonStyle);
        
        var originFullCard;
        
        if (Lampa.FullCard) {
            originFullCard = Lampa.FullCard.build;
            
            Lampa.FullCard.build = function(data) {
                var card = originFullCard(data);
                
                card.organizeButtons = function() {и
                    var activity = card.activity;
                    if (!activity) return;
                    
                    var element = activity.render();
                    if (!element) return;
                    
                    var targetContainer = element.find('.full-start-new__buttons');
                    if (!targetContainer.length) {
                        targetContainer = element.find('.full-start__buttons');
                    }
                    if (!targetContainer.length) {
                        targetContainer = element.find('.buttons-container');
                    }
                    if (!targetContainer.length) return;
                    
                    console.log('InterfaceMod: Найден контейнер для кнопок', targetContainer);
                    
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
                    
                    if (allButtons.length === 0) {
                        console.log('InterfaceMod: Не найдены кнопки для организации');
                        return;
                    }
                    
                    console.log('InterfaceMod: Найдено кнопок:', allButtons.length);
                    
                    var categories = {
                        online: [],
                        torrent: [],
                        trailer: [],
                        other: []
                    };
                    
                    var addedButtonTexts = {};
                    
                    $(allButtons).each(function() {
                        var button = this;
                        var buttonText = $(button).text().trim();
                        var className = button.className || '';
                        
                        if (!buttonText || addedButtonTexts[buttonText]) return;
                        addedButtonTexts[buttonText] = true;
                        
                        if (className.includes('online')) {
                            categories.online.push(button);
                        } else if (className.includes('torrent')) {
                            categories.torrent.push(button);
                        } else if (className.includes('trailer')) {
                            categories.trailer.push(button);
                        } else {
                            categories.other.push(button);
                        }
                        
                        console.log('InterfaceMod: Обработана кнопка:', buttonText, className);
                    });
                    
                    var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                    
                    var needToggle = Lampa.Controller.enabled().name === 'full_start';
                    if (needToggle) Lampa.Controller.toggle('settings_component');
                    
                    var originalElements = targetContainer.children().detach();
                    
                    targetContainer.css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px'
                    });
                    
                    buttonSortOrder.forEach(function(category) {
                        categories[category].forEach(function(button) {
                            targetContainer.append(button);
                        });
                    });
                    
                    if (needToggle) {
                        setTimeout(function() {
                            Lampa.Controller.toggle('full_start');
                        }, 100);
                    }
                };
                
                card.onCreate = function() {
                    if (InterFaceMod.settings.show_buttons) {
                        setTimeout(function() {
                            card.organizeButtons();
                        }, 300);
                    }
                };
                
                return card;
            };
        }
        
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.object && e.object.activity) {
                if (InterFaceMod.settings.show_buttons && !Lampa.FullCard) {
                    setTimeout(function() {
                        var fullContainer = e.object.activity.render();
                        var targetContainer = fullContainer.find('.full-start-new__buttons');
                        if (!targetContainer.length) {
                            targetContainer = fullContainer.find('.full-start__buttons');
                        }
                        if (!targetContainer.length) {
                            targetContainer = fullContainer.find('.buttons-container');
                        }
                        if (!targetContainer.length) return;
                        
                        console.log('InterfaceMod: Найден контейнер для кнопок (listener)', targetContainer);
                        
                        targetContainer.css({
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        });
                        
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
                            fullContainer.find(selector).each(function() {
                                allButtons.push(this);
                            });
                        });
                        
                        if (allButtons.length === 0) {
                            console.log('InterfaceMod: Не найдены кнопки для организации (listener)');
                            return;
                        }
                        
                        console.log('InterfaceMod: Найдено кнопок (listener):', allButtons.length);
                        
                        var categories = {
                            online: [],
                            torrent: [],
                            trailer: [],
                            other: []
                        };
                        
                        var addedButtonTexts = {};
                        
                        $(allButtons).each(function() {
                            var button = this;
                            var buttonText = $(button).text().trim();
                            var className = button.className || '';
                            
                            if (!buttonText || addedButtonTexts[buttonText]) return;
                            addedButtonTexts[buttonText] = true;
                            
                            if (className.includes('online')) {
                                categories.online.push(button);
                            } else if (className.includes('torrent')) {
                                categories.torrent.push(button);
                            } else if (className.includes('trailer')) {
                                categories.trailer.push(button);
                            } else {
                                categories.other.push(button);
                            }
                        });
                        
                        var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                        
                        var needToggle = Lampa.Controller.enabled().name === 'full_start';
                        if (needToggle) Lampa.Controller.toggle('settings_component');
                        
                        var originalElements = targetContainer.children().detach();
                        
                        buttonSortOrder.forEach(function(category) {
                            categories[category].forEach(function(button) {
                                targetContainer.append(button);
                            });
                        });
                        
                        if (needToggle) {
                            setTimeout(function() {
                                Lampa.Controller.toggle('full_start');
                            }, 100);
                        }
                    }, 300);
                }
            }
        });
        
        var buttonObserver = new MutationObserver(function(mutations) {
            if (!InterFaceMod.settings.show_buttons) return;
            
            let needReorganize = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && 
                    (mutation.target.classList.contains('full-start-new__buttons') || 
                     mutation.target.classList.contains('full-start__buttons') ||
                     mutation.target.classList.contains('buttons-container'))) {
                    needReorganize = true;
                }
            });
            
            if (needReorganize) {
                setTimeout(function() {
                    if (Lampa.FullCard && Lampa.Activity.active() && Lampa.Activity.active().activity.card) {
                        if (typeof Lampa.Activity.active().activity.card.organizeButtons === 'function') {
                            Lampa.Activity.active().activity.card.organizeButtons();
                        }
                    }
                }, 100);
            }
        });
        
        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function changeMovieTypeLabels() {
        var styleTag = $('<style id="movie_type_styles"></style>').html(`
            /* Базовый стиль для всех лейблов */
            .content-label {
                position: absolute !important;
                top: 1.4em !important;
                left: -0.8em !important;
                color: white !important;
                padding: 0.4em 0.4em !important;
                border-radius: 0.3em !important;
                font-size: 0.8em !important;
                z-index: 10 !important;
            }
            
            /* Сериал - синий */
            .serial-label {
                background-color: #3498db !important;
            }
            
            /* Фильм - зелёный */
            .movie-label {
                background-color: #2ecc71 !important;
            }
            
            /* Скрываем встроенный лейбл TV только при включенной функции */
            body[data-movie-labels="on"] .card--tv .card__type {
                display: none !important;
            }
        `);
        $('head').append(styleTag);
        
        if (InterFaceMod.settings.show_movie_type) {
            $('body').attr('data-movie-labels', 'on');
        } else {
            $('body').attr('data-movie-labels', 'off');
        }
        
        function addLabelToCard(card) {
            if (!InterFaceMod.settings.show_movie_type) return;
            
            if ($(card).find('.content-label').length) return;
            
            var view = $(card).find('.card__view');
            if (!view.length) return;
            
            var is_tv = false;
            var metadata = {};
            var movie_data = null;
            
            try {
                var cardData = $(card).attr('data-card');
                if (cardData) {
                    try {
                        metadata = JSON.parse(cardData);
                        console.log('Метаданные из data-card:', metadata);
                    } catch (e) {
                        console.error('Ошибка парсинга data-card:', e);
                    }
                }
                
                var jqData = $(card).data();
                if (jqData && Object.keys(jqData).length > 0) {
                    metadata = { ...metadata, ...jqData };
                    console.log('Метаданные из jQuery data():', jqData);
                }
                
                if (Lampa.Card && $(card).attr('id')) {
                    var cardId = $(card).attr('id');
                    var cardObj = Lampa.Card.get(cardId);
                    if (cardObj) {
                        metadata = { ...metadata, ...cardObj };
                        console.log('Метаданные из Lampa.Card:', cardObj);
                    }
                }
                
                if (Lampa.Storage && Lampa.Storage.cache) {
                    var itemId = $(card).data('id') || $(card).attr('data-id') || (metadata ? metadata.id : null);
                    if (itemId && Lampa.Storage.cache('card_' + itemId)) {
                        var cachedData = Lampa.Storage.cache('card_' + itemId);
                        if (cachedData) {
                            metadata = { ...metadata, ...cachedData };
                            console.log('Метаданные из Lampa.Storage.cache:', cachedData);
                        }
                    }
                }
                
                movie_data = metadata;
                
                if (InterFaceMod.debug) {
                    console.log('Собранные метаданные для карточки:', movie_data);
                }
            } catch (e) {
                console.error('Ошибка при получении метаданных:', e);
            }
            
            if (movie_data) {
                if (movie_data.type === 'tv' || movie_data.type === 'serial' || 
                    movie_data.card_type === 'tv' || movie_data.card_type === 'serial') {
                    is_tv = true;
                }
                else if (movie_data.seasons || movie_data.number_of_seasons > 0 || 
                        movie_data.season_count > 0 || movie_data.seasons_count > 0) {
                    is_tv = true;
                }
                else if (movie_data.episodes || movie_data.number_of_episodes > 0 || 
                        movie_data.episodes_count > 0) {
                    is_tv = true;
                } 
                else if (movie_data.isSeries === true || movie_data.is_series === true || 
                        movie_data.isSerial === true || movie_data.is_serial === true) {
                    is_tv = true;
                }
            }
            
            if (!is_tv) {
                if ($(card).hasClass('card--tv')) {
                    is_tv = true;
                } else if ($(card).data('card_type') === 'tv' || $(card).data('type') === 'tv') {
                    is_tv = true;
                } else {
                    var hasSeasonInfo = $(card).find('.card__type, .card__temp').text().match(/(сезон|серия|серии|эпизод|ТВ|TV)/i);
                    if (hasSeasonInfo) {
                        is_tv = true;
                    }
                }
            }
            
            var label = $('<div class="content-label"></div>');
            а
            if (is_tv) {
                label.addClass('serial-label');
                label.text('Сериал');
                label.data('type', 'serial');
            } else {
                label.addClass('movie-label');
                label.text('Фильм');
                label.data('type', 'movie');
            }
            
            view.append(label);
            
            if (InterFaceMod.debug) {
                console.log('Добавлен лейбл: ' + (is_tv ? 'Сериал' : 'Фильм'), card);
            }
        }
        
        function updateCardLabel(card) {
            if (!InterFaceMod.settings.show_movie_type) return;
            
            $(card).find('.content-label').remove();
            
            addLabelToCard(card);
        }
        
        function processAllCards() {
            if (!InterFaceMod.settings.show_movie_type) return;
            
            $('.card').each(function() {
                addLabelToCard(this);
            });
        }
        
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                var movie = data.data.movie;
                var posterContainer = $(data.object.activity.render()).find('.full-start__poster');
                
                if (posterContainer.length && movie) {
                    var is_tv = false;
                    
                    if (movie.number_of_seasons > 0 || movie.seasons || movie.season_count > 0) {
                        is_tv = true;
                    } else if (movie.type === 'tv' || movie.card_type === 'tv') {
                        is_tv = true;
                    }
                    
                    if (InterFaceMod.settings.show_movie_type) {
                        var existingLabel = posterContainer.find('.content-label');
                        if (existingLabel.length) {
                            existingLabel.remove();
                        }
                        
                        var label = $('<div class="content-label"></div>').css({
                            'position': 'absolute',
                            'top': '1.4em',
                            'left': '-0.8em',
                            'color': 'white',
                            'padding': '0.4em 0.4em',
                            'border-radius': '0.3em',
                            'font-size': '0.8em',
                            'z-index': '10'
                        });
                        
                        if (is_tv) {
                            label.addClass('serial-label');
                            label.text('Сериал');
                            label.css('background-color', '#3498db');
                        } else {
                            label.addClass('movie-label');
                            label.text('Фильм');
                            label.css('background-color', '#2ecc71');
                        }
                        
                        posterContainer.css('position', 'relative');
                        posterContainer.append(label);
                    }
                }
            }
        });
        
        var observer = new MutationObserver(function(mutations) {
            var needCheck = false;
            var cardsToUpdate = new Set();
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if ($(node).hasClass('card')) {
                            cardsToUpdate.add(node);
                            needCheck = true;
                        } else if ($(node).find('.card').length) {
                            $(node).find('.card').each(function() {
                                cardsToUpdate.add(this);
                            });
                            needCheck = true;
                        }
                    }
                }
                
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'class' || 
                     mutation.attributeName === 'data-card' || 
                     mutation.attributeName === 'data-type')) {
                    var targetNode = mutation.target;
                    if ($(targetNode).hasClass('card')) {
                        cardsToUpdate.add(targetNode);
                        needCheck = true;
                    }
                }
            });
            
            if (needCheck) {
                setTimeout(function() {ки
                    cardsToUpdate.forEach(function(card) {
                        updateCardLabel(card);
                    });
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-card', 'data-type']
        });
        
        processAllCards();
        
        setInterval(processAllCards, 2000);
        
        Lampa.Settings.listener.follow('change', function(e) {
            if (e.name === 'season_info_show_movie_type') {
                if (e.value) {
                    if (!$('style[data-id="movie-type-styles"]').length) {
                        styleTag.attr('data-id', 'movie-type-styles');
                        $('head').append(styleTag);
                    }
                    $('body').attr('data-movie-labels', 'on');
                    processAllCards();
                } else {
                    $('body').attr('data-movie-labels', 'off');
                    $('.content-label').remove();
                }
            }
        });
    }

    function applyTheme(theme) {
        $('#interface_mod_theme').remove();

        if (theme === 'default') return;

        const style = $('<style id="interface_mod_theme"></style>');

        const themes = {
            neon: `
                body {
                    background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
                    background: linear-gradient(to right, #ff00ff, #00ffff);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                    border: none;
                }
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 2px solid #ff00ff;
                    box-shadow: 0 0 20px #00ffff;
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(1.2) saturate(1.3);
                }
                .settings__content,
                .settings-input__content,
                .selectbox__content,
                .modal__content {
                    background: rgba(15, 2, 33, 0.95);
                    border: 1px solid rgba(255, 0, 255, 0.1);
                }
            `,
            dark_night: `
                body {
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
                    background: linear-gradient(to right, #8a2387, #e94057, #f27121);
                    color: #fff;
                    box-shadow: 0 0 30px rgba(233, 64, 87, 0.3);
                    animation: night-pulse 2s infinite;
                }
                @keyframes night-pulse {
                    0% { box-shadow: 0 0 20px rgba(233, 64, 87, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(242, 113, 33, 0.3); }
                    100% { box-shadow: 0 0 20px rgba(138, 35, 135, 0.3); }
                }
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 2px solid #e94057;
                    box-shadow: 0 0 30px rgba(242, 113, 33, 0.5);
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #8a2387, #f27121);
                    animation: night-pulse 2s infinite;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.3) contrast(1.1);
                }
                .settings__content,
                .settings-input__content,
                .selectbox__content,
                .modal__content {
                    background: rgba(10, 10, 10, 0.95);
                    border: 1px solid rgba(233, 64, 87, 0.1);
                    box-shadow: 0 0 30px rgba(242, 113, 33, 0.1);
                }
            `,
            blue_cosmos: `
                body {
                    background: linear-gradient(135deg, #0b365c 0%, #144d80 50%, #0c2a4d 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
                    background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
                    color: #fff;
                    box-shadow: 0 0 30px rgba(18, 194, 233, 0.3);
                    animation: cosmos-pulse 2s infinite;
                }
                @keyframes cosmos-pulse {
                    0% { box-shadow: 0 0 20px rgba(18, 194, 233, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(196, 113, 237, 0.3); }
                    100% { box-shadow: 0 0 20px rgba(246, 79, 89, 0.3); }
                }
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 2px solid #12c2e9;
                    box-shadow: 0 0 30px rgba(196, 113, 237, 0.5);
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #12c2e9, #f64f59);
                    animation: cosmos-pulse 2s infinite;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.3) contrast(1.1);
                }
                .settings__content,
                .settings-input__content,
                .selectbox__content,
                .modal__content {
                    background: rgba(11, 54, 92, 0.95);
                    border: 1px solid rgba(18, 194, 233, 0.1);
                    box-shadow: 0 0 30px rgba(196, 113, 237, 0.1);
                }
            `,
            sunset: `
                body {
                    background: linear-gradient(135deg, #2d1f3d 0%, #614385 50%, #516395 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
                    background: linear-gradient(to right, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                    box-shadow: 0 0 15px rgba(255, 110, 127, 0.3);
                    font-weight: bold;
                }
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 2px solid #ff6e7f;
                    box-shadow: 0 0 15px rgba(255, 110, 127, 0.5);
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.2) contrast(1.1);
                }
            `,
            emerald: `
                body {
                    background: linear-gradient(135deg, #1a2a3a 0%, #2C5364 50%, #203A43 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
                    background: linear-gradient(to right, #43cea2, #185a9d);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(67, 206, 162, 0.3);
                    border-radius: 5px;
                }
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 3px solid #43cea2;
                    box-shadow: 0 0 20px rgba(67, 206, 162, 0.4);
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #43cea2, #185a9d);
                }
                .full-start__background {
                    opacity: 0.85;
                    filter: brightness(1.1) saturate(1.2);
                }
                .settings__content,
                .settings-input__content,
                .selectbox__content,
                .modal__content {
                    background: rgba(26, 42, 58, 0.98);
                    border: 1px solid rgba(67, 206, 162, 0.1);
                }
            `,
            aurora: `
                body {
                    background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
                    background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(170, 75, 107, 0.3);
                    transform: scale(1.02);
                    transition: all 0.3s ease;
                }
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 2px solid #aa4b6b;
                    box-shadow: 0 0 25px rgba(170, 75, 107, 0.5);
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #aa4b6b, #3b8d99);
                    transform: scale(1.05);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: contrast(1.1) brightness(1.1);
                }
            `,
            bywolf_mod: `
                body {
                    background: linear-gradient(135deg, #090227 0%, #170b34 50%, #261447 100%);
                    color: #ffffff;
                }
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus {
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
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    border: 2px solid #fc00ff;
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.5);
                }
                .head__action.focus,
                .head__action.hover {
                    background: linear-gradient(45deg, #fc00ff, #00dbde);
                    animation: cosmic-pulse 2s infinite;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.3) contrast(1.1);
                }
                .settings__content,
                .settings-input__content,
                .selectbox__content,
                .modal__content {
                    background: rgba(9, 2, 39, 0.95);
                    border: 1px solid rgba(252, 0, 255, 0.1);
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.1);
                }
            `
        };

        style.html(themes[theme] || '');
        
        $('head').append(style);
    }

    function updateVoteColors() {
        if (!InterFaceMod.settings.colored_ratings) return;
        
        function applyColorByRating(element) {
            const voteText = $(element).text().trim();
            const match = voteText.match(/(\d+(\.\d+)?)/);
            if (!match) return;
            
            const vote = parseFloat(match[0]);
            
            if (vote >= 0 && vote <= 3) {
                $(element).css('color', "red");
            } else if (vote > 3 && vote < 6) {
                $(element).css('color', "orange");
            } else if (vote >= 6 && vote < 8) {
                $(element).css('color', "cornflowerblue");
            } else if (vote >= 8 && vote <= 10) {
                $(element).css('color', "lawngreen");
            }
        }
        
        $(".card__vote").each(function() {
            applyColorByRating(this);
        });
        
        $(".full-start__rate, .full-start-new__rate").each(function() {
            applyColorByRating(this);
        });
        
        $(".info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function() {
            applyColorByRating(this);
        });
    }

    function setupVoteColorsObserver() {
        if (!InterFaceMod.settings.colored_ratings) return;
        
        setTimeout(updateVoteColors, 500);
        
        const observer = new MutationObserver(function(mutations) {
            setTimeout(updateVoteColors, 100);
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    function setupVoteColorsForDetailPage() {
        if (!InterFaceMod.settings.colored_ratings) return;

        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(updateVoteColors, 100);
            }
        });
    }

    function colorizeSeriesStatus() {
        if (!InterFaceMod.settings.colored_elements) return;
        
        function applyStatusColor(statusElement) {
            var statusText = $(statusElement).text().trim();
            
            var statusColors = {
                'completed': {
                    bg: 'rgba(46, 204, 113, 0.8)',
                    text: 'white'
                },
                'canceled': {
                    bg: 'rgba(231, 76, 60, 0.8)',
                    text: 'white'
                },
                'ongoing': {
                    bg: 'rgba(243, 156, 18, 0.8)',
                    text: 'black'
                },
                'production': {
                    bg: 'rgba(52, 152, 219, 0.8)',
                    text: 'white'
                },
                'planned': {
                    bg: 'rgba(155, 89, 182, 0.8)',
                    text: 'white'
                },
                'pilot': {
                    bg: 'rgba(230, 126, 34, 0.8)',
                    text: 'white'
                },
                'released': {
                    bg: 'rgba(26, 188, 156, 0.8)',
                    text: 'white'
                },
                'rumored': {
                    bg: 'rgba(149, 165, 166, 0.8)',
                    text: 'white'
                },
                'post': {
                    bg: 'rgba(0, 188, 212, 0.8)',
                    text: 'white'
                }
            };
            
            var bgColor = '';
            var textColor = '';
            
            if (statusText.includes('Заверш') || statusText.includes('Ended')) {
                bgColor = statusColors.completed.bg;
                textColor = statusColors.completed.text;
            } else if (statusText.includes('Отмен') || statusText.includes('Canceled')) {
                bgColor = statusColors.canceled.bg;
                textColor = statusColors.canceled.text;
            } else if (statusText.includes('Онгоинг') || statusText.includes('Выход') || statusText.includes('В процессе...') || statusText.includes('В процессе') || statusText.includes('Return')) {
                bgColor = statusColors.ongoing.bg;
                textColor = statusColors.ongoing.text;
            } else if (statusText.includes('производстве') || statusText.includes('Production')) {
                bgColor = statusColors.production.bg;
                textColor = statusColors.production.text;
            } else if (statusText.includes('Запланировано') || statusText.includes('Planned')) {
                bgColor = statusColors.planned.bg;
                textColor = statusColors.planned.text;
            } else if (statusText.includes('Пилотный') || statusText.includes('Pilot')) {
                bgColor = statusColors.pilot.bg;
                textColor = statusColors.pilot.text;
            } else if (statusText.includes('Выпущенный') || statusText.includes('Released')) {
                bgColor = statusColors.released.bg;
                textColor = statusColors.released.text;
            } else if (statusText.includes('слухам') || statusText.includes('Rumored')) {
                bgColor = statusColors.rumored.bg;
                textColor = statusColors.rumored.text;
            } else if (statusText.includes('Скоро') || statusText.includes('Post')) {
                bgColor = statusColors.post.bg;
                textColor = statusColors.post.text;
            }
            
            if (bgColor) {
                $(statusElement).css({
                    'background-color': bgColor,
                    'color': textColor,
                    'border-radius': '0.3em',
					'border': '0px',
					'font-size': '1.3em',
                    'display': 'inline-block'
                });
            }
            
            if (InterFaceMod.debug) {
                console.log('Статус сериала:', statusText, bgColor, textColor);
            }
        }
        
        $('.full-start__status').each(function() {
            applyStatusColor(this);
        });
        
        var statusObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__status').each(function() {
                            applyStatusColor(this);
                        });
                        
                        if ($(node).hasClass('full-start__status')) {
                            applyStatusColor(node);
                        }
                    }
                }
            });
        });
        
        statusObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__status').each(function() {
                        applyStatusColor(this);
                    });
                }, 100);
            }
        });
    }

    function colorizeAgeRating() {
        if (!InterFaceMod.settings.colored_elements) return;
        
        function applyAgeRatingColor(ratingElement) {
            var ratingText = $(ratingElement).text().trim();
            
            var ageRatings = {
                kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
                children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
                teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
                almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
                adult: ['NC-17', '18+', '18', 'X']
            };
            
            var colors = {
                kids: {
                    bg: '#2ecc71',
                    text: 'white'
                },
                children: {
                    bg: '#3498db',
                    text: 'white'
                },
                teens: {
                    bg: '#f1c40f',
                    text: 'black'
                },
                almostAdult: {
                    text: 'white'
                },
                adult: {
                    bg: '#e74c3c',
                    text: 'white'
                }
            };
            
            var group = null;
            
            for (var groupKey in ageRatings) {
                if (ageRatings[groupKey].includes(ratingText)) {
                    group = groupKey;
                    break;
                }
                
                for (var i = 0; i < ageRatings[groupKey].length; i++) {
                    if (ratingText.includes(ageRatings[groupKey][i])) {
                        group = groupKey;
                        break;
                    }
                }
                
                if (group) break;
            }
            
            if (group) {
                $(ratingElement).css({
                    'background-color': colors[group].bg,
                    'color': colors[group].text,
                    'border-radius': '0.3em',
					'font-size': '1.3em',
					'border': '0px'
                });
                
                if (InterFaceMod.debug) {
                    console.log('Возрастное ограничение:', ratingText, 'группа:', group, 'цвет:', colors[group].bg);
                }
            }
        }
        
        $('.full-start__pg').each(function() {
            applyAgeRatingColor(this);
        });
        
        var ratingObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__pg').each(function() {
                            applyAgeRatingColor(this);
                        });
                        
                        if ($(node).hasClass('full-start__pg')) {
                            applyAgeRatingColor(node);
                        }
                    }
                }
            });
        });
        
        ratingObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        и
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__pg').each(function() {
                        applyAgeRatingColor(this);
                    });
                }, 100);
            }
        });
    }

    function startPlugin() {

        Lampa.SettingsApi.addComponent({
            component: 'season_info',
            name: 'Интерфейс мод',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });
        
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: { 
                type: 'button',
                component: 'about' 
            },
            field: {
                name: 'О плагине',
                description: 'Информация и поддержка'
            },
            onChange: showAbout
        });
        
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'seasons_info_mode',
                type: 'select',
                values: {
                    'none': 'Выключить',
                    'aired': 'Актуальная информация',
                    'total': 'Полное количество'
                },
                default: 'aired'
            },
            field: {
                name: 'Информация о сериях',
                description: 'Выберите как отображать информацию о сериях и сезонах'
            },
            onChange: function (value) {
                InterFaceMod.settings.seasons_info_mode = value;
                
                if (value === 'none') {
                    InterFaceMod.settings.enabled = false;
                } else {
                    InterFaceMod.settings.enabled = true;
                }
                
                Lampa.Settings.update();
            }
        });
        
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
            onChange: function (value) {
                InterFaceMod.settings.label_position = value;
                Lampa.Settings.update();
                
                Lampa.Noty.show('Для применения изменений откройте карточку сериала заново');
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'show_buttons',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Показывать все кнопки',
                description: 'Отображать все кнопки действий в карточке'
            },
            onChange: function (value) {
                InterFaceMod.settings.show_buttons = value;
                Lampa.Settings.update();
                console.log('InterfaceMod: Отображение кнопок ' + (value ? 'включено' : 'отключено'));
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'season_info_show_movie_type',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Изменить лейблы типа',
                description: 'Изменить "TV" на "Сериал" и добавить лейбл "Фильм"'
            },
            onChange: function (value) {
                InterFaceMod.settings.show_movie_type = value;
                Lampa.Settings.update();
            }
        });
        
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
            field: {
                name: 'Тема интерфейса',
                description: 'Выберите тему оформления интерфейса'
            },
            onChange: function(value) {
                InterFaceMod.settings.theme = value;
                Lampa.Settings.update();
                applyTheme(value);
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'colored_ratings',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Цветные рейтинги',
                description: 'Изменять цвет рейтинга в зависимости от оценки'
            },
            onChange: function (value) {т
                var activeElement = document.activeElement;
                
                InterFaceMod.settings.colored_ratings = value;
                Lampa.Settings.update();
                 
                setTimeout(function() {
                    if (value) {
                        setupVoteColorsObserver();
                        setupVoteColorsForDetailPage();
                    } else {
                        $(".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate").css("color", "");
                    }
                    
                    if (activeElement && document.body.contains(activeElement)) {
                        activeElement.focus();
                    }
                }, 0);
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'colored_elements',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Цветные элементы',
                description: 'Отображать статусы сериалов и возрастные ограничения цветными'
            },
            onChange: function (value) {
                InterFaceMod.settings.colored_elements = value;
                Lampa.Settings.update();
                
                if (value) {
                    colorizeSeriesStatus();
                    colorizeAgeRating();
                } else {
                    $('.full-start__status').css({
                        'background-color': '',
                        'color': '',
                        'padding': '',
                        'border-radius': '',
                        'font-weight': '',
                        'display': ''
                    });
                    
                    $('.full-start__pg').css({
                        'background-color': '',
                        'color': '',
                        'font-weight': ''
                    });
                }
            }
        });
        
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
        
        if (InterFaceMod.settings.enabled) {
            addSeasonInfo();
        }
        
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

        Lampa.Settings.listener.follow('open', function (e) {
            setTimeout(function() {
                var interfaceMod = $('.settings-folder[data-component="season_info"]');
                var interfaceStandard = $('.settings-folder[data-component="interface"]');
                
                if (interfaceMod.length && interfaceStandard.length) {
                    interfaceMod.insertAfter(interfaceStandard);
                }
            }, 100);
        });
    }

  function _0x4e5f(){var _0x16f3a0=['then','error','32002ZEhIqs','contribution','</h1>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22about-plugin__footer\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h3>Поддержать\x20разработку</h3>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22color:\x20white;\x20font-size:\x2014px;\x20margin-bottom:\x205px;\x22>OZON\x20Банк</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22color:\x20white;\x20font-size:\x2018px;\x20font-weight:\x20bold;\x20margin-bottom:\x205px;\x22>+7\x20953\x20235\x2000\x2002</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22color:\x20#ffffff;\x20font-size:\x2012px;\x22>Владелец:\x20Иван\x20Л.</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-container\x22\x20style=\x22margin-top:\x2020px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-column\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-title\x22>Особая\x20благодарность\x20в\x20поддержке:</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-list\x20supporters-list\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-name\x22>Загрузка\x20данных...</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-column\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-title\x22>Спасибо\x20за\x20идеи\x20и\x20разработку:</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-list\x20contributors-list\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-name\x22>Загрузка\x20данных...</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22about-plugin__description\x22\x20style=\x22margin-top:\x2020px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22color:\x20#fff;\x20font-size:\x2015px;\x20margin-bottom:\x2010px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20New\x20versions\x202.2.0\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<ul>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li><span>✦</span>\x20Востоновленна\x20работа\x20с\x20кнопками</li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li><span>✦</span>\x20Новая\x20функция\x20цветные\x20статусы\x20и\x20возростные\x20ограничения\x20это\x20там\x20где\x20\x22Онгоинг\x22\x20и\x2018+</li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li><span>✦</span>\x20Изменено\x20расположения\x20настроек\x20плагина\x20теперь\x20оно\x20сразу\x20после\x20настроек\x20интерфейса\x20лампы</li>\x0a\x09\x09\x09\x09\x09<li><span>✦</span>\x20Добавленно\x20две\x20новых\x20темы</li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li><span>✦</span>\x20Мелкие\x20исправления\x20и\x20улучшения</li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</ul>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20','find','Controller','#about-plugin-styles','forEach','random','20czITHT','Сетевой\x20ответ\x20некорректен','version','Ошибка\x20загрузки\x20данных:','close','</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-contribution\x22>','1828302cvGTgA','remove','name','7329UtbJGC','1140084IlxCNQ','.supporters-list','2248jvqFNZ','date','\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22about-plugin\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22about-plugin__title\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h1>Интерфейс\x20MOD\x20v','Modal','666378FfKmzW','supporters','10PpKvBF','.contributors-list','append','json','head','contributors','html','<div></div>','15dtMzdn','</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20','open','2859651BWXlbG','\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-name\x22>Ошибка\x20загрузки\x20данных</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-contribution\x22>Проверьте\x20соединение</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20','269236BjiuRE','full','toggle'];_0x4e5f=function(){return _0x16f3a0;};return _0x4e5f();}(function(_0x1dd2a5,_0x491e52){var _0x1a175b=_0x5c85,_0x3d525d=_0x1dd2a5();while(!![]){try{var _0x286241=-parseInt(_0x1a175b(0xf8))/0x1+parseInt(_0x1a175b(0x10c))/0x2*(-parseInt(_0x1a175b(0x102))/0x3)+parseInt(_0x1a175b(0x107))/0x4+-parseInt(_0x1a175b(0xfa))/0x5*(-parseInt(_0x1a175b(0x11a))/0x6)+parseInt(_0x1a175b(0x11d))/0x7*(-parseInt(_0x1a175b(0xf4))/0x8)+-parseInt(_0x1a175b(0x105))/0x9*(-parseInt(_0x1a175b(0x114))/0xa)+parseInt(_0x1a175b(0x11e))/0xb;if(_0x286241===_0x491e52)break;else _0x3d525d['push'](_0x3d525d['shift']());}catch(_0x4a88d6){_0x3d525d['push'](_0x3d525d['shift']());}}}(_0x4e5f,0x5b9eb));function _0x5c85(_0x5e3dad,_0x5e3faf){var _0x4e5fc3=_0x4e5f();return _0x5c85=function(_0x5c85ab,_0x245f8f){_0x5c85ab=_0x5c85ab-0xf3;var _0x260992=_0x4e5fc3[_0x5c85ab];return _0x260992;},_0x5c85(_0x5e3dad,_0x5e3faf);}function showAbout(){var _0x3473dc=_0x5c85;$(_0x3473dc(0x111))['length']&&$('#about-plugin-styles')[_0x3473dc(0x11b)]();var _0x51d740=$('<style\x20id=\x22about-plugin-styles\x22></style>');_0x51d740['html']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20background:\x20rgba(9,\x202,\x2039,\x200.95);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x2015px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20overflow:\x20hidden;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20box-shadow:\x200\x200\x2015px\x20rgba(0,\x20219,\x20222,\x200.1);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__title\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20background:\x20linear-gradient(90deg,\x20#fc00ff,\x20#00dbde);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x2015px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20text-align:\x20center;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-bottom:\x2020px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__title\x20h1\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin:\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20color:\x20white;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-size:\x2024px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-weight:\x20bold;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20text-shadow:\x200\x200\x205px\x20rgba(255,\x20255,\x20255,\x200.5);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__description\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x2015px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20background:\x20rgba(15,\x202,\x2033,\x200.8);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-bottom:\x2020px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border:\x201px\x20solid\x20rgba(252,\x200,\x20255,\x200.2);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__description\x20ul\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20color:\x20#fff;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-size:\x2014px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20line-height:\x201.5;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20list-style-type:\x20none;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding-left:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin:\x2010px\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__description\x20li\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-bottom:\x206px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding-left:\x2020px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20position:\x20relative;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__description\x20li\x20span\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20position:\x20absolute;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20left:\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20color:\x20#fc00ff;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__footer\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x2015px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20background:\x20linear-gradient(90deg,\x20#fc00ff,\x20#00dbde);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20text-align:\x20center;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.about-plugin__footer\x20h3\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-top:\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20color:\x20white;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-size:\x2018px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-weight:\x20bold;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-container\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20display:\x20flex;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20justify-content:\x20space-between;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-top:\x2020px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-column\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20width:\x2048%;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20background:\x20rgba(15,\x202,\x2033,\x200.8);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20position:\x20relative;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20height:\x20200px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20overflow:\x20hidden;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border:\x201px\x20solid\x20rgba(252,\x200,\x20255,\x200.2);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-title\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20color:\x20#fc00ff;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-size:\x2016px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-weight:\x20bold;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20text-align:\x20center;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-bottom:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20text-shadow:\x200\x200\x205px\x20rgba(252,\x200,\x20255,\x200.3);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20position:\x20relative;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20z-index:\x2010;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20background:\x20rgba(15,\x202,\x2033,\x200.95);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x208px\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x205px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20box-shadow:\x200\x202px\x205px\x20rgba(0,\x200,\x200,\x200.3);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-bottom:\x201px\x20solid\x20rgba(252,\x200,\x20255,\x200.3);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-list\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20position:\x20absolute;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20width:\x20100%;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20left:\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding:\x200\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20box-sizing:\x20border-box;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20animation:\x20scrollCredits\x2030s\x20linear\x20infinite;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20padding-top:\x2060px;\x20/*\x20Увеличенный\x20отступ\x20перед\x20началом\x20титров\x20*/\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-top:\x2020px;\x20/*\x20Дополнительный\x20отступ\x20от\x20заголовка\x20*/\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-item\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20text-align:\x20center;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-bottom:\x2015px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20color:\x20white;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-name\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-weight:\x20bold;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-size:\x2014px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20margin-bottom:\x204px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20.credits-contribution\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-size:\x2012px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20opacity:\x200.8;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20@keyframes\x20scrollCredits\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x200%\x20{\x20transform:\x20translateY(50%);\x20}\x20/*\x20Начинаем\x20анимацию\x20с\x20середины\x20*/\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20100%\x20{\x20transform:\x20translateY(-100%);\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20'),$(_0x3473dc(0xfe))[_0x3473dc(0xfc)](_0x51d740);var _0x4d4d60=_0x3473dc(0xf6)+InterFaceMod[_0x3473dc(0x116)]+_0x3473dc(0x10e),_0x8d7af5=$(_0x3473dc(0x101));_0x8d7af5['html'](_0x4d4d60),Lampa[_0x3473dc(0xf7)][_0x3473dc(0x104)]({'title':'','html':_0x8d7af5,'onBack':function(){var _0x112901=_0x3473dc;$(_0x112901(0x111))['remove'](),Lampa[_0x112901(0xf7)][_0x112901(0x118)](),Lampa[_0x112901(0x110)][_0x112901(0x109)]('settings');},'size':_0x3473dc(0x108)});var _0x1fbc04='https://bywolf88.github.io/lampa-plugins/usersupp.json?nocache='+Math[_0x3473dc(0x113)]();fetch(_0x1fbc04)[_0x3473dc(0x10a)](function(_0x251ffd){var _0x1127f6=_0x3473dc;if(!_0x251ffd['ok'])throw new Error(_0x1127f6(0x115));return _0x251ffd[_0x1127f6(0xfd)]();})[_0x3473dc(0x10a)](function(_0x97bcd8){var _0x13679a=_0x3473dc;if(_0x97bcd8&&_0x97bcd8['supporters']&&_0x97bcd8[_0x13679a(0xff)]){var _0x1acaa5='';_0x97bcd8[_0x13679a(0xf9)]['forEach'](function(_0x53aa47){var _0x481a4=_0x13679a;_0x1acaa5+='\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-name\x22>'+_0x53aa47[_0x481a4(0x11c)]+'</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-contribution\x22>'+_0x53aa47[_0x481a4(0x10d)]+_0x481a4(0x119)+_0x53aa47[_0x481a4(0xf5)]+_0x481a4(0x103);}),_0x8d7af5['find'](_0x13679a(0xf3))[_0x13679a(0x100)](_0x1acaa5);var _0x2d97f7='';_0x97bcd8[_0x13679a(0xff)][_0x13679a(0x112)](function(_0xc3b90f){var _0x1c095c=_0x13679a;_0x2d97f7+='\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-name\x22>'+_0xc3b90f[_0x1c095c(0x11c)]+_0x1c095c(0x119)+_0xc3b90f[_0x1c095c(0x10d)]+'</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22credits-contribution\x22>'+_0xc3b90f[_0x1c095c(0xf5)]+_0x1c095c(0x103);}),_0x8d7af5['find'](_0x13679a(0xfb))[_0x13679a(0x100)](_0x2d97f7);}})['catch'](function(_0x5bb425){var _0xa73fe5=_0x3473dc;console[_0xa73fe5(0x10b)](_0xa73fe5(0x117),_0x5bb425);var _0x4a2e24=_0xa73fe5(0x106);_0x8d7af5[_0xa73fe5(0x10f)]('.supporters-list')[_0xa73fe5(0x100)](_0x4a2e24),_0x8d7af5[_0xa73fe5(0x10f)]('.contributors-list')[_0xa73fe5(0x100)](_0x4a2e24);});}

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

    Lampa.Manifest.plugins = {
        name: 'Интерфейс мод',
        version: '2.2.0',
        description: 'Улучшенный интерфейс для приложения Lampa'
    };

    window.season_info = InterFaceMod;
})(); 
