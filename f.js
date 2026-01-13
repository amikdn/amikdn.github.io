(function () {
    function initLampaHook() {
        if (window.Lampa && Lampa.Player && Lampa.Player.play) {
            var originalPlay = Lampa.Player.play;
            Lampa.Player.play = function (object) {
                object.iptv = true;

                if (object.vast_url) delete object.vast_url;
                if (object.vast_msg) delete object.vast_msg;
                
                return originalPlay.apply(this, arguments);
            };
        } else {
            setTimeout(initLampaHook, 500);
        }
    }

    initLampaHook();
})();
