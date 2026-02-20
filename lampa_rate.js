(function () {
    'use strict';

    const ANIMATED_REACTIONS_BASE_URL = 'https://amikdn.github.io/img';
    const SVG_REACTIONS_BASE_URL = 'https://cubnotrip.top/img/reactions';

    function getReactionImageSrc(medianReaction) {
        if (!medianReaction) return '';
        const useAnimated = Lampa.Storage.get('animated_reactions_on_posters', false);
        if (useAnimated) {
            return ANIMATED_REACTIONS_BASE_URL + '/reaction-' + medianReaction + '.gif';
        }
        return SVG_REACTIONS_BASE_URL + '/' + medianReaction + '.svg';
    }

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
            if (value.rating === 0 || value.rating === '0.0') return value;
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

    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        let lampaBlockHtml = '<div class="full-start__rate rate--lampa">' +
            '<div class="rate-value">0.0</div>' +
            '<div class="rate-icon"></div>' +
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
            voteEl.className = 'card__vote rate--lampa';
            voteEl.style.cssText = `
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
            parent.appendChild(voteEl);
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
        voteEl.dataset.movieId = id.toString();
        const cached = ratingCache.get('lampa_rating', ratingKey);
        if (cached && cached.rating !== 0 && cached.rating !== '0.0') {
            let html = cached.rating;
            if (cached.medianReaction) {
                const reactionSrc = getReactionImageSrc(cached.medianReaction);
                html += ` <img style="width:1em;height:1em;margin:0 0.2em;" src="${reactionSrc}">`;
            }
            voteEl.innerHTML = html;
            return;
        }
        addToQueue(() => {
            getLampaRating(ratingKey).then(result => {
                if (voteEl.parentNode && voteEl.dataset.movieId === id.toString()) {
                    let html = result.rating !== null ? result.rating : '0.0';
                    if (result.medianReaction) {
                        const reactionSrc = getReactionImageSrc(result.medianReaction);
                        html += ` <img style="width:1em;height:1em;margin:0 0.2em;" src="${reactionSrc}">`;
                    }
                    voteEl.innerHTML = html;
                    if (result.rating === 0 || result.rating === '0.0') {
                        voteEl.style.display = 'none';
                    }
                }
            });
        });
    }

    function pollCards() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            const data = card.card_data;
            if (data && data.id) {
                const ratingElement = card.querySelector('.card__vote');
                if (!ratingElement || ratingElement.dataset.movieId !== data.id.toString()) {
                    insertCardRating(card, { object: { data } });
                } else {
                    const ratingKey = (data.seasons || data.first_air_date || data.original_name) ? `tv_${data.id}` : `movie_${data.id}`;
                    const cached = ratingCache.get('lampa_rating', ratingKey);
                    if (cached && cached.rating !== 0 && cached.rating !== '0.0' && ratingElement.innerHTML === '') {
                        let html = cached.rating;
                        if (cached.medianReaction) {
                            const reactionSrc = getReactionImageSrc(cached.medianReaction);
                            html += ` <img style="width:1em;height:1em;margin:0 0.2em;" src="${reactionSrc}">`;
                        }
                        ratingElement.innerHTML = html;
                    }
                }
            }
        });
        setTimeout(pollCards, 500);
    }

    function refreshReactionIconsOnCards() {
        document.querySelectorAll('.card').forEach(function (card) {
            const voteEl = card.querySelector('.card__vote');
            if (!voteEl || !voteEl.dataset.movieId) return;
            const data = card.card_data || card.dataset || {};
            const id = (data.id || card.getAttribute('data-id') || '0').toString().replace('movie_', '');
            const type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            const ratingKey = type + '_' + id;
            const cached = ratingCache.get('lampa_rating', ratingKey);
            if (!cached || !cached.medianReaction || (cached.rating === 0 || cached.rating === '0.0')) return;
            const reactionSrc = getReactionImageSrc(cached.medianReaction);
            const html = cached.rating + ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
            voteEl.innerHTML = html;
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
            .card__vote img {
                object-fit: contain;
                flex-shrink: 0;
                min-width: 1.25em;
                min-height: 1.25em;
            }
            .card__vote img[src*=".gif"] {
                margin-left: 0.4em;
            }
            @media (max-width: 768px) {
                .card__vote img {
                    min-width: 20px;
                    min-height: 20px;
                }
            }
            .rate--lampa.rate--lampa--animated .rate-icon {
                margin-right: 0.5em;
                min-width: 1.5em;
            }
            .rate--lampa.rate--lampa--animated .rate-icon img {
                min-width: 1.25em;
                min-height: 1.25em;
                object-fit: contain;
            }
        `;
        document.head.appendChild(style);
        setupCardListener();
        pollCards();
        Lampa.Listener.follow('card', (e) => {
            if (e.type === 'build' && e.object.card) {
                insertCardRating(e.object.card, e);
            }
        });

        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'animated_reactions_on_posters', type: 'trigger', default: false },
                field: { name: 'Анимированные реакции на постерах' },
                onChange: function () {
                    setTimeout(refreshReactionIconsOnCards, 100);
                },
                onRender: function (element) {
                    setTimeout(function () {
                        const anchor = $('div[data-name="interface_size"]');
                        if (anchor.length) anchor.after(element);
                    }, 0);
                }
            });
        }

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                let render = e.object.activity.render();
                if (render && insertLampaBlock(render)) {
                    if (e.object.method && e.object.id) {
                        let ratingKey = e.object.method + "_" + e.object.id;
                        const cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating !== 0 && cached.rating !== '0.0') {
                            let rateValue = $(render).find('.rate--lampa .rate-value');
                            let rateIcon = $(render).find('.rate--lampa .rate-icon');
                            rateValue.text(cached.rating);
                            if (cached.medianReaction) {
                                const reactionSrc = getReactionImageSrc(cached.medianReaction);
                                rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                                if (Lampa.Storage.get('animated_reactions_on_posters', false)) {
                                    $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                                }
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
                                        const reactionSrc = getReactionImageSrc(result.medianReaction);
                                        rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                                        if (Lampa.Storage.get('animated_reactions_on_posters', false)) {
                                            $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                                        }
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
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
