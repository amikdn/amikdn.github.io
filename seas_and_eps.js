(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    // Создаем стили для отображения статусов сериалов
    var style = document.createElement('style');
    style.textContent = `
        .card__status {
            position: absolute;
            top: 3.8em;
            left: -0.8em;
            font-size: 0.85em;
            padding: 0.4em 0.4em;
            border-radius: 0.3em;
            color: #000;
        }
        
        .card__status[data-status="end"] {
            background: #ffa416;
            color: #fff;
        }
        
        .card__status[data-status="released"] {
            background: #22ff16;
            color: #000;
        }
        
        .card__status[data-status="wait"] {
            background: #16c7ff;
            color: #000;
        }
        
        .card__status[data-status="planned"] {
            background: #16c7ff;
            color: #000;
        }
        
        .card__status[data-status="on_the_air"] {
            background: #16c7ff;
            color: #000;
        }
        
        .card__type {
            position: absolute;
            top: 3.8em;
            left: -0.8em;
            font-size: 0.85em;
            padding: 0.4em 0.4em;
            border-radius: 0.3em;
            background: #16c7ff;
            color: #000;
        }
        
        .card--new_seria {
            right: -0.6em !important;
            position: absolute;
            background: #16c7ff;
            color: #000;
            bottom: 0.6em !important;
            padding: 0.4em 0.4em;
            font-size: 1.2em;
            border-radius: 0.3em;
        }
    `;
    document.head.appendChild(style);
    
    var processedCards = new WeakSet();
    
    // Обработка карточки
    function processCard(cardData) {
        var cardElement = cardData.card || cardData;
        
        if (!cardElement || !cardElement.querySelector) return;
        if (processedCards.has(cardElement)) return;
        
        processedCards.add(cardElement);
        
        var cardView = cardElement.querySelector('.card__view');
        if (!cardView) return;
        
        var data = cardElement.card_data || cardData.data || {};
        var isTvSeries = data.type === 'tv' || data.number_of_seasons || 
                        cardElement.classList.contains('card--tv');
        
        if (!isTvSeries) return;
        
        var status = (data.status || (data.last_episode_to_air && data.last_episode_to_air.status) || '').toLowerCase();
        
        if (status) {
            updateCardStatus(status, cardView, data);
        } else if (data.id) {
            fetchShowInfo(data.id, function(showData) {
                if (showData) {
                    data.status = showData.status ? showData.status.toLowerCase() : null;
                    data.lastSeason = showData.lastSeason;
                    data.lastEpisode = showData.lastEpisode;
                    data.totalEpisodes = showData.totalEpisodes;
                    updateCardStatus(data.status, cardView, data);
                } else {
                    updateCardStatus(null, cardView, data);
                }
            });
        } else {
            updateCardStatus(null, cardView, data);
        }
    }
    
    // Обновление статуса на карточке
    function updateCardStatus(status, cardView, data) {
        var existingElements = cardView.querySelectorAll('.card__type, .card__status');
        
        for (var i = 0; i < existingElements.length; i++) {
            existingElements[i].parentNode.removeChild(existingElements[i]);
        }
        
        // Добавляем тип контента (TV)
        var typeElement = document.createElement('div');
        typeElement.className = 'card__type';
        typeElement.textContent = 'TV';
        cardView.appendChild(typeElement);
        
        if (!status) return;
        
        var statusElement = document.createElement('div');
        statusElement.className = 'card__status';
        
        switch(status) {
            case 'released':
                statusElement.setAttribute('data-status', 'released');
                statusElement.textContent = 'Выпущенный';
                break;
            case 'ended':
                statusElement.setAttribute('data-status', 'end');
                statusElement.textContent = 'Завершён';
                break;
            case 'returning series':
                statusElement.setAttribute('data-status', 'released');
                statusElement.textContent = 'Продолжается';
                break;
            case 'planned':
                statusElement.setAttribute('data-status', 'planned');
                statusElement.textContent = 'Запланирован';
                break;
            case 'in production':
                statusElement.setAttribute('data-status', 'planned');
                statusElement.textContent = 'В производстве';
                break;
            case 'post production':
                statusElement.setAttribute('data-status', 'wait');
                statusElement.textContent = 'Постпродакшн';
                break;
            case 'rumored':
                statusElement.setAttribute('data-status', 'planned');
                statusElement.textContent = 'По слухам';
                break;
            case 'on_the_air':
                if (data.lastSeason && data.lastEpisode && data.totalEpisodes) {
                    if (data.lastEpisode === data.totalEpisodes) {
                        statusElement.setAttribute('data-status', 'end');
                        statusElement.textContent = 'Завершён';
                    } else {
                        statusElement.setAttribute('data-status', 'on_the_air');
                        statusElement.textContent = 'S ' + data.lastSeason + ' / E ' + data.lastEpisode + ' из ' + data.totalEpisodes;
                    }
                } else if (data.lastSeason && data.lastEpisode) {
                    statusElement.setAttribute('data-status', 'on_the_air');
                    statusElement.textContent = 'S ' + data.lastSeason + ' / E ' + data.lastEpisode;
                } else if (data.lastSeason) {
                    statusElement.setAttribute('data-status', 'on_the_air');
                    statusElement.textContent = 'Сезон ' + data.lastSeason;
                }
                break;
            default:
                return;
        }
        
        if (statusElement.textContent) {
            cardView.appendChild(statusElement);
        }
    }
    
    // Получение информации о сериале с TMDB
    function fetchShowInfo(id, callback) {
        var apiKey = Lampa.TMDB.getKey();
        var language = Lampa.Storage.get('language', 'ru');
        var url = 'tv/' + id + '?api_key=' + apiKey + '&language=' + language;
        
        var request = new Lampa.Request();
        request.timeout(10000);
        request.silent(Lampa.TMDB.get(url), function(response) {
            var result = {
                status: response.status || null,
                lastSeason: null,
                lastEpisode: null,
                totalEpisodes: null
            };
            
            if (response.last_episode_to_air && response.last_episode_to_air.season_number) {
                result.lastSeason = response.last_episode_to_air.season_number;
                var lastEpisode = response.last_episode_to_air.episode_number;
                var nextEpisode = response.next_episode_to_air;
                
                // Проверяем, вышел ли следующий эпизод
                if (nextEpisode && new Date(nextEpisode.air_date) <= new Date()) {
                    result.lastEpisode = nextEpisode.episode_number;
                } else {
                    result.lastEpisode = lastEpisode;
                }
                
                // Находим общее количество эпизодов в сезоне
                if (response.seasons && response.seasons.length > 0) {
                    for (var i = 0; i < response.seasons.length; i++) {
                        if (response.seasons[i].season_number === result.lastSeason) {
                            result.totalEpisodes = response.seasons[i].episode_count;
                            break;
                        }
                    }
                }
            } else if (response.last_season) {
                result.lastSeason = response.last_season;
                
                // Запрашиваем информацию о последнем сезоне
                var seasonUrl = 'tv/' + id + '/season/' + result.lastSeason + 
                              '?api_key=' + Lampa.TMDB.getKey() + '&language=' + 
                              Lampa.Storage.get('language', 'ru');
                
                var seasonRequest = new Lampa.Request();
                seasonRequest.timeout(5000);
                seasonRequest.silent(Lampa.TMDB.get(seasonUrl), function(seasonResponse) {
                    if (seasonResponse && seasonResponse.episodes && seasonResponse.episodes.length > 0) {
                        result.lastEpisode = seasonResponse.episodes.length;
                        result.totalEpisodes = seasonResponse.episodes.length;
                    }
                    callback(result);
                }, function() {
                    callback(result);
                });
                return;
            }
            
            callback(result);
        }, function() {
            callback(null);
        });
    }
    
    // Инициализация плагина
    function init() {
        
        if (window.serial_status_plugin) return;
        window.serial_status_plugin = true;
        
        // Добавляем настройку в интерфейс
        Lampa.Listener.add({
            component: 'settings',
            param: {
                name: 'season_and_seria',
                type: 'checkbox',
                default: true
            },
            field: {
                name: 'interface'
            },
            onRender: function() {
                setTimeout(function() {
                    $('div[data-name="season_and_seria"]').insertAfter('div[data-name="card_interfice_cover"]');
                }, 0);
            }
        });
        
        if (Lampa.Storage.get('season_and_seria') !== false) {
            // Перехватываем событие отображения карточки
            var cardComponent = Lampa.Component.get('Card');
            if (cardComponent && cardComponent.Card && cardComponent.Card.onVisible) {
                var originalOnVisible = cardComponent.Card.onVisible;
                cardComponent.Card.onVisible = function() {
                    originalOnVisible.apply(this);
                    processCard({
                        data: this.data,
                        card: this.card
                    });
                };
            } else {
                console.warn('Card.Card.onVisible not found');
            }
            
            // Обработка полного экрана сериала
            Lampa.Listener.follow('full', function(e) {
                if (Lampa.Activity.active().name == 'full') {
                    if (e.action == 'complite') {
                        var data = Lampa.Activity.active().data;
                        if (data.type && data.type == 'tv' && 
                            data.seasons && data.last_episode_to_air && 
                            data.last_episode_to_air.season_number) {
                            
                            var currentSeason = data.last_episode_to_air.season_number;
                            var nextEpisode = data.next_episode_to_air;
                            var currentEpisode = nextEpisode && new Date(nextEpisode.air_date) <= Date.now() ? 
                                               nextEpisode.episode_number : 
                                               data.last_episode_to_air.episode_number;
                            
                            var totalEpisodes = data.seasons.find(function(season) {
                                return season.season_number == currentSeason;
                            }).episode_count;
                            
                            var statusText;
                            if (data.next_episode_to_air) {
                                statusText = 'Серия: ' + currentEpisode + ' из ' + totalEpisodes;
                            } else {
                                statusText = 'Сезон: ' + currentSeason + ' сезон';
                            }
                            
                            // Добавляем информацию о серии на страницу
                            if (!$('.card--new_seria', Lampa.Activity.active().render.render()).length) {
                                if (window.innerWidth > 585 && !$('.full-start-new.cardify').length) {
                                    $('.full-start__poster,.full-start-new__poster', Lampa.Activity.active().render.render())
                                        .append('<div class="card--new_seria">' + 
                                               Lampa.Lang.translate(statusText) + '</div>');
                                } else if ($('.full-start-new.cardify', Lampa.Activity.active().render.render()).length) {
                                    $('.full-start-new__details', Lampa.Activity.active().render.render())
                                        .append('<span class="full-start-new__split">●</span>' +
                                               '<div class="card--new_seria"><div>' + 
                                               Lampa.Lang.translate(statusText) + '</div></div>');
                                } else {
                                    $('.full-start__tag', Lampa.Activity.active().render.render())
                                        .append('<div class="card--new_seria">' + 
                                               Lampa.Lang.translate(statusText) + '</div>');
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Запуск инициализации при готовности приложения
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.action === 'ready') {
                init();
            }
        });
    }
})();