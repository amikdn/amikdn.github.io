(function () {
  'use strict';

  var RD_TOKEN_KEY = 'rd_api_token';
  var RD_LINK_KEY = 'rd_last_magnet';
  var RD_PROXY_KEY = 'rd_proxy_url';
  var RD_AUTO_KEY = 'rd_auto_intercept';
  var RD_API_BASE = 'https://api.real-debrid.com/rest/1.0';
  var RD_BUTTON_CLASS = 'rd-torrent-action';

  var runtimeState = {
    lastLink: '',
    torrentChoice: null,
    torrentList: [],
    settingsComponent: 'realdebrid',
    settingsCreated: false,
    interceptNextPlay: false,
    rdLaunching: false
  };

  function addLang() {
    Lampa.Lang.add({
      rd_title: { ru: 'Real-Debrid', en: 'Real-Debrid', uk: 'Real-Debrid' },
      rd_token: { ru: 'Real-Debrid API token', en: 'Real-Debrid API token', uk: 'Real-Debrid API token' },
      rd_token_descr: {
        ru: 'Персональный токen из real-debrid.com/apitoken. На Android-приложении Lampa работает напрямую. В web-версии нужен proxy (см. поле ниже).',
        en: 'Personal token from real-debrid.com/apitoken. Works directly in the Lampa Android app. Web version needs a proxy (see field below).',
        uk: 'Персональний токен з real-debrid.com/apitoken. В Android-застосунку Lampa працює напряму. Web-версії потрібен proxy (див. поле нижче).'
      },
      rd_last_link: { ru: 'Резервный magnet или torrent URL', en: 'Fallback magnet or torrent URL', uk: 'Резервний magnet або torrent URL' },
      rd_last_link_descr: {
        ru: 'Резервное поле. Обычно плагин сам подхватывает выбранный magnet из списка торрентов.',
        en: 'Fallback field. The plugin usually captures the selected magnet from the torrent list automatically.',
        uk: 'Резервне поле. Зазвичай плагін сам підхоплює вибраний magnet зі списку торентів.'
      },
      rd_use: { ru: 'Запустить через Real-Debrid', en: 'Open with Real-Debrid', uk: 'Запустити через Real-Debrid' },
      rd_need_token: { ru: 'Сначала укажи Real-Debrid API token в настройках', en: 'Set your Real-Debrid API token in settings first', uk: 'Спочатку вкажи Real-Debrid API token у налаштуваннях' },
      rd_need_link: {
        ru: 'Не удалось найти magnet или torrent URL. Открой список торрентов и наведись на нужную раздачу.',
        en: 'Could not find a magnet or torrent URL. Open the torrent list and focus the release you want.',
        uk: 'Не вдалося знайти magnet або torrent URL. Відкрий список торентів і наведись на потрібну роздачу.'
      },
      rd_loading: { ru: 'Real-Debrid: подготовка ссылки', en: 'Real-Debrid: preparing link', uk: 'Real-Debrid: підготовка посилання' },
      rd_adding: { ru: 'Real-Debrid: добавляю раздачу', en: 'Real-Debrid: adding torrent', uk: 'Real-Debrid: додаю роздачу' },
      rd_caching: { ru: 'Real-Debrid кеширует раздачу', en: 'Real-Debrid is caching the torrent', uk: 'Real-Debrid кешує роздачу' },
      rd_not_cached: {
        ru: 'Раздача ещё не в кеше Real-Debrid и качается на их серверах. Попробуй запустить позже.',
        en: 'This torrent is not cached on Real-Debrid yet and is downloading on their servers. Try again later.',
        uk: 'Роздача ще не в кеші Real-Debrid і завантажується на їх серверах. Спробуй пізніше.'
      },
      rd_empty_files: { ru: 'Real-Debrid не вернул подходящих видеофайлов', en: 'Real-Debrid returned no playable video files', uk: 'Real-Debrid не повернув придатних відеофайлів' },
      rd_dead: { ru: 'Real-Debrid: раздача мёртвая или повреждена', en: 'Real-Debrid: torrent is dead or broken', uk: 'Real-Debrid: роздача мертва або пошкоджена' },
      rd_cors_fail: {
        ru: 'Запрос к Real-Debrid не удался. В web-версии это обычно CORS — укажи proxy URL в настройках.',
        en: 'Request to Real-Debrid failed. In web mode this is usually CORS — set a proxy URL in settings.',
        uk: 'Запит до Real-Debrid не вдався. У web-версії це зазвичай CORS — вкажи proxy URL у налаштуваннях.'
      },
      rd_pick_file: { ru: 'Выбери файл', en: 'Choose file', uk: 'Вибери файл' },
      rd_no_player: { ru: 'Не удалось запустить плеер Lampa', en: 'Unable to start Lampa player', uk: 'Не вдалося запустити плеєр Lampa' },
      rd_test_token: { ru: 'Проверить token', en: 'Test token', uk: 'Перевірити token' },
      rd_test_fail: { ru: 'Real-Debrid token не прошёл проверку', en: 'Real-Debrid token validation failed', uk: 'Real-Debrid token не пройшов перевірку' },
      rd_web_cors: {
        ru: 'В web-версии Lampa прямые запросы к Real-Debrid блокирует CORS. Укажи proxy URL в настройках или используй Android-приложение Lampa.',
        en: 'Direct requests to Real-Debrid are blocked by CORS in Lampa web mode. Set a proxy URL in settings or use the Lampa Android app.',
        uk: 'У web-версії Lampa прямі запити до Real-Debrid блокує CORS. Вкажи proxy URL у налаштуваннях або використовуй Android-застосунок Lampa.'
      },
      rd_proxy: { ru: 'Real-Debrid proxy URL', en: 'Real-Debrid proxy URL', uk: 'Real-Debrid proxy URL' },
      rd_proxy_descr: {
        ru: 'Только для web-версии. URL твоего Cloudflare Worker, например https://example.workers.dev/rd (без слеша в конце).',
        en: 'Web mode only. URL of your Cloudflare Worker, e.g. https://example.workers.dev/rd (no trailing slash).',
        uk: 'Тільки для web-версії. URL твого Cloudflare Worker, напр. https://example.workers.dev/rd (без слеша в кінці).'
      },
      rd_auto: { ru: 'Автозапуск торрентов через Real-Debrid', en: 'Auto-launch torrents via Real-Debrid', uk: 'Автозапуск торентів через Real-Debrid' },
      rd_auto_descr: {
        ru: 'Если включено и не настроен TorrServer — открытие раздачи сразу идёт через Real-Debrid. Если выключено — используй кнопку «Запустить через Real-Debrid».',
        en: 'When on and TorrServer is not configured, opening a torrent goes straight through Real-Debrid. When off, use the "Open with Real-Debrid" button.',
        uk: 'Якщо увімкнено і TorrServer не налаштований — відкриття роздачі одразу йде через Real-Debrid. Якщо вимкнено — використовуй кнопку «Запустити через Real-Debrid».'
      }
    });
  }

  // ---- storage helpers ----------------------------------------------------

  function getToken() {
    return (Lampa.Storage.get(RD_TOKEN_KEY, '') || '').trim();
  }

  function getProxyUrl() {
    return (Lampa.Storage.get(RD_PROXY_KEY, '') || '').trim().replace(/\/+$/, '');
  }

  function getLink() {
    return runtimeState.lastLink || (Lampa.Storage.get(RD_LINK_KEY, '') || '').trim();
  }

  function setLink(link) {
    if (!link || typeof link !== 'string') return;
    runtimeState.lastLink = link.trim();
    Lampa.Storage.set(RD_LINK_KEY, runtimeState.lastLink);
  }

  // ---- runtime detection --------------------------------------------------

  function isAndroidNative() {
    return typeof Lampa !== 'undefined' && Lampa.Platform && typeof Lampa.Platform.is === 'function' &&
      Lampa.Platform.is('android') && typeof Android !== 'undefined' && Android && typeof Android.httpReq === 'function';
  }

  function isWebRuntime() {
    return !isAndroidNative();
  }

  function hasProxy() {
    return !!getProxyUrl();
  }

  // Real-Debrid is reachable when: native Android (no CORS), or a proxy is configured.
  function canReachRealDebrid() {
    return isAndroidNative() || hasProxy();
  }

  function hasTorrserver() {
    if (!Lampa || !Lampa.Storage || typeof Lampa.Storage.field !== 'function') return false;
    var mode = Lampa.Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url';
    var primary = (Lampa.Storage.field(mode) || '').trim();
    var secondary = (Lampa.Storage.field(mode === 'torrserver_url' ? 'torrserver_url_two' : 'torrserver_url') || '').trim();
    return !!(primary || secondary);
  }

  function autoEnabled() {
    return Lampa.Storage.get(RD_AUTO_KEY, false) === true;
  }

  function shouldUseRealDebridAuto() {
    return autoEnabled() && !!getToken() && !hasTorrserver() && canReachRealDebrid();
  }

  // ---- link extraction / capture -----------------------------------------

  function extractLink(value) {
    if (!value) return '';

    if (typeof value === 'string') {
      var match = value.match(/magnet:\?[^\s"'<>]+/i);
      if (match && match[0]) return match[0];
      var trimmed = value.trim();
      if (/\.torrent(?:\?|$)/i.test(trimmed) || (/^https?:\/\//i.test(trimmed) && /torrent/i.test(trimmed))) return trimmed;
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
        var fromObject = extractLink(value[keys[j]]);
        if (fromObject) return fromObject;
      }
    }
    return '';
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
    setLoadingTitle(title);
  }

  function setLoadingTitle(title) {
    if (title && Lampa.Loading && typeof Lampa.Loading.setTitle === 'function') Lampa.Loading.setTitle(title);
  }

  function stopLoading() {
    if (Lampa.Loading && typeof Lampa.Loading.stop === 'function') Lampa.Loading.stop();
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // ---- HTTP layer (CORS-aware) --------------------------------------------
  // Android app -> native Android.httpReq (no CORS).
  // Web -> Cloudflare Worker proxy if configured, otherwise hard CORS block.

  function request(path, options) {
    var token = getToken();
    var opts = Object.assign({ method: 'GET' }, options || {});
    opts.headers = Object.assign({ Authorization: 'Bearer ' + token }, opts.headers || {});

    if (isAndroidNative()) {
      return new Promise(function (resolve, reject) {
        Android.httpReq({
          url: RD_API_BASE + path,
          method: opts.method,
          headers: opts.headers,
          data: opts.body || '',
          dataType: 'json'
        }, {
          success: function (response) {
            resolve(parseMaybeJson(response));
          },
          error: function (response) {
            var text = (response && (response.error || response.responseText || response.message)) || 'HTTP error';
            reject(new Error(text));
          }
        });
      });
    }

    if (hasProxy()) {
      return fetch(getProxyUrl() + path, {
        method: opts.method,
        headers: opts.headers,
        body: opts.body
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

  function parseMaybeJson(response) {
    if (response == null) return {};
    if (typeof response === 'string') {
      try { return JSON.parse(response); } catch (e) { return {}; }
    }
    if (typeof response === 'object' && typeof response.responseText === 'string') {
      try { return JSON.parse(response.responseText); } catch (e) { return response; }
    }
    return response;
  }

  // ---- file helpers -------------------------------------------------------

  function normalizeFilename(name) { return (name || '').toLowerCase(); }

  function isVideoFile(name) {
    return /\.(mkv|mp4|avi|mov|wmv|m4v|ts|m2ts|webm)$/i.test(name || '');
  }

  function sortFiles(files) {
    return files.sort(function (a, b) {
      var aScore = isVideoFile(a.path) ? 1 : 0;
      var bScore = isVideoFile(b.path) ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      if (b.bytes !== a.bytes) return b.bytes - a.bytes;
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
    })).filter(function (file) { return file.path; });
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var size = bytes, i = 0;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return size.toFixed(size >= 10 || i === 0 ? 0 : 1) + ' ' + units[i];
  }

  // ---- selection dialogs --------------------------------------------------

  function chooseTorrentLink() {
    var current = runtimeState.torrentChoice;
    var direct = extractLink(current && current.element);
    if (direct) { setLink(direct); return Promise.resolve(direct); }

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
        onBack: function () { Lampa.Controller.toggle('content'); resolve(''); }
      });
    });
  }

  function chooseFile(files) {
    if (files.length === 1) return Promise.resolve(files[0]);
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
        onSelect: function (item) { resolve(item.file); },
        onBack: function () { Lampa.Controller.toggle('content'); resolve(null); }
      });
    });
  }

  // ---- player -------------------------------------------------------------

  function openStream(url, title) {
    if (!url) return false;
    if (Lampa.Player && typeof Lampa.Player.play === 'function') {
      Lampa.Player.play({ url: url, title: title || 'Real-Debrid', timeline: null });
      if (typeof Lampa.Player.playlist === 'function') {
        Lampa.Player.playlist([{ url: url, title: title || 'Real-Debrid' }]);
      }
      return true;
    }
    if (Lampa.Utils && typeof Lampa.Utils.openLink === 'function') {
      Lampa.Utils.openLink(url);
      return true;
    }
    return false;
  }

  // ---- Real-Debrid API flow ----------------------------------------------

  function addTorrent(link) {
    var headers = {};
    if (/^magnet:/i.test(link)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return request('/torrents/addMagnet', {
        method: 'POST',
        headers: headers,
        body: 'magnet=' + encodeURIComponent(link)
      });
    }
    // .torrent URL: fetch the file, then upload its bytes to addTorrent.
    return fetchTorrentFile(link).then(function (buffer) {
      return request('/torrents/addTorrent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-bittorrent' },
        body: buffer
      });
    });
  }

  function fetchTorrentFile(url) {
    // On web with proxy we still hit CORS on the tracker; best effort via fetch.
    return fetch(url, { method: 'GET' }).then(function (r) {
      if (!r.ok) throw new Error('TORRENT_FETCH_FAILED');
      return r.arrayBuffer();
    });
  }

  // Poll torrent info until it reaches one of the wanted statuses (or fails).
  function waitTorrent(id, wantStatuses, opts) {
    opts = opts || {};
    var maxAttempts = opts.maxAttempts || 30;
    var interval = opts.interval || 1500;
    var titleKey = opts.titleKey;
    var failStatuses = ['magnet_error', 'error', 'virus', 'dead'];

    function attempt(n) {
      return request('/torrents/info/' + id).then(function (info) {
        var status = info && info.status;
        if (failStatuses.indexOf(status) !== -1) {
          throw new Error('TORRENT_DEAD');
        }
        if (wantStatuses.indexOf(status) !== -1) return info;
        if (n >= maxAttempts) {
          var err = new Error('TIMEOUT');
          err.info = info;
          throw err;
        }
        if (titleKey) {
          var pct = typeof info.progress === 'number' ? ' ' + info.progress + '%' : '';
          setLoadingTitle(Lampa.Lang.translate(titleKey) + pct);
        }
        return delay(interval).then(function () { return attempt(n + 1); });
      });
    }
    return attempt(1);
  }

  function prepareAndPlay(autoMode) {
    var token = getToken();

    if (!token) {
      if (!autoMode) notify('rd_need_token');
      return;
    }
    if (!canReachRealDebrid()) {
      if (!autoMode) notify('rd_web_cors');
      return;
    }

    runtimeState.rdLaunching = true;

    chooseTorrentLink().then(function (link) {
      if (!link) {
        if (!autoMode) notify('rd_need_link');
        runtimeState.rdLaunching = false;
        return null;
      }

      setLink(link);
      startLoading(Lampa.Lang.translate('rd_adding'));

      var torrentId;

      return addTorrent(link).then(function (added) {
        torrentId = added && added.id;
        if (!torrentId) throw new Error('NO_TORRENT_ID');
        // Wait until RD parsed the magnet and exposes the file list.
        return waitTorrent(torrentId, ['waiting_files_selection', 'downloaded'], {
          maxAttempts: 20, interval: 1500, titleKey: 'rd_adding'
        });
      }).then(function (info) {
        var files = mapFiles(info).filter(function (file) { return isVideoFile(file.path); });
        if (!files.length) throw new Error('NO_VIDEO_FILES');

        return chooseFile(files).then(function (chosen) {
          if (!chosen) { runtimeState.rdLaunching = false; return null; }

          setLoadingTitle(Lampa.Lang.translate('rd_loading'));

          // If already downloaded with links we can skip re-selecting.
          return request('/torrents/selectFiles/' + torrentId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'files=' + encodeURIComponent(String(chosen.id))
          }).then(function () {
            // Wait until the selected file is cached and links are available.
            return waitTorrent(torrentId, ['downloaded'], {
              maxAttempts: 40, interval: 2000, titleKey: 'rd_caching'
            });
          }).then(function (updated) {
            var links = updated.links || [];
            if (!links.length) throw new Error('NO_LINKS');
            return request('/unrestrict/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'link=' + encodeURIComponent(links[0])
            }).then(function (stream) {
              var ok = openStream(stream.download || stream.link, chosen.path.split('/').pop());
              if (!ok) throw new Error('NO_PLAYER');
            });
          });
        });
      }).then(function () {
        stopLoading();
      }).catch(function (error) {
        stopLoading();
        console.error('Real-Debrid plugin error', error);
        var msg = error && error.message;
        if (msg === 'NO_VIDEO_FILES') notify('rd_empty_files');
        else if (msg === 'NO_PLAYER') notify('rd_no_player');
        else if (msg === 'TORRENT_DEAD') notify('rd_dead');
        else if (msg === 'TIMEOUT' || msg === 'NO_LINKS') notify('rd_not_cached');
        else if (msg === 'WEB_CORS_BLOCKED') notify('rd_web_cors');
        else notify('rd_cors_fail');
      }).finally(function () {
        runtimeState.rdLaunching = false;
      });
    }).catch(function (e) {
      console.error('Real-Debrid plugin error', e);
      stopLoading();
      runtimeState.rdLaunching = false;
    });
  }

  // ---- token test ---------------------------------------------------------

  function formatPremium(user) {
    if (!user || !user.type) return 'unknown';
    var status = user.type;
    if (typeof user.premium === 'number' && user.premium > 0) status += ' (' + Math.floor(user.premium / 86400) + 'd)';
    return status;
  }

  function testToken() {
    var token = getToken();
    if (!token) { notify('rd_need_token'); return; }
    if (!canReachRealDebrid()) { notify('rd_web_cors'); return; }

    startLoading('Real-Debrid');
    request('/user').then(function (user) {
      stopLoading();
      Lampa.Noty.show((user.username || 'unknown') + ' | ' + formatPremium(user));
    }).catch(function (error) {
      stopLoading();
      console.error('Real-Debrid token test error', error);
      notify('rd_test_fail');
    });
  }

  // ---- settings -----------------------------------------------------------

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
      param: { name: RD_TOKEN_KEY, type: 'input', values: '', default: '', placeholder: '' },
      field: { name: Lampa.Lang.translate('rd_token'), description: Lampa.Lang.translate('rd_token_descr') },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: { name: RD_PROXY_KEY, type: 'input', values: '', default: '', placeholder: '' },
      field: { name: Lampa.Lang.translate('rd_proxy'), description: Lampa.Lang.translate('rd_proxy_descr') },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: { name: RD_AUTO_KEY, type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('rd_auto'), description: Lampa.Lang.translate('rd_auto_descr') },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: { name: RD_LINK_KEY, type: 'input', values: '', default: '', placeholder: '' },
      field: { name: Lampa.Lang.translate('rd_last_link'), description: Lampa.Lang.translate('rd_last_link_descr') },
      onChange: function () {}
    });

    Lampa.SettingsApi.addParam({
      component: runtimeState.settingsComponent,
      param: { name: 'rd_test_token', type: 'trigger', default: false },
      field: { name: Lampa.Lang.translate('rd_test_token'), description: 'GET /user' },
      onChange: testToken
    });
  }

  // ---- torrent screen integration ----------------------------------------

  function initTorrentCapture() {
    Lampa.Listener.follow('torrent_file', function (e) {
      if (!e || !e.type) return;

      if (e.type === 'list_open') {
        runtimeState.torrentList = e.items || [];
        if (e.items && e.items.length === 1) setTorrentChoice(e.items[0], e.items, e.params);
        return;
      }

      if (e.type === 'onfocus' || e.type === 'onlong') {
        setTorrentChoice(e.element, e.items, e.params);
      }

      if (e.type === 'onenter') {
        setTorrentChoice(e.element, e.items, e.params);
        if (!runtimeState.rdLaunching && shouldUseRealDebridAuto()) {
          runtimeState.interceptNextPlay = true;
          setTimeout(function () {
            if (runtimeState.interceptNextPlay) {
              runtimeState.interceptNextPlay = false;
              prepareAndPlay(true);
            }
          }, 0);
        }
      }
    });
  }

  function ensureTorrentButton() {
    if (!getToken()) return;
    var body = $('.torrent-files');
    if (!body.length) return;
    if (body.parent().find('.' + RD_BUTTON_CLASS).length) return;

    var button = $('<div class="simple-button selector ' + RD_BUTTON_CLASS + '" style="margin:1em 0 0 0;display:inline-flex;">' +
      Lampa.Lang.translate('rd_use') + '</div>');
    button.on('hover:enter', function () { prepareAndPlay(false); });
    body.before(button);
  }

  function bindTorrentScreenButton() {
    Lampa.Listener.follow('torrent_file', function (e) {
      if (!e || !e.type) return;
      if (e.type === 'list_open' || e.type === 'onfocus' || e.type === 'onenter') {
        setTimeout(ensureTorrentButton, 0);
      }
      if (e.type === 'list_close') {
        $('.' + RD_BUTTON_CLASS).remove();
      }
    });
  }

  // ---- bootstrap ----------------------------------------------------------

  function init() {
    addLang();
    addSettings();
    initTorrentCapture();
    bindTorrentScreenButton();
  }

  function startPlugin() {
    if (window.plugin_realdebrid_ready) return;
    window.plugin_realdebrid_ready = true;
    if (window.appready) init();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') init();
      });
    }
  }

  startPlugin();
})();
