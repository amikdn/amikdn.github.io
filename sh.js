(function() {
    'use strict';

    if (window.showy_only_loader) return;
    window.showy_only_loader = true;

    function decodeHidden(input) {
        try {
            return decodeURIComponent(escape(atob(input)));
        } catch (e) {
            return atob(input);
        }
    }

    var pluginUrl = decodeHidden('aHR0cDovL3Nob3d5Lm9ubGluZS9vbmxpbmUuanM=');
    var showyUid = decodeHidden('aThucWI5dnc=');
    var showyToken = decodeHidden('ZjgzNzcwNTctOTBlYi00ZDc2LTkzYzktNzYwNTk1MmEwOTZs');

    function lockCredentials() {
        if (!Lampa.Storage.__showyOriginalSet) {
            Lampa.Storage.__showyOriginalSet = Lampa.Storage.set;
            Lampa.Storage.set = function(name, value) {
                if (name === 'lampac_unic_id') value = showyUid;
                if (name === 'showy_token') value = showyToken;
                return Lampa.Storage.__showyOriginalSet.call(Lampa.Storage, name, value);
            };
        }

        Lampa.Storage.set('lampac_unic_id', showyUid);
        Lampa.Storage.set('showy_token', showyToken);
    }

    function start() {
        lockCredentials();

        Lampa.Utils.putScript([pluginUrl], function() {
            lockCredentials();
        }, false, function() {}, true);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') start();
        });
    }
})();
