'use strict';

// Инициализация платформы Lampa в режиме TV
Lampa.Platform.tv();

// Основная функция для настройки интерфейса
function setupInterface() {
    Lampa.Listener.follow('full', function(event) {
        if (event.type !== 'complite') return;

        // Проверка ширины экрана и типа интерфейса
        if (window.innerWidth < 585 && Lampa.Storage.get('card_interfice_type') === 'table') {
            // Стили для правой части интерфейса
            $('.full-start-new__right').css({
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
                'align-items': 'center'
            });

            // Стили для кнопок и рейтинга
            $('.full-start-new__buttons, .full-start-new__rate-line').css({
                'justify-content': 'center',
                'align-items': 'center',
                'display': 'flex',
                'flex-direction': 'column',
                'gap': '0.5em',
                'flex-wrap': 'wrap'
            });

            // Стили для деталей
            $('.full-start-new__details').css({
                'justify-content': 'center',
                'align-items': 'center',
                'display': 'flex',
                'flex-direction': 'column',
                'flex-wrap': 'wrap'
            });

            // Фильтрация заголовков и применение стилей
            $('.items-line__head').children().filter(function() {
                const text = $(this).text().trim();
                return text && (
                    text === 'Рекомендации' ||
                    text === 'Режиссер' ||
                    text === 'Актеры' ||
                    text === 'Подробно' ||
                    text === 'Похожие' ||
                    text.includes('Сезон') ||
                    text === 'Коллекция'
                );
            }).css({
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'width': '100%'
            });

            // Стили для текста и тегов
            $('.full-descr__details, .full-descr__tags').css({
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
                'align-items': 'center'
            });

            // Центрирование текста
            $('.full-descr__text, .full-start-new__title, .full-start-new__tagline, .full-start-new__head').css('text-align', 'center');
        } else {
            // Стили для левой части интерфейса
            $('.full-start__left').css({
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
                'align-items': 'center'
            });

            // Стили для кнопок
            $('.full-start__buttons, .full-start__deta').css({
                'justify-content': 'center',
                'align-items': 'center',
                'display': 'flex',
                'flex-direction': 'row',
                'gap': '0.5em',
                'flex-wrap': 'wrap'
            });

            // Стили для тегов
            $('.full-start__tags').css({
                'justify-content': 'center',
                'align-items': 'center',
                'display': 'flex',
                'flex-direction': 'row',
                'flex-wrap': 'wrap'
            });

            // Фильтрация заголовков и применение стилей
            $('.items-line__head').children().filter(function() {
                const text = $(this).text().trim();
                return text && (
                    text === 'Рекомендации' ||
                    text === 'Режиссер' ||
                    text === 'Актеры' ||
                    text === 'Подробно' ||
                    text === 'Похожие' ||
                    text.includes('Сезон') ||
                    text === 'Коллекция'
                );
            }).css({
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'width': '100%'
            });

            // Стили для текста и тегов
            $('.full-descr__details, .full-descr__tags').css({
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
                'align-items': 'center'
            });

            // Центрирование текста
            $('.full-descr__text, .full-start__title, .full-start__title-original').css('text-align', 'center');
        }
    });
}

// Запуск функции при готовности приложения
if (window.appready) {
    setupInterface();
} else {
    Lampa.Listener.follow('app', function(event) {
        if (event.type === 'ready') {
            setupInterface();
        }
    });
}