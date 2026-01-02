(function () {
    'use strict';

    const PLUGIN_ID = 'cardbuttons';
    const STORAGE_ORDER = 'cardbuttons_order';
    const STORAGE_HIDDEN = 'cardbuttons_hidden';
    const STORAGE_ICONS_ONLY = 'cardbuttons_icons_only';
    let activeCard = null;

    // Стили (точно как в оригинале, но с своим префиксом)
    function injectStyles() {
        if ($('#cardbuttons-style').length) return;
        const styles = `
            .cardbuttons-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .cardbuttons-hidden {
                display: none !important;
            }
            .cardbuttons-icons-only span {
                display: none;
            }
        `;
        $('head').append(`<style id="cardbuttons-style">${styles}</style>`);
    }

    // Уникальный ключ кнопки
    function buttonKey(element) {
        const cls = element.attr('class') || '';
        const match = cls.match(/(button--\w+|view--\w+)/);
        if (match) return match[1];

        const data = element.attr('data-id') || element.attr('data-name') || element.data('id') || element.data('name');
        if (data) return 'd_' + data;

        const txt = element.text().trim();
        if (txt) return 't_' + txt;

        return 'h_' + Lampa.Utils.hash(element.prop('outerHTML'));
    }

    // Название кнопки
    function buttonLabel(key, element) {
        const text = element.find('span').text().trim() || element.text().trim();
        if (text) return text;

        const map = {
            'button--play': 'Смотреть',
            'button--book': 'Закладки',
            'button--reaction': 'Реакции',
            'button--subscribe': 'Подписка',
            'button--options': 'Ещё',
            'view--torrent': 'Торренты',
            'view--trailer': 'Трейлеры'
        };
        return map[key] || key;
    }

    // Сбор кнопок
    function gatherButtons(cardElement, detach = false) {
        const mainBlock = cardElement.find('.full-start-new__buttons');
        const extraBlock = cardElement.find('.buttons--container');

        const keys = [];
        const elements = {};

        function scan(block) {
            block.find('.full-start__button').each(function () {
                const btn = $(this);
                if (btn.hasClass('button--play') || btn.hasClass('button--priority')) return;

                const key = buttonKey(btn);
                if (!key || elements[key]) return;

                elements[key] = detach ? btn.detach() : btn;
                keys.push(key);
            });
        }

        scan(mainBlock);
        scan(extraBlock);

        return { keys, elements, container: mainBlock };
    }

    // Перестройка кнопок (убираем лишнюю пустоту сверху)
    function rebuildButtons(cardElement) {
        if (!cardElement || !cardElement.length) return;

        injectStyles();

        // Сохраняем приоритетную кнопку (если есть)
        const priority = cardElement.find('.button--priority').detach();

        // Удаляем кнопку play полностью
        cardElement.find('.button--play').remove();

        const { keys, elements, container } = gatherButtons(cardElement, true);

        // Восстанавливаем порядок
        const savedOrder = Lampa.Storage.get(STORAGE_ORDER, []);
        const order = [];
        const existing = new Set(keys);
        savedOrder.forEach(k => { if (existing.has(k)) order.push(k); });
        keys.forEach(k => { if (!order.includes(k)) order.push(k); });

        // Очищаем контейнер и добавляем кнопки без лишних отступов
        container.empty();
        if (priority.length) container.append(priority);
        order.forEach(k => {
            if (elements[k]) container.append(elements[k]);
        });

        // Применяем стили
        container.addClass('cardbuttons-row');
        if (Lampa.Storage.get(STORAGE_ICONS_ONLY, false)) {
            container.addClass('cardbuttons-icons-only');
        }

        // Скрываем кнопки
        const hidden = new Set(Lampa.Storage.get(STORAGE_HIDDEN, []));
        Object.values(elements).forEach(btn => {
            btn.toggleClass('cardbuttons-hidden', hidden.has(buttonKey(btn)));
        });

        // Обновляем контроллер (чтобы не было пустоты и фокус работал)
        Lampa.Controller.toggle('full_start');
    }

    // Редактор — точно как в оригинале (структура, классы, SVG)
    function launchEditor() {
        activeCard = $('.full-start-new').first();
        if (!activeCard.length) {
            Lampa.Modal.open({
                title: 'Ошибка',
                html: `<div style="padding:20px;text-align:center;">Сначала откройте карточку фильма или сериала</div>`,
                onBack: () => Lampa.Modal.close()
            });
            return;
        }

        const { keys, elements } = gatherButtons(activeCard, false);

        // Нормализуем порядок
        const savedOrder = Lampa.Storage.get(STORAGE_ORDER, []);
        const order = [];
        const existing = new Set(keys);
        savedOrder.forEach(k => { if (existing.has(k)) order.push(k); });
        keys.forEach(k => { if (!order.includes(k)) order.push(k); });

        const hidden = new Set(Lampa.Storage.get(STORAGE_HIDDEN, []));

        const list = $('<div class="menu-edit-list"></div>');

        order.forEach(key => {
            const btn = elements[key];
            if (!btn || !btn.length) return;

            const title = buttonLabel(key, btn);
            const icon = btn.find('svg').first().prop('outerHTML') || '';

            const item = $(`
                <div class="menu-edit-list__item" data-key="${key}">
                    <div class="menu-edit-list__icon"></div>
                    <div class="menu-edit-list__title">${title}</div>
                    <div class="menu-edit-list__move move-up selector">
                        <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector">
                        <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26">
                            <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>
                            <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            `);

            if (icon) item.find('.menu-edit-list__icon').append(icon);

            // Затемнение скрытой кнопки
            item.toggleClass('lme-button-hidden', hidden.has(key));
            item.find('.dot').attr('opacity', hidden.has(key) ? 0 : 1);

            // Перемещение вверх
            item.find('.move-up').on('hover:enter', () => {
                const prev = item.prev();
                if (prev.length) item.insertBefore(prev);
            });

            // Перемещение вниз
            item.find('.move-down').on('hover:enter', () => {
                const next = item.next();
                if (next.length) item.insertAfter(next);
            });

            // Переключение видимости
            item.find('.toggle').on('hover:enter', () => {
                item.toggleClass('lme-button-hidden');
                const opacity = item.hasClass('lme-button-hidden') ? 0 : 1;
                item.find('.dot').attr('opacity', opacity);
            });

            list.append(item);
        });

        Lampa.Modal.open({
            title: 'Редактор кнопок',
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: () => {
                const newOrder = [];
                const newHidden = [];

                list.find('.menu-edit-list__item').each(function () {
                    const key = $(this).data('key');
                    newOrder.push(key);
                    if ($(this).hasClass('lme-button-hidden')) {
                        newHidden.push(key);
                    }
                });

                Lampa.Storage.set(STORAGE_ORDER, newOrder);
                Lampa.Storage.set(STORAGE_HIDDEN, newHidden);
                Lampa.Modal.close();
                rebuildButtons(activeCard);
            }
        });
    }

    // Настройки
    function setupSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_ID,
            name: 'Кнопки карточки',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'cardbuttons_enabled', type: 'trigger', default: false },
            field: {
                name: 'Все кнопки в одну строку',
                description: 'Выводит все кнопки действий в одну строку в карточке фильма/сериала'
            },
            onChange: () => Lampa.Settings.update()
        });

        if (Lampa.Storage.get('cardbuttons_enabled')) {
            Lampa.SettingsApi.addParam({
                component: PLUGIN_ID,
                param: { name: STORAGE_ICONS_ONLY, type: 'trigger', default: false },
                field: { name: 'Только иконки' },
                onChange: () => Lampa.Settings.update()
            });

            Lampa.SettingsApi.addParam({
                component: PLUGIN_ID,
                param: { name: 'cardbuttons_edit', type: 'button' },
                field: {
                    name: 'Редактор кнопок',
                    description: 'Изменить порядок и скрыть кнопки'
                },
                onChange: launchEditor
            });
        }
    }

    // Слушатель карточек
    function watchCards() {
        Lampa.Listener.follow('full', event => {
            if (event.type === 'complite') {
                const card = event.body || (event.object?.activity?.render?.() || null);
                if (card && card.length) {
                    setTimeout(() => rebuildButtons(card), 80);
                }
            }
        });
    }

    // Инициализация
    function init() {
        window.cardbuttons_plugin_ready = true;
        setupSettings();

        if (Lampa.Storage.get('cardbuttons_enabled')) {
            watchCards();
        }

        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready' && Lampa.Storage.get('cardbuttons_enabled')) {
                watchCards();
            }
        });
    }

    if (!window.cardbuttons_plugin_ready) init();

})();
