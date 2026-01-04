(function () {
  'use strict';

  Lampa.Platform.tv();

  // Адаптация интерфейса карточки фильма для узких экранов (ширина < 585px)
  function adaptCardForNarrowScreen() {
    Lampa.Listener.follow('full', function (event) {
      if (event.type === 'complite' && window.innerWidth < 585) {
        const isNewInterface = Lampa.Storage.get('card_interfice_type') === 'new';

        if (isNewInterface) {
          // Новый интерфейс карточки
          $('.full-start-new__right').css({
            display: 'flex',
            'flex-direction': 'column',
            'justify-content': 'center',
            'align-items': 'center',
          });

          $('.full-start-new__buttons, .full-start-new__rate-line').css({
            'justify-content': 'center',
            'align-items': 'center',
            display: 'flex',
            'flex-direction': 'row',
            gap: '0.5em',
            'flex-wrap': 'wrap',
          });

          $('.full-start-new__details').css({
            'justify-content': 'center',
            'align-items': 'center',
            display: 'flex',
            'flex-direction': 'row',
            'flex-wrap': 'wrap',
          });

          // Заголовки вкладок (Подробно, Актеры, Режиссер и т.д.) — центрируем
          $('.items-line__head')
            .children()
            .filter(function () {
              const text = $(this).text().trim();
              return (
                text &&
                (
                  text === 'Подробно' ||
                  text === 'Актеры' ||
                  text === 'Режиссер' ||
                  text === 'Рекомендации' ||
                  text === 'Похожие' ||
                  text.includes('Сезон') ||
                  text === 'Коллекция'
                )
              );
            })
            .css({
              display: 'flex',
              'justify-content': 'center',
              'align-items': 'center',
              width: '100%',
            });

          $('.full-descr__details, .full-descr__tags').css({
            display: 'flex',
            'flex-direction': 'row',
            'justify-content': 'center',
            'align-items': 'center',
          });

          $('.full-descr__text, .full-start-new__title, .full-start-new__tagline, .full-start-new__head')
            .css('text-align', 'center');
        } else {
          // Старый интерфейс карточки
          $('.full-start__left').css({
            display: 'flex',
            'flex-direction': 'column',
            'justify-content': 'center',
            'align-items': 'center',
          });

          $('.full-start__buttons, .full-start__deta').css({
            'justify-content': 'center',
            'align-items': 'center',
            display: 'flex',
            'flex-direction': 'row',
            gap: '0.5em',
            'flex-wrap': 'wrap',
          });

          $('.full-start__tags').css({
            'justify-content': 'center',
            'align-items': 'center',
            display: 'flex',
            'flex-direction': 'row',
            'flex-wrap': 'wrap',
          });

          // Заголовки вкладок — центрируем
          $('.items-line__head')
            .children()
            .filter(function () {
              const text = $(this).text().trim();
              return (
                text &&
                (
                  text === 'Подробно' ||
                  text === 'Актеры' ||
                  text === 'Режиссер' ||
                  text === 'Рекомендации' ||
                  text === 'Похожие' ||
                  text.includes('Сезон') ||
                  text === 'Коллекция'
                )
              );
            })
            .css({
              display: 'flex',
              'justify-content': 'center',
              'align-items': 'center',
              width: '100%',
            });

          $('.full-descr__details, .full-descr__tags').css({
            display: 'flex',
            'flex-direction': 'row',
            'justify-content': 'center',
            'align-items': 'center',
          });

          $('.full-descr__text, .full-start__title, .full-start__title-original')
            .css('text-align', 'center');
        }
      }
    });
  }

  // Запуск плагина
  if (window.appready) {
    adaptCardForNarrowScreen();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') {
        adaptCardForNarrowScreen();
      }
    });
  }
})();
