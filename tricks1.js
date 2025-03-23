(function () {
    'use strict';

    function startsWith(str, searchString) {
      return str.lastIndexOf(searchString, 0) === 0;
    }

    function endsWith(str, searchString) {
      var start = str.length - searchString.length;
      if (start < 0) return false;
      return str.indexOf(searchString, start) === start;
    }

    var myIp = '';

    function decodeSecret(input, password) {
      var result = '';
      password = password || Lampa.Storage.get('online_mod_secret_password', '') + '';

      if (input && password) {
        var hash = Lampa.Utils.hash(password);

        while (hash.length < input.length) {
          hash += hash;
        }

        var i = 0;

        while (i < input.length) {
          result += String.fromCharCode(input[i] ^ hash.charCodeAt(i));
          i++;
        }
      }

      return result;
    }

    function checkDebug() {
      var res = false;
      var origin = window.location.origin || '';
      decodeSecret([85, 77, 93, 87, 89, 71, 87, 30, 86, 89, 88, 88, 88, 81, 12, 70, 66, 80, 68, 89, 80, 24, 67, 68, 13, 92, 88, 90, 68, 88, 69, 92, 82, 24, 83, 90]).split(';').forEach(function (s) {
        res |= endsWith(origin, s);
      });
      return !res;
    }

    function isDebug() {
      return decodeSecret([83, 81, 83, 67, 83]) === 'debug' && checkDebug();
    }

    function isDebug2() {
      return decodeSecret([86, 81, 81, 71, 83]) === 'debug' || decodeSecret([92, 85, 91, 65, 84]) === 'debug';
    }

    function rezka2Mirror() {
      var url = Lampa.Storage.get('online_mod_rezka2_mirror', '') + '';
      if (!url) return 'https://kvk.zone';
      if (url.indexOf('://') == -1) url = 'https://' + url;
      if (url.charAt(url.length - 1) === '/') url = url.substring(0, url.length - 1);
      return url;
    }

    function kinobaseMirror() {
      var url = Lampa.Storage.get('online_mod_kinobase_mirror', '') + '';
      if (!url) return 'https://kinobase.org';
      if (url.indexOf('://') == -1) url = 'https://' + url;
      if (url.charAt(url.length - 1) === '/') url = url.substring(0, url.length - 1);
      return url;
    }

    function fanserialsHost() {
      return decodeSecret([89, 69, 64, 69, 67, 14, 26, 26, 67, 5, 31, 87, 85, 91, 67, 81, 71, 92, 81, 92, 31, 69, 66], atob('RnVja0Zhbg=='));
    }

    function fancdnHost() {
      return fanserialsHost();
    }

    function filmixToken() {
      var dev_id = 'waoqeEEMtP8skyG4'; // Ваш фиксированный user_dev_id
      var token = '5c8dc18ea0cd702ac1338ff9aa321d55'; // Ваш фиксированный user_dev_token
      return '?user_dev_id=' + dev_id + '&user_dev_name=Lampa&user_dev_token=' + token + '&user_dev_vendor=FXAPI&user_dev_os=11&user_dev_apk=2.0.1';
    }

    function filmixUserAgent() {
      return 'okhttp/3.10.0';
    }

    function baseUserAgent() {
      return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
    }

    function vcdnToken() {
      return atob("YXBpX3Rva2VuPQ==") + (isDebug() ? decodeSecret([81, 103, 70, 70, 92, 114, 65, 103, 1, 1, 78, 72, 124, 110, 83, 115, 126, 13, 114, 13, 102, 80, 83, 2, 112, 120, 127, 122, 2, 121, 98, 100]) : decodeSecret([0, 10, 1, 126, 69, 15, 11, 114, 119, 11, 77, 94, 89, 126, 82, 93, 110, 106, 72, 77, 101, 102, 2, 90, 107, 83, 88, 79, 113, 91, 3, 5], atob('RnVja0x1bWV4')));
    }

    function setMyIp(ip) {
      myIp = ip;
    }

    function getMyIp() {
      return myIp;
    }

    function proxy(name) {
      var ip = getMyIp() || '';
      var param_ip = Lampa.Storage.field('online_mod_proxy_find_ip') === true ? 'ip' + ip + '/' : '';
      var proxy1 = new Date().getHours() % 2 ? 'https://cors.nb557.workers.dev:8443/' : 'https://cors.fx666.workers.dev:8443/';
      var proxy2 = (window.location.protocol === 'https:' ? 'https://' : 'http://') + 'iqslgbok.deploy.cx/';
      var proxy3 = 'https://cors557.deno.dev/';
      var proxy_apn = '';
      var proxy_secret = '';
      var proxy_secret_ip = '';

      if (isDebug()) {
        proxy_apn = (window.location.protocol === 'https:' ? 'https://' : 'http://') + decodeSecret([92, 81, 68, 79, 64, 92, 78, 65, 23, 83, 81, 65, 90, 91, 78, 24, 83, 65, 24]);
        proxy_secret = decodeSecret([95, 64, 69, 70, 71, 13, 25, 31, 88, 71, 90, 28, 91, 86, 2, 3, 6, 23, 92, 91, 72, 83, 86, 25, 87, 64, 73, 24]);
        proxy_secret_ip = proxy_secret + (param_ip || 'ip/');
      }

      var proxy_other = Lampa.Storage.field('online_mod_proxy_other') === true;
      var proxy_other_url = proxy_other ? Lampa.Storage.field('online_mod_proxy_other_url') + '' : '';
      var user_proxy1 = (proxy_other_url || proxy1) + param_ip;
      var user_proxy2 = (proxy_other_url || proxy2) + param_ip;
      var user_proxy3 = (proxy_other_url || proxy3) + param_ip;
      if (name === 'filmix_site') return user_proxy2;
      if (name === 'filmix_abuse') return window.location.protocol === 'https:' ? 'https://cors.apn.monster/' : 'http://cors.cfhttp.top/';
      if (name === 'zetflix') return proxy_apn;
      if (name === 'allohacdn') return proxy_other ? proxy_secret : proxy_apn;
      if (name === 'cookie') return user_proxy1;
      if (name === 'cookie2') return user_proxy2;
      if (name === 'cookie3') return user_proxy3;

      if (Lampa.Storage.field('online_mod_proxy_' + name) === true) {
        if (name === 'iframe') return user_proxy2;
        if (name === 'lumex') return user_proxy2;
        if (name === 'rezka') return user_proxy2;
        if (name === 'rezka2') return user_proxy2;
        if (name === 'kinobase') return proxy_apn;
        if (name === 'collaps') return proxy_other ? proxy_secret : proxy_apn;
        if (name === 'cdnmovies') return user_proxy2;
        if (name === 'filmix') return proxy_secret_ip || user_proxy1;
        if (name === 'videodb') return user_proxy2;
        if (name === 'fancdn') return user_proxy3;
        if (name === 'fancdn2') return proxy_secret || user_proxy3;
        if (name === 'fanserials') return user_proxy2;
        if (name === 'videoseed') return user_proxy2;
        if (name === 'vibix') return user_proxy2;
        if (name === 'redheadsound') return user_proxy2;
        if (name === 'anilibria') return user_proxy2;
        if (name === 'anilibria2') return user_proxy2;
        if (name === 'animelib') return proxy_secret;
        if (name === 'kodik') return user_proxy2;
        if (name === 'kinopub') return user_proxy2;
      }

      return '';
    }

    function parseURL(link) {
      var url = {
        href: link,
        protocol: '',
        host: '',
        origin: '',
        pathname: '',
        search: '',
        hash: ''
      };
      var pos = link.indexOf('#');

      if (pos !== -1) {
        url.hash = link.substring(pos);
        link = link.substring(0, pos);
      }

      pos = link.indexOf('?');

      if (pos !== -1) {
        url.search = link.substring(pos);
        link = link.substring(0, pos);
      }

      pos = link.indexOf(':');
      var path_pos = link.indexOf('/');

      if (pos !== -1 && (path_pos === -1 || path_pos > pos)) {
        url.protocol = link.substring(0, pos + 1);
        link = link.substring(pos + 1);
      }

      if (startsWith(link, '//')) {
        pos = link.indexOf('/', 2);

        if (pos !== -1) {
          url.host = link.substring(2, pos);
          link = link.substring(pos);
        } else {
          url.host = link.substring(2);
          link = '/';
        }

        url.origin = url.protocol + '//' + url.host;
      }

      url.pathname = link;
      return url;
    }

    function fixLink(link, referrer) {
      if (link) {
        if (!referrer || link.indexOf('://') !== -1) return link;
        var url = parseURL(referrer);
        if (startsWith(link, '//')) return url.protocol + link;
        if (startsWith(link, '/')) return url.origin + link;
        if (startsWith(link, '?')) return url.origin + url.pathname + link;
        if (startsWith(link, '#')) return url.origin + url.pathname + url.search + link;
        var base = url.origin + url.pathname;
        base = base.substring(0, base.lastIndexOf('/') + 1);
        return base + link;
      }

      return link;
    }

    function fixLinkProtocol(link, prefer_http, replace_protocol) {
      if (link) {
        if (startsWith(link, '//')) {
          return (prefer_http ? 'http:' : 'https:') + link;
        } else if (prefer_http && replace_protocol) {
          return link.replace('https://', 'http://');
        } else if (!prefer_http && replace_protocol === 'full') {
          return link.replace('http://', 'https://');
        }
      }

      return link;
    }

    function proxyLink(link, proxy, proxy_enc, enc) {
      if (link && proxy) {
        if (proxy_enc == null) proxy_enc = '';
        if (enc == null) enc = 'enc';

        if (enc === 'enc') {
          var pos = link.indexOf('/');
          if (pos !== -1 && link.charAt(pos + 1) === '/') pos++;
          var part1 = pos !== -1 ? link.substring(0, pos + 1) : '';
          var part2 = pos !== -1 ? link.substring(pos + 1) : link;
          return proxy + 'enc/' + encodeURIComponent(btoa(proxy_enc + part1)) + '/' + part2;
        }

        if (enc === 'enc1') {
          var _pos = link.lastIndexOf('/');

          var _part = _pos !== -1 ? link.substring(0, _pos + 1) : '';

          var _part2 = _pos !== -1 ? link.substring(_pos + 1) : link;

          return proxy + 'enc1/' + encodeURIComponent(btoa(proxy_enc + _part)) + '/' + _part2;
        }

        if (enc === 'enc2') {
          var posEnd = link.lastIndexOf('?');
          var posStart = link.lastIndexOf('://');
          if (posEnd === -1 || posEnd <= posStart) posEnd = link.length;
          if (posStart === -1) posStart = -3;
          var name = link.substring(posStart + 3, posEnd);
          posStart = name.lastIndexOf('/');
          name = posStart !== -1 ? name.substring(posStart + 1) : '';
          return proxy + 'enc2/' + encodeURIComponent(btoa(proxy_enc + link)) + '/' + name;
        }

        return proxy + proxy_enc + link;
      }

      return link;
    }

    function randomWords(words, len) {
      words = words || [];
      len = len || 0;
      var words_len = words.length;
      if (!words_len) return '';
      var str = '';

      for (var i = 0; i < len; i++) {
        str += words[Math.floor(Math.random() * words_len)];
      }

      return str;
    }

    function randomChars(chars, len) {
      return randomWords((chars || '').split(''), len);
    }

    function randomHex(len) {
      return randomChars('0123456789abcdef', len);
    }

    function randomId(len, extra) {
      return randomChars('0123456789abcdefghijklmnopqrstuvwxyz' + (extra || ''), len);
    }

    function randomId2(len, extra) {
      return randomChars('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + (extra || ''), len);
    }

    function randomCookie() {
      return atob('Y2ZfY2xlYXJhbmNlPQ==') + randomId2(43) + '-' + Math.floor(Date.now() / 1000) + atob('LTEuMi4xLjEt') + randomId2(299, '_.');
    }

    function checkAndroidVersion(needVersion) {
      if (typeof AndroidJS !== 'undefined') {
        try {
          var current = AndroidJS.appVersion().split('-');
          var versionCode = current.pop();

          if (parseInt(versionCode, 10) >= needVersion) {
            return true;
          }
        } catch (e) {}
      }

      return false;
    }

    var Utils = {
      decodeSecret: decodeSecret,
      isDebug: isDebug,
      isDebug2: isDebug2,
      rezka2Mirror: rezka2Mirror,
      kinobaseMirror: kinobaseMirror,
      fanserialsHost: fanserialsHost,
      fancdnHost: fancdnHost,
      filmixToken: filmixToken,
      filmixUserAgent: filmixUserAgent,
      baseUserAgent: baseUserAgent,
      vcdnToken: vcdnToken,
      setMyIp: setMyIp,
      getMyIp: getMyIp,
      proxy: proxy,
      fixLink: fixLink,
      fixLinkProtocol: fixLinkProtocol,
      proxyLink: proxyLink,
      randomWords: randomWords,
      randomChars: randomChars,
      randomHex: randomHex,
      randomId: randomId,
      randomId2: randomId2,
      randomCookie: randomCookie,
      checkAndroidVersion: checkAndroidVersion
    };

    var network$1 = new Lampa.Reguest();
    var cache = {};
    var total_cnt = 0;
    var proxy_cnt = 0;
    var good_cnt = 0;
    var CACHE_SIZE = 100;
    var CACHE_TIME = 1000 * 60 * 60;

    function get(method, oncomplite, onerror) {
      var use_proxy = total_cnt >= 10 && good_cnt > total_cnt / 2;
      if (!use_proxy) total_cnt++;
      var kp_prox = 'https://cors.kp556.workers.dev:8443/';
      var url = 'https://kinopoiskapiunofficial.tech/';
      url += method;
      network$1.timeout(15000);
      network$1.silent((use_proxy ? kp_prox : '') + url, function (json) {
        oncomplite(json);
      }, function (a, c) {
        use_proxy = !use_proxy && (proxy_cnt < 10 || good_cnt > proxy_cnt / 2);

        if (use_proxy && (a.status == 429 || a.status == 0 && a.statusText !== 'timeout')) {
          proxy_cnt++;
          network$1.timeout(15000);
          network$1.silent(kp_prox + url, function (json) {
            good_cnt++;
            oncomplite(json);
          }, onerror, false, {
            headers: {
              'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
            }
          });
        } else onerror(a, c);
      }, false, {
        headers: {
          'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
        }
      });
    }

    function getComplite(method, oncomplite) {
      get(method, oncomplite, function () {
        oncomplite(null);
      });
    }

    function getCompliteIf(condition, method, oncomplite) {
      if (condition) getComplite(method, oncomplite);else {
        setTimeout(function () {
          oncomplite(null);
        }, 10);
      }
    }

    function getCache(key) {
      var res = cache[key];

      if (res) {
        var cache_timestamp = new Date().getTime() - CACHE_TIME;
        if (res.timestamp > cache_timestamp) return res.value;

        for (var ID in cache) {
          var node = cache[ID];
          if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
        }
      }

      return null;
    }

    function setCache(key, value) {
      var timestamp = new Date().getTime();
      var size = Object.keys(cache).length;

      if (size >= CACHE_SIZE) {
        var cache_timestamp = timestamp - CACHE_TIME;

        for (var ID in cache) {
          var node = cache[ID];
          if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
        }

        size = Object.keys(cache).length;

        if (size >= CACHE_SIZE) {
          var timestamps = [];

          for (var _ID in cache) {
            var _node = cache[_ID];
            timestamps.push(_node && _node.timestamp || 0);
          }

          timestamps.sort(function (a, b) {
            return a - b;
          });
          cache_timestamp = timestamps[Math.floor(timestamps.length / 2)];

          for (var _ID2 in cache) {
            var _node2 = cache[_ID2];
            if (!(_node2 && _node2.timestamp > cache_timestamp)) delete cache[_ID2];
          }
        }
      }

      cache[key] = {
        timestamp: timestamp,
        value: value
      };
    }

    function getFromCache(method, oncomplite, onerror) {
      var json = getCache(method);

      if (json) {
        setTimeout(function () {
          oncomplite(json, true);
        }, 10);
      } else get(method, oncomplite, onerror);
    }

    function clear() {
      network$1.clear();
    }

    var KP = {
      get: get,
      getComplite: getComplite,
      getCompliteIf: getCompliteIf,
      getCache: getCache,
      setCache: setCache,
      getFromCache: getFromCache,
      clear: clear
    };
        function lumex(component, _object) {
      var network = new Lampa.Reguest();
      var extract = {};
      var object = _object;
      extract.seasons = [];
      extract.season_num = [];
      extract.media = [];
      var select_title = '';
      var prefer_http = Lampa.Storage.field('online_mod_prefer_http') === true;
      var prefer_mp4 = Lampa.Storage.field('online_mod_prefer_mp4') === true;
      var prox = component.proxy('lumex');
      var host = atob('aHR0cHM6Ly9wLmx1bWV4LnNwYWNl');
      var ref = host + '/';
      var user_agent = Utils.baseUserAgent();
      var headers = Lampa.Platform.is('android') ? {
        'Origin': host,
        'Referer': ref,
        'User-Agent': user_agent,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      } : {};
      var headers2 = Lampa.Platform.is('android') ? {
        'Origin': host,
        'Referer': ref,
        'User-Agent': user_agent,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Cookie': '',
        'x-csrf-token': ''
      } : {};
      var prox_enc = '';

      if (prox) {
        prox_enc += 'param/Origin=' + encodeURIComponent(host) + '/';
        prox_enc += 'param/Referer=' + encodeURIComponent(ref) + '/';
        prox_enc += 'param/User-Agent=' + encodeURIComponent(user_agent) + '/';
        prox_enc += 'param/Sec-Fetch-Dest=empty/';
        prox_enc += 'param/Sec-Fetch-Mode=cors/';
        prox_enc += 'param/Sec-Fetch-Site=same-site/';
        prox_enc += 'enc/aXAyNjA2OjQ3MDA6MzAzMTo6NjgxNTo0NmQ5Lw%3D%3D/';
      }

      var prox_enc2 = prox_enc;
      var embed = atob('aHR0cHM6Ly9hcGkubHVtZXguc3BhY2Uv');
      var suffix = atob('Y2xpZW50SWQ9Q1dmS1hMYzFhaklkJmRvbWFpbj1tb3ZpZWxhYi5vbmUmdXJsPW1vdmllbGFiLm9uZQ==');
      var filter_items = {};
      var choice = {
        season: 0,
        voice: 0,
        voice_name: '',
        voice_id: 0
      };

      function lumex_search(api, callback, error) {
        var error_check = function error_check(a, c) {
          if (a.status == 404 || a.status == 0 && a.statusText !== 'timeout') {
            if (callback) callback('');
          } else if (error) error(network.errorDecode(a, c));
        };

        var returnHeaders = true;
        var prox_enc_cookie = prox_enc;

        if (prox) {
          prox_enc_cookie += 'cookie_plus/param/Cookie=/';
          returnHeaders = false;
        }

        var success_check = function success_check(json) {
          var cookie = '';

          if (json && json.headers && json.body) {
            var cookieHeaders = json.headers['set-cookie'] || null;

            if (cookieHeaders && cookieHeaders.forEach) {
              cookieHeaders.forEach(function (param) {
                var parts = param.split(';')[0].split('=');

                if (parts[0]) {
                  if (parts[1] === 'deleted') delete values[parts[0]];else values[parts[0]] = parts[1] || '';
                }
              });
              var cookies = [];

              for (var name in values) {
                cookies.push(name + '=' + values[name]);
              }

              cookie = cookies.join('; ');
            }

            json = typeof json.body === 'string' ? Lampa.Arrays.decodeJson(json.body, {}) : json.body;
          }

          callback(json, cookie);
        };

        var values = {};

        network.clear();
        network.timeout(20000);
        network["native"](component.proxyLink(api, prox, prox_enc_cookie), success_check, error_check, false, {
          headers: headers,
          returnHeaders: returnHeaders
        });
      }

      this.search = function (_object, kinopoisk_id, data) {
        object = _object;
        select_title = object.search || object.movie.title;
        var error = component.empty.bind(component);
        var found = false;
        var src = embed + 'content';

        if (data && data[0] && data[0].content_type && data[0].id) {
          found = true;
          src = Lampa.Utils.addUrlComponent(src, 'contentType=' + encodeURIComponent(data[0].content_type.replace(/_/g, '-')));
          src = Lampa.Utils.addUrlComponent(src, 'contentId=' + encodeURIComponent(data[0].id));
        } else {
          src = Lampa.Utils.addUrlComponent(src, 'contentType=short');
          src = Lampa.Utils.addUrlComponent(src, (+kinopoisk_id ? 'kpId=' : 'imdbId=') + encodeURIComponent(kinopoisk_id));
        }

        src = Lampa.Utils.addUrlComponent(src, suffix);
        lumex_search(src, function (json, cookie) {
          if (json) success(json, cookie);else if (!found && !object.clarification && object.movie.imdb_id && kinopoisk_id != object.movie.imdb_id) {
            var src2 = embed + 'content';
            src2 = Lampa.Utils.addUrlComponent(src2, 'contentType=short');
            src2 = Lampa.Utils.addUrlComponent(src2, 'imdbId=' + encodeURIComponent(object.movie.imdb_id));
            src2 = Lampa.Utils.addUrlComponent(src2, suffix);
            lumex_search(src2, function (json, cookie) {
              if (json) success(json, cookie);else component.emptyForQuery(select_title);
            }, error);
          } else component.emptyForQuery(select_title);
        }, error);
      };

      this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true);
      };

      this.reset = function () {
        component.reset();
        choice = {
          season: 0,
          voice: 0,
          voice_name: '',
          voice_id: 0
        };
        filter();
        append(filtred());
        component.saveChoice(choice);
      };

      this.filter = function (type, a, b) {
        choice[a.stype] = b.index;

        if (a.stype == 'voice') {
          choice.voice_name = filter_items.voice[b.index];
          choice.voice_id = filter_items.voice_info[b.index] && filter_items.voice_info[b.index].id;
        }

        component.reset();
        filter();
        append(filtred());
        component.saveChoice(choice);
      };

      this.destroy = function () {
        network.clear();
        extract = null;
      };

      function success(json, cookie) {
        component.loading(false);

        if (json && json.player && json.player.media && json.player.media.length) {
          prox_enc2 = prox_enc;

          if (prox) {
            prox_enc2 += 'param/Cookie=' + encodeURIComponent(cookie) + '/';
            prox_enc2 += 'param/x-csrf-token=' + encodeURIComponent(json.meta || '') + '/';
          }

          if (Lampa.Platform.is('android')) {
            headers2['Cookie'] = cookie;
            headers2['x-csrf-token'] = json.meta || '';
          }

          var seasons = [];
          var season_num = [];
          var season_count = 0;
          json.player.media.forEach(function (media) {
            if (media.episodes) {
              season_count++;

              if (media.episodes.length) {
                seasons.push(media);
                season_num.push(media.season_id != null ? media.season_id : season_count);
              }
            } else if (media.media && media.episode_id != null && !season_count) {
              season_count++;
              seasons.push({
                season_id: 1,
                season_name: 'Сезон 1',
                episodes: json.player.media
              });
              season_num.push(1);
            }
          });
          extract = {
            seasons: seasons,
            season_num: season_num,
            media: json.player.media
          };
          filter();
          append(filtred());
        } else component.emptyForQuery(select_title);
      }

      function filter() {
        filter_items = {
          season: extract.season_num.map(function (s) {
            return Lampa.Lang.translate('torrent_serial_season') + ' ' + s;
          }),
          season_num: extract.season_num,
          voice: [],
          voice_info: []
        };
        if (!filter_items.season[choice.season]) choice.season = 0;

        if (extract.season_num.length) {
          var season = extract.seasons[choice.season];

          if (season && season.episodes) {
            season.episodes.forEach(function (episode) {
              if (episode.media) {
                episode.media.forEach(function (voice) {
                  if (voice.translation_id != null && voice.translation_name != null) {
                    if (!filter_items.voice_info.some(function (v) {
                      return v.id == voice.translation_id;
                    })) {
                      filter_items.voice.push(voice.translation_name);
                      filter_items.voice_info.push({
                        id: voice.translation_id,
                        name: voice.translation_name
                      });
                    }
                  }
                });
              }
            });
          }
        }

        if (!filter_items.voice[choice.voice]) choice.voice = 0;

        if (choice.voice_name) {
          var inx = -1;

          if (choice.voice_id) {
            var voice = filter_items.voice_info.filter(function (v) {
              return v.id == choice.voice_id;
            })[0];
            if (voice) inx = filter_items.voice_info.indexOf(voice);
          }

          if (inx == -1) inx = filter_items.voice.indexOf(choice.voice_name);
          if (inx == -1) choice.voice = 0;else if (inx !== choice.voice) {
            choice.voice = inx;
          }
        }

        component.filter(filter_items, choice);
      }

      function filtred() {
        var filtred = [];

        if (filter_items.season_num.length) {
          var season = extract.seasons[choice.season];
          var season_num = extract.season_num[choice.season];
          var v = filter_items.voice_info[choice.voice];

          if (season && season.episodes && v) {
            var episode_count = 0;
            season.episodes.forEach(function (episode) {
              episode_count++;

              if (episode.media) {
                episode.media.forEach(function (voice) {
                  if (voice.translation_id == v.id) {
                    var episode_num = episode.episode_id != null ? episode.episode_id : episode_count;
                    filtred.push({
                      title: component.formatEpisodeTitle(season_num, episode_num),
                      quality: voice.max_quality ? voice.max_quality + 'p' : '360p ~ 1080p',
                      info: ' / ' + (voice.translation_name || v.name),
                      season: season_num,
                      episode: episode_count,
                      media: voice
                    });
                  }
                });
              }
            });
          }
        } else {
          extract.media.forEach(function (voice) {
            if (voice.translation_id != null && voice.translation_name != null) {
              filtred.push({
                title: voice.translation_name || select_title,
                quality: voice.max_quality ? voice.max_quality + 'p' : '360p ~ 1080p',
                info: '',
                media: voice
              });
            }
          });
        }

        return filtred;
      }

      function extractItems(str, url) {
        if (!str) return [];

        try {
          var items = component.parseM3U(str).map(function (item) {
            var link = item.link || '';
            if (prefer_mp4) link = link.replace(/(\.mp4):hls:manifest\.m3u8$/i, '$1');
            var quality = item.height;
            var alt_quality = link.match(/\b(\d\d\d+)\./);

            if (alt_quality) {
              var alt_height = parseInt(alt_quality[1]);
              if (alt_height > quality && alt_height <= 4320) quality = alt_height;
            }

            return {
              label: quality ? quality + 'p' : '360p ~ 1080p',
              quality: quality,
              file: component.proxyStream(component.fixLink(link, url), 'lumex')
            };
          });
          items.sort(function (a, b) {
            if (b.quality > a.quality) return 1;
            if (b.quality < a.quality) return -1;
            if (b.label > a.label) return 1;
            if (b.label < a.label) return -1;
            return 0;
          });
          return items;
        } catch (e) {}

        return [];
      }

      function parseStream(element, call, error, itemsExtractor, str, url) {
        var file = '';
        var quality = false;
        var items = itemsExtractor(str, url);

        if (items && items.length) {
          file = items[0].file;
          quality = {};
          items.forEach(function (item) {
            quality[item.label] = item.file;
          });
        }

        if (file) {
          element.stream = file;
          element.qualitys = quality;
          call(element);
        } else error();
      }

      function getStreamM3U(element, call, error, file) {
        file = file.replace(/\.mp4:hls:manifest/, '');
        var hls_file = file.replace(/\/\d\d\d+([^\/]*\.m3u8)$/, '/hls$1');
        network.clear();
        network.timeout(5000);
        network["native"](component.proxyStream(hls_file, 'lumex'), function (str) {
          parseStream(element, call, error, extractItems, str, hls_file);
        }, function (a, c) {
          if (file != hls_file) {
            network.clear();
            network.timeout(5000);
            network["native"](component.proxyStream(file, 'lumex'), function (str) {
              parseStream(element, call, error, extractItems, str, file);
            }, function (a, c) {
              error();
            }, false, {
              dataType: 'text'
            });
          } else error();
        }, false, {
          dataType: 'text'
        });
      }

      function parseSubs(tracks) {
        if (!(tracks && tracks.length)) return false;
        var subtitles = tracks.filter(function (t) {
          return t.kind === 'captions';
        }).map(function (item) {
          var links = item.src || '';
          var link = links.split(' or ').filter(function (link) {
            return link;
          })[0] || '';
          link = component.fixLinkProtocol(link, prefer_http);
          return {
            label: item.label,
            url: component.proxyStreamSubs(link, 'lumex')
          };
        }).filter(function (s) {
          return s.url;
        });
        return subtitles.length ? subtitles : false;
      }

      function getStream(element, call, error) {
        if (element.stream) return call(element);
        if (!element.media.playlist) error();
        var url = component.fixLink(element.media.playlist, embed);
        network.clear();
        network.timeout(10000);
        network["native"](component.proxyLink(url, prox, prox_enc2), function (json) {
          var url = component.fixLinkProtocol(json && json.url || '', prefer_http);

          if (url) {
            element.subtitles = parseSubs(element.media.tracks);

            if (endsWith(url, '.m3u8')) {
              getStreamM3U(element, call, error, url);
              return;
            }

            element.stream = component.proxyStream(url, 'lumex');
            element.qualitys = false;
            call(element);
          } else error();
        }, function (a, c) {
          error();
        }, {}, {
          headers: headers2
        });
      }

      function append(items) {
        component.reset();
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var last_episode = component.getLastEpisode(items);
        items.forEach(function (element) {
          if (element.season) {
            element.translate_episode_end = last_episode;
            element.translate_voice = filter_items.voice[choice.voice];
          }

          var hash = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online_mod', element);
          var hash_file = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title);
          element.timeline = view;
          item.append(Lampa.Timeline.render(view));

          if (Lampa.Timeline.details) {
            item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
          }

          if (viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
          item.on('hover:enter', function () {
            if (element.loading) return;
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
            element.loading = true;
            getStream(element, function (element) {
              element.loading = false;
              var first = {
                url: component.getDefaultQuality(element.qualitys, element.stream),
                quality: component.renameQualityMap(element.qualitys),
                subtitles: element.subtitles,
                timeline: element.timeline,
                title: element.season ? element.title : select_title + (element.title == select_title ? '' : ' / ' + element.title)
              };
              Lampa.Player.play(first);

              if (element.season && Lampa.Platform.version) {
                var playlist = [];
                items.forEach(function (elem) {
                  if (elem == element) {
                    playlist.push(first);
                  } else {
                    var cell = {
                      url: function url(call) {
                        getStream(elem, function (elem) {
                          cell.url = component.getDefaultQuality(elem.qualitys, elem.stream);
                          cell.quality = component.renameQualityMap(elem.qualitys);
                          cell.subtitles = elem.subtitles;
                          call();
                        }, function () {
                          cell.url = '';
                          call();
                        });
                      },
                      timeline: elem.timeline,
                      title: elem.title
                    };
                    playlist.push(cell);
                  }
                });
                Lampa.Player.playlist(playlist);
              } else {
                Lampa.Player.playlist([first]);
              }

              if (viewed.indexOf(hash_file) == -1) {
                viewed.push(hash_file);
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                Lampa.Storage.set('online_view', viewed);
              }
            }, function () {
              element.loading = false;
              Lampa.Noty.show(Lampa.Lang.translate('online_mod_nolink'));
            });
          });
          component.append(item);
          component.contextmenu({
            item: item,
            view: view,
            viewed: viewed,
            hash_file: hash_file,
            element: element,
            file: function file(call) {
              getStream(element, function (element) {
                call({
                  file: element.stream,
                  quality: element.qualitys
                });
              }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('online_mod_nolink'));
              });
            }
          });
        });
        component.start(true);
      }
    }

    function lumex2(component, _object) {
      var network = new Lampa.Reguest();
      var extract = {};
      var object = _object;
      extract.seasons = [];
      extract.season_num = [];
      extract.media = [];
      var select_title = '';
      Lampa.Storage.field('online_mod_prefer_http') === true;
      var embed = atob('aHR0cHM6Ly9hcGkubGFtcGEuc3RyZWFtL2x1bWV4Lw==');
      var api_suffix = '/' + encodeURIComponent(btoa(window.location.href));
      var filter_items = {};
      var choice = {
        season: 0,
        voice: 0,
        voice_name: '',
        voice_id: 0
      };

      function lumex_api(api, callback, error) {
        var error_check = function error_check(a, c) {
          if (a.status == 404 || a.status == 500 || a.status == 0 && a.statusText !== 'timeout') {
            if (callback) callback('');
          } else if (error) error(network.errorDecode(a, c));
        };

        var success_check = function success_check(json) {
          callback(json);
        };

        network.clear();
        network.timeout(20000);
        network["native"](api, success_check, error_check);
      }

      this.search = function (_object, kinopoisk_id, data) {
        object = _object;
        select_title = object.search || object.movie.title;
        var error = component.empty.bind(component);
        var found = false;
        var src = embed;

        if (data && data[0] && data[0].content_type && data[0].id) {
          found = true;
          src += 'findID/' + encodeURIComponent(data[0].id) + '/' + encodeURIComponent(data[0].content_type.replace(/_/g, '-'));
        } else {
          var imdb_id = (+kinopoisk_id ? !object.clarification && object.movie.imdb_id : kinopoisk_id) || 'null';
          var kp_id = +kinopoisk_id ? kinopoisk_id : 'null';
          src += 'searchId/' + encodeURIComponent(imdb_id) + '/' + encodeURIComponent(kp_id);
        }

        lumex_api(src + api_suffix, function (json) {
          if (found && json) success(json);else if (!found && json && json.content_type && json.id) {
            var src2 = embed + 'findID/' + encodeURIComponent(json.id) + '/' + encodeURIComponent(json.content_type.replace(/_/g, '-'));
            lumex_api(src2 + api_suffix, function (json) {
              if (json) success(json);else component.emptyForQuery(select_title);
            }, error);
          } else component.emptyForQuery(select_title);
        }, error);
      };

      this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true);
      };

      this.reset = function () {
        component.reset();
        choice = {
          season: 0,
          voice: 0,
          voice_name: '',
          voice_id: 0
        };
        filter();
        append(filtred());
        component.saveChoice(choice);
      };

      this.filter = function (type, a, b) {
        choice[a.stype] = b.index;

        if (a.stype == 'voice') {
          choice.voice_name = filter_items.voice[b.index];
          choice.voice_id = filter_items.voice_info[b.index] && filter_items.voice_info[b.index].id;
        }

        component.reset();
        filter();
        append(filtred());
        component.saveChoice(choice);
      };

      this.destroy = function () {
        network.clear();
        extract = null;
      };

      function success(json, cookie) {
        component.loading(false);

        if (json && json.media && json.media.length) {
          var seasons = [];
          var season_num = [];
          var season_count = 0;
          json.media.forEach(function (media) {
            if (media.episodes) {
              season_count++;

              if (media.episodes.length) {
                seasons.push(media);
                season_num.push(media.season_id != null ? media.season_id : season_count);
              }
            } else if (media.media && media.episode_id != null && !season_count) {
              season_count++;
              seasons.push({
                season_id: 1,
                season_name: 'Сезон 1',
                episodes: json.media
              });
              season_num.push(1);
            }
          });
          extract = {
            seasons: seasons,
            season_num: season_num,
            media: json.media,
            tag_url: json.tag_url || '',
            vast_msg: json.vast_msg || ''
          };
          filter();
          append(filtred());
        } else component.emptyForQuery(select_title);
      }

      function filter() {
        filter_items = {
          season: extract.season_num.map(function (s) {
            return Lampa.Lang.translate('torrent_serial_season') + ' ' + s;
          }),
          season_num: extract.season_num,
          voice: [],
          voice_info: []
        };
        if (!filter_items.season[choice.season]) choice.season = 0;

        if (extract.season_num.length) {
          var season = extract.seasons[choice.season];

          if (season && season.episodes) {
            season.episodes.forEach(function (episode) {
              if (episode.media) {
                episode.media.forEach(function (voice) {
                  if (voice.translation_id != null && voice.translation_name != null) {
                    if (!filter_items.voice_info.some(function (v) {
                      return v.id == voice.translation_id;
                    })) {
                      filter_items.voice.push(voice.translation_name);
                      filter_items.voice_info.push({
                        id: voice.translation_id,
                        name: voice.translation_name
                      });
                    }
                  }
                });
              }
            });
          }
        }

        if (!filter_items.voice[choice.voice]) choice.voice = 0;

        if (choice.voice_name) {
          var inx = -1;

          if (choice.voice_id) {
            var voice = filter_items.voice_info.filter(function (v) {
              return v.id == choice.voice_id;
            })[0];
            if (voice) inx = filter_items.voice_info.indexOf(voice);
          }

          if (inx == -1) inx = filter_items.voice.indexOf(choice.voice_name);
          if (inx == -1) choice.voice = 0;else if (inx !== choice.voice) {
            choice.voice = inx;
          }
        }

        component.filter(filter_items, choice);
      }

      function filtred() {
        var filtred = [];

        if (filter_items.season_num.length) {
          var season = extract.seasons[choice.season];
          var season_num = extract.season_num[choice.season];
          var v = filter_items.voice_info[choice.voice];

          if (season && season.episodes && v) {
            var episode_count = 0;
            season.episodes.forEach(function (episode) {
              episode_count++;

              if (episode.media) {
                episode.media.forEach(function (voice) {
                  if (voice.translation_id == v.id) {
                    var episode_num = episode.episode_id != null ? episode.episode_id : episode_count;
                    filtred.push({
                      title: component.formatEpisodeTitle(season_num, episode_num),
                      quality: voice.max_quality ? voice.max_quality + 'p' : '360p ~ 1080p',
                      info: ' / ' + (voice.translation_name || v.name),
                      season: season_num,
                      episode: episode_count,
                      media: voice
                    });
                  }
                });
              }
            });
          }
        } else {
          extract.media.forEach(function (voice) {
            if (voice.translation_id != null && voice.translation_name != null) {
              filtred.push({
                title: voice.translation_name || select_title,
                quality: voice.max_quality ? voice.max_quality + 'p' : '360p ~ 1080p',
                info: '',
                media: voice
              });
            }
          });
        }

        return filtred;
      }

      function getStream(element, call, error) {
        if (element.stream) return call(element);
        if (!element.media.playlist) error();
        component.checkMyIp(function () {
          var ip = Utils.getMyIp();

          if (!ip) {
            error();
            return;
          }

          var api = embed + 'videos/' + object.movie.id + '/' + encodeURIComponent(element.media.playlist) + api_suffix;
          api = Lampa.Utils.addUrlComponent(api, 'ip=' + encodeURIComponent(ip));
          api = Lampa.Utils.addUrlComponent(api, 'title=' + encodeURIComponent(object.movie.title));
          lumex_api(api, function (json) {
            if (json && json.url) {
              element.stream = json.url;
              element.qualitys = json.qualitys || false;
              call(element);
            } else error();
          }, error);
        });
      }

      function append(items) {
        component.reset();
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var last_episode = component.getLastEpisode(items);
        items.forEach(function (element) {
          if (element.season) {
            element.translate_episode_end = last_episode;
            element.translate_voice = filter_items.voice[choice.voice];
          }

          var hash = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online_mod', element);
          var hash_file = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title);
          element.timeline = view;
          item.append(Lampa.Timeline.render(view));

          if (Lampa.Timeline.details) {
            item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
          }

          if (viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
          item.on('hover:enter', function () {
            if (element.loading) return;
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
            element.loading = true;
            getStream(element, function (element) {
              element.loading = false;
              var first = {
                url: component.getDefaultQuality(element.qualitys, element.stream),
                quality: component.renameQualityMap(element.qualitys),
                subtitles: element.subtitles,
                vast_url: extract.tag_url,
                vast_msg: extract.vast_msg,
                timeline: element.timeline,
                title: element.season ? element.title : select_title + (element.title == select_title ? '' : ' / ' + element.title)
              };
              Lampa.Player.play(first);

              if (element.season && Lampa.Platform.version) {
                var playlist = [];
                items.forEach(function (elem) {
                  if (elem == element) {
                    playlist.push(first);
                  } else {
                    var cell = {
                      url: function url(call) {
                        getStream(elem, function (elem) {
                          cell.url = component.getDefaultQuality(elem.qualitys, elem.stream);
                          cell.quality = component.renameQualityMap(elem.qualitys);
                          cell.subtitles = elem.subtitles;
                          call();
                        }, function () {
                          cell.url = '';
                          call();
                        });
                      },
                      timeline: elem.timeline,
                      title: elem.title
                    };
                    playlist.push(cell);
                  }
                });
                Lampa.Player.playlist(playlist);
              } else {
                Lampa.Player.playlist([first]);
              }

              if (viewed.indexOf(hash_file) == -1) {
                viewed.push(hash_file);
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                Lampa.Storage.set('online_view', viewed);
              }
            }, function () {
              element.loading = false;
              Lampa.Noty.show(Lampa.Lang.translate('online_mod_nolink'));
            });
          });
          component.append(item);
          component.contextmenu({
            item: item,
            view: view,
            viewed: viewed,
            hash_file: hash_file,
            element: element,
            file: function file(call) {
              getStream(element, function (element) {
                call({
                  file: element.stream,
                  quality: element.qualitys
                });
              }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('online_mod_nolink'));
              });
            }
          });
        });
        component.start(true);
      }
    }

    var mod_version = '2.0';

    Lampa.Lang.add({
      online_mod_title: {
        ru: 'Онлайн',
        uk: 'Онлайн',
        be: 'Анлайн',
        en: 'Online',
        zh: '在线'
      },
      online_mod_title_full: {
        ru: 'Онлайн Мод',
        uk: 'Онлайн Мод',
        be: 'Анлайн Мод',
        en: 'Online Mod',
        zh: '在线模组'
      },
      online_mod_watch: {
        ru: 'Смотреть онлайн видео',
        uk: 'Дивитися онлайн відео',
        be: 'Глядзець анлайн відэа',
        en: 'Watch online video',
        zh: '观看在线视频'
      },
      online_mod_nolink: {
        ru: 'Не удалось получить ссылку',
        uk: 'Не вдалося отримати посилання',
        be: 'Не ўдалося атрымаць спасылку',
        en: 'Failed to get link',
        zh: '无法获取链接'
      },
      online_mod_proxy_balanser: {
        ru: 'Прокси балансер',
        uk: 'Проксі балансер',
        be: 'Проксі балансер',
        en: 'Proxy balancer',
        zh: '代理均衡器'
      },
      online_mod_skip_kp_search: {
        ru: 'Пропустить поиск по Кинопоиску',
        uk: 'Пропустити пошук по Кінопошуку',
        be: 'Прапусціць пошук па Кінопошуку',
        en: 'Skip Kinopoisk search',
        zh: '跳过Kinopoisk搜索'
      },
      online_mod_iframe_proxy: {
        ru: 'Проксировать iframe ссылки',
        uk: 'Проксірувати iframe посилання',
        be: 'Проксіраваць iframe спасылкі',
        en: 'Proxy iframe links',
        zh: '代理iframe链接'
      },
      online_mod_proxy_iframe: {
        ru: 'Прокси балансер iframe',
        uk: 'Проксі балансер iframe',
        be: 'Проксі балансер iframe',
        en: 'Proxy balancer iframe',
        zh: '代理均衡器iframe'
      },
      online_mod_prefer_http: {
        ru: 'Предпочитать HTTP ссылки',
        uk: 'Віддавати перевагу HTTP посиланням',
        be: 'Аддаваць перавагу HTTP спасылкам',
        en: 'Prefer HTTP links',
        zh: '偏好HTTP链接'
      },
      online_mod_prefer_mp4: {
        ru: 'Предпочитать MP4 ссылки',
        uk: 'Віддавати перевагу MP4 посиланням',
        be: 'Аддаваць перавагу MP4 спасылкам',
        en: 'Prefer MP4 links',
        zh: '偏好MP4链接'
      },
      online_mod_collaps_lampa_player: {
        ru: 'Collaps в плеере Lampa',
        uk: 'Collaps у плеєрі Lampa',
        be: 'Collaps у плэеры Lampa',
        en: 'Collaps in Lampa player',
        zh: 'Lampa播放器中的Collaps'
      },
      online_mod_full_episode_title: {
        ru: 'Полное название эпизодов',
        uk: 'Повна назва епізодів',
        be: 'Поўная назва эпізодаў',
        en: 'Full episode titles',
        zh: '完整剧集标题'
      },
      online_mod_save_last_balanser: {
        ru: 'Сохранять последний балансер',
        uk: 'Зберігати останній балансер',
        be: 'Захоўваць апошні балансер',
        en: 'Save last balancer',
        zh: '保存最后一个均衡器'
      },
      online_mod_clear_last_balanser: {
        ru: 'Очистить последний балансер',
        uk: 'Очистити останній балансер',
        be: 'Ачысціць апошні балансер',
        en: 'Clear last balancer',
        zh: '清除最后一个均衡器'
      },
      online_mod_kinobase_mirror: {
        ru: 'Зеркало Kinobase',
        uk: 'Дзеркало Kinobase',
        be: 'Люстэрка Kinobase',
        en: 'Kinobase mirror',
        zh: 'Kinobase镜像'
      },
      online_mod_kinobase_cookie: {
        ru: 'Cookie Kinobase',
        uk: 'Cookie Kinobase',
        be: 'Cookie Kinobase',
        en: 'Kinobase Cookie',
        zh: 'Kinobase Cookie'
      },
      online_mod_rezka2_mirror: {
        ru: 'Зеркало HDrezka',
        uk: 'Дзеркало HDrezka',
        be: 'Люстэрка HDrezka',
        en: 'HDrezka mirror',
        zh: 'HDrezka镜像'
      },
      online_mod_proxy_rezka2_mirror: {
        ru: 'Прокси зеркала HDrezka',
        uk: 'Проксі дзеркала HDrezka',
        be: 'Проксі люстэрка HDrezka',
        en: 'HDrezka mirror proxy',
        zh: 'HDrezka镜像代理'
      },
      online_mod_rezka2_name: {
        ru: 'Логин HDrezka',
        uk: 'Логін HDrezka',
        be: 'Лагін HDrezka',
        en: 'HDrezka login',
        zh: 'HDrezka登录'
      },
      online_mod_rezka2_password: {
        ru: 'Пароль HDrezka',
        uk: 'Пароль HDrezka',
        be: 'Пароль HDrezka',
        en: 'HDrezka password',
        zh: 'HDrezka密码'
      },
      online_mod_rezka2_login: {
        ru: 'Войти в HDrezka',
        uk: 'Увійти в HDrezka',
        be: 'Увайсці ў HDrezka',
        en: 'Log in to HDrezka',
        zh: '登录HDrezka'
      },
      online_mod_rezka2_logout: {
        ru: 'Выйти из HDrezka',
        uk: 'Вийти з HDrezka',
        be: 'Выйсці з HDrezka',
        en: 'Log out of HDrezka',
        zh: '退出HDrezka'
      },
      online_mod_rezka2_cookie: {
        ru: 'Cookie HDrezka',
        uk: 'Cookie HDrezka',
        be: 'Cookie HDrezka',
        en: 'HDrezka Cookie',
        zh: 'HDrezka Cookie'
      },
      online_mod_rezka2_fill_cookie: {
        ru: 'Заполнить Cookie HDrezka',
        uk: 'Заповнити Cookie HDrezka',
        be: 'Запоўніць Cookie HDrezka',
        en: 'Fill HDrezka Cookie',
        zh: '填充HDrezka Cookie'
      },
      online_mod_rezka2_fix_stream: {
        ru: 'Исправлять ссылки HDrezka',
        uk: 'Виправляти посилання HDrezka',
        be: 'Выправляць спасылкі HDrezka',
        en: 'Fix HDrezka links',
        zh: '修复HDrezka链接'
      },
      online_mod_fancdn_name: {
        ru: 'Логин FanCDN',
        uk: 'Логін FanCDN',
        be: 'Лагін FanCDN',
        en: 'FanCDN login',
        zh: 'FanCDN登录'
      },
      online_mod_fancdn_password: {
        ru: 'Пароль FanCDN',
        uk: 'Пароль FanCDN',
        be: 'Пароль FanCDN',
        en: 'FanCDN password',
        zh: 'FanCDN密码'
      },
      online_mod_fancdn_cookie: {
        ru: 'Cookie FanCDN',
        uk: 'Cookie FanCDN',
        be: 'Cookie FanCDN',
        en: 'FanCDN Cookie',
        zh: 'FanCDN Cookie'
      },
      online_mod_fancdn_fill_cookie: {
        ru: 'Заполнить Cookie FanCDN',
        uk: 'Заповнити Cookie FanCDN',
        be: 'Запоўніць Cookie FanCDN',
        en: 'Fill FanCDN Cookie',
        zh: '填充FanCDN Cookie'
      },
      online_mod_fancdn_token: {
        ru: 'Токен FanCDN',
        uk: 'Токен FanCDN',
        be: 'Токен FanCDN',
        en: 'FanCDN Token',
        zh: 'FanCDN令牌'
      },
      online_mod_use_stream_proxy: {
        ru: 'Использовать прокси для потоков',
        uk: 'Використовувати проксі для потоків',
        be: 'Выкарыстоўваць проксі для патокаў',
        en: 'Use proxy for streams',
        zh: '为流使用代理'
      },
      online_mod_rezka2_prx_ukr: {
        ru: 'Прокси HDrezka для Украины',
        uk: 'Проксі HDrezka для України',
        be: 'Проксі HDrezka для Украіны',
        en: 'HDrezka proxy for Ukraine',
        zh: '乌克兰的HDrezka代理'
      },
      online_mod_proxy_find_ip: {
        ru: 'Добавлять IP к прокси',
        uk: 'Додавати IP до проксі',
        be: 'Дадаваць IP да проксі',
        en: 'Add IP to proxy',
        zh: '将IP添加到代理'
      },
      online_mod_proxy_other: {
        ru: 'Использовать другой прокси',
        uk: 'Використовувати інший проксі',
        be: 'Выкарыстоўваць іншы проксі',
        en: 'Use another proxy',
        zh: '使用另一个代理'
      },
      online_mod_proxy_other_url: {
        ru: 'URL другого прокси',
        uk: 'URL іншого проксі',
        be: 'URL іншага проксі',
        en: 'URL of another proxy',
        zh: '另一个代理的URL'
      },
      online_mod_secret_password: {
        ru: 'Секретный пароль',
        uk: 'Секретний пароль',
        be: 'Сакрэтны пароль',
        en: 'Secret password',
        zh: '秘密密码'
      },
      online_mod_av1_support: {
        ru: 'Поддержка AV1',
        uk: 'Підтримка AV1',
        be: 'Падтрымка AV1',
        en: 'AV1 support',
        zh: 'AV1支持'
      },
      online_mod_unsupported_mirror: {
        ru: 'Неподдерживаемое зеркало',
        uk: 'Непідтримуваний дзеркало',
        be: 'Непадтрымліваемы люстэрка',
        en: 'Unsupported mirror',
        zh: '不支持的镜像'
      },
      online_mod_filmix_param_placeholder: {
        ru: 'Например: xxx',
        uk: 'Наприклад: xxx',
        be: 'Напрыклад: xxx',
        en: 'For example: xxx',
        zh: '例如：xxx'
      },
      online_mod_filmix_param_add_title: {
        ru: 'Токен Filmix',
        uk: 'Токен Filmix',
        be: 'Токен Filmix',
        en: 'Filmix Token',
        zh: 'Filmix令牌'
      },
      online_mod_filmix_param_add_desr: {
        ru: 'Добавьте токен Filmix для доступа к вашему аккаунту',
        uk: 'Додайте токен Filmix для доступу до вашого облікового запису',
        be: 'Дадайце токен Filmix для доступу да вашага акаўнта',
        en: 'Add Filmix token to access your account',
        zh: '添加Filmix令牌以访问您的账户'
      },
      online_mod_filmix_param_add_device: {
        ru: 'Добавить устройство на Filmix',
        uk: 'Додати пристрій на Filmix',
        be: 'Дадаць прыладу на Filmix',
        en: 'Add Device to Filmix',
        zh: '将设备添加到Filmix'
      },
      online_mod_filmix_modal_text: {
        ru: 'Введите его на странице https://filmix.quest/consoles в вашем авторизованном аккаунте!',
        uk: 'Введіть його на сторінці https://filmix.quest/consoles у вашому авторизованому обліковому записі!',
        be: 'Увядзіце яго на старонцы https://filmix.quest/consoles у вашым аўтарызаваным акаўнце!',
        en: 'Enter it at https://filmix.quest/consoles in your authorized account!',
        zh: '在您的授权账户中的https://filmix.quest/consoles输入！'
      },
      online_mod_filmix_modal_wait: {
        ru: 'Ожидаем код',
        uk: 'Очікуємо код',
        be: 'Чакаем код',
        en: 'Waiting for the code',
        zh: '等待代码'
      },
      online_mod_filmix_copy_secuses: {
        ru: 'Код скопирован в буфер обмена',
        uk: 'Код скопійовано в буфер обміну',
        be: 'Код скапіяваны ў буфер абмену',
        en: 'Code copied to clipboard',
        zh: '代码复制到剪贴板'
      },
      online_mod_filmix_copy_fail: {
        ru: 'Ошибка при копировании',
        uk: 'Помилка при копіюванні',
        be: 'Памылка пры капіяванні',
        en: 'Copy error',
        zh: '复制错误'
      },
      online_mod_filmix_nodevice: {
        ru: 'Устройство не авторизовано',
        uk: 'Пристрій не авторизований',
        be: 'Прылада не аўтарызавана',
        en: 'Device not authorized',
        zh: '设备未授权'
      },
      online_mod_filmix_status: {
        ru: 'Статус',
        uk: 'Статус',
        be: 'Статус',
        en: 'Status',
        zh: '状态'
      },
      online_mod_voice_subscribe: {
        ru: 'Подписаться на перевод',
        uk: 'Підписатися на переклад',
        be: 'Падпісацца на пераклад',
        en: 'Subscribe to translation',
        zh: '订阅翻译'
      },
      online_mod_voice_success: {
        ru: 'Вы успешно подписались',
        uk: 'Ви успішно підписалися',
        be: 'Вы паспяхова падпісаліся',
        en: 'You have successfully subscribed',
        zh: '您已成功订阅'
      },
      online_mod_voice_error: {
        ru: 'Возникла ошибка',
        uk: 'Виникла помилка',
        be: 'Узнікла памылка',
        en: 'An error has occurred',
        zh: '发生了一个错误'
      }
    });

    var network = new Lampa.Reguest();
    var online_loading = false;

    function resetTemplates() {
      Lampa.Template.add('online_mod', "<div class=\"online selector\">\n        <div class=\"online__body\">\n            <div style=\"position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em\">\n                <svg style=\"height: 2.4em; width:  2.4em;\" viewBox=\"0 0 128 128\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"64\" cy=\"64\" r=\"56\" stroke=\"white\" stroke-width=\"16\"/>\n                    <path d=\"M90.5 64.3827L50 87.7654L50 41L90.5 64.3827Z\" fill=\"white\"/>\n                </svg>\n            </div>\n            <div class=\"online__title\" style=\"padding-left: 2.1em;\">{title}</div>\n            <div class=\"online__quality\" style=\"padding-left: 3.4em;\">{quality}{info}</div>\n        </div>\n    </div>");
      Lampa.Template.add('online_mod_folder', "<div class=\"online selector\">\n        <div class=\"online__body\">\n            <div style=\"position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em\">\n                <svg style=\"height: 2.4em; width:  2.4em;\" viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"/>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"/>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"/>\n                </svg>\n            </div>\n            <div class=\"online__title\" style=\"padding-left: 2.1em;\">{title}</div>\n            <div class=\"online__quality\" style=\"padding-left: 3.4em;\">{quality}{info}</div>\n        </div>\n    </div>");
    }

    function loadOnline(object) {
      var onComplite = function onComplite() {
        online_loading = false;
        resetTemplates();
        Lampa.Component.add('online_mod', component);
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('online_mod_title_full'),
          component: 'online_mod',
          search: object.title,
          search_one: object.title,
          search_two: object.original_title,
          movie: object,
          page: 1
        });
      };

      Utils.setMyIp('');

      if (Lampa.Storage.field('online_mod_proxy_find_ip') === true) {
        if (online_loading) return;
        online_loading = true;
        network.clear();
        network.timeout(10000);
        network.silent('https://api.ipify.org/?format=json', function (json) {
          if (json.ip) Utils.setMyIp(json.ip);
          onComplite();
        }, function (a, c) {
          onComplite();
        });
      } else onComplite();
    }

    function component(object) {
      this.proxy = function(name) { return Utils.proxy(name); };
      this.proxyLink = function(link, proxy, proxy_enc, enc) { return Utils.proxyLink(link, proxy, proxy_enc, enc); };
      this.proxyStream = function(link, name) { return Utils.proxyLink(link, Utils.proxy(name), '', ''); };
      this.proxyStreamSubs = function(link, name) { return Utils.proxyLink(link, Utils.proxy(name), '', ''); };
      this.fixLink = function(link, referrer) { return Utils.fixLink(link, referrer); };
      this.fixLinkProtocol = function(link, prefer_http, replace_protocol) { return Utils.fixLinkProtocol(link, prefer_http, replace_protocol); };
      this.checkMyIp = function(callback) { if (Utils.getMyIp()) callback(); else loadOnline(object); };
      this.empty = function(params) { return Lampa.Activity.push({ url: '', title: 'Ошибка', component: 'error', error: params || {}, page: 1 }); };
      this.emptyForQuery = function(query) { return this.empty({ text: Lampa.Lang.translate('online_mod_nolink'), query: query }); };
      this.loading = function(status) { /* Реализация зависит от Lampa */ };
      this.reset = function() { /* Реализация зависит от Lampa */ };
      this.append = function(item) { /* Реализация зависит от Lampa */ };
      this.contextmenu = function(params) { /* Реализация зависит от Lampa */ };
      this.start = function(first) { /* Реализация зависит от Lampa */ };
      this.formatEpisodeTitle = function(season, episode) { return 'S' + season + ' / E' + episode; };
            this.getLastEpisode = function(items) {
        var last = 0;
        items.forEach(function(e) {
          if (e.episode > last) last = e.episode;
        });
        return last;
      };

      this.getDefaultQuality = function(qualitys, stream) {
        if (!qualitys) return stream;
        var keys = Object.keys(qualitys);
        var prefer = Lampa.Storage.get('video_quality_default', '1080');
        var index = keys.indexOf(prefer);
        if (index == -1) index = keys.length - 1;
        return qualitys[keys[index]];
      };

      this.renameQualityMap = function(qualitys) {
        if (!qualitys) return false;
        var map = {};
        for (var q in qualitys) {
          map[q.replace('p', '')] = qualitys[q];
        }
        return map;
      };

      this.parseM3U = function(str) {
        var items = [];
        try {
          var lines = str.split('\n');
          var info = '';
          lines.forEach(function(line) {
            line = line.trim();
            if (startsWith(line, '#EXTINF:')) {
              info = line;
            } else if (line && !startsWith(line, '#')) {
              var height = info.match(/resolution=(\d+)/i);
              items.push({
                link: line,
                height: height ? parseInt(height[1]) : 0
              });
              info = '';
            }
          });
        } catch (e) {}
        return items;
      };

      this.saveChoice = function(choice) {
        Lampa.Storage.set('online_mod_choice_' + object.movie.id, choice);
      };

      var sources = {
        lumex: lumex,
        lumex2: lumex2
      };

      this.create = function() {
        this.loading(true);
        var saved = Lampa.Storage.get('online_mod_choice_' + object.movie.id, '{}');
        var source_name = Lampa.Storage.get('online_mod_source', 'lumex');
        var source = sources[source_name] || sources.lumex;
        var online = new source(this, object);
        if (saved.season || saved.voice) online.extendChoice(saved);
        var kp_id = object.movie.kinopoisk_id || object.movie.id;
        var imdb_id = object.movie.imdb_id;

        if (Lampa.Storage.field('online_mod_skip_kp_search') === true || !kp_id) {
          online.search(object, kp_id || imdb_id);
        } else {
          KP.getComplite('/api/v2.2/films/' + kp_id, function(json) {
            if (json && json.data && json.data.imdbId) imdb_id = json.data.imdbId;
            online.search(object, kp_id, json && json.data && json.data.type === 'TV_SERIES' ? [{
              content_type: 'tv_series',
              id: kp_id
            }] : null);
          });
        }

        return this;
      };

      this.destroy = function() {
        if (this.online) this.online.destroy();
        this.online = null;
      };
    }

    resetTemplates();

    Lampa.Component.add('online_mod', component);

    var button_added = false;

    function addButton() {
      if (button_added || !Lampa.Activity.active().activity || Lampa.Activity.active().activity.component !== 'full') return;
      var object = Lampa.Activity.active().activity.object;
      if (!object.movie || !object.card) return;

      button_added = true;

      var menu_item = $('<li class="menu__item selector" data-action="online_mod"><div class="menu__ico menu__ico_online"></div><div class="menu__text">' + Lampa.Lang.translate('online_mod_watch') + '</div></li>');
      menu_item.on('hover:enter', function() {
        loadOnline(object.movie);
      });

      $('.menu .menu__list').eq(0).append(menu_item);
    }

    Lampa.Listener.follow('app', function(e) {
      if (e.type == 'ready') {
        setTimeout(addButton, 1000);
      }
      if (e.type == 'activity' && e.name == 'full') {
        button_added = false;
        setTimeout(addButton, 1000);
      }
    });

    Lampa.SettingsApi.addComponent({
      component: 'online_mod_settings',
      name: 'online_mod',
      title: Lampa.Lang.translate('online_mod_title_full') + ' v' + mod_version
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'select',
      name: 'online_mod_source',
      title: 'Источник',
      values: {
        lumex: 'Lumex',
        lumex2: 'Lumex 2'
      },
      default: 'lumex'
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_proxy_balanser',
      title: Lampa.Lang.translate('online_mod_proxy_balanser'),
      default: true
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_skip_kp_search',
      title: Lampa.Lang.translate('online_mod_skip_kp_search'),
      default: false
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_iframe_proxy',
      title: Lampa.Lang.translate('online_mod_iframe_proxy'),
      default: false
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_prefer_http',
      title: Lampa.Lang.translate('online_mod_prefer_http'),
      default: false
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_prefer_mp4',
      title: Lampa.Lang.translate('online_mod_prefer_mp4'),
      default: true
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_proxy_find_ip',
      title: Lampa.Lang.translate('online_mod_proxy_find_ip'),
      default: false
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'trigger',
      name: 'online_mod_proxy_other',
      title: Lampa.Lang.translate('online_mod_proxy_other'),
      default: false
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'input',
      name: 'online_mod_proxy_other_url',
      title: Lampa.Lang.translate('online_mod_proxy_other_url'),
      default: ''
    });

    Lampa.SettingsApi.addParam({
      component: 'online_mod_settings',
      type: 'input',
      name: 'online_mod_secret_password',
      title: Lampa.Lang.translate('online_mod_secret_password'),
      default: ''
    });

    Lampa.Utils.Tricks = Utils;
    window.LampaOnlineMod = {
      version: mod_version,
      Utils: Utils,
      KP: KP
    };
})();
