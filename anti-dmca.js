(function () {
    'use strict';

    var LOG = true; // false — отключить логи в консоль
    function log() { if (LOG && typeof console !== 'undefined' && console.log) console.log.apply(console, ['[anti-dmca]'].concat(Array.prototype.slice.call(arguments))); }

    var tmdbDirectHost = 'api.themoviedb.org';
    var apiKey = '4ef0d7355d9ffb5151e987764708ce96';
    var defaultCubMirrors = ['cub.rip', 'durex.monster', 'cubnotrip.top'];
    /** true = запрос подмены с api.themoviedb.org, не перенаправлять на зеркало */
    var directTmdbRequest = false;

    function isTmdbUrl(url) {
        if (typeof url !== 'string') return false;
        return url.indexOf('api.themoviedb.org') !== -1 || url.indexOf('apitmdb.') !== -1 || url.indexOf('tmdb.') !== -1;
    }

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
        if (directTmdbRequest && url.indexOf(tmdbDirectHost) !== -1) return url;
        if (url.indexOf(tmdbDirectHost) !== -1) {
            var origin = getLampaTmdbOrigin();
            var was = url;
            url = url.replace('https://' + tmdbDirectHost, origin).replace('http://' + tmdbDirectHost, origin);
            log('fixUrl: подмена api.themoviedb.org -> зеркало', { from: was.slice(0, 60) + '...', to: url.slice(0, 60) + '...' });
        }
        return url;
    }

    /** Вызывается из start(): один запрос на карточку, результат переиспользуется для main/credits/videos/similar */
    window.__anti_dmca_fetchCard = null;

    log('скрипт загружен, применяю патчи XHR/fetch');
    (function patchNetwork() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[1] === 'string') {
                var u = args[1];
                args[1] = fixUrl(args[1]);
                if (args[1] !== u) log('XHR.open: URL заменён', args[1].slice(0, 80));
            }
            return origOpen.apply(this, args);
        };
        if (typeof fetch !== 'undefined') {
            var origFetch = window.fetch;
            window.fetch = function (url, opts) {
                if (typeof url === 'string') url = fixUrl(url);
                return origFetch.call(this, url, opts);
            };
        }

        /** Подмена ответа {"blocked":true} на уровне XHR — использует общий кэш fetchCard при наличии */
        var tmdbCardPath = /\/3\/(movie|tv)\/(\d+)(?:\/|$|\?)/;
        var blockedBody = /^\s*\{\s*"blocked"\s*:\s*true\s*\}\s*$/;
        var origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            var xhr = this;
            var origOnReady = xhr.onreadystatechange;
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    if (origOnReady) origOnReady.call(xhr);
                    return;
                }
                var url = xhr.responseURL || '';
                var text = (xhr.responseText || '').trim();
                var isBlockedResp = blockedBody.test(text);
                var isCardUrl = tmdbCardPath.test(url);
                if (isCardUrl) log('XHR.send: readyState=4', { url: url.slice(0, 70), isBlockedResp: isBlockedResp, responsePreview: text.slice(0, 50) });
                if (!isBlockedResp || !isCardUrl) {
                    if (origOnReady) origOnReady.call(xhr);
                    return;
                }
                var m = url.match(tmdbCardPath);
                if (!m) {
                    log('XHR.send: blocked, но не удалось извлечь id из URL', url);
                    if (origOnReady) origOnReady.call(xhr);
                    return;
                }
                var cardType = m[1], cardId = m[2];
                log('XHR.send: обнаружен blocked, подмена через api.themoviedb.org', { cardType: cardType, cardId: cardId });
                var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('tmdb_lang')) || 'ru';
                var fetchCard = window.__anti_dmca_fetchCard;
                if (typeof fetchCard === 'function') {
                    fetchCard(cardId, cardType, lang).then(function (realData) {
                        var subMatch = url.match(/\/(movie|tv)\/\d+\/([^\/\?]+)/);
                        var out = subMatch && realData[subMatch[2]] !== undefined ? realData[subMatch[2]] : realData;
                        var outText = typeof out === 'object' ? JSON.stringify(out) : (out || '');
                        try { Object.defineProperty(xhr, 'responseText', { get: function () { return outText; }, configurable: true }); } catch (e) {}
                        try { Object.defineProperty(xhr, 'response', { get: function () { return out; }, configurable: true }); } catch (e) {}
                        log('XHR.send: подмена выполнена (кэш)', { id: realData.id, path: subMatch ? subMatch[2] : 'main' });
                        if (origOnReady) origOnReady.call(xhr);
                    }, function () {
                        if (origOnReady) origOnReady.call(xhr);
                    });
                    return;
                }
                var tmdbUrl = 'https://' + tmdbDirectHost + '/3/' + cardType + '/' + cardId
                    + '?api_key=' + apiKey + '&language=' + lang
                    + '&append_to_response=credits,external_ids,videos,recommendations,similar';
                var done = false;
                var req = new XMLHttpRequest();
                directTmdbRequest = true;
                req.open('GET', tmdbUrl, true);
                req.onreadystatechange = function () {
                    if (req.readyState !== 4 || done) return;
                    done = true;
                    directTmdbRequest = false;
                    var realText = req.responseText;
                    var realData = null;
                    try { realData = realText ? JSON.parse(realText) : null; } catch (e) {}
                    if (realData && realData.id) {
                        var subMatch = url.match(/\/(movie|tv)\/\d+\/([^\/\?]+)/);
                        var out = subMatch && realData[subMatch[2]] !== undefined ? realData[subMatch[2]] : realData;
                        var outText = typeof out === 'object' ? JSON.stringify(out) : (realText || '');
                        try { Object.defineProperty(xhr, 'responseText', { get: function () { return outText; }, configurable: true }); } catch (e) {}
                        try { Object.defineProperty(xhr, 'response', { get: function () { return out; }, configurable: true }); } catch (e) {}
                        log('XHR.send: подмена выполнена, отдаём данные в приложение', { id: realData.id });
                    } else {
                        log('XHR.send: запрос к TMDB не вернул данные, отдаём исходный ответ', { status: req.status });
                    }
                    if (origOnReady) origOnReady.call(xhr);
                };
                req.onerror = function () { directTmdbRequest = false; };
                req.send();
            };
            return origSend.apply(this, arguments);
        };
    })();

    function start() {
        if (window.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !window.lampa_settings) return;

        log('start: плагин инициализируется');
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
            /** Один запрос на карточку: ключ cardId_cardType → Promise<realData> */
            var tmdbFetchPromises = {};

            function fetchTmdbCard(cardId, cardType, lang) {
                var key = cardId + '_' + cardType;
                if (tmdbFetchPromises[key]) return tmdbFetchPromises[key];
                var tmdbUrl = 'https://' + tmdbDirectHost + '/3/' + cardType + '/' + cardId
                    + '?api_key=' + apiKey + '&language=' + (lang || 'ru')
                    + '&append_to_response=credits,external_ids,videos,recommendations,similar';
                directTmdbRequest = true;
                var p = new Promise(function (resolve, reject) {
                    origAjax.call(window.jQuery, {
                        url: tmdbUrl,
                        dataType: 'json',
                        success: function (realData) {
                            directTmdbRequest = false;
                            resolve(realData);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            directTmdbRequest = false;
                            delete tmdbFetchPromises[key];
                            reject({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
                        }
                    });
                });
                tmdbFetchPromises[key] = p;
                return p;
            }
            window.__anti_dmca_fetchCard = fetchTmdbCard;

            function fetchFromTmdb(cardId, cardType, lang, origSuccess, origError, self, args) {
                log('fetchFromTmdb вызван (для $.ajax)', { cardId: cardId, cardType: cardType });
                fetchTmdbCard(cardId, cardType, lang).then(
                    function (realData) { origSuccess.call(self, realData, args[1], args[2]); },
                    function (err) {
                        if (origError) origError(err.jqXHR || {}, err.textStatus || 'error', err.errorThrown || '');
                    }
                );
            }

            /** Подмена при вызове complite(data) — для слоя Network.silent (в т.ч. ответы из кэша) */
            function fetchFromTmdbThenCall(onSuccess, onError, cardId, cardType, lang) {
                log('fetchFromTmdbThenCall вызван (Network.silent или request_secuses)', { cardId: cardId, cardType: cardType });
                fetchTmdbCard(cardId, cardType, lang).then(
                    function (realData) { if (onSuccess) onSuccess(realData); },
                    function (err) {
                        if (onError) onError(err.jqXHR || {}, err.textStatus || 'error', err.errorThrown || '');
                    }
                );
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
                        if (!isTmdbUrl(requestUrl)) return origSuccess.apply(this, arguments);
                        var isObj = data && typeof data === 'object' && !Array.isArray(data);
                        var isBlocked = isObj && data.blocked;
                        var isEmpty = isObj && !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;

                        if (isBlocked || isEmpty) {
                            var card = getCardInfo() || getCardInfoFromUrl(requestUrl);
                            log('$.ajax success: blocked или пустой ответ', { url: requestUrl.slice(0, 60), isBlocked: isBlocked, isEmpty: isEmpty, card: card });
                            if (card) {
                                var lang = Lampa.Storage.get('tmdb_lang', 'ru');
                                log('$.ajax success: вызываем fetchFromTmdb', card);
                                fetchFromTmdb(card.id, card.type, lang, origSuccess, origError, this, arguments);
                                return;
                            }
                            log('$.ajax success: карточку не определили, вызываем origError');
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
                log('патч Network.silent применён', network === Lampa.Network ? 'Lampa.Network' : 'Lampa.Api.network');
                var origSilent = network.silent.bind(network);
                network.silent = function (url, complite, error, post_data, params) {
                    var wrappedComplite = function (data) {
                        var isObj = data && typeof data === 'object' && !Array.isArray(data);
                        var isBlocked = isObj && data.blocked;
                        var isEmpty = isObj && !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;
                        if (isBlocked || isEmpty) {
                            var card = getCardInfoFromUrl(url) || getCardInfo();
                            log('Network.silent complite: blocked/пустой', { url: (url || '').slice(0, 60), card: card });
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
            } else {
                log('Network.silent не найден (Lampa.Network и Api.network)', { hasNetwork: !!Lampa.Network, hasApi: !!(Lampa.Api && Lampa.Api.network) });
            }

            /** Перехват через событие request_secuses — срабатывает и при ответе из кэша (минуя $.ajax) */
            if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
                log('подписка на событие request_secuses');
                Lampa.Listener.follow('request_secuses', function (e) {
                    var keys = e && typeof e === 'object' ? Object.keys(e) : [];
                    var params = e.params;
                    var data = e.data;
                    var abort = e.abort;
                    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
                    var requestUrl = params && params.url ? (params.url + '') : '';
                    if (!isTmdbUrl(requestUrl)) return;
                    var isBlocked = data.blocked;
                    var isEmpty = !data.blocked && !data.id && !data.title && !data.name && !data.results && Object.keys(data).length < 3;
                    if (isBlocked || isEmpty) log('request_secuses: blocked/пустой', { keys: keys, hasParams: !!params, hasAbort: typeof abort === 'function', url: requestUrl.slice(0, 55) });
                    if (!isBlocked && !isEmpty) return;
                    if (!params) { log('request_secuses: нет params, выходим'); return; }
                    var card = getCardInfoFromUrl(params.url) || getCardInfo();
                    if (!card) { log('request_secuses: карточку не определили', { url: (params.url + '').slice(0, 55) }); return; }
                    var sendSecuses = typeof abort === 'function' ? abort() : null;
                    if (typeof sendSecuses !== 'function') { log('request_secuses: abort() не вернул функцию'); return; }
                    log('request_secuses: перехват, вызываем fetchFromTmdbThenCall', card);
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
            } else {
                log('Lampa.Listener.follow недоступен');
            }
        }
    }

    if (window.appready) {
        log('appready уже true, вызываю start()');
        start();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        log('ожидаю событие app ready');
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') { log('событие app ready'); start(); }
        });
    } else {
        log('Lampa/Listener не найден при загрузке');
    }
})();
