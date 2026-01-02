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

    let dynamic_buttons = {};       // Текущие найденные источники (для создания кнопок)
    let saved_dynamic_sources = []; // Сохранённые для настроек (массив {key, title})

    // Загружаем сохранённые динамические источники
    saved_dynamic_sources = Lampa.Storage.get('dynamic_sources', []);

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

        // Создаём динамические кнопки из текущих найденных источников
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

        // Добавляем недостающие базовые ключи
        base_keys.forEach(k => {
            if (!current_order.includes(k)) current_order.push(k);
        });

        // Добавляем недостающие динамические ключи (вставляем после 'book' или в конец)
        let book_index = current_order.indexOf('book');
        let insert_pos = book_index >= 0 ? book_index + 1 : current_order.length;

        Object.keys(dynamic_buttons).forEach(key => {
            if (!current_order.includes(key)) {
                current_order.splice(insert_pos, 0, key);
                insert_pos++;
            }
            // По умолчанию показываем динамические кнопки
            if (show_settings[key] === undefined) show_settings[key] = true;
        });

        Lampa.Storage.set('buttons_order', current_order);
        Lampa.Storage.set('buttons_show', show_settings);

        // Добавляем кнопки по порядку
        current_order.forEach(key => {
            let btn = existing[key] || source_buttons[key];
            if (btn && (show_settings[key] ?? false)) {
                container.append(btn);
            }
        });
    }

    // Observer для основной строки кнопок
    const buttons_observer = new MutationObserver(() => {
        const container = $('.full-start-new__buttons');
        if (container.length) customize_buttons(container);
    });
    buttons_observer.observe(document.body, { childList: true, subtree: true });

    // Observer для выбора источников — собираем динамические кнопки
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

            // Добавляем только Торренты или источники с подписью «Онлайн просмотр»
            if (title === 'Торренты' || subtitle.includes('онлайн')) {
                let icon_html = $item.find('.selectbox-item__icon')[0].outerHTML || '';

                // Специально для Торрентов — гарантируем правильную иконку
                if (title === 'Торренты') {
                    icon_html = '<svg><use xlink:href="#sprite-torrent"></use></svg>';
                }

                const key = 'source_' + title.replace(/[\s\(\)\-]+/g, '_').toLowerCase();

                // Избегаем дубликатов ключей
                let unique_key = key;
                let counter = 1;
                while (dynamic_buttons[unique_key]) {
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

        // Сохраняем для настроек
        if (new_dynamic.length > 0) {
            Lampa.Storage.set('dynamic_sources', new_dynamic);
            saved_dynamic_sources = new_dynamic;
        }

        // Пересобираем кнопки, если контейнер уже есть
        $('.full-start-new__buttons').each(function () {
            $(this).removeData('customized');
            customize_buttons($(this));
        });
    });
    source_observer.observe(document.body, { childList: true, subtree: true });

    // Быстрый выбор источника
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

    function render_settings_list(view) {
        const list = view.find('.buttons-list').empty();

        let current_order = Lampa.Storage.get('buttons_order', default_order.slice());
        let show_settings = Lampa.Storage.get('buttons_show', {
            play: true, book: true, reaction: true, subscribe: true, options: true
        });

        // Добавляем все базовые и динамические ключи
        const all_current_keys = [...base_keys];
        saved_dynamic_sources.forEach(src => {
            all_current_keys.push(src.key);
            if (!current_order.includes(src.key)) current_order.push(src.key);
            if (show_settings[src.key] === undefined) show_settings[src.key] = true;
        });

        Lampa.Storage.set('buttons_order', current_order);
        Lampa.Storage.set('buttons_show', show_settings);

        // Отображаем в порядке current_order
        current_order.forEach((key, idx) => {
            const title = base_name_map[key] || 
                          saved_dynamic_sources.find(s => s.key === key)?.title || 
                          key;

            const item = $('<div class="buttons-list__item selector" data-index="' + idx + '"></div>');
            item.append('<div class="item-name">' + title + '</div>');
            item.append('<div class="item-toggle">' + ((show_settings[key] ?? true) ? 'Видима' : 'Скрыта') + '</div>');
            if (idx > 0) item.append('<div class="item-up">↑</div>');
            if (idx < current_order.length - 1) item.append('<div class="item-down">↓</div>');
            list.append(item);
        });

        // Обработчики
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

    // Пункт в настройках (в разделе Интерфейс)
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "buttons_manager_open",
            type: "static"
        },
        field: {
            name: "Управление кнопками",
            description: "Скрывать/показывать и перемещать кнопки в карточке"
        },
        onRender: function (item) {
            const sizeItem = $('[data-name="interface_size"]').closest('.settings-param');
            if (sizeItem.length && !item.parent().length) {
                item.insertAfter(sizeItem);
            }

            item.on('hover:enter', () => {
                const view = $(`
                    <div>
                        <div class="settings__title">Управление кнопками в карточке</div>
                        <div class="buttons-list" style="margin-top: 1em;"></div>
                        <div class="settings__description" style="margin-top: 1em;">
                            • Наведите на «Видима/Скрыта» — переключить<br>
                            • ↑↓ — переместить кнопку вверх/вниз<br><br>
                            Быстрые кнопки источников (Торренты и онлайн-парсеры) добавляются автоматически с их оригинальными иконками и названиями.
                        </div>
                    </div>
                `);

                render_settings_list(view);

                Lampa.Settings.main().update({
                    title: plugin_name,
                    html: view
                });
            });
        }
    });

})();
