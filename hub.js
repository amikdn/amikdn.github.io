(function () {
    'use strict';

    // ==================== ЛОКАЛИЗАЦИЯ — ТОЛЬКО РУССКИЙ ====================
    function initLang() {
      Lampa.Lang.add({
        empty: { ru: '' },
        shots_modal_before_recording_txt_1: { ru: 'Сохраняйте свои любимые моменты и делитесь ими с другими!' },
        shots_modal_before_recording_txt_2: { ru: 'Выберите начало момента для записи и начните запись.' },
        shots_modal_before_recording_txt_3: { ru: 'Дождитесь окончания момента и остановите запись.' },
        shots_step: { ru: 'Шаг' },
        shots_start_recording: { ru: 'Начать запись' },
        shots_choice_start_point: { ru: 'Выбрать начало' },
        shots_modal_button_upload_start: { ru: 'Загрузить и сохранить запись' },
        shots_modal_button_upload_cancel: { ru: 'Отменить и удалить запись' },
        shots_modal_button_upload_again: { ru: 'Не удалось загрузить. Попробовать снова' },
        shots_modal_button_upload_complete: { ru: 'Хорошо' },
        shots_modal_short_recording_txt: { ru: 'Запись слишком короткая. Минимальная длина записи должна быть не менее 10 секунд.' },
        shots_upload_progress_start: { ru: 'Получение ссылки для загрузки...' },
        shots_upload_progress_uploading: { ru: 'Загрузка записи...' },
        shots_upload_progress_notify: { ru: 'Оповещение сервиса...' },
        shots_upload_complete_text: { ru: 'Запись успешно загружена и отправлена на обработку. Вы получите уведомление, когда она будет готова.' },
        shots_upload_complete_notify: { ru: 'Запись успешно обработана и готова к просмотру!' },
        shots_upload_error_notify: { ru: 'Не удалось обработать запись.' },
        shots_title_favorite: { ru: 'Понравившиеся' },
        shots_title_created: { ru: 'Созданные' },
        shots_status_error: { ru: 'Ошибка' },
        shots_status_processing: { ru: 'Обработка' },
        shots_status_ready: { ru: 'Загружено' },
        shots_status_blocked: { ru: 'Заблокировано' },
        shots_status_deleted: { ru: 'Удалено' },
        shots_recording_text: { ru: 'Идет запись' },
        shots_button_good: { ru: 'Хорошо' },
        shots_button_report: { ru: 'Пожаловаться' },
        shots_button_delete_video: { ru: 'Удалить запись' }
      });
    }

    var Lang = { init: initLang };

    // ==================== ШАБЛОНЫ ====================
    function initTemplates() {
      Lampa.Template.add('shots_player_record_button', `
        <div class="button selector" data-controller="player_panel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11.718" cy="11.718" r="10.718" stroke="white" stroke-width="2"/>
                <circle cx="11.718" cy="11.718" r="5.92621" fill="#FF0707"/>
            </svg>
        </div>
      `);

      Lampa.Template.add('shots_modal_before_recording', `
        <div class="about">
            <div style="font-size: 1.2em;">#{shots_modal_before_recording_txt_1}</div>
            <div><small style="font-size: 0.8em">#{shots_step} 1</small><br>#{shots_modal_before_recording_txt_2}</div>
            <div><small style="font-size: 0.8em">#{shots_step} 2</small><br>#{shots_modal_before_recording_txt_3}</div>
        </div>
      `);

      Lampa.Template.add('shots_modal_short_recording', `
        <div class="about">
            <div>#{shots_modal_short_recording_txt}</div>
        </div>
      `);

      Lampa.Template.add('shots_player_recorder', `
        <div class="shots-player-recorder">
            <div class="shots-player-recorder__body">
                <div class="shots-player-recorder__plate">
                    <div class="shots-player-recorder__text">#{shots_recording_text} <span></span></div>
                    <div class="shots-player-recorder__stop"></div>
                </div>
            </div>
        </div>
      `);

      Lampa.Template.add('shots_modal_upload', `
        <div class="shots-modal-upload">
            <div class="shots-modal-upload__preview"></div>
            <div class="shots-modal-upload__body"></div>
        </div>
      `);

      Lampa.Template.add('shots_progress', `
        <div class="shots-selector shots-progress selector">
            <div class="shots-progress__text">{text}</div>
            <div class="shots-progress__bar"><div></div></div>
        </div>
      `);

      Lampa.Template.add('shots_button', `
        <div class="shots-selector shots-button selector">{text}</div>
      `);

      Lampa.Template.add('shots_preview', `
        <div class="shots-preview">
            <div class="shots-preview__left">
                <div class="shots-preview__screenshot"><img></div>
            </div>
            <div class="shots-preview__body">
                <div class="shots-preview__year">{year}</div>
                <div class="shots-preview__title">{title}</div>
            </div>
        </div>
      `);

      Lampa.Template.add('shots_lenta', `
        <div class="shots-lenta">
            <div class="shots-lenta__video"></div>
            <div class="shots-lenta__panel"></div>
        </div>
      `);

      Lampa.Template.add('shots_lenta_video', `
        <div class="shots-lenta-video">
            <video class="shots-lenta-video__video-element" autoplay loop poster="./img/video_poster.png"></video>
            <div class="shots-lenta-video__progress-bar"><div></div></div>
            <div class="shots-lenta-video__layer selector"></div>
        </div>
      `);

      Lampa.Template.add('shots_counter', `
        <div class="shots-counter">
            <span></span>
            <div></div>
        </div>
      `);

      Lampa.Template.add('shots_author', `
        <div class="shots-author">
            <div class="shots-author__img"><img></div>
            <div class="shots-author__name">Аноним</div>
        </div>
      `);

      // SVG спрайты
      const sprites = `
        <symbol id="sprite-shots" viewBox="0 0 512 512">
            <path d="M253.266 512a19.166 19.166 0 0 1-19.168-19.168V330.607l-135.071-.049a19.164 19.164 0 0 1-16.832-28.32L241.06 10.013a19.167 19.167 0 0 1 36.005 9.154v162.534h135.902a19.167 19.167 0 0 1 16.815 28.363L270.078 502.03a19.173 19.173 0 0 1-16.812 9.97z" fill="currentColor"></path>
        </symbol>
      `;
      document.querySelector('#sprites').innerHTML += sprites;
    }

    var Templates = { init: initTemplates };

    // ==================== УТИЛИТЫ ====================
    function videoScreenShot(video, size = 500) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = size / video.videoWidth;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    }

    var Utils = { videoScreenShot };

    const Defined = {
      video_size: 1280,
      video_fps: 30,
      screen_size: 500,
      recorder_max_duration: 300
    };

    // ==================== РЕКОРДЕР ====================
    function Recorder(video) {
      this.html = Lampa.Template.get('shots_player_recorder');
      this.start_time = Date.now();

      this.start = function () {
        try {
          const canvas = document.createElement("canvas");
          const scale = Defined.video_size / video.videoWidth;
          canvas.width = video.videoWidth * scale;
          canvas.height = video.videoHeight * scale;
          const ctx = canvas.getContext("2d");

          const stream = canvas.captureStream(Defined.video_fps);
          const audioStream = video.captureStream();
          const audioTrack = audioStream.getAudioTracks()[0];

          const mixed = new MediaStream();
          stream.getTracks().forEach(t => mixed.addTrack(t));
          if (audioTrack) mixed.addTrack(audioTrack);

          const recorder = new MediaRecorder(mixed, {
            mimeType: 'video/webm;codecs=h264',
            videoBitsPerSecond: 6000000,
            audioBitsPerSecond: 128000
          });

          const chunks = [];
          const startPoint = Math.round(video.currentTime);

          recorder.ondataavailable = e => chunks.push(e.data);
          recorder.onstop = () => {
            if (Date.now() - this.start_time < 10000) {
              this.destroy();
              this.onError && this.onError(new Error('Слишком короткая запись'));
              return;
            }
            const blob = new Blob(chunks, { type: 'video/webm' });
            this.destroy();
            this.onStop && this.onStop({
              duration: (Date.now() - this.start_time) / 1000,
              blob,
              screenshot: Utils.videoScreenShot(video, Defined.screen_size),
              start_point: startPoint,
              end_point: Math.round(video.currentTime)
            });
          };

          this.screenshot = Utils.videoScreenShot(video, Defined.screen_size);
          this.recorder = recorder;
          this.run();
          recorder.start();
          this.html.find('.shots-player-recorder__stop').on('click', () => recorder.stop());
        } catch (e) {
          this.onError && this.onError(e);
        }
      };

      this.run = function () {
        $('body').append(this.html);
        Lampa.Controller.add('recorder', {
          toggle: () => Lampa.Controller.clear(),
          enter: () => this.recorder.stop(),
          back: () => this.recorder.stop()
        });
        Lampa.Controller.toggle('recorder');

        this.interval = setInterval(() => {
          const sec = Math.floor((Date.now() - this.start_time) / 1000);
          const min = Math.floor(sec / 60).toString().padStart(2, '0');
          const s = (sec % 60).toString().padStart(2, '0');
          this.html.find('.shots-player-recorder__text span').text(`${min}:${s}`);
        }, 500);
      };

      this.destroy = function () {
        clearInterval(this.interval);
        this.html.remove();
      };
    }

    // ==================== API (АНОНИМНЫЙ) ====================
    function url(u) {
      return Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/shots/' + u;
    }

    function request(fullUrl, data, success, error, timeout = 15000) {
      Lampa.Network.silent(fullUrl, success, error, data, { timeout });
    }

    var Api = {
      uploadRequest: (data, s, e) => request(url('upload-request'), data, s, e),
      uploadNotify: (data, s, e) => request(url('upload-notify'), data, s, e),
      uploadStatus: (id, s, e) => request(url('upload-status/' + id), null, s, e),
      shotsVideo: (id, s, e) => request(url('video/' + id), null, s, e),
      lenta: (page = 1, cb) => request(url('lenta?page=' + page), null, r => cb(r.results || []), () => cb([])),
      shotsList: (type, page = 1, s, e) => request(url('list/' + type + '?page=' + page), null, s, e),
      shotsLiked: (id, type, s, e) => request(url('liked'), { id, type }, s, e),
      shotsFavorite: (action, shot, s, e) => request(url('favorite'), { sid: shot.id, action }, s, e)
    };

    // ==================== ЗАГРУЗКА ====================
    function Upload(data) {
      this.data = data;
      this.html = Lampa.Template.get('shots_modal_upload');

      this.start = function () {
        const preview = new Image();
        preview.src = data.recording.screenshot;
        preview.style.maxWidth = '100%';
        preview.style.borderRadius = '10px';

        const progress = Lampa.Template.get('shots_progress', { text: 'Получение ссылки...' });
        const cancelBtn = Lampa.Template.get('shots_button', { text: 'Отмена' });

        this.html.find('.shots-modal-upload__preview').append(preview);
        this.html.find('.shots-modal-upload__body').append(progress, cancelBtn);

        cancelBtn.on('hover:enter', () => {
          Lampa.Modal.close();
          this.onCancel && this.onCancel();
        });

        Lampa.Modal.open({ html: this.html, size: 'small', onBack: () => {} });

        // Запрос на загрузку
        Api.uploadRequest({
          card_id: data.play_data.card.id,
          card_type: data.play_data.card.original_name ? 'tv' : 'movie',
          card_title: data.play_data.card.title || data.play_data.card.name || 'Unknown',
          card_year: (data.play_data.card.release_date || data.play_data.card.first_air_date || '').slice(0, 4),
          start_point: data.recording.start_point,
          end_point: data.recording.end_point,
          duration: Math.round(data.recording.duration),
          public: true
        }, (res) => {
          if (!res.url || !res.id) {
            progress.find('.shots-progress__text').text('Ошибка сервера');
            return;
          }

          progress.find('.shots-progress__text').text('Загрузка видео...');
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', res.url, true);
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              progress.find('.shots-progress__text').text(`Загрузка: ${percent}%`);
            }
          };
          xhr.onload = () => {
            Api.uploadNotify({ id: res.id }, () => {
              progress.find('.shots-progress__text').text('Готово! Обрабатывается...');
              Lampa.Bell.push({ text: 'Видео загружено и отправлено на обработку' });
              setTimeout(() => Lampa.Modal.close(), 2000);
              this.onComplete && this.onComplete();
            });
          };
          xhr.onerror = () => progress.find('.shots-progress__text').text('Ошибка загрузки');
          xhr.send(data.recording.blob);
        }, () => {
          progress.find('.shots-progress__text').text('Не удалось получить ссылку');
        });
      };
    }

    // ==================== ПЛЕЕР — КНОПКА ЗАПИСИ ====================
    function initPlayer() {
      const button = Lampa.Template.get('shots_player_record_button');

      button.on('hover:enter', () => {
        Lampa.Modal.open({
          title: 'Запись момента',
          html: Lampa.Template.get('shots_modal_before_recording'),
          size: 'small',
          buttons: [
            { name: 'Начать запись', onSelect: () => {
              Lampa.Modal.close();
              const video = Lampa.PlayerVideo.video();
              if (!video) return;

              const recorder = new Recorder(video);
              recorder.onStop = (rec) => {
                Lampa.PlayerVideo.pause();
                if (rec.duration < 10) {
                  Lampa.Modal.open({
                    html: Lampa.Template.get('shots_modal_short_recording'),
                    size: 'small',
                    buttons: [{ name: 'Хорошо', onSelect: () => Lampa.Modal.close() }]
                  });
                  return;
                }
                new Upload({
                  recording: rec,
                  play_data: Lampa.Player.data
                }).start();
              };
              recorder.onError = () => {
                Lampa.Modal.open({
                  title: 'Ошибка',
                  html: '<div>Не удалось начать запись. Попробуйте другой источник видео.</div>',
                  size: 'small',
                  buttons: [{ name: 'Хорошо', onSelect: () => Lampa.Modal.close() }]
                });
              };
              recorder.start();
            }}
          ],
          onBack: () => Lampa.Modal.close()
        });
      });

      // Добавляем кнопку в плеер
      $(document).on('player:ready', () => {
        setTimeout(() => {
          $('.player-panel__right').append(button);
        }, 1000);
      });
    }

    var Player = { init: initPlayer };

    // ==================== ЗАПУСК ПЛАГИНА ====================
    function startPlugin() {
      if (window.plugin_shots_ready) return;
      window.plugin_shots_ready = true;

      Lang.init();
      Templates.init();
      Player.init();

      // Добавляем кнопку в главное меню
      Lampa.Menu.addButton(
        '<svg width="28" height="28"><use xlink:href="#sprite-shots"></use></svg>',
        'Shots',
        () => {
          Api.lenta(1, (shots) => {
            if (!shots.length) {
              Lampa.Activity.push({
                url: '',
                title: 'Shots',
                component: 'empty',
                page: 1
              });
              return;
            }
            const first = shots[0];
            Lampa.Activity.push({
              url: '',
              title: 'Shots',
              component: 'full',
              source: 'shots',
              id: first.id
            });
          });
        }
      );

      console.log('Shots плагин (анонимный, только русский) успешно загружен');
    }

    if (!window.plugin_shots_ready) startPlugin();
})();
