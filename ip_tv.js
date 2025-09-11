;(function () {
'use strict';
var plugin = {
    component: 'my_iptv',
    icon: "<svg height=\"244\" viewBox=\"0 0 260 244\" xmlns=\"http://www.w3.org/2000/svg\" style=\"fill-rule:evenodd;\" fill=\"currentColor\"><path d=\"M259.5 47.5v114c-1.709 14.556-9.375 24.723-23 30.5a2934.377 2934.377 0 0 1-107 1.5c-35.704.15-71.37-.35-107-1.5-13.625-5.777-21.291-15.944-23-30.5v-115c1.943-15.785 10.61-25.951 26-30.5a10815.71 10815.71 0 0 1 208 0c15.857 4.68 24.523 15.18 26 31.5zm-230-13a4963.403 4963.403 0 0 0 199 0c5.628 1.128 9.128 4.462 10.5 10 .667 40 .667 80 0 120-1.285 5.618-4.785 8.785-10.5 9.5-66 .667-132 .667-198 0-5.715-.715-9.215-3.882-10.5-9.5-.667-40-.667-80 0-120 1.35-5.18 4.517-8.514 9.5-10z\"/><path d=\"M70.5 71.5c17.07-.457 34.07.043 51 1.5 5.44 5.442 5.107 10.442-1 15-5.991.5-11.991.666-18 .5.167 14.337 0 28.671-.5 43-3.013 5.035-7.18 6.202-12.5 3.5a11.529 11.529 0 0 1-3.5-4.5 882.407 882.407 0 0 1-.5-42c-5.676.166-11.343 0-17-.5-4.569-2.541-6.069-6.375-4.5-11.5 1.805-2.326 3.972-3.992 6.5-5zM137.5 73.5c4.409-.882 7.909.452 10.5 4a321.009 321.009 0 0 0 16 30 322.123 322.123 0 0 0 16-30c2.602-3.712 6.102-4.879 10.5-3.5 5.148 3.334 6.314 7.834 3.5 13.5a1306.032 1306.032 0 0 0-22 43c-5.381 6.652-10.715 6.652-16 0a1424.647 1424.647 0 0 0-23-45c-1.691-5.369-.191-9.369 4.5-12zM57.5 207.5h144c7.788 2.242 10.288 7.242 7.5 15a11.532 11.532 0 0 1-4.5 3.5c-50 .667-100 .667-150 0-6.163-3.463-7.496-8.297-4-14.5 2.025-2.064 4.358-3.398 7-4z\"/></svg>",
    name: 'ipTV'
};
var isSNG = false;
var lists = [{
    activity: {
        id: 0,
        url: 'https://raw.githubusercontent.com/IPTVSHARED/iptv/refs/heads/main/IPTV_SHARED.m3u',
        title: plugin.name,
        groups: [],
        currentGroup: '',
        component: plugin.component,
        page: 1
    },
    groups: []
}];
var curListId = -1;
var defaultGroup = 'Other';
var catalog = {};
var listCfg = {};
var EPG = {};
var layerInterval;
var epgInterval;
var UID = '';

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
function epgListView(isView) {
    var scroll = $('.' + plugin.component + '.category-full').parents('.scroll');
    if (scroll.length) {
        if (isView) {
            scroll.css({float: "left", width: '70%'});
            scroll.parent().append(epgTemplate);
        } else {
            scroll.css({float: "none", width: '100%'});
            $('#' + plugin.component + '_epg').remove();
        }
    }
}
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
    return !(!playlist.length || !playlist[0].tv
        || !playlist[0].plugin || playlist[0].plugin !== plugin.component);
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
    uid: function() {return UID},
    timestamp: unixtime,
    token: function() {return generateSigForString(Lampa.Storage.field('account_email').toLowerCase())},
    hash: Lampa.Utils.hash,
    hash36: function(s) {return (this.hash(s) * 1).toString(36)}
};

function generateSigForString(string) {
    var sigTime = unixtime();
    return sigTime.toString(36) + ':' + utils.hash36((string || '') + sigTime + utils.uid());
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
            return false;
    }
    if (newUrl.indexOf('${') < 0) return catchupUrl(newUrl,'shift');
    return newUrl;
}

