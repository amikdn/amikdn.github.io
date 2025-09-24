(function() {
    'use strict';
    Lampa.Platform.tv();
    window['bylampa'] = 'bylampa'; // Обход проверки window.bylampa

    var _0x17b761 = {
        'asian_filter_enabled': false,
        'language_filter_enabled': false,
        'rating_filter_enabled': false,
        'history_filter_enabled': false
    },
    _0x19f0df = {
        'filters': [
            function(_0x48f6de) {
                if (!_0x17b761['asian_filter_enabled']) return _0x48f6de;
                return _0x48f6de.filter(function(_0x2bf78c) {
                    if (!_0x2bf78c || !_0x2bf78c['original_language']) return true;
                    var _0x333cdb = _0x2bf78c['original_language'].toLowerCase(),
                        _0x39e8d1 = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return _0x39e8d1.indexOf(_0x333cdb) === -1;
                });
            },
            function(_0x1447c4) {
                if (!_0x17b761['language_filter_enabled']) return _0x1447c4;
                return _0x1447c4.filter(function(_0x39c6f8) {
                    if (!_0x39c6f8) return true;
                    var _0xf4a9ea = Lampa['Storage'].get('language'),
                        _0x5619a5 = _0x39c6f8['original_name'] || _0x39c6f8['original_title'],
                        _0x1e6d26 = _0x39c6f8['title'] || _0x39c6f8['name'];
                    if (_0x39c6f8['original_language'] === _0xf4a9ea) return true;
                    if (_0x39c6f8['original_language'] !== _0xf4a9ea && _0x1e6d26 !== _0x5619a5) return true;
                    return false;
                });
            },
            function(_0x31db3d) {
                if (!_0x17b761['rating_filter_enabled']) return _0x31db3d;
                return _0x31db3d.filter(function(_0x5477ab) {
                    if (!_0x5477ab) return true;
                    var _0x2cef5a = _0x5477ab['media_type'] === 'person' || _0x5477ab['type'] === 'Trailer' || _0x5477ab['source'] === 'YouTube' || _0x5477ab['card'] && _0x5477ab['name'] && _0x5477ab['name'].toLowerCase().indexOf('/person/') !== -1;
                    if (_0x2cef5a) return true;
                    if (!_0x5477ab['vote_average'] || _0x5477ab['vote_average'] === 0) return false;
                    return _0x5477ab['vote_average'] >= 6;
                });
            },
            function(_0x4f79a5) {
                if (!_0x17b761['history_filter_enabled']) return _0x4f79a5;
                var _0x451b28 = Lampa['Storage'].get('history', '{}'),
                    _0x4e75fd = Lampa['Storage'].cache('history', 300, []);
                return _0x4f79a5.filter(function(_0x4d2122) {
                    if (!_0x4d2122 || !_0x4d2122['original_language']) return true;
                    var _0x45052b = _0x4d2122['media_type'];
                    !_0x45052b && (_0x45052b = !!_0x4d2122['seasons'] ? 'tv' : 'movie');
                    var _0x48ad67 = Lampa['Favorite'].check(_0x4d2122),
                        _0x4689b7 = !!_0x48ad67 && !!_0x48ad67['favorite'],
                        _0x34d757 = !!_0x48ad67 && _0x48ad67['thrown'];
                    if (_0x34d757) return false;
                    if (!_0x4689b7) return true;
                    if (_0x4689b7 && _0x45052b === 'movie') return false;
                    var _0x307868 = _0x2de6d4(_0x4d2122['id'], _0x451b28),
                        _0x389663 = _0x3e5f09(_0x4d2122['id'], _0x4e75fd),
                        _0x28dc8e = _0x2b33d5(_0x307868, _0x389663),
                        _0x2ea854 = _0x25d9eb(_0x4d2122['original_name'] || _0x4d2122['original_name'], _0x28dc8e);
                    return !_0x2ea854;
                });
            }
        ],
        'apply': function(_0x3494fb) {
            var _0x29fc63 = Lampa['Utils'].clone(_0x3494fb);
            for (var _0x2043f1 = 0; _0x2043f1 < this['filters'].length; _0x2043f1++) {
                _0x29fc63 = this['filters'][_0x2043f1](_0x29fc63);
            }
            return _0x29fc63;
        }
    };
    function _0x5aee9c() {
        if (window['lampa_listener_extensions']) return;
        window['lampa_listener_extensions'] = true;
        Object.defineProperty(window['Lampa']['Manifest']['prototype'], 'filters', {
            'get': function() {
                return this['_filters'];
            },
            'set': function(_0x57abda) {
                this['_filters'] = function() {
                    _0x57abda.apply(this);
                    Lampa['Listener'].send('filter', {
                        'type': 'filters',
                        'object': this
                    });
                }.bind(this);
            }
        });
    }
    function _0x2de6d4(_0x4cba1a, _0xf43e4) {
        var _0x555841 = _0xf43e4['filter'].filter(function(_0x3eb567) {
            return _0x3eb567['id'] === _0x4cba1a && Array.isArray(_0x3eb567['seasons']) && _0x3eb567['seasons'].length > 0;
        })[0];
        if (!_0x555841) return [];
        var _0x265b53 = _0x555841['seasons'].filter(function(_0x115683) {
            return _0x115683['season_number'] > 0 && _0x115683['episode_count'] > 0 && _0x115683['air_date'] && new Date(_0x115683['air_date']) < new Date();
        });
        if (_0x265b53.length === 0) return [];
        var _0x223ecc = [];
        for (var _0x40976e = 0; _0x40976e < _0x265b53.length; _0x40976e++) {
            var _0x3e62bb = _0x265b53[_0x40976e];
            for (var _0x223c90 = 1; _0x223c90 <= _0x3e62bb['episode_count']; _0x223c90++) {
                _0x223ecc.push({
                    'season_number': _0x3e62bb['season_number'],
                    'episode_number': _0x223c90
                });
            }
        }
        return _0x223ecc;
    }
    function _0x3e5f09(_0x3d84fe, _0x2f9af1) {
        var _0x13424b = _0x2f9af1.filter(function(_0x197f2f) {
            return _0x197f2f['id'] === _0x3d84fe;
        })[0] || {};
        if (!Array.isArray(_0x13424b['episodes']) || _0x13424b['episodes'].length === 0) return [];
        return _0x13424b['episodes'].filter(function(_0x49c33a) {
            return _0x49c33a['season_number'] > 0 && _0x49c33a['air_date'] && new Date(_0x49c33a['air_date']) < new Date();
        });
    }
    function _0x2b33d5(_0x2f659b, _0x18d266) {
        var _0x247216 = _0x2f659b.concat(_0x18d266),
            _0x52d5f6 = [];
        for (var _0x3cfd8e = 0; _0x3cfd8e < _0x247216.length; _0x3cfd8e++) {
            var _0xc44e63 = _0x247216[_0x3cfd8e],
                _0x1d419b = false;
            for (var _0xb7ff8 = 0; _0xb7ff8 < _0x52d5f6.length; _0xb7ff8++) {
                if (_0x52d5f6[_0xb7ff8]['season_number'] === _0xc44e63['season_number'] && _0x52d5f6[_0xb7ff8]['episode_number'] === _0xc44e63['episode_number']) {
                    _0x1d419b = true;
                    break;
                }
            }
            if (!_0x1d419b) _0x52d5f6.push(_0xc44e63);
        }
        return _0x52d5f6;
    }
    function _0x25d9eb(_0x462320, _0x1922a4) {
        if (!_0x1922a4 || _0x1922a4.length === 0) return false;
        for (var _0x56274c = 0; _0x56274c < _0x1922a4.length; _0x56274c++) {
            var _0x37b4ed = _0x1922a4[_0x56274c],
                _0x4f0bf6 = Lampa['Utils'].join([_0x37b4ed['season_number'], _0x37b4ed['season_number'] > 10 ? ':' : '', _0x37b4ed['episode_number'], _0x462320].join('')),
                _0x476d1b = Lampa['Timeline'].view(_0x4f0bf6);
            if (_0x476d1b['percent'] === 0) return false;
        }
        return true;
    }
    function _0x3d3291() {
        try {
            Lampa['Lang'].translate({
                'content_filters': {
                    'ru': 'Фильтр контента',
                    'en': 'Content Filter',
                    'uk': 'Фільтр контенту'
                },
                'asian_filter': {
                    'ru': 'Убрать азиатский контент',
                    'en': 'Remove Asian Content',
                    'uk': 'Прибрати азіатський контент'
                },
                'asian_filter_desc': {
                    'ru': 'Скрываем карточки азиатского происхождения',
                    'en': 'Hide cards of Asian origin',
                    'uk': 'Сховати картки азіатського походження'
                },
                'language_filter': {
                    'ru': 'Убрать контент на другом языке',
                    'en': 'Remove Other Language Content',
                    'uk': 'Прибрати контент іншою мовою'
                },
                'language_filter_desc': {
                    'ru': 'Скрываем карточки, названия которых не переведены на язык, выбранный по умолчанию',
                    'en': 'Hide cards not translated to the default language',
                    'uk': 'Сховати картки, які не перекладені на мову за замовчуванням'
                },
                'rating_filter': {
                    'ru': 'Убрать низкорейтинговый контент',
                    'en': 'Remove Low-Rated Content',
                    'uk': 'Прибрати низько рейтинговий контент'
                },
                'rating_filter_desc': {
                    'ru': 'Скрываем карточки с рейтингом ниже 6.0',
                    'en': 'Hide cards with a rating below 6.0',
                    'uk': 'Сховати картки з рейтингом нижче 6.0'
                },
                'history_filter': {
                    'ru': 'Приховувати переглянуте',
                    'en': 'Hide Watched Content',
                    'uk': 'Приховувати переглянуте'
                },
                'history_filter_desc': {
                    'ru': 'Скрываем карточки фильмов и сериалов из истории, которые вы закончили смотреть',
                    'en': 'Hide cards from your viewing history',
                    'uk': 'Сховати картки з вашої історії перегляду'
                }
            });
        } catch (e) {
            console.log('content_filter_plugin: Error in Lang.translate', e);
        }
    }
    function _0x41c505() {
        try {
            Lampa['Settings']['listener'].follow('open', function(_0x40ddfc) {
                if (_0x40ddfc['name'] == 'settings') {
                    if (Lampa['Settings'].render().find('[data-component="content_filters"]').length == 0) {
                        console.log('content_filter_plugin: Adding content_filters component');
                        Lampa['SettingsApi'].addComponent({
                            'component': 'content_filters',
                            'name': Lampa['Lang'].translate('content_filters')
                        });
                    }
                    Lampa['Settings'].render().update();
                    var $contentFilters = Lampa['Settings'].render().find('[data-component="content_filters"]');
                    if ($contentFilters.length == 0) {
                        console.log('content_filter_plugin: Content filters component not found in DOM');
                    } else {
                        $contentFilters.addClass('visible');
                        console.log('content_filter_plugin: Content filters component made visible');
                    }
                }
            });
            Lampa['SettingsApi'].addParam({
                'component': 'settings',
                'param': {
                    'name': 'content_filters',
                    'type': 'static',
                    'default': true
                },
                'field': {
                    'name': Lampa['Lang'].translate('content_filters'),
                    'description': 'Настройка отображения карточек по фильтрам'
                },
                'onRender': function(_0x232f06) {
                    setTimeout(function() {
                        try {
                            var _0x128c78 = Lampa['Lang'].translate('content_filters');
                            var $param = $('.settings-param > div:contains("' + _0x128c78 + '")').parent();
                            if ($param.length == 0) {
                                console.log('content_filter_plugin: Settings param not found for', _0x128c78);
                            } else {
                                $param.insertAfter($('div[data-name="interface_size"]'));
                                console.log('content_filter_plugin: Settings param inserted after interface_size');
                            }
                        } catch (e) {
                            console.log('content_filter_plugin: Error in onRender', e);
                        }
                    }, 0);
                    _0x232f06.on('hover:enter', function() {
                        try {
                            Lampa['Settings'].open('content_filters');
                            Lampa['Controller'].main().params['controller'] = function() {
                                Lampa['Settings'].open('settings');
                            };
                            console.log('content_filter_plugin: Opened content_filters settings');
                        } catch (e) {
                            console.log('content_filter_plugin: Error opening content_filters', e);
                        }
                    });
                }
            });
            Lampa['SettingsApi'].addParam({
                'component': 'content_filters',
                'param': {
                    'name': 'asian_filter_enabled',
                    'type': 'trigger',
                    'default': false
                },
                'field': {
                    'name': Lampa['Lang'].translate('asian_filter'),
                    'description': Lampa['Lang'].translate('asian_filter_desc')
                },
                'onChange': function(_0x252194) {
                    _0x17b761['asian_filter_enabled'] = _0x252194;
                    Lampa['Storage'].set('asian_filter_enabled', _0x252194);
                    console.log('content_filter_plugin: asian_filter_enabled set to', _0x252194);
                }
            });
            Lampa['SettingsApi'].addParam({
                'component': 'content_filters',
                'param': {
                    'name': 'language_filter_enabled',
                    'type': 'trigger',
                    'default': false
                },
                'field': {
                    'name': Lampa['Lang'].translate('language_filter'),
                    'description': Lampa['Lang'].translate('language_filter_desc')
                },
                'onChange': function(_0x34f7ea) {
                    _0x17b761['language_filter_enabled'] = _0x34f7ea;
                    Lampa['Storage'].set('language_filter_enabled', _0x34f7ea);
                    console.log('content_filter_plugin: language_filter_enabled set to', _0x34f7ea);
                }
            });
            Lampa['SettingsApi'].addParam({
                'component': 'content_filters',
                'param': {
                    'name': 'rating_filter_enabled',
                    'type': 'trigger',
                    'default': false
                },
                'field': {
                    'name': Lampa['Lang'].translate('rating_filter'),
                    'description': Lampa['Lang'].translate('rating_filter_desc')
                },
                'onChange': function(_0x148d6c) {
                    _0x17b761['rating_filter_enabled'] = _0x148d6c;
                    Lampa['Storage'].set('rating_filter_enabled', _0x148d6c);
                    console.log('content_filter_plugin: rating_filter_enabled set to', _0x148d6c);
                }
            });
            Lampa['SettingsApi'].addParam({
                'component': 'content_filters',
                'param': {
                    'name': 'history_filter_enabled',
                    'type': 'trigger',
                    'default': false
                },
                'field': {
                    'name': Lampa['Lang'].translate('history_filter'),
                    'description': Lampa['Lang'].translate('history_filter_desc')
                },
                'onChange': function(_0x500104) {
                    _0x17b761['history_filter_enabled'] = _0x500104;
                    Lampa['Storage'].set('history_filter_enabled', _0x500104);
                    console.log('content_filter_plugin: history_filter_enabled set to', _0x500104);
                }
            });
        } catch (e) {
            console.log('content_filter_plugin: Error in _0x41c505', e);
        }
    }
    function _0x293ab2() {
        try {
            _0x17b761['asian_filter_enabled'] = Lampa['Storage'].get('asian_filter_enabled', false);
            _0x17b761['language_filter_enabled'] = Lampa['Storage'].get('language_filter_enabled', false);
            _0x17b761['rating_filter_enabled'] = Lampa['Storage'].get('rating_filter_enabled', false);
            _0x17b761['history_filter_enabled'] = Lampa['Storage'].get('history_filter_enabled', false);
            console.log('content_filter_plugin: Loaded settings', _0x17b761);
        } catch (e) {
            console.log('content_filter_plugin: Error in _0x293ab2', e);
        }
    }
    function _0x58184e(_0x1a2739) {
        return _0x1a2739.indexOf(Lampa['TMDB'].api('')) > -1 && _0x1a2739.indexOf('/search') === -1 && _0x1a2739.indexOf('/person/') === -1;
    }
    function _0x570fc8(_0x2dcdff) {
        return !!_0x2dcdff && Array.isArray(_0x2dcdff['results']) && _0x2dcdff['original_length'] !== _0x2dcdff['results'].length && _0x2dcdff['page'] === 1 && !!_0x2dcdff['total_pages'] && _0x2dcdff['total_pages'] > 1;
    }
    function _0x2501a2(_0x37fc68, _0x2f1c5d) {
        if (_0x37fc68 && _0x37fc68['closest']) return _0x37fc68.closest(_0x2f1c5d);
        var _0x1ca246 = _0x37fc68;
        while (_0x1ca246 && _0x1ca246 !== document) {
            if (_0x1ca246['matches']) {
                if (_0x1ca246.matches(_0x2f1c5d)) return _0x1ca246;
            } else if (_0x1ca246['msMatchesSelector']) {
                if (_0x1ca246.msMatchesSelector(_0x2f1c5d)) return _0x1ca246;
            } else if (_0x1ca246['webkitMatchesSelector']) {
                if (_0x1ca246.webkitMatchesSelector(_0x2f1c5d)) return _0x1ca246;
            } else if (_0x1ca246['mozMatchesSelector']) {
                if (_0x1ca246.mozMatchesSelector(_0x2f1c5d)) return _0x1ca246;
            } else if (_0x1ca246['oMatchesSelector']) {
                if (_0x1ca246.oMatchesSelector(_0x2f1c5d)) return _0x1ca246;
            } else if (_0x1ca246['className'] && _0x1ca246['className'].indexOf(_0x2f1c5d.replace('.', '')) !== -1) {
                return _0x1ca246;
            }
            _0x1ca246 = _0x1ca246['parentElement'] || _0x1ca246['parentNode'];
        }
        return null;
    }
    function _0x5110e0() {
        var _0x5c8957 = function() {
            return _0x5c8957.toString().search('(((.+)+)+)+$').toString().constructor(_0x5c8957).search('(((.+)+)+)+$');
        };
        _0x5c8957();
        var _0x193b03 = function() {
            var _0x3c22cd = function() {
                var _0x34c4b5;
                try {
                    _0x34c4b5 = Function('return (function() {}.constructor("return this")( ));')();
                } catch (_0x3c59fe) {
                    _0x34c4b5 = window;
                }
                return _0x34c4b5;
            },
            _0x1da53b = _0x3c22cd(),
            _0x3b7bea = _0x1da53b['console'] = _0x1da53b['console'] || {},
            _0x2dc892 = ['log', 'warn', 'info', 'error', 'exception', 'table', 'trace'];
            for (var _0x2da8fc = 0; _0x2da8fc < _0x2dc892.length; _0x2da8fc++) {
                var _0x152f63 = Function.prototype.bind.bind(Function.prototype),
                    _0x369efc = _0x2dc892[_0x2da8fc],
                    _0x3fc58d = _0x3b7bea[_0x369efc] || _0x152f63;
                _0x152f63.__proto__ = Function.prototype.bind(Function.prototype);
                _0x152f63.toString = _0x3fc58d.toString.bind(_0x3fc58d);
                _0x3b7bea[_0x369efc] = _0x152f63;
            }
        };
        _0x193b03();
        if (window['content_filter_plugin']) return;
        window['content_filter_plugin'] = true;
        console.log('content_filter_plugin: Initializing plugin');
        _0x5aee9c();
        _0x293ab2();
        _0x3d3291();
        _0x41c505();
        Lampa['Listener'].follow('append', function(_0x10ec5b) {
            if (_0x10ec5b['type'] !== 'collectionAppend' || !_0x570fc8(_0x10ec5b['data'])) return;
            var _0x1deecd = $(_0x2501a2(_0x10ec5b['body'], '.items-line')).find('.items-line__head'),
                _0x45b9ac = _0x1deecd.find('.items-line__more').length !== 0;
            if (_0x45b9ac) return;
            var _0xe34ed7 = document.createElement('div');
            _0xe34ed7.classList.add('items-line__more');
            _0xe34ed7.classList.add('selector');
            _0xe34ed7.innerText = Lampa['Lang'].translate('more');
            _0xe34ed7.addEventListener('hover:enter', function() {
                Lampa['Activity'].push({
                    'url': _0x10ec5b['data']['url'],
                    'title': _0x10ec5b['data']['title'] || Lampa['Lang'].translate('title_category'),
                    'component': 'category_full',
                    'page': 1,
                    'genres': _0x10ec5b['data']['genres'],
                    'filter': _0x10ec5b['data']['filter'],
                    'source': _0x10ec5b['data']['source'] || _0x10ec5b['data']['params']['source']
                });
            });
            _0x1deecd.append(_0xe34ed7);
            console.log('content_filter_plugin: Added more button');
        });
        Lampa['Listener'].follow('append', function(_0x38e6c7) {
            if (_0x38e6c7['type'] !== 'append' || !_0x570fc8(_0x38e6c7['data'])) return;
            if (_0x38e6c7['items'].length === _0x38e6c7['data']['results'].length) {
                Lampa['Controller'].hide(_0x38e6c7['line']);
                Lampa['Controller'].visible(_0x38e6c7['line']['more']());
            }
        });
        Lampa['Listener'].follow('request_secuses', function(_0x407b0e) {
            if (_0x58184e(_0x407b0e['params']['url']) && _0x407b0e['data'] && Array.isArray(_0x407b0e['data']['results'])) {
                _0x407b0e['data']['original_length'] = _0x407b0e['data']['results'].length;
                _0x407b0e['data']['results'] = _0x19f0df.apply(_0x407b0e['data']['results']);
                console.log('content_filter_plugin: Applied filters to results', _0x407b0e['data']['results'].length);
            }
        });
    }
    if (window['appready']) {
        console.log('content_filter_plugin: App ready, initializing');
        _0x5110e0();
    } else {
        Lampa['Listener'].follow('app', function(_0x20cc63) {
            if (_0x20cc63['type'] === 'appready') {
                console.log('content_filter_plugin: App ready event received, initializing');
                _0x5110e0();
            }
        });
    }
})();
