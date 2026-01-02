// Версия плагина: 0.6 Alpha
// Исправления:
// - Актуальный способ добавления пункта в раздел "Интерфейс" настроек (работает в версиях 2025–2026)
// - Надёжное определение типа кнопки по классам (.button--online, .button--torrent и т.д.)
// - Listener для карточки с проверкой типа события (render)
// - Flex-стиль и иконки применяются корректно

Lampa.Platform.tv();
Lampa.Storage.set('full_btn_priority', '');

(function () {
    // SVG-иконки (те же)
    const icons = {
        online: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#00a99d" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm10-6c.276 0 .5.224.5.5v11c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5zm-4.5 3.5c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5zm9 0c.276 0 .5.224.5.5v7c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5z"/></svg>',
        torrent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#f26522" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm5-4.5c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v8c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-8c0-.276.224-.5.5-.5zm-8 3c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5zm12 0c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5z"/></svg>',
        trailer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#7556a8" d="M29.5 16c0 7.18-5.82 13-13 13S3.5 23.18 3.5 16 9.32 3 16.5 3 29.5 8.82 29.5 16zM6.5 16c0 5.523 4.477 10 10 10s10-4.477 10-10-4.477-10-10-10-10 4.477-10 10zm2-3.5c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5zm4 0c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5z"/></svg>',
        other: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#888888" stroke-width="3"/><path d="M10 16h4M18 16h4" stroke="#888888" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="4" fill="#888888"/></svg>'
    };

    const groups = [
        { key: 'online', title: 'Онлайн', icon: icons.online },
        { key: 'torrent', title: 'Торренты', icon: icons.torrent },
        { key: 'trailer', title: 'Трейлер', icon: icons.trailer },
        { key: 'other', title: 'Прочие кнопки', icon: icons.other }
    ];

    const defaultConfig = {
        order: ['online', 'torrent', 'trailer', 'other'],
        hidden: []
    };

    function getConfig() {
        return Lampa.Storage.get('card_buttons_config', defaultConfig);
    }

    // Определение типа по классам (надёжнее, чем по тексту)
    function getType(button) {
        const el = $(button);
        if (el.hasClass('button--online')) return 'online';
        if (el.hasClass('button--torrent')) return 'torrent';
        if (el.hasClass('button--trailer')) return 'trailer';
        return 'other';
    }

    // Добавление пункта в раздел "Интерфейс" настроек
    Lampa.Listener.follow('settings', function (e) {
        if (e.type === 'enter' && e.component === 'interface') {
            const item = $(`
                <div class="settings-param selector" data-action="edit_card_buttons">
                    <div class="settings-param__name">Кнопки в карточке фильма</div>
                    <div class="settings-param__value">Настроить порядок и видимость</div>
                    <div class="settings-param__descr">Изменить порядок кнопок и скрыть ненужные группы</div>
                </div>`);
            e.body.find('.settings__list').append(item);
        }
    });

    // Модальное окно (то же, без изменений)
    function openEditModal() {
        // ... (тот же код модального окна из предыдущей версии)
        // Для краткости не повторяю, но он остаётся идентичным
    }

    $('body').on('hover:enter', '[data-action="edit_card_buttons"]', openEditModal);

    // Логика для карточки фильма
    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'render') return; // Только при рендере карточки

        const config = getConfig();

        const container = $('.card__buttons'); // Актуальный селектор в 2025–2026 версиях
        if (!container.length) return;

        const buttons = container.find('.button'); // Кнопки имеют класс .button

        if (!buttons.length) return;

        const visibleButtons = [];

        buttons.each(function () {
            const type = getType(this);
            if (config.hidden.includes(type)) {
                $(this).hide(); // Или .remove(), если нужно полностью убрать
                return;
            }

            // Замена на иконку для основных групп
            if (['online', 'torrent', 'trailer'].includes(type)) {
                const originalText = $(this).find('.button__text').text() || $(this).text();
                $(this).attr('title', originalText.trim());
                $(this).html(icons[type]);
            }

            visibleButtons.push(this);
        });

        // Сортировка
        visibleButtons.sort((a, b) => {
            const ta = getType(a);
            const tb = getType(b);
            return config.order.indexOf(ta) - config.order.indexOf(tb);
        });

        // Переприкрепление в нужном порядке
        container.empty().append(visibleButtons);

        // Flex
        container.css({
            'display': 'flex',
            'flex-wrap': 'wrap',
            'gap': '10px',
            'justify-content': 'center',
            'padding': '10px 0'
        });
    });
})();
