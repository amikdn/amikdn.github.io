(function () {
  'use strict';
  Lampa.Platform.tv();

  (function () {
    function initializeApp() {
      // Имитация премиум-аккаунта
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

      // Глобальные стили для скрытия элементов
      var style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe,
        [class*="subscribe"],
        [class*="premium"]:not(.premium-quality),
        .open--premium,
        .open--feed,
        .open--notice,
        .icon--blink,
        [class*="black-friday"],
        [class*="christmas"],
        [class*="ad-"],
        .ad-server,
        .ad-bot,
        .selectbox-item__lock,
        [class*="lock"],
        [class*="locked"],
        .settings--account-premium,
        .full-reviews ~ div { display: none !important; }
      `;
      document.head.appendChild(style);

      // Скрытие заблокированных items и статусов
      function hideLockedAndPremium() {
        $('.selectbox-item__lock, [class*="lock"], [class*="locked"]').closest('.selectbox-item').css('display', 'none');
        $('div > span:contains("Статус"), div > span:contains("Premium"), div > span:contains("Подписка"), div > span:contains("CUB Premium")').closest('div').remove();
        $('[class*="premium"], .button--subscribe, .ad-server, .ad-bot').remove();
      }

      // При открытии настроек
      Lampa.Settings.listener.follow('open', function (e) {
        setTimeout(hideLockedAndPremium, 200);
      });

      // При полной загрузке карточки
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' || e.type === 'build') {
          setTimeout(hideLockedAndPremium, 200);
        }
      });

      // При смене активности (закладки и т.д.)
      Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === 'activity') {
          setTimeout(hideLockedAndPremium, 300);
        }
      });

      // Удаление лишних пунктов меню при готовности приложения
      if (window.appready) {
        $('[data-action="feed"], [data-action="subscribes"], [data-action="myperson"]').remove();
      }

      // Регион UK (для обхода некоторых ограничений)
      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

      // Дополнительная очистка при toggle
      Lampa.Controller.listener.follow('toggle', function () {
        setTimeout(hideLockedAndPremium, 200);
      });

      hideLockedAndPremium(); // Первоначальная очистка
    }

    if (window.appready) {
      initializeApp();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
          initializeApp();
          $('[data-action="feed"], [data-action="subscribes"], [data-action="myperson"]').remove();
        }
      });
    }
  })();
})();

