;(function () {
  'use strict';

  Lampa.Platform.tv();

  // Включаем использование парсера по умолчанию
  Lampa.Storage.set('parser_use', true);

  // Список предустановленных Jackett-серверов
  const servers = [
    { id: 'jac_lampa32_ru',      title: 'LampaApp',                url: 'lampa.app',                  key: '',    interview: 'all',     lang: 'lg',  protocol: 'http', apikey: '' },
    { id: 'bylampa_jackett',     title: 'Lampa Jackett',           url: '62.60.149.237:8443',         key: '777', interview: 'all',     lang: 'df',  protocol: 'http', apikey: '777' },
    { id: 'jacred_xyz',          title: 'Jacred.xyz',              url: 'jacred.xyz',                 key: '',    interview: 'healthy', lang: 'lg',  protocol: 'http', apikey: '' },
    { id: 'jr_maxvol_pro',       title: 'Jacred Maxvol Pro',       url: 'jr.maxvol.pro',              key: '',    interview: 'healthy', lang: 'lg',  protocol: 'https', apikey: '' },
    { id: 'jacred_ru',           title: 'Jacred RU',               url: 'jac-red.ru',                 key: '',    interview: 'all',     lang: 'lg',  protocol: 'http', apikey: '' },
    { id: 'jacred_viewbox_dev',  title: 'Viewbox',                 url: 'jacred.viewbox.dev',         key: 'viewbox', interview: 'all', lang: 'lg',  protocol: 'http', apikey: '' },
    { id: 'jacred_pro',          title: 'Jacred Pro',              url: 'ru.jacred.pro',              key: '',    interview: 'all',     lang: 'lg',  protocol: 'http', apikey: '' },
    { id: 'jac_black',           title: 'Jac Black',               url: 'jacblack.ru:9117',           key: '',    interview: 'all',     lang: 'lg',  protocol: 'http', apikey: '' },
  ];

  // Применение выбранного предустановленного сервера
  function applyServerConfig() {
    const selected = Lampa.Storage.get('jackett_urltwo', 'jacred_xyz');

    if (selected === 'no_parser') {
      Lampa.Storage.set('jackett_url', '');
      Lampa.Storage.set('jackett_key', '');
      Lampa.Storage.set('jackett_interview', 'all');
      Lampa.Storage.set('parse_in_search', false);
      Lampa.Storage.set('parse_lang', 'lg');
      return;
    }

    const server = servers.find(s => s.id === selected);
    if (server) {
      Lampa.Storage.set('jackett_url', server.url);
      Lampa.Storage.set('jackett_key', server.key);
      Lampa.Storage.set('jackett_interview', server.interview);
      Lampa.Storage.set('parse_in_search', true);
      Lampa.Storage.set('parse_lang', server.lang);
    }
  }

  // Проверка статуса одного сервера и добавление индикатора (✓ / ✗)
  function checkServerStatus(server, index) {
    return new Promise((resolve) => {
      const protocol = server.protocol === 'https' ? 'https://' : 'http://';
      const url = `${protocol}${server.url}/api/v2.0/indexers/status:healthy/results?apikey=${server.apikey}`;

      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 3000;

      xhr.onload = () => {
        if (xhr.status === 200) {
          server.title = `<span style="color:#64e364">✓&nbsp;&nbsp;${server.title}</span>`;
        } else {
          server.title = `<span style="color:#ff2121">✗&nbsp;&nbsp;${server.title}</span>`;
        }
        resolve(server);
      };

      xhr.onerror = xhr.ontimeout = () => {
        server.title = `<span style="color:#ff2121">✗&nbsp;&nbsp;${server.title}</span>`;
        resolve(server);
      };

      xhr.send();
    });
  }

  // Проверка статуса всех серверов в списке выбора (в настройках парсера)
  function updateServerStatusInSettings() {
    setTimeout(() => {
      // Первый пункт всегда "Свой вариант" — пропускаем
      if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text().trim() !== 'Свой вариант') {
        return;
      }

      servers.forEach((server, index) => {
        const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;
        const element = $(selector);

        if (element.text().trim() === server.title.replace(/<[^>]+>/g, '').trim()) {
          checkServerStatus({ ...server }, index).then(updated => {
            element.html(updated.title);
          });
        }
      });
    }, 1000);
  }

  // Добавление параметра выбора предустановленного сервера в настройки
  Lampa.SettingsApi.addParam({
    component: 'parser',
    param: {
      name: 'jackett_urltwo',
      type: 'select',
      values: {
        no_parser: 'Свой вариант',
        ...servers.reduce((acc, s) => ({ ...acc, [s.id]: s.title }), {})
      },
      default: 'jacred_xyz',
    },
    field: {
      name: '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#000000"><g id="SVGRepo_iconCarrier"><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716"></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"></polygon></g><path d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584C305.143,302.71,299.049,308.803,291.559,308.803z"></path><path d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584S299.049,427.919,291.559,427.919z"></path><path d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584S299.049,368.405,291.559,368.405z"></path><path d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"></path><path d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"></path><path d="M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484l89.627,82.578L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132l36.268-111.136l48.515,319.89L452.882,438.59z"></path><path d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"></path></g></svg></div><div style="font-size:1.0em"><div style="padding: 0.3em 0.3em; padding-top: 0;"><div style="background: #d99821; padding: 0.5em; border-radius: 0.4em;"><div style="line-height: 0.3;">Выбрать парсер</div></div></div></div></div>',
      description: 'Нажмите для выбора парсера из списка',
    },
    onChange: () => {
      applyServerConfig();
      Lampa.Settings.update();
    },
    onRender: (element) => {
      setTimeout(() => {
        // Обновление статуса при открытии списка выбора
        $('div[data-children="parser"]').on('hover:enter', () => Lampa.Settings.update());

        // Скрываем ручные поля URL и ключа при выборе предустановленного сервера
        if (localStorage.getItem('jackett_urltwo') !== 'no_parser') {
          $('div[data-name="jackett_url"]').hide();
          $('div[data-name="jackett_key"]').hide();
          Lampa.Controller.toggle('settings_component');
        }

        // Показываем параметр только если выбран Jackett как тип парсера
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

  // Обновление статуса серверов при открытии списка выбора
  Lampa.Controller.listener.follow('toggle', (e) => {
    if (e.name === 'select') {
      setTimeout(updateServerStatusInSettings, 10);
    }
  });

  // Удаляем старые/дублирующие параметры при открытии настроек парсера
  Lampa.Settings.listener.follow('open', (e) => {
    if (e.name === 'parser') {
      e.body.find('[data-name="jackett_url2"], [data-name="jackett_url_two"]').remove();
    }
  });

  // Показ/скрытие параметра при смене типа парсера
  Lampa.Storage.listener.follow('change', (e) => {
    if (e.name === 'parser_torrent_type') {
      const el = $('div[data-name="jackett_urltwo"]');
      if (e.value !== 'jackett') {
        el.hide();
      } else {
        el.show().insertAfter('div[data-name="parser_torrent_type"]');
      }
    }
  });

  // Установка значений по умолчанию при первом запуске
  const initInterval = setInterval(() => {
    if (typeof Lampa !== 'undefined') {
      clearInterval(initInterval);
      if (!Lampa.Storage.get('jack', false)) {
        Lampa.Storage.set('jack', true);
        Lampa.Storage.set('jackett_url', 'jacred.xyz');
        Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('jackett_key', '');
        Lampa.Storage.set('jackett_interview', 'healthy');
        Lampa.Storage.set('parse_lang', 'lg');
      }
    }
  }, 100);

  // Меню быстрой смены парсера (появляется при пустом результате поиска торрентов)
  let observer = null;

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function startObserver() {
    stopObserver();

    const target = document.body;
    observer = new MutationObserver(() => {
      if ($('.empty__title').length && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
        showServerSwitchMenu();
        stopObserver();
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  async function showServerSwitchMenu() {
    const checkedServers = await Promise.all(servers.map(server => checkServerStatus({ ...server })));

    const currentActivity = Lampa.Storage.get('activity');

    Lampa.Select.show({
      title: 'Меню смены парсера',
      items: checkedServers.map(s => ({
        title: s.title.replace(/<[^>]+>/g, ''), // Оригинальное название без индикатора
        subtitle: s.title.includes('✓') ? 'Работает' : 'Не работает',
        url: s.url,
        url_two: s.id,
        jac_key: s.key,
        jac_int: s.interview,
        jac_lang: s.lang,
      })),
      onBack: () => Lampa.Controller.toggle('torrents'),
      onSelect: (item) => {
        Lampa.Storage.set('jackett_url', item.url);
        Lampa.Storage.set('jackett_urltwo', item.url_two);
        Lampa.Storage.set('jackett_key', item.jac_key);
        Lampa.Storage.set('jackett_interview', item.jac_int);
        Lampa.Storage.set('parse_lang', item.jac_lang);
        Lampa.Storage.set('parse_in_search', true);

        // Возврат в предыдущую активность с перезагрузкой
        setTimeout(() => window.history.back(), 1000);
        setTimeout(() => Lampa.Activity.push(currentActivity), 2000);
      },
    });
  }

  // Запуск наблюдателя при входе в раздел торрентов
  Lampa.Storage.listener.follow('change', (e) => {
    if (e.name === 'activity') {
      if (Lampa.Activity.active().component === 'torrents') {
        startObserver();
      } else {
        stopObserver();
      }
    }
  });
})();
