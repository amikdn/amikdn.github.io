;(function () {
    'use strict';

    Lampa.Platform.tv();

    function _0x46dc(_0x5d37fe, _0x17b3db) {
        var _0x2201c6 = _0x5481();
        return _0x46dc = function (_0xfbb6ef, _0x3410a6) {
            _0xfbb6ef = _0xfbb6ef - 0x91;
            var _0x371b81 = _0x2201c6[_0xfbb6ef];
            return _0x371b81;
        }, _0x46dc(_0x5d37fe, _0x17b3db);
    }

    // Первый IIFE: настройка сдвигов
    (function (_0x36ea34, _0x29f6d6) {
        var _0x3e9f7e = _0x46dc,
            _0x32657c = _0x36ea34();
        while (true) {
            try {
                var _0xd0bbca = -parseInt(_0x3e9f7e(0xb5)) / 1
                    + parseInt(_0x3e9f7e(0x9c)) / 2 * (-parseInt(_0x3e9f7e(0x91)) / 3)
                    + parseInt(_0x3e9f7e(0x9d)) / 4
                    + -parseInt(_0x3e9f7e(0xb8)) / 5 * (-parseInt(_0x3e9f7e(0xb6)) / 6)
                    + -parseInt(_0x3e9f7e(0xbd)) / 7
                    + -parseInt(_0x3e9f7e(0x94)) / 8 * (parseInt(_0x3e9f7e(0xac)) / 9)
                    + parseInt(_0x3e9f7e(0x9b)) / 10 * (parseInt(_0x3e9f7e(0xa6)) / 11);
                if (_0xd0bbca === _0x29f6d6) break;
                else _0x32657c.push(_0x32657c.shift());
            } catch (e) {
                _0x32657c.push(_0x32657c.shift());
            }
        }
    }(_0x5481, 0x34f52));

    // Второй IIFE: основная логика и запуск
    (function () {
        var _0x27e607 = _0x46dc,
            _0xdf95c5 = (function () {
                var _0x1ccdf0 = true;
                return function (_0xb5f84e, _0xc953c1) {
                    var _0x2d531f = _0x1ccdf0 ? function () {
                        if (_0xc953c1) {
                            var _0x5dc649 = _0xc953c1.apply(_0xb5f84e, arguments);
                            _0xc953c1 = null;
                            return _0x5dc649;
                        }
                    } : function () {};
                    _0x1ccdf0 = false;
                    return _0x2d531f;
                };
            }()),
            _0x5ba9bc = (function () {
                var _0x480539 = true;
                return function (_0x326f9e, _0x87a30e) {
                    var _0x51f8e0 = _0x480539 ? function () {
                        var _0x315b7e = _0x46dc;
                        if (_0x87a30e) {
                            var _0xbe7b07 = _0x87a30e[_0x315b7e(0xb7)](_0x326f9e, arguments);
                            _0x87a30e = null;
                            return _0xbe7b07;
                        }
                    } : function () {};
                    _0x480539 = false;
                    return _0x51f8e0;
                };
            }());

        function _0x52a4d3() {
            var _0x2b9cf3 = _0x46dc,
                _0x2f2962 = _0xdf95c5(this, function () {
                    var _0x59e4d7 = _0x46dc;
                    return _0x2f2962.toString().replace(_0x59e4d7(0xae)).split('').reverse().join('') === _0x2f2962.toString().replace(_0x59e4d7(0xae));
                });
            _0x2f2962();

            var _0x1b988d = _0x5ba9bc(this, function () {
                var _0x43a117 = _0x46dc,
                    _0xf8d389 = function () {
                        try {
                            return Function('return (function(){ })')();
                        } catch {
                            return window;
                        }
                    },
                    _0x62bba9 = _0xf8d389(),
                    _0x2feb0e = _0x62bba9.console = _0x62bba9[_0x43a117(0xa9)] || {},
                    _0x82a894 = ['log', 'warn', 'error', 'info', 'trace'];
                for (var _0x2fb310 = 0; _0x2fb310 < _0x82a894.length; _0x2fb310++) {
                    var _0x420f37 = _0x82a894[_0x2fb310];
                    _0x2feb0e[_0x420f37] = function () {};
                }
            });
            _0x1b988d();

            Lampa.Listener.follow('request_secuses', function (_0x55e51a) {
                if (_0x55e51a.data.success) {
                    var _0x4303a0 = Lampa.Api.active();
                    _0x4303a0.url = 'request_secuses';
                    Lampa.Storage.set('source', 'request_secuses', true);
                    Lampa.Api.save(_0x4303a0);
                }
            });

            var _0x43e9c3 = setInterval(function () {
                if (typeof window.Storage !== 'undefined' &&
                    (window.localStorage.fixdcma || window.lampa_settings.fixdcma)) {
                    clearInterval(_0x43e9c3);
                    if (window.lampa_settings.fixdcma) {
                        window.localStorage.fixdcma = false;
                    }
                }
            }, 0x64);
        }

        if (window.appready) {
            _0x52a4d3();
        } else {
            Lampa.Listener.follow('app:ready', function (e) {
                if (e.type === 'ready') _0x52a4d3();
            });
        }
    }());

    function _0x5481() {
        var _0x92b9f2 = [
            'warn', 'fixdcma', '3495141ucWRmA', 'data', '(((.+)+)+)+$',
            'info', 'dcma', '{}.constructor("return this")()', 'Listener',
            'tmdb', 'exception', '282696QzOMSH', '126yNVqBi', 'apply',
            '59100mVgFAY', 'Noty', 'cub', 'bind', 'toString', '1580796TnyFYk',
            'Ошибка доступа', 'table', 'Storage', '20442ADyBlh', 'follow',
            'Activity', '8ulmqjk', 'undefined', 'ready', 'replace',
            'return (function() ', 'constructor', 'origin', '84370nscbUW',
            '88EIwBTw', '510528GkUHDI', 'lampa_settings', 'blocked', 'app',
            'show', 'log', 'source', 'prototype', 'search', '1353cISTpm',
            'Manifest', 'set', 'console'
        ];
        _0x5481 = function () { return _0x92b9f2; };
        return _0x5481();
    }

}());
