(function () {
    'use strict';

    if (!window.Lampa) return;

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

    const torrent_svg = '<svg><use xlink:href="#sprite-torrent"></use></svg>';
    const online_svg = '<svg enable-background="new 0 0 32 32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="21" height="32"><g><path fill="currentColor" d="m31.6 5.2c-.2-.2-.6-.2-.9-.2-9.6 2.6-19.8 2.6-29.4 0-.3 0-.7 0-.9.2-.3.2-.4.5-.4.8v20c0 .3.1.6.4.8.2.2.6.2.9.2 9.6-2.6 19.8-2.6 29.5 0h.3c.2 0 .4-.1.6-.2.2-.2.4-.5.4-.8v-20c-.1-.3-.2-.6-.5-.8zm-17.6 14.8c0 .6-.4 1-1 1s-1-.4-1-1v-2h-4c-.4 0-.8-.2-.9-.6-.2-.4-.1-.8.2-1.1l5-5c.1-.1.2-.2.3-.2.2-.1.5-.1.8 0 .2.1.4.3.5.5.1.1.1.3.1.4zm8.8-.6c.3.4.2 1.1-.2 1.4-.2.1-.4.2-.6.2-.3 0-.6-.1-.8-.4l-3-4c-.1-.2-.2-.4-.2-.6v4c0 .6-.4 1-1 1s-1-.4-1-1v-8c0-.6.4-1 1-1s1 .4 1 1v4c0-.2.1-.4.2-.6l3-4c.3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-2.5 3.4z"></path><path fill="currentColor" d="m12 16v-1.6l-1.6 1.6z"></path></g></svg>';

    let current_order = [];
    let show_settings = {};

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

        const torrent_btn = $('<div class="full-start__button selector button--torrent">' + torrent_svg + '<span>Торренты</span></div>');
        const online_btn = $('<div class="full-start__button selector button--online">' + online_svg + '<span>Онлайн</span></div>');

        torrent_btn.on('hover:enter', () => {
            Lampa.Storage.set('quick_source', 'Торренты');
            existing.play.trigger('hover:enter');
        });

        online_btn.on('hover:enter', () => {
            Lampa.Storage.set('quick_source', '4m1K'); // или название вашего онлайн-парсера
            existing.play.trigger('hover:enter');
        });

        container.empty();

        current_order = Lampa.Storage.get('buttons_order', default_order);
        show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, torrent: true, online: true,
            reaction: true, subscribe: true, options: true
        });

        current_order.forEach(key => {
            let btn;
            if (key === 'torrent') btn = torrent_btn;
            else if (key === 'online') btn = online_btn;
            else btn = existing[key];

            if (btn && show_settings[key]) {
                container.append(btn);
            }
        });
    }

    const buttons_observer = new MutationObserver(() => {
        const container = $('.full-start-new__buttons');
        if (container.length) customize_buttons(container);
    });
    buttons_observer.observe(document.body, { childList: true, subtree: true });

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
            target.trigger('hover:enter');
            setTimeout(() => target.trigger('hover:enter'), 300);
        }

        Lampa.Storage.set('quick_source', '');
    });
    quick_observer.observe(document.body, { childList: true, subtree: true });

    function open_editor_modal() {
        const list = $('<div class="menu-edit-list"></div>');

        current_order = Lampa.Storage.get('buttons_order', default_order);
        show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, torrent: true, online: true,
            reaction: true, subscribe: true, options: true
        });

        all_keys.forEach(k => {
            if (!current_order.includes(k)) current_order.push(k);
        });
        Lampa.Storage.set('buttons_order', current_order);

        current_order.forEach((key, idx) => {
            const title = name_map[key];

            let icon_svg = '';
            if (key === 'play') icon_svg = '<svg><use xlink:href="#sprite-play"></use></svg>';
            else if (key === 'book') icon_svg = base_icons.book;
            else if (key === 'reaction') icon_svg = '<svg><use xlink:href="#sprite-reaction"></use></svg>';
            else if (key === 'subscribe') icon_svg = base_icons.subscribe;
            else if (key === 'options') icon_svg = '<svg><use xlink:href="#sprite-dots"></use></svg>';
            else if (key === 'torrent') icon_svg = torrent_svg;
            else if (key === 'online') icon_svg = online_svg;

            const item = $(`
                <div class="menu-edit-list__item selector">
                    <div class="menu-edit-list__icon">${icon_svg}</div>
                    <div class="menu-edit-list__title">${title}</div>
                    <div class="menu-edit-list__move move-up selector ${idx === 0 ? 'hide' : ''}">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector ${idx === current_order.length - 1 ? 'hide' : ''}">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"></rect>
                            <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="${show_settings[key] ? '1' : '0'}" stroke-linecap="round"></path>
                        </svg>
                    </div>
                </div>
            `);

            item.find('.toggle.selector').on('hover:enter', () => {
                show_settings[key] = !show_settings[key];
                Lampa.Storage.set('buttons_show', show_settings);
                item.find('.dot').css('opacity', show_settings[key] ? '1' : '0');

                $('.full-start-new__buttons').each(function () {
                    $(this).removeData('customized');
                    customize_buttons($(this));
                });
            });

            item.find('.move-up.selector').on('hover:enter', () => {
                if (idx > 0) {
                    [current_order[idx - 1], current_order[idx]] = [current_order[idx], current_order[idx - 1]];
                    Lampa.Storage.set('buttons_order', current_order);
                    open_editor_modal();
                }
            });

            item.find('.move-down.selector').on('hover:enter', () => {
                if (idx < current_order.length - 1) {
                    [current_order[idx], current_order[idx + 1]] = [current_order[idx + 1], current_order[idx]];
                    Lampa.Storage.set('buttons_order', current_order);
                    open_editor_modal();
                }
            });

            list.append(item);
        });

        const modal_html = $(`
            <div class="modal animate">
                <div class="modal__content">
                    <div class="modal__head">
                        <div class="modal__title">Редактировать кнопки</div>
                    </div>
                    <div class="modal__body">
                        <div class="scroll scroll--over">
                            <div class="scroll__content">
                                <div class="scroll__body">
                                    ${list.prop('outerHTML')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        Lampa.Modal.open({
            title: '',
            html: modal_html,
            onBack: () => Lampa.Modal.close(),
            size: 'medium'
        });
    }

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'card_buttons_edit', type: 'static' },
        field: { name: 'Кнопки в карточке', description: 'Скрывать, перемещать кнопки (включая Торренты и Онлайн)' },
        onRender: (item) => {
            const ref = $('[data-name="interface_size"]').closest('.settings-param');
            if (ref.length) item.insertAfter(ref);

            item.on('hover:enter', open_editor_modal);
        }
    });

})();
