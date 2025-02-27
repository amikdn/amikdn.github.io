(function() {
  'use strict';

  // Функция выхода из приложения Lampa с учётом разных платформ
  function exitLamp() {
    try {
      if (Lampa && Lampa.Activity) {
        Lampa.Activity.out();
      }
    } catch (e) {}
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
        location.reload();
      }
    } else {
      location.reload();
    }
  }

  // Функция добавления кнопок (перезагрузки и выхода)
  function addButtons() {
    try {
      // Ищем контейнер для кнопок в шапке приложения (при необходимости скорректируйте селектор)
      var headerActions = document.querySelector('#app .head__actions');
      if (!headerActions) return;

      // HTML-разметка кнопки перезагрузки
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

      // HTML-разметка кнопки выхода
      var exitButtonHTML =
        '<div id="EXIT" class="head__action selector exit-screen" tabindex="0">' +
          '<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="2" y="2" width="20" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>' +
            '<line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="2"/>' +
            '<line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="2"/>' +
          '</svg>' +
        '</div>';

      // Добавляем обе кнопки в контейнер
      headerActions.insertAdjacentHTML('beforeend', reloadButtonHTML + exitButtonHTML);

      // Обработка событий для кнопки перезагрузки
      var reloadButton = document.getElementById('RELOAD');
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
      }

      // Обработка событий для кнопки выхода
      var exitButton = document.getElementById('EXIT');
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
      }
    } catch (err) {
      console.error('Plugin Exception: ' + err.message);
    }
  }

  // Если приложение уже готово, добавляем кнопки сразу;
  // иначе ждём события готовности (через Lampa.Listener или window.load)
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
