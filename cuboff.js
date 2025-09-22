(function () {
  'use strict';

  Lampa.Platform.tv();

  (function () {
    var isCardProcessed = 0;

    function removeAdsOnToggle() {
      Lampa.Controller.listener.follow('toggle', function (event) {
        if (event.name === 'select') {
          setTimeout(function () {
            if (Lampa.Activity.active().component === 'full') {
              if (document.querySelector('.ad-server') !== null) {
                $('.ad-server').remove();
              }
            }
            if (Lampa.Activity.active().component === 'modss_online') {
              $('.selectbox-item--icon').remove();
            }
          }, 100);
        }
      });
    }

    function hideLockedItems() {
      setTimeout(function () {
        $('.selectbox-item__lock').parent().css('display', 'none');
        if (!$('[data-name="account_use"]').length) {
          $('div > span:contains("Статус")').parent().remove();
        }
      }, 100);
    }

    function observeDomChanges() {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          if (mutation.type === 'childList') {
            var cards = document.getElementsByClassName('card');
            if (cards.length > 0) {
              if (isCardProcessed === 0) {
                isCardProcessed = 1;
                hideLockedItems();
                setTimeout(function () {
                  isCardProcessed = 0;
                }, 500);
              }
              observer.disconnect();
              break;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () {
        observer.disconnect();
      }, 10000);
    }

    function initializeApp() {
      // Перехват fetch-запросов для блокировки рекламы
      const originalFetch = window.fetch;
      window.fetch = async function(url, options) {
        if (
          url.includes('ads.betweendigital.com') ||
          url.includes('lbs-ru1.ads.betweendigital.com') ||
          url.includes('eye.targetads.io') ||
          url.includes('impressions.onelink.me') ||
          url.includes('data.ad-score.com') ||
          url.includes('tns-counter.ru') ||
          url.includes('lampa.mx/img/video_poster.png')
        ) {
          console.log('Blocked ad request:', url);
          return Promise.resolve({ ok: true, json: () => ({}), text: () => '' });
        }
        const response = await originalFetch(url, options);
        // Проверяем, содержит ли ответ VAST
        if (response.ok && url.includes('ads.betweendigital.com')) {
          const text = await response.clone().text();
          if (text.includes('<VAST')) {
            console.log('Blocked VAST response:', url);
            return Promise.resolve({ ok: true, json: () => ({}), text: () => '' });
          }
        }
        return response;
      };

      // Перехват создания видеоэлементов
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'video') {
          const originalSetAttribute = element.setAttribute;
          element.setAttribute = function(name, value) {
            if (
              name === 'src' &&
              (value.includes('ads.betweendigital.com') ||
               value.includes('lbs-ru1.ads.betweendigital.com') ||
               value.includes('eye.targetads.io') ||
               value.includes('impressions.onelink.me') ||
               value.includes('data.ad-score.com') ||
               value.includes('tns-counter.ru') ||
               value.includes('lampa.mx'))
            ) {
              console.log('Blocked video source:', value);
              return;
            }
            originalSetAttribute.call(element, name, value);
          };
        }
        return element;
      };

      // Добавление стилей для скрытия подписки
      var style = document.createElement('style');
      style.innerHTML = '.button--subscribe { display: none; }';
      document.body.appendChild(style);

      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'build' && event.name === 'discuss') {
          setTimeout(function () {
            $('.full-reviews').parent().parent().parent().parent().remove();
          }, 100);
        }
      });

      $(document).ready(function () {
        var now = new Date();
        var timestamp = now.getTime();
        localStorage.setItem('region', '{"code":"us","time":' + timestamp + '}');
      });

      $('[data-action="tv"]').on('hover:enter hover:click hover:touch', function () {
        var adBotInterval = setInterval(function () {
          if (document.querySelector('.ad-bot') !== null) {
            $('.ad-bot').remove();
            clearInterval(adBotInterval);
            setTimeout(function () {
              Lampa.Controller.toggle('content');
            }, 100);
          }
        }, 500);
        setTimeout(function () {
          clearInterval(adBotInterval);
        }, 10000);

        var cardTextInterval = setInterval(function () {
          if (document.querySelector('.card__textbox') !== null) {
            $('.card__textbox').parent().parent().remove();
            clearInterval(cardTextInterval);
          }
        }, 500);
        setTimeout(function () {
          clearInterval(cardTextInterval);
        }, 10000);
      });

      setTimeout(function () {
        $('.open--feed').remove();
        $('.open--premium').remove();
        $('.open--notice').remove();
        if ($('.icon--blink').length > 0) {
          $('.icon--blink').remove();
        }
        if ($('.black-friday__button').length > 0) {
          $('.black-friday__button').remove();
        }
        if ($('.christmas__button').length > 0) {
          $('.christmas__button').remove();
        }
      }, 1000);

      Lampa.Settings.listener.follow('open', function (event) {
        if (event.name === 'account') {
          setTimeout(function () {
            $('.settings--account-premium').remove();
            $('div > span:contains("CUB Premium")').remove();
          }, 100);
        }
        if (event.name === 'server') {
          if (document.querySelector('.ad-server') !== null) {
            $('.ad-server').remove();
          }
        }
      });

      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'complite') {
          $('.button--book').on('hover:enter', function () {
            hideLockedItems();
          });
        }
      });

      Lampa.Storage.listener.follow('change', function (event) {
        if (event.name === 'activity') {
          if (Lampa.Activity.active().component === 'bookmarks') {
            $('.register:nth-child(4)').hide();
            $('.register:nth-child(5)').hide();
            $('.register:nth-child(6)').hide();
            $('.register:nth-child(7)').hide();
            $('.register:nth-child(8)').hide();
          }
          setTimeout(function () {
            observeDomChanges();
          }, 200);
        }
      });
    }

    if (window.appready) {
      initializeApp();
      observeDomChanges();
      removeAdsOnToggle();
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          initializeApp();
          observeDomChanges();
          removeAdsOnToggle();
          $('[data-action="feed"]').eq(0).remove();
          $('[data-action="subscribes"]').eq(0).remove();
          $('[data-action="myperson"]').eq(0).remove();
        }
      });
    }
  })();
})();
