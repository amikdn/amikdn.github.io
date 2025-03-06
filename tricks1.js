(function() {
  'use strict';

  // Определяем источники (балансеры) с их именами и URL
  var SOURCES = {
    pidtor: {
      name: 'Torrent - 2160',
      url: 'https://lam.akter-black.com/lite/pidtor'
    },
    fxapi: {
      name: 'Filmix - 720',
      url: 'http://rc.bwa.to/rc/fxapi'
    },
    zetflix: {
      name: 'Zetflix - 1080',
      url: 'https://lam.akter-black.com/lite/zetflix'
    },
    mirage: {
      name: 'Alloha - 2160',
      url: 'https://lam.akter-black.com/lite/mirage'
    }
  };

  // Компонент плагина. При запуске он выбирает источник (сохранённый или по умолчанию)
  // и выполняет запрос для получения видео.
  function MultiSourceComponent(object) {
    this.object = object;
    // Выбираем источник: читаем из Lampa.Storage, если нет – по умолчанию 'pidtor'
    this.currentSourceKey = Lampa.Storage.get('online_balancer') || 'pidtor';
    this.source = SOURCES[this.currentSourceKey];
    this.init();
  }

  MultiSourceComponent.prototype.init = function() {
    console.log('Используем источник:', this.source.name, this.source.url);
    // Можно реализовать выбор источника (балансера) через диалоговое окно,
    // сохраняя выбранное значение в Lampa.Storage.
    this.search();
  };

  MultiSourceComponent.prototype.search = function() {
    var movie = this.object.movie || {};
    // Формируем параметры запроса из данных фильма
    var params = [
      'id=' + encodeURIComponent(movie.id || ''),
      'title=' + encodeURIComponent(movie.title || ''),
      'original_title=' + encodeURIComponent(movie.original_title || '')
      // можно добавить другие параметры (год, язык и т.п.)
    ];
    var requestUrl = this.source.url + '?' + params.join('&');
    console.log('Запрос по URL:', requestUrl);

    // Выполняем запрос – в данном примере через fetch (вы можете заменить на Lampa.Reguest)
    fetch(requestUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log('Данные от источника', this.source.name, data);
        this.display(data);
      }.bind(this))
      .catch(function(err) {
        console.error('Ошибка запроса к источнику ' + this.source.name + ':', err);
        this.showError(err);
      }.bind(this));
  };

  MultiSourceComponent.prototype.display = function(data) {
    // Пример: если в data.links есть массив ссылок, запускаем плеер с первым найденным
    if (data && data.links && data.links.length) {
      var firstVideo = data.links[0];
      console.log('Запускаем видео:', firstVideo);
      Lampa.Player.play({
        title: firstVideo.title || this.object.movie.title,
        url: firstVideo.url,
        quality: firstVideo.quality || 'default'
      });
    } else {
      this.showError('Нет данных для воспроизведения');
    }
  };

  MultiSourceComponent.prototype.showError = function(message) {
    console.error('Ошибка плагина:', message);
    Lampa.Noty.show(message || Lampa.Lang.translate('online_balanser_dont_work'));
  };

  // Регистрируем компонент плагина в Lampa
  Lampa.Component.add('multi_source', function(object) {
    return new MultiSourceComponent(object);
  });

  // Манифест плагина
  var manifest = {
    type: 'video',
    version: '1.0.0',
    name: 'MultiSource Plugin',
    description: 'Плагин для просмотра онлайн фильмов и сериалов с несколькими источниками (балансерами)',
    component: 'multi_source',
    onContextMenu: function(object) {
      return {
        name: Lampa.Lang.translate('online_watch') || 'Смотреть онлайн',
        description: 'Плагин для просмотра онлайн видео'
      };
    },
    onContextLauch: function(object) {
      Lampa.Activity.push({
        url: '',
        title: Lampa.Lang.translate('online_watch') || 'Смотреть онлайн',
        component: 'multi_source',
        movie: object,
        page: 1
      });
    }
  };
  Lampa.Manifest.plugins = manifest;

  // Добавляем языковые строки для плагина
  Lampa.Lang.add({
    online_watch: {
      ru: 'Смотреть онлайн',
      en: 'Watch online',
      ua: 'Дивитись онлайн',
      zh: '在线观看'
    },
    online_balanser_dont_work: {
      ru: 'Поиск не дал результатов',
      en: 'No results found',
      ua: 'Пошук не дав результатів',
      zh: '搜索未返回结果'
    }
  });

  // Добавляем кнопку в режиме "full" (на странице деталей фильма).
  // При нажатии кнопка запускает плагин.
  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      // Если кнопка уже добавлена – выходим
      if (e.object.activity.render().find('.multi_source--button').length) return;
      // Создаём HTML кнопки. Здесь можно вставить SVG-иконку или использовать простой текст.
      var button = $(
        '<div class="full-start__button selector multi_source--button" data-subtitle="' +
          manifest.name + ' ' + manifest.version + '">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M8 5v14l11-7z"/>' +
          '</svg>' +
          '<span>' + Lampa.Lang.translate('online_watch') + '</span>' +
        '</div>'
      );
      // Размещаем кнопку рядом с уже существующими кнопками (например, после кнопки «Torrent»)
      e.object.activity.render().find('.view--torrent').after(button);
      // Привязываем событие при нажатии – запуск плагина
      button.on('hover:enter', function() {
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('online_watch'),
          component: 'multi_source',
          movie: e.data.movie,
          page: 1
        });
      });
    }
  });
})();
