(function () {
  'use strict';

  Lampa.Platform.tv();

  // Стили
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
    .card--new_seria {
      right: -0.6em !important;
      position: absolute;
      background: #16c7ff;
      color: #000;
      bottom: .6em !important;
      padding: 0.4em 0.4em;
      font-size: 1.2em;
      -webkit-border-radius: 0.3em;
      -moz-border-radius: 0.3em;
      border-radius: 0.3em;
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

    let status = (data.status || '').toLowerCase().trim();

    if (status) {
      addLabels(status, view, data);
    } else if (data.id) {
      fetchStatus(data.id, info => {
        if (info) {
          data.status = info.status?.toLowerCase();
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
    view.querySelectorAll('.card__type, .card__status').forEach(el => el.remove());

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
      case 'on_the_air':
        statusEl.setAttribute('data-status', 'on_the_air');
        statusEl.textContent = 'В производстве';
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
      default:
        if (data.lastSeason && data.lastEpisode && data.totalEpisodes) {
          if (data.lastEpisode >= data.totalEpisodes) {
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
        } else {
          return;
        }
        break;
    }

    view.appendChild(statusEl);
  }

  function fetchStatus(id, cb) {
    const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${Lampa.Storage.key('tmdb_api')}&language=${Lampa.Lang.get('language', 'ru')}`;
    const req = new Lampa.Reguest();
    req.timeout(10000);
    req.get(Lampa.Storage.proxy(url), json => {
      const info = {
        status: json.status?.toLowerCase() || null,
        lastSeason: null,
        lastEpisode: null,
        totalEpisodes: null
      };

      if (json.seasons && json.seasons.length) {
        info.lastSeason = json.seasons[json.seasons.length - 1].season_number;

        const next = json.next_episode_to_air;
        const last = json.last_episode_to_air;

        info.lastEpisode = next && new Date(next.air_date) <= new Date() ? next.episode_number : last?.episode_number || null;

        const season = json.seasons.find(s => s.season_number === info.lastSeason);
        if (season) info.totalEpisodes = season.episode_count;
      }

      cb(info);
    }, () => cb(null));
  }

function init() {
  if (window.serial_status_plugin) return;
  window.serial_status_plugin = true;

  Lampa.SettingsApi.addParam({
    component: 'card',
    param: { name: 'season_and_seria', type: 'toggle', default: true },
    field: { name: 'Отображение состояния сериала (сезон/серия)' },
    onRender: () => {
      setTimeout(() => {
        $('div[data-name="season_and_seria"]').insertAfter('div[data-name="card_interfice_cover"]');
      }, 0);
    }
  });

  if (Lampa.Storage.get('season_and_seria') !== false) {
    const iface = Lampa.SettingsApi.interface('card');
    if (iface && iface.Card && iface.Card.onVisible) {
      const original = iface.Card.onVisible;
      iface.Card.onVisible = function () {
        original.apply(this);
        processCard({ data: this.data, card: this.card });
      };
    }

    Lampa.Listener.follow('full', e => {
      if (e.type !== 'start') return;
      const activity = Lampa.Activity.active();
      if (activity.component !== 'full') return;
      const data = activity.data;
      if (!data || data.source !== 'tmdb' || data.type !== 'tv') return;
      if (!data.seasons || !data.last_episode_to_air || !data.seasons[data.seasons.length - 1]?.season_number) return;

      const lastSeason = data.seasons[data.seasons.length - 1].season_number;
      const next = data.next_episode_to_air;
      const lastEpisodeNum = next && new Date(next.air_date) <= new Date() ? next.episode_number : data.last_episode_to_air.episode_number;

      const seasonInfo = data.seasons.find(s => s.season_number === lastSeason);
      const totalInSeason = seasonInfo ? seasonInfo.episode_count : null;

      let text = next ? `Сезон: ${lastSeason} Серия: ${lastEpisodeNum} из ${totalInSeason}` : `Сезон ${lastSeason} сезон`;
      const translated = Lampa.Lang.translate(text);

      const render = activity.render();
      const container = render[0];
      if ($('.full-start__tag.card--new_seria', container).length) return;

      const htmlIcon = '<div class="full-start__tag card--new_seria"><img src="./img/icons/menu/movie.svg" /> <div>';
      const htmlClose = '</div></div>';
      const htmlSplit = '<span class="full-start-new__split">●</span><div class="card--new_seria"><div> ';

      if (window.innerWidth > 585 && !$('.full-start-new.cardify', container).length) {
        $('.full-start-new__poster, .full-start-new__poster', container).append(htmlIcon + translated + htmlClose);
      } else if ($('.full-start__tags', render).length) {
        $('.full-start__tags', render).append(htmlSplit + translated + htmlClose);
      } else {
        $('.full-start-new__details', container).append(htmlIcon + translated + htmlClose);
      }
    });
  }
}

  if (window.appready) init();
  else Lampa.Listener.follow('appready', e => { if (e.type === 'ready') init(); });
})();
