(function () {
    'use strict';

    var ANIMATED_REACTIONS_BASE_URL = 'https://amikdn.github.io/img';
    var SVG_REACTIONS_BASE_URL = 'https://cubnotrip.top/img/reactions';

    function getReactionImageSrc(medianReaction) {
        if (!medianReaction) return '';
        var useAnimated = Lampa.Storage.get('animated_reactions_on_posters', false);
        if (useAnimated) {
            return ANIMATED_REACTIONS_BASE_URL + '/reaction-' + medianReaction + '.gif';
        }
        return SVG_REACTIONS_BASE_URL + '/' + medianReaction + '.svg';
    }

    var ratingCache = {
        caches: {},
        get: function (source, key) {
            var cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            var data = cache[key];
            if (!data) return null;
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                delete cache[key];
                Lampa.Storage.set(source, cache);
                return null;
            }
            return data;
        },
        set: function (source, key, value) {
            if (value.rating === 0 || value.rating === '0.0') return value;
            var cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            value.timestamp = Date.now();
            cache[key] = value;
            Lampa.Storage.set(source, cache);
            return value;
        }
    };

    var CACHE_TIME = 24 * 60 * 60 * 1000;
    var taskQueue = [];
    var isProcessing = false;
    var taskInterval = 300;

    var requestPool = [];
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
        var task = taskQueue.shift();
        task.execute();
        setTimeout(function () {
            isProcessing = false;
            processQueue();
        }, taskInterval);
    }
    function addToQueue(task) {
        taskQueue.push({ execute: task });
        processQueue();
    }

    function calculateLampaRating10(reactions) {
        var weightedSum = 0;
        var totalCount = 0;
        var reactionCnt = {};
        var reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };
        reactions.forEach(function (item) {
            var count = parseInt(item.counter, 10) || 0;
            var coef = reactionCoef[item.type] || 0;
            weightedSum += count * coef;
            totalCount += count;
            reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
        });
        if (totalCount === 0) return { rating: 0, medianReaction: '' };
        var avgRating = weightedSum / totalCount;
        var rating10 = (avgRating - 1) * 2.5;
        var finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
        var medianReaction = '';
        var medianIndex = Math.ceil(totalCount / 2.0);
        var sortedReactions = Object.keys(reactionCoef).map(function (k) { return k; }).sort(function (a, b) { return reactionCoef[a] - reactionCoef[b]; });
        var cumulativeCount = 0;
        while (sortedReactions.length && cumulativeCount < medianIndex) {
            medianReaction = sortedReactions.pop();
            cumulativeCount += (reactionCnt[medianReaction] || 0);
        }
        return { rating: finalRating, medianReaction: medianReaction };
    }

    function fetchLampaRating(ratingKey) {
        return new Promise(function (resolve) {
            var request = getRequest();
            var url = "https://cubnotrip.top/api/reactions/get/" + ratingKey;
            request.timeout(10000);
            request.silent(url, function (data) {
                try {
                    if (data && data.result && Array.isArray(data.result)) {
                        var result = calculateLampaRating10(data.result);
                        resolve(result);
                    } else {
                        resolve({ rating: 0, medianReaction: '' });
                    }
                } catch (e) {
                    resolve({ rating: 0, medianReaction: '' });
                } finally {
                    releaseRequest(request);
                }
            }, function () {
                releaseRequest(request);
                resolve({ rating: 0, medianReaction: '' });
            }, false);
        });
    }

    function getLampaRating(ratingKey) {
        var cached = ratingCache.get('lampa_rating', ratingKey);
        if (cached) return Promise.resolve(cached);
        return fetchLampaRating(ratingKey).then(function (result) {
            return ratingCache.set('lampa_rating', ratingKey, result);
        }).catch(function () {
            return { rating: 0, medianReaction: '' };
        });
    }

    function insertLampaBlock(render) {
        if (!render) return false;
        var rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        var lampaBlockHtml = '<div class="full-start__rate rate--lampa">' +
            '<div class="rate-value">0.0</div>' +
            '<div class="rate-icon"></div>' +
            '<div class="source--name">LAMPA</div>' +
            '</div>';
        var kpBlock = rateLine.find('.rate--kp');
        if (kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        return true;
    }

    function insertCardRating(card, event) {
        var voteEl = card.querySelector('.card__vote');
        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote rate--lampa';
            voteEl.style.cssText = 'line-height:1;font-family:"SegoeUI",sans-serif;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;right:0.3em;bottom:0.3em;background:rgba(0,0,0,0.5);color:#fff;padding:0.2em 0.5em;border-radius:1em;display:flex;align-items:center;';
            var parent = card.querySelector('.card__view') || card;
            parent.appendChild(voteEl);
            voteEl.innerHTML = '0.0';
        } else {
            voteEl.innerHTML = '';
        }
        var data = card.dataset || {};
        var cardData = event.object.data || {};
        var id = (cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0').toString();
        var type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        var ratingKey = type + "_" + id;
        voteEl.dataset.movieId = id;
        var cached = ratingCache.get('lampa_rating', ratingKey);
        if (cached && cached.rating !== 0 && cached.rating !== '0.0') {
            var html = cached.rating;
            if (cached.medianReaction) {
                var reactionSrc = getReactionImageSrc(cached.medianReaction);
                html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
            }
            voteEl.innerHTML = html;
            return;
        }
        addToQueue(function () {
            getLampaRating(ratingKey).then(function (result) {
                if (voteEl.parentNode && voteEl.dataset.movieId === id) {
                    var html = result.rating !== null ? result.rating : '0.0';
                    if (result.medianReaction) {
                        var reactionSrc = getReactionImageSrc(result.medianReaction);
                        html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
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
        var allCards = document.querySelectorAll('.card');
        allCards.forEach(function (card) {
            var data = card.card_data;
            if (data && data.id) {
                var ratingElement = card.querySelector('.card__vote');
                if (!ratingElement || ratingElement.dataset.movieId !== data.id.toString()) {
                    insertCardRating(card, { object: { data: data } });
                } else {
                    var ratingKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                    var cached = ratingCache.get('lampa_rating', ratingKey);
                    if (cached && cached.rating !== 0 && cached.rating !== '0.0' && ratingElement.innerHTML === '') {
                        var html = cached.rating;
                        if (cached.medianReaction) {
                            var reactionSrc = getReactionImageSrc(cached.medianReaction);
                            html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
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
            var voteEl = card.querySelector('.card__vote');
            if (!voteEl || !voteEl.dataset.movieId) return;
            var data = card.card_data || card.dataset || {};
            var id = (data.id || card.getAttribute('data-id') || '0').toString().replace('movie_', '');
            var type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            var ratingKey = type + '_' + id;
            var cached = ratingCache.get('lampa_rating', ratingKey);
            if (!cached || !cached.medianReaction || (cached.rating === 0 || cached.rating === '0.0')) return;
            var reactionSrc = getReactionImageSrc(cached.medianReaction);
            var html = cached.rating + ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
            voteEl.innerHTML = html;
        });
    }

    function setupCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Card.prototype, 'build', {
            get: function () { return this._build; },
            set: function (func) {
                var self = this;
                this._build = function () {
                    func.apply(self);
                    Lampa.Listener.send('card', { type: 'build', object: self });
                };
            }
        });
    }

    function initPlugin() {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = `
            .card__vote {
                display: flex;
                align-items: center !important;
            }
            .card__vote img {
                object-fit: contain;
                flex-shrink: 0;
            }
            .card__vote img[src*=".gif"] {
                margin-left: 0.4em;
                min-width: 1.25em;
                min-height: 1.25em;
            }
            @media (max-width: 768px) {
                .card__vote img[src*=".gif"] {
                    min-width: 20px;
                    min-height: 20px;
                }
            }
            .rate--lampa .rate-icon {
                min-width: 1em;
            }
            .rate--lampa.rate--lampa--animated .rate-icon {
                margin-right: 0;
                min-width: 1em;
            }
            .rate--lampa.rate--lampa--animated .rate-icon img {
                min-width: 1em;
                min-height: 1em;
                object-fit: contain;
            }
            @media (max-width: 768px) and (orientation: landscape) {
                .rate--lampa .rate-icon {
                    min-width: 1.1em;
                }
                .rate--lampa.rate--lampa--animated .rate-icon {
                    margin-right: 0.05em;
                    min-width: 1.1em;
                }
                .rate--lampa.rate--lampa--animated .rate-icon img {
                    min-width: 1.1em;
                    min-height: 1.1em;
                }
            }
        `;
        document.head.appendChild(style);
        setupCardListener();
        pollCards();
        Lampa.Listener.follow('card', function (e) {
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
                    setTimeout(function () {
                        var useAnimated = Lampa.Storage.get('animated_reactions_on_posters', false);
                        if (!useAnimated) {
                            $('.rate--lampa').removeClass('rate--lampa--animated');
                            $('.rate--lampa .rate-icon img[data-reaction-type]').each(function () {
                                var type = this.getAttribute('data-reaction-type');
                                if (type) this.src = SVG_REACTIONS_BASE_URL + '/' + type + '.svg';
                            });
                        } else {
                            $('.rate--lampa .rate-icon img[data-reaction-type]').each(function () {
                                var type = this.getAttribute('data-reaction-type');
                                if (type) this.src = ANIMATED_REACTIONS_BASE_URL + '/reaction-' + type + '.gif';
                            });
                            $('.rate--lampa').addClass('rate--lampa--animated');
                        }
                        refreshReactionIconsOnCards();
                    }, 100);
                },
                onRender: function (element) {
                    setTimeout(function () {
                        var anchor = $('div[data-name="interface_size"]');
                        if (anchor.length) anchor.after(element);
                    }, 0);
                }
            });
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                if (render && insertLampaBlock(render)) {
                    if (e.object.method && e.object.id) {
                        var ratingKey = e.object.method + "_" + e.object.id;
                        var cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating !== 0 && cached.rating !== '0.0') {
                            var rateValue = $(render).find('.rate--lampa .rate-value');
                            var rateIcon = $(render).find('.rate--lampa .rate-icon');
                            rateValue.text(cached.rating);
                            if (cached.medianReaction) {
                                var reactionSrc = getReactionImageSrc(cached.medianReaction);
                                rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" data-reaction-type="' + cached.medianReaction + '" src="' + reactionSrc + '">');
                                if (Lampa.Storage.get('animated_reactions_on_posters', false)) {
                                    $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                                }
                            }
                            return;
                        }
                        addToQueue(function () {
                            getLampaRating(ratingKey).then(function (result) {
                                var rateValue = $(render).find('.rate--lampa .rate-value');
                                var rateIcon = $(render).find('.rate--lampa .rate-icon');
                                if (result.rating !== null && result.rating > 0) {
                                    rateValue.text(result.rating);
                                    if (result.medianReaction) {
                                        var reactionSrc = getReactionImageSrc(result.medianReaction);
                                        rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" data-reaction-type="' + result.medianReaction + '" src="' + reactionSrc + '">');
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
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
