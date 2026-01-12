(function() {
    'use strict';

    // Ваш фиксированный ID (измените на нужный)
    const fixedUnicId = 'azharkov';

    // Принудительно устанавливаем ID при каждом запуске приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            Lampa.Storage.set('lampac_unic_id', fixedUnicId);
            console.log('lampac_unic_id установлен:', fixedUnicId);
        }
    });
})();
