(function() {
  'use strict';

  if (window.nova_skin_z01) return;
  window.nova_skin_z01 = true;

  var STORAGE_KEY = 'nova_skin_enabled';

  function enabled() {
    try { return Lampa.Storage.get(STORAGE_KEY, true) !== false; }
    catch (e) { return true; }
  }

  function heroEnabled() {
    try { return Lampa.Storage.get('nova_skin_hero', true) !== false; }
    catch (e) { return true; }
  }

  function viewMode() {
    try { return Lampa.Storage.get('nova_skin_view', 'list'); }
    catch (e) { return 'list'; }
  }

  function preferredQuality() {
    try { return Lampa.Storage.get('nova_skin_quality', 'auto'); }
    catch (e) { return 'auto'; }
  }

  function esc(v) {
    return ('' + (v == null ? '' : v)).replace(/[&<>"]/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  function image(path, size) {
    if (!path) return '';
    if (/^https?:/.test(path)) return path;
    try { return Lampa.TMDB.image('t/p/' + (size || 'w780') + path); }
    catch (e) { return ''; }
  }

  function isSkaz() {
    try {
      var a = Lampa.Activity.active();
      if (a && a.component && /lampacskaz|onlyskaz/i.test(a.component)) return true;
      if (a && a.activity && a.activity.component && /lampacskaz|onlyskaz/i.test(a.activity.component)) return true;
    } catch (e) {}
    return false;
  }

  function isOnline() {
    try {
      var a = Lampa.Activity.active();
      var comp = (a && a.component) || (a && a.activity && a.activity.component) || '';
      return /lampac|online|filmix|kinopub|rezka|videocdn|collaps/i.test(comp);
    } catch (e) {}
    return false;
  }

  // ==================== CSS ====================
  function addCSS() {
    if (document.getElementById('nova-z01-css')) return;
    var style = document.createElement('style');
    style.id = 'nova-z01-css';
    style.textContent = Z01_CSS + EXTRA_CSS;
    (document.body || document.head).appendChild(style);
  }

  var EXTRA_CSS = '\n' +
    '.nova-z01-scope .explorer__files-head{display:none!important}' +
    '.nova-z01-scope .explorer__left{display:none!important}' +
    '.nova-z01-scope .explorer__files{width:100%!important;left:0!important}' +
    '.nova-z01-scope .online-prestige-watched{display:none!important}' +
    '.nova-z01-scope .online-prestige.focus::after{display:none!important}' +
    '.nova-z01-scope .online-prestige+.online-prestige{margin-top:0!important}' +
    '.nova-z01-scope .torrent-list{padding:0!important}';

  // Z01UI CSS will be injected by build script
  var Z01_CSS = `.z01{padding:0 0 3em 0}.z01 *{-webkit-box-sizing:border-box;box-sizing:border-box}.z01-hero{position:relative;overflow:hidden;-webkit-border-radius:1.2em;border-radius:1.2em;margin-bottom:1.7em;background:rgba(255,255,255,.06);min-height:13em}.z01-hero--compact{min-height:0;margin-bottom:1.3em}.z01-hero--compact .z01-hero__body{padding:1.1em 1.4em;max-width:100%;min-height:5.2em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.z01-hero--compact .z01-hero__actions{margin:0}.z01-hero--compact .z01-btn--main{margin-bottom:0}.z01-hero--compact .z01-hero__season{margin:.6em 0 0 .2em;font-size:.95em;opacity:.55}.z01-hero--compact .z01-hero__progress{position:absolute;left:0;right:0;bottom:0;width:auto;height:.3em;margin:0;-webkit-border-radius:0;border-radius:0}.z01-hero--compact .z01-hero__shade{background:-webkit-linear-gradient(left,rgba(10,11,17,.94) 0%,rgba(10,11,17,.8) 45%,rgba(10,11,17,.3) 100%);background:linear-gradient(90deg,rgba(10,11,17,.94) 0%,rgba(10,11,17,.8) 45%,rgba(10,11,17,.3) 100%)}.z01-hero--compact .z01-hero__progress{margin-top:.8em}.z01-hero__bg{position:absolute;top:0;left:0;right:0;bottom:0}.z01-hero__bg img{display:block;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .35s;transition:opacity .35s}.z01-hero__bg--loaded img{opacity:1}.z01-hero__shade{position:absolute;top:0;left:0;right:0;bottom:0;background:-webkit-linear-gradient(left,rgba(10,11,17,.97) 0%,rgba(10,11,17,.9) 36%,rgba(10,11,17,.45) 68%,rgba(10,11,17,.1) 100%);background:linear-gradient(90deg,rgba(10,11,17,.97) 0%,rgba(10,11,17,.9) 36%,rgba(10,11,17,.45) 68%,rgba(10,11,17,.1) 100%)}.z01-hero__body{position:relative;padding:2.2em;max-width:64%}.z01-hero__title{font-size:2.3em;font-weight:600;line-height:1.15;margin-bottom:.35em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.z01-hero__meta{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:1.1em;margin-bottom:.7em}.z01-hero__meta>*{margin:0 .7em .3em 0;opacity:.8}.z01-hero__meta>.z01-badge{opacity:1}.z01-hero__descr{font-size:1.05em;line-height:1.45;opacity:.65;margin-bottom:1.2em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.z01-hero__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.z01-hero__hint{font-size:1em;line-height:1.5;opacity:.55;margin:0 0 0 1.3em;max-width:24em;padding:.1em .15em;overflow:hidden;white-space:nowrap;-o-text-overflow:ellipsis;text-overflow:ellipsis}.z01-hero__progress{position:relative;height:.3em;width:16em;max-width:100%;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.2);margin-top:.9em;overflow:hidden}.z01-hero__progress .time-line{display:block !important;height:100%;margin:0;background:none}.z01-hero__progress .time-line>div{height:100%;background:#fff}.z01-badge{display:inline-block;padding:.2em .55em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.18);font-size:.78em;font-weight:600;letter-spacing:.04em;line-height:1.4}.z01-btn{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em 1.5em;-webkit-border-radius:2.4em;border-radius:2.4em;background:rgba(255,255,255,.12);font-size:1.15em;white-space:nowrap;margin:0 .8em .5em 0}.z01-btn>svg{width:1.15em;height:1.15em;margin-right:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.z01-btn.focus{background:#fff;color:#000}.z01-btn--main{background:rgba(255,255,255,.82);color:#000}.z01-btn--main.focus{background:#fff;-webkit-box-shadow:0 .25em .9em rgba(0,0,0,.45);box-shadow:0 .25em .9em rgba(0,0,0,.45)}.z01-btn--ghost{background:rgba(255,255,255,.14);font-size:1.05em}.z01-section{margin-bottom:1.1em}.z01-section__title{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:.95em;letter-spacing:.12em;text-transform:uppercase;opacity:.5;margin-bottom:.7em}.z01-section__title:before{content:"";display:inline-block;width:.25em;height:1.1em;background:currentColor;margin-right:.6em;-webkit-border-radius:.2em;border-radius:.2em}.z01-section__body{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.z01-chip{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.55em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .7em .7em 0;font-size:1.05em;white-space:nowrap;max-width:24em}.z01-chip.focus{background:#fff;color:#000}.z01-chip--active{background:rgba(255,255,255,.16);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}.z01-chip--active.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}.z01-chip__idx{font-size:.85em;opacity:.45;margin-right:.55em}.z01-chip__badge{font-size:.7em;font-weight:600;padding:.2em .45em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.2);margin-right:.6em;line-height:1.4}.z01-chip.focus .z01-chip__badge{background:rgba(0,0,0,.12)}.z01-chip--more{opacity:.75}.z01-chip__label{line-height:1.5;padding:.05em .1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis}.z01-chip>svg{width:1em;height:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.z01-chip__label+svg{margin-left:.6em;opacity:.6}.z01-chip>svg:first-child{margin-right:.55em;opacity:.7}.z01-chip--source{font-size:1.15em;padding:.5em 1.1em}.z01-chip--ghost{opacity:.5}.z01-chip--busy .z01-chip__label{opacity:.5}.z01-chip__dot{width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;margin-left:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;background:#4ade80}.z01-chip--checking{opacity:.55}.z01-chip--empty{opacity:.35}.z01-toolbar{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;margin-bottom:1em}.z01-toolbar__label{font-size:.95em;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:0 .9em .7em 0}.z01-toolbar .z01-btn--main{margin:0 1.4em .7em 0;font-size:1.1em;padding:.55em 1.3em}.z01-toolbar .z01-btn__label{max-width:18em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap}.z01-card{position:relative;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.05);margin-bottom:.7em}.z01-card.focus{background:#fff;color:#000}.z01-card__thumb{position:relative;width:10.5em;height:5.9em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;-webkit-border-radius:.5em;border-radius:.5em;overflow:hidden;background:rgba(0,0,0,.35)}.z01-card__thumb img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .3s;transition:opacity .3s}.z01-card__thumb--loaded img{opacity:1}.z01-card__num{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;font-size:1.7em;font-weight:600;color:#fff;text-shadow:0 .05em .2em rgba(0,0,0,.7)}.z01-card__thumb--loaded .z01-card__num{-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end;font-size:1.1em;padding:0 .5em .35em 0}.z01-card__thumb--fallback.z01-card__thumb--loaded img{opacity:.4}.z01-card__thumb--fallback.z01-card__thumb--loaded .z01-card__num{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:1.7em;padding:0}.z01-card__viewed{position:absolute;top:.5em;left:.5em;width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;background:#fff;opacity:.85;-webkit-box-shadow:0 0 0 .16em rgba(0,0,0,.4);box-shadow:0 0 0 .16em rgba(0,0,0,.4)}.z01-card__line{position:absolute;left:0;right:0;bottom:0;height:.28em;background:rgba(0,0,0,.5)}.z01-card__line .time-line{display:block !important;height:100%;margin:0;background:none}.z01-card__line .time-line>div{height:100%;background:#fff}.z01-card__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding:0 1.2em;min-width:1em;overflow:hidden}.z01-card__title{font-size:1.25em;line-height:1.4;margin-bottom:.3em;padding-bottom:.05em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.z01-card__meta{font-size:.95em;line-height:1.45;opacity:.6;padding-bottom:.05em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.z01-card__meta .z01-dot{margin:0 .5em;opacity:.6}.z01-card__match{display:inline-block;margin-top:.4em;padding:.15em .6em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(126,217,150,.2);color:#8fe0a4;font-size:.82em;font-weight:600}.z01-card--match .z01-card__thumb{-webkit-box-shadow:inset 0 0 0 .13em rgba(126,217,150,.75);box-shadow:inset 0 0 0 .13em rgba(126,217,150,.75)}.z01-card__side{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;text-align:right;padding-right:.7em}.z01-card__time{font-size:.95em;opacity:.6;margin-top:.4em}.z01-card--soon{opacity:.45}.z01-card--nav .z01-card__body{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.z01-card--nav .z01-card__body{-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.z01-card--nav .z01-card__title{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;margin-bottom:0}.z01-card--nav .z01-card__meta{width:100%;margin-top:.2em;font-size:.85em}.z01-card__go{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;opacity:.45;padding-left:1em}.z01-card__go>svg{width:1.2em;height:1.2em;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.z01-card--slim{padding:.75em 1.1em}.z01-card--slim .z01-card__thumb{display:none}.z01-card--slim .z01-card__body{padding-left:0}.z01-card--slim .z01-card__title{font-size:1.2em;margin-bottom:0}.z01-card__line--body{position:static;height:.25em;margin-top:.55em;-webkit-border-radius:.2em;border-radius:.2em;background:rgba(255,255,255,.18)}.z01-card.focus .z01-card__line--body{background:rgba(0,0,0,.16)}.z01-card.focus .z01-card__line--body .time-line>div{background:#000}.z01-card--slim .z01-card__line{position:static;height:.25em;margin-top:.5em;-webkit-border-radius:.2em;border-radius:.2em;background:rgba(255,255,255,.16)}.z01-card--slim.focus .z01-card__line{background:rgba(0,0,0,.15)}.z01-card--slim.focus .z01-card__line .time-line>div{background:#000}.z01-list-group{font-size:.9em;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:1.2em 0 .55em .2em}.z01-list-group:first-child{margin-top:0}.z01-card--file .z01-card__thumb{width:4.4em;height:4.4em}.z01-skeleton__row{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.7em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.04);margin-bottom:.7em;-webkit-animation:z01pulse 1.4s infinite;animation:z01pulse 1.4s infinite}.z01-skeleton__thumb{width:10.5em;height:5.9em;-webkit-border-radius:.5em;border-radius:.5em;background:rgba(255,255,255,.08);-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.z01-skeleton__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding-left:1.2em}.z01-skeleton__line{height:1em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.08);margin-bottom:.7em}.z01-skeleton__line--short{width:35%;margin-bottom:0}@-webkit-keyframes z01pulse{0%{opacity:.45}50%{opacity:1}100%{opacity:.45}}@keyframes z01pulse{0%{opacity:.45}50%{opacity:1}100%{opacity:.45}}.z01-loading{padding:1.6em 1.8em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05);margin-bottom:1.2em}.z01-loading__title{font-size:1.4em;margin-bottom:.35em}.z01-loading__text{font-size:1.05em;opacity:.6;margin-bottom:1em}.z01-loading__bar{position:relative;height:.3em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(255,255,255,.14);overflow:hidden}.z01-loading__bar>div{height:100%;width:0;background:#fff;-webkit-transition:width .4s;transition:width .4s}.z01-note{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:2em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05)}.z01-note__main{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;min-width:1em}.z01-note__qr{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;margin-left:2em;text-align:center}.z01-note__qr img{display:block;width:10.5em;height:10.5em;background:#fff;-webkit-border-radius:.6em;border-radius:.6em}.z01-note__qr-caption{font-size:.85em;opacity:.55;margin-top:.6em;max-width:11em}.z01-note__link{margin-top:.5em;font-size:.95em;opacity:.8;word-break:break-all}.z01-note__text a{color:#fff;text-decoration:underline}.z01-note__text img{max-width:9em;height:auto;background:#fff;padding:.4em;-webkit-border-radius:.4em;border-radius:.4em;margin-top:.7em;opacity:1}.z01-note__text ul,.z01-note__text ol{margin:.5em 0;padding-left:1.2em}.z01-note__title{font-size:1.6em;margin-bottom:.4em;line-height:1.25}.z01-note__text{font-size:1.1em;color:rgba(255,255,255,.62);margin-bottom:1.3em;line-height:1.4}.z01-note__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.z01-note__timer{font-weight:600}.z01-group{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.5em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .7em .7em 0;font-size:1.1em;white-space:nowrap}.z01-group.focus{background:#fff;color:#000}.z01-group--open{background:rgba(255,255,255,.2);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}.z01-group--open.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}.z01-group__count{font-size:.78em;opacity:.55;margin-left:.6em}.z01-group__mark{width:.5em;height:.5em;-webkit-border-radius:50%;border-radius:50%;background:#fff;margin-right:.6em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.z01-drop{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding:.3em 0 0 1em;margin:0 0 .7em .3em;-webkit-box-shadow:inset .16em 0 0 rgba(255,255,255,.18);box-shadow:inset .16em 0 0 rgba(255,255,255,.18)}.z01__list--grid{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:0 -.45em}.z01__list--grid .z01-card{display:block;width:25%;margin:0 0 1em 0;padding:0 .45em;background:none}.z01__list--grid .z01-card.focus{background:none;color:inherit}.z01__list--grid .z01-card__thumb{width:100%;height:0;padding-top:56%}.z01__list--grid .z01-card.focus .z01-card__thumb{-webkit-box-shadow:0 0 0 .2em #fff;box-shadow:0 0 0 .2em #fff}.z01__list--grid .z01-card__body{padding:.6em .1em 0 .1em}.z01__list--grid .z01-card__title{font-size:1.1em}.z01__list--grid .z01-card__side{position:absolute;top:.5em;right:.9em;text-align:right}.z01__list--grid .z01-card__time{display:none}.z01__list--grid .z01-card__num{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;padding:.4em 0 0 .55em;font-size:1.2em}.z01-hero__season{font-size:.95em;opacity:.55;margin-top:.8em}@media screen and (max-width:1200px){.z01__list--grid .z01-card{width:33.3333%}}@media screen and (max-width:580px){.z01__list--grid .z01-card{width:50%}.z01-hero__body{max-width:100%;padding:1.3em}.z01-hero__title{font-size:1.7em}.z01-hero__descr{display:none}.z01-hero__shade{background:-webkit-linear-gradient(top,rgba(10,11,17,.55) 0%,rgba(10,11,17,.94) 60%);background:linear-gradient(180deg,rgba(10,11,17,.55) 0%,rgba(10,11,17,.94) 60%)}.z01-card__thumb{width:7em;height:4.4em}.z01-card__side{display:none}.z01-chip{max-width:16em}}  ].join('');
`;

  // ==================== RENDER ====================
  function getContext() {
    if (!enabled() || isSkaz() || !isOnline()) return null;
    var current;
    try { current = Lampa.Activity.active(); } catch (e) { return null; }
    if (!current || !current.activity) return null;

    var root;
    try { root = current.activity.render(); } catch (e) { return null; }
    if (!root || !root.length) return null;
    if (!root.hasClass('explorer')) root = root.find('.explorer').first();
    if (!root.length) return null;

    var body = root.find('.explorer__files-body .scroll__body').first();
    if (!body.length) return null;
    if (!body.find('.online-prestige--full').length && !body.find('.online-prestige--folder').length) return null;
    if (body.find('.torrent-item').length) return null;

    var movie = current.movie || current.card;
    if (!movie) return null;

    return {
      root: root,
      body: body,
      movie: movie,
      serial: !!(movie.name || movie.number_of_seasons)
    };
  }

  function getFilter(root) {
    var sort = [];
    try {
      root.find('.filter--sort .selector').each(function() {
        var el = $(this);
        sort.push({
          title: el.text().trim(),
          selected: el.hasClass('active') || el.hasClass('selected'),
          element: el
        });
      });
    } catch (e) {}
    return sort;
  }

  function buildHero(ctx) {
    if (!heroEnabled()) return null;
    var m = ctx.movie;
    var art = image(m.backdrop_path || m.poster_path, 'w1280');
    var title = m.title || m.name || '';
    var y = ((m.release_date || m.first_air_date || '') + '').slice(0, 4);
    var rate = parseFloat(m.vote_average || 0);
    var genres = [];
    (m.genres || []).slice(0, 3).forEach(function(g) { if (g && g.name) genres.push(g.name); });

    var metaParts = [];
    if (y) metaParts.push('<span>' + y + '</span>');
    if (rate) metaParts.push('<span>' + rate.toFixed(1) + '</span>');
    if (ctx.serial && m.number_of_seasons) metaParts.push('<span>' + m.number_of_seasons + ' сез.</span>');

    var descr = m.overview || '';
    if (descr.length > 200) descr = descr.slice(0, 200) + '...';

    var hero = $(
      '<div class="z01-hero">' +
        '<div class="z01-hero__bg"><img src="' + esc(art) + '" alt=""></div>' +
        '<div class="z01-hero__shade"></div>' +
        '<div class="z01-hero__body">' +
          '<div class="z01-hero__title">' + esc(title) + '</div>' +
          '<div class="z01-hero__meta">' + metaParts.join('') +
            (genres.length ? '<div class="z01-badge">' + esc(genres.join(', ')) + '</div>' : '') +
          '</div>' +
          (descr ? '<div class="z01-hero__descr">' + esc(descr) + '</div>' : '') +
        '</div>' +
      '</div>'
    );

    // Load image
    var img = hero.find('.z01-hero__bg img');
    var i = new Image();
    i.onload = function() { hero.find('.z01-hero__bg').addClass('z01-hero__bg--loaded'); };
    i.src = art;

    return hero;
  }

  function buildToolbar(ctx) {
    var toolbar = $('<div class="z01-toolbar"></div>');
    var sort = getFilter(ctx.root);
    if (!sort.length) return null;

    var current = null;
    sort.forEach(function(s) { if (s.selected) current = s; });
    if (!current && sort.length) current = sort[0];

    toolbar.append($('<div class="z01-toolbar__label"></div>').text('ИСТОЧНИК'));

    sort.forEach(function(item) {
      var chip = $('<div class="z01-chip z01-chip--source selector"></div>');
      chip.append($('<span class="z01-chip__label"></span>').text(item.title));
      if (item.selected) chip.addClass('z01-chip--active');
      chip.on('hover:enter', function() {
        try { item.element.trigger('hover:enter'); } catch (e) {}
      });
      toolbar.append(chip);
    });

    return toolbar;
  }

  function decorateCards(ctx) {
    var serial = ctx.serial;
    var grid = serial && viewMode() === 'grid';

    ctx.body.find('.online-prestige--full').each(function() {
      var card = $(this);
      if (card.hasClass('z01-card')) return;

      card.addClass('z01-card');
      card.removeClass('online-prestige--full');

      // Restructure to z01-card format
      var img = card.find('.online-prestige__img');
      var body = card.find('.online-prestige__body');
      var titleEl = card.find('.online-prestige__title');
      var info = card.find('.online-prestige__info');
      var quality = card.find('.online-prestige__quality');
      var timeline = card.find('.online-prestige__timeline');
      var number = card.find('.online-prestige__episode-number');

      // Wrap img as thumb
      if (img.length) {
        img.addClass('z01-card__thumb');
        var imgTag = img.find('img');
        if (imgTag.length && imgTag.attr('src')) {
          img.addClass('z01-card__thumb--loaded');
        }
        imgTag.on('load', function() { img.addClass('z01-card__thumb--loaded'); });

        // Number overlay
        if (number.length) {
          number.addClass('z01-card__num');
        }

        // Timeline as line
        if (timeline.length) {
          timeline.addClass('z01-card__line');
          timeline.appendTo(img);
        }
      }

      // Body
      if (body.length) {
        body.addClass('z01-card__body');
        if (titleEl.length) titleEl.addClass('z01-card__title');
        if (info.length) {
          info.addClass('z01-card__meta');
          info.find('.online-prestige-split').replaceWith('<span class="z01-dot">\u25cf</span>');
        }
      }

      // Quality as side
      if (quality.length && quality.text().trim()) {
        var side = $('<div class="z01-card__side"></div>');
        var badge = $('<div class="z01-badge"></div>').text(quality.text().trim());
        side.append(badge);
        quality.replaceWith(side);
      } else {
        quality.remove();
      }
    });

    // Apply grid mode
    var list = ctx.body;
    if (grid) list.addClass('z01__list--grid');
    else list.removeClass('z01__list--grid');
  }

  var drawn = null;

  function draw() {
    if (!enabled() || isSkaz()) return;
    var ctx = getContext();
    if (!ctx) return;

    var bodyEl = ctx.body[0];
    if (drawn === bodyEl) {
      // Just decorate new cards
      decorateCards(ctx);
      return;
    }
    drawn = bodyEl;

    // Add scope class
    ctx.root.addClass('nova-z01-scope');

    // Build z01 container
    var z01 = ctx.body.find('.z01');
    if (!z01.length) {
      z01 = $('<div class="z01"></div>');

      var hero = buildHero(ctx);
      if (hero) z01.append(hero);

      var toolbar = buildToolbar(ctx);
      if (toolbar) z01.append(toolbar);

      ctx.body.prepend(z01);
    }

    decorateCards(ctx);
  }

  // ==================== OBSERVER ====================
  var observer = null;
  var timer = null;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function() { draw(); }, 50);
  }

  function attach() {
    if (!window.MutationObserver || !enabled()) return;
    if (observer) observer.disconnect();

    var target;
    try {
      var a = Lampa.Activity.active();
      if (!a || !a.activity) return;
      target = a.activity.render()[0];
    } catch (e) { return; }
    if (!target) return;

    observer = new MutationObserver(function() { schedule(); });
    observer.observe(target, { childList: true, subtree: true });
  }

  // ==================== QUALITY HOOK ====================
  function hookQuality() {
    try {
      if (!Lampa.Player || !Lampa.Player.listener) return;
      Lampa.Player.listener.follow('start', function(data) {
        try {
          if (isSkaz()) return;
          var want = parseInt(preferredQuality(), 10);
          if (!want || !data || !data.quality || typeof data.quality !== 'object') return;
          var keys = Object.keys(data.quality);
          if (!keys.length) return;
          var best = null, bestDiff = Infinity;
          for (var i = 0; i < keys.length; i++) {
            var num = parseInt(keys[i], 10);
            if (isNaN(num)) continue;
            if (num <= want && (want - num) < bestDiff) {
              best = keys[i];
              bestDiff = want - num;
            }
          }
          if (!best) best = keys.sort(function(a, b) { return parseInt(a,10) - parseInt(b,10); })[0];
          if (best && data.quality[best]) data.url = data.quality[best];
        } catch (e) {}
      });
    } catch (e) {}
  }

  // ==================== SETTINGS ====================
  function settings() {
    try {
      Lampa.SettingsApi.addComponent({
        component: 'nova_skin',
        icon: '<svg height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="15" stroke="white" stroke-width="2.5"/><path d="M14 12l10 6-10 6V12z" fill="white"/></svg>',
        name: 'Nova Skin'
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: STORAGE_KEY, type: 'trigger', default: true },
        field: { name: 'Включить Nova Skin', description: 'Z01-стиль для онлайн-плагинов: шапка, чипы источников, карточки серий' },
        onChange: function() { try { Lampa.Activity.replace(); } catch(e){} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_hero', type: 'trigger', default: true },
        field: { name: 'Шапка с кадром', description: 'Крупный бэкдроп сверху с названием и описанием' },
        onChange: function() { try { Lampa.Activity.replace(); } catch(e){} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_view', type: 'select', values: { list: 'Список', grid: 'Плитка' }, default: 'list' },
        field: { name: 'Вид серий', description: 'Список или плитка (4 в ряд)' },
        onChange: function() { try { Lampa.Activity.replace(); } catch(e){} }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_skin',
        param: { name: 'nova_skin_quality', type: 'select', values: { 'auto': 'Авто', '2160': '4K', '1080': '1080p', '720': '720p', '480': '480p' }, default: 'auto' },
        field: { name: 'Качество по умолчанию', description: 'Предпочтительное качество воспроизведения' }
      });
    } catch (e) {}
  }

  // ==================== START ====================
  function start() {
    addCSS();
    settings();
    hookQuality();

    Lampa.Listener.follow('activity', function(e) {
      if (e.type === 'start' || e.type === 'archive') {
        drawn = null;
        setTimeout(function() { attach(); draw(); }, 100);
      }
      if (e.type === 'destroy') {
        drawn = null;
        if (observer) observer.disconnect();
      }
    });

    Lampa.Controller.listener.follow('toggle', function(e) {
      if (e.name === 'content') schedule();
    });
  }

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function(e) {
      if (e.type === 'ready') start();
    });
  }
})();
