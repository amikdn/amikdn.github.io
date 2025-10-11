(function() {
    'use strict';
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    const TMDB_API_KEY = '4ef0d7355d9ffb5151e987764708ce96'; // Встроенный ключ TMDb

    let ratingCache = {};

    // Получение imdb_id через TMDb
    function fetchIMDbId(type, tmdbId) {
        return new Promise((resolve) => {
            let url = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
            $.ajax({
                url: url,
                type: 'GET',
                timeout: 10000,
                success: function(data) {
                    resolve(data.imdb_id || null);
                },
                error: function() {
                    resolve(null);
                }
            });
        });
    }

    // Парсинг рейтинга IMDb с страницы
    function parseIMDbRating(imdbId) {
        return new Promise((resolve) => {
            if (!imdbId) return resolve(0.0);
            let url = `https://www.imdb.com/title/${imdbId}/`;
            $.ajax({
                url: url,
                type: 'GET',
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 10000,
                success: function(text) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(text, 'text/html');
                    let ratingElement = doc.querySelector('[data-testid="hero-rating-bar__aggregate-rating__score"] span:first-child');
                    let rating = ratingElement ? parseFloat(ratingElement.innerText.trim()) : 0.0;
                    resolve(rating);
                },
                error: function() {
                    resolve(0.0);
                }
            });
        });
    }

    // Кэширование и получение рейтинга (IMDb, fallback на TMDB)
    async function getRating(type, tmdbId, cardData) {
        let cacheKey = `${type}_${tmdbId}`;
        let now = Date.now();
        if (ratingCache[cacheKey] && (now - ratingCache[cacheKey].timestamp < CACHE_TIME)) {
            return ratingCache[cacheKey].value;
        }
        let imdbId = await fetchIMDbId(type, tmdbId);
        let rating = await parseIMDbRating(imdbId);
        if (rating === 0.0) {
            rating = cardData.vote_average || 0.0;
        }
        ratingCache[cacheKey] = { value: rating, timestamp: now };
        return rating;
    }

    // Вставка блока в полной информации
    function insertRatingBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--imdb').length > 0) return true;
        let blockHtml = '<div class="full-start__rate rate--imdb" style="color: cornflowerblue;">' +
            '<div>0.0</div>' +
            '<div class="source--name">IMDB</div>' +
            '</div>';
        rateLine.append(blockHtml);
        return true;
    }

    // Вставка рейтинга в карточку на главной
    function insertCardRating(card, event) {
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

        getRating(type, id, cardData).then(rating => {
            voteEl.innerHTML = rating.toFixed(1);
        });
    }

    // Перехват событий
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            if (!window.Lampa.Card._build_original) {
                window.Lampa.Card._build_original = window.Lampa.Card._build;
                window.Lampa.Card._build = function() {
                    let result = window.Lampa.Card._build_original.call(this);
                    setTimeout(() => Lampa.Listener.send('card', { type: 'build', object: this }), 100);
                    return result;
                };
            }
        }
    });

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            let render = e.object.activity.render();
            if (render && insertRatingBlock(render)) {
                if (e.object.method && e.object.id) {
                    getRating(e.object.method, e.object.id, {}).then(rating => {
                        $(render).find('.rate--imdb div:first-child').text(rating.toFixed(1));
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
