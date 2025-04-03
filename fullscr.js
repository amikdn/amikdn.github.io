(function() {
  'use strict';

  // Функция симуляции клика через MouseEvent
  function simulateClick(element) {
    if (!element) return;
    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
    console.log('Полноэкранная кнопка нажата.');
  }

  // Функция, которая ищет кнопку и кликает по ней
  function tryClick() {
    var btn = document.querySelector('.head__action.selector.full-screen');
    if (btn) {
      simulateClick(btn);
      return true;
    }
    return false;
  }

  // Инициализация: пробуем кликать каждые 500 мс (до 10 секунд)
  function initPlugin() {
    var attempts = 0;
    var intervalId = setInterval(function() {
      if (tryClick()) {
        clearInterval(intervalId);
      }
      attempts++;
      if (attempts > 20) { // 20 * 500 мс = 10 секунд
        clearInterval(intervalId);
        console.warn('Не удалось найти кнопку полноэкранного режима.');
      }
    }, 500);
  }

  // Запускаем инициализацию после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }
})();
