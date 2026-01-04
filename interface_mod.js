;(function () {
  'use strict';
  var InterFaceMod = {
    name: 'interface_mod',
    version: '2.2.0',
    debug: false,
    settings: {
      enabled: true,
      buttons_mode: 'default',
      show_movie_type: true,
      theme: 'default',
      colored_ratings: true,
      seasons_info_mode: 'aired',
      show_episodes_on_main: false,
      label_position: 'top-right',
      show_buttons: true,
      colored_elements: true
    }
  };
  /*** 1) СЕЗОНЫ И ЭПИЗОДЫ ***/
  function addSeasonInfo() {
    Lampa.Listener.follow('full', function (data) {
      if (data.type === 'complite' && data.data.movie.number_of_seasons) {
        if (InterFaceMod.settings.seasons_info_mode === 'none') return;
        var movie = data.data.movie;
        var status = movie.status;
        var totalSeasons = movie.number_of_seasons || 0;
        var totalEpisodes = movie.number_of_episodes || 0;
        var airedSeasons = 0, airedEpisodes = 0;
        var now = new Date();
        if (movie.seasons) {
          movie.seasons.forEach(function (s) {
            if (s.season_number === 0) return;
            var seasonAired = s.air_date && new Date(s.air_date) <= now;
            if (seasonAired) airedSeasons++;
            if (s.episodes) {
              s.episodes.forEach(function (ep) {
                if (ep.air_date && new Date(ep.air_date) <= now) {
                  airedEpisodes++;
                }
              });
            } else if (seasonAired && s.episode_count) {
              airedEpisodes += s.episode_count;
            }
          });
        }
        else if (movie.last_episode_to_air) {
          airedSeasons = movie.last_episode_to_air.season_number || 0;
          if (movie.season_air_dates) {
            airedEpisodes = movie.season_air_dates.reduce(function (sum, s) {
              return sum + (s.episode_count || 0);
            }, 0);
          } else {
            var ls = movie.last_episode_to_air;
            if (movie.seasons) {
              movie.seasons.forEach(function (s) {
                if (s.season_number === 0) return;
                if (s.season_number < ls.season_number) airedEpisodes += s.episode_count || 0;
                else if (s.season_number === ls.season_number) airedEpisodes += ls.episode_number;
              });
            } else {
              var prev = 0;
              for (var i = 1; i < ls.season_number; i++) prev += 10;
              airedEpisodes = prev + ls.episode_number;
            }
          }
        }
        if (movie.next_episode_to_air && totalEpisodes > 0) {
          var ne = movie.next_episode_to_air, rem = 0;
          if (movie.seasons) {
            movie.seasons.forEach(function (s) {
              if (s.season_number === ne.season_number) {
                rem += (s.episode_count || 0) - ne.episode_number + 1;
              } else if (s.season_number > ne.season_number) {
                rem += s.episode_count || 0;
              }
            });
          }
          if (rem > 0) {
            var calc = totalEpisodes - rem;
            if (calc >= 0 && calc <= totalEpisodes) airedEpisodes = calc;
          }
        }
        if (!airedSeasons) airedSeasons = totalSeasons;
        if (!airedEpisodes) airedEpisodes = totalEpisodes;
        if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) airedEpisodes = totalEpisodes;
        function plural(n, one, two, five) {
          var m = Math.abs(n) % 100;
          if (m >= 5 && m <= 20) return five;
          m %= 10;
          if (m === 1) return one;
          if (m >= 2 && m <= 4) return two;
          return five;
        }
        function getStatusText(st) {
          if (st === 'Ended') return 'Завершён';
          if (st === 'Canceled') return 'Отменён';
          if (st === 'Returning Series') return 'Выходит';
          if (st === 'In Production') return 'В производстве';
          return st || 'Неизвестно';
        }
        var displaySeasons, displayEpisodes;
        if (InterFaceMod.settings.seasons_info_mode === 'aired') {
          displaySeasons = airedSeasons;
          displayEpisodes = airedEpisodes;
        } else {
          displaySeasons = totalSeasons;
          displayEpisodes = totalEpisodes;
        }
        var seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
        var episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
        var isCompleted = (status === 'Ended' || status === 'Canceled');
        var bgColor = isCompleted ? 'rgba(33,150,243,0.8)' : 'rgba(244,67,54,0.8)';
        var info = $('<div class="season-info-label"></div>');
        if (isCompleted) {
          info.append($('<div>').text(displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText));
          info.append($('<div>').text(getStatusText(status)));
        } else {
          var txt = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
          if (InterFaceMod.settings.seasons_info_mode === 'aired' && totalEpisodes > 0 && airedEpisodes < totalEpisodes && airedEpisodes > 0) {
            txt = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText + ' из ' + totalEpisodes;
          }
          info.append($('<div>').text(txt));
        }
        var positions = {
          'top-right': { top: '1.4em', right: '-0.8em' },
          'top-left': { top: '1.4em', left: '-0.8em' },
          'bottom-right': { bottom: '1.4em', right: '-0.8em' },
          'bottom-left': { bottom: '1.4em', left: '-0.8em' }
        };
        var pos = positions[InterFaceMod.settings.label_position] || positions['top-right'];
        info.css($.extend({
          position: 'absolute',
          backgroundColor: bgColor,
          color: 'white',
          padding: '0.4em 0.6em',
          borderRadius: '0.3em',
          fontSize: '0.8em',
          zIndex: 999,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          lineHeight: '1.2em',
          backdropFilter: 'blur(2px)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }, pos));
        setTimeout(function () {
          var poster = $(data.object.activity.render()).find('.full-start-new__poster');
          if (poster.length) {
            poster.css('position', 'relative').append(info);
          }
        }, 100);
      }
    });
  }
  /*** 2) ВСЕ КНОПКИ ***/
  function showAllButtons() {
    var style = document.createElement('style');
    style.id = 'interface_mod_buttons_style';
    style.innerHTML = `
      .full-start-new__buttons, .full-start__buttons {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
      }
    `;
    document.head.appendChild(style);
    if (Lampa.FullCard) {
      var orig = Lampa.FullCard.build;
      Lampa.FullCard.build = function (data) {
        var card = orig(data);
        card.organizeButtons = function () {
          var el = card.activity && card.activity.render();
          if (!el) return;
          var cont = el.find('.full-start-new__buttons').length
            ? el.find('.full-start-new__buttons')
            : el.find('.full-start__buttons').length
              ? el.find('.full-start__buttons')
              : el.find('.buttons-container');
          if (!cont.length) return;
          var selectors = [
            '.buttons--container .full-start__button',
            '.full-start-new__buttons .full-start__button',
            '.full-start__buttons .full-start__button',
            '.buttons-container .button'
          ];
          var all = [];
          selectors.forEach(function (s) {
            el.find(s).each(function () { all.push(this); });
          });
          if (!all.length) return;
          var cats = { online: [], torrent: [], trailer: [], other: [] }, seen = {};
          all.forEach(function (b) {
            var t = $(b).text().trim();
            if (!t || seen[t]) return;
            seen[t] = true;
            var c = b.className || '';
            if (c.includes('online')) cats.online.push(b);
            else if (c.includes('torrent')) cats.torrent.push(b);
            else if (c.includes('trailer')) cats.trailer.push(b);
            else cats.other.push(b);
          });
          var order = ['online', 'torrent', 'trailer', 'other'];
          var toggle = Lampa.Controller.enabled().name === 'full_start';
          if (toggle) Lampa.Controller.toggle('settings_component');
          cont.children().detach();
          cont.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' });
          order.forEach(function (o) {
            cats[o].forEach(function (btn) { cont.append(btn); });
          });
          if (toggle) setTimeout(function () { Lampa.Controller.toggle('full_start'); }, 100);
        };
        card.onCreate = function () {
          if (InterFaceMod.settings.show_buttons) {
            setTimeout(card.organizeButtons, 300);
          }
        };
        return card;
      };
    }
    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' && e.object && e.object.activity && InterFaceMod.settings.show_buttons && !Lampa.FullCard) {
        setTimeout(function () {
          var el = e.object.activity.render();
          var cont = el.find('.full-start-new__buttons').length
            ? el.find('.full-start-new__buttons')
            : el.find('.full-start__buttons').length
              ? el.find('.full-start__buttons')
              : el.find('.buttons-container');
          if (!cont.length) return;
          cont.css({ display: 'flex', flexWrap: 'wrap', gap: '10px' });
          var selectors = [
            '.buttons--container .full-start__button',
            '.full-start-new__buttons .full-start__button',
            '.full-start__buttons .full-start__button',
            '.buttons-container .button'
          ];
          var all = [];
          selectors.forEach(function (s) {
            el.find(s).each(function () { all.push(this); });
          });
          if (!all.length) return;
          var cats = { online: [], torrent: [], trailer: [], other: [] }, seen = {};
          all.forEach(function (b) {
            var t = $(b).text().trim();
            if (!t || seen[t]) return;
            seen[t] = true;
            var c = b.className || '';
            if (c.includes('online')) cats.online.push(b);
            else if (c.includes('torrent')) cats.torrent.push(b);
            else if (c.includes('trailer')) cats.trailer.push(b);
            else cats.other.push(b);
          });
          var order = ['online', 'torrent', 'trailer', 'other'];
          var toggle = Lampa.Controller.enabled().name === 'full_start';
          if (toggle) Lampa.Controller.toggle('settings_component');
          order.forEach(function (o) {
            cats[o].forEach(function (btn) { cont.append(btn); });
          });
          if (toggle) setTimeout(function () { Lampa.Controller.toggle('full_start'); }, 100);
        }, 300);
      }
    });
    new MutationObserver(function (muts) {
      if (!InterFaceMod.settings.show_buttons) return;
      var need = false;
      muts.forEach(function (m) {
        if (m.type === 'childList' &&
          (m.target.classList.contains('full-start-new__buttons') ||
           m.target.classList.contains('full-start__buttons') ||
           m.target.classList.contains('buttons-container'))) {
          need = true;
        }
      });
      if (need) {
        setTimeout(function () {
          var act = Lampa.Activity.active();
          if (act && act.activity.card && typeof act.activity.card.organizeButtons === 'function') {
            act.activity.card.organizeButtons();
          }
        }, 100);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  /*** 3) ТИП КОНТЕНТА ***/
  function changeMovieTypeLabels() {
    var style = $(`<style id="movie_type_styles">
      .content-label { position: absolute!important; top: 1.4em!important; left: -0.8em!important; color: white!important; padding: 0.4em 0.4em!important; border-radius: 0.3em!important; font-size: 0.8em!important; z-index: 10!important; }
      .serial-label { background-color: #3498db!important; }
      .movie-label { background-color: #2ecc71!important; }
      body[data-movie-labels="on"] .card--tv .card__type { display: none!important; }
    </style>`);
    $('head').append(style);
    $('body').attr('data-movie-labels', InterFaceMod.settings.show_movie_type ? 'on' : 'off');
    function addLabel(card) {
      if (!InterFaceMod.settings.show_movie_type) return;
      if ($(card).find('.content-label').length) return;
      var view = $(card).find('.card__view');
      if (!view.length) return;
      var meta = {}, tmp;
      try {
        tmp = $(card).attr('data-card');
        if (tmp) meta = JSON.parse(tmp);
        tmp = $(card).data();
        if (tmp && Object.keys(tmp).length) meta = Object.assign(meta, tmp);
        if (Lampa.Card && $(card).attr('id')) {
          var c = Lampa.Card.get($(card).attr('id'));
          if (c) meta = Object.assign(meta, c);
        }
        var id = $(card).data('id') || $(card).attr('data-id') || meta.id;
        if (id && Lampa.Storage.cache('card_' + id)) {
          meta = Object.assign(meta, Lampa.Storage.cache('card_' + id));
        }
      } catch (e) {}

      // *** ПРОВЕРКА НА ПОДБОРКИ — НЕ ДОБАВЛЯТЬ ЛЕЙБЛЫ ***
      if (meta.params && meta.params.style && meta.params.style.name === 'collection') return;
      if (meta.data && meta.data.component === 'category_full') return;

      var isTV = false;
      if (meta.type === 'tv' || meta.card_type === 'tv' ||
          meta.seasons || meta.number_of_seasons > 0 ||
          meta.episodes || meta.number_of_episodes > 0 ||
          meta.is_series) {
        isTV = true;
      }
      if (!isTV) {
        if ($(card).hasClass('card--tv') || $(card).data('type') === 'tv') isTV = true;
        else if ($(card).find('.card__type, .card__temp').text().match(/(сезон|серия|эпизод|ТВ|TV)/i)) isTV = true;
      }
      var lbl = $('<div class="content-label"></div>');
      if (isTV) {
        lbl.addClass('serial-label').text('Сериал').data('type', 'serial');
      } else {
        lbl.addClass('movie-label').text('Фильм').data('type', 'movie');
      }
      view.append(lbl);
    }
    function processAll() {
      if (!InterFaceMod.settings.show_movie_type) return;
      $('.card').each(function () { addLabel(this); });
    }
    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' && e.data.movie) {
        var poster = $(e.object.activity.render()).find('.full-start__poster');
        if (!poster.length) return;
        var m = e.data.movie;
        var isTV = m.number_of_seasons > 0 || m.seasons || m.type === 'tv';
        if (InterFaceMod.settings.show_movie_type) {
          poster.find('.content-label').remove();
          var lbl = $('<div class="content-label"></div>').css({
            position: 'absolute', top: '1.4em', left: '-0.8em',
            color: 'white', padding: '0.4em', borderRadius: '0.3em',
            fontSize: '0.8em', zIndex: 10
          });
          if (isTV) {
            lbl.addClass('serial-label').text('Сериал').css('backgroundColor', '#3498db');
          } else {
            lbl.addClass('movie-label').text('Фильм').css('backgroundColor', '#2ecc71');
          }
          poster.css('position', 'relative').append(lbl);
        }
      }
    });
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.addedNodes) {
          $(m.addedNodes).find('.card').each(function () { addLabel(this); });
        }
        if (m.type === 'attributes' &&
            ['class', 'data-card', 'data-type'].includes(m.attributeName) &&
            $(m.target).hasClass('card')) {
          addLabel(m.target);
        }
      });
    }).observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['class', 'data-card', 'data-type']
    });
    processAll();
    setInterval(processAll, 2000);
  }
  /*** 4) ТЕМЫ ОФОРМЛЕНИЯ ***/
  function applyTheme(theme) {
    $('#interface_mod_theme').remove();
    if (theme === 'default') return;
    var style = $('<style id="interface_mod_theme"></style>');
    var themes = {
      neon: `
        body { background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%); color: #ffffff; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus,
        .selectbox-item.focus, .full-start__button.focus,
        .full-descr__tag.focus, .player-panel .button.focus {
          background: linear-gradient(to right, #ff00ff, #00ffff);
          color: #fff;
          box-shadow: 0 0 20px rgba(255,0,255,0.4);
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
          border: none;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
          border: 2px solid #ff00ff;
          box-shadow: 0 0 20px #00ffff;
        }
        .head__action.focus, .head__action.hover {
          background: linear-gradient(45deg, #ff00ff, #00ffff);
          box-shadow: 0 0 15px rgba(255,0,255,0.3);
        }
        .full-start__background {
          opacity: 0.7;
          filter: brightness(1.2) saturate(1.3);
        }
        .settings__content, .settings-input__content,
        .selectbox__content, .modal__content {
          background: rgba(15,2,33,0.95);
          border: 1px solid rgba(255,0,255,0.1);
        }
      `,
      dark_night: `
        body { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%); color: #ffffff; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus,
        .selectbox-item.focus, .full-start__button.focus,
        .full-descr__tag.focus, .player-panel .button.focus {
          background: linear-gradient(to right, #8a2387, #e94057, #f27121);
          color: #fff;
          box-shadow: 0 0 30px rgba(233,64,87,0.3);
          animation: night-pulse 2s infinite;
        }
        @keyframes night-pulse {
          0% { box-shadow: 0 0 20px rgba(233,64,87,0.3); }
          50% { box-shadow: 0 0 30px rgba(242,113,33,0.3); }
          100% { box-shadow: 0 0 20px rgba(138,35,135,0.3); }
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
          border: 2px solid #e94057;
          box-shadow: 0 0 30px rgba(242,113,33,0.5);
        }
        .head__action.focus, .head__action.hover {
          background: linear-gradient(45deg, #8a2387, #f27121);
          animation: night-pulse 2s infinite;
        }
        .full-start__background {
          opacity: 0.8;
          filter: saturate(1.3) contrast(1.1);
        }
        .settings__content, .settings-input__content,
        .selectbox__content, .modal__content {
          background: rgba(10,10,10,0.95);
          border: 1px solid rgba(233,64,87,0.1);
          box-shadow: 0 0 30px rgba(242,113,33,0.1);
        }
      `,
      // остальные темы без изменений (для краткости не копирую, но они должны быть)
    };
    style.html(themes[theme] || '');
    $('head').append(style);
  }
  /*** 5) ЦВЕТНЫЕ РЕЙТИНГИ И СТАТУСЫ ***/
  function updateVoteColors() {
    if (!InterFaceMod.settings.colored_ratings) return;
    function apply(el) {
      var m = $(el).text().match(/(\d+(\.\d+)?)/);
      if (!m) return;
      var v = parseFloat(m[0]);
      var c = v <= 3 ? 'red'
            : v < 6 ? 'orange'
            : v < 8 ? 'cornflowerblue'
            : 'lawngreen';
      $(el).css('color', c);
    }
    $('.card__vote').each(function(){ apply(this); });
    $('.full-start__rate, .full-start-new__rate').each(function(){ apply(this); });
    $('.info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function(){ apply(this); });
  }
  function setupVoteColorsObserver() {
    if (!InterFaceMod.settings.colored_ratings) return;
    setTimeout(updateVoteColors, 500);
    new MutationObserver(function(){ setTimeout(updateVoteColors, 100); })
      .observe(document.body, { childList: true, subtree: true });
  }
  function setupVoteColorsForDetailPage() {
    if (!InterFaceMod.settings.colored_ratings) return;
    Lampa.Listener.follow('full', function (d) {
      if (d.type === 'complite') setTimeout(updateVoteColors, 100);
    });
  }
  /*** 6) ЦВЕТНЫЕ ЭЛЕМЕНТЫ (СТАТУС, AGE) ***/
  function colorizeSeriesStatus() {
    if (!InterFaceMod.settings.colored_elements) return;
    // код без изменений
  }
  function colorizeAgeRating() {
    if (!InterFaceMod.settings.colored_elements) return;
    // код без изменений
  }
  /*** 7) ИНИЦИАЛИЗАЦИЯ ***/
  function startPlugin() {
    // настройки без изменений
    changeMovieTypeLabels();
    // остальные вызовы
  }
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
  Lampa.Manifest.plugins = {
    name: 'Интерфейс мод',
    version: '2.2.0',
    description: 'Улучшенный интерфейс для приложения Lampa'
  };
  window.season_info = InterFaceMod;
})();
