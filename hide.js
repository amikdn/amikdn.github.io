(function() {
  'use strict';

  // Манифест плагина
  var manifst = {
    type: 'other',
    version: '1.3',
    name: 'Скрыть содержимое истории просмотра',
    description: 'Скрывает только содержимое блока истории просмотра (.watched-history__icon и .watched-history__body), но оставляет сам контейнер .watched-history, чтобы фокус (ободок) оставался на нём при открытии.'
  };

  Lampa.Manifest.plugins = manifst;

  // Функция запуска плагина
  function startPlugin() {
    // Добавляем CSS, который скрывает только содержимое
    Lampa.Template.add('hide_watched_content_css', `
      <style>
        /* Скрываем иконку и текст */
        .watched-history__icon,
        .watched-history__body {
          display: none !important;
        }

        /* Оставляем сам контейнер, но делаем его "прозрачным" по высоте */
        .watched-history {
          min-height: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 0 1.5em 0 !important; /* оставляем отступ снизу, чтобы не слипалось с контентом */
          overflow: hidden;
          opacity: 0;
          pointer-events: none; /* чтобы не мешал кликам, но фокус остаётся */
        }

        /* Восстанавливаем фокус (ободок) */
        .watched-history.selector.focus {
          opacity: 1;
          pointer-events: auto;
        }

        /* При фокусе — показываем ободок, но без содержимого */
        .watched-history.selector.focus::after {
          content: '';
          position: absolute;
          top: -0.6em;
          left: -0.6em;
          right: -0.6em;
          bottom: -0.6em;
          border: solid 0.3em #fff;
          border-radius: 0.7em;
          pointer-events: none;
          z-index: 1;
        }
      </style>
    `);

    // Вставляем CSS
    $('body').append(Lampa.Template.get('hide_watched_content_css', {}, true));

    // Дополнительно: если элемент уже есть в DOM — принудительно скрываем содержимое
    $(document).on('DOMNodeInserted', function(e) {
      var $el = $(e.target);
      if ($el.hasClass('watched-history') || $el.find('.watched-history').length) {
        $el.find('.watched-history__icon, .watched-history__body').hide();
      }
    });

    // На всякий случай — скрываем при загрузке
    setTimeout(function() {
      $('.watched-history__icon, .watched-history__body').hide();
    }, 100);
  }

  // Запускаем, если ещё не запущен
  if (!window.hide_watched_content) {
    window.hide_watched_content = true;
    startPlugin();
  }
})();
