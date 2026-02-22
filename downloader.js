(function() {
    'use strict';

    var PLUGIN_NAME = 'Скачивание с Lampa';
    var PLUGIN_VERSION = '1.0';


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
                    /* HLS (m3u8) — это плейлист сегментов .ts; склеиваем в один файл, сохраняем как .ts */
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

    function isVideoUrl(text) {
        if (!text || typeof text !== 'string') return false;
        var t = text.trim();
        if (t.indexOf('http://') !== 0 && t.indexOf('https://') !== 0) return false;
        if (t.length < 15) return false;
        return t.indexOf('.m3u8') !== -1 || t.indexOf('.mp4') !== -1 || t.indexOf('.ts') !== -1 ||
            t.indexOf('m3u8') !== -1 || t.indexOf('video') !== -1 || t.indexOf('stream') !== -1 ||
            t.indexOf('torrent') !== -1 || t.indexOf('play') !== -1 || t.length > 25;
    }

    function isSettingsOrPluginsPage() {
        var h = (window.location.hash || '') + (window.location.pathname || '');
        return /setting|plugin|extension|param|config/i.test(h);
    }

    function showDownloadFromClipboardPrompt(copiedUrl) {
        copiedUrl = fixUrl(copiedUrl);
        if (!isVideoUrl(copiedUrl)) return;
        if (isSettingsOrPluginsPage()) return;
        var oldModal = document.getElementById('lampa-dl-after-copy');
        if (oldModal) oldModal.remove();
        var modal = document.createElement('div');
        modal.id = 'lampa-dl-after-copy';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99995;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
        var box = document.createElement('div');
        box.style.cssText = 'background:#222;padding:24px;border-radius:10px;box-shadow:0 0 30px rgba(0,0,0,0.6);min-width:280px;';
        box.innerHTML = '<p style="color:#fff;margin:0 0 16px;font-size:15px;">Ссылка скопирована. Скачать файл?</p>';
        var btnYes = document.createElement('div');
        btnYes.className = 'selector lampa-dl-after-btn';
        btnYes.setAttribute('data-action', 'yes');
        btnYes.setAttribute('tabindex', '0');
        btnYes.style.cssText = 'flex:1;background:#2a9d8f;color:#fff;padding:12px;border-radius:8px;text-align:center;font-size:14px;cursor:pointer;border:3px solid transparent;';
        btnYes.textContent = 'Да';
        var btnNo = document.createElement('div');
        btnNo.className = 'selector lampa-dl-after-btn';
        btnNo.setAttribute('data-action', 'no');
        btnNo.setAttribute('tabindex', '0');
        btnNo.style.cssText = 'flex:1;background:#444;color:#ddd;padding:12px;border-radius:8px;text-align:center;font-size:14px;cursor:pointer;border:3px solid transparent;';
        btnNo.textContent = 'Нет';
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:10px;';
        row.appendChild(btnYes);
        row.appendChild(btnNo);
        box.appendChild(row);
        modal.appendChild(box);
        document.body.appendChild(modal);

        function removeModalAndListener() {
            if (modal.parentNode) modal.remove();
            document.removeEventListener('click', closeOut);
        }
        function closeOut(e) {
            if (modal.parentNode && e.target !== modal && !modal.contains(e.target)) removeModalAndListener();
        }
        function doAction(btn) {
            var action = btn.getAttribute('data-action');
            removeModalAndListener();
            if (action === 'yes') startDownload(copiedUrl, 'video', null);
        }
        btnYes.addEventListener('click', function() { doAction(btnYes); });
        btnNo.addEventListener('click', function() { doAction(btnNo); });
        btnYes.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doAction(btnYes); }
        });
        btnNo.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doAction(btnNo); }
        });
        setTimeout(function() { document.addEventListener('click', closeOut); }, 150);

        if (typeof Lampa !== 'undefined' && Lampa.Controller) {
            try {
                if (typeof Lampa.Controller.collectionAppend === 'function') {
                    Lampa.Controller.collectionAppend(box);
                }
                if (typeof Lampa.Controller.collectionFocus === 'function') {
                    Lampa.Controller.collectionFocus(btnYes);
                }
            } catch (err) {}
        }
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

    var lastPromptUrl = '';
    var lastPromptTime = 0;
    function onVideoLinkCopied(text) {
        if (!text || !isVideoUrl(text)) return;
        var now = Date.now();
        if (text === lastPromptUrl && now - lastPromptTime < 2000) return;
        lastPromptUrl = text;
        lastPromptTime = now;
        setTimeout(function() { showDownloadFromClipboardPrompt(text); }, 250);
    }

    function hookClipboard() {
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                var nativeWrite = navigator.clipboard.writeText.bind(navigator.clipboard);
                navigator.clipboard.writeText = function(text) {
                    var result = nativeWrite(text);
                    if (result && typeof result.then === 'function') {
                        result.then(function() { onVideoLinkCopied(text); }).catch(function() {});
                    } else {
                        onVideoLinkCopied(text);
                    }
                    return result;
                };
            }
        } catch (e) {}

        document.addEventListener('copy', function(e) {
            function check() {
                try {
                    var text = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
                    if (text) onVideoLinkCopied(text);
                } catch (err) {}
            }
            check();
            setTimeout(function() {
                try {
                    if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
                        navigator.clipboard.readText().then(function(text) {
                            if (text) onVideoLinkCopied(text);
                        }).catch(function() {});
                    }
                } catch (err) {}
            }, 400);
        }, true);
    }

    function initPlugin() {
        if (typeof Lampa === 'undefined') return;

        /* Убираем себя из списка расширений, чтобы не было строки с url: "undefined" */
        try {
            if (Lampa.Plugins && typeof Lampa.Plugins.remove === 'function') {
                Lampa.Plugins.remove('lampa_download');
            }
            var lists = [Lampa.Plugins && Lampa.Plugins.plugins, Lampa.Manifest && Lampa.Manifest.plugins];
            for (var L = 0; L < lists.length; L++) {
                var list = lists[L];
                if (!Array.isArray(list)) continue;
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i] && list[i].id === 'lampa_download') {
                        list.splice(i, 1);
                        break;
                    }
                }
            }
        } catch (e) {}

        hookClipboard();
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
