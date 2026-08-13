(function () {
    'use strict';

    var VERSION = '4.2.0';
    var STORAGE_QUALITY = 'tq_webdl_filter';
    var STORAGE_SORT = 'tq_bitrate_sort';

    var lastSignature = '';
    var lastCardKey = '';

    function translate(key, fallback) {
        try {
            var text = Lampa.Lang.translate(key);
            if (text && text !== key) return text;
        } catch (e) {}
        return fallback;
    }

    function titleIs(title, key, variants) {
        if (!title) return false;
        if (title === translate(key, '')) return true;
        for (var i = 0; i < variants.length; i++) {
            if (title === variants[i]) return true;
        }
        return false;
    }

    var QUALITIES = [
        {
            id: 'any',
            title: 'Любой',
            match: function () { return true; }
        },
        {
            id: 'bdremux',
            title: 'BDRemux',
            match: function (t) {
                if (t.indexOf('webdlremux') !== -1) return false;
                return t.indexOf('bdremux') !== -1 ||
                    t.indexOf('blurayremux') !== -1 ||
                    t.indexOf('remux') !== -1;
            }
        },
        {
            id: 'bluray',
            title: 'BDRip / BluRay',
            match: function (t) {
                if (t.indexOf('remux') !== -1) return false;
                return t.indexOf('bdrip') !== -1 ||
                    t.indexOf('bluray') !== -1 ||
                    t.indexOf('brrip') !== -1;
            }
        },
        {
            id: 'web-dl',
            title: 'WEB-DL',
            match: function (t) {
                return (t.indexOf('webdl') !== -1 || t.indexOf('web') === 0) &&
                    t.indexOf('webdlrip') === -1;
            }
        },
        {
            id: 'web-dlrip',
            title: 'WEB-DLRip',
            match: function (t) { return t.indexOf('webdlrip') !== -1; }
        },
        {
            id: 'hdtv',
            title: 'HDTV',
            match: function (t) { return t.indexOf('hdtv') !== -1; }
        },
        {
            id: 'openmatte',
            title: 'Open Matte',
            match: function (t) { return t.indexOf('openmatte') !== -1; }
        }
    ];

    var SORTS = [
        { id: 'off', title: 'Как в списке' },
        { id: 'desc', title: 'Битрейт: сначала высокий' },
        { id: 'asc', title: 'Битрейт: сначала низкий' }
    ];

    function currentQuality() {
        var saved = Lampa.Storage.get(STORAGE_QUALITY, 'any');
        return QUALITIES.filter(function (q) { return q.id === saved; })[0] || QUALITIES[0];
    }

    function currentSort() {
        var saved = Lampa.Storage.get(STORAGE_SORT, 'off');
        return SORTS.filter(function (s) { return s.id === saved; })[0] || SORTS[0];
    }

    function normalizeTitle(text) {
        return (text || '').toLowerCase().replace(/[-_.\s]/g, '');
    }

    function readBitrate(item) {
        var node = item.querySelector('.torrent-item__bitrate span');
        if (node) {
            var value = parseFloat((node.textContent || '').replace(',', '.'));
            if (!isNaN(value) && value > 0) return value;
        }
        return sizeToNumber(item);
    }

    function sizeToNumber(item) {
        var node = item.querySelector('.torrent-item__size');
        if (!node) return 0;
        var text = (node.textContent || '').toLowerCase().replace(',', '.');
        var value = parseFloat(text);
        if (isNaN(value)) return 0;
        if (text.indexOf('tb') !== -1 || text.indexOf('тб') !== -1) return value * 1024;
        if (text.indexOf('mb') !== -1 || text.indexOf('мб') !== -1) return value / 1024;
        if (text.indexOf('kb') !== -1 || text.indexOf('кб') !== -1) return value / 1024 / 1024;
        return value;
    }

    function onTorrents() {
        var component = '';

        try {
            var current = Lampa.Activity.active();
            if (current && current.component) component = String(current.component);
        } catch (e) {}

        if (component === 'online') return false;
        if (component.indexOf('torrent') !== -1) return true;

        return !!document.querySelector('.torrent-list .torrent-item__tracker');
    }

    function listContainer() {
        if (!onTorrents()) return null;
        return document.querySelector('.torrent-list');
    }

    function readItems() {
        var root = listContainer();
        if (!root) return [];
        var nodes = root.querySelectorAll('.torrent-item');
        return Array.prototype.map.call(nodes, function (item) {
            var titleEl = item.querySelector('.torrent-item__title');
            return {
                el: item,
                title: normalizeTitle(titleEl ? titleEl.textContent : ''),
                bitrate: readBitrate(item)
            };
        });
    }

    function signature(items) {
        return items.length + ':' + items.map(function (i) { return i.title.slice(0, 12); }).join('|');
    }

    function apply() {
        var items = readItems();
        if (!items.length) return 0;

        var quality = currentQuality();
        var sort = currentSort();
        var container = items[0].el.parentNode;
        var shown = 0;

        items.forEach(function (item) {
            var ok = quality.match(item.title);
            item.el.style.display = ok ? '' : 'none';
            if (ok) shown++;
        });

        if (sort.id === 'off' || !container) return shown;

        var sign = sort.id === 'desc' ? -1 : 1;
        var ordered = items.slice().sort(function (a, b) {
            var hiddenA = a.el.style.display === 'none' ? 1 : 0;
            var hiddenB = b.el.style.display === 'none' ? 1 : 0;
            if (hiddenA !== hiddenB) return hiddenA - hiddenB;
            return (a.bitrate - b.bitrate) * sign;
        });

        var same = ordered.every(function (item, index) { return items[index].el === item.el; });
        if (same) return shown;

        var fragment = document.createDocumentFragment();
        ordered.forEach(function (item) { fragment.appendChild(item.el); });
        container.appendChild(fragment);

        refreshLayers(container);
        resetNavigation(container);

        return shown;
    }

    function activityRender() {
        try {
            var current = Lampa.Activity.active();
            if (current && current.activity && current.activity.render) {
                return current.activity.render();
            }
        } catch (e) {}
        return null;
    }

    function refreshLayers(container) {
        var nodes = container.querySelectorAll('.torrent-item');

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.style.visibility === 'hidden') {
                node.style.visibility = '';
                node.visibility = '';
                node.visible = false;
            }
        }

        try {
            if (Lampa.Layer && Lampa.Layer.visible) Lampa.Layer.visible(container);
        } catch (e) {}
    }

    function resetNavigation(container) {
        var nodes = container.querySelectorAll('.torrent-item');
        var first = null;

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].style.display !== 'none') {
                first = nodes[i];
                break;
            }
        }
        if (!first) return;

        var render = activityRender();

        setTimeout(function () {
            try {
                if (render) Lampa.Controller.collectionSet(render);
                Lampa.Controller.collectionFocus(first, render || container);
                refreshLayers(container);
            } catch (e) {}
        }, 0);
    }

    function applyAndReport() {
        var shown = apply();
        var quality = currentQuality();
        if (quality.id !== 'any' && shown === 0) {
            Lampa.Noty.show('«' + quality.title + '»: подходящих раздач нет');
        }
        return shown;
    }

    function backToFilterButton(selector) {
        var button = document.querySelector(selector);
        if (button) $(button).trigger('hover:enter');
    }

    function openQualityMenu() {
        var saved = currentQuality();
        Lampa.Select.show({
            title: 'Тип раздачи',
            items: QUALITIES.map(function (q) {
                return { title: q.title, quality_id: q.id, selected: q.id === saved.id };
            }),
            onBack: function () { backToFilterButton('.filter--filter'); },
            onSelect: function (item) {
                Lampa.Storage.set(STORAGE_QUALITY, item.quality_id);
                lastSignature = '';
                applyAndReport();
                backToFilterButton('.filter--filter');
            }
        });
    }

    function openSortMenu() {
        var saved = currentSort();
        Lampa.Select.show({
            title: 'Битрейт',
            items: SORTS.map(function (s) {
                return { title: s.title, sort_id: s.id, selected: s.id === saved.id };
            }),
            onBack: function () { backToFilterButton('.filter--sort'); },
            onSelect: function (item) {
                Lampa.Storage.set(STORAGE_SORT, item.sort_id);
                lastSignature = '';
                apply();
                backToFilterButton('.filter--sort');
            }
        });
    }

    function injectItem(params, item, open) {
        params.items = [item].concat(params.items || []);

        var original = params.onSelect;
        params.onSelect = function (selected) {
            if (selected && selected.tq_own) {
                open();
                return;
            }
            if (typeof original === 'function') return original.apply(this, arguments);
        };
    }

    function hookSelect() {
        if (!Lampa.Select || Lampa.Select.__tq_hooked) return;

        var origShow = Lampa.Select.show;

        Lampa.Select.show = function (params) {
            try {
                if (params && onTorrents() && Array.isArray(params.items) && !params.tq_skip) {
                    if (titleIs(params.title, 'filter_filtred', ['Фильтр', 'Filter', 'Фільтр'])) {
                        injectItem(params, {
                            title: 'Тип раздачи: ' + currentQuality().title,
                            tq_own: true,
                            noselect: true
                        }, openQualityMenu);
                    }
                    else if (titleIs(params.title, 'filter_sorted', ['Сортировка', 'Сортировать', 'Sorted', 'Sort', 'Сортування'])) {
                        injectItem(params, {
                            title: 'Битрейт: ' + currentSort().title,
                            tq_own: true,
                            noselect: true
                        }, openSortMenu);
                    }
                }
            } catch (e) {}

            return origShow.apply(this, arguments);
        };

        Lampa.Select.__tq_hooked = true;
    }

    function watchList() {
        var timer = null;

        new MutationObserver(function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                var items = readItems();
                if (!items.length) return;
                var sign = signature(items);
                if (sign === lastSignature) return;
                lastSignature = sign;
                apply();
            }, 150);
        }).observe(document.body, { childList: true, subtree: true });
    }

    function watchActivity() {
        Lampa.Listener.follow('activity', function (e) {
            if (e.type !== 'start' && e.type !== 'archive') return;
            var key = window.location.search;
            if (key === lastCardKey) return;
            lastCardKey = key;
            lastSignature = '';
        });
    }

    function start() {
        if (!window.appready) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') start();
            });
            return;
        }

        try { console.log('torrent quality plugin ' + VERSION + ' ready'); } catch (e) {}

        hookSelect();
        watchList();
        watchActivity();

        var items = readItems();
        if (items.length) {
            lastSignature = signature(items);
            apply();
        }
    }

    start();
})();
