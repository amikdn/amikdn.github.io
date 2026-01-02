// Версия плагина: 0.9 Alpha
// Новое:
// - В карточке фильма добавлена отдельная кнопка "Редактировать" (иконка шестерёнки)
// - При выборе/нажатии на эту кнопку сразу открывается модальное окно редактирования порядка и видимости
// - Кнопка всегда видима (даже если все группы скрыты)
// - Основные кнопки (онлайн/торрент/трейлер) остаются кликабельными и открывают стандартное окно источников
// - Иконки основных кнопок крупные, с подсказками (title)
// - Всё остальное без изменений

Lampa.Platform.tv();
Lampa.Storage.set('full_btn_priority', '');

(function () {
    const plugin_name = 'card_buttons_mod';

    // SVG-иконки основных групп
    const icons = {
        online: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#00a99d" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm10-6c.276 0 .5.224.5.5v11c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5zm-4.5 3.5c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5zm9 0c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5z"/></svg>',
        torrent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#f26522" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm5-4.5c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm-8 3c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5zm12 0c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5z"/></svg>',
        trailer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#7556a8" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm2-3.5c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5z"/></svg>'
    };

    // Иконка для кнопки редактирования (шестерёнка)
    const editIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#aaaaaa" d="M28 16c0-1.105-.895-2-2-2h-8V6c0-1.105-.895-2-2-2s-2 .895-2 2v8H6c-1.105 0-2 .895-2 2s.895 2 2 2h8v8c0 1.105 .895 2 2 2s2-.895 2-2v-8h8c1.105 0 2-.895 2-2z"/></svg>';

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

    // Организация кнопок + добавление кнопки редактирования
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

        // Добавляем кнопку редактирования
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

        // Очищаем и добавляем кнопки + кнопку редактирования в конец
        cont.empty().append(visibleButtons).append(editButton);

        // Flex
        cont.css({
            'display': 'flex',
            'flex-wrap': 'wrap',
            'gap': '15px',
            'justify-content': 'center',
            'padding': '15px 0'
        });
    }

    // Обработчик для кнопки редактирования в карточке
    $('body').on('hover:enter', '.edit-card-buttons-btn', function () {
        openEditModal();
    });

    // ... (остальной код: переопределение FullCard, listener full, MutationObserver, openEditModal, настройки — без изменений из версии 0.8)

    // В openEditModal добавить заголовок "Редактировать кнопки в карточке" и кнопки Сохранить/Сброс/Закрыть

    // Полный код openEditModal из предыдущей версии, но с небольшим улучшением заголовка
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

        // ... (весь остальной код модального окна из версии 0.7/0.8 — buildList, обработчики и т.д.)
    }

    // ... (остальные функции без изменений)

    function startPlugin() {
        // ... (настройки как в версии 0.8)
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') startPlugin(); });

    Lampa.Manifest.plugins = {
        name: 'Кнопки в карточке',
        version: '0.9',
        description: 'Иконки + прямая кнопка редактирования в карточке'
    };
})();
