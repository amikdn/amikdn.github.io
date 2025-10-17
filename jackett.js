(function() {
    'use strict';

    // Call the platform TV method if available
    if (Lampa.Platform && typeof Lampa.Platform.tv === 'function') {
        Lampa.Platform.tv();
    }

    // Enable parser use
    Lampa.Storage.set('parser_use', true);

    // Determine protocol based on current location
    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';

    // List of Jackett servers
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

    // Corresponding parser names for display
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

    // HTML for the "Select Parser" button (original SVG included for completeness)
    var selectParserHtml = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716 "></polygon> <polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96 "></polygon> <g> <polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908 "></polygon> <polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716 "></polygon> </g> <polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96 "></polygon> <g> <polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908 "></polygon> <polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716 "></polygon> </g> <path d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"></path> <path d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"></path> <path d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"></path> <path d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"></path> <path d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"></path> <path d="M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075 c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858 c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371 C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795 c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507 l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795 L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123 h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242 L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484 l89.627,82.578L245.552,473.907L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666 c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484 c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132 l36.268-111.136l48.515,319.89L452.882,438.59z"></path> <path d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"></path> </g></svg></div><div style="font-size:1.0em"><div style="padding: 0.3em 0.3em; padding-top: 0;"><div style="background: #d99821; padding: 0.5em; border-radius: 0.4em;"><div style="line-height: 0.3;">Выбрать парсер</div></div></div></div></div>';
    
    // Функция проверки доступности
    function _0x792fcb(_0x558e43) {
        setTimeout(function() {
            var _0x4261d5 = _0x17ce;
            var _0x522237 = '';
            if (servers[_0x558e43] == 'jacblack.ru:9117') var _0x522237 = '34DPECDY';
            var _0x2e842a = _0x558e43 + 0x2;
            if (servers[_0x558e43] == 'jr.maxvol.pro') protocol = 'https://';
            else protocol = 'http://';
            var _0x89274d = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + _0x2e842a + ') > div';
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
            var _0x5ce41f = protocol + servers[_0x558e43] + '/api/v2.0/indexers/status:healthy/results?apikey=' + _0x522237;
            var _0x18fc95 = new XMLHttpRequest();
            _0x18fc95.timeout = 0xbb8;
            _0x18fc95.open('GET', _0x5ce41f, !![]);
            _0x18fc95.send();
            _0x18fc95.ontimeout = function() {
                if ($(_0x89274d).text() == parserNames[_0x558e43]) $(_0x89274d).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(_0x89274d).text() + '</span>').css('color', '#ff2121');
            };
            _0x18fc95.onerror = function() {
                if ($(_0x89274d).text() == parserNames[_0x558e43]) $(_0x89274d).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(_0x89274d).text() + '</span>').css('color', '#ff2121');
            };
            _0x18fc95.onload = function() {
                if (_0x18fc95.status == 0xc8) {
                    if ($(_0x89274d).text() == parserNames[_0x558e43]) $(_0x89274d).html('✔&nbsp;&nbsp;' + $(_0x89274d).text()).css('color', '#64e364');
                } else {
                    if ($(_0x89274d).text() == parserNames[_0x558e43]) $(_0x89274d).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(_0x89274d).text() + '</span>').css('color', '#ff2121');
                }
                if (_0x18fc95.status == 0x191) {
                    if ($(_0x89274d).text() == parserNames[_0x558e43]) $(_0x89274d).html('<span style="color: #ff2121;">✘&nbsp;&nbsp;' + $(_0x89274d).text() + '</span>').css('color', '#777');
                }
            };
        }, 0x3e8);
    }
    
    function _0x188075() {
        for (var i = 0; i <= servers.length - 1; i++) {
            _0x792fcb(i);
        }
    }
    
    // Обработчик события app (для открытия парсера)
    Lampa.Listener.follow('app', function(_0x516ded) {
        if (_0x516ded.name == 'parser') setTimeout(function() {
            _0x188075();
        }, 0xa);
    });
    
    // Функция настройки параметров
    function _0x4d128a() {
        if (Lampa.Storage.get('jackett_url') == 'no_parser') Lampa.Storage.set('jackett_url', '') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'false') & Lampa.Storage.set('parse_in_search', false) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_url') == 'jac_lampa32_ru') Lampa.Storage.set('jackett_url', '62.60.149.237:2601') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'false') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_urltwo') == 'bylampa_jackett') Lampa.Storage.set('jackett_url', 'jacblack.ru:9117') & Lampa.Storage.set('jackett_key', '34DPECDY') & Lampa.Storage.set('jackett_interview', 'false') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'df');
        if (Lampa.Storage.get('jackett_url') == 'jacred_xyz') Lampa.Storage.set('jackett_url', 'jacred.xyz') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'healthy') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_url') == 'jr_maxvol_pro') Lampa.Storage.set('jackett_url', 'jr.maxvol.pro') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'all') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_url') == 'jacred_ru') Lampa.Storage.set('jackett_url', 'https://jac-red.ru') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'false') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_url') == 'jacred_viewbox_dev') Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev') & Lampa.Storage.set('jackett_key', '64e364') & Lampa.Storage.set('jackett_interview', 'false') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_url') == 'jacred_pro') Lampa.Storage.set('jackett_url', 'jacred.pro') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'all') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
        if (Lampa.Storage.get('jackett_url') == 'jac_black') Lampa.Storage.set('jackett_url', 'jacblack.ru:9117') & Lampa.Storage.set('jackett_key', '') & Lampa.Storage.set('jackett_interview', 'false') & Lampa.Storage.set('parse_in_search', true) & Lampa.Storage.set('parse_lang', 'lg');
    }
    
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
        onChange: function(_0xf1af96) {
            _0x4d128a();
            Lampa.Settings.update();
        },
        onRender: function(_0xdaa4b7) {
            setTimeout(function() {
                $('.empty__title').on('hover:enter', function() {
                    Lampa.Settings.open();
                });
                
                if (localStorage.getItem('jackett_url') !== 'no_parser') {
                    $('.settings-param__name').hide();
                    $('div[data-name="jackett_url"]').hide();
                    Lampa.Controller.toggle('settings_component');
                }
                
                if (Lampa.Storage.field('parser_use') && Lampa.Storage.field('parser_torrent_type') == 'jackett') {
                    _0xdaa4b7.show();
                    $(_0xdaa4b7).find('.selector').css('color', '#ffffff');
                    $('div[data-name="jackett_key"]').after(selectParserHtml);
                } else {
                    _0xdaa4b7.hide();
                }
            }, 0x5);
        }
    });
    
    // Замена follow на interval
    var storageChangeInterval = setInterval(function() {
        if (Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
            $('div[data-name="jackett_urltwo"]').hide();
        } else {
            $('div[data-name="jackett_urltwo"]').show();
            $('div[data-name="jackett_url"]').insertAfter('✔&nbsp;&nbsp;');
        }
    }, 500);
    
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', false)) {
                Lampa.Storage.set('jack', 'true');
                Lampa.Storage.set('jackett_url', 'jacred.xyz');
                Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'healthy');
                Lampa.Storage.set('parse_lang', 'lg');
            }
        }
    }, 0x64);
    
    // Функция создания меню
    function _0x23ae4e() {
        var currentActivity = Lampa.Controller.activity().name;
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
            title: 'ByLampa Jackett',
            url: 'jacblack.ru:9117',
            url_two: 'bylampa_jackett',
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
            title: 'Jacred Pro',
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
        
        function _0x46e2e3(_0x2d7167) {
            var promises = [];
            for (var i = 0; i < _0x2d7167.length; i++) {
                var url = _0x2d7167[i].url;
                promises.push(_0xe33742(url, _0x2d7167[i].title, _0x2d7167[i]));
            }
            return Promise.all(promises);
        }
        
        function _0xe33742(_0x11262f, _0x312714, _0x7df149) {
            return new Promise(function(_0x49b1f3, _0x46d8c9) {
                var _0x454e4f = location.protocol === 'https:' ? 'https://' : 'http://';
                var _0x199390 = '';
                if (_0x11262f == 'jacblack.ru:9117') var _0x199390 = '34DPECDY';
                if (_0x11262f == 'jr.maxvol.pro') _0x454e4f = 'https://';
                else _0x454e4f = 'http://';
                var _0x4ef804 = _0x454e4f + _0x11262f + '/api/v2.0/indexers/status:healthy/results?apikey=' + _0x199390;
                var _0x44cc5c = new XMLHttpRequest();
                _0x44cc5c.open('GET', _0x4ef804, !![]);
                _0x44cc5c.timeout = 0xbb8;
                _0x44cc5c.onload = function() {
                    if (_0x44cc5c.status === 0xc8) {
                        _0x7df149.title = '<span style="color: #64e364;">✔&nbsp;&nbsp;' + _0x312714 + '</span>';
                        _0x49b1f3(_0x7df149);
                    } else {
                        _0x7df149.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + _0x312714 + '</span>';
                        _0x49b1f3(_0x7df149);
                    }
                };
                _0x44cc5c.onerror = _0x44cc5c.ontimeout = function() {
                    _0x7df149.title = '<span style="color: #ff2121;">✘&nbsp;&nbsp;' + _0x312714 + '</span>';
                    _0x49b1f3(_0x7df149);
                };
                _0x44cc5c.send();
            });
        }
        
        _0x46e2e3(items).then(function(_0x31eea6) {
            Lampa.Select.show({
                title: 'Выбрать парсер',
                items: _0x31eea6.map(function(_0x47384c) {
                    return {
                        title: _0x47384c.title,
                        url: _0x47384c.url,
                        url_two: _0x47384c.url_two,
                        jac_key: _0x47384c.jac_key,
                        jac_int: _0x47384c.jac_int,
                        jac_lang: _0x47384c.jac_lang
                    };
                }),
                onBack: function() {
                    Lampa.Controller.toggle(currentActivity);
                },
                onSelect: function(_0x297bf6) {
                    Lampa.Storage.set('jackett_url', _0x297bf6.url);
                    Lampa.Storage.set('jackett_urltwo', _0x297bf6.url_two);
                    Lampa.Storage.set('jackett_key', _0x297bf6.jac_key);
                    Lampa.Storage.set('jackett_interview', _0x297bf6.jac_int);
                    Lampa.Storage.set('parse_lang', _0x297bf6.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    Lampa.Controller.toggle(currentActivity);
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            });
        }).catch(function(_0x119ef5) {
            console.error('Error:', _0x119ef5);
        });
    }
    
    // Замена follow на interval для отслеживания изменений
    var storageChangeInterval = setInterval(function() {
        if (Lampa.Storage.field('parser_torrent_type') !== 'jackett') {
            $('div[data-name="jackett_urltwo"]').hide();
        } else {
            $('div[data-name="jackett_urltwo"]').show();
            $('div[data-name="jackett_url"]').insertAfter('✔&nbsp;&nbsp;');
        }
    }, 500);
})();
