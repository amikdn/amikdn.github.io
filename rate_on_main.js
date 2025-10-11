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
            if (data.value.rating === '0.0' || data.value.rating === 0) return data;
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
            if (!kpId) return resolve('0.0');
            let xhr = new XMLHttpRequest();
            let url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kpId}`;
            xhr.open("GET", url, true);
            xhr.setRequestHeader('X-API-KEY', KP_API_KEY);
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        let data = JSON.parse(xhr.responseText);
                        resolve((data.ratingKinopoisk || 0.0).toFixed(1));
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

    // Расчет рейтинга Lampa
    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        let reactionCnt = {};

        const reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };

        reactions.forEach(item => {
            const count = parseInt(item.counter, 10) || 0;
            const coef = reactionCoef[item.type] || 0;
            weightedSum += count * coef;
            totalCount += count;
            reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
        });

        if (totalCount === 0) return { rating: '0.0', medianReaction: '' };

        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        const finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : '0.0';

        let medianReaction = '';
        const medianIndex = Math.ceil(totalCount / 2.0);
        const sortedReactions = Object.entries(reactionCoef)
            .sort((a, b) => a[1] - b[1])
            .map(r => r[0]);
        let cumulativeCount = 0;
        while (sortedReactions.length && cumulativeCount < medianIndex) {
            medianReaction = sortedReactions.pop();
            cumulativeCount += (reactionCnt[medianReaction] || 0);
        }

        return { rating: finalRating, medianReaction: medianReaction };
    }

    // Получение рейтинга Lampa
    function fetchLampaRating(type, id) {
        return new Promise((resolve) => {
            let ratingKey = `${type}_${id}`;
            let xhr = new XMLHttpRequest();
            let url = `https://cub.rip/api/reactions/get/${ratingKey}`;
            xhr.open("GET", url, true);
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if (data && data.result && Array.isArray(data.result)) {
                                let result = calculateLampaRating10(data.result);
                                resolve(result);
                            } else {
                                resolve({ rating: '0.0', medianReaction: '' });
                            }
                        } catch {
                            resolve({ rating: '0.0', medianReaction: '' });
                        }
                    } else {
                        resolve({ rating: '0.0', medianReaction: '' });
                    }
                }
            };
            xhr.onerror = function() { resolve({ rating: '0.0', medianReaction: '' }); };
            xhr.ontimeout = function() { resolve({ rating: '0.0', medianReaction: '' }); };
            xhr.send();
        });
    }

    // Универсальная функция получения рейтинга
    async function getRating(type, tmdbId, source) {
        let cacheKey = `${type}_${tmdbId}`;
        let cached = RatingCache.get(`${source}_rating`, cacheKey);
        if (cached && cached.value.rating !== '0.0') {
            return cached.value;
        }
        let result = { rating: '0.0', medianReaction: '' };
        if (source === 'kp') {
            let kpId = await fetchExternalIds(type, tmdbId);
            let rating = await fetchKPRating(kpId);
            result.rating = rating;
        } else if (source === 'imdb') {
            let rating = await fetchIMDbRating(tmdbId, type);
            result.rating = rating;
        } else if (source === 'lampa') {
            result = await fetchLampaRating(type, tmdbId);
        }
        RatingCache.set(`${source}_rating`, cacheKey, { value: result });
        return result;
    }

    // Вставка блока рейтинга в полной информации
    function insertRatingBlock(render, source) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find(`.rate--${source}`).length > 0) return true;
        let blockHtml = `<div class="full-start__rate rate--${source}" style="color: cornflowerblue;">
            <div class="rate-value">0.0</div>
            <div class="rate-icon"></div>
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
        voteEl.innerHTML = '0.0';
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
        getRating(type, id, source).then(result => {
            if (voteEl.dataset.movieId === id.toString()) {
                let iconHtml = '';
                if (result.medianReaction) {
                    let reactionSrc = 'https://cub.rip/img/reactions/' + result.medianReaction + '.svg';
                    iconHtml = ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
                }
                voteEl.innerHTML = `${result.rating}${iconHtml} <span class="source--name">${source.toUpperCase()}</span>`;
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
                        getRating(e.object.method, e.object.id, source).then(result => {
                            $(render).find(`.rate--${source} .rate-value`).text(result.rating);
                            if (result.medianReaction) {
                                let reactionSrc = 'https://cub.rip/img/reactions/' + result.medianReaction + '.svg';
                                $(render).find(`.rate--${source} .rate-icon`).html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                            }
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
