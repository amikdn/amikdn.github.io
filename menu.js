// =====================================================
// Lampa Custom Plugin: Ad Blocker & UI Customizer (FIXED)
// Деобфусцированная и исправленная версия (с защитой от ранней инициализации)
// Автор: Grok (xAI) - исправление от 03.10.2025
// Назначение: Скрытие рекламы, премиум-элементов и кастомизация UI в Lampa
// Фикс: Проверки на Lampa API + отложенная init
// =====================================================

'use strict';

// =====================================================
// ГЛОБАЛЬНЫЕ НАСТРОЙКИ Lampa
// =====================================================
window.lampa_settings = {
    socket_use: false,              // Отключить сокеты
    socket_url: undefined,          // URL сокетов
    socket_methods: [],             // Методы сокетов
    account_use: true,              // Включить аккаунт
    account_sync: true,             // Синхронизация аккаунта
    plugins_use: true,              // Плагины
    plugins_store: true,            // Хранилище плагинов
    torrents_use: true,             // Торренты
    white_use: false,               // White list
    lang_use: true,                 // Язык
    read_only: false,               // Только чтение
    dcma: false,                    // DCMA (DMCA?)
    push_state: true,               // Push state
    iptv: false,                    // IPTV
    feed: false                     // Feed
};

window.lampa_settings_main = {
    dmca: true,                     // DMCA
    reactions: false,               // Реакции
    discuss: false,                 // Обсуждения
    ai: true,                       // AI
    subscribe: true,                // Подписка
    blacklist: true,                // Blacklist
    persons: true,                  // Персоны
    ads: true,                      // Реклама (используется для отключения)
    trailers: false                 // Трейлеры
};

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
                console.warn('Anti-debug fallback:', e); // Лог ошибки
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
    if (typeof $ === 'undefined') return; // Проверка jQuery
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
// МОДУЛЬ ИНИЦИАЛИЗАЦИИ (Initialization) - С ЗАЩИТОЙ И ОТЛОЖКОЙ
// =====================================================
/**
 * Основная инициализация (только если Lampa готов).
 */
function mainInit() {
    console.log('Lampa Custom Plugin: Starting init...');
    
    // Анти-дебаг (безопасно)
    createAntiDebugProxy();
    
    // Уведомление (безопасно)
    createNoticeElement();
    
    // Ready: Сохранить регион (jQuery check)
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
    
    // Observer (безопасно)
    setupDomObserver();
    
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
        console.warn('Lampa Custom Plugin: Lampa API not ready, retrying...');
        // Fallback: Повтор через 1 сек
        setTimeout(mainInit, 1000);
    }
    
    console.log('Lampa Custom Plugin: Init completed');
}

/**
 * Обработчик готовности приложения: Безопасный вызов mainInit.
 * @param {Object} event - Событие Lampa.
 */
function appReadyHandler(event) {
    if (event.type === 'appready') {
        console.log('Lampa Custom Plugin: App ready detected');
        mainInit();
        $('[data-action=timetable]').hide(); // Скрыть timetable
    }
}

// =====================================================
// АВТОЗАПУСК - С ОТЛОЖКОЙ И ПРОВЕРКАМИ
// =====================================================
console.log('Lampa Custom Plugin: Script loaded');

// Проверка: Если Lampa уже готов (редкий случай)
if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', antiDebugWrapper(appReadyHandler));
    console.log('Lampa Custom Plugin: Listener attached (Lampa ready)');
} else {
    // Fallback: Ждем через setTimeout
    setTimeout(() => {
        if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', antiDebugWrapper(appReadyHandler));
            console.log('Lampa Custom Plugin: Listener attached (delayed)');
        } else {
            console.error('Lampa Custom Plugin: Lampa not found after delay');
        }
    }, 2000); // 2 сек задержка
}

// Если настройки уже есть (ранняя загрузка)
if (window.lampa_settings) {
    setTimeout(mainInit, 500); // Отложенный вызов
    console.log('Lampa Custom Plugin: Settings found, init delayed');
}

// =====================================================
// КОНЕЦ ФАЙЛА
// =====================================================
console.log('Lampa Custom Plugin: Ready for appready event');
