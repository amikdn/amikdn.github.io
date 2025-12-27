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
    }

    function hideQrAds() {
      // Скрываем рекламные QR-блоки в Синхронизации и TorrServer
      $('[class*="qr"], [class*="qrcode"], img[src*="qr"], .account-sync__qr, .qr-code, .sync-premium').closest('div, .settings-param, .settings-folder').hide();
      $('div:contains("Премиум"), div:contains("CUB Premium"), div:contains("подписка"), span:contains("QR")').closest('.settings-param, .settings-folder__item').hide();
    }

    function clearAdTimers() {
      for (let i = 1; i < 5000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    }

    function initializeApp() {
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

      // Пропуск pre-roll рекламы
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
            }, 300);
          };
          return video;
        }
        return origCreateElement.apply(this, arguments);
      };

      document.addEventListener("DOMContentLoaded", clearAdTimers);
      setTimeout(clearAdTimers, 1000);

      // Глобальные стили (без затрагивания синхронизации полностью)
      const style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe, [class*="subscribe"]:not([class*="sync"]),
        [class*="premium"]:not(.premium-quality):not([class*="sync"]),
        .open--premium, .open--feed, .open--notice, .icon--blink,
        [class*="black-friday"], [class*="christmas"], [class*="ad-"],
        .ad-server, .ad-bot, .card__textbox,
        .full-reviews ~ div,
        /* QR-реклама */
        [class*="qr"], [class*="qrcode"], .account-sync__qr, .qr-code { display: none !important; }
      `;
      document.head.appendChild(style);

      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'build' && event.name === 'discuss') {
          setTimeout(() => $('.full-reviews').closest('[class*="premium"], div').remove(), 150);
        }
      });

      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

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

      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);

      // Очистка при открытии настроек (включая QR-рекламу)
      Lampa.Settings.listener.follow('open', function () {
        setTimeout(() => {
          hideLockedItems();
          hideQrAds();
        }, 200);
      });

      Lampa.Storage.listener.follow('change', function () {
        setTimeout(() => {
          hideLockedItems();
          hideQrAds();
        }, 300);
      });

      setTimeout(() => {
        hideLockedItems();
        hideQrAds();
      }, 500);
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
