(function() {
    'use strict';
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let ratingCache = {};

    // Извлечение рейтингов из DOM полной карточки и кэширование
    function cacheRatingsFromFull(render, type, id) {
        let tmdbRating = parseFloat($(render).find('.rate--tmdb div:first-child').text()) || 0.0;
        let imdbRating = parseFloat($(render).find('.rate--imdb div:first-child').text()) || 0.0;
        let kpRating = parseFloat($(render).find('.rate--kp div:first-child').text()) || 0.0;

        let cacheKey = `${type}_${id}`;
        ratingCache[cacheKey] = {
            tmdb: tmdbRating,
            imdb: imdbRating,
            kp: kpRating,
            timestamp: Date.now()
        };
        Lampa.Storage.set('cached_ratings', ratingCache); // Сохранение в Storage Lampa
    }

    // Загрузка кэша при старте
    function loadCache() {
        ratingCache = Lampa.Storage.get('cached_ratings', {});
    }

    // Получение рейтинга из кэша (fallback на TMDB)
    function getCachedRating(type, id, source = 'kp') {
        let cacheKey = `${type}_${id}`;
        let now = Date.now();
        let cached = ratingCache[cacheKey];
        if (cached && (now - cached.timestamp < CACHE_TIME)) {
            return cached[source] || cached.tmdb || 0.0;
        }
        return 0.0; // Если не в кэше, покажем 0.0 или TMDB при следующей загрузке full
    }

    // Вставка блока в полной информации (для совместимости, если нужно)
    function insertRatingBlock(render, source = 'kp') {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        let className = source === 'kp' ? 'rate--kp' : 'rate--imdb';
        if (rateLine.find(`.${className}`).length > 0) return true;
        let blockHtml = `<div class="full-start__rate ${className}" style="color: cornflowerblue;">
            <div class="rate-value">0.0</div>
            <div class="source--name">${source.toUpperCase()}</div>
        </div>`;
        rateLine.append(blockHtml);
        return true;
    }

    // Вставка рейтинга в карточку на главной (из вашего кода)
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

        // Получаем из кэша (источник 'kp' по умолчанию; смените на 'imdb' если нужно)
        let rating = getCachedRating(type, id, 'kp');
        voteEl.innerHTML = rating.toFixed(1);
    }

    // Перехват событий (из вашего кода + кэширование)
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            loadCache(); // Загружаем кэш при старте
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
            if (render && insertRatingBlock(render, 'kp')) {
                if (e.object.method && e.object.id) {
                    // Кэшируем рейтинги из DOM полной карточки
                    cacheRatingsFromFull(render, e.object.method, e.object.id);
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
