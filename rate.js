(function () {
    'use strict';

    Lampa.Platform.tv();

    const ratingCache = {
        caches: {},
        get(source, key) {
            const cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            const data = cache[key];
            if (!data) return null;
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                delete cache[key];
                Lampa.Storage.set(source, cache);
                return null;
            }
            return data;
        },
        set(source, key, value) {
            if (value.kp === 0 && value.imdb === 0 && value.rating === 0 && value.vote_average === 0) return value;
            const cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            value.timestamp = Date.now();
            cache[key] = value;
            Lampa.Storage.set(source, cache);
            return value;
        }
    };

    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let taskQueue = [];
    let isProcessing = false;
    const taskInterval = 300;

    let requestPool = [];
    function getRequest() {
        return requestPool.pop() || new Lampa.Reguest();
    }

    function releaseRequest(request) {
        request.clear();
        if (requestPool.length < 3) requestPool.push(request);
    }

    function processQueue() {
        if (isProcessing || !taskQueue.length) return;
        isProcessing = true;
        const task = taskQueue.shift();
        task.execute();
        setTimeout(() => {
            isProcessing = false;
            processQueue();
        }, taskInterval);
    }

    function addToQueue(task) {
        taskQueue.push({ execute: task });
        processQueue();
    }

    const stringCache = {};
    function normalizeString(str) {
        if (stringCache[str]) return stringCache[str];
        const normalized = str
            .replace(/[\s.,:;''`!?]+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-')
            .replace(/ё/g, 'е');
        stringCache[str] = normalized;
        return normalized;
    }

    function cleanString(str) {
        return normalizeString(str)
            .replace(/^[ \/\\]+/, '')
            .replace(/[ \/\\]+$/, '')
            .replace(/\+( *[+\/\\])+/g, '+')
            .replace(/([+\/\\] *)+\+/g, '+')
            .replace(/( *[\/\\]+ *)+/g, '+');
    }

    function matchStrings(str1, str2) {
        return typeof str1 === 'string' && typeof str2 === 'string' && normalizeString(str1) === normalizeString(str2);
    }

    function containsString(str1, str2) {
        return typeof str1 === 'string' && typeof str2 === 'string' && normalizeString(str1).indexOf(normalizeString(str2)) !== -1;
    }

    function getKinopoiskRating(item, callback) {
        const cached = ratingCache.get('kp_rating', item.id);
        if (cached) {
            const source = Lampa.Storage.get('rating_source', 'tmdb');
            const rating = source === 'kp' ? cached.kp : cached.imdb;
            if (rating && rating > 0) {
                callback(parseFloat(rating).toFixed(1));
                return;
            }
        }
        addToQueue(() => {
            const request = getRequest();
            const title = cleanString(item.title || item.name);
            const releaseYear = parseInt(String(item.release_date || item.first_air_date || item.last_air_date || "0000").slice(0, 4));
            const originalTitle = item.original_title || item.original_name;
            const api = {
                url: 'https://kinopoiskapiunofficial.tech/',
                rating_url: 'api/v2.2/films/',
                headers: { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' }
            };

            function searchMovies() {
                let searchUrl = Lampa.Utils.addUrlComponent(api.url + 'api/v2.1/films/search-by-keyword', `keyword=${encodeURIComponent(title)}`);
                if (item.imdb_id) {
                    searchUrl = Lampa.Utils.addUrlComponent(api.url + 'api/v2.2/films', `imdbId=${encodeURIComponent(item.imdb_id)}`);
                }
                request.timeout(15000);
                request.silent(searchUrl, (data) => {
                    const results = data.films || data.items || [];
                    processSearchResults(results);
                }, () => {
                    releaseRequest(request);
                    callback('0.0');
                }, false, { headers: api.headers });
            }

            function processSearchResults(results) {
                if (!results || !results.length) {
                    releaseRequest(request);
                    callback('0.0');
                    return;
                }
                results.forEach(result => {
                    result.tmp_year = parseInt(String(result.year || result.start_date || "0000").slice(0, 4));
                });
                let filteredResults = results;
                if (originalTitle) {
                    const matched = results.filter(result =>
                        containsString(result.orig_title || result.nameEn, originalTitle) ||
                        containsString(result.en_title || result.nameOriginal, originalTitle) ||
                        containsString(result.title || result.nameRu || result.name, originalTitle)
                    );
                    if (matched.length) filteredResults = matched;
                }
                if (filteredResults.length > 1 && releaseYear) {
                    let yearMatched = filteredResults.filter(result => result.tmp_year == releaseYear);
                    if (!yearMatched.length) {
                        yearMatched = filteredResults.filter(result => result.tmp_year && result.tmp_year > releaseYear - 2 && result.tmp_year < releaseYear + 2);
                    }
                    if (yearMatched.length) filteredResults = yearMatched;
                }
                if (filteredResults.length >= 1) {
                    const movieId = filteredResults[0].kp_id || filteredResults[0].kinopoisk_id || filteredResults[0].kinopoiskId || filteredResults[0].filmId;
                    if (movieId) {
                        request.timeout(15000);
                        request.silent(`${api.url}${api.rating_url}${movieId}`, (data) => {
                            const cachedData = ratingCache.set('kp_rating', item.id, {
                                kp: data.ratingKinopoisk || 0,
                                imdb: data.ratingImdb || 0,
                                timestamp: Date.now()
                            });
                            const source = Lampa.Storage.get('rating_source', 'tmdb');
                            const rating = source === 'kp' ? cachedData.kp : cachedData.imdb;
                            releaseRequest(request);
                            callback(rating ? parseFloat(rating).toFixed(1) : '0.0');
                        }, () => {
                            releaseRequest(request);
                            callback('0.0');
                        }, false, { headers: api.headers });
                    } else {
                        releaseRequest(request);
                        callback('0.0');
                    }
                } else {
                    releaseRequest(request);
                    callback('0.0');
                }
            }
            searchMovies();
        });
    }

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
        if (totalCount === 0) return { rating: 0, medianReaction: '' };
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        const finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
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

    function fetchLampaRating(ratingKey) {
        return new Promise((resolve) => {
            const request = getRequest();
            let url = "https://cubnotrip.top/api/reactions/get/" + ratingKey;
            request.timeout(10000);
            request.silent(url, (data) => {
                try {
                    if (data && data.result && Array.isArray(data.result)) {
                        let result = calculateLampaRating10(data.result);
                        resolve(result);
                    } else {
                        resolve({ rating: 0, medianReaction: '' });
                    }
                } catch {
                    resolve({ rating: 0, medianReaction: '' });
                } finally {
                    releaseRequest(request);
                }
            }, () => {
                releaseRequest(request);
                resolve({ rating: 0, medianReaction: '' });
            }, false);
        });
    }

    async function getLampaRating(ratingKey) {
        const cached = ratingCache.get('lampa_rating', ratingKey);
        if (cached) return cached;
        try {
            let result = await fetchLampaRating(ratingKey);
            return ratingCache.set('lampa_rating', ratingKey, result);
        } catch {
            return { rating: 0, medianReaction: '' };
        }
    }

    function getTMDBRating(data) {
        const ratingKey = data.id;
        const cached = ratingCache.get('tmdb_rating', ratingKey);
        if (cached) return cached.vote_average.toFixed(1);
        const rating = data.vote_average ? data.vote_average.toFixed(1) : '0.0';
        ratingCache.set('tmdb_rating', ratingKey, { vote_average: parseFloat(rating) });
        return rating;
    }

    function createRatingElement(card) {
        const ratingElement = document.createElement('div');
        ratingElement.className = 'card__vote';
        ratingElement.style.cssText = `
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
            padding: 0.2em 0.5em;
            border-radius: 1em;
            display: flex;
            align-items: center;
        `;
        const parent = card.querySelector('.card__view') || card;
        parent.appendChild(ratingElement);
        return ratingElement;
    }

    function updateCardRating(item) {
        const card = item.card || item;
        if (!card || !card.querySelector || !document.body.contains(card)) return;
        const data = card.card_data || item.data || {};
        if (!data.id) return;
        const source = Lampa.Storage.get('rating_source', 'tmdb');
        let ratingElement = card.querySelector('.card__vote');
        if (!ratingElement) ratingElement = createRatingElement(card);
        ratingElement.dataset.source = source;
        ratingElement.dataset.movieId = data.id.toString();
        ratingElement.className = `card__vote rate--${source}`;
        ratingElement.innerHTML = '';
        ratingElement.style.display = '';
        if (source === 'tmdb') {
            const rating = getTMDBRating(data);
            if (rating !== '0.0') {
                ratingElement.innerHTML = `${rating} <span class="source--name"></span>`;
            } else {
                ratingElement.style.display = 'none';
            }
        } else if (source === 'lampa') {
            let type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            let ratingKey = `${type}_${data.id}`;
            const cached = ratingCache.get('lampa_rating', ratingKey);
            if (cached && cached.rating > 0) {
                let html = `${cached.rating}`;
                if (cached.medianReaction) {
                    let reactionSrc = 'https://cubnotrip.top/img/reactions/' + cached.medianReaction + '.svg';
                    html += ` <img style="width:1em;height:1em;margin:0 0.2em;" src="${reactionSrc}">`;
                }
                ratingElement.innerHTML = html;
                return;
            }
            addToQueue(() => {
                getLampaRating(ratingKey).then(result => {
                    if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                        if (result.rating > 0) {
                            let html = `${result.rating}`;
                            if (result.medianReaction) {
                                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                                html += ` <img style="width:1em;height:1em;margin:0 0.2em;" src="${reactionSrc}">`;
                            }
                            ratingElement.innerHTML = html;
                        } else {
                            ratingElement.style.display = 'none';
                        }
                    }
                });
            });
        } else if (source === 'kp' || source === 'imdb') {
            getKinopoiskRating(data, (rating) => {
                if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                    if (rating !== '0.0') {
                        ratingElement.innerHTML = `${rating} <span class="source--name"></span>`;
                    } else {
                        ratingElement.style.display = 'none';
                    }
                }
            });
        }
    }

    window.refreshAllRatings = function() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            const data = card.card_data;
            if (data && data.id) {
                const ratingElement = card.querySelector('.card__vote');
                if (ratingElement) {
                    delete ratingElement.dataset.source;
                    delete ratingElement.dataset.movieId;
                }
                updateCardRating({ card, data });
            }
        });
    };

    function pollCards() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            const data = card.card_data;
            if (data && data.id) {
                const ratingElement = card.querySelector('.card__vote');
                const source = Lampa.Storage.get('rating_source', 'tmdb');
                if (!ratingElement || ratingElement.dataset.source !== source || ratingElement.dataset.movieId !== data.id.toString()) {
                    updateCardRating({ card, data });
                } else {
                    if (source === 'lampa') {
                        const ratingKey = (data.seasons || data.first_air_date || data.original_name) ? `tv_${data.id}` : `movie_${data.id}`;
                        const cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating > 0 && ratingElement.innerHTML === '') {
                            let html = `${cached.rating}`;
                            if (cached.medianReaction) {
                                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + cached.medianReaction + '.svg';
                                html += ` <img style="width:1em;height:1em;margin:0 0.2em;" src="${reactionSrc}">`;
                            }
                            ratingElement.innerHTML = html;
                        }
                    } else if (source === 'tmdb') {
                        const ratingKey = data.id;
                        const cached = ratingCache.get('tmdb_rating', ratingKey);
                        if (cached && cached.vote_average > 0 && ratingElement.innerHTML === '') {
                            ratingElement.innerHTML = `${cached.vote_average.toFixed(1)} <span class="source--name"></span>`;
                        }
                    } else if (source === 'kp' || source === 'imdb') {
                        const cached = ratingCache.get('kp_rating', data.id);
                        if (cached && (cached.kp > 0 || cached.imdb > 0) && ratingElement.innerHTML === '') {
                            const rating = source === 'kp' ? cached.kp : cached.imdb;
                            ratingElement.innerHTML = `${parseFloat(rating).toFixed(1)} <span class="source--name"></span>`;
                        }
                    }
                }
            }
        });
        setTimeout(pollCards, 500);
    }

    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        let lampaBlockHtml = `
            <div class="full-start__rate rate--lampa">
                <div class="rate-value">0.0</div>
                <div class="rate-icon"></div>
                <div class="source--name">LAMPA</div>
            </div>`;
        let kpBlock = rateLine.find('.rate--kp');
        if (kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        return true;
    }

    function addSettings() {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'rating_source',
                type: 'select',
                values: {
                    tmdb: 'TMDB',
                    lampa: 'Lampa',
                    kp: 'КиноПоиск',
                    imdb: 'IMDB'
                },
                default: 'tmdb'
            },
            field: {
                name: 'Источник рейтинга на карточках',
                description: 'Выберите какой рейтинг отображать на карточках'
            },
            onRender: (value) => {
                setTimeout(() => {
                    $('.settings-param > div:contains("Источник рейтинга на карточках")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
            },
            onChange: (value) => {
                Lampa.Storage.set('rating_source', value);
                setTimeout(() => {
                    window.refreshAllRatings();
                }, 100);
            }
        });
    }

    function setupCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Card.prototype, 'build', {
            get() { return this._build; },
            set(func) {
                this._build = () => {
                    func.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                };
            }
        });
    }

    function initPlugin() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = `
            .card__vote {
                display: flex;
                align-items: center !important;
            }
            .card__vote .source--name {
                font-size: 0;
                color: transparent;
                width: 16px;
                height: 16px;
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                margin-left: 4px;
                flex-shrink: 0;
            }
            @media (min-width: 481px) {
                .card__vote .source--name {
                    width: 24px;
                    height: 24px;
                    margin-left: 6px;
                }
            }
            .rate--kp .source--name {
                background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
            }
            .rate--tmdb .source--name {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%2390cea1'/%3E%3Cstop offset='56%25' stop-color='%233cbec9'/%3E%3Cstop offset='100%25' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3Cstyle%3E.text-style%7Bfont-weight:bold;fill:url(%23grad);text-anchor:start;dominant-baseline:middle;textLength:300;lengthAdjust:spacingAndGlyphs;font-size:120px;%7D%3C/style%3E%3C/defs%3E%3Ctext class='text-style' x='0' y='150' textLength='300' lengthAdjust='spacingAndGlyphs'%3ETMDB%3C/text%3E%3C/svg%3E");
            }
            .rate--imdb .source--name {
                background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'/%3E%3C/g%3E%3C/svg%3E");
            }
            @media (max-width: 480px) and (orientation: portrait) {
                .full-start__rate.rate--lampa {
                    min-width: 80px;
                }
            }
        `;
        document.head.appendChild(style);
        addSettings();
        setupCardListener();
        pollCards();

        Lampa.Listener.follow('card', (event) => {
            if (event.type === 'build' && event.object.card) {
                const data = event.object.card.card_data;
                if (data && data.id) {
                    updateCardRating({ card: event.object.card, data });
                }
            }
        });

        Lampa.Listener.follow('full', (event) => {
            if (event.type === 'complite') {
                let render = event.object.activity.render();
                if (render && insertLampaBlock(render)) {
                    if (event.object.method && event.object.id) {
                        let ratingKey = event.object.method + "_" + event.object.id;
                        const cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating > 0) {
                            let rateValue = $(render).find('.rate--lampa .rate-value');
                            let rateIcon = $(render).find('.rate--lampa .rate-icon');
                            rateValue.text(cached.rating);
                            if (cached.medianReaction) {
                                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + cached.medianReaction + '.svg';
                                rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                            }
                            return;
                        }
                        addToQueue(() => {
                            getLampaRating(ratingKey).then(result => {
                                let rateValue = $(render).find('.rate--lampa .rate-value');
                                let rateIcon = $(render).find('.rate--lampa .rate-icon');
                                if (result.rating !== null && result.rating > 0) {
                                    rateValue.text(result.rating);
                                    if (result.medianReaction) {
                                        let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                                        rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                                    }
                                } else {
                                    $(render).find('.rate--lampa').hide();
                                }
                            });
                        });
                    }
                }
            }
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') initPlugin();
        });
    }
})();
