(function() {
    'use strict';

    Lampa.Platform.tv();

    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    var urls = ['jacred.ru', 'jr.maxvol.pro', 'jac-red.ru', 'jacred.viewbox.dev', 'jacred.pro', 'jacblack.ru:9117'];
    var titles = ['Jacred RU', 'Jacred Maxvol Pro', 'Jacred RU', 'Viewbox', 'Jacred Pro', 'Jac Black'];

    function checkParser(index) {
        setTimeout(function() {
            var apiKey = '';
            var position = index + 2;
            var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + position + ') > div';
            
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
            
            var useProtocol = urls[index] == 'jr.maxvol.pro' ? 'https://' : protocol;
            var requestUrl = useProtocol + urls[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', requestUrl, true);
            xhr.send();
            
            xhr.ontimeout = function() {
                if ($(selector).text() == titles[index]) {
                    $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onerror = function() {
                if ($(selector).text() == titles[index]) {
                    $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                }
            };
            
            xhr.onload = function() {
                if (xhr.status == 200) {
                    if ($(selector).text() == titles[index]) {
                        $(selector).html('<span style="color:#64e364;">✔&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ffffff');
                    }
                } else {
                    if ($(selector).text() == titles[index]) {
                        $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                    }
                }
                if (xhr.status == 401) {
                    if ($(selector).text() == titles[index]) {
                        $(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
                    }
                }
            };
        }, 1000);
    }

    function checkAllParsers() {
        for (var i = 0; i < urls.length; i++) {
            checkParser(i);
        }
    }

    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'select') {
            setTimeout(function() {
                checkAllParsers();
            }, 10);
        }
    });

    function setParserConfig() {
        var selected = Lampa.Storage.get('jackett_urltwo');
        
        switch(selected) {
            case 'no_parser':
                Lampa.Storage.set('jackett_url', '');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', false);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jacred_xyz':
                Lampa.Storage.set('jackett_url', 'jacred.xyz');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'healthy');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jr_maxvol_pro':
                Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'all');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'df');
                break;
                
            case 'jacred_ru':
                Lampa.Storage.set('jackett_url', 'jac-red.ru');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
                
            case 'jacred_pro':
                Lampa.Storage.set('jackett_url', 'jacred.pro');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'all');
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
                
            case 'jacred_viewbox_dev':
                Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
                Lampa.Storage.set('jackett_key', '777');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('parse_lang', 'lg');
                break;
        }
    }

    // Основное меню настроек парсера
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
            'default': 'jacred_xyz'
        },
        field: {
            name: 'Меню смены парсера',
            description: 'Нажмите для выбора парсера из списка'
        },
        onChange: function(value) {
            setParserConfig();
            Lampa.Settings.update();
        },
        onRender: function(html) {
            setTimeout(function() {
                $('.settings-param__name').on('hover:enter', function() {
                    Lampa.Settings.main();
                });
                
                if (Lampa.Storage.field('parser_use') == 'jackett') {
                    html.show();
                    $(html.find('.selector'), html).css('color', '#ffffff');
                } else {
                    html.hide();
                }
            }, 100);
        }
    });

    // Следим за изменением parser_use
    Lampa.Storage.listener.follow('parser_use', function(e) {
        if (e.value !== 'jackett') {
            $('[data-name="jackett_key"]').hide();
            $('[data-name="jackett_urltwo"]').hide();
        } else {
            $('[data-name="jackett_key"]').show();
            setTimeout(function() {
                var parserSelect = '<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>';
                $('[data-name="jackett_url"]').after(parserSelect);
            }, 100);
        }
    });

    // Инициализация по умолчанию
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
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

    // Функция показа меню выбора парсера
    function showParserMenu() {
        var parsers = [
            {
                'title': 'Jacred.xyz',
                'url': 'jacred.xyz',
                'url_two': 'jacred_xyz',
                'jac_key': '',
                'jac_int': 'healthy',
                'jac_lang': 'lg'
            },
            {
                'title': 'Jacred Maxvol Pro',
                'url': 'jr.maxvol.pro',
                'url_two': 'jr_maxvol_pro',
                'jac_key': '',
                'jac_int': 'all',
                'jac_lang': 'lg'
            },
            {
                'title': 'Jacred RU',
                'url': 'jac-red.ru',
                'url_two': 'jacred_ru',
                'jac_key': '',
                'jac_int': 'false',
                'jac_lang': 'lg'
            },
            {
                'title': 'Viewbox',
                'url': 'jacred.viewbox.dev',
                'url_two': 'jacred_viewbox_dev',
                'jac_key': '777',
                'jac_int': 'false',
                'jac_lang': 'lg'
            },
            {
                'title': 'Jacred Pro',
                'url': 'jacred.pro',
                'url_two': 'jacred_pro',
                'jac_key': '',
                'jac_int': 'all',
                'jac_lang': 'lg'
            },
            {
                'title': 'Jac Black',
                'url': 'jacblack.ru:9117',
                'url_two': 'jac_black',
                'jac_key': '',
                'jac_int': 'false',
                'jac_lang': 'lg'
            }
        ];

        Lampa.Select.show({
            title: 'Выбрать парсер',
            items: parsers,
            onBack: function() {
                Lampa.Controller.toggle(Lampa.Activity.active().render());
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

    // Перехват клика по элементу выбора парсера
    $(document).on('hover:enter', '[data-name="jackett_urltwo"]', function() {
        showParserMenu();
    });

    // Observer для динамического добавления элементов
    var observer;
    function initObserver() {
        if (observer) observer.disconnect();
        
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && Lampa.Storage.field('parser_use') === 'jackett') {
                    setTimeout(function() {
                        if ($('[data-name="jackett_urltwo"]').length === 0) {
                            var parserSelect = '<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>';
                            $('[data-name="jackett_url"]').after(parserSelect);
                        }
                    }, 100);
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Запуск observer при активации настроек
    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'ready' && Lampa.Activity.active().activity_type == 'settings') {
            if (Lampa.Storage.field('parser_use') == 'jackett') {
                initObserver();
            }
        }
    });

    // Остановка observer
    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'destroy') {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }
    });

})();
