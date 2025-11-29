(function() {
  'use strict';
  var manifest = {
    type: 'other',
    version: '1.0',
    name: 'Скрыть CUB',
    description: 'Скрывает источник поиска CUB.'
  };
  Lampa.Manifest.plugins = manifest;
  function startPlugin() {
    Lampa.Template.add('hide_cub_css', `<style>.search-source:has(.search-source__tab:contains("CUB")){display:none !important;}</style>`);
    $('body').append(Lampa.Template.get('hide_cub_css', {}, true));
    $(document).on('DOMNodeInserted', function(e) {
      var $el = $(e.target);
      if ($el.hasClass('search-source') || $el.find('.search-source').length) {
        var $tab = $el.find('.search-source__tab');
        if ($tab.length && $tab.text().trim() === 'CUB') $el.hide();
      }
    });
  }
  if (!window.hide_cub_source) {
    window.hide_cub_source = true;
    startPlugin();
  }
})();
