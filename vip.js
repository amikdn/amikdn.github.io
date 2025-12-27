(function () {
  'use strict';
  Lampa.Platform.tv();
  (function () {
    var isCardProcessed = 0;

    function removeAdsOnToggle() {
      Lampa.Controller.listener.follow('toggle', function (event) {
        if (event.name === 'select') {
          setTimeout(function () {
            if (Lampa.Activity.active().component === 'full') {
              $('[class*="ad-"], .ad-server, .ad-bot').remove();
            }
            if (Lampa.Activity.active().component === 'modss_online') {
              $('.selectbox-item--icon').remove();
            }
          }, 200);
        }
      });
    }

    function hideLockedItems() {
      setTimeout(function () {
        // Более универсально: ищем по классу lock или тексту
        $('.selectbox-item__lock, [class*="lock"], [class*="locked"]').parent().css('display', 'none');
        $('[class*="premium"], [class*="subscribe"], .button--subscribe, .settings--account-premium').remove();
        $('div > span:contains("Статус"), div > span:contains("Premium"), div > span:contains("Подписка")').parent().parent().remove();
      }, 200);
    }

    function observeDomChanges() {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].type === 'childList') {
            var cards = document.getElementsByClassName('card');
            if (cards.length > 0 && isCardProcessed === 0) {
              isCardProcessed = 1;
              hideLockedItems();
              setTimeout(function () { isCardProcessed = 0; }, 800);
              observer.disconnect();
              break;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 15000);
    }

    function clearAdTimers() {
      for (let i = 0; i < 10000; i++) { // Увеличено для надёжности
        clearTimeout(i);
        clearInterval(i);
      }
    }

    function initializeApp() {
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true; // Имитация премиума

      // Перехват видео для пропуска рекламы
      const origCreateElement = document.createElement;
      document.createElement = function(tag) {
        if (tag.toLowerCase() === 'video') {
          const video = origCreateElement.apply(this, arguments);
          const origPlay = video.play;
          video.play = function() {
            setTimeout(() => {
              video.pause();
              video.currentTime = video.duration || 999999;
              video.dispatchEvent(new Event('ended'));
            }, 300);
          };
          return video;
        }
        return origCreateElement.apply(this, arguments);
      };

      // Стили
      const style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe, [class*="subscribe"], [class*="premium"], .open--premium, .open--feed, .open--notice,
        .icon--blink, .black-friday__button, .christmas__button, [class*="ad-"], .ad-server, .ad-bot { display: none !important; }
      `;
      document.head.appendChild(style);

      // Удаление отзывов/комментариев с премиум-напоминалками
      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'build' && event.name === 'discuss') {
          setTimeout(() => $('.full-reviews').closest('[class*="premium"]').remove(), 200);
        }
      });

      // Регион и другие
      $(document).ready(() => {
        localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));
      });

      // TV раздел
      $('[data-action="tv"]').on('hover:enter hover:click hover:touch', () => {
        const interval = setInterval(() => {
          $('[class*="ad-"], .ad-bot, .card__textbox').remove();
        }, 500);
        setTimeout(() => clearInterval(interval), 12000);
      });

      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1500);

      Lampa.Settings.listener.follow('open', function (event) {
        if (event.name === 'account' || event.name === 'server') {
          setTimeout(() => {
            $('[class*="premium"], [class*="subscribe"], .ad-server').remove();
          }, 200);
        }
      });

      Lampa.Storage.listener.follow('change', function (event) {
        if (event.name === 'activity') {
          setTimeout(observeDomChanges, 300);
        }
      });

      clearAdTimers();
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
          $('[data-action="feed"], [data-action="subscribes"], [data-action="myperson"]').remove();
        }
      });
    }
  })();
})();

