(function () {
  'use strict';

  Lampa.Platform.tv();

  // Удаляем существующие карточки с качеством "ts"
  function clearTS(forceToggle) {
    // Ищем элементы качества, содержащие "ts", и удаляем всю карточку
    $('.card__quality > div:contains("ts")')
      .parent()
      .parent()
      .parent()
      .remove();

    // Если передан параметр — принудительно переключаем视图 (как в оригинале)
    if (forceToggle) {
      Lampa.Controller.toggle('head');
      Lampa.Controller.toggle('content');
    }
  }

  // Отслеживаем динамическое добавление карточек
  function watchTS() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === 1 && 
              node.classList.contains('card') &&
              node.textContent.toLowerCase().includes('ts')
            ) {
              node.remove();
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // При переключении линии элементов или контента — очищаем
    Lampa.Controller.listener.follow('toggle', (e) => {
      if (e.name === 'items_line' || e.name === 'content') {
        clearTS();
      }
    });

    // При завершении загрузки полной страницы — очищаем
    Lampa.Listener.follow('full', (e) => {
      if (e.type === 'complite') {
        clearTS();
      }
    });
  }

  // Запускаем, когда приложение готово
  if (window.appready) {
    watchTS();
    clearTS(true);
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        watchTS();
        clearTS(true);
      }
    });
  }
})();
