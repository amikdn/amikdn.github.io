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

  // Плагин "Онлайн" с выбором источников и похожим визуалом, как у других плагинов Lampa
  function OnlineViewPlugin(object) {
    this.object = object; // карточка фильма
    // Выбираем источник из Lampa.Storage или используем значение по умолчанию
    this.currentSourceKey = Lampa.Storage.get('online_balancer') || 'pidtor';
    this.source = SOURCES[this.currentSourceKey];
    // Основной контейнер плагина
    this.container = $('<div class="online_view_plugin"></div>');
    // Панель для выбора источников (балансеров)
    this.selectorContainer = $('<div class="online_mod__header"></div>');
    // Контейнер для списка видео (результатов запроса)
    this.list = $('<div class="online_mod__content"></div>');
    // Собираем структуру карточки: сначала селектор, затем список видео
    this.container.append(this.selectorContainer).append(this.list);
    this.init();
  }

  // Инициализация – отрисовываем панель источников и запускаем запрос по выбранному источнику
  OnlineViewPlugin.prototype.init = function() {
    // Для стилизации фона можно задать blur изображения из карточки фильма
    if(this.object.movie) {
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(this.object.movie));
    }
    console.log('Онлайн. Используем источник по умолчанию:', this.source.name, this.source.url);
    this.renderSourceSelector();
    this.list.html('<div class="online_loading">Загрузка...</div>');
    this.search();
  };

  // Отрисовка панели выбора источников. Используется похожая верстка, как в плагине "онлайн мод"
  OnlineViewPlugin.prototype.renderSourceSelector = function() {
    var self = this;
    this.selectorContainer.empty();
    // Для каждого источника создаём кнопку с классом "selector"
    for (var key in SOURCES) {
      if (SOURCES.hasOwnProperty(key)) {
        var src = SOURCES[key];
        var btn = $('<div class="online_mod__source selector" data-source-key="'+ key +'">' + src.name + '</div>');
        if (key === this.currentSourceKey) btn.addClass('active');
        btn.on('hover:enter', function() {
          var selectedKey = $(this).data('source-key');
          if (selectedKey !== self.currentSourceKey) {
            self.currentSourceKey = selectedKey;
            self.source = SOURCES[selectedKey];
            Lampa.Storage.set('online_balancer', selectedKey);
            // Обновляем активное состояние кнопок
            self.selectorContainer.find('.online_mod__source').removeClass('active');
            $(this).addClass('active');
            // Обновляем список видео
            self.list.html('<div class="online_loading">Загрузка...</div>');
            self.search();
          }
        });
        this.selectorContainer.append(btn);
      }
    }
  };

  // Формирование запроса к источнику с параметрами фильма
  OnlineViewPlugin.prototype.search = function() {
    var movie = this.object.movie || {};
    var params = [
      'id=' + encodeURIComponent(movie.id || ''),
      'title=' + encodeURIComponent(movie.title || ''),
      'original_title=' + encodeURIComponent(movie.original_title || '')
    ];
    var requestUrl = this.source.url + '?' + params.join('&');
    console.log('Онлайн. Запрос по URL:', requestUrl);
    fetch(requestUrl)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        console.log('Онлайн. Данные от источника', this.source.name, data);
        this.display(data);
      }.bind(this))
      .catch(function(err) {
        console.error('Онлайн. Ошибка запроса к источнику ' + this.source.name + ':', err);
        this.showError(err);
      }.bind(this));
  };

  // Отображение результатов.
  // Если в data.links найден массив ссылок – для каждого элемента вызываем шаблон online_mod.
  OnlineViewPlugin.prototype.display = function(data) {
    this.list.empty();
    if (data && data.links && data.links.length) {
      for (var i = 0; i < data.links.length; i++) {
        var item = data.links[i];
        // Если шаблон "online_mod" определён – используем его для отрисовки элемента
        var videoEl = typeof Lampa.Template.get === 'function'
          ? Lampa.Template.get('online_mod', {
              title: item.title || this.object.movie.title,
              quality: item.quality ? item.quality + 'p' : '',
              info: ''
            })
          : $('<div class="video_item selector">' + (item.title || this.object.movie.title) + '</div>');
        // При нажатии запускаем плеер с данными выбранного элемента
        videoEl.on('hover:enter', function(link) {
          return function() {
            Lampa.Player.play({
              title: link.title || this.object.movie.title,
              url: link.url,
              quality: link.quality || 'default'
            });
          }.bind(this);
        }.call(this, item));
        this.list.append(videoEl);
      }
    } else {
      this.showError('Нет данных для воспроизведения');
    }
  };

  // Отображение ошибки – приводим сообщение к строке и выводим его
  OnlineViewPlugin.prototype.showError = function(message) {
    var errorText = typeof message === 'string'
      ? message
      : (message && message.toString ? message.toString() : JSON.stringify(message));
    console.error('Онлайн. Ошибка плагина:', errorText);
    Lampa.Noty.show(errorText || Lampa.Lang.translate('online_balanser_dont_work'));
    this.list.html('<div class="online_error">' + errorText + '</div>');
  };

  // Метод start – добавляет контейнер плагина в активный рендер и настраивает коллекцию фокуса
  OnlineViewPlugin.prototype.start = function() {
    var active = Lampa.Activity.active();
    var render;
    if (active.activity && typeof active.activity.render === 'function') {
      render = active.activity.render();
    } else if (typeof active.render === 'function') {
      render = active.render();
    } else {
      console.error('Онлайн. Невозможно получить контейнер рендера из Lampa.Activity.active()');
      return;
    }
    if (!this.container.parent().length) {
      $(render).append(this.container);
    }
    if (!this.list.children().length) {
      this.list.append('<div class="dummy selector" style="opacity:0; pointer-events:none;">placeholder</div>');
    }
    Lampa.Controller.add('content', {
      toggle: function() {
        Lampa.Controller.collectionSet(this.list.get(0), this.list.get(0));
        Lampa.Controller.collectionFocus(this.list.get(0));
      }.bind(this),
      back: this.back.bind(this)
    });
    Lampa.Controller.toggle('content');
  };

  // Метод render – возвращает основной контейнер плагина
  OnlineViewPlugin.prototype.render = function() {
    return this.container;
  };

  // Пустые методы pause и stop для совместимости
  OnlineViewPlugin.prototype.pause = function() {};
  OnlineViewPlugin.prototype.stop = function() {};

  // Метод back – вызывается при нажатии кнопки "назад"
  OnlineViewPlugin.prototype.back = function() {
    Lampa.Activity.backward();
  };

  // Метод destroy – очистка ресурсов плагина
  OnlineViewPlugin.prototype.destroy = function() {
    if (this.container) {
      this.container.remove();
    }
    this.container = null;
    this.list = null;
    this.selectorContainer = null;
  };

  // Регистрируем компонент плагина в Lampa
  Lampa.Component.add('online_view', function(object) {
    return new OnlineViewPlugin(object);
  });

  // Манифест плагина – он будет доступен через контекстное меню и по кнопке "Смотреть онлайн"
  var manifest = {
    type: 'video',
    version: '1.0.0',
    name: 'Онлайн',
    description: 'Плагин для просмотра онлайн фильмов и сериалов с выбором источников',
    component: 'online_view',
    onContextMenu: function(object) {
      return {
        name: Lampa.Lang.translate('online_watch') || 'Смотреть онлайн',
        description: 'Выбор источника для онлайн-проигрывания'
      };
    },
    onContextLauch: function(object) {
      Lampa.Activity.push({
        url: '',
        title: Lampa.Lang.translate('online_watch') || 'Смотреть онлайн',
        component: 'online_view',
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

  // Добавляем кнопку "Смотреть онлайн" на странице деталей фильма (режим "full")
  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      if (e.object.activity.render().find('.online_view--button').length) return;
      var button = $(
        '<div class="full-start__button selector online_view--button" data-subtitle="' +
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
          component: 'online_view',
          movie: e.data.movie,
          page: 1
        });
      });
    }
  });
})();
