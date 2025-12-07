(function () {
    'use strict';

    console.log('Shots: Инициализация плагина (анонимный, RU-only)');

    // Локализация (только RU)
    function initLang() {
        Lampa.Lang.add({
            shots_modal_before_recording_txt_1: { ru: 'Сохраняйте свои любимые моменты и делитесь ими с другими!' },
            shots_modal_before_recording_txt_2: { ru: 'Выберите начало момента для записи и начните запись.' },
            shots_modal_before_recording_txt_3: { ru: 'Дождитесь окончания момента и остановите запись.' },
            shots_step: { ru: 'Шаг' },
            shots_start_recording: { ru: 'Начать запись' },
            shots_modal_short_recording_txt: { ru: 'Запись слишком короткая. Минимальная длина записи должна быть не менее 10 секунд.' },
            shots_recording_text: { ru: 'Идет запись' },
            shots_button_good: { ru: 'Хорошо' },
            shots_title_favorite: { ru: 'Понравившиеся' },
            shots_title_created: { ru: 'Созданные' },
            shots_status_processing: { ru: 'Обработка' },
            shots_status_ready: { ru: 'Загружено' }
        });
    }

    // Шаблоны (упрощённые для MX)
    function initTemplates() {
        Lampa.Template.add('shots_player_record_button', `
            <div class="button selector" data-controller="player_panel">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="#FF0707"/>
                </svg>
            </div>
        `);

        Lampa.Template.add('shots_modal_before_recording', `
            <div class="about">
                <div style="font-size: 1.2em;">#{shots_modal_before_recording_txt_1}</div>
                <div><small>#{shots_step} 1</small><br>#{shots_modal_before_recording_txt_2}</div>
                <div><small>#{shots_step} 2</small><br>#{shots_modal_before_recording_txt_3}</div>
            </div>
        `);

        Lampa.Template.add('shots_modal_short_recording', `<div class="about"><div>#{shots_modal_short_recording_txt}</div></div>`);

        Lampa.Template.add('shots_player_recorder', `
            <div class="shots-player-recorder" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;">
                <div style="background:rgba(0,0,0,0.8);padding:20px;border-radius:10px;color:white;">
                    <div>#{shots_recording_text} <span id="record-time">00:00</span></div>
                    <button id="stop-record" style="background:red;color:white;border:none;padding:10px;border-radius:5px;">Стоп</button>
                </div>
            </div>
        `);

        // Добавляем SVG в body, если нет #sprites
        if (!document.getElementById('sprites')) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'sprites';
            svg.style.display = 'none';
            document.body.appendChild(svg);
        }
        const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
        symbol.id = 'sprite-shots';
        symbol.setAttribute('viewBox', '0 0 512 512');
        symbol.innerHTML = '<path d="M253.266 512a19.166 19.166 0 0 1-19.168-19.168V330.607l-135.071-.049a19.164 19.164 0 0 1-16.832-28.32L241.06 10.013a19.167 19.167 0 0 1 36.005 9.154v162.534h135.902a19.167 19.167 0 0 1 16.815 28.363L270.078 502.03a19.173 19.173 0 0 1-16.812 9.97z" fill="currentColor"></path>';
        document.getElementById('sprites').appendChild(symbol);
    }

    // Утилиты
    function videoScreenShot(video, size = 500) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = size / video.videoWidth;
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    }

    const Defined = { video_size: 1280, video_fps: 30, screen_size: 500, recorder_max_duration: 300 };

    // Рекордер (упрощённый)
    function Recorder(video) {
        console.log('Shots: Запуск рекордера');
        this.html = $(Lampa.Template.get('shots_player_recorder'));
        this.start_time = Date.now();
        this.video = video;

        this.start = function() {
            try {
                const canvas = document.createElement('canvas');
                const scale = Defined.video_size / video.videoWidth;
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;
                const ctx = canvas.getContext('2d');

                // Анимация кадров
                function draw() {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    if (!this.stopped) requestAnimationFrame(draw.bind(this));
                }
                draw.call(this);

                const stream = canvas.captureStream(Defined.video_fps);
                const audioStream = video.captureStream();
                const audioTrack = audioStream.getAudioTracks()[0];

                const mixed = new MediaStream([...stream.getTracks()]);
                if (audioTrack) mixed.addTrack(audioTrack);

                this.recorder = new MediaRecorder(mixed, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 2500000 });
                const chunks = [];
                const startPoint = Math.round(video.currentTime);

                this.recorder.ondataavailable = e => chunks.push(e.data);
                this.recorder.onstop = () => {
                    this.stopped = true;
                    const duration = (Date.now() - this.start_time) / 1000;
                    if (duration < 10) return this.onError(new Error('Слишком коротко'));
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    this.onStop({ duration, blob, screenshot: videoScreenShot(video), start_point: startPoint, end_point: Math.round(video.currentTime) });
                };

                this.run();
                this.recorder.start(1000); // Таймауты по 1с
                this.html.find('#stop-record').on('click', () => this.recorder.stop());
            } catch (e) {
                console.error('Shots: Ошибка рекордера', e);
                this.onError(e);
            }
        };

        this.run = function() {
            $('body').append(this.html);
            this.updateTime();
            Lampa.Controller.add('recorder', { back: () => this.recorder.stop() });
            Lampa.Controller.toggle('recorder');
        };

        this.updateTime = function() {
            const sec = Math.floor((Date.now() - this.start_time) / 1000);
            const min = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = (sec % 60).toString().padStart(2, '0');
            $('#record-time').text(`${min}:${s}`);
            if (sec < Defined.recorder_max_duration) setTimeout(() => this.updateTime(), 500);
        };

        this.destroy = function() { this.html.remove(); };
    }

    // API (fetch вместо Network, анонимно)
    function apiRequest(path, data = null, method = 'POST') {
        const url = `${Lampa.Utils.protocol()}${Lampa.Manifest.cub_domain}/api/shots/${path}`;
        return fetch(url, { method, body: data ? JSON.stringify(data) : null, headers: { 'Content-Type': 'application/json' } })
            .then(r => r.json())
            .catch(e => console.error('Shots API error:', e));
    }

    // Загрузка (упрощённая)
    function Upload(recording, playData) {
        console.log('Shots: Запуск загрузки');
        const modal = $('<div style="padding:20px;color:white;"><img src="' + recording.screenshot + '" style="width:100%;border-radius:10px;"><div id="upload-progress">Получение ссылки...</div></div>');
        Lampa.Modal.open({ title: 'Загрузка', html: modal, size: 'small' });

        apiRequest('upload-request', {
            card_id: playData.card.id,
            card_type: playData.card.original_name ? 'tv' : 'movie',
            card_title: playData.card.title || playData.card.name || 'Unknown',
            card_year: (playData.card.release_date || '').slice(0, 4),
            start_point: recording.start_point,
            end_point: recording.end_point,
            duration: Math.round(recording.duration)
        }).then(res => {
            if (!res.url) return $('#upload-progress').text('Ошибка сервера');
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', res.url, true);
            xhr.upload.onprogress = e => $('#upload-progress').text(`Загрузка: ${Math.round(e.loaded / e.total * 100)}%`);
            xhr.onload = () => {
                apiRequest('upload-notify', { id: res.id }).then(() => {
                    $('#upload-progress').text('Готово!');
                    Lampa.Noty.show('Видео загружено!');
                    setTimeout(() => Lampa.Modal.close(), 2000);
                });
            };
            xhr.send(recording.blob);
        });
    }

    // Инициализация плеера (fallback Observer)
    function initPlayer() {
        console.log('Shots: Инициализация плеера');
        const button = $(Lampa.Template.get('shots_player_record_button'));
        button.on('hover:enter', () => {
            Lampa.Modal.open({
                title: 'Запись',
                html: Lampa.Template.get('shots_modal_before_recording'),
                buttons: [{ elem: $('<div>Начать</div>'), onSelect: () => {
                    Lampa.Modal.close();
                    const video = document.querySelector('video'); // Fallback
                    if (!video) return Lampa.Noty.show('Нет видео');
                    const recorder = new Recorder(video);
                    recorder.onStop = rec => {
                        if (rec.duration < 10) return Lampa.Modal.open({ html: Lampa.Template.get('shots_modal_short_recording') });
                        Upload(rec, Lampa.Player ? Lampa.Player.data : { card: { id: 0 } });
                    };
                    recorder.onError = e => Lampa.Noty.show('Ошибка: ' + e.message);
                    recorder.start();
                } }]
            });
        });

        // Добавляем кнопку (Observer для MX)
        const observer = new MutationObserver(() => {
            const panel = $('.player-panel__right');
            if (panel.length && !panel.find('[data-controller="player_panel"]').length) {
                panel.append(button);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Меню (простая лента)
    function addMenu() {
        Lampa.Menu.addButton('<svg width="24" height="24"><use xlink:href="#sprite-shots"></use></svg>', 'Shots', () => {
            apiRequest('lenta?page=1').then(data => {
                if (!data || !data.results?.length) return Lampa.Noty.show('Лента пуста');
                // Простой просмотр первого
                const first = data.results[0];
                Lampa.Modal.open({ title: 'Shots', html: `<video src="${first.file}" controls style="width:100%;"></video>` });
            }).catch(() => Lampa.Noty.show('Ошибка ленты'));
        });
    }

    // Запуск
    function start() {
        if (window.plugin_shots_ready) return;
        window.plugin_shots_ready = true;
        initLang();
        initTemplates();
        initPlayer();
        addMenu();
        console.log('Shots: Плагин готов');
    }

    // Ждём готовность Lampa
    if (window.Lampa && Lampa.ready) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
