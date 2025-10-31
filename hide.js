(function() {
  'use strict';

  var manifst = {
    type: 'other',
    version: '1.2',
    name: 'Скрыть блок историю',
    description: 'Скрывает блок с информацией о предыдущем просмотре'
  };

  Lampa.Manifest.plugins = manifst;

  function startPlugin() {
    Lampa.Template.add('hide_lampa_history_css', `
      <style>
        .watched-history__icon,
        .watched-history selector,
        .watched-history__body {
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
