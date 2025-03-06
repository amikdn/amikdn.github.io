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

  // Конструктор нашего плагина
  function MultiSourceComponent(object) {
    this.object = object;
    // Читаем выбранный балансер из Lampa.Storage или используем значение по умолчанию
    this.currentSourceKey = Lampa.Storage.get('online_balancer') || 'pidtor';
    this.source = SOURCES[this.currentSourceKey];
    // Создаём контейнер для отображения состояния плагина
    this.container = $('<div class="multi_source_plugin"></div>');
    this.init();
  }

  // Инициализация – можно здесь добавить интерфейс выбора источника
  MultiSourceComponent.prototype.init = function() {
    console.log('Используем источник:', this.source.name, this.source.url);
    this.container.html('<div class="multi_source_loading">Загрузка...</div>');
  };

  // Метод start, который обязателен для компонента, вызывается при запуске Activity
MultiSourceComponent.prototype.start = function() {
  // Получаем контейнер активного экрана
  var render = Lampa.Activity.active().render();
  // Если наш контейнер еще не добавлен в DOM, добавляем его
  if (!this.container.parent().length) {
    render.append(this.container);
  }
  // Если в списке (this.list) еще нет элементов, добавляем скрытый placeholder
  if (!this.list.children().length) {
    this.list.append('<div class="dummy selector" style="opacity:0; pointer-events:none;">placeholder</div>');
  }
  Lampa.Controller.add('content', {
    toggle: function() {
      // Передаем нативный DOM-элемент списка
      Lampa.Controller.collectionSet(this.list.get(0), this.list.get(0));
      Lampa.Controller.collectionFocus(this.list.get(0));
    }.bind(this),
    back: this.back.bind(this)
  });
  Lampa.Controller.toggle('content');
  this.search();
};



  // Метод render возвращает контейнер для отображения
  MultiSourceComponent.prototype.render = function() {
    return this.container;
  };

  // Формирование запроса к выбранному источнику с данными о фильме
  MultiSourceComponent.prototype.search = function() {
    var movie = this.object.movie || {};
    var params = [
      'id=' + encodeURIComponent(movie.id || ''),
      'title=' + encodeURIComponent(movie.title || ''),
      'original_title=' + encodeURIComponent(movie.original_title || '')
    ];
    var requestUrl = this.source.url + '?' + params.join('&');
    console.log('Запрос по URL:', requestUrl);

    // Выполняем запрос – здесь используется fetch (можно заменить на Lampa.Reguest)
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

  // Обработка полученных данных: если есть ссылки – запускаем плеер, иначе выводим ошибку
  MultiSourceComponent.prototype.display = function(data) {
    if (data && data.links && data.links.length) {
      var firstVideo = data.links[0];
      console.log('Запускаем видео:', firstVideo);
      Lampa.Player.play({
        title: firstVideo.title || this.object.movie.title,
        url: firstVideo.url,
        quality: firstVideo.quality || 'default'
      });
      // Если нужно – можно обновить UI или очистить контейнер
      this.container.empty();
    } else {
      this.showError('Нет данных для воспроизведения');
    }
  };

  // Отображение ошибки с приведением передаваемого значения к строке
  MultiSourceComponent.prototype.showError = function(message) {
    var errorText = typeof message === 'string' ? message :
      (message && message.toString ? message.toString() : JSON.stringify(message));
    console.error('Ошибка плагина:', errorText);
    Lampa.Noty.show(errorText || Lampa.Lang.translate('online_balanser_dont_work'));
    this.container.html('<div class="multi_source_error">' + errorText + '</div>');
  };

  // Метод для обработки нажатия кнопки "назад"
  MultiSourceComponent.prototype.back = function() {
    Lampa.Activity.backward();
  };

  // Регистрация компонента в системе Lampa
  Lampa.Component.add('multi_source', function(object) {
    return new MultiSourceComponent(object);
  });

  // Манифест плагина, который используется для запуска из меню контекста или по кнопке
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

  // Добавляем языковые строки
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

  // Добавление кнопки в режиме "full" (страница деталей фильма)
  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      // Если кнопка уже добавлена, выходим
      if (e.object.activity.render().find('.multi_source--button').length) return;
      // Создаём HTML кнопки (можно использовать SVG-иконку или простой текст)
      var button = $(
        '<div class="full-start__button selector multi_source--button" data-subtitle="' +
          manifest.name + ' ' + manifest.version + '">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M8 5v14l11-7z"/>' +
          '</svg>' +
          '<span>' + Lampa.Lang.translate('online_watch') + '</span>' +
        '</div>'
      );
      // Размещаем кнопку рядом с кнопкой "Torrent"
      e.object.activity.render().find('.view--torrent').after(button);
      // Привязываем событие – при нажатии запускаем плагин
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
