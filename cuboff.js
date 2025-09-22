Lampa.Account = new Proxy(Lampa.Account, {
  get(target, prop) {
    if (prop === 'hasPremium') {
      return () => {
        console.log('hasPremium intercepted, returning 1');
        return 1;
      };
    }
    return target[prop];
  }
});
