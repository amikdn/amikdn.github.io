(function () {
    'use strict';

    Lampa.Platform.tv();

    var ANIMATED_REACTIONS_BASE_URL = 'https://amikdn.github.io/img';
    var SVG_REACTIONS_BASE_URL = 'https://cubnotrip.top/img/reactions';

    function getRatingColor(value) {
        if (!Lampa.Storage.get('colored_ratings_poster', true)) return '#fff';
        var v = parseFloat(String(value).replace(',', '.'));
        if (isNaN(v) || v <= 0) return '#fff';
        if (v <= 3) return 'red';
        if (v < 6) return 'orange';
        if (v < 8) return 'cornflowerblue';
        return 'lawngreen';
    }

    function formatRating(value) {
        var n = parseFloat(value);
        if (isNaN(n)) return '0.0';
        if (n === 10) return '10';
        return n.toFixed(1);
    }

    function getReactionImageSrc(medianReaction) {
        if (!medianReaction) return '';
        var useAnimated = Lampa.Storage.get('animated_reactions', false);
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
            if (value.kp === 0 && value.imdb === 0 && value.rating === 0 && value.vote_average === 0) return value;
            var cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            value.timestamp = Date.now();
            cache[key] = value;
            Lampa.Storage.set(source, cache);
            return value;
        }
    };

    var taskQueue = [];
    var isProcessing = false;
    var taskInterval = 150;
    var taskBatchSize = 2;
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
    var KP_API_HEADERS = { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' };

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
        if (cached && (cached.kp > 0 || cached.imdb > 0)) {
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
        if (item.kinopoisk_id) {
            addToQueue(function () {
                var request = getRequest();
                request.timeout(8000);
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
                }, false, { headers: KP_API_HEADERS });
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

            request.timeout(8000);
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
                    callback({ kp: kpFromSearch, imdb: imdbFromSearch });
                }

                if (movieId && (kpFromSearch === 0 || imdbFromSearch === 0)) {
                    request.timeout(8000);
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
                        if (kpFromSearch === 0) callback({ kp: 0, imdb: 0 });
                    }, false, { headers: KP_API_HEADERS });
                } else {
                    releaseRequest(request);
                }
            }, function () {
                releaseRequest(request);
                callback({ kp: 0, imdb: 0 });
            }, false, { headers: KP_API_HEADERS });
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
    function getRatingOpacity() {
        var v = parseFloat(Lampa.Storage.get('rating_window_opacity', '100'));
        if (isNaN(v)) return 1;
        v = Math.max(0, Math.min(100, v));
        return v / 100;
    }
    function getRatingPositionCSS(verticalOffsetEm) {
        var pos = Lampa.Storage.get('rating_position', 'top');
        var ox = getRatingOffsetX();
        var oy = getRatingOffsetY();
        var vo = (verticalOffsetEm == null || isNaN(verticalOffsetEm)) ? 0 : verticalOffsetEm;
        var rightVal = (0.3 - ox) + 'em';
        if (pos === 'bottom') {
            return 'right:' + rightVal + ';bottom:' + (0.3 - oy + vo) + 'em;top:auto;left:auto;';
        }
        return 'right:' + rightVal + ';top:' + (0.3 + oy + vo) + 'em;bottom:auto;left:auto;';
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
        var opacity = getRatingOpacity();
        ratingElement.style.cssText = 'line-height:1;font-family:"SegoeUI",sans-serif;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;z-index:1;opacity:' + opacity + ';' + posCSS + 'background:rgba(0,0,0,0.5);color:#fff;padding:0.2em 0.5em;border-radius:0.35em;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;';
        var parent = getRatingParent(card);
        parent.appendChild(ratingElement);
        return ratingElement;
    }

    function createRatingLineElement(card) {
        var line = document.createElement('div');
        line.className = voteClass('card__vote-line');
        var posCSS = getRatingPositionCSS();
        var opacity = getRatingOpacity();
        line.style.cssText = 'line-height:1;font-family:"SegoeUI",sans-serif;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;z-index:1;opacity:' + opacity + ';' + posCSS + 'background:rgba(0,0,0,0.5);color:#fff;padding:0.2em 0.5em;border-radius:0.35em;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;-webkit-align-items:flex-end;align-items:flex-end;';
        line.innerHTML = '<div class="card__rate-item rate--tmdb" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--imdb" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--kp" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--lampa" style="display:none"><span class="rate-value">0.0</span><span class="source--name rate-icon-reaction"></span></div>';
        var parent = getRatingParent(card);
        parent.appendChild(line);
        return line;
    }

    function isRatingSourceVisible(source) {
        var key = 'rating_show_' + source;
        return Lampa.Storage.get(key, true);
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
                        html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + getReactionImageSrc(result.medianReaction) + '">';
                    }
                    el.className = voteClass('rate--lampa');
                    el.innerHTML = html;
                    el.style.display = '';
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
        var step = 1.2;
        for (var i = 0; i < sources.length; i++) {
            var el = createRatingElement(card, i * step);
            el.dataset.rateSource = sources[i];
            el.classList.add('card__vote--separate');
        }
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
            return;
        }
        var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
        var cachedLampa = ratingCache.get('lampa_rating', lampaKey);
        if (cachedLampa && cachedLampa.rating > 0) {
            var color = getRatingColor(cachedLampa.rating);
            var html = '<span style="color:' + color + '">' + formatRating(cachedLampa.rating) + '</span>';
            if (cachedLampa.medianReaction) {
                html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + getReactionImageSrc(cachedLampa.medianReaction) + '">';
            }
            ratingElement.className = voteClass('rate--lampa');
            ratingElement.innerHTML = html;
            return;
        }
        getLampaRating(lampaKey).then(function (result) {
            if (!ratingElement.parentNode || ratingElement.dataset.movieId !== data.id.toString()) return;
            if (result.rating > 0) {
                var color = getRatingColor(result.rating);
                var html = '<span style="color:' + color + '">' + formatRating(result.rating) + '</span>';
                if (result.medianReaction) {
                    html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + getReactionImageSrc(result.medianReaction) + '">';
                }
                ratingElement.className = voteClass('rate--lampa');
                ratingElement.innerHTML = html;
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
        ratingElement.className = voteClass('rate--' + source);
        ratingElement.innerHTML = '';
        ratingElement.style.display = '';
        if (source === 'tmdb') {
            var rating = getTMDBRating(data);
            if (rating !== '0.0') {
                var color = getRatingColor(rating);
                ratingElement.innerHTML = '<span style="color:' + color + '">' + formatRating(rating) + '</span> <span class="source--name"></span>';
            } else {
                showTmdbFallback(ratingElement, data);
            }
        } else if (source === 'lampa') {
            var type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            var ratingKey = type + '_' + data.id;
            var cached = ratingCache.get('lampa_rating', ratingKey);
            if (cached && cached.rating > 0) {
                var color = getRatingColor(cached.rating);
                var html = '<span style="color:' + color + '">' + formatRating(cached.rating) + '</span>';
                if (cached.medianReaction) {
                    var reactionSrc = getReactionImageSrc(cached.medianReaction);
                    html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
                }
                ratingElement.innerHTML = html;
                return;
            }
            addToQueue(function () {
                getLampaRating(ratingKey).then(function (result) {
                    if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                        if (result.rating > 0) {
                            var color = getRatingColor(result.rating);
                            var html = '<span style="color:' + color + '">' + formatRating(result.rating) + '</span>';
                            if (result.medianReaction) {
                                var reactionSrc = getReactionImageSrc(result.medianReaction);
                                html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
                            }
                            ratingElement.innerHTML = html;
                        } else {
                            showTmdbFallback(ratingElement, data);
                        }
                    }
                });
            });
        } else if (source === 'kp' || source === 'imdb') {
            getKinopoiskRating(data, function (res) {
                if (ratingElement.parentNode && ratingElement.dataset.movieId === data.id.toString()) {
                    var val = source === 'kp' ? res.kp : res.imdb;
                    if (val && val > 0) {
                        var text = formatRating(val);
                        var color = getRatingColor(val);
                        ratingElement.innerHTML = '<span style="color:' + color + '">' + text + '</span> <span class="source--name"></span>';
                    } else {
                        showTmdbFallback(ratingElement, data);
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
            var singleEl = card.querySelector('.card__vote:not(.card__vote-line):not(.card__vote--separate)');
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
                                html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + getReactionImageSrc(cached.medianReaction) + '">';
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
        if (!Lampa.Storage.get('colored_ratings_poster', true)) return;
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

    function applyRatingSettingsRefresh() {
        setTimeout(function () {
            if (typeof window.refreshAllRatings === 'function') window.refreshAllRatings();
        }, 100);
    }

    function openRatingSettingsModal() {
        var SOURCE_LABELS = { tmdb: 'TMDB', lampa: 'Lampa', kp: 'КиноПоиск', imdb: 'IMDB', all: 'Все (как на полной карточке)' };
        var POSITION_LABELS = { top: 'Сверху справа', bottom: 'Снизу справа' };
        var DISPLAY_MODE_LABELS = { single: 'Одно окно', separate: 'Каждый в отдельном окне' };
        var list = document.createElement('div');
        list.className = 'menu-edit-list rate-settings-modal';
        list.style.cssText = 'max-width:100%;overflow:hidden;box-sizing:border-box;padding:0.5em 0;';

        function makeRow(label, valueText, onClick) {
            var row = document.createElement('div');
            row.className = 'selector menu-edit-list__item rate-settings-row';
            row.style.cssText = 'display:grid;grid-template-columns:1fr auto;align-items:center;gap:0.5em;padding:0.5em 0.4em;margin-bottom:0.2em;border-radius:0.3em;border:3px solid transparent;box-sizing:border-box;';
            var title = document.createElement('div');
            title.className = 'menu-edit-list__title';
            title.style.cssText = 'min-width:0;overflow:hidden;';
            title.textContent = label;
            var val = document.createElement('div');
            val.className = 'rate-settings-value';
            val.textContent = valueText;
            val.style.cssText = 'white-space:nowrap;opacity:0.9;';
            row.appendChild(title);
            row.appendChild(val);
            if (onClick && typeof onClick === 'function') {
                row.setAttribute('data-action', '1');
                row.addEventListener('click', function () { onClick(row, val); });
                if (typeof $ !== 'undefined') $(row).on('hover:enter', function () { onClick(row, val); });
            }
            return { row: row, updateVal: function (text) { val.textContent = text; } };
        }

        function addSelectRow(label, storageKey, options, defaultVal) {
            var current = Lampa.Storage.get(storageKey, defaultVal);
            var labels = options.labels || options;
            var values = options.values || Object.keys(labels);
            if (typeof labels === 'object' && !Array.isArray(labels)) {
                var arr = [];
                for (var k in labels) arr.push(k);
                values = arr;
            }
            var r = makeRow(label, labels[current] || current, function (rowEl, valEl) {
                if (typeof Lampa.Select !== 'undefined' && Lampa.Select.show) {
                    var items = values.map(function (v) {
                        return { title: labels[v] || v, value: v };
                    });
                    Lampa.Select.show({
                        title: label,
                        items: items,
                        onSelect: function (item) {
                            if (item && item.value != null) {
                                Lampa.Storage.set(storageKey, item.value);
                                valEl.textContent = labels[item.value] || item.value;
                                applyRatingSettingsRefresh();
                            }
                        }
                    });
                }
            });
            r.updateVal(labels[current] || current);
            list.appendChild(r.row);
            return r;
        }

        function addTriggerRow(label, storageKey, defaultVal) {
            var current = Lampa.Storage.get(storageKey, defaultVal);
            var r = makeRow(label, current ? 'Вкл' : 'Выкл', function (rowEl, valEl) {
                var next = !Lampa.Storage.get(storageKey, defaultVal);
                Lampa.Storage.set(storageKey, next);
                valEl.textContent = next ? 'Вкл' : 'Выкл';
                applyRatingSettingsRefresh();
            });
            r.updateVal(current ? 'Вкл' : 'Выкл');
            list.appendChild(r.row);
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
                valEl.textContent = next + (suffix || '');
                applyRatingSettingsRefresh();
            });
            r.updateVal(val + (suffix || ''));
            list.appendChild(r.row);
            return r;
        }

        addSelectRow('Источник рейтинга', 'rating_source', SOURCE_LABELS, 'tmdb');
        addTriggerRow('Анимированные реакции на постерах', 'animated_reactions', false);
        addTriggerRow('Цветные рейтинги на постерах', 'colored_ratings_poster', true);
        addSelectRow('Позиция на постере', 'rating_position', POSITION_LABELS, 'top');
        addNumberRow('Смещение влево‑вправо (em)', 'rating_offset_x', 0, -5, 5, 0.5, ' em');
        addNumberRow('Смещение вверх‑вниз (em)', 'rating_offset_y', 0, -5, 5, 0.5, ' em');
        addTriggerRow('Показывать TMDB (при «Все»)', 'rating_show_tmdb', true);
        addTriggerRow('Показывать IMDB (при «Все»)', 'rating_show_imdb', true);
        addTriggerRow('Показывать КиноПоиск (при «Все»)', 'rating_show_kp', true);
        addTriggerRow('Показывать Lampa (при «Все»)', 'rating_show_lampa', true);
        addSelectRow('Режим отображения (все рейтинги)', 'rating_display_mode', DISPLAY_MODE_LABELS, 'single');
        addNumberRow('Прозрачность окна рейтинга (%)', 'rating_window_opacity', 100, 10, 100, 10, '%');

        if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.open) {
            Lampa.Modal.open({
                title: 'Настройки рейтингов на карточках',
                html: list,
                size: 'medium',
                scroll_to_center: true,
                onBack: function () {
                    if (Lampa.Modal && Lampa.Modal.close) Lampa.Modal.close();
                    applyRatingSettingsRefresh();
                }
            });
        }
    }

    function addSettings() {
        if (!Lampa.SettingsApi) return;
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'rating_modal_open',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Настройки рейтингов на карточках',
                description: 'Открыть окно настроек рейтингов (источник, позиция, смещение, прозрачность и др.)'
            },
            onRender: function (element) {
                setTimeout(function () {
                    var anchor = document.querySelector('div[data-name="interface_size"]');
                    if (anchor && anchor.parentNode && element) {
                        anchor.parentNode.insertBefore(element, anchor.nextSibling);
                    }
                }, 0);
            },
            onChange: function () {
                openRatingSettingsModal();
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
            '.rate-settings-modal .rate-settings-row.focus{border-color:rgba(255,255,255,0.8)}' +
            '.rate-settings-modal .rate-settings-row:hover{background:rgba(255,255,255,0.06)}' +
            '.card .card__view{position:relative!important}' +
            '.card__vote{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center!important;height:auto!important;max-height:none!important;overflow:visible!important;position:absolute!important;z-index:1!important;border-radius:0.35em!important}' +
            '.card__vote--top{top:0.3em!important;right:0.3em!important;bottom:auto!important}' +
            '.card__vote--bottom{top:auto!important;right:0.3em!important;bottom:0.3em!important}' +
            '.card__vote-line .card__rate-item{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;white-space:nowrap;margin-bottom:0.15em}' +
            '.card__vote-line .card__rate-item:last-child{margin-bottom:0}' +
            '.card__vote .source--name{font-size:0;color:transparent;width:16px;height:16px;background-repeat:no-repeat;background-position:center;background-size:contain;margin-left:4px;-webkit-flex-shrink:0;flex-shrink:0}' +
            '@media (min-width:481px){.card__vote .source--name{width:24px;height:24px;margin-left:6px}}' +
            '.rate--kp .source--name{background-image:url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' viewBox=\'0 0 300 300\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cmask id=\'mask0_1_69\' style=\'mask-type:alpha\' maskUnits=\'userSpaceOnUse\' x=\'0\' y=\'0\' width=\'300\' height=\'300\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'white\'/%3E%3C/mask%3E%3Cg mask=\'url(%23mask0_1_69)\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'black\'/%3E%3Cpath d=\'M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z\' fill=\'url(%23paint0_radial_1_69)\'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id=\'paint0_radial_1_69\' cx=\'0\' cy=\'0\' r=\'1\' gradientUnits=\'userSpaceOnUse\' gradientTransform=\'translate(89.9999 45) rotate(45) scale(296.985)\'%3E%3Cstop offset=\'0.5\' stop-color=\'%23FF5500\'/%3E%3Cstop offset=\'1\' stop-color=\'%23BBFF00\'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E")}' +
            '.rate--tmdb .source--name{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 300\' width=\'300\' height=\'300\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0\' y1=\'0\' x2=\'1\' y2=\'0\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2390cea1\'/%3E%3Cstop offset=\'56%25\' stop-color=\'%233cbec9\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%2300b3e5\'/%3E%3C/linearGradient%3E%3Cstyle%3E.text-style%7Bfont-weight:bold;fill:url(%23grad);text-anchor:start;dominant-baseline:middle;textLength:300;lengthAdjust:spacingAndGlyphs;font-size:120px;%7D%3C/style%3E%3C/defs%3E%3Ctext class=\'text-style\' x=\'0\' y=\'150\' textLength=\'300\' lengthAdjust=\'spacingAndGlyphs\'%3ETMDB%3C/text%3E%3C/svg%3E")}' +
            '.rate--lampa .rate-icon-reaction{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23e040fb\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 14h-4v-1h4v1zm0-2h-4v-1h4v1zM9 20h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z\'/%3E%3C/svg%3E")}' +
            '.rate-icon-reaction{background-repeat:no-repeat;background-position:center;background-size:contain}' +
            '.card__vote img[src*=".gif"]{object-fit:contain;-webkit-flex-shrink:0;flex-shrink:0;min-width:1.25em;min-height:1.25em}' +
            '.rate--lampa.rate--lampa--animated .rate-icon img{min-width:1em;min-height:1em;object-fit:contain}' +
            '.rate--imdb .source--name{background-image:url("data:image/svg+xml,%3Csvg fill=\'%23ffcc00\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E%3Cpath d=\'M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z\'/%3E%3C/g%3E%3C/svg%3E")}' +
            '@media (max-width:480px) and (orientation:portrait){.full-start__rate.rate--lampa{min-width:80px}}'
        );
        document.head.appendChild(style);
        addSettings();
        setupCardListener();
        pollCards();

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
                                if (Lampa.Storage.get('animated_reactions', false)) $(render).find('.rate--lampa').addClass('rate--lampa--animated');
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
                                        if (Lampa.Storage.get('animated_reactions', false)) $(render).find('.rate--lampa').addClass('rate--lampa--animated');
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
