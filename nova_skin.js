(function () {
  'use strict';

  if (window.nova_skin) return;
  window.nova_skin = true;

  var ENABLED_KEY = 'nova_skin_enabled';
  var JUMP_FROM = 20;
  var SEEN_PERCENT = 90;

  var aside = false;

  var SIBLING_COMPONENTS = ['lampacskaz', 'onlyskaz', 'skazonline'];
  var SIBLING_MARKUP = '.nova__rows,.nova__list,.nova-hero,.nova-card,.z01,.z01__rows,.z01__list,.z01-hero,.z01-card';

  function siblingInstalled() {
    return !!(window.nova_online_plugin || window.onlyskaz_plugin);
  }

  function siblingComponent(current) {
    var name = '';
    try {
      name = String((current && current.component) || '');
    } catch (e) {
      name = '';
    }
    if (!name) return false;
    if (SIBLING_COMPONENTS.indexOf(name) !== -1) return true;
    return /skaz/i.test(name);
  }

  function stepAside() {
    if (aside) return;
    aside = true;
    inplaceStop();
    try {
      if (ui.root) ui.root.remove();
      if (root) {
        root.removeClass('nova-skin-scope nova-skin-chips');
        root.find('.nova-hidden').removeClass('nova-hidden');
      }
    } catch (e) {}
    switchDone();
    lockRelease();
    ui = {};
    root = null;
    host = null;
  }

  var filters = [];
  var scrolls = [];

  function get(key, def) {
    try { return Lampa.Storage.get(key, def); } catch (e) { return def; }
  }

  function cached(key, size, def) {
    var out;
    try { out = Lampa.Storage.cache(key, size, def); } catch (e) { out = null; }
    if (!out || typeof out !== 'object') {
      out = def;
      try { Lampa.Storage.set(key, def); } catch (e) {}
    }
    return out;
  }

  function save(key, value) {
    try { Lampa.Storage.set(key, value); } catch (e) {}
  }

  function enabled() { return get(ENABLED_KEY, true) !== false; }
  function heroEnabled() { return get('nova_skin_hero', true) !== false; }
  function artEnabled() { return get('nova_skin_hero_art', true) !== false; }
  function viewMode() { return get('nova_skin_view', 'list'); }
  function preferredQuality() { return get('nova_skin_quality', 'auto'); }

  function focusRing() { return get('nova_focus_style', 'ring') !== 'fill'; }

  function fullScreen() { return get('nova_skin_fullscreen', true) === true; }

  function applyFullScreen() {
    try {
      var body = $('body');
      if (fullScreen()) body.addClass('nova-skin-full');
      else body.removeClass('nova-skin-full');
    } catch (e) {}
  }

  function edgeFade() { return get('nova_skin_fade', true) === true; }

  function applyEdgeFade() {
    try {
      var body = $('body');
      if (edgeFade()) body.addClass('nova-skin-fade');
      else body.removeClass('nova-skin-fade');
    } catch (e) {}
  }

  function applyFocusStyle() {
    try {
      var body = $('body');
      if (focusRing()) body.addClass('nova-focus-ring');
      else body.removeClass('nova-focus-ring');
    } catch (e) {}
  }

  var OWN = {
    nova_skin_watch: { ru: 'Смотреть', uk: 'Дивитися', en: 'Watch' },
    nova_skin_continue: { ru: 'Продолжить', uk: 'Продовжити', en: 'Continue' },
    nova_skin_from_start: { ru: 'Смотреть с начала', uk: 'Дивитися з початку', en: 'Watch from start' },
    nova_skin_next_episode: { ru: 'Следующая', uk: 'Наступна', en: 'Next' },
    nova_skin_first_new: { ru: 'Первая непросмотренная', uk: 'Перша непроглянута', en: 'First unwatched' },
    nova_skin_source: { ru: 'Источник', uk: 'Джерело', en: 'Source' },
    nova_skin_season: { ru: 'Сезон', uk: 'Сезон', en: 'Season' },
    nova_skin_voice: { ru: 'Перевод', uk: 'Переклад', en: 'Audio' },
    nova_skin_jump: { ru: 'Серии', uk: 'Серії', en: 'Episodes' },
    nova_skin_jump_pick: { ru: 'Выбрать серию', uk: 'Вибрати серію', en: 'Pick an episode' },
    nova_skin_view: { ru: 'Вид', uk: 'Вигляд', en: 'View' },
    nova_skin_view_list: { ru: 'Список', uk: 'Список', en: 'List' },
    nova_skin_view_grid: { ru: 'Плитка', uk: 'Плитка', en: 'Grid' },
    nova_skin_clarify: { ru: 'Уточнить поиск', uk: 'Уточнити пошук', en: 'Refine search' },
    nova_skin_more_sources: { ru: 'Ещё {count}', uk: 'Ще {count}', en: '{count} more' },
    nova_skin_season_progress: { ru: 'Просмотрено {seen} из {total}', uk: 'Переглянуто {seen} з {total}', en: 'Watched {seen} of {total}' },
    nova_skin_season_left: { ru: 'осталось {left}', uk: 'залишилось {left}', en: '{left} left' },
    nova_skin_season_planned: { ru: 'всего в сезоне {planned}', uk: 'усього в сезоні {planned}', en: '{planned} in the season' },
    nova_skin_left: { ru: 'осталось', uk: 'залишилось', en: 'left' },
    nova_skin_loading_title: { ru: 'Ищем, где посмотреть', uk: 'Шукаємо, де подивитися', en: 'Looking for a source' },
    nova_skin_loading_start: { ru: 'Опрашиваем источники', uk: 'Опитуємо джерела', en: 'Checking sources' },
    nova_skin_sec: { ru: ' с', uk: ' с', en: ' s' },
    nova_skin_episode: { ru: 'Серия', uk: 'Серія', en: 'Episode' },
    nova_skin_action: { ru: 'Действие', uk: 'Дія', en: 'Action' },
    nova_skin_unknown: { ru: 'Неизвестно', uk: 'Невідомо', en: 'Unknown' },
    nova_skin_voice_dub: { ru: 'Дубляж', uk: 'Дубляж', en: 'Dubbed' },
    nova_skin_voice_mvo: { ru: 'Многоголосый', uk: 'Багатоголосий', en: 'Multi-voice' },
    nova_skin_voice_dvo: { ru: 'Двухголосый', uk: 'Двоголосий', en: 'Two-voice' },
    nova_skin_voice_avo: { ru: 'Авторский', uk: 'Авторський', en: 'Single-voice' },
    nova_skin_voice_orig: { ru: 'Оригинал', uk: 'Оригінал', en: 'Original' },
    nova_skin_voice_sub: { ru: 'Субтитры', uk: 'Субтитри', en: 'Subtitles' },
    nova_skin_voice_other: { ru: 'Другое', uk: 'Інше', en: 'Other' },
    nova_skin_try_source: { ru: 'Попробовать {name}', uk: 'Спробувати {name}', en: 'Try {name}' },
    nova_skin_all_sources: { ru: 'Все источники', uk: 'Всі джерела', en: 'All sources' },
    nova_skin_retry: { ru: 'Повторить', uk: 'Повторити', en: 'Retry' },
    nova_skin_auto_next: { ru: 'Через {sec} сек переключимся на «{name}»', uk: 'Через {sec} с перейдемо на «{name}»', en: 'Switching to "{name}" in {sec}s' },
    nova_skin_dead_all: { ru: 'Ни один источник ничего не нашёл', uk: 'Жодне джерело нічого не знайшло', en: 'No source found anything' },
    nova_skin_set_enable: { ru: 'Включить Nova Skin', uk: 'Увімкнути Nova Skin', en: 'Enable Nova Skin' },
    nova_skin_set_enable_descr: { ru: 'Единый интерфейс для всех онлайн-плагинов', uk: 'Єдиний інтерфейс для всіх онлайн-плагінів', en: 'One interface for every online plugin' },
    nova_skin_set_enable_descr_alt: { ru: 'Единый интерфейс для всех онлайн-плагинов, кроме тех, где он уже встроен', uk: 'Єдиний інтерфейс для всіх онлайн-плагінів, крім тих, де він уже вбудований', en: 'One interface for every online plugin except those that already ship with it' },
    nova_skin_set_hero: { ru: 'Шапка с кнопкой', uk: 'Шапка з кнопкою', en: 'Header with button' },
    nova_skin_set_hero_descr: { ru: 'Кадр, прогресс и кнопка продолжения сверху', uk: 'Кадр, прогрес і кнопка продовження вгорі', en: 'Backdrop, progress and continue button on top' },
    nova_skin_set_hero_art: { ru: 'Кадр в шапке', uk: 'Кадр у шапці', en: 'Backdrop in header' },
    nova_skin_set_hero_art_descr: { ru: 'Выключите для компактной шапки без картинки', uk: 'Вимкніть для компактної шапки без картинки', en: 'Turn off for a compact header without artwork' },
    nova_skin_set_logo: { ru: 'Логотип вместо названия', uk: 'Логотип замість назви', en: 'Logo instead of title' },
    nova_skin_set_logo_descr: { ru: 'Показывать логотип фильма в шапке, если он есть', uk: 'Показувати логотип фільму в шапці, якщо він є', en: 'Show the movie logo in the header when available' },
    nova_skin_set_full: { ru: 'Во всю ширину экрана', uk: 'На всю ширину екрана', en: 'Full width' },
    nova_skin_set_full_descr: { ru: 'Скрыть маленький постер и описание слева', uk: 'Сховати маленький постер і опис ліворуч', en: 'Hide the small poster and overview on the left' },
    nova_skin_set_fade: { ru: 'Размытые края постера', uk: 'Розмиті краї постера', en: 'Faded poster edges' },
    nova_skin_set_fade_descr: { ru: 'Растворять постер вверху по краям со всех сторон', uk: 'Розчиняти постер угорі по краях з усіх боків', en: 'Fade the header artwork out on every side' },
    nova_skin_set_probe: { ru: 'Проверять источники в фоне', uk: 'Перевіряти джерела у фоні', en: 'Check sources in background' },
    nova_skin_set_probe_descr: { ru: 'Отмечать рабочие точкой и показывать их качество', uk: 'Позначати робочі точкою та показувати їхню якість', en: 'Mark working ones with a dot and show their quality' },
    nova_skin_set_switch: { ru: 'Автопереход по источникам', uk: 'Автоперехід по джерелах', en: 'Auto switch source' },
    nova_skin_set_switch_descr: { ru: 'Если ничего не найдено, пробовать следующий рабочий источник', uk: 'Якщо нічого не знайдено, пробувати наступне робоче джерело', en: 'Try the next working source when nothing is found' },
    nova_skin_set_view: { ru: 'Вид списка', uk: 'Вигляд списку', en: 'List layout' },
    nova_skin_set_view_descr: { ru: 'Список или плитка (4 в ряд)', uk: 'Список або плитка (4 в ряд)', en: 'List or grid (4 per row)' },
    nova_skin_set_quality: { ru: 'Качество по умолчанию', uk: 'Якість за замовчуванням', en: 'Default quality' },
    nova_skin_set_quality_descr: { ru: 'Предпочтительное качество воспроизведения', uk: 'Бажана якість відтворення', en: 'Preferred playback quality' },
    nova_skin_set_quality_auto: { ru: 'Авто', uk: 'Авто', en: 'Auto' },
    nova_skin_set_focus: { ru: 'Выделение', uk: 'Виділення', en: 'Highlight style' },
    nova_skin_set_focus_descr: { ru: 'Чем подсвечивать выбранную кнопку, серию или озвучку', uk: 'Чим підсвічувати вибрану кнопку, серію або озвучення', en: 'How the focused button, episode or voice is highlighted' },
    nova_skin_set_focus_ring: { ru: 'Ободок', uk: 'Обідок', en: 'Outline' },
    nova_skin_set_focus_fill: { ru: 'Белая заливка', uk: 'Біла заливка', en: 'White fill' }
  };

  try {
    Lampa.Lang.add(OWN);
  } catch (e) {}

  function tr(key) {
    try {
      var value = Lampa.Lang.translate(key);
      if (value && value !== key) return value;
    } catch (e) {}
    return '';
  }

  function text(key, own) {
    return tr(key) || tr(own) || (OWN[own] ? OWN[own].ru : '');
  }

  function label(key) {
    return tr(key) || (OWN[key] ? OWN[key].ru : '');
  }

  var ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4" stroke-linecap="round"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 11a8 8 0 10-2.3 5.7" stroke-linecap="round"></path><path d="M20 4v7h-7" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.6"></rect><rect x="13" y="3" width="8" height="8" rx="1.6"></rect><rect x="3" y="13" width="8" height="8" rx="1.6"></rect><rect x="13" y="13" width="8" height="8" rx="1.6"></rect></svg>',
    list: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1.4"></rect><rect x="3" y="10" width="18" height="4" rx="1.4"></rect><rect x="3" y="16" width="18" height="4" rx="1.4"></rect></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="2.6"></circle></svg>'
  };

  function esc(value) {
    return (value === undefined || value === null ? '' : String(value))
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function digits(value) {
    var found = ('' + (value === undefined || value === null ? '' : value)).match(/\d+/);
    return found ? parseInt(found[0], 10) : 0;
  }

  function image(path, size) {
    if (!path || path === 'undefined') return '';
    if (/^https?:/.test(path)) return path;
    try { return Lampa.TMDB.image('t/p/' + (size || 'w780') + path); } catch (e) { return ''; }
  }

  function episodeNumber(value) {
    var num = parseInt(value, 10);
    if (!num && num !== 0) return String(value === undefined || value === null ? '' : value);
    return num < 10 ? '0' + num : String(num);
  }

  function shortQuality(value) {
    if (!value) return '';
    value = String(value);
    var match = value.match(/(2160|1440|1080|720|576|480|360)\s*p?/i);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num >= 2160) return '4K';
      if (num >= 1080) return 'FHD';
      if (num >= 720) return 'HD';
      return 'SD';
    }
    if (/4k|uhd/i.test(value)) return '4K';
    if (/fhd/i.test(value)) return 'FHD';
    if (/\bhd\b/i.test(value)) return 'HD';
    return '';
  }

  var QUALITY_RANK = { '4K': 4, FHD: 3, HD: 2, SD: 1 };
  var PROBE_TTL_OK = 21600000;
  var PROBE_TTL_EMPTY = 1800000;

  function knownQuality(name) {
    var all = cached('nova_source_quality', 500, {});
    return all[name] || '';
  }

  function rememberQuality(name, label) {
    if (!name || !label) return;
    var all = cached('nova_source_quality', 500, {});
    if ((QUALITY_RANK[label] || 0) <= (QUALITY_RANK[all[name]] || 0)) return;
    all[name] = label;
    save('nova_source_quality', all);
  }

  function probeCache(id) {
    var all = cached('nova_probe', 2000, {});
    var mine = all[id];
    if (!mine || typeof mine !== 'object' || !mine.list) {
      mine = { time: Date.now(), list: {} };
      all[id] = mine;
    }
    var list = mine.list || {};
    var now = Date.now();
    for (var key in list) {
      var entry = list[key] || {};
      var stamp = entry.t || mine.time || 0;
      var ttl = entry.s === 'ok' ? PROBE_TTL_OK : PROBE_TTL_EMPTY;
      if (now - stamp > ttl) delete list[key];
    }
    mine.list = list;
    return mine;
  }

  function probeSave(id, name, state, count) {
    if (!id || !name) return;
    var all = cached('nova_probe', 2000, {});
    var mine = probeCache(id);
    mine.list[name] = { s: state, c: count || 0, t: Date.now() };
    all[id] = mine;
    save('nova_probe', all);
  }

  function splitSourceName(name) {
    name = String(name || '');
    var badge = '';
    var match = name.match(/\s*[-~–]\s*(2160p?|1440p?|1080p?|720p?|480p?|4k|uhd|fhd|hd)\b[^,]*$/i);
    if (match) {
      badge = shortQuality(match[1]);
      if (badge) name = name.slice(0, match.index);
    }
    return { name: name.replace(/\s+$/, ''), badge: badge };
  }

  var VOICE_KINDS = [
    { key: 'dub', own: 'nova_skin_voice_dub', title: 'nova_voice_dub', re: /дубляж|дублирован|\bdub\b|\bdubbing\b/i },
    { key: 'mvo', own: 'nova_skin_voice_mvo', title: 'nova_voice_mvo', re: /многоголос|\bmvo\b|\bpmvo\b/i },
    { key: 'dvo', own: 'nova_skin_voice_dvo', title: 'nova_voice_dvo', re: /двухголос|\bdvo\b/i },
    { key: 'avo', own: 'nova_skin_voice_avo', title: 'nova_voice_avo', re: /авторск|одноголос|\bavo\b|\bvo\b/i },
    { key: 'orig', own: 'nova_skin_voice_orig', title: 'nova_voice_orig', re: /оригинал|original|\beng\b|\bua\b|\bukr\b/i },
    { key: 'sub', own: 'nova_skin_voice_sub', title: 'nova_voice_sub', re: /субтитр|sub(title)?s?\b/i }
  ];

  var VOICE_STUDIOS = [
    { key: 'mvo', re: /lostfilm|лостфильм|tvshows|dniprofilm|невафильм|newstudio|newcomers|baibako|байбако|alexfilm|jaskier|coldfilm|колдфильм|hdrezka|rezkastudio|red head sound|sunshine|amedia|zakadry|закадры|linefilm|le-production|1win|kerob|profix|selena|октопус/i },
    { key: 'dvo', re: /кубик в кубе|kubik|viruseproject|вирус|green ?tea|paradox/i },
    { key: 'avo', re: /яроцк|гаврилов|володарск|сербин|горчаков|михал[её]в|живов|пучков|гоблин|кураж|дольск|есарев|карповск|визгунов/i }
  ];

  function voiceKind(title) {
    var value = String(title || '');
    var i;
    for (i = 0; i < VOICE_KINDS.length; i++) {
      if (VOICE_KINDS[i].re.test(value)) return VOICE_KINDS[i].key;
    }
    for (i = 0; i < VOICE_STUDIOS.length; i++) {
      if (VOICE_STUDIOS[i].re.test(value)) return VOICE_STUDIOS[i].key;
    }
    return 'other';
  }

  function voiceRank(title) {
    var kind = voiceKind(title);
    for (var i = 0; i < VOICE_KINDS.length; i++) {
      if (VOICE_KINDS[i].key === kind) return i;
    }
    return 90;
  }

  function pageSize(total) {
    return total > 200 ? 50 : total > 80 ? 20 : 10;
  }

  function pages(total) {
    var size = pageSize(total);
    var out = [];
    for (var start = 0; start < total; start += size) {
      out.push({ start: start, end: Math.min(start + size, total) - 1 });
    }
    if (out.length > 1) {
      var tail = out[out.length - 1];
      if (tail.end - tail.start + 1 <= size / 2) {
        out[out.length - 2].end = tail.end;
        out.pop();
      }
    }
    return out;
  }

  function pageAt(list, index) {
    for (var i = 0; i < list.length; i++) {
      if (index >= list[i].start && index <= list[i].end) return list[i];
    }
    return list[0] || { start: 0, end: -1 };
  }

  function addCSS() {
    if (document.getElementById('nova-skin-css')) return;
    var style = document.createElement('style');
    style.id = 'nova-skin-css';
    style.textContent = SKIN_CSS + EXTRA_CSS + CARD_CSS + FOCUS_CSS + FULL_CSS + FADE_CSS;
    (document.body || document.head).appendChild(style);
  }

  function hookFilter() {
    if (!Lampa.Filter || Lampa.Filter.nova_wrapped) return;
    var real = Lampa.Filter;

    function Wrapped(params) {
      var inst = new real(params);
      var setter = inst.set;
      inst.nova_sets = {};
      inst.set = function (type, list) {
        inst.nova_sets[type] = list;
        return setter.apply(inst, arguments);
      };
      filters.unshift(inst);
      if (filters.length > 4) filters.pop();
      return inst;
    }

    Wrapped.nova_wrapped = true;
    for (var key in real) Wrapped[key] = real[key];
    Lampa.Filter = Wrapped;
  }

  function hookSelect() {
    if (!Lampa.Select || Lampa.Select.nova_wrapped) return;
    var show = Lampa.Select.show;
    var hide = Lampa.Select.hide;
    var close = Lampa.Select.close;
    var opened = false;

    Lampa.Select.show = function (params) {
      if (capturing && params && params.items && params.items.length) {
        captured = params;
        return;
      }
      opened = true;
      return show.apply(Lampa.Select, arguments);
    };

    if (typeof hide === 'function') {
      Lampa.Select.hide = function () {
        opened = false;
        try {
          return hide.apply(Lampa.Select, arguments);
        } catch (e) {}
      };
    }

    if (typeof close === 'function') {
      Lampa.Select.close = function () {
        if (!opened) return;
        opened = false;
        try {
          return close.apply(Lampa.Select, arguments);
        } catch (e) {}
      };
    }

    try {
      Lampa.Select.listener.follow('hide', function () {
        opened = false;
      });
    } catch (e) {}

    Lampa.Select.nova_wrapped = true;
  }

  function learnUrl(url) {
    var value = String(url == null ? '' : url);
    if (!/\/lite\/[^\/?&]+/.test(value)) return;
    if (value.indexOf('lite/events') !== -1) return;
    probe_url = value;
  }

  function hookRequest() {
    if (!Lampa.Reguest || Lampa.Reguest.nova_wrapped) return;
    var real = Lampa.Reguest;

    function Wrapped() {
      var inst = new real();
      ['native', 'silent', 'timeout', 'clear'].forEach(function (name) {
        if (typeof inst[name] !== 'function') return;
        if (name === 'timeout' || name === 'clear') return;
        var origin = inst[name];
        inst[name] = function (url) {
          try { learnUrl(url); } catch (e) {}
          return origin.apply(inst, arguments);
        };
      });
      return inst;
    }

    Wrapped.nova_wrapped = true;
    for (var key in real) Wrapped[key] = real[key];
    Wrapped.prototype = real.prototype;
    Lampa.Reguest = Wrapped;
  }

  function hookXHR() {
    try {
      if (!window.XMLHttpRequest || XMLHttpRequest.prototype.nova_wrapped) return;
      var open = XMLHttpRequest.prototype.open;
      if (typeof open !== 'function') return;
      XMLHttpRequest.prototype.open = function (method, url) {
        try { learnUrl(url); } catch (e) {}
        return open.apply(this, arguments);
      };
      XMLHttpRequest.prototype.nova_wrapped = true;
    } catch (e) {}
  }

  function hookScroll() {
    if (!Lampa.Scroll || Lampa.Scroll.nova_wrapped) return;
    var real = Lampa.Scroll;

    function Wrapped(params) {
      var inst = new real(params);
      scrolls.unshift(inst);
      if (scrolls.length > 6) scrolls.pop();
      return inst;
    }

    Wrapped.nova_wrapped = true;
    for (var key in real) Wrapped[key] = real[key];
    Lampa.Scroll = Wrapped;
  }

  function hookController() {
    if (!Lampa.Controller || Lampa.Controller.nova_wrapped) return;
    var add = Lampa.Controller.add;

    Lampa.Controller.add = function (name, object) {
      if (name === 'content' && object && !object.nova_hooked) {
        object.nova_hooked = true;

        if (typeof object.up === 'function') {
          var up = object.up;
          object.up = function () {
            if (novaUp()) return;
            return up.apply(this, arguments);
          };
        }
        if (typeof object.down === 'function') {
          var down = object.down;
          object.down = function () {
            if (novaDown()) return;
            return down.apply(this, arguments);
          };
        }
        if (typeof object.right === 'function') {
          var right = object.right;
          object.right = function () {
            if (novaRight()) return;
            return right.apply(this, arguments);
          };
        }
        if (typeof object.toggle === 'function') {
          var toggle = object.toggle;
          object.toggle = function () {
            var result = toggle.apply(this, arguments);
            keepFocus();
            return result;
          };
        }
      }
      return add.apply(Lampa.Controller, arguments);
    };

    Lampa.Controller.nova_wrapped = true;
  }

  function activeFilter(root) {
    for (var i = 0; i < filters.length; i++) {
      try {
        if ($.contains(root[0], filters[i].render()[0])) return filters[i];
      } catch (e) {}
    }
    return null;
  }

  function activeScroll(node) {
    for (var i = 0; i < scrolls.length; i++) {
      try {
        var render = scrolls[i].render();
        if (render && render.length && $.contains(render[0], node)) return scrolls[i];
      } catch (e) {}
    }
    return null;
  }

  function scrollTo(element) {
    var node = element instanceof jQuery ? element[0] : element;
    if (!node) return;
    var scroll = activeScroll(node);
    if (scroll) {
      try {
        scroll.update($(node), true);
        return;
      } catch (e) {}
    }
    try {
      var box = $(node).closest('.scroll');
      if (!box.length) return;
      var body = box.find('.scroll__body').first();
      if (!body.length) return;
      var top = node.getBoundingClientRect().top - box[0].getBoundingClientRect().top;
      if (top > -1 && top < box[0].offsetHeight * 0.6) return;
      var style = body[0].style['-webkit-transform'] || body[0].style.transform || '';
      if (style.indexOf('translate') !== -1) {
        var pair = style.match(/-?[\d.]+px,\s*(-?[\d.]+)px/);
        var now = pair ? parseFloat(pair[1]) || 0 : 0;
        var next = Math.min(0, Math.round(now - top + 20));
        body[0].style['-webkit-transform'] = 'translate3d(0px, ' + next + 'px, 0px)';
        body[0].style.transform = 'translate3d(0px, ' + next + 'px, 0px)';
      } else {
        box[0].scrollTop = Math.max(0, box[0].scrollTop + top - 20);
      }
    } catch (e) {}
  }

  var ui = {};
  var root = null;
  var host = null;
  var items = [];
  var groups = { season: null, voice: null, sort: null };
  var extras = [];
  var extra_menu = null;
  var capturing = false;
  var captured = null;
  var chip_actions = {};
  var filter = null;
  var movie = null;
  var serial = false;
  var nav = false;
  var last = null;

  var ui_open = '';
  var ui_focus = '';
  var ui_lock = '';
  var ui_lock_time = 0;
  var lock_timer = null;
  var focusing = false;
  var ui_page = -1;
  var ui_page_focus = -1;
  var ui_all_sources = false;
  var signature = '';
  var note_sig = '';
  var busy = false;

  var pending = null;
  var switch_observer = null;

  function forget() {
    if (pendingLive() && ui.root) {
      root = null;
      host = null;
      items = [];
      groups = { season: null, voice: null, sort: null };
      extras = [];
      filter = null;
      signature = '';
      note_sig = '';
      busy = false;
      ui_open = '';
      ui_page = -1;
      ui_page_focus = -1;
      return;
    }

    pending = null;
    inplaceStop();
    ui = {};
    root = null;
    host = null;
    items = [];
    groups = { season: null, voice: null, sort: null };
    extras = [];
    extra_menu = null;
    captured = null;
    capturing = false;
    filter = null;
    movie = null;
    last = null;
    ui_open = '';
    ui_focus = '';
    ui_lock = '';
    ui_lock_time = 0;
    focusing = false;
    ui_page = -1;
    ui_page_focus = -1;
    ui_all_sources = false;
    signature = '';
    note_sig = '';
    busy = false;
  }

  function readGroups(inst) {
    var out = { season: null, voice: null, sort: null };
    if (!inst || !inst.nova_sets) return out;

    (inst.nova_sets.filter || []).forEach(function (group) {
      if (!group || !group.items || !group.items.length) return;
      if (group.stype === 'season') out.season = group;
      if (group.stype === 'voice') out.voice = group;
    });

    var sort = inst.nova_sets.sort || [];
    if (sort.length) out.sort = sort;
    return out;
  }

  function scope() {
    if (!enabled() || aside) return null;

    var current;
    try { current = Lampa.Activity.active(); } catch (e) { return null; }
    if (!current || !current.activity) return null;
    if (siblingComponent(current)) {
      stepAside();
      return null;
    }

    var box;
    try { box = current.activity.render(); } catch (e) { return null; }
    if (!box || !box.length) return null;
    if (!box.hasClass('explorer')) box = box.find('.explorer').first();
    if (!box.length) return null;

    var body = box.find('.explorer__files-body .scroll__body').first();
    if (!body.length) return null;
    if (body.find('.torrent-item').length) return null;

    if (!body.find('.nova-skin-root').length && body.find(SIBLING_MARKUP).length) {
      stepAside();
      return null;
    }

    var card = current.movie || current.card;
    if (!card) return null;

    return { root: box, body: body, movie: card };
  }

  function sourceTitle() {
    var sort = groups.sort || [];
    for (var i = 0; i < sort.length; i++) {
      if (sort[i].selected) return sort[i].title || '';
    }
    return sort.length ? (sort[0].title || '') : '';
  }

  var KNOWN_BUTTONS = '.filter--search,.filter--sort,.filter--filter,.filter--back,.filter--reset';

  function readExtras() {
    var out = [];
    if (!root) return out;
    var head = root.find('.explorer__files-head').first();
    if (!head.length) return out;

    head.find('.simple-button.selector').each(function () {
      var node = $(this);
      if (node.is(KNOWN_BUTTONS) || node.closest('.nova-skin-root').length) return;
      var label = node.children('span').first().text().trim();
      var value = node.children('div').not('.hide').last().text().trim();
      if (!value) value = node.children('div').last().text().trim();
      if (!label && !value) return;
      out.push({ node: node, label: label, value: value || label });
    });
    return out;
  }

  function extrasStamp() {
    return extras.map(function (entry) {
      return entry.label + '=' + entry.value;
    }).join(',');
  }

  function currentSourceKey() {
    var sort = groups.sort || [];
    for (var i = 0; i < sort.length; i++) {
      if (sort[i].selected) return sort[i].source || sort[i].title || '';
    }
    return '';
  }

  function seasonNumber() {
    return groups.season ? digits(groups.season.subtitle) : 0;
  }

  function heroArt() {
    return image(movie.backdrop_path || movie.poster_path, 'w780') || image(movie.img, 'w780');
  }

  function fallbackArt() {
    var art = image(movie.backdrop_path, 'w300') || image(movie.poster_path, 'w300');
    if (!art) {
      try { art = Lampa.Utils.cardImgBackground(movie) || ''; } catch (e) { art = ''; }
    }
    if (!art) art = image(movie.img, 'w300');
    return art;
  }

  function runtimeText(seconds) {
    try { return Lampa.Utils.secondsToTime(seconds, true); } catch (e) { return ''; }
  }

  function lockFocus(key) {
    ui_lock = key || '';
    ui_lock_time = ui_lock ? Date.now() : 0;
    if (ui_lock) {
      ui_focus = ui_lock;
      lockWatch();
    }
  }

  function lockWatch() {
    if (lock_timer) return;
    lock_timer = setInterval(function () {
      if (!lockActive() || !inSkin()) return lockStopWatch();
      var wanted = seek(ui_lock);
      if (!wanted || !wanted.length) return;
      if (wanted.hasClass('focus')) return;
      var here = ui.root.find('.focus');
      if (here.length && !heroKey(here.attr('data-nova-focus') || '') &&
          here.closest('.nova-toolbar,.nova-drop').length === 0) {
        return lockStopWatch(true);
      }
      focusNode(wanted);
    }, 120);
  }

  function lockStopWatch(release) {
    clearInterval(lock_timer);
    lock_timer = null;
    if (release) lockRelease();
  }

  function heroKey(key) {
    return key === 'hero' || key === 'hero-next';
  }

  function lockActive() {
    if (!ui_lock) return false;
    if (Date.now() - ui_lock_time > 8000) {
      lockRelease();
      return false;
    }
    return true;
  }

  function lockRelease() {
    ui_lock = '';
    ui_lock_time = 0;
    clearInterval(lock_timer);
    lock_timer = null;
  }

  function bind(element, enter, long) {
    element.on('hover:enter', function () {
      try { enter(); } catch (e) {}
    }).on('hover:focus', function (e) {
      var key = $(e.target).attr('data-nova-focus') || '';
      last = e.target;
      scrollTo(e.target);
      if (lockActive() && key !== ui_lock) {
        if (heroKey(key)) {
          if (focusing) return;
          var back = seek(ui_lock);
          if (back && back.length && back[0] !== e.target) return focusNode(back);
          return;
        }
        lockRelease();
      }
      ui_focus = key;
    });
    if (long) {
      element.on('hover:long', function () {
        try { long(); } catch (e) {}
      });
    }
    return element;
  }

  function uiFrame() {
    if (!ui.root) {
      ui.root = $('<div class="nova nova-skin-root"></div>');
      ui.hero_box = $('<div class="nova__hero"></div>');
      ui.rows = $('<div class="nova__rows"></div>');
      ui.list = $('<div class="nova__list"></div>');
      ui.root.append(ui.hero_box).append(ui.rows).append(ui.list);
    }
    if (!ui.root.parent().length || !$.contains(host, ui.root[0])) {
      $(host).prepend(ui.root);
      rebind();
    }
    return ui.root;
  }

  function rebind() {
    if (!ui.root) return;

    var play = ui.root.find('[data-nova-focus="hero"]').first();
    if (play.length) {
      ui.play = play;
      bindPlay(play.off('hover:enter hover:focus hover:long'));
    }

    var next = ui.root.find('[data-nova-focus="hero-next"]').first();
    if (next.length) {
      ui.next = next;
      bindNext(next.off('hover:enter hover:focus hover:long'));
    }

    ui.rows.find('.nova-toolbar [data-nova-focus]').each(function () {
      var box = $(this);
      var key = box.attr('data-nova-focus');
      var action = chip_actions[key];
      box.off('hover:enter hover:focus hover:long');
      bind(box, action ? action.enter : function () { uiToggle(key); },
        action ? action.long : null);
    });

    ui.rows.find('.nova-drop').remove();
  }

  function switchStart(key) {
    if (!movie) return;
    pending = { id: movie.id, key: key || '', time: Date.now() };
    lockFocus(key);
    switchMark(true);
    switchWatch();
  }

  function switchWatch() {
    if (switch_observer || !window.MutationObserver) return;
    var target;
    try { target = document.body; } catch (e) { return; }
    if (!target) return;
    try {
      switch_observer = new MutationObserver(function () {
        if (!pendingLive()) return switchUnwatch();
        reattach();
      });
      switch_observer.observe(target, { childList: true, subtree: true });
    } catch (e) { switch_observer = null; }
  }

  function switchUnwatch() {
    if (switch_observer) {
      try { switch_observer.disconnect(); } catch (e) {}
    }
    switch_observer = null;
  }

  function switchMark(on) {
    try {
      var body = document.body;
      if (!body) return;
      var name = 'nova-skin-switching';
      var list = ' ' + (body.className || '') + ' ';
      var has = list.indexOf(' ' + name + ' ') !== -1;
      if (on && !has) body.className = (body.className ? body.className + ' ' : '') + name;
      else if (!on && has) body.className = list.split(' ' + name + ' ').join(' ').replace(/^\s+|\s+$/g, '');
    } catch (e) {}
  }

  var inplace = false;
  var inplace_timer = null;
  var swallow = false;
  var real_replace = null;
  var hop = { id: 0, tried: {} };
  var hop_timer = null;
  var probe_url = '';
  var probe_timer = null;
  var probe_busy = false;
  var probe_nets = [];
  var probe_done_for = 0;

  var probe_queue = {};
  var PROBE_TIMEOUT = 7000;
  var PROBE_PARALLEL = 2;
  var PROBE_LIMIT = 12;
  var PROBE_BUDGET = 20000;
  var PROBE_DELAY = 1500;

  function componentNow() {
    try {
      var current = Lampa.Activity.active();
      return (current && current.activity && current.activity.component) || null;
    } catch (e) {
      return null;
    }
  }

  function reloadable(comp) {
    if (!comp || comp.destroyed) return false;
    if (typeof comp.createSource !== 'function') return false;
    if (typeof comp.search !== 'function' && typeof comp.find !== 'function') return false;
    return true;
  }

  function autoSwitchOn() {
    return get('nova_skin_auto_switch', true) !== false;
  }

  function lifeKnown() {
    var list = groups.sort || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && typeof list[i].ghost !== 'undefined') return true;
    }
    return false;
  }

  function sourceState(key) {
    if (!movie) return '';
    var list = probeCache(movie.id).list || {};
    return list[key] ? list[key].s : '';
  }

  function sourceRank(item) {
    var key = item.source || item.title;
    var state = sourceState(key);
    if (state === 'ok') return 0;
    if (state === 'empty') return 3;
    if (item.ghost) return 3;
    if (lifeKnown()) return 0;
    if (knownQuality(key)) return 1;
    return 2;
  }

  function nextSource() {
    var list = groups.sort || [];
    var pool = [];

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var key = item.source || item.title;
      if (!key || item.selected) continue;
      if (hop.tried[key]) continue;
      var rank = sourceRank(item);
      if (rank >= 3) continue;
      pool.push({
        item: item,
        rank: rank,
        quality: QUALITY_RANK[knownQuality(key) || splitSourceName(item.title).badge] || 0,
        seat: i
      });
    }

    pool.sort(function (a, b) {
      return (a.rank - b.rank) || (b.quality - a.quality) || (a.seat - b.seat);
    });

    return pool.length ? pool[0].item : null;
  }

  function hopReset() {
    var id = movie ? movie.id : 0;
    if (hop.id !== id) hop = { id: id, tried: {} };
  }

  function hopStop() {
    clearInterval(hop_timer);
    hop_timer = null;
  }

  function hostTimerStop(native) {
    try {
      native.node.find('.online-empty__button.cancel').trigger('hover:enter');
    } catch (e) {}
    try {
      if (Lampa.Timer && typeof Lampa.Timer.remove === 'function') {
        native.node.find('.timeout').text('');
      }
    } catch (e) {}
  }

  function probeOn() {
    return get('nova_skin_probe', false) === true;
  }

  function probeUrlFor(key) {
    if (!probe_url || !key) return '';
    return probe_url.replace(/(\/lite\/)[^\/?&]+/, '$1' + encodeURIComponent(key));
  }

  function probeStop() {
    probe_busy = false;
    probe_queue = {};
    clearTimeout(probe_timer);
    probe_timer = null;
    probe_nets.forEach(function (net) {
      try { net.clear(); } catch (e) {}
    });
    probe_nets = [];
    if (ui.rows) ui.rows.find('.nova-chip--checking').removeClass('nova-chip--checking');
  }

  function probeChip(key) {
    if (!ui.rows) return null;
    var found = ui.rows.find('[data-nova-src="' + key + '"]');
    return found.length ? found : null;
  }

  function probeMark(key, state) {
    delete probe_queue[key];
    var chip = probeChip(key);
    if (!chip) return;

    chip.removeClass('nova-chip--checking nova-chip--empty');
    chip.find('.nova-chip__dot').remove();

    var value = knownQuality(key);
    if (value) {
      var badge = chip.find('.nova-chip__badge');
      if (badge.length) badge.text(value);
      else chip.prepend($('<span class="nova-chip__badge"></span>').text(value));
    }

    if (state === 'empty') chip.addClass('nova-chip--empty');
    else if (state === 'ok') chip.append('<span class="nova-chip__dot"></span>');
  }

  function probeAnswer(key, answer) {
    if (!probe_busy) return;
    var body = typeof answer === 'string' ? answer : '';

    if (!body) return probeMark(key, 'skip');
    if (body.indexOf('"rch"') !== -1) return probeMark(key, 'skip');
    if (body.indexOf('"accsdb"') !== -1 || body.indexOf('"blocked"') !== -1) {
      return probeMark(key, 'skip');
    }

    var found = (body.match(/videos__item/g) || []).length ||
      (body.match(/"method"\s*:\s*"(play|call|link)"/g) || []).length;

    if (found) {
      var best = '';
      var marks = body.match(/(2160|1440|1080|720|576|480|360)\s*p/gi) || [];
      marks.forEach(function (mark) {
        var label = shortQuality(mark);
        if ((QUALITY_RANK[label] || 0) > (QUALITY_RANK[best] || 0)) best = label;
      });
      if (/4k|uhd/i.test(body)) best = '4K';
      if (best) rememberQuality(key, best);
      if (movie) probeSave(movie.id, key, 'ok', found);
      return probeMark(key, 'ok');
    }

    if (!/videos__|"method"|online-prestige|"data"/i.test(body)) return probeMark(key, 'skip');
    if (movie) probeSave(movie.id, key, 'empty', 0);
    probeMark(key, 'empty');
  }

  function probeRun() {
    if (!probeOn() || !probe_url || !movie) return;
    if (lifeKnown()) return;
    var list = groups.sort || [];
    if (list.length < 2) return;

    probeStop();
    probe_busy = true;
    probe_queue = {};

    var known = probeCache(movie.id).list || {};
    var here = currentSourceKey();
    var queue = [];

    list.forEach(function (item) {
      var key = item.source || item.title;
      if (!key || key === here) return;
      if (known[key]) return probeMark(key, known[key].s);
      if (!probeUrlFor(key)) return;
      queue.push({ item: item, key: key, rank: sourceRank(item) });
    });

    queue.sort(function (a, b) {
      return a.rank - b.rank;
    });
    queue = queue.slice(0, PROBE_LIMIT);
    if (!queue.length) {
      probe_busy = false;
      return;
    }

    queue.forEach(function (entry) {
      probe_queue[entry.key] = true;
      var chip = probeChip(entry.key);
      if (chip) chip.addClass('nova-chip--checking');
    });

    var deadline = Date.now() + PROBE_BUDGET;
    var index = 0;

    var step = function () {
      if (!probe_busy || index >= queue.length) return;
      if (Date.now() > deadline) return probeStop();

      var entry = queue[index++];
      var net = null;
      try { net = new Lampa.Reguest(); } catch (e) { net = null; }
      if (!net) return probeStop();

      probe_nets.push(net);
      try { net.timeout(PROBE_TIMEOUT); } catch (e) {}

      var done = function (answer) {
        probeAnswer(entry.key, answer);
        step();
      };

      try {
        net['native'](probeUrlFor(entry.key), done, function () {
          probeAnswer(entry.key, '');
          step();
        }, false, { dataType: 'text' });
      } catch (e) {
        probeAnswer(entry.key, '');
        step();
      }
    };

    for (var worker = 0; worker < PROBE_PARALLEL; worker++) step();
  }

  function probeSchedule() {
    if (!probeOn() || !movie) return;
    if (probe_done_for === movie.id) return;
    clearTimeout(probe_timer);
    probe_timer = setTimeout(function () {
      probe_timer = null;
      if (!inSkin() || !movie) return;
      probe_done_for = movie.id;
      probeRun();
    }, PROBE_DELAY);
  }

  function keepAlive(run) {
    var keep = null;
    try {
      if (ui.root && ui.root[0] && ui.root.parent().length) keep = ui.root;
    } catch (e) {
      keep = null;
    }

    try {
      if (keep) keep.detach();
    } catch (e) {}

    try {
      run();
    } catch (e) {}

    try {
      if (keep && host && document.body.contains(host) && !$.contains(host, keep[0])) {
        $(host).prepend(keep);
      }
    } catch (e) {}
  }

  function reloadInPlace(comp) {
    var keep = null;
    try {
      if (ui.root && ui.root[0] && ui.root.parent().length) keep = ui.root;
    } catch (e) {
      keep = null;
    }

    try {
      if (keep) keep.detach();
      if (typeof comp.reset === 'function') comp.reset();
    } catch (e) {}

    try {
      if (keep && host && document.body.contains(host)) $(host).prepend(keep);
    } catch (e) {}

    var chain = null;
    try {
      chain = comp.createSource();
    } catch (e) {
      chain = null;
    }
    if (!chain || typeof chain.then !== 'function') return false;

    chain.then(function () {
      try {
        if (typeof comp.search === 'function') comp.search();
        else comp.find();
      } catch (e) {}
    })['catch'](function (error) {
      try {
        if (typeof comp.noConnectToServer === 'function') comp.noConnectToServer(error);
        else if (typeof comp.empty === 'function') comp.empty();
      } catch (e) {}
    });

    return true;
  }

  function hookReplace() {
    if (!Lampa.Activity || Lampa.Activity.nova_wrapped) return;
    var real = Lampa.Activity.replace;
    if (typeof real !== 'function') return;

    real_replace = real;

    Lampa.Activity.replace = function (params) {
      if (swallow) return;
      var empty_call = !params || !Object.keys(params).length;
      if (inplace && empty_call) {
        inplaceStop();
        var comp = componentNow();
        if (reloadable(comp) && reloadInPlace(comp)) return;
      }
      return real.apply(Lampa.Activity, arguments);
    };

    Lampa.Activity.nova_wrapped = true;
  }

  function patchHost(comp) {
    if (!comp || comp.nova_host_hooked) return;
    if (typeof comp.changeBalanser !== 'function') return;

    comp.nova_host_hooked = true;

    if (typeof comp.request === 'function') {
      var request = comp.request;
      comp.request = function (url) {
        try { learnUrl(url); } catch (e) {}
        return request.apply(comp, arguments);
      };
    }

    var real = comp.changeBalanser;

    comp.changeBalanser = function () {
      if (!inplace || !reloadable(comp)) return real.apply(comp, arguments);

      inplaceStop();
      swallow = true;
      try {
        real.apply(comp, arguments);
      } catch (e) {}
      swallow = false;

      if (reloadInPlace(comp)) return;
      if (typeof real_replace === 'function') real_replace.call(Lampa.Activity, {});
    };
  }

  function inplaceStart() {
    inplace = true;
    clearTimeout(inplace_timer);
    inplace_timer = setTimeout(inplaceStop, 2000);
  }

  function inplaceStop() {
    inplace = false;
    clearTimeout(inplace_timer);
    inplace_timer = null;
  }

  function hideHost() {
    if (!host || !ui.root) return;
    $(host).children().each(function () {
      if (this === ui.root[0]) return;
      $(this).addClass('nova-hidden');
    });
  }

  function reattach() {
    if (!pendingLive() || !ui.root) return false;

    var found = scope();
    if (!found) return false;
    if (found.movie && pending.id !== found.movie.id) return false;
    if (host === found.body[0] && $.contains(host, ui.root[0])) return false;

    root = found.root;
    host = found.body[0];
    movie = found.movie;
    patchHost(componentNow());
    root.addClass('nova-skin-scope nova-skin-chips');

    signature = '';
    uiFrame();
    hideHost();
    loadingStop();
    if (!ui.list.find('.nova-skeleton').length) ui.list.empty().append(skeleton(4));
    refreshCollection();

    var keep = seek(ui_lock) || seek(ui_focus);
    if (keep) focusNode(keep);
    if (lockActive()) lockWatch();
    attach();
    return true;
  }

  function pendingLive() {
    if (!pending) return false;
    if (Date.now() - pending.time > 30000) {
      switchDone();
      return false;
    }
    return true;
  }

  function pendingMine() {
    return pendingLive() && movie && pending.id === movie.id && !!ui.hero;
  }

  function switchDone() {
    pending = null;
    switchMark(false);
    switchUnwatch();
    inplaceStop();
  }

  function skeleton(count) {
    var box = $('<div class="nova-skeleton"></div>');
    for (var i = 0; i < (count || 4); i++) {
      box.append('<div class="nova-skeleton__row"><div class="nova-skeleton__thumb"></div>' +
        '<div class="nova-skeleton__body"><div class="nova-skeleton__line"></div>' +
        '<div class="nova-skeleton__line nova-skeleton__line--short"></div></div></div>');
    }
    return box;
  }

  function episodeRuntime() {
    var mins = 0;
    try {
      var list = (movie && movie.episode_run_time) || [];
      mins = parseInt(list.length ? list[0] : 0, 10) || parseInt((movie && movie.runtime) || 0, 10) || 0;
    } catch (e) {
      mins = 0;
    }
    return mins;
  }

  function fallbackTime() {
    var mins = episodeRuntime();
    return mins ? runtimeText(mins * 60) : '';
  }

  function fallbackQuality(origin) {
    var found = '';
    try {
      found = shortQuality(origin.find('.online-prestige__info').text() + ' ' +
        origin.find('.online-prestige__title').text());
    } catch (e) {
      found = '';
    }
    if (found) return found;
    return knownQuality(currentSourceKey()) || splitSourceName(sourceTitle()).badge || '';
  }

  function soonCard(origin) {
    var found = (origin.attr('style') || '').match(/opacity\s*:\s*([\d.]+)/);
    if (!found) return false;
    return (parseFloat(found[1]) || 1) < 0.9;
  }

  function readCard(node, index) {
    var origin = $(node);
    var line = origin.find('.time-line').first();
    var hash = line.attr('data-hash') || '';
    var percent = 0;

    if (hash) {
      try { percent = Lampa.Timeline.view(hash).percent || 0; } catch (e) { percent = 0; }
    }
    if (!percent) {
      var raw = (line.children('div').first().attr('style') || '').match(/([\d.]+)%/);
      if (raw) percent = parseFloat(raw[1]) || 0;
    }

    var meta = [];
    origin.find('.online-prestige__info').children().each(function () {
      var part = $(this);
      if (part.hasClass('online-prestige-split')) return;
      var value = part.text().trim();
      if (value) meta.push(value);
    });
    if (!meta.length) {
      var plain = origin.find('.online-prestige__info').text().trim();
      if (plain) meta.push(plain);
    }

    var soon = soonCard(origin);

    return {
      origin: origin,
      index: index,
      folder: origin.hasClass('online-prestige--folder'),
      soon: soon,
      percent: percent,
      hash: hash,
      line: line,
      viewed: origin.find('.online-prestige__viewed').length > 0,
      num: digits(origin.find('.online-prestige__episode-number').text()) || index + 1,
      numbered: origin.find('.online-prestige__episode-number').length > 0,
      title: origin.find('.online-prestige__title').text().trim(),
      meta: meta,
      time: soon
        ? origin.find('.online-prestige__quality').text().trim()
        : (origin.find('.online-prestige__time').text().trim() ||
          (origin.hasClass('online-prestige--folder') ? '' : fallbackTime())),
      quality: soon ? '' : (origin.find('.online-prestige__quality').text().trim() ||
        (origin.hasClass('online-prestige--folder') ? '' : fallbackQuality(origin))),
      picture: origin.find('.online-prestige__img img').first()
    };
  }

  function collect() {
    var list = [];
    $(host).find('.online-prestige--full,.online-prestige--folder').each(function () {
      if ($(this).closest('.nova-skin-root').length) return;
      list.push(readCard(this, list.length));
    });
    return list;
  }

  function isSeen(item) {
    return item.viewed || item.percent >= SEEN_PERCENT;
  }

  function seasonText(season) {
    var line = text('nova_season_progress', 'nova_skin_season_progress')
      .replace('{seen}', season.seen).replace('{total}', season.total);
    if (season.seen < season.total) {
      line += ' \u00b7 ' + text('nova_season_left', 'nova_skin_season_left')
        .replace('{left}', season.total - season.seen);
    }
    if (season.planned > season.total) {
      line += ' \u00b7 ' + text('nova_season_planned', 'nova_skin_season_planned')
        .replace('{planned}', season.planned);
    }
    return line;
  }

  function seasonSeen(list) {
    var seen = 0;
    var total = 0;
    var planned = 0;
    list.forEach(function (item) {
      planned++;
      if (item.soon) return;
      total++;
      if (isSeen(item)) seen++;
    });
    return { seen: seen, total: total, planned: planned };
  }

  function pickResume(full) {
    var i;
    if (!full || !full.length) return null;

    var list = full.filter(function (item) {
      return !item.soon;
    });
    if (!list.length) return null;

    if (!serial) {
      for (i = 0; i < list.length; i++) {
        if (list[i].percent > 0 && list[i].percent < SEEN_PERCENT) return list[i];
      }
      return list[0];
    }

    var reached = 0;
    for (i = 0; i < list.length; i++) {
      if (isSeen(list[i])) reached = Math.max(reached, list[i].num);
    }
    for (i = 0; i < list.length; i++) {
      if (list[i].percent > 0 && list[i].percent < SEEN_PERCENT) return list[i];
    }
    if (reached) {
      for (i = 0; i < list.length; i++) {
        if (list[i].num > reached && !isSeen(list[i])) return list[i];
      }
      return list[list.length - 1];
    }
    for (i = 0; i < list.length; i++) {
      if (!isSeen(list[i])) return list[i];
    }
    return list[0];
  }

  function freshItem() {
    for (var i = 0; i < items.length; i++) {
      if (!items[i].soon && !isSeen(items[i])) return items[i];
    }
    return null;
  }

  function nextItem(target) {
    if (!target) return null;
    var next = items[target.index + 1] || null;
    if (next && next.soon) return null;
    return next;
  }

  function play(item) {
    if (!item) return;
    try { item.origin.trigger('hover:enter'); } catch (e) {}
  }

  function longPress(item) {
    if (!item) return;
    try { item.origin.trigger('hover:long'); } catch (e) {}
  }

  function buildCard(item, compact, grid) {
    var card = $('<div class="nova-card selector">' +
      '<div class="nova-card__thumb"><img alt=""><div class="nova-card__num"></div><div class="nova-card__line"></div></div>' +
      '<div class="nova-card__body"><div class="nova-card__title"></div><div class="nova-card__meta"></div></div>' +
      '<div class="nova-card__side"><div class="nova-card__quality"></div><div class="nova-card__time"></div></div>' +
      '</div>');

    card.attr('data-nova-focus', 'item:' + item.index);
    if (!serial) card.addClass('nova-card--file');

    var thumb = card.find('.nova-card__thumb');
    var body = card.find('.nova-card__body');

    card.find('.nova-card__title').text(item.title || movie.title || movie.name || '');

    var meta = item.meta.slice();
    if (item.percent > 0 && item.percent < SEEN_PERCENT && item.time) {
      var left = Math.round((100 - item.percent) / 100 * digitsTime(item.time));
      if (left > 0) meta.push(text('nova_left', 'nova_skin_left') + ' ' + runtimeText(left));
    }
    card.find('.nova-card__meta').html(meta.map(function (part) {
      return '<span>' + esc(part) + '</span>';
    }).join('<span class="nova-dot">\u25cf</span>'));

    if (item.numbered && serial) card.find('.nova-card__num').text(episodeNumber(item.num));
    else card.find('.nova-card__num').remove();

    var badge = shortQuality(item.quality);
    if (badge) card.find('.nova-card__quality').addClass('nova-badge').text(badge);
    else card.find('.nova-card__quality').remove();
    card.find('.nova-card__time').text(item.time || '');

    var line = card.find('.nova-card__line');
    if (item.line.length) {
      line.append(item.line.clone());
      if (!grid) line.addClass('nova-card__line--body').appendTo(body);
    } else line.remove();

    if (item.folder) {
      card.addClass('nova-card--nav nova-card--slim');
      thumb.remove();
      card.find('.nova-card__side').remove();
      card.find('.nova-card__line').remove();
      body.append('<div class="nova-card__go">' + ICON.chevron + '</div>');
    } else {
      var art = item.picture.length ? (item.picture.attr('src') || '') : '';
      var isFallback = false;
      if (!art) {
        art = fallbackArt();
        isFallback = !!art;
      }
      var img = thumb.find('img')[0];
      if (art && img) {
        if (isFallback) thumb.addClass('nova-card__thumb--fallback');
        img.onload = function () { thumb.addClass('nova-card__thumb--loaded'); };
        img.onerror = function () { thumb.removeClass('nova-card__thumb--fallback'); };
        img.src = art;
        if (img.complete) thumb.addClass('nova-card__thumb--loaded');
      }
      if (item.viewed) {
        if (grid) thumb.append('<div class="nova-card__viewed">' + ICON.eye + '</div>');
        else card.find('.nova-card__side').append('<div class="nova-card__eye">' + ICON.eye + '</div>');
      }
    }

    if (item.soon) {
      card.addClass('nova-card--soon').removeClass('selector');
      card.find('.nova-card__line').remove();
    } else {
      bind(card, function () { play(item); }, item.folder ? null : function () { longPress(item); });
    }

    item.card = card;
    return card;
  }

  function digitsTime(value) {
    var parts = String(value || '').split(':');
    if (parts.length === 3) {
      return (parseInt(parts[0], 10) || 0) * 3600 + (parseInt(parts[1], 10) || 0) * 60 + (parseInt(parts[2], 10) || 0);
    }
    if (parts.length === 2) {
      return (parseInt(parts[0], 10) || 0) * 3600 + (parseInt(parts[1], 10) || 0) * 60;
    }
    return (parseInt(parts[0], 10) || 0) * 60;
  }

  function bindPlay(node) {
    return bind(node, function () {
      play(pickResume(items));
    }, function () {
      playMenu();
    });
  }

  function bindNext(node) {
    return bind(node, function () {
      play(nextItem(pickResume(items)));
    });
  }

  function playButton() {
    if (!ui.play || !ui.play.length) {
      ui.play = $('<div class="nova-btn nova-btn--main selector" data-nova-focus="hero">' +
        ICON.play + '<span class="nova-btn__label"></span></div>');
      bindPlay(ui.play);
    }
    return ui.play;
  }

  function nextButton() {
    if (!ui.next || !ui.next.length) {
      ui.next = $('<div class="nova-btn nova-btn--ghost selector" data-nova-focus="hero-next">' +
        '<span class="nova-btn__label"></span></div>');
      bindNext(ui.next);
    }
    return ui.next;
  }

  function episodeSuffix(item) {
    if (!item || !serial || !item.numbered) return '';
    return ' \u00b7 ' + text('torrent_serial_episode', 'nova_skin_episode') + ' ' + item.num;
  }

  function playMenu() {
    var target = pickResume(items);
    if (!target) return;

    var active;
    try { active = Lampa.Controller.enabled().name; } catch (e) { active = 'content'; }

    var started = target.percent > 0 && target.percent < SEEN_PERCENT;
    var menu = [{
      title: (started ? text('nova_continue', 'nova_skin_continue') : text('nova_watch', 'nova_skin_watch')) + episodeSuffix(target),
      item: target
    }];

    if (started) {
      menu.push({
        title: text('nova_from_start', 'nova_skin_from_start') + episodeSuffix(target),
        item: target
      });
    }

    var next = nextItem(target);
    if (next) {
      menu.push({
        title: text('nova_next_episode', 'nova_skin_next_episode') + episodeSuffix(next),
        item: next
      });
    }

    var fresh = freshItem();
    if (fresh && fresh !== target && fresh !== next) {
      menu.push({
        title: text('nova_first_new', 'nova_skin_first_new') + episodeSuffix(fresh),
        item: fresh
      });
    }

    if (items.length > JUMP_FROM) {
      menu.push({ title: text('nova_jump_pick', 'nova_skin_jump_pick'), jump: true });
    }

    try {
      Lampa.Select.show({
        title: text('title_action', 'nova_skin_action'),
        items: menu,
        onBack: function () {
          try { Lampa.Controller.toggle(active); } catch (e) {}
        },
        onSelect: function (a) {
          try { Lampa.Controller.toggle(active); } catch (e) {}
          if (a.jump) return uiToggle('jump');
          play(a.item);
        }
      });
    } catch (e) {}
  }

  function logoOn() {
    return get('nova_skin_logo', true) !== false;
  }

  function logoLang() {
    var lang = String(get('language', 'ru') || 'ru').toLowerCase();
    var map = { ua: 'uk', ukr: 'uk', rus: 'ru', eng: 'en', cn: 'zh', by: 'be' };
    return map[lang] || lang;
  }

  function logoPick(list) {
    if (!list || !list.length) return '';
    var lang = logoLang();
    var i;

    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].iso_639_1 === lang && list[i].file_path) return list[i].file_path;
    }
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].iso_639_1 === 'en' && list[i].file_path) return list[i].file_path;
    }
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].file_path) return list[i].file_path;
    }
    return '';
  }

  function logoUrl(path) {
    if (!path) return '';
    try {
      return Lampa.TMDB.image('t/p/w500' + String(path).replace('.svg', '.png'));
    } catch (e) {
      return '';
    }
  }

  function logoLoad(done) {
    if (!logoOn() || !movie || !movie.id) return done('');

    var lang = logoLang();
    var cache_key = movie.id + ':' + lang;
    var all = cached('nova_skin_logo_cache', 500, {});
    var mine = all[cache_key];
    if (typeof mine === 'string') return done(mine);

    var kind = movie.name || movie.number_of_seasons ? 'tv' : 'movie';
    var url = '';
    var langs = lang === 'en' ? 'en,null' : lang + ',en,null';

    try {
      url = Lampa.TMDB.api(kind + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() +
        '&include_image_language=' + langs);
    } catch (e) {
      url = '';
    }
    if (!url) return done('');

    var net = null;
    try { net = new Lampa.Reguest(); } catch (e) { net = null; }
    if (!net) return done('');

    var keep = function (path) {
      var box = cached('nova_skin_logo_cache', 500, {});
      if (movie && movie.id && box && typeof box === 'object') {
        box[cache_key] = path || '';
        save('nova_skin_logo_cache', box);
      }
      done(path || '');
    };

    try { net.timeout(8000); } catch (e) {}
    net.silent(url, function (answer) {
      keep(logoPick(answer && answer.logos));
    }, function () {
      done('');
    });
  }

  function tmdbId() {
    if (!movie) return 0;
    var source = movie.source || 'tmdb';
    var id = (source === 'cub' || source === 'tmdb') ? movie.id : movie.tmdb_id;
    return typeof id === 'number' ? id : 0;
  }

  function seasonPlanned(season, done) {
    var id = tmdbId();
    if (!id || !season) return done(0);

    var key = id + ':' + season;
    var box = cached('nova_skin_season_cache', 300, {});
    if (typeof box[key] === 'number') return done(box[key]);

    var api = null;
    try { api = Lampa.Api.sources.tmdb; } catch (e) { api = null; }
    if (!api || typeof api.get !== 'function') return done(0);

    var keep = function (count) {
      var now = cached('nova_skin_season_cache', 300, {});
      if (now && typeof now === 'object') {
        now[key] = count || 0;
        save('nova_skin_season_cache', now);
      }
      done(count || 0);
    };

    try {
      api.get('tv/' + id + '/season/' + season, {}, function (data) {
        keep((data && data.episodes && data.episodes.length) || 0);
      }, function () {
        done(0);
      });
    } catch (e) {
      done(0);
    }
  }

  function heroLogo() {
    if (!ui.hero) return;
    var slot = ui.hero.find('.nova-hero__title');
    if (!slot.length) return;

    var name = movie.title || movie.name || '';
    if (!logoOn()) return slot.removeClass('nova-hero__title--logo').text(name);

    var want = movie.id;
    logoLoad(function (path) {
      if (!ui.hero || !movie || movie.id !== want) return;
      var box = ui.hero.find('.nova-hero__title');
      if (!box.length) return;

      var src = logoUrl(path);
      if (!src) return box.removeClass('nova-hero__title--logo').text(name);

      var picture = $('<img alt="">');
      picture.on('error', function () {
        box.removeClass('nova-hero__title--logo').text(name);
      });
      picture.attr('src', src);
      box.addClass('nova-hero__title--logo').empty().append(picture);
    });
  }

  function heroStatic(withArt) {
    if (!ui.hero) return;

    if (withArt) {
      var meta = ui.hero.find('.nova-hero__meta').empty();
      var badge = knownQuality(currentSourceKey()) || splitSourceName(sourceTitle()).badge;
      if (badge) meta.append('<div class="nova-badge">' + esc(badge) + '</div>');
      if (movie.vote_average) {
        meta.append('<div>\u2605 ' + parseFloat(movie.vote_average + '').toFixed(1) + '</div>');
      }
      var year = ((movie.release_date || movie.first_air_date || '') + '').slice(0, 4);
      if (year) meta.append('<div>' + esc(year) + '</div>');
      var mins = episodeRuntime();
      if (mins) meta.append('<div>' + esc(runtimeText(mins * 60)) + '</div>');
    }

    var hint = [];
    var source = splitSourceName(sourceTitle()).name;
    if (source) hint.push(source);
    var voice = groups.voice ? groups.voice.subtitle : '';
    if (voice) hint.push(voice);
    ui.hero.find('.nova-hero__hint').text(hint.join(' \u00b7 '));

    ui.hero.find('.nova-hero__progress').empty().hide();
    ui.hero.find('.nova-hero__season').hide();
  }

  function buildHero() {
    if (!heroEnabled()) {
      ui.hero_box.empty();
      ui.hero = null;
      ui.hero_kind = '';
      return null;
    }

    var target = nav ? null : pickResume(items);
    var button = playButton();
    var kind = target ? 'full' : 'static';
    var withArt = artEnabled();

    if (ui.hero && ui.hero_kind !== kind) {
      button.detach();
      nextButton().detach();
      ui.hero_box.empty();
      ui.hero = null;
    }

    if (!ui.hero) {
      ui.hero_kind = kind;
      ui.hero = $('<div class="nova-hero">' +
        '<div class="nova-hero__bg"><img alt=""></div><div class="nova-hero__shade"></div>' +
        '<div class="nova-hero__body">' +
        (withArt ? '<div class="nova-hero__title"></div><div class="nova-hero__meta"></div><div class="nova-hero__descr"></div>' : '') +
        '<div class="nova-hero__actions"><div class="nova-hero__hint"></div></div>' +
        '<div class="nova-hero__season" style="display:none"></div>' +
        '</div>' +
        '<div class="nova-hero__progress" style="display:none"></div>' +
        '</div>');

      if (!withArt) ui.hero.addClass('nova-hero--compact');

      if (withArt) {
        ui.hero.find('.nova-hero__title').text(movie.title || movie.name || '');
        ui.hero.find('.nova-hero__descr').text(movie.overview || '');
        heroLogo();
      }

      var art = heroArt();
      if (art) {
        var back = ui.hero.find('.nova-hero__bg');
        var node = ui.hero.find('.nova-hero__bg img')[0];
        node.onload = function () { back.addClass('nova-hero__bg--loaded'); };
        node.onerror = function () {};
        node.src = art;
      }

      ui.hero_box.empty().append(ui.hero);
    }

    if (!target) {
      button.detach();
      nextButton().detach();
      heroStatic(withArt);
      return null;
    }

    ui.hero.find('.nova-hero__actions').prepend(button);

    var started = target.percent > 0 && target.percent < SEEN_PERCENT;
    var next = serial ? nextItem(target) : null;
    var next_button = nextButton();
    if (next && started) {
      next_button.find('.nova-btn__label')
        .text(text('nova_next_episode', 'nova_skin_next_episode') + episodeSuffix(next));
      button.after(next_button);
    } else next_button.detach();

    if (withArt) {
      var meta = ui.hero.find('.nova-hero__meta').empty();
      var badge = shortQuality(target.quality) || splitSourceName(sourceTitle()).badge;
      if (badge) meta.append('<div class="nova-badge">' + esc(badge) + '</div>');
      if (movie.vote_average) {
        meta.append('<div>\u2605 ' + parseFloat(movie.vote_average + '').toFixed(1) + '</div>');
      }
      var year = ((movie.release_date || movie.first_air_date || '') + '').slice(0, 4);
      if (year) meta.append('<div>' + esc(year) + '</div>');
      if (target.time) meta.append('<div>' + esc(target.time) + '</div>');
    }

    var label = started ? text('nova_continue', 'nova_skin_continue') : text('nova_watch', 'nova_skin_watch');
    if (serial && target.numbered) {
      label += ' \u00b7 S' + (seasonNumber() || 1) + ' E' + target.num;
    }
    button.find('.nova-btn__label').text(label);

    var hint = [];
    var source = splitSourceName(sourceTitle()).name;
    if (source) hint.push(source);
    var voice = groups.voice ? groups.voice.subtitle : '';
    if (voice) hint.push(voice);
    ui.hero.find('.nova-hero__hint').text(hint.join(' \u00b7 '));

    var season = serial && !nav && items.length > 1 ? seasonSeen(items) : null;

    var season_line = ui.hero.find('.nova-hero__season');
    if (season) {
      season_line.text(seasonText(season)).show();

      if (season.planned <= season.total) {
        var want_season = seasonNumber() || 1;
        var want_id = tmdbId();
        seasonPlanned(want_season, function (planned) {
          if (!planned || planned <= season.total) return;
          if (!ui.hero || tmdbId() !== want_id || (seasonNumber() || 1) !== want_season) return;
          var box = ui.hero.find('.nova-hero__season');
          if (!box.length) return;
          season.planned = planned;
          box.text(seasonText(season)).show();
        });
      }
    } else season_line.hide();

    var progress = ui.hero.find('.nova-hero__progress').empty();
    var percent = season
      ? Math.round(season.seen / season.total * 100)
      : Math.min(100, target.percent);
    if (percent > 0) {
      progress.show().append('<div class="time-line"><div style="width:' + percent + '%"></div></div>');
    } else progress.hide();

    return button;
  }

  function uiToggle(key) {
    var opening = ui_open !== key;
    lockRelease();
    ui_open = opening ? key : '';
    ui_focus = key;

    if (opening) {
      if (key === 'source') {
        var selected = 0;
        (groups.sort || []).forEach(function (item, index) {
          if (item.selected) selected = index;
        });
        ui_focus = 'src:' + selected;
      } else if (key === 'season') ui_focus = 'season:' + selectedIndex(groups.season);
      else if (key === 'voice') ui_focus = 'voice:' + selectedIndex(groups.voice);
    }

    buildRows();

    if (opening && key === 'source') probeRun();
    else probeStop();

    lockFocus(ui_focus);

    restoreFocus(false);
    try { Lampa.Controller.enable('content'); } catch (e) {}
  }

  function selectedIndex(group) {
    if (!group || !group.items) return 0;
    for (var i = 0; i < group.items.length; i++) {
      if (group.items[i].selected) return typeof group.items[i].index === 'number' ? group.items[i].index : i;
    }
    return 0;
  }

  function chip(key, value, extra) {
    var box = $('<div class="nova-chip selector"></div>');
    box.attr('data-nova-focus', key);
    if (extra && extra.icon) box.append(extra.icon);
    if (extra && extra.badge) box.append($('<span class="nova-chip__badge"></span>').text(extra.badge));
    box.append($('<span class="nova-chip__label"></span>').text(value || ''));
    if (!(extra && extra.plain)) box.append(ICON.chevron);
    if (extra && extra.active) box.addClass('nova-chip--active');
    if (extra && extra.empty) box.addClass('nova-chip--empty');
    if (extra && extra.dot) box.append('<span class="nova-chip__dot"></span>');
    return box;
  }

  function markSourceBusy(item) {
    if (!ui.rows) return;
    try {
      var box = ui.rows.find('[data-nova-focus="source"]').first();
      if (!box.length) return;
      var parts = splitSourceName(item.title || '');
      box.addClass('nova-chip--busy');
      box.find('.nova-chip__label').text(parts.name || item.title || '');
      var badge = box.find('.nova-chip__badge');
      var value = knownQuality(item.source || item.title) || parts.badge;
      if (value) {
        if (badge.length) badge.text(value);
        else box.prepend($('<span class="nova-chip__badge"></span>').text(value));
      } else badge.remove();
    } catch (e) {}
  }

  function chooseSource(item) {
    if (!filter || typeof filter.onSelect !== 'function') return;
    var host_filter = filter;
    ui_open = '';
    note_sig = '';
    buildRows();
    markSourceBusy(item);
    if (ui.list) ui.list.empty().append(skeleton(4));
    refreshCollection();
    focusChip('source');
    switchStart('source');
    inplaceStart();
    hopReset();
    probeStop();
    hop.tried[item.source || item.title] = true;
    keepAlive(function () {
      host_filter.onSelect('sort', item);
    });
  }

  function chooseOption(group, index) {
    if (!filter || typeof filter.onSelect !== 'function') return;
    var host_filter = filter;
    ui_open = '';
    buildRows();
    if (ui.list) ui.list.empty().append(skeleton(4));
    refreshCollection();
    focusChip(group.stype);
    switchStart(group.stype);
    keepAlive(function () {
      host_filter.onSelect('filter', { stype: group.stype }, { index: index });
    });
  }

  function openExtra(index) {
    var entry = extras[index];
    if (!entry) return;

    var key = 'extra:' + index;
    if (ui_open === key) return uiToggle(key);

    ui_open = '';
    extra_menu = null;
    captured = null;
    switchStart(key);

    capturing = true;
    try { entry.node.trigger('hover:enter'); } catch (e) {}
    capturing = false;

    if (!captured) return;

    switchDone();
    lockRelease();

    extra_menu = { key: key, params: captured };
    captured = null;
    ui_open = key;

    var at = 0;
    (extra_menu.params.items || []).forEach(function (item, order) {
      if (item && item.selected) at = order;
    });
    ui_focus = key + ':' + at;

    buildRows();
    lockFocus(ui_focus);
    restoreFocus(false);
    try { Lampa.Controller.enable('content'); } catch (e) {}
  }

  function extraRow() {
    var params = extra_menu.params || {};
    var key = extra_menu.key;
    var row = $('<div class="nova-drop"></div>');

    (params.items || []).forEach(function (item, index) {
      var box = chip(key + ':' + index, item.title || item.name || '', {
        active: !!item.selected,
        plain: true
      });
      bind(box, function () {
        if (item.selected) return uiToggle(key);
        ui_open = '';
        buildRows();
        if (ui.list) ui.list.empty().append(skeleton(4));
        refreshCollection();
        focusChip(key);
        switchStart(key);
        inplaceStart();
        keepAlive(function () {
          if (typeof params.onSelect === 'function') params.onSelect(item);
        });
      });
      row.append(box);
    });

    ui.rows.append(row);
  }

  function focusChip(key) {
    var chip = ui.rows ? ui.rows.find('.nova-toolbar [data-nova-focus="' + key + '"]').first() : null;
    if (!chip || !chip.length) chip = seek(key);
    if (chip && chip.length) return focusNode(chip);
    return false;
  }

  function sourceActive(item, key, state, graded) {
    if (state === 'empty') return false;
    if (item.selected || state === 'ok') return true;
    if (knownQuality(key)) return true;
    if (item.ghost) return false;
    if (!graded) return true;
    return !!splitSourceName(item.title).badge;
  }

  function sourceRow() {
    var sort = groups.sort || [];
    var probe = probeCache(movie.id).list || {};
    var life = lifeKnown();

    var graded = false;
    sort.forEach(function (item) {
      if (splitSourceName(item.title).badge) graded = true;
    });

    var visible = [];
    var hidden = [];
    sort.forEach(function (item) {
      var key = item.source || item.title;
      var state = probe[key] ? probe[key].s : (life && !item.ghost ? 'ok' : '');
      if (sourceActive(item, key, state, graded)) visible.push(item);
      else hidden.push(item);
    });
    if (ui_all_sources) visible = visible.concat(hidden);

    var row = $('<div class="nova-drop"></div>');

    visible.forEach(function (item, order) {
      var key = item.source || item.title;
      var parts = splitSourceName(item.title);
      var state = probe[key] ? probe[key].s : (life ? (item.ghost ? 'empty' : 'ok') : '');
      var box = chip('src:' + sort.indexOf(item), parts.name, {
        badge: knownQuality(key) || parts.badge,
        active: !!item.selected,
        empty: state === 'empty',
        dot: probeOn() && state === 'ok',
        plain: true
      });
      box.attr('data-nova-src', key);
      if (probe_busy && probe_queue[key] && !state && !item.selected) box.addClass('nova-chip--checking');
      bind(box, function () {
        if (item.selected) return uiToggle('source');
        chooseSource(item);
      });
      row.append(box);
    });

    if (!ui_all_sources && hidden.length) {
      var more = chip('src:more', text('nova_more_sources', 'nova_skin_more_sources')
        .replace('{count}', hidden.length), { plain: true });
      more.addClass('nova-chip--more');
      bind(more, function () {
        ui_all_sources = true;
        ui_focus = 'src:' + (hidden.length ? (groups.sort || []).indexOf(hidden[0]) : 0);
        buildRows();
        restoreFocus(false);
        try { Lampa.Controller.enable('content'); } catch (e) {}
        probeRun();
      });
      row.append(more);
    }

    ui.rows.append(row);
  }

  function optionRow(group) {
    var order = group.items.map(function (item, index) {
      return { item: item, index: typeof item.index === 'number' ? item.index : index, seat: index };
    });

    if (group.stype === 'voice') {
      order.sort(function (a, b) {
        return (voiceRank(a.item.title) - voiceRank(b.item.title)) || (a.seat - b.seat);
      });
    }

    var row = $('<div class="nova-drop"></div>');
    order.forEach(function (entry) {
      var box = chip(group.stype + ':' + entry.index, entry.item.title, {
        active: !!entry.item.selected,
        plain: true
      });
      bind(box, function () {
        if (entry.item.selected) return uiToggle(group.stype);
        chooseOption(group, entry.index);
      });
      row.append(box);
    });
    ui.rows.append(row);
  }

  var FIT_STEPS = ['nova-toolbar--tight', 'nova-toolbar--tighter', 'nova-toolbar--clip'];

  function isMobilePortrait() {
    try {
      return window.innerWidth < 600 && window.innerHeight > window.innerWidth;
    } catch (e) {
      return false;
    }
  }

  function fitToolbar(toolbar) {
    toolbar.removeClass(FIT_STEPS.join(' '));

    var node = toolbar[0];
    if (!node) return;

    var mobilePortrait = isMobilePortrait();
    var room = node.clientWidth || 0;

    if (mobilePortrait && extras.length) {
      toolbar.addClass(FIT_STEPS[0]);
      for (var j = 1; j < FIT_STEPS.length; j++) {
        if (node.scrollWidth <= node.clientWidth + 1) return;
        toolbar.addClass(FIT_STEPS[j]);
      }
      return;
    }

    if (!room) {
      if (extras.length) toolbar.addClass(FIT_STEPS[0]);
      return;
    }

    for (var i = 0; i < FIT_STEPS.length; i++) {
      if (node.scrollWidth <= node.clientWidth + 1) return;
      toolbar.addClass(FIT_STEPS[i]);
    }
  }

  function pageTitle(page) {
    var first = items[page.start] ? items[page.start].num : page.start + 1;
    var tail = items[page.end] ? items[page.end].num : page.end + 1;
    return first === tail ? String(first) : first + '\u2013' + tail;
  }

  function jumpRow() {
    var list = pages(items.length);
    var row = $('<div class="nova-drop"></div>');
    list.forEach(function (page) {
      var box = chip('jump:' + page.start, pageTitle(page), {
        active: page.start === ui_page,
        plain: true
      });
      bind(box, function () {
        showPage(page.start, page.start);
      });
      row.append(box);
    });
    ui.rows.append(row);
  }

  function buildRows() {
    var rows = ui.rows.empty();
    var toolbar = $('<div class="nova-toolbar"></div>');
    chip_actions = {};

    var addChip = function (key, title, value, extra) {
      if (title) toolbar.append($('<div class="nova-toolbar__label"></div>').text(title));
      var box = chip(key, value, extra);
      if (ui_open === key) box.addClass('nova-chip--active');
      chip_actions[key] = {
        enter: extra && extra.action ? extra.action : function () { uiToggle(key); },
        long: extra && extra.long ? extra.long : null
      };
      bind(box, chip_actions[key].enter, chip_actions[key].long);
      toolbar.append(box);
    };

    extras.forEach(function (entry, index) {
      var origin = entry.node;
      addChip('extra:' + index, entry.label, entry.value, {
        action: function () { openExtra(index); },
        long: function () {
          try { origin.trigger('hover:long'); } catch (e) {}
        }
      });
    });

    var sort = groups.sort || [];
    if (sort.length) {
      var parts = splitSourceName(sourceTitle());
      var current = null;
      sort.forEach(function (item) {
        if (item.selected) current = item;
      });
      var key = current ? (current.source || current.title) : '';
      addChip('source', text('nova_source', 'nova_skin_source'), parts.name, {
        badge: knownQuality(key) || parts.badge
      });
    }

    if (groups.season && groups.season.items.length > 1) {
      addChip('season', groups.season.title || text('torrent_serial_season', 'nova_skin_season'),
        groups.season.subtitle || '', {});
    }

    if (groups.voice && groups.voice.items.length > 1) {
      addChip('voice', groups.voice.title || text('torrent_parser_voice', 'nova_skin_voice'),
        groups.voice.subtitle || '', {});
    }

    if (!nav && items.length > JUMP_FROM) {
      var now = pageAt(pages(items.length), ui_page > 0 ? ui_page : 0);
      addChip('jump', text('nova_jump', 'nova_skin_jump'), pageTitle(now), {});
    }

    rows.append(toolbar);
    fitToolbar(toolbar);

    if (ui_open === 'source') sourceRow();
    else if (ui_open === 'season' && groups.season) optionRow(groups.season);
    else if (ui_open === 'voice' && groups.voice) optionRow(groups.voice);
    else if (ui_open === 'jump') jumpRow();
    else if (extra_menu && ui_open === extra_menu.key) extraRow();
  }

  function focusNode(target) {
    if (!target) return false;
    var node = target instanceof jQuery ? target[0] : target;
    if (!node) return false;
    last = node;
    ui_focus = node.getAttribute ? (node.getAttribute('data-nova-focus') || '') : '';
    scrollTo(node);
    focusing = true;
    try { Lampa.Controller.collectionFocus(node, host); } catch (e) {}
    focusing = false;
    return true;
  }

  function seek(key) {
    if (!key || !ui.root) return null;
    var found = ui.root.find('[data-nova-focus="' + key + '"]').first();
    return found.length ? found : null;
  }

  function restoreFocus(fallback) {
    refreshCollection();
    if (lockActive()) {
      var locked = seek(ui_lock);
      if (locked) return focusNode(locked);
      if (focusChip(ui_lock)) return true;
    }
    var wanted = seek(ui_focus);
    if (wanted) return focusNode(wanted);
    if (fallback) return focusNode(fallback);
    var chip = ui.rows.find('.nova-chip').first();
    if (chip.length) return focusNode(chip);
    return false;
  }

  function refreshCollection() {
    try { Lampa.Controller.collectionSet(host, false, true); } catch (e) {}
  }

  function inSkin() {
    return !!(ui.root && ui.root.parent().length);
  }

  function toolbarFocused() {
    if (!inSkin() || !last) return false;
    return ui.rows.find('.nova-toolbar').find(last).length > 0;
  }

  function rowsFocused() {
    if (!inSkin() || !last) return false;
    return ui.rows.find(last).length > 0;
  }

  function listFocused() {
    if (!inSkin() || !last) return false;
    return ui.list.find(last).length > 0;
  }

  function toolbarFocus() {
    if (!inSkin()) return false;
    var chip = ui.rows.find('.nova-toolbar [data-nova-focus="source"]').first();
    if (!chip.length) chip = ui.rows.find('.nova-toolbar .nova-chip').first();
    if (!chip.length) return false;
    return focusNode(chip);
  }

  function keepFocus() {
    if (!inSkin()) return false;
    refreshCollection();
    var wanted = lockActive() ? seek(ui_lock) : null;
    if (!wanted) wanted = seek(ui_focus);
    if (!wanted && last && $.contains(ui.root[0], last)) wanted = $(last);
    if (!wanted || !wanted.length) {
      if (ui.play && ui.play.length && ui.play.parent().length) wanted = ui.play;
      else {
        var resume = pickResume(items);
        if (resume && resume.card && resume.card.length) wanted = resume.card;
        else wanted = ui.list.find('.nova-card.selector').first();
      }
    }
    if (!wanted || !wanted.length) return false;
    if (!$.contains(ui.root[0], wanted[0])) return false;
    return focusNode(wanted);
  }

  function novaUp() {
    if (!inSkin()) return false;
    try {
      if (window.Navigator && window.Navigator.canmove('up')) return false;
    } catch (e) {}

    if (rowsFocused()) {
      if (ui.play && ui.play.length && ui.play.parent().length) {
        lockRelease();
        return focusNode(ui.play);
      }
      return false;
    }
    if (listFocused()) {
      lockRelease();
      return toolbarFocus();
    }
    return false;
  }

  function novaDown() {
    if (!inSkin() || ui_open) return false;
    if (!toolbarFocused() || items.length < 2) return false;
    lockRelease();
    var target = pickResume(items);
    if (target && target.card && target.card.length) return focusNode(target.card);
    return false;
  }

  function novaRight() {
    if (!inSkin()) return false;
    try {
      if (window.Navigator && window.Navigator.canmove('right')) return false;
    } catch (e) {}
    return toolbarFocus();
  }

  function nativeState() {
    var empty = $(host).find('.online-empty').not('.nova-skin-root .online-empty').first();
    if (!empty.length) return null;
    if (empty.find('.broadcast__scan').length && !empty.find('.online-empty__title').length) {
      return { kind: 'loading', node: empty };
    }
    return { kind: 'note', node: empty };
  }

  var loading_started = 0;
  var loading_timer = null;

  function loadingPanel() {
    uiFrame();
    note_sig = '';

    if (ui.hero && ui.hero.parent().length) {
      loadingStop();
      ui.list.empty().append(skeleton(4));
      refreshCollection();
      var keep = (lockActive() && seek(ui_lock)) || seek(ui_focus);
      if (keep) focusNode(keep);
      return;
    }

    ui.hero_box.empty();
    ui.hero = null;
    ui.hero_kind = '';
    ui.rows.empty();

    if (!ui.load) {
      loading_started = Date.now();
      ui.load = $('<div class="nova-loading">' +
        '<div class="nova-loading__title"></div>' +
        '<div class="nova-loading__text"></div>' +
        '<div class="nova-loading__bar"><div></div></div>' +
        '</div>');
      ui.load.find('.nova-loading__title').text(text('nova_loading_title', 'nova_skin_loading_title'));
    }

    ui.list.empty().append(ui.load).append(skeleton(3));
    loadingText();

    clearInterval(loading_timer);
    loading_timer = setInterval(loadingText, 1000);
  }

  function loadingText() {
    if (!ui.load || !ui.load.parent().length) return loadingStop();
    var seconds = Math.max(0, Math.round((Date.now() - loading_started) / 1000));
    var line = text('nova_loading_start', 'nova_skin_loading_start') +
      ' \u00b7 ' + seconds + text('nova_sec', 'nova_skin_sec');
    ui.load.find('.nova-loading__text').text(line);
    ui.load.find('.nova-loading__bar>div').css('width', Math.min(90, seconds * 7) + '%');
  }

  function loadingStop() {
    clearInterval(loading_timer);
    loading_timer = null;
    ui.load = null;
  }

  function noteStamp(native) {
    return [
      native.node.find('.online-empty__title').text().trim(),
      currentSourceKey(),
      sourceTitle(),
      (groups.sort || []).length,
      movie ? movie.id : 0
    ].join('|');
  }

  function notePanel(native) {
    var mark = noteStamp(native);
    var alive = ui.root && ui.root.parent().length && ui.list && ui.list.find('.nova-note').length;

    if (alive && note_sig === mark) {
      hostTimerStop(native);
      return ui.list.find('.nova-note').first();
    }

    note_sig = mark;

    uiFrame();
    loadingStop();
    lockRelease();
    switchDone();
    ui_open = '';
    buildHero();
    buildRows();

    var note = $('<div class="nova-note"><div class="nova-note__main">' +
      '<div class="nova-note__title"></div><div class="nova-note__text"></div>' +
      '<div class="nova-note__actions"></div></div></div>');

    var dead = currentSourceKey();
    if (dead && movie) probeSave(movie.id, dead, 'empty', 0);

    note.find('.nova-note__title').text(native.node.find('.online-empty__title').text().trim());
    note.find('.nova-note__text').text(native.node.find('.online-empty__time').text().trim());

    var actions = note.find('.nova-note__actions');

    var addAction = function (label, icon, run, keep_hop) {
      var button = $('<div class="nova-btn selector"></div>');
      button.attr('data-nova-focus', 'note:' + actions.children().length);
      if (icon) button.append(icon);
      button.append($('<span></span>').text(label));
      bind(button, function () {
        if (!keep_hop) hopStop();
        try { run(); } catch (e) {}
      });
      actions.append(button);
      return button;
    };

    hopReset();
    hopStop();
    hostTimerStop(native);
    if (dead) hop.tried[dead] = true;

    var next = (groups.sort || []).length > 1 ? nextSource() : null;
    var auto = !!next && autoSwitchOn();

    if (next) {
      addAction(text('nova_try_source', 'nova_skin_try_source')
        .replace('{name}', splitSourceName(next.title).name || next.title), ICON.play, function () {
        chooseSource(next);
      });
    }

    if ((groups.sort || []).length > 1) {
      addAction(text('nova_all_sources', 'nova_skin_all_sources'), ICON.chevron, function () {
        uiToggle('source');
      }, true);
    }

    addAction(text('nova_retry', 'nova_skin_retry'), ICON.refresh, function () {
      var comp = componentNow();
      if (reloadable(comp)) {
        signature = '';
        ui.list.empty().append(skeleton(4));
        keepAlive(function () {
          if (typeof comp.reset === 'function') comp.reset();
          if (typeof comp.find === 'function') comp.find();
        });
        return;
      }
      try { Lampa.Activity.replace(); } catch (e) {}
    });

    if (auto) {
      var tic = 6;
      var slot = note.find('.nova-note__text');
      var name = splitSourceName(next.title).name || next.title;
      var render = function () {
        slot.text(text('nova_auto_next', 'nova_skin_auto_next')
          .replace('{sec}', tic).replace('{name}', name));
      };

      render();
      hop_timer = setInterval(function () {
        if (!ui.root || !ui.root.parent().length || !slot.parent().length) return hopStop();
        if (ui_open === 'source') return;
        tic--;
        render();
        if (tic > 0) return;
        hopStop();
        chooseSource(next);
      }, 1000);
    } else if (!next && (groups.sort || []).length > 1) {
      note.find('.nova-note__text').text(text('nova_dead_all', 'nova_skin_dead_all'));
    }

    var search = root.find('.filter--search').first();
    if (search.length) {
      var clarify = $('<div class="nova-btn selector"></div>');
      clarify.attr('data-nova-focus', 'note:clarify');
      clarify.append(ICON.search).append($('<span></span>').text(text('nova_clarify', 'nova_skin_clarify')));
      bind(clarify, function () {
        try { search.trigger('hover:enter'); } catch (e) {}
      });
      actions.append(clarify);
    }

    ui.list.empty().append(note);
    refreshCollection();

    var first = actions.find('.selector').first();
    var wanted = seek(ui_focus);
    if (!wanted || !$.contains(ui.root[0], wanted[0])) wanted = null;
    if (!wanted && first.length) wanted = first;
    if (!wanted) wanted = ui.rows.find('.nova-chip').first();
    if (wanted && wanted.length) {
      ui_focus = wanted.attr('data-nova-focus') || '';
      focusNode(wanted);
    }
    return note;
  }

  function showPage(start, focus) {
    lockRelease();
    ui_open = '';
    ui_focus = '';
    ui_page = start;
    ui_page_focus = typeof focus === 'number' ? focus : start;
    redraw();
  }

  function stamp() {
    return [
      items.length,
      nav ? 'nav' : 'files',
      sourceTitle(),
      groups.season ? groups.season.subtitle : '',
      groups.voice ? groups.voice.subtitle : '',
      extrasStamp(),
      viewMode(),
      ui_open,
      ui_page,
      ui_all_sources ? 1 : 0,
      items.length ? items[0].title : '',
      items.filter(function (i) { return isSeen(i); }).length
    ].join('|');
  }

  function draw() {
    if (!enabled() || busy) return;

    var found = scope();
    if (!found) return;

    root = found.root;
    host = found.body[0];
    movie = found.movie;
    patchHost(componentNow());
    filter = activeFilter(root) || filter;
    groups = readGroups(filter);
    extras = readExtras();

    var native = nativeState();
    if (native) {
      busy = true;
      root.addClass('nova-skin-scope nova-skin-chips');
      native.node.addClass('nova-hidden');
      items = [];
      signature = '';
      if (native.kind === 'loading') {
        if (pendingLive() && ui.list && ui.list.find('.nova-skeleton').length) {
          busy = false;
          return;
        }
        loadingPanel();
      } else notePanel(native);
      busy = false;
      return;
    }

    var list = collect();
    if (!list.length) return;

    var files = list.filter(function (item) { return !item.folder; });
    nav = files.length === 0;
    serial = !!(movie.name || movie.number_of_seasons) && !nav;

    items = list;
    var mark = stamp();

    if (signature === mark && ui.list && ui.list.children().length) return;

    busy = true;
    signature = mark;
    note_sig = '';

    hopStop();
    hopReset();
    loadingStop();
    root.addClass('nova-skin-scope nova-skin-chips');
    uiFrame();

    if (!nav) {
      var current = null;
      (groups.sort || []).forEach(function (entry) {
        if (entry.selected) current = entry;
      });
      var key = current ? (current.source || current.title) : '';
      if (key) {
        probeSave(movie.id, key, 'ok', files.length);
        var best = '';
        files.forEach(function (item) {
          var label = shortQuality(item.quality);
          if ((QUALITY_RANK[label] || 0) > (QUALITY_RANK[best] || 0)) best = label;
        });
        rememberQuality(key, best);
      }
    }

    hideHost();
    list.forEach(function (item) {
      item.origin.removeClass('selector');
    });

    var compact = !serial && !nav && list.length > 1;
    var grid = !nav && list.length > 3 && viewMode() === 'grid';
    if (grid) ui.list.addClass('nova__list--grid');
    else ui.list.removeClass('nova__list--grid');

    var paged = !nav && list.length > JUMP_FROM;
    var start = 0;
    var end = list.length - 1;

    if (paged) {
      var all = pages(list.length);
      var page;
      if (ui_page < 0 || ui_page >= list.length) {
        var resume = pickResume(list);
        page = pageAt(all, resume ? resume.index : 0);
      } else page = pageAt(all, ui_page);
      ui_page = page.start;
      start = page.start;
      end = page.end;
    } else ui_page = 0;

    ui.list.empty();
    list.forEach(function (item) {
      if (paged && (item.index < start || item.index > end)) {
        item.card = null;
        return;
      }
      ui.list.append(buildCard(item, compact && !grid, grid));
    });

    var button = buildHero();
    buildRows();

    var locked = lockActive();
    var fallback = false;
    if (ui_page_focus >= 0) {
      var wanted = list[ui_page_focus];
      if (wanted && wanted.card) fallback = wanted.card;
      ui_page_focus = -1;
    }
    if (!fallback && button && button.length && !locked) fallback = button;
    if (!fallback) fallback = ui.list.find('.nova-card').first();

    restoreFocus(fallback);
    if (locked) lockRelease();
    switchDone();
    busy = false;
    relayout();
    probeSchedule();
  }

  function relayout() {
    try {
      if (!Lampa.Layer || typeof Lampa.Layer.update !== 'function') return;
      var current = Lampa.Activity.active();
      if (!current || !current.activity) return;
      var target = current.activity.render();
      Lampa.Layer.update(target);
      setTimeout(function () {
        try { Lampa.Layer.update(target); } catch (e) {}
      }, 120);
    } catch (e) {}
  }

  function redraw() {
    signature = '';
    note_sig = '';
    if (ui.list) ui.list.empty();
    draw();
  }

  var timer = null;
  var observer = null;

  function schedule() {
    if (busy) return;
    clearTimeout(timer);
    timer = setTimeout(draw, 60);
  }

  function attach() {
    if (!window.MutationObserver || !enabled()) return;
    if (observer) observer.disconnect();

    var target;
    try {
      var current = Lampa.Activity.active();
      if (!current || !current.activity) return;
      target = current.activity.render()[0];
    } catch (e) { return; }
    if (!target) return;

    observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var node = records[i].target;
        if (node && node.nodeType === 1 && $(node).closest('.nova-skin-root').length) continue;
        if (pendingLive()) reattach();
        return schedule();
      }
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  function detach() {
    if (observer) observer.disconnect();
    observer = null;
    hopStop();
    probeStop();
    clearTimeout(timer);
    lockStopWatch();
    loadingStop();
    forget();
  }

  function hookQuality() {
    try {
      if (!Lampa.Player || !Lampa.Player.listener) return;
      Lampa.Player.listener.follow('start', function (data) {
        try {
          var want = parseInt(preferredQuality(), 10);
          if (!want || !data || !data.quality || typeof data.quality !== 'object') return;
          var keys = Object.keys(data.quality);
          if (!keys.length) return;
          var best = null;
          var diff = Infinity;
          for (var i = 0; i < keys.length; i++) {
            var num = parseInt(keys[i], 10);
            if (isNaN(num)) continue;
            if (num <= want && (want - num) < diff) {
              best = keys[i];
              diff = want - num;
            }
          }
          if (!best) {
            best = keys.sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); })[0];
          }
          if (best && data.quality[best]) data.url = data.quality[best];
        } catch (e) {}
      });
    } catch (e) {}
  }

  function settings() {
    try {
      Lampa.SettingsApi.addComponent({
        component: 'nova_skin',
        icon: '<svg height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="32" height="24" rx="5" stroke="white" stroke-width="3"/><path d="M15 13l9 5-9 5v-10z" fill="white"/></svg>',
        name: 'Nova Skin'
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: ENABLED_KEY, type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_enable'),
          description: siblingInstalled()
            ? label('nova_skin_set_enable_descr_alt')
            : label('nova_skin_set_enable_descr')
        },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero', type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_hero'),
          description: label('nova_skin_set_hero_descr')
        },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero_art', type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_hero_art'),
          description: label('nova_skin_set_hero_art_descr')
        },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_logo', type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_logo'),
          description: label('nova_skin_set_logo_descr')
        },
        onChange: function () {
          if (movie && ui.hero) heroLogo();
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_fullscreen', type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_full'),
          description: label('nova_skin_set_full_descr')
        },
        onChange: function () { applyFullScreen(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_fade', type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_fade'),
          description: label('nova_skin_set_fade_descr')
        },
        onChange: function () { applyEdgeFade(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_probe', type: 'trigger', default: false },
        field: {
          name: label('nova_skin_set_probe'),
          description: label('nova_skin_set_probe_descr')
        },
        onChange: function () { redraw(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_auto_switch', type: 'trigger', default: true },
        field: {
          name: label('nova_skin_set_switch'),
          description: label('nova_skin_set_switch_descr')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: {
          name: 'nova_skin_view',
          type: 'select',
          values: {
            list: label('nova_skin_view_list'),
            grid: label('nova_skin_view_grid')
          },
          default: 'list'
        },
        field: {
          name: label('nova_skin_set_view'),
          description: label('nova_skin_set_view_descr')
        },
        onChange: function () { redraw(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: {
          name: 'nova_skin_quality',
          type: 'select',
          values: {
            auto: label('nova_skin_set_quality_auto'),
            2160: '4K',
            1080: '1080p',
            720: '720p',
            480: '480p'
          },
          default: 'auto'
        },
        field: {
          name: label('nova_skin_set_quality'),
          description: label('nova_skin_set_quality_descr')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: {
          name: 'nova_focus_style',
          type: 'select',
          values: {
            ring: label('nova_skin_set_focus_ring'),
            fill: label('nova_skin_set_focus_fill')
          },
          default: 'ring'
        },
        field: {
          name: label('nova_skin_set_focus'),
          description: label('nova_skin_set_focus_descr')
        },
        onChange: function () { applyFocusStyle(); }
      });
    } catch (e) {}
  }

  function start() {
    settings();
    addCSS();
    applyFocusStyle();
    applyFullScreen();
    applyEdgeFade();
    hookFilter();
    hookScroll();
    hookSelect();
    hookController();
    hookQuality();
    hookReplace();
    hookRequest();
    hookXHR();

    var lastW = 0;
    var lastH = 0;
    try {
      lastW = window.innerWidth;
      lastH = window.innerHeight;
      window.addEventListener('resize', function () {
        var nowW = window.innerWidth;
        var nowH = window.innerHeight;
        if ((lastW < 600) !== (nowW < 600) || (lastH > lastW) !== (nowH > nowW)) {
          lastW = nowW;
          lastH = nowH;
          if (ui.rows && ui.rows.find('.nova-toolbar').length) {
            fitToolbar(ui.rows.find('.nova-toolbar'));
          }
        }
      });
    } catch (e) {}

    Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start' || e.type === 'archive') {
        detach();
        aside = false;
        if (pendingLive()) {
          attach();
          if (reattach()) return schedule();
          switchDone();
        }
        setTimeout(function () {
          attach();
          draw();
        }, 100);
      }
      if (e.type === 'destroy') {
        if (pendingLive()) {
          if (observer) observer.disconnect();
          observer = null;
          clearTimeout(timer);
          return;
        }
        inplaceStop();
        detach();
      }
    });

    Lampa.Controller.listener.follow('toggle', function (e) {
      if (e.name === 'content') schedule();
    });
  }

  var SKIN_CSS = ".nova{padding:0 0 3em 0}.nova *{-webkit-box-sizing:border-box;box-sizing:border-box}.nova-hero{position:relative;overflow:hidden;-webkit-border-radius:1.2em;border-radius:1.2em;margin-bottom:1.7em;background:rgba(255,255,255,.06);min-height:13em}.nova-hero--compact{min-height:0;margin-bottom:1.3em}.nova-hero--compact .nova-hero__body{padding:1.1em 1.4em;max-width:100%;min-height:5.2em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.nova-hero--compact .nova-hero__actions{margin:0}.nova-hero--compact .nova-btn--main{margin-bottom:0}.nova-hero--compact .nova-hero__season{margin:.6em 0 0 .2em;font-size:.95em;opacity:.55}.nova-hero--compact .nova-hero__progress{position:absolute;left:0;right:0;bottom:0;width:auto;height:.3em;margin:0;-webkit-border-radius:0;border-radius:0}.nova-hero--compact .nova-hero__shade{background:-webkit-linear-gradient(left,rgba(10,11,17,.88) 0%,rgba(10,11,17,.6) 45%,rgba(10,11,17,.15) 100%);background:linear-gradient(90deg,rgba(10,11,17,.88) 0%,rgba(10,11,17,.6) 45%,rgba(10,11,17,.15) 100%)}.nova-hero__bg{position:absolute;top:0;left:0;right:0;bottom:0}.nova-hero__bg img{display:block;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .35s;transition:opacity .35s}.nova-hero__bg--loaded img{opacity:1}.nova-hero__shade{position:absolute;top:0;left:0;right:0;bottom:0;background:-webkit-linear-gradient(left,rgba(10,11,17,.9) 0%,rgba(10,11,17,.62) 32%,rgba(10,11,17,.2) 62%,rgba(10,11,17,0) 84%);background:linear-gradient(90deg,rgba(10,11,17,.9) 0%,rgba(10,11,17,.62) 32%,rgba(10,11,17,.2) 62%,rgba(10,11,17,0) 84%)}.nova-hero__body{position:relative;padding:2.2em;max-width:72%}.nova-hero__title{font-size:2.3em;font-weight:600;line-height:1.15;margin-bottom:.35em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.nova-hero__meta{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:1.1em;margin-bottom:.7em}.nova-hero__meta>*{margin:0 .7em .3em 0;opacity:.8}.nova-hero__meta>.nova-badge{opacity:1}.nova-hero__descr{font-size:1.05em;line-height:1.45;opacity:.65;margin-bottom:1.2em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.nova-hero__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;min-width:0}.nova-hero__actions>.nova-btn{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;margin:0 .8em .4em 0}.nova-hero__hint{font-size:1em;line-height:1.5;opacity:.55;margin:0;padding:.1em .15em;overflow:hidden;white-space:nowrap;-o-text-overflow:ellipsis;text-overflow:ellipsis;min-width:0;-webkit-box-flex:1;-webkit-flex:1 1 14em;-ms-flex:1 1 14em;flex:1 1 14em}.nova-hero__progress{position:absolute;left:0;right:0;bottom:0;height:.3em;width:auto;-webkit-border-radius:0;border-radius:0;background:rgba(255,255,255,.2);margin:0;overflow:hidden}.nova-hero__progress .time-line{display:block !important;height:100%;margin:0;background:none}.nova-hero__progress .time-line>div{height:100%;background:#fff}.nova-badge{display:inline-block;padding:.2em .55em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.18);font-size:.78em;font-weight:600;letter-spacing:.04em;line-height:1.4}.nova-btn{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em 1.5em;-webkit-border-radius:2.4em;border-radius:2.4em;background:rgba(255,255,255,.12);font-size:1.15em;white-space:nowrap;margin:0 .8em .5em 0}.nova-btn>svg{width:1.15em;height:1.15em;margin-right:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-btn.focus{background:#fff;color:#000}.nova-btn--main{background:rgba(255,255,255,.82);color:#000}.nova-btn--main.focus{background:#fff;-webkit-box-shadow:0 .25em .9em rgba(0,0,0,.45);box-shadow:0 .25em .9em rgba(0,0,0,.45)}.nova-btn--ghost{background:rgba(255,255,255,.14);font-size:1.05em}.nova-section{margin-bottom:1.1em}.nova-section__title{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:.95em;letter-spacing:.12em;text-transform:uppercase;opacity:.5;margin-bottom:.7em}.nova-section__title:before{content:\"\";display:inline-block;width:.25em;height:1.1em;background:currentColor;margin-right:.6em;-webkit-border-radius:.2em;border-radius:.2em}.nova-section__body{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.nova-chip{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.55em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .7em .7em 0;font-size:1.05em;white-space:nowrap;max-width:24em}.nova-chip.focus{background:#fff;color:#000}.nova-chip--active{background:rgba(255,255,255,.16);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}.nova-chip--active.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}.nova-chip__idx{font-size:.85em;opacity:.45;margin-right:.55em}.nova-chip__badge{font-size:.7em;font-weight:600;padding:.2em .45em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.2);margin-right:.6em;line-height:1.4}.nova-chip.focus .nova-chip__badge{background:rgba(0,0,0,.12)}.nova-chip--more{opacity:.75}.nova-chip__label{line-height:1.5;padding:.05em .1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;min-width:0}.nova-chip>svg{width:1em;height:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-chip__label+svg{margin-left:.6em;opacity:.6}.nova-chip>svg:first-child{margin-right:.55em;opacity:.7}.nova-chip--source{font-size:1.15em;padding:.5em 1.1em}.nova-chip--ghost{opacity:.5}.nova-chip--busy .nova-chip__label{opacity:.5}.nova-chip__dot{width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;margin-left:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;background:#4ade80}.nova-chip--checking{opacity:.55}.nova-chip--empty{opacity:.35}.nova-toolbar{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:nowrap;-ms-flex-wrap:nowrap;flex-wrap:nowrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;margin-bottom:1em;min-width:0;overflow:hidden}.nova-toolbar>*{margin-bottom:0;vertical-align:middle}.nova-toolbar .nova-chip{-webkit-flex-shrink:1;-ms-flex-negative:1;flex-shrink:1;min-width:4.5em;margin-bottom:0}.nova-toolbar__label{font-size:.95em;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:0 .9em 0 0;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-toolbar--tight{font-size:.95em}.nova-toolbar--tight .nova-toolbar__label{display:none}.nova-toolbar--tight .nova-chip{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;max-width:none;padding:.5em 1em;margin-right:.6em}.nova-toolbar--tighter{font-size:.85em}.nova-toolbar--tighter .nova-toolbar__label{display:none}.nova-toolbar--tighter .nova-chip{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;max-width:none;padding:.45em .85em;margin-right:.5em}.nova-toolbar--tighter .nova-chip__badge{margin-right:.4em}.nova-toolbar .nova-btn--main{margin:0 1.4em 0 0;font-size:1.1em;padding:.55em 1.3em}.nova-toolbar .nova-btn__label{max-width:18em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap}.nova-card{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.05);margin-bottom:.7em}.nova-card.focus{background:#fff;color:#000}.nova-card__thumb{position:relative;width:10.5em;height:5.9em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;-webkit-border-radius:.5em;border-radius:.5em;overflow:hidden;background:rgba(0,0,0,.35)}.nova-card__thumb img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .3s;transition:opacity .3s}.nova-card__thumb--loaded img{opacity:1}.nova-card__num{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;font-size:1.7em;font-weight:600;color:#fff;text-shadow:0 .05em .2em rgba(0,0,0,.7)}.nova-card__thumb--loaded .nova-card__num{-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end;font-size:1.1em;padding:0 .5em .35em 0}.nova-card__thumb--fallback.nova-card__thumb--loaded img{opacity:.4}.nova-card__thumb--fallback.nova-card__thumb--loaded .nova-card__num{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:1.7em;padding:0}.nova-card__viewed{position:absolute;top:.5em;left:.5em;width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;background:#fff;opacity:.85;-webkit-box-shadow:0 0 0 .16em rgba(0,0,0,.4);box-shadow:0 0 0 .16em rgba(0,0,0,.4)}.nova-card__line{position:absolute;left:0;right:0;bottom:0;height:.28em;background:rgba(0,0,0,.5)}.nova-card__line .time-line{display:block !important;height:100%;margin:0;background:none}.nova-card__line .time-line>div{height:100%;background:#fff}.nova-card__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding:0 1.2em;min-width:1em;overflow:hidden}.nova-card__title{font-size:1.25em;line-height:1.4;margin-bottom:.3em;padding-bottom:.05em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.nova-card__meta{font-size:.95em;line-height:1.45;opacity:.6;padding-bottom:.05em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.nova-card__meta .nova-dot{margin:0 .5em;opacity:.6}.nova-card__match{display:inline-block;margin-top:.4em;padding:.15em .6em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(126,217,150,.2);color:#8fe0a4;font-size:.82em;font-weight:600}.nova-card--match .nova-card__thumb{-webkit-box-shadow:inset 0 0 0 .13em rgba(126,217,150,.75);box-shadow:inset 0 0 0 .13em rgba(126,217,150,.75)}.nova-card__side{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;text-align:center;padding-right:.7em}.nova-card__time{font-size:.95em;opacity:.6;margin-top:.4em}.nova-card--nav .nova-card__body{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.nova-card--nav .nova-card__body{-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.nova-card--nav .nova-card__title{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;margin-bottom:0}.nova-card--nav .nova-card__meta{width:100%;margin-top:.2em;font-size:.85em}.nova-card__go{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;opacity:.45;padding-left:1em}.nova-card__go>svg{width:1.2em;height:1.2em;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.nova-card--slim{padding:.75em 1.1em}.nova-card--slim .nova-card__thumb{display:none}.nova-card--slim .nova-card__body{padding-left:0}.nova-card--slim .nova-card__title{font-size:1.2em;margin-bottom:0}.nova-card__line--body{position:static;height:.25em;margin-top:.55em;-webkit-border-radius:.2em;border-radius:.2em;background:rgba(255,255,255,.18)}.nova-card.focus .nova-card__line--body{background:rgba(0,0,0,.16)}.nova-card.focus .nova-card__line--body .time-line>div{background:#000}.nova-card--slim .nova-card__line{position:static;height:.25em;margin-top:.5em;-webkit-border-radius:.2em;border-radius:.2em;background:rgba(255,255,255,.16)}.nova-card--slim.focus .nova-card__line{background:rgba(0,0,0,.15)}.nova-card--slim.focus .nova-card__line .time-line>div{background:#000}.nova-list-group{font-size:.9em;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:1.2em 0 .55em .2em}.nova-list-group:first-child{margin-top:0}.nova-card--file .nova-card__thumb{width:4.4em;height:4.4em}.nova-skeleton__row{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.04);margin-bottom:.7em;-webkit-animation:novapulse 1.4s infinite;animation:novapulse 1.4s infinite}.nova-skeleton__thumb{width:10.5em;height:5.9em;-webkit-border-radius:.5em;border-radius:.5em;background:rgba(255,255,255,.08);-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-skeleton__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding-left:1.2em}.nova-skeleton__line{height:1em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.08);margin-bottom:.7em}.nova-skeleton__line--short{width:35%;margin-bottom:0}@-webkit-keyframes novapulse{0%{opacity:.45}50%{opacity:1}100%{opacity:.45}}@keyframes novapulse{0%{opacity:.45}50%{opacity:1}100%{opacity:.45}}.nova-loading{padding:1.6em 1.8em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05);margin-bottom:1.2em}.nova-loading__title{font-size:1.4em;margin-bottom:.35em}.nova-loading__text{font-size:1.05em;opacity:.6;margin-bottom:1em}.nova-loading__bar{position:relative;height:.3em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.14);overflow:hidden}.nova-loading__bar>div{height:100%;width:0;background:#fff;-webkit-transition:width .4s;transition:width .4s}.nova-note{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:2em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05)}.nova-note__main{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;min-width:1em}.nova-note__text a{color:#fff;text-decoration:underline}.nova-note__text img{max-width:9em;height:auto;background:#fff;padding:.4em;-webkit-border-radius:.4em;border-radius:.4em;margin-top:.7em;opacity:1}.nova-note__text ul,.nova-note__text ol{margin:.5em 0;padding-left:1.2em}.nova-note__title{font-size:1.6em;margin-bottom:.4em;line-height:1.25}.nova-note__text{font-size:1.1em;color:rgba(255,255,255,.62);margin-bottom:1.3em;line-height:1.4}.nova-note__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.nova-note__timer{font-weight:600}.nova-group{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.5em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .7em .7em 0;font-size:1.1em;white-space:nowrap}.nova-group.focus{background:#fff;color:#000}.nova-group--open{background:rgba(255,255,255,.2);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}.nova-group--open.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}.nova-group__count{font-size:.78em;opacity:.55;margin-left:.6em}.nova-group__mark{width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;background:#fff;margin-right:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-drop{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.3em 0 0 1em;margin:0 0 .7em .3em;-webkit-box-shadow:inset .16em 0 0 rgba(255,255,255,.18);box-shadow:inset .16em 0 0 rgba(255,255,255,.18)}.nova__list--grid{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:0 -.45em}.nova__list--grid .nova-card{display:block;width:25%;margin:0 0 1em 0;padding:0 .45em;background:none}.nova__list--grid .nova-card.focus{background:none;color:inherit}.nova__list--grid .nova-card__thumb{width:100%;height:0;padding-top:56%}.nova__list--grid .nova-card--file .nova-card__thumb{width:100%;height:0;padding-top:56%}.nova__list--grid .nova-card.focus .nova-card__thumb{-webkit-box-shadow:0 0 0 .2em #fff;box-shadow:0 0 0 .2em #fff}.nova__list--grid .nova-card__body{padding:.5em .1em 0 .1em}.nova__list--grid .nova-card__title{font-size:.92em;line-height:1.3;margin-bottom:.15em;-webkit-line-clamp:2}.nova__list--grid .nova-card__meta{font-size:.78em;line-height:1.35;-webkit-line-clamp:2}.nova__list--grid .nova-card__meta .nova-dot{margin:0 .3em}.nova__list--grid .nova-card__match{margin-top:.25em;font-size:.72em;padding:.1em .45em}.nova__list--grid .nova-card__side{position:absolute;top:.5em;right:.9em;text-align:right}.nova__list--grid .nova-card__time{display:none}.nova__list--grid .nova-card__num{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;padding:.4em 0 0 .55em;font-size:1.05em}.nova-hero__season{font-size:.95em;opacity:.55;margin-top:.8em}@media screen and (max-width:1200px){.nova__list--grid .nova-card{width:33.3333%}}@media screen and (max-width:580px){.nova__list--grid .nova-card{width:50%}.nova-hero__body{max-width:100%;padding:1.3em}.nova-hero__title{font-size:1.7em}.nova-hero__descr{display:none}.nova-hero__shade{background:-webkit-linear-gradient(top,rgba(10,11,17,0) 0%,rgba(10,11,17,.35) 42%,rgba(10,11,17,.86) 100%);background:linear-gradient(180deg,rgba(10,11,17,0) 0%,rgba(10,11,17,.35) 42%,rgba(10,11,17,.86) 100%)}.nova-card__thumb{width:7em;height:4.4em}.nova-chip{max-width:16em}}";

  var EXTRA_CSS = ".nova-skin-chips .explorer__files-head{display:none!important}.nova-skin-scope .nova-hidden{display:none!important}.nova-skin-scope .nova{padding-top:0}.nova-skin-root .nova-card__line>.time-line{display:block!important;height:100%;margin:0;background:none}.nova-skin-root .nova-card__line>.time-line>div{height:100%;background:#fff}.nova-skin-root .nova-card__line--body>.time-line>div{background:rgba(255,255,255,.9)}.nova-skin-root .nova-hero__progress .time-line{display:block!important;height:100%;margin:0;background:none}.nova-skin-root .nova-hero__progress .time-line>div{height:100%;background:#fff}.nova-skin-scope .explorer__files-body .scroll__body>*{display:none!important}.nova-skin-scope .explorer__files-body .scroll__body>.nova-skin-root{display:block!important}.nova-skin-scope .explorer__files-body .broadcast__scan{display:none!important}.nova-skin-scope .explorer__files-head{display:none!important}.nova-skin-switching .activity--active{-webkit-animation:none!important;animation:none!important;-webkit-transition:none!important;transition:none!important;-webkit-transform:none!important;transform:none!important}.nova-skin-switching .activity:not(.activity--active){opacity:0!important}.nova-skin-switching .explorer__left,.nova-skin-switching .explorer__files{-webkit-transition:none!important;transition:none!important;-webkit-animation:none!important;animation:none!important}.nova-skin-root .nova-toolbar .nova-chip{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;max-width:none}.nova-skin-root .nova-toolbar--clip .nova-chip{-webkit-flex-shrink:1;-ms-flex-negative:1;flex-shrink:1;min-width:4.5em}.nova-skin-root .nova-toolbar--clip .nova-chip__label{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;min-width:0}.nova-skin-root .nova-hero__title,.nova-skin-root .nova-hero__meta,.nova-skin-root .nova-hero__descr,.nova-skin-root .nova-hero__hint,.nova-skin-root .nova-hero__season{text-shadow:0 .06em .5em rgba(0,0,0,.8)}.nova-skin-root .nova-hero__descr{opacity:.8}.nova-skin-root .nova-hero__title--logo{display:block;margin-bottom:.5em;line-height:1}.nova-skin-root .nova-hero__title--logo>img{display:block;max-height:2.1em;max-width:70%;width:auto;height:auto;-o-object-fit:contain;object-fit:contain;-webkit-filter:drop-shadow(0 .06em .35em rgba(0,0,0,.7));filter:drop-shadow(0 .06em .35em rgba(0,0,0,.7))}@media screen and (max-width:580px){.nova-skin-root .nova-hero__title--logo>img{max-height:1.9em;max-width:80%}}.nova-skin-root .nova-chip--checking{opacity:.55}.nova-skin-root .nova-chip--checking .nova-chip__label{opacity:.6}@media screen and (max-width:900px){.nova-skin-root .nova-hero__hint{-webkit-flex:1 0 100%;-ms-flex:1 0 100%;flex:1 0 100%;margin:.3em 0 0 .15em;white-space:normal}}@media screen and (max-width:580px){.nova-skin-root .nova-card__side{display:block!important;text-align:center;padding-right:.2em;max-width:6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-skin-root .nova-card__quality{font-size:.66em;padding:.15em .4em}.nova-skin-root .nova-card__time{font-size:.78em;margin-top:.3em;display:block}.nova-skin-root .nova__list--grid .nova-card__side{position:absolute;top:.4em;right:.6em;max-width:none}.nova-skin-root .nova__list--grid .nova-card__time{display:none}}";

  var FOCUS_CSS = [
    'body.nova-focus-ring .nova-btn.focus,body.nova-focus-ring .nova-chip.focus,body.nova-focus-ring .nova-card.focus,body.nova-focus-ring .nova-group.focus{background:rgba(255,255,255,.16)!important;color:#fff!important;-webkit-box-shadow:inset 0 0 0 .12em #fff!important;box-shadow:inset 0 0 0 .12em #fff!important}',
    'body.nova-focus-ring .nova-btn--main{background:rgba(255,255,255,.16);color:#fff;-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}',
    'body.nova-focus-ring .nova-chip.focus .nova-chip__badge{background:rgba(255,255,255,.2)!important;color:#fff!important}',
    'body.nova-focus-ring .nova-card.focus .nova-card__line--body{background:rgba(255,255,255,.2)!important}',
    'body.nova-focus-ring .nova-card.focus .nova-card__line--body .time-line>div{background:#fff!important}',
    'body.nova-focus-ring .nova-card--slim.focus .nova-card__line{background:rgba(255,255,255,.2)!important}',
    'body.nova-focus-ring .nova-card--slim.focus .nova-card__line .time-line>div{background:#fff!important}',
    'body.nova-focus-ring .nova__list--grid .nova-card.focus{background:none!important;color:inherit!important;-webkit-box-shadow:none!important;box-shadow:none!important}',
    'body.nova-focus-ring .nova__list--grid .nova-card.focus .nova-card__thumb{-webkit-box-shadow:0 0 0 .12em #fff!important;box-shadow:0 0 0 .12em #fff!important}',
    'body.nova-focus-ring .nova-chip--active.focus,body.nova-focus-ring .nova-group--open.focus{-webkit-box-shadow:inset 0 0 0 .12em #fff!important;box-shadow:inset 0 0 0 .12em #fff!important}'
  ].join('');

  var CARD_CSS = [
    '.nova-skin-root .nova-card__viewed{top:auto;bottom:.55em;left:.55em;width:1.15em;height:1.15em;-webkit-border-radius:0;border-radius:0;background:none;opacity:.8;-webkit-box-shadow:none;box-shadow:none}',
    '.nova-skin-root .nova-card__viewed>svg{display:block;width:100%;height:100%;-webkit-filter:drop-shadow(0 0 .2em rgba(0,0,0,.9));filter:drop-shadow(0 0 .2em rgba(0,0,0,.9))}',
    '.nova-skin-root .nova-card--soon{opacity:.45}',
    '.nova-skin-root .nova-card--soon .nova-card__time{white-space:nowrap}',
    '.nova-skin-root .nova-card__eye{display:block;margin-top:.4em;opacity:.5}',
    '.nova-skin-root .nova-card__eye>svg{display:block;width:1.2em;height:1.2em;margin:0 auto}',
    '.nova-skin-root .nova-card.focus .nova-card__eye{opacity:.65}',
    'body.nova-focus-ring .nova-card.focus .nova-card__eye{opacity:.75!important}'
  ].join('');

  var FULL_CSS = [
    'body.nova-skin-full .nova-skin-scope .explorer__left{display:none!important}',
    'body.nova-skin-full .nova-skin-scope .explorer__files{width:100%!important;left:0!important}'
  ].join('');

  var FADE_MASK = '-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 10%,#000 90%,transparent 100%),linear-gradient(180deg,transparent 0,#000 14%,#000 86%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 10%,#000 90%,transparent 100%),linear-gradient(180deg,transparent 0,#000 14%,#000 86%,transparent 100%);-webkit-mask-composite:source-in;mask-composite:intersect;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-size:100% 100%;mask-size:100% 100%';

  var FADE_CSS = [
    'body.nova-skin-fade .nova-skin-root .nova-hero{background:transparent;-webkit-border-radius:0;border-radius:0}',
    'body.nova-skin-fade .nova-skin-root .nova-hero__bg{' + FADE_MASK + '}',
    'body.nova-skin-fade .nova-skin-root .nova-hero__shade{' + FADE_MASK + '}'
  ].join('');

  if (window.appready) start();
  else {
    try {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') start();
      });
    } catch (e) {}
  }
})();
