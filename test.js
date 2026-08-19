(function() {
  'use strict';

  function decodeHidden(input) {
    try {
      return decodeURIComponent(escape(atob(input)));
    } catch (e) {
      return atob(input);
    }
  }

  var AB_HOST = 'https://ab2024.ru';
  var AB_HOST_SLASH = AB_HOST + '/';
  var AB_UID = decodeHidden('NGV6dTgzN28=');
  var AB_TOKENS = [
    decodeHidden('0LzQsNGALjMx'),
    decodeHidden('VG90YWzhuLThv1VLMFBSSU1FVEVBTQ=='),
    decodeHidden('0YHQtdC90YLRj9Cx0YDRjA=='),
    decodeHidden('0LjRjtC90Yw5OQ==')
  ];
  var abTokenIndex = 0;

  function getAbToken() {
    return AB_TOKENS[abTokenIndex] || AB_TOKENS[0] || '';
  }

  function rotateAbToken() {
    if (AB_TOKENS.length < 2) return false;
    abTokenIndex = (abTokenIndex + 1) % AB_TOKENS.length;
    return true;
  }

  function isAuthError(data) {
    if (!data) return false;
    if (data.accsdb) return true;
    if (typeof data.status == 'number' && (data.status === 401 || data.status === 403)) return true;
    var text = '';
    if (typeof data == 'string') text = data;
    else if (data.msg) text = data.msg;
    else if (data.message) text = data.message;
    text = (text || '').toLowerCase();
    return text.indexOf('token') >= 0 || text.indexOf('auth') >= 0 || text.indexOf('forbidden') >= 0 || text.indexOf('unauthorized') >= 0 || text.indexOf('доступ') >= 0;
  }

  function withAuthRetry(makeRequest, onSuccess, onError) {
    var retried = false;

    function success(data) {
      if (!retried && isAuthError(data) && rotateAbToken()) {
        retried = true;
        makeRequest(success, failure);
        return;
      }
      onSuccess(data);
    }

    function failure(error) {
      if (!retried && isAuthError(error) && rotateAbToken()) {
        retried = true;
        makeRequest(success, failure);
        return;
      }
      onError(error);
    }

    makeRequest(success, failure);
  }

  var Defined = {
    api: 'lampac',
    localhost: AB_HOST_SLASH,
    apn: ''
  };

  var balansers_with_search;

    function getAndroidVersion() {
  if (Lampa.Platform.is('android')) {
    try {
      var current = AndroidJS.appVersion().split('-');
      return parseInt(current.pop());
    } catch (e) {
      return 0;
    }
  } else {
    return 0;
  }
}

var hostkey = AB_HOST.replace('http://', '').replace('https://', '');

if (!window.rch_nws || !window.rch_nws[hostkey]) {
  if (!window.rch_nws) window.rch_nws = {};

  window.rch_nws[hostkey] = {
    type: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : undefined,
    startTypeInvoke: false,
    rchRegistry: false,
    apkVersion: getAndroidVersion()
  };
}

window.rch_nws[hostkey].typeInvoke = function rchtypeInvoke(host, call) {
  if (!window.rch_nws[hostkey].startTypeInvoke) {
    window.rch_nws[hostkey].startTypeInvoke = true;

    var check = function check(good) {
      window.rch_nws[hostkey].type = Lampa.Platform.is('android') ? 'apk' : good ? 'cors' : 'web';
      call();
    };

    if (Lampa.Platform.is('android') || Lampa.Platform.is('tizen')) check(true);
    else {
      var net = new Lampa.Reguest();
      net.silent(AB_HOST.indexOf(location.host) >= 0 ? 'https://github.com/' : host + '/cors/check', function() {
        check(true);
      }, function() {
        check(false);
      }, false, {
        dataType: 'text'
      });
    }
  } else call();
};

window.rch_nws[hostkey].Registry = function RchRegistry(client, startConnection) {
  window.rch_nws[hostkey].typeInvoke(AB_HOST, function() {

    client.invoke("RchRegistry", {
      host: location.host,
      rchtype: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : (window.rch_nws[hostkey].type || 'web'),
      apkVersion: Lampa.Platform.is('android') ? (window.rch_nws[hostkey].apkVersion || 0) : 0,
      player: Lampa.Storage.field('player')
    });

    if (window.rch_nws[hostkey].rchRegistry)
      return;

    window.rch_nws[hostkey].rchRegistry = true;

    var handled = false;
    client.on('RchRegistry', function (clientIp, connectionId, rchtype) {
      if (startConnection && !handled) {
	    handled = true;
	    startConnection();
      }
    });

    client.on("RchClient", function(rchId, url, data, headers, returnHeaders) {
      var network = new Lampa.Reguest();

	  function sendResult(uri, html) {
	    $.ajax({
	      url: AB_HOST + '/rch/' + uri + '?id=' + rchId,
	      type: 'POST',
	      data: html,
	      async: true,
	      cache: false,
	      contentType: false,
	      processData: false,
	      success: function(j) {},
	      error: function() {
	        client.invoke("RchResult", rchId, '');
	      }
	    });
	  }

      function result(html) {
        if (Lampa.Arrays.isObject(html) || Lampa.Arrays.isArray(html)) {
          html = JSON.stringify(html);
        }

        if (typeof CompressionStream !== 'undefined' && html && html.length > 1000) {
          var compressionStream = new CompressionStream('gzip');
          var encoder = new TextEncoder();
          var readable = new ReadableStream({
            start: function(controller) {
              controller.enqueue(encoder.encode(html));
              controller.close();
            }
          });
          var compressedStream = readable.pipeThrough(compressionStream);
          new Response(compressedStream).arrayBuffer()
            .then(function(compressedBuffer) {
              var compressedArray = new Uint8Array(compressedBuffer);
              if (compressedArray.length > html.length) {
                sendResult('result', html);
              } else {
                sendResult('gzresult', compressedArray);
              }
            })
            .catch(function() {
              sendResult('result', html);
            });

        } else {
          sendResult('result', html);
        }
      }

      if (url == 'eval') {
        console.log('RCH', url, data);
        result(eval(data));
      } else if (url == 'evalrun') {
        console.log('RCH', url, data);
        eval(data);
      } else if (url == 'ping') {
        result('pong');
      } else {
        console.log('RCH', url);
        network["native"](url, result, function(e) {
          console.log('RCH', 'result empty, ' + e.status);
          result('');
        }, data, {
          dataType: 'text',
          timeout: 1000 * 8,
          headers: headers,
          returnHeaders: returnHeaders
        });
      }
    });

    client.on('Connected', function(connectionId) {
      console.log('RCH', 'ConnectionId: ' + connectionId);
      window.rch_nws[hostkey].connectionId = connectionId;
    });
    client.on('Closed', function() {
      console.log('RCH', 'Connection closed');
    });
    client.on('Error', function(err) {
      console.log('RCH', 'error:', err);
    });
  });
};

  window.rch_nws[hostkey].typeInvoke(AB_HOST, function() {});

  function rchInvoke(json, call) {
    if (!window.nwsClient)
      window.nwsClient = {};

    var client = window.nwsClient[hostkey];
    if (client && client.connectionId != null) {
      call();
    }
    else if (client) {
      console.log('RCH', 'Reconnecting...');
      client.reconnect(function() {
        call();
      });
    }
    else {
      window.nwsClient[hostkey] = new NativeWsClient(json.nws, {
        autoReconnect: true
      });

      window.nwsClient[hostkey].on('Connected', function(connectionId) {
        window.rch_nws[hostkey].Registry(window.nwsClient[hostkey], function() {
          call();
        });
      });

      window.nwsClient[hostkey].connect();
    }
  }

  function rchRun(json, call) {
    if (typeof NativeWsClient == 'undefined') {
      Lampa.Utils.putScript([AB_HOST + '/js/nws-client-es5.js?v21042026'], function() {}, false, function() {
        rchInvoke(json, call);
      }, true);
    } else {
      rchInvoke(json, call);
    }
  }

  function account(url) {
    url = url + '';
    if (url.indexOf('account_email=') == -1) {
      var email = Lampa.Storage.get('account_email');
      if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
    }
    if (url.indexOf('uid=') == -1) {
      url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(AB_UID));
    }
    var abToken = getAbToken();
    if (abToken) {
      if (url.indexOf('ab_token=') == -1) {
        url = Lampa.Utils.addUrlComponent(url, 'ab_token=' + encodeURIComponent(abToken));
      } else {
        url = url.replace(/ab_token=([^&]+)/, 'ab_token=' + encodeURIComponent(abToken));
      }
    }
    if (url.indexOf('nws_id=') == -1) {
      var nws_id = Lampa.Storage.get('lampac_nws_id', '');
      if (nws_id) url = Lampa.Utils.addUrlComponent(url, 'nws_id=' + encodeURIComponent(nws_id));
    }
    return url;
  }

  function addHeaders() {
    var kit_aesgcmkey = Lampa.Storage.get('kit_aesgcmkey', '');
    if (kit_aesgcmkey) return { 'X-Kit-AesGcm': kit_aesgcmkey };
    return {};
  }

  function formatEpisodeNumber(episodeNumber) {
    return (episodeNumber < 10 ? '0' : '') + episodeNumber;
  }

  function novaBadge(season, episodeNumber) {
    if (window.NOVA_VIEW) return window.NOVA_VIEW.episodeBadge(season, episodeNumber);
    return formatEpisodeNumber(episodeNumber);
  }

  var Network = Lampa.Reguest;

  function component(object) {
    var network = new Network();
    var scroll = new Lampa.Scroll({
      mask: true,
      over: true
    });
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
    var life_wait_times = 0;
    var life_wait_timer;
    var filter_sources = {};
    var filter_translate = {
      season: Lampa.Lang.translate('torrent_serial_season'),
      voice: Lampa.Lang.translate('torrent_parser_voice'),
      source: Lampa.Lang.translate('settings_rest_source')
    };
    var filter_find = {
      season: [],
      voice: []
    };

    if (balansers_with_search == undefined) {
      network.timeout(10000);
      withAuthRetry(function(success, failure) {
        network.silent(account(AB_HOST + '/lite/withsearch'), success, failure);
      }, function(json) {
        balansers_with_search = json;
      }, function() {
		  balansers_with_search = [];
	  });
    }

    function balanserName(j) {
      var bals = j.balanser;
      var name = j.name.split(' ')[0];
      return (bals || name).toLowerCase();
    }

	function clarificationSearchAdd(value){
		var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
		var all = Lampa.Storage.get('clarification_search','{}');

		all[id] = value;

		Lampa.Storage.set('clarification_search',all);
	}

	function clarificationSearchDelete(){
		var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
		var all = Lampa.Storage.get('clarification_search','{}');

		delete all[id];

		Lampa.Storage.set('clarification_search',all);
	}

	function clarificationSearchGet(){
		var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
		var all = Lampa.Storage.get('clarification_search','{}');

		return all[id];
	}

    this.initialize = function() {
      var _this = this;
      this.loading(true);
      filter.onSearch = function(value) {

		clarificationSearchAdd(value);

        Lampa.Activity.replace({
          search: value,
          clarification: true,
          similar: true
        });
      };
      filter.onBack = function() {
        _this.start();
      };
      filter.render().find('.selector').on('hover:enter', function() {
        clearInterval(balanser_timer);
      });
      filter.render().find('.filter--search').appendTo(filter.render().find('.torrent-filter'));
      filter.onSelect = function(type, a, b) {
        if (type == 'filter') {
          if (a.reset) {
			  clarificationSearchDelete();

            _this.replaceChoice({
              season: 0,
              voice: 0,
              voice_url: '',
              voice_name: ''
            });
            setTimeout(function() {
              Lampa.Select.close();
              Lampa.Activity.replace({
				  clarification: 0,
				  similar: 0
			  });
            }, 10);
          } else {
            var url = filter_find[a.stype][b.index].url;
            var choice = _this.getChoice();
            if (a.stype == 'voice') {
              choice.voice_name = filter_find.voice[b.index].title;
              choice.voice_url = url;
            }
            choice[a.stype] = b.index;
            _this.saveChoice(choice);
            _this.reset();
            _this.request(url);
            setTimeout(Lampa.Select.close, 10);
          }
        } else if (type == 'sort') {
          Lampa.Select.close();
          object.lampac_custom_select = a.source;
          _this.changeBalanser(a.source);
        }
      };
      if (filter.addButtonBack) filter.addButtonBack();
      filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
      scroll.body().addClass('torrent-list');
      if (window.NOVA_VIEW) {
        window.NOVA_VIEW.install();
        window.NOVA_VIEW.scope(files.render());
      }
      files.appendFiles(scroll.render());
      files.appendHead(filter.render());
      if (window.NOVA_VIEW) window.NOVA_VIEW.unreachable(filter);
      scroll.minus(files.render().find('.explorer__files-head'));
      scroll.body().append(Lampa.Template.get('lampac_content_loading'));
      Lampa.Controller.enable('content');
      this.loading(false);
	  if(object.balanser){
		  files.render().find('.filter--search').remove();
		  sources = {};
		  sources[object.balanser] = {name: object.balanser};
		  balanser = object.balanser;
		  filter_sources = [];

		  return withAuthRetry(function(success, failure) {
		    network["native"](account(object.url.replace('rjson=','nojson=')), success, failure, false, {
            dataType: 'text',
			headers: addHeaders()
		  });
		  }, this.parse.bind(this), function(){
			  files.render().find('.torrent-filter').remove();
			  _this.empty();
		  });
	  }
      this.externalids().then(function() {
        return _this.createSource();
      }).then(function(json) {
        if (!balansers_with_search.find(function(b) {
            return balanser.slice(0, b.length) == b;
          })) {
          filter.render().find('.filter--search').addClass('hide');
        }
        _this.search();
      })["catch"](function(e) {
        _this.noConnectToServer(e);
      });
    };
    this.rch = function(json, noreset) {
      var _this2 = this;
	  rchRun(json, function() {
        if (!noreset) _this2.find();
        else noreset();
	  });
    };
    this.externalids = function() {
      return new Promise(function(resolve, reject) {
        if (!object.movie.imdb_id || !object.movie.kinopoisk_id) {
          var query = [];
          query.push('id=' + encodeURIComponent(object.movie.id));
          query.push('serial=' + (object.movie.name ? 1 : 0));
          if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || ''));
          if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
          var url = Defined.localhost + 'externalids?' + query.join('&');
          network.timeout(10000);
          withAuthRetry(function(success, failure) {
            network.silent(account(url), success, failure, false, {
              headers: addHeaders()
		  });
          }, function(json) {
            for (var name in json) {
              object.movie[name] = json[name];
            }
            resolve();
          }, function() {
            resolve();
          });
        } else resolve();
      });
    };
    this.updateBalanser = function(balanser_name) {
      var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
      last_select_balanser[object.movie.id] = balanser_name;
      Lampa.Storage.set('online_last_balanser', last_select_balanser);
    };
    this.changeBalanser = function(balanser_name) {
      this.updateBalanser(balanser_name);
      Lampa.Storage.set('online_balanser', balanser_name);
      var to = this.getChoice(balanser_name);
      var from = this.getChoice();
      if (from.voice_name) to.voice_name = from.voice_name;
      this.saveChoice(to, balanser_name);
      Lampa.Activity.replace();
    };
    this.requestParams = function(url) {
      var query = [];
      var card_source = object.movie.source || 'tmdb';
      query.push('id=' + encodeURIComponent(object.movie.id));

      if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || ''));
      if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
      if (object.movie.tmdb_id) query.push('tmdb_id=' + (object.movie.tmdb_id || ''));

      if (object.movie.keywords && object.movie.keywords.results) {
         for (var i = 0, a = object.movie.keywords.results; i < a.length; i++) {
            if (a[i].name == 'anime') {
                query.push('anime=1');
                break;
            }
         }
      }

      query.push('title=' + encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name));
      query.push('original_title=' + encodeURIComponent(object.movie.original_title || object.movie.original_name));
      query.push('serial=' + (object.movie.name ? 1 : 0));
      query.push('original_language=' + (object.movie.original_language || ''));
      query.push('year=' + ((object.movie.release_date || object.movie.first_air_date || '0000') + '').slice(0, 4));
      query.push('source=' + card_source);
      query.push('clarification=' + (object.clarification ? 1 : 0));
      query.push('similar=' + (object.similar ? true : false));
      query.push('rchtype=' + (((window.rch_nws && window.rch_nws[hostkey]) ? window.rch_nws[hostkey].type : (window.rch && window.rch[hostkey]) ? window.rch[hostkey].type : '') || ''));
      if (Lampa.Storage.get('account_email', '')) query.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', '')));
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
    };
    this.getLastChoiceBalanser = function() {
      var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
      if (last_select_balanser[object.movie.id]) {
        return last_select_balanser[object.movie.id];
      } else {
        return Lampa.Storage.get('online_balanser', filter_sources.length ? filter_sources[0] : '');
      }
    };
    this.startSource = function(json) {
      return new Promise(function(resolve, reject) {
        json.forEach(function(j) {
          var name = balanserName(j);
          sources[name] = {
            url: j.url,
            name: j.name,
            show: typeof j.show == 'undefined' ? true : j.show
          };
        });
        filter_sources = Lampa.Arrays.getKeys(sources);
        if (filter_sources.length) {
          var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
          if (last_select_balanser[object.movie.id]) {
            balanser = last_select_balanser[object.movie.id];
          } else {
            balanser = Lampa.Storage.get('online_balanser', filter_sources[0]);
          }
          if (!sources[balanser]) balanser = filter_sources[0];
          if (!sources[balanser].show && !object.lampac_custom_select) balanser = filter_sources[0];
          source = sources[balanser].url;
          Lampa.Storage.set('active_balanser', balanser);
          resolve(json);
        } else {
          reject();
        }
      });
    };
    this.lifeSource = function() {
      var _this3 = this;
      return new Promise(function(resolve, reject) {
        var url = _this3.requestParams(Defined.localhost + 'lifeevents?memkey=' + (_this3.memkey || ''));
        var red = false;
        var gou = function gou(json, any) {
          if (json.accsdb) return reject(json);
          var last_balanser = _this3.getLastChoiceBalanser();
          if (!red) {
            var _filter = json.online.filter(function(c) {
              return any ? c.show : c.show && c.name.toLowerCase() == last_balanser;
            });
            if (_filter.length) {
              red = true;
              resolve(json.online.filter(function(c) {
                return c.show;
              }));
            } else if (any) {
              reject();
            }
          }
        };
        var fin = function fin(call) {
          network.timeout(3000);
          withAuthRetry(function(success, failure) {
            network.silent(account(url), success, failure, false, {
              headers: addHeaders()
		  });
          }, function(json) {
            life_wait_times++;
            filter_sources = [];
            sources = {};
            json.online.forEach(function(j) {
              var name = balanserName(j);
              sources[name] = {
                url: j.url,
                name: j.name,
                show: typeof j.show == 'undefined' ? true : j.show
              };
            });
            filter_sources = Lampa.Arrays.getKeys(sources);
            filter.set('sort', filter_sources.map(function(e) {
              return {
                title: sources[e].name,
                source: e,
                selected: e == balanser,
                ghost: !sources[e].show
              };
            }));
            filter.chosen('sort', [sources[balanser] ? sources[balanser].name : balanser]);
            gou(json);
            var lastb = _this3.getLastChoiceBalanser();
            if (life_wait_times > 15 || json.ready) {
              filter.render().find('.lampac-balanser-loader').remove();
              gou(json, true);
            } else if (!red && sources[lastb] && sources[lastb].show) {
              gou(json, true);
              life_wait_timer = setTimeout(fin, 1000);
            } else {
              life_wait_timer = setTimeout(fin, 1000);
            }
          }, function() {
            life_wait_times++;
            if (life_wait_times > 15) {
              reject();
            } else {
              life_wait_timer = setTimeout(fin, 1000);
            }
          });
        };
        fin();
      });
    };
    this.createSource = function() {
      var _this4 = this;
      return new Promise(function(resolve, reject) {
        var url = _this4.requestParams(Defined.localhost + 'lite/events?life=true');
        network.timeout(15000);
        withAuthRetry(function(success, failure) {
          network.silent(account(url), success, failure, false, {
            headers: addHeaders()
		  });
        }, function(json) {
          if (json.accsdb) return reject(json);
          if (json.life) {
			_this4.memkey = json.memkey;
			if (json.title) {
              if (object.movie.name) object.movie.name = json.title;
              if (object.movie.title) object.movie.title = json.title;
			}
            filter.render().find('.filter--sort').append('<span class="lampac-balanser-loader" style="width: 1.2em; height: 1.2em; margin-top: 0; background: url(./img/loader.svg) no-repeat 50% 50%; background-size: contain; margin-left: 0.5em"></span>');
            _this4.lifeSource().then(_this4.startSource).then(resolve)["catch"](reject);
          } else {
            _this4.startSource(json).then(resolve)["catch"](reject);
          }
        }, reject);
      });
    };

    this.create = function() {
      return this.render();
    };

    this.search = function() {
      this.filter({
        source: filter_sources
      }, this.getChoice());
      this.find();
    };
    this.find = function() {
      this.request(this.requestParams(source));
    };
    this.request = function(url) {
      if (window.NOVA_VIEW) window.NOVA_VIEW.loading({
        scroll: scroll,
        sources: sources,
        balanser: balanser
      });
      number_of_requests++;
      if (number_of_requests < 10) {
        withAuthRetry(function(success, failure) {
          network["native"](account(url), success, failure, false, {
            dataType: 'text',
		    headers: addHeaders()
          });
        }, this.parse.bind(this), this.doesNotAnswer.bind(this));
        clearTimeout(number_of_requests_timer);
        number_of_requests_timer = setTimeout(function() {
          number_of_requests = 0;
        }, 4000);
      } else this.empty();
    };
    this.parseJsonDate = function(str, name) {
      try {
        var html = $('<div>' + str + '</div>');
        var elems = [];
        html.find(name).each(function() {
          var item = $(this);
          var data = JSON.parse(item.attr('data-json'));
          var season = item.attr('s');
          var episode = item.attr('e');
          var text = item.text();
          if (!object.movie.name) {
            if (text.match(/\d+p/i)) {
              if (!data.quality) {
                data.quality = {};
                data.quality[text] = data.url;
              }
              text = object.movie.title;
            }
            if (text == 'По умолчанию') {
              text = object.movie.title;
            }
          }
          if (episode) data.episode = parseInt(episode);
          if (season) data.season = parseInt(season);
          if (text) data.text = text;
          data.active = item.hasClass('active');
          elems.push(data);
        });
        return elems;
      } catch (e) {
        return [];
      }
    };
    this.getFileUrl = function(file, call, waiting_rch) {
	  var _this = this;

      if(Lampa.Storage.field('player') !== 'inner' && file.stream && Lampa.Platform.is('apple')){
		  var newfile = Lampa.Arrays.clone(file);
		  newfile.method = 'play';
		  newfile.url = file.stream;
		  call(newfile, {});
	  }
      else if (file.method == 'play') call(file, {});
      else {
        Lampa.Loading.start(function() {
          Lampa.Loading.stop();
          Lampa.Controller.toggle('content');
          network.clear();
        });
        withAuthRetry(function(success, failure) {
          network["native"](account(file.url), success, failure, false, {
            headers: addHeaders()
		  });
        }, function(json) {
			if(json.rch){
				if(waiting_rch) {
					waiting_rch = false;
					Lampa.Loading.stop();
					call(false, {});
				}
				else {
					_this.rch(json,function(){
						Lampa.Loading.stop();

						_this.getFileUrl(file, call, true);
					});
				}
			}
			else{
				Lampa.Loading.stop();
				call(json, json);
			}
        }, function() {
          Lampa.Loading.stop();
          call(false, {});
        });
      }
    };
    this.toPlayElement = function(file) {
      var play = {
        title: file.title,
        url: file.url,
        quality: file.qualitys,
        timeline: file.timeline,
        subtitles: file.subtitles,
		segments: file.segments,
        callback: file.mark,
		season: file.season,
		episode: file.episode,
		voice_name: file.voice_name,
		thumbnail: file.thumbnail
      };
      return play;
    };
    this.orUrlReserve = function(data) {
      if (data.url && typeof data.url == 'string' && data.url.indexOf(" or ") !== -1) {
        var urls = data.url.split(" or ");
        data.url = urls[0];
        data.url_reserve = urls[1];
      }
    };
    this.setDefaultQuality = function(data) {
      if (Lampa.Arrays.getKeys(data.quality).length) {
        for (var q in data.quality) {
          if (parseInt(q) == Lampa.Storage.field('video_quality_default')) {
            data.url = data.quality[q];
            this.orUrlReserve(data);
          }
          if (data.quality[q].indexOf(" or ") !== -1)
            data.quality[q] = data.quality[q].split(" or ")[0];
        }
      }
    };
    this.display = function(videos) {
      var _this5 = this;
      this.draw(videos, {
        onEnter: function onEnter(item, html) {
          _this5.getFileUrl(item, function(json, json_call) {
            if (json && json.url) {
              var playlist = [];
              var first = _this5.toPlayElement(item);
              first.url = json.url;
              first.headers = json_call.headers || json.headers;
              first.quality = json_call.quality || item.qualitys;
			  first.segments = json_call.segments || item.segments;
              first.hls_manifest_timeout = json_call.hls_manifest_timeout || json.hls_manifest_timeout;
              first.subtitles = json.subtitles;
			  first.subtitles_call = json_call.subtitles_call || json.subtitles_call;
			  if (json.vast && json.vast.url) {
                first.vast_url = json.vast.url;
                first.vast_msg = json.vast.msg;
                first.vast_region = json.vast.region;
                first.vast_platform = json.vast.platform;
                first.vast_screen = json.vast.screen;
			  }
              _this5.orUrlReserve(first);
              _this5.setDefaultQuality(first);
              if (item.season) {
                videos.forEach(function(elem) {
                  var cell = _this5.toPlayElement(elem);
                  if (elem == item) cell.url = json.url;
                  else {
                    if (elem.method == 'call') {
                      if (Lampa.Storage.field('player') !== 'inner') {
                        cell.url = elem.stream;
						delete cell.quality;
                      } else {
                        cell.url = function(call) {
                          _this5.getFileUrl(elem, function(stream, stream_json) {
                            if (stream.url) {
                              cell.url = stream.url;
                              cell.quality = stream_json.quality || elem.qualitys;
							  cell.segments = stream_json.segments || elem.segments;
                              cell.subtitles = stream.subtitles;
                              _this5.orUrlReserve(cell);
                              _this5.setDefaultQuality(cell);
                              elem.mark();
                            } else {
                              cell.url = '';
                              Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                            }
                            call();
                          }, function() {
                            cell.url = '';
                            call();
                          });
                        };
                      }
                    } else {
                      cell.url = elem.url;
                    }
                  }
                  _this5.orUrlReserve(cell);
                  _this5.setDefaultQuality(cell);
                  playlist.push(cell);
                });
              } else {
                playlist.push(first);
              }
              if (playlist.length > 1) first.playlist = playlist;
              if (first.url) {
                var element = first;
				element.isonline = true;

                Lampa.Player.play(element);
                Lampa.Player.playlist(playlist);
				if(element.subtitles_call) _this5.loadSubtitles(element.subtitles_call)
                item.mark();
                _this5.updateBalanser(balanser);
              } else {
                Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
              }
            } else Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
          }, true);
        },
        onContextMenu: function onContextMenu(item, html, data, call) {
          _this5.getFileUrl(item, function(stream) {
            call({
              file: stream.url,
              quality: item.qualitys
            });
          }, true);
        }
      });
      this.filter({
        season: filter_find.season.map(function(s) {
          return s.title;
        }),
        voice: filter_find.voice.map(function(b) {
          return b.title;
        })
      }, this.getChoice());
    };
	this.loadSubtitles = function(link){
		withAuthRetry(function(success, failure) {
			network.silent(account(link), success, failure, false, {
            headers: addHeaders()
		  });
		}, function(subs){
			Lampa.Player.subtitles(subs)
		}, function() {});
	}
    this.parse = function(str) {
      var json = Lampa.Arrays.decodeJson(str, {});
      if (Lampa.Arrays.isObject(str) && str.rch) json = str;
      if (json.rch) return this.rch(json);
      try {
        var items = this.parseJsonDate(str, '.videos__item');
        var buttons = this.parseJsonDate(str, '.videos__button');
        if (items.length == 1 && items[0].method == 'link' && !items[0].similar) {
          filter_find.season = items.map(function(s) {
            return {
              title: s.text,
              url: s.url
            };
          });
          this.replaceChoice({
            season: 0
          });
          this.request(items[0].url);
        } else {
          this.activity.loader(false);
          var videos = items.filter(function(v) {
            return v.method == 'play' || v.method == 'call';
          });
          var similar = items.filter(function(v) {
            return v.similar;
          });
          if (videos.length) {
            if (buttons.length) {
              filter_find.voice = buttons.map(function(b) {
                return {
                  title: b.text,
                  url: b.url
                };
              });
              var select_voice_url = this.getChoice(balanser).voice_url;
              var select_voice_name = this.getChoice(balanser).voice_name;
              var find_voice_url = buttons.find(function(v) {
                return v.url == select_voice_url;
              });
              var find_voice_name = buttons.find(function(v) {
                return v.text == select_voice_name;
              });
              var find_voice_active = buttons.find(function(v) {
                return v.active;
              });

              if (find_voice_url && !find_voice_url.active) {

                this.replaceChoice({
                  voice: buttons.indexOf(find_voice_url),
                  voice_name: find_voice_url.text
                });
                this.request(find_voice_url.url);
              } else if (find_voice_name && !find_voice_name.active) {

                this.replaceChoice({
                  voice: buttons.indexOf(find_voice_name),
                  voice_name: find_voice_name.text
                });
                this.request(find_voice_name.url);
              } else {
                if (find_voice_active) {
                  this.replaceChoice({
                    voice: buttons.indexOf(find_voice_active),
                    voice_name: find_voice_active.text
                  });
                }
                this.display(videos);
              }
            } else {
              this.replaceChoice({
                voice: 0,
                voice_url: '',
                voice_name: ''
              });
              this.display(videos);
            }
          } else if (items.length) {
            if (similar.length) {
              this.similars(similar);
              this.activity.loader(false);
            } else {
              filter_find.season = items.map(function(s) {
                return {
                  title: s.text,
                  url: s.url
                };
              });
              var select_season = this.getChoice(balanser).season;
              var season = filter_find.season[select_season];
              if (!season) season = filter_find.season[0];

              this.request(season.url);
            }
          } else {
            this.doesNotAnswer(json);
          }
        }
      } catch (e) {

        this.doesNotAnswer(e);
      }
    };
    this.similars = function(json) {
      if (window.NOVA_VIEW) window.NOVA_VIEW.folders({
        scroll: scroll,
        files: files,
        onFocus: function (target) {
          last = target;
          scroll.update($(target), true);
        }
      });
      var _this6 = this;
      scroll.clear();
      json.forEach(function(elem) {
        elem.title = elem.text;
        elem.info = '';
        var info = [];
        var year = ((elem.start_date || elem.year || object.movie.release_date || object.movie.first_air_date || '') + '').slice(0, 4);
        if (year) info.push(year);
        if (elem.details) info.push(elem.details);
        var name = elem.title || elem.text;
        elem.title = name;
        elem.time = elem.time || '';
        elem.info = info.join('<span class="online-prestige-split">●</span>');
        var item = Lampa.Template.get('lampac_prestige_folder', elem);
		if (elem.img) {
		  var image = $('<img style="height: 7em; width: 7em; border-radius: 0.3em;"/>');
		  item.find('.online-prestige__folder').empty().append(image);

		  if (elem.img !== undefined) {
		    if (elem.img.charAt(0) === '/')
		      elem.img = Defined.localhost + elem.img.substring(1);
		    if (elem.img.indexOf('/proxyimg') !== -1)
		      elem.img = account(elem.img);
		  }

		  Lampa.Utils.imgLoad(image, elem.img);
		}
        item.on('hover:enter', function() {
          _this6.reset();
          _this6.request(elem.url);
        }).on('hover:focus', function(e) {
          last = e.target;
          scroll.update($(e.target), true);
        });
        scroll.append(item);
      });
	  this.filter({
        season: filter_find.season.map(function(s) {
          return s.title;
        }),
        voice: filter_find.voice.map(function(b) {
          return b.title;
        })
      }, this.getChoice());
      Lampa.Controller.enable('content');
    };
    this.getChoice = function(for_balanser) {
      var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
      var save = data[object.movie.id] || {};
      Lampa.Arrays.extend(save, {
        season: 0,
        voice: 0,
        voice_name: '',
        voice_id: 0,
        episodes_view: {},
        movie_view: ''
      });
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
          subitems.push({
            title: name,
            selected: value == i,
            index: i
          });
        });
        select.push({
          title: title,
          subtitle: items[value],
          items: subitems,
          stype: type
        });
      };
      filter_items.source = filter_sources;
      select.push({
        title: Lampa.Lang.translate('torrent_parser_reset'),
        reset: true
      });
      this.saveChoice(choice);
      if (filter_items.voice && filter_items.voice.length) add('voice', Lampa.Lang.translate('torrent_parser_voice'));
      if (filter_items.season && filter_items.season.length) add('season', Lampa.Lang.translate('torrent_serial_season'));
      filter.set('filter', select);
      filter.set('sort', filter_sources.map(function(e) {
        return {
          title: sources[e].name,
          source: e,
          selected: e == balanser,
          ghost: !sources[e].show
        };
      }));
      this.selected(filter_items);
    };

    this.selected = function(filter_items) {
      var need = this.getChoice(),
        select = [];
      for (var i in need) {
        if (filter_items[i] && filter_items[i].length) {
          if (i == 'voice') {
            select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]);
          } else if (i !== 'source') {
            if (filter_items.season.length >= 1) {
              select.push(filter_translate.season + ': ' + filter_items[i][need[i]]);
            }
          }
        }
      }
      filter.chosen('filter', select);
      filter.chosen('sort', [sources[balanser].name]);
    };
    this.getEpisodes = function(season, call) {
      var episodes = [];
	  var tmdb_id = object.movie.id;
	  if (['cub', 'tmdb'].indexOf(object.movie.source || 'tmdb') == -1)
        tmdb_id = object.movie.tmdb_id;
      if (typeof tmdb_id == 'number' && object.movie.name) {
		  Lampa.Api.sources.tmdb.get('tv/' + tmdb_id + '/season/' + season, {}, function(data){
			  episodes = data.episodes || [];

			  call(episodes);
		  }, function(){
			  call(episodes);
		  })
      } else call(episodes);
    };
    this.watched = function(set) {
      var file_id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var watched = Lampa.Storage.cache('online_watched_last', 5000, {});
      if (set) {
        if (!watched[file_id]) watched[file_id] = {};
        Lampa.Arrays.extend(watched[file_id], set, true);
        Lampa.Storage.set('online_watched_last', watched);
        this.updateWatched();
      } else {
        return watched[file_id];
      }
    };
    this.updateWatched = function() {
      var watched = this.watched();
      var body = scroll.body().find('.online-prestige-watched .online-prestige-watched__body').empty();
      if (watched) {
        var line = [];
        if (watched.balanser_name) line.push(watched.balanser_name);
        if (watched.voice_name) line.push(watched.voice_name);
        if (watched.season) line.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + watched.season);
        if (watched.episode) line.push(Lampa.Lang.translate('torrent_serial_episode') + ' ' + watched.episode);
        line.forEach(function(n) {
          body.append('<span>' + n + '</span>');
        });
      } else body.append('<span>' + Lampa.Lang.translate('lampac_no_watch_history') + '</span>');
    };

    this.draw = function(items) {
      var _this8 = this;
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!items.length) return this.empty();
      scroll.clear();
      this.updateWatched();
      this.getEpisodes(items[0].season, function (episodes) {
        if (window.NOVA_VIEW) {
          window.NOVA_VIEW.head({
            scroll: scroll,
            object: object,
            items: items,
            episodes: episodes,
            serial: object.movie.name ? true : false,
            choice: _this8.getChoice(),
            sources: sources,
            balanser: balanser,
            filter_find: filter_find,
            filter: filter,
            component: _this8,
            getLast: function () {
              return last;
            },
            onFocus: function (target) {
              last = target;
              scroll.update($(target), true);
            }
          });
        }
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var serial = object.movie.name ? true : false;
        var choice = _this8.getChoice();
        var fully = window.innerWidth > 480;
        var scroll_to_element = false;
        var scroll_to_mark = false;
        items.forEach(function(element, index) {
          var episode = serial && episodes.length && !params.similars ? episodes.find(function(e) {
            return e.episode_number == element.episode;
          }) : false;
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
          var data = {
            hash_timeline: hash_timeline,
            hash_behold: hash_behold
          };
          var info = [];
          if (element.season) {
            element.translate_episode_end = _this8.getLastEpisode(items);
            element.translate_voice = element.voice_name;
          }
          if (element.text && !episode) element.title = element.text;
          element.timeline = Lampa.Timeline.view(hash_timeline);
          if (episode) {
            element.title = episode.name;
            if (element.info.length < 30 && episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', {
              rate: parseFloat(episode.vote_average + '').toFixed(1)
            }, true));
            if (episode.air_date && fully) info.push(Lampa.Utils.parseTime(episode.air_date).full);
          } else if (object.movie.release_date && fully) {
            info.push(Lampa.Utils.parseTime(object.movie.release_date).full);
          }
          if (!serial && object.movie.tagline && element.info.length < 30) info.push(object.movie.tagline);
          if (element.info) info.push(element.info);
          if (info.length) element.info = info.map(function(i) {
            return '<span>' + i + '</span>';
          }).join('<span class="online-prestige-split">●</span>');
          var html = Lampa.Template.get('lampac_prestige_full', element);
          if (window.NOVA_VIEW) window.NOVA_VIEW.decorateCard(html, element, episode, serial);
          var loader = html.find('.online-prestige__loader');
          var image = html.find('.online-prestige__img');
		  if(object.balanser) image.hide();
          if (!serial) {
            if (choice.movie_view == hash_behold) scroll_to_element = html;
          } else if (typeof episode_last !== 'undefined' && episode_last == episode_num) {
            scroll_to_element = html;
          }
          if (serial && !episode) {
            image.append('<div class="online-prestige__episode-number">' + novaBadge(element.season, element.episode || index + 1) + '</div>');
            loader.remove();
          }
		  else if (!serial && object.movie.backdrop_path == 'undefined') loader.remove();
          else {
            var img = html.find('img')[0];
            img.onerror = function() {
              img.src = './img/img_broken.svg';
            };
            img.onload = function() {
              image.addClass('online-prestige__img--loaded');
              loader.remove();
              if (serial) image.append('<div class="online-prestige__episode-number">' + novaBadge(element.season, element.episode || index + 1) + '</div>');
            };
            img.src = Lampa.TMDB.image('t/p/w300' + (episode ? episode.still_path : object.movie.backdrop_path));
            images.push(img);
			element.thumbnail = img.src
          }
          html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline));
          if (viewed.indexOf(hash_behold) !== -1) {
            scroll_to_mark = html;
            html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
          }
          element.mark = function() {
            viewed = Lampa.Storage.cache('online_view', 5000, []);
            if (viewed.indexOf(hash_behold) == -1) {
              viewed.push(hash_behold);
              Lampa.Storage.set('online_view', viewed);
              if (html.find('.online-prestige__viewed').length == 0) {
                html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
              }
            }
            choice = _this8.getChoice();
            if (!serial) {
              choice.movie_view = hash_behold;
            } else {
              choice.episodes_view[element.season] = episode_num;
            }
            _this8.saveChoice(choice);
            var voice_name_text = choice.voice_name || element.voice_name || element.title;
            if (voice_name_text.length > 30) voice_name_text = voice_name_text.slice(0, 30) + '...';
            _this8.watched({
              balanser: balanser,
              balanser_name: Lampa.Utils.capitalizeFirstLetter(sources[balanser] ? sources[balanser].name.split(' ')[0] : balanser),
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
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
            if (params.onEnter) params.onEnter(element, html, data);
          }).on('hover:focus', function(e) {
            last = e.target;
            if (params.onFocus) params.onFocus(element, html, data);
            scroll.update($(e.target), true);
          });
          if (params.onRender) params.onRender(element, html, data);
          _this8.contextMenu({
            html: html,
            element: element,
            onFile: function onFile(call) {
              if (params.onContextMenu) params.onContextMenu(element, html, data, call);
            },
            onClearAllMark: function onClearAllMark() {
              items.forEach(function(elem) {
                elem.unmark();
              });
            },
            onClearAllTime: function onClearAllTime() {
              items.forEach(function(elem) {
                elem.timeclear();
              });
            }
          });
          scroll.append(html);
        });
        if (serial && episodes.length > items.length && !params.similars) {
          var left = episodes.slice(items.length);
          left.forEach(function(episode) {
            var info = [];
            if (episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', {
              rate: parseFloat(episode.vote_average + '').toFixed(1)
            }, true));
            if (episode.air_date) info.push(Lampa.Utils.parseTime(episode.air_date).full);
            var air = new Date((episode.air_date + '').replace(/-/g, '/'));
            var now = Date.now();
            var day = Math.round((air.getTime() - now) / (24 * 60 * 60 * 1000));
            var txt = Lampa.Lang.translate('full_episode_days_left') + ': ' + day;
            var html = Lampa.Template.get('lampac_prestige_full', {
              time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true),
              info: info.length ? info.map(function(i) {
                return '<span>' + i + '</span>';
              }).join('<span class="online-prestige-split">●</span>') : '',
              title: episode.name,
              quality: day > 0 ? txt : ''
            });
            if (window.NOVA_VIEW) html.addClass('nova-ep--soon');
            var loader = html.find('.online-prestige__loader');
            var image = html.find('.online-prestige__img');
            var season = items[0] ? items[0].season : 1;
            html.find('.online-prestige__timeline').append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([season, episode.episode_number, object.movie.original_title].join('')))));
            var img = html.find('img')[0];
            if (episode.still_path) {
              img.onerror = function() {
                img.src = './img/img_broken.svg';
              };
              img.onload = function() {
                image.addClass('online-prestige__img--loaded');
                loader.remove();
                image.append('<div class="online-prestige__episode-number">' + novaBadge(season, episode.episode_number) + '</div>');
              };
              img.src = Lampa.TMDB.image('t/p/w300' + episode.still_path);
              images.push(img);
            } else {
              loader.remove();
              image.append('<div class="online-prestige__episode-number">' + novaBadge(season, episode.episode_number) + '</div>');
            }
            html.on('hover:focus', function(e) {
              last = e.target;
              scroll.update($(e.target), true);
            });
            html.css('opacity', '0.5');
            scroll.append(html);
          });
        }
        if (scroll_to_element) {
          last = scroll_to_element[0];
        } else if (scroll_to_mark) {
          last = scroll_to_mark[0];
        }
        if (window.NOVA_VIEW) {
          window.NOVA_VIEW.foot({
            scroll: scroll,
            object: object,
            items: items,
            serial: object.movie.name ? true : false,
            choice: _this8.getChoice(),
            onFocus: function (target) {
              last = target;
              scroll.update($(target), true);
            }
          });
        }
        Lampa.Controller.enable('content');
      });
    };

    this.contextMenu = function(params) {
      params.html.on('hover:long', function() {
        function show(extra) {
          var enabled = Lampa.Controller.enabled().name;
          var menu = [];
          if (Lampa.Platform.is('webos')) {
            menu.push({
              title: Lampa.Lang.translate('player_lauch') + ' - Webos',
              player: 'webos'
            });
          }
          if (Lampa.Platform.is('android')) {
            menu.push({
              title: Lampa.Lang.translate('player_lauch') + ' - Android',
              player: 'android'
            });
          }
          menu.push({
            title: Lampa.Lang.translate('player_lauch') + ' - Lampa',
            player: 'lampa'
          });
          menu.push({
            title: Lampa.Lang.translate('lampac_video'),
            separator: true
          });
          menu.push({
            title: Lampa.Lang.translate('torrent_parser_label_title'),
            mark: true
          });
          menu.push({
            title: Lampa.Lang.translate('torrent_parser_label_cancel_title'),
            unmark: true
          });
          menu.push({
            title: Lampa.Lang.translate('time_reset'),
            timeclear: true
          });
          if (extra) {
            menu.push({
              title: Lampa.Lang.translate('copy_link'),
              copylink: true
            });
          }
          if (window.lampac_online_context_menu)
            window.lampac_online_context_menu.push(menu, extra, params);
          menu.push({
            title: Lampa.Lang.translate('more'),
            separator: true
          });
          if (Lampa.Account.logged() && params.element && typeof params.element.season !== 'undefined' && params.element.translate_voice) {
            menu.push({
              title: Lampa.Lang.translate('lampac_voice_subscribe'),
              subscribe: true
            });
          }
          menu.push({
            title: Lampa.Lang.translate('lampac_clear_all_marks'),
            clearallmark: true
          });
          menu.push({
            title: Lampa.Lang.translate('lampac_clear_all_timecodes'),
            timeclearall: true
          });
          Lampa.Select.show({
            title: Lampa.Lang.translate('title_action'),
            items: menu,
            onBack: function onBack() {
              Lampa.Controller.toggle(enabled);
            },
            onSelect: function onSelect(a) {
              if (a.mark) params.element.mark();
              if (a.unmark) params.element.unmark();
              if (a.timeclear) params.element.timeclear();
              if (a.clearallmark) params.onClearAllMark();
              if (a.timeclearall) params.onClearAllTime();
              if (window.lampac_online_context_menu)
                window.lampac_online_context_menu.onSelect(a, params);
              Lampa.Controller.toggle(enabled);
              if (a.player) {
                Lampa.Player.runas(a.player);
                params.html.trigger('hover:enter');
              }
              if (a.copylink) {
                if (extra.quality) {
                  var qual = [];
                  for (var i in extra.quality) {
                    qual.push({
                      title: i,
                      file: extra.quality[i]
                    });
                  }
                  Lampa.Select.show({
                    title: Lampa.Lang.translate('settings_server_links'),
                    items: qual,
                    onBack: function onBack() {
                      Lampa.Controller.toggle(enabled);
                    },
                    onSelect: function onSelect(b) {
                      Lampa.Utils.copyTextToClipboard(b.file, function() {
                        Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                      }, function() {
                        Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                      });
                    }
                  });
                } else {
                  Lampa.Utils.copyTextToClipboard(extra.file, function() {
                    Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                  }, function() {
                    Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                  });
                }
              }
              if (a.subscribe) {
                Lampa.Account.subscribeToTranslation({
                  card: object.movie,
                  season: params.element.season,
                  episode: params.element.translate_episode_end,
                  voice: params.element.translate_voice
                }, function() {
                  Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_success'));
                }, function() {
                  Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_error'));
                });
              }
            }
          });
        }
        params.onFile(show);
      }).on('hover:focus', function() {
        if (Lampa.Helper) Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.html);
      });
    };

    this.empty = function() {
      if (window.NOVA_VIEW && window.NOVA_VIEW.empty({
        scroll: scroll,
        object: object,
        sources: sources,
        balanser: balanser,
        filter: filter,
        component: this
      })) return this.loading(false);
      var html = Lampa.Template.get('lampac_does_not_answer', {});
      html.find('.online-empty__buttons').remove();
      html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two'));
      html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text'));
      scroll.clear();
      scroll.append(html);
      this.loading(false);
    };
    this.noConnectToServer = function(er) {
      if (window.NOVA_VIEW && window.NOVA_VIEW.dead({
        scroll: scroll,
        object: object,
        sources: sources,
        balanser: balanser,
        filter: filter,
        component: this
      })) return this.loading(false);
      var html = Lampa.Template.get('lampac_does_not_answer', {});
      html.find('.online-empty__buttons').remove();
      html.find('.online-empty__title').text(Lampa.Lang.translate('title_error'));
      html.find('.online-empty__time').text(er && er.accsdb ? er.msg : Lampa.Lang.translate('lampac_does_not_answer_text').replace('{balanser}', balanser[balanser].name));
      scroll.clear();
      scroll.append(html);
      this.loading(false);
    };
    this.doesNotAnswer = function(er) {
      if (window.NOVA_VIEW) {
        this.reset();
        if (window.NOVA_VIEW.dead({
          scroll: scroll,
          object: object,
          sources: sources,
          balanser: balanser,
          filter: filter,
          component: this,
          error: er
        })) return this.loading(false);
      }
      var _this9 = this;
      this.reset();
      var html = Lampa.Template.get('lampac_does_not_answer', {
        balanser: balanser
      });
      if(er && er.accsdb) html.find('.online-empty__title').html(er.msg);

      var tic = er && er.accsdb ? 10 : 5;
      html.find('.cancel').on('hover:enter', function() {
        clearInterval(balanser_timer);
      });
      html.find('.change').on('hover:enter', function() {
        clearInterval(balanser_timer);
        filter.render().find('.filter--sort').trigger('hover:enter');
      });
      scroll.clear();
      scroll.append(html);
      this.loading(false);
      balanser_timer = setInterval(function() {
        tic--;
        html.find('.timeout').text(tic);
        if (tic == 0) {
          clearInterval(balanser_timer);
          var keys = Lampa.Arrays.getKeys(sources);
          var indx = keys.indexOf(balanser);
          var next = keys[indx + 1];
          if (!next) next = keys[0];
          balanser = next;
          if (Lampa.Activity.active().activity == _this9.activity) _this9.changeBalanser(balanser);
        }
      }, 1000);
    };
    this.getLastEpisode = function(items) {
      var last_episode = 0;
      items.forEach(function(e) {
        if (typeof e.episode !== 'undefined') last_episode = Math.max(last_episode, parseInt(e.episode));
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
        toggle: function toggle() {
          Lampa.Controller.collectionSet(scroll.render(), files.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        },
        gone: function gone() {
          clearTimeout(balanser_timer);
        },
        up: function up() {
          if (window.NOVA_VIEW && window.NOVA_VIEW.up()) return;
          if (Navigator.canmove('up')) {
            Navigator.move('up');
          } else Lampa.Controller.toggle('head');
        },
        down: function down() {
          Navigator.move('down');
        },
        right: function right() {
          if (Navigator.canmove('right')) Navigator.move('right');
          else if (window.NOVA_VIEW && window.NOVA_VIEW.right()) return;
          else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
        },
        left: function left() {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        back: this.back.bind(this)
      });
      Lampa.Controller.toggle('content');
    };
    this.render = function() {
      return files.render();
    };
    this.back = function() {
      Lampa.Activity.backward();
    };
    this.pause = function() {};
    this.stop = function() {};
    this.destroy = function() {
      network.clear();
      this.clearImages();
      files.destroy();
      scroll.destroy();
      clearInterval(balanser_timer);
      clearTimeout(life_wait_timer);
    };
  }

  function addSourceSearch(spiderName, spiderUri) {
    var network = new Lampa.Reguest();

    var source = {
      title: spiderName,
      search: function(params, oncomplite) {
        function searchComplite(links) {
          var keys = Lampa.Arrays.getKeys(links);

          if (keys.length) {
            var status = new Lampa.Status(keys.length);

            status.onComplite = function(result) {
              var rows = [];

              keys.forEach(function(name) {
                var line = result[name];

                if (line && line.data && line.type == 'similar') {
                  var cards = line.data.map(function(item) {
                    item.title = Lampa.Utils.capitalizeFirstLetter(item.title);
                    item.release_date = item.year || '0000';
                    item.balanser = spiderUri;
                    if (item.img !== undefined) {
                      if (item.img.charAt(0) === '/')
                        item.img = Defined.localhost + item.img.substring(1);
                      if (item.img.indexOf('/proxyimg') !== -1)
                        item.img = account(item.img);
                    }

                    return item;
                  })

                  rows.push({
                    title: name,
                    results: cards
                  })
                }
              })

              oncomplite(rows);
            }

            keys.forEach(function(name) {
              withAuthRetry(function(success, failure) {
                network.silent(account(links[name]), success, failure, false, {
                  headers: addHeaders()
		  });
              }, function(data) {
                status.append(name, data);
              }, function() {
                status.error();
              });
            })
          } else {
            oncomplite([]);
          }
        }

        withAuthRetry(function(success, failure) {
          network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), success, failure, false, {
            headers: addHeaders()
		  });
        }, function(json) {
          if (json.rch) {
            rchRun(json, function() {
              withAuthRetry(function(success, failure) {
                network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), success, failure, false, {
                  headers: addHeaders()
		  });
              }, function(links) {
                searchComplite(links);
              }, function() {
                oncomplite([]);
              });
            });
          } else {
            searchComplite(json);
          }
        }, function() {
          oncomplite([]);
        });
      },
      onCancel: function() {
        network.clear()
      },
      params: {
        lazy: true,
        align_left: true,
        card_events: {
          onMenu: function() {}
        }
      },
      onMore: function(params, close) {
        close();
      },
      onSelect: function(params, close) {
        close();

        Lampa.Activity.push({
          url: params.element.url,
          title: 'Lampac - ' + params.element.title,
          component: 'lampac_ab_nova',
          movie: params.element,
          page: 1,
          search: params.element.title,
          clarification: true,
          balanser: params.element.balanser,
          noinfo: true
        });
      }
    }

    Lampa.Search.addSource(source)
  }

  function startPlugin() {
    window.lampac_ab_nova_plugin = true;
    var manifst = {
      type: 'video',
      version: '1.7.1',
      name: 'a.b',
      description: 'Плагин для просмотра онлайн сериалов и фильмов',
      component: 'lampac_ab_nova',
      onContextMenu: function onContextMenu(object) {
        return {
          name: Lampa.Lang.translate('lampac_watch'),
          description: ''
        };
      },
      onContextLauch: function onContextLauch(object) {
        resetTemplates();
        Lampa.Component.add('lampac_ab_nova', component);

		var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
		var all = Lampa.Storage.get('clarification_search','{}');

        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'lampac_ab_nova',
          search: all[id] ? all[id] : object.title,
          search_one: object.title,
          search_two: object.original_title,
          movie: object,
          page: 1,
		  clarification: all[id] ? true : false
        });
      }
    };
	addSourceSearch('akter.black', 'spider');
	addSourceSearch('akter.black - Anime', 'spider/anime');
    Lampa.Manifest.plugins = manifst;
    Lampa.Lang.add({
      lampac_watch: {
        ru: 'Смотреть онлайн',
        en: 'Watch online',
        uk: 'Дивитися онлайн',
        zh: '在线观看'
      },
      lampac_video: {
        ru: 'Видео',
        en: 'Video',
        uk: 'Відео',
        zh: '视频'
      },
      lampac_no_watch_history: {
        ru: 'Нет истории просмотра',
        en: 'No browsing history',
        ua: 'Немає історії перегляду',
        zh: '没有浏览历史'
      },
      lampac_nolink: {
        ru: 'Не удалось извлечь ссылку',
        uk: 'Неможливо отримати посилання',
        en: 'Failed to fetch link',
        zh: '获取链接失败'
      },
      lampac_balanser: {
        ru: 'Источник',
        uk: 'Джерело',
        en: 'Source',
        zh: '来源'
      },
      helper_online_file: {
        ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
        uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
        en: 'Hold the "OK" key to bring up the context menu',
        zh: '按住“确定”键调出上下文菜单'
      },
      title_online: {
        ru: 'Онлайн',
        uk: 'Онлайн',
        en: 'Online',
        zh: '在线的'
      },
      lampac_voice_subscribe: {
        ru: 'Подписаться на перевод',
        uk: 'Підписатися на переклад',
        en: 'Subscribe to translation',
        zh: '订阅翻译'
      },
      lampac_voice_success: {
        ru: 'Вы успешно подписались',
        uk: 'Ви успішно підписалися',
        en: 'You have successfully subscribed',
        zh: '您已成功订阅'
      },
      lampac_voice_error: {
        ru: 'Возникла ошибка',
        uk: 'Виникла помилка',
        en: 'An error has occurred',
        zh: '发生了错误'
      },
      lampac_clear_all_marks: {
        ru: 'Очистить все метки',
        uk: 'Очистити всі мітки',
        en: 'Clear all labels',
        zh: '清除所有标签'
      },
      lampac_clear_all_timecodes: {
        ru: 'Очистить все тайм-коды',
        uk: 'Очистити всі тайм-коди',
        en: 'Clear all timecodes',
        zh: '清除所有时间代码'
      },
      lampac_change_balanser: {
        ru: 'Изменить балансер',
        uk: 'Змінити балансер',
        en: 'Change balancer',
        zh: '更改平衡器'
      },
      lampac_balanser_dont_work: {
        ru: 'Поиск на ({balanser}) не дал результатов',
        uk: 'Пошук на ({balanser}) не дав результатів',
        en: 'Search on ({balanser}) did not return any results',
        zh: '搜索 ({balanser}) 未返回任何结果'
      },
      lampac_balanser_timeout: {
        ru: 'Источник будет переключен автоматически через <span class="timeout">10</span> секунд.',
        uk: 'Джерело буде автоматично переключено через <span class="timeout">10</span> секунд.',
        en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.',
        zh: '平衡器将在<span class="timeout">10</span>秒内自动切换。'
      },
      lampac_does_not_answer_text: {
        ru: 'Поиск на ({balanser}) не дал результатов',
        uk: 'Пошук на ({balanser}) не дав результатів',
        en: 'Search on ({balanser}) did not return any results',
        zh: '搜索 ({balanser}) 未返回任何结果'
      }
    });
    Lampa.Template.add('lampac_css', "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        </style>\n    ");
    $('body').append(Lampa.Template.get('lampac_css', {}, true));

    function resetTemplates() {
      Lampa.Template.add('lampac_prestige_full', "<div class=\"online-prestige online-prestige--full selector nova-ep\"><div class=\"online-prestige__img nova-ep__art\"><img alt=\"\"><div class=\"online-prestige__loader\"></div><div class=\"nova-ep__scrim\"></div><div class=\"nova-ep__play\"><svg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M6 4l14 8-14 8V4z\" fill=\"currentColor\"/></svg></div><div class=\"online-prestige__timeline nova-ep__prog\"></div></div><div class=\"online-prestige__body nova-ep__body\"><div class=\"online-prestige__head nova-ep__top\"><div class=\"online-prestige__title nova-ep__title\">{title}</div><div class=\"online-prestige__time nova-ep__time\">{time}</div></div><div class=\"online-prestige__footer nova-ep__sub\"><div class=\"online-prestige__info\">{info}</div><div class=\"online-prestige__quality\">{quality}</div></div></div></div>");
      Lampa.Template.add('lampac_content_loading', "<div class=\"nova-load\"><div class=\"nova-note nova-load__note\"></div><div class=\"nova-skel selector\"><div class=\"nova-skel__art nova-shine\"></div><div class=\"nova-skel__body\"><div class=\"nova-skel__l nova-shine\" style=\"width:42%\"></div><div class=\"nova-skel__l nova-shine\" style=\"width:66%;height:.7em\"></div></div></div><div class=\"nova-skel\"><div class=\"nova-skel__art nova-shine\"></div><div class=\"nova-skel__body\"><div class=\"nova-skel__l nova-shine\" style=\"width:42%\"></div><div class=\"nova-skel__l nova-shine\" style=\"width:66%;height:.7em\"></div></div></div><div class=\"nova-skel\"><div class=\"nova-skel__art nova-shine\"></div><div class=\"nova-skel__body\"><div class=\"nova-skel__l nova-shine\" style=\"width:42%\"></div><div class=\"nova-skel__l nova-shine\" style=\"width:66%;height:.7em\"></div></div></div><div class=\"nova-skel\"><div class=\"nova-skel__art nova-shine\"></div><div class=\"nova-skel__body\"><div class=\"nova-skel__l nova-shine\" style=\"width:42%\"></div><div class=\"nova-skel__l nova-shine\" style=\"width:66%;height:.7em\"></div></div></div></div>");
      Lampa.Template.add('lampac_does_not_answer', "<div class=\"online-empty\">\n            <div class=\"online-empty__title\">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class=\"online-empty__time\">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class=\"online-empty__buttons\">\n                <div class=\"online-empty__button selector cancel\">#{cancel}</div>\n                <div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>\n            </div>\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add('lampac_prestige_rate', "<div class=\"online-prestige-rate\">\n            <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>");
      Lampa.Template.add('lampac_prestige_folder', "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add('lampac_prestige_watched', "<div class=\"online-prestige online-prestige-watched selector\">\n            <div class=\"online-prestige-watched__icon\">\n                <svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"10.5\" cy=\"10.5\" r=\"9\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z\" fill=\"currentColor\"/>\n                </svg>\n            </div>\n            <div class=\"online-prestige-watched__body\">\n                \n            </div>\n        </div>");
    }
    var button = "<div class=\"full-start__button selector view--online lampac-ab-nova--button\" data-subtitle=\"".concat(manifst.name, " v").concat(manifst.version, "\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 392.697 392.697\" xml:space=\"preserve\">\n            <path d=\"M21.837,83.419l36.496,16.678L227.72,19.886c1.229-0.592,2.002-1.846,1.98-3.209c-0.021-1.365-0.834-2.592-2.082-3.145\n                L197.766,0.3c-0.903-0.4-1.933-0.4-2.837,0L21.873,77.036c-1.259,0.559-2.073,1.803-2.081,3.18\n                C19.784,81.593,20.584,82.847,21.837,83.419z\" fill=\"currentColor\"></path>\n            <path d=\"M185.689,177.261l-64.988-30.01v91.617c0,0.856-0.44,1.655-1.167,2.114c-0.406,0.257-0.869,0.386-1.333,0.386\n                c-0.368,0-0.736-0.082-1.079-0.244l-68.874-32.625c-0.869-0.416-1.421-1.293-1.421-2.256v-92.229L6.804,95.5\n                c-1.083-0.496-2.344-0.406-3.347,0.238c-1.002,0.645-1.608,1.754-1.608,2.944v208.744c0,1.371,0.799,2.615,2.045,3.185\n                l178.886,81.768c0.464,0.211,0.96,0.315,1.455,0.315c0.661,0,1.318-0.188,1.892-0.555c1.002-0.645,1.608-1.754,1.608-2.945\n                V180.445C187.735,179.076,186.936,177.831,185.689,177.261z\" fill=\"currentColor\"></path>\n            <path d=\"M389.24,95.74c-1.002-0.644-2.264-0.732-3.347-0.238l-178.876,81.76c-1.246,0.57-2.045,1.814-2.045,3.185v208.751\n                c0,1.191,0.606,2.302,1.608,2.945c0.572,0.367,1.23,0.555,1.892,0.555c0.495,0,0.991-0.104,1.455-0.315l178.876-81.768\n                c1.246-0.568,2.045-1.813,2.045-3.185V98.685C390.849,97.494,390.242,96.384,389.24,95.74z\" fill=\"currentColor\"></path>\n            <path d=\"M372.915,80.216c-0.009-1.377-0.823-2.621-2.082-3.18l-60.182-26.681c-0.938-0.418-2.013-0.399-2.938,0.045\n                l-173.755,82.992l60.933,29.117c0.462,0.211,0.958,0.316,1.455,0.316s0.993-0.105,1.455-0.316l173.066-79.092\n                C372.122,82.847,372.923,81.593,372.915,80.216z\" fill=\"currentColor\"></path>\n        </svg>\n\n        <span>#{title_online}</span>\n    </div>");
    Lampa.Component.add('lampac_ab_nova', component);
    resetTemplates();

    function addButton(e) {
      if (e.render.find('.lampac-ab-nova--button').length) return;
      var btn = $(Lampa.Lang.translate(button));

      btn.on('hover:enter', function() {
        resetTemplates();
        Lampa.Component.add('lampac_ab_nova', component);

		var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
		var all = Lampa.Storage.get('clarification_search','{}');

        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'lampac_ab_nova',
          search: all[id] ? all[id] : e.movie.title,
          search_one: e.movie.title,
          search_two: e.movie.original_title,
          movie: e.movie,
          page: 1,
		  clarification: all[id] ? true : false
        });
      });
      e.render.after(btn);
    }
    Lampa.Listener.follow('full', function(e) {
      if (e.type == 'complite') {
        addButton({
          render: e.object.activity.render().find('.view--torrent'),
          movie: e.data.movie
        });
      }
    });
    try {
      if (Lampa.Activity.active().component == 'full') {
        addButton({
          render: Lampa.Activity.active().activity.render().find('.view--torrent'),
          movie: Lampa.Activity.active().card
        });
      }
    } catch (e) {}
    if (Lampa.Manifest.app_digital >= 177) {
        var balansers_sync = [
            "filmix",
            "filmixtv",
            "fxapi",
            "rezka",
            "pizdatoehd",
            "getstv",
            "kinopub",
            "zetflixdb",
            "collaps",
            "hdvb",
            "kodik",
            "bamboo",
            "eneyida",
            "kinoukr",
            "uafilm",
            "uakino",
            "kinotochka",
            "remux",
            "anilibria",
            "animedia",
            "animego",
            "animevost",
            "animebesst",
            "alloha",
            "mirage",
            "phantom",
            "animelib",
            "moonanime",
            "vibix",
            "fancdn",
            "cdnvideohub",
            "vokino",
            "hydraflix",
            "videasy",
            "vidsrc",
            "movpi",
            "vidlink",
            "smashystream",
            "autoembed",
            "pidtor",
            "videoseed",
            "iptvonline",
            "veoveo",
            "kinoflix",
            "leproduction",
            "vkmovie",
            "videoseed",
            "veoveo",
            "kinogo",
            "kinobase",
            "fancdn",
            "asiage",
            "geosaitebi",
            "mikai",
            "dreamerscast"
        ];
      balansers_sync.forEach(function(name) {
        Lampa.Storage.sync('online_choice_' + name, 'object_object');
      });
      Lampa.Storage.sync('online_watched_last', 'object_object');
    }
  }
  if (!window.lampac_ab_nova_plugin) startPlugin();

})();

