(function() {
  'use strict';

  if (window.__cf_loaded) return;
  window.__cf_loaded = true;

  var state = { asian: false, language: false, quality: false, rating: false, history: false };

  function loadState() {
    state.asian = Lampa.Storage.get('cf_asian', false);
    state.language = Lampa.Storage.get('cf_language', false);
    state.quality = Lampa.Storage.get('cf_quality', false);
    state.rating = Lampa.Storage.get('cf_rating', false);
    state.history = Lampa.Storage.get('cf_history', false);
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

  function isSearch(url) {
    if (!url) return false;
    var o = (Lampa.TMDB && typeof Lampa.TMDB.origin === 'function') ? Lampa.TMDB.origin('') : (Lampa.Manifest ? Lampa.Manifest.url : '');
    return url.indexOf(o) > -1 && url.indexOf('/search') === -1 && url.indexOf('/person/') === -1;
  }

  function init() {
    loadState();

    Lampa.Lang.add({
      cf_title: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
      cf_asian: { ru: 'Убрать азиатский', en: 'Remove Asian', uk: 'Прибрати азіатський' },
      cf_lang: { ru: 'Контент на другом языке', en: 'Language Filter', uk: 'Мовний фільтр' },
      cf_quality: { ru: 'Убрать качество TS', en: 'Remove TS', uk: 'Прибрати TS' },
      cf_rating: { ru: 'Рейтинг ниже 6.0', en: 'Rating below 6.0', uk: 'Рейтинг нижче 6.0' },
      cf_history: { ru: 'Просмотренное', en: 'Watched', uk: 'Переглянуте' }
    });

    var items = [
      { name: Lampa.Lang.translate('cf_asian'), type: 'trigger', field: 'cf_asian', default: false, onChange: function(v) { state.asian = v; Lampa.Storage.set('cf_asian', v); } },
      { name: Lampa.Lang.translate('cf_lang'), type: 'trigger', field: 'cf_language', default: false, onChange: function(v) { state.language = v; Lampa.Storage.set('cf_language', v); } },
      { name: Lampa.Lang.translate('cf_quality'), type: 'trigger', field: 'cf_quality', default: false, onChange: function(v) { state.quality = v; Lampa.Storage.set('cf_quality', v); } },
      { name: Lampa.Lang.translate('cf_rating'), type: 'trigger', field: 'cf_rating', default: false, onChange: function(v) { state.rating = v; Lampa.Storage.set('cf_rating', v); } },
      { name: Lampa.Lang.translate('cf_history'), type: 'trigger', field: 'cf_history', default: false, onChange: function(v) { state.history = v; Lampa.Storage.set('cf_history', v); } }
    ];

    if (typeof Lampa.Settings.open === 'function') {
      var folder = $('<div class="settings-folder selector" data-component="cf_settings" data-static="true">' +
        '<div class="settings-folder__icon">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' +
        '</div>' +
        '<div class="settings-folder__name">' + Lampa.Lang.translate('cf_title') + '</div>' +
        '</div>');

      Lampa.Settings.main().render().find('[data-component="more"]').after(folder);
      Lampa.Settings.main().update();

      Lampa.Settings.listener.follow('open', function(e) {
        if (e.name == 'main') {
          e.body.find('[data-component="cf_settings"]').on('hover:enter', function() {
            Lampa.Settings.open('cf_settings', { name: Lampa.Lang.translate('cf_title'), items: items });
          });
        }
      });
    } else {
      // Fallback: add via SettingsApi
      if (typeof Lampa.SettingsApi !== 'undefined' && Lampa.SettingsApi.addParam) {
        Lampa.SettingsApi.addParam({
          component: 'interface',
          param: { name: 'cf_settings', type: 'object', default: true },
          field: { name: Lampa.Lang.translate('cf_title'), description: '' },
          onRender: function() {}
        });
        items.forEach(function(it) {
          Lampa.SettingsApi.addParam({
            component: 'cf_settings',
            param: { name: it.field, type: 'trigger', default: false },
            field: { name: it.name, description: '' },
            onChange: it.onChange
          });
        });
      }
    }

    Lampa.Listener.follow('build', function(e) {
      if (e.type !== 'build' || !state.quality || !e.data || !e.data.object || !e.data.object.build) return;
      setTimeout(function() {
        var el = e.data.object.build.querySelector('.card__quality div');
        if (el && el.textContent.trim().toUpperCase() === 'TS')
          e.data.object.build.style.display = 'none';
      }, 0);
    });

    Lampa.Listener.follow('request_secuses', function(e) {
      if (e.params && e.params.url && isSearch(e.params.url) && e.data && Array.isArray(e.data.results)) {
        e.data.original_length = e.data.results.length;
        e.data.results = applyFilters(e.data.results);
      }
    });
  }

  if (window.appready) init();
  else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
})();
