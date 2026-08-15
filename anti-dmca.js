(function () {
    'use strict';

    var DEFAULT_TMDB_HOST = 'api.themoviedb.org';
    var FALLBACK_API_KEY = '4ef0d7355d9ffb5151e987764708ce96';
    var TIMEOUT = 15000;

    var nativeFetch = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch.bind(window) : null;

    var cardPathRe = /\/3\/(movie|tv)\/(\d+)(?:\/|$|\?)/;
    var subPathRe = /\/3\/(?:movie|tv)\/\d+\/([^\/\?]+)/;
    var seasonNumRe = /\/season\/(\d+)(?:\/|$|\?)/;
    var blockedRe = /^\s*\{\s*"blocked"\s*:\s*true\s*\}\s*$/;
    var aiMetadataPathRe = /\/api\/ai\/metadata\/(\d+)\/(movie|tv)(?:\/|$|\?)/;

    var ownXhrs = new WeakSet();
    var resolvedTypes = {};
    var cardCache = {};
    var imagesCache = {};
    var seasonCache = {};

    function isBlockedPayload(text) {
        if (blockedRe.test(text || '')) return true;
        try {
            var data = JSON.parse(text || '{}');
            return !!(data && (data.blocked === true || (data.movie && data.movie.blocked === true)));
        } catch (e) {}
        return false;
    }

    function clearBlockedFlag(data) {
        if (!data || typeof data !== 'object') return data;
        try { delete data.blocked; } catch (e) { data.blocked = false; }
        if (data.movie && typeof data.movie === 'object') {
            try { delete data.movie.blocked; } catch (e) { data.movie.blocked = false; }
        }
        return data;
    }

    function otherType(type) {
        return type === 'tv' ? 'movie' : 'tv';
    }

    function rememberType(id, type) {
        if (!id || (type !== 'movie' && type !== 'tv')) return;
        resolvedTypes['movie_' + id] = type;
        resolvedTypes['tv_' + id] = type;
    }

    function resolvedType(id, type) {
        return resolvedTypes[type + '_' + id] || type;
    }

    function detectType(item) {
        if (!item) return null;
        if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type;
        if (item.method === 'movie' || item.method === 'tv') return item.method;
        if (item.first_air_date || item.original_name || item.number_of_seasons) return 'tv';
        if (item.release_date || item.original_title) return 'movie';
        return null;
    }

    function rememberItem(item) {
        clearBlockedFlag(item);
        var type = detectType(item);
        var id = item && (item.tmdb_id || item.id);
        if (type && id) rememberType(id, type);
    }

    function rememberResults(data) {
        if (data && Array.isArray(data.results)) data.results.forEach(rememberItem);
    }

    function rewriteResolvedUrl(url) {
        if (typeof url !== 'string') return url;
        var m = url.match(cardPathRe);
        if (!m) return url;
        var actual = resolvedType(m[2], m[1]);
        if (actual === m[1]) return url;
        return url.replace('/3/' + m[1] + '/' + m[2], '/3/' + actual + '/' + m[2]);
    }

    function hostFromUrl(url) {
        if (typeof url !== 'string' || !url) return '';
        return url.replace(/^[a-z]+:\/\//i, '').replace(/[\/?].*$/, '');
    }

    function getTmdbApiBase() {
        try {
            var proxy = hostFromUrl(Lampa.Storage.get('anti_dmca_tmdb_host', ''));
            if (proxy) return 'https://' + proxy + '/3/';
        } catch (e) {}
        return 'https://' + DEFAULT_TMDB_HOST + '/3/';
    }

    function getTmdbHost() {
        return hostFromUrl(getTmdbApiBase()) || DEFAULT_TMDB_HOST;
    }

    function isMirrorTmdb(url) {
        return typeof url === 'string' && (url.indexOf('apitmdb.') !== -1 || url.indexOf('tmdb.') !== -1) && url.indexOf(getTmdbHost()) === -1;
    }

    function getLang() {
        try { return Lampa.Storage.get('language') || 'ru'; } catch (e) {}
        return (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'ru';
    }

    function getApiKey() {
        try {
            var own = Lampa.Storage.get('anti_dmca_tmdb_key', '') || Lampa.Storage.get('tmdb_key', '') || '';
            if (own) return own;
        } catch (e) {}
        try {
            if (Lampa.TMDB && typeof Lampa.TMDB.key === 'function') {
                var key = Lampa.TMDB.key();
                if (key) return key;
            }
        } catch (e) {}
        return FALLBACK_API_KEY;
    }

    function apiKeyParam() {
        var key = getApiKey();
        return key ? 'api_key=' + key + '&' : '';
    }

    function tmdbUrl(type, id, suffix, params) {
        var base = getTmdbApiBase();
        if (base.charAt(base.length - 1) !== '/') base += '/';
        return base + type + '/' + id + (suffix || '') + '?' + apiKeyParam() + params;
    }

    function httpJson(url) {
        if (nativeFetch) {
            var task = nativeFetch(url).then(function (r) {
                if (!r.ok) return Promise.reject(new Error('HTTP ' + r.status));
                return r.json();
            });
            return Promise.race([task, new Promise(function (_, rej) {
                setTimeout(function () { rej(new Error('timeout')); }, TIMEOUT);
            })]);
        }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            ownXhrs.add(xhr);
            var timer = setTimeout(function () {
                try { xhr.abort(); } catch (e) {}
                reject(new Error('timeout'));
            }, TIMEOUT);
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                clearTimeout(timer);
                if (xhr.status < 200 || xhr.status >= 300) { reject(new Error('HTTP ' + xhr.status)); return; }
                try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('bad json')); }
            };
            xhr.onerror = function () { clearTimeout(timer); reject(new Error('network error')); };
            xhr.send();
        });
    }

    function validator(check, message) {
        return function (data) {
            if (check(data)) return data;
            return Promise.reject(new Error(message));
        };
    }

    function cached(store, key, factory) {
        if (store[key]) return store[key];
        var p = factory().catch(function (error) {
            delete store[key];
            return Promise.reject(error);
        });
        store[key] = p;
        return p;
    }

    var validCard = validator(function (d) { return d && d.id; }, 'invalid card');
    var validImages = validator(function (d) { return d && (d.logos || d.backdrops || d.posters); }, 'invalid images');
    var validSeason = validator(function (d) { return d && (d.id !== undefined || d.episodes); }, 'invalid season');

    function fetchCard(id, type, preferAlternate) {
        var key = type + '_' + id;
        var actual = resolvedType(id, type);
        if (preferAlternate && !resolvedTypes[key]) actual = otherType(type);

        function load(candidate) {
            var append = 'credits,external_ids,videos,recommendations,similar' + (candidate === 'tv' ? ',content_ratings' : '');
            return httpJson(tmdbUrl(candidate, id, '', 'language=' + getLang() + '&append_to_response=' + append))
                .then(validCard)
                .then(function (data) {
                    rememberType(id, candidate);
                    clearBlockedFlag(data);
                    data.media_type = candidate;
                    cardCache[candidate + '_' + id] = Promise.resolve(data);
                    return data;
                });
        }

        return cached(cardCache, key, function () {
            return load(actual).catch(function (error) {
                if (preferAlternate || resolvedTypes[key] === actual) return Promise.reject(error);
                return load(otherType(actual));
            });
        });
    }

    function fetchImages(id, type) {
        type = resolvedType(id, type);
        var url = tmdbUrl(type, id, '/images', 'include_image_language=' + getLang() + ',en,null');
        function load() { return httpJson(url).then(validImages); }
        return cached(imagesCache, type + '_' + id, function () {
            return load().catch(load);
        });
    }

    function fetchSeason(tvId, seasonNum) {
        var url = tmdbUrl('tv', tvId, '/season/' + seasonNum, 'language=' + getLang());
        return cached(seasonCache, 'tv_' + tvId + '_s' + seasonNum, function () {
            return httpJson(url).then(validSeason);
        });
    }

    function safeCard(id, type, source) {
        var src = source && typeof source === 'object' ? source : {};
        var isTv = type === 'tv';
        var title = src.title || src.name || src.original_title || src.original_name || '';
        return {
            id: parseInt(id, 10) || id,
            media_type: isTv ? 'tv' : 'movie',
            title: title,
            name: title,
            original_title: title,
            original_name: title,
            overview: src.overview || '',
            poster_path: src.poster_path || null,
            backdrop_path: src.backdrop_path || null,
            release_date: src.release_date || '',
            first_air_date: src.first_air_date || '',
            vote_average: src.vote_average || 0,
            genres: [],
            production_countries: [],
            production_companies: [],
            spoken_languages: [],
            credits: { cast: [], crew: [] },
            videos: { results: [] },
            images: { logos: [], backdrops: [], posters: [] },
            recommendations: { results: [] },
            similar: { results: [] },
            seasons: [],
            number_of_seasons: 0,
            episode_run_time: [],
            runtime: 0
        };
    }

    function recover(url, preferAlternate) {
        var m = typeof url === 'string' ? url.match(cardPathRe) : null;
        if (!m) return null;

        var type = m[1], id = m[2];
        var sub = (url.match(subPathRe) || [])[1] || null;

        if (sub === 'images') {
            return fetchImages(id, type).catch(function () {
                return { id: parseInt(id, 10), logos: [], backdrops: [], posters: [] };
            });
        }
        if (sub === 'season' && type === 'tv') {
            return fetchSeason(id, parseInt((url.match(seasonNumRe) || [])[1], 10) || 1);
        }
        return fetchCard(id, type, preferAlternate).then(function (data) {
            return sub && data[sub] !== undefined ? data[sub] : data;
        }, function () {
            var stub = safeCard(id, resolvedType(id, type));
            return sub && stub[sub] !== undefined ? stub[sub] : stub;
        });
    }

    function define(xhr, prop, value) {
        try { Object.defineProperty(xhr, prop, { value: value, configurable: true }); } catch (e) {}
    }

    function patchXhr(xhr, payload) {
        var text = JSON.stringify(payload);
        try {
            Object.defineProperty(xhr, 'responseText', { get: function () { return text; }, configurable: true });
            Object.defineProperty(xhr, 'response', { get: function () { return payload; }, configurable: true });
        } catch (e) {}
        define(xhr, 'status', 200);
    }

    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        var args = Array.prototype.slice.call(arguments);
        if (typeof url === 'string') {
            args[1] = this.__admca_url = rewriteResolvedUrl(url);
        }
        return origOpen.apply(this, args);
    };

    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        var xhr = this;
        if (ownXhrs.has(xhr)) return origSend.apply(this, arguments);

        var reqUrl = xhr.__admca_url || '';

        var onReady = xhr.onreadystatechange;
        var onLoad = xhr.onload;
        var onError = xhr.onerror;
        var onAbort = xhr.onabort;

        function fireLoad() {
            if (onReady) onReady.call(xhr);
            if (onLoad) onLoad.call(xhr);
        }

        if (aiMetadataPathRe.test(reqUrl)) {
            setTimeout(function () {
                patchXhr(xhr, {});
                define(xhr, 'readyState', 4);
                define(xhr, 'responseURL', reqUrl);
                fireLoad();
            }, 0);
            return;
        }

        if (!cardPathRe.test(reqUrl) && !isMirrorTmdb(reqUrl)) return origSend.apply(this, arguments);

        var handled = false;

        function takeOver(url, preferAlternate) {
            var p = recover(url, preferAlternate);
            if (!p) return false;
            handled = true;
            p.then(function (payload) { patchXhr(xhr, payload); fireLoad(); }, fireLoad);
            return true;
        }

        function onResponse() {
            if (handled) return true;
            var text = '';
            try { text = (xhr.responseText || '').trim(); } catch (e) {}
            var isBlocked = isBlockedPayload(text);
            var isFailed = xhr.status === 0 || xhr.status >= 400 || !text;
            if (!isBlocked && !isFailed) return false;
            return takeOver(xhr.responseURL || reqUrl, !isBlocked && xhr.status === 404);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) { if (onReady) onReady.call(xhr); return; }
            if (!onResponse() && onReady) onReady.call(xhr);
        };
        xhr.onload = function () {
            if (!handled && !onResponse() && onLoad) onLoad.call(xhr);
        };
        xhr.onerror = function () {
            if ((handled || !takeOver(reqUrl)) && onError) onError.call(xhr);
        };
        xhr.onabort = function () {
            if ((handled || !takeOver(reqUrl)) && onAbort) onAbort.call(xhr);
        };

        return origSend.apply(this, arguments);
    };

    if (typeof fetch !== 'undefined') {
        var origFetch = window.fetch;

        function jsonResponse(payload) {
            return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        window.fetch = function (url, opts) {
            var isText = typeof url === 'string';
            var reqUrl = isText ? rewriteResolvedUrl(url) : '';

            return origFetch.call(this, isText ? reqUrl : url, opts).then(function (response) {
                if (!cardPathRe.test(reqUrl)) return response;
                return response.clone().text().then(function (text) {
                    var t = (text || '').trim();
                    var isBlocked = isBlockedPayload(t);
                    if (!isBlocked && response.ok && response.status !== 0 && t) return response;
                    var p = recover(reqUrl, !isBlocked && response.status === 404);
                    if (!p) return response;
                    return p.then(jsonResponse);
                }).catch(function () { return response; });
            }, function (error) {
                var p = recover(reqUrl);
                if (!p) throw error;
                return p.then(jsonResponse);
            });
        };
    }

    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;
        window.anti_dmca_plugin = true;
        try {
            console.log('[anti-dmca] v7-direct-tmdb active, host=' + getTmdbHost());
        } catch (e) {}

        var settings = window.lampa_settings;
        settings.disable_features = settings.disable_features || {};
        settings.disable_features.dmca = true;
        settings.disable_features.metadata = true;

        if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
            Lampa.Listener.follow('request_secuses', function (event) {
                if (!event) return;
                var data = event.data;
                var url = (event.params && event.params.url) || '';
                var match = url.match(cardPathRe);
                var blocked = !!(data && (data.blocked === true || (data.movie && data.movie.blocked === true)));

                if (match && blocked && typeof event.abort === 'function') {
                    var resume = event.abort();
                    var sub = (url.match(subPathRe) || [])[1] || null;
                    fetchCard(match[2], match[1]).then(function (card) {
                        clearBlockedFlag(card);
                        resume(sub && card[sub] !== undefined ? card[sub] : card);
                    }, function () {
                        var fallback = clearBlockedFlag(data);
                        var hasTitle = fallback && (fallback.title || fallback.name);
                        if (sub) {
                            resume(hasTitle && fallback[sub] !== undefined ? fallback[sub] : safeCard(match[2], match[1])[sub]);
                            return;
                        }
                        resume(hasTitle ? fallback : safeCard(match[2], match[1], fallback));
                    });
                    return;
                }

                clearBlockedFlag(data);
                rememberResults(data);
            });

            Lampa.Listener.follow('line', function (event) {
                if (!event) return;
                rememberResults(event.data);
                if (Array.isArray(event.items)) event.items.forEach(rememberItem);
            });
        }

        Lampa.Utils.dcma = function () { return undefined; };
        try {
            Object.defineProperty(settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) { settings.dcma = []; }

        var tmdbSource = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (tmdbSource && typeof tmdbSource.parseCountries === 'function') {
            var origPC = tmdbSource.parseCountries;
            tmdbSource.parseCountries = function () {
                var r = origPC.apply(this, arguments);
                return Array.isArray(r) ? r : [];
            };
        }
    }

    if (window.appready) {
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
