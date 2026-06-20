(function () {
  'use strict';

  var RD_TOKEN_KEY = 'rd_api_token';
  var RD_LINK_KEY = 'rd_last_magnet';
  var RD_PROXY_KEY = 'rd_proxy_url';
  var RD_BUTTON_CLASS = 'button--realdebrid';
  var runtimeState = {
    lastLink: '',
    torrentChoice: null,
    torrentList: [],
    settingsComponent: 'realdebrid',
    settingsCreated: false
  };

  function addLang() {
    Lampa.Lang.add({
      rd_title: {
        ru: 'Real-Debrid',
        en: 'Real-Debrid',
        uk: 'Real-Debrid'
      },
      rd_token: {
        ru: 'Real-Debrid API token',
        en: 'Real-Debrid API token',
        uk: 'Real-Debrid API token'
      },
      rd_token_descr: {
        ru: 'Персональный токен. MVP без backend, может не работать из-за CORS на части устройств.',
        en: 'Personal token. Backend-free MVP, may fail on some devices because of CORS.',
        uk: 'Персональний токен. MVP без backend, може не працювати через CORS на частині пристроїв.'
      },
      rd_last_link: {
        ru: 'Резервный magnet или torrent URL',
        en: 'Fallback magnet or torrent URL',
        uk: 'Резервний magnet або torrent URL'
      },
      rd_last_link_descr: {
        ru: 'Резервное поле. Обычно плагин сам подхватывает последний magnet или torrent URL из Lampa.',
        en: 'Fallback field. The plugin usually captures the latest magnet or torrent URL from Lampa automatically.',
        uk: 'Резервне поле. Зазвичай плагін сам підхоплює останній magnet або torrent URL з Lampa.'
      },
      rd_use: {
        ru: 'Запустить через Real-Debrid',
        en: 'Open with Real-Debrid',
        uk: 'Запустити через Real-Debrid'
      },
      rd_need_token: {
        ru: 'Сначала укажи Real-Debrid API token в настройках',
        en: 'Set your Real-Debrid API token in settings first',
        uk: 'Спочатку вкажи Real-Debrid API token у налаштуваннях'
      },
      rd_need_link: {
        ru: 'Не удалось автоматически найти magnet или torrent URL. Сначала открой список торрентов или укажи ссылку вручную в настройках.',
        en: 'Could not find a magnet or torrent URL automatically. Open a torrent list first or set the link manually in settings.',
        uk: 'Не вдалося автоматично знайти magnet або torrent URL. Спочатку відкрий список торрентів або вкажи посилання вручну в налаштуваннях.'
      },
      rd_loading: {
        ru: 'Real-Debrid: подготовка ссылки',
        en: 'Real-Debrid: preparing link',
        uk: 'Real-Debrid: підготовка посилання'
      },
      rd_empty_files: {
        ru: 'Real-Debrid не вернул подходящих видеофайлов',
        en: 'Real-Debrid returned no playable video files',
        uk: 'Real-Debrid не повернув придатних відеофайлів'
      },
      rd_cors_fail: {
        ru: 'Запрос к Real-Debrid не удался. Скорее всего CORS блокирует прямой вызов на этом устройстве.',
        en: 'Request to Real-Debrid failed. Direct calls are likely blocked by CORS on this device.',
        uk: 'Запит до Real-Debrid не вдався. Ймовірно, прямий виклик блокується CORS на цьому пристрої.'
      },
      rd_pick_file: {
        ru: 'Выбери файл',
        en: 'Choose file',
        uk: 'Вибери файл'
      },
      rd_no_player: {
        ru: 'Не удалось запустить плеер Lampa',
        en: 'Unable to start Lampa player',
        uk: 'Не вдалося запустити плеєр Lampa'
      },
      rd_test_token: {
        ru: 'Проверить token',
        en: 'Test token',
        uk: 'Перевірити token'
      },
      rd_test_ok: {
        ru: 'Real-Debrid token принят',
        en: 'Real-Debrid token accepted',
        uk: 'Real-Debrid token прийнято'
      },
      rd_test_fail: {
        ru: 'Real-Debrid token не прошёл проверку',
        en: 'Real-Debrid token validation failed',
        uk: 'Real-Debrid token не пройшов перевірку'
      },
      rd_account: {
        ru: 'Аккаунт Real-Debrid',
        en: 'Real-Debrid account',
        uk: 'Акаунт Real-Debrid'
      },
      rd_web_cors: {
        ru: 'В web-версии Lampa прямые запросы к Real-Debrid блокируются CORS. Используй Android-приложение Lampa или proxy.',
        en: 'Direct requests to Real-Debrid are blocked by CORS in Lampa web mode. Use Android app or a proxy.',
        uk: 'У web-версії Lampa прямі запити до Real-Debrid блокує CORS. Використовуй Android-застосунок Lampa або proxy.'
      },
      rd_proxy: {
        ru: 'Real-Debrid proxy URL',
        en: 'Real-Debrid proxy URL',
        uk: 'Real-Debrid proxy URL'
      },
      rd_proxy_descr: {
        ru: 'Для web-версии Lampa укажи URL своего Cloudflare Worker, например https://example.workers.dev/rd',
        en: 'For Lampa web mode, set your Cloudflare Worker URL, for example https://example.workers.dev/rd',
        uk: 'Для web-версії Lampa вкажи URL свого Cloudflare Worker, наприклад https://example.workers.dev/rd'
      }
    });
  }

  function getToken() {
    return (Lampa.Storage.get(RD_TOKEN_KEY, '') || '').trim();
  }

  function getProxyUrl() {
    return (Lampa.Storage.get(RD_PROXY_KEY, '') || '').trim().replace(/\/$/, '');
  }

  function getLink() {
    return runtimeState.lastLink || (Lampa.Storage.get(RD_LINK_KEY, '') || '').trim();
  }

  function setLink(link) {
    if (!link || typeof link !== 'string') return;
    runtimeState.lastLink = link.trim();
    Lampa.Storage.set(RD_LINK_KEY, runtimeState.lastLink);
  }

  function setTorrentChoice(element, items, params) {
    runtimeState.torrentChoice = {
      element: element || null,
      items: items || [],
      params: params || {}
    };
    runtimeState.torrentList = items || [];

    var directLink = extractLink(element);
    if (directLink) setLink(directLink);
  }

  function notify(key) {
    Lampa.Noty.show(Lampa.Lang.translate(key));
  }

  function startLoading(title) {
    if (!Lampa.Loading || typeof Lampa.Loading.start !== 'function') return;
    Lampa.Loading.start();
    if (title && typeof Lampa.Loading.setTitle === 'function') Lampa.Loading.setTitle(title);
  }

  function isAndroidNative() {
    return typeof Lampa !== 'undefined' && Lampa.Platform && typeof Lampa.Platform.is === 'function' && Lampa.Platform.is('android') && typeof Android !== 'undefined' && Android && typeof Android.httpReq === 'function';
  }

  function isWebRuntime() {
    return !isAndroidNative();
  }

  function hasProxy() {
    return !!getProxyUrl();
  }

  function extractLink(value) {
    if (!value) return '';

    if (typeof value === 'string') {
      var match = value.match(/magnet:\?[^\s"'<>]+/i);
      if (match && match[0]) return match[0];

      var trimmed = value.trim();
      if (/\.torrent(?:\?|$)/i.test(trimmed) || /^https?:\/\//i.test(trimmed) && /torrent/i.test(trimmed)) return trimmed;
      return '';
    }

    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        var fromArray = extractLink(value[i]);
        if (fromArray) return fromArray;
      }
      return '';
    }

    if (typeof value === 'object') {
      if (typeof value.MagnetUri === 'string' && value.MagnetUri) return value.MagnetUri;
      if (typeof value.Link === 'string' && value.Link) return value.Link;
      if (typeof value.link === 'string' && value.link) return value.link;
      if (typeof value.magnet === 'string' && value.magnet) return value.magnet;
      if (typeof value.magnetUri === 'string' && value.magnetUri) return value.magnetUri;
      if (typeof value.url === 'string') {
        var directUrl = extractLink(value.url);
        if (directUrl) return directUrl;
      }

      var keys = Object.keys(value);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var fromObject = extractLink(value[key]);
        if (fromObject) return fromObject;
      }
    }

    return '';
  }

  function captureLink(value) {
    var link = extractLink(value);
    if (link) setLink(link);
    return link;
  }

  function initNetworkCapture() {
    if (window.realdebrid_network_capture_ready) return;
    window.realdebrid_network_capture_ready = true;

    if (window.fetch) {
      var originalFetch = window.fetch;
      window.fetch = function () {
        try {
          for (var i = 0; i < arguments.length; i++) {
            captureLink(arguments[i]);
          }
        } catch (e) {
          console.warn('Real-Debrid fetch capture failed', e);
        }

        return originalFetch.apply(this, arguments).then(function (response) {
          try {
            if (response && response.url) captureLink(response.url);
          } catch (e) {
            console.warn('Real-Debrid fetch response capture failed', e);
          }
          return response;
        });
      };
    }

    if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
      var originalOpen = window.XMLHttpRequest.prototype.open;
      var originalSend = window.XMLHttpRequest.prototype.send;

      window.XMLHttpRequest.prototype.open = function (method, url) {
        try {
          captureLink(url);
        } catch (e) {
          console.warn('Real-Debrid xhr open capture failed', e);
        }
        return originalOpen.apply(this, arguments);
      };

      window.XMLHttpRequest.prototype.send = function (body) {
        try {
          captureLink(body);
        } catch (e) {
          console.warn('Real-Debrid xhr send capture failed', e);
        }
        return originalSend.apply(this, arguments);
      };
    }
  }

  function initTorrentCapture() {
    Lampa.Listener.follow('torrent_file', function (e) {
      if (!e || !e.type) return;

      if (e.type === 'list_open') {
        runtimeState.torrentList = e.items || [];
        if (e.items && e.items.length === 1) setTorrentChoice(e.items[0], e.items, e.params);
        return;
      }

      if (e.type === 'onfocus' || e.type === 'onenter' || e.type === 'onlong') {
        setTorrentChoice(e.element, e.items, e.params);
      }
    });
  }

  function request(path, options) {
    var token = getToken();
    var requestOptions = Object.assign({ method: 'GET' }, options || {});
    requestOptions.headers = Object.assign({
      Authorization: 'Bearer ' + token
    }, requestOptions.headers || {});

    if (isAndroidNative()) {
      return new Promise(function (resolve, reject) {
        Android.httpReq({
          url: 'https://api.real-debrid.com/rest/1.0' + path,
          method: requestOptions.method,
          headers: requestOptions.headers,
          data: requestOptions.body || '',
          dataType: 'json'
        }, {
          success: function (response) {
            resolve(response || {});
          },
          error: function (response) {
            var text = response && (response.error || response.responseText || response.message) || 'HTTP error';
            reject(new Error(text));
          }
        });
      });
    }

    if (hasProxy()) {
      return fetch(getProxyUrl() + path, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: requestOptions.body
      }).then(function (response) {
        if (!response.ok) {
          return response.text().then(function (text) {
            throw new Error(text || ('HTTP ' + response.status));
          });
        }

        return response.status === 204 ? {} : response.json();
      });
    }

    return Promise.reject(new Error('WEB_CORS_BLOCKED'));
  }

  function normalizeFilename(name) {
    return (name || '').toLowerCase();
  }

  function isVideoFile(name) {
    return /\.(mkv|mp4|avi|mov|wmv|m4v|ts|m2ts|webm)$/i.test(name || '');
  }

  function sortFiles(files) {
    return files.sort(function (a, b) {
      var aScore = isVideoFile(a.path) ? 1 : 0;
      var bScore = isVideoFile(b.path) ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return normalizeFilename(a.path).localeCompare(normalizeFilename(b.path));
    });
  }

  function mapFiles(info) {
    return sortFiles((info.files || []).map(function (file) {
      return {
        id: file.id,
        path: file.path || '',
        bytes: file.bytes || 0,
        selected: file.selected === 1 || file.selected === '1'
      };
    })).filter(function (file) {
      return file.path;
    });
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var size = bytes;
    var i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return size.toFixed(size >= 10 || i === 0 ? 0 : 1) + ' ' + units[i];
  }

  function chooseTorrentLink() {
    var current = runtimeState.torrentChoice;
    var direct = extractLink(current && current.element);
    if (direct) return Promise.resolve(direct);

    var items = (current && current.items || runtimeState.torrentList || []).filter(function (item) {
      return extractLink(item);
    });

    if (!items.length) return Promise.resolve(getLink());
    if (items.length === 1) {
      var oneLink = extractLink(items[0]);
      if (oneLink) setLink(oneLink);
      return Promise.resolve(oneLink);
    }

    return new Promise(function (resolve) {
      Lampa.Select.show({
        title: Lampa.Lang.translate('rd_use'),
        items: items.map(function (item, index) {
          return {
            title: item.title || item.path_human || item.path || ('Torrent ' + (index + 1)),
            subtitle: item.tracker || item.size || '',
            item: item
          };
        }),
        onSelect: function (selected) {
          setTorrentChoice(selected.item, items, current ? current.params : {});
          var chosenLink = extractLink(selected.item);
          if (chosenLink) setLink(chosenLink);
          resolve(chosenLink);
        },
        onBack: function () {
          Lampa.Controller.toggle('content');
          resolve('');
        }
      });
    });
  }

  function chooseFile(files) {
    return new Promise(function (resolve) {
      Lampa.Select.show({
        title: Lampa.Lang.translate('rd_pick_file'),
        items: files.map(function (file) {
          return {
            title: file.path.split('/').pop() || file.path,
            subtitle: formatSize(file.bytes),
            file: file
          };
        }),
        onSelect: function (item) {
          resolve(item.file);
        },
        onBack: function () {
          Lampa.Controller.toggle('content');
          resolve(null);
        }
      });
    });
  }

  function openStream(url, title) {
    if (Lampa.Player && typeof Lampa.Player.play === 'function') {
      Lampa.Player.play({
        url: url,
        title: title || 'Real-Debrid'
      });
      return true;
    }

    if (Lampa.Utils && typeof Lampa.Utils.openLink === 'function') {
      Lampa.Utils.openLink(url);
      return true;
    }

    return false;
  }

  function addTorrent(link) {
    var body;
    var headers = {};

    if (/^magnet:/i.test(link)) {
      body = 'magnet=' + encodeURIComponent(link);
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return request('/torrents/addMagnet', {
        method: 'POST',
        headers: headers,
        body: body
      });
    }

    body = 'host=' + encodeURIComponent(link.split('/')[2] || '') + '&split=50';
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    return request('/torrents/addTorrent', {
      method: 'PUT',
      headers: headers,
      body: body
    });
  }

  function prepareAndPlay() {
    var token = getToken();

    if (!token) {
      notify('rd_need_token');
      return;
    }

    if (isWebRuntime() && !hasProxy()) {
      notify('rd_web_cors');
      return;
    }

    chooseTorrentLink().then(function (link) {
      if (!link) {
        notify('rd_need_link');
        return null;
      }

      setLink(link);
      startLoading(Lampa.Lang.translate('rd_loading'));

      return addTorrent(link).then(function (added) {
        return request('/torrents/info/' + added.id).then(function (info) {
          return { added: added, info: info };
        });
      }).then(function (result) {
        var files = mapFiles(result.info).filter(function (file) {
          return isVideoFile(file.path);
        });

        if (!files.length) throw new Error('NO_VIDEO_FILES');

        return chooseFile(files).then(function (chosen) {
          if (!chosen) return null;

          return request('/torrents/selectFiles/' + result.added.id, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'files=' + encodeURIComponent(String(chosen.id))
          }).then(function () {
            return request('/torrents/info/' + result.added.id).then(function (updated) {
              var links = updated.links || [];
              if (!links.length) throw new Error('NO_LINKS');
              return request('/unrestrict/link', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'link=' + encodeURIComponent(links[0])
              }).then(function (stream) {
                var ok = openStream(stream.download || stream.link, chosen.path.split('/').pop());
                if (!ok) throw new Error('NO_PLAYER');
              });
            });
          });
        });
      }).then(function () {
        Lampa.Loading.stop();
      }).catch(function (error) {
        Lampa.Loading.stop();
        console.error('Real-Debrid plugin error', error);

        if (error && error.message === 'NO_VIDEO_FILES') notify('rd_empty_files');
        else if (error && error.message === 'NO_PLAYER') notify('rd_no_player');
        else notify('rd_cors_fail');
      });
    });
  }

  function formatPremium(user) {
    if (!user || !user.type) return 'unknown';
    var status = user.type;
    if (typeof user.premium === 'number' && user.premium > 0) status += ' (' + Math.floor(user.premium / 86400) + 'd)';
    return status;
  }

  function testToken() {
    var token = getToken();

    if (!token) {
      notify('rd_need_token');
      return;
    }

    if (isWebRuntime() && !hasProxy()) {
      notify('rd_web_cors');
      return;
    }

    startLoading('Real-Debrid');

    request('/user').then(function (user) {
      Lampa.Loading.stop();
      Lampa.Noty.show((user.username || 'unknown') + ' | ' + formatPremium(user));
    }).catch(function (error) {
      Lampa.Loading.stop();
      console.error('Real-Debrid token test error', error);
      notify('rd_test_fail');
    });
  }

  function addSettings() {
    if (runtimeState.settingsCreated) return;
    runtimeState.settingsCreated = true;

    Lampa.SettingsApi.addComponent({
      component: runtimeState.settingsComponent,
      name: Lampa.Lang.translate('rd_title'),
      icon: '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M96 128C96 92.6538 124.654 64 160 64H352C387.346 64 416 92.6538 416 128V384C416 419.346 387.346 448 352 448H160C124.654 448 96 419.346 96 384V128Z" fill="white" fill-opacity="0.15"/><path d="M160 128H352V192H160V128Z" fill="white"/><path d="M160 224H288V288H160V224Z" fill="white" fill-opacity="0.85"/><path d="M160 320H256V384H160V320Z" fill="white" fill-opacity="0.7"/></svg>'
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: {
        name: RD_TOKEN_KEY,
        type: 'input',
        value: '',
        default: ''
      },
      field: {
        name: Lampa.Lang.translate('rd_token'),
        description: Lampa.Lang.translate('rd_token_descr')
      },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: {
        name: RD_PROXY_KEY,
        type: 'input',
        value: '',
        default: ''
      },
      field: {
        name: Lampa.Lang.translate('rd_proxy'),
        description: Lampa.Lang.translate('rd_proxy_descr')
      },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: {
        name: RD_LINK_KEY,
        type: 'input',
        value: '',
        default: ''
      },
      field: {
        name: Lampa.Lang.translate('rd_last_link'),
        description: Lampa.Lang.translate('rd_last_link_descr')
      },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: {
        name: 'rd_test_token',
        type: 'trigger',
        default: false
      },
      field: {
        name: Lampa.Lang.translate('rd_test_token'),
        description: 'GET /user'
      },
      onChange: testToken
    });

    Lampa.Params.select(RD_TOKEN_KEY, '', '');
    Lampa.Params.select(RD_LINK_KEY, '', '');
    Lampa.Params.select(RD_PROXY_KEY, '', '');
    Lampa.Settings.main().update();
  }

  function ensureTorrentButton() {
    var body = $('.torrent-files');
    if (!body.length) return;

    var existing = body.parent().find('.rd-torrent-action');
    if (existing.length) return;

    var button = $('<div class="simple-button selector rd-torrent-action" style="margin:1em 0 0 0;display:inline-flex;">' + Lampa.Lang.translate('rd_use') + '</div>');
    button.on('hover:enter', prepareAndPlay);
    body.before(button);
  }

  function bindTorrentScreenButton() {
    Lampa.Listener.follow('torrent_file', function (e) {
      if (!e || !e.type) return;

      if (e.type === 'list_open') {
        setTimeout(ensureTorrentButton, 0);
      }

      if (e.type === 'onfocus' || e.type === 'onenter') {
        setTimeout(ensureTorrentButton, 0);
      }

      if (e.type === 'list_close') {
        $('.rd-torrent-action').remove();
      }
    });
  }

  function init() {
    addLang();
    initTorrentCapture();
    initNetworkCapture();
    addSettings();
    bindTorrentScreenButton();
  }

  function startPlugin() {
    window.plugin_realdebrid_ready = true;
    if (window.appready) init();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') init();
      });
    }
  }

  if (!window.plugin_realdebrid_ready) startPlugin();
})();
