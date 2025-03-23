(function() {
  'use strict';

  var Defined = { api: 'lampac', localhost: 'https://lam.akter-black.com/', apn: '' };
  var unic_id = Lampa.Storage.get('lampac_unic_id', '');
  if (!unic_id) { unic_id = Lampa.Utils.uid(8).toLowerCase(); Lampa.Storage.set('lampac_unic_id', unic_id); }
  if (!window.rch) { Lampa.Utils.putScript(["https://abmsx.tech/invc-rch.js"], function() {}, false, function() { if (!window.rch.startTypeInvoke) window.rch.typeInvoke('https://abmsx.tech', function() {}); }, true); }

  function BlazorNet() {
    this.net = new Lampa.Reguest();
    this.timeout = function(time) { this.net.timeout(time); };
    this.req = function(type, url, success, error, post, params = {}) {
      var path = url.split(Defined.localhost).pop().split('?');
      if (path[0].indexOf('http') >= 0) return this.net[type](url, success, error, post, params);
      DotNet.invokeMethodAsync("JinEnergy", path[0], path[1]).then(function(result) {
        if (params.dataType === 'text') success(result); else success(Lampa.Arrays.decodeJson(result, {}));
      }).catch(function(e) { console.log('Blazor', 'error:', e); error(e); });
    };
    this.silent = function(url, success, error, post, params = {}) { this.req('silent', url, success, error, post, params); };
    this["native"] = function(url, success, error, post, params = {}) { this.req('native', url, success, error, post, params); };
    this.clear = function() { this.net.clear(); };
  }

  var Network = Lampa.Reguest; // var Network = Defined.api.indexOf('pwa') === 0 && typeof Blazor !== 'undefined' ? BlazorNet : Lampa.Reguest;

  function component(object) {
    var network = new Network(), scroll = new Lampa.Scroll({ mask: true, over: true }), files = new Lampa.Explorer(object), filter = new Lampa.Filter(object),
        sources = {}, last, source, balanser, initialized = false, balanser_timer, images = [], number_of_requests = 0, number_of_requests_timer,
        life_wait_times = 0, life_wait_timer, hubConnection, hub_timer, filter_sources = {}, filter_translate = {
          season: Lampa.Lang.translate('torrent_serial_season'), voice: Lampa.Lang.translate('torrent_parser_voice'), source: Lampa.Lang.translate('settings_rest_source')
        }, filter_find = { season: [], voice: [] }, balansers_with_search = ['kinotochka', 'kinopub', 'lumex', 'filmix', 'filmixtv', 'redheadsound', 'animevost', 'animego', 'animedia', 'animebesst', 'anilibria', 'rezka', 'rhsprem', 'kodik', 'remux', 'animelib', 'kinoukr', 'rc/filmix', 'rc/fxapi', 'rc/kinopub', 'rc/rhs', 'vcdn'];

    function account(url) {
      url = url + '';
      if (url.indexOf('account_email=') === -1) { var email = Lampa.Storage.get('account_email'); if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email)); }
      if (url.indexOf('uid=') === -1) { var uid = Lampa.Storage.get('lampac_unic_id', ''); if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid)); }
      if (url.indexOf('token=') === -1) { var token = ''; if (token) url = Lampa.Utils.addUrlComponent(url, 'token=' + token); }
      url = Lampa.Utils.addUrlComponent(url, 'ab_token=' + Lampa.Storage.get('token'));
      return url;
    }

    function balanserName(j) { var bals = j.balanser; var name = j.name.split(' ')[0]; return (bals || name).toLowerCase(); }
    function clarificationSearchAdd(value) { var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title); var all = Lampa.Storage.get('clarification_search', '{}'); all[id] = value; Lampa.Storage.set('clarification_search', all); }
    function clarificationSearchDelete() { var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title); var all = Lampa.Storage.get('clarification_search', '{}'); delete all[id]; Lampa.Storage.set('clarification_search', all); }
    function clarificationSearchGet() { var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title); var all = Lampa.Storage.get('clarification_search', '{}'); return all[id]; }

    this.initialize = function() {
      var _this = this;
      this.loading(true);
      filter.onSearch = function(value) { clarificationSearchAdd(value); Lampa.Activity.replace({ search: value, clarification: true }); };
      filter.onBack = function() { _this.start(); };
      filter.render().find('.selector').on('hover:enter', function() { clearInterval(balanser_timer); });
      filter.render().find('.filter--search').appendTo(filter.render().find('.torrent-filter'));
      filter.onSelect = function(type, a, b) {
        if (type === 'filter') {
          if (a.reset) { clarificationSearchDelete(); _this.replaceChoice({ season: 0, voice: 0, voice_url: '', voice_name: '' }); setTimeout(function() { Lampa.Select.close(); Lampa.Activity.replace({ clarification: 0 }); }, 10); }
          else { var url = filter_find[a.stype][b.index].url; var choice = _this.getChoice(); if (a.stype === 'voice') { choice.voice_name = filter_find.voice[b.index].title; choice.voice_url = url; } choice[a.stype] = b.index; _this.saveChoice(choice); _this.reset(); _this.request(url); setTimeout(Lampa.Select.close, 10); }
        } else if (type === 'sort') { Lampa.Select.close(); object.lampac_custom_select = a.source; _this.changeBalanser(a.source); }
      };
      if (filter.addButtonBack) filter.addButtonBack();
      filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
      scroll.body().addClass('torrent-list');
      files.appendFiles(scroll.render());
      files.appendHead(filter.render());
      scroll.minus(files.render().find('.explorer__files-head'));
      scroll.body().append(Lampa.Template.get('lampac_content_loading'));
      Lampa.Controller.enable('content');
      this.loading(false);
      this.externalids().then(function() { return _this.createSource(); }).then(function(json) {
        if (!balansers_with_search.find(function(b) { return balanser.slice(0, b.length) === b; })) filter.render().find('.filter--search').addClass('hide');
        _this.search();
      }).catch(function(e) { _this.noConnectToServer(e); });
    };

    this.rch = function(json, noreset) {
      var _this2 = this;
      var load = function() {
        if (hubConnection) { clearTimeout(hub_timer); hubConnection.stop(); hubConnection = null; console.log('RCH', 'hubConnection stop'); }
        hubConnection = new signalR.HubConnectionBuilder().withUrl(json.ws).build();
        hubConnection.start().then(function() {
          window.rch.Registry('https://abmsx.tech', hubConnection, function() { console.log('RCH', 'hubConnection start'); if (!noreset) _this2.find(); else noreset(); });
        }).catch(function(err) { console.log('RCH', err.toString()); });
        if (json.keepalive > 0) hub_timer = setTimeout(function() { hubConnection.stop(); hubConnection = null; }, 1000 * json.keepalive);
      };
      if (typeof signalR === 'undefined') { Lampa.Utils.putScript(["https://abmsx.tech/signalr-6.0.25_es5.js"], function() {}, false, function() { load(); }, true); } else load();
    };

    this.externalids = function() {
      return new Promise(function(resolve, reject) {
        if (!object.movie.imdb_id || !object.movie.kinopoisk_id) {
          var query = []; query.push('id=' + object.movie.id); query.push('serial=' + (object.movie.name ? 1 : 0));
          if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || '')); if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
          var url = Defined.localhost + 'externalids?' + query.join('&');
          network.timeout(10000); network.silent(account(url), function(json) { for (var name in json) object.movie[name] = json[name]; resolve(); }, resolve);
        } else resolve();
      });
    };

    this.updateBalanser = function(balanser_name) { var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 2000, {}); last_select_balanser[object.movie.id] = balanser_name; Lampa.Storage.set('online_last_balanser', last_select_balanser); };
    this.changeBalanser = function(balanser_name) { this.updateBalanser(balanser_name); Lampa.Storage.set('online_balanser', balanser_name); var to = this.getChoice(balanser_name); var from = this.getChoice(); if (from.voice_name) to.voice_name = from.voice_name; this.saveChoice(to, balanser_name); Lampa.Activity.replace(); };
    this.requestParams = function(url) {
      if (balanser && balanser.toLowerCase() === 'filmixtv') url = "http://rc.bwa.to/rc/fxapi";
      var query = []; var card_source = object.movie.source || 'tmdb';
      query.push('id=' + object.movie.id); if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || '')); if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
      query.push('title=' + encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name));
      query.push('original_title=' + encodeURIComponent(object.movie.original_title || object.movie.original_name));
      query.push('serial=' + (object.movie.name ? 1 : 0)); query.push('original_language=' + (object.movie.original_language || ''));
      query.push('year=' + ((object.movie.release_date || object.movie.first_air_date || '0000') + '').slice(0, 4)); query.push('source=' + card_source);
      query.push('rchtype=' + (window.rch ? window.rch.type : '')); query.push('clarification=' + (object.clarification ? 1 : 0));
      if (Lampa.Storage.get('account_email', '')) query.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', '')));
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
    };

    this.getLastChoiceBalanser = function() { var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 1000, {}); return last_select_balanser[object.movie.id] || Lampa.Storage.get('online_balanser', filter_sources.length ? filter_sources[0] : ''); };
    this.startSource = function(json) {
      return new Promise(function(resolve, reject) {
        json.forEach(function(j) { var name = balanserName(j); if (name === "filmixtv") j.name = "Filmix - 720p"; if (name === "pidtor") j.name = "Torrent - 2160"; if (name === "mirage") j.name = "Alloha - 2160"; sources[name] = { url: j.url, name: j.name, show: typeof j.show === 'undefined' ? true : j.show }; });
        filter_sources = Lampa.Arrays.getKeys(sources);
        var lowPriorityBalancers = [];
        filter_sources.sort(function(a, b) { if (a === '') return -1; if (b === '') return 1; var aLow = lowPriorityBalancers.indexOf(a) !== -1; var bLow = lowPriorityBalancers.indexOf(b) !== -1; return aLow && !bLow ? 1 : bLow && !aLow ? -1 : 0; });
        if (filter_sources.length) {
          var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 1000, {});
          balanser = last_select_balanser[object.movie.id] || Lampa.Storage.get('online_balanser', filter_sources[0]);
          if (lowPriorityBalancers.indexOf(balanser) !== -1 && filter_sources.some(function(item) { return lowPriorityBalancers.indexOf(item) === -1; })) balanser = filter_sources.find(function(item) { return lowPriorityBalancers.indexOf(item) === -1; });
          if (!sources[balanser]) balanser = filter_sources[0]; if (!sources[balanser].show && !object.lampac_custom_select) balanser = filter_sources[0];
          source = sources[balanser].url; resolve(json);
        } else reject();
      });
    };

    this.lifeSource = function() {
      var _this3 = this;
      return new Promise(function(resolve, reject) {
        var url = _this3.requestParams(Defined.localhost + 'lifeevents?memkey=' + (_this3.memkey || ''));
        var red = false;
        var gou = function(json, any) { if (json.accsdb) return reject(json); var last_balanser = _this3.getLastChoiceBalanser(); if (!red) { var _filter = json.online.filter(function(c) { return any ? c.show : c.show && c.name.toLowerCase() === last_balanser; }); if (_filter.length) { red = true; resolve(json.online.filter(function(c) { return c.show; })); } else if (any) reject(); } };
        var fin = function() {
          network.timeout(3000); network.silent(account(url), function(json) {
            life_wait_times++; filter_sources = []; sources = {};
            json.online.forEach(function(j) { var name = balanserName(j); if (name === "filmixtv") j.name = "Filmix - 720p"; if (name === "pidtor") j.name = "Torrent - 2160"; if (name === "mirage") j.name = "Alloha - 2160"; sources[name] = { url: j.url, name: j.name, show: typeof j.show === 'undefined' ? true : j.show }; });
            filter_sources = Lampa.Arrays.getKeys(sources);
            filter.set('sort', filter_sources.map(function(e) { return { title: sources[e].name, source: e, selected: e === balanser, ghost: !sources[e].show }; }));
            filter.chosen('sort', [sources[balanser] ? sources[balanser].name : balanser]); gou(json);
            var lastb = _this3.getLastChoiceBalanser();
            if (life_wait_times > 15 || json.ready) { filter.render().find('.lampac-balanser-loader').remove(); gou(json, true); } else if (!red && sources[lastb] && sources[lastb].show) { gou(json, true); life_wait_timer = setTimeout(fin, 1000); } else life_wait_timer = setTimeout(fin, 1000);
          }, function() { life_wait_times++; if (life_wait_times > 15) reject(); else life_wait_timer = setTimeout(fin, 1000); });
        };
        fin();
      });
    };

    this.createSource = function() {
      var _this4 = this;
      return new Promise(function(resolve, reject) {
        var url = _this4.requestParams(Defined.localhost + 'lite/events?life=true');
        network.timeout(15000); network.silent(account(url), function(json) { if (json.accsdb) return reject(json); if (json.life) { _this4.memkey = json.memkey; filter.render().find('.filter--sort').append('<span class="lampac-balanser-loader" style="width: 1.2em; height: 1.2em; margin-top: 0; background: url(./img/loader.svg) no-repeat 50% 50%; background-size: contain; margin-left: 0.5em"></span>'); _this4.lifeSource().then(_this4.startSource).then(resolve).catch(reject); } else _this4.startSource(json).then(resolve).catch(reject); }, reject);
      });
    };

    this.create = function() { return this.render(); };
    this.search = function() { this.filter({ source: filter_sources }, this.getChoice()); this.find(); };
    this.find = function() { this.request(this.requestParams(source)); };
    this.request = function(url) { number_of_requests++; if (number_of_requests < 10) { network["native"](account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, { dataType: 'text' }); clearTimeout(number_of_requests_timer); number_of_requests_timer = setTimeout(function() { number_of_requests = 0; }, 4000); } else this.empty(); };
    this.parseJsonDate = function(str, name) {
      try {
        var html = $('<div>' + str + '</div>'), elems = [];
        html.find(name).each(function() { var item = $(this), data = JSON.parse(item.attr('data-json')), season = item.attr('s'), episode = item.attr('e'), text = item.text(); if (!object.movie.name) { if (text.match(/\d+p/i)) { if (!data.quality) { data.quality = {}; data.quality[text] = data.url; } text = object.movie.title; } if (text === 'По умолчанию') text = object.movie.title; } if (episode) data.episode = parseInt(episode); if (season) data.season = parseInt(season); if (text) data.text = text; data.active = item.hasClass('active'); elems.push(data); });
        return elems;
      } catch (e) { return []; }
    };

    this.getFileUrl = function(file, call) {
      var _this = this;
      function addAbToken(string) { return string + '&ab_token=' + Lampa.Storage.get('token'); }
      if (file.stream && file.stream.indexOf('alloha') >= 0) file.stream = addAbToken(file.stream);
      if (file.url && file.url.indexOf('alloha') >= 0) file.url = addAbToken(file.url);
      if (Lampa.Storage.field('player') !== 'inner' && file.stream && Lampa.Platform.is('apple')) { var newfile = Lampa.Arrays.clone(file); newfile.method = 'play'; newfile.url = file.stream; call(newfile, {}); }
      else if (file.method === 'play') call(file, {});
      else {
        Lampa.Loading.start(function() { Lampa.Loading.stop(); Lampa.Controller.toggle('content'); network.clear(); });
        network["native"](account(file.url), function(json) { if (json.rch) { _this.rch(json, function() { Lampa.Loading.stop(); _this.getFileUrl(file, call); }); } else { Lampa.Loading.stop(); call(json, json); } }, function() { Lampa.Loading.stop(); call(false, {}); });
      }
    };

    this.toPlayElement = function(file) { return { title: file.title, url: file.url, quality: file.qualitys, timeline: file.timeline, subtitles: file.subtitles, callback: file.mark }; };
    this.appendAPN = function(data) { if (Defined.api.indexOf('pwa') === 0 && Defined.apn.length && data.url && typeof data.url === 'string' && data.url.indexOf(Defined.apn) === -1) data.url_reserve = Defined.apn + data.url; };
    this.setDefaultQuality = function(data) { if (Lampa.Arrays.getKeys(data.quality).length) { for (var q in data.quality) { if (parseInt(q) === Lampa.Storage.field('video_quality_default')) { data.url = data.quality[q]; this.appendAPN(data); break; } } } };
    this.display = function(videos) {
      var _this5 = this;
      this.draw(videos, {
        onEnter: function(item, html) {
          _this5.getFileUrl(item, function(json, json_call) {
            if (json && json.url) {
              var playlist = [], first = _this5.toPlayElement(item); first.url = json.url; first.headers = json.headers; first.quality = json_call.quality || item.qualitys; first.subtitles = json.subtitles; first.vast_url = json.vast_url; first.vast_msg = json.vast_msg; _this5.appendAPN(first); _this5.setDefaultQuality(first);
              if (item.season) {
                videos.forEach(function(elem) {
                  var cell = _this5.toPlayElement(elem);
                  if (elem === item) cell.url = json.url;
                  else {
                    if (elem.method === 'call') {
                      if (Lampa.Storage.field('player') !== 'inner') { cell.url = elem.stream; delete cell.quality; } else {
                        cell.url = function(call) { _this5.getFileUrl(elem, function(stream, stream_json) { if (stream.url) { cell.url = stream.url; cell.quality = stream_json.quality || elem.qualitys; cell.subtitles = stream.subtitles; _this5.appendAPN(cell); _this5.setDefaultQuality(cell); elem.mark(); } else { cell.url = ''; Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink')); } call(); }, function() { cell.url = ''; call(); }); };
                      }
                    } else cell.url = elem.url;
                  }
                  _this5.appendAPN(cell); _this5.setDefaultQuality(cell); playlist.push(cell);
                });
              } else playlist.push(first);
              if (playlist.length > 1) first.playlist = playlist;
              if (first.url) { Lampa.Player.play(first); Lampa.Player.playlist(playlist); item.mark(); _this5.updateBalanser(balanser); } else Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
            } else Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
          }, true);
        },
        onContextMenu: function(item, html, data, call) { _this5.getFileUrl(item, function(stream) { call({ file: stream.url, quality: item.qualitys }); }, true); }
      });
      this.filter({ season: filter_find.season.map(function(s) { return s.title; }), voice: filter_find.voice.map(function(b) { return b.title; }) }, this.getChoice());
    };

    this.parse = function(str) {
      var json = Lampa.Arrays.decodeJson(str, {}); if (json && json.accsdb && json.msg && json.msg.indexOf('@Abcinema_bot') !== -1) { json.msg = ''; json.accsdb = false; }
      if (Lampa.Arrays.isObject(str) && str.rch) json = str; if (json.rch) return this.rch(json);
      try {
        var items = this.parseJsonDate(str, '.videos__item'), buttons = this.parseJsonDate(str, '.videos__button');
        if (items.length === 1 && items[0].method === 'link' && !items[0].similar) { filter_find.season = items.map(function(s) { return { title: s.text, url: s.url }; }); this.replaceChoice({ season: 0 }); this.request(items[0].url); }
        else {
          this.activity.loader(false);
          var videos = items.filter(function(v) { return v.method === 'play' || v.method === 'call'; }), similar = items.filter(function(v) { return v.similar; });
          if (videos.length) {
            if (buttons.length) {
              filter_find.voice = buttons.map(function(b) { return { title: b.text, url: b.url }; });
              var select_voice_url = this.getChoice(balanser).voice_url, select_voice_name = this.getChoice(balanser).voice_name, find_voice_url = buttons.find(function(v) { return v.url === select_voice_url; }), find_voice_name = buttons.find(function(v) { return v.text === select_voice_name; }), find_voice_active = buttons.find(function(v) { return v.active; });
              if (find_voice_url && !find_voice_url.active) { console.log('Lampac', 'go to voice', find_voice_url); this.replaceChoice({ voice: buttons.indexOf(find_voice_url), voice_name: find_voice_url.text }); this.request(find_voice_url.url); }
              else if (find_voice_name && !find_voice_name.active) { console.log('Lampac', 'go to voice', find_voice_name); this.replaceChoice({ voice: buttons.indexOf(find_voice_name), voice_name: find_voice_name.text }); this.request(find_voice_name.url); }
              else { if (find_voice_active) this.replaceChoice({ voice: buttons.indexOf(find_voice_active), voice_name: find_voice_active.text }); this.display(videos); }
            } else { this.replaceChoice({ voice: 0, voice_url: '', voice_name: '' }); this.display(videos); }
          } else if (items.length) {
            if (similar.length) { this.similars(similar); this.activity.loader(false); } else { filter_find.season = items.map(function(s) { return { title: s.text, url: s.url }; }); var select_season = this.getChoice(balanser).season; var season = filter_find.season[select_season] || filter_find.season[0]; console.log('Lampac', 'go to season', season); this.request(season.url); }
          } else this.doesNotAnswer(json);
        }
      } catch (e) { this.doesNotAnswer(e); }
    };

    this.similars = function(json) {
      var _this6 = this;
      scroll.clear();
      json.forEach(function(elem) {
        elem.title = elem.text; elem.info = ''; var info = []; var year = ((elem.start_date || elem.year || object.movie.release_date || object.movie.first_air_date || '') + '').slice(0, 4); if (year) info.push(year); if (elem.details) info.push(elem.details);
        elem.title = elem.title || elem.text; elem.time = elem.time || ''; elem.info = info.join('<span class="online-prestige-split">●</span>');
        var item = Lampa.Template.get('lampac_prestige_folder', elem);
        item.on('hover:enter', function() { _this6.reset(); _this6.request(elem.url); }).on('hover:focus', function(e) { last = e.target; scroll.update($(e.target), true); });
        scroll.append(item);
      });
      this.filter({ season: filter_find.season.map(function(s) { return s.title; }), voice: filter_find.voice.map(function(b) { return b.title; }) }, this.getChoice());
      Lampa.Controller.enable('content');
    };

    this.getChoice = function(for_balanser) { var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {}); var save = data[object.movie.id] || {}; Lampa.Arrays.extend(save, { season: 0, voice: 0, voice_name: '', voice_id: 0, episodes_view: {}, movie_view: '' }); return save; };
    this.saveChoice = function(choice, for_balanser) { var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {}); data[object.movie.id] = choice; Lampa.Storage.set('online_choice_' + (for_balanser || balanser), data); this.updateBalanser(for_balanser || balanser); };
    this.replaceChoice = function(choice, for_balanser) { var to = this.getChoice(for_balanser); Lampa.Arrays.extend(to, choice, true); this.saveChoice(to, for_balanser); };
    this.clearImages = function() { images.forEach(function(img) { img.onerror = function() {}; img.onload = function() {}; img.src = ''; }); images = []; };
    this.reset = function() { last = false; clearInterval(balanser_timer); network.clear(); this.clearImages(); scroll.render().find('.empty').remove(); scroll.clear(); scroll.reset(); scroll.body().append(Lampa.Template.get('lampac_content_loading')); };
    this.loading = function(status) { if (status) this.activity.loader(true); else { this.activity.loader(false); this.activity.toggle(); } };
    this.filter = function(filter_items, choice) {
      var _this7 = this, select = [], add = function(type, title) { var need = _this7.getChoice(), items = filter_items[type], subitems = [], value = need[type]; items.forEach(function(name, i) { subitems.push({ title: name, selected: value === i, index: i }); }); select.push({ title: title, subtitle: items[value], items: subitems, stype: type }); };
      filter_items.source = filter_sources; select.push({ title: Lampa.Lang.translate('torrent_parser_reset'), reset: true }); this.saveChoice(choice);
      if (filter_items.voice && filter_items.voice.length) add('voice', Lampa.Lang.translate('torrent_parser_voice')); if (filter_items.season && filter_items.season.length) add('season', Lampa.Lang.translate('torrent_serial_season'));
      filter.set('filter', select); filter.set('sort', filter_sources.map(function(e) { return { title: sources[e].name, source: e, selected: e === balanser, ghost: !sources[e].show }; }));
      this.selected(filter_items);
    };

    this.selected = function(filter_items) { var need = this.getChoice(), select = []; for (var i in need) { if (filter_items[i] && filter_items[i].length) { if (i === 'voice') select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]); else if (i !== 'source') { if (filter_items.season.length >= 1) select.push(filter_translate.season + ': ' + filter_items[i][need[i]]); } } } filter.chosen('filter', select); filter.chosen('sort', [sources[balanser].name]); };
    this.getEpisodes = function(season, call) { var episodes = []; if (['cub', 'tmdb'].indexOf(object.movie.source || 'tmdb') === -1) return call(episodes); if (typeof object.movie.id === 'number' && object.movie.name) { var tmdburl = 'tv/' + object.movie.id + '/season/' + season + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru'), baseurl = Lampa.TMDB.api(tmdburl); network.timeout(10000); network["native"](baseurl, function(data) { episodes = data.episodes || []; call(episodes); }, function() { call(episodes); }); } else call(episodes); };
    this.watched = function(set) { var file_id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title), watched = Lampa.Storage.cache('online_watched_last', 5000, {}); if (set) { if (!watched[file_id]) watched[file_id] = {}; Lampa.Arrays.extend(watched[file_id], set, true); Lampa.Storage.set('online_watched_last', watched); this.updateWatched(); } else return watched[file_id]; };
    this.updateWatched = function() {
      var watched = this.watched(), body = scroll.body().find('.online-prestige-watched .online-prestige-watched__body').empty();
      if (watched) { var line = []; if (watched.balanser_name) line.push(watched.balanser_name); if (watched.voice_name) line.push(watched.voice_name); if (watched.season) line.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + watched.season); if (watched.episode) line.push(Lampa.Lang.translate('torrent_serial_episode') + ' ' + watched.episode); line.forEach(function(n) { body.append('<span>' + n + '</span>'); }); } else body.append('<span>' + Lampa.Lang.translate('lampac_no_watch_history') + '</span>');
    };

    this.draw = function(items, params = {}) {
      var _this8 = this;
      if (!items.length) return this.empty();
      scroll.clear(); scroll.append(Lampa.Template.get('lampac_prestige_watched', {})); this.updateWatched();
      this.getEpisodes(items[0].season, function(episodes) {
        var viewed = Lampa.Storage.cache('online_view', 5000, []), serial = object.movie.name ? true : false, choice = _this8.getChoice(), fully = window.innerWidth > 480, scroll_to_element = false, scroll_to_mark = false;
        items.forEach(function(element, index) {
          var episode = serial && episodes.length && !params.similars ? episodes.find(function(e) { return e.episode_number === element.episode; }) : false, episode_num = element.episode || index + 1, episode_last = choice.episodes_view[element.season], voice_name = choice.voice_name || (filter_find.voice[0] ? filter_find.voice[0].title : false) || element.voice_name || (serial ? 'Неизвестно' : element.text) || 'Неизвестно';
          if (element.quality) { element.qualitys = element.quality; element.quality = Lampa.Arrays.getKeys(element.quality)[0]; }
          Lampa.Arrays.extend(element, { voice_name: voice_name, info: voice_name.length > 60 ? voice_name.substr(0, 60) + '...' : voice_name, quality: '', time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true) });
          var hash_timeline = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title].join('') : object.movie.original_title), hash_behold = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title, element.voice_name].join('') : object.movie.original_title + element.voice_name), data = { hash_timeline: hash_timeline, hash_behold: hash_behold };
          var info = []; if (element.season) { element.translate_episode_end = _this8.getLastEpisode(items); element.translate_voice = element.voice_name; }
          if (element.text && !episode) element.title = element.text; element.timeline = Lampa.Timeline.view(hash_timeline);
          if (episode) { element.title = episode.name; if (element.info.length < 30 && episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', { rate: parseFloat(episode.vote_average + '').toFixed(1) }, true)); if (episode.air_date && fully) info.push(Lampa.Utils.parseTime(episode.air_date).full); } else if (object.movie.release_date && fully) info.push(Lampa.Utils.parseTime(object.movie.release_date).full);
          if (!serial && object.movie.tagline && element.info.length < 30) info.push(object.movie.tagline); if (element.info) info.push(element.info);
          if (info.length) element.info = info.map(function(i) { return '<span>' + i + '</span>'; }).join('<span class="online-prestige-split">●</span>');
          var html = Lampa.Template.get('lampac_prestige_full', element), loader = html.find('.online-prestige__loader'), image = html.find('.online-prestige__img');
          if (!serial) { if (choice.movie_view === hash_behold) scroll_to_element = html; } else if (typeof episode_last !== 'undefined' && episode_last === episode_num) scroll_to_element = html;
          if (serial && !episode) { image.append('<div class="online-prestige__episode-number">' + ('0' + (element.episode || index + 1)).slice(-2) + '</div>'); loader.remove(); } else if (!serial && ['cub', 'tmdb'].indexOf(object.movie.source || 'tmdb') === -1) loader.remove();
          else {
            var img = html.find('img')[0]; img.onerror = function() { img.src = './img/img_broken.svg'; }; img.onload = function() { image.addClass('online-prestige__img--loaded'); loader.remove(); if (serial) image.append('<div class="online-prestige__episode-number">' + ('0' + (element.episode || index + 1)).slice(-2) + '</div>'); };
            img.src = Lampa.TMDB.image('t/p/w300' + (episode ? episode.still_path : object.movie.backdrop_path)); images.push(img);
          }
          html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline));
          if (viewed.indexOf(hash_behold) !== -1) { scroll_to_mark = html; html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>'); }
          element.mark = function() { viewed = Lampa.Storage.cache('online_view', 5000, []); if (viewed.indexOf(hash_behold) === -1) { viewed.push(hash_behold); Lampa.Storage.set('online_view', viewed); if (html.find('.online-prestige__viewed').length === 0) html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>'); } choice = _this8.getChoice(); if (!serial) choice.movie_view = hash_behold; else choice.episodes_view[element.season] = episode_num; _this8.saveChoice(choice); var voice_name_text = choice.voice_name || element.voice_name || element.title; if (voice_name_text.length > 30) voice_name_text = voice_name_text.slice(0, 30) + '...'; _this8.watched({ balanser: balanser, balanser_name: Lampa.Utils.capitalizeFirstLetter(sources[balanser].name.split(' ')[0]), voice_id: choice.voice_id, voice_name: voice_name_text, episode: element.episode, season: element.season }); };
          element.unmark = function() { viewed = Lampa.Storage.cache('online_view', 5000, []); if (viewed.indexOf(hash_behold) !== -1) { Lampa.Arrays.remove(viewed, hash_behold); Lampa.Storage.set('online_view', viewed); html.find('.online-prestige__viewed').remove(); } };
          element.timeclear = function() { element.timeline.percent = 0; element.timeline.time = 0; element.timeline.duration = 0; Lampa.Timeline.update(element.timeline); };
          html.on('hover:enter', function() { if (object.movie.id) { Lampa.Favorite.add('history', object.movie, 100); var user = Lampa.Storage.get('ab_account'); if (object && object.movie && user) { try { $.ajax('//tracker.abmsx.tech/track', { method: 'post', type: 'POST', contentType: 'application/json', data: JSON.stringify({ "balancer": balanser, "id": object.movie.id, "token": user.token, "userId": user.id, "name": object.search, "season": element.season || 0, "episode": element.episode || 0 }), error: function(e) { console.log('track error request', e); } }); } catch(e) { console.log('track error', e); } } } if (params.onEnter) params.onEnter(element, html, data); }).on('hover:focus', function(e) { last = e.target; if (params.onFocus) params.onFocus(element, html, data); scroll.update($(e.target), true); });
          if (params.onRender) params.onRender(element, html, data);
          _this8.contextMenu({ html: html, element: element, onFile: function(call) { if (params.onContextMenu) params.onContextMenu(element, html, data, call); }, onClearAllMark: function() { items.forEach(function(elem) { elem.unmark(); }); }, onClearAllTime: function() { items.forEach(function(elem) { elem.timeclear(); }); } });
          scroll.append(html);
        });
        if (serial && episodes.length > items.length && !params.similars) {
          var left = episodes.slice(items.length); left.forEach(function(episode) {
            var info = []; if (episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', { rate: parseFloat(episode.vote_average + '').toFixed(1) }, true)); if (episode.air_date) info.push(Lampa.Utils.parseTime(episode.air_date).full);
            var air = new Date((episode.air_date + '').replace(/-/g, '/')), now = Date.now(), day = Math.round((air.getTime() - now) / (24 * 60 * 60 * 1000)), txt = Lampa.Lang.translate('full_episode_days_left') + ': ' + day;
            var html = Lampa.Template.get('lampac_prestige_full', { time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true), info: info.length ? info.map(function(i) { return '<span>' + i + '</span>'; }).join('<span class="online-prestige-split">●</span>') : '', title: episode.name, quality: day > 0 ? txt : '' });
            var loader = html.find('.online-prestige__loader'), image = html.find('.online-prestige__img'), season = items[0] ? items[0].season : 1;
            html.find('.online-prestige__timeline').append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([season, episode.episode_number, object.movie.original_title].join('')))));
            var img = html.find('img')[0];
            if (episode.still_path) { img.onerror = function() { img.src = './img/img_broken.svg'; }; img.onload = function() { image.addClass('online-prestige__img--loaded'); loader.remove(); image.append('<div class="online-prestige__episode-number">' + ('0' + episode.episode_number).slice(-2) + '</div>'); }; img.src = Lampa.TMDB.image('t/p/w300' + episode.still_path); images.push(img); } else { loader.remove(); image.append('<div class="online-prestige__episode-number">' + ('0' + episode.episode_number).slice(-2) + '</div>'); }
            html.on('hover:focus', function(e) { last = e.target; scroll.update($(e.target), true); }); html.css('opacity', '0.5'); scroll.append(html);
          });
        }
        if (scroll_to_element) last = scroll_to_element[0]; else if (scroll_to_mark) last = scroll_to_mark[0];
        Lampa.Controller.enable('content');
      });
    };

    this.contextMenu = function(params) {
      params.html.on('hover:long', function() {
        function show(extra) {
          var enabled = Lampa.Controller.enabled().name, menu = [];
          if (Lampa.Platform.is('webos')) menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Webos', player: 'webos' });
          if (Lampa.Platform.is('android')) menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Android', player: 'android' });
          menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Lampa', player: 'lampa' }); menu.push({ title: Lampa.Lang.translate('lampac_video'), separator: true }); menu.push({ title: Lampa.Lang.translate('torrent_parser_label_title'), mark: true }); menu.push({ title: Lampa.Lang.translate('torrent_parser_label_cancel_title'), unmark: true }); menu.push({ title: Lampa.Lang.translate('time_reset'), timeclear: true });
          if (extra) menu.push({ title: Lampa.Lang.translate('copy_link'), copylink: true });
          menu.push({ title: Lampa.Lang.translate('more'), separator: true }); if (Lampa.Account.logged() && params.element && typeof params.element.season !== 'undefined' && params.element.translate_voice) menu.push({ title: Lampa.Lang.translate('lampac_voice_subscribe'), subscribe: true });
          menu.push({ title: Lampa.Lang.translate('lampac_clear_all_marks'), clearallmark: true }); menu.push({ title: Lampa.Lang.translate('lampac_clear_all_timecodes'), timeclearall: true });
          Lampa.Select.show({ title: Lampa.Lang.translate('title_action'), items: menu, onBack: function() { Lampa.Controller.toggle(enabled); }, onSelect: function(a) {
            if (a.mark) params.element.mark(); if (a.unmark) params.element.unmark(); if (a.timeclear) params.element.timeclear(); if (a.clearallmark) params.onClearAllMark(); if (a.timeclearall) params.onClearAllTime(); Lampa.Controller.toggle(enabled);
            if (a.player) { Lampa.Player.runas(a.player); params.html.trigger('hover:enter'); }
            if (a.copylink) {
              if (extra.quality) { var qual = []; for (var i in extra.quality) qual.push({ title: i, file: extra.quality[i] }); Lampa.Select.show({ title: Lampa.Lang.translate('settings_server_links'), items: qual, onBack: function() { Lampa.Controller.toggle(enabled); }, onSelect: function(b) { Lampa.Utils.copyTextToClipboard(b.file, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_secuses')); }, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_error')); }); } }); } else Lampa.Utils.copyTextToClipboard(extra.file, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_secuses')); }, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_error')); });
            }
            if (a.subscribe) { Lampa.Account.subscribeToTranslation({ card: object.movie, season: params.element.season, episode: params.element.translate_episode_end, voice: params.element.translate_voice }, function() { Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_success')); }, function() { Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_error')); }); }
          } });
        }
        params.onFile(show);
      }).on('hover:focus', function() { if (Lampa.Helper) Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.html); });
    };

    this.empty = function() { var html = Lampa.Template.get('lampac_does_not_answer', {}); html.find('.online-empty__buttons').remove(); html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two')); html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text')); scroll.clear(); scroll.append(html); this.loading(false); };
    this.noConnectToServer = function(er) { var html = Lampa.Template.get('lampac_does_not_answer', {}); html.find('.online-empty__buttons').remove(); html.find('.online-empty__title').text(Lampa.Lang.translate('title_error')); html.find('.online-empty__time').text(er && er.accsdb ? er.msg : Lampa.Lang.translate('lampac_does_not_answer_text').replace('{balanser}', sources[balanser].name)); scroll.clear(); scroll.append(html); this.loading(false); };
    this.doesNotAnswer = function(er) {
      var _this9 = this;
      this.reset(); var html = Lampa.Template.get('lampac_does_not_answer', { balanser: balanser }); if (er && er.accsdb) html.find('.online-empty__title').html(er.msg); var tic = er && er.accsdb ? 10 : 5;
      html.find('.cancel').on('hover:enter', function() { clearInterval(balanser_timer); }); html.find('.change').on('hover:enter', function() { clearInterval(balanser_timer); filter.render().find('.filter--sort').trigger('hover:enter'); });
      scroll.clear(); scroll.append(html); this.loading(false);
      balanser_timer = setInterval(function() { tic--; html.find('.timeout').text(tic); if (tic === 0) { clearInterval(balanser_timer); var keys = Lampa.Arrays.getKeys(sources), indx = keys.indexOf(balanser), next = keys[indx + 1] || keys[0]; balanser = next; if (Lampa.Activity.active().activity === _this9.activity) _this9.changeBalanser(balanser); } }, 1000);
    };

    this.getLastEpisode = function(items) { var last_episode = 0; items.forEach(function(e) { if (typeof e.episode !== 'undefined') last_episode = Math.max(last_episode, parseInt(e.episode)); }); return last_episode; };
    this.start = function() { if (Lampa.Activity.active().activity !== this.activity) return; if (!initialized) { initialized = true; this.initialize(); } Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie)); Lampa.Controller.add('content', { toggle: function() { Lampa.Controller.collectionSet(scroll.render(), files.render()); Lampa.Controller.collectionFocus(last || false, scroll.render()); }, gone: function() { clearTimeout(balanser_timer); }, up: function() { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); }, down: function() { Navigator.move('down'); }, right: function() { if (Navigator.canmove('right')) Navigator.move('right'); else filter.show(Lampa.Lang.translate('title_filter'), 'filter'); }, left: function() { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); }, back: this.back.bind(this) }); Lampa.Controller.toggle('content'); };
    this.render = function() { return files.render(); };
    this.back = function() { Lampa.Activity.backward(); };
    this.pause = function() {};
    this.stop = function() {};
    this.destroy = function() { network.clear(); this.clearImages(); files.destroy(); scroll.destroy(); clearInterval(balanser_timer); clearTimeout(life_wait_timer); clearTimeout(hub_timer); if (hubConnection) { hubConnection.stop(); hubConnection = null; } };
  }

  function startPlugin() {
  window.lampac_plugin = true;
  var manifst = {
    type: 'video',
    version: '2',
    name: '4m1K',
    description: 'Плагин для просмотра онлайн сериалов и фильмов',
    component: 'lampac',
    onContextMenu: function(object) {
      return { name: Lampa.Lang.translate('lampac_watch'), description: 'Плагин для просмотра онлайн сериалов и фильмов' };
    },
    onContextLauch: function(object) {
      resetTemplates();
      Lampa.Component.add('lampac', component);
      var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title),
          all = Lampa.Storage.get('clarification_search', '{}');
      Lampa.Activity.push({
        url: '',
        title: Lampa.Lang.translate('title_online'),
        component: 'lampac',
        search: all[id] ? all[id] : object.title,
        search_one: object.title,
        search_two: object.original_title,
        movie: object,
        page: 1,
        clarification: all[id] ? true : false
      });
    }
  };
  Lampa.Manifest.plugins = manifst;
  Lampa.Lang.add({ /* существующий объект переводов без изменений */ });
  Lampa.Template.add('lampac_css', /* существующий CSS без изменений */);
  $('body').append(Lampa.Template.get('lampac_css', {}, true));

  function resetTemplates() {
    Lampa.Template.add('lampac_prestige_full', /* шаблон без изменений */);
    Lampa.Template.add('lampac_content_loading', /* шаблон без изменений */);
    Lampa.Template.add('lampac_does_not_answer', /* шаблон без изменений */);
    Lampa.Template.add('lampac_prestige_rate', /* шаблон без изменений */);
    Lampa.Template.add('lampac_prestige_folder', /* шаблон без изменений */);
    Lampa.Template.add('lampac_prestige_watched', /* шаблон без изменений */);
  }

  Lampa.Component.add('lampac', component);

  if (!Lampa.Storage.get('lampac_menu', false)) {
    Lampa.Storage.set('lampac_menu', true);
    var menu = Lampa.Menu;
    if (Array.isArray(menu)) {
      menu.push({
        title: Lampa.Lang.translate('lampac_watch'),
        component: 'lampac',
        url: '',
        click: function() {
          resetTemplates();
          Lampa.Component.add('lampac', component);
          var activity = Lampa.Activity.active();
          var id = Lampa.Utils.hash(activity.object.number_of_seasons ? activity.object.original_name : activity.object.original_title);
          var all = Lampa.Storage.get('clarification_search', '{}');
          var search = all[id] ? all[id] : activity.object.title;
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'lampac',
            search: search,
            search_one: activity.object.title,
            search_two: activity.object.original_title,
            movie: activity.object,
            page: 1,
            clarification: all[id] ? true : false
          });
        }
      });
    }
    if (menu && typeof menu.update === 'function') menu.update();
  }

  Lampa.Listener.follow('card', function(e) {
    if (e.type === 'contextmenu_open') {
      var card = e.data.card, clarification = clarificationSearchGet();
      e.data.menu.push({
        title: Lampa.Lang.translate('lampac_watch') + (clarification ? ' (' + clarification + ')' : ''),
        click: function() {
          resetTemplates();
          Lampa.Component.add('lampac', component);
          var id = Lampa.Utils.hash(card.number_of_seasons ? card.original_name : card.original_title),
              all = Lampa.Storage.get('clarification_search', '{}'),
              search = all[id] ? all[id] : card.title;
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'lampac',
            search: search,
            search_one: card.title,
            search_two: card.original_title,
            movie: card,
            page: 1,
            clarification: all[id] ? true : false
          });
        }
      });
    }
  });

  Lampa.Listener.follow('player', function(e) {
    if (e.type === 'menu') {
      e.data.push({
        title: Lampa.Lang.translate('lampac_watch'),
        separator: true,
        click: function() {
          var card = Lampa.Player.data.card;
          resetTemplates();
          Lampa.Component.add('lampac', component);
          var id = Lampa.Utils.hash(card.number_of_seasons ? card.original_name : card.original_title),
              all = Lampa.Storage.get('clarification_search', '{}'),
              search = all[id] ? all[id] : card.title;
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'lampac',
            search: search,
            search_one: card.title,
            search_two: card.original_title,
            movie: card,
            page: 1,
            clarification: all[id] ? true : false
          });
        }
      });
    }
  });

  console.log('Lampac', 'plugin loaded');
}
