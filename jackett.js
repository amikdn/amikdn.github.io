(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    // Массив серверов для проверки
    const servers = [
        '62.60.149.237:2601',
        'jacblack.ru:9117',
        '62.60.149.237:8443',
        'jr.maxvol.pro',
        'jac-red.ru',
        'jacred.viewbox.dev',
        'jacred.pro',
        'jacred.xyz'
    ];
    
    // Названия серверов для отображения
    const serverNames = [
        'Lampa32',
        'ByLampa Jackett',
        'Jacred RU',
        'Jacred Maxvol Pro',
        'Jacred Pro',
        'Viewbox',
        'Jacred.xyz',
        'Jac Black'
    ];
    
    // Определение протокола
    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    // Функция проверки доступности сервера
    function checkServer(index) {
        setTimeout(function() {
            let apiKey = '';
            if (servers[index] === 'jacblack.ru:9117') {
                apiKey = '34DPECDY';
            }
            
            let serverProtocol = protocol;
            if (servers[index] === 'jr.maxvol.pro') {
                serverProtocol = 'https://';
            } else {
                serverProtocol = 'http://';
            }
            
            const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;
            
            // Проверяем, что первый элемент - "Свой вариант"
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') {
                return;
            }
            
            const url = `${serverProtocol}${servers[index]}/api/v2.0/indexers/status:healthy/results?apikey=${apiKey}`;
            const xhr = new XMLHttpRequest();
            
            xhr.timeout = 3000; // 3 секунды
            xhr.open('GET', url, true);
            xhr.send();
            
            // Обработчик таймаута
            xhr.ontimeout = function() {
                if ($(selector).text() === serverNames[index]) {
                    $(selector).html(`&#10008;&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ff2121');
                }
            };
            
            // Обработчик ошибки
            xhr.onerror = function() {
                if ($(selector).text() === serverNames[index]) {
                    $(selector).html(`&#10008;&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ff2121');
                }
            };
            
            // Обработчик успешного ответа
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Сервер доступен
                    if ($(selector).text() === serverNames[index]) {
                        $(selector).html(`&#10004;&nbsp;&nbsp;${$(selector).text()}`).css('color', '#64e364');
                    }
                } else {
                    // Ошибка доступа
                    if ($(selector).text() === serverNames[index]) {
                        $(selector).html(`&#10008;&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ff2121');
                    }
                }
                
                // Специальная обработка статуса 401 (неавторизован)
                if (xhr.status === 401) {
                    if ($(selector).text() === serverNames[index]) {
                        $(selector).html(`&#10008;&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ffffff');
                    }
                }
            };
        }, 1000);
    }
    
    // Функция проверки всех серверов
    function checkAllServers() {
        for (let i = 0; i <= servers.length - 1; i++) {
            checkServer(i);
        }
    }
    
    // Обработчик событий активности приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'parser') {
            setTimeout(function() {
                checkAllServers();
            }, 10);
        }
    });
    
    // Функция установки конфигурации по умолчанию для выбранного сервера
    function setDefaultConfig() {
        const currentParser = Lampa.Storage.get('jackett_url');
        
        switch (currentParser) {
            case 'no_parser':
                Lampa.Storage.set('jackett_url', '');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', false);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jac_lampa32_ru':
                Lampa.Storage.set('jackett_url', '62.60.149.237:2601');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'bylampa_jackett':
                Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'df');
                break;
                
            case 'jacred_pro':
                Lampa.Storage.set('jackett_url', 'jacred.pro');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jr_maxvol_pro':
                Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'healthy');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jacred_ru':
                Lampa.Storage.set('jackett_url', 'jac-red.ru');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jacred_viewbox_dev':
                Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
                Lampa.Storage.set('jackett_key', '64e364');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jac_black':
                Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            default:
                break;
        }
    }
    
    // HTML для настроек с иконкой
    const settingsHtml = `<div class="settings-folder" style="padding:0!important">
        <div style="width:1.3em;height:1.3em;padding-right:.1em">
            <svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000">
                <!-- SVG содержимое иконки -->
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716 "></polygon>
                    <!-- ... остальное содержимое SVG ... -->
                </g>
            </svg>
        </div>
        <div style="font-size:1.0em">
            <div style="padding: 0.3em 0.3em; padding-top: 0;">
                <div style="background: #d99821; padding: 0.5em; border-radius: 0.4em;">
                    <div style="line-height: 0.3;">Выбрать парсер</div>
                </div>
            </div>
        </div>
    </div>`;
    
    // Добавление основной настройки выбора парсера
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
                'jr_maxvol_pro': 'Jacred Maxvol Pro',
                'jacred_ru': 'Jacred RU',
                'jacred_viewbox_dev': 'Viewbox',
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
            setDefaultConfig();
            Lampa.Settings.update();
        },
        onRender: function(html) {
            setTimeout(function() {
                // Обработчик клика по секции парсера
                $('div[data-children="parser"]').on('hover:enter', function() {
                    Lampa.Settings.open();
                });
                
                // Скрываем стандартные поля если не no_parser
                if (localStorage.getItem('jackett_url') !== 'no_parser') {
                    $('div[data-name="jackett_url"]').hide();
                    $('div[data-name="jackett_key"]').hide();
                    Lampa.Controller.toggle('back');
                }
                
                // Показываем/скрываем в зависимости от платформы и типа
                if (Lampa.Platform.is('tizen') && Lampa.Storage.field('parser_torrent_type') == 'jackett') {
                    html.show();
                    $(html.find('.settings-param__name'), html).css('color', '#ffffff');
                    $('div[data-name="jackett_urltwo"]').insertAfter(html);
                } else {
                    html.hide();
                }
            }, 5);
        }
    });
    
    // Обработка рендеринга отдельных настроек
    Lampa.Settings.mainContext().render().find('[data-component="parser"]').on('hover:focus', function(e) {
        if (e.target.dataset.name === 'jackett_urltwo') {
            // Удаляем стандартные поля jackett_url и jackett_key
            $('[data-name="jackett_url2"]').remove();
            $('[data-name="parser_key"]').remove();
        }
    });
    
    // Отслеживание изменений в Storage для jackett_urltwo
    Lampa.Storage.follow('parser', function(e) {
        if (Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
            $('div[data-name="jackett_urltwo"]').hide();
        } else {
            $('div[data-name="jackett_urltwo"]').insertAfter('div[data-name="jackett_url"]');
        }
    });
    
    // Инициализация по умолчанию
    let initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            
            // Проверяем, нужно ли инициализировать настройки по умолчанию
            if (!Lampa.Storage.get('jack', false)) {
                initializeDefaults();
            }
        }
    }, 100);
    
    function initializeDefaults() {
        Lampa.Storage.set('jack', 'true');
        Lampa.Storage.set('jackett_url', 'jacred.xyz');
        Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('jackett_key', '');
        Lampa.Storage.set('jackett_interview', 'healthy');
        Lampa.Storage.set('parse_lang', 'lg');
    }
    
    // Функция показа меню выбора сервера
    function showServerSelection() {
        const params = Lampa.Manifest.main().name;
        const serversConfig = [
            {
                title: 'Lampa32',
                url: '62.60.149.237:2601',
                url_two: 'jac_lampa32_ru',
                jac_key: '',
                jac_int: 'false',
                jac_lang: 'lg'
            },
            {
                title: 'ByLampa Jackett',
                url: 'jacblack.ru:9117',
                url_two: 'bylampa_jackett',
                jac_key: '34DPECDY',
                jac_int: 'all',
                jac_lang: 'df'
            },
            {
                title: 'Jacred.xyz',
                url: 'jacred.xyz',
                url_two: 'jacred_xyz',
                jac_key: '',
                jac_int: 'healthy',
                jac_lang: 'lg'
            },
            {
                title: 'Jacred Maxvol Pro',
                url: 'jr.maxvol.pro',
                url_two: 'jr_maxvol_pro',
                jac_key: '',
                jac_int: 'healthy',
                jac_lang: 'lg'
            },
            {
                title: 'Jacred RU',
                url: 'jac-red.ru',
                url_two: 'jacred_ru',
                jac_key: '',
                jac_int: 'false',
                jac_lang: 'lg'
            },
            {
                title: 'Viewbox',
                url: 'jacred.viewbox.dev',
                url_two: 'jacred_viewbox_dev',
                jac_key: '64e364',
                jac_int: 'false',
                jac_lang: 'lg'
            },
            {
                title: 'Jacred Pro',
                url: 'jacred.pro',
                url_two: 'jacred_pro',
                jac_key: '',
                jac_int: 'all',
                jac_lang: 'lg'
            },
            {
                title: 'Jac Black',
                url: 'jacblack.ru:9117',
                url_two: 'jac_black',
                jac_key: '',
                jac_int: 'false',
                jac_lang: 'lg'
            }
        ];
        
        // Проверяем статус серверов
        checkServersStatus(serversConfig).then(function(validServers) {
            Lampa.Select.show({
                title: 'Выбрать парсер',
                items: validServers.map(function(server) {
                    return {
                        title: server.title,
                        url: server.url,
                        url_two: server.url_two,
                        jac_key: server.jac_key,
                        jac_int: server.jac_int,
                        jac_lang: server.jac_lang
                    };
                }),
                onBack: function() {
                    Lampa.Controller.toggle(params);
                },
                onSelect: function(selected) {
                    // Сохраняем настройки
                    Lampa.Storage.set('jackett_url', selected.url);
                    Lampa.Storage.set('jackett_urltwo', selected.url_two);
                    Lampa.Storage.set('jackett_key', selected.jac_key);
                    Lampa.Storage.set('jackett_interview', selected.jac_int);
                    Lampa.Storage.set('parse_lang', selected.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    
                    // Возвращаемся к предыдущему экрану
                    Lampa.Activity.back(params);
                    
                    // Перезагружаем страницу через 1 секунду
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                    
                    // Показываем уведомление через 2 секунды
                    setTimeout(function() {
                        Lampa.Noty.show(params);
                    }, 2000);
                }
            });
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }
    
    // Функция проверки статуса всех серверов
    function checkServersStatus(serversList) {
        const promises = [];
        for (let i = 0; i < serversList.length; i++) {
            promises.push(checkSingleServer(serversList[i].url, serversList[i].title, serversList[i]));
        }
        return Promise.all(promises);
    }
    
    // Функция проверки одного сервера
    function checkSingleServer(url, title, config) {
        return new Promise(function(resolve) {
            let serverProtocol = location.protocol === 'https:' ? 'https://' : 'http://';
            let apiKey = '';
            
            if (url === 'jacblack.ru:9117') {
                apiKey = '34DPECDY';
            }
            
            if (url === 'jr.maxvol.pro') {
                serverProtocol = 'https://';
            } else {
                serverProtocol = 'http://';
            }
            
            const checkUrl = `${serverProtocol}${url}/api/v2.0/indexers/status:healthy/results?apikey=${apiKey}`;
            const xhr = new XMLHttpRequest();
            
            xhr.open('GET', checkUrl, true);
            xhr.timeout = 3000;
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Сервер доступен
                    config.title = `<span style="color: #64e364;">&#10004;&nbsp;&nbsp;${title}</span>`;
                } else {
                    // Сервер недоступен
                    config.title = `&#10008;&nbsp;&nbsp;${title}</span>`;
                }
                resolve(config);
            };
            
            xhr.onerror = function() {
                config.title = `&#10008;&nbsp;&nbsp;${title}</span>`;
                resolve(config);
            };
            
            xhr.ontimeout = function() {
                config.title = `&#10008;&nbsp;&nbsp;${title}</span>`;
                resolve(config);
            };
            
            xhr.send();
        });
    }
    
    // Наблюдатель за изменениями DOM с помощью MutationObserver
    let observer;
    
    Lampa.Storage.follow('parser', function(e) {
        if (e.name == 'torrents') {
            const activeActivity = Lampa.Activity.active();
            if (activeActivity && activeActivity.render().find('.selector').text() == 'parser') {
                startObserver();
            } else {
                stopObserver();
            }
        }
    });
    
    function startObserver() {
        stopObserver();
        
        const observerTarget = document.body;
        const observerConfig = {
            childList: true,
            subtree: true
        };
        
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if ($('div[data-children="parser"]').length && 
                    Lampa.Storage.field('parser_torrent_type') == 'jackett') {
                    
                    // Показываем меню выбора парсера
                    showServerSelection();
                    
                    // Останавливаем наблюдение
                    stopObserver();
                }
            });
        });
        
        observer.observe(observerTarget, observerConfig);
    }
    
    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
    
})();
