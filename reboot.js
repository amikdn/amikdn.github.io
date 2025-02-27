
(function() {
  'use strict';

  function addReloadButton() {
    try {
      var headerActions = document.querySelector('#app .head__actions');
      if (!headerActions) {
        logError('Reload Plugin Error: Контейнер ".head__actions" не найден.');
        return;
      }
      
      var reloadButtonHTML = '<div id="RELOAD" class="head__action selector reload-screen" tabindex="0">' +
          '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<g stroke-width="0"></g>' +
            '<g stroke-linecap="round" stroke-linejoin="round"></g>' +
            '<g>' +
              '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
            '</g>' +
          '</svg>' +
        '</div>';
      
   headerActions.insertAdjacentHTML('beforeend', reloadButtonHTML);
      
      var reloadButton = document.getElementById('RELOAD');
      if (reloadButton) {

        if (typeof $ !== "undefined" && typeof $(reloadButton).on === "function") {
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
        logError('Reload Plugin Error: Кнопка не найдена после добавления.');
      }
    } catch (err) {
      logError('Reload Plugin Exception: ' + err.message);
    }
  }

  if (window.appready) {
    addReloadButton();
  } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {

    Lampa.Listener.follow('app', function(e) {
      if (e.type === 'ready') {
        addReloadButton();
      }
    });
  } else {

    window.addEventListener('load', function() {
      addReloadButton();
    });
  }
})();
