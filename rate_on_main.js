(function() {
    'use strict';

    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        let reactionCnt = {};

        const reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };

        reactions.forEach(item => {
            const count = parseInt(item.counter, 10) || 0;
            const coef = reactionCoef[item.type] || 0;
            weightedSum += count * coef;
            totalCount += count;
            reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
        });

        if (totalCount === 0) return { rating: 0, medianReaction: '' };

        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        const finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;

        let medianReaction = '';
        const medianIndex = Math.ceil(totalCount / 2.0);
        const sortedReactions = Object.entries(reactionCoef)
            .sort((a, b) => a[1] - b[1])
            .map(r => r[0]);
        let cumulativeCount = 0;
        while (sortedReactions.length && cumulativeCount < medianIndex) {
            medianReaction = sortedReactions.pop();
            cumulativeCount += (reactionCnt[medianReaction] || 0);
        }

        return { rating: finalRating, medianReaction: medianReaction };
    }

    function fetchLampaRating(ratingKey) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            let url = "https://cubnotrip.top/api/reactions/get/" + ratingKey;
            xhr.open("GET", url, true);
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if (data && data.result && Array.isArray(data.result)) {
                                let result = calculateLampaRating10(data.result);
                                resolve(result);
                            } else {
                                resolve({ rating: 0, medianReaction: '' });
                            }
                        } catch {
                            resolve({ rating: 0, medianReaction: '' });
                        }
                    } else {
                        resolve({ rating: 0, medianReaction: '' });
                    }
                }
            };
            xhr.onerror = function() { resolve({ rating: 0, medianReaction: '' }); };
            xhr.ontimeout = function() { resolve({ rating: 0, medianReaction: '' }); };
            xhr.send();
        });
    }

    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if (lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)) {
            return lampaRatingCache[ratingKey].value;
        }
        let result = await fetchLampaRating(ratingKey);
        lampaRatingCache[ratingKey] = { value: result, timestamp: now };
        return result;
    }

    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;

        let lampaBlockHtml = '<div class="full-start__rate rate--lampa">' +
            '<div class="rate-value">0.0</div>' +
            '<div class="rate-icon"></div>' +
            '<div class="source--name">LAMPA</div>' +
            '</div>';

        let kpBlock = rateLine.find('.rate--kp');
        if (kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        return true;
    }

    function insertCardRating(card, event) {
        let voteEl = card.querySelector('.card__vote');
        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote';
            let viewEl = card.querySelector('.card__view') || card;
            viewEl.appendChild(voteEl);
            voteEl.innerHTML = '0.0';
        } else {
            voteEl.innerHTML = '';
        }

        let data = card.dataset || {};
        let cardData = event.object.data || {};
        let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
        let type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        let ratingKey = type + "_" + id;

        getLampaRating(ratingKey).then(result => {
            let html = result.rating !== null ? result.rating : '0.0';
            if (result.medianReaction) {
                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
            }
            voteEl.innerHTML = html;
        });
    }

    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            if (!window.Lampa.Card._build_original) {
                window.Lampa.Card._build_original = window.Lampa.Card._build;
                window.Lampa.Card._build = function() {
                    let result = window.Lampa.Card._build_original.call(this);
                    setTimeout(() => Lampa.Listener.send('card', { type: 'build', object: this }), 100);
                    return result;
                };
            }
        }
    });

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            let render = e.object.activity.render();
            if (render && insertLampaBlock(render)) {
                if (e.object.method && e.object.id) {
                    let ratingKey = e.object.method + "_" + e.object.id;
                    getLampaRating(ratingKey).then(result => {
                        if (result.rating !== null) {
                            $(render).find('.rate--lampa .rate-value').text(result.rating);
                            if (result.medianReaction) {
                                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                                $(render).find('.rate--lampa .rate-icon').html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
                            }
                        }
                    });
                }
            }
        }
    });

    Lampa.Listener.follow('card', function(e) {
        if (e.type === 'build' && e.object.card) {
            let card = e.object.card;
            insertCardRating(card, e);
        }
    });
})();

