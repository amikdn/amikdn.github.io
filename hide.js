(function() {
  'use strict';

  // Манифест плагина
  var manifst = {
    type: 'other',
    version: '1.4',
    name: 'Скрыть содержимое истории просмотра',
    description: 'Скрывает блок с информацией о предыдущем просмотре.'
  };

  Lampa.Manifest.plugins = manifst;

  // Функция запуска
  function startPlugin() {
    // === 1. Скрываем только содержимое истории ===
    Lampa.Template.add('hide_watched_content_css', `
      <style>
        /* Скрываем иконку и текст */
        .watched-history__icon,
        .watched-history__body {
          display: none !important;
        }

        /* Схлопываем контейнер, но оставляем в DOM */
        .watched-history {
          min-height: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 0 0.5em 0 !important;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }
      </style>
    `);

    $('body').append(Lampa.Template.get('hide_watched_content_css', {}, true));

    // === 2. Перехватываем открытие торрентов и перемещаем фокус ===
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite' && e.component === 'torrent') {
        setTimeout(function() {
          var $watched = $('.watched-history');
          var $firstItem = $('.torrent-item, .online-prestige, .files__item').first();

          if ($watched.length && $firstItem.length) {
            // Убираем фокус с .watched-history
            $watched.removeClass('focus');

            // Ставим фокус на первый элемент
            $firstItem.addClass('focus');
            Lampa.Controller.collectionFocus($firstItem[0], $firstItem.parent());

            // Прокручиваем, если нужно
            var scroll = Lampa.Controller.enabled().scroll || $('body');
            scroll.scrollTop(scroll.scrollTop() + $firstItem.offset().top - 100);
          }
        }, 100);
      }
    });

    // === 3. На всякий случай: если уже открыто ===
    $(document).ready(function() {
      setTimeout(function() {
        if ($('.watched-history').length && Lampa.Controller.enabled().name === 'torrent') {
          var $first = $('.torrent-item, .online-prestige, .files__item').first();
          if ($first.length) {
            $('.watched-history').removeClass('focus');
            $first.addClass('focus');
            Lampa.Controller.collectionFocus($first[0], $first.parent());
          }
        }
      }, 300);
    });
  }

  // Запуск
  if (!window.hide_watched_focus) {
    window.hide_watched_focus = true;
    startPlugin();
  }
})();
