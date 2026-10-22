
(function () {
    'use strict';

    if (window.apkstore_plugin_ready) return;
    window.apkstore_plugin_ready = true;

    var CONFIG = {
        base: window.APKSTORE_BASE || 'https://file.maxvol.pro/',
        menu_title: window.APKSTORE_TITLE || 'Приложения',
        component: 'apkstore',
        only_android: true
    };

    var STYLE_ID = 'apkstore-style';

    var ICONS = {
        menu: '<svg class="apkstore-menu-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5v-7Z"/>' +
            '<path d="m5 8.5 7 3.5 7-3.5M12 12v7"/>' +
            '<path d="m8.5 5.8 7 3.5"/>' +
            '</svg>',
        apk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 3v10"/>' +
            '<path d="m8 9 4 4 4-4"/>' +
            '<path d="M4 15v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3"/>' +
            '</svg>',
        folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-10Z"/>' +
            '</svg>',
        chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="m9 5 7 7-7 7"/>' +
            '</svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M20 12a8 8 0 1 1-2.34-5.66"/>' +
            '<path d="M20 4v4h-4"/>' +
            '</svg>'
    };

    var CSS = [
        '.apkstore{padding:0 1.5em 2em;max-width:1100px;margin:0 auto;}',
        '.apkstore__meta{display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.4em .2em 1em;font-size:1.05em;color:rgba(255,255,255,.55);}',
        '.apkstore__path{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.apkstore__count{flex-shrink:0;}',
        '.apkstore__item{display:flex;align-items:center;padding:.9em 1.2em;border-radius:.85em;background:rgba(255,255,255,.055);transition:background .15s,box-shadow .15s,color .15s;}',
        '.apkstore__item + .apkstore__item{margin-top:.35em;}',
        '.apkstore__item.focus,.apkstore__item.hover,.apkstore__item.traverse{background:rgba(255,255,255,.08);color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.85);}',
        '.apkstore__icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:3.2em;height:3.2em;margin-right:1.1em;border-radius:.9em;background:rgba(110,155,255,.16);color:#7fa7ff;}',
        '.apkstore__icon svg{width:1.9em;height:1.9em;}',
        '.apkstore__item.focus .apkstore__icon,.apkstore__item.hover .apkstore__icon,.apkstore__item.traverse .apkstore__icon{background:rgba(110,155,255,.28);color:#a9c4ff;}',
        '.apkstore__info{flex:1;min-width:0;}',
        '.apkstore__name{font-size:1.3em;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.apkstore__sub{margin-top:.2em;font-size:.98em;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.apkstore__item.focus .apkstore__sub,.apkstore__item.hover .apkstore__sub,.apkstore__item.traverse .apkstore__sub{color:rgba(255,255,255,.72);}',
        '.apkstore__action{display:flex;align-items:center;flex-shrink:0;margin-left:1em;color:rgba(255,255,255,.45);}',
        '.apkstore__action svg{width:1.4em;height:1.4em;}',
        '.apkstore__download{padding:.35em .7em;border:1px solid rgba(255,255,255,.18);border-radius:.6em;font-size:.95em;}',
        '.apkstore__item.focus .apkstore__action,.apkstore__item.hover .apkstore__action,.apkstore__item.traverse .apkstore__action{color:rgba(255,255,255,.8);}',
        '.apkstore__item.focus .apkstore__download,.apkstore__item.hover .apkstore__download,.apkstore__item.traverse .apkstore__download{border-color:rgba(255,255,255,.38);background:rgba(255,255,255,.06);}',
        '.apkstore__hint{padding:1.2em .2em 0;text-align:center;font-size:.95em;color:rgba(255,255,255,.35);}',
        '.apkstore__empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:12em;padding:2em;text-align:center;}',
        '.apkstore__empty-title{font-size:1.3em;font-weight:500;}',
        '.apkstore__empty-text{margin-top:.5em;max-width:42em;color:rgba(255,255,255,.55);line-height:1.45;}',
        '.apkstore__retry{margin-top:1.2em;}',
        '.apkstore-install__head{display:flex;align-items:center;gap:1em;padding:.2em 0 1em;}',
        '.apkstore-install__icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:4em;height:4em;margin-right:1em;border-radius:1em;background:rgba(110,155,255,.16);color:#7fa7ff;}',
        '.apkstore-install__icon svg{width:2.2em;height:2.2em;}',
        '.apkstore-install__name{min-width:0;font-size:1.35em;font-weight:500;overflow-wrap:anywhere;}',
        '.apkstore-install__meta{margin-top:.35em;font-size:1em;color:rgba(255,255,255,.55);}',
        '.apkstore-install__text{margin:1em 0 .8em;line-height:1.5;color:rgba(255,255,255,.8);}',
        '.apkstore-install__url{padding:.7em .9em;border-radius:.6em;background:rgba(255,255,255,.06);font-size:.9em;color:rgba(255,255,255,.5);overflow-wrap:anywhere;}',
        '.apkstore-install__note{margin-top:.9em;font-size:.92em;line-height:1.45;color:rgba(255,255,255,.45);}',
        '.menu__ico .apkstore-menu-ico{width:1.5em;height:1.5em;}',
        '@media(max-width:580px){.apkstore{padding:0 .8em 1.5em;}.apkstore__item{padding:.8em .9em;}.apkstore__icon{width:2.8em;height:2.8em;margin-right:.8em;}.apkstore__name{font-size:1.15em;}.apkstore__download{display:none;}}'
    ].join('');

    function isAndroid() {
        try {
            if (window.Lampa && Lampa.Platform && Lampa.Platform.is('android')) return true;
        } catch (e) {}

        return /android/i.test(navigator.userAgent) || typeof window.AndroidJS !== 'undefined';
    }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(CSS));
        document.head.appendChild(style);
    }

    function cleanText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function normalizeUrl(href, baseUrl) {
        try {
            var base = new URL(baseUrl);
            var url = new URL(href, base);

            if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
            if (url.host !== base.host) return null;

            return url.href;
        } catch (e) {
            return null;
        }
    }

    function naturalCompare(a, b) {
        try {
            return a.localeCompare(b, 'ru', { numeric: true, sensitivity: 'base' });
        } catch (e) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        }
    }

    function parseListing(html, pageUrl) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var rows = doc.querySelectorAll('tbody tr');
        var items = [];
        var seen = {};

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var link = row.querySelector('a[href]');
            if (!link) continue;

            var href = (link.getAttribute('href') || '').trim();
            if (!href || href.charAt(0) === '?' || href.charAt(0) === '#' || href === '..' || href === '../') continue;

            var nameNode = row.querySelector('.name');
            var name = cleanText(nameNode ? nameNode.textContent : link.textContent);
            if (!name) continue;

            var isDir = /\/$/.test(name) || /\/$/.test(href);
            if (!isDir && !/\.apk$/i.test(name) && !/\.apk$/i.test(href)) continue;

            var url = normalizeUrl(href, pageUrl);
            if (!url || seen[url]) continue;
            seen[url] = true;

            var sizeCell = row.querySelector('td[data-order]');
            var sizeText = sizeCell ? cleanText(sizeCell.textContent) : '';
            var bytes = sizeCell ? parseInt(sizeCell.getAttribute('data-order'), 10) : 0;

            if (isNaN(bytes) || bytes < 0) bytes = 0;

            var timeNode = row.querySelector('time');
            var date = timeNode ? (timeNode.getAttribute('datetime') || timeNode.textContent) : '';

            items.push({
                name: name.replace(/\/+$/, ''),
                url: url,
                dir: isDir,
                bytes: bytes,
                size: sizeText,
                date: cleanText(date)
            });
        }

        items.sort(function (a, b) {
            if (a.dir !== b.dir) return a.dir ? -1 : 1;
            return naturalCompare(a.name, b.name);
        });

        return items;
    }

    function displayName(item) {
        var name = item.dir ? item.name : item.name.replace(/\.apk$/i, '');
        name = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        return name || item.name;
    }

    function archLabel(name) {
        var value = name.toLowerCase();

        if (value.indexOf('arm64') >= 0 || value.indexOf('aarch64') >= 0) return 'ARM64';
        if (value.indexOf('armeabi') >= 0 || value.indexOf('arm7') >= 0 || value.indexOf('armv7') >= 0 || value.indexOf('arm-v7') >= 0) return 'ARM32';
        if (value.indexOf('x86_64') >= 0 || value.indexOf('x64') >= 0) return 'x86_64';
        if (value.indexOf('x86') >= 0) return 'x86';
        if (value.indexOf('universal') >= 0) return 'Universal';

        return '';
    }

    function formatSize(item) {
        if (item.dir) return '';

        if (item.bytes > 0) {
            if (item.bytes < 1024 * 1024) return Math.max(1, Math.round(item.bytes / 1024)) + ' КБ';

            var mb = item.bytes / (1024 * 1024);
            if (mb >= 1024) return String(Math.round(mb / 102.4) / 10).replace('.', ',') + ' ГБ';

            return String(Math.round(mb * 10) / 10).replace('.', ',') + ' МБ';
        }

        return item.size || '';
    }

    function formatDate(value) {
        if (!value) return '';

        var match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return match[3] + '.' + match[2] + '.' + match[1];

        var date = new Date(value);
        if (isNaN(date.getTime())) return '';

        return ('0' + date.getDate()).slice(-2) + '.' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '.' +
            date.getFullYear();
    }

    function plural(number, one, few, many) {
        var value = Math.abs(number) % 100;
        var last = value % 10;

        if (value > 10 && value < 20) return many;
        if (last > 1 && last < 5) return few;
        if (last === 1) return one;

        return many;
    }

    function subtitleFor(item) {
        var parts = [];

        if (item.dir) {
            parts.push('Папка');
        } else {
            var arch = archLabel(item.name);
            if (arch) parts.push(arch);
            var size = formatSize(item);
            if (size) parts.push(size);
        }

        var date = formatDate(item.date);
        if (date) parts.push(date);

        return parts.join('  ·  ');
    }

    function pageLabel(url) {
        try {
            var parsed = new URL(url);
            var path = decodeURIComponent(parsed.pathname).replace(/\/+$/, '');

            return parsed.host + path;
        } catch (e) {
            return url;
        }
    }

    function copyText(text) {
        if (!text) return;

        Lampa.Utils.copyTextToClipboard(text, function () {
            Lampa.Noty.show('Ссылка скопирована', { time: 3000 });
        }, function () {
            Lampa.Noty.show('Не удалось скопировать ссылку', { style: 'error', time: 5000 });
        });
    }

    function openDownload(item) {
        var url = item.url;
        var opened = false;

        if (window.AndroidJS && typeof window.AndroidJS.openBrowser === 'function') {
            try {
                window.AndroidJS.openBrowser(url);
                opened = true;
            } catch (e) {}
        }

        if (!opened && Lampa.Android && typeof Lampa.Android.openBrowser === 'function') {
            try {
                Lampa.Android.openBrowser(url);
                opened = true;
            } catch (e) {}
        }

        if (!opened) {
            try {
                var win = window.open(url, '_blank');
                if (win) opened = true;
            } catch (e) {}
        }

        if (!opened) {
            try {
                window.location.href = url;
                opened = true;
            } catch (e) {}
        }

        if (opened) {
            Lampa.Noty.show('APK скачивается в браузере. После загрузки откройте уведомление и нажмите «Установить».', { time: 9000 });
        } else {
            Lampa.Noty.show('Не удалось открыть браузер. Скопируйте ссылку на APK.', { style: 'error', time: 7000 });
        }
    }

    function showInstall(item) {
        var content = $('<div class="apkstore-install"></div>');
        var head = $('<div class="apkstore-install__head"></div>');
        var icon = $('<div class="apkstore-install__icon"></div>').html(ICONS.apk);
        var titles = $('<div class="apkstore-install__titles"></div>');
        var title = $('<div class="apkstore-install__name"></div>').text(displayName(item));
        var meta = $('<div class="apkstore-install__meta"></div>').text(subtitleFor(item));

        titles.append(title, meta);
        head.append(icon, titles);

        content.append(head);
        content.append(
            $('<div class="apkstore-install__text"></div>').text(
                'Файл откроется в браузере и начнёт скачиваться. После загрузки откройте уведомление браузера (или «Загрузки») и нажмите «Установить».'
            )
        );
        content.append($('<div class="apkstore-install__url"></div>').text(item.url));
        content.append(
            $('<div class="apkstore-install__note"></div>').text(
                'Если система попросит разрешение на установку из неизвестных источников — разрешите его для браузера. Устанавливайте APK только из источников, которым доверяете.'
            )
        );

        Lampa.Modal.open({
            title: 'Установка APK',
            html: content,
            size: 'medium',
            buttons: [
                {
                    name: 'Скачать',
                    onSelect: function () {
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('content');
                        openDownload(item);
                    }
                },
                {
                    name: 'Скопировать ссылку',
                    onSelect: function () {
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('content');
                        copyText(item.url);
                    }
                }
            ],
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    function ApkStore(object) {
        var self = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 300 });
        var root = $('<div class="apkstore"></div>');
        var body = $('<div class="apkstore__body"></div>');
        var network = new Lampa.Reguest();
        var currentUrl = object.url || CONFIG.base;
        var lastFocus = null;
        var inited = true;
        var loading = false;

        root.append(scroll.render());
        scroll.append(body);

        function setLoader(value) {
            if (self.activity && self.activity.loader) self.activity.loader(value);
        }

        function toggleActivity() {
            if (self.activity && self.activity.toggle) self.activity.toggle();
        }

        function bindRow(row, item) {
            row.on('hover:focus', function () {
                lastFocus = this;
                scroll.update($(this));
            }).on('hover:hover', function () {
                lastFocus = this;
            }).on('hover:enter', function () {
                lastFocus = this;

                if (item.dir) {
                    Lampa.Activity.push({
                        url: item.url,
                        title: displayName(item),
                        component: CONFIG.component,
                        page: 1
                    });
                } else {
                    showInstall(item);
                }
            });
        }

        function makeRow(item) {
            var row = $('<div class="apkstore__item selector"></div>');
            var icon = $('<div class="apkstore__icon"></div>').html(item.dir ? ICONS.folder : ICONS.apk);
            var info = $('<div class="apkstore__info"></div>');
            var name = $('<div class="apkstore__name"></div>').text(displayName(item));
            var subtitle = subtitleFor(item);

            info.append(name);
            if (subtitle) info.append($('<div class="apkstore__sub"></div>').text(subtitle));

            var action = $('<div class="apkstore__action"></div>');
            if (item.dir) action.html(ICONS.chevron);
            else action.append($('<span class="apkstore__download"></span>').text('Скачать'));

            row.append(icon, info, action);
            bindRow(row, item);

            return row;
        }

        function renderItems(items, url) {
            var files = 0;
            var dirs = 0;

            body.empty();
            lastFocus = null;

            for (var i = 0; i < items.length; i++) {
                if (items[i].dir) dirs++;
                else files++;
            }

            var meta = $('<div class="apkstore__meta"></div>');
            meta.append($('<div class="apkstore__path"></div>').text(pageLabel(url)));

            var count = files + ' APK';
            if (dirs) count += '  ·  ' + dirs + ' ' + plural(dirs, 'папка', 'папки', 'папок');
            meta.append($('<div class="apkstore__count"></div>').text(count));
            body.append(meta);

            if (!items.length) {
                var empty = $('<div class="apkstore__empty"></div>');
                empty.append($('<div class="apkstore__empty-title"></div>').text('Здесь пока пусто'));
                empty.append($('<div class="apkstore__empty-text"></div>').text('В этой папке нет APK-файлов.'));
                body.append(empty);
            } else {
                for (var j = 0; j < items.length; j++) {
                    body.append(makeRow(items[j]));
                }

                body.append(
                    $('<div class="apkstore__hint"></div>').text(
                        'ОК — открыть папку или скачать APK  ·  Назад — предыдущий экран'
                    )
                );
            }

            if (scroll.reset) scroll.reset();

            setLoader(false);
            toggleActivity();
        }

        function renderError(message) {
            body.empty();
            lastFocus = null;

            var empty = $('<div class="apkstore__empty"></div>');
            empty.append($('<div class="apkstore__empty-title"></div>').text('Не удалось получить список'));
            empty.append(
                $('<div class="apkstore__empty-text"></div>').text(
                    message || 'Проверьте подключение к сети и повторите попытку.'
                )
            );

            var retry = $('<div class="apkstore__item apkstore__retry selector"></div>');
            var icon = $('<div class="apkstore__icon"></div>').html(ICONS.refresh);
            var info = $('<div class="apkstore__info"></div>');
            info.append($('<div class="apkstore__name"></div>').text('Повторить'));
            info.append($('<div class="apkstore__sub"></div>').text('Запросить список ещё раз'));
            retry.append(icon, info);

            retry.on('hover:focus', function () {
                lastFocus = this;
                scroll.update($(this));
            }).on('hover:hover', function () {
                lastFocus = this;
            }).on('hover:enter', function () {
                load(currentUrl);
            });

            empty.append(retry);
            body.append(empty);

            setLoader(false);
            toggleActivity();
        }

        function load(url) {
            if (!inited || loading) return;

            loading = true;
            currentUrl = url;
            setLoader(true);

            var finished = false;
            var timer = setTimeout(function () {
                finishError('Превышено время ожидания ответа сервера.');
            }, 25000);

            function finishSuccess(text) {
                if (finished) return;

                clearTimeout(timer);

                if (typeof text !== 'string') {
                    if (text && typeof text.body === 'string') text = text.body;
                    else if (text && text.responseText) text = text.responseText;
                    else text = String(text || '');
                }

                if (!inited) {
                    finished = true;
                    loading = false;
                    return;
                }

                var items;

                try {
                    items = parseListing(text, currentUrl);
                } catch (e) {
                    finished = true;
                    loading = false;
                    renderError('Не удалось разобрать ответ сервера.');
                    return;
                }

                finished = true;
                loading = false;

                try {
                    renderItems(items, currentUrl);
                } catch (e) {
                    renderError('Не удалось построить список приложений.');
                }
            }

            function finishError(reason) {
                if (finished) return;
                finished = true;
                loading = false;
                clearTimeout(timer);

                if (!inited) return;

                if (typeof reason !== 'string') {
                    reason = 'Сервер не отвечает. Проверьте подключение к сети.';
                }

                renderError(reason);
            }

            try {
                network.native(url, finishSuccess, finishError, false, {
                    dataType: 'text',
                    timeout: 20000
                });
            } catch (e) {
                finishError('Ошибка запроса: ' + (e && e.message ? e.message : 'неизвестная ошибка'));
            }
        }

        this.create = function () {
            inited = true;
            scroll.minus();
            setLoader(true);
            load(currentUrl);

            return this.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                link: this,
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(lastFocus || false, scroll.render());
                },
                left: function () {
                    if (typeof Navigator !== 'undefined' && Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (typeof Navigator !== 'undefined') Navigator.move('right');
                },
                up: function () {
                    if (typeof Navigator !== 'undefined' && Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (typeof Navigator !== 'undefined') Navigator.move('down');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {};

        this.destroy = function () {
            inited = false;
            network.clear();
            scroll.destroy();
            root.remove();
        };

        this.render = function () {
            return root;
        };

        this.empty = function () {
            renderError('Список пуст.');
        };
    }

    function addMenuItem() {
        if (!window.Lampa || !Lampa.Menu) return;
        if (document.querySelector('[data-action="apkstore"]')) return;

        var list = $('.menu .menu__list').eq(0);

        if (!list.length) {
            setTimeout(addMenuItem, 1000);
            return;
        }

        var item = $(
            '<li class="menu__item selector" data-action="apkstore">' +
                '<div class="menu__ico">' + ICONS.menu + '</div>' +
                '<div class="menu__text"></div>' +
            '</li>'
        );

        item.find('.menu__text').text(CONFIG.menu_title);

        item.on('hover:enter', function () {
            Lampa.Activity.push({
                url: CONFIG.base,
                title: CONFIG.menu_title,
                component: CONFIG.component,
                page: 1
            });
        });

        list.append(item);
    }

    function init() {
        if (CONFIG.only_android && !window.apkstore_force && !isAndroid()) return;

        injectStyle();
        Lampa.Component.add(CONFIG.component, ApkStore);
        addMenuItem();
    }

    if (!window.Lampa) return;

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') init();
        });
    }
})();
