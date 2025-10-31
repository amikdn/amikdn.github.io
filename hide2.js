(function () {
  'use strict';

  // ---------- Манифест ----------
  var manifest = {
    type: 'other',
    version: '1.7',
    name: 'Пропуск скрытого блока истории',
    description: 'Скрывает .watched-history и автоматически пропускает его при фокусе — фокус сразу на первый файл.'
  };
  Lampa.Manifest.plugins = manifest;

  // ---------- CSS ----------
  Lampa.Template.add('skip_watched_css', `
    <style>
      /* Полностью скрываем блок */
      .watched-history {
        display: none !important;
      }
    </style>
  `);

  // ---------- Запуск ----------
  function startPlugin() {
    // Вставляем CSS
    $('body').append(Lampa.Template.get('skip_watched_css', {}, true));

    // Перехватываем фокус на .watched-history
    $(document).on('focus focusin', '.watched-history', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Находим следующий видимый .selector
      var $next = $(this).nextAll('.selector:visible').first();
      if (!$next.length) {
        // Если нет — ищем вверх (на случай, если блок в начале)
        $next = $(this).prevAll('.selector:visible').first();
      }
      if (!$next.length) {
        // На всякий случай — ищем любой .selector
        $next = $('.selector:visible').first();
      }

      if ($next.length) {
        // Снимаем фокус с текущего
        Lampa.Controller.collectionFocus(false);
        // Ставим на следующий
        setTimeout(function () {
          Lampa.Controller.collectionFocus($next[0]);
        }, 10);
      }
    });

    // При появлении нового блока — сразу скрываем
    $(document).on('DOMNodeInserted', function (e) {
      var $el = $(e.target);
      if ($el.hasClass('watched-history') || $el.find('.watched-history').length) {
        $el.find('.watched-history').hide();
      }
    });

    // При открытии страницы — если фокус на .watched-history — пропускаем
    setTimeout(function () {
      var $focused = $('.selector.focus');
      if ($focused.hasClass('watched-history') || $focused.find('.watched-history').length) {
        var $next = $focused.nextAll('.selector:visible').first() || $('.selector:visible').first();
        if ($next.length) {
          Lampa.Controller.collectionFocus($next[0]);
        }
      }
    }, 300);
  }

  if (!window.skip_watched_block) {
    window.skip_watched_block = true;
    startPlugin();
  }
})();