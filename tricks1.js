
(function () {
  'use strict';

  /* ========= Оригинальные определения (Utils, Favorites, Locked, DB, Templates, Lang, Settings, EPG, Guide, и пр.) ========= */
  // Предполагается, что все эти модули уже определены как в оригинальном плагине.
  // Например, Lampa.Utils, Lampa.Storage, Lampa.DB, Lampa.Template, Lampa.Lang, и т.д.
  // Для полноты примера ниже приведён лишь изменённый фрагмент API и инициализация плагина.

  /* ========= МОДИФИЦИРОВАННЫЙ API ========= */
  var Api = {
    network: new Lampa.Reguest(),
    api_url: Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/iptv/',
    /**
     * Функция для загрузки плейлиста.
     * Если URL равен "http://tv.new-ton.net.ru/plamik.m3u" – читаем локальный файл через fs,
     * иначе – стандартная загрузка через сеть.
     */
    m3uClient: function (url) {
      return new Promise(function (resolve, reject) {
        if (url === "http://tv.new-ton.net.ru/plamik.m3u") {
          // Используем модуль fs для чтения локального файла
          try {
            var fs = require('fs'); // доступно в NW.js / Electron
            // Предполагаем, что файл лежит в той же директории и называется "plamik.m3u"
            fs.readFile('plamik.m3u', 'utf8', function (err, data) {
              if (err) {
                reject(new Error("Ошибка при чтении локального файла: " + err.message));
                return;
              }
              // Проверяем, что файл начинается с "#EXTM3U" – базовая проверка валидности
              if (typeof data === 'string' && data.substr(0, 7).toUpperCase() === "#EXTM3U") {
                resolve(data);
              } else {
                reject(new Error("Файл не является корректным плейлистом"));
              }
            });
          } catch (e) {
            reject(new Error("Ошибка доступа к модулю fs: " + e.message));
          }
        } else {
          // Стандартная загрузка через сеть
          Api.network.timeout(20000);
          // Выбор метода загрузки (native/silent) согласно настройкам
          Api.network[window.god_enabled ? 'native' : 'silent'](url, function (str) {
            if (typeof str !== 'string' || str.substr(0, 7).toUpperCase() !== "#EXTM3U") {
              return reject(new Error(Lampa.Lang.translate('torrent_parser_request_error') +
                ' [M3UClient Function (The file is not M3U)]'));
            }
            resolve(str);
          }, function (e) {
            e.from_error = 'M3UClient Function (Failed to load)';
            reject(e);
          }, false, {
            dataType: 'text'
          });
        }
      });
    },
    // Остальные методы Api (например, get, m3u, playlist, program) остаются без изменений.
    playlist: function (data) {
      var id = data.id;
      return new Promise(function (resolve, reject) {
        Promise.all([DB.getDataAnyCase('playlist', id), Params.get(id)]).then(function (result) {
          var playlist = result[0];
          var params = result[1];
          if (playlist && params) {
            var time = {
              'always': 0,
              'hour': 1000 * 60 * 60,
              'hour12': 1000 * 60 * 60 * 12,
              'day': 1000 * 60 * 60 * 24,
              'week': 1000 * 60 * 60 * 24 * 7,
              'none': 0
            };
            if (params.update_time + time[params.update] > Date.now() || params.update == 'none')
              return resolve(playlist);
          }
          var secuses = function (result) {
            DB.rewriteData('playlist', id, result).finally(function () {
              if (params) params.update_time = Date.now();
              Params.set(id, params).finally(resolve.bind(resolve, result));
            });
          };
          var error = function (e) {
            playlist ? resolve(playlist) : reject(e);
          };
          if (params && params.loading == 'lampa' || data.custom) {
            Api.m3uClient(data.url).then(secuses).catch(error);
          } else {
            Api.get('playlist/' + id, true).then(secuses).catch(function () {
              Api.m3u(data.url).then(secuses).catch(error);
            });
          }
        }).catch(function (e) {
          e.from_error = 'Playlist Function (Something went wrong)';
          reject(e);
        });
      });
    }
  };

  /* ========= Компонент плагина ========= */
  function Component() {
    var html = document.createElement('div');
    var listener;
    var playlist;
    var channels;
    var initialized;
    window.iptv_mobile = window.innerWidth < 768;

    if (Lampa.Manifest.app_digital >= 185) {
      listener = Lampa.Subscribe();
      playlist = new Playlist(listener);
      channels = new Channels(listener);
    }

    this.create = function () {
      return this.render();
    };

    this.initialize = function () {
      var _this = this;
      this.activity.loader(true);
      if (Lampa.Manifest.app_digital >= 185) {
        listener.follow('display', function (controller) {
          _this.active = controller;
          _this.display(controller.render());
        });
        listener.follow('loading', this.loading.bind(this));
        listener.follow('channels-load', channels.load.bind(channels));
        listener.follow('playlist-main', playlist.main.bind(playlist));
        playlist.load();
      } else {
        var old = Lampa.Template.get('cub_iptv_list');
        old.find('.iptv-list__title').text(Lampa.Lang.translate('iptv_update_app_title'));
        old.find('.iptv-list__text').text(Lampa.Lang.translate('iptv_update_app_text'));
        $(html).append(old);
        this.activity.loader(false);
      }
      if (window.iptv_mobile) html.addClass('iptv-mobile');
    };

    this.playlist = function () {
      playlist.main();
    };

    this.loading = function () {
      this.activity.loader(true);
      this.active = false;
      this.start();
    };

    this.display = function (render) {
      html.empty().append(render);
      Lampa.Layer.update(html);
      Lampa.Layer.visible(html);
      this.activity.loader(false);
      this.start();
    };

    this.background = function () {
      Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
    };

    this.start = function () {
      var _this2 = this;
      if (Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return;
      if (!initialized) {
        initialized = true;
        this.initialize();
      }
      this.background();
      Lampa.Controller.add('content', {
        invisible: true,
        toggle: function () {
          if (_this2.active) _this2.active.toggle(); else {
            Lampa.Controller.collectionSet(html);
            Lampa.Controller.collectionFocus(false, html);
          }
        },
        left: function () {
          Lampa.Controller.toggle('menu');
        },
        up: function () {
          Lampa.Controller.toggle('head');
        },
        back: function () {
          Lampa.Activity.backward();
        }
      });
      Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};
    this.render = function () {
      return html;
    };

    this.destroy = function () {
      if (playlist) playlist.destroy();
      if (channels) channels.destroy();
      listener.destroy();
      html.remove();
    };
  }

  /* ========= Инициализация плагина ========= */
  function startPlugin() {
    window.plugin_iptv_ready = true;
    var manifest = {
      type: 'video',
      version: '1.2.8',
      name: 'IPTV',
      description: '',
      component: 'iptv',
      onMain: function (data) {
        if (!Lampa.Storage.field('iptv_view_in_main')) return { results: [] };
        var playlist = Lampa.Arrays.clone(Lampa.Storage.get('iptv_play_history_main_board', '[]')).reverse();
        return {
          results: playlist,
          title: Lampa.Lang.translate('title_continue'),
          nomore: true,
          line_type: 'iptv',
          cardClass: function (item) {
            return new Channel(item, playlist);
          }
        };
      }
    };
    Lampa.Manifest.plugins = manifest;

    function add() {
      var button = $("<li class=\"menu__item selector\">\n            <div class=\"menu__ico\">\n                <svg height=\"36\" viewBox=\"0 0 38 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect x=\"2\" y=\"8\" width=\"34\" height=\"21\" rx=\"3\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <line x1=\"13.0925\" y1=\"2.34874\" x2=\"16.3487\" y2=\"6.90754\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                    <line x1=\"1.5\" y1=\"-1.5\" x2=\"9.31665\" y2=\"-1.5\" transform=\"matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                    <line x1=\"9.5\" y1=\"34.5\" x2=\"29.5\" y2=\"34.5\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n            <div class=\"menu__text\">IPTV</div>\n        </li>");
      button.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: 'IPTV',
          component: 'iptv',
          page: 1
        });
      });
      $('.menu .menu__list').eq(0).append(button);
      $('body').append(Lampa.Template.get('cub_iptv_style', {}, true));
      if (window.lampa_settings.iptv) {
        $('.head .head__action.open--search').addClass('hide');
        $('.head .head__action.open--premium').remove();
        $('.head .head__action.open--feed').remove();
        $('.navigation-bar__body [data-action="main"]').unbind().on('click', function () {
          Lampa.Activity.active().activity.component().playlist();
        });
        $('.navigation-bar__body [data-action="search"]').addClass('hide');
      }
    }

    Lang.init();
    Templates.init();
    Settings.init();
    EPG.init();
    Guide.init();
    Lampa.Component.add('iptv', Component);
    if (window.lampa_settings.iptv) {
      Lampa.Storage.set('start_page', 'last');
      window.start_deep_link = { component: 'iptv' };
    }
    if (window.appready) add(); else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') add();
      });
    }
  }

  if (!window.plugin_iptv_ready) startPlugin();

  /* ========= Для тестирования: кнопка для загрузки локального плейлиста ========= */
  function addTestButton() {
    var btn = document.createElement('button');
    btn.textContent = "Загрузить локальный плейлист";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "10000";
    btn.addEventListener('click', function () {
      // Пример вызова для загрузки плейлиста с заданным URL.
      // Если в настройках кастомного плейлиста используется этот URL,
      // то будет загружен файл локально через fs.
      var customPlaylists = Lampa.Storage.get('iptv_playlist_custom', '[]');
      var newPlaylist = {
        id: Lampa.Utils.uid(),
        custom: true,
        url: "http://tv.new-ton.net.ru/plamik.m3u",
        name: "Локальный плейлист",
        // Дополнительно можно сразу сохранить данные плейлиста,
        // например, после вызова Api.m3uClient и Parser.parse.
      };
      customPlaylists.push(newPlaylist);
      Lampa.Storage.set('iptv_playlist_custom', customPlaylists);
      Lampa.Noty.show("Локальный плейлист добавлен в настройки");
    });
    document.body.appendChild(btn);
  }

  // Для теста можно добавить кнопку после загрузки приложения
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(addTestButton, 1000);
  } else {
    document.addEventListener("DOMContentLoaded", addTestButton);
  }

})();
