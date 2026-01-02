(function () {
    'use strict';

    // Константы
    const STYLE_ID = 'cardbtn-plugin-style';
    const ORDER_KEY = 'cardbtn_button_order';
    const HIDE_KEY = 'cardbtn_button_hidden';
    const SHOW_ALL_KEY = 'cardbtn_show_all';
    const ICONS_ONLY_KEY = 'cardbtn_icons_only';
    const VERSION_KEY = 'cardbtn_plugin_version';
    const CURRENT_VERSION = '1.0.0';

    let currentCardContainer = null;
    let currentCardInstance = null;

    // Заголовки по умолчанию для кнопок без текста
    const DEFAULT_BUTTON_LABELS = {
      'button--play': () => Lampa.Lang.translate('title_watch'),
      'button--book': () => Lampa.Lang.translate('settings_input_links'),
      'button--reaction': () => Lampa.Lang.translate('title_reactions'),
      'button--subscribe': () => Lampa.Lang.translate('title_subscribe'),
      'button--options': () => Lampa.Lang.translate('more'),
      'view--torrent': () => Lampa.Lang.translate('full_torrents'),
      'view--trailer': () => Lampa.Lang.translate('full_trailers')
    };

    // Добавление стилей
    function injectStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const css = `
        .cardbtn-button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 0.5em;
        }
        .cardbtn-button-hidden {
            display: none !important;
        }
        .cardbtn-icons-only span {
            display: none;
        }
        .head__action.cardbtn-editor svg {
            width: 26px;
            height: 26px;
        }
      `;
      $('head').append(`<style id="${STYLE_ID}">${css}</style>`);
    }

    // Чтение массива из Storage
    function loadStoredArray(key) {
      const data = Lampa.Storage.get(key);
      if (Array.isArray(data)) return data.slice();
      if (typeof data === 'string') {
        try { return JSON.parse(data); } catch (_) {}
        return data.split(',').map(item => item.trim()).filter(Boolean);
      }
      return [];
    }

    // Получение контейнера карточки
    function fetchCardContainer(event) {
      if (event?.body) return event.body;
      if (event?.link?.html) return event.link.html;
      if (event?.object?.activity?.render) return event.object.activity.render();
      return null;
    }

    // Уникальный идентификатор кнопки
    function getButtonUniqueId(element) {
      const classes = (element.attr('class') || '').split(/\s+/);
      const primaryClass = classes.find(cls => (cls.startsWith('button--') && cls !== 'button--priority') || cls.startsWith('view--'));
      if (primaryClass) return primaryClass;

      const dataAttr = element.data('id') || element.data('name') || element.attr('data-name');
      if (dataAttr) return `data-${dataAttr}`;

      const visibleText = element.text().trim();
      if (visibleText) return `text-${visibleText}`;

      return `hash-${Lampa.Utils.hash(element.clone().removeClass('focus').prop('outerHTML'))}`;
    }

    // Метка кнопки для отображения в редакторе
    function getButtonDisplayLabel(id, element) {
      const text = element.find('span').first().text().trim() || element.text().trim();
      return text || (DEFAULT_BUTTON_LABELS[id] ? DEFAULT_BUTTON_LABELS[id]() : id);
    }

    // Сбор всех кнопок действий
    function gatherActionButtons(container, detach = false) {
      const primaryRow = container.find('.full-start-new__buttons');
      const secondaryRow = container.find('.buttons--container');
      const buttonList = [];
      const buttonRegistry = {};

      function scanRow(row) {
        row.find('.full-start__button').each(function () {
          const btn = $(this);
          if (btn.hasClass('button--play') || btn.hasClass('button--priority')) return;

          const uid = getButtonUniqueId(btn);
          if (!uid || buttonRegistry[uid]) return;

          buttonRegistry[uid] = detach ? btn.detach() : btn;
          buttonList.push(uid);
        });
      }

      scanRow(primaryRow);
      scanRow(secondaryRow);

      return { buttonList, buttonRegistry, primaryRow };
    }

    // Построение порядка кнопок
    function constructButtonOrder(saved, available) {
      const ordered = [];
      const existing = new Set(available);
      saved.forEach(id => { if (existing.has(id)) ordered.push(id); });
      available.forEach(id => { if (!ordered.includes(id)) ordered.push(id); });
      return ordered;
    }

    // Применение скрытых кнопок
    function applyButtonVisibility(registry) {
      const hiddenSet = new Set(loadStoredArray(HIDE_KEY));
      Object.keys(registry).forEach(uid => registry[uid].toggleClass('cardbtn-button-hidden', hiddenSet.has(uid)));
    }

    // Перестроение карточки
    function refreshCardLayout(container) {
      if (!Lampa.Storage.get(SHOW_ALL_KEY)) return;

      if (!container || !container.length) return;

      injectStyles();

      // Кнопка редактора в верхней панели
      const headerActions = container.find('.head__actions');
      if (headerActions.length && !headerActions.find('.cardbtn-editor').length) {
        const editorIcon = $(`
          <div class="head__action selector cardbtn-editor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        `);
        headerActions.find('.open--settings').after(editorIcon);
        editorIcon.on('hover:enter', () => launchButtonEditor(container));
      }

      // Удаляем приоритетные и основную кнопку просмотра
      const priorityBtn = container.find('.full-start-new__buttons .button--priority').detach();
      container.find('.full-start-new__buttons .button--play').remove();

      const { buttonList, buttonRegistry, primaryRow } = gatherActionButtons(container, true);

      let finalOrder = constructButtonOrder(loadStoredArray(ORDER_KEY), buttonList);

      // Автоматическая сортировка при первом запуске
      if (loadStoredArray(ORDER_KEY).length === 0) {
        finalOrder.sort((a, b) => {
          const aOnline = a.startsWith('button--');
          const bOnline = b.startsWith('button--');
          return aOnline && !bOnline ? -1 : !aOnline && bOnline ? 1 : 0;
        });
      }

      primaryRow.empty();
      if (priorityBtn.length) primaryRow.append(priorityBtn);

      finalOrder.forEach(uid => {
        if (buttonRegistry[uid]) primaryRow.append(buttonRegistry[uid]);
      });

      primaryRow.toggleClass('cardbtn-icons-only', Lampa.Storage.get(ICONS_ONLY_KEY) === true);
      primaryRow.addClass('cardbtn-button-row');
      applyButtonVisibility(buttonRegistry);

      Lampa.Controller.toggle('full_start');

      if (currentCardInstance?.html && container[0] === currentCardInstance.html[0]) {
        const firstVisible = primaryRow.find('.full-start__button.selector').not('.hide').not('.cardbtn-button-hidden').first();
        if (firstVisible.length) currentCardInstance.last = firstVisible[0];
      }
    }

    // Запуск редактора кнопок
    function launchButtonEditor(container) {
      const { buttonList, buttonRegistry } = gatherActionButtons(container, false);
      const activeOrder = constructButtonOrder(loadStoredArray(ORDER_KEY), buttonList);
      const currentlyHidden = new Set(loadStoredArray(HIDE_KEY));

      const editorContainer = $('<div class="menu-edit-list"></div>');

      activeOrder.forEach(uid => {
        const btnElement = buttonRegistry[uid];
        if (!btnElement?.length) return;

        const displayLabel = getButtonDisplayLabel(uid, btnElement);
        const buttonIcon = btnElement.find('svg').first().prop('outerHTML') || '';

        const editorRow = $(`
          <div class="menu-edit-list__item" data-id="${uid}">
            <div class="menu-edit-list__icon"></div>
            <div class="menu-edit-list__title">${displayLabel}</div>
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

        if (buttonIcon) editorRow.find('.menu-edit-list__icon').append(buttonIcon);
        editorRow.toggleClass('menu-edit-list__item-hidden', currentlyHidden.has(uid));
        editorRow.find('.dot').attr('opacity', currentlyHidden.has(uid) ? 0 : 1);

        editorRow.find('.move-up').on('hover:enter click', () => {
          const previous = editorRow.prev();
          if (previous.length) editorRow.insertBefore(previous);
        });

        editorRow.find('.move-down').on('hover:enter click', () => {
          const next = editorRow.next();
          if (next.length) editorRow.insertAfter(next);
        });

        editorRow.find('.toggle').on('hover:enter click', () => {
          editorRow.toggleClass('menu-edit-list__item-hidden');
          editorRow.find('.dot').attr('opacity', editorRow.hasClass('menu-edit-list__item-hidden') ? 0 : 1);
        });

        editorContainer.append(editorRow);
      });

      Lampa.Modal.open({
        title: 'Настройка кнопок',
        html: editorContainer,
        size: 'small',
        scroll_to_center: true,
        onBack: () => {
          const updatedOrder = [];
          const updatedHidden = [];
          editorContainer.find('.menu-edit-list__item').each(function () {
            const uid = $(this).data('id');
            if (!uid) return;
            updatedOrder.push(uid);
            if ($(this).hasClass('menu-edit-list__item-hidden')) updatedHidden.push(uid);
          });

          Lampa.Storage.set(ORDER_KEY, updatedOrder);
          Lampa.Storage.set(HIDE_KEY, updatedHidden);
          Lampa.Modal.close();
          refreshCardLayout(container);
          Lampa.Controller.toggle('full_start');
        }
      });
    }

    // Редактор из настроек
    function launchEditorFromSettings() {
      const activeCard = $('.full-start-new').first();
      if (!activeCard.length) {
        Lampa.Modal.open({
          title: 'Ошибка',
          html: $('<div class="modal__text">Сначала откройте карточку фильма или сериала</div>'),
          size: 'small',
          onBack: () => {
            Lampa.Modal.close();
            Lampa.Controller.toggle('settings_component');
          }
        });
        return;
      }
      launchButtonEditor(activeCard);
    }

    // Слушатель событий карточки
    function setupCardListener() {
      Lampa.Listener.follow('full', event => {
        if (event.type === 'build' && event.name === 'start' && event.item?.html) {
          currentCardInstance = event.item;
        }
        if (event.type === 'complite') {
          const container = fetchCardContainer(event);
          if (container) {
            currentCardContainer = container;
            refreshCardLayout(container);
          }
        }
      });
    }

    // Настройки плагина
    function configurePluginSettings() {
      Lampa.SettingsApi.addComponent({
        component: 'cardbuttons',
        name: 'Кнопки в карточке',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: 'cardbuttons',
        param: { name: SHOW_ALL_KEY, type: 'trigger', default: false },
        field: {
          name: 'Все кнопки в одной строке',
          description: 'Собирает все кнопки действий в одну строку в карточке фильма (Требуется перезагрузка приложения)'
        },
        onChange: () => {
          Lampa.Settings.update();
          setTimeout(() => Lampa.Settings.render(), 100);
        }
      });

      if (Lampa.Storage.get(SHOW_ALL_KEY)) {
        Lampa.SettingsApi.addParam({
          component: 'cardbuttons',
          param: { name: ICONS_ONLY_KEY, type: 'trigger', default: false },
          field: {
            name: 'Только иконки',
            description: 'Показывать только иконки без текста'
          },
          onChange: () => Lampa.Settings.update()
        });

        Lampa.SettingsApi.addParam({
          component: 'cardbuttons',
          param: { name: 'cardbtn_edit_trigger', type: 'button' },
          field: {
            name: 'Настроить кнопки',
            description: 'Изменить порядок и видимость кнопок'
          },
          onChange: launchEditorFromSettings
        });
      }
    }

    // Манифест плагина
    const pluginInfo = {
      type: 'other',
      version: CURRENT_VERSION,
      author: '@custom',
      name: 'Кнопки в карточке',
      description: 'Полный контроль над кнопками действий: одна строка, порядок, скрытие',
      component: 'cardbuttons'
    };

    // Инициализация плагина
    function initializePlugin() {
      Lampa.Manifest.plugins = pluginInfo;

      // Полная очистка от предыдущих версий
      ['lme_buttonsort', 'lme_buttonhide', 'lme_showbutton', 'lme_showbuttonwn',
       'cbe_button_order', 'cbe_button_hidden', 'cbe_show_all', 'cbe_icons_only',
       'cardbtn_button_order', 'cardbtn_button_hidden', 'cardbtn_show_all', 'cardbtn_icons_only'].forEach(key => Lampa.Storage.del(key));

      // Обновление версии текущего плагина
      const storedVersion = Lampa.Storage.get(VERSION_KEY);
      if (storedVersion !== CURRENT_VERSION) {
        Lampa.Storage.del(ORDER_KEY);
        Lampa.Storage.del(HIDE_KEY);
        Lampa.Storage.set(VERSION_KEY, CURRENT_VERSION);
      }

      configurePluginSettings();

      if (Lampa.Storage.get(SHOW_ALL_KEY)) {
        setupCardListener();
      }
    }

    // Запуск
    function bootPlugin() {
      window.cardbuttons_plugin_ready = true;
      if (window.appready) initializePlugin();
      else Lampa.Listener.follow('app', ev => { if (ev.type === 'ready') initializePlugin(); });
    }

    if (!window.cardbuttons_plugin_ready) bootPlugin();

})();
