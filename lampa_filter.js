(function () {
    'use strict';

    var PLUGIN_ID = 'lampa_reaction_filter';
    var PLUGIN_VERSION = '1.0.1';

    var API_URL = 'https://cubnotrip.top/api/reactions/get/';

    var CACHE_STORAGE_KEY = 'reaction_filter_cache';
    var CACHE_TTL = 24 * 60 * 60 * 1000;
    var CACHE_MAX_ENTRIES = 3000;

    var MAX_PARALLEL = 6;
    var REQUEST_TIMEOUT = 15000;
    var FAIL_RETRY_MS = 30000;

    var REACTION_COEF = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };

    var DEFAULTS = {
        rf_enabled: false,
        rf_allowed: 'fire',
        rf_min_rating: '0',
        rf_min_votes: '10',
        rf_no_data: 'show',
        rf_dim_instead: false
    };

    var ALLOWED_VALUES = {
        fire: 'Только 🔥 огонь',
        fire_nice: '🔥 огонь и 👍 палец вверх',
        fire_nice_think: '🔥 👍 и 🤔 задумался'
    };

    var ALLOWED_SETS = {
        fire: { fire: 1 },
        fire_nice: { fire: 1, nice: 1 },
        fire_nice_think: { fire: 1, nice: 1, think: 1 }
    };

    var RATING_VALUES = {
        '0': 'Не важен',
        '6': 'от 6.0',
        '6.5': 'от 6.5',
        '7': 'от 7.0',
        '7.5': 'от 7.5',
        '8': 'от 8.0',
        '8.5': 'от 8.5',
        '9': 'от 9.0'
    };

    var VOTES_VALUES = {
        '0': 'Любое количество',
        '10': 'от 10 голосов',
        '50': 'от 50 голосов',
        '100': 'от 100 голосов',
        '500': 'от 500 голосов',
        '1000': 'от 1000 голосов'
    };

    var NO_DATA_VALUES = { show: 'Показывать', hide: 'Скрывать' };

    var ICON = '<svg height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 3Q33 11 37 24A15.5 15.5 0 0 1 6.5 24Q10.5 11 22 3Z" stroke="white" stroke-width="3.5" stroke-linejoin="round"></path><path d="M22 22Q26 26 27 32A5.2 5.2 0 0 1 17 32Q18 26 22 22Z" fill="white"></path></svg>';

    function log() {
        try {
            if (typeof console !== 'undefined' && console && console.log) {
                console.log.apply(console, ['[reaction-filter]'].concat([].slice.call(arguments)));
            }
        } catch (e) { }
    }

    function safe(fn, label) {
        try {
            return fn();
        } catch (e) {
            log('ошибка: ' + (label || 'код'), e);
            return null;
        }
    }

    function getStr(key) {
        return String(Lampa.Storage.get(key, String(DEFAULTS[key])));
    }

    function isOn(key) {
        var v = Lampa.Storage.get(key, DEFAULTS[key]);
        return v === true || v === 'true' || v === '1' || v === 1;
    }

    function allowedSet() {
        return ALLOWED_SETS[getStr('rf_allowed')] || ALLOWED_SETS.fire;
    }

    function minRating() {
        var v = parseFloat(getStr('rf_min_rating'));
        return isNaN(v) ? 0 : v;
    }

    function minVotes() {
        var v = parseInt(getStr('rf_min_votes'), 10);
        return isNaN(v) ? 0 : v;
    }

    function hideNoData() {
        return getStr('rf_no_data') === 'hide';
    }

    function dimInstead() {
        return isOn('rf_dim_instead');
    }

    function filterActive() {
        return isOn('rf_enabled');
    }

    var cache = null;
    var cacheDirty = false;
    var cacheSaveTimer = null;

    function loadCache() {
        if (cache) return cache;
        cache = safe(function () {
            var raw = Lampa.Storage.get(CACHE_STORAGE_KEY, {});
            if (typeof raw === 'string') raw = JSON.parse(raw || '{}');
            return (raw && typeof raw === 'object') ? raw : {};
        }, 'чтение кеша') || {};
        return cache;
    }

    function saveCacheSoon() {
        cacheDirty = true;
        if (cacheSaveTimer) return;
        cacheSaveTimer = setTimeout(function () {
            cacheSaveTimer = null;
            if (!cacheDirty) return;
            cacheDirty = false;
            safe(function () {
                var store = loadCache();
                var keys = Object.keys(store);
                if (keys.length > CACHE_MAX_ENTRIES) {
                    keys.sort(function (a, b) {
                        return ((store[a] && store[a].timestamp) || 0) - ((store[b] && store[b].timestamp) || 0);
                    });
                    var kill = keys.length - CACHE_MAX_ENTRIES;
                    for (var i = 0; i < kill; i++) delete store[keys[i]];
                }
                Lampa.Storage.set(CACHE_STORAGE_KEY, store);
            }, 'запись кеша');
        }, 2000);
    }

    function cacheGet(key) {
        var entry = loadCache()[key];
        if (!entry || typeof entry !== 'object') return null;
        if (!entry.timestamp || Date.now() - entry.timestamp > CACHE_TTL) return null;
        if (entry.votes === undefined) return null;
        return entry;
    }

    function cachePut(key, value) {
        var store = loadCache();
        value.timestamp = Date.now();
        store[key] = value;
        saveCacheSoon();
        return value;
    }

    function calcLampa(reactions) {
        var weightedSum = 0, totalCount = 0, reactionCnt = {};

        for (var i = 0; i < reactions.length; i++) {
            var item = reactions[i] || {};
            var count = parseInt(item.counter, 10) || 0;
            var coef = REACTION_COEF[item.type] || 0;
            weightedSum += count * coef;
            totalCount += count;
            reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
        }

        if (totalCount === 0) return { rating: 0, icon: '', votes: 0 };

        var avgRating = weightedSum / totalCount;
        var rating10 = (avgRating - 1) * 2.5;
        var finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;

        var medianReaction = '';
        var medianIndex = Math.ceil(totalCount / 2.0);
        var keys = Object.keys(REACTION_COEF);
        var sorted = keys.sort(function (a, b) { return REACTION_COEF[a] - REACTION_COEF[b]; });
        var cumulative = 0;

        while (sorted.length && cumulative < medianIndex) {
            medianReaction = sorted.pop();
            cumulative += (reactionCnt[medianReaction] || 0);
        }

        return { rating: finalRating, icon: medianReaction, votes: totalCount };
    }

    function cardKey(data) {
        if (!data || !data.id) return '';
        var serial = data.seasons || data.first_air_date || data.original_name || data.number_of_seasons;
        return (serial ? 'tv_' : 'movie_') + data.id;
    }

    var pending = {};
    var failedAt = {};
    var queue = [];
    var running = 0;

    function fetchReactions(key) {
        if (pending[key]) return pending[key];

        var fail = failedAt[key];
        if (fail && Date.now() - fail < FAIL_RETRY_MS) {
            return Promise.resolve({ failed: true });
        }

        pending[key] = new Promise(function (resolve) {
            queue.push({ key: key, resolve: resolve });
            pump();
        }).then(function (result) {
            delete pending[key];
            return result;
        });

        return pending[key];
    }

    function pump() {
        while (running < MAX_PARALLEL && queue.length) {
            (function (job) {
                running++;
                requestOne(job.key, function (result) {
                    running--;
                    job.resolve(result);
                    pump();
                });
            })(queue.shift());
        }
    }

    function requestOne(key, done) {
        var settled = false;
        function finish(result) {
            if (settled) return;
            settled = true;
            if (result.failed) {
                failedAt[key] = Date.now();
            } else {
                delete failedAt[key];
                cachePut(key, { rating: result.rating, icon: result.icon, votes: result.votes });
            }
            done(result);
        }

        var net = safe(function () { return new Lampa.Reguest(); }, 'создание запроса');
        if (!net) {
            finish({ failed: true });
            return;
        }

        var timer = setTimeout(function () {
            safe(function () { net.clear(); }, 'сброс запроса');
            finish({ failed: true });
        }, REQUEST_TIMEOUT);

        safe(function () {
            net.timeout(REQUEST_TIMEOUT);
            net.silent(API_URL + key, function (data) {
                clearTimeout(timer);
                if (data && data.result && data.result.length !== undefined) finish(calcLampa(data.result));
                else if (data && typeof data === 'object') finish({ rating: 0, icon: '', votes: 0 });
                else finish({ failed: true });
            }, function () {
                clearTimeout(timer);
                finish({ failed: true });
            });
        }, 'отправка запроса');
    }

    function passes(info) {
        if (!info) return !hideNoData();

        var votes = info.votes || 0;
        if (!votes) return !hideNoData();
        if (votes < minVotes()) return !hideNoData();

        if (!allowedSet()[info.icon]) return false;

        return (info.rating || 0) >= minRating();
    }

    var ATTR_STATE = 'data-rf';

    function hideCard(card, info) {
        if (!card) return;
        card.setAttribute(ATTR_STATE, 'hidden');
        card.setAttribute('data-rf-icon', (info && info.icon) || '');

        if (dimInstead()) {
            card.classList.add('rf-dim');
            card.classList.remove('rf-hidden');
            return;
        }

        card.classList.remove('selector');
        card.classList.remove('rf-dim');
        card.classList.add('rf-hidden');
    }

    function showCard(card) {
        if (!card) return;
        if (card.getAttribute(ATTR_STATE) === 'hidden') card.classList.add('selector');
        card.setAttribute(ATTR_STATE, 'ok');
        card.classList.remove('rf-hidden');
        card.classList.remove('rf-dim');
    }

    function resetCard(card) {
        if (!card) return;
        if (card.getAttribute(ATTR_STATE) === 'hidden') card.classList.add('selector');
        card.removeAttribute(ATTR_STATE);
        card.removeAttribute('data-rf-icon');
        card.classList.remove('rf-hidden');
        card.classList.remove('rf-dim');
    }

    function judge(card, data) {
        if (!card || !document.body.contains(card)) return;

        var key = cardKey(data);
        if (!key) return;

        var cached = cacheGet(key);
        if (cached) {
            if (passes(cached)) showCard(card);
            else hideCard(card, cached);
            return;
        }

        fetchReactions(key).then(function (info) {
            if (!card || !document.body.contains(card)) return;
            if (!filterActive()) return;
            if (info && info.failed) return;
            if (passes(info)) showCard(card);
            else hideCard(card, info);
        });
    }

    function judgeItems(items) {
        if (!items || !items.length) return;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item) continue;
            var dom = safe(function () {
                return item.card || (typeof item.render === 'function' ? item.render(true) : null);
            }, 'получение карточки');
            if (!dom || dom.nodeType !== 1) continue;
            var data = dom.card_data || item.data || null;
            if (data) judge(dom, data);
        }
    }

    function scanRendered() {
        if (!filterActive()) return;
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (card.getAttribute(ATTR_STATE)) continue;
            var data = card.card_data;
            if (data && data.id) judge(card, data);
        }
    }

    function resetAll() {
        var cards = document.querySelectorAll('[' + ATTR_STATE + ']');
        for (var i = 0; i < cards.length; i++) resetCard(cards[i]);
    }

    var MAX_AUTO_MORE = 3;

    function maybeLoadMore(event) {
        if (!filterActive()) return;
        if (!event || !event.line || typeof event.line.more !== 'function') return;

        var body = event.body;
        if (!body || !body.querySelectorAll) return;

        var used = parseInt(body.getAttribute('data-rf-more') || '0', 10) || 0;
        if (used >= MAX_AUTO_MORE) return;

        setTimeout(function () {
            if (!document.body.contains(body)) return;

            var all = body.querySelectorAll('.card');
            if (!all.length) return;

            var judged = body.querySelectorAll('.card[' + ATTR_STATE + ']');
            if (judged.length < all.length) return;

            var hidden = body.querySelectorAll('.card.rf-hidden');
            if (all.length - hidden.length >= 5) return;

            body.setAttribute('data-rf-more', String(used + 1));
            safe(function () { event.line.more(); }, 'дозагрузка строки');
        }, 1200);
    }

    function addStyles() {
        if (document.getElementById('rf-style')) return;
        var style = document.createElement('style');
        style.id = 'rf-style';
        style.textContent =
            '.card.rf-hidden{display:none!important}' +
            '.card.rf-dim{opacity:.28;filter:grayscale(1)}';
        document.head.appendChild(style);
    }

    function applyDefaults() {
        for (var key in DEFAULTS) {
            if (!Object.prototype.hasOwnProperty.call(DEFAULTS, key)) continue;
            var current = Lampa.Storage.get(key, undefined);
            if (current === undefined || current === null || current === '') {
                Lampa.Storage.set(key, String(DEFAULTS[key]));
            }
        }
    }

    function refresh() {
        resetAll();
        if (filterActive()) scanRendered();
    }

    function addSettings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: PLUGIN_ID,
            name: 'Фильтр по реакциям Lampa',
            icon: ICON
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'rf_enabled', type: 'trigger', default: DEFAULTS.rf_enabled },
            field: {
                name: 'Включить фильтр',
                description: 'Оставлять только карточки с нужной реакцией зрителей'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'rf_allowed', type: 'select', values: ALLOWED_VALUES, default: DEFAULTS.rf_allowed },
            field: {
                name: 'Какие реакции оставлять',
                description: 'Та самая иконка, что стоит рядом с рейтингом Lampa. Остальное скрывается'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'rf_min_rating', type: 'select', values: RATING_VALUES, default: DEFAULTS.rf_min_rating },
            field: {
                name: 'Минимальный балл',
                description: 'Иконка 🔥 бывает и при балле 7.5, и при 9.4. Порог отсекает нижнюю часть'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'rf_min_votes', type: 'select', values: VOTES_VALUES, default: DEFAULTS.rf_min_votes },
            field: {
                name: 'Минимум голосов',
                description: 'Иконка от трёх человек ничего не значит. Порог отсекает такие случаи'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'rf_no_data', type: 'select', values: NO_DATA_VALUES, default: DEFAULTS.rf_no_data },
            field: {
                name: 'Без реакций',
                description: 'Что делать с новинками, которые ещё никто не оценил'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'rf_dim_instead', type: 'trigger', default: DEFAULTS.rf_dim_instead },
            field: {
                name: 'Приглушать вместо скрытия',
                description: 'Отсеянные карточки останутся видимыми, но серыми. Удобно, пока подбираете настройки'
            },
            onChange: function () { refresh(); }
        });
    }

    function onLine(event) {
        if (!filterActive()) return;
        if (!event || (event.type !== 'append' && event.type !== 'visible')) return;
        judgeItems(event.items);
        maybeLoadMore(event);
    }

    function onActivity(event) {
        if (!filterActive()) return;
        if (!event) return;
        if (event.type !== 'start' && event.type !== 'ready' && event.type !== 'archive') return;
        setTimeout(scanRendered, 300);
        setTimeout(scanRendered, 1200);
    }

    var scanTimer = null;

    function onUserAction() {
        if (!filterActive()) return;
        if (scanTimer) return;
        scanTimer = setTimeout(function () {
            scanTimer = null;
            scanRendered();
        }, 400);
    }

    function start() {
        applyDefaults();
        addStyles();
        addSettings();

        safe(function () { Lampa.Listener.follow('line', onLine); }, 'подписка на строки');
        safe(function () { Lampa.Listener.follow('activity', onActivity); }, 'подписка на активность');

        safe(function () {
            window.addEventListener('scroll', onUserAction, true);
            window.addEventListener('wheel', onUserAction, true);
            window.addEventListener('keydown', onUserAction, true);
            window.addEventListener('touchend', onUserAction, true);
        }, 'подписка на прокрутку');

        log('запущен, версия ' + PLUGIN_VERSION);
    }

    if (window.lampa_reaction_filter_ready) return;
    window.lampa_reaction_filter_ready = true;

    if (typeof Lampa === 'undefined' || !Lampa.Listener || !Lampa.SettingsApi) {
        var waiting = setInterval(function () {
            if (typeof Lampa === 'undefined' || !Lampa.Listener || !Lampa.SettingsApi) return;
            clearInterval(waiting);
            safe(start, 'запуск');
        }, 200);
    } else {
        safe(start, 'запуск');
    }
})();
