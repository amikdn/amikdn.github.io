
(function() {
  'use strict';
  Lampa.Platform.tv();

  // Утилита для перемешивания массива (используется для случайного порядка контента в разделах)
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  // Класс Card для рендеринга отдельных элементов (фильмы, сериалы, эпизоды)
  function Card(item, episode) {
    this.item = item || {};
    this.episode = episode || {};
    if (this.item.source === undefined) this.item.source = 'tmdb';
    Lampa.Manifest.logs('bylampa_source', this.item, {
      title: this.item.title,
      original_title: this.item.original_name,
      release_date: this.item.release_date
    });
    this.item.release_year = ((this.item.release_date || '0000') + '').slice(0, 4);

    // Вспомогательная функция для удаления элемента, если он существует
    function removeElement(el) {
      if (el) el.remove();
    }

    // Построение структуры DOM карточки
    this.build = function() {
      this.card = Lampa.Template.js('card');
      this.img_poster = this.card.find('.card__img') || {};
      this.img_episode = this.card.find('.full-episode__img') || {};
      this.card.find('.card__title').innerText = this.item.title;
      this.card.find('.card__age').innerText = this.item.release_year;
      if (this.episode && this.episode.air_date) {
        this.card.find('.full-episode__name').innerText = this.episode.title || Lampa.Lang.translate('noname');
        this.card.find('.full-episode__date').innerText = this.episode.air_date || '';
        this.card.find('.full-episode__num').innerText = this.episode.episode_number ? Lampa.Utils.parseTime(this.episode.episode_number).full : '----';
      }
      if (this.item.release_year === '0000') removeElement(this.card.find('.card__age'));
      this.card.on('hover:focus', this.image.bind(this));
    };

    // Установка обработчиков загрузки/ошибки изображений
    this.imageHandlers = function() {
      this.img_poster.onload = function() {};
      this.img_poster.onerror = function() {
        this.img_poster.src = './img/img_broken.svg';
      };
      this.img_episode.onload = function() {
        this.card.find('.full-episode__img').classList.add('full-episode__img--loaded');
      };
      this.img_episode.onerror = function() {
        this.img_episode.src = './img/img_broken.svg';
      };
    };

    // Создание карточки и прикрепление событий
    this.create = function() {
      this.build();
      this.card.on('hover:focus', () => { if (this.onFocus) this.onFocus(this.card, this.item); });
      this.card.on('hover:hover', () => { if (this.onHover) this.onHover(this.card, this.item); });
      this.card.on('hover:enter', () => { if (this.onEnter) this.onEnter(this.card, this.item); });
      this.imageHandlers();
    };

    // Загрузка изображений для постера и эпизода
    this.image = function() {
      if (this.item.poster_path) this.img_poster.src = Lampa.Api.img(this.item.poster_path);
      else if (this.item.backdrop_path) this.img_poster.src = Lampa.Api.img(this.item.backdrop_path);
      else if (this.item.profile_path) this.img_poster.src = this.item.profile_path;
      else if (this.item.img) this.img_poster.src = this.item.img;
      else this.img_poster.src = './img/img_broken.svg';

      if (this.item.still_path) this.img_episode.src = Lampa.Api.img(this.episode.still_path, 'w300');
      else if (this.item.backdrop_path) this.img_episode.src = Lampa.Api.img(this.item.backdrop_path, 'w300');
      else if (this.episode.img) this.img_episode.src = this.episode.img;
      else if (this.item.img) this.img_episode.src = this.item.img;
      else this.img_episode.src = './img/img_broken.svg';

      if (this.onVisible) this.onVisible(this.card, this.item);
    };

    // Очистка карточки
    this.destroy = function() {
      this.img_poster.onerror = function() {};
      this.img_poster.onload = function() {};
      this.img_episode.onerror = function() {};
      this.img_episode.onload = function() {};
      this.img_poster.src = '';
      this.img_episode.src = '';
      removeElement(this.card);
      this.card = null;
      this.img_poster = null;
      this.img_episode = null;
    };

    // Возврат элемента карточки (HTML или jQuery)
    this.render = function(html) {
      return html ? this.card : $(this.card);
    };
  }

  // Класс PersonalHub для пользовательского контента главного экрана
  function PersonalHub(api) {
    this.timetable = new Lampa.TimeTable();
    this.discovery = false;

    // Основная функция для получения и организации разделов
    this.main = function(params = {}, success, error) {
      var that = this;
      var limit = 56;
      var sections = [
        // Список всех возможных разделов с порядком по умолчанию и состояниями активности на основе хранилища
        { id: 'now_watch', order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1, active: !Lampa.Storage.get('now_watch_remove') },
        // ... (все остальные разделы как в оригинале, опущены для краткости)
      ];
      var activeSections = [];
      var calledIds = [];

      // Сортировка активных разделов по порядку
      var orderedSections = sections.filter(s => s.active).sort((a, b) => a.order - b.order);
      if (orderedSections.length === 0) return success();

      // Случайные диапазоны для фильтров дат
      var ranges = [{start: 2023, end: 2025}, {start: 2020, end: 2022}, {start: 2017, end: 2019}, {start: 2014, end: 2016}, {start: 2011, end: 2013}];
      var range1 = ranges[Math.floor(Math.random() * ranges.length)];
      var from1 = range1.start + '-01-01';
      var to1 = range1.end + '-12-31';
      var range2 = ranges[Math.floor(Math.random() * ranges.length)];
      var from2 = range2.start + '-01-01';
      var to2 = range2.end + '-12-31';

      // Случайные варианты сортировки
      var sortOptions = ['vote_count.desc', 'popularity.desc', 'revenue.desc'];
      var sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      var sortMovie = sortOptions[Math.floor(Math.random() * sortOptions.length)];

      var today = new Date().toISOString().substr(0, 10);
      var lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      var lastMonthDate = lastMonth.toISOString().substr(0, 10);

      // Обработчики для каждого раздела (получение данных, применение настроек, перемешивание если включено)
      var handlers = {
        now_watch: function(callback) {
          that.get('trending/all/day', params, function(data) {
            data.title = Lampa.Lang.translate('Сейчас смотрят');
            // Применение типа отображения из настроек (коллекция, широкие маленькие, топ линия)
            if (Lampa.Storage.get('now_watch_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('now_watch_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('now_watch_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('now_watch_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        upcoming_episodes: function(callback) {
          callback({
            source: 'tmdb',
            results: Lampa.TimeTable.get().slice(0, 20),
            title: Lampa.Lang.translate('Выход ближайших эпизодов'),
            nomore: true,
            cardClass: (item, ep) => new Card(item, ep)
          });
        },
        // ... (аналогичные обработчики для всех разделов, каждый получает конкретный эндпоинт TMDB, применяет заголовок, отображение, перемешивание)
      };

      // Сбор обработчиков для активных разделов
      orderedSections.forEach(s => {
        if (!calledIds.includes(s.id) && handlers[s.id]) {
          activeSections.push(handlers[s.id]);
          calledIds.push(s.id);
        }
      });

      // Если нет перемешивания главного, добавить коллекции на основе жанров
      if (Lampa.Storage.get('bylampa_source_params') === false) {
        api.genres.forEach(g => {
          if (!calledIds.includes(g.id)) {
            var genreHandler = function(callback) {
              that.get('discover/movie?with_genres=' + g.id, params, function(data) {
                data.title = Lampa.Lang.translate(g.title.replace(/[^a-z_]/g, ''));
                shuffle(data.results);
                callback(data);
              }, callback);
            };
            activeSections.push(genreHandler);
            calledIds.push(g.id);
          }
        });
      }

      // Параллельное получение всех данных
      if (activeSections.length > 0) {
        Lampa.Arrays.getPromises(activeSections, limit, success, error);
      } else {
        console.log('Нет доступных категорий для загрузки.');
      }
    };

    // Обертка для получения API (расширяет оригинальный источник TMDB)
    this.get = function(url, params, success, error) {
      // Логика фактической выборки (используя Lampa.Api.sources.tmdb.get или аналогичное)
    };
  }

  // Назначение пользовательского источника
  var customSource = Object.assign({}, Lampa.Api.sources.tmdb, new PersonalHub(Lampa.Api.sources.tmdb));
  Lampa.Api.sources.bylampa_source = customSource;
  Object.assign(Lampa.Api.sources, { PersonalHub: PersonalHub });

  // Добавление в селектор источников
  Lampa.Params.select('source', Object.assign({}, Lampa.Params.sources.source, { PersonalHub: 'PersonalHub' }), 'tmdb');

  // Если выбран как источник, активировать в активности
  if (Lampa.Storage.get('source') === 'PersonalHub') {
    var interval = setInterval(() => {
      var activity = Lampa.Activity.active();
      if (activity) {
        clearInterval(interval);
        Lampa.Activity.push({ source: Lampa.Storage.get('source'), title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase() });
      }
    }, 300);
  }

  // Слушатели настроек и добавления
  Lampa.Settings.listener.follow('open', (e) => {
    if (e.name === 'main') {
      if (Lampa.Settings.main().render().find('[data-component="bylampa_source"]').length === 0) {
        Lampa.SettingsApi.addComponent({ component: 'bylampa_source', name: 'Источник PersonalHub' });
      }
      Lampa.Settings.main().update();
      Lampa.Settings.main().render().find('.settings-param > div:contains("Источник PersonalHub")').toggle('hide');
    }
  });

  // Добавление параметра перемешивания главного
  Lampa.SettingsApi.addParam({
    component: 'bylampa_source',
    param: { name: 'bylampa_source_params', type: 'trigger', default: true },
    field: { name: 'Изменять порядок карточек на главной', description: 'Порядок отображения' },
    onRender: (item) => {
      setTimeout(() => {
        $('div[data-name="source"]').parent().insertAfter($('.settings-param > div:contains("Источник PersonalHub")'));
        if (Lampa.Storage.field('source') !== 'PersonalHub') item.hide();
        else item.show();
      }, 20);
      item.on('hover:enter', () => {
        Lampa.Settings.open('more');
        Lampa.Controller.active().listener.back = () => Lampa.Settings.open('more');
      });
    }
  });

  // Функция для добавления настроек для каждого раздела
  function addSection(id, name, description, shuffleDefault, displayDefault, orderDefault, removeDefault) {
    Lampa.Settings.listener.follow('open', (e) => {
      if (e.name === 'main') {
        if (Lampa.Settings.main().render().find(`[data-component="${id}"]`).length === 0) {
          Lampa.SettingsApi.addComponent({ component: id, name });
        }
        Lampa.Settings.main().update();
        Lampa.Settings.main().render().find(`[data-component="${id}"]`).addClass('hide');
      }
    });
    Lampa.SettingsApi.addParam({
      component: 'bylampa_source',
      param: { name: id, type: 'trigger', default: removeDefault },
      field: { name, description },
      onRender: (item) => {
        item.on('hover:enter', (e) => {
          var target = e.target, parent = target.parentElement;
          var siblings = Array.from(parent.children), index = siblings.indexOf(target), childIndex = index + 1;
          Lampa.Settings.open(id);
          Lampa.Controller.active().listener.back = () => {
            Lampa.Settings.open(id);
            setTimeout(() => {
              var nextChild = document.querySelector(`#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(${childIndex})`);
              Lampa.Controller.toggle(nextChild);
              Lampa.Activity.toggle('settings_component');
            }, 5);
          };
        });
      }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `${id}_remove`, type: 'trigger', default: removeDefault },
      field: { name: 'Убрать с главной страницы' }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `${id}_display`, type: 'select', values: {1: 'Стандарт', 2: 'collection', 3: 'Широкие большие', 4: 'Top Line'}, default: displayDefault },
      field: { name: 'Вид отображения' }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `number_${id}`, type: 'select', values: {1: '1', /* ... до 37: '37' */}, default: orderDefault },
      field: { name: 'Порядок отображения' },
      onChange: (value) => { /* Обработка изменения порядка */ }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `${id}_shuffle`, type: 'trigger', default: shuffleDefault },
      field: { name: 'Изменять порядок карточек на главной' }
    });
  }

  // Добавление разделов (вызовы опущены для краткости, но каждый соответствует типу контента)
  addSection('now_watch', 'Сейчас смотрят', 'Нажми для настройки', false, '1', '1', false);
  // ... addSection для всех остальных id ...

  // Слушатель изменения источника
  Lampa.Storage.listener.follow('change', (e) => {
    if (e.name === 'source') {
      setTimeout(() => {
        if (Lampa.Storage.get('source') !== 'PersonalHub') $('.settings-param > div:contains("Источник PersonalHub")').parent().hide();
        else $('.settings-param > div:contains("Источник PersonalHub")').parent().show();
      }, 50);
    }
  });

  // Установка значений по умолчанию при первом запуске
  var checkInterval = setInterval(() => {
    if (typeof Lampa !== 'undefined') {
      clearInterval(checkInterval);
      if (!Lampa.Storage.get('bylampa_source_params', 'true')) setDefaults();
    }
  }, 200);

  // Установка начальных значений по умолчанию
  function setDefaults() {
    Lampa.Storage.set('bylampa_source_params', 'true');
    Lampa.Storage.set('trend_day_tv_remove', 'true');
    Lampa.Storage.set('trend_day_film_remove', 'true');
    // ... установка всех остальных значений по умолчанию как в оригинале ...
    Lampa.Storage.set('bylampa_source_params', 'true');
  }
})();
