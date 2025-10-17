(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    // Проверка версии Lampa
    if (Lampa.Manifest.version !== 'Lampa32') {
        Lampa.Storage.set('no_parser', true);
        return;
    }
    
    Lampa.Storage.set('parser_use', true);
    
    // Определение протокола
    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    // Список серверов для проверки
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
    
    // Названия парсеров для отображения
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
    
    // HTML кнопки "Выбрать парсер"
    var selectParserHtml = '<div class="settings-folder" style="padding:0!important">' +
        '<div style="width:1.3em;height:1.3em;padding-right:.1em">' +
        '<svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000">' +
        // SVG содержимое (иконка)
        '<g id="SVGRepo_bgCarrier" stroke-width="0"></g>' +
        '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>' +
        '<g id="SVGRepo_iconCarrier">' +
        '<polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716 "></polygon>' +
        '<polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96 "></polygon>' +
        // ... остальные SVG элементы
        '</g></svg></div>' +
        '<div style="font-size:1.0em">' +
        '<div style="padding:0.3em 0.3em;padding-top:0;">' +
        '<div style="background:#d99821;padding:0.5em;border-radius:0.4em;">' +
        '<div style="line-height:0.3;">Выбрать парсер</div></div></div></div></div>';
    
    // API ключ для jacblack.ru
    var jacblackKey = '34DPECDY';
    var viewboxKey = '64e364';
    
    // Функция проверки доступности одного парсера
    function checkParser(index) {
        setTimeout(function() {
            var key = '';
            if (servers[index] === 'jacblack.ru:9117') {
                key = jacblackKey;
            }
            
            var displayIndex = index + 2;
            if (servers[index] === 'jr.maxvol.pro') {
                protocol = 'https://';
            } else {
                protocol = 'http://';
            }
            
            var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + displayIndex + ') > div';
            
            // Проверяем, открыт ли список с "Свой вариант"
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') {
                return;
            }
            
            var apiUrl = protocol + servers[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + key;
            var xhr = new XMLHttpRequest();
            
            xhr.timeout = 3000;
            xhr.open('GET', apiUrl, true);
            xhr.send();
            
            // Таймаут
            xhr.ontimeout = function() {
                if ($(selector).text() === parserNames[index]) {
                    $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            // Ошибка сети
            xhr.onerror = function() {
                if ($(selector).text() === parserNames[index]) {
                    $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            // Успешный ответ
            xhr.onload = function() {
                if (xhr.status === 200) {
                    if ($(selector).text() === parserNames[index]) {
                        $(selector).html('✔&nbsp;&nbsp;' + $(selector).text()).css('color', '#64e364');
                    }
                } else {
                    if ($(selector).text() === parserNames[index]) {
                        $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                    }
                }
                
                // Ошибка авторизации (401)
                if (xhr.status === 401) {
                    if ($(selector).text() === parserNames[index]) {
                        $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#777');
                    }
                }
            };
        }, 1000);
    }
    
    // Проверка всех парсеров
    function checkAllParsers() {
        for (var i = 0; i < servers.length; i++) {
            checkParser(i);
        }
    }
    
    // Обработчик открытия меню парсера
    Lampa.Listener.follow('app', function(e) {
        if (e.name === 'parser') {
            setTimeout(checkAllParsers, 10);
        }
    });
    
    // Настройка параметров парсера
    function setupParserSettings() {
        var currentParser = Lampa.Storage.get('jackett_url');
        
        // Отключить парсер
        if (currentParser === 'no_parser') {
            Lampa.Storage.set('jackett_url', '');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', false);
            Lampa.Storage.set('parse_lang', 'lg');
            return;
        }
        
        // Lampa32 RU
        if (currentParser === 'jac_lampa32_ru') {
            Lampa.Storage.set('jackett_url', '62.60.149.237:2601');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // ByLampa Jackett
        if (Lampa.Storage.get('jackett_urltwo') === 'bylampa_jackett') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', jacblackKey);
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }
        
        // Jacred.xyz
        if (currentParser === 'jacred_xyz') {
            Lampa.Storage.set('jackett_url', 'jacred.xyz');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'healthy');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // JR Maxvol Pro
        if (currentParser === 'jr_maxvol_pro') {
            Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jacred RU
        if (currentParser === 'jacred_ru') {
            Lampa.Storage.set('jackett_url', 'https://jac-red.ru');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jacred Pro
        if (currentParser === 'jacred_pro') {
            Lampa.Storage.set('jackett_url', 'jacred.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jac Black
        if (currentParser === 'jac_black') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jacred Viewbox Dev
        if (currentParser === 'jacred_viewbox_dev') {
            Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
            Lampa.Storage.set('jackett_key', viewboxKey);
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
    }
    
    // Основная настройка в меню
    Lampa.Settings.main({
        component: 'parser',
        param: {
            name: 'jackett_urltwo',
            type: 'select',
            values: {
                'no_parser': 'no_parser',
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
            if (Lampa.Settings.update) {
                Lampa.Settings.update();
            }
        },
        onRender: function(html) {
            setTimeout(function() {
                // Клик по пустому заголовку открывает настройки
                $('.empty__title').on('hover:enter', function() {
                    Lampa.Settings.open();
                });
                
                // Если уже настроен парсер, скрываем стандартные поля
                if (localStorage.getItem('jackett_url') !== 'no_parser') {
                    $('.settings-param__name').hide();
                    $('div[data-name="jackett_url"]').hide();
                    Lampa.Controller.toggle('settings_component');
                }
                
                // Если Jackett активен, показываем нашу кнопку
                if (Lampa.Storage.field('parser_use') && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
                    html.show();
                    $(html.find('.selector'), html).css('color', '#ffffff');
                    
                    // Вставляем HTML кнопку "Выбрать парсер"
                    $('div[data-name="jackett_key"]').after(selectParserHtml);
                } else {
                    html.hide();
                }
            }, 5);
        }
    });
    
    // Удаляем проблемный main_context (вызывает ошибку)
    // Вместо этого используем follow для скрытия полей
    /*
    Lampa.Settings.main_context({
        url: 'torrents',
        html: function(html) {
            html.find('[data-name="jackett_url2"]').remove();
            html.find('[data-name="jackett_key"]').remove();
        }
    });
    */
    
    // Отслеживание активности парсера
    Lampa.Storage.follow('parser', function(e) {
        if (Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
            $('div[data-name="jackett_urltwo"]').hide();
        } else {
            $('div[data-name="jackett_urltwo"]').show();
            $('div[data-name="jackett_url"]').insertAfter('✔&nbsp;&nbsp;');
        }
    });
    
    // Инициализация по умолчанию
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            
            if (!Lampa.Storage.get('jack', false)) {
                // Устанавливаем Jacred.xyz по умолчанию
                Lampa.Storage.set('jack', 'true');
                Lampa.Storage.set('jackett_url', 'jacred.xyz');
                Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'healthy');
                Lampa.Storage.set('parse_lang', 'lg');
                
                console.log('Установлен парсер по умолчанию: jacred.xyz');
            }
        }
    }, 100);
    
    // Функция создания меню выбора парсера (вызывается при клике на кнопку)
    function createParserSelectMenu() {
        var currentActivity = Lampa.Controller.activity().name;
        var items = [];
        
        // Lampa32
        items.push({
            title: 'Lampa32',
            url: '62.60.149.237:2601',
            url_two: 'jac_lampa32_ru',
            jac_key: '',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        // ByLampa Jackett
        items.push({
            title: 'ByLampa Jackett',
            url: 'jacblack.ru:9117',
            url_two: 'bylampa_jackett',
            jac_key: jacblackKey,
            jac_int: 'all',
            jac_lang: 'df'
        });
        
        // Jacred.xyz
        items.push({
            title: 'Jacred.xyz',
            url: 'jacred.xyz',
            url_two: 'jacred_xyz',
            jac_key: '',
            jac_int: 'healthy',
            jac_lang: 'lg'
        });
        
        // JR Maxvol Pro
        items.push({
            title: 'JR Maxvol Pro',
            url: 'jr.maxvol.pro',
            url_two: 'jr_maxvol_pro',
            jac_key: '',
            jac_int: 'all',
            jac_lang: 'lg'
        });
        
        // Jacred RU
        items.push({
            title: 'Jacred RU',
            url: 'https://jac-red.ru',
            url_two: 'jacred_ru',
            jac_key: '',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        // Jacred Viewbox Dev
        items.push({
            title: 'Jacred Viewbox Dev',
            url: 'jacred.viewbox.dev',
            url_two: 'jacred_viewbox_dev',
            jac_key: viewboxKey,
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        // Jacred Pro
        items.push({
            title: 'Jacred Pro',
            url: 'jacred.pro',
            url_two: 'jacred_pro',
            jac_key: '',
            jac_int: 'all',
            jac_lang: 'lg'
        });
        
        // Jac Black
        items.push({
            title: 'Jac Black',
            url: 'jacblack.ru:9117',
            url_two: 'jac_black',
            jac_key: '',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        // Проверяем статусы парсеров
        function checkParserStatus(item) {
            return new Promise(function(resolve) {
                var checkProtocol = item.url.startsWith('http') ? '' : protocol;
                var apiUrl = checkProtocol + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + item.jac_key;
                var xhr = new XMLHttpRequest();
                
                xhr.open('GET', apiUrl, true);
                xhr.timeout = 3000;
                
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        item.title = '<span style="color: #64e364;">✔&nbsp;&nbsp;' + item.title + '</span>';
                    } else {
                        item.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
                    }
                    resolve(item);
                };
                
                xhr.onerror = xhr.ontimeout = function() {
                    item.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
                    resolve(item);
                };
                
                xhr.send();
            });
        }
        
        Promise.all(items.map(checkParserStatus))
            .then(function(checkedItems) {
                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: checkedItems.map(function(item) {
                        return {
                            title: item.title,
                            url: item.url,
                            url_two: item.url_two,
                            jac_key: item.jac_key,
                            jac_int: item.jac_int,
                            jac_lang: item.jac_lang
                        };
                    }),
                    onBack: function() {
                        Lampa.Controller.toggle(currentActivity);
                    },
                    onSelect: function(selectedItem) {
                        // Сохраняем настройки
                        Lampa.Storage.set('jackett_url', selectedItem.url);
                        Lampa.Storage.set('jackett_urltwo', selectedItem.url_two);
                        Lampa.Storage.set('jackett_key', selectedItem.jac_key);
                        Lampa.Storage.set('jackett_interview', selectedItem.jac_int);
                        Lampa.Storage.set('parse_lang', selectedItem.jac_lang);
                        Lampa.Storage.set('parse_in_search', true);
                        
                        Lampa.Controller.toggle(currentActivity);
                        
                        // Перезагружаем активность
                        var currentUrl = Lampa.Storage.field('select');
                        setTimeout(function() {
                            window.location.reload();
                        }, 1000);
                        
                        setTimeout(function() {
                            Lampa.Activity.push(currentUrl);
                        }, 2000);
                    }
                });
            })
            .catch(function(error) {
                console.error('Error:', error);
                // Fallback без проверки
                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: items,
                    onSelect: function(item) {
                        Lampa.Storage.set('jackett_url', item.url);
                        Lampa.Storage.set('jackett_urltwo', item.url_two);
                        Lampa.Storage.set('jackett_key', item.jac_key);
                        Lampa.Storage.set('jackett_interview', item.jac_int);
                        Lampa.Storage.set('parse_lang', item.jac_lang);
                        Lampa.Storage.set('parse_in_search', true);
                        window.location.reload();
                    }
                });
            });
    }
    
    // Привязываем обработчик к кнопке "Выбрать парсер"
    $(document).on('click', '.settings-folder div:contains("Выбрать парсер")', function() {
        createParserSelectMenu();
    });
    
    console.log('Jackett Parser Selector загружен');
})();
