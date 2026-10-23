(function () {
    'use strict';

    if (window.__cuboff_fixed_loaded__) return;
    window.__cuboff_fixed_loaded__ = true;

    var VERSION = '2.0.0';
    var AD_API = /\/api\/ad\/get\//i;
    var EMPTY_ADS = '{"ad":[]}';
    var EMPTY_ADS_URL = 'data:application/json,' + encodeURIComponent(EMPTY_ADS);
    var playerTries = 0;
    var appReadyDone = false;

    function has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function cleanAdFields(data) {
        if (!data || typeof data !== 'object') return data;

        delete data.vast_url;
        delete data.vast_msg;
        delete data.vast_banner;
        delete data.vast;

        for (var key in data) {
            if (!has(data, key)) continue;

            if (key.indexOf('vast_') === 0) {
                delete data[key];
            }
        }

        return data;
    }

    function installNetworkBlocker() {
        if (!window.__cuboff_xhr_patched__) {
            window.__cuboff_xhr_patched__ = true;

            var nativeOpen = XMLHttpRequest.prototype.open;

            XMLHttpRequest.prototype.open = function (method, url) {
                var address = String(url || '');

                if (AD_API.test(address)) {
                    arguments[1] = EMPTY_ADS_URL;
                }

                return nativeOpen.apply(this, arguments);
            };
        }

        if (window.jQuery && jQuery.ajaxTransport && !window.__cuboff_jquery_patched__) {
            window.__cuboff_jquery_patched__ = true;

            jQuery.ajaxTransport('+json', function (options) {
                var url = String((options && options.url) || '');

                if (!AD_API.test(url)) return;

                return {
                    send: function (headers, complete) {
                        complete(200, 'OK', { json: { ad: [] } });
                    },
                    abort: function () {}
                };
            });
        }

        if (window.fetch && !window.__cuboff_fetch_patched__) {
            window.__cuboff_fetch_patched__ = true;

            var nativeFetch = window.fetch;

            window.fetch = function (input, init) {
                var url = typeof input === 'string' ? input : (input && input.url) || '';

                if (AD_API.test(String(url))) {
                    if (window.Response) {
                        return Promise.resolve(new Response(EMPTY_ADS, {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    }

                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        text: function () { return Promise.resolve(EMPTY_ADS); },
                        json: function () { return Promise.resolve({ ad: [] }); },
                        clone: function () { return this; }
                    });
                }

                return nativeFetch.apply(this, arguments);
            };
        }
    }

    function installPlayerListenerPatch(player) {
        if (!player.listener || player.listener.__cuboff_send_patched__) return;

        var listener = player.listener;
        var originalSend = listener.send;
        var restore = null;

        listener.send = function (type, event) {
            if (restore && (type === 'create' || type === 'start' || type === 'external' || type === 'destroy')) {
                restore();
                restore = null;
            }

            var result = originalSend.apply(this, arguments);

            if (type === 'create' && event && event.data) {
                var data = event.data;
                var hadIptv = has(data, 'iptv');
                var iptv = data.iptv;

                restore = function () {
                    if (hadIptv) {
                        data.iptv = iptv;
                    } else if (data.iptv === true) {
                        delete data.iptv;
                    }
                };

                data.iptv = true;

                cleanAdFields(data);
            }

            return result;
        };

        listener.__cuboff_send_patched__ = true;
    }

    function patchPlayer() {
        if (!window.Lampa || !Lampa.Player) {
            playerTries++;

            if (playerTries < 240) {
                setTimeout(patchPlayer, 500);
            }

            return;
        }

        var player = Lampa.Player;

        if (!player.__cuboff_play_patched__ && typeof player.play === 'function') {
            var nativePlay = player.play;

            player.play = function (data) {
                cleanAdFields(data);
                return nativePlay.apply(this, arguments);
            };

            player.__cuboff_play_patched__ = true;
        }

        if (!player.__cuboff_iptv_patched__ && typeof player.iptv === 'function') {
            var nativeIptv = player.iptv;

            player.iptv = function (data) {
                cleanAdFields(data);
                return nativeIptv.apply(this, arguments);
            };

            player.__cuboff_iptv_patched__ = true;
        }

        if (!player.__cuboff_playdata_patched__ && typeof player.playdata === 'function') {
            var nativePlaydata = player.playdata;

            player.playdata = function () {
                var data = nativePlaydata.apply(this, arguments);

                if (!data || typeof data !== 'object') return data;
                if (!data.__cuboff_pd_active) {
                    data.__cuboff_pd_active = true;
                    data.__cuboff_pd_had = has(data, 'iptv');
                    data.__cuboff_pd_original = data.iptv;
                    data.iptv = true;
                    cleanAdFields(data);

                    setTimeout(function () {
                        if (data.__cuboff_pd_had) {
                            data.iptv = data.__cuboff_pd_original;
                        } else if (data.iptv === true) {
                            delete data.iptv;
                        }

                        delete data.__cuboff_pd_active;
                        delete data.__cuboff_pd_had;
                        delete data.__cuboff_pd_original;
                    }, 0);
                } else {
                    data.iptv = true;
                    cleanAdFields(data);
                }

                return data;
            };

            player.__cuboff_playdata_patched__ = true;
        }

        installPlayerListenerPatch(player);
    }

    function initializeUi() {
        if (document.getElementById('cuboff-fixed-style')) return;

        var style = document.createElement('style');

        style.id = 'cuboff-fixed-style';
        style.type = 'text/css';
        style.innerHTML = [
            '.button--subscribe,',
            '[class*="subscribe"]:not([class*="sync"]),',
            '[class*="premium"]:not(.premium-quality):not([class*="sync"]),',
            '.open--premium,',
            '.open--feed,',
            '.open--notice,',
            '.icon--blink,',
            '[class*="black-friday"],',
            '[class*="christmas"],',
            '.ad-server,',
            '.ad-bot,',
            '.full-start__button.button--options,',
            '.new-year__button,',
            '.notice--icon',
            '{display:none!important}'
        ].join('');

        (document.head || document.body).appendChild(style);

        setTimeout(function () {
            try {
                $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
            } catch (e) {}
        }, 1000);
    }

    function removeAdsOnToggle() {
        if (!window.Lampa || !Lampa.Controller || !Lampa.Controller.listener) return;

        try {
            Lampa.Controller.listener.follow('toggle', function (event) {
                if (event.name !== 'select') return;

                setTimeout(function () {
                    try {
                        if (Lampa.Activity.active().component === 'full') {
                            $('.ad-server, .ad-bot').remove();
                        }
                    } catch (e) {}
                }, 150);
            });
        } catch (e) {}
    }

    function initializeApp() {
        if (appReadyDone) return;
        appReadyDone = true;

        initializeUi();
        removeAdsOnToggle();

        try {
            $('[data-action="feed"], [data-action="subscribes"], [data-action="myperson"]').remove();
        } catch (e) {}
    }

    function waitForApp() {
        if (window.appready) {
            initializeApp();
            return;
        }

        if (window.Lampa && Lampa.Listener) {
            try {
                Lampa.Listener.follow('app', function (event) {
                    if (event.type === 'ready') initializeApp();
                });
            } catch (e) {}

            setTimeout(function () {
                if (window.appready) initializeApp();
            }, 1500);

            return;
        }

        setTimeout(waitForApp, 500);
    }

    try {
        if (window.Lampa && Lampa.Platform && Lampa.Platform.tv) {
            Lampa.Platform.tv();
        }
    } catch (e) {}

    installNetworkBlocker();
    patchPlayer();
    waitForApp();

    window.cuboff = {
        version: VERSION,
        cleanAdFields: cleanAdFields
    };
})();
