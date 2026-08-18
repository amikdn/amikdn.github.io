(function () {
  'use strict';

  if (window.nova_skin) return;
  window.nova_skin = true;

  var NOVA_BUILD = "2026-08-18 15:38:29";
  var NOVA_CSS = ":root{--nova-bg:#0a0b12;--nova-accent:#fff;--nova-accent2:#fff;--nova-rgb:255,255,255;--nova-accent-lt:#fff;--nova-glow:transparent;--nova-glass:rgba(255,255,255,.055);--nova-line:rgba(255,255,255,.09);--nova-info:#8f909a;--nova-text:#eceefb}\n.nova-scope .explorer__left{display:none!important}\n.nova-scope .explorer__files{width:100%!important;left:0!important}\n.nova-scope .explorer__files-head{display:none!important}\n.nova-voices{display:flex;flex-wrap:wrap;gap:.7em;padding:.2em .2em 1.4em}\n.nova-voice{display:inline-flex;align-items:center;gap:.7em;padding:.7em 1.15em;border-radius:1em;background:var(--nova-glass);border:1px solid var(--nova-line);transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}\n.nova-voice.focus{background:rgba(var(--nova-rgb),.12);border-color:transparent;transform:scale(1.03);box-shadow:0 0 0 2px var(--nova-accent),0 0 2em var(--nova-glow)}\n.nova-voice.is-sel{border-color:var(--nova-accent)}\n.nova-voice__q{color:#fff;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent-lt));padding:.16em .52em;border-radius:.42em;font-size:.78em;font-weight:800;letter-spacing:.02em}\n.nova-voice__name{font-weight:600;color:var(--nova-text)}\n.nova-seasons{display:flex;flex-wrap:wrap;gap:.55em;padding:.2em .2em 1.3em}\n.nova-season{display:inline-flex;align-items:center;justify-content:center;min-width:2.2em;padding:.55em 1.05em;border-radius:1em;font-size:.95em;font-weight:700;color:var(--nova-text);background:var(--nova-glass);border:1px solid var(--nova-line);transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}\n.nova-season.focus{background:rgba(var(--nova-rgb),.12);border-color:transparent;transform:scale(1.06);box-shadow:0 0 0 2px var(--nova-accent),0 0 2em var(--nova-glow)}\n.nova-season.is-sel{border-color:var(--nova-accent);background:rgba(var(--nova-rgb),.16)}\n.nova-pills{display:flex;flex-wrap:wrap;gap:.6em;padding:.1em .2em 1.1em}\n.nova-pill{display:inline-flex;align-items:center;gap:.5em;padding:.55em 1.1em;border-radius:2em;background:var(--nova-glass);border:1px solid var(--nova-line);color:var(--nova-text);transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}\n.nova-pill.focus{background:rgba(var(--nova-rgb),.16);border-color:transparent;transform:scale(1.05);box-shadow:0 0 0 2px var(--nova-accent),0 0 1.8em var(--nova-glow)}\n.nova-pill__k{font-size:.72em;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--nova-info)}\n.nova-pill__v{font-size:.95em;font-weight:700;max-width:14em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.nova-pill__c{opacity:.55;font-size:.8em}\n.nova-pill__badge{display:inline-flex;align-items:center;justify-content:center;min-width:1.35em;height:1.35em;padding:0 .35em;border-radius:1em;background:rgba(255,255,255,.3);color:#fff;font-size:.8em;font-weight:800;line-height:1}\n.nova-hero{position:relative;display:block;height:23em;margin:.4em .4em 1em;border-radius:1.4em;overflow:hidden;background-size:cover;background-position:center 20%;background-color:#12131b;border:1px solid var(--nova-line);background-clip:padding-box;transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease}\n.nova-hero.focus{transform:translateY(-.15em);border-color:transparent;box-shadow:0 1.4em 3.6em rgba(0,0,0,.75),0 0 0 2px var(--nova-accent),0 0 3em var(--nova-glow)}\n.nova-hero__scrim{position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,9,16,.98),rgba(8,9,16,.4) 48%,rgba(8,9,16,.03) 78%),linear-gradient(90deg,rgba(8,9,16,.72),transparent 62%),radial-gradient(120% 90% at 92% 8%,rgba(var(--nova-rgb),.16),transparent 55%)}\n.nova-hero__content{position:absolute;left:1.7em;right:1.7em;bottom:1.4em;z-index:2;display:flex;flex-direction:column;gap:.6em}\n.nova-hero__title{font-size:2.7em;font-weight:800;letter-spacing:-.015em;line-height:1.03;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.nova-hero__meta{display:flex;align-items:center;gap:.85em;font-size:.95em;color:#c9cad6;font-weight:600}\n.nova-hero__q{color:#fff;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent-lt));padding:.2em .62em;border-radius:.5em;font-size:.8em;font-weight:800;letter-spacing:.03em;box-shadow:0 .2em .8em var(--nova-glow)}\n.nova-hero__chips{display:flex;gap:.5em;flex-wrap:wrap}\n.nova-chip{display:inline-flex;align-items:center;gap:.45em;font-size:.82em;font-weight:600;color:#d8d9e6;background:rgba(255,255,255,.07);border:1px solid var(--nova-line);padding:.3em .8em .3em .7em;border-radius:1.2em}\n.nova-chip::before{content:\"\";width:.42em;height:.42em;border-radius:50%;background:var(--nova-accent);box-shadow:0 0 .5em var(--nova-glow)}\n.nova-hero__desc{font-size:.92em;line-height:1.42;color:#b3b4c2;max-width:46em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.nova-hero__desc:empty{display:none}\n.nova-hero__cta{display:flex;align-items:center;gap:1.1em;margin-top:.55em}\n.nova-play{display:inline-flex;align-items:center;gap:.5em;font-size:1.05em;font-weight:800;color:#fff;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent-lt));padding:.62em 1.5em;border-radius:2em;box-shadow:0 .4em 1.4em var(--nova-glow);transition:transform .2s,box-shadow .2s}\n.nova-hero.focus .nova-play{transform:scale(1.05);box-shadow:0 0 2em var(--nova-glow),0 .5em 1.6em rgba(0,0,0,.45)}\n.nova-hero__voice{font-size:.92em;color:#9a9ba7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.nova-hero__prog{position:absolute;left:0;right:0;bottom:0;z-index:3;height:.3em;background:rgba(255,255,255,.14)}\n.nova-hero__prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--nova-accent),var(--nova-accent2))}\n.nova-ep{display:flex;align-items:center;gap:1.2em;padding:.6em .75em;margin:.45em .2em;border-radius:1.1em;background:var(--nova-glass);border:1px solid var(--nova-line);transition:transform .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease}\n.nova-ep.focus{background:rgba(var(--nova-rgb),.1);border-color:transparent;transform:scale(1.01);box-shadow:0 .8em 2.2em rgba(0,0,0,.55),0 0 0 2px var(--nova-accent),0 0 2.2em var(--nova-glow)}\n.nova-ep__art{position:relative;flex:0 0 auto;width:11em;height:6.2em;border-radius:.8em;overflow:hidden;background-size:cover;background-position:center;background-image:linear-gradient(135deg,#2b2d3a,#181924)}\n.nova-ep__scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.15),transparent 55%),linear-gradient(0deg,rgba(0,0,0,.45),transparent 55%)}\n.nova-ep__badge{position:absolute;left:.5em;top:.45em;z-index:2;font-size:.85em;font-weight:800;color:#fff;background:rgba(var(--nova-rgb),.85);padding:.12em .55em;border-radius:.45em;box-shadow:0 .2em .6em rgba(0,0,0,.4)}\n.nova-ep__badge:empty{display:none}\n.nova-ep__play{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;color:#fff;opacity:0;transition:opacity .2s;text-shadow:0 2px 10px rgba(0,0,0,.7),0 0 1em var(--nova-glow)}\n.nova-ep.focus .nova-ep__play{opacity:1}\n.nova-ep__prog{position:absolute;left:0;right:0;bottom:0;z-index:2;height:.32em;background:rgba(255,255,255,.16)}\n.nova-ep__prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--nova-accent),var(--nova-accent2))}\n.nova-ep__body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.32em}\n.nova-ep__top{display:flex;align-items:baseline;gap:1em}\n.nova-ep__title{flex:1 1 auto;min-width:0;font-size:1.35em;font-weight:700;color:var(--nova-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.nova-ep__time{flex:0 0 auto;font-size:.9em;color:var(--nova-info)}\n.nova-ep__sub{font-size:.9em;color:var(--nova-info);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.nova-ep__mark{position:absolute;right:.5em;top:.45em;z-index:2;width:1.7em;height:1.7em;border-radius:50%;background:#fff;color:#000;display:flex;align-items:center;justify-content:center;font-size:.9em;font-weight:800;box-shadow:0 .2em .6em rgba(0,0,0,.5)}\n.nova-ep__mark:empty{display:none}\n.nova-ep__resume{flex:0 0 auto;padding:.16em .7em;border-radius:1em;background:var(--nova-accent);color:#000;font-size:.72em;font-weight:800;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;align-self:center}\n.nova-ep__resume:empty{display:none}\n.nova-ep--watched .nova-ep__art{opacity:.6}\n.nova-ep--watched .nova-ep__title{color:var(--nova-info)}\n.nova-ep--soon{opacity:.5}\n.nova-ep--soon .nova-ep__play{display:none!important}\n.nova-empty{padding:2.8em 1.4em;text-align:center;line-height:1.5}\n.nova-empty__main{color:#eceefb;font-size:1.25em;font-weight:700}\n.nova-empty__hint{margin-top:.7em;color:#9a9ba7;font-size:1.02em}\n.nova-empty__btn{display:inline-block;margin-top:1.5em;padding:.7em 1.7em;border-radius:2em;background:rgba(var(--nova-rgb),.14);border:1px solid var(--nova-line);color:var(--nova-text);font-weight:700;font-size:1.05em}\n.nova-empty__btn.focus{background:rgba(var(--nova-rgb),.2);border-color:transparent;box-shadow:0 0 0 2px var(--nova-accent),0 0 1.6em var(--nova-glow)}\n.nova-skel{display:flex;align-items:center;gap:1.2em;padding:.6em .75em;margin:.45em .2em;border-radius:1.1em;background:var(--nova-glass);pointer-events:none}\n.nova-skel__art{flex:0 0 auto;width:11em;height:6.2em;border-radius:.8em;background:rgba(255,255,255,.06)}\n.nova-skel__l{height:1em;border-radius:.4em;margin:.3em 0;background:rgba(255,255,255,.06)}\n.nova-shine{position:relative;overflow:hidden}\n.nova-shine:after{content:\"\";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(var(--nova-rgb),.14),transparent);animation:novaShine 1.3s infinite}\n@keyframes novaShine{100%{transform:translateX(100%)}}\n.nova-note{display:flex;align-items:center;gap:.5em;padding:.9em 1em .25em;color:#aeb0c8;font-size:.82em;font-weight:700;text-transform:uppercase;letter-spacing:.09em}\n.nova-note::before{content:\"\";width:.35em;height:1em;border-radius:.2em;background:linear-gradient(var(--nova-accent),var(--nova-accent2));box-shadow:0 0 .6em var(--nova-glow)}\n.nova-actors{padding:.3em .2em 1.2em;overflow:hidden}\n.nova-actors__track{display:flex;gap:1.2em}\n.nova-actor{flex:0 0 auto;width:6.4em;text-align:center;border-radius:1em;padding:.4em .2em;transition:transform .2s,background .2s}\n.nova-actor.focus{background:rgba(var(--nova-rgb),.1);transform:translateY(-.25em)}\n.nova-actor__ava{width:5em;height:5em;margin:0 auto .55em;border-radius:50%;background-size:cover;background-position:center;background-color:#20222e;box-shadow:0 .4em 1.2em rgba(0,0,0,.5)}\n.nova-actor.focus .nova-actor__ava{box-shadow:0 0 0 .16em var(--nova-accent),0 0 1.6em var(--nova-glow)}\n.nova-actor__name{font-size:.86em;font-weight:600;color:var(--nova-text);line-height:1.15;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}\n.nova-actor__role{font-size:.78em;color:var(--nova-info);margin-top:.15em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.nova-info{display:flex;flex-wrap:wrap;gap:1.4em 2.4em;padding:.3em 1em 1.6em}\n.nova-info__it{min-width:7em}\n.nova-info__k{font-size:.72em;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#7d7f8c}\n.nova-info__v{font-size:.98em;color:var(--nova-text);margin-top:.2em}\n.view--nova{display:inline-flex!important;align-items:center;gap:.5em;background:linear-gradient(120deg,var(--nova-accent),var(--nova-accent2))!important;border:0!important;color:#fff!important;box-shadow:0 .35em 1em var(--nova-glow)!important}\n.view--nova .nova-btn__ico{flex:0 0 auto;color:#fff}\n.view--nova span,.view--nova .full-start__button-text{font-weight:800!important;letter-spacing:.08em;color:#fff!important}\n.view--nova.focus{box-shadow:0 0 0 .16em #fff,0 0 1.8em var(--nova-glow)!important;transform:translateY(-.05em) scale(1.02)}\n@media screen and (max-width:600px){.nova-ep__art,.nova-skel__art{width:7.5em;height:4.3em}.nova-hero{height:12em}.nova-hero__title{font-size:1.5em}.nova-ep__title{font-size:1.15em}.nova-ep__sub{font-size:.85em}}\n\n.nova-scope .explorer__files-head {\n  display: block !important;\n  width: 0 !important;\n  height: 0 !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\n.nova-scope .explorer__files-head * {\n  width: 0 !important;\n  height: 0 !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  border: 0 !important;\n  overflow: hidden !important;\n}\n.nova-scope .online-prestige-watched { display: none !important; }\n.nova-scope .torrent-list { padding: 0 .8em 2em !important; }\n.nova-scope .online-prestige--full.nova-ep {\n  display: flex !important;\n  align-items: center;\n  gap: 1.2em;\n  padding: .6em .75em !important;\n  margin: .45em .2em !important;\n  border-radius: 1.1em !important;\n  background: var(--nova-glass) !important;\n  border: 1px solid var(--nova-line) !important;\n  box-shadow: none;\n}\n.nova-scope .online-prestige--full.nova-ep.focus {\n  background: rgba(var(--nova-rgb), .1) !important;\n  border-color: transparent !important;\n  transform: scale(1.01);\n  box-shadow: 0 .8em 2.2em rgba(0, 0, 0, .55), 0 0 0 2px var(--nova-accent), 0 0 2.2em var(--nova-glow);\n}\n.nova-scope .online-prestige.focus::after { display: none !important; }\n.nova-scope .online-prestige + .online-prestige { margin-top: .45em !important; border-top: 0 !important; }\n.nova-scope .nova-ep .online-prestige__img {\n  position: relative;\n  flex: 0 0 auto;\n  width: 11em !important;\n  height: 6.2em !important;\n  margin: 0 !important;\n  border-radius: .8em !important;\n  overflow: hidden !important;\n  opacity: 1 !important;\n  background: linear-gradient(135deg, #2b2d3a, #181924) !important;\n}\n.nova-scope .nova-ep .online-prestige__img > img {\n  display: block;\n  width: 100% !important;\n  height: 100% !important;\n  margin: 0 !important;\n  border-radius: 0 !important;\n  object-fit: cover;\n  opacity: 1 !important;\n}\n.nova-scope .nova-ep .online-prestige__loader { z-index: 2; }\n.nova-scope .nova-ep .online-prestige__episode-number {\n  position: absolute !important;\n  left: .5em !important;\n  top: .45em !important;\n  right: auto !important;\n  bottom: auto !important;\n  z-index: 3;\n  padding: .12em .55em !important;\n  border-radius: .45em !important;\n  font-size: .85em !important;\n  font-weight: 800;\n  color: #fff !important;\n  background: rgba(var(--nova-rgb), .85) !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .4);\n}\n.nova-scope .nova-ep .online-prestige__viewed {\n  position: absolute !important;\n  right: .5em !important;\n  top: .45em !important;\n  left: auto !important;\n  bottom: auto !important;\n  z-index: 3;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 1.7em;\n  height: 1.7em;\n  padding: 0 !important;\n  border-radius: 50%;\n  color: #000 !important;\n  background: #fff !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .5);\n}\n.nova-scope .nova-ep .online-prestige__viewed > svg { width: 1em; height: 1em; }\n.nova-scope .nova-ep .online-prestige__timeline {\n  position: absolute !important;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 3;\n  height: .32em !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  background: rgba(255, 255, 255, .16);\n}\n.nova-scope .nova-ep .online-prestige__timeline > .time-line {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  height: 100% !important;\n  margin: 0 !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n}\n.nova-scope .nova-ep .online-prestige__timeline > .time-line > div {\n  height: 100% !important;\n  border-radius: 0 !important;\n  background: linear-gradient(90deg, var(--nova-accent), var(--nova-accent2)) !important;\n}\n.nova-scope .nova-ep .online-prestige__body {\n  flex: 1 1 auto;\n  min-width: 0;\n  display: flex !important;\n  flex-direction: column;\n  gap: .32em;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__head {\n  display: flex !important;\n  align-items: baseline;\n  gap: 1em;\n  margin: 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__title {\n  flex: 1 1 auto;\n  min-width: 0;\n  margin: 0 !important;\n  font-size: 1.35em !important;\n  font-weight: 700;\n  color: var(--nova-text) !important;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.nova-scope .nova-ep .online-prestige__time {\n  flex: 0 0 auto;\n  margin: 0 !important;\n  font-size: .9em !important;\n  color: var(--nova-info) !important;\n  opacity: 1 !important;\n}\n.nova-scope .nova-ep .online-prestige__footer {\n  display: flex !important;\n  align-items: center;\n  gap: .8em;\n  margin: 0 !important;\n  font-size: .9em;\n  color: var(--nova-info);\n}\n.nova-scope .nova-ep .online-prestige__info {\n  min-width: 0;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  color: var(--nova-info) !important;\n  opacity: 1 !important;\n}\n.nova-scope .nova-ep .online-prestige__quality {\n  flex: 0 0 auto;\n  padding: .16em .52em;\n  border: 0 !important;\n  border-radius: .42em;\n  font-size: .78em;\n  font-weight: 800;\n  color: #fff !important;\n  background: linear-gradient(120deg, var(--nova-accent), var(--nova-accent-lt)) !important;\n}\n.nova-scope .nova-ep .online-prestige__quality:empty { display: none; }\n.nova-scope .nova-ep .nova-ep__play {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  opacity: 0;\n  transition: opacity .2s;\n  text-shadow: 0 2px 10px rgba(0, 0, 0, .7);\n}\n.nova-scope .nova-ep.focus .nova-ep__play { opacity: 1; }\n.nova-scope .nova-ep .nova-ep__scrim {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  z-index: 1;\n  background: linear-gradient(0deg, rgba(0, 0, 0, .45), transparent 55%);\n}\n.nova-scope .nova-ep .nova-ep__resume { margin-left: .2em; }\n.nova-scope .online-prestige--full.nova-as-voice {\n  display: inline-flex !important;\n  width: auto !important;\n  align-items: center;\n  gap: .7em;\n  padding: .7em 1.15em !important;\n  margin: .25em .3em !important;\n  border-radius: 1em !important;\n  vertical-align: middle;\n}\n.nova-scope .nova-as-voice .online-prestige__img,\n.nova-scope .nova-as-voice .nova-ep__scrim,\n.nova-scope .nova-as-voice .nova-ep__play,\n.nova-scope .nova-as-voice .online-prestige__time,\n.nova-scope .nova-as-voice .online-prestige__info { display: none !important; }\n.nova-scope .nova-as-voice .online-prestige__body {\n  flex-direction: row !important;\n  align-items: center;\n  gap: .7em;\n}\n.nova-scope .nova-as-voice .online-prestige__footer { order: 1; gap: 0; }\n.nova-scope .nova-as-voice .online-prestige__head { order: 2; }\n.nova-scope .nova-as-voice .online-prestige__title {\n  font-size: 1em !important;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n:root {\n  --nova-accent: #fff;\n  --nova-accent-lt: #fff;\n  --nova-accent2: #fff;\n  --nova-rgb: 255, 255, 255;\n  --nova-glow: rgba(255, 255, 255, 0);\n  --nova-line: rgba(255, 255, 255, .14);\n  --nova-glass: rgba(255, 255, 255, .1);\n  --lampa-focus-border: .3em solid #fff;\n}\n.nova-pill,\n.nova-season,\n.nova-voice {\n  background-color: rgba(255, 255, 255, .1) !important;\n  border: 0 !important;\n  border-radius: 1em !important;\n  color: #fff !important;\n  box-shadow: none !important;\n  transform: none !important;\n  transition: background-color .2s ease, color .2s ease !important;\n}\n.nova-pill.focus,\n.nova-season.focus,\n.nova-voice.focus {\n  background-color: rgba(255, 255, 255, .1) !important;\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n  box-shadow: 0 0 0 .22em #fff !important;\n  transform: none !important;\n}\n.nova-pill.focus .nova-pill__k,\n.nova-pill.focus .nova-pill__v,\n.nova-pill.focus .nova-pill__c,\n.nova-voice.focus .nova-voice__name { color: #fff !important; }\n.nova-pill__badge {\n  background: rgba(255, 255, 255, .3) !important;\n  color: #fff !important;\n}\n.nova-pill.focus .nova-pill__badge {\n  background: rgba(255, 255, 255, .3) !important;\n  color: #fff !important;\n}\n.nova-season.is-sel,\n.nova-voice.is-sel {\n  background-color: rgba(255, 255, 255, .22) !important;\n  border: 0 !important;\n}\n.nova-season.is-sel.focus,\n.nova-voice.is-sel.focus {\n  background-color: rgba(255, 255, 255, .22) !important;\n  color: #fff !important;\n}\n.nova-voice__q,\n.nova-hero__q,\n.nova-scope .nova-ep .online-prestige__quality {\n  background: rgba(0, 0, 0, .55) !important;\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n  border-radius: .3em !important;\n  box-shadow: none !important;\n  text-shadow: none !important;\n}\n.nova-voice.focus .nova-voice__q {\n  background: rgba(0, 0, 0, .18) !important;\n  color: #000 !important;\n  -webkit-text-fill-color: #000 !important;\n}\n.nova-play {\n  background: rgba(0, 0, 0, .3) !important;\n  color: #fff !important;\n  border-radius: 1em !important;\n  box-shadow: none !important;\n  transition: background-color .2s ease, color .2s ease !important;\n}\n\n.nova-hero.focus .nova-play {\n  background: rgba(0, 0, 0, .3) !important;\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n  box-shadow: 0 0 0 .22em #fff !important;\n}\n.nova-hero.focus .nova-play {\n  transform: none !important;\n  box-shadow: none !important;\n}\n.nova-hero {\n  border: 0 !important;\n  transition: none !important;\n}\n.nova-hero.focus {\n  transform: none !important;\n  box-shadow: 0 0 0 .3em #fff !important;\n}\n.nova-hero__scrim {\n  background:\n    linear-gradient(0deg, rgba(8, 9, 16, .98), rgba(8, 9, 16, .4) 48%, rgba(8, 9, 16, .03) 78%),\n    linear-gradient(90deg, rgba(8, 9, 16, .72), transparent 62%) !important;\n}\n.nova-chip::before {\n  background: #fff !important;\n  box-shadow: none !important;\n}\n.nova-hero__prog > i { background: #fff !important; }\n.nova-scope .online-prestige--full.nova-ep {\n  position: relative;\n  border: 0 !important;\n  background: rgba(255, 255, 255, .1) !important;\n  box-shadow: none !important;\n  transition: background-color .2s ease !important;\n}\n.nova-scope .online-prestige--full.nova-ep.focus {\n  background: rgba(255, 255, 255, .16) !important;\n  border: 0 !important;\n  transform: none !important;\n  box-shadow: none !important;\n}\n.nova-scope .online-prestige--full.nova-ep.focus::before {\n  display: none !important;\n}\n\n.nova-scope .online-prestige--full.nova-ep.focus::after {\n  display: block !important;\n  content: '' !important;\n  position: absolute !important;\n  left: 0 !important;\n  top: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  width: auto !important;\n  height: auto !important;\n  margin: 0 !important;\n  border: .22em solid #fff !important;\n  border-radius: 1.1em !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  pointer-events: none !important;\n  z-index: 5 !important;\n}\n.nova-scope .nova-ep .online-prestige__episode-number {\n  background: rgba(235, 236, 240, .92) !important;\n  color: #14151c !important;\n  -webkit-text-fill-color: #14151c !important;\n  border-radius: .4em !important;\n  padding: .18em .5em !important;\n  font-weight: 700 !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .45) !important;\n}\n\n.nova-actors__track {\n  transition: transform .25s ease;\n}\n\n.nova-pills {\n  flex-wrap: nowrap !important;\n  align-items: center !important;\n  overflow: hidden !important;\n}\n\n.nova-pills > .nova-pill {\n  flex: 0 1 auto !important;\n  min-width: 0 !important;\n}\n\n.nova-pill__v {\n  max-width: 11em !important;\n}\n\n.nova-scope .nova-ep .nova-ep__play > svg,\n.nova-ep__play > svg {\n  width: 1.5em !important;\n  height: 1.5em !important;\n}\n\n.nova-scope .nova-ep .nova-ep__play,\n.nova-ep__play {\n  opacity: 0 !important;\n}\n\n.nova-scope .nova-ep.focus .nova-ep__play,\n.nova-ep.focus .nova-ep__play {\n  opacity: .85 !important;\n}\n\n.nova-scope .nova-ep .nova-ep__scrim,\n.nova-ep__scrim {\n  background: linear-gradient(0deg, rgba(0, 0, 0, .35), transparent 60%) !important;\n}\n\n.nova-hero,\n.nova-hero *,\n.nova-pills,\n.nova-pills *,\n.nova-seasons,\n.nova-seasons *,\n.nova-voices,\n.nova-voices *,\n.nova-actors,\n.nova-actors *,\n.nova-info,\n.nova-info *,\n.nova-note,\n.nova-empty,\n.nova-empty *,\n.nova-scope .nova-ep,\n.nova-scope .nova-ep * {\n  font-family: inherit !important;\n}\n\n.nova-hero__title,\n.nova-ep__title,\n.nova-scope .nova-ep .online-prestige__title,\n.nova-play,\n.nova-pill__v,\n.nova-season,\n.nova-voice__name,\n.nova-actor__name,\n.nova-empty__main,\n.nova-empty__btn {\n  font-weight: 700 !important;\n}\n\n.nova-hero__meta,\n.nova-info__v,\n.nova-chip {\n  font-weight: 400 !important;\n}\n\n.nova-note,\n.nova-pill__k,\n.nova-info__k {\n  font-weight: 600 !important;\n  letter-spacing: .04em !important;\n}\n\n.nova-hero__q,\n.nova-voice__q,\n.nova-ep__badge,\n.nova-ep__resume,\n.nova-pill__badge,\n.nova-scope .nova-ep .online-prestige__quality,\n.nova-scope .nova-ep .online-prestige__episode-number {\n  font-weight: 700 !important;\n  letter-spacing: 0 !important;\n}\n\n.nova-hero__title {\n  letter-spacing: 0 !important;\n}\n.nova-scope .nova-ep .online-prestige__timeline > .time-line > div {\n  background: #fff !important;\n}\n.nova-scope .online-prestige--full.nova-as-voice {\n  background: rgba(255, 255, 255, .1) !important;\n  border: 0 !important;\n}\n.nova-scope .online-prestige--full.nova-as-voice.focus {\n  background: rgba(255, 255, 255, .1) !important;\n  box-shadow: 0 0 0 .22em #fff !important;\n}\n.nova-scope .online-prestige--full.nova-as-voice.focus .online-prestige__title {\n  color: #fff !important;\n  -webkit-text-fill-color: #fff !important;\n}\n.nova-scope .online-prestige--full.nova-as-voice.focus .online-prestige__quality {\n  background: rgba(0, 0, 0, .55) !important;\n  color: #fff !important;\n}\n.nova-scope .online-prestige--full.nova-as-voice.focus::after { display: none !important; }\n.nova-scope .online-prestige--full.nova-as-voice.nova-is-sel {\n  background: rgba(255, 255, 255, .22) !important;\n}\n\n.nova-voice__q:empty { display: none !important; }\n\n.nova-voices {\n  padding: .2em .2em 1.1em !important;\n}\n.view--nova {\n  background: rgba(0, 0, 0, .3) !important;\n  border: 0 !important;\n  border-radius: 1em !important;\n  color: #fff !important;\n  box-shadow: none !important;\n  transform: none !important;\n  transition: background-color .2s ease, color .2s ease !important;\n}\n.view--nova .nova-btn__ico,\n.view--nova span,\n.view--nova .full-start__button-text {\n  color: #fff !important;\n  letter-spacing: normal !important;\n}\n.view--nova.focus {\n  background: #fff !important;\n  box-shadow: none !important;\n  transform: none !important;\n}\n.view--nova.focus .nova-btn__ico,\n.view--nova.focus span,\n.view--nova.focus .full-start__button-text { color: #000 !important; }\n.nova-ep__badge {\n  background: rgba(235, 236, 240, .92) !important;\n  color: #14151c !important;\n  -webkit-text-fill-color: #14151c !important;\n  border-radius: .4em !important;\n  box-shadow: 0 .2em .6em rgba(0, 0, 0, .45) !important;\n}\n.nova-ep__mark,\n.nova-scope .nova-ep .online-prestige__viewed {\n  background: #fff !important;\n  color: #000 !important;\n  box-shadow: none !important;\n}\n.nova-ep__resume {\n  background: #fff !important;\n  color: #000 !important;\n}\n.nova-actor.focus {\n  background: rgba(255, 255, 255, .1) !important;\n  transform: none !important;\n}\n.nova-actor.focus .nova-actor__ava {\n  box-shadow: 0 0 0 .12em #fff !important;\n}\n.nova-actor {\n  border-radius: 1em !important;\n}\n.nova-actor.focus {\n  box-shadow: none !important;\n}\n.nova-empty__btn {\n  background: rgba(255, 255, 255, .1) !important;\n  border: 0 !important;\n  border-radius: 1em !important;\n  color: #fff !important;\n}\n.nova-empty__btn.focus {\n  background: #fff !important;\n  color: #000 !important;\n  box-shadow: none !important;\n}\n.nova-shine:after {\n  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .12), transparent) !important;\n}\n.nova-note::before {\n  background: #fff !important;\n  box-shadow: none !important;\n}\n";
  var NOVA_TPL = {
  "nova_hero": "<div class=\"nova-hero selector\" style=\"background-image:url({art})\"><div class=\"nova-hero__scrim\"></div><div class=\"nova-hero__content\"><div class=\"nova-hero__title\">{title}</div><div class=\"nova-hero__meta\"><span class=\"nova-hero__q\">{quality}</span><span>{meta}</span></div><div class=\"nova-hero__chips\">{chips}</div><div class=\"nova-hero__desc\">{desc}</div><div class=\"nova-hero__cta\"><span class=\"nova-play\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M6 4l14 8-14 8V4z\" fill=\"currentColor\"/></svg>{playlabel}</span><span class=\"nova-hero__voice\">{voice}</span></div></div><div class=\"nova-hero__prog\"><i style=\"width:{progress}%\"></i></div></div>",
  "nova_episode": "<div class=\"nova-ep selector\"><div class=\"nova-ep__art\" style=\"background-image:url({still})\"><span class=\"nova-ep__badge\">{num}</span><span class=\"nova-ep__mark\">{mark}</span><span class=\"nova-ep__scrim\"></span><span class=\"nova-ep__play\"><svg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M6 4l14 8-14 8V4z\" fill=\"currentColor\"/></svg></span><span class=\"nova-ep__prog\"><i style=\"width:{progress}%\"></i></span></div><div class=\"nova-ep__body\"><div class=\"nova-ep__top\"><div class=\"nova-ep__title\">{title}</div><span class=\"nova-ep__resume\">{resume}</span><div class=\"nova-ep__time\">{time}</div></div><div class=\"nova-ep__sub\">{sub}</div></div></div>",
  "nova_voice": "<div class=\"nova-voice selector\"><span class=\"nova-voice__q\">{quality}</span><span class=\"nova-voice__name\">{name}</span></div>",
  "nova_season": "<div class=\"nova-season selector\">{title}</div>",
  "nova_actor": "<div class=\"nova-actor selector\"><div class=\"nova-actor__ava\" style=\"background-image:url({img})\"></div><div class=\"nova-actor__name\">{name}</div><div class=\"nova-actor__role\">{role}</div></div>"
};

  var STORAGE_KEY = 'nova_skin_enabled';
  var credits = {};
  var filters = [];
  var observer = null;
  var drawing = false;

  function enabled() {
    try {
      return Lampa.Storage.get(STORAGE_KEY, 'true') !== false;
    } catch (e) {
      return true;
    }
  }

  function esc(value) {
    return ('' + (value == null ? '' : value)).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  function digits(value) {
    var m = ('' + (value == null ? '' : value)).match(/\d+/);
    return m ? m[0] : '';
  }

  function image(path, size) {
    if (!path) return '';
    if (/^https?:/.test(path)) return path;
    try {
      return Lampa.TMDB.image('t/p/' + (size || 'w1280') + path);
    } catch (e) {
      return '';
    }
  }

  function year(movie) {
    return ((movie.release_date || movie.first_air_date || '') + '').slice(0, 4);
  }

  function runtime(movie) {
    var mins = parseInt(movie.runtime || (movie.episode_run_time || [])[0] || 0, 10);
    if (!mins) return '';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return h ? h + 'ч' + (m ? ' ' + m + 'м' : '') : m + 'м';
  }

  function meta(movie, serial) {
    var parts = [];
    var y = year(movie);
    if (y) parts.push(y);
    var rate = parseFloat(movie.vote_average || 0);
    if (rate) parts.push(rate.toFixed(1));
    var r = runtime(movie);
    if (r) parts.push(r);
    if (serial && movie.number_of_seasons) parts.push(movie.number_of_seasons + ' сез.');
    return esc(parts.join('  ·  '));
  }

  function chips(movie) {
    var out = [];
    (movie.genres || []).slice(0, 3).forEach(function (g) {
      if (g && g.name) out.push('<span class="nova-chip">' + esc(g.name) + '</span>');
    });
    return out.join('');
  }

  function description(movie) {
    return esc(('' + (movie.overview || movie.description || '')).replace(/\s+/g, ' ').trim());
  }

  function qualityLabel(text) {
    text = ('' + (text == null ? '' : text)).trim();
    if (!text) return '';
    var m = text.match(/\d{3,4}/);
    if (!m) return text.toUpperCase().slice(0, 12);
    var n = parseInt(m[0], 10);
    if (n >= 2160) return '4K';
    if (n >= 1080) return 'FHD';
    if (n >= 720) return 'HD';
    return n + 'p';
  }

  function movieProgress(movie) {
    try {
      var hash = Lampa.Utils.hash(movie.original_title || movie.original_name || movie.title || movie.name);
      var view = Lampa.Timeline.view(hash);
      return Math.max(0, Math.min(100, parseFloat(view && view.percent) || 0));
    } catch (e) {
      return 0;
    }
  }

  function addStyle() {
    var old = document.getElementById('nova-skin-style');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var style = document.createElement('style');
    style.id = 'nova-skin-style';
    style.textContent = NOVA_CSS;
    (document.body || document.head).appendChild(style);
  }

  function addTemplates() {
    if (typeof Lampa === 'undefined' || !Lampa.Template || !Lampa.Template.add) return;
    for (var name in NOVA_TPL) Lampa.Template.add(name, NOVA_TPL[name]);
  }

  function hookFilter() {
    if (!Lampa.Filter || Lampa.Filter.nova_wrapped) return;
    var real = Lampa.Filter;

    function Wrapped(params) {
      var inst = new real(params);
      var setter = inst.set;
      inst.nova_sets = {};
      inst.set = function (type, items) {
        inst.nova_sets[type] = items;
        return setter.apply(inst, arguments);
      };
      filters.unshift(inst);
      if (filters.length > 4) filters.pop();
      return inst;
    }

    Wrapped.nova_wrapped = true;
    Lampa.Filter = Wrapped;
  }

  function activeFilter(root) {
    for (var i = 0; i < filters.length; i++) {
      try {
        if ($.contains(root[0], filters[i].render()[0])) return filters[i];
      } catch (e) {}
    }
    return filters[0] || null;
  }

  function hookController() {
    if (!Lampa.Controller || Lampa.Controller.nova_wrapped) return;
    var add = Lampa.Controller.add;

    Lampa.Controller.add = function (name, object) {
      if (name === 'content' && object && typeof object.up === 'function' && !object.nova_up) {
        var original = object.up;
        object.nova_up = true;
        object.up = function () {
          if (novaUp()) return;
          return original.apply(this, arguments);
        };
      }
      if (name === 'content' && object && typeof object.right === 'function' && !object.nova_right) {
        var right = object.right;
        object.nova_right = true;
        object.right = function () {
          try {
            if ($('.nova-scope').length) {
              var nav = window.Navigator;
              if (nav && nav.canmove('right')) return nav.move('right');
              return;
            }
          } catch (e) {}
          return right.apply(this, arguments);
        };
      }
      return add.apply(Lampa.Controller, arguments);
    };

    Lampa.Controller.nova_wrapped = true;
  }

  function novaUp() {
    try {
      var scope = $('.nova-scope');
      if (!scope.length) return false;
      var focused = scope.find('.focus').first();
      if (!focused.length) return false;
      if (focused.closest('.nova-hero').length || focused.closest('.explorer__files-head').length) {
        Lampa.Controller.toggle('head');
        return true;
      }
    } catch (e) {}
    return false;
  }

  function scrollFollow(element) {
    try {
      var node = $(element);
      var body = node.closest('.scroll__body');
      var content = node.closest('.scroll__content');
      var box = node.closest('.scroll');
      if (!body.length || !content.length) return;

      var offset = body[0].getBoundingClientRect().top - node[0].getBoundingClientRect().top;
      var limit = Math.min(0, (box.height() || content.height()) - body[0].offsetHeight);
      var position = Math.max(limit, Math.min(0, offset));

      var style = body.attr('style') || '';
      if (/translate/.test(style) || box.hasClass('scroll--screen')) {
        body[0].style['-webkit-transform'] = 'translate3d(0px, ' + Math.round(position) + 'px, 0px)';
        body[0].style.transform = 'translate3d(0px, ' + Math.round(position) + 'px, 0px)';
      } else {
        box[0].scrollTop = -position;
      }
    } catch (e) {}
  }

  function bind(element, enter) {
    element.on('hover:focus', function (e) {
      scrollFollow(e.target);
    });
    element.on('hover:enter', function () {
      try {
        enter();
      } catch (e) {}
    });
    return element;
  }

  function refreshCollection() {
    try {
      if (Lampa.Controller.enabled().name !== 'content') return;
      Lampa.Controller.toggle('content');
    } catch (e) {}
  }

  function groups(filter) {
    var out = { voice: null, season: null, sort: null };
    if (!filter || !filter.nova_sets) return out;

    (filter.nova_sets.filter || []).forEach(function (group) {
      if (group && group.stype === 'voice') out.voice = group;
      if (group && group.stype === 'season') out.season = group;
    });

    var sort = filter.nova_sets.sort || [];
    if (sort.length) out.sort = sort;

    return out;
  }

  function chooseFilter(ctx, stype, index) {
    try {
      if (typeof ctx.filter.onSelect !== 'function') return;
      ctx.filter.onSelect('filter', { stype: stype }, { index: index });
    } catch (e) {}
  }

  function chooseSource(ctx, item) {
    try {
      if (typeof ctx.filter.onSelect !== 'function') return;
      ctx.filter.onSelect('sort', item);
    } catch (e) {}
  }

  function backToContent() {
    try {
      Lampa.Controller.toggle('content');
    } catch (e) {}
  }

  function openGroup(ctx, group, title) {
    if (!group || !group.items || !group.items.length) return false;
    var items = [];

    group.items.forEach(function (item, index) {
      items.push({
        title: item.title,
        selected: !!item.selected,
        index: typeof item.index === 'number' ? item.index : index
      });
    });

    try {
      Lampa.Select.show({
        title: title,
        items: items,
        onBack: backToContent,
        onSelect: function (item) {
          if (item.selected) return backToContent();
          chooseFilter(ctx, group.stype, item.index);
        }
      });
    } catch (e) {
      return false;
    }
    return true;
  }

  function openSources(ctx, list, title) {
    if (!list || !list.length) return false;
    var items = [];

    list.forEach(function (item) {
      if (item.ghost) return;
      items.push({
        title: item.title,
        source: item.source,
        selected: !!item.selected
      });
    });

    try {
      Lampa.Select.show({
        title: title,
        items: items,
        onBack: backToContent,
        onSelect: function (item) {
          if (item.selected) return backToContent();
          chooseSource(ctx, item);
        }
      });
    } catch (e) {
      return false;
    }
    return true;
  }

  function pill(key, value, count, enter) {
    var html = $(
      '<div class="nova-pill selector">' +
      '<div class="nova-pill__k">' + esc(key) + '</div>' +
      '<div class="nova-pill__v">' + esc(value) + '</div>' +
      (count > 1 ? '<div class="nova-pill__badge">' + count + '</div>' : '') +
      '</div>'
    );
    return bind(html, enter);
  }

  function seasonNumber(ctx) {
    var group = ctx.groups.season;
    if (group && group.subtitle) return digits(group.subtitle) || '';
    if (ctx.movie.number_of_seasons) return '1';
    return '';
  }

  function firstQuality(ctx) {
    var node = ctx.body.find('.online-prestige__quality').first();
    return node.length ? node.text().trim() : '';
  }

  function buildHero(ctx) {
    var movie = ctx.movie;
    var progress = ctx.serial ? 0 : movieProgress(movie);
    var voice = ctx.groups.voice ? ctx.groups.voice.subtitle : '';

    var state = [];
    if (ctx.serial) {
      var season = seasonNumber(ctx);
      if (season) state.push('Сезон ' + season);
    }
    if (voice) state.push(voice);

    var html = $(Lampa.Template.get('nova_hero', {
      art: image(movie.backdrop_path || movie.poster_path, 'w1280'),
      quality: esc(qualityLabel(firstQuality(ctx)) || 'AUTO'),
      title: esc(movie.title || movie.name || ''),
      meta: meta(movie, ctx.serial),
      chips: chips(movie),
      desc: description(movie),
      playlabel: progress > 0 ? 'Продолжить' : 'Смотреть',
      voice: esc(state.join('  ·  ')),
      progress: progress
    }));

    return bind(html, function () {
      var card = ctx.body.find('.online-prestige--full').first();
      if (card.length) card.trigger('hover:enter');
    });
  }

  function buildPills(ctx) {
    var row = $('<div class="nova-pills"></div>');
    var sort = ctx.groups.sort;
    var voice = ctx.groups.voice;
    var season = ctx.groups.season;

    if (sort) {
      var current = null;
      sort.forEach(function (item) {
        if (item.selected) current = item;
      });
      if (current) {
        row.append(pill('Источник', current.title, sort.length, function () {
          openSources(ctx, sort, 'Источник');
        }));
      }
    }

    if (voice && voice.items && voice.items.length) {
      row.append(pill('Озвучка', voice.subtitle || voice.items[0].title, voice.items.length, function () {
        openGroup(ctx, voice, 'Озвучка');
      }));
    }

    if (ctx.serial && season && season.items && season.items.length) {
      row.append(pill('Сезон', season.subtitle || season.items[0].title, season.items.length, function () {
        openGroup(ctx, season, 'Сезон');
      }));
    }

    return row.children().length ? row : null;
  }

  function voiceParts(title) {
    var text = ('' + (title == null ? '' : title)).trim();
    var at = text.indexOf('|');
    if (at > 0 && at < 10) {
      return { q: text.slice(0, at).trim(), name: text.slice(at + 1).trim() };
    }
    return { q: '', name: text };
  }

  function buildVoices(ctx) {
    var group = ctx.groups.voice;
    if (!ctx.serial || !group || !group.items || group.items.length < 2) return null;

    var row = $('<div class="nova-voices"></div>');

    group.items.forEach(function (item, index) {
      var parts = voiceParts(item.title);
      var chip = $(Lampa.Template.get('nova_voice', {
        quality: esc(parts.q),
        name: esc(parts.name)
      }));
      if (item.selected) chip.addClass('is-sel');
      bind(chip, function () {
        if (item.selected) return;
        chooseFilter(ctx, 'voice', typeof item.index === 'number' ? item.index : index);
      });
      row.append(chip);
    });

    return row;
  }

  function loadCast(movie, serial, done) {
    var id = movie && movie.id;
    if (!id) return done([]);
    if (credits[id]) return done(credits[id]);
    try {
      var lang = Lampa.Storage.get('language', 'ru');
      var url = Lampa.TMDB.api((serial ? 'tv' : 'movie') + '/' + id + '/credits?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
      var net = new Lampa.Reguest();
      net.silent(url, function (json) {
        credits[id] = (json && json.cast) || [];
        done(credits[id]);
      }, function () {
        credits[id] = [];
        done([]);
      });
    } catch (e) {
      done([]);
    }
  }

  function openActor(person) {
    try {
      Lampa.Activity.push({
        url: '',
        component: 'actor',
        id: person.id,
        job: ('' + (person.known_for_department || 'acting')).toLowerCase(),
        source: 'tmdb',
        page: 1
      });
    } catch (e) {}
  }

  function shiftTrack(track, target) {
    try {
      var width = track.parent().width();
      var node = $(target);
      var left = node[0].offsetLeft;
      var right = left + node.outerWidth();
      var shift = parseFloat(track.attr('data-shift')) || 0;
      if (right - shift > width) shift = right - width + 20;
      if (left - shift < 0) shift = Math.max(0, left - 20);
      track.attr('data-shift', shift);
      track.css('transform', 'translate3d(-' + shift + 'px,0,0)');
    } catch (e) {}
  }

  function buildActors(cast) {
    var wrap = $('<div class="nova-actors"></div>');
    var track = $('<div class="nova-actors__track"></div>');

    cast.slice(0, 20).forEach(function (person) {
      if (!person || !person.name) return;
      var card = $(Lampa.Template.get('nova_actor', {
        img: image(person.profile_path, 'w300'),
        name: esc(person.name),
        role: esc(person.character || '')
      }));
      card.on('hover:focus', function (e) {
        shiftTrack(track, e.target);
        scrollFollow(e.target);
      });
      card.on('hover:enter', function () {
        openActor(person);
      });
      track.append(card);
    });

    if (!track.children().length) return null;
    return wrap.append(track);
  }

  function infoItem(key, value) {
    return '<div class="nova-info__it"><div class="nova-info__k">' + esc(key) + '</div>' +
      '<div class="nova-info__v">' + esc(value) + '</div></div>';
  }

  function buildInfo(ctx) {
    var movie = ctx.movie;
    var parts = [];

    var y = year(movie);
    if (y) parts.push(infoItem('Год', y));

    var rates = [];
    var tmdb = parseFloat(movie.vote_average || 0);
    if (tmdb) rates.push('TMDB ' + tmdb.toFixed(1));
    var imdb = parseFloat(movie.imdb_rating || 0);
    if (imdb) rates.push('IMDb ' + imdb.toFixed(1));
    var kp = parseFloat(movie.kp_rating || 0);
    if (kp) rates.push('КП ' + kp.toFixed(1));
    if (rates.length) parts.push(infoItem('Рейтинг', rates.join(' · ')));

    var quality = firstQuality(ctx);
    if (quality) parts.push(infoItem('Качество', quality));

    if (movie.original_language) parts.push(infoItem('Язык оригинала', ('' + movie.original_language).toUpperCase()));

    var genres = [];
    (movie.genres || []).forEach(function (g) {
      if (g && g.name) genres.push(g.name);
    });
    if (genres.length) parts.push(infoItem('Жанр', genres.slice(0, 3).join(', ')));

    if (!parts.length) return null;
    return $('<div class="nova-info">' + parts.join('') + '</div>');
  }

  function note(text) {
    return $('<div class="nova-note nova-made"></div>').text(text);
  }

  function decorateCards(ctx) {
    var season = seasonNumber(ctx);

    ctx.body.find('.online-prestige--full').each(function () {
      var card = $(this);
      if (card.hasClass('nova-ep') || card.hasClass('nova-as-voice')) return;

      var number = card.find('.online-prestige__episode-number');

      if (!number.length && !ctx.serial) {
        card.addClass('nova-as-voice');
        var picked = ctx.groups.voice ? ctx.groups.voice.subtitle : '';
        if (picked && card.find('.online-prestige__title').text().trim() === ('' + picked).trim()) {
          card.addClass('nova-is-sel');
        }
        return;
      }

      card.addClass('nova-ep');

      var art = card.find('.online-prestige__img');
      if (art.length) {
        card.find('.online-prestige__timeline').appendTo(art);
        if (!art.find('.nova-ep__scrim').length) {
          art.append('<div class="nova-ep__scrim"></div>');
          art.append('<div class="nova-ep__play"><svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg></div>');
        }
      }

      if (number.length && season) {
        var num = digits(number.text());
        if (num) number.text('S' + season + 'E' + parseInt(num, 10));
      }
    });
  }

  function hideNative(ctx) {
    var head = ctx.root.find('.explorer__files-head');
    head.attr('aria-hidden', 'true');
    head.find('.selector').attr('aria-hidden', 'true');
  }

  function context() {
    var current = null;
    try {
      current = Lampa.Activity.active();
    } catch (e) {}
    if (!current || !current.activity) return null;

    var root;
    try {
      root = current.activity.render();
    } catch (e) {
      return null;
    }
    if (!root || !root.length) return null;
    if (!root.hasClass('explorer')) root = root.find('.explorer').first();
    if (!root.length) return null;

    var body = root.find('.explorer__files-body .scroll__body').first();
    if (!body.length) return null;
    if (!body.find('.online-prestige').length) return null;
    if (body.find('.torrent-item').length) return null;

    var movie = current.movie || current.card;
    if (!movie) return null;

    var filter = activeFilter(root);

    return {
      root: root,
      body: body,
      movie: movie,
      serial: movie.name || movie.number_of_seasons ? true : false,
      filter: filter,
      groups: groups(filter)
    };
  }

  function draw() {
    if (drawing || !enabled()) return;

    var ctx = context();
    if (!ctx) return;

    drawing = true;

    try {
      ctx.root.addClass('nova-scope');
      hideNative(ctx);
      decorateCards(ctx);

      if (!ctx.body.find('.nova-hero').length) {
        var tail = [];

        var voices = buildVoices(ctx);
        if (voices) {
          tail.push(note('ОЗВУЧКА'));
          tail.push(voices);
        }
        tail.push(note(ctx.serial ? 'СЕРИИ' : 'ОЗВУЧКА'));

        var pills = buildPills(ctx);
        if (pills) tail.unshift(pills);
        tail.unshift(buildHero(ctx));

        for (var i = tail.length - 1; i >= 0; i--) ctx.body.prepend(tail[i]);

        loadCast(ctx.movie, ctx.serial, function (cast) {
          try {
            if (!ctx.body.find('.nova-hero').length) return;
            if (ctx.body.find('.nova-actors').length) return;

            var actors = buildActors(cast);
            if (actors) {
              ctx.body.append(note('В ролях'));
              ctx.body.append(actors);
            }
            var info = buildInfo(ctx);
            if (info) {
              ctx.body.append(note('Информация'));
              ctx.body.append(info);
            }
            if (actors || info) refreshCollection();
          } catch (e) {}
        });

        refreshCollection();
      }
    } catch (e) {}

    drawing = false;
  }

  var timer = null;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(draw, 40);
  }

  function watch() {
    if (!window.MutationObserver) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function settings() {
    try {
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
          name: STORAGE_KEY,
          type: 'trigger',
          default: true
        },
        field: {
          name: 'Скин онлайн-плагинов',
          description: 'Крупный постер, кнопки выбора, актёры и информация'
        },
        onChange: function () {
          try {
            Lampa.Activity.replace();
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function start() {
    if (window.NOVA_VIEW) return;

    try {
      console.log('nova skin', NOVA_BUILD);
    } catch (e) {}

    addStyle();
    addTemplates();
    hookFilter();
    hookController();
    settings();
    watch();

    try {
      Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'start' || e.type === 'archive') schedule();
      });
    } catch (e) {}

    schedule();
  }

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }
})();
