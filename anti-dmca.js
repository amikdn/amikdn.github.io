(function () {
    'use strict';

    var tmdbDirectHost = 'api.themoviedb.org';
    var apiKey = '4ef0d7355d9ffb5151e987764708ce96';
    var defaultCubMirrors = ['cub.rip', 'durex.monster', 'cubnotrip.top'];

    function getCubDomain() {
        try {
            if (typeof Lampa !== 'undefined' && Lampa.Manifest && Lampa.Manifest.cub_domain)
                return Lampa.Manifest.cub_domain;
            var use = typeof localStorage !== 'undefined' && localStorage.getItem('cub_domain');
            var mirrors = defaultCubMirrors.slice();
            try {
                var user = localStorage.getItem('cub_mirrors');
                if (user) { user = JSON.parse(user); if (Array.isArray(user)) mirrors = mirrors.concat(user); }
            } catch (e) {}
            if (use && mirrors.indexOf(use) !== -1) return use;
            return mirrors[0] || 'cub.rip';
        } catch (e) {}
        return 'cub.rip';
    }

    function getLampaTmdbOrigin() {
        try {
            var protocol = (typeof Lampa !== 'undefined' && Lampa.Utils && typeof Lampa.Utils.protocol === 'function')
                ? Lampa.Utils.protocol() : ((typeof localStorage !== 'undefined' && localStorage.getItem('protocol')) || 'https') + '://';
            var domain = getCubDomain();
            return (protocol.replace(/\/+$/, '') || 'https:') + '//apitmdb.' + domain;
        } catch (e) {}
        return 'https://apitmdb.cub.rip';
    }

    function fixUrl(url) {
        if (typeof url !== 'string') return url;
        if (url.indexOf(tmdbDirectHost) !== -1) {
            var origin = getLampaTmdbOrigin();
            url = url.replace('https://' + tmdbDirectHost, origin).replace('http://' + tmdbDirectHost, origin);
        }
        return url;
    }

    (function patchNetwork() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[1] === 'string') args[1] = fixUrl(args[1]);
            return origOpen.apply(this, args);
        };
        if (typeof fetch !== 'undefined') {
            var origFetch = window.fetch;
            window.fetch = function (url, opts) {
                if (typeof url === 'string') url = fixUrl(url);
                return origFetch.call(this, url, opts);
            };
        }
    })();

    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;

        window.anti_dmca_plugin = true;

        Lampa.Utils.dcma = function () { return undefined };
        try {
            Object.defineProperty(window.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) {
            window.lampa_settings.dcma = [];
        }

        var tmdbSource = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (tmdbSource && typeof tmdbSource.parseCountries === 'function') {
            var origPC = tmdbSource.parseCountries;
            tmdbSource.parseCountries = function (movie) {
                var r = origPC.apply(this, arguments);
                return Array.isArray(r) ? r : [];
            };
        }

        if (window.jQuery && window.jQuery.ajax) {
            var origAjax = window.jQuery.ajax;

            function fetchFromTmdb(cardId, cardType, lang, origSuccess, origError, self, args) {
                var tmdbUrl = 'https://' + tmdbDirectHost + '/3/' + cardType + '/' + cardId
                    + '?api_key=' + apiKey + '&language=' + (lang || 'ru')
                    + '&append_to_response=credits,external_ids,videos,recommendations,similar';
                origAjax.call(window.jQuery, {
                    url: tmdbUrl,
                    dataType: 'json',
                    success: function (realData) {
                        origSuccess.call(self, realData, args[1], args[2]);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (origError) origError(jqXHR || {}, textStatus || 'error', errorThrown || '');
                    }
                });
            }

            /** Подмена при вызове complite(data) — для слоя Network.silent (в т.ч. ответы из кэша) */
            function fetchFromTmdbThenCall(onSuccess, onError, cardId, cardType, lang) {
                var tmdbUrl = 'https://' + tmdbDirectHost + '/3/' + cardType + '/' + cardId
                    + '?api_key=' + apiKey + '&language=' + (lang || 'ru')
                    + '&append_to_response=credits,external_ids,videos,recommendations,similar';
                origAjax.call(window.jQuery, {
                    url: tmdbUrl,
                    dataType: 'json',
                    success: function (realData) {
                        if (onSuccess) onSuccess(realData);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (onError) onError(jqXHR || {}, textStatus || 'error', errorThrown || '');
                    }
                });
            }

            function getCardInfo() {
                try {
                    var active = Lampa.Activity.active();
                    if (!active) return null;
                    var id = active.id || (active.item && active.item.id);
                    var type = null;
                    if (active.method === 'tv' || active.card_type === 'tv' || (active.item && active.item.name && !active.item.title)) type = 'tv';
                    else if (active.method === 'movie' || active.card_type === 'movie' || (active.item && active.item.title)) type = 'movie';
                    if (id && type) return { id: id, type: type };
                } catch (e) {}
                return null;
            }

            /** Извлекает id и тип (movie/tv) из URL запроса к любому зеркалу Lampa (tmdb.cub.rip, tmdb.durex.monster и т.д.) */
            function getCardInfoFromUrl(url) {
                if (typeof url !== 'string') return null;
                var m = url.match(/\/(movie|tv)\/(\d+)(?:\/|$|\?)/);
                if (m) return { id: m[2], type: m[1] };
                return null;
            }

            window.jQuery.ajax = function (urlOrSettings, options) {
                var s = typeof urlOrSettings === 'object' && urlOrSettings !== null
                    ? Object.assign({}, urlOrSettings)
                    : (options ? Object.assign({ url: urlOrSettings }, options) : { url: urlOrSettings });

                if (s.url && typeof s.url === 'string') {
                    s.url = fixUrl(s.url);
                }

                if (typeof s.success === 'function') {
                    var origSuccess = s.success;
                    var origError = s.error;
                    var requestUrl = s.url;
                    s.success = function (data) {
                        var isObj = data && typeof data === 'object' && !Array.isArray(data);
                        var isBlocked = isObj && data.blocked;
                        var isEmpty = isObj && !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;

                        if (isBlocked || isEmpty) {
                            var card = getCardInfo() || getCardInfoFromUrl(requestUrl);
                            if (card) {
                                var lang = Lampa.Storage.get('tmdb_lang', 'ru');
                                fetchFromTmdb(card.id, card.type, lang, origSuccess, origError, this, arguments);
                                return;
                            }
                            if (origError) origError({}, 'blocked', 'Content blocked');
                            else return origSuccess.apply(this, arguments);
                            return;
                        }
                        return origSuccess.apply(this, arguments);
                    };
                }
                return origAjax.call(this, s);
            };

            /** Перехват на уровне Lampa.Network.silent — ловит запросы через любой экземпляр Reguest */
            var network = Lampa.Network || (Lampa.Api && Lampa.Api.network);
            if (network && typeof network.silent === 'function') {
                var origSilent = network.silent.bind(network);
                network.silent = function (url, complite, error, post_data, params) {
                    var wrappedComplite = function (data) {
                        var isObj = data && typeof data === 'object' && !Array.isArray(data);
                        var isBlocked = isObj && data.blocked;
                        var isEmpty = isObj && !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;
                        if (isBlocked || isEmpty) {
                            var card = getCardInfoFromUrl(url) || getCardInfo();
                            if (card) {
                                var lang = Lampa.Storage.get('tmdb_lang', 'ru');
                                fetchFromTmdbThenCall(complite, error, card.id, card.type, lang);
                                return;
                            }
                            if (error) error({}, 'blocked', 'Content blocked');
                            else if (complite) complite(data);
                            return;
                        }
                        if (complite) complite(data);
                    };
                    return origSilent(url, wrappedComplite, error, post_data, params);
                };
            }

            /** Перехват через событие request_secuses — срабатывает и при ответе из кэша (минуя $.ajax) */
            if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
                Lampa.Listener.follow('request_secuses', function (e) {
                    var params = e.params;
                    var data = e.data;
                    var abort = e.abort;
                    if (!params || !data || typeof data !== 'object' || Array.isArray(data)) return;
                    var isBlocked = data.blocked;
                    var isEmpty = !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;
                    if (!isBlocked && !isEmpty) return;
                    var card = getCardInfoFromUrl(params.url) || getCardInfo();
                    if (!card) return;
                    var sendSecuses = typeof abort === 'function' ? abort() : null;
                    if (typeof sendSecuses !== 'function') return;
                    var lang = Lampa.Storage.get('tmdb_lang', 'ru');
                    fetchFromTmdbThenCall(
                        function (realData) { sendSecuses(realData); },
                        function () {
                            if (params.error) params.error({}, 'blocked', 'Content blocked');
                            if (params.end) params.end();
                        },
                        card.id, card.type, lang
                    );
                });
            }
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
