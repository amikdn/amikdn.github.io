(function () {
  'use strict';

  var manifest = {
    type: 'other',
    version: '1.6',
    name: 'Скрыть блок истории просмотра',
    description: 'Скрывает блок с информацией о предыдущем просмотре.'
  };
  Lampa.Manifest.plugins = manifest;

  Lampa.Template.add('hide_watched_with_focus_css', `
    <style>
      /* Скрываем только содержимое */
      .watched-history__icon,
      .watched-history__body {
        display: none !important;
      }

      /* Контейнер: прозрачный, но с размерами и в потоке */
      .watched-history {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0.5em 0 !important; /* минимальный padding, чтобы фокус не "слипся" */
        min-height: 3em !important; /* чтобы ободок был виден */
        opacity: 0.01 !important; /* почти невидим, но в DOM */
        pointer-events: none !important; /* не мешает кликам */
      }

      /* При фокусе — ободок от Lampa работает сам */
      .watched-history.selector.focus {
        opacity: 0.05 !important; /* чуть видим, чтобы было понятно, где фокус */
        pointer-events: auto !important;
      }

      /* Убираем любые внутренние отступы */
      .watched-history > * {
        display: none !important;
      }
    </style>
  `);

  function startPlugin() {
    $('body').append(Lampa.Template.get('hide_watched_with_focus_css', {}, true));

    $('.watched-history').css({
      'background': 'transparent',
      'border': 'none',
      'box-shadow': 'none',
      'margin': '0',
      'padding': '0.5em 0',
      'min-height': '3em',
      'opacity': '0.01',
      'pointer-events': 'none'
    }).find('.watched-history__icon, .watched-history__body').hide();

    $(document).on('DOMNodeInserted', '.watched-history', function () {
      var $el = $(this);
      $el.css({
        'background': 'transparent',
        'border': 'none',
        'box-shadow': 'none',
        'margin': '0',
        'padding': '0.5em 0',
        'min-height': '3em',
        'opacity': '0.01',
        'pointer-events': 'none'
      }).find('.watched-history__icon, .watched-history__body').hide();
    });
  }

  if (!window.hide_watched_with_focus) {
    window.hide_watched_with_focus = true;
    startPlugin();
  }
})();
