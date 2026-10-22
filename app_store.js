(function () {
  'use strict';

  var BASE_URL = 'https://file.maxvol.pro/';
  var BUTTON_ID = 'apk_installer_btn';
  var STYLE_ID = 'apk_installer_style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.apk-list { display: flex; flex-direction: column; gap: 0.5em; max-height: 70vh; overflow-y: auto; padding: 0.5em; }',
      '.apk-item { display: flex; align-items: center; justify-content: space-between; padding: 0.8em 1.2em; background: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 0.5em; cursor: pointer; color: #fff; }',
      '.apk-item.focus { background: #3a3a3a; border-color: #ff9800; }',
      '.apk-name { font-weight: 600; font-size: 1.1em; word-break: break-all; }',
      '.apk-size { opacity: 0.6; font-size: 0.9em; margin-left: 1em; flex-shrink: 0; }'
    ].join('');
    document.head.appendChild(style);
  }

  function downloadApk(url, name) {
    Lampa.Noty.show('Запуск загрузки: ' + name);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function openModal(files) {
    injectStyle();
    var body = $('<div class="apk-list"></div>');

    files.forEach(function (file) {
      var item = $(
        '<div class="apk-item selector">' +
          '<span class="apk-name">' + file.name + '</span>' +
          '<span class="apk-size">' + file.size + '</span>' +
        '</div>'
      );

      item.on('hover:enter', function () {
        downloadApk(file.url, file.name);
      });

      body.append(item);
    });

    Lampa.Modal.open({
      title: 'Установщик APK',
      html: body,
      size: 'medium',
      mask: true,
      onBack: function () {
        Lampa.Modal.close();
        Lampa.Controller.toggle('content');
      }
    });
  }

  function parseHtml(html) {
    var files = [];
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var rows = doc.querySelectorAll('table tr, tbody tr');

    if (!rows.length) {
      var links = doc.querySelectorAll('a[href$=".apk"]');
      links.forEach(function (a) {
        var href = a.getAttribute('href');
        files.push({
          name: a.textContent.trim() || href,
          size: '',
          url: href.indexOf('http') === 0 ? href : BASE_URL + href.replace(/^\/+/, '')
        });
      });
      return files;
    }

    rows.forEach(function (tr) {
      var a = tr.querySelector('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href.toLowerCase().endsWith('.apk')) return;

      var text = a.textContent.trim();
      var cells = tr.querySelectorAll('td');
      var size = cells.length > 1 ? cells[1].textContent.trim() : '';

      files.push({
        name: text || href,
        size: size,
        url: href.indexOf('http') === 0 ? href : BASE_URL + href.replace(/^\/+/, '')
      });
    });

    return files;
  }

  function loadApkList() {
    Lampa.Loading.start(function () {
      Lampa.Loading.stop();
    });

    var net = new Lampa.Reguest();
    net.timeout(10000);
    net.native(
      BASE_URL,
      function (html) {
        Lampa.Loading.stop();
        var files = parseHtml(html);
        if (!files.length) {
          Lampa.Noty.show('APK файлы не найдены');
          return;
        }
        openModal(files);
      },
      function () {
        Lampa.Loading.stop();
        Lampa.Noty.show('Ошибка загрузки списка файлов');
      },
      false,
      { dataType: 'text' }
    );
  }

  function addHeaderButton() {if ($('#' + BUTTON_ID).length) return;

    var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.4em;height:1.4em;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    var btn = $('<div id="' + BUTTON_ID + '" class="head__action selector" title="Установщик APK">' + icon + '</div>');

    btn.on('hover:enter', function () {
      loadApkList();
    });

    var actions = $('.head__actions');
    if (actions.length) {
      actions.prepend(btn);
    }
  }

  function start() {
    addHeaderButton();
    setInterval(addHeaderButton, 2000);
  }

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }
})();
