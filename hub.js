// Версия плагина: 0.5 Alpha
// Плагин изменяет порядок отображения кнопок в карточке фильма/сериала.
// Новый функционал:
// - Пользовательский порядок и видимость групп кнопок (Онлайн, Торренты, Трейлер, Прочие)
// - Замена текста основных кнопок на цветные SVG-иконки
// - Flex-отображение с отступами
// - Пункт в настройках Lampa → «Кнопки в карточке» для редактирования порядка/видимости
// - Очищает full_btn_priority (чтобы не конфликтовало)

Lampa.Platform.tv();
Lampa.Storage.set('full_btn_priority', '');

(function () {
    // SVG-иконки для групп
    const icons = {
        online: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#00a99d" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm10-6c.276 0 .5.224.5.5v11c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5zm-4.5 3.5c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5zm9 0c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5z"/></svg>',
        torrent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#f26522" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm5-4.5c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm-8 3c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5zm12 0c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5z"/></svg>',
        trailer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#7556a8" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm2-3.5c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5z"/></svg>',
        other: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#888888" stroke-width="3"/><path d="M10 16h4M18 16h4" stroke="#888888" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="4" fill="#888888"/></svg>'
    };

    // Группы кнопок для редактора
    const groups = [
        { key: 'online', title: 'Онлайн', icon: icons.online },
        { key: 'torrent', title: 'Торренты', icon: icons.torrent },
        { key: 'trailer', title: 'Трейлер', icon: icons.trailer },
        { key: 'other', title: 'Прочие кнопки', icon: icons.other }
    ];

    // Дефолтная конфигурация
    const defaultConfig = {
        order: ['online', 'torrent', 'trailer', 'other'],
        hidden: []
    };

    // Получение текущей конфигурации
    function getConfig() {
        return Lampa.Storage.get('card_buttons_config', defaultConfig);
    }

    // Определение типа кнопки
    function getType(button) {
        const text = $(button).text().toLowerCase().trim();
        if (text.includes('онлайн') || text.includes('online')) return 'online';
        if (text.includes('торрент') || text.includes('torrent')) return 'torrent';
        if (text.includes('трейлер') || text.includes('trailer')) return 'trailer';
        return 'other';
    }

    // Добавление пункта в настройки
    Lampa.Listener.follow('settings', function (e) {
        if (e.type === 'enter' && e.component === 'main') {
            const item = `
                <div class="selector settings-param" data-action="edit_card_buttons">
                    <div class="settings-param__name">Кнопки в карточке</div>
                    <div class="settings-param__value">Настроить порядок и видимость</div>
                </div>`;
            e.body.find('.settings__list').append(item);
        }
    });

    // Открытие модального окна редактирования
    function openEditModal() {
        const config = getConfig();

        // Создаём модальное окно
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

        // Построение списка
        function buildList() {
            list.empty();
            const currentOrder = config.order.slice();
            currentOrder.forEach(key => {
                const group = groups.find(g => g.key === key);
                if (!group) return;
                const hidden = config.hidden.includes(key);
                const item = $(`
                    <div class="menu-edit-list__item ${hidden ? 'hide' : ''}">
                        <div class="menu-edit-list__icon">${group.icon}</div>
                        <div class="menu-edit-list__title">${group.title}</div>
                        <div class="menu-edit-list__move move-up selector">
                            <svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                        </div>
                        <div class="menu-edit-list__move move-down selector">
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
            updateMoveButtons();
        }

        function updateMoveButtons() {
            list.find('.menu-edit-list__item').each(function (idx) {
                $(this).find('.move-up').toggleClass('selector', idx > 0);
                $(this).find('.move-down').toggleClass('selector', idx < list.find('.menu-edit-list__item').length - 1);
            });
        }

        buildList();

        // Обработчики
        modal.on('hover:enter', '.move-up', function () {
            const item = $(this).closest('.menu-edit-list__item');
            const prev = item.prev('.menu-edit-list__item');
            if (prev.length) {
                item.insertBefore(prev);
                updateMoveButtons();
            }
        });

        modal.on('hover:enter', '.move-down', function () {
            const item = $(this).closest('.menu-edit-list__item');
            const next = item.next('.menu-edit-list__item');
            if (next.length) {
                item.insertAfter(next);
                updateMoveButtons();
            }
        });

        modal.on('hover:enter', '.menu-edit-list__toggle', function () {
            const item = $(this).closest('.menu-edit-list__item');
            item.toggleClass('hide');
            const dot = $(this).find('.dot');
            dot.css('opacity', item.hasClass('hide') ? 0 : 1);
        });

        modal.on('hover:enter', '.modal__save', function () {
            const newOrder = [];
            const newHidden = [];
            list.find('.menu-edit-list__item').each(function () {
                const title = $(this).find('.menu-edit-list__title').text();
                const group = groups.find(g => g.title === title);
                if (group) {
                    newOrder.push(group.key);
                    if ($(this).hasClass('hide')) newHidden.push(group.key);
                }
            });
            Lampa.Storage.set('card_buttons_config', { order: newOrder, hidden: newHidden });
            closeModal();
        });

        modal.on('hover:enter', '.modal__reset', function () {
            config.order = defaultConfig.order.slice();
            config.hidden = defaultConfig.hidden.slice();
            buildList();
        });

        modal.on('hover:enter', '.modal__close', closeModal);

        function closeModal() {
            modal.removeClass('open');
            setTimeout(() => modal.remove(), 300);
        }

        // Фокус на первый selector
        setTimeout(() => {
            const first = modal.find('.selector').first();
            if (first.length) Lampa.Controller.collectionSet(modal.find('.modal__content')[0]);
            Lampa.Controller.collectionFocus(first[0], modal.find('.modal__content')[0]);
        }, 100);
    }

    // Бинд открытия модала
    $('body').on('hover:enter', '[data-action="edit_card_buttons"]', openEditModal);

    // Основная логика при открытии карточки
    Lampa.Listener.follow('full', function () {
        const config = getConfig();

        const container = $('.view--card .card__buttons');
        const buttons = container.find('.card__button');

        if (!buttons.length) return;

        // Сбор видимых кнопок и замена иконок
        const visibleButtons = [];
        buttons.each(function () {
            const type = getType(this);
            if (config.hidden.includes(type)) {
                $(this).detach();
                return;
            }
            if (['online', 'torrent', 'trailer'].includes(type)) {
                const originalText = $(this).text().trim();
                $(this).attr('title', originalText);
                $(this).html(icons[type]);
            }
            visibleButtons.push(this);
        });

        // Сортировка
        visibleButtons.sort((a, b) => {
            const ta = getType(a);
            const tb = getType(b);
            const ia = config.order.indexOf(ta);
            const ib = config.order.indexOf(tb);
            return ia - ib;
        });

        // Применение
        container.empty().append(visibleButtons);

        // Flex-стиль
        container.css({
            'display': 'flex',
            'flex-wrap': 'wrap',
            'gap': '10px',
            'justify-content': 'center'
        });
    });
})();
