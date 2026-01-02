(function () {
    'use strict';

    // Языковые строки
    function initLang() {
      Lampa.Lang.add({
        cbe_main_desc: {
          ru: "Собирает все кнопки действий в одну строку в карточке"
        },
        cbe_icons_only_desc: {
          ru: "Скрывает текст, оставляя только иконки"
        }
      });
    }

    // Константы
    const STYLE_ID = 'cbe-card-style';
    const ORDER_KEY = 'cbe_button_order';
    const HIDE_KEY = 'cbe_button_hidden';
    const SHOW_ALL_KEY = 'cbe_show_all_buttons';
    const ICONS_ONLY_KEY = 'cbe_icons_only';
    const VERSION_KEY = 'cbe_plugin_version';
    const CURRENT_VERSION = '1.0.0';

    let activeCard = null;
    let cardInstance = null;

    // Заголовки по умолчанию для кнопок без текста
    const DEFAULT_LABELS = {
      'button--play': () => Lampa.Lang.translate('title_watch'),
      'button--book': () => Lampa.Lang.translate('settings_input_links'),
      'button--reaction': () => Lampa.Lang.translate('title_reactions'),
      'button--subscribe': () => Lampa.Lang.translate('title_subscribe'),
      'button--options': () => Lampa.Lang.translate('more'),
      'view--torrent': () => Lampa.Lang.translate('full_torrents'),
      'view--trailer': () => Lampa.Lang.translate('full_trailers')
    };

    // Стили
    function addStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const css = `
        .cbe-button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 0.5em;
        }
        .cbe-hidden {
            display: none !important;
        }
        .cbe-icons-only span {
            display: none;
        }
        .head__action.cbe-editor svg {
            width: 26px;
            height: 26px;
        }
      `;
      $('head').append(`<style id="${STYLE_ID}">${css}</style>`);
    }

    // Чтение массива из Storage
    function getStoredArray(key) {
      const val = Lampa.Storage.get(key);
      if (Array.isArray(val)) return val.slice();
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { }
        return val.split(',').map(v => v.trim()).filter(Boolean);
      }
      return [];
    }

    // Получение контейнера карточки
    function getCardContainer(e) {
      if (e?.body) return e.body;
      if (e?.link?.html) return e.link.html;
      if (e?.object?.activity?.render) return e.object.activity.render();
      return null;
    }

    // ID кнопки
    function identifyButton(btn) {
      const classes = (btn.attr('class') || '').split(/\s+/);
      const mainClass = classes.find(c => (c.startsWith('button--') && c !== 'button--priority') || c.startsWith('view--'));
      if (mainClass) return mainClass;

      const dataId = btn.data('id') || btn.data('name') || btn.attr('data-name');
      if (dataId) return `data:${dataId}`;

      const text = btn.text().trim();
      if (text) return `text:${text}`;

      return `hash:${Lampa.Utils.hash(btn.clone().removeClass('focus').prop('outerHTML'))}`;
    }

    // Текст кнопки
    function buttonLabel(id, btn) {
      const text = btn.find('span').first().text().trim() || btn.text().trim();
      return text || (DEFAULT_LABELS[id] ? DEFAULT_LABELS[id]() : id);
    }

    // Сбор кнопок
    function collectButtons(container, remove = false) {
      const mainRow = container.find('.full-start-new__buttons');
      const extraRow = container.find('.buttons--container');
      const buttons = [];
      const buttonMap = {};

      function process(row) {
        row.find('.full-start__button').each(function () {
          const el = $(this);
          if (el.hasClass('button--play') || el.hasClass('button--priority')) return;

          const id = identifyButton(el);
          if (!id || buttonMap[id]) return;

          buttonMap[id] = remove ? el.detach() : el;
          buttons.push(id);
        });
      }

      process(mainRow);
      process(extraRow);

      return { buttons, buttonMap, mainRow };
    }

    // Нормализация порядка
    function buildOrder(saved, available) {
      const result = [];
      const known = new Set(available);

      saved.forEach(id => { if (known.has(id)) result.push(id); });
      available.forEach(id => { if (!result.includes(id)) result.push(id); });

      return result;
    }

    // Применение скрытия
    function hideButtons(map) {
      const hidden = new Set(getStoredArray(HIDE_KEY));
      Object.keys(map).forEach(id => map[id].toggleClass('cbe-hidden', hidden.has(id)));
    }

    // Основная логика применения
    function rebuildCard(container) {
      if (!Lampa.Storage.get(SHOW_ALL_KEY)) return;

      if (!container || !container.length) return;

      addStyles();

      // Кнопка редактора в хедере
      const header = container.find('.head__actions');
      if (header.length && !header.find('.cbe-editor').length) {
        const editorBtn = $(`
          <div class="head__action selector cbe-editor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        `);
        header.find('.open--settings').after(editorBtn);
        editorBtn.on('hover:enter', () => openButtonEditor(container));
      }

      // Собираем кнопки
      const priority = container.find('.full-start-new__buttons .button--priority').detach();
      container.find('.full-start-new__buttons .button--play').remove();

      const { buttons, buttonMap, mainRow } = collectButtons(container, true);

      let order = buildOrder(getStoredArray(ORDER_KEY), buttons);

      // Автосортировка при первом использовании
      if (getStoredArray(ORDER_KEY).length === 0) {
        order.sort((a, b) => {
          const aOnline = a.startsWith('button--');
          const bOnline = b.startsWith('button--');
          return aOnline && !bOnline ? -1 : !aOnline && bOnline ? 1 : 0;
        });
      }

      mainRow.empty();
      if (priority.length) mainRow.append(priority);

      order.forEach(id => {
        if (buttonMap[id]) mainRow.append(buttonMap[id]);
      });

      mainRow.toggleClass('cbe-icons-only', Lampa.Storage.get(ICONS_ONLY_KEY) === true);
      mainRow.addClass('cbe-button-row');
      hideButtons(buttonMap);

      Lampa.Controller.toggle('full_start');

      if (cardInstance?.html && container[0] === cardInstance.html[0]) {
        const first = mainRow.find('.full-start__button.selector').not('.hide').not('.cbe-hidden').first();
        if (first.length) cardInstance.last = first[0];
      }
    }

    // Редактор кнопок
    function openButtonEditor(container) {
      const { buttons, buttonMap } = collectButtons(container, false);
      const currentOrder = buildOrder(getStoredArray(ORDER_KEY), buttons);
      const hidden = new Set(getStoredArray(HIDE_KEY));

      const editorList = $('<div class="menu-edit-list"></div>');

      currentOrder.forEach(id => {
        const btn = buttonMap[id];
        if (!btn?.length) return;

        const label = buttonLabel(id, btn);
        const icon = btn.find('svg').first().prop('outerHTML') || '';

        const row = $(`
          <div class="menu-edit-list__item" data-id="${id}">
            <div class="menu-edit-list__icon"></div>
            <div class="menu-edit-list__title">${label}</div>
            <div class="menu-edit-list__move move-up selector">
              <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
            </div>
            <div class="menu-edit-list__move move-down selector">
              <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
            </div>
            <div class="menu-edit-list__toggle toggle selector">
              <svg width="26" height="26" viewBox="0 0 26 26">
                <rect x="1.9" y="1.8" width="21.8" height="21.8" rx="3.5" stroke="currentColor" stroke-width="3"/>
                <path d="M7.4 13L10.8 16.3L18.1 9" stroke="currentColor" stroke-width="3" class="dot" opacity="0"/>
              </svg>
            </div>
          </div>
        `);

        if (icon) row.find('.menu-edit-list__icon').append(icon);
        row.toggleClass('lme-button-hidden', hidden.has(id));
        row.find('.dot').attr('opacity', hidden.has(id) ? 0 : 1);

        row.find('.move-up').on('hover:enter click', () => {
          const prev = row.prev();
          if (prev.length) row.insertBefore(prev);
        });

        row.find('.move-down').on('hover:enter click', () => {
          const next = row.next();
          if (next.length) row.insertAfter(next);
        });

        row.find('.toggle').on('hover:enter click', () => {
          row.toggleClass('lme-button-hidden');
          row.find('.dot').attr('opacity', row.hasClass('lme-button-hidden') ? 0 : 1);
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
            const id = $(this).data('id');
            if (!id) return;
            newOrder.push(id);
            if ($(this).hasClass('lme-button-hidden')) newHidden.push(id);
          });

          Lampa.Storage.set(ORDER_KEY, newOrder);
          Lampa.Storage.set(HIDE_KEY, newHidden);
          Lampa.Modal.close();
          rebuildCard(container);
          Lampa.Controller.toggle('full_start');
        }
      });
    }

    // Редактор из настроек
    function openFromSettings() {
      const current = $('.full-start-new').first();
      if (!current.length) {
        Lampa.Modal.open({
          title: 'Ошибка',
          html: $('<div class="modal__text">Откройте карточку фильма</div>'),
          size: 'small',
          onBack: () => {
            Lampa.Modal.close();
            Lampa.Controller.toggle('settings_component');
          }
        });
        return;
      }
      openButtonEditor(current);
    }

    // Слушатель событий карточки
    function initCardListener() {
      Lampa.Listener.follow('full', e => {
        if (e.type === 'build' && e.name === 'start' && e.item?.html) {
          cardInstance = e.item;
        }
        if (e.type === 'complite') {
          const cont = getCardContainer(e);
          if (cont) {
            activeCard = cont;
            rebuildCard(cont);
          }
        }
      });
    }

    // Настройки
    function setupSettings() {
      Lampa.SettingsApi.addComponent({
        component: 'cbe',
        name: 'Кнопки в карточке',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: 'cbe',
        param: { name: SHOW_ALL_KEY, type: 'trigger', default: false },
        field: {
          name: 'Все кнопки в одной строке',
          description: Lampa.Lang.translate('cbe_main_desc')
        },
        onChange: () => {
          Lampa.Settings.update();
          setTimeout(() => Lampa.Settings.render(), 100);
        }
      });

      if (Lampa.Storage.get(SHOW_ALL_KEY)) {
        Lampa.SettingsApi.addParam({
          component: 'cbe',
          param: { name: ICONS_ONLY_KEY, type: 'trigger', default: false },
          field: {
            name: 'Только иконки',
            description: Lampa.Lang.translate('cbe_icons_only_desc')
          },
          onChange: () => Lampa.Settings.update()
        });

        Lampa.SettingsApi.addParam({
          component: 'cbe',
          param: { name: 'cbe_edit_btn', type: 'button' },
          field: {
            name: 'Редактировать кнопки',
            description: 'Изменить порядок и скрытие'
          },
          onChange: openFromSettings
        });
      }
    }

    // Манифест
    const pluginManifest = {
      type: 'other',
      version: CURRENT_VERSION,
      author: '@custom',
      name: 'Кнопки в карточке',
      description: 'Управление кнопками действий в карточке фильма',
      component: 'cbe'
    };

    // Инициализация
    function initPlugin() {
      initLang();
      Lampa.Manifest.plugins = pluginManifest;

      // Очистка старого кэша от LME
      ['lme_buttonsort', 'lme_buttonhide', 'lme_showbutton', 'lme_showbuttonwn'].forEach(k => Lampa.Storage.del(k));

      // Очистка/обновление собственного кэша
      const savedVer = Lampa.Storage.get(VERSION_KEY);
      if (savedVer !== CURRENT_VERSION) {
        Lampa.Storage.del(ORDER_KEY);
        Lampa.Storage.del(HIDE_KEY);
        Lampa.Storage.set(VERSION_KEY, CURRENT_VERSION);
      }

      setupSettings();

      if (Lampa.Storage.get(SHOW_ALL_KEY)) {
        initCardListener();
      }
    }

    // Запуск
    function start() {
      window.plugin_cbe_ready = true;
      if (window.appready) initPlugin();
      else Lampa.Listener.follow('app', e => { if (e.type === 'ready') initPlugin(); });
    }

    if (!window.plugin_cbe_ready) start();

})();
