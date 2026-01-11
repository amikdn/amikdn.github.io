(function () {
    'use strict';

    // ========================================================================
    // КОНФИГУРАЦИЯ И КЭШ
    // ========================================================================
    // УБРАЛИ: var STORAGE_KEY = 'continue_watch_params';
    var MEMORY_CACHE = null;
    var TORRSERVER_CACHE = null;
    var FILES_CACHE = {};

    var ACCOUNT_READY = !!window.appready;

    // чтобы не смешивать кэш разных профилей
    var ACTIVE_STORAGE_KEY = null;
    // чтобы гарантировать, что sync зарегистрирован именно для текущего ключа
    var SYNCED_STORAGE_KEY = null;

    // миграция старого общего ключа -> профильный (однократно)
    var MIGRATION_FLAG_KEY = 'continue_watch_params__migrated_to_profiles';

    var TIMERS = {
        save: null,
        debounce_click: null
    };

    var LISTENERS = {
        player_start: null,
        player_destroy: null,
        initialized: false
    };

    var STATE = {
        building_playlist: false
    };

    // ========================================================================
    // ПРОФИЛИ: ключ хранилища + синхронизация ключа
    // ========================================================================
    function getStorageKey() {
        try {
            if (
                ACCOUNT_READY &&
                Lampa.Account &&
                Lampa.Account.Permit &&
                Lampa.Account.Permit.sync &&
                Lampa.Account.Permit.account &&
                Lampa.Account.Permit.account.profile &&
                typeof Lampa.Account.Permit.account.profile.id !== 'undefined'
            ) {
                return 'continue_watch_params_' + Lampa.Account.Permit.account.profile.id;
            }
        } catch (e) {}
        return 'continue_watch_params';
    }

    function getActiveStorageKey() {
        var key = getStorageKey();
        if (ACTIVE_STORAGE_KEY !== key) {
            ACTIVE_STORAGE_KEY = key;
            MEMORY_CACHE = null; // не смешиваем данные разных профилей
        }
        return key;
    }

    function ensureStorageSync() {
        var key = getActiveStorageKey();
        if (SYNCED_STORAGE_KEY !== key) {
            try {
                Lampa.Storage.sync(key, 'object_object');
            } catch (e) {}
            SYNCED_STORAGE_KEY = key;
        }
    }

    // ========================================================================
    // 1. ХРАНИЛИЩЕ
    // ========================================================================

    // регистрируем sync хотя бы для базового ключа сразу
    ensureStorageSync();

    Lampa.Storage.listener.follow('change', function (e) {
        // если изменился любой continue_watch ключ — сбрасываем кэш
        if (e.name && typeof e.name === 'string' && e.name.indexOf('continue_watch_params') === 0) {
            MEMORY_CACHE = null;
        }

        // при смене аккаунта/подгрузке permit — пересобираем ключ, sync и миграцию
        if (e.name === 'account') {
            MEMORY_CACHE = null;
            ensureStorageSync();
            migrateOldData();
        }

        if (e.name === 'torrserver_url' || e.name === 'torrserver_url_two' || e.name === 'torrserver_use_link') {
            TORRSERVER_CACHE = null;
        }
    });

    function getParams() {
        ensureStorageSync();
        if (!MEMORY_CACHE) MEMORY_CACHE = Lampa.Storage.get(getActiveStorageKey(), {});
        return MEMORY_CACHE;
    }

    function setParams(data, force) {
        ensureStorageSync();
        MEMORY_CACHE = data;
        clearTimeout(TIMERS.save);

        var key = getActiveStorageKey();

        if (force) {
            Lampa.Storage.set(key, data);
        } else {
            TIMERS.save = setTimeout(function () {
                Lampa.Storage.set(key, data);
            }, 1000);
        }
    }

    function updateContinueWatchParams(hash, data) {
        var params = getParams();
        if (!params[hash]) params[hash] = {};

        var changed = false;
        for (var key in data) {
            if (params[hash][key] !== data[key]) {
                params[hash][key] = data[key];
                changed = true;
            }
        }

        if (changed || !params[hash].timestamp) {
            params[hash].timestamp = Date.now();
            // Мгновенная синхронизация при завершении (>90%)
            var isCritical = (data.percent && data.percent > 90);
            setParams(params, isCritical);
        }
    }

    function getTorrServerUrl() {
        if (!TORRSERVER_CACHE) {
            var url = Lampa.Storage.get('torrserver_url');
            var url_two = Lampa.Storage.get('torrserver_url_two');
            var use_two = Lampa.Storage.field('torrserver_use_link') == 'two';
            var final_url = use_two ? (url_two || url) : (url || url_two);
            if (final_url) {
                if (!final_url.match(/^https?:\/\//)) final_url = 'http://' + final_url;
                final_url = final_url.replace(/\/$/, '');
            }
            TORRSERVER_CACHE = final_url;
        }
        return TORRSERVER_CACHE;
    }

    // ========================================================================
    // 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ========================================================================

    function formatTime(seconds) {
        if (!seconds) return '';
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);
        return h > 0 ? h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s : m + ':' + (s < 10 ? '0' : '') + s;
    }

    function cleanupOldParams() {
        setTimeout(function () {
            try {
                var params = getParams();
                var now = Date.now();
                var changed = false;
                var max_age = 60 * 24 * 60 * 60 * 1000; // 60 дней

                Object.keys(params).forEach(function (hash) {
                    if (params[hash].timestamp && now - params[hash].timestamp > max_age) {
                        delete params[hash];
                        changed = true;
                    }
                });

                if (changed) setParams(params);
            } catch (e) { console.error('CleanUp Error', e); }
        }, 10000);
    }

    function getStreamParams(movie) {
        if (!movie) return null;
        var title = movie.original_name || movie.original_title || movie.name || movie.title;
        if (!title) return null;

        var params = getParams();

        if (movie.number_of_seasons) {
            var latestEpisode = null;
            var latestTimestamp = 0;

            Object.keys(params).forEach(function (hash) {
                var p = params[hash];
                if (p.title === title && p.season && p.episode) {
                    if (p.timestamp && p.timestamp > latestTimestamp) {
                        latestTimestamp = p.timestamp;
                        latestEpisode = p;
                    }
                }
            });
            return latestEpisode;
        } else {
            var hash = Lampa.Utils.hash(title);
            return params[hash] || null;
        }
    }

    function buildStreamUrl(params) {
        if (!params || !params.file_name || !params.torrent_link) return null;
        var server_url = getTorrServerUrl();
        if (!server_url) {
            Lampa.Noty.show('TorrServer не настроен');
            return null;
        }
        var url = server_url + '/stream/' + encodeURIComponent(params.file_name);
        var query = [];
        if (params.torrent_link) query.push('link=' + params.torrent_link);
        query.push('index=' + (params.file_index || 0));
        query.push('play');
        return url + '?' + query.join('&');
    }

    function generateHash(movie, season, episode) {
        var title = movie.original_name || movie.original_title || movie.name || movie.title;
        if (movie.number_of_seasons && season && episode) {
            var separator = season > 10 ? ':' : '';
            return Lampa.Utils.hash([season, separator, episode, title].join(''));
        }
        return Lampa.Utils.hash(title);
    }

    // ========================================================================
    // 3. ОТСЛЕЖИВАНИЕ И TIMELINE
    // ========================================================================

    function setupTimelineSaving() {
        Lampa.Timeline.listener.follow('update', function (e) {
            var hash = e.data.hash;
            var road = e.data.road;
            if (hash && road && typeof road.percent !== 'undefined') {
                var params = getParams();
                if (params[hash]) {
                    updateContinueWatchParams(hash, {
                        percent: road.percent,
                        time: road.time,
                        duration: road.duration
                    });
                }
            }
        });
    }

    function wrapTimelineHandler(timeline, params) {
        if (!timeline) return timeline;
        if (timeline._wrapped_continue) return timeline;

        var originalHandler = timeline.handler;
        var lastUpdate = 0;

        timeline.handler = function (percent, time, duration) {
            if (originalHandler) originalHandler(percent, time, duration);

            var now = Date.now();
            if (now - lastUpdate > 1000) {
                lastUpdate = now;
                updateContinueWatchParams(timeline.hash, {
                    file_name: params.file_name,
                    torrent_link: params.torrent_link,
                    file_index: params.file_index,
                    title: params.title,
                    season: params.season,
                    episode: params.episode,
                    episode_title: params.episode_title,
                    percent: percent,
                    time: time,
                    duration: duration
                });
            }
        };
        timeline._wrapped_continue = true;
        return timeline;
    }

    // ========================================================================
    // 4. ПЛЕЙЛИСТ И ЗАГРУЗКА
    // ========================================================================

    function buildPlaylist(movie, currentParams, currentUrl, quietMode, callback) {
        if (STATE.building_playlist && !quietMode) {
            callback([]);
            return;
        }

        if (!quietMode) STATE.building_playlist = true;

        var title = movie.original_name || movie.original_title || movie.name || movie.title;
        var allParams = getParams();
        var playlist = [];
        var ABORT_CONTROLLER = false;

        var finalize = function (resultList) {
            ABORT_CONTROLLER = true;
            if (!quietMode) {
                Lampa.Loading.stop();
                STATE.building_playlist = false;
            }
            callback(resultList);
        };

        for (var hash in allParams) {
            var p = allParams[hash];
            if (p.title === title && p.season && p.episode) {
                var episodeHash = generateHash(movie, p.season, p.episode);
                var timeline = Lampa.Timeline.view(episodeHash);
                if (timeline) wrapTimelineHandler(timeline, p);

                var isCurrent = (p.season === currentParams.season && p.episode === currentParams.episode);
                var item = {
                    title: p.episode_title || ('S' + p.season + ' E' + p.episode),
                    season: p.season,
                    episode: p.episode,
                    timeline: timeline,
                    torrent_hash: p.torrent_hash || p.torrent_link,
                    card: movie,
                    url: buildStreamUrl(p),
                    position: isCurrent ? (timeline ? (timeline.time || -1) : -1) : -1
                };
                if (isCurrent) item.url = currentUrl;
                playlist.push(item);
            }
        }

        if (!currentParams.torrent_link) { finalize(playlist); return; }

        var processFiles = function (files) {
            if (!FILES_CACHE[currentParams.torrent_link]) {
                FILES_CACHE[currentParams.torrent_link] = files;
                setTimeout(function () { delete FILES_CACHE[currentParams.torrent_link]; }, 300000);
            }

            var uniqueEpisodes = new Set();
            playlist.forEach(function (p) { uniqueEpisodes.add(p.season + '_' + p.episode); });

            files.forEach(function (file) {
                if (ABORT_CONTROLLER) return;
                try {
                    var episodeInfo = Lampa.Torserver.parse({
                        movie: movie, files: [file], filename: file.path.split('/').pop(), path: file.path, is_file: true
                    });

                    if (!movie.number_of_seasons || (episodeInfo.season === currentParams.season)) {
                        var epKey = episodeInfo.season + '_' + episodeInfo.episode;

                        if (!uniqueEpisodes.has(epKey)) {
                            var episodeHash = generateHash(movie, episodeInfo.season, episodeInfo.episode);
                            var timeline = Lampa.Timeline.view(episodeHash);
                            if (!timeline) timeline = { hash: episodeHash, percent: 0, time: 0, duration: 0 };

                            if (!allParams[episodeHash]) {
                                updateContinueWatchParams(episodeHash, {
                                    file_name: file.path,
                                    torrent_link: currentParams.torrent_link,
                                    file_index: file.id || 0,
                                    title: title,
                                    season: episodeInfo.season,
                                    episode: episodeInfo.episode,
                                    percent: 0, time: 0, duration: 0
                                });
                            }

                            var isCurrent = (episodeInfo.season === currentParams.season && episodeInfo.episode === currentParams.episode);
                            var item = {
                                title: movie.number_of_seasons ? ('S' + episodeInfo.season + ' E' + episodeInfo.episode) : (movie.title || title),
                                season: episodeInfo.season,
                                episode: episodeInfo.episode,
                                timeline: timeline,
                                torrent_hash: currentParams.torrent_link,
                                card: movie,
                                url: buildStreamUrl({
                                    file_name: file.path,
                                    torrent_link: currentParams.torrent_link,
                                    file_index: file.id || 0
                                }),
                                position: isCurrent ? (timeline ? (timeline.time || -1) : -1) : -1
                            };
                            if (isCurrent || (file.id === currentParams.file_index && !movie.number_of_seasons)) item.url = currentUrl;
                            playlist.push(item);
                            uniqueEpisodes.add(epKey);
                        }
                    }
                } catch (e) { }
            });

            if (movie.number_of_seasons) playlist.sort(function (a, b) { return a.episode - b.episode; });
            finalize(playlist);
        };

        if (FILES_CACHE[currentParams.torrent_link]) { processFiles(FILES_CACHE[currentParams.torrent_link]); return; }

        if (!quietMode) Lampa.Loading.start(function () { ABORT_CONTROLLER = true; finalize([]); }, 'Подготовка...');

        Lampa.Torserver.hash({
            link: currentParams.torrent_link,
            title: title,
            poster: movie.poster_path,
            data: { lampa: true, movie: movie }
        }, function (torrent) {
            if (ABORT_CONTROLLER) return;
            var retryCount = 0;
            var maxRetries = 5;

            var fetchFiles = function () {
                if (ABORT_CONTROLLER) return;
                Lampa.Torserver.files(torrent.hash, function (json) {
                    if (ABORT_CONTROLLER) return;
                    if (json && json.file_stats && json.file_stats.length > 0) {
                        processFiles(json.file_stats);
                    } else if (retryCount < maxRetries) {
                        retryCount++;
                        if (!quietMode) Lampa.Loading.setText('Ожидание файлов (' + retryCount + '/' + maxRetries + ')...');
                        setTimeout(fetchFiles, retryCount * 1000);
                    } else { finalize(playlist); }
                }, function () {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(fetchFiles, retryCount * 1000);
                    } else { if (!ABORT_CONTROLLER) finalize(playlist); }
                });
            };
            fetchFiles();
        }, function () { if (!ABORT_CONTROLLER) finalize(playlist); });
    }

    // ========================================================================
    // 5. ЛОГИКА ПЛЕЕРА И ХУКИ (С ИСПРАВЛЕНИЕМ СИНХРОНИЗАЦИИ)
    // ========================================================================

    function launchPlayer(movie, params) {
        var url = buildStreamUrl(params);
        if (!url) return;

        var currentHash = generateHash(movie, params.season, params.episode);
        var timeline = Lampa.Timeline.view(currentHash);

        if (!timeline || (!timeline.time && !timeline.percent)) {
            timeline = timeline || { hash: currentHash };
            timeline.time = params.time || 0;
            timeline.percent = params.percent || 0;
            timeline.duration = params.duration || 0;
        } else if (params.time > timeline.time) {
            timeline.time = params.time;
            timeline.percent = params.percent;
        }

        wrapTimelineHandler(timeline, params);
        updateContinueWatchParams(currentHash, { percent: timeline.percent, time: timeline.time, duration: timeline.duration });

        var player_type = Lampa.Storage.field('player_torrent');
        var force_inner = (player_type === 'inner');
        var isExternalPlayer = !force_inner && (player_type !== 'lampa');

        var playerData = {
            url: url, title: params.episode_title || params.title || movie.title,
            card: movie, torrent_hash: params.torrent_link, timeline: timeline,
            season: params.season, episode: params.episode, position: timeline.time || -1
        };

        if (force_inner) {
            delete playerData.torrent_hash;
            var original_platform_is = Lampa.Platform.is;
            Lampa.Platform.is = function (what) { return what === 'android' ? false : original_platform_is(what); };
            setTimeout(function () { Lampa.Platform.is = original_platform_is; }, 500);
            Lampa.Storage.set('internal_torrclient', true);
        }

        if (isExternalPlayer) {
            buildPlaylist(movie, params, url, false, function (playlist) {
                if (playlist.length === 0 && !params.torrent_link) return;
                playerData.playlist = playlist.length ? playlist : null;
                Lampa.Player.play(playerData);
                Lampa.Player.callback(function () { Lampa.Controller.toggle('content'); });
            });
        } else {
            var tempPlaylist = [{ url: url, title: params.episode_title || ('S' + params.season + ' E' + params.episode), timeline: timeline, season: params.season, episode: params.episode, card: movie }];
            if (movie.number_of_seasons) tempPlaylist.push({ title: 'Загрузка списка...', url: '', timeline: {} });
            playerData.playlist = tempPlaylist;

            if (timeline.time > 0) Lampa.Noty.show('Восстанавливаем: ' + formatTime(timeline.time));
            Lampa.Player.play(playerData);
            setupPlayerListeners();
            Lampa.Player.callback(function () { Lampa.Controller.toggle('content'); });

            if (movie.number_of_seasons && params.season && params.episode) {
                buildPlaylist(movie, params, url, true, function (playlist) {
                    if (playlist.length > 1) { Lampa.Player.playlist(playlist); Lampa.Noty.show('Плейлист загружен (' + playlist.length + ' эп.)'); }
                });
            }
        }
    }

    function setupPlayerListeners() {
        if (LISTENERS.initialized) cleanupPlayerListeners();
        LISTENERS.player_start = function (data) {
            if (data.card) {
                var hash = generateHash(data.card, data.season, data.episode);
                var matchFile = data.url.match(/\/stream\/([^?]+)/);
                if (matchFile) {
                    updateContinueWatchParams(hash, {
                        file_name: decodeURIComponent(matchFile[1]),
                        title: data.card.original_name || data.card.original_title || data.card.title,
                        season: data.season, episode: data.episode
                    });
                }
            }
        };
        LISTENERS.player_destroy = function () { cleanupPlayerListeners(); };
        Lampa.Player.listener.follow('start', LISTENERS.player_start);
        Lampa.Player.listener.follow('destroy', LISTENERS.player_destroy);
        LISTENERS.initialized = true;
    }

    function cleanupPlayerListeners() {
        if (LISTENERS.player_start) { Lampa.Player.listener.remove('start', LISTENERS.player_start); LISTENERS.player_start = null; }
        if (LISTENERS.player_destroy) { Lampa.Player.listener.remove('destroy', LISTENERS.player_destroy); LISTENERS.player_destroy = null; }
        LISTENERS.initialized = false;
    }

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ PATCHPLAYER
    function patchPlayer() {
        var originalPlay = Lampa.Player.play;
        Lampa.Player.play = function (params) {
            if (params && (params.torrent_hash || (params.url && params.url.includes('/stream/')))) {
                var movie = params.card || params.movie || (Lampa.Activity.active() && Lampa.Activity.active().movie);
                if (movie) {
                    var hash = generateHash(movie, params.season, params.episode);
                    if (hash) {
                        // FIX: Проверяем наличие прогресса в Timeline перед сохранением
                        var timeline = Lampa.Timeline.view(hash);
                        var isNewSession = !timeline || !timeline.percent || timeline.percent < 5;

                        if (isNewSession) {
                            var matchFile = params.url && params.url.match(/\/stream\/([^?]+)/);
                            var matchLink = params.url && params.url.match(/[?&]link=([^&]+)/);
                            var matchIndex = params.url && params.url.match(/[?&]index=(\d+)/);

                            if (matchFile && matchLink) {
                                updateContinueWatchParams(hash, {
                                    file_name: decodeURIComponent(matchFile[1]),
                                    torrent_link: matchLink[1],
                                    file_index: matchIndex ? parseInt(matchIndex[1]) : 0,
                                    title: movie.original_name || movie.original_title || movie.title,
                                    season: params.season,
                                    episode: params.episode,
                                    episode_title: params.title || params.episode_title
                                });
                            }
                        }
                    }
                }
            }
            return originalPlay.call(this, params);
        };
    }

    // ========================================================================
    // 6. UI: КНОПКА
    // ========================================================================

    function handleContinueClick(movieData, buttonElement) {
        if (TIMERS.debounce_click) return;
        var params = getStreamParams(movieData);
        if (!params) { Lampa.Noty.show('Нет истории'); return; }

        if (buttonElement) $(buttonElement).css('opacity', 0.5);
        TIMERS.debounce_click = setTimeout(function () {
            TIMERS.debounce_click = null;
            if (buttonElement) $(buttonElement).css('opacity', 1);
        }, 1000);

        launchPlayer(movieData, params);
    }

    function setupContinueButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                requestAnimationFrame(function () {
                    var activity = e.object.activity;
                    var render = activity.render();
                    if (render.find('.button--continue-watch').length) return;

                    var params = getStreamParams(e.data.movie);
                    if (!params) return;

                    if (params.torrent_link && !FILES_CACHE[params.torrent_link]) {
                        Lampa.Torserver.files(params.torrent_link, function (json) {
                            if (json && json.file_stats) FILES_CACHE[params.torrent_link] = json.file_stats;
                        });
                    }

                    var percent = 0;
                    var timeStr = "";
                    var hash = generateHash(e.data.movie, params.season, params.episode);
                    var view = Lampa.Timeline.view(hash);

                    if (view && view.percent > 0) { percent = view.percent; timeStr = formatTime(view.time); }
                    else if (params.time) { percent = params.percent || 0; timeStr = formatTime(params.time); }

                    var labelText = 'Продолжить';
                    if (params.season && params.episode) labelText += ' S' + params.season + ' E' + params.episode;
                    if (timeStr) labelText += ' <span style="opacity:0.7;font-size:0.9em">(' + timeStr + ')</span>';

                    var dashArray = (percent * 65.97 / 100).toFixed(2);
                    var continueButtonHtml = `
                        <div class="full-start__button selector button--continue-watch" style="margin-top: 0.5em;">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" style="margin-right: 0.5em">
                                <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
                                <circle cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="1.5" fill="none" 
                                    stroke-dasharray="${dashArray} 65.97" transform="rotate(-90 12 12)" style="opacity: 0.5"/>
                            </svg>
                            <div>${labelText}</div>
                        </div>
                    `;

                    var continueBtn = $(continueButtonHtml);
                    continueBtn.on('hover:enter', function () { handleContinueClick(e.data.movie, this); });

                    var torrentBtn = render.find('.view--torrent').last();
                    var buttonsContainer = render.find('.full-start-new__buttons, .full-start__buttons').first();

                    if (torrentBtn.length) torrentBtn.after(continueBtn);
                    else if (buttonsContainer.length) buttonsContainer.append(continueBtn);
                    else render.find('.full-start__button').last().after(continueBtn);
                });
            }
        });
    }

    // ========================================================================
    // ПРОФИЛИ: слушатель смены профиля + миграция
    // ========================================================================

    function setupProfileListener() {
        Lampa.Listener.follow('profile_select', function () {
            MEMORY_CACHE = null;
            TORRSERVER_CACHE = null;
            FILES_CACHE = {};

            // ключ мог поменяться -> регистрируем sync на новый ключ
            ensureStorageSync();
            migrateOldData();

            console.log('[ContinueWatch] Profile changed, caches cleared');
        });
    }

    function migrateOldData() {
        try {
            // мигрируем только когда реально есть профили и sync включен
            if (!(ACCOUNT_READY && Lampa.Account && Lampa.Account.Permit && Lampa.Account.Permit.sync)) return;

            // миграция один раз, чтобы не копировать общий ключ в каждый профиль
            if (Lampa.Storage.get(MIGRATION_FLAG_KEY, false)) return;

            var oldKey = 'continue_watch_params';
            var oldData = Lampa.Storage.get(oldKey, {});
            var newKey = getActiveStorageKey();
            var newData = Lampa.Storage.get(newKey, {});

            if (Object.keys(oldData).length > 0 && Object.keys(newData).length === 0) {
                Lampa.Storage.set(newKey, oldData);
                Lampa.Storage.set(MIGRATION_FLAG_KEY, true);
                console.log('[ContinueWatch] Migrated old data to profile key:', newKey);
            } else {
                // даже если мигрировать нечего — ставим флаг, чтобы не гонять это каждый раз
                if (Object.keys(oldData).length === 0) Lampa.Storage.set(MIGRATION_FLAG_KEY, true);
            }
        } catch (e) { }
    }

    // ========================================================================
    // INIT
    // ========================================================================

    function add() {
        ensureStorageSync();
        patchPlayer();
        cleanupOldParams();
        setupContinueButton();
        setupTimelineSaving();
        setupProfileListener();
        migrateOldData();
        console.log("[ContinueWatch] v71 Loaded. Sync Fix Applied. Profile support enabled.");
    }

    // готовность приложения (страховка)
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            ACCOUNT_READY = true;
            ensureStorageSync();
            migrateOldData();
        }
    });

    if (window.appready) add();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') add(); });
})();
