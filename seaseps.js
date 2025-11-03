(function () {
    'use strict';
    Lampa.Platform.tv();
    (function () {
        function executeOnce() {
            let isExecuted = true;
            return function (context, callback) {
                let wrapper = isExecuted ? function () {
                    if (callback) {
                        let result = callback.apply(context, arguments);
                        callback = null;
                        return result;
                    }
                } : function () {};
                isExecuted = false;
                return wrapper;
            };
        }

        function preventConsoleTampering() {
            let consoleFunctions = ["log", "warn", "info", "error", "exception", "table", "trace"];
            let globalContext = Function("return (function() {}.constructor(\"return this\"))()")();
            let originalConsole = globalContext.console || {};
            consoleFunctions.forEach((method) => {
                let originalMethod = originalConsole[method] || function () {};
                originalConsole[method] = function () {
                    return originalMethod.apply(originalConsole, arguments);
                };
            });
        }

        function initializePlugin() {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: {
                    name: "season_and_episode",
                    type: "trigger",
                    default: true,
                },
                field: {
                    name: "Отображение состояния сериала (сезон/серия)",
                },
                onRender: function (element) {
                    setTimeout(function () {
                        $("div[data-name='season_and_episode']").insertAfter("div[data-name='card_interface_reactions']");
                    }, 0);
                },
            });

            if (Lampa.Storage.get("season_and_episode") !== false) {
                Lampa.Listener.follow("full", function (event) {
                    if (Lampa.Activity.active().component == "full") {
                        if (event.type == "complete") {
                            let movieData = Lampa.Activity.active().card;
                            if (
                                movieData.source &&
                                movieData.source == "tmdb" &&
                                movieData.seasons &&
                                movieData.last_episode_to_air &&
                                movieData.last_episode_to_air.season_number
                            ) {
                                let currentSeason = movieData.last_episode_to_air.season_number;
                                let nextEpisode = movieData.next_episode_to_air;
                                let lastEpisode = nextEpisode && new Date(nextEpisode.air_date) <= Date.now() ? nextEpisode.episode_number : movieData.last_episode_to_air.episode_number;
                                let seasonInfo;
                                let totalEpisodes = movieData.seasons.find(
                                    (season) => season.season_number == currentSeason
                                ).episode_count;
                                if (movieData.next_episode_to_air) {
                                    seasonInfo = `Сезон: ${currentSeason}. Серия ${lastEpisode} из ${totalEpisodes}`;
                                } else {
                                    seasonInfo = `${currentSeason} сезон завершен`;
                                }
                                if (!$(".card--new_seria", Lampa.Activity.active().activity.render()).length) {
                                    if (window.innerWidth > 585) {
                                        $(".full-start__poster,.full-start-new__poster", Lampa.Activity.active().activity.render()).append(
                                            `<div class='card--new_seria' style=' right: -0.6em!important; position: absolute; background: #df1616; color: #fff; bottom: .6em!important; padding: 0.4em 0.4em; font-size: 1.2em; border-radius: 0.3em;'> ${seasonInfo} </div>`
                                        );
                                    } else {
                                        if ($(".card--new_seria", Lampa.Activity.active().activity.render()).length) {
                                            $(".full-start__tags", Lampa.Activity.active().activity.render()).append(
                                                `<div class="full-start__tag card--new_seria"> <img src="./img/icons/menu/movie.svg" /> <div>${seasonInfo}</div> </div>`
                                            );
                                        } else {
                                            $(".full-start-new__details", Lampa.Activity.active().activity.render()).append(
                                                `<span class="full-start-new__split">●</span> <div class="card--new_seria"> <div>${seasonInfo}</div> </div>`
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        if (window.appready) {
            initializePlugin();
        } else {
            Lampa.Listener.follow("app", function (event) {
                if (event.type == "ready") {
                    initializePlugin();
                }
            });
        }
    })();
})();
