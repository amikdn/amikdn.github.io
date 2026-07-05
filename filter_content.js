(function() {
  'use strict';

  if (window.__content_filter_loaded) return;
  window.__content_filter_loaded = true;

  var state = { asian: false, language: false, quality: false, rating: false, history: false };

  function applyFilters(items) {
    var r = Lampa.Arrays.clone(items);
    if (state.asian) r = filterAsian(r);
    if (state.language) r = filterLanguage(r);
    if (state.rating) r = filterRating(r);
    if (state.history) r = filterHistory(r);
    return r;
  }

  function filterAsian(items) {
    var langs = ['ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur','pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az','kk','ky','tg','tk','uz'];
    return items.filter(function(i) { return !i || !i.original_language || langs.indexOf(i.original_language.toLowerCase()) === -1; });
  }

  function filterLanguage(items) {
    var def = Lampa.Storage.get('language');
    return items.filter(function(i) {
      if (!i) return true;
      if (i.original_language === def) return true;
      return (i.original_title || i.original_name) !== (i.title || i.name);
    });
  }

  function filterRating(items) {
    return items.filter(function(i) { return !i || (i.vote_average && i.vote_average >= 6); });
  }

  function filterHistory(items) {
    var hist = JSON.parse(Lampa.Storage.get('history', '{}'));
    var cache = Lampa.Storage.get('cache', 300, []);
    return items.filter(function(i) {
      if (!i || !i.original_language) return true;
      var type = i.media_type || (i.seasons ? 'tv' : 'movie');
      var fav = Lampa.Favorite.check(i);
      if (!fav || !fav.favorite) return true;
      if (type === 'movie') return false;
      if (fav.timetable) return false;
      var watched = getWatched(i.id, hist, cache);
      return !isWatched(i.original_title || i.original_name, watched);
    });

    function getWatched(id, h, c) {
      var card = (h.card || []).filter(function(x) { return x.id === id && x.seasons && x.seasons.length; })[0];
      if (!card) return [];
      var eps = [];
      card.seasons.forEach(function(s) {
        if (s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date())
          for (var e = 1; e <= s.episode_count; e++) eps.push({s: s.season_number, e: e});
      });
      var epData = (c.filter(function(x) { return x.id === id; })[0] || {});
      if (epData.episodes) epData.episodes.forEach(function(ep) {
        if (ep.episode_number > 0 && ep.air_date && new Date(ep.air_date) < new Date())
          eps.push({s: ep.season_number || 1, e: ep.episode_number});
      });
      var uniq = [];
      eps.forEach(function(e) { if (!uniq.some(function(u) { return u.s === e.s && u.e === e.e; })) uniq.push(e); });
      return uniq;
    }

    function isWatched(title, watched) {
      if (!watched || !watched.length) return false;
      for (var i = 0; i < watched.length; i++) {
        var key = [watched[i].s, watched[i].s > 10 ? ':' : '', watched[i].e, title].join('');
        if (Lampa.Storage.get(Lampa.Utils.hash(key)).percent === 0) return false;
      }
      return true;
    }
  }

  function isSearchUrl(url) {
    var origin = Lampa.TMDB ? Lampa.TMDB.origin('') : '';
    return url.indexOf(origin) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
  }

  function init() {
    state.asian = Lampa.Storage.get('content_filter_asian', false);
    state.language = Lampa.Storage.get('content_filter_language', false);
    state.quality = Lampa.Storage.get('content_filter_quality', false);
    state.rating = Lampa.Storage.get('content_filter_rating', false);
    state.history = Lampa.Storage.get('content_filter_history', false);

    Lampa.Lang.add({
      content_filter: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
      cf_asian: { ru: 'Убрать азиатский', en: 'Remove Asian', uk: 'Прибрати азіатський' },
      cf_lang: { ru: 'Убрать контент на другом языке', en: 'Language Filter', uk: 'Мовний фільтр' },
      cf_quality: { ru: 'Убрать TS качество', en: 'Remove TS', uk: 'Прибрати TS' },
      cf_rating: { ru: 'Рейтинг ниже 6.0', en: 'Rating below 6.0', uk: 'Рейтинг нижче 6.0' },
      cf_history: { ru: 'Просмотренное', en: 'Watched', uk: 'Переглянуте' }
    });

    Lampa.Settings.add('content_filter', {
      component: 'content_filter',
      name: Lampa.Lang.translate('content_filter'),
      items: [
        { name: Lampa.Lang.translate('cf_asian'), type: 'trigger', field: 'content_filter_asian', default: false },
        { name: Lampa.Lang.translate('cf_lang'), type: 'trigger', field: 'content_filter_language', default: false },
        { name: Lampa.Lang.translate('cf_quality'), type: 'trigger', field: 'content_filter_quality', default: false },
        { name: Lampa.Lang.translate('cf_rating'), type: 'trigger', field: 'content_filter_rating', default: false },
        { name: Lampa.Lang.translate('cf_history'), type: 'trigger', field: 'content_filter_history', default: false }
      ]
    });

    Lampa.Component.add('content_filter', function(object) {
      this.create = function() {
        object.append($('<div class="content-filter__wrap"></div>'));
      };
      this.start = function() { Lampa.Controller.enable('content_filter'); };
      this.destroy = function() {};
    });

    Lampa.Storage.listener.follow('change', function(e) {
      if (!e.key || e.key.indexOf('content_filter_') !== 0) return;
      state.asian = Lampa.Storage.get('content_filter_asian', false);
      state.language = Lampa.Storage.get('content_filter_language', false);
      state.quality = Lampa.Storage.get('content_filter_quality', false);
      state.rating = Lampa.Storage.get('content_filter_rating', false);
      state.history = Lampa.Storage.get('content_filter_history', false);
    });

    Lampa.Listener.follow('build', function(e) {
      if (e.type !== 'build' || !state.quality || !e.data || !e.data.object || !e.data.object.build) return;
      setTimeout(function() {
        var el = e.data.object.build.querySelector('.card__quality div');
        if (el && el.textContent.trim().toUpperCase() === 'TS')
          e.data.object.build.style.display = 'none';
      }, 0);
    });

    Lampa.Listener.follow('request_secuses', function(e) {
      if (e.params && e.params.url && isSearchUrl(e.params.url) && e.data && Array.isArray(e.data.results)) {
        e.data.original_length = e.data.results.length;
        e.data.results = applyFilters(e.data.results);
      }
    });
  }

  if (typeof Lampa !== 'undefined' && Lampa.Listener) {
    if (window.appready) init();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      var check = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Listener) {
          clearInterval(check);
          if (window.appready) init();
          else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
        }
      }, 100);
    });
  }
})();
