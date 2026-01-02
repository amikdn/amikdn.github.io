(function () {
    'use strict';

    function initLang() {
      Lampa.Lang.add({
        cardbtn_all_desc: {
          ru: "Выводит все кнопки действий в карточке в одной строке"
        },
        cardbtn_icons_desc: {
          ru: "Показывать только иконки кнопок"
        }
      });
    }
    var LangInit = {
      run: initLang
    };

    var STYLE_TAG = 'cardbtn-style';
    var ORDER_STORAGE = 'cardbtn_order';
    var HIDE_STORAGE = 'cardbtn_hidden';
    var currentCard = null;
    var currentActivity = null;

    var DEFAULT_LABELS = {
      'button--play': function () { return Lampa.Lang.translate('title_watch'); },
      'button--book': function () { return Lampa.Lang.translate('settings_input_links'); },
      'button--reaction': function () { return Lampa.Lang.translate('title_reactions'); },
      'button--subscribe': function () { return Lampa.Lang.translate('title_subscribe'); },
      'button--options': function () { return Lampa.Lang.translate('more'); },
      'view--torrent': function () { return Lampa.Lang.translate('full_torrents'); },
      'view--trailer': function () { return Lampa.Lang.translate('full_trailers'); }
    };

    function addStyles() {
      if (document.getElementById(STYLE_TAG)) return;
      var css = "\n        .card-buttons {\n            display: flex;\n            flex-wrap: wrap;\n            gap: 10px;\n        }\n        .card-button-hidden {\n            display: none !important;\n        }\n        .card-icons-only span {\n            display: none;\n        }\n        .head__action.edit-card svg {\n            width: 26px;\n            height: 26px;\n        }\n    ";
      $('head').append("<style id=\"".concat(STYLE_TAG, "\">").concat(css, "</style>"));
    }

    function getStoredArray(key) {
      var data = Lampa.Storage.get(key);
      if (Array.isArray(data)) return data.slice();
      if (typeof data === 'string') {
        try {
          var parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return data.split(',').map(function (v) { return v.trim(); }).filter(Boolean);
        }
      }
      return [];
    }

    function getCardContainer(e) {
      if (e && e.body) return e.body;
      if (e && e.link && e.link.html) return e.link.html;
      if (e && e.object && e.object.activity && typeof e.object.activity.render === 'function') return e.object.activity.render();
      return null;
    }

    function findActiveCard() {
      var active = $('.full-start-new').first();
      return active.length ? active : null;
    }

    function extractButtonKey($element) {
      var classes = ($element.attr('class') || '').split(/\s+/);
      var keyClass = classes.find(function (c) {
        return c.startsWith('button--') && c !== 'button--priority';
      }) || classes.find(function (c) {
        return c.startsWith('view--');
      });
      if (keyClass) return keyClass;
      var dataKey = $element.data('id') || $element.data('name') || $element.attr('data-name');
      if (dataKey) return "data:".concat(dataKey);
      var textKey = $element.text().trim();
      if (textKey) return "text:".concat(textKey);
      return "hash:".concat(Lampa.Utils.hash($element.clone().removeClass('focus').prop('outerHTML')));
    }

    function extractButtonLabel(key, $element) {
      var text = $element.find('span').first().text().trim() || $element.text().trim();
      if (text) return text;
      if (DEFAULT_LABELS[key]) return DEFAULT_LABELS[key]();
      return key;
    }

    function collectButtons(container, remove) {
      var mainArea = container.find('.full-start-new__buttons');
      var extraArea = container.find('.buttons--container');
      var keys = [];
      var elements = {};
      function process($items) {
        $items.each(function () {
          var $item = $(this);
          if ($item.hasClass('button--play') || $item.hasClass('button--priority')) return;
          var key = extractButtonKey($item);
          if (!key || elements[key]) return;
          elements[key] = remove ? $item.detach() : $item;
          keys.push(key);
        });
      }
      process(mainArea.find('.full-start__button'));
      process(extraArea.find('.full-start__button'));
      return {
        keys: keys,
        elements: elements,
        mainArea: mainArea,
        extraArea: extraArea
      };
    }

    function buildOrder(saved, available) {
      var result = [];
      var known = new Set(available);
      saved.forEach(function (k) {
        if (known.has(k)) result.push(k);
      });
      available.forEach(function (k) {
        if (!result.includes(k)) result.push(k);
      });
      return result;
    }

    function hideButtons(elements) {
      var hidden = new Set(getStoredArray(HIDE_STORAGE));
      Object.keys(elements).forEach(function (k) {
        elements[k].toggleClass('card-button-hidden', hidden.has(k));
      });
    }

    function rebuildCard(container) {
      if (Lampa.Storage.get('cardbtn_showall') !== true) return;

      if (!container || !container.length) return;

      addStyles();

      var header = container.find('.head__actions');
      if (header.length) {
        var pencil = header.find('.edit-card');
        if (pencil.length === 0) {
          pencil = $('<div class="head__action selector edit-card">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>' +
            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>' +
            '</svg>' +
            '</div>');

          header.find('.open--settings').after(pencil);

          pencil.on('hover:enter', function () {
            startEditor(container, false);
          });
        }
      }

      var priorityBtn = container.find('.full-start-new__buttons .button--priority').detach();
      container.find('.full-start-new__buttons .button--play').remove();

      var collected = collectButtons(container, true),
        keys = collected.keys,
        elements = collected.elements,
        mainArea = collected.mainArea;

      var saved = getStoredArray(ORDER_STORAGE);
      var ordered = buildOrder(saved, keys);

      if (saved.length === 0) {
        ordered.sort(function(a, b) {
          var aOnline = a.startsWith('button--');
          var bOnline = b.startsWith('button--');
          if (aOnline && !bOnline) return -1;
          if (!aOnline && bOnline) return 1;
          return 0;
        });
      }

      mainArea.empty();
      if (priorityBtn.length) mainArea.append(priorityBtn);
      ordered.forEach(function (k) {
        if (elements[k]) mainArea.append(elements[k]);
      });

      mainArea.toggleClass('card-icons-only', Lampa.Storage.get('cardbtn_icons') === true);
      mainArea.addClass('card-buttons');
      hideButtons(elements);

      Lampa.Controller.toggle("full_start");

      if (currentActivity && currentActivity.html && container[0] === currentActivity.html[0]) {
        var first = mainArea.find('.full-start__button.selector').not('.hide').not('.card-button-hidden').first();
        if (first.length) currentActivity.last = first[0];
      }
    }

    function startEditor(container, fromSettings = false) {
      if (!container || !container.length) return;

      var collected = collectButtons(container, false),
        keys = collected.keys,
        elements = collected.elements;

      var ordered = buildOrder(getStoredArray(ORDER_STORAGE), keys);
      var hidden = new Set(getStoredArray(HIDE_STORAGE));

      var editorList = $('<div class="menu-edit-list"></div>');

      ordered.forEach(function (k) {
        var $elem = elements[k];
        if (!$elem || !$elem.length) return;

        var label = extractButtonLabel(k, $elem);
        var svg = $elem.find('svg').first().prop('outerHTML') || '';

        var row = $("<div class=\"menu-edit-list__item\" data-id=\"".concat(k, "\">\n            <div class=\"menu-edit-list__icon\"></div>\n            <div class=\"menu-edit-list__title\">").concat(label, "</div>\n            <div class=\"menu-edit-list__move move-up selector\">\n                <svg width=\"22\" height=\"14\" viewBox=\"0 0 22 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <path d=\"M2 12L11 3L20 12\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n            <div class=\"menu-edit-list__move move-down selector\">\n                <svg width=\"22\" height=\"14\" viewBox=\"0 0 22 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <path d=\"M2 2L11 11L20 2\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n            <div class=\"menu-edit-list__toggle toggle selector\">\n                <svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect x=\"1.89111\" y=\"1.78369\" width=\"21.793\" height=\"21.793\" rx=\"3.5\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588\" stroke=\"currentColor\" stroke-width=\"3\" class=\"dot\" opacity=\"0\" stroke-linecap=\"round\"/>\n                </svg>\n            </div>\n        </div>"));

        if (svg) row.find('.menu-edit-list__icon').append(svg);

        row.toggleClass('menu-edit-list__item-hidden', hidden.has(k));
        row.find('.dot').attr('opacity', hidden.has(k) ? 0 : 1);

        row.find('.move-up').on('hover:enter', function () {
          var prev = row.prev();
          if (prev.length) row.insertBefore(prev);
        });

        row.find('.move-down').on('hover:enter', function () {
          var next = row.next();
          if (next.length) row.insertAfter(next);
        });

        row.find('.toggle').on('hover:enter', function () {
          row.toggleClass('menu-edit-list__item-hidden');
          row.find('.dot').attr('opacity', row.hasClass('menu-edit-list__item-hidden') ? 0 : 1);
        });

        editorList.append(row);
      });

      Lampa.Modal.open({
        title: 'Редактировать кнопки',
        html: editorList,
        size: 'small',
        scroll_to_center: true,
        onBack: function () {
          var newOrder = [];
          var newHidden = [];
          editorList.find('.menu-edit-list__item').each(function () {
            var k = $(this).data('id');
            if (!k) return;
            newOrder.push(k);
            if ($(this).hasClass('menu-edit-list__item-hidden')) newHidden.push(k);
          });
          Lampa.Storage.set(ORDER_STORAGE, newOrder);
          Lampa.Storage.set(HIDE_STORAGE, newHidden);
          Lampa.Modal.close();
          rebuildCard(container);
          setTimeout(function () {
            if (fromSettings) {
              Lampa.Controller.toggle("settings_component");
            } else {
              Lampa.Controller.toggle("full_start");
            }
          }, 100);
        }
      });
    }

    function startEditorFromSettings() {
      if (!currentCard || !currentCard.length || !document.body.contains(currentCard[0])) {
        var active = findActiveCard();
        if (active && active.length) {
          currentCard = active;
        }
      }

      if (!currentCard || !currentCard.length) {
        Lampa.Modal.open({
          title: 'Ошибка',
          html: $('<div class="modal__text">Откройте карточку фильма для редактирования кнопок</div>'),
          size: 'small',
          onBack: function () {
            Lampa.Modal.close();
            setTimeout(function () {
              Lampa.Controller.toggle("settings_component");
            }, 100);
          }
        });
        return;
      }

      startEditor(currentCard, true);
    }

    function cardListener() {
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'build' && e.name === 'start' && e.item && e.item.html) {
          currentActivity = e.item;
        }
        if (e.type === 'complite') {
          var container = getCardContainer(e);
          if (!container) return;
          currentCard = container;
          rebuildCard(container);
        }
      });
    }
    var CardHandler = {
      run: cardListener,
      fromSettings: startEditorFromSettings
    };

    function setupSettings() {
      Lampa.SettingsApi.addComponent({
        component: "cardbtn",
        name: 'Кнопки в карточке',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: "cardbtn",
        param: {
          name: "cardbtn_showall",
          type: "trigger",
          "default": false
        },
        field: {
          name: 'Все кнопки действий в карточке (Требуется перезагрузка приложения)',
          description: Lampa.Lang.translate('cardbtn_all_desc')
        },
        onChange: function () {
          Lampa.Settings.update();
        }
      });

      if (Lampa.Storage.get('cardbtn_showall') === true) {
        Lampa.SettingsApi.addParam({
          component: "cardbtn",
          param: {
            name: "cardbtn_icons",
            type: "trigger",
            "default": false
          },
          field: {
            name: 'Только иконки',
            description: Lampa.Lang.translate('cardbtn_icons_desc')
          },
          onChange: function () {
            Lampa.Settings.update();
          }
        });

        Lampa.SettingsApi.addParam({
          component: "cardbtn",
          param: {
            name: "cardbtn_editor",
            type: "button"
          },
          field: {
            name: 'Редактировать кнопки',
            description: 'Изменить порядок и скрыть кнопки в карточке'
          },
          onChange: function () {
            CardHandler.fromSettings();
          }
        });
      }
    }
    var SettingsConfig = {
      run: setupSettings
    };

    var pluginInfo = {
      type: "other",
      version: "1.0.0",
      author: '@custom',
      name: "Кастомные кнопки карточки",
      description: "Управление кнопками действий в карточке фильма/сериала",
      component: "cardbtn"
    };

    function loadPlugin() {
      LangInit.run();
      Lampa.Manifest.plugins = pluginInfo;
      SettingsConfig.run();
      if (Lampa.Storage.get('cardbtn_showall') === true) {
        CardHandler.run();
      }
    }

    function init() {
      window.plugin_cardbtn_ready = true;
      if (window.appready) loadPlugin();
      else {
        Lampa.Listener.follow("app", function (e) {
          if (e.type === "ready") loadPlugin();
        });
      }
    }

    if (!window.plugin_cardbtn_ready) init();

})();
