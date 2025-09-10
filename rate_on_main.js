(function() {
    'use strict';

    if (window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;

    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        console.log('Calculating rating for:', reactions);
        reactions.forEach(item => {
            const count = parseInt(item.counter, 10) || 0;
            switch (item.type) {
                case "fire":
                    weightedSum += count * 5;
                    totalCount += count;
                    break;
                case "nice":
                    weightedSum += count * 4;
                    totalCount += count;
                    break;
                case "think":
                    weightedSum += count * 3;
                    totalCount += count;
                    break;
                case "bore":
                    weightedSum += count * 2;
                    totalCount += count;
                    break;
                case "shit":
                    weightedSum += count * 1;
                    totalCount += count;
                    break;
                default:
                    console.warn('Unknown reaction type:', item.type);
                    break;
            }
        });
        console.log('Weighted sum:', weightedSum, 'Total count:', totalCount);
        if (totalCount === 0) return 0;
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        return rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
    }

    function fetchLampaRating(ratingKey) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "http://cub.rip/api/reactions/get/" + ratingKey;
            console.log('Fetching rating from:', url);
            xhr.open("GET", url, true);
            xhr.timeout = 2000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            console.log('API Response for ' + ratingKey + ':', data);
                            if (data && data.result && Array.isArray(data.result)) {
                                let rating = calculateLampaRating10(data.result);
                                resolve(rating);
                            } else {
                                resolve(0);
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("Ошибка запроса, статус: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function() { reject(new Error("XHR ошибка")); };
            xhr.ontimeout = function() { reject(new Error("Таймаут запроса")); };
            xhr.send();
        });
    }

    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if (lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)) {
            return lampaRatingCache[ratingKey].value;
        }
        try {
            let rating = await fetchLampaRating(ratingKey);
            lampaRatingCache[ratingKey] = { value: rating, timestamp: now };
            console.log('Cached rating for ' + ratingKey + ':', rating);
            return rating;
        } catch (e) {
            console.error('Error fetching rating for ' + ratingKey + ':', e.message);
            return 0;
        }
    }

    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        let lampaBlockHtml =
            '<div class="full-start__rate rate--lampa">' +
                '<div class="rate-value">0.0</div>' +
                '<div class="source--name">LAMPA</div>' +
            '</div>';
        let kpBlock = rateLine.find('.rate--kp');
        if (kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        return true;
    }

    function insertCardRating(card, event) {
        if (!Lampa.Storage.get('lampa_rating_enabled', true)) return;
        let voteEl = card.querySelector('.card__vote');
        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote';
            let viewEl = card.querySelector('.card__view') || card;
            viewEl.appendChild(voteEl);
            voteEl.innerHTML = '0.0';
        } else {
            voteEl.innerHTML = '';
        }
        let data = card.dataset || {};
        let cardData = event.object.data || {};
        let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
        let type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        let ratingKey = type + "_" + id;
        console.log('Rating key for card:', ratingKey, 'Card data:', { card, data, cardData, event: event.object });
        getLampaRating(ratingKey).then(rating => {
            voteEl.innerHTML = rating !== null ? rating : '0.0';
            console.log('Rating set to:', voteEl.innerHTML, 'for', ratingKey);
        }).catch(error => {
            console.error('Error setting rating for ' + ratingKey + ':', error);
            voteEl.innerHTML = '0.0';
        });
    }

    // Инициализация плагина и добавление настройки
    function startPlugin() {
        // Добавляем компонент настроек
        Lampa.SettingsApi.addComponent({
            component: 'lampa_rating',
            name: 'LAMPA Rating',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/></svg>'
        });

        // Добавляем параметр переключателя
        Lampa.SettingsApi.addParam({
            component: 'lampa_rating',
            param: {
                name: 'lampa_rating_enabled',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Show LAMPA Rating on Posters',
                description: 'Enable or disable LAMPA rating display on posters'
            },
            onChange: function (value) {
                Lampa.Storage.set('lampa_rating_enabled', value);
                console.log('Lampa rating enabled:', value);
                // Перерендер карточек при смене настройки
                let cards = document.querySelectorAll('.card');
                cards.forEach(card => {
                    let event = { type: 'build', object: { card: card, data: card.dataset || {} } };
                    insertCardRating(card, event);
                });
            }
        });

        // Загружаем сохранённое значение
        Lampa.Storage.set('lampa_rating_enabled', Lampa.Storage.get('lampa_rating_enabled', true));

        if (!window.Lampa.Card._build_original) {
            window.Lampa.Card._build_original = window.Lampa.Card._build;
            window.Lampa.Card._build = function() {
                let result = window.Lampa.Card._build_original.call(this);
                console.log('Card build data:', this);
                setTimeout(() => Lampa.Listener.send('card', { type: 'build', object: this }), 100);
                return result;
            };
        }
    }

    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') startPlugin();
    });

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            let render = e.object.activity.render();
            if (render && insertLampaBlock(render)) {
                if (e.object.method && e.object.id) {
                    let ratingKey = e.object.method + "_" + e.object.id;
                    getLampaRating(ratingKey).then(rating => {
                        if (rating !== null) {
                            $(render).find('.rate--lampa .rate-value').text(rating);
                        }
                    });
                }
            }
        }
    });

    Lampa.Listener.follow('card', function(e) {
        if (e.type === 'build' && e.object.card) {
            let card = e.object.card;
            insertCardRating(card, e);
        }
    });
})();
