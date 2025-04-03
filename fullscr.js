(function() {
  'use strict';

  function clickFullScreen() {
    var fullScreenBtn = document.querySelector('.head__action.selector.full-screen');
    if (fullScreenBtn) {
      fullScreenBtn.click();
      console.log('Полноэкранная кнопка автоматически нажата.');
    } else {
      console.warn('Кнопка полноэкранного режима не найдена.');
    }
  }

  function initPlugin() {
    if (window.appready) {
      clickFullScreen();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
      Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
          clickFullScreen();
        }
      });
    } else {
      window.addEventListener('load', clickFullScreen);
    }
  }

  initPlugin();
})();
