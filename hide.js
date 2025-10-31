(function() {
  'use strict';

  var manifst = {
    type: 'other',
    version: '1.2',
    name: 'Скрыть историю в Lampac и Торрентах',
    description: 'Скрывает блок с информацией о предыдущем просмотре в плагине Lampac (онлайн) и в торрент-просмотре в Lampa'
  };

  Lampa.Manifest.plugins = manifst;

  function startPlugin() {
    Lampa.Template.add('hide_lampa_history_css', `
      <style>
        .online-prestige-watched,
        .watched-history {
          display: none !important;
        }
      </style>
    `);

    $('body').append(Lampa.Template.get('hide_lampa_history_css', {}, true));
  }

  if (!window.hide_lampa_history) {
    window.hide_lampa_history = true;
    startPlugin();
  }
})();
