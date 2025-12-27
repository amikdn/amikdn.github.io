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

    function customizePrerollWithLogo() {
      const observer = new MutationObserver(function () {
        const preroll = document.querySelector('.ad-preroll');
        if (preroll && !preroll.dataset.customized) {
          preroll.dataset.customized = 'true';

          // Скрываем стандартный текст и серый фон
          const textEl = preroll.querySelector('.ad-preroll__text');
          if (textEl) textEl.style.display = 'none';

          const bgEl = preroll.querySelector('.ad-preroll__bg');
          if (bgEl) bgEl.style.opacity = '0';

          // Создаём контейнер для логотипа и названия
          const container = document.createElement('div');
          container.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            width: 90%;
            pointer-events: none;
          `;

          const logoImg = document.createElement('img');
          logoImg.style.cssText = 'max-width: 80%; max-height: 150px; margin-bottom: 20px;';
          container.appendChild(logoImg);

          const titleSpan = document.createElement('div');
          titleSpan.style.cssText = 'color: white; font-size: 2em; font-weight: bold; text-shadow: 2px 2px 8px black;';
          container.appendChild(titleSpan);

          preroll.appendChild(container);

          // Получаем данные текущего фильма из активности Lampa
          const activity = Lampa.Activity.active();
          if (!activity || !activity.movie) return;

          const data = activity.movie;
          const type = data.name ? 'tv' : 'movie'; // сериал или фильм
          const tmdbId = data.id;

          if (!tmdbId) {
            titleSpan.textContent = data.title || data.name || 'Приятного просмотра';
            return;
          }

          // Запрос к TMDB за логотипами (как в твоём плагине)
          const url = Lampa.TMDB.api(type + '/' + tmdbId + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));

          $.get(url, function (response) {
            if (response.logos && response.logos.length > 0) {
              let logoPath = response.logos[0].file_path;
              let logoUrl = Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png'));

              logoImg.src = logoUrl;
              logoImg.style.display = 'block';
            }

            // Оригинальное название (на английском)
            titleSpan.textContent = data.original_title || data.original_name || data.title || data.name;
          }).fail(function () {
            titleSpan.textContent = data.title || data.name || 'Приятного просмотра';
          });
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
            }, 0.0001);
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
        .full-start__button.button--options,
        .new-year__button,
        .notice--icon { display: none !important; }
      `;
      document.head.appendChild(style);

      setTimeout(() => {
        $('.open--feed, .open--premium, .open--notice, .icon--blink, [class*="friday"], [class*="christmas"]').remove();
      }, 1000);


      // Кастомизация preroll с логотипом и названием
      customizePrerollWithLogo();
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
