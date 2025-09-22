function initializeApp() {
  window.checkPremium = () => {
    console.log('checkPremium overridden, returning 1');
    return 1;
  };
  console.log('hasPremium check:', Lampa.Account.hasPremium());
  var style = document.createElement('style');
  style.innerHTML = '.button--subscribe { display: none; }';
  document.body.appendChild(style);
}
