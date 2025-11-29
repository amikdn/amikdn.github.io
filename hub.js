(function() {
    'use strict';

    function hideCUB() {
        var sources = document.querySelectorAll('.search-source');
        for (var i = 0; i < sources.length; i++) {
            var tab = sources[i].querySelector('.search-source__tab');
            if (tab && tab.textContent.trim() === 'CUB') {
                sources[i].style.display = 'none';
            }
        }
    }

    // Выполнить сразу после загрузки
    hideCUB();

    // Мониторить изменения в DOM для динамического скрытия
    var observer = new MutationObserver(hideCUB);
    observer.observe(document.body, { childList: true, subtree: true });
})();
