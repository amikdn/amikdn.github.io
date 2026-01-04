(function () {
  'use strict';

  Lampa.Platform.tv();

  function initExternalScriptLoader() {
    // Список зеркал для загрузки внешнего скрипта sisi.js
    const scriptMirrors = [
      'http://89.110.97.220:10254/sisi.js',
      'https://ab2024.ru/sisi.js',
      'http://139.28.220.127:9118/sisi.js',
      'http://185.121.235.124:11176/sisi.js',
      'http://144.124.225.106:11310/sisi.js',
      'http://83.217.212.10:12128/sisi.js',
      'http://91.184.245.56:9215/sisi.js',
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
})();