(function() {
    'use strict';

    Lampa.Platform.tv();

    (function() {
        var _0x415e26 = _0x5398,
            _0x378ea8 = (function() {
                var _0x157ed4 = true;
                return function(_0x352daf, _0x37a78c) {
                    var _0x18f2c8 = _0x157ed4 ? function() {
                        var _0x385ac9 = _0x5398;
                        if (_0x37a78c) {
                            var _0x59a866 = _0x37a78c['apply'](_0x352daf, arguments);
                            return _0x37a78c = null, _0x59a866;
                        }
                    } : function() {};
                    return _0x157ed4 = false, _0x18f2c8;
                };
            }()),
            _0x28c290 = (function() {
                var _0x3f157f = true;
                return function(_0x1b1eb5, _0x5315e2) {
                    var _0x236056 = _0x3f157f ? function() {
                        var _0x1814db = _0x5398;
                        if (_0x5315e2) {
                            var _0x206ed5 = _0x5315e2['apply'](_0x1b1eb5, arguments);
                            return _0x5315e2 = null, _0x206ed5;
                        }
                    } : function() {};
                    return _0x3f157f = false, _0x236056;
                };
            }());

        'use strict';

        function _0xcecc86() {
            var _0x2792d7 = _0x5398;
            if (Lampa['Manifest']['origin'] !== 'bylampa') var _0x2ab490 = 'http://212.113.103.137:835/quality',
                _0x2b9538 = {'data': null, 'timestamp': null, 'map': null},
                _0x5e7de9 = 0x36ee80, // 3600000 ms = 1 hour, but actually used as cache expiration
                _0x18da3b = {},
                _0x2f80b1 = 0x0,
                _0x307f98 = false;

            function _0x7c996c() {
                var _0x42957b = _0x2792d7;
                if (window['lampa_listener_extensions']) return;
                window['lampa_listener_extensions'] = true;
                Object['defineProperty'](window['Lampa']['Card']['prototype'], '_build', {
                    'get': function() {
                        var _0x574857 = _0x42957b;
                        return this['_build'];
                    },
                    'set': function(_0x27a94b) {
                        var _0x36fbf5 = _0x42957b;
                        this['_build'] = function() {
                            var _0x4c9197 = _0x36fbf5;
                            _0x27a94b['apply'](this);
                            Lampa['Listener']['send']('card', {'type': 'build', 'object': this});
                        }['bind'](this);
                    }
                });
            }

            function _0x25c7ec(_0x940d6c) {
                var _0x38b107 = _0x2792d7,
                    _0x295a36 = new XMLHttpRequest();
                _0x295a36['open']('GET', _0x2ab490, true);
                _0x295a36['timeout'] = 0x2710;
                _0x295a36['onload'] = function() {
                    var _0x424370 = _0x38b107;
                    if (_0x295a36['status'] >= 0xc8 && _0x295a36['status'] < 0x12c) try {
                        var _0x7bfbdd = JSON['parse'](_0x295a36['responseText']);
                        _0x940d6c(null, _0x7bfbdd['results']);
                    } catch (_0x1c62d3) {
                        _0x940d6c(new Error('Ошибка парсинга JSON'));
                    } else _0x940d6c(new Error('Ошибка HTTP: ' + _0x295a36['status']));
                };
                _0x295a36['onerror'] = _0x295a36['ontimeout'] = function() {
                    _0x940d6c(new Error('Ошибка сети или таймаут'));
                };
                _0x295a36['send']();
            }

            function _0xd573c0(_0x202e48) {
                var _0x1825f2 = _0x2792d7;
                if (!_0x202e48) return {};
                var _0x199c9d = {};
                for (var _0x11528c = 0x0, _0x5ea1f2 = _0x202e48['length']; _0x11528c < _0x5ea1f2; _0x11528c++) {
                    var _0x312880 = _0x202e48[_0x11528c];
                    _0x312880 && _0x312880['id'] && (_0x199c9d[_0x312880['id']] = _0x312880);
                }
                return _0x199c9d;
            }

            function _0x6c4050(_0x5a278d, _0x341436) {
                var _0xaece6e = _0x2792d7,
                    _0x21799a = _0x5a278d['getAttribute']('data-quality-id');
                !_0x21799a && (_0x21799a = 'card_' + ++_0x2f80b1, _0x5a278d['setAttribute']('data-quality-id', _0x21799a));
                if (_0x18da3b[_0x21799a]) return;
                var _0x4f7a18 = _0x5a278d['querySelector']('.card__view');
                if (!_0x4f7a18 || _0x4f7a18['querySelector']('.card__quality')) return;
                var _0x24fdfe = document['createElement']('div');
                _0x24fdfe['className'] = 'card__quality';
                _0x24fdfe['innerHTML'] = '<div>' + _0x341436 + '</div>';
                _0x4f7a18['appendChild'](_0x24fdfe);
                _0x18da3b[_0x21799a] = true;
            }

            function _0x593034(_0x2cbc23) {
                var _0x54a6c6 = _0x2792d7;
                if (!_0x2b9538['map'] || !_0x2cbc23['data'] || !_0x2cbc23['card']) return;
                if (Lampa['Storage']['get']('source') == 'cub') return;
                var _0x32ab20 = _0x2cbc23['data'];
                if (!_0x32ab20['id'] || _0x32ab20['first_air_date']) return;
                var _0x4db183 = _0x2b9538['map'][_0x32ab20['id']];
                _0x4db183 && _0x4db183['qu'] && _0x6c4050(_0x2cbc23['card'], _0x4db183['qu']);
            }

            function _0x557719() {
                var _0x7a319a = _0x2792d7;
                if (_0x307f98) return;
                _0x307f98 = true;
                try {
                    var _0x8c756b = localStorage['getItem']('qualityCache');
                    if (_0x8c756b) {
                        _0x2b9538 = JSON['parse'](_0x8c756b);
                        _0x2b9538['data'] && !_0x2b9538['map'] && (_0x2b9538['map'] = _0xd573c0(_0x2b9538['data']));
                        var _0x4fba2d = Date['now']();
                        (!_0x2b9538['timestamp'] || _0x4fba2d - _0x2b9538['timestamp'] >= _0x5e7de9) && _0x10bef4();
                    } else _0x10bef4();
                } catch (_0x4c4921) {
                    console['error']('Ошибка загрузки кэша качества:', _0x4c4921);
                    _0x2b9538 = {'data': null, 'timestamp': null, 'map': null};
                    _0x10bef4();
                }
            }

            function _0x10bef4() {
                _0x25c7ec(function(_0x15be32, _0x1917dc) {
                    var _0x510692 = _0x5398;
                    if (!_0x15be32 && _0x1917dc) {
                        _0x2b9538['data'] = _0x1917dc;
                        _0x2b9538['map'] = _0xd573c0(_0x1917dc);
                        _0x2b9538['timestamp'] = Date['now']();
                        try {
                            localStorage['setItem']('qualityCache', JSON['stringify']({'data': _0x2b9538['data'], 'timestamp': _0x2b9538['timestamp']}));
                        } catch (_0x3d9a5b) {
                            console['error']('Ошибка сохранения кэша:', _0x3d9a5b);
                        }
                    }
                });
            }

            function _0x39f21e() {
                var _0x11ba42 = _0x2792d7,
                    _0x4632da = _0x378ea8(this, function() {
                        var _0x668645 = _0x5398;
                        return _0x4632da['toString']()['search']('(((.+)+)+)+$')['toString']()['constructor'](_0x4632da)['search']('(((.+)+)+)+$');
                    });
                _0x4632da();
                var _0x3124ec = _0x28c290(this, function() {
                    var _0x1a983a = _0x5398,
                        _0x4088f6;
                    try {
                        var _0x348df9 = Function('return (function() ' + '{}.constructor("\\x22return \\x5C\\x22this\\x5C\\x22)(\\x20)' + ');');
                        _0x4088f6 = _0x348df9();
                    } catch (_0x496a29) {
                        _0x4088f6 = window;
                    }
                    var _0x68a4a9 = _0x4088f6['console'] = _0x4088f6['console'] || {},
                        _0x6244d3 = ['log', 'error', 'warn', 'info', 'exception', 'table', 'trace'];
                    for (var _0x3d100d = 0x0; _0x3d100d < _0x6244d3['length']; _0x3d100d++) {
                        var _0xf453d3 = _0x28c290['constructor']['prototype']['bind'](_0x28c290),
                            _0x1353e6 = _0x6244d3[_0x3d100d],
                            _0x228c6d = _0x68a4a9[_0x1353e6] || _0xf453d3;
                        _0xf453d3['__proto__'] = _0x28c290['bind'](_0x28c290);
                        _0xf453d3['toString'] = _0x228c6d['toString']['bind'](_0x228c6d);
                        _0x68a4a9[_0x1353e6] = _0xf453d3;
                    }
                });
                _0x3124ec();
                if (window['quality_plugin']) return;
                window['quality_plugin'] = true;
                _0x7c996c();
                Lampa['Listener']['follow']('card', function(_0x32c3a3) {
                    var _0x206ac8 = _0x11ba42;
                    _0x32c3a3['type'] === 'build' && _0x593034(_0x32c3a3['object']);
                });
                Lampa['Listener']['follow']('full', function(_0x582aaf) {
                    var _0x333cfb = _0x11ba42;
                    if (_0x582aaf['type'] === 'complite') {
                        var _0x327993 = _0x582aaf['object']['activity']['render']();
                        if (_0x582aaf['object']['method'] == 'tv') return;
                        if (Lampa['Storage']['get']('source') == 'cub') return;
                        var _0x3e6668 = _0x582aaf['object']['card']['id'];
                        if (_0x2b9538['data']) {
                            var _0x2fb0b8 = _0xd573c0(_0x2b9538['data']),
                                _0x604e39 = _0x2fb0b8[_0x3e6668];
                            if (_0x604e39) {
                                var _0x390fab = _0x604e39['qu'];
                                window['innerWidth'] > 0x249 && !$('.full-start-new.cardify')['length'] ?
                                    $('.full-start__poster,.full-start-new__poster', _0x327993)['append']('<div class=\x27card--quality\x27 style=\x27right: -0.6em!important;position: absolute;background: #ffe216;color: #000;bottom:20.6em!important;padding: 0.4em 0.6em;font-size: 1em;border-radius: 0.3em;\x27>' + _0x390fab + '</div>') :
                                    $('.card--quality', _0x327993)['length'] ?
                                    $('.full-start-new__details', _0x327993)['append']('<span class="full-start-new__split">●</span><div class="card--quality"><div>' + _0x390fab + '</div></div>') :
                                    $('.full-start__tags', _0x327993)['append']('<div class="full-start__tag card--quality"><img src="./img/icons/menu/quality.svg" style="width:16px;height:16px;margin-right:4px;vertical-align:middle;"/> <div>Качество: ' + _0x390fab + '</div></div>');
                            }
                        }
                    }
                });
                _0x557719();
            }
            _0x39f21e();
        }

        window['quality_plugin'] ? _0xcecc86() : Lampa['Listener']['follow']('app', function(_0xb48ce7) {
            var _0x59fb3d = _0x415e26;
            _0xb48ce7['type'] === 'ready' && _0xcecc86();
        });
    })();
})();
