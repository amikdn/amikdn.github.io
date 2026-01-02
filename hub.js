(function () {
    'use strict';

    function main$8() {
      Lampa.Lang.add({
        lme_showbutton_desc: {
          ru: "Выводит все кнопки действий в карточке в одной строке"
        },
        lme_showbuttonwn_desc: {
          ru: "Показывать только иконки кнопок"
        }
      });
    }
    var Lang = {
      main: main$8
    };

    var STYLE_ID = 'lme-button-style';
    var ORDER_KEY = 'lme_buttonsort';
    var HIDE_KEY = 'lme_buttonhide';
    var lastFullContainer = null;
    var lastStartInstance = null;

    var FALLBACK_TITLES = {
      'button--play': function buttonPlay() {
        return Lampa.Lang.translate('title_watch');
      },
      'button--book': function buttonBook() {
        return Lampa.Lang.translate('settings_input_links');
      },
      'button--reaction': function buttonReaction() {
        return Lampa.Lang.translate('title_reactions');
      },
      'button--subscribe': function buttonSubscribe() {
        return Lampa.Lang.translate('title_subscribe');
      },
      'button--options': function buttonOptions() {
        return Lampa.Lang.translate('more');
      },
      'view--torrent': function viewTorrent() {
        return Lampa.Lang.translate('full_torrents');
      },
      'view--trailer': function viewTrailer() {
        return Lampa.Lang.translate('full_trailers');
      }
    };

    function ensureStyles() {
      if (document.getElementById(STYLE_ID)) return;
      var style = "\n        .lme-buttons {\n            display: flex;\n            flex-wrap: wrap;\n            gap: 10px;\n        }\n        .lme-button-hide {\n            display: none !important;\n        }\n        .lme-button-text-hidden span {\n            display: none;\n        }\n        .head__action.edit-buttons svg {\n            width: 26px;\n            height: 26px;\n        }\n    ";
      $('head').append("<style id=\"".concat(STYLE_ID, "\">").concat(style, "</style>"));
    }

    function readArray(key) {
      var value = Lampa.Storage.get(key);
      if (Array.isArray(value)) return value.slice();
      if (typeof value === 'string') {
        try {
          var parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return value.split(',').map(function (v) {
            return v.trim();
          }).filter(Boolean);
        }
      }
      return [];
    }

    function getFullContainer(e) {
      if (e && e.body) return e.body;
      if (e && e.link && e.link.html) return e.link.html;
      if (e && e.object && e.object.activity && typeof e.object.activity.render === 'function') return e.object.activity.render();
      return null;
    }

    function resolveActiveFullContainer() {
      var current = $('.full-start-new').first();
      if (current.length) return current;
      return null;
    }

    function getButtonId($button) {
      var className = ($button.attr('class') || '').split(/\s+/);
      var idClass = className.find(function (c) {
        return c.startsWith('button--') && c !== 'button--priority';
      }) || className.find(function (c) {
        return c.startsWith('view--');
      });
      if (idClass) return idClass;
      var dataId = $button.data('id') || $button.data('name') || $button.attr('data-name');
      if (dataId) return "data:".concat(dataId);
      var title = $button.text().trim();
      if (title) return "text:".concat(title);
      return "html:".concat(Lampa.Utils.hash($button.clone().removeClass('focus').prop('outerHTML')));
    }

    function getButtonTitle(id, $button) {
      var label = $button.find('span').first().text().trim() || $button.text().trim();
      if (label) return label;
      if (FALLBACK_TITLES[id]) return FALLBACK_TITLES[id]();
      return id;
    }

    function scanButtons(fullContainer, detach) {
      var targetContainer = fullContainer.find('.full-start-new__buttons');
      var extraContainer = fullContainer.find('.buttons--container');
      var items = [];
      var map = {};
      function collect($buttons) {
        $buttons.each(function () {
          var $btn = $(this);
          if ($btn.hasClass('button--play') || $btn.hasClass('button--priority')) return;
          var id = getButtonId($btn);
          if (!id || map[id]) return;
          map[id] = detach ? $btn.detach() : $btn;
          items.push(id);
        });
      }
      collect(targetContainer.find('.full-start__button'));
      collect(extraContainer.find('.full-start__button'));
      return {
        items: items,
        map: map,
        targetContainer: targetContainer,
        extraContainer: extraContainer
      };
    }

    function normalizeOrder(order, ids) {
      var result = [];
      var known = new Set(ids);
      order.forEach(function (id) {
        if (known.has(id)) result.push(id);
      });
      ids.forEach(function (id) {
        if (!result.includes(id)) result.push(id);
      });
      return result;
    }

    function applyHidden(map) {
      var hidden = new Set(readArray(HIDE_KEY));
      Object.keys(map).forEach(function (id) {
        map[id].toggleClass('lme-button-hide', hidden.has(id));
      });
    }

    function applyLayout(fullContainer) {
      if (Lampa.Storage.get('lme_showbutton') !== true) return;

      if (!fullContainer || !fullContainer.length) return;

      ensureStyles();

      var headActions = fullContainer.find('.head__actions');
      if (headActions.length) {
        var editButton = headActions.find('.edit-buttons');
        if (editButton.length === 0) {
          editButton = $('<div class="head__action selector edit-buttons">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>' +
            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>' +
            '</svg>' +
            '</div>');

          headActions.find('.open--settings').after(editButton);

          editButton.on('hover:enter', function () {
            openEditor(fullContainer);
          });
        }
      }

      var priority = fullContainer.find('.full-start-new__buttons .button--priority').detach();
      fullContainer.find('.full-start-new__buttons .button--play').remove();

      var _scanButtons = scanButtons(fullContainer, true),
        items = _scanButtons.items,
        map = _scanButtons.map,
        targetContainer = _scanButtons.targetContainer;

      var savedOrder = readArray(ORDER_KEY);
      var order = normalizeOrder(savedOrder, items);

      if (savedOrder.length === 0) {
        order.sort(function(a, b) {
          var aIsOnline = a.startsWith('button--');
          var bIsOnline = b.startsWith('button--');
          if (aIsOnline && !bIsOnline) return -1;
          if (!aIsOnline && bIsOnline) return 1;
          return 0;
        });
      }

      targetContainer.empty();
      if (priority.length) targetContainer.append(priority);
      order.forEach(function (id) {
        if (map[id]) targetContainer.append(map[id]);
      });

      targetContainer.toggleClass('lme-button-text-hidden', Lampa.Storage.get('lme_showbuttonwn') === true);
      targetContainer.addClass('lme-buttons');
      applyHidden(map);

      Lampa.Controller.toggle("full_start");

      if (lastStartInstance && lastStartInstance.html && fullContainer[0] === lastStartInstance.html[0]) {
        var firstButton = targetContainer.find('.full-start__button.selector').not('.hide').not('.lme-button-hide').first();
        if (firstButton.length) lastStartInstance.last = firstButton[0];
      }
    }

    function openEditor(fullContainer) {
      if (!fullContainer || !fullContainer.length) return;

      var _scanButtons2 = scanButtons(fullContainer, false),
        items = _scanButtons2.items,
        map = _scanButtons2.map;

      var order = normalizeOrder(readArray(ORDER_KEY), items);
      var hidden = new Set(readArray(HIDE_KEY));

      var list = $('<div class="menu-edit-list"></div>');

      order.forEach(function (id) {
        var $btn = map[id];
        if (!$btn || !$btn.length) return;

        var title = getButtonTitle(id, $btn);
        var icon = $btn.find('svg').first().prop('outerHTML') || '';

        var item = $("<div class=\"menu-edit-list__item\" data-id=\"".concat(id, "\">\n            <div class=\"menu-edit-list__icon\"></div>\n            <div class=\"menu-edit-list__title\">").concat(title, "</div>\n            <div class=\"menu-edit-list__move move-up selector\">\n                <svg width=\"22\" height=\"14\" viewBox=\"0 0 22 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <path d=\"M2 12L11 3L20 12\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n            <div class=\"menu-edit-list__move move-down selector\">\n                <svg width=\"22\" height=\"14\" viewBox=\"0 0 22 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <path d=\"M2 2L11 11L20 2\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n            <div class=\"menu-edit-list__toggle toggle selector\">\n                <svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect x=\"1.89111\" y=\"1.78369\" width=\"21.793\" height=\"21.793\" rx=\"3.5\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588\" stroke=\"currentColor\" stroke-width=\"3\" class=\"dot\" opacity=\"0\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n        </div>"));

        if (icon) item.find('.menu-edit-list__icon').append(icon);

        item.toggleClass('lme-button-hidden', hidden.has(id));
        item.find('.dot').attr('opacity', hidden.has(id) ? 0 : 1);

        item.find('.move-up').on('hover:enter', function () {
          var prev = item.prev();
          if (prev.length) item.insertBefore(prev);
        });

        item.find('.move-down').on('hover:enter', function () {
          var next = item.next();
          if (next.length) item.insertAfter(next);
        });

        item.find('.toggle').on('hover:enter', function () {
          item.toggleClass('lme-button-hidden');
          item.find('.dot').attr('opacity', item.hasClass('lme-button-hidden') ? 0 : 1);
        });

        list.append(item);
      });

      Lampa.Modal.open({
        title: 'Редактировать кнопки',
        html: list,
        size: 'small',
        scroll_to_center: true,
        onBack: function onBack() {
          var newOrder = [];
          var newHidden = [];
          list.find('.menu-edit-list__item').each(function () {
            var id = $(this).data('id');
            if (!id) return;
            newOrder.push(id);
            if ($(this).hasClass('lme-button-hidden')) newHidden.push(id);
          });
          Lampa.Storage.set(ORDER_KEY, newOrder);
          Lampa.Storage.set(HIDE_KEY, newHidden);
          Lampa.Modal.close();
          applyLayout(fullContainer);
          Lampa.Controller.toggle("full_start");
        },
        onSelect: function () {
          // Если есть кнопка "Сохранить" или select, но в оригинале только back
        }
      });
    }

    function openEditorFromSettings() {
      if (!lastFullContainer || !lastFullContainer.length || !document.body.contains(lastFullContainer[0])) {
        var current = resolveActiveFullContainer();
        if (current && current.length) {
          lastFullContainer = current;
        }
      }

      if (!lastFullContainer || !lastFullContainer.length) {
        Lampa.Modal.open({
          title: 'Ошибка',
          html: $('<div class="modal__text">Откройте карточку фильма для редактирования кнопок</div>'),
          size: 'small',
          onBack: function () {
            Lampa.Modal.close();
            Lampa.Controller.toggle("settings_component");
          }
        });
        return;
      }

      openEditor(lastFullContainer);
    }

    function main$7() {
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'build' && e.name === 'start' && e.item && e.item.html) {
          lastStartInstance = e.item;
        }
        if (e.type === 'complite') {
          var fullContainer = getFullContainer(e);
          if (!fullContainer) return;
          lastFullContainer = fullContainer;
          applyLayout(fullContainer);
        }
      });
    }
    var showButton = {
      main: main$7,
      openEditorFromSettings: openEditorFromSettings
    };

    function main$6() {
      Lampa.SettingsApi.addComponent({
        component: "lme",
        name: 'Кнопки в карточке',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: "lme",
        param: {
          name: "lme_showbutton",
          type: "trigger",
          "default": false
        },
        field: {
          name: 'Все кнопки действий в карточке',
          description: Lampa.Lang.translate('lme_showbutton_desc')
        },
        onChange: function onChange(value) {
          Lampa.Settings.update();
          setTimeout(function () {
            Lampa.Settings.render();
          }, 100);
        }
      });

      if (Lampa.Storage.get('lme_showbutton') === true) {
        Lampa.SettingsApi.addParam({
          component: "lme",
          param: {
            name: "lme_showbuttonwn",
            type: "trigger",
            "default": false
          },
          field: {
            name: 'Только иконки',
            description: Lampa.Lang.translate('lme_showbuttonwn_desc')
          },
          onChange: function onChange(value) {
            Lampa.Settings.update();
          }
        });

        Lampa.SettingsApi.addParam({
          component: "lme",
          param: {
            name: "lme_button_editor",
            type: "button"
          },
          field: {
            name: 'Редактировать кнопки',
            description: 'Изменить порядок и скрыть кнопки в карточке'
          },
          onChange: function onChange() {
            showButton.openEditorFromSettings();
          }
        });
      }
    }
    var CONFIG = {
      main: main$6
    };

    var manifest = {
      type: "other",
      version: "0.2.4",
      author: '@lme_chat',
      name: "Кнопки в карточке",
      description: "Выводит все кнопки действий в карточке. Добавляет карандаш в хедер и пункт в настройках для редактирования.",
      component: "lme"
    };

    function add() {
      Lang.main();
      Lampa.Manifest.plugins = manifest;
      CONFIG.main();
      if (Lampa.Storage.get('lme_showbutton') === true) {
        showButton.main();
      }
    }

    function startPlugin() {
      window.plugin_lme_ready = true;
      if (window.appready) add();
      else {
        Lampa.Listener.follow("app", function (e) {
          if (e.type === "ready") add();
        });
      }
    }

    if (!window.plugin_lme_ready) startPlugin();

})();
