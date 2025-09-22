(function () {
  'use strict';
  Lampa.Platform.tv();

  // Перехват checkPremium сразу
  window.checkPremium = () => {
    console.log('checkPremium overridden, returning 1');
    return 1;
  };
  console.log('hasPremium check:', Lampa.Account.hasPremium());

  // Остальной код плагина
  function initializeApp() {
    var style = document.createElement('style');
    style.innerHTML = '.button--subscribe { display: none; }';
    document.body.appendChild(style);
    // ... и так далее
  }
  // ... остальной код
})();
