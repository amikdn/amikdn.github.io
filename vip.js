(function () {
  'use strict';
  Lampa.Platform.tv();

  (function () {
    function hideLockedItems() {
      $('.selectbox-item__lock, [class*="lock"], [class*="locked"]').closest('.selectbox-item').hide();
    }

    function skipPreRollVideoInstantly() {
      const origCreateElement = document.createElement;
      document.createElement = function(tag) {
        if (tag.toLowerCase() === 'video') {
          const video = origCreateElement.apply(this, arguments);

          const forceEndAd = () => {
            if (video.duration && video.currentTime < video.duration) {
              video.currentTime = video.duration;
              video.pause();
              video.dispatchEvent(new Event('ended'));
              video.dispatchEvent(new Event('timeupdate'));
              video.dispatchEvent(new Event('canplaythrough'));
            }
          };

          const origPlay = video.play;
          video.play = function() {
            const result = origPlay ? origPlay.apply(this, arguments) : Promise.resolve();
            forceEndAd();
            return result;
          };

          video.addEventListener('play', forceEndAd);
          video.addEventListener('playing', forceEndAd);
          video.addEventListener('loadstart', forceEndAd);
          video.addEventListener('canplay', forceEndAd);

          return video;
        }
        return origCreateElement.apply(this, arguments);
      };
    }

    function initializeApp() {
      // Имитация премиума
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

      // CSS: полностью скрываем preroll визуально, но не удаляем из DOM
      const style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe,
        [class*="subscribe"]:not([class*="sync"]),
        [class*="premium"]:not(.premium-quality):not([class*="sync"]),
        .open--premium, .open--feed, .open--notice,
        .icon--blink, [class*="black-friday"], [class*="christmas"],
        .ad-server, .ad-bot, .full-start__button.button--options,

        /* Полное скрытие preroll без мигания */
        .ad-preroll,
        .ad-preroll__bg,
        .ad-preroll__text,
        .ad-preroll__over {
          display: block !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
      `;
      document.head.appendChild(style);

      // Регион UK
      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

      // Базовая очистка баннеров (кроме preroll — его не трогаем)
      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);

      // Замки
      Lampa.Settings.listener.follow('open', () => setTimeout(hideLockedItems, 150));
      Lampa.Storage.listener.follow('change', () => setTimeout(hideLockedItems, 300));
      setTimeout(hideLockedItems, 500);

      // Мгновенный пропуск видео-рекламы
      skipPreRollVideoInstantly();
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
