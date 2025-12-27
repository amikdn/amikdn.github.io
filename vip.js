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
      // Наблюдатель за появлением заставки preroll
      const observer = new MutationObserver(function () {
        const preroll = $('.ad-preroll');
        if (preroll.length) {
          // Меняем текст на "Приятного просмотра"
          $('.ad-preroll__text').text('Приятного просмотра');

          // Берём URL постера из карточки фильма (обычно в .full-start__poster или img)
          let posterUrl = $('.full-start__poster img').attr('src') || 
                         $('.full-start__background img').attr('src') || 
                         $('img.poster').attr('src') || 
                         'https://via.placeholder.com/1920x1080?text=No+Poster'; // запасной

          // Устанавливаем постер как фон с затемнением
          preroll.css({
            'background': `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${posterUrl}) no-repeat center center / cover`,
            'background-size': 'cover'
          });

          // Убираем серую анимацию фона (если нужно полностью)
          $('.ad-preroll__bg').css('opacity', '0');
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Дополнительно для надёжности
      setInterval(() => {
        $('.ad-preroll__text').text('Приятного просмотра');
      }, 300);
    }

    function initializeApp() {
      window.Account = window.Account || {};
      window.Account.hasPremium = () => true;

      // Мгновенный пропуск pre-roll
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

      // Минимальные стили
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

      // Запуск кастомизации preroll
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
