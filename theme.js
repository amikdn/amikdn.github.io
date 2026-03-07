(function () {
  'use strict';

  if (window.lampac_theme_plugin) return;

  var STORAGE_KEY = 'lampac_theme';
  var STYLE_ID = 'lampac-theme-style';
  var ALL_CLASSES = ['neon--theme', 'aurora--theme', 'gold--theme', 'mono--theme', 'sunset--theme', 'glass--theme', 'appletv--theme', 'custom--theme'];

  // ═══════════════════════════════════════════════════════════
  //  Theme CSS Generator
  // ═══════════════════════════════════════════════════════════
  function buildCSS(o) {
    var B = 'body.' + o.cls;
    return [

      // ─── Foundation ──────────────────────────────────────
      B + ' { background: ' + o.bg + ' !important; color: ' + o.text + '; }',
      B + '.black--style { background: ' + o.bgBlack + ' !important; }',

      // ─── Header ──────────────────────────────────────────
      B + ' .head__body {' +
      '  background: linear-gradient(180deg, ' + o.bgA95 + ' 0%, ' + o.bgA0 + ' 100%);' +
      '  padding-bottom: 2em;' +
      '}',
      B + ' .head__title { font-weight: 600; letter-spacing: 0.02em; }',
      B + ' .head__action.focus,' +
      B + ' .head__action.hover {' +
      '  background: ' + o.grad + '; color: ' + o.gradText + ';' +
      '}',
      B + ' .head__action.active::after {' +
      '  background-color: ' + o.accent + '; border-color: ' + o.bg + ';' +
      '}',

      // ─── Sidebar ─────────────────────────────────────────
      B + '.menu--open .wrap__left {' +
      '  background: ' + o.sidebarBg + ';' +
      '  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);' +
      '  border-right: 1px solid ' + o.accentA08 + ';' +
      '}',
      B + ' .menu__item { border-radius: 0.8em; margin: 0.15em 0.8em; transition: all 0.2s ease; }',
      B + ' .menu__item.focus,' +
      B + ' .menu__item.traverse,' +
      B + ' .menu__item.hover {' +
      '  background: ' + o.grad + '; color: ' + o.gradText + ';' +
      '  box-shadow: 0 4px 20px ' + o.accentA25 + ';' +
      '}',
      B + ' .menu__item.focus .menu__ico [stroke],' +
      B + ' .menu__item.traverse .menu__ico [stroke],' +
      B + ' .menu__item.hover .menu__ico [stroke] { stroke: ' + o.gradText + '; }',
      B + ' .menu__item.focus .menu__ico path[fill],' +
      B + ' .menu__item.focus .menu__ico rect[fill],' +
      B + ' .menu__item.focus .menu__ico circle[fill],' +
      B + ' .menu__item.traverse .menu__ico path[fill],' +
      B + ' .menu__item.traverse .menu__ico rect[fill],' +
      B + ' .menu__item.traverse .menu__ico circle[fill],' +
      B + ' .menu__item.hover .menu__ico path[fill],' +
      B + ' .menu__item.hover .menu__ico rect[fill],' +
      B + ' .menu__item.hover .menu__ico circle[fill] { fill: ' + o.gradText + '; }',
      B + ' .menu__text { font-weight: 500; letter-spacing: 0.01em; }',

      // ─── Category titles ─────────────────────────────────
      B + ' .items-line__head { margin-bottom: 0.4em; }',
      B + ' .items-line__title {' +
      '  font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; font-size: 1.05em;' +
      '  background: linear-gradient(90deg, ' + o.text + ' 0%, ' + o.accentA70 + ' 100%);' +
      '  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;' +
      '}',

      // ─── Cards ───────────────────────────────────────────
      B + ' .card__img { background-color: ' + o.cardBg + '; border-radius: 1.1em; }',
      B + ' .card__view { transition: transform 0.25s ease, box-shadow 0.25s ease; }',
      B + ' .card.focus .card__view { transform: scale(1.05); z-index: 2; }',
      B + ' .card.focus .card__view::after,' +
      B + ' .card.hover .card__view::after {' +
      '  border-color: ' + o.accent + ';' +
      '  box-shadow: 0 0 20px ' + o.accentA35 + ', 0 8px 32px rgba(0,0,0,0.5);' +
      '  border-radius: 1.5em;' +
      '}',
      B + ' .card.hover .card__view::after {' +
      '  border-color: ' + o.accentA40 + '; box-shadow: 0 0 12px ' + o.accentA15 + ';' +
      '}',
      B + ' .card__title { font-weight: 500; }',
      B + ' .card__vote { color: ' + o.muted + '; }',
      B + ' .card__quality {' +
      '  background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; font-weight: 700;' +
      '}',
      B + ' .card__icons-inner {' +
      '  background: ' + o.bgA70 + '; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
      '}',
      B + ' .card__promo {' +
      '  background: linear-gradient(to bottom, ' + o.bgA0 + ' 0%, ' + o.bgA92 + ' 100%);' +
      '}',

      // ─── Full detail page ────────────────────────────────
      B + ' .full-start__background.loaded { opacity: 0.55; }',
      B + ' .full-start__background.dim { opacity: 0.18; }',
      B + ' .full-start__title { font-weight: 700; letter-spacing: -0.01em; }',
      B + ' .full-start__title-original { color: ' + o.accentA50 + '; font-weight: 400; }',
      B + ' .full-start__tag { background: ' + o.accentA10 + '; border: 1px solid ' + o.accentA15 + '; border-radius: 0.5em; }',
      B + ' .full-start__tag.tag--quality {' +
      '  background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; border: none;' +
      '}',
      B + ' .full-start__button { border-color: rgba(255,255,255,0.2); border-radius: 0.6em; transition: all 0.2s ease; }',
      B + ' .full-start__button.focus {' +
      '  background: ' + o.grad + '; color: ' + o.gradText + '; border-color: transparent;' +
      '  box-shadow: 0 4px 20px ' + o.accentA30 + ';' +
      '}',
      B + ' .full-start__poster.focus img { box-shadow: 0 0 0 3px ' + o.accent + ', 0 0 30px ' + o.accentA30 + '; }',
      B + ' .full-start__img { border-radius: 1.1em; }',
      B + ' .full-start__rating { border-bottom-color: ' + o.accentA08 + '; }',
      B + ' .full-person.focus,' +
      B + ' .full-descr__tag.focus,' +
      B + ' .simple-button.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',

      // ─── Settings ────────────────────────────────────────
      B + ' .settings__content,' +
      B + ' .settings-input__content {' +
      '  background: ' + o.panelBg + ';' +
      '  backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);' +
      '  border-left: 1px solid ' + o.accentA06 + ';' +
      '}',
      B + ' .settings__title { font-weight: 700; letter-spacing: 0.02em; }',
      B + ' .settings-folder { border-radius: 0.8em; margin: 0.1em 0.5em; transition: all 0.2s ease; }',
      B + ' .settings-folder.focus { background: ' + o.accentA10 + '; }',
      B + ' .settings-folder.focus .settings-folder__icon { filter: none; }',
      B + ' .settings-param { border-radius: 0.6em; transition: background 0.2s ease; }',
      B + ' .settings-param.focus { background: ' + o.accentA10 + '; }',
      B + ' .settings-param-title > span { color: #fff; }',
      B + ' .settings-input__links { background-color: ' + o.accentA08 + '; }',

      // ─── Selectbox / Modal ───────────────────────────────
      B + ' .selectbox__content,' +
      B + ' .modal__content {' +
      '  background: ' + o.modalBg + ';' +
      '  backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);' +
      '  border: 1px solid ' + o.accentA08 + '; border-radius: 1.2em;' +
      '}',
      B + ' .selectbox-item { border-radius: 0.6em; margin: 0.1em 0.5em; transition: all 0.15s ease; }',
      B + ' .selectbox-item.focus,' +
      B + ' .selectbox-item.hover { background: ' + o.grad + '; color: ' + o.gradText + '; }',

      // ─── Search ──────────────────────────────────────────
      B + ' .search-source.active { background: ' + o.grad + '; color: ' + o.gradText + '; }',

      // ─── Player ──────────────────────────────────────────
      B + ' .player-panel .button.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',
      B + ' .time-line > div,' +
      B + ' .player-panel__position,' +
      B + ' .player-panel__position > div:after { background: ' + o.gradH + '; }',

      // ─── Torrents ────────────────────────────────────────
      B + ' .torrent-item__size,' +
      B + ' .torrent-item__exe,' +
      B + ' .torrent-item__viewed,' +
      B + ' .torrent-serial__size { background: ' + o.grad + '; color: ' + o.gradText + '; font-weight: 600; }',
      B + ' .torrent-serial { background-color: ' + o.accentA04 + '; }',
      B + ' .torrent-file.focus,' +
      B + ' .torrent-serial.focus { background-color: ' + o.accentA12 + '; }',
      B + ' .torrent-item.focus::after { border-color: ' + o.accent + '; }',

      // ─── Extensions ──────────────────────────────────────
      B + ' .extensions { background: ' + o.bg + '; }',
      B + ' .extensions__item,' +
      B + ' .extensions__block-add { background-color: ' + o.cardBg + '; border-radius: 1em; }',
      B + ' .extensions__item.focus::after,' +
      B + ' .extensions__block-add.focus::after { border-color: ' + o.accent + '; }',

      // ─── IPTV ────────────────────────────────────────────
      B + ' .iptv-list__item.focus,' +
      B + ' .iptv-menu__list-item.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',
      B + ' .iptv-channel { background-color: ' + o.cardBg + ' !important; }',
      B + ' .online-prestige.focus::after,' +
      B + ' .iptv-channel.focus::before,' +
      B + ' .iptv-channel.last--focus::before { border-color: ' + o.accent + ' !important; }',

      // ─── Markers ─────────────────────────────────────────
      B + ' .card__marker { background: ' + o.bgA70 + '; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }',
      B + ' .card__marker--look::before { background-color: ' + o.accent + '; }',
      B + ' .card__marker--viewed::before { background-color: ' + o.accent2 + '; }',

      // ─── Navigation bar ──────────────────────────────────
      B + ' .navigation-bar__body {' +
      '  background: ' + o.sidebarBg + '; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);' +
      '  border-top: 1px solid ' + o.accentA08 + ';' +
      '}',

      B + ' .broadcast__scan::after { border-top-color: ' + o.accent + '; }',

    ].join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  //  Theme Definitions
  // ═══════════════════════════════════════════════════════════
  var THEMES = {
    neon: buildCSS({
      cls: 'neon--theme',
      bg: '#060b18', bgBlack: '#030610', text: '#e2e8f4', muted: '#8899bb',
      accent: '#00e5ff', accent2: '#7c4dff',
      grad: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
      gradH: 'linear-gradient(90deg, #00e5ff, #7c4dff)',
      gradText: '#fff',
      cardBg: '#101828',
      sidebarBg: 'rgba(8,14,30,0.85)',
      panelBg: 'rgba(8,14,30,0.92)',
      modalBg: 'rgba(8,14,30,0.95)',
      bgA0: 'rgba(6,11,24,0)', bgA70: 'rgba(6,11,24,0.7)',
      bgA92: 'rgba(6,11,24,0.92)', bgA95: 'rgba(6,11,24,0.95)',
      accentA04: 'rgba(0,229,255,0.04)', accentA06: 'rgba(0,229,255,0.06)',
      accentA08: 'rgba(0,229,255,0.08)', accentA10: 'rgba(0,229,255,0.1)',
      accentA12: 'rgba(0,229,255,0.12)', accentA15: 'rgba(0,229,255,0.15)',
      accentA25: 'rgba(0,229,255,0.25)', accentA30: 'rgba(0,229,255,0.3)',
      accentA35: 'rgba(0,229,255,0.35)', accentA40: 'rgba(0,229,255,0.4)',
      accentA50: 'rgba(0,229,255,0.5)', accentA70: 'rgba(0,229,255,0.7)',
    }),
    aurora: buildCSS({
      cls: 'aurora--theme',
      bg: '#0d0618', bgBlack: '#060310', text: '#ece4f8', muted: '#9988bb',
      accent: '#c471ed', accent2: '#12c2e9',
      grad: 'linear-gradient(135deg, #c471ed, #f64f59)',
      gradH: 'linear-gradient(90deg, #12c2e9, #c471ed, #f64f59)',
      gradText: '#fff',
      cardBg: '#170d28',
      sidebarBg: 'rgba(13,6,24,0.85)',
      panelBg: 'rgba(13,6,24,0.92)',
      modalBg: 'rgba(13,6,24,0.95)',
      bgA0: 'rgba(13,6,24,0)', bgA70: 'rgba(13,6,24,0.7)',
      bgA92: 'rgba(13,6,24,0.92)', bgA95: 'rgba(13,6,24,0.95)',
      accentA04: 'rgba(196,113,237,0.04)', accentA06: 'rgba(196,113,237,0.06)',
      accentA08: 'rgba(196,113,237,0.08)', accentA10: 'rgba(196,113,237,0.1)',
      accentA12: 'rgba(196,113,237,0.12)', accentA15: 'rgba(196,113,237,0.15)',
      accentA25: 'rgba(196,113,237,0.25)', accentA30: 'rgba(196,113,237,0.3)',
      accentA35: 'rgba(196,113,237,0.35)', accentA40: 'rgba(196,113,237,0.4)',
      accentA50: 'rgba(196,113,237,0.5)', accentA70: 'rgba(196,113,237,0.7)',
    }),
    gold: buildCSS({
      cls: 'gold--theme',
      bg: '#110d08', bgBlack: '#0a0705', text: '#f0e8dc', muted: '#a89880',
      accent: '#d4a853', accent2: '#c47a30',
      grad: 'linear-gradient(135deg, #f6d365, #d4a853)',
      gradH: 'linear-gradient(90deg, #f6d365, #d4a853)',
      gradText: '#1a1208',
      cardBg: '#1e1710',
      sidebarBg: 'rgba(17,13,8,0.88)',
      panelBg: 'rgba(17,13,8,0.92)',
      modalBg: 'rgba(17,13,8,0.95)',
      bgA0: 'rgba(17,13,8,0)', bgA70: 'rgba(17,13,8,0.7)',
      bgA92: 'rgba(17,13,8,0.92)', bgA95: 'rgba(17,13,8,0.95)',
      accentA04: 'rgba(212,168,83,0.04)', accentA06: 'rgba(212,168,83,0.06)',
      accentA08: 'rgba(212,168,83,0.08)', accentA10: 'rgba(212,168,83,0.1)',
      accentA12: 'rgba(212,168,83,0.12)', accentA15: 'rgba(212,168,83,0.15)',
      accentA25: 'rgba(212,168,83,0.25)', accentA30: 'rgba(212,168,83,0.3)',
      accentA35: 'rgba(212,168,83,0.35)', accentA40: 'rgba(212,168,83,0.4)',
      accentA50: 'rgba(212,168,83,0.5)', accentA70: 'rgba(212,168,83,0.7)',
    }),
    mono: buildCSS({
      cls: 'mono--theme',
      bg: '#000000', bgBlack: '#000000', text: '#f0f0f0', muted: '#777777',
      accent: '#ffffff', accent2: '#888888',
      grad: '#ffffff',
      gradH: '#ffffff',
      gradText: '#000000',
      cardBg: '#111111',
      sidebarBg: 'rgba(0,0,0,0.9)',
      panelBg: 'rgba(8,8,8,0.95)',
      modalBg: 'rgba(8,8,8,0.97)',
      bgA0: 'rgba(0,0,0,0)', bgA70: 'rgba(0,0,0,0.7)',
      bgA92: 'rgba(0,0,0,0.92)', bgA95: 'rgba(0,0,0,0.95)',
      accentA04: 'rgba(255,255,255,0.04)', accentA06: 'rgba(255,255,255,0.06)',
      accentA08: 'rgba(255,255,255,0.08)', accentA10: 'rgba(255,255,255,0.1)',
      accentA12: 'rgba(255,255,255,0.12)', accentA15: 'rgba(255,255,255,0.15)',
      accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)',
      accentA35: 'rgba(255,255,255,0.35)', accentA40: 'rgba(255,255,255,0.4)',
      accentA50: 'rgba(255,255,255,0.5)', accentA70: 'rgba(255,255,255,0.7)',
    }),
    sunset: buildCSS({
      cls: 'sunset--theme',
      bg: '#140a0a', bgBlack: '#0a0505', text: '#f4e4e0', muted: '#bb8880',
      accent: '#ff6b35', accent2: '#e63946',
      grad: 'linear-gradient(135deg, #ff9a56, #e63946)',
      gradH: 'linear-gradient(90deg, #ffbe76, #ff6b35, #e63946)',
      gradText: '#fff',
      cardBg: '#241210',
      sidebarBg: 'rgba(20,10,10,0.88)',
      panelBg: 'rgba(20,10,10,0.92)',
      modalBg: 'rgba(20,10,10,0.95)',
      bgA0: 'rgba(20,10,10,0)', bgA70: 'rgba(20,10,10,0.7)',
      bgA92: 'rgba(20,10,10,0.92)', bgA95: 'rgba(20,10,10,0.95)',
      accentA04: 'rgba(255,107,53,0.04)', accentA06: 'rgba(255,107,53,0.06)',
      accentA08: 'rgba(255,107,53,0.08)', accentA10: 'rgba(255,107,53,0.1)',
      accentA12: 'rgba(255,107,53,0.12)', accentA15: 'rgba(255,107,53,0.15)',
      accentA25: 'rgba(255,107,53,0.25)', accentA30: 'rgba(255,107,53,0.3)',
      accentA35: 'rgba(255,107,53,0.35)', accentA40: 'rgba(255,107,53,0.4)',
      accentA50: 'rgba(255,107,53,0.5)', accentA70: 'rgba(255,107,53,0.7)',
    }),
    glass: buildCSS({
      cls: 'glass--theme',
      bg: '#08080c', bgBlack: '#040408', text: '#f5f5f7', muted: '#86868b',
      accent: '#c8deff', accent2: '#6e6e73',
      grad: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(180,210,255,0.14))',
      gradH: 'linear-gradient(90deg, rgba(200,220,255,0.7), rgba(255,255,255,0.9))',
      gradText: '#fff',
      cardBg: 'rgba(255,255,255,0.05)',
      sidebarBg: 'rgba(255,255,255,0.06)',
      panelBg: 'rgba(255,255,255,0.07)',
      modalBg: 'rgba(255,255,255,0.08)',
      bgA0: 'rgba(8,8,12,0)', bgA70: 'rgba(8,8,12,0.7)',
      bgA92: 'rgba(8,8,12,0.92)', bgA95: 'rgba(8,8,12,0.95)',
      accentA04: 'rgba(200,222,255,0.04)', accentA06: 'rgba(200,222,255,0.06)',
      accentA08: 'rgba(200,222,255,0.1)', accentA10: 'rgba(200,222,255,0.12)',
      accentA12: 'rgba(200,222,255,0.15)', accentA15: 'rgba(200,222,255,0.18)',
      accentA25: 'rgba(200,222,255,0.25)', accentA30: 'rgba(200,222,255,0.3)',
      accentA35: 'rgba(200,222,255,0.35)', accentA40: 'rgba(200,222,255,0.4)',
      accentA50: 'rgba(200,222,255,0.5)', accentA70: 'rgba(200,222,255,0.7)',
    }) + '\n' + [
      // ─── Ambient light — gives glass something to refract ──
      'body.glass--theme::before {' +
      '  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;' +
      '  background:' +
      '    radial-gradient(ellipse 80% 60% at 15% 50%, rgba(80,130,255,0.12) 0%, transparent 60%),' +
      '    radial-gradient(ellipse 60% 80% at 85% 20%, rgba(180,100,255,0.09) 0%, transparent 55%),' +
      '    radial-gradient(ellipse 70% 50% at 50% 90%, rgba(80,200,255,0.08) 0%, transparent 50%);' +
      '}',

      // ─── Glass panels ──────────────────────────────────
      'body.glass--theme .settings__content,' +
      'body.glass--theme .settings-input__content,' +
      'body.glass--theme .selectbox__content,' +
      'body.glass--theme .modal__content {' +
      '  backdrop-filter: blur(56px) saturate(2) !important;' +
      '  -webkit-backdrop-filter: blur(56px) saturate(2) !important;' +
      '  border: 1px solid rgba(255,255,255,0.12) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.6);' +
      '}',
      'body.glass--theme.menu--open .wrap__left {' +
      '  backdrop-filter: blur(56px) saturate(2) !important;' +
      '  -webkit-backdrop-filter: blur(56px) saturate(2) !important;' +
      '  border-right: 1px solid rgba(255,255,255,0.12) !important;' +
      '  box-shadow: inset -1px 0 0 rgba(255,255,255,0.06), 6px 0 40px rgba(0,0,0,0.4);' +
      '}',

      // ─── Glass menu items ──────────────────────────────
      'body.glass--theme .menu__item { border-radius: 1em; border: 1px solid transparent; }',
      'body.glass--theme .menu__item.focus,' +
      'body.glass--theme .menu__item.traverse,' +
      'body.glass--theme .menu__item.hover {' +
      '  backdrop-filter: blur(24px) saturate(1.6); -webkit-backdrop-filter: blur(24px) saturate(1.6);' +
      '  border: 1px solid rgba(255,255,255,0.15) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 24px rgba(0,0,0,0.35) !important;' +
      '}',

      // ─── Glass buttons ─────────────────────────────────
      'body.glass--theme .full-start__button {' +
      '  border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 0.8em;' +
      '  backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5);' +
      '  background: rgba(255,255,255,0.07) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);' +
      '}',
      'body.glass--theme .full-start__button.focus {' +
      '  border-color: rgba(255,255,255,0.25) !important;' +
      '  backdrop-filter: blur(28px) saturate(2) !important; -webkit-backdrop-filter: blur(28px) saturate(2) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.35) !important;' +
      '}',

      // ─── Glass cards ───────────────────────────────────
      'body.glass--theme .card__img {' +
      '  border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 4px 16px rgba(0,0,0,0.3);' +
      '}',
      'body.glass--theme .card.focus .card__view { transform: scale(1.06); }',
      'body.glass--theme .card.focus .card__view::after {' +
      '  border-color: rgba(255,255,255,0.3) !important;' +
      '  box-shadow: 0 0 30px rgba(200,222,255,0.2), 0 12px 48px rgba(0,0,0,0.5) !important;' +
      '  border-radius: 1.6em;' +
      '}',

      // ─── Glass select / settings items ─────────────────
      'body.glass--theme .selectbox-item.focus,' +
      'body.glass--theme .selectbox-item.hover {' +
      '  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);' +
      '  border: 1px solid rgba(255,255,255,0.12);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);' +
      '}',
      'body.glass--theme .settings-folder.focus {' +
      '  border: 1px solid rgba(255,255,255,0.1);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);' +
      '}',

      // ─── Glass navigation bar ──────────────────────────
      'body.glass--theme .navigation-bar__body {' +
      '  backdrop-filter: blur(56px) saturate(2) !important;' +
      '  -webkit-backdrop-filter: blur(56px) saturate(2) !important;' +
      '  border-top: 1px solid rgba(255,255,255,0.12) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 -8px 30px rgba(0,0,0,0.3);' +
      '}',

      // ─── Glass quality badges ──────────────────────────
      'body.glass--theme .card__quality {' +
      '  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' +
      '  border: 1px solid rgba(255,255,255,0.15);' +
      '}',

      // ─── Glass extensions ──────────────────────────────
      'body.glass--theme .extensions__item,' +
      'body.glass--theme .extensions__block-add {' +
      '  border: 1px solid rgba(255,255,255,0.08);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2);' +
      '}',
    ].join('\n'),

    // ═══════════════════════════════════════════════════════════
    //  Apple TV — Premium Cinematic Theme
    // ═══════════════════════════════════════════════════════════
    appletv: buildCSS({
      cls: 'appletv--theme',
      bg: '#000000', bgBlack: '#000000', text: '#f5f5f7', muted: '#86868b',
      accent: '#e8e8ed', accent2: '#a1a1a6',
      grad: 'rgba(255,255,255,0.2)',
      gradH: 'rgba(255,255,255,0.25)',
      gradText: '#fff',
      cardBg: '#1c1c1e',
      sidebarBg: 'rgba(0,0,0,0.92)',
      panelBg: 'rgba(28,28,30,0.88)',
      modalBg: 'rgba(28,28,30,0.92)',
      bgA0: 'rgba(0,0,0,0)', bgA70: 'rgba(0,0,0,0.7)',
      bgA92: 'rgba(0,0,0,0.92)', bgA95: 'rgba(0,0,0,0.95)',
      accentA04: 'rgba(255,255,255,0.04)', accentA06: 'rgba(255,255,255,0.06)',
      accentA08: 'rgba(255,255,255,0.08)', accentA10: 'rgba(255,255,255,0.1)',
      accentA12: 'rgba(255,255,255,0.12)', accentA15: 'rgba(255,255,255,0.15)',
      accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)',
      accentA35: 'rgba(255,255,255,0.35)', accentA40: 'rgba(255,255,255,0.4)',
      accentA50: 'rgba(255,255,255,0.5)', accentA70: 'rgba(255,255,255,0.7)',
    }) + '\n' + [
      'var(--atv)', // marker comment stripped by join

      // ─── Animations ──────────────────────────────────────
      '@keyframes appleSlideUp {' +
      '  from { opacity: 0; transform: translateY(24px); }' +
      '  to   { opacity: 1; transform: translateY(0); }' +
      '}',
      '@keyframes appleFadeIn {' +
      '  from { opacity: 0; }' +
      '  to   { opacity: 1; }' +
      '}',

      // ═══════════════════════════════════════════════════════
      //  CINEMATIC FULL-START PAGE (applecation-style)
      // ═══════════════════════════════════════════════════════

      // Background: full-screen immersive, high opacity
      'body.appletv--theme .full-start__background.loaded {' +
      '  opacity: 0.85 !important; filter: none !important;' +
      '  object-fit: cover; width: 100%; height: 100%;' +
      '}',
      'body.appletv--theme .full-start__background.dim { opacity: 0.12 !important; }',

      // Hide poster — full-screen background replaces it
      'body.appletv--theme .full-start-new__left { display: none !important; }',
      'body.appletv--theme .full-start__poster { display: none !important; }',

      // Full-start-new: full viewport, content at bottom-left
      'body.appletv--theme .full-start-new {' +
      '  position: relative; min-height: 92vh; display: flex; align-items: flex-end;' +
      '}',

      // Bottom gradient — strong, covers lower 75%
      'body.appletv--theme .full-start-new::after {' +
      '  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 75%; z-index: 0;' +
      '  pointer-events: none;' +
      '  background: linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 65%, transparent 100%);' +
      '}',
      // Left vignette
      'body.appletv--theme .full-start-new::before {' +
      '  content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;' +
      '  background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 30%, transparent 60%);' +
      '}',

      // Body: left-aligned column layout
      'body.appletv--theme .full-start-new__body {' +
      '  position: relative; z-index: 1; width: 100%;' +
      '  padding: 0 2.5em 2em 2.5em !important;' +
      '  flex-direction: column !important; align-items: flex-start !important;' +
      '}',
      'body.appletv--theme .full-start-new__right {' +
      '  width: 100% !important; max-width: 50%;' +
      '}',

      // Head section
      'body.appletv--theme .full-start-new__head {' +
      '  animation: appleSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.05s both;' +
      '}',

      // Title: cinematic, large, left-aligned
      'body.appletv--theme .full-start-new__title {' +
      '  font-weight: 800 !important; font-size: 3.6em !important; letter-spacing: -0.02em !important;' +
      '  text-shadow: 0 4px 40px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6);' +
      '  line-height: 1.0 !important; margin-bottom: 0.08em !important;' +
      '}',
      // Tagline
      'body.appletv--theme .full-start-new__tagline {' +
      '  color: rgba(255,255,255,0.55) !important; font-weight: 300 !important;' +
      '  font-style: italic; text-shadow: 0 1px 8px rgba(0,0,0,0.5);' +
      '}',

      // Rate line — compact badges
      'body.appletv--theme .full-start-new__rate-line {' +
      '  animation: appleSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.1s both;' +
      '  margin-top: 0.5em !important;' +
      '}',
      'body.appletv--theme .full-start__rate { text-shadow: 0 1px 6px rgba(0,0,0,0.6); }',
      'body.appletv--theme .full-start__pg,' +
      'body.appletv--theme .full-start__status {' +
      '  background: rgba(255,255,255,0.08) !important;' +
      '  border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 0.4em;' +
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
      '}',

      // Details (duration, genre, quality)
      'body.appletv--theme .full-start-new__details {' +
      '  color: rgba(255,255,255,0.65) !important; font-size: 0.9em !important;' +
      '  text-shadow: 0 1px 4px rgba(0,0,0,0.4);' +
      '  animation: appleSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.12s both;' +
      '}',

      // Reactions
      'body.appletv--theme .full-start-new__reactions {' +
      '  animation: appleSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.15s both;' +
      '}',

      // Buttons — bottom row
      'body.appletv--theme .full-start-new__buttons {' +
      '  animation: appleSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.2s both;' +
      '  margin-top: 0.3em !important;' +
      '}',

      // Old layout compatibility
      'body.appletv--theme .full-start__title {' +
      '  font-weight: 800 !important; text-shadow: 0 4px 40px rgba(0,0,0,0.8);' +
      '}',

      // Cinema description (moved into full-start via JS)
      'body.appletv--theme .cinema-descr {' +
      '  color: rgba(255,255,255,0.75); font-weight: 300; font-size: 0.88em;' +
      '  line-height: 1.55; margin: 0.5em 0 0.3em; max-width: 85%;' +
      '  text-shadow: 0 1px 4px rgba(0,0,0,0.5);' +
      '  border-left: 2px solid rgba(255,255,255,0.2); padding-left: 0.8em;' +
      '  animation: appleSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.16s both;' +
      '}',
      // Quality badge
      'body.appletv--theme .cinema-quality-badge,' +
      'body.appletv--theme .cinema-time-badge,' +
      'body.appletv--theme .cinema-genre-badge {' +
      '  display: inline-flex; align-items: center; gap: 0.3em;' +
      '  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);' +
      '  border-radius: 0.5em; padding: 0.15em 0.5em; font-weight: 600;' +
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
      '  font-size: 0.85em; letter-spacing: 0.04em; color: #fff;' +
      '}',
      'body.appletv--theme .cinema-time-badge svg,' +
      'body.appletv--theme .cinema-genre-badge svg { width: 0.9em; height: 0.9em; opacity: 0.7; }',

      // Description section (below cinematic area)
      'body.appletv--theme .full-descr { animation: appleFadeIn 0.5s ease 0.3s both; }',
      'body.appletv--theme .full-descr__text {' +
      '  line-height: 1.6 !important; font-weight: 300 !important; color: rgba(245,245,247,0.85) !important;' +
      '}',
      'body.appletv--theme .full-descr__details { color: rgba(255,255,255,0.6) !important; }',
      'body.appletv--theme .full-descr__info-name { color: rgba(255,255,255,0.4) !important; }',

      // ─── Liquid glass buttons ─────────────────────────────
      'body.appletv--theme .full-start__button {' +
      '  background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.18) !important;' +
      '  border-radius: 2em !important; backdrop-filter: blur(14px) saturate(1.25);' +
      '  -webkit-backdrop-filter: blur(14px) saturate(1.25);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12); transition: all 0.25s cubic-bezier(.16,1,.3,1);' +
      '}',
      'body.appletv--theme .full-start__button.focus {' +
      '  background: rgba(255,255,255,0.22) !important; border-color: rgba(255,255,255,0.35) !important;' +
      '  backdrop-filter: blur(20px) saturate(1.5) contrast(1.05) !important;' +
      '  -webkit-backdrop-filter: blur(20px) saturate(1.5) contrast(1.05) !important;' +
      '  box-shadow: 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.25),' +
      '    0 8px 32px rgba(0,0,0,0.4) !important;' +
      '  transform: scale(1.05);' +
      '}',

      // ─── Glass menu items ─────────────────────────────────
      'body.appletv--theme .menu__item {' +
      '  border-radius: 1em; border: 1px solid transparent; transition: all 0.25s ease;' +
      '}',
      'body.appletv--theme .menu__item.focus,' +
      'body.appletv--theme .menu__item.traverse,' +
      'body.appletv--theme .menu__item.hover {' +
      '  background: rgba(255,255,255,0.12) !important;' +
      '  backdrop-filter: blur(14px) saturate(1.25) !important;' +
      '  -webkit-backdrop-filter: blur(14px) saturate(1.25) !important;' +
      '  border: 1px solid rgba(255,255,255,0.15) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(0,0,0,0.3) !important;' +
      '}',

      // ─── Glass panels ────────────────────────────────────
      'body.appletv--theme .settings__content,' +
      'body.appletv--theme .settings-input__content,' +
      'body.appletv--theme .selectbox__content,' +
      'body.appletv--theme .modal__content {' +
      '  backdrop-filter: blur(56px) saturate(2) !important;' +
      '  -webkit-backdrop-filter: blur(56px) saturate(2) !important;' +
      '  border: 1px solid rgba(255,255,255,0.1) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 24px 80px rgba(0,0,0,0.6);' +
      '  border-radius: 1.4em;' +
      '}',
      'body.appletv--theme.menu--open .wrap__left {' +
      '  backdrop-filter: blur(56px) saturate(2) !important;' +
      '  -webkit-backdrop-filter: blur(56px) saturate(2) !important;' +
      '  border-right: 1px solid rgba(255,255,255,0.1) !important;' +
      '  box-shadow: inset -1px 0 0 rgba(255,255,255,0.06), 6px 0 40px rgba(0,0,0,0.5);' +
      '}',

      // ─── Cards ────────────────────────────────────────────
      'body.appletv--theme .card__img {' +
      '  border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 4px 16px rgba(0,0,0,0.4);' +
      '}',
      'body.appletv--theme .card.focus .card__view { transform: scale(1.05); }',
      'body.appletv--theme .card.focus .card__view::after {' +
      '  border-color: rgba(255,255,255,0.25) !important;' +
      '  box-shadow: 0 0 20px rgba(255,255,255,0.1), 0 12px 40px rgba(0,0,0,0.5) !important;' +
      '  border-radius: 1.5em;' +
      '}',

      // ─── Episodes glass ──────────────────────────────────
      'body.appletv--theme .full-episode { transition: all 0.3s cubic-bezier(.16,1,.3,1); border-radius: 1em; }',
      'body.appletv--theme .full-episode.focus {' +
      '  transform: scale(1.03) translateY(-6px);' +
      '  background: rgba(255,255,255,0.08) !important;' +
      '  backdrop-filter: blur(14px) saturate(1.25); -webkit-backdrop-filter: blur(14px) saturate(1.25);' +
      '  border: 1px solid rgba(255,255,255,0.15);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 40px rgba(0,0,0,0.4);' +
      '}',

      // ─── Persons glass ───────────────────────────────────
      'body.appletv--theme .full-person { transition: all 0.25s ease; border-radius: 1em; }',
      'body.appletv--theme .full-person.focus {' +
      '  background: rgba(255,255,255,0.1) !important;' +
      '  backdrop-filter: blur(14px) saturate(1.25); -webkit-backdrop-filter: blur(14px) saturate(1.25);' +
      '  border: 1px solid rgba(255,255,255,0.12);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.3);' +
      '  transform: scale(1.04);' +
      '}',
      'body.appletv--theme .full-person__photo { border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); }',
      'body.appletv--theme .full-person__name { font-weight: 600 !important; }',

      // ─── Typography overrides ─────────────────────────────
      'body.appletv--theme .items-line__title {' +
      '  font-weight: 600 !important; letter-spacing: 0.05em !important; text-transform: uppercase !important;' +
      '  font-size: 0.95em !important; color: rgba(255,255,255,0.6) !important;' +
      '  background: none !important; -webkit-text-fill-color: unset !important;' +
      '}',
      'body.appletv--theme .card__title { font-weight: 500 !important; letter-spacing: 0.01em; }',

      // ─── Select / settings glass ──────────────────────────
      'body.appletv--theme .selectbox-item.focus,' +
      'body.appletv--theme .selectbox-item.hover {' +
      '  background: rgba(255,255,255,0.12) !important;' +
      '  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);' +
      '  border: 1px solid rgba(255,255,255,0.1);' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);' +
      '}',
      'body.appletv--theme .settings-folder.focus {' +
      '  background: rgba(255,255,255,0.08) !important;' +
      '  border: 1px solid rgba(255,255,255,0.08);' +
      '}',

      // ─── Navigation bar glass ─────────────────────────────
      'body.appletv--theme .navigation-bar__body {' +
      '  backdrop-filter: blur(56px) saturate(2) !important;' +
      '  -webkit-backdrop-filter: blur(56px) saturate(2) !important;' +
      '  border-top: 1px solid rgba(255,255,255,0.1) !important;' +
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 -8px 30px rgba(0,0,0,0.4);' +
      '}',

      // ─── Quality badges ───────────────────────────────────
      'body.appletv--theme .card__quality {' +
      '  background: rgba(255,255,255,0.12) !important; color: #fff !important;' +
      '  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);' +
      '  border: 1px solid rgba(255,255,255,0.15); font-weight: 600;' +
      '}',
      'body.appletv--theme .full-start__tag.tag--quality,' +
      'body.appletv--theme .full-start__pg,' +
      'body.appletv--theme .full-start__status {' +
      '  background: rgba(255,255,255,0.12) !important; color: #fff !important;' +
      '  border: 1px solid rgba(255,255,255,0.18) !important; border-radius: 0.5em;' +
      '}',

      // ─── Extensions glass ─────────────────────────────────
      'body.appletv--theme .extensions__item,' +
      'body.appletv--theme .extensions__block-add {' +
      '  border: 1px solid rgba(255,255,255,0.06);' +
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.3);' +
      '}',

      // ─── Header transparency ──────────────────────────────
      'body.appletv--theme .head__body {' +
      '  background: transparent !important;' +
      '}',

      // ─── Online prestige: progress bar & viewed badge ────
      // Timeline track — subtle glass background so length is visible
      'body.appletv--theme .online-prestige__timeline .time-line {' +
      '  background: rgba(255,255,255,0.08) !important;' +
      '  border-radius: 0.25em; overflow: hidden;' +
      '  border: 1px solid rgba(255,255,255,0.06);' +
      '}',
      // Progress bar fill — bright, visible on dark
      'body.appletv--theme .online-prestige__timeline .time-line > div {' +
      '  background: linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.7)) !important;' +
      '  border-radius: 0.25em;' +
      '  box-shadow: 0 0 6px rgba(255,255,255,0.15);' +
      '}',
      // Viewed badge — glass effect, visible on dark images
      'body.appletv--theme .online-prestige__viewed {' +
      '  background: rgba(255,255,255,0.15) !important;' +
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
      '  border: 1px solid rgba(255,255,255,0.2);' +
      '  box-shadow: 0 2px 8px rgba(0,0,0,0.4);' +
      '}',

    ].join('\n'),
  };

  // ═══════════════════════════════════════════════════════════
  //  Custom Theme Engine
  // ═══════════════════════════════════════════════════════════
  var CUSTOM_BG = {
    black: '#000000', charcoal: '#0c0c0c', navy: '#060b18',
    deepblue: '#08080c', purple: '#0d0618', brown: '#110d08', wine: '#140a0a',
  };
  var CUSTOM_ACCENT = {
    white: '#ffffff', cyan: '#00e5ff', blue: '#448aff', purple: '#b388ff',
    pink: '#ff80ab', red: '#ff5252', orange: '#ff6b35', yellow: '#ffd740',
    green: '#69f0ae', teal: '#64ffda', gold: '#d4a853',
  };

  function hexRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }
  function cR(hex, a) { var c = hexRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  function buildCustomTheme() {
    var bgHex = CUSTOM_BG[Lampa.Storage.get('lampac_custom_bg', 'black')] || '#000000';
    var acHex = CUSTOM_ACCENT[Lampa.Storage.get('lampac_custom_accent', 'cyan')] || '#00e5ff';
    var ac2Hex = CUSTOM_ACCENT[Lampa.Storage.get('lampac_custom_accent2', 'purple')] || '#b388ff';
    var focusStyle = Lampa.Storage.get('lampac_custom_focus', 'gradient');
    var blurLvl = Lampa.Storage.get('lampac_custom_blur', 'medium');
    var cardFx = Lampa.Storage.get('lampac_custom_cards', 'both');

    var bR = hexRgb(bgHex), aR = hexRgb(acHex);
    var lum = (0.299 * aR[0] + 0.587 * aR[1] + 0.114 * aR[2]) / 255;
    var gradText = lum > 0.65 ? '#000' : '#fff';

    var grad, gradH;
    if (focusStyle === 'solid') {
      grad = acHex; gradH = acHex;
    } else if (focusStyle === 'glass') {
      grad = 'linear-gradient(135deg, rgba(255,255,255,0.22), ' + cR(acHex, 0.12) + ')';
      gradH = 'linear-gradient(90deg, ' + cR(acHex, 0.7) + ', rgba(255,255,255,0.9))';
      gradText = '#fff';
    } else {
      grad = 'linear-gradient(135deg, ' + acHex + ', ' + ac2Hex + ')';
      gradH = 'linear-gradient(90deg, ' + acHex + ', ' + ac2Hex + ')';
    }

    var muted = 'rgb(' + Math.round(aR[0] * 0.4 + 128) + ',' + Math.round(aR[1] * 0.4 + 128) + ',' + Math.round(aR[2] * 0.4 + 128) + ')';
    var cardBg = 'rgb(' + Math.min(bR[0] + 18, 42) + ',' + Math.min(bR[1] + 18, 42) + ',' + Math.min(bR[2] + 18, 42) + ')';
    var bgBlack = 'rgb(' + Math.max(bR[0] - 4, 0) + ',' + Math.max(bR[1] - 4, 0) + ',' + Math.max(bR[2] - 4, 0) + ')';

    var sidebarBg, panelBg, modalBg;
    if (focusStyle === 'glass') {
      sidebarBg = 'rgba(255,255,255,0.06)'; panelBg = 'rgba(255,255,255,0.07)'; modalBg = 'rgba(255,255,255,0.08)';
    } else {
      sidebarBg = cR(bgHex, 0.85); panelBg = cR(bgHex, 0.92); modalBg = cR(bgHex, 0.95);
    }

    var css = buildCSS({
      cls: 'custom--theme', bg: bgHex, bgBlack: bgBlack, text: '#f0f0f4', muted: muted,
      accent: acHex, accent2: ac2Hex, grad: grad, gradH: gradH, gradText: gradText,
      cardBg: cardBg, sidebarBg: sidebarBg, panelBg: panelBg, modalBg: modalBg,
      bgA0: cR(bgHex, 0), bgA70: cR(bgHex, 0.7), bgA92: cR(bgHex, 0.92), bgA95: cR(bgHex, 0.95),
      accentA04: cR(acHex, 0.04), accentA06: cR(acHex, 0.06), accentA08: cR(acHex, 0.08),
      accentA10: cR(acHex, 0.1), accentA12: cR(acHex, 0.12), accentA15: cR(acHex, 0.15),
      accentA25: cR(acHex, 0.25), accentA30: cR(acHex, 0.3), accentA35: cR(acHex, 0.35),
      accentA40: cR(acHex, 0.4), accentA50: cR(acHex, 0.5), accentA70: cR(acHex, 0.7),
    });

    var extra = [], C = 'body.custom--theme';
    var blurMap = { none: 0, light: 16, medium: 32, heavy: 56 };
    var blurPx = blurMap[blurLvl] || 32;

    if (blurPx > 0) {
      var sat = blurPx >= 48 ? ' saturate(2)' : blurPx >= 28 ? ' saturate(1.5)' : '';
      var bf = 'blur(' + blurPx + 'px)' + sat;
      extra.push(
        C + ' .settings__content,' + C + ' .settings-input__content,' +
        C + ' .selectbox__content,' + C + ' .modal__content {' +
        '  backdrop-filter: ' + bf + ' !important; -webkit-backdrop-filter: ' + bf + ' !important; }'
      );
      extra.push(C + '.menu--open .wrap__left { backdrop-filter: ' + bf + ' !important; -webkit-backdrop-filter: ' + bf + ' !important; }');
      extra.push(C + ' .navigation-bar__body { backdrop-filter: ' + bf + ' !important; -webkit-backdrop-filter: ' + bf + ' !important; }');
    }

    if (cardFx === 'scale' || cardFx === 'both') {
      extra.push(C + ' .card.focus .card__view { transform: scale(1.06); }');
    }
    if (cardFx === 'glow' || cardFx === 'both') {
      extra.push(C + ' .card.focus .card__view::after { box-shadow: 0 0 25px ' + cR(acHex, 0.3) + ', 0 10px 40px rgba(0,0,0,0.4) !important; }');
    }

    if (focusStyle === 'glass') {
      extra.push(
        C + '::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;' +
        '  background: radial-gradient(ellipse 80% 60% at 15% 50%, ' + cR(acHex, 0.1) + ' 0%, transparent 60%),' +
        '  radial-gradient(ellipse 60% 80% at 85% 20%, ' + cR(ac2Hex, 0.08) + ' 0%, transparent 55%),' +
        '  radial-gradient(ellipse 70% 50% at 50% 90%, ' + cR(acHex, 0.06) + ' 0%, transparent 50%); }'
      );
      extra.push(
        C + ' .settings__content,' + C + ' .selectbox__content,' + C + ' .modal__content {' +
        '  border: 1px solid rgba(255,255,255,0.12) !important;' +
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 20px 60px rgba(0,0,0,0.5); }'
      );
      extra.push(
        C + ' .menu__item.focus,' + C + ' .menu__item.traverse,' + C + ' .menu__item.hover {' +
        '  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);' +
        '  border: 1px solid rgba(255,255,255,0.15) !important;' +
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 24px rgba(0,0,0,0.35) !important; }'
      );
      extra.push(
        C + ' .full-start__button { border: 1px solid rgba(255,255,255,0.15) !important;' +
        '  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background: rgba(255,255,255,0.07) !important; }'
      );
      extra.push(C + ' .card__img { border: 1px solid rgba(255,255,255,0.06); }');
    }

    return css + '\n' + extra.join('\n');
  }

  // ─── Theme Application ──────────────────────────────────
  function applyTheme(name) {
    var existing = document.getElementById(STYLE_ID);
    if (existing) existing.parentNode.removeChild(existing);
    // Also remove ::before pseudo-element (custom/glass ambient)
    var ambientEl = document.getElementById(STYLE_ID + '-ambient');
    if (ambientEl) ambientEl.parentNode.removeChild(ambientEl);
    ALL_CLASSES.forEach(function (c) { document.body.classList.remove(c); });

    var css = (name === 'custom') ? buildCustomTheme() : THEMES[name];
    if (css) {
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.type = 'text/css';
      style.textContent = css;
      document.head.appendChild(style);
      document.body.classList.add(name + '--theme');
    }
  }

  // ─── Settings Registration ──────────────────────────────
  function startPlugin() {
    window.lampac_theme_plugin = true;
    window.lampa_settings = window.lampa_settings || {};
    window.lampa_settings.blur_poster = false;

    function showInfo(msg) {
      if (window.Lampa && Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(msg);
      else console.log('[theme]', msg);
    }

    function getDeviceType() {
      var w = window.innerWidth || 1280;
      if (w <= 600) return 'mobile';
      var tvHint = document.body.classList.contains('tv') || document.body.classList.contains('tv--device');
      return tvHint ? 'tv' : 'desktop';
    }

    function applyThemeProfile(name) {
      if (name === 'manual') return;
      var p = {
        movie: {
          lampac_theme: 'appletv',
          lampac_screen_layout: 'cinematic',
          lampac_screen_compact_mode: 'normal',
          lampac_screen_bg_dim: 'medium',
          lampac_screen_button_size: 'large'
        },
        series: {
          lampac_theme: 'glass',
          lampac_screen_layout: 'default',
          lampac_screen_compact_mode: 'compact',
          lampac_screen_bg_dim: 'low',
          lampac_screen_button_size: 'normal'
        },
        kids: {
          lampac_theme: 'sunset',
          lampac_screen_layout: 'default',
          lampac_screen_compact_mode: 'normal',
          lampac_screen_bg_dim: 'none',
          lampac_screen_button_size: 'xl'
        }
      }[name];
      if (!p) return;
      Object.keys(p).forEach(function (k) { Lampa.Storage.set(k, p[k]); });
      applyTheme(Lampa.Storage.get(STORAGE_KEY, 'classic'));
      applyCardDisplay();
      applyScreenStyle();
      showInfo('Профиль применен: ' + name);
    }

    function handleToolsAction(action) {
      if (!action || action === 'none') return;
      try {
        if (action === 'export') {
          var data = {};
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf('lampac_') === 0) data[k] = localStorage.getItem(k);
          }
          var json = JSON.stringify(data);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(json).then(function () { showInfo('Настройки скопированы в буфер'); });
          } else {
            window.prompt('Скопируйте JSON настроек', json);
          }
        } else if (action === 'import') {
          var raw = window.prompt('Вставьте JSON настроек lampac');
          if (!raw) return;
          var parsed = JSON.parse(raw);
          Object.keys(parsed).forEach(function (k) {
            if (k.indexOf('lampac_') === 0) Lampa.Storage.set(k, parsed[k]);
          });
          applyTheme(Lampa.Storage.get(STORAGE_KEY, 'classic'));
          applyCardDisplay();
          applyScreenStyle();
          showInfo('Импорт завершен');
        } else if (action === 'diagnostics') {
          var list = [
            'Тема: ' + Lampa.Storage.get('lampac_theme', 'classic'),
            'Экран: ' + Lampa.Storage.get('lampac_screen_layout', 'default'),
            'Mobile: ' + Lampa.Storage.get('lampac_screen_mobile_layout', 'poster'),
            'Кнопки: ' + Lampa.Storage.get('lampac_screen_button_size', 'normal'),
            'Компактный: ' + Lampa.Storage.get('lampac_screen_compact_mode', 'normal'),
            'Meta line: ' + Lampa.Storage.get('lampac_screen_compact_meta', 'off'),
            'Порядок кнопок: ' + Lampa.Storage.get('lampac_screen_button_order', 'online,torrent,trailer,book'),
            'Скрыть лишние: ' + Lampa.Storage.get('lampac_screen_hide_extra_buttons', 'off'),
            'TV режим: ' + Lampa.Storage.get('lampac_screen_tv_mode', 'off'),
            'Затемнение: ' + Lampa.Storage.get('lampac_screen_bg_dim', 'none')
          ];
          window.prompt('Диагностика', list.join('\n'));
        }
      } catch (e) {
        showInfo('Ошибка действия: ' + e.message);
      } finally {
        Lampa.Storage.set('lampac_tools_action', 'none');
      }
    }

    function applyAutoThemeByTime() {
      if (Lampa.Storage.get('lampac_theme_autotime', 'off') !== 'on') return;
      var dayTheme = Lampa.Storage.get('lampac_theme_day', 'classic');
      var nightTheme = Lampa.Storage.get('lampac_theme_night', 'appletv');
      var hour = new Date().getHours();
      var target = (hour >= 7 && hour < 20) ? dayTheme : nightTheme;
      if (Lampa.Storage.get(STORAGE_KEY, 'classic') !== target) {
        Lampa.Storage.set(STORAGE_KEY, target);
        applyTheme(target);
      }
    }

    Lampa.Lang.add({
      lampac_theme_title: {
        ru: 'Оформление',
        en: 'Appearance',
        uk: 'Оформлення',
      },
      lampac_theme_select: {
        ru: 'Тема оформления',
        en: 'Theme',
        uk: 'Тема оформлення',
      },
      lampac_theme_select_descr: {
        ru: 'Выберите визуальную тему приложения',
        en: 'Choose the visual theme',
        uk: 'Виберіть візуальну тему',
      },
    });

    var ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.528.528 0 01-.13-.33c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zM5.5 12c-.83 0-1.5-.67-1.5-1.5S4.67 9 5.5 9 7 9.67 7 10.5 6.33 12 5.5 12zm3-4C7.67 8 7 7.33 7 6.5S7.67 5 8.5 5s1.5.67 1.5 1.5S9.33 8 8.5 8zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 5 15.5 5s1.5.67 1.5 1.5S16.33 8 15.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';

    Lampa.SettingsApi.addComponent({
      component: 'theme',
      icon: ICON,
      name: Lampa.Lang.translate('lampac_theme_title'),
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: STORAGE_KEY,
        type: 'select',
        values: {
          classic: 'Классическая',
          neon: 'Неон',
          aurora: 'Аврора',
          gold: 'Золото',
          mono: 'Монохром',
          sunset: 'Закат',
          glass: 'Жидкое стекло',
          appletv: 'Apple TV',
          custom: 'Своя тема',
        },
        default: 'classic',
      },
      field: {
        name: Lampa.Lang.translate('lampac_theme_select'),
        description: Lampa.Lang.translate('lampac_theme_select_descr'),
      },
      onChange: function (value) {
        applyTheme(value);
      },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_theme_profile',
        type: 'select',
        values: { manual: 'Ручной', movie: 'Кино', series: 'Сериалы', kids: 'Детский' },
        default: 'manual',
      },
      field: {
        name: 'Профиль темы',
        description: 'Готовые наборы параметров',
      },
      onChange: applyThemeProfile,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_theme_autotime',
        type: 'select',
        values: { off: 'Выключить', on: 'Включить' },
        default: 'off',
      },
      field: {
        name: 'Автотема по времени',
        description: 'Днем и ночью автоматически применяются разные темы',
      },
      onChange: function () {
        applyAutoThemeByTime();
      },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_theme_day',
        type: 'select',
        values: {
          classic: 'Классическая', neon: 'Неон', aurora: 'Аврора', gold: 'Золото',
          mono: 'Монохром', sunset: 'Закат', glass: 'Жидкое стекло', appletv: 'Apple TV', custom: 'Своя тема'
        },
        default: 'classic',
      },
      field: { name: 'Дневная тема', description: 'Используется с 07:00 до 19:59 при автотеме' },
      onChange: applyAutoThemeByTime,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_theme_night',
        type: 'select',
        values: {
          classic: 'Классическая', neon: 'Неон', aurora: 'Аврора', gold: 'Золото',
          mono: 'Монохром', sunset: 'Закат', glass: 'Жидкое стекло', appletv: 'Apple TV', custom: 'Своя тема'
        },
        default: 'appletv',
      },
      field: { name: 'Ночная тема', description: 'Используется с 20:00 до 06:59 при автотеме' },
      onChange: applyAutoThemeByTime,
    });

    // ─── Custom theme params ──────────────────────────────
    function refreshCustom() {
      if (Lampa.Storage.get(STORAGE_KEY, 'classic') === 'custom') applyTheme('custom');
    }

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_custom_bg',
        type: 'select',
        values: {
          black: 'Чёрный',
          charcoal: 'Графит',
          navy: 'Тёмно-синий',
          deepblue: 'Глубокий синий',
          purple: 'Тёмно-фиолетовый',
          brown: 'Тёмно-коричневый',
          wine: 'Бордовый',
        },
        default: 'black',
      },
      field: {
        name: 'Цвет фона',
        description: 'Для темы «Своя»',
      },
      onChange: refreshCustom,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_custom_accent',
        type: 'select',
        values: {
          cyan: 'Голубой',
          blue: 'Синий',
          purple: 'Фиолетовый',
          pink: 'Розовый',
          red: 'Красный',
          orange: 'Оранжевый',
          yellow: 'Жёлтый',
          green: 'Зелёный',
          teal: 'Бирюзовый',
          gold: 'Золотой',
          white: 'Белый',
        },
        default: 'cyan',
      },
      field: {
        name: 'Основной цвет',
        description: 'Акцентный цвет интерфейса',
      },
      onChange: refreshCustom,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_custom_accent2',
        type: 'select',
        values: {
          purple: 'Фиолетовый',
          cyan: 'Голубой',
          blue: 'Синий',
          pink: 'Розовый',
          red: 'Красный',
          orange: 'Оранжевый',
          yellow: 'Жёлтый',
          green: 'Зелёный',
          teal: 'Бирюзовый',
          gold: 'Золотой',
          white: 'Белый',
        },
        default: 'purple',
      },
      field: {
        name: 'Второй цвет',
        description: 'Для градиентов (режим «Градиент»)',
      },
      onChange: refreshCustom,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_custom_focus',
        type: 'select',
        values: {
          gradient: 'Градиент',
          solid: 'Сплошной',
          glass: 'Стекло',
        },
        default: 'gradient',
      },
      field: {
        name: 'Стиль фокуса',
        description: 'Тип подсветки активных элементов',
      },
      onChange: refreshCustom,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_custom_blur',
        type: 'select',
        values: {
          none: 'Нет',
          light: 'Лёгкое',
          medium: 'Среднее',
          heavy: 'Сильное',
        },
        default: 'medium',
      },
      field: {
        name: 'Размытие панелей',
        description: 'Интенсивность backdrop-blur',
      },
      onChange: refreshCustom,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme',
      param: {
        name: 'lampac_custom_cards',
        type: 'select',
        values: {
          both: 'Свечение + масштаб',
          glow: 'Только свечение',
          scale: 'Только масштаб',
          none: 'Без эффекта',
        },
        default: 'both',
      },
      field: {
        name: 'Эффект карточек',
        description: 'Анимация при фокусе на карточке',
      },
      onChange: refreshCustom,
    });

    // ═══════════════════════════════════════════════════════
    //  Card Display Customization
    // ═══════════════════════════════════════════════════════
    var CARD_STYLE_ID = 'lampac-card-display-style';

    function applyCardDisplay() {
      var existing = document.getElementById(CARD_STYLE_ID);
      if (existing) existing.parentNode.removeChild(existing);

      var rules = [];

      if (Lampa.Storage.get('lampac_card_quality', 'show') === 'hide') {
        rules.push('.card__quality { display: none !important; }');
      }
      if (Lampa.Storage.get('lampac_card_vote', 'show') === 'hide') {
        rules.push('.card__vote { display: none !important; }');
      }
      if (Lampa.Storage.get('lampac_card_title', 'show') === 'hide') {
        rules.push('.card__title { display: none !important; }');
      }
      if (Lampa.Storage.get('lampac_card_year', 'show') === 'hide') {
        rules.push('.card__age { display: none !important; }');
      }

      // Card corner radius
      var radiusMap = { small: '0.4em', medium: '1em', large: '1.6em', round: '2.2em' };
      var radius = radiusMap[Lampa.Storage.get('lampac_card_radius', 'medium')];
      if (radius) {
        rules.push('.card__img { border-radius: ' + radius + ' !important; }');
        rules.push('.card__view::after { border-radius: calc(' + radius + ' + 0.3em) !important; }');
      }

      // Title font size
      var titleSizeMap = { small: '0.82em', normal: '', large: '1.1em' };
      var titleSize = titleSizeMap[Lampa.Storage.get('lampac_card_title_size', 'normal')];
      if (titleSize) {
        rules.push('.card__title { font-size: ' + titleSize + ' !important; }');
      }

      // Vote badge style
      var voteStyle = Lampa.Storage.get('lampac_card_vote_style', 'default');
      if (voteStyle === 'colored') {
        rules.push('.card__vote { padding: 0.2em 0.5em; border-radius: 0.4em; font-weight: 700; }');
        rules.push('.card__vote--good { background: rgba(76,175,80,0.85); color: #fff; }');
        rules.push('.card__vote--bad { background: rgba(244,67,54,0.85); color: #fff; }');
        rules.push('.card__vote--average { background: rgba(255,152,0,0.85); color: #fff; }');
        // Auto-color votes via JS will be handled separately
      } else if (voteStyle === 'pill') {
        rules.push('.card__vote {' +
          '  background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
          '  padding: 0.15em 0.5em; border-radius: 2em; font-weight: 600;' +
          '  border: 1px solid rgba(255,255,255,0.15);' +
          '}');
      }

      if (rules.length) {
        var style = document.createElement('style');
        style.id = CARD_STYLE_ID;
        style.type = 'text/css';
        style.textContent = rules.join('\n');
        document.head.appendChild(style);
      }
    }

    // ─── Card display settings component ─────────────────
    var CARD_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/></svg>';

    Lampa.SettingsApi.addComponent({
      component: 'theme_cards',
      icon: CARD_ICON,
      name: 'Карточки',
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_quality',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Бейдж качества', description: 'Значки 4K, HD на постере' },
      onChange: applyCardDisplay,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_vote',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Рейтинг', description: 'Оценка на постере' },
      onChange: applyCardDisplay,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_vote_style',
        type: 'select',
        values: { 'default': 'Стандартный', pill: 'Таблетка', colored: 'Цветной' },
        default: 'default',
      },
      field: { name: 'Стиль рейтинга', description: 'Внешний вид значка рейтинга' },
      onChange: applyCardDisplay,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_title',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Название', description: 'Текст названия под карточкой' },
      onChange: applyCardDisplay,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_title_size',
        type: 'select',
        values: { small: 'Маленький', normal: 'Обычный', large: 'Большой' },
        default: 'normal',
      },
      field: { name: 'Размер названия', description: 'Размер шрифта названия' },
      onChange: applyCardDisplay,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_year',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Год выхода', description: 'Год под названием' },
      onChange: applyCardDisplay,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_cards',
      param: {
        name: 'lampac_card_radius',
        type: 'select',
        values: { small: 'Малое', medium: 'Среднее', large: 'Большое', round: 'Максимальное' },
        default: 'medium',
      },
      field: { name: 'Скругление углов', description: 'Радиус скругления постера' },
      onChange: applyCardDisplay,
    });

    // ═══════════════════════════════════════════════════════
    //  Movie Screen Customization
    // ═══════════════════════════════════════════════════════
    var SCREEN_STYLE_ID = 'lampac-screen-style';

    function applyScreenStyle() {
      var existing = document.getElementById(SCREEN_STYLE_ID);
      if (existing) existing.parentNode.removeChild(existing);

      var rules = [];
      var layout = Lampa.Storage.get('lampac_screen_layout', 'default');
      var anim = Lampa.Storage.get('lampac_screen_anim', 'cascade');
      var showRatings = Lampa.Storage.get('lampac_screen_ratings', 'show');
      var showReactions = Lampa.Storage.get('lampac_screen_reactions', 'show');
      var showTagline = Lampa.Storage.get('lampac_screen_tagline', 'show');
      var ratingStyle = Lampa.Storage.get('lampac_screen_rating_style', 'logo');
      var showDescr = Lampa.Storage.get('lampac_screen_descr', 'show');
      var showTitleLogo = Lampa.Storage.get('lampac_screen_title_logo', 'show');
      var logoAllowUS = Lampa.Storage.get('lampac_screen_logo_us', 'show');
      var logoSize = Lampa.Storage.get('lampac_screen_logo_size', 'medium');
      var mobileMode = Lampa.Storage.get('lampac_screen_mobile_layout', 'poster');
      var buttonSizeMode = Lampa.Storage.get('lampac_screen_button_size', 'normal');
      var compactScreen = Lampa.Storage.get('lampac_screen_compact_mode', 'normal');
      var compactMeta = Lampa.Storage.get('lampac_screen_compact_meta', 'off');
      var tvMode = Lampa.Storage.get('lampac_screen_tv_mode', 'off');
      var bgDim = Lampa.Storage.get('lampac_screen_bg_dim', 'none');
      var overlayOpacity = parseInt(Lampa.Storage.get('lampac_screen_overlay_opacity', '88'), 10);
      var mobileButtonsView = Lampa.Storage.get('lampac_screen_mobile_buttons_view', 'row');
      var autoContrast = Lampa.Storage.get('lampac_screen_auto_contrast', 'on');
      var deviceProfiles = Lampa.Storage.get('lampac_screen_device_profiles', 'off');

      if (deviceProfiles === 'on') {
        var deviceType = getDeviceType();
        var profileName = Lampa.Storage.get('lampac_screen_profile_' + deviceType, 'normal');
        if (profileName === 'compact') {
          compactScreen = 'compact';
          buttonSizeMode = 'compact';
          if (deviceType === 'mobile') mobileMode = 'poster';
        } else if (profileName === 'cinema') {
          layout = 'cinematic';
          bgDim = 'medium';
          if (deviceType === 'mobile') mobileMode = 'bottom';
        } else if (profileName === 'kids') {
          buttonSizeMode = 'xl';
          compactScreen = 'normal';
          bgDim = 'none';
        }
      }
      if (!overlayOpacity || overlayOpacity < 45) overlayOpacity = 45;
      if (overlayOpacity > 98) overlayOpacity = 98;

      var buttonPresets = {
        compact: { d: '2.72em', dPad: '0.62em', dFont: '0.78em', m: '2.62em', mPad: '0.58em', mFont: '0.75em' },
        normal: { d: '3.2em', dPad: '0.9em', dFont: '0.85em', m: '3.15em', mPad: '0.85em', mFont: '0.83em' },
        large: { d: '3.55em', dPad: '1.02em', dFont: '0.92em', m: '3.45em', mPad: '0.95em', mFont: '0.9em' },
        xl: { d: '3.95em', dPad: '1.12em', dFont: '0.98em', m: '3.85em', mPad: '1.05em', mFont: '0.96em' }
      };
      var btn = buttonPresets[buttonSizeMode] || buttonPresets.normal;

      // ─── Cinematic layout (for non-appletv themes) ──────
      if (layout === 'cinematic') {
        rules.push('.full-start-new__left { display: none !important; }');
        rules.push('.full-start__poster { display: none !important; }');
        rules.push('.full-start-new {' +
          '  position: relative; min-height: 92vh; display: flex; align-items: flex-end; }');
        rules.push('.full-start__background.loaded { opacity: 0.85 !important; filter: none !important; }');
        rules.push('.full-start-new__body {' +
          '  position: relative; z-index: 1; width: 100%;' +
          '  padding: 0 2.5em 2em 2.5em !important;' +
          '  flex-direction: column !important; align-items: flex-start !important; }');
        rules.push('.full-start-new__right { width: 100% !important; max-width: 50%; }');
        rules.push('.full-start-new__title {' +
          '  font-size: 3.6em !important; font-weight: 800 !important;' +
          '  text-shadow: 0 4px 40px rgba(0,0,0,0.8); line-height: 1.0 !important; }');
        rules.push('.head__body { background: transparent !important; }');
      }

      // ─── Animations ─────────────────────────────────────
      if (anim === 'cascade') {
        rules.push('@keyframes screenSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }');
        rules.push('@keyframes screenFadeIn { from { opacity:0; } to { opacity:1; } }');
        rules.push('.full-start-new__head { animation: screenSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.05s both; }');
        rules.push('.full-start-new__rate-line { animation: screenSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.1s both; }');
        rules.push('.full-start-new__details { animation: screenSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.12s both; }');
        rules.push('.full-start-new__reactions { animation: screenSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.15s both; }');
        rules.push('.full-start-new__buttons { animation: screenSlideUp 0.6s cubic-bezier(.16,1,.3,1) 0.2s both; }');
        rules.push('.full-descr { animation: screenFadeIn 0.5s ease 0.3s both; }');
      } else if (anim === 'fade') {
        rules.push('@keyframes screenFadeIn { from { opacity:0; } to { opacity:1; } }');
        rules.push('.full-start-new__head, .full-start-new__rate-line,' +
          '.full-start-new__details, .full-start-new__reactions,' +
          '.full-start-new__buttons, .full-descr { animation: screenFadeIn 0.6s ease both; }');
      }

      // ─── Hide elements ──────────────────────────────────
      if (showRatings === 'hide') {
        rules.push('.full-start-new__rate-line { display: none !important; }');
      }
      if (showReactions === 'hide') {
        rules.push('.full-start-new__reactions { display: none !important; }');
      }
      if (showTagline === 'hide') {
        rules.push('.full-start-new__tagline { display: none !important; }');
      }
      if (showDescr === 'hide') {
        rules.push('.full-descr { display: none !important; }');
      }
      if (compactScreen === 'compact') {
        rules.push('.full-start-new__tagline { display: none !important; }');
        rules.push('.full-descr, .cinema-descr, .full-descr__text { display: none !important; }');
        rules.push('.full-start-new__right { row-gap: 0.2em !important; }');
        rules.push('.full-start-new__head, .full-start-new__details, .full-start-new__rate-line { margin-top: 0.25em !important; }');
      }
      if (compactMeta === 'on') {
        rules.push('.lampac-meta-line {' +
          '  margin-top: 0.35em !important; color: rgba(255,255,255,0.86); font-size: 0.92em;' +
          '  line-height: 1.35; white-space: normal; word-break: break-word;' +
          '}');
      }

      // ─── Rating style ───────────────────────────────────
      if (ratingStyle === 'colored' || ratingStyle === 'logo') {
        // Glass card base (match PG/status size)
        rules.push('.full-start__rate {' +
          '  background: rgba(255,255,255,0.06) !important;' +
          '  border: 1px solid rgba(255,255,255,0.1) !important;' +
          '  border-radius: 0.7em; padding: 0.3em 0.55em !important;' +
          '  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' +
          '  display: inline-flex !important; align-items: center; gap: 0.35em;' +
          '  font-size: 0.9em; line-height: 1;' +
          '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); }');
        rules.push('.full-start__rate.hide { display: none !important; }');
        // Score — white, prominent
        rules.push('.full-start__rate > div:first-child {' +
          '  color: #fff !important; font-weight: 700; font-size: 1em; line-height: 1; }');

        if (ratingStyle === 'colored') {
          // Service name as colored text
          rules.push('.full-start__rate .source--name,' +
            '.full-start__rate > div:last-child {' +
            '  font-weight: 800; font-size: 0.7em; letter-spacing: 0.06em; text-transform: uppercase; }');
          rules.push('.full-start__rate.rate--imdb > div:last-child,' +
            '.full-start__rate.rate--imdb .source--name { color: #F5C518 !important; }');
          rules.push('.full-start__rate.rate--tmdb > div:last-child,' +
            '.full-start__rate.rate--tmdb .source--name { color: #01B4E4 !important; }');
          rules.push('.full-start__rate.rate--kp > div:last-child,' +
            '.full-start__rate.rate--kp .source--name { color: #FF6600 !important; }');
        } else {
          // Logo — service name as colored mini-pill badge
          rules.push('.full-start__rate .source--name,' +
            '.full-start__rate > div:last-child {' +
            '  font-weight: 900; font-size: 0.6em; letter-spacing: 0.06em;' +
            '  text-transform: uppercase; line-height: 1;' +
            '  padding: 0.2em 0.45em; border-radius: 0.35em; }');
          // IMDB — yellow badge with IMDb text icon
          rules.push('.full-start__rate.rate--imdb > div:last-child,' +
            '.full-start__rate.rate--imdb .source--name {' +
            '  font-size: 0 !important; padding: 0 !important;' +
            '  display: inline-block; width: 32px; height: 22px; min-width: 32px; border-radius: 4px;' +
            "  background: #F5C518 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 24'%3E%3Ctext x='24' y='17.5' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-weight='900' font-size='14' fill='%23000'%3EIMDb%3C/text%3E%3C/svg%3E\") no-repeat center;" +
            '  background-size: contain; }');
          // TMDB — green speech bubble logo
          rules.push('.full-start__rate.rate--tmdb > div:last-child,' +
            '.full-start__rate.rate--tmdb .source--name {' +
            '  font-size: 0 !important; padding: 0 !important;' +
            '  display: inline-block; width: 32px; height: 22px; min-width: 32px; border-radius: 4px;' +
            "  background: #0d253f url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 32'%3E%3Crect x='4' y='4' width='40' height='22' rx='4' fill='none' stroke='%2301b468' stroke-width='2.5'/%3E%3Cpolygon points='12,26 18,26 14,31' fill='%2301b468'/%3E%3Ctext x='24' y='19.5' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='11' fill='%2301b468'%3ETMDb%3C/text%3E%3C/svg%3E\") no-repeat center;" +
            '  background-size: contain; }');
          // KP — Kinopoisk K icon on orange
          rules.push('.full-start__rate.rate--kp > div:last-child,' +
            '.full-start__rate.rate--kp .source--name {' +
            '  font-size: 0 !important; padding: 0 !important;' +
            '  display: inline-block; width: 22px; height: 22px; min-width: 22px; border-radius: 4px;' +
            "  background: #FF6600 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='7' height='20' rx='1' fill='%23fff'/%3E%3Cpolygon points='7,10 18,1 13,1 7,5.5' fill='%23fff'/%3E%3Cpolygon points='7,10 18,19 13,19 7,14.5' fill='%23fff'/%3E%3Cline x1='7' y1='10' x2='18' y2='5' stroke='%23fff' stroke-width='1.3' opacity='.55'/%3E%3Cline x1='7' y1='10' x2='18' y2='15' stroke='%23fff' stroke-width='1.3' opacity='.55'/%3E%3Cline x1='7' y1='10' x2='19' y2='10' stroke='%23fff' stroke-width='1.3' opacity='.55'/%3E%3C/svg%3E\") no-repeat center;" +
            '  background-size: 65%; }');
        }

        // PG and status badges
        rules.push('.full-start__pg, .full-start__status {' +
          '  background: rgba(255,255,255,0.06) !important;' +
          '  border: 1px solid rgba(255,255,255,0.1) !important;' +
          '  border-radius: 0.7em; padding: 0.3em 0.55em !important;' +
          '  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' +
          '  font-weight: 600; font-size: 0.9em; }');
      }

      // ─── Description styling ────────────────────────────
      // Disable full-screen gradient overlays
      rules.push('.full-start-new::before, .full-start-new::after { display: none !important; background: none !important; }');
      // Always hide reactions and reaction button
      rules.push('.full-start-new__reactions, .button--reaction { display: none !important; }');
      // Optionally hide play button if user wants it removed
      rules.push('.button--play { display: none !important; }');
      rules.push('body.lampac-poster-fs-open { overflow: hidden !important; }');
      // Title logo (if enabled)
      if (showTitleLogo === 'show') {
        rules.push('.full-start-new__logo {' +
          '  max-width: 92%; margin: -0.2em 0 0.2em 0; min-height: 5.2em; }');
        rules.push('.full-start-new__logo img {' +
          '  max-width: 100%; height: auto; display: block; }');
        if (logoSize === 'xs') {
          rules.push('.full-start-new__logo img { max-height: 7.6em; }');
        } else if (logoSize === 'small') {
          rules.push('.full-start-new__logo img { max-height: 9.6em; }');
        } else if (logoSize === 'large') {
          rules.push('.full-start-new__logo img { max-height: 13.6em; }');
        } else if (logoSize === 'xl') {
          rules.push('.full-start-new__logo img { max-height: 18.4em; }');
        } else {
          rules.push('.full-start-new__logo img { max-height: 11.6em; }');
        }
      }
      rules.push('.full-descr__text {' +
        '  line-height: 1.6 !important; font-weight: 300 !important;' +
        '  color: rgba(245,245,247,0.85) !important; font-size: 1.05em !important; }');
      rules.push('.full-descr__details { color: rgba(255,255,255,0.6) !important; }');
      rules.push('.full-descr__info-name { color: rgba(255,255,255,0.4) !important; font-size: 0.85em !important; text-transform: uppercase; letter-spacing: 0.05em; }');
      // Cinema description (moved into full-start)
      rules.push('.cinema-descr {' +
        '  color: rgba(255,255,255,0.75); font-weight: 300; font-size: 0.88em;' +
        '  line-height: 1.55; margin: 0 0 0.25em; max-width: 85%;' +
        '  text-shadow: 0 1px 4px rgba(0,0,0,0.5);' +
        '  border-left: 2px solid rgba(255,255,255,0.2); padding-left: 0.8em; }');
      // Quality badge in details
      rules.push('.cinema-quality-badge, .cinema-time-badge, .cinema-genre-badge {' +
        '  display: inline-flex; align-items: center; gap: 0.3em;' +
        '  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);' +
        '  border-radius: 0.5em; padding: 0.15em 0.5em; font-weight: 600;' +
        '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
        '  font-size: 0.85em; letter-spacing: 0.03em; color: #fff; }');
      rules.push('.cinema-time-badge svg, .cinema-genre-badge svg { width: 0.9em; height: 0.9em; opacity: 0.7; }');
      // Details (date/country) below title with gentle spacing
      rules.push('.full-start-new__head,' +
        ' .full-start-new__tagline,' +
        ' .full-start-new__details,' +
        ' .full-start-new__rate-line {' +
        '  margin-top: 0.45em !important; margin-bottom: 0 !important; }');
      // Make head and tagline same font size
      rules.push('.full-start-new__head, .full-start-new__tagline { font-size: 1em !important; }');
      // Make details and rate-line same font size
      rules.push('.full-start-new__details, .full-start-new__rate-line { font-size: 0.95em !important; }');
      // Ensure TMDB rate badge matches PG/status size
      rules.push('.full-start__rate.rate--tmdb { font-size: 0.9em !important; }');
      // TV mode
      if (tvMode === 'on') {
        btn = {
          d: '4.05em',
          dPad: '1.2em',
          dFont: '1.02em',
          m: '3.9em',
          mPad: '1.08em',
          mFont: '0.98em'
        };
        rules.push('.full-start-new__logo img { max-height: 22em !important; }');
        rules.push('.full-start-new__title { font-size: 4em !important; }');
      }
      // Background dimming
      if (bgDim !== 'none') {
        var dimMap = { low: 0.88, medium: 0.74, high: 0.6 };
        var brightness = dimMap[bgDim] || 0.88;
        rules.push('.full-start__background, .full-start__background.loaded {' +
          '  filter: brightness(' + brightness + ') !important;' +
          '}');
      }
      // Buttons size presets
      rules.push('.full-start-new {' +
        '  --lampac-btn-size: ' + btn.d + '; --lampac-btn-pad: ' + btn.dPad + '; --lampac-btn-font: ' + btn.dFont + ';' +
        '  --lampac-btn-size-mobile: ' + btn.m + '; --lampac-btn-pad-mobile: ' + btn.mPad + '; --lampac-btn-font-mobile: ' + btn.mFont + ';' +
        '}');
      rules.push('.full-start-new__buttons .full-start__button {' +
        '  min-width: var(--lampac-btn-size, 3.2em) !important;' +
        '  height: var(--lampac-btn-size, 3.2em) !important;' +
        '  padding: 0 var(--lampac-btn-pad, 0.9em) !important;' +
        '}');
      rules.push('.full-start-new__buttons .full-start__button > span { font-size: var(--lampac-btn-font, 0.85em) !important; }');

      // Mobile layout
      if (mobileMode === 'bottom') {
        rules.push('@media (max-width: 600px) {' +
          '  .full-start-new { min-height: 100vh !important; }' +
          '  .full-start-new::before, .full-start-new::after { display: none !important; }' +
          '  .full-start__background, .full-start__background.loaded {' +
          '    opacity: 0.9 !important; filter: none !important; display: block !important;' +
          '    position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 0 !important;' +
          '  }' +
          '  .full-start-new__body {' +
          '    min-height: 100vh !important; align-items: stretch !important;' +
          '    padding: 0 !important; position: relative !important; z-index: 2 !important;' +
          '    background: transparent !important;' +
          '  }' +
          '  .full-start-new__left { display: none !important; }' +
          '  .full-start-new__right {' +
          '    width: 100% !important; max-width: none !important; min-height: 100vh !important;' +
          '    padding: 0.7em 1.1em 0.5em 1.1em !important; box-sizing: border-box !important;' +
          '    display: flex !important; flex-direction: column !important; justify-content: flex-end !important;' +
          '    position: relative !important;' +
          '  }' +
          '  .full-start-new__right > * { position: relative !important; z-index: 1 !important; }' +
          '  .full-start-new__title { font-size: 2.1em !important; line-height: 1.05 !important; margin-top: 0 !important; }' +
          '  .full-start-new__head,' +
          '  .full-start-new__tagline,' +
          '  .full-start-new__details,' +
          '  .full-start-new__rate-line {' +
          '    margin-top: 0.35em !important; }' +
          '  .full-start-new__rate-line { gap: 0.4em !important; }' +
          '  .full-start-new__buttons {' +
          '    display: flex !important; flex-wrap: nowrap !important; gap: 0.5em !important;' +
          '    overflow-x: auto !important; -webkit-overflow-scrolling: touch !important;' +
          '    padding: 0 !important; margin: 0.35em 0 0 0 !important; min-height: 0 !important; height: auto !important;' +
          '    align-items: center !important;' +
          '  }' +
          '  .full-start-new__buttons .full-start__button {' +
          '    flex: 0 0 auto !important; min-width: var(--lampac-btn-size-mobile, 3.15em) !important; height: var(--lampac-btn-size-mobile, 3.15em) !important;' +
          '    border-radius: 0.9em !important; padding: 0 var(--lampac-btn-pad-mobile, 0.85em) !important;' +
          '  }' +
          '  .full-descr { display: block !important; }' +
          '  .cinema-descr { display: none !important; }' +
          '}');
      } else {
        rules.push('@media (max-width: 600px) {' +
          '  .full-start-new {' +
            '    min-height: auto !important; height: auto !important;' +
            '    background: #000 !important;' +
          '  }' +
          '  .full-start, .scroll__body, .scroll__content { background: #000 !important; }' +
          '  .head__body { background: rgba(14,16,22,0.9) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; }' +
          '  .full-start-new::before, .full-start-new::after { display: none !important; }' +
          '  .full-start-new__left, .full-start__poster, .full-start__img, .full-start-new__img { display: none !important; }' +
          '  .full-start__background, .full-start__background.loaded, img.full-start__background { display: none !important; }' +
          '  .full-start-new__body {' +
            '    min-height: auto !important; height: auto !important; padding: 0 !important; position: relative !important;' +
            '    display: flex !important; flex-direction: column !important; background: #000 !important;' +
          '  }' +
          '  .full-start-new__body::after {' +
            '    content: ""; position: absolute; left: 0; right: 0; top: 50%; bottom: 0; pointer-events: none; z-index: 1;' +
          '    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.62) 30%, rgba(0,0,0,.95) 100%);' +
            '    backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;' +
          '  }' +
          '  .lampac-mobile-poster-card {' +
            '    width: calc(100% - 1.2em) !important; margin: 0.35em 0.6em 0 !important;' +
            '    aspect-ratio: 2 / 3 !important; border-radius: 1.35em !important; overflow: hidden !important;' +
            '    position: relative !important; box-shadow: 0 16px 40px rgba(0,0,0,.38) !important;' +
            '    background: rgba(255,255,255,.03) !important; flex: 0 0 auto !important;' +
            '    z-index: 2 !important;' +
          '  }' +
          '  .lampac-mobile-poster-card img {' +
            '    width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;' +
            '    -webkit-mask-image: -webkit-linear-gradient(top, #fff 40%, rgba(255,255,255,0) 100%);' +
            '    -webkit-mask-image: linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0) 100%);' +
            '    mask-image: linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0) 100%);' +
          '  }' +
          '  .lampac-mobile-poster-card::before {' +
          '    content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 46%; pointer-events: none;' +
          '    background: linear-gradient(to top, rgba(0,0,0,.94) 0%, rgba(0,0,0,.52) 58%, rgba(0,0,0,0) 100%);' +
          '    filter: blur(14px); z-index: 1;' +
          '  }' +
          '  .lampac-mobile-poster-card::after {' +
            '    content: ""; position: absolute; inset: 0; pointer-events: none;' +
          '    background: linear-gradient(to bottom, rgba(7,10,12,0) 34%, rgba(7,10,12,.42) 62%, rgba(7,10,12,.9) 100%);' +
          '    box-shadow: inset 0 -45px 60px rgba(0,0,0,.55); z-index: 2;' +
          '  }' +
          '  .full-start-new__right {' +
            '    width: 100% !important; max-width: none !important; box-sizing: border-box !important;' +
            '    display: flex !important; flex-direction: column !important; justify-content: flex-start !important;' +
            '    row-gap: 0.22em !important; align-items: center !important; text-align: center !important;' +
            '    width: calc(100% - 1.2em) !important; margin: -27vh 0.6em 0 !important;' +
            '    padding: 0.65em 0.82em 0.72em 0.82em !important;' +
            '    border-radius: 1em !important;' +
            '    background: linear-gradient(to bottom, rgba(0,0,0,.52), rgba(0,0,0,.78)) !important;' +
            '    backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important;' +
            '    z-index: 3 !important;' +
          '  }' +
          '  .full-start-new__right.lampac-mobile-right-on-poster {' +
            '    position: relative !important; left: auto !important; right: auto !important; bottom: auto !important;' +
            '    width: calc(100% - 1.2em) !important; padding: 0.85em 0.9em 0.85em 0.9em !important;' +
            '    border-radius: 1em !important;' +
            '    background: linear-gradient(to bottom, rgba(0,0,0,.52), rgba(0,0,0,.78)) !important;' +
            '    z-index: 3 !important;' +
          '  }' +
          '  .full-start-new__right .full-start-new__logo { margin: 0 auto 0.12em auto !important; min-height: 0 !important; }' +
          '  .full-start-new__right .full-start-new__logo img { max-height: 7.2em !important; }' +
          '  .full-start-new__right .full-start-new__title { margin: 0 auto 0.12em auto !important; }' +
          '  .full-start-new__right .full-start-new__buttons { justify-content: center !important; }' +
          '  .full-start-new__title { font-size: 2.1em !important; line-height: 1.06 !important; margin: 0 !important; }' +
          '  .full-start-new__head, .full-start-new__tagline, .full-start-new__details, .full-start-new__rate-line {' +
            '    margin-top: 0 !important; margin-bottom: 0 !important; line-height: 1.25 !important; }' +
          '  .full-start-new__buttons {' +
            '    display: flex !important; flex-wrap: nowrap !important; gap: 0.5em !important;' +
            '    overflow-x: auto !important; -webkit-overflow-scrolling: touch !important;' +
            '    padding: 0 !important; margin: 0.2em 0 0.12em 0 !important; min-height: 0 !important; height: auto !important;' +
          '  }' +
          '  .full-start-new__buttons .full-start__button {' +
          '    flex: 0 0 auto !important; min-width: var(--lampac-btn-size-mobile, 3.15em) !important; height: var(--lampac-btn-size-mobile, 3.15em) !important;' +
          '    border-radius: 0.88em !important; padding: 0 var(--lampac-btn-pad-mobile, 0.85em) !important;' +
          '  }' +
          '  .full-descr { display: block !important; margin-top: -0.55em !important; padding-top: 0 !important; max-width: 100% !important; }' +
          '  .full-descr, .items-line { position: relative !important; z-index: 2 !important; }' +
          '  .cinema-descr { display: none !important; }' +
          '  .scroll__body > .items-line.layer--visible.layer--render:first-of-type {' +
          '    margin-top: -0.15em !important;' +
          '  }' +
          '  .scroll__body > .items-line.layer--visible.layer--render:first-of-type .items-line__head {' +
          '    margin-top: 0 !important; margin-bottom: 0.25em !important;' +
          '  }' +
          '}');
      }
      if (mobileButtonsView === 'grid') {
        rules.push('@media (max-width: 600px) {' +
          '  .full-start-new__buttons {' +
          '    display: grid !important; grid-template-columns: repeat(4, minmax(0, 1fr)) !important;' +
          '    gap: 0.45em !important; overflow: visible !important;' +
          '  }' +
          '  .full-start-new__buttons .full-start__button {' +
          '    width: 100% !important; min-width: 0 !important;' +
          '  }' +
          '}');
      }
      if (autoContrast === 'on') {
        rules.push('.full-start-new.lampac-contrast-strong .full-start-new__title,' +
          '.full-start-new.lampac-contrast-strong .full-start-new__head,' +
          '.full-start-new.lampac-contrast-strong .full-start-new__tagline,' +
          '.full-start-new.lampac-contrast-strong .full-start-new__details {' +
          '  text-shadow: 0 2px 14px rgba(0,0,0,.9) !important;' +
          '}');
      }
      rules.push('.full-start-new__buttons { margin-top: 0.45em !important; }');

      if (rules.length) {
        var style = document.createElement('style');
        style.id = SCREEN_STYLE_ID;
        style.type = 'text/css';
        style.textContent = rules.join('\n');
        document.head.appendChild(style);
      }

      if (mobileMode !== 'poster') {
        restoreMobileInfoBlock();
        cleanupMobilePosterCard();
      }
    }

    // ─── Screen settings component ─────────────────────
    var SCREEN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-5-7l-7 4V6l7 4z"/></svg>';

    Lampa.SettingsApi.addComponent({
      component: 'theme_screen',
      icon: SCREEN_ICON,
      name: 'Экран фильма',
    });

    // Templates for nested settings sections
    if (window.Lampa && Lampa.Template && Lampa.Template.add) {
      Lampa.Template.add('settings_theme_screen_layout', '<div></div>');
      Lampa.Template.add('settings_theme_screen_compact', '<div></div>');
      Lampa.Template.add('settings_theme_screen_buttons', '<div></div>');
      Lampa.Template.add('settings_theme_screen_logo', '<div></div>');
      Lampa.Template.add('settings_theme_screen_visual', '<div></div>');
      Lampa.Template.add('settings_theme_screen_profiles', '<div></div>');
    }

    function openScreenSection(name) {
      if (!name || !window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
      setTimeout(function () {
        Lampa.Settings.create(name, {
          onBack: function () {
            Lampa.Settings.create('theme_screen');
          }
        });
      }, 0);
    }

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { type: 'title' },
      field: { name: 'Разделы настроек' },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { name: 'lampac_open_screen_layout', type: 'button' },
      field: { name: 'Расположение', description: 'Режим экрана, мобильный режим, анимация' },
      onChange: function () { openScreenSection('theme_screen_layout'); },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { name: 'lampac_open_screen_compact', type: 'button' },
      field: { name: 'Компактность', description: 'Компактный режим, метаданные, слоган, описание' },
      onChange: function () { openScreenSection('theme_screen_compact'); },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { name: 'lampac_open_screen_buttons', type: 'button' },
      field: { name: 'Кнопки', description: 'Размер, скрытие, порядок, мобильный вид' },
      onChange: function () { openScreenSection('theme_screen_buttons'); },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { name: 'lampac_open_screen_logo', type: 'button' },
      field: { name: 'Логотип', description: 'Лого вместо названия, размер, US fallback' },
      onChange: function () { openScreenSection('theme_screen_logo'); },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { name: 'lampac_open_screen_visual', type: 'button' },
      field: { name: 'Визуал', description: 'Оверлей, контраст, рейтинги, реакции, затемнение' },
      onChange: function () { openScreenSection('theme_screen_visual'); },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen',
      param: { name: 'lampac_open_screen_profiles', type: 'button' },
      field: { name: 'Профили', description: 'Раздельные профили mobile/desktop/tv' },
      onChange: function () { openScreenSection('theme_screen_profiles'); },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_layout',
      param: {
        name: 'lampac_screen_layout',
        type: 'select',
        values: { 'default': 'Стандартный', cinematic: 'Кинематограф' },
        default: 'default',
      },
      field: {
        name: 'Режим экрана',
        description: 'Кинематограф — полноэкранный фон, без постера, контент внизу',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_layout',
      param: {
        name: 'lampac_screen_mobile_layout',
        type: 'select',
        values: { poster: 'Постер + инфо', bottom: 'Кинематограф (низ)' },
        default: 'poster',
      },
      field: {
        name: 'Мобильный режим',
        description: 'Постер + инфо: аккуратный вертикальный постер. Кинематограф: контент поверх фона внизу.',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_layout',
      param: {
        name: 'lampac_screen_anim',
        type: 'select',
        values: { cascade: 'Каскад', fade: 'Плавное', none: 'Без анимации' },
        default: 'cascade',
      },
      field: {
        name: 'Анимация появления',
        description: 'Стиль анимации элементов на странице фильма',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_compact',
      param: {
        name: 'lampac_screen_compact_mode',
        type: 'select',
        values: { normal: 'Обычный', compact: 'Компактный' },
        default: 'normal',
      },
      field: {
        name: 'Компактный экран фильма',
        description: 'Скрывает лишний текст и делает экран чище',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_compact',
      param: {
        name: 'lampac_screen_compact_meta',
        type: 'select',
        values: { off: 'Выключить', on: 'Включить' },
        default: 'off',
      },
      field: {
        name: 'Компактная строка метаданных',
        description: 'Собирает год, жанр, длительность и качество в одну строку',
      },
      onChange: function () {
        applyScreenStyle();
        setTimeout(renderCompactMetaLine, 0);
      },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_compact',
      param: {
        name: 'lampac_screen_tagline',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Слоган', description: 'Фраза-слоган под названием' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_compact',
      param: {
        name: 'lampac_screen_descr',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Описание', description: 'Блок с описанием под экраном' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_buttons',
      param: {
        name: 'lampac_screen_button_size',
        type: 'select',
        values: { compact: 'Компактные', normal: 'Обычные', large: 'Крупные', xl: 'Очень крупные' },
        default: 'normal',
      },
      field: {
        name: 'Размер кнопок',
        description: 'Размер кнопок действий на экране фильма (отдельно адаптирован для mobile)',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_buttons',
      param: {
        name: 'lampac_screen_hide_extra_buttons',
        type: 'select',
        values: { off: 'Выключить', on: 'Включить' },
        default: 'off',
      },
      field: {
        name: 'Скрыть лишние кнопки',
        description: 'Убирает реакцию, трейлер и лишние сервисные кнопки',
      },
      onChange: function () {
        applyScreenStyle();
        setTimeout(function () { promoteFolderButtons(true); }, 0);
      },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_buttons',
      param: {
        name: 'lampac_screen_smart_order',
        type: 'select',
        values: { on: 'Включить', off: 'Выключить' },
        default: 'on',
      },
      field: {
        name: 'Умный порядок кнопок',
        description: 'Онлайн → Торрент → Трейлер → Избранное',
      },
      onChange: function () {
        applyScreenStyle();
        setTimeout(function () { promoteFolderButtons(true); }, 0);
      },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_buttons',
      param: {
        name: 'lampac_screen_button_order',
        type: 'select',
        values: {
          'online,torrent,trailer,book': 'Онлайн → Торрент → Трейлер → Избранное',
          'online,torrent,book,trailer': 'Онлайн → Торрент → Избранное → Трейлер',
          'torrent,online,trailer,book': 'Торрент → Онлайн → Трейлер → Избранное',
          'book,online,torrent,trailer': 'Избранное → Онлайн → Торрент → Трейлер'
        },
        default: 'online,torrent,trailer,book',
      },
      field: {
        name: 'Порядок кнопок',
        description: 'Приоритет кнопок на экране фильма',
      },
      onChange: function () {
        applyScreenStyle();
        setTimeout(function () { promoteFolderButtons(true); }, 0);
      },
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_buttons',
      param: {
        name: 'lampac_screen_mobile_buttons_view',
        type: 'select',
        values: { row: 'Ряд', grid: 'Сетка 2x2' },
        default: 'row',
      },
      field: {
        name: 'Мобильные кнопки',
        description: 'Режим отображения: горизонтальный ряд или сетка',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_overlay_opacity',
        type: 'select',
        values: { '55': '55%', '65': '65%', '75': '75%', '88': '88%', '96': '96%' },
        default: '88',
      },
      field: {
        name: 'Прозрачность оверлея',
        description: 'Нижняя черная панель на постере в мобильной версии',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_auto_contrast',
        type: 'select',
        values: { on: 'Включить', off: 'Выключить' },
        default: 'on',
      },
      field: {
        name: 'Автоконтраст текста',
        description: 'Усиливает читаемость текста на светлых постерах',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_rating_style',
        type: 'select',
        values: { 'default': 'Стандартный', colored: 'Цветной', logo: 'Лого' },
        default: 'logo',
      },
      field: {
        name: 'Стиль рейтингов',
        description: 'Внешний вид IMDB, TMDB, Кинопоиск',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_ratings',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Рейтинги', description: 'Блок с оценками IMDB, TMDB, КП' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_reactions',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Реакции', description: 'Огонь, лайки, эмоции' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_logo',
      param: {
        name: 'lampac_screen_title_logo',
        type: 'select',
        values: { show: 'Показывать', hide: 'Скрыть' },
        default: 'show',
      },
      field: { name: 'Логотип вместо названия', description: 'Если есть логотип — показывать вместо текста' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_logo',
      param: {
        name: 'lampac_screen_logo_size',
        type: 'select',
        values: { xs: 'Очень маленький', small: 'Маленький', medium: 'Средний', large: 'Большой', xl: 'Очень большой' },
        default: 'medium',
      },
      field: { name: 'Размер логотипа', description: 'Размер логотипа на экране фильма' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_logo',
      param: {
        name: 'lampac_screen_logo_us',
        type: 'select',
        values: { show: 'Разрешить', hide: 'Только RU' },
        default: 'show',
      },
      field: { name: 'US логотип', description: 'Если RU нет — использовать US/EN' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_tv_mode',
        type: 'select',
        values: { off: 'Выключен', on: 'Включен' },
        default: 'off',
      },
      field: { name: 'TV режим', description: 'Крупнее логотип, кнопки и отступы для телевизора' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_visual',
      param: {
        name: 'lampac_screen_bg_dim',
        type: 'select',
        values: { none: 'Без затемнения', low: 'Легкое', medium: 'Среднее', high: 'Сильное' },
        default: 'none',
      },
      field: { name: 'Затемнение фона', description: 'Уменьшает яркость фонового постера/кадра' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_profiles',
      param: {
        name: 'lampac_screen_device_profiles',
        type: 'select',
        values: { off: 'Выключить', on: 'Включить' },
        default: 'off',
      },
      field: {
        name: 'Раздельные профили устройств',
        description: 'Использовать отдельные профили для mobile/desktop/tv',
      },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_profiles',
      param: {
        name: 'lampac_screen_profile_mobile',
        type: 'select',
        values: { normal: 'Обычный', compact: 'Компактный', cinema: 'Кинематограф', kids: 'Детский' },
        default: 'normal',
      },
      field: { name: 'Профиль Mobile', description: 'Используется при включенных профилях устройств' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_profiles',
      param: {
        name: 'lampac_screen_profile_desktop',
        type: 'select',
        values: { normal: 'Обычный', compact: 'Компактный', cinema: 'Кинематограф', kids: 'Детский' },
        default: 'normal',
      },
      field: { name: 'Профиль Desktop', description: 'Используется при включенных профилях устройств' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_screen_profiles',
      param: {
        name: 'lampac_screen_profile_tv',
        type: 'select',
        values: { normal: 'Обычный', compact: 'Компактный', cinema: 'Кинематограф', kids: 'Детский' },
        default: 'cinema',
      },
      field: { name: 'Профиль TV', description: 'Используется при включенных профилях устройств' },
      onChange: applyScreenStyle,
    });

    Lampa.SettingsApi.addComponent({
      component: 'theme_tools',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.7 6.3l3 3-7.4 7.4H7.3v-3l7.4-7.4zm3.9-.9l-1.6-1.6a1 1 0 00-1.4 0l-1.3 1.3 3 3 1.3-1.3a1 1 0 000-1.4zM3 20h18v2H3z"/></svg>',
      name: 'Инструменты темы',
    });

    Lampa.SettingsApi.addParam({
      component: 'theme_tools',
      param: {
        name: 'lampac_tools_action',
        type: 'select',
        values: { none: 'Выбрать действие', export: 'Экспорт настроек', import: 'Импорт настроек', diagnostics: 'Диагностика' },
        default: 'none',
      },
      field: {
        name: 'Действие',
        description: 'Экспорт/импорт JSON и диагностика активных параметров',
      },
      onChange: handleToolsAction,
    });

    // ─── Move description into cinematic area ───────────
    function isCinematic() {
      var theme = Lampa.Storage.get(STORAGE_KEY, 'classic');
      var layout = Lampa.Storage.get('lampac_screen_layout', 'default');
      return theme === 'appletv' || layout === 'cinematic';
    }

    function moveDescrIntoCinema() {
      if (!isCinematic()) return;
      if (window.innerWidth <= 600) return;
      setTimeout(function () {
        var descrText = document.querySelector('.full-descr__text');
        var right = document.querySelector('.full-start-new__right');
        var buttons = document.querySelector('.full-start-new__buttons');
        if (!right || !buttons) return;
        // Check if already moved
        if (right.querySelector('.cinema-descr')) return;

        // Move description text
        if (descrText && descrText.textContent.trim()) {
          var clone = document.createElement('div');
          clone.className = 'cinema-descr';
          var txt = descrText.textContent.trim();
          if (txt.length > 300) txt = txt.substring(0, 300).replace(/\s+\S*$/, '') + '...';
          clone.textContent = txt;
          buttons.parentNode.insertBefore(clone, buttons);
        }

        // Style details badges (time, genre, quality)
        var details = document.querySelector('.full-start-new__details');
        if (details && !details.querySelector('.cinema-time-badge')) {
          var spans = details.querySelectorAll('span');
          var clockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
          var genreSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>';
          for (var i = 0; i < spans.length; i++) {
            var sp = spans[i];
            if (sp.className === 'full-start-new__split') continue;
            var txt = sp.textContent.trim();
            // Time (e.g. 01:47, 2:15)
            if (txt.match(/^\d{1,2}:\d{2}$/)) {
              var tb = document.createElement('span');
              tb.className = 'cinema-time-badge';
              tb.innerHTML = clockSvg + ' ' + txt;
              sp.textContent = '';
              sp.appendChild(tb);
            }
            // Genre (contains |)
            else if (txt.indexOf('|') !== -1) {
              var gb = document.createElement('span');
              gb.className = 'cinema-genre-badge';
              gb.innerHTML = genreSvg + ' ' + txt;
              sp.textContent = '';
              sp.appendChild(gb);
            }
            // Quality
            else if (txt.indexOf('Качество') !== -1 || txt.match(/^(4K|WEBDL|WEB-DL|HDRip|BDRip|CAMRip|TS|HD|BD)$/i)) {
              var text = txt.replace('Качество: ', '');
              var qb = document.createElement('span');
              qb.className = 'cinema-quality-badge';
              qb.textContent = text;
              sp.textContent = '';
              sp.appendChild(qb);
            }
          }
        }
      }, 900);
    }

    function placeDetailsAfterTagline() {
      var root = document.querySelector('.full-start-new');
      if (!root) return;
      var title = root.querySelector('.full-start-new__title');
      var tagline = root.querySelector('.full-start-new__tagline');
      var head = root.querySelector('.full-start-new__head');
      var details = root.querySelector('.full-start-new__details');
      if (!title || !details) return;
      var anchor = (tagline && tagline.parentNode === title.parentNode) ? tagline : title;
      if (!anchor || !anchor.parentNode) return;
      // Move head (year/country) under tagline/title
      if (head && head.parentNode === anchor.parentNode) {
        anchor.parentNode.insertBefore(head, anchor.nextSibling);
        anchor = head;
      }
      if (details.previousElementSibling === anchor) return;
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(details, anchor.nextSibling);
      }
    }

    function renderCompactMetaLine() {
      var root = document.querySelector('.full-start-new');
      if (!root) return;
      var right = root.querySelector('.full-start-new__right');
      if (!right) return;
      var head = right.querySelector('.full-start-new__head');
      var details = right.querySelector('.full-start-new__details');
      if (!head || !details) return;

      var enabled = Lampa.Storage.get('lampac_screen_compact_meta', 'off') === 'on';
      var oldLine = right.querySelector('.lampac-meta-line');

      if (!enabled) {
        if (oldLine && oldLine.parentNode) oldLine.parentNode.removeChild(oldLine);
        head.style.display = '';
        details.style.display = '';
        return;
      }

      var line = oldLine || document.createElement('div');
      line.className = 'lampac-meta-line';
      var headText = (head.textContent || '').replace(/\s+/g, ' ').trim();
      var detailsText = (details.textContent || '').replace(/\s+/g, ' ').trim();
      var joined = [headText, detailsText].filter(Boolean).join('  •  ');
      if (!joined) return;
      line.textContent = joined;

      if (!oldLine) {
        var anchor = right.querySelector('.full-start-new__tagline') || right.querySelector('.full-start-new__title') || head;
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(line, anchor.nextSibling);
      }

      head.style.display = 'none';
      details.style.display = 'none';
    }

    function applyTitleLogo() {
      if (Lampa.Storage.get('lampac_screen_title_logo', 'show') !== 'show') return;
      var logoAllowUS = Lampa.Storage.get('lampac_screen_logo_us', 'show');
      var activity = Lampa.Activity.active();
      var card = activity && activity.card;
      if (!card) return;

      var root = document.querySelector('.full-start-new');
      if (!root) return;

      var title = root.querySelector('.full-start-new__title');
      if (!title) return;

      var logoContainer = root.querySelector('.full-start-new__logo');
      if (!logoContainer) {
        logoContainer = document.createElement('div');
        logoContainer.className = 'full-start-new__logo';
      }
      if (title.parentNode && logoContainer.parentNode !== title.parentNode) {
        title.parentNode.insertBefore(logoContainer, title);
      }

      var cardId = String(card.id || '');
      if (logoContainer.getAttribute('data-card') === cardId && logoContainer.classList.contains('loaded')) return;

      function clearLogo() {
        logoContainer.setAttribute('data-card', cardId);
        logoContainer.classList.remove('loaded');
        logoContainer.innerHTML = '';
        title.style.display = '';
      }

      function setLogo(url) {
        logoContainer.setAttribute('data-card', cardId);
        logoContainer.innerHTML = '<img src="' + url + '" class="loaded" />';
        logoContainer.classList.add('loaded');
        title.style.display = 'none';
      }

      var logos = card.images && card.images.logos;
      if (logos && logos.length) {
        var logo = logos.filter(function (l) { return l.iso_639_1 === 'ru'; })[0];
        if (!logo && logoAllowUS === 'show') {
          logo = logos.filter(function (l) { return l.iso_639_1 === 'en'; })[0] ||
            logos.filter(function (l) { return l.iso_639_1 === null; })[0] ||
            logos[0];
        }
        if (logo) {
          setLogo(Lampa.TMDB.image('original' + logo.file_path));
          return;
        }
      }

      if (!Lampa.TMDB || !Lampa.TMDB.api) return clearLogo();

      var type = card.name ? 'tv' : 'movie';
      var language = Lampa.Storage.get('language') || 'ru';
      function pickLogo(logosList) {
        if (!logosList || !logosList.length) return null;
        var ruLogo = logosList.filter(function (l) { return l.iso_639_1 === 'ru'; })[0];
        if (ruLogo) return ruLogo;
        if (logoAllowUS === 'show') {
          return logosList.filter(function (l) { return l.iso_639_1 === 'en'; })[0] ||
            logosList.filter(function (l) { return l.iso_639_1 === null; })[0] ||
            logosList[0];
        }
        return null;
      }

      // Prefer s_s-style logic: build url and fetch via $.get for logos
      try {
        var includeLang = logoAllowUS === 'show'
          ? ('ru,en,null')
          : ('ru,null');
        var url = Lampa.TMDB.api(type + '/' + card.id + '/images?api_key=' + Lampa.TMDB.key() + '&include_image_language=' + includeLang);
        if (window.$ && url) {
          $.get(url, function (resp) {
            var picked = pickLogo(resp && resp.logos ? resp.logos : []);
            if (picked && picked.file_path) {
              var logoPath = picked.file_path;
              var imgUrl = Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png'));
              setLogo(imgUrl);
            } else {
              clearLogo();
            }
          });
          return;
        }
      } catch (e) {}

      // Fallback: standard TMDB API
      var includeLang2 = logoAllowUS === 'show'
        ? ('ru,en,null')
        : ('ru,null');
      Lampa.TMDB.api(
        type + '/' + card.id + '/images?api_key=' + Lampa.TMDB.key() + '&include_image_language=' + includeLang2,
        function (resp) {
          var picked2 = pickLogo(resp && resp.logos ? resp.logos : []);
          if (!picked2 || !picked2.file_path) return clearLogo();
          setLogo(Lampa.TMDB.image('original' + picked2.file_path));
        }
      );
    }

    function applyTitleLogoRetry() {
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        applyTitleLogo();
        if (tries >= 10) clearInterval(timer);
      }, 300);
    }

    function cleanupMobilePosterCard() {
      var cardEl = document.querySelector('.lampac-mobile-poster-card');
      if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
    }

    function restoreMobileInfoBlock() {
      var anchor = document.querySelector('.lampac-mobile-right-anchor');
      var right = document.querySelector('.full-start-new__right');
      if (anchor && right && right.parentNode !== anchor.parentNode) {
        anchor.parentNode.insertBefore(right, anchor.nextSibling);
      }
      if (right) right.classList.remove('lampac-mobile-right-on-poster');
    }

    function buildMobilePosterCandidates(card, root) {
      var urls = [];
      var path = card && (card.poster_path || card.backdrop_path);
      var tmdb = window.Lampa && Lampa.TMDB && Lampa.TMDB.image;

      function pushUnique(url) {
        if (!url) return;
        if (urls.indexOf(url) === -1) urls.push(url);
      }

      function normalizePath(p) {
        if (!p) return '';
        if (/^https?:\/\//i.test(p)) return p;
        return p.charAt(0) === '/' ? p : ('/' + p);
      }

      var norm = normalizePath(path);
      if (/^https?:\/\//i.test(norm)) {
        pushUnique(norm);
      } else if (norm && tmdb) {
        // Different builds use different formats in Lampa.TMDB.image.
        pushUnique(Lampa.TMDB.image('w780' + norm));
        pushUnique(Lampa.TMDB.image('/t/p/w780' + norm));
        pushUnique(Lampa.TMDB.image('original' + norm));
        pushUnique(Lampa.TMDB.image('/t/p/original' + norm));
      }

      var domImg = root && (root.querySelector('img.full-start__background') || root.querySelector('.full-start-new__img') || root.querySelector('.full-start__img'));
      if (domImg && domImg.src) pushUnique(domImg.src);

      return urls;
    }

    function loadPosterWithFallback(img, urls, onFail) {
      if (!img || !urls || !urls.length) {
        if (onFail) onFail();
        return;
      }
      var index = 0;
      img.onerror = function () {
        index++;
        if (index >= urls.length) {
          img.onerror = null;
          if (onFail) onFail();
          return;
        }
        img.src = urls[index];
      };
      img.src = urls[index];
    }

    function renderMobilePosterCard() {
      if (window.innerWidth > 600) return;
      if (Lampa.Storage.get('lampac_screen_mobile_layout', 'poster') !== 'poster') {
        restoreMobileInfoBlock();
        cleanupMobilePosterCard();
        return;
      }

      var root = document.querySelector('.full-start-new');
      var body = root && root.querySelector('.full-start-new__body');
      var right = root && root.querySelector('.full-start-new__right');
      if (!root || !body || !right) return;

      var anchor = body.querySelector('.lampac-mobile-right-anchor');
      if (!anchor) {
        anchor = document.createElement('div');
        anchor.className = 'lampac-mobile-right-anchor';
        body.insertBefore(anchor, right);
      }

      var activity = Lampa.Activity.active();
      var card = activity && activity.card;
      var candidates = buildMobilePosterCandidates(card, root);
      if (!candidates.length) return;

      var posterCard = body.querySelector('.lampac-mobile-poster-card');
      if (!posterCard) {
        posterCard = document.createElement('div');
        posterCard.className = 'lampac-mobile-poster-card';
        posterCard.innerHTML = '<img alt="" />';
        body.insertBefore(posterCard, anchor.nextSibling);
      }

      if (right.parentNode !== body) body.appendChild(right);
      if (posterCard.nextSibling !== right) body.insertBefore(right, posterCard.nextSibling);
      right.classList.remove('lampac-mobile-right-on-poster');

      var img = posterCard.querySelector('img');
      if (!img) return;

      if (img.getAttribute('data-card') === String(card && card.id || '') && img.getAttribute('data-ok') === '1') return;
      img.setAttribute('data-card', String(card && card.id || ''));
      img.setAttribute('data-ok', '0');

      img.onload = function () {
        img.setAttribute('data-ok', '1');
        posterCard.style.display = '';
        applyAutoContrast();
      };
      loadPosterWithFallback(img, candidates, function () {
        restoreMobileInfoBlock();
        posterCard.style.display = 'none';
      });
    }

    function applyAutoContrast() {
      if (Lampa.Storage.get('lampac_screen_auto_contrast', 'on') !== 'on') return;
      var root = document.querySelector('.full-start-new');
      if (!root) return;
      var img = root.querySelector('.lampac-mobile-poster-card img') || root.querySelector('img.full-start__background');
      if (!img || !img.complete) return;

      try {
        var c = document.createElement('canvas');
        c.width = 12;
        c.height = 12;
        var x = c.getContext('2d');
        x.drawImage(img, 0, 0, 12, 12);
        var data = x.getImageData(0, 0, 12, 12).data;
        var sum = 0;
        for (var i = 0; i < data.length; i += 4) {
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        var avg = sum / (data.length / 4);
        if (avg > 150) root.classList.add('lampac-contrast-strong');
        else root.classList.remove('lampac-contrast-strong');
      } catch (e) {
        root.classList.add('lampac-contrast-strong');
      }
    }

    function hideEmptyBlocks() {
      var details = document.querySelector('.full-start-new__details');
      if (details) {
        var spans = details.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
          var txt = (spans[i].textContent || '').replace(/\s+/g, ' ').trim();
          if (!txt || txt === '•' || txt === '|') spans[i].style.display = 'none';
        }
      }

      var lines = document.querySelectorAll('.items-line.layer--visible.layer--render');
      for (var j = 0; j < lines.length; j++) {
        var body = lines[j].querySelector('.items-line__body');
        if (!body) continue;
        var hasContent = body.children && body.children.length > 0;
        var txtBody = (body.textContent || '').replace(/\s+/g, ' ').trim();
        if (!hasContent && !txtBody) lines[j].style.display = 'none';
      }
    }

    function getActiveFullRoot() {
      return document.querySelector('.activity.activity--active .full-start-new') ||
        document.querySelector('.activity--active .full-start-new') ||
        document.querySelector('.full-start-new');
    }

    function atTopOfMovieScreen() {
      var activeScroll = document.querySelector('.activity.activity--active .scroll--mask') ||
        document.querySelector('.activity.activity--active .scroll__mask') ||
        document.querySelector('.activity.activity--active .scroll__body') ||
        document.querySelector('.activity.activity--active .scroll__content') ||
        document.querySelector('.activity--active .scroll--mask') ||
        document.querySelector('.activity--active .scroll__mask') ||
        document.querySelector('.activity--active .scroll__body') ||
        document.querySelector('.activity--active .scroll__content');
      if (activeScroll && typeof activeScroll.scrollTop === 'number') {
        return activeScroll.scrollTop <= 2;
      }
      var docTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      return docTop <= 2;
    }

    function closeMobilePosterFullscreen() {
      var old = document.getElementById('lampac-mobile-poster-fullscreen');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      document.body.classList.remove('lampac-poster-fs-open');
    }

    function openMobilePosterFullscreen() {
      closeMobilePosterFullscreen();
      var root = getActiveFullRoot();
      if (!root) return;
      var img = root.querySelector('.lampac-mobile-poster-card img') || root.querySelector('img.full-start__background') || root.querySelector('.full-start-new__img') || root.querySelector('.full-start__img');
      var src = img && (img.currentSrc || img.src);
      if (!src) return;

      var overlay = document.createElement('div');
      overlay.id = 'lampac-mobile-poster-fullscreen';
      overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:2147483647',
        'background:rgba(0,0,0,.96)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'padding:0',
        'cursor:pointer'
      ].join(';');

      var poster = document.createElement('img');
      poster.src = src;
      poster.alt = '';
      poster.style.cssText = 'max-width:100vw; max-height:100vh; width:auto; height:auto; object-fit:contain; display:block;';
      overlay.appendChild(poster);

      var close = function () { closeMobilePosterFullscreen(); };
      overlay.addEventListener('click', close);
      overlay.addEventListener('touchend', close, { passive: true });
      document.body.appendChild(overlay);
      document.body.classList.add('lampac-poster-fs-open');
    }

    function setupMobilePosterSwipeOpen() {
      if (window.innerWidth > 600) return;
      if (window.__lampac_mobile_swipe_bound) return;

      var startY = 0;
      var startX = 0;
      var tracking = false;

      document.addEventListener('touchstart', function (e) {
        if (window.innerWidth > 600) return;
        if (!e.touches || !e.touches[0]) return;
        if (!atTopOfMovieScreen()) return;

        var root = getActiveFullRoot();
        if (!root) return;
        var target = e.target;
        if (!target) return;
        var inCurrentScreen = target.closest('.full-start-new');
        if (!inCurrentScreen || inCurrentScreen !== root) return;
        var inPoster = target.closest('.lampac-mobile-poster-card') || target.closest('.full-start-new__body');
        if (!inPoster) return;

        tracking = true;
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
      }, { passive: true });

      document.addEventListener('touchmove', function (e) {
        if (!tracking || window.innerWidth > 600) return;
        if (!e.touches || !e.touches[0]) return;
        var dy = e.touches[0].clientY - startY;
        var dx = Math.abs(e.touches[0].clientX - startX);
        if (dy > 70 && dx < 55) {
          tracking = false;
          openMobilePosterFullscreen();
        }
      }, { passive: true });

      document.addEventListener('touchend', function () { tracking = false; }, { passive: true });
      window.__lampac_mobile_swipe_bound = true;
    }

    function promoteFolderButtons(force) {
      var root = document.querySelector('.full-start-new') || document.querySelector('.full-start');
      if (!root) return;
      var hideExtraButtons = Lampa.Storage.get('lampac_screen_hide_extra_buttons', 'off') === 'on';
      var smartOrder = Lampa.Storage.get('lampac_screen_smart_order', 'on') === 'on';

      var buttons = root.querySelector('.full-start-new__buttons') || root.querySelector('.full-start__buttons');
      var container = root.querySelector('.buttons--container');
      if (!buttons || !container) return;
      if (!force && buttons.getAttribute('data-unfolded') === '1') return;

      var extraButtons = container.querySelectorAll('.full-start__button');
      for (var i = 0; i < extraButtons.length; i++) {
        var btn = extraButtons[i];
        btn.classList.remove('hide');
        buttons.appendChild(btn);
      }

      var optionsBtn = buttons.querySelector('.button--options');
      if (hideExtraButtons && optionsBtn && optionsBtn.parentNode) optionsBtn.parentNode.removeChild(optionsBtn);

      var reactionBtn = buttons.querySelector('.button--reaction');
      if (hideExtraButtons && reactionBtn && reactionBtn.parentNode) reactionBtn.parentNode.removeChild(reactionBtn);

      var playBtn = buttons.querySelector('.button--play');
      if (hideExtraButtons && playBtn && playBtn.parentNode) playBtn.parentNode.removeChild(playBtn);

      // Order: online, torrents, trailers, favorites
      var all = Array.prototype.slice.call(buttons.querySelectorAll('.full-start__button, .selector'));

      function findByText(re) {
        for (var i = 0; i < all.length; i++) {
          if (re.test((all[i].textContent || '').trim())) return all[i];
        }
        return null;
      }

      var onlineBtn = buttons.querySelector('.view--online, .lampac--button') || findByText(/(онлайн|online|lampac)/i);
      var torrentBtn = buttons.querySelector('.view--torrent') || findByText(/(торрент|torrent)/i);
      var trailerBtn = buttons.querySelector('.view--trailer') || findByText(/(трейлер|trailer)/i);
      var favBtn = buttons.querySelector('.button--book') || findByText(/(избран|book)/i);

      var map = { online: onlineBtn, torrent: torrentBtn, trailer: trailerBtn, book: favBtn };
      var orderString = Lampa.Storage.get('lampac_screen_button_order', 'online,torrent,trailer,book');
      var orderTokens = orderString.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      var ordered = [];
      for (var t = 0; t < orderTokens.length; t++) {
        var key = orderTokens[t];
        if (key === 'trailer' && hideExtraButtons) continue;
        if (map[key] && ordered.indexOf(map[key]) === -1) ordered.push(map[key]);
      }

      if (smartOrder) {
        // Append in strict order first
        for (var o = 0; o < ordered.length; o++) {
          if (ordered[o].parentNode === buttons) buttons.appendChild(ordered[o]);
        }

        // Then append any remaining buttons (excluding removed ones) preserving their current order
        var remaining = Array.prototype.slice.call(buttons.querySelectorAll('.full-start__button, .selector'));
        for (var r = 0; r < remaining.length; r++) {
          if (ordered.indexOf(remaining[r]) === -1) {
            buttons.appendChild(remaining[r]);
          }
        }
      }

      if (hideExtraButtons && trailerBtn && trailerBtn.parentNode) trailerBtn.parentNode.removeChild(trailerBtn);

      // Focus online button by default
      if (smartOrder && onlineBtn) {
        setTimeout(function () {
          try {
            if (window.Lampa && Lampa.Controller && Lampa.Controller.focus) {
              Lampa.Controller.focus(onlineBtn);
            } else {
              onlineBtn.classList.add('focus');
            }
          } catch (e) {}
        }, 80);
      }

      buttons.setAttribute('data-unfolded', '1');
    }

    // Fix stale quality: hide cam/ts/tc for movies released >60 days ago
    var lowQuality = { 'cam': true, 'camrip': true, 'ts': true, 'tc': true };
    function fixQuality(e) {
      if (e.type !== 'complite') return;
      var activity = Lampa.Activity.active();
      var card = activity && activity.card;
      if (!card) return;
      var rq = (card.release_quality || '').toLowerCase().trim();
      if (!rq || !lowQuality[rq]) return;
      // Check if movie is released and old enough that cam/ts is clearly stale
      var rd = card.release_date || card.first_air_date || '';
      if (!rd || card.status !== 'Released') return;
      var releaseDate = new Date(rd);
      var daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRelease < 60) return;
      // Movie released >60 days ago but still shows cam/ts — remove stale quality
      setTimeout(function () {
        var details = document.querySelector('.full-start-new__details');
        if (!details) return;
        var spans = details.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
          var sp = spans[i];
          if (sp.className === 'full-start-new__split' || sp.className === 'cinema-time-badge' || sp.className === 'cinema-genre-badge') continue;
          var txt = sp.textContent.trim().toLowerCase();
          if (txt === rq || txt === 'качество: ' + rq) {
            // Remove quality span and preceding separator
            var prev = sp.previousElementSibling;
            if (prev && prev.className === 'full-start-new__split') {
              prev.style.display = 'none';
            }
            sp.style.display = 'none';
            break;
          }
        }
        // Also hide tag badge
        var tagQuality = document.querySelector('.tag--quality');
        if (tagQuality) tagQuality.style.display = 'none';
      }, 1200);
    }

    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite') {
        moveDescrIntoCinema();
        setTimeout(function () {
          promoteFolderButtons();
          applyTitleLogoRetry();
          placeDetailsAfterTagline();
          renderCompactMetaLine();
          renderMobilePosterCard();
          hideEmptyBlocks();
          applyAutoContrast();
          setupMobilePosterSwipeOpen();
        }, 400);
        setTimeout(function () {
          renderCompactMetaLine();
          renderMobilePosterCard();
          hideEmptyBlocks();
          applyAutoContrast();
          setupMobilePosterSwipeOpen();
        }, 1200);
      }
      fixQuality(e);
    });

    applyTheme(Lampa.Storage.get(STORAGE_KEY, 'classic'));
    applyAutoThemeByTime();
    if (!window.__lampac_auto_theme_timer) {
      window.__lampac_auto_theme_timer = setInterval(applyAutoThemeByTime, 5 * 60 * 1000);
    }
    applyCardDisplay();
    applyScreenStyle();
  }

  // ─── Bootstrap ──────────────────────────────────────────
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
})();
