'use strict';

Lampa.Platform.tv();

setInterval(function() {
    if (typeof Lampa !== 'undefined') {
        clearInterval(this);

        var unic_id = Lampa.Storage.get('lampac_unic_id', '');
        if (unic_id !== 'tyusdt') {
            Lampa.Storage.set('lampac_unic_id', 'tyusdt');
        }

        Lampa.Utils.putScriptAsync(['http://185.87.48.42:2627/online.js'], function() {});
    }
}, 200);
