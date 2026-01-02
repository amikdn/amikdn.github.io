(function () {
    'use strict';

    const PLUGIN_ID = 'cardbuttons';
    const STORAGE_ORDER = 'cardbuttons_order_v3';
    const STORAGE_HIDDEN = 'cardbuttons_hidden_v3';
    const STORAGE_ICONS_ONLY = 'cardbuttons_icons_only';
    let activeCard = null;

    // Стили
    function injectStyles() {
        if ($('#cardbuttons-style').length) return;
        const styles = `
            .cardbuttons-row {
                display: flex;
                flex-wrap: wrap;
                gap: 14px;
                justify-content: center;
                padding: 10px 0;
            }
            .cardbuttons-hidden {
                display: none !important;
            }
            .cardbuttons-icons-only .full-start__button span {
                display: none !important;
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
        if (txt) return 't_' + txt.substring(0, 20);

        return 'h_' + btoa(element.html()).substring(0, 10);
    }

    // Название кнопки для редактора
    function buttonLabel(key, element) {
        const text = element.find('span').text().trim() || element.text().trim();
        if (text) return text;

        const map = {
            'button--play': 'Смотреть',
            'button--book': 'В закладки',
            'button--reaction': 'Реакции',
            'button--subscribe': 'Подписаться',
            'button--options': 'Дополнительно',
            'view--torrent': 'Торренты',
            'view--trailer': 'Трейлеры'
        };
        return map[key] || key;
    }

    // Сбор кнопок
    function gatherButtons(cardElement, detach = false) {
        const mainBlock = cardElement.find('.full-start-new__buttons');
        const extraBlock = cardElement.find('.buttons--container');

        const buttons = [];
        const buttonByKey = {};

        function scan(block) {
            block.children('.full-start__button').each(function () {
                const btn = $(this);
                if (btn.hasClass('button--play') || btn.hasClass('button--priority')) return;

                const key = buttonKey(btn);
                if (!key || buttonByKey[key]) return;

                buttonByKey[key] = detach ? btn.detach() : btn.clone();
                buttons.push(key);
            });
        }

        scan(mainBlock);
        scan(extraBlock);

        return { keys: buttons, elements: buttonByKey, container: mainBlock };
    }

    // Перестройка кнопок
    function rebuildButtons(cardElement) {
        if (!cardElement || !cardElement.length) return;

        injectStyles();

        const priority = cardElement.find('.button--priority').detach();
        cardElement.find('.button--play').remove();

        const { keys, elements, container } = gatherButtons(cardElement, true);

        const savedOrder = Lampa.Storage.get(STORAGE_ORDER, []);
        const finalOrder = [];

        const existingKeys = new Set(keys);
        savedOrder.forEach(k => { if (existingKeys.has(k)) finalOrder.push(k); });
        keys.forEach(k => { if (!finalOrder.includes(k)) finalOrder.push(k); });

        container.empty();
        if (priority.length) container.append(priority);
        finalOrder.forEach(k => {
            if (elements[k]) container.append(elements[k]);
        });

        container.addClass('cardbuttons-row');
        if (Lampa.Storage.get(STORAGE_ICONS_ONLY, false)) {
            container.addClass('cardbuttons-icons-only');
        }

        const hiddenKeys = new Set(Lampa.Storage.get(STORAGE_HIDDEN, []));
        Object.keys(elements).forEach(k => {
            if (hiddenKeys.has(k)) elements[k].addClass('cardbuttons-hidden');
        });

        Lampa.Controller.toggle('full_start');
    }

    // Редактор
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

        const savedOrder = Lampa.Storage.get(STORAGE_ORDER, []);
        const order = [];
        const present = new Set(keys);
        savedOrder.forEach(k => { if (present.has(k)) order.push(k); });
        keys.forEach(k => { if (!order.includes(k)) order.push(k); });

        const hiddenKeys = new Set(Lampa.Storage.get(STORAGE_HIDDEN, []));

        const listHtml = $('<div></div>');

        order.forEach(key => {
            const el = elements[key];
            if (!el) return;

            const label = buttonLabel(key, el);
            const svg = el.find('svg').length ? el.find('svg').prop('outerHTML') : '<div style="width:24px;height:24px;background:#555;border-radius:4px;"></div>';

            const item = $(`
                <div style="display:flex;align-items:center;padding:12px;background:rgba(255,255,255,0.08);margin-bottom:10px;border-radius:10px;" data-key="${key}">
                    <div style="width:32px;margin-right:12px;">${svg}</div>
                    <div style="flex:1;font-size:1.1em;">${label}</div>
                    <div style="margin:0 12px;color:#69f;font-size:1.3em;cursor:pointer;">↑</div>
                    <div style="margin:0 12px;color:#69f;font-size:1.3em;cursor:pointer;">↓</div>
                    <div style="margin-left:12px;width:36px;text-align:center;font-size:1.6em;cursor:pointer;">${hiddenKeys.has(key) ? '✖' : '✓'}</div>
                </div>
            `);

            item.find('div:nth-child(3)').on('hover:enter', () => {
                const prev = item.prev();
                if (prev.length) item.insertBefore(prev);
            });

            item.find('div:nth-child(4)').on('hover:enter', () => {
                const next = item.next();
                if (next.length) item.insertAfter(next);
            });

            item.find('div:last').on('hover:enter', () => {
                const mark = item.find('div:last');
                mark.text(mark.text() === '✓' ? '✖' : '✓');
            });

            listHtml.append(item);
        });

        Lampa.Modal.open({
            title: 'Редактор кнопок',
            html: listHtml,
            size: 'medium',
            onBack: () => {
                const newOrder = [];
                const newHidden = [];

                listHtml.children().each(function () {
                    const key = $(this).data('key');
                    newOrder.push(key);
                    if ($(this).find('div:last').text() === '✖') {
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
                description: 'Собирает все кнопки действий в карточке фильма в одну строку и позволяет менять порядок и скрывать их'
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
                    description: 'Настроить порядок и видимость кнопок'
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
                    setTimeout(() => rebuildButtons(card), 100);
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
