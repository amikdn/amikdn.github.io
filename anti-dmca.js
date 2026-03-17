(function () {
    'use strict';

    var tmdbProxyHost = 'apitmdb.cub.rip';
    var tmdbDirectHost = 'api.themoviedb.org';
    var apiKey = '4ef0d7355d9ffb5151e987764708ce96';

    function fixUrl(url) {
        if (typeof url !== 'string') return url;
        if (url.indexOf(tmdbProxyHost) !== -1) url = url.replace(tmdbProxyHost, tmdbDirectHost);
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
                    s.success = function (data) {
                        var isObj = data && typeof data === 'object' && !Array.isArray(data);
                        var isBlocked = isObj && data.blocked;
                        var isEmpty = isObj && !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;

                        if (isBlocked || isEmpty) {
                            var card = getCardInfo();
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
