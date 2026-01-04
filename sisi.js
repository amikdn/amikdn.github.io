;(function () {
  'use strict';

  Lampa.Platform.tv();

  // Список зеркал для загрузки внешнего скрипта sisi.js
  const scriptMirrors = [
    'http://89.110.97.220:10254/sisi.js',
    'https://ab2024.ru/sisi.js',
    'http://139.28.220.127:9118/sisi.js',
    'https://lam.maxvol.pro/sisi.js',
    'http://91.184.245.56:9215/sisi.js',
  ];

  // Выбираем случайное зеркало
  const randomScript = scriptMirrors[Math.floor(Math.random() * scriptMirrors.length)];

  // Асинхронная загрузка скрипта
  Lampa.Utils.putScriptAsync([randomScript], () => {

  });
})();
