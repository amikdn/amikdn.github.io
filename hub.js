(function() {
  'use strict';
  Lampa.Platform.tv();
  var manifest = {
    type: 'other',
    version: '1.0',
    name: 'Скрыть CUB',
    description: 'Скрывает источник поиска CUB.'
  };
  Lampa.Manifest.plugins = manifest;
  function startPlugin() {
    function hideCUB() {
      var sources = document.querySelectorAll('.search-source');
      for (var i = 0; i < sources.length; i++) {
        var tab = sources[i].querySelector('.search-source__tab');
        if (tab && tab.textContent.trim() === 'CUB') {
          sources[i].style.display = 'none';
        }
      }
    }
    hideCUB();
    var observer = new MutationObserver(hideCUB);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (!window.hide_cub_source) {
    window.hide_cub_source = true;
    startPlugin();
  }
})();
