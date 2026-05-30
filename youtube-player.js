(function () {
    'use strict';

    function startPlugin() {
        $('body').append('\
        <style>\
        .player-video__overlay{display:none;background:linear-gradient(to bottom,rgba(0,0,0,0.5) 0,rgba(0,0,0,0.3) 53%,rgba(11,13,16,0.8) 100%);position:absolute;top:0;left:0;width:100%;height:100%}\
        .player:not(.iptv) .player-panel,.player:not(.iptv) .player-info,.player:not(.iptv) .player-footer{background:transparent !important;-webkit-backdrop-filter:unset !important;backdrop-filter:unset !important}\
        .player:not(.iptv) .player-panel__body,.player:not(.iptv) .player-info__body,.player:not(.iptv) .player-footer__body{padding:0}\
        .player:not(.iptv) .player-footer__row{padding:0}\
        .player:not(.iptv) .head-backward{display:none !important}\
        .player:not(.iptv) .player-info__body{padding-left:0 !important;position:relative}\
        .player:not(.iptv) .player-info__name{font-size:1.2em;text-shadow:0 0 .2em rgba(0,0,0,0.5)}\
        .player:not(.iptv) .player-info__title{font-size:2em;font-weight:600;line-height:1.4;width:60%;text-shadow:0 0 .2em rgba(0,0,0,0.5);overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}\
        .player:not(.iptv) .player-info__values{text-shadow:0 0 .2em rgba(0,0,0,0.5)}\
        .player:not(.iptv) .player-info__values .value--name span{font-weight:600}\
        .player:not(.iptv) .player-info__time{position:absolute;top:.5em;right:0}\
        .player:not(.iptv) .player-panel .button{padding:.9em;width:3em;height:3em}\
        .player:not(.iptv) .player-panel .button.focus{animation:animation-button-focus .05s}\
        .player:not(.iptv) .player-panel .button.animate-trigger-enter{-webkit-animation:animation-trigger-enter .2s forwards;-moz-animation:animation-trigger-enter .2s forwards;-o-animation:animation-trigger-enter .2s forwards;animation:animation-trigger-enter .2s forwards}\
        .player:not(.iptv) .player-panel .button>svg{width:1.2em;height:1.2em}\
        .player:not(.iptv) .player-panel .button+.button{margin-left:0}\
        .player:not(.iptv) .player-panel__playpause{margin:0;padding:1em !important}\
        .player:not(.iptv) .player-panel__playpause:not(.focus){background:rgba(255,255,255,0.1)}\
        .player:not(.iptv) .player-panel__quality{-webkit-border-radius:5em !important;border-radius:5em !important;padding:0 1em !important}\
        .player:not(.iptv) .player-panel__timeline{margin-bottom:1em}\
        .player:not(.iptv) .player-panel__timeline:not(.focus) .player-panel__position>div::after{display:none}\
        .player:not(.iptv) .player-panel__line-one{margin-bottom:1em;position:relative;z-index:2;text-shadow:0 0 .2em rgba(0,0,0,0.5)}\
        .player:not(.iptv) .player-panel__box-buttons{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;background:rgba(255,255,255,0.1);-webkit-border-radius:4em;border-radius:4em}\
        .player:not(.iptv) .player-panel__box-buttons+.player-panel__box-buttons{margin-left:.5em}\
        .player:not(.iptv) .player-panel__next,.player:not(.iptv) .player-panel__prev{padding:1.1em !important}\
        .player:not(.iptv) .player-panel__next>svg,.player:not(.iptv) .player-panel__prev>svg{width:.8em;height:.8em}\
        .player:not(.iptv) .player-panel__playlist{text-align:center}\
        .player:not(.iptv) .player-panel__playlist>svg{width:1em !important}\
        .player:not(.iptv) .player-video__paused,.player:not(.iptv) .player-video__loader{background-color:rgba(255,255,255,0.1)}\
        .player:not(.iptv) .player-info__values .value--size span{background:rgba(255,255,255,0.2);-webkit-border-radius:1em;border-radius:1em;padding:0.15em 0.6em}\
        .player-info__error{margin:1.5em 0 0 .5em;font-size:1.1em;opacity:.85}\
        .player:not(.iptv).player--panel-visible .player-video__overlay{display:block;-webkit-animation:animation-opacity .3s;-moz-animation:animation-opacity .3s;-o-animation:animation-opacity .3s;animation:animation-opacity .3s}\
        .normalization{background:rgba(255,255,255,0.1);-webkit-border-radius:1em;border-radius:1em}\
        .normalization canvas{-webkit-border-radius:1em;border-radius:1em}\
        body.platform--browser .player:not(.iptv) .player-panel__box-buttons,body.platform--browser .player:not(.iptv) .player-panel__playpause:not(.focus),body.platform--browser .player:not(.iptv) .player-info__values .value--size span,body.platform--nw .player:not(.iptv) .player-panel__box-buttons,body.platform--nw .player:not(.iptv) .player-panel__playpause:not(.focus),body.platform--nw .player:not(.iptv) .player-info__values .value--size span,body.glass--style.platform--apple .player:not(.iptv) .player-panel__box-buttons,body.glass--style.platform--apple .player:not(.iptv) .player-panel__playpause:not(.focus),body.glass--style.platform--apple .player:not(.iptv) .player-info__values .value--size span,body.glass--style.platform--apple_tv .player:not(.iptv) .player-panel__box-buttons,body.glass--style.platform--apple_tv .player:not(.iptv) .player-panel__playpause:not(.focus),body.glass--style.platform--apple_tv .player:not(.iptv) .player-info__values .value--size span,body.glass--style.platform--android .player:not(.iptv) .player-panel__box-buttons,body.glass--style.platform--android .player:not(.iptv) .player-panel__playpause:not(.focus),body.glass--style.platform--android .player:not(.iptv) .player-info__values .value--size span{-webkit-backdrop-filter:blur(1em);backdrop-filter:blur(1em)}\
        body.platform--browser .normalization,body.platform--browser .player-video__paused,body.platform--browser .player-video__loader,body.platform--nw .normalization,body.platform--nw .player-video__paused,body.platform--nw .player-video__loader,body.glass--style.platform--apple .normalization,body.glass--style.platform--apple .player-video__paused,body.glass--style.platform--apple .player-video__loader,body.glass--style.platform--apple_tv .normalization,body.glass--style.platform--apple_tv .player-video__paused,body.glass--style.platform--apple_tv .player-video__loader,body.glass--style.platform--android .normalization,body.glass--style.platform--android .player-video__paused,body.glass--style.platform--android .player-video__loader{background-color:rgba(255,255,255,0.1);-webkit-backdrop-filter:blur(1em);backdrop-filter:blur(1em)}\
        @media (orientation:portrait){\
            .player:not(.iptv) .player-info__title{font-size:1.2em;width:85%;-webkit-line-clamp:1;line-clamp:1}\
            .player:not(.iptv) .player-info__name{font-size:.9em}\
            .player:not(.iptv) .player-info__body{padding:.5em 0 !important}\
            .player:not(.iptv) .player-info__time{top:.3em;font-size:.85em}\
            .player:not(.iptv) .player-info__values{font-size:.85em}\
            .player:not(.iptv) .player-info__values .value--size span{font-size:.85em;padding:.1em .5em}\
            .player:not(.iptv) .player-panel .button{padding:.6em;width:2.4em;height:2.4em}\
            .player:not(.iptv) .player-panel .button>svg{width:1em;height:1em}\
            .player:not(.iptv) .player-panel__box-buttons{-webkit-border-radius:2.5em;border-radius:2.5em;flex-wrap:nowrap}\
            .player:not(.iptv) .player-panel__box-buttons+.player-panel__box-buttons{margin-left:.3em}\
            .player:not(.iptv) .player-panel__playpause{padding:.7em !important}\
            .player:not(.iptv) .player-panel__next,.player:not(.iptv) .player-panel__prev{padding:.8em !important}\
            .player:not(.iptv) .player-panel__next>svg,.player:not(.iptv) .player-panel__prev>svg{width:.65em;height:.65em}\
            .player:not(.iptv) .player-panel__timeline{margin-bottom:.4em}\
            .player:not(.iptv) .player-panel__line-one{margin-bottom:.4em;font-size:.85em}\
            .player:not(.iptv) .player-panel__quality{padding:0 .6em !important;font-size:.85em}\
            .player:not(.iptv) .player-panel__body{padding:0 .3em}\
            .player:not(.iptv) .player-footer__body{padding:.3em 0}\
            .player:not(.iptv) .player-video__overlay{background:linear-gradient(to bottom,rgba(0,0,0,0.4) 0,rgba(0,0,0,0.15) 40%,rgba(0,0,0,0.2) 70%,rgba(11,13,16,0.85) 100%)}\
            .player:not(.iptv) .player-video__paused,.player:not(.iptv) .player-video__loader{width:3em;height:3em}\
            .player-info__error{font-size:.95em}\
        }\
        @media (orientation:portrait) and (max-width:400px){\
            .player:not(.iptv) .player-info__title{font-size:1em;width:90%}\
            .player:not(.iptv) .player-panel .button{padding:.5em;width:2.1em;height:2.1em}\
            .player:not(.iptv) .player-panel .button>svg{width:.9em;height:.9em}\
            .player:not(.iptv) .player-panel__playpause{padding:.6em !important}\
            .player:not(.iptv) .player-panel__box-buttons{-webkit-border-radius:2em;border-radius:2em}\
            .player:not(.iptv) .player-panel__quality{padding:0 .5em !important;font-size:.8em}\
            .player:not(.iptv) .player-panel__line-one{font-size:.8em}\
            .player:not(.iptv) .player-video__paused,.player:not(.iptv) .player-video__loader{width:2.5em;height:2.5em}\
        }\
        </style>\
        ');

        var render = Lampa.Player.render();
        var title = $('<div class="player-info__title"></div>');
        var value = $('<div class="value--name"><span></span></div>');

        render.find('.player-video__display').after($('<div class="player-video__overlay"></div>'));
        render.find('.player-panel__center').find('.button:not(.player-panel__playpause)').remove();
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

        Lampa.Player.listener.follow('start', function (data) {
            var name = data.title;
            var head = '';

            if (!data.iptv) {
                if (data.card) head = data.card.title || data.card.name;
                else if (Lampa.Activity.active().movie) head = Lampa.Activity.active().movie.title || Lampa.Activity.active().movie.name;
            }

            if (!head) head = name;

            title.text(head).toggleClass('hide', Boolean(data.iptv));
            render.find('.player-info__name').toggleClass('hide', Boolean(name == head)).toggleClass('hide', true);
            value.toggleClass('hide', Boolean(name == head)).find('span').text(name);
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
