
(function () {
    'use strict';

    // Установка платформы TV для Lampa
    if (typeof Lampa !== 'undefined' && Lampa.Platform) {
        Lampa.Platform.tv();
    }

    // Установка премиум-статуса
    window.Account = window.Account || {};
    window.Account.hasPremium = () => true;

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
                    setTimeout(() => callback(new Event("ended")), 0);
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
        const selectors = [
            '.ad-server',
            '.ad-bot',
            '.card__textbox',
            '.selectbox-item--icon',
            '.open--feed',
            '.open--premium',
            '.open--notice',
            '.icon--blink',
            '.black-friday__button',
            '.christmas__button',
            '.settings--account-premium',
            '.full-reviews',
            '.button--subscribe'
        ];
        selectors.forEach(selector => {
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

        // Скрытие элементов в закладках
        document.querySelectorAll('.register:nth-child(4), .register:nth-child(5), .register:nth-child(6), .register:nth-child(7), .register:nth-child(8)')
            .forEach(el => el.style.display = 'none');
    }

    // Мониторинг изменений DOM с ограничением
    function observeDomChanges() {
        let isObserving = false;
        const observer = new MutationObserver((mutations) => {
            if (isObserving) return;
            isObserving = true;
            removeAdElements();
            isObserving = false;
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000); // Ограничение времени наблюдения
    }

    // Инициализация плагина
    function initializePlugin() {
        // Добавление стилей для скрытия подписки
        const style = document.createElement('style');
        style.innerHTML = '.button--subscribe { display: none !important; }';
        document.body.appendChild(style);

        // Установка региона
        const now = new Date();
        localStorage.setItem('region', JSON.stringify({ code: "uk", time: now.getTime() }));

        // Обработчик событий Lampa
        if (typeof Lampa !== 'undefined') {
            Lampa.Listener.follow('full', (event) => {
                if (event.type === 'build' && event.name === 'discuss') {
                    setTimeout(() => {
                        const reviews = document.querySelector('.full-reviews');
                        if (reviews) {
                            let parent = reviews.parentElement;
                            for (let i = 0; i < 4 && parent; i++) parent = parent.parentElement;
                            if (parent) parent.remove();
                        }
                    }, 100);
                }
            });

            Lampa.Settings.listener.follow('open', (event) => {
                if (event.name === 'account' || event.name === 'server') {
                    setTimeout(removeAdElements, 100);
                }
            });

            Lampa.Storage.listener.follow('change', (event) => {
                if (event.name === 'activity' && Lampa.Activity.active().component === 'bookmarks') {
                    setTimeout(removeAdElements, 200);
                }
            });

            Lampa.Controller.listener.follow('toggle', (event) => {
                if (event.name === 'select' && Lampa.Activity.active().component === 'full') {
                    setTimeout(removeAdElements, 100);
                }
            });
        }

        // Начальная очистка
        setTimeout(removeAdElements, 100);
        setTimeout(observeDomChanges, 500);
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
