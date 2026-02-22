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

    function resolveUrl(url, baseUrl) {
        if (!url || url.indexOf('http') === 0) return url;
        return baseUrl + (url.indexOf('/') === 0 ? url.substring(1) : url);
    }

    function parseM3u8Segments(text, baseUrl) {
        var lines = text.split(/\r?\n/);
        var segments = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line.indexOf('#') === 0) continue;
            segments.push(resolveUrl(line, baseUrl));
        }
        return segments;
    }

    function isMasterPlaylist(text) {
        return /#EXT-X-STREAM-INF\s*:/i.test(text);
    }

    function parseMasterPlaylistVariants(text, baseUrl) {
        var lines = text.split(/\r?\n/);
        var variants = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf('#EXT-X-STREAM-INF') === 0) {
                var bw = 0;
                var m = line.match(/BANDWIDTH\s*=\s*(\d+)/i);
                if (m) bw = parseInt(m[1], 10);
                var next = (i + 1) < lines.length ? lines[i + 1].trim() : '';
                if (next && next.indexOf('#') !== 0) {
                    variants.push({ bandwidth: bw, url: resolveUrl(next, baseUrl) });
                }
            }
        }
        variants.sort(function(a, b) { return b.bandwidth - a.bandwidth; });
        return variants;
    }

    function fetchText(u) {
        return fetch(u, { mode: 'cors', credentials: 'omit' }).then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
        }).catch(function() {
            return fetch(u, { credentials: 'omit' }).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            });
        });
    }
    function fetchBuffer(u) {
        return fetch(u, { mode: 'cors', credentials: 'omit' }).then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.arrayBuffer();
        }).catch(function() {
            return fetch(u, { credentials: 'omit' }).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.arrayBuffer();
            });
        });
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

    var progressStartTime = 0;
    var progressEl = null;
    var progressSizeEl = null;
    var progressSpeedEl = null;
    var progressBarEl = null;
    var progressSegmentsEl = null;

    function formatBytes(bytes) {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' B';
    }

    function showDownloadProgressWindow() {
        if (progressEl && progressEl.parentNode) progressEl.remove();
        progressStartTime = Date.now();
        progressEl = document.createElement('div');
        progressEl.id = 'lampa-dl-progress';
        progressEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a1a;padding:24px;border-radius:12px;min-width:320px;max-width:90vw;z-index:99997;box-shadow:0 0 40px rgba(0,0,0,0.8);font-family:sans-serif;border:1px solid #333;';
        progressEl.innerHTML = [
            '<div style="color:#fff;font-size:16px;margin-bottom:12px;">Загрузка</div>',
            '<div id="lampa-dl-progress-segments" style="color:#aaa;font-size:13px;margin-bottom:8px;">—</div>',
            '<div id="lampa-dl-progress-size" style="color:#aaa;font-size:13px;margin-bottom:8px;">Размер: 0 B</div>',
            '<div id="lampa-dl-progress-speed" style="color:#4fc3f7;font-size:13px;margin-bottom:10px;">Скорость: —</div>',
            '<div style="height:6px;background:#333;border-radius:3px;overflow:hidden;"><div id="lampa-dl-progress-bar" style="height:100%;width:0%;background:#4fc3f7;transition:width 0.2s;"></div></div>'
        ].join('');
        document.body.appendChild(progressEl);
        progressSizeEl = document.getElementById('lampa-dl-progress-size');
        progressSpeedEl = document.getElementById('lampa-dl-progress-speed');
        progressBarEl = document.getElementById('lampa-dl-progress-bar');
        progressSegmentsEl = document.getElementById('lampa-dl-progress-segments');
    }

    function updateDownloadProgress(loadedBytes, totalBytes, segmentDone, segmentTotal) {
        if (!progressSizeEl) return;
        progressSizeEl.textContent = 'Размер: ' + formatBytes(loadedBytes) + (totalBytes > 0 ? ' / ' + formatBytes(totalBytes) : '');
        var elapsed = (Date.now() - progressStartTime) / 1000;
        var speed = elapsed > 0 ? loadedBytes / elapsed : 0;
        if (progressSpeedEl) progressSpeedEl.textContent = 'Скорость: ' + formatBytes(Math.round(speed)) + '/s';
        if (progressBarEl) {
            var pct = totalBytes > 0 ? Math.min(100, (loadedBytes / totalBytes) * 100) : (segmentTotal > 0 ? (segmentDone / segmentTotal) * 100 : 0);
            progressBarEl.style.width = pct + '%';
        }
        if (progressSegmentsEl) {
            if (segmentTotal > 0) {
                progressSegmentsEl.textContent = 'Сегменты: ' + segmentDone + ' / ' + segmentTotal;
                progressSegmentsEl.style.display = '';
            } else {
                progressSegmentsEl.style.display = 'none';
            }
        }
    }

    function hideDownloadProgressWindow() {
        if (progressEl && progressEl.parentNode) progressEl.remove();
        progressEl = null;
    }

    function downloadMp4(url, filename, onProgress, onDone) {
        function tryFetch(opts) {
            return fetch(url, opts || { mode: 'cors', credentials: 'omit' }).then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                var total = parseInt(res.headers.get('Content-Length') || '0', 10);
                var reader = res.body && res.body.getReader();
                if (!reader) {
                    return res.blob().then(function(blob) {
                        if (onProgress) onProgress(blob.size, blob.size);
                        return blob;
                    });
                }
                var chunks = [];
                var loaded = 0;
                function read() {
                    return reader.read().then(function(result) {
                        if (result.done) {
                            var blob = new Blob(chunks);
                            return blob;
                        }
                        chunks.push(result.value);
                        loaded += result.value.length;
                        if (onProgress) onProgress(loaded, total > 0 ? total : null);
                        return read();
                    });
                }
                return read();
            });
        }
        tryFetch().then(function(blob) {
            var ok = triggerSave(blob, filename);
            if (onDone) onDone(ok);
        }).catch(function() {
            tryFetch({ credentials: 'omit' }).then(function(blob) {
                var ok = triggerSave(blob, filename);
                if (onDone) onDone(ok);
            }).catch(function() { if (onDone) onDone(false); });
        });
    }

    function downloadM3u8(url, filename, onProgress, onDone) {
        var baseUrl = getBaseUrl(url);
        var name = (filename || 'video') + ((filename && filename.indexOf('.') !== -1) ? '' : '.ts');

        function doDownloadStream(playlistText, base, fileHandle) {
            var segments = parseM3u8Segments(playlistText, base);
            var onlyTs = segments.filter(function(u) {
                var lower = u.toLowerCase();
                return lower.indexOf('.ts') !== -1 || lower.indexOf('.m4s') !== -1 || (lower.indexOf('segment') !== -1 && lower.indexOf('.m3u8') === -1);
            });
            if (onlyTs.length === 0) onlyTs = segments.filter(function(u) { return u.toLowerCase().indexOf('.m3u8') === -1; });
            if (onlyTs.length === 0) onlyTs = segments;

            var total = onlyTs.length;
            var doneCount = 0;
            var totalLoaded = 0;

            fileHandle.createWritable().then(function(writer) {
                function fetchNext(index) {
                    if (index >= total) {
                        writer.close().then(function() {
                            if (onDone) onDone(true);
                        }).catch(function() { if (onDone) onDone(false); });
                        return;
                    }
                    fetchBuffer(onlyTs[index]).then(function(ab) {
                        var len = ab.byteLength;
                        return writer.write(ab).then(function() {
                            doneCount++;
                            totalLoaded += len;
                            if (onProgress) onProgress(doneCount, total, totalLoaded);
                            fetchNext(index + 1);
                        });
                    }).catch(function() {
                        doneCount++;
                        if (onProgress) onProgress(doneCount, total, totalLoaded);
                        fetchNext(index + 1);
                    });
                }
                fetchNext(0);
            }).catch(function() { if (onDone) onDone(false); });
        }

        function doDownloadMemory(playlistText, base) {
            var segments = parseM3u8Segments(playlistText, base);
            var onlyTs = segments.filter(function(u) {
                var lower = u.toLowerCase();
                return lower.indexOf('.ts') !== -1 || lower.indexOf('.m4s') !== -1 || (lower.indexOf('segment') !== -1 && lower.indexOf('.m3u8') === -1);
            });
            if (onlyTs.length === 0) onlyTs = segments.filter(function(u) { return u.toLowerCase().indexOf('.m3u8') === -1; });
            if (onlyTs.length === 0) onlyTs = segments;

            var total = onlyTs.length;
            var abList = new Array(total);
            var doneCount = 0;
            var totalLoaded = 0;

            function fetchNext(index) {
                if (index >= total) {
                    var totalLen = 0;
                    for (var i = 0; i < abList.length; i++) {
                        if (abList[i]) totalLen += abList[i].byteLength;
                    }
                    if (totalLen === 0) {
                        if (onDone) onDone(false);
                        return;
                    }
                    var combined = new Uint8Array(totalLen);
                    var offset = 0;
                    for (var j = 0; j < abList.length; j++) {
                        if (abList[j]) {
                            combined.set(new Uint8Array(abList[j]), offset);
                            offset += abList[j].byteLength;
                        }
                    }
                    var blob = new Blob([combined], { type: 'video/MP2T' });
                    var ok = triggerSave(blob, name);
                    if (onDone) onDone(ok);
                    return;
                }
                fetchBuffer(onlyTs[index]).then(function(ab) {
                    abList[index] = ab;
                    doneCount++;
                    totalLoaded += ab.byteLength;
                    if (onProgress) onProgress(doneCount, total, totalLoaded);
                    fetchNext(index + 1);
                }).catch(function() {
                    doneCount++;
                    if (onProgress) onProgress(doneCount, total, totalLoaded);
                    fetchNext(index + 1);
                });
            }
            fetchNext(0);
        }

        function startDoDownload(playlistText, base) {
            if (typeof window.showSaveFilePicker === 'function') {
                window.showSaveFilePicker({ suggestedName: name }).then(function(handle) {
                    doDownloadStream(playlistText, base, handle);
                }).catch(function() {
                    doDownloadMemory(playlistText, base);
                });
            } else {
                doDownloadMemory(playlistText, base);
            }
        }

        fetchText(url).then(function(text) {
            if (isMasterPlaylist(text)) {
                var variants = parseMasterPlaylistVariants(text, baseUrl);
                if (variants.length === 0) {
                    if (onDone) onDone(false);
                    return;
                }
                fetchText(variants[0].url).then(function(variantText) {
                    startDoDownload(variantText, getBaseUrl(variants[0].url));
                }).catch(function() {
                    if (onDone) onDone(false);
                });
            } else {
                startDoDownload(text, baseUrl);
            }
        }).catch(function() {
            if (onDone) onDone(false);
        });
    }

    function isVideoUrl(text) {
        if (!text || typeof text !== 'string') return false;
        var t = text.trim();
        if (t.indexOf('http://') !== 0 && t.indexOf('https://') !== 0) return false;
        return t.length >= 20;
    }

    function isSettingsOrPluginsPage() {
        var h = (window.location.hash || '').toLowerCase();
        return h.indexOf('extension') !== -1 || h.indexOf('plugin') !== -1;
    }

    function showDownloadPromptWithUrl(copiedUrl) {
        copiedUrl = fixUrl(copiedUrl);
        if (!copiedUrl || copiedUrl.indexOf('http') !== 0) return;
        if (isSettingsOrPluginsPage()) return;
        showDownloadFromClipboardPrompt(copiedUrl);
    }

    function showDownloadPromptWithUrl(urlFromClipboard) {
        if (isSettingsOrPluginsPage()) return;
        var url = urlFromClipboard ? fixUrl(String(urlFromClipboard).trim()) : '';
        var oldModal = document.getElementById('lampa-dl-after-copy');
        if (oldModal) oldModal.remove();

        var modal = document.createElement('div');
        modal.id = 'lampa-dl-after-copy';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('tabindex', '-1');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99995;display:flex;align-items:center;justify-content:center;font-family:sans-serif;outline:none;';
        var box = document.createElement('div');
        box.className = 'selector';
        box.setAttribute('tabindex', '0');
        box.style.cssText = 'background:#222;padding:24px;border-radius:10px;box-shadow:0 0 30px rgba(0,0,0,0.6);min-width:280px;outline:none;border:3px solid transparent;';
        box.innerHTML = '<p style="color:#fff;margin:0 0 16px;font-size:15px;">Скачать файл?</p>';
        var btnYes = document.createElement('div');
        btnYes.className = 'selector lampa-dl-after-btn';
        btnYes.setAttribute('data-action', 'yes');
        btnYes.setAttribute('tabindex', '0');
        btnYes.style.cssText = 'flex:1;background:#2a9d8f;color:#fff;padding:12px;border-radius:8px;text-align:center;font-size:14px;cursor:pointer;border:3px solid transparent;outline:none;';
        btnYes.textContent = 'Да';
        var btnNo = document.createElement('div');
        btnNo.className = 'selector lampa-dl-after-btn';
        btnNo.setAttribute('data-action', 'no');
        btnNo.setAttribute('tabindex', '0');
        btnNo.style.cssText = 'flex:1;background:#444;color:#ddd;padding:12px;border-radius:8px;text-align:center;font-size:14px;cursor:pointer;border:3px solid transparent;outline:none;';
        btnNo.textContent = 'Нет';
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:10px;';
        row.appendChild(btnYes);
        row.appendChild(btnNo);
        box.appendChild(row);
        modal.appendChild(box);
        document.body.appendChild(modal);

        var buttons = [btnYes, btnNo];
        var currentIndex = 0;

        function removeModalAndListeners() {
            if (modal.parentNode) modal.remove();
            document.removeEventListener('click', closeOut);
            document.removeEventListener('keydown', onKeyDown);
        }
        function closeOut(e) {
            if (modal.parentNode && e.target !== modal && !modal.contains(e.target)) removeModalAndListeners();
        }
        function activate(btn) {
            var action = btn.getAttribute('data-action');
            removeModalAndListeners();
            if (action === 'yes' && url && isVideoUrl(url)) {
                startDownload(url, 'video', null);
            } else if (action === 'yes' && !url) {
                showNotify('Ссылка не найдена в буфере');
            }
        }
        function onKeyDown(e) {
            if (!modal.parentNode || !document.body.contains(modal)) return;
            if (e.key === 'Enter' || e.key === ' ') {
                var active = document.activeElement;
                if (active && (active === btnYes || active === btnNo)) {
                    e.preventDefault();
                    activate(active);
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? 1 : 0;
                buttons[currentIndex].focus();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                currentIndex = currentIndex >= 1 ? 0 : 1;
                buttons[currentIndex].focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                removeModalAndListeners();
            }
        }

        btnYes.addEventListener('click', function() { activate(btnYes); });
        btnNo.addEventListener('click', function() { activate(btnNo); });
        btnYes.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(btnYes); }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); btnNo.focus(); currentIndex = 1; }
        });
        btnNo.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(btnNo); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); btnYes.focus(); currentIndex = 0; }
        });

        document.addEventListener('click', closeOut, false);
        document.addEventListener('keydown', onKeyDown, true);

        setTimeout(function() {
            btnYes.focus();
            currentIndex = 0;
        }, 100);

        if (typeof Lampa !== 'undefined' && Lampa.Controller) {
            try {
                if (typeof Lampa.Controller.collectionAppend === 'function') Lampa.Controller.collectionAppend(box);
                if (typeof Lampa.Controller.collectionFocus === 'function') Lampa.Controller.collectionFocus(btnYes);
            } catch (err) {}
        }
    }

    function showDownloadPromptAskClipboardOrPaste() {
        if (isSettingsOrPluginsPage()) return;
        function showWithUrl(url) {
            showDownloadPromptWithUrl(url);
        }
        function showPasteInput() {
            showNotify('Вставьте ссылку вручную');
            var m2 = document.createElement('div');
            m2.id = 'lampa-dl-paste';
            m2.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99996;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
            var b2 = document.createElement('div');
            b2.style.cssText = 'background:#222;padding:24px;border-radius:10px;min-width:320px;';
            b2.innerHTML = '<p style="color:#fff;margin:0 0 12px;">Вставьте ссылку на видео</p><input type="text" id="lampa-dl-paste-input" placeholder="https://..." style="width:100%;padding:10px;margin-bottom:12px;background:#111;color:#fff;border:1px solid #444;border-radius:6px;box-sizing:border-box;"><div style="display:flex;gap:8px;"><div class="selector" data-dl="go" tabindex="0" style="flex:1;background:#2a9d8f;color:#fff;padding:12px;text-align:center;border-radius:8px;cursor:pointer;">Скачать</div><div class="selector" data-dl="cancel" tabindex="0" style="flex:1;background:#444;color:#ddd;padding:12px;text-align:center;border-radius:8px;cursor:pointer;">Отмена</div></div>';
            m2.appendChild(b2);
            document.body.appendChild(m2);
            var inp = document.getElementById('lampa-dl-paste-input');
            if (inp) setTimeout(function() { inp.focus(); }, 100);
            b2.querySelector('[data-dl=go]').onclick = function() {
                var u = (inp && inp.value && inp.value.trim()) || '';
                m2.remove();
                if (u && isVideoUrl(u)) startDownload(u, 'video', null);
                else showNotify('Введите ссылку на видео');
            };
            b2.querySelector('[data-dl=cancel]').onclick = function() { m2.remove(); };
        }
        if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
            showPasteInput();
            return;
        }
        navigator.clipboard.readText().then(function(text) {
            var t = (text && text.trim()) || '';
            if (t && isVideoUrl(t)) {
                showWithUrl(t);
            } else {
                showPasteInput();
            }
        }).catch(function() { showPasteInput(); });
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

        showDownloadProgressWindow();

        function onProgress(loadedBytes, totalBytes, segmentDone, segmentTotal) {
            if (segmentDone === undefined) {
                segmentDone = 0;
                segmentTotal = 0;
            }
            updateDownloadProgress(loadedBytes || 0, totalBytes || 0, segmentDone, segmentTotal || 0);
        }
        function onDone(ok) {
            hideDownloadProgressWindow();
            showNotify(ok ? 'Сохранено: ' + filename : 'Ошибка загрузки');
        }

        if (isM3u8) {
            downloadM3u8(url, safeFilename(title), function(done, total, loadedBytes) {
                onProgress(loadedBytes || 0, 0, done, total);
            }, onDone);
        } else {
            downloadMp4(url, filename, function(loaded, total) {
                onProgress(loaded, total || 0, 0, 0);
            }, onDone);
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

    var clipboardPollInterval = null;
    var lastSeenClipboard = '';

    function checkClipboardOnce() {
        try {
            if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') return;
            navigator.clipboard.readText().then(function(text) {
                if (!text) return;
                var t = text.trim();
                if (t !== lastSeenClipboard && isVideoUrl(t)) {
                    lastSeenClipboard = t;
                    onVideoLinkCopied(t);
                } else if (!isVideoUrl(t)) {
                    lastSeenClipboard = t;
                }
            }).catch(function() {});
        } catch (e) {}
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

        function onCopy(e) {
            try {
                var text = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
                if (text) onVideoLinkCopied(text);
            } catch (err) {}
            setTimeout(function() { checkClipboardOnce(); }, 350);
        }
        document.addEventListener('copy', onCopy, true);
        window.addEventListener('copy', onCopy, true);

        if (!clipboardPollInterval && typeof navigator.clipboard !== 'undefined') {
            clipboardPollInterval = setInterval(checkClipboardOnce, 1500);
        }
    }

    function hookLampaNotification() {
        try {
            var msgMatch = function(arg) {
                var t = (typeof arg === 'string') ? arg : (arg && (arg.message || arg.text || arg.title || ''));
                if (!t || typeof t !== 'string') return false;
                var s = t.toLowerCase();
                return s.indexOf('скопирован') !== -1 || s.indexOf('буфер') !== -1 || s.indexOf('copied') !== -1 || s.indexOf('clipboard') !== -1;
            };
            var onCopyNotification = function() {
                setTimeout(function() { showDownloadPromptAskClipboardOrPaste(); }, 400);
            };
            if (Lampa.Notification && typeof Lampa.Notification.show === 'function') {
                var origNotif = Lampa.Notification.show.bind(Lampa.Notification);
                Lampa.Notification.show = function(msg) {
                    origNotif(msg);
                    if (msgMatch(msg)) onCopyNotification();
                };
            }
            if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                var origNoty = Lampa.Noty.show.bind(Lampa.Noty);
                Lampa.Noty.show = function(msg) {
                    origNoty(msg);
                    if (msgMatch(msg)) onCopyNotification();
                };
            }
        } catch (e) {}
    }

    var initDone = false;
    function initPlugin() {
        if (typeof Lampa === 'undefined') return;
        if (initDone) return;

        /* Убираем себя из списка расширений */
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
        hookLampaNotification();
        initDone = true;
    }

    if (typeof window !== 'undefined') {
        if (typeof Lampa !== 'undefined') {
            initPlugin();
        }
        if (window.appready) {
            initPlugin();
        }
        if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') setTimeout(initPlugin, 50);
            });
        }
        window.addEventListener('load', function() {
            setTimeout(initPlugin, 100);
            setTimeout(initPlugin, 600);
            setTimeout(initPlugin, 2000);
        });
    }
})();
