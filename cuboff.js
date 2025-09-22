// ==LampaPlugin==
// @name CUB AdBlock for Lampa
// @description Blocks CUB ads and videos in Lampa
// @version 1.4.0
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

    // Подмена региона
    function setRegion() {
        const now = new Date();
        const timestamp = now.getTime();
        // Установка региона "uk" и других возможных ключей
        localStorage.setItem('region', JSON.stringify({ code: 'uk', time: timestamp }));
        localStorage.setItem('cub_region', JSON.stringify({ code: 'uk', time: timestamp }));
        localStorage.setItem('geo', JSON.stringify({ country: 'UA', time: timestamp }));
    }

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

    // Удаление рекламных элементов
    function removeAdElements() {
        const adSelectors = [
            '.ad-server',
            '.ad-bot',
            '.open--premium',
            '.settings--account-premium',
            '.button--subscribe',
            '.open--feed',
            '.open--notice',
            '.icon--blink',
            '.black-friday__button',
            '.christmas__button'
        ];
        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Удаление элементов с текстом "CUB Premium" или "Статус"
        document.querySelectorAll('div > span').forEach(span => {
            if (span.textContent.includes('CUB Premium') || span.textContent.includes('Статус')) {
                if (span.parentElement) span.parentElement.remove();
            }
        });

        // Скрытие заблокированных элементов
        document.querySelectorAll('.selectbox-item__lock').forEach(el => {
            if (el.parentElement) el.parentElement.style.display = 'none';
        });
    }

    // Мониторинг изменений DOM
    function observeDomChanges() {
        const observer = new MutationObserver(() => {
            removeAdElements();
            setRegion();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 3000);
    }

    // Инициализация плагина
    function initializePlugin() {
        // Добавление стилей
        const style = document.createElement('style');
        style.innerHTML = '.button--subscribe, .open--premium, .settings--account-premium { display: none !important; }';
        document.head.appendChild(style);

        // Установка региона
        setRegion();

        // Удаление рекламы
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

            Lampa.Listener.follow('full', (event) => {
                if (event.type === 'build' && event.name === 'discuss') {
                    document.querySelectorAll('.full-reviews').forEach(el => {
                        let parent = el.parentElement;
                        for (let i = 0; i < 4 && parent; i++) parent = parent.parentElement;
                        if (parent) parent.remove();
                    });
                }
            });

            Lampa.Storage.listener.follow('change', (event) => {
                if (event.name === 'activity' && Lampa.Activity.active().component === 'bookmarks' && !isAndroid) {
                    document.querySelectorAll('.register:nth-child(4), .register:nth-child(5), .register:nth-child(6), .register:nth-child(7), .register:nth-child(8)')
                        .forEach(el => el.style.display = 'none');
                }
            });
        }

        // Обработчик для TV-режима
        document.querySelectorAll('[data-action="tv"]').forEach(el => {
            el.addEventListener('mouseenter', removeAdElements);
            el.addEventListener('click', removeAdElements);
            el.addEventListener('touchstart', removeAdElements);
        });

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
                document.querySelectorAll('[data-action="feed"], [data-action="subscribes"], [data-action="myperson"]').forEach(el => el.remove());
            }
        });
    }
})();
