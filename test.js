//(function() {
//    'use strict';
//
//    const fixedUnicId = 'raxmind';
   // const fixedLampaUid = 'xgGax1Fs';

//    Lampa.Listener.follow('app', function(e) {
//        if (e.type === 'ready') {
//            Lampa.Storage.set('lampac_unic_id', fixedUnicId);
      //      Lampa.Storage.set('lampa_uid', fixedLampaUid);
      //      Lampa.Storage.set('platform', 'browser');
      //      console.log('ID и platform установлены:', fixedUnicId, fixedLampaUid, 'browser');
//        }
//    });

//})();

(function() {
    'use strict';

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

    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order'];

    var DEFAULT_GROUPS = [
        { name: 'online', patterns: ['online', 'lampac', 'modss', 'showy'], label: 'Онлайн' },
        { name: 'torrent', patterns: ['torrent'], label: 'Торренты' },
        { name: 'trailer', patterns: ['trailer', 'rutube'], label: 'Трейлеры' },
        { name: 'favorite', patterns: ['favorite'], label: 'Избранное' },
        { name: 'subscribe', patterns: ['subscribe'], label: 'Подписка' },
        { name: 'book', patterns: ['book'], label: 'Закладки' },
        { name: 'reaction', patterns: ['reaction'], label: 'Реакции' }
    ];

    var currentItems = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;

    var folderSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';
    var editSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    var trashSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

    function getFolders() {
        return Lampa.Storage.get('button_folders', {});
    }

    function setFolders(val) {
        Lampa.Storage.set('button_folders', val);
    }

    function findButton(btnId) {
        var btn = allButtonsOriginal.find(function(b) { return getButtonId(b) === btnId; });
        if (!btn) {
            btn = allButtonsCache.find(function(b) { return getButtonId(b) === btnId; });
        }
        return btn;
    }

    function getCustomOrder() {
        return Lampa.Storage.get('button_custom_order', []);
    }

    function setCustomOrder(order) {
        Lampa.Storage.set('button_custom_order', order);
    }

    function getHiddenButtons() {
        return Lampa.Storage.get('button_hidden', []);
    }

    function setHiddenButtons(hidden) {
        Lampa.Storage.set('button_hidden', hidden);
    }

    function getButtonId(button) {
        var classes = button.attr('class') || '';
        var text = button.find('span').text().trim().replace(/\s+/g, '_');
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
        var allButtons = container.find('.full-start__button').not('.button--edit-order, .button--play');
        var categories = { online: [], torrent: [], trailer: [], favorite: [], subscribe: [], book: [], reaction: [], other: [] };
        var processedIds = {};
        allButtons.each(function() {
            var $btn = $(this);
            if (isExcluded($btn)) return;
            var btnId = getButtonId($btn);
            if (processedIds[btnId]) return;
            processedIds[btnId] = true;
            var type = getButtonType($btn);
            if (type === 'online' && $btn.hasClass('lampac--button') && !$btn.hasClass('modss--button') && !$btn.hasClass('showy--button')) {
                var svgElement = $btn.find('svg').first();
                if (svgElement.length && !svgElement.hasClass('modss-online-icon')) {
                    svgElement.replaceWith(LAMPAC_ICON);
                }
            }
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

    function sortDefault(buttons) {
        var priority = buttons.filter(function(b) { return getButtonId(b) === 'modss_online_button'; });
        var regular = buttons.filter(function(b) { return getButtonId(b) !== 'modss_online_button'; });
        regular.sort(function(a, b) {
            var typeOrder = ['online', 'torrent', 'trailer', 'favorite', 'subscribe', 'book', 'reaction', 'other'];
            var indexA = typeOrder.indexOf(getButtonType(a)) || 999;
            var indexB = typeOrder.indexOf(getButtonType(b)) || 999;
            return indexA - indexB;
        });
        return priority.concat(regular);
    }

    function getSortedItems(buttons) {
        var customOrder = getCustomOrder();
        var folders = getFolders();
        var sorted = [];
        var remaining = buttons.slice();

        if (customOrder.length === 0) {
            return sortDefault(buttons).map(function(btn) {
                return { type: 'button', btn: btn, id: getButtonId(btn) };
            });
        }

        customOrder.forEach(function(entry) {
            if (entry.startsWith('folder_') && folders[entry]) {
                sorted.push({ type: 'folder', id: entry, name: folders[entry] });
            } else {
                var idx = remaining.findIndex(function(b) { return getButtonId(b) === entry; });
                if (idx !== -1) {
                    var btn = remaining[idx];
                    sorted.push({ type: 'button', btn: btn, id: entry });
                    remaining.splice(idx, 1);
                }
            }
        });

        var remainingSorted = sortDefault(remaining);
        remainingSorted.forEach(function(btn) {
            sorted.push({ type: 'button', btn: btn, id: getButtonId(btn) });
        });

        return sorted;
    }

    function applyHiddenButtons(buttons) {
        var hidden = getHiddenButtons();
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            btn.toggleClass('hidden', hidden.indexOf(id) !== -1);
        });
    }

    function applyButtonAnimation(buttons) {
        buttons.forEach(function(btn, index) {
            btn.css({
                'opacity': '0',
                'animation': 'button-fade-in 0.4s ease forwards',
                'animation-delay': (index * 0.08) + 's'
            });
        });
    }

    function createEditButton() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');
        btn.on('hover:enter', function() { openEditDialog(); });
        if (Lampa.Storage.get('buttons_editor_enabled') === false) {
            btn.hide();
        }
        return btn;
    }

    function saveOrder() {
        var order = currentItems.map(function(item) { return item.id; });
        setCustomOrder(order);
    }

    function applyChanges() {
        if (!currentContainer) return;

        var categories = categorizeButtons(currentContainer);
        var allButtons = [].concat(
            categories.online,
            categories.torrent,
            categories.trailer,
            categories.favorite,
            categories.subscribe,
            categories.book,
            categories.reaction,
            categories.other
        );

        var sortedItems = getSortedItems(allButtons);
        currentItems = sortedItems;
        allButtonsCache = allButtons;

        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer.length) return;

        targetContainer.find('.full-start__button, .full-start__section-title').detach();

        var visibleButtons = [];
        sortedItems.forEach(function(item) {
            if (item.type === 'button') {
                targetContainer.append(item.btn);
                if (!item.btn.hasClass('hidden')) visibleButtons.push(item.btn);
            } else if (item.type === 'folder') {
                var title = $('<div class="full-start__section-title">' + item.name + '</div>');
                targetContainer.append(title);
            }
        });

        applyButtonAnimation(visibleButtons);

        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) { editBtn.detach(); }
        targetContainer.append(createEditButton());

        applyHiddenButtons(allButtons);

        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');

        saveOrder();

        setTimeout(function() {
            if (currentContainer) setupButtonNavigation(currentContainer);
        }, 100);
    }

    function capitalize(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getButtonDisplayName(btn, allButtons) {
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
                return text + ' <span style="opacity:0.5">(' + subtitle.substring(0, 30) + ')</span>';
            }
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0; });
            if (viewClass) {
                var identifier = viewClass.replace('view--', '').replace(/_/g, ' ');
                identifier = capitalize(identifier);
                return text + ' <span style="opacity:0.5">(' + identifier + ')</span>';
            }
        }
        return text;
    }

    function createListItem(item) {
        var isFolder = item.type === 'folder';
        var displayName = isFolder ? item.name : getButtonDisplayName(item.btn, currentItems.filter(function(i) { return i.type === 'button'; }).map(function(i) { return i.btn; }));
        var iconSvg = isFolder ? folderSvg : item.btn.find('svg').clone().prop('outerHTML');
        var id = item.id;
        var isHidden = !isFolder && getHiddenButtons().indexOf(id) !== -1;

        var listItem = $('<div class="menu-edit-list__item' + (isFolder ? ' folder-item' : '') + (isHidden ? ' menu-edit-list__item-hidden' : '') + '"></div>');
        listItem.append('<div class="menu-edit-list__icon">' + iconSvg + '</div>');
        listItem.append('<div class="menu-edit-list__title">' + displayName + '</div>');
        listItem.append('<div class="menu-edit-list__move move-up selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>');
        listItem.append('<div class="menu-edit-list__move move-down selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>');

        if (!isFolder) {
            listItem.append('<div class="menu-edit-list__toggle toggle selector"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="' + (isHidden ? '0' : '1') + '" stroke-linecap="round"/></svg></div>');
        } else {
            listItem.append('<div class="menu-edit-list__edit selector">' + editSvg + '</div>');
            listItem.append('<div class="menu-edit-list__delete selector">' + trashSvg + '</div>');
        }

        var index = currentItems.indexOf(item);

        listItem.find('.move-up').on('hover:enter', function() {
            if (index > 0) {
                var temp = currentItems[index - 1];
                currentItems[index - 1] = currentItems[index];
                currentItems[index] = temp;
                listItem.insertBefore(listItem.prev());
                saveOrder();
            }
        });

        listItem.find('.move-down').on('hover:enter', function() {
            if (index < currentItems.length - 1) {
                var temp = currentItems[index + 1];
                currentItems[index + 1] = currentItems[index];
                currentItems[index] = temp;
                listItem.insertAfter(listItem.next());
                saveOrder();
            }
        });

        if (!isFolder) {
            listItem.find('.toggle').on('hover:enter', function() {
                var nowHidden = !listItem.hasClass('menu-edit-list__item-hidden');
                listItem.toggleClass('menu-edit-list__item-hidden', nowHidden);
                item.btn.toggleClass('hidden', nowHidden);
                listItem.find('.dot').attr('opacity', nowHidden ? '0' : '1');
                var hidden = getHiddenButtons();
                var idx = hidden.indexOf(id);
                if (nowHidden && idx === -1) hidden.push(id);
                if (!nowHidden && idx !== -1) hidden.splice(idx, 1);
                setHiddenButtons(hidden);
            });
        } else {
            listItem.find('.menu-edit-list__edit').on('hover:enter', function() {
                var inputHtml = $('<div><div style="padding:1em;font-size:1.2em;">Название папки</div><div style="padding:0 1em 1em;"><input type="text" value="' + item.name + '" style="width:100%;padding:0.5em;box-sizing:border-box;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:0.3em;"></div></div>');
                Lampa.Modal.open({
                    title: 'Переименовать папку',
                    html: inputHtml,
                    size: 'small',
                    onSelect: function() {
                        var newName = inputHtml.find('input').val().trim();
                        if (newName && newName !== item.name) {
                            item.name = newName;
                            var f = getFolders();
                            f[item.id] = newName;
                            setFolders(f);
                            listItem.find('.menu-edit-list__title').text(newName);
                        }
                        Lampa.Modal.close();
                    },
                    onBack: Lampa.Modal.close
                });
            });

            listItem.find('.menu-edit-list__delete').on('hover:enter', function() {
                currentItems.splice(index, 1);
                listItem.remove();
                var f = getFolders();
                delete f[item.id];
                setFolders(f);
                saveOrder();
            });
        }

        return listItem;
    }

    function openEditDialog() {
        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allButtons = [].concat(
                categories.online,
                categories.torrent,
                categories.trailer,
                categories.favorite,
                categories.subscribe,
                categories.book,
                categories.reaction,
                categories.other
            );

            var uniqueButtons = [];
            var seenIds = {};
            allButtons.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (!seenIds[btnId]) {
                    seenIds[btnId] = true;
                    uniqueButtons.push(btn);
                }
            });

            var sortedItems = getSortedItems(uniqueButtons);
            currentItems = sortedItems;
        }

        var list = $('<div class="menu-edit-list"></div>');

        var createFolderBtn = $('<div class="selector create-folder" style="background:rgba(100,255,100,0.3);border-radius:0.3em;margin:0.5em 0;"><div style="text-align:center;padding:1em;">Создать папку</div></div>');
        createFolderBtn.on('hover:enter', function() {
            var inputHtml = $('<div><div style="padding:1em;font-size:1.2em;">Название папки</div><div style="padding:0 1em 1em;"><input type="text" value="Новая папка" style="width:100%;padding:0.5em;box-sizing:border-box;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:0.3em;"></div></div>');
            Lampa.Modal.open({
                title: 'Создать папку',
                html: inputHtml,
                size: 'small',
                onSelect: function() {
                    var name = inputHtml.find('input').val().trim();
                    if (name) {
                        var folderId = 'folder_' + Date.now();
                        var f = getFolders();
                        f[folderId] = name;
                        setFolders(f);
                        var newFolder = { type: 'folder', id: folderId, name: name };
                        currentItems.push(newFolder);
                        list.append(createListItem(newFolder));
                        saveOrder();
                    }
                    Lampa.Modal.close();
                },
                onBack: Lampa.Modal.close
            });
        });
        list.append(createFolderBtn);

        var modes = ['default', 'icons', 'always'];
        var labels = { default: 'Стандартный', icons: 'Только иконки', always: 'С текстом' };
        var currentMode = Lampa.Storage.get('buttons_viewmode', 'default');
        var modeBtn = $('<div class="selector viewmode-switch">' +
            '<div style="text-align: center; padding: 1em;">Вид кнопок: ' + labels[currentMode] + '</div>' +
            '</div>');
        modeBtn.on('hover:enter', function() {
            var idx = modes.indexOf(currentMode);
            idx = (idx + 1) % modes.length;
            currentMode = modes[idx];
            Lampa.Storage.set('buttons_viewmode', currentMode);
            $(this).find('div').text('Вид кнопок: ' + labels[currentMode]);
            if (currentContainer) {
                var target = currentContainer.find('.full-start-new__buttons');
                target.removeClass('icons-only always-text');
                if (currentMode === 'icons') target.addClass('icons-only');
                if (currentMode === 'always') target.addClass('always-text');
            }
        });
        list.append(modeBtn);

        currentItems.forEach(function(item) {
            list.append(createListItem(item));
        });

        var resetBtn = $('<div class="selector folder-reset-button">' +
            '<div style="text-align: center; padding: 1em;">Сбросить по умолчанию</div>' +
            '</div>');
        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('buttons_viewmode', 'default');
            Lampa.Storage.set('button_folders', {});
            Lampa.Modal.close();
            setTimeout(function() {
                if (currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order').remove();
                    currentContainer.data('buttons-processed', false);
                    reorderButtons(currentContainer);
                    refreshController();
                }
            }, 100);
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
    }

    function reorderButtons(container) {
        var targetContainer = container.find('.full-start-new__buttons');
        if (!targetContainer.length) return false;

        currentContainer = container;
        container.find('.button--play, .button--edit-order').remove();

        var categories = categorizeButtons(container);
        var allButtons = [].concat(
            categories.online,
            categories.torrent,
            categories.trailer,
            categories.favorite,
            categories.subscribe,
            categories.book,
            categories.reaction,
            categories.other
        );

        var sortedItems = getSortedItems(allButtons);
        currentItems = sortedItems;

        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                allButtonsOriginal.push(btn.clone(true, true));
            });
        }

        targetContainer.children().detach();

        var visibleButtons = [];
        sortedItems.forEach(function(item) {
            if (item.type === 'button') {
                targetContainer.append(item.btn);
                if (!item.btn.hasClass('hidden')) visibleButtons.push(item.btn);
            } else if (item.type === 'folder') {
                var title = $('<div class="full-start__section-title">' + item.name + '</div>');
                targetContainer.append(title);
            }
        });

        targetContainer.append(createEditButton());
        visibleButtons.push(targetContainer.find('.button--edit-order'));

        applyHiddenButtons(allButtons);

        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');

        applyButtonAnimation(visibleButtons);

        setTimeout(function() { setupButtonNavigation(container); }, 100);
        return true;
    }

    function setupButtonNavigation(container) {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            try { Lampa.Controller.toggle('full_start'); } catch(e) {}
        }
    }

    function refreshController() {
        if (!Lampa.Controller || typeof Lampa.Controller.toggle !== 'function') return;
        setTimeout(function() {
            try {
                Lampa.Controller.toggle('full_start');
                if (currentContainer) {
                    setTimeout(function() { setupButtonNavigation(currentContainer); }, 100);
                }
            } catch(e) {}
        }, 50);
    }

    function init() {
        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.full-start-new__buttons { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 0.5em !important; }' +
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.folder-reset-button { background: rgba(200,100,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-reset-button.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__toggle.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            '.viewmode-switch { background: rgba(100,100,255,0.3); margin: 0.5em 0 1em 0; border-radius: 0.3em; }' +
            '.viewmode-switch.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__item-hidden { opacity: 0.5; }' +
            '.full-start__section-title { width:100%; text-align:left; padding:0.5em 1em; font-size:1.2em; background:rgba(255,255,255,0.05); border-radius:0.5em; margin:1em 0 0.5em 0; opacity:0.8; }' +
            '.create-folder.focus { border:3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__edit, .menu-edit-list__delete { width:26px; height:26px; display:flex; align-items:center; justify-content:center; margin-left:5px; }' +
            '</style>');
        $('body').append(style);

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            var container = e.object.activity.render();
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }
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
                                    var found = currentItems.some(function(item) {
                                        return item.type === 'button' && getButtonId(item.btn) === getButtonId($btn);
                                    });
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
            }, 400);
        });

        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'buttons_editor_enabled', type: 'trigger', default: true },
                field: { name: 'Редактор кнопок' },
                onChange: function(value) {
                    setTimeout(function() {
                        var currentValue = Lampa.Storage.get('buttons_editor_enabled', true);
                        if (currentValue) {
                            $('.button--edit-order').show();
                        } else {
                            $('.button--edit-order').hide();
                        }
                    }, 100);
                },
                onRender: function(element) {
                    setTimeout(function() {
                        $('div[data-name="interface_size"]').after(element);
                    }, 0);
                }
            });
        }
    }

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
