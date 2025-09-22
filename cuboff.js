(function () {

    window.Account = window.Account || {};
    window.Account.hasPremium = () => true;

    document.createElement = new Proxy(document.createElement, {
        apply(target, thisArg, args) {
            if (args[0] === "video") {

                let fakeVideo = target.apply(thisArg, args)
				
                fakeVideo.play = function () {
                    setTimeout(() => {
                        fakeVideo.ended = true;
                        fakeVideo.dispatchEvent(new Event("ended"));
                    }, 500);
                };

                return fakeVideo;
            }
            return target.apply(thisArg, args);
        }
    });
    function clearAdTimers() {
        let highestTimeout = setTimeout(() => {}, 0);
        for (let i = 0; i <= highestTimeout; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    }

    document.addEventListener("DOMContentLoaded", clearAdTimers);
})();
