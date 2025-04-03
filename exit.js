(function() {
  'use strict';

  function exitLamp() {
    try {
      if (Lampa && Lampa.Activity) Lampa.Activity.out();
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
  
  function addListener(element, callback) {
    if (typeof $ !== 'undefined' && typeof $(element).on === 'function') {
      $(element).on('hover:enter hover:click hover:touch', callback);
    } else {
      element.addEventListener('click', callback);
      element.addEventListener('keydown', function(e) {
        if (e.keyCode === 13 || e.keyCode === 32) {
          callback();
        }
      });
    }
  }

  function addButtons() {
    var headerActions = document.querySelector('#app .head__actions');
    if (!headerActions) return;

    var reloadButtonHTML =
      '<div id="RELOAD" class="head__action selector reload-screen" tabindex="0">' +
        '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
        '</svg>' +
      '</div>';

    var exitButtonHTML =
      '<div id="EXIT" class="head__action selector exit-screen" tabindex="0">' +
        '<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>' +
          '<line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="2"/>' +
          '<line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="2"/>' +
        '</svg>' +
      '</div>';

    headerActions.insertAdjacentHTML('beforeend', reloadButtonHTML + exitButtonHTML);

    var reloadButton = document.getElementById('RELOAD');
    if (reloadButton) addListener(reloadButton, function() { location.reload(); });

    var exitButton = document.getElementById('EXIT');
    if (exitButton) addListener(exitButton, exitLamp);
  }

  if (window.appready) {
    addButtons();
  } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
    Lampa.Listener.follow('app', function(e) {
      if (e.type === 'ready') addButtons();
    });
  } else {
    window.addEventListener('load', addButtons);
  }
})();
