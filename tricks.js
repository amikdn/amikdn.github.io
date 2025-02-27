(function(){
  'use strict';

  // Инициализация платформы (TV)
  Lampa.Platform.tv();

  // Функция выхода из приложения Lamp (с учётом разных платформ)
  function exitLamp() {
    try {
      if (Lampa && Lampa.Activity) Lampa.Activity.out();
    } catch(e){}
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

  // Функция добавления кнопок перезагрузки и выхода в шапку
  function addHeaderButtons(){
    try{
      // Находим контейнер для кнопок в шапке (при необходимости скорректируйте селектор)
      var headerActions = document.querySelector('#app .head__actions');
      if(!headerActions) return;

      var reloadButtonHTML = '<div id="RELOAD" class="head__action selector reload-screen" tabindex="0">' +
          '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"></path>' +
          '</svg>' +
        '</div>';

      var exitButtonHTML = '<div id="EXIT" class="head__action selector exit-screen" tabindex="0">' +
          '<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="2" y="2" width="20" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2"></rect>' +
            '<line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="2"></line>' +
            '<line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="2"></line>' +
          '</svg>' +
        '</div>';

      headerActions.insertAdjacentHTML('beforeend', reloadButtonHTML + exitButtonHTML);

      var reloadButton = document.getElementById('RELOAD');
      var exitButton = document.getElementById('EXIT');

      if(reloadButton){
        reloadButton.addEventListener('click', function(){ location.reload(); });
        reloadButton.addEventListener('keydown', function(e){ if(e.keyCode===13||e.keyCode===32) location.reload(); });
      }
      if(exitButton){
        exitButton.addEventListener('click', function(){ exitLamp(); });
        exitButton.addEventListener('keydown', function(e){ if(e.keyCode===13||e.keyCode===32) exitLamp(); });
      }
    } catch(e){
      console.error(e);
    }
  }

  // Добавляем в меню плагина его значок (иконку запуска)
  Lampa.SettingsApi.addComponent({
    component: 'Multi_Menu_Component',
    name: 'My Plugin',
    icon: '<svg viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg" fill="#000000">' +
            '<path d="M512 96C264.6 96 64 296.6 64 544s200.6 448 448 448 448-200.6 448-448S759.4 96 512 96zm0 820c-205.9 0-372-166.1-372-372S306.1 172 512 172s372 166.1 372 372-166.1 372-372 372z"/>' +
          '</svg>',
    onSelect: function(){
         // Здесь разместите запуск нужной функциональности плагина (например, открыть модальное окно)
         alert('Plugin launched!');
    }
  });

  // Ждём готовности приложения и добавляем кнопки в шапку
  if(window.appready){
    addHeaderButtons();
  } else if(typeof Lampa !== 'undefined' && Lampa.Listener){
    Lampa.Listener.follow('app', function(e){
      if(e.type==='ready'){
        addHeaderButtons();
      }
    });
  } else {
    window.addEventListener('load', function(){
      addHeaderButtons();
    });
  }

  // Можно добавить и другие функции плагина, например, обновление стилей, скрытие трейлеров, часы и т.д.
  // (Остальной исходный код, не связанный с запуском плагина, можно оставить или удалить по необходимости)

})();
