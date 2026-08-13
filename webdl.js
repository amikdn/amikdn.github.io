(function () {
    'use strict';

    var VERSION = '4.0.0';
    var STORAGE_QUALITY = 'tq_webdl_filter';
    var STORAGE_SORT = 'tq_bitrate_sort';

    var applyingNow = false;
    var lastCardKey = '';

    function translate(key, fallback) {
        try {
            var text = Lampa.Lang.translate(key);
            if (text && text !== key) return text;
        } catch (e) {}
        return fallback;
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

    function readItems() {
        var nodes = document.querySelectorAll('.torrent-list .torrent-item');
        if (!nodes.length) nodes = document.querySelectorAll('.torrent-item');
        return Array.prototype.map.call(nodes, function (item) {
            var titleEl = item.querySelector('.torrent-item__title');
            return {
                el: item,
                title: normalizeTitle(titleEl ? titleEl.textContent : ''),
                bitrate: readBitrate(item)
            };
        });
    }

    function apply() {
        var items = readItems();
        if (!items.length) return 0;

        var quality = currentQuality();
        var sort = currentSort();
        var shown = 0;

        items.forEach(function (item) {
            var ok = quality.match(item.title);
            item.el.style.display = ok ? '' : 'none';
            if (ok) shown++;
        });

        if (sort.id !== 'off') {
            var visible = items.filter(function (item) { return item.el.style.display !== 'none'; });
            var sign = sort.id === 'desc' ? -1 : 1;
            visible.sort(function (a, b) { return (a.bitrate - b.bitrate) * sign; });

            var parent = visible.length ? visible[0].el.parentNode : null;
            if (parent) {
                applyingNow = true;
                visible.forEach(function (item) { parent.appendChild(item.el); });
                items.forEach(function (item) {
                    if (item.el.style.display === 'none') parent.appendChild(item.el);
                });
                applyingNow = false;
            }
        }

        return shown;
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
                var onTorrents = !!document.querySelector('.torrent-list');

                if (params && onTorrents && Array.isArray(params.items) && !params.tq_skip) {
                    if (params.title === translate('filter_filtred', 'Фильтр')) {
                        injectItem(params, {
                            title: 'Тип раздачи: ' + currentQuality().title,
                            tq_own: true,
                            noselect: true
                        }, openQualityMenu);
                    }
                    else if (params.title === translate('filter_sorted', 'Сортировка')) {
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
            if (applyingNow) return;
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (document.querySelector('.torrent-item')) apply();
            }, 120);
        }).observe(document.body, { childList: true, subtree: true });
    }

    function watchActivity() {
        Lampa.Listener.follow('activity', function (e) {
            if (e.type !== 'start' && e.type !== 'archive') return;
            var key = window.location.search;
            if (key === lastCardKey) return;
            lastCardKey = key;
            setTimeout(apply, 300);
        });
    }

    function start() {
        if (!window.appready) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') start();
            });
            return;
        }

        hookSelect();
        watchList();
        watchActivity();
        apply();
    }

    start();
})();
