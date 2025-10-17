(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    Lampa.Storage.set('parser_use', true);
    
    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    var servers = [
        '62.60.149.237:2601',
        'jacblack.ru:9117',
        '62.60.149.237:8443',
        'jr.maxvol.pro',
        'jac-red.ru',
        'jacred.viewbox.dev',
        'jacred.pro',
        'jacred.xyz'
    ];
    
    var parserNames = [
        'Lampa32',
        'ByLampa Jackett',
        'Jacred.xyz',
        'JR Maxvol Pro',
        'Jacred RU',
        'Viewbox',
        'Jacred Pro',
        'Jac Black'
    ];
    
    // HTML кнопки с onclick обработчиком
    var selectParserHtml = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><!-- SVG содержимое сокращено для читаемости --></svg></div><div style="font-size:1.0em"><div style="padding: 0.3em 0.3em; padding-top: 0;"><div style="background: #d99821; padding: 0.5em; border-radius: 0.4em; cursor:pointer;" onclick="createParserSelectMenu();"><div style="line-height: 0.3;">Выбрать парсер</div></div></div></div></div>';
    
    // Функция проверки одного парсера
    function checkParser(index) {
        setTimeout(function() {
            var key = servers[index] === 'jacblack.ru:9117' ? '34DPECDY' : '';
            var nextIndex = index + 2;
            protocol = servers[index] === 'jr.maxvol.pro' ? 'https://' : 'http://';
            
            var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + nextIndex + ') > div';
            
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') {
                return;
            }
            
            var url = protocol + servers[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + key;
            var xhr = new XMLHttpRequest();
            
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.send();
            
            xhr.ontimeout = function() {
                if ($(selector).text() === parserNames[index]) {
                    $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + parserNames[index] + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onerror = function() {
                if ($(selector).text() === parserNames[index]) {
                    $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + parserNames[index] + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onload = function() {
                if ($(selector).text() === parserNames[index]) {
                    if (xhr.status === 200) {
                        $(selector).html('&#10004;&nbsp;&nbsp;' + parserNames[index]).css('color', '#64e364');
                    } else {
                        $(selector).html('<span style="color: #ff2121;">&#10008;&nbsp;&nbsp;' + parserNames[index] + '</span>').css('color', '#ff2121');
                    }
                }
                if (xhr.status === 401) {
                    if ($(selector).text() === parserNames[index]) {
                        $(selector).html('<span style="color: #ff2121;">&#10008;&nbsp;&nbsp;' + parserNames[index] + '</span>').css('color', '#777');
                    }
                }
            };
        }, 1000);
    }
    
    function checkAllParsers() {
        for (var i = 0; i < servers.length; i++) {
            checkParser(i);
        }
    }
    
    // Обработчик события (если доступен)
    if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function(e) {
            if (e.name === 'parser') {
                setTimeout(checkAllParsers, 10);
            }
        });
    }
    
    // Функция настройки параметров парсера
    function setupParserSettings() {
        var current = Lampa.Storage.get('jackett_url');
        
        if (current === 'no_parser') {
            Lampa.Storage.set('jackett_url', '');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', false);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (current === 'jac_lampa32_ru') {
            Lampa.Storage.set('jackett_url', '62.60.149.237:2601');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (Lampa.Storage.get('jackett_urltwo') === 'bylampa_jackett') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '34DPECDY');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }
        if (current === 'jacred_xyz') {
            Lampa.Storage.set('jackett_url', 'jacred.xyz');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'healthy');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (current === 'jr_maxvol_pro') {
            Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (current === 'jacred_ru') {
            Lampa.Storage.set('jackett_url', 'https://jac-red.ru');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (current === 'jacred_viewbox_dev') {
            Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
            Lampa.Storage.set('jackett_key', '64e364');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (current === 'jacred_pro') {
            Lampa.Storage.set('jackett_url', 'jacred.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        if (current === 'jac_black') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
    }
    
    // Основная регистрация настроек
    if (Lampa.Settings && Lampa.Settings.main) {
        Lampa.Settings.main({
            component: 'parser',
            param: {
                name: 'jackett_urltwo',
                type: 'select',
                values: {
                    'no_parser': 'Без парсера',
                    'jac_lampa32_ru': 'Lampa32',
                    'bylampa_jackett': 'ByLampa Jackett',
                    'jacred_xyz': 'Jacred.xyz',
                    'jr_maxvol_pro': 'JR Maxvol Pro',
                    'jacred_ru': 'Jacred RU',
                    'jacred_viewbox_dev': 'Jacred Viewbox Dev',
                    'jacred_pro': 'Jacred Pro',
                    'jac_black': 'Jac Black'
                },
                default: 'jacred_xyz'
            },
            field: {
                name: 'Меню смены парсера',
                description: 'Нажмите для выбора парсера из списка'
            },
            onChange: function(value) {
                setupParserSettings();
                if (Lampa.Settings.update) Lampa.Settings.update();
            },
            onRender: function(html) {
                setTimeout(function() {
                    // Обработчик для пустого заголовка
                    $('.empty__title').off('hover:enter').on('hover:enter', function() {
                        Lampa.Settings.open();
                    });
                    
                    // Скрытие стандартных полей если настроен парсер
                    if (localStorage.getItem('jackett_url') !== 'no_parser' && localStorage.getItem('jackett_url') !== null) {
                        $('.settings-param__name').hide();
                        $('div[data-name="jackett_url"]').hide();
                        if (Lampa.Controller && Lampa.Controller.toggle) {
                            Lampa.Controller.toggle('settings_component');
                        }
                    }
                    
                    // Показываем кнопку если Jackett активен
                    if (Lampa.Storage.field && Lampa.Storage.field('parser_use') && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
                        html.show();
                        $(html).find('.selector').css('color', '#ffffff');
                        
                        // Безопасная вставка кнопки
                        var $keyField = $('div[data-name="jackett_key"]');
                        if ($keyField.length && !$keyField.next('.settings-folder').length) {
                            $keyField.after(selectParserHtml);
                        }
                    } else {
                        html.hide();
                    }
                }, 100);
            }
        });
    }
    
    // ИСПРАВЛЕННАЯ замена Storage.follow
    var storageCheckInterval = setInterval(function() {
        try {
            if (Lampa.Storage.field && Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
                $('div[data-name="jackett_urltwo"]').hide();
            } else if (Lampa.Storage.field && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
                $('div[data-name="jackett_urltwo"]').show();
                
                // ИСПРАВЛЕНИЕ: Создаем элемент вместо использования как селектора
                var $checkElement = $('<span style="color: #64e364;">&#10004;&nbsp;&nbsp;</span>');
                $('div[data-name="jackett_url"]').after($checkElement);
            }
        } catch(e) {
            console.log('Storage check error:', e);
        }
    }, 1000);
    
    // Инициализация по умолчанию
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', false)) {
                Lampa.Storage.set('jack', 'true');
                Lampa.Storage.set('jackett_url', 'jacred.xyz');
                Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'healthy');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                console.log('Установлен парсер по умолчанию: jacred.xyz');
            }
        }
    }, 100);
    
    // Глобальная функция меню выбора
    window.createParserSelectMenu = function() {
        var items = [
            {title: 'Lampa32', url: '62.60.149.237:2601', url_two: 'jac_lampa32_ru', jac_key: '', jac_int: 'false', jac_lang: 'lg'},
            {title: 'ByLampa Jackett', url: 'jacblack.ru:9117', url_two: 'bylampa_jackett', jac_key: '34DPECDY', jac_int: 'all', jac_lang: 'df'},
            {title: 'Jacred.xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', jac_key: '', jac_int: 'healthy', jac_lang: 'lg'},
            {title: 'JR Maxvol Pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', jac_key: '', jac_int: 'all', jac_lang: 'lg'},
            {title: 'Jacred RU', url: 'https://jac-red.ru', url_two: 'jacred_ru', jac_key: '', jac_int: 'false', jac_lang: 'lg'},
            {title: 'Jacred Viewbox Dev', url: 'jacred.viewbox.dev', url_two: 'jacred_viewbox_dev', jac_key: '64e364', jac_int: 'false', jac_lang: 'lg'},
            {title: 'Jacred Pro', url: 'jacred.pro', url_two: 'jacred_pro', jac_key: '', jac_int: 'all', jac_lang: 'lg'},
            {title: 'Jac Black', url: 'jacblack.ru:9117', url_two: 'jac_black', jac_key: '', jac_int: 'false', jac_lang: 'lg'}
        ];
        
        if (Lampa.Select && Lampa.Select.show) {
            // Проверка статусов парсеров
            Promise.all(items.map(function(item) {
                return new Promise(function(resolve) {
                    var apiUrl = (item.url.startsWith('http') ? '' : protocol) + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + item.jac_key;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', apiUrl, true);
                    xhr.timeout = 2000;
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            item.title = '&#10004;&nbsp;&nbsp;' + item.title;
                        } else {
                            item.title = '<span style="color: #ff2121;">&#10008;&nbsp;&nbsp;' + item.title + '</span>';
                        }
                        resolve(item);
                    };
                    xhr.onerror = xhr.ontimeout = function() {
                        item.title = '<span style="color: #ff2121;">&#10008;&nbsp;&nbsp;' + item.title + '</span>';
                        resolve(item);
                    };
                    xhr.send();
                });
            })).then(function(checkedItems) {
                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: checkedItems,
                    onBack: function() {
                        if (Lampa.Controller.toggle) Lampa.Controller.toggle(Lampa.Controller.activity().name);
                    },
                    onSelect: function(item) {
                        Lampa.Storage.set('jackett_url', item.url);
                        Lampa.Storage.set('jackett_urltwo', item.url_two);
                        Lampa.Storage.set('jackett_key', item.jac_key);
                        Lampa.Storage.set('jackett_interview', item.jac_int);
                        Lampa.Storage.set('parse_lang', item.jac_lang);
                        Lampa.Storage.set('parse_in_search', true);
                        setupParserSettings();
                        if (Lampa.Controller.toggle) Lampa.Controller.toggle(Lampa.Controller.activity().name);
                        setTimeout(function() { window.location.reload(); }, 1000);
                    }
                });
            });
        } else {
            console.log('Lampa.Select недоступен. Используйте консоль для выбора:');
            console.log(items);
        }
    };
    
    // Обработчик клика по кнопке
    $(document).on('click', '.settings-folder div[style*="d99821"]', function() {
        createParserSelectMenu();
    });
    
    console.log('Jackett Parser Module загружен. Используйте createParserSelectMenu() из консоли');
})();
