// =====================================================
// Lampa Custom Plugin: Ad Blocker & UI Customizer (FINAL NO RACE)
// Деобфусцированная версия с установкой настроек без race condition
// Автор: Grok (xAI) - финальная версия от 03.10.2025
// Назначение: Скрытие рекламы, премиум-элементов и кастомизация UI в Lampa
// Фикс: Ранняя установка lampa_settings_main с ads: false + хуки после 'ready'
// Загрузка: Только после запуска Lampa (console или listener)
// =====================================================

'use strict';

// =====================================================
// ГЛОБАЛЬНЫЕ НАСТРОЙКИ (ПОЛНАЯ УСТАНОВКА С ads: false)
// =====================================================
// Устанавливаем оба объекта рано, но с ads: false (Lampa ожидает их)
window.lampa_settings = {
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

window.lampa_settings_main = {
    dmca: true,
    reactions: false,
    discuss: false,
    ai: true,
    subscribe: true,
    blacklist: true,
    persons: true,
    ads: false,                     // Полное отключение рекламы (Lampa не загружает)
    trailers: false
};

// =====================================================
// ФУНКЦИЯ ОЧИСТКИ КЭША
// =====================================================
function clearLampaCache() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Cache cleared');
    location.reload();
}

// =====================================================
// МОДУЛЬ АНТИ-ДЕБАГ
// =====================================================
function createAntiDebugProxy() {
    if (typeof window.console === 'undefined') return null;
    const originalConsole = window.console;
    const methods = ['log', 'error', 'info', 'warn', 'debug', 'trace', 'exception'];
    const proxy = {};
    methods.forEach(method => {
        if (originalConsole[method]) {
            const original = originalConsole[method];
            proxy[method] = function() {
                return original.apply(this, arguments);
            };
            proxy[method].toString = () => `function ${method}() { [native code] }`;
        }
    });
    window.console = proxy;
    return proxy;
}

function antiDebugWrapper(fn) {
    return function() {
        if (typeof fn === 'function') {
            try {
                return fn.apply(this, arguments);
            } catch (e) {
                console.warn('Anti-debug fallback:', e);
                return window;
            }
        }
        return undefined;
    };
}

// =====================================================
// МОДУЛЬ DOM-УТИЛИТ
// =====================================================
function hideElement(selector, cssValue = 'none') {
    if (typeof $ === 'undefined') return;
    $(selector).css('display', cssValue);
    if ($(selector).length) {
        $(selector).parent().remove();
    }
}

function hideAdsAndPremium() {
    hideElement('.ad-server');
    hideElement('.settings--account-premium');
    hideElement('div > span:contains("CUB Premium")');
    hideElement('.black-friday__button');
    hideElement('.icon--blink');
    if (!$('[data-name="account_use"]').length) {
        hideElement('.selectbox-item__lock');
    }
}

function createNoticeElement() {
    if (typeof document === 'undefined') return null;
    const notice = document.createElement('div');
    notice.className = 'open--notice';
    notice.innerHTML = 'Custom Notice: Ads Disabled';
    notice.style.display = 'none';
    document.body.appendChild(notice);
    return notice;
}

function filterAndHideStatuses($container) {
    if (typeof $ === 'undefined') return;
    $container.filter(function() {
        const text = $(this).text().trim();
        const statuses = ['Смотрю', 'Просмотрено', 'Продолжение следует', 'Запланировано', 'Брошено'];
        return statuses.includes(text);
    }).hide();
}

// =====================================================
// МОДУЛЬ ОБСЕРВЕРОВ
// =====================================================
let domChangeFlag = 0;

function setupDomObserver() {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                const registers = document.getElementsByClassName('register');
                if (registers.length > 0 && domChangeFlag === 0) {
                    domChangeFlag = 1;
                    hideAdsAndPremium();
                    setTimeout(() => { domChangeFlag = 0; }, 500);
                }
            }
        });
    });
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}

