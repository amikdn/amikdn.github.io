(function () {
    "use strict";

    const STORAGE_KEY_SERVERS = "lamponline_servers";
    const STORAGE_KEY_ACTIVE = "lamponline_active_server";

    function getServerUrl() {
        var url = Lampa.Storage.get(STORAGE_KEY_ACTIVE, "");
        if (url) {
            url = url.replace(/\/+$/, "");
            if (!url.match(/^https?:\/\//i)) url = "http://" + url;
        }
        return url;
    }

    function getHostKey() {
        var url = getServerUrl();
        if (!url) return "";
        return url.replace(/^https?:\/\//, "");
    }

    function isServerConfigured() {
        return Boolean(getServerUrl());
    }

    function getServersList() {
        var str = Lampa.Storage.get(STORAGE_KEY_SERVERS, "[]");
        try {
            var arr = JSON.parse(str);
            if (Array.isArray(arr)) return arr;
        } catch (e) {
            console.error("Invalid servers storage", e);
        }
        return [];
    }

    function openServerManager() {
        var changed = false;
        var servers = getServersList();
        var active = getServerUrl();

        var body = $('<div></div>');

        var input = $('<input type="text" placeholder="Введите адрес сервера (например http://192.168.1.1:9118)" style="width:100%;padding:1em;font-size:1.2em;border-radius:0.3em;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:white;margin-bottom:1.5em;">');

        var addBtn = $('<div class="settings-param selector settings-param--button" style="margin-bottom:1.5em;"><div class="settings-param__name">Добавить сервер</div></div>');

        body.append(input);
        body.append(addBtn);

        var container = $('<div></div>');
        body.append(container);

        function refreshList() {
            container.empty();
            if (servers.length === 0) {
                container.append('<div class="settings-param__descr" style="text-align:center;padding:1em;color:#999;">Нет сохранённых серверов</div>');
                return;
            }
            servers.forEach(function (url, i) {
                var isActive = url === active;
                var param = $('<div class="settings-param selector">' +
                    '<div class="settings-param__name">' + url + (isActive ? ' <span style="color:#0f0;">(активный)</span>' : '') + '</div>' +
                    '<div class="settings-param__value">Выбрать</div>' +
                    '<div class="settings-param__descr">Нажмите для активации • Удерживайте для удаления</div>' +
                    '</div>');

                param.on("hover:enter", function () {
                    if (!isActive) {
                        Lampa.Storage.set(STORAGE_KEY_ACTIVE, url);
                        active = url;
                        changed = true;
                        refreshList();
                    }
                });

                param.on("hover:long", function () {
                    if (confirm("Удалить сервер " + url + "?")) {
                        servers.splice(i, 1);
                        Lampa.Storage.set(STORAGE_KEY_SERVERS, JSON.stringify(servers));
                        if (url === active) {
                            active = servers[0] || "";
                            Lampa.Storage.set(STORAGE_KEY_ACTIVE, active);
                            changed = true;
                        }
                        refreshList();
                    }
                });

                container.append(param);
            });
        }

        addBtn.on("hover:enter", function () {
            var val = input.val().trim();
            if (!val) {
                Lampa.Noty.show("Введите адрес сервера");
                return;
            }
            if (!val.match(/^https?:\/\//i)) val = "http://" + val;
            val = val.replace(/\/+$/, "");
            if (servers.indexOf(val) === -1) {
                servers.push(val);
                Lampa.Storage.set(STORAGE_KEY_SERVERS, JSON.stringify(servers));
                if (servers.length === 1) {
                    Lampa.Storage.set(STORAGE_KEY_ACTIVE, val);
                    active = val;
                    changed = true;
                }
                input.val("");
                refreshList();
            } else {
                Lampa.Noty.show("Сервер уже добавлен");
            }
        });

        refreshList();

        Lampa.Modal.open({
            title: "Управление серверами",
            html: body,
            size: "medium",
            onClose: function () {
                if (changed) location.reload();
            }
        });
    }

    var Config = {
        get HostKey() { return getHostKey(); },
        Urls: {
            get Localhost() { var url = getServerUrl(); return url ? url + "/" : ""; },
            get LampOnline() { return getServerUrl(); },
            NwsClientScript: "https://honeyxcat.github.io/plugins/nws-client-es5.js",
            GithubCheck: "https://github.com/",
            CorsCheckPath: "/cors/check",
        },
        Rch: {
            RegistryVersion: 149,
            ClientTimeout: 8000,
        },
        Auth: {
            LampaUid: "",
            LampacUnicId: "guest",
            Token: "",
        },
        StorageKeys: {
            LampacUnicId: "lampac_unic_id",
            LampacProfileId: "lampac_profile_id",
            ClarificationSearch: "clarification_search",
            OnlineLastBalanser: "online_last_balanser",
            OnlineBalanser: "online_balanser",
            ActiveBalanser: "active_balanser",
            OnlineChoicePrefix: "online_choice_",
            OnlineWatchedLast: "online_watched_last",
            OnlineView: "online_view",
        },
        Defined: {
            api: "lampac",
            apn: "",
        },
    };

    var Defined = {
        api: Config.Defined.api,
        get localhost() { return Config.Urls.Localhost; },
        apn: Config.Defined.apn,
    };

    var MY_AUTH = {
        lampa_uid: Config.Auth.LampaUid,
        lampac_unic_id: Config.Auth.LampacUnicId,
    };

    Lampa.Storage.set(Config.StorageKeys.LampacUnicId, MY_AUTH.lampac_unic_id);

    var balansers_with_search;
    var balansers_with_search_promise;

    function ensureBalansersWithSearch() {
        if (balansers_with_search !== undefined) {
            return Promise.resolve(Lampa.Arrays.isArray(balansers_with_search) ? balansers_with_search : []);
        }
        if (!isServerConfigured()) {
            return Promise.resolve([]);
        }
        if (balansers_with_search_promise) return balansers_with_search_promise;
        balansers_with_search_promise = new Promise(function (resolve) {
            var net = new Lampa.Reguest();
            net.timeout(10000);
            net.silent(account(Defined.localhost + "lite/withsearch"), function (json) {
                balansers_with_search = Lampa.Arrays.isArray(json) ? json : [];
                resolve(balansers_with_search);
            }, function (e) {
                console.error(e);
                balansers_with_search = [];
                resolve(balansers_with_search);
            });
        });
        return balansers_with_search_promise;
    }

    function getActiveHostKey() {
        return Config.HostKey;
    }

    if (!window.rch_nws) window.rch_nws = {};

    function ensureRchNws() {
        var hostkey = getActiveHostKey();
        if (!hostkey) return null;
        if (!window.rch_nws[hostkey]) {
            window.rch_nws[hostkey] = {
                type: Lampa.Platform.is("android") ? "apk" : Lampa.Platform.is("tizen") ? "cors" : undefined,
                startTypeInvoke: false,
                rchRegistry: false,
                apkVersion: 0,
            };
        }
        return window.rch_nws[hostkey];
    }

    ensureRchNws();

    if (typeof window.rch_nws[getActiveHostKey()]?.typeInvoke !== "function") {
        var hostkey = getActiveHostKey();
        if (hostkey && window.rch_nws[hostkey]) {
            window.rch_nws[hostkey].typeInvoke = function rchtypeInvoke(host, call) {
                var hk = getActiveHostKey();
                if (!window.rch_nws[hk].startTypeInvoke) {
                    window.rch_nws[hk].startTypeInvoke = true;
                    var check = function check(good) {
                        window.rch_nws[hk].type = Lampa.Platform.is("android") ? "apk" : good ? "cors" : "web";
                        call();
                    };
                    if (Lampa.Platform.is("android") || Lampa.Platform.is("tizen")) check(true);
                    else {
                        var net = new Lampa.Reguest();
                        net.silent(Config.Urls.LampOnline.indexOf(location.host) >= 0 ? Config.Urls.GithubCheck : host + Config.Urls.CorsCheckPath, function () {
                            check(true);
                        }, function () {
                            check(false);
                        }, false, { dataType: "text" });
                    }
                } else call();
            };
        }
    }

    if (typeof window.rch_nws[getActiveHostKey()]?.Registry !== "function") {
        var hostkey = getActiveHostKey();
        if (hostkey && window.rch_nws[hostkey]) {
            window.rch_nws[hostkey].Registry = function RchRegistry(client, startConnection) {
                var hk = getActiveHostKey();
                new Promise(function (resolve) {
                    window.rch_nws[hk].typeInvoke(Config.Urls.LampOnline, resolve);
                }).then(function () {
                    client.invoke("RchRegistry", JSON.stringify({
                        version: Config.Rch.RegistryVersion,
                        host: location.host,
                        rchtype: Lampa.Platform.is("android") ? "apk" : Lampa.Platform.is("tizen") ? "cors" : window.rch_nws[hk].type,
                        apkVersion: window.rch_nws[hk].apkVersion,
                        player: Lampa.Storage.field("player"),
                        account_email: "",
                        unic_id: MY_AUTH.lampac_unic_id,
                        profile_id: Lampa.Storage.get(Config.StorageKeys.LampacProfileId, ""),
                        token: Config.Auth.Token,
                    }));
                    if (client._shouldReconnect && window.rch_nws[hk].rchRegistry) {
                        if (startConnection) startConnection();
                        return;
                    }
                    window.rch_nws[hk].rchRegistry = true;
                    client.on("RchRegistry", function (clientIp) {
                        if (startConnection) startConnection();
                    });
                    client.on("RchClient", function (rchId, url, data, headers, returnHeaders) {
                        var network = new Lampa.Reguest();
                        function result(html) {
                            if (Lampa.Arrays.isObject(html) || Lampa.Arrays.isArray(html)) {
                                html = JSON.stringify(html);
                            }
                            client.invoke("RchResult", rchId, html);
                        }
                        if (url == "eval") result(eval(data));
                        else if (url == "ping") result("pong");
                        else {
                            network["native"](url, result, function () { result(""); }, data, { dataType: "text", timeout: Config.Rch.ClientTimeout, headers: headers, returnHeaders: returnHeaders });
                        }
                    });
                    client.on("Connected", function (connectionId) {
                        window.rch_nws[hk].connectionId = connectionId;
                    });
                })["catch"](function (e) {
                    console.error(e);
                    if (startConnection) startConnection();
                });
            };
        }
    }

    if (getActiveHostKey()) {
        window.rch_nws[getActiveHostKey()].typeInvoke(Config.Urls.LampOnline, function () {});
    }

    var domParser = null;
    var lamponline_css_inited = false;

    var Promise = (function () {
        if (typeof window.Promise !== "undefined") return window.Promise;
        function SimplePromise(executor) {
            var state = 0;
            var value = null;
            var queue = [];
            function next(fn) { setTimeout(fn, 0); }
            function finale() {
                next(function () {
                    for (var i = 0; i < queue.length; i++) handle(queue[i]);
                    queue = [];
                });
            }
            function resolve(result) {
                try {
                    if (result === self) throw new TypeError("Promise resolved with itself");
                    if (result && (typeof result === "object" || typeof result === "function")) {
                        var then = result.then;
                        if (typeof then === "function") {
                            return then.call(result, resolve, reject);
                        }
                    }
                    state = 1;
                    value = result;
                    finale();
                } catch (e) { reject(e); }
            }
            function reject(error) {
                state = 2;
                value = error;
                finale();
            }
            function handle(handler) {
                if (state === 0) {
                    queue.push(handler);
                    return;
                }
                var cb = state === 1 ? handler.onFulfilled : handler.onRejected;
                if (!cb) {
                    (state === 1 ? handler.resolve : handler.reject)(value);
                    return;
                }
                try { handler.resolve(cb(value)); } catch (e) { handler.reject(e); }
            }
            this.then = function (onFulfilled, onRejected) {
                var selfPromise = this;
                return new SimplePromise(function (resolve, reject) {
                    handle({
                        onFulfilled: typeof onFulfilled === "function" ? onFulfilled : null,
                        onRejected: typeof onRejected === "function" ? onRejected : null,
                        resolve: resolve,
                        reject: reject,
                    });
                });
            };
            this["catch"] = function (onRejected) { return this.then(null, onRejected); };
            var self = this;
            try { executor(resolve, reject); } catch (e) { reject(e); }
        }
        SimplePromise.resolve = function (val) { return new SimplePromise(function (resolve) { resolve(val); }); };
        SimplePromise.reject = function (err) { return new SimplePromise(function (resolve, reject) { reject(err); }); };
        return SimplePromise;
    })();

    var RchController = (function () {
        var script_promise;
        function getClient() {
            var hostkey = getActiveHostKey();
            return hostkey && window.nwsClient && window.nwsClient[hostkey] ? window.nwsClient[hostkey] : null;
        }
        function loadClientScript() {
            if (typeof NativeWsClient !== "undefined") return Promise.resolve();
            if (script_promise) return script_promise;
            script_promise = new Promise(function (resolve) {
                Lampa.Utils.putScript([Config.Urls.NwsClientScript], function () {}, false, resolve, true);
            });
            return script_promise;
        }
        function connect(json) {
            return loadClientScript().then(function () {
                return new Promise(function (resolve, reject) {
                    try {
                        var hostkey = getActiveHostKey();
                        if (!hostkey) return reject(new Error("Server not configured"));
                        ensureRchNws();
                        if (window.nwsClient && window.nwsClient[hostkey] && window.nwsClient[hostkey]._shouldReconnect) {
                            return resolve(getClient());
                        }
                        if (!window.nwsClient) window.nwsClient = {};
                        if (window.nwsClient[hostkey] && window.nwsClient[hostkey].socket) window.nwsClient[hostkey].socket.close();
                        window.nwsClient[hostkey] = new NativeWsClient(json.nws, { autoReconnect: false });
                        window.nwsClient[hostkey].on("Connected", function (connectionId) {
                            window.rch_nws[hostkey].Registry(window.nwsClient[hostkey], function () {
                                resolve(getClient());
                            });
                        });
                        window.nwsClient[hostkey].connect();
                    } catch (e) {
                        console.error(e);
                        reject(e);
                    }
                });
            });
        }
        function send() {
            var client = getClient();
            if (!client || !client.invoke) return;
            client.invoke.apply(client, arguments);
        }
        function onMessage(event, handler) {
            var client = getClient();
            if (!client || !client.on) return;
            client.on(event, handler);
        }
        return {
            connect: connect,
            send: send,
            onMessage: onMessage,
            getClient: getClient,
        };
    })();

    function rchRun(json, call) {
        RchController.connect(json).then(function () {
            call();
        })["catch"](function (e) {
            console.error(e);
        });
    }

    function rchInvoke(json, call) {
        rchRun(json, call);
    }

    function buildUrl(url, query) {
        url = url + "";
        if (query && query.length) {
            url = url + (url.indexOf("?") >= 0 ? "&" : "?") + query.join("&");
        }
        if (url.indexOf("uid=") == -1) {
            url = Lampa.Utils.addUrlComponent(url, "uid=" + encodeURIComponent(MY_AUTH.lampac_unic_id));
        }
        if (url.indexOf("device_id=") == -1) {
            url = Lampa.Utils.addUrlComponent(url, "device_id=" + encodeURIComponent(MY_AUTH.lampa_uid));
        }
        if (url.indexOf("token=") == -1) {
            var token = Config.Auth.Token;
            if (token) url = Lampa.Utils.addUrlComponent(url, "token=" + token);
        }
        return url;
    }

    function account(url) {
        return buildUrl(url);
    }

    function formatCardInfo(info, wrap) {
        if (!info || !info.length) return "";
        var split = '<span class="online-prestige-split">●</span>';
        if (wrap) {
            return info.map(function (i) { return "<span>" + i + "</span>"; }).join(split);
        }
        return info.join(split);
    }

    var Network = Lampa.Reguest;

    function component(object) {
        var network = new Network();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var sources = {};
        var last;
        var source;
        var balanser;
        var initialized;
        var balanser_timer;
        var images = [];
        var number_of_requests = 0;
        var number_of_requests_timer;
        var life_wait_times = 0;
        var life_wait_timer;
        var select_timeout_timer;
        var select_close_timer;
        var destroyed = false;
        var clarification_search_timer;
        var clarification_search_value = null;
        var filter_sources = {};
        var filter_translate = {
            season: Lampa.Lang.translate("torrent_serial_season"),
            voice: Lampa.Lang.translate("torrent_parser_voice"),
            source: Lampa.Lang.translate("settings_rest_source"),
        };
        var filter_find = { season: [], voice: [] };

        var NetworkManager = (function () {
            function getRchType() {
                var hostkey = getActiveHostKey();
                return (hostkey && window.rch_nws && window.rch_nws[hostkey] ? window.rch_nws[hostkey].type : window.rch && hostkey && window.rch[hostkey] ? window.rch[hostkey].type : "") || "";
            }
            function buildMovieUrl(url) {
                var query = [];
                var card_source = object.movie.source || "tmdb";
                query.push("id=" + encodeURIComponent(object.movie.id));
                if (object.movie.imdb_id) query.push("imdb_id=" + (object.movie.imdb_id || ""));
                if (object.movie.kinopoisk_id) query.push("kinopoisk_id=" + (object.movie.kinopoisk_id || ""));
                if (object.movie.tmdb_id) query.push("tmdb_id=" + (object.movie.tmdb_id || ""));
                query.push("title=" + encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name));
                query.push("original_title=" + encodeURIComponent(object.movie.original_title || object.movie.original_name));
                query.push("serial=" + (object.movie.name ? 1 : 0));
                query.push("original_language=" + (object.movie.original_language || ""));
                query.push("year=" + ((object.movie.release_date || object.movie.first_air_date || "0000") + "").slice(0, 4));
                query.push("source=" + card_source);
                query.push("clarification=" + (object.clarification ? 1 : 0));
                query.push("similar=" + (object.similar ? true : false));
                query.push("rchtype=" + getRchType());
                return buildUrl(url, query);
            }
            function silentPromise(url, data, options) {
                return new Promise(function (resolve, reject) {
                    network.silent(url, function (json) {
                        if (destroyed) return;
                        resolve(json);
                    }, function (e) {
                        if (destroyed) return;
                        reject(e);
                    }, data, options);
                });
            }
            function nativePromise(url, data, options) {
                return new Promise(function (resolve, reject) {
                    network["native"](url, function (res) {
                        if (destroyed) return;
                        resolve(res);
                    }, function (e) {
                        if (destroyed) return;
                        reject(e);
                    }, data, options);
                });
            }
            return {
                timeout: function (ms) { network.timeout(ms); },
                clear: function () { network.clear(); },
                getRchType: getRchType,
                buildMovieUrl: buildMovieUrl,
                silentPromise: silentPromise,
                nativePromise: nativePromise,
            };
        })();

        var StateManager = (function () {
            var StorageKeys = Config.StorageKeys;
            function getChoice(for_balanser) {
                var data = Lampa.Storage.cache(StorageKeys.OnlineChoicePrefix + (for_balanser || balanser), 3000, {});
                var save = data[object.movie.id] || {};
                Lampa.Arrays.extend(save, { season: 0, voice: 0, voice_name: "", voice_id: 0, episodes_view: {}, movie_view: "", });
                return save;
            }
            function saveChoice(choice, for_balanser) {
                var data = Lampa.Storage.cache(StorageKeys.OnlineChoicePrefix + (for_balanser || balanser), 3000, {});
                data[object.movie.id] = choice;
                Lampa.Storage.set(StorageKeys.OnlineChoicePrefix + (for_balanser || balanser), data);
                updateBalanser(for_balanser || balanser);
            }
            function replaceChoice(choice, for_balanser) {
                var to = getChoice(for_balanser);
                Lampa.Arrays.extend(to, choice, true);
                saveChoice(to, for_balanser);
            }
            function updateBalanser(balanser_name) {
                var last_select_balanser = Lampa.Storage.cache(StorageKeys.OnlineLastBalanser, 3000, {});
                last_select_balanser[object.movie.id] = balanser_name;
                Lampa.Storage.set(StorageKeys.OnlineLastBalanser, last_select_balanser);
            }
            function watched(set) {
                var file_id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
                var watched = Lampa.Storage.cache(StorageKeys.OnlineWatchedLast, 5000, {});
                if (set) {
                    if (!watched[file_id]) watched[file_id] = {};
                    Lampa.Arrays.extend(watched[file_id], set, true);
                    Lampa.Storage.set(StorageKeys.OnlineWatchedLast, watched);
                    return true;
                } else {
                    return watched[file_id];
                }
            }
            function getLastChoiceBalanser() {
                var last_select_balanser = Lampa.Storage.cache(StorageKeys.OnlineLastBalanser, 3000, {});
                if (last_select_balanser[object.movie.id]) {
                    return last_select_balanser[object.movie.id];
                } else {
                    return Lampa.Storage.get(StorageKeys.OnlineBalanser, filter_sources.length ? filter_sources[0] : "");
                }
            }
            return {
                getChoice: getChoice,
                saveChoice: saveChoice,
                replaceChoice: replaceChoice,
                updateBalanser: updateBalanser,
                watched: watched,
                getLastChoiceBalanser: getLastChoiceBalanser,
            };
        })();

        var UIManager = { initTemplates: function () { initTemplates(); }, };

        var PlayerAdapter = (function () {
            function toPlayElement(file) {
                var play = {
                    title: file.title,
                    url: file.url,
                    quality: file.qualitys,
                    timeline: file.timeline,
                    subtitles: file.subtitles,
                    segments: file.segments,
                    callback: file.mark,
                    season: file.season,
                    episode: file.episode,
                    voice_name: file.voice_name,
                };
                return play;
            }
            function orUrlReserve(data) {
                if (data.url && typeof data.url == "string" && data.url.indexOf(" or ") !== -1) {
                    var urls = data.url.split(" or ");
                    data.url = urls[0];
                    data.url_reserve = urls[1];
                }
            }
            function setDefaultQuality(data) {
                if (Lampa.Arrays.getKeys(data.quality).length) {
                    for (var q in data.quality) {
                        if (parseInt(q) == Lampa.Storage.field("video_quality_default")) {
                            data.url = data.quality[q];
                            orUrlReserve(data);
                        }
                        if (data.quality[q].indexOf(" or ") !== -1) data.quality[q] = data.quality[q].split(" or ")[0];
                    }
                }
            }
            function loadSubtitles(link) {
                network.silent(account(link), function (subs) {
                    Lampa.Player.subtitles(subs);
                }, function (e) { console.error(e); });
            }
            return {
                toPlayElement: toPlayElement,
                orUrlReserve: orUrlReserve,
                setDefaultQuality: setDefaultQuality,
                loadSubtitles: loadSubtitles,
            };
        })();

        function initTemplates() {
            if (lamponline_css_inited) return;
            Lampa.Template.add("lampac_prestige_full", '<div class="online-prestige online-prestige--full selector">\n <div class="online-prestige__img">\n <img alt="">\n <div class="online-prestige__loader"></div>\n </div>\n <div class="online-prestige__body">\n <div class="online-prestige__head">\n <div class="online-prestige__title">{title}</div>\n <div class="online-prestige__time">{time}</div>\n </div>\n\n <div class="online-prestige__timeline"></div>\n\n <div class="online-prestige__footer">\n <div class="online-prestige__info">{info}</div>\n <div class="online-prestige__quality">{quality}</div>\n </div>\n </div>\n </div>');
            Lampa.Template.add("lampac_content_loading", '<div class="online-empty">\n <div class="broadcast__scan"><div></div></div>\n\t\t\t\n <div class="online-empty__templates">\n <div class="online-empty-template selector">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n </div>\n </div>');
            Lampa.Template.add("lampac_does_not_answer", '<div class="online-empty">\n <div class="online-empty__title">\n #{lampac_balanser_dont_work}\n </div>\n <div class="online-empty__time">\n #{lampac_balanser_timeout}\n </div>\n <div class="online-empty__buttons">\n <div class="online-empty__button selector cancel">#{cancel}</div>\n <div class="online-empty__button selector change">#{lampac_change_balanser}</div>\n </div>\n <div class="online-empty__templates">\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n </div>\n </div>');
            Lampa.Template.add("lampac_server_not_configured", '<div class="online-empty">\n <div class="online-empty__title">\n #{lampac_server_not_set}\n </div>\n <div class="online-empty__time">\n #{lampac_server_not_set_desc}\n </div>\n <div class="online-empty__buttons">\n <div class="online-empty__button selector cancel">#{cancel}</div>\n <div class="online-empty__button selector on_settings">Настроить</div>\n </div>\n <div class="online-empty__templates">\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n <div class="online-empty-template">\n <div class="online-empty-template__ico"></div>\n <div class="online-empty-template__body"></div>\n </div>\n </div>\n </div>');
            Lampa.Template.add("lampac_prestige_rate", '<div class="online-prestige-rate">\n <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n                <path d="M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z" fill="#fff"></path>\n </svg>\n <span>{rate}</span>\n </div>');
            Lampa.Template.add("lampac_prestige_folder", '<div class="online-prestige online-prestige--folder selector">\n <div class="online-prestige__folder">\n <svg viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <rect y="20" width="128" height="92" rx="13" fill="white"></rect>\n <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"></path>\n <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"></rect>\n </svg>\n </div>\n <div class="online-prestige__body">\n <div class="online-prestige__head">\n <div class="online-prestige__title">{title}</div>\n <div class="online-prestige__time">{time}</div>\n </div>\n\n <div class="online-prestige__footer">\n <div class="online-prestige__info">{info}</div>\n </div>\n </div>\n </div>');
            Lampa.Template.add("lampac_prestige_watched", '<div class="online-prestige online-prestige-watched selector">\n <div class="online-prestige-watched__icon">\n <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <circle cx="10.5" cy="10.5" r="9" stroke="currentColor" stroke-width="3"/>\n <path d="M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z" fill="currentColor"/>\n </svg>\n </div>\n <div class="online-prestige-watched__body">\n \n </div>\n </div>');
            Lampa.Template.add("lampac_css", "\n <style>\n @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{visibility:hidden;position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1;visibility:visible}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}.lampac-balanser-loader{display:inline-block;width:1.2em;height:1.2em;margin-top:0;margin-left:0.5em;background:url(./img/loader.svg) no-repeat 50% 50%;background-size:contain}.lampac-similar-img{height:7em;width:7em;border-radius:0.3em;visibility:hidden;}.lampac-dim-opacity{opacity:0.5}\n.lampac-similar-img.loaded { visibility: visible; }\n </style>\n ");
            $("body").append(Lampa.Template.get("lampac_css", {}, true));
            lamponline_css_inited = true;
        }

        ensureBalansersWithSearch();

        function balanserName(j) {
            var bals = j.balanser;
            var name = j.name.split(" ")[0];
            return (bals || name).toLowerCase();
        }

        function clarificationSearchAdd(value) {
            clarification_search_value = value;
            clearTimeout(clarification_search_timer);
            clarification_search_timer = setTimeout(function () {
                if (destroyed) return;
                var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
                var all = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
                all[id] = clarification_search_value;
                Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, all);
                clarification_search_timer = 0;
            }, 500);
        }

        function clarificationSearchDelete() {
            clearTimeout(clarification_search_timer);
            clarification_search_timer = 0;
            clarification_search_value = null;
            var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
            var all = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
            delete all[id];
            Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, all);
        }

        this.showServerNotConfigured = function () {
            var html = Lampa.Template.get("lampac_server_not_configured", {});
            html.find(".cancel").on("hover:enter", function () { Lampa.Activity.backward(); });
            html.find(".on_settings").on("hover:enter", function () {
                Lampa.Activity.backward();
                Lampa.Settings.open({ component: "lamponline_settings" });
            });
            scroll.clear();
            scroll.append(html);
            this.loading(false);
        };

        this.initialize = function () {
            UIManager.initTemplates();
            var _this = this;

            if (!isServerConfigured()) {
                this.loading(true);
                scroll.body().addClass("torrent-list");
                files.appendFiles(scroll.render());
                Lampa.Controller.enable("content");
                this.showServerNotConfigured();
                return;
            }

            this.loading(true);

            filter.onSearch = function (value) {
                clarificationSearchAdd(value);
                Lampa.Activity.replace({ search: value, clarification: true, similar: true });
            };

            filter.onBack = function () {
                _this.start();
            };

            filter.render().find(".selector").on("hover:enter", function () {
                clearInterval(balanser_timer);
            });

            filter.render().find(".filter--search").appendTo(filter.render().find(".torrent-filter"));

            function onFilterReset() {
                clarificationSearchDelete();
                _this.replaceChoice({ season: 0, voice: 0, voice_url: "", voice_name: "" });
                clearTimeout(select_timeout_timer);
                select_timeout_timer = setTimeout(function () {
                    if (destroyed) return;
                    Lampa.Select.close();
                    Lampa.Activity.replace({ clarification: 0, similar: 0 });
                }, 10);
            }

            function onFilterSelectItem(a, b) {
                var url = filter_find[a.stype][b.index].url;
                var choice = _this.getChoice();
                if (a.stype == "voice") {
                    choice.voice_name = filter_find.voice[b.index].title;
                    choice.voice_url = url;
                }
                choice[a.stype] = b.index;
                _this.saveChoice(choice);
                _this.reset();
                _this.request(url);
                clearTimeout(select_close_timer);
                select_close_timer = setTimeout(function () {
                    if (destroyed) return;
                    Lampa.Select.close();
                }, 10);
            }

            function onSortSelect(a) {
                Lampa.Select.close();
                object.lampac_custom_select = a.source;
                _this.changeBalanser(a.source);
            }

            filter.onSelect = function (type, a, b) {
                if (type == "filter") {
                    if (a.reset) onFilterReset();
                    else onFilterSelectItem(a, b);
                } else if (type == "sort") {
                    onSortSelect(a);
                }
            };

            if (filter.addButtonBack) filter.addButtonBack();

            filter.render().find(".filter--sort span").text(Lampa.Lang.translate("lampac_balanser"));

            scroll.body().addClass("torrent-list");
            files.appendFiles(scroll.render());
            files.appendHead(filter.render());
            scroll.minus(files.render().find(".explorer__files-head"));
            scroll.body().append(Lampa.Template.get("lampac_content_loading"));
            Lampa.Controller.enable("content");

            this.loading(false);

            if (object.balanser) {
                files.render().find(".filter--search").remove();
                sources = {};
                sources[object.balanser] = { name: object.balanser };
                balanser = object.balanser;
                filter_sources = [];
                var reqUrl = account(object.url.replace("rjson=", "nojson="));
                return network["native"](reqUrl, function (response) {
                    if (destroyed) return;
                    this.parse(response);
                }.bind(this), function (e) {
                    if (destroyed) return;
                    files.render().find(".torrent-filter").remove();
                    _this.empty();
                }, false, { dataType: "text" });
            }

            this.externalids().then(function () {
                if (destroyed) return;
                return _this.createSource();
            }).then(function (json) {
                if (destroyed) return;
                return ensureBalansersWithSearch().then(function (list) {
                    if (destroyed) return;
                    var allow_search = false;
                    for (var i = 0; i < list.length; i++) {
                        var b = list[i];
                        if (balanser.slice(0, b.length) == b) {
                            allow_search = true;
                            break;
                        }
                    }
                    if (!allow_search) {
                        filter.render().find(".filter--search").addClass("hide");
                    }
                    return json;
                });
            }).then(function () {
                if (destroyed) return;
                _this.search();
            })["catch"](function (e) {
                if (destroyed) return;
                _this.noConnectToServer(e);
            });
        };

        // ... весь остальной код component без изменений (rch, externalids, updateBalanser, changeBalanser, requestParams, getLastChoiceBalanser, startSource, lifeSource, createSource, create, search, find, request, parseJsonDate, getFileUrl, toPlayElement, orUrlReserve, setDefaultQuality, display, loadSubtitles, parse, similars, getChoice, saveChoice, replaceChoice, clearImages, reset, loading, filter, selected, getEpisodes, watched, updateWatched, draw, contextMenu, empty, noConnectToServer, doesNotAnswer, getLastEpisode, safeLastFocus, start, render, back, pause, stop, destroy)

        this.destroy = function () {
            destroyed = true;
            // ... как раньше
        };
    }

    function addSourceSearch(spiderName, spiderUri) {
        // ... без изменений
    }

    function startPlugin() {
        window.lamponline_plugin = true;

        var oldUrl = Lampa.Storage.get("lamponline_server_url", "");
        if (oldUrl) {
            oldUrl = oldUrl.replace(/\/+$/, "");
            if (oldUrl && !oldUrl.match(/^https?:\/\//i)) oldUrl = "http://" + oldUrl;
            if (oldUrl) {
                Lampa.Storage.set(STORAGE_KEY_SERVERS, JSON.stringify([oldUrl]));
                Lampa.Storage.set(STORAGE_KEY_ACTIVE, oldUrl);
            }
            Lampa.Storage.set("lamponline_server_url", "");
        }

        var onlineSvg = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M11.783 10.094c-1.699.998-3.766 1.684-5.678 1.95a1.66 1.66 0 0 1-.684.934c.512 1.093 1.249 2.087 2.139 2.987a7.98 7.98 0 0 0 6.702-3.074l.083-.119c-.244-.914-.648-1.784-1.145-2.644q-.134.038-.261.062c-.143.04-.291.068-.446.068a1.7 1.7 0 0 1-.71-.164M9.051 5.492a18 18 0 0 0-2.004-1.256 1.67 1.67 0 0 1-1.907.985c-.407 1.535-.624 3.162-.511 4.694a1.67 1.67 0 0 1 1.52 1.354c1.695-.279 3.47-.879 4.967-1.738a1.67 1.67 0 0 1-.297-.949c0-.413.156-.786.403-1.078-.654-.736-1.389-1.443-2.171-2.012M4 9.989c-.137-1.634.104-3.392.541-5.032a1.67 1.67 0 0 1-.713-1.369c0-.197.039-.386.104-.562a18 18 0 0 0-1.974-.247c-.089.104-.185.204-.269.314a7.98 7.98 0 0 0-1.23 7.547 9.5 9.5 0 0 0 2.397.666A1.67 1.67 0 0 1 4 9.989m9.928-.3c-.029.037-.064.067-.096.1.433.736.799 1.482 1.053 2.268a7.98 7.98 0 0 0 .832-6.122c-.09.133-.176.267-.271.396-.436.601-.875 1.217-1.354 1.772.045.152.076.311.076.479v.004c.084.374.013.779-.24 1.103M7.164 3.447c.799.414 1.584.898 2.33 1.44.84.611 1.627 1.373 2.324 2.164.207-.092.434-.145.676-.145.5 0 .945.225 1.252.572.404-.492.783-1.022 1.161-1.54.194-.268.372-.543.544-.82A7.96 7.96 0 0 0 7.701.012q-.173.217-.339.439c-.401.552-.739 1.08-1.04 1.637.039.029.064.066.1.1.417.276.697.734.742 1.259m-4.285 8.518a10 10 0 0 1-2.07-.487 7.95 7.95 0 0 0 5.806 4.397 11 11 0 0 1-1.753-2.66 1.675 1.675 0 0 1-1.983-1.25m1.635-9.723a1.32 1.32 0 0 1 1.199-.416C6.025 1.24 6.377.683 6.794.104a7.97 7.97 0 0 0-4.247 2.062c.59.066 1.176.14 1.761.252q.096-.095.206-.176" fill="currentColor"></path></svg>';

        Lampa.Settings.listener.follow("open", function (e) {
            if (e.name == "main") {
                if (Lampa.Settings.main().render().find('[data-component="lamponline_settings"]').length == 0) {
                    Lampa.SettingsApi.addComponent({
                        component: "lamponline_settings",
                        name: "Онлайн",
                        icon: onlineSvg
                    });
                }
                Lampa.Settings.main().update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: "lamponline_settings",
            param: {
                name: "server_manager",
                type: "button"
            },
            field: {
                name: "Управление серверами",
                description: "Добавить, выбрать или удалить сервер"
            },
            onRender: function (elem) {
                elem.on("hover:enter", openServerManager);
            }
        });

        // ... остальной код startPlugin (addSourceSearch, Manifest, Lang.add, button для full-start, Listener.follow("full"), try addButton, sync, initBalanserInFilterMenu)
    }

    if (!window.lamponline_plugin) startPlugin();
})();
