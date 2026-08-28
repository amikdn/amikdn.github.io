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

    function str(value) {
        return typeof value === 'string' ? value : '';
    }

    function isArr(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    function normalizeCard(data, defaultSource) {
        var movie = data && data.movie;

        if (!movie || typeof movie !== 'object') return data;

        if (!str(movie.title).length) {
            movie.title = str(movie.name) || str(movie.original_name) || str(movie.original_title);
        }

        if (!str(movie.original_title).length) {
            movie.original_title = str(movie.original_name) || str(movie.title);
        }

        if (!str(movie.source).length) movie.source = defaultSource;

        if (!isArr(movie.genres)) movie.genres = [];
        if (!isArr(movie.production_companies)) movie.production_companies = [];
        if (!isArr(movie.production_countries)) movie.production_countries = [];

        if (movie.keywords && typeof movie.keywords === 'object') {
            if (!isArr(movie.keywords.results) && !isArr(movie.keywords.keywords)) {
                movie.keywords.results = [];
            }
        }

        return data;
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

    function fixCard() {
        var sources = Lampa.Api && Lampa.Api.sources;
        var tmdb = sources && sources.tmdb;

        if (!tmdb || typeof tmdb.full !== 'function') return;
        if (tmdb.__anti_dmca_card) return;

        var origFull = tmdb.full;

        tmdb.full = function (params, oncomplite, onerror) {
            origFull.call(this, params, function (data) {
                oncomplite(normalizeCard(data, 'tmdb'));
            }, onerror);
        };

        tmdb.__anti_dmca_card = true;
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
                oncomplite(normalizeCard(data, 'cub'));
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

    function nodeFrom(item) {
        if (!item || typeof item.render !== 'function') return null;

        var node = item.render(true);

        if (node && node.nodeType === 1) return node;
        if (node && node[0] && node[0].nodeType === 1) return node[0];

        return null;
    }

    function isSplit(node) {
        return str(node.className).indexOf('full-start-new__split') >= 0;
    }

    function elements(box) {
        var kids = box.childNodes || [];
        var out = [];

        for (var i = 0; i < kids.length; i++) {
            if (kids[i] && kids[i].nodeType === 1) out.push(kids[i]);
        }

        return out;
    }

    function cleanDetails(node) {
        if (!node || typeof node.querySelector !== 'function') return;

        var box = node.querySelector('.full-start-new__details');

        if (!box || typeof box.removeChild !== 'function') return;

        var kids = elements(box);
        var i;

        for (i = 0; i < kids.length; i++) {
            if (!isSplit(kids[i]) && !str(kids[i].textContent).replace(/\s+/g, '').length) box.removeChild(kids[i]);
        }

        kids = elements(box);

        for (i = kids.length - 1; i >= 0; i--) {
            if (!isSplit(kids[i])) continue;
            if (i === 0 || i === kids.length - 1 || isSplit(kids[i - 1])) box.removeChild(kids[i]);
        }
    }

    function fixDetails() {
        if (glob.__anti_dmca_details) return;
        if (typeof Lampa === 'undefined' || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

        Lampa.Listener.follow('full', function (event) {
            if (!event || event.type !== 'build' || event.name !== 'start') return;

            try {
                cleanDetails(nodeFrom(event.item));
            } catch (e) {}
        });

        glob.__anti_dmca_details = true;
    }

    function start() {
        if (glob.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !glob.lampa_settings) return;

        glob.anti_dmca_plugin = true;

        killBlockList();
        fixCountries();
        fixCard();
        redirectBlockedCards();
        fixDetails();
    }

    if (glob.appready) start();
    else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
