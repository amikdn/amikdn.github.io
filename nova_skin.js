(function () {
  'use strict';

  if (window.nova_skin) return;
  window.nova_skin = true;

  var STORAGE_KEY = 'nova_skin_enabled';
  var filters = [];

  function get(key, def) {
    try { return Lampa.Storage.get(key, def); } catch (e) { return def; }
  }

  function enabled() { return get(STORAGE_KEY, true) !== false; }
  function heroEnabled() { return get('nova_skin_hero', true) !== false; }
  function artEnabled() { return get('nova_skin_hero_art', true) !== false; }
  function viewMode() { return get('nova_skin_view', 'list'); }
  function preferredQuality() { return get('nova_skin_quality', 'auto'); }

  try {
    Lampa.Lang.add({
      nova_skin_watch: { ru: 'Смотреть', en: 'Watch', uk: 'Дивитися' },
      nova_skin_continue: { ru: 'Продолжить', en: 'Continue', uk: 'Продовжити' },
      nova_skin_next: { ru: 'Следующая серия', en: 'Next episode', uk: 'Наступна серія' },
      nova_skin_source: { ru: 'Источник', en: 'Source', uk: 'Джерело' },
      nova_skin_progress: { ru: 'Просмотрено {seen} из {total}', en: 'Watched {seen} of {total}', uk: 'Проглянуто {seen} з {total}' },
      nova_skin_left: { ru: 'осталось {left}', en: '{left} left', uk: 'залишилось {left}' },
      nova_skin_clarify: { ru: 'Уточнить поиск', en: 'Clarify search', uk: 'Уточнити пошук' }
    });
  } catch (e) {}

  function text(key, fallback) {
    try {
      var value = Lampa.Lang.translate(key);
      return value && value !== key ? value : (fallback || '');
    } catch (e) { return fallback || ''; }
  }

  var ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4" stroke-linecap="round"></path></svg>'
  };

  function esc(value) {
    return ('' + (value == null ? '' : value)).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function digits(value) {
    var found = ('' + (value == null ? '' : value)).match(/\d+/);
    return found ? parseInt(found[0], 10) : 0;
  }

  function image(path, size) {
    if (!path || path === 'undefined') return '';
    if (/^https?:/.test(path)) return path;
    try { return Lampa.TMDB.image('t/p/' + (size || 'w780') + path); } catch (e) { return ''; }
  }

  function shortQuality(value) {
    var raw = ('' + (value == null ? '' : value)).toLowerCase();
    if (!raw) return '';
    if (raw.indexOf('4k') !== -1 || raw.indexOf('2160') !== -1 || raw.indexOf('uhd') !== -1) return '4K';
    if (raw.indexOf('1440') !== -1 || raw.indexOf('2k') !== -1) return '2K';
    if (raw.indexOf('1080') !== -1 || raw.indexOf('fullhd') !== -1 || raw.indexOf('fhd') !== -1) return 'FHD';
    if (raw.indexOf('720') !== -1) return 'HD';
    if (raw.indexOf('480') !== -1 || raw.indexOf('360') !== -1 || raw.indexOf('sd') !== -1) return 'SD';
    return '';
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

  function addCSS() {
    if (document.getElementById('nova-skin-css')) return;
    var style = document.createElement('style');
    style.id = 'nova-skin-css';
    style.textContent = SKIN_CSS + EXTRA_CSS;
    (document.body || document.head).appendChild(style);
  }

  function hookFilter() {
    if (!Lampa.Filter || Lampa.Filter.nova_wrapped) return;
    var real = Lampa.Filter;

    function Wrapped(params) {
      var inst = new real(params);
      var setter = inst.set;
      inst.nova_sets = {};
      inst.set = function (type, items) {
        inst.nova_sets[type] = items;
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

  function activeFilter(root) {
    for (var i = 0; i < filters.length; i++) {
      try {
        if ($.contains(root[0], filters[i].render()[0])) return filters[i];
      } catch (e) {}
    }
    return null;
  }

  function groups(filter) {
    var out = { season: null, voice: null, sort: null };
    if (!filter || !filter.nova_sets) return out;

    (filter.nova_sets.filter || []).forEach(function (group) {
      if (!group || !group.items || !group.items.length) return;
      if (group.stype === 'season') out.season = group;
      if (group.stype === 'voice') out.voice = group;
    });

    var sort = filter.nova_sets.sort || [];
    if (sort.length) out.sort = sort;
    return out;
  }

  function context() {
    if (!enabled()) return null;

    var current;
    try { current = Lampa.Activity.active(); } catch (e) { return null; }
    if (!current || !current.activity) return null;

    var root;
    try { root = current.activity.render(); } catch (e) { return null; }
    if (!root || !root.length) return null;
    if (!root.hasClass('explorer')) root = root.find('.explorer').first();
    if (!root.length) return null;

    var body = root.find('.explorer__files-body .scroll__body').first();
    if (!body.length) return null;
    if (body.find('.torrent-item').length) return null;
    if (body.find('.nova__list, .nova__hero').length) return null;

    var files = body.find('.online-prestige--full');
    var folders = body.find('.online-prestige--folder');
    if (!files.length && !folders.length) return null;

    var movie = current.movie || current.card;
    if (!movie) return null;

    var filter = activeFilter(root);

    return {
      root: root,
      body: body,
      movie: movie,
      filter: filter,
      groups: groups(filter),
      serial: !!(movie.name || movie.number_of_seasons),
      nav: !files.length && folders.length > 0
    };
  }

  function cardData(element, index) {
    var card = $(element);
    var line = card.find('.time-line').first();
    var hash = line.attr('data-hash') || '';
    var percent = 0;

    if (hash) {
      try { percent = Lampa.Timeline.view(hash).percent || 0; } catch (e) { percent = 0; }
    }
    if (!percent) {
      var raw = (line.children('div').first().attr('style') || '').match(/([\d.]+)%/);
      if (raw) percent = parseFloat(raw[1]) || 0;
    }

    return {
      el: card,
      index: index,
      percent: percent,
      viewed: card.find('.online-prestige__viewed').length > 0,
      num: digits(card.find('.online-prestige__episode-number').text()) || index + 1,
      title: card.find('.online-prestige__title').text().trim(),
      quality: card.find('.online-prestige__quality').text().trim()
    };
  }

  function collect(ctx) {
    var list = [];
    ctx.body.find('.online-prestige--full').each(function () {
      list.push(cardData(this, list.length));
    });
    return list;
  }

  function pickResume(list) {
    var i;
    if (!list.length) return null;
    for (i = 0; i < list.length; i++) {
      if (list[i].percent > 0 && list[i].percent < 90) return list[i];
    }
    for (i = 0; i < list.length; i++) {
      if (!list[i].viewed) return list[i];
    }
    return list[0];
  }

  function novaScroll(element) {
    try {
      var node = element instanceof jQuery ? element[0] : element;
      if (!node) return;
      var host = $(node).closest('.scroll');
      if (!host.length) return;
      var body = host.find('.scroll__body').first();
      if (!body.length) return;
      var top = node.getBoundingClientRect().top - host[0].getBoundingClientRect().top;
      if (top > -1 && top < host[0].offsetHeight * 0.6) return;

      var style = body[0].style['-webkit-transform'] || body[0].style.transform || '';
      if (style.indexOf('translate') !== -1) {
        var pair = style.match(/-?[\d.]+px,\s*(-?[\d.]+)px/);
        var now = pair ? parseFloat(pair[1]) || 0 : 0;
        var next = Math.min(0, Math.round(now - top + 20));
        body[0].style['-webkit-transform'] = 'translate3d(0px, ' + next + 'px, 0px)';
        body[0].style.transform = 'translate3d(0px, ' + next + 'px, 0px)';
      } else {
        host[0].scrollTop = Math.max(0, host[0].scrollTop + top - 20);
      }
    } catch (e) {}
  }

  function bind(element, enter) {
    element.on('hover:enter', function () {
      try { enter(); } catch (e) {}
    }).on('hover:focus', function (e) {
      novaScroll(e.target);
    });
    return element;
  }

  function heroArt(movie) {
    return image(movie.backdrop_path || movie.poster_path, 'w780') || image(movie.img, 'w780');
  }

  function sourceName(ctx) {
    var sort = ctx.groups.sort || [];
    for (var i = 0; i < sort.length; i++) {
      if (sort[i].selected) return sort[i].title || '';
    }
    return sort.length ? (sort[0].title || '') : '';
  }

  function voiceName(ctx) {
    return ctx.groups.voice ? (ctx.groups.voice.subtitle || '') : '';
  }

  function seasonNumber(ctx) {
    if (ctx.groups.season) return digits(ctx.groups.season.subtitle);
    return 0;
  }

  function buildHero(ctx, list) {
    if (!heroEnabled() || ctx.nav) return null;

    var target = pickResume(list);
    if (!target) return null;

    var movie = ctx.movie;
    var withArt = artEnabled();
    var hero = $('<div class="nova-hero">' +
      '<div class="nova-hero__bg"><img alt=""></div><div class="nova-hero__shade"></div>' +
      '<div class="nova-hero__body">' +
      (withArt ? '<div class="nova-hero__title"></div><div class="nova-hero__meta"></div><div class="nova-hero__descr"></div>' : '') +
      '<div class="nova-hero__actions"><div class="nova-hero__hint"></div></div>' +
      '<div class="nova-hero__season" style="display:none"></div>' +
      '<div class="nova-hero__progress" style="display:none"></div>' +
      '</div></div>');

    if (!withArt) hero.addClass('nova-hero--compact');

    if (withArt) {
      hero.find('.nova-hero__title').text(movie.title || movie.name || '');
      hero.find('.nova-hero__descr').text(movie.overview || '');

      var meta = hero.find('.nova-hero__meta');
      var badge = shortQuality(target.quality) || splitSourceName(sourceName(ctx)).badge;
      if (badge) meta.append('<div class="nova-badge">' + esc(badge) + '</div>');
      if (movie.vote_average) meta.append('<div>★ ' + parseFloat(movie.vote_average + '').toFixed(1) + '</div>');
      var year = ((movie.release_date || movie.first_air_date || '') + '').slice(0, 4);
      if (year) meta.append('<div>' + esc(year) + '</div>');
      var runtime = movie.runtime || (movie.episode_run_time || [])[0];
      if (runtime) {
        try { meta.append('<div>' + esc(Lampa.Utils.secondsToTime(runtime * 60, true)) + '</div>'); } catch (e) {}
      }
    }

    var art = heroArt(movie);
    if (art) {
      var back = hero.find('.nova-hero__bg');
      var node = hero.find('.nova-hero__bg img')[0];
      node.onload = function () { back.addClass('nova-hero__bg--loaded'); };
      node.onerror = function () {};
      node.src = art;
    }

    var started = target.percent > 0 && target.percent < 90;
    var label = started ? text('nova_continue', text('nova_skin_continue', 'Продолжить'))
      : text('nova_watch', text('nova_skin_watch', 'Смотреть'));
    if (ctx.serial) {
      var season = seasonNumber(ctx) || 1;
      label += ' · S' + season + ' E' + target.num;
    }

    var play = bind($('<div class="nova-btn nova-btn--main selector"></div>').append(ICON.play)
      .append($('<span class="nova-btn__label"></span>').text(label)), function () {
      target.el.trigger('hover:enter');
    });
    hero.find('.nova-hero__actions').prepend(play);

    if (ctx.serial && started) {
      var next = list[target.index + 1];
      if (next) {
        var nextLabel = text('nova_next_episode', text('nova_skin_next', 'Следующая серия')) +
          ' · ' + text('torrent_serial_episode', 'Серия') + ' ' + next.num;
        play.after(bind($('<div class="nova-btn nova-btn--ghost selector"></div>')
          .append($('<span class="nova-btn__label"></span>').text(nextLabel)), function () {
          next.el.trigger('hover:enter');
        }));
      }
    }

    var hint = [];
    var source = splitSourceName(sourceName(ctx)).name;
    if (source) hint.push(source);
    var voice = voiceName(ctx);
    if (voice) hint.push(voice);
    hero.find('.nova-hero__hint').text(hint.join(' · '));

    if (target.percent > 0) {
      hero.find('.nova-hero__progress').show()
        .append('<div class="time-line"><div style="width:' + Math.min(100, target.percent) + '%"></div></div>');
    }

    if (ctx.serial && list.length > 1) {
      var seen = 0;
      list.forEach(function (item) {
        if (item.viewed || item.percent >= 90) seen++;
      });
      var progress = text('nova_season_progress', text('nova_skin_progress', 'Просмотрено {seen} из {total}'))
        .replace('{seen}', seen).replace('{total}', list.length);
      if (seen < list.length) {
        progress += ' · ' + text('nova_season_left', text('nova_skin_left', 'осталось {left}'))
          .replace('{left}', list.length - seen);
      }
      hero.find('.nova-hero__season').text(progress).show();
    }

    return hero;
  }

  function backToContent() {
    try { Lampa.Controller.toggle('content'); } catch (e) {}
  }

  function chip(key, value, extra) {
    var box = $('<div class="nova-chip selector"></div>');
    box.attr('data-nova-chip', key);
    if (extra && extra.badge) box.append($('<span class="nova-chip__badge"></span>').text(extra.badge));
    if (extra && extra.icon) box.append(extra.icon);
    if (value) box.append($('<span class="nova-chip__label"></span>').text(value));
    if (!(extra && extra.plain)) box.append(ICON.chevron);
    if (key === 'source') box.addClass('nova-chip--source');
    return box;
  }

  function label(title) {
    return $('<div class="nova-toolbar__label"></div>').text(title);
  }

  function openSources(ctx) {
    var sort = ctx.groups.sort || [];
    if (!sort.length || !ctx.filter) return;
    var items = [];
    sort.forEach(function (item) {
      items.push({
        title: item.title,
        source: item.source,
        selected: !!item.selected,
        ghost: !!item.ghost
      });
    });
    try {
      Lampa.Select.show({
        title: text('nova_skin_source', 'Источник'),
        items: items,
        onBack: backToContent,
        onSelect: function (item) {
          if (item.selected) return backToContent();
          try { ctx.filter.onSelect('sort', item); } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function openGroup(ctx, group, title) {
    if (!group || !ctx.filter) return;
    var items = [];
    group.items.forEach(function (item, index) {
      items.push({
        title: item.title,
        selected: !!item.selected,
        index: typeof item.index === 'number' ? item.index : index
      });
    });
    try {
      Lampa.Select.show({
        title: title,
        items: items,
        onBack: backToContent,
        onSelect: function (item) {
          if (item.selected) return backToContent();
          try { ctx.filter.onSelect('filter', { stype: group.stype }, { index: item.index }); } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function buildToolbar(ctx) {
    var toolbar = $('<div class="nova-toolbar"></div>');
    var added = 0;

    var sort = ctx.groups.sort || [];
    if (sort.length) {
      var parts = splitSourceName(sourceName(ctx));
      toolbar.append(label(text('nova_source', text('nova_skin_source', 'Источник'))));
      toolbar.append(bind(chip('source', parts.name, { badge: parts.badge }), function () {
        openSources(ctx);
      }));
      added++;
    }

    var season = ctx.groups.season;
    if (season && season.items.length > 1) {
      var seasonTitle = season.title || text('torrent_serial_season', 'Сезон');
      toolbar.append(label(seasonTitle));
      toolbar.append(bind(chip('season', season.subtitle || '', {}), function () {
        openGroup(ctx, season, seasonTitle);
      }));
      added++;
    }

    var voice = ctx.groups.voice;
    if (voice && voice.items.length > 1) {
      var voiceTitle = voice.title || text('torrent_parser_voice', 'Перевод');
      toolbar.append(label(voiceTitle));
      toolbar.append(bind(chip('voice', voice.subtitle || '', {}), function () {
        openGroup(ctx, voice, voiceTitle);
      }));
      added++;
    }

    var search = ctx.root.find('.filter--search').first();
    if (search.length) {
      toolbar.append(bind(chip('search', '', { icon: ICON.search, plain: true }), function () {
        try { search.trigger('hover:enter'); } catch (e) {}
      }));
    }

    return added ? toolbar : null;
  }

  function rebuildCard(ctx, item, fallbackArt) {
    var card = item.el;
    if (card.hasClass('nova-card')) return;

    var thumb = card.find('.online-prestige__img').first();
    var body = card.find('.online-prestige__body').first();
    var head = card.find('.online-prestige__head').first();
    var footer = card.find('.online-prestige__footer').first();
    var title = card.find('.online-prestige__title').first();
    var info = card.find('.online-prestige__info').first();
    var quality = card.find('.online-prestige__quality').first();
    var time = card.find('.online-prestige__time').first();
    var timeline = card.find('.online-prestige__timeline').first();
    var number = card.find('.online-prestige__episode-number').first();

    var timeText = time.length ? time.text().trim() : '';
    var badge = shortQuality(item.quality);

    card.addClass('nova-card');
    if (!ctx.serial) card.addClass('nova-card--file');
    card.find('.online-prestige__loader').remove();

    if (thumb.length) {
      thumb.addClass('nova-card__thumb');
      var picture = thumb.find('img').first();
      if (picture.length) {
        if (!picture.attr('src') && fallbackArt) {
          thumb.addClass('nova-card__thumb--fallback');
          picture.attr('src', fallbackArt);
        }
        if (picture[0].complete && picture.attr('src')) thumb.addClass('nova-card__thumb--loaded');
        picture.on('load', function () { thumb.addClass('nova-card__thumb--loaded'); });
        picture.on('error', function () { thumb.removeClass('nova-card__thumb--fallback'); });
      }
      if (number.length) number.addClass('nova-card__num');
      if (timeline.length) timeline.addClass('nova-card__line').appendTo(thumb);
      if (item.viewed) card.find('.online-prestige__viewed').addClass('nova-card__viewed').empty();
    }

    if (quality.length) quality.remove();
    if (time.length) time.remove();

    if (body.length) {
      body.addClass('nova-card__body');
      if (title.length) title.addClass('nova-card__title').appendTo(body);
      if (info.length) {
        info.addClass('nova-card__meta').appendTo(body);
        info.find('.online-prestige-split').replaceWith('<span class="nova-dot">●</span>');
      }
      if (head.length && !head.children().length) head.remove();
      if (footer.length && !footer.children().length) footer.remove();
    }

    var side = $('<div class="nova-card__side"></div>');
    if (badge) side.append($('<div class="nova-badge"></div>').text(badge));
    if (timeText) side.append($('<div class="nova-card__time"></div>').text(timeText));
    if (side.children().length) card.append(side);

    card.on('hover:focus', function (e) { novaScroll(e.target); });
  }

  function rebuildFolders(ctx) {
    ctx.body.find('.online-prestige--folder').each(function () {
      var folder = $(this);
      if (folder.hasClass('nova-card')) return;
      folder.addClass('nova-card nova-card--nav nova-card--slim');
      folder.find('.online-prestige__folder').remove();

      var body = folder.find('.online-prestige__body').first().addClass('nova-card__body');
      folder.find('.online-prestige__title').addClass('nova-card__title').appendTo(body);
      folder.find('.online-prestige__info').addClass('nova-card__meta').appendTo(body);
      folder.find('.online-prestige__time').remove();
      folder.find('.online-prestige__head').remove();
      folder.find('.online-prestige__footer').remove();

      if (!folder.find('.nova-card__go').length) {
        body.append('<div class="nova-card__go">' + ICON.chevron + '</div>');
      }
      folder.on('hover:focus', function (e) { novaScroll(e.target); });
    });
  }

  function decorate(ctx, list) {
    var fallbackArt = heroArt(ctx.movie);
    list.forEach(function (item) {
      rebuildCard(ctx, item, fallbackArt);
    });
    rebuildFolders(ctx);

    var grid = ctx.serial && !ctx.nav && viewMode() === 'grid' && list.length > 3;
    if (grid) ctx.body.addClass('nova__list--grid');
    else ctx.body.removeClass('nova__list--grid');
  }

  function refresh(ctx, focus) {
    try {
      Lampa.Controller.collectionSet(ctx.root[0], false, true);
      if (focus && focus.length) Lampa.Controller.collectionFocus(focus[0], ctx.root[0]);
    } catch (e) {}
  }

  var built = null;
  var signature = '';
  var busy = false;

  function stamp(ctx, list) {
    return [
      list.length,
      ctx.nav ? 'nav' : 'files',
      sourceName(ctx),
      ctx.groups.season ? ctx.groups.season.subtitle : '',
      ctx.groups.voice ? ctx.groups.voice.subtitle : '',
      viewMode(),
      list.length ? list[0].title : ''
    ].join('|');
  }

  function draw() {
    if (!enabled()) return;
    var ctx = context();
    if (!ctx) return;

    var list = collect(ctx);
    decorate(ctx, list);

    var mark = stamp(ctx, list);
    var fresh = built !== ctx.body[0];
    if (!fresh && mark === signature) return;

    busy = true;
    built = ctx.body[0];
    signature = mark;

    ctx.body.find('.nova-head').remove();

    var head = $('<div class="nova nova-head"></div>');
    var hero = buildHero(ctx, list);
    if (hero) head.append(hero);
    var toolbar = buildToolbar(ctx);
    if (toolbar) head.append(toolbar);

    if (!head.children().length) {
      busy = false;
      return;
    }

    ctx.body.prepend(head);
    ctx.root.addClass('nova-skin-scope');
    if (toolbar) ctx.root.addClass('nova-skin-chips');

    var target = fresh ? head.find('.nova-btn--main').first() : null;
    refresh(ctx, target && target.length ? target : null);

    setTimeout(function () { busy = false; }, 120);
  }

  var timer = null;
  var observer = null;

  function schedule() {
    if (busy) return;
    clearTimeout(timer);
    timer = setTimeout(draw, 60);
  }

  function redraw() {
    built = null;
    signature = '';
    var ctx = context();
    if (ctx) ctx.body.find('.nova-head').remove();
    draw();
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

    observer = new MutationObserver(schedule);
    observer.observe(target, { childList: true, subtree: true });
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
        param: { name: STORAGE_KEY, type: 'trigger', default: true },
        field: { name: 'Включить Nova Skin', description: 'Новый интерфейс для всех онлайн-плагинов' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero', type: 'trigger', default: true },
        field: { name: 'Шапка с кнопкой', description: 'Кадр, прогресс и кнопка продолжения сверху' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero_art', type: 'trigger', default: true },
        field: { name: 'Кадр в шапке', description: 'Выключите для компактной шапки без картинки' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_view', type: 'select', values: { list: 'Список', grid: 'Плитка' }, default: 'list' },
        field: { name: 'Вид серий', description: 'Список или плитка (4 в ряд)' },
        onChange: function () { redraw(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_quality', type: 'select', values: { auto: 'Авто', 2160: '4K', 1080: '1080p', 720: '720p', 480: '480p' }, default: 'auto' },
        field: { name: 'Качество по умолчанию', description: 'Предпочтительное качество воспроизведения' }
      });
    } catch (e) {}
  }

  function start() {
    addCSS();
    settings();
    hookFilter();
    hookQuality();

    Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start' || e.type === 'archive') {
        built = null;
        signature = '';
        busy = false;
        setTimeout(function () { attach(); draw(); }, 100);
      }
      if (e.type === 'destroy') {
        built = null;
        signature = '';
        if (observer) observer.disconnect();
      }
    });

    Lampa.Controller.listener.follow('toggle', function (e) {
      if (e.name === 'content') schedule();
    });
  }

  var SKIN_CSS = ".nova{padding:0 0 3em 0}.nova *{-webkit-box-sizing:border-box;box-sizing:border-box}.nova-hero{position:relative;overflow:hidden;-webkit-border-radius:1.2em;border-radius:1.2em;margin-bottom:1.7em;background:rgba(255,255,255,.06);min-height:13em}.nova-hero--compact{min-height:0;margin-bottom:1.3em}.nova-hero--compact .nova-hero__body{padding:1.1em 1.4em;max-width:100%;min-height:5.2em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.nova-hero--compact .nova-hero__actions{margin:0}.nova-hero--compact .nova-btn--main{margin-bottom:0}.nova-hero--compact .nova-hero__season{margin:.6em 0 0 .2em;font-size:.95em;opacity:.55}.nova-hero--compact .nova-hero__progress{position:absolute;left:0;right:0;bottom:0;width:auto;height:.3em;margin:0;-webkit-border-radius:0;border-radius:0}.nova-hero--compact .nova-hero__shade{background:-webkit-linear-gradient(left,rgba(10,11,17,.94) 0%,rgba(10,11,17,.8) 45%,rgba(10,11,17,.3) 100%);background:linear-gradient(90deg,rgba(10,11,17,.94) 0%,rgba(10,11,17,.8) 45%,rgba(10,11,17,.3) 100%)}.nova-hero--compact .nova-hero__progress{margin-top:.8em}.nova-hero__bg{position:absolute;top:0;left:0;right:0;bottom:0}.nova-hero__bg img{display:block;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .35s;transition:opacity .35s}.nova-hero__bg--loaded img{opacity:1}.nova-hero__shade{position:absolute;top:0;left:0;right:0;bottom:0;background:-webkit-linear-gradient(left,rgba(10,11,17,.97) 0%,rgba(10,11,17,.9) 36%,rgba(10,11,17,.45) 68%,rgba(10,11,17,.1) 100%);background:linear-gradient(90deg,rgba(10,11,17,.97) 0%,rgba(10,11,17,.9) 36%,rgba(10,11,17,.45) 68%,rgba(10,11,17,.1) 100%)}.nova-hero__body{position:relative;padding:2.2em;max-width:64%}.nova-hero__title{font-size:2.3em;font-weight:600;line-height:1.15;margin-bottom:.35em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.nova-hero__meta{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:1.1em;margin-bottom:.7em}.nova-hero__meta>*{margin:0 .7em .3em 0;opacity:.8}.nova-hero__meta>.nova-badge{opacity:1}.nova-hero__descr{font-size:1.05em;line-height:1.45;opacity:.65;margin-bottom:1.2em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.nova-hero__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.nova-hero__hint{font-size:1em;line-height:1.5;opacity:.55;margin:0 0 0 1.3em;max-width:24em;padding:.1em .15em;overflow:hidden;white-space:nowrap;-o-text-overflow:ellipsis;text-overflow:ellipsis}.nova-hero__progress{position:relative;height:.3em;width:16em;max-width:100%;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.2);margin-top:.9em;overflow:hidden}.nova-hero__progress .time-line{display:block !important;height:100%;margin:0;background:none}.nova-hero__progress .time-line>div{height:100%;background:#fff}.nova-badge{display:inline-block;padding:.2em .55em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.18);font-size:.78em;font-weight:600;letter-spacing:.04em;line-height:1.4}.nova-btn{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em 1.5em;-webkit-border-radius:2.4em;border-radius:2.4em;background:rgba(255,255,255,.12);font-size:1.15em;white-space:nowrap;margin:0 .8em .5em 0}.nova-btn>svg{width:1.15em;height:1.15em;margin-right:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-btn.focus{background:#fff;color:#000}.nova-btn--main{background:rgba(255,255,255,.82);color:#000}.nova-btn--main.focus{background:#fff;-webkit-box-shadow:0 .25em .9em rgba(0,0,0,.45);box-shadow:0 .25em .9em rgba(0,0,0,.45)}.nova-btn--ghost{background:rgba(255,255,255,.14);font-size:1.05em}.nova-section{margin-bottom:1.1em}.nova-section__title{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:.95em;letter-spacing:.12em;text-transform:uppercase;opacity:.5;margin-bottom:.7em}.nova-section__title:before{content:\"\";display:inline-block;width:.25em;height:1.1em;background:currentColor;margin-right:.6em;-webkit-border-radius:.2em;border-radius:.2em}.nova-section__body{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.nova-chip{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.55em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .7em .7em 0;font-size:1.05em;white-space:nowrap;max-width:24em}.nova-chip.focus{background:#fff;color:#000}.nova-chip--active{background:rgba(255,255,255,.16);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}.nova-chip--active.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}.nova-chip__idx{font-size:.85em;opacity:.45;margin-right:.55em}.nova-chip__badge{font-size:.7em;font-weight:600;padding:.2em .45em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.2);margin-right:.6em;line-height:1.4}.nova-chip.focus .nova-chip__badge{background:rgba(0,0,0,.12)}.nova-chip--more{opacity:.75}.nova-chip__label{line-height:1.5;padding:.05em .1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis}.nova-chip>svg{width:1em;height:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-chip__label+svg{margin-left:.6em;opacity:.6}.nova-chip>svg:first-child{margin-right:.55em;opacity:.7}.nova-chip--source{font-size:1.15em;padding:.5em 1.1em}.nova-chip--ghost{opacity:.5}.nova-chip--busy .nova-chip__label{opacity:.5}.nova-chip__dot{width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;margin-left:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;background:#4ade80}.nova-chip--checking{opacity:.55}.nova-chip--empty{opacity:.35}.nova-toolbar{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;margin-bottom:1em}.nova-toolbar__label{font-size:.95em;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:0 .9em .7em 0}.nova-toolbar .nova-btn--main{margin:0 1.4em .7em 0;font-size:1.1em;padding:.55em 1.3em}.nova-toolbar .nova-btn__label{max-width:18em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap}.nova-card{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.05);margin-bottom:.7em}.nova-card.focus{background:#fff;color:#000}.nova-card__thumb{position:relative;width:10.5em;height:5.9em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;-webkit-border-radius:.5em;border-radius:.5em;overflow:hidden;background:rgba(0,0,0,.35)}.nova-card__thumb img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .3s;transition:opacity .3s}.nova-card__thumb--loaded img{opacity:1}.nova-card__num{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;font-size:1.7em;font-weight:600;color:#fff;text-shadow:0 .05em .2em rgba(0,0,0,.7)}.nova-card__thumb--loaded .nova-card__num{-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end;font-size:1.1em;padding:0 .5em .35em 0}.nova-card__thumb--fallback.nova-card__thumb--loaded img{opacity:.4}.nova-card__thumb--fallback.nova-card__thumb--loaded .nova-card__num{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:1.7em;padding:0}.nova-card__viewed{position:absolute;top:.5em;left:.5em;width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;background:#fff;opacity:.85;-webkit-box-shadow:0 0 0 .16em rgba(0,0,0,.4);box-shadow:0 0 0 .16em rgba(0,0,0,.4)}.nova-card__line{position:absolute;left:0;right:0;bottom:0;height:.28em;background:rgba(0,0,0,.5)}.nova-card__line .time-line{display:block !important;height:100%;margin:0;background:none}.nova-card__line .time-line>div{height:100%;background:#fff}.nova-card__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding:0 1.2em;min-width:1em;overflow:hidden}.nova-card__title{font-size:1.25em;line-height:1.4;margin-bottom:.3em;padding-bottom:.05em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.nova-card__meta{font-size:.95em;line-height:1.45;opacity:.6;padding-bottom:.05em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.nova-card__meta .nova-dot{margin:0 .5em;opacity:.6}.nova-card__match{display:inline-block;margin-top:.4em;padding:.15em .6em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(126,217,150,.2);color:#8fe0a4;font-size:.82em;font-weight:600}.nova-card--match .nova-card__thumb{-webkit-box-shadow:inset 0 0 0 .13em rgba(126,217,150,.75);box-shadow:inset 0 0 0 .13em rgba(126,217,150,.75)}.nova-card__side{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;text-align:right;padding-right:.7em}.nova-card__time{font-size:.95em;opacity:.6;margin-top:.4em}.nova-card--soon{opacity:.45}.nova-card--nav .nova-card__body{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.nova-card--nav .nova-card__body{-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.nova-card--nav .nova-card__title{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;margin-bottom:0}.nova-card--nav .nova-card__meta{width:100%;margin-top:.2em;font-size:.85em}.nova-card__go{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;opacity:.45;padding-left:1em}.nova-card__go>svg{width:1.2em;height:1.2em;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.nova-card--slim{padding:.75em 1.1em}.nova-card--slim .nova-card__thumb{display:none}.nova-card--slim .nova-card__body{padding-left:0}.nova-card--slim .nova-card__title{font-size:1.2em;margin-bottom:0}.nova-card__line--body{position:static;height:.25em;margin-top:.55em;-webkit-border-radius:.2em;border-radius:.2em;background:rgba(255,255,255,.18)}.nova-card.focus .nova-card__line--body{background:rgba(0,0,0,.16)}.nova-card.focus .nova-card__line--body .time-line>div{background:#000}.nova-card--slim .nova-card__line{position:static;height:.25em;margin-top:.5em;-webkit-border-radius:.2em;border-radius:.2em;background:rgba(255,255,255,.16)}.nova-card--slim.focus .nova-card__line{background:rgba(0,0,0,.15)}.nova-card--slim.focus .nova-card__line .time-line>div{background:#000}.nova-list-group{font-size:.9em;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:1.2em 0 .55em .2em}.nova-list-group:first-child{margin-top:0}.nova-card--file .nova-card__thumb{width:4.4em;height:4.4em}.nova-skeleton__row{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.04);margin-bottom:.7em;-webkit-animation:novapulse 1.4s infinite;animation:novapulse 1.4s infinite}.nova-skeleton__thumb{width:10.5em;height:5.9em;-webkit-border-radius:.5em;border-radius:.5em;background:rgba(255,255,255,.08);-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-skeleton__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding-left:1.2em}.nova-skeleton__line{height:1em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.08);margin-bottom:.7em}.nova-skeleton__line--short{width:35%;margin-bottom:0}@-webkit-keyframes novapulse{0%{opacity:.45}50%{opacity:1}100%{opacity:.45}}@keyframes novapulse{0%{opacity:.45}50%{opacity:1}100%{opacity:.45}}.nova-loading{padding:1.6em 1.8em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05);margin-bottom:1.2em}.nova-loading__title{font-size:1.4em;margin-bottom:.35em}.nova-loading__text{font-size:1.05em;opacity:.6;margin-bottom:1em}.nova-loading__bar{position:relative;height:.3em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.14);overflow:hidden}.nova-loading__bar>div{height:100%;width:0;background:#fff;-webkit-transition:width .4s;transition:width .4s}.nova-note{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:2em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05)}.nova-note__main{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;min-width:1em}.nova-note__text a{color:#fff;text-decoration:underline}.nova-note__text img{max-width:9em;height:auto;background:#fff;padding:.4em;-webkit-border-radius:.4em;border-radius:.4em;margin-top:.7em;opacity:1}.nova-note__text ul,.nova-note__text ol{margin:.5em 0;padding-left:1.2em}.nova-note__title{font-size:1.6em;margin-bottom:.4em;line-height:1.25}.nova-note__text{font-size:1.1em;color:rgba(255,255,255,.62);margin-bottom:1.3em;line-height:1.4}.nova-note__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.nova-note__timer{font-weight:600}.nova-group{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.5em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .7em .7em 0;font-size:1.1em;white-space:nowrap}.nova-group.focus{background:#fff;color:#000}.nova-group--open{background:rgba(255,255,255,.2);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}.nova-group--open.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}.nova-group__count{font-size:.78em;opacity:.55;margin-left:.6em}.nova-group__mark{width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;background:#fff;margin-right:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.nova-drop{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.3em 0 0 1em;margin:0 0 .7em .3em;-webkit-box-shadow:inset .16em 0 0 rgba(255,255,255,.18);box-shadow:inset .16em 0 0 rgba(255,255,255,.18)}.nova__list--grid{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:0 -.45em}.nova__list--grid .nova-card{display:block;width:25%;margin:0 0 1em 0;padding:0 .45em;background:none}.nova__list--grid .nova-card.focus{background:none;color:inherit}.nova__list--grid .nova-card__thumb{width:100%;height:0;padding-top:56%}.nova__list--grid .nova-card--file .nova-card__thumb{width:100%;height:0;padding-top:56%}.nova__list--grid .nova-card.focus .nova-card__thumb{-webkit-box-shadow:0 0 0 .2em #fff;box-shadow:0 0 0 .2em #fff}.nova__list--grid .nova-card__body{padding:.6em .1em 0 .1em}.nova__list--grid .nova-card__title{font-size:1.1em}.nova__list--grid .nova-card__side{position:absolute;top:.5em;right:.9em;text-align:right}.nova__list--grid .nova-card__time{display:none}.nova__list--grid .nova-card__num{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;padding:.4em 0 0 .55em;font-size:1.2em}.nova-hero__season{font-size:.95em;opacity:.55;margin-top:.8em}@media screen and (max-width:1200px){.nova__list--grid .nova-card{width:33.3333%}}@media screen and (max-width:580px){.nova__list--grid .nova-card{width:50%}.nova-hero__body{max-width:100%;padding:1.3em}.nova-hero__title{font-size:1.7em}.nova-hero__descr{display:none}.nova-hero__shade{background:-webkit-linear-gradient(top,rgba(10,11,17,.55) 0%,rgba(10,11,17,.94) 60%);background:linear-gradient(180deg,rgba(10,11,17,.55) 0%,rgba(10,11,17,.94) 60%)}.nova-card__thumb{width:7em;height:4.4em}.nova-card__side{display:none}.nova-chip{max-width:16em}}";

  var EXTRA_CSS = ".nova-skin-chips .explorer__files-head{display:none!important}.nova-skin-scope .online-prestige-watched{display:none!important}.nova-skin-scope .nova-head{margin-bottom:0}.nova-skin-scope .nova-card{display:-webkit-box!important;display:-webkit-flex!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center!important;background:rgba(255,255,255,.05)!important;padding:.7em!important;margin:0 0 .7em 0!important;-webkit-border-radius:.9em!important;border-radius:.9em!important}.nova-skin-scope .nova-card.focus{background:#fff!important;color:#000!important}.nova-skin-scope .nova-card.focus::after{display:none!important;content:none!important;border:0!important}.nova-skin-scope .nova-card+.nova-card{margin-top:0!important}.nova-skin-scope .nova-card__thumb{position:relative;width:10.5em!important;height:5.9em!important;min-height:0!important;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;-webkit-border-radius:.5em!important;border-radius:.5em!important;overflow:hidden!important;background:rgba(0,0,0,.35)}.nova-skin-scope .nova-card--file .nova-card__thumb{width:4.4em!important;height:4.4em!important}.nova-skin-scope .nova-card__thumb>img{-webkit-border-radius:0!important;border-radius:0!important}.nova-skin-scope .nova-card__num{font-size:1.7em!important}.nova-skin-scope .nova-card__thumb--loaded .nova-card__num{font-size:1.1em!important;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end!important;-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end!important;padding:0 .5em .35em 0!important}.nova-skin-scope .nova-card__line{position:absolute!important;left:.4em;right:.4em;bottom:.4em;margin:0!important}.nova-skin-scope .nova-card__line>.time-line{display:block!important}.nova-skin-scope .nova-card__viewed{top:.5em!important;left:.5em!important;width:.5em!important;height:.5em!important;padding:0!important;background:#fff!important;opacity:.85;-webkit-box-shadow:0 0 0 .16em rgba(0,0,0,.4);box-shadow:0 0 0 .16em rgba(0,0,0,.4)}.nova-skin-scope .nova-card__viewed>svg{display:none!important}.nova-skin-scope .nova-card__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;min-width:1em;padding:0 1.1em!important;line-height:1.3}.nova-skin-scope .nova-card__title{font-size:1.25em!important;margin-bottom:.25em!important;-webkit-line-clamp:1}.nova-skin-scope .nova-card__meta{display:-webkit-box!important;display:-webkit-flex!important;display:-ms-flexbox!important;display:flex!important;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center!important;font-size:.95em!important;opacity:.62;padding:0!important;margin:0!important}.nova-skin-scope .nova-card__meta>*{display:inline-block!important;overflow:visible!important;-webkit-line-clamp:none!important;margin:0!important;padding:0!important}.nova-skin-scope .nova-card__meta>.nova-dot{margin:0 .55em!important;font-size:.7em;opacity:.55}.nova-skin-scope .nova-card__side{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;padding:0 .5em 0 1em!important;text-align:right}.nova-skin-scope .nova-card__time{padding:0!important;font-size:.95em;opacity:.6;margin-top:.4em;white-space:nowrap}.nova-skin-scope .nova-card--slim{padding:.75em 1.1em!important}.nova-skin-scope .nova-card--slim .nova-card__body{padding:0!important}.nova-skin-scope .nova-card--slim .nova-card__title{margin-bottom:0!important}.nova-skin-scope .nova-hero__progress .time-line{display:block!important}.nova-skin-scope .nova__list--grid .nova-card{display:block!important;padding:0 .45em!important;margin:0 0 1em 0!important;background:none!important}.nova-skin-scope .nova__list--grid .nova-card.focus{background:none!important;color:inherit!important}.nova-skin-scope .nova__list--grid .nova-card__thumb,.nova-skin-scope .nova__list--grid .nova-card--file .nova-card__thumb{width:100%!important;height:0!important;padding-top:56%!important}.nova-skin-scope .nova__list--grid .nova-card__body{padding:.6em .1em 0 .1em!important}.nova-skin-scope .nova__list--grid .nova-card__side{position:absolute;top:.5em;right:.9em;padding:0!important}.nova-skin-scope .nova__list--grid .nova-card__time{display:none!important}";

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }
})();
