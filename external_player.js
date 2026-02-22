(function() {
    'use strict';
    
    const PLUGIN_NAME = 'External Player';
    
    const PLUGIN_VERSION = '1.0';
    
    // Конфигурация плееров
    const PLAYERS = {
        potplayer: {
            name: 'PotPlayer',
            icon: '▶️',
            protocol: 'potplayer://'
        }
    };
    
    let pluginLogs = [];
    let originalPlayerPlay = null;
    let pendingPlayerData = null;
    
    function log(message, data) {
        let time = new Date().toLocaleTimeString();
        let logMessage = `[${time}] ${message}`;
        
        pluginLogs.push(logMessage + (data ? ' | ' + JSON.stringify(data).substring(0, 200) : ''));
        if (pluginLogs.length > 50) pluginLogs.shift();
        
        if (typeof console !== 'undefined') {
            if (data) console.log(logMessage, data);
            else console.log(logMessage);
        }
    }
    
    function getPluginLogs() {
        return pluginLogs.join('\n');
    }
    
    function showNotify(msg) {
        log('Notify: ' + msg);
        if (Lampa.Noty) Lampa.Noty.show(msg);
        else if (Lampa.Notification) Lampa.Notification.show(msg);
    }
    
    function fixUrl(url) {
        if (!url) return url;
        let fixedUrl = url.replace(/&preload$/, '&play');
        fixedUrl = fixedUrl.replace(/&preload(&|$)/, '&play$1');
        if (fixedUrl !== url) log('URL исправлен: &preload -> &play');
        return fixedUrl;
    }
    
    async function copyToClipboard(text) {
        log('Копирование: ' + text.substring(0, 50) + '...');
        try {
            await navigator.clipboard.writeText(text);
            showNotify('URL скопирован!');
            return true;
        } catch(e) {
            showNotify('URL: ' + text.substring(0, 80) + '...');
            return false;
        }
    }
    
    function openInPlayer(url, playerKey, title) {
        let player = PLAYERS[playerKey];
        if (!player) return;
        
        let fixedUrl = fixUrl(url);
        log('Открытие в ' + player.name + ': ' + fixedUrl.substring(0, 60));
        
        let playerUrl = player.protocol + fixedUrl;
        
        try {
            let currentHash = window.location.hash;
            window.location.href = playerUrl;
            
            setTimeout(function() {
                if (window.location.hash !== currentHash) {
                    history.replaceState(null, null, currentHash || '#');
                }
            }, 500);
        } catch(e) {
            log('Ошибка открытия: ' + e.message);
        }
        
        showNotify('Открываю в ' + player.name + '...');
        
        setTimeout(function() {
            let cmd = `${player.protocol}"${fixedUrl}"`;
            createInstructionModal(fixedUrl, player, cmd, playerKey);
        }, 2000);
    }
    
    function createInstructionModal(url, player, cmd, playerKey) {
        let oldModal = document.getElementById('external-player-modal');
        if (oldModal) oldModal.remove();
        
        let modal = document.createElement('div');
        modal.id = 'external-player-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 99999;
            display: flex; align-items: center; justify-content: center; font-family: sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; max-width: 750px; width: 90%; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
                <h3 style="color: #fff; margin: 0 0 20px 0; font-size: 20px; text-align: center;">${player.icon} ${player.name}</h3>
                <div style="background: #0a0a0a; padding: 15px; border-radius: 5px; margin-bottom: 15px; border-left: 3px solid #4fc3f7;">
                    <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Если не открылось автоматически:</div>
                    <code style="color: #4fc3f7; font-size: 12px; word-break: break-all; font-family: monospace; display: block; background: #1a1a1a; padding: 10px; border-radius: 3px;">${cmd}</code>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
                    <button id="player-copy-cmd" style="flex: 1; min-width: 140px; background: #4fc3f7; color: #000; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">Копировать команду</button>
                    <button id="player-close" style="flex: 1; min-width: 140px; background: #444; color: #fff; border: none; padding: 12px; border-radius: 5px; cursor: pointer;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('player-copy-cmd')?.addEventListener('click', function() { copyToClipboard(cmd); });
        document.getElementById('player-close')?.addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    }
    
    // МОДАЛЬНОЕ ОКНО ВЫБОРА ПЛЕЕРА
    function showPlayerChoiceModal(data) {
        let url = data.url || data.stream_url || data.link || data.file;
        url = fixUrl(url);
        let title = data.title || data.name || 'Видео';
        
        if (!url) {
            if (originalPlayerPlay) originalPlayerPlay.call(Lampa.Player, data);
            return;
        }
        
        if (!url.match(/^https?:\/\//)) url = 'http://' + url;
        
        pendingPlayerData = data;
        
        let oldModal = document.getElementById('external-choice-modal');
        if (oldModal) oldModal.remove();
        
        let modal = document.createElement('div');
        modal.id = 'external-choice-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 99990;
            display: flex; align-items: center; justify-content: center; font-family: sans-serif;
        `;
        
        let playersHtml = '';
        Object.keys(PLAYERS).forEach(function(key) {
            let p = PLAYERS[key];
            playersHtml += `<button class="choice-btn" data-key="${key}" style="width: 100%; background: #2a9d8f; color: #fff; border: none; padding: 15px; border-radius: 5px; cursor: pointer; font-size: 15px; margin-bottom: 10px;">${p.icon} Открыть в ${p.name}</button>`;
        });
        
        modal.innerHTML = `
            <div style="background: #222; padding: 25px; border-radius: 10px; max-width: 400px; width: 85%; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                <h3 style="color: #fff; margin: 0 0 20px 0; font-size: 18px; text-align: center;">Выберите способ просмотра</h3>
                
                <div id="choice-list">
                    ${playersHtml}
                    <button class="choice-btn" data-type="internal" style="width: 100%; background: #555; color: #fff; border: none; padding: 15px; border-radius: 5px; cursor: pointer; font-size: 15px; margin-bottom: 10px;">🎬 Встроенный плеер</button>
                    <button class="choice-btn" data-type="copy" style="width: 100%; background: #444; color: #ddd; border: none; padding: 15px; border-radius: 5px; cursor: pointer; font-size: 15px;">📋 Копировать URL</button>
                </div>
                
                <button id="choice-cancel" style="width: 100%; background: transparent; color: #888; border: 1px solid #444; padding: 12px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Отмена</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            let target = e.target;
            
            // Закрытие по кнопке Отмена или клику мимо окна
            if (target.id === 'choice-cancel' || target === modal) {
                modal.remove();
                return;
            }
            
            if (target.classList.contains('choice-btn')) {
                let type = target.dataset.type;
                let key = target.dataset.key;
                
                log('Выбрано: ' + (type || key));
                
                // 1. Всегда закрываем меню выбора плеера
                modal.remove();
                
                if (type === 'internal') {
                    // Встроенный плеер - передаем управление Lampa
                    if (originalPlayerPlay) originalPlayerPlay.call(Lampa.Player, pendingPlayerData);
                } 
                else if (type === 'copy') {
                    copyToClipboard(url);
                } 
                else if (key) {
                    // Внешний плеер
                    
                    // Останавливаем встроенный плеер, если он занят
                    if (Lampa.Player && Lampa.Player.stop) Lampa.Player.stop();
                    
                    // ВАЖНО: НЕ вызываем closeBackgroundWindows() или Controller.back()
                    // чтобы список серий остался открытым.
                    
                    // Запускаем внешнее воспроизведение
                    setTimeout(function() {
                        openInPlayer(url, key, title);
                    }, 300);
                }
            }
        });
    }
    
    function initPlugin() {
        log('=== ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' ===');
        
        if (typeof Lampa === 'undefined') {
            log('ОШИБКА: Lampa не найдена');
            return;
        }
        
        if (Lampa.Plugins) {
            Lampa.Plugins.add({
                id: 'external_player',
                name: PLUGIN_NAME,
                version: PLUGIN_VERSION,
                description: 'Открытие торрентов во внешних плеерах',
                logs: getPluginLogs
            });
        }
        
        if (Lampa.Player && Lampa.Player.play) {
            originalPlayerPlay = Lampa.Player.play;
            
            Lampa.Player.play = function(playerData) {
                log('=== Перехват Player.play ===');
                
                let url = playerData.url || playerData.stream_url || playerData.link || playerData.file;
                
                if (url && typeof url === 'string' && url.match(/^https?:\/\//)) {
                    log('HTTP поток -> Показ своего меню');
                    showPlayerChoiceModal(playerData);
                } else {
                    originalPlayerPlay.call(this, playerData);
                }
            };
        }
    }
    
    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') setTimeout(initPlugin, 100); });
    
    window.ExternalPlayerPlugin = { version: PLUGIN_VERSION, getLogs: getPluginLogs };
    
})();