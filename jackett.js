(function () {
  'use strict';

  Lampa.Platform.tv();

  var servers = [
    { id: 'lampa_jackett', name: 'Lampa jacred', baseUrl: '87.120.84.218:9117', key: '333', interview: 'all', lang: 'df' },
    { id: 'jac_red', name: 'Jac.red', baseUrl: 'jac.red', key: '', interview: 'healthy', lang: 'lg' },
    { id: 'ru_jac_black', name: 'RU Jac.black', baseUrl: 'ru.jac.black', protocol: 'https://', key: '', interview: 'healthy', lang: 'lg' },
    { id: 'jr_maxvol_pro', name: 'Jacred Maxvol Pro', baseUrl: 'jr.maxvol.pro', key: '', interview: 'healthy', lang: 'df' },
    { id: 'jacred_ru', name: 'Jacred RU', baseUrl: 'jac-red.ru', key: '', interview: 'all', lang: 'lg' },
    { id: 'tribal', name: 'Tribal', baseUrl: '11.307407.xyz', protocol: 'https://', key: '', interview: 'all', lang: 'lg' },
    { id: 'freebie_tom_ru', name: 'Freebie', baseUrl: 'jacred.freebie.tom.ru', key: '1', interview: 'all', lang: 'lg' }
  ];

  var PARSER_ICON = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4 19.6 9.5 16.7 18.5 7.3 18.5 4.4 9.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" opacity=".45"/><path d="M12 12 12 4M12 12 19.6 9.5M12 12 16.7 18.5M12 12 7.3 18.5M12 12 4.4 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><circle cx="12" cy="4" r="1.9" fill="currentColor"/><circle cx="19.6" cy="9.5" r="1.9" fill="currentColor"/><circle cx="16.7" cy="18.5" r="1.9" fill="currentColor"/><circle cx="7.3" cy="18.5" r="1.9" fill="currentColor"/><circle cx="4.4" cy="9.5" r="1.9" fill="currentColor"/></svg>';

  var COLOR_OK = '#64e364';
  var COLOR_FAIL = '#ff2121';
  var COLOR_AUTH = '#000';

  function findServerById(id) {
    for (var i = 0; i < servers.length; i++) {
      if (servers[i].id === id) return servers[i];
    }
    return null;
  }

  function getServerUrl(server) {
    return (server.protocol || '') + server.baseUrl;
  }

  var pageHttps = (typeof location !== 'undefined' && location.protocol === 'https:');

  function getRequestProtocol(server) {
    return server.protocol || 'http://';
  }

  /* Приложение (Android, Tizen, WebOS) ходит в сеть нативно и правило
     mixed content на него не распространяется. Ограничение живое только в
     обычном браузере — там https-страница действительно не пустит запрос
     на http.

     Раньше проверка не различала эти случаи, и на ТВ рабочие http-парсеры
     (Freebie и другие) висели с ⚠, хотя при выборе искали как ни в чём не
     бывало. */
  function isNativeApp() {
    try {
      if (typeof Lampa === 'undefined' || !Lampa.Platform) return false;
      return !Lampa.Platform.is('browser');
    } catch (e) {
      return false;
    }
  }

  function isBlockedByMixedContent(server) {
    if (isNativeApp()) return false;
    return pageHttps && getRequestProtocol(server) === 'http://';
  }

  function applyServer(server) {
    Lampa.Storage.set('jackett_url', getServerUrl(server));
    Lampa.Storage.set('jackett_urltwo', server.id);
    Lampa.Storage.set('jackett_key', server.key);
    Lampa.Storage.set('jackett_interview', server.interview);
    Lampa.Storage.set('parse_lang', server.lang);
    Lampa.Storage.set('parse_in_search', true);
  }

  function applyServerConfig() {
    var selected = Lampa.Storage.get('jackett_urltwo');

    if (selected === 'no_parser') {
      Lampa.Storage.set('jackett_url', '');
      Lampa.Storage.set('jackett_key', '');
      Lampa.Storage.set('jackett_interview', 'all');
      Lampa.Storage.set('parse_in_search', false);
      Lampa.Storage.set('parse_lang', 'lg');
      return;
    }

    var server = findServerById(selected);
    if (server) applyServer(server);
  }

  // Заведомо несуществующее слово. Два повода не брать реальное:
  //
  // 1. Freebie отдавал 403 именно на слово "test" — фильтр на стороне его
  //    nginx. Парсер работал, а в списке горел красным.
  // 2. Осмысленный запрос заставляет сервер реально искать по трекерам:
  //    Jac.black отвечал 3-4 секунды и присылал больше мегабайта. На пинг
  //    достаточно пустого ответа в 28 байт.
  var PING_QUERY = 'zzqxwv';
  // 6 секунд не хватало: на телевизоре первое обращение к серверу включает
  // разрешение имени и рукопожатие TLS, и живой парсер помечался мёртвым.
  var PING_TIMEOUT = 12000;

  function buildPingUrls(server) {
    // Порядок важен: сначала самый быстрый адрес, потом запасные.
    //
    // status:healthy опрашивает только живые индексеры и на всех серверах
    // отвечает за доли секунды. indexers/all заставляет сервер обойти в том
    // числе мёртвые трекеры: у Tribal такой запрос занимал 25 секунд и не
    // укладывался в таймаут, хотя сам парсер полностью рабочий.
    var base = getRequestProtocol(server) + server.baseUrl;
    var own = server.interview === 'healthy' ? 'status:healthy' : 'all';
    var urls = [base + '/api/v2.0/indexers/status:healthy/results?apikey=' + server.key + '&query=' + PING_QUERY];

    if (own !== 'status:healthy') {
      urls.push(base + '/api/v2.0/indexers/' + own + '/results?apikey=' + server.key + '&query=' + PING_QUERY);
    }
    // Часть сборок jacred отдаёт только v1.0.
    urls.push(base + '/api/v1.0/torrents?search=' + PING_QUERY + '&apikey=' + server.key);

    return urls;
  }

  /* Запрос через сетевой слой самой Lampa.

     Это главная причина, по которой рабочие парсеры горели красным.
     Проверка шла обычным XMLHttpRequest прямо со страницы, а он подчиняется
     правилам браузера: с https-страницы запрос на http блокируется как
     mixed content, плюс к нему применяется CORS. Настоящий же поиск
     торрентов Lampa делает своим слоем, который на Android и ТВ ходит в
     сеть нативно, мимо этих ограничений.

     Отсюда и расхождение: в списке ✗, а при выборе всё работает. Теперь
     проверяем тем же способом, каким потом ищем. */
  function requestPing(url, onDone) {
    var done = false;
    function finish(ok, status) {
      if (done) return;
      done = true;
      onDone(ok, status);
    }

    if (typeof Lampa !== 'undefined' && Lampa.Reguest) {
      try {
        var net = new Lampa.Reguest();
        var timer = setTimeout(function () {
          try { net.clear(); } catch (e) {}
          finish(false, 'timeout');
        }, PING_TIMEOUT);

        net.native(url, function () {
          clearTimeout(timer);
          finish(true, 200);
        }, function (xhr) {
          clearTimeout(timer);
          var code = (xhr && xhr.status) || 'error';
          finish(false, code);
        });
        return;
      } catch (e) {
        // Сетевой слой недоступен — падаем на обычный запрос ниже.
      }
    }

    var xhr = new XMLHttpRequest();
    xhr.timeout = PING_TIMEOUT;
    xhr.onload = function () { finish(xhr.status === 200, xhr.status); };
    xhr.ontimeout = function () { finish(false, 'timeout'); };
    xhr.onerror = function () { finish(false, 'error'); };
    try {
      xhr.open('GET', url, true);
      xhr.send();
    } catch (e) {
      finish(false, 'error');
    }
  }

  function checkServerStatus(server, callback) {
    // Проверку на mixed content оставляем только там, где она реальна:
    // в браузере. В приложении запрос идёт нативно, и http-парсер работает
    // прекрасно — помечать его предупреждением значит врать.
    if (isBlockedByMixedContent(server)) {
      callback(server, false, 'mixed');
      return;
    }

    var urls = buildPingUrls(server);

    function attempt(i, lastStatus) {
      if (i >= urls.length) {
        callback(server, false, lastStatus);
        return;
      }
      requestPing(urls[i], function (ok, status) {
        if (ok) {
          callback(server, true, status);
          return;
        }
        // 401 — сервер жив, но просит ключ: остальные адреса не помогут.
        if (status === 401) {
          callback(server, false, status);
          return;
        }
        attempt(i + 1, status);
      });
    }

    attempt(0, 'error');
  }

  function updateServerStatusInSettings() {
    setTimeout(function () {
      var firstItem = $('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div');
      if (firstItem.text().trim() !== 'Свой вариант') return;

      servers.forEach(function (server, index) {
        var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + (index + 2) + ') > div';
        var element = $(selector);
        if (element.text().trim() !== server.name) return;

        checkServerStatus(server, function (srv, ok, status) {
          if (ok) {
            element.html('✓&nbsp;&nbsp;' + srv.name).css('color', COLOR_OK);
          } else {
            var color = status === 401 ? COLOR_AUTH : COLOR_FAIL;
            var mark = status === 'mixed' ? '⚠' : '✗';
            element.html(mark + '&nbsp;&nbsp;' + srv.name).css('color', color);
          }
        });
      });
    }, 1000);
  }

  var selectValues = { no_parser: 'Свой вариант' };
  servers.forEach(function (s) { selectValues[s.id] = s.name; });

  Lampa.SettingsApi.addParam({
    component: 'parser',
    param: {
      name: 'jackett_urltwo',
      type: 'select',
      values: selectValues,
      default: 'jac_red'
    },
    field: {
      name: '<div class="settings-folder" style="padding:0!important;display:flex;align-items:center">'
        + '<div style="width:1.7em;height:1.7em;margin-right:.7em;flex-shrink:0;display:flex;align-items:center;justify-content:center">' + PARSER_ICON + '</div>'
        + '<div>Выбрать парсер</div>'
        + '</div>',
      description: 'Нажмите для выбора парсера из списка'
    },
    onChange: function () {
      applyServerConfig();
      Lampa.Settings.update();
    },
    onRender: function (element) {
      setTimeout(function () {
        var urltwoEl = $('div[data-name="jackett_urltwo"]');
        urltwoEl.off('hover:enter').on('hover:enter', function () {
          closeModalSafeJ();
          setTimeout(showServerSwitchMenu, 200);
        });

        if (Lampa.Storage.get('jackett_urltwo') !== 'no_parser') {
          $('div[data-name="jackett_url"]').hide();
          $('div[data-name="jackett_key"]').hide();
        }

        if (Lampa.Storage.field('parser_use') && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
          element.show();
          $('.settings-param__name', element).css('color', '#ffffff');
          urltwoEl.find('.settings-param__value').text(getCurrentParserName());
          urltwoEl.insertAfter('div[data-name="parser_torrent_type"]');
        } else {
          element.hide();
        }
      }, 5);
    }
  });

  Lampa.Settings.listener.follow('open', function (e) {
    if (e.name === 'parser') {
      setTimeout(function () {
        if (Lampa.Storage.get('jackett_urltwo') !== 'no_parser') {
          $('div[data-name="jackett_url2"]').hide();
          $('div[data-name="jackett_url_two"]').hide();
        }
      }, 10);
    }
  });

  function getCurrentParserName() {
    var selected = Lampa.Storage.get('jackett_urltwo');
    if (selected === 'no_parser') return 'Свой';
    var server = findServerById(selected);
    return server ? server.name : 'Не выбран';
  }

  function addParserFilterButton() {
    var filterContainer = document.querySelector('.torrent-filter');
    if (!filterContainer) return;
    if (filterContainer.querySelector('.filter--parser')) return;

    var button = document.createElement('div');
    button.className = 'simple-button simple-button--filter selector filter--parser';
    button.innerHTML = PARSER_ICON + '<div id="current-parser-name">' + getCurrentParserName() + '</div>';

    $(button).on('hover:enter', showServerSwitchMenu);

    var sortButton = filterContainer.querySelector('.filter--sort');
    if (sortButton) filterContainer.insertBefore(button, sortButton);
    else filterContainer.appendChild(button);
  }

  function checkAllServers(callback) {
    var results = [];
    var done = 0;
    var total = servers.length;
    servers.forEach(function (server) {
      checkServerStatus(server, function (srv, ok, status) {
        srv._online = ok;
        srv._status = status;
        results.push(srv);
        done++;
        if (done === total) callback(results);
      });
    });
  }

  function getServerSelectItem(s, overrideTitle) {
    return {
      title: overrideTitle !== undefined ? overrideTitle : (s.title || s.name),
      url: getServerUrl(s),
      url_two: s.id,
      jac_key: s.key,
      jac_int: s.interview,
      jac_lang: s.lang
    };
  }

  function scheduleParserButtonAfterChange() {
    ensureParserButton();
    startResultWatch(1200);
  }

  function softReloadTorrents() {
    if (!Lampa.Activity || typeof Lampa.Activity.active !== 'function') return false;

    var made = Lampa.Activity.active();
    if (!made || made.component !== 'torrents') return false;

    var comp = made.activity;
    if (!comp || typeof comp.parse !== 'function') return false;

    try {
      if (typeof comp.reset === 'function') comp.reset();
      if (comp.activity && typeof comp.activity.loader === 'function') comp.activity.loader(true);
      comp.parse();
      return true;
    } catch (e) {
      return false;
    }
  }

  function applyParserAndRefreshTorrents(item, currentActivity) {
    var server = findServerById(item.url_two);
    if (server) applyServer(server);

    var nameEl = document.getElementById('current-parser-name');
    if (nameEl) nameEl.textContent = getCurrentParserName();

    var enabled = Lampa.Controller.enabled();
    Lampa.Controller.toggle(enabled && enabled.name);

    if (softReloadTorrents()) {
      scheduleParserButtonAfterChange();
      return;
    }

    var act = (currentActivity && typeof currentActivity === 'object') ? currentActivity : Lampa.Storage.get('activity');
    var skipKeys = { torrents: 1, results: 1, list: 1, data: 1, items: 1, cache: 1, _cache: 1, _data: 1, state: 1, torrentList: 1, torrent_list: 1 };
    var cleanActivity = {};
    if (act && typeof act === 'object') {
      for (var k in act) {
        if (Object.prototype.hasOwnProperty.call(act, k) && !skipKeys[k]) cleanActivity[k] = act[k];
      }
    }
    var hasActivity = Object.keys(cleanActivity).length > 0;

    if (!hasActivity) {
      addParserFilterButton();
      scheduleParserButtonAfterChange();
      return;
    }

    if (typeof Lampa.Activity.replace === 'function') {
      Lampa.Activity.replace(cleanActivity);
      scheduleParserButtonAfterChange();
      return;
    }
    if (typeof Lampa.Activity.replaceWith === 'function') {
      Lampa.Activity.replaceWith(cleanActivity);
      scheduleParserButtonAfterChange();
      return;
    }

    var back = typeof Lampa.Activity.back === 'function' ? Lampa.Activity.back : function () { window.history.back(); };
    back();
    setTimeout(function () {
      Lampa.Activity.push(cleanActivity);
      scheduleParserButtonAfterChange();
    }, 400);
  }

  function closeParserSelectAndRestore(controllerName) {
    var enabled = Lampa.Controller.enabled();
    var name = controllerName || (enabled && enabled.name);
    if (name) {
      Lampa.Controller.toggle(name);
    } else if (typeof Lampa.Controller.back === 'function') {
      Lampa.Controller.back();
    } else {
      window.history.back();
    }
  }

  var SVG_CHECK_ON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var SVG_CHECK_OFF = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var SVG_SPINNER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" opacity="0.3"/><path d="M21 12a9 9 0 0 1-9 9"/></svg>';

  var jackettStyle = document.createElement('style');
  jackettStyle.textContent =
    '.jackett-server-list{display:flex;flex-direction:column;gap:.7em;padding-right:1em;max-width:100%;width:100%;box-sizing:border-box}' +
    '.jackett-server-item{display:grid;grid-template-columns:minmax(0,1fr) 2.4em;align-items:center;gap:.35em;padding:.7em 1em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);box-sizing:border-box;min-height:3.2em}' +
    '.jackett-server-item.focus{border-color:#fff!important;background:rgba(255,255,255,.1)}' +
    '.jackett-server-item.jackett-server-active{border-color:rgba(66,133,244,.7);background:rgba(66,133,244,.15)}' +
    '.jackett-server-info{min-width:0;overflow:hidden;box-sizing:border-box}' +
    '.jackett-server-name{font-family:inherit;font-size:inherit;font-weight:bold;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}' +
    '.jackett-server-note{font-size:.75em;opacity:.6;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.jackett-server-status{width:2.4em;min-width:2.4em;height:2.4em;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border:1px solid rgba(255,255,255,.2);border-radius:.6em;background:rgba(255,255,255,.1)}' +
    '.jackett-server-status svg{width:1.2em;height:1.2em}' +
    '.jackett-server-item.jackett-server-online .jackett-server-status{border-color:rgba(76,175,80,.6);background:rgba(76,175,80,.2);color:#4caf50}' +
    '.jackett-server-item.jackett-server-offline .jackett-server-status{border-color:rgba(255,33,33,.5);background:rgba(255,33,33,.15);color:#ff2121}' +
    '.jackett-server-item.jackett-server-checking .jackett-server-status{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:rgba(255,255,255,.5)}' +
    '@keyframes jackett-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}' +
    '.jackett-server-item.jackett-server-checking .jackett-server-status svg{animation:jackett-spin 1s linear infinite}';
  document.head.appendChild(jackettStyle);

  var EDGE_SCROLL_PAD_J = 8;

  function openModalWithEdgeScrollJ(params) {
    Lampa.Modal.open(params);
    patchModalEdgeScrollJ();
  }

  function patchModalEdgeScrollJ() {
    try {
      if (!Lampa.Modal || typeof Lampa.Modal.scroll !== 'function') return;
      var scroll = Lampa.Modal.scroll();
      if (!scroll || scroll.__edgeScrollPatchedJ) return;
      if (typeof scroll.update !== 'function' || typeof scroll.wheel !== 'function' ||
          typeof scroll.render !== 'function') return;
      scroll.__edgeScrollPatchedJ = true;
      scroll.update = function (elem) {
        try {
          var target = elem && elem.jquery ? elem[0] : elem;
          if (!target || typeof target.getBoundingClientRect !== 'function') return;
          var renderEl = scroll.render(true);
          if (!renderEl) return;
          var viewportEl = renderEl.querySelector('.scroll__content') || renderEl;
          var er = target.getBoundingClientRect();
          var vr = viewportEl.getBoundingClientRect();
          if (!er.height || !vr.height) return;
          if (er.bottom > vr.bottom - EDGE_SCROLL_PAD_J) {
            scroll.wheel(er.bottom - vr.bottom + EDGE_SCROLL_PAD_J);
          } else if (er.top < vr.top + EDGE_SCROLL_PAD_J) {
            scroll.wheel(er.top - vr.top - EDGE_SCROLL_PAD_J);
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  function closeModalSafeJ() {
    try {
      if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) {
        Lampa.Modal.close();
      }
    } catch (e) {}
  }

  function focusModalControllerJ() {
    setTimeout(function () {
      try {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
          Lampa.Controller.toggle('modal');
        }
      } catch (e) {}
    }, 120);
  }

  function syncModalFontJ() {
    try {
      var ref = document.querySelector('.settings-param') || document.querySelector('.settings');
      if (!ref) ref = document.body;
      var cs = window.getComputedStyle(ref);
      var modalRoot = document.querySelector('.modal__content') || document.querySelector('.modal .modal__body') || document.querySelector('.modal .modal__html');
      if (!modalRoot && typeof window.$ !== 'undefined' && window.$) {
        var $inner = $('.modal').last().find('.modal__body, .modal__content, .modal__html').first();
        if ($inner.length) modalRoot = $inner[0];
      }
      if (!modalRoot) return;
      if (cs.fontFamily) modalRoot.style.fontFamily = cs.fontFamily;
      if (cs.fontSize) modalRoot.style.fontSize = cs.fontSize;
    } catch (e) {}
  }

  function showServerSwitchMenu() {
    var currentActivity = Lampa.Storage.get('activity');
    var enabled = Lampa.Controller.enabled();
    var controllerBeforeModal = (enabled && enabled.name) || '';
    var currentSelected = Lampa.Storage.get('jackett_urltwo');

    var list = $('<div class="jackett-server-list"></div>');
    var rowMap = {};

    var noParserRow = $('<div class="selector jackett-server-item" tabindex="0">' +
      '<div class="jackett-server-info">' +
      '<div class="jackett-server-name">Свой вариант</div>' +
      '</div>' +
      '<div class="jackett-server-status"></div>' +
      '</div>');

    if (currentSelected === 'no_parser') noParserRow.addClass('jackett-server-active');

    noParserRow.on('hover:enter', function () {
      Lampa.Storage.set('jackett_urltwo', 'no_parser');
      Lampa.Storage.set('jackett_url', '');
      Lampa.Storage.set('jackett_key', '');
      Lampa.Storage.set('jackett_interview', 'all');
      Lampa.Storage.set('parse_in_search', false);
      Lampa.Storage.set('parse_lang', 'lg');
      closeModalSafeJ();
      $('div[data-name="jackett_url"] input, div[data-name="jackett_url"] .settings-param__value').val('').text('');
      $('div[data-name="jackett_key"] input, div[data-name="jackett_key"] .settings-param__value').val('').text('');
      $('div[data-name="jackett_url"]').show();
      $('div[data-name="jackett_key"]').show();
      $('div[data-name="jackett_url2"]').show();
      $('div[data-name="jackett_url_two"]').show();
      $('div[data-name="jackett_urltwo"] .settings-param__value').text('Свой вариант');
      closeParserSelectAndRestore(controllerBeforeModal);
    });

    list.append(noParserRow);

    servers.forEach(function (s) {
      (function (server) {
        var isActive = (server.id === currentSelected);
        var row = $('<div class="selector jackett-server-item jackett-server-checking" tabindex="0">' +
          '<div class="jackett-server-info">' +
          '<div class="jackett-server-name">' + server.name + '</div>' +
          '</div>' +
          '<div class="jackett-server-status">' + SVG_SPINNER + '</div>' +
          '</div>');

        if (isActive) row.addClass('jackett-server-active');

        row.on('hover:enter', function () {
          var item = getServerSelectItem(server);
          closeModalSafeJ();
          $('div[data-name="jackett_url"]').hide();
          $('div[data-name="jackett_key"]').hide();
          $('div[data-name="jackett_urltwo"] .settings-param__value').text(server.name);
          applyParserAndRefreshTorrents(item, currentActivity);
        });

        rowMap[server.id] = row;
        list.append(row);
      })(s);
    });

    try {
      var refCs = window.getComputedStyle(document.body);
      if (refCs.fontFamily) list[0].style.fontFamily = refCs.fontFamily;
      if (refCs.fontSize) list[0].style.fontSize = refCs.fontSize;
    } catch (e) {}

    openModalWithEdgeScrollJ({
      title: 'Меню смены парсера',
      html: list,
      size: 'medium',
      scroll_to_center: false,
      onBack: function () {
        closeModalSafeJ();
        closeParserSelectAndRestore(controllerBeforeModal);
      }
    });
    setTimeout(function () {
      focusModalControllerJ();
    }, 250);

    checkAllServers(function (checkedServers) {
      checkedServers.forEach(function (s) {
        var row = rowMap[s.id];
        if (!row) return;
        row.removeClass('jackett-server-checking');
        if (s._online) {
          row.addClass('jackett-server-online');
          row.find('.jackett-server-status').html(SVG_CHECK_ON);
        } else {
          row.addClass('jackett-server-offline');
          row.find('.jackett-server-status').html(SVG_CHECK_OFF);

          if (s._status === 'mixed') {
            row.find('.jackett-server-name')
              .after('<div class="jackett-server-note">только по HTTP</div>');
          }
        }
      });
    });
  }

  var BUILD_RETRY_DELAYS = [0, 150, 400, 900];
  var pageTimers = [];

  var WATCH_STEP = 400;
  var WATCH_MAX_TICKS = 45;
  var watchTimer = 0;
  var watchTicks = 0;
  var pageVerdict = false;

  function clearPageTimers() {
    for (var i = 0; i < pageTimers.length; i++) clearTimeout(pageTimers[i]);
    pageTimers = [];
  }

  function isTorrentsPage() {
    var active = Lampa.Activity.active();
    return !!(active && active.component === 'torrents');
  }

  function activeSlide() {
    return document.querySelector('.activity--active') || document.body;
  }

  function isActivityLoading(slide) {
    return !!(slide && slide.classList && slide.classList.contains('activity--load'));
  }

  function ensureParserButton() {
    clearPageTimers();

    BUILD_RETRY_DELAYS.forEach(function (delay) {
      pageTimers.push(setTimeout(function () {
        if (!isTorrentsPage()) return;
        if (document.querySelector('.filter--parser')) return;
        addParserFilterButton();
      }, delay));
    });
  }

  function stopResultWatch() {
    if (watchTimer) clearTimeout(watchTimer);
    watchTimer = 0;
    watchTicks = 0;
  }

  function startResultWatch(startDelay) {
    stopResultWatch();
    pageVerdict = false;
    watchTimer = setTimeout(tickResultWatch, startDelay || 0);
  }

  function tickResultWatch() {
    watchTimer = 0;

    if (!isTorrentsPage()) { stopResultWatch(); return; }
    if (checkEmptyResult()) { stopResultWatch(); return; }
    if (++watchTicks >= WATCH_MAX_TICKS) { stopResultWatch(); return; }

    watchTimer = setTimeout(tickResultWatch, WATCH_STEP);
  }

  function checkEmptyResult() {
    if (pageVerdict) return true;
    if (!isTorrentsPage()) return true;

    if (Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
      pageVerdict = true;
      return true;
    }

    var slide = activeSlide();

    if (isActivityLoading(slide)) return false;

    if (slide.querySelector('.torrent-item')) {
      pageVerdict = true;
      return true;
    }

    if (!slide.querySelector('.empty__title')) return false;

    pageVerdict = true;
    showServerSwitchMenu();
    return true;
  }

  function onTorrentsPageEnter() {
    ensureParserButton();
    startResultWatch(300);
  }

  function onTorrentsPageLeave() {
    clearPageTimers();
    stopResultWatch();
    pageVerdict = false;
  }

  Lampa.Listener.follow('torrent', function (e) {
    if (e.type === 'render') {
      pageVerdict = true;
      stopResultWatch();
    }
  });

  Lampa.Listener.follow('activity', function (e) {
    if (e.component !== 'torrents') return;

    if (e.type === 'start') onTorrentsPageEnter();
    if (e.type === 'destroy' || e.type === 'archive') onTorrentsPageLeave();
  });

  Lampa.Storage.listener.follow('change', function (e) {
    if (e.name === 'parser_torrent_type') {
      var el = $('div[data-name="jackett_urltwo"]');
      if (e.value !== 'jackett') el.hide();
      else el.show().insertAfter('div[data-name="parser_torrent_type"]');
    }

    if (e.name === 'activity') {
      if (isTorrentsPage()) onTorrentsPageEnter();
      else onTorrentsPageLeave();
    }

    if (e.name === 'jackett_urltwo') {
      var nameEl = document.getElementById('current-parser-name');
      if (nameEl) nameEl.textContent = getCurrentParserName();
      var valEl = $('div[data-name="jackett_urltwo"] .settings-param__value');
      if (valEl.length) valEl.text(getCurrentParserName());
    }
  });

  Lampa.Controller.listener.follow('toggle', function (e) {
    if (e.name === 'select') {
      setTimeout(updateServerStatusInSettings, 10);
    }

    if (e.name === 'content' && isTorrentsPage() && !pageVerdict) {
      setTimeout(function () { if (checkEmptyResult()) stopResultWatch(); }, 120);
    }
  });

  if (Lampa.Storage.get('parser_use', '') === '') {
    Lampa.Storage.set('parser_use', true);
  }

  if (!Lampa.Storage.get('jack', false)) {
    Lampa.Storage.set('jack', true);
    var def = findServerById('jac_red');
    if (def) applyServer(def);
  }
})();
