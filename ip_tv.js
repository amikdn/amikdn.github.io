(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return { done: true };
            return { done: false, value: o[i++] };
          },
          e: function (e) { throw e; },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return {
      s: function () { it = it.call(o); },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var Utils = /*#__PURE__*/function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "clear",
      value: function clear(str) {
        return str.replace(/\&quot;/g, '"').replace(/\&#039;/g, "'").replace(/\&amp;/g, "&").replace(/\&.+?;/g, '');
      }
    }, {
      key: "isHD",
      value: function isHD(name) {
        var match = name.toLowerCase().match(' .hd$| .нd$| .hd | .нd | hd$| нd&| hd | нd ');
        return match ? match[0].trim() : '';
      }
    }, {
      key: "clearHDSD",
      value: function clearHDSD(name) {
        return name.replace(/ hd$| нd$| .hd$| .нd$/gi, '').replace(/ sd$/gi, '').replace(/ hd | нd | .hd | .нd /gi, ' ').replace(/ sd /gi, ' ');
      }
    }, {
      key: "clearMenuName",
      value: function clearMenuName(name) {
        return name.replace(/^\d+\. /gi, '').replace(/^\d+ /gi, '');
      }
    }, {
      key: "clearChannelName",
      value: function clearChannelName(name) {
        return this.clearHDSD(this.clear(name));
      }
    }, {
      key: "hasArchive",
      value: function hasArchive(channel) {
        if (channel.catchup) {
          var days = parseInt(channel.catchup.days);
          if (!isNaN(days) && days > 0) return days;
        }
        return 0;
      }
    }, {
      key: "canUseDB",
      value: function canUseDB() {
        return DB.db && Lampa.Storage.get('iptv_use_db', 'indexdb') == 'indexdb';
      }
    }]);

    return Utils;
  }();

  var favorites = [];

  var Favorites = /*#__PURE__*/function () {
    function Favorites() {
      _classCallCheck(this, Favorites);
    }

    _createClass(Favorites, null, [{
      key: "load",
      value: function load() {
        var _this = this;
        return new Promise(function (resolve, reject) {
          if (Utils.canUseDB()) {
            DB.getData('favorites').then(function (result) {
              favorites = result || [];
              console.log('Favorites loaded from DB:', favorites);
            })["finally"](resolve);
          } else {
            _this.nosuport();
            resolve();
          }
        });
      }
    }, {
      key: "nosuport",
      value: function nosuport() {
        favorites = Lampa.Storage.get('iptv_favorite_channels', '[]');
        console.log('Favorites loaded from storage:', favorites);
      }
    }, {
      key: "list",
      value: function list() {
        return favorites;
      }
    }, {
      key: "find",
      value: function find(favorite) {
        return favorites.find(function (a) {
          return a.url == favorite.url;
        });
      }
    }, {
      key: "remove",
      value: function remove(favorite) {
        return new Promise(function (resolve, reject) {
          var find = favorites.find(function (a) {
            return a.url == favorite.url;
          });
          if (find) {
            if (Utils.canUseDB()) {
              DB.deleteData('favorites', favorite.url).then(function () {
                Lampa.Arrays.remove(favorites, find);
                console.log('Favorite removed:', favorite.url);
                resolve();
              })["catch"](reject);
            } else {
              Lampa.Arrays.remove(favorites, find);
              Lampa.Storage.set('iptv_favorite_channels', favorites);
              console.log('Favorite removed from storage:', favorite.url);
              resolve();
            }
          } else {
            console.log('Favorite not found:', favorite.url);
            reject();
          }
        });
      }
    }, {
      key: "add",
      value: function add(favorite) {
        return new Promise(function (resolve, reject) {
          if (!favorites.find(function (a) {
            return a.url == favorite.url;
          })) {
            Lampa.Arrays.extend(favorite, {
              view: 0,
              added: Date.now()
            });
            if (Utils.canUseDB()) {
              DB.addData('favorites', favorite.url, favorite).then(function () {
                favorites.push(favorite);
                console.log('Favorite added:', favorite.url);
                resolve();
              })["catch"](reject);
            } else {
              favorites.push(favorite);
              Lampa.Storage.set('iptv_favorite_channels', favorites);
              console.log('Favorite added to storage:', favorite.url);
              resolve();
            }
          } else {
            console.log('Favorite already exists:', favorite.url);
            reject();
          }
        });
      }
    }, {
      key: "update",
      value: function update(favorite) {
        return new Promise(function (resolve, reject) {
          if (favorites.find(function (a) {
            return a.url == favorite.url;
          })) {
            Lampa.Arrays.extend(favorite, {
              view: 0,
              added: Date.now()
            });
            if (Utils.canUseDB()) {
              DB.updateData('favorites', favorite.url, favorite).then(function () {
                console.log('Favorite updated:', favorite.url);
                resolve();
              })["catch"](reject);
            } else {
              Lampa.Storage.set('iptv_favorite_channels', favorites);
              console.log('Favorite updated in storage:', favorite.url);
              resolve();
            }
          } else {
            console.log('Favorite not found for update:', favorite.url);
            reject();
          }
        });
      }
    }, {
      key: "toggle",
      value: function toggle(favorite) {
        return this.find(favorite) ? this.remove(favorite) : this.add(favorite);
      }
    }]);

    return Favorites;
  }();

  var locked = [];

  var Locked = /*#__PURE__*/function () {
    function Locked() {
      _classCallCheck(this, Locked);
    }

    _createClass(Locked, null, [{
      key: "load",
      value: function load() {
        var _this = this;
        return new Promise(function (resolve, reject) {
          if (Utils.canUseDB()) {
            DB.getData('locked').then(function (result) {
              locked = result || [];
              console.log('Locked channels loaded from DB:', locked);
            })["finally"](resolve);
          } else {
            _this.nosuport();
            resolve();
          }
        });
      }
    }, {
      key: "nosuport",
      value: function nosuport() {
        locked = Lampa.Storage.get('iptv_locked_channels', '[]');
        console.log('Locked channels loaded from storage:', locked);
      }
    }, {
      key: "list",
      value: function list() {
        return locked;
      }
    }, {
      key: "find",
      value: function find(key) {
        return locked.find(function (a) {
          return a == key;
        });
      }
    }, {
      key: "remove",
      value: function remove(key) {
        return new Promise(function (resolve, reject) {
          var find = locked.find(function (a) {
            return a == key;
          });
          if (find) {
            if (Utils.canUseDB()) {
              DB.deleteData('locked', key).then(function () {
                Lampa.Arrays.remove(locked, find);
                console.log('Locked channel removed:', key);
                resolve();
              })["catch"](reject);
            } else {
              Lampa.Arrays.remove(locked, find);
              Lampa.Storage.set('iptv_locked_channels', locked);
              console.log('Locked channel removed from storage:', key);
              resolve();
            }
          } else {
            console.log('Locked channel not found:', key);
            reject();
          }
        });
      }
    }, {
      key: "add",
      value: function add(key) {
        return new Promise(function (resolve, reject) {
          if (!locked.find(function (a) {
            return a == key;
          })) {
            if (Utils.canUseDB()) {
              DB.addData('locked', key, key).then(function () {
                locked.push(key);
                console.log('Locked channel added:', key);
                resolve();
              })["catch"](reject);
            } else {
              locked.push(key);
              Lampa.Storage.set('iptv_locked_channels', locked);
              console.log('Locked channel added to storage:', key);
              resolve();
            }
          } else {
            console.log('Locked channel already exists:', key);
            reject();
          }
        });
      }
    }, {
      key: "update",
      value: function update(key) {
        return new Promise(function (resolve, reject) {
          if (locked.find(function (a) {
            return a == key;
          })) {
            if (Utils.canUseDB()) {
              DB.updateData('locked', key, key).then(function () {
                console.log('Locked channel updated:', key);
                resolve();
              })["catch"](reject);
            } else {
              Lampa.Storage.set('iptv_locked_channels', locked);
              console.log('Locked channel updated in storage:', key);
              resolve();
            }
          } else {
            console.log('Locked channel not found for update:', key);
            reject();
          }
        });
      }
    }, {
      key: "toggle",
      value: function toggle(key) {
        return this.find(key) ? this.remove(key) : this.add(key);
      }
    }]);

    return Locked;
  }();

  var DB = new Lampa.DB('cub_iptv', ['playlist', 'params', 'epg', 'favorites', 'other', 'epg_channels', 'locked'], 6);
  DB.logs = true;
  DB.openDatabase().then(function () {
    console.log('Database opened successfully');
    Favorites.load();
    Locked.load();
  })["catch"](function (err) {
    console.error('Database open failed:', err);
    Favorites.nosuport();
    Locked.nosuport();
  });

  function fixParams(params_data) {
    var params = params_data || {};
    Lampa.Arrays.extend(params, {
      update: 'none',
      update_time: Date.now(),
      loading: 'cub'
    });
    return params;
  }

  var Params = /*#__PURE__*/function () {
    function Params() {
      _classCallCheck(this, Params);
    }

    _createClass(Params, null, [{
      key: "get",
      value: function get(id) {
        return new Promise(function (resolve) {
          if (Utils.canUseDB()) {
            DB.getDataAnyCase('params', id).then(function (params) {
              console.log('Params loaded for id:', id, params);
              resolve(fixParams(params));
            })["catch"](function (err) {
              console.error('Failed to load params:', err);
              resolve(fixParams({}));
            });
          } else {
            var params = Lampa.Storage.get('iptv_playlist_params_' + id, '{}');
            console.log('Params loaded from storage for id:', id, params);
            resolve(fixParams(params));
          }
        });
      }
    }, {
      key: "set",
      value: function set(id, params) {
        if (Utils.canUseDB()) {
          return DB.rewriteData('params', id, fixParams(params)).then(function () {
            console.log('Params saved for id:', id);
          });
        } else {
          return new Promise(function (resolve) {
            Lampa.Storage.set('iptv_playlist_params_' + id, fixParams(params));
            console.log('Params saved to storage for id:', id);
            resolve();
          });
        }
      }
    }, {
      key: "value",
      value: function value(params, name) {
        return Lang$1.translate('iptv_params_' + params[name]);
      }
    }]);

    return Params;
  }();

  function isValidPath(string) {
    var url;
    try {
      url = new URL(string);
    } catch (_) {
      console.warn('Invalid URL:', string);
      return false;
    }
    return (url.protocol === "http:" || url.protocol === "https:") && !string.endsWith('.mp4');
  }

  var Parser$1 = {};

  Parser$1.parse = function (content) {
    console.log('Parsing playlist...');
    var playlist = {
      header: {},
      items: []
    };
    var lines = content.split('\n').map(function (line, index) {
      return { raw: line, index: index };
    });
    var firstExtm3u = lines.find(function (l) {
      return /^#EXTM3U/.test(l.raw);
    });
    if (!firstExtm3u) {
      console.error('No #EXTM3U found in playlist');
      throw new Error('Playlist is not valid');
    }
    console.log('Found #EXTM3U at line:', firstExtm3u.index);
    playlist.header = parseHeader(firstExtm3u);
    var i = 0;
    var items = {};

    var _iterator = _createForOfIteratorHelper(lines),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var line = _step.value;
        if (line.index === firstExtm3u.index) continue;
        var string = line.raw.toString().trim();
        if (string.startsWith('#EXTINF:')) {
          var EXTINF = string;
          items[i] = {
            name: EXTINF.getName ? EXTINF.getName() : EXTINF.split(',')[1] || '',
            tvg: {
              id: EXTINF.getAttribute ? EXTINF.getAttribute('tvg-id') : EXTINF.match(/tvg-id="([^"]*)"/i)?.[1] || '',
              name: EXTINF.getAttribute ? EXTINF.getAttribute('tvg-name') : EXTINF.match(/tvg-name="([^"]*)"/i)?.[1] || '',
              logo: EXTINF.getAttribute ? EXTINF.getAttribute('tvg-logo') : EXTINF.match(/tvg-logo="([^"]*)"/i)?.[1] || '',
              url: EXTINF.getAttribute ? EXTINF.getAttribute('tvg-url') : EXTINF.match(/tvg-url="([^"]*)"/i)?.[1] || EXTINF.match(/url-tvg="([^"]*)"/i)?.[1] || '',
              rec: EXTINF.getAttribute ? EXTINF.getAttribute('tvg-rec') : EXTINF.match(/tvg-rec="([^"]*)"/i)?.[1] || ''
            },
            group: {
              title: EXTINF.getAttribute ? EXTINF.getAttribute('group-title') : EXTINF.match(/group-title="([^"]*)"/i)?.[1] || ''
            },
            http: {
              referrer: '',
              'user-agent': EXTINF.getAttribute ? EXTINF.getAttribute('user-agent') : EXTINF.match(/user-agent="([^"]*)"/i)?.[1] || ''
            },
            url: undefined,
            raw: line.raw,
            line: line.index + 1,
            catchup: {
              type: EXTINF.getAttribute ? EXTINF.getAttribute('catchup') : EXTINF.match(/catchup="([^"]*)"/i)?.[1] || '',
              days: EXTINF.getAttribute ? EXTINF.getAttribute('catchup-days') : EXTINF.match(/catchup-days="([^"]*)"/i)?.[1] || '',
              source: EXTINF.getAttribute ? EXTINF.getAttribute('catchup-source') : EXTINF.match(/catchup-source="([^"]*)"/i)?.[1] || ''
            },
            timeshift: EXTINF.getAttribute ? EXTINF.getAttribute('timeshift') : EXTINF.match(/timeshift="([^"]*)"/i)?.[1] || ''
          };
        } else if (string.startsWith('#EXTVLCOPT:')) {
          if (!items[i]) continue;
          var EXTVLCOPT = string;
          items[i].http.referrer = EXTVLCOPT.getOption ? EXTVLCOPT.getOption('http-referrer') : EXTVLCOPT.match(/http-referrer=([^,\n]*)/i)?.[1] || items[i].http.referrer;
          items[i].http['user-agent'] = EXTVLCOPT.getOption ? EXTVLCOPT.getOption('http-user-agent') : EXTVLCOPT.match(/http-user-agent=([^,\n]*)/i)?.[1] || items[i].http['user-agent'];
        } else if (string && !string.startsWith('#') && isValidPath(string)) {
          if (!items[i]) continue;
          items[i].url = string;
          playlist.items.push(items[i]);
          console.log('Channel added:', items[i].name, items[i].url);
          i++;
        }
      }
    } catch (e) {
      console.error('Error parsing playlist:', e);
      _iterator.e(e);
    } finally {
      _iterator.f();
    }
    console.log('Parsed playlist:', playlist.items.length, 'channels');
    return playlist;
  };

  function parseHeader(line) {
    var header = {};
    var attrs = line.raw.match(/([a-zA-Z-]+)="([^"]*)"/g) || [];
    attrs.forEach(function (attr) {
      var [, key, value] = attr.match(/([a-zA-Z-]+)="([^"]*)"/);
      header[key] = value;
    });
    console.log('Parsed header:', header);
    return header;
  }

  var Lang$1 = {
    init: function () {
      console.log('Lang$1.init called (stub implementation)');
      if (typeof Lampa.Lang !== 'undefined' && Lampa.Lang.translate) {
        console.log('Lampa.Lang.translate is available');
      } else {
        console.warn('Lampa.Lang.translate is not available');
      }
    },
    translate: function (key) {
      var translations = {
        iptv_need_update_app: {
          ru: 'Обновите приложение до последней версии',
          en: 'Update the application to the latest version',
          uk: 'Оновіть програму до останньої версії',
          be: 'Абновіце прыкладанне да апошняй версіі',
          zh: '升级应用程序到最新版本',
          pt: 'Atualize o aplicativo para a versão mais recente',
          bg: 'Актуализирайте приложението до последната версия'
        },
        iptv_channel_lock: {
          ru: 'Заблокировать',
          en: 'Lock',
          uk: 'Заблокувати',
          be: 'Заблакаваць',
          zh: '锁定',
          pt: 'Bloquear',
          bg: 'Заключване'
        },
        iptv_channel_unlock: {
          ru: 'Разблокировать',
          en: 'Unlock',
          uk: 'Розблокувати',
          be: 'Разблакаваць',
          zh: '解锁',
          pt: 'Desbloquear',
          bg: 'Отключване'
        },
        iptv_about_text: {
          ru: 'Удобное приложение IPTV – откройте доступ к множеству каналов, фильмам и сериалам прямо на вашем телевизоре. Интуитивный интерфейс, легкая навигация, и безграничные возможности развлечений на вашем большом экране. Ваш личный портал в мир цифрового телевидения!',
          en: 'Convenient IPTV application - access a variety of channels, movies, and series directly on your television. Intuitive interface, easy navigation, and unlimited entertainment possibilities on your big screen. Your personal portal to the world of digital television!',
          uk: 'Зручний додаток IPTV - отримайте доступ до безлічі каналів, фільмів і серіалів прямо на вашому телевізорі. Інтуїтивний інтерфейс, легка навігація та необмежені можливості розваг на вашому великому екрані. Ваш особистий портал у світ цифрового телебачення!',
          be: 'Зручнае прыкладанне IPTV - атрымайце доступ да шматліканальнага тэлебачання, фільмаў і серыялаў проста на вашым тэлевізары. Інтуітыўны інтэрфейс, лёгкая навігацыя і неабмежаваныя магчымасці разваг на вашым вялікім экране. Ваш асабісты партал у свет цыфравага тэлебачання!',
          zh: '方便的IPTV应用程序-直接在您的电视上访问各种频道，电影和系列。直观的界面，简单的导航以及在您的大屏幕上无限的娱乐可能性。您数字电视世界的个人门户！',
          pt: 'Aplicativo IPTV conveniente - acesse uma variedade de canais, filmes e séries diretamente na sua televisão. Interface intuitiva, navegação fácil e possibilidades de entretenimento ilimitadas na sua tela grande. Seu portal pessoal para o mundo da televisão digital!',
          bg: 'Удобно приложение за IPTV - отворете достъп до множество канали, филми и сериали директно на вашия телевизор. Интуитивен интерфейс, лесна навигация и неограничени възможности за забавления на големия ви екран. Вашият личен портал към света на цифровата телевизия!'
        },
        iptv_confirm_delete_playlist: {
          ru: 'Вы точно хотите удалить плейлист?',
          en: 'Are you sure you want to delete the playlist?',
          uk: 'Ви точно хочете видалити плейлист?',
          be: 'Вы ўпэўненыя, що хочаце выдаліць плейліст?',
          zh: '您确定要删除播放列表吗？',
          pt: 'Tem certeza de que deseja excluir a lista de reprodução?',
          bg: 'Сигурни ли сте, че искате да изтриете списъка с канали?'
        },
        iptv_cache_clear: {
          ru: 'Кеш удален',
          en: 'Cache cleared',
          uk: 'Кеш видалено',
          be: 'Кеш выдалены',
          zh: '缓存已清除',
          pt: 'Cache limpo',
          bg: 'Кешът е изчистен'
        },
        iptv_playlist_deleted: {
          ru: 'Плейлист удален',
          en: 'Playlist deleted',
          uk: 'Плейлист видалено',
          be: 'Плейліст выдалены',
          zh: '播放列表已删除',
          pt: 'Lista de reprodução excluída',
          bg: 'Плейлистът е изтрит'
        },
        iptv_playlist_add_set_url: {
          ru: 'Укажите URL плейлиста',
          en: 'Enter the playlist URL',
          uk: 'Вкажіть URL плейлиста',
          be: 'Укажыце URL плейліста',
          zh: '请输入播放列表的 URL',
          pt: 'Insira o URL da lista de reprodução',
          bg: 'Въведете URL адреса на плейлиста'
        },
        iptv_playlist_add_new: {
          ru: 'Добавить новый плейлист',
          en: 'Add new playlist',
          uk: 'Додати новий плейлист',
          be: 'Дадаць новы плейліст',
          zh: '添加新播放列表',
          pt: 'Adicionar nova lista de reprodução',
          bg: 'Добавяне на нов списък с канали'
        },
        iptv_playlist_url_changed: {
          ru: 'Ссылка изменена',
          en: 'Link changed',
          uk: 'Посилання змінено',
          be: 'Спасылка зменена',
          zh: '链接已更改',
          pt: 'Link alterado',
          bg: 'Връзката е променена'
        },
        iptv_playlist_add_set_name: {
          ru: 'Укажите название плейлиста',
          en: 'Enter the playlist name',
          uk: 'Вкажіть назву плейлиста',
          be: 'Укажыце назву плейліста',
          zh: '请输入播放列表名称',
          pt: 'Insira o nome da lista de reprodução',
          bg: 'Въведете име на плейлиста'
        },
        iptv_playlist_name_changed: {
          ru: 'Название изменено',
          en: 'Name changed',
          uk: 'Назва змінена',
          be: 'Назва зменена',
          zh: '名称已更改',
          pt: 'Nome alterado',
          bg: 'Името е променено'
        },
        iptv_playlist_change_name: {
          ru: 'Изменить название',
          en: 'Change name',
          uk: 'Змінити назву',
          be: 'Змяніць назву',
          zh: '更改名称',
          pt: 'Alterar nome',
          bg: 'Промяна на името'
        },
        iptv_param_view_in_main: {
          ru: 'Показывать каналы на главной',
          en: 'Show channels on main page',
          uk: 'Показувати канали на головній',
          be: 'Паказваць каналы на галоўнай',
          zh: '在主页上显示频道',
          pt: 'Mostrar canais na página principal',
          bg: 'Показване на канали на главната страница'
        },
        title_continue: {
          ru: 'Продолжить',
          en: 'Continue',
          uk: 'Продовжити',
          be: 'Працягнуць',
          zh: '继续',
          pt: 'Continuar',
          bg: 'Продължи'
        },
        player_playlist: {
          ru: 'Плейлист',
          en: 'Playlist',
          uk: 'Плейлист',
          be: 'Плейліст',
          zh: '播放列表',
          pt: 'Lista de reprodução',
          bg: 'Списък за възпроизвеждане'
        }
      };
      return translations[key] ? translations[key][Lampa.Lang.getLanguage ? Lampa.Lang.getLanguage() : 'en'] || translations[key].en : key;
    }
  };

  var Templates = {
    init: function () {
      console.log('Templates.init called (stub implementation)');
      if (typeof Lampa.Template !== 'undefined' && Lampa.Template.js) {
        console.log('Lampa.Template.js is available');
      } else {
        console.warn('Lampa.Template.js is not available, using fallback');
      }
    }
  };

  var Settings = {
    init: function () {
      console.log('Settings.init called (stub implementation)');
    }
  };

  var EPG = {
    init: function () {
      console.log('EPG.init called (stub implementation)');
    }
  };

  var Guide = {
    init: function () {
      console.log('Guide.init called (stub implementation)');
    }
  };

  var Channel = /*#__PURE__*/function () {
    function Channel(data, playlist) {
      _classCallCheck(this, Channel);
      this.data = data;
      this.playlist = playlist;
    }

    _createClass(Channel, [{
      key: "build",
      value: function build() {
        console.log('Building channel:', this.data.name);
        this.card = Lampa.Template.js('cub_iptv_channel_main_board');
        this.icon = this.card.querySelector('.iptv-channel__ico') || {};
        this.card.addEventListener('visible', this.visible.bind(this));
      }
    }, {
      key: "image",
      value: function image() {
        var _this = this;
        this.icon.onload = function () {
          _this.card.classList.add('loaded');
          if (_this.data.tvg.logo && _this.data.tvg.logo.indexOf('epg.it999') == -1) {
            _this.card.classList.add('small--icon');
          }
          console.log('Image loaded for channel:', _this.data.name);
        };
        this.icon.onerror = function () {
          var simb = document.createElement('div');
          simb.classList.add('iptv-channel__simb');
          simb.textContent = _this.data.name.length <= 3 ? _this.data.name.toUpperCase() : _this.data.name.replace(/[^a-z|а-я|0-9]/gi, '').toUpperCase()[0];
          var text = document.createElement('div');
          text.classList.add('iptv-channel__name');
          text.textContent = Utils.clear(_this.data.name);
          _this.card.querySelector('.iptv-channel__body').append(simb);
          _this.card.querySelector('.iptv-channel__body').append(text);
          console.log('Image failed to load, using fallback for:', _this.data.name);
        };
      }
    }, {
      key: "create",
      value: function create() {
        var _this2 = this;
        console.log('Creating channel:', this.data.name);
        this.build();
        this.card.addEventListener('hover:focus', function () {
          if (_this2.onFocus) _this2.onFocus(_this2.card, _this2.data);
        });
        this.card.addEventListener('hover:hover', function () {
          if (_this2.onHover) _this2.onHover(_this2.card, _this2.data);
        });
        this.card.addEventListener('hover:enter', function () {
          var play = {
            title: _this2.data.name || '',
            url: _this2.data.url,
            tv: true
          };
          console.log('Playing channel:', play.title, play.url);
          Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
          Lampa.Player.play(play);
          Lampa.Player.playlist(_this2.playlist.map(function (a) {
            return {
              title: a.name,
              url: a.url,
              tv: true
            };
          }));
        });
        this.image();
      }
    }, {
      key: "visible",
      value: function visible() {
        if (this.data.tvg.logo) {
          this.icon.src = this.data.tvg.logo;
          console.log('Loading image for channel:', this.data.name, this.data.tvg.logo);
        } else {
          this.icon.onerror();
        }
        if (this.onVisible) this.onVisible(this.card, this.data);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.icon.onerror = function () {};
        this.icon.onload = function () {};
        this.icon.src = '';
        this.card.remove();
        this.card = null;
        this.icon = null;
        console.log('Channel destroyed:', this.data.name);
      }
    }, {
      key: "render",
      value: function render(js) {
        return js ? this.card : $(this.card);
      }
    }]);

    return Channel;
  }();

  function startPlugin() {
    console.log('IPTV Plugin: startPlugin called');
    window.plugin_iptv_ready = true;
    var manifest = {
      type: 'video',
      version: '1.2.8',
      name: 'IPTV',
      description: '',
      component: 'iptv',
      onMain: function onMain(data) {
        if (!Lampa.Storage.field('iptv_view_in_main')) {
          console.log('IPTV not shown on main page, iptv_view_in_main is false');
          return { results: [] };
        }
        var playlist = Lampa.Arrays.clone(Lampa.Storage.get('iptv_play_history_main_board', '[]')).reverse();
        console.log('Main page playlist:', playlist);
        return {
          results: playlist,
          title: Lang$1.translate('title_continue'),
          nomore: true,
          line_type: 'iptv',
          cardClass: function cardClass(item) {
            return new Channel(item, playlist);
          }
        };
      }
    };
    Lampa.Manifest.plugins = manifest;

    function add() {
      var button = $("<li class=\"menu__item selector\">\n            <div class=\"menu__ico\">\n                <svg height=\"36\" viewBox=\"0 0 38 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect x=\"2\" y=\"8\" width=\"34\" height=\"21\" rx=\"3\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <line x1=\"13.0925\" y1=\"2.34874\" x2=\"16.3487\" y2=\"6.90754\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                    <line x1=\"1.5\" y1=\"-1.5\" x2=\"9.31665\" y2=\"-1.5\" transform=\"matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                    <line x1=\"9.5\" y1=\"34.5\" x2=\"29.5\" y2=\"34.5\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n            <div class=\"menu__text\">".concat(window.lampa_settings.iptv ? Lang$1.translate('player_playlist') : 'IPTV', "</div>\n        </li>"));
      button.on('hover:enter', function () {
        console.log('Menu button clicked, opening IPTV');
        if (window.lampa_settings.iptv) {
          if (Lampa.Activity.active().component == 'iptv') {
            console.log('Already in IPTV, opening playlist');
            return Lampa.Activity.active().activity.component().playlist();
          }
        }
        Lampa.Activity.push({
          url: '',
          title: 'IPTV',
          component: 'iptv',
          page: 1
        });
      });
      $('.menu .menu__list').eq(0).append(button);
      $('body').append(Lampa.Template.get('cub_iptv_style', {}, true));
      console.log('Menu button and styles added');

      if (window.lampa_settings.iptv) {
        $('.head .head__action.open--search').addClass('hide');
        $('.head .head__action.open--premium').remove();
        $('.head .head__action.open--feed').remove();
        $('.navigation-bar__body [data-action="main"]').unbind().on('click', function () {
          console.log('Main navigation clicked, opening playlist');
          Lampa.Activity.active().activity.component().playlist();
        });
        $('.navigation-bar__body [data-action="search"]').addClass('hide');
      }
    }

    try {
      Lang$1.init();
      console.log('Lang$1 initialized successfully');
    } catch (e) {
      console.error('Lang$1.init failed:', e);
    }

    try {
      Templates.init();
      console.log('Templates initialized successfully');
    } catch (e) {
      console.error('Templates.init failed:', e);
    }

    try {
      Settings.init();
      console.log('Settings initialized successfully');
    } catch (e) {
      console.error('Settings.init failed:', e);
    }

    try {
      EPG.init();
      console.log('EPG initialized successfully');
    } catch (e) {
      console.error('EPG.init failed:', e);
    }

    try {
      Guide.init();
      console.log('Guide initialized successfully');
    } catch (e) {
      console.error('Guide.init failed:', e);
    }

    try {
      Lampa.Component.add('iptv', Component);
      console.log('IPTV Component registered');
    } catch (e) {
      console.error('Lampa.Component.add failed:', e);
    }

    if (window.lampa_settings.iptv) {
      Lampa.Storage.set('start_page', 'last');
      window.start_deep_link = {
        component: 'iptv'
      };
      console.log('IPTV set as start page');
    }

    if (window.appready) {
      console.log('App ready, adding IPTV');
      add();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
          console.log('App ready event, adding IPTV');
          add();
        }
      });
    }
  }

  if (!window.plugin_iptv_ready) {
    console.log('Starting IPTV plugin');
    startPlugin();
  }
})();
