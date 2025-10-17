(function() {
    'use strict';

    Lampa.Platform.tv();

    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    // Только разрешенные парсеры (без lampa32 и bylampa)
    var urls_list = ['jacred.xyz', 'jr.maxvol.pro', 'jac-red.ru', 'jacred.viewbox.dev', 'jacred.pro', 'jacblack.ru:9117'];
    var titles_list = ['Jacred.xyz', 'Jacred Maxvol Pro', 'Jacred RU', 'Viewbox', 'Jacred Pro', 'Jac Black'];
    var keys_list = ['', '', '', '777', '', '34DPECDY'];

    function checkParserStatus(index) {
        setTimeout(function() {
            var apiKey = keys_list[index] || '';
            var position = index + 2;
            var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + position + ') > div';
            
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
            
            var useProtocol = urls_list[index] == 'jr.maxvol.pro' ? 'https://' : protocol;
            var requestUrl = useProtocol + urls_list[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', requestUrl, true);
            xhr.send();
            
            xhr.ontimeout = function() {
                if ($(selector).text() == titles_list[index]) {
                    $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onerror = function() {
                if ($(selector).text() == titles_list[index]) {
                    $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onload = function() {
                if (xhr.status == 200) {
                    if ($(selector).text() == titles_list[index]) {
                        $(selector).html('<span style="color:#64e364;">✔&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ffffff');
                    }
                } else {
                    if ($(selector).text() == titles_list[index]) {
                        $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                    }
                }
            };
        }, 1000);
    }

    function checkAllParsers() {
        for (var i = 0; i < urls_list.length; i++) {
            checkParserStatus(i);
        }
    }

    // Слушатель для проверки статусов при выборе
    if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'select') {
                setTimeout(checkAllParsers, 10);
            }
        });
    }

    function setParserSettings(selected) {
        var settings = {
            'no_parser': { url: '', key: '', interview: 'false', search: false, lang: 'lg' },
            'jacred_xyz': { url: 'jacred.xyz', key: '', interview: 'healthy', search: true, lang: 'lg' },
            'jr_maxvol_pro': { url: 'jr.maxvol.pro', key: '', interview: 'all', search: true, lang: 'df' },
            'jacred_ru': { url: 'jac-red.ru', key: '', interview: 'false', search: true, lang: 'lg' },
            'jacred_viewbox_dev': { url: 'jacred.viewbox.dev', key: '777', interview: 'false', search: true, lang: 'lg' },
            'jacred_pro': { url: 'jacred.pro', key: '', interview: 'all', search: true, lang: 'lg' },
            'jac_black': { url: 'jacblack.ru:9117', key: '34DPECDY', interview: 'false', search: true, lang: 'lg' }
        };

        var config = settings[selected] || settings['jacred_xyz'];
        
        Lampa.Storage.set('jackett_url', config.url);
        Lampa.Storage.set('jackett_key', config.key);
        Lampa.Storage.set('jackett_interview', config.interview);
        Lampa.Storage.set('parse_in_search', config.search);
        Lampa.Storage.set('parse_lang', config.lang);
    }

    // Основное меню настроек
    if (Lampa.Settings && Lampa.Settings.main) {
        Lampa.Settings.main({
            component: 'parser',
            param: {
                name: 'jackett_urltwo',
                type: 'select',
                values: {
                    'no_parser': 'Без парсера',
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
                setParserSettings(value);
                if (Lampa.Settings.update) Lampa.Settings.update();
            },
            onRender: function(html) {
                setTimeout(function() {
                    // Показываем меню только для jackett
                    if (Lampa.Storage.field && Lampa.Storage.field('parser_use') == 'jackett') {
                        html.show();
                        $(html.find('.selector'), html).css('color', '#ffffff');
                        
                        // Добавляем кнопку выбора парсера
                        setTimeout(function() {
                            if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
                                var parserSelect = '<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>';
                                $('div[data-name="jackett_url"]').after(parserSelect);
                            }
                        }, 100);
                    } else {
                        html.hide();
                    }
                }, 100);
            }
        });
    }

    // Обработчик клика по кнопке "Выбрать парсер"
    $(document).on('hover:enter', 'div[data-name="jackett_urltwo"], .settings-param[data-name="jackett_urltwo"]', function(e) {
        e.preventDefault();
        showParserSelectionMenu();
        return false;
    });

    function showParserSelectionMenu() {
        var items = urls_list.map(function(url, index) {
            return {
                title: titles_list[index],
                url: url,
                url_two: getUrlTwoKey(url),
                jac_key: keys_list[index],
                jac_int: getInterview(url),
                jac_lang: getLang(url)
            };
        });

        // Проверяем статусы
        Promise.all(items.map(checkSingleParserStatus)).then(function(statusItems) {
            if (Lampa.Select && Lampa.Select.show) {
                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: statusItems,
                    onBack: function() {
                        if (Lampa.Controller && Lampa.Controller.toggle) {
                            Lampa.Controller.toggle('settings_component');
                        }
                    },
                    onSelect: function(item) {
                        Lampa.Storage.set('jackett_url', item.url);
                        Lampa.Storage.set('jackett_urltwo', item.url_two);
                        Lampa.Storage.set('jackett_key', item.jac_key);
                        Lampa.Storage.set('jackett_interview', item.jac_int);
                        Lampa.Storage.set('parse_lang', item.jac_lang);
                        Lampa.Storage.set('parse_in_search', true);
                        
                        setParserSettings(item.url_two);
                        
                        if (Lampa.Activity && Lampa.Activity.back) {
                            Lampa.Activity.back();
                        }
                        setTimeout(function() {
                            window.location.reload();
                        }, 1000);
                    }
                });
            }
        }).catch(function(e) {
            console.error('Error showing parser menu:', e);
            // Fallback - показываем без проверки статусов
            showSimpleMenu(items);
        });
    }

    function getUrlTwoKey(url) {
        var mapping = {
            'jacred.xyz': 'jacred_xyz',
            'jr.maxvol.pro': 'jr_maxvol_pro',
            'jac-red.ru': 'jacred_ru',
            'jacred.viewbox.dev': 'jacred_viewbox_dev',
            'jacred.pro': 'jacred_pro',
            'jacblack.ru:9117': 'jac_black'
        };
        return mapping[url] || 'jacred_xyz';
    }

    function getInterview(url) {
        var mapping = {
            'jacred.xyz': 'healthy',
            'jr.maxvol.pro': 'all',
            'jacred.pro': 'all'
        };
        return mapping[url] || 'false';
    }

    function getLang(url) {
        return url === 'jr.maxvol.pro' ? 'df' : 'lg';
    }

    function checkSingleParserStatus(item) {
        return new Promise(function(resolve) {
            var useProtocol = item.url === 'jr.maxvol.pro' ? 'https://' : protocol;
            var requestUrl = useProtocol + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + item.jac_key;
            
            var xhr = new XMLHttpRequest();
            xhr.open('GET', requestUrl, true);
            xhr.timeout = 3000;
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    item.title = '<span style="color:#64e364;">✔&nbsp;&nbsp;' + item.title + '</span>';
                } else {
                    item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
                }
                resolve(item);
            };
            
            xhr.onerror = xhr.ontimeout = function() {
                item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
                resolve(item);
            };
            
            xhr.send();
        });
    }

    function showSimpleMenu(items) {
        if (Lampa.Select && Lampa.Select.show) {
            Lampa.Select.show({
                title: 'Выбрать парсер',
                items: items,
                onBack: function() {
                    Lampa.Controller.toggle('settings_component');
                },
                onSelect: function(item) {
                    Lampa.Storage.set('jackett_url', item.url);
                    Lampa.Storage.set('jackett_urltwo', item.url_two);
                    Lampa.Storage.set('jackett_key', item.jac_key);
                    Lampa.Storage.set('jackett_interview', item.jac_int);
                    Lampa.Storage.set('parse_lang', item.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    
                    Lampa.Activity.back();
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            });
        }
    }

    // Observer для динамического добавления кнопки
    var observer;
    function initObserver() {
        if (observer) observer.disconnect();
        
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && Lampa.Storage.field('parser_use') === 'jackett') {
                    setTimeout(function() {
                        if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
                            $('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
                        }
                    }, 100);
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Слушатель изменений parser_use
    if (Lampa.Storage && Lampa.Storage.listener && Lampa.Storage.listener.follow) {
        Lampa.Storage.listener.follow('parser_use', function(e) {
            if (e.value === 'jackett') {
                initObserver();
            }
        });
    }

    // Инициализация по умолчанию
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', false)) {
                Lampa.Storage.set('jack', 'true');
                Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
                setParserSettings('jacred_xyz');
            }
        }
    }, 100);

    // Добавление кнопки в настройки при загрузке
    setTimeout(function() {
        if (Lampa.Storage.field('parser_use') === 'jackett') {
            initObserver();
        }
    }, 2000);

})();
