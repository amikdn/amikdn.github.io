(function(){
    'use strict';

    // Если плагин уже запущен, выходим
    if(window.rating_plugin) return;
    window.rating_plugin = true;

    // Подписываемся на событие "full" с типом "complite"
    Lampa.Listener.follow('full', function(e){
        if(e.type === 'complite'){
            var render = e.object.activity.render();
            // Ищем контейнер, где располагаются рейтинговые блоки
            var rateLine = $(render).find('.full-start-new__rate-line');
            if(rateLine.length){
                // Если в этом контейнере ещё нет блока LAMPA, добавляем его
                if(rateLine.find('.rate--lampa').length === 0){
                    var lampaBlock = $(
                        '<div class="full-start__rate rate--lampa">' +
                            '<div>0.0</div>' +
                            '<div class="source--name">LAMPA</div>' +
                        '</div>'
                    );
                    rateLine.append(lampaBlock);
                    console.log('[Rating Plugin] LAMPA блок добавлен');
                }
            } else {
                console.log('[Rating Plugin] Контейнер .full-start-new__rate-line не найден');
            }
        }
    });

    console.log('[Rating Plugin] Плагин рейтингов запущен');
})();