(function () {
  'use strict';

  if (window.NOVA_VIEW) return;

  var NOVA_BUILD = "2026-08-19 12:16:03";
  var NOVA_CSS = ":root{--nova-bg:#0a0b12;--nova-accent:#fff;--nova-accent2:#fff;--nova-rgb:255,255,255;--nova-accent-lt:#fff;--nova-glow:transparent;--nova-glass:rgba(10,11,18,.5);--nova-line:rgba(255,255,255,.09);--nova-info:#ccced8;--nova-text:#fff}\n.nova-scope .explorer__left{display:none!important}\n.nova-scope .explorer__files{width:100%!important;left:0!important}\n.nova-scope .explorer__files-head{display:none!important}\n.nova-voices{display:flex;flex-wrap:wrap;gap:.7em;padding:.2em .2em 1.4em}\n.nova-voice{display:inline-flex;align-items:center;gap:.7em;padding:.7em 1.15em;border-radius:1em;background:var(--nova-glass);border:1px solid var(--nova-line);transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}\n.nova-voice.focus{background:rgba(var(--nova-rgb),.12);border-color:transparent;transform:scale(1.03);box-shadow:0 0 0 2px var(--nova-accent),0 0 2em var(--nova-glow)}\n.nova-voice.is-sel{border-color:var(--nova-accent)}\n.nova-voice__q{color:#fff;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent-lt));padding:.16em .52em;border-radius:.42em;font-size:.78em;font-weight:800;letter-spacing:.02em}\n.nova-voice__name{font-weight:600;color:var(--nova-text)}\n.nova-seasons{display:flex;flex-wrap:wrap;gap:.55em;padding:.2em .2em 1.3em}\n.nova-season{display:inline-flex;align-items:center;justify-content:center;min-width:2.2em;padding:.55em 1.05em;border-radius:1em;font-size:.95em;font-weight:700;color:var(--nova-text);background:var(--nova-glass);border:1px solid var(--nova-line);transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}\n.nova-season.focus{background:rgba(var(--nova-rgb),.12);border-color:transparent;transform:scale(1.06);box-shadow:0 0 0 2px var(--nova-accent),0 0 2em var(--nova-glow)}\n.nova-season.is-sel{border-color:var(--nova-accent);background:rgba(var(--nova-rgb),.16)}\n.nova-pills{display:flex;flex-wrap:wrap;gap:.6em;padding:.1em .2em 1.1em}\n.nova-pill{display:inline-flex;align-items:center;gap:.5em;padding:.55em 1.1em;border-radius:2em;background:var(--nova-glass);border:1px solid var(--nova-line);color:var(--nova-text);transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}\n.nova-pill.focus{background:rgba(var(--nova-rgb),.16);border-color:transparent;transform:scale(1.05);box-shadow:0 0 0 2px var(--nova-accent),0 0 1.8em var(--nova-glow)}\n.nova-pill__k{font-size:.72em;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--nova-info)}\n.nova-pill__v{font-size:.95em;font-weight:700;max-width:14em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.nova-pill__c{opacity:.55;font-size:.8em}\n.nova-pill__badge{display:inline-flex;align-items:center;justify-content:center;min-width:1.35em;height:1.35em;padding:0 .35em;border-radius:1em;background:rgba(255,255,255,.3);color:#fff;font-size:.8em;font-weight:800;line-height:1}\n.nova-row{display:flex;flex-wrap:wrap;align-items:center;gap:.5em .55em;padding:.15em .2em 1.05em}\n.nova-row>.nova-pills,.nova-row>.nova-seasons,.nova-row>.nova-voices{padding:0;margin:0;flex:0 1 auto;min-width:0}\n.nova-note--inline{flex:0 0 auto;padding:0;margin:0;white-space:nowrap}\n.nova-row>.nova-note--inline:first-child{padding-left:.76em}\n.nova-hero{position:relative;display:block;height:23em;margin:.4em .4em 1em;border-radius:1.4em;overflow:hidden;background-size:cover;background-position:center 20%;background-color:#12131b;border:1px solid var(--nova-line);background-clip:padding-box;pointer-events:none}\n.nova-hero__scrim{position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,9,16,.98),rgba(8,9,16,.4) 48%,rgba(8,9,16,.03) 78%),linear-gradient(90deg,rgba(8,9,16,.72),transparent 62%),radial-gradient(120% 90% at 92% 8%,rgba(var(--nova-rgb),.16),transparent 55%)}\n.nova-hero__content{position:absolute;left:1.7em;right:1.7em;bottom:1.4em;z-index:2;display:flex;flex-direction:column;gap:.6em}\n.nova-hero__title{font-size:2.7em;font-weight:800;letter-spacing:-.015em;line-height:1.03;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.nova-hero__meta{display:flex;align-items:center;gap:.85em;font-size:.95em;color:#c9cad6;font-weight:600}\n.nova-hero__q{color:#fff;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent-lt));padding:.2em .62em;border-radius:.5em;font-size:.8em;font-weight:800;letter-spacing:.03em;box-shadow:0 .2em .8em var(--nova-glow)}\n.nova-hero__chips{display:flex;gap:.5em;flex-wrap:wrap}\n.nova-chip{display:inline-flex;align-items:center;gap:.45em;font-size:.82em;font-weight:600;color:#d8d9e6;background:rgba(255,255,255,.07);border:1px solid var(--nova-line);padding:.3em .8em .3em .7em;border-radius:1.2em}\n.nova-chip::before{content:\"\";width:.42em;height:.42em;border-radius:50%;background:var(--nova-accent);box-shadow:0 0 .5em var(--nova-glow)}\n.nova-hero__desc{font-size:.92em;line-height:1.42;color:#b3b4c2;max-width:46em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.nova-hero__desc:empty{display:none}\n.nova-hero__cta{display:flex;align-items:center;gap:1.1em;margin-top:.45em}\n.nova-hero__cta:empty{display:none}\n.nova-hero__voice{font-size:.92em;color:#9a9ba7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.nova-hero__voice:empty{display:none}\n.nova-hero__prog{position:absolute;left:0;right:0;bottom:0;z-index:3;height:.3em;background:rgba(255,255,255,.14)}\n.nova-hero__prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--nova-accent),var(--nova-accent2))}\n.nova-ep{display:flex;align-items:center;gap:1.2em;padding:.6em .75em;margin:.45em .2em;border-radius:1.1em;background:var(--nova-glass);border:1px solid var(--nova-line);transition:transform .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease}\n.nova-ep.focus{background:rgba(var(--nova-rgb),.1);border-color:transparent;transform:scale(1.01);box-shadow:0 .8em 2.2em rgba(0,0,0,.55),0 0 0 2px var(--nova-accent),0 0 2.2em var(--nova-glow)}\n.nova-ep__art{position:relative;flex:0 0 auto;width:11em;height:6.2em;border-radius:.8em;overflow:hidden;background-size:cover;background-position:center;background-image:linear-gradient(135deg,#2b2d3a,#181924)}\n.nova-ep__scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.15),transparent 55%),linear-gradient(0deg,rgba(0,0,0,.45),transparent 55%)}\n.nova-ep__badge{position:absolute;left:.5em;top:.45em;z-index:2;font-size:.85em;font-weight:800;color:#fff;background:rgba(var(--nova-rgb),.85);padding:.12em .55em;border-radius:.45em;box-shadow:0 .2em .6em rgba(0,0,0,.4)}\n.nova-ep__badge:empty{display:none}\n.nova-ep__play{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;color:#fff;opacity:0;transition:opacity .2s;text-shadow:0 2px 10px rgba(0,0,0,.7),0 0 1em var(--nova-glow)}\n.nova-ep.focus .nova-ep__play{opacity:1}\n.nova-ep__prog{position:absolute;left:0;right:0;bottom:0;z-index:2;height:.32em;background:rgba(255,255,255,.16)}\n.nova-ep__prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--nova-accent),var(--nova-accent2))}\n.nova-ep__body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.32em}\n.nova-ep__top{display:flex;align-items:baseline;gap:1em}\n.nova-ep__title{flex:1 1 auto;min-width:0;font-size:1.35em;font-weight:700;color:var(--nova-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.nova-ep__time{flex:0 0 auto;font-size:.9em;color:var(--nova-info)}\n.nova-ep__sub{font-size:.9em;color:var(--nova-info);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.nova-ep__mark{position:absolute;right:.5em;top:.45em;z-index:2;width:1.7em;height:1.7em;border-radius:50%;background:#fff;color:#000;display:flex;align-items:center;justify-content:center;font-size:.9em;font-weight:800;box-shadow:0 .2em .6em rgba(0,0,0,.5)}\n.nova-ep__mark:empty{display:none}\n.nova-ep__resume{flex:0 0 auto;padding:.16em .7em;border-radius:1em;background:var(--nova-accent);color:#000;font-size:.72em;font-weight:800;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;align-self:center}\n.nova-ep__resume:empty{display:none}\n.nova-ep--watched .nova-ep__art{opacity:.6}\n.nova-ep--watched .nova-ep__title{color:var(--nova-info)}\n.nova-ep--soon{opacity:.5}\n.nova-ep--soon .nova-ep__play{display:none!important}\n.nova-empty{padding:2.8em 1.4em;text-align:center;line-height:1.5}\n.nova-empty__main{color:#eceefb;font-size:1.25em;font-weight:700}\n.nova-empty__hint{margin-top:.7em;color:#9a9ba7;font-size:1.02em}\n.nova-hidden{display:none!important}\n.nova-empty__row{display:flex;justify-content:center;gap:.8em;flex-wrap:wrap}\n.nova-empty__btn{display:inline-block;margin-top:1.5em;padding:.7em 1.7em;border-radius:2em;background:rgba(var(--nova-rgb),.14);border:1px solid var(--nova-line);color:var(--nova-text);font-weight:700;font-size:1.05em}\n.nova-empty__btn.focus{background:rgba(var(--nova-rgb),.2);border-color:transparent;box-shadow:0 0 0 2px var(--nova-accent),0 0 1.6em var(--nova-glow)}\n.nova-skel{display:flex;align-items:center;gap:1.2em;padding:.6em .75em;margin:.45em .2em;border-radius:1.1em;background:var(--nova-glass);pointer-events:none}\n.nova-skel__art{flex:0 0 auto;width:11em;height:6.2em;border-radius:.8em;background:rgba(255,255,255,.06)}\n.nova-skel__l{height:1em;border-radius:.4em;margin:.3em 0;background:rgba(255,255,255,.06)}\n.nova-skel__body{flex:1 1 auto;min-width:0}\n.nova-load__note{opacity:.85}\n.nova-folder{margin:.45em .2em;border-radius:1.1em;background:var(--nova-glass)}\n.nova-folder .online-prestige__title{color:var(--nova-text)}\n.nova-folder .online-prestige__info{color:var(--nova-info)}\n.nova-shine{position:relative;overflow:hidden}\n.nova-shine:after{content:\"\";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(var(--nova-rgb),.14),transparent);animation:novaShine 1.3s infinite}\n@keyframes novaShine{100%{transform:translateX(100%)}}\n@media (max-width:580px){\n.nova-hero{height:auto!important;min-height:12em!important;margin:.3em .3em .8em!important}\n.nova-hero__title{font-size:1.7em!important;white-space:normal!important}\n.nova-hero__content{position:static!important;left:auto!important;right:auto!important;bottom:auto!important;padding:6.5em 1.2em 1.1em!important;gap:.45em!important}\n.nova-hero__meta{font-size:.82em!important}\n.nova-hero__desc{-webkit-line-clamp:3!important}\n.nova-hero__voice{white-space:normal!important;overflow:visible!important}\n.nova-ep__art{width:7.5em!important;height:4.3em!important}\n.nova-ep{padding:.5em .5em!important;margin:.35em .1em!important}\n.nova-pills{flex-wrap:wrap!important}\n.nova-pill{font-size:.85em!important;padding:.45em .9em!important}\n.nova-row{gap:.4em!important;padding:.1em .1em .85em!important}\n.nova-seasons{gap:.4em!important}\n.nova-season{font-size:.85em!important;padding:.4em .8em!important}\n.nova-info-block{flex-direction:column!important}\n.nova-info-col{margin-bottom:.8em!important}\n}\n@media (max-width:480px){\n.nova-hero{min-height:10.5em!important;margin:.2em .2em .6em!important}\n.nova-hero__title{font-size:1.45em!important;white-space:normal!important}\n.nova-hero__content{padding:5.4em 1em .95em!important;gap:.4em!important}\n.nova-hero__meta{font-size:.72em!important;gap:.6em!important}\n.nova-hero__desc{font-size:.86em!important;-webkit-line-clamp:2!important}\n.nova-hero__voice{font-size:.85em!important}\n.nova-ep__art{width:6em!important;height:3.4em!important}\n.nova-ep{padding:.4em .4em!important;margin:.25em .05em!important;gap:.8em!important}\n.nova-ep__body{gap:.2em!important}\n.nova-ep__title{font-size:1.1em!important}\n.nova-ep__time{font-size:.8em!important}\n.nova-ep__sub{font-size:.8em!important;-webkit-line-clamp:1!important}\n.nova-voices{gap:.5em!important;padding:.1em .1em .8em!important}\n.nova-voice{padding:.5em .85em!important;gap:.5em!important}\n.nova-voice__q{font-size:.65em!important;padding:.1em .35em!important}\n.nova-voice__name{font-size:.9em!important}\n.nova-seasons{gap:.3em!important;padding:.1em .1em .8em!important}\n.nova-season{font-size:.75em!important;padding:.3em .6em!important;min-width:1.8em!important}\n.nova-row{gap:.3em!important;padding:.05em .1em .7em!important}\n.nova-pills{gap:.4em!important;padding:.05em .1em .7em!important;flex-wrap:wrap!important}\n.nova-pill{font-size:.75em!important;padding:.35em .75em!important}\n.nova-pill__k{font-size:.6em!important}\n.nova-pill__v{font-size:.8em!important;max-width:10em!important}\n.nova-pill__badge{min-width:1.1em!important;height:1.1em!important;font-size:.65em!important}\n.nova-info-block{flex-direction:column!important;gap:.6em!important}\n.nova-info-col{margin:0!important;flex:none!important}\n.nova-info-row{flex-wrap:wrap!important}\n}\n.nova-note{display:flex;align-items:center;gap:.5em;padding:.9em 1em .25em;color:#aeb0c8;font-size:.82em;font-weight:700;text-transform:uppercase;letter-spacing:.09em}\n.nova-note::before{content:\"\";width:.35em;height:1em;border-radius:.2em;background:linear-gradient(var(--nova-accent),var(--nova-accent2));box-shadow:0 0 .6em var(--nova-glow)}\n.nova-actors{padding:.3em .2em 1.2em;overflow:hidden;touch-action:pan-y;cursor:grab}\n.nova-actors__track{display:flex;gap:1.2em;will-change:transform;-webkit-user-select:none;user-select:none}\n.nova-actors__track.is-drag{transition:none}\n.nova-actor{flex:0 0 auto;width:6.4em;text-align:center;border-radius:1em;padding:.4em .2em;transition:transform .2s,background .2s}\n.nova-actor.focus{background:rgba(var(--nova-rgb),.1);transform:translateY(-.25em)}\n.nova-actor__ava{width:5em;height:5em;margin:0 auto .55em;border-radius:50%;background-size:cover;background-position:center;background-color:#20222e;box-shadow:0 .4em 1.2em rgba(0,0,0,.5)}\n.nova-actor.focus .nova-actor__ava{box-shadow:0 0 0 .16em var(--nova-accent),0 0 1.6em var(--nova-glow)}\n.nova-actor__name{font-size:.86em;font-weight:600;color:var(--nova-text);line-height:1.15;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}\n.nova-actor__role{font-size:.78em;color:var(--nova-info);margin-top:.15em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.nova-info{display:flex;flex-wrap:wrap;gap:1.4em 2.4em;padding:.3em 1em 1.6em}\n.nova-info__it{min-width:7em}\n.nova-info__k{font-size:.72em;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#7d7f8c}\n.nova-info__v{font-size:.98em;color:var(--nova-text);margin-top:.2em}\n.view--nova{display:inline-flex!important;align-items:center;gap:.5em;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent2))!important;border:0!important;color:#fff!important;box-shadow:0 .35em 1em var(--nova-glow)!important}\n.view--nova .nova-btn__ico{flex:0 0 auto;color:#fff}\n.view--nova span,.view--nova .full-start__button-text{font-weight:800!important;letter-spacing:.08em;color:#fff!important}\n.view--nova.focus{box-shadow:0 0 0 .12em #fff,0 0 1.8em var(--nova-glow)!important;transform:translateY(-.05em) scale(1.02)}\n@media screen and (max-width:600px){.nova-ep__art,.nova-skel__art{width:7.5em;height:4.3em}.nova-ep__title{font-size:1.15em}.nova-ep__sub{font-size:.85em}}\n\n.nova-scope .explorer__files-head {\n  display: block !important;\n  width: 0 !important;\n  height: 0 !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\n.nova-scope .explorer__files-head * {\n  width: 0 !important;\n  height: 0 !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  border: 0 !important;\n  overflow: hidden !important;\n}\n.nova-scope .online-prestige-watched { display: none !important; }\n.nova-scope .torrent-list { padding: 0 .8em 2em !important; }\n.nova-scope .online-prestige--full.nova-ep {\n  display: flex !important;\n  align-items: center;\n  gap: 1.2em;\n  padding: .6em .75em !important;\n  margin: .45em .2em !important;\n  border-radius: 1.1em !important;\n  background: var(--nova-glass) !important;\n  border: 1px solid var(--nova-line) !important;\n  box-shadow: none;\n}\n.nova-scope .online-prestige--full.nova-ep.focus {\n  background: rgba(var(--nova-rgb), .1) !important;\n  border-color: transparent !important;\n  transform: scale(1.01);\n  box-shadow: 0 .8em 2.2em rgba(0, 0, 0, .55), 0 0 0 2px var(--nova-accent), 0 0 2.2em var(--nova-glow);\n}\n.nova-scope .online-prestige.focus::after { display: none !important; }\n.nova-scope .online-prestige + .online-prestige { margin-top: .45em !important; border-top: 0 !important; }\n.nova-scope .nova-ep .online-prestige__img {\n  position: relative;\n  flex: 0 0 auto;\n  width: 11em !important;\n  height: 6.2em !important;\n  margin: 0 !important;\n  border-radius: .8em !important;\n  overflow: hidden !important;\n  opacity: 1 !important;\n  background: linear-gradient(135deg, #2b2d3a, #181924) !important;\n}\n.nova-scope .nova-ep .online-prestige__img > img {\n  display: block;\n  width: 100% !important;\n  height: 100% !important;\n  margin: 0 !important;\n  border-radius: 0 !important;\n  object-fit: cover;\n  opacity: 1 !important;\n}\n.nova-scope .nova-ep .online-prestige__loader { z-index: 2; }\n.nova-scope .nova-ep .online-prestige__episode-number {\n  position: absolute !important;\n  left: .5em !important;\n  top: .45em !important;\n  right: auto !important;\n  bottom: auto !important;\n  z-index: 3;\n  padding: .12em .55em !important;\n  border-radius: .45em !important;\n  font-size: .85em !important;\n  font-weight: 800;\n  color: #fff !important;\n  background: rgba(var(--nova-rgb), .85) !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .4);\n}\n.nova-scope .nova-ep .online-prestige__viewed {\n  position: absolute !important;\n  right: .5em !important;\n  top: .45em !important;\n  left: auto !important;\n  bottom: auto !important;\n  z-index: 3;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 1.7em;\n  height: 1.7em;\n  padding: 0 !important;\n  border-radius: 50%;\n  color: #000 !important;\n  background: #fff !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .5);\n}\n.nova-scope .nova-ep .online-prestige__viewed > svg { width: 1em; height: 1em; }\n.nova-scope .nova-ep .online-prestige__timeline {\n  position: absolute !important;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 3;\n  height: .32em !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  background: rgba(255, 255, 255, .16);\n}\n.nova-scope .nova-ep .online-prestige__timeline > .time-line {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  height: 100% !important;\n  margin: 0 !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n}\n.nova-scope .nova-ep .online-prestige__timeline > .time-line > div {\n  height: 100% !important;\n  border-radius: 0 !important;\n  background: linear-gradient(90deg, var(--nova-accent), var(--nova-accent2)) !important;\n}\n.nova-scope .nova-ep .online-prestige__body {\n  flex: 1 1 auto;\n  min-width: 0;\n  display: flex !important;\n  flex-direction: column;\n  gap: .32em;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__head {\n  display: flex !important;\n  align-items: baseline;\n  gap: 1em;\n  margin: 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__title {\n  flex: 1 1 auto;\n  min-width: 0;\n  margin: 0 !important;\n  font-size: 1.35em !important;\n  font-weight: 700;\n  color: var(--nova-text) !important;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.nova-scope .nova-ep .online-prestige__time {\n  flex: 0 0 auto;\n  margin: 0 !important;\n  font-size: .9em !important;\n  color: var(--nova-info) !important;\n  opacity: 1 !important;\n}\n.nova-scope .nova-ep .online-prestige__footer {\n  display: flex !important;\n  align-items: center;\n  gap: .8em;\n  margin: 0 !important;\n  font-size: .9em;\n  color: var(--nova-info);\n}\n.nova-scope .nova-ep .online-prestige__info {\n  min-width: 0;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  color: var(--nova-info) !important;\n  opacity: 1 !important;\n}\n.nova-scope .nova-ep .online-prestige__quality {\n  flex: 0 0 auto;\n  padding: .16em .52em;\n  border: 0 !important;\n  border-radius: .42em;\n  font-size: .78em;\n  font-weight: 800;\n  color: #fff !important;\n  background: linear-gradient(120deg, var(--nova-accent), var(--nova-accent-lt)) !important;\n}\n.nova-scope .nova-ep .online-prestige__quality:empty { display: none; }\n.nova-scope .nova-ep .nova-ep__play {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  opacity: 0;\n  transition: opacity .2s;\n  text-shadow: 0 2px 10px rgba(0, 0, 0, .7);\n}\n.nova-scope .nova-ep.focus .nova-ep__play { opacity: 1; }\n.nova-scope .nova-ep .nova-ep__scrim {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  z-index: 1;\n  background: linear-gradient(0deg, rgba(0, 0, 0, .45), transparent 55%);\n}\n.nova-scope .nova-ep .nova-ep__resume { margin-left: .2em; }\n.nova-scope .nova-ep.nova-is-sel .nova-ep__title::after {\n  content: '';\n  display: inline-block;\n  width: .45em;\n  height: .45em;\n  margin-left: .5em;\n  border-radius: 50%;\n  vertical-align: middle;\n  background: var(--nova-accent);\n}\n.nova-scope .nova-ep .online-prestige__info:empty { display: none !important; }\n.nova-scope .nova-ep .online-prestige__info > span,\n.nova-scope .nova-ep .online-prestige__info .online-prestige-split {\n  display: inline !important;\n  margin: 0 .35em 0 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__title,\n.nova-scope .nova-ep .nova-ep__title { color: #fff !important; }\n.nova-scope .explorer__files-body .online-prestige--full:not(.nova-ep) { visibility: hidden !important; }\nbody.nova-arming .explorer__left,\nbody.nova-arming .explorer__files-head,\nbody.nova-arming .explorer__files-body .scroll__body:not(.nova-body) { visibility: hidden !important; }\n@keyframes nova-shimmer {\n  0% { background-position: -1200px 0; }\n  100% { background-position: 1200px 0; }\n}\n.nova-skel {\n  animation: nova-shimmer 2.5s infinite;\n  background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 75%);\n  background-size: 1200px 100%;\n}\n\n:root {\n  --nova-accent: #fff;\n  --nova-accent-lt: #fff;\n  --nova-accent2: #fff;\n  --nova-rgb: 255, 255, 255;\n  --nova-glow: rgba(255, 255, 255, 0);\n  --nova-line: rgba(255, 255, 255, .14);\n  --nova-glass: rgba(10, 11, 18, .5);\n  --nova-info: #ccced8;\n  --nova-text: #fff;\n  --lampa-focus-border: .12em solid #fff;\n}\n.nova-pill,\n.nova-season,\n.nova-voice {\n  background-color: rgba(10, 11, 18, .5) !important;\n  border: 0 !important;\n  border-radius: 1em !important;\n  color: #fff !important;\n  box-shadow: none !important;\n  transform: none !important;\n  transition: background-color .2s ease, color .2s ease !important;\n}\n.nova-pill.focus,\n.nova-season.focus,\n.nova-voice.focus {\n  background-color: rgba(10, 11, 18, .62) !important;\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n  box-shadow: 0 0 0 .12em #fff !important;\n  transform: none !important;\n}\n.nova-pill.focus .nova-pill__k,\n.nova-pill.focus .nova-pill__v,\n.nova-pill.focus .nova-pill__c,\n.nova-voice.focus .nova-voice__name { color: #fff !important; }\n.nova-pill__badge {\n  background: rgba(255, 255, 255, .3) !important;\n  color: #fff !important;\n}\n.nova-pill.focus .nova-pill__badge {\n  background: rgba(255, 255, 255, .3) !important;\n  color: #fff !important;\n}\n.nova-season.is-sel,\n.nova-voice.is-sel {\n  background-color: rgba(255, 255, 255, .26) !important;\n  border: 0 !important;\n}\n.nova-season.is-sel.focus,\n.nova-voice.is-sel.focus {\n  background-color: rgba(255, 255, 255, .26) !important;\n  color: #fff !important;\n}\n.nova-voice__q,\n.nova-hero__q,\n.nova-scope .nova-ep .online-prestige__quality {\n  background: rgba(235, 236, 240, .92) !important;\n  color: #14151c !important;\n  -webkit-text-fill-color: #14151c !important;\n  border-radius: .3em !important;\n  box-shadow: none !important;\n  text-shadow: none !important;\n}\n.nova-voice.focus .nova-voice__q {\n  background: #fff !important;\n  color: #14151c !important;\n  -webkit-text-fill-color: #14151c !important;\n}\n.nova-hero {\n  border: 0 !important;\n  transition: none !important;\n  pointer-events: none !important;\n}\n.nova-hero__scrim {\n  background:\n    linear-gradient(0deg, rgba(8, 9, 16, .98), rgba(8, 9, 16, .4) 48%, rgba(8, 9, 16, .03) 78%),\n    linear-gradient(90deg, rgba(8, 9, 16, .72), transparent 62%) !important;\n}\n.nova-chip::before {\n  background: #fff !important;\n  box-shadow: none !important;\n}\n.nova-hero__prog > i { background: #fff !important; }\n.nova-hero__meta,\n.nova-hero__voice { color: #e4e5ee !important; }\n.nova-hero__desc { color: #ccced8 !important; }\n.nova-chip { color: #fff !important; }\n.nova-scope .online-prestige--full.nova-ep {\n  position: relative;\n  border: 0 !important;\n  background: rgba(10, 11, 18, .5) !important;\n  box-shadow: none !important;\n  transition: background-color .2s ease !important;\n}\n.nova-scope .online-prestige--full.nova-ep.focus {\n  background: rgba(10, 11, 18, .66) !important;\n  border: 0 !important;\n  transform: none !important;\n  box-shadow: none !important;\n}\n.nova-scope .online-prestige--full.nova-ep.focus::before {\n  display: none !important;\n}\n\n.nova-scope .online-prestige--full.nova-ep.focus::after {\n  display: block !important;\n  content: '' !important;\n  position: absolute !important;\n  left: 0 !important;\n  top: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  width: auto !important;\n  height: auto !important;\n  margin: 0 !important;\n  border: .12em solid #fff !important;\n  border-radius: 1.1em !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  pointer-events: none !important;\n  z-index: 5 !important;\n}\n.nova-scope .nova-ep .online-prestige__episode-number {\n  background: rgba(235, 236, 240, .92) !important;\n  color: #14151c !important;\n  -webkit-text-fill-color: #14151c !important;\n  border-radius: .4em !important;\n  padding: .18em .5em !important;\n  font-weight: 700 !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .45) !important;\n}\n\n.nova-actors__track {\n  transition: transform .25s ease;\n}\n\n.nova-actors__track.is-drag {\n  transition: none !important;\n}\n\n.nova-pills {\n  flex-wrap: nowrap !important;\n  align-items: center !important;\n  overflow: hidden !important;\n}\n\n.nova-pills > .nova-pill {\n  flex: 0 1 auto !important;\n  min-width: 0 !important;\n}\n\n.nova-pill__v {\n  max-width: 11em !important;\n}\n\n.nova-scope .nova-ep .nova-ep__play > svg,\n.nova-ep__play > svg {\n  width: 1.5em !important;\n  height: 1.5em !important;\n}\n\n.nova-scope .nova-ep .nova-ep__play,\n.nova-ep__play {\n  opacity: 0 !important;\n}\n\n.nova-scope .nova-ep.focus .nova-ep__play,\n.nova-ep.focus .nova-ep__play {\n  opacity: .85 !important;\n}\n\n.nova-scope .nova-ep .nova-ep__scrim,\n.nova-ep__scrim {\n  background: linear-gradient(0deg, rgba(0, 0, 0, .35), transparent 60%) !important;\n}\n\n.nova-hero,\n.nova-hero *,\n.nova-row,\n.nova-row *,\n.nova-pills,\n.nova-pills *,\n.nova-seasons,\n.nova-seasons *,\n.nova-voices,\n.nova-voices *,\n.nova-actors,\n.nova-actors *,\n.nova-info,\n.nova-info *,\n.nova-note,\n.nova-empty,\n.nova-empty *,\n.nova-scope .nova-ep,\n.nova-scope .nova-ep * {\n  font-family: inherit !important;\n}\n\n.nova-hero__title,\n.nova-ep__title,\n.nova-scope .nova-ep .online-prestige__title,\n.nova-pill__v,\n.nova-season,\n.nova-voice__name,\n.nova-actor__name,\n.nova-empty__main,\n.nova-empty__btn {\n  font-weight: 700 !important;\n}\n\n.nova-hero__meta,\n.nova-info__v,\n.nova-chip {\n  font-weight: 400 !important;\n}\n\n.nova-note,\n.nova-pill__k,\n.nova-info__k {\n  font-weight: 600 !important;\n  letter-spacing: .04em !important;\n}\n\n.nova-hero__q,\n.nova-voice__q,\n.nova-ep__badge,\n.nova-ep__resume,\n.nova-pill__badge,\n.nova-scope .nova-ep .online-prestige__quality,\n.nova-scope .nova-ep .online-prestige__episode-number {\n  font-weight: 700 !important;\n  letter-spacing: 0 !important;\n}\n\n.nova-hero__title {\n  letter-spacing: 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__timeline > .time-line > div {\n  background: #fff !important;\n}\n.nova-skel.focus {\n  box-shadow: none !important;\n  transform: none !important;\n}\n.nova-scope .online-prestige--folder.nova-folder {\n  position: relative;\n  border: 0 !important;\n  background: rgba(10, 11, 18, .5) !important;\n  border-radius: 1.1em !important;\n  box-shadow: none !important;\n  transition: background-color .2s ease !important;\n}\n.nova-scope .online-prestige--folder.nova-folder + .online-prestige--folder.nova-folder {\n  margin-top: .45em !important;\n}\n.nova-scope .online-prestige--folder.nova-folder.focus {\n  background: rgba(10, 11, 18, .66) !important;\n  transform: none !important;\n  box-shadow: 0 0 0 .12em #fff !important;\n}\n.nova-scope .online-prestige--folder.nova-folder.focus::after,\n.nova-scope .online-prestige--folder.nova-folder.focus::before {\n  display: none !important;\n}\n.nova-scope .online-prestige--folder.nova-folder .online-prestige__title {\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n}\n.nova-scope .online-prestige--folder.nova-folder .online-prestige__info {\n  color: #ccced8 !important;\n}\n.nova-scope .online-prestige--full.nova-ep.nova-is-sel .nova-ep__title {\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n}\n\n.nova-voice__q:empty { display: none !important; }\n\n.nova-voices {\n  padding: .2em .2em 1.1em !important;\n}\n\n.nova-row {\n  display: flex !important;\n  flex-wrap: wrap !important;\n  align-items: center !important;\n}\n\n.nova-row > .nova-pills,\n.nova-row > .nova-seasons,\n.nova-row > .nova-voices {\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: visible !important;\n}\n\n.nova-row > .nova-note--inline {\n  padding: 0 !important;\n  margin: 0 !important;\n}\n\n.nova-row > .nova-note--inline:first-child {\n  padding-left: .76em !important;\n}\n.view--nova {\n  background: rgba(0, 0, 0, .3) !important;\n  border: 0 !important;\n  border-radius: 1em !important;\n  color: #fff !important;\n  box-shadow: none !important;\n  transform: none !important;\n  transition: background-color .2s ease, color .2s ease !important;\n}\n.view--nova .nova-btn__ico,\n.view--nova span,\n.view--nova .full-start__button-text {\n  color: #fff !important;\n  letter-spacing: normal !important;\n}\n.view--nova.focus {\n  background: #fff !important;\n  box-shadow: none !important;\n  transform: none !important;\n}\n.view--nova.focus .nova-btn__ico,\n.view--nova.focus span,\n.view--nova.focus .full-start__button-text { color: #000 !important; }\n.nova-ep__badge {\n  background: rgba(235, 236, 240, .92) !important;\n  color: #14151c !important;\n  -webkit-text-fill-color: #14151c !important;\n  border-radius: .4em !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .45) !important;\n}\n.nova-ep__mark,\n.nova-scope .nova-ep .online-prestige__viewed {\n  background: #fff !important;\n  color: #000 !important;\n  box-shadow: none !important;\n}\n.nova-ep__resume {\n  background: #fff !important;\n  color: #000 !important;\n}\n.nova-actor.focus {\n  background: rgba(255, 255, 255, .1) !important;\n  transform: none !important;\n}\n.nova-actor.focus .nova-actor__ava {\n  box-shadow: 0 0 0 .12em #fff !important;\n}\n.nova-actor {\n  border-radius: 1em !important;\n}\n.nova-actor.focus {\n  box-shadow: none !important;\n}\n.nova-empty__btn {\n  background: rgba(255, 255, 255, .1) !important;\n  border: 0 !important;\n  border-radius: 1em !important;\n  color: #fff !important;\n}\n.nova-empty__btn.focus {\n  background: #fff !important;\n  color: #000 !important;\n  box-shadow: none !important;\n}\n.nova-shine:after {\n  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .12), transparent) !important;\n}\n.nova-note::before {\n  background: #fff !important;\n  box-shadow: none !important;\n}\n";
  var NOVA_TPL = {
  "nova_hero": "<div class=\"nova-hero\" style=\"background-image:url({art})\"><div class=\"nova-hero__scrim\"></div><div class=\"nova-hero__content\"><div class=\"nova-hero__title\">{title}</div><div class=\"nova-hero__meta\"><span class=\"nova-hero__q\">{quality}</span><span>{meta}</span></div><div class=\"nova-hero__chips\">{chips}</div><div class=\"nova-hero__desc\">{desc}</div><div class=\"nova-hero__cta\"><span class=\"nova-hero__voice\">{voice}</span></div></div><div class=\"nova-hero__prog\"><i style=\"width:{progress}%\"></i></div></div>",
  "nova_episode": "<div class=\"nova-ep selector\"><div class=\"nova-ep__art\" style=\"background-image:url({still})\"><span class=\"nova-ep__badge\">{num}</span><span class=\"nova-ep__mark\">{mark}</span><span class=\"nova-ep__scrim\"></span><span class=\"nova-ep__play\"><svg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M6 4l14 8-14 8V4z\" fill=\"currentColor\"/></svg></span><span class=\"nova-ep__prog\"><i style=\"width:{progress}%\"></i></span></div><div class=\"nova-ep__body\"><div class=\"nova-ep__top\"><div class=\"nova-ep__title\">{title}</div><span class=\"nova-ep__resume\">{resume}</span><div class=\"nova-ep__time\">{time}</div></div><div class=\"nova-ep__sub\">{sub}</div></div></div>",
  "nova_voice": "<div class=\"nova-voice selector\"><span class=\"nova-voice__q\">{quality}</span><span class=\"nova-voice__name\">{name}</span></div>",
  "nova_season": "<div class=\"nova-season selector\">{title}</div>",
  "nova_actor": "<div class=\"nova-actor selector\"><div class=\"nova-actor__ava\" style=\"background-image:url({img})\"></div><div class=\"nova-actor__name\">{name}</div><div class=\"nova-actor__role\">{role}</div></div>"
};

  function esc(value) {
    return ('' + (value == null ? '' : value)).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  function strip(html) {
    return ('' + (html == null ? '' : html)).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function infoParts(html) {
    var out = [];
    ('' + (html == null ? '' : html)).split(/<span class="online-prestige-split">[^<]*<\/span>/).forEach(function (chunk) {
      var text = strip(chunk);
      if (text) out.push(text);
    });
    return out;
  }

  function digits(value) {
    var m = ('' + (value == null ? '' : value)).match(/\d+/);
    return m ? m[0] : '';
  }

  function image(path, size) {
    if (!path) return '';
    if (/^https?:/.test(path)) return path;
    try {
      return Lampa.TMDB.image('t/p/' + (size || 'w1280') + path);
    } catch (e) {
      return '';
    }
  }

  function heroArt(movie) {
    return image(movie.backdrop_path || movie.poster_path, 'w1280');
  }

  function year(movie) {
    return ((movie.release_date || movie.first_air_date || '') + '').slice(0, 4);
  }

  function runtime(movie) {
    var mins = parseInt(movie.runtime || (movie.episode_run_time || [])[0] || 0, 10);
    if (!mins) return '';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return h ? h + 'ч' + (m ? ' ' + m + 'м' : '') : m + 'м';
  }

  function meta(movie, serial) {
    var parts = [];
    var y = year(movie);
    if (y) parts.push(y);
    var rate = parseFloat(movie.vote_average || 0);
    if (rate) parts.push(rate.toFixed(1));
    var r = runtime(movie);
    if (r) parts.push(r);
    if (serial && movie.number_of_seasons) parts.push(movie.number_of_seasons + ' сез.');
    return esc(parts.join('  ·  '));
  }

  function chips(movie) {
    var out = [];
    (movie.genres || []).slice(0, 3).forEach(function (g) {
      if (g && g.name) out.push('<span class="nova-chip">' + esc(g.name) + '</span>');
    });
    return out.join('');
  }

  function description(movie) {
    return esc(('' + (movie.overview || movie.description || '')).replace(/\s+/g, ' ').trim());
  }

  function qualityLabel(text) {
    text = ('' + (text == null ? '' : text)).trim();
    if (!text) return '';
    var m = text.match(/\d{3,4}/);
    if (!m) return text.toUpperCase().slice(0, 12);
    var n = parseInt(m[0], 10);
    if (n >= 2160) return '4K';
    if (n >= 1080) return 'FHD';
    if (n >= 720) return 'HD';
    return n + 'p';
  }

  function itemQuality(item) {
    if (!item) return '';
    var raw = item.quality;
    if (raw && typeof raw === 'object') {
      var keys = [];
      for (var k in raw) keys.push(k);
      raw = keys.length ? keys[0] : '';
    }
    return qualityLabel(raw || item.info || '');
  }

  function movieProgress(movie) {
    try {
      var hash = Lampa.Utils.hash(movie.original_title || movie.original_name || movie.title || movie.name);
      var view = Lampa.Timeline.view(hash);
      var percent = parseFloat(view && view.percent) || 0;
      return Math.max(0, Math.min(100, percent));
    } catch (e) {
      return 0;
    }
  }

  function shortDate(value) {
    try {
      var parsed = Lampa.Utils.parseTime(value);
      return parsed.short || parsed.full || '';
    } catch (e) {
      return '';
    }
  }

  function addStyle() {
    try {
      console.log('nova build', NOVA_BUILD);
    } catch (e) {}
    var old = document.getElementById('nova-view-style');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var style = document.createElement('style');
    style.id = 'nova-view-style';
    style.textContent = NOVA_CSS;
    (document.body || document.head).appendChild(style);
  }

  function addTemplates() {
    if (typeof Lampa === 'undefined' || !Lampa.Template || !Lampa.Template.add) return;
    for (var name in NOVA_TPL) Lampa.Template.add(name, NOVA_TPL[name]);
  }

  function bind(element, opt, enter) {
    element.on('hover:focus', function (e) {
      if (opt.onFocus) opt.onFocus(e.target);
    });
    element.on('hover:enter', function () {
      try {
        enter();
      } catch (e) {}
    });
    return element;
  }

  var SELECTORS = { sort: '.filter--sort', filter: '.filter--filter', search: '.filter--search' };

  var pending = null;

  function remember(kind, index) {
    pending = { kind: kind, index: index || 0 };
  }

  function restorePending(opt) {
    if (!pending) return;
    var want = pending;
    pending = null;
    try {
      var list = opt.scroll.body().find('.' + want.kind);
      if (!list.length) return;
      var node = list.eq(Math.max(0, Math.min(want.index, list.length - 1)));
      if (node.length && opt.onFocus) opt.onFocus(node[0]);
    } catch (e) {}
  }

  function openSelect(opt, type) {
    if (type === 'sort') remember('nova-pill', 0);
    try {
      var node = opt.filter.render().find(SELECTORS[type]);
      if (node.length) {
        node.trigger('hover:enter');
        return;
      }
    } catch (e) {}
    try {
      if (opt.filter && opt.filter.show && type !== 'search') {
        opt.filter.show(Lampa.Lang.translate(type === 'sort' ? 'lampac_balanser' : 'title_filter'), type);
      }
    } catch (e) {}
  }

  function applyChoice(opt, stype, index, url, title) {
    if (stype === 'season') remember('nova-season', index);
    else if (stype === 'voice') remember('nova-voice', index);
    try {
      var choice = opt.component.getChoice();
      if (stype === 'voice') {
        choice.voice_name = title;
        choice.voice_url = url;
      }
      choice[stype] = index;
      opt.component.saveChoice(choice);
      opt.component.reset();
      opt.component.request(url);
    } catch (e) {}
  }

  function backToContent() {
    try {
      Lampa.Controller.toggle('content');
    } catch (e) {}
  }

  function openList(opt, stype, title) {
    var list = (opt.filter_find && opt.filter_find[stype]) || [];
    if (!list.length) return false;

    var selected = parseInt(opt.choice[stype], 10) || 0;
    var items = [];

    list.forEach(function (item, index) {
      items.push({
        title: item.title,
        selected: index === selected,
        index: index,
        url: item.url
      });
    });

    try {
      Lampa.Select.show({
        title: title,
        items: items,
        onBack: backToContent,
        onSelect: function (item) {
          if (item.index === selected) return backToContent();
          applyChoice(opt, stype, item.index, item.url, item.title);
        }
      });
    } catch (e) {
      return false;
    }
    return true;
  }

  function pill(opt, key, value, count, type) {
    var html = $(
      '<div class="nova-pill selector">' +
      '<div class="nova-pill__k">' + esc(key) + '</div>' +
      '<div class="nova-pill__v">' + esc(value) + '</div>' +
      (count > 1 ? '<div class="nova-pill__badge">' + count + '</div>' : '') +
      '</div>'
    );
    return bind(html, opt, function () {
      if (type === 'voice' || type === 'season') {
        if (openList(opt, type, key)) return;
      }
      openSelect(opt, type === 'voice' || type === 'season' ? 'filter' : type);
    });
  }

  function buildHero(opt) {
    var movie = opt.object.movie || {};
    var serial = opt.serial;
    var season = opt.season;
    var progress = serial ? 0 : movieProgress(movie);
    var quality = itemQuality(opt.items[0]);

    var voices = (opt.filter_find && opt.filter_find.voice) || [];
    var seasons = (opt.filter_find && opt.filter_find.season) || [];
    var voice = opt.choice.voice_name ||
      (voices[opt.choice.voice] && voices[opt.choice.voice].title) ||
      (voices[0] && voices[0].title) || '';

    var state = [];
    if (serial) {
      var stitle = seasons[opt.choice.season] && seasons[opt.choice.season].title;
      state.push(stitle ? 'Сезон ' + (digits(stitle) || (season || 1)) : 'Сезон ' + (season || 1));
    }
    if (voice) state.push(voice);
    if (serial && opt.items.length) state.push(opt.items.length + ' сер.');
    if (progress > 0) state.push('Просмотрено ' + Math.round(progress) + '%');

    return $(Lampa.Template.get('nova_hero', {
      art: heroArt(movie),
      quality: esc(quality || 'AUTO'),
      title: esc(movie.title || movie.name || ''),
      meta: meta(movie, serial),
      chips: chips(movie),
      desc: description(movie),
      voice: esc(state.join('  ·  ')),
      progress: progress
    }));
  }

  function buildPills(opt) {
    var row = $('<div class="nova-pills"></div>');
    var sources = opt.sources || {};
    var voices = (opt.filter_find && opt.filter_find.voice) || [];

    if (opt.balanser && sources[opt.balanser]) {
      var count = 0;
      for (var s in sources) count++;
      row.append(pill(opt, 'Источник', sources[opt.balanser].name || opt.balanser, count, 'sort'));
    }

    if (opt.serial && voices.length === 1) {
      var current = opt.choice.voice_name ||
        (voices[opt.choice.voice] && voices[opt.choice.voice].title) ||
        voices[0].title;
      row.append(pill(opt, 'Озвучка', current, voices.length, 'voice'));
    }

    return row.children().length ? row : null;
  }

  function buildSeasons(opt) {
    var seasons = (opt.filter_find && opt.filter_find.season) || [];
    if (!opt.serial || seasons.length < 2) return null;

    var selected = parseInt(opt.choice.season, 10) || 0;
    var row = $('<div class="nova-seasons"></div>');

    seasons.forEach(function (item, index) {
      var tile = $(Lampa.Template.get('nova_season', { title: digits(item.title) || index + 1 }));
      if (index === selected) tile.addClass('is-sel');
      bind(tile, opt, function () {
        if (index === selected) return;
        applyChoice(opt, 'season', index, item.url, item.title);
      });
      row.append(tile);
    });

    return row;
  }

  function voiceParts(title) {
    var text = ('' + (title == null ? '' : title)).trim();
    var at = text.indexOf('|');
    if (at > 0 && at < 10) {
      return { q: text.slice(0, at).trim(), name: text.slice(at + 1).trim() };
    }
    return { q: '', name: text };
  }

  function buildVoices(opt) {
    var voices = (opt.filter_find && opt.filter_find.voice) || [];
    if (!opt.serial || voices.length < 2) return null;

    var selected = parseInt(opt.choice.voice, 10) || 0;
    var current = opt.choice.voice_name || '';
    var row = $('<div class="nova-voices"></div>');

    voices.forEach(function (item, index) {
      var parts = voiceParts(item.title);
      var chip = $(Lampa.Template.get('nova_voice', {
        quality: esc(parts.q),
        name: esc(parts.name)
      }));
      if (current ? item.title === current : index === selected) chip.addClass('is-sel');
      bind(chip, opt, function () {
        if (chip.hasClass('is-sel')) return;
        applyChoice(opt, 'voice', index, item.url, item.title);
      });
      row.append(chip);
    });

    return row;
  }

  var credits = {};
  var lastChoice = null;

  var hop = { id: null, tried: {}, count: 0 };
  var hopTimer = null;

  function stopHop() {
    clearTimeout(hopTimer);
    hopTimer = null;
  }

  function sourceTitle(sources, key) {
    if (!key) return '';
    var item = sources && sources[key];
    return (item && item.name) || key;
  }

  function nextSource(opt) {
    var sources = opt.sources || {};
    for (var key in sources) {
      if (!sources[key]) continue;
      if (sources[key].show === false) continue;
      if (key === opt.balanser) continue;
      if (hop.tried[key]) continue;
      return key;
    }
    return '';
  }

  function emptyButton(text, action) {
    var node = $('<div class="nova-empty__btn selector"></div>').text(text);
    node.on('hover:enter', function () {
      try {
        action();
      } catch (e) {}
    });
    return node;
  }

  function focusFirst(opt, node) {
    try {
      var box = opt.scroll.render();
      if (typeof Lampa.Controller.collectionSet !== 'function') return;
      Lampa.Controller.collectionSet(box);
      Lampa.Controller.collectionFocus(node && node.length ? node[0] : false, box);
    } catch (e) {}
  }

  function skelRow(first) {
    return '<div class="nova-skel' + (first ? ' selector' : '') + '">' +
      '<div class="nova-skel__art nova-shine"></div>' +
      '<div class="nova-skel__body">' +
      '<div class="nova-skel__l nova-shine" style="width:42%"></div>' +
      '<div class="nova-skel__l nova-shine" style="width:66%;height:.7em"></div>' +
      '</div></div>';
  }

  function skeleton(opt, label) {
    var wrap = $('<div class="nova-load"></div>');
    wrap.append($('<div class="nova-note nova-load__note"></div>').text(label || ''));
    for (var i = 0; i < 4; i++) wrap.append(skelRow(i === 0));
    opt.scroll.clear();
    opt.scroll.append(wrap);
  }

  function folderFocus(opt, node) {
    try {
      if (!node || !node.length) return;
      var box = opt.scroll.render();
      if (typeof Lampa.Controller.collectionSet !== 'function') return;
      var args = [box];
      if (opt.files && opt.files.render) args.push(opt.files.render());
      Lampa.Controller.collectionSet.apply(Lampa.Controller, args);
      Lampa.Controller.collectionFocus(node[0], box);
      if (opt.onFocus) opt.onFocus(node[0]);
    } catch (e) {}
  }

  function decorateFolders(opt) {
    var body;
    try {
      body = opt.scroll.body();
    } catch (e) {
      return false;
    }
    if (!body || !body.length) return false;

    var list = body.find('.online-prestige--folder');
    if (!list.length) return false;

    if (!body.find('.nova-folders-note').length) {
      $('<div class="nova-note nova-folders-note">ВАРИАНТЫ</div>').insertBefore(list.first());
    }

    var fresh = null;

    list.each(function () {
      var card = $(this);
      if (card.hasClass('nova-folder')) return;
      card.addClass('nova-folder');

      var title = card.find('.online-prestige__title').text().trim();
      var info = card.find('.online-prestige__info');
      if (info.length) {
        var parts = [];
        infoParts(info.html()).forEach(function (part) {
          if (part && part !== title && parts.indexOf(part) === -1) parts.push(part);
        });
        info.text(parts.join('  •  '));
      }

      card.on('hover:focus', function (e) {
        if (opt.onFocus) opt.onFocus(e.target);
      });

      if (!fresh) fresh = card;
    });

    if (fresh && !body.find('.online-prestige--folder.focus').length) folderFocus(opt, list.first());
    return true;
  }

  function emptyScreen(opt, failed) {
    var sources = opt.sources || {};
    var movie = (opt.object && opt.object.movie) || {};
    var id = movie.id || movie.original_title || movie.title || 'x';

    if (hop.id !== id) hop = { id: id, tried: {}, count: 0 };
    if (opt.balanser) hop.tried[opt.balanser] = true;

    var next = nextSource(opt);
    var can = !!(opt.component && typeof opt.component.changeBalanser === 'function');
    var auto = !!next && can && hop.count < 15;

    var wrap = $('<div class="nova-empty"></div>');
    wrap.append('<div class="nova-empty__main">' + esc(failed ? 'Источник не ответил' : 'Здесь пусто') + '</div>');

    var reason = '';
    try {
      if (opt.error && opt.error.accsdb && opt.error.msg) reason = strip(opt.error.msg);
    } catch (e) {}

    var hint;
    if (auto) hint = (reason || sourceTitle(sources, opt.balanser) + ': ничего нет') + ', перехожу на ' + sourceTitle(sources, next);
    else if (next) hint = (reason ? reason + '. ' : '') + 'Остались непроверенные источники, переключитесь вручную';
    else hint = reason || 'Ни один источник ничего не нашёл';
    wrap.append('<div class="nova-empty__hint">' + esc(hint) + '</div>');

    var row = $('<div class="nova-empty__row"></div>');
    var first;

    if (auto) {
      first = emptyButton('Остаться здесь', function () {
        stopHop();
        wrap.find('.nova-empty__hint').text(sourceTitle(sources, opt.balanser) + ': ничего не нашлось');
        var rest = row.find('.nova-empty__btn').eq(1);
        row.find('.nova-empty__btn').eq(0).remove();
        focusFirst(opt, rest);
      });
    } else {
      first = emptyButton('Обновить', function () {
        stopHop();
        hop = { id: null, tried: {}, count: 0 };
        try {
          Lampa.Activity.replace();
        } catch (e) {}
      });
    }
    row.append(first);

    row.append(emptyButton('Сменить источник', function () {
      stopHop();
      openSelect(opt, 'sort');
    }));

    wrap.append(row);

    opt.scroll.clear();
    opt.scroll.append(wrap);
    focusFirst(opt, first);

    if (auto) {
      hop.count++;
      hop.tried[next] = true;
      stopHop();
      hopTimer = setTimeout(function () {
        hopTimer = null;
        try {
          if (Lampa.Activity.active().activity !== opt.component.activity) return;
        } catch (e) {}
        try {
          opt.component.changeBalanser(next);
        } catch (e) {}
      }, 1200);
    }

    return true;
  }

  function rawQuality(item) {
    if (!item) return '';
    var raw = item.quality;
    if (raw && typeof raw === 'object') {
      var keys = [];
      for (var k in raw) keys.push(k);
      raw = keys.length ? keys[0] : '';
    }
    return ('' + (raw || '')).trim().slice(0, 24);
  }

  function loadCast(movie, serial, done) {
    var id = movie && movie.id;
    if (!id) return done([]);
    if (credits[id]) return done(credits[id]);
    try {
      var lang = Lampa.Storage.get('language', 'ru');
      var url = Lampa.TMDB.api((serial ? 'tv' : 'movie') + '/' + id + '/credits?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
      var net = new Lampa.Reguest();
      net.silent(url, function (json) {
        var cast = (json && json.cast) || [];
        credits[id] = cast;
        done(cast);
      }, function () {
        credits[id] = [];
        done([]);
      });
    } catch (e) {
      done([]);
    }
  }

  function openActor(person) {
    try {
      Lampa.Activity.push({
        url: '',
        component: 'actor',
        id: person.id,
        job: ('' + (person.known_for_department || 'acting')).toLowerCase(),
        source: 'tmdb',
        page: 1
      });
    } catch (e) {}
  }

  function trackMax(track) {
    try {
      return Math.max(0, track[0].scrollWidth - track.parent().width());
    } catch (e) {
      return 0;
    }
  }

  function trackMove(track, value) {
    var shift = Math.max(0, Math.min(trackMax(track), value || 0));
    track.attr('data-shift', shift);
    track.css('transform', 'translate3d(-' + shift + 'px,0,0)');
    return shift;
  }

  function shiftTrack(track, target) {
    try {
      var box = track.parent();
      var width = box.width();
      var node = $(target);
      var left = node[0].offsetLeft;
      var right = left + node.outerWidth();
      var shift = parseFloat(track.attr('data-shift')) || 0;
      if (right - shift > width) shift = right - width + 20;
      if (left - shift < 0) shift = Math.max(0, left - 20);
      trackMove(track, shift);
    } catch (e) {}
  }

  function dragPoint(e) {
    var list = e.touches && e.touches.length ? e.touches : e.changedTouches;
    if (list && list.length) return list[0];
    return typeof e.clientX === 'number' ? e : null;
  }

  function dragTrack(wrap, track) {
    var node = wrap[0];
    if (!node || !node.addEventListener) return;

    var down = false;
    var lock = 0;
    var startX = 0;
    var startY = 0;
    var base = 0;
    var moved = 0;

    function stop(e) {
      try {
        if (e.cancelable !== false && e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      } catch (err) {}
    }

    function begin(e) {
      var point = dragPoint(e);
      if (!point) return;
      if (!trackMax(track)) return;
      down = true;
      lock = 0;
      moved = 0;
      startX = point.clientX;
      startY = point.clientY;
      base = parseFloat(track.attr('data-shift')) || 0;
      track.addClass('is-drag');
    }

    function move(e) {
      if (!down) return;
      var point = dragPoint(e);
      if (!point) return;
      var dx = point.clientX - startX;
      var dy = point.clientY - startY;
      if (!lock) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        lock = Math.abs(dx) > Math.abs(dy) ? 1 : -1;
        if (lock < 0) {
          down = false;
          track.removeClass('is-drag');
          return;
        }
      }
      moved = Math.abs(dx);
      trackMove(track, base - dx);
      stop(e);
    }

    function end(e) {
      if (!down) return;
      down = false;
      track.removeClass('is-drag');
      if (lock > 0 && moved > 8) stop(e);
      lock = 0;
    }

    node.addEventListener('touchstart', begin, false);
    node.addEventListener('touchmove', move, false);
    node.addEventListener('touchend', end, false);
    node.addEventListener('touchcancel', end, false);
    node.addEventListener('mousedown', begin, false);
    node.addEventListener('mousemove', move, false);
    node.addEventListener('mouseup', end, false);
    node.addEventListener('mouseleave', end, false);
  }

  function buildActors(opt, cast) {
    var wrap = $('<div class="nova-actors"></div>');
    var track = $('<div class="nova-actors__track"></div>');

    cast.slice(0, 20).forEach(function (person) {
      if (!person || !person.name) return;
      var card = $(Lampa.Template.get('nova_actor', {
        img: image(person.profile_path, 'w300'),
        name: esc(person.name),
        role: esc(person.character || '')
      }));
      card.on('hover:focus', function (e) {
        shiftTrack(track, e.target);
      });
      bind(card, opt, function () {
        openActor(person);
      });
      track.append(card);
    });

    if (!track.children().length) return null;
    wrap.append(track);
    dragTrack(wrap, track);
    return wrap;
  }

  function infoItem(key, value) {
    return '<div class="nova-info__it"><div class="nova-info__k">' + esc(key) + '</div>' +
      '<div class="nova-info__v">' + esc(value) + '</div></div>';
  }

  function buildInfo(opt) {
    var movie = opt.object.movie || {};
    var parts = [];

    var y = year(movie);
    if (y) parts.push(infoItem('Год', y));

    var rates = [];
    var tmdb = parseFloat(movie.vote_average || 0);
    if (tmdb) rates.push('TMDB ' + tmdb.toFixed(1));
    var imdb = parseFloat(movie.imdb_rating || 0);
    if (imdb) rates.push('IMDb ' + imdb.toFixed(1));
    var kp = parseFloat(movie.kp_rating || 0);
    if (kp) rates.push('КП ' + kp.toFixed(1));
    if (rates.length) parts.push(infoItem('Рейтинг', rates.join(' · ')));

    var quality = rawQuality(opt.items && opt.items[0]);
    if (quality) parts.push(infoItem('Качество', quality));

    if (movie.original_language) parts.push(infoItem('Язык оригинала', ('' + movie.original_language).toUpperCase()));

    var genres = [];
    (movie.genres || []).forEach(function (g) {
      if (g && g.name) genres.push(g.name);
    });
    if (genres.length) parts.push(infoItem('Жанр', genres.slice(0, 3).join(', ')));

    if (!parts.length) return null;
    return $('<div class="nova-info">' + parts.join('') + '</div>');
  }

  function note(text) {
    return $('<div class="nova-note"></div>').text(text);
  }

  function refocus() {
    try {
      if (Lampa.Controller.enabled().name === 'content') Lampa.Controller.toggle('content');
    } catch (e) {}
  }

  var api = {
    install: function () {
      try {
        addStyle();
        addTemplates();
      } catch (e) {}
    },

    scope: function (render) {
      try {
        $(render).addClass('nova-scope');
      } catch (e) {}
    },

    up: function () {
      try {
        var focused = $('.nova-scope').find('.focus').first();
        if (!focused.length) return false;
        if (focused.closest('.explorer__files-head').length) {
          Lampa.Controller.toggle('head');
          return true;
        }
      } catch (e) {}
      return false;
    },

    right: function () {
      try {
        return $('.nova-scope').length ? true : false;
      } catch (e) {}
      return false;
    },

    unreachable: function (filter) {
      try {
        var head = filter.render().closest('.explorer__files-head');
        if (!head.length) head = filter.render().parent();
        head.attr('aria-hidden', 'true');
        head.find('.selector').attr('aria-hidden', 'true');
        filter.render().attr('aria-hidden', 'true');
        filter.render().find('.selector').attr('aria-hidden', 'true');
      } catch (e) {}
    },

    loading: function (opt) {
      try {
        if (!opt || !opt.scroll) return false;
        var name = sourceTitle(opt.sources, opt.balanser);
        skeleton(opt, name ? 'Загружаю ' + name + '…' : 'Загружаю…');
        return true;
      } catch (e) {}
      return false;
    },

    folders: function (opt) {
      try {
        if (!opt || !opt.scroll) return false;
        var run = function () {
          try {
            decorateFolders(opt);
          } catch (e) {}
        };
        run();
        setTimeout(run, 0);
        setTimeout(run, 90);
        return true;
      } catch (e) {}
      return false;
    },

    empty: function (opt) {
      try {
        if (!opt || !opt.scroll) return false;
        return emptyScreen(opt, false);
      } catch (e) {}
      return false;
    },

    dead: function (opt) {
      try {
        if (!opt || !opt.scroll) return false;
        return emptyScreen(opt, true);
      } catch (e) {}
      return false;
    },

    episodeBadge: function (season, episode) {
      if (!episode) return '';
      if (season) return 'S' + season + 'E' + episode;
      return (episode < 10 ? '0' : '') + episode;
    },

    head: function (opt) {
      try {
        if (!opt.items || !opt.items.length) return;
        stopHop();
        hop = { id: null, tried: {}, count: 0 };
        opt.choice = opt.choice || {};
        lastChoice = opt.choice;
        opt.season = opt.serial && opt.items[0] ? opt.items[0].season : 0;

        opt.scroll.append(buildHero(opt));

        var pills = buildPills(opt);
        var seasons = buildSeasons(opt);
        var voices = buildVoices(opt);

        if (opt.serial && (pills || seasons)) {
          var top = $('<div class="nova-row nova-row--top"></div>');
          if (pills) top.append(pills);
          if (seasons) {
            top.append(note('СЕЗОНЫ').addClass('nova-note--inline'));
            top.append(seasons);
          }
          opt.scroll.append(top);
        } else if (pills) {
          opt.scroll.append(pills);
        }

        if (voices) {
          var vrow = $('<div class="nova-row nova-row--voices"></div>');
          vrow.append(note('ОЗВУЧКА').addClass('nova-note--inline'));
          vrow.append(voices);
          opt.scroll.append(vrow);
        }

        opt.scroll.append(note(opt.serial ? 'СЕРИИ' : 'ОЗВУЧКА'));

        loadCast(opt.object.movie || {}, opt.serial, function () {});
      } catch (e) {}
    },

    foot: function (opt) {
      try {
        if (!opt || !opt.scroll || !opt.items || !opt.items.length) return;
        opt.choice = opt.choice || {};

        restorePending(opt);

        var info = buildInfo(opt);
        var movie = opt.object.movie || {};
        var ready = !!credits[movie.id];

        loadCast(movie, opt.serial, function (cast) {
          try {
            var actors = buildActors(opt, cast);
            if (actors) {
              opt.scroll.append(note('В ролях'));
              opt.scroll.append(actors);
            }
            if (info) {
              opt.scroll.append(note('Информация'));
              opt.scroll.append(info);
            }
            if (!ready && (actors || info)) refocus();
          } catch (e) {}
        });
      } catch (e) {}
    },

    decorateCard: function (html, element, episode, serial) {
      try {
        var title = html.find('.online-prestige__title').text().trim();
        var sub = [];

        if (serial) {
          if (episode) {
            var date = shortDate(episode.air_date);
            if (date) sub.push(date);
            var overview = ('' + (episode.overview || '')).replace(/\s+/g, ' ').trim();
            if (overview) sub.push(overview);
          }
          if (!sub.length && element.info) sub.push(strip(element.info));
        } else {
          infoParts(element.info).forEach(function (part) {
            if (part && part !== title) sub.push(part);
          });
          var picked = lastChoice && lastChoice.voice_name;
          if (picked && title === ('' + picked).trim()) html.addClass('nova-is-sel');
        }

        html.find('.online-prestige__info').html(esc(sub.join(' • ')));

        var percent = (element.timeline && parseFloat(element.timeline.percent)) || 0;
        if (percent >= 90) html.addClass('nova-ep--watched');
        else if (percent > 1) html.find('.nova-ep__top').append('<span class="nova-ep__resume">Продолжить</span>');
      } catch (e) {}
    }
  };

  window.NOVA_VIEW = api;
})();
