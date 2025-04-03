(function () {
  'use strict';

  Lampa.Platform.tv();

  (function () {

    function clickFullScreen() {
      var btn = document.querySelector('.head__action.selector.full-screen');
      if (btn) {
        btn.click();
        console.log('Плагин: кнопка full-screen нажата.');
      } else {
        console.warn('Плагин: элемент .head__action.selector.full-screen не найден.');
      }
    }

    function initializePlugin() {
      // Задержка позволяет дождаться формирования нужного элемента
      setTimeout(function () {
        clickFullScreen();
      }, 500);
    }

    if (window.appready) {
      initializePlugin();
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          initializePlugin();
        }
      });
    }

  })();
})();
