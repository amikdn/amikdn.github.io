(function () {
'use strict';

//  MD5 Implementation

var MD5 = function (input) {
    var str = String(input);

    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000)
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWordsTemp1 = lMessageLength + 8;
        var lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;

        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }

        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

        return lWordArray;
    }

    function wordToHex(lValue) {
        var wordToHexValue = "", wordToHexValueTemp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValueTemp = "0" + lByte.toString(16);
            wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
        }
        return wordToHexValue;
    }

    var x = convertToWordArray(str);
    var a = 0x67452301;
    var b = 0xEFCDAB89;
    var c = 0x98BADCFE;
    var d = 0x10325476;

    for (var k = 0; k < x.length; k += 16) {
        var AA = a, BB = b, CC = c, DD = d;

        a = FF(a, b, c, d, x[k + 0], 7, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821);

        a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
        c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);

        a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], 11, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], 23, 0x04881D05);
        a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665);

        a = II(a, b, c, d, x[k + 0], 6, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], 15, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391);

        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
};

/* === ДАЛЕЕ ИДЕТ ТВОЙ КОД ЛОГИКИ БЕЗ ИЗМЕНЕНИЙ === */
// 1. НАСТРОЙКИ И ДАННЫЕ
var YM_CATS = {
    'wave': { name: 'Моя волна', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>' },
    'favorites': { name: 'Моя музыка', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#f1c40f" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
    'discover': { name: 'Обзор', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#2ecc71" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
    'search': { name: '', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>', is_round: true }
};

var YM_WAVE_TAGS = [
    { title: 'По умолчанию', value: 'user:onyourwave' },
    { title: 'Грустное', value: 'mood:sad' },
    { title: 'Поп', value: 'genre:pop' },
    { title: 'Диско', value: 'genre:disco' },
    { title: 'Рок', value: 'genre:rock' },
    { title: 'Электронная', value: 'genre:electronic' },
    { title: 'Джаз', value: 'genre:jazz' },
    { title: 'Классика', value: 'genre:classical' },
    { title: 'Фанк', value: 'genre:funk' }
];

var YM_DISCOVER_SECTIONS = [
    { title: 'Новинки', value: 'new_releases', icon: '🆕' },
    { title: 'Новые плейлисты', value: 'new_playlists', icon: '📋' },
    { title: 'Плейлист дня', value: 'playlist_day', icon: '📅' },
    { title: 'Любимые исполнители', value: 'liked_artists', icon: '👨‍🎤' },
    { title: 'Жанры', value: 'genres', icon: '🎭' },
    { title: 'Чарт', value: 'chart', icon: '📊' },
    // Тематические коллекции (требуют Session_id в cookies)
    { title: 'Зимняя ❄️', value: 'winter', icon: '❄️' },
    { title: 'Настроения 😊', value: 'moods', icon: '😊' },
    { title: 'Занятия 🏃', value: 'activities', icon: '🏃' },
    { title: 'Эпохи 📻', value: 'decades', icon: '📻' },
    { title: 'Новинки клипов 🎬', value: 'new_videos', icon: '🎬' },
    { title: 'Альбомы с комментариями 💬', value: 'albums_comments', icon: '💬' },
    { title: 'Выбор редакции ✨', value: 'editorial', icon: '✨' },
    { title: 'Суперхиты 🔥', value: 'superhits', icon: '🔥' },
    { title: 'Новые хиты ⭐', value: 'new_hits', icon: '⭐' }
];

function getCurrentDiscoverSectionName() {
    var currentSection = Lampa.Storage.get('ym_discover_section', 'new_releases');
    
    for (var i = 0; i < YM_DISCOVER_SECTIONS.length; i++) {
        if (YM_DISCOVER_SECTIONS[i].value === currentSection) {
            return YM_DISCOVER_SECTIONS[i].title;
        }
    }
    return 'Новинки';
}

// Функция для получения названия текущего настроения волны
function getCurrentWaveMoodName() {
    var currentStation = Lampa.Storage.get('ym_station', 'user:onyourwave');
    
    for (var i = 0; i < YM_WAVE_TAGS.length; i++) {
        if (YM_WAVE_TAGS[i].value === currentStation) {
            return YM_WAVE_TAGS[i].title;
        }
    }
    return 'По умолчанию';
}

var YM_VIS_TYPES = { 'none': 'Нет', 'bars': 'Эквалайзер (Live)', 'wave': 'Волна (Live)', 'particles': 'Огоньки' };
var YM_SHUFFLE_MODES = { 'off': 'Выключено', 'on': 'Включено' };
var YM_PROXY_MODES = { 
    'cascade': 'Авто (Каскад)', 
    'direct': 'Без прокси (Прямые запросы)', 
    'cors': 'CorsProxy.io', 
    'allorigins': 'AllOrigins', 
    'thing': 'ThingProxy',
    'workers': 'Cloudflare Workers',
    'custom': 'Свой URL (задать в настройках)'
};

window.ym_tracks_list = [];
window.ym_current_index = -1;
window.ym_active_id = null;
window.ym_user_id = null;
window.ym_is_loading_more = false; // Глобальная переменная для состояния загрузки
window.ym_search_mode = false; // Глобальная переменная для режима поиска
window.ym_tooltip = null; // Глобальная переменная для tooltip

// Опциональное подавление ошибок JSONP (включается в настройках плагина)
function ymShouldSuppressJsonpErrors() {
    try {
        return typeof Lampa !== 'undefined' && Lampa.Storage && Lampa.Storage.get('ym_suppress_jsonp_errors', 'false') === 'true';
    } catch (e) { return false; }
}
function ymIsJsonpLikeError(message) {
    return message && (message.indexOf('Unexpected token') !== -1 || message.indexOf('SyntaxError') !== -1);
}

var originalConsoleError = console.error;
console.error = function() {
    var message = Array.prototype.slice.call(arguments).join(' ');
    if (ymShouldSuppressJsonpErrors() && ymIsJsonpLikeError(message)) return;
    originalConsoleError.apply(console, arguments);
};

var originalWindowError = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
    if (ymShouldSuppressJsonpErrors() && ymIsJsonpLikeError(message)) return true;
    if (originalWindowError) return originalWindowError.apply(this, arguments);
    return false;
};

window.addEventListener('error', function(event) {
    if (ymShouldSuppressJsonpErrors() && ymIsJsonpLikeError(event.message)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});

window.addEventListener('unhandledrejection', function(event) {
    var msg = event.reason && event.reason.message;
    if (ymShouldSuppressJsonpErrors() && ymIsJsonpLikeError(msg)) {
        event.preventDefault();
        return false;
    }
});

function debug(msg, isError) {
    console.log('[YM]', msg);
    // Все сообщения только в консоль, никаких уведомлений пользователю
}

// Функция для показа красивых уведомлений (как в ss_ai.js)
var statusBox = null;
function showStatus(text, isError) {
    if (!statusBox) {
        var html = '<div id="ym-status" style="position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none;">' +
                   '<div style="display: inline-block; background: rgba(0,0,0,0.9); padding: 15px 25px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 5px 20px rgba(0,0,0,0.8); backdrop-filter: blur(10px);">' +
                   '<span class="status-text" style="color: #fff; font-size: 1.2em; font-weight: 500;"></span>' +
                   '</div></div>';
        $('body').append(html);
        statusBox = $('#ym-status');
    }
    var color = isError ? '#ff5555' : '#fff';
    statusBox.find('.status-text').text(text).css('color', color);
    statusBox.fadeIn(200);
    
    // Автоматически скрываем через 5 секунд (увеличено с 3 секунд)
    setTimeout(function() {
        if (statusBox) statusBox.fadeOut(500);
    }, 5000);
}

// Функция тестирования cookies
function testCookiesFunction() {
    console.log('[YM] 🧪 Запуск теста cookies...');
    
    // Читаем все поля
    var sessionId = Lampa.Storage.get('ym_session_id', '');
    var sessionId2 = Lampa.Storage.get('ym_sessionid2', '');
    var yandexUid = Lampa.Storage.get('ym_yandexuid', '');
    var yandexLogin = Lampa.Storage.get('ym_yandex_login', '');
    var lToken = Lampa.Storage.get('ym_l_token', '');
    
    var message = '=== ПРОВЕРКА ПОЛЕЙ ===\n';
    
    message += 'Session_id: ' + (sessionId ? 'ЗАПОЛНЕНО (' + sessionId.length + ' символов)' : 'ПУСТО') + '\n';
    message += 'sessionid2: ' + (sessionId2 ? 'ЗАПОЛНЕНО (' + sessionId2.length + ' символов)' : 'ПУСТО') + '\n';
    message += 'yandexuid: ' + (yandexUid ? 'ЗАПОЛНЕНО' : 'ПУСТО') + '\n';
    message += 'yandex_login: ' + (yandexLogin ? 'ЗАПОЛНЕНО' : 'ПУСТО') + '\n';
    message += 'L токен: ' + (lToken ? 'ЗАПОЛНЕНО (' + lToken.length + ' символов)' : 'ПУСТО') + '\n';
    
    // Проверяем логику плагина
    var hasSessionId = sessionId || sessionId2;
    message += '\n=== ЛОГИКА ПЛАГИНА ===\n';
    message += 'hasSessionId: ' + (hasSessionId ? 'ЕСТЬ' : 'НЕТ') + '\n';
    
    if (!hasSessionId) {
        message += '\n❌ ПРОБЛЕМА: Плагин покажет "Session_id required"\n';
        alert('🧪 Тест cookies:\n\n' + message);
        return;
    }
    
    // Тестируем создание headers
    message += '\n=== ТЕСТ HEADERS ===\n';
    var headers = YM_API.getWebHeaders();
    
    if (headers) {
        message += '✅ Headers созданы\n';
        message += 'Cookie длина: ' + (headers.Cookie ? headers.Cookie.length : 0) + ' символов\n';
        
        if (headers.Cookie && headers.Cookie.includes('Session_id=')) {
            message += '✅ Session_id найден в Cookie\n';
        } else {
            message += '❌ Session_id НЕ найден в Cookie\n';
        }
        
        // Показываем первые 100 символов cookies
        if (headers.Cookie) {
            message += 'Cookie (первые 100): ' + headers.Cookie.substring(0, 100) + '...\n';
        }
        
    } else {
        message += '❌ Headers НЕ созданы - вот проблема!\n';
    }
    
    console.log('[YM] Результаты теста:', message);
    alert('🧪 Тест headers:\n\n' + message);
}



// Функция для тестирования explicit контента (не меняет настройку пользователя)
function testExplicitFilter() {
    var testTracks = [
        { id: 1, title: 'Clean Track', explicit: false },
        { id: 2, title: 'Explicit Track', explicit: true },
        { id: 3, title: 'Track [Explicit]', explicit: false },
        { id: 4, title: 'Normal Song', contentWarning: 'explicit' },
        { id: 5, title: 'Another Clean', albums: [{ explicit: true }] }
    ];

    var savedFilter = Lampa.Storage.get('ym_filter_explicit', 'off');
    var useApiFilter = (savedFilter === 'api' || savedFilter === 'both');
    var useWordsFilter = (savedFilter === 'words' || savedFilter === 'both');

    console.log('[YM] Testing explicit filter (режим: ' + savedFilter + ')...');

    testTracks.forEach(function(track) {
        var isExplicit = false;

        if (useWordsFilter) {
            var title = (track.title || '').toLowerCase();
            if (title.indexOf('[explicit]') !== -1 || title.indexOf('(explicit)') !== -1 || title.indexOf('18+') !== -1) {
                isExplicit = true;
            }
        }
        if (!isExplicit && useApiFilter) {
            if (track.contentWarning === 'explicit' || track.content_warning === 'explicit' ||
                track.explicit === true || track.explicit === 'true' || track.explicit === 1) {
                isExplicit = true;
            }
            if (track.albums && track.albums.length > 0 && track.albums[0].explicit === true) {
                isExplicit = true;
            }
        }

        console.log('[YM] Track:', track.title, 'Explicit:', isExplicit, 'Filtered:', isExplicit && (useApiFilter || useWordsFilter));
    });
}

// 2. УТИЛИТЫ И API
var YM_API = {
    getSalt: function() { return (Lampa && Lampa.Storage) ? Lampa.Storage.get('ym_salt', '') : ''; },
    getSecretKey: function() { return (Lampa && Lampa.Storage) ? Lampa.Storage.get('ym_secret_key', '') : ''; },
    getClassicSecretKey: function() { return (Lampa && Lampa.Storage) ? Lampa.Storage.get('ym_classic_secret_key', '') : ''; },

    // HMAC подпись для нового метода
    getHMACSign: function(data, secretKey, callback) {
        debug('🔐 Создаем HMAC подпись для: ' + data.substring(0, 50) + '...', true);
        debug('🔑 Секретный ключ: ' + secretKey, true);
        
        try {
            // Используем Web Crypto API если доступен
            if (typeof crypto !== 'undefined' && crypto.subtle) {
                debug('✅ Используем Web Crypto API для HMAC', true);
                var encoder = new TextEncoder();
                var keyData = encoder.encode(secretKey);
                
                crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: { name: 'SHA-256' } },
                    false,
                    ['sign']
                ).then(function(cryptoKey) {
                    var messageData = encoder.encode(data);
                    return crypto.subtle.sign('HMAC', cryptoKey, messageData);
                }).then(function(signature) {
                    var base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature))).slice(0, -1);
                    debug('✅ HMAC подпись создана (Web Crypto): ' + base64Signature, true);
                    callback(base64Signature);
                }).catch(function(error) {
                    debug('❌ HMAC ошибка Web Crypto: ' + error, true);
                    debug('🔄 Переключаемся на fallback метод', true);
                    // Fallback на простую подпись
                    var fallbackSignature = btoa(data + secretKey).slice(0, 43);
                    debug('✅ HMAC подпись создана (fallback): ' + fallbackSignature, true);
                    callback(fallbackSignature);
                });
            } else {
                // Fallback - используем простую подпись
                debug('⚠️ Web Crypto API недоступен, используем fallback', true);
                var fallbackSignature = btoa(data + secretKey).slice(0, 43);
                debug('✅ HMAC подпись создана (fallback): ' + fallbackSignature, true);
                callback(fallbackSignature);
            }
        } catch (e) {
            debug('❌ HMAC исключение: ' + e, true);
            debug('🔄 Используем аварийный fallback', true);
            var emergencySignature = btoa(data + secretKey).slice(0, 43);
            debug('✅ HMAC подпись создана (аварийный): ' + emergencySignature, true);
            callback(emergencySignature);
        }
    },
    
    getHeaders: function() {
        var token = Lampa.Storage.get('ym_token', '');
        
        var headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
        
        if (token) {
            headers['Authorization'] = 'OAuth ' + token;
        }
        
        // Добавляем заголовки для API фильтрации
        var filterMode = Lampa.Storage.get('ym_filter_explicit', 'off');
        if (filterMode === 'api' || filterMode === 'both') {
            headers['X-Yandex-Music-Child-Mode'] = '1';
            headers['X-Child-Mode'] = 'true';
            headers['X-Family-Filter'] = 'strict';
        }
        
        return headers;
    },

    // Добавляет параметры API фильтрации к URL
    addApiFilterParams: function(url) {
        var filterMode = Lampa.Storage.get('ym_filter_explicit', 'off');
        if (filterMode !== 'api' && filterMode !== 'both') return url;
        
        var separator = url.includes('?') ? '&' : '?';
        var childParams = [
            'child-mode=1',
            'family-filter=strict',
            'explicit=false',
            'adult-content=false'
        ];
        
        var newUrl = url + separator + childParams.join('&');
        debug('URL с API фильтрацией: ' + newUrl);
        return newUrl;
    },

    // Удаляем функцию addChildModeParams - она слишком агрессивная

    // Функция для JSONP запросов (ОТКЛЮЧЕНА - вызывает мусорные ошибки)
    jsonpRequest: function(url, callback, errorCallback) {
        // JSONP отключен - сразу вызываем ошибку
        if (errorCallback) errorCallback();
    },

    // Попытка прямого запроса с различными методами обхода CORS
    directRequest: function(url, callback, errorCallback, postData) {
        var self = this;
        var headers = this.getHeaders();
        
        debug('🔄 Пробуем прямые запросы для: ' + url);
        
        // Метод 1: Fetch с различными режимами CORS
        var tryFetch = function(mode, credentials) {
            if (typeof fetch === 'undefined') return Promise.reject('Fetch не поддерживается');
            
            debug('Пробуем fetch с mode: ' + mode + ', credentials: ' + credentials);
            
            var fetchOptions = {
                method: postData ? 'POST' : 'GET',
                mode: mode,
                credentials: credentials
            };
            
            // Добавляем заголовки только если режим позволяет
            if (mode === 'cors') {
                fetchOptions.headers = headers;
            }
            
            if (postData) {
                fetchOptions.body = postData;
                if (mode === 'cors') {
                    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            }
            
            return fetch(url, fetchOptions)
                .then(function(response) {
                    debug('Fetch response status: ' + response.status + ', ok: ' + response.ok);
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.json();
                });
        };
        
        // Пробуем разные комбинации режимов
        var fetchMethods = [
            { mode: 'cors', credentials: 'include' },
            { mode: 'cors', credentials: 'same-origin' },
            { mode: 'cors', credentials: 'omit' },
            { mode: 'no-cors', credentials: 'omit' }
        ];
        
        var tryNextFetch = function(index) {
            if (index >= fetchMethods.length) {
                debug('Все fetch методы неудачны, пробуем XHR');
                tryXHR();
                return;
            }
            
            var method = fetchMethods[index];
            
            tryFetch(method.mode, method.credentials)
                .then(function(data) {
                    debug('✅ Fetch успешен с mode: ' + method.mode + ', credentials: ' + method.credentials);
                    callback(data);
                })
                .catch(function(error) {
                    debug('❌ Fetch неудачен (' + method.mode + '/' + method.credentials + '): ' + error.message);
                    tryNextFetch(index + 1);
                });
        };
        
        // Метод 2: XMLHttpRequest с различными настройками
        var tryXHR = function() {
            if (postData) {
                debug('XHR: POST запросы сложнее обойти без прокси');
                if (errorCallback) errorCallback();
                return;
            }
            
            debug('Пробуем XMLHttpRequest');
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 15000;
            
            xhr.onload = function() {
                debug('XHR response status: ' + xhr.status);
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        debug('✅ XHR успешен');
                        callback(data);
                    } catch (e) {
                        debug('❌ XHR parse error: ' + e.message);
                        if (errorCallback) errorCallback();
                    }
                } else {
                    debug('❌ XHR HTTP error: ' + xhr.status);
                    if (errorCallback) errorCallback();
                }
            };
            
            xhr.onerror = function() {
                debug('❌ XHR network error');
                if (errorCallback) errorCallback();
            };
            
            xhr.ontimeout = function() {
                debug('❌ XHR timeout');
                if (errorCallback) errorCallback();
            };
            
            try {
                xhr.open('GET', url, true);
                
                // Пробуем добавить заголовки (некоторые могут быть запрещены)
                Object.keys(headers).forEach(function(key) {
                    try {
                        xhr.setRequestHeader(key, headers[key]);
                    } catch (e) {
                        debug('Не удалось установить заголовок ' + key + ': ' + e.message);
                    }
                });
                
                xhr.send();
            } catch (e) {
                debug('❌ XHR exception: ' + e.message);
                if (errorCallback) errorCallback();
            }
        };

        
        // Начинаем с fetch
        tryNextFetch(0);
    },

    req: function(url, callback, errorCallback, isRaw, postData) {
        // Добавляем параметры API фильтрации к URL
        url = this.addApiFilterParams(url);
        
        var self = this;
        var net = new (Lampa.Request || Lampa.Reguest)();
        var headers = isRaw ? {} : this.getHeaders();
        var mode = Lampa.Storage.get('ym_proxy_mode', 'cascade');
        var token = Lampa.Storage.get('ym_token', '');
        
        if (!isRaw && !token && url.indexOf('landing3') === -1 && url.indexOf('search') === -1) { 
            if(errorCallback) errorCallback(); 
            debug('Нет токена', true);
            return; 
        }

        if (postData) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        var queue = [];
        if (mode === 'cascade') {
            // Сначала пробуем все прямые методы без прокси
            queue.push({ type: 'direct_advanced' });
            queue.push({ type: 'native' });
            // Затем прокси как fallback
            queue.push({ type: 'proxy', url: 'https://api.allorigins.win/raw?url=' });
            queue.push({ type: 'proxy', url: 'https://cors.bwa.workers.dev/' });
            queue.push({ type: 'proxy', url: 'https://corsproxy.io/?' });
            queue.push({ type: 'proxy', url: 'https://thingproxy.freeboard.io/fetch/' });
            queue.push({ type: 'proxy', url: 'https://cors-anywhere.herokuapp.com/' });
        } else if (mode === 'direct') {
            queue.push({ type: 'direct_advanced' });
            queue.push({ type: 'native' });
        } else if (mode === 'cors') {
            queue.push({ type: 'proxy', url: 'https://corsproxy.io/?' });
        } else if (mode === 'allorigins') {
            queue.push({ type: 'proxy', url: 'https://api.allorigins.win/raw?url=' });
        } else if (mode === 'workers') {
            queue.push({ type: 'proxy', url: 'https://cors.bwa.workers.dev/' });
        } else if (mode === 'custom') {
            var customUrl = (Lampa.Storage.get('ym_proxy_custom', '') || '').trim();
            if (customUrl) {
                var proxyUrl = /[?=]$/.test(customUrl) ? customUrl : customUrl.replace(/\/*$/, '') + '?';
                queue.push({ type: 'proxy', url: proxyUrl });
            }
        } else {
            queue.push({ type: 'proxy', url: 'https://thingproxy.freeboard.io/fetch/' });
        }

        var tryNext = function(idx) {
            if (idx >= queue.length) {
                debug('❌ Все методы подключения не сработали для: ' + url, true);
                debug('Попробованные методы: ' + queue.map(function(q) { return q.type || q.url; }).join(', '), true);
                if(errorCallback) errorCallback();
                return;
            }

            var method = queue[idx];
            debug('Пробуем метод ' + (idx + 1) + '/' + queue.length + ': ' + (method.type || method.url));
            
            if (method.type === 'direct_advanced') {
                self.directRequest(url, function(data) {
                    debug('✅ Прямой запрос успешен');
                    callback(data);
                }, function() {
                    debug('❌ Прямой запрос неудачен');
                    tryNext(idx + 1);
                }, postData);
            } else if (method.type === 'native') {
                net['native'](url, function(res) {
                    debug('✅ Native запрос успешен');
                    try {
                        var json = (typeof res === 'string' && !isRaw) ? JSON.parse(res) : res;
                        if (json.error) {
                            debug('❌ Native API Error: ' + JSON.stringify(json.error));
                            tryNext(idx + 1);
                        } else {
                            callback(json);
                        }
                    } catch(e) {
                        if(!isRaw) { 
                            debug('❌ Native Parse Error: ' + e.message); 
                            tryNext(idx + 1); 
                        } else { 
                            callback(res); 
                        }
                    }
                }, function(err) {
                    debug('❌ Native запрос неудачен: ' + JSON.stringify(err));
                    tryNext(idx + 1);
                }, postData, { headers: headers, dataType: 'text' });
            } else {
                if (postData) {
                    debug('❌ Прокси не поддерживает POST запросы');
                    tryNext(idx + 1);
                    return;
                }
                var finalUrl = method.url + encodeURIComponent(url);
                var currentHeaders = (method.url.indexOf('allorigins') > -1) ? {} : headers;
                
                net.silent(finalUrl, function(res) {
                    if (res && res.error && !isRaw) {
                        debug('❌ Прокси ошибка (' + method.url + '): ' + JSON.stringify(res.error));
                        tryNext(idx + 1);
                    } else if (res) {
                        debug('✅ Прокси успешен: ' + method.url);
                        callback(res);
                    } else {
                        debug('❌ Прокси пустой ответ: ' + method.url);
                        tryNext(idx + 1);
                    }
                }, function(error) {
                    debug('❌ Прокси сетевая ошибка (' + method.url + '): ' + JSON.stringify(error));
                    tryNext(idx + 1);
                }, null, { headers: currentHeaders, dataType: isRaw ? 'text' : 'json' });
            }
        };

        tryNext(0);
    },

    getUserId: function(cb) {
        if(window.ym_user_id) return cb(window.ym_user_id);
        
        debug('Получаем UserID...');
        var token = Lampa.Storage.get('ym_token', '');
        
        if (!token) {
            debug('Нет токена для получения UserID', true);
            cb(null);
            return;
        }
        
        this.req('https://api.music.yandex.net/account/status', function(res){
            debug('UserID API Response: ' + JSON.stringify(res).substring(0, 300));
            if(res.result && res.result.account) {
                window.ym_user_id = res.result.account.uid;
                debug('UserID получен: ' + window.ym_user_id);
                cb(window.ym_user_id);
            } else {
                debug('API Status: Неверный формат ответа - ' + JSON.stringify(res), true);
                cb(null);
            }
        }, function(error){ 
            debug('Ошибка получения UserID (Network): ' + JSON.stringify(error), true);
            cb(null); 
        });
    },

    getImg: function(data, size) {
        if (!data) return './img/img_broken.svg';
        
        debug('🖼️ getImg вызван для: ' + JSON.stringify(data, null, 2).substring(0, 300));
        
        var url = '';
        
        // Пробуем разные поля для получения URL изображения
        if (data.coverUri) {
            url = data.coverUri;
            debug('✅ Найден coverUri: ' + url);
        } else if (data.cover && data.cover.uri) {
            url = data.cover.uri;
            debug('✅ Найден cover.uri: ' + url);
        } else if (data.ogImage) {
            url = data.ogImage;
            debug('✅ Найден ogImage: ' + url);
        } else if (data.artworkUrl) {
            url = data.artworkUrl;
            debug('✅ Найден artworkUrl: ' + url);
        } else if (data.image) {
            url = data.image;
            debug('✅ Найден image: ' + url);
        } else if (data.albums && data.albums[0] && data.albums[0].coverUri) {
            // Для треков берем обложку альбома
            url = data.albums[0].coverUri;
            debug('✅ Найден albums[0].coverUri: ' + url);
        } else if (data.artists && data.artists[0] && data.artists[0].cover && data.artists[0].cover.uri) {
            // Для треков берем изображение артиста
            url = data.artists[0].cover.uri;
            debug('✅ Найден artists[0].cover.uri: ' + url);
        }
        
        // Для жанров используем эмодзи-иконки
        if (!url && data.type === 'genre') {
            // Создаем простые цветные блоки с эмодзи для жанров
            var genreIcons = {
                'pop': '🎤',
                'rock': '🎸', 
                'electronic': '🎛️',
                'jazz': '🎺',
                'classical': '🎼',
                'hip-hop': '🎤',
                'indie': '🎵',
                'metal': '⚡',
                'alternative': '🎧',
                'punk': '💀',
                'blues': '🎷',
                'country': '🤠',
                'reggae': '🌴',
                'folk': '🪕',
                'disco': '🕺',
                'funk': '🎶',
                'r&b': '💫',
                'ska': '🎺',
                'танцевальная': '💃',
                'легкая музыка': '☁️',
                'детская музыка': '🧸',
                'авторская песня': '✍️',
                'эстрада': '🎭',
                'шансон': '🍷',
                'кантри': '🤠',
                'саундтреки': '🎬'
            };
            
            var genreId = (data.id || data.name || 'unknown').toLowerCase();
            var icon = genreIcons[genreId] || '🎵';
            
            // Возвращаем data URL с эмодзи
            var canvas = document.createElement('canvas');
            canvas.width = parseInt(size?.split('x')[0] || '200');
            canvas.height = parseInt(size?.split('x')[1] || '200');
            var ctx = canvas.getContext('2d');
            
            // Фон
            ctx.fillStyle = '#' + (genreId.length > 3 ? genreId.substring(0, 6).replace(/[^0-9a-f]/g, '0') : '666666');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Эмодзи
            ctx.font = (canvas.width * 0.4) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, canvas.width / 2, canvas.height / 2);
            
            debug('🎨 Создан эмодзи-плейсхолдер для жанра: ' + genreId + ' -> ' + icon);
            return canvas.toDataURL();
        }
        
        if (!url) {
            debug('⚠️ Изображение не найдено для: ' + (data.title || data.name || 'unknown'));
            return './img/img_broken.svg';
        }
        
        // Убираем протокол если есть
        url = url.replace(/^https?:\/\//, '');
        
        // Заменяем %% на размер
        url = url.replace('%%', size || '200x200');
        
        // Возвращаем полный URL
        var finalUrl = 'https://' + url;
        debug('🖼️ Финальный URL изображения: ' + finalUrl);
        return finalUrl;
    },

    getStreamUrl: function(trackId, cb, err) {
        var self = this;
        debug('Получение ссылки (320kbps)...'); 
        
        // Step 1: Get downloadInfoUrl
        this.req('https://api.music.yandex.net/tracks/' + trackId + '/download-info', function(res) {
            if(!res.result || !res.result[0] || !res.result[0].downloadInfoUrl) {
                return err();
            }
            
            var downloadInfoUrl = res.result[0].downloadInfoUrl;
            
            // Step 2: Get XML with parameters
            self.req(downloadInfoUrl, function(xmlText) {
                try {
                    var host, path, ts, s;
                    
                    // Parse XML or JSON response
                    if(typeof xmlText === 'object') {
                        host = xmlText.host; 
                        path = xmlText.path; 
                        ts = xmlText.ts; 
                        s = xmlText.s;
                    } else {
                        try {
                            var json = JSON.parse(xmlText);
                            host = json.host; 
                            path = json.path; 
                            ts = json.ts; 
                            s = json.s;
                        } catch(e) {
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(xmlText, "text/xml");
                            host = xmlDoc.getElementsByTagName("host")[0].childNodes[0].nodeValue;
                            path = xmlDoc.getElementsByTagName("path")[0].childNodes[0].nodeValue;
                            ts = xmlDoc.getElementsByTagName("ts")[0].childNodes[0].nodeValue;
                            s = xmlDoc.getElementsByTagName("s")[0].childNodes[0].nodeValue;
                        }
                    }

                    if(!host || !path || !ts || !s) {
                        return err();
                    }

                    // Step 3: Create signature using salt from settings
                    var pathForSign = (path.charAt(0) === '/') ? path.substring(1) : path;
                    var salt = self.getSalt();
                    if (!salt) {
                        debug('Ошибка: не задан Salt в настройках (ym_salt). Воспроизведение может не работать.', true);
                        return err();
                    }
                    var signString = salt + pathForSign + s;
                    var sign = MD5(signString);

                    // Step 4: Build final URL
                    // https://${HOST}/get-mp3/${SIGN}/${TS}${PATH_VAL}
                    var mp3Url = 'https://' + host + '/get-mp3/' + sign + '/' + ts + path;
                    
                    debug('✅ Ссылка получена (320kbps)');
                    
                    cb(mp3Url);
                    
                } catch(e) { 
                    err(); 
                }
            }, err, true);
        }, err);
    },
    





    

    

    

    

    

    

    

    


    toggleLike: function(trackId, isLike, cb) {
        if(!window.ym_user_id) return;
        var action = isLike ? 'add-multiple' : 'remove';
        var url = 'https://api.music.yandex.net/users/' + window.ym_user_id + '/likes/tracks/' + action;
        var data = 'track-ids=' + trackId;
        this.req(url, function(res) {
            console.log('[YM] Like ' + action + ' success');
            if(cb) cb(true);
        }, function() {
            console.log('[YM] Like failed');
            if(cb) cb(false);
        }, false, data);
    },

    search: function(query, cb) {
        console.log('🔍 YM_API.search вызван с запросом: "' + query + '"');
        
        // Увеличиваем количество результатов и добавляем параметры для лучшего поиска
        var url = 'https://api.music.yandex.net/search?text=' + encodeURIComponent(query) + '&type=all&page=0&page-size=50&nocorrect=false';
        this.req(url, function(res) {
            var results = [];
            
            // 1. Добавляем Артистов (сначала исполнители)
            if(res.result && res.result.artists && res.result.artists.results) {
                res.result.artists.results.forEach(function(a){
                    a.type = 'artist';
                    results.push(a);
                });
            }
            
            // 2. Добавляем Треки
            if(res.result && res.result.tracks && res.result.tracks.results) {
                res.result.tracks.results.forEach(function(t){
                    t.type = 'track';
                    results.push(t);
                });
            }

            // 3. Добавляем Альбомы
            if(res.result && res.result.albums && res.result.albums.results) {
                res.result.albums.results.forEach(function(a){
                    a.type = 'album';
                    results.push(a);
                });
            }

            debug('🔍 Поиск "' + query + '" вернул: ' + results.length + ' результатов');
            cb(results);
        }, function() { 
            debug('❌ Ошибка поиска: ' + query);
            cb([]); 
        });
    },

    // Получить треки альбома
    getAlbumTracks: function(albumId, cb) {
        var url = 'https://api.music.yandex.net/albums/' + albumId + '/with-tracks';
        this.req(url, function(res) {
            if(res.result && res.result.volumes && res.result.volumes[0]) {
                cb(res.result.volumes[0]);
            } else {
                cb([]);
            }
        }, function() { cb([]); });
    },

    // Получить альбомы артиста
    getArtistAlbums: function(artistId, cb) {
        var url = 'https://api.music.yandex.net/artists/' + artistId + '/direct-albums?sort-by=year';
        this.req(url, function(res) {
            if(res.result && res.result.albums) {
                // Сортируем альбомы по году (новые сначала)
                var albums = res.result.albums.sort(function(a, b) {
                    var yearA = a.year || (a.releaseDate ? new Date(a.releaseDate).getFullYear() : 0);
                    var yearB = b.year || (b.releaseDate ? new Date(b.releaseDate).getFullYear() : 0);
                    return yearB - yearA; // Новые сначала
                });
                cb(albums);
            } else {
                cb([]);
            }
        }, function() { cb([]); });
    },

    // Получить плейлисты жанра через поиск (по методу пользователя)
    getGenrePlaylists: function(genre, cb) {
        var self = this;
        var allPlaylists = [];
        var pagesLoaded = 0;
        var totalPages = 3; // Загружаем страницы 0, 1, 2
        var hasError = false;
        
        debug('🎭 Загружаем плейлисты жанра: ' + genre);
        
        // Таймаут для предотвращения зависания
        var timeout = setTimeout(function() {
            if (pagesLoaded < totalPages) {
                debug('⏰ Таймаут загрузки жанра, возвращаем что есть: ' + allPlaylists.length + ' плейлистов');
                cb(allPlaylists);
            }
        }, 15000); // 15 секунд таймаут
        
        // Функция для загрузки одной страницы
        var loadPage = function(page) {
            var searchUrl = 'https://api.music.yandex.net/search?text=' + encodeURIComponent(genre) + '&type=playlist&page=' + page;
            debug('🔍 Загружаем страницу ' + page + ': ' + searchUrl);
            
            self.req(searchUrl, function(res) {
                pagesLoaded++;
                
                if (res.result && res.result.playlists && res.result.playlists.results) {
                    var playlists = res.result.playlists.results;
                    debug('📋 Страница ' + page + ': найдено ' + playlists.length + ' плейлистов');
                    
                    // Фильтруем только реальные плейлисты
                    playlists.forEach(function(playlist) {
                        if (playlist.type === "playlist" || playlist.kind) {
                            // Нормализуем данные плейлиста
                            var normalizedPlaylist = {
                                id: playlist.uid + ':' + playlist.kind, // Используем uid:kind формат
                                uid: playlist.uid,
                                kind: playlist.kind,
                                title: playlist.title,
                                name: playlist.title,
                                type: 'playlist',
                                trackCount: playlist.trackCount,
                                owner: playlist.owner,
                                coverUri: playlist.cover ? playlist.cover.uri : null
                            };
                            
                            allPlaylists.push(normalizedPlaylist);
                            debug('✅ Добавлен плейлист: ' + playlist.title + ' (' + playlist.uid + ':' + playlist.kind + ')');
                        }
                    });
                } else {
                    debug('⚠️ Страница ' + page + ': плейлисты не найдены');
                }
                
                // Проверяем, загружены ли все страницы
                if (pagesLoaded >= totalPages) {
                    clearTimeout(timeout);
                    debug('🎉 Загрузка завершена. Всего плейлистов: ' + allPlaylists.length);
                    cb(allPlaylists);
                }
            }, function(error) {
                pagesLoaded++;
                hasError = true;
                debug('❌ Ошибка загрузки страницы ' + page + ': ' + JSON.stringify(error));
                
                // Проверяем, загружены ли все страницы (включая ошибки)
                if (pagesLoaded >= totalPages) {
                    clearTimeout(timeout);
                    if (allPlaylists.length > 0) {
                        debug('🎉 Загрузка завершена с ошибками. Всего плейлистов: ' + allPlaylists.length);
                        cb(allPlaylists);
                    } else {
                        debug('❌ Все страницы завершились с ошибками');
                        cb([]);
                    }
                }
            });
        };
        
        // Загружаем все страницы параллельно
        for (var page = 0; page < totalPages; page++) {
            loadPage(page);
        }
    },

    // Получить исполнителей жанра через поиск (по методу пользователя)
    getGenreArtists: function(genre, cb) {
        var self = this;
        var allArtists = [];
        var pagesLoaded = 0;
        var totalPages = 3; // Загружаем страницы 0, 1, 2
        
        debug('🎭 Загружаем исполнителей жанра: ' + genre);
        
        // Таймаут для предотвращения зависания
        var timeout = setTimeout(function() {
            if (pagesLoaded < totalPages) {
                debug('⏰ Таймаут загрузки исполнителей, возвращаем что есть: ' + allArtists.length);
                cb(allArtists);
            }
        }, 15000);
        
        // Функция для загрузки одной страницы
        var loadPage = function(page) {
            var searchUrl = 'https://api.music.yandex.net/search?text=' + encodeURIComponent(genre) + '&type=artist&page=' + page;
            debug('🔍 Загружаем страницу исполнителей ' + page + ': ' + searchUrl);
            
            self.req(searchUrl, function(res) {
                pagesLoaded++;
                
                if (res.result && res.result.artists && res.result.artists.results) {
                    var artists = res.result.artists.results;
                    debug('👨‍🎤 Страница ' + page + ': найдено ' + artists.length + ' исполнителей');
                    
                    // Добавляем всех исполнителей
                    artists.forEach(function(artist) {
                        artist.type = 'artist';
                        allArtists.push(artist);
                        debug('✅ Добавлен исполнитель: ' + artist.name);
                    });
                } else {
                    debug('⚠️ Страница ' + page + ': исполнители не найдены');
                }
                
                // Проверяем, загружены ли все страницы
                if (pagesLoaded >= totalPages) {
                    clearTimeout(timeout);
                    debug('🎉 Загрузка исполнителей завершена. Всего: ' + allArtists.length);
                    cb(allArtists);
                }
            }, function(error) {
                pagesLoaded++;
                debug('❌ Ошибка загрузки страницы исполнителей ' + page + ': ' + JSON.stringify(error));
                
                if (pagesLoaded >= totalPages) {
                    clearTimeout(timeout);
                    debug('🎉 Загрузка исполнителей завершена с ошибками. Всего: ' + allArtists.length);
                    cb(allArtists);
                }
            });
        };
        
        // Загружаем все страницы параллельно
        for (var page = 0; page < totalPages; page++) {
            loadPage(page);
        }
    },

    // Получить альбомы/подборки жанра через поиск (по методу пользователя)
    getGenreAlbums: function(genre, cb) {
        var self = this;
        var allAlbums = [];
        var pagesLoaded = 0;
        var totalPages = 3; // Загружаем страницы 0, 1, 2
        
        debug('🎭 Загружаем альбомы жанра: ' + genre);
        
        // Таймаут для предотвращения зависания
        var timeout = setTimeout(function() {
            if (pagesLoaded < totalPages) {
                debug('⏰ Таймаут загрузки альбомов, возвращаем что есть: ' + allAlbums.length);
                cb(allAlbums);
            }
        }, 15000);
        
        // Функция для загрузки одной страницы
        var loadPage = function(page) {
            var searchUrl = 'https://api.music.yandex.net/search?text=' + encodeURIComponent(genre) + '&type=album&page=' + page;
            debug('🔍 Загружаем страницу альбомов ' + page + ': ' + searchUrl);
            
            self.req(searchUrl, function(res) {
                pagesLoaded++;
                
                if (res.result && res.result.albums && res.result.albums.results) {
                    var albums = res.result.albums.results;
                    debug('💿 Страница ' + page + ': найдено ' + albums.length + ' альбомов');
                    
                    // Добавляем все альбомы
                    albums.forEach(function(album) {
                        album.type = 'album';
                        allAlbums.push(album);
                        debug('✅ Добавлен альбом: ' + (album.title || album.name));
                    });
                } else {
                    debug('⚠️ Страница ' + page + ': альбомы не найдены');
                }
                
                // Проверяем, загружены ли все страницы
                if (pagesLoaded >= totalPages) {
                    clearTimeout(timeout);
                    debug('🎉 Загрузка альбомов завершена. Всего: ' + allAlbums.length);
                    cb(allAlbums);
                }
            }, function(error) {
                pagesLoaded++;
                debug('❌ Ошибка загрузки страницы альбомов ' + page + ': ' + JSON.stringify(error));
                
                if (pagesLoaded >= totalPages) {
                    clearTimeout(timeout);
                    debug('🎉 Загрузка альбомов завершена с ошибками. Всего: ' + allAlbums.length);
                    cb(allAlbums);
                }
            });
        };
        
        // Загружаем все страницы параллельно
        for (var page = 0; page < totalPages; page++) {
            loadPage(page);
        }
    },

    // Функции для работы с cookies
    getWebHeaders: function() {
        // Собираем cookies из отдельных полей настроек
        var sessionId = Lampa.Storage.get('ym_session_id', '');
        var sessionId2 = Lampa.Storage.get('ym_sessionid2', '');
        var yandexUid = Lampa.Storage.get('ym_yandexuid', '');
        var yandexLogin = Lampa.Storage.get('ym_yandex_login', '');
        var lToken = Lampa.Storage.get('ym_l_token', '');
        
        // Проверяем наличие обязательных параметров
        if (!sessionId && !sessionId2) {
            debug('❌ Нет Session_id или sessionid2');
            return null;
        }
        
        if (!yandexUid || !yandexLogin || !lToken) {
            debug('❌ Отсутствуют обязательные параметры: yandexuid, yandex_login или L токен');
            return null;
        }
        
        // Собираем cookies строку
        var cookieParts = [];
        
        if (sessionId) cookieParts.push('Session_id=' + sessionId);
        if (sessionId2) cookieParts.push('sessionid2=' + sessionId2);
        if (yandexUid) cookieParts.push('yandexuid=' + yandexUid);
        if (yandexLogin) cookieParts.push('yandex_login=' + yandexLogin);
        if (lToken) cookieParts.push('L=' + lToken);
        
        var cleanCookies = cookieParts.join('; ');
        debug('🍪 Собранные cookies (' + cleanCookies.length + ' символов): ' + cookieParts.length + ' параметров');

        return {
            'Accept': '*/*',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://music.yandex.ru/',
            'Cookie': cleanCookies
        };
    },

    web: function(url, callback, error_callback) {
        var headers = this.getWebHeaders();
        
        if (!headers) {
            console.warn('[YM] Cookies не заданы');
            if (error_callback) error_callback('No cookies');
            return;
        }

        console.log('[YM] Отправляем запрос:', url);
        console.log('[YM] Заголовки:', headers);

        var net = new (Lampa.Request || Lampa.Reguest)();
        
        net.native(url, function(response) {
            console.log('[YM] Получен ответ, тип:', typeof response);
            console.log('[YM] Ответ (первые 500 символов):', response ? response.toString().substring(0, 500) : 'null/empty');
            
            // Проверяем, что ответ не пустой
            if (!response || response === '') {
                console.warn('[YM] Пустой ответ от сервера');
                if (callback) callback(null);
                return;
            }
            
            // Для HTML страниц возвращаем как есть (строку)
            if (typeof response === 'string' && response.trim().startsWith('<!')) {
                console.log('[YM] Получена HTML страница, возвращаем как строку');
                if (callback) callback(response);
                return;
            }
            
            // Для JSON пытаемся парсить
            try {
                var data = typeof response === 'string' ? JSON.parse(response) : response;
                if (callback) callback(data);
            } catch (e) {
                console.error('[YM] JSON parse error:', e);
                console.log('[YM] Возвращаем raw response как строку');
                
                // Возвращаем как строку, не как ошибку
                if (callback) callback(response);
            }
        }, function(err) {
            console.error('[YM] Web request failed:', err);
            console.log('[YM] Error type:', typeof err);
            console.log('[YM] Error details:', err);
            
            var errorMsg = 'Request failed';
            if (err && err.status) {
                errorMsg = 'HTTP ' + err.status;
            } else if (err && err.message) {
                errorMsg = err.message;
            } else if (typeof err === 'string') {
                errorMsg = err;
            }
            
            if (error_callback) error_callback(errorMsg);
        }, null, {
            headers: headers,
            dataType: 'text',
            method: 'GET',
            withCredentials: true
        });
    }
};

// 3. CANVAS ВИЗУАЛИЗАТОР
var YM_Visualizer = {
    canvas: null, ctx: null, animation: null, type: 'bars', color: '#fff',
    
    init: function(container, type, color) {
        this.stop(); 
        container.empty();
        if (type === 'none') return;
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 200; this.canvas.height = 100;
        this.canvas.style.width = '100%'; this.canvas.style.height = '100%';
        container.append(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.type = type; this.color = color;
        this.loop();
    },
    
    stop: function() { 
        if (this.animation) cancelAnimationFrame(this.animation); 
        this.ctx = null; 
    },
    
    loop: function() {
        if (!this.ctx) return;
        var _this = this;
        this.animation = requestAnimationFrame(function() { _this.loop(); });
        
        var w = this.canvas.width, h = this.canvas.height, ctx = this.ctx, time = Date.now();
        ctx.clearRect(0, 0, w, h); 
        ctx.fillStyle = this.color;
        
        if (this.type === 'bars') {
            var bars = 10, gap = 4, barW = (w - (gap * (bars - 1))) / bars;
            for (var i = 0; i < bars; i++) {
                var height = Math.abs(Math.sin((time + i * 500) * ((i % 2 === 0) ? 0.008 : 0.012))) * h * 0.8 + (h * 0.1) + Math.random() * 5;
                ctx.fillRect(i * (barW + gap), h - height, barW, height);
            }
        } else if (this.type === 'wave') {
            ctx.beginPath(); ctx.moveTo(0, h / 2);
            for (var x = 0; x < w; x++) { 
                ctx.lineTo(x, Math.sin(x * 0.05 + time * 0.005) * (h * 0.3) + h / 2); 
            }
            ctx.strokeStyle = this.color; ctx.lineWidth = 3; ctx.stroke();
        } else if (this.type === 'particles') {
            for (var j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.arc((Math.sin(time * 0.002 + j) + 1) / 2 * w, (Math.cos(time * 0.003 + j*2) + 1) / 2 * h, Math.abs(Math.sin(time * 0.005 + j)) * 5 + 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};

// 4. ОВЕРЛЕЙ
var YM_Overlay = {
    el: null, interval: null,
    
    init: function() {
        $('body').append('<div id="ym-overlay-info" style="display:none;"><div class="ym-ov-card"><div class="ym-ov-img-wrap"><img class="ym-ov-img" src="" /></div><div class="ym-ov-text"><div class="ym-ov-station">Track</div><div class="ym-ov-track">Artist</div><div class="ym-ov-time">0:00 / 0:00 | MP3 320kbps</div><div class="ym-ov-progress-bar"><div class="ym-ov-progress-fill"></div></div></div><div class="ym-ov-vis-box"></div></div></div>');
        this.el = $('#ym-overlay-info');
        this.startLoop();
    },
    
    startLoop: function() { 
        var _this = this; 
        this.interval = setInterval(function() { _this.check(); }, 1000); 
    },
    
    check: function() {
        if (Lampa.Storage.get('ym_show_on_saver', 'true') === 'false') { 
            this.hide(); 
            return; 
        }
        
        var player = window.ym_player;
        if (!player || !player.isPlaying()) { 
            this.hide(); 
            return; 
        }
        
        if ($('body').hasClass('screensaver-active') || $('.screensaver').length > 0 || $('.screensaver-box').length > 0) {
            this.update(player.getCurrentData());
            this.show();
        } else { 
            this.hide(); 
        }
    },
    
    update: function(data) {
        if (!data) return;
        var color = '#f1c40f';
        this.el.find('.ym-ov-img').attr('src', YM_API.getImg(data, '600x600'));
        
        // Объединяем информацию об альбоме с названием трека
        var trackTitle = data.title;
        if (data.albums && data.albums.length > 0) {
            var album = data.albums[0];
            var albumTitle = album.title || album.name || '';
            var year = '';
            if (album.year) {
                year = album.year;
            } else if (album.releaseDate) {
                year = new Date(album.releaseDate).getFullYear();
            }
            
            var albumInfo = '';
            if (year && albumTitle) {
                albumInfo = year + ' • ' + albumTitle;
            } else if (albumTitle) {
                albumInfo = albumTitle;
            } else if (year) {
                albumInfo = year;
            }
            
            if (albumInfo) {
                trackTitle = albumInfo + ' - ' + data.title;
            }
        }
        
        this.el.find('.ym-ov-station').text(trackTitle).css('color', color);
        var artists = data.artists ? data.artists.map(function(a){return a.name}).join(', ') : 'Unknown';
        this.el.find('.ym-ov-track').text(artists);
        
        // Обновляем время и прогресс
        var player = window.ym_player;
        if (player && player.getAudio) {
            var audio = player.getAudio();
            if (audio && !isNaN(audio.duration)) {
                // Обновляем время
                var currentMinutes = Math.floor(audio.currentTime / 60);
                var currentSeconds = Math.floor(audio.currentTime % 60);
                var totalMinutes = Math.floor(audio.duration / 60);
                var totalSeconds = Math.floor(audio.duration % 60);
                
                var currentTime = currentMinutes + ':' + currentSeconds.toString().padStart(2, '0');
                var totalTime = totalMinutes + ':' + totalSeconds.toString().padStart(2, '0');
                
                // Вычисляем оставшееся время
                var remainingSeconds = Math.floor(audio.duration - audio.currentTime);
                var remainingMinutes = Math.floor(remainingSeconds / 60);
                remainingSeconds = remainingSeconds % 60;
                var remainingTime = '-' + remainingMinutes + ':' + remainingSeconds.toString().padStart(2, '0');
                
                var timeWithRemaining = currentTime + ' / ' + totalTime + ' | ' + remainingTime;
                
                this.el.find('.ym-ov-time').text(timeWithRemaining);
                
                // Обновляем прогрессбар
                var percent = (audio.currentTime / audio.duration) * 100;
                this.el.find('.ym-ov-progress-fill').css('width', percent + '%');
            } else {
                // Если нет данных о времени, показываем 0:00
                this.el.find('.ym-ov-time').text('0:00 / 0:00 | -0:00');
                this.el.find('.ym-ov-progress-fill').css('width', '0%');
            }
        }
        
        this.el.removeClass('ym-pos-bl ym-pos-br ym-pos-tl ym-pos-tr').addClass('ym-pos-' + Lampa.Storage.get('ym_saver_pos', 'bl'));
        this.el.find('.ym-ov-card').css('opacity', Lampa.Storage.get('ym_saver_opacity', '1'));
        
        var type = Lampa.Storage.get('ym_vis_type', 'bars');
        var visContainer = this.el.find('.ym-ov-vis-box');
        if (visContainer.data('type') !== type || !YM_Visualizer.ctx) {
            visContainer.data('type', type);
            YM_Visualizer.init(visContainer, type, color);
        } else { 
            YM_Visualizer.color = color; 
        }
    },
    
    show: function() { 
        if (!this.el.is(':visible')) this.el.fadeIn(500); 
    },
    
    hide: function() { 
        if (this.el.is(':visible')) { 
            this.el.fadeOut(300); 
            YM_Visualizer.stop(); 
        } 
    }
};

// 5. ПЛЕЕР
function YM_Player() {
    var html = Lampa.Template.get('ym_player_final', {});
    var audio = new Audio();
    var is_playing = false, current_data = null, manual_stop = false;
    var is_created = false;
    
    // Проверка доступных API для визуализации
    function checkAudioAPIs() {
        console.log('=== Проверка Audio APIs ===');
        console.log('AudioContext:', !!(window.AudioContext || window.webkitAudioContext));
        console.log('MediaRecorder:', !!window.MediaRecorder);
        console.log('getUserMedia:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
        console.log('getDisplayMedia:', !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia));
        console.log('captureStream:', !!audio.captureStream);
        console.log('Lampa.Platform:', !!Lampa.Platform);
        console.log('Cordova:', !!window.cordova);
        console.log('WebKit:', !!window.webkit);
        console.log('Android:', navigator.userAgent.includes('Android'));
    }
    
    // Вызываем проверку при создании плеера
    checkAudioAPIs();
    
    // Состояния новых кнопок
    var shuffle_mode = Lampa.Storage.get('ym_shuffle_mode', 'off');
    var repeat_mode = Lampa.Storage.get('ym_repeat_mode', 'off'); // off, all, one

    this.isPlaying = function() { return is_playing; };
    this.getCurrentData = function() { return current_data; };
    this.getAudio = function() { return audio; };

    audio.addEventListener("timeupdate", function() {
        if (!isNaN(audio.duration)) {
            var percent = (audio.currentTime / audio.duration) * 100;
            html.find('.ym-progress-fill').css('width', percent + '%');
            
            // Обновляем время
            var currentMinutes = Math.floor(audio.currentTime / 60);
            var currentSeconds = Math.floor(audio.currentTime % 60);
            var totalMinutes = Math.floor(audio.duration / 60);
            var totalSeconds = Math.floor(audio.duration % 60);
            
            var currentTime = currentMinutes + ':' + currentSeconds.toString().padStart(2, '0');
            var totalTime = totalMinutes + ':' + totalSeconds.toString().padStart(2, '0');
            
            // Вычисляем оставшееся время
            var remainingSeconds = Math.floor(audio.duration - audio.currentTime);
            var remainingMinutes = Math.floor(remainingSeconds / 60);
            remainingSeconds = remainingSeconds % 60;
            var remainingTime = '-' + remainingMinutes + ':' + remainingSeconds.toString().padStart(2, '0');
            
            var timeWithRemaining = currentTime + ' / ' + totalTime + ' | ' + remainingTime;
            
            html.find('.ym-pl-time').text(timeWithRemaining);
        }
    });

    audio.addEventListener("playing", function() {
        is_playing = true;
        html.removeClass('stop').removeClass('loading');
        
        // Отключаем моргание времени при воспроизведении
        html.find('.ym-pl-time').removeClass('paused');
        
        // Убираем прокрутку и проверяем, нужна ли она
        html.find('.ym-pl-track-text').removeClass('scrolling');
        html.find('.ym-pl-title-text').removeClass('scrolling');
        
        setTimeout(function() { 
            // Проверяем заголовок
            var titleContainer = html.find('.ym-pl-title')[0];
            var titleText = html.find('.ym-pl-title-text')[0];
            if (titleContainer && titleText && titleText.scrollWidth > titleContainer.clientWidth) {
                html.find('.ym-pl-title-text').addClass('scrolling');
            }
            
            // Проверяем исполнителя
            var trackContainer = html.find('.ym-pl-track')[0];
            var trackText = html.find('.ym-pl-track-text')[0];
            if (trackContainer && trackText && trackText.scrollWidth > trackContainer.clientWidth) {
                html.find('.ym-pl-track-text').addClass('scrolling');
            }
        }, 100);
    });

    audio.addEventListener("pause", function() { 
        is_playing = false; 
        html.addClass('stop'); 
        html.find('.ym-pl-track-text').removeClass('scrolling');
        html.find('.ym-pl-title-text').removeClass('scrolling');
        
        // Включаем моргание времени при паузе
        html.find('.ym-pl-time').addClass('paused');
    });

    audio.addEventListener("ended", function() { 
        if(!manual_stop) {
            // Обновляем repeat_mode из Storage перед проверкой
            repeat_mode = Lampa.Storage.get('ym_repeat_mode', 'off');
            
            // Приоритет повтора над перемешиванием
            if (repeat_mode === 'one' && current_data) {
                debug('🔁 Повтор трека по окончанию');
                window.ym_player.play(current_data);
            } else {
                window.ym_player.playNext();
            }
        }
    });

    audio.addEventListener("error", function() { 
        debug('Ошибка воспроизведения Audio', true); 
        is_playing = false; 
        html.addClass('stop');
    });

    this.create = function () {
        if (is_created) return; // Создаем только один раз
        
        $('.ym-pl-widget').remove();
        $('.head__actions .open--search').before(html);
        
        // Обновляем контроллер header чтобы он увидел новые элементы
        setTimeout(function() {
            if (Lampa.Controller.enabled().name === 'head') {
                Lampa.Controller.collectionSet($('.head'));
            }
        }, 100);
        
        // Устанавливаем начальное состояние плеера
        html.find('.ym-pl-title-text span').text('Яндекс Музыка');
        html.find('.ym-pl-track-text span').text('');
        html.find('.ym-pl-track-text').addClass('scrolling'); // Добавляем анимацию бегущей строки
        html.find('.ym-pl-time').text('Готов к воспроизведению');
        
        // Устанавливаем стандартную иконку Lampa для сломанных изображений
        html.find('.ym-pl-icon').attr('src', './img/img_broken.svg').hide();
        html.find('.ym-pl-music-icon').show();
        
        html.addClass('hide'); // Плеер скрыт до начала воспроизведения
        html.addClass('stop'); // Но в состоянии остановки
        
        this.html = html;
        is_created = true;
        var self = this;

        // Обновляем состояния кнопок
        this.updateButtonStates();

        // Восстанавливаем режим плеера
        var savedMode = Lampa.Storage.get('ym_player_mode', 'full');
        if (savedMode === 'mini') {
            html.addClass('mini-mode');
        }

        // Controls
        html.find('.ym-pl-prev').on('hover:enter', function() { self.playPrev(); });
        html.find('.ym-pl-next').on('hover:enter', function() { self.playNext(); });
        html.find('.ym-pl-stop').on('hover:enter', function() { self.stopAndClose(); });
        
        // Новые кнопки управления
        html.find('.ym-pl-shuffle').on('hover:enter', function() { self.toggleShuffle(); });
        html.find('.ym-pl-repeat').on('hover:enter', function() { self.toggleRepeat(); });
        html.find('.ym-pl-rewind').on('hover:enter', function() { self.rewind(); });
        html.find('.ym-pl-forward').on('hover:enter', function() { self.forward(); });
        
        // Переключение режимов плеера
        html.find('.ym-pl-back').on('hover:enter', function() { self.switchToMiniMode(); });
        html.find('.ym-pl-expand').on('hover:enter', function() { self.switchToFullMode(); });
        
        // Прогресс-бар (перемотка по клику)
        html.find('.ym-progress-bar').on('hover:enter', function() { self.seekToPosition(); });
        
        // Добавляем навигацию для кнопки закрытия
        html.find('.ym-pl-stop').on('hover:right', function() {
            // Переходим к кнопке поиска в шапке
            var searchBtn = $('.head__actions .open--search')[0];
            if (searchBtn) {
                Lampa.Controller.toggle('head');
                setTimeout(function() {
                    Lampa.Controller.collectionFocus(searchBtn);
                }, 50);
            }
        });
        html.find('.ym-pl-pp').on('hover:enter', function() { 
            if (is_playing) {
                audio.pause(); 
            } else {
                // Если нет текущего трека, запускаем первый из списка
                if (!current_data && window.ym_tracks_list && window.ym_tracks_list.length > 0) {
                    self.play(window.ym_tracks_list[0]);
                } else if (current_data) {
                    audio.play();
                }
            }
        });
        
        // Clickable cover - opens current album
        html.find('.ym-pl-icon-wrap').on('hover:enter', function() {
            if (!current_data) return;
            
            debug('Клик по обложке. Данные трека:', current_data);
            
            // Проверяем, есть ли информация об альбоме
            if (current_data.albums && current_data.albums.length > 0) {
                var album = current_data.albums[0];
                var albumTitle = album.title || album.name || 'Альбом';
                
                // Получаем исполнителя
                var artistName = '';
                if (current_data.artists && current_data.artists.length > 0) {
                    artistName = current_data.artists[0].name;
                }
                
                var fullTitle = artistName ? artistName + ' - ' + albumTitle : albumTitle;
                
                debug('Переход к альбому: ' + fullTitle + ' (ID: ' + album.id + ')');
                
                Lampa.Activity.push({
                    title: fullTitle,
                    component: 'yandex_music',
                    album_id: album.id,
                    page: 1
                });
            } else {
                // Альтернативный способ - попробуем получить информацию об альбоме через API
                debug('Альбом не найден в данных трека, пробуем получить через API');
                
                if (current_data.id) {
                    YM_API.req('https://api.music.yandex.net/tracks/' + current_data.id, function(res) {
                        if (res.result && res.result.length > 0) {
                            var track = res.result[0];
                            if (track.albums && track.albums.length > 0) {
                                var album = track.albums[0];
                                var albumTitle = album.title || album.name || 'Альбом';
                                
                                // Получаем исполнителя из трека
                                var artistName = '';
                                if (track.artists && track.artists.length > 0) {
                                    artistName = track.artists[0].name;
                                }
                                
                                var fullTitle = artistName ? artistName + ' - ' + albumTitle : albumTitle;
                                
                                debug('Альбом найден через API: ' + fullTitle);
                                
                                Lampa.Activity.push({
                                    title: fullTitle,
                                    component: 'yandex_music',
                                    album_id: album.id,
                                    page: 1
                                });
                            } else {
                                debug('Информация об альбоме недоступна');
                            }
                        } else {
                            debug('Не удалось получить информацию о треке');
                        }
                    }, function() {
                        debug('Ошибка получения информации об альбоме');
                    });
                } else {
                    debug('Информация об альбоме недоступна');
                }
            }
        });

        // Navigation Back to Content (Down)
        html.find('.selector').on('hover:down', function() {
            Lampa.Controller.toggle('content');
        });

        // Like
        html.find('.ym-pl-fav').on('hover:enter', function() {
            if(!current_data) return;
            var newLikeState = !current_data.is_liked;
            current_data.is_liked = newLikeState;
            self.updateFavState();
            YM_API.toggleLike(current_data.id, newLikeState, function(success) {
                if(success) debug(newLikeState ? 'Добавлено в Мне нравится' : 'Удалено из Мне нравится');
                else { 
                    current_data.is_liked = !newLikeState; 
                    self.updateFavState(); 
                    debug('Ошибка изменения лайка'); 
                }
            });
        });
    };

    this.updateFavState = function() {
        if(!current_data) return;
        var isFav = current_data.is_liked;
        html.find('.ym-pl-fav').toggleClass('active', isFav);
        // Иконка остается одинаковой, меняется только стиль
    };

    // Новые методы для расширенного плеера
    this.toggleShuffle = function() {
        shuffle_mode = shuffle_mode === 'off' ? 'on' : 'off';
        Lampa.Storage.set('ym_shuffle_mode', shuffle_mode);
        html.find('.ym-pl-shuffle').toggleClass('active', shuffle_mode === 'on');
        debug('🔀 Перемешивание: ' + (shuffle_mode === 'on' ? 'включено' : 'выключено'));
    };

    this.toggleRepeat = function() {
        if (repeat_mode === 'off') {
            repeat_mode = 'all';
        } else if (repeat_mode === 'all') {
            repeat_mode = 'one';
        } else {
            repeat_mode = 'off';
        }
        
        Lampa.Storage.set('ym_repeat_mode', repeat_mode);
        
        var repeatBtn = html.find('.ym-pl-repeat');
        repeatBtn.removeClass('active repeat-one');
        
        if (repeat_mode === 'all') {
            repeatBtn.addClass('active');
        } else if (repeat_mode === 'one') {
            repeatBtn.addClass('active repeat-one');
        }
        
        debug('🔁 Повтор: ' + (repeat_mode === 'off' ? 'выключен' : repeat_mode === 'all' ? 'плейлист' : 'трек'));
    };

    this.rewind = function() {
        if (audio && !isNaN(audio.duration)) {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
            debug('⏪ Перемотка назад на 10 секунд');
        }
    };

    this.forward = function() {
        if (audio && !isNaN(audio.duration)) {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
            debug('⏩ Перемотка вперед на 10 секунд');
        }
    };

    this.seekToPosition = function() {
        // Простая перемотка на середину трека для демонстрации
        if (audio && !isNaN(audio.duration)) {
            audio.currentTime = audio.duration * 0.5;
            debug('🎯 Перемотка на середину трека');
        }
    };

    this.updateButtonStates = function() {
        // Обновляем состояния кнопок при создании плеера
        html.find('.ym-pl-shuffle').toggleClass('active', shuffle_mode === 'on');
        
        var repeatBtn = html.find('.ym-pl-repeat');
        repeatBtn.removeClass('active repeat-one');
        if (repeat_mode === 'all') {
            repeatBtn.addClass('active');
        } else if (repeat_mode === 'one') {
            repeatBtn.addClass('active repeat-one');
        }
    };

    // Методы переключения режимов плеера
    this.switchToMiniMode = function() {
        html.addClass('mini-mode');
        Lampa.Storage.set('ym_player_mode', 'mini');
        debug('📱 Переключение в мини-режим');
    };

    this.switchToFullMode = function() {
        html.removeClass('mini-mode');
        Lampa.Storage.set('ym_player_mode', 'full');
        debug('🖥️ Переключение в полный режим');
    };

    this.showTrackNotification = function(data) {
        if (!data) return;
        
        // Извлекаем данные трека
        var trackTitle = data.title || 'Неизвестный трек';
        var artists = data.artists ? data.artists.map(function(a){return a.name}).join(', ') : 'Неизвестный исполнитель';
        
        // Извлекаем номер трека из displayTitle если есть (формат "01 - Название")
        var trackNumber = '';
        if (data.displayTitle) {
            var match = data.displayTitle.match(/^(\d{2} - )/);
            if (match) {
                trackNumber = match[1]; // "03 - "
            }
        }
        
        // Извлекаем данные альбома
        var albumTitle = '';
        var year = '';
        if (data.albums && data.albums.length > 0) {
            var album = data.albums[0];
            albumTitle = album.title || album.name || '';
            
            // Извлекаем год
            if (album.year) {
                year = album.year;
            } else if (album.releaseDate) {
                year = new Date(album.releaseDate).getFullYear();
            }
        }
        
        // Формируем сообщение: "🎵 Сейчас играет: [Группа] • [год] • [альбом] [номер трека] - [название трека]"
        var message = '🎵 Сейчас играет: ' + artists;
        
        if (year) {
            message += ' • ' + year;
        }
        
        if (albumTitle) {
            message += ' • ' + albumTitle;
        }
        
        if (trackNumber) {
            message += ' ' + trackNumber + trackTitle;
        } else {
            message += ' - ' + trackTitle;
        }
        
        showStatus(message);
    };

    this.play = function (data) {
        manual_stop = false; 
        
        // Создаем плеер если он еще не создан
        if (!is_created) {
            this.create();
        }
        
        // Показываем плеер при начале воспроизведения
        html.removeClass('hide');
        
        this.stop(false); 
        current_data = data;
        window.ym_active_id = String(data.id);
        window.ym_current_index = window.ym_tracks_list.indexOf(data);

        $('.ym-card').removeClass('active-playing');
        $('.ym-card[data-id="' + window.ym_active_id + '"]').addClass('active-playing');

        var artists = data.artists ? data.artists.map(function(a){return a.name}).join(', ') : 'Unknown';
        html.find('.ym-pl-icon').attr('src', YM_API.getImg(data, '200x200')).show();
        html.find('.ym-pl-music-icon').hide();
        
        // Объединяем информацию об альбоме с названием трека
        var trackTitle = data.title;
        
        // Извлекаем номер трека из displayTitle если есть (формат "01 - Название")
        var trackNumber = '';
        if (data.displayTitle) {
            var match = data.displayTitle.match(/^(\d{2} - )/);
            if (match) {
                trackNumber = match[1]; // "03 - "
            }
        }
        
        if (data.albums && data.albums.length > 0) {
            var album = data.albums[0];
            var albumTitle = album.title || album.name || '';
            var year = '';
            if (album.year) {
                year = album.year;
            } else if (album.releaseDate) {
                year = new Date(album.releaseDate).getFullYear();
            }
            
            var albumInfo = '';
            if (year && albumTitle) {
                albumInfo = year + ' • ' + albumTitle;
            } else if (albumTitle) {
                albumInfo = albumTitle;
            } else if (year) {
                albumInfo = year;
            }
            
            if (albumInfo) {
                trackTitle = albumInfo + ' • ' + trackNumber + data.title;
            } else {
                trackTitle = trackNumber + data.title;
            }
        } else {
            trackTitle = trackNumber + data.title;
        }
        
        html.find('.ym-pl-title-text span').text(trackTitle);
        html.find('.ym-pl-track-text span').text(artists);
        
        // Показываем уведомление в мини-режиме
        if (html.hasClass('mini-mode')) {
            this.showTrackNotification(data);
        }
        
        // Динамически изменяем ширину информационного блока под содержимое
        setTimeout(function() {
            // Измеряем ширину нижней строки (время + исполнитель)
            var trackRow = html.find('.ym-pl-track')[0];
            if (trackRow) {
                // Создаем временный элемент для точного измерения
                var tempDiv = $('<div>').css({
                    'position': 'absolute',
                    'visibility': 'hidden',
                    'white-space': 'nowrap',
                    'font-size': '1.0em',
                    'font-family': 'inherit'
                }).appendTo('body');
                
                var timeText = html.find('.ym-pl-time').text();
                var artistText = html.find('.ym-pl-track-text span').text();
                
                // Берем только первого исполнителя (до запятой)
                var firstArtist = artistText.split(',')[0];
                tempDiv.text(timeText + ' ' + firstArtist);
                
                var textWidth = tempDiv.width();
                tempDiv.remove();
                
                html.find('.ym-pl-info').css({
                    'width': (textWidth + 20) + 'px',
                    'flex': 'none'
                });
                
                // Рассчитываем общую ширину: текст + обложка + кнопки + отступы
                var totalWidth = textWidth + 608; // 54px обложка + 450px кнопки + 50px gap + 10px margin + 44px padding
                html.css('width', totalWidth + 'px');
            }
            
            // Принудительно включаем прокрутку для заголовка
            html.find('.ym-pl-title-text span').css({
                'animation': 'scroll-left 10s linear infinite',
                'display': 'inline-block'
            });
            
            // Проверяем исполнителя
            var trackContainer = html.find('.ym-pl-track')[0];
            var trackText = html.find('.ym-pl-track-text')[0];
            if (trackContainer && trackText && trackText.scrollWidth > trackContainer.clientWidth) {
                html.find('.ym-pl-track-text').addClass('scrolling');
            } else {
                html.find('.ym-pl-track-text').removeClass('scrolling');
            }
        }, 200);
        
        // Инициализируем время без качества трека
        html.find('.ym-pl-time').text('0:00 / 0:00 | -0:00');
        
        html.removeClass('hide').addClass('loading');
        
        this.updateFavState();

        YM_API.getStreamUrl(data.id, function(url) {
            if(!url) { 
                debug('Не удалось получить ссылку', true); 
                return; 
            }
            audio.src = url; 
            audio.load(); 
            var p = audio.play();
            if(p !== undefined) {
                p.catch(function(e) { 
                    if(String(e).indexOf('interrupted') === -1) console.log(e); 
                });
            }
        }, function() {
            debug('Ошибка API Трека', true);
            html.addClass('stop').removeClass('loading');
        });
    };

    this.playNext = function() { 
        manual_stop = false;
        
        // Получаем object из активности в начале функции
        var currentActivity = Lampa.Activity.active();
        var object = currentActivity && currentActivity.activity ? currentActivity.activity.object : null;
        
        // Проверяем режим повтора одного трека
        if (repeat_mode === 'one' && current_data) {
            debug('🔁 Повтор одного трека');
            this.play(current_data);
            return;
        }
        
        var mode = shuffle_mode; // Используем локальную переменную
        var currentCat = Lampa.Storage.get('ym_cat', 'wave'); // Получаем текущую категорию
        
        if (mode === 'on') {
            if (!window.ym_tracks_list.length) return;
            this.play(window.ym_tracks_list[Math.floor(Math.random() * window.ym_tracks_list.length)]);
        } else {
            var n = window.ym_current_index + 1; 
            
            // Автоподгрузка для бесконечной волны ТОЛЬКО для раздела "Моя волна" И НЕ в специальных режимах
            var currentCatCheck = Lampa.Storage.get('ym_cat', 'wave'); // Проверяем категорию каждый раз
            
            // КРИТИЧЕСКАЯ ПРОВЕРКА: автоподгрузка только в волне и НЕ в специальных режимах
            var isInWaveMode = (currentCatCheck === 'wave') && 
                               (!object || (!object.search_query && !object.artist_id && !object.album_id && 
                                           !object.playlist_id && !object.genre_list && !object.genre_name));
            
            if (currentActivity && currentActivity.component === 'yandex_music' && isInWaveMode) {
                var remainingTracks = window.ym_tracks_list.length - n;
                if (remainingTracks <= 2 && !window.ym_is_loading_more) { // Триггер при 2 треках
                    // Получаем ссылку на компонент для вызова loadWave
                    if (window.ym_component_instance && 
                        typeof window.ym_component_instance.loadWave === 'function' &&
                        Lampa.Activity.active().component === 'yandex_music' &&
                        canLoadWave()) {
                        debug('🌊 Автоподгрузка в плеере при малом количестве треков');
                        window.ym_component_instance.loadWave(false);
                    } else {
                        debug('🚫 Автоподгрузка в плеере ЗАБЛОКИРОВАНА');
                    }
                }
            }
            
            // Проверяем конец списка
            if (n >= window.ym_tracks_list.length) {
                if (repeat_mode === 'all') {
                    // Повтор всего плейлиста
                    debug('🔁 Повтор плейлиста с начала');
                    n = 0;
                } else {
                    var currentCatCheck = Lampa.Storage.get('ym_cat', 'wave'); // Проверяем категорию каждый раз
                    
                    // КРИТИЧЕСКАЯ ПРОВЕРКА: дозагрузка только в волне и НЕ в специальных режимах
                    var isInWaveMode = (currentCatCheck === 'wave') && 
                                       (!object || (!object.search_query && !object.artist_id && !object.album_id && 
                                                   !object.playlist_id && !object.genre_list && !object.genre_name));
                    
                    if (isInWaveMode) {
                        // Для волны пытаемся подгрузить еще треки
                        if (!window.ym_is_loading_more && 
                            window.ym_component_instance && 
                            typeof window.ym_component_instance.loadWave === 'function' &&
                            Lampa.Activity.active().component === 'yandex_music' &&
                            canLoadWave()) {
                            debug('🔄 Достигнут конец списка волны, подгружаем новые треки...');
                            window.ym_component_instance.loadWave(false);
                            // Ждем немного и пробуем снова
                            var self = this;
                            setTimeout(function() {
                                if (window.ym_tracks_list.length > n) {
                                    self.play(window.ym_tracks_list[n]);
                                }
                            }, 2000);
                            return;
                        } else {
                            debug('🚫 Дозагрузка в конце списка ЗАБЛОКИРОВАНА');
                            // Если не удалось подгрузить, зацикливаемся
                            n = 0;
                        }
                    } else {
                        // Для других категорий без повтора - останавливаемся
                        n = 0;
                    }
                }
            }
            
            if(window.ym_tracks_list[n]) this.play(window.ym_tracks_list[n]);
        }
    };

    this.playPrev = function() { 
        manual_stop = false; 
        var p = window.ym_current_index - 1; 
        if (p < 0) p = window.ym_tracks_list.length - 1; 
        if(window.ym_tracks_list[p]) this.play(window.ym_tracks_list[p]); 
    };

    this.stop = function (full_reset) {
        if (full_reset) manual_stop = true; 
        is_playing = false;
        audio.pause(); 
        html.addClass('stop').removeClass('loading'); 
        html.find('.ym-pl-track-text').removeClass('scrolling');
        html.find('.ym-pl-title-text').removeClass('scrolling');
    };

    this.stopAndClose = function() { 
        this.stop(true); 
        html.addClass('hide'); 
        window.ym_active_id = null; 
        $('.ym-card').removeClass('active-playing'); 
    };
}

// 🔥 ГЛОБАЛЬНАЯ ФУНКЦИЯ БЛОКИРОВКИ loadWave
function canLoadWave() {
    // Проверка 0: Флаг поиска
    if (window.ym_search_mode) {
        debug('🚫 ГЛОБАЛЬНАЯ БЛОКИРОВКА: search_mode = true');
        return false;
    }
    
    // Проверка 1: Storage
    var currentCategory = Lampa.Storage.get('ym_cat', 'wave');
    if (currentCategory !== 'wave') {
        debug('🚫 ГЛОБАЛЬНАЯ БЛОКИРОВКА: не "Моя волна", текущий: ' + currentCategory);
        return false;
    }
    
    // Проверка 2: Текущая активность
    var currentActivity = Lampa.Activity.active();
    if (currentActivity && currentActivity.activity) {
        var activityObject = currentActivity.activity.object;
        if (activityObject && (activityObject.search_query || activityObject.artist_id || activityObject.album_id || 
                              activityObject.playlist_id || activityObject.genre_list || activityObject.genre_name)) {
            debug('🚫 ГЛОБАЛЬНАЯ БЛОКИРОВКА: активность в специальном режиме');
            return false;
        }
        
        // Проверка 3: Заголовок активности
        if (currentActivity.activity.title) {
            var title = currentActivity.activity.title.toLowerCase();
            if (title.includes('поиск') || title.includes('search') || 
                title.includes('артист') || title.includes('artist') ||
                title.includes('альбом') || title.includes('album') ||
                title.includes('плейлист') || title.includes('playlist') ||
                title.includes('жанр') || title.includes('genre')) {
                debug('🚫 ГЛОБАЛЬНАЯ БЛОКИРОВКА: заголовок активности: ' + currentActivity.activity.title);
                return false;
            }
        }
    }
    
    debug('✅ ГЛОБАЛЬНАЯ ПРОВЕРКА: loadWave РАЗРЕШЕН');
    return true;
}

// 6. КОМПОНЕНТ
function YM_Component(object) {
    console.log('🏗️ YM_Component создан с object:', JSON.stringify(object));
    var self = this;
    
    // Сохраняем ссылку на компонент для доступа из плеера
    window.ym_component_instance = self;
    
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var html = $('<div class="ym-container"></div>');
    var body = $('<div class="ym-grid"></div>');
    var selector = $('<div class="ym-net-row"></div>');
    var secondRowSelector = null; // Второй ряд кнопок для вкладок (жанры, альбомы, исполнители, плейлисты)
    var last_focused = null;
    var dom_update_timeout = null; // Для дебаунса обновлений DOM
    var wave_batch_id = '';
    // Используем глобальную переменную вместо локальной
    // var is_loading_more = false; 
    var current_cat = 'wave';
    var artist_mode = false;
    var album_mode = false;
    var playlist_mode = false;
    var search_mode = false;
    var genre_list_mode = false;
    var genre_content_mode = false;

    if (object && object.artist_id) {
        artist_mode = true;
    } else if (object && object.album_id) {
        album_mode = true;
    } else if (object && object.playlist_id) {
        playlist_mode = true;
    } else if (object && object.search_query) {
        search_mode = true;
    } else if (object && object.genre_list) {
        genre_list_mode = true;
    } else if (object && object.genre_name && object.genre_tab) {
        genre_content_mode = true;
    }
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: current_cat ВСЕГДА определяется из Storage
    // Это обеспечивает правильную подсветку кнопок и навигацию из ЛЮБОГО режима
    current_cat = Lampa.Storage.get('ym_cat', 'wave');
    
    // В специальных режимах кнопки все равно должны показывать текущую категорию
    // и позволять навигацию, как в YouTube или левом меню Lampa
    // else if (object && object.genre_section) {
    //     genre_mode = true;
    // }

    this.create = function () {
        var self = this;
        this.activity.loader(true);

        // КРИТИЧЕСКАЯ ОЧИСТКА ВСЕГО СОСТОЯНИЯ
        debug('🧹 КРИТИЧЕСКАЯ ОЧИСТКА СОСТОЯНИЯ');
        body.empty();
        window.ym_tracks_list = [];
        
        // Принудительно очищаем все глобальные переменные
        window.ym_is_loading_more = false;
        wave_batch_id = '';
        
        // 🔥 СБРАСЫВАЕМ ФЛАГ ПОИСКА ПРИ СОЗДАНИИ КОМПОНЕНТА
        if (!window.ym_search_mode) {
            debug('🔄 СБРОС search_mode = false при создании компонента');
        }
        window.ym_search_mode = false;
        
        // ОТЛАДКА СОСТОЯНИЯ НАВИГАЦИИ (безопасная)
        debug('=== ОТЛАДКА НАВИГАЦИИ ===');
        debug('🔍 Режимы: artist=' + artist_mode + ', album=' + album_mode + ', playlist=' + playlist_mode + ', search=' + search_mode + ', genre_list=' + genre_list_mode + ', genre_content=' + genre_content_mode);
        debug('📂 current_cat: ' + current_cat);
        debug('💾 Storage ym_cat: ' + Lampa.Storage.get('ym_cat', 'wave'));
        debug('🌊 Storage ym_station: ' + Lampa.Storage.get('ym_station', 'user:onyourwave'));
        
        // Безопасное логирование object параметров
        if (object) {
            var safeObject = {};
            Object.keys(object).forEach(function(key) {
                if (typeof object[key] !== 'function' && typeof object[key] !== 'object') {
                    safeObject[key] = object[key];
                } else if (key === 'activity') {
                    safeObject[key] = '[Activity Object]';
                } else {
                    safeObject[key] = '[' + typeof object[key] + ']';
                }
            });
            debug('📋 object параметры: ' + JSON.stringify(safeObject));
        } else {
            debug('📋 object параметры: null');
        }
        debug('========================');

        // ВСЕГДА отрисовываем кнопки категорий в начале (для навигации из любого режима)
        // current_cat определяется в логике режимов выше

        // Отрисовка кнопок категорий
        Object.keys(YM_CATS).forEach(function(key) {
            var categoryName = YM_CATS[key].name;
            
            // Для волны добавляем текущее настроение
            if (key === 'wave') {
                var currentMood = getCurrentWaveMoodName();
                categoryName = 'Моя волна - ' + currentMood;
            }
            
            // Для обзора добавляем текущий раздел и название плейлиста/подборки
            if (key === 'discover') {
                if (genre_list_mode) {
                    categoryName = 'Обзор - Жанры';
                } else if (genre_content_mode && object && object.genre_name) {
                    categoryName = 'Обзор - Жанры - ' + object.genre_name;
                } else {
                    var currentSection = getCurrentDiscoverSectionName();
                    categoryName = 'Обзор - ' + currentSection;
                    
                    // Добавляем название плейлиста/подборки если мы в нем
                    if (playlist_mode && object && object.title) {
                        categoryName += ' - ' + object.title;
                    }
                }
            }
            
            // ПРОСТАЯ ЛОГИКА: определяем активную кнопку БЕЗ БЛОКИРОВОК
            var isActive = false;
            
            if (key === 'wave') {
                var currentStation = Lampa.Storage.get('ym_station', 'user:onyourwave');
                if (current_cat === 'wave' || (currentStation && currentStation.indexOf('tag:') === 0)) {
                    isActive = true;
                }
            } else if (key === 'favorites') {
                if (current_cat === 'favorites') {
                    isActive = true;
                }
            } else if (key === 'discover') {
                if (current_cat === 'discover' || genre_list_mode || genre_content_mode) {
                    isActive = true;
                }
            } else if (key === 'search') {
                if (search_mode || window.ym_search_mode) {
                    isActive = true;
                }
            }
            
            // УБИРАЮ ВСЮ БЛОКИРОВКУ КНОПОК В СПЕЦИАЛЬНЫХ РЕЖИМАХ
            // Кнопки ВСЕГДА доступны, как в YouTube или левом меню Lampa
            
            // Создаем кнопку (круглую для поиска, обычную для остальных)
            var btn;
            if (key === 'search' && YM_CATS[key].is_round) {
                // Круглая кнопка поиска как в Lampa
                btn = $('<div class="ym-search-btn selector' + (isActive ? ' active' : '') + '">' + YM_CATS[key].icon_svg + '</div>');
            } else {
                // Обычная кнопка БЕЗ иконки
                btn = $('<div class="ym-net-btn selector' + (isActive ? ' active' : '') + '"><span>' + categoryName + '</span></div>');
            }
            btn.on('hover:focus', function() { 
                var el = $(this)[0]; 
                if(el && el.scrollIntoView) el.scrollIntoView({behavior: "smooth", block: "center", inline: "center"}); 
            });
            btn.on('hover:enter', function() { 
                debug('🔘 Нажата кнопка: ' + key + ' в режиме: artist=' + artist_mode + ', album=' + album_mode + ', playlist=' + playlist_mode + ', genre_list=' + genre_list_mode + ', genre_content=' + genre_content_mode);
                
                if (key === 'search') {
                    console.log('🔍 НАЖАТА КНОПКА ПОИСКА');
                    // Получаем историю поиска
                    var searchHistory = Lampa.Storage.get('ym_search_history', []);
                    console.log('📖 Загружена история поиска: ' + JSON.stringify(searchHistory));
                    
                    // Если есть история, показываем меню выбора
                    if (searchHistory.length > 0) {
                        var items = [];
                        
                        // Добавляем "Новый поиск" в начало
                        items.push({
                            title: '<svg viewBox="0 0 24 24" style="width:1em;height:1em;vertical-align:middle;margin-right:8px;"><path fill="#ffffff" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>Новый поиск',
                            value: 'new_search'
                        });
                        
                        // Добавляем историю
                        searchHistory.forEach(function(query) {
                            items.push({
                                title: query,
                                value: query
                            });
                        });
                        
                        // Добавляем "Очистить историю" в конец
                        items.push({
                            title: '🗑️ Очистить историю',
                            value: 'clear_history'
                        });
                        
                        Lampa.Select.show({
                            title: 'Поиск музыки',
                            items: items,
                            onSelect: function(item) {
                                if (item.value === 'new_search') {
                                    // Показываем обычный ввод
                                    showSearchInput();
                                } else if (item.value === 'clear_history') {
                                    // Очищаем историю
                                    Lampa.Storage.set('ym_search_history', []);
                                    Lampa.Noty.show('История поиска очищена');
                                } else {
                                    // Используем выбранный запрос из истории
                                    performSearch(item.value);
                                }
                            }
                        });
                    } else {
                        // Если истории нет, показываем обычный ввод
                        showSearchInput();
                    }
                    
                    function showSearchInput() {
                        Lampa.Input.edit({
                            value: '',
                            title: 'Поиск музыки',
                            free: true,
                            nosave: false
                        }, function(newVal) {
                            if(newVal) {
                                performSearch(newVal);
                            }
                        });
                    }
                    
                    function performSearch(query) {
                        console.log('🔍 Поисковый запрос: "' + query + '"');
                        
                        // Сохраняем в историю
                        var history = Lampa.Storage.get('ym_search_history', []);
                        history = history.filter(function(item) { return item !== query; });
                        history.unshift(query);
                        if (history.length > 20) history = history.slice(0, 20);
                        Lampa.Storage.set('ym_search_history', history);
                        
                        // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Устанавливаем флаг поиска
                        window.ym_search_mode = true;
                        debug('🔍 ПОИСК АКТИВИРОВАН - устанавливаем search_mode = true');
                        
                        self.activity.loader(true);
                        body.empty();
                        YM_API.search(query, function(results){
                            if(results.length) {
                                // Фильтруем список для плеера (оставляем только треки)
                                window.ym_tracks_list = results.filter(function(i){ return i.type === 'track'; });
                                self.build(results);
                            } else {
                                self.empty('Ничего не найдено');
                            }
                        });
                    }
                } else if (key === 'wave') {
                    // ОБРАБОТЧИК ДЛЯ КНОПКИ "МОЯ ВОЛНА": Показываем меню настроений или переходим к волне
                    debug('🌊 Показываем меню выбора настроения волны');
                    
                    var currentStation = Lampa.Storage.get('ym_station', 'user:onyourwave');
                    
                    // Создаем новый массив, не модифицируем оригинальный
                    var menuItems = YM_WAVE_TAGS.map(function(item) {
                        var newItem = {
                            title: item.title,
                            value: item.value
                        };
                        
                        // Добавляем галочку только к текущему активному пункту
                        if (item.value === currentStation) {
                            newItem.title = '✓ ' + item.title;
                        }
                        
                        return newItem;
                    });
                    
                    menuItems.push({ title: '🔧 Тест всех станций', value: 'test_all_stations' });
                    
                    Lampa.Select.show({
                        title: 'Настроение волны',
                        items: menuItems,
                        onSelect: function(selectedItem) {
                            if (selectedItem.value === 'test_all_stations') {
                                self.testAllWaveStations();
                            } else {
                                debug('🌊 Выбрано настроение волны: ' + selectedItem.value);
                                Lampa.Storage.set('ym_station', selectedItem.value);
                                Lampa.Storage.set('ym_cat', 'wave');
                                
                                // ПРИНУДИТЕЛЬНЫЙ ПЕРЕХОД С ЧИСТЫМИ ПАРАМЕТРАМИ
                                Lampa.Activity.replace({
                                    title: 'Яндекс Музыка',
                                    component: 'yandex_music',
                                    page: 1,
                                    // ЯВНО СБРАСЫВАЕМ ВСЕ СПЕЦИАЛЬНЫЕ ФЛАГИ
                                    artist_mode: false,
                                    album_mode: false,
                                    playlist_mode: false,
                                    genre_list: false,
                                    genre_name: null,
                                    genre_tab: null,
                                    artist_id: null,
                                    album_id: null,
                                    playlist_id: null
                                });
                            }
                        }
                    });
                } else if (key === 'discover') {
                    // ОБРАБОТЧИК ДЛЯ КНОПКИ "ОБЗОР": Показываем меню выбора раздела обзора
                    debug('🔍 Показываем меню выбора раздела обзора');
                    
                    var currentSection = Lampa.Storage.get('ym_discover_section', 'new_releases');
                    
                    // Создаем новый массив, не модифицируем оригинальный
                    var menuItems = YM_DISCOVER_SECTIONS.map(function(item) {
                        var newItem = {
                            title: item.title,
                            value: item.value,
                            icon: item.icon
                        };
                        
                        // Добавляем галочку только к текущему активному пункту
                        if (item.value === currentSection) {
                            newItem.title = '✓ ' + item.title;
                        }
                        
                        return newItem;
                    });
                    
                    Lampa.Select.show({
                        title: 'Выбор раздела обзора',
                        items: menuItems,
                        onSelect: function(selectedItem) {
                            debug('🔍 Выбран раздел обзора: ' + selectedItem.value);
                            Lampa.Storage.set('ym_discover_section', selectedItem.value);
                            Lampa.Storage.set('ym_cat', 'discover');
                            
                            // ПРИНУДИТЕЛЬНЫЙ ПЕРЕХОД С ЧИСТЫМИ ПАРАМЕТРАМИ
                            Lampa.Activity.replace({
                                title: 'Яндекс Музыка',
                                component: 'yandex_music',
                                page: 1,
                                // ЯВНО СБРАСЫВАЕМ ВСЕ СПЕЦИАЛЬНЫЕ ФЛАГИ
                                artist_mode: false,
                                album_mode: false,
                                playlist_mode: false,
                                genre_list: false,
                                genre_name: null,
                                genre_tab: null,
                                artist_id: null,
                                album_id: null,
                                playlist_id: null
                            });
                        }
                    });
                } else {
                    // ВСЕ ОСТАЛЬНЫЕ КНОПКИ: ПРИНУДИТЕЛЬНЫЙ ПЕРЕХОД С ЧИСТЫМИ ПАРАМЕТРАМИ
                    debug('🔄 ПРИНУДИТЕЛЬНЫЙ переход к категории: ' + key);
                    
                    window.ym_search_mode = false;
                    Lampa.Storage.set('ym_cat', key);
                    
                    // ПРИНУДИТЕЛЬНЫЙ ПЕРЕХОД С ЧИСТЫМИ ПАРАМЕТРАМИ - СБРАСЫВАЕМ ВСЕ СПЕЦИАЛЬНЫЕ РЕЖИМЫ
                    Lampa.Activity.replace({
                        title: 'Яндекс Музыка',
                        component: 'yandex_music',
                        page: 1,
                        // ЯВНО СБРАСЫВАЕМ ВСЕ СПЕЦИАЛЬНЫЕ ФЛАГИ
                        artist_mode: false,
                        album_mode: false,
                        playlist_mode: false,
                        genre_list: false,
                        genre_name: null,
                        genre_tab: null,
                        artist_id: null,
                        album_id: null,
                        playlist_id: null
                    });
                }
            });
            selector.append(btn);
        });

        // Создаем второй ряд кнопок для всех специальных вкладок (жанры, альбомы, исполнители, плейлисты)
        secondRowSelector = $('<div class="ym-net-row" style="display: none;"></div>');
        
        // Показываем и заполняем второй ряд только в режиме содержимого жанра
        if (genre_content_mode && object && object.genre_name && object.genre_tab && 
            typeof object.genre_name === 'string' && typeof object.genre_tab === 'string' &&
            !artist_mode && !album_mode && !playlist_mode && !search_mode && !genre_list_mode) {
            
            var genreName = object.genre_name;
            var currentTab = object.genre_tab;
            
            // Создаем кнопки вкладок жанра
            var genreTabs = {
                'playlists': { name: 'Подборки', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/></svg>' },
                'artists': { name: 'Исполнители', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 15.9 11 17 11S19 10.1 19 9M15 11.5V19C15 20.1 14.1 21 13 21S11 20.1 11 19 11.9 17 13 17 15 17.9 15 19M9 13C7.9 13 7 12.1 7 11S7.9 9 9 9 11 9.9 11 11 10.1 13 9 13Z"/></svg>' }
            };
            
            Object.keys(genreTabs).forEach(function(key) {
                var btn = $('<div class="ym-net-btn selector' + (currentTab == key ? ' active' : '') + '"><span>' + genreTabs[key].name + '</span></div>');
                btn.on('hover:focus', function() { 
                    var el = $(this)[0]; 
                    if(el && el.scrollIntoView) el.scrollIntoView({behavior: "smooth", block: "center", inline: "center"}); 
                });
                btn.on('hover:enter', function() { 
                    if (currentTab !== key) {
                        Lampa.Activity.replace({
                            title: 'Жанр: ' + genreName,
                            component: 'yandex_music',
                            genre_name: genreName,
                            genre_tab: key,
                            page: 1
                        });
                    }
                });
                secondRowSelector.append(btn);
            });
            
            secondRowSelector.show(); // Показываем второй ряд
        } else if (album_mode && object && object.album_id) {
            // ВКЛАДКИ АЛЬБОМОВ ВО ВТОРОМ РЯДУ - будут созданы в режиме альбома
            secondRowSelector.show();
        } else if (artist_mode && object && object.artist_id) {
            // ВКЛАДКИ ИСПОЛНИТЕЛЕЙ ВО ВТОРОМ РЯДУ - будут созданы в режиме исполнителя
            secondRowSelector.show();
        } else {
            // ИСПРАВЛЕНИЕ: Принудительно скрываем второй ряд если мы НЕ в специальном режиме
            secondRowSelector.hide();
        }

        // Режим просмотра альбома
        if (album_mode) {
            // Сначала получаем информацию об альбоме для создания кнопок навигации
            YM_API.req('https://api.music.yandex.net/albums/' + object.album_id, function(albumInfo) {
                var albumData = albumInfo.result || {};
                var albumTitle = albumData.title || object.title || 'Альбом';
                var artistName = '';
                var artistId = '';
                
                // Сначала загружаем треки альбома
                YM_API.getAlbumTracks(object.album_id, function(tracks) {
                    if(tracks.length) {
                        var artists = [];
                        
                        // Проверяем, играет ли сейчас трек из этого альбома
                        var currentTrack = null;
                        if (window.ym_player && window.ym_player.isPlaying() && window.ym_active_id) {
                            // Ищем текущий трек среди треков альбома
                            currentTrack = tracks.find(function(track) {
                                return String(track.id) === String(window.ym_active_id);
                            });
                        }
                        
                        if (currentTrack && currentTrack.artists && currentTrack.artists.length > 0) {
                            // Используем исполнителей текущего играющего трека
                            artists = currentTrack.artists;
                        } else if (albumData.artists && albumData.artists.length > 0) {
                            // Используем исполнителей альбома
                            artists = albumData.artists;
                        } else {
                            // Используем исполнителей первого трека как fallback
                            var firstTrackWithArtists = tracks.find(function(track) {
                                return track.artists && track.artists.length > 0;
                            });
                            if (firstTrackWithArtists) {
                                artists = firstTrackWithArtists.artists;
                            }
                        }
                        
                        if (artists.length > 0) {
                            var mainArtist = artists[0];
                            var allArtistsNames = artists.map(function(a) { return a.name; }).join(', ');
                            artistName = allArtistsNames;
                            artistId = mainArtist.id;
                            
                            // Обновляем заголовок активности
                            if (self.activity && self.activity.activity) {
                                self.activity.activity.title = artistName + ' - ' + albumTitle;
                                $('.head__title').text(artistName + ' - ' + albumTitle);
                            }
                            
                            // Создаем вкладки для навигации
                            var albumTabs = {
                                'album': { name: 'Альбом', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.2c4.8 0 8.8 3.9 8.8 8.8s-3.9 8.8-8.8 8.8-8.8-3.9-8.8-8.8 3.9-8.8 8.8-8.8zm0 2.3c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5zm0 2.5c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/></svg>' }
                            };
                            
                            // Добавляем вкладки для каждого исполнителя
                            artists.forEach(function(artist, index) {
                                var artistDisplayName = artist.name || 'Исполнитель';
                                var isMain = index === 0;
                                
                                // Для основного исполнителя добавляем обе вкладки
                                if (isMain) {
                                    albumTabs['artist_tracks_' + artist.id] = { 
                                        name: artistDisplayName + ' - Популярное', 
                                        icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
                                        artistId: artist.id,
                                        artistName: artistDisplayName
                                    };
                                    albumTabs['artist_albums_' + artist.id] = { 
                                        name: artistDisplayName + ' - Альбомы', 
                                        icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                                        artistId: artist.id,
                                        artistName: artistDisplayName
                                    };
                                } else {
                                    // Для дополнительных исполнителей добавляем только популярные треки
                                    albumTabs['artist_tracks_' + artist.id] = { 
                                        name: artistDisplayName, 
                                        icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
                                        artistId: artist.id,
                                        artistName: artistDisplayName
                                    };
                                }
                            });
                            
                            var currentAlbumTab = object.album_tab || 'album';
                            
                            // Отрисовка кнопок вкладок альбома
                            Object.keys(albumTabs).forEach(function(key) {
                                var tabData = albumTabs[key];
                                var btn = $('<div class="ym-net-btn selector' + (currentAlbumTab == key ? ' active' : '') + '"><span>' + tabData.name + '</span></div>');
                                btn.on('hover:focus', function() { 
                                    var el = $(this)[0]; 
                                    if(el && el.scrollIntoView) el.scrollIntoView({behavior: "smooth", block: "center", inline: "center"}); 
                                });
                                btn.on('hover:enter', function() { 
                                    if (currentAlbumTab !== key) { 
                                        if (key === 'album') {
                                            // Остаемся в альбоме
                                            Lampa.Activity.replace({
                                                title: artistName + ' - ' + albumTitle,
                                                component: 'yandex_music',
                                                album_id: object.album_id,
                                                album_tab: key,
                                                page: 1
                                            });
                                        } else if (key.startsWith('artist_tracks_')) {
                                            // Переходим к популярным трекам конкретного исполнителя
                                            Lampa.Activity.replace({
                                                title: tabData.artistName,
                                                component: 'yandex_music',
                                                artist_id: tabData.artistId,
                                                artist_name: tabData.artistName,
                                                artist_tab: 'tracks',
                                                page: 1
                                            });
                                        } else if (key.startsWith('artist_albums_')) {
                                            // Переходим к альбомам конкретного исполнителя
                                            Lampa.Activity.replace({
                                                title: tabData.artistName,
                                                component: 'yandex_music',
                                                artist_id: tabData.artistId,
                                                artist_name: tabData.artistName,
                                                artist_tab: 'albums',
                                                page: 1
                                            });
                                        }
                                    }
                                });
                                secondRowSelector.append(btn);
                            });
                        }
                        
                        // Добавляем нумерацию и форматируем треки альбома
                        tracks.forEach(function(track, index) {
                            // Добавляем номер трека с ведущим нулем
                            var trackNumber = (index + 1).toString().padStart(2, '0');
                            
                            // Форматируем длительность
                            var duration = '';
                            if (track.durationMs) {
                                var totalSeconds = Math.floor(track.durationMs / 1000);
                                var minutes = Math.floor(totalSeconds / 60);
                                var seconds = totalSeconds % 60;
                                duration = ' ' + minutes + ':' + seconds.toString().padStart(2, '0');
                            }
                            
                            // Создаем отформатированное название: "01 - Название трека 3:40"
                            track.displayTitle = trackNumber + ' - ' + (track.title || track.name) + duration;
                            track.originalTitle = track.title || track.name; // Сохраняем оригинальное название
                        });
                        
                        window.ym_tracks_list = tracks;
                        self.build(tracks);
                    } else {
                        self.empty('Треки альбома не найдены');
                    }
                });
            }, function() {
                // Если не удалось получить информацию об альбоме, просто загружаем треки
                YM_API.getAlbumTracks(object.album_id, function(tracks) {
                    if(tracks.length) {
                        // Добавляем нумерацию и форматируем треки альбома
                        tracks.forEach(function(track, index) {
                            // Добавляем номер трека с ведущим нулем
                            var trackNumber = (index + 1).toString().padStart(2, '0');
                            
                            // Форматируем длительность
                            var duration = '';
                            if (track.durationMs) {
                                var totalSeconds = Math.floor(track.durationMs / 1000);
                                var minutes = Math.floor(totalSeconds / 60);
                                var seconds = totalSeconds % 60;
                                duration = ' ' + minutes + ':' + seconds.toString().padStart(2, '0');
                            }
                            
                            // Создаем отформатированное название: "01 - Название трека 3:40"
                            track.displayTitle = trackNumber + ' - ' + (track.title || track.name) + duration;
                            track.originalTitle = track.title || track.name; // Сохраняем оригинальное название
                        });
                        
                        window.ym_tracks_list = tracks;
                        self.build(tracks);
                    } else {
                        self.empty('Треки альбома не найдены');
                    }
                });
            });
            return this.render();
        }

        // Режим просмотра артиста - создаем вкладки
        if (artist_mode) {
            // Получаем информацию об исполнителе для названий вкладок
            var artistName = object.artist_name || object.title || 'Исполнитель';
            
            // Создаем кнопки для вкладок артиста
            var artistTabs = {
                'tracks': { name: artistName + ' - Популярное', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>' },
                'albums': { name: artistName + ' - Альбомы', icon_svg: '<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' }
            };
            
            var currentArtistTab = object.artist_tab || 'tracks';
            
            // Отрисовка кнопок вкладок артиста
            Object.keys(artistTabs).forEach(function(key) {
                var btn = $('<div class="ym-net-btn selector' + (currentArtistTab == key ? ' active' : '') + '"><span>' + artistTabs[key].name + '</span></div>');
                btn.on('hover:focus', function() { 
                    var el = $(this)[0]; 
                    if(el && el.scrollIntoView) el.scrollIntoView({behavior: "smooth", block: "center", inline: "center"}); 
                });
                btn.on('hover:enter', function() { 
                    if (currentArtistTab !== key) { 
                        // Переключаем вкладку артиста
                        Lampa.Activity.replace({
                            title: object.title,
                            component: 'yandex_music',
                            artist_id: object.artist_id,
                            artist_name: artistName,
                            artist_tab: key,
                            page: 1
                        });
                    }
                });
                secondRowSelector.append(btn);
            });
            
            // Загружаем контент в зависимости от выбранной вкладки
            if (currentArtistTab === 'tracks') {
                // Популярные треки
                YM_API.req('https://api.music.yandex.net/artists/' + object.artist_id + '/tracks?page-size=50', function(res){
                    if(res.result && res.result.tracks) {
                        window.ym_tracks_list = res.result.tracks;
                        self.build(res.result.tracks);
                    } else {
                        self.empty('Треки не найдены');
                    }
                }, function(){ 
                    self.empty('Ошибка загрузки треков артиста'); 
                });
            } else if (currentArtistTab === 'albums') {
                // Альбомы артиста
                YM_API.getArtistAlbums(object.artist_id, function(albums) {
                    if (albums.length) {
                        // Добавляем тип и год для альбомов
                        albums.forEach(function(album) { 
                            album.type = 'album';
                            // Форматируем информацию об альбоме: "1989 - Название альбома, 14 песен"
                            var year = '';
                            if (album.year) {
                                year = album.year;
                            } else if (album.releaseDate) {
                                year = new Date(album.releaseDate).getFullYear();
                            }
                            
                            // Переформатируем название: год в начале
                            if (year) {
                                album.displayTitle = year + ' - ' + (album.title || album.name);
                            } else {
                                album.displayTitle = album.title || album.name;
                            }
                            
                            // Добавляем информацию о количестве треков в описание
                            if (album.trackCount) {
                                album.yearText = album.trackCount + ' песен';
                            } else {
                                album.yearText = 'Альбом';
                            }
                        });
                        window.ym_tracks_list = []; // Альбомы не для плеера
                        self.build(albums);
                    } else {
                        self.empty('Альбомы не найдены');
                    }
                });
            }
            
            return this.render();
        }

        // Режим просмотра плейлиста
        if (playlist_mode) {
            var playlistOwner = object.playlist_owner || '';
            var playlistId = object.playlist_id;
            
            debug('🎵 Загружаем плейлист: ' + playlistId + ', владелец: ' + playlistOwner, true);
            
            // Пробуем разные URL для загрузки плейлиста
            var playlistUrls = [];
            
            if (playlistOwner) {
                playlistUrls.push('https://api.music.yandex.net/users/' + playlistOwner + '/playlists/' + playlistId);
            }
            
            // Альтернативные URL
            playlistUrls.push('https://api.music.yandex.net/playlists/' + playlistId);
            playlistUrls.push('https://api.music.yandex.net/playlists/' + playlistId + '/tracks');
            
            var tryPlaylistUrl = function(urlIndex) {
                if (urlIndex >= playlistUrls.length) {
                    debug('❌ Все URL плейлиста не сработали', true);
                    self.empty('Ошибка загрузки плейлиста: все методы исчерпаны');
                    return;
                }
                
                var playlistUrl = playlistUrls[urlIndex];
                debug('🔄 Пробуем URL ' + (urlIndex + 1) + '/' + playlistUrls.length + ': ' + playlistUrl, true);
                
                YM_API.req(playlistUrl, function(res) {
                    debug('✅ URL сработал: ' + playlistUrl, true);
                    debug('📋 Ответ API: ' + JSON.stringify(res).substring(0, 500), true);
                    
                    var tracks = null;
                    
                    // Пробуем разные форматы ответа
                    if (res.result && res.result.tracks) {
                        tracks = res.result.tracks;
                        debug('📦 Найдены треки в result.tracks: ' + tracks.length, true);
                    } else if (res.result && res.result.playlist && res.result.playlist.tracks) {
                        tracks = res.result.playlist.tracks;
                        debug('📦 Найдены треки в result.playlist.tracks: ' + tracks.length, true);
                    } else if (res.result && Array.isArray(res.result)) {
                        tracks = res.result;
                        debug('📦 Найдены треки в result (массив): ' + tracks.length, true);
                    } else if (res.tracks) {
                        tracks = res.tracks;
                        debug('📦 Найдены треки в tracks: ' + tracks.length, true);
                    }
                    
                    if (tracks && tracks.length > 0) {
                        // Обрабатываем треки (могут быть обернуты в объект track)
                        var processedTracks = tracks.map(function(item, index) {
                            var track = item.track || item;
                            
                            var trackNumber = (index + 1).toString().padStart(2, '0');
                            var duration = '';
                            
                            if (track.durationMs) {
                                var minutes = Math.floor(track.durationMs / 60000);
                                var seconds = Math.floor((track.durationMs % 60000) / 1000);
                                duration = ' ' + minutes + ':' + seconds.toString().padStart(2, '0');
                            }
                            
                            // Создаем отформатированное название: "01 - Название трека 3:40"
                            track.displayTitle = trackNumber + ' - ' + (track.title || track.name) + duration;
                            track.originalTitle = track.title || track.name; // Сохраняем оригинальное название
                            
                            return track;
                        });
                        
                        debug('🎉 Плейлист загружен успешно: ' + processedTracks.length + ' треков', true);
                        window.ym_tracks_list = processedTracks;
                        self.build(processedTracks);
                    } else {
                        debug('⚠️ Треки не найдены в ответе, пробуем следующий URL', true);
                        tryPlaylistUrl(urlIndex + 1);
                    }
                }, function(error) {
                    debug('❌ URL не сработал: ' + playlistUrl + ', ошибка: ' + JSON.stringify(error), true);
                    tryPlaylistUrl(urlIndex + 1);
                });
            };
            
            // Начинаем с первого URL
            tryPlaylistUrl(0);
            
            return this.render();
        }
        
        // Режим поиска (для жанров и других поисковых запросов)
        if (search_mode) {
            var searchQuery = object.search_query;
            debug('🔍 Режим поиска: ' + searchQuery);
            
            YM_API.search(searchQuery, function(results) {
                if (results && results.length) {
                    // Показываем все результаты (треки, альбомы, артисты, плейлисты)
                    window.ym_tracks_list = results;
                    self.build(results);
                    
                    // Подсчитываем типы результатов
                    var tracks = results.filter(function(item) { return item.type === 'track'; }).length;
                    var albums = results.filter(function(item) { return item.type === 'album'; }).length;
                    var artists = results.filter(function(item) { return item.type === 'artist'; }).length;
                    var playlists = results.filter(function(item) { return item.type === 'playlist'; }).length;
                    
                    var message = '🎵 Найдено: ';
                    var parts = [];
                    if (tracks > 0) parts.push(tracks + ' треков');
                    if (albums > 0) parts.push(albums + ' альбомов');
                    if (artists > 0) parts.push(artists + ' артистов');
                    if (playlists > 0) parts.push(playlists + ' плейлистов');
                    
                    debug(message + parts.join(', '));
                } else {
                    self.empty('Результаты поиска не найдены');
                }
            });
            
            return this.render();
        }
        
        // Режим списка жанров
        if (genre_list_mode) {
            debug('🎭 Режим списка жанров');
            
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сразу отключаем загрузчик
            self.activity.loader(false);
            
            // Таймаут для предотвращения бесконечной загрузки
            var genreTimeout = setTimeout(function() {
                debug('⏰ Таймаут API жанров, используем fallback');
                self.loadGenresFallback();
            }, 5000); // Уменьшаем таймаут до 5 секунд
            
            // Загружаем список жанров через API
            YM_API.req('https://api.music.yandex.net/genres', function(res) {
                clearTimeout(genreTimeout);
                debug('🎭 Ответ API жанров получен');
                
                if (res.result && res.result.length) {
                    var genres = res.result.map(function(genre) {
                        genre.type = 'genre';
                        return genre;
                    });
                    debug('🎭 Загружено жанров из API: ' + genres.length);
                    window.ym_tracks_list = genres;
                    self.build(genres);
                    debug('🎭 Загружено жанров: ' + genres.length);
                } else {
                    debug('⚠️ API жанров не вернул результат, используем fallback');
                    self.loadGenresFallback();
                }
            }, function() {
                clearTimeout(genreTimeout);
                debug('❌ Ошибка API жанров, используем fallback');
                self.loadGenresFallback();
            });
            
            return this.render();
        }
        
        // Режим содержимого жанра (с вкладками)
        if (genre_content_mode) {
            var genreName = object.genre_name || 'Жанр';
            var currentTab = object.genre_tab || 'playlists';
            debug('🎭 Режим содержимого жанра: ' + genreName + ', вкладка: ' + currentTab);
            
            // Кнопки вкладок теперь создаются во втором ряду выше
            
            // Загружаем контент в зависимости от вкладки
            if (currentTab === 'playlists') {
                // Загружаем плейлисты и альбомы с таймаутом
                debug('🎭 Загружаем подборки для жанра: ' + genreName);
                
                var playlistsContent = [];
                var albumsContent = [];
                var loadedTypes = 0;
                var totalTypes = 2;
                var hasTimeout = false;
                
                // Таймаут для предотвращения зависания
                var timeout = setTimeout(function() {
                    if (loadedTypes < totalTypes && !hasTimeout) {
                        hasTimeout = true;
                        var allContent = playlistsContent.concat(albumsContent); // Плейлисты первыми
                        debug('⏰ Таймаут загрузки жанра, показываем что есть: ' + allContent.length);
                        if (allContent.length > 0) {
                            window.ym_tracks_list = allContent;
                            self.build(allContent);
                            self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку при таймауте
                            debug('📋 Загружено подборок: ' + allContent.length + ' (частично)');
                        } else {
                            self.empty('Таймаут загрузки подборок жанра');
                            self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку при таймауте
                        }
                    }
                }, 20000); // 20 секунд таймаут
                
                var checkComplete = function() {
                    if (hasTimeout) return; // Уже обработано таймаутом
                    
                    if (loadedTypes >= totalTypes) {
                        clearTimeout(timeout);
                        var allContent = playlistsContent.concat(albumsContent); // Плейлисты первыми
                        if (allContent.length > 0) {
                            window.ym_tracks_list = allContent;
                            self.build(allContent);
                            self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку
                        showStatus('📋 Загружено подборок: ' + allContent.length);
                        } else {
                            self.empty('Подборки жанра не найдены');
                            self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку при ошибке
                        }
                    }
                };
                
                // Загружаем плейлисты
                YM_API.getGenrePlaylists(genreName.toLowerCase(), function(playlists) {
                    if (!hasTimeout) {
                        loadedTypes++;
                        if (playlists && playlists.length > 0) {
                            playlistsContent = playlists;
                            debug('✅ Загружено плейлистов: ' + playlists.length);
                        }
                        checkComplete();
                    }
                });
                
                // Загружаем альбомы
                YM_API.getGenreAlbums(genreName.toLowerCase(), function(albums) {
                    if (!hasTimeout) {
                        loadedTypes++;
                        if (albums && albums.length > 0) {
                            albumsContent = albums;
                            debug('✅ Загружено альбомов: ' + albums.length);
                        }
                        checkComplete();
                    }
                });
            } else if (currentTab === 'artists') {
                // Загружаем исполнителей с таймаутом
                debug('🎭 Загружаем исполнителей для жанра: ' + genreName);
                
                var artistTimeout = setTimeout(function() {
                    debug('⏰ Таймаут загрузки исполнителей жанра');
                    self.empty('Таймаут загрузки исполнителей жанра');
                    self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку при таймауте
                }, 20000);
                
                YM_API.getGenreArtists(genreName.toLowerCase(), function(artists) {
                    clearTimeout(artistTimeout);
                    if (artists && artists.length > 0) {
                        window.ym_tracks_list = artists;
                        self.build(artists);
                        self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку
                        debug('👨‍🎤 Загружено исполнителей: ' + artists.length);
                    } else {
                        self.empty('Исполнители жанра не найдены');
                        self.activity.loader(false); // ИСПРАВЛЕНИЕ: Завершаем загрузку при ошибке
                    }
                });
            }
            
            return this.render();
        }
        


        // Убираем дополнительную кнопку выбора раздела обзора - она дублирует функциональность основной кнопки "Обзор"

        // Логика загрузки контента (ТОЛЬКО для обычных категорий, НЕ для специальных режимов)
        if (artist_mode || album_mode || playlist_mode || search_mode || genre_list_mode || genre_content_mode) {
            debug('🚫 Пропускаем основную логику загрузки - мы в специальном режиме');
            return this.render();
        }
        
        if(!Lampa.Storage.get('ym_token')) { 
            self.empty('Нужен токен. Зайдите в настройки.'); 
            return this.render(); 
        }

        window.ym_tracks_list = [];
        body.empty();

        // Принудительная очистка контента в начале
        debug('🧹 Принудительная очистка контента перед загрузкой');
        body.empty();
        window.ym_tracks_list = [];
        
        YM_API.getUserId(function(uid){
            if(!uid) { 
                self.empty('Ошибка получения UserID'); 
                return; 
            }

            // КРИТИЧЕСКАЯ ПРОВЕРКА РЕЖИМОВ
            debug('🔍 ПРОВЕРКА РЕЖИМОВ ПЕРЕД ЗАГРУЗКОЙ КОНТЕНТА');
            debug('📂 current_cat: ' + current_cat);
            debug('🎭 genre_list_mode: ' + genre_list_mode);
            debug('🎵 genre_content_mode: ' + genre_content_mode);
            debug('👤 artist_mode: ' + artist_mode);
            debug('💿 album_mode: ' + album_mode);
            debug('📋 playlist_mode: ' + playlist_mode);
            debug('🔍 search_mode: ' + search_mode);

            try {
                debug('🔍 Загружаем контент для категории: ' + current_cat);
                
                // ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ПЕРЕД КАЖДОЙ ЗАГРУЗКОЙ
                body.empty();
                window.ym_tracks_list = [];
                
                if (current_cat && current_cat === 'favorites') {
                    debug('📋 Загружаем любимые треки');
                    // Загружаем ВСЕ любимые треки с пагинацией
                    self.loadAllFavorites(uid);
                } else if (current_cat && current_cat === 'wave') {
                    debug('🌊 Загружаем волну');
                    self.loadWave(true); // TRUE = Первая загрузка
                } else if (current_cat === 'discover') {
                    debug('🔍 Загружаем раздел обзора');
                    self.loadDiscoverSection();
                } else {
                    debug('⚠️ Неизвестная категория: ' + current_cat);
                    self.empty('Неизвестная категория: ' + current_cat);
                }
            } catch(e) {
                console.log('Global Error:', e);
                self.empty('Критическая ошибка плагина');
            }
        });

        return this.render();
    };

    // Функция для определения количества треков на экране
    this.getTracksPerScreen = function() {
        // Уменьшаем количество треков для более легкой загрузки
        // Примерно 2-3 ряда по 5-8 треков = около 15 треков на загрузку
        return 15;
    };

    // Функция для проверки, нужна ли подгрузка треков для заполнения экрана
    this.needMoreTracksForScreen = function() {
        var tracksPerScreen = this.getTracksPerScreen();
        var currentTracks = window.ym_tracks_list.length;
        
        // Для волны ВСЕГДА догружаем до полного заполнения экрана
        var needMore = currentTracks < tracksPerScreen;
        if (needMore) {
            debug('🔄 Нужно еще треков: ' + currentTracks + ' из ' + tracksPerScreen);
        }
        return needMore;
    };

    this.loadWave = function(isFirstLoad) {
        var self = this;
        
        debug('🌊 ВЫЗОВ loadWave - isFirstLoad: ' + isFirstLoad);
        
        // 🔥 ФАЙРВОЛ: ЗАПРЕТИТЬ ВСЁ КРОМЕ "МОЯ ВОЛНА"
        var currentCategory = Lampa.Storage.get('ym_cat', 'wave');
        if (currentCategory !== 'wave') {
            debug('🚫 ФАЙРВОЛ: loadWave ЗАБЛОКИРОВАН - не "Моя волна", текущий: ' + currentCategory);
            return;
        }
        
        // 🔥 ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: Смотрим текущую активность
        var currentActivity = Lampa.Activity.active();
        if (currentActivity && currentActivity.activity) {
            var activityObject = currentActivity.activity.object;
            if (activityObject && (activityObject.search_query || activityObject.artist_id || activityObject.album_id || 
                                  activityObject.playlist_id || activityObject.genre_list || activityObject.genre_name)) {
                debug('🚫 ФАЙРВОЛ: loadWave ЗАБЛОКИРОВАН - активность в специальном режиме: ' + JSON.stringify({
                    search: !!activityObject.search_query,
                    artist: !!activityObject.artist_id, 
                    album: !!activityObject.album_id,
                    playlist: !!activityObject.playlist_id,
                    genre_list: !!activityObject.genre_list,
                    genre_name: !!activityObject.genre_name
                }));
                return;
            }
        }
        
        // Проверяем что мы НЕ в специальных режимах (старая проверка object)
        if (object && (object.search_query || object.artist_id || object.album_id || 
                      object.playlist_id || object.genre_list || object.genre_name)) {
            debug('🚫 ФАЙРВОЛ: loadWave ЗАБЛОКИРОВАН - object в специальном режиме: ' + JSON.stringify({
                search: !!object.search_query,
                artist: !!object.artist_id, 
                album: !!object.album_id,
                playlist: !!object.playlist_id,
                genre_list: !!object.genre_list,
                genre_name: !!object.genre_name
            }));
            return;
        }
        
        // 🔥 ЯДЕРНАЯ ПРОВЕРКА: Смотрим заголовок активности
        if (currentActivity && currentActivity.activity && currentActivity.activity.title) {
            var title = currentActivity.activity.title.toLowerCase();
            if (title.includes('поиск') || title.includes('search') || 
                title.includes('артист') || title.includes('artist') ||
                title.includes('альбом') || title.includes('album') ||
                title.includes('плейлист') || title.includes('playlist') ||
                title.includes('жанр') || title.includes('genre')) {
                debug('🚫 ЯДЕРНАЯ БЛОКИРОВКА: loadWave ЗАБЛОКИРОВАН - заголовок активности: ' + currentActivity.activity.title);
                return;
            }
        }
        
        // ПРОВЕРКА: Останавливаем загрузку только если точно вышли из плагина
        if (!isFirstLoad && currentActivity && currentActivity.component && currentActivity.component !== 'yandex_music') {
            debug('🛑 Остановка загрузки волны - пользователь вышел из плагина');
            window.ym_is_loading_more = false;
            return;
        }
        
        if (window.ym_is_loading_more) return;
        window.ym_is_loading_more = true;

        var station = Lampa.Storage.get('ym_station', 'user:onyourwave');
        
        // Функция для попытки загрузки с разными форматами станции
        var tryLoadStation = function(stationId, attempt) {
            attempt = attempt || 1;
            var url = 'https://api.music.yandex.net/rotor/station/' + stationId + '/tracks';
            
            // Добавляем параметры для получения большего количества треков
            var params = [];
            if (wave_batch_id) {
                params.push('batch-id=' + wave_batch_id);
            }
            // Запрашиваем меньше треков за раз для более легкой загрузки
            params.push('queue-size=15'); // Уменьшаем размер очереди до 15
            
            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            YM_API.req(url, function(res){
                window.ym_is_loading_more = false;
                
                if(res.result && res.result.sequence) {
                    wave_batch_id = res.result.batchId;
                    
                    var newTracks = [];
                    var existingTrackIds = new Set();
                    
                    // Собираем ID уже загруженных треков
                    if (window.ym_tracks_list && window.ym_tracks_list.length > 0) {
                        window.ym_tracks_list.forEach(function(track) {
                            if (track && track.id) {
                                existingTrackIds.add(String(track.id));
                            }
                        });
                    }
                    
                    // Фильтруем дубликаты из новых треков
                    res.result.sequence.forEach(function(item){ 
                        if(item.track && item.track.id) {
                            var trackId = String(item.track.id);
                            if (!existingTrackIds.has(trackId)) {
                                newTracks.push(item.track);
                                existingTrackIds.add(trackId); // Добавляем в набор для предотвращения дубликатов внутри одной загрузки
                            }
                        }
                    });
                    
                    debug('🎵 Загружено треков: ' + res.result.sequence.length + ', уникальных: ' + newTracks.length + ', дубликатов отфильтровано: ' + (res.result.sequence.length - newTracks.length));

                    if(newTracks.length) {
                        if(isFirstLoad) {
                            window.ym_tracks_list = newTracks;
                            self.build(newTracks);
                            
                            // АВТОМАТИЧЕСКАЯ ДОГРУЗКА: Сразу загружаем еще треки для заполнения экрана
                            setTimeout(function() {
                                // КРИТИЧЕСКАЯ ПРОВЕРКА: Загружаем только если все еще в плагине И в разделе "Моя волна" И НЕ в специальных режимах
                                var currentActivity = Lampa.Activity.active();
                                var currentCategory = Lampa.Storage.get('ym_cat', 'wave');
                                var isInWaveMode = (currentCategory === 'wave') && 
                                                   (!object || (!object.search_query && !object.artist_id && !object.album_id && 
                                                               !object.playlist_id && !object.genre_list && !object.genre_name));
                                
                                if (!window.ym_is_loading_more && 
                                    (!currentActivity || !currentActivity.component || currentActivity.component === 'yandex_music') &&
                                    isInWaveMode &&
                                    canLoadWave()) {
                                    self.loadWave(false); // Загружаем еще треки
                                } else {
                                    debug('🚫 Автодогрузка в loadWave ЗАБЛОКИРОВАНА');
                                }
                            }, 300); // Быстрая догрузка
                        } else {
                            // Добавляем новые треки к существующим (только уникальные)
                            var oldLength = window.ym_tracks_list.length;
                            window.ym_tracks_list = window.ym_tracks_list.concat(newTracks);
                            self.build(newTracks, true);
                            
                            // Показываем информацию о подгрузке
                            var totalLoaded = res.result.sequence.length;
                            var duplicatesFiltered = totalLoaded - newTracks.length;
                            var message = '🎵 Загружено еще ' + newTracks.length + ' треков (всего: ' + window.ym_tracks_list.length + ')';
                            if (duplicatesFiltered > 0) {
                                message += ' [дубликатов отфильтровано: ' + duplicatesFiltered + ']';
                            }
                            showStatus(message);
                            
                            // ПРОДОЛЖАЕМ ДОГРУЗКУ: Если нужно еще треков для заполнения экрана
                            if (self.needMoreTracksForScreen()) {
                                setTimeout(function() {
                                    // КРИТИЧЕСКАЯ ПРОВЕРКА: Загружаем только если все еще в плагине И в разделе "Моя волна" И НЕ в специальных режимах
                                    var currentActivity = Lampa.Activity.active();
                                    var currentCategory = Lampa.Storage.get('ym_cat', 'wave');
                                    var isInWaveMode = (currentCategory === 'wave') && 
                                                       (!object || (!object.search_query && !object.artist_id && !object.album_id && 
                                                                   !object.playlist_id && !object.genre_list && !object.genre_name));
                                    
                                    if (!window.ym_is_loading_more && 
                                        (!currentActivity || !currentActivity.component || currentActivity.component === 'yandex_music') &&
                                        isInWaveMode &&
                                        canLoadWave()) {
                                        self.loadWave(false);
                                    } else {
                                        debug('🚫 Продолжение догрузки ЗАБЛОКИРОВАНО');
                                    }
                                }, 300); // Быстрая догрузка
                            }
                        }
                    } else {
                        // Если все треки оказались дубликатами, продолжаем загрузку
                        debug('⚠️ Все треки оказались дубликатами, продолжаем загрузку...');
                        if (self.needMoreTracksForScreen()) {
                            setTimeout(function() {
                                // КРИТИЧЕСКАЯ ПРОВЕРКА: Загружаем только если все еще в плагине И в разделе "Моя волна" И НЕ в специальных режимах
                                var currentActivity = Lampa.Activity.active();
                                var currentCategory = Lampa.Storage.get('ym_cat', 'wave');
                                var isInWaveMode = (currentCategory === 'wave') && 
                                                   (!object || (!object.search_query && !object.artist_id && !object.album_id && 
                                                               !object.playlist_id && !object.genre_list && !object.genre_name));
                                
                                if (!window.ym_is_loading_more && 
                                    (!currentActivity || !currentActivity.component || currentActivity.component === 'yandex_music') &&
                                    isInWaveMode &&
                                    canLoadWave()) {
                                    self.loadWave(false);
                                } else {
                                    debug('🚫 Догрузка дубликатов ЗАБЛОКИРОВАНА');
                                }
                            }, 500); // Немного больше задержка при дубликатах
                        } else if (!window.ym_tracks_list.length) {
                            if(isFirstLoad) self.empty('Волна пуста');
                        }
                    }
                } else {
                    debug('Wave API Error: Неверный формат ответа - ' + JSON.stringify(res), true);
                    
                    // Пробуем альтернативные форматы станции
                    if (attempt === 1 && stationId.includes(':')) {
                        // Пробуем заменить : на /
                        var altStation = stationId.replace(':', '/');
                        debug('Пробуем альтернативный формат: ' + altStation);
                        tryLoadStation(altStation, 2);
                        return;
                    } else if (attempt === 2 && stationId.includes('/')) {
                        // Пробуем убрать префикс
                        var parts = stationId.split('/');
                        if (parts.length > 1) {
                            var altStation = parts[1];
                            debug('Пробуем без префикса: ' + altStation);
                            tryLoadStation(altStation, 3);
                            return;
                        }
                    }
                    
                    if(isFirstLoad) self.empty('Ошибка волны: неверный формат ответа');
                }
            }, function(error){ 
                // Пробуем альтернативные форматы при сетевой ошибке
                if (attempt === 1 && stationId.includes(':')) {
                    var altStation = stationId.replace(':', '/');
                    debug('Сетевая ошибка, пробуем альтернативный формат: ' + altStation);
                    tryLoadStation(altStation, 2);
                    return;
                } else if (attempt === 2 && stationId.includes('/')) {
                    var parts = stationId.split('/');
                    if (parts.length > 1) {
                        var altStation = parts[1];
                        debug('Сетевая ошибка, пробуем без префикса: ' + altStation);
                        tryLoadStation(altStation, 3);
                        return;
                    }
                }
                
                window.ym_is_loading_more = false; 
                if(isFirstLoad) self.empty('Ошибка волны: сетевая ошибка'); 
            });
        };
        
        // Начинаем с основной станции
        tryLoadStation(station);
    };

    // Загружаем ВСЕ любимые треки с пагинацией
    this.loadAllFavorites = function(uid) {
        var self = this;
        var allTrackIds = [];
        var currentPage = 0;
        var pageSize = 1000; // Максимальный размер страницы
        
        debug('🎵 Начинаем загрузку всех любимых треков для пользователя: ' + uid, true);
        
        // Рекурсивная функция для загрузки всех страниц
        var loadPage = function(page) {
            var url = 'https://api.music.yandex.net/users/' + uid + '/likes/tracks';
            
            // Добавляем параметры пагинации
            if (page > 0) {
                url += '?page=' + page + '&page-size=' + pageSize;
            } else {
                url += '?page-size=' + pageSize;
            }
            
            debug('📄 Загружаем страницу ' + page + ': ' + url, true);
            
            YM_API.req(url, function(res) {
                if (res.result && res.result.library && res.result.library.tracks) {
                    var pageTrackIds = res.result.library.tracks.map(function(t) { return t.id; });
                    allTrackIds = allTrackIds.concat(pageTrackIds);
                    
                    debug('📄 Страница ' + page + ': получено ' + pageTrackIds.length + ' треков (всего: ' + allTrackIds.length + ')', true);
                    
                    // Если получили полную страницу, загружаем следующую
                    if (pageTrackIds.length === pageSize) {
                        loadPage(page + 1);
                    } else {
                        // Это последняя страница, загружаем детали треков
                        debug('✅ Загрузка завершена! Всего ID треков: ' + allTrackIds.length, true);
                        loadTrackDetails(allTrackIds);
                    }
                } else if (page === 0) {
                    // Первая страница пуста
                    self.empty('Нет любимых треков');
                } else {
                    // Последующие страницы пусты - это нормально
                    debug('✅ Загрузка завершена! Всего ID треков: ' + allTrackIds.length, true);
                    loadTrackDetails(allTrackIds);
                }
            }, function(error) {
                debug('❌ Ошибка загрузки страницы ' + page + ': ' + JSON.stringify(error), true);
                if (page === 0) {
                    self.empty('Ошибка сети при загрузке любимых треков');
                } else {
                    // Если ошибка на последующих страницах, используем то что есть
                    debug('⚠️ Ошибка на странице ' + page + ', используем уже загруженные треки: ' + allTrackIds.length, true);
                    loadTrackDetails(allTrackIds);
                }
            });
        };
        
        // Функция для загрузки деталей треков батчами
        var loadTrackDetails = function(trackIds) {
            if (trackIds.length === 0) {
                self.empty('Нет любимых треков');
                return;
            }
            
            debug('🔄 Загружаем детали для ' + trackIds.length + ' треков...', true);
            
            // API Яндекс.Музыки может обработать до 300 треков за раз
            var batchSize = 300;
            var allTracks = [];
            var batchesLoaded = 0;
            var totalBatches = Math.ceil(trackIds.length / batchSize);
            
            var loadBatch = function(batchIndex) {
                var startIndex = batchIndex * batchSize;
                var endIndex = Math.min(startIndex + batchSize, trackIds.length);
                var batchIds = trackIds.slice(startIndex, endIndex);
                
                debug('📦 Загружаем батч ' + (batchIndex + 1) + '/' + totalBatches + ': треки ' + (startIndex + 1) + '-' + endIndex, true);
                
                YM_API.req('https://api.music.yandex.net/tracks?track-ids=' + batchIds.join(','), function(trackRes) {
                    if (trackRes.result && trackRes.result.length) {
                        // Помечаем все треки как любимые
                        trackRes.result.forEach(function(t) { t.is_liked = true; });
                        allTracks = allTracks.concat(trackRes.result);
                        
                        debug('📦 Батч ' + (batchIndex + 1) + ' загружен: ' + trackRes.result.length + ' треков (всего: ' + allTracks.length + ')', true);
                    }
                    
                    batchesLoaded++;
                    
                    // Если загружены все батчи
                    if (batchesLoaded === totalBatches) {
                        debug('🎉 ВСЕ ЛЮБИМЫЕ ТРЕКИ ЗАГРУЖЕНЫ! Итого: ' + allTracks.length + ' треков', true);
                        window.ym_tracks_list = allTracks;
                        self.build(allTracks);
                        
                        // Показываем уведомление пользователю
                        showStatus('🎵 Загружено ' + allTracks.length + ' любимых треков!');
                    } else {
                        // Загружаем следующий батч
                        loadBatch(batchIndex + 1);
                    }
                }, function(error) {
                    debug('❌ Ошибка загрузки батча ' + (batchIndex + 1) + ': ' + JSON.stringify(error), true);
                    batchesLoaded++;
                    
                    // Продолжаем даже при ошибке
                    if (batchesLoaded === totalBatches) {
                        if (allTracks.length > 0) {
                            debug('⚠️ Загрузка завершена с ошибками. Загружено: ' + allTracks.length + ' треков', true);
                            window.ym_tracks_list = allTracks;
                            self.build(allTracks);
                            debug('⚠️ Загружено ' + allTracks.length + ' треков (с ошибками)');
                        } else {
                            self.empty('Ошибка загрузки деталей треков');
                        }
                    } else {
                        loadBatch(batchIndex + 1);
                    }
                });
            };
            
            // Начинаем загрузку первого батча
            loadBatch(0);
        };
        
        // Начинаем с первой страницы
        loadPage(0);
    };

    // Загружаем новые плейлисты с расширенным поиском
    this.loadNewPlaylistsWithPagination = function() {
        var self = this;
        
        debug('🎵 Загружаем новые плейлисты из main.jsx...', true);
        
        // Используем реальный API endpoint, который работает
        var url = 'https://music.yandex.ru/handlers/main.jsx';
        
        YM_API.req(url, function(res) {
            debug('📡 Получен ответ от main.jsx');
            
            if (res && res.blocks) {
                var playlists = [];
                
                // Ищем блок с новыми плейлистами
                res.blocks.forEach(function(block) {
                    if (block.type === 'new-playlists' && block.entities) {
                        debug('✅ Найден блок new-playlists с ' + block.entities.length + ' элементами');
                        
                        block.entities.forEach(function(entity) {
                            if (entity.type === 'playlist' && entity.data) {
                                var playlist = entity.data;
                                
                                // Нормализуем данные плейлиста
                                var normalizedPlaylist = {
                                    id: playlist.uid + ':' + playlist.kind,
                                    uid: playlist.uid,
                                    kind: playlist.kind,
                                    title: playlist.title,
                                    name: playlist.title,
                                    type: 'playlist',
                                    trackCount: playlist.trackCount,
                                    owner: playlist.owner,
                                    coverUri: playlist.cover ? playlist.cover.uri : null,
                                    description: playlist.description || '',
                                    likesCount: playlist.likesCount || 0,
                                    created: playlist.created,
                                    modified: playlist.modified
                                };
                                
                                playlists.push(normalizedPlaylist);
                                debug('🎵 Добавлен плейлист: ' + playlist.title + ' (' + playlist.trackCount + ' треков)');
                            }
                        });
                    }
                });
                
                if (playlists.length > 0) {
                    window.ym_tracks_list = playlists;
                    self.build(playlists);
                    debug('🎉 Успешно загружено ' + playlists.length + ' плейлистов!', true);
                    showStatus('🎵 Загружено ' + playlists.length + ' новых плейлистов', true);
                } else {
                    debug('⚠️ Блок new-playlists не найден или пуст');
                    self.empty('Новые плейлисты не найдены в ответе API');
                }
            } else {
                debug('❌ Неверная структура ответа от main.jsx');
                self.empty('Ошибка структуры ответа API');
            }
        }, function(error) {
            debug('❌ Ошибка загрузки main.jsx: ' + error);
            self.empty('Ошибка загрузки плейлистов. Проверьте подключение к интернету.');
        });
    };

    this.testAllWaveStations = function() {
        var self = this;
        debug('🔄 Начинаем тестирование всех волновых станций...', true);
        debug('Тестирование волновых станций...');
        
        var testResults = [];
        var currentIndex = 0;
        
        var testStation = function(station, callback) {
            var url = 'https://api.music.yandex.net/rotor/station/' + station.value + '/tracks';
            debug('🧪 Тестируем: ' + station.title + ' (' + station.value + ')');
            
            YM_API.req(url, function(res) {
                if (res.result && res.result.sequence && res.result.sequence.length > 0) {
                    debug('✅ ' + station.title + ' - РАБОТАЕТ (' + res.result.sequence.length + ' треков)');
                    testResults.push({
                        title: station.title,
                        value: station.value,
                        status: '✅ РАБОТАЕТ',
                        tracks: res.result.sequence.length
                    });
                } else if (res.result && res.result.sequence) {
                    debug('⚠️ ' + station.title + ' - ПУСТАЯ ВОЛНА');
                    testResults.push({
                        title: station.title,
                        value: station.value,
                        status: '⚠️ ПУСТАЯ',
                        tracks: 0
                    });
                } else {
                    debug('❌ ' + station.title + ' - НЕВЕРНЫЙ ОТВЕТ: ' + JSON.stringify(res).substring(0, 100));
                    testResults.push({
                        title: station.title,
                        value: station.value,
                        status: '❌ НЕВЕРНЫЙ ОТВЕТ',
                        tracks: 0
                    });
                }
                callback();
            }, function(error) {
                debug('❌ ' + station.title + ' - ОШИБКА СЕТИ: ' + JSON.stringify(error));
                testResults.push({
                    title: station.title,
                    value: station.value,
                    status: '❌ ОШИБКА СЕТИ',
                    tracks: 0
                });
                callback();
            });
        };
        
        var testNext = function() {
            if (currentIndex >= YM_WAVE_TAGS.length) {
                // Показываем результаты
                var message = '🎵 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ ВОЛНОВЫХ СТАНЦИЙ:\n\n';
                var workingCount = 0;
                
                testResults.forEach(function(result) {
                    message += result.status + ' ' + result.title + ' (' + result.value + ')';
                    if (result.tracks > 0) {
                        message += ' - ' + result.tracks + ' треков';
                        workingCount++;
                    }
                    message += '\n';
                });
                
                message += '\n📊 СТАТИСТИКА:';
                message += '\n✅ Работающих станций: ' + workingCount + '/' + YM_WAVE_TAGS.length;
                message += '\n❌ Неработающих станций: ' + (YM_WAVE_TAGS.length - workingCount) + '/' + YM_WAVE_TAGS.length;
                
                if (workingCount === 0) {
                    message += '\n\n⚠️ НИ ОДНА СТАНЦИЯ НЕ РАБОТАЕТ!';
                    message += '\nВозможные причины:';
                    message += '\n• Неправильные station ID';
                    message += '\n• Изменения в API Яндекс.Музыки';
                    message += '\n• Проблемы с токеном';
                } else if (workingCount < YM_WAVE_TAGS.length) {
                    message += '\n\n💡 РЕКОМЕНДАЦИИ:';
                    message += '\n• Используйте только работающие станции';
                    message += '\n• Неработающие станции будут обновлены';
                }
                
                debug(message, true);
                debug('✅ Тестирование завершено! Результаты в консоли.');
                return;
            }
            
            var station = YM_WAVE_TAGS[currentIndex];
            currentIndex++;
            
            testStation(station, function() {
                setTimeout(testNext, 1000); // Увеличиваем задержку между запросами
            });
        };
        
        testNext();
    };

    this.empty = function(msg) { 
        body.append('<div class="ym-empty">' + msg + '</div>'); 
        this.finalize(); 
    };

    this.build = function (data, append) {
        var self = this;
        
        // ПРОВЕРКА РЕЖИМА ФИЛЬТРАЦИИ
        var filterMode = Lampa.Storage.get('ym_filter_explicit', 'off');
        var useApiFilter = (filterMode === 'api' || filterMode === 'both');
        var useWordsFilter = (filterMode === 'words' || filterMode === 'both');
        
        // Проверяем, находимся ли в режиме альбома или плейлиста
        var isAlbumView = album_mode || playlist_mode;
        
        var filteredCount = 0; // Счетчик отфильтрованных треков
        
        // Отладка настройки фильтрации
        debug('=== ФИЛЬТРАЦИЯ DEBUG ===');
        debug('Режим фильтрации: ' + filterMode);
        debug('API фильтрация: ' + useApiFilter);
        debug('Фильтрация по словам: ' + useWordsFilter);
        debug('Режим альбома: ' + isAlbumView);
        debug('Всего треков для обработки: ' + data.length);

        data.forEach(function(el) {
            if(!el) return;

            // ГИБКАЯ ФИЛЬТРАЦИЯ 18+
            if (useWordsFilter || useApiFilter) {
                var isFiltered = false;
                
                // 1. ФИЛЬТРАЦИЯ ПО СЛОВАМ (если включена)
                if (useWordsFilter) {
                    var title = (el.title || el.name || '').toLowerCase();
                    var explicitWords = ['заебал', 'заебало', 'нахуй', 'блядь', 'пизда', 'хуй', 'ебать', 'fuck', 'shit'];
                    
                    // Проверка названия трека
                    for (var w = 0; w < explicitWords.length; w++) {
                        if (title.includes(explicitWords[w])) {
                            isFiltered = true;
                            debug('>>> ОТФИЛЬТРОВАНО ПО СЛОВУ "' + explicitWords[w] + '": ' + (el.title || el.name));
                            break;
                        }
                    }
                    
                    // Проверка исполнителей
                    if (!isFiltered && el.artists && el.artists.length > 0) {
                        for (var a = 0; a < el.artists.length; a++) {
                            var artistName = (el.artists[a].name || '').toLowerCase();
                            for (var w2 = 0; w2 < explicitWords.length; w2++) {
                                if (artistName.includes(explicitWords[w2])) {
                                    isFiltered = true;
                                    debug('>>> ОТФИЛЬТРОВАНО ПО ИСПОЛНИТЕЛЮ "' + explicitWords[w2] + '": ' + (el.title || el.name));
                                    break;
                                }
                            }
                            if (isFiltered) break;
                        }
                    }
                }
                
                // 2. ФИЛЬТРАЦИЯ ПО API ПОЛЯМ (если включена)
                if (!isFiltered && useApiFilter) {
                    // Основные поля explicit
                    if (el.contentWarning === 'explicit' || 
                        el.content_warning === 'explicit' || 
                        el.explicit === true ||
                        el.explicit === 'true' ||
                        el.explicit === 1) {
                        isFiltered = true;
                        debug('>>> ОТФИЛЬТРОВАНО ПО API EXPLICIT: ' + (el.title || el.name));
                    }
                    
                    // Проверка в альбоме
                    if (!isFiltered && el.albums && el.albums.length > 0) {
                        var album = el.albums[0];
                        if (album.contentWarning === 'explicit' || 
                            album.content_warning === 'explicit' || 
                            album.explicit === true ||
                            album.explicit === 'true' ||
                            album.explicit === 1) {
                            isFiltered = true;
                            debug('>>> ОТФИЛЬТРОВАНО ПО API АЛЬБОМ: ' + (el.title || el.name));
                        }
                    }
                    
                    // Проверка explicit меток в названии
                    if (!isFiltered) {
                        var titleLower = (el.title || el.name || '').toLowerCase();
                        if (titleLower.includes('[explicit]') || titleLower.includes('(explicit)') || titleLower.includes('18+')) {
                            isFiltered = true;
                            debug('>>> ОТФИЛЬТРОВАНО ПО API МЕТКЕ: ' + (el.title || el.name));
                        }
                    }
                }
                
                if (isFiltered) {
                    filteredCount++;
                    return;
                }
            }

            var isArtist = (el.type === 'artist');
            var isAlbum = (el.type === 'album');
            var isPlaylist = (el.type === 'playlist' || el.kind === 'playlist' || (el.owner && el.tracks));
            var isPodcast = (el.metaType === 'podcast' || el.type === 'podcast');
            var isGenre = (el.type === 'genre');
            var id = String(el.id);
            
            // Для треков в альбоме используем displayTitle, для альбомов - displayTitle, иначе обычное название
            var name;
            if (isAlbumView && !isArtist && !isAlbum && el.displayTitle) {
                // Трек в альбоме с нумерацией и длительностью
                name = el.displayTitle;
            } else if (isAlbum && el.displayTitle) {
                // Альбом с годом
                name = el.displayTitle;
            } else {
                // Обычное название
                name = el.name || el.title;
            }
            
            var desc = '';

            if (isArtist) {
                desc = 'Исполнитель';
            } else if (isPodcast) {
                // Для подкастов показываем количество эпизодов
                if (el.trackCount) {
                    desc = el.trackCount + ' эпизодов';
                } else {
                    desc = 'Подкаст';
                }
            } else if (isAlbum) {
                // Для альбомов показываем количество песен
                desc = el.yearText || 'Альбом';
            } else if (isPlaylist) {
                // Для плейлистов показываем количество треков и автора
                var trackCount = '';
                if (el.trackCount) {
                    trackCount = el.trackCount + ' треков';
                } else if (el.tracks && el.tracks.length) {
                    trackCount = el.tracks.length + ' треков';
                }
                
                var owner = '';
                if (el.owner && el.owner.name) {
                    owner = el.owner.name;
                } else if (el.owner && el.owner.login) {
                    owner = el.owner.login;
                }
                
                if (trackCount && owner) {
                    desc = trackCount + ' • ' + owner;
                } else if (trackCount) {
                    desc = trackCount;
                } else if (owner) {
                    desc = 'Плейлист • ' + owner;
                } else {
                    desc = 'Плейлист';
                }
            } else {
                // Для треков показываем исполнителей
                if (isAlbumView) {
                    // В режиме альбома не показываем исполнителей в описании (они и так понятны)
                    desc = '';
                } else {
                    desc = el.artists ? el.artists.map(function(a){return a.name}).join(', ') : 'Unknown';
                }
            }

            var item = Lampa.Template.get('ym_item', { name: name, artist: desc });
            item.attr('data-id', id);
            item.find('img').attr('src', YM_API.getImg(el, '400x400'));

            if (isArtist) item.addClass('ym-type-artist');
            if (isAlbum) item.addClass('ym-type-album');
            if (isPlaylist) item.addClass('ym-type-playlist');
            if (isPodcast) item.addClass('ym-type-podcast');
            if (isGenre) item.addClass('ym-type-genre');
            
            // Добавляем специальный класс для треков в альбоме
            if (isAlbumView && !isArtist && !isAlbum && !isPlaylist && !isPodcast && !isGenre) {
                item.addClass('ym-type-album-track');
                item.find('.ym-name').addClass('album-track');
            }
            if (el.is_liked) item.append('<div class="ym-card-fav">♥</div>');
            if (!isArtist && !isAlbum && !isPlaylist && !isPodcast && !isGenre && String(window.ym_active_id) === id) item.addClass('active-playing');

            item.on('hover:focus', function() { 
                last_focused = item[0]; 
                scroll.update(item, true);
                
                // Показываем tooltip с полным названием если текст не помещается
                // Добавляем защиту от повторных вызовов
                if (item.data('tooltip-processing')) return;
                item.data('tooltip-processing', true);
                
                setTimeout(function() {
                    // Проверяем что элемент все еще в фокусе
                    if (!item.hasClass('focus')) {
                        item.removeData('tooltip-processing');
                        return;
                    }
                    
                    var nameEl = item.find('.ym-name')[0];
                    var artistEl = item.find('.ym-artist')[0];
                    
                    // Проверяем, нужен ли tooltip (улучшенная логика)
                    var needTooltip = false;
                    var tooltipText = '';
                    
                    // Проверяем название
                    if (nameEl && nameEl.scrollWidth > nameEl.clientWidth) {
                        needTooltip = true;
                    }
                    
                    // Проверяем описание/исполнителя
                    if (artistEl && artistEl.scrollWidth > artistEl.clientWidth) {
                        needTooltip = true;
                    }
                    
                    // Формируем текст tooltip в зависимости от типа карточки
                    if (needTooltip) {
                        var nameText = nameEl ? $(nameEl).text().trim() : '';
                        var artistText = artistEl ? $(artistEl).text().trim() : '';
                        
                        if (artistText && nameText) {
                            tooltipText = artistText + ' - ' + nameText;
                        } else if (nameText) {
                            tooltipText = nameText;
                        } else if (artistText) {
                            tooltipText = artistText;
                        }
                    }
                    
                    if (needTooltip && tooltipText && item.hasClass('focus')) {
                        // Убираем старый tooltip если есть
                        if (window.ym_tooltip) {
                            window.ym_tooltip.remove();
                            window.ym_tooltip = null;
                        }
                        
                        // Создаем tooltip с улучшенным текстом
                        window.ym_tooltip = $('<div class="ym-tooltip">' + tooltipText + '</div>');
                        $('body').append(window.ym_tooltip);
                        
                        var rect = item[0].getBoundingClientRect();
                        var tooltipWidth = window.ym_tooltip.outerWidth();
                        var tooltipHeight = window.ym_tooltip.outerHeight();
                        
                        // Позиционируем tooltip СНИЗУ карточки, поверх текста
                        var left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                        var top = rect.bottom - tooltipHeight - 10; // Снизу карточки, поверх текста
                        
                        // Проверяем границы экрана по горизонтали
                        if (left < 10) left = 10;
                        if (left + tooltipWidth > window.innerWidth - 10) {
                            left = window.innerWidth - tooltipWidth - 10;
                        }
                        
                        window.ym_tooltip.css({
                            left: left + 'px',
                            top: top + 'px'
                        });
                        
                        // Показываем tooltip только если элемент все еще в фокусе
                        setTimeout(function() {
                            if (window.ym_tooltip && item.hasClass('focus')) {
                                window.ym_tooltip.addClass('show');
                            }
                        }, 100); // Уменьшили задержку
                    }
                    
                    item.removeData('tooltip-processing');
                }, 200); // Увеличили задержку для стабильности
                
                // АВТОПОДГРУЗКА ВОЛНЫ: только в разделе "Моя волна" и НЕ в специальных режимах
                if (current_cat === 'wave' && !window.ym_search_mode && !artist_mode && !album_mode && !playlist_mode && !genre_list_mode && !genre_content_mode && !window.ym_is_loading_more && canLoadWave()) {
                    var index = item.index();
                    var totalTracks = window.ym_tracks_list.length;
                    var remainingTracks = totalTracks - index - 1;
                    
                    // Подгружаем новые треки, когда остается 2 трека
                    if (remainingTracks <= 2) {
                        debug('🔄 Автоподгрузка: осталось ' + remainingTracks + ' треков из ' + totalTracks);
                        self.loadWave(false);
                    }
                } else if (current_cat === 'wave') {
                    debug('🚫 Автоподгрузка при hover ЗАБЛОКИРОВАНА');
                }
            }).on('hover:enter', function() { 
                if (isArtist) {
                    Lampa.Activity.push({
                        title: name,
                        component: 'yandex_music',
                        artist_id: id,
                        artist_name: name, // Передаем имя исполнителя
                        page: 1
                    });
                } else if (isAlbum || isPodcast) {
                    // Для альбомов добавляем исполнителя в заголовок если есть
                    var fullTitle = name;
                    if (isAlbum && el.artists && el.artists.length > 0) {
                        var artistName = el.artists[0].name;
                        fullTitle = artistName + ' - ' + name;
                    }
                    
                    Lampa.Activity.push({
                        title: fullTitle,
                        component: 'yandex_music',
                        album_id: id,
                        page: 1
                    });
                } else if (isPlaylist) {
                    // Обработка плейлистов - улучшенная версия
                    debug('🎵 Клик по плейлисту: ' + name, true);
                    debug('🔍 Данные плейлиста: ' + JSON.stringify(el, null, 2), true);
                    
                    var playlistOwner = '';
                    var playlistKind = '';
                    
                    // Специальная обработка для плейлистов жанров в формате uid:kind
                    if (el.id && el.id.indexOf(':') > -1) {
                        var parts = el.id.split(':');
                        if (parts.length === 2) {
                            playlistOwner = parts[0];
                            playlistKind = parts[1];
                            debug('🎯 Парсинг uid:kind формата: ' + playlistOwner + ':' + playlistKind, true);
                        }
                    }
                    
                    // Если не удалось распарсить uid:kind, пробуем стандартные поля
                    if (!playlistKind) {
                        if (el.kind) {
                            playlistKind = el.kind;
                        } else if (el.id) {
                            playlistKind = el.id;
                        }
                    }
                    
                    // Если не удалось получить владельца из uid:kind, пробуем стандартные поля
                    if (!playlistOwner) {
                        if (el.owner && el.owner.uid) {
                            playlistOwner = el.owner.uid;
                        } else if (el.owner && el.owner.login) {
                            playlistOwner = el.owner.login;
                        } else if (el.uid) {
                            playlistOwner = el.uid;
                        } else if (el.owner && el.owner.id) {
                            playlistOwner = el.owner.id;
                        }
                    }
                    
                    debug('🎯 Плейлист ID: ' + playlistKind + ', Владелец: ' + playlistOwner, true);
                    
                    if (!playlistKind) {
                        debug('❌ Не удалось определить ID плейлиста', true);
                        debug('❌ Ошибка: не удалось определить ID плейлиста');
                        return;
                    }
                    
                    if (!playlistOwner) {
                        debug('⚠️ Не удалось определить владельца плейлиста, пробуем без него', true);
                    }
                    
                    Lampa.Activity.push({
                        title: name,
                        component: 'yandex_music',
                        playlist_id: playlistKind,
                        playlist_owner: playlistOwner,
                        page: 1
                    });
                } else if (isGenre) {
                    // Переходим к содержимому жанра с вкладками
                    debug('🎭 Клик по жанру: ' + name + ', ID: ' + id);
                    
                    Lampa.Activity.push({
                        title: 'Жанр: ' + name,
                        component: 'yandex_music',
                        genre_name: name,
                        genre_tab: 'playlists', // По умолчанию открываем подборки
                        page: 1
                    });
                } else if (el.type === 'track' || (!isArtist && !isAlbum && !isPlaylist && !isPodcast && !isGenre && el.id && (el.artists || el.title))) {
                    // Воспроизводим только если это точно трек
                    window.ym_player.play(el); 
                } else {
                    // Для всех остальных типов (жанры, категории и т.д.) ничего не делаем
                    debug('Клик по неподдерживаемому типу элемента: ' + (el.type || 'unknown'));
                }
            }).on('hover:long', function() {
                var menu = [];

                if (isArtist) {
                    menu.push({ title: 'Показать альбомы', action: 'albums' });
                } else if (!isAlbum) {
                    menu.push({ title: 'Перейти к артисту', action: 'artist' });
                }

                if (menu.length === 0) return;

                Lampa.Select.show({
                    title: name,
                    items: menu,
                    onSelect: function(a) {
                        if (a.action === 'artist' && el.artists && el.artists.length) {
                            Lampa.Activity.push({
                                title: el.artists[0].name,
                                component: 'yandex_music',
                                artist_id: el.artists[0].id,
                                artist_name: el.artists[0].name, // Передаем имя исполнителя
                                page: 1
                            });
                        } else if (a.action === 'albums' && isArtist) {
                            YM_API.getArtistAlbums(id, function(albums) {
                                if (albums.length) {
                                    albums.forEach(function(a) { a.type = 'album'; });
                                    self.activity.loader(true);
                                    body.empty();
                                    window.ym_tracks_list = [];
                                    self.build(albums);
                                } else {
                                    debug('У артиста нет альбомов');
                                }
                            });
                        }
                    }
                });
            });

            body.append(item);
        });

        // Показываем информацию о фильтрации
        debug('=== РЕЗУЛЬТАТ ФИЛЬТРАЦИИ ===');
        debug('Режим: ' + filterMode);
        debug('Отфильтровано треков: ' + filteredCount);
        debug('Показано треков: ' + (data.length - filteredCount));
        
        if ((useWordsFilter || useApiFilter) && filteredCount > 0) {
            debug('Отфильтровано explicit треков: ' + filteredCount, true);
        } else if ((useWordsFilter || useApiFilter) && filteredCount === 0) {
            debug('Explicit треки не найдены', true);
        }

        // Добавляем индикатор загрузки для волны при подгрузке
        if (append && current_cat && current_cat === 'wave') {
            var loadingIndicator = $('<div class="ym-loading-more"><div class="ym-loading-spinner">🔄</div><div class="ym-loading-text">Загружаем еще треки...</div></div>');
            body.append(loadingIndicator);
            
            // Убираем индикатор через 2 секунды
            setTimeout(function() {
                loadingIndicator.fadeOut(500, function() {
                    loadingIndicator.remove();
                });
            }, 2000);
        }

        if (!append) this.finalize();
        else {
            // Сохраняем текущий фокус более надежно
            var currentFocused = $('.selector.focus')[0] || last_focused;
            var focusedIndex = currentFocused ? $(currentFocused).index() : -1;
            
            Lampa.Controller.collectionSet(html);
            
            // Восстанавливаем фокус с улучшенной логикой
            setTimeout(function() {
                var targetElement = null;
                
                // Пробуем восстановить по индексу
                if (focusedIndex >= 0) {
                    var allSelectors = html.find('.selector');
                    if (focusedIndex < allSelectors.length) {
                        targetElement = allSelectors[focusedIndex];
                    }
                }
                
                // Если не получилось по индексу, используем сохраненный элемент
                if (!targetElement && currentFocused) {
                    targetElement = currentFocused;
                }
                
                // Если все еще не нашли, берем последний элемент
                if (!targetElement) {
                    targetElement = html.find('.selector').last()[0];
                }
                
                if (targetElement) {
                    try {
                        Lampa.Controller.collectionFocus(targetElement, html);
                        last_focused = targetElement;
                    } catch(e) {
                        debug('⚠️ Не удалось восстановить фокус: ' + e.message);
                    }
                }
            }, 100); // Увеличили задержку
        }
    };

    this.loadDiscoverSection = function() {
        var self = this;
        var currentSection = Lampa.Storage.get('ym_discover_section', 'new_releases');
        debug('🔍 Загружаем раздел обзора: ' + currentSection);
        
        switch (currentSection) {
            case 'new_releases':
                // Используем endpoint для новых релизов с обязательным параметром blocks
                YM_API.req('https://api.music.yandex.net/landing3?blocks=new-releases', function(res) {
                    if (res.result && res.result.blocks && res.result.blocks.length > 0) {
                        var block = res.result.blocks[0];
                        if (block.entities && block.entities.length > 0) {
                            // Извлекаем данные альбомов из entities
                            var albums = block.entities.map(function(entity) {
                                if (entity.data) {
                                    var album = entity.data;
                                    album.type = 'album'; // Добавляем тип
                                    return album;
                                }
                                return entity;
                            });
                            window.ym_tracks_list = albums;
                            self.build(albums);
                            showStatus('🆕 Загружено новинок: ' + albums.length);
                        } else {
                            self.loadNewReleasesFallback();
                        }
                    } else {
                        self.loadNewReleasesFallback();
                    }
                }, function() {
                    self.loadNewReleasesFallback();
                });
                break;
                
            case 'new_playlists':
                // Пробуем несколько методов для получения большего количества плейлистов
                debug('🔄 Вызываем loadNewPlaylistsWithPagination...', true);
                debug('🔄 Запуск расширенной загрузки плейлистов...');
                self.loadNewPlaylistsWithPagination();
                break;
                
            case 'liked_artists':
                YM_API.getUserId(function(uid) {
                    if (!uid) {
                        self.empty('Ошибка получения UserID');
                        return;
                    }
                    
                    debug('👨‍🎤 Загружаем любимых исполнителей для пользователя: ' + uid);
                    
                    // Пробуем основной endpoint
                    YM_API.req('https://api.music.yandex.net/users/' + uid + '/likes/artists', function(res) {
                        debug('👨‍🎤 Ответ API любимых исполнителей: ' + JSON.stringify(res).substring(0, 500));
                        
                        var artists = [];
                        
                        if (res.result && res.result.library && res.result.library.artists) {
                            artists = res.result.library.artists.map(function(item) { 
                                var artist = item.artist || item;
                                artist.type = 'artist';
                                return artist;
                            });
                        } else if (res.result && res.result.artists) {
                            artists = res.result.artists.map(function(artist) {
                                artist.type = 'artist';
                                return artist;
                            });
                        } else if (res.result && Array.isArray(res.result)) {
                            artists = res.result.map(function(item) {
                                var artist = item.artist || item;
                                artist.type = 'artist';
                                return artist;
                            });
                        }
                        
                        if (artists.length > 0) {
                            window.ym_tracks_list = artists;
                            self.build(artists);
                            showStatus('👨‍🎤 Загружено исполнителей: ' + artists.length);
                        } else {
                            // Fallback - пробуем альтернативный endpoint
                            debug('⚠️ Основной endpoint не дал результатов, пробуем альтернативный...');
                            YM_API.req('https://api.music.yandex.net/users/' + uid + '/likes/artists?rich=true', function(res2) {
                                debug('👨‍🎤 Ответ альтернативного API: ' + JSON.stringify(res2).substring(0, 500));
                                
                                var altArtists = [];
                                if (res2.result && res2.result.library && res2.result.library.artists) {
                                    altArtists = res2.result.library.artists.map(function(item) { 
                                        var artist = item.artist || item;
                                        artist.type = 'artist';
                                        return artist;
                                    });
                                }
                                
                                if (altArtists.length > 0) {
                                    window.ym_tracks_list = altArtists;
                                    self.build(altArtists);
                                    debug('👨‍🎤 Загружено исполнителей (alt): ' + altArtists.length);
                                } else {
                                    self.empty('Любимые исполнители не найдены');
                                }
                            }, function() {
                                self.empty('Ошибка загрузки исполнителей (альтернативный метод)');
                            });
                        }
                    }, function() {
                        debug('❌ Ошибка основного endpoint, пробуем альтернативный...');
                        // Fallback при сетевой ошибке
                        YM_API.req('https://api.music.yandex.net/users/' + uid + '/likes/artists?rich=true', function(res2) {
                            var altArtists = [];
                            if (res2.result && res2.result.library && res2.result.library.artists) {
                                altArtists = res2.result.library.artists.map(function(item) { 
                                    var artist = item.artist || item;
                                    artist.type = 'artist';
                                    return artist;
                                });
                            }
                            
                            if (altArtists.length > 0) {
                                window.ym_tracks_list = altArtists;
                                self.build(altArtists);
                                debug('👨‍🎤 Загружено исполнителей (fallback): ' + altArtists.length);
                            } else {
                                self.empty('Любимые исполнители не найдены');
                            }
                        }, function() {
                            self.empty('Ошибка загрузки исполнителей');
                        });
                    });
                });
                break;
                
            case 'genres':
                // Загружаем жанры прямо здесь, без создания новой активности
                debug('🎭 Загружаем жанры в текущей активности');
                self.loadGenresList();
                break;
                
            case 'chart':
                // Загружаем чарт треков
                YM_API.req('https://api.music.yandex.net/landing3/chart', function(res) {
                    if (res.result && res.result.chart && res.result.chart.tracks) {
                        var tracks = res.result.chart.tracks.map(function(item) { 
                            return item.track; 
                        });
                        window.ym_tracks_list = tracks;
                        self.build(tracks);
                        showStatus('📊 Загружено треков чарта: ' + tracks.length);
                    } else {
                        self.empty('Чарт не найден');
                    }
                }, function() {
                    self.empty('Ошибка загрузки чарта');
                });
                break;
                
            case 'playlist_day':
                // Загружаем плейлист дня (точно тот же код, что был в основной логике)
                debug('📅 Загружаем плейлист дня');
                YM_API.req('https://api.music.yandex.net/feed', function(res){
                    var pl = null;
                    if(res.result && res.result.generatedPlaylists) {
                        pl = res.result.generatedPlaylists.find(function(p){ return p.type === 'playlistOfTheDay'; });
                    }
                    if(pl && pl.data) {
                        YM_API.req('https://api.music.yandex.net/users/'+pl.data.uid+'/playlists/'+pl.data.kind, function(plRes){
                            if(plRes.result && plRes.result.tracks) {
                                var tracks = plRes.result.tracks.map(function(t){ return t.track; });
                                window.ym_tracks_list = tracks;
                                self.build(tracks);
                            } else {
                                self.empty('Ошибка загрузки плейлиста');
                            }
                        });
                    } else {
                        self.empty('Плейлист дня не найден');
                    }
                }, function(){ 
                    self.empty('Ошибка API'); 
                });
                break;
                
            // Новые разделы через cookies
            case 'winter':
            case 'moods':
            case 'activities':
            case 'decades':
            case 'new_videos':
            case 'albums_comments':
            case 'editorial':
            case 'superhits':
            case 'new_hits':
                self.loadThematicCollection(currentSection);
                break;
                
            default:
                self.empty('Неизвестный раздел обзора');
                break;
        }
    };

    // Fallback функция для новых релизов
    this.loadNewReleasesFallback = function() {
        var self = this;
        debug('🔄 Fallback: загружаем новые релизы через поиск');
        
        // Используем поиск по году для получения новых альбомов
        var currentYear = new Date().getFullYear();
        YM_API.req('https://api.music.yandex.net/search?text=' + currentYear + '&type=album&page=0', function(res) {
            if (res.result && res.result.albums && res.result.albums.results) {
                var albums = res.result.albums.results.slice(0, 20); // Берем первые 20
                window.ym_tracks_list = albums;
                self.build(albums);
                debug('🆕 Загружено новинок: ' + albums.length);
            } else {
                self.empty('Новинки не найдены');
            }
        }, function() {
            self.empty('Ошибка загрузки новинок');
        });
    };

    // Функция для попытки загрузки из нескольких endpoints
    this.loadWebSectionMultiple = function(urls, sectionName) {
        var self = this;
        var currentIndex = 0;
        
        function tryNextUrl() {
            if (currentIndex >= urls.length) {
                self.empty('Все endpoints для раздела ' + sectionName + ' недоступны');
                return;
            }
            
            var url = urls[currentIndex];
            debug('🔄 Пробуем endpoint ' + (currentIndex + 1) + '/' + urls.length + ': ' + url);
            
            self.loadWebSection(url, sectionName + ' (вариант ' + (currentIndex + 1) + ')', function() {
                // Если не получилось, пробуем следующий
                currentIndex++;
                tryNextUrl();
            });
        }
        
        tryNextUrl();
    };

    // Функция для загрузки тематических коллекций
    this.loadThematicCollection = function(sectionValue) {
        var sectionNames = {
            'winter': 'Зимняя',
            'moods': 'Настроения', 
            'activities': 'Занятия',
            'decades': 'Эпохи',
            'new_videos': 'Новинки клипов',
            'albums_comments': 'Альбомы с комментариями',
            'editorial': 'Выбор редакции',
            'superhits': 'Суперхиты',
            'new_hits': 'Новые хиты'
        };
        
        var sectionName = sectionNames[sectionValue] || 'Тематическая коллекция';
        var url = 'https://music.yandex.ru/handlers/main.jsx';
        
        debug('🎯 Загружаем тематическую коллекцию: ' + sectionName);
        debug('🔗 URL: ' + url);
        
        // Проверяем наличие Session_id с подробной диагностикой
        var sessionId = Lampa.Storage.get('ym_session_id', '');
        var sessionId2 = Lampa.Storage.get('ym_sessionid2', '');
        var yandexUid = Lampa.Storage.get('ym_yandexuid', '');
        var yandexLogin = Lampa.Storage.get('ym_yandex_login', '');
        var lToken = Lampa.Storage.get('ym_l_token', '');
        
        debug('🔍 Диагностика полей:');
        debug('  ym_session_id: ' + (sessionId ? 'ЗАПОЛНЕНО (' + sessionId.length + ' символов)' : 'ПУСТО'));
        debug('  ym_sessionid2: ' + (sessionId2 ? 'ЗАПОЛНЕНО (' + sessionId2.length + ' символов)' : 'ПУСТО'));
        debug('  ym_yandexuid: ' + (yandexUid ? 'ЗАПОЛНЕНО' : 'ПУСТО'));
        debug('  ym_yandex_login: ' + (yandexLogin ? 'ЗАПОЛНЕНО' : 'ПУСТО'));
        debug('  ym_l_token: ' + (lToken ? 'ЗАПОЛНЕНО (' + lToken.length + ' символов)' : 'ПУСТО'));
        
        var hasSessionId = sessionId || sessionId2;
        
        if (!hasSessionId) {
            debug('❌ Session_id не найден в настройках');
            debug('❌ Поля ym_session_id и ym_sessionid2 пусты');
            this.showThematicCollectionMessage(sectionValue);
            return;
        }
        
        debug('✅ Session_id найден, загружаем коллекцию');
        
        var self = this;
        
        YM_API.req(url, function(res) {
            debug('✅ Получен JSON ответ для ' + sectionName + ': ' + (res ? JSON.stringify(res).length : 0) + ' символов');
            
            try {
                // Работаем с JSON ответом напрямую
                var jsonData = res;
                
                if (jsonData && jsonData.blocks) {
                    var playlists = [];
                    
                    jsonData.blocks.forEach(function(block) {
                        // Ищем блок с плейлистами
                        if (block.type === 'new-playlists' && block.entities) {
                            debug('✅ Найден блок new-playlists с ' + block.entities.length + ' элементами');
                            block.entities.forEach(function(entity) {
                                if (entity && entity.type === 'playlist' && entity.data) {
                                    playlists.push(entity.data);
                                }
                            });
                        }
                    });
                    
                    if (playlists.length > 0) {
                        window.ym_tracks_list = playlists;
                        self.build(playlists);
                        showStatus('✅ ' + sectionName + ': загружено ' + playlists.length + ' плейлистов');
                    } else {
                        debug('⚠️ Блоки найдены, но плейлисты не извлечены');
                        self.empty('Плейлисты не найдены в коллекции ' + sectionName);
                    }
                } else {
                    debug('❌ JSON ответ не содержит блоков');
                    self.empty('Не удалось загрузить коллекцию ' + sectionName);
                }
            } catch (e) {
                console.error('[YM] Ошибка обработки тематической коллекции:', e);
                self.empty('Ошибка обработки коллекции ' + sectionName + ': ' + e.message);
            }
        }, function(error) {
            console.error('[YM] Ошибка загрузки тематической коллекции:', error);
            debug('❌ Ошибка загрузки HTML: ' + error);
            self.showThematicCollectionMessage(sectionValue);
        });
    };

    // Функция для извлечения JSON из HTML
    this.extractJsonFromHtml = function(html) {
        try {
            debug('🔍 Извлекаем JSON из HTML (' + html.length + ' символов)');
            
            // Ищем JSON данные в различных форматах
            var patterns = [
                // Основные паттерны Яндекса
                /window\.__INITIAL_STATE__\s*=\s*({.+?});?\s*<\/script>/s,
                /window\.__DATA__\s*=\s*({.+?});?\s*<\/script>/s,
                /window\.__PRELOADED_STATE__\s*=\s*({.+?});?\s*<\/script>/s,
                
                // Новый паттерн для __STATE_SNAPSHOT__ (Next.js)
                /window\.__STATE_SNAPSHOT__\s*=\s*window\.__STATE_SNAPSHOT__\s*\|\|\s*\[\]\)\.push\(({.+?})\);?\s*<\/script>/s,
                
                // Поиск блоков с плейлистами
                /"blocks":\s*\[[\s\S]*?"type":\s*"playlist"[\s\S]*?\]/,
                
                // Поиск любых больших JSON объектов
                /{[\s\S]*?"blocks"[\s\S]*?"entities"[\s\S]*?}/
            ];
            
            for (var i = 0; i < patterns.length; i++) {
                debug('🔍 Пробуем паттерн ' + (i + 1));
                var match = html.match(patterns[i]);
                if (match) {
                    try {
                        var jsonStr = match[1] || match[0];
                        debug('✅ Найден JSON, размер: ' + jsonStr.length);
                        
                        var parsed = JSON.parse(jsonStr);
                        
                        // Проверяем, что это нужные нам данные
                        if (parsed.blocks || (parsed.main && parsed.main.blocks)) {
                            debug('✅ JSON содержит блоки');
                            return parsed.blocks ? parsed : parsed.main;
                        }
                        
                        // Для __STATE_SNAPSHOT__ ищем данные в другой структуре
                        if (parsed.landing || parsed.page || parsed.data) {
                            debug('✅ JSON содержит данные страницы');
                            
                            // Пробуем найти блоки в разных местах
                            var landingData = parsed.landing || parsed.page || parsed.data;
                            if (landingData.blocks) {
                                return landingData;
                            }
                            
                            // Если есть вложенные данные
                            if (landingData.data && landingData.data.blocks) {
                                return landingData.data;
                            }
                        }
                        
                    } catch (e) {
                        debug('❌ Ошибка парсинга JSON паттерна ' + (i + 1) + ': ' + e.message);
                        continue;
                    }
                }
            }
            
            // Специальный поиск для __STATE_SNAPSHOT__ массивов
            debug('🔍 Ищем __STATE_SNAPSHOT__ массивы');
            var stateSnapshotMatches = html.match(/window\.__STATE_SNAPSHOT__[^}]+push\(({.+?})\)/g);
            if (stateSnapshotMatches && stateSnapshotMatches.length > 0) {
                debug('✅ Найдено ' + stateSnapshotMatches.length + ' __STATE_SNAPSHOT__ записей');
                
                for (var j = 0; j < stateSnapshotMatches.length; j++) {
                    try {
                        var snapshotMatch = stateSnapshotMatches[j].match(/push\(({.+})\)/);
                        if (snapshotMatch) {
                            var snapshotData = JSON.parse(snapshotMatch[1]);
                            debug('✅ Парсим snapshot ' + (j + 1) + ': ' + JSON.stringify(snapshotData).length + ' символов');
                            
                            // Возвращаем любые данные из snapshot
                            if (snapshotData) {
                                debug('✅ Возвращаем данные из snapshot ' + (j + 1));
                                return snapshotData;
                            }
                        }
                    } catch (e) {
                        debug('❌ Ошибка парсинга snapshot ' + (j + 1) + ': ' + e.message);
                        continue;
                    }
                }
            }
            
            // Если ничего не найдено, пробуем найти хотя бы упоминания плейлистов
            if (html.includes('"type":"playlist"')) {
                debug('⚠️ Найдены упоминания плейлистов, но не удалось извлечь структурированные данные');
                
                // Пробуем извлечь отдельные плейлисты
                var playlistMatches = html.match(/"type":"playlist"[^}]*}/g);
                if (playlistMatches && playlistMatches.length > 0) {
                    debug('✅ Найдено ' + playlistMatches.length + ' упоминаний плейлистов');
                    // Возвращаем фейковую структуру для дальнейшей обработки
                    return {
                        blocks: [{
                            entities: playlistMatches.map(function(match) {
                                try {
                                    return { type: 'playlist', data: JSON.parse('{' + match + '}') };
                                } catch (e) {
                                    return null;
                                }
                            }).filter(function(item) { return item !== null; })
                        }]
                    };
                }
            }
            
            debug('❌ JSON данные не найдены');
            return null;
            
        } catch (e) {
            debug('❌ Ошибка извлечения JSON из HTML: ' + e.message);
            return null;
        }
    };

    // Функция для показа сообщения о тематических коллекциях
    this.showThematicCollectionMessage = function(sectionValue) {
        var sectionNames = {
            'winter': 'Зимняя',
            'moods': 'Настроения', 
            'activities': 'Занятия',
            'decades': 'Эпохи',
            'new_videos': 'Новинки клипов',
            'albums_comments': 'Альбомы с комментариями',
            'editorial': 'Выбор редакции',
            'superhits': 'Суперхиты',
            'new_hits': 'Новые хиты'
        };
        
        var sectionName = sectionNames[sectionValue] || 'Тематическая коллекция';
        
        // Проверяем, какие поля заполнены
        var sessionId = Lampa.Storage.get('ym_session_id', '');
        var sessionId2 = Lampa.Storage.get('ym_sessionid2', '');
        var yandexUid = Lampa.Storage.get('ym_yandexuid', '');
        var yandexLogin = Lampa.Storage.get('ym_yandex_login', '');
        var lToken = Lampa.Storage.get('ym_l_token', '');
        
        var filledFields = [];
        var missingFields = [];
        
        if (sessionId) filledFields.push('Session_id'); else missingFields.push('Session_id');
        if (sessionId2) filledFields.push('sessionid2'); else missingFields.push('sessionid2');
        if (yandexUid) filledFields.push('yandexuid'); else missingFields.push('yandexuid');
        if (yandexLogin) filledFields.push('yandex_login'); else missingFields.push('yandex_login');
        if (lToken) filledFields.push('L токен'); else missingFields.push('L токен');
        
        var message = 'Раздел "' + sectionName + '" требует авторизации через Session_id.\n\n';
        
        if (filledFields.length > 0) {
            message += '✅ Заполненные поля: ' + filledFields.join(', ') + '\n';
        }
        
        if (missingFields.length > 0) {
            message += '❌ Отсутствующие поля: ' + missingFields.join(', ') + '\n\n';
        }
        
        if (!sessionId && !sessionId2) {
            message += '🔑 КРИТИЧНО: Нужен хотя бы один из Session_id или sessionid2!\n\n';
        }
        
        message += 'Для доступа к официальным тематическим коллекциям:\n' +
                  '1. Войдите в аккаунт на music.yandex.ru\n' +
                  '2. Установите расширение Cookie-Editor для Chrome\n' +
                  '3. Скопируйте cookies и заполните поля:\n' +
                  '   • Session_id (ОБЯЗАТЕЛЬНО)\n' +
                  '   • yandexuid (ОБЯЗАТЕЛЬНО)\n' +
                  '   • yandex_login (ОБЯЗАТЕЛЬНО)\n' +
                  '   • L токен (ОБЯЗАТЕЛЬНО)\n' +
                  '   • sessionid2 (если есть)\n\n' +
                  '💡 Вводите ТОЛЬКО значения без названий параметров\n' +
                  '   Например: 3:1769871915.5.0.1763877145196:zC0dTg...\n' +
                  '   НЕ: Session_id=3:1769871915.5.0.1763877145196:zC0dTg...';
        
        this.empty(message);
        showStatus('❄️ ' + sectionName + ': требуется Session_id для доступа к коллекциям', true);
    };

    // Функция для загрузки разделов через cookies
    this.loadWebSection = function(url, sectionName, onError) {
        var self = this;
        debug('🍪 Загружаем раздел через cookies: ' + sectionName);
        debug('🔗 URL: ' + url);
        
        // Проверяем наличие cookies
        var cookies = Lampa.Storage.get('ym_cookies', '');
        if (!cookies) {
            self.empty('Для доступа к разделу "' + sectionName + '" необходимо добавить cookies в настройках');
            return;
        }
        
        debug('🍪 Cookies найдены, длина: ' + cookies.length);
        
        YM_API.web(url, function(data) {
            debug('✅ Получен ответ от сервера для ' + sectionName);
            debug('📄 Тип данных: ' + typeof data);
            debug('📄 Данные: ' + (data ? JSON.stringify(data).substring(0, 200) : 'null/undefined') + '...');
            
            try {
                // Проверяем, что данные не пустые
                if (!data) {
                    debug('❌ Пустой ответ от сервера');
                    if (onError) {
                        onError(); // Вызываем callback для попытки следующего endpoint
                    } else {
                        self.empty('Раздел ' + sectionName + ' пуст или недоступен');
                    }
                    return;
                }
                
                var playlists = [];
                
                // Парсим ответ и извлекаем плейлисты
                if (data && data.blocks) {
                    debug('📦 Найдено блоков: ' + data.blocks.length);
                    data.blocks.forEach(function(block, blockIndex) {
                        debug('📦 Блок ' + blockIndex + ': ' + (block.type || 'unknown') + ' - ' + (block.title || 'без названия'));
                        if (block.entities) {
                            debug('📦 Entities в блоке ' + blockIndex + ': ' + block.entities.length);
                            block.entities.forEach(function(entity, entityIndex) {
                                if (entity && entity.type === 'playlist' && entity.data) {
                                    debug('📄 Entity ' + entityIndex + ' type: ' + entity.type + ' - ' + (entity.data.title || 'без названия'));
                                    var playlist = entity.data;
                                    playlist.type = 'playlist';
                                    playlists.push(playlist);
                                }
                            });
                        }
                    });
                } else if (data && data.entities) {
                    // Возможно, данные в другом формате
                    debug('📦 Найдены entities напрямую: ' + data.entities.length);
                    data.entities.forEach(function(entity) {
                        if (entity && entity.type === 'playlist') {
                            playlists.push(entity);
                        }
                    });
                } else {
                    debug('❌ Неизвестный формат данных');
                    debug('📄 Структура данных: ' + Object.keys(data || {}).join(', '));
                }
                
                debug('🎵 Найдено плейлистов: ' + playlists.length);
                
                if (playlists.length > 0) {
                    window.ym_tracks_list = playlists;
                    self.build(playlists);
                    showStatus('🍪 ' + sectionName + ': загружено ' + playlists.length + ' плейлистов');
                } else {
                    // Показываем структуру данных для отладки
                    var dataStructure = data ? Object.keys(data).join(', ') : 'нет данных';
                    debug('❌ Плейлисты не найдены. Структура: ' + dataStructure);
                    
                    if (onError) {
                        onError();
                    } else {
                        self.empty('Плейлисты не найдены в разделе ' + sectionName + '. Структура: ' + dataStructure);
                    }
                }
            } catch (e) {
                console.error('[YM] Ошибка парсинга данных:', e);
                debug('❌ Ошибка парсинга: ' + e.message);
                
                if (onError) {
                    onError();
                } else {
                    self.empty('Ошибка обработки данных: ' + e.message);
                }
            }
        }, function(error) {
            console.error('[YM] Ошибка загрузки раздела:', error);
            debug('❌ Ошибка загрузки: ' + (typeof error === 'object' ? JSON.stringify(error) : error));
            
            var errorMessage = 'Неизвестная ошибка';
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && error.message) {
                errorMessage = error.message;
            } else if (error && error.status) {
                errorMessage = 'HTTP ' + error.status;
            }
            
            if (onError) {
                onError();
            } else {
                self.empty('Ошибка загрузки раздела ' + sectionName + ': ' + errorMessage);
            }
        });
    };

    // Fallback функция для жанров
    this.loadGenresFallback = function() {
        var self = this;
        debug('🔄 Fallback: загружаем популярные жанры');
        
        // Популярные жанры
        var popularGenres = [
            { id: 'pop', title: 'Поп', name: 'Поп', type: 'genre' },
            { id: 'rock', title: 'Рок', name: 'Рок', type: 'genre' },
            { id: 'electronic', title: 'Электронная', name: 'Электронная', type: 'genre' },
            { id: 'dance', title: 'Танцевальная', name: 'Танцевальная', type: 'genre' },
            { id: 'hip-hop', title: 'Хип-хоп', name: 'Хип-хоп', type: 'genre' },
            { id: 'jazz', title: 'Джаз', name: 'Джаз', type: 'genre' },
            { id: 'classical', title: 'Классическая', name: 'Классическая', type: 'genre' },
            { id: 'alternative', title: 'Альтернатива', name: 'Альтернатива', type: 'genre' },
            { id: 'indie', title: 'Инди', name: 'Инди', type: 'genre' },
            { id: 'metal', title: 'Метал', name: 'Метал', type: 'genre' },
            { id: 'blues', title: 'Блюз', name: 'Блюз', type: 'genre' },
            { id: 'country', title: 'Кантри', name: 'Кантри', type: 'genre' },
            { id: 'reggae', title: 'Регги', name: 'Регги', type: 'genre' },
            { id: 'folk', title: 'Фолк', name: 'Фолк', type: 'genre' },
            { id: 'funk', title: 'Фанк', name: 'Фанк', type: 'genre' },
            { id: 'r&b', title: 'R&B', name: 'R&B', type: 'genre' }
        ];
        
        window.ym_tracks_list = popularGenres;
        self.build(popularGenres);
        
        // ИСПРАВЛЕНИЕ: Завершаем загрузку в fallback
        self.activity.loader(false);
        
        debug('🎭 Загружено жанров: ' + popularGenres.length);
    };

    // Функция для загрузки списка жанров в текущей активности
    this.loadGenresList = function() {
        var self = this;
        debug('🎭 Загружаем список жанров');
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Обновляем состояние навигации
        Lampa.Storage.set('ym_discover_section', 'genres');
        current_cat = 'discover'; // Остаемся в режиме discover, но с жанрами
        
        // Очищаем текущий контент
        body.empty();
        
        // Загружаем список жанров через API
        YM_API.req('https://api.music.yandex.net/genres', function(res) {
            debug('🎭 Ответ API жанров получен');
            
            if (res.result && res.result.length) {
                var genres = res.result.map(function(genre) {
                    genre.type = 'genre';
                    return genre;
                });
                debug('🎭 Загружено жанров из API: ' + genres.length);
                window.ym_tracks_list = genres;
                self.build(genres);
                debug('🎭 Загружено жанров: ' + genres.length);
            } else {
                debug('⚠️ API жанров не вернул результат, используем fallback');
                self.loadGenresFallback();
            }
        }, function() {
            debug('❌ Ошибка API жанров, используем fallback');
            self.loadGenresFallback();
        });
    };

    // Fallback функция для подкастов
    this.finalize = function() { 
        // Показываем селектор для всех режимов (включая альбом с навигацией)
        html.append(selector); 
        
        // Добавляем второй ряд кнопок для всех специальных вкладок (всегда, но он может быть скрыт)
        html.append(secondRowSelector);
        
        scroll.append(body); 
        html.append(scroll.render()); 
        
        // Добавляем обработчик прокрутки для автоподгрузки волны
        if (current_cat === 'wave' && !window.ym_search_mode && !artist_mode && !album_mode && !playlist_mode && !genre_list_mode && !genre_content_mode) {
            var self = this;
            scroll.onEnd = function() {
                // КРИТИЧЕСКАЯ ПРОВЕРКА: дозагружаем только если мы все еще в разделе "Моя волна" и НЕ в специальных режимах
                var currentActiveCategory = Lampa.Storage.get('ym_cat', 'wave');
                
                if (!window.ym_is_loading_more && 
                    window.ym_component_instance && 
                    typeof window.ym_component_instance.loadWave === 'function' &&
                    Lampa.Activity.active().component === 'yandex_music' &&
                    currentActiveCategory === 'wave' &&
                    canLoadWave()) {
                    
                    debug('🌊 Дозагрузка волны при скролле');
                    window.ym_component_instance.loadWave(false);
                } else {
                    debug('🚫 Дозагрузка волны при скролле ЗАБЛОКИРОВАНА');
                }
            };
        } else {
            // Для всех остальных разделов убираем обработчик дозагрузки
            scroll.onEnd = null;
        }
        
        this.activity.loader(false); 
        this.activity.toggle(); 
        
        Lampa.Controller.collectionSet(html);
    };

    this.start = function () {
        Lampa.Controller.add('content', {
            toggle: function() { 
                Lampa.Controller.collectionSet(html); 
                Lampa.Controller.collectionFocus(last_focused || html.find('.selector.active')[0] || html.find('.selector')[0], html); 
            },
            left: function() { 
                // Скрываем tooltip при навигации
                if (window.ym_tooltip) {
                    window.ym_tooltip.removeClass('show');
                    setTimeout(function() {
                        if (window.ym_tooltip) {
                            window.ym_tooltip.remove();
                            window.ym_tooltip = null;
                        }
                    }, 200);
                }
                if (Navigator.canmove('left')) Navigator.move('left'); 
                else Lampa.Controller.toggle('menu'); 
            },
            right: function() { 
                // Скрываем tooltip при навигации
                if (window.ym_tooltip) {
                    window.ym_tooltip.removeClass('show');
                    setTimeout(function() {
                        if (window.ym_tooltip) {
                            window.ym_tooltip.remove();
                            window.ym_tooltip = null;
                        }
                    }, 200);
                }
                Navigator.move('right'); 
            },
            up: function() { 
                // Скрываем tooltip при навигации
                if (window.ym_tooltip) {
                    window.ym_tooltip.removeClass('show');
                    setTimeout(function() {
                        if (window.ym_tooltip) {
                            window.ym_tooltip.remove();
                            window.ym_tooltip = null;
                        }
                    }, 200);
                }
                if (Navigator.canmove('up')) Navigator.move('up'); 
                else {
                    // Если мы в самом верху (на кнопках категорий), уходим в Header
                    if(html.find('.ym-net-row .selector.focus').length > 0) {
                        Lampa.Controller.toggle('head');
                    } else {
                        // Если застряли где-то в гриде (редкий кейс), форсируем фокус на кнопки
                        Lampa.Controller.collectionFocus(html.find('.ym-net-row .active')[0], html);
                    }
                } 
            },
            down: function() { 
                // Скрываем tooltip при навигации
                if (window.ym_tooltip) {
                    window.ym_tooltip.removeClass('show');
                    setTimeout(function() {
                        if (window.ym_tooltip) {
                            window.ym_tooltip.remove();
                            window.ym_tooltip = null;
                        }
                    }, 200);
                }
                Navigator.move('down'); 
            },
            back: function() { Lampa.Activity.backward(); }
        });
        Lampa.Controller.toggle('content');
    };

    this.render = function () { return html; };
    this.destroy = function () { 
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Останавливаем все фоновые загрузки при уничтожении компонента
        window.ym_is_loading_more = false;
        debug('🛑 Остановка всех фоновых загрузок - уничтожение компонента');
        
        // Очищаем tooltip
        if (window.ym_tooltip) {
            window.ym_tooltip.remove();
            window.ym_tooltip = null;
        }
        
        scroll.destroy(); 
        html.remove(); 
    };
}

// Функция для тестирования всех прокси-сервисов
function testAllProxyServices() {
    debug('Начинаем тестирование всех прокси-сервисов...', true);
    debug('Тестирование прокси-сервисов...');
    
    var proxyList = [
        { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' },
        { name: 'Cloudflare Workers', url: 'https://cors.bwa.workers.dev/' },
        { name: 'CorsProxy.io', url: 'https://corsproxy.io/?' },
        { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' },
        { name: 'CORS Anywhere', url: 'https://cors-anywhere.herokuapp.com/' }
    ];
    
    var testUrl = 'https://api.music.yandex.net/landing3';
    var results = [];
    var currentIndex = 0;
    
    var testProxy = function(proxy, callback) {
        var startTime = Date.now();
        var finalUrl = proxy.url + encodeURIComponent(testUrl);
        
        debug('Тестируем ' + proxy.name + ': ' + finalUrl);
        
        var net = new (Lampa.Request || Lampa.Reguest)();
        var headers = proxy.url.indexOf('allorigins') > -1 ? {} : { 'Accept': 'application/json' };
        
        net.silent(finalUrl, function(res) {
            var responseTime = Date.now() - startTime;
            if (res && (res.result || res.generated)) {
                debug('✅ ' + proxy.name + ' - РАБОТАЕТ (' + responseTime + 'ms)');
                results.push({
                    name: proxy.name,
                    status: 'OK',
                    time: responseTime,
                    url: proxy.url
                });
            } else {
                debug('❌ ' + proxy.name + ' - НЕ РАБОТАЕТ (пустой ответ)');
                results.push({
                    name: proxy.name,
                    status: 'EMPTY',
                    time: responseTime,
                    url: proxy.url
                });
            }
            callback();
        }, function(error) {
            var responseTime = Date.now() - startTime;
            debug('❌ ' + proxy.name + ' - ОШИБКА СЕТИ (' + responseTime + 'ms)');
            results.push({
                name: proxy.name,
                status: 'ERROR',
                time: responseTime,
                url: proxy.url
            });
            callback();
        }, null, { headers: headers, dataType: 'json', timeout: 10000 });
    };
    
    var testNext = function() {
        if (currentIndex >= proxyList.length) {
            // Показываем результаты
            var message = 'Результаты тестирования прокси-сервисов:\n\n';
            var workingCount = 0;
            
            results.forEach(function(result) {
                var status = result.status === 'OK' ? '✅' : '❌';
                message += status + ' ' + result.name;
                if (result.status === 'OK') {
                    message += ' (' + result.time + 'ms)';
                    workingCount++;
                } else {
                    message += ' - ' + result.status;
                }
                message += '\n';
            });
            
            message += '\nРаботающих прокси: ' + workingCount + '/' + proxyList.length;
            
            if (workingCount === 0) {
                message += '\n\n⚠️ Ни один прокси не работает!';
                message += '\n\n💡 Способы решения:';
                message += '\n1. Режим "Без прокси" + отключить CORS в браузере';
                message += '\n2. Использовать приложение Lampa (не браузер)';
                message += '\n3. Установить расширение для отключения CORS';
                message += '\n\n🔧 Отключение CORS в браузере:';
                message += '\nChrome: --disable-web-security --user-data-dir=/tmp/chrome';
                message += '\nFirefox: about:config → security.tls.insecure_fallback_hosts';
            } else {
                message += '\n\n💡 Рекомендуется режим "Авто (Каскад)"';
            }
            
            debug(message, true);
            debug('Тестирование завершено. Проверьте консоль для подробностей.');
            return;
        }
        
        var proxy = proxyList[currentIndex];
        currentIndex++;
        
        testProxy(proxy, function() {
            setTimeout(testNext, 500); // Небольшая задержка между запросами
        });
    };
    
    testNext();
}

// 7. ЗАПУСК
function startPlugin() {
    if (window.ym_plugin_inited) return; 
    window.ym_plugin_inited = true;

    Lampa.Component.add('yandex_music', YM_Component);

    // Шаблоны и стили регистрируем до создания плеера
    Lampa.Template.add('ym_item', '<div class="selector ym-card"><div class="ym-imgbox"><img onerror="this.src=\'./img/img_broken.svg\'"/></div><div class="ym-desc"><div class="ym-name">{name}</div><div class="ym-artist">{artist}</div></div></div>');

    Lampa.Template.add('ym_player_final', '<div class="ym-pl-widget stop hide">' +
        '<div class="ym-pl-icon-wrap selector"><img class="ym-pl-icon" src="" /><svg class="ym-pl-music-icon" viewBox="0 0 24 24" style="display: block; width: 100%; height: 100%; padding: 8px;"><path fill="white" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>' +
        '<div class="ym-pl-info">' +
            '<div class="ym-pl-title"><div class="ym-pl-title-text"><span>Название трека</span></div></div>' +
            '<div class="ym-pl-track"><div class="ym-pl-time">0:00 / 0:00 | -0:00</div><div class="ym-pl-track-text"><span>...</span></div></div>' +
        '</div>' +
        '<div class="ym-pl-controls">' +
            '<div class="ym-pl-back selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></div>' +
            '<div class="ym-pl-shuffle selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M14.83 13.41L13.42 14.82L16.55 17.95L14.5 20H20V14.5L17.96 16.54L14.83 13.41M14.5 4L16.54 6.04L4 18.59L5.41 20L17.96 7.46L20 9.5V4H14.5M10.59 9.17L5.41 4L4 5.41L9.17 10.58L10.59 9.17Z"/></svg></div>' +
            '<div class="ym-pl-rewind selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M11 6V18L2.5 12M20 18L11.5 12L20 6V18Z"/></svg></div>' +
            '<div class="ym-pl-prev selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M6 6H8V18H6V6M9.5 12L18 6V18L9.5 12Z"/></svg></div>' +
            '<div class="ym-pl-pp selector ym-pl-btn ym-pl-main-btn"><div class="ym-pl-play"><svg viewBox="0 0 24 24"><path fill="white" d="M8 5.14V19.14L19 12.14L8 5.14Z"/></svg></div><div class="ym-pl-pause"><svg viewBox="0 0 24 24"><path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></div></div>' +
            '<div class="ym-pl-next selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M16 18H18V6H16M6 18L14.5 12L6 6V18Z"/></svg></div>' +
            '<div class="ym-pl-forward selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M13 6V18L21.5 12M4 18L12.5 12L4 6V18Z"/></svg></div>' +
            '<div class="ym-pl-repeat selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M17 17H7V14L3 18L7 22V19H19V13H17M7 7H17V10L21 6L17 2V5H5V11H7V7Z"/></svg><span class="ym-repeat-one-badge">1</span></div>' +
            '<div class="ym-pl-fav selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/></svg></div>' +
            '<div class="ym-pl-expand selector ym-pl-btn ym-pl-mini-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M4 11H12.17L8.59 7.41L10 6L16 12L10 18L8.59 16.59L12.17 13H4V11Z"/></svg></div>' +
            '<div class="ym-pl-stop selector ym-pl-btn"><svg viewBox="0 0 24 24"><path fill="white" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/></svg></div>' +
        '</div>' +
        '<div class="ym-progress-bar"><div class="ym-progress-fill"></div></div>' +
    '</div>');

    var styles = '<style>' +
        '.ym-container { height: 100%; display: flex; flex-direction: column; overflow: hidden; }' +
        '.ym-container .scroll { flex: 1; min-height: 0; }' + 
        '.ym-grid { display: flex; flex-wrap: wrap; padding: 10px 30px; justify-content: center; }' +
        '.ym-card { width: 130px; margin: 10px; flex-shrink: 0; position: relative; transition: all 0.2s ease-out; transform-origin: center center; }' +
        '.ym-card.focus { transform: scale(1.1); z-index: 50; }' +
        '.ym-card.focus .ym-imgbox { box-shadow: 0 0 0 4px #f1c40f, 0 10px 20px rgba(0,0,0,0.8); border-radius: 12px; }' +
        '.ym-imgbox { width: 100%; padding-bottom: 100%; position: relative; background: #222; border-radius: 8px; overflow: hidden; }' +
        '.ym-imgbox img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }' +
        '.ym-card-fav { position: absolute; top: 5px; right: 5px; color: #e74c3c; font-size: 1.5em; text-shadow: 0 0 3px #000; z-index: 2; }' +
        '.ym-desc { margin-top: 8px; text-align: center; }' +
        '.ym-name { font-size: 0.85em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; font-weight: 500; position: relative; }' +
        '.ym-name.album-track { font-size: 0.9em; font-family: monospace; }' +
        '.ym-artist { font-size: 0.8em; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; }' +
        '.ym-tooltip { position: absolute; background: rgba(0,0,0,0.9); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 0.9em; white-space: nowrap; z-index: 1000; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }' +
        '.ym-tooltip.show { opacity: 1; }' +
        '@keyframes scroll-text { 0% { transform: translateX(0); } 50% { transform: translateX(calc(-100% + 160px)); } 100% { transform: translateX(0); } }' +
        '@keyframes scroll-left { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }' +
        '.ym-type-album .ym-artist { font-size: 0.75em; line-height: 1.2; white-space: normal; height: 2.4em; overflow: hidden; }' +
        '.ym-card.active-playing .ym-imgbox { outline: 3px solid #e74c3c; }' +
        '.ym-type-artist .ym-imgbox { border-radius: 50%; }' +
        '.ym-type-album .ym-imgbox { border: 2px solid #3498db; }' +
        '.ym-type-playlist .ym-imgbox { border: 2px solid #2ecc71; border-radius: 8px; }' +
        '.ym-type-playlist .ym-artist { font-size: 0.75em; line-height: 1.2; white-space: normal; height: 2.4em; overflow: hidden; }' +
        '.ym-type-podcast .ym-imgbox { border: 2px solid #e67e22; border-radius: 12px; }' +
        '.ym-type-podcast .ym-artist { font-size: 0.75em; line-height: 1.2; white-space: normal; height: 2.4em; overflow: hidden; color: #e67e22; }' +
        '.ym-type-genre .ym-imgbox { border: 2px solid #9b59b6; border-radius: 6px; }' +
        '.ym-type-genre .ym-artist { font-size: 0.75em; line-height: 1.2; white-space: normal; height: 2.4em; overflow: hidden; color: #9b59b6; }' +
        '.ym-net-row { display: flex; padding: 30px 30px 8px; overflow-x: auto; white-space: nowrap; flex-shrink: 0; scrollbar-width: none; }' +
        '.ym-net-row::-webkit-scrollbar { display: none; }' +
        '.ym-net-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: rgba(255,255,255,0.08); border-radius: 50px; margin-right: 12px; font-size: 1.1em; cursor: pointer; color: #ddd; border: 2px solid transparent; flex-shrink: 0; }' +
        '.ym-net-btn img, .ym-net-btn svg { width: 24px; height: 24px; margin-right: 10px; }' +
        '.ym-net-btn.active { background: #fff; color: #222; font-weight: bold; }' +
        '.ym-net-btn.focus { border-color: #f1c40f; transform: scale(1.05); background: rgba(255,255,255,0.2); }' +
        '.ym-search-btn { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: rgba(255,255,255,0.08); border-radius: 50%; margin-right: 12px; cursor: pointer; color: #ddd; border: 2px solid transparent; flex-shrink: 0; margin-top: 2px; }' +
        '.ym-search-btn svg { width: 28px; height: 28px; }' +
        '.ym-search-btn.active { background: #fff; color: #222; }' +
        '.ym-search-btn.focus { border-color: #f1c40f; transform: scale(1.1); background: rgba(255,255,255,0.2); }' +
        '.ym-empty { text-align: center; margin-top: 100px; font-size: 1.5em; color: #aaa; width: 100%; }' +
        '.ym-pl-widget { display: flex; align-items: center; background: rgba(25,25,25,0.95); backdrop-filter: blur(10px); padding: 20px 24px; border-radius: 15px; height: 88px; position: absolute; left: 20px; top: 70%; transform: translateY(-50%); z-index: 1000; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.6); transition: all 0.3s ease; }' +
        '@media (max-width: 1920px) { .ym-pl-widget { max-width: calc(100vw - 120px); } }' +
        '@media (min-width: 1921px) { .ym-pl-widget { max-width: calc(100vw - 200px); } }' +
        '@media (max-width: 1366px) { .ym-pl-widget { max-width: calc(100vw - 100px); } }' +
        '.ym-pl-widget.mini-mode { min-width: 350px !important; max-width: 350px !important; padding: 10px 15px !important; left: 250px !important; right: auto !important; transform: translateY(-50%) !important; }' +
        '.ym-pl-widget.mini-mode .ym-pl-icon-wrap, .ym-pl-widget.mini-mode .ym-pl-info, .ym-pl-widget.mini-mode .ym-pl-visualizer { display: none; }' +
        '.ym-pl-widget.mini-mode .ym-pl-controls { margin: 0; justify-content: center; width: 100%; }' +
        '.ym-pl-widget:not(.mini-mode) .ym-pl-mini-btn { display: none; }' +
        '.ym-pl-widget.mini-mode .ym-pl-btn:not(.ym-pl-prev):not(.ym-pl-pp):not(.ym-pl-next):not(.ym-pl-fav):not(.ym-pl-expand):not(.ym-pl-stop) { display: none; }' +
        '.ym-pl-icon-wrap { width: 44px; height: 44px; margin-right: 10px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }' +
        '.ym-pl-icon { width: 100%; height: 100%; object-fit: cover; }' +
        '.ym-pl-main-row { display: flex; align-items: center; margin-bottom: 15px; }' +
        '.ym-pl-icon-wrap { width: 60px; height: 60px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex-shrink: 0; transition: all 0.2s ease; }' +
        '.ym-pl-icon-wrap.focus { box-shadow: 0 0 0 3px #f1c40f; transform: scale(1.05); }' +
        '.ym-pl-icon { width: 100%; height: 100%; object-fit: cover; }' +
        '.ym-pl-info { min-width: 0; margin-right: 10px; }' +
        '.ym-pl-title { font-size: 1.1em; font-weight: 600; color: #fff; margin-bottom: 5px; }' +
        '.ym-pl-track { font-size: 1.0em; color: #aaa; margin-bottom: 8px; display: flex; align-items: baseline; gap: 10px; }' +
        '.ym-pl-time { font-size: 1.0em !important; color: #999; flex-shrink: 0; }' +
        '.ym-pl-time.paused { animation: blink 1s infinite; }' +
        '@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0.3; } }' +
        '.ym-pl-track-text { flex: 1; min-width: 0; font-size: 1.0em !important; }' +
        '.ym-pl-title-text, .ym-pl-track-text { position: relative; overflow: hidden; white-space: nowrap; }' +
        '.ym-pl-title-text.scrolling span, .ym-pl-track-text.scrolling span { animation: scroll-text 8s linear infinite; }' +
        '.ym-pl-controls { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }' +
        '.ym-pl-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; border: 2px solid transparent; position: relative; }' +
        '.ym-pl-main-btn { width: 50px; height: 50px; background: rgba(255,255,255,0.15); }' +
        '.ym-pl-btn:hover, .ym-pl-btn.focus { transform: scale(1.1); border-color: #f1c40f; }' +
        '.ym-pl-btn svg { width: 20px; height: 20px; }' +
        '.ym-pl-main-btn svg { width: 24px; height: 24px; }' +
        '.ym-pl-btn.active svg path { fill: white; }' +
        '.ym-pl-shuffle.active svg path { fill: #f1c40f !important; }' +
        '.ym-pl-repeat.active svg path { fill: #f1c40f !important; }' +
        '.ym-repeat-one-badge { position: absolute; top: -2px; right: -2px; background: #f1c40f; color: #000; font-size: 10px; font-weight: bold; width: 14px; height: 14px; border-radius: 50%; display: none; align-items: center; justify-content: center; line-height: 1; z-index: 10; }' +
        '.ym-pl-repeat.repeat-one .ym-repeat-one-badge { display: flex; }' +
        '.ym-pl-fav.active { background: rgba(231,76,60,0.2); }' +
        '.ym-pl-fav.active svg path { fill: #e74c3c; }' +
        '.ym-pl-pause { display: none; } .ym-pl-widget:not(.stop) .ym-pl-pause { display: block; } .ym-pl-widget:not(.stop) .ym-pl-play { display: none; }' +
        '.ym-pl-fav.active svg path { fill: #e74c3c !important; }' +
        '.ym-loading-more { text-align: center; padding: 20px; color: #aaa; font-size: 1.1em; }' +
        '.ym-loading-spinner { font-size: 1.5em; margin-bottom: 10px; animation: ym-spin 1s linear infinite; }' +
        '.ym-loading-text { font-size: 0.9em; }' +
        '@keyframes ym-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' +
        '.ym-progress-bar { position: absolute; bottom: 0; left: 20px; right: 20px; width: calc(100% - 40px); height: 4px; background: rgba(255,255,255,0.1); }' +
        '.ym-progress-fill { height: 100%; background: #f1c40f; width: 0%; transition: width 0.1s linear; }' +
        '#ym-overlay-info { position: fixed; z-index: 999999; }' +
        '.ym-pos-bl { bottom: 50px; left: 50px; } .ym-pos-br { bottom: 50px; right: 50px; } .ym-pos-tl { top: 50px; left: 50px; } .ym-pos-tr { top: 50px; right: 50px; }' +
        '.ym-ov-card { display: flex; align-items: center; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 40px rgba(0,0,0,0.5); max-width: 600px; }' +
        '.ym-ov-img-wrap { position: relative; width: 100px; height: 100px; margin-right: 25px; flex-shrink: 0; }' +
        '.ym-ov-img { width: 100%; height: 100%; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); object-fit: cover; }' +
        '.ym-ov-vis-box { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; border-radius: 12px; overflow: hidden; opacity: 0.8; }' +
        '.ym-ov-text { display: flex; flex-direction: column; justify-content: center; }' +
        '.ym-ov-station { font-size: 24px; font-weight: bold; margin-bottom: 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }' +
        '.ym-ov-track { font-size: 18px; color: #ddd; text-shadow: 0 2px 4px rgba(0,0,0,0.8); line-height: 1.3; margin-bottom: 8px; }' +
        '.ym-ov-time { font-size: 14px; color: #bbb; text-shadow: 0 2px 4px rgba(0,0,0,0.8); margin-bottom: 8px; }' +
        '.ym-ov-progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; }' +
        '.ym-ov-progress-fill { height: 100%; background: #f1c40f; width: 0%; transition: width 0.1s linear; }' +
        '</style>';

    $('body').append(styles);

    // Создаем плеер как обычно
    window.ym_player = new YM_Player();
    
    window.ym_overlay = YM_Overlay;
    window.ym_overlay.init();
    
    // Добавляем тестовую функцию в глобальную область
    window.testYMExplicitFilter = testExplicitFilter;

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            var menu_item = $('<li class="menu__item selector" data-action="yandex_music"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div><div class="menu__text">Яндекс Музыка</div></li>');
            menu_item.on('hover:enter', function() { 
                Lampa.Activity.push({ 
                    title: 'Яндекс Музыка', 
                    component: 'yandex_music', 
                    page: 1 
                }); 
            });
            $('.menu .menu__list').eq(0).append(menu_item);

            window.ym_player.create();

            if (Lampa.SettingsApi) {
                var COMP_ID = "ym_settings";
                Lampa.SettingsApi.addComponent({ 
                    component: COMP_ID, 
                    name: "Яндекс Музыка", 
                    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>' 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_token", type: "input", placeholder: "Вставьте OAuth токен из music.yandex.ru", values: "" }, 
                    field: { name: "OAuth Token" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_salt", type: "input", placeholder: "Salt для подписи ссылок на треки", values: "" }, 
                    field: { name: "Salt (подпись MP3)", description: "Нужен для воспроизведения. Без него треки могут не играть." } 
                });
                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_secret_key", type: "input", placeholder: "Секретный ключ API (если требуется)", values: "" }, 
                    field: { name: "Секретный ключ" } 
                });
                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_classic_secret_key", type: "input", placeholder: "Классический секретный ключ (если требуется)", values: "" }, 
                    field: { name: "Классический секретный ключ" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_proxy_mode", type: "select", values: YM_PROXY_MODES, "default": 'cascade' }, 
                    field: { name: "Режим прокси" } 
                });
                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_proxy_custom", type: "input", placeholder: "https://ваш-прокси.com/?url= или ?", values: "" }, 
                    field: { name: "Свой URL прокси", description: "Используется при режиме «Свой URL»" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_test_proxy", type: "trigger" }, 
                    field: { name: "🔧 Тест прокси-сервисов" },
                    onRender: function(item) {
                        item.on('hover:enter', function() {
                            testAllProxyServices();
                        });
                    }
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_filter_explicit", type: "select", values: { 
                        'off': 'Выключено', 
                        'api': 'Через API (строго)', 
                        'words': 'По словам (мягко)', 
                        'both': 'API + слова (максимум)' 
                    }, "default": 'off' }, 
                    field: { name: "Фильтрация 18+" },
                    onChange: function(value) {
                        debug('Настройка фильтрации изменена на: ' + value);
                        // Перезагружаем текущую активность для применения фильтра
                        if (Lampa.Activity.active() && Lampa.Activity.active().component === 'yandex_music') {
                            Lampa.Activity.replace();
                        }
                    }
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_debug", type: "select", values: { 'true': 'Да', 'false': 'Нет' }, "default": 'false' }, 
                    field: { name: "Режим отладки" } 
                });
                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_suppress_jsonp_errors", type: "select", values: { 'true': 'Да', 'false': 'Нет' }, "default": 'false' }, 
                    field: { name: "Скрывать ошибки JSONP в консоли" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_show_on_saver", type: "select", values: { 'true': 'Включено', 'false': 'Выключено' }, "default": 'true' }, 
                    field: { name: "Виджет на заставке" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_vis_type", type: "select", values: YM_VIS_TYPES, "default": 'bars' }, 
                    field: { name: "Визуализация" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_shuffle_mode", type: "select", values: YM_SHUFFLE_MODES, "default": 'off' }, 
                    field: { name: "Случайный порядок" } 
                });

                // Настройки для cookies (отдельные поля)
                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_session_id", type: "input", placeholder: "Вставьте Session_id из cookies", values: "" }, 
                    field: { name: "Session_id", description: "Основной токен авторизации для тематических коллекций" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_sessionid2", type: "input", placeholder: "Вставьте sessionid2 из cookies", values: "" }, 
                    field: { name: "sessionid2", description: "Дополнительный токен авторизации (если есть)" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_yandexuid", type: "input", placeholder: "Числовой yandexuid", values: "" }, 
                    field: { name: "yandexuid", description: "Уникальный идентификатор пользователя" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_yandex_login", type: "input", placeholder: "Логин Яндекс", values: "" }, 
                    field: { name: "yandex_login", description: "Логин пользователя Яндекс" } 
                });

                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_l_token", type: "input", placeholder: "Токен L из cookies", values: "" }, 
                    field: { name: "L токен", description: "Токен авторизации L параметр" } 
                });

                // Кнопка тестирования cookies
                Lampa.SettingsApi.addParam({ 
                    component: COMP_ID, 
                    param: { name: "ym_test_cookies", type: "button", values: "" }, 
                    field: { name: "🧪 Тест cookies", description: "Проверить правильность заполнения полей и работу авторизации" },
                    onChange: function() {
                        testCookiesFunction();
                    }
                });
            }
        }
    });

} // end startPlugin

startPlugin();

})();
