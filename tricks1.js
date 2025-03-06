(function() {
  'use strict';

  // Функция для XOR‑шифрования (используйте её для предварительной генерации зашифрованных строк)
  function xorEncrypt(data, key) {
    var result = "";
    for (var i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  // Функция для XOR‑расшифровки (операция обратима)
  function xorDecrypt(data, key) {
    var result = "";
    for (var i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  // Ключ для шифрования/расшифровки
  var key = "mySecretKey";

  // Заранее зашифрованные URL (их можно сгенерировать один раз через xorEncrypt)
  var encryptedLocalhost   = xorEncrypt("https://lam.akter-black.com/", key);
  var encryptedINVC_RCH    = xorEncrypt("https://abmsx.tech/invc-rch.js", key);
  var encryptedABMSX_TECH  = xorEncrypt("https://abmsx.tech", key);
  var encryptedRC_FXAPI    = xorEncrypt("http://rc.bwa.to/rc/fxapi", key);
  var encryptedSIGNALR     = xorEncrypt("https://abmsx.tech/signalr-6.0.25_es5.js", key);
  var encryptedTRACKER     = xorEncrypt("https://tracker.abmsx.tech/track", key);

  // Расшифровка URL на лету
  var Defined = {
    api: 'lampac',
    localhost: xorDecrypt(encryptedLocalhost, key),
    apn: ''
  };

  var URL_INVC_RCH   = xorDecrypt(encryptedINVC_RCH, key);
  var URL_ABMSX_TECH = xorDecrypt(encryptedABMSX_TECH, key);
  var URL_RC_FXAPI   = xorDecrypt(encryptedRC_FXAPI, key);
  var URL_SIGNALR    = xorDecrypt(encryptedSIGNALR, key);
  var URL_TRACKER    = xorDecrypt(encryptedTRACKER, key);

  // Для SVG-ссылок оставляем открытые строковые литералы
  var URL_IMG_LOADER = "./img/loader.svg";
  var URL_IMG_BROKEN = "./img/img_broken.svg";

  // Инициализация уникального идентификатора, если его ещё нет
  var unic_id = Lampa.Storage.get('lampac_unic_id', '');
  if (!unic_id) {
    unic_id = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unic_id);
  }

  // Подключение скрипта rch через зашифрованный URL
  if (!window.rch) {
    Lampa.Utils.putScript([URL_INVC_RCH], function() {}, false, function() {
      if (!window.rch.startTypeInvoke)
        window.rch.typeInvoke(URL_ABMSX_TECH, function() {});
    }, true);
  }

  // Конструктор BlazorNet – без изменений
  function BlazorNet() {
    this.net = new Lampa.Reguest();
    this.timeout = function(time) {
      this.net.timeout(time);
    };
    this.req = function(type, url, secuses, error, post, params) {
      params = params || {};
      var path = url.split(Defined.localhost).pop().split('?');
      if (path[0].indexOf('http') >= 0) {
        return this.net[type](url, secuses, error, post, params);
      }
      DotNet.invokeMethodAsync("JinEnergy", path[0], path[1]).then(function(result) {
        if (params.dataType === 'text') secuses(result);
        else secuses(Lampa.Arrays.decodeJson(result, {}));
      }).catch(function(e) {
        console.log('Blazor', 'error:', e);
        error(e);
      });
    };
    this.silent = function(url, secuses, error, post, params) {
      params = params || {};
      this.req('silent', url, secuses, error, post, params);
    };
    this["native"] = function(url, secuses, error, post, params) {
      params = params || {};
      this.req('native', url, secuses, error, post, params);
    };
    this.clear = function() {
      this.net.clear();
    };
  }

  // Используем Lampa.Reguest в качестве Network (если необходимо, можно переключиться на BlazorNet)
  var Network = Lampa.Reguest;
  // var Network = (Defined.api.indexOf('pwa') === 0 && typeof Blazor !== 'undefined') ? BlazorNet : Lampa.Reguest;

  // Полный код компонента плагина (взятый из оригинального файла оптимизация.txt)
  function component(object) {
    var network = new Network();
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var files = new Lampa.Explorer(object);
    var filter = new Lampa.Filter(object);
    var sources = {};
    var last;
    var source;
    var balanser;
    var initialized;
    var balanser_timer;
    var images = [];
    var number_of_requests = 0;
    var number_of_requests_timer;
    var hubConnection;
    var hub_timer;
    var filter_sources = {};
    var filter_translate = {
      season: Lampa.Lang.translate('torrent_serial_season'),
      voice: Lampa.Lang.translate('torrent_parser_voice'),
      source: Lampa.Lang.translate('settings_rest_source')
    };
    var filter_find = { season: [], voice: [] };
    var balansers_with_search = ['kinotochka','kinopub','lumex','filmix','filmixtv','redheadsound','animevost','animego','animedia','animebesst','anilibria','rezka','rhsprem','kodik','remux','animelib','kinoukr','rc/filmix','rc/fxapi','rc/kinopub','rc/rhs','vcdn'];

    function account(url) {
      url = url + '';
      if (url.indexOf('account_email=') === -1) {
        var email = Lampa.Storage.get('account_email');
        if (email) { url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email)); }
      }
      if (url.indexOf('uid=') === -1) {
        var uid = Lampa.Storage.get('lampac_unic_id', '');
        if (uid) { url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid)); }
      }
      if (url.indexOf('token=') === -1) {
        var token = '';
        if (token !== '') { url = Lampa.Utils.addUrlComponent(url, 'token='); }
      }
      url = Lampa.Utils.addUrlComponent(url, 'ab_token=' + Lampa.Storage.get('token'));
      return url;
    }

    function balanserName(j) {
      var bals = j.balanser;
      var name = j.name.split(' ')[0];
      return (bals || name).toLowerCase();
    }

    function clarificationSearchAdd(value) {
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search','{}');
      all[id] = value;
      Lampa.Storage.set('clarification_search', all);
    }
    function clarificationSearchDelete() {
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search','{}');
      delete all[id];
      Lampa.Storage.set('clarification_search', all);
    }
    function clarificationSearchGet() {
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search','{}');
      return all[id];
    }

    this.initialize = function() {
      var _this = this;
      this.loading(true);
      filter.onSearch = function(value) {
        clarificationSearchAdd(value);
        Lampa.Activity.replace({ search: value, clarification: true });
      };
      filter.onBack = function() { _this.start(); };
      filter.render().find('.selector').on('hover:enter', function() { clearInterval(balanser_timer); });
      filter.render().find('.filter--search').appendTo(filter.render().find('.torrent-filter'));
      filter.onSelect = function(type, a, b) {
        if (type === 'filter') {
          if (a.reset) {
            clarificationSearchDelete();
            _this.replaceChoice({ season: 0, voice: 0, voice_url: '', voice_name: '' });
            setTimeout(function() {
              Lampa.Select.close();
              Lampa.Activity.replace({ clarification: 0 });
            }, 10);
          } else {
            var url = filter_find[a.stype][b.index].url;
            var choice = _this.getChoice();
            if (a.stype === 'voice') {
              choice.voice_name = filter_find.voice[b.index].title;
              choice.voice_url = url;
            }
            choice[a.stype] = b.index;
            _this.saveChoice(choice);
            _this.reset();
            _this.request(url);
            setTimeout(Lampa.Select.close, 10);
          }
        } else if (type === 'sort') {
          Lampa.Select.close();
          object.lampac_custom_select = a.source;
          _this.changeBalanser(a.source);
        }
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
      this.externalids().then(function() {
        return _this.createSource();
      }).then(function(json) {
        if (!balansers_with_search.find(function(b) { return balanser.slice(0, b.length) === b; })) {
          filter.render().find('.filter--search').addClass('hide');
        }
        _this.search();
      }).catch(function(e) { _this.noConnectToServer(e); });
    };

    this.rch = function(json, noreset) {
      var _this2 = this;
      var load = function load() {
        if (hubConnection) {
          clearTimeout(hub_timer);
          hubConnection.stop();
          hubConnection = null;
          console.log('RCH', 'hubConnection stop');
        }
        hubConnection = new signalR.HubConnectionBuilder().withUrl(json.ws).build();
        hubConnection.start().then(function() {
          window.rch.Registry(URL_ABMSX_TECH, hubConnection, function() {
            console.log('RCH', 'hubConnection start');
            if (!noreset) _this2.find();
            else noreset();
          });
        }).catch(function(err) {
          console.log('RCH', err.toString());
          console.error(err.toString());
        });
        if (json.keepalive > 0) {
          hub_timer = setTimeout(function() { hubConnection.stop(); hubConnection = null; }, 1000 * json.keepalive);
        }
      };
      if (typeof signalR === 'undefined') {
        Lampa.Utils.putScript([URL_SIGNALR], function() {}, false, function() { load(); }, true);
      } else load();
    };

    this.externalids = function() {
      return new Promise(function(resolve, reject) {
        if (!object.movie.imdb_id || !object.movie.kinopoisk_id) {
          var query = [];
          query.push('id=' + object.movie.id);
          query.push('serial=' + (object.movie.name ? 1 : 0));
          if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || ''));
          if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
          var url = Defined.localhost + 'externalids?' + query.join('&');
          network.timeout(10000);
          network.silent(account(url), function(json) {
            for (var name in json) { object.movie[name] = json[name]; }
            resolve();
          }, function() { resolve(); });
        } else resolve();
      });
    };

    this.updateBalanser = function(balanser_name) {
      var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 2000, {});
      last_select_balanser[object.movie.id] = balanser_name;
      Lampa.Storage.set('online_last_balanser', last_select_balanser);
    };

    this.changeBalanser = function(balanser_name) {
      this.updateBalanser(balanser_name);
      Lampa.Storage.set('online_balanser', balanser_name);
      var to = this.getChoice(balanser_name);
      var from = this.getChoice();
      if (from.voice_name) { to.voice_name = from.voice_name; }
      this.saveChoice(to, balanser_name);
      Lampa.Activity.replace();
    };

    this.requestParams = function(url) {
      if (balanser && balanser.toLowerCase() === 'filmixtv') { url = URL_RC_FXAPI; }
      var query = [];
      var card_source = object.movie.source || 'tmdb';
      query.push('id=' + object.movie.id);
      if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || ''));
      if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
      query.push('title=' + encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name));
      query.push('original_title=' + encodeURIComponent(object.movie.original_title || object.movie.original_name));
      query.push('serial=' + (object.movie.name ? 1 : 0));
      query.push('original_language=' + (object.movie.original_language || ''));
      query.push('year=' + ((object.movie.release_date || object.movie.first_air_date || '0000') + '').slice(0, 4));
      query.push('source=' + card_source);
      query.push('rchtype=' + (window.rch ? window.rch.type : ''));
      query.push('clarification=' + (object.clarification ? 1 : 0));
      if (Lampa.Storage.get('account_email', '')) { query.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', ''))); }
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
    };

    this.getChoice = function(for_balanser) {
      var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
      var save = data[object.movie.id] || {};
      Lampa.Arrays.extend(save, { season: 0, voice: 0, voice_name: '', voice_id: 0, episodes_view: {}, movie_view: '' });
      return save;
    };

    this.saveChoice = function(choice, for_balanser) {
      var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
      data[object.movie.id] = choice;
      Lampa.Storage.set('online_choice_' + (for_balanser || balanser), data);
      this.updateBalanser(for_balanser || balanser);
    };

    this.replaceChoice = function(choice, for_balanser) {
      var to = this.getChoice(for_balanser);
      Lampa.Arrays.extend(to, choice, true);
      this.saveChoice(to, for_balanser);
    };

    this.clearImages = function() {
      images.forEach(function(img) {
        img.onerror = function() {};
        img.onload = function() {};
        img.src = '';
      });
      images = [];
    };

    this.reset = function() {
      last = false;
      clearInterval(balanser_timer);
      network.clear();
      this.clearImages();
      scroll.render().find('.empty').remove();
      scroll.clear();
      scroll.reset();
      scroll.body().append(Lampa.Template.get('lampac_content_loading'));
    };

    this.loading = function(status) {
      if (status) this.activity.loader(true);
      else {
        this.activity.loader(false);
        this.activity.toggle();
      }
    };

    this.filter = function(filter_items, choice) {
      var _this7 = this;
      var select = [];
      var add = function add(type, title) {
        var need = _this7.getChoice();
        var items = filter_items[type];
        var subitems = [];
        var value = need[type];
        items.forEach(function(name, i) {
          subitems.push({ title: name, selected: value == i, index: i });
        });
        select.push({ title: title, subtitle: items[value], items: subitems, stype: type });
      };
      filter_items.source = filter_sources;
      select.push({ title: Lampa.Lang.translate('torrent_parser_reset'), reset: true });
      this.saveChoice(choice);
      if (filter_items.voice && filter_items.voice.length) { add('voice', Lampa.Lang.translate('torrent_parser_voice')); }
      if (filter_items.season && filter_items.season.length) { add('season', Lampa.Lang.translate('torrent_serial_season')); }
      filter.set('filter', select);
      filter.set('sort', filter_sources.map(function(e) {
        return { title: sources[e].name, source: e, selected: e == balanser, ghost: !sources[e].show };
      }));
      this.selected(filter_items);
    };

    this.selected = function(filter_items) {
      var need = this.getChoice(), select = [];
      for (var i in need) {
        if (filter_items[i] && filter_items[i].length) {
          if (i === 'voice') { select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]); }
          else if (i !== 'source') { if (filter_items.season.length >= 1) { select.push(filter_translate.season + ': ' + filter_items[i][need[i]]); } }
        }
      }
      filter.chosen('filter', select);
      filter.chosen('sort', [sources[balanser].name]);
    };

    this.getEpisodes = function(season, call) {
      var episodes = [];
      if (['cub', 'tmdb'].indexOf(object.movie.source || 'tmdb') === -1) return call(episodes);
      if (typeof object.movie.id === 'number' && object.movie.name) {
        var tmdburl = 'tv/' + object.movie.id + '/season/' + season + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru');
        var baseurl = Lampa.TMDB.api(tmdburl);
        network.timeout(10000);
        network["native"](baseurl, function(data) {
          episodes = data.episodes || [];
          call(episodes);
        }, function(a, c) { call(episodes); });
      } else call(episodes);
    };

    this.watched = function(set) {
      var file_id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var watched = Lampa.Storage.cache('online_watched_last', 5000, {});
      if (set) {
        if (!watched[file_id]) { watched[file_id] = {}; }
        Lampa.Arrays.extend(watched[file_id], set, true);
        Lampa.Storage.set('online_watched_last', watched);
        this.updateWatched();
      } else { return watched[file_id]; }
    };

    this.updateWatched = function() {
      var watched = this.watched();
      var body = scroll.body().find('.online-prestige-watched .online-prestige-watched__body').empty();
      if (watched) {
        var line = [];
        if (watched.balanser_name) { line.push(watched.balanser_name); }
        if (watched.voice_name) { line.push(watched.voice_name); }
        if (watched.season) { line.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + watched.season); }
        if (watched.episode) { line.push(Lampa.Lang.translate('torrent_serial_episode') + ' ' + watched.episode); }
        line.forEach(function(n) { body.append('<span>' + n + '</span>'); });
      } else { body.append('<span>' + Lampa.Lang.translate('lampac_no_watch_history') + '</span>'); }
    };

    this.draw = function(items) {
      var _this8 = this;
      var params = arguments.length > 1 ? arguments[1] : {};
      if (!items.length) return this.empty();
      scroll.clear();
      scroll.append(Lampa.Template.get('lampac_prestige_watched', {}));
      this.updateWatched();
      this.getEpisodes(items[0].season, function(episodes) {
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var serial = object.movie.name ? true : false;
        var choice = _this8.getChoice();
        var fully = window.innerWidth > 480;
        var scroll_to_element = false;
        var scroll_to_mark = false;
        items.forEach(function(element, index) {
          var episode = serial && episodes.length && !params.similars ? episodes.find(function(e) { return e.episode_number == element.episode; }) : false;
          var episode_num = element.episode || index + 1;
          var episode_last = choice.episodes_view[element.season];
          var voice_name = choice.voice_name || (filter_find.voice[0] ? filter_find.voice[0].title : false) || element.voice_name || (serial ? 'Неизвестно' : element.text) || 'Неизвестно';
          if (element.quality) {
            element.qualitys = element.quality;
            element.quality = Lampa.Arrays.getKeys(element.quality)[0];
          }
          Lampa.Arrays.extend(element, {
            voice_name: voice_name,
            info: voice_name.length > 60 ? voice_name.substr(0, 60) + '...' : voice_name,
            quality: '',
            time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true)
          });
          var hash_timeline = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var hash_behold = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title, element.voice_name].join('') : object.movie.original_title + element.voice_name);
          var data = { hash_timeline: hash_timeline, hash_behold: hash_behold };
          var info = [];
          if (element.season) {
            element.translate_episode_end = _this8.getLastEpisode(items);
            element.translate_voice = element.voice_name;
          }
          if (element.text && !episode) { element.title = element.text; }
          element.timeline = Lampa.Timeline.view(hash_timeline);
          if (episode) {
            element.title = episode.name;
            if (element.info.length < 30 && episode.vote_average) {
              info.push(Lampa.Template.get('lampac_prestige_rate', { rate: parseFloat(episode.vote_average + '').toFixed(1) }, true));
            }
            if (episode.air_date && fully) { info.push(Lampa.Utils.parseTime(episode.air_date).full); }
          } else if (object.movie.release_date && fully) {
            info.push(Lampa.Utils.parseTime(object.movie.release_date).full);
          }
          if (!serial && object.movie.tagline && element.info.length < 30) { info.push(object.movie.tagline); }
          if (element.info) { info.push(element.info); }
          if (info.length) {
            element.info = info.map(function(i) { return '<span>' + i + '</span>'; }).join('<span class="online-prestige-split">●</span>');
          }
          var html = Lampa.Template.get('lampac_prestige_full', element);
          var loader = html.find('.online-prestige__loader');
          var image = html.find('.online-prestige__img');
          if (!serial) {
            if (choice.movie_view == hash_behold) { scroll_to_element = html; }
          } else if (typeof episode_last !== 'undefined' && episode_last == episode_num) {
            scroll_to_element = html;
          }
          if (serial && !episode) {
            image.append('<div class="online-prestige__episode-number">' + ('0' + (element.episode || index + 1)).slice(-2) + '</div>');
            loader.remove();
          } else if (!serial && ['cub', 'tmdb'].indexOf(object.movie.source || 'tmdb') === -1) {
            loader.remove();
          } else {
            var img = html.find('img')[0];
            img.onerror = function() { img.src = URL_IMG_BROKEN; };
            img.onload = function() {
              image.addClass('online-prestige__img--loaded');
              loader.remove();
              if (serial) { image.append('<div class="online-prestige__episode-number">' + ('0' + (element.episode || index + 1)).slice(-2) + '</div>'); }
            };
            img.src = Lampa.TMDB.image('t/p/w300' + (episode ? episode.still_path : object.movie.backdrop_path));
            images.push(img);
          }
          html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline));
          if (viewed.indexOf(hash_behold) !== -1) {
            scroll_to_mark = html;
            html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
          }
          element.mark = function() {
            viewed = Lampa.Storage.cache('online_view', 5000, []);
            if (viewed.indexOf(hash_behold) === -1) {
              viewed.push(hash_behold);
              Lampa.Storage.set('online_view', viewed);
              if (html.find('.online-prestige__viewed').length === 0) {
                html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
              }
            }
            choice = _this8.getChoice();
            if (!serial) { choice.movie_view = hash_behold; }
            else { choice.episodes_view[element.season] = episode_num; }
            _this8.saveChoice(choice);
            var voice_name_text = choice.voice_name || element.voice_name || element.title;
            if (voice_name_text.length > 30) { voice_name_text = voice_name_text.slice(0, 30) + '...'; }
            _this8.watched({
              balanser: balanser,
              balanser_name: Lampa.Utils.capitalizeFirstLetter(sources[balanser].name.split(' ')[0]),
              voice_id: choice.voice_id,
              voice_name: voice_name_text,
              episode: element.episode,
              season: element.season
            });
          };
          element.unmark = function() {
            viewed = Lampa.Storage.cache('online_view', 5000, []);
            if (viewed.indexOf(hash_behold) !== -1) {
              Lampa.Arrays.remove(viewed, hash_behold);
              Lampa.Storage.set('online_view', viewed);
              Lampa.Storage.remove('online_view', hash_behold);
              html.find('.online-prestige__viewed').remove();
            }
          };
          element.timeclear = function() {
            element.timeline.percent = 0;
            element.timeline.time = 0;
            element.timeline.duration = 0;
            Lampa.Timeline.update(element.timeline);
          };
          html.on('hover:enter', function() {
            if (object.movie.id) {
              Lampa.Favorite.add('history', object.movie, 100);
              var user = Lampa.Storage.get('ab_account');
              if (object && object.movie && user) {
                try {
                  $.ajax(URL_TRACKER, {
                    method: 'post',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      "balancer": balanser,
                      "id": object.movie.id,
                      "token": user.token,
                      "userId": user.id,
                      "name": object.search,
                      "season": element.season || 0,
                      "episode": element.episode || 0
                    }),
                    error: function(e) { console.log('track error request', e); }
                  });
                } catch(e) { console.log('track error', e); }
              }
            }
            if (params.onEnter) { params.onEnter(element, html, data); }
          }).on('hover:focus', function(e) {
            last = e.target;
            if (params.onFocus) { params.onFocus(element, html, data); }
            scroll.update($(e.target), true);
          });
          if (params.onRender) { params.onRender(element, html, data); }
          _this8.contextMenu({
            html: html,
            element: element,
            onFile: function(call) {
              if (params.onContextMenu) { params.onContextMenu(element, html, data, call); }
            },
            onClearAllMark: function() { items.forEach(function(elem) { elem.unmark(); }); },
            onClearAllTime: function() { items.forEach(function(elem) { elem.timeclear(); }); }
          });
          scroll.append(html);
        });
        if (serial && episodes.length > items.length && !params.similars) {
          var left = episodes.slice(items.length);
          left.forEach(function(episode) {
            var info = [];
            if (episode.vote_average) {
              info.push(Lampa.Template.get('lampac_prestige_rate', { rate: parseFloat(episode.vote_average + '').toFixed(1) }, true));
            }
            if (episode.air_date) { info.push(Lampa.Utils.parseTime(episode.air_date).full); }
            var air = new Date((episode.air_date + '').replace(/-/g, '/'));
            var now = Date.now();
            var day = Math.round((air.getTime() - now) / (24 * 60 * 60 * 1000));
            var txt = Lampa.Lang.translate('full_episode_days_left') + ': ' + day;
            var html = Lampa.Template.get('lampac_prestige_full', {
              time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true),
              info: info.length ? info.map(function(i) { return '<span>' + i + '</span>'; }).join('<span class="online-prestige-split">●</span>') : '',
              title: episode.name,
              quality: day > 0 ? txt : ''
            });
            var loader = html.find('.online-prestige__loader');
            var image = html.find('.online-prestige__img');
            var season = items[0] ? items[0].season : 1;
            html.find('.online-prestige__timeline').append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([season, episode.episode_number, object.movie.original_title].join('')))));
            var img = html.find('img')[0];
            if (episode.still_path) {
              img.onerror = function() { img.src = URL_IMG_BROKEN; };
              img.onload = function() {
                image.addClass('online-prestige__img--loaded');
                loader.remove();
                image.append('<div class="online-prestige__episode-number">' + ('0' + episode.episode_number).slice(-2) + '</div>');
              };
              img.src = Lampa.TMDB.image('t/p/w300' + episode.still_path);
              images.push(img);
            } else {
              loader.remove();
              image.append('<div class="online-prestige__episode-number">' + ('0' + episode.episode_number).slice(-2) + '</div>');
            }
            html.on('hover:focus', function(e) { last = e.target; scroll.update($(e.target), true); });
            html.css('opacity', '0.5');
            scroll.append(html);
          });
        }
        if (scroll_to_element) { last = scroll_to_element[0]; }
        else if (scroll_to_mark) { last = scroll_to_mark[0]; }
        Lampa.Controller.enable('content');
      });
    };

    this.contextMenu = function(params) {
      params.html.on('hover:long', function() {
        function show(extra) {
          var enabled = Lampa.Controller.enabled().name;
          var menu = [];
          if (Lampa.Platform.is('webos')) { menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Webos', player: 'webos' }); }
          if (Lampa.Platform.is('android')) { menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Android', player: 'android' }); }
          menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Lampa', player: 'lampa' });
          menu.push({ title: Lampa.Lang.translate('lampac_video'), separator: true });
          menu.push({ title: Lampa.Lang.translate('torrent_parser_label_title'), mark: true });
          menu.push({ title: Lampa.Lang.translate('torrent_parser_label_cancel_title'), unmark: true });
          menu.push({ title: Lampa.Lang.translate('time_reset'), timeclear: true });
          if (extra) { menu.push({ title: Lampa.Lang.translate('copy_link'), copylink: true }); }
          menu.push({ title: Lampa.Lang.translate('more'), separator: true });
          if (Lampa.Account.logged() && params.element && typeof params.element.season !== 'undefined' && params.element.translate_voice) {
            menu.push({ title: Lampa.Lang.translate('lampac_voice_subscribe'), subscribe: true });
          }
          menu.push({ title: Lampa.Lang.translate('lampac_clear_all_marks'), clearallmark: true });
          menu.push({ title: Lampa.Lang.translate('lampac_clear_all_timecodes'), timeclearall: true });
          Lampa.Select.show({
            title: Lampa.Lang.translate('title_action'),
            items: menu,
            onBack: function() { Lampa.Controller.toggle(enabled); },
            onSelect: function(a) {
              if (a.mark) { params.element.mark(); }
              if (a.unmark) { params.element.unmark(); }
              if (a.timeclear) { params.element.timeclear(); }
              if (a.clearallmark) { params.onClearAllMark(); }
              if (a.timeclearall) { params.onClearAllTime(); }
              Lampa.Controller.toggle(enabled);
              if (a.player) { Lampa.Player.runas(a.player); params.html.trigger('hover:enter'); }
              if (a.copylink) {
                if (extra.quality) {
                  var qual = [];
                  for (var i in extra.quality) { qual.push({ title: i, file: extra.quality[i] }); }
                  Lampa.Select.show({
                    title: Lampa.Lang.translate('settings_server_links'),
                    items: qual,
                    onBack: function() { Lampa.Controller.toggle(enabled); },
                    onSelect: function(b) {
                      Lampa.Utils.copyTextToClipboard(b.file, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_secuses')); }, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_error')); });
                    }
                  });
                } else {
                  Lampa.Utils.copyTextToClipboard(extra.file, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_secuses')); }, function() { Lampa.Noty.show(Lampa.Lang.translate('copy_error')); });
                }
              }
              if (a.subscribe) {
                Lampa.Account.subscribeToTranslation({
                  card: object.movie,
                  season: params.element.season,
                  episode: params.element.translate_episode_end,
                  voice: params.element.translate_voice
                }, function() { Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_success')); }, function() { Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_error')); });
              }
            }
          });
        }
        params.onFile(show);
      }).on('hover:focus', function() {
        if (Lampa.Helper) { Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.html); }
      });
    };

    this.empty = function() {
      var html = Lampa.Template.get('lampac_does_not_answer', {});
      html.find('.online-empty__buttons').remove();
      html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two'));
      html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text'));
      scroll.clear();
      scroll.append(html);
      this.loading(false);
    };

    this.noConnectToServer = function(er) {
      var html = Lampa.Template.get('lampac_does_not_answer', {});
      html.find('.online-empty__buttons').remove();
      html.find('.online-empty__title').text(Lampa.Lang.translate('title_error'));
      html.find('.online-empty__time').text(er && er.accsdb ? er.msg : Lampa.Lang.translate('lampac_does_not_answer_text').replace('{balanser}', sources[balanser].name));
      scroll.clear();
      scroll.append(html);
      this.loading(false);
    };

    this.doesNotAnswer = function(er) {
      var _this9 = this;
      this.reset();
      var html = Lampa.Template.get('lampac_does_not_answer', { balanser: balanser });
      if (er && er.accsdb) { html.find('.online-empty__title').html(er.msg); }
      var tic = (er && er.accsdb) ? 10 : 5;
      html.find('.cancel').on('hover:enter', function() { clearInterval(balanser_timer); });
      html.find('.change').on('hover:enter', function() { clearInterval(balanser_timer); filter.render().find('.filter--sort').trigger('hover:enter'); });
      scroll.clear();
      scroll.append(html);
      this.loading(false);
      balanser_timer = setInterval(function() {
        tic--;
        html.find('.timeout').text(tic);
        if (tic === 0) {
          clearInterval(balanser_timer);
          var keys = Lampa.Arrays.getKeys(sources);
          var indx = keys.indexOf(balanser);
          var next = keys[indx + 1];
          if (!next) { next = keys[0]; }
          balanser = next;
          if (Lampa.Activity.active().activity === _this9.activity) { _this9.changeBalanser(balanser); }
        }
      }, 1000);
    };

    this.getLastEpisode = function(items) {
      var last_episode = 0;
      items.forEach(function(e) {
        if (typeof e.episode !== 'undefined') { last_episode = Math.max(last_episode, parseInt(e.episode)); }
      });
      return last_episode;
    };

    this.start = function() {
      if (Lampa.Activity.active().activity !== this.activity) return;
      if (!initialized) {
        initialized = true;
        this.initialize();
      }
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
      Lampa.Controller.add('content', {
        toggle: function() {
          Lampa.Controller.collectionSet(scroll.render(), files.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        },
        gone: function() { clearTimeout(balanser_timer); },
        up: function() { if (Navigator.canmove('up')) { Navigator.move('up'); } else { Lampa.Controller.toggle('head'); } },
        down: function() { Navigator.move('down'); },
        right: function() { if (Navigator.canmove('right')) { Navigator.move('right'); } else { filter.show(Lampa.Lang.translate('title_filter'), 'filter'); } },
        left: function() { if (Navigator.canmove('left')) { Navigator.move('left'); } else { Lampa.Controller.toggle('menu'); } },
        back: this.back.bind(this)
      });
      Lampa.Controller.toggle('content');
    };

    this.render = function() { return files.render(); };
    this.back = function() { Lampa.Activity.backward(); };
    this.pause = function() {};
    this.stop = function() {};
    this.destroy = function() {
      network.clear();
      this.clearImages();
      files.destroy();
      scroll.destroy();
      clearInterval(balanser_timer);
      clearTimeout(number_of_requests_timer);
      clearTimeout(hub_timer);
      if (hubConnection) { hubConnection.stop(); hubConnection = null; }
    };
  }

  function resetTemplates() {
    Lampa.Template.add('lampac_prestige_full',
      "<div class=\"online-prestige online-prestige--full selector\">" +
        "<div class=\"online-prestige__img\">" +
          "<img alt=\"\">" +
          "<div class=\"online-prestige__loader\" style=\"background: url(" + URL_IMG_LOADER + ") no-repeat 50% 50%; background-size: contain;\"></div>" +
        "</div>" +
        "<div class=\"online-prestige__body\">" +
          "<div class=\"online-prestige__head\">" +
            "<div class=\"online-prestige__title\">{title}</div>" +
            "<div class=\"online-prestige__time\">{time}</div>" +
          "</div>" +
          "<div class=\"online-prestige__timeline\"></div>" +
          "<div class=\"online-prestige__footer\">" +
            "<div class=\"online-prestige__info\">{info}</div>" +
            "<div class=\"online-prestige__quality\">{quality}</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
    Lampa.Template.add('lampac_content_loading',
      "<div class=\"online-empty\">" +
        "<div class=\"broadcast__scan\"><div></div></div>" +
        "<div class=\"online-empty__templates\">" +
          "<div class=\"online-empty-template selector\">" +
            "<div class=\"online-empty-template__ico\" style=\"background: url(" + URL_IMG_LOADER + ") no-repeat center center; background-size: contain;\"></div>" +
            "<div class=\"online-empty-template__body\"></div>" +
          "</div>" +
          "<div class=\"online-empty-template\">" +
            "<div class=\"online-empty-template__ico\" style=\"background: url(" + URL_IMG_LOADER + ") no-repeat center center; background-size: contain;\"></div>" +
            "<div class=\"online-empty-template__body\"></div>" +
          "</div>" +
          "<div class=\"online-empty-template\">" +
            "<div class=\"online-empty-template__ico\" style=\"background: url(" + URL_IMG_LOADER + ") no-repeat center center; background-size: contain;\"></div>" +
            "<div class=\"online-empty-template__body\"></div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
    Lampa.Template.add('lampac_does_not_answer',
      "<div class=\"online-empty\">" +
        "<div class=\"online-empty__title\">#{lampac_balanser_dont_work}</div>" +
        "<div class=\"online-empty__time\">#{lampac_balanser_timeout}</div>" +
        "<div class=\"online-empty__buttons\">" +
          "<div class=\"online-empty__button selector cancel\">#{cancel}</div>" +
          "<div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>" +
        "</div>" +
      "</div>"
    );
    Lampa.Template.add('lampac_css',
      "<style>" +
      "@charset 'UTF-8';" +
      ".online-prestige {position:relative; border-radius:0.3em; background-color:rgba(0,0,0,0.3); display:flex;}" +
      ".online-prestige__img {position:relative; width:13em; flex-shrink:0; min-height:8.2em;}" +
      ".online-prestige__img > img {position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; border-radius:0.3em; opacity:0; transition:opacity .3s;}" +
      ".online-prestige__img--loaded > img {opacity:1;}" +
      "@media screen and (max-width:480px) {.online-prestige__img {width:7em; min-height:6em;}}" +
      ".online-prestige__loader {position:absolute; top:50%; left:50%; width:2em; height:2em; margin-left:-1em; margin-top:-1em; background: url(" + URL_IMG_LOADER + ") no-repeat center center; background-size:contain;}" +
      ".online-prestige__img img:after {content:''; display:block; background: url(" + URL_IMG_BROKEN + ") no-repeat center center;}" +
      "</style>"
    );
    $('body').append(Lampa.Template.get('lampac_css', {}, true));
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
        return {
          name: Lampa.Lang.translate('lampac_watch'),
          description: 'Плагин для просмотра онлайн сериалов и фильмов'
        };
      },
      onContextLauch: function(object) {
        resetTemplates();
        Lampa.Component.add('lampac', component);
        var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
        var all = Lampa.Storage.get('clarification_search','{}');
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
    Lampa.Lang.add({
      lampac_watch: { ru: 'Онлайн', en: 'Online', uk: 'Онлайн', zh: '在线观看' },
      lampac_video: { ru: 'Видео', en: 'Video', uk: 'Відео', zh: '视频' },
      lampac_no_watch_history: { ru: 'Нет истории просмотра', en: 'No browsing history', ua: 'Немає історії перегляду', zh: '没有浏览历史' },
      lampac_nolink: { ru: 'Не удалось извлечь ссылку', uk: 'Неможливо отримати посилання', en: 'Failed to fetch link', zh: '获取链接失败' },
      lampac_balanser: { ru: 'Источник', uk: 'Джерело', en: 'Source', zh: '来源' },
      helper_online_file: { ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню', uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню', en: 'Hold the "OK" key to bring up the context menu', zh: '按住“确定”键调出上下文菜单' },
      title_online: { ru: 'Онлайн', uk: 'Онлайн', en: 'Online', zh: '在线的' },
      lampac_voice_subscribe: { ru: 'Подписаться на перевод', uk: 'Підписатися на переклад', en: 'Subscribe to translation', zh: '订阅翻译' },
      lampac_voice_success: { ru: 'Вы успешно подписались', uk: 'Ви успішно підписалися', en: 'You have successfully subscribed', zh: '您已成功订阅' },
      lampac_voice_error: { ru: 'Возникла ошибка', uk: 'Виникла помилка', en: 'An error has occurred', zh: '发生了错误' },
      lampac_clear_all_marks: { ru: 'Очистить все метки', uk: 'Очистити всі мітки', en: 'Clear all labels', zh: '清除所有标签' },
      lampac_clear_all_timecodes: { ru: 'Очистить все тайм-коды', uk: 'Очистити всі тайм-коди', en: 'Clear all timecodes', zh: '清除所有时间代码' },
      lampac_change_balanser: { ru: 'Изменить балансер', uk: 'Змінити балансер', en: 'Change balancer', zh: '更改平衡器' },
      lampac_balanser_dont_work: { ru: 'Поиск на ({balanser}) не дал результатов', uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results', zh: '搜索 ({balanser}) 未返回任何结果' },
      lampac_balanser_timeout: { ru: 'Источник будет переключен автоматически через <span class="timeout">10</span> секунд.', uk: 'Джерело буде автоматично переключено через <span class="timeout">10</span> секунд.', en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.', zh: '平衡器将在<span class="timeout">10</span>秒内自动切换。' },
      lampac_does_not_answer_text: { ru: 'Поиск на ({balanser}) не дал результатов', uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results', zh: '搜索 ({balanser}) 未返回任何结果' }
    });
    Lampa.Template.add('lampac_css', "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat 50% 50%;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        </style>\n    ");
    $('body').append(Lampa.Template.get('lampac_css', {}, true));
  }

  if (!window.lampac_plugin) { startPlugin(); }

})();
