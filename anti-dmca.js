(function () {
    'use strict';

    var LOG = function (step, msg, data) {
        var args = ['[anti-dmca] ' + step + ': ' + msg];
        if (data !== undefined) args.push(data);
        console.log.apply(console, args);
    };

    var tmdbProxyHost = 'apitmdb.cub.rip';
    var tmdbDirectHost = 'api.themoviedb.org';

    function fixTmdbUrl(url) {
        if (typeof url !== 'string') return url;
        if (url.indexOf(tmdbProxyHost) !== -1) url = url.replace(tmdbProxyHost, tmdbDirectHost);
        if (url.indexOf('themoviedb.org') !== -1 && url.indexOf('/tv/') !== -1 && url.indexOf('/season/0') !== -1) {
            url = url.replace(/\/season\/0\b/, '/season/1');
        }
        return url;
    }

    (function patchTmdbUrl() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[1] === 'string') args[1] = fixTmdbUrl(args[1]);
            return origOpen.apply(this, args);
        };
        if (typeof fetch !== 'undefined') {
            var origFetch = window.fetch;
            window.fetch = function (url, opts) {
                if (typeof url === 'string') url = fixTmdbUrl(url);
                return origFetch.call(this, url, opts);
            };
        }
    })();
    LOG('init', 'скрипт загружен');

    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;

        window.anti_dmca_plugin = true;

        var tmdbSource = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (tmdbSource && typeof tmdbSource.parseCountries === 'function') {
            var origParseCountries = tmdbSource.parseCountries;
            tmdbSource.parseCountries = function (movie) {
                var result = origParseCountries.apply(this, arguments);
                if (!Array.isArray(result)) return [];
                return result;
            };
            LOG('start', 'TMDB.parseCountries пропатчен (всегда массив)');
        }

        // 2. Перехват Listener.send: удаляем blocked
        if (typeof Lampa.Listener.send === 'function') {
            var origSend = Lampa.Listener.send.bind(Lampa.Listener);
            Lampa.Listener.send = function (type, data) {
                if (type === 'request_secuses' && data && typeof data === 'object' && !Array.isArray(data) && data.blocked) {
                    delete data.blocked;
                }
                return origSend(type, data);
            };
        }

        // 3. dcma всегда пустой
        var keepDcmaEmpty = function () {
            Lampa.Utils.dcma = function () { return undefined };
        };
        try {
            Object.defineProperty(window.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) {
            window.lampa_settings.dcma = [];
        }
        keepDcmaEmpty();
        setInterval(keepDcmaEmpty, 2000);

        // 4. jQuery.ajax: подмена URL + удаление blocked из ответа
        if (window.jQuery && window.jQuery.ajax) {
            var origAjax = window.jQuery.ajax;
            window.jQuery.ajax = function (urlOrSettings, options) {
                var s = typeof urlOrSettings === 'object' && urlOrSettings !== null
                    ? Object.assign({}, urlOrSettings)
                    : (options ? Object.assign({ url: urlOrSettings }, options) : { url: urlOrSettings });
                if (s.url && typeof s.url === 'string') {
                    if (s.url.indexOf('/undefined/') !== -1 && Lampa.Activity && typeof Lampa.Activity.active === 'function') {
                        try {
                            var active = Lampa.Activity.active();
                            var id = active && (active.id || active.movie_id || active.tv_id || (active.item && (active.item.id || active.item.movie_id || active.item.tv_id)));
                            if (id != null && String(id).match(/^\d+$/)) {
                                s.url = s.url.replace(/\/undefined\//g, '/' + id + '/');
                            }
                        } catch (e) {}
                    }
                    s.url = fixTmdbUrl(s.url);
                }
                if (typeof s.success === 'function') {
                    var origSuccess = s.success;
                    s.success = function (data) {
                        if (data && typeof data === 'object' && !Array.isArray(data) && data.blocked) {
                            var active = null;
                            try { active = Lampa.Activity.active(); } catch (e) {}
                            var cardId = active && (active.id || (active.item && active.item.id));
                            var cardType = null;
                            if (active) {
                                if (active.method === 'tv' || active.card_type === 'tv' || (active.item && active.item.name)) cardType = 'tv';
                                else if (active.method === 'movie' || active.card_type === 'movie' || (active.item && active.item.title)) cardType = 'movie';
                            }
                            if (cardId && cardType) {
                                var lang = Lampa.Storage.get('tmdb_lang', 'ru');
                                var apiKey = '4ef0d7355d9ffb5151e987764708ce96';
                                var tmdbUrl = 'https://' + tmdbDirectHost + '/3/' + cardType + '/' + cardId + '?api_key=' + apiKey + '&language=' + lang + '&append_to_response=credits,external_ids,videos';
                                LOG('bypass', 'ответ blocked, перезапрос TMDB → ' + tmdbUrl);
                                var self = this;
                                var args = arguments;
                                origAjax.call(window.jQuery, {
                                    url: tmdbUrl,
                                    dataType: 'json',
                                    success: function (realData) {
                                        LOG('bypass', 'TMDB вернул данные для ' + cardType + '/' + cardId);
                                        origSuccess.call(self, realData, args[1], args[2]);
                                    },
                                    error: function () {
                                        LOG('bypass', 'TMDB ошибка, передаём пустой объект');
                                        delete data.blocked;
                                        origSuccess.apply(self, args);
                                    }
                                });
                                return;
                            }
                            delete data.blocked;
                        }
                        return origSuccess.apply(this, arguments);
                    };
                }
                return origAjax.call(this, s);
            };
        }

        LOG('start', 'готово');
    }

    if (window.appready) {
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
