(function () {
    'use strict';

    // Логируем запуск плагина
    console.log('Плагин для удаления кнопки RuTube и блокировки rutube.js активирован');

    // Удаление кнопки RuTube-трейлеров из меню
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            try {
                var render = e.object.activity.render();
                var rutubeButton = render.find('.view--rutube_trailer');
                if (rutubeButton.length) {
                    rutubeButton.remove();
                    console.log('Кнопка RuTube-трейлеров удалена из меню');
                } else {
                    console.log('Кнопка RuTube-трейлеров не найдена');
                }
            } catch (err) {
                console.error('Ошибка при удалении кнопки RuTube:', err);
            }
        }
    });

    // Перехват функции VPN.region для блокировки загрузки rutube.js
    var originalRegion = window.VPN ? window.VPN.region : null;

    window.VPN = window.VPN || {};
    window.VPN.region = function (callback) {
        try {
            if (originalRegion) {
                originalRegion(function (code) {
                    if (code === 'ru') {
                        console.log('Загрузка rutube.js для региона ru заблокирована');
                        return; // Пропускаем загрузку rutube.js
                    }
                    console.log('Регион:', code, '— загрузка rutube.js разрешена');
                    callback(code); // Вызываем callback для других регионов
                });
            } else {
                console.log('VPN.region не найден, rutube.js не загружается');
            }
        } catch (err) {
            console.error('Ошибка в перехвате VPN.region:', err);
        }
    };

    // Проверка, что плагин не конфликтует с другими
    if (window.rutube_trailer_plugin) {
        console.log('RuTube trailer plugin уже загружен, возможен конфликт');
    }
})();
