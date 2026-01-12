(function() {
    'use strict';

    // Измените значение здесь на своё
    const defaultUnicId = 'azharkov';

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            // Устанавливаем только если значения ещё нет
            if (!Lampa.Storage.get('lampac_unic_id', '')) {
                Lampa.Storage.set('lampac_unic_id', defaultUnicId);
            }
        }
    });
})();
