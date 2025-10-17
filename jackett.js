(function() {
    'use strict';

    Lampa.Platform.tv();

    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    var urls = ['jacred.ru', 'jr.maxvol.pro', 'jac-red.ru', 'jacred.viewbox.dev', 'jacred.pro', 'jacblack.ru:9117'];
    var titles = ['Jacred RU', 'Jacred Maxvol Pro', 'Jacred RU', 'Viewbox', 'Jacred Pro', 'Jac Black'];

    function checkParser(index) {
        setTimeout(function() {
            try {
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
                };
            } catch(e) {
                console.log('checkParser error:', e);
            }
        }, 1000);
    }

    function checkAllParsers() {
        for (var i = 0; i < urls.length; i++) {
            checkParser(i);
        }
    }

    function setParserConfig() {
        var selected = Lampa.Storage.get('jackett_urltwo') || 'jacred_xyz';
        
        var configs = {
            'no_parser': {
                jackett_url: '',
                jackett_key: '',
                jackett_interview: 'false',
                parse_in_search: false,
                parse_lang: 'lg'
            },
            'jacred_xyz': {
                jackett_url: 'jacred.xyz',
                jackett_key: '',
                jackett_interview: 'healthy',
                parse_in_search: true,
                parse_lang: 'lg'
            },
            'jr_maxvol_pro': {
                jackett_url: 'jr.maxvol.pro',
                jackett_key: '',
                jackett_interview: 'all',
                parse_in_search: true,
                parse_lang: 'df'
            },
            'jacred_ru': {
                jackett_url: 'jac-red.ru',
                jackett_key: '',
                jackett_interview: 'false',
                parse_in_search: true,
                parse_lang: 'lg'
            },
            'jacred_pro': {
                jackett_url: 'jacred.pro',
                jackett_key: '',
                jackett_interview: 'all',
                parse_in_search: true,
                parse_lang: 'lg'
            },
            'jac_black': {
                jackett_url: 'jacblack.ru:9117',
                jackett_key: '',
                jackett_interview: 'false',
                parse_in_search: true,
                parse_lang: 'lg'
            },
            'jacred_viewbox_dev': {
                jackett_url: 'jacred.viewbox.dev',
                jackett_key: '777',
                jackett_interview: 'false',
                parse_in_search: true,
                parse_lang: 'lg'
            }
        };

        var config = configs[selected] || configs['jacred_xyz'];
        
        Lampa.Storage.set('jackett_url', config.jackett_url);
        Lampa.Storage.set('jackett_key', config.jackett_key);
        Lampa.Storage.set('jackett_interview', config.jackett_interview);
        Lampa.Storage.set('parse_in_search', config.parse_in_search);
        Lampa.Storage.set('parse_lang', config.parse_lang);
    }

    // Регистрация основного параметра выбора парсера
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
                name: 'Выбрать парсер',
                description: 'Выберите парсер торрентов'
            },
            onChange: function(value) {
                setParserConfig();
                Lampa.Settings.update && Lampa.Settings.update();
            }
        });
    }

    // Обработчик клика по элементу выбора парсера
    $(document).on('hover:enter', '[data-name="jackett_urltwo"], .jackett-parser-select', function(e) {
        e.preventDefault();
        showParserMenu();
        return false;
    });

    // Функция показа меню выбора парсера
    function showParserMenu() {
        var parsers = [
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
                jac_int: 'all',
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
                jac_key: '777',
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

        if (Lampa.Select && Lampa.Select.show) {
            Lampa.Select.show({
                title: 'Выбрать парсер',
                items: parsers,
                onBack: function() {
                    // Безопасный возврат
                },
                onSelect: function(item) {
                    Lampa.Storage.set('jackett_url', item.url);
                    Lampa.Storage.set('jackett_urltwo', item.url_two);
                    Lampa.Storage.set('jackett_key', item.jac_key);
                    Lampa.Storage.set('jackett_interview', item.jac_int);
                    Lampa.Storage.set('parse_lang', item.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    
                    setTimeout(function() {
                        if (window.location.reload) {
                            window.location.reload();
                        }
                    }, 1000);
                }
            });
        }
    }

    // Динамическое добавление кнопки выбора парсера
    function addParserSelect() {
        if (Lampa.Storage.field && Lampa.Storage.field('parser_use') === 'jackett') {
            setTimeout(function() {
                if ($('[data-name="jackett_url"]').length && !$('[data-name="jackett_urltwo"]').length) {
                    var parserSelect = '<div class="settings-param selector jackett-parser-select" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>';
                    $('[data-name="jackett_url"]').after(parserSelect);
                }
            }, 500);
        }
    }

    // Observer для отслеживания изменений DOM
    var observer;
    function initObserver() {
        if (observer) {
            observer.disconnect();
        }
        
        try {
            observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        addParserSelect();
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch(e) {
            console.log('Observer init error:', e);
        }
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    // Слушатели событий
    if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function(e) {
            try {
                if (e.type === 'ready') {
                    // Безопасная проверка активности
                    var activeActivity = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
                    if (activeActivity && typeof activeActivity.activity_type !== 'undefined' && activeActivity.activity_type === 'settings') {
                        initObserver();
                    }
                    addParserSelect();
                } else if (e.type === 'destroy') {
                    stopObserver();
                } else if (e.type === 'select') {
                    setTimeout(checkAllParsers, 100);
                }
            } catch(err) {
                console.log('Listener error:', err);
            }
        });
    }

    // Следим за изменением parser_use
    if (Lampa.Storage && Lampa.Storage.listener && Lampa.Storage.listener.follow) {
        Lampa.Storage.listener.follow('parser_use', function(e) {
            try {
                if (e.value === 'jackett') {
                    addParserSelect();
                    initObserver();
                } else {
                    $('[data-name="jackett_urltwo"], .jackett-parser-select').remove();
                    stopObserver();
                }
            } catch(err) {
                console.log('Storage listener error:', err);
            }
        });
    }

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
            }
            setParserConfig();
        }
    }, 100);

})();
