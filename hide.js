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
    // === 1. Скрываем содержимое ===
    Lampa.Template.add('hide_watched_css', `
      <style>
        .watched-history {
          display: none !important;
        }
      </style>
    `);
    $('body').append(Lampa.Template.get('hide_watched_css', {}, true));

    // === 2. Перехватываем открытие торрентов ===
    Lampa.Listener.follow('full', function(e) {
      if (e.type !== 'complite' || e.component !== 'torrent') return;

      setTimeout(function() {
        var $watched = $('.watched-history');
        var $scroll = Lampa.Controller.enabled().scroll;
        var $first = $('.torrent-item, .online-prestige, .files__item').first();

        if (!$first.length) return;

        // Убираем элемент из DOM (но не удаляем полностью, если нужен)
        $watched.hide();

        // Принудительно ставим фокус на первый элемент
        $first.addClass('focus');

        // Обновляем коллекцию: пересобираем элементы
        var $container = $scroll || $first.parent();
        var collection = $container.find('.selector').toArray();

        // Убираем .watched-history из коллекции
        collection = collection.filter(function(el) {
          return !$(el).hasClass('watched-history');
        });

        // Обновляем коллекцию в Lampa
        Lampa.Controller.collectionSet($container);
        Lampa.Controller.collectionSet(collection);

        // Ставим фокус
        Lampa.Controller.collectionFocus($first[0], $container);

        // Прокручиваем к первому элементу
        if ($scroll) {
          $scroll.scrollTop($first.offset().top - $container.offset().top - 50);
        }
      }, 150);
    });

    // === 3. Если уже открыто (на случай перезагрузки) ===
    $(document).ready(function() {
      setTimeout(function() {
        if (Lampa.Controller.enabled().name === 'torrent') {
          var $watched = $('.watched-history');
          var $first = $('.torrent-item, .online-prestige, .files__item').first();

          if ($watched.length && $first.length) {
            $watched.hide();
            $first.addClass('focus');

            var $container = Lampa.Controller.enabled().scroll || $first.parent();
            var collection = $container.find('.selector').toArray().filter(function(el) {
              return !$(el).hasClass('watched-history');
            });

            Lampa.Controller.collectionSet($container);
            Lampa.Controller.collectionSet(collection);
            Lampa.Controller.collectionFocus($first[0], $container);
          }
        }
      }, 500);
    });
  }

  if (!window.hide_watched_focus_v2) {
    window.hide_watched_focus_v2 = true;
    startPlugin();
  }
})();
