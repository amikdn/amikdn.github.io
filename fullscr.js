(function() {
  'use strict';

  // Функция для автоматического клика по кнопке полноэкранного режима
  function clickFullScreenButton() {
    const fullScreenBtn = document.querySelector('.head__action.selector.full-screen');
    if (fullScreenBtn) {
      fullScreenBtn.click();
      console.log('Кнопка полноэкранного режима нажата.');
      return true;
    }
    return false;
  }

  // Функция для отслеживания изменений стилей у контейнера с классом .wrap
  function observeWrapStyleChanges() {
    const wrapEl = document.querySelector('.wrap.layer--height.layer--width');
    if (!wrapEl) {
      console.warn('Элемент .wrap не найден.');
      return;
    }
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'style') {
          console.log('Изменился стиль элемента .wrap: ', wrapEl.getAttribute('style'));
          // Здесь можно добавить дополнительную логику,
          // например, подстроить другие элементы или выполнить другие действия.
        }
      });
    });
    observer.observe(wrapEl, { attributes: true });
    console.log('Запущено наблюдение за изменениями стиля элемента .wrap.');
  }

  // Инициализация плагина
  function initPlugin() {
    // Попытка нажать на кнопку сразу
    if (clickFullScreenButton()) {
      observeWrapStyleChanges();
    } else {
      // Если кнопка не найдена сразу, пробуем через MutationObserver
      const btnObserver = new MutationObserver(() => {
        if (clickFullScreenButton()) {
          observeWrapStyleChanges();
          btnObserver.disconnect();
        }
      });
      btnObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Ждем готовности DOM или приложения Lampa
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }
})();
