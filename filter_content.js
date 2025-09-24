(function() {
    var _0x38fdd0 = _0x1ecb;

    // Регистрация плагина в Lampa.Manifest
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
    Lampa.Manifest.plugins['content_filter'] = {
        name: 'Content Filter',
        version: '1.0.0',
        description: 'Плагин для фильтрации контента по языку, рейтингу, истории и происхождению',
        status: 1, // Подтверждённый плагин
        author: 'YourName',
        url: 'https://example.com/content_filter.js'
    };

    function _0x132d() {
        var _0x453100 = ['isArray', 'category_full', 'name', 'Activity', 'Прибрати\x20низько\x20рейтинговий\x20контент', 'trigger', 'Фільтр\x20контенту', 'source', 'length', 'original_language', 'translate', 'language_filter', 'replace', 'find', 'constructor', 'Убрать\x20просмотренный\x20контент', 'hash', 'className', 'Arrays', 'apply', 'episode_count', 'add', 'origin', 'Скрываем\x20карточки\x20фильмов\x20и\x20сериалов\x20из\x20истории,\x20которые\x20вы\x20закончили\x20смотреть', 'trace', 'episodes', 'url', 'build', 'content_filter_plugin', 'episode_number', 'oMatchesSelector', 'air_date', 'parentElement', '.items-line__head', 'data', 'site', 'content_filters', 'line', 'join', 'language', 'season_number', 'Utils', 'SettingsApi', 'Controller', '1128812scyQPr', 'prototype', '114116tyndIc', '{}.constructor(\x22return\x20this\x22)(\x20)', 'render', 'parentNode', 'collectionAppend', 'Content\x20Filter', '10JoMVbn', 'api', 'Listener', '[data-component=\x22content_filters\x22]', 'Сховати\x20картки,\x20які\x20не\x20перекладені\x20на\x20мову\x20за\x20замовчуванням', '77320PPcYzA', 'check', 'Убрать\x20контент\x20на\x20другом\x20языке', 'Настройка\x20отображения\x20карточек\x20по\x20фильтрам', '117QyUMoS', 'visible', 'params', 'main', 'media_type', 'rating_filter', 'controller', 'Сховати\x20картки\x20з\x20рейтингом\x20нижче\x206.0', 'Приховувати\x20переглянуте', 'append', 'rating_filter_enabled', 'div', 'parent', 'Прибрати\x20азіатський\x20контент', 'original_length', 'Прибрати\x20контент\x20іншою\x20мовою', 'toLowerCase', 'favorite', 'div[data-name=\x22interface_size\x22]', 'Скрываем\x20карточки\x20с\x20рейтингом\x20ниже\x206.0', 'trailer', 'video', 'enabled', 'original_name', '/person/', 'history_filter_enabled', 'defineProperty', 'Manifest', 'Hide\x20cards\x20from\x20your\x20viewing\x20history', 'title', 'Card', 'error', 'percent', 'genres', 'history_filter', 'Hide\x20cards\x20not\x20translated\x20to\x20the\x20default\x20language', 'card', 'movie', 'view', 'Hide\x20Watched\x20Content', 'Hide\x20cards\x20with\x20a\x20rating\x20below\x206.0', 'bind', 'addComponent', 'Settings', 'history', 'msMatchesSelector', 'warn', 'timetable', 'webkitMatchesSelector', 'Favorite', '114OBqUhl', '.items-line__more', 'console', 'rating_filter_desc', 'language_filter_enabled', 'seasons', 'items', 'addEventListener', 'total_pages', 'return\x20(function()\x20', 'follow', 'hover:enter', 'asian_filter_desc', 'interface', 'first_air_date', 'push', 'hide', 'closest', '__proto__', 'Сховати\x20картки\x20з\x20вашої\x20історії\x20перегляду', 'Storage', 'exception', 'log', 'Noty', 'Remove\x20Asian\x20Content', '25ZrgQRe', 'innerText', 'info', '_build', 'Фильтр\x20контента', '1059306MUnmHp', 'toString', 'matches', 'get', 'original_title', '1859360dEMlnS', 'results', 'ready', 'Скрываем\x20карточки\x20азиатского\x20происхождения', 'addParam', '.settings-param\x20>\x20div:contains(\x22', '35624479MnKgJf', 'asian_filter', 'body', 'indexOf', 'appready', 'object', 'title_category', 'create', '1429533oYzlxR', 'show', 'set', 'items-line__more', 'vote_average', 'Lang', 'page', 'asian_filter_enabled', 'back', 'mozMatchesSelector', 'lampa_listener_extensions', 'type', 'more', 'insertAfter', 'open', 'static', 'own', 'Скрываем\x20карточки,\x20названия\x20которых\x20не\x20переведены\x20на\x20язык,\x20выбранный\x20по\x20умолчанию', 'bylampa', 'key', 'filters', 'filter'];
        _0x132d = function() {
            return _0x453100;
        };
        return _0x132d();
    }

    function _0x1ecb(_0xe76eb6, _0x1433dc) {
        var _0x16add1 = _0x132d();
        return _0x1ecb = function(_0x3cd729, _0x541d2f) {
            _0x3cd729 = _0x3cd729 - 0x17e;
            var _0x539919 = _0x16add1[_0x3cd729];
            return _0x539919;
        },
        _0x1ecb(_0xe76eb6, _0x1433dc);
    }

    var _0x17b761 = {
        'asian_filter_enabled': false,
        'language_filter_enabled': false,
        'rating_filter_enabled': false,
        'history_filter_enabled': false
    };

    var _0x19f0df = {
        'filters': [function(_0x48f6de) {
            var _0x2c449b = _0x1ecb;
            if (!_0x17b761[_0x2c449b(0x181)])
                return _0x48f6de;
            return _0x48f6de[_0x2c449b(0x18f)](function(_0x2bf78c) {
                var _0x231e4a = _0x2c449b;
                if (!_0x2bf78c || !_0x2bf78c[_0x231e4a(0x199)])
                    return !![];
                var _0x333cdb = _0x2bf78c[_0x231e4a(0x199)][_0x231e4a(0x1dd)]();
                var _0x39e8d1 = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                return _0x39e8d1[_0x231e4a(0x22b)](_0x333cdb) === -0x1;
            });
        }, function(_0x1447c4) {
            var _0x590a08 = _0x1ecb;
            if (!_0x17b761[_0x590a08(0x203)])
                return _0x1447c4;
            return _0x1447c4[_0x590a08(0x18f)](function(_0x39c6f8) {
                var _0x41e74b = _0x590a08;
                if (!_0x39c6f8)
                    return !![];
                var _0xf4a9ea = Lampa[_0x41e74b(0x213)][_0x41e74b(0x220)](_0x41e74b(0x1b7));
                var _0x5619a5 = _0x39c6f8[_0x41e74b(0x221)] || _0x39c6f8[_0x41e74b(0x1e4)];
                var _0x1e6d26 = _0x39c6f8[_0x41e74b(0x1ea)] || _0x39c6f8[_0x41e74b(0x192)];
                if (_0x39c6f8[_0x41e74b(0x199)] === _0xf4a9ea)
                    return !![];
                if (_0x39c6f8[_0x41e74b(0x199)] !== _0xf4a9ea && _0x1e6d26 !== _0x5619a5)
                    return !![];
                return ![];
            });
        }, function(_0x31db3d) {
            var _0x4e6f58 = _0x1ecb;
            if (!_0x17b761[_0x4e6f58(0x1d7)])
                return _0x31db3d;
            return _0x31db3d['filter'](function(_0x5477ab) {
                var _0x3a0702 = _0x4e6f58;
                if (!_0x5477ab)
                    return !![];
                var _0x2cef5a = _0x5477ab[_0x3a0702(0x1d1)] === _0x3a0702(0x1e2) || _0x5477ab[_0x3a0702(0x185)] === 'Trailer' || _0x5477ab[_0x3a0702(0x1b3)] === 'YouTube' || _0x5477ab[_0x3a0702(0x18d)] && _0x5477ab[_0x3a0702(0x192)] && _0x5477ab[_0x3a0702(0x192)][_0x3a0702(0x1dd)]()[_0x3a0702(0x22b)](_0x3a0702(0x1e1)) !== -0x1;
                if (_0x2cef5a)
                    return !![];
                if (!_0x5477ab[_0x3a0702(0x17e)] || _0x5477ab[_0x3a0702(0x17e)] === 0x0)
                    return ![];
                return _0x5477ab[_0x3a0702(0x17e)] >= 0x6;
            });
        }, function(_0x4f79a5) {
            var _0x2b5106 = _0x1ecb;
            if (!_0x17b761['history_filter_enabled'])
                return _0x4f79a5;
            var _0x451b28 = Lampa['Storage']['get'](_0x2b5106(0x1de), '{}');
            var _0x4e75fd = Lampa[_0x2b5106(0x213)]['cache'](_0x2b5106(0x1fc), 0x12c, []);
            return _0x4f79a5[_0x2b5106(0x18f)](function(_0x4d2122) {
                var _0x16587e = _0x2b5106;
                if (!_0x4d2122 || !_0x4d2122[_0x16587e(0x199)])
                    return !![];
                var _0x45052b = _0x4d2122['media_type'];
                !_0x45052b && (_0x45052b = !!_0x4d2122[_0x16587e(0x20d)] ? 'tv' : _0x16587e(0x1f2));
                var _0x48ad67 = Lampa[_0x16587e(0x1fe)][_0x16587e(0x1ca)](_0x4d2122);
                var _0x4689b7 = !!_0x48ad67 && !!_0x48ad67[_0x16587e(0x1f9)];
                var _0x34d757 = !!_0x48ad67 && _0x48ad67['thrown'];
                if (_0x34d757)
                    return ![];
                if (!_0x4689b7)
                    return !![];
                if (_0x4689b7 && _0x45052b === _0x16587e(0x1f2))
                    return ![];
                var _0x307868 = _0x2de6d4(_0x4d2122['id'], _0x451b28);
                var _0x389663 = _0x3e5f09(_0x4d2122['id'], _0x4e75fd);
                var _0x28dc8e = _0x2b33d5(_0x307868, _0x389663);
                var _0x2ea854 = _0x25d9eb(_0x4d2122[_0x16587e(0x221)] || _0x4d2122['original_name'], _0x28dc8e);
                return !_0x2ea854;
            });
        }],
        'apply': function(_0x3494fb) {
            var _0xaf7d28 = _0x1ecb;
            var _0x29fc63 = Lampa[_0xaf7d28(0x1a2)]['clone'](_0x3494fb);
            for (var _0x2043f1 = 0x0; _0x2043f1 < this[_0xaf7d28(0x18e)]['length']; _0x2043f1++) {
                _0x29fc63 = this[_0xaf7d28(0x18e)][_0x2043f1](_0x29fc63);
            }
            return _0x29fc63;
        }
    };

    function _0x5aee9c() {
        var _0x57722b = _0x1ecb;
        if (window[_0x57722b(0x184)])
            return;
        window['lampa_listener_extensions'] = !![];
        Object[_0x57722b(0x1e7)](window['Lampa'][_0x57722b(0x1eb)][_0x57722b(0x1bd)], _0x57722b(0x1ab), {
            'get': function() {
                var _0x3d7383 = _0x57722b;
                return this[_0x3d7383(0x21b)];
            },
            'set': function(_0x57abda) {
                var _0x12c713 = _0x57722b;
                this[_0x12c713(0x21b)] = function() {
                    var _0x117c88 = _0x12c713;
                    _0x57abda['apply'](this);
                    Lampa[_0x117c88(0x1c6)]['send'](_0x117c88(0x1f1), {
                        'type': _0x117c88(0x1ab),
                        'object': this
                    });
                }[_0x12c713(0x1f6)](this);
            }
        });
    }

    function _0x2de6d4(_0x4cba1a, _0xf43e4) {
        var _0x52cc95 = _0x1ecb;
        var _0x555841 = _0xf43e4[_0x52cc95(0x1f1)]['filter'](function(_0x3eb567) {
            var _0x502678 = _0x52cc95;
            return _0x3eb567['id'] === _0x4cba1a && Array['isArray'](_0x3eb567[_0x502678(0x204)]) && _0x3eb567[_0x502678(0x204)]['length'] > 0x0;
        })[0x0];
        if (!_0x555841)
            return [];
        var _0x265b53 = _0x555841[_0x52cc95(0x204)]['filter'](function(_0x115683) {
            var _0xcfe8fc = _0x52cc95;
            return _0x115683[_0xcfe8fc(0x1b8)] > 0x0 && _0x115683[_0xcfe8fc(0x1a4)] > 0x0 && _0x115683[_0xcfe8fc(0x1af)] && new Date(_0x115683[_0xcfe8fc(0x1af)]) < new Date();
        });
        if (_0x265b53[_0x52cc95(0x198)] === 0x0)
            return [];
        var _0x223ecc = [];
        for (var _0x40976e = 0x0; _0x40976e < _0x265b53[_0x52cc95(0x198)]; _0x40976e++) {
            var _0x3e62bb = _0x265b53[_0x40976e];
            for (var _0x223c90 = 0x1; _0x223c90 <= _0x3e62bb[_0x52cc95(0x1a4)]; _0x223c90++) {
                _0x223ecc[_0x52cc95(0x20e)]({
                    'season_number': _0x3e62bb[_0x52cc95(0x1b8)],
                    'episode_number': _0x223c90
                });
            }
        }
        return _0x223ecc;
    }

    function _0x3e5f09(_0x3d84fe, _0x2f9af1) {
        var _0x2188e9 = _0x1ecb;
        var _0x13424b = _0x2f9af1['filter'](function(_0x197f2f) {
            return _0x197f2f['id'] === _0x3d84fe;
        })[0x0] || {};
        if (!Array[_0x2188e9(0x190)](_0x13424b[_0x2188e9(0x1a9)]) || _0x13424b[_0x2188e9(0x1a9)][_0x2188e9(0x198)] === 0x0)
            return [];
        return _0x13424b[_0x2188e9(0x1a9)][_0x2188e9(0x18f)](function(_0x49c33a) {
            var _0x2893f6 = _0x2188e9;
            return _0x49c33a['season_number'] > 0x0 && _0x49c33a[_0x2893f6(0x1af)] && new Date(_0x49c33a[_0x2893f6(0x1af)]) < new Date();
        });
    }

    function _0x2b33d5(_0x2f659b, _0x18d266) {
        var _0x264cb0 = _0x1ecb;
        var _0x247216 = _0x2f659b['concat'](_0x18d266);
        var _0x52d5f6 = [];
        for (var _0x3cfd8e = 0x0; _0x3cfd8e < _0x247216[_0x264cb0(0x198)]; _0x3cfd8e++) {
            var _0xc44e63 = _0x247216[_0x3cfd8e];
            var _0x1d419b = ![];
            for (var _0xb7ff8 = 0x0; _0xb7ff8 < _0x52d5f6['length']; _0xb7ff8++) {
                if (_0x52d5f6[_0xb7ff8][_0x264cb0(0x1b8)] === _0xc44e63['season_number'] && _0x52d5f6[_0xb7ff8][_0x264cb0(0x1ad)] === _0xc44e63[_0x264cb0(0x1ad)]) {
                    _0x1d419b = !![];
                    break;
                }
            }
            !_0x1d419b && _0x52d5f6[_0x264cb0(0x20e)](_0xc44e63);
        }
        return _0x52d5f6;
    }

    function _0x25d9eb(_0x462320, _0x1922a4) {
        var _0xde3c8 = _0x1ecb;
        if (!_0x1922a4 || _0x1922a4['length'] === 0x0)
            return ![];
        for (var _0x56274c = 0x0; _0x56274c < _0x1922a4[_0xde3c8(0x198)]; _0x56274c++) {
            var _0x37b4ed = _0x1922a4[_0x56274c];
            var _0x4f0bf6 = Lampa[_0xde3c8(0x1b9)][_0xde3c8(0x1a0)]([_0x37b4ed[_0xde3c8(0x1b8)], _0x37b4ed[_0xde3c8(0x1b8)] > 0xa ? ':' : '', _0x37b4ed['episode_number'], _0x462320][_0xde3c8(0x1b6)](''));
            var _0x476d1b = Lampa['Timeline'][_0xde3c8(0x1f3)](_0x4f0bf6);
            if (_0x476d1b[_0xde3c8(0x1ed)] === 0x0)
                return ![];
        }
        return !![];
    }

    function _0x3d3291() {
        var _0x4255a7 = _0x1ecb;
        Lampa['Lang'][_0x4255a7(0x1a5)]({
            'content_filters': {
                'ru': _0x4255a7(0x21c),
                'en': _0x4255a7(0x1c3),
                'uk': _0x4255a7(0x196)
            },
            'asian_filter': {
                'ru': 'Убрать\x20азиатский\x20контент',
                'en': _0x4255a7(0x217),
                'uk': _0x4255a7(0x1da)
            },
            'asian_filter_desc': {
                'ru': _0x4255a7(0x225),
                'en': 'Hide\x20cards\x20of\x20Asian\x20origin',
                'uk': 'Сховати\x20картки\x20азіатського\x20походження'
            },
            'language_filter': {
                'ru': _0x4255a7(0x1cb),
                'en': 'Remove\x20Other\x20Language\x20Content',
                'uk': _0x4255a7(0x1dc)
            },
            'language_filter_desc': {
                'ru': _0x4255a7(0x18b),
                'en': _0x4255a7(0x1f0),
                'uk': _0x4255a7(0x1c8)
            },
            'rating_filter': {
                'ru': 'Убрать\x20низкорейтинговый\x20контент',
                'en': 'Remove\x20Low-Rated\x20Content',
                'uk': _0x4255a7(0x194)
            },
            'rating_filter_desc': {
                'ru': _0x4255a7(0x1e0),
                'en': _0x4255a7(0x1f5),
                'uk': _0x4255a7(0x1d4)
            },
            'history_filter': {
                'ru': _0x4255a7(0x19f),
                'en': _0x4255a7(0x1f4),
                'uk': _0x4255a7(0x1d5)
            },
            'history_filter_desc': {
                'ru': _0x4255a7(0x1a7),
                'en': _0x4255a7(0x1e9),
                'uk': _0x4255a7(0x212)
            }
        });
    }

    function _0x41c505() {
        var _0x2c87df = _0x1ecb;
        Lampa[_0x2c87df(0x1f8)]['listener'][_0x2c87df(0x209)](_0x2c87df(0x188), function(_0x40ddfc) {
            var _0x5e2390 = _0x2c87df;
            _0x40ddfc['name'] == _0x5e2390(0x1d0) && (Lampa[_0x5e2390(0x1f8)][_0x5e2390(0x1d0)]()[_0x5e2390(0x1c0)]()['find'](_0x5e2390(0x1c7))[_0x5e2390(0x198)] == 0x0 && Lampa['SettingsApi'][_0x5e2390(0x1f7)]({
                'component': _0x5e2390(0x1b4),
                'name': Lampa[_0x5e2390(0x17f)][_0x5e2390(0x19a)](_0x5e2390(0x1b4))
            }),
            Lampa[_0x5e2390(0x1f8)][_0x5e2390(0x1d0)]()['update'](),
            Lampa['Settings'][_0x5e2390(0x1d0)]()[_0x5e2390(0x1c0)]()['find'](_0x5e2390(0x1c7))['addClass'](_0x5e2390(0x20f)));
        });
        Lampa[_0x2c87df(0x1ba)][_0x2c87df(0x226)]({
            'component': _0x2c87df(0x20c),
            'param': {
                'name': _0x2c87df(0x1b4),
                'type': _0x2c87df(0x189),
                'default': !![]
            },
            'field': {
                'name': Lampa['Lang']['translate']('content_filters'),
                'description': _0x2c87df(0x1cc)
            },
            'onRender': function(_0x232f06) {
                var _0x44db38 = _0x2c87df;
                setTimeout(function() {
                    var _0x523ee9 = _0x1ecb;
                    var _0x128c78 = Lampa['Lang'][_0x523ee9(0x19a)](_0x523ee9(0x1b4));
                    $(_0x523ee9(0x227) + _0x128c78 + '\x22)')[_0x523ee9(0x1d9)]()[_0x523ee9(0x187)]($(_0x523ee9(0x1df)));
                }, 0x0);
                _0x232f06['on'](_0x44db38(0x20a), function() {
                    var _0x4700c4 = _0x44db38;
                    Lampa[_0x4700c4(0x1f8)][_0x4700c4(0x22f)](_0x4700c4(0x1b4));
                    Lampa[_0x4700c4(0x1bb)][_0x4700c4(0x1e3)]()[_0x4700c4(0x1d3)][_0x4700c4(0x182)] = function() {
                        var _0x39d845 = _0x4700c4;
                        Lampa['Settings'][_0x39d845(0x22f)](_0x39d845(0x20c));
                    };
                });
            }
        });
        Lampa['SettingsApi']['addParam']({
            'component': _0x2c87df(0x1b4),
            'param': {
                'name': _0x2c87df(0x181),
                'type': 'trigger',
                'default': ![]
            },
            'field': {
                'name': Lampa[_0x2c87df(0x17f)][_0x2c87df(0x19a)](_0x2c87df(0x229)),
                'description': Lampa[_0x2c87df(0x17f)][_0x2c87df(0x19a)](_0x2c87df(0x20b))
            },
            'onChange': function(_0x252194) {
                var _0x3d979a = _0x2c87df;
                _0x17b761[_0x3d979a(0x181)] = _0x252194;
                Lampa[_0x3d979a(0x213)][_0x3d979a(0x232)](_0x3d979a(0x181), _0x252194);
            }
        });
        Lampa[_0x2c87df(0x1ba)]['addParam']({
            'component': _0x2c87df(0x1b4),
            'param': {
                'name': _0x2c87df(0x203),
                'type': _0x2c87df(0x195),
                'default': ![]
            },
            'field': {
                'name': Lampa[_0x2c87df(0x17f)][_0x2c87df(0x19a)](_0x2c87df(0x19b)),
                'description': Lampa['Lang'][_0x2c87df(0x19a)]('language_filter_desc')
            },
            'onChange': function(_0x34f7ea) {
                var _0x474cd1 = _0x2c87df;
                _0x17b761[_0x474cd1(0x203)] = _0x34f7ea;
                Lampa[_0x474cd1(0x213)][_0x474cd1(0x232)]('language_filter_enabled', _0x34f7ea);
            }
        });
        Lampa[_0x2c87df(0x1ba)][_0x2c87df(0x226)]({
            'component': _0x2c87df(0x1b4),
            'param': {
                'name': _0x2c87df(0x1d7),
                'type': _0x2c87df(0x195),
                'default': ![]
            },
            'field': {
                'name': Lampa[_0x2c87df(0x17f)][_0x2c87df(0x19a)](_0x2c87df(0x1d2)),
                'description': Lampa[_0x2c87df(0x17f)][_0x2c87df(0x19a)](_0x2c87df(0x202))
            },
            'onChange': function(_0x148d6c) {
                var _0x5e4c35 = _0x2c87df;
                _0x17b761[_0x5e4c35(0x1d7)] = _0x148d6c;
                Lampa[_0x5e4c35(0x213)]['set']('rating_filter_enabled', _0x148d6c);
            }
        });
        Lampa[_0x2c87df(0x1ba)]['addParam']({
            'component': _0x2c87df(0x1b4),
            'param': {
                'name': 'history_filter_enabled',
                'type': _0x2c87df(0x195),
                'default': ![]
            },
            'field': {
                'name': Lampa[_0x2c87df(0x17f)][_0x2c87df(0x19a)](_0x2c87df(0x1ef)),
                'description': Lampa[_0x2c87df(0x17f)]['translate']('history_filter_desc')
            },
            'onChange': function(_0x500104) {
                var _0x358375 = _0x2c87df;
                _0x17b761[_0x358375(0x1e6)] = _0x500104;
                Lampa[_0x358375(0x213)][_0x358375(0x232)](_0x358375(0x1e6), _0x500104);
            }
        });
    }

    function _0x293ab2() {
        var _0x3afc85 = _0x1ecb;
        _0x17b761[_0x3afc85(0x181)] = Lampa[_0x3afc85(0x213)]['get'](_0x3afc85(0x181), ![]);
        _0x17b761['language_filter_enabled'] = Lampa[_0x3afc85(0x213)]['get'](_0x3afc85(0x203), ![]);
        _0x17b761[_0x3afc85(0x1d7)] = Lampa[_0x3afc85(0x213)][_0x3afc85(0x220)](_0x3afc85(0x1d7), ![]);
        _0x17b761[_0x3afc85(0x1e6)] = Lampa[_0x3afc85(0x213)][_0x3afc85(0x220)](_0x3afc85(0x1e6), ![]);
    }

    function _0x58184e(_0x1a2739) {
        return true; // Всегда возвращает true
    }

    function _0x570fc8(_0x2dcdff) {
        var _0x569814 = _0x1ecb;
        return !!_0x2dcdff && Array[_0x569814(0x190)](_0x2dcdff['results']) && _0x2dcdff[_0x569814(0x1db)] !== _0x2dcdff['results']['length'] && _0x2dcdff[_0x569814(0x180)] === 0x1 && !!_0x2dcdff[_0x569814(0x207)] && _0x2dcdff[_0x569814(0x207)] > 0x1;
    }

    function _0x2501a2(_0x37fc68, _0x2f1c5d) {
        var _0x53b397 = _0x1ecb;
        if (_0x37fc68 && _0x37fc68[_0x53b397(0x210)])
            return _0x37fc68[_0x53b397(0x210)](_0x2f1c5d);
        var _0x1ca246 = _0x37fc68;
        while (_0x1ca246 && _0x1ca246 !== document) {
            if (_0x1ca246[_0x53b397(0x21f)]) {
                if (_0x1ca246[_0x53b397(0x21f)](_0x2f1c5d))
                    return _0x1ca246;
            } else {
                if (_0x1ca246[_0x53b397(0x1fa)]) {
                    if (_0x1ca246[_0x53b397(0x1fa)](_0x2f1c5d))
                        return _0x1ca246;
                } else {
                    if (_0x1ca246['webkitMatchesSelector']) {
                        if (_0x1ca246[_0x53b397(0x1fd)](_0x2f1c5d))
                            return _0x1ca246;
                    } else {
                        if (_0x1ca246['mozMatchesSelector']) {
                            if (_0x1ca246[_0x53b397(0x183)](_0x2f1c5d))
                                return _0x1ca246;
                        } else {
                            if (_0x1ca246[_0x53b397(0x1ae)]) {
                                if (_0x1ca246[_0x53b397(0x1ae)](_0x2f1c5d))
                                    return _0x1ca246;
                            } else {
                                if (_0x1ca246['className'] && _0x1ca246[_0x53b397(0x1a1)][_0x53b397(0x22b)](_0x2f1c5d[_0x53b397(0x19c)]('.', '')) !== -0x1)
                                    return _0x1ca246;
                            }
                        }
                    }
                }
            }
            _0x1ca246 = _0x1ca246[_0x53b397(0x1b0)] || _0x1ca246[_0x53b397(0x1c1)];
        }
        return null;
    }

    function _0x5110e0() {
        var _0x5cc5ec = _0x1ecb;
        if (window[_0x5cc5ec(0x1ac)]) return;
        window[_0x5cc5ec(0x1ac)] = !![];
        _0x5aee9c();
        _0x293ab2();
        _0x3d3291();
        _0x41c505();
        Lampa[_0x5cc5ec(0x1c6)][_0x5cc5ec(0x209)](_0x5cc5ec(0x1b5), function(_0x10ec5b) {
            var _0x96f872 = _0x5cc5ec;
            if (_0x10ec5b['type'] !== _0x96f872(0x1ce) || !_0x570fc8(_0x10ec5b[_0x96f872(0x1b2)])) return;
            var _0x1deecd = $(_0x2501a2(_0x10ec5b[_0x96f872(0x22a)], '.items-line'))[_0x96f872(0x19d)](_0x96f872(0x1b1));
            var _0x45b9ac = _0x1deecd[_0x96f872(0x19d)](_0x96f872(0x200))['length'] !== 0x0;
            if (_0x45b9ac) return;
            var _0xe34ed7 = document['createElement'](_0x96f872(0x1d8));
            _0xe34ed7['classList']['add'](_0x96f872(0x233));
            _0xe34ed7['classList'][_0x96f872(0x1a5)]('selector');
            _0xe34ed7[_0x96f872(0x219)] = Lampa[_0x96f872(0x17f)][_0x96f872(0x19a)](_0x96f872(0x186));
            _0xe34ed7[_0x96f872(0x206)](_0x96f872(0x20a), function() {
                var _0x4e86c8 = _0x96f872;
                Lampa[_0x4e86c8(0x193)][_0x4e86c8(0x20e)]({
                    'url': _0x10ec5b[_0x4e86c8(0x1b2)]['url'],
                    'title': _0x10ec5b[_0x4e86c8(0x1b2)][_0x4e86c8(0x1ea)] || Lampa[_0x4e86c8(0x17f)][_0x4e86c8(0x19a)](_0x4e86c8(0x22e)),
                    'component': _0x4e86c8(0x191),
                    'page': 0x1,
                    'genres': _0x10ec5b[_0x4e86c8(0x1cf)][_0x4e86c8(0x1ee)],
                    'filter': _0x10ec5b[_0x4e86c8(0x1b2)][_0x4e86c8(0x18f)],
                    'source': _0x10ec5b[_0x4e86c8(0x1b2)]['source'] || _0x10ec5b[_0x4e86c8(0x1cf)][_0x4e86c8(0x22d)][_0x4e86c8(0x197)]
                });
            });
            _0x1deecd[_0x96f872(0x1d6)](_0xe34ed7);
        });
        Lampa[_0x5cc5ec(0x1c6)][_0x5cc5ec(0x209)](_0x5cc5ec(0x1b5), function(_0x38e6c7) {
            var _0x52db0f = _0x5cc5ec;
            if (_0x38e6c7[_0x52db0f(0x185)] !== _0x52db0f(0x1d6) || !_0x570fc8(_0x38e6c7['data'])) return;
            _0x38e6c7[_0x52db0f(0x205)][_0x52db0f(0x198)] === _0x38e6c7['data'][_0x52db0f(0x223)]['length'] && Lampa[_0x52db0f(0x1bb)][_0x52db0f(0x18a)](_0x38e6c7['line']) && Lampa['Controller'][_0x52db0f(0x1c2)](_0x38e6c7[_0x52db0f(0x1b5)]['more']());
        });
        Lampa[_0x5cc5ec(0x1c6)][_0x5cc5ec(0x209)]('request_secuses', function(_0x407b0e) {
            var _0xf247e7 = _0x5cc5ec;
            if (_0x58184e(_0x407b0e['params'][_0xf247e7(0x1aa)]) && _0x407b0e['data'] && Array[_0xf247e7(0x190)](_0x407b0e[_0xf247e7(0x1b2)]['results'])) {
                _0x407b0e['data'][_0xf247e7(0x1db)] = _0x407b0e['data'][_0xf247e7(0x223)][_0xf247e7(0x198)];
                _0x407b0e[_0xf247e7(0x1b2)][_0xf247e7(0x223)] = _0x19f0df['apply'](_0x407b0e[_0xf247e7(0x1b2)]['results']);
            }
        });
    }

    window[_0x38fdd0(0x22c)] ? _0x5110e0() : Lampa[_0x38fdd0(0x1c6)]['follow']('app', function(_0x20cc63) {
        var _0x1e06bf = _0x38fdd0;
        _0x20cc63['type'] === _0x1e06bf(0x224) && _0x5110e0();
    });
})();
