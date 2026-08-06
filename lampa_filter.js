(function () {
  'use strict';

  var VERSION = '1.0.0';
  var API_URL = 'https://cubnotrip.top/api/reactions/get/';

  // Ключи хранилища.
  var K = {
    enabled: 'lrf_enabled',
    min: 'lrf_min',
    votes: 'lrf_min_votes',
    unrated: 'lrf_unrated',
    scope: 'lrf_scope',
    mode: 'lrf_mode',
    cache: 'lrf_rating_cache'
  };

  var DEFAULTS = {};
  DEFAULTS[K.enabled] = false;
  DEFAULTS[K.min] = '0';
  DEFAULTS[K.votes] = '10';
  DEFAULTS[K.unrated] = 'show';
  DEFAULTS[K.scope] = 'catalog';
  DEFAULTS[K.mode] = 'hide';

  // Кеш card_overlay: если плагин стоит рядом, его рейтинги достаются
  // бесплатно, без единого запроса.
  var SHARED_CACHE_KEY = 'rating_cache_lampa_rating';

  var CACHE_TTL = 24 * 60 * 60 * 1000;
  var EMPTY_TTL = 6 * 60 * 60 * 1000;
  var FAIL_TTL = 10 * 60 * 1000;

  // Больше шести одновременных запросов старые телевизоры не любят.
  var MAX_PARALLEL = 6;
  var REQUEST_TIMEOUT = 20000;

  // Коэффициенты и формула — ровно как в card_overlay, иначе цифра в
  // фильтре не совпадала бы с цифрой на постере.
  var REACTION_COEF = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };

  var ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M3 5.5h18M6 12h12M10 18.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M19.2 15.1l.9 1.9 2 .3-1.5 1.5.4 2.1-1.8-1-1.8 1 .4-2.1-1.5-1.5 2-.3z" fill="currentColor"/></svg>';

  var DEBUG = false;
  function logErr(e) {
    if (DEBUG && typeof console !== 'undefined' && console.warn) console.warn('[lrf]', e);
  }
  function safe(fn) {
    try { return fn(); } catch (e) { logErr(e); return undefined; }
  }

  // ───────────────────────────── настройки ─────────────────────────────

  function get(key) {
    var v = Lampa.Storage.get(key, DEFAULTS[key]);
    return v === undefined || v === null || v === '' ? DEFAULTS[key] : v;
  }

  function isOn() {
    var v = get(K.enabled);
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  function minRating() {
    var v = parseFloat(get(K.min));
    return isNaN(v) ? 0 : v;
  }

  function minVotes() {
    var v = parseInt(get(K.votes), 10);
    return isNaN(v) ? 0 : v;
  }

  function hideUnrated() {
    return get(K.unrated) === 'hide';
  }

  function dimInsteadOfHide() {
    return get(K.mode) === 'dim';
  }

  function active() {
    return isOn() && minRating() > 0;
  }

  /* Где фильтровать.

     В закладках, истории и результатах поиска фильтр почти всегда мешает:
     человек ищет конкретный фильм, а плагин его прячет за низкую оценку.
     Поэтому по умолчанию фильтруются только подборки каталога. */
  var PERSONAL_COMPONENTS = {
    favorite: 1, bookmarks: 1, history: 1, later: 1, thrown: 1,
    search: 1, torrents: 1, full: 1, console: 1
  };

  function scopeAllows() {
    if (get(K.scope) === 'all') return true;
    var name = safe(function () {
      var a = Lampa.Activity.active();
      return a && a.component ? String(a.component) : '';
    }) || '';
    return !PERSONAL_COMPONENTS[name];
  }

  // ─────────────────────────────── кеш ────────────────────────────────

  var cache = null;
  var saveTimer = 0;

  function loadCache() {
    if (cache) return cache;
    cache = safe(function () { return Lampa.Storage.get(K.cache, {}) || {}; }) || {};
    if (typeof cache !== 'object') cache = {};
    return cache;
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = 0;
      safe(function () { Lampa.Storage.set(K.cache, prune(loadCache())); });
    }, 2000);
  }

  function prune(store) {
    var now = Date.now();
    var keys = Object.keys(store);
    for (var i = 0; i < keys.length; i++) {
      var e = store[keys[i]];
      if (!e || typeof e !== 'object' || !e.t) { delete store[keys[i]]; continue; }
      var ttl = e.failed ? FAIL_TTL : (e.votes ? CACHE_TTL : EMPTY_TTL);
      if (now - e.t > ttl) delete store[keys[i]];
    }
    // Хранилище не резиновое: держим не больше 4000 записей, лишние
    // выкидываем начиная с самых старых.
    keys = Object.keys(store);
    if (keys.length > 4000) {
      keys.sort(function (a, b) { return (store[a].t || 0) - (store[b].t || 0); });
      for (var j = 0; j < keys.length - 4000; j++) delete store[keys[j]];
    }
    return store;
  }

  /* Заглянуть в кеш card_overlay.

     Читаем, но не пишем: у него свой формат и своё отложенное сохранение,
     и запись отсюда затирала бы его записи. Так плагины не воюют за файл, а
     рейтинги всё равно достаются бесплатно. */
  function fromSharedCache(key) {
    return safe(function () {
      var store = Lampa.Storage.get(SHARED_CACHE_KEY, null);
      if (!store || typeof store !== 'object') return null;
      var e = store[key];
      if (!e || typeof e !== 'object') return null;
      if (e.timestamp && Date.now() - e.timestamp > CACHE_TTL) return null;
      var r = parseFloat(e.rating);
      if (isNaN(r)) return null;
      // Число голосов card_overlay не хранит, поэтому порог голосов к таким
      // записям не применяем — иначе они все считались бы недостоверными.
      return { rating: r, votes: -1, t: e.timestamp || Date.now() };
    }) || null;
  }

  function cachedRating(key) {
    var store = loadCache();
    var e = store[key];
    if (e && e.t) {
      var ttl = e.failed ? FAIL_TTL : (e.votes ? CACHE_TTL : EMPTY_TTL);
      if (Date.now() - e.t <= ttl) return e;
      delete store[key];
    }
    return fromSharedCache(key);
  }

  function rememberRating(key, value) {
    var store = loadCache();
    value.t = Date.now();
    store[key] = value;
    scheduleSave();
    return value;
  }

  // ──────────────────────────── запросы ───────────────────────────────

  function calcRating(list) {
    var weighted = 0, total = 0;
    for (var i = 0; i < list.length; i++) {
      var item = list[i] || {};
      var count = parseInt(item.counter, 10) || 0;
      var coef = REACTION_COEF[item.type] || 0;
      if (!coef) continue;
      weighted += count * coef;
      total += count;
    }
    if (!total) return { rating: 0, votes: 0 };
    var avg = weighted / total;
    var r = (avg - 1) * 2.5;
    return { rating: r > 0 ? parseFloat(r.toFixed(1)) : 0, votes: total };
  }

  var queue = [];
  var running = 0;
  var pending = {};

  function pump() {
    while (running < MAX_PARALLEL && queue.length) {
      running++;
      ask(queue.shift());
    }
  }

  function ask(job) {
    var net = safe(function () { return new Lampa.Reguest(); });
    if (!net) { done(job, { rating: 0, votes: 0, failed: true }); return; }

    var settled = false;
    function finish(value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      safe(function () { net.clear(); });
      done(job, value);
    }

    var timer = setTimeout(function () { finish({ rating: 0, votes: 0, failed: true }); }, REQUEST_TIMEOUT);

    safe(function () {
      net.timeout(REQUEST_TIMEOUT);
      net.silent(API_URL + job.key, function (data) {
        if (data && data.result && data.result.length !== undefined) finish(calcRating(data.result));
        else finish({ rating: 0, votes: 0 });
      }, function () {
        finish({ rating: 0, votes: 0, failed: true });
      }, false);
    });
  }

  function done(job, value) {
    running--;
    rememberRating(job.key, value);
    var waiters = pending[job.key] || [];
    delete pending[job.key];
    for (var i = 0; i < waiters.length; i++) safe(function () { waiters[i](value); });
    pump();
  }

  function requestRating(key, callback) {
    if (pending[key]) { pending[key].push(callback); return; }
    pending[key] = [callback];
    queue.push({ key: key });
    pump();
  }

  // ──────────────────────────── карточки ──────────────────────────────

  function cardKey(data) {
    if (!data || !data.id) return '';
    var isTv = !!(data.seasons || data.first_air_date || data.original_name || data.number_of_seasons);
    return (isTv ? 'tv_' : 'movie_') + data.id;
  }

  function cardData(card) {
    return (card && (card.card_data || card.data)) || null;
  }

  function applyVerdict(card, rating, votes, known) {
    if (!card || !card.classList) return;

    card.setAttribute('data-lrf', known ? String(rating) : '?');
    // По одному аргументу: старые движки не принимают список классов.
    card.classList.remove('lrf-hidden');
    card.classList.remove('lrf-dim');

    if (!known) return;

    var need = minRating();
    var trusted = votes < 0 || votes >= minVotes();
    var bad;

    if (!votes) {
      // Никто не голосовал — оценки нет вовсе.
      bad = hideUnrated();
    } else if (!trusted) {
      // Голосов слишком мало, чтобы верить цифре: считаем такую карточку
      // как «без оценки» и поступаем по тому же правилу.
      bad = hideUnrated();
    } else {
      bad = rating < need;
    }

    if (bad) card.classList.add(dimInsteadOfHide() ? 'lrf-dim' : 'lrf-hidden');
  }

  function clearCard(card) {
    if (!card || !card.classList) return;
    card.classList.remove('lrf-hidden');
    card.classList.remove('lrf-dim');
    card.removeAttribute('data-lrf');
    card.removeAttribute('data-lrf-seen');
  }

  function handleCard(card) {
    if (!card || card.getAttribute('data-lrf-seen')) return;

    var data = cardData(card);
    var key = cardKey(data);
    if (!key) return;

    card.setAttribute('data-lrf-seen', '1');

    var hit = cachedRating(key);
    if (hit) {
      applyVerdict(card, hit.rating, hit.votes, !hit.failed);
      return;
    }

    requestRating(key, function (value) {
      // Карточку могли пересобрать или увести с экрана, пока ждали ответ.
      if (!document.body.contains(card)) return;
      applyVerdict(card, value.rating, value.votes, !value.failed);
    });
  }

  function scan(onlyNew) {
    if (!active() || !scopeAllows()) return;
    var cards = document.querySelectorAll(onlyNew ? '.card:not([data-lrf-seen])' : '.card');
    for (var i = 0; i < cards.length; i++) handleCard(cards[i]);
  }

  function resetAll() {
    var cards = document.querySelectorAll('.card[data-lrf-seen], .card[data-lrf]');
    for (var i = 0; i < cards.length; i++) clearCard(cards[i]);
  }

  function refresh() {
    resetAll();
    if (active()) scan(false);
  }

  // Отложенный запуск: событий на прокрутке много, работа одна.
  var timers = {};
  function later(fn, ms, tag) {
    if (timers[tag]) clearTimeout(timers[tag]);
    timers[tag] = setTimeout(function () { timers[tag] = 0; safe(fn); }, ms);
  }

  // ──────────────────────────── стили ─────────────────────────────────

  function addStyles() {
    if (document.getElementById('lrf-style')) return;
    var css = document.createElement('style');
    css.id = 'lrf-style';
    css.textContent =
      /* Скрытая карточка не должна занимать место: тогда список короче,
         и Lampa сама раньше подгружает следующую страницу. */
      '.card.lrf-hidden{display:none!important}' +
      '.card.lrf-dim{opacity:.25!important;filter:grayscale(1)!important}' +
      '.lrf-note{padding:.4em 0 0;opacity:.6;font-size:.9em;line-height:1.3}';
    document.head.appendChild(css);
  }

  // ─────────────────────────── настройки UI ───────────────────────────

  function addSettings() {
    if (!Lampa.SettingsApi) return;

    Lampa.SettingsApi.addComponent({
      component: 'lampa_rating_filter',
      name: 'Фильтр по рейтингу Lampa',
      icon: ICON
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: { name: K.enabled, type: 'trigger', default: DEFAULTS[K.enabled] },
      field: {
        name: 'Включить фильтр',
        description: 'Убирать из подборок карточки с низкой оценкой Lampa'
      },
      onChange: function () { later(refresh, 60, 'change'); }
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: {
        name: K.min,
        type: 'select',
        values: {
          '0': 'Выключено',
          '5': 'от 5.0',
          '6': 'от 6.0',
          '6.5': 'от 6.5',
          '7': 'от 7.0',
          '7.5': 'от 7.5',
          '8': 'от 8.0',
          '8.5': 'от 8.5',
          '9': 'от 9.0'
        },
        default: DEFAULTS[K.min]
      },
      field: {
        name: 'Минимальный рейтинг',
        description: 'Чем выше порог, тем реже список: карточки ниже порога скрываются'
      },
      onChange: function () { later(refresh, 60, 'change'); }
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: {
        name: K.votes,
        type: 'select',
        values: {
          '0': 'Любое количество',
          '5': 'от 5 оценок',
          '10': 'от 10 оценок',
          '50': 'от 50 оценок',
          '100': 'от 100 оценок'
        },
        default: DEFAULTS[K.votes]
      },
      field: {
        name: 'Доверять оценке',
        description: 'Две-три реакции легко дают 10 из 10. Ниже этого числа оценка считается ненадёжной'
      },
      onChange: function () { later(refresh, 60, 'change'); }
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: {
        name: K.unrated,
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрывать' },
        default: DEFAULTS[K.unrated]
      },
      field: {
        name: 'Карточки без оценок',
        description: 'Новинки и редкие фильмы часто вообще никто не оценивал'
      },
      onChange: function () { later(refresh, 60, 'change'); }
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: {
        name: K.scope,
        type: 'select',
        values: { catalog: 'Только подборки', all: 'Везде' },
        default: DEFAULTS[K.scope]
      },
      field: {
        name: 'Где фильтровать',
        description: 'В закладках, истории и поиске фильтр обычно мешает: он прячет то, что вы ищете'
      },
      onChange: function () { later(refresh, 60, 'change'); }
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: {
        name: K.mode,
        type: 'select',
        values: { hide: 'Скрывать', dim: 'Затемнять' },
        default: DEFAULTS[K.mode]
      },
      field: {
        name: 'Что делать с лишними',
        description: 'Затемнение удобно, чтобы проверить настройки: видно, что именно отсеивается'
      },
      onChange: function () { later(refresh, 60, 'change'); }
    });

    Lampa.SettingsApi.addParam({
      component: 'lampa_rating_filter',
      param: { name: 'lrf_clear_cache', type: 'trigger', default: false },
      field: {
        name: 'Очистить кеш оценок',
        description: 'Одноразовое действие: оценки будут запрошены заново'
      },
      onChange: function () {
        cache = {};
        safe(function () { Lampa.Storage.set(K.cache, {}); });
        safe(function () { Lampa.Storage.set('lrf_clear_cache', false); });
        safe(function () { Lampa.Noty.show('Кеш оценок Lampa очищен'); });
        later(refresh, 60, 'change');
      }
    });
  }

  // ──────────────────────────── запуск ────────────────────────────────

  function start() {
    addStyles();
    addSettings();

    /* Ловим карточки событиями самой Lampa.

       MutationObserver здесь не нужен и вреден: на старых телевизорах он
       полифилится опросом DOM каждые 30 мс, а список карточек Lampa
       перерисовывает постоянно. Событий 'line' и 'activity' достаточно. */
    safe(function () {
      Lampa.Listener.follow('line', function (e) {
        if (e.type === 'append' || e.type === 'visible') later(function () { scan(true); }, 60, 'line');
      });
    });

    safe(function () {
      Lampa.Listener.follow('activity', function (e) {
        if (e.component === 'start' || e.type === 'archive' || e.type === 'destroy') return;
        later(function () { scan(true); }, 120, 'activity');
        later(function () { scan(true); }, 500, 'activity-late');
      });
    });

    // Прокрутка и пульт: карточки досоздаются по ходу движения.
    safe(function () {
      window.addEventListener('scroll', function () { later(function () { scan(true); }, 120, 'scroll'); }, true);
      window.addEventListener('keydown', function () { later(function () { scan(true); }, 150, 'key'); }, true);
      window.addEventListener('touchend', function () { later(function () { scan(true); }, 150, 'touch'); }, true);
    });

    later(function () { scan(true); }, 300, 'boot');
    later(function () { scan(true); }, 1200, 'boot-late');
  }

  if (window.lampa_rating_filter_ready) return;
  window.lampa_rating_filter_ready = VERSION;

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }
})();
