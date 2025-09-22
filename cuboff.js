(function () {
    // Установка премиум-статуса
    window.Account = window.Account || {};
    window.Account.hasPremium = () => true;

    // Перехват создания видеоэлементов
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName, options) {
        if (tagName.toLowerCase() === "video") {
            // Создаем пустой div вместо video, чтобы не нарушать структуру DOM
            const fakeElement = originalCreateElement.call(document, "div");
            // Имитация необходимых методов и свойств видеоэлемента
            fakeElement.play = () => Promise.resolve();
            fakeElement.pause = () => {};
            fakeElement.load = () => {};
            Object.defineProperty(fakeElement, "ended", { value: true, writable: false });
            Object.defineProperty(fakeElement, "currentTime", { value: 0, writable: false });
            Object.defineProperty(fakeElement, "duration", { value: 0, writable: false });
            // Проксируем события, чтобы они не ломали логику сайта
            fakeElement.addEventListener = (event, callback) => {
                if (event === "ended") {
                    setTimeout(() => callback(new Event("ended")), 0);
                }
                return originalCreateElement.call(document, "div").addEventListener(event, callback);
            };
            return fakeElement;
        }
        return originalCreateElement.call(document, tagName, options);
    };

    // Очистка таймеров и интервалов, связанных с рекламой
    function clearAdTimers() {
        // Ограничиваем очистку, чтобы не затрагивать системные таймеры
        const highestTimeout = setTimeout(() => {}, 0);
        for (let i = Math.max(0, highestTimeout - 1000); i <= highestTimeout; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    }

    // Запуск очистки при загрузке страницы
    document.addEventListener("DOMContentLoaded", clearAdTimers);

    // Перехват попыток воспроизведения через существующие видеоэлементы
    const originalPlay = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
        // Проверяем, является ли видео рекламным (например, по src или классу)
        if (this.src.includes("ad") || this.className.includes("ad")) {
            this.dispatchEvent(new Event("ended"));
            return Promise.resolve();
        }
        return originalPlay.apply(this);
    };
})();
