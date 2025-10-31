(function() {
  'use strict';

  var manifst = {
    type: 'other',
    version: '1.0',
    name: 'Скрыть историю в Lampac',
    description: 'Скрывает блок с информацией о предыдущем просмотре (балансер, голос, сезон, эпизод) в плагине Lampac'
  };

  Lampa.Manifest.plugins = manifst;

  function startPlugin() {
    Lampa.Template.add('hide_lampac_css', `
      <style>
        .online-prestige-watched {
          display: none !important;
        }
      </style>
    `);

    $('body').append(Lampa.Template.get('hide_lampac_css', {}, true));
  }

  if (!window.hide_lampac_history) {
    window.hide_lampac_history = true;
    startPlugin();
  }
})();