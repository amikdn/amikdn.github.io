;(function () {
    'use strict';
    var plugin = {
        component: 'my_iptv2',
        icon: "<svg height=\"244\" viewBox=\"0 0 260 244\" xmlns=\"http://www.w3.org/2000/svg\" style=\"fill-rule:evenodd;\" fill=\"currentColor\"><path d=\"M259.5 47.5v114c-1.709 14.556-9.375 24.723-23 30.5a2934.377 2934.377 0 0 1-107 1.5c-35.704.15-71.37-.35-107-1.5-13.625-5.777-21.291-15.944-23-30.5v-115c1.943-15.785 10.61-25.951 26-30.5a10815.71 10815.71 0 0 1 208 0c15.857 4.68 24.523 15.18 26 31.5zm-230-13a4963.403 4963.403 0 0 0 199 0c5.628 1.128 9.128 4.462 10.5 10 .667 40 .667 80 0 120-1.285 5.618-4.785 8.785-10.5 9.5-66 .667-132 .667-198 0-5.715-.715-9.215-3.882-10.5-9.5-.667-40-.667-80 0-120 1.35-5.18 4.517-8.514 9.5-10z\"/><path d=\"M70.5 71.5c17.07-.457 34.07.043 51 1.5 5.44 5.442 5.107 10.442-1 15-5.991.5-11.991.666-18 .5.167 14.337 0 28.671-.5 43-3.013 5.035-7.18 6.202-12.5 3.5a11.529 11.529 0 0 1-3.5-4.5 882.407 882.407 0 0 1-.5-42c-5.676.166-11.343 0-17-.5-4.569-2.541-6.069-6.375-4.5-11.5 1.805-2.326 3.972-3.992 6.5-5zM137.5 73.5c4.409-.882 7.909.452 10.5 4a321.009 321.009 0 0 0 16 30 322.123 322.123 0 0 0 16-30c2.602-3.712 6.102-4.879 10.5-3.5 5.148 3.334 6.314 7.834 3.5 13.5a1306.032 1306.032 0 0 0-22 43c-5.381 6.652-10.715 6.652-16 0a1424.647 1424.647 0 0 0-23-45c-1.691-5.369-.191-9.369 4.5-12zM57.5 207.5h144c7.788 2.242 10.288 7.242 7.5 15a11.532 11.532 0 0 1-4.5 3.5c-50 .667-100 .667-150 0-6.163-3.463-7.496-8.297-4-14.5 2.025-2.064 4.358-3.398 7-4z\"/></svg>",
        name: 'Hack TV'
    };

    var lists = [];
    var curListId = -1;
    var defaultGroup = 'Other';
    var catalog = {};
    var listCfg = {};
    var EPG = {};
    var epgInterval;
    var playlistUrl = '';

    var chNumber = '';
    var chTimeout = null;
    var stopRemoveChElement = false;
    var chPanel = $((
        "<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 9em;right: auto;z-index: 1000;\">\n" +
        "	<div class=\"player-info__body\">\n" +
        "		<div class=\"player-info__line\">\n" +
        "			<div class=\"player-info__name\">&nbsp;</div>\n" +
        "		</div>\n" +
        "	</div>\n" +
        "</div>").replace(/PLUGIN/g, plugin.component)
    ).hide().fadeOut(0);
    var chHelper = $((
        "<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 14em;right: auto;z-index: 1000;\">\n" +
        "	<div class=\"player-info__body\">\n" +
        "		<div class=\"tv-helper\"></div>\n" +
        "	</div>\n" +
        "</div>").replace(/PLUGIN/g, plugin.component)
    ).hide().fadeOut(0);
    var epgTemplate = $(('<div id="PLUGIN_epg">\n' +
        '<h2 class="js-epgChannel"></h2>\n' +
        '<div class="PLUGIN-details__program-body js-epgNow">\n' +
        '   <div class="PLUGIN-details__program-title">Сейчас</div>\n' +
        '   <div class="PLUGIN-details__program-list">' +
        '<div class="PLUGIN-program selector">\n' +
        '   <div class="PLUGIN-program__time js-epgTime">XX:XX</div>\n' +
        '   <div class="PLUGIN-program__body">\n' +
        '	   <div class="PLUGIN-program__title js-epgTitle"> </div>\n' +
        '	   <div class="PLUGIN-program__progressbar"><div class="PLUGIN-program__progress js-epgProgress" style="width: 50%"></div></div>\n' +
        '   </div>\n' +
        '</div>' +
        '   </div>\n' +
        '   <div class="PLUGIN-program__desc js-epgDesc"></div>'+
        '</div>' +
        '<div class="PLUGIN-details__program-body js-epgAfter">\n' +
        '   <div class="PLUGIN-details__program-title">Потом</div>\n' +
        '   <div class="PLUGIN-details__program-list js-epgList">' +
        '   </div>\n' +
        '</div>' +
        '</div>').replace(/PLUGIN/g, plugin.component)
    );
    var epgItemTeplate = $((
        '<div class="PLUGIN-program selector">\n' +
        '   <div class="PLUGIN-program__time js-epgTime">XX:XX</div>\n' +
        '   <div class="PLUGIN-program__body">\n' +
        '	   <div class="PLUGIN-program__title js-epgTitle"> </div>\n' +
        '   </div>\n' +
        '</div>').replace(/PLUGIN/g, plugin.component)
    );
    var chHelpEl = chHelper.find('.tv-helper');
    var chNumEl = chPanel.find('.player-info__name');
    var encoder = $('<div/>');

    function isPluginPlaylist(playlist) {
        return !(!playlist.length || !playlist[0].tv || !playlist[0].plugin || playlist[0].plugin !== plugin.component);
    }

    Lampa.PlayerPlaylist.listener.follow('select', function(e) {
        if (e.item.plugin && e.item.plugin === plugin.component && Lampa.Player.runas)
            Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
    });

    function channelSwitch(dig, isChNum) {
        if (!Lampa.Player.opened()) return false;
        var playlist = Lampa.PlayerPlaylist.get();
        if (!isPluginPlaylist(playlist)) return false;
        if (!$('body>.js-ch-' + plugin.component).length) $('body').append(chPanel).append(chHelper);
        var cnt = playlist.length;
        var prevChNumber = chNumber;
        chNumber += dig;
        var number = parseInt(chNumber);
        if (number && number <= cnt) {
            if (!!chTimeout) clearTimeout(chTimeout);
            stopRemoveChElement = true;
            chNumEl.text(playlist[number - 1].title);
            if (isChNum || parseInt(chNumber + '0') > cnt) {
                chHelper.finish().hide().fadeOut(0);
            } else {
                var help = [];
                var chHelpMax = 9;
                var start = parseInt(chNumber + '0');
                for (var i = start; i <= cnt && i <= (start + Math.min(chHelpMax, 9)); i++) {
                    help.push(encoder.text(playlist[i - 1].title).html());
                }
                chHelpEl.html(help.join('<br>'));
                chHelper.finish().show().fadeIn(0);
            }
            if (number < 10 || isChNum) {
                chPanel.finish().show().fadeIn(0);
            }
            stopRemoveChElement = false;
            var chSwitch = function () {
                var pos = number - 1;
                if (Lampa.PlayerPlaylist.position() !== pos) {
                    Lampa.PlayerPlaylist.listener.send('select', {
                        playlist: playlist,
                        position: pos,
                        item: playlist[pos]
                    });
                    Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                }
                chPanel.delay(1000).fadeOut(500, function(){stopRemoveChElement || chPanel.remove()});
                chHelper.delay(1000).fadeOut(500, function(){stopRemoveChElement || chHelper.remove()});
                chNumber = "";
            }
            if (isChNum === true) {
                chTimeout = setTimeout(chSwitch, 1000);
                chNumber = "";
            } else if (parseInt(chNumber + '0') > cnt) {
                chSwitch();
            } else {
                chTimeout = setTimeout(chSwitch, 3000);
            }
        } else {
            chNumber = prevChNumber;
        }
        return true;
    }

    var cacheVal = {};

    function cache(name, value, timeout) {
        var time = (new Date()) * 1;
        if (!!timeout && timeout > 0) {
            cacheVal[name] = [(time + timeout), value];
            return;
        }
        if (!!cacheVal[name] && cacheVal[name][0] > time) {
            return cacheVal[name][1];
        }
        delete (cacheVal[name]);
        return value;
    }

    var timeOffset = 0;
    var timeOffsetSet = false;

    function unixtime() {
        return Math.floor((new Date().getTime() + timeOffset)/1000);
    }

    function toLocaleTimeString(time) {
        var date = new Date(),
            ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
        time = time || date.getTime();
        date = new Date(time + (ofst * 1000 * 60 * 60));
        return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
    }

    function toLocaleDateString(time) {
        var date = new Date(),
            ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
        time = time || date.getTime();
        date = new Date(time + (ofst * 1000 * 60 * 60));
        return date.toLocaleDateString();
    }

    var utils = {
        uid: function() {return ''}, // UID больше не используется
        timestamp: unixtime,
        token: function() {return generateSigForString(Lampa.Storage.field('account_email').toLowerCase())},
        hash: Lampa.Utils.hash,
        hash36: function(s) {return (this.hash(s) * 1).toString(36)}
    };

    function generateSigForString(string) {
        var sigTime = unixtime();
        return sigTime.toString(36) + ':' + utils.hash36((string || '') + sigTime);
    }

    function strReplace(str, key2val) {
        for (var key in key2val) {
            str = str.replace(
                new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                key2val[key]
            );
        }
        return str;
    }

    function tf(t, format, u, tz) {
        format = format || '';
        tz = parseInt(tz || '0');
        var thisOffset = 0;
        thisOffset += tz * 60;
        if (!u) thisOffset += parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n','')) * 60 - new Date().getTimezoneOffset();
        var d = new Date((t + thisOffset) * 6e4);
        var r = {yyyy:d.getUTCFullYear(),MM:('0'+(d.getUTCMonth()+1)).substr(-2),dd:('0'+d.getUTCDate()).substr(-2),HH:('0'+d.getUTCHours()).substr(-2),mm:('0'+d.getUTCMinutes()).substr(-2),ss:('0'+d.getUTCSeconds()).substr(-2),UTF:t*6e4};
        return strReplace(format, r);
    }

    function prepareUrl(url, epg) {
        var m = [], val = '', r = {start:unixtime,offset:0};
        if (epg && epg.length) {
            r = {
                start: epg[0] * 60,
                utc: epg[0] * 60,
                end: (epg[0] + epg[1]) * 60,
                utcend: (epg[0] + epg[1]) * 60,
                offset: unixtime() - epg[0] * 60,
                duration: epg[1] * 60,
                now: unixtime,
                lutc: unixtime,
                d: function(m){return strReplace(m[6]||'',{M:epg[1],S:epg[1]*60,h:Math.floor(epg[1]/60),m:('0'+(epg[1] % 60)).substr(-2),s:'00'})},
                b: function(m){return tf(epg[0], m[6], m[4], m[5])},
                e: function(m){return tf(epg[0] + epg[1], m[6], m[4], m[5])},
                n: function(m){return tf(unixtime() / 60, m[6], m[4], m[5])}
            };
        }
        while (!!(m = url.match(/\${(\((([a-zA-Z\d]+?)(u)?)([+-]\d+)?\))?([^${}]+)}/))) {
            if (!!m[2] && typeof r[m[2]] === "function") val = r[m[2]](m);
            else if (!!m[3] && typeof r[m[3]] === "function") val = r[m[3]](m);
            else if (m[6] in r) val = typeof r[m[6]] === "function" ? r[m[6]]() : r[m[6]];
            else if (!!m[2] && typeof utils[m[2]] === "function") val = utils[m[2]](m[6]);
            else if (m[6] in utils) val = typeof utils[m[6]] === "function" ? utils[m[6]]() : utils[m[6]];
            else val = m[1];
            url = url.replace(m[0], encodeURIComponent(val));
        }
        return url;
    }

    function catchupUrl(url, type, source) {
        type = (type || '').toLowerCase();
        source = source || '';
        if (!type) {
            if (!!source) {
                if (source.search(/^https?:\/\//i) === 0) type = 'default';
                else if (source.search(/^[?&/][^/]/) === 0) type = 'append';
                else type = 'default';
            }
            else if (url.indexOf('${') < 0) type = 'shift';
            else type = 'default';
            console.log(plugin.name, 'Autodetect catchup-type "' + type + '"');
        }
        var newUrl = '';
        switch (type) {
            case 'append':
                if (source) {
                    newUrl = (source.search(/^https?:\/\//i) === 0 ? '' : url) + source;
                    break;
                }
            case 'timeshift':
            case 'shift':
                newUrl = (source || url);
                newUrl += (newUrl.indexOf('?') >= 0 ? '&' : '?') + 'utc=${start}&lutc=${timestamp}';
                return newUrl;
            case 'flussonic':
            case 'flussonic-hls':
            case 'flussonic-ts':
            case 'fs':
                return url
                    .replace(/\/(video|mono)\.(m3u8|ts)/, '/$1-\${start}-\${duration}.$2')
                    .replace(/\/(index|playlist)\.(m3u8|ts)/, '/archive-\${start}-\${duration}.$2')
                    .replace(/\/mpegts/, '/timeshift_abs-\${start}.ts');
            case 'xc':
                newUrl = url
                    .replace(
                        /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/,
                        '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.m3u8'
                    )
                    .replace(
                        /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/,
                        '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.ts'
                    );
                break;
            case 'default':
                newUrl = source || url;
                break;
            case 'disabled':
                return false;
            default:
                console.log(plugin.name, 'Err: no support catchup-type="' + type + '"');
                return false;
        }
        if (newUrl.indexOf('${') < 0) return catchupUrl(newUrl,'shift');
        return newUrl;
    }

    function keydown(e) {
        var code = e.code;
        if (Lampa.Player.opened() && !$('body.selectbox--open').length) {
            var playlist = Lampa.PlayerPlaylist.get();
            if (!isPluginPlaylist(playlist)) return;
            var isStopEvent = false;
            var curCh = cache('curCh') || (Lampa.PlayerPlaylist.position() + 1);
            if (code === 428 || code === 34 || ((code === 37 || code === 4) && !$('.player.tv .panel--visible .focus').length)) {
                curCh = curCh === 1 ? playlist.length : curCh - 1;
                cache('curCh', curCh, 1000);
                isStopEvent = channelSwitch(curCh, true);
            } else if (code === 427 || code === 33 || ((code === 39 || code === 5) && !$('.player.tv .panel--visible .focus').length)) {
                curCh = curCh === playlist.length ? 1 : curCh + 1;
                cache('curCh', curCh, 1000);
                isStopEvent = channelSwitch(curCh, true);
            } else if (code >= 48 && code <= 57) {
                isStopEvent = channelSwitch(code - 48);
            } else if (code >= 96 && code <= 105) {
                isStopEvent = channelSwitch(code - 96);
            }
            if (isStopEvent) {
                e.event.preventDefault();
                e.event.stopPropagation();
            }
        }
    }

    function bulkWrapper(func, bulk) {
        var bulkCnt = 1, timeout = 1, queueEndCallback, queueStepCallback, emptyFn = function(){};
        if (typeof bulk === 'object') {
            timeout = bulk.timeout || timeout;
            queueStepCallback = bulk.onBulk || emptyFn;
            queueEndCallback = bulk.onEnd || emptyFn;
            bulkCnt = bulk.bulk || bulkCnt;
        } else if (typeof bulk === 'number') {
            bulkCnt = bulk;
            if (typeof arguments[2] === "number") timeout = arguments[2];
        } else if (typeof bulk === 'function') {
            queueStepCallback = bulk;
            if (typeof arguments[2] === "number") bulkCnt = arguments[2];
            if (typeof arguments[3] === "number") timeout = arguments[3];
        }
        if (!bulkCnt || bulkCnt < 1) bulkCnt = 1;
        if (typeof queueEndCallback !== 'function') queueEndCallback = emptyFn;
        if (typeof queueStepCallback !== 'function') queueStepCallback = emptyFn;
        var context = this;
        var queue = [];
        var interval;
        var cnt = 0;
        var runner = function() {
            if (!!queue.length && !interval) {
                interval = setInterval(
                    function() {
                        var i = 0;
                        while (queue.length && ++i <= bulkCnt) func.apply(context, queue.shift());
                        i = queue.length ? i : i-1;
                        cnt += i;
                        queueStepCallback.apply(context, [i, cnt, queue.length])
                        if (!queue.length) {
                            clearInterval(interval);
                            interval = null;
                            queueEndCallback.apply(context, [i, cnt, queue.length]);
                        }
                    },
                    timeout || 0
                );
            }
        }
        return function() {
            queue.push(arguments);
            runner();
        }
    }

    function getEpgSessCache(epgId, t) {
        var key = ['epg', epgId].join('\t');
        var epg = sessionStorage.getItem(key);
        if (epg) {
            epg = JSON.parse(epg);
            if (t) {
                if (epg.length && (t < epg[0][0] || t > (epg[epg.length - 1][0] + epg[epg.length - 1][1]))) return false;
                while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
            }
        }
        return epg;
    }

    function setEpgSessCache(epgId, epg) {
        var key = ['epg', epgId].join('\t');
        sessionStorage.setItem(key, JSON.stringify(epg));
    }

    function networkSilentSessCache(url, success, fail, param) {
        var context = this;
        var key = ['cache', url, param ? utils.hash36(JSON.stringify(param)) : ''].join('\t');
        var data = sessionStorage.getItem(key);
        if (data) {
            data = JSON.parse(data);
            if (data[0]) typeof success === 'function' && success.apply(context, [data[1]]);
            else typeof fail === 'function' && fail.apply(context, [data[1]]);
        } else {
            var network = new Lampa.Reguest();
            network.silent(
                url,
                function (data) {
                    sessionStorage.setItem(key, JSON.stringify([true, data]));
                    typeof success === 'function' && success.apply(context, [data]);
                },
                function (data) {
                    sessionStorage.setItem(key, JSON.stringify([false, data]));
                    typeof fail === 'function' && fail.apply(context, [data]);
                },
                param
            );
        }
    }

    // Стиль
    Lampa.Template.add(plugin.component + '_style', '<style>#PLUGIN_epg{margin-right:1em}.PLUGIN-program__desc{font-size:0.9em;margin:0.5em;text-align:justify;max-height:15em;overflow:hidden;}.PLUGIN.category-full{padding-bottom:10em}.PLUGIN div.card__view{position:relative;background-color:#353535;background-color:#353535a6;border-radius:1em;cursor:pointer;padding-bottom:60%}.PLUGIN.square_icons div.card__view{padding-bottom:100%}.PLUGIN img.card__img,.PLUGIN div.card__img{background-color:unset;border-radius:unset;max-height:100%;max-width:100%;height:auto;width:auto;position:absolute;top:50%;left:50%;-moz-transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);font-size:2em}.PLUGIN.contain_icons img.card__img{height:95%;width:95%;object-fit:contain}.PLUGIN .card__title{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.PLUGIN .card__age{padding:0;border:1px #3e3e3e solid;margin-top:0.3em;border-radius:0.3em;position:relative;display: none}.PLUGIN .card__age .card__epg-progress{position:absolute;background-color:#3a3a3a;top:0;left:0;width:0%;max-width:100%;height:100%}.PLUGIN .card__age .card__epg-title{position:relative;padding:0.4em 0.2em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;}.PLUGIN.category-full .card__icons {top:0.3em;right:0.3em;justify-content:right;}#PLUGIN{float:right;padding: 1.2em 0;width: 30%;}.PLUGIN-details__group{font-size:1.3em;margin-bottom:.9em;opacity:.5}.PLUGIN-details__title{font-size:4em;font-weight:700}.PLUGIN-details__program{padding-top:4em}.PLUGIN-details__program-title{font-size:1.2em;padding-left:4.9em;margin-top:1em;margin-bottom:1em;opacity:.5}.PLUGIN-details__program-list>div+div{margin-top:1em}.PLUGIN-details__program>div+div{margin-top:2em}.PLUGIN-program{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;font-size:1.2em;font-weight:300}.PLUGIN-program__time{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:5em;position:relative}.PLUGIN-program.focus .PLUGIN-program__time::after{content:\'\';position:absolute;top:.5em;right:.9em;width:.4em;background-color:#fff;height:.4em;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;margin-top:-0.1em;font-size:1.2em}.PLUGIN-program__progressbar{width:10em;height:0.3em;border:0.05em solid #fff;border-radius:0.05em;margin:0.5em 0.5em 0 0}.PLUGIN-program__progress{height:0.25em;border:0.05em solid #fff;background-color:#fff;max-width: 100%}.PLUGIN .card__icon.icon--timeshift{background-image:ur ;}</style>'.replace(/PLUGIN/g, plugin.component));
    $('body').append(Lampa.Template.get(plugin.component + '_style', {}, true));

    function pluginPage(object) {
        var _this = this;
        _this.object = object;
        _this.catalog = {};
        _this.listCfg = {};
        _this.curListId = object.id !== curListId ? object.id : curListId;
        _this.EPG = {};
        _this.epgIdCurrent = '';
        _this.favorite = getStorage('favorite' + object.id, '[]');
        _this.network = new Lampa.Reguest();
        _this.scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            step: 250
        });
        _this.html = $('<div></div>');
        _this.body = $('<div class="' + plugin.component + ' category-full"></div>');
        _this.body.toggleClass('square_icons', getSettings('square_icons') === 'true');
        _this.body.toggleClass('contain_icons', getSettings('contain_icons') === 'true');
        _this.info = null;

        _this.append = function(data) {
            var _this2 = this;
            var bulkFn = bulkWrapper(function(channel) {
                var card = Lampa.Template.get('card', {
                    title: channel.Title,
                    img: channel.Logo || '',
                    release_year: ''
                });
                card.addClass('card--collection');
                var favIcon = $('<div class="card__icon icon--favorite"></div>');
                favIcon.toggleClass('hide', _this2.favorite.indexOf(favID(channel.Title)) === -1);
                card.find('.card__icons').append(favIcon);
                card.on('hover:enter', function() {
                    var playlist = [];
                    var playlistForExtrnalPlayer = [];
                    var chI = 0, i = 0;
                    var tvgDay = parseInt(listCfg['catchup-days'] || '0');
                    catalog[object.currentGroup].channels.forEach(function(elem, j) {
                        var videoUrl = j === chI ? channel.Url : prepareUrl(elem.Url);
                        playlistForExtrnalPlayer[j] = {
                            title: elem.Title,
                            url: videoUrl,
                            tv: true
                        };
                        playlist.push({
                            title: ++i + '. ' + elem.Title,
                            url: videoUrl,
                            plugin: plugin.component,
                            tv: true
                        });
                    });
                    var video = {
                        title: channel.Title,
                        url: prepareUrl(channel.Url),
                        playlist: playlistForExtrnalPlayer
                    };
                    Lampa.Keypad.listener.destroy();
                    Lampa.Keypad.listener.follow('keydown', keydown);
                    Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                    Lampa.Player.play(video);
                    Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                    Lampa.Player.playlist(playlist);
                }).on('hover:long', function() {
                    var favI = _this2.favorite.indexOf(favID(channel.Title));
                    var isFavoriteGroup = object.currentGroup === '';
                    var menu = [];
                    if (tvgDay > 0) {
                        if (channel['epgId'] && _this2.EPG[channel['epgId']] && _this2.EPG[channel['epgId']][2].length) {
                            menu.push({
                                title: 'Смотреть сначала',
                                restartProgram: true
                            });
                        }
                        menu.push({
                            title: 'Архив',
                            archive: true
                        });
                    }
                    menu.push({
                        title: favI === -1 ? langGet('favorites_add') : langGet('favorites_del'),
                        favToggle: true
                    });
                    if (isFavoriteGroup && _this2.favorite.length) {
                        if (favI !== 0) {
                            menu.push({
                                title: langGet('favorites_move_top'),
                                favMove: true,
                                i: 0
                            });
                            menu.push({
                                title: langGet('favorites_move_up'),
                                favMove: true,
                                i: favI - 1
                            });
                        }
                        if ((favI + 1) !== _this2.favorite.length) {
                            menu.push({
                                title: langGet('favorites_move_down'),
                                favMove: true,
                                i: favI + 1
                            });
                            menu.push({
                                title: langGet('favorites_move_end'),
                                favMove: true,
                                i: _this2.favorite.length - 1
                            });
                        }
                        menu.push({
                            title: langGet('favorites_clear'),
                            favClear: true
                        });
                    }
                    menu.push({
                        title: getStorage('epg', 'false') === 'true' ? langGet('epg_off') : langGet('epg_on'),
                        epgToggle: true
                    });
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_action'),
                        items: menu,
                        onSelect: function(sel) {
                            if (sel.archive) {
                                var t = unixtime();
                                var m = Math.floor(t/60);
                                var d = Math.floor(t/86400);
                                var di = (tvgDay + 1), load = di;
                                var ms = m - tvgDay * 1440;
                                var tvgData = [];
                                var playlist = [];
                                var playlistMenu = [];
                                var archiveMenu = [];
                                var ps = 0;
                                var prevDate = '';
                                var d0 = toLocaleDateString(unixtime() * 1e3);
                                var d1 = toLocaleDateString((unixtime() - 86400) * 1e3);
                                var d2 = toLocaleDateString((unixtime() - 2 * 86400) * 1e3);
                                var txtD = {};
                                txtD[d0] = 'Сегодня - ' + d0;
                                txtD[d1] = 'Вчера - ' + d1;
                                txtD[d2] = 'Позавчера - ' + d2;
                                var onEpgLoad = function() {
                                    if (--load) return;
                                    for (var i = tvgData.length - 1; i >= 0; i--) {
                                        if (tvgData[i].length === 0) {
                                            var dt = (d - i) * 1440;
                                            for (var dm = 0; dm < 1440; dm += 30)
                                                tvgData[i].push([dt + dm, 30, toLocaleDateString((dt + dm) * 6e4), '']);
                                        }
                                        for (var j = 0; j < tvgData[i].length; j++) {
                                            var epg = tvgData[i][j];
                                            if (epg[0] === ps || epg[0] > m || epg[0] + epg[1] < ms) continue;
                                            ps = epg[0];
                                            var url = catchupUrl(
                                                channel.Url,
                                                (channel['catchup'] || channel['catchup-type'] || _this2.listCfg['catchup'] || _this2.listCfg['catchup-type']),
                                                (channel['catchup-source'] || _this2.listCfg['catchup-source'])
                                            );
                                            var item = {
                                                title: toLocaleTimeString(epg[0] * 6e4) + ' - ' + epg[2],
                                                url: prepareUrl(url, epg),
                                                catchupUrl: url,
                                                plugin: plugin.component,
                                                epg: epg
                                            };
                                            var newDate = toLocaleDateString(epg[0] * 6e4);
                                            newDate = txtD[newDate] || newDate;
                                            if (newDate !== prevDate) {
                                                if (prevDate) {
                                                    archiveMenu.unshift({
                                                        title: prevDate,
                                                        separator: true
                                                    });
                                                }
                                                playlistMenu.push({
                                                    title: newDate,
                                                    separator: true,
                                                    plugin: plugin.component,
                                                    url: item.url
                                                });
                                                prevDate = newDate;
                                            }
                                            archiveMenu.unshift(item);
                                            playlistMenu.push(item);
                                            playlist.push(item);
                                        }
                                    }
                                    if (prevDate) {
                                        archiveMenu.unshift({
                                            title: prevDate,
                                            separator: true
                                        });
                                    }
                                    tvgData = [];
                                    Lampa.Select.show({
                                        title: 'Архив',
                                        items: archiveMenu,
                                        onSelect: function(sel) {
                                            console.log(plugin.name, 'catchupUrl: ' + sel.catchupUrl, epg.slice(0,2));
                                            var video = {
                                                title: sel.title,
                                                url: sel.url,
                                                playlist: playlist
                                            };
                                            Lampa.Controller.toggle('content');
                                            Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                                            Lampa.Player.play(video);
                                            Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                                            Lampa.Player.playlist(playlistMenu);
                                        },
                                        onBack: function() {
                                            Lampa.Controller.toggle('content');
                                        }
                                    });
                                };
                                while (di--) {
                                    tvgData[di] = [];
                                    (function() {
                                        var dd = di;
                                        networkSilentSessCache(Lampa.Utils.protocol() + 'epg.rootu.top/api/epg/' + channel['epgId'] + '/day/' + (d - dd),
                                            function(data) {
                                                tvgData[dd] = data;
                                                onEpgLoad();
                                            },
                                            onEpgLoad
                                        );
                                    })();
                                }
                            } else if (sel.restartProgram) {
                                var epg = _this2.EPG[channel['epgId']][2][0];
                                var type = (channel['catchup'] || channel['catchup-type'] || _this2.listCfg['catchup'] || _this2.listCfg['catchup-type'] || '');
                                var url = catchupUrl(
                                    channel.Url,
                                    type,
                                    (channel['catchup-source'] || _this2.listCfg['catchup-source'])
                                );
                                var flussonic = type.search(/^flussonic/i) === 0;
                                if (flussonic) {
                                    url = url.replace('${(d)S}', 'now');
                                }
                                console.log(plugin.name, 'catchupUrl: ' + url, epg.slice(0,2));
                                var video = {
                                    title: channel.Title,
                                    url: prepareUrl(url, epg),
                                    plugin: plugin.component,
                                    catchupUrl: url,
                                    epg: epg
                                };
                                if (flussonic) video['timeline'] = {
                                    time: 11,
                                    percent: 0,
                                    handler: function(){},
                                    duration: (epg[1] * 60)
                                };
                                Lampa.Controller.toggle('content');
                                Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                                Lampa.Player.play(video);
                                Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                            } else if (sel.epgToggle) {
                                var epg = getStorage('epg', 'false') !== 'true';
                                setStorage('epg', epg);
                                var scroll = card.parents(".scroll");
                                if (epg) {
                                    scroll.css({float: "left", width: '70%'});
                                    scroll.parent().append(epgTemplate);
                                } else {
                                    scroll.css({float: "none", width: '100%'});
                                    $('#' + plugin.component + '_epg').remove();
                                }
                                Lampa.Controller.toggle('content');
                            } else {
                                var favGroup = lists[object.id].groups[0];
                                if (sel.favToggle) {
                                    if (favI === -1) {
                                        favI = _this2.favorite.length;
                                        _this2.favorite[favI] = favID(channel.Title);
                                        _this2.catalog[favGroup.key].channels[favI] = channel;
                                    } else {
                                        _this2.favorite.splice(favI, 1);
                                        _this2.catalog[favGroup.key].channels.splice(favI, 1);
                                    }
                                } else if (sel.favClear) {
                                    _this2.favorite = [];
                                    _this2.catalog[favGroup.key].channels = [];
                                } else if (sel.favMove) {
                                    _this2.favorite.splice(favI, 1);
                                    _this2.favorite.splice(sel.i, 0, favID(channel.Title));
                                    _this2.catalog[favGroup.key].channels.splice(favI, 1);
                                    _this2.catalog[favGroup.key].channels.splice(sel.i, 0, channel);
                                }
                                setStorage('favorite' + object.id, _this2.favorite);
                                favGroup.title = _this2.catalog[favGroup.key].title + ' [' + _this2.catalog[favGroup.key].channels.length + ']';
                                if (isFavoriteGroup) {
                                    Lampa.Activity.replace(Lampa.Arrays.clone(lists[object.id].activity));
                                } else {
                                    favIcon.toggleClass('hide', _this2.favorite.indexOf(favID(channel.Title)) === -1);
                                    Lampa.Controller.toggle('content');
                                }
                            }
                        },
                        onBack: function() {
                            Lampa.Controller.toggle('content');
                        }
                    });
                });
                _this2.body.append(card);
                if (channel['epgId']) {
                    card.attr('data-epg-id', channel['epgId']);
                    // epgRender(channel['epgId']); // Предполагается, что функция epgRender определена где-то в опущенной части кода
                }
            }, {
                bulk: 18,
                onEnd: function(last, total, left) {
                    _this2.activity.loader(false);
                    _this2.activity.toggle();
                }
            });
            var catEpg = [];
            data.forEach(function(channel) {
                bulkFn(channel);
                if (channel['epgId'] && catEpg.indexOf(channel['epgId']) === -1) catEpg.push(channel['epgId']);
            });
            var catEpgString = catEpg.sort(function(a,b){return a-b}).join('-');
            var catEpgHash = utils.hash36(catEpgString);
        };

        _this.build = function(data) {
            var _this2 = this;
            Lampa.Background.change();
            Lampa.Template.add(plugin.component + '_button_category', "<style>@media screen and (max-width: 2560px) {." + plugin.component + " .card--collection {width: 16.6%!important;}}@media screen and (max-width: 800px) {." + plugin.component + " .card--collection {width: 24.6%!important;}}@media screen and (max-width: 500px) {." + plugin.component + " .card--collection {width: 33.3%!important;}}</style><div class=\"full-start__button selector view--category\"><svg style=\"enable-background:new 0 0 512 512;\" version=\"1.1\" viewBox=\"0 0 24 24\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><g id=\"info\"/><g id=\"icons\"><g id=\"menu\"><path d=\"M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z\" fill=\"currentColor\"/><path d=\"M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z\" fill=\"currentColor\"/><path d=\"M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z\" fill=\"currentColor\"/></g></g></svg><span>" + langGet('categories') + "</span>\n	</div>");
            Lampa.Template.add(plugin.component + '_info_radio', '<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right" style="display: flex !important;">  <div id="stantion_filtr"></div></div></div>');
            var btn = Lampa.Template.get(plugin.component + '_button_category');
            _this2.info = Lampa.Template.get(plugin.component + '_info_radio');
            _this2.info.find('#stantion_filtr').append(btn);
            _this2.info.find('.view--category').on('hover:enter hover:click', function() {
                _this2.selectGroup();
            });
            _this2.info.find('.info__title-original').text(!_this2.catalog[object.currentGroup] ? '' : _this2.catalog[object.currentGroup].title);
            _this2.info.find('.info__title').text('');
            _this2.html.append(_this2.info);
            if (data.length) {
                _this2.scroll.render().addClass('layer--wheight').data('mheight', _this2.info);
                _this2.html.append(_this2.scroll.render());
                _this2.append(data);
                if (getStorage('epg', 'false') === 'true') {
                    _this2.scroll.render().css({float: "left", width: '70%'});
                    _this2.scroll.render().parent().append(epgTemplate);
                }
                _this2.scroll.append(_this2.body);
                setStorage('last_catalog' + object.id, object.currentGroup ? object.currentGroup : '!!');
                lists[object.id].activity.currentGroup = object.currentGroup;
            } else {
                var empty = new Lampa.Empty();
                _this2.html.append(empty.render());
                _this2.activity.loader(false);
                Lampa.Controller.collectionSet(_this2.info);
                Navigator.move('right');
            }
        };

        _this.selectGroup = function() {
            var activity = Lampa.Arrays.clone(lists[object.id].activity);
            Lampa.Select.show({
                title: langGet('categories'),
                items: Lampa.Arrays.clone(lists[object.id].groups),
                onSelect: function(group) {
                    if (object.currentGroup !== group.key) {
                        activity.currentGroup = group.key;
                        Lampa.Activity.replace(activity);
                    } else {
                        Lampa.Controller.toggle('content');
                    }
                },
                onBack: function() {
                    Lampa.Controller.toggle('content');
                }
            });
        };

        _this.start = function() {
            if (Lampa.Activity.active().activity !== _this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(_this.scroll.render());
                    Lampa.Controller.collectionFocus(false, _this.scroll.render());
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function() {
                    if (Navigator.canmove('right')) Navigator.move('right');
                    else _this.selectGroup();
                },
                up: function() {
                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    } else {
                        if (!_this.info.find('.view--category').hasClass('focus')) {
                            Lampa.Controller.collectionSet(_this.info);
                            Navigator.move('right');
                        } else Lampa.Controller.toggle('head');
                    }
                },
                down: function() {
                    if (Navigator.canmove('down')) Navigator.move('down');
                    else if (_this.info.find('.view--category').hasClass('focus')) {
                        Lampa.Controller.toggle('content');
                    }
                },
                back: function() {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        _this.pause = function() {
            Lampa.Player.runas && Lampa.Player.runas('');
        };

        _this.stop = function() {
            Lampa.Player.runas && Lampa.Player.runas('');
        };

        _this.render = function() {
            return _this.html;
        };

        _this.destroy = function() {
            Lampa.Player.runas && Lampa.Player.runas('');
            _this.network.clear();
            _this.scroll.destroy();
            if (_this.info) _this.info.remove();
            if (epgInterval) clearInterval(epgInterval);
            _this.html.remove();
            _this.body.remove();
            _this.favorite = null;
            _this.network = null;
            _this.html = null;
            _this.body = null;
            _this.info = null;
        };

        // Загрузка данных (заглушка, так как оригинальный код обрезан)
        _this.activity = object;
        _this.activity.loader(true);
        // Здесь должен быть код загрузки данных плейлиста, но он обрезан
        // Для теста предположим, что данные загружаются и передаются в _this.build
        _this.build([]); // Пустой массив для примера, замените на реальные данные

        return _this;
    }

    if (!Lampa.Lang) {
        console.log('Hack TV', 'Initializing Lampa.Lang');
        var lang_data = {};
        Lampa.Lang = {
            add: function add(data) {
                lang_data = Object.assign(lang_data, data);
                console.log('Hack TV', 'Language data added:', Object.keys(data));
            },
            translate: function translate(key) {
                var translation = lang_data[key] ? lang_data[key].ru : key;
                console.log('Hack TV', 'Translating key:', key, '->', translation);
                return translation;
            }
        };
    }

    var langData = {};
    function langAdd(name, values) {
        var key = plugin.component + '_' + name;
        langData[key] = values;
        Lampa.Lang.add({ [key]: values });
        console.log('Hack TV', 'Added language key:', key, values);
    }
    function langGet(name) {
        var key = plugin.component + '_' + name;
        var translation = Lampa.Lang.translate(key);
        return translation === key ? (langData[key]?.ru || name) : translation;
    }

    langAdd('categories', { ru: 'Категории' });
    langAdd('favorites', { ru: 'Избранное' });
    langAdd('favorites_add', { ru: 'Добавить в избранное' });
    langAdd('favorites_del', { ru: 'Удалить из избранного' });
    langAdd('favorites_clear', { ru: 'Очистить избранное' });
    langAdd('favorites_move_top', { ru: 'В начало списка' });
    langAdd('favorites_move_up', { ru: 'Сдвинуть вверх' });
    langAdd('favorites_move_down', { ru: 'Сдвинуть вниз' });
    langAdd('favorites_move_end', { ru: 'В конец списка' });
    langAdd('epg_on', { ru: 'Включить телепрограмму' });
    langAdd('epg_off', { ru: 'Отключить телепрограмму' });
    langAdd('epg_title', { ru: 'Телепрограмма' });
    langAdd('square_icons', { ru: 'Квадратные лого каналов' });
    langAdd('contain_icons', { ru: 'Коррекция размера логотипа телеканала' });
    langAdd('contain_icons_desc', { ru: 'Может некорректно работать на старых устройствах' });
    langAdd('settings_title', { ru: 'Hack TV PlayList' });
    langAdd('playlist_url', { ru: 'Ссылка на плейлист' });
    langAdd('playlist_url_desc', { ru: 'Введите URL плейлиста (например, http://example.com/playlist.m3u)' });

    function favID(title) {
        return title.toLowerCase().replace(/[\s!-\/:-@\[-`{-~]+/g, '');
    }

    function getStorage(name, defaultValue) {
        var value = Lampa.Storage.get(plugin.component + '_' + name, defaultValue);
        console.log('Hack TV', 'Get storage:', plugin.component + '_' + name, '->', value);
        return value;
    }

    function setStorage(name, val, noListen) {
        console.log('Hack TV', 'Set storage:', plugin.component + '_' + name, '->', val);
        return Lampa.Storage.set(plugin.component + '_' + name, val, noListen);
    }

    function getSettings(name) {
        var value = Lampa.Storage.field(plugin.component + '_' + name);
        console.log('Hack TV', 'Get settings:', plugin.component + '_' + name, '->', value);
        return value;
    }

    function addSettings(type, param) {
        console.log('Hack TV', 'Adding setting:', param.name);
        var data = {
            component: plugin.component,
            param: {
                name: plugin.component + '_' + param.name,
                type: type,
                values: param.values || '',
                placeholder: param.placeholder || '',
                default: (typeof param.default === 'undefined') ? '' : param.default
            },
            field: {
                name: param.title || param.name || ''
            }
        };
        if (param.description) data.field.description = param.description;
        if (param.onChange) data.onChange = param.onChange;
        if (param.onRender) data.onRender = param.onRender;
        try {
            Lampa.SettingsApi.addParam(data);
            console.log('Hack TV', 'Setting added:', data.param.name);
        } catch (e) {
            console.error('Hack TV', 'Error adding setting:', data.param.name, e);
        }
    }

    Lampa.Component.add(plugin.component, pluginPage);

    // Настройки
    function initSettings() {
        console.log('Hack TV', 'Initializing settings');
        try {
            // Очистка предыдущих компонентов
            $('div[data-component="' + plugin.component + '"]').remove();
            
            // Регистрация компонента настроек
            Lampa.SettingsApi.addComponent({
                component: plugin.component,
                name: langGet('settings_title') || 'Hack TV PlayList',
                onOpen: function() {
                    console.log('Hack TV', 'Opening settings, rendering fields');
                    var settingsContainer = $('div[data-component="' + plugin.component + '"]');
                    if (settingsContainer.length) {
                        settingsContainer.empty();
                        // Поле для ввода ссылки на плейлист
                        settingsContainer.append(
                            $('<div class="settings-param selector" data-type="input" data-name="' + plugin.component + '_playlist_url">' +
                              '<div class="settings-param__name">' + (langGet('playlist_url') || 'Ссылка на плейлист') + '</div>' +
                              '<div class="settings-param__value"></div>' +
                              '<div class="settings-param__descr">' + (langGet('playlist_url_desc') || 'Введите URL плейлиста (например, http://example.com/playlist.m3u)') + '</div>' +
                              '</div>')
                        );
                        // Поле для квадратных иконок
                        settingsContainer.append(
                            $('<div class="settings-param selector" data-type="toggle" data-name="' + plugin.component + '_square_icons">' +
                              '<div class="settings-param__name">' + (langGet('square_icons') || 'Квадратные лого каналов') + '</div>' +
                              '<div class="settings-param__value"></div>' +
                              '</div>')
                        );
                        // Поле для коррекции размера логотипов
                        settingsContainer.append(
                            $('<div class="settings-param selector" data-type="toggle" data-name="' + plugin.component + '_contain_icons">' +
                              '<div class="settings-param__name">' + (langGet('contain_icons') || 'Коррекция размера логотипа телеканала') + '</div>' +
                              '<div class="settings-param__value"></div>' +
                              '<div class="settings-param__descr">' + (langGet('contain_icons_desc') || 'Может некорректно работать на старых устройствах') + '</div>' +
                              '</div>')
                        );
                        // Инициализация значений
                        settingsContainer.find('div[data-name="' + plugin.component + '_playlist_url"] .settings-param__value').text(getStorage('playlist_url', ''));
                        settingsContainer.find('div[data-name="' + plugin.component + '_square_icons"] .settings-param__value').text(getSettings('square_icons') || 'false');
                        settingsContainer.find('div[data-name="' + plugin.component + '_contain_icons"] .settings-param__value').text(getSettings('contain_icons') || 'true');
                        // Обработчик изменения ссылки плейлиста
                        settingsContainer.find('div[data-name="' + plugin.component + '_playlist_url"]').on('hover:enter hover:click', function() {
                            Lampa.Input.edit({
                                value: getStorage('playlist_url', ''),
                                title: langGet('playlist_url'),
                                onChange: function(value) {
                                    console.log('Hack TV', 'Playlist URL changed:', value);
                                    playlistUrl = value;
                                    setStorage('playlist_url', value);
                                    // Перезагрузка активности для обновления плейлиста
                                    Lampa.Activity.replace(Lampa.Arrays.clone(lists[0].activity));
                                },
                                onBack: function() {
                                    Lampa.Controller.toggle('content');
                                }
                            });
                        });
                        console.log('Hack TV', 'Settings fields rendered via DOM');
                    } else {
                        console.error('Hack TV', 'Settings container not found');
                    }
                }
            });
            console.log('Hack TV', 'Settings component registered');

            // Добавление параметров через addSettings
            addSettings('input', {
                title: langGet('playlist_url'),
                name: 'playlist_url',
                placeholder: 'http://example.com/playlist.m3u',
                default: getStorage('playlist_url', ''),
                description: langGet('playlist_url_desc'),
                onChange: function(v) {
                    console.log('Hack TV', 'Playlist URL changed:', v);
                    playlistUrl = v;
                    setStorage('playlist_url', v);
                }
            });
            addSettings('trigger', {
                title: langGet('square_icons'),
                name: 'square_icons',
                default: false,
                onChange: function(v) {
                    console.log('Hack TV', 'Square icons toggled:', v);
                    $('.my_iptv2.category-full').toggleClass('square_icons', v === 'true');
                    setStorage('square_icons', v);
                }
            });
            addSettings('trigger', {
                title: langGet('contain_icons'),
                name: 'contain_icons',
                default: true,
                description: langGet('contain_icons_desc'),
                onChange: function(v) {
                    console.log('Hack TV', 'Contain icons toggled:', v);
                    $('.my_iptv2.category-full').toggleClass('contain_icons', v === 'true');
                    setStorage('contain_icons', v);
                }
            });
        } catch (e) {
            console.error('Hack TV', 'Error initializing settings:', e);
        }
    }

    // Меню
    var activity = {
        id: 0,
        url: getStorage('playlist_url', 'https://u.to/PpMrIg'),
        title: plugin.name,
        groups: [],
        currentGroup: getStorage('last_catalog0', 'Other'),
        component: plugin.component,
        page: 1
    };
    if (activity.currentGroup === '!!') activity.currentGroup = '';

    var menuEl = $('<li class="menu__item selector js-' + plugin.component + '-menu0">' +
        '<div class="menu__ico">' + plugin.icon + '</div>' +
        '<div class="menu__text js-' + plugin.component + '-menu0-title">' +
        encoder.text(plugin.name).html() +
        '</div>' +
        '</li>')
        .on('hover:enter hover:click', function() {
            console.log('Hack TV', 'Menu item clicked, pushing activity');
            if (Lampa.Activity.active().component === plugin.component) {
                Lampa.Activity.replace(Lampa.Arrays.clone(activity));
            } else {
                Lampa.Activity.push(Lampa.Arrays.clone(activity));
            }
        });

    lists.push({activity: activity, menuEl: menuEl, groups: []});

    function pluginStart() {
        if (window['plugin_' + plugin.component + '_ready']) {
            console.log('Hack TV', 'Plugin already initialized, skipping');
            return;
        }
        window['plugin_' + plugin.component + '_ready'] = true;
        console.log('Hack TV', 'Starting plugin initialization');
        try {
            var menu = $('.menu .menu__list').eq(0);
            if (menu.length) {
                menu.append(menuEl);
                menuEl.show();
                console.log('Hack TV', 'Menu item added to .menu .menu__list');
            } else {
                console.error('Hack TV', 'Menu element .menu .menu__list not found');
                var altMenu = $('.menu__list');
                if (altMenu.length) {
                    altMenu.append(menuEl);
                    menuEl.show();
                    console.log('Hack TV', 'Menu item added to .menu__list');
                } else {
                    console.error('Hack TV', 'Alternative menu element .menu__list not found');
                    // Последняя попытка: поиск любого ul в .menu
                    var fallbackMenu = $('.menu ul').eq(0);
                    if (fallbackMenu.length) {
                        fallbackMenu.append(menuEl);
                        menuEl.show();
                        console.log('Hack TV', 'Menu item added to .menu ul');
                    } else {
                        console.error('Hack TV', 'No menu elements found');
                    }
                }
            }
        } catch (e) {
            console.error('Hack TV', 'Error adding menu item:', e);
        }
    }

    playlistUrl = getStorage('playlist_url', '');
    initSettings();

    if (window.appready) {
        console.log('Hack TV', 'App already ready, calling pluginStart');
        pluginStart();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('Hack TV', 'App ready event, calling pluginStart');
                pluginStart();
            }
        });
    }

    // Удаление дублирующих компонентов настроек
    Lampa.Settings.listener.follow('open', function(e) {
        if (e.name === 'main') {
            console.log('Hack TV', 'Settings main opened, removing duplicate component');
            setTimeout(function() {
                $('div[data-component="my_iptv2"]').not(':last').remove();
                // Удаление надписи undefined
                $('.settings__title:contains("undefined")').remove();
            }, 0);
        }
    });

    Lampa.Listener.follow('activity', function(a) {
        console.log('Hack TV', 'Activity event:', a.name, a.activity);
        if (!a.activity) {
            console.error('Hack TV', 'Activity is undefined');
            return;
        }
        if (a.name === 'start') {
            a.activity.onCreate = function(act) {
                console.log('Hack TV', 'Creating activity:', act);
                var actLists = [];
                var source = getStorage('source', '{}');
                try {
                    source = JSON.parse(source);
                    for (var k in source) {
                        if (source[k].url) {
                            var id = utils.hash36(k);
                            lists[id] = {
                                id: id,
                                title: k,
                                url: source[k].url,
                                currentGroup: getStorage('last_catalog' + id, '!!') === '!!' ? '' : getStorage('last_catalog' + id),
                                groups: [{
                                    title: langGet('favorites') || 'Избранное',
                                    key: ''
                                }],
                                activity: {
                                    component: plugin.component,
                                    url: source[k].url,
                                    title: k,
                                    id: id,
                                    currentGroup: getStorage('last_catalog' + id, '!!') === '!!' ? '' : getStorage('last_catalog' + id),
                                    page: 1
                                }
                            };
                            actLists.push(lists[id].activity);
                        }
                    }
                } catch (e) {
                    console.error('Hack TV', 'Error parsing source:', e);
                }
                act.params = function() {
                    console.log('Hack TV', 'Activity params called, returning actLists:', actLists);
                    return actLists;
                };
            };
        }
        if (a.activity.component === plugin.component) {
            a.activity.render = function() {
                console.log('Hack TV', 'Rendering activity for component:', plugin.component);
                return (new pluginPage(a.activity)).render();
            };
        }
    });
})();
