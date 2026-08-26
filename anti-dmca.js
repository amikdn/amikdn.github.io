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

    if (typeof glob.Map !== 'function') {
        var MapShim = function (entries) {
            this._keys = [];
            this._values = [];
            this._index = {};
            this.size = 0;

            if (entries && entries.length) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i]) this.set(entries[i][0], entries[i][1]);
                }
            }
        };

        MapShim.prototype._token = function (key) {
            var t = typeof key;
            if (t === 'string') return 's' + key;
            if (t === 'number') return 'n' + key;
            if (t === 'boolean') return 'b' + key;
            if (key === null) return 'z';
            if (key === undefined) return 'u';
            return null;
        };

        MapShim.prototype._at = function (key) {
            var token = this._token(key);
            if (token !== null) {
                var found = this._index[token];
                return found === undefined ? -1 : found;
            }
            for (var i = 0; i < this._keys.length; i++) {
                if (this._keys[i] === key) return i;
            }
            return -1;
        };

        MapShim.prototype.get = function (key) {
            var at = this._at(key);
            return at === -1 ? undefined : this._values[at];
        };

        MapShim.prototype.has = function (key) {
            return this._at(key) !== -1;
        };

        MapShim.prototype.set = function (key, value) {
            var at = this._at(key);
            if (at === -1) {
                this._keys.push(key);
                this._values.push(value);
                var token = this._token(key);
                if (token !== null) this._index[token] = this._keys.length - 1;
                this.size = this._keys.length;
            } else {
                this._values[at] = value;
            }
            return this;
        };

        MapShim.prototype['delete'] = function (key) {
            var at = this._at(key);
            if (at === -1) return false;
            this._keys.splice(at, 1);
            this._values.splice(at, 1);
            this._index = {};
            for (var i = 0; i < this._keys.length; i++) {
                var token = this._token(this._keys[i]);
                if (token !== null) this._index[token] = i;
            }
            this.size = this._keys.length;
            return true;
        };

        MapShim.prototype.clear = function () {
            this._keys = [];
            this._values = [];
            this._index = {};
            this.size = 0;
        };

        MapShim.prototype.forEach = function (fn, thisArg) {
            for (var i = 0; i < this._keys.length; i++) {
                fn.call(thisArg, this._values[i], this._keys[i], this);
            }
        };

        MapShim.prototype.keys = function () {
            return this._keys.slice();
        };

        MapShim.prototype.values = function () {
            return this._values.slice();
        };

        MapShim.prototype.entries = function () {
            var out = [];
            for (var i = 0; i < this._keys.length; i++) out.push([this._keys[i], this._values[i]]);
            return out;
        };

        glob.Map = MapShim;
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

    function start() {
        if (glob.anti_dmca_plugin) return;
        if (typeof Lampa === 'undefined' || !glob.lampa_settings) return;

        glob.anti_dmca_plugin = true;

        killBlockList();
        redirectBlockedCards();
    }

    if (glob.appready) start();
    else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }
})();
