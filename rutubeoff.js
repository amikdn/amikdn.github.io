(function () {
    'use strict';

    // Удаление кнопки трейлеров из меню
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            e.object.activity.render().find('.view--trailer').remove();
            console.log('Кнопка трейлеров удалена из меню');
        }
    });

    // Перехват функции VPN.region для блокировки rutube.js
    var originalRegion = window.VPN ? window.VPN.region : null;

    window.VPN = window.VPN || {};
    window.VPN.region = function (callback) {
        if (originalRegion) {
            originalRegion(function (code) {
                if (code === 'ru') {
                    console.log('Загрузка rutube.js для региона ru заблокирована');
                    return; // Пропускаем загрузку rutube.js
                }
                callback(code); // Вызываем callback для других регионов
            });
        } else {
            console.log('VPN.region не найден, rutube.js не загружается');
        }
    };

    // Логируем запуск плагина
    console.log('Плагин для удаления трейлеров и блокировки rutube.js активирован');
})();
