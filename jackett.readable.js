/**
 * Jackett / JacRed parser switcher for Lampa
 *
 * Читаемая версия: строки восстановлены из таблицы обфускатора,
 * имена переменных и функций восстановлены по смыслу.
 *
 * Что делает плагин:
 *   - хранит список серверов-парсеров торрентов;
 *   - пингует каждый и показывает статус (ожидание / доступен / недоступен);
 *   - добавляет пункт выбора парсера в настройки;
 *   - добавляет кнопку быстрого переключения на странице торрентов;
 *   - при первом запуске прописывает парсер по умолчанию.
 */
(function () {
  'use strict';

  Lampa.Platform.tv();

  // ── ресурсы ───────────────────────────────────────────────────────────

  var ICON_JACKETT = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 512 512\" xmlns=\"http://www.w3.org/2000/svg\">            <polygon fill=\"#074761\" points=\"187.305,27.642 324.696,27.642 256,236.716\"/>            <polygon fill=\"#10BAFC\" points=\"187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96\"/>            <polygon fill=\"#0084FF\" points=\"66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908\"/>            <polygon fill=\"#0084FF\" points=\"163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716\"/>            <polygon fill=\"#10BAFC\" points=\"324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96\"/>            <polygon fill=\"#0084FF\" points=\"445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908\"/>            <polygon fill=\"#0084FF\" points=\"348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716\"/>            <path fill=\"#000000\" d=\"M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z\"/>            <path fill=\"#000000\" d=\"M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z\"/>            <path fill=\"#000000\" d=\"M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z\"/>            <path fill=\"#000000\" d=\"M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z\"/>            <path fill=\"#000000\" d=\"M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052\"/>            <path fill=\"#000000\" d=\"M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075 c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858 c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371 C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795 c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507 l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795 L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123 h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242 L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484 l89.627,82.578L245.552,473.907L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666 c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484 c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132 l36.268-111.136l48.515,319.89L452.882,438.59z\"/>            <path fill=\"#000000\" d=\"M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z\"/>        </svg>";

  // статусы серверов в списке выбора
  var ICON_IDLE = "<div style=\"width:1.3em;height:1.3em;padding-right:.1em;display:inline-block;vertical-align:middle;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"15.5\" fill=\"none\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1\"/></svg></div>";   // серый кружок: проверяем
  var ICON_OK = "<div style=\"width:1.3em;height:1.3em;padding-right:.1em;display:inline-block;vertical-align:middle;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"15.5\" fill=\"none\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1\"/><g fill=\"none\"><path fill=\"url(#f624id0)\" d=\"M29.757 15.75c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f624id4)\" d=\"M29.757 15.75c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f624id1)\" d=\"M29.757 15.75c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f624id2)\" d=\"M29.757 15.75c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f624id3)\" d=\"M29.757 15.75c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><defs><radialGradient id=\"f624id0\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"rotate(130.168 9.994 9.81)scale(27.8086)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".19\" stop-color=\"#5ae68d\"/><stop offset=\".835\" stop-color=\"#43a684\"/></radialGradient><radialGradient id=\"f624id1\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"rotate(136.38 10.117 10.14)scale(14.6767 15.816)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".179\" stop-color=\"#6ffca5\"/><stop offset=\"1\" stop-color=\"#65e6a7\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"f624id2\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(-19.25 0 0 -20 20.249 15.75)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".62\" stop-color=\"#64cb85\" stop-opacity=\"0\"/><stop offset=\".951\" stop-color=\"#a4e4b7\"/></radialGradient><radialGradient id=\"f624id3\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 22.1875 -22.9876 0 15.757 8.75)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".732\" stop-color=\"#4a9795\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#718cad\"/></radialGradient><linearGradient id=\"f624id4\" x1=\"15.757\" x2=\"15.757\" y1=\"1.75\" y2=\"8.25\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#5ed284\"/><stop offset=\"1\" stop-color=\"#5ed284\" stop-opacity=\"0\"/></linearGradient></defs></g></svg></div>";       // зелёный: сервер ответил
  var ICON_FAIL = "<div style=\"width:1.3em;height:1.3em;padding-right:.1em;display:inline-block;vertical-align:middle;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"15.5\" fill=\"none\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1\"/><g fill=\"none\"><path fill=\"url(#f2179id0)\" d=\"M29.757 16c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f2179id4)\" d=\"M29.757 16c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f2179id1)\" d=\"M29.757 16c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f2179id2)\" d=\"M29.757 16c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><path fill=\"url(#f2179id3)\" d=\"M29.757 16c0 7.732-6.268 14-14 14s-14-6.268-14-14s6.268-14 14-14s14 6.268 14 14\"/><defs><radialGradient id=\"f2179id0\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"rotate(130.168 9.936 9.935)scale(27.8086)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".232\" stop-color=\"#f24756\"/><stop offset=\"1\" stop-color=\"#b22945\"/></radialGradient><radialGradient id=\"f2179id1\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"rotate(136.38 10.067 10.264)scale(14.6767 15.816)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".179\" stop-color=\"#ff6180\"/><stop offset=\"1\" stop-color=\"#e5364a\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"f2179id2\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(-19.25 0 0 -20 20.249 16)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".62\" stop-color=\"#b73e4b\" stop-opacity=\"0\"/><stop offset=\".951\" stop-color=\"#d48387\"/></radialGradient><radialGradient id=\"f2179id3\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 21 -23.3208 0 15.757 9)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".863\" stop-color=\"#b83c5a\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#b83c5a\"/><stop offset=\"1\" stop-color=\"#ac4064\"/></radialGradient><linearGradient id=\"f2179id4\" x1=\"15.757\" x2=\"15.757\" y1=\"2\" y2=\"8.5\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#dd4577\"/><stop offset=\"1\" stop-color=\"#ef4b5e\" stop-opacity=\"0\"/></linearGradient></defs></g></svg></div>";   // красный: не ответил

  var STATUS_ICON = {
    success: ICON_OK,
    error: ICON_FAIL
  };

  // ── настройки ─────────────────────────────────────────────────────────

  var PING_TIMEOUT = 3000;
  var HTTP_OK = 200;

  var DELAY_MARK_IDLE = 50;     // успеть подставить серые кружки
  var DELAY_START_PING = 100;   // затем пойти пинговать
  var DELAY_PING_RENDER = 1000; // пауза перед обновлением строки меню
  var DELAY_SETTINGS_RENDER = 5;
  var DELAY_GO_BACK = 1000;
  var DELAY_REOPEN = 2000;
  var BOOT_POLL = 100;

  var STORAGE = {
    url: 'jackett_url',
    selected: 'jackett_urltwo',
    key: 'jackett_key',
    interview: 'jackett_interview',
    lang: 'parse_lang',
    searchIn: 'parse_in_search',
    parserUse: 'parser_use',
    parserType: 'parser_torrent_type',
    firstRun: 'jack'
  };

  var CUSTOM_ID = 'no_parser';
  var CUSTOM_LABEL = 'Свой вариант';

  /** Список доступных серверов-парсеров. */
  var PARSERS = [
    {
      id: 'bylampa_jackett',
      name: 'ByLampa Jackett',
      baseUrl: '87.120.84.218:8443',
      key: '777',
      interview: 'all',
      lang: 'df'
    },
    {
      id: 'bylampa_jacred',
      name: 'ByLampa JacRed',
      baseUrl: '87.120.84.218:9117',
      key: '333',
      interview: 'all',
      lang: 'lg'
    },
    {
      id: 'jr_maxvol_pro',
      name: 'Jacred Maxvol Pro',
      baseUrl: 'jr.maxvol.pro',
      key: '',
      interview: 'healthy',
      lang: 'df'
    },
    {
      id: 'jacred_ru',
      name: 'Jacred RU',
      baseUrl: 'jac-red.ru',
      key: '',
      interview: 'all',
      lang: 'lg'
    }
  ];

  var DEFAULT_PARSER = PARSERS[1]; // ByLampa JacRed

  // единственный сервер, работающий по HTTPS
  var HTTPS_HOSTS = ['jr.maxvol.pro'];

  // ── селекторы списка выбора ───────────────────────────────────────────
  // Lampa не даёт пунктам меню своих id, поэтому до них приходится
  // добираться по длинному пути в DOM.

  var SELECTBOX_ROW =
    'body > div.selectbox > div.selectbox__content.layer--height >' +
    ' div.selectbox__body.layer--wheight > div > div > div > div:nth-child(';

  function selectboxRow(index) {
    return SELECTBOX_ROW + index + ') > div';
  }

  /** Открыт ли сейчас именно наш список выбора парсера. */
  function isParserSelectOpen() {
    return $(selectboxRow(1)).text() === CUSTOM_LABEL;
  }

  function labelWithIcon(icon, text) {
    return icon + '<span style="margin-left: 0.5em;">' + text + '</span>';
  }

  // ── проверка доступности сервера ──────────────────────────────────────

  /**
   * Пингует сервер парсера.
   * @param {object} parser элемент PARSERS
   * @param {function} done (parser, isAlive, httpStatus)
   */
  function pingParser(parser, done) {
    var scheme = HTTPS_HOSTS.indexOf(parser.baseUrl) !== -1 ? 'https://' : 'http://';
    var url = scheme + parser.baseUrl +
      '/api/v2.0/indexers/status:healthy/results?apikey=' + parser.key;

    var request = new XMLHttpRequest();

    request.timeout = PING_TIMEOUT;
    request.open('GET', url, true);
    request.send();

    request.ontimeout = function () {
      done(parser, false);
    };

    request.onerror = function () {
      done(parser, false);
    };

    request.onload = function () {
      done(parser, request.status === HTTP_OK, request.status);
    };
  }

  /** Пингует сервер и возвращает его же, но с готовой строкой для меню. */
  function describeParser(parser) {
    return new Promise(function (resolve) {
      var item = {
        id: parser.id,
        name: parser.name,
        baseUrl: parser.baseUrl,
        key: parser.key,
        interview: parser.interview,
        lang: parser.lang,
        title: labelWithIcon(ICON_IDLE, parser.name)
      };

      pingParser(parser, function (checked, isAlive) {
        item.title = labelWithIcon(
          isAlive ? STATUS_ICON.success : STATUS_ICON.error,
          checked.name
        );
        resolve(item);
      });
    });
  }

  function describeAllParsers(list) {
    return Promise.all(list.map(describeParser));
  }

  // ── подсветка статусов в открытом списке ──────────────────────────────

  /** Помечает строку меню серым кружком, потом заменяет его результатом пинга. */
  function refreshRowStatus(index) {
    setTimeout(function () {
      var parser = PARSERS[index];
      var rowSelector = selectboxRow(index + 2); // +1 за "Свой вариант", +1 за 1-based

      if (!isParserSelectOpen()) return;

      pingParser(parser, function (checked, isAlive) {
        if (!$(rowSelector).text().includes(checked.name)) return;

        $(rowSelector).html(labelWithIcon(
          isAlive ? STATUS_ICON.success : STATUS_ICON.error,
          checked.name
        ));
      });
    }, DELAY_PING_RENDER);
  }

  function refreshAllRowStatuses() {
    for (var i = 0; i < PARSERS.length; i++) {
      refreshRowStatus(i);
    }
  }

  /** Пока идёт проверка, показываем серые кружки. */
  function markRowsIdle() {
    for (var i = 0; i < PARSERS.length; i++) {
      var parser = PARSERS[i];
      var rowSelector = selectboxRow(i + 2);

      if (!isParserSelectOpen()) continue;

      if ($(rowSelector).text() === parser.name) {
        $(rowSelector).html(labelWithIcon(ICON_IDLE, parser.name));
      }
    }
  }

  // ── применение выбора ─────────────────────────────────────────────────

  function findParser(id) {
    return PARSERS.filter(function (p) {
      return p.id === id;
    })[0];
  }

  function currentParserName() {
    var id = Lampa.Storage.get(STORAGE.selected);

    if (id === CUSTOM_ID) return 'Свой';

    var parser = findParser(id);
    return parser ? parser.name : 'Не выбран';
  }

  /** Переписывает настройки Lampa под выбранный сервер. */
  function applySelectedParser() {
    var id = Lampa.Storage.get(STORAGE.selected);

    // "Свой вариант": чистим поля, пользователь заполнит руками
    if (id === CUSTOM_ID) {
      Lampa.Storage.set(STORAGE.url, '');
      Lampa.Storage.set(STORAGE.key, '');
      Lampa.Storage.set(STORAGE.interview, 'all');
      Lampa.Storage.set(STORAGE.searchIn, false);
      Lampa.Storage.set(STORAGE.lang, 'lg');
      return;
    }

    var parser = findParser(id);
    if (!parser) return;

    Lampa.Storage.set(STORAGE.url, parser.baseUrl);
    Lampa.Storage.set(STORAGE.key, parser.key);
    Lampa.Storage.set(STORAGE.interview, parser.interview);
    Lampa.Storage.set(STORAGE.searchIn, true);
    Lampa.Storage.set(STORAGE.lang, parser.lang);
  }

  /** Первый запуск: прописываем парсер по умолчанию. */
  function applyFirstRunDefaults() {
    Lampa.Storage.set(STORAGE.firstRun, 'true');
    Lampa.Storage.set(STORAGE.url, DEFAULT_PARSER.baseUrl);
    Lampa.Storage.set(STORAGE.selected, DEFAULT_PARSER.id);
    Lampa.Storage.set(STORAGE.key, DEFAULT_PARSER.key);
    Lampa.Storage.set(STORAGE.interview, DEFAULT_PARSER.interview);
    Lampa.Storage.set(STORAGE.lang, DEFAULT_PARSER.lang);
    Lampa.Storage.set(STORAGE.searchIn, true);
  }

  // ── меню быстрого переключения ────────────────────────────────────────

  function openParserMenu() {
    var previousController = Lampa.Controller.enabled().name;

    describeAllParsers(PARSERS).then(function (items) {
      Lampa.Select.show({
        title: 'Меню смены парсера',

        items: items.map(function (item) {
          return {
            title: item.title,
            url: item.baseUrl,
            url_two: item.id,
            jac_key: item.key,
            jac_int: item.interview,
            jac_lang: item.lang
          };
        }),

        onBack: function () {
          Lampa.Controller.toggle(previousController);
        },

        onSelect: function (selected) {
          Lampa.Storage.set(STORAGE.url, selected.url);
          Lampa.Storage.set(STORAGE.selected, selected.url_two);
          Lampa.Storage.set(STORAGE.key, selected.jac_key);
          Lampa.Storage.set(STORAGE.interview, selected.jac_int);
          Lampa.Storage.set(STORAGE.lang, selected.jac_lang);
          Lampa.Storage.set(STORAGE.searchIn, true);

          Lampa.Controller.toggle(previousController);

          // перезаходим в текущую активность, чтобы поиск пошёл через новый парсер
          var activity = Lampa.Storage.get('activity');

          setTimeout(function () {
            window.history.back();
          }, DELAY_GO_BACK);

          setTimeout(function () {
            Lampa.Activity.push(activity);
          }, DELAY_REOPEN);
        }
      });
    }).catch(function (error) {
      console.error('Error:', error);
    });
  }

  // ── кнопка на странице торрентов ──────────────────────────────────────

  function addFilterButton() {
    if (document.querySelector('.filter--parser')) return;

    var button = document.createElement('div');

    button.className = 'simple-button simple-button--filter selector filter--parser';
    button.innerHTML = ICON_JACKETT +
      '<div class="" id="current-parser-name">' + currentParserName() + '</div>';

    $(button).on('hover:enter', function () {
      openParserMenu();
    });

    var filterBar = document.querySelector('.torrent-filter');
    if (!filterBar) return;

    var sortButton = filterBar.querySelector('.filter--sort');

    if (sortButton) filterBar.insertBefore(button, sortButton);
    else filterBar.appendChild(button);
  }

  // ── наблюдатель за пустой выдачей ─────────────────────────────────────
  // Если торрентов не нашлось, Lampa рисует .empty__title.
  // В этот момент предлагаем сменить парсер.

  var emptyResultObserver = null;

  function startEmptyResultObserver() {
    stopEmptyResultObserver();

    emptyResultObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function () {
        var isEmpty = $('.empty__title').length;
        var isJackett = Lampa.Storage.field(STORAGE.parserType) === 'jackett';

        if (isEmpty && isJackett) {
          openParserMenu();
          stopEmptyResultObserver();
        }
      });
    });

    emptyResultObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function stopEmptyResultObserver() {
    if (!emptyResultObserver) return;

    emptyResultObserver.disconnect();
    emptyResultObserver = null;
  }

  // ── пункт в настройках ────────────────────────────────────────────────

  function addSettingsParam() {
    var values = {};
    values[CUSTOM_ID] = CUSTOM_LABEL;

    PARSERS.forEach(function (parser) {
      values[parser.id] = parser.name;
    });

    var fieldTitle =
      '<div class="settings-folder" style="padding:0!important">' +
      '<div style="width:1.3em;height:1.3em;padding-right:.1em">' + ICON_JACKETT + '</div>' +
      '<div style="font-size:1.0em">' +
      '<div style="padding: 0.3em 0.3em; padding-top: 0;">' +
      '<div style="background: #d99821; padding: 0.5em; border-radius: 0.4em;">' +
      '<div style="line-height: 0.3;">Выбрать парсер</div>' +
      '</div></div></div></div>';

    Lampa.SettingsApi.addParam({
      component: 'parser',

      param: {
        name: STORAGE.selected,
        type: 'select',
        values: values,
        'default': DEFAULT_PARSER.id
      },

      field: {
        name: fieldTitle,
        description: 'Нажмите для выбора парсера из списка'
      },

      onChange: function () {
        applySelectedParser();
        Lampa.Settings.update();
      },

      onRender: function (item) {
        setTimeout(function () {
          $('div[data-children="parser"]').on('hover:enter', function () {
            Lampa.Settings.update();
          });

          // при готовом пресете поля адреса и ключа не нужны
          if (localStorage.getItem(STORAGE.selected) !== CUSTOM_ID) {
            $('div[data-name="' + STORAGE.url + '"]').hide();
            $('div[data-name="' + STORAGE.key + '"]').hide();
            Lampa.Controller.toggle('settings_component');
          }

          var isActive = Lampa.Storage.field(STORAGE.parserUse) &&
            Lampa.Storage.field(STORAGE.parserType) === 'jackett';

          if (!isActive) {
            item.hide();
            return;
          }

          item.show();
          $('.settings-param__name', item).css('color', 'ffffff');
          $('div[data-name="' + STORAGE.selected + '"]')
            .insertAfter('div[data-name="' + STORAGE.url + '"]');
        }, DELAY_SETTINGS_RENDER);
      }
    });

    // подчищаем пункт от прошлых версий плагина
    Lampa.Settings.listener.follow('open', function (event) {
      if (event.name !== 'parser') return;
      event.body.find('[data-name="jackett_url2"]').remove();
    });
  }

  // ── подписки ──────────────────────────────────────────────────────────

  function bindListeners() {
    // список выбора открылся: сначала серые кружки, потом реальные статусы
    Lampa.Controller.listener.follow('toggle', function (event) {
      if (event.name !== 'select') return;

      setTimeout(markRowsIdle, DELAY_MARK_IDLE);
      setTimeout(refreshAllRowStatuses, DELAY_START_PING);
    });

    Lampa.Storage.listener.follow('change', function (event) {
      // пункт нужен только когда выбран движок jackett
      if (event.name === STORAGE.parserType) {
        var row = $('div[data-name="' + STORAGE.selected + '"]');

        if (Lampa.Storage.field(STORAGE.parserType) !== 'jackett') {
          row.hide();
        } else {
          row.show();
          row.insertAfter('div[data-name="' + STORAGE.url + '"]');
        }
      }

      // кнопку показываем только на странице торрентов
      if (event.name === 'activity') {
        if (Lampa.Activity.active().component === 'torrents') {
          startEmptyResultObserver();
          setTimeout(addFilterButton, DELAY_START_PING);
        } else {
          stopEmptyResultObserver();
        }
      }

      // обновляем подпись на кнопке
      if (event.name === STORAGE.selected) {
        var label = document.getElementById('current-parser-name');
        if (label) label.textContent = currentParserName();
      }
    });
  }

  // ── запуск ────────────────────────────────────────────────────────────

  function initPlugin() {
    // Привязка к сборке снята: в оригинале здесь стояла проверка
    // Lampa.Manifest.origin и на чужих сборках плагин отказывался работать.
    // Теперь запускается в любой Lampa.

    Lampa.Storage.set(STORAGE.parserUse, true);

    addSettingsParam();
    bindListeners();

    var bootTimer = setInterval(function () {
      if (typeof Lampa === 'undefined') return;

      clearInterval(bootTimer);

      if (!Lampa.Storage.get(STORAGE.firstRun, 'false')) applyFirstRunDefaults();
    }, BOOT_POLL);
  }

  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') initPlugin();
    });
  }
})();
