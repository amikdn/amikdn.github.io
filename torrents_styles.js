(function () {
  'use strict';

  Lampa.Platform.tv();

  const config = {
    version: '2.0.1',
    name: 'Torrent Styles MOD',
    pluginId: 'torrent_styles_mod'
  };

  // Пороги значений
  const TH = {
    seeds: { low: 5, good: 10, high: 20 },        // Сиды: <5 — плохо, 10–19 — хорошо, ≥20 — отлично
    bitrate: { high: 50, veryHigh: 100 },        // Битрейт: ≥50 — высокий, >100 — очень высокий
    size: { mid: 50, high: 100, top: 200 },      // Размер: ≥50 ГБ — средний, ≥100 — большой, >200 — огромный
    debounce: 80                                 // Задержка обновления стилей (мс)
  };

  // Стили для элементов торрент-карточек
  const styles = {
    '.torrent-item__bitrate > span.ts-bitrate, .torrent-item__seeds > span.ts-seeds, .torrent-item__grabs > span.ts-grabs, .torrent-item__size.ts-size': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.45em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'font-size': '0.9em',
      'white-space': 'nowrap',
      'font-variant-numeric': 'tabular-nums',
      'box-sizing': 'border-box'
    },
    '.torrent-item__bitrate, .torrent-item__grabs, .torrent-item__seeds': {
      'margin-right': '0.55em'
    },

    /* Сиды (раздают) */
    '.torrent-item__seeds > span.ts-seeds': {
      'color': '#5cd4b0',
      'background-color': 'rgba(92,212,176,0.14)',
      'border': '0.15em solid rgba(92,212,176,0.9)',
      'box-shadow': '0 0 0.75em rgba(92,212,176,0.28)'
    },
    '.torrent-item__seeds > span.ts-seeds.low-seeds': {
      'color': '#ff5f6d',
      'background-color': 'rgba(255,95,109,0.14)',
      'border': '0.15em solid rgba(255,95,109,0.82)',
      'box-shadow': '0 0 0.65em rgba(255,95,109,0.26)',
      'text-shadow': '0 0 0.25em rgba(255,95,109,0.25)'
    },
    '.torrent-item__seeds > span.ts-seeds.good-seeds': {
      'color': '#43cea2',
      'background-color': 'rgba(67,206,162,0.16)',
      'border': '0.15em solid rgba(67,206,162,0.92)',
      'box-shadow': '0 0 0.9em rgba(67,206,162,0.34)'
    },
    '.torrent-item__seeds > span.ts-seeds.high-seeds': {
      'color': '#ffc371',
      'background': 'linear-gradient(135deg, rgba(255,195,113,0.28), rgba(67,206,162,0.10))',
      'border': '0.15em solid rgba(255,195,113,0.92)',
      'box-shadow': '0 0 0.95em rgba(255,195,113,0.38)',
      'text-shadow': '0 0 0.25em rgba(255,195,113,0.25)'
    },

    /* Личеры (качают) */
    '.torrent-item__grabs > span.ts-grabs': {
      'color': '#4db6ff',
      'background-color': 'rgba(77,182,255,0.12)',
      'border': '0.15em solid rgba(77,182,255,0.82)',
      'box-shadow': '0 0 0.35em rgba(77,182,255,0.16)'
    },
    '.torrent-item__grabs > span.ts-grabs.high-grabs': {
      'color': '#4db6ff',
      'background': 'linear-gradient(135deg, rgba(77,182,255,0.18), rgba(52,152,219,0.10))',
      'border': '0.15em solid rgba(77,182,255,0.92)',
      'box-shadow': '0 0 0.55em rgba(77,182,255,0.22)'
    },

    /* Битрейт */
    '.torrent-item__bitrate > span.ts-bitrate': {
      'color': '#5cd4b0',
      'background-color': 'rgba(67,206,162,0.10)',
      'border': '0.15em solid rgba(92,212,176,0.78)',
      'box-shadow': '0 0 0.45em rgba(92,212,176,0.20)'
    },
    '.torrent-item__bitrate > span.ts-bitrate.high-bitrate': {
      'color': '#ffc371',
      'background': 'linear-gradient(135deg, rgba(255,195,113,0.28), rgba(67,206,162,0.10))',
      'border': '0.15em solid rgba(255,195,113,0.92)',
      'box-shadow': '0 0 0.95em rgba(255,195,113,0.38)',
      'text-shadow': '0 0 0.25em rgba(255,195,113,0.25)'
    },
    '.torrent-item__bitrate > span.ts-bitrate.very-high-bitrate': {
      'color': '#ff5f6d',
      'background': 'linear-gradient(135deg, rgba(255,95,109,0.28), rgba(67,206,162,0.08))',
      'border': '0.15em solid rgba(255,95,109,0.92)',
      'box-shadow': '0 0 1.05em rgba(255,95,109,0.40)',
      'text-shadow': '0 0 0.25em rgba(255,95,109,0.25)'
    },

    /* Размер файла */
    '.torrent-item__size.ts-size': {
      'color': '#5cd4b0',
      'background-color': 'rgba(92,212,176,0.12)',
      'border': '0.15em solid rgba(92,212,176,0.82)',
      'box-shadow': '0 0 0.7em rgba(92,212,176,0.26)',
      'font-weight': '700'
    },
    '.torrent-item__size.ts-size.mid-size': {
      'color': '#43cea2',
      'background-color': 'rgba(67,206,162,0.16)',
      'border': '0.15em solid rgba(67,206,162,0.92)',
      'box-shadow': '0 0 0.9em rgba(67,206,162,0.34)'
    },
    '.torrent-item__size.ts-size.high-size': {
      'color': '#ffc371',
      'background': 'linear-gradient(135deg, rgba(255,195,113,0.28), rgba(67,206,162,0.10))',
      'border': '0.15em solid rgba(255,195,113,0.95)',
      'box-shadow': '0 0 1.05em rgba(255,195,113,0.40)',
      'text-shadow': '0 0 0.25em rgba(255,195,113,0.22)'
    },
    '.torrent-item__size.ts-size.top-size': {
      'color': '#ff5f6d',
      'background': 'linear-gradient(135deg, rgba(255,95,109,0.28), rgba(67,206,162,0.08))',
      'border': '0.15em solid rgba(255,95,109,0.95)',
      'box-shadow': '0 0 1.1em rgba(255,95,109,0.42)',
      'text-shadow': '0 0 0.25em rgba(255,95,109,0.22)'
    },

    /* Фокус элементов */
    '.torrent-item.selector.focus, .torrent-serial.selector.focus, .torrent-file.selector.focus': {
      'box-shadow': '0 0 0 0.3em rgba(67,206,162,0.4)'
    },
    '.torrent-item.focus::after': {
      'border': '0.24em solid #5cd4b0',
      'box-shadow': '0 0 0.6em rgba(92,212,176,0.18)',
      'border-radius': '0.9em'
    },
    '.scroll__body': { 'margin': '5px' }
  };

  // Внедряет CSS-стили в <head>
  function injectStyles() {
    const style = document.createElement('style');
    style.setAttribute('data-' + config.pluginId, 'true');
    style.textContent = Object.entries(styles)
      .map(([selector, rules]) => 
        `${selector} { ${Object.entries(rules).map(([k, v]) => `${k}: ${v} !important`).join('; ')} }`
      )
      .join('\n');
    document.head.appendChild(style);
  }

  // Планирует обновление стилей с debounce
  let updateTimer = null;
  function scheduleUpdate() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(updateTorrentStyles, TH.debounce);
  }

  // Парсит целое число из текста
  function parseIntVal(text) {
    return parseInt(text || '', 10) || 0;
  }

  // Парсит число с плавающей точкой
  function parseFloatVal(text) {
    return parseFloat((text || '').replace(',', '.')) || 0;
  }

  // Преобразует размер (KB/MB/GB/TB) в гигабайты
  function parseSizeGB(text) {
    const normalized = (text || '').replace(/\u00A0/g, ' ').trim();
    const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|кб|мб|гб|тб)/i);
    if (!match) return null;

    const num = parseFloat(match[1].replace(',', '.'));
    const unit = match[2].toLowerCase();

    if (unit === 'tb' || unit === 'тб') return num * 1024;
    if (unit === 'gb' || unit === 'гб') return num;
    if (unit === 'mb' || unit === 'мб') return num / 1024;
    if (unit === 'kb' || unit === 'кб') return num / (1024 * 1024);
    return 0;
  }

  // Удаляет старые классы и добавляет новый
  function addClass(el, classesToRemove, classToAdd) {
    classesToRemove.forEach(c => el.classList.remove(c));
    if (classToAdd) el.classList.add(classToAdd);
  }

  // Основная функция: применяет цветовые классы к элементам торрентов
  function updateTorrentStyles() {
    // Сиды
    document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
      const val = parseIntVal(span.textContent);
      span.classList.add('ts-seeds');
      let tier = '';
      if (val < TH.seeds.low) tier = 'low-seeds';
      else if (val >= TH.seeds.high) tier = 'high-seeds';
      else if (val >= TH.seeds.good) tier = 'good-seeds';
      addClass(span, ['low-seeds', 'good-seeds', 'high-seeds'], tier);
    });

    // Битрейт
    document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
      const val = parseFloatVal(span.textContent);
      span.classList.add('ts-bitrate');
      let tier = '';
      if (val > TH.bitrate.veryHigh) tier = 'very-high-bitrate';
      else if (val >= TH.bitrate.high) tier = 'high-bitrate';
      addClass(span, ['high-bitrate', 'very-high-bitrate'], tier);
    });

    // Личеры (качают)
    document.querySelectorAll('.torrent-item__grabs span').forEach(span => {
      const val = parseIntVal(span.textContent);
      span.classList.add('ts-grabs');
      addClass(span, ['high-grabs'], val > 10 ? 'high-grabs' : '');
    });

    // Размер
    document.querySelectorAll('.torrent-item__size').forEach(el => {
      el.classList.add('ts-size');
      const gb = parseSizeGB(el.textContent);
      if (gb === null) {
        addClass(el, ['mid-size', 'high-size', 'top-size'], '');
        return;
      }
      let tier = '';
      if (gb > TH.size.top) tier = 'top-size';
      else if (gb >= TH.size.high) tier = 'high-size';
      else if (gb >= TH.size.mid) tier = 'mid-size';
      addClass(el, ['mid-size', 'high-size', 'top-size'], tier);
    });
  }

  // Наблюдает за изменениями DOM и запускает обновление стилей
  function observe() {
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.addedNodes.length || m.type === 'characterData') {
          scheduleUpdate();
          return;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    updateTorrentStyles();
  }

  // Регистрирует плагин в манифесте Lampa
  function register() {
    if (typeof Lampa !== 'undefined') {
      Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
      Lampa.Manifest.plugins[config.pluginId] = {
        type: 'other',
        name: config.name,
        version: config.version,
        description: 'Цветовая индикация сидов, личеров, битрейта и размера в торрент-карточках.'
      };
    }
    window['plugin_' + config.pluginId + '_ready'] = true;
  }

  // Инициализация плагина
  function init() {
    injectStyles();
    observe();

    if (window.appready) {
      register();
      scheduleUpdate();
    } else if (Lampa?.Listener?.follow) {
      Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
          register();
          scheduleUpdate();
        }
      });
    } else {
      setTimeout(register, 500);
    }
  }

  init();
})();
