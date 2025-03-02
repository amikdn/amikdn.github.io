
'use strict';

const Defined = {
    api: 'lampac',
    localhost: 'https://lam.akter-black.com/',
    apn: '10'
};

// Generate a unique user ID if not present
let unicId = Lampa.Storage.get('lampac_unic_id', '');
if (!unicId) {
    unicId = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unicId);
}

// Load RCH script if not already loaded
if (!window.rch) {
    Lampa.Utils.putScript(['https://abmsx.tech/invc-rch.js'], () => {}, false, () => {
        if (!window.rch.startTypeInvoke) {
            window.rch.typeInvoke('https://abmsx.tech', () => {});
        }
    }, true);
}

// Balancers that support search functionality
const BALANCERS_WITH_SEARCH = [
    'kinotochka', 'kinopub', 'lumex', 'filmix', 'filmixtv', 'redheadsound',
    'animevost', 'animego', 'animedia', 'animebesst', 'anilibria', 'rezka',
    'rhsprem', 'kodik', 'remux', 'animelib', 'kinoukr', 'rc/filmix',
    'rc/fxapi', 'rc/kinopub', 'rc/rhs', 'vcdn'
];

class Lampac {
    static account(url) {
        url = String(url);
        if (!url.includes('account_email=')) {
            const email = Lampa.Storage.get('account_email');
            if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
        }
        if (!url.includes('uid=')) {
            const uid = Lampa.Storage.get('lampac_unic_id', '');
            if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
        }
        if (!url.includes('token=')) {
            const token = '';
            if (token !== '') url = Lampa.Utils.addUrlComponent(url, 'token=');
        }
        url = Lampa.Utils.addUrlComponent(url, 'ab_token=' + Lampa.Storage.get('token'));
        return url;
    }

    static balancerName(j) {
        const bals = j.balanser;
        const name = j.name.split(' ')[0];
        return (bals || name).toLowerCase();
    }

    constructor(object) {
        this.object = object;
        this.network = new Lampa.Reguest();
        this.scroll = new Lampa.Scroll({ mask: true, over: true });
        this.files = new Lampa.Explorer(object);
        this.filter = new Lampa.Filter(object);
        this.sources = {};
        this.last = null;
        this.source = '';
        this.balanser = '';
        this.initialized = false;
        this.balanserTimer = null;
        this.images = [];
        this.numberOfRequests = 0;
        this.numberOfRequestsTimer = null;
        this.lifeWaitCount = 0;
        this.lifeWaitTimer = null;
        this.hubConnection = null;
        this.hubTimer = null;
        this.filterSources = [];
        this.filterTranslate = {
            season: Lampa.Lang.translate('torrent_serial_season'),
            voice: Lampa.Lang.translate('torrent_parser_voice'),
            source: Lampa.Lang.translate('settings_rest_source')
        };
        this.filterFind = { season: [], voice: [] };
    }

    clarificationSearchAdd(value) {
        const id = Lampa.Utils.hash(this.object.movie.number_of_seasons ? this.object.movie.original_name : this.object.movie.original_title);
        const all = Lampa.Storage.get('clarification_search', '{}');
        all[id] = value;
        Lampa.Storage.set('clarification_search', all);
    }

    clarificationSearchDelete() {
        const id = Lampa.Utils.hash(this.object.movie.number_of_seasons ? this.object.movie.original_name : this.object.movie.original_title);
        const all = Lampa.Storage.get('clarification_search', '{}');
        delete all[id];
        Lampa.Storage.set('clarification_search', all);
    }

    clarificationSearchGet() {
        const id = Lampa.Utils.hash(this.object.movie.number_of_seasons ? this.object.movie.original_name : this.object.movie.original_title);
        const all = Lampa.Storage.get('clarification_search', '{}');
        return all[id];
    }

    initialize() {
        this.loading(true);
        // Setup filter event handlers
        this.filter.onSearch = (value) => {
            this.clarificationSearchAdd(value);
            Lampa.Activity.replace({ search: value, clarification: true });
        };
        this.filter.onBack = () => {
            this.start();
        };
        this.filter.render().find('.selector').on('hover:enter', () => {
            clearInterval(this.balanserTimer);
        });
        this.filter.render().find('.filter--search').appendTo(this.filter.render().find('.torrent-filter'));
        this.filter.onSelect = (type, a, b) => {
            if (type === 'filter') {
                if (a.reset) {
                    this.clarificationSearchDelete();
                    this.replaceChoice({ season: 0, voice: 0, voice_url: '', voice_name: '' });
                    setTimeout(() => {
                        Lampa.Select.close();
                        Lampa.Activity.replace({ clarification: 0 });
                    }, 10);
                } else {
                    const url = this.filterFind[a.stype][b.index].url;
                    const choice = this.getChoice();
                    if (a.stype === 'voice') {
                        choice.voice_name = this.filterFind.voice[b.index].title;
                        choice.voice_url = url;
                    }
                    choice[a.stype] = b.index;
                    this.saveChoice(choice);
                    this.reset();
                    this.request(url);
                    setTimeout(Lampa.Select.close, 10);
                }
            } else if (type === 'sort') {
                Lampa.Select.close();
                this.object.lampac_custom_select = a.source;
                this.changeBalanser(a.source);
            }
        };
        if (this.filter.addButtonBack) {
            this.filter.addButtonBack();
        }
        this.filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
        this.scroll.body().addClass('torrent-list');
        this.files.appendFiles(this.scroll.render());
        this.files.appendHead(this.filter.render());
        this.scroll.minus(this.files.render().find('.explorer__files-head'));
        this.scroll.body().append(Lampa.Template.get('lampac_content_loading'));
        Lampa.Controller.enable('content');
        this.loading(false);
        this.externalIds().then(() => this.createSource())
            .then((json) => {
                if (!BALANCERS_WITH_SEARCH.some(b => this.balanser.startsWith(b))) {
                    this.filter.render().find('.filter--search').addClass('hide');
                }
                this.search();
            })
            .catch((err) => {
                this.noConnectToServer(err);
            });
    }

    rch(json, noreset) {
        const load = () => {
            if (this.hubConnection) {
                clearTimeout(this.hubTimer);
                this.hubConnection.stop();
                this.hubConnection = null;
                console.log('RCH', 'hubConnection stop');
            }
            this.hubConnection = new signalR.HubConnectionBuilder().withUrl(json.ws).build();
            this.hubConnection.start().then(() => {
                window.rch.Registry('https://abmsx.tech', this.hubConnection, () => {
                    console.log('RCH', 'hubConnection start');
                    if (!noreset) {
                        this.find();
                    } else if (typeof noreset === 'function') {
                        noreset();
                    }
                });
            }).catch((err) => {
                console.error('RCH', err.toString());
            });
            if (json.keepalive > 0) {
                this.hubTimer = setTimeout(() => {
                    this.hubConnection.stop();
                    this.hubConnection = null;
                }, 1000 * json.keepalive);
            }
        };
        if (typeof signalR === 'undefined') {
            Lampa.Utils.putScript(['https://abmsx.tech/signalr-6.0.25_es5.js'], () => {}, false, () => {
                load();
            }, true);
        } else {
            load();
        }
    }

