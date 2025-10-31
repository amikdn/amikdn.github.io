(function () {
  'use strict';

  var manifest = {
    type: 'other',
    version: '1.4',
    name: 'Скрыть блок истории просмотра',
    description: 'Скрывает содержимое блока истории просмотра'
  };
  Lampa.Manifest.plugins = manifest;

  // ---------- CSS ----------
  Lampa.Template.add('hide_watched_block_css', `
    <style>
      /* Сам блок полностью скрыт, но остаётся в DOM */
      .watched-history {
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        clip: rect(0 0 0 0) !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }

      /* При фокусе — показываем только ободок (как у .selector.focus) */
      .watched-history.selector.focus {
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: auto !important;
        height: auto !important;
        overflow: visible !important;
        clip: auto !important;
        pointer-events: auto !important;
        opacity: 1;
      }

      .watched-history.selector.focus::after {
        content: '';
        position: absolute;
        inset: -0.6em;
        border: 0.3em solid #fff;
        border-radius: 0.7em;
        pointer-events: none;
        z-index: 1;
      }
    </style>
  `);

  function startPlugin() {
    $('body').append(Lampa.Template.get('hide_watched_block_css', {}, true));
    $('.watched-history').attr('style', 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);pointer-events:none;opacity:0;');
  }

  if (!window.hide_watched_block) {
    window.hide_watched_block = true;
    startPlugin();
  }
})();
