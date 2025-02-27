// VaZ0NeZ

(function() {
  'use strict';

  // Функция выхода из приложения Lamp, учитывающая разные платформы
  function exitLamp() {
    // Попытка закрыть активность
    try {
      if (Lampa && Lampa.Activity) {
        Lampa.Activity.out();
      }
    } catch (e) {}
    // Вызываем метод выхода в зависимости от платформы
    if (Lampa && Lampa.Platform) {
      if (Lampa.Platform.is('tizen')) {
        tizen.application.getCurrentApplication().exit();
      } else if (Lampa.Platform.is('webos')) {
        window.close();
      } else if (Lampa.Platform.is('android')) {
        Lampa.Android.exit();
      } else if (Lampa.Platform.is('orsay')) {
        Lampa.Orsay.exit();
      } else {
        // Если неизвестная платформа – просто перезагружаем страницу
        location.reload();
      }
    } else {
      location.reload();
    }
  }

  // Функция добавления кнопок (перезагрузки и выхода)
  function addButtons() {
    try {
      // Ищем контейнер для кнопок в шапке приложения (при необходимости измените селектор)
      var headerActions = document.querySelector('#app .head__actions');
      if (!headerActions) {
        logError('Plugin Error: Контейнер ".head__actions" не найден.');
        return;
      }

      // HTML-разметка кнопки перезагрузки с иконкой (SVG)
      var reloadButtonHTML =
        '<div id="RELOAD" class="head__action selector reload-screen" tabindex="0">' +
          '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<g stroke-width="0"></g>' +
            '<g stroke-linecap="round" stroke-linejoin="round"></g>' +
            '<g>' +
              '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
            '</g>' +
          '</svg>' +
        '</div>';

      // HTML-разметка кнопки выхода с иконкой крестика (SVG)
      var exitButtonHTML =
        '<div id="EXIT" class="head__action selector exit-screen" tabindex="0">' +
          '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<g stroke-width="0"></g>' +
            '<g stroke-linecap="round" stroke-linejoin="round"></g>' +
            '<g>' +
              '<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>' +
              '<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>' +
            '</g>' +
          '</svg>' +
        '</div>';

      // Добавляем обе кнопки в контейнер
      headerActions.insertAdjacentHTML('beforeend', reloadButtonHTML + exitButtonHTML);

      // Находим добавленные элементы
      var reloadButton = document.getElementById('RELOAD');
      var exitButton = document.getElementById('EXIT');

      // Обработка событий для кнопки перезагрузки
      if (reloadButton) {
        if (typeof $ !== 'undefined' && typeof $(reloadButton).on === 'function') {
          $(reloadButton).on('hover:enter hover:click hover:touch', function() {
            location.reload();
          });
        } else {
          reloadButton.addEventListener('click', function() {
            location.reload();
          });
          reloadButton.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
              location.reload();
            }
          });
        }
      } else {
        logError('Plugin Error: Кнопка перезагрузки не найдена после добавления.');
      }

      // Обработка событий для кнопки выхода
      if (exitButton) {
        if (typeof $ !== 'undefined' && typeof $(exitButton).on === 'function') {
          $(exitButton).on('hover:enter hover:click hover:touch', function() {
            exitLamp();
          });
        } else {
          exitButton.addEventListener('click', function() {
            exitLamp();
          });
          exitButton.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
              exitLamp();
            }
          });
        }
      } else {
        logError('Plugin Error: Кнопка выхода не найдена после добавления.');
      }
    } catch (err) {
      logError('Plugin Exception: ' + err.message);
    }
  }

  // Ждём готовности приложения и добавляем кнопки
  if (window.appready) {
    addButtons();
  } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
    Lampa.Listener.follow('app', function(e) {
      if (e.type === 'ready') {
        addButtons();
      }
    });
  } else {
    window.addEventListener('load', function() {
      addButtons();
    });
  }
})();
