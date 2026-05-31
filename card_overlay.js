(function () {
    'use strict';

    var ANIMATED_REACTIONS_BASE_URL = 'https://amikdn.github.io/img';
    var SVG_REACTIONS_BASE_URL = 'https://cubnotrip.top/img/reactions';
    var DETAIL_STAR_SVG = '<svg width="64" height="64" viewBox="10 10 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.4517 11.3659C31.8429 10.7366 32.7589 10.7366 33.1501 11.3659L40.2946 22.8568C40.4323 23.0782 40.651 23.2371 40.9041 23.2996L54.0403 26.5435C54.7598 26.7212 55.0428 27.5923 54.5652 28.1589L45.8445 38.5045C45.6764 38.7039 45.5929 38.961 45.6117 39.221L46.5858 52.7168C46.6392 53.4559 45.8982 53.9942 45.2117 53.7151L32.6776 48.6182C32.4361 48.52 32.1657 48.52 31.9242 48.6182L19.39 53.7151C18.7036 53.9942 17.9626 53.4559 18.016 52.7168L18.9901 39.221C19.0089 38.961 18.9253 38.7039 18.7573 38.5045L10.0366 28.1589C9.559 27.5923 9.84204 26.7212 10.5615 26.5435L23.6977 23.2996C23.9508 23.2371 24.1695 23.0782 24.3072 22.8568L31.4517 11.3659Z" fill="#FFDF6D"/><path fill-rule="evenodd" clip-rule="evenodd" d="M30.6024 10.8379C31.385 9.57926 33.2168 9.57926 33.9994 10.8379L41.1438 22.3288L54.2801 25.5727C55.7189 25.928 56.285 27.6702 55.3298 28.8034L46.6091 39.149L47.5832 52.6448C47.6899 54.123 46.208 55.1997 44.8351 54.6414L32.3009 49.5445L19.7667 54.6414C18.3938 55.1997 16.9118 54.123 17.0185 52.6448L17.9927 39.149L9.272 28.8034C8.3168 27.6702 8.88287 25.928 10.3217 25.5727L23.4579 22.3288L30.6024 10.8379ZM39.4454 23.3848L32.3009 11.8939L25.1564 23.3848C24.8811 23.8276 24.4437 24.1454 23.9374 24.2704L10.8012 27.5144L19.5219 37.86C19.858 38.2587 20.0251 38.7729 19.9875 39.293L19.0134 52.7888L31.5475 47.6919C32.0306 47.4954 32.5712 47.4954 33.0543 47.6919L45.5884 52.7888L44.6143 39.293C44.5767 38.7729 44.7438 38.2587 45.0799 37.86L53.8006 27.5144L40.6643 24.2704C40.1581 24.1454 39.7207 23.8276 39.4454 23.3848Z" fill="black"/></svg>';
    var DETAIL_TMDB_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><defs><linearGradient id="cardOverlayTmdbGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#90cea1"/><stop offset="56%" stop-color="#3cbec9"/><stop offset="100%" stop-color="#00b3e5"/></linearGradient><style>.card-overlay-tmdb-text{font-weight:bold;fill:url(#cardOverlayTmdbGrad);text-anchor:start;dominant-baseline:middle;textLength:150;lengthAdjust:spacingAndGlyphs;font-size:70px;}</style></defs><text class="card-overlay-tmdb-text" x="0" y="50" textLength="150" lengthAdjust="spacingAndGlyphs">TM</text><text class="card-overlay-tmdb-text" x="0" y="120" textLength="150" lengthAdjust="spacingAndGlyphs">DB</text></svg>';
    var DETAIL_IMDB_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88"><g><path fill="#F5C518" d="M18.43,0h86.02c10.18,0,18.43,8.25,18.43,18.43v86.02c0,10.18-8.25,18.43-18.43,18.43H18.43C8.25,122.88,0,114.63,0,104.45l0-86.02C0,8.25,8.25,0,18.43,0z"/><path fill="#000" d="M24.96,78.72V44.16h-9.6v34.56H24.96z M45.36,44.16L43.2,60.24L42,51.6l-1.2-7.44h-12v34.56h8.16v-22.8l3.36,22.8h6l3.12-23.28v23.28h8.16V44.16H45.36z M61.44,78.72V44.16h14.88c3.6,0,6.24,2.64,6.24,6v22.56c0,3.36-2.64,6-6.24,6H61.44z M72.72,50.4l-2.16-0.24v22.56c1.2,0,2.16-0.24,2.4-0.72c0.48-0.48,0.48-1.92,0.48-4.32V54.24v-2.88L72.72,50.4z M100.56,52.8h0.72c3.36,0,6.24,2.64,6.24,6v13.92c0,3.36-2.88,6-6.24,6h-0.72c-1.92,0-3.84-0.96-5.04-2.64l-0.48,2.16H86.4V44.16h9.12V55.2C96.72,53.76,98.64,52.8,100.56,52.8z M98.64,69.6v-8.16L98.4,58.8c-0.24-0.48-0.96-0.72-1.44-0.72c-0.48,0-1.2,0.24-1.44,0.72v13.68c0.24,0.48,0.96,0.72,1.44,0.72c0.48,0,1.44-0.24,1.44-0.72L98.64,69.6z"/></g></svg>';
    var DETAIL_KP_SVG = '<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="cardOverlayKpMask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><circle cx="150" cy="150" r="150" fill="white"/></mask><g mask="url(#cardOverlayKpMask)"><circle cx="150" cy="150" r="150" fill="black"/><path d="M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z" fill="url(#cardOverlayKpGradient)"/></g><defs><radialGradient id="cardOverlayKpGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(89.9999 45) rotate(45) scale(296.985)"><stop offset="0.5" stop-color="#FF5500"/><stop offset="1" stop-color="#BBFF00"/></radialGradient></defs></svg>';
    var KP_API_URL = 'https://kinopoiskapiunofficial.tech/';
    var QUALITY_CACHE_KEY = 'qualview_quality_cache';
    var QUALITY_API_DOMAIN = 'jr.maxvol.pro';
    var ALLOHA_API_SERVERS = [
        { url: 'https://api.apbugall.org', token: '8da1c9beda9545174264dc9f63a77d' },
        { url: 'https://upn.stull.xyz', token: 'd317441359e505c343c2063edc97e7' }
    ];
    var CACHE_TTL = 24 * 60 * 60 * 1000;
    var TMDB_DETAIL_RETRY_TTL = CACHE_TTL;
    var CARD_OVERLAY_CACHE_VERSION = '3';

    function isTriggerOn(key, def) {
        var v = Lampa.Storage.get(key, def);
        return (v === true || v === 'true' || v === '1' || v === 1);
    }
    function getOverlayAlpha() {
        var v = parseFloat(Lampa.Storage.get('rating_window_opacity', '40'));
        if (isNaN(v)) v = 40;
        v = Math.max(0, Math.min(100, v));
        return 1 - (v / 100);
    }
    function isColoredRatingsPosterOn() {
        return isTriggerOn('colored_ratings_poster', false);
    }
    function setColoredRatingsPoster(on) {
        Lampa.Storage.set('colored_ratings_poster', on ? 'true' : 'false');
    }
    function isQualityShowOn() {
        return isTriggerOn('quality_show', true);
    }
    function isQualityColoredOn() {
        return isTriggerOn('quality_colored', false);
    }
    function isTypeLabelsShowOn() {
        return isTriggerOn('type_labels_show', true);
    }
    function isTypeLabelsColoredOn() {
        return isTriggerOn('type_labels_colored', false);
    }
    function isDetailRatingIconsOn() {
        return isTriggerOn('detail_rating_icons', true);
    }
    function getRatingColor(value) {
        if (isTriggerOn('rating_colored_windows', false)) return '#fff';
        if (!isColoredRatingsPosterOn()) return '#fff';
        var v = parseFloat(String(value).replace(',', '.'));
        if (isNaN(v) || v <= 0) return '#fff';
        if (v <= 3) return 'rgba(231,76,60,0.8)';
        if (v < 6) return 'rgba(243,156,18,0.8)';
        if (v < 8) return 'rgba(52,152,219,0.8)';
        return 'rgba(46,204,113,0.8)';
    }
    function getRatingBackgroundColor(value) {
        if (!isTriggerOn('rating_colored_windows', false)) return '';
        var alpha = getOverlayAlpha();
        var v = parseFloat(String(value).replace(',', '.'));
        if (isNaN(v) || v <= 0) return 'rgba(0,0,0,' + alpha + ')';
        if (v <= 3) return 'rgba(231,76,60,' + alpha + ')';
        if (v < 6) return 'rgba(243,156,18,' + alpha + ')';
        if (v < 8) return 'rgba(52,152,219,' + alpha + ')';
        return 'rgba(46,204,113,' + alpha + ')';
    }
    function getYearPositionCSS() {
        var pos = Lampa.Storage.get('rating_position', 'bottom');
        if (pos === 'bottom') return 'right:0!important;top:0!important;bottom:auto!important;left:auto!important;border-radius:0 0.75em!important;';
        return 'right:0!important;bottom:0!important;top:auto!important;left:auto!important;border-radius:0.75em 0!important;';
    }
    function addYearBadge(card) {
        if (!card || !card.querySelector) return;
        var view = card.querySelector('.card__view');
        var age = card.querySelector('.card__age');
        if (!view || !age) return;
        if (age.parentNode !== view) view.appendChild(age);
        age.classList.add('card__year-badge');
        age.style.cssText = 'position:absolute;line-height:1;box-sizing:border-box;user-select:none;padding:0.25em 0.45em;background:rgba(0,0,0,' + getOverlayAlpha() + ');color:#fff;font-size:1.1em;white-space:nowrap;margin-top:0;' + getYearPositionCSS();
    }
    function refreshAllYearBadges() {
        var allCards = document.querySelectorAll('.card');
        for (var i = 0; i < allCards.length; i++) addYearBadge(allCards[i]);
    }

    function getQualityBackground(quality) {
        var alpha = getOverlayAlpha();
        if (!isQualityColoredOn()) return 'rgba(0,0,0,' + alpha + ')';
        switch (quality) {
            case '4K': return 'rgba(46,204,113,' + alpha + ')';
            case 'FHD': return 'rgba(52,152,219,' + alpha + ')';
            case 'HD': return 'rgba(243,156,18,' + alpha + ')';
            case 'SD': return 'rgba(231,76,60,' + alpha + ')';
            case 'TS': return 'rgba(180,0,0,' + alpha + ')';
            default: return 'rgba(0,0,0,' + alpha + ')';
        }
    }
    function getDetailQualityColor(quality) {
        if (!isColoredElementsOn()) return null;
        switch (quality) {
            case '4K': return { bg: 'rgba(46,204,113,0.8)', text: 'white' };
            case 'FHD': return { bg: 'rgba(52,152,219,0.8)', text: 'white' };
            case 'HD': return { bg: 'rgba(243,156,18,0.8)', text: 'white' };
            case 'SD': return { bg: 'rgba(231,76,60,0.8)', text: 'white' };
            case 'TS': return { bg: 'rgba(180,0,0,0.8)', text: 'white' };
            default: return null;
        }
    }
    function getTypeLabelBackground(isTV) {
        var alpha = getOverlayAlpha();
        if (isTypeLabelsColoredOn()) {
            return isTV ? 'rgba(52,152,219,' + alpha + ')' : 'rgba(46,204,113,' + alpha + ')';
        }
        return 'rgba(0,0,0,' + alpha + ')';
    }
    function formatRating(value) {
        var n = parseFloat(value);
        if (isNaN(n)) return '0.0';
        if (n === 10) return '10';
        return n.toFixed(1);
    }
    function getReactionImageSrc(medianReaction, forDetail) {
        if (!medianReaction) return '';
        var animated = forDetail ? isTriggerOn('lampa_rating_animated', false) : isTriggerOn('animated_reactions', false);
        if (animated) return ANIMATED_REACTIONS_BASE_URL + '/reaction-' + medianReaction + '.gif';
        return SVG_REACTIONS_BASE_URL + '/' + medianReaction + '.svg';
    }

    var ratingCache = {
        caches: {},
        get: function (source, key) {
            var cache = this.caches[source] || (this.caches[source] = loadPersistentCache(source));
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
            var cache = this.caches[source] || (this.caches[source] = loadPersistentCache(source));
            value.timestamp = Date.now();
            var isEmpty = ((!value.kp || value.kp === 0) && (!value.imdb || value.imdb === 0) && (!value.rating || value.rating === 0) && (!value.vote_average || value.vote_average === 0));
            if (isEmpty) value._empty = true;
            cache[key] = value;
            debouncedSave(source, cache);
            return value;
        }
    };
    function getPersistentCacheKey(source) {
        return 'rating_cache_' + source;
    }
    function loadPersistentCache(source) {
        var stored = null;
        try { stored = Lampa.Storage.get(getPersistentCacheKey(source), null); } catch (e) {}
        if (stored && typeof stored === 'object') return stored;
        try { stored = Lampa.Storage.cache(source, 500, {}); } catch (e2) { stored = null; }
        return stored && typeof stored === 'object' ? stored : {};
    }
    var _savePending = {};
    var _saveVersion = {};
    function debouncedSave(source, cache) {
        if (_savePending[source]) return;
        _savePending[source] = true;
        var version = _saveVersion[source] || 0;
        setTimeout(function () {
            _savePending[source] = false;
            if (version !== (_saveVersion[source] || 0)) return;
            try { Lampa.Storage.set(getPersistentCacheKey(source), cache); } catch (e) {}
        }, 2000);
    }

    function resetCacheSaveState(source) {
        _saveVersion[source] = (_saveVersion[source] || 0) + 1;
        _savePending[source] = false;
    }
    function clearStorageObject(key) {
        try { Lampa.Storage.set(key, {}); } catch (e) {}
    }
    function clearRatingCaches(includeQuality) {
        var sources = ['tmdb_rating', 'kp_rating', 'lampa_rating'];
        for (var i = 0; i < sources.length; i++) {
            resetCacheSaveState(sources[i]);
            clearStorageObject(getPersistentCacheKey(sources[i]));
            clearStorageObject(sources[i]);
        }
        clearStorageObject('rating_cache_kp_ratings');
        clearStorageObject('kp_ratings');
        ratingCache.caches = {};
        if (typeof pendingTmdbRequests !== 'undefined') pendingTmdbRequests = {};
        if (typeof pendingLampaRequests !== 'undefined') pendingLampaRequests = {};
        if (includeQuality) clearStorageObject(QUALITY_CACHE_KEY);
    }

    var taskQueue = [];
    var isProcessing = false;
    var taskInterval = 350;
    var taskBatchSize = 1;
    var requestPool = [];
    function getRequest() { return requestPool.pop() || new Lampa.Reguest(); }
    function releaseRequest(request) { request.clear(); if (requestPool.length < 5) requestPool.push(request); }
    function processQueue() {
        if (isProcessing || !taskQueue.length) return;
        isProcessing = true;
        var batch = taskQueue.splice(0, taskBatchSize);
        for (var i = 0; i < batch.length; i++) { batch[i].execute(); }
        setTimeout(function () { isProcessing = false; processQueue(); }, taskInterval);
    }
    function addToQueue(task) {
        if (taskQueue.length > 20) taskQueue.splice(10);
        taskQueue.push({ execute: task });
        processQueue();
    }

    var stringCache = {};
    function normalizeString(str) {
        if (stringCache[str]) return stringCache[str];
        var normalized = str.replace(/[\s.,:;''`!?]+/g, ' ').trim().toLowerCase().replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-').replace(/ё/g, 'е');
        stringCache[str] = normalized;
        return normalized;
    }
    function cleanString(str) {
        return normalizeString(str).replace(/^[ \/\\]+/, '').replace(/[ \/\\]+$/, '').replace(/\+( *[+\/\\])+/g, '+').replace(/([+\/\\] *)+\+/g, '+').replace(/( *[\/\\]+ *)+/g, '+');
    }
    function matchStrings(str1, str2) { return typeof str1 === 'string' && typeof str2 === 'string' && normalizeString(str1) === normalizeString(str2); }
    function containsString(str1, str2) { return typeof str1 === 'string' && typeof str2 === 'string' && normalizeString(str1).indexOf(normalizeString(str2)) !== -1; }

    function getKpApiKey() { var k = Lampa.Storage.get('rating_kp_api_key', '') || Lampa.Storage.get('source_api_key', ''); return String(k || '').trim(); }
    function canUseKinopoiskApi() { return getKpApiKey().length > 0; }
    function getKpHeaders() { var k = getKpApiKey(); if (!k) return {}; return { 'X-API-KEY': k }; }
    function cacheEmptyKpRating(itemId) { return ratingCache.set('kp_rating', itemId, { kp: 0, imdb: 0 }); }
    function findBestKpMatch(results, title, originalTitle, releaseYear) {
        if (!results || !results.length) return null;
        results.forEach(function (r) { r.tmp_year = parseInt(String(r.year || r.start_date || "0000").slice(0, 4)); });
        var filtered = results;
        if (originalTitle) {
            var matched = results.filter(function (r) { return containsString(r.orig_title || r.nameEn, originalTitle) || containsString(r.en_title || r.nameOriginal, originalTitle) || containsString(r.title || r.nameRu || r.name, originalTitle); });
            if (matched.length) filtered = matched;
        }
        if (filtered.length > 1 && releaseYear) {
            var yearMatch = filtered.filter(function (r) { return r.tmp_year == releaseYear; });
            if (!yearMatch.length) { yearMatch = filtered.filter(function (r) { return r.tmp_year && r.tmp_year > releaseYear - 2 && r.tmp_year < releaseYear + 2; }); }
            if (yearMatch.length) filtered = yearMatch;
        }
        return filtered[0] || null;
    }
    function getKinopoiskRating(item, callback) {
        if (item.kp_rating > 0 || item.imdb_rating > 0) { callback(ratingCache.set('kp_rating', item.id, { kp: parseFloat(item.kp_rating) || 0, imdb: parseFloat(item.imdb_rating) || 0, timestamp: Date.now() })); return; }
        if (item.ratingKinopoisk > 0 || item.ratingImdb > 0) { callback(ratingCache.set('kp_rating', item.id, { kp: parseFloat(item.ratingKinopoisk) || 0, imdb: parseFloat(item.ratingImdb) || 0, timestamp: Date.now() })); return; }
        var cached = ratingCache.get('kp_rating', item.id);
        if (cached) { callback(cached); return; }
        try {
            var otherCache = Lampa.Storage.cache('kp_rating', 500, {});
            var otherData = otherCache[item.id];
            if (otherData && (otherData.kp > 0 || otherData.imdb > 0)) { callback(ratingCache.set('kp_rating', item.id, { kp: parseFloat(otherData.kp) || 0, imdb: parseFloat(otherData.imdb) || 0, timestamp: Date.now() })); return; }
        } catch (e) {}
        if (!canUseKinopoiskApi()) { callback(cacheEmptyKpRating(item.id)); return; }
        if (item.kinopoisk_id) {
            addToQueue(function () {
                var request = getRequest(); request.timeout(5000);
                request.silent(KP_API_URL + 'api/v2.2/films/' + item.kinopoisk_id, function (data) {
                    callback(ratingCache.set('kp_rating', item.id, { kp: parseFloat(data.ratingKinopoisk) || 0, imdb: parseFloat(data.ratingImdb) || 0, timestamp: Date.now() }));
                    releaseRequest(request);
                }, function () { releaseRequest(request); callback(cacheEmptyKpRating(item.id)); }, false, { headers: getKpHeaders() });
            }); return;
        }
        if (!(item.title || item.name) && !item.imdb_id) { callback(cacheEmptyKpRating(item.id)); return; }
        addToQueue(function () {
            var request = getRequest();
            var title = cleanString(item.title || item.name || '');
            var releaseYear = parseInt(String(item.release_date || item.first_air_date || item.last_air_date || "0000").slice(0, 4));
            var originalTitle = item.original_title || item.original_name;
            var searchUrl = item.imdb_id ? KP_API_URL + 'api/v2.2/films?imdbId=' + encodeURIComponent(item.imdb_id) : KP_API_URL + 'api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(title);
            request.timeout(5000);
            request.silent(searchUrl, function (data) {
                var results = data.films || data.items || [];
                if (!results.length && data && (data.kinopoiskId || data.filmId)) results = [data];
                var best = findBestKpMatch(results, title, originalTitle, releaseYear);
                if (!best) { releaseRequest(request); callback(cacheEmptyKpRating(item.id)); return; }
                var kpFromSearch = parseFloat(best.rating || best.ratingKinopoisk) || 0;
                var imdbFromSearch = parseFloat(best.ratingImdb) || 0;
                var movieId = best.kinopoiskId || best.filmId || best.kp_id || best.kinopoisk_id;
                if (kpFromSearch > 0) ratingCache.set('kp_rating', item.id, { kp: kpFromSearch, imdb: imdbFromSearch, timestamp: Date.now() });
                if (movieId && (kpFromSearch === 0 || imdbFromSearch === 0)) {
                    if (kpFromSearch > 0) callback({ kp: kpFromSearch, imdb: imdbFromSearch });
                    request.timeout(5000);
                    request.silent(KP_API_URL + 'api/v2.2/films/' + movieId, function (detail) {
                        var fullKp = parseFloat(detail.ratingKinopoisk) || 0;
                        var fullImdb = parseFloat(detail.ratingImdb) || 0;
                        callback(ratingCache.set('kp_rating', item.id, { kp: fullKp > 0 ? fullKp : kpFromSearch, imdb: fullImdb > 0 ? fullImdb : imdbFromSearch, timestamp: Date.now() }));
                        releaseRequest(request);
                    }, function () { releaseRequest(request); callback(ratingCache.set('kp_rating', item.id, { kp: kpFromSearch, imdb: imdbFromSearch, timestamp: Date.now() })); }, false, { headers: getKpHeaders() });
                } else {
                    releaseRequest(request);
                    callback(ratingCache.set('kp_rating', item.id, { kp: kpFromSearch, imdb: imdbFromSearch, timestamp: Date.now() }));
                }
            }, function () { releaseRequest(request); callback(cacheEmptyKpRating(item.id)); }, false, { headers: getKpHeaders() });
        });
    }

    function calculateLampaRating10(reactions) {
        var weightedSum = 0, totalCount = 0, reactionCnt = {}, reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };
        for (var i = 0; i < reactions.length; i++) { var item = reactions[i]; var count = parseInt(item.counter, 10) || 0; var coef = reactionCoef[item.type] || 0; weightedSum += count * coef; totalCount += count; reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count; }
        if (totalCount === 0) return { rating: 0, medianReaction: '' };
        var avgRating = weightedSum / totalCount;
        var rating10 = (avgRating - 1) * 2.5;
        var finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
        var medianReaction = '', medianIndex = Math.ceil(totalCount / 2.0);
        var keys = Object.keys(reactionCoef);
        var sortedReactions = keys.sort(function (a, b) { return reactionCoef[a] - reactionCoef[b]; });
        var cumulativeCount = 0;
        while (sortedReactions.length && cumulativeCount < medianIndex) { medianReaction = sortedReactions.pop(); cumulativeCount += (reactionCnt[medianReaction] || 0); }
        return { rating: finalRating, medianReaction: medianReaction };
    }
    function fetchLampaRating(ratingKey) {
        return new Promise(function (resolve) {
            var request = getRequest(); request.timeout(10000);
            request.silent("https://cubnotrip.top/api/reactions/get/" + ratingKey, function (data) {
                try { resolve(data && data.result && Array.isArray(data.result) ? calculateLampaRating10(data.result) : { rating: 0, medianReaction: '' }); } catch (e) { resolve({ rating: 0, medianReaction: '' }); }
                finally { releaseRequest(request); }
            }, function () { releaseRequest(request); resolve({ rating: 0, medianReaction: '' }); }, false);
        });
    }
    var pendingLampaRequests = {};
    function getLampaRating(ratingKey) {
        var cached = ratingCache.get('lampa_rating', ratingKey);
        if (cached) return Promise.resolve(cached);
        if (pendingLampaRequests[ratingKey]) return pendingLampaRequests[ratingKey];
        pendingLampaRequests[ratingKey] = fetchLampaRating(ratingKey).then(function (result) { return ratingCache.set('lampa_rating', ratingKey, result); }).catch(function () { return { rating: 0, medianReaction: '' }; }).then(function (result) { delete pendingLampaRequests[ratingKey]; return result; }, function (error) { delete pendingLampaRequests[ratingKey]; throw error; });
        return pendingLampaRequests[ratingKey];
    }
    function renderLampaPosterIcon(target, medianReaction) {
        if (!target) return;
        var icon = target.querySelector('.rate-icon-reaction');
        if (!icon) {
            icon = document.createElement('span');
            icon.className = 'source--name rate-icon-reaction';
            target.appendChild(icon);
        }
        icon.style.backgroundImage = medianReaction ? 'url(' + getReactionImageSrc(medianReaction) + ')' : '';
    }
    function renderLampaFullIcon($scope, medianReaction) {
        var icon = $scope.find('.rate--lampa .rate-icon');
        if (!icon.length) return;
        if (medianReaction) icon.attr('data-median-reaction', medianReaction);
        if (!isTriggerOn('lampa_rating_icon', true)) { icon.empty().hide(); return; }
        icon.show();
        var reaction = medianReaction || icon.attr('data-median-reaction');
        if (reaction) icon.html('<img style="width:1em;height:1em;margin:0 0.15em;object-fit:contain;" data-reaction-type="' + reaction + '" src="' + getReactionImageSrc(reaction, true) + '">');
        else icon.empty();
    }
    var pendingTmdbRequests = {};
    function getTmdbMediaType(data) {
        if (!data) return null;
        var mt = data.media_type || data.type || data.method;
        if (mt === 'movie' || mt === 'tv') return mt;
        if (mt === 'person' || mt === 'collection') return null;
        if (data.number_of_seasons || data.seasons || data.first_air_date || data.last_air_date || data.name || data.original_name) return 'tv';
        if (data.title || data.original_title || data.release_date) return 'movie';
        return null;
    }
    function getTmdbId(data) {
        if (!data) return 0;
        var source = data.source || 'tmdb';
        var id = (source !== 'tmdb' && source !== 'cub' && data.tmdb_id) ? data.tmdb_id : (data.id || data.tmdb_id);
        id = parseInt(id, 10);
        return isNaN(id) ? 0 : id;
    }
    function getTmdbRatingKey(data) {
        var type = getTmdbMediaType(data);
        var id = getTmdbId(data);
        if (!type || !id) return null;
        return type + '_' + id;
    }
    function getTmdbVoteAverage(data) {
        var rating = parseFloat(data && data.vote_average);
        return rating > 0 ? rating : 0;
    }
    function storeTmdbRating(data, rating, isDetail, voteCount) {
        var key = getTmdbRatingKey(data);
        rating = parseFloat(rating) || 0;
        if (!key || rating <= 0) return null;
        data.vote_average = rating;
        if (voteCount != null) data.vote_count = voteCount;
        return ratingCache.set('tmdb_rating', key, { vote_average: rating, vote_count: parseInt(voteCount, 10) || 0, detail: !!isDetail, detail_checked: isDetail ? Date.now() : 0 });
    }
    function markTmdbDetailAttempt(data, cached) {
        var key = getTmdbRatingKey(data);
        if (!key) return cached || null;
        var rating = (cached && parseFloat(cached.vote_average)) || getTmdbVoteAverage(data) || 0;
        var voteCount = (cached && parseInt(cached.vote_count, 10)) || parseInt(data && data.vote_count, 10) || 0;
        return ratingCache.set('tmdb_rating', key, { vote_average: rating, vote_count: voteCount, detail: false, detail_checked: Date.now(), failed: true });
    }
    function getTMDBRating(data) {
        var ratingKey = getTmdbRatingKey(data);
        var cached = ratingKey ? ratingCache.get('tmdb_rating', ratingKey) : null;
        if (cached && cached.vote_average > 0) return cached.vote_average.toFixed(1);
        var rating = getTmdbVoteAverage(data);
        if (ratingKey && rating > 0) ratingCache.set('tmdb_rating', ratingKey, { vote_average: rating, vote_count: parseInt(data.vote_count, 10) || 0, detail: false });
        return rating > 0 ? rating.toFixed(1) : '0.0';
    }
    function buildTmdbApiUrl(type, id) {
        if (typeof Lampa !== 'undefined' && Lampa.TMDB && Lampa.TMDB.api && Lampa.TMDB.key) return Lampa.TMDB.api(type + '/' + id + '?api_key=' + Lampa.TMDB.key());
        return '';
    }
    function refreshTMDBRating(data, callback, force) {
        var type = getTmdbMediaType(data);
        var id = getTmdbId(data);
        var key = getTmdbRatingKey(data);
        if (!type || !id || !key) { if (callback) callback(null); return; }
        var cached = ratingCache.get('tmdb_rating', key);
        if (!force && cached && cached.detail && cached.vote_average > 0) { if (callback) callback(cached); return; }
        if (!force && cached && cached.detail_checked && (Date.now() - cached.detail_checked < TMDB_DETAIL_RETRY_TTL)) { if (callback) callback(cached); return; }
        if (pendingTmdbRequests[key]) { if (callback) pendingTmdbRequests[key].push(callback); return; }
        pendingTmdbRequests[key] = callback ? [callback] : [];
        addToQueue(function () {
            function complete(result) {
                var callbacks = pendingTmdbRequests[key] || [];
                delete pendingTmdbRequests[key];
                for (var i = 0; i < callbacks.length; i++) {
                    try { callbacks[i](result); } catch (e) {}
                }
            }
            function handleDetail(detail) {
                var rating = getTmdbVoteAverage(detail);
                if (rating > 0) complete(storeTmdbRating(data, rating, true, detail.vote_count));
                else complete(cached || null);
            }
            function handleFail() {
                complete(markTmdbDetailAttempt(data, cached));
            }
            var url = buildTmdbApiUrl(type, id);
            if (url) {
                var request = getRequest();
                request.timeout(6000);
                request.silent(url, function (detail) { releaseRequest(request); handleDetail(detail || {}); }, function () {
                    releaseRequest(request);
                    try {
                        if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.get) {
                            Lampa.Api.sources.tmdb.get(type + '/' + id, {}, function (detail2) { handleDetail(detail2 || {}); }, handleFail);
                            return;
                        }
                    } catch (e) {}
                    handleFail();
                }, false);
                return;
            }
            try {
                if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.get) {
                    Lampa.Api.sources.tmdb.get(type + '/' + id, {}, function (detail) { handleDetail(detail || {}); }, handleFail);
                    return;
                }
            } catch (e) {}
            handleFail();
        });
    }
    function ensureFreshTMDBRating(data, onUpdated) {
        var key = getTmdbRatingKey(data);
        if (!key) return;
        var cached = ratingCache.get('tmdb_rating', key);
        if (cached && cached.detail && cached.vote_average > 0) return;
        if (cached && cached.detail_checked && (Date.now() - cached.detail_checked < TMDB_DETAIL_RETRY_TTL)) return;
        refreshTMDBRating(data, function (result) { if (result && result.vote_average > 0 && onUpdated) onUpdated(result); }, false);
    }

    function getRatingPositionCSS() {
        var pos = Lampa.Storage.get('rating_position', 'bottom');
        if (pos === 'bottom') return 'right:0!important;bottom:0!important;top:auto!important;left:auto!important;';
        return 'right:0!important;top:0!important;bottom:auto!important;left:auto!important;';
    }
    function voteClass(extra) {
        var pos = Lampa.Storage.get('rating_position', 'bottom');
        return 'card__vote card__vote--' + pos + (extra ? ' ' + extra : '');
    }
    function getRatingParent(card) {
        var parent = card.querySelector && card.querySelector('.card__view');
        if (!parent) parent = card;
        parent.setAttribute('data-rate-anchor', '1');
        parent.style.position = 'relative';
        return parent;
    }
    function isRatingSourceVisible(source) {
        var v = Lampa.Storage.get('rating_show_' + source, '1');
        return !(v === false || v === 'false' || v === 0 || v === '0' || v === '' || v === null || v === undefined);
    }

    function isAnyKinopoiskSourceVisible() {
        return isRatingSourceVisible('kp') || isRatingSourceVisible('imdb');
    }
    function createRatingElement(card) {
        var ratingElement = document.createElement('div');
        ratingElement.className = voteClass();
        var posCSS = getRatingPositionCSS();
        var bgAlpha = getOverlayAlpha();
        ratingElement.style.cssText = 'line-height:1;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;' + posCSS + 'background:rgba(0,0,0,' + bgAlpha + ');color:#fff;padding:0.2em 0.45em;';
        getRatingParent(card).appendChild(ratingElement);
        return ratingElement;
    }
    function createRatingInnerBlock() {
        var el = document.createElement('div');
        el.className = voteClass();
        var bgAlpha = getOverlayAlpha();
        el.style.cssText = 'line-height:1;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;background:rgba(0,0,0,' + bgAlpha + ');color:#fff;padding:0.2em 0.45em;';
        return el;
    }
    function createRatingLineElement(card) {
        var line = document.createElement('div');
        line.className = voteClass('card__vote-line');
        var posCSS = getRatingPositionCSS();
        var bgAlpha = getOverlayAlpha();
        line.style.cssText = 'line-height:1;cursor:pointer;box-sizing:border-box;outline:none;user-select:none;position:absolute;' + posCSS + 'background:rgba(0,0,0,' + bgAlpha + ');color:#fff;padding:0.2em 0.45em;';
        line.innerHTML = '<div class="card__rate-item rate--tmdb" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--imdb" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--kp" style="display:none"><div>0.0</div><span class="source--name"></span></div><div class="card__rate-item rate--lampa" style="display:none"><span class="rate-value">0.0</span><span class="source--name rate-icon-reaction"></span></div>';
        getRatingParent(card).appendChild(line);
        return line;
    }

    function updateCardRatingLine(ratingLine, data) {
        if (!ratingLine || !ratingLine.parentNode) return;
        var idStr = data.id.toString();
        if (ratingLine.dataset.movieId !== idStr) return;
        var tmdbItem, imdbItem, kpItem, lampaItem;
        try {
            tmdbItem = ratingLine.querySelector('.rate--tmdb');
            if (tmdbItem) {
                var tmdbRating = getTMDBRating(data);
                var tmdbDiv = tmdbItem.querySelector('div');
                if (tmdbDiv) { tmdbDiv.textContent = formatRating(tmdbRating); tmdbDiv.style.color = getRatingColor(tmdbRating); }
                tmdbItem.style.display = (tmdbRating !== '0.0') && isRatingSourceVisible('tmdb') ? '' : 'none';
            }
        } catch (e) {}
        try {
            var kpFromData = (data.kp_rating != null ? data.kp_rating : (data.ratingKinopoisk != null ? data.ratingKinopoisk : 0));
            var imdbFromData = (data.imdb_rating != null ? data.imdb_rating : (data.ratingImdb != null ? data.ratingImdb : 0));
            var cachedKp = ratingCache.get('kp_rating', data.id);
            var kpVal = (kpFromData > 0 ? kpFromData : (cachedKp && cachedKp.kp)) || 0;
            var imdbVal = (imdbFromData > 0 ? imdbFromData : (cachedKp && cachedKp.imdb)) || 0;
            imdbItem = ratingLine.querySelector('.rate--imdb');
            if (imdbItem) {
                var imdbDiv = imdbItem.querySelector('div');
                var imdbText = imdbVal ? formatRating(imdbVal) : '0.0';
                if (imdbDiv) { imdbDiv.textContent = imdbText; imdbDiv.style.color = getRatingColor(imdbText); }
                imdbItem.style.display = (imdbVal > 0) && isRatingSourceVisible('imdb') ? '' : 'none';
            }
            kpItem = ratingLine.querySelector('.rate--kp');
            if (kpItem) {
                var kpDiv = kpItem.querySelector('div');
                var kpText = kpVal ? formatRating(kpVal) : '0.0';
                if (kpDiv) { kpDiv.textContent = kpText; kpDiv.style.color = getRatingColor(kpText); }
                kpItem.style.display = (kpVal > 0) && isRatingSourceVisible('kp') ? '' : 'none';
            }
        } catch (e) {}
        try {
            var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
            var cachedLampa = ratingCache.get('lampa_rating', lampaKey);
            lampaItem = ratingLine.querySelector('.rate--lampa');
            if (lampaItem) {
                var lampaValEl = lampaItem.querySelector('.rate-value');
                var lampaReactionIcon = lampaItem.querySelector('.rate-icon-reaction');
                var hasLampa = cachedLampa && cachedLampa.rating > 0;
                var lampaText = hasLampa ? formatRating(cachedLampa.rating) : '0.0';
                if (lampaValEl) { lampaValEl.textContent = lampaText; lampaValEl.style.color = getRatingColor(lampaText); }
                if (lampaReactionIcon) lampaReactionIcon.style.backgroundImage = (hasLampa && cachedLampa.medianReaction) ? 'url(' + getReactionImageSrc(cachedLampa.medianReaction) + ')' : '';
                lampaItem.style.display = hasLampa && isRatingSourceVisible('lampa') ? '' : 'none';
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
        ratingLine.style.background = getRatingBackgroundColor(firstRating || '0') || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
        var anyVisible = (tmdbItem && tmdbItem.style.display !== 'none') || (imdbItem && imdbItem.style.display !== 'none') || (kpItem && kpItem.style.display !== 'none') || (lampaItem && lampaItem.style.display !== 'none');
        ratingLine.style.display = anyVisible ? '' : 'none';
    }

    function getRatingDisplayMode() { return Lampa.Storage.get('rating_display_mode', 'separate'); }

    function fillSingleRatingElement(el, data, rateSource) {
        if (!el || !data || !rateSource) return;
        var idStr = data.id.toString();
        if (el.dataset.movieId !== idStr) return;
        el.classList.add('card__vote--separate');
        function refreshBR() { var c = el.closest('.card'); if (c) fixSeparateBorderRadius(c); }
        if (rateSource === 'tmdb') {
            var rating = getTMDBRating(data);
            if (rating !== '0.0') {
                el.className = voteClass('rate--tmdb card__vote--separate');
                el.innerHTML = '<span style="color:' + getRatingColor(rating) + '">' + formatRating(rating) + '</span><span class="source--name"></span>';
                el.style.display = ''; el.classList.remove('card__vote--hidden');
                el.style.background = getRatingBackgroundColor(rating) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
            } else { el.classList.add('card__vote--hidden'); }
            refreshBR(); return;
        }
        if (rateSource === 'imdb' || rateSource === 'kp') {
            getKinopoiskRating(data, function (res) {
                if (!el.parentNode || el.dataset.movieId !== idStr) return;
                var val = rateSource === 'kp' ? res.kp : res.imdb;
                if (val && val > 0) {
                    el.className = voteClass('rate--' + rateSource + ' card__vote--separate');
                    el.innerHTML = '<span style="color:' + getRatingColor(val) + '">' + formatRating(val) + '</span><span class="source--name"></span>';
                    el.style.display = ''; el.classList.remove('card__vote--hidden');
                    el.style.background = getRatingBackgroundColor(val) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
                } else { el.classList.add('card__vote--hidden'); }
                refreshBR();
            }); return;
        }
        if (rateSource === 'lampa') {
            var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
            getLampaRating(lampaKey).then(function (result) {
                if (!el.parentNode || el.dataset.movieId !== idStr) return;
                if (result.rating > 0) {
                    el.className = voteClass('rate--lampa card__vote--separate');
                    el.innerHTML = '<span style="color:' + getRatingColor(result.rating) + '">' + formatRating(result.rating) + '</span>';
                    renderLampaPosterIcon(el, result.medianReaction);
                    el.style.display = ''; el.classList.remove('card__vote--hidden');
                    el.style.background = getRatingBackgroundColor(result.rating) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
                } else { el.classList.add('card__vote--hidden'); }
                refreshBR();
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
        var posCSS = getRatingPositionCSS();
        wrapper.style.cssText = 'position:absolute;box-sizing:border-box;' + posCSS;
        for (var i = 0; i < sources.length; i++) {
            var el = createRatingInnerBlock();
            el.dataset.rateSource = sources[i];
            el.classList.add('card__vote--separate', 'card__vote--hidden');
            wrapper.appendChild(el);
        }
        parent.appendChild(wrapper);
    }
    function updateCardRatingSeparate(card, data) {
        var idStr = data.id.toString();
        var elements = card.querySelectorAll('.card__vote-separate-wrap [data-rate-source]');
        for (var i = 0; i < elements.length; i++) { elements[i].dataset.movieId = idStr; fillSingleRatingElement(elements[i], data, elements[i].dataset.rateSource); }
        fixSeparateBorderRadius(card);
    }
    function fixSeparateBorderRadius(card) {
        var wrap = card.querySelector('.card__vote-separate-wrap');
        if (!wrap) return;
        var items = wrap.querySelectorAll('.card__vote');
        for (var i = 0; i < items.length; i++) items[i].classList.remove('visible-first', 'visible-last', 'visible-only');
        var vis = [];
        for (var i = 0; i < items.length; i++) { if (!items[i].classList.contains('card__vote--hidden')) vis.push(items[i]); }
        if (!vis.length) return;
        if (vis.length === 1) vis[0].classList.add('visible-only');
        else { vis[0].classList.add('visible-first'); vis[vis.length - 1].classList.add('visible-last'); }
    }
    function showTmdbFallback(ratingElement, data) {
        var tmdb = getTMDBRating(data);
        if (tmdb !== '0.0') {
            ratingElement.className = voteClass('rate--tmdb');
            ratingElement.innerHTML = '<span style="color:' + getRatingColor(tmdb) + '">' + formatRating(tmdb) + '</span><span class="source--name"></span>';
            ratingElement.style.background = getRatingBackgroundColor(tmdb) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
            return;
        }
        var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
        var cachedLampa = ratingCache.get('lampa_rating', lampaKey);
        if (cachedLampa && cachedLampa.rating > 0) {
            ratingElement.className = voteClass('rate--lampa');
            ratingElement.innerHTML = '<span style="color:' + getRatingColor(cachedLampa.rating) + '">' + formatRating(cachedLampa.rating) + '</span>';
            renderLampaPosterIcon(ratingElement, cachedLampa.medianReaction);
            ratingElement.style.background = getRatingBackgroundColor(cachedLampa.rating) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
            return;
        }
        getLampaRating(lampaKey).then(function (result) {
            if (!ratingElement.parentNode || ratingElement.dataset.movieId !== data.id.toString()) return;
            if (result.rating > 0) {
                ratingElement.className = voteClass('rate--lampa');
                ratingElement.innerHTML = '<span style="color:' + getRatingColor(result.rating) + '">' + formatRating(result.rating) + '</span>';
                renderLampaPosterIcon(ratingElement, result.medianReaction);
                ratingElement.style.background = getRatingBackgroundColor(result.rating) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
            } else { ratingElement.classList.add('card__vote--hidden'); }
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
        var idStr = data.id.toString();
        var source = Lampa.Storage.get('rating_source', 'all');
        var ratingElement;
        var displayMode = getRatingDisplayMode();
        var tmdbUpdateRequested = false;
        function requestFreshTmdbUpdate(updater) {
            if (tmdbUpdateRequested || !isRatingSourceVisible('tmdb')) return;
            tmdbUpdateRequested = true;
            ensureFreshTMDBRating(data, function () {
                if (card.parentNode && document.body.contains(card)) updater();
            });
        }
        if (source === 'all') {
            var isSeparate = displayMode === 'separate';
            if (isSeparate) {
                var separateWrap = card.querySelector('.card__vote-separate-wrap');
                if (!separateWrap || separateWrap.dataset.movieId !== idStr || separateWrap.dataset.source !== 'all') {
                    removeAllRatingElements(card);
                    createRatingSeparateElements(card);
                    separateWrap = card.querySelector('.card__vote-separate-wrap');
                }
                if (separateWrap) { separateWrap.dataset.movieId = idStr; separateWrap.dataset.source = 'all'; }
                updateCardRatingSeparate(card, data);
                requestFreshTmdbUpdate(function () { updateCardRatingSeparate(card, data); });
                if (canUseKinopoiskApi() && isAnyKinopoiskSourceVisible()) getKinopoiskRating(data, function () { if (card.parentNode && document.body.contains(card)) updateCardRatingSeparate(card, data); });
                var lampaKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                getLampaRating(lampaKey).then(function () { if (card.parentNode && document.body.contains(card)) updateCardRatingSeparate(card, data); });
            } else {
                ratingElement = card.querySelector('.card__vote-line');
                if (!ratingElement || ratingElement.dataset.movieId !== idStr || ratingElement.dataset.source !== 'all') { removeAllRatingElements(card); ratingElement = createRatingLineElement(card); }
                ratingElement.dataset.source = 'all'; ratingElement.dataset.movieId = idStr;
                ratingElement.style.display = ''; ratingElement.classList.remove('card__vote--hidden');
                updateCardRatingLine(ratingElement, data);
                requestFreshTmdbUpdate(function () { if (ratingElement.parentNode && ratingElement.dataset.movieId === idStr) updateCardRatingLine(ratingElement, data); });
                if (canUseKinopoiskApi() && isAnyKinopoiskSourceVisible() && !ratingElement.dataset.kpRequested) {
                    ratingElement.dataset.kpRequested = String(Date.now());
                    getKinopoiskRating(data, function () { if (ratingElement.parentNode && ratingElement.dataset.movieId === idStr) updateCardRatingLine(ratingElement, data); });
                }
                var lampaKey2 = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                getLampaRating(lampaKey2).then(function () { if (ratingElement.parentNode && ratingElement.dataset.movieId === idStr) updateCardRatingLine(ratingElement, data); });
            }
            return;
        }
        ratingElement = card.querySelector('.card__vote:not(.card__vote-line):not(.card__vote-separate-wrap)');
        if (!ratingElement || ratingElement.dataset.source !== source || ratingElement.dataset.movieId !== idStr) { removeAllRatingElements(card); ratingElement = createRatingElement(card); }
        ratingElement.dataset.source = source; ratingElement.dataset.movieId = idStr;
        ratingElement.style.display = ''; ratingElement.classList.remove('card__vote--hidden');
        function applyTmdbToElement(el) {
            var tmdb = getTMDBRating(data);
            if (tmdb !== '0.0') {
                el.className = voteClass('rate--tmdb');
                el.innerHTML = '<span style="color:' + getRatingColor(tmdb) + '">' + formatRating(tmdb) + '</span><span class="source--name"></span>';
                el.style.background = getRatingBackgroundColor(tmdb) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
                return true;
            }
            return false;
        }
        if (source === 'tmdb') {
            ratingElement.className = voteClass('rate--tmdb card__vote--separate');
            if (!applyTmdbToElement(ratingElement)) showTmdbFallback(ratingElement, data);
            requestFreshTmdbUpdate(function () { if (ratingElement.parentNode && ratingElement.dataset.movieId === idStr) applyTmdbToElement(ratingElement); });
        }
        else if (source === 'lampa') {
            var type = (data.seasons || data.first_air_date || data.original_name) ? 'tv' : 'movie';
            var ratingKey = type + '_' + data.id;
            var cached = ratingCache.get('lampa_rating', ratingKey);
            if (cached && cached.rating > 0) {
                ratingElement.className = voteClass('rate--lampa card__vote--separate');
                ratingElement.innerHTML = '<span style="color:' + getRatingColor(cached.rating) + '">' + formatRating(cached.rating) + '</span>';
                renderLampaPosterIcon(ratingElement, cached.medianReaction);
                ratingElement.style.background = getRatingBackgroundColor(cached.rating) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
                return;
            }
            applyTmdbToElement(ratingElement);
            addToQueue(function () {
                getLampaRating(ratingKey).then(function (result) {
                    if (ratingElement.parentNode && ratingElement.dataset.movieId === idStr && result.rating > 0) {
                        ratingElement.className = voteClass('rate--lampa card__vote--separate');
                        ratingElement.innerHTML = '<span style="color:' + getRatingColor(result.rating) + '">' + formatRating(result.rating) + '</span>';
                        renderLampaPosterIcon(ratingElement, result.medianReaction);
                        ratingElement.style.background = getRatingBackgroundColor(result.rating) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
                    }
                });
            });
        } else if (source === 'kp' || source === 'imdb') {
            applyTmdbToElement(ratingElement);
            getKinopoiskRating(data, function (res) {
                if (ratingElement.parentNode && ratingElement.dataset.movieId === idStr) {
                    var val = source === 'kp' ? res.kp : res.imdb;
                    if (val && val > 0) {
                        ratingElement.className = voteClass('rate--' + source + ' card__vote--separate');
                        ratingElement.innerHTML = '<span style="color:' + getRatingColor(val) + '">' + formatRating(val) + '</span><span class="source--name"></span>';
                        ratingElement.style.background = getRatingBackgroundColor(val) || ('rgba(0,0,0,' + getOverlayAlpha() + ')');
                    }
                }
            });
        }
    }

    window.refreshAllRatings = function () {
        var allCards = document.querySelectorAll('.card');
        for (var i = 0; i < allCards.length; i++) {
            var card = allCards[i]; var data = card.card_data;
            if (data && data.id) updateCardRating({ card: card, data: data });
        }
    };

    var _scrollRatingMaxCardsPerRun = 80;
    var _ratingUpdateTimer = 0;
    var _ratingUpdateRafScheduled = false;
    var _mainObserver = null;
    var _cardIntersectionObserver = null;
    function isCardUpdatesBlocked() {
        try {
            var selectors = ['.modal', '.settings-input__content', '.selectbox__content', '.menu-edit-list'];
            for (var i = 0; i < selectors.length; i++) {
                var node = document.querySelector(selectors[i]);
                if (node && node.offsetParent !== null) return true;
            }
        } catch (e) {}
        return false;
    }
    function isCardNearViewport(card, windowHeight) { var rect = card.getBoundingClientRect(); return !(rect.bottom < -200 || rect.top > windowHeight + 200); }
    function updateVisibleCards(limit) {
        if (document.hidden || isCardUpdatesBlocked()) return;
        var allCards = document.querySelectorAll('.card[data-rating-visible="1"]');
        if (!allCards.length) allCards = document.querySelectorAll('.card');
        var maxCards = typeof limit === 'number' && limit > 0 ? limit : allCards.length;
        var wH = window.innerHeight || 1000;
        var updated = 0;
        var source = Lampa.Storage.get('rating_source', 'all');
        var displayMode = getRatingDisplayMode();
        for (var i = 0; i < allCards.length && updated < maxCards; i++) {
            var card = allCards[i]; var data = card.card_data;
            if (!data || !data.id) continue;
            if (!isCardNearViewport(card, wH)) continue;
            var idStr = data.id.toString();
            var lineEl = card.querySelector('.card__vote-line');
            var separateEls = card.querySelectorAll('.card__vote-separate-wrap [data-rate-source]');
            var singleEl = card.querySelector('.card__vote:not(.card__vote-line):not(.card__vote-separate-wrap)');
            var needFull = false;
            if (source === 'all') {
                if (displayMode === 'single') { if (!lineEl || lineEl.dataset.movieId !== idStr) needFull = true; else updateCardRatingLine(lineEl, data); }
                else { if (separateEls.length === 0 || (separateEls[0] && separateEls[0].dataset.movieId !== idStr)) needFull = true; else updateCardRatingSeparate(card, data); }
            } else {
                if (!singleEl || singleEl.dataset.source !== source || singleEl.dataset.movieId !== idStr) needFull = true;
                else if (singleEl.innerHTML === '') {
                    if (source === 'lampa') {
                        var ratingKey = (data.seasons || data.first_air_date || data.original_name) ? 'tv_' + data.id : 'movie_' + data.id;
                        var cachedLampa = ratingCache.get('lampa_rating', ratingKey);
                        if (cachedLampa && cachedLampa.rating > 0) {
                            singleEl.innerHTML = '<span style="color:' + getRatingColor(cachedLampa.rating) + '">' + formatRating(cachedLampa.rating) + '</span>';
                            renderLampaPosterIcon(singleEl, cachedLampa.medianReaction);
                        }
                    } else if (source === 'tmdb') {
                        var tmdbKey = getTmdbRatingKey(data);
                        var cachedTmdb = tmdbKey ? ratingCache.get('tmdb_rating', tmdbKey) : null;
                        if (cachedTmdb && cachedTmdb.vote_average > 0) singleEl.innerHTML = '<span style="color:' + getRatingColor(cachedTmdb.vote_average) + '">' + formatRating(cachedTmdb.vote_average) + '</span><span class="source--name"></span>';
                    } else if (source === 'kp' || source === 'imdb') {
                        var cachedKp = ratingCache.get('kp_rating', data.id);
                        if (cachedKp && (cachedKp.kp > 0 || cachedKp.imdb > 0)) { var r = source === 'kp' ? cachedKp.kp : cachedKp.imdb; singleEl.innerHTML = '<span style="color:' + getRatingColor(r) + '">' + formatRating(r) + '</span><span class="source--name"></span>'; }
                    }
                }
            }
            if (needFull) updateCardRating({ card: card, data: data });
            updated++;
        }
    }
    function scheduleVisibleRatingsUpdate(delay) {
        if (_ratingUpdateTimer) clearTimeout(_ratingUpdateTimer);
        _ratingUpdateTimer = setTimeout(function () { _ratingUpdateTimer = 0; if (_ratingUpdateRafScheduled) return; _ratingUpdateRafScheduled = true; requestAnimationFrame(function () { _ratingUpdateRafScheduled = false; updateVisibleCards(_scrollRatingMaxCardsPerRun); }); }, delay || 0);
    }
    function observeCardVisibility(card) {
        if (!_cardIntersectionObserver || !card || !card.nodeType || card.nodeType !== 1) return;
        try { _cardIntersectionObserver.observe(card); } catch (e) {}
    }
    function startMainObserver() {
        if (_mainObserver) return;
        if (!_cardIntersectionObserver && typeof IntersectionObserver !== 'undefined') {
            _cardIntersectionObserver = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].target) entries[i].target.setAttribute('data-rating-visible', entries[i].isIntersecting ? '1' : '0');
                    if (entries[i].isIntersecting && entries[i].target && entries[i].target.card_data && !isCardUpdatesBlocked()) {
                        updateCardRating({ card: entries[i].target, data: entries[i].target.card_data });
                        if (isQualityShowOn()) processQualityForCards([entries[i].target]);
                        addTypeLabel(entries[i].target);
                        addYearBadge(entries[i].target);
                    }
                }
            }, { root: null, rootMargin: '250px 0px 250px 0px', threshold: 0.01 });
            var existingCards = document.querySelectorAll('.card');
            for (var ci = 0; ci < existingCards.length; ci++) observeCardVisibility(existingCards[ci]);
        }
        _mainObserver = new MutationObserver(function (mutations) {
            var needRatings = false;
            var needCards = false;
            var needSelectbox = false;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.addedNodes && m.addedNodes.length) {
                    for (var j = 0; j < m.addedNodes.length; j++) {
                        var node = m.addedNodes[j];
                        if (!node || node.nodeType !== 1) continue;
                        if (node.matches && node.matches('.card')) { observeCardVisibility(node); needRatings = true; needCards = true; }
                        else if (node.querySelector && node.querySelector('.card')) {
                            needRatings = true; needCards = true;
                            var nestedCards = node.querySelectorAll('.card');
                            for (var ni = 0; ni < nestedCards.length; ni++) observeCardVisibility(nestedCards[ni]);
                        }
                        if (node.querySelector && (node.querySelector('.selectbox-item__icon') || node.querySelector('.selectbox-item__icon img'))) needSelectbox = true;
                    }
                }
            }
            if (needRatings) scheduleVisibleRatingsUpdate(50);
            if (needCards) {
                var allCards = document.querySelectorAll('.card');
                for (var k = 0; k < allCards.length; k++) {
                    if (!allCards[k].hasAttribute('data-type-label-checked')) {
                        addTypeLabel(allCards[k]);
                        addYearBadge(allCards[k]);
                        if (!isQualityShowOn()) { $(allCards[k]).find('.card__quality').remove(); allCards[k].removeAttribute('data-quality-added'); }
                    }
                }
                if (isQualityShowOn()) {
                    var newCards = [];
                    for (var k = 0; k < allCards.length; k++) {
                        if (!allCards[k].hasAttribute('data-quality-added')) newCards.push(allCards[k]);
                    }
                    if (newCards.length) processQualityForCards(newCards);
                }
            }
            if (needSelectbox && document.querySelector('.selectbox-item__icon img')) applyReactionsToSelectbox();
        });
        _mainObserver.observe(document.body, { childList: true, subtree: true });
    }


    function colorizeFullCardRatings(render) {
        if (!isColoredRatingsPosterOn()) return;
        var scope = $(render).length ? $(render) : $(document);
        scope.find('.full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function () {
            var el = $(this); if (el.closest('.explorer').length) return;
            var text = el.text().trim(); var m = text.match(/(\d+[\.,]\d+|\d+)/); if (!m) return;
            var v = parseFloat(m[0].replace(',', '.')); if (isNaN(v)) return;
            el.css('color', v <= 3 ? 'rgba(231,76,60,0.8)' : v < 6 ? 'rgba(243,156,18,0.8)' : v < 8 ? 'rgba(52,152,219,0.8)' : 'rgba(46,204,113,0.8)');
        });
    }
    function insertLampaBlock(render) {
        if (!render) return false;
        if (!isTriggerOn('lampa_rating_show', true)) return false;
        var rateLine = $(render).find('.full-start-new__rate-line');
        if (!rateLine.length || rateLine.find('.rate--lampa').length > 0) return false;
        var html = '<div class="full-start-new__rate full-start__rate rate--lampa"><div class="rate-value">0.0</div><div class="rate-icon"></div><div class="source--name card-overlay-lampa-star" style="margin-left:-0.2em">★</div></div>';
        var $anchor = rateLine.find('.full-start-new__rate.rate--tmdb, .full-start-new__rate.rate--kp, .full-start-new__rate.rate--imdb, .full-start__rate.rate--tmdb, .full-start__rate.rate--kp, .full-start__rate.rate--imdb').last();
        if (!$anchor.length) $anchor = rateLine.find('.rate--tmdb, .rate--kp, .rate--imdb').last().closest('.full-start-new__rate, .full-start__rate');
        if (!$anchor.length) $anchor = rateLine.find('.full-start-new__rate:not(.rate--lampa), .full-start__rate:not(.rate--lampa)').last();
        if ($anchor.length) $anchor.after(html); else rateLine.append(html);
        applyDetailRatingIcons(render);
        return true;
    }
    function getDetailRatingIconSvg(className) {
        if (className === 'rate--tmdb') return DETAIL_TMDB_SVG;
        if (className === 'rate--imdb') return DETAIL_IMDB_SVG;
        if (className === 'rate--kp') return DETAIL_KP_SVG;
        if (className === 'rate--lampa') return DETAIL_STAR_SVG;
        return '';
    }
    function applyDetailRatingIcons(render) {
        var scope = render ? $(render) : $(document);
        var showIcons = isDetailRatingIconsOn();
        if (showIcons) $('body').attr('data-detail-rating-icons', 'on'); else $('body').attr('data-detail-rating-icons', 'off');
        function replaceIcon(className) {
            var svg = getDetailRatingIconSvg(className);
            if (!svg) return;
            scope.find('.full-start-new__rate.' + className + ', .full-start__rate.' + className).each(function () {
                var element = $(this);
                var target = element.find('.source--name').first();
                if (!target.length) {
                    target = element.children('div').filter(function () {
                        var text = (this.textContent || '').trim().toUpperCase();
                        return text === 'TMDB' || text === 'IMDB' || text === 'KP' || text === 'LAMPA' || text === '★';
                    }).last();
                }
                if (!target.length) {
                    var childDivs = element.children('div');
                    if (childDivs.length >= 2) target = childDivs.eq(childDivs.length - 1);
                }
                if (!target.length) return;
                if (showIcons) {
                    if (!target.attr('data-card-overlay-original-html')) target.attr('data-card-overlay-original-html', target.html());
                    target.html('<span class="card-overlay-detail-icon">' + svg + '</span>');
                    target.addClass('card-overlay-detail-icon-target');
                } else {
                    var original = target.attr('data-card-overlay-original-html');
                    if (original != null) target.html(original);
                    target.removeAttr('data-card-overlay-original-html').removeClass('card-overlay-detail-icon-target');
                    if (className === 'rate--lampa') target.text('LAMPA').removeAttr('style');
                }
            });
        }
        replaceIcon('rate--tmdb');
        replaceIcon('rate--imdb');
        replaceIcon('rate--kp');
        replaceIcon('rate--lampa');
    }
    function applyRatingScale() {
        var v = parseFloat(Lampa.Storage.get('rating_scale', '100'));
        if (isNaN(v)) v = 100;
        v = Math.max(60, Math.min(150, v));
        try { document.body.style.setProperty('--rating-font-size', (1.1 * v / 100) + 'em'); } catch (e) {}
    }
    var _settingsRefreshTimer = 0;
    function scheduleSettingsRefresh(delay) {
        if (_settingsRefreshTimer) clearTimeout(_settingsRefreshTimer);
        _settingsRefreshTimer = setTimeout(function () { _settingsRefreshTimer = 0; applyRatingSettingsRefresh(); }, delay == null ? 180 : delay);
    }
    function applyRatingSettingsRefresh() {
        applyRatingScale();
        if (isTriggerOn('lampa_rating_icon', true)) $('body').attr('data-lampa-icon-on', '1'); else $('body').removeAttr('data-lampa-icon-on');
        applyDetailRatingIcons();
        var allCards = document.querySelectorAll('.card');
        for (var i = 0; i < allCards.length; i++) removeAllRatingElements(allCards[i]);
        if (typeof window.refreshAllRatings === 'function') window.refreshAllRatings();
        scheduleVisibleRatingsUpdate(0);
        refreshAllQualityLabels();
        refreshAllTypeLabels();
        refreshAllYearBadges();
    }

    // ===== QUALITY SYSTEM =====
    function convertQuality(resolution) {
        switch (resolution) {
            case 2160: return '4K';
            case 1080: return 'FHD';
            case 720: return 'HD';
            case 'TS': return 'TS';
            default: return resolution >= 720 ? 'HD' : 'SD';
        }
    }
    var forbiddenTerms = ['camrip', 'камрип', 'ts', 'telecine', 'telesync', 'telesynch', 'upscale', 'tc', 'тс'];
    var forbiddenPatterns = forbiddenTerms.map(function (term) { return new RegExp('\\b' + term + '\\b', 'i'); });
    function detectLowQuality(title) { if (!title) return false; var l = title.toLowerCase(); return forbiddenPatterns.some(function (p) { return p.test(l); }); }
    function determineType(item) { var ct = item.media_type || item.type; if (ct === 'movie' || ct === 'tv') return ct; return item.name || item.original_name ? 'tv' : 'movie'; }

    function fetchAllohaQuality(normalizedItem, onComplete) {
        var server = ALLOHA_API_SERVERS[Math.floor(Math.random() * ALLOHA_API_SERVERS.length)];
        var url = server.url + '?token=' + server.token;
        if (normalizedItem.kinopoisk_id) {
            url += '&kp=' + encodeURIComponent(normalizedItem.kinopoisk_id);
        } else if (normalizedItem.imdb_id) {
            url += '&imdb=' + encodeURIComponent(normalizedItem.imdb_id);
        } else if (normalizedItem.id) {
            url += '&tmdb=' + encodeURIComponent(normalizedItem.id);
        } else {
            onComplete(null);
            return;
        }
        new Lampa.Reguest().silent(url, function (responseData) {
            if (!responseData) { onComplete(null); return; }
            try {
                var parsedData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
                if (parsedData.status !== 'success' || !parsedData.data) { onComplete(null); return; }
                var data = parsedData.data;
                if (data.uhd) { onComplete({ quality: '4K' }); return; }
                if (data.quality && /(^|,\s*)ts(\s*,|$)/i.test(data.quality)) { onComplete({ quality: 'TS' }); return; }
                if (data.quality) { onComplete({ quality: 'HD' }); return; }
                onComplete(null);
            } catch (e) { onComplete(null); }
        }, function () { onComplete(null); });
    }

    function fetchJacRed(normalizedItem, itemId, onComplete) {
        var HIGHEST_RES = 2160, detectedForbidden = false;
        function containsText(input) { return /[a-zа-яё]/i.test(input || ''); }
        function isNumericOnly(input) { return /^\d+$/.test(input); }
        var releaseYear = '';
        var dateString = normalizedItem.release_date || '';
        if (dateString.length >= 4) releaseYear = dateString.substring(0, 4);
        if (!releaseYear || isNaN(releaseYear)) { onComplete(null); return; }
        var uniqueId = Lampa.Storage.get('lampac_unic_id', '');
        var requestUrl = 'https://' + QUALITY_API_DOMAIN + '/api/v2.0/indexers/all/results?apikey=&uid=' + uniqueId + '&year=' + releaseYear;
        var titlePresent = false;
        if (normalizedItem.title && (containsText(normalizedItem.title) || isNumericOnly(normalizedItem.title))) { requestUrl += '&title=' + encodeURIComponent(normalizedItem.title.trim()); titlePresent = true; }
        if (normalizedItem.original_title && (containsText(normalizedItem.original_title) || isNumericOnly(normalizedItem.original_title))) { requestUrl += '&title_original=' + encodeURIComponent(normalizedItem.original_title.trim()); titlePresent = true; }
        if (!titlePresent) { onComplete(null); return; }
        new Lampa.Reguest().silent(requestUrl, function (responseData) {
            if (!responseData) { onComplete(null); return; }
            try {
                var parsedData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
                var releases = parsedData.Results || [];
                if (!Array.isArray(releases)) releases = [];
                if (!releases.length) { onComplete(null); return; }
                var optimalRes = -1, optimalRelease = null;
                var targetYear = parseInt(releaseYear, 10), priorYear = targetYear - 1;
                for (var index = 0; index < releases.length; index++) {
                    var release = releases[index];
                    var details = release.info || release.Info || {};
                    var resValue = details.quality, yearValue = details.relased, checkTitle = release.Title || '';
                    if (typeof resValue !== 'number' || resValue === 0) continue;
                    var validYear = false, extractedYear = 0;
                    if (yearValue && !isNaN(yearValue)) { extractedYear = parseInt(yearValue, 10); if (extractedYear > 1900) validYear = true; }
                    if (!validYear) continue;
                    if (extractedYear !== targetYear && extractedYear !== priorYear) continue;
                    if (detectLowQuality(checkTitle)) { detectedForbidden = true; continue; }
                    if (resValue === HIGHEST_RES) { onComplete({ quality: convertQuality(resValue), title: checkTitle }); return; }
                    if (resValue > optimalRes) { optimalRes = resValue; optimalRelease = { title: checkTitle, quality: resValue, year: extractedYear }; }
                }
                if (optimalRelease) onComplete({ quality: convertQuality(optimalRelease.quality), title: optimalRelease.title });
                else if (detectedForbidden) onComplete({ quality: convertQuality('TS'), title: "NOT SAVED" });
                else onComplete(null);
            } catch (error) { onComplete(null); }
        }, function () { onComplete(null); });
    }

    function fetchOptimalRelease(normalizedItem, itemId, onComplete) {
        var source = Lampa.Storage.get('quality_source', 'both');
        function completeWithFallback(result) {
            if (result && result.quality) onComplete(result);
            else fetchAllohaQuality(normalizedItem, onComplete);
        }
        if (source === 'alloha') {
            fetchAllohaQuality(normalizedItem, onComplete);
        }
        else if (source === 'jacred') {
            fetchJacRed(normalizedItem, itemId, function (result) {
                if (result && result.quality) onComplete(result);
                else fetchAllohaQuality(normalizedItem, onComplete);
            });
        }
        else {
            fetchJacRed(normalizedItem, itemId, completeWithFallback);
        }
    }
    function retrieveQualityCache(entryKey) {
        var storedCache = Lampa.Storage.get(QUALITY_CACHE_KEY) || {};
        var cacheEntry = storedCache[entryKey];
        return cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL) ? cacheEntry : null;
    }
    function storeQualityCache(entryKey, entryData) {
        var storedCache = Lampa.Storage.get(QUALITY_CACHE_KEY) || {};
        storedCache[entryKey] = { quality: entryData.quality || null, timestamp: Date.now() };
        Lampa.Storage.set(QUALITY_CACHE_KEY, storedCache);
    }
    function loadQualityForDetail(item, viewRenderer) {
        var standardizedItem = {
            id: item.id,
            title: item.title || item.name || '',
            original_title: item.original_title || item.original_name || '',
            release_date: item.release_date || item.first_air_date || '',
            type: determineType(item),
            kinopoisk_id: item.kinopoisk_id || item.kp_id || item.kinopoiskId || '',
            imdb_id: item.imdb_id || item.imdbId || ''
        };
        var cacheEntryKey = standardizedItem.type + '_' + standardizedItem.id;
        var cachedQuality = retrieveQualityCache(cacheEntryKey);
        if (cachedQuality) { refreshDetailQuality(cachedQuality.quality, viewRenderer); }
        else { displayQualityLoader(viewRenderer); fetchOptimalRelease(standardizedItem, standardizedItem.id, function (releaseResult) { var q = (releaseResult && releaseResult.quality) || null; if (q && q !== 'NO') { storeQualityCache(cacheEntryKey, { quality: q }); refreshDetailQuality(q, viewRenderer); } else { removeQualityElements(viewRenderer); } }); }
    }
    var badgeBaseStyle = 'border-radius:0.3em;padding:0.2em 0.4em;display:inline-block;line-height:1;white-space:nowrap;';
    var qualityBadgeStyle = badgeBaseStyle + 'color:white;';
    function refreshDetailQuality(resQuality, viewRenderer) {
        if (!viewRenderer) return;
        var colors = getDetailQualityColor(resQuality);
        var qualityDisplay = $('.full-start__status.qualview-quality', viewRenderer);
        if (qualityDisplay.length) {
            qualityDisplay.text(resQuality).css({ opacity: '1' });
            if (colors) qualityDisplay.css({ backgroundColor: colors.bg, color: colors.text });
            else qualityDisplay.css({ backgroundColor: '', color: '' });
        }
        else {
            var ratingSection = $('.full-start-new__rate-line', viewRenderer);
            if (!ratingSection.length) return;
            var newEl = $('<div class="full-start__status qualview-quality">' + resQuality + '</div>');
            if (colors) newEl.css({ backgroundColor: colors.bg, color: colors.text });
            ratingSection.append(newEl);
        }
        var detailsSection = $('.full-start-new__details', viewRenderer);
        if (detailsSection.length) {
            var qualitySpan = detailsSection.find('span').filter(function () {
                var t = $(this).text();
                return t.indexOf('Качество:') === 0 || t.indexOf('качество:') === 0;
            });
            qualitySpan.prev('.full-start-new__split').addBack().remove();
        }
        if (isMobilePortrait()) moveDetailMetaToSecondLine(viewRenderer);
    }
    function displayQualityLoader(viewRenderer) {
        if (!viewRenderer) return;
        var ratingSection = $('.full-start-new__rate-line', viewRenderer);
        if (ratingSection.length && !$('.full-start__status.qualview-quality', viewRenderer).length) {
            var loaderEl = $('<div class="full-start__status qualview-quality">...</div>');
            loaderEl.css({ opacity: '0.7' });
            ratingSection.append(loaderEl);
        }
        if (isMobilePortrait()) moveDetailMetaToSecondLine(viewRenderer);
    }
    function removeQualityElements(viewRenderer) {
        if (viewRenderer) $('.full-start__status.qualview-quality', viewRenderer).remove();
    }

    function applyQualityToItem(itemElement, resQuality) {
        if (!document.body.contains(itemElement)) return;
        itemElement.setAttribute('data-quality-added', 'true');
        var viewSection = itemElement.querySelector('.card__view');
        if (!viewSection) return;
        var existing = viewSection.querySelectorAll('.card__quality');
        for (var i = 0; i < existing.length; i++) existing[i].remove();
        if (resQuality && resQuality !== 'NO' && resQuality !== '...') {
            var qualityContainer = document.createElement('div');
            qualityContainer.className = 'card__quality card__quality-' + resQuality.toLowerCase();
            var inner = document.createElement('div');
            inner.textContent = resQuality;
            qualityContainer.appendChild(inner);
            qualityContainer.style.background = getQualityBackground(resQuality);
            viewSection.appendChild(qualityContainer);
        }
    }
    function processQualityForCards(itemsList) {
        for (var idx = 0; idx < itemsList.length; idx++) {
            var itemElement = itemsList[idx];
            if (itemElement.hasAttribute('data-quality-added')) continue;
            var itemInfo = itemElement.card_data;
            if (!itemInfo) continue;
            var stdInfo = {
                id: itemInfo.id || '',
                title: itemInfo.title || itemInfo.name || '',
                original_title: itemInfo.original_title || itemInfo.original_name || '',
                release_date: itemInfo.release_date || itemInfo.first_air_date || '',
                type: determineType(itemInfo),
                kinopoisk_id: itemInfo.kinopoisk_id || itemInfo.kp_id || itemInfo.kinopoiskId || '',
                imdb_id: itemInfo.imdb_id || itemInfo.imdbId || ''
            };
            (function (currElement, sInfo, entryKey) {
                var cachedEntry = retrieveQualityCache(entryKey);
                if (cachedEntry) { applyQualityToItem(currElement, cachedEntry.quality); }
                else { applyQualityToItem(currElement, '...'); fetchOptimalRelease(sInfo, sInfo.id, function (releaseData) { var q = (releaseData && releaseData.quality) || null; applyQualityToItem(currElement, q); if (q && q !== 'NO') storeQualityCache(entryKey, { quality: q }); }); }
            })(itemElement, stdInfo, stdInfo.type + '_' + stdInfo.id);
        }
    }
    function refreshAllQualityLabels() {
        var allCards = document.querySelectorAll('.card');
        for (var i = 0; i < allCards.length; i++) {
            allCards[i].removeAttribute('data-quality-added');
            var existing = allCards[i].querySelectorAll('.card__quality');
            for (var j = 0; j < existing.length; j++) existing[j].remove();
        }
        if (isQualityShowOn()) processQualityForCards(allCards);
    }

    function ensureDetailMetaLine(viewRenderer) {
        if (!viewRenderer) return $();
        var render = $(viewRenderer);
        var ratingSection = render.find('.full-start-new__rate-line');
        if (!ratingSection.length) return $();
        var metaLine = ratingSection.siblings('.full-start-new__meta-line');
        if (!metaLine.length) {
            metaLine = $('<div class="full-start-new__meta-line"></div>');
            ratingSection.after(metaLine);
        }
        return metaLine;
    }
    function isMobilePortrait() {
        return Lampa.Platform.screen('mobile') && window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
    }
    function repositionDetailMeta() {
        if (isMobilePortrait()) {
            var fullRender = document.querySelector('.full-start, .full-start-new');
            if (fullRender) moveDetailMetaToSecondLine(fullRender);
        } else {
            $('.full-start-new__meta-line').each(function () {
                var metaLine = $(this);
                var rateLine = metaLine.prev('.full-start-new__rate-line');
                metaLine.children().each(function () { rateLine.append(this); });
                metaLine.remove();
            });
        }
    }
    function moveDetailMetaToSecondLine(viewRenderer) {
        if (!isMobilePortrait()) return;
        var render = $(viewRenderer);
        var rateLine = render.find('.full-start-new__rate-line');
        if (!rateLine.length) return;
        var age = render.find('.full-start__pg').filter(function () {
            var el = $(this);
            if (el.hasClass('hide') || el.hasClass('nr')) return false;
            return $.trim(el.text()).length > 0;
        }).first();
        var nativeStatus = render.find('.full-start__status').not('.qualview-quality').not('.season-info-status').filter(function () {
            var el = $(this);
            return !el.closest('.full-start-new__rate, .full-start__rate').length;
        }).first();
        var quality = render.find('.full-start__status.qualview-quality').first();
        var metaItems = [];
        if (age.length) metaItems.push(age);
        if (nativeStatus.length) metaItems.push(nativeStatus);
        if (quality.length) metaItems.push(quality);
        if (!metaItems.length) {
            rateLine.siblings('.full-start-new__meta-line').remove();
            return;
        }
        var metaLine = ensureDetailMetaLine(viewRenderer);
        if (!metaLine.length) return;
        metaItems.forEach(function (el) { metaLine.append(el); });
    }

    function colorizeDetailQuality() {
        $('.full-start__status.qualview-quality').each(function () {
            var el = $(this);
            var text = el.text().trim();
            if (!text || text === '...') return;
            var colors = getDetailQualityColor(text);
            if (colors) el.css({ backgroundColor: colors.bg, color: colors.text });
            else el.css({ backgroundColor: '', color: '' });
        });
    }

    // ===== TYPE LABELS =====
    function addTypeLabel(card) {
        if (!isTypeLabelsShowOn()) return;
        if ($(card).closest('.explorer, .layer--online, .select-box').length) { $(card).find('.content-label').remove(); return; }
        if ($(card).find('.content-label').length) return;
        var view = $(card).find('.card__view');
        if (!view.length) return;
        var meta = {}, tmp;
        try {
            tmp = $(card).attr('data-card'); if (tmp) meta = JSON.parse(tmp);
            tmp = $(card).data(); if (tmp && Object.keys(tmp).length) meta = Object.assign(meta, tmp);
            if (Lampa.Card && $(card).attr('id')) { var c = Lampa.Card.get($(card).attr('id')); if (c) meta = Object.assign(meta, c); }
            var id = $(card).data('id') || $(card).attr('data-id') || meta.id;
            if (id && Lampa.Storage.cache('card_' + id)) meta = Object.assign(meta, Lampa.Storage.cache('card_' + id));
        } catch (e) {}
        var isTV = false;
        if (meta.type === 'tv' || meta.card_type === 'tv' || meta.seasons || meta.number_of_seasons > 0 || meta.episodes || meta.number_of_episodes > 0 || meta.is_series) isTV = true;
        if (!isTV) { if ($(card).hasClass('card--tv') || $(card).data('type') === 'tv') isTV = true; else if ($(card).find('.card__type, .card__temp').text().match(/(сезон|серия|эпизод|ТВ|TV)/i)) isTV = true; }
        var isPerson = $(card).hasClass('card--person') || $(card).closest('.scroll--persons, .items--persons, .crew').length > 0;
        if (isPerson) return;
        var hasMovieTraits = $(card).find('.card__age').length > 0 || $(card).find('.card__vote').length > 0 || /\b(19|20)\d{2}\b/.test($(card).text());
        if (!isTV && !hasMovieTraits) return;
        var lbl = $('<div class="content-label"></div>');
        lbl.text(isTV ? 'Сериал' : 'Фильм');
        lbl.css({ backgroundColor: getTypeLabelBackground(isTV) });
        if (isTypeLabelsColoredOn()) { lbl.addClass(isTV ? 'serial-label' : 'movie-label'); }
        view.append(lbl);
        if (isTV) $('body[data-movie-labels="on"] .card--tv .card__type').css('display', 'none!important');
    }
    function processAllTypeLabels() {
        if (!isTypeLabelsShowOn()) { $('.card .content-label').remove(); return; }
        $('body').attr('data-movie-labels', isTypeLabelsShowOn() ? 'on' : 'off');
        $('.card').each(function () { addTypeLabel(this); });
    }
    function refreshAllTypeLabels() {
        $('.card .content-label').remove();
        processAllTypeLabels();
    }
    function addTypeLabelToDetail(poster, movie) {
        if (!isTypeLabelsShowOn()) return;
        poster.find('.content-label').remove();
        var isTV = movie.number_of_seasons > 0 || movie.seasons || movie.type === 'tv';
        var lbl = $('<div class="content-label"></div>').css({
            position: 'absolute', left: '0', top: '0', color: 'white', padding: '0.25em 0.45em',
            borderRadius: '0.75em 0', fontSize: '1.1em', zIndex: 10, lineHeight: 1,
            backgroundColor: getTypeLabelBackground(isTV)
        });
        if (isTypeLabelsColoredOn()) lbl.addClass(isTV ? 'serial-label' : 'movie-label');
        lbl.text(isTV ? 'Сериал' : 'Фильм');
        poster.css('position', 'relative').append(lbl);
    }

    // ===== SEASONS INFO =====
    var seasonInfoSettings = {
        seasons_info_mode: 'none',
        label_position: 'top-right'
    };
    function addSeasonInfo() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && data.data.movie.number_of_seasons) {
                if (seasonInfoSettings.seasons_info_mode === 'none') return;
                var movie = data.data.movie;
                var status = movie.status;
                var totalSeasons = movie.number_of_seasons || 0;
                var totalEpisodes = movie.number_of_episodes || 0;
                var airedSeasons = 0, airedEpisodes = 0;
                var now = new Date();
                if (movie.seasons) {
                    movie.seasons.forEach(function (s) {
                        if (s.season_number === 0) return;
                        var seasonAired = s.air_date && new Date(s.air_date) <= now;
                        if (seasonAired) airedSeasons++;
                        if (s.episodes) { s.episodes.forEach(function (ep) { if (ep.air_date && new Date(ep.air_date) <= now) airedEpisodes++; }); }
                        else if (seasonAired && s.episode_count) airedEpisodes += s.episode_count;
                    });
                } else if (movie.last_episode_to_air) {
                    airedSeasons = movie.last_episode_to_air.season_number || 0;
                    if (movie.seasons) { movie.seasons.forEach(function (s) { if (s.season_number === 0) return; if (s.season_number < movie.last_episode_to_air.season_number) airedEpisodes += s.episode_count || 0; else if (s.season_number === movie.last_episode_to_air.season_number) airedEpisodes += movie.last_episode_to_air.episode_number; }); }
                    else { var prev = 0; for (var i = 1; i < movie.last_episode_to_air.season_number; i++) prev += 10; airedEpisodes = prev + movie.last_episode_to_air.episode_number; }
                }
                if (movie.next_episode_to_air && totalEpisodes > 0) {
                    var ne = movie.next_episode_to_air, rem = 0;
                    if (movie.seasons) { movie.seasons.forEach(function (s) { if (s.season_number === ne.season_number) rem += (s.episode_count || 0) - ne.episode_number + 1; else if (s.season_number > ne.season_number) rem += s.episode_count || 0; }); }
                    if (rem > 0) { var calc = totalEpisodes - rem; if (calc >= 0 && calc <= totalEpisodes) airedEpisodes = calc; }
                }
                if (!airedSeasons) airedSeasons = totalSeasons;
                if (!airedEpisodes) airedEpisodes = totalEpisodes;
                if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) airedEpisodes = totalEpisodes;
                function plural(n, one, two, five) { var m = Math.abs(n) % 100; if (m >= 5 && m <= 20) return five; m %= 10; if (m === 1) return one; if (m >= 2 && m <= 4) return two; return five; }
                function getStatusText(st) { if (st === 'Ended') return 'Завершён'; if (st === 'Canceled') return 'Отменён'; if (st === 'Returning Series') return 'Онгоинг'; if (st === 'In Production') return 'В производстве'; return st || 'Неизвестно'; }
                var displaySeasons, displayEpisodes;
                if (seasonInfoSettings.seasons_info_mode === 'aired') { displaySeasons = airedSeasons; displayEpisodes = airedEpisodes; }
                else { displaySeasons = totalSeasons; displayEpisodes = totalEpisodes; }
                var seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                var episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                var isCompleted = (status === 'Ended' || status === 'Canceled');
                var bgColor = isCompleted ? 'rgba(33,150,243,0.8)' : 'rgba(244,67,54,0.8)';
                var statusText = getStatusText(status);
                var txt = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
                if (seasonInfoSettings.seasons_info_mode === 'aired' && totalEpisodes > 0 && airedEpisodes < totalEpisodes && airedEpisodes > 0) txt = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText + ' из ' + totalEpisodes;
                var info = $('<div class="season-info-label"></div>').text(txt);
                var statusLabel = $('<div class="full-start__status season-info-status"></div>').text(statusText);
                var metaLine;
                var positions = { 'top-right': { top: '0', right: '0', borderRadius: '0 0.75em', textAlign: 'right' }, 'top-left': { top: '0', left: '0', borderRadius: '0.75em 0', textAlign: 'left' }, 'bottom-right': { bottom: '0', right: '0', borderRadius: '0.75em 0', textAlign: 'right' }, 'bottom-left': { bottom: '0', left: '0', borderRadius: '0 0.75em', textAlign: 'left' } };
                var pos = positions[seasonInfoSettings.label_position] || positions['top-right'];
                info.css($.extend({ position: 'absolute', backgroundColor: bgColor, color: 'white', padding: '0.25em 0.45em', fontSize: '1.1em', zIndex: 10, whiteSpace: 'nowrap', lineHeight: '1', boxShadow: 'none' }, pos));
                setTimeout(function () {
                    var poster = $(data.object.activity.render()).find('.full-start-new__poster');
                    if (poster.length) poster.css('position', 'relative').append(info);
                    metaLine = ensureDetailMetaLine(data.object.activity.render());
                    if (metaLine.length) {
                        metaLine.find('.season-info-status').remove();
                        var nativeStatus = $(data.object.activity.render()).find('.full-start__status').filter(function () {
                            var el = $(this);
                            if (el.hasClass('qualview-quality')) return false;
                            return !el.closest('.full-start-new__rate, .full-start__rate, .full-start-new__meta-line').length;
                        }).first();
                        if (nativeStatus.length) nativeStatus.addClass('season-info-status');
                        else if (isMobilePortrait()) metaLine.append(statusLabel);
                        moveDetailMetaToSecondLine(data.object.activity.render());
                    }
                }, 100);
            }
        });
    }

    // ===== THEMES =====
    // ===== COLORED ELEMENTS =====
    function isColoredElementsOn() { return isTriggerOn('colored_elements', true); }
    function colorizeSeriesStatus(render) {
        var map = { completed: ['завершён','завершен','ended'], canceled: ['отменён','отменен','canceled'], ongoing: ['онгоинг','выходит','в эфире','ongoing','returning series'], production: ['в производстве','production'], planned: ['запланирован','planned'], pilot: ['пилотный','pilot'], released: ['выпущен','вышел','released'], rumored: ['слухи','rumored'], post: ['скоро','post'] };
        function apply(el) {
            var t = $(el).text().trim().toLowerCase(); var cls = null;
            for (var key in map) { for (var i = 0; i < map[key].length; i++) { if (t.includes(map[key][i])) { cls = 'status-' + key; break; } } if (cls) break; }
            if (cls && !$(el).hasClass(cls)) { $(el).removeClass('status-completed status-canceled status-ongoing status-production status-planned status-pilot status-released status-rumored status-post').addClass(cls); }
        }
        var scope = render ? $(render) : $(document);
        scope.find('.full-start__status').each(function () { apply(this); });
    }
    function colorizeAgeRating(render) {
        var groups = { kids: ['G','TV-Y','0+','3+'], children: ['PG','TV-PG','6+','7+'], teens: ['PG-13','TV-14','12+','13+','14+'], almostAdult: ['R','16+','17+'], adult: ['NC-17','18+','X'] };
        function apply(el) {
            if ($(el).closest('.explorer').length) return;
            var t = $(el).text().trim();
            if (t.toUpperCase() === 'NR') { $(el).addClass('nr'); return; }
            var grp = null;
            for (var key in groups) { for (var i = 0; i < groups[key].length; i++) { if (t.includes(groups[key][i])) { grp = 'age-' + key; break; } } if (grp) break; }
            if (grp && !$(el).hasClass(grp)) { $(el).removeClass('age-kids age-children age-teens age-almost-adult age-adult').addClass(grp); }
        }
        var scope = render ? $(render) : $(document);
        scope.find('.full-start__pg').each(function () { apply(this); });
    }

    // ===== SETTINGS MODAL =====
    function injectModalStyle() {
        if (window.__card_overlay_modal_style__) return;
        window.__card_overlay_modal_style__ = true;
        var css =
            ".comodal{display:flex;flex-direction:column;gap:.7em;padding-right:1em}\n" +
            ".comodal__section{font-size:.85em;opacity:.55;text-align:center;padding:.2em 0}\n" +
            ".comodal__divider{border-top:1px solid rgba(255,255,255,.08);margin-top:.2em}\n" +
            ".comodal__item{display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.7em 1em .7em 1em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);cursor:pointer;user-select:none;box-sizing:border-box}\n" +
            ".comodal__item.focus{border-color:#fff!important;background:rgba(255,255,255,.1)}\n" +
            ".comodal__label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:1em}\n" +
            ".comodal__value{font-size:.95em;opacity:.85;white-space:nowrap;flex-shrink:0}\n" +
            ".comodal__num-row{display:flex;align-items:center;gap:.4em;padding:.7em 1em .7em 1em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);box-sizing:border-box}\n" +
            ".comodal__num-row .comodal__label{flex:1}\n" +
            ".comodal__btn{padding:.55em .9em;border-radius:.6em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);cursor:pointer;user-select:none;font-size:.95em;line-height:1;box-sizing:border-box}\n" +
            ".comodal__btn.focus{border-color:#fff!important}\n" +
            ".comodal__num-val{min-width:2.5em;text-align:center;opacity:.9}\n" +
            ".comodal__action{display:block;text-align:center;padding:.6em 1em;border-radius:.7em;cursor:pointer;user-select:none;font-size:1em;box-sizing:border-box}\n" +
            ".comodal__action--reset{background:rgba(200,100,80,.45);border:1px solid rgba(255,255,255,.15)}\n" +
            ".comodal__action--reset.focus{border-color:#fff!important}\n" +
            ".comodal__action--close{background:rgba(66,133,244,.55);border:1px solid rgba(255,255,255,.15)}\n" +
            ".comodal__action--close.focus{border-color:#fff!important}\n" +
            ".comodal__note{text-align:center;opacity:.85;font-size:.85em;line-height:1.35;padding:.1em .4em}\n" +
            ".comodal__link{color:#8ab4ff!important;text-decoration:underline!important}\n";
        var s = document.createElement('style'); s.type = 'text/css'; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
    }
    function openRatingSettingsModal() {
        var $ = typeof window.$ !== 'undefined' ? window.$ : (typeof window.jQuery !== 'undefined' ? window.jQuery : null);
        if (!$) return;
        try { if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close(); } catch (err) {}
        setTimeout(function () {
            injectModalStyle();
            var SOURCE_LABELS = { tmdb: 'TMDB', lampa: 'Lampa', kp: 'КиноПоиск', imdb: 'IMDB', all: 'Все' };
            var POSITION_LABELS = { top: 'Сверху справа', bottom: 'Снизу справа' };
            var DISPLAY_MODE_LABELS = { single: 'Одно окно', separate: 'Каждый в отдельном окне' };
            var modal = $('<div class="comodal"></div>');
            modal.on('click mousedown touchstart', function (e) { e.stopPropagation(); });
            function isMouseEvent(e) { return e && (e.pointerType === 'mouse' || (e.clientX !== undefined && e.clientY !== undefined)); }
            function blurAfterMouse(e) { if (isMouseEvent(e)) setTimeout(function () { try { var a = document.activeElement; if (a && a.blur) a.blur(); } catch (err) {} }, 0); }
            function makeRow(label, valueText, onClick) {
                var row = $('<div class="comodal__item selector" tabindex="0"></div>');
                row.append($('<div class="comodal__label"></div>').text(label));
                var val = $('<div class="comodal__value"></div>').text(valueText);
                row.append(val);
                if (typeof onClick === 'function') { row.on('hover:enter', function () { onClick(row, val); }); row.on('click', function (e) { if (e && e.preventDefault) e.preventDefault(); if (e && e.stopPropagation) e.stopPropagation(); blurAfterMouse(e); }); }
                return { row: row, updateVal: function (text) { val.text(text); } };
            }
            function addCycleRow(label, storageKey, options, defaultVal) {
                var current = Lampa.Storage.get(storageKey, defaultVal);
                var labels = options.labels || options; var values = options.values || Object.keys(labels);
                if (typeof labels === 'object' && !Array.isArray(labels)) { var arr = []; for (var k in labels) arr.push(k); values = arr; }
                var r = makeRow(label, labels[current] || current, function (rowEl, valEl) {
                    var cur = Lampa.Storage.get(storageKey, defaultVal); var idx = values.indexOf(cur); if (idx < 0) idx = 0;
                    idx = (idx + 1) % values.length; var next = values[idx];
                    Lampa.Storage.set(storageKey, next); valEl.text(labels[next] || next); scheduleSettingsRefresh();
                });
                r.updateVal(labels[current] || current); modal.append(r.row); return r;
            }
            function addTriggerRow(label, storageKey, defaultVal) {
                var isOn = function () { var v = Lampa.Storage.get(storageKey, defaultVal); return (v === true || v === 'true' || v === '1' || v === 1); };
                var r = makeRow(label, isOn() ? 'Вкл' : 'Выкл', function (rowEl, valEl) {
                    var next = !isOn();
                    if (storageKey === 'colored_ratings_poster') setColoredRatingsPoster(next);
                    else Lampa.Storage.set(storageKey, next ? 'true' : 'false');
                    valEl.text(next ? 'Вкл' : 'Выкл'); scheduleSettingsRefresh();
                });
                modal.append(r.row); return r;
            }
            function addNumberRow(label, storageKey, defaultVal, min, max, step, suffix) {
                var current = parseFloat(Lampa.Storage.get(storageKey, defaultVal));
                var val = isNaN(current) ? defaultVal : Math.max(min, Math.min(max, current));
                Lampa.Storage.set(storageKey, String(val));
                var row = $('<div class="comodal__num-row"></div>');
                row.append($('<div class="comodal__label"></div>').text(label));
                var valEl = $('<div class="comodal__num-val"></div>').text(val + (suffix || ''));
                var btnMinus = $('<div class="comodal__btn selector" tabindex="0">−</div>');
                var btnPlus = $('<div class="comodal__btn selector" tabindex="0">+</div>');
                row.append(btnMinus).append(valEl).append(btnPlus);
                function applyChange(delta) { var num = parseFloat(Lampa.Storage.get(storageKey, defaultVal)); num = isNaN(num) ? defaultVal : num; var next = Math.max(min, Math.min(max, num + delta)); Lampa.Storage.set(storageKey, String(next)); valEl.text(next + (suffix || '')); scheduleSettingsRefresh(); }
                btnMinus.on('hover:enter', function () { applyChange(-(step || 1)); }); btnMinus.on('click', function (e) { if (e && e.preventDefault) e.preventDefault(); if (e && e.stopPropagation) e.stopPropagation(); blurAfterMouse(e); });
                btnPlus.on('hover:enter', function () { applyChange(step || 1); }); btnPlus.on('click', function (e) { if (e && e.preventDefault) e.preventDefault(); if (e && e.stopPropagation) e.stopPropagation(); blurAfterMouse(e); });
                modal.append(row); return { row: row, updateVal: function (text) { valEl.text(text); } };
            }

            modal.append($('<div class="comodal__section">Рейтинги</div>'));
            var rowSource = addCycleRow('Источник рейтинга', 'rating_source', SOURCE_LABELS, 'all');
            var rowDisplayMode = addCycleRow('Режим отображения', 'rating_display_mode', DISPLAY_MODE_LABELS, 'separate');
            var rowPosition = addCycleRow('Позиция на постере', 'rating_position', POSITION_LABELS, 'bottom');
            var rowColored = addTriggerRow('Цветные цифры рейтингов', 'colored_ratings_poster', false);
            var rowColoredWin = addTriggerRow('Цветные окна (цифры белые)', 'rating_colored_windows', false);
            var rowAnimated = addTriggerRow('Анимированные реакции на постерах', 'animated_reactions', false);

            var rowShowTmdb = addTriggerRow('Показывать TMDB', 'rating_show_tmdb', true);
            var rowShowImdb = addTriggerRow('Показывать IMDB', 'rating_show_imdb', true);
            var rowShowKp = addTriggerRow('Показывать КиноПоиск', 'rating_show_kp', true);
            var rowShowLampa = addTriggerRow('Показывать Lampa', 'rating_show_lampa', true);
            var rowOpacity = addNumberRow('Прозрачность окон (0–100)', 'rating_window_opacity', 40, 0, 100, 10, '%');
            var rowScale = addNumberRow('Масштаб окон', 'rating_scale', 100, 60, 150, 5, '%');

            modal.append($('<div class="comodal__divider"></div>'));
            modal.append($('<div class="comodal__section">Качество</div>'));
            var rowQualityShow = addTriggerRow('Показывать качество', 'quality_show', true);
            var rowQualityColored = addTriggerRow('Цветные окна качества', 'quality_colored', false);

            modal.append($('<div class="comodal__divider"></div>'));
            modal.append($('<div class="comodal__section">Лейблы типа</div>'));
            var rowTypeLabelsShow = addTriggerRow('Показывать «Фильм»/«Сериал»', 'type_labels_show', true);
            var rowTypeLabelsColored = addTriggerRow('Цветные лейблы типа', 'type_labels_colored', false);

            modal.append($('<div class="comodal__divider"></div>'));
            modal.append($('<div class="comodal__section">API</div>'));
            modal.append($('<div class="comodal__note">API-ключ можно получить на сайте</div>'));
            modal.append($('<div class="comodal__note"><a class="comodal__link" href="https://kinopoiskapiunofficial.tech/" target="_blank" rel="noopener noreferrer">kinopoiskapiunofficial.tech</a></div>'));
            function kpApiKeyRowText() { var k = String(Lampa.Storage.get('rating_kp_api_key', '') || Lampa.Storage.get('source_api_key', '') || '').trim(); if (!k) return 'не задан'; if (k.length <= 10) return 'указан: ' + k; return 'указан: ' + k.slice(0, 4) + '...' + k.slice(-4); }
            var rowKpKey = makeRow('API-ключ КиноПоиск', kpApiKeyRowText(), function (rowEl, valEl) {
                if (typeof Lampa.Input !== 'undefined' && typeof Lampa.Input.edit === 'function') {
                    closeModalSafe();
                    setTimeout(function () {
                        Lampa.Input.edit({ free: true, title: 'API-ключ kinopoiskapiunofficial.tech', nosave: true, value: String(Lampa.Storage.get('rating_kp_api_key', '') || ''), nomic: true }, function (raw) { Lampa.Storage.set('rating_kp_api_key', (raw || '').trim()); valEl.text(kpApiKeyRowText()); scheduleSettingsRefresh(50); setTimeout(function () { openRatingSettingsModal(); }, 300); });
                    }, 300);
                }
            });
            rowKpKey.updateVal(kpApiKeyRowText());
            modal.append(rowKpKey.row);

            function resetAllToDefault() {
                Lampa.Storage.set('rating_source', 'all'); Lampa.Storage.set('animated_reactions', 'false'); setColoredRatingsPoster(false);
                Lampa.Storage.set('rating_colored_windows', 'false'); Lampa.Storage.set('rating_position', 'bottom');
                Lampa.Storage.set('rating_show_tmdb', 'true'); Lampa.Storage.set('rating_show_imdb', 'true');
                Lampa.Storage.set('rating_show_kp', 'true'); Lampa.Storage.set('rating_show_lampa', 'true');
                Lampa.Storage.set('rating_display_mode', 'separate'); Lampa.Storage.set('rating_window_opacity', '40');
                Lampa.Storage.set('rating_scale', '100'); Lampa.Storage.set('rating_kp_api_key', '');
                Lampa.Storage.set('quality_show', 'true'); Lampa.Storage.set('quality_colored', 'false');
                Lampa.Storage.set('type_labels_show', 'true'); Lampa.Storage.set('type_labels_colored', 'false');
                rowSource.updateVal(SOURCE_LABELS.all); rowDisplayMode.updateVal(DISPLAY_MODE_LABELS.separate);
                rowPosition.updateVal(POSITION_LABELS.bottom); rowColored.updateVal('Выкл'); rowColoredWin.updateVal('Выкл');
                rowAnimated.updateVal('Выкл'); rowShowTmdb.updateVal('Вкл'); rowShowImdb.updateVal('Вкл');
                rowShowKp.updateVal('Вкл'); rowShowLampa.updateVal('Вкл');
                rowOpacity.updateVal('40%'); rowScale.updateVal('100%'); rowKpKey.updateVal(kpApiKeyRowText());
                rowQualityShow.updateVal('Вкл'); rowQualityColored.updateVal('Выкл');
                rowTypeLabelsShow.updateVal('Вкл'); rowTypeLabelsColored.updateVal('Выкл');
                scheduleSettingsRefresh(50);
                try { Lampa.Noty.show('Настройки сброшены'); } catch (e) {}
            }
            var resetBtn = $('<div class="comodal__action comodal__action--reset selector" tabindex="0">Сбросить всё по умолчанию</div>');
            resetBtn.on('hover:enter', resetAllToDefault); resetBtn.on('click', function (e) { if (e && e.preventDefault) e.preventDefault(); if (e && e.stopPropagation) e.stopPropagation(); blurAfterMouse(e); });
            modal.append(resetBtn);
            var closeBtn = $('<div class="comodal__action comodal__action--close selector" tabindex="0">Готово</div>');
            function closeModal() { Lampa.Modal.close(); applyRatingSettingsRefresh(); setTimeout(function () { try { Lampa.Controller.toggle('settings'); } catch (err) {} }, 50); }
            closeBtn.on('hover:enter', closeModal); closeBtn.on('click', function (e) { if (e && e.preventDefault) e.preventDefault(); if (e && e.stopPropagation) e.stopPropagation(); blurAfterMouse(e); });
            modal.append(closeBtn);
            if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.open) {
                Lampa.Modal.open({ title: 'Настройки карточек', html: modal, size: 'medium', scroll_to_center: true, onBack: function () { closeModal(); } });
            }
        }, 200);
    }

    function positionAfter(element, anchorName) {
        setTimeout(function () {
            var node = element && (element.nodeType === 1 ? element : (element[0] || (element.get && element.get(0))));
            var anchor = document.querySelector('div[data-name="' + anchorName + '"]');
            if (anchor && anchor.parentNode && node && node.nodeType === 1) anchor.parentNode.insertBefore(node, anchor.nextSibling);
        }, 0);
    }
    function migrateStorageFormat() {
        var storedVersion = String(Lampa.Storage.get('card_overlay_cache_version', '0'));
        if (storedVersion !== CARD_OVERLAY_CACHE_VERSION) {
            clearRatingCaches(true);
            Lampa.Storage.set('card_overlay_cache_version', CARD_OVERLAY_CACHE_VERSION);
        }
        var keys = ['animated_reactions', 'lampa_rating_animated', 'colored_ratings_poster', 'rating_colored_windows', 'rating_show_tmdb', 'rating_show_imdb', 'rating_show_kp', 'rating_show_lampa', 'lampa_rating_show', 'lampa_rating_icon', 'detail_rating_icons', 'quality_show', 'quality_colored', 'type_labels_show', 'type_labels_colored'];
        for (var i = 0; i < keys.length; i++) { var v = Lampa.Storage.get(keys[i], undefined); if (v === '1' || v === 1) Lampa.Storage.set(keys[i], 'true'); else if (v === '0' || v === 0) Lampa.Storage.set(keys[i], 'false'); }
    }
    function closeModalSafe() {
        try { if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close(); } catch (e) {}
    }

    function findSettingsScrollElement() {
        var selectors = ['.settings__content', '.settings__body', '.settings .scroll__content', '.settings'];
        for (var i = 0; i < selectors.length; i++) {
            var el = document.querySelector(selectors[i]);
            if (el && el.scrollHeight > el.clientHeight) return el;
        }
        return document.querySelector('.settings') || null;
    }
    function getFocusedSettingsName(fallbackName) {
        try {
            var active = document.activeElement;
            var row = active && active.closest ? active.closest('[data-name]') : null;
            if (!row) row = document.querySelector('.settings-param.focus[data-name], .settings-param.hover[data-name], .settings-param.traverse[data-name]');
            return (row && row.getAttribute('data-name')) || fallbackName || '';
        } catch (e) { return fallbackName || ''; }
    }
    function restoreSettingsFocus(name, scrollTop) {
        function restore() {
            if (scrollTop != null) {
                var sc = findSettingsScrollElement();
                if (sc) try { sc.scrollTop = scrollTop; } catch (e) {}
            }
            if (!name) return;
            var target = document.querySelector('div[data-name="' + String(name).replace(/"/g, '\\"') + '"]');
            if (!target) return;
            try {
                var settings = document.querySelector('.settings') || target.closest('.settings') || document.body;
                if (Lampa.Controller && Lampa.Controller.collectionSet) Lampa.Controller.collectionSet($(settings));
                if (Lampa.Controller && Lampa.Controller.collectionFocus) Lampa.Controller.collectionFocus(target, settings);
            } catch (e) {}
            try { if (target.focus) target.focus(); } catch (e2) {}
        }
        setTimeout(restore, 0);
        setTimeout(restore, 80);
        setTimeout(restore, 180);
    }
    function updateSettingsKeepFocus(fallbackName) {
        var focusName = getFocusedSettingsName(fallbackName);
        var sc = findSettingsScrollElement();
        var scrollTop = sc ? sc.scrollTop : null;
        try { Lampa.Settings.update(); } catch (e) {}
        restoreSettingsFocus(focusName || fallbackName, scrollTop);
    }



    function addSettings() {
        if (!Lampa.SettingsApi) return;
        migrateStorageFormat();
        Lampa.SettingsApi.addComponent({
            component: 'card_overlay',
            name: 'Интерфейс Мод',
            icon: '<svg height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="21" height="21" rx="2" fill="white"></rect><mask id="path-2-inside-1_154_24" fill="white"><rect x="2" y="27" width="17" height="17" rx="2"></rect></mask><rect x="2" y="27" width="17" height="17" rx="2" stroke="white" stroke-width="6" mask="url(#path-2-inside-1_154_24)"></rect><rect x="27" y="2" width="17" height="17" rx="2" fill="white"></rect><rect x="27" y="34" width="17" height="3" fill="white"></rect><rect x="34" y="44" width="17" height="3" transform="rotate(-90 34 44)" fill="white"></rect></svg>'
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'rating_modal_open', type: 'trigger', default: false },
            field: { name: 'Настройки Карточек', description: 'Открыть окно настроек рейтингов, качества и лейблов' },
            onChange: function () { openRatingSettingsModal(); }
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'seasons_info_mode', type: 'select', values: { none: 'Выключить', aired: 'Актуальная информация', total: 'Полное количество' }, default: 'none' },
            field: { name: 'Информация о сериях', description: 'Как отображать информацию о сериях и сезонах' },
            onChange: function (v) { seasonInfoSettings.seasons_info_mode = v; updateSettingsKeepFocus('seasons_info_mode'); }
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'label_position', type: 'select', values: { 'top-right': 'Верхний правый', 'top-left': 'Верхний левый', 'bottom-right': 'Нижний правый', 'bottom-left': 'Нижний левый' }, default: 'top-right' },
            field: { name: 'Позиция лейбла о сериях', description: 'Позиция лейбла на постере детальной страницы' },
            onChange: function (v) { seasonInfoSettings.label_position = v; updateSettingsKeepFocus('label_position'); Lampa.Noty.show('Откройте карточку заново'); }
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'quality_source', type: 'select', values: { 'jacred': 'JacRed (парсер)', 'alloha': 'Alloha (API)', 'both': 'Сначала JacRed, потом Alloha' }, default: 'both' },
            field: { name: 'Источник качества', description: 'Откуда получать информацию о качестве видео' },
            onChange: function () { updateSettingsKeepFocus('quality_source'); refreshAllQualityLabels(); }
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'animated_reactions_in_player', type: 'trigger', default: true },
            field: { name: 'Анимированные реакции на странице фильма', description: 'Заменять иконки реакций на анимированные GIF в карточке фильма' },
            onChange: function () {
                if (!isAnimatedReactionsInPlayerEnabled()) { restoreOriginalReactions(); applyReactionsToSelectbox(); setTimeout(restoreOriginalReactions, 150); setTimeout(applyReactionsToSelectbox, 150); setTimeout(restoreOriginalReactions, 400); setTimeout(applyReactionsToSelectbox, 400); }
                setTimeout(applyPlayerReactions, 100);
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'colored_elements', type: 'trigger', default: false },
            field: { name: 'Цветные элементы', description: 'Статусы сериалов и возрастные ограничения цветными' },
            onChange: function (v) {
                updateSettingsKeepFocus('colored_elements');
                if (isTriggerOn('colored_elements', true)) { $('body').addClass('colored-elements-on'); colorizeSeriesStatus(); colorizeAgeRating(); colorizeDetailQuality(); }
                else { $('body').removeClass('colored-elements-on'); colorizeDetailQuality(); }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'lampa_rating_show', type: 'trigger', default: true },
            field: { name: 'Рейтинг Lampa', description: 'Показывать рейтинг Lampa на странице фильма' },
            onChange: function (v) {
                updateSettingsKeepFocus('lampa_rating_show');
                if (isTriggerOn('lampa_rating_show', true)) { $('body').removeAttr('data-lampa-rating-off'); $('.rate--lampa').show(); }
                else { $('body').attr('data-lampa-rating-off', '1'); $('.rate--lampa').hide(); }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'lampa_rating_icon', type: 'trigger', default: true },
            field: { name: 'Иконка в рейтинге Lampa', description: 'Показывать иконку реакции рядом с рейтингом Lampa на странице фильма' },
            onChange: function (v) {
                updateSettingsKeepFocus('lampa_rating_icon');
                if (isTriggerOn('lampa_rating_icon', true)) { $('body').attr('data-lampa-icon-on', '1'); } else { $('body').removeAttr('data-lampa-icon-on'); }
                $('.rate--lampa .rate-icon').each(function () {
                    var icon = $(this);
                    if (isTriggerOn('lampa_rating_icon', true)) {
                        icon.show();
                        var reaction = icon.attr('data-median-reaction');
                        if (reaction) icon.html('<img style="width:1em;height:1em;margin:0 0.15em;object-fit:contain;" data-reaction-type="' + reaction + '" src="' + getReactionImageSrc(reaction, true) + '">');
                    } else { icon.empty().hide(); }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'detail_rating_icons', type: 'trigger', default: true },
            field: { name: 'Значки рейтингов', description: 'Показывать иконки TMDB, IMDB, КП и звезду Lampa на странице фильма' },
            onChange: function () {
                updateSettingsKeepFocus('detail_rating_icons');
                try {
                    var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
                    var render = active && active.activity && active.activity.render ? active.activity.render() : null;
                    applyDetailRatingIcons(render);
                } catch (e) { applyDetailRatingIcons(); }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'lampa_rating_animated', type: 'trigger', default: false },
            field: { name: 'Анимированная иконка рейтинга Lampa', description: 'Анимированная иконка реакции в рейтинге Lampa на странице фильма' },
            onChange: function () {
                updateSettingsKeepFocus('lampa_rating_animated');
                if (isTriggerOn('lampa_rating_animated', false)) {
                    $('.rate--lampa').addClass('rate--lampa--animated');
                } else {
                    $('.rate--lampa').removeClass('rate--lampa--animated');
                }
                $('.rate--lampa .rate-icon').each(function () {
                    var icon = $(this);
                    var reaction = icon.attr('data-median-reaction');
                    if (reaction) icon.html('<img style="width:1em;height:1em;margin:0 0.15em;object-fit:contain;" data-reaction-type="' + reaction + '" src="' + getReactionImageSrc(reaction, true) + '">');
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'clear_ratings_cache', type: 'trigger', default: false },
            field: { name: 'Очистить кэш рейтингов', description: 'Одноразовое действие' },
            onChange: function (v) {
                if (!(v === true || v === 'true' || v === '1' || v === 1)) return;
                clearRatingCaches(false);
                try { Lampa.Storage.set('clear_ratings_cache', 'false'); } catch (e) {}
                Lampa.Noty.show('Кэш рейтингов очищен');
                updateSettingsKeepFocus('clear_ratings_cache');
                applyRatingSettingsRefresh();
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'card_overlay',
            param: { name: 'clear_quality_cache', type: 'trigger', default: false },
            field: { name: 'Очистить кэш качества', description: 'Одноразовое действие' },
            onChange: function (v) {
                if (!(v === true || v === 'true' || v === '1' || v === 1)) return;
                try {
                    Lampa.Storage.set(QUALITY_CACHE_KEY, {});
                    Lampa.Storage.set('clear_quality_cache', 'false');
                } catch (e) {}
                Lampa.Noty.show('Кэш качества очищен');
                updateSettingsKeepFocus('clear_quality_cache');
                refreshAllQualityLabels();
            }
        });

        function moveAfterInterface() {
            var $interface = $('.settings-folder[data-component="interface"]');
            if (!$interface.length) $interface = $('.settings-folder').filter(function () { return $(this).find('.settings-folder__name').text().trim() === 'Интерфейс'; });
            var $mod = $('.settings-folder[data-component="card_overlay"]');
            if (!$mod.length) $mod = $('.settings-folder').filter(function () { return $(this).find('.settings-folder__name').text().trim() === 'Интерфейс Мод'; });
            if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
        }
        var _moveTimer = 0;
        new MutationObserver(function () {
            if (_moveTimer) return;
            _moveTimer = setTimeout(function () { _moveTimer = 0; moveAfterInterface(); }, 100);
        }).observe(document.body, { childList: true, subtree: true });
        moveAfterInterface();
    }

    function setupCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        try {
            if (Lampa.Maker && Lampa.Maker.map) {
                var CardMaker = Lampa.Maker.map('Card');
                if (CardMaker && CardMaker.Card && !CardMaker.Card.__card_overlay_onvisible__) {
                    var originalOnVisible = CardMaker.Card.onVisible;
                    CardMaker.Card.onVisible = function () {
                        if (originalOnVisible) originalOnVisible.apply(this, arguments);
                        var card = this.html || this.card;
                        var data = card && card.card_data;
                        if (!data && this.card && this.card.card_data) data = this.card.card_data;
                        if (!data && this.card_data) data = this.card_data;
                        if (card && data && data.id) {
                            updateCardRating({ card: card, data: data });
                            if (isQualityShowOn()) processQualityForCards([card]);
                            addTypeLabel(card);
                            addYearBadge(card);
                        }
                    };
                    CardMaker.Card.__card_overlay_onvisible__ = true;
                }
            }
        } catch (e) {}
        Object.defineProperty(window.Lampa.Card.prototype, 'build', {
            get: function () { return this._build; },
            set: function (func) {
                var self = this;
                this._build = function () { func.apply(self); Lampa.Listener.send('card', { type: 'build', object: self }); };
            }
        });
    }

    // ===== ANIMATED REACTIONS IN PLAYER =====
    var PLAYER_REACTIONS_BASE_URL = 'https://amikdn.github.io/img';
    var PLAYER_REACTION_IMAGE_PATHS = {
        shit: PLAYER_REACTIONS_BASE_URL + '/reaction-shit.gif',
        think: PLAYER_REACTIONS_BASE_URL + '/reaction-think.gif',
        bore: PLAYER_REACTIONS_BASE_URL + '/reaction-bore.gif',
        fire: PLAYER_REACTIONS_BASE_URL + '/reaction-fire.gif',
        nice: PLAYER_REACTIONS_BASE_URL + '/reaction-nice.gif'
    };
    var PLAYER_REACTION_CONFIGS = [
        { selector: '.reaction--shit', url: PLAYER_REACTION_IMAGE_PATHS.shit, type: 'shit' },
        { selector: '.reaction--think', url: PLAYER_REACTION_IMAGE_PATHS.think, type: 'think' },
        { selector: '.reaction--bore', url: PLAYER_REACTION_IMAGE_PATHS.bore, type: 'bore' },
        { selector: '.reaction--fire', url: PLAYER_REACTION_IMAGE_PATHS.fire, type: 'fire' },
        { selector: '.reaction--nice', url: PLAYER_REACTION_IMAGE_PATHS.nice, type: 'nice' }
    ];
    var PLAYER_REACTION_TYPES = ['fire', 'nice', 'think', 'bore', 'shit'];

    function isAnimatedReactionsInPlayerEnabled() {
        return isTriggerOn('animated_reactions_in_player', true);
    }
    function getReactionTypeFromSrc(src) {
        if (!src) return null;
        for (var i = 0; i < PLAYER_REACTION_TYPES.length; i++) { if (src.indexOf(PLAYER_REACTION_TYPES[i]) !== -1) return PLAYER_REACTION_TYPES[i]; }
        return null;
    }
    function resetReactionStylesToDefault() {
        try { $('.reaction__icon').css({ width: '', height: '' }); $('.full-start-new__reactions > div').css('padding', ''); } catch (err) {}
    }
    function restoreOriginalReactions() {
        try {
            PLAYER_REACTION_CONFIGS.forEach(function (config) {
                document.querySelectorAll(config.selector + ' img').forEach(function (el) { if (el.dataset.originalSrc) { el.src = el.dataset.originalSrc; delete el.dataset.originalSrc; } });
            });
            document.querySelectorAll('.selectbox-item__icon img[data-original-src]').forEach(function (el) { el.src = el.dataset.originalSrc; delete el.dataset.originalSrc; });
            resetReactionStylesToDefault();
        } catch (err) {}
    }
    function applyReactionsToSelectbox() {
        try {
            var useAnimated = isAnimatedReactionsInPlayerEnabled();
            document.querySelectorAll('.selectbox-item__icon img').forEach(function (img) {
                var type = getReactionTypeFromSrc(img.src);
                if (!type || !PLAYER_REACTION_IMAGE_PATHS[type]) return;
                if (useAnimated) {
                    if (!img.dataset.originalSrc && img.src.indexOf(PLAYER_REACTIONS_BASE_URL) === -1) img.dataset.originalSrc = img.src;
                    img.src = PLAYER_REACTION_IMAGE_PATHS[type];
                } else if (img.dataset.originalSrc) {
                    img.src = img.dataset.originalSrc;
                    delete img.dataset.originalSrc;
                }
            });
        } catch (err) {}
    }
    function applyPlayerReactions() {
        try {
            var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
            if (!active || active.component !== 'full') return;
            if (!isAnimatedReactionsInPlayerEnabled()) { restoreOriginalReactions(); applyReactionsToSelectbox(); return; }
            function preloadReactionImage(reactionIndex) {
                if (reactionIndex >= PLAYER_REACTION_CONFIGS.length) return;
                var config = PLAYER_REACTION_CONFIGS[reactionIndex];
                var activityBlock = document.querySelector('.activity--active');
                var reactionIconElement = activityBlock ? activityBlock.querySelector(config.selector + ' img') : null;
                if (!reactionIconElement) { preloadReactionImage(reactionIndex + 1); return; }
                if (!reactionIconElement.dataset.originalSrc) reactionIconElement.dataset.originalSrc = reactionIconElement.src;
                var preloadImage = new Image();
                preloadImage.onload = preloadImage.onerror = function () { reactionIconElement.src = config.url; reactionIconElement.style.opacity = '1'; preloadReactionImage(reactionIndex + 1); };
                preloadImage.src = config.url;
                reactionIconElement.style.opacity = '1';
            }
            preloadReactionImage(0);
            $('.reaction__icon').css({ width: '2.5em', height: '2.5em' });
            if (Lampa.Platform.screen('mobile')) $('.full-start-new__reactions > div').css('padding', '0em');
            applyReactionsToSelectbox();
        } catch (err) {}
    }

    function initPlugin() {
        var style = document.createElement('style');
        style.type = 'text/css';
        var detailTmdbSvgCss = encodeURIComponent(DETAIL_TMDB_SVG).replace(/'/g, '%27').replace(/"/g, '%22');
        var detailImdbSvgCss = encodeURIComponent(DETAIL_IMDB_SVG).replace(/'/g, '%27').replace(/"/g, '%22');
        var detailKpSvgCss = encodeURIComponent(DETAIL_KP_SVG).replace(/'/g, '%27').replace(/"/g, '%22');
        style.textContent =
            '.rate-settings-modal .selector{cursor:pointer!important;pointer-events:auto!important;-webkit-tap-highlight-color:rgba(255,255,255,0.15);user-select:none;border:3px solid transparent;box-sizing:border-box;border-radius:0.35em}' +
            '.rate-settings-modal .selector.focus{border-color:rgba(255,255,255,0.8)!important;box-shadow:none!important}' +
            '.rate-settings-modal .selector:hover{background:rgba(255,255,255,0.08)}' +
            '.rate-settings-modal .selector:active{background:rgba(255,255,255,0.22)!important}' +
            '.rate-settings-note{display:block!important;width:100%!important;overflow:visible!important;box-sizing:border-box!important}' +
            '.rate-settings-site{display:inline-block;color:#8ab4ff!important;text-decoration:underline!important;white-space:nowrap!important}' +
            '[data-name="rating_modal_open"] .settings-param__value,[data-name="rating_modal_open"] .settings-param__control,[data-name="rating_modal_open"] input[type="checkbox"],[data-name="clear_ratings_cache"] .settings-param__value,[data-name="clear_ratings_cache"] .settings-param__control,[data-name="clear_ratings_cache"] input[type="checkbox"],[data-name="clear_quality_cache"] .settings-param__value,[data-name="clear_quality_cache"] .settings-param__control,[data-name="clear_quality_cache"] input[type="checkbox"]{display:none!important}' +
            '.card .card__view{position:relative!important}' +
            '.card__view > .card__vote:not(.card__vote--top):not(.card__vote--bottom):not(.card__vote-line):not(.card__vote-separate-wrap){display:none!important}' +
            '.card__vote,.card__vote-separate-wrap .card__vote{position:absolute!important;right:0!important;bottom:0!important;padding:0.2em 0.45em!important;border-radius:0.75em 0!important;white-space:nowrap!important;font-size:var(--rating-font-size,1.1em)!important;line-height:1!important;height:auto!important;border:none!important;margin:0!important}' +
            '.card__vote-separate-wrap .card__vote{position:static!important;margin:0!important}' +
            '.card__vote-separate-wrap .card__vote:not(.visible-last):not(.visible-only):not(.card__vote--hidden){margin-bottom:0.15em!important}' +
            '.card__vote.card__vote--hidden,.card__vote-separate-wrap .card__vote.card__vote--hidden{display:none!important;height:0!important;padding:0!important;margin:0!important;overflow:hidden!important;min-width:0!important;min-height:0!important;border:none!important;width:0!important;position:absolute!important;opacity:0!important;pointer-events:none!important}' +
            '.card__vote-line{position:absolute!important;right:0!important;bottom:0!important;padding:0.2em 0.45em!important;border-radius:0.75em 0!important;font-size:var(--rating-font-size,1.1em)!important;line-height:1!important;height:auto!important;border:none!important;margin:0!important}' +
            '.card__vote-separate-wrap{position:absolute!important;background:transparent!important;padding:0!important;width:auto!important;min-width:0!important;max-width:100%!important;overflow:visible!important;font-size:var(--rating-font-size,1.1em)!important}' +
            '.card__vote > span:first-child,.card__vote-line .card__rate-item > div,.card__vote-line .card__rate-item > .rate-value{display:inline-block!important;min-width:3ch!important;text-align:left!important;vertical-align:middle!important}' +
            '.card__vote--top,.card__vote-line.card__vote--top,.card__vote-separate-wrap.card__vote--top{transform-origin:top right!important}' +
            '.card__vote--bottom,.card__vote-line.card__vote--bottom,.card__vote-separate-wrap.card__vote--bottom{transform-origin:bottom right!important}' +
            '.card__vote--top{top:0!important;right:0!important;bottom:auto!important;border-radius:0 0.75em!important}' +
            '.card__vote--bottom{top:auto!important;right:0!important;bottom:0!important;border-radius:0.75em 0!important}' +
            '.card__vote-separate-wrap.card__vote--bottom .card__vote{border-radius:0.75em 0 0 0.75em!important}' +
            '.card__vote-separate-wrap.card__vote--bottom .card__vote.visible-last{border-radius:0.75em 0!important}' +
            '.card__vote-separate-wrap.card__vote--bottom .card__vote.visible-only{border-radius:0.75em 0!important}' +
            '.card__vote-separate-wrap.card__vote--top .card__vote{border-radius:0.75em 0 0 0.75em!important}' +
            '.card__vote-separate-wrap.card__vote--top .card__vote.visible-first{border-radius:0 0.75em!important}' +
            '.card__vote-separate-wrap.card__vote--top .card__vote.visible-only{border-radius:0 0.75em!important}' +
            '.card__vote-line .card__rate-item{display:block!important;white-space:nowrap}' +
            '.card__vote-line .card__rate-item:last-child{margin-bottom:0}' +
            '.card__vote .source--name{font-size:0!important;display:inline-block!important;color:transparent!important;width:12px!important;height:12px!important;overflow:hidden!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important;margin-left:0.25em!important;padding:0!important;border:none!important;vertical-align:middle!important}' +
            '@media (min-width:481px){.card__vote .source--name{width:18px!important;height:18px!important}}' +
            '@media (min-width:481px){.card__vote,.card__vote-line,.card__vote-separate-wrap,.card__vote-separate-wrap .card__vote{font-size:var(--rating-font-size,1.1em)!important}}' +
            '.rate--kp .source--name{background-image:url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' viewBox=\'0 0 300 300\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cmask id=\'mask0_1_69\' style=\'mask-type:alpha\' maskUnits=\'userSpaceOnUse\' x=\'0\' y=\'0\' width=\'300\' height=\'300\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'white\'/%3E%3C/mask%3E%3Cg mask=\'url(%23mask0_1_69)\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'black\'/%3E%3Cpath d=\'M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z\' fill=\'url(%23paint0_radial_1_69)\'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id=\'paint0_radial_1_69\' cx=\'0\' cy=\'0\' r=\'1\' gradientUnits=\'userSpaceOnUse\' gradientTransform=\'translate(89.9999 45) rotate(45) scale(296.985)\'%3E%3Cstop offset=\'0.5\' stop-color=\'%23FF5500\'/%3E%3Cstop offset=\'1\' stop-color=\'%23BBFF00\'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E")}' +
            '.card .rate--tmdb .source--name{background-image:url("data:image/svg+xml,' + detailTmdbSvgCss + '")}' +
            '.rate--lampa .rate-icon-reaction{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23e040fb\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 14h-4v-1h4v1zm0-2h-4v-1h4v1zM9 20h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z\'/%3E%3C/svg%3E")}' +
            '.rate-icon-reaction{background-repeat:no-repeat;background-position:center;background-size:contain}' +
            '.card-overlay-detail-icon-target{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:0!important;min-width:1.45em!important;width:1.45em!important;height:1.45em!important;line-height:1!important;font-size:1em!important;margin-left:0!important}' +
            '.card-overlay-detail-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:1.15em!important;height:1.15em!important;overflow:hidden!important;color:currentColor!important}' +
            '.card-overlay-detail-icon svg{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important}' +
            '.full-start-new__rate.rate--lampa .card-overlay-detail-icon-target,.full-start__rate.rate--lampa .card-overlay-detail-icon-target{padding:0!important;min-width:1.45em!important;width:1.45em!important;height:1.45em!important;margin-left:0!important}' +
            '.full-start-new__rate.rate--lampa .card-overlay-detail-icon,.full-start__rate.rate--lampa .card-overlay-detail-icon{width:1.05em!important;height:1.05em!important}' +
            'body[data-detail-rating-icons="on"] .full-start-new__rate.rate--tmdb .source--name:not(.card-overlay-detail-icon-target),body[data-detail-rating-icons="on"] .full-start__rate.rate--tmdb .source--name:not(.card-overlay-detail-icon-target){font-size:0!important;color:transparent!important;background:url("data:image/svg+xml,' + detailTmdbSvgCss + '") no-repeat center/contain!important;display:inline-flex!important;min-width:1.45em!important;width:1.45em!important;height:1.45em!important;padding:0!important}' +
            'body[data-detail-rating-icons="on"] .full-start-new__rate.rate--imdb .source--name:not(.card-overlay-detail-icon-target),body[data-detail-rating-icons="on"] .full-start__rate.rate--imdb .source--name:not(.card-overlay-detail-icon-target){font-size:0!important;color:transparent!important;background:url("data:image/svg+xml,' + detailImdbSvgCss + '") no-repeat center/contain!important;display:inline-flex!important;min-width:1.45em!important;width:1.45em!important;height:1.45em!important;padding:0!important}' +
            'body[data-detail-rating-icons="on"] .full-start-new__rate.rate--kp .source--name:not(.card-overlay-detail-icon-target),body[data-detail-rating-icons="on"] .full-start__rate.rate--kp .source--name:not(.card-overlay-detail-icon-target){font-size:0!important;color:transparent!important;background:url("data:image/svg+xml,' + detailKpSvgCss + '") no-repeat center/contain!important;display:inline-flex!important;min-width:1.45em!important;width:1.45em!important;height:1.45em!important;padding:0!important}' +
            '.full-start-new__rate.rate--lampa .card-overlay-lampa-star,.full-start__rate.rate--lampa .card-overlay-lampa-star{line-height:1!important}' +
            'body[data-detail-rating-icons="off"] .full-start-new__rate.rate--lampa .source--name,body[data-detail-rating-icons="off"] .full-start__rate.rate--lampa .source--name{font-size:.72em!important;font-weight:400!important;letter-spacing:0!important;text-transform:none!important;line-height:1!important;padding:0.2em 0.4em!important;min-width:0!important;width:auto!important;height:auto!important;margin-left:0!important;display:block!important}' +
            '.card .rate--lampa .rate-icon{font-size:0!important}' +
            'body:not([data-lampa-icon-on]) .full-start-new__rate.rate--lampa .rate-icon,body:not([data-lampa-icon-on]) .full-start__rate.rate--lampa .rate-icon{display:none!important}' +
            'body[data-lampa-rating-off] .full-start-new__rate.rate--lampa,body[data-lampa-rating-off] .full-start__rate.rate--lampa{display:none!important}' +
            '.card__vote img[src*=".gif"]{object-fit:contain!important}' +
            '.card__vote.rate--lampa img{display:block!important;max-height:12px!important;max-width:12px!important;min-width:0!important;min-height:0!important;object-fit:contain!important;margin-left:auto!important;height:auto!important;width:auto!important;flex-shrink:0!important}' +
            '@media (min-width:481px){.card__vote.rate--lampa img{max-height:18px!important;max-width:18px!important}}' +
            '.rate--lampa.rate--lampa--animated .rate-icon img{width:1.4em!important;height:1.4em!important;max-height:none!important;max-width:none!important;object-fit:contain;display:block!important;margin-left:auto!important}' +
            '.full-start-new__rate.rate--lampa .rate-icon img,.full-start__rate.rate--lampa .rate-icon img{max-height:1em!important;max-width:1em!important;object-fit:contain}' +
            '.rate--imdb .source--name{background-image:url("data:image/svg+xml,%3Csvg fill=\'%23ffcc00\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E%3Cpath d=\'M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z\'/%3E%3C/g%3E%3C/svg%3E")}' +
            '@media (max-width:480px) and (orientation:portrait){.full-start-new__rate.rate--lampa,.full-start__rate.rate--lampa{min-width:80px}body:not([data-lampa-icon-on]) .full-start-new__rate.rate--lampa,body:not([data-lampa-icon-on]) .full-start__rate.rate--lampa{min-width:0!important}}' +
            '.card__quality{position:absolute!important;left:0!important;bottom:0!important;padding:0.25em 0.45em!important;border-radius:0 0.75em!important;color:white!important;font-size:1.1em!important;line-height:1!important;z-index:10!important;white-space:nowrap!important}' +
            '.content-label{position:absolute!important;left:0!important;top:0!important;color:white!important;padding:0.25em 0.45em!important;border-radius:0.75em 0!important;font-size:1.1em!important;line-height:1!important;z-index:10!important;display:flex!important;align-items:center!important;justify-content:center!important}' +
            '.full-start-new__rate-line .full-start__status,.full-start-new__rate-line .full-start__pg:not(.hide),.full-start-new__meta-line .full-start__status,.full-start-new__meta-line .full-start__pg:not(.hide){border-radius:0.3em!important;padding:0.2em 0.4em!important;display:inline-block!important;line-height:1!important;white-space:nowrap!important}' +
            'body.colored-elements-on .full-start__pg.age-kids{background:#2ecc71!important;color:white!important}' +
            'body.colored-elements-on .full-start__pg.age-children{background:#3498db!important;color:white!important}' +
            'body.colored-elements-on .full-start__pg.age-teens{background:#f1c40f!important;color:black!important}' +
            'body.colored-elements-on .full-start__pg.age-almost-adult{background:#e67e22!important;color:white!important}' +
            'body.colored-elements-on .full-start__pg.age-adult{background:#e74c3c!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-completed{background:rgba(46,204,113,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-canceled{background:rgba(231,76,60,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-ongoing{background:rgba(243,156,18,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-production{background:rgba(52,152,219,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-planned{background:rgba(155,89,182,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-pilot{background:rgba(230,126,34,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-released{background:rgba(26,188,156,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-rumored{background:rgba(149,165,166,0.8)!important;color:white!important}' +
            'body.colored-elements-on .full-start__status.status-post{background:rgba(0,188,212,0.8)!important;color:white!important}' +
            '.full-start__pg.hide,.full-start__pg.nr{display:none!important}' +
            '.full-start-new__meta-line{display:none!important}' +
            '.season-info-label{position:absolute!important;color:#fff!important;padding:0.25em 0.45em!important;font-size:1.1em!important;line-height:1!important;z-index:10!important;white-space:nowrap!important}' +
            '@media (max-width:480px) and (orientation:portrait){.full-start-new__rate-line{display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:0.2em!important}.full-start-new__meta-line{display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:0.5em!important;width:100%!important;line-height:1!important;font-size:1em!important;margin-top:0.3em!important}.full-start-new__meta-line .full-start__status,.full-start-new__meta-line .full-start__pg{margin:0!important;display:inline-flex!important;align-items:center!important;line-height:1!important;white-space:nowrap!important}.full-start-new__details{margin-top:0.3em!important;display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:0.1em!important}.full-start-new__reactions{justify-content:center!important}.full-start-new__buttons{justify-content:center!important;text-align:center!important}.full-start-new__right,.full-start__right{text-align:center!important}.full-start-new__right h1,.full-start__right h1,.full-start-new__right .name,.full-start__right .name,.full-start__name{text-align:center!important;width:100%!important}.season-info-label{display:none!important}}' +
            'body[data-movie-labels="on"] .card--tv .card__type{display:none!important}';
        document.head.appendChild(style);

        applyRatingScale();
        if (isTriggerOn('lampa_rating_icon', true)) $('body').attr('data-lampa-icon-on', '1'); else $('body').removeAttr('data-lampa-icon-on');
        if (isDetailRatingIconsOn()) $('body').attr('data-detail-rating-icons', 'on'); else $('body').attr('data-detail-rating-icons', 'off');
        if (!isTriggerOn('lampa_rating_show', true)) $('body').attr('data-lampa-rating-off', '1'); else $('body').removeAttr('data-lampa-rating-off');
        addSettings();
        setupCardListener();
        startMainObserver();
        scheduleVisibleRatingsUpdate(120);
        setTimeout(function () { scheduleVisibleRatingsUpdate(250); }, 250);
        setTimeout(function () { scheduleVisibleRatingsUpdate(600); }, 600);
        window.addEventListener('scroll', function () { scheduleVisibleRatingsUpdate(120); }, { passive: true });
        window.addEventListener('keydown', function (e) {
            if (isCardUpdatesBlocked()) return;
            var code = e && (e.code || e.key);
            if (code === 'PageUp' || code === 'PageDown') scheduleVisibleRatingsUpdate(120);
        }, { passive: true });
        window.addEventListener('resize', function () { scheduleVisibleRatingsUpdate(0); repositionDetailMeta(); }, { passive: true });
        window.addEventListener('orientationchange', function () { setTimeout(repositionDetailMeta, 150); }, { passive: true });
        document.addEventListener('visibilitychange', function () { if (!document.hidden) { scheduleVisibleRatingsUpdate(0); repositionDetailMeta(); } });

        Lampa.Listener.follow('card', function (event) {
            if (event.type === 'build' && event.object.card) {
                var data = event.object.card.card_data;
                if (data && data.id) {
                    updateCardRating({ card: event.object.card, data: data });
                    if (isQualityShowOn()) processQualityForCards([event.object.card]);
                    addTypeLabel(event.object.card);
                    addYearBadge(event.object.card);
                    scheduleVisibleRatingsUpdate(0);
                }
            }
        });

        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite') {
                var render = event.object.activity.render();
                if (render && event.object.id) {
                    if (event.data && event.data.movie) storeTmdbRating(event.data.movie, event.data.movie.vote_average, true, event.data.movie.vote_count);
                    var kpBlock = $(render).find('.rate--kp');
                    var imdbBlock = $(render).find('.rate--imdb');
                    if (kpBlock.length || imdbBlock.length) {
                        var kpVal = parseFloat(kpBlock.find('div').first().text().trim()) || 0;
                        var imdbVal = parseFloat(imdbBlock.find('div').first().text().trim()) || 0;
                        if (kpVal > 0 || imdbVal > 0) {
                            var existing = ratingCache.get('kp_rating', event.object.id) || {};
                            ratingCache.set('kp_rating', event.object.id, { kp: kpVal > 0 ? kpVal : (existing.kp || 0), imdb: imdbVal > 0 ? imdbVal : (existing.imdb || 0), timestamp: Date.now() });
                        }
                    }
                }
                if (render && insertLampaBlock(render)) {
                    if (event.object.method && event.object.id) {
                        var ratingKey = event.object.method + "_" + event.object.id;
                        var cached = ratingCache.get('lampa_rating', ratingKey);
                        if (cached && cached.rating > 0) {
                            $(render).find('.rate--lampa .rate-value').text(formatRating(cached.rating));
                            renderLampaFullIcon($(render), cached.medianReaction);
                            applyDetailRatingIcons(render);
                            if (cached.medianReaction && isTriggerOn('lampa_rating_animated', false)) $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                            colorizeFullCardRatings(render);
                            scheduleVisibleRatingsUpdate(0);
                        } else {
                            addToQueue(function () {
                                getLampaRating(ratingKey).then(function (result) {
                                    if (result.rating !== null && result.rating > 0) {
                                        $(render).find('.rate--lampa .rate-value').text(formatRating(result.rating));
                                        renderLampaFullIcon($(render), result.medianReaction);
                                        applyDetailRatingIcons(render);
                                        if (result.medianReaction && isTriggerOn('lampa_rating_animated', false)) $(render).find('.rate--lampa').addClass('rate--lampa--animated');
                                    } else { $(render).find('.rate--lampa').hide(); }
                                    colorizeFullCardRatings(render);
                                    scheduleVisibleRatingsUpdate(0);
                                });
                            });
                        }
                    }
                }
                if (render && event.data.movie) {
                    if (isQualityShowOn()) loadQualityForDetail(event.data.movie, render);
                    applyDetailRatingIcons(render);
                    moveDetailMetaToSecondLine(render);
                    setTimeout(function () { moveDetailMetaToSecondLine(render); }, 150);
                }
                scheduleVisibleRatingsUpdate(0);
                if (isColoredElementsOn()) $('body').addClass('colored-elements-on'); else $('body').removeClass('colored-elements-on');
                setTimeout(function () { colorizeFullCardRatings(render); colorizeDetailQuality(); }, 100);
                colorizeSeriesStatus(render);
                colorizeAgeRating(render);
            }
        });

        seasonInfoSettings.seasons_info_mode = Lampa.Storage.get('seasons_info_mode', 'none');
        seasonInfoSettings.label_position = Lampa.Storage.get('label_position', 'top-right');
        addSeasonInfo();


        if (isColoredElementsOn()) { $('body').addClass('colored-elements-on'); colorizeSeriesStatus(); colorizeAgeRating(); colorizeDetailQuality(); }
        else { $('body').removeClass('colored-elements-on'); }

        processAllTypeLabels();

        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === 'activity') applyPlayerReactions();
            if (e.name === 'mine_reactions') setTimeout(applyPlayerReactions, 200);
            if (e.name === 'animated_reactions_in_player') {
                if (!isAnimatedReactionsInPlayerEnabled()) { restoreOriginalReactions(); applyReactionsToSelectbox(); setTimeout(restoreOriginalReactions, 150); setTimeout(applyReactionsToSelectbox, 150); setTimeout(restoreOriginalReactions, 400); setTimeout(applyReactionsToSelectbox, 400); }
                setTimeout(applyPlayerReactions, 100);
            }
        });

        Lampa.Listener.follow('full', function (fullScreenEvent) {
            if (fullScreenEvent.type === 'complite') applyPlayerReactions();
        });
    }

    Lampa.Manifest.plugins = {
        name: 'Интерфейс Мод',
        version: '1.0.0',
        description: 'Рейтинги, качество, лейблы типа на карточках + темы'
    };

    if (window.appready) { initPlugin(); }
    else { Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initPlugin(); }); }
})();
