(function() {
  'use strict';

  // Определяем источники (балансеры)
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

  // Конструктор плагина
  function MultiSourceComponent(object) {
    this.object = object;
    // Читаем выбранный балансер или используем значение по умолчанию
    this.currentSourceKey = Lampa.Storage.get('online_balancer') || 'pidtor';
    this.source = SOURCES[this.currentSourceKey];
    // Основной контейнер плагина
    this.container = $('<div class="multi_source_plugin"></div>');
    // Контейнер для списка элементов, с которым работает коллекция фокуса
    this.list = $('<div class="multi_source_list"></div>');
    // Вложим список в основной контейнер
    this.container.append(this.list);
    this.init();
  }

  MultiSourceComponent.prototype.init = function() {
    console.log('Используем источник:', this.source.name, this.source.url);
    this.list.html('<div class="multi_source_loading">Загрузка...</div>');
  };

  // Метод start – обязательный для Activity-компонентов в Lampa
  MultiSourceComponent.prototype.start = function() {
    // Получаем активный контейнер активности
    var render = Lampa.Activity.active().render();
    // Если наш контейнер ещё не добавлен в DOM, добавляем его
    if (!this.container.parent().length) {
      render.append(this.container);
    }
    // Если список пуст, добавляем скрытый placeholder с классом selector
    if (!this.list.children().length) {
      this.list.append('<div class="dummy selector" style="opacity:0; pointer-events:none;">placeholder</div>');
    }
    // Регистрируем управление коллекцией: передаём нативный DOM-элемент this.list.get(0)
    Lampa.Controller.add('content', {
      toggle: function() {
        Lampa.Controller.collectionSet(this.list.get(0), this.list.get(0));
        Lampa.Controller.collectionFocus(this.list.get(0));
      }.bind(this),
      back: this.back.bind(this)
    });
    Lampa.Controller.toggle('content');
    // Запускаем поиск видео
    this.search();
  };

  // Метод render возвращает основной контейнер плагина
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

  // Отображение полученных данных – если ссылки есть, создаётся элемент для выбора
  MultiSourceComponent.prototype.display = function(data) {
    // Очищаем контейнер списка
    this.list.empty();
    if (data && data.links && data.links.length) {
      // Пример: создаём элемент, по нажатию которого запускается плеер
      var videoEl = $('<div class="video_item selector">' + (data.links[0].title || this.object.movie.title) + '</div>');
      videoEl.on('hover:enter', function() {
        Lampa.Player.play({
          title: data.links[0].title || this.object.movie.title,
          url: data.links[0].url,
          quality: data.links[0].quality || 'default'
        });
      }.bind(this));
      this.list.append(videoEl);
    } else {
      this.showError('Нет данных для воспроизведения');
    }
  };

  // Отображение ошибки – приводим сообщение к строке
  MultiSourceComponent.prototype.showError = function(message) {
    var errorText = typeof message === 'string'
      ? message
      : (message && message.toString ? message.toString() : JSON.stringify(message));
    console.error('Ошибка плагина:', errorText);
    Lampa.Noty.show(errorText || Lampa.Lang.translate('online_balanser_dont_work'));
    this.list.html('<div class="multi_source_error">' + errorText + '</div>');
  };

  // Метод для обработки нажатия кнопки "назад"
  MultiSourceComponent.prototype.back = function() {
    Lampa.Activity.backward();
  };

  // Регистрация компонента плагина
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

  // Добавляем кнопку на странице деталей фильма (режим "full")
  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      if (e.object.activity.render().find('.multi_source--button').length) return;
      var button = $(
        '<div class="full-start__button selector multi_source--button" data-subtitle="' +
          manifest.name + ' ' + manifest.version + '">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M8 5v14l11-7z"/>' +
          '</svg>' +
          '<span>' + Lampa.Lang.translate('online_watch') + '</span>' +
        '</div>'
      );
      e.object.activity.render().find('.view--torrent').after(button);
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
