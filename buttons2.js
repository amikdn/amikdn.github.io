
(function() {
    'use strict';

    var PLUGIN_VERSION = '1.57';

    /** Тип события открытия полной карточки (в Lampa используется "complite") */
    var FULL_EVENT_TYPE = 'complite';
    /** Задержка после применения изменений (ожидание layout) */
    var DELAY_AFTER_APPLY_MS = 100;
    /** Ожидание появления контейнера кнопок на карточке */
    var DELAY_FULL_CARD_READY_MS = 400;
    /** Таймаут открытия модалки выбора иконки (если загрузка альт. иконок затягивается) */
    var DELAY_ICON_PICKER_MODAL_MS = 4000;
    /** URL JSON с альтернативными иконками по умолчанию */
    var DEFAULT_ICONS_URL = 'https://amikdn.github.io/lampa-button-icons.json';
    /** Интервал опроса настройки постера (Lampa не даёт событие при смене настройки) */
    var SYNC_POSTER_INTERVAL_MS = 3000;
    /** Ключи Lampa.Storage для настроек плагина */
    var STORAGE_KEYS = {
        custom_order: 'button_custom_order',
        hidden: 'button_hidden',
        custom_icons: 'button_custom_icons',
        custom_labels: 'button_custom_labels',
        viewmode: 'buttons_viewmode',
        editor_enabled: 'buttons_editor_enabled',
        plugin_version: 'buttons_plugin_version',
        folders: 'button_folders',
        item_order: 'button_item_order'
    };

    /** Логирование в консоль при включённой отладке (Lampa.Storage: buttons_debug = true). */
    function logDebug(msg, err) {
        if (typeof Lampa !== 'undefined' && Lampa.Storage && Lampa.Storage.get('buttons_debug')) {
            console.warn('[Buttons plugin]', msg, err !== undefined ? err : '');
        }
    }

    /** Экранирование строки для безопасной подстановки в HTML (атрибуты и текст). */
    function escapeHtml(str) {
        if (str == null || typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Polyfills для совместимости со старыми устройствами
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            if (arguments.length > 1) T = thisArg;
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var res = [];
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (k in O) {
                    var kValue = O[k];
                    if (callback.call(T, kValue, k, O)) res.push(kValue);
                }
                k++;
            }
            return res;
        };
    }

    if (!Array.prototype.find) {
        Array.prototype.find = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                var kValue = O[k];
                if (callback.call(T, kValue, k, O)) return kValue;
                k++;
            }
            return undefined;
        };
    }

    if (!Array.prototype.some) {
        Array.prototype.some = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (k in O && callback.call(T, O[k], k, O)) return true;
                k++;
            }
            return false;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) return -1;
            var n = fromIndex | 0;
            if (n >= len) return -1;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) return k;
                k++;
            }
            return -1;
        };
    }

    var LAMPAC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"></path></svg>';
    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order', 'button--folder'];
    var DEFAULT_GROUPS = [
        { name: 'online', patterns: ['online', 'lampac', 'modss', 'showy'], label: 'Онлайн' },
        { name: 'torrent', patterns: ['torrent'], label: 'Торренты' },
        { name: 'trailer', patterns: ['trailer', 'rutube'], label: 'Трейлеры' },
        { name: 'favorite', patterns: ['favorite'], label: 'Избранное' },
        { name: 'subscribe', patterns: ['subscribe'], label: 'Подписка' },
        { name: 'book', patterns: ['book'], label: 'Закладки' },
        { name: 'reaction', patterns: ['reaction'], label: 'Реакции' }
    ];
    var currentButtons = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;

    function findButton(btnId) {
        var btn = allButtonsOriginal.find(function(b) { return getButtonId(b) === btnId; });
        if (!btn) {
            btn = allButtonsCache.find(function(b) { return getButtonId(b) === btnId; });
        }
        return btn;
    }

    function getCustomOrder() {
        return Lampa.Storage.get(STORAGE_KEYS.custom_order, []);
    }

    function setCustomOrder(order) {
        Lampa.Storage.set(STORAGE_KEYS.custom_order, order);
    }

    function getHiddenButtons() {
        return Lampa.Storage.get(STORAGE_KEYS.hidden, []);
    }

    function setHiddenButtons(hidden) {
        Lampa.Storage.set(STORAGE_KEYS.hidden, hidden);
    }

    function getCustomIcons() {
        return Lampa.Storage.get(STORAGE_KEYS.custom_icons, {});
    }

    function setCustomIcons(icons) {
        Lampa.Storage.set(STORAGE_KEYS.custom_icons, icons);
    }

    function getCustomLabels() {
        return Lampa.Storage.get(STORAGE_KEYS.custom_labels, {});
    }

    function setCustomLabels(labels) {
        Lampa.Storage.set(STORAGE_KEYS.custom_labels, labels);
    }

    function getFolders() {
        return Lampa.Storage.get(STORAGE_KEYS.folders, []);
    }

    function setFolders(folders) {
        Lampa.Storage.set(STORAGE_KEYS.folders, folders);
    }

    function getItemOrder() {
        return Lampa.Storage.get(STORAGE_KEYS.item_order, []);
    }

    function setItemOrder(order) {
        Lampa.Storage.set(STORAGE_KEYS.item_order, order);
    }

    function getButtonsInFolders() {
        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });
        return buttonsInFolders;
    }

    function normalizeSvgString(str) {
        if (!str || typeof str !== 'string') return '';
        return str.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    }

    function svgFingerprint(html) {
        var s = normalizeSvgString(html);
        var useMatch = s.match(/xlink:href\s*=\s*["']?#([^"'\s>]+)/);
        if (useMatch) return 'use:' + useMatch[1];
        var vb = s.match(/viewBox\s*=\s*["']([^"']+)["']/);
        var viewBox = vb ? vb[1].replace(/\s+/g, ' ').trim() : '';
        var pathMatch = s.match(/<path[^>]*\bd\s*=\s*["']([^"']+)["']/g);
        var pathParts = pathMatch ? pathMatch.map(function(p) {
            var d = p.match(/\bd\s*=\s*["']([^"']+)["']/);
            return d ? d[1].replace(/\s+/g, ' ').trim() : '';
        }) : [];
        pathParts.sort();
        return 'inline:' + viewBox + '|' + pathParts.join('|');
    }

    function collectAllIcons() {
        var seen = {};
        var result = [];
        function addIcon(html, id) {
            if (!html) return;
            var key = svgFingerprint(html);
            if (seen[key]) return;
            seen[key] = true;
            result.push({ id: id || key.substring(0, 80), html: html });
        }
        addIcon(LAMPAC_ICON, 'lampac-online');
        var symbols = document.querySelectorAll('symbol[id]');
        for (var i = 0; i < symbols.length; i++) {
            var sym = symbols[i];
            var sid = sym.getAttribute('id') || '';
            var viewBox = sym.getAttribute('viewBox') || '0 0 24 24';
            var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '" fill="currentColor"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#' + sid + '"></use></svg>';
            addIcon(svgHtml, 'sprite-' + sid);
        }
        var buttonArrays = [currentButtons, allButtonsCache, allButtonsOriginal];
        for (var a = 0; a < buttonArrays.length; a++) {
            var arr = buttonArrays[a];
            if (!arr || !arr.length) continue;
            for (var j = 0; j < arr.length; j++) {
                var b = arr[j];
                var $b = b && (b.jquery ? b : $(b));
                if (!$b || !$b.length) continue;
                var svgEl = $b.find('svg').first();
                if (svgEl.length) {
                    try {
                        var raw = svgEl.get(0).outerHTML;
                        addIcon(raw, 'list-' + a + '-' + j);
                    } catch (err) { logDebug('collectAllIcons: button svg', err); }
                }
            }
        }
        var allButtonEls = document.querySelectorAll('.full-start__button');
        for (var k = 0; k < allButtonEls.length; k++) {
            var el = allButtonEls[k];
            if (el.classList && (el.classList.contains('button--edit-order') || el.classList.contains('button--play'))) continue;
            var svg = el.querySelector && el.querySelector('svg');
            if (svg) {
                try {
                    var raw = svg.outerHTML;
                    addIcon(raw, 'dom-' + k);
                } catch (err) { logDebug('collectAllIcons: dom button svg', err); }
            }
        }
        var buttonsContainers = document.querySelectorAll('.full-start-new__buttons');
        for (var c = 0; c < buttonsContainers.length; c++) {
            var container = buttonsContainers[c];
            var children = container.children || container.childNodes;
            for (var n = 0; n < children.length; n++) {
                var child = children[n];
                if (!child || child.nodeType !== 1) continue;
                if (child.classList && (child.classList.contains('button--edit-order') || child.classList.contains('button--play'))) continue;
                var childSvg = child.querySelector && child.querySelector('svg');
                if (childSvg) {
                    try {
                        var rawChild = childSvg.outerHTML;
                        addIcon(rawChild, 'plugin-' + c + '-' + n);
                    } catch (err) { logDebug('collectAllIcons: container svg', err); }
                }
            }
        }
        var menuIcos = document.querySelectorAll('.menu .menu__ico svg');
        for (var m = 0; m < menuIcos.length; m++) {
            try {
                var menuSvg = menuIcos[m];
                var menuRaw = menuSvg.outerHTML;
                addIcon(menuRaw, 'menu-' + m);
            } catch (err) { logDebug('collectAllIcons: menu svg', err); }
        }
        return result;
    }

    function getDefaultIconForButton(btnId) {
        var orig = allButtonsOriginal.find(function(b) { return getButtonId(b) === btnId; });
        if (!orig || !orig.length) return '';
        var svg = orig.find('svg').first();
        return svg.length ? svg.get(0).outerHTML : '';
    }

    function loadIconsFromUrl(url, seen, callback) {
        if (!url || typeof url !== 'string') {
            callback(null, 'Введите ссылку на файл');
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200) {
                callback(null, 'Ошибка загрузки: ' + (xhr.status || 'сеть'));
                return;
            }
            var text = (xhr.responseText || '').replace(/^\uFEFF/, '').trim();
            if (!text) {
                callback(null, 'Пустой ответ');
                return;
            }
            if (text.indexOf('<!') === 0 || text.indexOf('<html') !== -1) {
                callback(null, 'По ссылке отдаётся не JSON (проверьте файл на сайте)');
                return;
            }
            text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            text = text.replace(/,(\s*)\]/, '$1]').replace(/,(\s*)\}/, '$1}');
            var arr;
            try {
                arr = JSON.parse(text);
            } catch (e) {
                try {
                    arr = JSON.parse(text.replace(/[\u0000-\u001F]+/g, ' '));
                } catch (e2) {
                    /* Файл может быть массивом с неэкранированными кавычками — извлекаем все блоки <svg>...</svg> */
                    var svgList = text.match(/<svg[\s\S]*?<\s*\/\s*svg\s*>/gi);
                    if (svgList && svgList.length > 0) {
                        arr = svgList;
                    } else {
                        callback(null, 'Неверный формат файла');
                        return;
                    }
                }
            }
            if (!Array.isArray(arr)) {
                callback(null, 'Файл должен содержать массив');
                return;
            }
            var result = [];
            var urlsToFetch = [];
            var i, item, html, key;
            for (i = 0; i < arr.length; i++) {
                item = arr[i];
                if (typeof item === 'string') {
                    html = item.trim();
                    if (html.indexOf('<svg') !== -1) {
                        key = svgFingerprint(html);
                        if (!seen[key]) {
                            seen[key] = true;
                            result.push({ id: 'icon-' + i, html: html });
                        }
                    } else if (html.indexOf('http://') === 0 || html.indexOf('https://') === 0) {
                        urlsToFetch.push({ url: html, index: i });
                    }
                } else if (item && item.html != null) {
                    html = String(item.html).trim();
                    if (html && html.indexOf('<svg') !== -1) {
                        key = svgFingerprint(html);
                        if (!seen[key]) {
                            seen[key] = true;
                            result.push({ id: (item.id && String(item.id)) || key.substring(0, 80), html: html });
                        }
                    }
                }
            }
            if (urlsToFetch.length === 0) {
                callback(result, null);
                return;
            }
            var fetched = 0;
            urlsToFetch.forEach(function(entry) {
                var req = new XMLHttpRequest();
                req.open('GET', entry.url, true);
                req.onload = function() {
                    if (req.status === 200 && req.responseText) {
                        html = req.responseText.trim();
                        if (html.indexOf('<svg') !== -1) {
                            key = svgFingerprint(html);
                            if (!seen[key]) {
                                seen[key] = true;
                                result.push({ id: 'icon-' + entry.index, html: html });
                            }
                        }
                    }
                    fetched++;
                    if (fetched === urlsToFetch.length) {
                        callback(result, null);
                    }
                };
                req.onerror = function() {
                    fetched++;
                    if (fetched === urlsToFetch.length) {
                        callback(result, null);
                    }
                };
                req.send();
            });
        };
        xhr.onerror = function() {
            callback(null, 'Ошибка сети');
        };
        try {
            xhr.open('GET', url, true);
            xhr.responseType = 'text';
            xhr.send();
        } catch (e) {
            callback(null, 'Ошибка запроса');
        }
    }

    function openIconPicker(btn, btnId, defaultIconHtml, listItem) {
        var icons = collectAllIcons();
        var seen = {};
        for (var s = 0; s < icons.length; s++) {
            seen[svgFingerprint(icons[s].html)] = true;
        }
        var wrap = $('<div class="icon-picker-wrap"></div>');
        var defaultBlock = $('<div class="selector icon-picker-default" tabindex="0">' +
            '<div class="icon-picker-default__preview"></div>' +
            '<span>По умолчанию</span></div>');
        if (defaultIconHtml) {
            defaultBlock.find('.icon-picker-default__preview').append($(defaultIconHtml).clone());
        }
        function applyChoice(isDefault, chosenHtml) {
            var stored = getCustomIcons();
            var custom = {};
            for (var key in stored) {
                if (stored.hasOwnProperty(key)) custom[key] = stored[key];
            }
            if (isDefault) {
                delete custom[btnId];
            } else {
                custom[btnId] = chosenHtml;
            }
            setCustomIcons(custom);
            if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) {
                Lampa.Modal.close();
            }
            setTimeout(function() {
                applyChanges();
            }, DELAY_AFTER_APPLY_MS);
        }
        defaultBlock.on('hover:enter', function() {
            applyChoice(true, null);
        });
        wrap.append(defaultBlock);
        var defaultIconsUrl = DEFAULT_ICONS_URL;
        var loadStatus = $('<div class="icon-picker-load-status"></div>');
        var tabLampa = $('<div class="selector icon-picker-tab icon-picker-tab--active" tabindex="0">Иконки Lampa</div>');
        var tabAlt = $('<div class="selector icon-picker-tab" tabindex="0">Альтернативные иконки</div>');
        var switchBlock = $('<div class="icon-picker-switch-wrap"></div>');
        switchBlock.append(tabLampa).append(tabAlt);
        wrap.append(switchBlock);
        wrap.append(loadStatus);
        function showLampaGrid() {
            wrap.removeClass('icon-picker-view-alt').addClass('icon-picker-view-lampa');
            tabLampa.addClass('icon-picker-tab--active');
            tabAlt.removeClass('icon-picker-tab--active');
        }
        function showAltGrid() {
            wrap.removeClass('icon-picker-view-lampa').addClass('icon-picker-view-alt');
            tabAlt.addClass('icon-picker-tab--active');
            tabLampa.removeClass('icon-picker-tab--active');
        }
        tabLampa.on('hover:enter', showLampaGrid);
        tabAlt.on('hover:enter', showAltGrid);
        wrap.addClass('icon-picker-view-lampa');
        icons.forEach(function(entry) {
            var cell = $('<div class="selector icon-picker-grid__cell icon-picker-cell-lampa" tabindex="0"></div>');
            cell.append($(entry.html).clone());
            var savedHtml = entry.html;
            cell.on('hover:enter', function() {
                applyChoice(false, savedHtml);
            });
            wrap.append(cell);
        });
        loadStatus.text('Загрузка…');
        var modalOpened = false;
        function openModal() {
            if (modalOpened) return;
            modalOpened = true;
            Lampa.Modal.open({
                title: 'Иконка кнопки',
                html: wrap,
                size: 'small',
                scroll_to_center: true,
                onBack: function() {
                    if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) {
                        Lampa.Modal.close();
                    }
                    setTimeout(function() {
                        refreshController();
                    }, DELAY_AFTER_APPLY_MS);
                }
            });
        }
        var openTimeout = setTimeout(openModal, DELAY_ICON_PICKER_MODAL_MS);
        loadIconsFromUrl(defaultIconsUrl, {}, function(newEntries, err) {
            clearTimeout(openTimeout);
            if (err) {
                loadStatus.text(err);
            } else if (newEntries && newEntries.length) {
                newEntries.forEach(function(entry) {
                    var cell = $('<div class="selector icon-picker-grid__cell icon-picker-cell-alt" tabindex="0"></div>');
                    cell.append($(entry.html).clone());
                    var savedHtml = entry.html;
                    cell.on('hover:enter', function() {
                        applyChoice(false, savedHtml);
                    });
                    wrap.append(cell);
                });
                loadStatus.text('Загружены альтернативные иконки (' + newEntries.length + ')');
            } else {
                loadStatus.text('Альтернативные иконки не загружены');
            }
            openModal();
        });
    }

    function getButtonId(button) {
        var classes = button.attr('class') || '';
        var span = button.find('span').first();
        var text = (span.attr('data-original-text') || span.text() || '').trim().replace(/\s+/g, '_');
        var subtitle = button.attr('data-subtitle') || '';
        if (classes.indexOf('modss') !== -1 || text.indexOf('MODS') !== -1 || text.indexOf('MOD') !== -1) {
            return 'modss_online_button';
        }
        if (classes.indexOf('showy') !== -1 || text.indexOf('Showy') !== -1) {
            return 'showy_online_button';
        }
        var viewClasses = classes.split(' ').filter(function(c) { return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; }).join('_');
        if (!viewClasses && !text) {
            return 'button_unknown';
        }
        var id = viewClasses + '_' + text;
        if (subtitle) {
            id = id + '_' + subtitle.replace(/\s+/g, '_').substring(0, 30);
        }
        return id;
    }

    function getButtonType(button) {
        var classes = button.attr('class') || '';
        for (var i = 0; i < DEFAULT_GROUPS.length; i++) {
            var group = DEFAULT_GROUPS[i];
            for (var j = 0; j < group.patterns.length; j++) {
                if (classes.indexOf(group.patterns[j]) !== -1) {
                    return group.name;
                }
            }
        }
        return 'other';
    }

    function isExcluded(button) {
        var classes = button.attr('class') || '';
        for (var i = 0; i < EXCLUDED_CLASSES.length; i++) {
            if (classes.indexOf(EXCLUDED_CLASSES[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function categorizeButtons(container) {
        var allButtons = container.find('.full-start__button').not('.button--edit-order, .button--folder, .button--play');
        var categories = { online: [], torrent: [], trailer: [], favorite: [], subscribe: [], book: [], reaction: [], other: [] };
        var processedIds = {};
        allButtons.each(function() {
            var $btn = $(this);
            if (isExcluded($btn)) return;
            var btnId = getButtonId($btn);
            if (processedIds[btnId]) return;
            processedIds[btnId] = true;
            var type = getButtonType($btn);
            if (categories[type]) {
                categories[type].push($btn);
            } else {
                categories.other.push($btn);
            }
            if (!$btn.hasClass('selector')) {
                $btn.addClass('selector');
            }
        });
        return categories;
    }

    /** Собирает единый массив кнопок из объекта категорий в фиксированном порядке. */
    function getAllButtonsFromCategories(categories) {
        return [].concat(
            categories.online,
            categories.torrent,
            categories.trailer,
            categories.favorite,
            categories.subscribe,
            categories.book,
            categories.reaction,
            categories.other
        );
    }

    function sortByCustomOrder(buttons) {
        var customOrder = getCustomOrder();
        var priority = [];
        var regular = [];
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            if (id === 'modss_online_button') {
                priority.push(btn);
            } else {
                regular.push(btn);
            }
        });
        priority.sort(function(a, b) {
            var idA = getButtonId(a);
            var idB = getButtonId(b);
            if (idA === 'modss_online_button') return -1;
            if (idB === 'modss_online_button') return 1;
            return 0;
        });
        if (!customOrder.length) {
            regular.sort(function(a, b) {
                var typeOrder = ['online', 'torrent', 'trailer', 'favorite', 'subscribe', 'book', 'reaction', 'other'];
                var typeA = getButtonType(a);
                var typeB = getButtonType(b);
                var indexA = typeOrder.indexOf(typeA);
                var indexB = typeOrder.indexOf(typeB);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });
            return priority.concat(regular);
        }
        var sorted = [];
        var remaining = regular.slice();
        customOrder.forEach(function(id) {
            for (var i = 0; i < remaining.length; i++) {
                if (getButtonId(remaining[i]) === id) {
                    sorted.push(remaining[i]);
                    remaining.splice(i, 1);
                    break;
                }
            }
        });
        return priority.concat(sorted).concat(remaining);
    }

    function applyHiddenButtons(buttons) {
        var hidden = getHiddenButtons();
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            btn.toggleClass('hidden', hidden.indexOf(id) !== -1);
        });
    }

    function applyCustomIcons(buttons) {
        var customIcons = getCustomIcons();
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            var svgEl = btn.find('svg').first();
            if (!svgEl.length) return;
            if (customIcons[id]) {
                svgEl.replaceWith($(customIcons[id]).clone());
            } else {
                var defaultHtml = getDefaultIconForButton(id);
                if (defaultHtml) {
                    svgEl.replaceWith($(defaultHtml).clone());
                }
            }
        });
    }

    function getDefaultLabelForButton(btnId) {
        var orig = allButtonsOriginal.find(function(b) { return getButtonId(b) === btnId; });
        if (!orig || !orig.length) return '';
        return orig.find('span').first().text().trim();
    }

    function applyCustomLabels(buttons) {
        var customLabels = getCustomLabels();
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            if (customLabels[id]) {
                var span = btn.find('span').first();
                if (span.length) {
                    if (!span.attr('data-original-text')) {
                        span.attr('data-original-text', getDefaultLabelForButton(id) || span.text().trim());
                    }
                    span.text(customLabels[id]);
                }
            }
        });
    }

    function applyButtonAnimation(buttons, opacityOnly) {
        var animName = opacityOnly ? 'button-fade-in-opacity' : 'button-fade-in';
        buttons.forEach(function(btn, index) {
            btn.css({
                'opacity': '0',
                'animation': animName + ' 0.4s ease forwards',
                'animation-delay': (index * 0.08) + 's'
            });
            if (opacityOnly) {
                btn.one('animationend', function() {
                    $(this).css({ 'opacity': '1', 'animation': '', 'animation-delay': '' });
                });
            }
        });
    }

    function createEditButton() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');
        btn.on('hover:enter', function() {
            openEditDialog();
        });
        if (Lampa.Storage.get(STORAGE_KEYS.editor_enabled) === false) {
            btn.hide();
        }
        return btn;
    }

    function saveOrder() {
        var order = [];
        currentButtons.forEach(function(btn) {
            order.push(getButtonId(btn));
        });
        setCustomOrder(order);
    }

    function applyChanges() {
        if (!currentContainer) return;
        var categories = categorizeButtons(currentContainer);
        var allButtons = sortByCustomOrder(getAllButtonsFromCategories(categories));
        allButtonsCache = allButtons;
        var folders = getFolders();
        var buttonsInFolders = getButtonsInFolders();
        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
        });
        currentButtons = filteredButtons;
        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer.length) return;
        targetContainer.find('.full-start__button').not('.button--edit-order').detach();
        var visibleButtons = [];
        var itemOrder = getItemOrder();
        if (itemOrder.length > 0) {
            var addedFolders = [];
            var addedButtons = [];
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        var folderBtn = createFolderButton(folder);
                        targetContainer.append(folderBtn);
                        visibleButtons.push(folderBtn);
                        addedFolders.push(folder.id);
                    }
                } else if (item.type === 'button') {
                    var btnId = item.id;
                    if (buttonsInFolders.indexOf(btnId) === -1) {
                        var btn = currentButtons.find(function(b) { return getButtonId(b) === btnId; });
                        if (btn && !btn.hasClass('hidden')) {
                            targetContainer.append(btn);
                            visibleButtons.push(btn);
                            addedButtons.push(btnId);
                        }
                    }
                }
            });
            currentButtons.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (addedButtons.indexOf(btnId) === -1 && !btn.hasClass('hidden') && buttonsInFolders.indexOf(btnId) === -1) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });
            folders.forEach(function(folder) {
                if (addedFolders.indexOf(folder.id) === -1) {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
        } else {
            currentButtons.forEach(function(btn) {
                if (!btn.hasClass('hidden') && buttonsInFolders.indexOf(getButtonId(btn)) === -1) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });
            folders.forEach(function(folder) {
                var folderBtn = createFolderButton(folder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            });
        }
        applyButtonAnimation(visibleButtons, currentContainer.hasClass('applecation'));
        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        }
        applyHiddenButtons(currentButtons);
        applyCustomIcons(currentButtons);
        applyCustomLabels(currentButtons);
        var viewmode = Lampa.Storage.get(STORAGE_KEYS.viewmode, 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        saveOrder();
        setTimeout(function() {
            if (currentContainer) {
                setupButtonNavigation(currentContainer);
            }
        }, DELAY_AFTER_APPLY_MS);
    }

    function capitalize(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getButtonDisplayName(btn, allButtons) {
        var customLabels = getCustomLabels();
        var btnId = getButtonId(btn);
        if (customLabels[btnId]) {
            return customLabels[btnId];
        }
        var text = btn.find('span').text().trim();
        var classes = btn.attr('class') || '';
        var subtitle = btn.attr('data-subtitle') || '';
        if (!text) {
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; });
            if (viewClass) {
                text = viewClass.replace('view--', '').replace('button--', '').replace(/_/g, ' ');
                text = capitalize(text);
            } else {
                text = 'Кнопка';
            }
            return text;
        }
        var sameTextCount = 0;
        allButtons.forEach(function(otherBtn) {
            if (otherBtn.find('span').text().trim() === text) {
                sameTextCount++;
            }
        });
        if (sameTextCount > 1) {
            if (subtitle) {
                return text + ' (' + (subtitle.substring(0, 30).replace(/</g, '').replace(/>/g, '')) + ')';
            }
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0; });
            if (viewClass) {
                var identifier = viewClass.replace('view--', '').replace(/_/g, ' ');
                identifier = capitalize(identifier);
                return text + ' (' + identifier + ')';
            }
        }
        return text;
    }

    function createFolderButton(folder) {
        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
            '</svg>';
        if (folder.customIcon) {
            icon = folder.customIcon;
        } else {
            var firstBtnId = folder.buttons[0];
            var firstBtn = findButton(firstBtnId);
            if (firstBtn && firstBtn.length) {
                var btnIcon = firstBtn.find('svg').first();
                if (btnIcon.length) {
                    icon = btnIcon.prop('outerHTML');
                }
            }
        }
        var btn = $('<div class="full-start__button selector button--folder" data-folder-id="' + escapeHtml(folder.id) + '">' +
            icon +
            '<span>' + escapeHtml(folder.name) + '</span>' +
            '</div>');
        btn.on('hover:enter', function() {
            openFolderMenu(folder);
        });
        return btn;
    }

    function openFolderMenu(folder) {
        var items = [];
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn && btn.length) {
                var displayName = getButtonDisplayName(btn, allButtonsOriginal);
                var iconElement = btn.find('svg').first();
                var icon = iconElement.length ? iconElement.prop('outerHTML') : '';
                var item = { title: displayName.replace(/<[^>]*>/g, ''), button: btn, btnId: btnId };
                if (icon) {
                    item.template = 'selectbox_icon';
                    item.icon = icon;
                }
                var subtitle = btn.attr('data-subtitle');
                if (subtitle) item.subtitle = subtitle;
                items.push(item);
            }
        });
        items.push({ title: 'Изменить порядок', edit: true });
        Lampa.Select.show({
            title: folder.name,
            items: items,
            onSelect: function(item) {
                if (item.edit) {
                    openFolderEditDialog(folder);
                } else {
                    item.button.trigger('hover:enter');
                }
            },
            onBack: function() {
                Lampa.Controller.toggle('full_start');
            }
        });
    }

    function openFolderEditDialog(folder) {
        var list = $('<div class="menu-edit-list"></div>');
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn && btn.length) {
                var displayName = getButtonDisplayName(btn, allButtonsOriginal);
                var iconElement = btn.find('svg').first();
                var icon = iconElement.length ? iconElement.clone() : $('<svg></svg>');
                var item = $('<div class="menu-edit-list__item">' +
                    '<div class="menu-edit-list__icon"></div>' +
                    '<div class="menu-edit-list__title">' + escapeHtml(displayName) + '</div>' +
                    '<div class="menu-edit-list__move move-up selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>' +
                    '<div class="menu-edit-list__move move-down selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>' +
                    '</div>');
                item.find('.menu-edit-list__icon').append(icon);
                item.data('btnId', btnId);
                item.find('.move-up').on('hover:enter', function() {
                    var prev = item.prev();
                    if (prev.length) {
                        item.insertBefore(prev);
                        saveFolderButtonOrder(folder, list);
                    }
                });
                item.find('.move-down').on('hover:enter', function() {
                    var next = item.next();
                    if (next.length) {
                        item.insertAfter(next);
                        saveFolderButtonOrder(folder, list);
                    }
                });
                list.append(item);
            }
        });
        Lampa.Modal.open({
            title: 'Порядок кнопок в папке',
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                updateFolderIcon(folder);
                openFolderMenu(folder);
            }
        });
    }

    function saveFolderButtonOrder(folder, list) {
        var newOrder = [];
        list.find('.menu-edit-list__item').each(function() {
            newOrder.push($(this).data('btnId'));
        });
        folder.buttons = newOrder;
        var folders = getFolders();
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].id === folder.id) {
                folders[i].buttons = newOrder;
                break;
            }
        }
        setFolders(folders);
        updateFolderIcon(folder);
    }

    function updateFolderIcon(folder) {
        if (!folder.buttons || folder.buttons.length === 0) return;
        var folderBtn = currentContainer.find('.button--folder[data-folder-id="' + escapeHtml(folder.id) + '"]');
        if (folderBtn.length) {
            if (folder.customIcon) {
                folderBtn.find('svg').replaceWith($(folder.customIcon));
            } else {
                var firstBtn = findButton(folder.buttons[0]);
                if (firstBtn && firstBtn.length) {
                    var iconEl = firstBtn.find('svg').first();
                    if (iconEl.length) {
                        folderBtn.find('svg').replaceWith(iconEl.clone());
                    } else {
                        setDefaultFolderIcon(folderBtn);
                    }
                } else {
                    setDefaultFolderIcon(folderBtn);
                }
            }
        }
    }

    function setDefaultFolderIcon(folderBtn) {
        var defaultIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
        folderBtn.find('svg').replaceWith(defaultIcon);
    }

    function updateFolder(folderId, updates) {
        var folders = getFolders();
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].id === folderId) {
                if (updates.name !== undefined) folders[i].name = updates.name;
                if (updates.customIcon !== undefined) folders[i].customIcon = updates.customIcon;
                setFolders(folders);
                return folders[i];
            }
        }
        return null;
    }

    function getDefaultIconForFolder(folder) {
        if (folder.customIcon) return folder.customIcon;
        var firstBtn = findButton(folder.buttons[0]);
        if (!firstBtn || !firstBtn.length) return '';
        var svg = firstBtn.find('svg').first();
        return svg.length ? svg.get(0).outerHTML : '';
    }

    function openFolderNamePicker(folder, listItem) {
        var currentName = folder.name || '';
        function applyName(val) {
            var v = (val && String(val).trim()) || '';
            if (!v) return;
            updateFolder(folder.id, { name: v });
            if (listItem && listItem.length) {
                listItem.find('.menu-edit-list__title').html(escapeHtml(v) + ' <span style="opacity:0.5">(' + folder.buttons.length + ')</span>');
            }
            setTimeout(function() { applyChanges(); refreshController(); }, DELAY_AFTER_APPLY_MS);
        }
        if (typeof Lampa.Input !== 'undefined' && typeof Lampa.Input.edit === 'function') {
            Lampa.Input.edit({
                free: true,
                title: 'Название папки',
                nosave: true,
                value: currentName,
                nomic: true
            }, function(value) {
                applyName(value);
            });
        } else {
            var wrap = $('<div class="name-picker-wrap">' +
                '<input type="text" class="name-picker-input" value="' + escapeHtml(currentName) + '" placeholder="Название папки" style="width:100%;padding:0.5em;margin:0.5em 0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);border-radius:0.3em;color:#fff;font-size:1em;" />' +
                '<div class="selector name-picker-ok" style="text-align:center;padding:0.75em;margin-top:0.5em;background:rgba(66,133,244,0.5);border-radius:0.3em;">Готово</div></div>');
            var inputEl = wrap.find('input').get(0);
            wrap.find('.name-picker-ok').on('hover:enter', function() {
                var val = (inputEl && inputEl.value) ? String(inputEl.value).trim() : '';
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                applyName(val);
            });
            Lampa.Modal.open({
                title: 'Название папки',
                html: wrap,
                size: 'small',
                scroll_to_center: true,
                onBack: function() {
                    if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                    setTimeout(function() { refreshController(); }, DELAY_AFTER_APPLY_MS);
                }
            });
            setTimeout(function() { if (inputEl) inputEl.focus(); }, 150);
        }
    }

    function openFolderIconPicker(folder, listItem) {
        var defaultIconHtml = getDefaultIconForFolder(folder);
        var icons = collectAllIcons();
        var seen = {};
        for (var s = 0; s < icons.length; s++) {
            seen[svgFingerprint(icons[s].html)] = true;
        }
        var wrap = $('<div class="icon-picker-wrap"></div>');
        var defaultBlock = $('<div class="selector icon-picker-default" tabindex="0">' +
            '<div class="icon-picker-default__preview"></div>' +
            '<span>По умолчанию</span></div>');
        if (defaultIconHtml) {
            defaultBlock.find('.icon-picker-default__preview').append($(defaultIconHtml).clone());
        }
        function applyChoice(isDefault, chosenHtml) {
            updateFolder(folder.id, { customIcon: isDefault ? undefined : chosenHtml });
            if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
            setTimeout(function() {
                applyChanges();
                if (listItem && listItem.length) {
                    var newIcon = isDefault ? (defaultIconHtml ? $(defaultIconHtml) : $('<svg></svg>')) : $(chosenHtml);
                    listItem.find('.menu-edit-list__icon').empty().append(newIcon.clone());
                }
            }, DELAY_AFTER_APPLY_MS);
        }
        defaultBlock.on('hover:enter', function() {
            applyChoice(true, null);
        });
        wrap.append(defaultBlock);
        var tabLampa = $('<div class="selector icon-picker-tab icon-picker-tab--active" tabindex="0">Иконки Lampa</div>');
        var tabAlt = $('<div class="selector icon-picker-tab" tabindex="0">Альтернативные иконки</div>');
        var switchBlock = $('<div class="icon-picker-switch-wrap"></div>');
        switchBlock.append(tabLampa).append(tabAlt);
        wrap.append(switchBlock);
        var loadStatus = $('<div class="icon-picker-load-status"></div>');
        wrap.append(loadStatus);
        wrap.addClass('icon-picker-view-lampa');
        tabLampa.on('hover:enter', function() {
            wrap.removeClass('icon-picker-view-alt').addClass('icon-picker-view-lampa');
            tabLampa.addClass('icon-picker-tab--active');
            tabAlt.removeClass('icon-picker-tab--active');
        });
        tabAlt.on('hover:enter', function() {
            wrap.removeClass('icon-picker-view-lampa').addClass('icon-picker-view-alt');
            tabAlt.addClass('icon-picker-tab--active');
            tabLampa.removeClass('icon-picker-tab--active');
        });
        icons.forEach(function(entry) {
            var cell = $('<div class="selector icon-picker-grid__cell icon-picker-cell-lampa" tabindex="0"></div>');
            cell.append($(entry.html).clone());
            var savedHtml = entry.html;
            cell.on('hover:enter', function() {
                applyChoice(false, savedHtml);
            });
            wrap.append(cell);
        });
        loadStatus.text('Загрузка…');
        loadIconsFromUrl(DEFAULT_ICONS_URL, {}, function(newEntries, err) {
            if (!err && newEntries && newEntries.length) {
                newEntries.forEach(function(entry) {
                    var cell = $('<div class="selector icon-picker-grid__cell icon-picker-cell-alt" tabindex="0"></div>');
                    cell.append($(entry.html).clone());
                    var savedHtml = entry.html;
                    cell.on('hover:enter', function() {
                        applyChoice(false, savedHtml);
                    });
                    wrap.append(cell);
                });
                loadStatus.text('Загружены альтернативные иконки (' + newEntries.length + ')');
            } else {
                loadStatus.text(err || 'Альтернативные иконки не загружены');
            }
        });
        Lampa.Modal.open({
            title: 'Иконка папки',
            html: wrap,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                setTimeout(function() { refreshController(); }, DELAY_AFTER_APPLY_MS);
            }
        });
    }

    function createFolder(name, buttonIds) {
        var folders = getFolders();
        var folder = { id: 'folder_' + Date.now(), name: name, buttons: buttonIds };
        folders.push(folder);
        setFolders(folders);
        return folder;
    }

    function deleteFolder(folderId) {
        var folders = getFolders();
        folders = folders.filter(function(f) { return f.id !== folderId; });
        setFolders(folders);
    }

    function openCreateFolderDialog() {
        if (typeof Lampa.Input !== 'undefined' && typeof Lampa.Input.edit === 'function') {
            Lampa.Input.edit({
                free: true,
                title: 'Название папки',
                nosave: true,
                value: '',
                nomic: true
            }, function(folderName) {
                if (!folderName || !String(folderName).trim()) {
                    Lampa.Noty.show('Введите название папки');
                    openEditDialog();
                    return;
                }
                openSelectButtonsDialog(String(folderName).trim());
            });
        } else {
            var wrap = $('<div class="name-picker-wrap">' +
                '<input type="text" class="name-picker-input" value="" placeholder="Название папки" style="width:100%;padding:0.5em;margin:0.5em 0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);border-radius:0.3em;color:#fff;font-size:1em;" />' +
                '<div class="selector name-picker-ok" style="text-align:center;padding:0.75em;margin-top:0.5em;background:rgba(66,133,244,0.5);border-radius:0.3em;">Готово</div></div>');
            var inputEl = wrap.find('input').get(0);
            wrap.find('.name-picker-ok').on('hover:enter', function() {
                var val = (inputEl && inputEl.value) ? String(inputEl.value).trim() : '';
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                if (!val) {
                    Lampa.Noty.show('Введите название папки');
                    openEditDialog();
                    return;
                }
                openSelectButtonsDialog(val);
            });
            Lampa.Modal.open({
                title: 'Название папки',
                html: wrap,
                size: 'small',
                scroll_to_center: true,
                onBack: function() {
                    if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                    openEditDialog();
                }
            });
            setTimeout(function() { if (inputEl) inputEl.focus(); }, 150);
        }
    }

    function openSelectButtonsDialog(folderName) {
        var selectedButtons = [];
        var list = $('<div class="menu-edit-list"></div>');
        var buttonsInFolders = getButtonsInFolders();
        var sortedButtons = sortByCustomOrder(allButtonsOriginal.slice());
        sortedButtons.forEach(function(btn) {
            var btnId = getButtonId(btn);
            if (buttonsInFolders.indexOf(btnId) !== -1) return;
            var displayName = getButtonDisplayName(btn, sortedButtons);
            var iconElement = btn.find('svg').first();
            var icon = iconElement.length ? iconElement.clone() : $('<svg></svg>');
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + escapeHtml(displayName) + '</div>' +
                '<div class="menu-edit-list__toggle selector">' +
                '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>' +
                '</svg></div></div>');
            item.find('.menu-edit-list__icon').append(icon);
            item.find('.menu-edit-list__toggle').on('hover:enter', function() {
                var index = selectedButtons.indexOf(btnId);
                if (index !== -1) {
                    selectedButtons.splice(index, 1);
                    item.find('.dot').attr('opacity', '0');
                } else {
                    selectedButtons.push(btnId);
                    item.find('.dot').attr('opacity', '1');
                }
            });
            list.append(item);
        });
        var createBtn = $('<div class="selector folder-create-confirm">' +
            '<div style="text-align: center; padding: 1em;">Создать папку "' + escapeHtml(folderName) + '"</div></div>');
        createBtn.on('hover:enter', function() {
            if (selectedButtons.length < 2) {
                Lampa.Noty.show('Выберите минимум 2 кнопки');
                return;
            }
            var folder = createFolder(folderName, selectedButtons);
            var itemOrder = getItemOrder();
            if (itemOrder.length === 0) {
                currentButtons.forEach(function(btn) {
                    itemOrder.push({ type: 'button', id: getButtonId(btn) });
                });
            }
            var folderAdded = false;
            for (var i = 0; i < selectedButtons.length; i++) {
                var btnId = selectedButtons[i];
                for (var j = 0; j < itemOrder.length; j++) {
                    if (itemOrder[j].type === 'button' && itemOrder[j].id === btnId) {
                        if (!folderAdded) {
                            itemOrder[j] = { type: 'folder', id: folder.id };
                            folderAdded = true;
                        } else {
                            itemOrder.splice(j, 1);
                            j--;
                        }
                        break;
                    }
                }
                for (var k = 0; k < currentButtons.length; k++) {
                    if (getButtonId(currentButtons[k]) === btnId) {
                        currentButtons.splice(k, 1);
                        break;
                    }
                }
            }
            if (!folderAdded) {
                itemOrder.push({ type: 'folder', id: folder.id });
            }
            setItemOrder(itemOrder);
            Lampa.Modal.close();
            Lampa.Noty.show('Папка создана "' + folderName + '"');
            if (currentContainer) {
                currentContainer.data('buttons-processed', false);
                reorderButtons(currentContainer);
            }
            refreshController();
        });
        list.append(createBtn);
        Lampa.Modal.open({
            title: 'Выберите кнопки для папки',
            html: list,
            size: 'medium',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog();
            }
        });
    }

    function saveItemOrder() {
        var order = [];
        $('.menu-edit-list .menu-edit-list__item').not('.menu-edit-list__create-folder').each(function() {
            var $item = $(this);
            var itemType = $item.data('itemType');
            if (itemType === 'folder') {
                order.push({ type: 'folder', id: $item.data('folderId') });
            } else if (itemType === 'button') {
                order.push({ type: 'button', id: $item.data('buttonId') });
            }
        });
        setItemOrder(order);
    }

    function syncModalFont() {
            var el = document.querySelector('.menu-edit-list__title');
            if (el) {
                var s = window.getComputedStyle(el);
                document.body.style.setProperty('--buttons-plugin-modal-font', s.fontFamily);
                document.body.style.setProperty('--buttons-plugin-modal-font-size', s.fontSize);
            }
        }

    function openEditDialog() {
        var folders = getFolders();
        var buttonsInFolders = getButtonsInFolders();
        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allButtons = getAllButtonsFromCategories(categories);
            var uniqueButtons = [];
            var seenIds = {};
            allButtons.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (!seenIds[btnId]) {
                    seenIds[btnId] = true;
                    uniqueButtons.push(btn);
                }
            });
            allButtons = sortByCustomOrder(uniqueButtons);
            allButtonsCache = allButtons;
            currentButtons = allButtons.filter(function(btn) {
                return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
            });
        }
        applyCustomIcons(currentButtons);
        applyCustomLabels(currentButtons);
        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        var createFolderBtn = $('<div class="menu-edit-list__item menu-edit-list__create-folder selector">' +
            '<div class="menu-edit-list__icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
            '<line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line>' +
            '</svg></div>' +
            '<div class="menu-edit-list__title">Создать папку</div></div>');
        createFolderBtn.on('hover:enter', function() {
            Lampa.Modal.close();
            openCreateFolderDialog();
        });
        var modes = ['default', 'icons', 'always'];
        var labels = {default: 'Стандартный', icons: 'Только иконки', always: 'С текстом'};
        var currentMode = Lampa.Storage.get(STORAGE_KEYS.viewmode, 'default');
        var modeBtn = $('<div class="selector viewmode-switch">' +
            '<div style="text-align: center; padding: 1em;">Вид кнопок: ' + labels[currentMode] + '</div>' +
            '</div>');
        modeBtn.on('hover:enter', function() {
            var idx = modes.indexOf(currentMode);
            idx = (idx + 1) % modes.length;
            currentMode = modes[idx];
            Lampa.Storage.set(STORAGE_KEYS.viewmode, currentMode);
            $(this).find('div').text('Вид кнопок: ' + labels[currentMode]);
            if (currentContainer) {
                var target = currentContainer.find('.full-start-new__buttons');
                target.removeClass('icons-only always-text');
                if (currentMode === 'icons') target.addClass('icons-only');
                if (currentMode === 'always') target.addClass('always-text');
            }
        });
        list.append(modeBtn);
        list.append(createFolderBtn);

        function createFolderItem(folder) {
            var folderIconHtml = folder.customIcon || (findButton(folder.buttons[0]) && findButton(folder.buttons[0]).find('svg').first().length ? findButton(folder.buttons[0]).find('svg').first().get(0).outerHTML : '');
            var folderIcon = folderIconHtml ? $(folderIconHtml).clone() : $('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>');
            var item = $('<div class="menu-edit-list__item folder-item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + escapeHtml(folder.name) + ' <span style="opacity:0.5">(' + folder.buttons.length + ')</span></div>' +
                '<div class="menu-edit-list__change-name selector" title="Сменить название">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" stroke-width="1.5"/></svg></div>' +
                '<div class="menu-edit-list__change-icon selector">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>' +
                '<div class="menu-edit-list__move move-up selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>' +
                '<div class="menu-edit-list__move move-down selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>' +
                '<div class="menu-edit-list__delete selector">' +
                '<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                '<path d="M9.5 9.5L16.5 16.5M16.5 9.5L9.5 16.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div></div>');
            item.find('.menu-edit-list__icon').append(folderIcon);
            item.data('folderId', folder.id);
            item.data('itemType', 'folder');
            item.find('.menu-edit-list__change-name').on('hover:enter', function() {
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                setTimeout(function() { openFolderNamePicker(folder, item); }, 200);
            });
            item.find('.menu-edit-list__change-icon').on('hover:enter', function() {
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                setTimeout(function() { openFolderIconPicker(folder, item); }, 200);
            });
            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && (prev.hasClass('menu-edit-list__create-folder') || prev.hasClass('viewmode-switch'))) prev = prev.prev();
                if (prev.length) {
                    item.insertBefore(prev);
                    saveItemOrder();
                }
            });
            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && next.hasClass('folder-reset-button')) next = next.next();
                if (next.length && !next.hasClass('folder-reset-button')) {
                    item.insertAfter(next);
                    saveItemOrder();
                }
            });
            item.find('.menu-edit-list__delete').on('hover:enter', function() {
                var folderId = folder.id;
                var folderButtons = folder.buttons.slice();
                deleteFolder(folderId);
                var itemOrder = getItemOrder();
                var newItemOrder = itemOrder.filter(function(it) {
                    if (it.type === 'folder' && it.id === folderId) return false;
                    if (it.type === 'button' && folderButtons.indexOf(it.id) !== -1) return false;
                    return true;
                });
                setItemOrder(newItemOrder);
                item.remove();
                Lampa.Noty.show('Папка удалена');
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) {
                    Lampa.Modal.close();
                }
                setTimeout(function() {
                    if (currentContainer) {
                        currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                        currentContainer.data('buttons-processed', false);
                        reorderButtons(currentContainer);
                        refreshController();
                    }
                }, 50);
            });
            return item;
        }

        function openNamePicker(btn, btnId) {
            var defaultLabel = getDefaultLabelForButton(btnId);
            var currentLabel = getCustomLabels()[btnId] || defaultLabel || '';
            function applyName(val) {
                var v = (val && String(val).trim()) || '';
                var stored = getCustomLabels();
                var labels = {};
                for (var k in stored) { if (stored.hasOwnProperty(k)) labels[k] = stored[k]; }
                if (v === '') {
                    labels[btnId] = defaultLabel || '';
                } else {
                    labels[btnId] = v;
                }
                setCustomLabels(labels);
                setTimeout(function() { applyChanges(); refreshController(); }, DELAY_AFTER_APPLY_MS);
            }
            if (typeof Lampa.Input !== 'undefined' && typeof Lampa.Input.edit === 'function') {
                Lampa.Input.edit({
                    free: true,
                    title: 'Название кнопки',
                    nosave: true,
                    value: currentLabel,
                    nomic: true
                }, function(value) {
                    applyName(value);
                });
            } else {
                var wrap = $('<div class="name-picker-wrap">' +
                    '<input type="text" class="name-picker-input" value="' + escapeHtml(currentLabel) + '" placeholder="Название кнопки" style="width:100%;padding:0.5em;margin:0.5em 0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);border-radius:0.3em;color:#fff;font-size:1em;" />' +
                    '<div class="selector name-picker-ok" style="text-align:center;padding:0.75em;margin-top:0.5em;background:rgba(66,133,244,0.5);border-radius:0.3em;">Готово</div></div>');
                var inputEl = wrap.find('input').get(0);
                wrap.find('.name-picker-ok').on('hover:enter', function() {
                    var val = (inputEl && inputEl.value) ? inputEl.value.trim() : '';
                    if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                    applyName(val);
                });
                Lampa.Modal.open({
                    title: 'Название кнопки',
                    html: wrap,
                    size: 'small',
                    scroll_to_center: true,
                    onBack: function() {
                        if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                        setTimeout(function() { refreshController(); }, DELAY_AFTER_APPLY_MS);
                    }
                });
                setTimeout(function() { if (inputEl) inputEl.focus(); }, 150);
            }
        }

        function createButtonItem(btn) {
            var displayName = getButtonDisplayName(btn, currentButtons);
            var icon = btn.find('svg').clone();
            var btnId = getButtonId(btn);
            var isHidden = hidden.indexOf(btnId) !== -1;
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title"></div>' +
                '<div class="menu-edit-list__change-name selector" title="Сменить название">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" stroke-width="1.5"/></svg></div>' +
                '<div class="menu-edit-list__change-icon selector menu-edit-list__icon-cell">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
                '</div>' +
                '<div class="menu-edit-list__move move-up selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__move move-down selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__toggle toggle selector">' +
                '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="' + (isHidden ? '0' : '1') + '" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '</div>');
            item.toggleClass('menu-edit-list__item-hidden', isHidden);
            item.find('.menu-edit-list__icon').append(icon);
            item.find('.menu-edit-list__title').text(displayName);
            item.data('button', btn);
            item.data('buttonId', btnId);
            item.data('itemType', 'button');
            item.find('.menu-edit-list__change-name').on('hover:enter', function() {
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) Lampa.Modal.close();
                setTimeout(function() { openNamePicker(btn, btnId); }, 200);
            });
            item.find('.menu-edit-list__change-icon').on('hover:enter', function() {
                if (typeof Lampa.Modal !== 'undefined' && Lampa.Modal.close) {
                    Lampa.Modal.close();
                }
                var defaultIcon = getDefaultIconForButton(btnId);
                setTimeout(function() {
                    openIconPicker(btn, btnId, defaultIcon, null);
                }, 200);
            });
            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && (prev.hasClass('viewmode-switch') || prev.hasClass('menu-edit-list__create-folder'))) {
                    prev = prev.prev();
                }
                if (prev.length && !prev.hasClass('viewmode-switch') && !prev.hasClass('menu-edit-list__create-folder')) {
                    item.insertBefore(prev);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex > 0) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex - 1, 0, btn);
                    }
                    saveItemOrder();
                }
            });
            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && next.hasClass('folder-reset-button')) {
                    next = next.next();
                }
                if (next.length && !next.hasClass('folder-reset-button')) {
                    item.insertAfter(next);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex < currentButtons.length - 1) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex + 1, 0, btn);
                    }
                    saveItemOrder();
                }
            });
            item.find('.toggle').on('hover:enter', function() {
                var isNowHidden = !item.hasClass('menu-edit-list__item-hidden');
                item.toggleClass('menu-edit-list__item-hidden', isNowHidden);
                btn.toggleClass('hidden', isNowHidden);
                item.find('.dot').attr('opacity', isNowHidden ? '0' : '1');
                var hiddenList = getHiddenButtons();
                var index = hiddenList.indexOf(btnId);
                if (isNowHidden && index === -1) {
                    hiddenList.push(btnId);
                } else if (!isNowHidden && index !== -1) {
                    hiddenList.splice(index, 1);
                }
                setHiddenButtons(hiddenList);
            });
            return item;
        }

        var itemOrder = getItemOrder();
        if (itemOrder.length > 0) {
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) list.append(createFolderItem(folder));
                } else if (item.type === 'button') {
                    var btn = currentButtons.find(function(b) { return getButtonId(b) === item.id; });
                    if (btn) list.append(createButtonItem(btn));
                }
            });
            currentButtons.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (!itemOrder.some(function(it) { return it.type === 'button' && it.id === btnId; })) {
                    list.append(createButtonItem(btn));
                }
            });
            folders.forEach(function(folder) {
                if (!itemOrder.some(function(it) { return it.type === 'folder' && it.id === folder.id; })) {
                    list.append(createFolderItem(folder));
                }
            });
        } else {
            folders.forEach(function(folder) {
                list.append(createFolderItem(folder));
            });
            currentButtons.forEach(function(btn) {
                list.append(createButtonItem(btn));
            });
        }

        var resetBtn = $('<div class="selector folder-reset-button">' +
            '<div style="text-align: center; padding: 1em;">Сбросить по умолчанию</div>' +
            '</div>');
        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set(STORAGE_KEYS.custom_order, []);
            Lampa.Storage.set(STORAGE_KEYS.hidden, []);
            Lampa.Storage.set(STORAGE_KEYS.custom_icons, {});
            Lampa.Storage.set(STORAGE_KEYS.custom_labels, {});
            Lampa.Storage.set(STORAGE_KEYS.viewmode, 'default');
            Lampa.Storage.set(STORAGE_KEYS.folders, []);
            Lampa.Storage.set(STORAGE_KEYS.item_order, []);
            Lampa.Modal.close();
            setTimeout(function() {
                if (currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order').remove();
                    currentContainer.data('buttons-processed', false);
                    var targetContainer = currentContainer.find('.full-start-new__buttons');
                    targetContainer.find('.full-start__button').not('.button--edit-order, .button--play').each(function() {
                        var $btn = $(this);
                        var btnId = getButtonId($btn);
                        var orig = allButtonsOriginal.find(function(b) { return getButtonId(b) === btnId; });
                        if (orig && orig.length) {
                            var origSvg = orig.find('svg').first();
                            if (origSvg.length) {
                                var $btnSvg = $btn.find('svg').first();
                                if ($btnSvg.length) {
                                    $btnSvg.replaceWith(origSvg.clone());
                                }
                            }
                            var span = $btn.find('span').first();
                            if (span.length) {
                                span.removeAttr('data-original-text');
                                span.text(orig.find('span').first().text().trim());
                            }
                        }
                    });
                    var existingButtons = targetContainer.find('.full-start__button').toArray();
                    allButtonsOriginal.forEach(function(originalBtn) {
                        var btnId = getButtonId(originalBtn);
                        var exists = false;
                        for (var i = 0; i < existingButtons.length; i++) {
                            if (getButtonId($(existingButtons[i])) === btnId) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            var clonedBtn = originalBtn.clone(true, true);
                            clonedBtn.css({ 'opacity': '1', 'animation': 'none' });
                            targetContainer.append(clonedBtn);
                        }
                    });
                    reorderButtons(currentContainer);
                    refreshController();
                }
            }, DELAY_AFTER_APPLY_MS);
        });
        list.append(resetBtn);

        Lampa.Modal.open({
            title: 'Порядок кнопок',
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                applyChanges();
                Lampa.Controller.toggle('full_start');
            }
        });
        setTimeout(syncModalFont, 250);
    }

    function reorderButtons(container) {
        var targetContainer = container.find('.full-start-new__buttons');
        if (!targetContainer.length) return false;
        currentContainer = container;
        var isApplecation = container.hasClass('applecation');
        if (!isApplecation) {
            var scopeEl = targetContainer.parent();
            if (!scopeEl.length) scopeEl = container;
            scopeEl.addClass('buttons-plugin-scope');
        }
        container.find('.button--play, .button--edit-order, .button--folder').remove();
        var categories = categorizeButtons(container);
        var allButtons = sortByCustomOrder(getAllButtonsFromCategories(categories));
        allButtonsCache = allButtons;
        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                allButtonsOriginal.push(btn.clone(true, true));
            });
        }
        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });
        currentButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
        });
        var existingButtons = targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').toArray();
        var missingButtons = [];
        existingButtons.forEach(function(existingBtn) {
            var $existingBtn = $(existingBtn);
            if (isExcluded($existingBtn)) return;
            var existingId = getButtonId($existingBtn);
            var found = false;
            for (var i = 0; i < allButtons.length; i++) {
                if (getButtonId(allButtons[i]) === existingId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missingButtons.push($existingBtn);
            }
        });
        if (missingButtons.length > 0) {
            var seenIds = {};
            allButtons.forEach(function(btn) {
                seenIds[getButtonId(btn)] = true;
            });
            missingButtons.forEach(function($btn) {
                var btnId = getButtonId($btn);
                if (seenIds[btnId]) return;
                seenIds[btnId] = true;
                var type = getButtonType($btn);
                if (categories[type]) {
                    categories[type].push($btn);
                } else {
                    categories.other.push($btn);
                }
                if (!$btn.hasClass('selector')) {
                    $btn.addClass('selector');
                }
            });
            var uniqueButtons = [];
            seenIds = {};
            var allButtonsNew = getAllButtonsFromCategories(categories);
            allButtonsNew.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (!seenIds[btnId]) {
                    seenIds[btnId] = true;
                    uniqueButtons.push(btn);
                }
            });
            allButtons = sortByCustomOrder(uniqueButtons);
            currentButtons = allButtons.filter(function(btn) {
                return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
            });
        }
        targetContainer.children().detach();
        var visibleButtons = [];
        var itemOrder = getItemOrder();
        if (itemOrder.length > 0) {
            var addedFolders = [];
            var addedButtons = [];
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        var folderBtn = createFolderButton(folder);
                        targetContainer.append(folderBtn);
                        visibleButtons.push(folderBtn);
                        addedFolders.push(folder.id);
                    }
                } else if (item.type === 'button') {
                    var btn = currentButtons.find(function(b) { return getButtonId(b) === item.id; });
                    if (btn && !btn.hasClass('hidden')) {
                        targetContainer.append(btn);
                        visibleButtons.push(btn);
                        addedButtons.push(getButtonId(btn));
                    }
                }
            });
            currentButtons.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (addedButtons.indexOf(btnId) === -1 && !btn.hasClass('hidden')) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });
            folders.forEach(function(folder) {
                if (addedFolders.indexOf(folder.id) === -1) {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
        } else {
            folders.forEach(function(folder) {
                var folderBtn = createFolderButton(folder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            });
            currentButtons.forEach(function(btn) {
                targetContainer.append(btn);
                if (!btn.hasClass('hidden')) visibleButtons.push(btn);
            });
        }
        var editButton = createEditButton();
        targetContainer.append(editButton);
        visibleButtons.push(editButton);
        applyHiddenButtons(currentButtons);
        applyCustomIcons(currentButtons);
        applyCustomLabels(currentButtons);
        var viewmode = Lampa.Storage.get(STORAGE_KEYS.viewmode, 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        applyButtonAnimation(visibleButtons, isApplecation);
        setTimeout(function() {
            setupButtonNavigation(container);
        }, DELAY_AFTER_APPLY_MS);
        return true;
    }

    window.reorderButtons = reorderButtons;

    function setupButtonNavigation(container) {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            try {
                Lampa.Controller.toggle('full_start');
            } catch(e) { logDebug('setupButtonNavigation', e); }
        }
    }

    function refreshController() {
        if (!Lampa.Controller || typeof Lampa.Controller.toggle !== 'function') return;
        setTimeout(function() {
            try {
                Lampa.Controller.toggle('full_start');
                if (currentContainer) {
                    setTimeout(function() {
                        setupButtonNavigation(currentContainer);
                    }, DELAY_AFTER_APPLY_MS);
                }
            } catch(e) { logDebug('refreshController', e); }
        }, 50);
    }

    function init() {
        var storedVersion = Lampa.Storage.get(STORAGE_KEYS.plugin_version, '');
        if (storedVersion !== PLUGIN_VERSION) {
            Lampa.Storage.set(STORAGE_KEYS.plugin_version, PLUGIN_VERSION);
        }
        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '@keyframes button-fade-in-opacity { from { opacity: 0; } to { opacity: 1; } }' +
            /* Скрытие кнопок до применения плагина (и в Lampa, и в applecation) */
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            /* С applecation: только скрытие/иконки/загрузка, layout не трогаем */
            '.applecation .full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.applecation .full-start__button.hidden { display: none !important; }' +
            '.applecation .full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.applecation .full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.applecation .full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            /* Без applecation: полный layout контейнера кнопок */
            '.buttons-plugin-scope .full-start-new__buttons { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 0.5em !important; }' +
            '.buttons-plugin-scope .full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.buttons-plugin-scope .full-start__button.hidden { display: none !important; }' +
            '.buttons-plugin-scope .full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.menu-edit-list { max-width: 100%; overflow: hidden; box-sizing: border-box; }' +
            '.menu-edit-list__item { display: grid; grid-template-columns: 2.5em minmax(0, 1fr) 2.4em 2.4em 2.4em 2.4em 2.4em; align-items: center; gap: 0.35em; padding: 0.2em 0; box-sizing: border-box; }' +
            '.menu-edit-list__item .menu-edit-list__icon { width: 2.5em; min-width: 2.5em; height: 2.5em; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }' +
            '.menu-edit-list__item .menu-edit-list__icon svg { width: 1.4em; height: 1.4em; }' +
            '.menu-edit-list__item .menu-edit-list__title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--buttons-plugin-modal-font, inherit); font-size: var(--buttons-plugin-modal-font-size, inherit); }' +
            '.menu-edit-list__item .menu-edit-list__move, .menu-edit-list__item .menu-edit-list__change-name, .menu-edit-list__item .menu-edit-list__change-icon, .menu-edit-list__item .menu-edit-list__toggle { width: 2.4em; min-width: 2.4em; height: 2.4em; display: flex; align-items: center; justify-content: center; box-sizing: border-box; border: 2px solid transparent; border-radius: 0.3em; }' +
            '.menu-edit-list__item .menu-edit-list__move svg { width: 1.2em; height: 0.75em; }' +
            '.menu-edit-list__item .menu-edit-list__toggle svg { width: 1.2em; height: 1.2em; }' +
            '.menu-edit-list__item .menu-edit-list__change-name svg, .menu-edit-list__item .menu-edit-list__change-icon svg { width: 1.2em; height: 1.2em; }' +
            '.viewmode-switch, .folder-reset-button { max-width: 100%; box-sizing: border-box; white-space: normal; word-break: break-word; font-family: var(--buttons-plugin-modal-font, inherit); font-size: var(--buttons-plugin-modal-font-size, inherit); }' +
            '.folder-reset-button { background: rgba(200,100,100,0.3); margin-top: 1em; border-radius: 0.3em; border: 3px solid transparent; }' +
            '.folder-reset-button.focus { border-color: rgba(255,255,255,0.8); }' +
            '.menu-edit-list__create-folder { background: rgba(34, 139, 34, 0.5); margin-bottom: 0.5em; border: 3px solid transparent; border-radius: 0.3em; box-sizing: border-box; }' +
            '.menu-edit-list__create-folder .menu-edit-list__title { text-align: center; justify-self: center; }' +
            '.menu-edit-list__create-folder.focus { border-color: rgba(255,255,255,0.8); }' +
            '.folder-item { grid-template-columns: 2.5em minmax(0, 1fr) 2.4em 2.4em 2.4em 2.4em 2.4em; align-items: start; min-height: 3.2em; }' +
            '.button--folder { cursor: pointer; }' +
            '.menu-edit-list__delete { width: 2.4em; min-width: 2.4em; height: 2.4em; display: flex; align-items: center; justify-content: center; border: 2px solid transparent; border-radius: 0.3em; box-sizing: border-box; }' +
            '.menu-edit-list__delete.focus { border-color: rgba(255,255,255,0.8); }' +
            '.folder-item .menu-edit-list__delete { align-self: end; justify-self: end; }' +
            '.folder-item .menu-edit-list__move, .folder-item .menu-edit-list__change-name, .folder-item .menu-edit-list__change-icon { margin-right: 0; }' +
            '.folder-create-confirm { background: rgba(100,200,100,0.3); margin-top: 1em; border-radius: 0.3em; border: 3px solid transparent; }' +
            '.folder-create-confirm.focus { border-color: rgba(255,255,255,0.8); }' +
            '.menu-edit-list__move.focus, .menu-edit-list__change-name.focus, .menu-edit-list__change-icon.focus, .menu-edit-list__toggle.focus { border-color: rgba(255,255,255,0.8); }' +
            '.buttons-plugin-scope .full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.buttons-plugin-scope .full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            '.viewmode-switch { background: rgba(66, 133, 244, 0.5); color: #fff; margin: 0.5em 0 1em 0; border-radius: 0.3em; border: 3px solid transparent; }' +
            '.viewmode-switch.focus { border-color: rgba(255,255,255,0.8); }' +
            '.menu-edit-list__item-hidden { opacity: 0.5; }' +
            '.icon-picker-default { display: flex; align-items: center; gap: 0.5em; padding: 0.35em 0.5em; min-height: 2.5em; margin-bottom: 0.5em; border-radius: 0.3em; background: rgba(255,255,255,0.08); border: 3px solid transparent; box-sizing: border-box; font-family: var(--buttons-plugin-modal-font, inherit); font-size: var(--buttons-plugin-modal-font-size, inherit); }' +
            '.icon-picker-default.focus { border-color: rgba(255,255,255,0.8); }' +
            '.icon-picker-default__preview { width: 2.5em; height: 2.5em; min-width: 2.5em; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }' +
            '.icon-picker-default__preview svg { width: 1.5em; height: 1.5em; }' +
            '.icon-picker-wrap { width: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(2.5em, 1fr)); gap: 0.35em; align-content: start; }' +
            '.icon-picker-wrap .icon-picker-default, .icon-picker-wrap .icon-picker-switch-wrap, .icon-picker-wrap .icon-picker-load-status { grid-column: 1 / -1; }' +
            '.icon-picker-view-lampa .icon-picker-cell-alt { display: none !important; }' +
            '.icon-picker-view-alt .icon-picker-cell-lampa { display: none !important; }' +
            '.icon-picker-switch-wrap { display: flex; width: 100%; align-items: stretch; gap: 0.35em; margin-bottom: 0; }' +
            '.icon-picker-tab { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.75em; border-radius: 0.3em; background: rgba(255,255,255,0.08); text-align: center; min-width: 0; border: 3px solid transparent; box-sizing: border-box; font-family: var(--buttons-plugin-modal-font, inherit); font-size: var(--buttons-plugin-modal-font-size, inherit); }' +
            '.icon-picker-tab--active { background: rgba(66, 133, 244, 0.6); }' +
            '.icon-picker-tab.focus { border-color: rgba(255,255,255,0.8); }' +
            '.icon-picker-load-status { font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 0.25em; font-family: var(--buttons-plugin-modal-font, inherit); }' +
            '.icon-picker-grid__cell { display: flex; align-items: center; justify-content: center; padding: 0.35em; min-height: 2.5em; border: 2px solid transparent; border-radius: 0.3em; box-sizing: border-box; }' +
            '.icon-picker-grid__cell.focus { border-color: rgba(255,255,255,0.8); }' +
            '.icon-picker-grid__cell svg { width: 1.5em; height: 1.5em; }' +
            '.name-picker-ok { font-family: var(--buttons-plugin-modal-font, inherit); font-size: var(--buttons-plugin-modal-font-size, inherit); }' +
            /* Режим «без постера»: только когда карточка не applecation; опускание кнопок, «Подробно» под кнопки */
            'body.buttons-plugin--poster-off .full-start-new:not(.applecation) .full-start-new__body { height: 80vh !important; min-height: 80vh !important; }' +
            'body.buttons-plugin--poster-off .full-start-new:not(.applecation) .full-start-new__right { display: flex !important; flex-direction: column !important; justify-content: flex-end !important; }' +
            'body.buttons-plugin--poster-off .full-start-new:not(.applecation) .full-start-new__head { display: none !important; }' +
            'body.buttons-plugin--poster-off .full-start-new:not(.applecation) .full-start-new__rate-line { margin-bottom: 0.4em !important; }' +
            'body.buttons-plugin--poster-off .full-start-new:not(.applecation) .full-start-new__details { margin-bottom: 0.2em !important; }' +
            'body.buttons-plugin--poster-off .full-start:not(.applecation) .scroll__body, body.buttons-plugin--poster-off .full:not(.applecation) .scroll__body { padding-bottom: 50vh !important; }' +
            'body.buttons-plugin--poster-off .full-start:not(.applecation) .scroll__body > .items-line:last-of-type, body.buttons-plugin--poster-off .full:not(.applecation) .scroll__body > .items-line:last-of-type { margin-bottom: 40vh !important; }' +
            'body.buttons-plugin--poster-off .full-start:not(.applecation) [class*="description"], body.buttons-plugin--poster-off .full:not(.applecation) [class*="description"] { margin-bottom: 40vh !important; }' +
            '</style>');
        $('body').append(style);

        function syncPosterOffClass() {
            var showPoster = Lampa.Storage.get('card_interface_poster', Lampa.Storage.get('card_interfice_poster', true));
            $('body').toggleClass('buttons-plugin--poster-off', !showPoster);
        }
        syncPosterOffClass();
        setInterval(syncPosterOffClass, SYNC_POSTER_INTERVAL_MS);

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== FULL_EVENT_TYPE) return;
            syncPosterOffClass();
            var container = e.object.activity.render();
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }
            setTimeout(function() {
                var tc = container.find('.full-start-new__buttons');
                if (tc.length) tc.addClass('buttons-loading');
            }, 0);
            setTimeout(function() {
                try {
                    if (!container.data('buttons-processed')) {
                        container.data('buttons-processed', true);
                        if (reorderButtons(container)) {
                            if (targetContainer.length) {
                                targetContainer.removeClass('buttons-loading');
                            }
                            refreshController();
                        }
                    } else {
                        setTimeout(function() {
                            if (container.data('buttons-processed')) {
                                var newButtons = targetContainer.find('.full-start__button').not('.button--edit-order, .button--play');
                                var hasNewButtons = false;
                                newButtons.each(function() {
                                    var $btn = $(this);
                                    if (isExcluded($btn)) return;
                                    var found = false;
                                    for (var i = 0; i < currentButtons.length; i++) {
                                        if (getButtonId(currentButtons[i]) === getButtonId($btn)) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        hasNewButtons = true;
                                    }
                                });
                                if (hasNewButtons) {
                                    reorderButtons(container);
                                }
                            }
                        }, 600);
                    }
                } catch(err) {
                    if (targetContainer.length) {
                        targetContainer.removeClass('buttons-loading');
                    }
                }
            }, DELAY_FULL_CARD_READY_MS);
        });
    }

    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: STORAGE_KEYS.editor_enabled, type: 'trigger', default: true },
            field: { name: 'Редактор кнопок' },
            onChange: function(value) {
                setTimeout(function() {
                    var currentValue = Lampa.Storage.get(STORAGE_KEYS.editor_enabled, true);
                    if (currentValue) {
                        $('.button--edit-order').show();
                    } else {
                        $('.button--edit-order').hide();
                    }
                }, DELAY_AFTER_APPLY_MS);
            },
            onRender: function(element) {
                setTimeout(function() {
                    $('div[data-name="interface_size"]').after(element);
                }, 0);
            }
        });
    }

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
