(function () {
  'use strict';

  Lampa.Platform.tv();

  // Начальное переопределение checkPremium
  window.checkPremium = () => {
    console.log('checkPremium overridden (window), returning 1');
    return 1;
  };
  Lampa.Account.checkPremium = () => {
    console.log('checkPremium overridden (Lampa.Account), returning 1');
    return 1;
  };
  console.log('Initial hasPremium check:', Lampa.Account.hasPremium());

  // Периодическая проверка для предотвращения перезаписи
  var checkPremiumInterval = setInterval(function () {
    if (typeof Lampa.Account.checkPremium !== 'function' || Lampa.Account.checkPremium() !== 1) {
      Lampa.Account.checkPremium = () => {
        console.log('checkPremium re-overridden (Lampa.Account), returning 1');
        return 1;
      };
      console.log('hasPremium recheck:', Lampa.Account.hasPremium());
    }
  }, 500);

  // Остановить интервал через 10 секунд
  setTimeout(function () {
    clearInterval(checkPremiumInterval);
    console.log('checkPremium interval stopped');
  }, 10000);

  (function () {
    var isCardProcessed = 0;

    function removeAdsOnToggle() {
      Lampa.Controller.listener.follow('toggle', function (event) {
        if (event.name === 'select') {
          setTimeout(function () {
            if (Lampa.Activity.active().component === 'full') {
              if (document.querySelector('.ad-server') !== null) {
                $('.ad-server').remove();
              }
            }
            if (Lampa.Activity.active().component === 'modss_online') {
              $('.selectbox-item--icon').remove();
            }
          }, 100);
        }
      });
    }

    function hideLockedItems() {
      setTimeout(function () {
        $('.selectbox-item__lock').parent().css('display', 'none');
        if (!$('[data-name="account_use"]').length) {
          $('div > span:contains("Статус")').parent().remove();
        }
      }, 100);
    }

    function observeDomChanges() {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          if (mutation.type === 'childList') {
            var cards = document.getElementsByClassName('card');
            if (cards.length > 0) {
              if (isCardProcessed === 0) {
                isCardProcessed = 1;
                hideLockedItems();
                setTimeout(function () {
                  isCardProcessed = 0;
                }, 500);
              }
              observer.disconnect();
              break;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () {
        observer.disconnect();
      }, 10000);
    }

    function initializeApp() {
      // Повторное переопределение checkPremium для надёжности
      window.checkPremium = () => {
        console.log('checkPremium overridden (window, initializeApp), returning 1');
        return 1;
      };
      Lampa.Account.checkPremium = () => {
        console.log('checkPremium overridden (Lampa.Account, initializeApp), returning 1');
        return 1;
      };
      console.log('hasPremium check (initializeApp):', Lampa.Account.hasPremium());

      var style = document.createElement('style');
      style.innerHTML = '.button--subscribe { display: none; }';
      document.body.appendChild(style);

      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'build' && event.name === 'discuss') {
          setTimeout(function () {
            $('.full-reviews').parent().parent().parent().parent().remove();
          }, 100);
        }
      });

      $('[data-action="tv"]').on('hover:enter hover:click hover:touch', function () {
        var adBotInterval = setInterval(function () {
          if (document.querySelector('.ad-bot') !== null) {
            $('.ad-bot').remove();
            clearInterval(adBotInterval);
            setTimeout(function () {
              Lampa.Controller.toggle('content');
            }, 100);
          }
        }, 500);
        setTimeout(function () {
          clearInterval(adBotInterval);
        }, 10000);

        var cardTextInterval = setInterval(function () {
          if (document.querySelector('.card__textbox') !== null) {
            $('.card__textbox').parent().parent().remove();
            clearInterval(cardTextInterval);
          }
        }, 500);
        setTimeout(function () {
          clearInterval(cardTextInterval);
        }, 10000);
      });

      setTimeout(function () {
        $('.open--feed').remove();
        $('.open--premium').remove();
        $('.open--notice').remove();
        if ($('.icon--blink').length > 0) {
          $('.icon--blink').remove();
        }
        if ($('.black-friday__button').length > 0) {
          $('.black-friday__button').remove();
        }
        if ($('.christmas__button').length > 0) {
          $('.christmas__button').remove();
        }
      }, 1000);

      Lampa.Settings.listener.follow('open', function (event) {
        if (event.name === 'account') {
          setTimeout(function () {
            $('.settings--account-premium').remove();
            $('div > span:contains("CUB Premium")').remove();
          }, 100);
        }
        if (event.name === 'server') {
          if (document.querySelector('.ad-server') !== null) {
            $('.ad-server').remove();
          }
        }
      });

      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'complite') {
          $('.button--book').on('hover:enter', function () {
            hideLockedItems();
          });
        }
      });

      Lampa.Storage.listener.follow('change', function (event) {
        if (event.name === 'activity') {
          if (Lampa.Activity.active().component === 'bookmarks') {
            $('.register:nth-child(4)').hide();
            $('.register:nth-child(5)').hide();
            $('.register:nth-child(6)').hide();
            $('.register:nth-child(7)').hide();
            $('.register:nth-child(8)').hide();
          }
          setTimeout(function () {
            observeDomChanges();
          }, 200);
        }
      });
    }

    if (window.appready) {
      initializeApp();
      observeDomChanges();
      removeAdsOnToggle();
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          initializeApp();
          observeDomChanges();
          removeAdsOnToggle();
          $('[data-action="feed"]').eq(0).remove();
          $('[data-action="subscribes"]').eq(0).remove();
          $('[data-action="myperson"]').eq(0).remove();
        }
      });
    }
  })();
})();
