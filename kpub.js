(function () {
  'use strict';

  if (window.__dso_kinopub_loaded) {
    return;
  }
  window.__dso_kinopub_loaded = true;

  var PLUGIN_NAME = "DSO KinoPub";
  var PLUGIN_VERSION = "1.4.0";
  var DEFAULT_PROXY = "";
  var SOURCE_ID = "kinopub";
  var SOURCE_TITLE = "KinoPub";
  var genresCache = {};
  var trackedRequests = [];
  var deviceUid = Lampa.Storage.get("dso_kinopub_uid", "");
  if (!deviceUid) {
    deviceUid = Lampa.Utils.uid(16);
    Lampa.Storage.set("dso_kinopub_uid", deviceUid);
  }
  var proxyUrl = Lampa.Storage.get("dso_kinopub_proxy", DEFAULT_PROXY);
  if (proxyUrl && proxyUrl.charAt(proxyUrl.length - 1) !== "/") {
    proxyUrl += "/";
  }
  var API_BASE_URL = "https://api.srvkp.com";
  var OAUTH_CLIENT_ID = "xbmc";
  var OAUTH_CLIENT_SECRET = "cgg3gtifu46urtfp2zp1nqtba0k2ezxh";

  function getAccessToken() {
    return Lampa.Storage.get("dso_kinopub_token", "");
  }
  function getRefreshToken() {
    return Lampa.Storage.get("dso_kinopub_refresh", "");
  }

  function buildApiUrl(path) {
    var absoluteUrl = API_BASE_URL + (path.charAt(0) === "/" ? path : "/" + path);
    return proxyUrl + absoluteUrl;
  }
  function normalizeUrl(url) {
    if (!url) {
      return "";
    }
    url = String(url).trim();
    if (!url) {
      return "";
    }
    if (url.indexOf("//") === 0) {
      url = "https:" + url;
    } else if (url.indexOf("http://") === 0) {
      url = "https://" + url.substring(7);
    }
    if (Lampa.Utils && typeof Lampa.Utils.rewriteIfHTTPS === "function") {
      url = Lampa.Utils.rewriteIfHTTPS(url);
    }
    return url;
  }
  function proxyImageUrl(imageUrl) {
    imageUrl = normalizeUrl(imageUrl);
    if (!imageUrl) {
      return "";
    }
    var PROXIED_HOSTS = ["gravatar", "kino.pub", "srvkp", "staticpop", "service-kp"];
    var needsProxy = false;
    for (var hostIndex = 0; hostIndex < PROXIED_HOSTS.length; hostIndex++) {
      if (imageUrl.indexOf(PROXIED_HOSTS[hostIndex]) > -1) {
        needsProxy = true;
        break;
      }
    }
    if (needsProxy && proxyUrl) {
      return proxyUrl + imageUrl;
    }
    return imageUrl;
  }
  function hasPlayableContent(itemResponse) {
    var item = itemResponse && itemResponse.item;
    if (!item) {
      return false;
    }
    if (item.videos && item.videos.length) {
      return true;
    }
    if (item.seasons && item.seasons.length) {
      return true;
    }
    return false;
  }
  function extractNumber(value) {
    return parseInt(("" + (value || "")).replace(/\D/g, ""), 10) || 0;
  }

  function formatCardQuality(rawQuality) {
    if (typeof rawQuality === "string" && !/^\d+$/.test(rawQuality.replace(/\s/g, ""))) {
      return rawQuality;
    }
    var numericQuality = parseInt(rawQuality, 10) || 0;
    if (!numericQuality) {
      return "";
    }
    if (numericQuality >= 2160) {
      return "4K";
    }
    return numericQuality + "p";
  }

  function findInArray(list, predicate) {
    if (!list || !list.length) {
      return undefined;
    }
    for (var i = 0; i < list.length; i++) {
      if (predicate(list[i], i, list)) {
        return list[i];
      }
    }
    return undefined;
  }
  function daysUntil(endTime) {
    if (endTime == null || endTime === "") {
      return null;
    }
    var timestampMs = typeof endTime === "number" ? endTime > 9999999999 ? endTime : endTime * 1000 : Date.parse(endTime);
    if (isNaN(timestampMs)) {
      return null;
    }
    return Math.max(0, Math.ceil((timestampMs - Date.now()) / 86400000));
  }

  function parseUserProfile(statusResponse) {
    if (!statusResponse || typeof statusResponse !== "object") {
      return null;
    }
    var user = statusResponse.user || statusResponse;
    if (!user || typeof user !== "object") {
      return null;
    }
    var login = user.username || user.login || "";
    var profileData = user.profile || {};
    var displayName = profileData.name || login;
    if (!login && !displayName) {
      return null;
    }
    var subscription = user.subscription || {};
    var subscriptionDays = subscription.days != null ? Math.ceil(parseFloat(subscription.days)) : daysUntil(subscription.end_time);
    var subscriptionEndDate = subscription.end_time ? new Date(subscription.end_time > 9999999999 ? subscription.end_time : subscription.end_time * 1000).toLocaleDateString() : "";
    return {
      login: login,
      name: displayName,
      photo: proxyImageUrl(profileData.avatar || ""),
      is_pro: !!subscription.active,
      is_pro_plus: false,
      pro_date: subscriptionEndDate,
      pro_days: subscriptionDays,
      quality: 2160,
      videoserver: "",
      email: "",
      id: user.id || ""
    };
  }
  function resetMaxQuality() {
    window.dso_kinopub.max_qualitie = 2160;
  }
  function getSubscriptionBadge(profile) {
    if (!profile) {
      return Lampa.Lang.translate("dso_kinopub_sub_free");
    }
    if (profile.is_pro) {
      return "PRO";
    }
    return Lampa.Lang.translate("dso_kinopub_sub_free");
  }
  function renderProfileCard() {
    var container = $("[data-name=\"dso_kinopub_profile\"]");
    if (!container.length) {
      return;
    }
    var profile = parseUserProfile(Lampa.Storage.get("dso_kinopub_status", {}));
    var html = "";
    if (!profile) {
      html = "<div class=\"dso-kinopub-profile dso-kinopub-profile--empty\">" + Lampa.Lang.translate("dso_kinopub_nodevice") + "</div>";
    } else {
      var metaLines = [];
      var badge = getSubscriptionBadge(profile);
      metaLines.push("<div class=\"dso-kinopub-profile__badge\">" + badge + "</div>");
      if (profile.is_pro && profile.pro_days != null) {
        metaLines.push(Lampa.Lang.translate("dso_kinopub_sub_days") + ": <b>" + profile.pro_days + "</b>");
      }
      if (profile.is_pro && profile.pro_date) {
        metaLines.push(Lampa.Lang.translate("dso_kinopub_pro_until") + " " + profile.pro_date);
      }
      metaLines.push(Lampa.Lang.translate("dso_kinopub_max_quality") + ": <b>" + profile.quality + "p</b>");
      var initialLetter = (profile.name || profile.login).charAt(0).toUpperCase();
      var avatarHtml = profile.photo ? "<img src=\"" + profile.photo + "\" alt=\"\">" : "<div class=\"dso-kinopub-profile__placeholder\">" + initialLetter + "</div>";
      html = "<div class=\"dso-kinopub-profile\"><div class=\"dso-kinopub-profile__wrap\"><div class=\"dso-kinopub-profile__avatar\">" + avatarHtml + "</div><div class=\"dso-kinopub-profile__body\"><div class=\"dso-kinopub-profile__title\">" + (profile.name || profile.login) + "</div>" + (profile.login && profile.login !== profile.name ? "<div class=\"dso-kinopub-profile__login\">@" + profile.login + "</div>" : "") + "<div class=\"dso-kinopub-profile__meta\">" + metaLines.join("<br>") + "</div></div></div></div>";
    }
    container.html(html);
    container.find("img").on("error", function () {
      var fallbackLetter = container.find(".dso-kinopub-profile__title").text().charAt(0).toUpperCase() || "?";
      $(this).replaceWith("<div class=\"dso-kinopub-profile__placeholder\">" + fallbackLetter + "</div>");
    });
  }

  function fetchUserStatus(accessToken, onSuccess, onError) {
    var request = new Lampa.Reguest();
    var url = buildApiUrl("/v1/user?access_token=" + encodeURIComponent(accessToken));
    request.timeout(8000);
    request.silent(url, function (response) {
      if (response && response.user) {
        resetMaxQuality();
        Lampa.Storage.set("dso_kinopub_status", response);
        var profile = parseUserProfile(response);
        if (onSuccess) {
          onSuccess(profile, response.user);
        }
      } else {
        Lampa.Storage.set("dso_kinopub_status", {});
        window.dso_kinopub.max_qualitie = 2160;
        window.dso_kinopub.is_max_qualitie = false;
        if (onSuccess) {
          onSuccess(null);
        }
      }
      renderProfileCard();
    }, function (error, status) {
      if (onError) {
        onError(error, status);
      } else {
        Lampa.Noty.show(request.errorDecode(error, status));
      }
    });
  }
  function refreshAccessToken(callback) {
    var refreshToken = getRefreshToken();
    if (!refreshToken) {
      if (callback) {
        callback(false);
      }
      return;
    }
    var request = trackRequest(new Lampa.Reguest());
    var url = buildApiUrl("/oauth2/token?grant_type=refresh_token&client_id=" + OAUTH_CLIENT_ID + "&client_secret=" + OAUTH_CLIENT_SECRET + "&refresh_token=" + encodeURIComponent(refreshToken));
    request.timeout(10000);
    request.silent(url, function (response) {
      if (response && response.access_token) {
        Lampa.Storage.set("dso_kinopub_token", response.access_token);
        if (response.refresh_token) {
          Lampa.Storage.set("dso_kinopub_refresh", response.refresh_token);
        }
        if (callback) {
          callback(true);
        }
      } else if (callback) {
        callback(false);
      }
    }, function () {
      if (callback) {
        callback(false);
      }
    });
  }
  function notifyDevice(accessToken) {
    if (!accessToken) {
      return;
    }
    apiPost("/v1/device/notify", {
      title: "Lampa",
      software: "DSO KinoPub " + PLUGIN_VERSION,
      hardware: deviceUid || "device"
    }, function () {}, function () {});
  }

  function isSeriesType(contentType) {
    return contentType === "serial" || contentType === "docuserial" || contentType === "tvshow";
  }
  function splitTitle(rawTitle) {
    if (!rawTitle) {
      return {
        ru: "",
        orig: ""
      };
    }
    var titleParts = String(rawTitle).split(" / ");
    if (titleParts.length >= 2) {
      return {
        ru: titleParts[0].trim(),
        orig: titleParts.slice(1).join(" / ").trim()
      };
    }
    var sameTitle = {
      ru: rawTitle,
      orig: rawTitle
    };
    return sameTitle;
  }
  function normalizeGenres(genres) {
    if (!genres || !genres.length) {
      return [];
    }
    return genres.map(function (genre) {
      if (!genre) {
        return null;
      }
      if (typeof genre === "string") {
        return {
          id: 0,
          name: genre
        };
      }
      var normalizedGenre = {
        id: genre.id || 0,
        name: genre.name || genre.title || ""
      };
      return normalizedGenre;
    }).filter(function (genreEntry) {
      return genreEntry && genreEntry.name;
    });
  }
  function normalizeCountries(countries) {
    if (!countries || !countries.length) {
      return [];
    }
    return countries.map(function (country) {
      if (!country) {
        return null;
      }
      if (typeof country === "string") {
        return {
          iso_3166_1: "",
          name: country
        };
      }
      var normalizedCountry = {
        iso_3166_1: country.iso_3166_1 || country.code || "",
        name: country.name || country.title || ""
      };
      return normalizedCountry;
    }).filter(function (countryEntry) {
      return countryEntry && countryEntry.name;
    });
  }
  function convertItemToCard(item, includeBackdrop) {
    if (!item) {
      return null;
    }
    var titleParts = splitTitle(item.title);
    var isSeries = isSeriesType(item.type);
    var posterUrl = "";
    if (item.posters) {
      posterUrl = proxyImageUrl(item.posters.big || item.posters.medium || item.posters.small || "");
    }

    var backdropUrl = "";
    if (includeBackdrop && item.posters && item.posters.wide) {
      backdropUrl = proxyImageUrl(item.posters.wide);
    }
    var yearString = item.year ? String(item.year) : "";
    var releaseDate = yearString ? yearString + "-01-01" : "";
    var rating = parseFloat(item.kinopoisk_rating || item.imdb_rating || item.rating) || 0;
    var imdbRaw = item.imdb;
    var imdbId = "";
    var duration = item.duration || {};
    var runtimeMinutes = parseInt(duration.average || duration.total || item.runtime || 0, 10) || 0;
    if (imdbRaw) {
      imdbId = ("" + imdbRaw).indexOf("tt") === 0 ? "" + imdbRaw : "tt" + imdbRaw;
    }
    var card = {
      id: item.id + 9000000000,
      kinopub_id: item.id,
      kinopub_type: item.type || "",
      source: SOURCE_ID,
      title: titleParts.ru || titleParts.orig || item.title || "",
      original_title: titleParts.orig || titleParts.ru || item.title || "",
      overview: item.plot || "",
      img: posterUrl,
      poster: posterUrl,
      background_image: backdropUrl,
      vote_average: rating,
      kinopoisk_id: item.kinopoisk || 0,
      imdb_id: imdbId,
      quality: formatCardQuality(item.quality),
      runtime: runtimeMinutes,
      budget: 0,
      genres: normalizeGenres(item.genres),
      production_countries: normalizeCountries(item.countries),
      production_companies: []
    };
    if (isSeries) {
      card.name = card.title;
      card.original_name = card.original_title;
      card.first_air_date = releaseDate;
      card.method = "tv";
    } else {
      card.release_date = releaseDate;
      card.method = "movie";
    }
    if (item.seasons && item.seasons.length) {
      card.number_of_seasons = item.seasons.length;

      var totalEpisodes = 0;
      var haveEpisodeData = false;
      for (var seasonIndex = 0; seasonIndex < item.seasons.length; seasonIndex++) {
        var seasonEpisodes = item.seasons[seasonIndex] && item.seasons[seasonIndex].episodes;
        if (seasonEpisodes && seasonEpisodes.length) {
          totalEpisodes += seasonEpisodes.length;
          haveEpisodeData = true;
        }
      }
      if (!haveEpisodeData) {
        var aggregateEpisodes = parseInt(item.episodes_total || item.total_episodes || 0, 10) || 0;
        if (aggregateEpisodes > 0) {
          totalEpisodes = aggregateEpisodes;
          haveEpisodeData = true;
        }
      }
      if (haveEpisodeData && totalEpisodes > 0) {
        card.number_of_episodes = totalEpisodes;
      }
    }

    var ageRestriction = item.age || item.ac || item.restrict || item.rating_mpaa;
    var ageNumber = parseInt(("" + (ageRestriction || "")).replace(/\D/g, ""), 10) || 0;
    if (ageNumber > 0) {
      card.restrict = ageNumber;
    }
    if (item.cast) {
      card.kinopub_cast = item.cast;
    }
    if (item.director) {
      card.kinopub_director = item.director;
    }
    return card;
  }
  function convertItemsToCards(items) {
    if (!items || !items.length) {
      return [];
    }
    return items.map(convertItemToCard).filter(Boolean);
  }
  function normalizePagination(pagination) {
    pagination = pagination || {};
    var currentPage = parseInt(pagination.current, 10) || 1;
    var perPage = parseInt(pagination.perpage, 10) || 20;
    var totalRaw = parseInt(pagination.total, 10) || 1;
    var totalPages = totalRaw;
    if (perPage > 1 && totalRaw > currentPage && totalRaw > 100) {
      totalPages = Math.max(1, Math.ceil(totalRaw / perPage));
    }
    return {
      page: currentPage,
      total_pages: Math.max(1, totalPages),
      total_results: totalRaw * (perPage > 1 && totalRaw <= 100 ? perPage : 1)
    };
  }

  function trackRequest(request) {
    trackedRequests.push(request);

    if (trackedRequests.length > 60) {
      trackedRequests.splice(0, trackedRequests.length - 60);
    }
    return request;
  }
  function clearTrackedRequests() {
    trackedRequests.forEach(function (trackedRequest) {
      try {
        trackedRequest.clear();
      } catch (clearError) {}
    });
    trackedRequests = [];
  }
  function apiGet(path, onSuccess, onError, isRetry) {
    var token = getAccessToken();
    if (!token) {
      if (onError) {
        onError("no_token");
      }
      return;
    }
    var separator = path.indexOf("?") >= 0 ? "&" : "?";
    var url = buildApiUrl(path + separator + "access_token=" + encodeURIComponent(token));
    var request = trackRequest(new Lampa.Reguest());
    request.timeout(15000);
    request.silent(url, function (response) {
      if (response && (response.error === "invalid_token" || response.status === 401 || response.error === "unauthorized")) {
        if (!isRetry) {
          refreshAccessToken(function (didRefresh) {
            if (didRefresh) {
              apiGet(path, onSuccess, onError, true);
            } else if (onError) {
              onError(response);
            }
          });
          return;
        }
      }
      if (onSuccess) {
        onSuccess(response);
      }
    }, function (error, status) {
      if (!isRetry) {
        refreshAccessToken(function (didRefreshOnError) {
          if (didRefreshOnError) {
            apiGet(path, onSuccess, onError, true);
          } else if (onError) {
            onError(error, status);
          }
        });
        return;
      }
      if (onError) {
        onError(error, status);
      }
    });
  }
  function emptyResult(title) {
    return {
      title: title || Lampa.Lang.translate("dso_kinopub_nodevice"),
      results: [],
      source: SOURCE_ID,
      page: 1,
      total_pages: 1
    };
  }
  function buildCardsResult(response, title, listUrl) {
    var items = extractItems(response);
    var pagination = normalizePagination(response && response.pagination);
    var result = {
      title: title || "",
      results: convertItemsToCards(items),
      page: pagination.page,
      total_pages: pagination.total_pages,
      total_results: pagination.total_results,
      source: SOURCE_ID,
      url: listUrl || ""
    };
    if (typeof Lampa.Utils.addSource === "function") {
      return Lampa.Utils.addSource(result, SOURCE_ID);
    }
    result.results.forEach(function (card) {
      if (!card.source) {
        card.source = SOURCE_ID;
      }
    });
    return result;
  }
  function queueCardsLine(lineLoaders, path, title, listUrl) {
    lineLoaders.push(function (lineCallback) {
      loadCardsLine(path, title, listUrl, 1, lineCallback);
    });
  }
  function translateOr(langKey, fallback) {
    var translated = Lampa.Lang.translate(langKey);
    if (!translated || translated === langKey) {
      return fallback;
    }
    return translated;
  }
  var suppressFavoriteSync = false;
  var favoritesSyncActive = false;
  var lastSettingsUserFetch = 0;
  var BOOKMARK_FOLDER_TITLE = "Lampa";
  function extractItems(response) {
    if (!response) {
      return [];
    }
    if (Array.isArray(response.items)) {
      return response.items;
    }
    if (Array.isArray(response.history)) {
      return response.history.map(function (historyEntry) {
        return historyEntry && (historyEntry.item || historyEntry);
      }).filter(Boolean);
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (response.items && typeof response.items === "object") {
      var collected = [];
      Object.keys(response.items).forEach(function (groupKey) {
        var group = response.items[groupKey];
        if (group && Array.isArray(group.items)) {
          collected = collected.concat(group.items);
        } else if (Array.isArray(group)) {
          collected = collected.concat(group);
        }
      });
      return collected;
    }
    return [];
  }
  function apiPost(path, data, onSuccess, onError) {
    var token = getAccessToken();
    if (!token) {
      if (onError) {
        onError("no_token");
      }
      return;
    }
    var separator = path.indexOf("?") >= 0 ? "&" : "?";
    var url = buildApiUrl(path + separator + "access_token=" + encodeURIComponent(token));
    var postData = data || {};
    $.ajax({
      url: url,
      type: "POST",
      data: postData,
      dataType: "json",
      timeout: 15000,
      success: function (response) {
        if (onSuccess) {
          onSuccess(response);
        }
      },
      error: function (xhr, status) {
        if (onError) {
          onError(xhr, status);
        }
      }
    });
  }

  function isKinopubCard(card) {
    if (!card) {
      return false;
    }
    return card.source === SOURCE_ID || card.source === "kinopub" || !!card.kinopub_id;
  }
  function getKinopubId(card) {
    if (!card) {
      return 0;
    }
    return card.kinopub_id || (card.source === SOURCE_ID || card.source === "kinopub" ? card.id : 0);
  }
  function addToLampaFavorites(category, card, historyLimit) {
    if (!Lampa.Favorite || !card || !card.id) {
      return;
    }
    var existingMarks = Lampa.Favorite.check(card) || {};
    if (existingMarks[category]) {
      return;
    }
    suppressFavoriteSync = true;
    try {
      if (category === "history") {
        Lampa.Favorite.add(category, card, historyLimit || 100);
      } else {
        Lampa.Favorite.add(category, card);
      }
    } catch (addError) {}
    setTimeout(function () {
      suppressFavoriteSync = false;
    }, 50);
  }
  function getSavedBookmarkFolderId() {
    return parseInt(Lampa.Storage.get("dso_kinopub_bookmark_folder", 0), 10) || 0;
  }
  function saveBookmarkFolderId(folderId) {
    Lampa.Storage.set("dso_kinopub_bookmark_folder", folderId || 0);
  }
  function ensureBookmarkFolder(callback) {
    var savedFolderId = getSavedBookmarkFolderId();
    if (savedFolderId) {
      callback(savedFolderId);
      return;
    }
    apiGet("/v1/bookmarks", function (response) {
      var folders = extractItems(response);
      var existingFolder = null;
      (folders || []).forEach(function (folder) {
        if (folder && folder.title === BOOKMARK_FOLDER_TITLE) {
          existingFolder = folder;
        }
      });
      if (existingFolder && existingFolder.id) {
        saveBookmarkFolderId(existingFolder.id);
        callback(existingFolder.id);
        return;
      }
      var createPayload = {
        title: BOOKMARK_FOLDER_TITLE
      };
      apiPost("/v1/bookmarks/create", createPayload, function (createResponse) {
        var createdFolder = createResponse && createResponse.folder || createResponse;
        var newFolderId = createdFolder && createdFolder.id;
        if (newFolderId) {
          saveBookmarkFolderId(newFolderId);
        }
        callback(newFolderId || 0);
      }, function () {
        callback(0);
      });
    }, function () {
      callback(0);
    });
  }
  function syncBookmarkToKinopub(card, remove) {
    var itemId = getKinopubId(card);
    if (!itemId || !getAccessToken()) {
      return;
    }
    ensureBookmarkFolder(function (folderId) {
      if (!folderId) {
        return;
      }
      var endpoint = remove ? "/v1/bookmarks/remove-item" : "/v1/bookmarks/add";
      var payload = remove ? {
        item: itemId
      } : {
        item: itemId,
        folder: folderId
      };
      apiPost(endpoint, payload, function () {}, function () {});
    });
  }
  function toggleKinopubWatchlist(card) {
    var itemId = getKinopubId(card);
    if (!itemId || !getAccessToken()) {
      return;
    }
    apiGet("/v1/watching/togglewatchlist?id=" + encodeURIComponent(itemId), function () {}, function () {});
  }
  function addItemsToFavorites(items, category, historyLimit) {
    (items || []).forEach(function (item) {
      var card = convertItemToCard(item);
      if (card) {
        addToLampaFavorites(category, card, historyLimit);
      }
    });
  }
  function syncFavoritesFromKinopub(callback) {
    if (!getAccessToken() || !Lampa.Favorite || favoritesSyncActive) {
      if (callback) {
        callback(false);
      }
      return;
    }
    favoritesSyncActive = true;
    var pendingParts = 3;
    function onPartDone() {
      pendingParts--;
      if (pendingParts > 0) {
        return;
      }
      favoritesSyncActive = false;
      Lampa.Storage.set("dso_kinopub_favorites_synced", Date.now());
      if (callback) {
        callback(true);
      }
    }
    apiGet("/v1/bookmarks", function (bookmarksResponse) {
      var folders = extractItems(bookmarksResponse);
      if (!folders.length) {
        onPartDone();
        return;
      }
      var pendingFolders = folders.length;
      folders.forEach(function (folder) {
        if (!folder || !folder.id) {
          pendingFolders--;
          if (!pendingFolders) {
            onPartDone();
          }
          return;
        }
        apiGet("/v1/bookmarks/" + folder.id, function (folderItems) {
          addItemsToFavorites(extractItems(folderItems), "book");
          pendingFolders--;
          if (!pendingFolders) {
            onPartDone();
          }
        }, function () {
          pendingFolders--;
          if (!pendingFolders) {
            onPartDone();
          }
        });
      });
    }, onPartDone);
    apiGet("/v1/watching/movies", function (moviesResponse) {
      addItemsToFavorites(extractItems(moviesResponse), "wath");
      onPartDone();
    }, onPartDone);
    apiGet("/v1/watching/serials?subscribed=0", function (serialsResponse) {
      addItemsToFavorites(extractItems(serialsResponse), "wath");
      onPartDone();
    }, onPartDone);
  }
  function maybeSyncFavorites(force) {
    if (!getAccessToken()) {
      return;
    }
    var lastSyncedAt = parseInt(Lampa.Storage.get("dso_kinopub_favorites_synced", 0), 10) || 0;
    if (!force && lastSyncedAt && Date.now() - lastSyncedAt < 900000) {
      return;
    }
    syncFavoritesFromKinopub();
  }

  function scheduleFavoritesSync(force) {
    setTimeout(function () {
      maybeSyncFavorites(force);
    }, 5000);
  }
  function bindFavoriteListeners() {
    if (!Lampa.Favorite || !Lampa.Favorite.listener || window.__dso_kinopub_fav_bound) {
      return;
    }
    window.__dso_kinopub_fav_bound = true;
    Lampa.Favorite.listener.follow("add,added", function (addEvent) {
      if (suppressFavoriteSync || !addEvent || !isKinopubCard(addEvent.card)) {
        return;
      }
      if (addEvent.where === "book") {
        syncBookmarkToKinopub(addEvent.card, false);
      }
      if (addEvent.where === "wath") {
        toggleKinopubWatchlist(addEvent.card);
      }
    });
    Lampa.Favorite.listener.follow("remove", function (removeEvent) {
      if (suppressFavoriteSync || !removeEvent || !isKinopubCard(removeEvent.card)) {
        return;
      }
      if (removeEvent.where === "book") {
        syncBookmarkToKinopub(removeEvent.card, true);
      }
      if (removeEvent.where === "wath") {
        toggleKinopubWatchlist(removeEvent.card);
      }
    });
  }

  function prependContinueWatchingLines(lineLoaders, done) {
    if (!Lampa.Favorite || typeof Lampa.Favorite.get !== "function") {
      done();
      return;
    }
    var rawHistory;
    try {
      rawHistory = Lampa.Favorite.get("history");
    } catch (favoriteError) {
      rawHistory = null;
    }
    if (!rawHistory || typeof rawHistory.filter !== "function") {
      done();
      return;
    }
    var localHistory = rawHistory.filter(function (favoriteCard) {
      return isKinopubCard(favoriteCard) && favoriteCard && (favoriteCard.title || favoriteCard.name);
    });
    if (!localHistory.length) {
      done();
      return;
    }
    var continueItems = [];
    var pureHistory = [];
    localHistory.forEach(function (favoriteCard) {
      var hasContinue = false;
      if (Lampa.Timeline && typeof Lampa.Timeline.view === "function") {
        var hashSource = favoriteCard.original_name || favoriteCard.name || favoriteCard.original_title || favoriteCard.title || "";
        try {
          var timelineInfo = Lampa.Timeline.view(Lampa.Utils.hash(hashSource));
          if (timelineInfo && timelineInfo.percent > 0 && timelineInfo.percent < 100) {
            hasContinue = true;
          }
        } catch (timelineError) {}
      }
      if (hasContinue) {
        continueItems.push(favoriteCard);
      } else {
        pureHistory.push(favoriteCard);
      }
    });
    if (pureHistory.length) {
      lineLoaders.unshift(function (historyLineCallback) {
        historyLineCallback({
          title: translateOr("title_history", "История"),
          results: pureHistory.slice(0, 25),
          source: SOURCE_ID,
          url: "history",
          page: 1,
          total_pages: 1
        });
      });
    }
    if (continueItems.length) {
      lineLoaders.unshift(function (continueLineCallback) {
        continueLineCallback({
          title: translateOr("dso_kinopub_continue", "Продолжить просмотр"),
          results: continueItems.slice(0, 25),
          source: SOURCE_ID,
          url: "history?continue=1",
          page: 1,
          total_pages: 1
        });
      });
    }
    done();
  }
  function appendBookmarkLines(lineLoaders, done) {
    if (!getAccessToken()) {
      done();
      return;
    }
    apiGet("/v1/bookmarks", function (response) {
      var folders = extractItems(response).slice(0, 6);
      if (!folders.length) {
        done();
        return;
      }
      var pendingFolders = folders.length;
      folders.forEach(function (folder) {
        if (!folder || !folder.id) {
          pendingFolders--;
          if (!pendingFolders) {
            done();
          }
          return;
        }
        lineLoaders.push(function (lineCallback) {
          loadCardsLine("/v1/bookmarks/" + folder.id, translateOr("title_bookmarks", "Закладки") + " — " + (folder.title || ""), "bookmarks?folder=" + folder.id, 1, lineCallback);
        });
        pendingFolders--;
        if (!pendingFolders) {
          done();
        }
      });
    }, done);
  }
  function appendCollectionLines(lineLoaders, done) {
    if (!getAccessToken()) {
      done();
      return;
    }
    apiGet("/v1/collections?sort=updated-&perpage=8", function (response) {
      var collections = extractItems(response).slice(0, 8);
      if (!collections.length) {
        done();
        return;
      }
      collections.forEach(function (collection) {
        if (!collection || !collection.id) {
          return;
        }
        lineLoaders.push(function (lineCallback) {
          loadCardsLine("/v1/collections/view?id=" + encodeURIComponent(collection.id), translateOr("title_collections", "Подборки") + " — " + (collection.title || ""), "collection?id=" + collection.id, 1, lineCallback);
        });
      });
      done();
    }, done);
  }
  function loadCardsLine(path, title, listUrl, page, callback) {
    var separator = path.indexOf("?") >= 0 ? "&" : "?";
    var pagedPath = path + separator + "page=" + (page || 1);
    apiGet(pagedPath, function (response) {
      callback(buildCardsResult(response, title, listUrl));
    }, function () {
      callback({
        title: title || "",
        results: [],
        source: SOURCE_ID,
        url: listUrl || "",
        page: 1,
        total_pages: 1
      });
    });
  }

  function lampaTypeToKinopubType(lampaType) {
    if (lampaType === "tv" || lampaType === "anime") {
      return "serial";
    }
    return "movie";
  }
  var genreIdCache = {};
  function normalizeForCompare(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е");
  }
  function isAnimationGenre(genreId) {
    return genreId == 16 || genreId === "16";
  }
  function findGenreIdByKeywords(keywords, genreType, callback) {
    var cacheKey = (genreType || "movie") + ":" + keywords.join("|");
    if (Object.prototype.hasOwnProperty.call(genreIdCache, cacheKey)) {
      callback(genreIdCache[cacheKey]);
      return;
    }
    fetchGenres(genreType || "movie", function (genres) {
      var normalizedKeywords = (keywords || []).map(normalizeForCompare).filter(Boolean);
      var bestGenreId = 0;
      var bestScore = 0;
      (genres || []).forEach(function (genre) {
        if (!genre || !genre.id) {
          return;
        }
        var genreName = normalizeForCompare(genre.title || genre.name);
        if (!genreName) {
          return;
        }
        normalizedKeywords.forEach(function (keyword) {
          if (genreName.indexOf(keyword) === -1) {
            return;
          }
          var score = keyword.length;
          if (genreName === keyword) {
            score += 100;
          }
          if (score > bestScore) {
            bestScore = score;
            bestGenreId = genre.id;
          }
        });
      });
      genreIdCache[cacheKey] = bestGenreId;
      callback(bestGenreId);
    });
  }
  function resolveCatalogMode(params, callback) {
    params = params || {};
    var urlOrAction = String(params.url || params.action || "");
    var genresParam = params.genres;
    var isAnimation = isAnimationGenre(genresParam);
    var mode = "movie";
    var contentTypes = ["movie"];
    if (urlOrAction === "anime" || params.kinopub_mode === "anime") {
      mode = "anime";
      contentTypes = ["movie", "serial"];
    } else if (isAnimation || params.kinopub_mode === "cartoon" || urlOrAction === "cartoon") {
      mode = "cartoon";
      contentTypes = ["movie", "serial"];
    } else if (urlOrAction === "tv") {
      mode = "tv";
      contentTypes = ["serial", "tvshow"];
    } else if (urlOrAction === "movie") {
      mode = "movie";
      contentTypes = ["movie"];
    }
    if (mode === "cartoon") {
      findGenreIdByKeywords(["мультфильм", "мульт", "анимация", "animation"], "movie", function (cartoonGenreId) {
        var cartoonMode = {
          mode: mode,
          types: contentTypes,
          genreId: cartoonGenreId || 0,
          catalogGenre: ""
        };
        callback(cartoonMode);
      });
      return;
    }
    if (mode === "anime") {
      findGenreIdByKeywords(["аниме", "anime"], "movie", function (animeGenreId) {
        var animeMode = {
          mode: mode,
          types: contentTypes,
          genreId: animeGenreId || 0,
          catalogGenre: ""
        };
        callback(animeMode);
      });
      return;
    }
    var catalogGenre = "";
    if (genresParam && !isAnimation) {
      catalogGenre = String(genresParam);
    }
    var resolvedMode = {
      mode: mode,
      types: contentTypes,
      genreId: catalogGenre ? catalogGenre : 0,
      catalogGenre: catalogGenre
    };
    callback(resolvedMode);
  }
  function addStandardCatalogLines(lineLoaders, contentType, genreId, titlePrefix) {
    var genreQuery = genreId ? "&genre=" + encodeURIComponent(genreId) : "";
    var prefix = titlePrefix ? titlePrefix + " — " : "";
    queueCardsLine(lineLoaders, "/v1/items?type=" + contentType + genreQuery + "&sort=updated-&perpage=20", prefix + translateOr("title_new", "Новинки"), "catalog?type=" + contentType + genreQuery + "&sort=updated-");
    queueCardsLine(lineLoaders, "/v1/items?type=" + contentType + genreQuery + "&sort=views-&perpage=20", prefix + translateOr("title_popular", "Популярные"), "catalog?type=" + contentType + genreQuery + "&sort=views-");
    queueCardsLine(lineLoaders, "/v1/items?type=" + contentType + genreQuery + "&sort=rating-&perpage=20", prefix + translateOr("title_hight_voite", "С высоким рейтингом"), "catalog?type=" + contentType + genreQuery + "&sort=rating-");
    queueCardsLine(lineLoaders, "/v1/items?type=" + contentType + genreQuery + "&sort=watchers-&perpage=20", prefix + translateOr("dso_kinopub_watchers", "Смотрят сейчас"), "catalog?type=" + contentType + genreQuery + "&sort=watchers-");
  }

  function parseListParams(params) {
    var rawUrl = params && params.url ? String(params.url) : "";
    var page = parseInt(params && params.page, 10) || 1;
    var parsed = {
      page: page,
      shortcut: "",
      type: "",
      sort: "updated-",
      genre: "",
      query: "",
      year: "",
      quality: "",
      section: "",
      folder: "",
      collection: "",
      mode: ""
    };
    if (params && params.query) {
      parsed.query = decodeURIComponent(params.query);
    }
    if (params && params.genres && !isAnimationGenre(params.genres)) {
      parsed.genre = params.genres;
    }
    if (params && (params.url === "anime" || params.kinopub_mode === "anime")) {
      parsed.mode = "anime";
    } else if (params && (isAnimationGenre(params.genres) || params.kinopub_mode === "cartoon")) {
      parsed.mode = "cartoon";
    }
    var basePart = rawUrl;
    var queryPart = "";
    if (rawUrl.indexOf("?") >= 0) {
      basePart = rawUrl.split("?")[0];
      queryPart = rawUrl.split("?")[1];
    } else if (rawUrl.indexOf("catalog") === 0) {
      basePart = "catalog";
      queryPart = rawUrl.replace(/^catalog&?/, "").replace(/^catalog\?/, "");
    } else if (rawUrl.indexOf("type=") === 0 || rawUrl.indexOf("sort=") === 0 || rawUrl.indexOf("genre=") === 0) {
      queryPart = rawUrl;
    } else if (rawUrl.indexOf("search") === 0) {
      basePart = "search";
      queryPart = rawUrl.indexOf("?") >= 0 ? rawUrl.split("?")[1] : "";
      if (!parsed.query && params && params.query) {
        parsed.query = decodeURIComponent(params.query);
      }
    }
    if (basePart === "fresh" || basePart === "hot" || basePart === "popular") {
      parsed.shortcut = basePart;
    } else if (basePart === "watching/movies" || rawUrl === "watching/movies") {
      parsed.section = "watching/movies";
    } else if (basePart === "watching/serials" || rawUrl.indexOf("watching/serials") === 0) {
      parsed.section = "watching/serials";
    } else if (basePart === "history" || rawUrl === "history") {
      parsed.section = "history";
    } else if (basePart === "bookmarks" || rawUrl.indexOf("bookmarks") === 0) {
      parsed.section = "bookmarks";
    } else if (basePart === "collection" || rawUrl.indexOf("collection") === 0) {
      parsed.section = "collection";
    }
    if (queryPart) {
      queryPart.split("&").forEach(function (pair) {
        var keyValue = pair.split("=");
        var key = decodeURIComponent(keyValue[0] || "");
        var value = decodeURIComponent(keyValue.slice(1).join("=") || "");
        if (key === "type") {
          parsed.type = value;
        } else if (key === "sort") {
          parsed.sort = value;
        } else if (key === "genre") {
          parsed.genre = value;
        } else if (key === "year") {
          parsed.year = value;
        } else if (key === "quality") {
          parsed.quality = value;
        } else if (key === "folder") {
          parsed.folder = value;
        } else if (key === "id") {
          parsed.collection = value;
        } else if (key === "q" || key === "query") {
          parsed.query = value;
        } else if (key === "page") {
          parsed.page = parseInt(value, 10) || parsed.page;
        } else if (key === "mode") {
          parsed.mode = value;
        }
      });
    }
    if (!parsed.shortcut) {
      if (rawUrl === "fresh" || rawUrl === "hot" || rawUrl === "popular") {
        parsed.shortcut = rawUrl;
      }
    }
    if (!parsed.type && params && params.url === "movie") {
      parsed.type = "movie";
    }
    if (!parsed.type && params && params.url === "tv") {
      parsed.type = "serial";
    }
    if (!parsed.type && params && params.url === "anime") {
      parsed.type = "serial";
    }
    if (isAnimationGenre(parsed.genre)) {
      parsed.genre = "";
    }
    return parsed;
  }
  function buildListRequest(parsed) {
    if (parsed.query) {
      var query = parsed.query;
      try {
        query = decodeURIComponent(String(query).replace(/\+/g, " "));
      } catch (decodeError) {}
      return {
        path: "/v1/items/search?q=" + encodeURIComponent(query) + "&field=title&perpage=40",
        listUrl: "search?q=" + encodeURIComponent(query)
      };
    }
    if (parsed.section === "watching/movies") {
      return {
        path: "/v1/watching/movies",
        listUrl: "watching/movies"
      };
    }
    if (parsed.section === "watching/serials") {
      return {
        path: "/v1/watching/serials?subscribed=0",
        listUrl: "watching/serials"
      };
    }
    if (parsed.section === "history") {
      return {
        path: "/v1/history?perpage=40",
        listUrl: "history"
      };
    }
    if (parsed.section === "bookmarks" && parsed.folder) {
      return {
        path: "/v1/bookmarks/" + encodeURIComponent(parsed.folder),
        listUrl: "bookmarks?folder=" + encodeURIComponent(parsed.folder)
      };
    }
    if (parsed.section === "collection" && parsed.collection) {
      return {
        path: "/v1/collections/view?id=" + encodeURIComponent(parsed.collection),
        listUrl: "collection?id=" + encodeURIComponent(parsed.collection)
      };
    }
    if (parsed.shortcut) {
      var shortcutParams = [];
      if (parsed.type) {
        shortcutParams.push("type=" + encodeURIComponent(parsed.type));
      }
      shortcutParams.push("perpage=40");
      var shortcutQuery = shortcutParams.join("&");
      return {
        path: "/v1/items/" + parsed.shortcut + "?" + shortcutQuery,
        listUrl: parsed.shortcut + (parsed.type ? "?type=" + encodeURIComponent(parsed.type) : "")
      };
    }
    var queryParams = [];
    if (parsed.type) {
      queryParams.push("type=" + encodeURIComponent(parsed.type));
    }
    if (parsed.genre) {
      queryParams.push("genre=" + encodeURIComponent(parsed.genre));
    }
    if (parsed.year) {
      queryParams.push("year=" + encodeURIComponent(parsed.year));
    }
    if (parsed.quality) {
      queryParams.push("quality=" + encodeURIComponent(parsed.quality));
    }
    if (parsed.sort) {
      queryParams.push("sort=" + encodeURIComponent(parsed.sort));
    }
    queryParams.push("perpage=40");
    var queryString = queryParams.join("&");
    return {
      path: "/v1/items?" + queryString,
      listUrl: "catalog?" + queryString.replace(/&perpage=40/, "")
    };
  }
  function fetchGenres(genreType, callback) {
    var typeKey = genreType || "movie";
    if (genresCache[typeKey]) {
      callback(genresCache[typeKey]);
      return;
    }
    apiGet("/v1/genres?type=" + encodeURIComponent(typeKey), function (response) {
      var genres = Array.isArray(response) ? response : response && (response.genres || response.items) || [];
      genresCache[typeKey] = genres;
      callback(genres);
    }, function () {
      callback([]);
    });
  }

  var liveTvMenuButton = null;
  function playLiveChannel(channel) {
    if (!channel || !channel.stream) {
      Lampa.Noty.show(translateOr("online_nolink", "Не удалось извлечь ссылку"));
      return;
    }
    var playerData = {
      title: channel.title || channel.name || translateOr("dso_kinopub_live_tv", "ТВ"),
      url: channel.stream
    };
    Lampa.Player.play(playerData);
    Lampa.Player.playlist([playerData]);
  }
  function showLiveTvList() {
    if (!getAccessToken()) {
      Lampa.Noty.show(translateOr("dso_kinopub_nodevice", "Устройство не привязано"));
      return;
    }
    if (Lampa.Loading) {
      Lampa.Loading.start();
    }
    apiGet("/v1/tv", function (response) {
      if (Lampa.Loading) {
        Lampa.Loading.stop();
      }
      var channels = response && response.channels || (Array.isArray(response) ? response : []);
      if (!channels.length) {
        Lampa.Noty.show(translateOr("dso_kinopub_live_empty", "Нет доступных каналов"));
        return;
      }
      var menuItems = channels.map(function (tvChannel) {
        var logoUrl = "";
        if (tvChannel.logos) {
          logoUrl = proxyImageUrl(tvChannel.logos.s || tvChannel.logos.m || tvChannel.logos.b || "");
        } else if (tvChannel.logo) {
          logoUrl = proxyImageUrl(tvChannel.logo);
        }
        var menuItem = {
          title: tvChannel.title || tvChannel.name || "#" + tvChannel.id,
          subtitle: tvChannel.name || "",
          icon: logoUrl,
          channel: tvChannel
        };
        return menuItem;
      });
      Lampa.Select.show({
        title: translateOr("dso_kinopub_live_tv", "ТВ"),
        items: menuItems,
        onSelect: function (selectedItem) {
          playLiveChannel(selectedItem.channel);
        },
        onBack: function () {
          Lampa.Controller.toggle("content");
        }
      });
    }, function () {
      if (Lampa.Loading) {
        Lampa.Loading.stop();
      }
      Lampa.Noty.show(translateOr("dso_kinopub_live_error", "Не удалось загрузить ТВ"));
    });
  }
  function updateLiveTvMenuButton() {
    if (!Lampa.Menu || typeof Lampa.Menu.addButton !== "function") {
      return;
    }
    if (!getAccessToken()) {
      if (liveTvMenuButton && liveTvMenuButton.remove) {
        try {
          liveTvMenuButton.remove();
        } catch (removeError) {}
      }
      liveTvMenuButton = null;
      return;
    }
    if (liveTvMenuButton && liveTvMenuButton.length) {
      return;
    }
    var tvIconSvg = "<svg viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M4 7.5C4 6.11929 5.11929 5 6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V14.5C20 15.8807 18.8807 17 17.5 17H6.5C5.11929 17 4 15.8807 4 14.5V7.5Z\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 20H16\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M12 17V20\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>";
    liveTvMenuButton = Lampa.Menu.addButton(tvIconSvg, translateOr("dso_kinopub_live_tv", "ТВ"), showLiveTvList);
    if (liveTvMenuButton && liveTvMenuButton.attr) {
      liveTvMenuButton.attr("data-action", "dso_kinopub_live_tv");
    }
  }
  function interceptAnimeMenu() {
    Lampa.Listener.follow("menu", function (menuEvent) {
      if (!menuEvent || menuEvent.type !== "action" || menuEvent.action !== "anime") {
        return;
      }
      if (Lampa.Storage.field("source") !== SOURCE_ID) {
        return;
      }
      if (typeof menuEvent.abort === "function") {
        menuEvent.abort();
      }
      var animeTitle = (Lampa.Lang.translate("menu_anime") || "Аниме") + " - " + SOURCE_TITLE;
      if (Lampa.Router && typeof Lampa.Router.call === "function") {
        var routerParams = {
          url: "anime",
          title: animeTitle,
          source: SOURCE_ID,
          page: 1
        };
        Lampa.Router.call("category", routerParams);
        return;
      }
      var activityParams = {
        url: "anime",
        title: animeTitle,
        component: "category",
        source: SOURCE_ID,
        page: 1
      };
      Lampa.Activity.push(activityParams);
    });
  }

  function buildSeasonsMap(item) {
    if (!item || !item.seasons || !item.seasons.length) {
      return {};
    }
    var seasonsMap = {};
    item.seasons.forEach(function (season) {
      var seasonNumber = season.number || season.season || 0;
      var episodes = (season.episodes || []).map(function (episode, episodeIndex) {
        return {
          id: episode.id || item.id + "_" + seasonNumber + "_" + (episode.number || episodeIndex + 1),
          name: episode.title || "Episode " + (episode.number || episodeIndex + 1),
          overview: episode.plot || "",
          episode_number: episode.number || episodeIndex + 1,
          season_number: seasonNumber,
          still_path: "",
          img: episode.thumbnail ? proxyImageUrl(episode.thumbnail) : "",
          air_date: ""
        };
      });
      seasonsMap["" + seasonNumber] = {
        id: item.id + "_s" + seasonNumber,
        name: season.title || "Season " + seasonNumber,
        season_number: seasonNumber,
        episodes: episodes
      };
    });
    return seasonsMap;
  }
  function buildLastSeasonInfo(item) {
    if (!item || !item.seasons || !item.seasons.length) {
      return null;
    }
    var lastSeason = item.seasons[item.seasons.length - 1];
    var lastSeasonNumber = lastSeason.number || lastSeason.season || item.seasons.length;
    var lastEpisodes = (lastSeason.episodes || []).map(function (episode, episodeIndex) {
      return {
        id: episode.id || item.id + "_" + lastSeasonNumber + "_" + (episode.number || episodeIndex + 1),
        name: episode.title || "Episode " + (episode.number || episodeIndex + 1),
        overview: episode.plot || "",
        episode_number: episode.number || episodeIndex + 1,
        season_number: lastSeasonNumber,
        still_path: "",
        img: episode.thumbnail ? proxyImageUrl(episode.thumbnail) : "",
        air_date: ""
      };
    });
    return {
      id: item.id,
      name: item.title,
      number_of_seasons: item.seasons.length,
      seasons: item.seasons.map(function (season) {
        var seasonInfo = {
          season_number: season.number || season.season || 0
        };
        return seasonInfo;
      }),
      episodes: lastEpisodes
    };
  }
  function buildTrailerVideos(item) {
    if (!item || !item.trailer) {
      return {
        results: []
      };
    }
    var trailer = item.trailer;
    var youtubeId = trailer.id || "";
    var trailerUrl = trailer.url || "";
    if (!youtubeId && trailerUrl) {
      var urlMatch = trailerUrl.match(/(?:v=|youtu\.be\/)([\w-]+)/);
      if (urlMatch) {
        youtubeId = urlMatch[1];
      }
    }
    if (!youtubeId) {
      return {
        results: []
      };
    }
    var trailerVideo = {
      id: youtubeId,
      key: youtubeId,
      name: "Trailer",
      site: "YouTube",
      type: "Trailer",
      official: true
    };
    var videosResult = {
      results: [trailerVideo]
    };
    return videosResult;
  }
  function buildPersons(item) {
    var persons = {
      cast: [],
      crew: []
    };
    if (!item) {
      return persons;
    }
    if (item.cast) {
      String(item.cast).split(",").forEach(function (actorName, actorIndex) {
        actorName = actorName.trim();
        if (!actorName) {
          return;
        }
        var castMember = {
          id: "kp_cast_" + actorIndex,
          name: actorName,
          character: "",
          profile_path: ""
        };
        persons.cast.push(castMember);
      });
    }
    if (item.director) {
      String(item.director).split(",").forEach(function (directorName, directorIndex) {
        directorName = directorName.trim();
        if (!directorName) {
          return;
        }
        var crewMember = {
          id: "kp_crew_" + directorIndex,
          name: directorName,
          job: "Director",
          department: "Directing",
          profile_path: ""
        };
        persons.crew.push(crewMember);
      });
    }
    return persons;
  }
  function servePartedLines(lineLoaders, partSize, onSuccess, onError) {
    function serveNext(resolve, reject) {
      if (Lampa.Api && Lampa.Api.partNext) {
        Lampa.Api.partNext(lineLoaders, partSize, resolve, reject);
      } else {
        var readyLines = [];
        var pendingLines = lineLoaders.length;
        if (!pendingLines) {
          reject();
          return;
        }
        lineLoaders.forEach(function (loader) {
          loader(function (line) {
            if (line && line.results && line.results.length) {
              readyLines.push(line);
            }
            pendingLines--;
            if (!pendingLines) {
              if (readyLines.length) {
                resolve(readyLines);
              } else {
                reject();
              }
            }
          });
        });
      }
    }
    serveNext(onSuccess, onError);
    return serveNext;
  }

  function resolveTmdbInfo(card, callback) {
    if (!card || !Lampa.TMDB || typeof Lampa.TMDB.api !== "function") {
      callback();
      return;
    }
    var isTv = !!card.name;
    var languageCode = Lampa.Storage.get("language", "ru");
    var request = trackRequest(new Lampa.Reguest());
    request.timeout(8000);

    function applyTmdbMatch(match) {
      if (!match || !match.id) {
        return false;
      }
      card.id = match.id;
      card.tmdb_id = match.id;
      if (match.backdrop_path) {
        card.backdrop_path = match.backdrop_path;
      }
      if (match.poster_path) {
        card.poster_path = match.poster_path;
      }
      return true;
    }

    function searchByTitle() {
      var searchTitle = (isTv ? card.original_name || card.name : card.original_title || card.title) || "";
      if (!searchTitle) {
        callback();
        return;
      }
      var year = "";
      var dateSource = isTv ? card.first_air_date : card.release_date;
      if (dateSource) {
        year = String(dateSource).substr(0, 4);
      }
      var searchEndpoint = isTv ? "search/tv" : "search/movie";
      var yearParam = year ? (isTv ? "&first_air_date_year=" + year : "&year=" + year) : "";
      var searchUrl = Lampa.TMDB.api(searchEndpoint + "?api_key=" + Lampa.TMDB.key() + "&language=" + languageCode + "&query=" + encodeURIComponent(searchTitle) + yearParam);
      request.silent(searchUrl, function (searchResponse) {
        var searchResults = searchResponse && searchResponse.results ? searchResponse.results : [];
        if (!searchResults.length && year) {
          var fallbackUrl = Lampa.TMDB.api(searchEndpoint + "?api_key=" + Lampa.TMDB.key() + "&language=" + languageCode + "&query=" + encodeURIComponent(searchTitle));
          request.silent(fallbackUrl, function (fallbackResponse) {
            var fallbackResults = fallbackResponse && fallbackResponse.results ? fallbackResponse.results : [];
            applyTmdbMatch(fallbackResults[0]);
            callback();
          }, function () {
            callback();
          });
          return;
        }
        applyTmdbMatch(searchResults[0]);
        callback();
      }, function () {
        callback();
      });
    }

    if (card.imdb_id) {
      var findUrl = Lampa.TMDB.api("find/" + encodeURIComponent(card.imdb_id) + "?api_key=" + Lampa.TMDB.key() + "&external_source=imdb_id&language=" + languageCode);
      request.silent(findUrl, function (findResponse) {
        var matches = findResponse && (isTv ? findResponse.tv_results : findResponse.movie_results) || [];
        if (applyTmdbMatch(matches[0])) {
          callback();
        } else {
          searchByTitle();
        }
      }, function () {
        searchByTitle();
      });
    } else {
      searchByTitle();
    }
  }

  var kinopubApiSource = {
    main: function (mainParams, onSuccess, onError) {
      if (!getAccessToken()) {
        onSuccess([emptyResult()]);
        return function () {};
      }
      var currentYear = new Date().getFullYear();
      var previousYear = currentYear - 1;
      var partSize = 6;
      var lineLoaders = [];
      queueCardsLine(lineLoaders, "/v1/items?sort=watchers-&perpage=20", translateOr("title_now_watch", "Сейчас смотрят"), "catalog?sort=watchers-");
      queueCardsLine(lineLoaders, "/v1/items/fresh?type=movie&perpage=20", translateOr("dso_kinopub_fresh", "Свежие") + " — " + translateOr("menu_movies", "Фильмы"), "fresh?type=movie");
      queueCardsLine(lineLoaders, "/v1/items/fresh?type=serial&perpage=20", translateOr("dso_kinopub_fresh", "Свежие") + " — " + translateOr("menu_tv", "Сериалы"), "fresh?type=serial");
      queueCardsLine(lineLoaders, "/v1/items/hot?type=movie&perpage=20", translateOr("dso_kinopub_hot", "Горячие") + " — " + translateOr("menu_movies", "Фильмы"), "hot?type=movie");
      queueCardsLine(lineLoaders, "/v1/items/hot?type=serial&perpage=20", translateOr("dso_kinopub_hot", "Горячие") + " — " + translateOr("menu_tv", "Сериалы"), "hot?type=serial");
      queueCardsLine(lineLoaders, "/v1/items/popular?type=movie&perpage=20", translateOr("title_popular_movie", "Популярные фильмы"), "popular?type=movie");
      queueCardsLine(lineLoaders, "/v1/items/popular?type=serial&perpage=20", translateOr("title_popular_tv", "Популярные сериалы"), "popular?type=serial");
      queueCardsLine(lineLoaders, "/v1/items?type=movie&sort=updated-&perpage=20", translateOr("title_new", "Новинки") + " — " + translateOr("menu_movies", "Фильмы"), "catalog?type=movie&sort=updated-");
      queueCardsLine(lineLoaders, "/v1/items?type=serial&sort=updated-&perpage=20", translateOr("title_new", "Новинки") + " — " + translateOr("menu_tv", "Сериалы"), "catalog?type=serial&sort=updated-");
      queueCardsLine(lineLoaders, "/v1/items?type=movie&sort=views-&perpage=20", translateOr("title_popular", "Популярные") + " — " + translateOr("menu_movies", "Фильмы"), "catalog?type=movie&sort=views-");
      queueCardsLine(lineLoaders, "/v1/items?type=serial&sort=views-&perpage=20", translateOr("title_popular", "Популярные") + " — " + translateOr("menu_tv", "Сериалы"), "catalog?type=serial&sort=views-");
      queueCardsLine(lineLoaders, "/v1/items?type=movie&sort=rating-&perpage=20", translateOr("title_top_movie", "Топ фильмов"), "catalog?type=movie&sort=rating-");
      queueCardsLine(lineLoaders, "/v1/items?type=serial&sort=rating-&perpage=20", translateOr("title_top_tv", "Топ сериалов"), "catalog?type=serial&sort=rating-");
      queueCardsLine(lineLoaders, "/v1/items?type=movie&year=" + currentYear + "&sort=rating-&perpage=20", translateOr("title_new_this_year", "Новинки этого года") + " — " + translateOr("menu_movies", "Фильмы"), "catalog?type=movie&year=" + currentYear + "&sort=rating-");
      queueCardsLine(lineLoaders, "/v1/items?type=serial&year=" + currentYear + "&sort=rating-&perpage=20", translateOr("title_new_this_year", "Новинки этого года") + " — " + translateOr("menu_tv", "Сериалы"), "catalog?type=serial&year=" + currentYear + "&sort=rating-");
      queueCardsLine(lineLoaders, "/v1/items?type=movie&year=" + previousYear + "&sort=rating-&perpage=20", translateOr("title_last_year", "Прошлый год") + " — " + translateOr("menu_movies", "Фильмы"), "catalog?type=movie&year=" + previousYear + "&sort=rating-");
      queueCardsLine(lineLoaders, "/v1/items?type=movie&sort=updated-&perpage=20&quality=2160", translateOr("title_in_high_quality", "В высоком качестве"), "catalog?type=movie&sort=updated-&quality=2160");
      queueCardsLine(lineLoaders, "/v1/items?type=documovie&sort=updated-&perpage=20", translateOr("dso_kinopub_docs", "Документальные"), "catalog?type=documovie&sort=updated-");
      queueCardsLine(lineLoaders, "/v1/items?type=docuserial&sort=updated-&perpage=20", translateOr("dso_kinopub_doc_serials", "Документальные сериалы"), "catalog?type=docuserial&sort=updated-");
      queueCardsLine(lineLoaders, "/v1/items?type=tvshow&sort=updated-&perpage=20", translateOr("dso_kinopub_tvshow", "ТВ шоу"), "catalog?type=tvshow&sort=updated-");
      queueCardsLine(lineLoaders, "/v1/items?type=concert&sort=updated-&perpage=20", translateOr("dso_kinopub_concerts", "Концерты"), "catalog?type=concert&sort=updated-");
      queueCardsLine(lineLoaders, "/v1/items?type=3d&sort=updated-&perpage=20", translateOr("dso_kinopub_3d", "3D"), "catalog?type=3d&sort=updated-");
      function serveFirstPart() {
        return servePartedLines(lineLoaders, partSize, onSuccess, onError);
      }
      prependContinueWatchingLines(lineLoaders, function () {
        appendBookmarkLines(lineLoaders, function () {
          appendCollectionLines(lineLoaders, function () {
            fetchGenres("movie", function (movieGenres) {
              (movieGenres || []).slice(0, 12).forEach(function (movieGenre) {
                if (!movieGenre || !movieGenre.id) {
                  return;
                }
                queueCardsLine(lineLoaders, "/v1/items?type=movie&genre=" + movieGenre.id + "&sort=rating-&perpage=20", movieGenre.title || movieGenre.name || "", "catalog?type=movie&genre=" + movieGenre.id + "&sort=rating-");
              });
              serveFirstPart();
            });
          });
        });
      });

      scheduleFavoritesSync(false);
      return function (onNextSuccess, onNextError) {
        servePartedLines(lineLoaders, partSize, onNextSuccess, onNextError);
      };
    },
    category: function (categoryParams, onSuccess, onError) {
      if (!getAccessToken()) {
        onSuccess([emptyResult()]);
        return function () {};
      }
      var partSize = 6;
      var lineLoaders = [];
      resolveCatalogMode(categoryParams, function (catalogMode) {
        lineLoaders.length = 0;
        if ((catalogMode.mode === "cartoon" || catalogMode.mode === "anime") && !catalogMode.genreId) {
          onSuccess([{
            title: translateOr("dso_kinopub_genre_missing", "Жанр не найден в KinoPub"),
            results: [],
            source: SOURCE_ID,
            page: 1,
            total_pages: 1
          }]);
          return;
        }
        if (catalogMode.mode === "tv") {
          addStandardCatalogLines(lineLoaders, "serial", 0, translateOr("menu_tv", "Сериалы"));
          addStandardCatalogLines(lineLoaders, "tvshow", 0, translateOr("dso_kinopub_tvshow", "ТВ шоу"));
          queueCardsLine(lineLoaders, "/v1/items?type=docuserial&sort=updated-&perpage=20", translateOr("dso_kinopub_doc_serials", "Документальные сериалы"), "catalog?type=docuserial&sort=updated-");
          fetchGenres("movie", function (serialGenres) {
            (serialGenres || []).slice(0, 8).forEach(function (serialGenre) {
              if (!serialGenre || !serialGenre.id) {
                return;
              }
              queueCardsLine(lineLoaders, "/v1/items?type=serial&genre=" + serialGenre.id + "&sort=rating-&perpage=20", serialGenre.title, "catalog?type=serial&genre=" + serialGenre.id + "&sort=rating-");
            });
            servePartedLines(lineLoaders, partSize, onSuccess, onError);
          });
          return;
        }
        if (catalogMode.mode === "cartoon" || catalogMode.mode === "anime") {
          catalogMode.types.forEach(function (modeContentType) {
            var typeTitle = modeContentType === "serial" ? translateOr("menu_tv", "Сериалы") : translateOr("menu_movies", "Фильмы");
            addStandardCatalogLines(lineLoaders, modeContentType, catalogMode.genreId, typeTitle);
          });
          servePartedLines(lineLoaders, partSize, onSuccess, onError);
          return;
        }
        var primaryType = catalogMode.types[0] || "movie";
        if (catalogMode.catalogGenre) {
          queueCardsLine(lineLoaders, "/v1/items?type=" + primaryType + "&genre=" + catalogMode.catalogGenre + "&sort=rating-&perpage=20", categoryParams.title || "", "catalog?type=" + primaryType + "&genre=" + catalogMode.catalogGenre + "&sort=rating-");
          servePartedLines(lineLoaders, partSize, onSuccess, onError);
          return;
        }
        addStandardCatalogLines(lineLoaders, primaryType, 0, "");
        if (!categoryParams.keywords) {
          fetchGenres("movie", function (catalogGenres) {
            (catalogGenres || []).slice(0, 8).forEach(function (catalogGenreItem) {
              if (!catalogGenreItem || !catalogGenreItem.id) {
                return;
              }
              queueCardsLine(lineLoaders, "/v1/items?type=" + primaryType + "&genre=" + catalogGenreItem.id + "&sort=rating-&perpage=20", catalogGenreItem.title, "catalog?type=" + primaryType + "&genre=" + catalogGenreItem.id + "&sort=rating-");
            });
            servePartedLines(lineLoaders, partSize, onSuccess, onError);
          });
          return;
        }
        servePartedLines(lineLoaders, partSize, onSuccess, onError);
      });
      return function (onNextSuccess, onNextError) {
        servePartedLines(lineLoaders, partSize, onNextSuccess, onNextError);
      };
    },
    list: function (listParams, onSuccess, onError) {
      if (!getAccessToken()) {
        onSuccess(emptyResult());
        return;
      }
      var parsedParams = parseListParams(listParams || {});
      function loadList(genreOverride) {
        if (genreOverride) {
          parsedParams.genre = genreOverride;
        }
        var listRequest = buildListRequest(parsedParams);
        loadCardsLine(listRequest.path, listParams.title || "", listRequest.listUrl, parsedParams.page, function (listResult) {
          if (listResult && listResult.results && listResult.results.length) {
            onSuccess(listResult);
          } else if (onError) {
            onError();
          } else {
            onSuccess(listResult);
          }
        });
      }
      if (parsedParams.mode === "cartoon" && !parsedParams.genre) {
        findGenreIdByKeywords(["мультфильм", "мульт", "анимация", "animation"], "movie", function (cartoonGenreId) {
          if (!cartoonGenreId) {
            var emptyCartoonResult = {
              results: [],
              page: 1,
              total_pages: 1,
              source: SOURCE_ID
            };
            if (onError) {
              onError();
            } else {
              onSuccess(emptyCartoonResult);
            }
            return;
          }
          if (!parsedParams.type) {
            parsedParams.type = "movie";
          }
          loadList(cartoonGenreId);
        });
        return;
      }
      if (parsedParams.mode === "anime" && !parsedParams.genre) {
        findGenreIdByKeywords(["аниме", "anime"], "movie", function (animeGenreId) {
          if (!animeGenreId) {
            var emptyAnimeResult = {
              results: [],
              page: 1,
              total_pages: 1,
              source: SOURCE_ID
            };
            if (onError) {
              onError();
            } else {
              onSuccess(emptyAnimeResult);
            }
            return;
          }
          if (!parsedParams.type) {
            parsedParams.type = "movie";
          }
          loadList(animeGenreId);
        });
        return;
      }
      loadList();
    },
    full: function (fullParams, onSuccess, onError) {
      if (!getAccessToken()) {
        if (onError) {
          onError();
        }
        return;
      }
      var itemId = fullParams.card && (fullParams.card.kinopub_id || fullParams.card.id) || fullParams.id;
      if (!itemId) {
        if (onError) {
          onError();
        }
        return;
      }
      apiGet("/v1/items/" + itemId + "?nolinks=1", function (itemResponse) {
        if (!itemResponse || !itemResponse.item) {
          if (onError) {
            onError();
          }
          return;
        }
        var item = itemResponse.item;
        var card = convertItemToCard(item, true);
        var lastSeasonInfo = buildLastSeasonInfo(item);
        var persons = buildPersons(item);
        var trailerVideos = buildTrailerVideos(item);
        var fullData = {
          movie: card,
          persons: persons,
          videos: trailerVideos
        };
        if (lastSeasonInfo) {
          fullData.episodes = lastSeasonInfo;
        }
        function finishFull() {
          apiGet("/v1/items/similar?id=" + encodeURIComponent(itemId), function (similarResponse) {
            var similarItems = similarResponse && similarResponse.items ? similarResponse.items : Array.isArray(similarResponse) ? similarResponse : [];
            fullData.simular = {
              results: convertItemsToCards(similarItems),
              source: SOURCE_ID
            };
            fullData.recomend = fullData.simular;
            onSuccess(fullData);
          }, function () {
            onSuccess(fullData);
          });
        }

        resolveTmdbInfo(card, finishFull);
      }, onError);
    },
    menu: function (menuParams, callback) {
      if (!getAccessToken()) {
        callback([]);
        return;
      }
      fetchGenres("movie", function (menuGenres) {
        callback((menuGenres || []).map(function (menuGenre) {
          var genreMenuItem = {
            title: menuGenre.title,
            id: menuGenre.id
          };
          return genreMenuItem;
        }));
      });
    },
    menuCategory: function (menuCategoryParams, callback) {
      var menuAction = menuCategoryParams && (menuCategoryParams.action || menuCategoryParams.url) || "movie";
      var categoryLinks = [];
      function addCatalogLinks(linkContentType, linkTitlePrefix) {
        var linkPrefix = linkTitlePrefix ? linkTitlePrefix + " — " : "";
        categoryLinks.push({
          title: linkPrefix + (Lampa.Lang.translate("title_new") || "Новинки"),
          url: "catalog?type=" + linkContentType + "&sort=updated-"
        });
        categoryLinks.push({
          title: linkPrefix + (Lampa.Lang.translate("title_popular") || "Популярные"),
          url: "catalog?type=" + linkContentType + "&sort=views-"
        });
        categoryLinks.push({
          title: linkPrefix + (Lampa.Lang.translate("title_hight_voite") || "Рейтинг"),
          url: "catalog?type=" + linkContentType + "&sort=rating-"
        });
        categoryLinks.push({
          title: linkPrefix + (Lampa.Lang.translate("dso_kinopub_watchers") || "Смотрят сейчас"),
          url: "catalog?type=" + linkContentType + "&sort=watchers-"
        });
      }
      if (menuAction === "tv") {
        addCatalogLinks("serial", translateOr("menu_tv", "Сериалы"));
        addCatalogLinks("tvshow", translateOr("dso_kinopub_tvshow", "ТВ шоу"));
      } else if (menuAction === "anime") {
        categoryLinks.push({
          title: Lampa.Lang.translate("title_new") || "Новинки",
          url: "catalog?type=movie&sort=updated-&mode=anime"
        });
        categoryLinks.push({
          title: Lampa.Lang.translate("title_popular") || "Популярные",
          url: "catalog?type=movie&sort=views-&mode=anime"
        });
      } else {
        addCatalogLinks(lampaTypeToKinopubType(menuAction), "");
      }
      callback(categoryLinks);
    },
    person: function (personParams, onSuccess, onError) {
      if (onError) {
        onError();
      } else if (onSuccess) {
        onSuccess({});
      }
    },
    seasons: function (seasonsCard, seasonNumbers, seasonsCallback) {
      var seasonsItemId = seasonsCard && (seasonsCard.kinopub_id || seasonsCard.id) || 0;
      if (!seasonsItemId || !getAccessToken()) {
        if (seasonsCallback) {
          seasonsCallback({});
        }
        return;
      }
      apiGet("/v1/items/" + seasonsItemId + "?nolinks=1", function (seasonsResponse) {
        if (!seasonsResponse || !seasonsResponse.item) {
          if (seasonsCallback) {
            seasonsCallback({});
          }
          return;
        }
        if (seasonsCallback) {
          seasonsCallback(buildSeasonsMap(seasonsResponse.item));
        }
      }, function () {
        if (seasonsCallback) {
          seasonsCallback({});
        }
      });
    },
    clear: function () {
      clearTrackedRequests();
    },
    discovery: function () {
      return {
        title: SOURCE_TITLE,
        search: function (searchParams, searchCallback) {
          if (!getAccessToken()) {
            searchCallback([]);
            return;
          }
          var rawQuery = searchParams && searchParams.query || "";
          var searchQuery;
          try {
            searchQuery = decodeURIComponent(String(rawQuery).replace(/\+/g, " "));
          } catch (queryDecodeError) {
            searchQuery = String(rawQuery);
          }
          searchQuery = (searchQuery || "").trim();
          if (searchQuery.length < 2) {
            searchCallback([]);
            return;
          }
          function groupSearchResults(foundItems) {
            var resultGroups = [];
            var itemsList = foundItems || [];
            if (!itemsList.length) {
              return resultGroups;
            }
            var movieResults = itemsList.filter(function (movieCandidate) {
              return !isSeriesType(movieCandidate.type);
            });
            var seriesResults = itemsList.filter(function (seriesCandidate) {
              return isSeriesType(seriesCandidate.type);
            });
            if (movieResults.length) {
              resultGroups.push({
                title: translateOr("menu_movies", "Фильмы"),
                type: "movie",
                results: convertItemsToCards(movieResults),
                source: SOURCE_ID
              });
            }
            if (seriesResults.length) {
              resultGroups.push({
                title: translateOr("menu_tv", "Сериалы"),
                type: "tv",
                results: convertItemsToCards(seriesResults),
                source: SOURCE_ID
              });
            }
            if (!resultGroups.length && itemsList.length) {
              resultGroups.push({
                title: SOURCE_TITLE,
                type: "movie",
                results: convertItemsToCards(itemsList),
                source: SOURCE_ID
              });
            }
            return resultGroups;
          }
          function flattenSearchItems(searchResponse) {
            if (!searchResponse) {
              return [];
            }
            var itemsByType = searchResponse.items;
            if (itemsByType && !Array.isArray(itemsByType) && typeof itemsByType === "object") {
              var flatItems = [];
              Object.keys(itemsByType).forEach(function (typeKey) {
                var typeGroup = itemsByType[typeKey];
                var typeGroupItems = typeGroup && typeGroup.items ? typeGroup.items : Array.isArray(typeGroup) ? typeGroup : [];
                typeGroupItems.forEach(function (typeGroupItem) {
                  if (typeGroupItem && !typeGroupItem.type) {
                    typeGroupItem.type = typeKey;
                  }
                  flatItems.push(typeGroupItem);
                });
              });
              return flatItems;
            }
            return extractItems(searchResponse);
          }
          var searchPath = "/v1/items/search?q=" + encodeURIComponent(searchQuery) + "&field=title&perpage=40";
          apiGet(searchPath, function (titleSearchResponse) {
            var titleSearchItems = flattenSearchItems(titleSearchResponse);
            var titleSearchGroups = groupSearchResults(titleSearchItems);
            if (titleSearchGroups.length) {
              searchCallback(titleSearchGroups);
              return;
            }
            apiGet("/v1/items/search?q=" + encodeURIComponent(searchQuery) + "&sectioned=1&perpage=40", function (sectionedResponse) {
              searchCallback(groupSearchResults(flattenSearchItems(sectionedResponse)));
            }, function () {
              searchCallback([]);
            });
          }, function () {
            searchCallback([]);
          });
        },
        params: {
          save: true
        },
        onMore: function (moreParams, closeSearch) {
          closeSearch();
          var moreQuery = moreParams && moreParams.query || "";
          try {
            moreQuery = decodeURIComponent(String(moreQuery).replace(/\+/g, " "));
          } catch (moreDecodeError) {}
          Lampa.Activity.push({
            url: "search?q=" + encodeURIComponent(moreQuery),
            title: (Lampa.Lang.translate("search") || "Search") + " - " + moreQuery,
            component: "category_full",
            page: 2,
            query: encodeURIComponent(moreQuery),
            source: SOURCE_ID
          });
        },
        onCancel: function () {
          clearTrackedRequests();
        }
      };
    }
  };

  function describeAudioTracks(audios) {
    if (!audios || !audios.length) {
      return Lampa.Lang.translate("torrent_parser_voice");
    }
    var voiceLabels = [];
    audios.forEach(function (audio) {
      if (audio.lang === "eng") {
        if (voiceLabels.indexOf("eng") === -1) {
          voiceLabels.push("eng");
        }
      } else {
        var voiceLabel = audio.author && audio.author.title || audio.type && audio.type.title || audio.lang;
        if (voiceLabel) {
          voiceLabel = voiceLabel + (audio.lang ? " (" + audio.lang + ")" : "");
          if (voiceLabels.indexOf(voiceLabel) === -1) {
            voiceLabels.push(voiceLabel);
          }
        }
      }
    });
    return voiceLabels.join(", ").replace(/[, ]+$/, "");
  }
  function getPreferredFileType() {
    return Lampa.Storage.get("dso_kinopub_filetype", "hls");
  }
  function isHlsPreferred() {
    return getPreferredFileType() === "hls";
  }
  function filterMp4Files(mp4Candidates) {
    if (!mp4Candidates || !mp4Candidates.length) {
      return [];
    }
    return mp4Candidates.filter(function (mp4File) {
      return mp4File && mp4File.url && mp4File.url.http;
    });
  }
  function filterHlsFiles(hlsCandidates) {
    if (!hlsCandidates || !hlsCandidates.length) {
      return [];
    }
    return hlsCandidates.filter(function (hlsFile) {
      return hlsFile && hlsFile.url && hlsFile.url.hls;
    });
  }
  function filterPlayableFiles(files) {
    if (isHlsPreferred()) {
      return filterHlsFiles(files);
    } else {
      return filterMp4Files(files);
    }
  }
  function selectHlsAudioTrack(hlsUrl, audioIndex) {
    if (!hlsUrl) {
      return "";
    }
    return hlsUrl.replace(/a1\.m3u8/g, "a" + (audioIndex || 1) + ".m3u8");
  }
  function getStreamUrl(file, audioIndex) {
    if (!file || !file.url) {
      return "";
    }
    if (isHlsPreferred()) {
      return selectHlsAudioTrack(file.url.hls, audioIndex || 1);
    }
    return file.url.http || "";
  }
  function getVoiceId(audio) {
    var voiceId = audio.author && audio.author.id || audio.type && audio.type.id;
    if (voiceId == null) {
      if (audio.lang === "eng") {
        return 6;
      } else {
        return 1;
      }
    }
    return voiceId;
  }
  function getVoiceLabel(audio) {
    var voiceTitle = audio.author && audio.author.title || audio.type && audio.type.title;
    if (!voiceTitle) {
      if (audio.lang === "eng") {
        return "Оригинал";
      } else {
        return "По умолчанию";
      }
    }
    return voiceTitle + (audio.codec ? " (" + audio.codec + ")" : "");
  }
  function getTranslationLabel(audio) {
    var typeLabel = audio.type && audio.type.title || audio.lang || "Оригинал";
    var authorTitle = audio.author && audio.author.title;
    if (authorTitle) {
      return typeLabel + " (" + authorTitle + ")";
    }
    return typeLabel;
  }
  function formatQualityLabel(quality, codecLabel) {
    var qualityText = quality ? (parseInt(quality, 10) || quality) + "p" : "";
    if (codecLabel) {
      return codecLabel + (qualityText ? " " + qualityText : "");
    } else {
      return qualityText;
    }
  }
  function buildMovieSubtitleLine(movie, maxTaglineLength) {
    var parts = [];
    if (movie.release_date) {
      var parsedDate = Lampa.Utils.parseTime(movie.release_date);
      parts.push(parsedDate.full || parsedDate.month || ("" + movie.release_date).slice(0, 4));
    }
    if (movie.tagline) {
      var tagline = ("" + movie.tagline).replace(/^[«"'„"]+|[»"'"]+$/g, "").trim();
      if (tagline.length > maxTaglineLength) {
        tagline = tagline.substring(0, maxTaglineLength - 1) + "…";
      }
      if (tagline) {
        parts.push("«" + tagline + "»");
      }
    }
    return parts.join(" • ");
  }
  function resolveVoiceIndex(audios, voiceChoice) {
    if (!audios || !audios.length) {
      return 1;
    }
    if (voiceChoice.voice_id == 1) {
      return 1;
    }
    for (var audioIdx = 0; audioIdx < audios.length; audioIdx++) {
      var audioTrack = audios[audioIdx];
      var audioVoiceId = getVoiceId(audioTrack);
      if (audioVoiceId == voiceChoice.voice_id && (!voiceChoice.voice_codec || voiceChoice.voice_codec === audioTrack.codec)) {
        return audioTrack.index;
      }
      if (voiceChoice.voice_id == 6 && audioTrack.lang === "eng") {
        return audioTrack.index;
      }
    }
    return audios[0].index || 1;
  }
  function buildSubtitlesInfo(subtitles, mediaId) {
    var subtitleList = [];
    if (subtitles && subtitles.length) {
      subtitles.forEach(function (subtitle, subtitleIndex) {
        if (subtitle && subtitle.url) {
          subtitleList.push({
            index: subtitleIndex,
            label: subtitle.lang || "sub" + subtitleIndex,
            url: subtitle.url
          });
        }
      });
    }
    return {
      subtitles: subtitleList.length ? subtitleList : null,
      subtitles_call: subtitleList.length ? null : mediaId ? buildMediaLinksUrl(mediaId) : null
    };
  }
  function buildMediaLinksUrl(mediaId) {
    return buildApiUrl("/v1/items/media-links?mid=" + mediaId + "&access_token=" + encodeURIComponent(getAccessToken()));
  }
  function normalizeSubtitles(rawSubtitles) {
    if (!rawSubtitles || !rawSubtitles.length) {
      return [];
    }
    return rawSubtitles.map(function (rawSubtitle, rawSubtitleIndex) {
      return {
        index: typeof rawSubtitle.index !== "undefined" ? rawSubtitle.index : rawSubtitleIndex,
        label: rawSubtitle.label || rawSubtitle.lang || "sub" + rawSubtitleIndex,
        url: rawSubtitle.url
      };
    }).filter(function (subtitleEntry) {
      return !!subtitleEntry.url;
    });
  }
  function loadSubtitlesFromUrl(subtitlesUrl) {
    if (!subtitlesUrl) {
      return;
    }
    var request = new Lampa.Reguest();
    request.timeout(8000);
    request.silent(subtitlesUrl, function (response) {
      var responseSubtitles = response && response.subtitles ? response.subtitles : Array.isArray(response) ? response : [];
      var subtitles = normalizeSubtitles(responseSubtitles);
      if (subtitles.length) {
        Lampa.Player.subtitles(subtitles);
      }
    });
  }
  function applySubtitles(stream) {
    if (stream.subtitles && stream.subtitles.length) {
      Lampa.Player.subtitles(stream.subtitles);
    } else if (stream.subtitles_call) {
      loadSubtitlesFromUrl(stream.subtitles_call);
    }
  }
  function getAvailableQualities(qualityFiles) {
    return qualityFiles.map(function (qualityFile) {
      return extractNumber(qualityFile.quality);
    }).filter(function (qualityValue) {
      return qualityValue > 0 && qualityValue <= window.dso_kinopub.max_qualitie;
    });
  }
  function getMaxQuality(qualities) {
    if (!qualities || !qualities.length) {
      return 0;
    }
    return Math.max.apply(null, qualities);
  }
  function findFileByQuality(files, wantedQuality) {
    var matchedFile = findInArray(files, function (fileCandidate) {
      return extractNumber(fileCandidate.quality) === wantedQuality;
    });
    return matchedFile || files[0];
  }
  function collectSeasonVoices(season) {
    var voices = [];
    var seenVoices = {};
    if (!season || !season.episodes || !season.episodes.length || !season.episodes[0].audios) {
      return voices;
    }
    season.episodes[0].audios.forEach(function (audio) {
      var audioLabel = getVoiceLabel(audio);
      var voiceDedupKey = audioLabel + ":" + (audio.codec || "");
      if (seenVoices[voiceDedupKey]) {
        return;
      }
      seenVoices[voiceDedupKey] = true;
      voices.push({
        label: audioLabel,
        voice_id: getVoiceId(audio),
        codec: audio.codec || "",
        index: audio.index
      });
    });
    return voices;
  }
  if (!window.dso_kinopub) {
    window.dso_kinopub = {
      max_qualitie: 2160,
      is_max_qualitie: false
    };
  }

  function KinopubOnlineSource(component, initialObject) {
    var request = new Lampa.Reguest();
    var playlistByTranslation = {};
    var itemResponse = [];
    var currentObject = initialObject;
    var similarsMode;
    var filterItems = {};
    var isSerial = false;
    var choice = {
      season: 0,
      voice: 0,
      voice_name: "",
      voice_id: 1,
      voice_codec: ""
    };
    this.search = function (searchObject, searchResults) {
      if (similarsMode) {
        this.find(searchResults[0].id);
      }
    };
    function normalizeTitle(titleValue) {
      return (titleValue || "").toLowerCase().replace(/[^a-zа-я0-9]/g, "");
    }
    function getDisplayTitle() {
      return currentObject.movie.title || currentObject.movie.name || currentObject.movie.original_title || currentObject.movie.original_name || currentObject.search || "";
    }
    function mapSimilarItems(rawItems) {
      return rawItems.map(function (rawItem) {
        var similarPosterUrl = "";
        if (rawItem.posters) {
          var posterKeys = Object.keys(rawItem.posters);
          if (posterKeys.length > 1) {
            similarPosterUrl = rawItem.posters[posterKeys[1]];
          } else if (posterKeys.length) {
            similarPosterUrl = rawItem.posters[posterKeys[0]];
          }
        }
        var similarItem = {
          id: rawItem.id,
          title: rawItem.title,
          ru_title: rawItem.title,
          orig_title: rawItem.title,
          year: rawItem.year,
          voice: rawItem.voice || "",
          categories: rawItem.voice ? [rawItem.voice] : [],
          posters: similarPosterUrl ? {
            medium: similarPosterUrl
          } : null
        };
        return similarItem;
      });
    }
    function matchItemId(candidates, wantedTitle, wantedYear, wantedKinopoiskId, wantedImdbId) {
      var matchedId = 0;
      var titleMatches = [];
      var normalizedWantedTitle = normalizeTitle(wantedTitle);
      candidates.forEach(function (candidate) {
        if (candidate.kinopoisk > 0 && candidate.kinopoisk == wantedKinopoiskId || "tt" + candidate.imdb == wantedImdbId) {
          if (candidate.type != "3d") {
            matchedId = candidate.id;
          }
        } else if (candidate.year == wantedYear || candidate.year == wantedYear - 1 || candidate.year == wantedYear + 1) {
          var candidateTitle = normalizeTitle(candidate.title);
          if (normalizedWantedTitle && candidateTitle.indexOf(normalizedWantedTitle) === 0 || normalizedWantedTitle && candidateTitle.lastIndexOf(normalizedWantedTitle) === candidateTitle.length - normalizedWantedTitle.length) {
            titleMatches.push(candidate.id);
          }
        }
      });
      if (titleMatches.length == 1 && matchedId == 0) {
        matchedId = titleMatches[0];
      }
      return matchedId;
    }
    function searchItems(searchText, searchDone) {
      var searchToken = getAccessToken();
      if (!searchToken) {
        component.doesNotAnswer();
        return;
      }
      var searchUrl = buildApiUrl("/v1/items/search?q=" + encodeURIComponent(searchText) + "&access_token=" + encodeURIComponent(searchToken) + "&field=title&perpage=200");
      request.clear();
      request.timeout(10000);
      request.silent(searchUrl, function (searchItemsResponse) {
        searchDone(searchItemsResponse && searchItemsResponse.items ? searchItemsResponse.items : []);
      }, function () {
        searchDone([]);
      });
    }
    this.searchByTitle = function (searchContext, fallbackTitle) {
      var self = this;
      currentObject = searchContext;
      var titleSearchToken = getAccessToken();
      if (!titleSearchToken) {
        component.empty(Lampa.Lang.translate("dso_kinopub_nodevice"));
        return;
      }
      var movieYear = parseInt((currentObject.movie.release_date || currentObject.movie.first_air_date || "0000").slice(0, 4));
      var originalTitle = currentObject.movie.original_name || currentObject.movie.original_title || fallbackTitle;
      var kinopoiskId = currentObject.movie.kinopoisk_id || currentObject.movie.kinopoisk || 0;
      var imdbId = currentObject.movie.imdb_id || "";
      if (imdbId && imdbId.indexOf("tt") !== 0) {
        imdbId = "tt" + imdbId;
      }
      function handleSearchResults(foundCandidates) {
        if (!foundCandidates.length) {
          component.doesNotAnswer();
          return;
        }
        var resolvedItemId = matchItemId(foundCandidates, originalTitle || fallbackTitle, movieYear, kinopoiskId, imdbId);
        if (resolvedItemId) {
          self.find(resolvedItemId);
        } else {
          similarsMode = true;
          component.similars(mapSimilarItems(foundCandidates));
          component.loading(false);
        }
      }
      searchItems(originalTitle, function (primaryResults) {
        if (primaryResults.length) {
          handleSearchResults(primaryResults);
        } else {
          searchItems(fallbackTitle, handleSearchResults);
        }
      });
    };
    this.find = function (findItemId) {
      var findToken = getAccessToken();
      if (!findToken) {
        component.empty(Lampa.Lang.translate("dso_kinopub_nodevice"));
        return;
      }
      if (!window.dso_kinopub.is_max_qualitie) {
        window.dso_kinopub.is_max_qualitie = true;
        resetMaxQuality();
      }
      request.clear();
      request.timeout(10000);
      request.silent(buildApiUrl("/v1/items/" + findItemId + "?access_token=" + encodeURIComponent(findToken)), function (findResponse) {
        if (findResponse && hasPlayableContent(findResponse)) {
          buildFromResponse(findResponse);
          component.loading(false);
        } else if (findResponse && findResponse.item) {
          component.empty(Lampa.Lang.translate("online_nostreams"));
        } else {
          component.doesNotAnswer();
        }
      }, function () {
        component.doesNotAnswer();
      });
    };
    this.extendChoice = function (savedChoice) {
      Lampa.Arrays.extend(choice, savedChoice, true);
    };
    this.reset = function () {
      component.reset();
      choice = {
        season: 0,
        voice: 0,
        voice_name: "",
        voice_id: 1,
        voice_codec: ""
      };
      buildPlaylists(itemResponse);
      updateComponentFilter();
      drawItems(buildDisplayItems());
      component.saveChoice(choice);
    };
    this.filter = function (filterType, filterElement, filterSelected) {
      choice[filterElement.stype] = filterSelected.index;
      rebuildFilterItems();
      if (filterElement.stype == "voice" && filterItems.voice_info[filterSelected.index]) {
        choice.voice_name = filterItems.voice[filterSelected.index];
        choice.voice_id = filterItems.voice_info[filterSelected.index].voice_id || filterItems.voice_info[filterSelected.index].id;
        choice.voice_codec = filterItems.voice_info[filterSelected.index].codec || "";
      }
      component.reset();
      buildPlaylists(itemResponse);
      updateComponentFilter();
      drawItems(buildDisplayItems());
      component.saveChoice(choice);
    };
    this.destroy = function () {
      request.clear();
      itemResponse = null;
    };
    function buildFromResponse(loadedResponse) {
      itemResponse = loadedResponse;
      isSerial = !!loadedResponse.item && !!loadedResponse.item.seasons && !!loadedResponse.item.seasons.length;
      rebuildFilterItems();
      if (filterItems.voice_info[choice.voice]) {
        choice.voice_id = filterItems.voice_info[choice.voice].voice_id || filterItems.voice_info[choice.voice].id;
        choice.voice_codec = filterItems.voice_info[choice.voice].codec || "";
        choice.voice_name = filterItems.voice[choice.voice] || choice.voice_name;
      }
      buildPlaylists(loadedResponse);
      updateComponentFilter();
      var builtItems = buildDisplayItems();
      if (!builtItems.length) {
        component.doesNotAnswer();
        return;
      }
      drawItems(builtItems);
    }
    function getVoiceChoice() {
      var voiceChoice = {
        voice_id: choice.voice_id || 1,
        voice_codec: choice.voice_codec || ""
      };
      return voiceChoice;
    }
    function rebuildFilterItems() {
      filterItems = {
        season: [],
        voice: [],
        voice_info: []
      };
      if (isSerial && itemResponse.item && itemResponse.item.seasons) {
        itemResponse.item.seasons.forEach(function (filterSeason) {
          filterItems.season.push(Lampa.Lang.translate("torrent_serial_season") + " " + filterSeason.number);
        });
        var activeSeason = itemResponse.item.seasons[choice.season] || itemResponse.item.seasons[0];
        var seasonVoices = collectSeasonVoices(activeSeason);
        seasonVoices.forEach(function (seasonVoice, voiceIdx) {
          filterItems.voice.push(seasonVoice.label);
          filterItems.voice_info.push({
            id: voiceIdx + 1,
            voice_id: seasonVoice.voice_id,
            codec: seasonVoice.codec,
            index: seasonVoice.index
          });
        });
      }
      if (choice.voice >= filterItems.voice.length) {
        choice.voice = 0;
      }
    }
    function buildPlaylists(sourceResponse) {
      playlistByTranslation = {};
      isSerial = false;
      var sourceItem = sourceResponse.item;
      if (!sourceItem) {
        return;
      }
      if (sourceItem.seasons && sourceItem.seasons.length) {
        isSerial = true;
        var serialTranslationId = 1;
        var activeVoiceChoice = getVoiceChoice();
        sourceItem.seasons.forEach(function (playlistSeason) {
          var seasonEpisodes = [];
          playlistSeason.episodes.forEach(function (episodeData) {
            var episodeFiles = filterPlayableFiles(episodeData.files);
            if (!episodeFiles.length) {
              return;
            }
            var episodeVoiceIndex = resolveVoiceIndex(episodeData.audios, activeVoiceChoice);
            var episodeQualities = getAvailableQualities(episodeFiles);
            if (!episodeQualities.length) {
              return;
            }
            var episodeBestQuality = getMaxQuality(episodeQualities);
            var episodeBestFile = findFileByQuality(episodeFiles, episodeBestQuality);
            var episodeSubtitles = buildSubtitlesInfo(episodeData.subtitles, episodeData.id);
            seasonEpisodes.push({
              id: playlistSeason.number + "_" + episodeData.number,
              comment: episodeData.number + " " + Lampa.Lang.translate("torrent_serial_episode"),
              title: episodeData.title || "",
              file: getStreamUrl(episodeBestFile, episodeVoiceIndex),
              files: episodeFiles,
              episode: episodeData.number,
              season: playlistSeason.number,
              quality: episodeBestQuality,
              qualities: episodeQualities,
              translation: serialTranslationId,
              voice_index: episodeVoiceIndex,
              voice_name: getVoiceLabel(findInArray(episodeData.audios || [], function (audioByIndex) {
                return audioByIndex.index == episodeVoiceIndex;
              }) || (episodeData.audios || [])[0]),
              mid: episodeData.id,
              subtitles: episodeSubtitles.subtitles,
              subtitles_call: episodeSubtitles.subtitles_call
            });
          });
          if (!playlistByTranslation[serialTranslationId]) {
            playlistByTranslation[serialTranslationId] = {
              json: [],
              file: ""
            };
          }
          playlistByTranslation[serialTranslationId].json.push({
            id: playlistSeason.number,
            comment: playlistSeason.number + " " + Lampa.Lang.translate("torrent_serial_season"),
            folder: seasonEpisodes,
            translation: serialTranslationId
          });
        });
      } else if (sourceItem.videos && sourceItem.videos.length) {
        if (isHlsPreferred() && sourceItem.videos[0].audios && sourceItem.videos[0].audios.length) {
          var movieVideo = sourceItem.videos[0];
          var movieFiles = filterPlayableFiles(movieVideo.files);
          if (!movieFiles.length) {
            return;
          }
          movieVideo.audios.forEach(function (movieAudio, movieAudioIdx) {
            var movieTranslationKey = movieAudioIdx + 1;
            var movieQualities = getAvailableQualities(movieFiles);
            if (!movieQualities.length) {
              return;
            }
            var movieBestQuality = getMaxQuality(movieQualities);
            var movieBestFile = findFileByQuality(movieFiles, movieBestQuality);
            var movieSubtitles = buildSubtitlesInfo(movieVideo.subtitles, movieVideo.id);
            playlistByTranslation[movieTranslationKey] = {
              file: getStreamUrl(movieBestFile, movieAudio.index),
              files: movieFiles,
              translation: getTranslationLabel(movieAudio),
              quality: movieBestQuality,
              qualities: movieQualities,
              voice_index: movieAudio.index,
              codec: movieAudio.codec || "",
              mid: movieVideo.id,
              subtitles: movieSubtitles.subtitles,
              subtitles_call: movieSubtitles.subtitles_call
            };
          });
        } else {
          var videoCount = 0;
          sourceItem.videos.forEach(function (videoEntry) {
            var videoFiles = filterPlayableFiles(videoEntry.files);
            if (!videoFiles.length) {
              return;
            }
            ++videoCount;
            var videoQualities = getAvailableQualities(videoFiles);
            if (!videoQualities.length) {
              return;
            }
            var videoBestQuality = getMaxQuality(videoQualities);
            var videoBestFile = findFileByQuality(videoFiles, videoBestQuality);
            var videoFirstAudio = videoEntry.audios && videoEntry.audios[0] || null;
            var videoTranslationLabel = videoFirstAudio ? getTranslationLabel(videoFirstAudio) : describeAudioTracks(videoEntry.audios);
            var videoSubtitles = buildSubtitlesInfo(videoEntry.subtitles, videoEntry.id);
            playlistByTranslation[videoCount] = {
              file: getStreamUrl(videoBestFile, videoFirstAudio && videoFirstAudio.index || 1),
              files: videoFiles,
              translation: videoTranslationLabel || videoEntry.title || "#" + videoCount,
              quality: videoBestQuality,
              qualities: videoQualities,
              voice_index: videoFirstAudio && videoFirstAudio.index || 1,
              codec: videoFirstAudio && videoFirstAudio.codec || "",
              mid: videoEntry.id,
              subtitles: videoSubtitles.subtitles,
              subtitles_call: videoSubtitles.subtitles_call
            };
          });
        }
      }
    }
    function resolveStream(playElement, wantedQualityRaw) {
      var translationPlaylist = playlistByTranslation[playElement.translation];
      var episodeKey = playElement.season + "_" + playElement.episode;
      var streamFile = "";
      var streamFiles = [];
      var streamVoiceIndex = playElement.voice_index || 1;
      var qualityUrlMap = false;
      var streamSubtitles = playElement.subtitles || null;
      var streamSubtitlesCall = playElement.subtitles_call || null;
      if (translationPlaylist) {
        if (playElement.season) {
          for (var playlistKey in translationPlaylist.json) {
            var playlistEntry = translationPlaylist.json[playlistKey];
            if (playlistEntry.folder) {
              for (var folderKey in playlistEntry.folder) {
                var folderEpisode = playlistEntry.folder[folderKey];
                if (folderEpisode.id == episodeKey) {
                  streamFile = folderEpisode.file;
                  streamFiles = folderEpisode.files || [];
                  streamVoiceIndex = folderEpisode.voice_index || streamVoiceIndex;
                  streamSubtitles = folderEpisode.subtitles || streamSubtitles;
                  streamSubtitlesCall = folderEpisode.subtitles_call || streamSubtitlesCall;
                  break;
                }
              }
            } else if (playlistEntry.id == episodeKey) {
              streamFile = playlistEntry.file;
              streamFiles = playlistEntry.files || [];
              streamVoiceIndex = playlistEntry.voice_index || streamVoiceIndex;
              streamSubtitles = playlistEntry.subtitles || streamSubtitles;
              streamSubtitlesCall = playlistEntry.subtitles_call || streamSubtitlesCall;
              break;
            }
          }
        } else {
          streamFile = translationPlaylist.file;
          streamFiles = translationPlaylist.files || [];
          streamVoiceIndex = translationPlaylist.voice_index || streamVoiceIndex;
          streamSubtitles = translationPlaylist.subtitles || streamSubtitles;
          streamSubtitlesCall = translationPlaylist.subtitles_call || streamSubtitlesCall;
        }
      }
      wantedQualityRaw = parseInt(("" + wantedQualityRaw).replace(/\D/g, ""), 10);
      if (streamFiles.length) {
        var qualityFileMatch = findFileByQuality(streamFiles, wantedQualityRaw) || findFileByQuality(streamFiles, getMaxQuality(getAvailableQualities(streamFiles)));
        if (qualityFileMatch) {
          streamFile = getStreamUrl(qualityFileMatch, streamVoiceIndex);
        }
        qualityUrlMap = {};
        streamFiles.forEach(function (qualityCandidate) {
          var candidateQuality = extractNumber(qualityCandidate.quality);
          if (candidateQuality) {
            qualityUrlMap[candidateQuality + "p"] = getStreamUrl(qualityCandidate, streamVoiceIndex);
          }
        });
        var defaultQualityKey = Lampa.Storage.get("video_quality_default", "1080") + "p";
        if (qualityUrlMap[defaultQualityKey]) {
          streamFile = qualityUrlMap[defaultQualityKey];
        }
      }
      var resolvedStream = {
        file: streamFile,
        quality: qualityUrlMap,
        subtitles: streamSubtitles,
        subtitles_call: streamSubtitlesCall
      };
      return resolvedStream;
    }
    function updateComponentFilter() {
      rebuildFilterItems();
      if (choice.voice_name) {
        var savedVoiceIdx = filterItems.voice.map(function (voiceOption) {
          return voiceOption.toLowerCase();
        }).indexOf(choice.voice_name.toLowerCase());
        if (savedVoiceIdx == -1) {
          choice.voice = 0;
        } else if (savedVoiceIdx !== choice.voice) {
          choice.voice = savedVoiceIdx;
        }
      }
      if (filterItems.voice_info[choice.voice]) {
        choice.voice_id = filterItems.voice_info[choice.voice].voice_id || filterItems.voice_info[choice.voice].id;
        choice.voice_codec = filterItems.voice_info[choice.voice].codec || "";
        choice.voice_name = filterItems.voice[choice.voice] || choice.voice_name;
      }
      component.filter(filterItems, choice);
    }
    function buildDisplayItems() {
      var displayItems = [];
      if (isSerial) {
        for (var serialPlaylistKey in playlistByTranslation) {
          var serialPlaylist = playlistByTranslation[serialPlaylistKey];
          for (var serialSeasonIdx in serialPlaylist.json) {
            var serialSeasonEntry = serialPlaylist.json[serialSeasonIdx];
            var activeSeasonNumber = itemResponse.item.seasons[choice.season] ? itemResponse.item.seasons[choice.season].number : choice.season + 1;
            if (serialSeasonEntry.id == activeSeasonNumber) {
              serialSeasonEntry.folder.forEach(function (displayEpisode) {
                displayItems.push({
                  episode: parseInt(displayEpisode.episode),
                  season: displayEpisode.season,
                  title: Lampa.Lang.translate("torrent_serial_episode") + " " + displayEpisode.episode + (displayEpisode.title ? " - " + displayEpisode.title : ""),
                  quality: displayEpisode.quality + "p ",
                  translation: displayEpisode.translation,
                  voice_index: displayEpisode.voice_index,
                  voice_name: displayEpisode.voice_name || filterItems.voice[choice.voice],
                  info: displayEpisode.voice_name || filterItems.voice[choice.voice],
                  mid: displayEpisode.mid,
                  subtitles: displayEpisode.subtitles,
                  subtitles_call: displayEpisode.subtitles_call
                });
              });
            }
          }
        }
      } else if (itemResponse.item && itemResponse.item.videos && itemResponse.item.videos.length) {
        for (var moviePlaylistKey in playlistByTranslation) {
          var moviePlaylist = playlistByTranslation[moviePlaylistKey];
          displayItems.push({
            title: moviePlaylist.translation,
            quality: formatQualityLabel(moviePlaylist.quality, moviePlaylist.codec) + " ",
            qualitys: moviePlaylist.qualities,
            translation: moviePlaylistKey,
            voice_index: moviePlaylist.voice_index,
            voice_name: moviePlaylist.translation,
            codec: moviePlaylist.codec || "",
            mid: moviePlaylist.mid,
            subtitles: moviePlaylist.subtitles,
            subtitles_call: moviePlaylist.subtitles_call
          });
        }
      }
      return displayItems;
    }
    function buildPlayerItem(sourceElement) {
      var elementStream = resolveStream(sourceElement, sourceElement.quality);
      var playerTitle = sourceElement.season ? sourceElement.title : getDisplayTitle() || sourceElement.title;
      var playerItem = {
        title: playerTitle,
        url: elementStream.file,
        quality: elementStream.quality,
        timeline: sourceElement.timeline,
        callback: sourceElement.mark,
        subtitles: elementStream.subtitles,
        subtitles_call: elementStream.subtitles_call,
        season: sourceElement.season,
        episode: sourceElement.episode,
        voice_name: sourceElement.voice_name,
        translate: sourceElement.voice_name
      };
      return playerItem;
    }
    function drawItems(itemsToDraw) {
      component.reset();
      component.draw(itemsToDraw, {
        similars: similarsMode,
        onEnter: function onItemEnter(enteredElement, enteredHtml) {
          var enteredStream = resolveStream(enteredElement, enteredElement.quality);
          if (enteredStream.file) {
            var playlist = [];
            var firstPlayerItem = buildPlayerItem(enteredElement);
            if (enteredElement.season) {
              itemsToDraw.forEach(function (playlistElement) {
                playlist.push(buildPlayerItem(playlistElement));
              });
            } else {
              playlist.push(firstPlayerItem);
            }
            if (playlist.length > 1) {
              firstPlayerItem.playlist = playlist;
            }
            Lampa.Player.play(firstPlayerItem);
            Lampa.Player.playlist(playlist);
            applySubtitles(firstPlayerItem);
            enteredElement.mark();
          } else {
            Lampa.Noty.show(Lampa.Lang.translate("online_nolink"));
          }
        },
        onContextMenu: function onItemContextMenu(contextElement, contextHtml, contextData, contextCallback) {
          contextCallback(resolveStream(contextElement, contextElement.quality));
        }
      });
    }
  }

  function createComponentParts(componentObject) {
    return {
      network: new Lampa.Reguest(),
      scroll: new Lampa.Scroll({
        mask: true,
        over: true
      }),
      files: new Lampa.Explorer(componentObject),
      filter: new Lampa.Filter(componentObject)
    };
  }

  function OnlineComponent(object) {
    var parts = createComponentParts(object);
    var network = parts.network;
    var scroll = parts.scroll;
    var explorer = parts.files;
    var filter = parts.filter;
    var sources = {
      dso_kinopub: KinopubOnlineSource
    };
    var lastFocused;
    var choiceExtended;
    var overrideMovieId;
    var source;
    var balanserName = "dso_kinopub";
    var componentStarted;
    var focusTimer;
    var loadedImages = [];
    function filterLabel(labelKey) {
      if (labelKey === "voice") return Lampa.Lang.translate("torrent_parser_voice");
      if (labelKey === "season") return Lampa.Lang.translate("torrent_serial_season");
      if (labelKey === "source") return Lampa.Lang.translate("settings_rest_source");
      return "";
    }
    this.initialize = function () {
      var self = this;
      source = this.createSource();
      filter.onSearch = function (searchValue) {
        var replaceParams = {
          search: searchValue,
          clarification: true
        };
        Lampa.Activity.replace(replaceParams);
      };
      filter.onBack = function () {
        self.start();
      };
      filter.render().on("hover:enter", ".selector", function () {
        clearInterval(focusTimer);
      });
      filter.onSelect = function (selectType, selectElement, selectItem) {
        Lampa.Select.close();
        if (selectType == "filter") {
          if (selectElement.reset) {
            if (choiceExtended) {
              source.reset();
            } else {
              self.start();
            }
          } else {
            source.filter(selectType, selectElement, selectItem);
          }
        }
      };
      if (filter.addButtonBack) {
        filter.addButtonBack();
      }
      filter.render().find(".filter--sort").remove();
      explorer.appendFiles(scroll.render());
      explorer.appendHead(filter.render());
      scroll.body().addClass("torrent-list");
      scroll.minus(explorer.render().find(".explorer__files-head"));
      this.search();
    };
    this.createSource = function () {
      return new sources[balanserName](this, object);
    };
    this.create = function () {
      return this.render();
    };
    this.search = function () {
      this.activity.loader(true);
      this.find();
    };
    this.find = function () {
      var movieData = object.movie || {};
      var movieKinopubId = object.kinopub_id || movieData.kinopub_id || (movieData.source === SOURCE_ID || movieData.source === "kinopub" ? movieData.id : 0);
      if (movieKinopubId && source.find) {
        this.extendChoice();
        source.find(movieKinopubId);
        return;
      }
      if (source.searchByTitle) {
        this.extendChoice();
        source.searchByTitle(object, object.search || object.movie.original_title || object.movie.original_name || object.movie.title || object.movie.name);
      }
    };
    this.getChoice = function (choiceBalanser) {
      var choiceCache = Lampa.Storage.cache("online_choice_" + (choiceBalanser || balanserName), 3000, {});
      var movieChoice = choiceCache[overrideMovieId || object.movie.id] || {};
      Lampa.Arrays.extend(movieChoice, {
        season: 0,
        voice: 0,
        voice_name: "",
        voice_id: 1,
        voice_codec: "",
        episodes_view: {},
        movie_view: ""
      });
      return movieChoice;
    };
    this.extendChoice = function () {
      choiceExtended = true;
      source.extendChoice(this.getChoice());
    };
    this.saveChoice = function (choiceToSave, saveBalanser) {
      var saveCache = Lampa.Storage.cache("online_choice_" + (saveBalanser || balanserName), 3000, {});
      saveCache[overrideMovieId || object.movie.id] = choiceToSave;
      Lampa.Storage.set("online_choice_" + (saveBalanser || balanserName), saveCache);
    };
    this.similars = function (similarItems) {
      var self = this;
      similarItems.forEach(function (similarEntry) {
        var similarInfoParts = [];
        var similarYear = ((similarEntry.start_date || similarEntry.year || "") + "").slice(0, 4);
        if (similarEntry.rating && similarEntry.rating !== "null" && similarEntry.filmId) {
          similarInfoParts.push(Lampa.Template.get("online_prestige_rate", {
            rate: similarEntry.rating
          }, true));
        }
        if (similarYear) {
          similarInfoParts.push(similarYear);
        }
        if (similarEntry.countries && similarEntry.countries.length) {
          similarInfoParts.push((similarEntry.filmId ? similarEntry.countries.map(function (countryEntry) {
            return countryEntry.country;
          }) : similarEntry.countries).join(", "));
        }
        if (similarEntry.categories && similarEntry.categories.length) {
          similarInfoParts.push(similarEntry.categories.slice(0, 4).join(", "));
        }
        var similarTitle = similarEntry.title || similarEntry.ru_title || similarEntry.en_title || similarEntry.nameRu || similarEntry.nameEn;
        var similarOrigTitle = similarEntry.orig_title || similarEntry.nameEn || "";
        similarEntry.title = similarTitle + (similarOrigTitle && similarOrigTitle !== similarTitle ? " / " + similarOrigTitle : "");
        similarEntry.time = similarEntry.filmLength || "";
        similarEntry.info = similarInfoParts.join("<span class=\"online-prestige-split\">●</span>");
        var similarHtml = Lampa.Template.get("online_prestige_folder", similarEntry);
        similarHtml.on("hover:enter", function () {
          self.activity.loader(true);
          self.reset();
          object.search_date = similarYear;
          overrideMovieId = similarEntry.id;
          self.extendChoice();
          if (source.search) {
            source.search(object, [similarEntry]);
          } else {
            self.doesNotAnswer();
          }
        }).on("hover:focus", function (focusEvent) {
          lastFocused = focusEvent.target;
          scroll.update($(focusEvent.target), true);
        });
        scroll.append(similarHtml);
      });
    };
    this.clearImages = function () {
      loadedImages.forEach(function (loadedImage) {
        loadedImage.onerror = function () {};
        loadedImage.onload = function () {};
        loadedImage.src = "";
      });
      loadedImages = [];
    };
    this.reset = function () {
      lastFocused = false;
      clearInterval(focusTimer);
      network.clear();
      this.clearImages();
      scroll.render().find(".empty").remove();
      scroll.clear();
    };
    this.loading = function (loaderVisible) {
      if (loaderVisible) {
        this.activity.loader(true);
      } else {
        this.activity.loader(false);
        this.activity.toggle();
      }
    };
    this.filter = function (componentFilterItems, componentChoice) {
      var self = this;
      var filterSelection = [];
      var appendFilterBlock = function appendFilterBlockFn(filterKey, filterTitle) {
        var currentChoice = self.getChoice();
        var filterValues = componentFilterItems[filterKey];
        var filterSubItems = [];
        var selectedIdx = currentChoice[filterKey];
        filterValues.forEach(function (filterValue, filterValueIdx) {
          var filterSubItem = {
            title: filterValue,
            selected: selectedIdx == filterValueIdx,
            index: filterValueIdx
          };
          filterSubItems.push(filterSubItem);
        });
        var filterBlock = {
          title: filterTitle,
          subtitle: filterValues[selectedIdx],
          items: filterSubItems,
          stype: filterKey
        };
        filterSelection.push(filterBlock);
      };
      filterSelection.push({
        title: Lampa.Lang.translate("torrent_parser_reset"),
        reset: true
      });
      this.saveChoice(componentChoice);
      if (componentFilterItems.voice && componentFilterItems.voice.length) {
        appendFilterBlock("voice", Lampa.Lang.translate("torrent_parser_voice"));
      }
      if (componentFilterItems.season && componentFilterItems.season.length) {
        appendFilterBlock("season", Lampa.Lang.translate("torrent_serial_season"));
      }
      filter.set("filter", filterSelection);
      this.selected(componentFilterItems);
    };
    this.closeFilter = function () {
      if ($("body").hasClass("selectbox--open")) {
        Lampa.Select.close();
      }
    };
    this.selected = function (selectedFilterItems) {
      var selectedChoice = this.getChoice();
      var chosenLabels = [];
      for (var choiceKey in selectedChoice) {
        var choiceValues = selectedFilterItems[choiceKey];
        if (!choiceValues || !choiceValues.length) continue;
        if (choiceKey === "source") continue;
        var label = filterLabel(choiceKey);
        if (!label) continue;
        var chosenValue = choiceValues[selectedChoice[choiceKey]];
        if (chosenValue === undefined) continue;
        chosenLabels.push(label + ": " + chosenValue);
      }
      filter.chosen("filter", chosenLabels);
      filter.chosen("sort", [balanserName]);
    };
    this.getEpisodes = function (seasonNumber, episodesCallback) {
      var tmdbEpisodes = [];
      var isKinopubCard = object.movie.source === SOURCE_ID || object.movie.source === "kinopub";

      var canQueryTmdb = typeof object.movie.id == "number" && object.movie.name && (!isKinopubCard || object.movie.tmdb_id);
      if (canQueryTmdb) {
        var tmdbPath = "tv/" + object.movie.id + "/season/" + seasonNumber + "?api_key=" + Lampa.TMDB.key() + "&language=" + Lampa.Storage.get("language", "ru");
        var tmdbUrl = Lampa.TMDB.api(tmdbPath);
        network.timeout(10000);
        network.native(tmdbUrl, function (tmdbResponse) {
          tmdbEpisodes = tmdbResponse.episodes || [];
          episodesCallback(tmdbEpisodes);
        }, function (tmdbError, tmdbStatus) {
          episodesCallback(tmdbEpisodes);
        });
      } else {
        episodesCallback(tmdbEpisodes);
      }
    };
    this.append = function (appendedHtml) {
      appendedHtml.on("hover:focus", function (appendFocusEvent) {
        lastFocused = appendFocusEvent.target;
        scroll.update($(appendFocusEvent.target), true);
      });
      scroll.append(appendedHtml);
    };
    this.watched = function (watchedData) {
      var watchedHash = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var watchedCache = Lampa.Storage.cache("online_watched_last", 5000, {});
      if (watchedData) {
        if (!watchedCache[watchedHash]) {
          watchedCache[watchedHash] = {};
        }
        Lampa.Arrays.extend(watchedCache[watchedHash], watchedData, true);
        Lampa.Storage.set("online_watched_last", watchedCache);
      } else {
        return watchedCache[watchedHash];
      }
    };
    this.draw = function (drawnItems) {
      var self = this;
      var drawOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!drawnItems.length) {
        return this.empty();
      }
      this.getEpisodes(drawnItems[0].season, function (loadedTmdbEpisodes) {
        var viewedList = Lampa.Storage.cache("online_view", 5000, []);
        var isSerialCard = object.movie.name ? true : false;
        var activeChoice = self.getChoice();
        var isWideScreen = window.innerWidth > 480;
        var lastViewedHtml = false;
        var lastMarkedHtml = false;
        drawnItems.forEach(function (drawElement, drawIndex) {
          var tmdbEpisode = isSerialCard && loadedTmdbEpisodes.length && !drawOptions.similars ? findInArray(loadedTmdbEpisodes, function (tmdbEpisodeCandidate) {
            return tmdbEpisodeCandidate.episode_number == drawElement.episode;
          }) : false;
          var episodeNumber = drawElement.episode || drawIndex + 1;
          var viewedEpisode = activeChoice.episodes_view[drawElement.season];
          var qualityLabel = drawElement.quality;
          Lampa.Arrays.extend(drawElement, {
            info: "",
            quality: "",
            time: Lampa.Utils.secondsToTime((tmdbEpisode ? tmdbEpisode.runtime : object.movie.runtime) * 60, true)
          });
          if (!isSerialCard && qualityLabel) {
            drawElement.quality = qualityLabel;
          }
          var timelineHash = Lampa.Utils.hash(drawElement.season ? [drawElement.season, drawElement.episode, object.movie.original_title].join("") : object.movie.original_title + (drawElement.voice_name || ""));
          var beholdHash = Lampa.Utils.hash(drawElement.season ? [drawElement.season, drawElement.episode, object.movie.original_title, drawElement.voice_name].join("") : object.movie.original_title + drawElement.voice_name);
          var elementHashes = {
            hash_timeline: timelineHash,
            hash_behold: beholdHash
          };
          var infoParts = [];
          if (drawElement.season) {
            drawElement.translate_episode_end = self.getLastEpisode(drawnItems);
            drawElement.translate_voice = drawElement.voice_name;
          }
          drawElement.timeline = Lampa.Timeline.view(timelineHash);
          if (tmdbEpisode) {
            drawElement.title = tmdbEpisode.name;
            if (drawElement.info.length < 30 && tmdbEpisode.vote_average) {
              infoParts.push(Lampa.Template.get("online_prestige_rate", {
                rate: parseFloat(tmdbEpisode.vote_average + "").toFixed(1)
              }, true));
            }
            if (tmdbEpisode.air_date && isWideScreen) {
              infoParts.push(Lampa.Utils.parseTime(tmdbEpisode.air_date).full);
            }
          } else if (!isSerialCard) {
            var movieSubtitleLine = buildMovieSubtitleLine(object.movie, isWideScreen ? 110 : 72);
            if (movieSubtitleLine) {
              drawElement.info = "<span>" + movieSubtitleLine + "</span>";
            }
          }
          if (drawElement.info && isSerialCard) {
            infoParts.push(drawElement.info);
          }
          if (isSerialCard && infoParts.length) {
            drawElement.info = infoParts.map(function (infoPart) {
              return "<span>" + infoPart + "</span>";
            }).join("<span class=\"online-prestige-split\">●</span>");
          }
          var elementHtml = Lampa.Template.get("online_prestige_full", drawElement);
          var elementLoader = elementHtml.find(".online-prestige__loader");
          var elementImgWrap = elementHtml.find(".online-prestige__img");
          if (!isSerialCard) {
            if (activeChoice.movie_view == beholdHash) {
              lastViewedHtml = elementHtml;
            }
          } else if (typeof viewedEpisode !== "undefined" && viewedEpisode == episodeNumber) {
            lastViewedHtml = elementHtml;
          }
          if (isSerialCard && !tmdbEpisode) {
            elementImgWrap.append("<div class=\"online-prestige__episode-number\">" + ("0" + (drawElement.episode || drawIndex + 1)).slice(-2) + "</div>");
            elementLoader.remove();
          } else {
            var elementImg = elementHtml.find("img")[0];
            elementImg.onerror = function () {
              elementImg.src = "./img/img_broken.svg";
            };
            elementImg.onload = function () {
              elementImgWrap.addClass("online-prestige__img--loaded");
              elementLoader.remove();
              if (isSerialCard) {
                elementImgWrap.append("<div class=\"online-prestige__episode-number\">" + ("0" + (drawElement.episode || drawIndex + 1)).slice(-2) + "</div>");
              }
            };
            elementImg.src = Lampa.TMDB.image("t/p/w300" + (tmdbEpisode ? tmdbEpisode.still_path : object.movie.backdrop_path));
            loadedImages.push(elementImg);
          }
          elementHtml.find(".online-prestige__timeline").append(Lampa.Timeline.render(drawElement.timeline));
          if (viewedList.indexOf(beholdHash) !== -1) {
            lastMarkedHtml = elementHtml;
            elementHtml.find(".online-prestige__img").append("<div class=\"online-prestige__viewed\">" + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
          }
          drawElement.mark = function () {
            viewedList = Lampa.Storage.cache("online_view", 5000, []);
            if (viewedList.indexOf(beholdHash) == -1) {
              viewedList.push(beholdHash);
              Lampa.Storage.set("online_view", viewedList);
              if (elementHtml.find(".online-prestige__viewed").length == 0) {
                elementHtml.find(".online-prestige__img").append("<div class=\"online-prestige__viewed\">" + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
              }
            }
            activeChoice = self.getChoice();
            if (!isSerialCard) {
              activeChoice.movie_view = beholdHash;
            } else {
              activeChoice.episodes_view[drawElement.season] = episodeNumber;
            }
            self.saveChoice(activeChoice);
            self.watched({
              balanser: balanserName,
              balanser_name: Lampa.Utils.capitalizeFirstLetter(balanserName),
              voice_id: activeChoice.voice_id,
              voice_name: activeChoice.voice_name || drawElement.voice_name,
              episode: drawElement.episode,
              season: drawElement.season
            });
          };
          drawElement.unmark = function () {
            viewedList = Lampa.Storage.cache("online_view", 5000, []);
            if (viewedList.indexOf(beholdHash) !== -1) {
              Lampa.Arrays.remove(viewedList, beholdHash);
              Lampa.Storage.set("online_view", viewedList);
              if (Lampa.Manifest.app_digital >= 177) {
                Lampa.Storage.remove("online_view", beholdHash);
              }
              elementHtml.find(".online-prestige__viewed").remove();
            }
          };
          drawElement.timeclear = function () {
            drawElement.timeline.percent = 0;
            drawElement.timeline.time = 0;
            drawElement.timeline.duration = 0;
            Lampa.Timeline.update(drawElement.timeline);
          };
          elementHtml.on("hover:enter", function () {
            if (object.movie.id) {
              Lampa.Favorite.add("history", object.movie, 100);
            }
            if (drawOptions.onEnter) {
              drawOptions.onEnter(drawElement, elementHtml, elementHashes);
            }
          }).on("hover:focus", function (elementFocusEvent) {
            lastFocused = elementFocusEvent.target;
            if (drawOptions.onFocus) {
              drawOptions.onFocus(drawElement, elementHtml, elementHashes);
            }
            scroll.update($(elementFocusEvent.target), true);
          });
          if (drawOptions.onRender) {
            drawOptions.onRender(drawElement, elementHtml, elementHashes);
          }
          self.contextMenu({
            html: elementHtml,
            element: drawElement,
            onFile: function onContextFile(contextFileCallback) {
              if (drawOptions.onContextMenu) {
                drawOptions.onContextMenu(drawElement, elementHtml, elementHashes, contextFileCallback);
              }
            },
            onClearAllMark: function onClearAllMarkFn() {
              drawnItems.forEach(function (markElement) {
                markElement.unmark();
              });
            },
            onClearAllTime: function onClearAllTimeFn() {
              drawnItems.forEach(function (timeElement) {
                timeElement.timeclear();
              });
            }
          });
          scroll.append(elementHtml);
        });
        if (isSerialCard && loadedTmdbEpisodes.length > drawnItems.length && !drawOptions.similars) {
          var upcomingEpisodes = loadedTmdbEpisodes.slice(drawnItems.length);
          upcomingEpisodes.forEach(function (upcomingEpisode) {
            var upcomingInfoParts = [];
            if (upcomingEpisode.vote_average) {
              upcomingInfoParts.push(Lampa.Template.get("online_prestige_rate", {
                rate: parseFloat(upcomingEpisode.vote_average + "").toFixed(1)
              }, true));
            }
            if (upcomingEpisode.air_date) {
              upcomingInfoParts.push(Lampa.Utils.parseTime(upcomingEpisode.air_date).full);
            }
            var airDate = new Date((upcomingEpisode.air_date + "").replace(/-/g, "/"));
            var nowMs = Date.now();
            var daysLeft = Math.round((airDate.getTime() - nowMs) / 86400000);
            var daysLeftLabel = Lampa.Lang.translate("full_episode_days_left") + ": " + daysLeft;
            var upcomingHtml = Lampa.Template.get("online_prestige_full", {
              time: Lampa.Utils.secondsToTime((upcomingEpisode ? upcomingEpisode.runtime : object.movie.runtime) * 60, true),
              info: upcomingInfoParts.length ? upcomingInfoParts.map(function (upcomingInfoPart) {
                return "<span>" + upcomingInfoPart + "</span>";
              }).join("<span class=\"online-prestige-split\">●</span>") : "",
              title: upcomingEpisode.name,
              quality: daysLeft > 0 ? daysLeftLabel : ""
            });
            var upcomingLoader = upcomingHtml.find(".online-prestige__loader");
            var upcomingImgWrap = upcomingHtml.find(".online-prestige__img");
            var upcomingSeasonNumber = drawnItems[0] ? drawnItems[0].season : 1;
            upcomingHtml.find(".online-prestige__timeline").append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([upcomingSeasonNumber, upcomingEpisode.episode_number, object.movie.original_title].join("")))));
            var upcomingImg = upcomingHtml.find("img")[0];
            if (upcomingEpisode.still_path) {
              upcomingImg.onerror = function () {
                upcomingImg.src = "./img/img_broken.svg";
              };
              upcomingImg.onload = function () {
                upcomingImgWrap.addClass("online-prestige__img--loaded");
                upcomingLoader.remove();
                upcomingImgWrap.append("<div class=\"online-prestige__episode-number\">" + ("0" + upcomingEpisode.episode_number).slice(-2) + "</div>");
              };
              upcomingImg.src = Lampa.TMDB.image("t/p/w300" + upcomingEpisode.still_path);
              loadedImages.push(upcomingImg);
            } else {
              upcomingLoader.remove();
              upcomingImgWrap.append("<div class=\"online-prestige__episode-number\">" + ("0" + upcomingEpisode.episode_number).slice(-2) + "</div>");
            }
            upcomingHtml.on("hover:focus", function (upcomingFocusEvent) {
              lastFocused = upcomingFocusEvent.target;
              scroll.update($(upcomingFocusEvent.target), true);
            });
            scroll.append(upcomingHtml);
          });
        }
        if (lastViewedHtml) {
          lastFocused = lastViewedHtml[0];
        } else if (lastMarkedHtml) {
          lastFocused = lastMarkedHtml[0];
        }
        if (Lampa.Activity.active().activity !== self.activity) {
          return;
        }
        var currentControllerState = Lampa.Controller.enabled();
        var currentControllerName = currentControllerState && currentControllerState.name;
        if (currentControllerName === "content" || currentControllerName === "settings_component") {
          Lampa.Controller.toggle("content");
        } else {
          Lampa.Controller.enable("content");
        }
      });
    };
    this.contextMenu = function (contextMenuParams) {
      contextMenuParams.html.on("hover:long", function () {
        function showContextMenu(contextStream) {
          var enabledControllerName = Lampa.Controller.enabled().name;
          var contextMenuItems = [];
          if (Lampa.Platform.is("webos")) {
            contextMenuItems.push({
              title: Lampa.Lang.translate("player_lauch") + " - Webos",
              player: "webos"
            });
          }
          if (Lampa.Platform.is("android")) {
            contextMenuItems.push({
              title: Lampa.Lang.translate("player_lauch") + " - Android",
              player: "android"
            });
          }
          contextMenuItems.push({
            title: Lampa.Lang.translate("player_lauch") + " - Lampa",
            player: "lampa"
          });
          contextMenuItems.push({
            title: Lampa.Lang.translate("online_video"),
            separator: true
          });
          contextMenuItems.push({
            title: Lampa.Lang.translate("torrent_parser_label_title"),
            mark: true
          });
          contextMenuItems.push({
            title: Lampa.Lang.translate("torrent_parser_label_cancel_title"),
            unmark: true
          });
          contextMenuItems.push({
            title: Lampa.Lang.translate("time_reset"),
            timeclear: true
          });
          if (contextStream) {
            contextMenuItems.push({
              title: Lampa.Lang.translate("copy_link"),
              copylink: true
            });
          }
          contextMenuItems.push({
            title: Lampa.Lang.translate("more"),
            separator: true
          });
          if (Lampa.Account.permit.access() && contextMenuParams.element && typeof contextMenuParams.element.season !== "undefined" && contextMenuParams.element.translate_voice) {
            contextMenuItems.push({
              title: Lampa.Lang.translate("online_voice_subscribe"),
              subscribe: true
            });
          }
          contextMenuItems.push({
            title: Lampa.Lang.translate("online_clear_all_marks"),
            clearallmark: true
          });
          contextMenuItems.push({
            title: Lampa.Lang.translate("online_clear_all_timecodes"),
            timeclearall: true
          });
          Lampa.Select.show({
            title: Lampa.Lang.translate("title_action"),
            items: contextMenuItems,
            onBack: function onContextBack() {
              Lampa.Controller.toggle(enabledControllerName);
            },
            onSelect: function onContextSelect(contextAction) {
              if (contextAction.mark) {
                contextMenuParams.element.mark();
              }
              if (contextAction.unmark) {
                contextMenuParams.element.unmark();
              }
              if (contextAction.timeclear) {
                contextMenuParams.element.timeclear();
              }
              if (contextAction.clearallmark) {
                contextMenuParams.onClearAllMark();
              }
              if (contextAction.timeclearall) {
                contextMenuParams.onClearAllTime();
              }
              Lampa.Controller.toggle(enabledControllerName);
              if (contextAction.player) {
                Lampa.Player.runas(contextAction.player);
                contextMenuParams.html.trigger("hover:enter");
              }
              if (contextAction.copylink) {
                if (contextStream.quality) {
                  var qualityLinks = [];
                  for (var qualityKey in contextStream.quality) {
                    var qualityLink = {
                      title: qualityKey,
                      file: contextStream.quality[qualityKey]
                    };
                    qualityLinks.push(qualityLink);
                  }
                  Lampa.Select.show({
                    title: Lampa.Lang.translate("settings_server_links"),
                    items: qualityLinks,
                    onBack: function onLinksBack() {
                      Lampa.Controller.toggle(enabledControllerName);
                    },
                    onSelect: function onLinkSelect(chosenLink) {
                      Lampa.Utils.copyTextToClipboard(chosenLink.file, function () {
                        Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
                      }, function () {
                        Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
                      });
                    }
                  });
                } else {
                  Lampa.Utils.copyTextToClipboard(contextStream.file, function () {
                    Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
                  });
                }
              }
              if (contextAction.subscribe) {
                var subscribeData = {
                  card: object.movie,
                  season: contextMenuParams.element.season,
                  episode: contextMenuParams.element.translate_episode_end,
                  voice: contextMenuParams.element.translate_voice
                };
                Lampa.Account.subscribeToTranslation(subscribeData, function () {
                  Lampa.Noty.show(Lampa.Lang.translate("online_voice_success"));
                }, function () {
                  Lampa.Noty.show(Lampa.Lang.translate("online_voice_error"));
                });
              }
            }
          });
        }
        contextMenuParams.onFile(showContextMenu);
      }).on("hover:focus", function () {
        if (Lampa.Helper) {
          Lampa.Helper.show("online_file", Lampa.Lang.translate("helper_online_file"), contextMenuParams.html);
        }
      });
    };
    this.empty = function (emptyMessage) {
      var emptyHtml = Lampa.Template.get("online_does_not_answer", {});
      emptyHtml.find(".online-empty__buttons").remove();
      emptyHtml.find(".online-empty__title").text(emptyMessage || Lampa.Lang.translate("empty_title_two"));
      scroll.append(emptyHtml);
      this.loading(false);
    };
    this.doesNotAnswer = function () {
      this.reset();
      var answerTemplateData = {
        balanser: balanserName
      };
      var answerHtml = Lampa.Template.get("online_does_not_answer", answerTemplateData);
      scroll.append(answerHtml);
      this.loading(false);
    };
    this.getLastEpisode = function (episodeElements) {
      var lastEpisodeNumber = 0;
      episodeElements.forEach(function (episodeElement) {
        if (typeof episodeElement.episode !== "undefined") {
          lastEpisodeNumber = Math.max(lastEpisodeNumber, parseInt(episodeElement.episode));
        }
      });
      return lastEpisodeNumber;
    };
    this.start = function () {
      if (Lampa.Activity.active().activity !== this.activity) {
        return;
      }
      if (!componentStarted) {
        componentStarted = true;
        this.initialize();
      }
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
      Lampa.Controller.add("content", {
        toggle: function onToggle() {
          Lampa.Controller.collectionSet(scroll.render(), explorer.render());
          Lampa.Controller.collectionFocus(lastFocused || false, scroll.render());
        },
        up: function onUp() {
          if (Navigator.canmove("up")) {
            Navigator.move("up");
          } else {
            Lampa.Controller.toggle("head");
          }
        },
        down: function onDown() {
          Navigator.move("down");
        },
        right: function onRight() {
          if (Navigator.canmove("right")) {
            Navigator.move("right");
          } else {
            filter.show(Lampa.Lang.translate("title_filter"), "filter");
          }
        },
        left: function onLeft() {
          if (Navigator.canmove("left")) {
            Navigator.move("left");
          } else {
            Lampa.Controller.toggle("menu");
          }
        },
        gone: function onGone() {
          clearInterval(focusTimer);
        },
        back: this.back
      });
      Lampa.Controller.toggle("content");
    };
    this.render = function () {
      return explorer.render();
    };
    this.back = function () {
      Lampa.Activity.backward();
    };
    this.pause = function () {};
    this.stop = function () {};
    this.destroy = function () {
      network.clear();
      this.clearImages();
      explorer.destroy();
      scroll.destroy();
      clearInterval(focusTimer);
      if (source && source.destroy) {
        source.destroy();
      }
    };
  }

  function startPlugin() {
    console.log(PLUGIN_NAME, "v" + PLUGIN_VERSION);
    var manifest = {
      type: "video",
      version: PLUGIN_VERSION,
      name: "DSO KinoPub",
      description: "Каталог и онлайн KinoPub: источник контента + просмотр",
      component: "online_dso_kinopub",
      onContextMenu: function onCardContextMenu(contextCard) {
        return {
          name: Lampa.Lang.translate("online_watch"),
          description: ""
        };
      },
      onContextLauch: function onCardContextLaunch(launchCard) {
        registerOnlineTemplates();
        Lampa.Component.add("online_dso_kinopub", OnlineComponent);
        var launchKinopubId = launchCard.kinopub_id || (launchCard.source === SOURCE_ID || launchCard.source === "kinopub" ? launchCard.id : 0);
        Lampa.Activity.push({
          url: "",
          title: Lampa.Lang.translate("title_online"),
          component: "online_dso_kinopub",
          search: launchCard.title || launchCard.name,
          search_one: launchCard.title || launchCard.name,
          search_two: launchCard.original_title || launchCard.original_name,
          movie: launchCard,
          kinopub_id: launchKinopubId || undefined,
          page: 1
        });
      }
    };
    if (Array.isArray(Lampa.Manifest.plugins)) {
      var __dsoManifestExists = Lampa.Manifest.plugins.some(function (__dsoManifestEntry) {
        return __dsoManifestEntry && __dsoManifestEntry.name === manifest.name;
      });
      if (!__dsoManifestExists) {
        Lampa.Manifest.plugins.push(manifest);
      }
    } else {
      Lampa.Manifest.plugins = manifest;
    }
    Lampa.Lang.add({
      online_watch: {
        ru: "Смотреть онлайн",
        en: "Watch online",
        ua: "Дивитися онлайн",
        zh: "在线观看"
      },
      online_video: {
        ru: "Видео",
        en: "Video",
        ua: "Відео",
        zh: "视频"
      },
      online_nolink: {
        ru: "Не удалось извлечь ссылку",
        uk: "Неможливо отримати посилання",
        en: "Failed to fetch link",
        zh: "获取链接失败"
      },
      helper_online_file: {
        ru: "Удерживайте клавишу \"ОК\" для вызова контекстного меню",
        uk: "Утримуйте клавішу \"ОК\" для виклику контекстного меню",
        en: "Hold the \"OK\" key to bring up the context menu",
        zh: "按住“确定”键调出上下文菜单"
      },
      title_online: {
        ru: "Онлайн",
        uk: "Онлайн",
        en: "Online",
        zh: "在线的"
      },
      modal_text: {
        ru: "Введите код на странице https://kino.pub/device",
        uk: "Введіть код на сторінці https://kino.pub/device",
        en: "Enter the code on the page https://kino.pub/device",
        zh: "在 https://kino.pub/device 页面输入代码"
      },
      modal_wait: {
        ru: "Ожидаем код",
        uk: "Очікуємо код",
        en: "Waiting for the code",
        zh: "我们正在等待代码"
      },
      copy_secuses: {
        ru: "Код скопирован в буфер обмена",
        uk: "Код скопійовано в буфер обміну",
        en: "Code copied to clipboard",
        zh: "代码复制到剪贴板"
      },
      copy_fail: {
        ru: "Ошибка при копировании",
        uk: "Помилка при копіюванні",
        en: "Copy error",
        zh: "复制错误"
      },
      title_status: {
        ru: "Статус",
        uk: "Статус",
        en: "Status",
        zh: "地位"
      },
      online_voice_subscribe: {
        ru: "Подписаться на перевод",
        uk: "Підписатися на переклад",
        en: "Subscribe to translation",
        zh: "订阅翻译"
      },
      online_voice_success: {
        ru: "Вы успешно подписались",
        uk: "Ви успішно підписалися",
        en: "You have successfully subscribed",
        zh: "您已成功订阅"
      },
      online_voice_error: {
        ru: "Возникла ошибка",
        uk: "Виникла помилка",
        en: "An error has occurred",
        zh: "发生了错误"
      },
      online_clear_all_marks: {
        ru: "Очистить все метки",
        uk: "Очистити всі мітки",
        en: "Clear all labels",
        zh: "清除所有标签"
      },
      online_clear_all_timecodes: {
        ru: "Очистить все тайм-коды",
        uk: "Очистити всі тайм-коди",
        en: "Clear all timecodes",
        zh: "清除所有时间代码"
      },
      online_balanser_dont_work: {
        ru: "Поиск не дал результатов",
        uk: "Пошук не дав результатів",
        en: "The search did not return any results",
        zh: "平衡器 未响应请求。"
      },
      online_nostreams: {
        ru: "Контент найден, но ссылки на видео недоступны. Проверьте CORS-прокси или авторизацию KinoPub.",
        uk: "Контент знайдено, але посилання на відео недоступні. Перевірте CORS-проксі або авторизацію KinoPub.",
        en: "Content found, but video links are unavailable. Check the CORS proxy or KinoPub authorization.",
        zh: "找到内容，但视频链接不可用。请检查 CORS 代理或 KinoPub 授权。"
      },
      dso_kinopub_proxy_title: {
        ru: "CORS прокси KinoPub",
        uk: "CORS проксі KinoPub",
        en: "KinoPub CORS proxy",
        zh: "KinoPub CORS 代理"
      },
      dso_kinopub_proxy_descr: {
        ru: "Прокси для запросов к api.srvkp.com (см. cors.conf)",
        uk: "Проксі для запитів до api.srvkp.com (див. cors.conf)",
        en: "Proxy for api.srvkp.com requests (see cors.conf)",
        zh: "用于 api.srvkp.com 请求的代理（见 cors.conf）"
      },
      dso_kinopub_param_add_title: {
        ru: "Access token KinoPub",
        uk: "Access token KinoPub",
        en: "KinoPub access token",
        zh: "KinoPub access token"
      },
      dso_kinopub_param_add_descr: {
        ru: "Добавьте ТОКЕН для подключения подписки",
        uk: "Додайте ТОКЕН для підключення передплати",
        en: "Add a TOKEN to connect a subscription",
        zh: "添加 TOKEN 以连接订阅"
      },
      dso_kinopub_param_placeholder: {
        ru: "Например: asdfghjkl123456789",
        uk: "Наприклад: asdfghjkl123456789",
        en: "For example: asdfghjkl123456789",
        zh: "例如：asdfghjkl123456789"
      },
      dso_kinopub_param_add_device: {
        ru: "Добавить устройство KinoPub",
        uk: "Додати пристрій KinoPub",
        en: "Add KinoPub device",
        zh: "添加 KinoPub 设备"
      },
      dso_kinopub_nodevice: {
        ru: "Устройство не авторизовано",
        uk: "Пристрій не авторизований",
        en: "Device not authorized",
        zh: "设备未授权"
      },
      dso_kinopub_sub_free: {
        ru: "Бесплатно",
        uk: "Безкоштовно",
        en: "Free",
        zh: "免费"
      },
      dso_kinopub_sub_days: {
        ru: "Осталось дней",
        uk: "Залишилось днів",
        en: "Days left",
        zh: "剩余天数"
      },
      dso_kinopub_max_quality: {
        ru: "Макс. качество",
        uk: "Макс. якість",
        en: "Max quality",
        zh: "最高画质"
      },
      dso_kinopub_video_server: {
        ru: "Видео сервер",
        uk: "Відео сервер",
        en: "Video server",
        zh: "视频服务器"
      },
      dso_kinopub_refresh_profile: {
        ru: "Обновить профиль KinoPub",
        uk: "Оновити профіль KinoPub",
        en: "Refresh KinoPub profile",
        zh: "刷新 KinoPub 个人资料"
      },
      dso_kinopub_pro_until: {
        ru: "Подписка до",
        uk: "Підписка до",
        en: "Subscription until",
        zh: "订阅至"
      },
      dso_kinopub_profile_updated: {
        ru: "Профиль KinoPub обновлён",
        uk: "Профіль KinoPub оновлено",
        en: "KinoPub profile updated",
        zh: "KinoPub 个人资料已更新"
      },
      dso_kinopub_filetype_title: {
        ru: "Тип потока",
        uk: "Тип потоку",
        en: "Stream type",
        zh: "流类型"
      },
      dso_kinopub_filetype_descr: {
        ru: "HLS — адаптивное качество и выбор озвучки. MP4 — прямые ссылки.",
        uk: "HLS — адаптивна якість і вибір озвучки. MP4 — прямі посилання.",
        en: "HLS — adaptive quality and voice selection. MP4 — direct links.",
        zh: "HLS — 自适应画质和音轨选择。MP4 — 直链。"
      },
      dso_kinopub_filetype_hls: {
        ru: "HLS (m3u8)",
        uk: "HLS (m3u8)",
        en: "HLS (m3u8)",
        zh: "HLS (m3u8)"
      },
      dso_kinopub_filetype_mp4: {
        ru: "MP4 (http)",
        uk: "MP4 (http)",
        en: "MP4 (http)",
        zh: "MP4 (http)"
      },
      dso_kinopub_fresh: {
        ru: "Свежие",
        uk: "Свіжі",
        en: "Fresh",
        zh: "最新"
      },
      dso_kinopub_hot: {
        ru: "Горячие",
        uk: "Гарячі",
        en: "Hot",
        zh: "热门"
      },
      dso_kinopub_watchers: {
        ru: "Смотрят сейчас",
        uk: "Дивляться зараз",
        en: "Watching now",
        zh: "正在观看"
      },
      dso_kinopub_docs: {
        ru: "Документальные",
        uk: "Документальні",
        en: "Documentaries",
        zh: "纪录片"
      },
      dso_kinopub_doc_serials: {
        ru: "Документальные сериалы",
        uk: "Документальні серіали",
        en: "Documentary series",
        zh: "纪录片剧集"
      },
      dso_kinopub_tvshow: {
        ru: "ТВ шоу",
        uk: "ТВ шоу",
        en: "TV shows",
        zh: "电视节目"
      },
      dso_kinopub_live_tv: {
        ru: "ТВ KinoPub",
        uk: "ТБ KinoPub",
        en: "TV KinoPub",
        zh: "直播电视"
      },
      dso_kinopub_live_empty: {
        ru: "Нет доступных каналов",
        uk: "Немає доступних каналів",
        en: "No channels available",
        zh: "暂无可用频道"
      },
      dso_kinopub_live_error: {
        ru: "Не удалось загрузить ТВ",
        uk: "Не вдалося завантажити ТВ",
        en: "Failed to load Live TV",
        zh: "无法加载直播电视"
      },
      dso_kinopub_genre_missing: {
        ru: "Жанр не найден в KinoPub",
        uk: "Жанр не знайдено в KinoPub",
        en: "Genre not found in KinoPub",
        zh: "在 KinoPub 中未找到该类型"
      },
      dso_kinopub_concerts: {
        ru: "Концерты",
        uk: "Концерти",
        en: "Concerts",
        zh: "演唱会"
      },
      dso_kinopub_3d: {
        ru: "3D",
        uk: "3D",
        en: "3D",
        zh: "3D"
      },
      dso_kinopub_continue: {
        ru: "Продолжить просмотр",
        uk: "Продовжити перегляд",
        en: "Continue watching",
        zh: "继续观看"
      },
      dso_kinopub_sync_favorites: {
        ru: "Синхронизировать избранное KinoPub",
        uk: "Синхронізувати обране KinoPub",
        en: "Sync KinoPub favorites",
        zh: "同步 KinoPub 收藏"
      },

      dso_kinopub_sync_ok: {
        ru: "Избранное KinoPub синхронизировано",
        uk: "Обране KinoPub синхронізовано",
        en: "KinoPub favorites synced",
        zh: "KinoPub 收藏已同步"
      },
      dso_kinopub_source: {
        ru: "KinoPub",
        uk: "KinoPub",
        en: "KinoPub",
        zh: "KinoPub"
      }
    });
    Lampa.Template.add("dso_kinopub_profile_css", "<style>.dso-kinopub-profile{margin:1em 0;padding:1em;background:rgba(255,255,255,.08);border-radius:.6em;line-height:1.35}.dso-kinopub-profile--empty{opacity:.75;padding:1.2em 1em}.dso-kinopub-profile__wrap{display:flex;gap:1em;align-items:center}.dso-kinopub-profile__avatar{width:4.5em;height:4.5em;border-radius:50%;overflow:hidden;background:rgba(0,0,0,.35);flex-shrink:0;display:flex;align-items:center;justify-content:center}.dso-kinopub-profile__avatar img{width:100%;height:100%;object-fit:cover}.dso-kinopub-profile__placeholder{font-size:1.8em;font-weight:600;text-transform:uppercase}.dso-kinopub-profile__title{font-size:1.25em;font-weight:600}.dso-kinopub-profile__login{opacity:.75;font-size:.95em;margin-top:.15em}.dso-kinopub-profile__meta{opacity:.85;font-size:.92em;margin-top:.45em}.dso-kinopub-profile__badge{display:inline-block;margin-bottom:.35em;padding:.15em .55em;border-radius:.3em;background:rgba(255,255,255,.14);font-size:.88em;font-weight:600}</style>");
    $("body").append(Lampa.Template.get("dso_kinopub_profile_css", {}, true));
    Lampa.Template.add("online_prestige_css", "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;will-change:transform;width:100%;box-sizing:border-box;overflow:hidden}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative;min-width:0;overflow:hidden}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap;flex-shrink:0}.online-prestige--full .online-prestige__info{min-width:0;flex:1}.online-prestige--full .online-prestige__info>span:only-child{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;display:block;max-width:100%}.online-prestige--full .online-prestige__footer{align-items:flex-end;gap:.6em}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus{outline:solid .3em #fff;outline-offset:.4em;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;z-index:2}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:2em;margin-bottom:.9em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        </style>\n    ");
    $("body").append(Lampa.Template.get("online_prestige_css", {}, true));
    function registerOnlineTemplates() {
      Lampa.Template.add("online_prestige_full", "<div class=\"online-prestige online-prestige--full selector\">\n            <div class=\"online-prestige__img\">\n                <img alt=\"\">\n                <div class=\"online-prestige__loader\"></div>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__timeline\"></div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                    <div class=\"online-prestige__quality\">{quality}</div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add("online_does_not_answer", "<div class=\"online-empty\">\n            <div class=\"online-empty__title\" style=\"font-size: 2em; margin-bottom: .9em;\">\n                #{online_balanser_dont_work}\n            </div>\n          <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add("online_prestige_rate", "<div class=\"online-prestige-rate\">\n            <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>");
      Lampa.Template.add("online_prestige_folder", "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
    }

    var watchButtonHtml = "<div class=\"full-start__button selector view--online\" data-subtitle=\"DSO KinoPub v" + manifest.version + "\">\n" +
      "        <svg width=\"135\" height=\"147\" viewBox=\"0 0 135 147\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
      "            <path d=\"M121.5 96.8823C139.5 86.49 139.5 60.5092 121.5 50.1169L41.25 3.78454C23.25 -6.60776 0.750004 6.38265 0.750001 27.1673L0.75 51.9742C4.70314 35.7475 23.6209 26.8138 39.0547 35.7701L94.8534 68.1505C110.252 77.0864 111.909 97.8693 99.8725 109.369L121.5 96.8823Z\" fill=\"currentColor\"/>\n" +
      "            <path d=\"M63 84.9836C80.3333 94.991 80.3333 120.01 63 130.017L39.75 143.44C22.4167 153.448 0.749999 140.938 0.75 120.924L0.750001 94.0769C0.750002 74.0621 22.4167 61.5528 39.75 71.5602L63 84.9836Z\" fill=\"currentColor\"/>\n" +
      "        </svg>\n\n" +
      "        <span>#{title_online}</span>\n" +
      "    </div>";
    Lampa.Component.add("online_dso_kinopub", OnlineComponent);
    registerOnlineTemplates();
    if (Lampa.Api && Lampa.Api.sources) {
      Lampa.Api.sources[SOURCE_ID] = kinopubApiSource;
    }
    if (Lampa.Activity && !Lampa.Activity.__dso_kinopub_patched) {
      Lampa.Activity.__dso_kinopub_patched = true;
      var __dsoOrigActivityPush = Lampa.Activity.push;
      Lampa.Activity.push = function (pushParams) {
        if (pushParams && pushParams.component === "full") {
          var routedCard = pushParams.card || pushParams.movie;
          if (routedCard && (routedCard.kinopub_id || routedCard.source === SOURCE_ID || routedCard.source === "kinopub")) {
            pushParams.source = SOURCE_ID;
            if (routedCard.kinopub_id) {
              pushParams.id = routedCard.kinopub_id;
            }
          }
        }
        return __dsoOrigActivityPush.apply(this, arguments);
      };
    }
    if (Lampa.Params && Lampa.Params.select) {

      var existingSources = Lampa.Params.values && Lampa.Params.values.source || {};
      var sourceOptions = {};
      for (var existingSourceKey in existingSources) {
        if (Object.prototype.hasOwnProperty.call(existingSources, existingSourceKey)) {
          sourceOptions[existingSourceKey] = existingSources[existingSourceKey];
        }
      }
      sourceOptions[SOURCE_ID] = SOURCE_TITLE;
      var savedLastSource = Lampa.Storage.get("dso_kinopub_last_source", "");
      var currentStoredSource = Lampa.Storage.field("source");
      var defaultSource = (savedLastSource === SOURCE_ID || currentStoredSource === SOURCE_ID) ? SOURCE_ID : "tmdb";
      Lampa.Params.select("source", sourceOptions, defaultSource);
      if (savedLastSource === SOURCE_ID && Lampa.Storage.field("source") !== SOURCE_ID) {
        Lampa.Storage.set("source", SOURCE_ID);
      }
      Lampa.Storage.listener.follow("change", function (sourceChangeEvent) {
        if (sourceChangeEvent && sourceChangeEvent.name === "source") {
          Lampa.Storage.set("dso_kinopub_last_source", sourceChangeEvent.value);
        }
      });
    }
    interceptAnimeMenu();
    updateLiveTvMenuButton();
    Lampa.Listener.follow("full", function (fullEvent) {
      if (fullEvent.type == "complite") {

        var fullMovieCard = fullEvent.data && fullEvent.data.movie;
        if (isKinopubCard(fullMovieCard) && fullEvent.object && fullEvent.object.activity) {
          var dropEmptyRatePills = function () {
            var activityRoot;
            try {
              activityRoot = fullEvent.object.activity.render();
            } catch (renderError) {
              return;
            }
            var pillSelector = ".full-start__pg, .full-start-new__pg, .full-start__status, .full-start-new__status";
            activityRoot.find(pillSelector).each(function () {
              var pillNode = $(this);
              var pillText = (pillNode.text() || "").replace(/[\s\u00A0]+/g, "");
              if (!pillText || pillText === "+" || pillText === "0") {
                pillNode.remove();
              }
            });
          };
          dropEmptyRatePills();
          [80, 300, 800, 1600, 3000].forEach(function (delay) {
            setTimeout(dropEmptyRatePills, delay);
          });
        }
        var __dsoActivityRoot = fullEvent.object.activity.render();
        if (__dsoActivityRoot.find(".view--online.dso-kinopub-button").length) {
          return;
        }
        var watchButton = $(Lampa.Lang.translate(watchButtonHtml));
        watchButton.addClass("dso-kinopub-button");
        watchButton.on("hover:enter", function () {
          registerOnlineTemplates();
          Lampa.Component.add("online_dso_kinopub", OnlineComponent);
          var fullMovie = fullEvent.data.movie || {};
          var fullKinopubId = fullMovie.kinopub_id || (fullMovie.source === SOURCE_ID || fullMovie.source === "kinopub" ? fullMovie.id : 0);
          Lampa.Activity.push({
            url: "",
            title: Lampa.Lang.translate("title_online"),
            component: "online_dso_kinopub",
            search: fullMovie.title || fullMovie.name,
            search_one: fullMovie.title || fullMovie.name,
            search_two: fullMovie.original_title || fullMovie.original_name,
            movie: fullMovie,
            kinopub_id: fullKinopubId || undefined,
            page: 1
          });
        });
        fullEvent.object.activity.render().find(".view--torrent").after(watchButton);
      }
    });
    window.dso_kinopub = {
      max_qualitie: 2160,
      is_max_qualitie: false
    };
    function initializeWithToken(startupToken, forceSync) {
      fetchUserStatus(startupToken, function () {
        notifyDevice(startupToken);
        scheduleFavoritesSync(forceSync);
      }, function () {
        refreshAccessToken(function (didRefreshToken) {
          if (didRefreshToken) {
            var refreshedToken = getAccessToken();
            fetchUserStatus(refreshedToken, function () {
              notifyDevice(refreshedToken);
              scheduleFavoritesSync(forceSync);
            });
          }
        });
      });
    }
    bindFavoriteListeners();

    Lampa.Params.select("dso_kinopub_token", "", "");
    Lampa.Params.select("dso_kinopub_proxy", DEFAULT_PROXY, "");
    Lampa.Params.select("dso_kinopub_filetype", {
      hls: "#{dso_kinopub_filetype_hls}",
      mp4: "#{dso_kinopub_filetype_mp4}"
    }, "hls");
    Lampa.SettingsApi.addComponent({
      component: "dso_kinopub",
      name: "DSO KinoPub",
      icon: "<svg height=\"57\" viewBox=\"0 0 58 57\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 13H26.8281V45H20V13ZM26.8281 17.5L39 13V20.5L29.5 29L39 37.5V45L26.8281 40.5V17.5Z\" fill=\"white\"/><rect x=\"2\" y=\"2\" width=\"54\" height=\"53\" rx=\"5\" stroke=\"white\" stroke-width=\"4\"/></svg>"
    });
    Lampa.Template.add("settings_dso_kinopub", "<div>\n        <div class=\"settings-param\" data-name=\"dso_kinopub_profile\" data-static=\"true\"></div>\n        <div class=\"settings-param selector\" data-name=\"dso_kinopub_refresh\" data-static=\"true\">\n            <div class=\"settings-param__name\">#{dso_kinopub_refresh_profile}</div>\n        </div>\n        <div class=\"settings-param selector\" data-name=\"dso_kinopub_sync\" data-static=\"true\">\n            <div class=\"settings-param__name\">#{dso_kinopub_sync_favorites}</div>\n        </div>\n        <div class=\"settings-param selector\" data-type=\"select\" data-name=\"dso_kinopub_filetype\">\n            <div class=\"settings-param__name\">#{dso_kinopub_filetype_title}</div>\n            <div class=\"settings-param__value\"></div>\n            <div class=\"settings-param__descr\">#{dso_kinopub_filetype_descr}</div>\n        </div>\n        <div class=\"settings-param selector\" data-name=\"dso_kinopub_proxy\" data-type=\"input\" placeholder=\"https://cors.example.com/\">\n            <div class=\"settings-param__name\">#{dso_kinopub_proxy_title}</div>\n            <div class=\"settings-param__value\"></div>\n            <div class=\"settings-param__descr\">#{dso_kinopub_proxy_descr}</div>\n        </div>\n        <div class=\"settings-param selector\" data-name=\"dso_kinopub_token\" data-type=\"input\" placeholder=\"#{dso_kinopub_param_placeholder}\">\n            <div class=\"settings-param__name\">#{dso_kinopub_param_add_title}</div>\n            <div class=\"settings-param__value\"></div>\n            <div class=\"settings-param__descr\">#{dso_kinopub_param_add_descr}</div>\n        </div>\n        <div class=\"settings-param selector\" data-name=\"dso_kinopub_add\" data-static=\"true\">\n            <div class=\"settings-param__name\">#{dso_kinopub_param_add_device}</div>\n        </div>\n    </div>");
    Lampa.Storage.listener.follow("change", function (storageEvent) {
      if (storageEvent.name == "dso_kinopub_proxy") {
        proxyUrl = storageEvent.value || DEFAULT_PROXY;
        if (proxyUrl && proxyUrl.charAt(proxyUrl.length - 1) !== "/") {
          proxyUrl += "/";
        }
      }
      if (storageEvent.name == "dso_kinopub_token") {
        window.dso_kinopub.is_max_qualitie = false;
        if (storageEvent.value) {

          initializeWithToken(storageEvent.value, true);
        } else {
          Lampa.Storage.set("dso_kinopub_status", {});
          Lampa.Storage.set("dso_kinopub_refresh", "");
          window.dso_kinopub.max_qualitie = 2160;
          renderProfileCard();
        }
        updateLiveTvMenuButton();
      }
    });
    Lampa.Settings.listener.follow("open", function (settingsEvent) {
      if (settingsEvent.name != "dso_kinopub") {
        return;
      }
      renderProfileCard();
      var settingsToken = getAccessToken();
      if (settingsToken) {

        var nowMs = Date.now();
        if (nowMs - lastSettingsUserFetch > 60000) {
          lastSettingsUserFetch = nowMs;
          fetchUserStatus(settingsToken);
        } else {
          renderProfileCard();
        }
      }
      settingsEvent.body.find("[data-name=\"dso_kinopub_refresh\"]").unbind("hover:enter").on("hover:enter", function () {
        var refreshClickToken = getAccessToken();
        if (!refreshClickToken) {
          Lampa.Noty.show(Lampa.Lang.translate("dso_kinopub_nodevice"));
          return;
        }
        lastSettingsUserFetch = Date.now();
        fetchUserStatus(refreshClickToken, function (refreshedProfile) {
          if (refreshedProfile) {
            Lampa.Noty.show(Lampa.Lang.translate("dso_kinopub_profile_updated"));
          }
        });
      });
      settingsEvent.body.find("[data-name=\"dso_kinopub_sync\"]").unbind("hover:enter").on("hover:enter", function () {
        if (!getAccessToken()) {
          Lampa.Noty.show(Lampa.Lang.translate("dso_kinopub_nodevice"));
          return;
        }
        syncFavoritesFromKinopub(function (syncSucceeded) {
          if (syncSucceeded) {
            Lampa.Noty.show(Lampa.Lang.translate("dso_kinopub_sync_ok"));
          } else {
            Lampa.Noty.show(Lampa.Lang.translate("dso_kinopub_nodevice"));
          }
        });
      });
      settingsEvent.body.find("[data-name=\"dso_kinopub_add\"]").unbind("hover:enter").on("hover:enter", function () {
        var userCode = "";
        var deviceCode = "";
        var pollIntervalMs = 5000;
        var pollTimer;
        function restartPolling() {
          clearInterval(pollTimer);
          pollTimer = setInterval(pollForToken, pollIntervalMs);
        }
        var authModalHtml = $("<div><div class=\"broadcast__text\">" + Lampa.Lang.translate("modal_text") + "</div><div class=\"broadcast__device selector\" style=\"text-align: center\">" + Lampa.Lang.translate("modal_wait") + "...</div><br><div class=\"broadcast__scan\"><div></div></div></div>");
        Lampa.Modal.open({
          title: "",
          html: authModalHtml,
          onBack: function () {
            Lampa.Modal.close();
            Lampa.Controller.toggle("settings_component");
            clearInterval(pollTimer);
          },
          onSelect: function () {
            if (!userCode) {
              Lampa.Noty.show(Lampa.Lang.translate("modal_wait") + "...");
              return;
            }
            Lampa.Utils.copyTextToClipboard(userCode, function () {
              Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
            }, function () {
              Lampa.Noty.show(Lampa.Lang.translate("copy_fail"));
            });
          }
        });
        function buildDeviceAuthUrl(grantType) {
          return buildApiUrl("/oauth2/device?grant_type=" + grantType + "&client_id=" + OAUTH_CLIENT_ID + "&client_secret=" + OAUTH_CLIENT_SECRET + (grantType === "device_token" && deviceCode ? "&code=" + encodeURIComponent(deviceCode) : ""));
        }
        var pollErrorCount = 0;
        function pollForToken() {
          if (!deviceCode) {
            return;
          }
          $.ajax({
            url: buildDeviceAuthUrl("device_token"),
            type: "POST",
            dataType: "json",
            timeout: 10000,
            success: function (tokenResponse) {
              pollErrorCount = 0;
              if (tokenResponse && tokenResponse.access_token) {
                Lampa.Modal.close();
                clearInterval(pollTimer);
                Lampa.Storage.set("dso_kinopub_token", tokenResponse.access_token);
                if (tokenResponse.refresh_token) {
                  Lampa.Storage.set("dso_kinopub_refresh", tokenResponse.refresh_token);
                }
                settingsEvent.body.find("[data-name=\"dso_kinopub_token\"] .settings-param__value").text(tokenResponse.access_token);
                fetchUserStatus(tokenResponse.access_token, function () {
                  notifyDevice(tokenResponse.access_token);
                  maybeSyncFavorites(true);
                });
                Lampa.Controller.toggle("settings_component");
              }
            },
            error: function (pollXhr) {
              pollErrorCount++;
              var isFatal = pollXhr && (pollXhr.status === 401 || pollXhr.status === 403 || pollXhr.status === 404);
              if (isFatal || pollErrorCount >= 12) {
                clearInterval(pollTimer);
                Lampa.Modal.close();
                Lampa.Controller.toggle("settings_component");
                Lampa.Noty.show(Lampa.Lang.translate("copy_fail"));
              }
            }
          });
        }
        $.ajax({
          url: buildDeviceAuthUrl("device_code"),
          type: "POST",
          dataType: "json",
          timeout: 10000,
          success: function (deviceCodeResponse) {
            if (deviceCodeResponse && deviceCodeResponse.code) {
              deviceCode = deviceCodeResponse.code;
              userCode = deviceCodeResponse.user_code;
              pollIntervalMs = (deviceCodeResponse.interval || 5) * 1000;
              authModalHtml.find(".selector").text(userCode);
              restartPolling();
            } else {
              Lampa.Noty.show(Lampa.Lang.translate("copy_fail"));
            }
          },
          error: function () {
            Lampa.Noty.show(Lampa.Lang.translate("copy_fail"));
          }
        });
      });
    });
    var savedToken = getAccessToken();
    if (savedToken) {

      initializeWithToken(savedToken, false);
    }
    if (Lampa.Manifest.app_digital >= 177) {
      Lampa.Storage.sync("online_choice_dso_kinopub", "object_object");
    }
  }
  if (Lampa.Manifest.app_digital >= 155) {
    if (window.appready) {
      startPlugin();
    } else {
      Lampa.Listener.follow("app", function (appEvent) {
        if (appEvent.type === "ready") {
          startPlugin();
        }
      });
    }
  }
})();

