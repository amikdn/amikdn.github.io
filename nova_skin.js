(function () {
  'use strict';

  if (window.nova_skin) return;
  window.nova_skin = true;

  var STORAGE_KEY = 'nova_skin_enabled';

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
      nova_ui_watch: { ru: '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c', en: 'Watch', uk: '\u0414\u0438\u0432\u0438\u0442\u0438\u0441\u044f' },
      nova_ui_continue: { ru: '\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c', en: 'Continue', uk: '\u041f\u0440\u043e\u0434\u043e\u0432\u0436\u0438\u0442\u0438' },
      nova_ui_next: { ru: '\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f', en: 'Next', uk: '\u041d\u0430\u0441\u0442\u0443\u043f\u043d\u0430' },
      nova_ui_source: { ru: '\u0418\u0421\u0422\u041e\u0427\u041d\u0418\u041a', en: 'SOURCE', uk: '\u0414\u0416\u0415\u0420\u0415\u041b\u041e' },
      nova_ui_filter: { ru: '\u0424\u0438\u043b\u044c\u0442\u0440', en: 'Filter', uk: '\u0424\u0456\u043b\u044c\u0442\u0440' },
      nova_ui_search: { ru: '\u0423\u0442\u043e\u0447\u043d\u0438\u0442\u044c', en: 'Clarify', uk: '\u0423\u0442\u043e\u0447\u043d\u0438\u0442\u0438' },
      nova_ui_list: { ru: '\u0421\u043f\u0438\u0441\u043e\u043a', en: 'List', uk: '\u0421\u043f\u0438\u0441\u043e\u043a' },
      nova_ui_grid: { ru: '\u041f\u043b\u0438\u0442\u043a\u0430', en: 'Grid', uk: '\u041f\u043b\u0438\u0442\u043a\u0430' },
      nova_ui_progress: { ru: '\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043e {seen} \u0438\u0437 {total}', en: 'Watched {seen} of {total}', uk: '\u041f\u0440\u043e\u0433\u043b\u044f\u043d\u0443\u0442\u043e {seen} \u0437 {total}' },
      nova_ui_left: { ru: '\u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c {left}', en: '{left} left', uk: '\u0437\u0430\u043b\u0438\u0448\u0438\u043b\u043e\u0441\u044c {left}' }
    });
  } catch (e) {}

  function T(key) {
    try {
      var value = Lampa.Lang.translate(key);
      return value === key ? '' : value;
    } catch (e) { return ''; }
  }

  var ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4" stroke-linecap="round"></path></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.6"></rect><rect x="13" y="3" width="8" height="8" rx="1.6"></rect><rect x="3" y="13" width="8" height="8" rx="1.6"></rect><rect x="13" y="13" width="8" height="8" rx="1.6"></rect></svg>',
    list: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1.4"></rect><rect x="3" y="10" width="18" height="4" rx="1.4"></rect><rect x="3" y="16" width="18" height="4" rx="1.4"></rect></svg>'
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

  function shortQuality(text) {
    var raw = ('' + (text == null ? '' : text)).toLowerCase();
    if (!raw) return '';
    if (raw.indexOf('4k') !== -1 || raw.indexOf('2160') !== -1 || raw.indexOf('uhd') !== -1) return '4K';
    var found = raw.match(/(\d{3,4})\s*[p\u0440]?/);
    if (found) return found[1] + 'p';
    if (raw.indexOf('fullhd') !== -1 || raw.indexOf('fhd') !== -1) return '1080p';
    if (raw.indexOf('hd') !== -1) return '720p';
    if (raw.indexOf('sd') !== -1) return '480p';
    return '';
  }

  function addCSS() {
    if (document.getElementById('nova-skin-css')) return;
    var style = document.createElement('style');
    style.id = 'nova-skin-css';
    style.textContent = SKIN_CSS + EXTRA_CSS;
    (document.body || document.head).appendChild(style);
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
    if (body.find('.nova__hero, .nova__list').length) return null;

    var files = body.find('.online-prestige--full');
    var folders = body.find('.online-prestige--folder');
    if (!files.length && !folders.length) return null;

    var movie = current.movie || current.card;
    if (!movie) return null;

    return {
      root: root,
      body: body,
      movie: movie,
      serial: !!(movie.name || movie.number_of_seasons),
      nav: !files.length && folders.length > 0
    };
  }

  function chosen(root, type) {
    var box = root.find('.filter--' + type).first();
    if (!box.length || box.hasClass('hide')) return '';
    var inner = box.children('div').first();
    if (!inner.length || inner.hasClass('hide')) return '';
    return (inner.text() || '').trim();
  }

  function openNative(root, type) {
    var box = root.find('.filter--' + type).first();
    if (!box.length) return false;
    try { box.trigger('hover:enter'); } catch (e) { return false; }
    return true;
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
      info: card.find('.online-prestige__info').text().trim(),
      time: card.find('.online-prestige__time').text().trim(),
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

  function seasonLabel(ctx) {
    var text = chosen(ctx.root, 'filter');
    if (!text) return '';
    var parts = text.split(',');
    for (var i = 0; i < parts.length; i++) {
      if (/\u0441\u0435\u0437\u043e\u043d|season/i.test(parts[i])) return parts[i];
    }
    return '';
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
      var descr = movie.overview || '';
      if (descr.length > 220) descr = descr.slice(0, 220) + '...';
      hero.find('.nova-hero__descr').text(descr);

      var meta = hero.find('.nova-hero__meta');
      var badge = shortQuality(target.quality);
      if (badge) meta.append('<div class="nova-badge">' + esc(badge) + '</div>');
      if (movie.vote_average) meta.append('<div>\u2605 ' + parseFloat(movie.vote_average + '').toFixed(1) + '</div>');
      var year = ((movie.release_date || movie.first_air_date || '') + '').slice(0, 4);
      if (year) meta.append('<div>' + esc(year) + '</div>');
      if (target.time) meta.append('<div>' + esc(target.time) + '</div>');
      var genres = [];
      (movie.genres || []).slice(0, 2).forEach(function (g) { if (g && g.name) genres.push(g.name); });
      if (genres.length) meta.append('<div>' + esc(genres.join(', ')) + '</div>');
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
    var label = T(started ? 'nova_ui_continue' : 'nova_ui_watch') || 'Watch';
    if (ctx.serial && target.num) {
      var season = digits(seasonLabel(ctx));
      label += ' \u00b7 ' + (season ? 'S' + season + ' ' : '') + 'E' + target.num;
    }

    var play = bind($('<div class="nova-btn nova-btn--main selector"></div>').append(ICON.play)
      .append($('<span class="nova-btn__label"></span>').text(label)), function () {
      target.el.trigger('hover:enter');
    });
    hero.find('.nova-hero__actions').prepend(play);

    if (ctx.serial && started) {
      var next = list[target.index + 1];
      if (next) {
        var next_label = (T('nova_ui_next') || 'Next') + ' \u00b7 E' + next.num;
        var next_btn = bind($('<div class="nova-btn nova-btn--ghost selector"></div>')
          .append($('<span class="nova-btn__label"></span>').text(next_label)), function () {
          next.el.trigger('hover:enter');
        });
        play.after(next_btn);
      }
    }

    var hint = [];
    var source = chosen(ctx.root, 'sort');
    if (source) hint.push(source);
    if (target.info && target.info !== target.title) hint.push(target.info.split('\u25cf')[0].trim());
    hero.find('.nova-hero__hint').text(hint.join(' \u00b7 '));

    if (target.percent > 0) {
      hero.find('.nova-hero__progress').show()
        .append('<div class="time-line"><div style="width:' + Math.min(100, target.percent) + '%"></div></div>');
    }

    if (ctx.serial && list.length > 1) {
      var seen = 0;
      list.forEach(function (item) {
        if (item.viewed || item.percent >= 90) seen++;
      });
      var text = (T('nova_ui_progress') || '{seen}/{total}')
        .replace('{seen}', seen).replace('{total}', list.length);
      if (seen < list.length) {
        text += ' \u00b7 ' + (T('nova_ui_left') || '{left}').replace('{left}', list.length - seen);
      }
      hero.find('.nova-hero__season').text(text).show();
    }

    return hero;
  }

  function chip(key, text, extra) {
    var box = $('<div class="nova-chip selector"></div>');
    box.attr('data-nova-chip', key);
    if (extra && extra.icon) box.append(extra.icon);
    if (extra && extra.badge) box.append($('<span class="nova-chip__badge"></span>').text(extra.badge));
    box.append($('<span class="nova-chip__label"></span>').text(text));
    if (!(extra && extra.plain)) box.append(ICON.chevron);
    if (extra && extra.active) box.addClass('nova-chip--active');
    if (key === 'source') box.addClass('nova-chip--source');
    return box;
  }

  function visible(root, type) {
    var box = root.find('.filter--' + type).first();
    return box.length && !box.hasClass('hide');
  }

  function buildToolbar(ctx, list) {
    var toolbar = $('<div class="nova-toolbar"></div>');
    var added = 0;

    if (visible(ctx.root, 'sort')) {
      var source = chosen(ctx.root, 'sort');
      toolbar.append($('<div class="nova-toolbar__label"></div>').text(T('nova_ui_source') || 'SOURCE'));
      toolbar.append(bind(chip('source', source || (T('nova_ui_source') || 'SOURCE'), { active: true }), function () {
        openNative(ctx.root, 'sort');
      }));
      added++;
    }

    var filters = chosen(ctx.root, 'filter');
    if (filters) {
      filters.split(',').forEach(function (part) {
        var text = part.trim();
        if (!text) return;
        var pair = text.split(':');
        var badge = pair.length > 1 ? pair[0].trim() : '';
        var value = pair.length > 1 ? pair.slice(1).join(':').trim() : text;
        toolbar.append(bind(chip('filter', value, { badge: badge }), function () {
          openNative(ctx.root, 'filter');
        }));
        added++;
      });
    } else if (visible(ctx.root, 'filter')) {
      toolbar.append(bind(chip('filter', T('nova_ui_filter') || 'Filter', {}), function () {
        openNative(ctx.root, 'filter');
      }));
      added++;
    }

    if (ctx.serial && !ctx.nav && list.length > 3) {
      var grid = viewMode() === 'grid';
      toolbar.append(bind(chip('view', T(grid ? 'nova_ui_grid' : 'nova_ui_list') || 'View', {
        icon: grid ? ICON.grid : ICON.list,
        plain: true
      }), function () {
        try { Lampa.Storage.set('nova_skin_view', grid ? 'list' : 'grid'); } catch (e) {}
        redraw();
      }));
      added++;
    }

    if (ctx.root.find('.filter--search').length) {
      var query = chosen(ctx.root, 'search');
      toolbar.append(bind(chip('search', query || (T('nova_ui_search') || 'Search'), {
        icon: ICON.search,
        plain: true
      }), function () {
        openNative(ctx.root, 'search');
      }));
      added++;
    }

    return added ? toolbar : null;
  }

  function decorateCards(ctx, list) {
    var grid = ctx.serial && !ctx.nav && viewMode() === 'grid' && list.length > 3;
    var fallback = heroArt(ctx.movie);

    list.forEach(function (item) {
      var card = item.el;
      if (card.hasClass('nova-card')) return;
      card.addClass('nova-card');
      if (!ctx.serial) card.addClass('nova-card--file');

      var thumb = card.find('.online-prestige__img').first();
      var body = card.find('.online-prestige__body').first();
      var title = card.find('.online-prestige__title').first();
      var info = card.find('.online-prestige__info').first();
      var quality = card.find('.online-prestige__quality').first();
      var timeline = card.find('.online-prestige__timeline').first();
      var number = card.find('.online-prestige__episode-number').first();
      var time = card.find('.online-prestige__time').first();

      if (thumb.length) {
        thumb.addClass('nova-card__thumb');
        var picture = thumb.find('img').first();
        if (picture.length) {
          if (!picture.attr('src') && fallback) {
            thumb.addClass('nova-card__thumb--fallback');
            picture.attr('src', fallback);
          }
          if (picture[0].complete && picture.attr('src')) thumb.addClass('nova-card__thumb--loaded');
          picture.on('load', function () { thumb.addClass('nova-card__thumb--loaded'); });
          picture.on('error', function () { thumb.removeClass('nova-card__thumb--fallback'); });
        }
        if (number.length) number.addClass('nova-card__num');
        if (timeline.length) timeline.addClass('nova-card__line').appendTo(thumb);
        if (item.viewed) card.find('.online-prestige__viewed').addClass('nova-card__viewed').empty();
      }

      if (body.length) {
        body.addClass('nova-card__body');
        if (title.length) title.addClass('nova-card__title');
        if (info.length) {
          info.addClass('nova-card__meta');
          info.find('.online-prestige-split').replaceWith('<span class="nova-dot">\u25cf</span>');
        }
      }

      var side = $('<div class="nova-card__side"></div>');
      var badge = shortQuality(item.quality);
      if (badge) side.append($('<div class="nova-badge"></div>').text(badge));
      if (item.time) side.append($('<div class="nova-card__time"></div>').text(item.time));
      if (side.children().length) card.append(side);
      if (quality.length) quality.remove();
      if (time.length) time.remove();

      card.on('hover:focus', function (e) { novaScroll(e.target); });
    });

    ctx.body.find('.online-prestige--folder').each(function () {
      var folder = $(this);
      if (folder.hasClass('nova-card')) return;
      folder.addClass('nova-card nova-card--nav nova-card--slim');
      folder.find('.online-prestige__folder').remove();
      folder.find('.online-prestige__body').addClass('nova-card__body');
      folder.find('.online-prestige__title').addClass('nova-card__title');
      folder.find('.online-prestige__info').addClass('nova-card__meta');
      if (!folder.find('.nova-card__go').length) {
        folder.find('.online-prestige__body').append('<div class="nova-card__go">' + ICON.chevron + '</div>');
      }
      folder.on('hover:focus', function (e) { novaScroll(e.target); });
    });

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
      chosen(ctx.root, 'sort'),
      chosen(ctx.root, 'filter'),
      viewMode(),
      list.length ? list[0].title : ''
    ].join('|');
  }

  function draw() {
    if (!enabled()) return;
    var ctx = context();
    if (!ctx) return;

    var list = collect(ctx);
    decorateCards(ctx, list);

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
    var toolbar = buildToolbar(ctx, list);
    if (toolbar) head.append(toolbar);

    if (!head.children().length) {
      busy = false;
      return;
    }

    ctx.body.prepend(head);
    if (toolbar) ctx.root.addClass('nova-skin-scope');

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
        icon: '<svg height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="15" stroke="white" stroke-width="2.5"/><path d="M14 12l10 6-10 6V12z" fill="white"/></svg>',
        name: 'Nova Skin'
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: STORAGE_KEY, type: 'trigger', default: true },
        field: { name: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c Nova Skin', description: '\u041d\u043e\u0432\u044b\u0439 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0434\u043b\u044f \u0432\u0441\u0435\u0445 \u043e\u043d\u043b\u0430\u0439\u043d-\u043f\u043b\u0430\u0433\u0438\u043d\u043e\u0432' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero', type: 'trigger', default: true },
        field: { name: '\u0428\u0430\u043f\u043a\u0430 \u0441 \u043a\u043d\u043e\u043f\u043a\u043e\u0439', description: '\u041a\u0430\u0434\u0440, \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0435\u043d\u0438\u044f \u0441\u0432\u0435\u0440\u0445\u0443' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero_art', type: 'trigger', default: true },
        field: { name: '\u041a\u0430\u0434\u0440 \u0432 \u0448\u0430\u043f\u043a\u0435', description: '\u0412\u044b\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0434\u043b\u044f \u043a\u043e\u043c\u043f\u0430\u043a\u0442\u043d\u043e\u0439 \u0448\u0430\u043f\u043a\u0438 \u0431\u0435\u0437 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0438' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_view', type: 'select', values: { list: '\u0421\u043f\u0438\u0441\u043e\u043a', grid: '\u041f\u043b\u0438\u0442\u043a\u0430' }, default: 'list' },
        field: { name: '\u0412\u0438\u0434 \u0441\u0435\u0440\u0438\u0439', description: '\u0421\u043f\u0438\u0441\u043e\u043a \u0438\u043b\u0438 \u043f\u043b\u0438\u0442\u043a\u0430 (4 \u0432 \u0440\u044f\u0434)' },
        onChange: function () { try { Lampa.Activity.replace(); } catch (e) {} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_quality', type: 'select', values: { auto: '\u0410\u0432\u0442\u043e', 2160: '4K', 1080: '1080p', 720: '720p', 480: '480p' }, default: 'auto' },
        field: { name: '\u041a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e', description: '\u041f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u0432\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u0435\u0434\u0435\u043d\u0438\u044f' }
      });
    } catch (e) {}
  }

  function start() {
    addCSS();
    settings();
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

  var EXTRA_CSS = ".nova-skin-scope .explorer__files-head{display:none!important}.nova-skin-scope .explorer__left{display:none!important}.nova-skin-scope .explorer__files{width:100%!important;left:0!important}.nova-skin-scope .online-prestige-watched{display:none!important}.nova-skin-scope .online-prestige.focus::after{display:none!important}.nova-skin-scope .online-prestige+.online-prestige{margin-top:0!important}.nova-skin-scope .torrent-list{padding:0!important}.nova-skin-scope .online-prestige{background:none!important;-webkit-border-radius:0;border-radius:0}.nova-skin-scope .online-prestige__loader{display:none!important}.nova-skin-scope .nova-head{margin-bottom:.2em}.nova-skin-scope .nova-card{background:rgba(255,255,255,.05)!important;padding:.7em!important;margin-bottom:.7em!important;-webkit-border-radius:.9em!important;border-radius:.9em!important}.nova-skin-scope .nova-card.focus{background:#fff!important;color:#000!important}.nova-skin-scope .nova-card__thumb{width:10.5em!important;height:5.9em!important;min-height:0!important;-webkit-border-radius:.5em!important;border-radius:.5em!important;overflow:hidden}.nova-skin-scope .nova-card--file .nova-card__thumb{width:4.4em!important;height:4.4em!important}.nova-skin-scope .nova-card__thumb>img{-webkit-border-radius:0!important;border-radius:0!important}.nova-skin-scope .nova-card__body{padding:0 1.1em!important;line-height:1.3}.nova-skin-scope .nova-card__title{font-size:1.25em!important;margin-bottom:.25em}.nova-skin-scope .nova-card__meta{font-size:.95em;opacity:.62}.nova-skin-scope .nova-card__meta>*{-webkit-line-clamp:1}.nova-skin-scope .nova-card__num{font-size:1.1em!important}.nova-skin-scope .nova-card__thumb--loaded .nova-card__num{font-size:1.1em!important}.nova-skin-scope .nova-card__line{margin:0!important}.nova-skin-scope .nova-card__viewed{padding:0!important;background:#fff!important;width:.5em;height:.5em}.nova-skin-scope .nova-card__viewed>svg{display:none}.nova-skin-scope .nova-card__side{padding-left:1em;text-align:right}.nova-skin-scope .nova-card__time{padding-left:0!important;font-size:.95em;opacity:.6;margin-top:.35em}.nova-skin-scope .nova-card--slim .nova-card__body{padding-left:0!important}.nova-skin-scope .nova-hero__progress .time-line{display:block!important}.nova-skin-scope .nova__list--grid .nova-card__thumb{width:100%!important;height:0!important;padding-top:56%}.nova-skin-scope .nova__list--grid .nova-card--file .nova-card__thumb{width:100%!important;height:0!important;padding-top:56%}";

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }
})();
