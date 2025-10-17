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
        for (var i = 0; i <= urls.length - 1; i++) {
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
        if (Lampa.Storage.get('jackett_urltwo') == 'no_parser') {
            Lampa.Storage.set('jackett_url', '');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', false);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        if (Lampa.Storage.get('jackett_urltwo') == 'jacred_xyz') {
            Lampa.Storage.set('jackett_url', 'jacred.xyz');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'healthy');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        if (Lampa.Storage.get('jackett_urltwo') == 'jr_maxvol_pro') {
            Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }
        
        if (Lampa.Storage.get('jackett_urltwo') == 'jacred_ru') {
            Lampa.Storage.set('jackett_url', 'jac-red.ru');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        if (Lampa.Storage.get('jackett_urltwo') == 'jacred_pro') {
            Lampa.Storage.set('jackett_url', 'jacred.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        if (Lampa.Storage.get('jackett_urltwo') == 'jac_black') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
        
        if (Lampa.Storage.get('jackett_urltwo') == 'jacred_viewbox_dev') {
            Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
            Lampa.Storage.set('jackett_key', '777');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
    }

    Lampa.Settings.main({
        component: 'parser',
        param: {
            name: 'jackett_urltwo',
            type: 'select',
            values: {
                'no_parser': 'no_parser',
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
                
                if (localStorage.removeItem('jackett_urltwo') !== 'undefined') {
                    $('.empty__title').hide();
                    $('[data-name="jackett_key"]').hide();
                    Lampa.Controller.toggle('settings_component');
                }
                
                if (Lampa.Storage.field('parser') && Lampa.Storage.field('parser_use') == 'jackett') {
                    html.show();
                    $(html.find('.selector'), html).css('color', '#ffffff');
                    $('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
                } else {
                    html.hide();
                }
            }, 5);
        }
    });

    Lampa.Settings.main_context({
        'component': 'torrents',
        'name': 'parser_torrent_type',
        'before': '[data-name="jackett_url2"]',
        'html': '<div class="settings-folder selector" data-name="jackett_urltwo"><div>Выбрать парсер</div></div>',
        'onBack': false,
        'onSelect': false
    });

    Lampa.Storage.listener.follow('parser_use', function(e) {
        if (Lampa.Storage.field('parser_use') !== 'jackett') {
            $('[data-name="jackett_key"]').hide();
        } else {
            $('[data-name="jackett_key"]').show();
            $('div[data-name="jackett_urltwo"]').insertAfter('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
        }
    });

    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', false)) initDefault();
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

    function showParserMenu() {
        var active = Lampa.Activity.active();
        var html = [];
        
        html.push({
            'title': 'Jacred.xyz',
            'url': 'jacred.xyz',
            'url_two': 'jacred_xyz',
            'jac_key': '',
            'jac_int': 'healthy',
            'jac_lang': 'lg'
        });
        
        html.push({
            'title': 'Jacred Maxvol Pro',
            'url': 'jr.maxvol.pro',
            'url_two': 'jr_maxvol_pro',
            'jac_key': '',
            'jac_int': 'all',
            'jac_lang': 'lg'
        });
        
        html.push({
            'title': 'Jacred RU',
            'url': 'jac-red.ru',
            'url_two': 'jacred_ru',
            'jac_key': '',
            'jac_int': 'false',
            'jac_lang': 'lg'
        });
        
        html.push({
            'title': 'Viewbox',
            'url': 'jacred.viewbox.dev',
            'url_two': 'jacred_viewbox_dev',
            'jac_key': '777',
            'jac_int': 'false',
            'jac_lang': 'lg'
        });
        
        html.push({
            'title': 'Jacred Pro',
            'url': 'jacred.pro',
            'url_two': 'jacred_pro',
            'jac_key': '',
            'jac_int': 'all',
            'jac_lang': 'lg'
        });
        
        html.push({
            'title': 'Jac Black',
            'url': 'jacblack.ru:9117',
            'url_two': 'jac_black',
            'jac_key': '',
            'jac_int': 'false',
            'jac_lang': 'lg'
        });

        checkStatus(html).then(function(items) {
            Lampa.Select.show({
                'title': 'Выбрать парсер',
                'items': items.map(function(item) {
                    return {
                        'title': item.title,
                        'url': item.url,
                        'url_two': item.url_two,
                        'jac_key': item.jac_key,
                        'jac_int': item.jac_int,
                        'jac_lang': item.jac_lang
                    };
                }),
                'onBack': function() {
                    Lampa.Controller.toggle(active.render());
                },
                'onSelect': function(a) {
                    Lampa.Storage.set('jackett_url', a.url);
                    Lampa.Storage.set('jackett_urltwo', a.url_two);
                    Lampa.Storage.set('jackett_key', a.jac_key);
                    Lampa.Storage.set('jackett_interview', a.jac_int);
                    Lampa.Storage.set('parse_lang', a.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    Lampa.Activity.back(active.render());
                    
                    var url = Lampa.Storage.field('url');
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                    setTimeout(function() {
                        Lampa.Noty.show(url);
                    }, 2000);
                }
            });
        }).catch(function(e) {
            console.error('Error:', e);
        });
    }

    function checkStatus(items) {
        var promises = [];
        for (var i = 0; i < items.length; i++) {
            var url = items[i].url;
            promises.push(checkSingleStatus(url, items[i].title, items[i]));
        }
        return Promise.all(promises);
    }

    function checkSingleStatus(url, title, item) {
        return new Promise(function(resolve) {
            var useProtocol = location.protocol === 'https:' ? 'https://' : 'http://';
            var apiKey = '';
            
            if (url == 'jr.maxvol.pro') useProtocol = 'https://';
            
            var requestUrl = useProtocol + url + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
            var xhr = new XMLHttpRequest();
            
            xhr.open('GET', requestUrl, true);
            xhr.timeout = 3000;
            
            xhr.ontimeout = function() {
                item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(item);
            };
            
            xhr.onerror = function() {
                item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(item);
            };
            
            xhr.onload = function() {
                item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(item);
            };
            
            xhr.send();
        });
    }

    var observer;
    Lampa.Storage.listener.follow('parser_use', function(e) {
        if (e.value == 'url') {
            if (Lampa.Activity.active().activity_type == 'settings') initObserver();
            else stopObserver();
        }
    });

    function initObserver() {
        stopObserver();
        var body = document.body;
        var config = { childList: true, subtree: true };
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if ($('div[data-children="parser"]').length && Lampa.Storage.field('parser_use') == 'url') {
                    showParserMenu();
                    stopObserver();
                }
            });
        });
        observer.observe(body, config);
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
})();
