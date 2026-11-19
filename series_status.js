(function () {
    'use strict';

    var STYLE_ID = 'series-status-style';
    var CACHE_TTL = 24 * 60 * 60 * 1000;
    var FETCH_RETRY_TTL = 6 * 60 * 60 * 1000;

    var DEFAULTS = {
        series_status_show_cards: true,
        series_status_position: 'bottom-center',
        series_status_style: 'corner',
        series_status_colored: true,
        series_status_data: 'status',
        series_status_ended_replace: false,
        series_status_hide_next: true,
        series_status_detail_fix: true,
        series_status_detail_badge: false,
        series_status_hide_dup: true,
        series_status_debug: false
    };

    var STATUS_LABELS = {
        'Ended': 'Завершён',
        'Canceled': 'Отменён',
        'Returning Series': 'Онгоинг',
        'In Production': 'В производстве',
        'Planned': 'Запланирован',
        'Pilot': 'Пилотный'
    };
    var STATUS_COLORS = {
        'Ended': 'rgba(52,152,219,0.85)',
        'Canceled': 'rgba(244,67,54,0.85)',
        'Returning Series': 'rgba(243,156,18,0.85)',
        'In Production': 'rgba(52,152,219,0.85)',
        'Planned': 'rgba(155,89,182,0.85)',
        'Pilot': 'rgba(230,126,34,0.85)'
    };
    var STATUS_CSS_KEYS = {
        'Ended': 'completed',
        'Canceled': 'canceled',
        'Returning Series': 'ongoing',
        'In Production': 'production',
        'Planned': 'planned',
        'Pilot': 'pilot'
    };
    var DETAIL_TEXT_MAP = {
        'ended': 'Ended',
        'завершён': 'Ended',
        'завершен': 'Ended',
        'завершено': 'Ended',
        'canceled': 'Canceled',
        'cancelled': 'Canceled',
        'отменён': 'Canceled',
        'отменен': 'Canceled',
        'отменено': 'Canceled',
        'returning series': 'Returning Series',
        'онгоинг': 'Returning Series',
        'выходит': 'Returning Series',
        'в эфире': 'Returning Series',
        'in production': 'In Production',
        'в производстве': 'In Production',
        'planned': 'Planned',
        'запланирован': 'Planned',
        'pilot': 'Pilot',
        'пилот': 'Pilot',
        'пилотный': 'Pilot'
    };
    var STATUS_SYNONYMS = [
        ['completed', ['завершен', 'завершено', 'ended', 'окончен', 'окончено']],
        ['canceled', ['отменен', 'отменено', 'canceled', 'cancelled']],
        ['ongoing', ['онгоинг', 'выходит', 'в эфире', 'ongoing', 'returning series']],
        ['production', ['в производстве', 'production', 'in production']],
        ['planned', ['запланирован', 'запланировано', 'planned']],
        ['released', ['выпущен', 'вышел', 'released']]
    ];

    var SCAN_DELAYS = [0, 150, 400, 900];

    var DEBUG = false;

    function isTruthy(v) {
        return (v === true || v === 'true' || v === '1' || v === 1);
    }
    function logErr(e) {
        if (!DEBUG) return;
        try { console.error('[series_status]', e); } catch (e2) {}
    }
    function safe(fn) {
        try {
            return fn();
        } catch (e) {
            logErr(e);
            return undefined;
        }
    }

    var _timers = {};
    var _timerSeq = 0;
    function later(fn, delay, key) {
        var id = key || ('t' + (++_timerSeq));
        if (_timers[id]) clearTimeout(_timers[id]);
        _timers[id] = setTimeout(function () {
            delete _timers[id];
            safe(fn);
        }, delay || 0);
        return id;
    }
    function retry(fn, delays, key) {
        var list = delays || [0, 150, 400];
        var i = 0;
        function next() {
            if (i >= list.length) return;
            later(function () {
                if (fn() !== false) return;
                i++;
                next();
            }, list[i] || 0, key + '_' + i);
        }
        next();
    }

    var _domListeners = [];
    function onDom(target, ev, fn, opts) {
        try {
            target.addEventListener(ev, fn, opts);
            _domListeners.push([target, ev, fn, opts]);
        } catch (e) { logErr(e); }
    }
    function offDomAll() {
        for (var i = 0; i < _domListeners.length; i++) {
            var l = _domListeners[i];
            try { l[0].removeEventListener(l[1], l[2], l[3]); } catch (e) { logErr(e); }
        }
        _domListeners = [];
    }

    function ssGetBool(key, defVal) {
        var v;
        try { v = Lampa.Storage.get(key, defVal === undefined ? DEFAULTS[key] : defVal); } catch (e) { v = DEFAULTS[key]; }
        return isTruthy(v);
    }
    function ssGetStr(key) {
        var v = '';
        try { v = Lampa.Storage.get(key, DEFAULTS[key]); } catch (e) { v = DEFAULTS[key]; }
        return String(v == null ? '' : v);
    }
    function ssGetPosition() {
        var v = ssGetStr('series_status_position');
        return (v === 'bottom-left' || v === 'bottom-right' || v === 'top-left' || v === 'top-right') ? v : 'bottom-center';
    }
    function ssIsRounded() {
        return ssGetStr('series_status_style') === 'rounded';
    }
    function ssGetDataMode() {
        var v = ssGetStr('series_status_data');
        return (v === 'status_se' || v === 'se') ? v : 'status';
    }

    var _tvCache = {};
    function ssCacheGet(key) {
        if (!key) return null;
        var entry = _tvCache[key];
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_TTL) {
            delete _tvCache[key];
            return null;
        }
        return entry;
    }
    function ssCacheSet(key, se, status) {
        if (!key || (!se && !status)) return;
        var prev = _tvCache[key] || {};
        _tvCache[key] = {
            text: se || prev.text || '',
            status: status || prev.status || '',
            timestamp: Date.now()
        };
    }

    var _requestPool = [];
    function ssGetRequest() {
        try { return _requestPool.pop() || new Lampa.Reguest(); } catch (e) { return new Lampa.Reguest(); }
    }
    function ssReleaseRequest(request) {
        try { request.clear(); } catch (e) { logErr(e); }
        if (_requestPool.length < 5) _requestPool.push(request);
    }
    var _queue = { tasks: [], processing: false, interval: 120, batch: 2 };
    var QUEUE_MAX_TASKS = 120;
    function ssProcessQueue() {
        if (_queue.processing || !_queue.tasks.length) return;
        _queue.processing = true;
        var batch = _queue.tasks.splice(0, _queue.batch);
        for (var i = 0; i < batch.length; i++) {
            try { batch[i].execute(); }
            catch (e) {
                try { if (batch[i].onDrop) batch[i].onDrop(); } catch (e2) { logErr(e2); }
                logErr(e);
            }
        }
        setTimeout(function () {
            _queue.processing = false;
            ssProcessQueue();
        }, _queue.interval);
    }
    function ssQueueTask(task, onDrop) {
        _queue.tasks.push({ execute: task, onDrop: onDrop });
        while (_queue.tasks.length > QUEUE_MAX_TASKS) {
            var dropped = _queue.tasks.shift();
            if (dropped && dropped.onDrop) { try { dropped.onDrop(); } catch (e) { logErr(e); } }
        }
        ssProcessQueue();
    }
    function ssClearQueue() {
        var pending = _queue.tasks;
        _queue.tasks = [];
        for (var i = 0; i < pending.length; i++) {
            var t = pending[i];
            if (t && t.onDrop) { try { t.onDrop(); } catch (e) { logErr(e); } }
        }
    }

    function ssTmdbUrl(type, id) {
        try {
            if (Lampa.TMDB && Lampa.TMDB.api && Lampa.TMDB.key) return Lampa.TMDB.api(type + '/' + id + '?api_key=' + Lampa.TMDB.key());
        } catch (e) { logErr(e); }
        return '';
    }

    var _pendingTv = {};
    var _tvAttempts = {};
    function ssFetchTvInfo(tmdbId, callback) {
        var id = String(tmdbId || '');
        if (!id) { if (callback) callback(null); return; }
        if (_pendingTv[id]) { if (callback) _pendingTv[id].push(callback); return; }
        var lastAttempt = _tvAttempts[id];
        if (lastAttempt && (Date.now() - lastAttempt < FETCH_RETRY_TTL)) { if (callback) callback(null); return; }
        _pendingTv[id] = callback ? [callback] : [];
        ssQueueTask(function () {
            function complete(result) {
                _tvAttempts[id] = Date.now();
                var callbacks = _pendingTv[id] || [];
                delete _pendingTv[id];
                for (var i = 0; i < callbacks.length; i++) { try { callbacks[i](result); } catch (e) { logErr(e); } }
            }
            var url = ssTmdbUrl('tv', id);
            if (!url) { complete(null); return; }
            var request = ssGetRequest();
            try { request.timeout(6000); } catch (e) { logErr(e); }
            request.silent(url, function (tvInfo) { ssReleaseRequest(request); complete(tvInfo || null); }, function () { ssReleaseRequest(request); complete(null); }, false);
        }, function () { delete _pendingTv[id]; });
    }

    function ssNormalizeStatus(status) {
        var s = String(status || '').trim().toLowerCase();
        if (!s) return '';
        if (s === 'ended' || s === 'завершён' || s === 'завершен') return 'Ended';
        if (s === 'canceled' || s === 'cancelled' || s === 'отменён' || s === 'отменен') return 'Canceled';
        if (s === 'returning series' || s === 'онгоинг') return 'Returning Series';
        if (s === 'in production' || s === 'в производстве') return 'In Production';
        if (s === 'planned' || s === 'запланирован') return 'Planned';
        if (s === 'pilot' || s === 'пилот' || s === 'пилотный') return 'Pilot';
        return status;
    }
    function ssStatusLabel(status) {
        var n = ssNormalizeStatus(status);
        if (!n) return '';
        return STATUS_LABELS[n] || n;
    }
    function ssStatusColor(status) {
        return STATUS_COLORS[ssNormalizeStatus(status)] || 'rgba(0,0,0,0.75)';
    }
    function ssStatusCssKey(status) {
        return STATUS_CSS_KEYS[ssNormalizeStatus(status)] || '';
    }
    function ssIsFinished(status) {
        var n = ssNormalizeStatus(status);
        return n === 'Ended' || n === 'Canceled';
    }
    function ssFormatSE(lastEpisode) {
        if (!lastEpisode) return '';
        var seasonNumber = parseInt(lastEpisode.season_number, 10) || 0;
        var episodeNumber = parseInt(lastEpisode.episode_number, 10) || 0;
        if (!seasonNumber || !episodeNumber) return '';
        return 'S' + seasonNumber + ':E' + episodeNumber;
    }
    function ssBuildLabel(status, se, mode) {
        var st = ssStatusLabel(status);
        if (mode === 'status') return st;
        if (ssIsFinished(status) && ssGetBool('series_status_ended_replace', false)) return st;
        if (mode === 'se') return se || '';
        if (st && se) return st + ' · ' + se;
        return st || se || '';
    }
    function ssStatusKeyForText(text) {
        var t = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');
        if (!t) return '';
        for (var i = 0; i < STATUS_SYNONYMS.length; i++) {
            var words = STATUS_SYNONYMS[i][1];
            for (var j = 0; j < words.length; j++) {
                if (t === words[j]) return STATUS_SYNONYMS[i][0];
            }
        }
        return t;
    }

    function ssGetCardMeta(card) {
        if (!card) return {};
        if (card.card_data && typeof card.card_data === 'object') return card.card_data;
        var meta = {};
        var tmp;
        try {
            tmp = card.getAttribute('data-card');
            if (tmp) meta = JSON.parse(tmp) || {};
        } catch (e) { logErr(e); }
        if (!meta || !meta.id) {
            try {
                if (Lampa.Card && typeof Lampa.Card.get === 'function' && card.id) {
                    var instance = Lampa.Card.get(card.id);
                    if (instance) meta = instance.card_data || instance.data || instance;
                }
            } catch (e2) { logErr(e2); }
        }
        return (meta && typeof meta === 'object') ? meta : {};
    }
    function ssCardId(card, meta) {
        var id = (meta && meta.id) || '';
        if (!id && card) {
            try {
                id = (card.getAttribute('data-id') || (card.card_data && card.card_data.id) || '');
            } catch (e) { logErr(e); }
        }
        return id || '';
    }
    function ssInExcludedContainer(card) {
        var node = card;
        while (node && node.nodeType === 1) {
            if (node.classList) {
                if (node.classList.contains('explorer') || node.classList.contains('layer--online') ||
                    node.classList.contains('select-box') || node.classList.contains('scroll--persons') ||
                    node.classList.contains('items--persons') || node.classList.contains('crew')) return true;
            }
            node = node.parentNode;
        }
        return false;
    }
    function ssMediaType(meta, card) {
        meta = meta || {};
        if (card && card.classList) {
            if (card.classList.contains('card--person') || card.classList.contains('card--actor') ||
                card.classList.contains('card--collection') || card.classList.contains('card--button') ||
                card.classList.contains('card--button-compact') || card.classList.contains('card--genre-compact') ||
                card.classList.contains('streaming-card--button-compact')) return null;
        }
        if (card && ssInExcludedContainer(card)) return null;
        if (card && card.querySelector && card.querySelector('.card__button-label, .card__genre-label, .card__svg-icon, .streaming-card__svg-icon')) return null;
        if (meta.source === 'custom' || meta.icon_svg || ('profile_path' in meta) || meta.known_for_department || (meta.known_for && typeof meta.known_for.length === 'number')) return null;
        var types = [meta.media_type, meta.type, meta.card_type, meta.method];
        try { types.push(card ? card.getAttribute('data-type') : null); } catch (e) { logErr(e); }
        var i, value;
        for (i = 0; i < types.length; i++) {
            value = String(types[i] || '').toLowerCase();
            if (value === 'person' || value === 'actor' || value === 'collection' || value === 'genre' || value === 'button' || value === 'provider') return null;
        }
        for (i = 0; i < types.length; i++) {
            value = String(types[i] || '').toLowerCase();
            if (value === 'tv') return 'tv';
            if (value === 'movie') return 'movie';
        }
        if (meta.first_air_date || meta.original_name || meta.number_of_seasons > 0 || meta.number_of_episodes > 0 || isTruthy(meta.is_series)) return 'tv';
        if (meta.release_date || meta.original_title) return 'movie';
        if (card && card.classList && card.classList.contains('card--tv')) return 'tv';
        if ((meta.id || meta.tmdb_id) && (meta.poster_path || meta.poster) && meta.title) return 'movie';
        return null;
    }

    var _batch = false;
    var _pendingPositions = [];

    function ssElVisible(el) {
        if (!el) return false;
        try {
            var st = window.getComputedStyle(el);
            return !!(st && st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0' && el.offsetWidth > 0 && el.offsetHeight > 0);
        } catch (e) { return false; }
    }
    function ssFirstVisibleBox(view, className) {
        var children = view.children || [];
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.classList && el.classList.contains(className) && ssElVisible(el)) {
                return { left: el.offsetLeft, right: el.offsetLeft + el.offsetWidth };
            }
        }
        return null;
    }
    function ssFirstVisibleVoteBox(view) {
        var children = view.children || [];
        var votesBottom = true;
        try { votesBottom = String(Lampa.Storage.get('rating_position', 'bottom')) !== 'top'; } catch (e) {}
        if (!votesBottom) return null;
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (!el.classList || !ssElVisible(el)) continue;
            var isVote = el.classList.contains('card__vote--bottom') ||
                el.classList.contains('card__vote-separate-wrap') ||
                el.classList.contains('card__vote-line') ||
                (el.classList.contains('card__vote') && !el.classList.contains('card__vote-separate-wrap') && !el.classList.contains('card__vote-line'));
            if (isVote) return { left: el.offsetLeft, right: el.offsetLeft + el.offsetWidth };
        }
        return null;
    }
    function ssMeasureCenter(view) {
        if (!view) return null;
        try {
            var viewWidth = view.clientWidth || view.offsetWidth;
            var qualityBox = ssFirstVisibleBox(view, 'card__quality');
            var voteBox = ssFirstVisibleVoteBox(view);
            var leftEdge = qualityBox ? qualityBox.right : 0;
            var rightEdge = voteBox ? voteBox.left : viewWidth;
            if (rightEdge <= leftEdge) {
                leftEdge = 0;
                rightEdge = viewWidth;
            }
            return (leftEdge + rightEdge) / 2;
        } catch (e) { return null; }
    }
    function ssApplyPosition(view, label, pos, rounded, useSmart) {
        if (!view || !label) return;
        var inset = rounded ? '0.4em' : '0';
        var shadow = 'none';
        var radius;
        var radiusVar;
        var props = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto', transform: 'none' };
        if (pos === 'bottom-center') {
            var center = useSmart ? ssMeasureCenter(view) : null;
            props.left = (center !== null && center !== undefined) ? center + 'px' : '50%';
            props.bottom = inset;
            props.transform = 'translateX(-50%)';
            radius = rounded ? '0.5em' : '0.75em 0.75em 0 0';
            radiusVar = rounded ? '0.5em' : 'var(--co-poster-radius,0.75em) var(--co-poster-radius,0.75em) 0 0';
            if (rounded) shadow = '0 -0.12em 0.4em rgba(0,0,0,0.55)';
        } else if (pos === 'bottom-left') {
            props.left = inset;
            props.bottom = inset;
            radius = rounded ? '0.5em' : '0 0 0 0.75em';
            radiusVar = rounded ? '0.5em' : '0 0 0 var(--co-poster-radius,0.75em)';
            if (rounded) shadow = '0 -0.12em 0.4em rgba(0,0,0,0.55)';
        } else if (pos === 'bottom-right') {
            props.right = inset;
            props.bottom = inset;
            radius = rounded ? '0.5em' : '0 0 0.75em 0';
            radiusVar = rounded ? '0.5em' : '0 0 var(--co-poster-radius,0.75em) 0';
            if (rounded) shadow = '0 -0.12em 0.4em rgba(0,0,0,0.55)';
        } else if (pos === 'top-left') {
            props.left = inset;
            props.top = inset;
            radius = rounded ? '0.5em' : '0.75em 0 0 0';
            radiusVar = rounded ? '0.5em' : 'var(--co-poster-radius,0.75em) 0 0 0';
            if (rounded) shadow = '0 0.12em 0.4em rgba(0,0,0,0.55)';
        } else {
            props.right = inset;
            props.top = inset;
            radius = rounded ? '0.5em' : '0 0.75em 0 0';
            radiusVar = rounded ? '0.5em' : '0 var(--co-poster-radius,0.75em) 0 0';
            if (rounded) shadow = '0 0.12em 0.4em rgba(0,0,0,0.55)';
        }
        props['box-shadow'] = shadow;
        for (var k in props) {
            if (Object.prototype.hasOwnProperty.call(props, k)) label.style.setProperty(k, props[k], 'important');
        }
        label.style.setProperty('border-radius', radius, 'important');
        label.style.setProperty('border-radius', radiusVar, 'important');
    }
    function ssPositionLabel(view, label, useSmart) {
        if (_batch) { _pendingPositions.push([view, label, useSmart]); return; }
        ssApplyPosition(view, label, ssGetPosition(), ssIsRounded(), useSmart);
    }
    function ssFlushPositions() {
        var pend = _pendingPositions;
        _pendingPositions = [];
        if (!pend.length) return;
        var pos = ssGetPosition();
        var rounded = ssIsRounded();
        for (var i = 0; i < pend.length; i++) {
            ssApplyPosition(pend[i][0], pend[i][1], pos, rounded, pend[i][2]);
        }
    }
    function ssRepositionAll() {
        var labels;
        try { labels = document.querySelectorAll('.ssb-status-label'); } catch (e) { return; }
        var pos = ssGetPosition();
        var rounded = ssIsRounded();
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            var view = label.parentNode;
            if (view && view.nodeType === 1) ssApplyPosition(view, label, pos, rounded, true);
        }
    }

    function ssRenderCard(card, text, status) {
        var view = card.querySelector('.card__view');
        if (!view) return;
        var label = view.querySelector('.ssb-status-label');
        if (!label) {
            label = document.createElement('div');
            label.className = 'ssb-status-label';
            view.appendChild(label);
        }
        if (card.classList) card.classList.add('ssb-has-badge');
        label.textContent = text;
        var colored = ssGetBool('series_status_colored', true) && !!status;
        var bg = colored ? ssStatusColor(status) : 'rgba(0,0,0,0.75)';
        label.style.setProperty('background-color', bg, 'important');
        ssPositionLabel(view, label, true);
    }
    function ssRemoveFromCard(card) {
        if (!card || !card.querySelector) return;
        var view = card.querySelector('.card__view');
        if (!view) return;
        var labels = view.querySelectorAll('.ssb-status-label');
        for (var i = 0; i < labels.length; i++) {
            if (labels[i].parentNode) labels[i].parentNode.removeChild(labels[i]);
        }
        if (card.classList) card.classList.remove('ssb-has-badge');
    }
    function ssRemoveAllCardLabels() {
        try {
            var labels = document.querySelectorAll('.ssb-status-label');
            for (var i = 0; i < labels.length; i++) {
                if (labels[i].parentNode) labels[i].parentNode.removeChild(labels[i]);
            }
            var cards = document.querySelectorAll('.card.ssb-has-badge');
            for (var j = 0; j < cards.length; j++) cards[j].classList.remove('ssb-has-badge');
        } catch (e) { logErr(e); }
    }

    function ssApplyToCard(card, allowFetch) {
        if (!card || !card.querySelector) return;
        if (!ssGetBool('series_status_show_cards', true)) { ssRemoveFromCard(card); return; }
        var meta = ssGetCardMeta(card);
        if (ssMediaType(meta, card) !== 'tv') { ssRemoveFromCard(card); return; }
        var id = ssCardId(card, meta);
        if (!id) { ssRemoveFromCard(card); return; }
        var key = 'tv_' + id;
        var cached = ssCacheGet(key);
        var status = String((meta && meta.status) || (cached && cached.status) || '');
        var se = ssFormatSE(meta && meta.last_episode_to_air) || (cached && cached.text) || '';
        if (meta && (meta.status || meta.last_episode_to_air)) ssCacheSet(key, se, status);
        var mode = ssGetDataMode();
        var text = ssBuildLabel(status, se, mode);
        if (text) ssRenderCard(card, text, status);
        else ssRemoveFromCard(card);
        var endedReplace = ssIsFinished(status) && ssGetBool('series_status_ended_replace', false);
        var needStatus = mode !== 'se' && !status;
        var needSE = mode !== 'status' && !se && !endedReplace;
        if ((needStatus || needSE) && allowFetch !== false) {
            ssFetchTvInfo(id, function (tvInfo) {
                if (!tvInfo) return;
                if (!document.body.contains(card)) return;
                var st = String(tvInfo.status || status || '');
                var se2 = ssFormatSE(tvInfo.last_episode_to_air) || se;
                ssCacheSet(key, se2, st);
                var t2 = ssBuildLabel(st, se2, ssGetDataMode());
                if (t2) ssRenderCard(card, t2, st);
                else ssRemoveFromCard(card);
            });
        }
    }

    function ssReapplyAllCards() {
        var cards;
        try { cards = document.querySelectorAll('.card'); } catch (e) { return; }
        _batch = true;
        _pendingPositions = [];
        try {
            for (var i = 0; i < cards.length; i++) ssApplyToCard(cards[i], true);
        } finally {
            _batch = false;
        }
        ssFlushPositions();
    }

    var _io = null;
    var _observedCards = [];

    function ssBlocked() {
        try {
            var selectors = ['.modal', '.settings-input__content', '.selectbox__content', '.menu-edit-list'];
            for (var i = 0; i < selectors.length; i++) {
                var node = document.querySelector(selectors[i]);
                if (node && node.offsetParent !== null) return true;
            }
        } catch (e) { logErr(e); }
        return false;
    }
    function ssNearViewport(card, windowHeight) {
        try {
            var rect = card.getBoundingClientRect();
            return !(rect.bottom < -200 || rect.top > windowHeight + 200);
        } catch (e) { return true; }
    }
    function ssObserveCard(card) {
        if (!_io || !card || card.nodeType !== 1) return;
        if (card.getAttribute('data-ssb-seen') === '1') return;
        try {
            card.setAttribute('data-ssb-seen', '1');
            _io.observe(card);
            _observedCards.push(card);
        } catch (e) { logErr(e); }
    }
    function ssScanContainer(target, onlyNew) {
        if (!target || target.querySelectorAll === undefined) return;
        var cards;
        try { cards = target.querySelectorAll('.card'); } catch (e) { return; }
        if (_io) {
            for (var i = 0; i < cards.length; i++) ssObserveCard(cards[i]);
            return;
        }
        var windowHeight = window.innerHeight || 1000;
        _batch = true;
        for (var j = 0; j < cards.length; j++) {
            var card = cards[j];
            if (onlyNew && card.getAttribute('data-ssb-seen') === '1') continue;
            try { card.setAttribute('data-ssb-seen', '1'); } catch (e2) { logErr(e2); }
            if (ssNearViewport(card, windowHeight)) {
                try { ssApplyToCard(card, true); } catch (e3) { logErr(e3); }
            }
        }
        _batch = false;
        ssFlushPositions();
    }
    function ssActiveRender() {
        try {
            var a = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
            var r = a && a.activity && a.activity.render ? a.activity.render() : null;
            if (r && r.nodeType !== 1 && r.length) r = r[0];
            return (r && r.nodeType === 1) ? r : null;
        } catch (e) { return null; }
    }
    function ssScanNew() {
        ssScanContainer(ssActiveRender() || document.body, true);
    }
    function ssPruneObserved() {
        if (!_io || !_observedCards.length) return;
        var alive = [];
        for (var i = 0; i < _observedCards.length; i++) {
            var node = _observedCards[i];
            if (!node) continue;
            if (node.parentNode && document.body.contains(node)) { alive.push(node); continue; }
            try { _io.unobserve(node); } catch (e) { logErr(e); }
            try {
                node.removeAttribute('data-ssb-seen');
                node.removeAttribute('data-ssb-visible');
            } catch (e2) { logErr(e2); }
        }
        _observedCards = alive;
    }
    function ssStartWatch() {
        if (typeof IntersectionObserver === 'undefined') return;
        if (_io) return;
        _io = new IntersectionObserver(function (entries) {
            var didApply = false;
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var card = entry.target;
                try { if (card) card.setAttribute('data-ssb-visible', entry.isIntersecting ? '1' : '0'); } catch (e) { logErr(e); }
                if (entry.isIntersecting && card && !ssBlocked()) {
                    didApply = true;
                    _batch = true;
                    try { ssApplyToCard(card, true); } catch (e2) { logErr(e2); }
                }
            }
            if (didApply) {
                _batch = false;
                ssFlushPositions();
            }
        }, { root: null, rootMargin: '250px 0px 250px 0px', threshold: 0.01 });
        ssScanContainer(document.body, false);
    }

    var _detailLast = null;

    function ssActivityRenderOf(object) {
        try {
            var r = object && object.activity && object.activity.render ? object.activity.render() : null;
            if (r && r.nodeType !== 1 && r.length) r = r[0];
            return (r && r.nodeType === 1) ? r : null;
        } catch (e) { return null; }
    }
    function ssRemoveDetailBadges(render) {
        var scope = (render && render.querySelectorAll) ? render : document;
        try {
            var labels = scope.querySelectorAll('.ssb-detail-label');
            for (var i = 0; i < labels.length; i++) {
                if (labels[i].parentNode) labels[i].parentNode.removeChild(labels[i]);
            }
        } catch (e) { logErr(e); }
    }
    function ssFixDetailStatusText(render) {
        var scope = (render && render.querySelectorAll) ? render : document;
        var nodes;
        try { nodes = scope.querySelectorAll('.full-start__status'); } catch (e) { return; }
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (el.classList && (el.classList.contains('qualview-quality') || el.classList.contains('co-own-status'))) continue;
            var t = (el.textContent || '').trim();
            if (!t) continue;
            var canon = DETAIL_TEXT_MAP[t.toLowerCase()];
            if (canon) {
                var label = ssStatusLabel(canon);
                if (label && label !== t) el.textContent = label;
            } else if (/^завершено$/i.test(t)) { el.textContent = 'Завершён'; }
            else if (/^отменено$/i.test(t)) { el.textContent = 'Отменён'; }
            var cssKey = ssStatusCssKey(canon || t);
            if (cssKey) el.setAttribute('data-ssb-st', cssKey);
            else if (el.hasAttribute && el.hasAttribute('data-ssb-st')) el.removeAttribute('data-ssb-st');
        }
    }
    function ssDedupeDetailStatus(render) {
        var scope = (render && render.querySelectorAll) ? render : document;
        var nodes;
        try {
            nodes = scope.querySelectorAll('.full-start-new__rate-line .full-start__status, .full-start-new__meta-line .full-start__status');
        } catch (e) { return; }
        var arr = [];
        for (var i = 0; i < nodes.length; i++) arr.push(nodes[i]);
        arr.sort(function (a, b) {
            var ao = a.classList && a.classList.contains('co-own-status') ? 1 : 0;
            var bo = b.classList && b.classList.contains('co-own-status') ? 1 : 0;
            return ao - bo;
        });
        var seen = {};
        for (var j = 0; j < arr.length; j++) {
            var el = arr[j];
            if (el.classList && el.classList.contains('qualview-quality')) continue;
            var key = ssStatusKeyForText(el.textContent);
            if (!key) continue;
            if (seen[key]) {
                if (el.parentNode) el.parentNode.removeChild(el);
            } else seen[key] = true;
        }
    }
    function ssApplyDetailBadge(movie, object) {
        var render = ssActivityRenderOf(object);
        if (!render) return false;
        var poster = null;
        try {
            poster = render.querySelector('.full-start-new__poster') || render.querySelector('.full-start__poster');
        } catch (e) { logErr(e); }
        if (!poster) return false;
        ssRemoveDetailBadges(render);
        var status = String((movie && movie.status) || '');
        var se = ssFormatSE(movie && movie.last_episode_to_air);
        var text = ssBuildLabel(status, se, ssGetDataMode());
        if (!text) return true;
        var label = document.createElement('div');
        label.className = 'ssb-detail-label';
        label.textContent = text;
        var colored = ssGetBool('series_status_colored', true) && !!status;
        label.style.setProperty('background-color', colored ? ssStatusColor(status) : 'rgba(0,0,0,0.75)', 'important');
        try { poster.style.position = 'relative'; } catch (e2) { logErr(e2); }
        poster.appendChild(label);
        ssPositionLabel(poster, label, false);
        return true;
    }
    function ssOnFull(e) {
        if (!e || e.type !== 'complite') return;
        var render = ssActivityRenderOf(e.object);
        var movie = e.data && e.data.movie;
        _detailLast = (movie && movie.number_of_seasons) ? { movie: movie, object: e.object } : null;
        ssRemoveDetailBadges(render);
        later(ssUpdateDetailColorAttr, 0, 'ss-detail-color');
        if (render && ssGetBool('series_status_detail_fix', true)) {
            retry(function () { ssFixDetailStatusText(render); return false; }, [0, 150, 400], 'ss-detail-status');
            retry(function () { ssDedupeDetailStatus(render); return false; }, [0, 150, 400], 'ss-detail-dedupe');
        }
        if (_detailLast && ssGetBool('series_status_detail_badge', false)) {
            retry(function () { return ssApplyDetailBadge(_detailLast.movie, _detailLast.object); }, [0, 120, 300, 600], 'ss-detail-badge');
        }
    }
    function ssRefreshDetail() {
        ssRemoveDetailBadges(document);
        if (!_detailLast) return;
        var render = ssActivityRenderOf(_detailLast.object);
        if (!render || !document.body.contains(render)) return;
        if (ssGetBool('series_status_detail_fix', true)) {
            ssFixDetailStatusText(render);
            ssDedupeDetailStatus(render);
        }
        if (ssGetBool('series_status_detail_badge', false)) ssApplyDetailBadge(_detailLast.movie, _detailLast.object);
    }

    function ssUpdateBodyAttrs() {
        try {
            if (ssGetBool('series_status_hide_dup', true)) document.body.setAttribute('data-ssb-hide-dup', '1');
            else document.body.removeAttribute('data-ssb-hide-dup');
            if (ssGetBool('series_status_hide_next', true)) document.body.setAttribute('data-ssb-hide-next', '1');
            else document.body.removeAttribute('data-ssb-hide-next');
        } catch (e) { logErr(e); }
        ssUpdateDetailColorAttr();
    }
    function ssUpdateDetailColorAttr() {
        try {
            var modColors = document.body.classList && document.body.classList.contains('colored-elements-on');
            if (ssGetBool('series_status_colored', true) && !modColors) document.body.setAttribute('data-ssb-detail-color', '1');
            else document.body.removeAttribute('data-ssb-detail-color');
        } catch (e) { logErr(e); }
    }

    function ssInjectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.type = 'text/css';
        style.textContent =
            '.ssb-status-label{position:absolute!important;z-index:10!important;color:#fff!important;padding:0.25em 0.45em!important;font-size:1.1em!important;font-size:var(--rating-font-size,1.1em)!important;font-weight:400!important;line-height:1!important;height:auto!important;white-space:nowrap!important;box-sizing:border-box!important;margin:0!important;border:none!important}' +
            '.ssb-detail-label{position:absolute!important;z-index:10!important;color:#fff!important;padding:0.25em 0.45em!important;font-size:1.1em!important;font-size:var(--rating-font-size,1.1em)!important;font-weight:400!important;line-height:1!important;white-space:nowrap!important;box-sizing:border-box!important;margin:0!important;border:none!important}' +
            '.card.ssb-has-badge .card__view{position:relative!important}' +
            'body[data-ssb-hide-dup="1"] .card .card__series-status{display:none!important}' +
            'body[data-ssb-hide-next="1"] .card .card__badge--next-episode{display:none!important}' +
            'body[data-ssb-detail-color="1"] .full-start__status[data-ssb-st="completed"]:not(.status-completed){background:rgba(46,204,113,0.8)!important;color:#fff!important}' +
            'body[data-ssb-detail-color="1"] .full-start__status[data-ssb-st="canceled"]:not(.status-canceled){background:rgba(231,76,60,0.8)!important;color:#fff!important}' +
            'body[data-ssb-detail-color="1"] .full-start__status[data-ssb-st="ongoing"]:not(.status-ongoing){background:rgba(243,156,18,0.8)!important;color:#fff!important}' +
            'body[data-ssb-detail-color="1"] .full-start__status[data-ssb-st="production"]:not(.status-production){background:rgba(52,152,219,0.8)!important;color:#fff!important}' +
            'body[data-ssb-detail-color="1"] .full-start__status[data-ssb-st="planned"]:not(.status-planned){background:rgba(155,89,182,0.8)!important;color:#fff!important}' +
            'body[data-ssb-detail-color="1"] .full-start__status[data-ssb-st="pilot"]:not(.status-pilot){background:rgba(230,126,34,0.8)!important;color:#fff!important}';
        document.head.appendChild(style);
    }

    var _arrangeTimer = 0;
    function ssArrangeSettings() {
        var ours = null;
        try { ours = document.querySelector('.settings-folder[data-component="series_status"]'); } catch (e) { return; }
        if (!ours || !ours.parentNode) return;
        var anchor = null;
        try { anchor = document.querySelector('.settings-folder[data-component="card_overlay"]'); } catch (e2) { anchor = null; }
        if (!anchor) {
            var folders = document.querySelectorAll('.settings-folder');
            for (var i = 0; i < folders.length; i++) {
                var nameEl = folders[i].querySelector('.settings-folder__name');
                if (nameEl && nameEl.textContent.trim() === 'Интерфейс') { anchor = folders[i]; break; }
            }
        }
        if (anchor && anchor !== ours && anchor.parentNode === ours.parentNode) {
            if (ours.previousElementSibling !== anchor) anchor.parentNode.insertBefore(ours, anchor.nextSibling);
        }
    }
    function ssAddSettings() {
        if (!Lampa.SettingsApi) return;
        var COMPONENT = 'series_status';
        try {
            Lampa.SettingsApi.addComponent({
                component: COMPONENT,
                name: 'Состояние сериала',
                icon: '<svg height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="36" height="24" rx="3" fill="white"></rect><rect x="16" y="33" width="12" height="4" rx="1.5" fill="white"></rect></svg>'
            });
        } catch (e) { logErr(e); return; }

        function add(paramDef, fieldDef, onChange) {
            try {
                Lampa.SettingsApi.addParam({ component: COMPONENT, param: paramDef, field: fieldDef, onChange: onChange });
            } catch (e) { logErr(e); }
        }

        add(
            { name: 'series_status_show_cards', type: 'trigger', default: DEFAULTS.series_status_show_cards },
            { name: 'Состояние на карточках', description: 'Показывать статус сериала на постерах в списках' },
            function (v) {
                if (isTruthy(v)) ssReapplyAllCards();
                else ssRemoveAllCardLabels();
            }
        );
        add(
            { name: 'series_status_position', type: 'select', values: { 'bottom-center': 'Низ по центру', 'bottom-left': 'Нижний левый угол', 'bottom-right': 'Нижний правый угол', 'top-left': 'Верхний левый угол', 'top-right': 'Верхний правый угол' }, default: DEFAULTS.series_status_position },
            { name: 'Позиция на постере', description: 'Низ по центру не пересекается с качеством и рейтингами. Учтите, что углы могут быть заняты бейджами «Интерфейс Мод»' },
            function () { ssReapplyAllCards(); }
        );
        add(
            { name: 'series_status_style', type: 'select', values: { 'corner': 'Уголки', 'rounded': 'Скругление + тень' }, default: DEFAULTS.series_status_style },
            { name: 'Стиль бейджа', description: 'Внешний вид окна статуса (собственная настройка плагина)' },
            function () { ssReapplyAllCards(); }
        );
        add(
            { name: 'series_status_colored', type: 'trigger', default: DEFAULTS.series_status_colored },
            { name: 'Цветной фон по состоянию', description: 'Завершён — синий, Отменён — красный, Онгоинг — оранжевый, В производстве — голубой, Запланирован — фиолетовый, Пилотный — оранжевый' },
            function () {
                ssUpdateBodyAttrs();
                ssReapplyAllCards();
                ssRefreshDetail();
            }
        );
        add(
            { name: 'series_status_data', type: 'select', values: { 'status': 'Только состояние', 'status_se': 'Состояние + последняя серия', 'se': 'Только последняя серия (S:E)' }, default: DEFAULTS.series_status_data },
            { name: 'Данные на бейдже', description: 'Что показывать: состояние, последнюю вышедшую серию (S:E) или и то и другое' },
            function () {
                ssReapplyAllCards();
                ssRefreshDetail();
            }
        );
        add(
            { name: 'series_status_ended_replace', type: 'trigger', default: DEFAULTS.series_status_ended_replace },
            { name: 'Завершённым — статус вместо серии', description: 'Для завершённых и отменённых показывать «Завершён»/«Отменён» вместо S:E' },
            function () {
                ssReapplyAllCards();
                ssRefreshDetail();
            }
        );
        add(
            { name: 'series_status_hide_next', type: 'trigger', default: DEFAULTS.series_status_hide_next },
            { name: 'Скрывать родной бейдж серий', description: 'Скрывать родной бейдж следующей серии Lampa на постере, чтобы не пересекался со статусом' },
            function () { ssUpdateBodyAttrs(); }
        );
        add(
            { name: 'series_status_detail_fix', type: 'trigger', default: DEFAULTS.series_status_detail_fix },
            { name: 'Статус на странице сериала', description: 'Исправлять текст статуса («завершено» → «Завершён») и убирать дубли на странице сериала' },
            function () { ssRefreshDetail(); }
        );
        add(
            { name: 'series_status_detail_badge', type: 'trigger', default: DEFAULTS.series_status_detail_badge },
            { name: 'Бейдж на постере страницы сериала', description: 'Дополнительно показывать бейдж состояния на постере детальной страницы (позиция — как «Позиция на постере»)' },
            function () { ssRefreshDetail(); }
        );
        add(
            { name: 'series_status_hide_dup', type: 'trigger', default: DEFAULTS.series_status_hide_dup },
            { name: 'Скрывать дубликат от «Интерфейс Мод»', description: 'Скрывать статус-лейбл плагина «Интерфейс Мод» (card_overlay), чтобы не было двух одинаковых бейджей' },
            function () { ssUpdateBodyAttrs(); }
        );
        add(
            { name: 'series_status_debug', type: 'trigger', default: DEFAULTS.series_status_debug },
            { name: 'Режим отладки', description: 'Выводить ошибки плагина в консоль' },
            function (v) { DEBUG = isTruthy(v); }
        );

        function arrangeLater() {
            if (_arrangeTimer) return;
            _arrangeTimer = setTimeout(function () {
                _arrangeTimer = 0;
                ssArrangeSettings();
            }, 100);
        }
        arrangeLater();
        safe(function () {
            if (Lampa.Settings && Lampa.Settings.listener) Lampa.Settings.listener.follow('open', arrangeLater);
        });
    }

    function ssClearLegacyCacheKey() {
        try {
            if (Lampa.Storage.get('series_status_cache', null) !== null) Lampa.Storage.set('series_status_cache', '');
        } catch (e) { logErr(e); }
    }

    function ssInit() {
        if (window.__series_status_initialized__) return;
        window.__series_status_initialized__ = true;
        try { console.log('[series_status] v1.1.0 active'); } catch (e) {}
        try { DEBUG = isTruthy(Lampa.Storage.get('series_status_debug', false)); } catch (e0) {}
        ssClearLegacyCacheKey();
        ssInjectStyle();
        ssUpdateBodyAttrs();
        ssAddSettings();
        ssStartWatch();

        safe(function () {
            Lampa.Listener.follow('activity', function (e) {
                var t = e && e.type;
                if (t === 'destroy' || t === 'archive') { later(ssPruneObserved, 0, 'ss-prune'); return; }
                retry(function () { ssScanContainer(ssActiveRender() || document.body, false); return false; }, SCAN_DELAYS, 'ss-activity');
            });
        });
        safe(function () {
            Lampa.Listener.follow('line', function (e) {
                if (!e || (e.type !== 'append' && e.type !== 'create' && e.type !== 'visible')) return;
                var body = e.body;
                var el = (body && body.nodeType === 1) ? body : (body && body.length && body[0] && body[0].nodeType === 1 ? body[0] : null);
                if (el) ssScanContainer(el, true);
                else ssScanNew();
            });
        });
        safe(function () {
            Lampa.Listener.follow('card', function (event) {
                if (event && event.type === 'build' && event.object && event.object.card) {
                    var card = event.object.card;
                    var data = card.card_data;
                    if (data && data.id && !ssBlocked()) ssApplyToCard(card, true);
                }
            });
        });
        safe(function () {
            Lampa.Listener.follow('full', ssOnFull);
        });
        safe(function () {
            if (Lampa.Storage && Lampa.Storage.listener) {
                Lampa.Storage.listener.follow('change', function (e) {
                    if (e.name === 'interface_size' || e.name === 'rating_scale') later(ssRepositionAll, 150, 'ss-size');
                    if (e.name === 'colored_elements') later(ssUpdateDetailColorAttr, 50, 'ss-modcolor');
                });
            }
        });

        onDom(window, 'scroll', function () {
            later(function () { ssScanNew(); ssRepositionAll(); }, 120, 'ss-scroll');
        }, { passive: true });
        onDom(document, 'touchend', function () {
            later(ssScanNew, 200, 'ss-touch');
        }, { passive: true });
        onDom(window, 'keydown', function (e) {
            if (ssBlocked()) return;
            later(ssScanNew, 200, 'ss-key');
            var code = e && (e.code || e.key);
            if (code === 'PageUp' || code === 'PageDown') later(ssRepositionAll, 120, 'ss-key-page');
        }, { passive: true });
        onDom(window, 'resize', function () {
            later(ssRepositionAll, 150, 'ss-resize');
        }, { passive: true });
        onDom(window, 'orientationchange', function () {
            later(ssRepositionAll, 150, 'ss-orient');
        }, { passive: true });
        onDom(document, 'visibilitychange', function () {
            if (!document.hidden) ssRepositionAll();
        });

        retry(function () { ssScanContainer(document.body, false); return false; }, [0, 300, 800], 'ss-boot-scan');
        later(ssRepositionAll, 250, 'ss-boot-repos');
    }

    function ssDestroy() {
        offDomAll();
        for (var k in _timers) {
            if (Object.prototype.hasOwnProperty.call(_timers, k)) {
                try { clearTimeout(_timers[k]); } catch (e) {}
                delete _timers[k];
            }
        }
        if (_arrangeTimer) { try { clearTimeout(_arrangeTimer); } catch (e2) {} _arrangeTimer = 0; }
        ssClearQueue();
        safe(function () { if (_io) _io.disconnect(); });
        _io = null;
        _observedCards = [];
        _tvCache = {};
        ssRemoveAllCardLabels();
        ssRemoveDetailBadges(document);
        try {
            document.body.removeAttribute('data-ssb-hide-dup');
            document.body.removeAttribute('data-ssb-hide-next');
            document.body.removeAttribute('data-ssb-detail-color');
        } catch (e3) { logErr(e3); }
        var style = document.getElementById(STYLE_ID);
        if (style && style.parentNode) style.parentNode.removeChild(style);
        window.__series_status_initialized__ = false;
    }
    window.__series_status_destroy__ = ssDestroy;

    var manifest = {
        name: 'Состояние сериала',
        version: '1.1.0',
        description: 'Статус сериала на карточках и странице сериала (независимо от «Интерфейс Мод»)'
    };
    try {
        var plugins = Lampa.Manifest.plugins;
        if (plugins && typeof plugins.push === 'function') plugins.push(manifest);
        else Lampa.Manifest.plugins = [manifest];
    } catch (eM) { logErr(eM); }

    if (window.appready) ssInit();
    else if (Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ssInit(); });
})();
