(function () {
  'use strict';

  var manifest = {
    type: 'other',
    version: '1.5',
    name: 'Скрыть блок истории просмотра',
    description: 'Скрывает блок с информацией о предыдущем просмотре.'
  };
  Lampa.Manifest.plugins = manifest;

  Lampa.Template.add('hide_watched_no_gap_css', `
    <style>
      /* Полностью убираем блок из потока, но оставляем в DOM */
      .watched-history {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }

      /* При фокусе — показываем только ободок */
      .watched-history.selector.focus {
        visibility: visible !important;
        z-index: 1 !important;
        pointer-events: auto !important;
      }

      /* Рисуем ободок вручную */
      .watched-history.selector.focus::after {
        content: '';
        position: absolute;
        inset: -0.6em;
        border: 0.3em solid #fff;
        border-radius: 0.7em;
        pointer-events: none;
        z-index: 2;
      }
    </style>
  `);

  function startPlugin() {
    $('body').append(Lampa.Template.get('hide_watched_no_gap_css', {}, true));

    $('.watched-history').css({
      'position': 'absolute',
      'left': '0',
      'top': '0',
      'width': '0',
      'height': '0',
      'margin': '0',
      'padding': '0',
      'overflow': 'hidden',
      'visibility': 'hidden',
      'pointer-events': 'none',
      'z-index': '-1'
    });

    $(document).on('DOMNodeInserted', function (e) {
      var $el = $(e.target);
      if ($el.hasClass('watched-history') || $el.find('.watched-history').length) {
        $el.find('.watched-history').css({
          'position': 'absolute',
          'left': '0',
          'top': '0',
          'width': '0',
          'height': '0',
          'margin': '0',
          'padding': '0',
          'overflow': 'hidden',
          'visibility': 'hidden',
          'pointer-events': 'none',
          'z-index': '-1'
        });
      }
    });
  }

  if (!window.hide_watched_no_gap) {
    window.hide_watched_no_gap = true;
    startPlugin();
  }
})();
