(function () {
  'use strict';

  var config = {
    version: '2.0.0',
    name: 'Torrent Styles MOD',
    pluginId: 'torrent_styles_mod'
  };

  // Thresholds
  // Seeds:
  // - <5: danger (red)
  // - 5..9: normal (light emerald)   -> base `ts-seeds`
  // - 10..19: good (emerald)         -> `good-seeds`
  // - >=20: top (gold)               -> `high-seeds`
  //
  // Bitrate (Mbps):
  // - <50: base `ts-bitrate`
  // - 50..100: gold                  -> `high-bitrate`
  // - >100: red                      -> `very-high-bitrate`
  //
  // Size (GB):
  // - <50: base `ts-size`
  // - 50..99: emerald                -> `mid-size`
  // - 100..200: gold                 -> `high-size`
  // - >200: red                      -> `top-size`
  var TH = {
    seeds: {
      danger_below: 5,
      good_from: 10,
      top_from: 20
    },
    bitrate: {
      warn_from: 50,
      danger_from: 100
    },
    size: {
      mid_from_gb: 50,
      high_from_gb: 100,
      top_from_gb: 200
    },
    // Debounce updateTorrentStyles() calls triggered by MutationObserver
    debounce_ms: 60
  };

  var styles = {
    // Base badge look (emerald theme)
    '.torrent-item__bitrate > span.ts-bitrate, .torrent-item__seeds > span.ts-seeds, .torrent-item__grabs > span.ts-grabs, .torrent-item__size.ts-size': {
      'display': 'inline-flex',
      '-webkit-box-align': 'center',
      '-webkit-align-items': 'center',
      '-moz-box-align': 'center',
      '-ms-flex-align': 'center',
      'align-items': 'center',
      '-webkit-box-pack': 'center',
      '-webkit-justify-content': 'center',
      '-moz-box-pack': 'center',
      '-ms-flex-pack': 'center',
      'justify-content': 'center',
      'box-sizing': 'border-box',
      // same visual "size" (height/shape), but allow content width to vary -> fits in one row better
      'min-height': '1.7em',
      'padding': '0.15em 0.45em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'font-size': '0.9em',
      'line-height': '1',
      'white-space': 'nowrap',
      'vertical-align': 'middle',
      // steadier digit width (helps visual alignment)
      'font-variant-numeric': 'tabular-nums'
    },

    // Tighten spacing so everything fits on one row
    '.torrent-item__bitrate, .torrent-item__grabs, .torrent-item__seeds': {
      'margin-right': '0.55em'
    },

    // Seeds (раздают)
    '.torrent-item__seeds > span.ts-seeds': {
      // 5..9 (normal)
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.14)',
      border: '0.15em solid rgba(92, 212, 176, 0.90)',
      'box-shadow': '0 0 0.75em rgba(92, 212, 176, 0.28)'
    },
    // Low seeds (danger) — soft red (emerald palette)
    '.torrent-item__seeds > span.ts-seeds.low-seeds': {
      color: '#ff5f6d',
      'background-color': 'rgba(255, 95, 109, 0.14)',
      border: '0.15em solid rgba(255, 95, 109, 0.82)',
      'box-shadow': '0 0 0.65em rgba(255, 95, 109, 0.26)',
      'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.25)'
    },
    // 10..19 (good) — emerald
    '.torrent-item__seeds > span.ts-seeds.good-seeds': {
      color: '#43cea2',
      'background-color': 'rgba(67, 206, 162, 0.16)',
      border: '0.15em solid rgba(67, 206, 162, 0.92)',
      'box-shadow': '0 0 0.9em rgba(67, 206, 162, 0.34)'
    },
    '.torrent-item__seeds > span.ts-seeds.high-seeds': {
      // >=20 (top) — gold accent (same family as high-bitrate)
      color: '#ffc371',
      background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
      border: '0.15em solid rgba(255, 195, 113, 0.92)',
      'box-shadow': '0 0 0.95em rgba(255, 195, 113, 0.38)',
      'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.25)'
    },

    // Grabs/Peers (качают) — theme blue
    '.torrent-item__grabs > span.ts-grabs': {
      // neutral (no strong glow)
      color: '#4db6ff',
      'background-color': 'rgba(77, 182, 255, 0.12)',
      border: '0.15em solid rgba(77, 182, 255, 0.82)',
      'box-shadow': '0 0 0.35em rgba(77, 182, 255, 0.16)'
    },
    '.torrent-item__grabs > span.ts-grabs.high-grabs': {
      // slightly stronger, still neutral
      color: '#4db6ff',
      background: 'linear-gradient(135deg, rgba(77, 182, 255, 0.18), rgba(52, 152, 219, 0.10))',
      border: '0.15em solid rgba(77, 182, 255, 0.92)',
      'box-shadow': '0 0 0.55em rgba(77, 182, 255, 0.22)'
    },

    // Bitrate — light emerald accent
    '.torrent-item__bitrate > span.ts-bitrate': {
      color: '#5cd4b0',
      'background-color': 'rgba(67, 206, 162, 0.10)',
      border: '0.15em solid rgba(92, 212, 176, 0.78)',
      'box-shadow': '0 0 0.45em rgba(92, 212, 176, 0.20)'
    },
    // 50..100 Mbps (gold)
    '.torrent-item__bitrate > span.ts-bitrate.high-bitrate': {
      color: '#ffc371',
      background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
      border: '0.15em solid rgba(255, 195, 113, 0.92)',
      'box-shadow': '0 0 0.95em rgba(255, 195, 113, 0.38)',
      'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.25)'
    },
    // >100 Mbps (danger)
    '.torrent-item__bitrate > span.ts-bitrate.very-high-bitrate': {
      color: '#ff5f6d',
      background: 'linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08))',
      border: '0.15em solid rgba(255, 95, 109, 0.92)',
      'box-shadow': '0 0 1.05em rgba(255, 95, 109, 0.40)',
      'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.25)'
    },

    // Size — tiered
    '.torrent-item__size.ts-size': {
      // <50GB: light emerald/teal (theme-friendly, not dull)
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.12)',
      border: '0.15em solid rgba(92, 212, 176, 0.82)',
      'box-shadow': '0 0 0.7em rgba(92, 212, 176, 0.26)',
      // override upstream white badge
      'font-weight': '700'
    },
    // 50..100GB: emerald
    '.torrent-item__size.ts-size.mid-size': {
      color: '#43cea2',
      'background-color': 'rgba(67, 206, 162, 0.16)',
      border: '0.15em solid rgba(67, 206, 162, 0.92)',
      'box-shadow': '0 0 0.9em rgba(67, 206, 162, 0.34)'
    },
    // 100..200GB: gold (match emerald theme "premium"/high bitrate)
    '.torrent-item__size.ts-size.high-size': {
      color: '#ffc371',
      background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
      border: '0.15em solid rgba(255, 195, 113, 0.95)',
      'box-shadow': '0 0 1.05em rgba(255, 195, 113, 0.40)',
      'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.22)'
    },
    // >200GB: red (danger)
    '.torrent-item__size.ts-size.top-size': {
      color: '#ff5f6d',
      background: 'linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08))',
      border: '0.15em solid rgba(255, 95, 109, 0.95)',
      'box-shadow': '0 0 1.1em rgba(255, 95, 109, 0.42)',
      'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.22)'
    },

    '.torrent-item.selector.focus': {
      'box-shadow': '0 0 0 0.3em rgba(67, 206, 162, 0.4)'
    },
    '.torrent-serial.selector.focus': {
      'box-shadow': '0 0 0 0.25em rgba(67, 206, 162, 0.4)'
    },
    '.torrent-file.selector.focus': {
      'box-shadow': '0 0 0 0.25em rgba(67, 206, 162, 0.4)'
    },
    '.torrent-item.focus::after': {
      border: '0.24em solid #5cd4b0',
      'box-shadow': '0 0 0.6em rgba(92, 212, 176, 0.18)',
      'border-radius': '0.9em'
    },
    '.scroll__body': {
      margin: '5px'
    }
  };

  function injectStyles() {
    try {
      var style = document.createElement('style');
      var css = Object.keys(styles)
        .map(function (selector) {
          var props = styles[selector];
          var rules = Object.keys(props)
            .map(function (prop) {
              return prop + ': ' + props[prop] + ' !important';
            })
            .join('; ');
          return selector + ' { ' + rules + ' }';
        })
        .join('\n');

      style.setAttribute('data-' + config.pluginId + '-styles', 'true');
      style.innerHTML = css;
      document.head.appendChild(style);
    } catch (e) {
      console.error(config.name, 'style injection error:', e);
    }
  }

  var tsUpdateTimer = null;
  function scheduleUpdate(delayMs) {
    try {
      if (tsUpdateTimer) clearTimeout(tsUpdateTimer);
    } catch (e) { }

    var ms = typeof delayMs === 'number' ? delayMs : TH.debounce_ms;
    tsUpdateTimer = setTimeout(function () {
      tsUpdateTimer = null;
      updateTorrentStyles();
    }, ms);
  }

  function tsParseFloat(text) {
    var t = ((text || '') + '').trim();
    var m = t.match(/(\d+(?:[.,]\d+)?)/);
    return m ? (parseFloat(m[1].replace(',', '.')) || 0) : 0;
  }

  function tsParseInt(text) {
    var t = ((text || '') + '').trim();
    var v = parseInt(t, 10);
    return isNaN(v) ? 0 : v;
  }

  function tsApplyTier(el, classesToClear, classToAdd) {
    try {
      for (var i = 0; i < classesToClear.length; i++) el.classList.remove(classesToClear[i]);
      if (classToAdd) el.classList.add(classToAdd);
    } catch (e) { }
  }

  function tsParseSizeToGb(text) {
    try {
      var t = ((text || '') + '').replace(/\u00A0/g, ' ').trim(); // NBSP -> space
      // Supports: "123 GB", "1.2 TB", "900 MB" and RU: "ГБ/ТБ/МБ/КБ"
      var m = t.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|кб|мб|гб|тб)/i);
      if (!m) return null;

      var num = parseFloat((m[1] || '0').replace(',', '.')) || 0;
      var unit = (m[2] || '').toLowerCase();
      var gb = 0;

      if (unit === 'tb' || unit === 'тб') gb = num * 1024;
      else if (unit === 'gb' || unit === 'гб') gb = num;
      else if (unit === 'mb' || unit === 'мб') gb = num / 1024;
      else if (unit === 'kb' || unit === 'кб') gb = num / (1024 * 1024);
      else gb = 0;

      return gb;
    } catch (e) {
      return null;
    }
  }

  function updateTorrentStyles() {
    try {
      document.querySelectorAll('.torrent-item__seeds span').forEach(function (span) {
        var value = tsParseInt(span.textContent);
        span.classList.add('ts-seeds');

        var seedTier = '';
        if (value < TH.seeds.danger_below) seedTier = 'low-seeds';
        else if (value >= TH.seeds.top_from) seedTier = 'high-seeds';
        else if (value >= TH.seeds.good_from) seedTier = 'good-seeds';
        tsApplyTier(span, ['low-seeds', 'good-seeds', 'high-seeds'], seedTier);
      });

      document.querySelectorAll('.torrent-item__bitrate span').forEach(function (span) {
        var value = tsParseFloat(span.textContent);
        span.classList.add('ts-bitrate');

        var brTier = '';
        if (value > TH.bitrate.danger_from) brTier = 'very-high-bitrate';
        else if (value >= TH.bitrate.warn_from) brTier = 'high-bitrate';
        tsApplyTier(span, ['high-bitrate', 'very-high-bitrate'], brTier);
      });

      // "Grabs" in Lampa template is actually peers/leechers (качают)
      document.querySelectorAll('.torrent-item__grabs span').forEach(function (span) {
        var value = tsParseInt(span.textContent);
        span.classList.add('ts-grabs');
        tsApplyTier(span, ['high-grabs'], value > 10 ? 'high-grabs' : '');
      });

      // Size badge (highlight big files)
      document.querySelectorAll('.torrent-item__size').forEach(function (el) {
        var text = (el.textContent || '');
        el.classList.add('ts-size');

        var gb = tsParseSizeToGb(text);
        if (gb === null) {
          tsApplyTier(el, ['mid-size', 'high-size', 'top-size'], '');
          return;
        }

        var szTier = '';
        if (gb > TH.size.top_from_gb) szTier = 'top-size';
        else if (gb >= TH.size.high_from_gb) szTier = 'high-size';
        else if (gb >= TH.size.mid_from_gb) szTier = 'mid-size';
        tsApplyTier(el, ['mid-size', 'high-size', 'top-size'], szTier);
      });
    } catch (e) {
      console.error(config.name, 'torrent update error:', e);
    }
  }

  function observeDom() {
    try {
      var observer = new MutationObserver(function (mutations) {
        var needsUpdate = false;
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          // Check for added nodes
          if (mutation.addedNodes && mutation.addedNodes.length) {
            needsUpdate = true;
            break;
          }
          // Check for text content changes (bitrate/seeds values might update)
          if (mutation.type === 'characterData' ||
            (mutation.type === 'childList' && mutation.target &&
              (mutation.target.classList &&
                (mutation.target.classList.contains('torrent-item__bitrate') ||
                  mutation.target.classList.contains('torrent-item__seeds') ||
                  mutation.target.classList.contains('torrent-item__grabs') ||
                  mutation.target.classList.contains('torrent-item__size'))))) {
            needsUpdate = true;
            break;
          }
        }
        if (needsUpdate) scheduleUpdate();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      scheduleUpdate(0);
    } catch (e) {
      console.error(config.name, 'observer error:', e);
      scheduleUpdate(0);
    }
  }

  function registerPlugin() {
    try {
      if (typeof Lampa !== 'undefined') {
        Lampa.Manifest = Lampa.Manifest || {};
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};

        Lampa.Manifest.plugins[config.pluginId] = {
          type: 'other',
          name: config.name,
          version: config.version,
          description: 'Дополнительные стили для карточек торрентов.'
        };
      }
    } catch (e) {
      console.error(config.name, 'register error:', e);
    } finally {
      window['plugin_' + config.pluginId + '_ready'] = true;
    }
  }

  function init() {
    injectStyles();
    observeDom();

    if (window.appready) {
      registerPlugin();
      // Update styles after app is ready
      scheduleUpdate(200);
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
          registerPlugin();
          // Update styles again when app is ready
          scheduleUpdate(200);
        }
      });
    } else {
      setTimeout(registerPlugin, 500);
    }

    console.log(config.name, 'Configuration plugin loaded, version:', config.version);
  }

  init();

})();
