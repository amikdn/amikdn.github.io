(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    // Проверка версии Lampa
    if (Lampa.Manifest.version !== 'Lampa32') {
        Lampa.Storage.set('no_parser', true);
        return;
    }
    
    Lampa.Storage.set('parser_use', true);
    
    // Определяем протокол
    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    // Список доступных парсеров
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
        'Jacred RU',
        'Lampa Jackett',
        'Jacred.xyz',
        'JR Maxvol Pro',
        'Jacred RU',
        'Jacred Viewbox Dev',
        'Jac Pro',
        'Jac Black'
    ];
    
    // Функция проверки доступности парсера
    function checkParser(index) {
        setTimeout(function() {
            var key = '';
            if (servers[index] == 'jacblack.ru:9117') {
                key = '34DPECDY';
            }
            
            var nextIndex = index + 2;
            if (servers[index] == 'jr.maxvol.pro') {
                protocol = 'https://';
            } else {
                protocol = 'http://';
            }
            
            var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + nextIndex + ') > div';
            
            // Проверяем, выбран ли "Свой вариант"
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') {
                return;
            }
            
            var url = protocol + servers[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + key;
            var xhr = new XMLHttpRequest();
            
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.send();
            
            xhr.ontimeout = function() {
                if ($(selector).text() == parserNames[index]) {
                    $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onerror = function() {
                if ($(selector).text() == parserNames[index]) {
                    $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onload = function() {
                if (xhr.status == 200) {
                    if ($(selector).text() == parserNames[index]) {
                        $(selector).html('✔&nbsp;&nbsp;' + $(selector).text()).css('color', '#64e364');
                    }
                } else {
                    if ($(selector).text() == parserNames[index]) {
                        $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                    }
                }
                
                if (xhr.status == 401) {
                    if ($(selector).text() == parserNames[index]) {
                        $(selector).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#777');
                    }
                }
            };
        }, 1000);
    }
    
    // Запуск проверки всех парсеров
    function checkAllParsers() {
        for (var i = 0; i <= servers.length - 1; i++) {
            checkParser(i);
        }
    }
    
    // Обработчик события меню
    Lampa.Listener.follow('app', function(e) {
        if (e.name == 'parser') {
            setTimeout(function() {
                checkAllParsers();
            }, 10);
        }
    });
    
    // Функция настройки параметров парсера
    function setupParser() {
        // Если нет парсера
        if (Lampa.Storage.get('jackett_url') == 'no_parser') {
            Lampa.Storage.set('jackett_url', '');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', false);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Lampa32 RU
        if (Lampa.Storage.get('jackett_url') == 'jac_lampa32_ru') {
            Lampa.Storage.set('jackett_url', '62.60.149.237:2601');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Lampa Jackett
        if (Lampa.Storage.get('jackett_urltwo') == 'lampa_jackett') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '34DPECDY');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }
        
        // Jacred.xyz
        if (Lampa.Storage.get('jackett_url') == 'jacred_xyz') {
            Lampa.Storage.set('jackett_url', 'jacred.xyz');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'healthy');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // JR Maxvol Pro
        if (Lampa.Storage.get('jackett_url') == 'jr_maxvol_pro') {
            Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jacred RU
        if (Lampa.Storage.get('jackett_url') == 'jacred_ru') {
            Lampa.Storage.set('jackett_url', 'https://jac-red.ru');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jacred Pro
        if (Lampa.Storage.get('jackett_url') == 'jacred_pro') {
            Lampa.Storage.set('jackett_url', 'jacred.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jac Black
        if (Lampa.Storage.get('jackett_url') == 'jac_black') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        // Jacred Viewbox Dev
        if (Lampa.Storage.get('jackett_url') == 'jacred_viewbox_dev') {
            Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
            Lampa.Storage.set('jackett_key', '64e364');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
    }
    
    // Добавление настройки выбора парсера
    Lampa.Settings.main({
        component: 'parser',
        param: {
            name: 'jackett_urltwo',
            type: 'select',
            values: {
                'no_parser': 'no_parser',
                'jac_lampa32_ru': 'Lampa32',
                'lampa_jackett': 'Lampa Jackett',
                'jacred_xyz': 'Jacred.xyz',
                'jr_maxvol_pro': 'JR Maxvol Pro',
                'jacred_ru': 'Jacred RU',
                'jacred_viewbox_dev': 'Jacred Viewbox Dev',
                'jacred_pro': 'Jac Pro',
                'jac_black': 'Jac Black'
            },
            'default': 'jacred_xyz'
        },
        field: {
            name: 'Меню смены парсера',
            description: 'Нажмите для выбора парсера из списка'
        },
        onChange: function(value) {
            setupParser();
            Lampa.Settings.update();
        },
        onRender: function(html) {
            setTimeout(function() {
                // Обработчик клика по пустому заголовку
                $('.empty__title').on('hover:enter', function() {
                    Lampa.Settings.open();
                });
                
                // Проверяем, не установлен ли уже парсер
                if (localStorage.getItem('jackett_url') !== 'no_parser') {
                    $('.settings-param__name').hide();
                    $('div[data-name="jackett_url"]').hide();
                    Lampa.Controller.toggle('settings_component');
                }
                
                // Показываем поля Jackett если активен
                if (Lampa.Storage.field('parser_torrent_type') && Lampa.Storage.field('parser_use') == 'jackett') {
                    html.show();
                    $(html.find('.selector'), html).css('color', '#ffffff');
                    $('div[data-name="jackett_key"]').after('<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg>...</svg></div><div style="font-size:1.0em"><div style="padding: 0.3em 0.3em; padding-top: 0;"><div style="background: #d99821; padding: 0.5em; border-radius: 0.4em;"><div style="line-height: 0.3;">Выбрать парсер</div></div></div></div></div>');
                } else {
                    html.hide();
                }
            }, 5);
        }
    });
    
    // Скрытие полей при определенных условиях
    Lampa.Settings.main_context({
        'url': 'torrents',
        html: function(html) {
            html.find('[data-name="jackett_url2"]').remove();
            html.find('[data-name="jackett_key"]').remove();
        }
    });
    
    // Отслеживание активности
    Lampa.Storage.follow('parser', function(e) {
        if (Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
            $('div[data-name="jackett_urltwo"]').hide();
        } else {
            $('div[data-name="jackett_urltwo"]').show();
            $('div[data-name="jackett_url"]').insertAfter('&#10004;&nbsp;&nbsp;');
        }
    });
    
    // Инициализация по умолчанию
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', false)) {
                initDefault();
            }
        }
    }, 100);
    
    function initDefault() {
        Lampa.Storage.set('jack', 'true');
        Lampa.Storage.set('jackett_url', 'jacred.xyz');
        Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('jackett_key', '');
        Lampa.Storage.set('jackett_interview', 'healthy');
        Lampa.Storage.set('parse_lang', 'lg');
    }
    
    // Функция создания меню выбора парсера
    function createParserMenu() {
        var params = Lampa.Manifest.object.name;
        var items = [];
        
        items.push({
            title: 'Lampa32',
            url: '62.60.149.237:2601',
            url_two: 'jac_lampa32_ru',
            jac_key: '',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        items.push({
            title: 'Lampa Jackett',
            url: 'jacblack.ru:9117',
            url_two: 'lampa_jackett',
            jac_key: '34DPECDY',
            jac_int: 'all',
            jac_lang: 'df'
        });
        
        items.push({
            title: 'Jacred.xyz',
            url: 'jacred.xyz',
            url_two: 'jacred_xyz',
            jac_key: '',
            jac_int: 'healthy',
            jac_lang: 'lg'
        });
        
        items.push({
            title: 'JR Maxvol Pro',
            url: 'jr.maxvol.pro',
            url_two: 'jr_maxvol_pro',
            jac_key: '',
            jac_int: 'all',
            jac_lang: 'lg'
        });
        
        items.push({
            title: 'Jacred RU',
            url: 'https://jac-red.ru',
            url_two: 'jacred_ru',
            jac_key: '',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        items.push({
            title: 'Jacred Viewbox Dev',
            url: 'jacred.viewbox.dev',
            url_two: 'jacred_viewbox_dev',
            jac_key: '64e364',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        items.push({
            title: 'Jac Pro',
            url: 'jacred.pro',
            url_two: 'jacred_pro',
            jac_key: '',
            jac_int: 'all',
            jac_lang: 'lg'
        });
        
        items.push({
            title: 'Jac Black',
            url: 'jacblack.ru:9117',
            url_two: 'jac_black',
            jac_key: '',
            jac_int: 'false',
            jac_lang: 'lg'
        });
        
        checkParserStatus(items).then(function(checkedItems) {
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
                    Lampa.Controller.toggle(params);
                },
                onSelect: function(a) {
                    Lampa.Storage.set('jackett_url', a.url);
                    Lampa.Storage.set('jackett_urltwo', a.url_two);
                    Lampa.Storage.set('jackett_key', a.jac_key);
                    Lampa.Storage.set('jackett_interview', a.jac_int);
                    Lampa.Storage.set('parse_lang', a.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    
                    Lampa.Controller.toggle(params);
                    
                    var currentUrl = Lampa.Storage.field('select');
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                    
                    setTimeout(function() {
                        Lampa.Activity.push(currentUrl);
                    }, 2000);
                }
            });
        }).catch(function(err) {
            console.error('Error:', err);
        });
    }
    
    // Проверка статуса всех парсеров
    function checkParserStatus(items) {
        var promises = [];
        for (var i = 0; i < items.length; i++) {
            var url = items[i].url;
            promises.push(checkSingleParser(url, items[i].title, items[i]));
        }
        return Promise.all(promises);
    }
    
    // Проверка одного парсера
    function checkSingleParser(url, title, item) {
        return new Promise(function(resolve, reject) {
            var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
            var key = '';
            if (url == 'jacblack.ru:9117') {
                key = '34DPECDY';
            }
            if (url == 'jr.maxvol.pro') {
                protocol = 'https://';
            } else {
                protocol = 'http://';
            }
            
            var apiUrl = protocol + url + '/api/v2.0/indexers/status:healthy/results?apikey=' + key;
            var xhr = new XMLHttpRequest();
            
            xhr.open('GET', apiUrl, true);
            xhr.timeout = 3000;
            
            xhr.ontimeout = function() {
                item.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(item);
            };
            
            xhr.onerror = function() {
                item.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(item);
            };
            
            xhr.onload = function() {
                item.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(item);
            };
            
            xhr.send();
        });
    }
    
    // Отслеживание активности для показа меню
    Lampa.Storage.follow('parser', function(e) {
        if (e.name == 'settings') {
            if (Lampa.Activity.active().type == 'settings') {
                createParserMenu();
            }
        }
    });
    
    // MutationObserver для отслеживания изменений DOM
    var observer;
    function startObserver() {
        stopObserver();
        var targetNode = document.body;
        var config = { childList: true, subtree: true };
        
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if ($('div[data-children="parser"]').length && Lampa.Storage.field('parser_torrent_type') == 'jackett') {
                    createParserMenu();
                    stopObserver();
                }
            });
        });
        
        observer.observe(targetNode, config);
    }
    
    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
    
    startObserver();
    
})();
