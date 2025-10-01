(function () {
    'use strict';

    // Инициализация TV-режима Lampa
    Lampa.Platform.tv();

    // Объект с константами и функциями
    const utils = {
        selectboxItemLock: 'selectbox-item__lock',
        display: 'display',
        none: 'none',
        apply: function (fn, arg) { return fn(arg); },
        settingsAccountPremium: '.settings--account-premium:contains(CUB Premium)',
        accountUse: '[data-name="account_use"]',
        viewed: 'Просмотрено',
        settingsAccountPremiumSelector: '.settings--account-premium',
        premium: 'premium',
        equal: function (a, b) { return a == b; },
        serverCheck: 'server_check',
        settingsAccount: '[data-name="account"]',
        hideIfNotLampa: 'hide_if_not_lampa',
        strictEqual: function (a, b) { return a === b; },
        blackFridayButton: '.black-friday__button',
        appReady: 'appready',
        applyWithArgs: function (fn, arg1, arg2) { return fn(arg1, arg2); },
        applyWithThreeArgs: function (fn, arg1, arg2, arg3) { return fn(arg1, arg2, arg3); },
        lessThan: function (a, b) { return a < b; },
        region: 'region',
        returnString: function (str) { return str; },
        concat: function (a, b) { return a + b; },
        settingsAccountPremiumBlink: '.settings--account-premium .icon--blink',
        greaterThan: function (a, b) { return a > b; },
        call: function (fn, arg) { return fn(arg); },
        blink: 'blink',
        blackFridayButtonSelector: '.black-friday__button',
        activity: 'activity',
        open: 'open',
        settings: 'settings',
        execute: function (fn) { return fn(); },
        regex: '(((.+)+)+)+$',
        styleDisplayNone: '.lampa_block { display: none }',
        code: '{"code":"uk","time":',
        account: 'account',
        adServer: '.ad-server'
    };

    // Самореферентная функция для анти-дебага (оставлена для совместимости)
    const debugProtect1 = (function () {
        var flag = true;
        return function (context, fn) {
            var wrapper = flag ? function () {
                if (fn) {
                    var result = fn.apply(context, arguments);
                    fn = null;
                    return result;
                }
            } : function () {};
            flag = false;
            return wrapper;
        };
    })();

    // Вторая самореферентная функция для анти-дебага
    const debugProtect2 = (function () {
        var flag = true;
        return function (context, fn) {
            var wrapper = flag ? function () {
                if (fn) {
                    var result = fn.apply(context, arguments);
                    fn = null;
                    return result;
                }
            } : function () {};
            flag = false;
            return wrapper;
        };
    })();

    // Инициализация настроек Lampa
    var lampa_settings = {
        socket_use: false,
        socket_url: undefined,
        socket_methods: [],
        account_use: true,
        account_sync: true,
        plugins_use: true,
        plugins_store: true,
        torrents_use: true,
        white_use: false,
        lang_use: true,
        read_only: false,
        dcma: false,
        push_state: true,
        iptv: false,
        feed: false
    };
    window.lampa_settings = lampa_settings;

    // Настройки отключения функций
    var disable_features = {
        dmca: true,
        reactions: false,
        discuss: false,
        ai: true,
        subscribe: true,
        blacklist: true,
        persons: true,
        ads: true,
        trailers: false
    };
    window.lampa_settings.disable_features = disable_features;

    // Функция для скрытия элементов
    function hideElements() {
        setTimeout(function () {
            $(utils.selectboxItemLock).parent().css(utils.display, utils.none);
            if (!$(utils.accountUse).length) {
                $(utils.settingsAccountPremium).parent().remove();
            }
        }, 1000);
    }

    // MutationObserver для мониторинга DOM
    function observeDOM() {
        var observerConfig = {
            childList: true,
            subtree: true
        };
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; utils.lessThan(i, mutations.length); i++) {
                var mutation = mutations[i];
                if (utils.equal(mutation.type, 'childList')) {
                    var elements = document.getElementsByClassName(utils.selectboxItemLock);
                    if (elements.length > 0) {
                        if (flag === 0) {
                            flag = 1;
                            utils.execute(hideElements);
                            utils.applyWithArgs(setTimeout, function () {
                                flag = 0;
                            }, 500);
                        }
                    }
                }
            }
        });
        observer.observe(document.body, observerConfig);
    }
    var flag = 0;

    // Функция установки региона и стилей с восстановленным setTimeout
    function setRegionAndStyles() {
        var styleElement = document.createElement('style');
        styleElement.innerHTML = utils.styleDisplayNone;
        document.body.appendChild(styleElement);
        $(document).ready(function () {
            var now = new Date();
            var timestamp = now.getTime();
            localStorage.setItem(utils.region, utils.concat(utils.code + timestamp, '}'));
        });
        // Восстановленный блок setTimeout без проверки window.location.origin
        setTimeout(function () {
            $(utils.adServer).hide();
            if ($(utils.accountUse).length > 0) {
                $(utils.settingsAccountPremiumSelector).remove();
            }
            if ($(utils.blackFridayButtonSelector).length > 0) {
                $(utils.blackFridayButton).remove();
            }
            if ($(utils.selectboxItemLock).length > 0) {
                $(utils.selectboxItemLock).remove();
            }
        }, 1000);
    }

    // Анти-дебаг защита консоли
    var consoleProtect = debugProtect2(this, function () {
        var console = window.console = window.console || {};
        var methods = ['log', 'debug', 'info', 'warn', 'error', 'exception', 'table'];
        for (var i = 0; i < methods.length; i++) {
            var method = methods[i];
            var original = console[method] || function () {};
            console[method] = original;
            console[method].toString = debugProtect2.toString.bind(debugProtect2);
        }
    });
    utils.execute(consoleProtect);

    // Обработчики событий Lampa с проверкой на существование объектов
    if (Lampa.Settings?.listener) {
        Lampa.Settings.listener.follow(utils.open, function (e) {
            if (utils.equal(e.name, utils.account)) {
                utils.applyWithArgs(setTimeout, function () {
                    $(utils.settingsAccountPremiumSelector).remove();
                    $('.settings--account-premium:contains("CUB Premium")').remove();
                }, 1000);
            }
            if (utils.equal(e.name, 'server')) {
                if (utils.strictEqual(document.querySelector(utils.settingsAccountPremiumSelector), null)) {
                    $('.settings--account').remove();
                }
            }
        });
    } else {
        console.warn('Lampa.Settings.listener is undefined, skipping event subscription');
    }

    if (Lampa.Subscribe?.listener) {
        Lampa.Subscribe.listener.follow(utils.activity, function (e) {
            if (utils.equal(e.type, utils.activity)) {
                $(utils.blackFridayButtonSelector).on('hover:enter', function () {
                    utils.execute(hideElements);
                });
            }
        });

        Lampa.Subscribe.listener.follow(utils.settings, function (e) {
            if (utils.equal(e.type, utils.activity)) {
                if (utils.strictEqual(Lampa.Activity.active().component, utils.account)) {
                    $(utils.settings).filter(function () {
                        var text = $(this).text().replace(/\d+$/, '').trim();
                        return [utils.viewed, 'Просмотрено', utils.settingsAccountPremium, '.settings--account-premium .icon--blink', utils.premium].includes(text);
                    }).remove();
                    utils.applyWithArgs(setTimeout, function () {
                        if (document.querySelector(utils.blackFridayButton) !== null) {
                            $(utils.blackFridayButtonSelector).remove();
                        }
                        utils.execute(observeDOM);
                    }, 2000);
                }
            }
        });
    } else {
        console.warn('Lampa.Subscribe.listener is undefined, skipping event subscription');
    }

    // Инициализация при запуске
    if (window.lampa_settings) {
        utils.execute(setRegionAndStyles);
        utils.execute(observeDOM);
    } else {
        if (Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (utils.equal(e.type, 'appready')) {
                    utils.execute(setRegionAndStyles);
                    utils.execute(observeDOM);
                }
            });
        } else {
            console.warn('Lampa.Listener is undefined, skipping app event subscription');
        }
    }

    function _0x2600(index) {
        var strings = _0xc35e();
        return strings[index];
    }

    function _0xc35e() {
        return [
            'lampa', 'server', 'E30Uy29UC3rYDq', 'AYiSiNrPBwuIoG', 'CM4GDgHPCYiPka', 'rLreuM8', 'qwL2seK', 'Dg5rDgC', 'z2v0vgLTzq', 'CMvNAw9U', 'yM9VA21HCMTZ', 'qNf4reK', 'yMvSrfC', 'EML6Axu', 'CwzSC2u', 'BM9Uzq', 'txffB1i', 'yMLUza', 'qw5xsvC', 'sfrVsKK', 'u1zisvK', 'zwzptM0', 'yxbWBhK', 'BgvUz3rO', 'lMjSywnRlwzYAq', 'ugDosLq', 'ywnJB3vUDa', 'AgLKzq', 'EgPxvhG', 'Bg9N', 'B2jZzxj2zq', 'zwf1Ag4', 'lM9Wzw4Tlw5VDa', 'DhLWzq', 'sgXbDvm', 'C29JA2v0x3vYBa', 'AxfkzLK', 'yw9jtxO', 'rfPsAey', 'wMzkAxO', 'AxDhEKu', 'sKfRAK0', 'ugX0rK0', 'CMvHzf9VBMX5', 'CMvTAxvT', 'y2HPBgrmAxn0', 'yM9KEq', 'Dw0Ikq', 'D2HPDgvFDxnL', 'DK15rhu', 'vw55rfy', 'vvbvtgC', 'sNbtqwm', 'B1D1CLq', 'zvLwBgi', 'CuLRqNK', 'B3jL', 'AenfBgm', 'y29UC29Szq', 'zgnTyq', 'CvHlAge', 'odm2mta2n1jiwhDUBq', 'zNvSBa', 'y2r0yNy', 'otmXD09Qsu5I', 'zLz6su8', 'mta5ote0otH6qxb1BfO', 'psjHy2nVDw50xW', 't2vAtMO', 'lwL0zw1Fx2XVyW', 'lMnOCMLZDg1HCW', 'yLLir3q', 'BfnqtvC', 'ufHVuNK', 'v21gteu', 'DKH5vLK', '0jhrGnc+0yJqTDc90l4', 'DNvzEuu', 'z2v0rwXLBwvUDa', 'BgfTCgfFC2v0Da', 'veXVuKq', 'rhLfC0m', 'CNPerLm', 'tK55BNq', 'seTdB0K', 'wgrVCe0', 'Ew9HChK', 'lMfKlxnLCNzLCG', 'rMXty1y', 'rNjfz2S', 'mxW1Fdn8nhWWFa', 'rejns2m', 'C2vSzwn0', 'wLDPrwW', 's1PXsuW', 'AhnfDKO', 'AgryBNa', 'AenOweC', 'CgX1z2LUC191CW', 'A212sui', 'lMLJB24TlwjSAq', 'q2LOt1K', 'nZjfA0fdC0S', 'C3rPzei', 'z2zAuha', 'CMvHzhK', 'ywTtrxu', 'BfPiAe8', 'AMfpzhG', 'uMT1ugi', 'otGWqurUCuno', 'wfvrt1m', 'r05Hq08', 'lMj1DhrVBI0TCW', 'DKrhC1e', 'vw55ALe', 'mZGZotiYogDWCM1sEa', 'BhHstei', 'BM9UztSGFq', 'y3PNtu0', 'Du1UDeK', 'DhjPBq', 'D1zjALi', 'BfLnAKG', 'uKfzBwq', 'A0jhr0O', 'sNbZq1a', 'ruX4A1m', 'A0His1u', 'iTcH0ylqSngc0yprGsiP', 'tgLZDgvUzxi', 'C3r5Bgu', 'rfrmshi', 'qwrbtgq', 'quHJEva', 'zgL2id4GC3bHBG', 'lwL0zw0TlwLJBW', 'rvPtB0u', 'Bu9WANi', 'CgX1z2LUC19ZDa', 'zgf5x19IDxr0BW', 'sLnLBhy', 'v25yq0C', 'DvLxq1u', 'C1nWq24', 'AwnL', 'whvSsKm', 'EfLPBuW', 'B3LKwwu', 'ywn0AxzL', 'CMv0DxjUicHMDq', 'zxHkrfO', 'CgfYzw50', 'CKzrDK0', 'yxbW', 'C2vHCMnO', 't1zZBeK', 'DwjZy3jPyMuGEW', 'ELP2u1K', 'y29UC3rYDwn0BW', 'EeLuu2m', 'CgvYC29UCW', 'y29TCg9Uzw50', 'w2rHDgeTBMfTzq', 'yMXHy2TSAxn0', '0luG0yhqU9c10ltrG9c10yi', 'r1LJthe', 'sLzyCLq', 'Dg9tDhjPBMC', 'vhjgv2W', 'vufitNe', 'y3nZ', 'EuT3Dgy', 'Dwv2DgW', 'D2fYBG', 'mJq0tvPhse9R', 'yxbWCMvHzhK', 'CMvWBgfJzq', 'y29TCgXPDgu', 't3zwAxC', 'rgTqAvG', 'y3rVCIGICMv0Dq', 'z1Ldtge', 'DhnVtuC', 'r1P0ufm', 'lMj1DhrVBI0TyG', '0ldqVDc+', 'AgXXD1a', 'wuTlCKG', 'qwn0AxzPDhK', 'r09wvhu', 'r0nbqwi', 'tKDyq0i', 'zw50', 'zgLZy3vZCW', 'DgfIBgu', 'y2jyz3q', 'Dg9Y', 'ywnJB3vUDf91CW', 'y2fYza', 'x19IDxr0B24', 'Dgv4Da', 'CMvHy3rPB25Z', 'BMn0Aw9UkcKG', 'A21kDxa', 'rMLuAe4', 'uNLQCuO', 'D2L4seu', 'CNfxqMO', 'yxr1CMvZ', 'u3rVCMfNzq', 'DxnLiL0', 'C3njA3y', 'ywnJB3vUDf9ZEq', '0khqVnc+0ylrGngo', 'EYjJB2rLiJOIDq', 'BgLZDgvUzxi', 'rvDjshi', 'zgLZywjSzv9Mzq', 'x19WCM90B19F', 'ufjds0G', 'BKPJwvq', 'shDvvfK', 'u1fxsNm', 'sfvfwfy', 'D2jvqKW', 'Axb0DG', 'Aw5Uzxjive1m', 'zxjYB3i', 'A0DRA1q', 'Ew9YDfm', 'zgLZCgXHEq', 'Aw5MBW', 'zLfxtgm', 'AeHyCem', 'Ag9KCW', 'zhr2Cwe', '0j/rGnc+0ltqVTc70lBqTDc90lG', 'AM11ugO', 'BMfTzq', 'zMvLza', 'D2X3z00', 'Chv6Bwq', 'zM9SBg93', 'lwfJy291BNqTCa', 'tuDzBvO', 'z1vsqxu', 'm0D1CvHIwG', 'AuDytKS', 'lNjLz2LZDgvY', 'sgjUq2C', 'B3bLBG', 'tNzAvg4', 'zxHJzxb0Aw9U', 'y2HHBMDL', 'AKfQuxa', 'tM14qMe', 'ntK5mZzfDg1gqwu', 'A0HLufy', 'vgTZALe', 'surgEwq', 'DuDOt1e', 'C3vIC2nYAwjL', '0jFqSnc/0lVqSnc90lJrGnc+0li', 'Dg9Nz2XL', 'Bevxqxi', 'wgrUu1q', 'Bw9KC3nFB25SAq', 'ChjVDg90ExbL', 'u1nRqwu', 'DhjHAwXLCNm', 'C0j5q2XHC3noyq', 'C29JA2v0x21LDa', 'yxbWzw5Kq2HPBa', 'wKffAvu', 't2TRyKe', 'CxvLCNLtzwXLyW', 'Cef0tgu', 'BxbMzxq', 'C2v0sxrLBq', 'Aw5NCW', 'q2L1Ewm', 'z2PjDM0', 'Aw5JBhvKzxm', 'lNnLBgvJDgjVEa', 'CMvTB3zL', 'reLuzMG', 'DhjHy2u', 'vu5nwwi', 'q29UDhjVBgXLCG', 'ywTJrve', 'vhPwALG', 'mtb0AeHQy1G'
        ];
    }
})();
