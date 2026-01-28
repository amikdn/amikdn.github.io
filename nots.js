(function () {
  'use strict';

  Lampa.Platform.tv();

  // Функция очистки TS (оптимизированная)
  function clearTS(forceToggle) {
    // Используем querySelectorAll вместо jQuery для скорости
    // Ищем все карточки
    var cards = document.querySelectorAll('.card');
    
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      // Проверяем, не удалена ли уже карточка, чтобы избежать ошибок
      if (!card.isConnected) continue;

      var quality = card.querySelector('.card__quality');
      // Проверяем текст
      if (quality && quality.textContent.toLowerCase().indexOf('ts') !== -1) {
        card.remove();
      }
    }

    if (forceToggle) {
      Lampa.Controller.toggle('head');
      Lampa.Controller.toggle('content');
    }
  }

  // Отслеживаем динамическое добавление карточек
  function watchTS() {
    const observer = new MutationObserver((mutations) => {
      // Используем requestAnimationFrame, чтобы не вешать UI
      requestAnimationFrame(() => {
        var needCheck = false;
        
        // Проверяем mutations, чтобы не запускать поиск попусту
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            needCheck = true;
            break;
          }
        }

        if (needCheck) {
          clearTS();
        }
      });
    });

    // Наблюдаем только за body, но не анализируем каждый узел внутри
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
    // Небольшая задержка, чтобы первый рендер успел произойти
    setTimeout(function(){ clearTS(true); }, 500);
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        watchTS();
        setTimeout(function(){ clearTS(true); }, 500);
      }
    });
  }
})();
