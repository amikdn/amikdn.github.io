(function () {
    'use strict';

    if (!window.Lampa) return;

    const plugin_name = 'Управление кнопками';
    const base_keys = ['play', 'book', 'reaction', 'subscribe', 'options'];
    const base_titles = {
        play: 'Смотреть',
        book: 'Избранное',
        reaction: 'Реакции',
        subscribe: 'Подписаться',
        options: 'Дополнительно'
    };
    const base_icons = {
        play: '<svg><use xlink:href="#sprite-play"></use></svg>',
        book: '<svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path></svg>',
        reaction: '<svg><use xlink:href="#sprite-reaction"></use></svg>',
        subscribe: '<svg viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path><path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.6"></path></svg>',
        options: '<svg><use xlink:href="#sprite-dots"></use></svg>'
    };

    function customize_buttons(container) {
        if (!container.length || container.data('customized')) return;
        container.data('customized', true);

        // Отсоединяем только базовые кнопки
        const detached = {};
        base_keys.forEach(key => {
            const btn = container.find('.button--' + key).detach();
            if (btn.length) detached[key] = btn;
        });

        // Приоритетные кнопки источников (добавленные Lampa долгим нажатием) остаются на месте

        // Добавляем видимые базовые кнопки в начало в нужном порядке
        const order = Lampa.Storage.get('buttons_order', base_keys);
        const show = Lampa.Storage.get('buttons_show', {
            play: true, book: true, reaction: true, subscribe: true, options: true
        });

        const visible_base = [];
        order.forEach(key => {
            if (detached[key] && show[key]) {
                visible_base.push(detached[key]);
            }
        });

        container.prepend(visible_base);
    }

    const observer = new MutationObserver(() => {
        const container = $('.full-start-new__buttons');
        if (container.length) customize_buttons(container);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function open_editor_modal() {
        const list = $('<div class="menu-edit-list"></div>');

        const order = Lampa.Storage.get('buttons_order', base_keys);
        const show = Lampa.Storage.get('buttons_show', {
            play: true, book: true, reaction: true, subscribe: true, options: true
        });

        order.forEach((key, idx) => {
            const title = base_titles[key];
            const icon_svg = base_icons[key];

            const item = $(`
                <div class="menu-edit-list__item selector">
                    <div class="menu-edit-list__icon">${icon_svg}</div>
                    <div class="menu-edit-list__title">${title}</div>
                    <div class="menu-edit-list__move move-up selector ${idx === 0 ? 'hide' : ''}">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector ${idx === order.length - 1 ? 'hide' : ''}">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"></rect>
                            <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="${show[key] ? '1' : '0'}" stroke-linecap="round"></path>
                        </svg>
                    </div>
                </div>
            `);

            item.find('.toggle.selector').on('hover:enter', () => {
                show[key] = !show[key];
                Lampa.Storage.set('buttons_show', show);
                item.find('.dot').css('opacity', show[key] ? '1' : '0');

                $('.full-start-new__buttons').each(function () {
                    $(this).removeData('customized');
                    customize_buttons($(this));
                });
            });

            item.find('.move-up.selector').on('hover:enter', () => {
                if (idx > 0) {
                    [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                    Lampa.Storage.set('buttons_order', order);
                    open_editor_modal();
                }
            });

            item.find('.move-down.selector').on('hover:enter', () => {
                if (idx < order.length - 1) {
                    [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
                    Lampa.Storage.set('buttons_order', order);
                    open_editor_modal();
                }
            });

            list.append(item);
        });

        const scroll = $('<div class="scroll scroll--over"><div class="scroll__content"><div class="scroll__body"></div></div></div>');
        scroll.find('.scroll__body').append(list);

        Lampa.Modal.open({
            title: 'Редактировать базовые кнопки',
            html: scroll,
            onBack: () => Lampa.Modal.close(),
            size: 'medium'
        });
    }

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'base_buttons_edit', type: 'static' },
        field: { name: 'Базовые кнопки в карточке', description: 'Скрывать и перемещать порядок (кнопки источников добавляются долгим нажатием в списке "Источник")' },
        onRender: (item) => {
            const ref = $('[data-name="interface_size"]').closest('.settings-param');
            if (ref.length) item.insertAfter(ref);

            item.on('hover:enter', open_editor_modal);
        }
    });

})();
