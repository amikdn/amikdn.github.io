(function () {
    'use strict';

    const STYLE_TAG = 'cardbtn-style';
    const ORDER_STORAGE = 'cardbtn_order';
    const HIDE_STORAGE = 'cardbtn_hidden';

    const DEFAULT_LABELS = {
      'button--play': () => Lampa.Lang.translate('title_watch'),
      'button--book': () => Lampa.Lang.translate('settings_input_links'),
      'button--reaction': () => Lampa.Lang.translate('title_reactions'),
      'button--subscribe': () => Lampa.Lang.translate('title_subscribe'),
      'button--options': () => Lampa.Lang.translate('more'),
      'view--torrent': () => Lampa.Lang.translate('full_torrents'),
      'view--trailer': () => Lampa.Lang.translate('full_trailers')
    };

    const SAD_SMILE_SVG = `
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="9" r="1.5" fill="currentColor"/>
        <path d="M8 16c1.5 1.5 3 1.5 4 1.5s2.5 0 4 -1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    function addStyles() {
      if (document.getElementById(STYLE_TAG)) return;
      const css = `
        .card-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .card-button-hidden {
            display: none !important;
        }
        .card-icons-only span {
            display: none;
        }
        .card-full-text .full-start__button {
            min-width: 120px !important;
        }
        .card-full-text span {
            display: block !important;
            font-size: 0.9em;
        }
        .head__action.edit-card svg {
            width: 26px;
            height: 26px;
        }
      `;
      $('head').append(`<style id="${STYLE_TAG}">${css}</style>`);
    }

    function getStoredArray(key) {
      const data = Lampa.Storage.get(key);
      if (Array.isArray(data)) return data.slice();
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return data.split(',').map(v => v.trim()).filter(Boolean);
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
      const active = $('.full-start-new').first();
      return active.length ? active : null;
    }

    function extractButtonKey($element) {
      const classes = ($element.attr('class') || '').split(/\s+/);
      const keyClass = classes.find(c => c.startsWith('button--') && c !== 'button--priority') ||
                       classes.find(c => c.startsWith('view--'));
      if (keyClass) return keyClass;
      const dataKey = $element.data('id') || $element.data('name') || $element.attr('data-name');
      if (dataKey) return `data:${dataKey}`;
      const textKey = $element.text().trim();
      if (textKey) return `text:${textKey}`;
      return `hash:${Lampa.Utils.hash($element.clone().removeClass('focus').prop('outerHTML'))}`;
    }

    function extractButtonLabel(key, $element) {
      const text = $element.find('span').first().text().trim() || $element.text().trim();
      if (text) return text;
      if (DEFAULT_LABELS[key]) return DEFAULT_LABELS[key]();
      return key;
    }

    function collectButtons(container, remove) {
      const mainArea = container.find('.full-start-new__buttons');
      const extraArea = container.find('.buttons--container');
      const keys = [];
      const elements = {};
      function process($items) {
        $items.each(function () {
          const $item = $(this);
          if ($item.hasClass('button--play') || $item.hasClass('button--priority')) return;
          const key = extractButtonKey($item);
          if (!key || elements[key]) return;
          elements[key] = remove ? $item.detach() : $item;
          keys.push(key);
        });
      }
      process(mainArea.find('.full-start__button'));
      process(extraArea.find('.full-start__button'));
      return {
        keys,
        elements,
        mainArea,
        extraArea
      };
    }

    function buildOrder(saved, available) {
      const result = [];
      const known = new Set(available);
      saved.forEach(k => {
        if (known.has(k)) result.push(k);
      });
      available.forEach(k => {
        if (!result.includes(k)) result.push(k);
      });
      return result;
    }

    function hideButtons(elements) {
      const hidden = new Set(getStoredArray(HIDE_STORAGE));
      Object.keys(elements).forEach(k => {
        elements[k].toggleClass('card-button-hidden', hidden.has(k));
      });
    }

    function rebuildCard(container) {
      if (Lampa.Storage.get('cardbtn_showall') !== true) {
        // Если выключено — ничего не делаем (стандартный вид остаётся)
        return;
      }

      if (!container || !container.length) return;

      addStyles();

      const header = container.find('.head__actions');
      if (header.length) {
        let pencil = header.find('.edit-card');
        if (pencil.length === 0) {
          pencil = $(`
            <div class="head__action selector edit-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
          `);

          header.find('.open--settings').after(pencil);

          pencil.on('hover:enter', () => {
            startEditor(container, false);
          });
        }
      }

      const priorityBtn = container.find('.full-start-new__buttons .button--priority').detach();
      container.find('.full-start-new__buttons .button--play').remove();

      const collected = collectButtons(container, true);
      const { keys, elements, mainArea } = collected;

      const saved = getStoredArray(ORDER_STORAGE);
      let ordered = buildOrder(saved, keys);

      if (saved.length === 0) {
        ordered.sort((a, b) => {
          const aOnline = a.startsWith('button--');
          const bOnline = b.startsWith('button--');
          if (aOnline && !bOnline) return -1;
          if (!aOnline && bOnline) return 1;
          return 0;
        });
      }

      mainArea.empty();
      if (priorityBtn.length) mainArea.append(priorityBtn);
      ordered.forEach(k => {
        if (elements[k]) mainArea.append(elements[k]);
      });

      const mode = Lampa.Storage.get('cardbtn_textmode', 'auto');
      mainArea.toggleClass('card-icons-only', mode === 'icons');
      mainArea.toggleClass('card-full-text', mode === 'full');

      mainArea.addClass('card-buttons');
      hideButtons(elements);

      Lampa.Controller.toggle("full_start");
    }

    function showEditError() {
      const errorHtml = $(`
        <div style="text-align:center; padding:20px;">
          ${SAD_SMILE_SVG}
          <div style="margin-top:20px; font-size:1.2em;">Редактировать кнопки можно только в открытой карточке фильма</div>
        </div>
      `);

      Lampa.Modal.open({
        title: 'Ошибка',
        html: errorHtml,
        size: 'medium',
        onBack: () => {
          Lampa.Modal.close();
          setTimeout(() => {
            Lampa.Controller.toggle("settings_component");
          }, 100);
        }
      });
    }

    function startEditor(container, fromSettings = false) {
      if (!container || !container.length || !container.find('.full-start-new').length) {
        showEditError();
        return;
      }

      const collected = collectButtons(container, false);
      const { keys, elements } = collected;

      if (keys.length === 0) {
        showEditError();
        return;
      }

      const ordered = buildOrder(getStoredArray(ORDER_STORAGE), keys);
      const hidden = new Set(getStoredArray(HIDE_STORAGE));

      const editorList = $('<div class="menu-edit-list"></div>');

      ordered.forEach(k => {
        const $elem = elements[k];
        if (!$elem || !$elem.length) return;

        const label = extractButtonLabel(k, $elem);
        const svg = $elem.find('svg').first().prop('outerHTML') || '';

        const row = $(`
          <div class="menu-edit-list__item" data-id="${k}">
            <div class="menu-edit-list__icon"></div>
            <div class="menu-edit-list__title">${label}</div>
            <div class="menu-edit-list__move move-up selector">
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="menu-edit-list__move move-down selector">
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="menu-edit-list__toggle toggle selector">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>
                <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        `);

        if (svg) row.find('.menu-edit-list__icon').append(svg);

        row.toggleClass('menu-edit-list__item-hidden', hidden.has(k));
        row.find('.dot').attr('opacity', hidden.has(k) ? 0 : 1);

        row.find('.move-up').on('hover:enter', () => {
          const prev = row.prev();
          if (prev.length) row.insertBefore(prev);
        });

        row.find('.move-down').on('hover:enter', () => {
          const next = row.next();
          if (next.length) row.insertAfter(next);
        });

        row.find('.toggle').on('hover:enter', () => {
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
        onBack: () => {
          const newOrder = [];
          const newHidden = [];
          editorList.find('.menu-edit-list__item').each(function () {
            const k = $(this).data('id');
            if (!k) return;
            newOrder.push(k);
            if ($(this).hasClass('menu-edit-list__item-hidden')) newHidden.push(k);
          });
          Lampa.Storage.set(ORDER_STORAGE, newOrder);
          Lampa.Storage.set(HIDE_STORAGE, newHidden);
          Lampa.Modal.close();
          rebuildCard(container);
          setTimeout(() => {
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
      const activeCard = findActiveCard();
      if (!activeCard) {
        showEditError();
        return;
      }
      startEditor(activeCard, true);
    }

    function cardListener() {
      Lampa.Listener.follow('full', e => {
        if (e.type === 'complite') {
          const container = getCardContainer(e);
          if (container) rebuildCard(container);
        }
      });
    }

    const CardHandler = {
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
          default: false
        },
        field: {
          name: 'Все кнопки действий в карточке',
          description: 'Выводит все кнопки действий в карточке в одной строке'
        },
        onChange: (value) => {
          Lampa.Settings.update();
          const active = findActiveCard();
          if (active) {
            if (value) {
              rebuildCard(active);
            } else {
              Lampa.Activity.reload(); // Сброс к стандартному виду
            }
          }
        }
      });

      if (Lampa.Storage.get('cardbtn_showall') === true) {
        Lampa.SettingsApi.addParam({
          component: "cardbtn",
          param: {
            name: "cardbtn_textmode",
            type: "select",
            values: {
              auto: 'Авто (как в Lampa)',
              icons: 'Только иконки',
              full: 'Полные кнопки с текстом'
            },
            default: 'auto'
          },
          field: {
            name: 'Отображение кнопок',
            description: 'Выберите режим отображения кнопок'
          },
          onChange: () => {
            Lampa.Settings.update();
            const active = findActiveCard();
            if (active) rebuildCard(active);
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
            description: 'Изменить порядок и скрыть кнопки (только в карточке фильма)'
          },
          onChange: () => {
            CardHandler.fromSettings();
          }
        });
      }
    }

    const SettingsConfig = {
      run: setupSettings
    };

    const pluginInfo = {
      type: "other",
      version: "1.1.1",
      author: '@custom',
      name: "Кастомные кнопки карточки",
      description: "Управление кнопками действий в карточке фильма/сериала",
      component: "cardbtn"
    };

    function loadPlugin() {
      Lampa.Manifest.plugins = pluginInfo;
      SettingsConfig.run();
      CardHandler.run(); // Слушатель всегда активен
    }

    function init() {
      window.plugin_cardbtn_ready = true;
      if (window.appready) loadPlugin();
      else {
        Lampa.Listener.follow("app", e => {
          if (e.type === "ready") loadPlugin();
        });
      }
    }

    if (!window.plugin_cardbtn_ready) init();

})();
