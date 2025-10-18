(function () {
    'use strict';

    // Инициализация платформы Lampa для телевизионной версии
    Lampa.Platform.tv();

    // Проверка, не инициализирован ли плагин ранее
    if (window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;

    // Объект для кэширования рейтингов
    const ratingCache = {
        caches: {},
        get(source, key) {
            const cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            const data = cache[key];
            if (!data) return null;
            // Проверка устаревания данных (18 часов)
            if (Date.now() - data.timestamp > 18 * 60 * 60 * 1000) {
                delete cache[key];
                Lampa.Storage.set(source, cache);
                return null;
            }
            return data;
        },
        set(source, key, value) {
            if (value.kp === 0 && value.imdb === 0 || value.rating === '0.0') return value;
            const cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            value.timestamp = Date.now();
            cache[key] = value;
            Lampa.Storage.set(source, cache);
            return value;
        }
    };

    // Кэш для рейтинга Lampa (24 часа)
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    // Расчёт рейтинга Lampa (0-10)
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

    // Получение рейтинга Lampa через API
    function fetchLampaRating(ratingKey) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            let url = "https://cubnotrip.top/api/reactions/get/" + ratingKey;
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
                                resolve({ rating: 0, medianReaction: '' });
                            }
                        } catch {
                            resolve({ rating: 0, medianReaction: '' });
                        }
                    } else {
                        resolve({ rating: 0, medianReaction: '' });
                    }
                }
            };
            xhr.onerror = function() { resolve({ rating: 0, medianReaction: '' }); };
            xhr.ontimeout = function() { resolve({ rating: 0, medianReaction: '' }); };
            xhr.send();
        });
    }

    // Получение кэшированного рейтинга Lampa
    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if (lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)) {
            return lampaRatingCache[ratingKey].value;
        }
        let result = await fetchLampaRating(ratingKey);
        lampaRatingCache[ratingKey] = { value: result, timestamp: now };
        return result;
    }

    // Очередь для асинхронных задач
    let taskQueue = [];
    let isProcessing = false;
    const taskInterval = 300;

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

    // Пул запросов
    let requestPool = [];
    function getRequest() {
        return requestPool.pop() || new Lampa.Reguest();
    }

    function releaseRequest(request) {
        request.clear();
        if (requestPool.length < 3) requestPool.push(request);
    }

    // Нормализация строк для сравнения
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

    // Очистка строки от лишних пробелов и символов
    function cleanString(str) {
        return normalizeString(str)
            .replace(/^[ \/\\]+/, '')
            .replace(/[ \/\\]+$/, '')
            .replace(/\+( *[+\/\\])+/g, '+')
            .replace(/([+\/\\] *)+\+/g, '+')
            .replace(/( *[\/\\]+ *)+/g, '+');
    }

    // Сравнение строк на точное совпадение
    function matchStrings(str1, str2) {
        return typeof str1 === 'string' && typeof str2 === 'string' && normalizeString(str1) === normalizeString(str2);
    }

    // Проверка, содержит ли одна строка другую
    function containsString(str1, str2) {
        return typeof str1 === 'string' && typeof str2 === 'string' && normalizeString(str1).indexOf(normalizeString(str2)) !== -1;
    }

    // Получение рейтинга с Kinopoisk
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

    // Обработка карточек контента
    let pendingCards = [];
    let cardTimer = null;

    function processCards() {
        if (cardTimer) return;
        cardTimer = setTimeout(() => {
            const cards = pendingCards.splice(0);
            cards.forEach(card => updateCardRating(card));
            cardTimer = null;
        }, 16);
    }

    function addCard(card) {
        pendingCards.push(card);
        processCards();
    }

    // Создание элемента для отображения рейтинга
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
            font-size: 1.3em;
            font-weight: 700;
            padding: 0.2em 0.5em;
            border-radius: 1em;
        `;
        const parent = card.querySelector('.card__view') || card;
        parent.appendChild(ratingElement);
        return ratingElement;
    }

    // Обновление рейтинга на карточке
    function updateCardRating(item) {
        const card = item.card || item;
        if (!card || !card.querySelector) return;

        const data = card.card_data || item.data || {};
        if (!data.id) return;

        const source = Lampa.Storage.get('rating_source', 'tmdb');
        let ratingElement = card.querySelector('.card__vote');
        if (!ratingElement) ratingElement = createRatingElement(card);

        if (ratingElement.dataset && ratingElement.dataset.source === source && ratingElement.dataset.movieId === data.id.toString()) return;

        ratingElement.dataset.source = source;
        ratingElement.dataset.movieId = data.id.toString();
        ratingElement.className = `card__vote rate--${source}`;
        ratingElement.innerHTML = '';
        ratingElement.style.display = '';

        let label = '';
        if (source === 'tmdb') label = 'TMDB';
        else if (source === 'lampa') label = 'LAMPA';
        else if (source === 'kp') label = 'KP';
        else if (source === 'imdb') label = 'IMDB';

        if (source === 'tmdb') {
            const rating = data.vote_average ? data.vote_average.toFixed(1) : '0.0';
            if (rating !== '0.0') {
                ratingElement.innerHTML = `${rating} ${label}`;
            } else {
                ratingElement.style.display = 'none';
            }
        } else if (source === 'lampa') {
            let type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            let ratingKey = `${type}_${data.id}`;
            getLampaRating(ratingKey).then(result => {
                if (ratingElement.dataset && ratingElement.dataset.movieId === data.id.toString()) {
                    if (result.rating > 0) {
                        let html = `${result.rating} ${label}`;
                        if (result.medianReaction) {
                            let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                            html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
                        }
                        ratingElement.innerHTML = html;
                    } else {
                        ratingElement.style.display = 'none';
                    }
                }
            });
        } else if (source === 'kp' || source === 'imdb') {
            getKinopoiskRating(data, (rating) => {
                if (ratingElement.dataset && ratingElement.dataset.movieId === data.id.toString()) {
                    if (rating !== '0.0') {
                        ratingElement.innerHTML = `${rating} ${label}`;
                    } else {
                        ratingElement.style.display = 'none';
                    }
                }
            });
        }
    }

    // Добавление настроек в интерфейс
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
                const ratingElements = document.querySelectorAll('.card__vote');
                for (let i = 0; i < ratingElements.length; i++) {
                    const element = ratingElements[i];
                    const card = findParentWithClass(element, 'card');
                    if (card) {
                        delete element.dataset.source;
                        delete element.dataset.movieId;
                        addCard({ card, data: card.card_data });
                    }
                }
            }
        });
    }

    // Поиск родительского элемента с указанным классом
    function findParentWithClass(element, className) {
        let current = element.parentElement;
        while (current) {
            if (current.classList && current.classList.contains(className)) return current;
            current = current.parentElement;
        }
        return null;
    }

    // Добавление слушателя событий для карточек
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

    // Добавление CSS-стилей
    function addStyles() {
        const style = document.createElement('style');
        style.type = 'text/css';
        const css = `
            .card__vote {
                display: inline-flex !important;
                align-items: center !important;
                flex-shrink: 0;
            }
            .card__vote img {
                width: 1em;
                height: 1em;
                margin: 0 0.2em;
            }
        `;
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
    }

    // Инициализация плагина
    function initPlugin() {
        addSettings();
        setupCardListener();
        addStyles();
        Lampa.Listener.follow('card', (event) => {
            if (event.type === 'build' && event.object.card) {
                addCard(event.object);
            }
        });
    }

    // Запуск плагина при готовности приложения
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') initPlugin();
        });
    }
})();
