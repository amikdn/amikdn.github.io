(function () {
    'use strict';

    if (!window.Lampa) return;

    const plugin_name = 'Управление кнопками';
    const base_keys = ['play', 'book', 'reaction', 'subscribe', 'options'];
    const base_name_map = {
        play: 'Смотреть',
        book: 'Избранное',
        reaction: 'Реакции',
        subscribe: 'Подписаться',
        options: 'Дополнительно'
    };
    const default_order = ['play', 'book', 'reaction', 'subscribe', 'options'];

    let dynamic_buttons = {};
    let saved_dynamic_sources = Lampa.Storage.get('dynamic_sources', []);
    let processing_quick = false;

    function customize_buttons(container) {
        if (!container.length || container.data('customized')) return;
        container.data('customized', true);

        const existing = {
            play: container.find('.button--play').detach(),
            book: container.find('.button--book').detach(),
            reaction: container.find('.button--reaction').detach(),
            subscribe: container.find('.button--subscribe').detach(),
            options: container.find('.button--options').detach()
        };

        const source_buttons = {};
        Object.keys(dynamic_buttons).forEach(key => {
            const data = dynamic_buttons[key];
            const btn = $(data.html);
            btn.on('hover:enter', () => {
                Lampa.Storage.set('quick_source', data.quick);
                if (existing.play.length) existing.play.trigger('hover:enter');
            });
            source_buttons[key] = btn;
        });

        container.empty();

        let current_order = Lampa.Storage.get('buttons_order', default_order.slice());
        let show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, reaction: true, subscribe: true, options: true
        });

        base_keys.forEach(k => {
            if (!current_order.includes(k)) current_order.push(k);
        });

        saved_dynamic_sources.forEach(src => {
            if (!current_order.includes(src.key)) {
                let pos = current_order.indexOf('book');
                current_order.splice(pos >= 0 ? pos + 1 : current_order.length, 0, src.key);
            }
            if (show_settings[src.key] === undefined) show_settings[src.key] = true;
        });

        Lampa.Storage.set('buttons_order', current_order);
        Lampa.Storage.set('buttons_show', show_settings);

        current_order.forEach(key => {
            let btn = existing[key] || source_buttons[key];
            if (btn && (show_settings[key] ?? true)) {
                container.append(btn);
            }
        });
    }

    const buttons_observer = new MutationObserver(() => {
        const container = $('.full-start-new__buttons');
        if (container.length) customize_buttons(container);
    });
    buttons_observer.observe(document.body, { childList: true, subtree: true });

    const source_observer = new MutationObserver(() => {
        const items = $('.selectbox-item.selectbox-item--icon');
        if (items.length === 0) return;

        dynamic_buttons = {};
        const new_dynamic = [];

        items.each(function () {
            const $item = $(this);
            const title = $item.find('.selectbox-item__title').text().trim();
            if (!title) return;

            const subtitle = ($item.find('.selectbox-item__subtitle').text() || '').trim().toLowerCase();

            if (title === 'Торренты' || subtitle.includes('онлайн')) {
                let icon_html = $item.find('.selectbox-item__icon')[0].outerHTML || '';

                if (title === 'Торренты') {
                    icon_html = '<svg><use xlink:href="#sprite-torrent"></use></svg>';
                }

                const key = 'source_' + title.replace(/[\s\(\)\-]+/g, '_').toLowerCase();
                let unique_key = key;
                let counter = 1;
                while (new_dynamic.find(s => s.key === unique_key)) {
                    unique_key = key + '_' + counter;
                    counter++;
                }

                dynamic_buttons[unique_key] = {
                    html: `<div class="full-start__button selector button--${unique_key}">${icon_html}<span>${title}</span></div>`,
                    quick: title
                };

                new_dynamic.push({key: unique_key, title: title});
            }
        });

        if (new_dynamic.length > 0) {
            Lampa.Storage.set('dynamic_sources', new_dynamic);
            saved_dynamic_sources = new_dynamic;

            $('.full-start-new__buttons').each(function () {
                $(this).removeData('customized');
                customize_buttons($(this));
            });
        }
    });
    source_observer.observe(document.body, { childList: true, subtree: true });

    const quick_observer = new MutationObserver(() => {
        if (processing_quick) return;
        const quick = Lampa.Storage.get('quick_source', '');
        if (!quick) return;

        processing_quick = true;

        const items = $('.selectbox-item');
        if (items.length < 2) {
            processing_quick = false;
            return;
        }

        let target = null;
        items.each(function () {
            const title = $(this).find('.selectbox-item__title').text().trim();
            if (title === quick) {
                target = $(this);
                return false;
            }
        });

        if (target) {
            items.hide();
            target.show();
            target.trigger('hover:enter');
            setTimeout(() => target.trigger('hover:enter'), 200);
        }

        Lampa.Storage.set('quick_source', '');
        setTimeout(() => processing_quick = false, 1000);
    });
    quick_observer.observe(document.body, { childList: true, subtree: true });

    function render_settings_list(view) {
        const list = view.find('.buttons-list').empty();

        let current_order = Lampa.Storage.get('buttons_order', default_order.slice());
        let show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, reaction: true, subscribe: true, options: true
        });

        const all_titles = {...base_name_map};
        saved_dynamic_sources.forEach(src => all_titles[src.key] = src.title);

        current_order.forEach((key, idx) => {
            const title = all_titles[key] || key;

            const item = $('<div class="buttons-list__item selector" data-index="' + idx + '"></div>');
            item.append('<div class="item-name">' + title + '</div>');
            item.append('<div class="item-toggle">' + ((show_settings[key] ?? true) ? 'Видима' : 'Скрыта') + '</div>');
            if (idx > 0) item.append('<div class="item-up">↑</div>');
            if (idx < current_order.length - 1) item.append('<div class="item-down">↓</div>');
            list.append(item);
        });

        list.find('.item-toggle').on('hover:enter', function () {
            const idx = $(this).parent().data('index');
            const key = current_order[idx];
            const new_val = !(show_settings[key] ?? true);
            show_settings[key] = new_val;
            Lampa.Storage.set('buttons_show', show_settings);
            $(this).text(new_val ? 'Видима' : 'Скрыта');

            $('.full-start-new__buttons').each(function () {
                $(this).removeData('customized');
                customize_buttons($(this));
            });
        });

        list.find('.item-up').on('hover:enter', function () {
            const idx = $(this).parent().data('index');
            if (idx > 0) {
                [current_order[idx - 1], current_order[idx]] = [current_order[idx], current_order[idx - 1]];
                Lampa.Storage.set('buttons_order', current_order);
                render_settings_list(view);
            }
        });

        list.find('.item-down').on('hover:enter', function () {
            const idx = $(this).parent().data('index');
            if (idx < current_order.length - 1) {
                [current_order[idx], current_order[idx + 1]] = [current_order[idx + 1], current_order[idx]];
                Lampa.Storage.set('buttons_order', current_order);
                render_settings_list(view);
            }
        });
    }

    // Надёжный способ добавления пункта в настройки + открытие подраздела
    const folder = $(`<div class="settings-folder selector">
        <div class="settings-folder__icon">
            <svg height="40" viewBox="0 0 40 40"><use xlink:href="#settings-plugins"></use></svg>
        </div>
        <div class="settings-folder__name">${plugin_name}</div>
    </div>`);

    folder.on('hover:enter', () => {
        const view = $(`
            <div>
                <div class="settings__title">Управление кнопками в карточке</div>
                <div class="buttons-list" style="margin-top: 1em;"></div>
                <div class="settings__description" style="margin-top: 1em;">
                    • Наведите на статус — скрыть/показать кнопку<br>
                    • ↑↓ — переместить кнопку<br><br>
                    Кнопки источников (Торренты + онлайн-парсеры) добавляются автоматически с оригинальными иконками и названиями.
                </div>
            </div>
        `);

        render_settings_list(view);

        // Открываем как подраздел внутри настроек
        Lampa.Settings.main().update({
            title: plugin_name,
            html: view
        });
    });

    // Добавляем пункт только при открытии настроек (надёжно работает во всех версиях)
    Lampa.Listener.follow('settings', (e) => {
        if (e.type === 'open' && e.name === 'main') {
            const body = e.body;
            if (body.find(`.settings-folder__name:contains("${plugin_name}")`).length) return;

            // Пытаемся добавить после «Интерфейс» или «Плагины/Расширения»
            let target = body.find('.settings-folder__name:contains("Интерфейс")').parent();
            if (!target.length) target = body.find('.settings-folder__name:contains("Плагины")').parent() || body.find('.settings-folder__name:contains("Расширения")').parent();

            if (target.length) {
                target.after(folder.clone(true)); // clone чтобы не дублировать обработчики
            }
        }
    });

})();
