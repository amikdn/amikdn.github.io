Object.defineProperty(Lampa.Account, 'hasPremium', {
  value: () => 1,
  writable: false, // Блокируем перезапись
  configurable: false // Блокируем изменение дескриптора
});
console.log('hasPremium locked:', Lampa.Account.hasPremium()); // Для отладки
