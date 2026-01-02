(function () {
    'use strict';

    // Добавляем раздел в настройки (это обязательно, иначе ничего не появится)
    Lampa.SettingsApi.addComponent({
        component: "buttoneditor",
        name: 'Редактор кнопок',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor"/></svg>'
    });

    var STYLE_ID = 'be-button-style';
    var ORDER_KEY = 'be_button_order';
    var HIDE_KEY = 'be_button_hide';
    var lastFullContainer = null;
    var lastStartInstance = null;

    var FALLBACK_TITLES = {
        'button--play': () => Lampa.Lang.translate('title_watch'),
        'button--book': () => Lampa.Lang.translate('settings_input_links'),
        'button--reaction': () => Lampa.Lang.translate('title_reactions'),
        'button--subscribe': () => Lampa.Lang.translate('title_subscribe'),
        'button--options': () => Lampa.Lang.translate('more'),
        'view--torrent': () => Lampa.Lang.translate('full_torrents'),
        'view--trailer': () => Lampa.Lang.translate('full_trailers')
    };

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = `
            .be-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .be-button-hide {
                display: none !important;
            }
            .be-button-text-hidden span {
                display: none;
            }
        `;
        $('head').append(`<style id="${STYLE_ID}">${style}</style>`);
    }

    function readArray(key) {
        var value = Lampa.Storage.get(key);
        if (Array.isArray(value)) return value.slice();
        if (typeof value === 'string') {
            try {
                var parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return value.split(',').map(v => v.trim()).filter(Boolean);
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
        return $('.full-start-new').first();
    }

    function getButtonId($button) {
        var classes = ($button.attr('class') || '').split(/\s+/);
        var idClass = classes.find(c => c.startsWith('button--') && c !== 'button--priority') ||
                      classes.find(c => c.startsWith('view--'));
        if (idClass) return idClass;

        var dataId = $button.data('id') || $button.data('name') || $button.attr('data-name');
        if (dataId) return `data:${dataId}`;

        var title = $button.text().trim();
        if (title) return `text:${title}`;

        return `html:${Lampa.Utils.hash($button.clone().removeClass('focus').prop('outerHTML'))}`;
    }

    function getButtonTitle(id, $button) {
        var label = $button.find('span').first().text().trim() || $button.text().trim();
        if (label) return label;
        return FALLBACK_TITLES[id] ? FALLBACK_TITLES[id]() : id;
    }

    function scanButtons(fullContainer, detach) {
        var target = fullContainer.find('.full-start-new__buttons');
        var extra = fullContainer.find('.buttons--container');
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

        collect(target.find('.full-start__button'));
        collect(extra.find('.full-start__button'));

        return { items, map, targetContainer: target };
    }

    function normalizeOrder(order, ids) {
        var result = [];
        var known = new Set(ids);
        order.forEach(id => { if (known.has(id)) result.push(id); });
        ids.forEach(id => { if (!result.includes(id)) result.push(id); });
        return result;
    }

    function applyHidden(map) {
        var hidden = new Set(readArray(HIDE_KEY));
        Object.keys(map).forEach(id => map[id].toggleClass('be-button-hide', hidden.has(id)));
    }

    function applyLayout(fullContainer) {
        if (!fullContainer || !fullContainer.length) return;

        ensureStyles();

        var priority = fullContainer.find('.full-start-new__buttons .button--priority').detach();
        fullContainer.find('.full-start-new__buttons .button--play').remove();

        var { items, map, targetContainer } = scanButtons(fullContainer, true);
        var order = normalizeOrder(readArray(ORDER_KEY), items);

        targetContainer.empty();
        if (priority.length) targetContainer.append(priority);
        order.forEach(id => { if (map[id]) targetContainer.append(map[id]); });

        targetContainer.toggleClass('be-button-text-hidden', Lampa.Storage.get('be_hide_text') === true);
        targetContainer.addClass('be-buttons');

        applyHidden(map);

        Lampa.Controller.toggle('full_start');

        if (lastStartInstance && lastStartInstance.html && fullContainer[0] === lastStartInstance.html[0]) {
            var first = targetContainer.find('.full-start__button.selector').not('.hide').not('.be-button-hide').first();
            if (first.length) lastStartInstance.last = first[0];
        }
    }

    function openEditor(fullContainer) {
        if (!fullContainer || !fullContainer.length) return;

        var { items, map } = scanButtons(fullContainer, false);
        var order = normalizeOrder(readArray(ORDER_KEY), items);
        var hidden = new Set(readArray(HIDE_KEY));

        var list = $('<div class="menu-edit-list"></div>');

        order.forEach(id => {
            var $btn = map[id];
            if (!$btn || !$btn.length) return;

            var title = getButtonTitle(id, $btn);
            var icon = $btn.find('svg').first().prop('outerHTML') || '';

            var item = $(`
                <div class="menu-edit-list__item" data-id="${id}">
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
            item.toggleClass('lme-button-hidden', hidden.has(id));
            item.find('.dot').attr('opacity', hidden.has(id) ? 0 : 1);

            item.find('.move-up').on('hover:enter', () => {
                var prev = item.prev();
                if (prev.length) item.insertBefore(prev);
            });

            item.find('.move-down').on('hover:enter', () => {
                var next = item.next();
                if (next.length) item.insertAfter(next);
            });

            item.find('.toggle').on('hover:enter', () => {
                item.toggleClass('lme-button-hidden');
                item.find('.dot').attr('opacity', item.hasClass('lme-button-hidden') ? 0 : 1);
            });

            list.append(item);
        });

        Lampa.Modal.open({
            title: 'Редактор кнопок',
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: () => {
                var newOrder = [];
                var newHidden = [];
                list.find('.menu-edit-list__item').each(function () {
                    var id = $(this).data('id');
                    if (id) {
                        newOrder.push(id);
                        if ($(this).hasClass('lme-button-hidden')) newHidden.push(id);
                    }
                });
                Lampa.Storage.set(ORDER_KEY, newOrder);
                Lampa.Storage.set(HIDE_KEY, newHidden);
                Lampa.Modal.close();
                applyLayout(fullContainer);
            }
        });
    }

    function openEditorFromSettings() {
        if (!lastFullContainer || !lastFullContainer.length || !document.body.contains(lastFullContainer[0])) {
            lastFullContainer = resolveActiveFullContainer();
        }

        if (!lastFullContainer || !lastFullContainer.length) {
            Lampa.Modal.open({
                title: 'Ошибка',
                html: Lampa.Template.get('error', { title: 'Ошибка', text: 'Откройте карточку фильма/сериала для редактирования кнопок' }),
                size: 'small',
                onBack: () => Lampa.Modal.close()
            });
            return;
        }

        openEditor(lastFullContainer);
    }

    function initSettings() {
        // Основной переключатель
        Lampa.SettingsApi.addParam({
            component: "buttoneditor",
            param: { name: "be_enabled", type: "trigger", default: false },
            field: {
                name: 'Все кнопки в карточке',
                description: 'Выводит все кнопки действий в одну строку в карточке фильма/сериала'
            },
            onChange: () => Lampa.Settings.update()
        });

        // Дополнительные параметры появляются только после включения основного
        if (Lampa.Storage.get('be_enabled') === true) {
            Lampa.SettingsApi.addParam({
                component: "buttoneditor",
                param: { name: "be_hide_text", type: "trigger", default: false },
                field: {
                    name: 'Только иконки'
                },
                onChange: () => Lampa.Settings.update()
            });

            Lampa.SettingsApi.addParam({
                component: "buttoneditor",
                param: { name: "be_edit", type: "button" },
                field: {
                    name: 'Редактор кнопок',
                    description: 'Изменить порядок и скрыть кнопки в карточке'
                },
                onChange: openEditorFromSettings
            });
        }
    }

    function main() {
        Lampa.Listener.follow('full', e => {
            if (e.type === 'build' && e.name === 'start' && e.item && e.item.html) {
                lastStartInstance = e.item;
            }
            if (e.type === 'complite') {
                var container = getFullContainer(e);
                if (container) {
                    lastFullContainer = container;
                    setTimeout(() => applyLayout(container), 0);
                }
            }
        });
    }

    function startPlugin() {
        window.plugin_buttoneditor_ready = true;

        // Добавляем настройки
        initSettings();

        // Если функция уже включена — запускаем логику
        if (Lampa.Storage.get('be_enabled') === true) {
            main();
        }

        // При готовности приложения обновляем настройки и запускаем если нужно
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') {
                initSettings(); // обновляем, чтобы появились доп. параметры
                if (Lampa.Storage.get('be_enabled') === true) main();
            }
        });
    }

    if (!window.plugin_buttoneditor_ready) startPlugin();

})();
