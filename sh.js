(function() {
    'use strict';

    if (window.__s1) return;
    window.__s1 = true;

    function decodeHidden(input) {
        try {
            return decodeURIComponent(escape(atob(input)));
        } catch (e) {
            return atob(input);
        }
    }

    var k0 = decodeHidden('bGFtcGFjX3VuaWNfaWQ=');
    var k1 = decodeHidden('c2hvd3lfdG9rZW4=');
    var v0 = decodeHidden('aHR0cDovL3Nob3d5cHJvLmNvbS9vbmxpbmUuanM=');
    var v1 = decodeHidden('aThucWI5dnc=');
    var v2 = decodeHidden('ZjgzNzcwNTctOTBlYi00ZDc2LTkzYzktNzYwNTk1MmEwOTZs');

    function applyValues() {
        if (!Lampa.Storage.__s0) {
            Lampa.Storage.__s0 = Lampa.Storage.set;
            Lampa.Storage.set = function(name, value) {
                if (name === k0) value = v1;
                if (name === k1) value = v2;
                return Lampa.Storage.__s0.call(Lampa.Storage, name, value);
            };
        }

        Lampa.Storage.set(k0, v1);
        Lampa.Storage.set(k1, v2);
    }

    function start() {
        applyValues();

        Lampa.Utils.putScript([v0], function() {
            applyValues();
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
