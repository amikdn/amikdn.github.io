(function () {
    'use strict';

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'logo_glav', type: 'select', values: { 1: 'Скрыть', 0: 'Отображать' }, default: '0' },
        field: { name: 'Логотипы вместо названий', description: 'Отображает логотипы фильмов вместо текста' }
    });

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'logo_size', type: 'select', values: { w300: 'w300', w500: 'w500', w780: 'w780', original: 'Оригинал' }, default: 'w500' },
        field: { name: 'Размер логотипа', description: 'Разрешение загружаемого изображения' }
    });

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'logo_hide_year', type: 'trigger', default: true },
        field: { name: 'Скрывать год и страну над логотипом', description: 'Переносит год выпуска и страну под логотип' }
    });

    if (window.logoplugin) return;
    window.logoplugin = true;

    var CACHE_NAME = 'logo_plugin_paths';
    var CACHE_MAX = 600;
    var CACHE_LIFE = 1000 * 60 * 60 * 24 * 30;
    var WAIT_LIMIT = 2500;

    var network = new Lampa.Reguest();
    var store = Lampa.Storage.cache(CACHE_NAME, CACHE_MAX, {});
    var pending = {};
    var warmed = {};
    var misses = {};

    var style = document.createElement('style');
    style.innerHTML = '.logo--wait{visibility:hidden}.logo--img{margin-top:5px;max-height:125px}';
    document.head.appendChild(style);

    function enabled() {
        return Lampa.Storage.get('logo_glav') + '' !== '1';
    }

    function lang() {
        return Lampa.Storage.get('language') || 'ru';
    }

    function key(id, type) {
        return type + '_' + id + '_' + lang();
    }

    function cached(id, type) {
        var slot = store[key(id, type)];
        if (!slot || !slot.p) return null;

        if (Date.now() - (slot.t || 0) > CACHE_LIFE) {
            delete store[key(id, type)];
            return null;
        }

        return slot;
    }

    function remember(id, type, path) {
        if (!path) return;

        store[key(id, type)] = { p: path, t: Date.now() };
        Lampa.Storage.set(CACHE_NAME, store);
    }

    function pick(response) {
        var logos = response && response.logos;
        if (!logos || !logos.length) return '';

        var want = lang();
        var i;

        for (i = 0; i < logos.length; i++) {
            if (logos[i].iso_639_1 === want && logos[i].file_path) return logos[i].file_path;
        }
        for (i = 0; i < logos.length; i++) {
            if (logos[i].iso_639_1 === 'en' && logos[i].file_path) return logos[i].file_path;
        }
        for (i = 0; i < logos.length; i++) {
            if (logos[i].file_path) return logos[i].file_path;
        }

        return '';
    }

    function imageUrl(path) {
        var size = Lampa.Storage.get('logo_size', 'w500');
        return Lampa.TMDB.image('/t/p/' + (size === 'original' ? 'original' : size) + path.replace('.svg', '.png'));
    }

    function preload(path, done) {
        var url = imageUrl(path);

        if (warmed[url]) {
            done(url);
            return;
        }

        var img = new Image();
        var fired = false;

        function finish() {
            if (fired) return;
            fired = true;
            warmed[url] = true;
            done(url);
        }

        img.onload = finish;
        img.onerror = finish;
        img.src = url;

        if (img.complete) finish();
        else setTimeout(finish, WAIT_LIMIT);
    }

    function load(id, type, done) {
        var slot = cached(id, type);

        if (slot) {
            done(slot.p, true);
            return;
        }

        var k = key(id, type);

        if (misses[k]) {
            done('', true);
            return;
        }

        if (pending[k]) {
            pending[k].push(done);
            return;
        }

        pending[k] = [done];

        function resolve(path) {
            remember(id, type, path);

            if (path) preload(path, function () {});
            else misses[k] = true;

            var waiting = pending[k] || [];
            delete pending[k];

            for (var i = 0; i < waiting.length; i++) waiting[i](path, false);
        }

        var url = Lampa.TMDB.api(type + '/' + id + '/images?api_key=' + Lampa.TMDB.key() + '&include_image_language=' + lang() + ',en,null');

        network.silent(url, function (response) {
            resolve(pick(response));
        }, function () {
            resolve('');
        }, false, { timeout: 1000 * 8 });
    }

    function moveHead(render) {
        if (!Lampa.Storage.get('logo_hide_year', true)) return;

        var head = render.find('.full-start-new__head');
        var details = render.find('.full-start-new__details');

        if (!head.length || !details.length) return;
        if (details.find('.logo-moved-head').length) return;

        var html = head.html() ? head.html().trim() : '';
        if (!html) return;

        var separator = details.children().length ? '<span class="full-start-new__split logo-moved-separator">●</span>' : '';

        details.append(separator + '<span class="logo-moved-head" style="margin-left:0.6em;">' + html + '</span>');
        head.remove();
    }

    function apply(render, title, url) {
        title.html('<img class="logo--img" src="' + url + '"/>');
        title.removeClass('logo--wait');
        render.find('.full-start-new__tagline').remove();
        moveHead(render);
    }

    function ready(id, type) {
        var slot = cached(id, type);
        if (!slot) return '';

        var url = imageUrl(slot.p);
        return warmed[url] ? url : '';
    }

    function resolveLogo(id, type, done) {
        var slot = cached(id, type);

        if (slot) {
            preload(slot.p, done);
            return;
        }

        load(id, type, function (path) {
            if (!path) {
                done('');
                return;
            }

            preload(path, done);
        });
    }

    function cardType(movie, object) {
        if (movie) return movie.name || movie.original_name || movie.first_air_date || movie.number_of_seasons ? 'tv' : 'movie';
        if (object && object.method) return object.method === 'tv' ? 'tv' : 'movie';
        if (object && object.card && object.card.original_name) return 'tv';
        return 'movie';
    }

    Lampa.Listener.follow('activity', function (event) {
        if (!enabled()) return;
        if (!event || event.component !== 'full') return;
        if (event.type !== 'init') return;

        var object = event.object;
        if (!object || !object.id) return;

        resolveLogo(object.id, cardType(object.card, object), function () {});
    });

    Lampa.Listener.follow('full', function (event) {
        if (!enabled()) return;

        var movie = event.data && event.data.movie;
        if (!movie || !movie.id) return;

        var type = cardType(movie, event.object);

        if (event.type === 'start') {
            resolveLogo(movie.id, type, function () {});
            return;
        }

        if (event.type !== 'build' || event.name !== 'start') return;

        var render = event.item && event.item.html ? event.item.html : event.body;
        if (!render || !render.find) return;

        var title = render.find('.full-start-new__title');
        if (!title.length) return;

        var instant = ready(movie.id, type);

        if (instant) {
            apply(render, title, instant);
            return;
        }

        title.addClass('logo--wait');

        var settled = false;

        function release() {
            if (settled) return;
            settled = true;
            title.removeClass('logo--wait');
        }

        setTimeout(release, WAIT_LIMIT);

        resolveLogo(movie.id, type, function (url) {
            if (!url) {
                release();
                return;
            }

            settled = true;
            apply(render, title, url);
        });
    });

    Lampa.Storage.listener.follow('change', function (event) {
        if (['logo_glav', 'logo_size', 'logo_hide_year'].indexOf(event.param) === -1) return;

        var activity = Lampa.Activity.active();

        if (activity && activity.component === 'full') {
            setTimeout(function () {
                activity.reload();
            }, 300);
        }
    });
})();
