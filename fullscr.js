(function() {
  'use strict';

  // Функция ищет и кликает по кнопке полноэкранного режима
  function clickFullScreen() {
    var btn = document.querySelector('.head__action.selector.full-screen');
    if (btn) {
      btn.click();
      console.log('Полноэкранная кнопка нажата.');
      return true;
    }
    return false;
  }

  // Функция инициализации плагина: сразу пытается кликнуть,
  // а если кнопка не найдена — начинает наблюдать за изменениями в DOM.
  function initPlugin() {
    if (!clickFullScreen()) {
      // Если кнопка не найдена, запускаем MutationObserver
      var observer = new MutationObserver(function(mutations, obs) {
        if (clickFullScreen()) {
          obs.disconnect(); // Останавливаем наблюдение, как только кнопка найдена и кликнута
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Запускаем инициализацию, когда DOM готов
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }
})();