function setupSettingsObserver() {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                const register = document.querySelector('.register');
                if (register) {
                    hideAdsAndPremium();
                }
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// =====================================================
// МОДУЛЬ ОБРАБОТЧИКОВ СОБЫТИЙ Lampa
// =====================================================
function followToggleHandler(event) {
    if (event.name === 'toggle') {
        setTimeout(() => {
            if (typeof Lampa !== 'undefined' && Lampa.Activity && Lampa.Activity.active) {
                const active = Lampa.Activity.active();
                if (active.component === 'full') {
                    $('.open--notice').remove();
                }
                if (active.component === 'account') {
                    $('.ad-server').remove();
                }
            }
        }, 20);
    }
}

function activityOpenHandler(event) {
    if (event.name === 'activity') {
        if (typeof Lampa !== 'undefined' && Lampa.Activity && Lampa.Activity.active) {
            const active = Lampa.Activity.active();
            if (active.component === 'bookmarks') {
                filterAndHideStatuses($('.card__text'));
                setTimeout(setupDomObserver, 200);
            }
        }
    }
}

function controllerToggleHandler(event) {
    if (event.name === 'select') {
        hideAdsAndPremium();
    }
    if (event.name === 'content') {
        $('.open--notice').remove();
        $('.ad-server').remove();
    }
}

function settingsUpdateHandler(event) {
    if (event.name === 'account') {
        setTimeout(() => {
            $('.settings--account-premium').remove();
            $('div > span:contains("CUB Premium")').parent().remove();
        }, 100);
    }
    if (event.name === 'server') {
        $('.ad-server').remove();
    }
}

// =====================================================
// МОДУЛЬ ИНИЦИАЛИЗАЦИИ
// =====================================================
function startPlugin() {
    console.log('Lampa Custom Plugin: Starting plugin...');
    
    createAntiDebugProxy();
    createNoticeElement();
    
    if (typeof $ !== 'undefined') {
        $(document).ready(() => {
            const now = new Date().getTime();
            localStorage.setItem('region', `{ "code": "uk", "time": ${now} }`);
        });
    }
    
    setTimeout(() => {
        hideElement('.icon--blink');
        hideElement('.black-friday__button');
        hideElement('.ad-server');
    }, 1000);
    
    setupDomObserver();
    
    // Подтверждение отключения ads (уже установлено в начале)
    console.log('Lampa Custom Plugin: Ads disabled (settings_main.ads = false)');
    
    if (typeof Lampa !== 'undefined') {
        if (Lampa.Main && Lampa.Main.listener) {
            Lampa.Main.listener.follow('toggle', antiDebugWrapper(followToggleHandler));
        }
        if (Lampa.Activity && Lampa.Activity.open) {
            Lampa.Activity.open(antiDebugWrapper(activityOpenHandler));
        }
        if (Lampa.Controller && Lampa.Controller.toggle) {
            Lampa.Controller.toggle(antiDebugWrapper(controllerToggleHandler));
        }
        if (Lampa.Settings && Lampa.Settings.update) {
            Lampa.Settings.update('account', antiDebugWrapper(settingsUpdateHandler));
            Lampa.Settings.update('server', antiDebugWrapper(settingsUpdateHandler));
        }
        setupSettingsObserver();
        console.log('Lampa Custom Plugin: All hooks registered');
    } else {
        console.warn('Lampa Custom Plugin: Lampa API not ready after startPlugin');
    }
    
    console.log('Lampa Custom Plugin: Plugin started successfully');
}

// =====================================================
// АВТОЗАПУСК
// =====================================================
console.log('Lampa Custom Plugin: Script loaded');

if (window.appready) {
    console.log('Lampa Custom Plugin: window.appready detected - starting immediately');
    startPlugin();
} else {
    console.log('Lampa Custom Plugin: Waiting for app event...');
    if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            try {
                if (e.type === 'ready') {
                    console.log('Lampa Custom Plugin: Ready event detected');
                    startPlugin();
                }
            } catch (err) {
                console.error('Lampa Custom Plugin: Error in listener:', err);
            }
        });
    } else {
        setTimeout(() => {
            if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') startPlugin();
                });
                console.log('Lampa Custom Plugin: Listener attached (fallback)');
            } else {
                console.error('Lampa Custom Plugin: Lampa not found - plugin skipped');
            }
        }, 2000);
    }
}

console.log('Lampa Custom Plugin: Initialization setup complete');

// =====================================================
// КОНЕЦ ФАЙЛА
// =====================================================
