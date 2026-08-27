(function () {
    'use strict';

    var glob = typeof window !== 'undefined' ? window : this;

    if (typeof Object.values !== 'function') {
        Object.values = function (obj) {
            var out = [];
            if (obj == null) return out;
            var target = typeof obj === 'object' || typeof obj === 'function' ? obj : Object(obj);
            for (var key in target) {
                if (Object.prototype.hasOwnProperty.call(target, key)) out.push(target[key]);
            }
            return out;
        };
    }

    if (glob.lampa_settings) {
        glob.lampa_settings.disable_features = glob.lampa_settings.disable_features || {};
        glob.lampa_settings.disable_features.dmca = true;
    }

    function killBlockList() {
        try {
            Object.defineProperty(glob.lampa_settings, 'dcma', {
                get: function () { return []; },
                set: function () {},
                configurable: true
            });
        } catch (e) {
            glob.lampa_settings.dcma = [];
        }

        if (Lampa.Utils) Lampa.Utils.dcma = function () { return undefined; };
    }

    function redirectBlockedCards() {
        var sources = Lampa.Api && Lampa.Api.sources;
        var cub = sources && sources.cub;
        var tmdb = sources && sources.tmdb;

        if (!cub || !tmdb || typeof cub.full !== 'function' || typeof tmdb.full !== 'function') return;
        if (cub.__anti_dmca) return;

        var origFull = cub.full;

        cub.full = function (params, oncomplite, onerror) {
            var self = this;
            var switched = false;

            function useTmdb() {
                if (switched) return;
                switched = true;
                tmdb.full(params, oncomplite, onerror);
            }

            origFull.call(self, params, function (data) {
                if (data && data.movie && data.movie.blocked) return useTmdb();
                oncomplite(data);
            }, useTmdb);
        };

        cub.__anti_dmca = true;
    }

    function fixCountries() {
        var sources = Lampa.Api && Lampa.Api.sources;
        var tmdb = sources && sources.tmdb;

        if (!tmdb || typeof tmdb.parseCountries !== 'function') return;
        if (tmdb.__anti_dmca_countries) return;

        var orig = tmdb.parseCountries;

        tmdb.parseCountries = function (movie) {
            var res;

            try {
                res = orig.call(this, movie || {});
            } catch (e) {
                return [];
            }

            if (res && typeof res.join === 'function') return res;
            if (typeof res === 'string') return res ? [res] : [];
            if (res === null || res === undefined) return [];

            return [res];
        };

        tmdb.__anti_dmca_countries = true;
    }

    function start() {
        if (glob.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !glob.lampa_settings) return;

        glob.anti_dmca_plugin = true;

        killBlockList();
        fixCountries();
        redirectBlockedCards();
    }

    if (glob.appready) start();
    else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