    externalIds() {
        return new Promise((resolve, reject) => {
            if (!this.object.movie.imdb_id || !this.object.movie.kinopoisk_id) {
                const query = [];
                query.push('id=' + this.object.movie.id);
                query.push('serial=' + (this.object.movie.name ? 1 : 0));
                if (this.object.movie.imdb_id) query.push('imdb_id=' + (this.object.movie.imdb_id || ''));
                if (this.object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (this.object.movie.kinopoisk_id || ''));
                const url = Defined.localhost + 'externalids?' + query.join('&');
                this.network.timeout(10000);
                this.network.silent(Lampac.account(url), (json) => {
                    for (const name in json) {
                        this.object.movie[name] = json[name];
                    }
                    resolve();
                }, () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    updateBalanser(balanserName) {
        const last_select_balanser = Lampa.Storage.cache('online_last_balanser', 2000, {});
        last_select_balanser[this.object.movie.id] = balanserName;
        Lampa.Storage.set('online_last_balanser', last_select_balanser);
    }

    changeBalanser(balanserName) {
        this.updateBalanser(balanserName);
        Lampa.Storage.set('online_balanser', balanserName);
        const to = this.getChoice(balanserName);
        const from = this.getChoice();
        if (from.voice_name) to.voice_name = from.voice_name;
        this.saveChoice(to, balanserName);
        Lampa.Activity.replace();
    }

requestParams(url) {
  // Маппинг имен балансеров на альтернативные URL
  const serverMap = {
    filmixtv: 'http://rc.bwa.to/rc/fxapi',
    zetflix: 'https://lam.akter-black.com/lite/zetflix'
    // можно добавить другие балансеры по аналогичной схеме, например:
    // kinopub: 'https://lam.akter-black.com/lite/kinopub',
    // rezka: 'https://lam.akter-black.com/lite/rezka',
    // ...
  };

  if (this.balanser) {
    const key = this.balanser.toLowerCase();
    if (serverMap[key]) {
      url = serverMap[key];
    }
  }
  
  const query = [];
  const card_source = this.object.movie.source || 'tmdb';
  query.push('id=' + this.object.movie.id);
  if (this.object.movie.imdb_id) query.push('imdb_id=' + (this.object.movie.imdb_id || ''));
  if (this.object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (this.object.movie.kinopoisk_id || ''));
  query.push('title=' + encodeURIComponent(this.object.clarification ? this.object.search : (this.object.movie.title || this.object.movie.name)));
  query.push('original_title=' + encodeURIComponent(this.object.movie.original_title || this.object.movie.original_name));
  query.push('serial=' + (this.object.movie.name ? 1 : 0));
  query.push('original_language=' + (this.object.movie.original_language || ''));
  query.push('year=' + (((this.object.movie.release_date || this.object.movie.first_air_date || '0000') + '').slice(0, 4)));
  query.push('source=' + card_source);
  query.push('rchtype=' + (window.rch ? window.rch.type : ''));
  query.push('clarification=' + (this.object.clarification ? 1 : 0));
  if (Lampa.Storage.get('account_email', '')) {
    query.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', '')));
  }

  return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
}


    getLastChoiceBalanser() {
        const last_select_balanser = Lampa.Storage.cache('online_last_balanser', 2000, {});
        if (last_select_balanser[this.object.movie.id]) {
            return last_select_balanser[this.object.movie.id];
        } else {
            return Lampa.Storage.get('online_balanser', this.filterSources.length ? this.filterSources[0] : '');
        }
    }

    startSource(json) {
        return new Promise((resolve, reject) => {
            json.forEach((j) => {
                const name = Lampac.balancerName(j);
                if (name === 'filmixtv') { j.name = 'Filmix - 720p'; }
                if (name === 'pidtor') { j.name = 'Torrent - 2160'; }
                this.sources[name] = { url: j.url, name: j.name, show: (typeof j.show === 'undefined' ? true : j.show) };
            });
            const lowPriorityBalancers = [];
            this.filterSources = Lampa.Arrays.getKeys(this.sources);
            this.filterSources.sort((a, b) => {
                if (a === '') return -1;
                if (b === '') return 1;
                const aLow = lowPriorityBalancers.includes(a);
                const bLow = lowPriorityBalancers.includes(b);
                if (aLow && !bLow) return 1;
                if (bLow && !aLow) return -1;
                return 0;
            });
            if (this.filterSources.length) {
                const last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
                if (last_select_balanser[this.object.movie.id]) {
                    this.balanser = last_select_balanser[this.object.movie.id];
                } else {
                    this.balanser = Lampa.Storage.get('online_balanser', this.filterSources[0]);
                }
                if (lowPriorityBalancers.includes(this.balanser) && this.filterSources.some(item => !lowPriorityBalancers.includes(item))) {
                    this.balanser = this.filterSources.find(item => !lowPriorityBalancers.includes(item));
                }
                if (!this.sources[this.balanser]) { this.balanser = this.filterSources[0]; }
                if (!this.sources[this.balanser].show && !this.object.lampac_custom_select) { this.balanser = this.filterSources[0]; }
                this.source = this.sources[this.balanser].url;
                resolve(json);
            } else {
                reject();
            }
        });
    }

    lifeSource() {
        return new Promise((resolve, reject) => {
            const url = this.requestParams(Defined.localhost + 'lifeevents?memkey=' + (this.memkey || ''));
            let red = false;
            const gou = (json, any) => {
                if (json.accsdb) return reject(json);
                const last_balanser = this.getLastChoiceBalanser();
                if (!red) {
                    const filtered = json.online.filter(c => any ? c.show : (c.show && c.name.toLowerCase() === last_balanser));
                    if (filtered.length) {
                        red = true;
                        resolve(json.online.filter(c => c.show));
                    } else if (any) {
                        reject();
                    }
                }
            };
            const fin = () => {
                this.network.timeout(3000);
                this.network.silent(Lampac.account(url), (json) => {
                    this.lifeWaitCount++;
                    this.filterSources = [];
                    this.sources = {};
                    json.online.forEach((j) => {
                        const name = Lampac.balancerName(j);
                        if (name === 'filmixtv') { j.name = 'Filmix - 720p'; }
                        if (name === 'pidtor') { j.name = 'Torrent - 2160'; }
                        this.sources[name] = { url: j.url, name: j.name, show: (typeof j.show === 'undefined' ? true : j.show) };
                    });
                    this.filterSources = Lampa.Arrays.getKeys(this.sources);
                    this.filter.set('sort', this.filterSources.map(e => ({
                        title: this.sources[e].name,
                        source: e,
                        selected: e === this.balanser,
                        ghost: !this.sources[e].show
                    })));
                    this.filter.chosen('sort', [this.sources[this.balanser] ? this.sources[this.balanser].name : this.balanser]);
                    gou(json);
                    const lastb = this.getLastChoiceBalanser();
                    if (this.lifeWaitCount > 15 || json.ready) {
                        this.filter.render().find('.lampac-balanser-loader').remove();
                        gou(json, true);
                    } else if (!red && this.sources[lastb] && this.sources[lastb].show) {
                        gou(json, true);
                        this.lifeWaitTimer = setTimeout(fin, 1000);
                    } else {
                        this.lifeWaitTimer = setTimeout(fin, 1000);
                    }
                }, () => {
                    this.lifeWaitCount++;
                    if (this.lifeWaitCount > 15) {
                        reject();
                    } else {
                        this.lifeWaitTimer = setTimeout(fin, 1000);
                    }
                });
            };
            fin();
        });
    }

    createSource() {
        return new Promise((resolve, reject) => {
            const url = this.requestParams(Defined.localhost + 'lite/events?life=true');
            this.network.timeout(15000);
            this.network.silent(Lampac.account(url), (json) => {
                if (json.accsdb) return reject(json);
                if (json.life) {
                    this.memkey = json.memkey;
                    this.filter.render().find('.filter--sort').append('<span class="lampac-balanser-loader" style="width: 1.2em; height: 1.2em; margin-top: 0; background: url(./img/loader.svg) no-repeat 50% 50%; background-size: contain; margin-left: 0.5em"></span>');
                    this.lifeSource().then(this.startSource.bind(this)).then(resolve).catch(reject);
                } else {
                    this.startSource(json).then(resolve).catch(reject);
                }
            }, reject);
        });
    }

    create() {
        return this.render();
    }

    search() {
        // this.loading(true);
        this.filter({ source: this.filterSources }, this.getChoice());
        this.find();
    }

    find() {
        this.request(this.requestParams(this.source));
    }

    request(url) {
        this.numberOfRequests++;
        if (this.numberOfRequests < 10) {
            this.network.native(Lampac.account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, { dataType: 'text' });
            clearTimeout(this.numberOfRequestsTimer);
            this.numberOfRequestsTimer = setTimeout(() => {
                this.numberOfRequests = 0;
            }, 4000);
        } else {
            this.empty();
        }
    }

    parseJsonData(str, selector) {
        try {
            const html = $('<div>' + str + '</div>');
            const elems = [];
            html.find(selector).each(function() {
                const item = $(this);
                const data = JSON.parse(item.attr('data-json'));
                const season = item.attr('s');
                const episode = item.attr('e');
                let text = item.text();
                if (!this.object.movie.name) {
                    if (text.match(/\d+p/i)) {
                        if (!data.quality) {
                            data.quality = {};
                            data.quality[text] = data.url;
                        }
                        text = this.object.movie.title;
                    }
                    if (text === 'По умолчанию') {
                        text = this.object.movie.title;
                    }
                }
                if (episode) data.episode = parseInt(episode);
                if (season) data.season = parseInt(season);
                if (text) data.text = text;
                data.active = item.hasClass('active');
                elems.push(data);
            }.bind(this));
            return elems;
        } catch (e) {
            return [];
        }
    }

    getFileUrl(file, call) {
        const addAbToken = (str) => str + '&ab_token=' + Lampa.Storage.get('token');
        if (file.stream && file.stream.includes('alloha')) {
            file.stream = addAbToken(file.stream);
        }
        if (file.url && file.url.includes('alloha')) {
            file.url = addAbToken(file.url);
        }
        if (Lampa.Storage.field('player') !== 'inner' && file.stream && Lampa.Platform.is('apple')) {
            const newFile = Lampa.Arrays.clone(file);
            newFile.method = 'play';
            newFile.url = file.stream;
            call(newFile, {});
        } else if (file.method === 'play') {
            call(file, {});
        } else {
            Lampa.Loading.start(() => {
                Lampa.Loading.stop();
                Lampa.Controller.toggle('content');
                this.network.clear();
            });
            this.network.native(Lampac.account(file.url), (json) => {
                if (json.rch) {
                    this.rch(json, () => {
                        Lampa.Loading.stop();
                        this.getFileUrl(file, call);
                    });
                } else {
                    Lampa.Loading.stop();
                    call(json, json);
                }
            }, () => {
                Lampa.Loading.stop();
                call(false, {});
            });
        }
    }

    toPlayElement(file) {
        return {
            title: file.title,
            url: file.url,
            quality: file.qualitys,
            timeline: file.timeline,
            subtitles: file.subtitles,
            callback: file.mark
        };
    }

    appendAPN(data) {
        if (Defined.api.startsWith('pwa') && Defined.apn.length && data.url && typeof data.url === 'string' && !data.url.includes(Defined.apn)) {
            data.url_reserve = Defined.apn + data.url;
        }
    }

    setDefaultQuality(data) {
        if (Lampa.Arrays.getKeys(data.quality).length) {
            for (const q in data.quality) {
                if (parseInt(q) === Lampa.Storage.field('video_quality_default')) {
                    data.url = data.quality[q];
                    this.appendAPN(data);
                    break;
                }
            }
        }
    }

    display(videos) {
        this.draw(videos, {
            onEnter: (item, html) => {
                this.getFileUrl(item, (json, json_call) => {
                    if (json && json.url) {
                        const playlist = [];
                        const first = this.toPlayElement(item);
                        first.url = json.url;
                        first.headers = json.headers;
                        first.quality = json_call.quality || item.qualitys;
                        first.subtitles = json.subtitles;
                        first.vast_url = json.vast_url;
                        first.vast_msg = json.vast_msg;
                        this.appendAPN(first);
                        this.setDefaultQuality(first);
                        if (item.season) {
                            videos.forEach((elem) => {
                                const cell = this.toPlayElement(elem);
                                if (elem === item) {
                                    cell.url = json.url;
                                } else {
                                    if (elem.method === 'call') {
                                        if (Lampa.Storage.field('player') !== 'inner') {
                                            cell.url = elem.stream;
                                            delete cell.quality;
                                        } else {
                                            cell.url = (cb) => {
                                                this.getFileUrl(elem, (stream, stream_json) => {
                                                    if (stream.url) {
                                                        cell.url = stream.url;
                                                        cell.quality = stream_json.quality || elem.qualitys;
                                                        cell.subtitles = stream.subtitles;
                                                        this.appendAPN(cell);
                                                        this.setDefaultQuality(cell);
                                                        elem.mark();
                                                    } else {
                                                        cell.url = '';
                                                        Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                                                    }
                                                    cb();
                                                }, () => {
                                                    cell.url = '';
                                                    cb();
                                                });
                                            };
                                        }
                                    } else {
                                        cell.url = elem.url;
                                    }
                                }
                                this.appendAPN(cell);
                                this.setDefaultQuality(cell);
                                playlist.push(cell);
                            });
                        } else {
                            playlist.push(first);
                        }
                        if (playlist.length > 1) first.playlist = playlist;
                        if (first.url) {
                            Lampa.Player.play(first);
                            Lampa.Player.playlist(playlist);
                            item.mark();
                            this.updateBalanser(this.balanser);
                        } else {
                            Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                        }
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                    }
                });
            },
            onContextMenu: (item, html, data, call) => {
                this.getFileUrl(item, (stream) => {
                    call({ file: stream.url, quality: item.qualitys });
                });
            }
        });
        this.filter({
            season: this.filterFind.season.map(s => s.title),
            voice: this.filterFind.voice.map(v => v.title)
        }, this.getChoice());
    }

    parse(str) {
        let json = Lampa.Arrays.decodeJson(str, {});
        if (json && json.accsdb && json.msg && json.msg.indexOf('@Abcinema_bot') !== -1) {
            json.msg = '';
            json.accsdb = false;
        }
        if (Lampa.Arrays.isObject(str) && str.rch) json = str;
        if (json.rch) return this.rch(json);
        try {
            const items = this.parseJsonData(str, '.videos__item');
            const buttons = this.parseJsonData(str, '.videos__button');
            if (items.length === 1 && items[0].method === 'link' && !items[0].similar) {
                this.filterFind.season = items.map(s => ({ title: s.text, url: s.url }));
                this.replaceChoice({ season: 0 });
                this.request(items[0].url);
            } else {
                this.activity.loader(false);
                const videos = items.filter(v => v.method === 'play' || v.method === 'call');
                const similar = items.filter(v => v.similar);
                if (videos.length) {
                    if (buttons.length) {
                        this.filterFind.voice = buttons.map(b => ({ title: b.text, url: b.url }));
                        const select_voice_url = this.getChoice(this.balanser).voice_url;
                        const select_voice_name = this.getChoice(this.balanser).voice_name;
                        const find_voice_url = buttons.find(v => v.url === select_voice_url);
                        const find_voice_name = buttons.find(v => v.text === select_voice_name);
                        const find_voice_active = buttons.find(v => v.active);
                        if (find_voice_url && !find_voice_url.active) {
                            console.log('Lampac', 'go to voice', find_voice_url);
                            this.replaceChoice({ voice: buttons.indexOf(find_voice_url), voice_name: find_voice_url.text });
                            this.request(find_voice_url.url);
                        } else if (find_voice_name && !find_voice_name.active) {
                            console.log('Lampac', 'go to voice', find_voice_name);
                            this.replaceChoice({ voice: buttons.indexOf(find_voice_name), voice_name: find_voice_name.text });
                            this.request(find_voice_name.url);
                        } else {
                            if (find_voice_active) {
                                this.replaceChoice({ voice: buttons.indexOf(find_voice_active), voice_name: find_voice_active.text });
                            }
                            this.display(videos);
                        }
                    } else {
                        this.replaceChoice({ voice: 0, voice_url: '', voice_name: '' });
                        this.display(videos);
                    }
                } else if (items.length) {
                    if (similar.length) {
                        this.similars(similar);
                        this.activity.loader(false);
                    } else {
                        this.filterFind.season = items.map(s => ({ title: s.text, url: s.url }));
                        const select_season = this.getChoice(this.balanser).season;
                        let season = this.filterFind.season[select_season];
                        if (!season) season = this.filterFind.season[0];
                        console.log('Lampac', 'go to season', season);
                        this.request(season.url);
                    }
                } else {
                    this.doesNotAnswer(json);
                }
            }
        } catch (e) {
            this.doesNotAnswer(e);
        }
    }

    similars(items) {
        this.scroll.clear();
        items.forEach((elem) => {
            elem.title = elem.text;
            elem.info = '';
            const info = [];
            const year = (((elem.start_date || elem.year || this.object.movie.release_date || this.object.movie.first_air_date || '') + '').slice(0, 4));
            if (year) info.push(year);
            if (elem.details) info.push(elem.details);
            const name = elem.title || elem.text;
            elem.title = name;
            elem.time = elem.time || '';
            elem.info = info.join('<span class="online-prestige-split">●</span>');
            const item = Lampa.Template.get('lampac_prestige_folder', elem);
            item.on('hover:enter', () => {
                this.reset();
                this.request(elem.url);
            }).on('hover:focus', (e) => {
                this.last = e.target;
                this.scroll.update($(e.target), true);
            });
            this.scroll.append(item);
        });
        this.filter({
            season: this.filterFind.season.map(s => s.title),
            voice: this.filterFind.voice.map(v => v.title)
        }, this.getChoice());
        Lampa.Controller.enable('content');
    }

    getChoice(for_balanser) {
        const data = Lampa.Storage.cache('online_choice_' + (for_balanser || this.balanser), 3000, {});
        const save = data[this.object.movie.id] || {};
        Lampa.Arrays.extend(save, {
            season: 0,
            voice: 0,
            voice_name: '',
            voice_id: 0,
            episodes_view: {},
            movie_view: ''
        });
        return save;
    }

    saveChoice(choice, for_balanser) {
        const data = Lampa.Storage.cache('online_choice_' + (for_balanser || this.balanser), 3000, {});
        data[this.object.movie.id] = choice;
        Lampa.Storage.set('online_choice_' + (for_balanser || this.balanser), data);
        this.updateBalanser(for_balanser || this.balanser);
    }

    replaceChoice(choice, for_balanser) {
        const to = this.getChoice(for_balanser);
        Lampa.Arrays.extend(to, choice, true);
        this.saveChoice(to, for_balanser);
    }

    clearImages() {
        this.images.forEach((img) => {
            img.onerror = null;
            img.onload = null;
            img.src = '';
        });
        this.images = [];
    }

    reset() {
        this.last = null;
        clearInterval(this.balanserTimer);
        this.network.clear();
        this.clearImages();
        this.scroll.render().find('.empty').remove();
        this.scroll.clear();
        this.scroll.reset();
        this.scroll.body().append(Lampa.Template.get('lampac_content_loading'));
    }

    loading(status) {
        if (status) {
            this.activity.loader(true);
        } else {
            this.activity.loader(false);
            this.activity.toggle();
        }
    }

    filter(filter_items, choice) {
        const select = [];
        const add = (type, title) => {
            const need = this.getChoice();
            const items = filter_items[type];
            const subitems = items.map((name, i) => ({
                title: name,
                selected: need[type] === i,
                index: i
            }));
            select.push({
                title: title,
                subtitle: items[need[type]],
                items: subitems,
                stype: type
            });
        };
        filter_items.source = this.filterSources;
        select.push({ title: Lampa.Lang.translate('torrent_parser_reset'), reset: true });
        this.saveChoice(choice);
        if (filter_items.voice && filter_items.voice.length) add('voice', Lampa.Lang.translate('torrent_parser_voice'));
        if (filter_items.season && filter_items.season.length) add('season', Lampa.Lang.translate('torrent_serial_season'));
        this.filter.set('filter', select);
        this.filter.set('sort', this.filterSources.map(e => ({
            title: this.sources[e].name,
            source: e,
            selected: e === this.balanser,
            ghost: !this.sources[e].show
        })));
        this.selected(filter_items);
    }

    selected(filter_items) {
        const need = this.getChoice();
        const select = [];
        for (const i in need) {
            if (filter_items[i] && filter_items[i].length) {
                if (i === 'voice') {
                    select.push(this.filterTranslate[i] + ': ' + filter_items[i][need[i]]);
                } else if (i !== 'source') {
                    if (filter_items.season.length >= 1) {
                        select.push(this.filterTranslate.season + ': ' + filter_items[i][need[i]]);
                    }
                }
            }
        }
        this.filter.chosen('filter', select);
        this.filter.chosen('sort', [this.sources[this.balanser].name]);
    }

    getEpisodes(season, call) {
        const episodes = [];
        if (!['cub', 'tmdb'].includes(this.object.movie.source || 'tmdb')) return call(episodes);
        if (typeof this.object.movie.id === 'number' && this.object.movie.name) {
            const tmdburl = 'tv/' + this.object.movie.id + '/season/' + season + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru');
            const baseurl = Lampa.TMDB.api(tmdburl);
            this.network.timeout(1000 * 10);
            this.network.native(baseurl, (data) => {
                call(data.episodes || []);
            }, () => {
                call(episodes);
            });
        } else {
            call(episodes);
        }
    }

    watched(set) {
        const file_id = Lampa.Utils.hash(this.object.movie.number_of_seasons ? this.object.movie.original_name : this.object.movie.original_title);
        const watched = Lampa.Storage.cache('online_watched_last', 5000, {});
        if (set) {
            if (!watched[file_id]) watched[file_id] = {};
            Lampa.Arrays.extend(watched[file_id], set, true);
            Lampa.Storage.set('online_watched_last', watched);
            this.updateWatched();
        } else {
            return watched[file_id];
        }
    }

    updateWatched() {
        const watched = this.watched();
        const body = this.scroll.body().find('.online-prestige-watched .online-prestige-watched__body').empty();
        if (watched) {
            const line = [];
            if (watched.balanser_name) line.push(watched.balanser_name);
            if (watched.voice_name) line.push(watched.voice_name);
            if (watched.season) line.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + watched.season);
            if (watched.episode) line.push(Lampa.Lang.translate('torrent_serial_episode') + ' ' + watched.episode);
            line.forEach((n) => {
                body.append('<span>' + n + '</span>');
            });
        } else {
            body.append('<span>' + Lampa.Lang.translate('lampac_no_watch_history') + '</span>');
        }
    }

    draw(items, params = {}) {
        if (!items.length) return this.empty();
        this.scroll.clear();
        this.scroll.append(Lampa.Template.get('lampac_prestige_watched', {}));
        this.updateWatched();
        this.getEpisodes(items[0].season, (episodes) => {
            const viewed = Lampa.Storage.cache('online_view', 5000, []);
            const serial = !!this.object.movie.name;
            let choice = this.getChoice();
            const fully = window.innerWidth > 480;
            let scroll_to_element = null;
            let scroll_to_mark = null;
            items.forEach((element, index) => {
                const episode = serial && episodes.length && !params.similars ? episodes.find(e => e.episode_number === element.episode) : null;
                const episode_num = element.episode || index + 1;
                const episode_last = choice.episodes_view[element.season];
                const voice_name = choice.voice_name || (this.filterFind.voice[0] ? this.filterFind.voice[0].title : false) || element.voice_name || (serial ? 'Неизвестно' : element.text) || 'Неизвестно';
                if (element.quality) {
                    element.qualitys = element.quality;
                    element.quality = Lampa.Arrays.getKeys(element.quality)[0];
                }
                Object.assign(element, {
                    voice_name: voice_name,
                    info: voice_name.length > 60 ? voice_name.substr(0, 60) + '...' : voice_name,
                    quality: '',
                    time: Lampa.Utils.secondsToTime(((episode ? episode.runtime : this.object.movie.runtime) * 60), true)
                });
                const hash_timeline = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, this.object.movie.original_title].join('') : this.object.movie.original_title);
                const hash_behold = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, this.object.movie.original_title, element.voice_name].join('') : (this.object.movie.original_title + element.voice_name));
                if (element.season) {
                    element.translate_episode_end = this.getLastEpisode(items);
                    element.translate_voice = element.voice_name;
                }
                if (element.text && !episode) element.title = element.text;
                element.timeline = Lampa.Timeline.view(hash_timeline);
                const info = [];
                if (episode) {
                    element.title = episode.name;
                    if (element.info.length < 30 && episode.vote_average) {
                        info.push(Lampa.Template.get('lampac_prestige_rate', { rate: parseFloat(String(episode.vote_average)).toFixed(1) }, true));
                    }
                    if (episode.air_date && fully) {
                        info.push(Lampa.Utils.parseTime(episode.air_date).full);
                    }
                } else if (!serial && this.object.movie.release_date && fully) {
                    info.push(Lampa.Utils.parseTime(this.object.movie.release_date).full);
                }
                if (!serial && this.object.movie.tagline && element.info.length < 30) {
                    info.push(this.object.movie.tagline);
                }
                if (element.info) info.push(element.info);
                if (info.length) {
                    element.info = info.map(i => '<span>' + i + '</span>').join('<span class="online-prestige-split">●</span>');
                }
                const html = Lampa.Template.get('lampac_prestige_full', element);
                const loader = html.find('.online-prestige__loader');
                const image = html.find('.online-prestige__img');
                if (!serial) {
                    if (choice.movie_view === hash_behold) scroll_to_element = html;
                } else if (typeof episode_last !== 'undefined' && episode_last === episode_num) {
                    scroll_to_element = html;
                }
                if (serial && !episode) {
                    image.append(`<div class="online-prestige__episode-number">${('0' + episode_num).slice(-2)}</div>`);
                    loader.remove();
                } else if (!serial && !['cub', 'tmdb'].includes(this.object.movie.source || 'tmdb')) {
                    loader.remove();
                } else {
                    const imgElem = html.find('img')[0];
                    imgElem.onerror = () => { imgElem.src = './img/img_broken.svg'; };
                    imgElem.onload = () => {
                        image.addClass('online-prestige__img--loaded');
                        loader.remove();
                        if (serial) image.append(`<div class="online-prestige__episode-number">${('0' + episode_num).slice(-2)}</div>`);
                    };
                    imgElem.src = Lampa.TMDB.image('t/p/w300' + (episode ? episode.still_path : this.object.movie.backdrop_path));
                    this.images.push(imgElem);
                }
                html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline));
                if (viewed.includes(hash_behold)) {
                    scroll_to_mark = html;
                    html.find('.online-prestige__img').append(`<div class="online-prestige__viewed">${Lampa.Template.get('icon_viewed', {}, true)}</div>`);
                }
                element.mark = () => {
                    let viewedList = Lampa.Storage.cache('online_view', 5000, []);
                    if (!viewedList.includes(hash_behold)) {
                        viewedList.push(hash_behold);
                        Lampa.Storage.set('online_view', viewedList);
                        if (!html.find('.online-prestige__viewed').length) {
                            html.find('.online-prestige__img').append(`<div class="online-prestige__viewed">${Lampa.Template.get('icon_viewed', {}, true)}</div>`);
                        }
                    }
                    choice = this.getChoice();
                    if (!serial) {
                        choice.movie_view = hash_behold;
                    } else {
                        choice.episodes_view[element.season] = episode_num;
                    }
                    this.saveChoice(choice);
                    let voice_name_text = choice.voice_name || element.voice_name || element.title;
                    if (voice_name_text.length > 30) voice_name_text = voice_name_text.slice(0, 30) + '...';
                    this.watched({
                        balanser: this.balanser,
                        balanser_name: Lampa.Utils.capitalizeFirstLetter(this.sources[this.balanser].name.split(' ')[0]),
                        voice_id: choice.voice_id,
                        voice_name: voice_name_text,
                        episode: element.episode,
                        season: element.season
                    });
                };
                element.unmark = () => {
                    let viewedList = Lampa.Storage.cache('online_view', 5000, []);
                    if (viewedList.includes(hash_behold)) {
                        Lampa.Arrays.remove(viewedList, hash_behold);
                        Lampa.Storage.set('online_view', viewedList);
                        Lampa.Storage.remove('online_view', hash_behold);
                        html.find('.online-prestige__viewed').remove();
                    }
                };
                element.timeclear = () => {
                    element.timeline.percent = 0;
                    element.timeline.time = 0;
                    element.timeline.duration = 0;
                    Lampa.Timeline.update(element.timeline);
                };
                html.on('hover:enter', () => {
                    if (this.object.movie.id) {
                        Lampa.Favorite.add('history', this.object.movie, 100);
                        const user = Lampa.Storage.get('ab_account');
                        if (this.object && this.object.movie && user) {
                            try {
                                $.ajax('//tracker.abmsx.tech/track', {
                                    method: 'post',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        "balancer": this.balanser,
                                        "id": this.object.movie.id,
                                        "token": user.token,
                                        "userId": user.id,
                                        "name": this.object.search,
                                        "season": element.season || 0,
                                        "episode": element.episode || 0
                                    }),
                                    error: (e) => {
                                        console.log('track error request', e);
                                    }
                                });
                            } catch (e) {
                                console.log('track error', e);
                            }
                        }
                    }
                    if (params.onEnter) params.onEnter(element, html, data);
                }).on('hover:focus', (e) => {
                    this.last = e.target;
                    if (params.onFocus) params.onFocus(element, html, data);
                    this.scroll.update($(e.target), true);
                });
                if (params.onRender) params.onRender(element, html, data);
                this.contextMenu({
                    html: html,
                    element: element,
                    onFile: (callback) => { if (params.onContextMenu) params.onContextMenu(element, html, data, callback); },
                    onClearAllMark: () => { items.forEach(elem => elem.unmark()); },
                    onClearAllTime: () => { items.forEach(elem => elem.timeclear()); }
                });
                this.scroll.append(html);
            });
            if (serial && episodes.length > items.length && !params.similars) {
                const left = episodes.slice(items.length);
                left.forEach((episode) => {
                    const info = [];
                    if (episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', { rate: parseFloat(String(episode.vote_average)).toFixed(1) }, true));
                    if (episode.air_date) info.push(Lampa.Utils.parseTime(episode.air_date).full);
                    const air = new Date(String(episode.air_date).replace(/-/g, '/'));
                    const now = Date.now();
                    const day = Math.round((air.getTime() - now) / (24 * 60 * 60 * 1000));
                    const txt = `${Lampa.Lang.translate('full_episode_days_left')}: ${day}`;
                    const html = Lampa.Template.get('lampac_prestige_full', {
                        time: Lampa.Utils.secondsToTime(((episode.runtime || this.object.movie.runtime) * 60), true),
                        info: info.length ? info.map(i => `<span>${i}</span>`).join('<span class="online-prestige-split">●</span>') : '',
                        title: episode.name,
                        quality: day > 0 ? txt : ''
                    });
                    const loader = html.find('.online-prestige__loader');
                    const image = html.find('.online-prestige__img');
                    const season = items[0] ? items[0].season : 1;
                    html.find('.online-prestige__timeline').append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([season, episode.episode_number, this.object.movie.original_title].join('')))));
                    const img = html.find('img')[0];
                    if (episode.still_path) {
                        img.onerror = () => { img.src = './img/img_broken.svg'; };
                        img.onload = () => {
                            image.addClass('online-prestige__img--loaded');
                            loader.remove();
                            image.append(`<div class="online-prestige__episode-number">${('0' + episode.episode_number).slice(-2)}</div>`);
                        };
                        img.src = Lampa.TMDB.image('t/p/w300' + episode.still_path);
                        this.images.push(img);
                    } else {
                        loader.remove();
                        image.append(`<div class="online-prestige__episode-number">${('0' + episode.episode_number).slice(-2)}</div>`);
                    }
                    html.on('hover:focus', (e) => {
                        this.last = e.target;
                        this.scroll.update($(e.target), true);
                    });
                    html.css('opacity', '0.5');
                    this.scroll.append(html);
                });
            }
            if (scroll_to_element) {
                this.last = scroll_to_element[0];
            } else if (scroll_to_mark) {
                this.last = scroll_to_mark[0];
            }
            Lampa.Controller.enable('content');
        });
    }

    contextMenu(params) {
        params.html.on('hover:long', () => {
            const enabled = Lampa.Controller.enabled().name;
            const show = (extra) => {
                const menu = [];
                if (Lampa.Platform.is('webos')) {
                    menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Webos', player: 'webos' });
                }
                if (Lampa.Platform.is('android')) {
                    menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Android', player: 'android' });
                }
                menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Lampa', player: 'lampa' });
                menu.push({ title: Lampa.Lang.translate('lampac_video'), separator: true });
                menu.push({ title: Lampa.Lang.translate('torrent_parser_label_title'), mark: true });
                menu.push({ title: Lampa.Lang.translate('torrent_parser_label_cancel_title'), unmark: true });
                menu.push({ title: Lampa.Lang.translate('time_reset'), timeclear: true });
                if (extra) {
                    menu.push({ title: Lampa.Lang.translate('copy_link'), copylink: true });
                }
                menu.push({ title: Lampa.Lang.translate('more'), separator: true });
                if (Lampa.Account.logged() && params.element && typeof params.element.season !== 'undefined' && params.element.translate_voice) {
                    menu.push({ title: Lampa.Lang.translate('lampac_voice_subscribe'), subscribe: true });
                }
                menu.push({ title: Lampa.Lang.translate('lampac_clear_all_marks'), clearallmark: true });
                menu.push({ title: Lampa.Lang.translate('lampac_clear_all_timecodes'), timeclearall: true });
                Lampa.Select.show({
                    title: Lampa.Lang.translate('title_action'),
                    items: menu,
                    onBack: () => { Lampa.Controller.toggle(enabled); },
                    onSelect: (a) => {
                        if (a.mark) params.element.mark();
                        if (a.unmark) params.element.unmark();
                        if (a.timeclear) params.element.timeclear();
                        if (a.clearallmark) params.onClearAllMark();
                        if (a.timeclearall) params.onClearAllTime();
                        Lampa.Controller.toggle(enabled);
                        if (a.player) {
                            Lampa.Player.runas(a.player);
                            params.html.trigger('hover:enter');
                        }
                        if (a.copylink) {
                            if (extra.quality) {
                                const qual = [];
                                for (const q in extra.quality) {
                                    qual.push({ title: q, file: extra.quality[q] });
                                }
                                Lampa.Select.show({
                                    title: Lampa.Lang.translate('settings_server_links'),
                                    items: qual,
                                    onBack: () => { Lampa.Controller.toggle(enabled); },
                                    onSelect: (b) => {
                                        Lampa.Utils.copyTextToClipboard(b.file, () => {
                                            Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                                        }, () => {
                                            Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                                        });
                                    }
                                });
                            } else {
                                Lampa.Utils.copyTextToClipboard(extra.file, () => {
                                    Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                                }, () => {
                                    Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                                });
                            }
                        }
                        if (a.subscribe) {
                            Lampa.Account.subscribeToTranslation({
                                card: this.object.movie,
                                season: params.element.season,
                                episode: params.element.translate_episode_end,
                                voice: params.element.translate_voice
                            }, () => {
                                Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_success'));
                            }, () => {
                                Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_error'));
                            });
                        }
                    }
                });
            };
            params.onFile(show);
        }).on('hover:focus', () => {
            if (Lampa.Helper) Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.html);
        });
    }

    empty() {
        const html = Lampa.Template.get('lampac_does_not_answer', {});
        html.find('.online-empty__buttons').remove();
        html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two'));
        html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text'));
        this.scroll.clear();
        this.scroll.append(html);
        this.loading(false);
    }

    noConnectToServer(err) {
        const html = Lampa.Template.get('lampac_does_not_answer', {});
        html.find('.online-empty__buttons').remove();
        html.find('.online-empty__title').text(Lampa.Lang.translate('title_error'));
        html.find('.online-empty__time').text(err && err.accsdb ? err.msg : Lampa.Lang.translate('lampac_does_not_answer_text').replace('{balanser}', this.sources[this.balanser].name));
        this.scroll.clear();
        this.scroll.append(html);
        this.loading(false);
    }

    doesNotAnswer(err) {
        this.reset();
        const html = Lampa.Template.get('lampac_does_not_answer', { balanser: this.balanser });
        if (err && err.accsdb) html.find('.online-empty__title').html(err.msg);
        let tic = err && err.accsdb ? 10 : 5;
        html.find('.cancel').on('hover:enter', () => { clearInterval(this.balanserTimer); });
        html.find('.change').on('hover:enter', () => {
            clearInterval(this.balanserTimer);
            this.filter.render().find('.filter--sort').trigger('hover:enter');
        });
        this.scroll.clear();
        this.scroll.append(html);
        this.loading(false);
        this.balanserTimer = setInterval(() => {
            tic--;
            html.find('.timeout').text(tic);
            if (tic === 0) {
                clearInterval(this.balanserTimer);
                const keys = Lampa.Arrays.getKeys(this.sources);
                let index = keys.indexOf(this.balanser);
                let next = keys[index + 1];
                if (!next) next = keys[0];
                this.balanser = next;
                if (Lampa.Activity.active().activity === this.activity) {
                    this.changeBalanser(this.balanser);
                }
            }
        }, 1000);
    }

    getLastEpisode(items) {
        let last_episode = 0;
        items.forEach((e) => {
            if (typeof e.episode !== 'undefined') {
                last_episode = Math.max(last_episode, parseInt(e.episode));
            }
        });
        return last_episode;
    }

    start() {
        if (Lampa.Activity.active().activity !== this.activity) return;
        if (!this.initialized) {
            this.initialized = true;
            this.initialize();
        }
        Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(this.object.movie));
        Lampa.Controller.add('content', {
            toggle: () => {
                Lampa.Controller.collectionSet(this.scroll.render(), this.files.render());
                Lampa.Controller.collectionFocus(this.last || null, this.scroll.render());
            },
            gone: () => { clearTimeout(this.balanserTimer); },
            up: () => {
                if (Navigator.canmove('up')) Navigator.move('up');
                else Lampa.Controller.toggle('head');
            },
            down: () => { Navigator.move('down'); },
            right: () => {
                if (Navigator.canmove('right')) Navigator.move('right');
                else this.filter.show(Lampa.Lang.translate('title_filter'), 'filter');
            },
            left: () => {
                if (Navigator.canmove('left')) Navigator.move('left');
                else Lampa.Controller.toggle('menu');
            },
            back: this.back.bind(this)
        });
        Lampa.Controller.toggle('content');
    }

    render() {
        return this.files.render();
    }

    back() {
        Lampa.Activity.backward();
    }

    pause() {}
    stop() {}

    destroy() {
        this.network.clear();
        this.clearImages();
        this.files.destroy();
        this.scroll.destroy();
        clearInterval(this.balanserTimer);
        clearTimeout(this.lifeWaitTimer);
        clearTimeout(this.hubTimer);
        if (this.hubConnection) {
            this.hubConnection.stop();
            this.hubConnection = null;
        }
    }
}

