(function () {
    'use strict';

    /* Фильтр карточек по рейтингу Lampa.
     *
     * Рейтинг Lampa — это не звёзды, а реакции зрителей (fire, nice, think,
     * bore, shit). Сервер отдаёт счётчики, балл считается средневзвешенным
     * по той же формуле, что в card_overlay: иначе один фильм получил бы в
     * двух плагинах разные оценки.
     *
     * Плагин не переделывает выдачу TMDB, а прячет уже нарисованные
     * карточки. Причина простая: рейтинг известен только после запроса по
     * каждому фильму, и держать список пустым, пока приедет сотня ответов,
     * нельзя.
     */

    var PLUGIN_ID = 'lampa_rating_filter';
    var PLUGIN_VERSION = '1.0.0';

    var API_URL = 'https://cubnotrip.top/api/reactions/get/';

    /* Кеш общий с card_overlay: тот складывает рейтинги в это же хранилище
       и в том же формате. Если стоят оба плагина, второй запрос не нужен. */
    var CACHE_STORAGE_KEY = 'rating_cache_lampa_rating';
    var CACHE_TTL = 24 * 60 * 60 * 1000;
    var CACHE_MAX_ENTRIES = 3000;

    /* Одновременных запросов. Больше шести телевизоры не любят: сеть у них
       слабее, а карточек на экране всё равно не больше десятка. */
    var MAX_PARALLEL = 6;
    var REQUEST_TIMEOUT = 15000;
    // Неудачу не повторяем сразу: сервер мог просто моргнуть.
    var FAIL_RETRY_MS = 30000;

    var REACTION_COEF = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };

    var DEFAULTS = {
        lrf_enabled: false,
        lrf_min_rating: '7',
        lrf_min_votes: '10',
        lrf_no_rating: 'show',
        lrf_dim_instead: false
    };

    var RATING_VALUES = {
        '0': 'Не фильтровать',
        '5': 'от 5.0',
        '5.5': 'от 5.5',
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

    var NO_RATING_VALUES = { show: 'Показывать', hide: 'Скрывать' };

    var ICON = '<div class="settings-folder" style="padding:0!important"><div style="width:1.8em;height:1.3em;padding-right:.5em"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5.5h18M6 12h12M10 18.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div></div>';

    function log() {
        try {
            if (typeof console !== 'undefined' && console && console.log) {
                console.log.apply(console, ['[lampa-filter]'].concat([].slice.call(arguments)));
            }
        } catch (e) { /* некому жаловаться */ }
    }

    function safe(fn, label) {
        try {
            return fn();
        } catch (e) {
            log('ошибка: ' + (label || 'код'), e);
            return null;
        }
    }

    // ───────────────────────────── настройки ─────────────────────────────

    function getStr(key) {
        return String(Lampa.Storage.get(key, String(DEFAULTS[key])));
    }

    function isOn(key) {
        var v = Lampa.Storage.get(key, DEFAULTS[key]);
        return v === true || v === 'true' || v === '1' || v === 1;
    }

    function minRating() {
        var v = parseFloat(getStr('lrf_min_rating'));
        return isNaN(v) ? 0 : v;
    }

    function minVotes() {
        var v = parseInt(getStr('lrf_min_votes'), 10);
        return isNaN(v) ? 0 : v;
    }

    function hideUnrated() {
        return getStr('lrf_no_rating') === 'hide';
    }

    function dimInstead() {
        return isOn('lrf_dim_instead');
    }

    function filterActive() {
        if (!isOn('lrf_enabled')) return false;
        // Порог 0 и «показывать без рейтинга» — фильтровать нечего.
        return minRating() > 0 || minVotes() > 0 || hideUnrated();
    }

    // ─────────────────────────────── кеш ───────────────────────────────

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
        // Запись в хранилище на телевизоре не бесплатна — копим правки.
        cacheSaveTimer = setTimeout(function () {
            cacheSaveTimer = null;
            if (!cacheDirty) return;
            cacheDirty = false;
            safe(function () {
                var store = loadCache();
                var keys = Object.keys(store);
                if (keys.length > CACHE_MAX_ENTRIES) {
                    // Выкидываем самые старые записи, а не весь кеш целиком.
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
        // card_overlay пишет только rating, без числа голосов.
        if (entry.votes === undefined && entry.rating === undefined) return null;
        return entry;
    }

    function cachePut(key, value) {
        var store = loadCache();
        value.timestamp = Date.now();
        store[key] = value;
        saveCacheSoon();
        return value;
    }

    // ──────────────────────────── рейтинг ────────────────────────────

    function calcRating(reactions) {
        var sum = 0, total = 0;
        for (var i = 0; i < reactions.length; i++) {
            var item = reactions[i] || {};
            var count = parseInt(item.counter, 10) || 0;
            var coef = REACTION_COEF[item.type] || 0;
            sum += count * coef;
            total += count;
        }
        if (!total) return { rating: 0, votes: 0 };
        /* Средняя реакция 1..5 растягивается в шкалу 0..10 — той же формулой,
           что в card_overlay, чтобы цифры совпадали. */
        var avg = sum / total;
        var r10 = (avg - 1) * 2.5;
        return { rating: r10 > 0 ? parseFloat(r10.toFixed(1)) : 0, votes: total };
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

    function fetchRating(key) {
        if (pending[key]) return pending[key];

        var fail = failedAt[key];
        if (fail && Date.now() - fail < FAIL_RETRY_MS) {
            return Promise.resolve({ rating: 0, votes: 0, failed: true });
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
                cachePut(key, { rating: result.rating, votes: result.votes });
            }
            done(result);
        }

        /* Запрос через сетевой слой Lampa, а не через XMLHttpRequest: на
           Android и телевизорах он ходит нативно и не спотыкается о CORS. */
        var net = safe(function () { return new Lampa.Reguest(); }, 'создание запроса');
        if (!net) {
            finish({ rating: 0, votes: 0, failed: true });
            return;
        }

        var timer = setTimeout(function () {
            safe(function () { net.clear(); }, 'сброс запроса');
            finish({ rating: 0, votes: 0, failed: true });
        }, REQUEST_TIMEOUT);

        safe(function () {
            net.timeout(REQUEST_TIMEOUT);
            net.silent(API_URL + key, function (data) {
                clearTimeout(timer);
                if (data && data.result && data.result.length !== undefined) finish(calcRating(data.result));
                else if (data && typeof data === 'object') finish({ rating: 0, votes: 0 });
                else finish({ rating: 0, votes: 0, failed: true });
            }, function () {
                clearTimeout(timer);
                finish({ rating: 0, votes: 0, failed: true });
            });
        }, 'отправка запроса');
    }

    // ────────────────────────── скрытие карточек ──────────────────────────

    var ATTR_STATE = 'data-lrf';

    function hideCard(card, rating) {
        if (!card) return;
        card.setAttribute(ATTR_STATE, 'hidden');
        card.setAttribute('data-lrf-rating', String(rating || 0));

        if (dimInstead()) {
            /* Приглушённый режим: карточка на месте, но видно, что она ниже
               порога. Удобно, пока подбираешь настройки. */
            card.classList.add('lrf-dim');
            card.classList.remove('lrf-hidden');
            return;
        }

        /* Класс selector нужен Lampa для навигации пультом. Убираем — и
           фокус перестаёт заезжать в скрытую карточку. */
        card.classList.remove('selector');
        card.classList.remove('lrf-dim');
        card.classList.add('lrf-hidden');
    }

    function showCard(card) {
        if (!card) return;
        if (card.getAttribute(ATTR_STATE) === 'hidden') card.classList.add('selector');
        card.setAttribute(ATTR_STATE, 'ok');
        card.classList.remove('lrf-hidden');
        card.classList.remove('lrf-dim');
    }

    function resetCard(card) {
        if (!card) return;
        if (card.getAttribute(ATTR_STATE) === 'hidden') card.classList.add('selector');
        card.removeAttribute(ATTR_STATE);
        card.removeAttribute('data-lrf-rating');
        card.classList.remove('lrf-hidden');
        card.classList.remove('lrf-dim');
    }

    function passes(info) {
        if (!info) return !hideUnrated();
        var rating = info.rating || 0;
        var votes = info.votes || 0;

        /* Никто не голосовал — это отдельный случай, а не «плохое кино»:
           решает своя настройка. Новинки почти всегда попадают сюда. */
        if (!votes) return !hideUnrated();
        // Мало голосов — оценке верить нельзя, судим как «нет рейтинга».
        if (votes < minVotes()) return !hideUnrated();

        return rating >= minRating();
    }

    function judge(card, data) {
        if (!card || !document.body.contains(card)) return;

        var key = cardKey(data);
        if (!key) return;

        var cached = cacheGet(key);
        if (cached) {
            if (passes(cached)) showCard(card);
            else hideCard(card, cached.rating);
            return;
        }

        /* Пока рейтинг неизвестен, карточку не трогаем: мигать содержимым
           хуже, чем показать её на лишние двести миллисекунд. */
        fetchRating(key).then(function (info) {
            if (!card || !document.body.contains(card)) return;
            if (!filterActive()) return;
            // Сервер не ответил — прятать не за что.
            if (info && info.failed) return;
            if (passes(info)) showCard(card);
            else hideCard(card, info.rating);
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

    /* Обход того, что уже нарисовано.
     *
     * Нужен для полноэкранных сеток (категории, поиск, закладки): там строк
     * нет, событие line не приходит, карточки просто лежат в контейнере.
     *
     * MutationObserver сознательно не используется: на старых телевизорах
     * Lampa подменяет его опросом DOM каждые 30 мс, и плагин съедал бы
     * больше, чем экономит. */
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

    // ─────────────────────────── дозагрузка ───────────────────────────

    /* Когда фильтр прячет почти всю строку, в ней остаётся два-три фильма.
       Просим Lampa подгрузить следующую порцию: пользователь ждёт список, а
       не огрызок. Больше трёх раз не настаиваем — иначе на строгом пороге
       плагин выкачал бы всю категорию. */
    var MAX_AUTO_MORE = 3;

    function maybeLoadMore(event) {
        if (!filterActive()) return;
        if (!event || !event.line || typeof event.line.more !== 'function') return;

        var body = event.body;
        if (!body || !body.querySelectorAll) return;

        var used = parseInt(body.getAttribute('data-lrf-more') || '0', 10) || 0;
        if (used >= MAX_AUTO_MORE) return;

        setTimeout(function () {
            if (!document.body.contains(body)) return;

            var all = body.querySelectorAll('.card');
            if (!all.length) return;

            // Ещё не все карточки получили ответ — судить рано.
            var judged = body.querySelectorAll('.card[' + ATTR_STATE + ']');
            if (judged.length < all.length) return;

            var hidden = body.querySelectorAll('.card.lrf-hidden');
            if (all.length - hidden.length >= 5) return;

            body.setAttribute('data-lrf-more', String(used + 1));
            safe(function () { event.line.more(); }, 'дозагрузка строки');
        }, 1200);
    }

    // ──────────────────────────── стили ────────────────────────────

    function addStyles() {
        if (document.getElementById('lrf-style')) return;
        var style = document.createElement('style');
        style.id = 'lrf-style';
        style.textContent =
            '.card.lrf-hidden{display:none!important}' +
            '.card.lrf-dim{opacity:.28;filter:grayscale(1)}';
        document.head.appendChild(style);
    }

    // ─────────────────────────── настройки в UI ───────────────────────────

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
            name: 'Фильтр по рейтингу Lampa',
            icon: ICON
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'lrf_enabled', type: 'trigger', default: DEFAULTS.lrf_enabled },
            field: {
                name: 'Включить фильтр',
                description: 'Прятать карточки, у которых рейтинг Lampa ниже порога'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'lrf_min_rating', type: 'select', values: RATING_VALUES, default: DEFAULTS.lrf_min_rating },
            field: {
                name: 'Минимальный рейтинг',
                description: 'Фильмы и сериалы с оценкой ниже не показываются'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'lrf_min_votes', type: 'select', values: VOTES_VALUES, default: DEFAULTS.lrf_min_votes },
            field: {
                name: 'Минимум голосов',
                description: 'Оценка 9.0 от трёх человек ничего не значит. Порог отсекает такие случаи'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'lrf_no_rating', type: 'select', values: NO_RATING_VALUES, default: DEFAULTS.lrf_no_rating },
            field: {
                name: 'Без рейтинга',
                description: 'Что делать с новинками, которые ещё никто не оценил'
            },
            onChange: function () { refresh(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'lrf_dim_instead', type: 'trigger', default: DEFAULTS.lrf_dim_instead },
            field: {
                name: 'Приглушать вместо скрытия',
                description: 'Отсеянные карточки останутся видимыми, но серыми. Удобно, пока подбираете порог'
            },
            onChange: function () { refresh(); }
        });
    }

    // ─────────────────────────────── события ───────────────────────────────

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
        // Сетка рисуется не мгновенно, даём ей два шанса.
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

        /* Ленивая догрузка карточек в сетке: новые появляются при прокрутке,
           события об этом нет — проверяем после действий пользователя. */
        safe(function () {
            window.addEventListener('scroll', onUserAction, true);
            window.addEventListener('wheel', onUserAction, true);
            window.addEventListener('keydown', onUserAction, true);
            window.addEventListener('touchend', onUserAction, true);
        }, 'подписка на прокрутку');

        log('запущен, версия ' + PLUGIN_VERSION);
    }

    if (window.lampa_rating_filter_ready) return;
    window.lampa_rating_filter_ready = true;

    if (typeof Lampa === 'undefined' || !Lampa.Listener || !Lampa.SettingsApi) {
        // Плагин подключили раньше приложения — ждём готовности.
        var waiting = setInterval(function () {
            if (typeof Lampa === 'undefined' || !Lampa.Listener || !Lampa.SettingsApi) return;
            clearInterval(waiting);
            safe(start, 'запуск');
        }, 200);
    } else {
        safe(start, 'запуск');
    }
})();
