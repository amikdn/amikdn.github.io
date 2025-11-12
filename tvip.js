;(function () {
    'use strict';
    var plugin = {
        component: 'hack_tv_iptv',
        icon: "<svg height=\"244\" viewBox=\"0 0 260 244\" xmlns=\"http://www.w3.org/2000/svg\" style=\"fill-rule:evenodd;\" fill=\"currentColor\"><path d=\"M259.5 47.5v114c-1.709 14.556-9.375 24.723-23 30.5a2934.377 2934.377 0 0 1-107 1.5c-35.704.15-71.37-.35-107-1.5-13.625-5.777-21.291-15.944-23-30.5v-115c1.943-15.785 10.61-25.951 26-30.5a10815.71 10815.71 0 0 1 208 0c15.857 4.68 24.523 15.18 26 31.5zm-230-13a4963.403 4963.403 0 0 0 199 0c5.628 1.128 9.128 4.462 10.5 10 .667 40 .667 80 0 120-1.285 5.618-4.785 8.785-10.5 9.5-66 .667-132 .667-198 0-5.715-.715-9.215-3.882-10.5-9.5-.667-40-.667-80 0-120 1.35-5.18 4.517-8.514 9.5-10z\"/><path d=\"M70.5 71.5c17.07-.457 34.07.043 51 1.5 5.44 5.442 5.107 10.442-1 15-5.991.5-11.991.666-18 .5.167 14.337 0 28.671-.5 43-3.013 5.035-7.18 6.202-12.5 3.5a11.529 11.529 0 0 1-3.5-4.5 882.407 882.407 0 0 1-.5-42c-5.676.166-11.343 0-17-.5-4.569-2.541-6.069-6.375-4.5-11.5 1.805-2.326 3.972-3.992 6.5-5zM137.5 73.5c4.409-.882 7.909.452 10.5 4a321.009 321.009 0 0 0 16 30 322.123 322.123 0 0 0 16-30c2.602-3.712 6.102-4.879 10.5-3.5 5.148 3.334 6.314 7.834 3.5 13.5a1306.032 1306.032 0 0 0-22 43c-5.381 6.652-10.715 6.652-16 0a1424.647 1424.647 0 0 0-23-45c-1.691-5.369-.191-9.369 4.5-12zM57.5 207.5h144c7.788 2.242 10.288 7.242 7.5 15a11.532 11.532 0 0 1-4.5 3.5c-50 .667-100 .667-150 0-6.163-3.463-7.496-8.297-4-14.5 2.025-2.064 4.358-3.398 7-4z\"/></svg>",
        name: 'Hack TV'
    };

    var lists = [];
    var catalog = {};
    var encoder = $('<div/>');

    // Функция для загрузки плейлиста
    function loadPlaylist(url, success, fail) {
        console.log('Hack TV', 'Loading playlist from:', url);
        var network = new Lampa.Reguest();
        network.silent(
            url,
            function(data) {
                console.log('Hack TV', 'Playlist loaded successfully:', data.substring(0, 100) + '...');
                var channels = parsePlaylist(data);
                console.log('Hack TV', 'Parsed channels:', channels);
                typeof success === 'function' && success(channels);
            },
            function(error) {
                console.error('Hack TV', 'Error loading playlist:', error);
                typeof fail === 'function' && fail(error);
            },
            false,
            {
                dataType: 'text'
            }
        );
    }

    // Функция для парсинга M3U плейлиста
    function parsePlaylist(data) {
        var channels = [];
        var lines = data.split('\n');
        console.log('Hack TV', 'Parsing playlist with', lines.length, 'lines');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
                var titleMatch = line.match(/,(.+)/);
                var title = titleMatch ? titleMatch[1] : 'Unknown';
                var logoMatch = line.match(/tvg-logo="([^"]+)"/);
                var epgIdMatch = line.match(/tvg-id="([^"]+)"/);
                var currentChannel = {
                    Title: title,
                    Logo: logoMatch ? logoMatch[1] : '',
                    epgId: epgIdMatch ? epgIdMatch[1] : '',
                    Url: ''
                };
                console.log('Hack TV', 'Found channel:', currentChannel.Title);
                channels.push(currentChannel);
            } else if (line && !line.startsWith('#') && channels.length > 0) {
                channels[channels.length - 1].Url = line;
                console.log('Hack TV', 'Channel URL:', line);
            }
        }
        console.log('Hack TV', 'Total channels parsed:', channels.length);
        return channels;
    }

    // Функция pluginPage
    function pluginPage(object) {
        var _this = this;
        _this.activity = object;
        _this.catalog = {};
        _this.html = $('<div></div>');
        _this.body = $('<div class="' + plugin.component + ' category-full"></div>');
        _this.scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            step: 250
        });
        _this.network = new Lampa.Reguest();

        _this.append = function(data) {
            console.log('Hack TV', 'Appending', data.length, 'channels to body');
            data.forEach(function(channel) {
                var card = Lampa.Template.get('card', {
                    title: channel.Title,
                    img: channel.Logo || '',
                    release_year: ''
                });
                card.addClass('card--collection');
                card.on('hover:enter', function() {
                    console.log('Hack TV', 'Playing channel:', channel.Title);
                    var video = {
                        title: channel.Title,
                        url: channel.Url,
                        plugin: plugin.component,
                        tv: true
                    };
                    Lampa.Player.play(video);
                    Lampa.Player.playlist([{
                        title: channel.Title,
                        url: channel.Url,
                        plugin: plugin.component,
                        tv: true
                    }]);
                });
                _this.body.append(card);
            });
        };

        _this.build = function(data) {
            console.log('Hack TV', 'Building UI with', data.length, 'channels');
            Lampa.Background.change();
            _this.html.append(_this.scroll.render());
            _this.scroll.append(_this.body);
            if (data.length) {
                _this.append(data);
            } else {
                console.log('Hack TV', 'No channels to display, showing empty page');
                var empty = new Lampa.Empty();
                _this.html.append(empty.render());
            }
            _this.activity.loader(false);
            _this.activity.toggle();
        };

        _this.start = function() {
            console.log('Hack TV', 'Starting activity:', _this.activity);
            if (Lampa.Activity.active().activity !== _this.activity) {
                console.log('Hack TV', 'Activity mismatch, aborting start');
                return;
            }
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(_this.scroll.render());
                    Lampa.Controller.collectionFocus(false, _this.scroll.render());
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function() {
                    if (Navigator.canmove('right')) Navigator.move('right');
                },
                up: function() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function() {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function() {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        _this.render = function() {
            console.log('Hack TV', 'Rendering plugin page');
            return _this.html;
        };

        _this.destroy = function() {
            console.log('Hack TV', 'Destroying plugin page');
            _this.network.clear();
            _this.scroll.destroy();
            _this.html.remove();
            _this.body.remove();
        };

        // Загрузка плейлиста
        console.log('Hack TV', 'Initializing pluginPage for activity:', object);
        _this.activity.loader(true);
        var playlistUrl = Lampa.Storage.get(plugin.component + '_playlist_url', 'http://amikdn.github.io/tv.m3u');
        console.log('Hack TV', 'Starting playlist load for URL:', playlistUrl);
        loadPlaylist(playlistUrl, function(channels) {
            console.log('Hack TV', 'Successfully loaded', channels.length, 'channels');
            _this.catalog['Channels'] = {
                title: 'Channels',
                channels: channels
            };
            _this.build(channels);
        }, function(error) {
            console.error('Hack TV', 'Failed to load playlist:', error);
            _this.build([]);
        });

        return _this;
    }

    // Инициализация Lampa.Lang
    if (!Lampa.Lang) {
        console.log('Hack TV', 'Initializing Lampa.Lang');
        var lang_data = {};
        Lampa.Lang = {
            add: function(data) {
                lang_data = Object.assign(lang_data, data);
                console.log('Hack TV', 'Language data added:', Object.keys(data));
            },
            translate: function(key) {
                var translation = lang_data[key] ? lang_data[key].ru : key;
                console.log('Hack TV', 'Translating key:', key, '->', translation);
                return translation;
            }
        };
    }

    var langData = {};
    function langAdd(name, values) {
        var key = plugin.component + '_' + name;
        langData[key] = values;
        Lampa.Lang.add({ [key]: values });
        console.log('Hack TV', 'Added language key:', key, values);
    }
    function langGet(name) {
        var key = plugin.component + '_' + name;
        var translation = Lampa.Lang.translate(key);
        return translation === key ? (langData[key]?.ru || name) : translation;
    }

    // Добавление переводов
    langAdd('categories', { ru: 'Категории' });
    langAdd('favorites', { ru: 'Избранное' });
    langAdd('favorites_add', { ru: 'Добавить в избранное' });
    langAdd('favorites_del', { ru: 'Удалить из избранного' });
    langAdd('favorites_clear', { ru: 'Очистить избранное' });
    langAdd('favorites_move_top', { ru: 'В начало списка' });
    langAdd('favorites_move_up', { ru: 'Сдвинуть вверх' });
    langAdd('favorites_move_down', { ru: 'Сдвинуть вниз' });
    langAdd('favorites_move_end', { ru: 'В конец списка' });
    langAdd('epg_on', { ru: 'Включить телепрограмму' });
    langAdd('epg_off', { ru: 'Отключить телепрограмму' });
    langAdd('epg_title', { ru: 'Телепрограмма' });
    langAdd('square_icons', { ru: 'Квадратные лого каналов' });
    langAdd('contain_icons', { ru: 'Коррекция размера логотипа телеканала' });
    langAdd('contain_icons_desc', { ru: 'Может некорректно работать на старых устройствах' });
    langAdd('settings_title', { ru: 'Hack TV PlayList' });
    langAdd('playlist_url', { ru: 'Ссылка на плейлист' });
    langAdd('playlist_url_desc', { ru: 'Введите URL плейлиста (например, http://example.com/playlist.m3u)' });

    // Функции для работы с хранилищем
    function getStorage(name, defaultValue) {
        var value = Lampa.Storage.get(plugin.component + '_' + name, defaultValue);
        console.log('Hack TV', 'Get storage:', plugin.component + '_' + name, '->', value);
        return value;
    }

    function setStorage(name, val, noListen) {
        console.log('Hack TV', 'Set storage:', plugin.component + '_' + name, '->', val);
        return Lampa.Storage.set(plugin.component + '_' + name, val, noListen);
    }

    function getSettings(name) {
        var value = Lampa.Storage.field(plugin.component + '_' + name);
        console.log('Hack TV', 'Get settings:', plugin.component + '_' + name, '->', value);
        return value;
    }

    function addSettings(type, param) {
        console.log('Hack TV', 'Adding setting:', param.name);
        var data = {
            component: plugin.component,
            param: {
                name: plugin.component + '_' + param.name,
                type: type,
                values: param.values || '',
                placeholder: param.placeholder || '',
                default: (typeof param.default === 'undefined') ? '' : param.default
            },
            field: {
                name: param.title || param.name || '',
                icon: plugin.icon
            }
        };
        if (param.description) data.field.description = param.description;
        if (param.onChange) data.onChange = param.onChange;
        try {
            Lampa.SettingsApi.addParam(data);
            console.log('Hack TV', 'Setting added:', data.param.name);
        } catch (e) {
            console.error('Hack TV', 'Error adding setting:', data.param.name, e);
        }
    }

    // Регистрация компонента
    Lampa.Component.add(plugin.component, pluginPage);

    // Инициализация настроек
    function initSettings() {
        console.log('Hack TV', 'Initializing settings');
        try {
            Lampa.SettingsApi.addComponent({
                component: plugin.component,
                name: langGet('settings_title') || 'Hack TV PlayList',
                icon: plugin.icon,
                onOpen: function() {
                    console.log('Hack TV', 'Opening settings');
                    var settingsContainer = $('div[data-component="' + plugin.component + '"]');
                    if (settingsContainer.length) {
                        settingsContainer.empty();
                        settingsContainer.append(
                            $('<div class="settings-param selector" data-type="input" data-name="' + plugin.component + '_playlist_url">' +
                              '<div class="settings-param__name">' + langGet('playlist_url') + '</div>' +
                              '<div class="settings-param__value"></div>' +
                              '<div class="settings-param__descr">' + langGet('playlist_url_desc') + '</div>' +
                              '</div>')
                        );
                        settingsContainer.append(
                            $('<div class="settings-param selector" data-type="toggle" data-name="' + plugin.component + '_square_icons">' +
                              '<div class="settings-param__name">' + langGet('square_icons') + '</div>' +
                              '<div class="settings-param__value"></div>' +
                              '</div>')
                        );
                        settingsContainer.append(
                            $('<div class="settings-param selector" data-type="toggle" data-name="' + plugin.component + '_contain_icons">' +
                              '<div class="settings-param__name">' + langGet('contain_icons') + '</div>' +
                              '<div class="settings-param__value"></div>' +
                              '<div class="settings-param__descr">' + langGet('contain_icons_desc') + '</div>' +
                              '</div>')
                        );
                        settingsContainer.find('div[data-name="' + plugin.component + '_playlist_url"] .settings-param__value').text(getStorage('playlist_url', ''));
                        settingsContainer.find('div[data-name="' + plugin.component + '_square_icons"] .settings-param__value').text(getSettings('square_icons') || 'false');
                        settingsContainer.find('div[data-name="' + plugin.component + '_contain_icons"] .settings-param__value').text(getSettings('contain_icons') || 'true');
                        settingsContainer.find('div[data-name="' + plugin.component + '_playlist_url"]').on('hover:enter hover:click', function() {
                            Lampa.Input.edit({
                                value: getStorage('playlist_url', ''),
                                title: langGet('playlist_url'),
                                onChange: function(value) {
                                    console.log('Hack TV', 'Playlist URL changed:', value);
                                    setStorage('playlist_url', value);
                                    Lampa.Activity.replace(Lampa.Arrays.clone(lists[0].activity));
                                },
                                onBack: function() {
                                    Lampa.Controller.toggle('content');
                                }
                            });
                        });
                        console.log('Hack TV', 'Settings fields rendered');
                    } else {
                        console.error('Hack TV', 'Settings container not found');
                    }
                }
            });
            console.log('Hack TV', 'Settings component registered');

            addSettings('input', {
                title: langGet('playlist_url'),
                name: 'playlist_url',
                placeholder: 'http://example.com/playlist.m3u',
                default: getStorage('playlist_url', ''),
                description: langGet('playlist_url_desc'),
                onChange: function(v) {
                    console.log('Hack TV', 'Playlist URL changed:', v);
                    setStorage('playlist_url', v);
                }
            });
            addSettings('trigger', {
                title: langGet('square_icons'),
                name: 'square_icons',
                default: false,
                onChange: function(v) {
                    console.log('Hack TV', 'Square icons toggled:', v);
                    $('.hack_tv_iptv.category-full').toggleClass('square_icons', v === 'true');
                    setStorage('square_icons', v);
                }
            });
            addSettings('trigger', {
                title: langGet('contain_icons'),
                name: 'contain_icons',
                default: true,
                description: langGet('contain_icons_desc'),
                onChange: function(v) {
                    console.log('Hack TV', 'Contain icons toggled:', v);
                    $('.hack_tv_iptv.category-full').toggleClass('contain_icons', v === 'true');
                    setStorage('contain_icons', v);
                }
            });
        } catch (e) {
            console.error('Hack TV', 'Error initializing settings:', e);
        }
    }

    // Инициализация меню
    var activity = {
        id: 0,
        url: getStorage('playlist_url', 'http://amikdn.github.io/playlist.m3u8'),
        title: plugin.name,
        component: plugin.component,
        page: 1
    };
    var menuEl = $('<li class="menu__item selector js-' + plugin.component + '-menu0">' +
        '<div class="menu__ico">' + plugin.icon + '</div>' +
        '<div class="menu__text js-' + plugin.component + '-menu0-title">' +
        encoder.text(plugin.name).html() +
        '</div>' +
        '</li>')
        .on('hover:enter hover:click', function() {
            console.log('Hack TV', 'Menu item clicked, pushing activity:', activity);
            Lampa.Activity.push(Lampa.Arrays.clone(activity));
        });

    lists.push({activity: activity, menuEl: menuEl});

    function pluginStart() {
        if (window['plugin_' + plugin.component + '_ready']) {
            console.log('Hack TV', 'Plugin already initialized, skipping');
            return;
        }
        window['plugin_' + plugin.component + '_ready'] = true;
        console.log('Hack TV', 'Starting plugin initialization');
        try {
            // Пробуем разные селекторы для меню
            var menuSelectors = [
                '.menu .menu__list',
                '.menu__list',
                '.menu ul',
                'ul.menu__list',
                'nav.menu ul'
            ];
            var menuAdded = false;
            for (var i = 0; i < menuSelectors.length; i++) {
                var menu = $(menuSelectors[i]).eq(0);
                if (menu.length) {
                    menu.append(menuEl);
                    menuEl.show();
                    console.log('Hack TV', 'Menu item added to:', menuSelectors[i]);
                    menuAdded = true;
                    break;
                }
            }
            if (!menuAdded) {
                console.error('Hack TV', 'No menu elements found for selectors:', menuSelectors);
            }
        } catch (e) {
            console.error('Hack TV', 'Error adding menu item:', e);
        }
    }

    initSettings();
    pluginStart();

    if (window.appready) {
        console.log('Hack TV', 'App already ready, calling pluginStart');
        pluginStart();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('Hack TV', 'App ready event, calling pluginStart');
                pluginStart();
            }
        });
    }

    // Удаление дублирующих компонентов настроек
    Lampa.Settings.listener.follow('open', function(e) {
        if (e.name === 'main') {
            console.log('Hack TV', 'Settings main opened, removing duplicate component');
            setTimeout(function() {
                $('div[data-component="' + plugin.component + '"]').not(':last').remove();
            }, 0);
        }
    });

    // Обработка активности
    Lampa.Listener.follow('activity', function(a) {
        console.log('Hack TV', 'Activity event:', a.name, a.activity);
        if (a.activity && a.activity.component === plugin.component) {
            console.log('Hack TV', 'Registering render for activity:', a.activity);
            a.activity.render = function() {
                console.log('Hack TV', 'Rendering activity for component:', plugin.component);
                return (new pluginPage(a.activity)).render();
            };
        }
    });
})();

