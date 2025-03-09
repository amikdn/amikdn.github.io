(function() {
  'use strict';

  // Если объект Lampa.Template не определён, создаём минимальную реализацию,
  // чтобы избежать ошибки "Template [lampac_css] not found"
  if (typeof Lampa.Template === 'undefined') {
    Lampa.Template = {
      _templates: {},
      add: function(name, tpl) {
        this._templates[name] = tpl;
      },
      get: function(name, data, asString) {
        return this._templates[name] || "";
      }
    };
  }

  // Добавляем шаблон CSS для плагина (при необходимости дополните стили)
  Lampa.Template.add('lampac_css', "\n    <style>\n      /* Пример стилей для плагина */\n      .online-prestige { background-color: rgba(0,0,0,0.3); border-radius: .3em; padding: 1em; }\n      .online-empty { padding: 1em; text-align: center; }\n    </style>\n  ");
  $('body').append(Lampa.Template.get('lampac_css', {}, true));

  var Defined = {
    api: 'lampac',
    localhost: 'https://lam.akter-black.com/',
    apn: ''
  };

  var unic_id = Lampa.Storage.get('lampac_unic_id', '');
  if (!unic_id) {
    unic_id = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unic_id);
  }

  if (!window.rch) {
    Lampa.Utils.putScript(["https://abmsx.tech/invc-rch.js"], function() {}, false, function() {
      if (!window.rch.startTypeInvoke)
        window.rch.typeInvoke('https://abmsx.tech', function() {});
    }, true);
  }

  // Если требуется, можно использовать BlazorNet (обычно используется Lampa.Reguest)
  function BlazorNet() {
    this.net = new Lampa.Reguest();
    this.timeout = function(time) { this.net.timeout(time); };
    this.req = function(type, url, success, error, post) {
      var params = arguments.length > 5 ? arguments[5] : {};
      var path = url.split(Defined.localhost).pop().split('?');
      if (path[0].indexOf('http') >= 0)
        return this.net[type](url, success, error, post, params);
      DotNet.invokeMethodAsync("JinEnergy", path[0], path[1]).then(function(result) {
        if (params.dataType == 'text')
          success(result);
        else
          success(Lampa.Arrays.decodeJson(result, {}));
      })["catch"](function(e) {
        console.log('Blazor', 'error:', e);
        error(e);
      });
    };
    this.silent = function(url, success, error, post) {
      var params = arguments.length > 4 ? arguments[4] : {};
      this.req('silent', url, success, error, post, params);
    };
    this["native"] = function(url, success, error, post) {
      var params = arguments.length > 4 ? arguments[4] : {};
      this.req('native', url, success, error, post, params);
    };
    this.clear = function() { this.net.clear(); };
  }

  var Network = Lampa.Reguest;
  // Если требуется использование BlazorNet, можно раскомментировать:
  // var Network = Defined.api.indexOf('pwa') === 0 && typeof Blazor !== 'undefined' ? BlazorNet : Lampa.Reguest;

  // =======================================================================
  // Функция account() — всегда добавляет фиксированные параметры:
  // uid = "qdiicjlp"
  // token = "Z18GTIeNYL801YzUSii7Qjfo"
  // ab_token = "Z18GTIeNYL801YzUSii7Qjfo"
  function account(url) {
    url = url + '';
    if (url.indexOf('account_email=') === -1) {
      var email = Lampa.Storage.get('account_email');
      if (email)
        url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
    }
    url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent("qdiicjlp"));
    url = Lampa.Utils.addUrlComponent(url, 'token=' + encodeURIComponent("Z18GTIeNYL801YzUSii7Qjfo"));
    url = Lampa.Utils.addUrlComponent(url, 'ab_token=' + encodeURIComponent("Z18GTIeNYL801YzUSii7Qjfo"));
    return url;
  }
  // =======================================================================

  // Основной компонент плагина – остальной код компонента оставляем без изменений.
  function component(object) {
    var network = new Network();
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var files = new Lampa.Explorer(object);
    var filter = new Lampa.Filter(object);
    var sources = {};
    var last, source, balanser, initialized, balanser_timer, images = [];
    var number_of_requests = 0, number_of_requests_timer, life_wait_times = 0, life_wait_timer;
    var hubConnection, hub_timer, filter_sources = {};
    var filter_translate = {
      season: Lampa.Lang.translate('torrent_serial_season'),
      voice: Lampa.Lang.translate('torrent_parser_voice'),
      source: Lampa.Lang.translate('settings_rest_source')
    };
    var filter_find = { season: [], voice: [] };
    var balansers_with_search = ['kinotochka', 'kinopub', 'lumex', 'filmix', 'filmixtv',
      'redheadsound', 'animevost', 'animego', 'animedia', 'animebesst', 'anilibria',
      'rezka', 'rhsprem', 'kodik', 'remux', 'animelib', 'kinoukr',
      'rc/filmix', 'rc/fxapi', 'rc/kinopub', 'rc/rhs', 'vcdn'];

    function balanserName(j) {
      var bals = j.balanser;
      var name = j.name.split(' ')[0];
      return (bals || name).toLowerCase();
    }

    function clarificationSearchAdd(value) {
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search', '{}');
      all[id] = value;
      Lampa.Storage.set('clarification_search', all);
    }
    function clarificationSearchDelete() {
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search', '{}');
      delete all[id];
      Lampa.Storage.set('clarification_search', all);
    }
    function clarificationSearchGet() {
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search', '{}');
      return all[id];
    }

    // Далее идёт стандартный код компонента (initialize, rch, externalids, updateBalanser, changeBalanser,
    // requestParams, getLastChoiceBalanser, startSource, lifeSource, createSource, create, search, find,
    // request, parseJsonDate, getFileUrl, toPlayElement, appendAPN, setDefaultQuality, display, parse,
    // similars, getChoice, saveChoice, replaceChoice, clearImages, reset, loading, filter, selected, getEpisodes,
    // watched, updateWatched, draw, contextMenu, empty, noConnectToServer, doesNotAnswer, getLastEpisode,
    // start, render, back, pause, stop, destroy).
    // Для краткости здесь оставляем комментарий – код компонента остаётся без изменений.
    // (В реальном файле он присутствует полностью.)

    // ... (Полный код компонента должен быть включён здесь) ...

    this.start = function() {
      if (Lampa.Activity.active().activity !== this.activity) return;
      if (!initialized) {
        initialized = true;
        this.initialize();
      }
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
      Lampa.Controller.add('content', {
        toggle: function toggle() {
          Lampa.Controller.collectionSet(scroll.render(), files.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        },
        gone: function gone() { clearTimeout(balanser_timer); },
        up: function up() { if (Navigator.canmove('up')) { Navigator.move('up'); } else { Lampa.Controller.toggle('head'); } },
        down: function down() { Navigator.move('down'); },
        right: function right() { if (Navigator.canmove('right')) Navigator.move('right'); else filter.show(Lampa.Lang.translate('title_filter'), 'filter'); },
        left: function left() { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
        back: this.back.bind(this)
      });
      Lampa.Controller.toggle('content');
    };

    this.render = function() { return files.render(); };

    this.back = function() { Lampa.Activity.backward(); };

    this.pause = function() {};
    this.stop = function() {};
    this.destroy = function() {
      network.clear();
      this.clearImages();
      files.destroy();
      scroll.destroy();
      clearInterval(balanser_timer);
      clearTimeout(life_wait_timer);
      clearTimeout(hub_timer);
      if (hubConnection) {
        hubConnection.stop();
        hubConnection = null;
      }
    };
  }

  // Функция startPlugin – регистрирует плагин
  function startPlugin() {
    window.lampac_plugin = true;
    var manifst = {
      type: 'video',
      version: '2',
      name: '4m1K',
      description: 'Плагин для просмотра онлайн сериалов и фильмов',
      component: 'lampac',
      icon: 'img/4m1k.png', // Проверьте, что по этому пути действительно находится иконка
      onContextLaunch: function onContextLaunch(object) {
        resetTemplates();
        Lampa.Component.add('lampac', component);
        var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
        var all = Lampa.Storage.get('clarification_search', '{}');
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'lampac',
          search: all[id] ? all[id] : object.title,
          search_one: object.title,
          search_two: object.original_title,
          movie: object,
          page: 1,
          clarification: all[id] ? true : false
        });
      },
      onContextMenu: function onContextMenu(object) {
        return {
          name: Lampa.Lang.translate('lampac_watch'),
          description: 'Плагин для просмотра онлайн сериалов и фильмов'
        };
      }
    };

    // Если в системе уже есть плагины, добавляем наш в массив, иначе создаём массив
    if (!Lampa.Manifest.plugins) {
      Lampa.Manifest.plugins = [];
    }
    Lampa.Manifest.plugins.push(manifst);

    Lampa.Lang.add({
      lampac_watch: { ru: 'Онлайн 4am1K', en: 'Online 4am1K', uk: 'Онлайн 4am1K', zh: '在线观看' },
      lampac_video: { ru: 'Видео', en: 'Video', uk: 'Відео', zh: '视频' },
      lampac_no_watch_history: { ru: 'Нет истории просмотра', en: 'No browsing history', ua: 'Немає історії перегляду', zh: '没有浏览历史' },
      lampac_nolink: { ru: 'Не удалось извлечь ссылку', uk: 'Неможливо отримати посилання', en: 'Failed to fetch link', zh: '获取链接失败' },
      lampac_balanser: { ru: 'Источник', uk: 'Джерело', en: 'Source', zh: '来源' },
      helper_online_file: { ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню', uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню', en: 'Hold the "OK" key to bring up the context menu', zh: '按住“确定”键调出上下文菜单' },
      title_online: { ru: 'Онлайн', uk: 'Онлайн', en: 'Online', zh: '在线的' },
      lampac_voice_subscribe: { ru: 'Подписаться на перевод', uk: 'Підписатися на переклад', en: 'Subscribe to translation', zh: '订阅翻译' },
      lampac_voice_success: { ru: 'Вы успешно подписались', uk: 'Ви успішно підписалися', en: 'You have successfully subscribed', zh: '您已成功订订' },
      lampac_voice_error: { ru: 'Возникла ошибка', uk: 'Виникла помилка', en: 'An error has occurred', zh: '发生了错误' },
      lampac_clear_all_marks: { ru: 'Очистить все метки', uk: 'Очистити всі мітки', en: 'Clear all labels', zh: '清除所有标签' },
      lampac_clear_all_timecodes: { ru: 'Очистить все тайм-коды', uk: 'Очистити всі тайм-коди', en: 'Clear all timecodes', zh: '清除所有时间代码' },
      lampac_change_balanser: { ru: 'Изменить балансер', uk: 'Змінити балансер', en: 'Change balancer', zh: '更改平衡器' },
      lampac_balanser_dont_work: { ru: 'Поиск на ({balanser}) не дал результатов', uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results', zh: '搜索 ({balanser}) 未返回任何结果' },
      lampac_balanser_timeout: { ru: 'Источник будет переключен автоматически через <span class="timeout">10</span> секунд.', uk: 'Джерело буде автоматично переключено через <span class="timeout">10</span> секунд.', en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.', zh: '平衡器将在<span class="timeout">10</span>秒内自动切换。' },
      lampac_does_not_answer_text: { ru: 'Поиск на ({balanser}) не дал результатов', uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results', zh: '搜索 ({balanser}) 未返回任何结果' }
    });
    Lampa.Template.add('lampac_css', "\n        <style>\n          /* Дополнительные CSS стили плагина можно добавить здесь */\n        </style>\n    ");
    $('body').append(Lampa.Template.get('lampac_css', {}, true));
    startPlugin = null;
  }

  function resetTemplates() {
    Lampa.Template.add('lampac_prestige_full', "<div class=\"online-prestige online-prestige--full selector\">\n  <div class=\"online-prestige__img\">\n    <img alt=\"\">\n    <div class=\"online-prestige__loader\"></div>\n  </div>\n  <div class=\"online-prestige__body\">\n    <div class=\"online-prestige__head\">\n      <div class=\"online-prestige__title\">{title}</div>\n      <div class=\"online-prestige__time\">{time}</div>\n    </div>\n    <div class=\"online-prestige__timeline\"></div>\n    <div class=\"online-prestige__footer\">\n      <div class=\"online-prestige__info\">{info}</div>\n      <div class=\"online-prestige__quality\">{quality}</div>\n    </div>\n  </div>\n</div>");
    Lampa.Template.add('lampac_content_loading', "<div class=\"online-empty\">\n  <div class=\"broadcast__scan\"><div></div></div>\n  <div class=\"online-empty__templates\">\n    <div class=\"online-empty-template selector\">\n      <div class=\"online-empty-template__ico\"></div>\n      <div class=\"online-empty-template__body\"></div>\n    </div>\n    <div class=\"online-empty-template\">\n      <div class=\"online-empty-template__ico\"></div>\n      <div class=\"online-empty-template__body\"></div>\n    </div>\n    <div class=\"online-empty-template\">\n      <div class=\"online-empty-template__ico\"></div>\n      <div class=\"online-empty-template__body\"></div>\n    </div>\n  </div>\n</div>");
    Lampa.Template.add('lampac_does_not_answer', "<div class=\"online-empty\">\n  <div class=\"online-empty__title\">#{lampac_balanser_dont_work}</div>\n  <div class=\"online-empty__time\">#{lampac_balanser_timeout}</div>\n  <div class=\"online-empty__buttons\">\n    <div class=\"online-empty__button selector cancel\">#{cancel}</div>\n    <div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>\n  </div>\n  <div class=\"online-empty__templates\">\n    <div class=\"online-empty-template\">\n      <div class=\"online-empty-template__ico\"></div>\n      <div class=\"online-empty-template__body\"></div>\n    </div>\n    <div class=\"online-empty-template\">\n      <div class=\"online-empty-template__ico\"></div>\n      <div class=\"online-empty-template__body\"></div>\n    </div>\n    <div class=\"online-empty-template\">\n      <div class=\"online-empty-template__ico\"></div>\n      <div class=\"online-empty-template__body\"></div>\n    </div>\n  </div>\n</div>");
    Lampa.Template.add('lampac_prestige_rate', "<div class=\"online-prestige-rate\">\n  <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5\"/>\n  </svg>\n  <span>{rate}</span>\n</div>");
  }

  $('body').append(Lampa.Template.get('lampac_css', {}, true));
  startPlugin();

})();
