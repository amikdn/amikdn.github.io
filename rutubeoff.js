(function () {
  // Сохраняем оригинальную функцию VPN.region, если она существует
  var originalRegion = window.VPN ? window.VPN.region : null;

  // Переопределяем функцию VPN.region
  window.VPN = window.VPN || {};
  window.VPN.region = function (callback) {
    // Вызываем оригинальную функцию, если она есть
    if (originalRegion) {
      originalRegion(function (code) {
        // Игнорируем загрузку rutube.js для региона 'ru'
        if (code === 'ru') {
          console.log('Пропущена загрузка rutube.js для региона ru');
          return;
        }
        // Вызываем callback для других регионов
        callback(code);
      });
    } else {
      // Если оригинальной функции нет, просто ничего не делаем
      console.log('VPN.region не найден, rutube.js не загружается');
    }
  };

  // Логируем запуск плагина
  console.log('Плагин для отключения rutube.js активирован');
})();