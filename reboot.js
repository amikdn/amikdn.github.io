(function() {
  'use strict';

  // Создаём HTML-разметку кнопки перезагрузки
  var reloadButtonHTML = '<div id="RELOAD" class="head__action selector reload-screen">' +
      '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke-width="0"></g>' +
        '<g stroke-linecap="round" stroke-linejoin="round"></g>' +
        '<g>' +
          '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
        '</g>' +
      '</svg>' +
    '</div>';

  // Находим контейнер для кнопок в шапке (зависит от разметки приложения Lamp)
  var headerActions = document.querySelector('#app > div.head > div > div.head__actions');
  if (headerActions) {
    headerActions.insertAdjacentHTML('beforeend', reloadButtonHTML);
  }

  // Добавляем обработчик события – при клике происходит перезагрузка приложения
  var reloadButton = document.getElementById('RELOAD');
  if (reloadButton) {
    reloadButton.addEventListener('click', function(){
      location.reload();
    });
  }
})();
