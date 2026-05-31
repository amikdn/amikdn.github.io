(function () {
    'use strict';

    function addStyles() {
        var baseStyle = [
            '.player-video__overlay{display:none;background:-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0.5)),color-stop(53%,rgba(0,0,0,0.3)),to(rgba(11,13,16,0.8)));background:-webkit-linear-gradient(top,rgba(0,0,0,0.5) 0,rgba(0,0,0,0.3) 53%,rgba(11,13,16,0.8) 100%);background:-moz-linear-gradient(top,rgba(0,0,0,0.5) 0,rgba(0,0,0,0.3) 53%,rgba(11,13,16,0.8) 100%);background:-o-linear-gradient(top,rgba(0,0,0,0.5) 0,rgba(0,0,0,0.3) 53%,rgba(11,13,16,0.8) 100%);background:linear-gradient(to bottom,rgba(0,0,0,0.5) 0,rgba(0,0,0,0.3) 53%,rgba(11,13,16,0.8) 100%);position:absolute;top:0;left:0;width:100%;height:100%}',
            '.player:not(.iptv) .player-panel,.player:not(.iptv) .player-info,.player:not(.iptv) .player-footer{background:transparent !important;-webkit-backdrop-filter:unset !important;backdrop-filter:unset !important}',
            '.player:not(.iptv) .player-panel__body,.player:not(.iptv) .player-info__body,.player:not(.iptv) .player-footer__body{padding:0}',
            '.player:not(.iptv) .player-footer__row{padding:0}',
            '.player:not(.iptv) .head-backward{display:none !important}',
            '.player:not(.iptv) .player-info__body{padding-left:0 !important;position:relative}',
            '.player:not(.iptv) .player-info__name{font-size:1.2em;text-shadow:0 0 .2em rgba(0,0,0,0.5)}',
            '.player:not(.iptv) .player-info__title{font-size:2em;font-weight:600;line-height:1.4;width:60%;text-shadow:0 0 .2em rgba(0,0,0,0.5);overflow:hidden;-o-text-overflow:\'.\';text-overflow:\'.\';display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}',
            '.player:not(.iptv) .player-info__values{text-shadow:0 0 .2em rgba(0,0,0,0.5)}',
            '.player:not(.iptv) .player-info__values .value--name span{font-weight:600}',
            '.player:not(.iptv) .player-info__time{position:absolute;top:.5em;right:0}',
            '.player:not(.iptv) .player-panel .button{padding:.9em;width:3em;height:3em}',
            '.player:not(.iptv) .player-panel .button.focus{animation:animation-button-focus .05s}',
            '.player:not(.iptv) .player-panel .button.animate-trigger-enter{-webkit-animation:animation-trigger-enter .2s forwards;-moz-animation:animation-trigger-enter .2s forwards;-o-animation:animation-trigger-enter .2s forwards;animation:animation-trigger-enter .2s forwards}',
            '.player:not(.iptv) .player-panel .button>svg{width:1.2em;height:1.2em}',
            '.player:not(.iptv) .player-panel .button+.button{margin-left:0}',
            '.player:not(.iptv) .player-panel__playpause{margin:0;padding:1em !important}',
            '.player:not(.iptv) .player-panel__playpause:not(.focus){background:rgba(255,255,255,0.1)}',
            '.player:not(.iptv) .player-panel__quality{-webkit-border-radius:5em !important;border-radius:5em !important;padding:0 1em !important}',
            '.player:not(.iptv) .player-panel__timeline{margin-bottom:1em}',
            '.player:not(.iptv) .player-panel__timeline:not(.focus) .player-panel__position>div::after{display:none}',
            '.player:not(.iptv) .player-panel__line-one{margin-bottom:1em;position:relative;z-index:2;text-shadow:0 0 .2em rgba(0,0,0,0.5)}',
            '.player:not(.iptv) .player-panel__box-buttons{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;background:rgba(255,255,255,0.1);-webkit-border-radius:4em;border-radius:4em}',
            '.player:not(.iptv) .player-panel__box-buttons+.player-panel__box-buttons{margin-left:.5em}',
            '.player:not(.iptv) .player-panel__next,.player:not(.iptv) .player-panel__prev{padding:1.1em !important}',
            '.player:not(.iptv) .player-panel__next>svg,.player:not(.iptv) .player-panel__prev>svg{width:.8em;height:.8em}',
            '.player:not(.iptv) .player-panel__playlist{text-align:center}',
            '.player:not(.iptv) .player-panel__playlist>svg{width:1em !important}',
            '.player:not(.iptv) .player-video__paused,.player:not(.iptv) .player-video__loader{background-color:rgba(255,255,255,0.1)}',
            '.player:not(.iptv) .player-info__values .value--size span{background:rgba(255,255,255,0.2);-webkit-border-radius:1em;border-radius:1em;padding:0.15em 0.6em}',
            '.player-info__error{margin:1.5em 0 0 .5em;font-size:1.1em;opacity:.85}',
            '.player:not(.iptv).player--panel-visible .player-video__overlay{display:block;-webkit-animation:animation-opacity .3s;-moz-animation:animation-opacity .3s;-o-animation:animation-opacity .3s;animation:animation-opacity .3s}',
            '.normalization{background:rgba(255,255,255,0.1);-webkit-border-radius:1em;border-radius:1em}',
            '.normalization canvas{-webkit-border-radius:1em;border-radius:1em}',
            'body.platform--browser .player:not(.iptv) .player-panel__box-buttons,body.platform--browser .player:not(.iptv) .player-panel__playpause:not(.focus),body.platform--browser .player:not(.iptv) .player-info__values .value--size span,body.platform--nw .player:not(.iptv) .player-panel__box-buttons,body.platform--nw .player:not(.iptv) .player-panel__playpause:not(.focus),body.platform--nw .player:not(.iptv) .player-info__values .value--size span,body.glass--style.platform--apple .player:not(.iptv) .player-panel__box-buttons,body.glass--style.platform--apple .player:not(.iptv) .player-panel__playpause:not(.focus),body.glass--style.platform--apple .player:not(.iptv) .player-info__values .value--size span,body.glass--style.platform--apple_tv .player:not(.iptv) .player-panel__box-buttons,body.glass--style.platform--apple_tv .player:not(.iptv) .player-panel__playpause:not(.focus),body.glass--style.platform--apple_tv .player:not(.iptv) .player-info__values .value--size span,body.glass--style.platform--android .player:not(.iptv) .player-panel__box-buttons,body.glass--style.platform--android .player:not(.iptv) .player-panel__playpause:not(.focus),body.glass--style.platform--android .player:not(.iptv) .player-info__values .value--size span{-webkit-backdrop-filter:blur(1em);backdrop-filter:blur(1em)}',
            'body.platform--browser .normalization,body.platform--browser .player-video__paused,body.platform--browser .player-video__loader,body.platform--nw .normalization,body.platform--nw .player-video__paused,body.platform--nw .player-video__loader,body.glass--style.platform--apple .normalization,body.glass--style.platform--apple .player-video__paused,body.glass--style.platform--apple .player-video__loader,body.glass--style.platform--apple_tv .normalization,body.glass--style.platform--apple_tv .player-video__paused,body.glass--style.platform--apple_tv .player-video__loader,body.glass--style.platform--android .normalization,body.glass--style.platform--android .player-video__paused,body.glass--style.platform--android .player-video__loader{background-color:rgba(255,255,255,0.1);-webkit-backdrop-filter:blur(1em);backdrop-filter:blur(1em)}'
        ].join('');

        var portraitStyle = [
            '@media screen and (orientation:portrait){',
            '.player:not(.iptv) .player-panel__body{display:block!important;width:100%!important;overflow:visible!important}',
            '.player:not(.iptv) .player-panel__line-one{display:-webkit-box!important;display:-webkit-flex!important;display:-moz-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-orient:horizontal!important;-webkit-box-direction:normal!important;-webkit-flex-direction:row!important;-moz-box-orient:horizontal!important;-moz-box-direction:normal!important;-ms-flex-direction:row!important;flex-direction:row!important;-webkit-flex-wrap:nowrap!important;-ms-flex-wrap:nowrap!important;flex-wrap:nowrap!important;-webkit-box-align:center!important;-webkit-align-items:center!important;-moz-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:justify!important;-webkit-justify-content:space-between!important;-moz-box-pack:justify!important;-ms-flex-pack:justify!important;justify-content:space-between!important;width:100%!important;margin:0 0 .55em 0!important;gap:.15em!important;position:relative!important}',
            '.player:not(.iptv) .player-panel__left,.player:not(.iptv) .player-panel__center,.player:not(.iptv) .player-panel__right{display:-webkit-box!important;display:-webkit-flex!important;display:-moz-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-webkit-align-items:center!important;-moz-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;-webkit-transform:none!important;-moz-transform:none!important;-ms-transform:none!important;-o-transform:none!important;transform:none!important;width:auto!important;max-width:none!important;margin:0!important;overflow:visible!important}',
            '.player:not(.iptv) .player-panel__left{-webkit-box-ordinal-group:2!important;-webkit-order:1!important;-moz-box-ordinal-group:2!important;-ms-flex-order:1!important;order:1!important;-webkit-box-flex:1!important;-webkit-flex:1 1 0!important;-moz-box-flex:1!important;-ms-flex:1 1 0!important;flex:1 1 0!important;-webkit-box-pack:start!important;-webkit-justify-content:flex-start!important;-moz-box-pack:start!important;-ms-flex-pack:start!important;justify-content:flex-start!important;min-width:0!important}',
            '.player:not(.iptv) .player-panel__center{-webkit-box-ordinal-group:3!important;-webkit-order:2!important;-moz-box-ordinal-group:3!important;-ms-flex-order:2!important;order:2!important;-webkit-box-flex:0!important;-webkit-flex:0 0 auto!important;-moz-box-flex:0!important;-ms-flex:0 0 auto!important;flex:0 0 auto!important;-webkit-box-pack:center!important;-webkit-justify-content:center!important;-moz-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;min-width:auto!important}',
            '.player:not(.iptv) .player-panel__right{-webkit-box-ordinal-group:4!important;-webkit-order:3!important;-moz-box-ordinal-group:4!important;-ms-flex-order:3!important;order:3!important;-webkit-box-flex:1!important;-webkit-flex:1 1 0!important;-moz-box-flex:1!important;-ms-flex:1 1 0!important;flex:1 1 0!important;-webkit-box-pack:end!important;-webkit-justify-content:flex-end!important;-moz-box-pack:end!important;-ms-flex-pack:end!important;justify-content:flex-end!important;min-width:0!important}',
            '.player:not(.iptv) .player-panel__box-buttons{display:-webkit-box!important;display:-webkit-flex!important;display:-moz-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-webkit-align-items:center!important;-moz-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:center!important;-webkit-justify-content:center!important;-moz-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;-webkit-flex-wrap:nowrap!important;-ms-flex-wrap:nowrap!important;flex-wrap:nowrap!important;-webkit-flex-shrink:1!important;-ms-flex-negative:1!important;flex-shrink:1!important;min-width:0!important;margin:0 .06em!important;padding:0!important;-webkit-border-radius:5em!important;border-radius:5em!important;overflow:visible!important}',
            '.player:not(.iptv) .player-panel__box-buttons:empty{display:none!important}',
            '.player:not(.iptv) .player-panel__box-buttons.youtube-player-empty-box{display:none!important}',
            '.player:not(.iptv) .player-panel__box-buttons+.player-panel__box-buttons{margin-left:.12em!important}',
            '.player:not(.iptv) .player-panel .button{box-sizing:border-box!important;-webkit-flex-shrink:0!important;-ms-flex-negative:0!important;flex-shrink:0!important;width:2.3em!important;min-width:2.3em!important;max-width:2.3em!important;height:2.3em!important;min-height:2.3em!important;max-height:2.3em!important;margin:0!important;padding:.62em!important;-webkit-border-radius:50%!important;border-radius:50%!important;line-height:1!important}',
            '.player:not(.iptv) .player-panel__center .button{width:2.5em!important;min-width:2.5em!important;max-width:2.5em!important;height:2.5em!important;min-height:2.5em!important;max-height:2.5em!important;padding:.68em!important}',
            '.player:not(.iptv) .player-panel__center .button+.button{margin-left:.16em!important}',
            '.player:not(.iptv) .player-panel__playpause{width:2.95em!important;min-width:2.95em!important;max-width:2.95em!important;height:2.95em!important;min-height:2.95em!important;max-height:2.95em!important;padding:.88em!important;margin:0 .16em!important}',
            '.player:not(.iptv) .player-panel__prev:not(.hide),.player:not(.iptv) .player-panel__next:not(.hide){visibility:visible!important;opacity:1!important}',
            '.player:not(.iptv) .player-panel .button>svg{width:.92em!important;height:.92em!important}',
            '.player:not(.iptv) .player-panel__playpause>svg{width:1.12em!important;height:1.12em!important}',
            '.player:not(.iptv) .player-panel .player-panel__quality,.player:not(.iptv) .player-panel .button.player-panel__quality,.player:not(.iptv) .player-panel .button.youtube-player-text-button,.player:not(.iptv) .player-video__next .button,.player:not(.iptv) .player-skip .button{box-sizing:border-box!important;display:-webkit-inline-box!important;display:-webkit-inline-flex!important;display:-moz-inline-box!important;display:-ms-inline-flexbox!important;display:inline-flex!important;-webkit-box-align:center!important;-webkit-align-items:center!important;-moz-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:center!important;-webkit-justify-content:center!important;-moz-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;width:auto!important;min-width:2.3em!important;max-width:none!important;height:2.3em!important;min-height:2.3em!important;max-height:2.3em!important;padding:0 .82em!important;-webkit-border-radius:5em!important;border-radius:5em!important;text-align:center!important;line-height:1!important;overflow:hidden!important;font-size:1em!important;white-space:nowrap!important}.player:not(.iptv) .player-panel .player-panel__quality>*,.player:not(.iptv) .player-panel .button.player-panel__quality>*,.player:not(.iptv) .player-panel .button.youtube-player-text-button>*,.player:not(.iptv) .player-video__next .button>*,.player:not(.iptv) .player-skip .button>*{font-size:.72em!important;line-height:1!important}',
            '.player:not(.iptv) .player-video__next .button,.player:not(.iptv) .player-skip .button{width:auto!important;min-width:3.6em!important;max-width:none!important;padding-left:1.25em!important;padding-right:1.25em!important;-webkit-border-radius:5em!important;border-radius:5em!important}',
            '.player:not(.iptv) .player-panel .button.hide,.player:not(.iptv) .player-panel .button.disabled,.player:not(.iptv) .player-panel .button.inactive,.player:not(.iptv) .player-panel .button[hidden],.player:not(.iptv) .player-panel .button[disabled],.player:not(.iptv) .player-panel .button[aria-disabled="true"],.player:not(.iptv) .player-panel .button[style*="display: none"],.player:not(.iptv) .player-video__next .button.hide,.player:not(.iptv) .player-skip .button.hide{display:none!important}',
            '.player:not(.iptv) .player-panel__flow.hide,.player:not(.iptv) .player-panel__subs.hide,.player:not(.iptv) .player-panel__tracks.hide,.player:not(.iptv) .player-panel__quality.hide{display:none!important}',
            '.player:not(.iptv) .player-panel__timeline{margin-bottom:.55em!important}',
            '.player:not(.iptv) .player-info__title{font-size:1.28em!important;width:86%!important}',
            '.player:not(.iptv) .player-info__time{top:.15em!important}',
            '}',
            '@media screen and (orientation:portrait) and (max-width:380px){',
            '.player:not(.iptv) .player-panel .button{width:2.05em!important;min-width:2.05em!important;max-width:2.05em!important;height:2.05em!important;min-height:2.05em!important;max-height:2.05em!important;padding:.54em!important}',
            '.player:not(.iptv) .player-panel__center .button{width:2.25em!important;min-width:2.25em!important;max-width:2.25em!important;height:2.25em!important;min-height:2.25em!important;max-height:2.25em!important;padding:.6em!important}',
            '.player:not(.iptv) .player-panel__playpause{width:2.65em!important;min-width:2.65em!important;max-width:2.65em!important;height:2.65em!important;min-height:2.65em!important;max-height:2.65em!important;padding:.78em!important}',
            '.player:not(.iptv) .player-panel .player-panel__quality,.player:not(.iptv) .player-panel .button.player-panel__quality,.player:not(.iptv) .player-panel .button.youtube-player-text-button,.player:not(.iptv) .player-video__next .button,.player:not(.iptv) .player-skip .button{width:auto!important;min-width:2.05em!important;max-width:none!important;height:2.05em!important;min-height:2.05em!important;max-height:2.05em!important;padding:0 .7em!important;font-size:1em!important}.player:not(.iptv) .player-panel .player-panel__quality>*,.player:not(.iptv) .player-panel .button.player-panel__quality>*,.player:not(.iptv) .player-panel .button.youtube-player-text-button>*,.player:not(.iptv) .player-video__next .button>*,.player:not(.iptv) .player-skip .button>*{font-size:.66em!important}',
            '.player:not(.iptv) .player-video__next .button,.player:not(.iptv) .player-skip .button{width:auto!important;min-width:3.2em!important;max-width:none!important;padding-left:1.1em!important;padding-right:1.1em!important}',
            '}'
        ].join('');

        $('body').append('<style id="youtube-player-style">' + baseStyle + '</style>');
        $('body').append('<style id="youtube-player-portrait-style">' + portraitStyle + '</style>');
    }

    function startPlugin() {
        addStyles();

        var render = Lampa.Player.render();
        render.find('.player-video__display').after($('<div class="player-video__overlay"></div>'));

        var title = $('<div class="player-info__title"></div>');
        var value = $('<div class="value--name"><span></span></div>');
        var center_panel = render.find('.player-panel__center');
        var playpause = center_panel.find('.player-panel__playpause');
        var center_prev = center_panel.find('.player-panel__prev').detach();
        var center_next = center_panel.find('.player-panel__next').detach();

        center_panel.find('.button:not(.player-panel__playpause)').remove();
        render.find('.player-panel__timeline').before(render.find('.player-panel__line-one'));
        render.find('.player-info .player-info__line').before(title);
        render.find('.value--size').after(value);

        var box = $('<div class="player-panel__box-buttons"></div>');
        var right_panel = render.find('.player-panel__right');
        var left_panel = render.find('.player-panel__left');
        var right_box_quality = box.clone();
        var right_box_main = box.clone();
        var right_box_audio = box.clone();
        var left_box_main = box.clone();

        right_panel.append(right_box_audio);
        right_panel.append(right_box_quality);
        right_panel.append(right_box_main);
        right_box_main.append(right_panel.find('.button'));
        right_box_quality.append(right_panel.find('.player-panel__quality'));
        right_box_audio.append(right_panel.find('.player-panel__flow'));
        right_box_audio.append(right_panel.find('.player-panel__subs'));
        right_box_audio.append(right_panel.find('.player-panel__tracks'));
        left_panel.prepend(left_box_main);
        left_box_main.append(left_panel.find('.button'));

        function isPortrait() {
            return window.matchMedia ? window.matchMedia('(orientation: portrait)').matches : window.innerHeight > window.innerWidth;
        }

        function updatePortraitCenterButtons() {
            if (!playpause.length) return;

            if (isPortrait()) {
                var portrait_quality_buttons = render.find('.player-panel__quality');
                var portrait_series_buttons = render.find('.player-video__next .button,.player-skip .button');

                portrait_quality_buttons.css({
                    width: 'auto',
                    minWidth: '2.3em',
                    maxWidth: 'none',
                    paddingLeft: '.82em',
                    paddingRight: '.82em',
                    borderRadius: '5em'
                });

                portrait_series_buttons.css({
                    width: 'auto',
                    minWidth: '3.6em',
                    maxWidth: 'none',
                    paddingLeft: '1.25em',
                    paddingRight: '1.25em',
                    borderRadius: '5em'
                });

            } else {
                var landscape_text_buttons = render.find('.player-panel__quality,.player-video__next .button,.player-skip .button');

                landscape_text_buttons.css({
                    width: '',
                    minWidth: '',
                    maxWidth: '',
                    paddingLeft: '',
                    paddingRight: '',
                    borderRadius: ''
                });
            }
        }

        updatePortraitCenterButtons();
        window.addEventListener('orientationchange', function () {
            setTimeout(updatePortraitCenterButtons, 100);
        });
        window.addEventListener('resize', function () {
            setTimeout(updatePortraitCenterButtons, 100);
        });

        Lampa.Player.listener.follow('start', function (data) {
            var name = data.title;
            var head = '';

            if (!data.iptv) {
                if (data.card) head = data.card.title || data.card.name;
                else if (Lampa.Activity.active().movie) {
                    head = Lampa.Activity.active().movie.title || Lampa.Activity.active().movie.name;
                }
            }

            if (!head) head = name;

            title.text(head).toggleClass('hide', Boolean(data.iptv));
            render.find('.player-info__name').toggleClass('hide', Boolean(name == head)).toggleClass('hide', true);
            value.toggleClass('hide', Boolean(name == head)).find('span').text(name);

            setTimeout(updatePortraitCenterButtons, 100);
            setTimeout(updatePortraitCenterButtons, 500);
        });
    }

    if (!window.youtube_player_plugin) {
        window.youtube_player_plugin = true;
        if (window.appready) startPlugin();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') startPlugin();
            });
        }
    }
})();
