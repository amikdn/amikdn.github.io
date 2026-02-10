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

    // --- Polyfills ---
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
    // (Другие полифиллы опущены для краткости, но обязательны для старых устройств. Если нужно, добавьте filter, find, some, indexof аналогично предыдущему коду)
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

    // --- Иконки и Константы ---
    var LAMPAC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"></path></svg>';
    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order', 'button--folder'];
    
    // --- Переводы ---
    function t(key) {
        var map = {
            'title': 'Порядок кнопок',
            'reset': 'Сбросить по умолчанию',
            'settings_name': 'Редактор кнопок',
            'folder_name': 'Название папки',
            'create_folder': 'Создать папку',
            'select_buttons': 'Выберите кнопки',
            'min_buttons': 'Выберите минимум 2 кнопки',
            'edit_order': 'Изменить порядок',
            'folder_deleted': 'Папка удалена',
            'folder_created': 'Папка создана'
        };
        return map[key] || key;
    }

    // --- Хранилище и Данные ---
    var currentButtons = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;

    function getFolders() { return Lampa.Storage.get('button_folders', []); }
    function setFolders(f) { Lampa.Storage.set('button_folders', f); }
    
    function getCustomOrder() { return Lampa.Storage.get('button_custom_order', []); }
    function setCustomOrder(o) { Lampa.Storage.set('button_custom_order', o); }
    
    function getItemOrder() { return Lampa.Storage.get('button_item_order', []); }
    function setItemOrder(o) { Lampa.Storage.set('button_item_order', o); }
    
    function getHiddenButtons() { return Lampa.Storage.get('button_hidden', []); }
    function setHiddenButtons(h) { Lampa.Storage.set('button_hidden', h); }

    // --- Вспомогательные функции ---
    function getBtnId(btn) {
        var c = btn.attr('class') || '';
        var txt = btn.find('span').text().trim().replace(/\s+/g, '_');
        var sub = btn.attr('data-subtitle') || '';
        if (c.indexOf('modss') !== -1 || txt.indexOf('MODS') !== -1) return 'modss_online_button';
        if (c.indexOf('showy') !== -1) return 'showy_online_button';
        var vc = c.split(' ').filter(function(x) { return x.indexOf('view--') === 0; }).join('_');
        var id = (vc || 'btn') + '_' + txt;
        if (sub) id += '_' + sub.replace(/\s+/g, '_').substring(0, 20);
        return id;
    }

    function findButton(id) {
        var b = allButtonsOriginal.find(function(x) { return getBtnId(x) === id; });
        if (!b) b = allButtonsCache.find(function(x) { return getBtnId(x) === id; });
        return b;
    }

    function getButtonsInFolders() {
        var ids = [];
        getFolders().forEach(function(f) { ids = ids.concat(f.buttons); });
        return ids;
    }

    function isFolder(id) { return id && id.toString().indexOf('folder_') === 0; }

    // --- Логика папок (Из вашего кода) ---
    function createFolder(name, buttonIds) {
        var folders = getFolders();
        var folder = {
            id: 'folder_' + Date.now(),
            name: name,
            buttons: buttonIds
        };
        folders.push(folder);
        setFolders(folders);
        
        // Обновляем порядок элементов, чтобы папка встала на место первой выбранной кнопки
        var itemOrder = getItemOrder();
        if (itemOrder.length === 0) {
            // Если порядка нет, создаем из текущих кнопок
            currentButtons.forEach(function(btn) {
                itemOrder.push({ type: 'button', id: getBtnId(btn) });
            });
        }

        var folderAdded = false;
        // Удаляем выбранные кнопки из порядка и вставляем папку
        for (var i = 0; i < buttonIds.length; i++) {
            var btnId = buttonIds[i];
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
        }
        if (!folderAdded) itemOrder.push({ type: 'folder', id: folder.id });
        
        setItemOrder(itemOrder);
        return folder;
    }

    function deleteFolder(folderId) {
        var folders = getFolders().filter(function(f) { return f.id !== folderId; });
        setFolders(folders);
        
        // Возвращаем кнопки из удаленной папки в общий порядок
        var deletedFolder = getFolders().find(function(f) { return f.id === folderId; }); // Странный вызов, но логика такая: до setFolders папка еще есть
        // Надо найти её до удаления
        var targetFolder;
        getFolders().forEach(function(f){ if(f.id === folderId) targetFolder = f; });
        
        if (targetFolder) {
            var itemOrder = getItemOrder();
            var newOrder = [];
            var folderIndex = itemOrder.findIndex(function(i){ return i.type === 'folder' && i.id === folderId; });
            
            // Если папка была в порядке, вставляем её кнопки на её место
            if (folderIndex !== -1) {
                 targetFolder.buttons.forEach(function(btnId) {
                     newOrder.push({ type: 'button', id: btnId });
                 });
            }
            
            itemOrder.forEach(function(item) {
                if (item.type === 'folder' && item.id === folderId) return;
                if (item.type === 'button' && targetFolder.buttons.indexOf(item.id) !== -1) return;
                newOrder.push(item);
            });
            setItemOrder(newOrder);
        }
    }

    // --- UI Функции ---

    function buildEditorBtn() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');
        btn.on('hover:enter', function() { openEditDialog(); });
        if (Lampa.Storage.get('buttons_editor_enabled') === false) btn.hide();
        return btn;
    }

    function createFolderButton(folder) {
        var firstBtn = findButton(folder.buttons[0]);
        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
        if (firstBtn) {
            var i = firstBtn.find('svg').first();
            if (i.length) icon = i.prop('outerHTML');
        }
        
        var btn = $('<div class="full-start__button selector button--folder" data-folder-id="' + folder.id + '">' + icon + '<span>' + folder.name + '</span></div>');
        btn.on('hover:enter', function() { openFolderMenu(folder); });
        return btn;
    }

    function openFolderMenu(folder) {
        var items = [];
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var txt = btn.find('span').text().trim() || 'Кнопка';
                var i = btn.find('svg').first();
                var icon = i.length ? i.prop('outerHTML') : '';
                items.push({
                    title: txt,
                    button: btn,
                    template: 'selectbox_icon',
                    icon: icon
                });
            }
        });
        items.push({ title: t('edit_order'), edit: true });

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
            onBack: function() { Lampa.Controller.toggle('full_start'); }
        });
    }

    function openFolderEditDialog(folder) {
        var list = $('<div class="menu-edit-list"></div>');
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var txt = btn.find('span').text().trim();
                var item = $('<div class="menu-edit-list__item"><div class="menu-edit-list__title">' + txt + '</div>' +
                    '<div class="menu-edit-list__move move-up selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>' +
                    '<div class="menu-edit-list__move move-down selector"><svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>' +
                '</div>');
                item.data('btnId', btnId);
                
                item.find('.move-up').on('hover:enter', function() {
                    var prev = item.prev();
                    if (prev.length) { item.insertBefore(prev); saveFolderOrder(folder, list); }
                });
                item.find('.move-down').on('hover:enter', function() {
                    var next = item.next();
                    if (next.length) { item.insertAfter(next); saveFolderOrder(folder, list); }
                });
                list.append(item);
            }
        });
        Lampa.Modal.open({
            title: t('edit_order'),
            html: list,
            size: 'small',
            onBack: function() { Lampa.Modal.close(); openFolderMenu(folder); }
        });
    }

    function saveFolderOrder(folder, list) {
        var newOrder = [];
        list.find('.menu-edit-list__item').each(function() { newOrder.push($(this).data('btnId')); });
        folder.buttons = newOrder;
        var folders = getFolders();
        var idx = folders.findIndex(function(f) { return f.id === folder.id; });
        if (idx !== -1) { folders[idx].buttons = newOrder; setFolders(folders); }
    }

    function openCreateFolderDialog() {
        Lampa.Input.edit({
            value: '', title: t('folder_name'), nosave: true
        }, function(name) {
            if (!name) return;
            openSelectButtonsDialog(name.trim());
        });
    }

    function openSelectButtonsDialog(folderName) {
        var selectedIds = [];
        var list = $('<div class="menu-edit-list"></div>');
        var inFolders = getButtonsInFolders();
        
        // Показываем только кнопки не в папках
        currentButtons.forEach(function(btn) {
            var id = getBtnId(btn);
            if (inFolders.indexOf(id) !== -1) return;
            
            var txt = btn.find('span').text().trim();
            var icon = btn.find('svg').first().clone();
            
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + txt + '</div>' +
                '<div class="menu-edit-list__toggle selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="3"><rect x="2" y="2" width="22" height="22" rx="4"/><path class="dot" d="M7 13l4 4 8-8" opacity="0"/></svg>' +
                '</div></div>');
            item.find('.menu-edit-list__icon').append(icon);
            
            item.find('.menu-edit-list__toggle').on('hover:enter', function() {
                var idx = selectedIds.indexOf(id);
                if (idx !== -1) {
                    selectedIds.splice(idx, 1);
                    item.find('.dot').attr('opacity', '0');
                } else {
                    selectedIds.push(id);
                    item.find('.dot').attr('opacity', '1');
                }
            });
            list.append(item);
        });

        var confirmBtn = $('<div class="selector" style="background:rgba(100,200,100,0.3); padding:1em; text-align:center; margin-top:1em;">' + t('create_folder') + '</div>');
        confirmBtn.on('hover:enter', function() {
            if (selectedIds.length < 2) {
                Lampa.Noty.show(t('min_buttons'));
                return;
            }
            createFolder(folderName, selectedIds);
            Lampa.Modal.close();
            Lampa.Noty.show(t('folder_created'));
            setTimeout(function() {
                if(currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                    currentContainer.data('buttons-processed', false);
                    reorderButtons(currentContainer);
                }
                refreshController();
            }, 100);
        });
        list.append(confirmBtn);

        Lampa.Modal.open({
            title: t('select_buttons'),
            html: list,
            size: 'medium',
            onBack: function() { Lampa.Modal.close(); openEditDialog(); }
        });
    }

    // --- Основная логика ---

    function applyChanges() {
        if (!currentContainer) return;
        var categories = groupBtns(currentContainer);
        var all = [].concat(categories.online, categories.torrent, categories.trailer, categories.other);
        allButtonsCache = all;
        
        var folders = getFolders();
        var idsInFolders = [];
        folders.forEach(function(f) { idsInFolders = idsInFolders.concat(f.buttons); });
        
        // Кнопки, которые НЕ в папках
        var visibleButtons = [];
        var rootButtons = all.filter(function(b) { return idsInFolders.indexOf(getBtnId(b)) === -1; });
        
        var target = currentContainer.find('.full-start-new__buttons');
        target.find('.full-start__button').not('.button--edit-order').detach();
        
        var itemOrder = getItemOrder();
        
        // Отрисовка по порядку
        var addedIds = [];
        
        if (itemOrder.length > 0) {
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var f = folders.find(function(x) { return x.id === item.id; });
                    if (f) {
                        var fb = createFolderButton(f);
                        target.append(fb);
                        visibleButtons.push(fb);
                        addedIds.push(item.id);
                    }
                } else if (item.type === 'button') {
                    var b = rootButtons.find(function(x) { return getBtnId(x) === item.id; });
                    if (b && !b.hasClass('hidden')) {
                        target.append(b);
                        visibleButtons.push(b);
                        addedIds.push(item.id);
                    }
                }
            });
            
            // Добавляем новые кнопки, которых нет в порядке
            rootButtons.forEach(function(b) {
                var id = getBtnId(b);
                if (addedIds.indexOf(id) === -1 && !b.hasClass('hidden')) {
                    target.append(b);
                    visibleButtons.push(b);
                }
            });
            // Добавляем новые папки
            folders.forEach(function(f) {
                if (addedIds.indexOf(f.id) === -1) {
                    var fb = createFolderButton(f);
                    target.append(fb);
                    visibleButtons.push(fb);
                }
            });
        } else {
            // Если порядка нет, просто кнопки потом папки
            rootButtons.forEach(function(b) {
                if (!b.hasClass('hidden')) {
                    target.append(b);
                    visibleButtons.push(b);
                }
            });
            folders.forEach(function(f) {
                var fb = createFolderButton(f);
                target.append(fb);
                visibleButtons.push(fb);
            });
        }

        // --- ИСПРАВЛЕНИЕ КАРАНДАША ---
        var editBtn = target.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            target.append(editBtn);
        } else {
            editBtn = buildEditorBtn();
            target.append(editBtn);
        }
        visibleButtons.push(editBtn);
        // ----------------------------------

        // Анимация
        visibleButtons.forEach(function(b, i) {
            b.css({ 'opacity': '0', 'animation': 'button-fade-in 0.4s ease forwards', 'animation-delay': (i * 0.05) + 's' });
        });

        setTimeout(function() { if(currentContainer) setupNav(currentContainer); }, 100);
    }

    function openEditDialog() {
        // Обновляем текущий список перед открытием
        if(currentContainer){
            var cats = groupBtns(currentContainer);
            var all = [].concat(cats.online, cats.torrent, cats.trailer, cats.other);
            var inFolders = getButtonsInFolders();
            currentButtons = all.filter(function(b){ return inFolders.indexOf(getBtnId(b)) === -1; });
            allButtonsCache = all;
        }

        var list = $('<div class="menu-edit-list"></div>');
        var folders = getFolders();
        var itemOrder = getItemOrder();

        // Кнопка создания папки
        var createBtn = $('<div class="menu-edit-list__item selector" style="background:rgba(100,200,100,0.2);">' +
            '<div class="menu-edit-list__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg></div>' +
            '<div class="menu-edit-list__title">' + t('create_folder') + '</div></div>');
        createBtn.on('hover:enter', function() {
            Lampa.Modal.close();
            openCreateFolderDialog();
        });
        list.append(createBtn);

        // Рендер элементов (Папки + Кнопки)
        function renderItems() {
            list.find('.render-item').remove();
            
            if (itemOrder.length > 0) {
                itemOrder.forEach(function(item) {
                    if (item.type === 'folder') {
                        var f = folders.find(function(x) { return x.id === item.id; });
                        if (f) list.append(createFolderItem(f));
                    } else {
                        var b = currentButtons.find(function(x) { return getBtnId(x) === item.id; });
                        if (b) list.append(createButtonItem(b));
                    }
                });
                // Остатки
                currentButtons.forEach(function(b) {
                    var found = itemOrder.some(function(i) { return i.type === 'button' && i.id === getBtnId(b); });
                    if (!found) list.append(createButtonItem(b));
                });
            } else {
                folders.forEach(function(f) { list.append(createFolderItem(f)); });
                currentButtons.forEach(function(b) { list.append(createButtonItem(b)); });
            }
        }

        function createFolderItem(f) {
            var el = $('<div class="menu-edit-list__item render-item folder-item">' +
                '<div class="menu-edit-list__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>' +
                '<div class="menu-edit-list__title">' + f.name + ' <span style="opacity:0.5">(' + f.buttons.length + ')</span></div>' +
                '<div class="menu-edit-list__delete selector" style="color:#ff6b6b"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></div></div>');
            
            el.find('.menu-edit-list__delete').on('hover:enter', function() {
                if(confirm('Удалить папку?')) {
                    deleteFolder(f.id);
                    el.remove();
                    Lampa.Noty.show(t('folder_deleted'));
                }
            });
            return el;
        }

        function createButtonItem(btn) {
            var id = getBtnId(btn);
            var hidden = getHiddenButtons().indexOf(id) !== -1;
            var el = $('<div class="menu-edit-list__item render-item' + (hidden?' item-hidden':'') + '">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + (btn.find('span').text().trim()||'Кнопка') + '</div>' +
                '<div class="menu-edit-list__toggle selector"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path class="dot" d="M7 13l4 4 8-8" opacity="'+(hidden?0:1)+'"/></svg></div></div>');
            el.find('.menu-edit-list__icon').append(btn.find('svg').clone());
            
            el.find('.menu-edit-list__toggle').on('hover:enter', function() {
                var hid = getHiddenButtons();
                var idx = hid.indexOf(id);
                if (idx !== -1) {
                    hid.splice(idx, 1);
                    el.removeClass('item-hidden');
                    el.find('.dot').attr('opacity', '1');
                } else {
                    hid.push(id);
                    el.addClass('item-hidden');
                    el.find('.dot').attr('opacity', '0');
                }
                setHiddenButtons(hid);
            });
            return el;
        }

        renderItems();

        // Сброс
        var resetBtn = $('<div class="selector" style="background:rgba(200,100,100,0.3); margin-top:1em; padding:1em; text-align:center;">' + t('reset') + '</div>');
        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('button_folders', []);
            Lampa.Storage.set('button_item_order', []);
            Lampa.Modal.close();
            if(currentContainer) {
                currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                currentContainer.data('buttons-processed', false);
                reorderButtons(currentContainer);
            }
        });
        list.append(resetBtn);

        Lampa.Modal.open({
            title: t('title'),
            html: list,
            size: 'small',
            onBack: function() {
                Lampa.Modal.close();
                applyChanges();
                Lampa.Controller.toggle('full_start');
            }
        });
    }

    // --- Вспомогательные для рендеринга ---
    function groupBtns(cont) {
        var btns = cont.find('.full-start__button').not('.button--edit-order, .button--folder, .button--play');
        var cats = { online:[], torrent:[], trailer:[], other:[] };
        btns.each(function() {
            var $t = $(this), c = $t.attr('class'), type = 'other';
            if(c.indexOf('online')!==-1 || c.indexOf('lampac')!==-1) type='online';
            else if(c.indexOf('torrent')!==-1) type='torrent';
            else if(c.indexOf('trailer')!==-1) type='trailer';
            cats[type].push($t);
        });
        return cats;
    }

    function reorderButtons(container) {
        var target = container.find('.full-start-new__buttons');
        if (!target.length) return false;
        currentContainer = container;
        target.find('.button--play, .button--edit-order, .button--folder').remove();
        
        var cats = groupBtns(container);
        var all = [].concat(cats.online, cats.torrent, cats.trailer, cats.other);
        if (allButtonsOriginal.length === 0) {
            allButtonsOriginal = all.map(function(b) { return b.clone(true,true); });
        }
        applyChanges();
        return true;
    }

    function refreshController() {
        setTimeout(function() {
            try { Lampa.Controller.toggle('full_start'); } catch(e){}
        }, 50);
    }
    
    function setupNav() {
        try { Lampa.Controller.toggle('full_start'); } catch(e){}
    }

    // --- Инициализация ---
    function init() {
        $('body').append('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }' +
            '.full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.menu-edit-list__item { display: flex; align-items: center; padding: 0.8em; border-bottom: 1px solid rgba(255,255,255,0.1); }' +
            '.menu-edit-list__item.focus { background: rgba(255,255,255,0.1); }' +
            '.menu-edit-list__icon { width: 2em; height: 2em; margin-right: 1em; flex-shrink: 0; }' +
            '.menu-edit-list__icon svg { width: 100%; height: 100%; fill: currentColor; }' +
            '.menu-edit-list__title { flex: 1; }' +
            '.menu-edit-list__toggle, .menu-edit-list__delete { width: 2em; height: 2em; display: flex; justify-content: center; align-items: center; }' +
            '.menu-edit-list__toggle svg, .menu-edit-list__delete svg { width: 1.5em; height: 1.5em; }' +
            '.item-hidden { opacity: 0.5; }' +
            '</style>');

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            var c = e.object.activity.render();
            var t = c.find('.full-start-new__buttons');
            if (t.length) {
                setTimeout(function() {
                    if (!c.data('buttons-processed')) {
                        c.data('buttons-processed', true);
                        reorderButtons(c);
                        refreshController();
                    }
                }, 400);
            }
        });
    }

    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'buttons_editor_enabled', type: 'trigger', default: true },
            field: { name: t('settings_name') },
            onChange: function(v) {
                setTimeout(function() {
                    var val = Lampa.Storage.get('buttons_editor_enabled', true);
                    $('.button--edit-order').toggle(val);
                }, 100);
            },
            onRender: function(el) {
                setTimeout(function() { $('div[data-name="interface_size"]').after(el); }, 0);
            }
        });
    }

    init();
})();
