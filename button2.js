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
        return Lampa.Storage.get('button_custom_order', []);
    }

    function setCustomOrder(order) {
        Lampa.Storage.set('button_custom_order', order);
    }

    function getItemOrder() {
        return Lampa.Storage.get('button_item_order', []);
    }

    function setItemOrder(order) {
        Lampa.Storage.set('button_item_order', order);
    }

    function getFolders() {
        return Lampa.Storage.get('button_folders', []);
    }

    function setFolders(folders) {
        Lampa.Storage.set('button_folders', folders);
    }

    function getButtonsInFolders() {
        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });
        return buttonsInFolders;
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

    function applyButtonAnimation(buttons) {
        buttons.forEach(function(btn, index) {
            btn.css({
                'opacity': '0',
                'animation': 'button-fade-in 0.4s ease forwards',
                'animation-delay': (index * 0.08) + 's'
            });
        });
        var maxDelay = (buttons.length * 80) + 500;
        setTimeout(function() {
            buttons.forEach(function(btn) {
                btn.css({ 'opacity': '1', 'animation': 'none' });
            });
        }, maxDelay);
    }

    function createEditButton() {
        var btn = $('<div class="full-start__button selector button--edit-order button--edit-order-visible" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');
        btn.on('hover:enter', function() {
            openEditDialog();
        });
        if (Lampa.Storage.get('buttons_editor_enabled') === false) {
            btn.hide();
        } else {
            btn.show();
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
        var allButtons = []
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.favorite)
            .concat(categories.subscribe)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.other);
        allButtons = sortByCustomOrder(allButtons);
        allButtonsCache = allButtons;
        var folders = getFolders();
        var foldersUpdated = false;
        folders.forEach(function(folder) {
            var updatedButtons = [];
            var usedButtons = [];
            folder.buttons.forEach(function(oldBtnId) {
                var found = false;
                for (var i = 0; i < allButtons.length; i++) {
                    var btn = allButtons[i];
                    var newBtnId = getButtonId(btn);
                    if (usedButtons.indexOf(newBtnId) !== -1) continue;
                    if (newBtnId === oldBtnId) {
                        updatedButtons.push(newBtnId);
                        usedButtons.push(newBtnId);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    for (var i = 0; i < allButtons.length; i++) {
                        var btn = allButtons[i];
                        var newBtnId = getButtonId(btn);
                        if (usedButtons.indexOf(newBtnId) !== -1) continue;
                        var text = btn.find('span').text().trim();
                        var classes = btn.attr('class') || '';
                        if ((oldBtnId.indexOf('modss') !== -1 || oldBtnId.indexOf('MODS') !== -1) &&
                            (classes.indexOf('modss') !== -1 || text.indexOf('MODS') !== -1)) {
                            updatedButtons.push(newBtnId);
                            usedButtons.push(newBtnId);
                            found = true;
                            break;
                        } else if ((oldBtnId.indexOf('showy') !== -1 || oldBtnId.indexOf('Showy') !== -1) &&
                                   (classes.indexOf('showy') !== -1 || text.indexOf('Showy') !== -1)) {
                            updatedButtons.push(newBtnId);
                            usedButtons.push(newBtnId);
                            found = true;
                            break;
                        }
                    }
                }
                if (!found) updatedButtons.push(oldBtnId);
            });
            if (updatedButtons.length !== folder.buttons.length ||
                updatedButtons.some(function(id, i) { return id !== folder.buttons[i]; })) {
                folder.buttons = updatedButtons;
                foldersUpdated = true;
            }
        });
        if (foldersUpdated) setFolders(folders);
        var buttonsInFolders = getButtonsInFolders();
        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
        });
        currentButtons = filteredButtons;
        applyHiddenButtons(currentButtons);
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
                targetContainer.append(btn);
                if (!btn.hasClass('hidden')) visibleButtons.push(btn);
            });
            folders.forEach(function(folder) {
                var folderBtn = createFolderButton(folder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            });
        }
        applyButtonAnimation(visibleButtons);
        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        }
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        saveOrder();
        setTimeout(function() {
            if (currentContainer) {
                setupButtonNavigation(currentContainer);
            }
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

    function createFolder(name, buttonIds) {
        var folders = getFolders();
        var folder = {
            id: 'folder_' + Date.now(),
            name: name,
            buttons: buttonIds
        };
        folders.push(folder);
        setFolders(folders);
        return folder;
    }

    function deleteFolder(folderId) {
        var folders = getFolders();
        folders = folders.filter(function(f) { return f.id !== folderId; });
        setFolders(folders);
    }

    function createFolderButton(folder) {
        var firstBtnId = folder.buttons[0];
        var firstBtn = findButton(firstBtnId);
        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
            '</svg>';
        if (firstBtn) {
            var btnIcon = firstBtn.find('svg').first();
            if (btnIcon.length) {
                icon = btnIcon.prop('outerHTML');
            }
        }
        var btn = $('<div class="full-start__button selector button--folder" data-folder-id="' + folder.id + '">' +
            icon +
            '<span>' + folder.name + '</span>' +
        '</div>');
        btn.on('hover:enter', function() {
            openFolderMenu(folder);
        });
        return btn;
    }

    function saveFolderButtonOrder(folder, list) {
        var newOrder = [];
        list.find('.menu-edit-list__item').each(function() {
            var btnId = $(this).data('btnId');
            newOrder.push(btnId);
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
        var folderBtn = currentContainer.find('.button--folder[data-folder-id="' + folder.id + '"]');
        if (folderBtn.length) {
            var firstBtnId = folder.buttons[0];
            var firstBtn = findButton(firstBtnId);
            if (firstBtn) {
                var iconElement = firstBtn.find('svg').first();
                if (iconElement.length) {
                    var btnIcon = iconElement.clone();
                    folderBtn.find('svg').replaceWith(btnIcon);
                }
            } else {
                var defaultIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                '</svg>';
                folderBtn.find('svg').replaceWith(defaultIcon);
            }
        }
    }

    function openFolderMenu(folder) {
        var items = [];
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var displayName = getButtonDisplayName(btn, allButtonsOriginal);
                var iconElement = btn.find('svg').first();
                var icon = iconElement.length ? iconElement.prop('outerHTML') : '';
                var subtitle = btn.attr('data-subtitle') || '';
                var titleText = displayName.replace(/<[^>]*>/g, '').replace(/\s*\([^)]*\)\s*/g, '').trim();
                var item = {
                    title: titleText || displayName.replace(/<[^>]*>/g, ''),
                    button: btn,
                    btnId: btnId
                };
                if (icon) {
                    item.template = 'selectbox_icon';
                    item.icon = icon;
                }
                if (subtitle) {
                    item.subtitle = subtitle;
                }
                items.push(item);
            }
        });
        items.push({
            title: 'Изменить порядок',
            edit: true
        });
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
            if (btn) {
                var displayName = getButtonDisplayName(btn, allButtonsOriginal);
                var iconElement = btn.find('svg').first();
                var icon = iconElement.length ? iconElement.clone() : $('<svg></svg>');
                var item = $('<div class="menu-edit-list__item">' +
                    '<div class="menu-edit-list__icon"></div>' +
                    '<div class="menu-edit-list__title">' + displayName + '</div>' +
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

    function openCreateFolderDialog() {
        Lampa.Input.edit({
            free: true,
            title: 'Название папки',
            nosave: true,
            value: '',
            nomic: true
        }, function(folderName) {
            if (!folderName || !folderName.trim()) {
                Lampa.Noty.show('Название папки');
                openEditDialog();
                return;
            }
            openSelectButtonsDialog(folderName.trim());
        });
    }

    function openSelectButtonsDialog(folderName) {
        var selectedButtons = [];
        var list = $('<div class="menu-edit-list"></div>');
        var buttonsInFolders = getButtonsInFolders();
        var sortedButtons = sortByCustomOrder(allButtonsOriginal.slice());
        sortedButtons.forEach(function(btn) {
            var btnId = getButtonId(btn);
            if (buttonsInFolders.indexOf(btnId) !== -1) {
                return;
            }
            var displayName = getButtonDisplayName(btn, sortedButtons);
            var iconElement = btn.find('svg').first();
            var icon = iconElement.length ? iconElement.clone() : $('<svg></svg>');
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
                '<div class="menu-edit-list__toggle selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                        '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' +
            '</div>');
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
            '<div style="text-align: center; padding: 1em;">Создать папку "' + folderName + '"</div>' +
        '</div>');
        createBtn.on('hover:enter', function() {
            if (selectedButtons.length < 2) {
                Lampa.Noty.show('Выберите минимум 2 кнопки');
                return;
            }
            var folder = createFolder(folderName, selectedButtons);
            var itemOrder = getItemOrder();
            if (itemOrder.length === 0) {
                currentButtons.forEach(function(btn) {
                    itemOrder.push({
                        type: 'button',
                        id: getButtonId(btn)
                    });
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
        $('.menu-edit-list .menu-edit-list__item').not('.menu-edit-list__create-folder, .viewmode-switch, .folder-reset-button').each(function() {
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

    function openEditDialog() {
        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allButtons = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.favorite)
                .concat(categories.subscribe)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.other);
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
            var folders = getFolders();
            var buttonsInFolders = getButtonsInFolders();
            currentButtons = allButtons.filter(function(btn) {
                return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
            });
        }
        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        var folders = getFolders();
        var itemOrder = getItemOrder();
        var modes = ['default', 'icons', 'always'];
        var labels = {default: 'Стандартный', icons: 'Только иконки', always: 'С текстом'};
        var currentMode = Lampa.Storage.get('buttons_viewmode', 'default');
        var modeBtn = $('<div class="selector viewmode-switch">' +
            '<div class="menu-edit-list__title" style="text-align: center; padding: 0.4em 1em; flex: 1;">Вид кнопок: ' + labels[currentMode] + '</div>' +
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

        var createFolderBtn = $('<div class="menu-edit-list__item menu-edit-list__create-folder selector">' +
            '<div class="menu-edit-list__icon">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                    '<line x1="12" y1="11" x2="12" y2="17"></line>' +
                    '<line x1="9" y1="14" x2="15" y2="14"></line>' +
                '</svg>' +
            '</div>' +
            '<div class="menu-edit-list__title">Создать папку</div>' +
        '</div>');
        createFolderBtn.on('hover:enter', function() {
            Lampa.Modal.close();
            openCreateFolderDialog();
        });
        list.append(createFolderBtn);

        function createFolderItem(folder) {
            var firstBtn = findButton(folder.buttons[0]);
            var iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
            if (firstBtn && firstBtn.find('svg').first().length) {
                iconHtml = firstBtn.find('svg').first().clone();
            }
            var item = $('<div class="menu-edit-list__item folder-item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + folder.name + ' <span style="opacity:0.5">(' + folder.buttons.length + ')</span></div>' +
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
                '<div class="menu-edit-list__delete selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                        '<path d="M9.5 9.5L16.5 16.5M16.5 9.5L9.5 16.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' +
            '</div>');
            item.find('.menu-edit-list__icon').append(iconHtml);
            item.data('folderId', folder.id);
            item.data('itemType', 'folder');
            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && prev.hasClass('menu-edit-list__create-folder')) {
                    prev = prev.prev();
                }
                if (prev.length) {
                    item.insertBefore(prev);
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
                    saveItemOrder();
                }
            });
            item.find('.menu-edit-list__delete').on('hover:enter', function() {
                var folderId = folder.id;
                var folderButtons = folder.buttons.slice();
                deleteFolder(folderId);
                var itemOrderArr = getItemOrder();
                var newItemOrder = [];
                for (var i = 0; i < itemOrderArr.length; i++) {
                    if (itemOrderArr[i].type === 'folder' && itemOrderArr[i].id === folderId) continue;
                    if (itemOrderArr[i].type === 'button') {
                        var isInFolder = false;
                        for (var j = 0; j < folderButtons.length; j++) {
                            if (itemOrderArr[i].id === folderButtons[j]) { isInFolder = true; break; }
                        }
                        if (isInFolder) continue;
                    }
                    newItemOrder.push(itemOrderArr[i]);
                }
                setItemOrder(newItemOrder);
                var customOrder = getCustomOrder();
                var newCustomOrder = customOrder.filter(function(id) {
                    return folderButtons.indexOf(id) === -1;
                });
                setCustomOrder(newCustomOrder);
                item.remove();
                Lampa.Noty.show('Папка удалена');
                setTimeout(function() {
                    if (currentContainer) {
                        currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                        currentContainer.data('buttons-processed', false);
                        var targetContainer = currentContainer.find('.full-start-new__buttons');
                        var existingButtons = targetContainer.find('.full-start__button').toArray();
                        allButtonsOriginal.forEach(function(originalBtn) {
                            var btnId = getButtonId(originalBtn);
                            var exists = false;
                            for (var i = 0; i < existingButtons.length; i++) {
                                if (getButtonId($(existingButtons[i])) === btnId) { exists = true; break; }
                            }
                            if (!exists) {
                                var clonedBtn = originalBtn.clone(true, true);
                                clonedBtn.css({ 'opacity': '1', 'animation': 'none' });
                                targetContainer.append(clonedBtn);
                            }
                        });
                        reorderButtons(currentContainer);
                        setTimeout(function() {
                            var updatedItemOrder = [];
                            targetContainer.find('.full-start__button').not('.button--edit-order').each(function() {
                                var $btn = $(this);
                                if ($btn.hasClass('button--folder')) {
                                    updatedItemOrder.push({ type: 'folder', id: $btn.attr('data-folder-id') });
                                } else {
                                    updatedItemOrder.push({ type: 'button', id: getButtonId($btn) });
                                }
                            });
                            setItemOrder(updatedItemOrder);
                            var categories = categorizeButtons(currentContainer);
                            var allButtons = []
                                .concat(categories.online).concat(categories.torrent).concat(categories.trailer)
                                .concat(categories.favorite).concat(categories.subscribe).concat(categories.book)
                                .concat(categories.reaction).concat(categories.other);
                            allButtons = sortByCustomOrder(allButtons);
                            allButtonsCache = allButtons;
                            var foldersNow = getFolders();
                            var buttonsInFoldersNow = [];
                            foldersNow.forEach(function(f) { buttonsInFoldersNow = buttonsInFoldersNow.concat(f.buttons); });
                            currentButtons = allButtons.filter(function(btn) {
                                return buttonsInFoldersNow.indexOf(getButtonId(btn)) === -1;
                            });
                            folderButtons.forEach(function(btnId) {
                                var btn = allButtons.find(function(b) { return getButtonId(b) === btnId; });
                                if (btn) {
                                    var btnItem = createButtonItem(btn);
                                    var inserted = false;
                                    list.find('.menu-edit-list__item').not('.menu-edit-list__create-folder, .folder-reset-button').each(function() {
                                        var $existingItem = $(this);
                                        if ($existingItem.data('itemType') === 'button') {
                                            var existingBtnId = $existingItem.data('buttonId');
                                            var existingIndex = updatedItemOrder.findIndex(function(it) { return it.type === 'button' && it.id === existingBtnId; });
                                            var newIndex = updatedItemOrder.findIndex(function(it) { return it.type === 'button' && it.id === btnId; });
                                            if (newIndex !== -1 && existingIndex !== -1 && newIndex < existingIndex) {
                                                btnItem.insertBefore($existingItem);
                                                inserted = true;
                                                return false;
                                            }
                                        }
                                    });
                                    if (!inserted) {
                                        var resetButton = list.find('.folder-reset-button');
                                        if (resetButton.length) btnItem.insertBefore(resetButton);
                                        else list.append(btnItem);
                                    }
                                }
                            });
                            try { Lampa.Controller.toggle('modal'); } catch(e) {}
                        }, 100);
                    }
                }, 50);
            });
            return item;
        }

        function createButtonItem(btn) {
            var displayName = getButtonDisplayName(btn, currentButtons);
            var icon = btn.find('svg').first().clone();
            var btnId = getButtonId(btn);
            var isHidden = hidden.indexOf(btnId) !== -1;
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
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
            item.data('button', btn);
            item.data('buttonId', btnId);
            item.data('itemType', 'button');
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
                var found = itemOrder.some(function(item) { return item.type === 'button' && item.id === btnId; });
                if (!found) list.append(createButtonItem(btn));
            });
            folders.forEach(function(folder) {
                var found = itemOrder.some(function(item) { return item.type === 'folder' && item.id === folder.id; });
                if (!found) list.append(createFolderItem(folder));
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
            '<div class="menu-edit-list__title" style="text-align: center; padding: 0.4em 1em;">Сбросить по умолчанию</div>' +
            '</div>');
        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('button_folders', []);
            Lampa.Storage.set('button_item_order', []);
            Lampa.Storage.set('buttons_viewmode', 'default');
            Lampa.Modal.close();
            setTimeout(function() {
                if (currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                    currentContainer.data('buttons-processed', false);
                    var targetContainer = currentContainer.find('.full-start-new__buttons');
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
        container.find('.button--play, .button--edit-order, .button--folder').remove();
        var categories = categorizeButtons(container);
        var allButtons = []
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.favorite)
            .concat(categories.subscribe)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.other);
        allButtons = sortByCustomOrder(allButtons);
        allButtonsCache = allButtons;
        if (allButtons.length === 0) return false;
        var folders = getFolders();
        if (allButtons.length <= 2 && folders.length === 0) {
            return false;
        }
        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                allButtonsOriginal.push(btn.clone(true, true));
            });
        }
        var buttonsInFolders = getButtonsInFolders();
        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getButtonId(btn)) === -1;
        });
        currentButtons = filteredButtons;
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
            var allButtonsNew = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.favorite)
                .concat(categories.subscribe)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.other);
            allButtonsNew.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (!seenIds[btnId]) {
                    seenIds[btnId] = true;
                    uniqueButtons.push(btn);
                }
            });
            allButtons = sortByCustomOrder(uniqueButtons);
            buttonsInFolders = getButtonsInFolders();
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
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        applyButtonAnimation(visibleButtons);
        setTimeout(function() {
            setupButtonNavigation(container);
        }, 100);
        return true;
    }

    window.reorderButtons = reorderButtons;

    function setupButtonNavigation(container) {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            try {
                Lampa.Controller.toggle('full_start');
            } catch(e) {}
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
                    }, 100);
                }
            } catch(e) {}
        }, 50);
    }

    function init() {
        var DATA_VERSION = 2;
        if (Lampa.Storage.get('buttons_plugin_data_version', 0) < DATA_VERSION) {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_item_order', []);
            Lampa.Storage.set('button_folders', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('buttons_viewmode', 'default');
            Lampa.Storage.set('buttons_plugin_data_version', DATA_VERSION);
        }

        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.full-start__button.button--edit-order { min-width: 2.5em; min-height: 2.5em; display: flex !important; align-items: center; justify-content: center; }' +
            '.full-start__button.button--edit-order svg { width: 1.2em; height: 1.2em; }' +
            '.full-start-new__buttons { ' +
            'display: flex !important; ' +
            'flex-direction: row !important; ' +
            'flex-wrap: wrap !important; ' +
            'gap: 0.5em !important; ' +
            '}' +
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.button--folder { cursor: pointer; }' +
            '.menu-edit-list__item { min-height: 2.8em; box-sizing: border-box; }' +
            '.menu-edit-list__create-folder { background: rgba(34,139,34,0.45) !important; color: #fff; border: 3px solid transparent; padding-left: 0.35em !important; }' +
            '.menu-edit-list__create-folder.focus { background: rgba(34,139,34,0.6) !important; border-color: rgba(255,255,255,0.8); }' +
            '.menu-edit-list__delete { width: 2.4em; height: 2.4em; display: flex; align-items: center; justify-content: center; cursor: pointer; }' +
            '.menu-edit-list__delete svg { width: 1.2em !important; height: 1.2em !important; }' +
            '.menu-edit-list__delete.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.folder-item .menu-edit-list__move { margin-right: 0; }' +
            '.folder-create-confirm { background: rgba(100,200,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-create-confirm.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__move { width: 2.4em; height: 2.4em; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 0.5em; }' +
            '.menu-edit-list__move svg { width: 1.2em !important; height: 1.2em !important; }' +
            '.menu-edit-list__move.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.folder-reset-button { display: flex; align-items: center; min-height: 2.8em; box-sizing: border-box; padding: 0 1em; background: rgba(200,100,100,0.3); margin-top: 1em; border-radius: 0.3em; border: 3px solid transparent; }' +
            '.folder-reset-button.focus { border-color: rgba(255,255,255,0.8); }' +
            '.menu-edit-list__toggle.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            '.viewmode-switch { display: flex; align-items: center; min-height: 2.8em; box-sizing: border-box; padding: 0 1em; background: rgba(30,60,180,0.5) !important; color: #fff; margin: 0.5em 0 1em 0; border-radius: 0.3em; border: 3px solid transparent; }' +
            '.viewmode-switch.focus { background: rgba(30,60,180,0.65) !important; border-color: rgba(255,255,255,0.8); }' +
            '.menu-edit-list__item-hidden { opacity: 0.5; }' +
            '</style>');
        $('body').append(style);

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            var container = e.object.activity.render();
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }
            function tryProcess() {
                try {
                    if (!container.data('buttons-processed') && reorderButtons(container)) {
                        container.data('buttons-processed', true);
                        if (targetContainer.length) {
                            targetContainer.removeClass('buttons-loading');
                        }
                        refreshController();
                        return true;
                    }
                } catch(err) {}
                return false;
            }
            setTimeout(function() {
                if (!tryProcess() && targetContainer.length) {
                    targetContainer.removeClass('buttons-loading');
                    setTimeout(function() {
                        tryProcess();
                        setTimeout(function() {
                            tryProcess();
                        }, 1300);
                    }, 800);
                }
            }, 400);
        });
    }

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

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
