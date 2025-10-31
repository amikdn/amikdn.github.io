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

  function startPlugin() {
    // === 1. Скрываем только содержимое ===
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

        /* При фокусе — показываем ободок */
        .watched-history.focus {
          opacity: 0 !important;
        }
      </style>
    `);
    $('body').append(Lampa.Template.get('hide_watched_content_css', {}, true));

    // === 2. Перехват открытия торрентов ===
    Lampa.Listener.follow('full', function(e) {
      if (e.type !== 'complite' || e.component !== 'torrent') return;

      setTimeout(function() {
        var $watched = $('.watched-history');
        var $container = Lampa.Controller.enabled().scroll || $('.scroll__content');
        var $first = $container.find('.torrent-item, .online-prestige, .files__item').first();

        if (!$first.length) return;

        // Убираем фокус с .watched-history
        $watched.removeClass('focus');

        // Ставим фокус на первый элемент
        $first.addClass('focus');

        // Пересобираем коллекцию без .watched-history
        var allItems = $container.find('.selector').toArray();
        var visibleItems = allItems.filter(function(el) {
          return !$(el).hasClass('watched-history');
        });

        // Обновляем коллекцию
        Lampa.Controller.collectionSet($container);
        Lampa.Controller.collectionSet(visibleItems);

        // Устанавливаем фокус
        Lampa.Controller.collectionFocus($first[0], $container);

        // Прокрутка к элементу
        setTimeout(function() {
          var offset = $first.offset().top - $container.offset().top;
          $container.scrollTop(offset - 50);
        }, 50);

      }, 200);
    });

    // === 3. Если уже открыто (перезагрузка) ===
    $(document).ready(function() {
      setTimeout(function() {
        if (Lampa.Activity.active().component === 'torrent') {
          var $watched = $('.watched-history');
          var $container = Lampa.Controller.enabled().scroll || $('.scroll__content');
          var $first = $container.find('.torrent-item, .online-prestige, .files__item').first();

          if ($watched.length && $first.length) {
            $watched.removeClass('focus');
            $first.addClass('focus');

            var items = $container.find('.selector').toArray().filter(function(el) {
              return !$(el).hasClass('watched-history');
            });

            Lampa.Controller.collectionSet($container);
            Lampa.Controller.collectionSet(items);
            Lampa.Controller.collectionFocus($first[0], $container);
          }
        }
      }, 600);
    });
  }

  if (!window.hide_watched_final) {
    window.hide_watched_final = true;
    startPlugin();
  }
})();
