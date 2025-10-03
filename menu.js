
'use strict';

// =====================================================
// ГЛОБАЛЬНЫЕ НАСТРОЙКИ Lampa (БЕЗ ПЕРЕЗАПИСИ ADS - ФИКС КОНФЛИКТА)
// =====================================================
// Устанавливаем базовые настройки, но ads модифицируем динамически
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

// НЕ ПЕРЕЗАПИСЫВАЕМ lampa_settings_main здесь - делаем в startPlugin()
// window.lampa_settings_main = { ... }; // Убрано для избежания конфликта

// =====================================================
// МОДУЛЬ АНТИ-ДЕБАГ (Anti-Debug) - С ЗАЩИТОЙ
// =====================================================
/**
 * Создает прокси для console, маскируя методы (только если console доступен).
 * @returns {Object|null} Прокси или null.
 */
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

/**
 * Обертка для функций: Try-catch с fallback (анти-дебаг).
 * @param {Function} fn - Функция для обертки.
 * @returns {Function} Обернутая функция.
 */
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
// МОДУЛЬ DOM-УТИЛИТ (DOM Utils) - С ЗАЩИТОЙ
// =====================================================
/**
 * Скрывает элемент по селектору (проверка на jQuery).
 * @param {string} selector - CSS-селектор.
 * @param {string} [cssValue='none'] - Значение для display.
 */
function hideElement(selector, cssValue = 'none') {
    if (typeof $ === 'undefined') return;
    $(selector).css('display', cssValue);
    if ($(selector).length) {
        $(selector).parent().remove();
    }
}

/**
 * Скрывает рекламные и премиум-элементы.
 */
function hideAdsAndPremium() {
    hideElement('.ad-server');
    hideElement('.settings--account-premium');
    hideElement('div > span:contains("CUB Premium")');
    if (!$('[data-name="account_use"]').length) {
        hideElement('.selectbox-item__lock');
    }
}

/**
 * Создает скрытый элемент уведомления (проверка DOM).
 * @returns {HTMLElement|null} Созданный div или null.
 */
function createNoticeElement() {
    if (typeof document === 'undefined') return null;
    const notice = document.createElement('div');
    notice.className = 'open--notice';
    notice.innerHTML = 'Custom Notice: Ads Disabled';
    notice.style.display = 'none';
    document.body.appendChild(notice);
    return notice;
}

/**
 * Фильтрует и скрывает элементы по тексту (статусы просмотра).
 * @param {jQuery} $container - Контейнер для фильтрации.
 */
function filterAndHideStatuses($container) {
    if (typeof $ === 'undefined') return;
    $container.filter(function() {
        const text = $(this).text().trim();
        const statuses = ['Смотрю', 'Просмотрено', 'Продолжение следует', 'Запланировано', 'Брошено'];
        return statuses.includes(text);
    }).hide();
}

// =====================================================
// МОДУЛЬ ОБСЕРВЕРОВ (Observers) - С ЗАЩИТОЙ
// =====================================================
let domChangeFlag = 0;

/**
 * Настраивает MutationObserver для body (проверка DOM).
 */
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

/**
 * Настраивает Observer для настроек.
 */
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
// МОДУЛЬ ОБРАБОТЧИКОВ СОБЫТИЙ Lampa (Event Handlers) - С ЗАЩИТОЙ
// =====================================================
/**
 * Обработчик toggle в Main.
 * @param {Object} event - Событие Lampa.
 */
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

/**
 * Обработчик открытия activity.
 * @param {Object} event - Событие Lampa.
 */
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

/**
 * Обработчик toggle контроллера.
 * @param {Object} event - Событие Lampa.
 */
function controllerToggleHandler(event) {
    if (event.name === 'select') {
        hideAdsAndPremium();
    }
    if (event.name === 'content') {
        $('.open--notice').remove();
        $('.ad-server').remove();
    }
}

/**
 * Обработчик обновления настроек.
 * @param {Object} event - Событие Lampa.
 */
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
// МОДУЛЬ ИНИЦИАЛИЗАЦИИ (startPlugin = mainInit)
// =====================================================
/**
 * Основная функция плагина (startPlugin).
 */
function startPlugin() {
    console.log('Lampa Custom Plugin: Starting plugin...');
    
    // Анти-дебаг
    createAntiDebugProxy();
    
    // Уведомление
    createNoticeElement();
    
    // Ready: Сохранить регион
    if (typeof $ !== 'undefined') {
        $(document).ready(() => {
            const now = new Date().getTime();
            localStorage.setItem('region', `{ "code": "uk", "time": ${now} }`);
        });
    }
    
    // Таймер: Скрыть элементы через 1 сек
    setTimeout(() => {
        hideElement('.icon--blink');
        hideElement('.black-friday__button');
        hideElement('.ad-server');
    }, 1000);
    
    // Observer
    setupDomObserver();
    
    // ФИКС КОНФЛИКТА: Модификация ads только здесь, с проверкой
    try {
        if (window.lampa_settings_main && typeof window.lampa_settings_main.ads !== 'undefined') {
            window.lampa_settings_main.ads = false; // Отключение рекламы
            console.log('Lampa Custom Plugin: Ads disabled in settings_main');
        } else if (typeof Lampa !== 'undefined' && Lampa.Settings) {
            // Fallback: Через Lampa API
            Lampa.Settings.main.ads = false;
            console.log('Lampa Custom Plugin: Ads disabled via Lampa.Settings');
        } else {
            console.warn('Lampa Custom Plugin: Could not disable ads - object not ready');
        }
    } catch (err) {
        console.error('Lampa Custom Plugin: Error disabling ads:', err);
    }
    
    // Регистрация хуков: Только если Lampa API доступен
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
// АВТОЗАПУСК - НА ОСНОВЕ ВАШЕГО ПРЕДЛОЖЕНИЯ
// =====================================================
console.log('Lampa Custom Plugin: Script loaded');

// Улучшенная инициализация по вашему стилю
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
        // Fallback: Если Listener недоступен, ждем 2 сек
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

// =====================================================
// КОНЕЦ ФАЙЛА
// =====================================================
console.log('Lampa Custom Plugin: Initialization setup complete');
