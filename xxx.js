(function () {
  'use strict';

  if (window.plugin_cherry_ready) return;
  window.plugin_cherry_ready = true;

  // ============================================================
  // CONFIG — user sets these after deploying their proxy
  // ============================================================
  var PROXY_URL = 'https://cherry-proxy.aawersom.workers.dev';
  // Secondary proxy on Deno Deploy — used for sites that block Cloudflare datacenter IPs (xnxx, spankbang)
  var PROXY_URL_2 = 'https://cherry-proxy.aawersom.deno.net';
  var PROXY_URL_2_HOSTS = {
    'xnxx.com': 1, 'www.xnxx.com': 1,
    'spankbang.com': 1, 'www.spankbang.com': 1,
    // pornhub Webmasters API + youjizz homepage rate-limit CF datacenter IPs
    'www.pornhub.com': 1,
    'www.youjizz.com': 1, 'youjizz.com': 1,
    // tizam.org — rate-limits rapid sequential requests from CF datacenter IPs
    'tv4.tizam.org': 1,
    // bigcdn.cc — LeaseWeb NL CDN used by KVS-based sites; 13 confirmed subdomains
    's1.bigcdn.cc': 1, 's4.bigcdn.cc': 1, 's16.bigcdn.cc': 1, 's25.bigcdn.cc': 1,
    's30.bigcdn.cc': 1, 's33.bigcdn.cc': 1, 's38.bigcdn.cc': 1, 's39.bigcdn.cc': 1,
    's41.bigcdn.cc': 1, 's43.bigcdn.cc': 1, 's47.bigcdn.cc': 1, 's50.bigcdn.cc': 1,
    's61.bigcdn.cc': 1
  };

  function getProxyKey() {
    return Lampa.Storage.get('cherry_proxy_key', '1206');
  }

  // ============================================================
  // PROXY HELPERS
  // ============================================================

  /** @param {string} url @param {string=} referer @returns {string} */
  function buildProxyUrl(url, referer) {
    var key = getProxyKey();
    var base = PROXY_URL;
    if (PROXY_URL_2) {
      try { if (PROXY_URL_2_HOSTS[new URL(url).hostname]) base = PROXY_URL_2; } catch (e) {}
    }
    var p = base + '/proxy?url=' + encodeURIComponent(url);
    if (key)     p += '&key=' + encodeURIComponent(key);
    if (referer) p += '&referer=' + encodeURIComponent(referer);
    return p;
  }

  /** @param {string} url @param {string=} referer @returns {Promise<string>} */
  function cherryFetch(url, referer) {
    return fetch(buildProxyUrl(url, referer)).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }

  /**
   * POST via proxy using native fetch (Lampa.Reguest does not expose POST).
   * @param {string} url
   * @param {string} body  application/x-www-form-urlencoded string
   * @returns {Promise<string>}
   */
  function cherryPost(url, body) {
    return fetch(buildProxyUrl(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }


  // Picks the best available quality URL (highest numeric label wins).
  function bestQualityUrl(quality) {
    var keys = Object.keys(quality || {});
    if (!keys.length) return '';
    var best = 0, bestUrl = '';
    keys.forEach(function (k) {
      var n = parseInt(k, 10) || 0;
      if (n > best) { best = n; bestUrl = quality[k]; }
    });
    return bestUrl || quality[keys[0]];
  }

  // Track blob URLs created by proxyM3u8 so they can be revoked on player close.
  var _blobUrls = [];

  // Fetches an HLS m3u8 through the proxy and rewrites all non-comment lines:
  //   - Sub-playlist lines (.m3u8) → recursively proxied → inner blob URL
  //   - Segment lines (.ts, etc.) → direct proxy URL
  // Handles multi-level HLS (master → index → segments) so hls.js resolves
  // segment paths against a blob URL that already has correct proxied paths.
  function proxyM3u8(m3u8Url, referer) {
    return cherryFetch(m3u8Url, referer).then(function (content) {
      var lines = content.split('\n');
      var promises = lines.map(function (line) {
        var l = line.trim();
        var abs;
        if (!l || l[0] === '#') return Promise.resolve(line);
        try {
          abs = new URL(l, m3u8Url).toString();
        } catch (e) {
          abs = l;
        }
        // Sub-playlist: proxy recursively so its segments are also rewritten.
        if (/\.m3u8/.test(abs.split('?')[0])) {
          return proxyM3u8(abs, referer).catch(function () {
            return buildProxyUrl(abs, referer);
          });
        }
        return Promise.resolve(buildProxyUrl(abs, referer));
      });

      return Promise.all(promises).then(function (rewrittenLines) {
        var blob = new Blob([rewrittenLines.join('\n')], { type: 'application/vnd.apple.mpegurl' });
        var blobUrl = URL.createObjectURL(blob);
        _blobUrls.push(blobUrl);
        return blobUrl;
      });
    });
  }

  // ============================================================
  // SOURCES — adapters register here
  // ============================================================

  /**
   * @typedef {Object} VideoCard
   * @property {string} id
   * @property {string} source
   * @property {string} title
   * @property {string} thumb
   * @property {string} url
   * @property {number} [duration]
   * @property {number} [views]
   */

  /**
   * @typedef {Object} BrowseResult
   * @property {VideoCard[]} items
   * @property {number} total_pages
   */

  /**
   * @typedef {Object} StreamResult
   * @property {string} url
   * @property {Object.<string,string>} quality  e.g. { '1080p': 'https://...' }
   */

  /**
   * @typedef {Object} SourceAdapter
   * @property {string} id
   * @property {string} name
   * @property {string} host
   * @property {function(string, number): Promise<BrowseResult>} search
   * @property {function(string, number): Promise<BrowseResult>} browse
   * @property {function(VideoCard): Promise<StreamResult>}     getStream
   */

  /** @type {SourceAdapter[]} */
  var SOURCES = [
    // Adapters are defined at the bottom of this file and push themselves here.
  ];

  // ============================================================
  // FAVORITES
  // ============================================================
  var Fav = {
    _key: 'cherry_favs',

    /** @returns {VideoCard[]} */
    all: function () {
      return Lampa.Storage.get(this._key, []);
    },

    /** @param {VideoCard} video @returns {boolean} */
    has: function (video) {
      return this.all().some(function (v) {
        return v.id === video.id && v.source === video.source;
      });
    },

    /**
     * Toggle favorite status.
     * @param {VideoCard} video
     * @returns {boolean} true if added, false if removed
     */
    toggle: function (video) {
      var list = this.all();
      var idx = -1;
      list.forEach(function (v, i) {
        if (v.id === video.id && v.source === video.source) idx = i;
      });
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.unshift({
          id:       video.id,
          source:   video.source,
          title:    video.title   || '',
          thumb:    video.thumb   || '',
          url:      video.url     || '',
          duration: video.duration || 0,
          views:    video.views    || 0
        });
      }
      Lampa.Storage.set(this._key, list);
      return idx < 0;
    }
  };

  // ============================================================
  // UTILS
  // ============================================================

  /**
   * Convert seconds to M:SS string.
   * @param {number|string} s
   * @returns {string}
   */
  function secToTime(s) {
    s = parseInt(s, 10) || 0;
    var m   = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /**
   * Format view count for display (e.g. 1200 → "1K").
   * @param {number} n
   * @returns {string}
   */
  function formatViews(n) {
    if (!n || isNaN(n)) return '';
    if (n >= 1000000) return Math.floor(n / 1000000) + 'M';
    if (n >= 1000)    return Math.floor(n / 1000) + 'K';
    return String(n);
  }

  /**
   * Lookup adapter by id.
   * @param {string} id
   * @returns {SourceAdapter|null}
   */
  function sourceById(id) {
    for (var i = 0; i < SOURCES.length; i++) {
      if (SOURCES[i].id === id) return SOURCES[i];
    }
    return null;
  }

  /**
   * Resolve stream for a video and hand off to Lampa.Player,
   * showing a quality picker when multiple streams exist.
   * @param {VideoCard}     video
   * @param {SourceAdapter} source
   */
  function playVideo(video, source) {
    Lampa.Noty.show(Lampa.Lang.translate('cherry_loading'));

    source.getStream(video).then(function (stream) {
      var quality = stream.quality || {};
      var url = bestQualityUrl(quality) || stream.url;

      if (!url) {
        Lampa.Noty.show(Lampa.Lang.translate('cherry_error'), { style: 'warn' });
        return;
      }

      // Proxy non-blob stream URLs so that tokens bound to the proxy IP stay valid.
      function px(u) {
        if (!u) return u;
        if (u.indexOf('blob:') === 0) return u;
        if (u.indexOf(PROXY_URL) === 0) return u; // already proxied with custom referer — skip
        if (PROXY_URL_2 && u.indexOf(PROXY_URL_2) === 0) return u; // also skip Deno-proxied URLs
        // Normalize protocol-relative URLs (e.g. YouJizz returns //cdne-mobile.youjizz.com/...)
        if (u.indexOf('//') === 0) u = 'https:' + u;
        return buildProxyUrl(u);
      }
      var proxiedQuality = {};
      Object.keys(quality).forEach(function(k) { proxiedQuality[k] = px(quality[k]); });

      Lampa.Player.play({
        title:   video.title,
        url:     px(url),
        poster:  video.thumb,
        quality: proxiedQuality
      });
    }).catch(function (err) {
      console.warn('[Cherry] getStream error:', err);
      Lampa.Noty.show(Lampa.Lang.translate('cherry_error'), { style: 'warn' });
    });
  }

  // ============================================================
  // CHERRY GRID COMPONENT
  // Shows a paginated, infinite-scroll grid of video cards.
  //
  // object properties:
  //   source_id   {string}  — adapter id
  //   query       {string}  — search query (omit for browse)
  //   all_sources {boolean} — search ALL sources in parallel
  //   is_favorites{boolean} — show favorites list
  //   title       {string}  — screen title
  //   page        {number}  — initial page (currently unused; scroll drives paging)
  // ============================================================

  /**
   * @constructor
   * @param {Object} object  Activity params
   */
  function CherryGrid(object) {
    var network = new Lampa.Reguest();
    network.timeout(15000);

    /** @type {jQuery} */
    var html;
    /** @type {Lampa.Scroll} */
    var scroll;

    var currentPage = 1;
    var totalPages  = 1;
    var loading     = false;
    var destroyed   = false;

    // ---- lifecycle --------------------------------------------------

    this.create = function () {
      currentPage = 1;
      totalPages  = 1;
      loading     = false;

      var source = object.is_favorites ? null : sourceById(object.source_id);
      var screenTitle = object.title
        || (source ? source.name : 'Cherry');

      html = Lampa.Template.get('cherry_grid', { title: screenTitle });

      scroll = new Lampa.Scroll({ mask: true, over: true });

      scroll.body().on('scroll', function () {
        var el = this;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
          if (!loading && currentPage < totalPages) {
            currentPage++;
            loadPage(currentPage);
          }
        }
      });

      scroll.body().addClass('cherry-cards-wrap');
      html.find('.cherry-grid__body').append(scroll.render());

      if (object.is_favorites) {
        var favItems = Fav.all();
        if (favItems.length) {
          renderCards(favItems, scroll.body());
        } else {
          html.find('.cherry-grid__empty').show();
        }
      } else if (object.all_sources && object.query) {
        loadAllSources(object.query);
      } else {
        loadPage(1);
      }

      return html;
    };

    this.start = function () {
      Lampa.Controller.add('cherry_grid', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(false, scroll.render());
        },
        up:    function () {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down:  function () { if (Navigator.canmove('down')) Navigator.move('down'); },
        left:  function () {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function () { if (Navigator.canmove('right')) Navigator.move('right'); },
        back:  function () { Lampa.Activity.backward(); }
      });
      Lampa.Controller.toggle('cherry_grid');
    };

    this.render  = function () { return html; };
    this.pause   = function () {};
    this.stop    = function () { if (scroll) scroll.body().off('scroll'); };

    this.destroy = function () {
      destroyed = true;
      network.clear();
      if (html) html.remove();
    };

    // ---- data loading -----------------------------------------------

    /**
     * Load a single page from the current source adapter.
     * @param {number} page
     */
    function loadPage(page) {
      var source = sourceById(object.source_id);
      if (!source) {
        html.find('.cherry-grid__empty').show();
        return;
      }

      if (page === 1) {
        scroll.body().empty();
        html.find('.cherry-grid__empty').hide();
      }

      loading = true;
      setLoading(true);

      var promise = object.query
        ? source.search(object.query, page)
        : source.browse('', page);

      promise.then(function (result) {
        if (destroyed) return;
        loading = false;
        setLoading(false);

        if (result && result.items && result.items.length) {
          totalPages = result.total_pages || 1;
          html.find('.cherry-grid__empty').hide();
          renderCards(result.items, scroll.body());
          Lampa.Controller.collectionSet(scroll.render());
        } else if (page === 1) {
          html.find('.cherry-grid__empty').show();
        } else {
          currentPage = Math.max(1, currentPage - 1);
        }
      }).catch(function (err) {
        if (destroyed) return;
        console.warn('[Cherry] loadPage error (page ' + page + '):', err);
        if (page > 1) currentPage = Math.max(1, currentPage - 1);
        loading = false;
        setLoading(false);
        if (page === 1) {
          scroll.body().empty();
          Lampa.Noty.show(Lampa.Lang.translate('cherry_error'), { style: 'warn' });
          html.find('.cherry-grid__empty').show();
        }
      });
    }

    /**
     * Search ALL registered sources in parallel, merge and sort results.
     * Infinite scroll is disabled for this mode (all results load at once).
     * @param {string} query
     */
    function loadAllSources(query) {
      if (!SOURCES.length) {
        html.find('.cherry-grid__empty').show();
        return;
      }

      scroll.body().empty();
      html.find('.cherry-grid__empty').hide();
      loading = true;
      setLoading(true);

      var promises = SOURCES.map(function (src) {
        return src.search(query, 1).catch(function (err) {
          console.warn('[Cherry] all_sources search error from ' + src.id + ':', err);
          return { items: [], total_pages: 1 };
        });
      });

      Promise.all(promises).then(function (results) {
        if (destroyed) return;
        loading = false;
        setLoading(false);

        // Flatten all result sets.
        var all = [];
        results.forEach(function (r) {
          if (r && r.items) {
            r.items.forEach(function (item) { all.push(item); });
          }
        });

        if (!all.length) {
          html.find('.cherry-grid__empty').show();
          return;
        }

        // Sort alphabetically by title for consistent ordering.
        all.sort(function (a, b) {
          var ta = (a.title || '').toLowerCase();
          var tb = (b.title || '').toLowerCase();
          if (ta < tb) return -1;
          if (ta > tb) return  1;
          return 0;
        });

        // Disable infinite scroll — we already have everything.
        totalPages  = 1;
        currentPage = 1;

        html.find('.cherry-grid__empty').hide();
        renderCards(all, scroll.body());
        Lampa.Controller.collectionSet(html);
      }).catch(function (err) {
        if (destroyed) return;
        console.warn('[Cherry] loadAllSources error:', err);
        loading = false;
        setLoading(false);
        scroll.body().empty();
        html.find('.cherry-grid__empty').show();
        Lampa.Noty.show(Lampa.Lang.translate('cherry_error'), { style: 'warn' });
      });
    }

    // ---- rendering --------------------------------------------------

    /**
     * Show / hide the loading indicator.
     * @param {boolean} state
     */
    function setLoading(state) {
      if (!html) return;
      html.find('.cherry-grid__loading').toggle(state);
    }

    /**
     * Create card elements for the given video list and append to container.
     * @param {VideoCard[]} items
     * @param {jQuery}      container
     */
    function renderCards(items, container) {
      items.forEach(function (video) {
        var src = sourceById(video.source) || sourceById(object.source_id);

        var card = Lampa.Template.get('cherry_card', {
          title:    video.title    || '',
          duration: video.duration ? secToTime(video.duration) : '',
          views:    formatViews(video.views)
        });

        // Lazy-load thumbnail.
        if (video.thumb) {
          card.find('.cherry-card__img').attr('src', video.thumb);
        }

        // Set initial fav indicator state.
        if (Fav.has(video)) {
          card.find('.cherry-card__fav').show();
        }

        // OK / Enter: play.
        card.on('hover:enter', function () {
          if (!src) {
            Lampa.Noty.show(Lampa.Lang.translate('cherry_error'), { style: 'warn' });
            return;
          }
          playVideo(video, src);
        });

        // Focus: refresh fav badge.
        card.on('hover:focus', function () {
          card.find('.cherry-card__fav').toggle(Fav.has(video));
        });

        // Long-press: context menu (favorites + similar search).
        card.on('hover:long', function () {
          var isFav = Fav.has(video);
          Lampa.Select.show({
            title: video.title,
            items: [
              {
                title: isFav
                  ? Lampa.Lang.translate('cherry_rem_fav')
                  : Lampa.Lang.translate('cherry_add_fav'),
                action: 'fav'
              },
              {
                title: Lampa.Lang.translate('cherry_similar'),
                action: 'similar'
              }
            ],
            onSelect: function (item) {
              if (item.action === 'fav') {
                var added = Fav.toggle(video);
                card.find('.cherry-card__fav').toggle(added);
                Lampa.Noty.show(
                  added
                    ? Lampa.Lang.translate('cherry_add_fav')
                    : Lampa.Lang.translate('cherry_rem_fav')
                );
                Lampa.Controller.toggle('cherry_grid');
              } else if (item.action === 'similar') {
                var words = (video.title || '').replace(/[^a-zа-яё0-9\s]/gi, '').trim().split(/\s+/).slice(0, 4);
                var query = words.join(' ');
                Lampa.Controller.toggle('cherry_grid');
                Lampa.Activity.push({
                  component:   'cherry_grid',
                  title:       Lampa.Lang.translate('cherry_similar') + ': ' + video.title,
                  source_id:   video.source,
                  query:       query,
                  all_sources: true,
                  page:        1
                });
              }
            },
            onBack: function () { Lampa.Controller.toggle('cherry_grid'); }
          });
        });

        container.append(card);
      });

      Lampa.Controller.collectionSet(html);
    }
  }

  // ============================================================
  // CHERRY MAIN COMPONENT
  // Source list + global search bar + favorites button.
  // ============================================================

  /**
   * @constructor
   * @param {Object} object  Activity params
   */
  function CherryMain(object) {
    /** @type {jQuery} */
    var html;

    // ---- lifecycle --------------------------------------------------

    this.create = function () {
      html = Lampa.Template.get('cherry_main', {});
      renderSources();
      bindSearch();
      return html;
    };

    this.start = function () {
      Lampa.Controller.add('cherry_main', {
        toggle: function () {
          Lampa.Controller.collectionSet(html);
          Lampa.Controller.collectionFocus(false, html);
        },
        up:    function () {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down:  function () { if (Navigator.canmove('down')) Navigator.move('down'); },
        left:  function () {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function () { if (Navigator.canmove('right')) Navigator.move('right'); },
        back:  function () { Lampa.Activity.backward(); }
      });
      Lampa.Controller.toggle('cherry_main');
    };

    this.render  = function () { return html; };
    this.pause   = function () {};
    this.stop    = function () {};
    this.destroy = function () { if (html) html.remove(); };

    // ---- source tiles -----------------------------------------------

    function renderSources() {
      var grid = html.find('.cherry-main__sources');

      // Favorites tile — always first.
      var favCard = Lampa.Template.get('cherry_source_card', {
        name:    Lampa.Lang.translate('cherry_favorites'),
        initial: '♥'
      });
      favCard.addClass('cherry-source--fav');
      favCard.on('hover:enter', function () {
        Lampa.Activity.push({
          component:    'cherry_grid',
          title:        Lampa.Lang.translate('cherry_favorites'),
          source_id:    SOURCES.length ? SOURCES[0].id : '',
          is_favorites: true,
          page:         1
        });
      });
      grid.append(favCard);

      // One tile per registered adapter.
      SOURCES.forEach(function (src) {
        var card = Lampa.Template.get('cherry_source_card', {
          name:    src.name,
          initial: src.name.charAt(0).toUpperCase()
        });
        card.on('hover:enter', function () {
          Lampa.Activity.push({
            component: 'cherry_grid',
            title:     src.name,
            source_id: src.id,
            page:      1
          });
        });
        grid.append(card);
      });
    }

    // ---- search bar -------------------------------------------------

    function bindSearch() {
      var input = html.find('.cherry-main__search-input');
      var btn   = html.find('.cherry-main__search-btn');

      /**
       * Commit the current query and open a CherryGrid for all sources.
       */
      function doSearch() {
        var query = (input.val() || '').trim();
        if (!query) {
          Lampa.Noty.show(Lampa.Lang.translate('cherry_search_hint'), { style: 'warn' });
          return;
        }
        Lampa.Activity.push({
          component:   'cherry_grid',
          title:       Lampa.Lang.translate('cherry_search') + ': ' + query,
          source_id:   SOURCES.length ? SOURCES[0].id : '',
          query:       query,
          all_sources: true,
          page:        1
        });
      }

      // Search button (OK on remote when focused).
      btn.on('hover:enter', doSearch);

      // Input field focused via remote OK: open Lampa keyboard if available,
      // otherwise fall back to native focus + keydown handling.
      input.on('hover:enter', function () {
        if (typeof Lampa.Keyboard !== 'undefined' && Lampa.Keyboard.show) {
          Lampa.Keyboard.show({
            title:    Lampa.Lang.translate('cherry_search'),
            value:    input.val() || '',
            onchange: function (value) { input.val(value); },
            onenter:  function (value) {
              input.val(value);
              doSearch();
            }
          });
        } else {
          // Fallback: native browser input focus.
          var el = input[0];
          if (el) {
            el.focus();
            // Replace any stale handler so repeated openings do not stack searches.
            $(el).off('keydown.cherry_search').on('keydown.cherry_search', function (e) {
              if (e.key === 'Enter' || e.keyCode === 13) {
                $(el).off('keydown.cherry_search');
                doSearch();
              }
            });
          }
        }
      });
    }
  }

  // ============================================================
  // TEMPLATES
  // ============================================================
  function addTemplates() {

    Lampa.Template.add('cherry_main', [
      '<div class="cherry-main layer--wheight">',
        '<div class="cherry-main__head">',
          '<div class="cherry-main__logo">',
            '<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">',
              '<path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191',
              ' 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447',
              ' 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136',
              ' 8.625-11 14.402z"/>',
            '</svg>',
          '</div>',
          '<div class="cherry-main__title">Cherry</div>',
          '<div class="cherry-main__search">',
            '<input class="cherry-main__search-input selector" type="text" placeholder="#{cherry_search}&#8230;" autocomplete="off" />',
            '<div class="cherry-main__search-btn selector">#{cherry_search}</div>',
          '</div>',
        '</div>',
        '<div class="cherry-main__sources-label">#{cherry_sources}</div>',
        '<div class="cherry-main__sources"></div>',
      '</div>'
    ].join(''));

    Lampa.Template.add('cherry_source_card', [
      '<div class="cherry-source-card selector">',
        '<div class="cherry-source-card__initial">{initial}</div>',
        '<div class="cherry-source-card__name">{name}</div>',
      '</div>'
    ].join(''));

    Lampa.Template.add('cherry_grid', [
      '<div class="cherry-grid layer--wheight">',
        '<div class="cherry-grid__head">',
          '<div class="cherry-grid__title">{title}</div>',
        '</div>',
        '<div class="cherry-grid__body"></div>',
        '<div class="cherry-grid__loading">',
          '<div class="cherry-grid__loading-spinner"></div>',
          '<span>#{cherry_loading}</span>',
        '</div>',
        '<div class="cherry-grid__empty" style="display:none">',
          '<div class="cherry-grid__empty-icon">&#9785;</div>',
          '<div>#{cherry_no_results}</div>',
        '</div>',
      '</div>'
    ].join(''));

    Lampa.Template.add('cherry_card', [
      '<div class="cherry-card selector">',
        '<div class="cherry-card__thumb">',
          '<img class="cherry-card__img" src="" alt="" loading="lazy" />',
          '<div class="cherry-card__duration">{duration}</div>',
          '<div class="cherry-card__fav" style="display:none" aria-label="Favorite">&#9829;</div>',
        '</div>',
        '<div class="cherry-card__info">',
          '<div class="cherry-card__title">{title}</div>',
          '<div class="cherry-card__views">{views}</div>',
        '</div>',
      '</div>'
    ].join(''));
  }

  // ============================================================
  // CSS  — optimised for 1080p TV (1920×1080)
  // Base font-size on most Lampa skins ≈ 20px.
  // All em values are relative to that context.
  // ============================================================
  function addStyles() {
    var rules = [
      /* ---- Main screen ----------------------------------------- */
      '.cherry-main {',
      '  padding: 2.4em 3em;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 2em;',
      '  min-height: 100%;',
      '  box-sizing: border-box;',
      '}',

      '.cherry-main__head {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 1.5em;',
      '}',

      '.cherry-main__logo {',
      '  color: #e75480;',
      '  flex-shrink: 0;',
      '  line-height: 0;',
      '}',

      '.cherry-main__title {',
      '  font-size: 2.2em;',
      '  font-weight: 700;',
      '  color: #e75480;',
      '  letter-spacing: .04em;',
      '  flex-shrink: 0;',
      '}',

      '.cherry-main__search {',
      '  display: flex;',
      '  gap: .6em;',
      '  flex: 1;',
      '  align-items: center;',
      '}',

      '.cherry-main__search-input {',
      '  flex: 1;',
      '  padding: .5em 1em;',
      '  border-radius: .5em;',
      '  border: 2px solid rgba(255,255,255,.15);',
      '  background: rgba(255,255,255,.07);',
      '  color: #fff;',
      '  font-size: 1.1em;',
      '  outline: none;',
      '  transition: border-color .15s;',
      '}',

      '.cherry-main__search-input.focus,',
      '.cherry-main__search-input:focus {',
      '  border-color: #e75480;',
      '}',

      '.cherry-main__search-btn {',
      '  padding: .5em 1.6em;',
      '  border-radius: .5em;',
      '  background: #e75480;',
      '  color: #fff;',
      '  font-weight: 700;',
      '  font-size: 1.05em;',
      '  cursor: pointer;',
      '  transition: background .15s, transform .1s;',
      '  white-space: nowrap;',
      '}',

      '.cherry-main__search-btn.focus {',
      '  background: #ff6b9d;',
      '  transform: scale(1.04);',
      '}',

      '.cherry-main__sources-label {',
      '  font-size: .9em;',
      '  text-transform: uppercase;',
      '  letter-spacing: .12em;',
      '  color: rgba(255,255,255,.4);',
      '  padding-bottom: .3em;',
      '  border-bottom: 1px solid rgba(255,255,255,.08);',
      '}',

      '.cherry-main__sources {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 1.2em;',
      '}',

      /* ---- Source tile ----------------------------------------- */
      '.cherry-source-card {',
      '  width: 9em;',
      '  min-height: 6em;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  border-radius: .7em;',
      '  background: rgba(255,255,255,.06);',
      '  border: 2px solid transparent;',
      '  padding: 1em .8em;',
      '  cursor: pointer;',
      '  transition: border-color .15s, background .15s, transform .1s;',
      '}',

      '.cherry-source-card.focus {',
      '  border-color: #e75480;',
      '  background: rgba(231,84,128,.12);',
      '  transform: scale(1.05);',
      '}',

      '.cherry-source-card__initial {',
      '  font-size: 2em;',
      '  font-weight: 700;',
      '  color: #e75480;',
      '  line-height: 1;',
      '}',

      '.cherry-source-card__name {',
      '  font-size: .8em;',
      '  text-align: center;',
      '  color: rgba(255,255,255,.7);',
      '  margin-top: .4em;',
      '  word-break: break-word;',
      '}',

      '.cherry-source--fav .cherry-source-card__initial {',
      '  color: #ff6b9d;',
      '}',

      /* ---- Grid screen ----------------------------------------- */
      '.cherry-grid {',
      '  padding: 1.6em 2.5em;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 1.2em;',
      '  min-height: 100%;',
      '  box-sizing: border-box;',
      '}',

      '.cherry-grid__head {',
      '  flex-shrink: 0;',
      '}',

      '.cherry-grid__title {',
      '  font-size: 1.6em;',
      '  font-weight: 700;',
      '  color: #fff;',
      '}',

      '.cherry-grid__body {',
      '  flex: 1;',
      '}',

      /* Loading spinner */
      '.cherry-grid__loading {',
      '  display: none;',        /* toggled by JS */
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: .8em;',
      '  padding: 3em;',
      '  color: rgba(255,255,255,.5);',
      '  font-size: 1em;',
      '}',

      '.cherry-grid__loading[style*="block"] {',
      '  display: flex !important;',
      '}',

      '@keyframes cherry-spin {',
      '  to { transform: rotate(360deg); }',
      '}',

      '.cherry-grid__loading-spinner {',
      '  width: 2em;',
      '  height: 2em;',
      '  border: .22em solid rgba(255,255,255,.15);',
      '  border-top-color: #e75480;',
      '  border-radius: 50%;',
      '  animation: cherry-spin .8s linear infinite;',
      '  flex-shrink: 0;',
      '}',

      /* Empty state */
      '.cherry-grid__empty {',
      '  flex: 1;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: .6em;',
      '  color: rgba(255,255,255,.35);',
      '  font-size: 1.1em;',
      '}',

      '.cherry-grid__empty-icon {',
      '  font-size: 3em;',
      '  line-height: 1;',
      '}',

      /* ---- Video card ------------------------------------------ */
      /*
       * Target 4 cards per row on 1920px with sidebar ~260px ≈ 1660px wide.
       * (1660 - 4*16gap) / 4 ≈ 403px. At 20px base that is ~20.15em.
       * We use 19.5em so cards breathe a little.
       */
      /* Grid wrapper — fills scroll body, auto-flow responsive columns */
      '.cherry-cards-wrap {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(13em, 1fr));',
      '  gap: .9em;',
      '  padding: .4em 0;',
      '  width: 100%;',
      '  box-sizing: border-box;',
      '}',

      '.cherry-card {',
      '  width: 100%;',
      '  border-radius: .6em;',
      '  overflow: hidden;',
      '  background: rgba(255,255,255,.05);',
      '  border: 2px solid transparent;',
      '  cursor: pointer;',
      '  transition: border-color .15s, transform .12s, box-shadow .15s;',
      '}',

      '.cherry-card.focus {',
      '  border-color: #e75480;',
      '  transform: scale(1.04);',
      '  box-shadow: 0 .4em 2em rgba(231,84,128,.35);',
      '  z-index: 2;',
      '  position: relative;',
      '}',

      /* Thumbnail area — 16:9 */
      '.cherry-card__thumb {',
      '  position: relative;',
      '  width: 100%;',
      '  padding-top: 56.25%;',  /* 9/16 */
      '  background: #111;',
      '  overflow: hidden;',
      '}',

      '.cherry-card__img {',
      '  position: absolute;',
      '  inset: 0;',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: cover;',
      '  display: block;',
      '}',

      /* Duration badge */
      '.cherry-card__duration {',
      '  position: absolute;',
      '  bottom: .35em;',
      '  right: .45em;',
      '  background: rgba(0,0,0,.75);',
      '  color: #fff;',
      '  font-size: .72em;',
      '  padding: .12em .4em;',
      '  border-radius: .25em;',
      '  font-weight: 600;',
      '  pointer-events: none;',
      '}',

      /* Favourite heart badge */
      '.cherry-card__fav {',
      '  position: absolute;',
      '  top: .35em;',
      '  right: .45em;',
      '  color: #e75480;',
      '  font-size: 1.2em;',
      '  text-shadow: 0 1px 4px rgba(0,0,0,.6);',
      '  pointer-events: none;',
      '}',

      /* Info row */
      '.cherry-card__info {',
      '  padding: .55em .7em .65em;',
      '}',

      '.cherry-card__title {',
      '  font-size: .88em;',
      '  color: rgba(255,255,255,.92);',
      '  overflow: hidden;',
      '  display: -webkit-box;',
      '  -webkit-line-clamp: 2;',
      '  -webkit-box-orient: vertical;',
      '  line-height: 1.35;',
      '  word-break: break-word;',
      '}',

      '.cherry-card__views {',
      '  font-size: .75em;',
      '  color: rgba(255,255,255,.4);',
      '  margin-top: .25em;',
      '}',
    ];

    var style = document.createElement('style');
    style.id  = 'cherry-plugin-styles';
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
  }

  // ============================================================
  // LANG
  // ============================================================
  function addLang() {
    Lampa.Lang.add({
      cherry_search:      { ru: 'Поиск',               en: 'Search'             },
      cherry_search_hint: { ru: 'Введите запрос',      en: 'Enter a query'      },
      cherry_sources:     { ru: 'Источники',           en: 'Sources'            },
      cherry_favorites:   { ru: 'Избранное',           en: 'Favorites'          },
      cherry_no_results:  { ru: 'Нет результатов',     en: 'No results'         },
      cherry_loading:     { ru: 'Загрузка…',           en: 'Loading…'           },
      cherry_error:       { ru: 'Ошибка загрузки',     en: 'Load error'         },
      cherry_add_fav:     { ru: 'Добавлено в избранное', en: 'Added to favorites' },
      cherry_rem_fav:     { ru: 'Убрано из избранного',  en: 'Removed from favorites' },
      cherry_quality:     { ru: 'Выбор качества',      en: 'Select quality'     },
      cherry_similar:     { ru: 'Похожие видео',       en: 'Similar videos'     }
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  function startPlugin() {
    // First run: if key was never explicitly saved, store the default and notify user.
    if (Lampa.Storage.get('cherry_proxy_key', null) === null) {
      Lampa.Storage.set('cherry_proxy_key', '1206');
      setTimeout(function () {
        Lampa.Noty.show('Cherry: ключ прокси — 1206. Чтобы изменить — обновите значение cherry_proxy_key в хранилище Lampa.', { time: 7000 });
      }, 1500);
    }

    addLang();
    addTemplates();
    addStyles();

    Lampa.Component.add('cherry_main', CherryMain);
    Lampa.Component.add('cherry_grid', CherryGrid);

    var cherryIcon = [
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">',
        '<path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191',
        ' 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621',
        ' 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>',
      '</svg>'
    ].join('');

    Lampa.Menu.addButton(
      cherryIcon,
      'Cherry',
      function () {
        Lampa.Activity.push({
          component: 'cherry_main',
          title:     'Cherry',
          page:      1
        });
      }
    );

    // Revoke HLS blob URLs when the player closes to prevent memory leaks on TV devices.
    Lampa.Listener.follow('player', function (e) {
      if (e.type === 'destroy' && _blobUrls.length) {
        _blobUrls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (_) {} });
        _blobUrls = [];
      }
    });
  }

  // Handle both early-load (before app:ready) and late-load cases.
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }

  // ============================================================
  // SOURCE ADAPTERS
  // ============================================================

// ============================================================
// CHERRY — SOURCE ADAPTERS TIER 1
// Eporner, Pornhub, Xvideos, Xnxx, Spankbang,
// Hqporner, Youjizz, Tizam, Ebalovo, HellPorno, NoodleMagazine
// ============================================================

// ---- Shared helpers ----

function parseDur(str) {
  if (!str) return 0;
  str = ('' + str).trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  var mms = str.match(/(\d+)m\s*(\d+)s/i);
  if (mms) return parseInt(mms[1], 10) * 60 + parseInt(mms[2], 10);
  var mm = str.match(/(\d+)m/i);
  if (mm) return parseInt(mm[1], 10) * 60;
  var p = str.split(':').map(Number);
  if (p.length === 2) return p[0] * 60 + p[1];
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  return 0;
}

function parseViews(str) {
  if (!str) return 0;
  str = ('' + str).replace(/[,\s]/g, '');
  if (/k$/i.test(str)) return Math.round(parseFloat(str) * 1000) || 0;
  if (/m$/i.test(str)) return Math.round(parseFloat(str) * 1000000) || 0;
  return parseInt(str, 10) || 0;
}

function extractStreams(html) {
  var quality = {};
  var url = '';
  var m;
  // KVS get_file pattern
  var kvs = html.match(/https?:\/\/[^"'\s]+get_file[^"'\s]+\.mp4[^"'\s]*/g);
  if (kvs) kvs.forEach(function(u) { var q = (u.match(/(\d{3,4}p)/i) || ['', 'mp4'])[1]; quality[q] = u; });
  // Source tags with res/label/title attribute (both orders)
  var srcRe = /<source\s[^>]*src="([^"]+)"[^>]*(?:res|label|title)="([^"]+)"/gi;
  while ((m = srcRe.exec(html)) !== null) quality[m[2]] = m[1];
  var srcRe2 = /<source\s[^>]*(?:res|label|title)="([^"]+)"[^>]*src="([^"]+)"/gi;
  while ((m = srcRe2.exec(html)) !== null) quality[m[1]] = m[2];
  // JWPlayer sources:[...] array multi-quality branch
  function findMatchingBracket(str, openIdx, openCh, closeCh) {
    var depth = 0, inStr = false, strCh = '';
    for (var i = openIdx; i < str.length; i++) {
      var c = str[i];
      if (inStr) {
        if (c === strCh) {
          var bs = 0;
          for (var j = i - 1; j >= 0 && str[j] === '\\'; j--) bs++;
          if (bs % 2 === 0) inStr = false;
        }
        continue;
      }
      if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
      // Track depth for both bracket types — handles mixed [{...}, {...}] nesting
      if (c === '{' || c === '[') { depth++; continue; }
      if (c === closeCh || c === '}' || c === ']') {
        if (--depth === 0) return i;
      }
    }
    return -1;
  }
  var srcArrayM = /sources\s*:\s*\[/i.exec(html);
  if (srcArrayM) {
    var arrOpen = html.indexOf('[', srcArrayM.index + srcArrayM[0].length - 1);
    if (arrOpen !== -1) {
      var arrClose = findMatchingBracket(html, arrOpen, '[', ']');
      if (arrClose !== -1) {
        var block = html.slice(arrOpen + 1, arrClose);
        var fileRe2  = /['"]file['"]\s*:\s*['"]([^'"]+\.(?:mp4|m3u8))['"]/i;
        var labelRe2 = /['"]label['"]\s*:\s*['"]([^'"]+)['"]/i;
        var bi = 0;
        while (bi < block.length) {
          var objStart = block.indexOf('{', bi);
          if (objStart === -1) break;
          var objEnd = findMatchingBracket(block, objStart, '{', '}');
          if (objEnd === -1) break;
          var obj = block.slice(objStart, objEnd + 1);
          var fm2 = fileRe2.exec(obj);
          var lm2 = labelRe2.exec(obj);
          if (fm2 && lm2 && !quality[lm2[1]]) quality[lm2[1]] = fm2[1];
          bi = objEnd + 1;
        }
      }
    }
  }
  // JWPlayer / generic file
  var jwRe = /['"]file['"]\s*:\s*['"]([^'"]+\.(?:mp4|m3u8))['"]/g;
  while ((m = jwRe.exec(html)) !== null) { if (!url) url = m[1]; }
  // Plain source tags
  var plainRe = /<source\s[^>]*src="([^"]+\.(?:mp4|m3u8)[^"']*)"/gi;
  while ((m = plainRe.exec(html)) !== null) { if (!url) url = m[1]; }
  // Fallback: find any mp4 URL (http/https or protocol-relative)
  if (!url && !Object.keys(quality).length) {
    var any = html.match(/(?:https?:)?\/\/[^"'\s]+\.mp4[^"'\s]*/);
    if (any) url = any[0];
  }
  if (!url && Object.keys(quality).length) url = quality[Object.keys(quality)[0]];
  // Normalize protocol-relative URLs to https://
  function fixProto(u) { return (u && u.slice(0, 2) === '//') ? 'https:' + u : u; }
  url = fixProto(url);
  Object.keys(quality).forEach(function(k) { quality[k] = fixProto(quality[k]); });
  return { url: url, quality: quality };
}

// Strip HTML tags from a string
function stripTags(str) {
  return (str || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
}

// ============================================================
// CHERRY — SOURCE ADAPTERS TIER 2
// Porntrex, Xozilla, 3Movs, Analdin, PornVe, FamilyPorn,
// Porndig, CrocoTube, Huyamba, VePorn, Ebun, LenPorno,
// 24Rolika, JopaOnline, PornOne, Pornobolt, PerfektDamen, GayPornTube
// ============================================================

// ---------------------------------------------------------------------------
// Shared card parser utilities
// ---------------------------------------------------------------------------

/**
 * Extract text content from an HTML attribute or tag region.
 * @param {string} html
 * @param {RegExp} rx
 * @param {number} [group=1]
 * @returns {string}
 */
function _attr(html, rx, group) {
    var m = rx.exec(html);
    return m ? (m[group != null ? group : 1] || '').trim() : '';
}

/**
 * Decode common HTML entities found in title strings.
 * @param {string} str
 * @returns {string}
 */
function _decodeHtml(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
}

/**
 * Split an HTML string into per-card chunks.
 * @param {string} html
 * @param {RegExp} splitRx  — pattern that marks the start of each card block
 * @returns {string[]}
 */
function _splitCards(html, splitRx) {
    var parts = html.split(splitRx);
    parts.shift(); // first element is content before first match
    return parts;
}

/**
 * Pick the highest MP4 quality label from a set of KVS stream URLs.
 * Labels found in filename portion: _480p, _720p, _1080p, _2160p.
 * @param {string[]} urls
 * @returns {{url: string, quality: Object}}
 */
function _kvsPickBest(urls) {
    var order = ['2160p', '1080p', '720p', '480p', '360p', '240p'];
    var quality = {};
    var best = '';
    var bestIdx = order.length;

    urls.forEach(function (u) {
        var labelMatch = /[_-](\d+p)\./i.exec(u);
        var label = labelMatch ? labelMatch[1].toLowerCase() : 'default';
        quality[label] = u;
        var idx = order.indexOf(label);
        if (idx === -1) idx = order.length - 1;
        if (idx < bestIdx) {
            bestIdx = idx;
            best = u;
        }
    });

    if (!best && urls.length) best = urls[0];
    return { url: best, quality: quality };
}

// ---- Pornhub ----
SOURCES.push({
  id: 'pornhub',
  name: 'Pornhub',
  host: 'pornhub.com',

  _mapVideo: function(v) {
    var thumb = '';
    if (v.thumbs && v.thumbs.length) thumb = v.thumbs[v.thumbs.length - 1].src || v.thumbs[0].src || '';
    // Extract video ID from URL for stable id
    var idMatch = (v.url || '').match(/viewkey=([a-z0-9]+)/i);
    var id = idMatch ? idMatch[1] : (v.video_id ? String(v.video_id) : String(Math.random()));
    return {
      id: id,
      source: 'pornhub',
      title: v.title || '',
      thumb: thumb,
      url: v.url ? (v.url.indexOf('http') === 0 ? v.url : 'https://www.pornhub.com' + v.url) : '',
      duration: parseDur(v.duration),
      views: parseViews(String(v.views || 0))
    };
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://www.pornhub.com/webmasters/search?search=' + encodeURIComponent(query) +
      '&page=' + p + '&ordering=mostviewed&thumbsize=medium_hd';
    return cherryFetch(url).then(function(text) {
      var data = JSON.parse(text);
      var videos = data.videos || (data.data && data.data.videos) || [];
      var items = videos.map(function(v) { return self._mapVideo(v); });
      return { items: items, total_pages: parseInt(data.total_pages || data.pagesTotal || 1, 10) };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://www.pornhub.com/webmasters/search?search=&page=' + p +
      '&ordering=mostviewed&thumbsize=medium_hd';
    return cherryFetch(url).then(function(text) {
      var data = JSON.parse(text);
      var videos = data.videos || (data.data && data.data.videos) || [];
      var items = videos.map(function(v) { return self._mapVideo(v); });
      return { items: items, total_pages: parseInt(data.total_pages || data.pagesTotal || 1, 10) };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      var fvMatch = html.match(/var\s+flashvars_\d+\s*=\s*(\{[\s\S]+?\});\s*\n/) ||
                   html.match(/var\s+flashvars_\d+\s*=\s*(\{[\s\S]+?\});/);
      if (!fvMatch) return { url: '', quality: {} };

      var flashvars;
      try { flashvars = JSON.parse(fvMatch[1]); } catch (e) { return { url: '', quality: {} }; }

      var defs = flashvars.mediaDefinitions || [];
      var hlsUrls = {};   // { "1080p": "https://...m3u8" }
      var mp4Urls = {};   // { "1080p": "https://...mp4"  }

      defs.forEach(function(def) {
        var qNum = parseInt(def.quality, 10) || 0;
        if (!qNum) return;
        // Clean escaped slashes that Pornhub embeds in JSON strings
        var vUrl = (def.videoUrl || '').replace(/\\\//g, '/').replace(/\/\/\//g, '//');
        if (!vUrl) return;
        var label = def.quality + 'p';
        if (def.format === 'hls')      hlsUrls[label] = vUrl;
        else if (def.format === 'mp4') mp4Urls[label] = vUrl;
      });

      // Prefer MP4 (no CORS issue with HLS segments).
      if (Object.keys(mp4Urls).length) {
        return { url: bestQualityUrl(mp4Urls), quality: mp4Urls };
      }

      // HLS only: proxy-rewrite each quality m3u8 to bypass CDN CORS.
      if (Object.keys(hlsUrls).length) {
        var labels = Object.keys(hlsUrls);
        return Promise.all(labels.map(function(lbl) {
          return proxyM3u8(hlsUrls[lbl], 'https://www.pornhub.com/').then(function(blob) {
            return { lbl: lbl, blob: blob };
          }).catch(function() { return { lbl: lbl, blob: hlsUrls[lbl] }; });
        })).then(function(results) {
          var quality = {};
          results.forEach(function(r) { quality[r.lbl] = r.blob; });
          return { url: bestQualityUrl(quality), quality: quality };
        });
      }

      return { url: '', quality: {} };
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- Xvideos ----
SOURCES.push({
  id: 'xvideos',
  name: 'Xvideos',
  host: 'xvideos2.com',

  _parseCards: function(html, page) {
    var items = [];
    // Split on thumb-block divs (handles double-space and modifier classes)
    var blocks = html.split(/<div[^>]+class="[^"]*thumb-block[^"]*"/);
    // Skip first element (it's content before the first block)
    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i];
      // New URL format: /video.TOKEN/slug  (TOKEN is alphanumeric, replaces old /video{numId}/)
      var hrefMatch = block.match(/href="(\/video\.([a-z0-9]+)\/[^"]+)"/);
      if (!hrefMatch) continue;
      var href = hrefMatch[1];
      var numId = hrefMatch[2];
      var videoUrl = 'https://www.xvideos2.com' + href;

      var thumbMatch = block.match(/data-src="([^"]+)"/) || block.match(/src="([^"]+\.jpg[^"]*)"/);
      var thumb = thumbMatch ? thumbMatch[1] : '';

      var titleMatch = block.match(/<p[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)/) ||
                       block.match(/title="([^"]+)"/);
      var title = titleMatch ? stripTags(titleMatch[1]) : '';

      var durMatch = block.match(/<span[^>]*class="[^"]*duration[^"]*"[^>]*>([^<]+)/);
      var duration = durMatch ? parseDur(durMatch[1].trim()) : 0;

      if (!numId && href) {
        var idFromHref = href.match(/video(\d+)\//);
        numId = idFromHref ? idFromHref[1] : String(i);
      }

      items.push({
        id: 'xv' + numId,
        source: 'xvideos',
        title: title,
        thumb: thumb,
        url: videoUrl,
        duration: duration,
        views: 0
      });
    }
    return items;
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    // Xvideos p is 0-indexed
    var url = 'https://www.xvideos2.com/?k=' + encodeURIComponent(query) + '&p=' + (p - 1);
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html, p);
      return { items: items, total_pages: p + 10 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var pageIdx = p - 1;
    // xvideos2.com: root for page 1, /new/(N-1) for subsequent pages
    var url = pageIdx === 0 ? 'https://www.xvideos2.com/' : 'https://www.xvideos2.com/new/' + pageIdx;
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html, p);
      return { items: items, total_pages: p + 10 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      var hlsMatch = html.match(/(?:html5player\.)?setVideoHLS\s*\(\s*['"]([^'"]+)['"]\)/);
      var highMatch = html.match(/(?:html5player\.)?setVideoUrlHigh\s*\(\s*['"]([^'"]+)['"]\)/);
      var lowMatch = html.match(/(?:html5player\.)?setVideoUrlLow\s*\(\s*['"]([^'"]+)['"]\)/);

      var hlsUrl = hlsMatch ? hlsMatch[1] : '';
      var highUrl = highMatch ? highMatch[1] : '';
      var lowUrl = lowMatch ? lowMatch[1] : '';

      var quality = {};
      // HLS carries 720p/1080p variants; prefer it over single-bitrate SD MP4
      if (hlsUrl) quality['HLS'] = hlsUrl;
      if (highUrl) quality['High'] = highUrl;
      if (lowUrl && lowUrl !== highUrl) quality['Low'] = lowUrl;

      var url = hlsUrl || highUrl || lowUrl;
      return url ? { url: url, quality: quality } : { url: '', quality: {} };
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- Xnxx ----
SOURCES.push({
  id: 'xnxx',
  name: 'Xnxx',
  host: 'xnxx.com',

  _parseCards: function(html) {
    var items = [];
    // Narrow to the mozaique container
    var mozParts = html.split('<div class="mozaique"');
    var content = mozParts.length > 1 ? mozParts[mozParts.length - 1] : html;

    var blocks = content.split(/<div[^>]+class="[^"]*thumb-under[^"]*"/);
    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i];
      var hrefMatch = block.match(/href="(\/video-?([^/]+)\/[^"]+)"/);
      if (!hrefMatch) {
        hrefMatch = block.match(/href="(\/video([a-z0-9]+)[^"]*)"/) ;
      }
      if (!hrefMatch) continue;

      var href = hrefMatch[1];
      var rawId = hrefMatch[2] || '';
      var videoUrl = 'https://www.xnxx.com' + href;

      var thumbMatch = block.match(/data-src="([^"]+)"/) || block.match(/src="([^"]+\.jpg[^"]*)"/);
      var thumb = thumbMatch ? thumbMatch[1] : '';

      var titleMatch = block.match(/class="title"[^>]*>([^<]+)/) ||
                       block.match(/title="([^"]+)"/) ||
                       block.match(/<a[^>]+>([^<]{5,})/);
      var title = titleMatch ? stripTags(titleMatch[1]) : '';

      // Duration often in a metadata span
      var durMatch = block.match(/<span[^>]*class="[^"]*metadata[^"]*"[^>]*>([\d:]+)/) ||
                     block.match(/<span[^>]+>([\d:]+)<\/span>/);
      var duration = durMatch ? parseDur(durMatch[1].trim()) : 0;

      items.push({
        id: 'xnxx-' + rawId,
        source: 'xnxx',
        title: title,
        thumb: thumb,
        url: videoUrl,
        duration: duration,
        views: 0
      });
    }
    return items;
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    // Space → + in URL, page appended as /{p}
    var q = encodeURIComponent(query).replace(/%20/g, '+');
    var url = 'https://www.xnxx.com/search/' + q + '/' + p;
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      return { items: items, total_pages: p + 10 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://www.xnxx.com/?k=new&p=' + (p - 1);
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      return { items: items, total_pages: p + 10 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      var hlsMatch = html.match(/(?:html5player\.)?setVideoHLS\s*\(\s*['"]([^'"]+)['"]\)/);
      var highMatch = html.match(/(?:html5player\.)?setVideoUrlHigh\s*\(\s*['"]([^'"]+)['"]\)/);
      var lowMatch = html.match(/(?:html5player\.)?setVideoUrlLow\s*\(\s*['"]([^'"]+)['"]\)/);

      var hlsUrl = hlsMatch ? hlsMatch[1] : '';
      var highUrl = highMatch ? highMatch[1] : '';
      var lowUrl = lowMatch ? lowMatch[1] : '';

      var quality = {};
      if (hlsUrl) quality['HLS'] = hlsUrl;
      if (highUrl) quality['MP4 High'] = highUrl;
      if (lowUrl) quality['MP4 Low'] = lowUrl;

      var url = hlsUrl || highUrl || lowUrl || '';
      return { url: url, quality: quality };
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- Eporner ----
SOURCES.push({
  id: 'eporner',
  name: 'Eporner',
  host: 'eporner.com',

  _apiFetch: function(url) {
    // eporner API supports Access-Control-Allow-Origin: * — direct fetch bypasses CF datacenter IP block
    return fetch(url).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  },

  _mapVideo: function(v) {
    return {
      id: String(v.id),
      source: 'eporner',
      title: v.title || '',
      thumb: (v.default_thumb && v.default_thumb.src) ? v.default_thumb.src : '',
      url: v.url || ('https://www.eporner.com/hd-porn/' + v.id + '/'),
      duration: parseInt(v.length_sec, 10) || 0,
      views: parseInt(v.views, 10) || 0
    };
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://www.eporner.com/api/v2/video/search/?query=' + encodeURIComponent(query) +
      '&per_page=30&page=' + p + '&thumbsize=medium&order=most-popular&gay=0&format=json';
    return self._apiFetch(url).then(function(text) {
      var data = JSON.parse(text);
      return { items: (data.videos || []).map(self._mapVideo), total_pages: parseInt(data.total_pages, 10) || 1 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://www.eporner.com/api/v2/video/search/?query=&per_page=30&page=' + p +
      '&thumbsize=medium&order=most-popular&gay=0&format=json';
    return self._apiFetch(url).then(function(text) {
      var data = JSON.parse(text);
      return { items: (data.videos || []).map(self._mapVideo), total_pages: parseInt(data.total_pages, 10) || 1 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    var self = this;
    var id = video.id;
    var pageUrl = 'https://www.eporner.com/hd-porn/' + id + '/';
    return self._apiFetch(pageUrl).then(function(html) {
      var hashM = html.match(/(?:EHH|hash)\s*[=:]\s*['"]([0-9a-f]{32})['"]/i);
      if (!hashM) throw new Error('eporner: hash not found');
      var raw = hashM[1];
      var computed = [raw.slice(0,8), raw.slice(8,16), raw.slice(16,24), raw.slice(24,32)]
        .map(function(c) { return parseInt(c, 16).toString(36); }).join('');
      var xhrUrl = 'https://www.eporner.com/xhr/video/' + id +
        '?hash=' + computed + '&device=generic&domain=www.eporner.com&fallback=false';
      return self._apiFetch(xhrUrl);
    }).then(function(text) {
      var data = JSON.parse(text);
      var mp4 = data.sources && data.sources.mp4;
      if (!mp4) return { url: '', quality: {} };
      var quality = {};
      Object.keys(mp4).forEach(function(lbl) {
        if (mp4[lbl] && mp4[lbl].src) quality[lbl] = mp4[lbl].src;
      });
      return { url: bestQualityUrl(quality), quality: quality };
    }).catch(function() {
      return { url: '', quality: {} };
    });
  }
});

// ---- Spankbang ----
SOURCES.push({
  id: 'spankbang',
  name: 'Spankbang',
  host: 'spankbang.com',

  _parseCards: function(html) {
    var items = [];
    var blocks = html.split(/<div[^>]+class="[^"]*video[_-]item[^"]*"/);
    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i];
      // href pattern: /{id}/video/
      var hrefMatch = block.match(/href="\/([\w-]+)\/video\//);
      if (!hrefMatch) continue;
      var id = hrefMatch[1];
      var videoUrl = 'https://spankbang.com/' + id + '/video/';

      var thumbMatch = block.match(/data-src="([^"]+)"/) || block.match(/src="([^"]+\.jpg[^"]*)"/);
      var thumb = thumbMatch ? thumbMatch[1] : '';

      // Title: class with "n" or similar label
      var titleMatch = block.match(/<div[^>]*class="[^"]*\bn\b[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
                       block.match(/title="([^"]+)"/) ||
                       block.match(/<a[^>]+title="([^"]+)"/);
      var title = titleMatch ? stripTags(titleMatch[1]) : '';

      // Duration: span class "i-f" or similar
      var durMatch = block.match(/<span[^>]*class="[^"]*i-f[^"]*"[^>]*>([^<]+)/) ||
                     block.match(/<span[^>]*class="[^"]*duration[^"]*"[^>]*>([^<]+)/);
      var duration = durMatch ? parseDur(durMatch[1].trim()) : 0;

      items.push({
        id: 'sb-' + id,
        source: 'spankbang',
        title: title,
        thumb: thumb,
        url: videoUrl,
        duration: duration,
        views: 0
      });
    }
    return items;
  },

  _parseTotalPages: function(html) {
    // Look for last page number in pagination links
    var pageNums = [];
    var re = /href="[^"]*\/(\d+)\/"[^>]*>[^<]*\d/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var n = parseInt(m[1], 10);
      if (!isNaN(n) && n > 0) pageNums.push(n);
    }
    if (pageNums.length) return Math.max.apply(null, pageNums);
    return 20;
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    var q = encodeURIComponent(query);
    var url = 'https://spankbang.com/s/' + q + '/' + p + '/';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      var total = self._parseTotalPages(html);
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://spankbang.com/new/' + p + '/';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      var total = self._parseTotalPages(html);
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      // Phase 1: try streamkey → POST API
      var skMatch = html.match(/data-streamkey="([^"]+)"/);
      if (skMatch) {
        var streamkey = skMatch[1];
        return cherryPost(
          'https://spankbang.com/api/videos/stream',
          'id=' + streamkey + '&data=0'
        ).then(function(text) {
          var data;
          try { data = JSON.parse(text); } catch (e) { return { url: '', quality: {} }; }
          var q = {};
          Object.keys(data).forEach(function(k) {
            if (typeof data[k] === 'string' && data[k].indexOf('http') === 0) q[k] = data[k];
          });
          var best = q['1080p'] || q['720p'] || q[Object.keys(q)[0]] || '';
          return { url: best, quality: q };
        }).catch(function() { return extractStreams(html); });
      }
      // Phase 2: fallback extractStreams
      return extractStreams(html);
    }).catch(function() { return { url: '', quality: {} }; });
  }
});


// ---- HQPorner ----
SOURCES.push({
  id: 'hqporner',
  name: 'HQPorner',
  host: 'hqporner.com',

  _parseCards: function(html) {
    var items = [];
    var seen = {};
    // Cards are in <section class="box feature"> blocks; skip first (site header)
    var raw = html.split('<section class="box feature"');
    for (var i = 2; i < raw.length; i++) {
      var block = raw[i];
      var hrefMatch = block.match(/href="((?:https?:\/\/hqporner\.com)?\/hdporn\/[^"]+)"/);
      if (!hrefMatch) continue;
      var videoUrl = hrefMatch[1].charAt(0) === '/'
        ? 'https://hqporner.com' + hrefMatch[1]
        : hrefMatch[1];

      var idMatch = videoUrl.match(/\/hdporn\/([^/]+?)(?:\.html)?(?:\/)?$/);
      var id = idMatch ? idMatch[1] : videoUrl;
      if (seen[id]) continue;
      seen[id] = true;

      // Thumbnail: in defaultImage(...) or first img
      var thumbMatch = block.match(/defaultImage\("(\/\/[^"]+_main\.jpg)"/) ||
                       block.match(/<img[^>]*src="([^"]+)"/);
      var rawThumb = thumbMatch ? (thumbMatch[1].charAt(0) === '/' ? 'https:' + thumbMatch[1] : thumbMatch[1]) : '';
      // CDN blocks direct hotlink access — route through proxy
      var thumb = rawThumb ? buildProxyUrl(rawThumb) : '';

      // Title: in <h3 class="meta-data-title"><a>TITLE</a></h3>
      var titleMatch = block.match(/<h3[^>]*meta-data-title[^>]*><a[^>]*>([^<]+)<\/a>/) ||
                       block.match(/<h3[^>]*><a[^>]*>([^<]+)<\/a>/);
      var slug = id.replace(/^\d+-/, '').replace(/_/g, ' ');
      var title = titleMatch ? stripTags(titleMatch[1]) : slug;

      // Duration: "12m 28s" format in <span class="icon fa-clock-o...">
      var durMatch = block.match(/fa-clock-o[^>]*>([^<]+)/) ||
                     block.match(/([\d]+:[\d]{2})/);
      var duration = durMatch ? parseDur(durMatch[1].trim()) : 0;

      items.push({
        id: 'hqp-' + id,
        source: 'hqporner',
        title: title,
        thumb: thumb,
        url: videoUrl,
        duration: duration,
        views: 0
      });
    }
    return items;
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    var slug = query.toLowerCase().replace(/\s+/g, '-');
    var url = p > 1
      ? 'https://hqporner.com/search/' + slug + '/' + p + '/'
      : 'https://hqporner.com/search/' + slug + '/';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      // Try to find total pages from pagination
      var pgRe2 = new RegExp('\\/search\\/' + slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\/(\\d+)\\/', 'g');
      var total = 1;
      var pgm;
      while ((pgm = pgRe2.exec(html)) !== null) {
        var n2 = parseInt(pgm[1], 10);
        if (n2 > total) total = n2;
      }
      if (total < p) total = p + 5;
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var url = p > 1 ? 'https://hqporner.com/hdporn/' + p : 'https://hqporner.com/';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      // Pagination: look for highest page number in /hdporn/N links
      var pgNums = [];
      var pgRe = /\/hdporn\/(\d+)/g;
      var m;
      while ((m = pgRe.exec(html)) !== null) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n)) pgNums.push(n);
      }
      var total = pgNums.length ? Math.max.apply(null, pgNums) : p + 5;
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      // HQPorner loads its player via AJAX: url: '/blocks/altplayer.php?i=//mydaddy.cc/video/ID/'
      var embedM = /url:\s*['"]\/blocks\/altplayer\.php\?i=\/\/mydaddy\.cc\/video\/([^'"\/]+)\//i.exec(html);
      if (embedM) {
        return cherryFetch('https://mydaddy.cc/video/' + embedM[1] + '/').then(function(embedHtml) {
          var clean = embedHtml.replace(/\\"/g, '"');
          // bigcdn.cc serves multi-quality: //sN.bigcdn.cc/pubs/HASH/HEIGHT.mp4
          // Hash may contain dots (e.g. "6a14af53d51110.31758800") — use [^/\s"']+ instead of hex
          var bigRe = /(?:https?:)?\/\/(s\d+\.bigcdn\.cc)\/pubs\/([^\/\s"']+)\/(\d{3,4})\.mp4/gi;
          var hashM = bigRe.exec(clean);
          if (hashM) {
            var cdnHost = hashM[1], hash = hashM[2];
            // Collect all heights present in the HTML to only offer existing qualities
            bigRe.lastIndex = 0;
            var seenHeights = {};
            var hm2;
            while ((hm2 = bigRe.exec(clean)) !== null) {
              if (hm2[2] === hash) seenHeights[hm2[3]] = true;
            }
            var heights = Object.keys(seenHeights).length ? Object.keys(seenHeights) : [hashM[3]];
            heights.sort(function(a, b) { return parseInt(a, 10) - parseInt(b, 10); });
            var quality = {};
            heights.forEach(function(h) {
              quality[h + 'p'] = buildProxyUrl('https://' + cdnHost + '/pubs/' + hash + '/' + h + '.mp4', 'https://mydaddy.cc/');
            });
            var best = quality[heights[heights.length - 1] + 'p'];
            return { url: best, quality: quality };
          }
          var result = extractStreams(clean);
          return result.url ? result : { url: '', quality: {} };
        }).catch(function() { return { url: '', quality: {} }; });
      }
      return extractStreams(html);
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- YouJizz ----
SOURCES.push({
  id: 'youjizz',
  name: 'YouJizz',
  host: 'youjizz.com',

  _parseCards: function(html) {
    var items = [];
    var blocks = html.split('<div class="video-thumb"');

    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i];
      var hrefMatch = block.match(/href="(\/videos\/[^"]+\.html)"/);
      if (!hrefMatch) continue;
      var href = hrefMatch[1];
      var videoUrl = 'https://www.youjizz.com' + href;

      // ID: digits from /videos/{slug}-{id}.html
      var idMatch = href.match(/(\d+)\.html/);
      var id = idMatch ? idMatch[1] : String(i);

      var thumbMatch = block.match(/data-original="([^"?#]+\.jpe?g)/i) ||
                       block.match(/data-src="([^"?#]+\.jpe?g)/i) ||
                       block.match(/src="([^"?#]+\.jpe?g)/i);
      var thumb = thumbMatch ? thumbMatch[1] : '';

      var titleMatch = block.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      var title = titleMatch ? stripTags(titleMatch[1]) : '';
      if (!title) {
        var altTitle = block.match(/title="([^"]+)"/);
        title = altTitle ? altTitle[1] : '';
      }

      var durMatch = block.match(/<div[^>]*class="[^"]*duration[^"]*"[^>]*>([^<]+)/);
      var duration = durMatch ? parseDur(durMatch[1].trim()) : 0;

      items.push({
        id: 'yj-' + id,
        source: 'youjizz',
        title: title,
        thumb: thumb,
        url: videoUrl,
        duration: duration,
        views: 0
      });
    }
    return items;
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    var q = encodeURIComponent(query);
    var url = 'https://www.youjizz.com/search/videos/' + q + '-' + p + '.html';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      // Pagination: look for highest page link
      var pgNums = [];
      var pgRe = /\/search\/videos\/[^"]*-(\d+)\.html/g;
      var m;
      while ((m = pgRe.exec(html)) !== null) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n)) pgNums.push(n);
      }
      var total = pgNums.length ? Math.max.apply(null, pgNums) : p + 5;
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    // youjizz.com/videos/newest-N.html returns 500; use homepage instead
    var url = 'https://www.youjizz.com/';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      return { items: items, total_pages: 1 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      var encMatch = html.match(/Encodings\s*=\s*(\[[\s\S]+?\]);/);
      if (!encMatch) return extractStreams(html);

      var encodings;
      try { encodings = JSON.parse(encMatch[1]); } catch (e) { return extractStreams(html); }

      if (!encodings || !encodings.length) return extractStreams(html);

      var quality = {};
      var firstUrl = '';

      encodings.forEach(function(enc) {
        // Each entry: { filename: 'url', quality: '720', ... }
        var u = enc.filename || enc.url || enc.file || '';
        if (!u) return;
        if (!firstUrl) firstUrl = u;
        var label = enc.quality ? enc.quality + 'p' : (enc.label || enc.format || 'mp4');
        quality[label] = u;
      });

      return { url: firstUrl, quality: quality };
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- 15. PornOne ----
SOURCES.push({
    id: 'pornone',
    name: 'PornOne',
    host: 'pornone.com',

    // WP REST API is tried first; HTML scraping is the fallback.
    _fromApi: function (text) {
        var posts;
        try { posts = JSON.parse(text); } catch (e) { return null; }
        if (!Array.isArray(posts) || !posts.length) return null;
        return posts.map(function (p) {
            var thumb = '';
            try { thumb = p._embedded['wp:featuredmedia'][0].source_url || ''; } catch (e) {}
            return {
                id:       String(p.id),
                source:   'pornone',
                title:    _decodeHtml((p.title && p.title.rendered) || ''),
                thumb:    thumb,
                url:      p.link || '',
                duration: 0,
                views:    0
            };
        });
    },

    search: function (query, page) {
        var self = this;
        var p = page || 1;
        var apiUrl = 'https://pornone.com/wp-json/wp/v2/posts?search=' +
            encodeURIComponent(query) + '&per_page=20&page=' + p +
            '&_embed=wp%3Afeaturedmedia&_fields=id,title,link,_embedded';
        return cherryFetch(apiUrl).then(function (text) {
            var items = self._fromApi(text);
            if (items) return { items: items, total_pages: p + 5 };
            throw new Error('api-empty');
        }).catch(function () {
            var url = 'https://pornone.com/?s=' + encodeURIComponent(query) + '&paged=' + p;
            return cherryFetch(url).then(function (html) {
                return { items: _pornoneCards(html), total_pages: _pornonePages(html) };
            }).catch(function () { return { items: [], total_pages: 0 }; });
        });
    },

    browse: function (category, page) {
        var self = this;
        var p = page || 1;
        var apiUrl = 'https://pornone.com/wp-json/wp/v2/posts?orderby=date&order=desc' +
            '&per_page=20&page=' + p +
            '&_embed=wp%3Afeaturedmedia&_fields=id,title,link,_embedded';
        return cherryFetch(apiUrl).then(function (text) {
            var items = self._fromApi(text);
            if (items) return { items: items, total_pages: p + 10 };
            throw new Error('api-empty');
        }).catch(function () {
            var url = p > 1
                ? 'https://pornone.com/page/' + p + '/'
                : 'https://pornone.com/';
            return cherryFetch(url).then(function (html) {
                return { items: _pornoneCards(html), total_pages: _pornonePages(html) };
            }).catch(function () { return { items: [], total_pages: 0 }; });
        });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // Unescape JS-escaped slashes/quotes (WP JSON embed patterns)
            var clean = html.replace(/\\\//g, '/').replace(/\\"/g, '"');
            var result = extractStreams(clean);
            if (result.url) {
                // Pre-proxy with pornone.com referer so CDN accepts the request
                var q = {};
                Object.keys(result.quality).forEach(function(k) {
                    q[k] = buildProxyUrl(result.quality[k], 'https://pornone.com/');
                });
                return { url: buildProxyUrl(result.url, 'https://pornone.com/'), quality: q };
            }
            // Pornone-specific: FluidPlayer sources array or plain video URL in script
            var m = clean.match(/['"](?:file|src|source|video_url|videoUrl)['"][\s:,]+['"]([^'"]+\.(?:mp4|m3u8)[^'"]*)['"]/i) ||
                    clean.match(/["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)['"]/i);
            if (m) return { url: buildProxyUrl(m[1], 'https://pornone.com/'), quality: {} };
            return { url: '', quality: {} };
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _pornoneCards(html) {
    var items = [];
    // Video URLs on pornone end with / and contain a slug — filter out pure nav links
    var hrefRx = /href="(https?:\/\/pornone\.com\/([^"?#]+)\/)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var slug = m[2];
        // Skip single-segment nav URLs: reserved words, 2-letter lang codes, bare numbers
        if (!slug || (slug.indexOf('/') === -1 && /^(?:page|category|tag|search|feed|wp-content|[a-z]{2}|\d+)$/i.test(slug))) continue;
        // Extract numeric ID from slug (pornone: category/title-slug/ID)
        var slugParts = slug.split('/');
        var numId = '';
        for (var pi = slugParts.length - 1; pi >= 0; pi--) {
            if (/^\d+$/.test(slugParts[pi])) { numId = slugParts[pi]; break; }
        }
        var id = numId || slug.replace(/[^a-z0-9]/gi, '_');
        if (!id || seen[id]) continue;
        seen[id] = true;
        // Title derived from URL slug (segment before the numeric ID)
        var titleSlug = slugParts.length >= 2 ? slugParts[slugParts.length - (numId ? 2 : 1)] : slug;
        var derivedTitle = titleSlug ? titleSlug.replace(/-/g, ' ') : '';

        // Chunk: pornone img+title appear ~1200+ chars AFTER the href → need 2500 forward
        var chunk = html.slice(m.index, m.index + 2500);

        // Thumb: CDN img at th-eu4.pornone.com/t/{id%100}/{id}/d{n}.jpg
        var thumb = _attr(chunk, /src="(https:\/\/th-eu4\.pornone\.com\/t\/\d+\/\d+\/d\d+\.jpe?g)"/i) ||
                    _attr(chunk, /src="(https?:\/\/th-eu4\.pornone\.com\/[^"]+\.jpe?g)"/i);

        var title = _decodeHtml(
            _attr(chunk, /<div[^>]*class="[^"]*videotitle[^"]*"[^>]*>([^<]+)<\/div>/) ||
            _attr(chunk, /th-eu4\.pornone\.com\/t\/[^"]+"\s+alt="([^"]{10,})"/) ||
            derivedTitle
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'pornone', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _pornonePages(html) {
    // WP pagination uses ?paged=N (search) or /page/N/ (browse)
    var m = /paged=(\d+)["'][^>]*(?:last|>>)/i.exec(html) ||
            /\/page\/(\d+)\/["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 1. Porntrex ----
SOURCES.push({
    id: 'porntrex',
    name: 'Porntrex',
    host: 'porntrex.com',

    search: function (query, page) {
        var url = 'https://www.porntrex.com/?s=' + encodeURIComponent(query) + '&page=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _porntrexCards(html), total_pages: _porntrexPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var p = page || 1;
        var url = 'https://www.porntrex.com/latest-updates/' + (p > 1 ? p + '/' : '');
        return cherryFetch(url).then(function (html) {
            return { items: _porntrexCards(html), total_pages: _porntrexPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // KVS get_file — collect all MP4 URLs from get_file paths
            var kvsRx = /get_file\/[^\s"'<>]+\.mp4[^\s"'<>]*/g;
            var found = [];
            var m;
            while ((m = kvsRx.exec(html)) !== null) {
                var candidate = m[0].replace(/['">\s]+$/, '');
                // Reconstruct absolute URL if the match lacks scheme
                var full = /^https?:\/\//i.test(candidate)
                    ? candidate
                    : 'https://www.porntrex.com/' + candidate.replace(/^\//, '');
                if (found.indexOf(full) === -1) found.push(full);
            }
            if (found.length) return _kvsPickBest(found);

            // Fallback: JS variable assignment
            var varRx = /(video_url|video_alt_url)\s*[=:]\s*['"]([^'"]+)['"]/g;
            var varUrls = [];
            while ((m = varRx.exec(html)) !== null) {
                if (varUrls.indexOf(m[2]) === -1) varUrls.push(m[2]);
            }
            if (varUrls.length) return _kvsPickBest(varUrls);

            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _porntrexCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/www\.porntrex\.com\/video\/[^"]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var idMatch = /\/video\/(\d+)\//.exec(videoUrl);
        var id = idMatch ? idMatch[1] : videoUrl;
        if (seen[id]) continue;
        seen[id] = true;

        // Forward-only chunk: thumb and title appear AFTER the href in KVS markup
        var chunk = html.slice(m.index, m.index + 800);

        // PornTrex uses data-src="//ptx.cdntrex.com/...jpg?v=3" — strip query string, force https:
        // http://ptx.cdntrex.com redirects to porntrex.com homepage; TV browsers resolve // as http://
        var thumb = _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.jpe?g)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.(?:webp|png))/i);
        if (thumb && thumb.charAt(0) === '/' && thumb.charAt(1) === '/') thumb = 'https:' + thumb;

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(
            _attr(chunk, /<span[^>]*class="[^"]*time[^"]*"[^>]*>([^<]+)<\/span>/) ||
            _attr(chunk, /(?:duration|time)[^>]*>([^<]+)</)
        );

        var views = parseViews(
            _attr(chunk, /(?:views|view_count)[^>]*>([^<]+)</) ||
            _attr(chunk, /(\d[\d,. kKmM]+)\s*(?:views|Views)/)
        );

        if (title || thumb) {
            items.push({ id: id, source: 'porntrex', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _porntrexPages(html) {
    var m = /last_page=(\d+)|\/page=(\d+)"[^>]*>[^<]*>>/i.exec(html) ||
            /page=(\d+)"[^>]*(?:last|next|>>)/i.exec(html);
    if (m) return parseInt(m[1] || m[2], 10) || 10;
    return 10;
}

// ---- 2. Xozilla ----
SOURCES.push({
    id: 'xozilla',
    name: 'Xozilla',
    host: 'xozilla.com',

    search: function (query, page) {
        var url = 'https://xozilla.com/?s=' + encodeURIComponent(query) + '&p=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _xozillaCards(html), total_pages: _xozillaPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var p = page || 1;
        var url = p > 1
            ? 'https://www.xozilla.com/latest-updates/' + p + '/'
            : 'https://www.xozilla.com/latest-updates/';
        return cherryFetch(url).then(function (html) {
            return { items: _xozillaCards(html), total_pages: _xozillaPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // kt_player flashvars: video_url: 'url', video_alt_url: 'url'
            var varM = /(video_url|video_alt_url2|video_alt_url)\s*[=:]\s*['"]([^'"]+)['"]/g;
            var best = '', quality = {};
            var labels = { video_url: '480p', video_alt_url: '720p', video_alt_url2: '1080p' };
            var fm;
            while ((fm = varM.exec(html)) !== null) {
                quality[labels[fm[1]] || fm[1]] = fm[2];
                if (!best || fm[1] === 'video_alt_url2') best = fm[2];
            }
            if (best) return { url: best, quality: quality };
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _xozillaCards(html) {
    var items = [];
    // Strip inline base64 placeholder images so they don't blow out the chunk window
    var clean = html.replace(/\bsrc="data:[^"]+"/g, 'src=""');
    var hrefRx = /href="(https?:\/\/(?:www\.)?xozilla\.com\/videos\/[0-9]+\/[^"]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(clean)) !== null) {
        var videoUrl = m[1];
        // Already filtered by regex to /videos/NUMBER/ pattern — no extra check needed
        var id = videoUrl.replace(/^https?:\/\/[^/]+/, '').replace(/[^a-z0-9]/gi, '_');
        if (seen[id]) continue;
        seen[id] = true;

        // Look only FORWARD from href — title in <strong class="title">, thumb in data-original/data-src
        var chunk = clean.slice(m.index, m.index + 800);

        var thumb = _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.jpe?g)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.(?:webp|png))/i);

        var title = _decodeHtml(
            _attr(chunk, /<strong[^>]*class="[^"]*title[^"]*"[^>]*>\s*([^<]+)/) ||
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*duration[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'xozilla', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _xozillaPages(html) {
    var m = /p=(\d+)"[^>]*(?:last|>>|&raquo;)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 3. 3Movs ----
SOURCES.push({
    id: '3movs',
    name: '3Movs',
    host: '3movs.com',

    search: function (query, page) {
        var url = 'https://www.3movs.com/?s=' + encodeURIComponent(query) + '&p=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _3movsCards(html), total_pages: _3movsPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var p = page || 1;
        var url = p > 1
            ? 'https://www.3movs.com/latest-updates/' + p + '/'
            : 'https://www.3movs.com/latest-updates/';
        return cherryFetch(url).then(function (html) {
            return { items: _3movsCards(html), total_pages: _3movsPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // kt_player flashvars: video_url: 'url', video_alt_url: '720p', video_alt_url2: '1080p'
            var varM = /(video_url|video_alt_url2|video_alt_url)\s*[=:]\s*['"]([^'"]+)['"]/g;
            var best = '', quality = {};
            var labels = { video_url: '480p', video_alt_url: '720p', video_alt_url2: '1080p' };
            var fm;
            while ((fm = varM.exec(html)) !== null) {
                quality[labels[fm[1]] || fm[1]] = fm[2];
                if (!best || fm[1] === 'video_alt_url2') best = fm[2];
            }
            if (best) return { url: best, quality: quality };
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _3movsCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/(?:www\.)?3movs\.com\/[^"?#]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        // Skip category/index pages — video URLs typically contain a numeric ID or 'videos'
        if (/\/$/.test(videoUrl) && !/\/videos\//.test(videoUrl) && !/\/\d+/.test(videoUrl)) continue;
        var id = videoUrl.replace(/^https?:\/\/[^/]+\//, '').replace(/[^a-z0-9]/gi, '_');
        if (!id || seen[id]) continue;
        seen[id] = true;

        var chunk = html.slice(Math.max(0, m.index - 800), m.index + 600);

        var thumb = _attr(chunk, /(?:data-src|src)="([^"]+\.jpe?g)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.(?:webp|png))"/i);

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/) ||
            _attr(chunk, /<h\d[^>]*>([^<]+)<\/h\d>/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: '3movs', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _3movsPages(html) {
    var m = /p=(\d+)"[^>]*(?:last|>>|&raquo;)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 4. Analdin ----
SOURCES.push({
    id: 'analdin',
    name: 'Analdin',
    host: 'analdin.com',

    search: function (query, page) {
        var url = 'https://analdin.com/?s=' + encodeURIComponent(query) + '&p=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _analdinCards(html), total_pages: _analdinPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var p = page || 1;
        var url = p > 1
            ? 'https://analdin.com/latest-updates/' + p + '/'
            : 'https://analdin.com/latest-updates/';
        return cherryFetch(url).then(function (html) {
            return { items: _analdinCards(html), total_pages: _analdinPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // kt_player flashvars: video_url: 'url', video_alt_url: '720p', video_alt_url2: '1080p'
            var varM = /(video_url|video_alt_url2|video_alt_url)\s*[=:]\s*['"]([^'"]+)['"]/g;
            var best = '', quality = {};
            var labels = { video_url: '480p', video_alt_url: '720p', video_alt_url2: '1080p' };
            var fm;
            while ((fm = varM.exec(html)) !== null) {
                quality[labels[fm[1]] || fm[1]] = fm[2];
                if (!best || fm[1] === 'video_alt_url2') best = fm[2];
            }
            if (best) return { url: best, quality: quality };
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _analdinCards(html) {
    var items = [];
    // Strip base64 placeholders so the 900-char chunk reaches past the inline img
    var clean = html.replace(/\bsrc="data:[^"]+"/g, 'src=""');
    var hrefRx = /href="(https?:\/\/(?:www\.)?analdin\.com\/videos\/[0-9]+\/[^"]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(clean)) !== null) {
        var videoUrl = m[1];
        // Already filtered by regex to /videos/NUMBER/ pattern — no extra check needed
        var id = videoUrl.replace(/^https?:\/\/[^/]+\//, '').replace(/[^a-z0-9]/gi, '_');
        if (!id || seen[id]) continue;
        seen[id] = true;

        // Look only FORWARD from href — thumb in thumb="" or data-original="", title in strong.title
        var chunk = clean.slice(m.index, m.index + 1400);

        var thumb = _attr(chunk, /\bthumb="([^"]+\.jpe?g)"/i) ||
                    _attr(chunk, /data-original="([^"]+\.jpe?g)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.jpe?g)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.(?:webp|png))"/i);

        var title = _decodeHtml(
            _attr(chunk, /<strong[^>]*class="[^"]*title[^"]*"[^>]*>\s*([^<]+)/) ||
            _attr(chunk, /alt="([^"]+)"/) ||
            _attr(chunk, /title="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'analdin', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _analdinPages(html) {
    var m = /p=(\d+)"[^>]*(?:last|>>|&raquo;)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 5. PornVe ----
SOURCES.push({
    id: 'pornve',
    name: 'PornVe',
    host: 'pornve.com',

    search: function (query, page) {
        var q = encodeURIComponent(query).replace(/%20/g, '+');
        // page 1: /search/{q}/, page N: /search/{q}/page{N}/
        var url = page > 1
            ? 'https://pornve.com/search/' + q + '/page' + page + '/'
            : 'https://pornve.com/search/' + q + '/';
        return cherryFetch(url).then(function (html) {
            return { items: _pornveCards(html), total_pages: _pornvePages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = page > 1
            ? 'https://pornve.com/latest-updates/?page=' + page
            : 'https://pornve.com/latest-updates/';
        return cherryFetch(url).then(function (html) {
            return { items: _pornveCards(html), total_pages: _pornvePages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // kt_player flashvars: video_url: 'url', video_alt_url: '720p', video_alt_url2: '1080p'
            var varM = /(video_url|video_alt_url2|video_alt_url)\s*[=:]\s*['"]([^'"]+)['"]/g;
            var best = '', quality = {};
            var labels = { video_url: '480p', video_alt_url: '720p', video_alt_url2: '1080p' };
            var fm;
            while ((fm = varM.exec(html)) !== null) {
                quality[labels[fm[1]] || fm[1]] = fm[2];
                if (!best || fm[1] === 'video_alt_url2') best = fm[2];
            }
            if (best) return { url: best, quality: quality };
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _pornveCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/pornve\.com\/video\/[^"]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var idMatch = /\/video\/(\d+)\//.exec(videoUrl);
        var id = idMatch ? idMatch[1] : videoUrl;
        if (seen[id]) continue;
        seen[id] = true;

        var chunk = html.slice(Math.max(0, m.index - 800), m.index + 600);

        // SisiStyle thumb: cdn.pornve.com/contents/videos_screenshots/...
        var thumb = _attr(chunk, /(?:data-src|src)="(https?:\/\/cdn\.pornve\.com\/contents\/videos_screenshots\/[^"]+)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.jpe?g)"/i);

        var title = _decodeHtml(
            _attr(chunk, /<(?:h\d|div)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([^<]+)<\//) ||
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(
            _attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</) ||
            _attr(chunk, /(\d+:\d+)/)
        );

        var views = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'pornve', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _pornvePages(html) {
    var m = /page(\d+)\/?["'<][^>]*(?:last|next|>>)/i.exec(html) ||
            /[?&]page=(\d+)["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 6. FamilyPorn ----
SOURCES.push({
    id: 'familyporn',
    name: 'FamilyPorn',
    host: 'familyporn.tv',

    search: function (query, page) {
        var url = 'https://familyporn.tv/search/?q=' + encodeURIComponent(query) + '&page=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _familypornCards(html), total_pages: _familypornPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = 'https://familyporn.tv/latest-updates/' + page + '/';
        return cherryFetch(url).then(function (html) {
            return { items: _familypornCards(html), total_pages: _familypornPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // kt_player flashvars: video_url: 'url', video_alt_url: '720p', video_alt_url2: '1080p'
            var varM = /(video_url|video_alt_url2|video_alt_url)\s*[=:]\s*['"]([^'"]+)['"]/g;
            var best = '', quality = {};
            var labels = { video_url: '480p', video_alt_url: '720p', video_alt_url2: '1080p' };
            var fm;
            while ((fm = varM.exec(html)) !== null) {
                quality[labels[fm[1]] || fm[1]] = fm[2];
                if (!best || fm[1] === 'video_alt_url2') best = fm[2];
            }
            if (best) return { url: best, quality: quality };
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _familypornCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/familyporn\.tv\/videos\/[^"]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        // ID is derived from the slug after /videos/
        var slugMatch = /\/videos\/([^/"?]+)/.exec(videoUrl);
        var id = slugMatch ? slugMatch[1] : videoUrl;
        if (seen[id]) continue;
        seen[id] = true;

        // Look only FORWARD from href — title is in title="" attr on same <a> tag
        var chunk = html.slice(m.index, m.index + 800);

        // SisiStyle thumb path (data-original = KVS lazy-load)
        var thumb = _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\/contents\/videos_screenshots\/[^"?#]+)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.jpe?g)/i);

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /<strong[^>]*class="[^"]*title[^"]*"[^>]*>\s*([^<]+)/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'familyporn', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _familypornPages(html) {
    var m = /[?&]page=(\d+)["'][^>]*(?:last|>>)|\/(\d+)\/["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1] || m[2], 10) || 10) : 10;
}

// ---- 7. Porndig ----
SOURCES.push({
    id: 'porndig',
    name: 'Porndig',
    host: 'porndig.com',

    search: function (query, page) {
        var q = encodeURIComponent(query);
        var url = page > 1
            ? 'https://porndig.com/search/' + q + '/page/' + page
            : 'https://porndig.com/search/' + q + '/';
        return cherryFetch(url).then(function (html) {
            return { items: _porndigCards(html), total_pages: _porndigPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = 'https://porndig.com/channels/33/anal/page/' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _porndigCards(html), total_pages: _porndigPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // Primary: fetch iframe player page and extract direct stream URL
            var m = /src="(https?:\/\/videos\.porndig\.com\/player\/index\/[^"]+)"/i.exec(html);
            if (m) {
                return cherryFetch(m[1]).then(function (ihtml) {
                    var result = extractStreams(ihtml);
                    if (result.url || Object.keys(result.quality).length) {
                        var qKeys = Object.keys(result.quality);
                        var best  = qKeys.length ? bestQualityUrl(result.quality) : result.url;
                        return { url: best, quality: result.quality };
                    }
                    return extractStreams(html);
                }).catch(function () { return extractStreams(html); });
            }
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _porndigCards(html) {
    var items = [];
    var hrefRx = /href="((?:https?:\/\/porndig\.com)?\/videos\/(\d+)\/[^"]+\.html)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1].charAt(0) === '/' ? 'https://porndig.com' + m[1] : m[1];
        var id = m[2];
        if (seen[id]) continue;
        seen[id] = true;

        var chunk = html.slice(m.index, m.index + 900);

        // image-cdn.porndig.com/thumbs/YYYY/MM/ID/...
        var thumb = _attr(chunk, /(?:data-original|data-src|src)="(https?:\/\/image-cdn\.porndig\.com\/thumbs\/[^"?#]+)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.jpe?g)/i);

        var title = _decodeHtml(
            _attr(chunk, /<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/) ||
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'porndig', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _porndigPages(html) {
    var m = /\/page\/(\d+)["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- Tizam ----
SOURCES.push({
  id: 'tizam',
  name: 'Tizam',
  host: 'tv4.tizam.org',

  _parseCards: function(html) {
    var items = [];
    var seen = {};
    // Find video card links pointing to tizam.org video paths
    // Site uses relative hrefs — match /category/subcategory/slug/ pattern
    var cardRe = /<a\s[^>]*href="((?:https?:\/\/tv4\.tizam\.org)?\/fil_my_dlya_vzroslyh\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = cardRe.exec(html)) !== null) {
      var cardUrl = m[1].charAt(0) === '/' ? 'https://tv4.tizam.org' + m[1] : m[1];
      var cardBody = m[2];
      // Skip navigation/menu links — valid video URLs have at least 3 path segments
      if (!/tv4\.tizam\.org\/[^/]+\/[^/]+\/[^/]+/.test(cardUrl)) continue;

      var thumbMatch = cardBody.match(/src="([^"]+\/images\/cms\/thumbs\/[^"]+)"/) ||
                       cardBody.match(/src="([^"]+\.jpg[^"]*)"/);
      var rawThumb = thumbMatch ? thumbMatch[1] : '';
      var thumb = rawThumb && rawThumb.charAt(0) === '/' ? 'https://tv4.tizam.org' + rawThumb : rawThumb;

      var titleMatch = cardBody.match(/title="([^"]+)"/) ||
                       cardBody.match(/<[^>]+class="[^"]*title[^"]*"[^>]*>([^<]+)/) ||
                       cardBody.match(/<[^>]+class="[^"]*name[^"]*"[^>]*>([^<]+)/);
      var title = titleMatch ? stripTags(titleMatch[1]) : '';

      // ID from URL slug (last path segment)
      var slugMatch = cardUrl.match(/\/([^/]+)\/?$/);
      var id = slugMatch ? slugMatch[1] : cardUrl;

      // Each URL appears twice (thumb link + title link) — keep only the first (with thumb)
      if (seen[id]) continue;
      seen[id] = true;

      if (!title && !thumb) continue;

      items.push({
        id: 'tizam-' + id,
        source: 'tizam',
        title: title,
        thumb: thumb,
        url: cardUrl,
        duration: 0,
        views: 0
      });
    }
    return items;
  },

  search: function(query, page) {
    // Tizam has no keyword search; attempt generic ?s= and return empty on failure
    return cherryFetch('https://tv4.tizam.org/?s=' + encodeURIComponent(query))
      .then(function(html) {
        var items = [];
        // Simple link scan
        var re = /href="(https?:\/\/tv4\.tizam\.org\/[^"]+)"/g;
        var m;
        var seen = {};
        while ((m = re.exec(html)) !== null) {
          var u = m[1];
          if (seen[u] || !/tv4\.tizam\.org\/[^/]+\/[^/]+\/[^/]+/.test(u)) continue;
          seen[u] = true;
          var slugM = u.match(/\/([^/]+)\/?$/);
          items.push({
            id: 'tizam-' + (slugM ? slugM[1] : items.length),
            source: 'tizam',
            title: slugM ? slugM[1].replace(/-/g, ' ') : '',
            thumb: '',
            url: u,
            duration: 0,
            views: 0
          });
        }
        return { items: items, total_pages: items.length ? 1 : 0 };
      })
      .catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    // Zero-indexed: page 1 → ?p=0
    var url = 'https://tv4.tizam.org/fil_my_dlya_vzroslyh/s_russkim_perevodom/?p=' + (p - 1);
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      return { items: items, total_pages: 50 };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      var res = extractStreams(html);
      return res.url ? res : { url: '', quality: {} };
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- 17. PerfektDamen ----
SOURCES.push({
    id: 'perfektdamen',
    name: 'PerfektDamen',
    host: 'perfektdamen.co',

    search: function (query, page) {
        var url = page > 1
            ? 'https://perfektdamen.co/search/' + page + '/?q=' + encodeURIComponent(query)
            : 'https://perfektdamen.co/search/1/?q=' + encodeURIComponent(query);
        return cherryFetch(url).then(function (html) {
            return { items: _perfektCards(html), total_pages: _perfektPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        // Popular / front page; pagination handled via browse page number if site supports it
        var url = 'https://perfektdamen.co/popular/';
        return cherryFetch(url).then(function (html) {
            return { items: _perfektCards(html), total_pages: 1 };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _perfektCards(html) {
    var items = [];
    var hrefRx = /href="((?:https?:\/\/(?:www\.)?perfektdamen\.co)?\/video\/(\d+)\/)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1].charAt(0) === '/' ? 'https://www.perfektdamen.co' + m[1] : m[1];
        var id = m[2];
        if (seen[id]) continue;
        seen[id] = true;

        // Forward-only: PerfektDamen uses data-original="//static.perfektdamen.co/...jpg"
        var chunk = html.slice(m.index, m.index + 1000);

        var thumb = _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.jpe?g)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.(?:webp|png))/i);

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /<(?:h\d|div)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([^<]+)<\//) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'perfektdamen', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _perfektPages(html) {
    var m = /\/search\/(\d+)\/["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- HellPorno ----
SOURCES.push({
  id: 'hellporno',
  name: 'HellPorno',
  host: 'hellporno.com',

  _parseCards: function(html) {
    var items = [];
    var seen = {};
    var blocks = html.split('<div class="video-thumb"');
    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i];
      var hrefMatch = block.match(/href="(https?:\/\/hellporno\.com\/videos\/([^"]+))"/);
      if (!hrefMatch) continue;
      var videoUrl = hrefMatch[1];
      var slug = hrefMatch[2].replace(/\/$/, '');
      var id = slug;
      if (seen[id]) continue;
      seen[id] = true;

      // Thumbnail: poster attribute on video preview, or CDN img
      var thumbMatch = block.match(/poster="([^"]+\.jpg[^"]*)"/) ||
                       block.match(/data-src="([^"]+)"/) ||
                       block.match(/src="([^"]+img\d+-hp\.hellcdn[^"]+)"/) ||
                       block.match(/src="([^"]+\.jpg[^"]*)"/);
      var thumb = thumbMatch ? thumbMatch[1] : '';

      // Title: <a class="title">TITLE</a>
      var titleMatch = block.match(/<a[^>]*class="title"[^>]*>([^<]+)/) ||
                       block.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
                       block.match(/title="([^"]+)"/);
      var title = titleMatch ? stripTags(titleMatch[1]) : slug.replace(/-/g, ' ');

      // Duration: <span class="time">7:57</span>
      var durMatch = block.match(/<span[^>]*class="[^"]*time[^"]*"[^>]*>([^<]+)/) ||
                     block.match(/<span[^>]*class="[^"]*duration[^"]*"[^>]*>([^<]+)/) ||
                     block.match(/([\d]+:[\d]{2})/);
      var duration = durMatch ? parseDur(durMatch[1].trim()) : 0;

      items.push({
        id: 'hp-' + id,
        source: 'hellporno',
        title: title,
        thumb: thumb,
        url: videoUrl,
        duration: duration,
        views: 0
      });
    }
    return items;
  },

  search: function(query, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://hellporno.com/search/' + p + '/?q=' + encodeURIComponent(query);
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      var pgNums = [];
      var pgRe = /\/search\/(\d+)\//g;
      var m;
      while ((m = pgRe.exec(html)) !== null) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n)) pgNums.push(n);
      }
      var total = pgNums.length ? Math.max.apply(null, pgNums) : p + 5;
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  browse: function(category, page) {
    var self = this;
    var p = page || 1;
    var url = 'https://hellporno.com/' + p + '/';
    return cherryFetch(url).then(function(html) {
      var items = self._parseCards(html);
      var pgNums = [];
      var pgRe = /href="https?:\/\/hellporno\.com\/(\d+)\/"/g;
      var m;
      while ((m = pgRe.exec(html)) !== null) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n)) pgNums.push(n);
      }
      var total = pgNums.length ? Math.max.apply(null, pgNums) : p + 5;
      return { items: items, total_pages: total };
    }).catch(function() { return { items: [], total_pages: 0 }; });
  },

  getStream: function(video) {
    return cherryFetch(video.url).then(function(html) {
      var quality = {};
      var url = '';
      var m;

      // Pattern 0: chs_object JS variable (yt-dlp HellPorno extractor approach)
      // var chs_object = {..., "urlPlayer":"https://..."}
      var chsM = html.match(/var\s+chs_object\s*=\s*(\{[\s\S]+?\});/);
      if (chsM) {
        try {
          var chs = JSON.parse(chsM[1]);
          var playerUrl = chs.urlPlayer || chs.url_player || '';
          if (playerUrl && playerUrl.indexOf('http') === 0) {
            // Player URL itself may be an MP4 or we need to fetch it
            if (/\.mp4/.test(playerUrl)) {
              return { url: playerUrl, quality: {} };
            }
            // Fetch the iframe player page to extract the real stream
            return cherryFetch(playerUrl).then(function(ihtml) {
              var iResult = extractStreams(ihtml);
              return iResult.url ? iResult : extractStreams(html);
            }).catch(function() { return extractStreams(html); });
          }
        } catch (e) {}
      }

      // Pattern 1: <source type="video/mp4"> — extract quality from res/label/title attribute
      var srcRe = /<source\s([^>]+)>/gi;
      while ((m = srcRe.exec(html)) !== null) {
        var attrs = m[1];
        if (!/type="video\/mp4"/i.test(attrs)) continue;
        var srcM = /src="([^"]+)"/.exec(attrs);
        if (!srcM) continue;
        var labelM = /(?:res|label|title)="([^"]+)"/.exec(attrs);
        var lbl = labelM ? labelM[1] : (_kvsPickBest([srcM[1]]).quality['default'] ? 'default' : 'mp4');
        quality[lbl] = srcM[1];
        if (!url) url = srcM[1];
      }

      // Fallback
      if (!url && !Object.keys(quality).length) {
        return extractStreams(html);
      }

      // Pick best quality by resolution number
      if (Object.keys(quality).length) {
        var best = Object.keys(quality).reduce(function(a, b) {
          return (parseInt(a, 10) || 0) >= (parseInt(b, 10) || 0) ? a : b;
        });
        url = quality[best];
      }

      return { url: url, quality: quality };
    }).catch(function() { return { url: '', quality: {} }; });
  }
});

// ---- 16. Pornobolt ----
SOURCES.push({
    id: 'pornobolt',
    name: 'Pornobolt',
    host: 'sex.pornobolt.in',

    search: function (query, page) {
        // Search does not paginate — page ignored
        var url = 'https://sex.pornobolt.in/search/' + encodeURIComponent(query);
        return cherryFetch(url).then(function (html) {
            return { items: _pornoboltCards(html), total_pages: 1 };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = page > 1
            ? 'https://sex.pornobolt.in/' + page + '?sort=mv'
            : 'https://sex.pornobolt.in/?sort=mv';
        return cherryFetch(url).then(function (html) {
            return { items: _pornoboltCards(html), total_pages: _pornoboltPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // Playerjs with server-resolved /videofile/BASE64 path
            var pjRx = /Playerjs\s*\(\s*\{[^}]*?file\s*:\s*["']([^"']+)["']/i;
            var pm = pjRx.exec(html);
            if (pm) {
                var filePath = pm[1];
                // /videofile/BASE64 is the direct MP4 stream — return it as-is
                var fileUrl = filePath.charAt(0) === '/' ? 'https://sex.pornobolt.in' + filePath : filePath;
                return { url: fileUrl, quality: {} };
            }
            // pbcdn.tv CDN fallback
            var cdnRx = /['"]?(https?:\/\/pbcdn\.tv\/[^"'\s]+\.(?:mp4|m3u8))['"]/gi;
            var found = [], m;
            while ((m = cdnRx.exec(html)) !== null) {
                if (found.indexOf(m[1]) === -1) found.push(m[1]);
            }
            if (found.length) return _kvsPickBest(found);
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _pornoboltCards(html) {
    var items = [];
    var hrefRx = /href="((?:https?:\/\/sex\.pornobolt\.in)?\/video\/([^/"]+)\.html)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1].charAt(0) === '/' ? 'https://sex.pornobolt.in' + m[1] : m[1];
        var slug = m[2];
        if (!slug || seen[slug]) continue;
        seen[slug] = true;

        var chunk = html.slice(Math.max(0, m.index - 800), m.index + 600);

        // Thumb: pbcdn.tv/pornobolt-kartinki/huge-{slug}.jpg
        var thumb = _attr(chunk, /(?:data-src|src)="(https?:\/\/pbcdn\.tv\/pornobolt-kartinki\/huge-[^"]+\.jpe?g)"/i);
        if (!thumb) {
            // Reconstruct from slug
            thumb = 'https://pbcdn.tv/pornobolt-kartinki/huge-' + slug + '.jpg';
        }

        var title = _decodeHtml(
            _attr(chunk, /<(?:h\d|div)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([^<]+)<\//) ||
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: slug, source: 'pornobolt', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _pornoboltPages(html) {
    var m = /["']\/(\d+)\?sort["'][^>]*(?:last|>>)/i.exec(html) ||
            /["']\/(\d+)["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 8. CrocoTube ----
SOURCES.push({
    id: 'crocotube',
    name: 'CrocoTube',
    host: 'crocotube.com',

    search: function (query, page) {
        var url = page > 1
            ? 'https://crocotube.com/search/' + page + '/?q=' + encodeURIComponent(query)
            : 'https://crocotube.com/search/1/?q=' + encodeURIComponent(query);
        return cherryFetch(url).then(function (html) {
            return { items: _crocotCards(html), total_pages: _crocotPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = 'https://crocotube.com/' + page + '/';
        return cherryFetch(url).then(function (html) {
            return { items: _crocotCards(html), total_pages: _crocotPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // AlphaXCDN CDN direct pattern
            var cdnRx = /['"]?(https?:\/\/cdn[^"'\s]*alphaxcdn\.com\/[^"'\s]+\.(?:mp4|m3u8))['"]/gi;
            var found = [];
            var m;
            while ((m = cdnRx.exec(html)) !== null) {
                if (found.indexOf(m[1]) === -1) found.push(m[1]);
            }
            if (found.length) return _kvsPickBest(found);

            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _crocotCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/crocotube\.com\/videos\/[^"]+)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var id = videoUrl.replace(/^https?:\/\/[^/]+\/videos\//, '').replace(/[^a-z0-9]/gi, '_');
        if (!id || seen[id]) continue;
        seen[id] = true;

        var chunk = html.slice(Math.max(0, m.index - 800), m.index + 600);

        // img{1-3}-ct.alphaxcdn.com thumbnail pattern
        var thumb = _attr(chunk, /(?:data-src|src)="(https?:\/\/img\d*-ct\.alphaxcdn\.com\/[^"]+)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.jpe?g)"/i);

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/) ||
            _attr(chunk, /<h\d[^>]*>([^<]+)<\/h\d>/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'crocotube', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _crocotPages(html) {
    var m = /\/search\/(\d+)\/?["'][^>]*(?:last|>>)/i.exec(html) ||
            /\/(\d+)\/["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 9. Huyamba ----
SOURCES.push({
    id: 'huyamba',
    name: 'Huyamba',
    host: 'fuq.huyamba.mobi',

    search: function (query, page) {
        // Search returns all results on one page; page param ignored but kept for interface compliance
        var url = 'https://fuq.huyamba.mobi/search/' + encodeURIComponent(query) + '/';
        return cherryFetch(url).then(function (html) {
            return { items: _huyambaCards(html), total_pages: 1 };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = 'https://fuq.huyamba.mobi/videos/?by=post_date&page=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _huyambaCards(html), total_pages: _huyambaPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _huyambaCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/fuq\.huyamba\.mobi\/video\/(\d+)\/)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var id = m[2];
        if (seen[id]) continue;
        seen[id] = true;

        // Forward-only: title is in title="" on the <a> tag, thumb in data-original
        var chunk = html.slice(m.index, m.index + 1000);

        var thumb = _attr(chunk, /(?:data-original|data-webp|data-src|src)="([^"?#]+\.jpe?g)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.(?:webp|png))/i);

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/) ||
            _attr(chunk, /<h\d[^>]*>([^<]+)<\/h\d>/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'huyamba', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _huyambaPages(html) {
    var m = /[?&]page=(\d+)["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// VePorn removed — veporn.net returns 504 (site dead)

// ---- 11. Ebun ----
SOURCES.push({
    id: 'ebun',
    name: 'Ebun',
    host: 'www1.ebun.tv',

    search: function (query, page) {
        var url = 'https://www1.ebun.tv/search/?q=' + encodeURIComponent(query) + '&page=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _ebunCards(html), total_pages: _ebunPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = 'https://www1.ebun.tv/latest-updates/?page=' + page;
        return cherryFetch(url).then(function (html) {
            return { items: _ebunCards(html), total_pages: _ebunPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            var iframeM = /src="(https?:\/\/666-emded\.com\/embed\/[^"]+)"/i.exec(html);
            if (iframeM) {
                return cherryFetch(iframeM[1]).then(function (ihtml) {
                    var result = extractStreams(ihtml);
                    if (result.url || Object.keys(result.quality).length) {
                        var qKeys = Object.keys(result.quality);
                        var best  = qKeys.length ? bestQualityUrl(result.quality) : result.url;
                        return { url: best, quality: result.quality };
                    }
                    return { url: '', quality: {} };
                }).catch(function () { return { url: '', quality: {} }; });
            }
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _ebunCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/www1\.ebun\.tv\/videos\/(\d+)\/)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var id = m[2];
        if (seen[id]) continue;
        seen[id] = true;

        // Look only FORWARD from href — title in alt="" and data-src in img after the href
        var chunk = html.slice(m.index, m.index + 900);

        var thumb = _attr(chunk, /(?:data-src|src)="([^"]+\.jpe?g)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.(?:webp|png))"/i);

        var title = _decodeHtml(
            _attr(chunk, /<div[^>]*class="[^"]*item-title[^"]*"[^>]*>([^<]+)<\/div>/) ||
            _attr(chunk, /alt="([^"]+)"/) ||
            _attr(chunk, /title="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'ebun', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _ebunPages(html) {
    var m = /[?&]page=(\d+)["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 12. LenPorno ----
SOURCES.push({
    id: 'lenporno',
    name: 'LenPorno',
    host: 'www.lenporno.net',

    search: function (query, page) {
        var url = 'https://www.lenporno.net/search/?q=' + encodeURIComponent(query);
        return cherryFetch(url).then(function (html) {
            return { items: _lenpornoCards(html), total_pages: 1 };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = page > 1
            ? 'https://www.lenporno.net/the-best/?page=' + page
            : 'https://www.lenporno.net/the-best/';
        return cherryFetch(url).then(function (html) {
            return { items: _lenpornoCards(html), total_pages: _lenpornoPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // PlayerJS multi-quality format: [label1]url1.mp4,[label2]url2.mp4
            // or unlabeled first: url1.mp4,[label2]url2.mp4
            var fileM = /(?:file|src)\s*[:=]\s*['"]([^'"]*cdnv365[^'"]+\.mp4[^'"]*)['"]/i.exec(html) ||
                        /Playerjs\s*\([^)]*file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i.exec(html);
            if (fileM) {
                var pjStr = fileM[1];
                var quality = {};
                var best = '';
                var pjRe = /(?:\[([^\]]+)\])?(https?:\/\/[^,\[\]<>\s"']+\.mp4)/gi;
                var m;
                while ((m = pjRe.exec(pjStr)) !== null) {
                    var lbl = m[1] ? m[1].trim() : null;
                    if (lbl && /^\d{3,4}p?$/i.test(lbl)) {
                        quality[lbl] = m[2];
                        if (!best) best = m[2];
                    } else {
                        if (!best) best = m[2];
                    }
                }
                if (best) return { url: bestQualityUrl(quality) || best, quality: quality };
            }
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _lenpornoCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/(?:xxx\.lenporno\.xyz|www\.lenporno\.net)\/video\/([^/"?]+))"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var slug = m[2];
        if (!slug || seen[slug]) continue;
        seen[slug] = true;

        var chunk = html.slice(Math.max(0, m.index - 800), m.index + 600);

        var thumb = _attr(chunk, /(?:data-src|src)="([^"]+\.jpe?g)"/i) ||
                    _attr(chunk, /(?:data-src|src)="([^"]+\.(?:webp|png))"/i);

        var title = _decodeHtml(
            _attr(chunk, /<(?:h\d|div)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([^<]+)<\//) ||
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: slug, source: 'lenporno', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _lenpornoPages(html) {
    var m = /[?&]page=(\d+)["'][^>]*(?:last|>>|&raquo;)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 13. 24Rolika / Huyalkino ----
SOURCES.push({
    id: '24rolika',
    name: '24Rolika',
    host: 'w2.huyalkino.com',

    search: function (query, page) {
        // DLE search does not paginate natively — page param is advisory
        var url = 'https://w2.huyalkino.com/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);
        return cherryFetch(url).then(function (html) {
            return { items: _rolikaCards(html), total_pages: 1 };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        var url = page > 1
            ? 'https://w2.huyalkino.com/page/' + page + '/'
            : 'https://w2.huyalkino.com/';
        return cherryFetch(url).then(function (html) {
            return { items: _rolikaCards(html), total_pages: _rolikaPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // DLE + JWPlayer: file: "url.mp4"
            var jwRx = /jwplayer\s*\(\s*['"]?\w+['"]?\s*\)\s*\.setup\s*\(\s*\{[\s\S]*?['"]?file['"]?\s*:\s*['"]([^'"]+\.(?:mp4|m3u8))['"]/;
            var m = jwRx.exec(html);
            if (m) return { url: m[1], quality: {} };

            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _rolikaCards(html) {
    var items = [];
    var hrefRx = /href="((?:https?:\/\/w2\.huyalkino\.com)?\/[a-z]+\/\d+[^"]+\.html)"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1].charAt(0) === '/' ? 'https://w2.huyalkino.com' + m[1] : m[1];
        // DLE URL: /{category}/{id}-{slug}.html
        var idMatch = /\/(\d+)-[^/]+\.html/.exec(videoUrl);
        var id = idMatch ? idMatch[1] : videoUrl;
        if (seen[id]) continue;
        seen[id] = true;

        // Look FORWARD from href — DLE cards: img inside the <a>, title in <a class="th-title"> after
        var chunk = html.slice(m.index, m.index + 900);

        // DLE/KVS thumb: relative /uploads/posts/... URLs (may have no extension or .webp)
        var thumb = _attr(chunk, /(?:data-original|data-src|src)="([^"?#]*\/uploads\/posts\/\d{4}-\d{2}\/[^"?#]+)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.(?:jpe?g|webp))/i);
        if (thumb && thumb.charAt(0) === '/') thumb = 'https://w2.huyalkino.com' + thumb;

        var title = _decodeHtml(
            _attr(chunk, /<a[^>]*class="[^"]*th-title[^"]*"[^>]*>([^<]+)<\/a>/) ||
            _attr(chunk, /<h2[^>]*>([^<]+)<\/h2>/) ||
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time|th-time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: '24rolika', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _rolikaPages(html) {
    var m = /\/page\/(\d+)\/["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

// ---- 14. JopaOnline ----
SOURCES.push({
    id: 'jopaonline',
    name: 'JopaOnline',
    host: 'jopaonline.mobi',

    search: function (query, page) {
        var url = 'https://jopaonline.mobi/?do=search&subaction=search&story=' + encodeURIComponent(query);
        return cherryFetch(url).then(function (html) {
            return { items: _jopaCards(html), total_pages: 1 };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    browse: function (category, page) {
        // page 1 → /, page 2 → /2, page 3 → /3 etc.
        var url = page > 1
            ? 'https://jopaonline.mobi/' + page
            : 'https://jopaonline.mobi/';
        return cherryFetch(url).then(function (html) {
            return { items: _jopaCards(html), total_pages: _jopaPages(html) };
        }).catch(function () { return { items: [], total_pages: 0 }; });
    },

    getStream: function (video) {
        return cherryFetch(video.url).then(function (html) {
            // Playerjs multi-quality: new Playerjs({file:'[360p]url,[720p]url,...'})
            var pjRx = /new\s+Playerjs\s*\(\s*\{[^}]*?file\s*:\s*['"]([^'"]+)['"]/i;
            var pm = pjRx.exec(html);
            if (pm) {
                var fileStr = pm[1];
                var quality = {}, best = '';
                var qRx = /\[([^\]]+)\](https?:\/\/[^,\s'"[\]]+)/g;
                var qm;
                while ((qm = qRx.exec(fileStr)) !== null) {
                    quality[qm[1]] = qm[2];
                    best = qm[2];
                }
                if (best) return { url: best, quality: quality };
                if (/^https?:/.test(fileStr)) return { url: fileStr, quality: {} };
            }
            // DLE JWPlayer pattern
            var jwRx = /jwplayer\s*\(\s*['"]?\w+['"]?\s*\)\s*\.setup\s*\(\s*\{[\s\S]*?['"]?file['"]?\s*:\s*['"]([^'"]+\.(?:mp4|m3u8))['"]/;
            var m = jwRx.exec(html);
            if (m) return { url: m[1], quality: {} };
            return extractStreams(html);
        }).catch(function () { return { url: '', quality: {} }; });
    }
});

function _jopaCards(html) {
    var items = [];
    var hrefRx = /href="(https?:\/\/jopaonline\.mobi\/porno-video\/(\d+))"/g;
    var seen = {};
    var m;
    while ((m = hrefRx.exec(html)) !== null) {
        var videoUrl = m[1];
        var id = m[2];
        if (seen[id]) continue;
        seen[id] = true;

        var chunk = html.slice(m.index, m.index + 900);

        var thumb = _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\/uploads\/posts\/\d{4}-\d{2}\/[^"?#]+)/i) ||
                    _attr(chunk, /(?:data-original|data-src|src)="([^"?#]+\.jpe?g)/i);

        var title = _decodeHtml(
            _attr(chunk, /title="([^"]+)"/) ||
            _attr(chunk, /alt="([^"]+)"/) ||
            _attr(chunk, /<h2[^>]*>\s*([^<]+)/) ||
            _attr(chunk, /<h\d[^>]*>\s*([^<]+)/)
        );

        var duration = parseDur(_attr(chunk, /class="[^"]*(?:duration|time)[^"]*"[^>]*>([^<]+)</));
        var views    = parseViews(_attr(chunk, /class="[^"]*views?[^"]*"[^>]*>([^<]+)</));

        if (title || thumb) {
            items.push({ id: id, source: 'jopaonline', title: title, thumb: thumb, url: videoUrl, duration: duration, views: views });
        }
    }
    return items;
}

function _jopaPages(html) {
    var m = /href="https?:\/\/jopaonline\.mobi\/(\d+)"[^>]*(?:last|>>)/i.exec(html) ||
            /["']\/(\d+)["'][^>]*(?:last|>>)/i.exec(html);
    return m ? (parseInt(m[1], 10) || 10) : 10;
}

})();
