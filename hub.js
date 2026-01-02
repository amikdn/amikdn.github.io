(function () {
    'use strict';

    if (!window.Lampa) return;

    const component = 'buttons_manager';
    const plugin_name = 'Управление кнопками';
    const default_order = ['play', 'book', 'torrent', 'online', 'reaction', 'subscribe', 'options'];
    const all_keys = ['play', 'book', 'torrent', 'online', 'reaction', 'subscribe', 'options'];
    const name_map = {
        play: 'Смотреть',
        book: 'Избранное',
        torrent: 'Торренты',
        online: 'Онлайн',
        reaction: 'Реакции',
        subscribe: 'Подписаться',
        options: 'Дополнительно'
    };

    let show_settings = {};
    let current_order = [];

    // SVG для кнопки «Онлайн (4m1K)» (из вашего HTML)
    const online_svg = '<svg enable-background="new 0 0 32 32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="21" height="32"><g><path fill="currentColor" d="m31.6 5.2c-.2-.2-.6-.2-.9-.2-9.6 2.6-19.8 2.6-29.4 0-.3 0-.7 0-.9.2-.3.2-.4.5-.4.8v20c0 .3.1.6.4.8.2.2.6.2.9.2 9.6-2.6 19.8-2.6 29.5 0h.3c.2 0 .4-.1.6-.2.2-.2.4-.5.4-.8v-20c-.1-.3-.2-.6-.5-.8zm-17.6 14.8c0 .6-.4 1-1 1s-1-.4-1-1v-2h-4c-.4 0-.8-.2-.9-.6-.2-.4-.1-.8.2-1.1l5-5c.1-.1.2-.2.3-.2.2-.1.5-.1.8 0 .2.1.4.3.5.5.1.1.1.3.1.4zm8.8-.6c.3.4.2 1.1-.2 1.4-.2.1-.4.2-.6.2-.3 0-.6-.1-.8-.4l-3-4c-.1-.2-.2-.4-.2-.6v4c0 .6-.4 1-1 1s-1-.4-1-1v-8c0-.6.4-1 1-1s1 .4 1 1v4c0-.2.1-.4.2-.6l3-4c.3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-2.5 3.4z"></path><path fill="currentColor" d="m12 16v-1.6l-1.6 1.6z"></path></g></svg>';

    // Кастомизация кнопок в карточке
    function customize_buttons(container) {
        if (container.data('customized')) return;
        container.data('customized', true);

        const existing = {
            play: container.find('.button--play').detach(),
            book: container.find('.button--book').detach(),
            reaction: container.find('.button--reaction').detach(),
            subscribe: container.find('.button--subscribe').detach(),
            options: container.find('.button--options').detach()
        };

        const new_buttons = {
            torrent: $('<div class="full-start__button selector button--torrent"><svg><use xlink:href="#sprite-torrent"></use></svg><span>Торренты</span></div>'),
            online: $(`<div class="full-start__button selector button--online">${online_svg}<span>Онлайн</span></div>`)
        };

        // Быстрый старт на выбранном источнике
        new_buttons.torrent.on('hover:enter', () => {
            Lampa.Storage.set('quick_source', 'Торренты');
            existing.play.trigger('hover:enter');
        });

        new_buttons.online.on('hover:enter', () => {
            Lampa.Storage.set('quick_source', '4m1K');
            existing.play.trigger('hover:enter');
        });

        container.empty();

        current_order = Lampa.Storage.get('buttons_order', default_order);
        show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, torrent: true, online: true,
            reaction: true, subscribe: true, options: true
        });

        current_order.forEach(key => {
            let btn = existing[key] || new_buttons[key];
            if (btn && show_settings[key]) {
                container.append(btn);
            }
        });
    }

    // Observer для кнопок
    const buttons_observer = new MutationObserver(() => {
        const container = $('.full-start-new__buttons');
        if (container.length) {
            customize_buttons(container);
        }
    });
    buttons_observer.observe(document.body, { childList: true, subtree: true });

    // Быстрый выбор источника (скрываем остальные)
    const quick_observer = new MutationObserver(() => {
        const quick = Lampa.Storage.get('quick_source', '');
        if (!quick) return;

        const items = $('.selectbox-item');
        if (items.length < 2) return;

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
            Lampa.Storage.set('quick_source', '');
        }
    });
    quick_observer.observe(document.body, { childList: true, subtree: true });

    // Рендер списка настроек
    function render_settings_list(element) {
        const list = element.find('.buttons-list').empty();

        current_order = Lampa.Storage.get('buttons_order', default_order);
        show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, torrent: true, online: true,
            reaction: true, subscribe: true, options: true
        });

        // Добавляем недостающие кнопки в конец
        all_keys.forEach(k => {
            if (!current_order.includes(k)) current_order.push(k);
        });
        Lampa.Storage.set('buttons_order', current_order);

        current_order.forEach((key, idx) => {
            const item = $('<div class="buttons-list__item" data-index="' + idx + '"></div>');
            item.append('<div class="item-name">' + (name_map[key] || key) + '</div>');
            item.append('<div class="item-toggle selector">' + (show_settings[key] ? 'Видима' : 'Скрыта') + '</div>');
            if (idx > 0) item.append('<div class="item-up selector">↑</div>');
            if (idx < current_order.length - 1) item.append('<div class="item-down selector">↓</div>');
            list.append(item);
        });

        list.find('.item-toggle').on('hover:enter', function () {
            const idx = $(this).parent().data('index');
            const key = current_order[idx];
            show_settings[key] = !show_settings[key];
            Lampa.Storage.set('buttons_show', show_settings);
            $(this).text(show_settings[key] ? 'Видима' : 'Скрыта');

            // Перезапускаем кастомизацию при изменении видимости
            $('.full-start-new__buttons').each(function() {
                $(this).removeData('customized');
                customize_buttons($(this));
            });
        });

        list.find('.item-up').on('hover:enter', function () {
            const idx = $(this).parent().data('index');
            if (idx > 0) {
                [current_order[idx - 1], current_order[idx]] = [current_order[idx], current_order[idx - 1]];
                Lampa.Storage.set('buttons_order', current_order);
                render_settings_list(element);
            }
        });

        list.find('.item-down').on('hover:enter', function () {
            const idx = $(this).parent().data('index');
            if (idx < current_order.length - 1) {
                [current_order[idx], current_order[idx + 1]] = [current_order[idx + 1], current_order[idx]];
                Lampa.Storage.set('buttons_order', current_order);
                render_settings_list(element);
            }
        });
    }

    // Пункт в настройках (исправленная версия без .render())
    const folder = $(`<div class="settings-folder selector">
        <div class="settings-folder__icon">
            <svg height="40" viewBox="0 0 40 40"><use xlink:href="#settings-plugins"></use></svg>
        </div>
        <div class="settings-folder__name">${plugin_name}</div>
    </div>`);

    folder.on('hover:enter', () => {
        const view = $(`<div>
            <div class="settings__title">Управление кнопками в карточке</div>
            <div class="buttons-list"></div>
            <div class="settings__description">Нажмите на статус — скрыть/показать. ↑↓ — переместить.</div>
        </div>`);

        render_settings_list(view);

        Lampa.Activity.push({
            url: '',
            title: plugin_name,
            component: component,
            html: view,
            page: 1
        });
    });

    Lampa.Settings.listener.follow('open', (e) => {
        if (e.name === 'main') {
            if (!e.body.find(`.settings-folder__name:contains("${plugin_name}")`).length) {
                e.body.find('.settings--plugins').after(folder);
            }
        }
    });

})();
