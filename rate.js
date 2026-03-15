(function () {
    'use strict';

    Lampa.Platform.tv();

    var ANIMATED_REACTIONS_BASE_URL = 'https://amikdn.github.io/img';
    var SVG_REACTIONS_BASE_URL = 'https://cubnotrip.top/img/reactions';

    function isTriggerOn(key, def) {
        var v = Lampa.Storage.get(key, def);
        return (v === true || v === 'true' || v === '1' || v === 1);
    }
    function isColoredRatingsPosterOn() {
        return isTriggerOn('colored_ratings_poster', true);
    }
    function setColoredRatingsPoster(on) {
        Lampa.Storage.set('colored_ratings_poster', on ? 'true' : 'false');
    }
    function getRatingColor(value) {
        if (isTriggerOn('rating_colored_windows', false)) return '#fff';
        if (!isColoredRatingsPosterOn()) return '#fff';
        var v = parseFloat(String(value).replace(',', '.'));
        if (isNaN(v) || v <= 0) return '#fff';
        if (v <= 3) return 'red';
        if (v < 6) return 'orange';
        if (v < 8) return 'cornflowerblue';
        return 'lawngreen';
    }

    function getRatingBackgroundColor(value) {
        if (!isTriggerOn('rating_colored_windows', false)) return '';
        var alpha = getRatingBackgroundAlpha();
        var v = parseFloat(String(value).replace(',', '.'));
        if (isNaN(v) || v <= 0) return 'rgba(0,0,0,' + alpha + ')';
        if (v <= 3) return 'rgba(180,0,0,' + alpha + ')';
        if (v < 6) return 'rgba(200,120,0,' + alpha + ')';
        if (v < 8) return 'rgba(70,130,180,' + alpha + ')';
        return 'rgba(80,180,0,' + alpha + ')';
    }

    function formatRating(value) {
        var n = parseFloat(value);
        if (isNaN(n)) return '0.0';
        if (n === 10) return '10';
        return n.toFixed(1);
    }

    function getReactionImageSrc(medianReaction) {
        if (!medianReaction) return '';
        if (isTriggerOn('animated_reactions', false)) {
            return ANIMATED_REACTIONS_BASE_URL + '/reaction-' + medianReaction + '.gif';
        }
        return SVG_REACTIONS_BASE_URL + '/' + medianReaction + '.svg';
    }

    var CACHE_TTL = 24 * 60 * 60 * 1000;

    var _savePending = {};
    function debouncedSave(source, cache) {
        if (_savePending[source]) return;
        _savePending[source] = true;
        setTimeout(function () {
            _savePending[source] = false;
            try { Lampa.Storage.set(source, cache); } catch (e) {}
        }, 2000);
    }

    var ratingCache = {
        caches: {},
        get: function (source, key) {
            var cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            var data = cache[key];
            if (!data) return null;
            if (Date.now() - data.timestamp > CACHE_TTL) {
                delete cache[key];
                debouncedSave(source, cache);
                return null;
            }
            return data;
        },
        set: function (source, key, value) {
            if (source === 'lampa_rating' && (value.rating === 0 || value.rating === '0.0')) {
                var cache = this.caches[source];
                if (cache && cache[key]) {
                    delete cache[key];
                    debouncedSave(source, cache);
                }
                return value;
            }
            var cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            value.timestamp = Date.now();
            var isEmpty = ((!value.kp || value.kp === 0) && (!value.imdb || value.imdb === 0) && (!value.rating || value.rating === 0) && (!value.vote_average || value.vote_average === 0));
            if (isEmpty) value._empty = true;
            cache[key] = value;
            debouncedSave(source, cache);
            return value;
        }
    };

    var taskQueue = [];
    var isProcessing = false;
    var taskInterval = 350;
    var taskBatchSize = 1;
    var requestPool = [];
    function getRequest() {
        return requestPool.pop() || new Lampa.Reguest();
    }

    function releaseRequest(request) {
        request.clear();
        if (requestPool.length < 5) requestPool.push(request);
    }

    function processQueue() {
        if (isProcessing || !taskQueue.length) return;
        isProcessing = true;
        var batch = taskQueue.splice(0, taskBatchSize);
        for (var i = 0; i < batch.length; i++) { batch[i].execute(); }
        setTimeout(function () {
            isProcessing = false;
            processQueue();
        }, taskInterval);
    }

    function addToQueue(task) {
        if (taskQueue.length > 20) taskQueue.splice(10);
        taskQueue.push({ execute: task });
        processQueue();
    }

    var stringCache = {};
    function normalizeString(str) {
        if (stringCache[str]) return stringCache[str];
        var normalized = str
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

    var KP_API_URL = 'https://kinopoiskapiunofficial.tech/';
    var KP_DEFAULT_KEY = '2a4a0808-81a3-40ae-b0d3-e11335ede616';
    function getKpApiKey() {
        return Lampa.Storage.get('rating_kp_api_key', '') || Lampa.Storage.get('source_api_key', '') || KP_DEFAULT_KEY;
    }
    // KP_API_HEADERS removed, use getKpHeaders()
    function getKpHeaders() {
        return { 'X-API-KEY': getKpApiKey() };
    }

    function findBestKpMatch(results, title, originalTitle, releaseYear) {
        if (!results || !results.length) return null;
        results.forEach(function (r) {
            r.tmp_year = parseInt(String(r.year || r.start_date || "0000").slice(0, 4));
        });
        var filtered = results;
        if (originalTitle) {
            var matched = results.filter(function (r) {
                return containsString(r.orig_title || r.nameEn, originalTitle) ||
                    containsString(r.en_title || r.nameOriginal, originalTitle) ||
                    containsString(r.title || r.nameRu || r.name, originalTitle);
            });
            if (matched.length) filtered = matched;
        }
        if (filtered.length > 1 && releaseYear) {
            var yearMatch = filtered.filter(function (r) { return r.tmp_year == releaseYear; });
            if (!yearMatch.length) {
                yearMatch = filtered.filter(function (r) { return r.tmp_year && r.tmp_year > releaseYear - 2 && r.tmp_year < releaseYear + 2; });
            }
            if (yearMatch.length) filtered = yearMatch;
        }
        return filtered[0] || null;
    }

    function getKinopoiskRating(item, callback) {
        var cached = ratingCache.get('kp_rating', item.id);
        if (cached) {
            callback(cached);
            return;
        }
        if (item.kp_rating > 0 || item.imdb_rating > 0) {
            var result = ratingCache.set('kp_rating', item.id, {
                kp: parseFloat(item.kp_rating) || 0,
                imdb: parseFloat(item.imdb_rating) || 0,
                timestamp: Date.now()
            });
            callback(result);
            return;
        }
        try {
            var otherCache = Lampa.Storage.cache('kp_rating', 500, {});
            var otherData = otherCache[item.id];
            if (otherData && (otherData.kp > 0 || otherData.imdb > 0)) {
                var result = ratingCache.set('kp_rating', item.id, {
                    kp: parseFloat(otherData.kp) || 0,
                    imdb: parseFloat(otherData.imdb) || 0,
                    timestamp: Date.now()
                });
                callback(result);
                return;
            }
        } catch (e) {}
        if (item.kinopoisk_id) {
            addToQueue(function () {
                var request = getRequest();
                request.timeout(5000);
                request.silent(KP_API_URL + 'api/v2.2/films/' + item.kinopoisk_id, function (data) {
                    var res = ratingCache.set('kp_rating', item.id, {
                        kp: parseFloat(data.ratingKinopoisk) || 0,
                        imdb: parseFloat(data.ratingImdb) || 0,
                        timestamp: Date.now()
                    });
                    releaseRequest(request);
                    callback(res);
                }, function () {
                    releaseRequest(request);
                    callback({ kp: 0, imdb: 0 });
                }, false, { headers: getKpHeaders() });
            });
            return;
        }
        if (!(item.title || item.name) && !item.imdb_id) {
            callback({ kp: 0, imdb: 0 });
            return;
        }
        addToQueue(function () {
            var request = getRequest();
            var title = cleanString(item.title || item.name || '');
            var releaseYear = parseInt(String(item.release_date || item.first_air_date || item.last_air_date || "0000").slice(0, 4));
            var originalTitle = item.original_title || item.original_name;

            var searchUrl;
            if (item.imdb_id) {
                searchUrl = KP_API_URL + 'api/v2.2/films?imdbId=' + encodeURIComponent(item.imdb_id);
            } else {
                searchUrl = KP_API_URL + 'api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(title);
            }

            request.timeout(5000);
            request.silent(searchUrl, function (data) {
                var results = data.films || data.items || [];
                if (!results.length && data && (data.kinopoiskId || data.filmId)) {
                    results = [data];
                }
                var best = findBestKpMatch(results, title, originalTitle, releaseYear);
                if (!best) {
                    releaseRequest(request);
                    callback({ kp: 0, imdb: 0 });
                    return;
                }

                var kpFromSearch = parseFloat(best.rating || best.ratingKinopoisk) || 0;
                var imdbFromSearch = parseFloat(best.ratingImdb) || 0;
                var movieId = best.kinopoiskId || best.filmId || best.kp_id || best.kinopoisk_id;

                if (kpFromSearch > 0) {
                    ratingCache.set('kp_rating', item.id, {
                        kp: kpFromSearch,
                        imdb: imdbFromSearch,
                        timestamp: Date.now()
                    });
                }

                if (movieId && (kpFromSearch === 0 || imdbFromSearch === 0)) {
                    if (kpFromSearch > 0) callback({ kp: kpFromSearch, imdb: imdbFromSearch });
                    request.timeout(5000);
                    request.silent(KP_API_URL + 'api/v2.2/films/' + movieId, function (detail) {
                        var fullKp = parseFloat(detail.ratingKinopoisk) || 0;
                        var fullImdb = parseFloat(detail.ratingImdb) || 0;
                        var res = ratingCache.set('kp_rating', item.id, {
                            kp: fullKp > 0 ? fullKp : kpFromSearch,
                            imdb: fullImdb > 0 ? fullImdb : imdbFromSearch,
                            timestamp: Date.now()
                        });
                        releaseRequest(request);
                        callback(res);
                    }, function () {
                        releaseRequest(request);
                        callback({ kp: kpFromSearch, imdb: imdbFromSearch });
                    }, false, { headers: getKpHeaders() });
                } else {
                    releaseRequest(request);
                    callback({ kp: kpFromSearch, imdb: imdbFromSearch });
                }
            }, function () {
                releaseRequest(request);
                callback({ kp: 0, imdb: 0 });
            }, false, { headers: getKpHeaders() });
        });
    }

    function calculateLampaRating10(reactions) {
        var weightedSum = 0;
        var totalCount = 0;
        var reactionCnt = {};
        var reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };
        for (var i = 0; i < reactions.length; i++) {
            var item = reactions[i];
            var count = parseInt(item.counter, 10) || 0;
            var coef = reactionCoef[item.type] || 0;
            weightedSum += count * coef;
            totalCount += count;
            reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
        }
        if (totalCount === 0) return { rating: 0, medianReaction: '' };
        var avgRating = weightedSum / totalCount;
        var rating10 = (avgRating - 1) * 2.5;
        var finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
        var medianReaction = '';
        var medianIndex = Math.ceil(totalCount / 2.0);
        var keys = Object.keys(reactionCoef);
        var sortedReactions = keys.sort(function (a, b) { return reactionCoef[a] - reactionCoef[b]; });
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

    function getTMDBRating(data) {
        var ratingKey = data.id;
        var cached = ratingCache.get('tmdb_rating', ratingKey);
        if (cached) return cached.vote_average.toFixed(1);
        var rating = data.vote_average ? data.vote_average.toFixed(1) : '0.0';
        ratingCache.set('tmdb_rating', ratingKey, { vote_average: parseFloat(rating) });
        return rating;
    }

    function getRatingOffsetX() {
        var v = parseFloat(Lampa.Storage.get('rating_offset_x', '0'));
        return isNaN(v) ? 0 : v;
    }
    function getRatingOffsetY() {
        var v = parseFloat(Lampa.Storage.get('rating_offset_y', '0'));
        return isNaN(v) ? 0 : v;
    }
    function getRatingBackgroundAlpha() {
        var v = parseFloat(Lampa.Storage.get('rating_window_opacity', '0'));
        if (isNaN(v)) return 1;
        v = Math.max(0, Math.min(100, v));
        return 1 - (v / 100);
    }
    function getRatingPositionCSS(verticalOffsetEm) {
        var pos = Lampa.Storage.get('rating_position', 'top');
        var ox = getRatingOffsetX();
        var oy = getRatingOffsetY();
        var vo = (verticalOffsetEm == null || isNaN(verticalOffsetEm)) ? 0 : verticalOffsetEm;
        var rightVal = (0.3 - ox) + 'em';
        if (pos === 'bottom') {
            return 'right:' + rightVal + '!important;bottom:' + (0.3 - oy + vo) + 'em!important;top:auto!important;left:auto!important;';
        }
        return 'right:' + rightVal + '!important;top:' + (0.3 + oy + vo) + 'em!important;bottom:auto!important;left:auto!important;';
    }

    function voteClass(extra) {
        var pos = Lampa.Storage.get('rating_position', 'top');
        return 'card__vote card__vote--' + pos + (extra ? ' ' + extra : '');
    }

    function getRatingParent(card) {
        var parent = card.querySelector && card.querySelector('.card__view');
        if (!parent) parent = card;
        parent.setAttribute('data-rate-anchor', '1');
        parent.style.position = 'relative';
        return parent;
    }

    function createRatingElement(card, verticalOffsetEm) {
        var ratingElement = document.createElement('div');
        ratingElement.className = voteClass();
        var posCSS = getRatingPositionCSS(verticalOffsetEm);
        var bgAlpha = getRatingBackgroundAlpha();
        ratingElement.style.cssText = 'line-height:1;font-family:"SegoeUI",sans-serif;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;z-index:1;' + posCSS + 'background:rgba(0,0,0,' + bgAlpha + ');color:#fff;padding:0.2em 0.4em;border-radius:0.35em;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;';
        var parent = getRatingParent(card);
        parent.appendChild(ratingElement);
        return ratingElement;
    }

    function createRatingInnerBlock() {
        var el = document.createElement('div');
        el.className = voteClass();
        var bgAlpha = getRatingBackgroundAlpha();
        el.style.cssText = 'line-height:1;font-family:"SegoeUI",sans-serif;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;background:rgba(0,0,0,' + bgAlpha + ');color:#fff;padding:0.2em 0.4em;border-radius:0.35em;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;';
        return el;
    }

    function createRatingLineElement(card) {
        var line = document.createElement('div');
        line.className = voteClass('card__vote-line');
        var posCSS = getRatingPositionCSS();
        var bgAlpha = getRatingBackgroundAlpha();
        line.style.cssText = 'line-height:1;font-family:"SegoeUI",sans-serif;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;z-index:1;' + posCSS + 'background:rgba(0,0,0,' + bgAlpha + ');color:#fff;padding:0.2em 0.4em;border-radius:0.35em;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;-webkit-align-items:flex-end;align-items:flex-end;';
        line.innerHTML = '<div class="card__rate-item rate--tmdb" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--imdb" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--kp" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--lampa" style="display:none"><span class="rate-value">0.0</span><span class="source--name rate-icon-reaction"></span></div>';
        var parent = getRatingParent(card);
        parent.appendChild(line);
        return line;
    }

    function isRatingSourceVisible(source) {
        var key = 'rating_show_' + source;
        var v = Lampa.Storage.get(key, '1');
        if (v === false || v === 'false' || v === 0 || v === '0' || v === '' || v === null || v === undefined) return false;
        return true;
    }

    function updateCardRatingLine(ratingLine, data) {
        if (!ratingLine || !ratingLine.parentNode) return;
        var idStr = data.id.toString();
        if (ratingLine.dataset.movieId !== idStr) return;

        try {
            var tmdbItem = ratingLine.querySelector('.rate--tmdb');
            if (tmdbItem) {
                var tmdbRating = getTMDBRating(data);
                var tmdbDiv = tmdbItem.querySelector('div');
                if (tmdbDiv) {
                    tmdbDiv.textContent = formatRating(tmdbRating);
                    tmdbDiv.style.color = getRatingColor(tmdbRating);
                }
                var show = (tmdbRating !== '0.0') && isRatingSourceVisible('tmdb');
                tmdbItem.style.display = show ? '' : 'none';
            }
        } catch (e) {}

        try {
            var kpFromData = (data.kp_rating != null ? data.kp_rating : (data.ratingKinopoisk != null ? data.ratingKinopoisk : 0));
            var imdbFromData = (data.imdb_rating != null ? data.imdb_rating : (data.ratingImdb != null ? data.ratingImdb : 0));
            var cachedKp = ratingCache.get('kp_rating', data.id);
            var kpVal = (kpFromData > 0 ? kpFromData : (cachedKp && cachedKp.kp)) || 0;
            var imdbVal = (imdbFromData > 0 ? imdbFromData : (cachedKp && cachedKp.imdb)) || 0;

            var imdbItem = ratingLine.querySelector('.rate--imdb');
            if (imdbItem) {
                var imdbDiv = imdbItem.querySelector('div');
                var imdbText = imdbVal ? formatRating(imdbVal) : '0.0';
                if (imdbDiv) {
                    imdbDiv.textContent = imdbText;
                    imdbDiv.style.color = getRatingColor(imdbText);
                }
                var show = (imdbVal > 0) && isRatingSourceVisible('imdb');
                imdbItem.style.display = show ? '' : 'none';
            }

            var kpItem = ratingLine.querySelector('.rate--kp');
            if (kpItem) {
                var kpDiv = kpItem.querySelector('div');
                var kpText = kpVal ? formatRating(kpVal) : '0.0';
                if (kpDiv) {
                    kpDiv.textContent = kpText;
                    kpDiv.style.color = getRatingColor(kpText);
                }
                var show = (kpVal > 0) && isRatingSourceVisible('kp');
                kpItem.style.display = show ? '' : 'none';
            }
        } catch (e) {}

        try {
            var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
            var cachedLampa = ratingCache.get('lampa_rating', lampaKey);
            var lampaItem = ratingLine.querySelector('.rate--lampa');
            if (lampaItem) {
                var lampaValEl = lampaItem.querySelector('.rate-value');
                var lampaReactionIcon = lampaItem.querySelector('.rate-icon-reaction');
                var hasLampa = cachedLampa && cachedLampa.rating > 0;
                var lampaText = hasLampa ? formatRating(cachedLampa.rating) : '0.0';
                if (lampaValEl) {
                    lampaValEl.textContent = lampaText;
                    lampaValEl.style.color = getRatingColor(lampaText);
                }
                if (lampaReactionIcon) {
                    if (hasLampa && cachedLampa.medianReaction) {
                        lampaReactionIcon.style.backgroundImage = 'url(' + getReactionImageSrc(cachedLampa.medianReaction) + ')';
                    } else {
                        lampaReactionIcon.style.backgroundImage = '';
                    }
                }
                var show = hasLampa && isRatingSourceVisible('lampa');
                lampaItem.style.display = show ? '' : 'none';
            }
        } catch (e) {}
        var firstRating = null;
        try {
            var tmdbR = getTMDBRating(data);
            if (tmdbR !== '0.0' && isRatingSourceVisible('tmdb')) firstRating = tmdbR;
            if (!firstRating && imdbVal > 0 && isRatingSourceVisible('imdb')) firstRating = String(imdbVal);
            if (!firstRating && kpVal > 0 && isRatingSourceVisible('kp')) firstRating = String(kpVal);
            if (!firstRating && cachedLampa && cachedLampa.rating > 0 && isRatingSourceVisible('lampa')) firstRating = String(cachedLampa.rating);
        } catch (e) {}
        var lineBg = getRatingBackgroundColor(firstRating || '0');
        ratingLine.style.background = lineBg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
        var anyVisible = (tmdbItem && tmdbItem.style.display !== 'none') || (imdbItem && imdbItem.style.display !== 'none') || (kpItem && kpItem.style.display !== 'none') || (lampaItem && lampaItem.style.display !== 'none');
        ratingLine.style.display = anyVisible ? '' : 'none';
    }

    function getRatingDisplayMode() {
        return Lampa.Storage.get('rating_display_mode', 'single');
    }

    function fillSingleRatingElement(el, data, rateSource) {
        if (!el || !data || !rateSource) return;
        var idStr = data.id.toString();
        if (el.dataset.movieId !== idStr) return;
        if (rateSource === 'tmdb') {
            var rating = getTMDBRating(data);
            if (rating !== '0.0') {
                var color = getRatingColor(rating);
                el.className = voteClass('rate--tmdb');
                el.innerHTML = '<span style="color:' + color + '">' + formatRating(rating) + '</span> <span class="source--name"></span>';
                el.style.display = '';
                var bg = getRatingBackgroundColor(rating);
                el.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
            } else {
                el.style.display = 'none';
            }
            return;
        }
        if (rateSource === 'imdb' || rateSource === 'kp') {
            getKinopoiskRating(data, function (res) {
                if (!el.parentNode || el.dataset.movieId !== idStr) return;
                var val = rateSource === 'kp' ? res.kp : res.imdb;
                if (val && val > 0) {
                    var text = formatRating(val);
                    var color = getRatingColor(val);
                    el.className = voteClass('rate--' + rateSource);
                    el.innerHTML = '<span style="color:' + color + '">' + text + '</span> <span class="source--name"></span>';
                    el.style.display = '';
                    var bg = getRatingBackgroundColor(val);
                    el.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
                } else {
                    el.style.display = 'none';
                }
            });
            return;
        }
        if (rateSource === 'lampa') {
            var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
            getLampaRating(lampaKey).then(function (result) {
                if (!el.parentNode || el.dataset.movieId !== idStr) return;
                if (result.rating > 0) {
                    var color = getRatingColor(result.rating);
                    var html = '<span style="color:' + color + '">' + formatRating(result.rating) + '</span>';
                    if (result.medianReaction) {
                        html += ' <img style="width:16px;height:16px;margin-left:4px;object-fit:contain;vertical-align:middle;flex-shrink:0;" src="' + getReactionImageSrc(result.medianReaction) + '">';
                    }
                    el.className = voteClass('rate--lampa');
                    el.innerHTML = html;
                    el.style.display = '';
                    var bg = getRatingBackgroundColor(result.rating);
                    el.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
                } else {
                    el.style.display = 'none';
                }
            });
        }
    }

    function createRatingSeparateElements(card) {
        var parent = getRatingParent(card);
        var sources = [];
        if (isRatingSourceVisible('tmdb')) sources.push('tmdb');
        if (isRatingSourceVisible('imdb')) sources.push('imdb');
        if (isRatingSourceVisible('kp')) sources.push('kp');
        if (isRatingSourceVisible('lampa')) sources.push('lampa');
        var wrapper = document.createElement('div');
        wrapper.className = voteClass('card__vote-separate-wrap');
        var posCSS = getRatingPositionCSS(0);
        wrapper.style.cssText = 'position:absolute;z-index:1;display:flex;flex-direction:column;gap:0.1em;box-sizing:border-box;' + posCSS;
        for (var i = 0; i < sources.length; i++) {
            var el = createRatingInnerBlock();
            el.dataset.rateSource = sources[i];
            el.classList.add('card__vote--separate');
            el.style.display = 'none';
            wrapper.appendChild(el);
        }
        parent.appendChild(wrapper);
    }

    function updateCardRatingSeparate(card, data) {
        var idStr = data.id.toString();
        var elements = card.querySelectorAll('.card__vote.card__vote--separate');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            el.dataset.movieId = idStr;
            fillSingleRatingElement(el, data, el.dataset.rateSource);
        }
    }

    function showTmdbFallback(ratingElement, data) {
        var tmdb = getTMDBRating(data);
        if (tmdb !== '0.0') {
            var color = getRatingColor(tmdb);
            ratingElement.className = voteClass('rate--tmdb');
            ratingElement.innerHTML = '<span style="color:' + color + '">' + formatRating(tmdb) + '</span> <span class="source--name"></span>';
            var bg = getRatingBackgroundColor(tmdb);
            ratingElement.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
            return;
        }
        var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
        var cachedLampa = ratingCache.get('lampa_rating', lampaKey);
        if (cachedLampa && cachedLampa.rating > 0) {
            var color = getRatingColor(cachedLampa.rating);
            var html = '<span style="color:' + color + '">' + formatRating(cachedLampa.rating) + '</span>';
            if (cachedLampa.medianReaction) {
                html += ' <img style="width:16px;height:16px;margin-left:4px;object-fit:contain;vertical-align:middle;flex-shrink:0;" src="' + getReactionImageSrc(cachedLampa.medianReaction) + '">';
            }
            ratingElement.className = voteClass('rate--lampa');
            ratingElement.innerHTML = html;
            var bg = getRatingBackgroundColor(cachedLampa.rating);
            ratingElement.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
            return;
        }
        getLampaRating(lampaKey).then(function (result) {
            if (!ratingElement.parentNode || ratingElement.dataset.movieId !== data.id.toString()) return;
            if (result.rating > 0) {
                var color = getRatingColor(result.rating);
                var html = '<span style="color:' + color + '">' + formatRating(result.rating) + '</span>';
                if (result.medianReaction) {
                    html += ' <img style="width:16px;height:16px;margin-left:4px;object-fit:contain;vertical-align:middle;flex-shrink:0;" src="' + getReactionImageSrc(result.medianReaction) + '">';
                }
                ratingElement.className = voteClass('rate--lampa');
                ratingElement.innerHTML = html;
                var bg = getRatingBackgroundColor(result.rating);
                ratingElement.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
            } else {
                ratingElement.style.display = 'none';
            }
        });
    }

    function removeAllRatingElements(card) {
        var parent = card.querySelector && card.querySelector('[data-rate-anchor="1"]');
        if (!parent) return;
        var list = parent.querySelectorAll('.card__vote, .card__vote-line');
        for (var i = 0; i < list.length; i++) list[i].remove();
    }

    function updateCardRating(item) {
        var card = item.card || item;
        if (!card || !card.querySelector || !document.body.contains(card)) return;
        var data = card.card_data || item.data || {};
        if (!data.id) return;
        var source = Lampa.Storage.get('rating_source', 'tmdb');
        var ratingElement = card.querySelector('.card__vote');
        var displayMode = getRatingDisplayMode();

        if (source === 'all') {
            var isSeparate = displayMode === 'separate';
            removeAllRatingElements(card);
            if (isSeparate) {
                createRatingSeparateElements(card);
                updateCardRatingSeparate(card, data);
                getKinopoiskRating(data, function () {
                    if (card.parentNode && document.body.contains(card)) updateCardRatingSeparate(card, data);
                });
                var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                getLampaRating(lampaKey).then(function () {
                    if (card.parentNode && document.body.contains(card)) updateCardRatingSeparate(card, data);
                });
            } else {
                ratingElement = createRatingLineElement(card);
                ratingElement.dataset.source = 'all';
                ratingElement.dataset.movieId = data.id.toString();
                ratingElement.style.display = '';
                updateCardRatingLine(ratingElement, data);
                if (!ratingElement.dataset.kpRequested) {
                    ratingElement.dataset.kpRequested = String(Date.now());
                    getKinopoiskRating(data, function () {
                        if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                            updateCardRatingLine(ratingElement, data);
                        }
                    });
                }
                var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                getLampaRating(lampaKey).then(function () {
                    if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                        updateCardRatingLine(ratingElement, data);
                    }
                });
            }
            return;
        }

        removeAllRatingElements(card);
        ratingElement = createRatingElement(card);
        ratingElement.dataset.source = source;
        ratingElement.dataset.movieId = data.id.toString();
        ratingElement.style.display = '';

        function applyTmdbToElement(el) {
            var tmdb = getTMDBRating(data);
            if (tmdb !== '0.0') {
                var color = getRatingColor(tmdb);
                el.className = voteClass('rate--tmdb');
                el.innerHTML = '<span style="color:' + color + '">' + formatRating(tmdb) + '</span> <span class="source--name"></span>';
                var bg = getRatingBackgroundColor(tmdb);
                el.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
                return true;
            }
            return false;
        }

        if (source === 'tmdb') {
            ratingElement.className = voteClass('rate--tmdb');
            if (!applyTmdbToElement(ratingElement)) {
                showTmdbFallback(ratingElement, data);
            }
        } else if (source === 'lampa') {
            var type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            var ratingKey = type + '_' + data.id;
            var cached = ratingCache.get('lampa_rating', ratingKey);
            if (cached && cached.rating > 0) {
                ratingElement.className = voteClass('rate--lampa');
                var color = getRatingColor(cached.rating);
                var html = '<span style="color:' + color + '">' + formatRating(cached.rating) + '</span>';
                if (cached.medianReaction) {
                    var reactionSrc = getReactionImageSrc(cached.medianReaction);
                    html += ' <img style="width:16px;height:16px;margin-left:4px;object-fit:contain;vertical-align:middle;flex-shrink:0;" src="' + reactionSrc + '">';
                }
                ratingElement.innerHTML = html;
                var bg = getRatingBackgroundColor(cached.rating);
                ratingElement.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
                return;
            }
            applyTmdbToElement(ratingElement);
            addToQueue(function () {
                getLampaRating(ratingKey).then(function (result) {
                    if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                        if (result.rating > 0) {
                            ratingElement.className = voteClass('rate--lampa');
                            var color = getRatingColor(result.rating);
                            var html = '<span style="color:' + color + '">' + formatRating(result.rating) + '</span>';
                            if (result.medianReaction) {
                                var reactionSrc = getReactionImageSrc(result.medianReaction);
                                html += ' <img style="width:16px;height:16px;margin-left:4px;object-fit:contain;vertical-align:middle;flex-shrink:0;" src="' + reactionSrc + '">';
                            }
                            ratingElement.innerHTML = html;
                            var bg = getRatingBackgroundColor(result.rating);
                            ratingElement.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
                        }
                    }
                });
            });
        } else if (source === 'kp' || source === 'imdb') {
            applyTmdbToElement(ratingElement);
            getKinopoiskRating(data, function (res) {
                if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                    var val = source === 'kp' ? res.kp : res.imdb;
                    if (val && val > 0) {
                        ratingElement.className = voteClass('rate--' + source);
                        var text = formatRating(val);
                        var color = getRatingColor(val);
                        ratingElement.innerHTML = '<span style="color:' + color + '">' + text + '</span> <span class="source--name"></span>';
                        var bg = getRatingBackgroundColor(val);
                        ratingElement.style.background = bg || ('rgba(0,0,0,' + getRatingBackgroundAlpha() + ')');
                    }
                }
            });
        }
    }

    window.refreshAllRatings = function () {
        var allCards = document.querySelectorAll('.card');
        for (var i = 0; i < allCards.length; i++) {
            var card = allCards[i];
            var data = card.card_data;
            if (data && data.id) {
                removeAllRatingElements(card);
                updateCardRating({ card: card, data: data });
            }
        }
    };

    var _scrollRatingMaxCardsPerRun = 35;
    function applyCachedRatingsToVisibleCards() {
        var allCards = document.querySelectorAll('.card');
        if (allCards.length > 200) return;
        var wH = window.innerHeight || 1000;
        var updated = 0;
        for (var i = 0; i < allCards.length && updated < _scrollRatingMaxCardsPerRun; i++) {
            var card = allCards[i];
            var data = card.card_data;
            if (!data || !data.id) continue;
            var rect = card.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > wH + 200) continue;
            updateCardRating({ card: card, data: data });
            updated++;
        }
    }

    var _scrollRatingLastRun = 0;
    var _scrollRatingThrottle = 220;
    var _scrollRatingRafScheduled = false;
    function onScrollApplyRatings() {
        var now = Date.now();
        if (now - _scrollRatingLastRun < _scrollRatingThrottle) return;
        _scrollRatingLastRun = now;
        if (_scrollRatingRafScheduled) return;
        _scrollRatingRafScheduled = true;
        requestAnimationFrame(function () {
            _scrollRatingRafScheduled = false;
            applyCachedRatingsToVisibleCards();
        });
    }

    function pollCards() {
        var allCards = document.querySelectorAll('.card');
        var source = Lampa.Storage.get('rating_source', 'tmdb');
        var displayMode = getRatingDisplayMode();
        for (var i = 0; i < allCards.length; i++) {
            var card = allCards[i];
            var data = card.card_data;
            if (!data || !data.id) continue;
            var idStr = data.id.toString();
            var lineEl = card.querySelector('.card__vote-line');
            var separateEls = card.querySelectorAll('.card__vote--separate');
            var singleEl = card.querySelector('.card__vote:not(.card__vote-line):not(.card__vote--separate):not(.card__vote-separate-wrap)');
            var needFull = false;
            if (source === 'all') {
                if (displayMode === 'single') {
                    if (!lineEl || lineEl.dataset.movieId !== idStr) needFull = true;
                    else updateCardRatingLine(lineEl, data);
                } else {
                    if (separateEls.length === 0 || (separateEls[0] && separateEls[0].dataset.movieId !== idStr)) needFull = true;
                    else updateCardRatingSeparate(card, data);
                }
            } else {
                if (!singleEl || singleEl.dataset.source !== source || singleEl.dataset.movieId !== idStr) needFull = true;
                else if (singleEl.innerHTML === '') {
                    if (source === 'lampa') {
                        var ratingKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                        var cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating > 0) {
                            var color = getRatingColor(cached.rating);
                            var html = '<span style="color:' + color + '">' + formatRating(cached.rating) + '</span>';
                            if (cached.medianReaction) {
                                html += ' <img style="width:16px;height:16px;margin-left:4px;object-fit:contain;vertical-align:middle;flex-shrink:0;" src="' + getReactionImageSrc(cached.medianReaction) + '">';
                            }
                            singleEl.innerHTML = html;
                        }
                    } else if (source === 'tmdb') {
                        var cached = ratingCache.get('tmdb_rating', data.id);
                        if (cached && cached.vote_average > 0) {
                            var text = formatRating(cached.vote_average);
                            var color = getRatingColor(cached.vote_average);
                            singleEl.innerHTML = '<span style="color:' + color + '">' + text + '</span> <span class="source--name"></span>';
                        }
                    } else if (source === 'kp' || source === 'imdb') {
                        var cached = ratingCache.get('kp_rating', data.id);
                        if (cached && (cached.kp > 0 || cached.imdb > 0)) {
                            var rating = source === 'kp' ? cached.kp : cached.imdb;
                            singleEl.innerHTML = '<span style="color:' + getRatingColor(rating) + '">' + formatRating(rating) + '</span> <span class="source--name"></span>';
                        }
                    }
                }
            }
            if (needFull) updateCardRating({ card: card, data: data });
        }
        setTimeout(pollCards, 500);
    }

    function colorizeFullCardRatings(render) {
        if (!isColoredRatingsPosterOn()) return;
        var scope = $(render).length ? $(render) : $(document);
        scope.find('.full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function () {
            var el = $(this);
            if (el.closest('.explorer').length) return;
            var text = el.text().trim();
            var m = text.match(/(\d+[\.,]\d+|\d+)/);
            if (!m) return;
            var v = parseFloat(m[0].replace(',', '.'));
            if (isNaN(v)) return;
            var c = v <= 3 ? 'red' : v < 6 ? 'orange' : v < 8 ? 'cornflowerblue' : 'lawngreen';
            el.css('color', c);
        });
    }

    function insertLampaBlock(render) {
        if (!render) return false;
        var rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        var lampaBlockHtml = '<div class="full-start__rate rate--lampa"><div class="rate-value">0.0</div><div class="rate-icon"></div><div class="source--name">LAMPA</div></div>';
        var kpBlock = rateLine.find('.rate--kp');
        if (kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        return true;
    }

    function applyRatingScale() {
        var v = parseFloat(Lampa.Storage.get('rating_scale', '100'));
        if (isNaN(v)) v = 100;
        v = Math.max(60, Math.min(150, v)) / 100;
        try {
            document.body.style.setProperty('--rating-scale', String(v));
        } catch (e) {}
    }
    function applyRatingSettingsRefresh() {
        applyRatingScale();
        if (typeof window.refreshAllRatings === 'function') window.refreshAllRatings();
    }

    function openRatingSettingsModal() {
        var $ = typeof window.$ !== 'undefined' ? window.$ : (typeof window.jQuery !== 'undefined' ? window.jQuery : null);
        if (!$) return;
        try { if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close(); } catch (err) {}
        setTimeout(function openRatingModalAfterClose() {
        var SOURCE_LABELS = { tmdb: 'TMDB', lampa: 'Lampa', kp: 'КиноПоиск', imdb: 'IMDB', all: 'Все' };
        var POSITION_LABELS = { top: 'Сверху справа', bottom: 'Снизу справа' };
        var DISPLAY_MODE_LABELS = { single: 'Одно окно', separate: 'Каждый в отдельном окне' };
        var list = $('<div class="menu-edit-list rate-settings-modal"></div>').css({ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', padding: '0.5em 0', pointerEvents: 'auto', cursor: 'default' });
        list.on('click mousedown touchstart', function (e) { e.stopPropagation(); });

        function isMouseEvent(e) {
            return e && (e.pointerType === 'mouse' || (e.clientX !== undefined && e.clientY !== undefined));
        }
        function blurActiveAfterMouseClick(e) {
            if (isMouseEvent(e)) {
                setTimeout(function () { try { var a = document.activeElement; if (a && a.blur) a.blur(); } catch (err) {} }, 0);
            }
        }

        function makeRow(label, valueText, onClick) {
            var row = $('<div class="selector menu-edit-list__item rate-settings-row" tabindex="0"></div>').css({
                display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '0.5em', padding: '0.5em 0.4em', marginBottom: '0.2em',
                borderRadius: '0.3em', border: '3px solid transparent', boxSizing: 'border-box'
            });
            var title = $('<div class="menu-edit-list__title"></div>').css({ minWidth: 0, overflow: 'hidden' }).text(label);
            var val = $('<div class="rate-settings-value"></div>').css({ whiteSpace: 'nowrap', opacity: 0.9 }).text(valueText);
            row.append(title).append(val);
            if (typeof onClick === 'function') {
                row.on('hover:enter', function () { onClick(row, val); });
                row.on('click', function (e) {
                    if (e && e.preventDefault) e.preventDefault();
                    if (e && e.stopPropagation) e.stopPropagation();
                    blurActiveAfterMouseClick(e);
                });
            }
            return { row: row, updateVal: function (text) { val.text(text); } };
        }

        function addCycleRow(label, storageKey, options, defaultVal) {
            var current = Lampa.Storage.get(storageKey, defaultVal);
            var labels = options.labels || options;
            var values = options.values || Object.keys(labels);
            if (typeof labels === 'object' && !Array.isArray(labels)) {
                var arr = [];
                for (var k in labels) arr.push(k);
                values = arr;
            }
            var r = makeRow(label, labels[current] || current, function (rowEl, valEl) {
                var cur = Lampa.Storage.get(storageKey, defaultVal);
                var idx = values.indexOf(cur);
                if (idx < 0) idx = 0;
                idx = (idx + 1) % values.length;
                var next = values[idx];
                Lampa.Storage.set(storageKey, next);
                valEl.text(labels[next] || next);
                applyRatingSettingsRefresh();
            });
            r.updateVal(labels[current] || current);
            list.append(r.row);
            return r;
        }

        function addTriggerRow(label, storageKey, defaultVal) {
            var isOn = function () {
                var v = Lampa.Storage.get(storageKey, defaultVal);
                return (v === true || v === 'true' || v === '1' || v === 1);
            };
            var current = isOn();
            var r = makeRow(label, current ? 'Вкл' : 'Выкл', function (rowEl, valEl) {
                var next = !isOn();
                if (storageKey === 'colored_ratings_poster') {
                    setColoredRatingsPoster(next);
                } else {
                    Lampa.Storage.set(storageKey, next ? 'true' : 'false');
                }
                valEl.text(next ? 'Вкл' : 'Выкл');
                applyRatingSettingsRefresh();
            });
            r.updateVal(current ? 'Вкл' : 'Выкл');
            list.append(r.row);
            return r;
        }

        function addNumberRow(label, storageKey, defaultVal, min, max, step, suffix) {
            var current = parseFloat(Lampa.Storage.get(storageKey, defaultVal));
            var val = isNaN(current) ? defaultVal : Math.max(min, Math.min(max, current));
            Lampa.Storage.set(storageKey, String(val));
            var r = makeRow(label, val + (suffix || ''), function (rowEl, valEl) {
                var num = parseFloat(Lampa.Storage.get(storageKey, defaultVal));
                num = isNaN(num) ? defaultVal : num;
                var next = num + (step || 1);
                if (next > max) next = min;
                if (next < min) next = max;
                Lampa.Storage.set(storageKey, String(next));
                valEl.text(next + (suffix || ''));
                applyRatingSettingsRefresh();
            });
            r.updateVal(val + (suffix || ''));
            list.append(r.row);
            return r;
        }

        function addNumberRowWithButtons(label, storageKey, defaultVal, min, max, step, suffix) {
            var current = parseFloat(Lampa.Storage.get(storageKey, defaultVal));
            var val = isNaN(current) ? defaultVal : Math.max(min, Math.min(max, current));
            Lampa.Storage.set(storageKey, String(val));
            var valEl = $('<div class="rate-settings-value"></div>').css({ whiteSpace: 'nowrap', opacity: 0.9, minWidth: '2.5em', textAlign: 'center' }).text(val + (suffix || ''));
            var btnMinus = $('<div class="selector menu-edit-list__item rate-settings-plusminus-btn" tabindex="0" aria-label="Уменьшить"></div>').text('−').css({
                width: '2em', minHeight: '2em', padding: 0, borderRadius: '0.25em', border: '2px solid transparent', boxSizing: 'border-box', background: 'rgba(255,255,255,0.12)', fontSize: '1.1em', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            });
            var btnPlus = $('<div class="selector menu-edit-list__item rate-settings-plusminus-btn" tabindex="0" aria-label="Увеличить"></div>').text('+').css({
                width: '2em', minHeight: '2em', padding: 0, borderRadius: '0.25em', border: '2px solid transparent', boxSizing: 'border-box', background: 'rgba(255,255,255,0.12)', fontSize: '1.1em', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            });
            function applyChange(delta) {
                var num = parseFloat(Lampa.Storage.get(storageKey, defaultVal));
                num = isNaN(num) ? defaultVal : num;
                var next = Math.max(min, Math.min(max, num + delta));
                Lampa.Storage.set(storageKey, String(next));
                valEl.text(next + (suffix || ''));
                applyRatingSettingsRefresh();
            }
            btnMinus.on('hover:enter', function () { applyChange(-(step || 1)); });
            btnMinus.on('click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                blurActiveAfterMouseClick(e);
            });
            btnPlus.on('hover:enter', function () { applyChange(step || 1); });
            btnPlus.on('click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                blurActiveAfterMouseClick(e);
            });
            var row = $('<div class="menu-edit-list__item rate-settings-row rate-settings-number-row"></div>').css({
                display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '0.35em', padding: '0.5em 0.4em', marginBottom: '0.2em',
                borderRadius: '0.3em', border: '3px solid transparent', boxSizing: 'border-box'
            });
            var title = $('<div class="menu-edit-list__title"></div>').css({ minWidth: 0, overflow: 'hidden' }).text(label);
            row.append(title).append(btnMinus).append(valEl).append(btnPlus);
            list.append(row);
            return {
                row: row,
                updateVal: function (text) { valEl.text(text); }
            };
        }

        var STEP = 0.1;
        var MIN_OFF = -5;
        var MAX_OFF = 5;
        function applyOffset(dx, dy) {
            var x = parseFloat(Lampa.Storage.get('rating_offset_x', '0'));
            var y = parseFloat(Lampa.Storage.get('rating_offset_y', '0'));
            if (isNaN(x)) x = 0;
            if (isNaN(y)) y = 0;
            x = Math.max(MIN_OFF, Math.min(MAX_OFF, x + dx));
            y = Math.max(MIN_OFF, Math.min(MAX_OFF, y + dy));
            Lampa.Storage.set('rating_offset_x', String(x));
            Lampa.Storage.set('rating_offset_y', String(y));
            applyRatingSettingsRefresh();
        }
        function addOffsetButton(text, dx, dy) {
            var btn = $('<div class="selector menu-edit-list__item rate-settings-offset-btn" tabindex="0"></div>').text(text).css({
                display: 'block', textAlign: 'center', padding: '0.5em 0.4em', marginBottom: '0.2em', borderRadius: '0.3em',
                border: '3px solid transparent', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)'
            });
            btn.on('hover:enter', function () { applyOffset(dx, dy); });
            btn.on('click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                blurActiveAfterMouseClick(e);
            });
            return btn;
        }

        var rowSource = addCycleRow('Источник рейтинга', 'rating_source', SOURCE_LABELS, 'tmdb');
        var rowAnimated = addTriggerRow('Анимированные реакции на постерах', 'animated_reactions', false);
        var rowColored = addTriggerRow('Цветные рейтинги (цифры)', 'colored_ratings_poster', true);
        var rowColoredWin = addTriggerRow('Цветные окна (цифры белые)', 'rating_colored_windows', false);
        var rowPosition = addCycleRow('Позиция на постере', 'rating_position', POSITION_LABELS, 'top');
        list.append($('<div class="menu-edit-list__item rate-settings-offset-label"></div>').css({ padding: '0.3em 0.4em', marginBottom: '0.1em', fontWeight: 'bold', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden' }).text('Смещение (нажатие-сдвиг)'));
        list.append(addOffsetButton('Влево', -STEP, 0));
        list.append(addOffsetButton('Вправо', STEP, 0));
        list.append(addOffsetButton('Вверх', 0, -STEP));
        list.append(addOffsetButton('Вниз', 0, STEP));
        var rowShowTmdb = addTriggerRow('Показывать TMDB (при «Все»)', 'rating_show_tmdb', true);
        var rowShowImdb = addTriggerRow('Показывать IMDB (при «Все»)', 'rating_show_imdb', true);
        var rowShowKp = addTriggerRow('Показывать КиноПоиск (при «Все»)', 'rating_show_kp', true);
        var rowShowLampa = addTriggerRow('Показывать Lampa (при «Все»)', 'rating_show_lampa', true);
        var rowDisplayMode = addCycleRow('Режим отображения (все рейтинги)', 'rating_display_mode', DISPLAY_MODE_LABELS, 'single');
        var rowOpacity = addNumberRowWithButtons('Прозрачность (0=непрозрачное, 100=макс.)', 'rating_window_opacity', 0, 0, 100, 10, '%');
        var rowScale = addNumberRowWithButtons('Масштаб окон рейтингов', 'rating_scale', 100, 60, 150, 5, '%');

        function resetAllToDefault() {
            Lampa.Storage.set('rating_source', 'tmdb');
            Lampa.Storage.set('animated_reactions', 'false');
            setColoredRatingsPoster(true);
            Lampa.Storage.set('rating_colored_windows', 'false');
            Lampa.Storage.set('rating_position', 'top');
            Lampa.Storage.set('rating_offset_x', '0');
            Lampa.Storage.set('rating_offset_y', '0');
            Lampa.Storage.set('rating_show_tmdb', 'true');
            Lampa.Storage.set('rating_show_imdb', 'true');
            Lampa.Storage.set('rating_show_kp', 'true');
            Lampa.Storage.set('rating_show_lampa', 'true');
            Lampa.Storage.set('rating_display_mode', 'single');
            Lampa.Storage.set('rating_window_opacity', '30');
            Lampa.Storage.set('rating_scale', '100');
            Lampa.Storage.set('rating_kp_api_key', '');
            rowSource.updateVal(SOURCE_LABELS.tmdb);
            rowAnimated.updateVal('Выкл');
            rowColored.updateVal('Вкл');
            rowColoredWin.updateVal('Выкл');
            rowPosition.updateVal(POSITION_LABELS.top);
            rowShowTmdb.updateVal('Вкл');
            rowShowImdb.updateVal('Вкл');
            rowShowKp.updateVal('Вкл');
            rowShowLampa.updateVal('Вкл');
            rowDisplayMode.updateVal(DISPLAY_MODE_LABELS.single);
            rowOpacity.updateVal('30%');
            rowScale.updateVal('100%');
            Lampa.Storage.set('rating_kp_api_key', '');
            applyRatingSettingsRefresh();
            if (typeof Lampa.Noty !== 'undefined' && Lampa.Noty.show) {
                try { Lampa.Noty.show('Настройки рейтингов сброшены'); } catch (e) {}
            }
        }
        var resetBtn = $('<div class="selector menu-edit-list__item rate-settings-reset" tabindex="0">Сбросить всё по умолчанию</div>').css({
            display: 'block', textAlign: 'center', padding: '0.6em 0.4em', marginTop: '0.4em', background: 'rgba(200,100,80,0.5)', borderRadius: '0.3em',
            border: '3px solid transparent', boxSizing: 'border-box'
        });
        resetBtn.on('hover:enter', resetAllToDefault);
        resetBtn.on('click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (e && e.stopPropagation) e.stopPropagation();
            blurActiveAfterMouseClick(e);
        });
        list.append(resetBtn);

        var closeBtn = $('<div class="selector menu-edit-list__item rate-settings-close" tabindex="0">Готово (закрыть)</div>').css({
            display: 'block', textAlign: 'center', padding: '0.75em', marginTop: '0.5em', background: 'rgba(66,133,244,0.6)', borderRadius: '0.3em',
            border: '3px solid transparent', boxSizing: 'border-box'
        });
        function closeModal() {
            Lampa.Modal.close();
            applyRatingSettingsRefresh();
            setTimeout(function () {
                if (typeof Lampa.Controller !== 'undefined' && typeof Lampa.Controller.toggle === 'function') {
                    try { Lampa.Controller.toggle('settings'); } catch (err) {}
                }
            }, 50);
        }
        closeBtn.on('hover:enter', closeModal);
        closeBtn.on('click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (e && e.stopPropagation) e.stopPropagation();
            blurActiveAfterMouseClick(e);
        });
        list.append(closeBtn);

        if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.open) {
            Lampa.Modal.open({
                title: 'Настройки рейтингов на карточках',
                html: list,
                size: 'medium',
                scroll_to_center: true,
                onBack: function () {
                    closeModal();
                }
            });
        }
        }, 200); // openRatingModalAfterClose
    }

    function getNode(element) {
        return element && (element.nodeType === 1 ? element : (element[0] || (element.get && element.get(0))));
    }

    function isInlineMode() {
        var v = Lampa.Storage.get('rating_settings_inline', false);
        return (v === true || v === 'true' || v === '1' || v === 1);
    }

    function applyInlineMode() {
        if (isInlineMode()) {
            document.body.classList.add('rating-inline-mode');
        } else {
            document.body.classList.remove('rating-inline-mode');
        }
    }

    function positionAfter(element, anchorName) {
        setTimeout(function () {
            var node = getNode(element);
            var anchor = document.querySelector('div[data-name="' + anchorName + '"]');
            if (anchor && anchor.parentNode && node && node.nodeType === 1) {
                anchor.parentNode.insertBefore(node, anchor.nextSibling);
            }
        }, 0);
    }

    function generateSelectValues(min, max, step, suffix) {
        var vals = {};
        for (var i = min; i <= max; i += step) {
            var k = String(Math.round(i * 100) / 100);
            vals[k] = k + (suffix || '');
        }
        return vals;
    }

    function migrateStorageFormat() {
        var keys = ['animated_reactions', 'colored_ratings_poster', 'rating_colored_windows', 'rating_show_tmdb', 'rating_show_imdb', 'rating_show_kp', 'rating_show_lampa'];
        for (var i = 0; i < keys.length; i++) {
            var v = Lampa.Storage.get(keys[i], undefined);
            if (v === '1' || v === 1) Lampa.Storage.set(keys[i], 'true');
            else if (v === '0' || v === 0) Lampa.Storage.set(keys[i], 'false');
        }
    }

    function addSettings() {
        if (!Lampa.SettingsApi) return;
        migrateStorageFormat();
        applyInlineMode();

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'rating_settings_inline', type: 'trigger', default: false },
            field: { name: 'Настройки рейтингов в меню Lampa', description: 'Вкл — настройки прямо здесь. Выкл — в модальном окне' },
            onRender: function (element) { positionAfter(element, 'interface_size'); },
            onChange: function () { applyInlineMode(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'rating_modal_open', type: 'trigger', default: false },
            field: { name: 'Настройки рейтингов (модальное окно)', description: 'Открыть окно настроек рейтингов' },
            onRender: function (element) { positionAfter(element, 'rating_settings_inline'); },
            onChange: function () { openRatingSettingsModal(); }
        });

        var inlineParams = [
            { param: { name: 'rating_source', type: 'select', values: { tmdb: 'TMDB', lampa: 'Lampa', kp: 'КиноПоиск', imdb: 'IMDB', all: 'Все' }, default: 'tmdb' }, field: { name: 'Источник рейтинга' } },
            { param: { name: 'rating_display_mode', type: 'select', values: { single: 'Одно окно', separate: 'Каждый в отдельном окне' }, default: 'single' }, field: { name: 'Режим отображения (при «Все»)' } },
            { param: { name: 'rating_position', type: 'select', values: { top: 'Сверху справа', bottom: 'Снизу справа' }, default: 'top' }, field: { name: 'Позиция на постере' } },
            { param: { name: 'animated_reactions', type: 'trigger', default: false }, field: { name: 'Анимированные реакции на постерах' } },
            { param: { name: 'colored_ratings_poster', type: 'trigger', default: true }, field: { name: 'Цветные рейтинги (цифры)' } },
            { param: { name: 'rating_colored_windows', type: 'trigger', default: false }, field: { name: 'Цветные окна (цифры белые)' } },
            { param: { name: 'rating_show_tmdb', type: 'trigger', default: true }, field: { name: 'Показывать TMDB (при «Все»)' } },
            { param: { name: 'rating_show_imdb', type: 'trigger', default: true }, field: { name: 'Показывать IMDB (при «Все»)' } },
            { param: { name: 'rating_show_kp', type: 'trigger', default: true }, field: { name: 'Показывать КиноПоиск (при «Все»)' } },
            { param: { name: 'rating_show_lampa', type: 'trigger', default: true }, field: { name: 'Показывать Lampa (при «Все»)' } },
            { param: { name: 'rating_window_opacity', type: 'select', values: generateSelectValues(0, 100, 10, '%'), default: '0' }, field: { name: 'Прозрачность окон' } },
            { param: { name: 'rating_scale', type: 'select', values: generateSelectValues(60, 150, 5, '%'), default: '100' }, field: { name: 'Масштаб окон рейтингов' } },
            { param: { name: 'rating_offset_x', type: 'input', values: '', default: '0' }, field: { name: 'Смещение по горизонтали (−5…5)', description: 'Введите число' } },
            { param: { name: 'rating_offset_y', type: 'input', values: '', default: '0' }, field: { name: 'Смещение по вертикали (−5…5)', description: 'Введите число' } }
        ];

        var prevName = 'rating_modal_open';
        for (var i = 0; i < inlineParams.length; i++) {
            (function (p, after) {
                Lampa.SettingsApi.addParam({
                    component: 'interface',
                    param: p.param,
                    field: p.field,
                    onRender: function (element) {
                        var node = getNode(element);
                        if (node) node.classList.add('rating-inline-param');
                        positionAfter(element, after);
                    },
                    onChange: function (value) {
                        if (p.param.name === 'colored_ratings_poster') {
                            setColoredRatingsPoster(value === 'true' || value === true);
                        }
                        applyRatingSettingsRefresh();
                    }
                });
            })(inlineParams[i], prevName);
            prevName = inlineParams[i].param.name;
        }

        var lastInlineParam = prevName;
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'rating_kp_api_key', type: 'input', values: '', default: '' },
            field: { name: 'API-KEY KinoPoisk (рейтинги)', description: 'Ключ kinopoiskapiunofficial.tech. Пустое — ключ по умолчанию' },
            onRender: function (element) {
                var node = getNode(element);
                if (node) node.classList.add('rating-inline-param');
                positionAfter(element, lastInlineParam);
            }
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
        style.textContent = (
            '.rate-settings-modal .selector{cursor:pointer!important;pointer-events:auto!important;-webkit-tap-highlight-color:rgba(255,255,255,0.15);user-select:none}' +
            '.rate-settings-modal .selector.focus{border-color:rgba(255,255,255,0.95)!important;box-shadow:0 0 0 2px rgba(255,255,255,0.95)}' +
            '.rate-settings-modal .selector:hover{background:rgba(255,255,255,0.08)}' +
            '.rate-settings-modal .selector:active{background:rgba(255,255,255,0.22)!important}' +
            '[data-name="rating_modal_open"] .settings-param__value,[data-name="rating_modal_open"] .settings-param__control,[data-name="rating_modal_open"] input[type="checkbox"]{display:none!important}' +
            '[data-name="rating_settings_inline"] .settings-param__value{pointer-events:none}' +
            '.rating-inline-mode [data-name="rating_modal_open"]{display:none!important}' +
            'body:not(.rating-inline-mode) .rating-inline-param{display:none!important}' +
            '.card .card__view{position:relative!important}' +
            '.card__view > .card__vote:not(.card__vote--top):not(.card__vote--bottom):not(.card__vote-line):not(.card__vote-separate-wrap):not(.card__vote--separate){display:none!important}' +
            '.card__vote{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center!important;height:auto!important;overflow:visible!important;position:absolute!important;z-index:1!important;border-radius:4px!important;width:auto!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;transform:scale(var(--rating-scale,1))!important;padding:2px 5px!important;line-height:1!important;white-space:nowrap!important;font-size:12px!important}' +
            '.card__vote-line{width:auto!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;transform:scale(var(--rating-scale,1))!important;padding:2px 5px!important;line-height:1!important;display:-webkit-box!important;display:-webkit-flex!important;display:flex!important;-webkit-flex-direction:column!important;flex-direction:column!important;-webkit-align-items:flex-end!important;align-items:flex-end!important;gap:1px!important;font-size:12px!important}' +
            '.card__vote-separate-wrap{background:transparent!important;padding:0!important;width:auto!important;min-width:0!important;max-width:100%!important;overflow:visible!important;transform:scale(var(--rating-scale,1))!important;display:-webkit-box!important;display:-webkit-flex!important;display:flex!important;-webkit-flex-direction:column!important;flex-direction:column!important;-webkit-align-items:flex-end!important;align-items:flex-end!important;gap:1px!important;font-size:12px!important}' +
            '.card__vote-separate-wrap .card__vote{position:static!important;width:auto!important;min-width:0!important;max-width:100%!important;padding:2px 5px!important;white-space:nowrap!important;-webkit-flex-shrink:0!important;flex-shrink:0!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;line-height:1!important;font-size:12px!important}' +
            '.card__vote--top,.card__vote-line.card__vote--top,.card__vote-separate-wrap.card__vote--top{transform-origin:top right!important;transform:scale(var(--rating-scale,1))!important}' +
            '.card__vote--bottom,.card__vote-line.card__vote--bottom,.card__vote-separate-wrap.card__vote--bottom{transform-origin:bottom right!important;transform:scale(var(--rating-scale,1))!important}' +
            '.card__vote--top{top:4px!important;right:4px!important;bottom:auto!important}' +
            '.card__vote--bottom{top:auto!important;right:4px!important;bottom:4px!important}' +
            '.card__vote-line .card__rate-item{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;white-space:nowrap;line-height:1!important}' +
            '.card__vote-line .card__rate-item:last-child{margin-bottom:0}' +
            '.card__vote .source--name{font-size:0;color:transparent;width:16px;height:16px;background-repeat:no-repeat;background-position:center;background-size:contain;margin-left:4px;-webkit-flex-shrink:0;flex-shrink:0}' +
            '@media (min-width:481px){.card__vote,.card__vote-line,.card__vote-separate-wrap,.card__vote-separate-wrap .card__vote{font-size:14px!important}.card__vote .source--name{width:24px;height:24px;margin-left:6px}}' +
            '.rate--kp .source--name{background-image:url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' viewBox=\'0 0 300 300\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cmask id=\'mask0_1_69\' style=\'mask-type:alpha\' maskUnits=\'userSpaceOnUse\' x=\'0\' y=\'0\' width=\'300\' height=\'300\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'white\'/%3E%3C/mask%3E%3Cg mask=\'url(%23mask0_1_69)\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'black\'/%3E%3Cpath d=\'M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z\' fill=\'url(%23paint0_radial_1_69)\'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id=\'paint0_radial_1_69\' cx=\'0\' cy=\'0\' r=\'1\' gradientUnits=\'userSpaceOnUse\' gradientTransform=\'translate(89.9999 45) rotate(45) scale(296.985)\'%3E%3Cstop offset=\'0.5\' stop-color=\'%23FF5500\'/%3E%3Cstop offset=\'1\' stop-color=\'%23BBFF00\'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E")}' +
            '.rate--tmdb .source--name{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 300\' width=\'300\' height=\'300\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0\' y1=\'0\' x2=\'1\' y2=\'0\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2390cea1\'/%3E%3Cstop offset=\'56%25\' stop-color=\'%233cbec9\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%2300b3e5\'/%3E%3C/linearGradient%3E%3Cstyle%3E.text-style%7Bfont-weight:bold;fill:url(%23grad);text-anchor:start;dominant-baseline:middle;textLength:300;lengthAdjust:spacingAndGlyphs;font-size:120px;%7D%3C/style%3E%3C/defs%3E%3Ctext class=\'text-style\' x=\'0\' y=\'150\' textLength=\'300\' lengthAdjust=\'spacingAndGlyphs\'%3ETMDB%3C/text%3E%3C/svg%3E")}' +
            '.rate--lampa .rate-icon-reaction{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23e040fb\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 14h-4v-1h4v1zm0-2h-4v-1h4v1zM9 20h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z\'/%3E%3C/svg%3E")}' +
            '.rate-icon-reaction{background-repeat:no-repeat;background-position:center;background-size:contain}' +
            '.card__vote.rate--lampa{line-height:1!important}' +
            '.card__vote.rate--lampa img{width:16px!important;height:16px!important;min-width:0!important;min-height:0!important;max-width:16px!important;max-height:16px!important;object-fit:contain!important;-webkit-flex-shrink:0;flex-shrink:0;vertical-align:middle;margin-left:4px!important}' +
            '@media (min-width:481px){.card__vote.rate--lampa img{width:24px!important;height:24px!important;max-width:24px!important;max-height:24px!important;margin-left:6px!important}}' +
            '.card__vote img[src*=".gif"]{object-fit:contain!important;-webkit-flex-shrink:0;flex-shrink:0}' +
            '.rate--lampa.rate--lampa--animated .rate-icon img{min-width:1em;min-height:1em;object-fit:contain}' +
            '.rate--imdb .source--name{background-image:url("data:image/svg+xml,%3Csvg fill=\'%23ffcc00\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E%3Cpath d=\'M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z\'/%3E%3C/g%3E%3C/svg%3E")}' +
            '@media (max-width:480px) and (orientation:portrait){.full-start__rate.rate--lampa{min-width:80px}}'
        );
        document.head.appendChild(style);
        applyRatingScale();
        addSettings();
        setupCardListener();
        pollCards();
        window.addEventListener('scroll', onScrollApplyRatings, { passive: true });

        Lampa.Listener.follow('card', function (event) {
            if (event.type === 'build' && event.object.card) {
                var data = event.object.card.card_data;
                if (data && data.id) {
                    updateCardRating({ card: event.object.card, data: data });
                }
            }
        });

        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite') {
                var render = event.object.activity.render();
                if (render && event.object.id) {
                    var kpBlock = $(render).find('.rate--kp');
                    var imdbBlock = $(render).find('.rate--imdb');
                    if (kpBlock.length || imdbBlock.length) {
                        var kpVal = parseFloat(kpBlock.find('div').first().text().trim()) || 0;
                        var imdbVal = parseFloat(imdbBlock.find('div').first().text().trim()) || 0;
                        if (kpVal > 0 || imdbVal > 0) {
                            var existing = ratingCache.get('kp_rating', event.object.id) || {};
                            ratingCache.set('kp_rating', event.object.id, {
                                kp: kpVal > 0 ? kpVal : (existing.kp || 0),
                                imdb: imdbVal > 0 ? imdbVal : (existing.imdb || 0),
                                timestamp: Date.now()
                            });
                        }
                    }
                }
                if (render && insertLampaBlock(render)) {
                    if (event.object.method && event.object.id) {
                        var ratingKey = event.object.method + "_" + event.object.id;
                        var cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating > 0) {
                            var rateValue = $(render).find('.rate--lampa .rate-value');
                            var rateIcon = $(render).find('.rate--lampa .rate-icon');
                            rateValue.text(formatRating(cached.rating));
                            if (cached.medianReaction) {
                                var reactionSrc = getReactionImageSrc(cached.medianReaction);
                                rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" data-reaction-type="' + cached.medianReaction + '" src="' + reactionSrc + '">');
                                if (isTriggerOn('animated_reactions', false)) $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                            }
                            colorizeFullCardRatings(render);
                            return;
                        }
                        addToQueue(function () {
                            getLampaRating(ratingKey).then(function (result) {
                                var rateValue = $(render).find('.rate--lampa .rate-value');
                                var rateIcon = $(render).find('.rate--lampa .rate-icon');
                                if (result.rating !== null && result.rating > 0) {
                                    rateValue.text(formatRating(result.rating));
                                    if (result.medianReaction) {
                                        var reactionSrc = getReactionImageSrc(result.medianReaction);
                                        rateIcon.html('<img style="width:1em;height:1em;margin:0 0.2em;" data-reaction-type="' + result.medianReaction + '" src="' + reactionSrc + '">');
                                        if (isTriggerOn('animated_reactions', false)) $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                                    }
                                } else {
                                    $(render).find('.rate--lampa').hide();
                                }
                                colorizeFullCardRatings(render);
                            });
                        });
                    }
                }
                setTimeout(function () { colorizeFullCardRatings(render); }, 100);
            }
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') initPlugin();
        });
    }
})();
