(function(){
    'use strict';
    
    function injectCSS() {
        var style = document.createElement('style');
        style.id = 'custom_info_shift_css';
        style.innerHTML = `
            .player-info.info--visible {
                position: relative !important;
                top: -1px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    var checkInterval = setInterval(function(){
        if(document.querySelector('.player-info.info--visible') && document.querySelector('.player-panel.panel--visible.panel--paused')){
            clearInterval(checkInterval);
            injectCSS();
        }
    }, 300);
})();