function keydown(e) {
    var code = e.code;
    if (Lampa.Activity.active().component === plugin.component
        && Lampa.Player.opened()
        && !$('body.selectbox--open').length
    ) {
        var playlist = Lampa.PlayerPlaylist.get();
        if (!isPluginPlaylist(playlist)) return;
        var isStopEvent = false;
        var curCh = cache('curCh') || (Lampa.PlayerPlaylist.position() + 1);
        if (code === 428 || code === 34
            || ((code === 37 || code === 4)
                && !$('.player.tv .panel--visible .focus').length
                && !$('.player.tv .player-footer.open .focus').length
            )
        ) {
            curCh = curCh === 1 ? playlist.length : curCh - 1;
            cache('curCh', curCh, 1000);
            isStopEvent = channelSwitch(curCh, true);
        } else if (code === 427 || code === 33
            || ((code === 39 || code === 5)
                && !$('.player.tv .panel--visible .focus').length
                && !$('.player.tv .player-footer.open .focus').length
            )
        ) {
            curCh = curCh === playlist.length ? 1 : curCh + 1;
            cache('curCh', curCh, 1000);
            isStopEvent = channelSwitch(curCh, true);
        } else if (code >= 48 && code <= 57) {
            isStopEvent = channelSwitch(code - 48);
        } else if (code >= 96 && code <= 105) {
            isStopEvent = channelSwitch(code - 96);
        }
        if (code === 38 || code === 29460) {
            // this.selectGroup();
            // isStopEvent = true;
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
    var key = getEpgSessKey(epgId);
    var epg = sessionStorage.getItem(key);
    if (epg) {
        epg = JSON.parse(epg);
        if (t) {
            if (epg.length
                && (
                    t < epg[0][0]
                    || t > (epg[epg.length - 1][0] + epg[epg.length - 1][1])
                )
            ) return false;
            while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
        }
    }
    return epg;
}
function setEpgSessCache(epgId, epg) {
    var key = getEpgSessKey(epgId);
    sessionStorage.setItem(key, JSON.stringify(epg));
}
function getEpgSessKey(epgId) {
    return ['epg', epgId].join('\t');
}
function networkSilentSessCache(url, success, fail, param) {
    var context = this;
    var urlForKey = url.replace(/([&?])sig=[^&]+&?/, '$1');
    var key = ['cache', urlForKey, param ? utils.hash36(JSON.stringify(param)) : ''].join('\t');
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
Lampa.Template.add(plugin.component + '_style', '<style>#PLUGIN_epg{margin-right:1em}.PLUGIN-program__desc{font-size:0.9em;margin:0.5em;text-align:justify;max-height:15em;overflow:hidden;}.PLUGIN.category-full{padding-bottom:10em}.PLUGIN div.card__view{position:relative;background-color:#353535;background-color:#353535a6;border-radius:1em;cursor:pointer;padding-bottom:60%}.PLUGIN.square_icons div.card__view{padding-bottom:100%}.PLUGIN img.card__img,.PLUGIN div.card__img{background-color:unset;border-radius:unset;max-height:100%;max-width:100%;height:auto;width:auto;position:absolute;top:50%;left:50%;-moz-transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);font-size:2em}.PLUGIN.contain_icons img.card__img{height:95%;width:95%}</style>');

function parseM3U(data) {
    var channels = [];
    var lines = data.split('\n');
    var currentChannel = null;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.startsWith('#EXTM3U')) {
            continue;
        } else if (line.startsWith('#EXTINF:')) {
            currentChannel = { title: '', url: '', group: defaultGroup, tv: true, plugin: plugin.component };
            var extinf = line.match(/#EXTINF:-?\d+\s*(?:,(.+)|.*)/);
            if (extinf && extinf[1]) currentChannel.title = extinf[1].trim();
            var attrs = line.match(/(\w+?)="([^"]*?)"/g) || [];
            attrs.forEach(function(attr) {
                var [key, value] = attr.split('="');
                value = value.slice(0, -1);
                if (key === 'tvg-id') currentChannel.tvg_id = value;
                else if (key === 'tvg-name') currentChannel.title = value || currentChannel.title;
                else if (key === 'group-title') currentChannel.group = value || defaultGroup;
                else if (key === 'tvg-logo') currentChannel.logo = value;
            });
        } else if (line && !line.startsWith('#') && currentChannel) {
            currentChannel.url = line;
            channels.push(currentChannel);
            currentChannel = null;
        }
    }
    return { channels: channels };
}

function pluginPage(object) {
    var html = $('<div></div>');
    var body = $('<div class="category-full ' + plugin.component + '"></div>');
    var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
    var info, last, favorite, layerCards, network = new Lampa.Reguest();
    this.create = function () {
        favorite = new Lampa.Favorite({component: plugin.component, type: 'tv'});
        return this.fetch();
    };
    this.fetch = function () {
        var _this = this;
        var list = lists[object.id];
        if (!catalog[list.activity.url]) {
            catalog[list.activity.url] = {};
            curListId = object.id;
            network.silent(list.activity.url, function (data) {
                var parsed = parseM3U(data);
                var channels = parsed.channels || [];
                var groups = {};
                if (channels.length) {
                    channels.forEach(function (channel) {
                        var group = channel.group || defaultGroup;
                        if (!groups[group]) groups[group] = {title: group, key: group, channels: []};
                        groups[group].channels.push(channel);
                    });
                    list.groups = Object.keys(groups).map(function (key) {
                        return {title: groups[key].title, key: groups[key].key};
                    });
                    catalog[list.activity.url] = groups;
                    _this.build(catalog[list.activity.url]);
                } else {
                    _this.activity.loader(false);
                    var empty = new Lampa.Empty();
                    html.append(empty.render());
                }
            }, function () {
                _this.activity.loader(false);
                var empty = new Lampa.Empty();
                html.append(empty.render());
            });
        } else {
            this.build(catalog[list.activity.url]);
        }
        return this;
    };
    this.build = function (catalog) {
        var channelGroup = !catalog[object.currentGroup]
            ? (lists[object.id].groups.length > 1 && !!catalog[lists[object.id].groups[1].key]
                ? catalog[lists[object.id].groups[1].key]
                : {'channels': []})
            : catalog[object.currentGroup];
        var _this2 = this;
        Lampa.Background.change();
        Lampa.Template.add(plugin.component + '_button_category', "<style>@media screen and (max-width: 2560px) {." + plugin.component + " .card--collection {width: 16.6%!important;}}@media screen and (max-width: 800px) {." + plugin.component + " .card--collection {width: 24.6%!important;}}@media screen and (max-width: 500px) {." + plugin.component + " .card--collection {width: 33.3%!important;}}</style><div class=\"full-start__button selector view--category\"><svg style=\"enable-background:new 0 0 512 512;\" version=\"1.1\" viewBox=\"0 0 24 24\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><g id=\"info\"/><g id=\"icons\"><g id=\"menu\"><path d=\"M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z\" fill=\"currentColor\"/><path d=\"M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z\" fill=\"currentColor\"/><path d=\"M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z\" fill=\"currentColor\"/></g></g></svg><span>" + langGet('categories') + "</span>\n	</div>");
        Lampa.Template.add(plugin.component + '_info_radio', '<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right" style="display: flex !important;">  <div id="stantion_filtr"></div></div></div>');
        var btn = Lampa.Template.get(plugin.component + '_button_category');
        info = Lampa.Template.get(plugin.component + '_info_radio');
        info.find('#stantion_filtr').append(btn);
        info.find('.view--category').on('hover:enter hover:click', function () {
            _this2.selectGroup();
        });
        info.find('.info__title-original').text(!catalog[object.currentGroup] ? '' : catalog[object.currentGroup].title);
        info.find('.info__title').text('');
        html.append(info.append());
        if (channelGroup.channels.length) {
            setEpgId(channelGroup);
            scroll.render().addClass('layer--wheight').data('mheight', info);
            html.append(scroll.render());
            this.append(channelGroup.channels);
            if (getStorage('epg', false)) {
                scroll.render().css({float: "left", width: '70%'});
                scroll.render().parent().append(epgTemplate);
            }
            scroll.append(body);
            setStorage('last_catalog' + object.id, object.currentGroup ? object.currentGroup : '!!');
            lists[object.id].activity.currentGroup = object.currentGroup;
        } else {
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.activity.loader(false);
            Lampa.Controller.collectionSet(info);
            Navigator.move('right');
        }
    };
    this.selectGroup = function () {
        var activity = Lampa.Arrays.clone(lists[object.id].activity);
        var groups = Lampa.Arrays.clone(lists[object.id].groups).map(function(group){
            group.selected = object.currentGroup === group.key;
            return group;
        });
        Lampa.Select.show({
            title: langGet('categories'),
            items: groups,
            onSelect: function(group) {
                if (object.currentGroup !== group.key) {
                    activity.currentGroup = group.key;
                    Lampa.Activity.replace(activity);
                } else {
                    Lampa.Player.opened() || Lampa.Controller.toggle('content');
                }
            },
            onBack: function() {
                Lampa.Player.opened() || Lampa.Controller.toggle('content');
            }
        });
    };
    this.start = function () {
        if (Lampa.Activity.active().activity !== this.activity) return;
        var _this = this;
        Lampa.Controller.add('content', {
            toggle: function toggle() {
                Lampa.Controller.collectionSet(scroll.render());
                Lampa.Controller.collectionFocus(last || false, scroll.render());
            },
            left: function left() {
                if (Navigator.canmove('left')) Navigator.move('left');
                else Lampa.Controller.toggle('menu');
            },
            right: function right() {
                if (Navigator.canmove('right')) Navigator.move('right');
                else _this.selectGroup();
            },
            up: function up() {
                if (Navigator.canmove('up')) {
                    Navigator.move('up');
                } else {
                    if (!info.find('.view--category').hasClass('focus')) {
                        Lampa.Controller.collectionSet(info);
                        Navigator.move('right')
                    } else Lampa.Controller.toggle('head');
                }
            },
            down: function down() {
                if (Navigator.canmove('down')) Navigator.move('down');
                else if (info.find('.view--category').hasClass('focus')) {
                    Lampa.Controller.toggle('content');
                }
            },
            back: function back() {
                Lampa.Activity.backward();
            }
        });
        Lampa.Controller.toggle('content');
    };
    this.pause = function () {
        Lampa.Player.runas && Lampa.Player.runas('');
    };
    this.stop = function () {
        Lampa.Player.runas && Lampa.Player.runas('');
    };
    this.render = function () {
        return html;
    };
    this.destroy = function () {
        Lampa.Player.runas && Lampa.Player.runas('');
        network.clear();
        scroll.destroy();
        if (info) info.remove();
        layerCards = null;
        if (layerInterval) clearInterval(layerInterval);
        if (epgInterval) clearInterval(epgInterval);
        html.remove();
        body.remove();
        favorite = null;
        network = null;
        html = null;
        body = null;
        info = null;
    };
}

if (!Lampa.Lang) {
    var lang_data = {};
    Lampa.Lang = {
        add: function add(data) {
            lang_data = data;
        },
        translate: function translate(key) {
            return lang_data[key] ? lang_data[key].ru : key;
        }
    };
}
var langData = {};
function langAdd(name, values) {
    langData[plugin.component + '_' + name] = values;
}
function langGet(name) {
    return Lampa.Lang.translate(plugin.component + '_' + name);
}

langAdd('max_ch_in_group', {
    ru: 'Количество каналов в категории',
    uk: 'Кількість каналів у категорії',
    be: 'Колькасць каналаў у катэгорыі',
    en: 'Number of channels in category',
    zh: '分类中的频道数量'
});
langAdd('max_ch_in_group_desc', {
    ru: 'Если количество превышено, категория разбивается на несколько. Уменьшите количество на слабых устройствах',
    uk: 'Якщо кількість перевищена, категорія розбивається на кілька. Зменшіть кількість на слабких пристроях',
    be: 'Калі колькасць перавышана, катэгорыя разбіваецца на некалькі. Паменшыце колькасць на слабых прыладах',
    en: 'If the quantity is exceeded, it splits the category into several. Reduce the number on weak devices',
    zh: '如果超出数量，则将分类拆分为多个。在弱设备上减少数量。'
});
langAdd('categories', {
    ru: 'Категории',
    uk: 'Категорія',
    be: 'Катэгорыя',
    en: 'Categories',
    zh: '分类'
});
langAdd('uid', {
    ru: 'UID',
    uk: 'UID',
    be: 'UID',
    en: 'UID',
    zh: 'UID'
});
langAdd('unique_id', {
    ru: 'уникальный идентификатор (нужен для некоторых ссылок на плейлисты)',
    uk: 'унікальний ідентифікатор (необхідний для деяких посилань на списки відтворення)',
    be: 'унікальны ідэнтыфікатар (неабходны для некаторых спасылак на спіс прайгравання)',
    en: 'unique identifier (needed for some playlist links)',
    zh: '唯一 ID（某些播放列表链接需要）'
});
langAdd('launch_menu', {
    ru: 'Запуск через меню',
    uk: 'Запуск через меню',
    be: 'Запуск праз меню',
    en: 'Launch via menu',
    zh: '通过菜单启动'
});
langAdd('favorites', {
    ru: 'Избранное',
    uk: 'Вибране',
    be: 'Выбранае',
    en: 'Favorites',
    zh: '收藏夹'
});
langAdd('favorites_add', {
    ru: 'Добавить в избранное',
    uk: 'Додати в обране',
    be: 'Дадаць у абранае',
    en: 'Add to favorites',
    zh: '添加到收藏夹'
});
langAdd('favorites_del', {
    ru: 'Удалить из избранного',
    uk: 'Видалити з вибраного',
    be: 'Выдаліць з абранага',
    en: 'Remove from favorites',
    zh: '从收藏夹中删除'
});
langAdd('favorites_clear', {
    ru: 'Очистить избранное',
    uk: 'Очистити вибране',
    be: 'Ачысціць выбранае',
    en: 'Clear favorites',
    zh: '清除收藏夹'
});
langAdd('favorites_move_top', {
    ru: 'В начало списка',
    uk: 'На початок списку',
    be: 'Да пачатку спісу',
    en: 'To the top of the list',
    zh: '到列表顶部'
});
langAdd('favorites_move_up', {
    ru: 'Сдвинуть вверх',
    uk: 'Зрушити вгору',
    be: 'Ссунуць уверх',
    en: 'Move up',
    zh: '上移'
});
langAdd('favorites_move_down', {
    ru: 'Сдвинуть вниз',
    uk: 'Зрушити вниз',
    be: 'Ссунуць уніз',
    en: 'Move down',
    zh: '下移'
});
langAdd('favorites_move_end', {
    ru: 'В конец списка',
    uk: 'В кінець списку',
    be: 'У канец спісу',
    en: 'To the end of the list',
    zh: '到列表末尾'
});
langAdd('epg_on', {
    ru: 'Включить телепрограмму',
    uk: 'Увімкнути телепрограму',
    be: 'Уключыць тэлепраграму',
    en: 'TV Guide: On',
    zh: '電視指南：開'
});
langAdd('epg_off', {
    ru: 'Отключить телепрограмму',
    uk: 'Вимкнути телепрограму',
    be: 'Адключыць тэлепраграму',
    en: 'TV Guide: Off',
    zh: '電視指南：關閉'
});
langAdd('epg_title', {
    ru: 'Телепрограмма',
    uk: 'Телепрограма',
    be: 'Тэлепраграма',
    en: 'TV Guide',
    zh: '電視指南'
});
langAdd('square_icons', {
    ru: 'Квадратные лого каналов',
    uk: 'Квадратні лого каналів',
    be: 'Квадратныя лога каналаў',
    en: 'Square channel logos',
    zh: '方形通道標誌'
});
langAdd('contain_icons', {
    ru: 'Коррекция размера логотипа телеканала',
    uk: 'Виправлення розміру логотипу телеканалу',
    be: 'Карэкцыя памеру лагатыпа тэлеканала',
    en: 'TV channel logo size correction',
    zh: '電視頻道標誌尺寸校正'
});
langAdd('contain_icons_desc', {
    ru: 'Может некорректно работать на старых устройствах',
    uk: 'Може некоректно працювати на старих пристроях',
    be: 'Можа некарэктна працаваць на старых прыладах',
    en: 'May not work correctly on older devices.',
    zh: '可能无法在较旧的设备上正常工作。'
});

Lampa.Lang.add(langData);

function favID(title) {
    return title.toLowerCase().replace(/[\s!-\/:-@\[-`{-~]+/g, '')
}
function getStorage(name, defaultValue) {
    return Lampa.Storage.get(plugin.component + '_' + name, defaultValue);
}
function setStorage(name, val, noListen) {
    return Lampa.Storage.set(plugin.component + '_' + name, val, noListen);
}
function getSettings(name) {
    return Lampa.Storage.field(plugin.component + '_' + name);
}
function addSettings(type, param) {
    var data = {
        component: plugin.component,
        param: {
            name: plugin.component + '_' + param.name,
            type: type,
            values: !param.values ? '' : param.values,
            placeholder: !param.placeholder ? '' : param.placeholder,
            default: (typeof param.default === 'undefined') ? '' : param.default
        },
        field: {
            name: !param.title ? (!param.name ? '' : param.name) : param.title
        }
    }
    if (!!param.name) data.param.name = plugin.component + '_' + param.name;
    if (!!param.description) data.field.description = param.description;
    if (!!param.onChange) data.onChange = param.onChange;
    if (!!param.onRender) data.onRender = param.onRender;
    Lampa.SettingsApi.addParam(data);
}

Lampa.Component.add(plugin.component, pluginPage);
Lampa.SettingsApi.addComponent(plugin);
addSettings(
    'trigger',
    {
        title: langGet('square_icons'),
        name: 'square_icons',
        default: false,
        onChange: function(v){
            $('.' + plugin.component + '.category-full').toggleClass('square_icons', v === 'true');
        }
    }
);
addSettings(
    'trigger',
    {
        title: langGet('contain_icons'),
        description: langGet('contain_icons_desc'),
        name: 'contain_icons',
        default: true,
        onChange: function(v){
            $('.' + plugin.component + '.category-full').toggleClass('contain_icons', v === 'true');
        }
    }
);
addSettings(
    'trigger',
    {
        title: langGet('epg_on'),
        name: 'epg',
        default: false,
        onChange: function(v){
            epgListView(v === 'true');
        }
    }
);
addSettings(
    'trigger',
    {
        title: langGet('launch_menu'),
        name: 'launch_menu',
        default: false
    }
);
addSettings(
    'select',
    {
        title: langGet('max_ch_in_group'),
        description: langGet('max_ch_in_group_desc'),
        name: 'max_ch_in_group',
        values: {
            0: '#{settings_param_card_view_all}',
            60: '60',
            120: '120',
            180: '180',
            240: '240',
            300: '300'
        },
        default: 300
    }
);
UID = getStorage('uid', '');
if (!UID) {
    UID = Lampa.Utils.uid(10).toUpperCase().replace(/(.{4})/g, '$1-');
    setStorage('uid', UID);
} else if (UID.length > 12) {
    UID = UID.substring(0, 12);
    setStorage('uid', UID);
}
addSettings('title', {title: langGet('uid')});
addSettings('static', {title: UID, description: langGet('unique_id')});

function pluginStart() {
    if (!!window['plugin_' + plugin.component + '_ready']) {
        return;
    }
    window['plugin_' + plugin.component + '_ready'] = true;
    var menu = $('.menu .menu__list').eq(0);
    var menuEl = $('<li class="menu__item selector js-' + plugin.component + '-menu0">'
        + '<div class="menu__ico">' + plugin.icon + '</div>'
        + '<div class="menu__text js-' + plugin.component + '-menu0-title">'
        + encoder.text(plugin.name).html()
        + '</div>'
        + '</li>')
        .on('hover:enter', function(){
            if (Lampa.Activity.active().component === plugin.component) {
                Lampa.Activity.replace(Lampa.Arrays.clone(lists[0].activity));
            } else {
                Lampa.Activity.push(Lampa.Arrays.clone(lists[0].activity));
            }
        });
    menu.append(menuEl);
    isSNG = ['uk', 'ru', 'be'].indexOf(Lampa.Storage.field('language')) >= 0;
}

if (!!window.appready) pluginStart();
else Lampa.Listener.follow('app', function(e){if (e.type === 'ready') pluginStart()});
})();
