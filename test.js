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
    rdLaunching: false,
    torrentStartPatched: false
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
      rd_infringing: {
        ru: 'Real-Debrid заблокировал эту раздачу по жалобе правообладателя (infringing_file). Это не ошибка proxy — выбери другую раздачу/релиз.',
        en: 'Real-Debrid blocked this torrent due to a copyright claim (infringing_file). This is not a proxy error — pick a different release.',
        uk: 'Real-Debrid заблокував цю роздачу за скаргою правовласника (infringing_file). Це не помилка proxy — вибери іншу роздачу.'
      },
      rd_cors_fail: {
        ru: 'Запрос к Real-Debrid не удался. В web-версии это обычно CORS — укажи proxy URL в настройках.',
        en: 'Request to Real-Debrid failed. In web mode this is usually CORS — set a proxy URL in settings.',
        uk: 'Запит до Real-Debrid не вдався. У web-версії це зазвичай CORS — вкажи proxy URL у налаштуваннях.'
      },
      rd_pick_file: { ru: 'Выбери файл', en: 'Choose file', uk: 'Вибери файл' },
      rd_no_player: { ru: 'Не удалось запустить плеер Lampa', en: 'Unable to start Lampa player', uk: 'Не вдалося запустити плеєр Lampa' },
      rd_web_container: {
        ru: 'Это файл .mkv/.avi и т.п. — браузер обычно не умеет его проигрывать (отсюда «play() interrupted» и чёрный экран). Открой Lampa в Android-приложении или выбери релиз в .mp4.',
        en: 'This is an .mkv/.avi-type file — browsers usually cannot play it (hence "play() interrupted" and a black screen). Open Lampa in the Android app or pick an .mp4 release.',
        uk: 'Це файл .mkv/.avi тощо — браузер зазвичай не вміє його програвати (звідси «play() interrupted» і чорний екран). Відкрий Lampa в Android-застосунку або вибери реліз у .mp4.'
      },
      rd_test_token: { ru: 'Проверить token', en: 'Test token', uk: 'Перевірити token' },
      rd_test_fail: { ru: 'Real-Debrid token не прошёл проверку', en: 'Real-Debrid token validation failed', uk: 'Real-Debrid token не пройшов перевірку' },
      rd_web_cors: {
        ru: 'Прямые запросы к Real-Debrid блокирует CORS. Укажи proxy URL в настройках (тот же proxy работает и в браузере, и в приложении).',
        en: 'Direct requests to Real-Debrid are blocked by CORS. Set a proxy URL in settings (the same proxy works in both the browser and the app).',
        uk: 'Прямі запити до Real-Debrid блокує CORS. Вкажи proxy URL у налаштуваннях (той самий proxy працює і в браузері, і в застосунку).'
      },
      rd_proxy: { ru: 'Real-Debrid proxy URL', en: 'Real-Debrid proxy URL', uk: 'Real-Debrid proxy URL' },
      rd_proxy_descr: {
        ru: 'Адрес твоего HTTPS-proxy на VPS, напр. https://your-host/rd (без слеша в конце). Нужен для web-версии. В Android-приложении обычно не нужен (работает напрямую), НО если в приложении ошибка CORS — укажи этот же proxy и здесь. Proxy обязательно по HTTPS.',
        en: 'Your HTTPS proxy address on a VPS, e.g. https://your-host/rd (no trailing slash). Needed for web mode. Usually not needed in the Android app (direct access), BUT if the app shows a CORS error, set this same proxy here too. Must be HTTPS.',
        uk: 'Адреса твого HTTPS-proxy на VPS, напр. https://your-host/rd (без слеша в кінці). Потрібен для web-версії. В Android-застосунку зазвичай не потрібен (працює напряму), АЛЕ якщо в застосунку помилка CORS — вкажи цей самий proxy і тут. Proxy обовʼязково по HTTPS.'
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

  // Native Android HTTP bridge. The Lampa Android app injects a global `Android`
  // object; when it exposes httpReq we can hit Real-Debrid directly with NO CORS.
  // NOTE: we intentionally do NOT also require Lampa.Platform.is('android') here.
  // Some app builds report a different/empty platform string while still exposing
  // Android.httpReq — the old combined check wrongly fell back to web mode there
  // (CORS errors + "browser can't play mkv" warning inside the real app).
  function hasNativeHttp() {
    return typeof Android !== 'undefined' && Android && typeof Android.httpReq === 'function';
  }

  // Are we inside a native Lampa client (Android app, Android TV, Tizen, webOS,
  // NW.js desktop) rather than a real web browser? In native clients the built-in
  // video player handles .mkv/.avi/.ts, and CORS does not apply the same way.
  // We rely on platform/runtime markers, NOT on Android.httpReq, so an app build
  // without the HTTP bridge is still treated as an app (no browser-only warnings).
  function isNativeApp() {
    try {
      if (typeof Android !== 'undefined' && Android) return true;
      if (typeof tizen !== 'undefined') return true;
      if (typeof webOS !== 'undefined' || typeof PalmSystem !== 'undefined') return true;
      if (typeof window !== 'undefined' && (window.nw || window.process || window.cordova)) return true;
      if (typeof Lampa !== 'undefined' && Lampa.Platform && typeof Lampa.Platform.is === 'function') {
        if (Lampa.Platform.is('android') || Lampa.Platform.is('android_tv') ||
            Lampa.Platform.is('tizen') || Lampa.Platform.is('webos') ||
            Lampa.Platform.is('apple_tv') || Lampa.Platform.is('nw')) return true;
      }
    } catch (e) {}
    return false;
  }

  // Real web browser (desktop/mobile Chrome, Safari, etc.) where HTML5 <video>
  // cannot decode most containers and CORS is strictly enforced.
  function isBrowserEnv() {
    return !isNativeApp();
  }

  function hasProxy() {
    return !!getProxyUrl();
  }

  // Real-Debrid is reachable when we have a native HTTP bridge (no CORS), a proxy
  // configured (works in both app and browser), or we're in a native app whose
  // WebView can reach RD directly.
  function canReachRealDebrid() {
    return hasNativeHttp() || hasProxy() || isNativeApp();
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
  // 1) Native Android HTTP bridge (Android.httpReq) -> direct to RD, no CORS.
  // 2) Otherwise a configured proxy (path-style HTTPS proxy on your VPS). The
  //    proxy answers with Access-Control-Allow-Origin: *, so it works the SAME
  //    from a browser AND from the app's WebView — set it in BOTH if the app
  //    build has no native HTTP bridge.
  // 3) Otherwise a best-effort direct fetch that usually hits the browser CORS
  //    wall and reports it clearly.

  // Builds the request URL + whether a proxy is in play.
  // Supported proxy formats (path-style is the recommended VPS setup):
  //   - path-style (VPS nginx): "https://your-host/rd"  -> proxy + path
  //   - wrapping proxy with placeholder: "...{url}"      -> {url} replaced with encoded target
  //   - wrapping proxy ending in =/?/&: "https://x/?url=" -> proxy + encoded target
  function buildRequestUrl(path) {
    var direct = RD_API_BASE + path;
    var proxy = getProxyUrl();
    if (!proxy) return { url: direct, proxied: false };
    if (proxy.indexOf('{url}') !== -1) return { url: proxy.replace('{url}', encodeURIComponent(direct)), proxied: true };
    if (/[?&=]$/.test(proxy)) return { url: proxy + encodeURIComponent(direct), proxied: true };
    return { url: proxy + path, proxied: true };
  }

  function handleFetchResponse(response) {
    if (!response.ok) {
      return response.text().then(function (text) {
        throw new Error(text || ('HTTP ' + response.status));
      });
    }
    return response.status === 204 ? {} : response.text().then(function (text) {
      if (!text) return {};
      try { return JSON.parse(text); } catch (e) { return {}; }
    });
  }

  function request(path, options) {
    var token = getToken();
    var opts = Object.assign({ method: 'GET' }, options || {});
    opts.headers = Object.assign({ Authorization: 'Bearer ' + token }, opts.headers || {});

    if (hasNativeHttp()) {
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

    var target = buildRequestUrl(path);
    return fetch(target.url, {
      method: opts.method,
      headers: opts.headers,
      body: opts.body
    }).then(handleFetchResponse).catch(function (err) {
      // A failed direct (un-proxied) web request is almost always the CORS wall.
      if (!target.proxied) throw new Error('WEB_CORS_BLOCKED');
      throw err;
    });
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

  // Containers an HTML5 <video> in a browser can realistically play.
  // .mkv/.avi/.ts/.wmv/.m2ts usually fail in web mode (codec/container) even
  // though Real-Debrid resolves a direct link — the browser just can't decode it.
  function isBrowserPlayable(name) {
    return /\.(mp4|m4v|webm|mov)$/i.test(name || '');
  }

  function sortFiles(files) {
    var web = isBrowserEnv();
    return files.sort(function (a, b) {
      var aScore = isVideoFile(a.path) ? 1 : 0;
      var bScore = isVideoFile(b.path) ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      // In web mode, surface browser-playable containers first so we don't
      // auto-pick an unplayable .mkv when an .mp4 of the same title exists.
      if (web) {
        var aWeb = isBrowserPlayable(a.path) ? 1 : 0;
        var bWeb = isBrowserPlayable(b.path) ? 1 : 0;
        if (aWeb !== bWeb) return bWeb - aWeb;
      }
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
    // Web browsers can't decode most .mkv/.avi/.ts files even when RD returns a
    // valid direct link. Warn ONLY in a real browser — the native Lampa player
    // in the Android app / TV plays these containers fine, so no warning there.
    if (isBrowserEnv() && !isBrowserPlayable((url.split('?')[0] || ''))) {
      notify('rd_web_container');
    }
    if (Lampa.Player && typeof Lampa.Player.play === 'function') {
      // IMPORTANT: use ONE shared item object for both play() and playlist().
      // Previously play() and playlist() received two separate object literals
      // with the same url. Lampa could not match the currently-playing item
      // against the playlist entry, so it issued a SECOND video load for the
      // same url, interrupting the first play() promise:
      //   "The play() request was interrupted by a new load request"
      // which looped and the player never started. Registering the playlist
      // first with the same reference makes Lampa load the url exactly once.
      var item = { url: url, title: title || 'Real-Debrid', timeline: null };
      if (typeof Lampa.Player.playlist === 'function') {
        Lampa.Player.playlist([item]);
      }
      Lampa.Player.play(item);
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
    // Auto mode is already gated by shouldUseRealDebridAuto() (native or proxy).
    // For a manual launch we still try: request() falls back to a direct fetch
    // and reports rd_web_cors clearly if the browser blocks it.
    if (autoMode && !canReachRealDebrid()) return;

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
        // RD content block (HTTP 451, error_code 35). The proxy faithfully
        // forwards this from Real-Debrid — it is NOT a CORS/proxy failure, so
        // surface the real reason instead of the generic CORS hint.
        var isInfringing = typeof msg === 'string' &&
          (msg.indexOf('infringing_file') !== -1 || /"error_code"\s*:\s*35\b/.test(msg));
        if (msg === 'NO_VIDEO_FILES') notify('rd_empty_files');
        else if (msg === 'NO_PLAYER') notify('rd_no_player');
        else if (msg === 'TORRENT_DEAD') notify('rd_dead');
        else if (isInfringing) notify('rd_infringing');
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
      param: { name: 'rd_test_token', type: 'button' },
      field: { name: Lampa.Lang.translate('rd_test_token'), description: 'GET /user' },
      onChange: testToken
    });
  }

  // ---- torrent screen integration ----------------------------------------

  // Adds "Запустить через Real-Debrid" to a long-press action menu. Lampa sends
  // the `menu` array by reference right before Select.show, and Select supports
  // per-item onSelect handlers, so pushing our item with its own onSelect is the
  // clean, intended extension point (no monkey-patching of Select needed).
  function injectActionMenuItem(e) {
    if (!getToken()) return;
    if (!e || !Array.isArray(e.menu)) return;
    if (e.menu.some(function (m) { return m && m.rd_action; })) return;

    var element = e.element;
    var items = (e.items && e.items.length) ? e.items : (element ? [element] : []);
    var params = e.params || {};
    // Captured while the list controller is still active (Select toggles after).
    var prevController = (Lampa.Controller && typeof Lampa.Controller.enabled === 'function' &&
      Lampa.Controller.enabled().name) || 'content';

    e.menu.unshift({
      title: Lampa.Lang.translate('rd_use'),
      rd_action: true,
      onSelect: function () {
        // Select only hid the box; restore the list controller (stock items do
        // this via active.onSelect, which our per-item onSelect replaces).
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
          Lampa.Controller.toggle(prevController);
        }
        setTorrentChoice(element, items, params);
        prepareAndPlay(false);
      }
    });
  }

  // Release-list screen (search results). Emits `torrent` events. This is the
  // primary integration point for Real-Debrid because it works WITHOUT a
  // TorrServer (the `torrent_file` events only fire inside a connected
  // TorrServer file list, which RD-only users never reach).
  function initTorrentCapture() {
    Lampa.Listener.follow('torrent', function (e) {
      if (!e || !e.type) return;

      if (e.type === 'render' || e.type === 'onfocus' || e.type === 'onenter') {
        setTorrentChoice(e.element, e.element ? [e.element] : [], { movie: e.element && e.element.movie });
      }

      if (e.type === 'onlong') {
        setTorrentChoice(e.element, e.element ? [e.element] : [], {});
        injectActionMenuItem(e);
      }
    });

    // Also expose the action inside a connected TorrServer file list, reusing
    // the magnet captured from the release the user opened.
    Lampa.Listener.follow('torrent_file', function (e) {
      if (!e || !e.type) return;

      if (e.type === 'list_open') {
        runtimeState.torrentList = e.items || [];
        if (e.items && e.items.length === 1) setTorrentChoice(e.items[0], e.items, e.params);
        return;
      }

      if (e.type === 'onfocus') {
        setTorrentChoice(e.element, e.items, e.params);
      }

      if (e.type === 'onlong') {
        injectActionMenuItem(e);
      }
    });
  }

  // Auto-launch: intercept Lampa's torrent start so that, when enabled and no
  // TorrServer is configured, opening a release goes straight through RD instead
  // of falling into the "install TorrServer" flow.
  function patchTorrentStart() {
    if (runtimeState.torrentStartPatched) return;
    if (!Lampa.Torrent || typeof Lampa.Torrent.start !== 'function') return;
    runtimeState.torrentStartPatched = true;

    var original = Lampa.Torrent.start;
    Lampa.Torrent.start = function (element, movie) {
      try {
        if (!runtimeState.rdLaunching && shouldUseRealDebridAuto()) {
          var link = extractLink(element);
          if (link) {
            setTorrentChoice(element, [element], { movie: movie });
            prepareAndPlay(true);
            return;
          }
        }
      } catch (err) {
        console.error('Real-Debrid auto-intercept error', err);
      }
      return original.apply(this, arguments);
    };
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

  function logEnvironment() {
    try {
      var androidMethods = [];
      if (typeof Android !== 'undefined' && Android) {
        for (var k in Android) { try { if (typeof Android[k] === 'function') androidMethods.push(k); } catch (e) {} }
      }
      var platform = '';
      try {
        if (Lampa && Lampa.Platform) {
          ['android', 'android_tv', 'tizen', 'webos', 'apple_tv', 'nw', 'browser'].forEach(function (p) {
            try { if (typeof Lampa.Platform.is === 'function' && Lampa.Platform.is(p)) platform += (platform ? ',' : '') + p; } catch (e) {}
          });
        }
      } catch (e) {}
      console.log('[RD] env:', {
        nativeApp: isNativeApp(),
        nativeHttp: hasNativeHttp(),
        browserEnv: isBrowserEnv(),
        proxy: getProxyUrl() || '(none)',
        platform: platform || '(unknown)',
        androidBridge: typeof Android !== 'undefined',
        androidMethods: androidMethods
      });
    } catch (e) {}
  }

  function init() {
    addLang();
    addSettings();
    patchTorrentStart();
    initTorrentCapture();
    bindTorrentScreenButton();
    logEnvironment();
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
