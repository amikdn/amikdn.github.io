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

    function customizePreroll() {
      const observer = new MutationObserver(function () {
        const preroll = document.querySelector('.ad-preroll');
        if (preroll && !preroll.dataset.customized) {
          preroll.dataset.customized = 'true';

          // Текст → "Приятного просмотра"
          const textEl = preroll.querySelector('.ad-preroll__text');
          if (textEl) textEl.textContent = 'Приятного Просмотра';

          // Постер из карточки
          let posterUrl = '';
          const posterImg = document.querySelector('.full-start__poster img, .full-start__background img, img.poster, .full-start__img img');
          if (posterImg && posterImg.src && posterImg.src.includes('imagetmdb.com')) {
            posterUrl = posterImg.src;
          }

          // Фон с постером и затемнением
          if (posterUrl) {
            preroll.style.background = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${posterUrl}) center/cover no-repeat`;
            preroll.style.backgroundSize = 'cover';
          } else {
            preroll.style.background = 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8))';
          }

          // Скрываем серую анимацию
          const bgEl = preroll.querySelector('.ad-preroll__bg');
          if (bgEl) bgEl.style.opacity = '0';

          // Стиль текста (по желанию)
          if (textEl) {
            textEl.style.fontSize = '2em';
            textEl.style.fontWeight = 'bold';
          }
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
            }, 1);
          };
          return video;
        }
        return origCreateElement.apply(this, arguments);
      };

      // Расширенные стили: скрываем баннеры, кнопки, новогоднюю ёлку и колокольчик уведомлений
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

      // Базовая очистка баннеров
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


