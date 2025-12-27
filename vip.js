(function () {
  'use strict';
  Lampa.Platform.tv();

  (function () {
    function hideLockedItems() {
      $('.selectbox-item__lock, [class*="lock"], [class*="locked"]').closest('.selectbox-item').hide();
    }

    function instantRemovePreroll() {
      // Мгновенное удаление окна "Реклама" при любом появлении
      const observer = new MutationObserver(() => {
        $('.ad-preroll').remove();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // Страховка каждые 50 мс
      setInterval(() => $('.ad-preroll').remove(), 50);
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

          // Перехват play — пропуск без задержки
          const origPlay = video.play;
          video.play = function() {
            const result = origPlay ? origPlay.apply(this, arguments) : Promise.resolve();
            forceEndAd();
            return result;
          };

          // Дополнительно на события
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

      // Стили — скрываем всё лишнее, включая preroll
      const style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe,
        [class*="subscribe"]:not([class*="sync"]),
        [class*="premium"]:not(.premium-quality):not([class*="sync"]),
        .open--premium, .open--feed, .open--notice,
        .icon--blink, [class*="black-friday"], [class*="christmas"],
        .ad-server, .ad-bot, .full-start__button.button--options,
        .ad-preroll { display: none !important; visibility: hidden !important; }
      `;
      document.head.appendChild(style);

      // Регион UK
      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

      // Базовая очистка
      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);

      // Замки
      Lampa.Settings.listener.follow('open', () => setTimeout(hideLockedItems, 150));
      Lampa.Storage.listener.follow('change', () => setTimeout(hideLockedItems, 300));
      setTimeout(hideLockedItems, 500);

      // Запуск механизмов пропуска рекламы
      instantRemovePreroll();
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
