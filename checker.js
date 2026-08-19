(function () {
  'use strict';

  if (window.nova_checker) return;
  window.nova_checker = true;

  var VERSION = '2.0';
  var PORT_DEFAULT = '8090';

  var COMMON = [
    '192.168.1', '192.168.0', '192.168.2', '192.168.3', '192.168.4',
    '192.168.8', '192.168.10', '192.168.11', '192.168.31', '192.168.50',
    '192.168.88', '192.168.100', '192.168.178',
    '10.0.0', '10.0.1', '10.1.1', '172.16.0'
  ];

  var QUICK = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 15, 20, 25, 30, 33, 50, 64, 100, 101, 102, 105, 110, 150, 177, 200, 250, 254];

  var CSS = [
    '.nova-ck{padding:.2em .2em 1em}',
    '.nova-ck__card{background:rgba(255,255,255,.06);border-radius:1em;padding:1.1em 1.2em}',
    '.nova-ck__state{font-size:1.25em;font-weight:600;color:#fff}',
    '.nova-ck__sub{margin-top:.35em;font-size:.95em;color:#b9bac6;min-height:1.2em}',
    '.nova-ck__bar{position:relative;height:.42em;margin-top:.9em;border-radius:1em;background:rgba(255,255,255,.12);overflow:hidden}',
    '.nova-ck__bar>i{display:block;height:100%;width:0;background:#fff;border-radius:1em;transition:width .2s linear}',
    '.nova-ck__bar.is-idle{display:none}',
    '.nova-ck__note{display:flex;align-items:center;gap:.5em;padding:1em .3em .3em;color:#aeb0c8;font-size:.82em;font-weight:600;text-transform:uppercase;letter-spacing:.06em}',
    '.nova-ck__note::before{content:"";width:.32em;height:1em;border-radius:.2em;background:#fff}',
    '.nova-ck__item{display:flex;align-items:center;gap:.9em;padding:.85em 1.1em;margin:.4em 0;border-radius:1em;background:rgba(255,255,255,.06);color:#fff}',
    '.nova-ck__item.focus{background:#fff;color:#000}',
    '.nova-ck__body{flex:1 1 auto;min-width:0}',
    '.nova-ck__ip{font-size:1.05em;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nova-ck__ver{margin-top:.2em;font-size:.85em;color:#b9bac6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nova-ck__item.focus .nova-ck__ver{color:rgba(0,0,0,.6)}',
    '.nova-ck__tag{flex:0 0 auto;padding:.22em .62em;border-radius:.5em;font-size:.75em;font-weight:700;background:rgba(255,255,255,.2)}',
    '.nova-ck__item.focus .nova-ck__tag{background:rgba(0,0,0,.14)}',
    '.nova-ck__tag--live{background:#2ecc71;color:#06331a}',
    '.nova-ck__tag--now{background:#ffd166;color:#3a2a00}',
    '.nova-ck__empty{padding:.7em .3em;color:#b9bac6;font-size:.95em;line-height:1.45}',
    '.nova-ck__hint{margin-top:.9em;padding:.9em 1.1em;border-radius:1em;background:rgba(255,255,255,.05);color:#b9bac6;font-size:.9em;line-height:1.45}',
    '.nova-ck__hint:empty{display:none}',
    '.nova-ck-ico{width:1.8em;height:1.3em;padding-right:.5em}'
  ].join('');

  function style() {
    if (document.getElementById('nova-ck-style')) return;
    var node = document.createElement('style');
    node.id = 'nova-ck-style';
    node.textContent = CSS;
    (document.body || document.head).appendChild(node);
  }

  function get(key, def) {
    try {
      return Lampa.Storage.get(key, def);
    } catch (e) {
      return def;
    }
  }

  function set(key, value) {
    try {
      Lampa.Storage.set(key, value);
    } catch (e) {}
  }

  function noty(text) {
    try {
      Lampa.Noty.show(text);
    } catch (e) {}
  }

  function isTv() {
    try {
      return Lampa.Platform.screen('tv');
    } catch (e) {
      return false;
    }
  }

  function android() {
    try {
      return Lampa.Platform.is('android') && typeof AndroidJS !== 'undefined' && !!Lampa.Reguest;
    } catch (e) {
      return false;
    }
  }

  function localOrigin() {
    var host = '' + window.location.hostname;

    if (window.location.protocol === 'file:') return true;
    if (!host || host === 'localhost' || host === '127.0.0.1') return true;

    return privateIp(host);
  }

  function walled() {
    return !android() && (!localOrigin() || window.location.protocol === 'https:');
  }

  function ports() {
    var raw = ('' + get('nova_ck_port', PORT_DEFAULT)).replace(/\s+/g, '');
    var out = [];

    raw.split(',').forEach(function (part) {
      var num = parseInt(part, 10);
      if (num > 0 && num < 65536 && out.indexOf(num) === -1) out.push(num);
    });

    if (!out.length) out.push(parseInt(PORT_DEFAULT, 10));
    return out;
  }

  function privateIp(host) {
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test('' + host)) return false;

    var part = ('' + host).split('.');
    var a = parseInt(part[0], 10);
    var b = parseInt(part[1], 10);

    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
  }

  function hostOf(url) {
    var text = ('' + (url == null ? '' : url)).replace(/^\w+:\/\//, '');
    return text.split('/')[0].split(':')[0];
  }

  function subnetOf(ip) {
    var part = ('' + ip).split('.');
    return part.length === 4 ? part.slice(0, 3).join('.') : '';
  }

  function webrtcIps(done) {
    var RTC = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    if (!RTC) return done([]);

    var found = [];
    var over = false;
    var pc = null;

    function collect(text) {
      var rx = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
      var hit;
      while ((hit = rx.exec('' + text)) !== null) {
        if (privateIp(hit[1]) && found.indexOf(hit[1]) === -1) found.push(hit[1]);
      }
    }

    function finish() {
      if (over) return;
      over = true;
      try {
        if (pc && pc.localDescription) collect(pc.localDescription.sdp);
      } catch (e) {}
      try {
        if (pc) pc.close();
      } catch (e) {}
      done(found);
    }

    try {
      pc = new RTC({ iceServers: [] });
      pc.onicecandidate = function (e) {
        if (!e || !e.candidate) return finish();
        collect(e.candidate.candidate);
      };
      if (pc.createDataChannel) pc.createDataChannel('nova');
      pc.createOffer().then(function (offer) {
        collect(offer.sdp);
        return pc.setLocalDescription(offer);
      })['catch'](function () {});
    } catch (e) {
      return finish();
    }

    setTimeout(finish, 1500);
  }

  function hints(done) {
    var list = [];

    function push(host) {
      if (privateIp(host) && list.indexOf(host) === -1) list.push(host);
    }

    push(hostOf(get('torrserver_url', '')));
    push(hostOf(get('torrserver_url_two', '')));
    push(hostOf(window.location.hostname));

    webrtcIps(function (ips) {
      ips.forEach(push);
      done(list);
    });
  }

  function plan(hintList, deep) {
    var jobs = [];
    var seen = {};
    var portList = ports();
    var near = [];
    var rest = [];

    function add(ip) {
      for (var i = 0; i < portList.length; i++) {
        var key = ip + ':' + portList[i];
        if (seen[key]) continue;
        seen[key] = true;
        jobs.push({ ip: ip, port: portList[i] });
      }
    }

    function range(net) {
      for (var host = 1; host <= 254; host++) add(net + '.' + host);
    }

    add('127.0.0.1');
    add('localhost');

    var manual = '' + get('nova_ck_subnet', 'auto');

    if (manual !== 'auto') {
      range(manual);
      return jobs;
    }

    hintList.forEach(function (ip) {
      add(ip);
      var net = subnetOf(ip);
      if (net && near.indexOf(net) === -1) near.push(net);
    });

    if (!near.length) near.push('192.168.1', '192.168.0');

    COMMON.forEach(function (net) {
      if (near.indexOf(net) === -1) rest.push(net);
    });

    near.forEach(range);

    rest.forEach(function (net) {
      if (deep) range(net);
      else QUICK.forEach(function (host) {
        add(net + '.' + host);
      });
    });

    return jobs;
  }

  var run = null;

  function stop() {
    if (!run) return;
    run.cancelled = true;
    run.aborts.forEach(function (ctrl) {
      try {
        ctrl.abort();
      } catch (e) {}
    });
    run.aborts = [];
    run = null;
  }

  function viaNative(url, timeout, done) {
    var net = null;
    var over = false;
    var timer = null;

    function finish(open) {
      if (over) return;
      over = true;
      clearTimeout(timer);
      try {
        if (net) net.clear();
      } catch (e) {}
      done(open);
    }

    timer = setTimeout(function () {
      finish(false);
    }, timeout + 600);

    try {
      net = new Lampa.Reguest();
      net.timeout(timeout);
      net.native(url, function () {
        finish(true);
      }, function (a) {
        finish(!!(a && a.status));
      }, false, { dataType: 'text' });
    } catch (e) {
      finish(false);
    }
  }

  function probe(job, timeout, aborts, done) {
    var url = 'http://' + job.ip + ':' + job.port + '/';
    var over = false;
    var timer = null;

    function finish(open) {
      if (over) return;
      over = true;
      clearTimeout(timer);
      done(open);
    }

    if (android()) return viaNative(url, timeout, done);

    if (window.fetch && window.AbortController) {
      var ctrl = new AbortController();
      aborts.push(ctrl);

      timer = setTimeout(function () {
        try {
          ctrl.abort();
        } catch (e) {}
        finish(false);
      }, timeout);

      fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: ctrl.signal
      }).then(function () {
        finish(true);
      })['catch'](function () {
        finish(false);
      });

      return;
    }

    var xhr = new XMLHttpRequest();

    timer = setTimeout(function () {
      try {
        xhr.abort();
      } catch (e) {}
      finish(false);
    }, timeout);

    xhr.onload = function () {
      finish(true);
    };
    xhr.onerror = function () {
      finish(false);
    };

    try {
      xhr.open('GET', url, true);
      xhr.send();
    } catch (e) {
      finish(false);
    }
  }

  function torrText(text) {
    var clean = ('' + (text == null ? '' : text)).replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    if (clean.length > 40 || clean.indexOf('<') !== -1) return '';
    return 'TorrServer ' + clean;
  }

  function verify(job, done) {
    var url = 'http://' + job.ip + ':' + job.port;

    if (android()) {
      var net = null;
      var closed = false;

      var guard = setTimeout(function () {
        if (closed) return;
        closed = true;
        done('');
      }, 3000);

      try {
        net = new Lampa.Reguest();
        net.timeout(2500);
        net.native(url + '/echo', function (data) {
          if (closed) return;
          closed = true;
          clearTimeout(guard);
          done(torrText(data) || 'TorrServer');
        }, function () {
          if (closed) return;
          closed = true;
          clearTimeout(guard);
          done('');
        }, false, { dataType: 'text' });
      } catch (e) {
        if (!closed) {
          closed = true;
          clearTimeout(guard);
          done('');
        }
      }
      return;
    }

    if (!window.fetch || walled()) return done('');

    var over = false;

    var timer = setTimeout(function () {
      if (over) return;
      over = true;
      done('');
    }, 3000);

    function finish(text) {
      if (over) return;
      over = true;
      clearTimeout(timer);
      done(text || '');
    }

    function bySettings() {
      fetch(url + '/settings', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({ action: 'get' })
      }).then(function (res) {
        return res.json();
      }).then(function (json) {
        finish(json && typeof json.CacheSize !== 'undefined' ? 'TorrServer' : '');
      })['catch'](function () {
        finish('');
      });
    }

    fetch(url + '/echo', { method: 'GET', cache: 'no-store' })
      .then(function (res) {
        return res.text();
      })
      .then(function (text) {
        var label = torrText(text);
        if (!label) return bySettings();
        finish(label);
      })['catch'](bySettings);
  }

  function current() {
    var use = get('torrserver_use_link', 'one');
    var one = get('torrserver_url', '');
    var two = get('torrserver_url_two', '');
    return (use === 'two' ? two || one : one || two) || '';
  }

  function apply(item, auto) {
    var url = 'http://' + item.ip + ':' + item.port;

    set('torrserver_url_two', url);
    set('torrserver_use_link', 'two');

    try {
      Lampa.Settings.update();
    } catch (e) {}

    noty((auto ? 'TorrServer найден: ' : 'TorrServer выбран: ') + url);
  }

  function scan(deep, ui) {
    stop();

    var state = {
      cancelled: false,
      applied: false,
      aborts: [],
      found: [],
      done: 0,
      total: 0,
      instant: 0
    };

    run = state;
    ui.start(deep);

    hints(function (hintList) {
      if (state.cancelled) return;

      var jobs = plan(hintList, deep);
      var pool = isTv() ? 14 : 28;
      var timeout = isTv() ? 1800 : 1200;
      var index = 0;
      var active = 0;

      state.total = jobs.length;
      ui.progress(state);

      if (!jobs.length) return ui.finish(state);

      function hit(job) {
        var key = job.ip + ':' + job.port;

        for (var i = 0; i < state.found.length; i++) {
          if (state.found[i].key === key) return;
        }

        var item = { key: key, ip: job.ip, port: job.port, version: '' };
        state.found.push(item);
        ui.found(item);

        verify(job, function (version) {
          if (state.cancelled) return;

          item.version = version;
          ui.update(item);

          if (version && !state.applied && get('nova_ck_auto', true) === true) {
            state.applied = true;
            apply(item, true);
            ui.update(item);
          }
        });
      }

      function next() {
        while (!state.cancelled && active < pool && index < jobs.length) {
          active++;

          (function (job, started) {
            probe(job, timeout, state.aborts, function (open) {
              if (state.cancelled) return;

              active--;
              state.done++;

              if (open) hit(job);
              else if (Date.now() - started < 25) state.instant++;

              ui.progress(state);

              if (state.done >= jobs.length) return ui.finish(state);
              next();
            });
          })(jobs[index], Date.now());

          index++;
        }
      }

      next();
    });
  }

  function itemNode(item) {
    var node = $(
      '<div class="nova-ck__item selector">' +
      '<div class="nova-ck__body">' +
      '<div class="nova-ck__ip"></div>' +
      '<div class="nova-ck__ver"></div>' +
      '</div>' +
      '<div class="nova-ck__tag"></div>' +
      '</div>'
    );

    node.find('.nova-ck__ip').text(item.ip + ':' + item.port);
    return node;
  }

  function fillNode(node, item) {
    var now = current();
    var mine = now && hostOf(now) === item.ip;
    var tag = node.find('.nova-ck__tag');

    node.find('.nova-ck__ver').text(item.version || 'порт открыт, ответа TorrServer нет');
    tag.removeClass('nova-ck__tag--live nova-ck__tag--now');

    if (mine) tag.text('выбран').addClass('nova-ck__tag--now');
    else if (item.version) tag.text('готов').addClass('nova-ck__tag--live');
    else tag.text('?');
  }

  function diagnose(state) {
    if (state.found.length) return '';

    var blocked = state.total > 20 && state.instant > state.total * 0.8;

    if (walled() && blocked) {
      return 'Браузер блокирует запросы из сети в вашу локальную сеть (в консоли это видно как CORS error). Сам сервер тут ни при чём: Лампа открыта с адреса ' + window.location.host + ', и из такой страницы браузер вообще не даёт обращаться к 192.168.*. Локальный TorrServer там не заработает даже если вписать адрес вручную. Нужно открывать Лампу с локального адреса или из приложения (Android, Tizen, webOS): там ограничения нет.';
    }

    if (window.location.protocol === 'https:') {
      return 'Лампа открыта по https, а TorrServer работает по http: браузер режет такие запросы. Откройте Лампу по http.';
    }

    return 'Проверьте, что TorrServer запущен и слушает порт ' + ports().join(', ') + '. Если подсеть нестандартная, задайте её в настройках или укажите адрес вручную.';
  }

  function manual(after) {
    var start = current().replace(/^https?:\/\//, '');

    function save(value) {
      var text = ('' + (value == null ? '' : value)).replace(/\s+/g, '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
      if (!text) return;

      var host = text.split(':')[0];
      var port = text.split(':')[1] || ports()[0];

      apply({ ip: host, port: port });
      if (after) after();
    }

    try {
      Lampa.Input.edit({
        value: start,
        nomic: true,
        free: true
      }, save);
    } catch (e) {
      try {
        var typed = window.prompt('Адрес TorrServer', start || '192.168.1.1:8090');
        if (typed) save(typed);
      } catch (err) {}
    }
  }

  function open() {
    style();

    var box = $('<div class="nova-ck"></div>');
    var card = $(
      '<div class="nova-ck__card">' +
      '<div class="nova-ck__state"></div>' +
      '<div class="nova-ck__sub"></div>' +
      '<div class="nova-ck__bar"><i></i></div>' +
      '</div>'
    );
    var note = $('<div class="nova-ck__note">Найденные серверы</div>');
    var list = $('<div class="nova-ck__list"></div>');
    var empty = $('<div class="nova-ck__empty">Пока ничего не нашлось.</div>');
    var hint = $('<div class="nova-ck__hint"></div>');
    var nodes = {};

    list.append(empty);
    box.append(card).append(note).append(list).append(hint);

    function refocus() {
      try {
        var render = Lampa.Modal.scroll().render();
        var focused = render.find('.focus')[0];
        Lampa.Controller.collectionSet(render);
        if (focused) Lampa.Controller.collectionFocus(focused, render);
      } catch (e) {}
    }

    function back() {
      stop();
      try {
        Lampa.Modal.close();
        Lampa.Controller.toggle('settings_component');
      } catch (e) {}
    }

    var ui = {
      start: function (deep) {
        card.find('.nova-ck__state').text(deep ? 'Глубокий поиск…' : 'Ищу TorrServer…');
        card.find('.nova-ck__sub').text('Определяю вашу сеть');
        card.find('.nova-ck__bar').removeClass('is-idle').find('i').css('width', '0%');
        hint.text(walled() ? 'Лампа открыта с внешнего адреса, браузер может не пустить запросы в локальную сеть.' : '');
        list.empty().append(empty);
        nodes = {};
      },

      progress: function (state) {
        var percent = state.total ? Math.round((state.done / state.total) * 100) : 0;

        card.find('.nova-ck__bar i').css('width', percent + '%');
        card.find('.nova-ck__sub').text(
          'Проверено ' + state.done + ' из ' + state.total +
          (state.found.length ? '  ·  найдено ' + state.found.length : '')
        );
      },

      found: function (item) {
        empty.detach();

        var node = itemNode(item);
        fillNode(node, item);
        nodes[item.key] = node;

        node.on('hover:focus', function (e) {
          try {
            Lampa.Modal.scroll().update($(e.target), true);
          } catch (err) {}
        });

        node.on('hover:enter', function () {
          apply(item);
          back();
        });

        list.append(node);
        refocus();
      },

      update: function (item) {
        var node = nodes[item.key];
        if (node) fillNode(node, item);
      },

      finish: function (state) {
        card.find('.nova-ck__bar').addClass('is-idle');
        card.find('.nova-ck__state').text(
          state.found.length ? 'Найдено: ' + state.found.length : 'Ничего не нашлось'
        );
        card.find('.nova-ck__sub').text('Проверено адресов: ' + state.done);
        hint.text(diagnose(state));

        if (!state.found.length) list.append(empty);

        refocus();
        run = null;
      }
    };

    Lampa.Modal.open({
      title: 'Локальный TorrServer',
      html: box,
      size: 'medium',
      buttons: [
        {
          name: 'Искать снова',
          onSelect: function () {
            scan(false, ui);
          }
        },
        {
          name: 'Глубокий поиск',
          onSelect: function () {
            scan(true, ui);
          }
        },
        {
          name: 'Ввести адрес',
          onSelect: function () {
            manual(back);
          }
        }
      ],
      onBack: back
    });

    scan(false, ui);
  }

  var ICON = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M18.5 18.5L22 22" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>' +
    '<path d="M9 11.5H14M11.5 9V14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>' +
    '<path d="M6.75 3.27C8.15 2.46 9.77 2 11.5 2C16.75 2 21 6.25 21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 9.77 2.46 8.15 3.27 6.75" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>' +
    '</svg>';

  var ROW = '<div class="settings-folder" style="padding:0!important">' +
    '<div class="nova-ck-ico">' + ICON + '</div>' +
    '<div style="font-size:1.3em">Найти локальный TorrServer</div></div>';

  function subnetValues() {
    var values = { auto: 'Автоматически' };
    COMMON.forEach(function (net) {
      values[net] = net + '.*';
    });
    return values;
  }

  function settings() {
    Lampa.SettingsApi.addComponent({
      component: 'nova_checker',
      name: 'Локальный TorrServer',
      icon: ICON
    });

    Lampa.SettingsApi.addParam({
      component: 'server',
      param: {
        name: 'nova_ck_open',
        type: 'static'
      },
      field: {
        name: ROW
      },
      onRender: function (item) {
        setTimeout(function () {
          var anchor = $('div[data-name="torrserver_use_link"]');
          if (anchor.length) item.insertAfter(anchor);
        }, 0);

        item.on('hover:enter', function () {
          open();
        });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'nova_checker',
      param: {
        name: 'nova_ck_run',
        type: 'button'
      },
      field: {
        name: 'Найти сервер',
        description: 'Сканировать локальную сеть'
      },
      onRender: function (item) {
        item.on('hover:enter', function () {
          open();
        });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'nova_checker',
      param: {
        name: 'nova_ck_auto',
        type: 'trigger',
        default: true
      },
      field: {
        name: 'Подставлять автоматически',
        description: 'Первый подтверждённый сервер сразу прописывается в настройки'
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'nova_checker',
      param: {
        name: 'nova_ck_port',
        type: 'input',
        values: '',
        placeholder: PORT_DEFAULT,
        default: PORT_DEFAULT
      },
      field: {
        name: 'Порт',
        description: 'Можно несколько через запятую'
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'nova_checker',
      param: {
        name: 'nova_ck_subnet',
        type: 'select',
        values: subnetValues(),
        default: 'auto'
      },
      field: {
        name: 'Подсеть',
        description: 'По умолчанию определяется сама'
      }
    });
  }

  function startMe() {
    try {
      console.log('nova checker', VERSION);
    } catch (e) {}

    style();
    settings();
  }

  if (window.appready) startMe();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startMe();
    });
  }
})();
