function initializeApp() {
  // Переопределяем checkPremium
  window.checkPremium = () => {
    console.log('checkPremium overridden, returning 1');
    return 1;
  };
  // Проверяем hasPremium
  console.log('hasPremium check:', Lampa.Account.hasPremium());

  // Остальной код плагина...
  var style = document.createElement('style');
  style.innerHTML = '.button--subscribe { display: none; }';
  document.body.appendChild(style);
  // ... и так далее
}
