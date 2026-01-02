(function () {
    'use strict';

    if (!window.Lampa) return;

    const plugin_name = 'Кнопки в карточке';
    const base_keys = ['play', 'book', 'reaction', 'subscribe', 'options'];
    const base_icons = {
        play: '<svg><use xlink:href="#sprite-play"></use></svg>',
        book: '<svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path></svg>',
        reaction: '<svg><use xlink:href="#sprite-reaction"></use></svg>',
        subscribe: '<svg viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path><path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.6"></path></svg>',
        options: '<svg><use xlink:href="#sprite-dots"></use></svg>'
    };
    const base_titles = {
        play: 'Смотреть',
        book: 'Избранное',
        reaction: 'Реакции',
        subscribe: 'Подписаться',
        options: 'Дополнительно'
    };

    let all_sources = Lampa.Storage.get('card_buttons_all_sources', []);
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
        all_sources.forEach(src => {
            const btn = $(src.html);
            btn.addClass('selector');
            btn.on('hover:enter', () => {
                Lampa.Storage.set('quick_source', src.title);
                setTimeout(() => {
                    if (existing.play.length) existing.play.trigger('hover:enter');
                }, 200);
            });
            source_buttons[src.key] = btn;
        });

        container.empty();

        let order = Lampa.Storage.get('card_buttons_order', ['play', 'book', ...all_sources.map(s => s.key), 'reaction', 'subscribe', 'options']);
        let show = Lampa.Storage.get('card_buttons_show', {
            play: true, book: true, reaction: true, subscribe: true, options: true
        });

        all_sources.forEach(src => {
            if (!order.includes(src.key)) order.push(src.key);
            if (show[src.key] === undefined) show[src.key] = true;
        });

        Lampa.Storage.set('card_buttons_order', order);
        Lampa.Storage.set('card_buttons_show', show);

        order.forEach(key => {
            let btn = existing[key] || source_buttons[key];
            if (btn && show[key]) {
                container.append(btn);
            }
        });
    }

    const buttons_observer = new MutationObserver(() => {
        $('.full-start-new__buttons').each((_, cont) => customize_buttons($(cont)));
    });
    buttons_observer.observe(document.body, { childList: true, subtree: true });

    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complite') {
            setTimeout(() => {
                const items = $('.selectbox-item');
                if (!items.length) return;

                const new_sources = [];
                items.each(function () {
                    const $item = $(this);
                    const title = $item.find('.selectbox-item__title').text().trim();
                    if (!title) return;

                    let icon_svg = '<svg><use xlink:href="#sprite-online"></use></svg>';
                    const icon_elem = $item.find('.selectbox-item__icon svg');
                    if (icon_elem.length) {
                        icon_svg = icon_elem[0].outerHTML;
                    } else if (title.toLowerCase().includes('торрент')) {
                        icon_svg = '<svg><use xlink:href="#sprite-torrent"></use></svg>';
                    }

                    const key = 'src_' + title.replace(/[\s\(\)\-]+/g, '_').toLowerCase();

                    new_sources.push({
                        key,
                        title,
                        html: `<div class="full-start__button selector button--${key}">${icon_svg}<span>${title}</span></div>`
                    });
                });

                if (new_sources.length > 0) {
                    all_sources = new_sources;
                    Lampa.Storage.set('card_buttons_all_sources', all_sources);

                    $('.full-start-new__buttons').each((_, cont) => {
                        $(cont).removeData('customized');
                        customize_buttons($(cont));
                    });
                }
            }, 600);
        }
    });

    const quick_observer = new MutationObserver(() => {
        if (processing_quick) return;
        const quick = Lampa.Storage.get('quick_source', '');
        if (!quick) return;

        processing_quick = true;

        setTimeout(() => {
            const items = $('.selectbox-item');
            if (items.length < 2) {
                processing_quick = false;
                return;
            }

            let target = null;
            items.each(function () {
                if ($(this).find('.selectbox-item__title').text().trim() === quick) {
                    target = $(this);
                    return false;
                }
            });

            if (target) {
                items.not(target).hide();
                target.show();
                target.trigger('hover:enter');
                setTimeout(() => target.trigger('hover:enter'), 400);
            }

            Lampa.Storage.set('quick_source', '');
            setTimeout(() => processing_quick = false, 2000);
        }, 400);
    });
    quick_observer.observe(document.body, { childList: true, subtree: true });

    function build_list(container) {
        container.empty();

        let order = Lampa.Storage.get('card_buttons_order', ['play', 'book', ...all_sources.map(s => s.key), 'reaction', 'subscribe', 'options']);
        let show = Lampa.Storage.get('card_buttons_show', { play: true, book: true, reaction: true, subscribe: true, options: true });

        order.forEach((key, idx) => {
            const is_base = base_keys.includes(key);
            const title = is_base ? base_titles[key] : all_sources.find(s => s.key === key)?.title || key;
            const icon_svg = is_base ? base_icons[key] : all_sources.find(s => s.key === key)?.html.match(/<svg[^>]*>[\s\S]*?<\/svg>/i)?.[0] || '<svg><use xlink:href="#sprite-online"></use></svg>';

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
                Lampa.Storage.set('card_buttons_show', show);
                item.find('.dot').css('opacity', show[key] ? '1' : '0');

                $('.full-start-new__buttons').each((_, c) => {
                    $(c).removeData('customized');
                    customize_buttons($(c));
                });
            });

            item.find('.move-up.selector').on('hover:enter', () => {
                if (idx > 0) {
                    [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                    Lampa.Storage.set('card_buttons_order', order);
                    build_list(container);
                }
            });

            item.find('.move-down.selector').on('hover:enter', () => {
                if (idx < order.length - 1) {
                    [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
                    Lampa.Storage.set('card_buttons_order', order);
                    build_list(container);
                }
            });

            container.append(item);
        });
    }

    function open_editor_modal() {
        const list_container = $('<div class="menu-edit-list"></div>');
        build_list(list_container);

        const scroll = $('<div class="scroll scroll--over"><div class="scroll__content"><div class="scroll__body"></div></div></div>');
        scroll.find('.scroll__body').append(list_container);

        // Открываем как отдельную активность (не внутри настроек)
        Lampa.Activity.push({
            url: '',
            title: 'Редактировать кнопки в карточке',
            component: 'buttons_editor',
            html: scroll,
            page: 1,
            onBack: () => Lampa.Activity.back()
        });
    }

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'card_buttons_edit', type: 'static' },
        field: { name: 'Кнопки в карточке', description: 'Редактировать порядок и видимость' },
        onRender: (item) => {
            const ref = $('[data-name="interface_size"]').closest('.settings-param');
            if (ref.length) item.insertAfter(ref);

            item.on('hover:enter', open_editor_modal);
        }
    });

})();
