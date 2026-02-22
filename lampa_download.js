(function() {
    'use strict';

    var PLUGIN_NAME = 'Скачивание с Lampa';
    var PLUGIN_VERSION = '1.0';

    var originalPlayerPlay = null;

    function showNotify(msg) {
        if (typeof Lampa !== 'undefined') {
            if (Lampa.Noty) Lampa.Noty.show(msg);
            else if (Lampa.Notification) Lampa.Notification.show(msg);
        }
    }

    function fixUrl(url) {
        if (!url) return url;
        var u = url.replace(/&preload$/, '&play').replace(/&preload(&|$)/, '&play$1');
        return u;
    }

    function getBaseUrl(url) {
        if (!url) return '';
        var last = url.lastIndexOf('/');
        return last === -1 ? url : url.substring(0, last + 1);
    }

    function parseM3u8(text, baseUrl) {
        var lines = text.split(/\r?\n/);
        var segments = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line.indexOf('#') === 0) continue;
            var segUrl = line;
            if (segUrl.indexOf('http') !== 0) {
                segUrl = baseUrl + (segUrl.indexOf('/') === 0 ? segUrl.substring(1) : segUrl);
            }
            segments.push(segUrl);
        }
        return segments;
    }

    function triggerSave(blob, filename) {
        try {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename || 'video';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            return true;
        } catch (e) {
            return false;
        }
    }

    function safeFilename(name) {
        if (!name || typeof name !== 'string') return 'video';
        return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 120).trim() || 'video';
    }

    function downloadMp4(url, filename, onDone) {
        fetch(url, { mode: 'cors' }).then(function(res) { return res.blob(); }).then(function(blob) {
            var ok = triggerSave(blob, filename);
            if (onDone) onDone(ok);
        }).catch(function(err) {
            if (onDone) onDone(false);
        });
    }

    function downloadM3u8(url, filename, onProgress, onDone) {
        var baseUrl = getBaseUrl(url);
        fetch(url, { mode: 'cors' }).then(function(res) { return res.text(); }).then(function(text) {
            var segments = parseM3u8(text, baseUrl);
            if (!segments.length) {
                if (onDone) onDone(false);
                return;
            }
            var total = segments.length;
            var abList = [];
            var done = 0;

            function fetchNext(index) {
                if (index >= total) {
                    var totalLen = 0;
                    for (var i = 0; i < abList.length; i++) totalLen += abList[i].byteLength;
                    var combined = new Uint8Array(totalLen);
                    var offset = 0;
                    for (var j = 0; j < abList.length; j++) {
                        combined.set(new Uint8Array(abList[j]), offset);
                        offset += abList[j].byteLength;
                    }
                    var blob = new Blob([combined], { type: 'video/MP2T' });
                    var ext = (filename && filename.indexOf('.') !== -1) ? '' : '.ts';
                    var ok = triggerSave(blob, (filename || 'video') + ext);
                    if (onDone) onDone(ok);
                    return;
                }
                fetch(segments[index], { mode: 'cors' }).then(function(r) { return r.arrayBuffer(); }).then(function(ab) {
                    abList[index] = ab;
                    done++;
                    if (onProgress) onProgress(done, total);
                    fetchNext(index + 1);
                }).catch(function() {
                    done++;
                    if (onProgress) onProgress(done, total);
                    fetchNext(index + 1);
                });
            }
            fetchNext(0);
        }).catch(function() {
            if (onDone) onDone(false);
        });
    }

    function startDownload(url, title, modalEl) {
        url = fixUrl(url);
        if (!url || url.indexOf('http') !== 0) {
            showNotify('Неверная ссылка');
            if (modalEl) modalEl.remove();
            return;
        }
        var isM3u8 = url.indexOf('.m3u8') !== -1;
        var filename = safeFilename(title) + (isM3u8 ? '.ts' : '.mp4');
        if (modalEl) modalEl.remove();

        showNotify(isM3u8 ? 'Загрузка HLS…' : 'Загрузка…');

        function onDone(ok) {
            showNotify(ok ? 'Сохранено: ' + filename : 'Ошибка загрузки');
        }

        if (isM3u8) {
            downloadM3u8(url, safeFilename(title), function(done, total) {
                if (total > 3) showNotify('Загрузка ' + done + '/' + total);
            }, onDone);
        } else {
            downloadMp4(url, filename, onDone);
        }
    }

    function showDownloadChoiceModal(data) {
        var url = data.url || data.stream_url || data.link || data.file;
        url = fixUrl(url);
        var title = data.title || data.name || 'video';

        if (!url) {
            if (originalPlayerPlay) originalPlayerPlay.call(Lampa.Player, data);
            return;
        }
        if (url.indexOf('http') !== 0) url = 'http://' + url;

        var oldModal = document.getElementById('lampa-download-modal');
        if (oldModal) oldModal.remove();

        var modal = document.createElement('div');
        modal.id = 'lampa-download-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99990;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
        modal.innerHTML = [
            '<div style="background:#222;padding:25px;border-radius:10px;max-width:380px;width:85%;box-shadow:0 0 20px rgba(0,0,0,0.5);">',
            '<h3 style="color:#fff;margin:0 0 20px;font-size:18px;text-align:center;">' + PLUGIN_NAME + '</h3>',
            '<button type="button" class="lampa-dl-btn" data-action="play" style="width:100%;background:#2a9d8f;color:#fff;border:none;padding:14px;border-radius:8px;cursor:pointer;font-size:15px;margin-bottom:10px;">Воспроизвести</button>',
            '<button type="button" class="lampa-dl-btn" data-action="download" style="width:100%;background:#e76f51;color:#fff;border:none;padding:14px;border-radius:8px;cursor:pointer;font-size:15px;margin-bottom:10px;">Скачать</button>',
            '<button type="button" class="lampa-dl-btn" data-action="copy" style="width:100%;background:#444;color:#ddd;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;">Копировать ссылку</button>',
            '<button type="button" id="lampa-dl-cancel" style="width:100%;background:transparent;color:#888;border:1px solid #444;padding:12px;border-radius:8px;cursor:pointer;margin-top:12px;">Отмена</button>',
            '</div>'
        ].join('');

        document.body.appendChild(modal);

        function close() { modal.remove(); }

        modal.addEventListener('click', function(e) {
            if (e.target.id === 'lampa-dl-cancel' || e.target === modal) {
                close();
                return;
            }
            if (!e.target.classList.contains('lampa-dl-btn')) return;
            var action = e.target.getAttribute('data-action');
            if (action === 'play') {
                close();
                if (originalPlayerPlay) originalPlayerPlay.call(Lampa.Player, data);
            } else if (action === 'copy') {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function() { showNotify('Ссылка скопирована'); }, function() { showNotify(url.substring(0, 60) + '…'); });
                } else {
                    showNotify(url.substring(0, 80) + '…');
                }
                close();
            } else if (action === 'download') {
                startDownload(url, title, modal);
            }
        });
    }

    function initPlugin() {
        if (typeof Lampa === 'undefined') return;

        if (Lampa.Plugins && Lampa.Plugins.add) {
            Lampa.Plugins.add({
                id: 'lampa_download',
                name: PLUGIN_NAME,
                version: PLUGIN_VERSION,
                description: 'Скачивание видео (MP4 и M3U8/HLS) при воспроизведении'
            });
        }

        if (Lampa.Player && Lampa.Player.play) {
            originalPlayerPlay = Lampa.Player.play;
            Lampa.Player.play = function(playerData) {
                var url = playerData && (playerData.url || playerData.stream_url || playerData.link || playerData.file);
                if (url && typeof url === 'string' && url.match(/^https?:\/\//)) {
                    showDownloadChoiceModal(playerData);
                } else {
                    originalPlayerPlay.call(this, playerData);
                }
            };
        }
    }

    if (typeof window !== 'undefined') {
        if (window.appready) {
            initPlugin();
        } else if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') setTimeout(initPlugin, 100);
            });
        } else {
            window.addEventListener('load', function() { setTimeout(initPlugin, 200); });
        }
    }
})();
