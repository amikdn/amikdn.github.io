(function () {
  'use strict';

  Lampa.Platform.tv();

  // Стили для статуса сериала
  const style = document.createElement('style');
  style.textContent = `
    .card__status {
      position: absolute;
      top: 3.8em;
      left: -0.8em;
      background: #16c7ff;
      color: #fff;
      font-size: 0.85em;
      border-radius: 0.3em;
      padding: 0.4em 0.4em;
    }
    .card__status[data-status="end"] {
      background: #ffa416;
    }
    .card__status[data-status="on_the_air"] {
      background: #22ff16;
    }
    .card__status[data-status="wait"] {
      background: #ffa416;
    }
  `.trim();
  document.head.appendChild(style);

  const processed = new WeakSet();

  function processCard(obj) {
    const card = obj.card || obj;
    if (!card?.querySelector) return;
    if (processed.has(card)) return;
    processed.add(card);

    const view = card.querySelector('.card__view');
    if (!view) return;

    const data = card.card_data || obj.data || {};

    const isTv = data.type === 'tv' || data.source === 'tmdb' || data.number_of_seasons || card.classList.contains('card--tv');
    if (!isTv) return;

    let status = (data.status || '').toLowerCase();

    if (status) {
      addLabels(status, view, data);
    } else if (data.id) {
      fetchStatus(data.id, info => {
        if (info) {
          data.status = info.status;
          data.lastSeason = info.lastSeason;
          data.lastEpisode = info.lastEpisode;
          data.totalEpisodes = info.totalEpisodes;
        }
        addLabels(data.status, view, data);
      });
    } else {
      addLabels(null, view, data);
    }
  }

  function addLabels(status, view, data) {
    // Удаляем старые метки
    view.querySelectorAll('.card__type, .card__status').forEach(el => el.remove());

    // Метка TV
    const typeEl = document.createElement('div');
    typeEl.className = 'card__type';
    typeEl.textContent = 'TV';
    view.appendChild(typeEl);

    if (!status) return;

    const statusEl = document.createElement('div');
    statusEl.className = 'card__status';

    switch (status) {
      case 'ended':
        statusEl.setAttribute('data-status', 'end');
        statusEl.textContent = 'Завершён';
        break;
      case 'returning series':
      case 'in_production':
        statusEl.setAttribute('data-status', 'on_the_air');
        statusEl.textContent = 'В производстве';
        break;
      case 'on_the_air':
        statusEl.setAttribute('data-status', 'on_the_air');
        statusEl.textContent = 'Идёт';
        break;
      case 'planned':
        statusEl.setAttribute('data-status', 'wait');
        statusEl.textContent = 'Запланирован';
        break;
      case 'canceled':
        statusEl.setAttribute('data-status', 'wait');
        statusEl.textContent = 'Отменён';
        break;
      case 'post_production':
        statusEl.setAttribute('data-status', 'wait');
        statusEl.textContent = 'Скоро';
        break;
      case 'rumored':
        statusEl.setAttribute('data-status', 'wait');
        statusEl.textContent = 'По слухам';
        break;
      case 'returning series':
        if (data.lastSeason && data.lastEpisode && data.totalEpisodes) {
          if (data.lastEpisode === data.totalEpisodes) {
            statusEl.setAttribute('data-status', 'end');
            statusEl.textContent = 'Завершён';
          } else {
            statusEl.setAttribute('data-status', 'on_the_air');
            statusEl.textContent = `S ${data.lastSeason} / E ${data.lastEpisode} из ${data.totalEpisodes}`;
          }
        } else if (data.lastSeason && data.lastEpisode) {
          statusEl.setAttribute('data-status', 'on_the_air');
          statusEl.textContent = `S ${data.lastSeason} / E ${data.lastEpisode}`;
        } else if (data.lastSeason) {
          statusEl.setAttribute('data-status', 'on_the_air');
          statusEl.textContent = `Сезон: ${data.lastSeason}`;
        }
        break;
      default:
        return;
    }

    view.appendChild(statusEl);
  }

  function fetchStatus(id, cb) {
    const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${Lampa.Storage.key('tmdb_api')}&language=${Lampa.Lang.get('language', 'ru')}`;
    const req = new Lampa.Reguest();
    req.timeout(10000);
    req.get(Lampa.Storage.proxy(url), json => {
      const info = { status: json.status?.toLowerCase() || null, lastSeason: null, lastEpisode: null, totalEpisodes: null };

      if (json.seasons?.length) {
        info.lastSeason = json.seasons[json.seasons.length - 1].season_number;
        const next = json.next_episode_to_air;
        const last = json.last_episode_to_air;
        info.lastEpisode = next && new Date(next.air_date) <= new Date() ? next.episode_number : last?.episode_number;
        const season = json.seasons.find(s => s.season_number === info.lastSeason);
        if (season) info.totalEpisodes = season.episode_count;
      }

      cb(info);
    }, () => cb(null));
  }

  // Инициализация плагина
  function init() {
    if (Lampa.Manifest.app !== 'bylampa') return;
    if (window.serial_status_plugin) return;
    window.serial_status_plugin = true;

    Lampa.SettingsApi.addParam({
      component: 'card',
      param: { name: 'season_and_seria', type: 'toggle', default: true },
      field: { name: 'Отображение состояния сериала (сезон/серия)' }
    });

    if (Lampa.Storage.get('season_and_seria') !== false) {
      const iface = Lampa.SettingsApi.interface('card');
      if (iface?.Card?.onVisible) {
        const orig = iface.Card.onVisible;
        iface.Card.onVisible = function () {
          orig.apply(this);
          processCard(this);
        };
      }

      // Дополнительно в полном просмотре (упрощённо)
      Lampa.Listener.follow('full', e => {
        if (e.type === 'start') {
          const act = Lampa.Activity.active();
          if (act.component === 'full' && act.data?.type === 'tv' && act.data?.source === 'tmdb') {
            // Добавление тега с текущим сезоном/серией — логика из оригинала
          }
        }
      });
    }
  }

  if (window.appready) init();
  else Lampa.Listener.follow('appready', e => { if (e.type === 'ready') init(); });
})();
