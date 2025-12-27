(function () {
  'use strict';
  Lampa.Platform.tv();

  (function () {
    function removeAdsOnToggle() {
      Lampa.Controller.listener.follow('toggle', function (event) {
        if (event.name === 'select') {
          setTimeout(function () {
            if (Lampa.Activity.active().component === 'full') {
              $('.ad-server, .ad-bot').remove();
            }
            if (Lampa.Activity.active().component === 'modss_online') {
              $('.selectbox-item--icon').remove();
            }
          }, 150);
        }
      });
    }

    function hideLockedItems() {
      $('.selectbox-item__lock, [class*="lock"], [class*="locked"]').closest('.selectbox-item').hide();
      $('div > span:contains("Статус"), div > span:contains("Premium"), div > span:contains("CUB Premium")').parent().parent().remove();
    }

    function clearAdTimers() {
      // Безопасная очистка таймеров (до 5000 — хватает для адблока, но не тормозит)
      for (let i = 1; i < 5000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    }

    function initializeApp() {
      // Имитация премиума
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

      // Пропуск рекламного видео (pre-roll) через фейковый play
      const origCreateElement = document.createElement;
      document.createElement = function(tag) {
        if (tag.toLowerCase() === 'video') {
          const video = origCreateElement.apply(this, arguments);
          const origPlay = video.play;
          video.play = function() {
            if (origPlay) origPlay.apply(this);
            setTimeout(() => {
              video.pause();
              video.currentTime = video.duration || 99999;
              video.dispatchEvent(new Event('ended'));
              video.dispatchEvent(new Event('timeupdate'));
            }, 300); // Короткая задержка для надёжного пропуска
          };
          return video;
        }
        return origCreateElement.apply(this, arguments);
      };

      // Очистка таймеров рекламы при загрузке
      document.addEventListener("DOMContentLoaded", clearAdTimers);
      setTimeout(clearAdTimers, 1000); // Дополнительно

      // Глобальные стили для скрытия элементов
      const style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe, [class*="subscribe"], [class*="premium"]:not(.premium-quality),
        .open--premium, .open--feed, .open--notice, .icon--blink,
        [class*="black-friday"], [class*="christmas"], [class*="ad-"],
        .ad-server, .ad-bot, .card__textbox, .settings--account-premium,
        .full-reviews ~ div { display: none !important; }
      `;
      document.head.appendChild(style);

      // Скрытие отзывов с напоминалкой
      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'build' && event.name === 'discuss') {
          setTimeout(() => $('.full-reviews').closest('[class*="premium"], div').remove(), 150);
        }
      });

      // Регион UK
      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

      // Очистка в TV-разделе (интервалы только здесь)
      $('[data-action="tv"]').on('hover:enter hover:click hover:touch', function () {
        const adBotInt = setInterval(() => {
          if ($('.ad-bot').length) {
            $('.ad-bot').remove();
            clearInterval(adBotInt);
          }
        }, 500);
        const textInt = setInterval(() => {
          if ($('.card__textbox').length) {
            $('.card__textbox').parent().parent().remove();
            clearInterval(textInt);
          }
        }, 500);
        setTimeout(() => {
          clearInterval(adBotInt);
          clearInterval(textInt);
        }, 12000);
      });

      // Базовая очистка баннеров
      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);

      // Очистка в настройках
      Lampa.Settings.listener.follow('open', function (event) {
        setTimeout(() => {
          $('.settings--account-premium, [class*="premium"]').remove();
          hideLockedItems();
        }, 150);
      });

      // При смене активности
      Lampa.Storage.listener.follow('change', function () {
        setTimeout(hideLockedItems, 300);
      });

      // Первоначальная очистка
      setTimeout(hideLockedItems, 500);
    }

    if (window.appready) {
      initializeApp();
      removeAdsOnToggle();
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          initializeApp();
          removeAdsOnToggle();
          $('[data-action="feed"], [data-action="subscribes"], [data-action="myperson"]').remove();
        }
      });
    }
  })();
})();
