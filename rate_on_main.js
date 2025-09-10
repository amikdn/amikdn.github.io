(function() {
    'use strict';

    if (window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;

    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        reactions.forEach(item => {
            const count = parseInt(item.counter, 10);
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
                    break;
            }
        });
        if (totalCount === 0) return 0;
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        return parseFloat(rating10.toFixed(1));
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
                                resolve(0); // Фallback на 0 для пустого результата
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
            return 0; // Fallback на 0 при ошибке
        }
    }

    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        let lampaBlockHtml =
            '<div class="full-start__rate rate--lampa">' +
                '<div class="rate-value">0 LAMPA</div>' +
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
        let voteEl = card.querySelector('.card__vote');
        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote';
            let viewEl = card.querySelector('.card__view') || card;
            viewEl.appendChild(voteEl);
            voteEl.innerHTML = '0 LAMPA'; // Начальное значение
        } else {
            voteEl.innerHTML = ''; // Очищаем предыдущий контент (TMDB)
        }
        let data = card.dataset || {};
        let cardData = event.object.data || {}; // Используем event.object.data как в обфусцированном коде
        let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
        let type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        let ratingKey = type + "_" + id;
        console.log('Rating key for card:', ratingKey, 'Card data:', { card, data, cardData, event: event.object });
        getLampaRating(ratingKey).then(rating => {
            voteEl.innerHTML = rating !== null ? rating : '0 LAMPA';
            console.log('Rating set to:', voteEl.innerHTML, 'for', ratingKey);
        }).catch(error => {
            console.error('Error setting rating for ' + ratingKey + ':', error);
            voteEl.innerHTML = '0.0';
        });
    }

    // Перехват _build с задержкой
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            if (!window.Lampa.Card._build_original) {
                window.Lampa.Card._build_original = window.Lampa.Card._build;
                window.Lampa.Card._build = function() {
                    let result = window.Lampa.Card._build_original.call(this);
                    console.log('Card build data:', this); // Логируем объект this
                    setTimeout(() => Lampa.Listener.send('card', { type: 'build', object: this }), 100); // Задержка для инициализации
                    return result;
                };
            }
        }
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
