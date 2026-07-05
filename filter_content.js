(function() {
  'use strict';

  if (window.__filter_content_loaded) return;
  window.__filter_content_loaded = true;

  var state = { asian: false, language: false, quality: false, rating: false, history: false };

  function load() {
    state.asian = Lampa.Storage.get('filter_asian', false);
    state.language = Lampa.Storage.get('filter_language', false);
    state.quality = Lampa.Storage.get('filter_quality', false);
    state.rating = Lampa.Storage.get('filter_rating', false);
    state.history = Lampa.Storage.get('filter_history', false);
  }

  function applyFilters(items) {
    var r = Lampa.Arrays.clone(items);
    if (state.asian) r = r.filter(function(i) {
      if (!i || !i.original_language) return true;
      return ['ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur','pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az','kk','ky','tg','tk','uz'].indexOf(i.original_language.toLowerCase()) === -1;
    });
    if (state.language) r = r.filter(function(i) {
      if (!i) return true;
      var def = Lampa.Storage.get('language');
      if (i.original_language === def) return true;
      return (i.original_title || i.original_name) !== (i.title || i.name);
    });
    if (state.rating) r = r.filter(function(i) { return !i || (i.vote_average && i.vote_average >= 6); });
    if (state.history) r = r.filter(function(i) {
      if (!i || !i.original_language) return true;
      var type = i.media_type || (i.seasons ? 'tv' : 'movie');
      var fav = Lampa.Favorite.check(i);
      if (!fav || !fav.favorite || fav.timetable) return true;
      if (type === 'movie') return false;
      var hist = JSON.parse(Lampa.Storage.get('history', '{}'));
      var cache = Lampa.Storage.get('cache', 300, []);
      var card = (hist.card || []).filter(function(x) { return x.id === i.id && x.seasons && x.seasons.length; })[0];
      if (!card) return true;
      var eps = [];
      card.seasons.forEach(function(s) {
        if (s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date())
          for (var e = 1; e <= s.episode_count; e++) eps.push({s: s.season_number, e: e});
      });
      var epData = (cache.filter(function(x) { return x.id === i.id; })[0] || {});
      (epData.episodes || []).forEach(function(ep) {
        if (ep.episode_number > 0 && ep.air_date && new Date(ep.air_date) < new Date())
          eps.push({s: ep.season_number || 1, e: ep.episode_number});
      });
      var uniq = [];
      eps.forEach(function(e) { if (!uniq.some(function(u) { return u.s === e.s && u.e === e.e; })) uniq.push(e); });
      if (!uniq.length) return true;
      for (var n = 0; n < uniq.length; n++) {
        var key = [uniq[n].s, uniq[n].s > 10 ? ':' : '', uniq[n].e, i.original_title || i.original_name].join('');
        if (Lampa.Storage.get(Lampa.Utils.hash(key)).percent === 0) return false;
      }
      return true;
    });
    return r;
  }

  function hasMore(data) {
    return !!data && Array.isArray(data.results) && data.original_length !== data.results.length && data.page === 1 && !!data.total_pages && data.total_pages > 1;
  }

  function findParent(el, sel) {
    while (el && el !== document) {
      if (el.matches && el.matches(sel)) return el;
      if (el.msMatchesSelector && el.msMatchesSelector(sel)) return el;
      if (el.webkitMatchesSelector && el.webkitMatchesSelector(sel)) return el;
      if (el.mozMatchesSelector && el.mozMatchesSelector(sel)) return el;
      if (el.oMatchesSelector && el.oMatchesSelector(sel)) return el;
      if (el.className && el.className.indexOf(sel.replace('.','')) !== -1) return el;
      el = el.parentElement || el.parentNode;
    }
    return null;
  }

  function init() {
    load();

    Lampa.Lang.add({
      filter_title: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
      filter_asian: { ru: 'Убрать азиатский', en: 'Remove Asian', uk: 'Прибрати азіатський' },
      filter_lang: { ru: 'Контент на другом языке', en: 'Language Filter', uk: 'Мовний фільтр' },
      filter_quality: { ru: 'Убрать TS', en: 'Remove TS', uk: 'Прибрати TS' },
      filter_rating: { ru: 'Рейтинг ниже 6.0', en: 'Rating below 6.0', uk: 'Рейтинг нижче 6.0' },
      filter_history: { ru: 'Просмотренное', en: 'Watched', uk: 'Переглянуте' }
    });

    function addSettings() {
      if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) {
        setTimeout(addSettings, 500);
        return;
      }
      if (!window.__filter_ready) {
        window.__filter_ready = true;
        Lampa.SettingsApi.addComponent({
          component: 'filter_content',
          name: Lampa.Lang.translate('filter_title'),
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
        });
      }
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_asian', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('filter_asian'), description: '' }, onChange: function(v) { state.asian = v; Lampa.Storage.set('filter_asian', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_language', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('filter_lang'), description: '' }, onChange: function(v) { state.language = v; Lampa.Storage.set('filter_language', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_quality', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('filter_quality'), description: '' }, onChange: function(v) { state.quality = v; Lampa.Storage.set('filter_quality', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_rating', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('filter_rating'), description: '' }, onChange: function(v) { state.rating = v; Lampa.Storage.set('filter_rating', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_history', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('filter_history'), description: '' }, onChange: function(v) { state.history = v; Lampa.Storage.set('filter_history', v); } });
    }

    addSettings();

    Lampa.Listener.follow('build', function(e) {
      try {
        if (e.type !== 'build' || !state.quality || !e.data || !e.data.object || !e.data.object.build) return;
        setTimeout(function() {
          var el = e.data.object.build.querySelector('.card__quality div');
          if (el && el.textContent.trim().toUpperCase() === 'TS')
            e.data.object.build.style.display = 'none';
        }, 0);
      } catch(e) {}
    });

    Lampa.Listener.follow('line', function(e) {
      try {
        if (e.type !== 'visible' || !hasMore(e.data)) return;
        var line = $(findParent(e.body, '.items-line'));
        var head = line.find('.items-line__head');
        if (head.find('.items-line__more').length) return;
        var btn = document.createElement('div');
        btn.classList.add('items-line__more', 'selector');
        btn.innerText = Lampa.Lang.translate('more');
        btn.addEventListener('hover:enter', function() {
          Lampa.Activity.push({
            url: e.data.url,
            title: e.data.title_category || Lampa.Lang.translate('search'),
            component: 'category_full',
            page: 1,
            genres: e.params ? e.params.genres : null,
            filter: e.data.filter,
            source: e.data.source || (e.params && e.params.origin ? e.params.origin.source : null)
          });
        });
        head.append(btn);
      } catch(e) {}
    });

    Lampa.Listener.follow('line', function(e) {
      try {
        if (e.type !== 'append' || !hasMore(e.data)) return;
        if (e.items && e.items.length === e.data.results.length) {
          Lampa.Controller.collectionAppend(e.line) && Lampa.Controller.send(e.line.more());
        }
      } catch(e) {}
    });

    Lampa.Listener.follow('request_secuses', function(e) {
      try {
        if (e.data && Array.isArray(e.data.results)) {
          e.data.original_length = e.data.results.length;
          e.data.results = applyFilters(e.data.results);
        }
      } catch(e) {}
    });
  }

  if (window.appready) init();
  else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
})();
