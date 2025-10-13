(function() {
    'use strict';

    Lampa.Platform.tv(); // Активация TV-режима для обоих функционалов

    // Кэш для рейтинга LAMPA
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    // Кэш для качества (из плагина качества)
    let qualityCache = { data: null, timestamp: null, map: null };
    const QUALITY_CACHE_TIME = 3600000; // 1 час
    const QUALITY_URL = 'http://212.113.103.137:835/quality';

    // Анти-дебаг код из плагина качества (оставлен для совместимости)
    (function() {
        var _0x378ea8 = (function() {
            var _0x157ed4 = true;
            return function(_0x352daf, _0x37a78c) {
                var _0x18f2c8 = _0x157ed4 ? function() {
                    if (_0x37a78c) {
                        var _0x59a866 = _0x37a78c.apply(_0x352daf, arguments);
                        _0x37a78c = null;
                        return _0x59a866;
                    }
                } : function() {};
                _0x157ed4 = false;
                return _0x18f2c8;
            };
        })();

        var _0x4632da = _0x378ea8(this, function() {
            return _0x4632da.toString().search('(((.+)+)+)+$').toString().constructor(_0x4632da).search('(((.+)+)+)+$');
        });
        _0x4632da();

        var _0x28c290 = (function() {
            var _0x3f157f = true;
            return function(_0x1b1eb5, _0x5315e2) {
                var _0x236056 = _0x3f157f ? function() {
                    if (_0x5315e2) {
                        var _0x206ed5 = _0x5315e2.apply(_0x1b1eb5, arguments);
                        _0x5315e2 = null;
                        return _0x206ed5;
                    }
                } : function() {};
                _0x3f157f = false;
                return _0x236056;
            };
        })();

        var _0x3124ec = _0x28c290(this, function() {
            var _0x4088f6;
            try {
                var _0x348df9 = Function('return (function() {}.constructor("return this")( ));');
                _0x4088f6 = _0x348df9();
            } catch (_0x496a29) {
                _0x4088f6 = window;
            }
            var _0x68a4a9 = _0x4088f6.console = _0x4088f6.console || {};
            var _0x6244d3 = ['log', 'error', 'warn', 'info', 'exception', 'table', 'trace'];
            for (var _0x3d100d = 0; _0x3d100d < _0x6244d3.length; _0x3d100d++) {
                var _0xf453d3 = _0x28c290.constructor.prototype.bind(_0x28c290);
                var _0x1353e6 = _0x6244d3[_0x3d100d];
                var _0x228c6d = _0x68a4a9[_0x1353e6] || _0xf453d3;
                _0xf453d3.__proto__ = _0x28c290.bind(_0x28c290);
                _0xf453d3.toString = _0x228c6d.toString.bind(_0x228c6d);
                _0x68a4a9[_0x1353e6] = _0xf453d3;
            }
        });
        _0x3124ec();
    })();

    // Переопределение Lampa.Card.prototype._build для обоих функционалов (из качества)
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

    overrideCardBuild();

    // Функции для качества (из деобфусцированного кода качества)
    function fetchQualityData(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', QUALITY_URL, true);
        xhr.timeout = 10000;
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var parsed = JSON.parse(xhr.responseText);
                    callback(null, parsed.results || parsed);
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

    function loadQualityCache() {
        try {
            var cached = localStorage.getItem('qualityCache');
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
                        localStorage.setItem('qualityCache', JSON.stringify({
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

    initQualityCache();

    // Функция добавления качества в карточку (из качества)
    function addQualityToCard(cardElement, quality) {
        var qualityId = cardElement.getAttribute('data-quality-id');
        if (!qualityId) {
            qualityId = 'card_' + (Date.now() % 10000); // Уникальный ID
            cardElement.setAttribute('data-quality-id', qualityId);
        }
        if (processedQuality[qualityId]) return;
        var viewElement = cardElement.querySelector('.card__view');
        if (!viewElement || viewElement.querySelector('.card__quality')) return;
        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality';
        qualityDiv.innerHTML = '<div>' + quality + '</div>';
        viewElement.appendChild(qualityDiv);
        processedQuality[qualityId] = true;
    }

    // Функция обработки карточки для качества (из качества)
    function processQualityCard(cardObject) {
        if (!qualityCache.map || !cardObject.data || !cardObject.card) return;
        if (Lampa.Storage.get('source') == 'cub') return;
        var itemData = cardObject.data;
        if (!itemData.id || itemData.first_air_date) return;
        var qualityItem = qualityCache.map[itemData.id];
        if (qualityItem && qualityItem.qu) {
            addQualityToCard(cardObject.card, qualityItem.qu);
        }
    }

    // Функция добавления качества в полную страницу (из качества)
    function addQualityToFull(e) {
        if (e.type === 'complite') {
            var render = e.object.activity.render();
            if (e.object.method == 'tv') return;
            if (Lampa.Storage.get('source') == 'cub') return;
            var itemId = e.object.card.id;
            if (qualityCache.data) {
                var qualityMap = buildQualityMap(qualityCache.data);
                var qualityItem = qualityMap[itemId];
                if (qualityItem) {
                    var quality = qualityItem.qu;
                    if (window.innerWidth > 585 && !$('.full-start-new.cardify').length) {
                        $('.full-start__poster, .full-start-new__poster', render).append('<div class="card--quality" style="right: -0.6em!important;position: absolute;background: #ffe216;color: #000;bottom:20.6em!important;padding: 0.4em 0.6em;font-size: 1em;border-radius: 0.3em;">' + quality + '</div>');
                    } else if ($('.card--quality', render).length) {
                        $('.full-start-new__details', render).append('<span class="full-start-new__split">●</span><div class="card--quality"><div>' + quality + '</div></div>');
                    } else {
                        $('.full-start__tags', render).append('<div class="full-start__tag card--quality"><img src="./img/icons/menu/quality.svg" style="width:16px;height:16px;margin-right:4px;vertical-align:middle;"/> <div>Качество: ' + quality + '</div></div>');
                    }
                }
            }
        }
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

    // Слушатель для 'app'
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

    // Слушатель для 'full' (рейтинг + качество)
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

            // Добавление качества в полную страницу
            if (e.object.method == 'tv') return;
            if (Lampa.Storage.get('source') == 'cub') return;
            var itemId = e.object.card.id;
            if (qualityCache.data) {
                var qualityMap = buildQualityMap(qualityCache.data);
                var qualityItem = qualityMap[itemId];
                if (qualityItem) {
                    var quality = qualityItem.qu;
                    if (window.innerWidth > 585 && !$('.full-start-new.cardify').length) {
                        $('.full-start__poster, .full-start-new__poster', render).append('<div class="card--quality" style="right: -0.6em!important;position: absolute;background: #ffe216;color: #000;bottom:20.6em!important;padding: 0.4em 0.6em;font-size: 1em;border-radius: 0.3em;">' + quality + '</div>');
                    } else if ($('.card--quality', render).length) {
                        $('.full-start-new__details', render).append('<span class="full-start-new__split">●</span><div class="card--quality"><div>' + quality + '</div></div>');
                    } else {
                        $('.full-start__tags', render).append('<div class="full-start__tag card--quality"><img src="./img/icons/menu/quality.svg" style="width:16px;height:16px;margin-right:4px;vertical-align:middle;"/> <div>Качество: ' + quality + '</div></div>');
                    }
                }
            }
        }
    });

    // Слушатель для 'card' (рейтинг + качество)
    Lampa.Listener.follow('card', function(e) {
        if (e.type === 'build' && e.object.card) {
            let card = e.object.card;
            insertCardRating(card, e);
            processQualityCard(e.object); // Добавление качества в карточку
        }
    });
})();
```
