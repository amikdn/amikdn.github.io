(function () {
    'use strict';

    console.log('[Shots Blocker] Loaded');

    // Блокируем регистрацию компонентов
    const origAddComponent = Lampa.Component.add;
    Lampa.Component.add = function(name, comp){
        if(name.startsWith('shots_')){
            console.log('[Shots Blocker] Blocked component:', name);
            return;
        }
        return origAddComponent.apply(this, arguments);
    };

    // Блокируем добавление строк на главные экраны
    const origContentAdd = Lampa.ContentRows.add;
    Lampa.ContentRows.add = function(obj){
        if(obj.name === 'shots_main' || 
           (obj.title && obj.title === 'Shots')){
            console.log('[Shots Blocker] Blocked content row: Shots');
            return;
        }
        return origContentAdd.apply(this, arguments);
    };

    // Блокируем кнопку меню Shots
    const origMenuAdd = Lampa.Menu.addButton;
    Lampa.Menu.addButton = function(icon, title, callback){
        if(title === 'Shots'){
            console.log('[Shots Blocker] Blocked menu button: Shots');
            return;
        }
        return origMenuAdd.apply(this, arguments);
    };

    // На всякий случай — убираем уже добавленную кнопку
    setTimeout(()=>{
        try{
            Lampa.Menu.remove && Lampa.Menu.remove('Shots');
        }catch(e){}
    },1000);

})();