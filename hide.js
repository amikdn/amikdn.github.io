(function() {
  'use strict';

  var manifst = {
    type: 'other',
    version: '1.4',
    name: 'Скрыть блок истории',
    description: 'Скрывает блок с информацией о предыдущем просмотре'
  };

  Lampa.Manifest.plugins = manifst;

  function startPlugin() {
    Lampa.Template.add('hide_watched_block_css', `
      <style>
        /* Полностью скрываем блок истории */
        .watched-history {
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }

        /* Восстанавливаем ободок фокуса */
        .watched-history.selector.focus {
          position: static !important;
          left: auto !important;
          top: auto !important;
          width: auto !important;
          height: auto !important;
          opacity: 0 !important; /* всё равно не видно, но фокус есть */
          pointer-events: auto !important;
          z-index: auto !important;
        }

        /* Ободок фокуса — воссоздаём вручную */
        .watched-history.selector.focus::after {
          content: '';
          position: absolute;
          top: -0.6em;
          left: -0.6em;
          right: -0.6em;
          bottom: -0.6em;
          border: 0.3em solid #fff;
          border-radius: 0.7em;
          pointer-events: none;
          z-index: 9999;
          box-sizing: border-box;
        }

        /* Опционально: добавляем "невидимый" отступ, чтобы следующий элемент не прилипал */
        .watched-history + * {
          margin-top: 1.5em !important;
        }
      </style>
    `);

    $('body').append(Lampa.Template.get('hide_watched_block_css', {}, true));

    setTimeout(function() {
      $('.watched-history').each(function() {
        var $el = $(this);
        if (!$el.hasClass('focus')) {
          $el.css({
            'position': 'absolute',
            'left': '-9999px',
            'top': '-9999px',
            'width': '1px',
            'height': '1px',
            'overflow': 'hidden',
            'opacity': '0',
            'pointer-events': 'none',
            'z-index': '-1'
          });
        }
      });
    }, 100);
  }

  if (!window.hide_watched_block) {
    window.hide_watched_block = true;
    startPlugin();
  }
})();
