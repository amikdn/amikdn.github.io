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
          }, 150);
        }
      });
    }

    function hideLockedItems() {
      $('.selectbox-item__lock, [class*="lock"], [class*="locked"]').closest('.selectbox-item').hide();
    }

    function customizePrerollOnce() {
      // Срабатывает один раз при появлении .ad-preroll
      const observer = new MutationObserver(function (mutations) {
        const preroll = document.querySelector('.ad-preroll');
        if (preroll && !preroll.dataset.customized) {  // чтобы не срабатывать повторно
          preroll.dataset.customized = 'true';

          // Меняем текст
          const textEl = preroll.querySelector('.ad-preroll__text');
          if (textEl) textEl.textContent = 'Приятного просмотра';

          // Берём постер из карточки фильма
          let posterUrl = '';
          const posterImg = document.querySelector('.full-start__poster img, .full-start__background img, img.poster');
          if (posterImg && posterImg.src) {
            posterUrl = posterImg.src;
          }

          // Устанавливаем постер как фон с затемнением
          if (posterUrl) {
            preroll.style.background = `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${posterUrl}) center/cover no-repeat`;
          }

          // Скрываем серую анимацию фона
          const bgEl = preroll.querySelector('.ad-preroll__bg');
          if (bgEl) bgEl.style.opacity = '0';

          // Отключаем observer после первого срабатывания — чтобы не нагружать
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    function initializeApp() {
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

      // Мгновенный пропуск pre-roll рекламы
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
            }, 100);
          };
          return video;
        }
        return origCreateElement.apply(this, arguments);
      };

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
        .ad-server,
        .ad-bot,
        .full-start__button.button--options { display: none !important; }
      `;
      document.head.appendChild(style);

      localStorage.setItem('region', JSON.stringify({code: "uk", time: Date.now()}));

      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);

      Lampa.Settings.listener.follow('open', () => setTimeout(hideLockedItems, 150));
      Lampa.Storage.listener.follow('change', () => setTimeout(hideLockedItems, 300));
      setTimeout(hideLockedItems, 500);

      // Кастомизация preroll — безопасно и один раз
      customizePrerollOnce();
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
