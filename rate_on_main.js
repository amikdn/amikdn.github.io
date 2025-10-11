(function() {
    'use strict';
    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 часа
    const TMDB_API_KEY = '4ef0d7355d9ffb5151e987764708ce96'; // Публичный ключ TMDb
    const KP_API_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616'; // Найденный ключ Kinopoisk

    let ratingCache = {};

    // Получение kinopoisk_id через TMDb
    function fetchExternalIds(type, tmdbId) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            let url = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
            xhr.open("GET", url, true);
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        let data = JSON.parse(xhr.responseText);
                        resolve(data.kinopoisk_id || null);
                    } catch {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            };
            xhr.onerror = () => resolve(null);
            xhr.ontimeout = () => resolve(null);
            xhr.send();
        });
    }

    // Получение рейтинга Kinopoisk
    function fetchKPRating(kpId) {
        return new Promise((resolve) => {
            if (!kpId) return resolve(0.0);
            let xhr = new XMLHttpRequest();
            let url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kpId}`;
            xhr.open("GET", url, true);
            xhr.setRequestHeader('X-API-KEY', KP_API_KEY);
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        let data = JSON.parse(xhr.responseText);
                        resolve(data.ratingKinopoisk || 0.0);
                    } catch {
                        resolve(0.0);
                    }
                } else {
                    resolve(0.0);
                }
            };
            xhr.onerror = () => resolve(0.0);
            xhr.ontimeout = () => resolve(0.0);
            xhr.send();
        });
    }

    // Кэширование рейтинга
    async function getKPRating(type, tmdbId) {
        let cacheKey = `${type}_${tmdbId}`;
        let now = Date.now();
        if (ratingCache[cacheKey] && (now - ratingCache[cacheKey].timestamp < CACHE_TIME)) {
            return ratingCache[cacheKey].value;
        }
        let kpId = await fetchExternalIds(type, tmdbId);
        let rating = await fetchKPRating(kpId);
        ratingCache[cacheKey] = { value: rating, timestamp: now };
        return rating;
    }

    // Вставка блока рейтинга в полной информации
    function insertKPBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--kp').length > 0) return true;
        let kpBlockHtml = '<div class="full-start__rate rate--kp" style="color: cornflowerblue;">' +
            '<div>0.0</div>' +
            '<div class="source--name">KP</div>' +
            '</div>';
        rateLine.append(kpBlockHtml);
        return true;
    }

    // Вставка рейтинга на карточку
    function insertCardRating(card, event) {
        let voteEl = card.querySelector('.card__vote');
        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote';
            voteEl.style.cssText = 'line-height: 1; font-family: "SegoeUI", sans-serif; cursor: pointer; box-sizing: border-box; outline: none; user-select: none; position: absolute; right: 0.3em; bottom: 0.3em; background: rgba(0, 0, 0, 0.5); color: #fff; font-size: 1.3em; font-weight: 700; padding: 0.2em 0.5em; border-radius: 1em;';
            let viewEl = card.querySelector('.card__view') || card;
            viewEl.appendChild(voteEl);
        }
        voteEl.innerHTML = '0.0';
        let data = card.dataset || {};
        let cardData = event.object.data || {};
        let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
        let type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        getKPRating(type, id).then(rating => {
            voteEl.innerHTML = rating.toFixed(1) + '<span class="source--name"></span>';
        });
    }

    // Перехват события готовности приложения
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

    // Обработка полной информации
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            let render = e.object.activity.render();
            if (render && insertKPBlock(render)) {
                if (e.object.method && e.object.id) {
                    getKPRating(e.object.method, e.object.id).then(rating => {
                        $(render).find('.rate--kp div:first-child').text(rating.toFixed(1));
                    });
                }
            }
        }
    });

    // Обработка карточек
    Lampa.Listener.follow('card', function(e) {
        if (e.type === 'build' && e.object.card) {
            let card = e.object.card;
            insertCardRating(card, e);
        }
    });
})();
