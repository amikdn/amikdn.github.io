// ==LampaPlugin==
// @name CUB AdBlock for Lampa
// @description Blocks CUB ads and videos in Lampa
// @version 1.3.0
// @author Grok
// ==/LampaPlugin==

(function () {
    'use strict';

    // Установка платформы TV для Lampa
    if (typeof Lampa !== 'undefined' && Lampa.Platform) {
        Lampa.Platform.tv();
    }

    // Установка премиум-статуса
    window.Account = window.Account || {};
    window.Account.hasPremium = () => true;

    // Проверка платформы (Android)
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Перехват создания видеоэлементов
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName, options) {
        if (tagName.toLowerCase() === "video") {
            const fakeElement = originalCreateElement.call(document, "div");
            fakeElement.style.display = 'none';
            fakeElement.play = () => Promise.resolve();
            fakeElement.pause = () => {};
            fakeElement.load = () => {};
            Object.defineProperties(fakeElement, {
                ended: { value: true, writable: false },
                currentTime: { value: 0, writable: false },
                duration: { value: 0, writable: false }
            });
            fakeElement.addEventListener = (event, callback) => {
                if (event === "ended") {
                    callback(new Event("ended"));
                }
            };
            return fakeElement;
        }
        return originalCreateElement.call(document, tagName, options);
    };

    // Перехват воспроизведения видео
    const originalPlay = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
        const isAd = this.src.includes("ad") || 
                     this.src.includes("cub") || 
                     this.className.includes("ad") || 
                     this.className.includes("cub") || 
                     (this.parentElement && (this.parentElement.className.includes("ad") || this.parentElement.className.includes("cub")));
        if (isAd) {
            this.style.display = 'none';
            this.dispatchEvent(new Event("ended"));
            return Promise.resolve();
        }
        return originalPlay.apply(this);
    };

    // Удаление только рекламных элементов CUB
    function removeAdElements() {
        const adSelectors = [
            '.ad-server',
            '.ad-bot',
            '.open--premium',
            '.settings--account-premium',
            '.button--subscribe'
        ];
        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Удаление элементов с текстом "CUB Premium"
        document.querySelectorAll('div > span').forEach(span => {
            if (span.textContent.includes('CUB Premium')) {
                if (span.parentElement) span.parentElement.remove();
            }
        });
    }

    // Мониторинг изменений DOM с оптимизацией
    function observeDomChanges() {
        const observer = new MutationObserver(() => {
            removeAdElements();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // Остановка наблюдения после 3 секунд для снижения нагрузки
        setTimeout(() => observer.disconnect(), 3000);
    }

    // Инициализация плагина
    function initializePlugin() {
        // Добавление стилей для скрытия подписки
        const style = document.createElement('style');
        style.innerHTML = '.button--subscribe { display: none !important; }';
        document.head.appendChild(style);

        // Установка региона
        const now = new Date();
        localStorage.setItem('region', JSON.stringify({ code: "uk", time: now.getTime() }));

        // Удаление рекламы при загрузке
        removeAdElements();

        // Обработчик событий Lampa
        if (typeof Lampa !== 'undefined') {
            Lampa.Settings.listener.follow('open', (event) => {
                if (event.name === 'account' || event.name === 'server') {
                    removeAdElements();
                }
            });

            Lampa.Controller.listener.follow('toggle', (event) => {
                if (event.name === 'select' && Lampa.Activity.active().component === 'full' && !isAndroid) {
                    removeAdElements();
                }
            });
        }

        // Запуск наблюдения за DOM
        observeDomChanges();
    }

    // Запуск плагина
    if (window.appready) {
        initializePlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') {
                initializePlugin();
            }
        });
    }
})();
