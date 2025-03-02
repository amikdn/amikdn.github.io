(() => {
  'use strict';

  // =======================================================================
  // Константы и первоначальная инициализация
  // =======================================================================
  const Defined = {
    api: 'lampac',
    localhost: 'https://lam.akter-black.com/',
    apn: '10'
  };

  // Генерация или получение уникального идентификатора
  let unicId = Lampa.Storage.get('lampac_unic_id', '');
  if (!unicId) {
    unicId = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unicId);
  }

  // Подключение дополнительного скрипта, если не загружен
  if (!window.rch) {
    Lampa.Utils.putScript(
      ["https://abmsx.tech/invc-rch.js"],
      () => {},
      false,
      () => {
        if (!window.rch.startTypeInvoke) {
          window.rch.typeInvoke('https://abmsx.tech', () => {});
        }
      },
      true
    );
  }

  // =======================================================================
  // Класс для работы с Blazor (при необходимости)
  // =======================================================================
  class BlazorNet {
    constructor() {
      this.net = new Lampa.Reguest();
    }
    timeout(time) {
      this.net.timeout(time);
    }
    req(type, url, success, error, post, params = {}) {
      const path = url.split(Defined.localhost).pop().split('?');
      if (path[0].includes('http')) {
        return this.net[type](url, success, error, post, params);
      }
      DotNet.invokeMethodAsync("JinEnergy", path[0], path[1])
        .then(result => {
          success(params.dataType === 'text' ? result : Lampa.Arrays.decodeJson(result, {}));
        })
        .catch(e => {
          console.error('Blazor error:', e);
          error(e);
        });
    }
    silent(url, success, error, post, params = {}) {
      this.req('silent', url, success, error, post, params);
    }
    native(url, success, error, post, params = {}) {
      this.req('native', url, success, error, post, params);
    }
    clear() {
      this.net.clear();
    }
  }

  // Выбор реализации сети – по умолчанию используем Lampa.Reguest
  const Network = Lampa.Reguest;

  // =======================================================================
  // Утилиты
  // =======================================================================

  // Формирование URL с обязательными параметрами (email, uid, token, ab_token)
  const account = url => {
    if (!url.includes('account_email=')) {
      const email = Lampa.Storage.get('account_email');
      if (email) url = Lampa.Utils.addUrlComponent(url, `account_email=${encodeURIComponent(email)}`);
    }
    if (!url.includes('uid=')) {
      const uid = Lampa.Storage.get('lampac_unic_id', '');
      if (uid) url = Lampa.Utils.addUrlComponent(url, `uid=${encodeURIComponent(uid)}`);
    }
    if (!url.includes('token=')) {
      // При наличии токена можно добавить его сюда
      const token = '';
      if (token !== '') url = Lampa.Utils.addUrlComponent(url, `token=${token}`);
    }
    url = Lampa.Utils.addUrlComponent(url, `ab_token=${Lampa.Storage.get('token')}`);
    return url;
  };

  // Получение имени балансера
  const balanserName = j => (j.balanser || j.name.split(' ')[0]).toLowerCase();

  // =======================================================================
  // Основной компонент плагина
  // =======================================================================
  class LampacComponent {
    constructor(object) {
      this.object = object;
      this.network = new Network();
      this.scroll = new Lampa.Scroll({ mask: true, over: true });
      this.files = new Lampa.Explorer(object);
      this.filter = new Lampa.Filter(object);
      this.sources = {};
      this.filterSources = [];
      this.balanser = '';
      this.source = '';
      this.images = [];
      this.initialized = false;
      this.numberOfRequests = 0;
      // Фильтр для выбора сезона и озвучки
      this.filterFind = { season: [], voice: [] };
      this.filterTranslate = {
        season: Lampa.Lang.translate('torrent_serial_season'),
        voice: Lampa.Lang.translate('torrent_parser_voice'),
        source: Lampa.Lang.translate('settings_rest_source')
      };
    }

    // Инициализация фильтра и привязка событий
    initFilter() {
      this.filter.onSearch = value => {
        // Сохранение уточняющего запроса
        const id = Lampa.Utils.hash(
          this.object.movie.number_of_seasons ? this.object.movie.original_name : this.object.movie.original_title
        );
        let all = Lampa.Storage.get('clarification_search', '{}');
        all[id] = value;
        Lampa.Storage.set('clarification_search', all);
        Lampa.Activity.replace({ search: value, clarification: true });
      };

      this.filter.onBack = () => this.start();

      const filterEl = this.filter.render();
      filterEl.find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
      if (this.filter.addButtonBack) this.filter.addButtonBack();

      // Здесь можно добавить обработчик выбора фильтра (сезон, озвучка и т.п.)
      this.filter.onSelect = (type, a, b) => {
        if (type === 'filter') {
          if (a.reset) {
            this.replaceChoice({ season: 0, voice: 0, voice_url: '', voice_name: '' });
            setTimeout(() => {
              Lampa.Select.close();
              Lampa.Activity.replace({ clarification: 0 });
            }, 10);
          } else {
            const url = this.filterFind[a.stype][b.index].url;
            const choice = this.getChoice();
            if (a.stype === 'voice') {
              choice.voice_name = this.filterFind.voice[b.index].title;
              choice.voice_url = url;
            }
            choice[a.stype] = b.index;
            this.saveChoice(choice);
            this.requestData(url);
            setTimeout(Lampa.Select.close, 10);
          }
        } else if (type === 'sort') {
          Lampa.Select.close();
          this.balanser = a.source;
          // Можно сохранить выбор балансера в хранилище
          Lampa.Storage.set('online_balanser', this.balanser);
          // Перезагрузка активности при смене источника
          Lampa.Activity.replace();
        }
      };
    }

    // Выполнение запроса по URL
    requestData(url) {
      this.numberOfRequests++;
      if (this.numberOfRequests < 10) {
        this.network.native(
          account(url),
          this.parseResponse.bind(this),
          this.handleError.bind(this),
          false,
          { dataType: 'text' }
        );
      } else {
        this.showEmpty();
      }
    }

    // Обработка ответа от сервера
    parseResponse(str) {
      let json = Lampa.Arrays.decodeJson(str, {});
      if (json.rch) return this.handleRCH(json);
      try {
        const items = this.parseJsonDate(str, '.videos__item');
        const buttons = this.parseJsonDate(str, '.videos__button');
        if (items.length === 1 && items[0].method === 'link' && !items[0].similar) {
          // Если найден один элемент-ссылка без похожих – переходим по нему
          this.filterFind.season = items.map(s => ({ title: s.text, url: s.url }));
          this.replaceChoice({ season: 0 });
          setTimeout(() => Lampa.Activity.replace({ clarification: 0 }), 10);
        } else {
          // Если есть видео для воспроизведения
          const videos = items.filter(v => v.method === 'play' || v.method === 'call');
          if (buttons.length) {
            this.filterFind.voice = buttons.map(b => ({ title: b.text, url: b.url }));
            // Дополнительная логика выбора озвучки
          }
          this.displayVideos(videos);
        }
      } catch (e) {
        this.handleError(e);
      }
    }

    // Парсинг данных из HTML-строки по указанному селектору
    parseJsonDate(str, selector) {
      try {
        const html = $('<div>' + str + '</div>');
        const elems = [];
        html.find(selector).each(function () {
          const item = $(this);
          let data = {};
          try {
            data = JSON.parse(item.attr('data-json'));
          } catch (err) {
            data = {};
          }
          const season = item.attr('s');
          const episode = item.attr('e');
          let text = item.text();
          if (!this.object.movie.name && text.match(/\d+p/i)) {
            if (!data.quality) {
              data.quality = {};
              data.quality[text] = data.url;
            }
            text = this.object.movie.title;
          }
          if (text === 'По умолчанию') text = this.object.movie.title;
          if (episode) data.episode = parseInt(episode);
          if (season) data.season = parseInt(season);
          if (text) data.text = text;
          data.active = item.hasClass('active');
          elems.push(data);
        }.bind(this));
        return elems;
      } catch (e) {
        return [];
      }
    }

    // Отображение списка видео
    displayVideos(videos) {
      if (!videos.length) return this.showEmpty();
      this.scroll.clear();
      videos.forEach(item => {
        const html = Lampa.Template.get('lampac_prestige_full', item);
        html.on('hover:enter', () => {
          this.getFileUrl(item, stream => {
            if (stream && stream.url) {
              Lampa.Player.play(stream);
            } else {
              Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
            }
          });
        });
        this.scroll.append(html);
      });
      Lampa.Controller.enable('content');
    }

    // Запрос ссылки на видеофайл
    getFileUrl(file, callback) {
      if (file.stream && file.stream.includes('alloha')) {
        file.stream += `&ab_token=${Lampa.Storage.get('token')}`;
      }
      if (file.method === 'play') {
        callback(file);
      } else {
        Lampa.Loading.start(() => {
          Lampa.Loading.stop();
          Lampa.Controller.toggle('content');
          this.network.clear();
        });
        this.network.native(
          account(file.url),
          json => {
            Lampa.Loading.stop();
            callback(json);
          },
          () => {
            Lampa.Loading.stop();
            callback(false);
          }
        );
      }
    }

    // Обработка ответа с RCH (если требуется)
    handleRCH(json) {
      console.log('Handling RCH response', json);
      // Здесь можно реализовать дополнительную логику (например, переподключение или повторный запрос)
    }

    // Хранение выбора пользователя (например, выбранный сезон, озвучка)
    getChoice() {
      const data = Lampa.Storage.cache(`online_choice_${this.balanser}`, 3000, {});
      return data[this.object.movie.id] || { season: 0, voice: 0, voice_name: '' };
    }
    saveChoice(choice) {
      const data = Lampa.Storage.cache(`online_choice_${this.balanser}`, 3000, {});
      data[this.object.movie.id] = choice;
      Lampa.Storage.set(`online_choice_${this.balanser}`, data);
    }
    replaceChoice(choice) {
      const current = this.getChoice();
      Object.assign(current, choice);
      this.saveChoice(current);
    }

    // Отображение "пустого" результата
    showEmpty() {
      const html = Lampa.Template.get('lampac_does_not_answer', {});
      this.scroll.clear();
      this.scroll.append(html);
      Lampa.Noty.show(Lampa.Lang.translate('lampac_does_not_answer_text'));
    }

    // Запуск компонента
    start() {
      if (!this.initialized) {
        this.initialized = true;
        this.initFilter();
        // Здесь можно добавить загрузку внешних идентификаторов или установку источников
        this.requestData(Defined.localhost + 'lite/events?life=true');
      }
      Lampa.Controller.toggle('content');
    }

    // Очистка при уничтожении компонента
    destroy() {
      this.network.clear();
      this.scroll.destroy();
      this.files.destroy();
    }
  }

  // =======================================================================
  // Шаблоны и стили
  // =======================================================================
  const resetTemplates = () => {
    Lampa.Template.add('lampac_prestige_full', `
      <div class="online-prestige online-prestige--full selector">
        <div class="online-prestige__img">
          <img alt="">
          <div class="online-prestige__loader"></div>
        </div>
        <div class="online-prestige__body">
          <div class="online-prestige__head">
            <div class="online-prestige__title">{title}</div>
            <div class="online-prestige__time">{time}</div>
          </div>
          <div class="online-prestige__timeline"></div>
          <div class="online-prestige__footer">
            <div class="online-prestige__info">{info}</div>
            <div class="online-prestige__quality">{quality}</div>
          </div>
        </div>
      </div>
    `);
    Lampa.Template.add('lampac_does_not_answer', `
      <div class="online-empty">
        <div class="online-empty__title">${Lampa.Lang.translate('empty_title_two')}</div>
        <div class="online-empty__time">${Lampa.Lang.translate('empty_text')}</div>
      </div>
    `);
    Lampa.Template.add('lampac_css', `
      <style>
        /* Пример CSS-стилей для плагина */
        .online-prestige {
          position: relative;
          border-radius: 0.3em;
          background-color: rgba(0,0,0,0.3);
          display: flex;
          overflow: hidden;
        }
        .online-prestige__img {
          position: relative;
          width: 13em;
          flex-shrink: 0;
          min-height: 8.2em;
        }
        .online-prestige__img > img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0.3em;
          opacity: 0;
          transition: opacity .3s;
        }
        .online-prestige__img--loaded > img {
          opacity: 1;
        }
        .online-prestige__body {
          padding: 1.2em;
          flex-grow: 1;
          position: relative;
        }
        .online-prestige__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .online-prestige__title {
          font-size: 1.7em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .online-empty {
          text-align: center;
          padding: 1em;
        }
      </style>
    `);
    $('body').append(Lampa.Template.get('lampac_css', {}, true));
  };

  // =======================================================================
  // Инициализация плагина
  // =======================================================================
  const startPlugin = () => {
    window.lampac_plugin = true;
    const manifst = {
      type: 'video',
      version: '2',
      name: '4m1K',
      description: 'Плагин для просмотра онлайн сериалов и фильмов',
      component: 'lampac',
      onContextMenu: object => ({
        name: Lampa.Lang.translate('lampac_watch'),
        description: 'Плагин для просмотра онлайн сериалов и фильмов'
      }),
      onContextLauch: object => {
        resetTemplates();
        // Регистрируем компонент – при запуске создаём экземпляр LampacComponent
        Lampa.Component.add('lampac', obj => new LampacComponent(obj));
        const id = Lampa.Utils.hash(
          object.number_of_seasons ? object.original_name : object.original_title
        );
        const all = Lampa.Storage.get('clarification_search', '{}');
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'lampac',
          search: all[id] ? all[id] : object.title,
          search_one: object.title,
          search_two: object.original_title,
          movie: object,
          page: 1,
          clarification: !!all[id]
        });
      }
    };
    Lampa.Manifest.plugins = manifst;
    Lampa.Lang.add({
      lampac_watch: { ru: 'Онлайн', en: 'Online', uk: 'Онлайн', zh: '在线观看' },
      empty_title_two: { ru: 'Ничего не найдено', en: 'Nothing found', uk: 'Нічого не знайдено', zh: '未找到任何内容' },
      empty_text: { ru: 'Попробуйте изменить запрос или источник', en: 'Try changing search or source', uk: 'Спробуйте змінити запит або джерело', zh: '请尝试更改搜索或来源' },
      title_online: { ru: 'Онлайн', en: 'Online', uk: 'Онлайн', zh: '在线' }
    });
  };

  // =======================================================================
  // Запуск плагина
  // =======================================================================
  resetTemplates();
  startPlugin();
})();
