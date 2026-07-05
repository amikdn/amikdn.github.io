(function() {
  'use strict';
  if (window.__fc) return;
  window.__fc = true;

  var state = { asian: false, language: false, quality: false, rating: false, history: false };

  function load() {
    state.asian = Lampa.Storage.get('filter_asian', false);
    state.language = Lampa.Storage.get('filter_language', false);
    state.quality = Lampa.Storage.get('filter_quality', false);
    state.rating = Lampa.Storage.get('filter_rating', false);
    state.history = Lampa.Storage.get('filter_history', false);
  }

  function filter(items) {
    var r = Lampa.Arrays.clone(items);
    if (state.asian) r = r.filter(function(i) {
      if (!i || !i.original_language) return true;
      return ['ja','ko','zh','th','vi','hi','ta','te','ml','kn','bn','ur','pa','gu','mr','ne','si','my','km','lo','mn','ka','hy','az','kk','ky','tg','tk','uz'].indexOf(i.original_language.toLowerCase()) === -1;
    });
    if (state.language) r = r.filter(function(i) {
      if (!i) return true;
      var d = Lampa.Storage.get('language');
      if (i.original_language === d) return true;
      return (i.original_title || i.original_name) !== (i.title || i.name);
    });
    if (state.rating) r = r.filter(function(i) { return !i || (i.vote_average && i.vote_average >= 6); });
    if (state.history) r = r.filter(function(i) {
      if (!i || !i.original_language) return true;
      var t = i.media_type || (i.seasons ? 'tv' : 'movie');
      var f = Lampa.Favorite.check(i);
      if (!f || !f.favorite || f.timetable) return true;
      if (t === 'movie') return false;
      var h = JSON.parse(Lampa.Storage.get('history', '{}'));
      var c = Lampa.Storage.get('cache', 300, []);
      var card = (h.card || []).filter(function(x) { return x.id === i.id && x.seasons && x.seasons.length; })[0];
      if (!card) return true;
      var eps = [];
      card.seasons.forEach(function(s) {
        if (s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date())
          for (var e = 1; e <= s.episode_count; e++) eps.push({s: s.season_number, e: e});
      });
      var ed = (c.filter(function(x) { return x.id === i.id; })[0] || {});
      (ed.episodes || []).forEach(function(ep) {
        if (ep.episode_number > 0 && ep.air_date && new Date(ep.air_date) < new Date())
          eps.push({s: ep.season_number || 1, e: ep.episode_number});
      });
      var uq = [];
      eps.forEach(function(e) { if (!uq.some(function(u) { return u.s === e.s && u.e === e.e; })) uq.push(e); });
      if (!uq.length) return true;
      for (var n = 0; n < uq.length; n++) {
        var k = [uq[n].s, uq[n].s > 10 ? ':' : '', uq[n].e, i.original_title || i.original_name].join('');
        if (Lampa.Storage.get(Lampa.Utils.hash(k)).percent === 0) return false;
      }
      return true;
    });
    return r;
  }

  function init() {
    load();
    Lampa.Lang.add({
      flt: { ru: 'Фильтр контента', en: 'Content Filter', uk: 'Фільтр контенту' },
      flt_a: { ru: 'Убрать азиатский', en: 'Remove Asian', uk: 'Прибрати азіатський' },
      flt_l: { ru: 'Контент на другом языке', en: 'Language Filter', uk: 'Мовний фільтр' },
      flt_q: { ru: 'Убрать TS', en: 'Remove TS', uk: 'Прибрати TS' },
      flt_r: { ru: 'Рейтинг ниже 6.0', en: 'Rating below 6.0', uk: 'Рейтинг нижче 6.0' },
      flt_h: { ru: 'Просмотренное', en: 'Watched', uk: 'Переглянуте' }
    });

    function addS() {
      if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) { setTimeout(addS, 500); return; }
      if (!window.__fc_s) {
        window.__fc_s = true;
        Lampa.SettingsApi.addComponent({ component: 'filter_content', name: Lampa.Lang.translate('flt'),
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' });
      }
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_asian', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('flt_a'), description: '' }, onChange: function(v) { state.asian = v; Lampa.Storage.set('filter_asian', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_language', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('flt_l'), description: '' }, onChange: function(v) { state.language = v; Lampa.Storage.set('filter_language', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_quality', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('flt_q'), description: '' }, onChange: function(v) { state.quality = v; Lampa.Storage.set('filter_quality', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_rating', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('flt_r'), description: '' }, onChange: function(v) { state.rating = v; Lampa.Storage.set('filter_rating', v); } });
      Lampa.SettingsApi.addParam({ component: 'filter_content', param: { name: 'filter_history', type: 'trigger', default: false }, field: { name: Lampa.Lang.translate('flt_h'), description: '' }, onChange: function(v) { state.history = v; Lampa.Storage.set('filter_history', v); } });
    }
    addS();

    Lampa.Listener.follow('build', function(e) {
      try {
        if (e.type !== 'build' || !state.quality || !e.data || !e.data.object || !e.data.object.build) return;
        setTimeout(function() {
          var el = e.data.object.build.querySelector('.card__quality div');
          if (el && el.textContent.trim().toUpperCase() === 'TS') e.data.object.build.style.display = 'none';
        }, 0);
      } catch(e) {}
    });

    Lampa.Listener.follow('request_secuses', function(e) {
      try {
        if (e.data && Array.isArray(e.data.results)) {
          e.data.original_length = e.data.results.length;
          e.data.results = filter(e.data.results);
        }
      } catch(e) {}
    });
  }

  if (window.appready) init();
  else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
})();
