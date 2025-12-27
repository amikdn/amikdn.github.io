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

    function customizePreroll() {
      const observer = new MutationObserver(function () {
        const preroll = document.querySelector('.ad-preroll');
        if (preroll && !preroll.dataset.customized) {
          preroll.dataset.customized = 'true';

          // Текст → "Приятного просмотра"
          const textEl = preroll.querySelector('.ad-preroll__text');
          if (textEl) {
            textEl.textContent = 'Приятного просмотра';
            textEl.style.fontSize = '2.2em';
            textEl.style.fontWeight = 'bold';
            textEl.style.color = '#ffffff';
            textEl.style.textShadow = '0 0 10px rgba(0,0,0,0.8)';
          }

          // Красивый тёмный градиентный фон БЕЗ постера
          preroll.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(10,20,40,0.95))';
          preroll.style.backgroundSize = 'cover';
          preroll.style.backgroundPosition = 'center';

          // Скрываем стандартную серую анимацию
          const bgEl = preroll.querySelector('.ad-preroll__bg');
          if (bgEl) bgEl.style.opacity = '0';

          // Дополнительно скрываем оверлей, если он мешает
          const overEl = preroll.querySelector('.ad-preroll__over');
          if (overEl) overEl.style.opacity = '0';
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    function initializeApp() {
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
            }, 0.000001);
          };
          return video;
        }
        return origCreateElement.apply(this, arguments);
      };

      // Стили для скрытия лишних элементов
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
        .full-start__button.button--options,
        .new-year__button,
        .notice--icon { display: none !important; }
      `;
      document.head.appendChild(style);

      // Очистка баннеров
      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);

      // Кастомизация preroll-заставки
      customizePreroll();
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
