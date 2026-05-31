(function() {
    'use strict';

    var TARGET_UID = 'a1qv1tmn';
    var STORAGE_KEY = 'lampac_unic_id';

    function hasUid(url) {
        return /[?&]uid=/.test(String(url || ''));
    }

    function appendGuestUid(url) {
        url = String(url || '');

        if (!url || hasUid(url)) return url;
        if (!/^https?:\/\//i.test(url) && url.charAt(0) !== '/') return url;
        if (!window.Lampa || !Lampa.Utils || typeof Lampa.Utils.addUrlComponent !== 'function') return url;

        return Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(TARGET_UID));
    }

    function patchUtils() {
        if (!window.Lampa || !Lampa.Utils || typeof Lampa.Utils.addUrlComponent !== 'function') return false;
        if (Lampa.Utils.__uidGuestPatched) return true;

        var originalAddUrlComponent = Lampa.Utils.addUrlComponent;

        Lampa.Utils.addUrlComponent = function(url, component) {
            var nextUrl = originalAddUrlComponent.apply(this, arguments);

            if (typeof component === 'string' && component.indexOf('uid=') === 0) {
                return nextUrl.replace(/([?&])uid=[^&]*/i, '$1uid=' + encodeURIComponent(TARGET_UID));
            }

            return nextUrl;
        };

        Lampa.Utils.__uidGuestPatched = true;
        return true;
    }

    function patchStorage() {
        if (!window.Lampa || !Lampa.Storage || typeof Lampa.Storage.get !== 'function' || typeof Lampa.Storage.set !== 'function') return false;
        if (Lampa.Storage.__uidGuestPatched) {
            Lampa.Storage.set(STORAGE_KEY, TARGET_UID);
            return true;
        }

        var originalGet = Lampa.Storage.get;
        var originalSet = Lampa.Storage.set;

        Lampa.Storage.get = function(name) {
            if (name === STORAGE_KEY) return TARGET_UID;
            return originalGet.apply(this, arguments);
        };

        Lampa.Storage.set = function(name, value) {
            if (name === STORAGE_KEY) {
                arguments[1] = TARGET_UID;
            }
            return originalSet.apply(this, arguments);
        };

        Lampa.Storage.set(STORAGE_KEY, TARGET_UID);
        Lampa.Storage.__uidGuestPatched = true;
        return true;
    }

    function patchRequest() {
        if (!window.Lampa || !Lampa.Reguest || !Lampa.Reguest.prototype || typeof Lampa.Reguest.prototype.silent !== 'function') return false;
        if (Lampa.Reguest.prototype.__uidGuestPatched) return true;

        var originalSilent = Lampa.Reguest.prototype.silent;

        Lampa.Reguest.prototype.silent = function(url) {
            arguments[0] = appendGuestUid(url);
            return originalSilent.apply(this, arguments);
        };

        Lampa.Reguest.prototype.__uidGuestPatched = true;
        return true;
    }

    function patchNetwork() {
        if (!window.network || typeof window.network.native !== 'function') return false;
        if (window.network.__uidGuestPatched) return true;

        var originalNative = window.network.native;

        window.network.native = function(url, onSuccess, onError, params) {
            return originalNative.call(this, appendGuestUid(url), onSuccess, onError, params);
        };

        window.network.__uidGuestPatched = true;
        return true;
    }

    function applyPatches() {
        var ready = false;

        if (patchUtils()) ready = true;
        if (patchStorage()) ready = true;
        if (patchRequest()) ready = true;
        if (patchNetwork()) ready = true;

        return ready;
    }

    function init() {
        if (!window.Lampa) return;

        if (!applyPatches()) {
            setTimeout(init, 500);
        }
    }

    if (window.appready) init();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') init();
        });
    }
})();
