(function() {
    'use strict';

    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 часа
    const TMDB_API_KEY = '4ef0d7355d9ffb5151e987764708ce96'; // Публичный ключ TMDb
    const KP_API_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616'; // Ключ Kinopoisk из исходного кода

    let ratingCache = {};

    // Кэширование рейтингов
    const RatingCache = {
        caches: {},
        get: function(key, id) {
            let cache = this.caches[key] || (this.caches[key] = Lampa.Storage.cache(key, 500, {}));
            let entry = cache[id];
            if (!entry) return null;
            if (Date.now() - entry.timestamp > CACHE_TIME) {
                delete cache[id];
                Lampa.Storage.set(key, cache);
                return null;
            }
            return entry;
        },
        set: function(key, id, data) {
            if (data.kp === 0 && data.imdb === 0 || data.rating === '0.0') return data;
            let cache = this.caches[key] || (this.caches[key] = Lampa.Storage.cache(key, 500, {}));
            data.timestamp = Date.now();
            cache[id] = data;
            Lampa.Storage.set(key, cache);
            return data;
        }
    };

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

    // Получение рейтинга IMDb
    function fetchIMDbRating(tmdbId, type) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            let url = `http://212.113.103.137:841/lampa/ratings/content/${type}/${tmdbId}`;
            xhr.open("GET", url, true);
            xhr.timeout = 5000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        let data = JSON.parse(xhr.responseText);
                        resolve(data.averageRating ? parseFloat(data.averageRating).toFixed(1) : '0.0');
                    } catch {
                        resolve('0.0');
                    }
                } else {
                    resolve('0.0');
                }
            };
            xhr.onerror = () => resolve('0.0');
            xhr.ontimeout = () => resolve('0.0');
            xhr.send();
        });
    }

    // Получение рейтинга Lampa
    function fetchLampaRating(data) {
        return new Promise((resolve) => {
            let type = 'movie';
            if (data.number_of_seasons || data.seasons || data.last_episode_to_air || data.first_air_date || data.original_name) {
                type = 'tv';
            }
            let ratingKey = `${type}_${data.id}`;
            let url = `http://cub.bylampa.online/api/reactions/get/${ratingKey}`;
            let xhr = Lampa.Reguest();
            xhr.timeout(15000);
            xhr.silent(url, (response) => {
                let rating = '0.0';
                if (response && response.result) {
                    let total = 0, negative = 0;
                    response.result.forEach(item => {
                        if (item.type === 'fire' || item.type === 'nice') {
                            total += parseInt(item.counter, 10);
                        }
                        if (item.type === 'think' || item.type === 'bore' || item.type === 'shit') {
                            negative += parseInt(item.counter, 10);
                        }
                    });
                    rating = (total + negative > 0 ? (total / (total + negative) * 10) : 0).toFixed(1);
                }
                RatingCache.set('lampa_rating', data.id, { rating: rating, timestamp: Date.now() });
                xhr.clear();
                resolve(rating);
            }, () => {
                xhr.clear();
                resolve('0.0');
            });
        });
    }

    // Универсальная функция получения рейтинга
    async function getRating(type, tmdbId, source) {
        let cacheKey = `${type}_${tmdbId}`;
        let cached = RatingCache.get(`${source}_rating`, cacheKey);
        if (cached && cached[source] !== '0.0') {
            return cached[source];
        }
        let rating = '0.0';
        if (source === 'kp') {
            let kpId = await fetchExternalIds(type, tmdbId);
            rating = await fetchKPRating(kpId);
        } else if (source === 'imdb') {
            rating = await fetchIMDbRating(tmdbId, type);
        } else if (source === 'lampa') {
            rating = await fetchLampaRating({ id: tmdbId });
        }
        RatingCache.set(`${source}_rating`, cacheKey, { [source]: rating, timestamp: Date.now() });
        return rating;
    }

    // Вставка блока рейтинга в полной информации
    function insertRatingBlock(render, source) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find(`.rate--${source}`).length > 0) return true;
        let blockHtml = `<div class="full-start__rate rate--${source}" style="color: cornflowerblue;">
            <div>0.0</div>
            <div class="source--name">${source.toUpperCase()}</div>
        </div>`;
        rateLine.append(blockHtml);
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
        voteEl.textContent = '0.0';
        let data = card.dataset || {};
        let cardData = event.object.data || {};
        let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
        let type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        let source = Lampa.Storage.get('rating_source', 'tmdb');
        if (voteEl.dataset && voteEl.dataset.source === source && voteEl.dataset.movieId === id.toString()) return;
        voteEl.dataset.source = source;
        voteEl.dataset.movieId = id.toString();
        voteEl.className = `card__vote rate--${source}`;
        getRating(type, id, source).then(rating => {
            if (voteEl.dataset.movieId === id.toString()) {
                voteEl.innerHTML = `${rating} <span class="source--name">${source.toUpperCase()}</span>`;
            }
        });
    }

    // Добавление стилей
    function addStyles() {
        let style = document.createElement('style');
        style.type = 'text/css';
        let css = `
            .card__vote {
                line-height: 1;
                font-family: "SegoeUI", sans-serif;
                cursor: pointer;
                box-sizing: border-box;
                outline: none;
                user-select: none;
                position: absolute;
                right: 0.3em;
                bottom: 0.3em;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                font-size: 1.3em;
                font-weight: 700;
                padding: 0.2em 0.5em;
                border-radius: 1em;
            }
            .card__vote .source--name {
                font-size: 0.8em;
                margin-left: 0.3em;
                flex-shrink: 0;
            }
            .rate--kp .source--name,
            .rate--imdb .source--name,
            .rate--lampa .source--name {
                display: inline-block;
                color: #fff;
            }
            @media (min-width: 481px) {
                .card__vote .source--name {
                    font-size: 0.8em;
                }
            }
        `;
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
    }

    // Добавление настройки выбора источника
    function addRatingSourceSetting() {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'rating_source',
                type: 'select',
                values: {
                    tmdb: 'TMDB',
                    lampa: 'LAMPA',
                    kp: 'КиноПоиск',
                    imdb: 'IMDB'
                },
                default: 'kp'
            },
            field: {
                name: 'Источник рейтинга на карточках',
                description: 'Выберите какой рейтинг отображать на карточках'
            },
            onRender: function(element) {
                setTimeout(() => {
                    $('.settings-param > div:contains("Источник рейтинга на карточках")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
            },
            onChange: function(value) {
                Lampa.Storage.set('rating_source', value);
                let votes = document.querySelectorAll('.card__vote');
                for (let i = 0; i < votes.length; i++) {
                    let vote = votes[i];
                    let card = vote;
                    while (card && !card.classList.contains('card')) {
                        card = card.parentElement;
                    }
                    if (card) {
                        delete vote.dataset.source;
                        delete vote.dataset.movieId;
                        let event = { card: card, data: card.dataset };
                        insertCardRating(event.card, { object: event });
                    }
                }
            }
        });
    }

    // Инициализация плагина
    function init() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        addRatingSourceSetting();
        addStyles();
        Object.defineProperty(window.Lampa.Card.prototype, '_build', {
            get: function() {
                return this.__build;
            },
            set: function(func) {
                this.__build = function() {
                    let result = func.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                    return result;
                }.bind(this);
            }
        });
        Lampa.Listener.follow('card', function(e) {
            if (e.type === 'build' && e.object.card) {
                insertCardRating(e.object.card, e);
            }
        });
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                let render = e.object.activity.render();
                let source = Lampa.Storage.get('rating_source', 'kp');
                if (render && insertRatingBlock(render, source)) {
                    if (e.object.method && e.object.id) {
                        getRating(e.object.method, e.object.id, source).then(rating => {
                            $(render).find(`.rate--${source} div:first-child`).text(rating);
                        });
                    }
                }
            }
        });
    }

    // Запуск плагина
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }
})();
