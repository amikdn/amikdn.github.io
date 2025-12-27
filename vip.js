(function () {
  'use strict';
  Lampa.Platform.tv();

  (function () {
    function removeAdsOnToggle() {
      Lampa.Controller.listener.follow('toggle', function (event) {
        if (event.name === 'select') {
          setTimeout(function () {
            if (Lampa.Activity.active().component === 'full') {
              $('.ad-server, .ad-bot, .ad-preroll').remove();
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

    function skipPrerollAd() {
      const prerollObserver = new MutationObserver(function () {
        if ($('.ad-preroll').length) {
          $('.ad-preroll').remove();
        }
      });
      prerollObserver.observe(document.body, { childList: true, subtree: true });

      setInterval(() => {
        $('.ad-preroll').remove();
      }, 500);
    }

    function initializeApp() {
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

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

      // CSS без .card__textbox — ничего не трогаем в карточках контента
      const style = document.createElement('style');
      style.innerHTML = `
        .button--subscribe,
        [class*="subscribe"]:not([class*="sync"]),
        [class*="premium"]:not(.premium-quality):not([class*="sync"]),
        .open--premium,
        .open--feed,
        .open--notice,
        .icon--blink,
        [class*="black-friday"],
        [class*="christmas"],
        [class*="ad-"],
        .ad-server,
        .ad-bot,
        .ad-preroll,
        .full-start__button.button--options,
        .ad-preroll { display: none !important; }
      `;
      document.head.appendChild(style);

      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

      // В TV-разделе больше НЕ удаляем .card__textbox (чтобы не задеть другие карточки)
      $('[data-action="tv"]').on('hover:enter hover:click hover:touch', function () {
        const adBotInt = setInterval(() => {
          if ($('.ad-preroll').length) {
            $('.ad-preroll').remove();
            clearInterval(adBotInt);
          }
        }, 500);
        setTimeout(() => clearInterval(adBotInt), 12000);
      });

      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"], .ad-preroll').remove();
      }, 1000);

      Lampa.Settings.listener.follow('open', () => setTimeout(hideLockedItems, 150));
      Lampa.Storage.listener.follow('change', () => setTimeout(hideLockedItems, 300));
      setTimeout(hideLockedItems, 500);

      skipPrerollAd();
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



