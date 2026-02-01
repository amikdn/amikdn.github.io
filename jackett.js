(function () {
  'use strict';

  Lampa.Platform.tv();

  // Включаем парсер по умолчанию
  Lampa.Storage.set('parser_use', true);

  // Список предустановленных Jackett-серверов
  var servers = [
    {
      id: 'lampa_jackett',
      name: 'Lampa Jackett',
      baseUrl: '87.120.84.218:8443',
      key: '777',
      interview: 'all',
      lang: 'df',
    },
    {
      id: 'jacred_xyz',
      name: 'Jacred.xyz',
      baseUrl: 'www.jacred.xyz',
      key: '',
      interview: 'healthy',
      lang: 'lg',
    },
    {
      id: 'jr_maxvol_pro',
      name: 'Jacred Maxvol Pro',
      baseUrl: 'jr.maxvol.pro',
      key: '',
      interview: 'healthy',
      lang: 'df',
    },
    {
      id: 'jacred_ru',
      name: 'Jacred RU',
      baseUrl: 'jac-red.ru',
      key: '',
      interview: 'all',
      lang: 'lg',
    },
    {
      id: 'jacred_pro',
      name: 'RU Jacred Pro',
      baseUrl: 'ru.jacred.pro',
      key: '',
      interview: 'all',
      lang: 'lg',
    },
    {
      id: 'freebie_tom_ru',
      name: 'Freebie',
      baseUrl: 'jacred.freebie.tom.ru',
      key: '1',
      interview: 'all',
      lang: 'lg',
    },
    {
      id: 'jac_black',
      name: 'Jac Black',
      baseUrl: 'jacblack.ru:9117',
      key: '',
      interview: 'all',
      lang: 'lg',
    },
  ];

  // Применение конфигурации выбранного сервера
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

    var server = servers.find(s => s.id === selected);
    if (server) {
      Lampa.Storage.set('jackett_url', server.baseUrl);
      Lampa.Storage.set('jackett_key', server.key);
      Lampa.Storage.set('jackett_interview', server.interview);
      Lampa.Storage.set('parse_in_search', true);
      Lampa.Storage.set('parse_lang', server.lang);
    }
  }

  // Проверка статуса сервера (freebie_tom_ru всегда считается рабочим)
  function checkServerStatus(server, callback) {
    if (server.id === 'freebie_tom_ru') {
      callback(server, true, 200);
      return;
    }
    var protocol = server.baseUrl === 'jr.maxvol.pro' ? 'https://' : 'http://';
    var url = `${protocol}${server.baseUrl}/api/v2.0/indexers/status:healthy/results?apikey=${server.key}`;

    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.open('GET', url, true);
    xhr.send();

    xhr.ontimeout = xhr.onerror = () => callback(server, false);
    xhr.onload = () => callback(server, xhr.status === 200, xhr.status);
  }

  // Обновление индикаторов статуса в списке выбора (в настройках)
  function updateServerStatusInSettings() {
    setTimeout(() => {
      // Первый пункт — "Свой вариант"
      if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text().trim() !== 'Свой вариант') {
        return;
      }

      servers.forEach((server, index) => {
        var selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;
        var element = $(selector);

        if (element.text().trim() === server.name) {
          if (server.id === 'freebie_tom_ru') {
            element.html('✓&nbsp;&nbsp;' + server.name).css('color', '64e364');
            return;
          }
          checkServerStatus(server, (srv, ok, status) => {
            if (ok) {
              element.html('✓&nbsp;&nbsp;' + srv.name).css('color', '64e364');
            } else {
              var color = status === 401 ? '000' : 'ff2121';
              element.html('✗&nbsp;&nbsp;' + srv.name).css('color', color);
            }
          });
        }
      });
    }, 1000);
  }

  // Добавление параметра выбора сервера в настройки парсера
  var selectValues = { no_parser: 'Свой вариант' };
  servers.forEach(s => (selectValues[s.id] = s.name));

  Lampa.SettingsApi.addParam({
    component: 'parser',
    param: {
      name: 'jackett_urltwo',
      type: 'select',
      values: selectValues,
      default: 'jacred_xyz',
    },
    field: {
      name: `<div class="settings-folder" style="padding:0!important">
        <div style="width:1.3em;height:1.3em;padding-right:.1em">
          <svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <polygon fill="#074761" points="187.305,27.642 324.696,27.642 256,236.716"/>
            <polygon fill="#10BAFC" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"/>
            <polygon fill="#0084FF" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"/>
            <polygon fill="#0084FF" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"/>
            <polygon fill="#10BAFC" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"/>
            <polygon fill="#0084FF" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"/>
            <polygon fill="#0084FF" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"/>
            <path fill="#000000" d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"/>
            <path fill="#000000" d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"/>
            <path fill="#000000" d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"/>
            <path fill="#000000" d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"/>
            <path fill="#000000" d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"/>
            <path fill="#000000" d="M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075 c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858 c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371 C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795 c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507 l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795 L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123 h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242 L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484 l89.627,82.578L245.552,473.907L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666 c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484 c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132 l36.268-111.136l48.515,319.89L452.882,438.59z"/>
            <path fill="#000000" d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"/>
          </svg>
        </div>
        <div style="font-size:1.0em">
          <div style="padding: 0.3em 0.3em; padding-top: 0;">
            <div style="background: #1a7fd4; padding: 0.5em; border-radius: 0.4em;">
              <div style="line-height: 0.3;">Выбрать парсер</div>
            </div>
          </div>
        </div>
      </div>`,
      description: 'Нажмите для выбора парсера из списка',
    },
    onChange: () => {
      applyServerConfig();
      Lampa.Settings.update();
    },
    onRender: (element) => {
      setTimeout(() => {
        // Обновляем статус при открытии списка
        $('div[data-children="parser"]').on('hover:enter', () => Lampa.Settings.update());

        // Скрываем ручные поля при выборе предустановки
        if (localStorage.getItem('jackett_urltwo') !== 'no_parser') {
          $('div[data-name="jackett_url"]').hide();
          $('div[data-name="jackett_key"]').hide();
          Lampa.Controller.toggle('settings_component');
        }

        // Показываем только при включённом Jackett
        if (Lampa.Storage.field('parser_use') && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
          element.show();
          $('.settings-param__name', element).css('color', 'ffffff');
          $('div[data-name="jackett_urltwo"]').insertAfter('div[data-name="parser_torrent_type"]');
        } else {
          element.hide();
        }
      }, 5);
    },
  });

  // Удаляем дубли при открытии настроек
  Lampa.Settings.listener.follow('open', (e) => {
    if (e.name === 'parser') {
      e.body.find('[data-name="jackett_url2"], [data-name="jackett_url_two"]').remove();
    }
  });

  // Добавление кнопки "Парсер" в фильтры торрентов
  function addParserFilterButton() {
    if (document.querySelector('.filter--parser')) return;

    var button = document.createElement('div');
    button.className = 'simple-button simple-button--filter selector filter--parser';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <!-- Тот же SVG, что и выше -->
        <polygon fill="#074761" points="187.305,27.642 324.696,27.642 256,236.716"/>
        <polygon fill="#10BAFC" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"/>
        <polygon fill="#0084FF" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"/>
        <polygon fill="#0084FF" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"/>
        <polygon fill="#10BAFC" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"/>
        <polygon fill="#0084FF" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"/>
        <polygon fill="#0084FF" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"/>
        <path fill="#000000" d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"/>
        <path fill="#000000" d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"/>
        <path fill="#000000" d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"/>
        <path fill="#000000" d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"/>
        <path fill="#000000" d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"/>
        <path fill="#000000" d="M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075 c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858 c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371 C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795 c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507 l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795 L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123 h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242 L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484 l89.627,82.578L245.552,473.907L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666 c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484 c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132 l36.268-111.136l48.515,319.89L452.882,438.59z"/>
        <path fill="#000000" d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"/>
      </svg>
      <div id="current-parser-name">${getCurrentParserName()}</div>
    `;

    $(button).on('hover:enter', showServerSwitchMenu);

    var filterContainer = document.querySelector('.torrent-filter');
    if (filterContainer) {
      var sortButton = filterContainer.querySelector('.filter--sort');
      sortButton ? filterContainer.insertBefore(button, sortButton) : filterContainer.appendChild(button);
    }
  }

  // Текущее название парсера для кнопки
  function getCurrentParserName() {
    var selected = Lampa.Storage.get('jackett_urltwo');
    if (selected === 'no_parser') return 'Свой';
    var server = servers.find(s => s.id === selected);
    return server ? server.name : 'Не выбран';
  }

  // Проверка статуса всех серверов для меню (freebie_tom_ru всегда зелёный)
  async function checkAllServers() {
    return Promise.all(servers.map(server =>
      new Promise(resolve => {
        checkServerStatus(server, (srv, ok) => {
          srv.title = ok
            ? `<span style="color:#64e364">✓&nbsp;&nbsp;${srv.name}</span>`
            : `<span style="color:#ff2121">✗&nbsp;&nbsp;${srv.name}</span>`;
          resolve(srv);
        });
      })
    ));
  }

  // Общие данные для меню смены парсера (overrideTitle — для строки «Проверка... имя»)
  function getServerSelectItem(s, overrideTitle) {
    return {
      title: overrideTitle !== undefined ? overrideTitle : (s.title || s.name),
      url: s.baseUrl,
      url_two: s.id,
      jac_key: s.key,
      jac_int: s.interview,
      jac_lang: s.lang,
    };
  }

  // Несколько попыток добавить кнопку парсера после смены парсера (список торрентов обновляется асинхронно)
  function scheduleParserButtonAfterChange() {
    var delays = [2000, 3000, 4000, 5000, 6000, 8000];
    delays.forEach(function (delay) {
      setTimeout(addParserFilterButton, delay);
    });
  }

  // Меню смены парсера: та же логика, что в настройках — сначала окно, затем проверка парсеров
  async function showServerSwitchMenu() {
    var currentActivity = Lampa.Storage.get('activity');

    var showCheckedList = function (checkedServers) {
      Lampa.Select.show({
        title: 'Меню смены парсера',
        items: checkedServers.map(function (s) { return getServerSelectItem(s); }),
        onBack: function () { Lampa.Controller.toggle(Lampa.Controller.enabled().name); },
        onSelect: function (item) {
          Lampa.Storage.set('jackett_url', item.url);
          Lampa.Storage.set('jackett_urltwo', item.url_two);
          Lampa.Storage.set('jackett_key', item.jac_key);
          Lampa.Storage.set('jackett_interview', item.jac_int);
          Lampa.Storage.set('parse_lang', item.jac_lang);
          Lampa.Storage.set('parse_in_search', true);

          var nameEl = document.getElementById('current-parser-name');
          if (nameEl) nameEl.textContent = getCurrentParserName();

          setTimeout(function () { window.history.back(); }, 1000);
          setTimeout(function () { Lampa.Activity.push(currentActivity); }, 2000);
          scheduleParserButtonAfterChange();
        },
      });
    };

    // Та же логика, что и в настройках парсера: сначала окно, затем проверка
    // Сразу показываем окно со списком парсеров (без статусов)
    Lampa.Select.show({
      title: 'Меню смены парсера',
      items: servers.map(function (s) { return getServerSelectItem(s, 'Проверка... ' + s.name); }),
      onBack: function () { Lampa.Controller.toggle(Lampa.Controller.enabled().name); },
      onSelect: function (item) {
        Lampa.Storage.set('jackett_url', item.url);
        Lampa.Storage.set('jackett_urltwo', item.url_two);
        Lampa.Storage.set('jackett_key', item.jac_key);
        Lampa.Storage.set('jackett_interview', item.jac_int);
        Lampa.Storage.set('parse_lang', item.jac_lang);
        Lampa.Storage.set('parse_in_search', true);

        var nameEl = document.getElementById('current-parser-name');
        if (nameEl) nameEl.textContent = getCurrentParserName();

        setTimeout(function () { window.history.back(); }, 1000);
        setTimeout(function () { Lampa.Activity.push(currentActivity); }, 2000);
        scheduleParserButtonAfterChange();
      },
    });

    var checkedServers = await checkAllServers();
    showCheckedList(checkedServers);
  }

  // Observer для показа меню при пустом результате поиска торрентов
  var emptyObserver = null;

  function startEmptyObserver() {
    stopEmptyObserver();
    emptyObserver = new MutationObserver(function () {
      if ($('.empty__title').length && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
        showServerSwitchMenu();
        stopEmptyObserver();
      }
    });
    emptyObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopEmptyObserver() {
    if (emptyObserver) {
      emptyObserver.disconnect();
      emptyObserver = null;
    }
  }

  // Observer: если на экране торрентов есть .torrent-filter, но нет кнопки парсера — добавить кнопку
  var parserButtonObserver = null;

  function startParserButtonObserver() {
    if (parserButtonObserver) return;
    parserButtonObserver = new MutationObserver(function () {
      if (Lampa.Activity.active().component !== 'torrents') return;
      if (document.querySelector('.torrent-filter') && !document.querySelector('.filter--parser')) {
        addParserFilterButton();
      }
    });
    parserButtonObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopParserButtonObserver() {
    if (parserButtonObserver) {
      parserButtonObserver.disconnect();
      parserButtonObserver = null;
    }
  }

  // Реакция на изменения
  Lampa.Storage.listener.follow('change', (e) => {
    // Показ/скрытие параметра
    if (e.name === 'parser_torrent_type') {
      var el = $('div[data-name="jackett_urltwo"]');
      if (e.value !== 'jackett') el.hide();
      else el.show().insertAfter('div[data-name="parser_torrent_type"]');
    }

    // Вход в торренты — добавляем кнопку и observers (кнопка не пропадает после смены парсера)
    if (e.name === 'activity') {
      if (Lampa.Activity.active().component === 'torrents') {
        startEmptyObserver();
        startParserButtonObserver();
        setTimeout(addParserFilterButton, 100);
        setTimeout(addParserFilterButton, 800);
      } else {
        stopEmptyObserver();
        stopParserButtonObserver();
      }
    }

    // Обновляем название кнопки
    if (e.name === 'jackett_urltwo') {
      var nameEl = document.getElementById('current-parser-name');
      if (nameEl) nameEl.textContent = getCurrentParserName();
    }
  });

  // Обновление статуса в настройках
  Lampa.Controller.listener.follow('toggle', (e) => {
    if (e.name === 'select') {
      setTimeout(updateServerStatusInSettings, 10);
    }
  });

  // Дефолтные настройки при первом запуске
  var initInterval = setInterval(() => {
    if (typeof Lampa !== 'undefined') {
      clearInterval(initInterval);
      if (!Lampa.Storage.get('jack', false)) {
        Lampa.Storage.set('jack', true);
        Lampa.Storage.set('jackett_url', 'www.jacred.xyz');
        Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('jackett_key', '');
        Lampa.Storage.set('jackett_interview', 'healthy');
        Lampa.Storage.set('parse_lang', 'lg');
      }
    }
  }, 100);

  // Запуск при готовности приложения
  if (window.appready) {
    // Инициализация
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        // Инициализация
      }
    });
  }
})();
