(function() {
  'use strict';

  // Функция, которая симулирует реальный клик по элементу с учетом координат
  function simulateRealClick(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const options = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    };

    // Если поддерживаются PointerEvent, посылаем pointerdown/ pointerup
    try {
      const pointerDown = new PointerEvent('pointerdown', options);
      const pointerUp = new PointerEvent('pointerup', options);
      element.dispatchEvent(pointerDown);
      element.dispatchEvent(pointerUp);
    } catch (err) {
      console.log("PointerEvent не поддерживается, пропускаем.");
    }

    // Отправляем события мыши
    const mouseDown = new MouseEvent('mousedown', options);
    const mouseUp = new MouseEvent('mouseup', options);
    const click = new MouseEvent('click', options);
    element.dispatchEvent(mouseDown);
    element.dispatchEvent(mouseUp);
    element.dispatchEvent(click);
    console.log("События клика отправлены для элемента:", element);
  }

  // Пытаемся найти кнопку и симулировать по ней клик
  function tryFullScreenClick() {
    const fullScreenBtn = document.querySelector('.head__action.selector.full-screen');
    if (fullScreenBtn) {
      simulateRealClick(fullScreenBtn);
      return true;
    }
    return false;
  }

  // Инициализация: пытаемся кликать периодически, если элемент еще не доступен
  function initPlugin() {
    let attempts = 0;
    const maxAttempts = 30; // 30 * 500мс = 15 секунд
    const interval = setInterval(() => {
      attempts++;
      if (tryFullScreenClick()) {
        clearInterval(interval);
        console.log("Кнопка полноэкранного режима нажата после", attempts, "попыток");
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn("Не удалось найти кнопку полноэкранного режима после", attempts, "попыток");
      }
    }, 500);
  }

  // Ждем готовности приложения Lampa или загрузки DOM
  function startPlugin() {
    if (window.appready) {
      initPlugin();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
      Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
          initPlugin();
        }
      });
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
      } else {
        initPlugin();
      }
    }
  }

  startPlugin();
})();