(function startPlugin() {
    if (window.lampac_plugin) return;
    window.lampac_plugin = true;
    const manifest = {
        type: 'video',
        version: '2',
        name: '4m1K',
        description: 'Плагин для просмотра онлайн сериалов и фильмов',
        component: 'lampac',
        onContextMenu: (object) => ({
            name: Lampa.Lang.translate('lampac_watch'),
            description: 'Плагин для просмотра онлайн сериалов и фильмов'
        }),
        onContextLauch: (object) => {
            resetTemplates();
            Lampa.Component.add('lampac', Lampac);
            const id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
            const all = Lampa.Storage.get('clarification_search', '{}');
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_online'),
                component: 'lampac',
                search: all[id] ? all[id] : object.title,
                search_one: object.title,
                search_two: object.original_title,
                movie: object,
                page: 1,
                clarification: all[id] ? true : false
            });
        }
    };
    Lampa.Manifest.plugins = manifest;
    Lampa.Lang.add({
        lampac_watch: { ru: 'Онлайн', en: 'Online', uk: 'Онлайн', zh: '在线观看' },
        lampac_video: { ru: 'Видео', en: 'Video', uk: 'Відео', zh: '视频' },
        lampac_no_watch_history: { ru: 'Нет истории просмотра', en: 'No browsing history', ua: 'Немає історії перегляду', zh: '没有浏览历史' },
        lampac_nolink: { ru: 'Не удалось извлечь ссылку', uk: 'Неможливо отримати посилання', en: 'Failed to fetch link', zh: '获取链接失败' },
        lampac_balanser: { ru: 'Источник', uk: 'Джерело', en: 'Source', zh: '来源' },
        helper_online_file: { ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню', uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню', en: 'Hold the "OK" key to bring up the context menu', zh: '按住“确定”键调出上下文菜单' },
        title_online: { ru: 'Онлайн', uk: 'Онлайн', en: 'Online', zh: '在线的' },
        lampac_voice_subscribe: { ru: 'Подписаться на перевод', uk: 'Підписатися на переклад', en: 'Subscribe to translation', zh: '订阅翻译' },
        lampac_voice_success: { ru: 'Вы успешно подписались', uk: 'Ви успішно підписалися', en: 'You have successfully subscribed', zh: '您已成功订阅' },
        lampac_voice_error: { ru: 'Возникла ошибка', uk: 'Виникла помилка', en: 'An error has occurred', zh: '发生了错误' },
        lampac_clear_all_marks: { ru: 'Очистить все метки', uk: 'Очистити всі мітки', en: 'Clear all labels', zh: '清除所有标签' },
        lampac_clear_all_timecodes: { ru: 'Очистить все тайм-коды', uk: 'Очистити всі тайм-коди', en: 'Clear all timecodes', zh: '清除所有时间代码' },
        lampac_change_balanser: { ru: 'Изменить балансер', uk: 'Змінити балансер', en: 'Change balancer', zh: '更改平衡器' },
        lampac_balanser_dont_work: { ru: 'Поиск на ({balanser}) не дал результатов', uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results', zh: '搜索 ({balanser}) 未返回任何结果' },
        lampac_balanser_timeout: { ru: 'Источник будет переключен автоматически через <span class="timeout">10</span> секунд.', uk: 'Джерело буде автоматично переключено через <span class="timeout">10</span> секунд.', en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.', zh: '平衡器将在<span class="timeout">10</span>秒内自动切换。' },
        lampac_does_not_answer_text: { ru: 'Поиск на ({balanser}) не дал результатов', uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results', zh: '搜索 ({balanser}) 未返回任何结果' }
    });
    Lampa.Template.add('lampac_css', `
        <style>
        @charset 'UTF-8';
        .online-prestige { position: relative; border-radius: .3em; background-color: rgba(0,0,0,0.3); display: flex; }
        .online-prestige__body { padding: 1.2em; line-height: 1.3; flex-grow: 1; position: relative; }
        @media screen and (max-width: 480px) { .online-prestige__body { padding: .8em 1.2em; } }
        .online-prestige__img { position: relative; width: 13em; flex-shrink: 0; min-height: 8.2em; }
        .online-prestige__img > img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: .3em; opacity: 0; transition: opacity .3s; }
        .online-prestige__img--loaded > img { opacity: 1; }
        @media screen and (max-width: 480px) { .online-prestige__img { width: 7em; min-height: 6em; } }
        .online-prestige__folder { padding: 1em; flex-shrink: 0; }
        .online-prestige__folder > svg { width: 4.4em !important; height: 4.4em !important; }
        .online-prestige__viewed { position: absolute; top: 1em; left: 1em; background: rgba(0,0,0,0.45); border-radius: 100%; padding: .25em; font-size: .76em; }
        .online-prestige__viewed > svg { width: 1.5em !important; height: 1.5em !important; }
        .online-prestige__episode-number { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-size: 2em; }
        .online-prestige__loader { position: absolute; top: 50%; left: 50%; width: 2em; height: 2em; margin-left: -1em; margin-top: -1em; background: url(./img/loader.svg) no-repeat center center; background-size: contain; }
        .online-prestige__head, .online-prestige__footer { display: flex; justify-content: space-between; align-items: center; }
        .online-prestige__timeline { margin: .8em 0; }
        .online-prestige__timeline > .time-line { display: block !important; }
        .online-prestige__title { font-size: 1.7em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
        @media screen and (max-width: 480px) { .online-prestige__title { font-size: 1.4em; } }
        .online-prestige__time { padding-left: 2em; }
        .online-prestige__info { display: flex; align-items: center; }
        .online-prestige__info > * { overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
        .online-prestige__quality { padding-left: 1em; white-space: nowrap; }
        .online-prestige__scan-file { position: absolute; bottom: 0; left: 0; right: 0; }
        .online-prestige__scan-file .broadcast__scan { margin: 0; }
        .online-prestige .online-prestige-split { font-size: .8em; margin: 0 1em; flex-shrink: 0; }
        .online-prestige.focus::after { content: ''; position: absolute; top: -0.6em; left: -0.6em; right: -0.6em; bottom: -0.6em; border-radius: .7em; border: solid .3em #fff; z-index: -1; pointer-events: none; }
        .online-prestige + .online-prestige { margin-top: 1.5em; }
        .online-prestige--folder .online-prestige__footer { margin-top: .8em; }
        .online-prestige-watched { padding: 1em; }
        .online-prestige-watched__icon > svg { width: 1.5em; height: 1.5em; }
        .online-prestige-watched__body { padding-left: 1em; padding-top: .1em; display: flex; flex-wrap: wrap; }
        .online-prestige-watched__body > span + span::before { content: ' ● '; vertical-align: top; display: inline-block; margin: 0 .5em; }
        .online-prestige-rate { display: inline-flex; align-items: center; }
        .online-prestige-rate > svg { width: 1.3em !important; height: 1.3em !important; }
        .online-prestige-rate > span { font-weight: 600; font-size: 1.1em; padding-left: .7em; }
        .online-empty { line-height: 1.4; }
        .online-empty__title { font-size: 1.8em; margin-bottom: .3em; }
        .online-empty__time { font-size: 1.2em; font-weight: 300; margin-bottom: 1.6em; }
        .online-empty__buttons { display: flex; }
        .online-empty__buttons > * + * { margin-left: 1em; }
        .online-empty__button { background: rgba(0,0,0,0.3); font-size: 1.2em; padding: .5em 1.2em; border-radius: .2em; margin-bottom: 2.4em; }
        .online-empty__button.focus { background: #fff; color: black; }
        .online-empty__templates .online-empty-template:nth-child(2) { opacity: .5; }
        .online-empty__templates .online-empty-template:nth-child(3) { opacity: .2; }
        .online-empty-template { background-color: rgba(255,255,255,0.3); padding: 1em; display: flex; align-items: center; border-radius: .3em; }
        .online-empty-template > * { background: rgba(0,0,0,0.3); border-radius: .3em; }
        .online-empty-template__ico { width: 4em; height: 4em; margin-right: 2.4em; }
        .online-empty-template__body { height: 1.7em; width: 70%; }
        .online-empty-template + .online-empty-template { margin-top: 1em; }
        </style>
    `);
    $('body').append(Lampa.Template.get('lampac_css', {}, true));
    const resetTemplates = () => {
        Lampa.Template.add('lampac_prestige_full', `<div class="online-prestige online-prestige--full selector">
            <div class="online-prestige__img">
                <img alt="">
                <div class="online-prestige__loader"></div>
            </div>
            <div class="online-prestige__body">
                <div class="online-prestige__head">
                    <div class="online-prestige__title">{title}</div>
                    <div class="online-prestige__time">{time}</div>
                </div>

                <div class="online-prestige__timeline"></div>

                <div class="online-prestige__footer">
                    <div class="online-prestige__info">{info}</div>
                    <div class="online-prestige__quality">{quality}</div>
                </div>
            </div>
        </div>`);
        Lampa.Template.add('lampac_content_loading', `<div class="online-empty">
            <div class="broadcast__scan"><div></div></div>

            <div class="online-empty__templates">
                <div class="online-empty-template selector">
                    <div class="online-empty-template__ico"></div>
                    <div class="online-empty-template__body"></div>
                </div>
                <div class="online-empty-template">
                    <div class="online-empty-template__ico"></div>
                    <div class="online-empty-template__body"></div>
                </div>
                <div class="online-empty-template">
                    <div class="online-empty-template__ico"></div>
                    <div class="online-empty-template__body"></div>
                </div>
            </div>
        </div>`);
        Lampa.Template.add('lampac_does_not_answer', `<div class="online-empty">
            <div class="online-empty__title">
                #{lampac_balanser_dont_work}
            </div>
            <div class="online-empty__time">
                #{lampac_balanser_timeout}
            </div>
            <div class="online-empty__buttons">
                <div class="online-empty__button selector cancel">#{cancel}</div>
                <div class="online-empty__button selector change">#{lampac_change_balanser}</div>
            </div>
            <div class="online-empty__templates">
                <div class="online-empty-template">
                    <div class="online-empty-template__ico"></div>
                    <div class="online-empty-template__body"></div>
                </div>
                <div class="online-empty-template">
                    <div class="online-empty-template__ico"></div>
                    <div class="online-empty-template__body"></div>
                </div>
                <div class="online-empty-template">
                    <div class="online-empty-template__ico"></div>
                    <div class="online-empty-template__body"></div>
                </div>
            </div>
        </div>`);
        Lampa.Template.add('lampac_prestige_rate', `<div class="online-prestige-rate">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z" fill="#fff"></path>
            </svg>
            <span>{rate}</span>
        </div>`);
        Lampa.Template.add('lampac_prestige_folder', `<div class="online-prestige online-prestige--folder selector">
            <div class="online-prestige__folder">
                <svg viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="20" width="128" height="92" rx="13" fill="white"></rect>
                    <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"></path>
                    <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"></rect>
                </svg>
            </div>
            <div class="online-prestige__body">
                <div class="online-prestige__head">
                    <div class="online-prestige__title">{title}</div>
                    <div class="online-prestige__time">{time}</div>
                </div>

                <div class="online-prestige__footer">
                    <div class="online-prestige__info">{info}</div>
                </div>
            </div>
        </div>`);
        Lampa.Template.add('lampac_prestige_watched', `<div class="online-prestige online-prestige-watched selector">
            <div class="online-prestige-watched__icon">
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10.5" cy="10.5" r="9" stroke="currentColor" stroke-width="3"/>
                    <path d="M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="online-prestige-watched__body">
            </div>
        </div>`);
    };
    const buttonHTML = `<div class="full-start__button selector view--online4 4m1K--button" data-subtitle="${manifest.name} ${manifest.version}">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 392.697 392.697" xml:space="preserve">
            <path d="M21.837,83.419l36.496,16.678L227.72,19.886c1.229-0.592,2.002-1.846,1.98-3.209c-0.021-1.365-0.834-2.592-2.082-3.145L197.766,0.3c-0.903-0.4-1.933-0.4-2.837,0L21.873,77.036c-1.259,0.559-2.073,1.803-2.081,3.18C19.784,81.593,20.584,82.847,21.837,83.419z" fill="currentColor"></path>
            <path d="M185.689,177.261l-64.988-30.01v91.617c0,0.856-0.44,1.655-1.167,2.114c-0.406,0.257-0.869,0.386-1.333,0.386c-0.368,0-0.736-0.082-1.079-0.244l-68.874-32.625c-0.869-0.416-1.421-1.293-1.421-2.256v-92.229L6.804,95.5c-1.083-0.496-2.344-0.406-3.347,0.238c-1.002,0.645-1.608,1.754-1.608,2.944v208.744c0,1.371,0.799,2.615,2.045,3.185l178.886,81.768c0.464,0.211,0.96,0.315,1.455,0.315c0.661,0,1.318-0.188,1.892-0.555c1.002-0.645,1.608-1.754,1.608-2.945V180.445C187.735,179.076,186.936,177.831,185.689,177.261z" fill="currentColor"></path>
            <path d="M389.24,95.74c-1.002-0.644-2.264-0.732-3.347-0.238l-178.876,81.76c-1.246,0.57-2.045,1.814-2.045,3.185v208.751c0,1.191,0.606,2.302,1.608,2.945c0.572,0.367,1.23,0.555,1.892,0.555c0.495,0,0.991-0.104,1.455-0.315l178.876-81.768c1.246-0.568,2.045-1.813,2.045-3.185V98.685C390.849,97.494,390.242,96.384,389.24,95.74z" fill="currentColor"></path>
            <path d="M372.915,80.216c-0.009-1.377-0.823-2.621-2.082-3.18l-60.182-26.681c-0.938-0.418-2.013-0.399-2.938,0.045l-173.755,82.992l60.933,29.117c0.462,0.211,0.958,0.316,1.455,0.316s0.993-0.105,1.455-0.316l173.066-79.092C372.122,82.847,372.923,81.593,372.915,80.216z" fill="currentColor"></path>
        </svg>
        <span>#{title_online}</span>
    </div>`;
    const addButton = (e) => {
        if (e.render.find('.4m1K--button').length) return;
        const btn = $(Lampa.Lang.translate(buttonHTML));
        btn.on('hover:enter', () => {
            resetTemplates();
            Lampa.Component.add('lampac', Lampac);
            const id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
            const all = Lampa.Storage.get('clarification_search', '{}');
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_online'),
                component: 'lampac',
                search: all[id] ? all[id] : e.movie.title,
                search_one: e.movie.title,
                search_two: e.movie.original_title,
                movie: e.movie,
                page: 1,
                clarification: all[id] ? true : false
            });
        });
        e.render.before(btn);
    };
    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complite') {
            setTimeout(() => {
                $(".view--online4", Lampa.Activity.active().activity.render()).empty().append('<svg id="Icons" enable-background="new 0 0 32 32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g><path fill="currentColor" d="m31.6 5.2c-.2-.2-.6-.2-.9-.2-9.6 2.6-19.8 2.6-29.4 0-.3 0-.7 0-.9.2-.3.2-.4.5-.4.8v20c0 .3.1.6.4.8.2.2.6.2.9.2 9.6-2.6 19.8-2.6 29.5 0h.3c.2 0 .4-.1.6-.2.2-.2.4-.5.4-.8v-20c-.1-.3-.2-.6-.5-.8zm-17.6 14.8c0 .6-.4 1-1 1s-1-.4-1-1v-2h-4c-.4 0-.8-.2-.9-.6-.2-.4-.1-.8.2-1.1l5-5c.1-.1.2-.2.3-.2.2-.1.5-.1.8 0 .2.1.4.3.5.5.1.1.1.3.1.4zm8.8-.6c.3.4.2 1.1-.2 1.4-.2.1-.4.2-.6.2-.3 0-.6-.1-.8-.4l-3-4c-.1-.2-.2-.4-.2-.6v4c0 .6-.4 1-1 1s-1-.4-1-1v-8c0-.6.4-1 1-1s1 .4 1 1v4c0-.2.1-.4.2-.6l3-4c.3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-2.5 3.4z"></path><path fill="currentColor" d="m12 16v-1.6l-1.6 1.6z"></path></g></svg>&nbsp;&nbsp;4m1K');
            }, 5);
            if (Lampa.Storage.get('card_interfice_type') === 'new') {
                addButton({ render: e.object.activity.render().find('.button--play'), movie: e.data.movie });
            } else {
                addButton({ render: e.object.activity.render().find('.view--torrent'), movie: e.data.movie });
            }
        }
    });
    try {
        if (Lampa.Activity.active().component === 'full') {
            addButton({ render: Lampa.Activity.active().activity.render().find('.view--torrent'), movie: Lampa.Activity.active().card });
        }
    } catch (e) {}
    if (Lampa.Manifest.app_digital >= 177) {
        const balancersSync = [
            "filmix", "filmixtv", "fxapi", "rezka", "rhsprem", "lumex", "videodb", "collaps", "hdvb", "zetflix", "kodik", "ashdi", "kinoukr", "kinotochka", "remux", "iframevideo", "cdnmovies", "anilibria", "animedia", "animego", "animevost", "animebesst", "redheadsound", "alloha", "animelib", "moonanime", "kinopub", "vibix", "vdbmovies", "fancdn", "cdnvideohub", "vokino", "rc/filmix", "rc/fxapi", "rc/kinopub", "rc/rhs", "vcdn"
        ];
        balancersSync.forEach(name => {
            Lampa.Storage.sync('online_choice_' + name, 'object_object');
        });
        Lampa.Storage.sync('online_watched_last', 'object_object');
    }
})();
