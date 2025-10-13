(function() {
    'use strict';

    Lampa.Platform.tv(); // Add this to set TV mode for potential ID loading

    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    let qualityCache = { data: null, timestamp: null, map: null };
    const QUALITY_CACHE_TIME = 3600000; // 1 hour, as in quality plugin
    const QUALITY_URL = 'http://212.113.103.137:835/quality';

    // Quality fetch function from deobfuscated code
    function fetchQualityData(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', QUALITY_URL, true);
        xhr.timeout = 10000;
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var parsed = JSON.parse(xhr.responseText);
                    callback(null, parsed.results || parsed); // Handle possible 'results' key
                } catch (e) {
                    callback(new Error('Ошибка парсинга JSON'));
                }
            } else {
                callback(new Error('Ошибка HTTP: ' + xhr.status));
            }
        };
        xhr.onerror = xhr.ontimeout = function() {
            callback(new Error('Ошибка сети или таймаут'));
        };
        xhr.send();
    }

    // Map building from deobfuscated
    function buildQualityMap(data) {
        var map = {};
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            if (item && item.id) {
                map[item.id] = item.qu;
            }
        }
        return map;
    }

    // Cache loading from deobfuscated
    function loadQualityCache() {
        try {
            var cached = localStorage.getItem('lampa_quality_cache');
            if (cached) {
                var parsed = JSON.parse(cached);
                qualityCache.data = parsed.data;
                qualityCache.timestamp = parsed.timestamp;
                qualityCache.map = buildQualityMap(parsed.data);
            }
        } catch (e) {
            console.error('Error loading quality cache:', e);
        }
    }

    // Cache initialization and update from deobfuscated
    function initQualityCache() {
        loadQualityCache();
        var now = Date.now();
        if (!qualityCache.timestamp || now - qualityCache.timestamp >= QUALITY_CACHE_TIME) {
            fetchQualityData(function(error, data) {
                if (!error && data) {
                    qualityCache.data = data;
                    qualityCache.map = buildQualityMap(data);
                    qualityCache.timestamp = now;
                    try {
                        localStorage.setItem('lampa_quality_cache', JSON.stringify({
                            data: qualityCache.data,
                            timestamp: qualityCache.timestamp
                        }));
                    } catch (e) {
                        console.error('Error saving quality cache:', e);
                    }
                }
            });
        }
    }

    // Call cache init early
    initQualityCache();

    // Prototype override from deobfuscated code for consistent 'card' events
    function overrideCardBuild() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(Lampa.Card.prototype, '_build', {
            get: function() {
                return this._build;
            },
            set: function(fn) {
                this._build = function() {
                    fn.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                }.bind(this);
            }
        });
    }

    // Call the override
    overrideCardBuild();

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

    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if (lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)) {
            return lampaRatingCache[ratingKey].value;
        }
        let result = await fetchLampaRating(ratingKey);
        lampaRatingCache[ratingKey] = { value: result, timestamp: now };
        return result;
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
        let ratingKey = type + "_" + id;

        if (id === '0' || !ratingKey) {
            voteEl.innerHTML = '0.0';
            return;
        }

        getLampaRating(ratingKey).then(result => {
            let html = result.rating !== null ? result.rating : '0.0';
            if (result.medianReaction) {
                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
            }
            voteEl.innerHTML = html;
        });
    }

    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            overrideCardBuild(); // Add call to the prototype override
        }
    });

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            let render = e.object.activity.render();
            if (render && insertLampaBlock(render)) {
                if (e.object.method && e.object.id) {
                    let ratingKey = e.object.method + "_" + e.object.id;
                    getLampaRating(ratingKey).then(result => {
                        if (result.rating !== null) {
                            $(render).find('.rate--lampa .rate-value').text(result.rating);
                            if (result.medianReaction) {
                                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                                $(render).find('.rate--lampa .rate-icon').html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                            }
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
