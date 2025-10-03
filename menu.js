// =====================================================
// Lampa Custom Plugin: Ad Blocker & UI Customizer
// Деобфусцированная версия оригинального обфусцированного скрипта
// Автор: Grok (xAI) - на основе анализа 03.10.2025
// Назначение: Скрытие рекламы, премиум-элементов и кастомизация UI в Lampa
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
    ads: true,                      // Реклама (парадоксально, но используется для отключения)
    trailers: false                 // Трейлеры
};

// =====================================================
// МОДУЛЬ АНТИ-ДЕБАГ (Anti-Debug)
// =====================================================
/**
 * Создает прокси для console, маскируя методы для предотвращения отладки.
 * @returns {Object} Прокси-объект для console.
 */
function createAntiDebugProxy() {
    const originalConsole = window.console;
    const methods = ['log', 'error', 'info', 'warn', 'debug', 'trace', 'exception'];
    const proxy = {};
    
    methods.forEach(method => {
        const original = originalConsole[method];
        proxy[method] = function() {
            // Фейковый вызов: Логирует, но маскирует toString
            return original.apply(this, arguments);
        };
        // Маскировка toString для инспектора
        proxy[method].toString = () => `function ${method}() { [native code] }`;
        proxy[method].valueOf = () => original;
    });
    
    window.console = proxy;
    return proxy;
}

/**
 * Обертка для функций: Try-catch с fallback на window (анти-дебаг).
 * @param {Function} fn - Функция для обертки.
 * @returns {Function} Обернутая функция.
 */
function antiDebugWrapper(fn) {
    return function() {
        if (typeof fn === 'function') {
            try {
                return fn.apply(this, arguments);
            } catch (e) {
                // Fallback: Возвращает window при ошибке
                return window;
            }
        }
        return undefined;
    };
}

// =====================================================
// МОДУЛЬ DOM-УТИЛИТ (DOM Utils)
// =====================================================
/**
 * Скрывает элемент по селектору и удаляет родителя (для полной очистки).
 * @param {string} selector - CSS-селектор.
 * @param {string} [cssValue='none'] - Значение для display.
 */
function hideElement(selector, cssValue = 'none') {
    $(selector).css('display', cssValue);
    if ($(selector).length) {
        $(selector).parent().remove(); // Удаление родителя
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
 * Создает скрытый элемент уведомления.
 * @returns {HTMLElement} Созданный div.
 */
function createNoticeElement() {
    const notice = document.createElement('div');
    notice.className = 'open--notice';
    notice.innerHTML = 'Custom Notice: Ads Disabled'; // Кастомное сообщение
    notice.style.display = 'none'; // Скрыто по умолчанию
    document.body.appendChild(notice);
    return notice;
}

/**
 * Фильтрует и скрывает элементы по тексту (статусы просмотра).
 * @param {jQuery} $container - Контейнер для фильтрации.
 */
function filterAndHideStatuses($container) {
    $container.filter(function() {
        const text = $(this).text().trim();
        const statuses = ['Смотрю', 'Просмотрено', 'Продолжение следует', 'Запланировано', 'Брошено'];
        return statuses.includes(text);
    }).hide();
}

// =====================================================
// МОДУЛЬ ОБСЕРВЕРОВ (Observers)
// =====================================================
let domChangeFlag = 0; // Флаг для предотвращения спама

/**
 * Настраивает MutationObserver для body: Отслеживает добавление .register.
 */
function setupDomObserver() {
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
 * Настраивает Observer для настроек: Скрывает премиум при изменениях.
 */
function setupSettingsObserver() {
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
// МОДУЛЬ ОБРАБОТЧИКОВ СОБЫТИЙ Lampa (Event Handlers)
// =====================================================
/**
 * Обработчик toggle в Main: Скрывает уведомления в full/account.
 * @param {Object} event - Событие Lampa.
 */
function followToggleHandler(event) {
    if (event.name === 'toggle') {
        setTimeout(() => {
            const active = Lampa.Activity.active();
            if (active.component === 'full') {
                $('.open--notice').remove();
            }
            if (active.component === 'account') {
                $('.ad-server').remove();
            }
        }, 20);
    }
}

/**
 * Обработчик открытия activity: Скрывает статусы в bookmarks.
 * @param {Object} event - Событие Lampa.
 */
function activityOpenHandler(event) {
    if (event.name === 'activity') {
        const active = Lampa.Activity.active();
        if (active.component === 'bookmarks') {
            filterAndHideStatuses($('.card__text'));
            setTimeout(setupDomObserver, 200);
        }
    }
}

/**
 * Обработчик toggle контроллера: Скрывает элементы при select/content.
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
 * Обработчик обновления настроек: Скрывает премиум/рекламу.
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
// МОДУЛЬ ИНИЦИАЛИЗАЦИИ (Initialization)
// =====================================================
/**
 * Основная инициализация: Анти-дебаг, уведомления, таймеры, observers.
 */
function mainInit() {
    createAntiDebugProxy(); // Анти-дебаг
    createNoticeElement();  // Уведомление
    
    // Ready: Сохранить регион в localStorage
    $(document).ready(() => {
        const now = new Date().getTime();
        localStorage.setItem('region', `{ "code": "uk", "time": ${now} }`);
    });
    
    // Таймер: Скрыть элементы через 1 сек
    setTimeout(() => {
        $('.icon--blink').hide();
        if ($('.black-friday__button').length > 0) $('.black-friday__button').hide();
        if ($('.ad-server').length > 0) $('.ad-server').hide();
    }, 1000);
    
    setupDomObserver();
    
    // Регистрация хуков Lampa
    Lampa.Main.listener.follow('toggle', antiDebugWrapper(followToggleHandler));
    Lampa.Activity.open(antiDebugWrapper(activityOpenHandler));
    Lampa.Controller.toggle(antiDebugWrapper(controllerToggleHandler));
    Lampa.Settings.update('account', antiDebugWrapper(settingsUpdateHandler));
    Lampa.Settings.update('server', antiDebugWrapper(settingsUpdateHandler));
}

/**
 * Обработчик готовности приложения: Вызывает mainInit.
 * @param {Object} event - Событие Lampa.
 */
function appReadyHandler(event) {
    if (event.type === 'appready') {
        mainInit();
        setupSettingsObserver();
        followToggleHandler({ name: 'toggle' }); // Инициальный вызов
        $('[data-action=timetable]').hide();
    }
}

// =====================================================
// АВТОЗАПУСК
// =====================================================
if (window.lampa_settings) {
    // Если настройки уже загружены
    mainInit();
    setupDomObserver();
} else {
    // Ждем события app
    Lampa.Listener.follow('app', antiDebugWrapper(appReadyHandler));
}

// =====================================================
// КОНЕЦ ФАЙЛА
// =====================================================
// Лог для подтверждения загрузки (будет перехвачен анти-дебагом)
console.log('Lampa Custom Plugin Loaded Successfully');
