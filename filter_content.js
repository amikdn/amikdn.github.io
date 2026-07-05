(function() {
  'use strict';

  if (window.__content_filter_loaded) return;
  window.__content_filter_loaded = true;

  var state = { asian: false, language: false, quality: false, rating: false, history: false };

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

  function isSearchUrl(url) {
    if (!url) return false;
    var o = Lampa.TMDB ? Lampa.TMDB.origin('') : '';
    return url.indexOf(o) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
  }

  function init() {
    state.asian = Lampa.Storage.get('content_filter_asian', false);
    state.language = Lampa.Storage.get('content_filter_language', false);
    state.quality = Lampa.Storage.get('content_filter_quality', false);
    state.rating = Lampa.Storage.get('content_filter_rating', false);
    state.history = Lampa.Storage.get('content_filter_history', false);

    Lampa.Lang.add({
      content_filters: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
      cf_asian: { ru: 'Убрать азиатский контент', en: 'Remove Asian', uk: 'Прибрати азіатський' },
      cf_lang: { ru: 'Убрать контент на другом языке', en: 'Language Filter', uk: 'Мовний фільтр' },
      cf_quality: { ru: 'Убрать контент с качеством TS', en: 'Remove TS', uk: 'Прибрати TS' },
      cf_rating: { ru: 'Убрать низкорейтинговый контент', en: 'Rating Filter', uk: 'Рейтинговий фільтр' },
      cf_history: { ru: 'Убрать просмотренный контент', en: 'Watched Filter', uk: 'Переглянуте' }
    });

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { name: 'content_filters', type: 'object', default: true },
      field: { name: Lampa.Lang.translate('content_filters'), description: '' },
      onRender: function() {}
    });

    Lampa.SettingsApi.addParam({
      component: 'content_filters',
      param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('cf_asian'), description: '' },
      onChange: function(v) { state.asian = v; Lampa.Storage.set('content_filter_asian', v); }
    });

    Lampa.SettingsApi.addParam({
      component: 'content_filters',
      param: { name: 'language_filter_enabled', type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('cf_lang'), description: '' },
      onChange: function(v) { state.language = v; Lampa.Storage.set('content_filter_language', v); }
    });

    Lampa.SettingsApi.addParam({
      component: 'content_filters',
      param: { name: 'quality_filter_enabled', type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('cf_quality'), description: '' },
      onChange: function(v) { state.quality = v; Lampa.Storage.set('content_filter_quality', v); }
    });

    Lampa.SettingsApi.addParam({
      component: 'content_filters',
      param: { name: 'rating_filter_enabled', type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('cf_rating'), description: '' },
      onChange: function(v) { state.rating = v; Lampa.Storage.set('content_filter_rating', v); }
    });

    Lampa.SettingsApi.addParam({
      component: 'content_filters',
      param: { name: 'history_filter_enabled', type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('cf_history'), description: '' },
      onChange: function(v) { state.history = v; Lampa.Storage.set('content_filter_history', v); }
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

  if (window.appready) init();
  else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
})();
