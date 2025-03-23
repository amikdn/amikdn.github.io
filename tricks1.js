(function() {
  'use strict';

  var fxapi_token = '5c8dc18ea0cd702ac1338ff9aa321d55';
  var unic_id = 'waoqeEEMtP8skyG4';
  var proxy_url = 'http://cors.cfhttp.top/';
  var api_url = 'http://filmixapp.cyou/api/v2/';
  var dev_token = 'user_dev_apk=2.0.1&user_dev_id=' + unic_id + '&user_dev_name=Lampa&user_dev_os=11&user_dev_vendor=FXAPI&user_dev_token=' + fxapi_token;
  var modalopen = false;

  var Defined = {
    api: 'lampac',
    localhost: 'https://lam.akter-black.com/',
    apn: ''
  };
  
  var unic_id = Lampa.Storage.get('lampac_unic_id', '');
  if (!unic_id) {
    unic_id = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unic_id);
  }

  if (!window.rch) {
    Lampa.Utils.putScript(["https://abmsx.tech/invc-rch.js"], function() {}, false, function() {
      if (!window.rch.startTypeInvoke)
        window.rch.typeInvoke('https://abmsx.tech', function() {});
    }, true);
  }

  function BlazorNet() {
    this.net = new Lampa.Reguest();
    this.timeout = function(time) {
      this.net.timeout(time);
    };
    this.req = function(type, url, secuses, error, post) {
      var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var path = url.split(Defined.localhost).pop().split('?');
      if (path[0].indexOf('http') >= 0) return this.net[type](url, secuses, error, post, params);
      DotNet.invokeMethodAsync("JinEnergy", path[0], path[1]).then(function(result) {
        if (params.dataType == 'text') secuses(result);
        else secuses(Lampa.Arrays.decodeJson(result, {}));
      })["catch"](function(e) {
        console.log('Blazor', 'error:', e);
        error(e);
      });
    };
    this.silent = function(url, secuses, error, post) {
      var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      this.req('silent', url, secuses, error, post, params);
    };
    this["native"] = function(url, secuses, error, post) {
      var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      this.req('native', url, secuses, error, post, params);
    };
    this.clear = function() {
      this.net.clear();
    };
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
    var hubConnection;
    var hub_timer;
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
    var balansers_with_search = ['kinotochka', 'kinopub', 'lumex', 'filmix', 'filmixtv', 'redheadsound', 'animevost', 'animego', 'animedia', 'animebesst', 'anilibria', 'rezka', 'rhsprem', 'kodik', 'remux', 'animelib', 'kinoukr', 'rc/filmix', 'rc/fxapi', 'rc/kinopub', 'rc/rhs', 'vcdn'];

    function account(url) {
      url = url + '';
      if (url.indexOf('account_email=') == -1) {
        var email = Lampa.Storage.get('account_email');
        if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
      }
      if (url.indexOf('uid=') == -1) {
        var uid = Lampa.Storage.get('lampac_unic_id', '');
        if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
      }
      if (url.indexOf('token=') == -1) {
        var token = '';
        if (token != '') url = Lampa.Utils.addUrlComponent(url, 'token=');
      }

      url = Lampa.Utils.addUrlComponent(url, 'ab_token=' + Lampa.Storage.get('token'));
      
      return url;
    }

    this.requestParams = function(url) {
      if (balanser && balanser.toLowerCase() === 'filmixtv') {
        // Формируем URL для API Filmix
        url = proxy_url + api_url + 'lite/events?' + dev_token;
      }

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
      if (Lampa.Storage.get('account_email', '')) query.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', '')));

      // Добавляем dev_token для Filmix API
      if (balanser && balanser.toLowerCase() === 'filmixtv') {
        query.push(dev_token);
      }

      return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
    };

    // Остальная часть кода остается без изменений...
  }

  function startPlugin() {
    window.lampac_plugin = true;
    var manifst = {
      type: 'video',
      version: '2',
      name: '4m1K',
      description: 'Плагин для просмотра онлайн сериалов и фильмов',
      component: 'lampac',
      onContextMenu: function onContextMenu(object) {
        return {
          name: Lampa.Lang.translate('lampac_watch'),
          description: 'Плагин для просмотра онлайн сериалов и фильмов'
        };
      },
      onContextLauch: function onContextLauch(object) {
        resetTemplates();
        Lampa.Component.add('lampac', component);

        var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
        var all = Lampa.Storage.get('clarification_search', '{}');

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

    // Остальная часть кода остается без изменений...
  }

  if (!window.lampac_plugin) startPlugin();

})();
