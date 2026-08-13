(function () {
  'use strict';

  if (window.lampac_player_redesign) return;
  window.lampac_player_redesign = true;

  var STORAGE_KEY = 'lampac_player_redesign';
  var STYLE_ID = 'lampac-player-redesign-style';

  // ═══════════════════════════════════════════════════
  //  CSS
  // ═══════════════════════════════════════════════════

  var CSS_TEXT = [

    // ── Keyframes ──────────────────────────────────

    '@keyframes lpr-playhead-pulse {',
    '  0%, 100% { transform: translateY(-50%) translateX(50%) scale(1); }',
    '  50% { transform: translateY(-50%) translateX(50%) scale(1.25); }',
    '}',

    '@keyframes lpr-spinner-rotate {',
    '  from { transform: translate(-50%, -50%) rotate(0deg); }',
    '  to { transform: translate(-50%, -50%) rotate(360deg); }',
    '}',

    '@keyframes lpr-border-glow {',
    '  0%, 100% { border-color: rgba(255,255,255,0.1); }',
    '  50% { border-color: rgba(255,255,255,0.22); }',
    '}',

    '@keyframes lpr-focus-pop {',
    '  0% { transform: scale(1); }',
    '  50% { transform: scale(1.15); }',
    '  100% { transform: scale(1.08); }',
    '}',

    '@keyframes lpr-pause-breathe {',
    '  0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,255,255,0.1); }',
    '  50% { transform: scale(1.06); box-shadow: 0 0 60px rgba(255,255,255,0.2); }',
    '}',

    '@keyframes lpr-panel-enter {',
    '  from { transform: translateY(120%) scale(0.97); opacity: 0.5; }',
    '  to { transform: translateY(0) scale(1); opacity: 1; }',
    '}',

    '@keyframes lpr-info-enter {',
    '  from { transform: translateY(-120%) scale(0.97); opacity: 0.5; }',
    '  to { transform: translateY(0) scale(1); opacity: 1; }',
    '}',

    '@keyframes lpr-rewind-flash {',
    '  0% { opacity: 0; transform: scale(0.7); }',
    '  40% { opacity: 1; transform: scale(1.1); }',
    '  100% { opacity: 1; transform: scale(1); }',
    '}',

    '@keyframes lpr-ambient-pulse {',
    '  0%, 100% { opacity: 0.4; }',
    '  50% { opacity: 0.7; }',
    '}',

    // ═══ PANEL: Frosted glass with warm tint ═══════

    '.player .player-panel {',
    '  background: linear-gradient(135deg, rgba(15,15,30,0.65) 0%, rgba(25,12,35,0.6) 100%) !important;',
    '  backdrop-filter: blur(28px) saturate(2) brightness(1.05) !important;',
    '  -webkit-backdrop-filter: blur(28px) saturate(2) brightness(1.05) !important;',
    '  border: 1px solid rgba(255,255,255,0.14) !important;',
    '  box-shadow: 0 8px 40px rgba(0,0,0,0.5),',
    '              0 2px 12px rgba(0,0,0,0.3),',
    '              inset 0 1px 0 rgba(255,255,255,0.14),',
    '              inset 0 -1px 0 rgba(255,255,255,0.04) !important;',
    '  border-radius: 1.2em !important;',
    '  animation: lpr-border-glow 4s ease-in-out infinite;',
    '}',

    // Panel entrance animation
    '.player .player-panel.panel--visible {',
    '  animation: lpr-panel-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards,',
    '             lpr-border-glow 4s ease-in-out infinite 0.4s;',
    '}',

    // ═══ INFO BAR (top) ════════════════════════════

    '.player .player-info {',
    '  background: linear-gradient(135deg, rgba(15,15,30,0.6) 0%, rgba(25,12,35,0.55) 100%) !important;',
    '  backdrop-filter: blur(28px) saturate(2) brightness(1.05) !important;',
    '  -webkit-backdrop-filter: blur(28px) saturate(2) brightness(1.05) !important;',
    '  border: 1px solid rgba(255,255,255,0.12) !important;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.4),',
    '              inset 0 1px 0 rgba(255,255,255,0.12) !important;',
    '  border-radius: 1.2em !important;',
    '}',

    // Info bar entrance
    '.player .player-info.info--visible {',
    '  animation: lpr-info-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;',
    '}',

    // ── Info bar text ────────────────────────────
    '.player .player-info__name {',
    '  font-size: 1.8em !important;',
    '  letter-spacing: 0.02em;',
    '  font-weight: 600 !important;',
    '  text-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.05);',
    '}',

    '.player .player-info__time {',
    "  font-family: 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', monospace;",
    '  opacity: 0.8;',
    '  text-shadow: 0 1px 4px rgba(0,0,0,0.5);',
    '}',

    // ── Info values: glass pills ──────────────────
    '.player .player-info__values > div span {',
    '  background: rgba(255,255,255,0.1) !important;',
    '  backdrop-filter: blur(6px);',
    '  -webkit-backdrop-filter: blur(6px);',
    '  padding: 0.15em 0.6em !important;',
    '  border-radius: 0.4em !important;',
    '  border: 1px solid rgba(255,255,255,0.08);',
    '  font-weight: 400 !important;',
    '}',

    // ── Hide empty info values (stat/speed/pieces when not torrent) ──
    '.player .player-info__values > div span:empty {',
    '  display: none !important;',
    '}',
    '.player .player-info__values .value--pieces:empty {',
    '  display: none !important;',
    '}',
    '.player .player-info__values .value--stat:has(span:empty) {',
    '  display: none !important;',
    '}',
    '.player .player-info__values .value--speed:has(span:empty) {',
    '  display: none !important;',
    '}',

    '.player .player-info__error {',
    '  background: rgba(255,60,60,0.15) !important;',
    '  border: 1px solid rgba(255,60,60,0.3);',
    '  border-radius: 0.5em;',
    '  padding: 0.5em 1em;',
    '  margin-top: 0.8em;',
    '}',

    // ═══ TIMELINE ══════════════════════════════════

    '.player .player-panel__timeline {',
    '  height: 0.45em !important;',
    '  background-color: rgba(255,255,255,0.18) !important;',
    '  transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;',
    '  margin-bottom: 0.8em !important;',
    '  border-radius: 0.5em !important;',
    '  overflow: visible !important;',
    '  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3) !important;',
    '}',

    '.player .player-panel__timeline:hover,',
    '.player .player-panel__timeline.focus {',
    '  height: 0.7em !important;',
    '  background-color: rgba(255,255,255,0.22) !important;',
    '}',

    // ── Position bar: vibrant glow ───────────────
    '.player .player-panel__position {',
    '  box-shadow: 0 0 12px 2px rgba(255,180,100,0.5), 0 0 4px rgba(255,255,255,0.3);',
    '  border-radius: 2em;',
    '  transition: box-shadow 0.3s ease !important;',
    '}',

    // ── Buffer ───────────────────────────────────
    '.player .player-panel__peding {',
    '  background-color: rgba(255,255,255,0.15) !important;',
    '  border-radius: 2em;',
    '}',

    // ── Animated playhead ────────────────────────
    '.player .player-panel__position > div:after {',
    '  width: 1.5em !important;',
    '  height: 1.5em !important;',
    '  box-shadow: 0 0 14px 3px rgba(255,180,100,0.6), 0 0 30px rgba(255,140,50,0.2);',
    '  animation: lpr-playhead-pulse 2s ease-in-out infinite !important;',
    '}',

    '.player .player-panel__timeline.focus .player-panel__position > div:after {',
    '  box-shadow: 0 0 18px 4px rgba(255,180,100,0.7), 0 0 40px rgba(255,140,50,0.3);',
    '}',

    // ── Segment highlights ───────────────────────
    '.player .player-panel__timeline-segment--ad {',
    '  box-shadow: 0 0 8px rgba(255, 200, 60, 0.5);',
    '}',

    '.player .player-panel__timeline-segment--skip {',
    '  box-shadow: 0 0 8px rgba(100, 220, 255, 0.5);',
    '}',

    // ═══ BUTTONS ═══════════════════════════════════

    '.player .player-panel .button {',
    '  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;',
    '  border-radius: 0.5em;',
    '}',

    // All button SVGs brighter by default
    '.player .player-panel .button svg {',
    '  opacity: 0.9;',
    '  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));',
    '}',

    // Focus: bounce + glow (background/color NOT overridden — theme.js)
    '.player .player-panel .button.focus {',
    '  transform: scale(1.12);',
    '  box-shadow: 0 0 20px rgba(255,180,100,0.25), 0 4px 16px rgba(0,0,0,0.3);',
    '  animation: lpr-focus-pop 0.3s ease-out;',
    '}',

    '.player .player-panel .button.focus svg {',
    '  opacity: 1 !important;',
    '  filter: drop-shadow(0 0 8px rgba(255,200,130,0.6));',
    '}',

    // ── Play/Pause: hero button ─────────────────
    '.player .player-panel__playpause {',
    '  font-size: 2em !important;',
    '}',

    '.player .player-panel__playpause svg {',
    '  opacity: 1 !important;',
    '  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)) !important;',
    '}',

    // ── Settings gear: rotate on focus ──────────
    '.player .player-panel__settings.focus svg {',
    '  transform: rotate(60deg);',
    '  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);',
    '}',

    '.player .player-panel__settings svg {',
    '  transition: transform 0.3s ease;',
    '}',

    // ── Subs/Tracks: highlight when active ──────
    '.player .player-panel__subs,',
    '.player .player-panel__tracks {',
    '  position: relative;',
    '}',

    // ── Filename ──────────────────────────────────
    '.player .player-panel__filename {',
    '  font-weight: 500;',
    '  letter-spacing: 0.01em;',
    '  text-shadow: 0 1px 6px rgba(0,0,0,0.5);',
    '}',

    // ── Quality badge: accent pill ───────────────
    '.player .player-panel__quality {',
    '  backdrop-filter: blur(10px);',
    '  -webkit-backdrop-filter: blur(10px);',
    '  background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08)) !important;',
    '  border: 1px solid rgba(255,255,255,0.25);',
    '  border-radius: 0.5em;',
    '  font-weight: 700;',
    '  letter-spacing: 0.06em;',
    '  text-shadow: 0 1px 3px rgba(0,0,0,0.4);',
    '  padding: 0.15em 0.5em !important;',
    '}',

    '.player .player-panel__quality.focus {',
    '  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15)) !important;',
    '  box-shadow: 0 0 14px rgba(255,180,100,0.3);',
    '  border-color: rgba(255,255,255,0.4);',
    '}',

    // ── Next episode name ────────────────────────
    '.player .player-panel__next-episode-name {',
    '  background: rgba(255,255,255,0.08);',
    '  backdrop-filter: blur(8px);',
    '  -webkit-backdrop-filter: blur(8px);',
    '  padding: 0.2em 0.7em;',
    '  border-radius: 0.4em;',
    '  border: 1px solid rgba(255,255,255,0.08);',
    '  font-size: 0.85em;',
    '  opacity: 0.9;',
    '}',

    // ═══ VOLUME ════════════════════════════════════

    '.player .player-panel__volume-range {',
    '  accent-color: rgba(255,200,130,0.9);',
    '}',

    '.player .player-panel__volume-drop {',
    '  background: linear-gradient(135deg, rgba(15,15,30,0.7), rgba(25,12,35,0.65)) !important;',
    '  backdrop-filter: blur(24px) saturate(1.5) !important;',
    '  -webkit-backdrop-filter: blur(24px) saturate(1.5) !important;',
    '  border: 1px solid rgba(255,255,255,0.12);',
    '  border-radius: 0.8em;',
    '  box-shadow: 0 8px 24px rgba(0,0,0,0.4);',
    '}',

    // ═══ PAUSE OVERLAY ═════════════════════════════

    '.player .player-video__paused {',
    '  position: absolute !important;',
    '  left: 50% !important;',
    '  top: 50% !important;',
    '  margin: 0 !important;',
    '  transform: translate(-50%, -50%) !important;',
    '  background: rgba(0,0,0,0.25) !important;',
    '  backdrop-filter: blur(16px) saturate(1.5) !important;',
    '  -webkit-backdrop-filter: blur(16px) saturate(1.5) !important;',
    '  border: 1px solid rgba(255,255,255,0.15);',
    '  box-shadow: 0 0 60px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.03);',
    '  animation: lpr-pause-breathe 3s ease-in-out infinite !important;',
    '  width: 6em !important;',
    '  height: 6em !important;',
    '  pointer-events: none !important;',
    '  z-index: 61 !important;',
    '}',

    '.player .player-video__paused svg {',
    '  position: absolute !important;',
    '  left: 50% !important;',
    '  top: 50% !important;',
    '  transform: translate(-50%, -50%) !important;',
    '  filter: drop-shadow(0 0 12px rgba(255,255,255,0.4));',
    '  width: 2em !important;',
    '  height: 2em !important;',
    '  max-width: none !important;',
    '  max-height: none !important;',
    '}',

    // ═══ LOADING SPINNER ═══════════════════════════

    '.player .player-video__loader {',
    '  position: absolute !important;',
    '  left: 50% !important;',
    '  top: 50% !important;',
    '  transform: translate(-50%, -50%) !important;',
    '  background-image: none !important;',
    '  background-color: transparent !important;',
    '  width: 5em !important;',
    '  height: 5em !important;',
    '  margin-left: 0 !important;',
    '  margin-top: 0 !important;',
    '  border: 3px solid rgba(255,255,255,0.08) !important;',
    '  border-top-color: rgba(255,200,130,0.9) !important;',
    '  border-right-color: rgba(255,140,80,0.6) !important;',
    '  border-radius: 50% !important;',
    '  animation: lpr-spinner-rotate 0.7s ease-in-out infinite !important;',
    '  box-shadow: 0 0 30px rgba(255,180,100,0.15), inset 0 0 20px rgba(255,180,100,0.05);',
    '  padding: 0 !important;',
    '  pointer-events: none !important;',
    '  z-index: 62 !important;',
    '}',

    // ═══ SEEK INDICATORS ═══════════════════════════

    '.player .player-video__backwork-icon,',
    '.player .player-video__forward-icon {',
    '  font-size: 1.8em !important;',
    '  filter: drop-shadow(0 0 15px rgba(255,200,130,0.6));',
    '  transition: opacity 0.2s ease;',
    '}',

    '.player .player-video__backwork-icon.rewind,',
    '.player .player-video__forward-icon.rewind {',
    '  animation: lpr-rewind-flash 0.35s ease-out;',
    '}',

    '.player .player-video__backwork-icon span,',
    '.player .player-video__forward-icon span {',
    '  font-weight: 700;',
    '  text-shadow: 0 0 12px rgba(255,200,130,0.5);',
    '}',

    // ═══ SUBTITLES ═════════════════════════════════

    '.player .player-video__subtitles {',
    '  transition: transform 0.3s ease, opacity 0.3s ease !important;',
    '}',

    '.player .player-video__subtitles-text {',
    '  text-shadow:',
    '    0 0 6px rgba(0,0,0,0.95),',
    '    0 2px 4px rgba(0,0,0,0.8),',
    '    0 0 16px rgba(0,0,0,0.5) !important;',
    '  padding: 0.3em 0.8em;',
    '  border-radius: 0.4em;',
    '  background: rgba(0,0,0,0.3);',
    '  backdrop-filter: blur(3px);',
    '  -webkit-backdrop-filter: blur(3px);',
    '}',

    // ═══ TIME DISPLAY ══════════════════════════════

    '.player .player-panel__timenow,',
    '.player .player-panel__timeend {',
    "  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;",
    '  font-size: 0.85em;',
    '  opacity: 0.85;',
    '  letter-spacing: 0.04em;',
    '  min-width: 5.5em !important;',
    '  white-space: nowrap !important;',
    '  line-height: 1.2 !important;',
    '}',

    '.player .player-panel__timenow {',
    '  text-align: left !important;',
    '}',

    '.player .player-panel__timeend {',
    '  text-align: right !important;',
    '}',

    // ── Time tooltip ─────────────────────────────
    '.player .player-panel__time {',
    '  background: rgba(15,15,25,0.75) !important;',
    '  backdrop-filter: blur(12px);',
    '  -webkit-backdrop-filter: blur(12px);',
    '  border: 1px solid rgba(255,255,255,0.12);',
    '  border-radius: 0.5em;',
    '  box-shadow: 0 4px 20px rgba(0,0,0,0.4);',
    '  font-weight: 500;',
    '}',

    // ═══ PLAYER FOOTER (episode card) ══════════════

    '.player .player-footer {',
    '  background: linear-gradient(135deg, rgba(15,15,30,0.65) 0%, rgba(25,12,35,0.6) 100%) !important;',
    '  backdrop-filter: blur(28px) saturate(2) brightness(1.05) !important;',
    '  -webkit-backdrop-filter: blur(28px) saturate(2) brightness(1.05) !important;',
    '  border: 1px solid rgba(255,255,255,0.12) !important;',
    '  box-shadow: 0 8px 40px rgba(0,0,0,0.5),',
    '              inset 0 1px 0 rgba(255,255,255,0.12) !important;',
    '  border-radius: 1.2em !important;',
    '}',

    '.player .player-footer.open {',
    '  animation: lpr-panel-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;',
    '}',

    '.player .player-footer-card__poster-img {',
    '  border-radius: 0.5em;',
    '  box-shadow: 0 4px 16px rgba(0,0,0,0.4);',
    '}',

    '.player .player-footer-card__title {',
    '  font-weight: 600;',
    '  text-shadow: 0 1px 6px rgba(0,0,0,0.3);',
    '}',

    '.player .player-footer-card__tags {',
    '  opacity: 0.7;',
    '}',

    '.player .player-footer-card__text {',
    '  opacity: 0.8;',
    '  line-height: 1.5;',
    '}',

    // ═══ GRADIENT OVERLAYS ═════════════════════════

    '.lpr-gradient-bottom {',
    '  position: fixed;',
    '  left: 0; right: 0; bottom: 0;',
    '  height: 220px;',
    '  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(10,5,20,0.3) 40%, transparent 100%);',
    '  pointer-events: none;',
    '  z-index: 49;',
    '  opacity: 0;',
    '  transition: opacity 0.5s ease;',
    '}',

    '.lpr-gradient-top {',
    '  position: fixed;',
    '  left: 0; right: 0; top: 0;',
    '  height: 140px;',
    '  background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%);',
    '  pointer-events: none;',
    '  z-index: 49;',
    '  opacity: 0;',
    '  transition: opacity 0.5s ease;',
    '}',

    '.lpr-gradient-bottom.visible,',
    '.lpr-gradient-top.visible {',
    '  opacity: 1;',
    '}',

    // ═══ AMBIENT GLOW ══════════════════════════════
    // Subtle edge glow that pulses behind the panel

    '.lpr-ambient {',
    '  position: fixed;',
    '  left: -5%; right: -5%; bottom: -2em;',
    '  height: 12em;',
    '  border-radius: 50%;',
    '  pointer-events: none;',
    '  z-index: 48;',
    '  opacity: 0;',
    '  transition: opacity 0.8s ease;',
    '  filter: blur(40px);',
    '  animation: lpr-ambient-pulse 6s ease-in-out infinite;',
    '}',

    '.lpr-ambient.visible {',
    '  opacity: 1;',
    '}',

    // ═══ MINI PROGRESS BAR ═════════════════════════

    '.lpr-mini-progress {',
    '  position: fixed;',
    '  left: 0; right: 0; bottom: 0;',
    '  height: 3px;',
    '  z-index: 9999;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transition: opacity 0.5s ease;',
    '}',

    '.lpr-mini-progress.visible {',
    '  opacity: 0.75;',
    '}',

    '.lpr-mini-progress__bar {',
    '  height: 100%;',
    '  width: 0%;',
    '  background: linear-gradient(90deg, rgba(255,180,100,0.8), rgba(255,120,80,0.9));',
    '  border-radius: 0 2px 2px 0;',
    '  transition: width 0.3s linear;',
    '  box-shadow: 0 0 8px rgba(255,160,80,0.4);',
    '}',


    // ═══ TV LAYOUT FIXES ═══════════════════════════

    '.player .player-info {',
    '  box-sizing: border-box !important;',
    '  left: 2.2em !important;',
    '  right: 2.2em !important;',
    '  top: 1.2em !important;',
    '  width: auto !important;',
    '  max-width: calc(100% - 4.4em) !important;',
    '  padding-left: 1em !important;',
    '  padding-right: 1em !important;',
    '}',

    '.player .player-panel {',
    '  box-sizing: border-box !important;',
    '  left: 1.8em !important;',
    '  right: 1.8em !important;',
    '  bottom: 1.4em !important;',
    '  width: auto !important;',
    '  max-width: calc(100% - 3.6em) !important;',
    '}',

    '.player .player-panel__timeline {',
    '  position: relative !important;',
    '  margin-left: 0 !important;',
    '  margin-right: 0 !important;',
    '}',

    '.player .player-video__backwork-icon,',
    '.player .player-video__forward-icon {',
    '  position: absolute !important;',
    '  top: 50% !important;',
    '  transform: translateY(-50%) !important;',
    '  margin: 0 !important;',
    '}',

    '.player .player-video__backwork-icon {',
    '  left: 4.5% !important;',
    '}',

    '.player .player-video__forward-icon {',
    '  right: 4.5% !important;',
    '}',

    '.player .player-panel .button,',
    '.player .player-panel .button svg,',
    '.player .player-panel__quality {',
    '  vertical-align: middle !important;',
    '}',

    // ═══ RESPONSIVE ════════════════════════════════

    '@media screen and (max-width: 480px) {',
    '  .player .player-panel {',
    '    backdrop-filter: blur(20px) saturate(1.6) !important;',
    '    -webkit-backdrop-filter: blur(20px) saturate(1.6) !important;',
    '    border-radius: 0 !important;',
    '    border-left: none !important;',
    '    border-right: none !important;',
    '    border-bottom: none !important;',
    '  }',
    '  .player .player-info {',
    '    backdrop-filter: blur(16px) saturate(1.6) !important;',
    '    -webkit-backdrop-filter: blur(16px) saturate(1.6) !important;',
    '    border-radius: 0 !important;',
    '  }',
    '  .player .player-footer {',
    '    backdrop-filter: blur(16px) saturate(1.6) !important;',
    '    -webkit-backdrop-filter: blur(16px) saturate(1.6) !important;',
    '    border-radius: 0 !important;',
    '  }',
    '  .lpr-gradient-bottom { height: 140px; }',
    '  .lpr-gradient-top { height: 90px; }',
    '  .lpr-ambient { display: none; }',
    '  .player .player-video__paused { width: 4.8em !important; height: 4.8em !important; }',
    '  .player .player-video__paused svg { width: 1.6em !important; height: 1.6em !important; }',
    '}',

    '@media screen and (max-width: 767px) {',
    '  .player .player-panel__playpause { font-size: 1.6em !important; }',
    '  .player .player-info {',
    '    left: 0.8em !important;',
    '    right: 0.8em !important;',
    '    top: 0.5em !important;',
    '    max-width: calc(100% - 1.6em) !important;',
    '  }',
    '  .player .player-panel {',
    '    left: 0.8em !important;',
    '    right: 0.8em !important;',
    '    bottom: 0.8em !important;',
    '    max-width: calc(100% - 1.6em) !important;',
    '  }',
    '}',


    '@media screen and (max-width: 767px) {',
    '  .player .player-video__loader { left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; }',
    '  .player .player-video__paused { left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; }',
    '  .player .player-video__paused svg { left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; }',
    '}',

    '@media screen and (min-width: 900px) {',
    '  .player .player-info {',
    '    top: 1.4em !important;',
    '    left: 2.6em !important;',
    '    right: 2.6em !important;',
    '    max-width: calc(100% - 5.2em) !important;',
    '  }',
    '  .player .player-panel {',
    '    left: 2.2em !important;',
    '    right: 2.2em !important;',
    '    bottom: 1.6em !important;',
    '    max-width: calc(100% - 4.4em) !important;',
    '  }',
    '}',

  ].join('\n');

  // ═══════════════════════════════════════════════════
  //  DOM Management
  // ═══════════════════════════════════════════════════

  var gradBottom = null;
  var gradTop = null;
  var ambientEl = null;
  var miniProgress = null;
  var miniBar = null;
  var videoEl = null;
  var rafId = null;
  var ambientRafId = null;
  var ambientCanvas = null;
  var ambientCtx = null;
  var isPlayerActive = false;
  var glowStyleEl = null;

  // ── Inject main CSS ─────────────────────────────
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  function removeStyles() {
    var el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  // ── Dynamic glow color matching theme ───────────
  function detectGlowColor() {
    var pos = document.querySelector('.player-panel__position');
    if (!pos) return;

    var bg = window.getComputedStyle(pos).backgroundColor;
    if (!bg || bg === 'transparent' || bg.indexOf('rgb') < 0) return;

    var match = bg.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return;

    var r = match[1], g = match[2], b = match[3];

    // Skip if pure white (default, no theme)
    if (r === '255' && g === '255' && b === '255') return;

    var glow50 = 'rgba(' + r + ',' + g + ',' + b + ',0.5)';
    var glow60 = 'rgba(' + r + ',' + g + ',' + b + ',0.6)';

    if (!glowStyleEl) {
      glowStyleEl = document.createElement('style');
      glowStyleEl.id = 'lpr-glow-dynamic';
      document.head.appendChild(glowStyleEl);
    }

    var glow25 = 'rgba(' + r + ',' + g + ',' + b + ',0.25)';
    var glow30 = 'rgba(' + r + ',' + g + ',' + b + ',0.3)';
    var glow40 = 'rgba(' + r + ',' + g + ',' + b + ',0.4)';
    var glow70 = 'rgba(' + r + ',' + g + ',' + b + ',0.7)';

    glowStyleEl.textContent = [
      '.player .player-panel__position { box-shadow: 0 0 12px 2px ' + glow50 + ', 0 0 4px rgba(255,255,255,0.2) !important; }',
      '.player .player-panel__position > div:after { box-shadow: 0 0 14px 3px ' + glow60 + ', 0 0 30px ' + glow25 + ' !important; }',
      '.player .player-panel__timeline.focus .player-panel__position > div:after { box-shadow: 0 0 18px 4px ' + glow70 + ', 0 0 40px ' + glow30 + ' !important; }',
      '.player .player-panel .button.focus { box-shadow: 0 0 20px ' + glow25 + ', 0 4px 16px rgba(0,0,0,0.3) !important; }',
      '.player .player-panel .button.focus svg { filter: drop-shadow(0 0 6px ' + glow50 + ') !important; }',
      '.player .player-panel__quality.focus { box-shadow: 0 0 12px ' + glow25 + ' !important; }',
      '.lpr-mini-progress__bar { background: ' + glow70 + ' !important; box-shadow: 0 0 8px ' + glow40 + ' !important; }',
      '.player-video__loader { border-top-color: ' + glow70 + ' !important; border-right-color: ' + glow50 + ' !important; box-shadow: 0 0 30px ' + glow25 + ', inset 0 0 20px rgba(' + r + ',' + g + ',' + b + ',0.08) !important; }',
      '.player .player-video__paused { border-color: ' + glow25 + '; box-shadow: 0 0 60px ' + glow25 + ', inset 0 0 30px rgba(' + r + ',' + g + ',' + b + ',0.05); }',
      '.lpr-ambient { background: radial-gradient(ellipse at center, ' + glow40 + ' 0%, transparent 70%); }',
    ].join('\n');
  }

  // ── Create overlay DOM elements ─────────────────
  function createOverlays() {
    var playerEl = document.querySelector('.player');
    if (!playerEl) return;

    if (!gradBottom) {
      gradBottom = document.createElement('div');
      gradBottom.className = 'lpr-gradient-bottom';
      playerEl.appendChild(gradBottom);
    }

    if (!gradTop) {
      gradTop = document.createElement('div');
      gradTop.className = 'lpr-gradient-top';
      playerEl.appendChild(gradTop);
    }

    if (!ambientEl) {
      ambientEl = document.createElement('div');
      ambientEl.className = 'lpr-ambient';
      playerEl.appendChild(ambientEl);
    }

    if (!miniProgress) {
      miniProgress = document.createElement('div');
      miniProgress.className = 'lpr-mini-progress';
      miniBar = document.createElement('div');
      miniBar.className = 'lpr-mini-progress__bar';
      miniProgress.appendChild(miniBar);
      document.body.appendChild(miniProgress);
    }
  }

  function removeOverlays() {
    if (gradBottom) { gradBottom.remove(); gradBottom = null; }
    if (gradTop) { gradTop.remove(); gradTop = null; }
    if (ambientEl) { ambientEl.remove(); ambientEl = null; }
    if (miniProgress) { miniProgress.remove(); miniProgress = null; miniBar = null; }
    if (glowStyleEl) { glowStyleEl.remove(); glowStyleEl = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    stopAmbient();
  }

  // ── Mini progress bar animation ─────────────────
  function updateMiniProgress() {
    if (!miniBar || !videoEl) return;
    if (videoEl.duration && videoEl.duration > 0 && isFinite(videoEl.duration)) {
      var pct = (videoEl.currentTime / videoEl.duration) * 100;
      miniBar.style.width = pct.toFixed(2) + '%';
    }
    if (isPlayerActive) {
      rafId = requestAnimationFrame(updateMiniProgress);
    }
  }

  function startMiniProgress() {
    if (rafId) return;
    if (videoEl && isPlayerActive) {
      updateMiniProgress();
    }
  }

  function stopMiniProgress() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ── Ambient glow: sample video edge colors ──────
  function startAmbient() {
    if (!videoEl || !ambientEl) return;

    // Create small off-screen canvas for color sampling
    if (!ambientCanvas) {
      ambientCanvas = document.createElement('canvas');
      ambientCanvas.width = 4;
      ambientCanvas.height = 4;
      ambientCtx = ambientCanvas.getContext('2d', { willReadFrequently: true });
    }

    function sampleColor() {
      if (!isPlayerActive || !videoEl || !ambientEl) return;

      try {
        if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
          // Sample bottom center of video
          ambientCtx.drawImage(videoEl,
            videoEl.videoWidth * 0.25, videoEl.videoHeight * 0.8,
            videoEl.videoWidth * 0.5, videoEl.videoHeight * 0.2,
            0, 0, 4, 4
          );
          var pixel = ambientCtx.getImageData(1, 1, 1, 1).data;
          var r = pixel[0], g = pixel[1], b = pixel[2];

          // Only apply if color is interesting (not too dark/too light)
          var brightness = (r + g + b) / 3;
          if (brightness > 30 && brightness < 230) {
            ambientEl.style.background = 'radial-gradient(ellipse at center, rgba(' + r + ',' + g + ',' + b + ',0.35) 0%, transparent 70%)';
          }
        }
      } catch (e) {
        // CORS or other video access errors — silent
      }

      ambientRafId = setTimeout(function () {
        if (isPlayerActive) sampleColor();
      }, 3000); // Sample every 3 seconds
    }

    sampleColor();
  }

  function stopAmbient() {
    if (ambientRafId) {
      clearTimeout(ambientRafId);
      ambientRafId = null;
    }
  }

  // ── Panel visibility → toggle gradients + mini bar ──
  function onPanelVisible(e) {
    if (e.status) {
      // Panel shown → show gradients + ambient, hide mini bar
      if (gradBottom) gradBottom.classList.add('visible');
      if (gradTop) gradTop.classList.add('visible');
      if (ambientEl) ambientEl.classList.add('visible');
      if (miniProgress) miniProgress.classList.remove('visible');
      stopMiniProgress();
    } else {
      // Panel hidden → hide gradients + ambient, show mini bar
      if (gradBottom) gradBottom.classList.remove('visible');
      if (gradTop) gradTop.classList.remove('visible');
      if (ambientEl) ambientEl.classList.remove('visible');
      if (miniProgress) miniProgress.classList.add('visible');
      startMiniProgress();
    }
  }

  // ═══════════════════════════════════════════════════
  //  Player Lifecycle
  // ═══════════════════════════════════════════════════

  function onPlayerStart() {
    isPlayerActive = true;
    videoEl = null;

    setTimeout(function () {
      if (!isPlayerActive) return;
      createOverlays();
    }, 300);
  }

  function onCanPlay() {
    videoEl = Lampa.PlayerVideo ? Lampa.PlayerVideo.video() : null;

    // Detect theme glow color after rendering
    setTimeout(detectGlowColor, 600);

    // Start ambient glow sampling
    setTimeout(function () {
      if (isPlayerActive && videoEl) startAmbient();
    }, 1500);
  }

  function onPlayerDestroy() {
    isPlayerActive = false;
    videoEl = null;
    stopMiniProgress();
    stopAmbient();
    removeOverlays();
  }

  // ═══════════════════════════════════════════════════
  //  Settings
  // ═══════════════════════════════════════════════════

  function addSettings() {
    if (!Lampa.SettingsApi) return;

    Lampa.SettingsApi.addParam({
      component: 'player',
      param: {
        name: STORAGE_KEY,
        type: 'select',
        values: {
          on: 'Включено',
          off: 'Выключено'
        },
        default: 'on'
      },
      field: {
        name: 'Кинематографический стиль',
        description: 'Стеклянная панель, свечение, градиенты, амбиент'
      },
      onChange: function (value) {
        if (value === 'on') {
          injectStyles();
        } else {
          removeStyles();
          removeOverlays();
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════
  //  Init
  // ═══════════════════════════════════════════════════

  function initPlugin() {
    var enabled = Lampa.Storage.get(STORAGE_KEY, 'on');
    if (enabled === 'on') {
      injectStyles();
    }

    Lampa.Player.listener.follow('start', onPlayerStart);
    Lampa.Player.listener.follow('destroy', onPlayerDestroy);
    Lampa.PlayerVideo.listener.follow('canplay', onCanPlay);

    // Panel visibility hook
    if (Lampa.PlayerPanel && Lampa.PlayerPanel.listener) {
      Lampa.PlayerPanel.listener.follow('visible', onPanelVisible);
    }

    addSettings();

    console.log('PlayerRedesign', 'Cinematic premium player initialized');
  }

  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') initPlugin();
    });
  }
})();
