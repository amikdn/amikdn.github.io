// Версия плагина: 0.9 Alpha
// Особенности:
// - В карточке фильма добавлена кнопка с шестерёнкой "Редактировать кнопки"
// - При нажатии на неё сразу открывается модальное окно редактирования порядка/видимости
// - Основные кнопки (Онлайн, Торренты, Трейлер) заменены на крупные иконки и остаются кликабельными (открывают источники)
// - Прочие кнопки остаются с текстом
// - Настройки в разделе "Плагины" → "Кнопки в карточке"
// - Всё работает на TV (пульт)

Lampa.Platform.tv();
Lampa.Storage.set('full_btn_priority', '');

(function () {
    const plugin_name = 'card_buttons_mod';

    // SVG-иконки для основных групп
    const icons = {
        online: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#00a99d" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm10-6c.276 0 .5.224.5.5v11c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5zm-4.5 3.5c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5zm9 0c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5z"/></svg>',
        torrent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#f26522" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm5-4.5c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm-8 3c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5zm12 0c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5z"/></svg>',
        trailer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#7556a8" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm2-3.5c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5z"/></svg>'
    };

    // Иконка шестерёнки для кнопки редактирования
    const editIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#cccccc" d="M27.5 16c0 6.351-5.149 11.5-11.5 11.5S4.5 22.351 4.5 16 9.649 4.5 16 4.5c2.794 0 5.357 1.002 7.344 2.664l-1.59 1.59C20.297 7.664 18.212 7 16 7c-4.97 0-9 4.03-9 9s4.03 9 9 9c3.537 0 6.624-2.043 8.113-5h-2.613v-2h5v5h-2v-2.777C23.362 19.583 20.416 21.5 17 21.5c-3.038 0-5.5-2.462-5.5-5.5S13.962 10.5 16 10.5c1.654 0 3.157.73 4.177 1.89l1.59-1.59C20.957 9.002 18.794 8.5 16 8.5c-6.351 0-11.5 5.149-11.5 11.5S9.649 31.5 16 31.5 27.5 26.351 27.5 16z"/></svg>';

    const groups = [
        { key: 'online', title: 'Онлайн', icon: icons.online },
        { key: 'torrent', title: 'Торренты', icon: icons.torrent },
        { key: 'trailer', title: 'Трейлер', icon: icons.trailer },
        { key: 'other', title: 'Прочие кнопки', icon: '' }
    ];

    const defaultConfig = {
        enabled: true,
        order: ['online', 'torrent', 'trailer', 'other'],
        hidden: []
    };

    let config = Lampa.Storage.get(plugin_name + '_config', defaultConfig);

    function saveConfig() {
        Lampa.Storage.set(plugin_name + '_config', config);
    }

    function getType(button) {
        const cls = button.className || '';
        if (cls.includes('online')) return 'online';
        if (cls.includes('torrent')) return 'torrent';
        if (cls.includes('trailer')) return 'trailer';
        return 'other';
    }

    // Модальное окно редактирования
    function openEditModal() {
        const modal = $(`
            <div class="modal animate">
                <div class="modal__content">
                    <div class="modal__head">
                        <div class="modal__title">Редактировать кнопки в карточке</div>
                        <div class="modal__close selector"><svg width="26" height="26" viewBox="0 0 26 26"><path d="M6 6l14 14M6 20L20 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>
                        <div class="modal__save selector" style="margin-left:auto;">Сохранить</div>
                        <div class="modal__reset selector">Сброс</div>
                    </div>
                    <div class="modal__body">
                        <div class="scroll scroll--over">
                            <div class="scroll__content" style="max-height: 777px;">
                                <div class="scroll__body">
                                    <div class="menu-edit-list"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);

        $('body').append(modal);
        modal.addClass('open');

        const list = modal.find('.menu-edit-list');

        function buildList() {
            list.empty();
            config.order.forEach(key => {
                const group = groups.find(g => g.key === key);
                if (!group) return;
                const hidden = config.hidden.includes(key);
                const item = $(`
                    <div class="menu-edit-list__item ${hidden ? 'hide' : ''}">
                        <div class="menu-edit-list__icon">${group.icon || '<div style="width:40px;height:40px;background:#444;border-radius:8px;"></div>'}</div>
                        <div class="menu-edit-list__title">${group.title}</div>
                        <div class="menu-edit-list__move move-up selector ${config.order.indexOf(key) === 0 ? 'hide' : ''}">
                            <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                        </div>
                        <div class="menu-edit-list__move move-down selector ${config.order.indexOf(key) === config.order.length - 1 ? 'hide' : ''}">
                            <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                        </div>
                        <div class="menu-edit-list__toggle toggle selector">
                            <svg width="26" height="26" viewBox="0 0 26 26">
                                <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>
                                <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" style="opacity:${hidden ? 0 : 1}"/>
                            </svg>
                        </div>
                    </div>`);
                list.append(item);
            });
        }

        buildList();

        modal.on('hover:enter', '.move-up', function () {
            const item = $(this).closest('.menu-edit-list__item');
            const prev = item.prev('.menu-edit-list__item');
            if (prev.length) {
                item.insertBefore(prev);
                buildList(); // обновляем hide для стрелок
            }
        });

        modal.on('hover:enter', '.move-down', function () {
            const item = $(this).closest('.menu-edit-list__item');
            const next = item.next('.menu-edit-list__item');
            if (next.length) {
                item.insertAfter(next);
                buildList();
            }
        });

        modal.on('hover:enter', '.menu-edit-list__toggle', function () {
            const item = $(this).closest('.menu-edit-list__item');
            item.toggleClass('hide');
            $(this).find('.dot').css('opacity', item.hasClass('hide') ? 0 : 1);
        });

        modal.on('hover:enter', '.modal__save', function () {
            config.order = [];
            config.hidden = [];
            list.find('.menu-edit-list__item').each(function () {
                const title = $(this).find('.menu-edit-list__title').text();
                const group = groups.find(g => g.title === title);
                if (group) {
                    config.order.push(group.key);
                    if ($(this).hasClass('hide')) config.hidden.push(group.key);
                }
            });
            saveConfig();
            modal.removeClass('open');
            setTimeout(() => modal.remove(), 300);
            Lampa.Noty.show('Настройки сохранены. Откройте карточку заново.');
        });

        modal.on('hover:enter', '.modal__reset', function () {
            config = JSON.parse(JSON.stringify(defaultConfig));
            saveConfig();
            buildList();
        });

        modal.on('hover:enter', '.modal__close', function () {
            modal.removeClass('open');
            setTimeout(() => modal.remove(), 300);
        });

        setTimeout(() => {
            Lampa.Controller.collectionSet(modal.find('.modal__content')[0]);
            Lampa.Controller.collectionFocus(modal.find('.selector').first()[0], modal.find('.modal__content')[0]);
        }, 100);
    }

    // Организация кнопок в карточке
    function organizeButtons() {
        if (!config.enabled) return;

        const act = Lampa.Activity.active();
        if (!act || !act.activity) return;

        const el = act.activity.render();
        if (!el) return;

        const cont = el.find('.full-start-new__buttons').length ? el.find('.full-start-new__buttons') :
                     el.find('.full-start__buttons').length ? el.find('.full-start__buttons') :
                     el.find('.buttons-container');

        if (!cont.length) return;

        const selectors = [
            '.full-start-new__buttons .full-start__button',
            '.full-start__buttons .full-start__button',
            '.buttons-container .button'
        ];

        let buttons = $();
        selectors.forEach(s => buttons = buttons.add(el.find(s)));

        if (!buttons.length) return;

        const visibleButtons = [];

        buttons.each(function () {
            const $btn = $(this);
            const type = getType(this);

            if (config.hidden.includes(type)) {
                $btn.hide();
                return;
            }

            let originalText = $btn.text().trim() || $btn.attr('title') || '';

            if (icons[type]) {
                $btn.empty().append($(icons[type]));
                $btn.attr('title', originalText || type);

                $btn.css({
                    'width': '90px',
                    'height': '90px',
                    'padding': '0',
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'background': 'rgba(255,255,255,0.1)',
                    'border-radius': '12px'
                });
                $btn.find('svg').css({
                    'width': '60px',
                    'height': '60px'
                });
            }

            visibleButtons.push(this);
        });

        // Сортировка
        visibleButtons.sort((a, b) => {
            const ta = getType(a);
            const tb = getType(b);
            return config.order.indexOf(ta) - config.order.indexOf(tb);
        });

        // Кнопка редактирования
        const editButton = $(`
            <div class="full-start__button selector edit-card-buttons-btn" title="Редактировать кнопки">
                ${editIcon}
            </div>`);
        editButton.css({
            'width': '90px',
            'height': '90px',
            'padding': '0',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'background': 'rgba(255,255,255,0.1)',
            'border-radius': '12px'
        });
        editButton.find('svg').css({
            'width': '60px',
            'height': '60px'
        });

        // Перестраиваем контейнер
        cont.empty().append(visibleButtons).append(editButton);

        cont.css({
            'display': 'flex',
            'flex-wrap': 'wrap',
            'gap': '15px',
            'justify-content': 'center',
            'padding': '15px 0'
        });
    }

    // Обработчик нажатия на кнопку редактирования в карточке
    $('body').on('hover:enter', '.edit-card-buttons-btn', function () {
        openEditModal();
    });

    // Применение при открытии карточки
    if (Lampa.FullCard) {
        const orig = Lampa.FullCard.build;
        Lampa.FullCard.build = function (data) {
            const card = orig(data);
            card.organizeButtons = organizeButtons;
            card.onCreate = function () { setTimeout(organizeButtons, 300); };
            return card;
        };
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' && config.enabled) {
            setTimeout(organizeButtons, 300);
        }
    });

    new MutationObserver(function () {
        if (config.enabled) setTimeout(organizeButtons, 100);
    }).observe(document.body, { childList: true, subtree: true });

    // Настройки плагина
    function startPlugin() {
        Lampa.SettingsApi.addComponent({
            component: plugin_name,
            name: 'Кнопки в карточке',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: plugin_name,
            param: { name: 'enabled', type: 'trigger', default: true },
            field: { name: 'Включить плагин' },
            onChange: v => { config.enabled = v; saveConfig(); }
        });

        Lampa.SettingsApi.addParam({
            component: plugin_name,
            param: { name: 'edit', type: 'button' },
            field: { name: 'Редактировать в настройках' },
            onClick: openEditModal
        });

        config = Lampa.Storage.get(plugin_name + '_config', defaultConfig);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') startPlugin(); });

    Lampa.Manifest.plugins = {
        name: 'Кнопки в карточке',
        version: '0.9',
        description: 'Иконки вместо текста + кнопка редактирования прямо в карточке'
    };
})();
