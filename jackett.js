(function () {
  'use strict';

  Lampa.Platform.tv();

  var servers = [
    { id: 'lampa_jackett', name: 'Lampa Jackett', baseUrl: '87.120.84.218:8443', key: '777', interview: 'all', lang: 'df' },
    { id: 'jac_red', name: 'Jac.red', baseUrl: 'jac.red', key: '', interview: 'healthy', lang: 'lg' },
    { id: 'jr_maxvol_pro', name: 'Jacred Maxvol Pro', baseUrl: 'jr.maxvol.pro', key: '', interview: 'healthy', lang: 'df' },
    { id: 'jacred_ru', name: 'Jacred RU', baseUrl: 'jac-red.ru', key: '', interview: 'all', lang: 'lg' },
    { id: 'jacred_pro', name: 'RU Jacred Pro', baseUrl: 'ru.jacred.pro', key: '', interview: 'all', lang: 'lg' },
    { id: 'tribal', name: 'Tribal', baseUrl: '11.307407.xyz', protocol: 'https://', key: '', interview: 'all', lang: 'lg' },
    { id: 'freebie_tom_ru', name: 'Freebie', baseUrl: 'jacred.freebie.tom.ru', key: '1', interview: 'all', lang: 'lg' },
    // { id: 'jac_black', name: 'Jac Black', baseUrl: 'jacblack.ru:9117', key: '', interview: 'all', lang: 'lg' },
    { id: 'Myjacket', name: 'Myjacket', baseUrl: 'lampac.fun:8117', key: 'cvy139co64s9pu791s2ao7egzzgogocw', interview: 'all', lang: 'lg' }
  ];

  var PARSER_ICON = '<svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"> <polygon fill="#074761" points="187.305,27.642 324.696,27.642 256,236.716"/> <polygon fill="#10BAFC" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"/> <polygon fill="#0084FF" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"/> <polygon fill="#0084FF" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"/> <polygon fill="#10BAFC" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"/> <polygon fill="#0084FF" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"/> <polygon fill="#0084FF" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"/> <path fill="#000000" d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"/> <path fill="#000000" d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"/> <path fill="#000000" d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"/> <path fill="#000000" d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"/> <path fill="#000000" d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"/> <path fill="#000000" d="M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075 c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858 c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371 C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795 c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507 l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795 L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123 h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242 L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484 l89.627,82.578L245.552,473.907L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666 c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484 c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132 l36.268-111.136l48.515,319.89L452.882,438.59z"/> <path fill="#000000" d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"/> </svg>';

  var COLOR_OK = '#64e364';
  var COLOR_FAIL = '#ff2121';
  var COLOR_AUTH = '#000';

  function findServerById(id) {
    for (var i = 0; i < servers.length; i++) {
      if (servers[i].id === id) return servers[i];
    }
    return null;
  }

  function isAlwaysOnline(server) {
    return server.id === 'freebie_tom_ru' || server.id === 'Myjacket';
  }

  function getServerUrl(server) {
    return (server.protocol || '') + server.baseUrl;
  }

  var pageHttps = (typeof location !== 'undefined' && location.protocol === 'https:');
  function getRequestProtocol(server) {
    return server.protocol || (pageHttps ? 'https://' : 'http://');
  }

  var rafFn = (typeof window !== 'undefined' && window.requestAnimationFrame)
    ? window.requestAnimationFrame.bind(window)
    : function (cb) { return setTimeout(cb, 16); };

  function rafThrottle(fn) {
    var scheduled = false;
    return function () {
      if (scheduled) return;
      scheduled = true;
      rafFn(function () { scheduled = false; fn(); });
    };
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

  function checkServerStatus(server, callback) {
    if (isAlwaysOnline(server)) {
      callback(server, true, 200);
      return;
    }

    var url = getRequestProtocol(server) + server.baseUrl + '/api/v2.0/indexers/status:healthy/results?apikey=' + server.key;

    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.onload = function () { callback(server, xhr.status === 200, xhr.status); };
    xhr.ontimeout = function () { callback(server, false); };
    xhr.onerror = function () { callback(server, false); };
    xhr.open('GET', url, true);
    xhr.send();
  }

  function updateServerStatusInSettings() {
    setTimeout(function () {
      var firstItem = $('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div');
      if (firstItem.text().trim() !== 'Свой вариант') return;

      servers.forEach(function (server, index) {
        var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + (index + 2) + ') > div';
        var element = $(selector);
        if (element.text().trim() !== server.name) return;

        if (isAlwaysOnline(server)) {
          element.html('✓&nbsp;&nbsp;' + server.name).css('color', COLOR_OK);
          return;
        }

        checkServerStatus(server, function (srv, ok, status) {
          if (ok) {
            element.html('✓&nbsp;&nbsp;' + srv.name).css('color', COLOR_OK);
          } else {
            var color = status === 401 ? COLOR_AUTH : COLOR_FAIL;
            element.html('✗&nbsp;&nbsp;' + srv.name).css('color', color);
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
      name: '<div class="settings-folder" style="padding:0!important">'
        + '<div style="width:1.3em;height:1.3em;padding-right:.1em">' + PARSER_ICON + '</div>'
        + '<div style="font-size:1.0em">'
        + '<div style="padding: 0.3em 0.3em; padding-top: 0;">'
        + '<div style="background: #1a7fd4; padding: 0.5em; border-radius: 0.4em;">'
        + '<div style="line-height: 0.3;">Выбрать парсер</div>'
        + '</div></div></div></div>',
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
      checkServerStatus(server, function (srv, ok) {
        srv._online = ok;
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

  var parserButtonRetryInterval = null;

  function scheduleParserButtonAfterChange() {
    if (parserButtonRetryInterval) clearInterval(parserButtonRetryInterval);
    var attempts = 0;
    var maxAttempts = 40; // 40 * 400ms = 16 сек

    parserButtonRetryInterval = setInterval(function () {
      addParserFilterButton();
      attempts++;
      if (document.querySelector('.filter--parser') || attempts >= maxAttempts) {
        clearInterval(parserButtonRetryInterval);
        parserButtonRetryInterval = null;
      }
    }, 400);
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
      syncModalFontJ();
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
        }
      });
    });
  }

  var emptyObserver = null;

  function startEmptyObserver() {
    stopEmptyObserver();
    emptyObserver = new MutationObserver(rafThrottle(function () {
      if ($('.empty__title').length && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
        showServerSwitchMenu();
        stopEmptyObserver();
      }
    }));
    emptyObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopEmptyObserver() {
    if (emptyObserver) {
      emptyObserver.disconnect();
      emptyObserver = null;
    }
  }

  var parserButtonObserver = null;

  function startParserButtonObserver() {
    if (parserButtonObserver) return;
    parserButtonObserver = new MutationObserver(rafThrottle(function () {
      var active = Lampa.Activity.active();
      if (!active || active.component !== 'torrents') return;
      if (document.querySelector('.torrent-filter') && !document.querySelector('.filter--parser')) {
        addParserFilterButton();
      }
    }));
    parserButtonObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopParserButtonObserver() {
    if (parserButtonObserver) {
      parserButtonObserver.disconnect();
      parserButtonObserver = null;
    }
  }
  
  Lampa.Storage.listener.follow('change', function (e) {
    if (e.name === 'parser_torrent_type') {
      var el = $('div[data-name="jackett_urltwo"]');
      if (e.value !== 'jackett') el.hide();
      else el.show().insertAfter('div[data-name="parser_torrent_type"]');
    }

    if (e.name === 'activity') {
      var active = Lampa.Activity.active();
      if (active && active.component === 'torrents') {
        startEmptyObserver();
        startParserButtonObserver();
        setTimeout(addParserFilterButton, 100);
        setTimeout(addParserFilterButton, 800);
      } else {
        stopEmptyObserver();
        stopParserButtonObserver();
      }
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
