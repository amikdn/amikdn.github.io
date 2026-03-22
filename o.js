(function() {
    "use strict";

    var _d = function(s) {
            return atob(s);
        },
        _u0 = ["aH", "R0", "cD", "ov", "Lz", "c4", "Lj", "Qw", "Lj", "E5", "OS", "42", "Nz", "ox", "MD", "Yz", "MA", "=="],
        _u1 = ["aH", "R0", "cH", "M6", "Ly", "9s", "YW", "1w", "YW", "Ru", "Lm", "dp", "dG", "h1", "Yi", "5p", "by", "9u", "d3", "Mt", "Y2", "xp", "ZW", "50", "LW", "Vz", "NS", "5q", "cw", "=="],
        _u2 = ["aH", "R0", "cH", "M6", "Ly", "9n", "aX", "Ro", "dW", "Iu", "Y2", "9t", "Lw", "=="],
        _u3 = ["L2", "Nv", "cn", "Mv", "Y2", "hl", "Y2", "s="],
        _u4 = ["aH", "R0", "cD", "ov", "L3", "d3", "dy", "53", "My", "5v", "cm", "cv", "Mj", "Aw", "MC", "9z", "dm", "c="],
        _p = ["bG", "Ft", "cG", "Fj"],
        Config = {
            Plugin: {
                displayName: "LampaOnline"
            },
            Server: {
                baseUrl: _d(_u0.join(""))
            },
            Urls: {
                NwsClientScript: _d(_u1.join("")),
                GithubCheck: _d(_u2.join("")),
                CorsCheckPath: _d(_u3.join(""))
            },
            Rch: {
                RegistryVersion: 149,
                ClientTimeout: 8e3
            },
            Auth: {
                LampaUid: "",
                LampacUnicId: "",
                Token: ""
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
                OnlineView: "online_view"
            },
            Defined: {
                api: _d(_p.join("")),
                apn: ""
            }
        },
        PLUGIN_COMPONENT = "lamponline_o",
        rawBase = String(Config.Server.baseUrl).trim().replace(/\/+$/, ""),
        serverBase = /^https?:\/\//i.test(rawBase) ? rawBase : "http://" + rawBase.replace(/^\/+/, ""),
        serverLocalhost = serverBase + "/",
        serverHostKey = serverBase.replace(/^https?:\/\//i, ""),
        Defined = {
            api: Config.Defined.api,
            localhost: serverLocalhost,
            apn: Config.Defined.apn
        },
        MY_AUTH = {
            lampa_uid: Config.Auth.LampaUid,
            lampac_unic_id: Config.Auth.LampacUnicId
        },
        balansers_with_search, balansers_with_search_promise;

    function ensureBalansersWithSearch() {
        return void 0 !== balansers_with_search ? Promise.resolve(Lampa.Arrays.isArray(balansers_with_search) ? balansers_with_search : []) : balansers_with_search_promise || (balansers_with_search_promise = new Promise((function(e) {
            var t = new Lampa.Reguest;
            t.timeout(1e4), t.silent(account(Defined.localhost + "lite/withsearch"), (function(t) {
                balansers_with_search = Lampa.Arrays.isArray(t) ? t : [], e(balansers_with_search)
            }), (function(t) {
                console.error(t), e(balansers_with_search = [])
            }))
        })))
    }
    (function syncLampacUnicId() {
        if (Config.Auth.LampacUnicId) {
            Lampa.Storage.set(Config.StorageKeys.LampacUnicId, Config.Auth.LampacUnicId);
            MY_AUTH.lampac_unic_id = Config.Auth.LampacUnicId;
        } else {
            var uid = Lampa.Storage.get(Config.StorageKeys.LampacUnicId, '');
            if (!uid) {
                uid = Lampa.Utils.uid(8).toLowerCase();
                Lampa.Storage.set(Config.StorageKeys.LampacUnicId, uid);
            }
            MY_AUTH.lampac_unic_id = uid;
        }
    })();
    var hostkey = serverHostKey,
        domParser = null,
        lamponline_css_inited = !1,
        Promise = function() {
            if (void 0 !== window.Promise) return window.Promise;

            function e(t) {
                var i = 0,
                    n = null,
                    a = [];

                function o() {
                    setTimeout((function() {
                        for (var e = 0; e < a.length; e++) s(a[e]);
                        a = []
                    }), 0)
                }

                function r(e) {
                    i = 2, n = e, o()
                }

                function s(e) {
                    if (0 !== i) {
                        var t = 1 === i ? e.onFulfilled : e.onRejected;
                        if (t) try {
                            e.resolve(t(n))
                        } catch (t) {
                            e.reject(t)
                        } else(1 === i ? e.resolve : e.reject)(n)
                    } else a.push(e)
                }
                this.then = function(t, i) {
                    return new e((function(e, n) {
                        s({
                            onFulfilled: "function" == typeof t ? t : null,
                            onRejected: "function" == typeof i ? i : null,
                            resolve: e,
                            reject: n
                        })
                    }))
                }, this.catch = function(e) {
                    return this.then(null, e)
                };
                var l = this;
                try {
                    t((function e(t) {
                        try {
                            if (t === l) throw new TypeError("Promise resolved with itself");
                            if (t && ("object" == typeof t || "function" == typeof t)) {
                                var a = t.then;
                                if ("function" == typeof a) return a.call(t, e, r)
                            }
                            i = 1, n = t, o()
                        } catch (e) {
                            r(e)
                        }
                    }), r)
                } catch (e) {
                    r(e)
                }
            }
            return e.resolve = function(t) {
                return new e((function(e) {
                    e(t)
                }))
            }, e.reject = function(t) {
                return new e((function(e, i) {
                    i(t)
                }))
            }, e
        }();
    window.rch_nws && window.rch_nws[hostkey] || (window.rch_nws || (window.rch_nws = {}), window.rch_nws[hostkey] = {
        type: Lampa.Platform.is("android") ? "apk" : Lampa.Platform.is("tizen") ? "cors" : void 0,
        startTypeInvoke: !1,
        rchRegistry: !1,
        apkVersion: 0
    }), "function" != typeof window.rch_nws[hostkey].typeInvoke && (window.rch_nws[hostkey].typeInvoke = function(e, t) {
        if (window.rch_nws[hostkey].startTypeInvoke) t();
        else {
            window.rch_nws[hostkey].startTypeInvoke = !0;
            var i = function(e) {
                window.rch_nws[hostkey].type = Lampa.Platform.is("android") ? "apk" : e ? "cors" : "web", t()
            };
            if (Lampa.Platform.is("android") || Lampa.Platform.is("tizen")) i(!0);
            else(new Lampa.Reguest).silent(serverBase.indexOf(location.host) >= 0 ? Config.Urls.GithubCheck : e + Config.Urls.CorsCheckPath, (function() {
                i(!0)
            }), (function() {
                i(!1)
            }), !1, {
                dataType: "text"
            })
        }
    }), "function" != typeof window.rch_nws[hostkey].Registry && (window.rch_nws[hostkey].Registry = function RchRegistry(client, startConnection) {
        new Promise((function(e) {
            window.rch_nws[hostkey].typeInvoke(serverBase, e)
        })).then((function() {
            client.invoke("RchRegistry", JSON.stringify({
                version: Config.Rch.RegistryVersion,
                host: location.host,
                rchtype: Lampa.Platform.is("android") ? "apk" : Lampa.Platform.is("tizen") ? "cors" : window.rch_nws[hostkey].type,
                apkVersion: window.rch_nws[hostkey].apkVersion,
                player: Lampa.Storage.field("player"),
                account_email: "",
                unic_id: MY_AUTH.lampac_unic_id,
                profile_id: Lampa.Storage.get(Config.StorageKeys.LampacProfileId, ""),
                token: Config.Auth.Token
            })), client._shouldReconnect && window.rch_nws[hostkey].rchRegistry ? startConnection && startConnection() : (window.rch_nws[hostkey].rchRegistry = !0, client.on("RchRegistry", (function(e) {
                startConnection && startConnection()
            })), client.on("RchClient", (function(rchId, url, data, headers, returnHeaders) {
                var network = new Lampa.Reguest;

                function result(e) {
                    (Lampa.Arrays.isObject(e) || Lampa.Arrays.isArray(e)) && (e = JSON.stringify(e)), client.invoke("RchResult", rchId, e)
                }
                "eval" == url ? result(eval(data)) : "ping" == url ? result("pong") : network.native(url, result, (function() {
                    result("")
                }), data, {
                    dataType: "text",
                    timeout: Config.Rch.ClientTimeout,
                    headers: headers,
                    returnHeaders: returnHeaders
                })
            })), client.on("Connected", (function(e) {
                window.rch_nws[hostkey].connectionId = e
            })))
        })).catch((function(e) {
            console.error(e), startConnection && startConnection()
        }))
    }), window.rch_nws[hostkey].typeInvoke(serverBase, (function() {}));
    var RchController = function() {
        var e;

        function t() {
            return window.nwsClient && window.nwsClient[hostkey] ? window.nwsClient[hostkey] : null
        }
        return {
            connect: function(i) {
                return ("undefined" != typeof NativeWsClient ? Promise.resolve() : e || (e = new Promise((function(e) {
                    Lampa.Utils.putScript([Config.Urls.NwsClientScript], (function() {}), !1, e, !0)
                })))).then((function() {
                    return new Promise((function(e, n) {
                        try {
                            if (window.nwsClient && window.nwsClient[hostkey] && window.nwsClient[hostkey]._shouldReconnect) return e(t());
                            window.nwsClient || (window.nwsClient = {}), window.nwsClient[hostkey] && window.nwsClient[hostkey].socket && window.nwsClient[hostkey].socket.close(), window.nwsClient[hostkey] = new NativeWsClient(i.nws, {
                                autoReconnect: !1
                            }), window.nwsClient[hostkey].on("Connected", (function(i) {
                                window.rch_nws[hostkey].Registry(window.nwsClient[hostkey], (function() {
                                    e(t())
                                }))
                            })), window.nwsClient[hostkey].connect()
                        } catch (e) {
                            console.error(e), n(e)
                        }
                    }))
                }))
            },
            send: function() {
                var e = t();
                e && e.invoke && e.invoke.apply(e, arguments)
            },
            onMessage: function(e, i) {
                var n = t();
                n && n.on && n.on(e, i)
            },
            getClient: t
        }
    }();

    function rchRun(e, t) {
        RchController.connect(e).then((function() {
            t()
        })).catch((function(e) {
            console.error(e)
        }))
    }

    function rchInvoke(e, t) {
        rchRun(e, t)
    }

    function buildUrl(e, t) {
        if (e += "", t && t.length && (e = e + (e.indexOf("?") >= 0 ? "&" : "?") + t.join("&")), -1 == e.indexOf("uid=") && (e = Lampa.Utils.addUrlComponent(e, "uid=" + encodeURIComponent(MY_AUTH.lampac_unic_id))), -1 == e.indexOf("device_id=") && (e = Lampa.Utils.addUrlComponent(e, "device_id=" + encodeURIComponent(MY_AUTH.lampa_uid))), -1 == e.indexOf("token=")) {
            var i = Config.Auth.Token;
            i && (e = Lampa.Utils.addUrlComponent(e, "token=" + i))
        }
        return e
    }

    function account(e) {
        return buildUrl(e)
    }

    function formatCardInfo(e, t) {
        if (!e || !e.length) return "";
        var i = '<span class="online-prestige-split">●</span>';
        return t ? e.map((function(e) {
            return "<span>" + e + "</span>"
        })).join(i) : e.join(i)
    }
    var Network = Lampa.Reguest;

    function component(e) {
        var t, i, n, a, o, r, s, l, c, m, p = new Network,
            d = new Lampa.Scroll({
                mask: !0,
                over: !0
            }),
            u = new Lampa.Explorer(e),
            h = new Lampa.Filter(e),
            f = {},
            g = [],
            v = 0,
            _ = 0,
            y = !1,
            w = null,
            b = {},
            L = {
                season: Lampa.Lang.translate("torrent_serial_season"),
                voice: Lampa.Lang.translate("torrent_parser_voice"),
                source: Lampa.Lang.translate("settings_rest_source")
            },
            k = {
                season: [],
                voice: []
            },
            x = function() {
                function t() {
                    return (window.rch_nws && window.rch_nws[hostkey] ? window.rch_nws[hostkey].type : window.rch && window.rch[hostkey] ? window.rch[hostkey].type : "") || ""
                }
                return {
                    timeout: function(e) {
                        p.timeout(e)
                    },
                    clear: function() {
                        p.clear()
                    },
                    getRchType: t,
                    buildMovieUrl: function(i) {
                        var n = [],
                            a = e.movie.source || "tmdb";
                        return n.push("id=" + encodeURIComponent(e.movie.id)), e.movie.imdb_id && n.push("imdb_id=" + (e.movie.imdb_id || "")), e.movie.kinopoisk_id && n.push("kinopoisk_id=" + (e.movie.kinopoisk_id || "")), e.movie.tmdb_id && n.push("tmdb_id=" + (e.movie.tmdb_id || "")), n.push("title=" + encodeURIComponent(e.clarification ? e.search : e.movie.title || e.movie.name)), n.push("original_title=" + encodeURIComponent(e.movie.original_title || e.movie.original_name)), n.push("serial=" + (e.movie.name ? 1 : 0)), n.push("original_language=" + (e.movie.original_language || "")), n.push("year=" + ((e.movie.release_date || e.movie.first_air_date || "0000") + "").slice(0, 4)), n.push("source=" + a), n.push("clarification=" + (e.clarification ? 1 : 0)), n.push("similar=" + !!e.similar), n.push("rchtype=" + t()), buildUrl(i, n)
                    },
                    silentPromise: function(e, t, i) {
                        return new Promise((function(n, a) {
                            p.silent(e, (function(e) {
                                y || n(e)
                            }), (function(e) {
                                y || a(e)
                            }), t, i)
                        }))
                    },
                    nativePromise: function(e, t, i) {
                        return new Promise((function(n, a) {
                            p.native(e, (function(e) {
                                y || n(e)
                            }), (function(e) {
                                y || a(e)
                            }), t, i)
                        }))
                    }
                }
            }(),
            C = function() {
                var t = Config.StorageKeys;

                function i(i) {
                    var a = Lampa.Storage.cache(t.OnlineChoicePrefix + (i || n), 3e3, {})[e.movie.id] || {};
                    return Lampa.Arrays.extend(a, {
                        season: 0,
                        voice: 0,
                        voice_name: "",
                        voice_id: 0,
                        episodes_view: {},
                        movie_view: ""
                    }), a
                }

                function a(i, a) {
                    var r = Lampa.Storage.cache(t.OnlineChoicePrefix + (a || n), 3e3, {});
                    r[e.movie.id] = i, Lampa.Storage.set(t.OnlineChoicePrefix + (a || n), r), o(a || n)
                }

                function o(i) {
                    var n = Lampa.Storage.cache(t.OnlineLastBalanser, 3e3, {});
                    n[e.movie.id] = i, Lampa.Storage.set(t.OnlineLastBalanser, n)
                }
                return {
                    getChoice: i,
                    saveChoice: a,
                    replaceChoice: function(e, t) {
                        var n = i(t);
                        Lampa.Arrays.extend(n, e, !0), a(n, t)
                    },
                    updateBalanser: o,
                    watched: function(i) {
                        var n = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title),
                            a = Lampa.Storage.cache(t.OnlineWatchedLast, 5e3, {});
                        return i ? (a[n] || (a[n] = {}), Lampa.Arrays.extend(a[n], i, !0), Lampa.Storage.set(t.OnlineWatchedLast, a), !0) : a[n]
                    },
                    getLastChoiceBalanser: function() {
                        var i = Lampa.Storage.cache(t.OnlineLastBalanser, 3e3, {});
                        return i[e.movie.id] ? i[e.movie.id] : Lampa.Storage.get(t.OnlineBalanser, b.length ? b[0] : "")
                    }
                }
            }(),
            S = function() {
                ! function() {
                    if (lamponline_css_inited) return;
                    Lampa.Template.add("lampac_prestige_full", '<div class="online-prestige online-prestige--full selector">\n            <div class="online-prestige__img">\n                <img alt="">\n                <div class="online-prestige__loader"></div>\n            </div>\n            <div class="online-prestige__body">\n                <div class="online-prestige__head">\n                    <div class="online-prestige__title">{title}</div>\n                    <div class="online-prestige__time">{time}</div>\n                </div>\n\n                <div class="online-prestige__timeline"></div>\n\n                <div class="online-prestige__footer">\n                    <div class="online-prestige__info">{info}</div>\n                    <div class="online-prestige__quality">{quality}</div>\n                </div>\n            </div>\n        </div>'), Lampa.Template.add("lampac_content_loading", '<div class="online-empty">\n            <div class="broadcast__scan"><div></div></div>\n\t\t\t\n            <div class="online-empty__templates">\n                <div class="online-empty-template selector">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n            </div>\n        </div>'), Lampa.Template.add("lampac_does_not_answer", '<div class="online-empty">\n            <div class="online-empty__title">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class="online-empty__time">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class="online-empty__buttons">\n                <div class="online-empty__button selector cancel">#{cancel}</div>\n                <div class="online-empty__button selector change">#{lampac_change_balanser}</div>\n            </div>\n            <div class="online-empty__templates">\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n            </div>\n        </div>'), Lampa.Template.add("lampac_prestige_rate", '<div class="online-prestige-rate">\n            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="' + _d(_u4.join("")) + '">\n                <path d="M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z" fill="#fff"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>'), Lampa.Template.add("lampac_prestige_folder", '<div class="online-prestige online-prestige--folder selector">\n            <div class="online-prestige__folder">\n                <svg viewBox="0 0 128 112" fill="none" xmlns="' + _d(_u4.join("")) + '">\n                    <rect y="20" width="128" height="92" rx="13" fill="white"></rect>\n                    <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"></path>\n                    <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"></rect>\n                </svg>\n            </div>\n            <div class="online-prestige__body">\n                <div class="online-prestige__head">\n                    <div class="online-prestige__title">{title}</div>\n                    <div class="online-prestige__time">{time}</div>\n                </div>\n\n                <div class="online-prestige__footer">\n                    <div class="online-prestige__info">{info}</div>\n                </div>\n            </div>\n        </div>'), Lampa.Template.add("lampac_prestige_watched", '<div class="online-prestige online-prestige-watched selector">\n            <div class="online-prestige-watched__icon">\n                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="' + _d(_u4.join("")) + '">\n                    <circle cx="10.5" cy="10.5" r="9" stroke="currentColor" stroke-width="3"/>\n                    <path d="M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z" fill="currentColor"/>\n                </svg>\n            </div>\n            <div class="online-prestige-watched__body">\n                \n            </div>\n        </div>'), Lampa.Template.add("lampac_css", "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{visibility:hidden;position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1;visibility:visible}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}.lampac-balanser-loader{display:inline-block;width:1.2em;height:1.2em;margin-top:0;margin-left:0.5em;background:url(./img/loader.svg) no-repeat 50% 50%;background-size:contain}.lampac-similar-img{height:7em;width:7em;border-radius:0.3em;visibility:hidden;}.lampac-dim-opacity{opacity:0.5}\n.lampac-similar-img.loaded { visibility: visible; }\n        </style>\n    "), $("body").append(Lampa.Template.get("lampac_css", {}, !0)), lamponline_css_inited = !0
                }()
            },
            T = function() {
                function e(e) {
                    if (e.url && "string" == typeof e.url && -1 !== e.url.indexOf(" or ")) {
                        var t = e.url.split(" or ");
                        e.url = t[0], e.url_reserve = t[1]
                    }
                }
                return {
                    toPlayElement: function(e) {
                        return {
                            title: e.title,
                            url: e.url,
                            quality: e.qualitys,
                            timeline: e.timeline,
                            subtitles: e.subtitles,
                            segments: e.segments,
                            callback: e.mark,
                            season: e.season,
                            episode: e.episode,
                            voice_name: e.voice_name
                        }
                    },
                    orUrlReserve: e,
                    setDefaultQuality: function(t) {
                        if (Lampa.Arrays.getKeys(t.quality).length)
                            for (var i in t.quality) parseInt(i) == Lampa.Storage.field("video_quality_default") && (t.url = t.quality[i], e(t)), -1 !== t.quality[i].indexOf(" or ") && (t.quality[i] = t.quality[i].split(" or ")[0])
                    },
                    loadSubtitles: function(e) {
                        p.silent(account(e), (function(e) {
                            Lampa.Player.subtitles(e)
                        }), (function(e) {
                            console.error(e)
                        }))
                    }
                }
            }();

        function A(e) {
            var t = e.balanser,
                i = e.name.split(" ")[0];
            return (t || i).toLowerCase()
        }
        ensureBalansersWithSearch(), this.initialize = function() {
            S();
            var t = this;

            function i() {
                ! function() {
                    clearTimeout(m), m = 0, w = null;
                    var t = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title),
                        i = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
                    delete i[t], Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, i)
                }(), t.replaceChoice({
                    season: 0,
                    voice: 0,
                    voice_url: "",
                    voice_name: ""
                }), clearTimeout(l), l = setTimeout((function() {
                    y || (Lampa.Select.close(), Lampa.Activity.replace({
                        clarification: 0,
                        similar: 0
                    }))
                }), 10)
            }
            if (this.loading(!0), h.onSearch = function(t) {
                    ! function(t) {
                        w = t, clearTimeout(m), m = setTimeout((function() {
                            if (!y) {
                                var t = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title),
                                    i = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
                                i[t] = w, Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, i), m = 0
                            }
                        }), 500)
                    }(t), Lampa.Activity.replace({
                        search: t,
                        clarification: !0,
                        similar: !0
                    })
                }, h.onBack = function() {
                    t.start()
                }, h.render().find(".selector").on("hover:enter", (function() {
                    clearInterval(o)
                })), h.render().find(".filter--search").appendTo(h.render().find(".torrent-filter")), h.onSelect = function(n, a, o) {
                    "filter" == n ? a.reset ? i() : function(e, i) {
                        var n = k[e.stype][i.index].url,
                            a = t.getChoice();
                        "voice" == e.stype && (a.voice_name = k.voice[i.index].title, a.voice_url = n), a[e.stype] = i.index, t.saveChoice(a), t.reset(), t.request(n), clearTimeout(c), c = setTimeout((function() {
                            y || Lampa.Select.close()
                        }), 10)
                    }(a, o) : "sort" == n && function(i) {
                        Lampa.Select.close(), e.lampac_custom_select = i.source, t.changeBalanser(i.source)
                    }(a)
                }, h.addButtonBack && h.addButtonBack(), h.render().find(".filter--sort span").text(Lampa.Lang.translate("lampac_balanser")), d.body().addClass("torrent-list"), u.appendFiles(d.render()), u.appendHead(h.render()), d.minus(u.render().find(".explorer__files-head")), d.body().append(Lampa.Template.get("lampac_content_loading")), Lampa.Controller.enable("content"), this.loading(!1), e.balanser) {
                u.render().find(".filter--search").remove(), (f = {})[e.balanser] = {
                    name: e.balanser
                }, n = e.balanser, b = [];
                var a = account(e.url.replace("rjson=", "nojson="));
                return p.native(a, function(e) {
                    y || this.parse(e)
                }.bind(this), (function(e) {
                    y || (u.render().find(".torrent-filter").remove(), t.empty())
                }), !1, {
                    dataType: "text"
                })
            }
            this.externalids().then((function() {
                if (!y) return t.createSource()
            })).then((function(e) {
                if (!y) return ensureBalansersWithSearch().then((function(t) {
                    if (!y) {
                        for (var i = !1, a = 0; a < t.length; a++) {
                            var o = t[a];
                            if (n.slice(0, o.length) == o) {
                                i = !0;
                                break
                            }
                        }
                        return i || h.render().find(".filter--search").addClass("hide"), e
                    }
                }))
            })).then((function() {
                y || t.search()
            })).catch((function(e) {
                y || t.noConnectToServer(e)
            }))
        }, this.rch = function(e, t) {
            var i = this;
            rchRun(e, (function() {
                y || (t ? t() : i.find())
            }))
        }, this.externalids = function() {
            if (e.movie.imdb_id && e.movie.kinopoisk_id) return Promise.resolve();
            var t = [];
            t.push("id=" + encodeURIComponent(e.movie.id)), t.push("serial=" + (e.movie.name ? 1 : 0)), e.movie.imdb_id && t.push("imdb_id=" + (e.movie.imdb_id || "")), e.movie.kinopoisk_id && t.push("kinopoisk_id=" + (e.movie.kinopoisk_id || ""));
            var i = account(Defined.localhost + "externalids?" + t.join("&"));
            return x.timeout(1e4), x.silentPromise(i).then((function(t) {
                if (!y)
                    for (var i in t) e.movie[i] = t[i]
            })).catch((function(e) {
                y || console.error(e)
            }))
        }, this.updateBalanser = function(e) {
            C.updateBalanser(e)
        }, this.changeBalanser = function(e) {
            this.updateBalanser(e), Lampa.Storage.set(Config.StorageKeys.OnlineBalanser, e);
            var t = this.getChoice(e),
                i = this.getChoice();
            i.voice_name && (t.voice_name = i.voice_name), this.saveChoice(t, e), Lampa.Activity.replace()
        }, this.requestParams = function(e) {
            return x.buildMovieUrl(e)
        }, this.getLastChoiceBalanser = function() {
            return C.getLastChoiceBalanser()
        }, this.startSource = function(t) {
            if (t.forEach((function(e) {
                    var t = A(e);
                    f[t] = {
                        url: e.url,
                        name: e.name,
                        show: void 0 === e.show || e.show
                    }
                })), !(b = Lampa.Arrays.getKeys(f)).length) return Promise.reject();
            var a = Lampa.Storage.cache(Config.StorageKeys.OnlineLastBalanser, 3e3, {});
            return n = a[e.movie.id] ? a[e.movie.id] : Lampa.Storage.get(Config.StorageKeys.OnlineBalanser, b[0]), f[n] || (n = b[0]), f[n].show || e.lampac_custom_select || (n = b[0]), i = f[n].url, Lampa.Storage.set(Config.StorageKeys.ActiveBalanser, n), Promise.resolve(t)
        }, this.lifeSource = function() {
            var e = this;
            return new Promise((function(t, i) {
                var a = e.requestParams(Defined.localhost + "lifeevents?memkey=" + (e.memkey || "")),
                    o = !1,
                    r = !1;

                function l() {
                    s = setTimeout((function() {
                        y || r || m()
                    }), 1e3)
                }

                function c(n, a) {
                    if (n && n.accsdb) return r = !0, void i(n);
                    if (!o) {
                        var s = e.getLastChoiceBalanser();
                        n.online.filter((function(e) {
                            return a ? e.show : e.show && e.name.toLowerCase() == s
                        })).length ? (o = !0, t(n.online.filter((function(e) {
                            return e.show
                        })))) : a && (r = !0, i())
                    }
                }

                function m() {
                    x.timeout(3e3), x.silentPromise(a).then((function(t) {
                        if (!y) {
                            _++, b = [], f = {}, t.online.forEach((function(e) {
                                var t = A(e);
                                f[t] = {
                                    url: e.url,
                                    name: e.name,
                                    show: void 0 === e.show || e.show
                                }
                            })), b = Lampa.Arrays.getKeys(f), h.set("sort", b.map((function(e) {
                                return {
                                    title: f[e].name,
                                    source: e,
                                    selected: e == n,
                                    ghost: !f[e].show
                                }
                            }))), h.chosen("sort", [f[n] ? f[n].name : n]), c(t, !1);
                            var i = e.getLastChoiceBalanser();
                            _ > 15 || t.ready ? (r = !0, h.render().find(".lampac-balanser-loader").remove(), c(t, !0)) : !o && f[i] && f[i].show ? (c(t, !0), l()) : l()
                        }
                    })).catch((function(e) {
                        y || (++_ > 15 ? (r = !0, i(e)) : l())
                    }))
                }
                m()
            }))
        }, this.createSource = function() {
            var t = this,
                i = t.requestParams(Defined.localhost + "lite/events?life=true");
            return x.timeout(15e3), x.silentPromise(i).then((function(i) {
                if (!y) return i.accsdb ? Promise.reject(i) : i.life ? (t.memkey = i.memkey, i.title && (e.movie.name && (e.movie.name = i.title), e.movie.title && (e.movie.title = i.title)), h.render().find(".filter--sort").append('<span class="lampac-balanser-loader"></span>'), t.lifeSource().then((function(e) {
                    if (!y) return t.startSource(e)
                }))) : t.startSource(i)
            }))
        }, this.create = function() {
            return this.render()
        }, this.search = function() {
            this.filter({
                source: b
            }, this.getChoice()), this.find()
        }, this.find = function() {
            this.request(this.requestParams(i))
        }, this.request = function(e) {
            v++;
            var t = account(e);
            v < 10 ? (p.native(t, function(e) {
                y || this.parse(e)
            }.bind(this), this.doesNotAnswer.bind(this), !1, {
                dataType: "text"
            }), clearTimeout(r), r = setTimeout((function() {
                y || (v = 0)
            }), 4e3)) : this.empty()
        }, this.parseJsonDate = function(t, i) {
            var n = [];
            if ("string" != typeof t) return [];
            var a = null;
            try {
                if (domParser || "undefined" == typeof DOMParser || (domParser = new DOMParser), domParser) {
                    var o = domParser.parseFromString("<div>" + t + "</div>", "text/html");
                    o && o.body && (a = o.body)
                }
            } catch (e) {}
            if (!a) try {
                (a = document.createElement("div")).innerHTML = t
            } catch (e) {
                return n
            }
            var r = [];
            try {
                r = a.querySelectorAll ? a.querySelectorAll(i) : []
            } catch (e) {
                r = []
            }
            for (var s = 0; s < r.length; s++) {
                var l = r[s];
                try {
                    var c = l.getAttribute("data-json");
                    if (!c) continue;
                    var m = JSON.parse(c),
                        p = l.getAttribute("s"),
                        d = l.getAttribute("e"),
                        u = l.textContent || l.innerText || "";
                    e.movie.name || (u.match(/\d+p/i) && (m.quality || (m.quality = {}, m.quality[u] = m.url), u = e.movie.title), "По умолчанию" == u && (u = e.movie.title)), d && (m.episode = parseInt(d)), p && (m.season = parseInt(p)), u && (m.text = u), m.active = -1 !== (" " + (l.className || "") + " ").indexOf(" active "), n.push(m)
                } catch (e) {
                    console.error(e)
                }
            }
            return n
        }, this.getFileUrl = function(e, t, i) {
            var n = this;
            if ("inner" !== Lampa.Storage.field("player") && e.stream && Lampa.Platform.is("apple")) {
                var a = Lampa.Arrays.clone(e);
                a.method = "play", a.url = e.stream, t(a, {})
            } else "play" == e.method ? t(e, {}) : (Lampa.Loading.start((function() {
                Lampa.Loading.stop(), Lampa.Controller.toggle("content"), p.clear()
            })), p.native(account(e.url), (function(a) {
                y || (a.rch ? i ? (Lampa.Loading.stop(), t(!1, {})) : n.rch(a, (function() {
                    y || (Lampa.Loading.stop(), n.getFileUrl(e, t, !0))
                })) : (Lampa.Loading.stop(), t(a, a)))
            }), (function() {
                y || (Lampa.Loading.stop(), t(!1, {}))
            })))
        }, this.toPlayElement = function(e) {
            return T.toPlayElement(e)
        }, this.orUrlReserve = function(e) {
            T.orUrlReserve(e)
        }, this.setDefaultQuality = function(e) {
            T.setDefaultQuality(e)
        }, this.display = function(e) {
            var t = this;
            this.draw(e, {
                onEnter: function(i, a) {
                    t.getFileUrl(i, (function(a, o) {
                        if (a && a.url) {
                            var r = [],
                                s = t.toPlayElement(i);
                            if (s.url = a.url, s.headers = o.headers || a.headers, s.quality = o.quality || i.qualitys, s.segments = o.segments || i.segments, s.hls_manifest_timeout = o.hls_manifest_timeout || a.hls_manifest_timeout, s.subtitles = a.subtitles, s.subtitles_call = o.subtitles_call || a.subtitles_call, a.vast && a.vast.url && (s.vast_url = a.vast.url, s.vast_msg = a.vast.msg, s.vast_region = a.vast.region, s.vast_platform = a.vast.platform, s.vast_screen = a.vast.screen), t.orUrlReserve(s), t.setDefaultQuality(s), i.season ? e.forEach((function(e) {
                                    var n = t.toPlayElement(e);
                                    e == i ? n.url = a.url : "call" == e.method ? "inner" !== Lampa.Storage.field("player") ? (n.url = e.stream, delete n.quality) : n.url = function(i) {
                                        t.getFileUrl(e, (function(a, o) {
                                            a.url ? (n.url = a.url, n.quality = o.quality || e.qualitys, n.segments = o.segments || e.segments, n.subtitles = a.subtitles, t.orUrlReserve(n), t.setDefaultQuality(n), e.mark()) : (n.url = "", Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"))), i()
                                        }), (function() {
                                            n.url = "", i()
                                        }))
                                    } : n.url = e.url, t.orUrlReserve(n), t.setDefaultQuality(n), r.push(n)
                                })) : r.push(s), r.length > 1 && (s.playlist = r), s.url) {
                                var l = s;
                                l.isonline = !0, Lampa.Player.play(l), Lampa.Player.playlist(r), l.subtitles_call && t.loadSubtitles(l.subtitles_call), i.mark(), t.updateBalanser(n)
                            } else Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"))
                        } else Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"))
                    }), !0)
                },
                onContextMenu: function(e, i, n, a) {
                    t.getFileUrl(e, (function(t) {
                        a({
                            file: t.url,
                            quality: e.qualitys
                        })
                    }), !0)
                }
            }), this.filter({
                season: k.season.map((function(e) {
                    return e.title
                })),
                voice: k.voice.map((function(e) {
                    return e.title
                }))
            }, this.getChoice())
        }, this.loadSubtitles = function(e) {
            T.loadSubtitles(e)
        }, this.parse = function(e) {
            if (!y) {
                var t = Lampa.Arrays.decodeJson(e, {});
                if (Lampa.Arrays.isObject(e) && e.rch && (t = e), t.rch) return this.rch(t);
                try {
                    var i = this.parseJsonDate(e, ".videos__item"),
                        a = this.parseJsonDate(e, ".videos__button");
                    if (1 != i.length || "link" != i[0].method || i[0].similar) {
                        this.activity.loader(!1);
                        var o = i.filter((function(e) {
                                return "play" == e.method || "call" == e.method
                            })),
                            r = i.filter((function(e) {
                                return e.similar
                            }));
                        if (o.length)
                            if (a.length) {
                                k.voice = a.map((function(e) {
                                    return {
                                        title: e.text,
                                        url: e.url
                                    }
                                }));
                                for (var s = this.getChoice(n).voice_url, l = this.getChoice(n).voice_name, c = null, m = null, p = null, d = 0; d < a.length; d++) {
                                    var u = a[d];
                                    if (c || u.url != s || (c = u), m || u.text != l || (m = u), !p && u.active && (p = u), c && m && p) break
                                }
                                c && !c.active ? (this.replaceChoice({
                                    voice: a.indexOf(c),
                                    voice_name: c.text
                                }), this.request(c.url)) : m && !m.active ? (this.replaceChoice({
                                    voice: a.indexOf(m),
                                    voice_name: m.text
                                }), this.request(m.url)) : (p && this.replaceChoice({
                                    voice: a.indexOf(p),
                                    voice_name: p.text
                                }), this.display(o))
                            } else this.replaceChoice({
                                voice: 0,
                                voice_url: "",
                                voice_name: ""
                            }), this.display(o);
                        else if (i.length)
                            if (r.length) this.similars(r), this.activity.loader(!1);
                            else {
                                k.season = i.map((function(e) {
                                    return {
                                        title: e.text,
                                        url: e.url
                                    }
                                }));
                                var h = this.getChoice(n).season,
                                    f = k.season[h];
                                f || (f = k.season[0]), this.request(f.url)
                            }
                        else this.doesNotAnswer(t)
                    } else k.season = i.map((function(e) {
                        return {
                            title: e.text,
                            url: e.url
                        }
                    })), this.replaceChoice({
                        season: 0
                    }), this.request(i[0].url)
                } catch (e) {
                    this.doesNotAnswer(e)
                }
            }
        }, this.similars = function(i) {
            var n = this,
                a = document.createDocumentFragment();
            i.forEach((function(i) {
                i.title = i.text, i.info = "";
                var o = [],
                    r = ((i.start_date || i.year || e.movie.release_date || e.movie.first_air_date || "") + "").slice(0, 4);
                r && o.push(r), i.details && o.push(i.details);
                var s = i.title || i.text;
                i.title = s, i.time = i.time || "", i.info = formatCardInfo(o);
                var l = Lampa.Template.get("lampac_prestige_folder", i);
                if (i.img) {
                    var c = $('<img class="lampac-similar-img"/>'),
                        m = c[0];
                    l.find(".online-prestige__folder").empty().append(c), g.push(m), void 0 !== i.img && ("/" === i.img.charAt(0) && (i.img = Defined.localhost + i.img.substring(1)), -1 !== i.img.indexOf("/proxyimg") && (i.img = account(i.img)));
                    var p = new Image;
                    p.onload = function() {
                        y || (m.src = p.src, -1 == (" " + m.className + " ").indexOf(" loaded ") && (m.className = (m.className ? m.className + " " : "") + "loaded"))
                    }, p.onerror = function() {
                        y || (m.src = "./img/img_broken.svg", -1 == (" " + m.className + " ").indexOf(" loaded ") && (m.className = (m.className ? m.className + " " : "") + "loaded"))
                    }, p.src = i.img, g.push(p)
                }
                l.on("hover:enter", (function() {
                    n.reset(), n.request(i.url)
                })).on("hover:focus", (function(e) {
                    t = e.target, d.update($(e.target), !0)
                })), l && l[0] && a.appendChild(l[0])
            })), d.clear(), d.body()[0].appendChild(a), this.filter({
                season: k.season.map((function(e) {
                    return e.title
                })),
                voice: k.voice.map((function(e) {
                    return e.title
                }))
            }, this.getChoice()), Lampa.Controller.enable("content")
        }, this.getChoice = function(e) {
            return C.getChoice(e)
        }, this.saveChoice = function(e, t) {
            C.saveChoice(e, t)
        }, this.replaceChoice = function(e, t) {
            C.replaceChoice(e, t)
        }, this.clearImages = function() {
            g.forEach((function(e) {
                if (e) try {
                    e.onerror = null, e.onload = null, e.removeAttribute("src")
                } catch (e) {
                    console.error(e)
                }
            })), g = []
        }, this.reset = function() {
            t = !1, clearInterval(o), clearTimeout(s), clearTimeout(r), clearTimeout(l), clearTimeout(c), p.clear(), this.clearImages(), d.render().find(".empty").remove(), d.clear(), d.reset(), d.body().append(Lampa.Template.get("lampac_content_loading"))
        }, this.loading = function(e) {
            e ? this.activity.loader(!0) : (this.activity.loader(!1), this.activity.toggle())
        }, this.filter = function(e, t) {
            var i = this,
                a = [],
                o = function(t, n) {
                    var o = i.getChoice(),
                        r = e[t],
                        s = [],
                        l = o[t];
                    r.forEach((function(e, t) {
                        s.push({
                            title: e,
                            selected: l == t,
                            index: t
                        })
                    })), a.push({
                        title: n,
                        subtitle: r[l],
                        items: s,
                        stype: t
                    })
                };
            e.source = b, a.push({
                title: Lampa.Lang.translate("torrent_parser_reset"),
                reset: !0
            }), this.saveChoice(t), e.voice && e.voice.length && o("voice", Lampa.Lang.translate("torrent_parser_voice")), e.season && e.season.length && o("season", Lampa.Lang.translate("torrent_serial_season")), h.set("filter", a), h.set("sort", b.map((function(e) {
                return {
                    title: f[e].name,
                    source: e,
                    selected: e == n,
                    ghost: !f[e].show
                }
            }))), this.selected(e)
        }, this.selected = function(e) {
            var t = this.getChoice(),
                i = [];
            for (var a in t) e[a] && e[a].length && ("voice" == a ? i.push(L[a] + ": " + e[a][t[a]]) : "source" !== a && e.season.length >= 1 && i.push(L.season + ": " + e[a][t[a]]));
            h.chosen("filter", i), h.chosen("sort", [f[n].name])
        }, this.getEpisodes = function(t, i) {
            var n = [],
                a = e.movie.id; - 1 == ["cub", "tmdb"].indexOf(e.movie.source || "tmdb") && (a = e.movie.tmdb_id), "number" == typeof a && e.movie.name ? Lampa.Api.sources.tmdb.get("tv/" + a + "/season/" + t, {}, (function(e) {
                y || (n = e.episodes || [], i(n))
            }), (function() {
                y || i(n)
            })) : i(n)
        }, this.watched = function(e) {
            if (!e) return C.watched();
            C.watched(e), this.updateWatched()
        }, this.updateWatched = function() {
            var e = this.watched(),
                t = d.body().find(".online-prestige-watched .online-prestige-watched__body").empty();
            if (e) {
                var i = [];
                e.balanser_name && i.push(e.balanser_name), e.voice_name && i.push(e.voice_name), e.season && i.push(Lampa.Lang.translate("torrent_serial_season") + " " + e.season), e.episode && i.push(Lampa.Lang.translate("torrent_serial_episode") + " " + e.episode), i.forEach((function(e) {
                    t.append("<span>" + e + "</span>")
                }))
            } else t.append("<span>" + Lampa.Lang.translate("lampac_no_watch_history") + "</span>")
        }, this.draw = function(i) {
            var a = this,
                o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            if (!i.length) return this.empty();
            this.getEpisodes(i[0].season, (function(r) {
                if (!y) {
                    var s = Lampa.Storage.cache(Config.StorageKeys.OnlineView, 5e3, []),
                        l = !!e.movie.name,
                        c = a.getChoice(),
                        m = window.innerWidth > 480,
                        p = !1,
                        u = !1,
                        h = document.createDocumentFragment(),
                        v = [];
                    if (i.forEach((function(g, _) {
                            var w = !1;
                            if (l && r.length && !o.similars)
                                for (var b = 0; b < r.length; b++)
                                    if (r[b].episode_number == g.episode) {
                                        w = r[b];
                                        break
                                    } var L = g.episode || _ + 1,
                                x = c.episodes_view[g.season],
                                C = c.voice_name || !!k.voice[0] && k.voice[0].title || g.voice_name || (l ? "Неизвестно" : g.text) || "Неизвестно";
                            g.quality && (g.qualitys = g.quality, g.quality = Lampa.Arrays.getKeys(g.quality)[0]), Lampa.Arrays.extend(g, {
                                voice_name: C,
                                info: C.length > 60 ? C.substr(0, 60) + "..." : C,
                                quality: "",
                                time: Lampa.Utils.secondsToTime(60 * (w ? w.runtime : e.movie.runtime), !0)
                            });
                            var S = Lampa.Utils.hash(g.season ? [g.season, g.season > 10 ? ":" : "", g.episode, e.movie.original_title].join("") : e.movie.original_title),
                                T = Lampa.Utils.hash(g.season ? [g.season, g.season > 10 ? ":" : "", g.episode, e.movie.original_title, g.voice_name].join("") : e.movie.original_title + g.voice_name),
                                A = {
                                    hash_timeline: S,
                                    hash_behold: T
                                },
                                U = [];
                            g.season && (g.translate_episode_end = a.getLastEpisode(i), g.translate_voice = g.voice_name), g.text && !w && (g.title = g.text), g.timeline = Lampa.Timeline.view(S), w ? (g.title = w.name, g.info.length < 30 && w.vote_average && U.push(Lampa.Template.get("lampac_prestige_rate", {
                                rate: parseFloat(w.vote_average + "").toFixed(1)
                            }, !0)), w.air_date && m && U.push(Lampa.Utils.parseTime(w.air_date).full)) : e.movie.release_date && m && U.push(Lampa.Utils.parseTime(e.movie.release_date).full), !l && e.movie.tagline && g.info.length < 30 && U.push(e.movie.tagline), g.info && U.push(g.info), U.length && (g.info = formatCardInfo(U, !0));
                            var P = Lampa.Template.get("lampac_prestige_full", g),
                                O = P.find(".online-prestige__loader"),
                                z = P.find(".online-prestige__img");
                            if (e.balanser && z.hide(), l ? void 0 !== x && x == L && (p = P) : c.movie_view == T && (p = P), l && !w) z.append('<div class="online-prestige__episode-number">' + ("0" + (g.episode || _ + 1)).slice(-2) + "</div>"), O.remove();
                            else if (l || "undefined" != e.movie.backdrop_path) {
                                var q = P.find("img")[0],
                                    R = new Image;
                                R.onload = function() {
                                    y || (q.src = R.src, z.addClass("online-prestige__img--loaded loaded"), O.remove(), l && z.append('<div class="online-prestige__episode-number">' + ("0" + (g.episode || _ + 1)).slice(-2) + "</div>"))
                                }, R.onerror = function() {
                                    y || (q.src = "./img/img_broken.svg", z.addClass("online-prestige__img--loaded loaded"), O.remove(), l && z.append('<div class="online-prestige__episode-number">' + ("0" + (g.episode || _ + 1)).slice(-2) + "</div>"))
                                }, R.src = Lampa.TMDB.image("t/p/w300" + (w ? w.still_path : e.movie.backdrop_path)), v.push(q), v.push(R)
                            } else O.remove();
                            P.find(".online-prestige__timeline").append(Lampa.Timeline.render(g.timeline)), -1 !== s.indexOf(T) && (u = P, P.find(".online-prestige__img").append('<div class="online-prestige__viewed">' + Lampa.Template.get("icon_viewed", {}, !0) + "</div>")), g.mark = function() {
                                -1 == (s = Lampa.Storage.cache(Config.StorageKeys.OnlineView, 5e3, [])).indexOf(T) && (s.push(T), Lampa.Storage.set(Config.StorageKeys.OnlineView, s), 0 == P.find(".online-prestige__viewed").length && P.find(".online-prestige__img").append('<div class="online-prestige__viewed">' + Lampa.Template.get("icon_viewed", {}, !0) + "</div>")), c = a.getChoice(), l ? c.episodes_view[g.season] = L : c.movie_view = T, a.saveChoice(c);
                                var e = c.voice_name || g.voice_name || g.title;
                                e.length > 30 && (e = e.slice(0, 30) + "..."), a.watched({
                                    balanser: n,
                                    balanser_name: Lampa.Utils.capitalizeFirstLetter(f[n] ? f[n].name.split(" ")[0] : n),
                                    voice_id: c.voice_id,
                                    voice_name: e,
                                    episode: g.episode,
                                    season: g.season
                                })
                            }, g.unmark = function() {
                                -1 !== (s = Lampa.Storage.cache(Config.StorageKeys.OnlineView, 5e3, [])).indexOf(T) && (Lampa.Arrays.remove(s, T), Lampa.Storage.set(Config.StorageKeys.OnlineView, s), Lampa.Storage.remove(Config.StorageKeys.OnlineView, T), P.find(".online-prestige__viewed").remove())
                            }, g.timeclear = function() {
                                g.timeline.percent = 0, g.timeline.time = 0, g.timeline.duration = 0, Lampa.Timeline.update(g.timeline)
                            }, P.on("hover:enter", (function() {
                                e.movie.id && Lampa.Favorite.add("history", e.movie, 100), o.onEnter && o.onEnter(g, P, A)
                            })).on("hover:focus", (function(e) {
                                t = e.target, o.onFocus && o.onFocus(g, P, A), d.update($(e.target), !0)
                            })), o.onRender && o.onRender(g, P, A), a.contextMenu({
                                html: P,
                                element: g,
                                onFile: function(e) {
                                    o.onContextMenu && o.onContextMenu(g, P, A, e)
                                },
                                onClearAllMark: function() {
                                    i.forEach((function(e) {
                                        e.unmark()
                                    }))
                                },
                                onClearAllTime: function() {
                                    i.forEach((function(e) {
                                        e.timeclear()
                                    }))
                                }
                            }), P && P[0] && h.appendChild(P[0])
                        })), l && r.length > i.length && !o.similars) {
                        var _ = r.slice(i.length),
                            w = Lampa.Lang.translate("full_episode_days_left");
                        _.forEach((function(n) {
                            var a = [];
                            n.vote_average && a.push(Lampa.Template.get("lampac_prestige_rate", {
                                rate: parseFloat(n.vote_average + "").toFixed(1)
                            }, !0)), n.air_date && a.push(Lampa.Utils.parseTime(n.air_date).full);
                            var o = new Date((n.air_date + "").replace(/-/g, "/")),
                                r = Date.now(),
                                s = Math.round((o.getTime() - r) / 864e5),
                                l = w + ": " + s,
                                c = Lampa.Template.get("lampac_prestige_full", {
                                    time: Lampa.Utils.secondsToTime(60 * (n ? n.runtime : e.movie.runtime), !0),
                                    info: formatCardInfo(a, !0),
                                    title: n.name,
                                    quality: s > 0 ? l : ""
                                }),
                                m = c.find(".online-prestige__loader"),
                                p = c.find(".online-prestige__img"),
                                u = i[0] ? i[0].season : 1;
                            c.find(".online-prestige__timeline").append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([u, n.episode_number, e.movie.original_title].join("")))));
                            var f = c.find("img")[0];
                            if (n.still_path) {
                                var g = new Image;
                                g.onload = function() {
                                    y || (f.src = g.src, p.addClass("online-prestige__img--loaded loaded"), m.remove(), p.append('<div class="online-prestige__episode-number">' + ("0" + n.episode_number).slice(-2) + "</div>"))
                                }, g.onerror = function() {
                                    y || (f.src = "./img/img_broken.svg", p.addClass("online-prestige__img--loaded loaded"), m.remove(), p.append('<div class="online-prestige__episode-number">' + ("0" + n.episode_number).slice(-2) + "</div>"))
                                }, g.src = Lampa.TMDB.image("t/p/w300" + n.still_path), v.push(f), v.push(g)
                            } else m.remove(), p.append('<div class="online-prestige__episode-number">' + ("0" + n.episode_number).slice(-2) + "</div>");
                            c.on("hover:focus", (function(e) {
                                t = e.target, d.update($(e.target), !0)
                            })), c.addClass("lampac-dim-opacity"), c && c[0] && h.appendChild(c[0])
                        }))
                    }
                    d.clear(), a.clearImages();
                    try {
                        e.balanser || d.append(Lampa.Template.get("lampac_prestige_watched", {}))
                    } catch (t) {
                        S(), e.balanser || d.append(Lampa.Template.get("lampac_prestige_watched", {}))
                    }
                    a.updateWatched(), d.body()[0].appendChild(h), g = v, p ? t = p[0] : u && (t = u[0]), Lampa.Controller.enable("content")
                }
            }))
        }, this.contextMenu = function(t) {
            t.html.on("hover:long", (function() {
                t.onFile((function(i) {
                    var n = Lampa.Controller.enabled().name,
                        a = [];
                    Lampa.Platform.is("webos") && a.push({
                        title: Lampa.Lang.translate("player_lauch") + " - Webos",
                        player: "webos"
                    }), Lampa.Platform.is("android") && a.push({
                        title: Lampa.Lang.translate("player_lauch") + " - Android",
                        player: "android"
                    }), a.push({
                        title: Lampa.Lang.translate("player_lauch") + " - Lampa",
                        player: "lampa"
                    }), a.push({
                        title: Lampa.Lang.translate("lampac_video"),
                        separator: !0
                    }), a.push({
                        title: Lampa.Lang.translate("torrent_parser_label_title"),
                        mark: !0
                    }), a.push({
                        title: Lampa.Lang.translate("torrent_parser_label_cancel_title"),
                        unmark: !0
                    }), a.push({
                        title: Lampa.Lang.translate("time_reset"),
                        timeclear: !0
                    }), i && a.push({
                        title: Lampa.Lang.translate("copy_link"),
                        copylink: !0
                    }), window.lampac_online_context_menu && window.lampac_online_context_menu.push(a, i, t), a.push({
                        title: Lampa.Lang.translate("more"),
                        separator: !0
                    }), Lampa.Account.logged() && t.element && void 0 !== t.element.season && t.element.translate_voice && a.push({
                        title: Lampa.Lang.translate("lampac_voice_subscribe"),
                        subscribe: !0
                    }), a.push({
                        title: Lampa.Lang.translate("lampac_clear_all_marks"),
                        clearallmark: !0
                    }), a.push({
                        title: Lampa.Lang.translate("lampac_clear_all_timecodes"),
                        timeclearall: !0
                    }), Lampa.Select.show({
                        title: Lampa.Lang.translate("title_action"),
                        items: a,
                        onBack: function() {
                            Lampa.Controller.toggle(n)
                        },
                        onSelect: function(a) {
                            if (a.mark && t.element.mark(), a.unmark && t.element.unmark(), a.timeclear && t.element.timeclear(), a.clearallmark && t.onClearAllMark(), a.timeclearall && t.onClearAllTime(), window.lampac_online_context_menu && window.lampac_online_context_menu.onSelect(a, t), Lampa.Controller.toggle(n), a.player && (Lampa.Player.runas(a.player), t.html.trigger("hover:enter")), a.copylink)
                                if (i.quality) {
                                    var o = [];
                                    for (var r in i.quality) o.push({
                                        title: r,
                                        file: i.quality[r]
                                    });
                                    Lampa.Select.show({
                                        title: Lampa.Lang.translate("settings_server_links"),
                                        items: o,
                                        onBack: function() {
                                            Lampa.Controller.toggle(n)
                                        },
                                        onSelect: function(e) {
                                            Lampa.Utils.copyTextToClipboard(e.file, (function() {
                                                Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"))
                                            }), (function() {
                                                Lampa.Noty.show(Lampa.Lang.translate("copy_error"))
                                            }))
                                        }
                                    })
                                } else Lampa.Utils.copyTextToClipboard(i.file, (function() {
                                    Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"))
                                }), (function() {
                                    Lampa.Noty.show(Lampa.Lang.translate("copy_error"))
                                }));
                            a.subscribe && Lampa.Account.subscribeToTranslation({
                                card: e.movie,
                                season: t.element.season,
                                episode: t.element.translate_episode_end,
                                voice: t.element.translate_voice
                            }, (function() {
                                Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_success"))
                            }), (function() {
                                Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_error"))
                            }))
                        }
                    })
                }))
            })).on("hover:focus", (function() {
                Lampa.Helper && Lampa.Helper.show("online_file", Lampa.Lang.translate("helper_online_file"), t.html)
            }))
        }, this.empty = function() {
            var e = Lampa.Template.get("lampac_does_not_answer", {});
            e.find(".online-empty__buttons").remove(), e.find(".online-empty__title").text(Lampa.Lang.translate("empty_title_two")), e.find(".online-empty__time").text(Lampa.Lang.translate("empty_text")), d.clear(), d.append(e), this.loading(!1)
        }, this.noConnectToServer = function(e) {
            if (!y) {
                var t = Lampa.Template.get("lampac_does_not_answer", {});
                t.find(".online-empty__buttons").remove(), t.find(".online-empty__title").text(Lampa.Lang.translate("title_error"));
                var i = f[n] ? f[n].name : n;
                t.find(".online-empty__time").text(e && e.accsdb ? e.msg : Lampa.Lang.translate("lampac_does_not_answer_text").replace("{balanser}", i)), d.clear(), d.append(t), this.loading(!1)
            }
        }, this.doesNotAnswer = function(e) {
            if (!y) {
                var t = this;
                this.reset();
                var i = Lampa.Template.get("lampac_does_not_answer", {
                    balanser: n
                });
                e && e.accsdb && i.find(".online-empty__title").html(e.msg);
                var a = e && e.accsdb ? 10 : 5;
                i.find(".cancel").on("hover:enter", (function() {
                    clearInterval(o)
                })), i.find(".change").on("hover:enter", (function() {
                    clearInterval(o), h.render().find(".filter--sort").trigger("hover:enter")
                })), d.clear(), d.append(i), this.loading(!1), o = setInterval((function() {
                    if (!y && (a--, i.find(".timeout").text(a), 0 == a)) {
                        clearInterval(o);
                        var e = Lampa.Arrays.getKeys(f),
                            r = e.indexOf(n),
                            s = e[r + 1];
                        s || (s = e[0]), n = s, Lampa.Activity.active().activity == t.activity && t.changeBalanser(n)
                    }
                }), 1e3)
            }
        }, this.getLastEpisode = function(e) {
            var t = 0;
            return e.forEach((function(e) {
                void 0 !== e.episode && (t = Math.max(t, parseInt(e.episode)))
            })), t
        }, this.start = function() {
            Lampa.Activity.active().activity === this.activity && (a || (a = !0, this.initialize()), Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(e.movie)), Lampa.Controller.add("content", {
                toggle: function() {
                    Lampa.Controller.collectionSet(d.render(), u.render()), Lampa.Controller.collectionFocus(function() {
                        if (!t) return !1;
                        try {
                            var e = d.render();
                            if (e && e[0] && e[0].contains && !e[0].contains(t)) return !1
                        } catch (e) {
                            return console.error(e), !1
                        }
                        return t
                    }(), d.render())
                },
                gone: function() {
                    clearInterval(o)
                },
                up: function() {
                    Navigator.canmove("up") ? Navigator.move("up") : Lampa.Controller.toggle("head")
                },
                down: function() {
                    Navigator.move("down")
                },
                right: function() {
                    Navigator.canmove("right") ? Navigator.move("right") : h.show(Lampa.Lang.translate("title_filter"), "filter")
                },
                left: function() {
                    Navigator.canmove("left") ? Navigator.move("left") : Lampa.Controller.toggle("menu")
                },
                back: this.back.bind(this)
            }), Lampa.Controller.toggle("content"))
        }, this.render = function() {
            return u.render()
        }, this.back = function() {
            Lampa.Activity.backward()
        }, this.pause = function() {}, this.stop = function() {}, this.destroy = function() {
            y = !0, t = !1;
            var i = m;
            if (clearTimeout(m), m = 0, i && null !== w) {
                var n = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title),
                    a = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
                a[n] = w, Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, a)
            }
            p.clear(), this.clearImages(), u.destroy(), d.destroy(), clearInterval(o), clearTimeout(s), clearTimeout(r), clearTimeout(l), clearTimeout(c)
        }
    }

    function addSourceSearch(e, t) {
        var i = new Lampa.Reguest,
            n = {
                title: e,
                search: function(e, n) {
                    function a(e) {
                        var a = Lampa.Arrays.getKeys(e);
                        if (a.length) {
                            var o = new Lampa.Status(a.length);
                            o.onComplite = function(e) {
                                var i = [];
                                a.forEach((function(n) {
                                    var a = e[n];
                                    if (a && a.data && "similar" == a.type) {
                                        var o = a.data.map((function(e) {
                                            return e.title = Lampa.Utils.capitalizeFirstLetter(e.title), e.release_date = e.year || "0000", e.balanser = t, void 0 !== e.img && ("/" === e.img.charAt(0) && (e.img = Defined.localhost + e.img.substring(1)), -1 !== e.img.indexOf("/proxyimg") && (e.img = account(e.img))), e
                                        }));
                                        i.push({
                                            title: n,
                                            results: o
                                        })
                                    }
                                })), n(i)
                            }, a.forEach((function(t) {
                                i.silent(account(e[t]), (function(e) {
                                    o.append(t, e)
                                }), (function() {
                                    o.error()
                                }))
                            }))
                        } else n([])
                    }
                    i.silent(account(Defined.localhost + "lite/" + t + "?title=" + e.query), (function(o) {
                        o.rch ? rchRun(o, (function() {
                            i.silent(account(Defined.localhost + "lite/" + t + "?title=" + e.query), (function(e) {
                                a(e)
                            }), (function() {
                                n([])
                            }))
                        })) : a(o)
                    }), (function() {
                        n([])
                    }))
                },
                onCancel: function() {
                    i.clear()
                },
                params: {
                    lazy: !0,
                    align_left: !0,
                    card_events: {
                        onMenu: function() {}
                    }
                },
                onMore: function(e, t) {
                    t()
                },
                onSelect: function(e, t) {
                    t(), Lampa.Activity.push({
                        url: e.element.url,
                        title: "Lampac - " + e.element.title,
                        component: PLUGIN_COMPONENT,
                        movie: e.element,
                        page: 1,
                        search: e.element.title,
                        clarification: !0,
                        balanser: e.element.balanser,
                        noinfo: !0
                    })
                }
            };
        Lampa.Search.addSource(n)
    }

    function startPlugin() {
        window.lamponline_o_plugin = !0;
        var e = {
            type: "video",
            version: "",
            name: Config.Plugin.displayName,
            description: "Просмотр онлайна",
            component: PLUGIN_COMPONENT,
            onContextLauch: function(e) {
                Lampa.Component.add(PLUGIN_COMPONENT, component);
                var t = Lampa.Utils.hash(e.number_of_seasons ? e.original_name : e.original_title),
                    i = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
                Lampa.Activity.push({
                    url: "",
                    title: Lampa.Lang.translate("title_online"),
                    component: PLUGIN_COMPONENT,
                    search: i[t] ? i[t] : e.title,
                    search_one: e.title,
                    search_two: e.original_title,
                    movie: e,
                    page: 1,
                    clarification: !!i[t]
                })
            }
        };
        addSourceSearch("Онлайн", "spider"), function(t) {
            var n = Lampa.Manifest.plugins;
            n ? Lampa.Arrays.isArray(n) ? n.push(t) : Lampa.Manifest.plugins = [n, t] : Lampa.Manifest.plugins = t
        }(e), Lampa.Lang.add({
            lampac_watch: {
                ru: "Смотреть онлайн",
                en: "Watch online",
                uk: "Дивитися онлайн",
                zh: "在线观看"
            },
            lampac_video: {
                ru: "Видео",
                en: "Video",
                uk: "Відео",
                zh: "视频"
            },
            lampac_no_watch_history: {
                ru: "Нет истории просмотра",
                en: "No browsing history",
                ua: "Немає історії перегляду",
                zh: "没有浏览历史"
            },
            lampac_nolink: {
                ru: "Не удалось извлечь ссылку",
                uk: "Неможливо отримати посилання",
                en: "Failed to fetch link",
                zh: "获取链接失败"
            },
            lampac_balanser: {
                ru: "Источник",
                uk: "Джерело",
                en: "Source",
                zh: "来源"
            },
            helper_online_file: {
                ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
                uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
                en: 'Hold the "OK" key to bring up the context menu',
                zh: "按住“确定”键调出上下文菜单"
            },
            title_online: {
                ru: "Онлайн",
                uk: "Онлайн",
                en: "Online",
                zh: "在线的"
            },
            lampac_voice_subscribe: {
                ru: "Подписаться на перевод",
                uk: "Підписатися на переклад",
                en: "Subscribe to translation",
                zh: "订阅翻译"
            },
            lampac_voice_success: {
                ru: "Вы успешно подписались",
                uk: "Ви успішно підписалися",
                en: "You have successfully subscribed",
                zh: "您已成功订阅"
            },
            lampac_voice_error: {
                ru: "Возникла ошибка",
                uk: "Виникла помилка",
                en: "An error has occurred",
                zh: "发生了错误"
            },
            lampac_clear_all_marks: {
                ru: "Очистить все метки",
                uk: "Очистити всі мітки",
                en: "Clear all labels",
                zh: "清除所有标签"
            },
            lampac_clear_all_timecodes: {
                ru: "Очистить все тайм-коды",
                uk: "Очистити всі тайм-коди",
                en: "Clear all timecodes",
                zh: "清除所有时间代码"
            },
            lampac_change_balanser: {
                ru: "Изменить балансер",
                uk: "Змінити балансер",
                en: "Change balancer",
                zh: "更改平衡器"
            },
            lampac_balanser_dont_work: {
                ru: "Поиск не дал результатов",
                uk: "Пошук на ({balanser}) не дав результатів",
                en: "Search on ({balanser}) did not return any results",
                zh: "搜索 ({balanser}) 未返回任何结果"
            },
            lampac_balanser_timeout: {
                ru: 'Источник будет переключен автоматически через <span class="timeout">10</span> секунд.',
                uk: 'Джерело буде автоматично переключено через <span class="timeout">10</span> секунд.',
                en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.',
                zh: '平衡器将在<span class="timeout">10</span>秒内自动切换。'
            },
            lampac_does_not_answer_text: {
                ru: "Поиск не дал результатов",
                uk: "Пошук на ({balanser}) не дав результатів",
                en: "Search on ({balanser}) did not return any results",
                zh: "搜索 ({balanser}) 未返回任何结果"
            }
        });
        var t = '<div class="full-start__button selector view--online lampac--button lampac--button-lamponline_o" data-subtitle="'.concat(e.name, " ").concat(e.version, '">\n         <svg viewBox="0 0 32 32" xmlns="').concat(_d(_u4.join("")), '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M27 7H5a2 2 0 00-2 2v14a2 2 0 002 2h22a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M7 13l3 6.5 3-6.5M16.5 13v6.5M20.5 17.275h1.48c.651 0 1.277-.275 1.721-.75a2.338 2.338 0 00.215-2.932 1.394 1.394 0 00-1.14-.593H20.5v4.275zm0 0V19.5"/></svg>\n        <span>#{title_online}</span>\n    </div>');

        function i(e) {
            if (!e.render.find(".lampac--button-lamponline_o").length) {
                var i = $(Lampa.Lang.translate(t));
                i.on("hover:enter", (function() {
                    Lampa.Component.add(PLUGIN_COMPONENT, component);
                    var t = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title),
                        i = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
                    Lampa.Activity.push({
                        url: "",
                        title: Lampa.Lang.translate("title_online"),
                        component: PLUGIN_COMPONENT,
                        search: i[t] ? i[t] : e.movie.title,
                        search_one: e.movie.title,
                        search_two: e.movie.original_title,
                        movie: e.movie,
                        page: 1,
                        clarification: !!i[t]
                    })
                })), e.render.before(i)
            }
        }
        Lampa.Component.add(PLUGIN_COMPONENT, component), Lampa.Listener.follow("full", (function(e) {
            "complite" == e.type && i({
                render: e.object.activity.render().find(".view--torrent"),
                movie: e.data.movie
            })
        }));
        try {
            "full" == Lampa.Activity.active().component && i({
                render: Lampa.Activity.active().activity.render().find(".view--torrent"),
                movie: Lampa.Activity.active().card
            })
        } catch (e) {
            console.error(e)
        }
        if (Lampa.Manifest.app_digital >= 177) {
            ["filmix", "filmixtv", "fxapi", "rezka", "rhsprem", "lumex", "videodb", "collaps", "collaps-dash", "hdvb", "zetflix", "kodik", "ashdi", "kinoukr", "kinotochka", "remux", "iframevideo", "cdnmovies", "anilibria", "animedia", "animego", "animevost", "animebesst", "redheadsound", "alloha", "animelib", "moonanime", "kinopub", "vibix", "vdbmovies", "fancdn", "cdnvideohub", "vokino", "rc/filmix", "rc/fxapi", "rc/rhs", "vcdn", "videocdn", "mirage", "hydraflix", "videasy", "vidsrc", "movpi", "vidlink", "twoembed", "autoembed", "smashystream", "autoembed", "rgshows", "pidtor", "videoseed", "iptvonline", "veoveo"].forEach((function(e) {
                Lampa.Storage.sync(Config.StorageKeys.OnlineChoicePrefix + e, "object_object")
            })), Lampa.Storage.sync(Config.StorageKeys.OnlineWatchedLast, "object_object")
        }
    }

    function initBalanserInFilterMenu() {
        window.lamponline_o_src_filter_plugin || (window.lamponline_o_src_filter_plugin = !0, Lampa.Controller.listener.follow("toggle", (function(e) {
            if ("select" === e.name) {
                var t = Lampa.Activity.active();
                if (t && t.component && PLUGIN_COMPONENT === t.component.toLowerCase()) {
                    var i = $(".selectbox__title");
                    if (1 === i.length && i.text() === Lampa.Lang.translate("title_filter")) {
                        var n = $(".simple-button--filter.filter--sort");
                        if (!(1 !== n.length || n.hasClass("hide") || $(".selectbox-item[data-lamponline-o-source]").length > 0)) {
                            var a = Lampa.Template.get("selectbox_item", {
                                title: Lampa.Lang.translate("settings_rest_source"),
                                subtitle: $("div", n).text()
                            });
                            a.attr("data-lamponline-o-source", "true"), a.on("hover:enter", (function() {
                                n.trigger("hover:enter")
                            })), $(".selectbox-item").first().after(a), Lampa.Controller.collectionSet($("body > .selectbox").find(".scroll__body"))
                        }
                    }
                }
            }
        })))
    }
    window.lamponline_o_plugin || startPlugin(), window.appready ? initBalanserInFilterMenu() : Lampa.Listener.follow("app", (function(e) {
        "ready" === e.type && initBalanserInFilterMenu()
    }))
})();