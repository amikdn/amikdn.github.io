(function () {
  'use strict';

  Lampa.Platform.tv();

  const config = {
    version: '2.0.5',
    name: 'Torrent Styles MOD',
    pluginId: 'torrent_styles_mod'
  };

  const TH = {
    seeds: { low: 5, good: 10, high: 20 },
    bitrate: { high: 50, veryHigh: 100 },
    size: { mid: 50, high: 100, top: 200 },
    debounce: 30
  };

  const styles = {
    '.torrent-item__bitrate > span, .torrent-item__seeds > span, .torrent-item__grabs > span, .torrent-item__size': {
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

    /* Сиды */
    '.torrent-item__seeds > span': {
      'color': '#5cd4b0',
      'background-color': 'rgba(92,212,176,0.14)',
      'border': '0.15em solid rgba(92,212,176,0.9)',
      'box-shadow': '0 0 0.75em rgba(92,212,176,0.28)'
    },
    '.torrent-item__seeds > span.low-seeds': {
      'color': '#ff5f6d',
      'background-color': 'rgba(255,95,109,0.14)',
      'border': '0.15em solid rgba(255,95,109,0.82)',
      'box-shadow': '0 0 0.65em rgba(255,95,109,0.26)',
      'text-shadow': '0 0 0.25em rgba(255,95,109,0.25)'
    },
    '.torrent-item__seeds > span.good-seeds': {
      'color': '#43cea2',
      'background-color': 'rgba(67,206,162,0.16)',
      'border': '0.15em solid rgba(67,206,162,0.92)',
      'box-shadow': '0 0 0.9em rgba(67,206,162,0.34)'
    },
    '.torrent-item__seeds > span.high-seeds': {
      'color': '#ffc371',
      'background': 'linear-gradient(135deg, rgba(255,195,113,0.28), rgba(67,206,162,0.10))',
      'border': '0.15em solid rgba(255,195,113,0.92)',
      'box-shadow': '0 0 0.95em rgba(255,195,113,0.38)',
      'text-shadow': '0 0 0.25em rgba(255,195,113,0.25)'
    },

    /* Личеры */
    '.torrent-item__grabs > span': {
      'color': '#4db6ff',
      'background-color': 'rgba(77,182,255,0.12)',
      'border': '0.15em solid rgba(77,182,255,0.82)',
      'box-shadow': '0 0 0.35em rgba(77,182,255,0.16)'
    },
    '.torrent-item__grabs > span.high-grabs': {
      'color': '#4db6ff',
      'background': 'linear-gradient(135deg, rgba(77,182,255,0.18), rgba(52,152,219,0.10))',
      'border': '0.15em solid rgba(77,182,255,0.92)',
      'box-shadow': '0 0 0.55em rgba(77,182,255,0.22)'
    },

    /* Битрейт */
    '.torrent-item__bitrate > span': {
      'color': '#5cd4b0',
      'background-color': 'rgba(67,206,162,0.10)',
      'border': '0.15em solid rgba(92,212,176,0.78)',
      'box-shadow': '0 0 0.45em rgba(92,212,176,0.20)'
    },
    '.torrent-item__bitrate > span.high-bitrate': {
      'color': '#ffc371',
      'background': 'linear-gradient(135deg, rgba(255,195,113,0.28), rgba(67,206,162,0.10))',
      'border': '0.15em solid rgba(255,195,113,0.92)',
      'box-shadow': '0 0 0.95em rgba(255,195,113,0.38)',
      'text-shadow': '0 0 0.25em rgba(255,195,113,0.25)'
    },
    '.torrent-item__bitrate > span.very-high-bitrate': {
      'color': '#ff5f6d',
      'background': 'linear-gradient(135deg, rgba(255,95,109,0.28), rgba(67,206,162,0.08))',
      'border': '0.15em solid rgba(255,95,109,0.92)',
      'box-shadow': '0 0 1.05em rgba(255,95,109,0.40)',
      'text-shadow': '0 0 0.25em rgba(255,95,109,0.25)'
    },

    /* Размер */
    '.torrent-item__size': {
      'color': '#5cd4b0',
      'background-color': 'rgba(92,212,176,0.12)',
      'border': '0.15em solid rgba(92,212,176,0.82)',
      'box-shadow': '0 0 0.7em rgba(92,212,176,0.26)',
      'font-weight': '700'
    },
    '.torrent-item__size.mid-size': {
      'color': '#43cea2',
      'background-color': 'rgba(67,206,162,0.16)',
      'border': '0.15em solid rgba(67,206,162,0.92)',
      'box-shadow': '0 0 0.9em rgba(67,206,162,0.34)'
    },
    '.torrent-item__size.high-size': {
      'color': '#ffc371',
      'background': 'linear-gradient(135deg, rgba(255,195,113,0.28), rgba(67,206,162,0.10))',
      'border': '0.15em solid rgba(255,195,113,0.95)',
      'box-shadow': '0 0 1.05em rgba(255,195,113,0.40)',
      'text-shadow': '0 0 0.25em rgba(255,195,113,0.22)'
    },
    '.torrent-item__size.top-size': {
      'color': '#ff5f6d',
      'background': 'linear-gradient(135deg, rgba(255,95,109,0.28), rgba(67,206,162,0.08))',
      'border': '0.15em solid rgba(255,95,109,0.95)',
      'box-shadow': '0 0 1.1em rgba(255,95,109,0.42)',
      'text-shadow': '0 0 0.25em rgba(255,95,109,0.22)'
    },

    /* Фокус */
    '.torrent-item.selector.focus, .torrent-serial.selector.focus, .torrent-file.selector.focus': {
      'box-shadow': '0 0 0 0.3em rgba(67,206,162,0.4)'
    },
    '.torrent-item.focus::after': {
      'border': 'none',
      'box-shadow': '0 0 0.6em rgba(92,212,176,0.18)',
      'border-radius': '0.9em'
    }
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .torrent-item__bitrate > span,
      .torrent-item__seeds > span,
      .torrent-item__grabs > span,
      .torrent-item__size {
        min-height: 1.5em !important;
        padding: 0.1em 0.35em !important;
        font-size: 0.85em !important;
      }
      .torrent-item__bitrate,
      .torrent-item__grabs,
      .torrent-item__seeds {
        margin-right: 0.4em !important;
      }
    }
  `;

  function injectStyles() {
    const style = document.createElement('style');
    style.setAttribute('data-' + config.pluginId, 'true');
    style.textContent = Object.entries(styles)
      .map(([selector, rules]) => 
        `${selector} { ${Object.entries(rules).map(([k, v]) => `${k}: ${v} !important`).join('; ')} }`
      )
      .join('\n') + mobileStyles;
    document.head.appendChild(style);
  }

  let updateTimer = null;
  function scheduleUpdate() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(updateTorrentStyles, TH.debounce);
  }

  function parseIntVal(text) {
    return parseInt(text || '', 10) || 0;
  }

  function parseFloatVal(text) {
    return parseFloat((text || '').replace(',', '.')) || 0;
  }

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

  function setTier(el, tiers, tier) {
    tiers.forEach(c => el.classList.remove(c));
    if (tier) el.classList.add(tier);
  }

  function updateTorrentStyles() {
    document.querySelectorAll('.torrent-item__seeds > span').forEach(span => {
      const val = parseIntVal(span.textContent);
      let tier = '';
      if (val < TH.seeds.low) tier = 'low-seeds';
      else if (val >= TH.seeds.high) tier = 'high-seeds';
      else if (val >= TH.seeds.good) tier = 'good-seeds';
      setTier(span, ['low-seeds', 'good-seeds', 'high-seeds'], tier);
    });

    document.querySelectorAll('.torrent-item__bitrate > span').forEach(span => {
      const val = parseFloatVal(span.textContent);
      let tier = '';
      if (val > TH.bitrate.veryHigh) tier = 'very-high-bitrate';
      else if (val >= TH.bitrate.high) tier = 'high-bitrate';
      setTier(span, ['high-bitrate', 'very-high-bitrate'], tier);
    });

    document.querySelectorAll('.torrent-item__grabs > span').forEach(span => {
      const val = parseIntVal(span.textContent);
      setTier(span, ['high-grabs'], val > 10 ? 'high-grabs' : '');
    });

    document.querySelectorAll('.torrent-item__size').forEach(el => {
      const gb = parseSizeGB(el.textContent);
      if (gb === null) {
        setTier(el, ['mid-size', 'high-size', 'top-size'], '');
        return;
      }
      let tier = '';
      if (gb > TH.size.top) tier = 'top-size';
      else if (gb >= TH.size.high) tier = 'high-size';
      else if (gb >= TH.size.mid) tier = 'mid-size';
      setTier(el, ['mid-size', 'high-size', 'top-size'], tier);
    });
  }

  function observe() {
    const observer = new MutationObserver(() => scheduleUpdate());

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    updateTorrentStyles();
  }

  function register() {
    if (typeof Lampa !== 'undefined') {
      Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
      Lampa.Manifest.plugins[config.pluginId] = {
        type: 'other',
        name: config.name,
        version: config.version,
        description: 'Цветовая индикация торрентов.'
      };
    }
    window['plugin_' + config.pluginId + '_ready'] = true;
  }

  function init() {
    injectStyles();
    updateTorrentStyles();
    observe();

    if (window.appready) {
      register();
    } else if (Lampa?.Listener?.follow) {
      Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
          register();
          updateTorrentStyles();
        }
      });
    } else {
      setTimeout(register, 500);
    }
  }

  init();
})();
