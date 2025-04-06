(function(){
    'use strict';
    /** 
     * Настройки синхронизации аккаунта: 
     * - Хранит токен авторизации пользователя для облачной синхронизации 
     * - Выполняет экспорт/импорт данных (избранное, история и т.д.) на удалённый сервер
     */

    // Базовый URL сервера синхронизации (обратите внимание: используется прямой IP)
    const baseUrl = "http://212.113.103.137:3003";
    
    // Ключ в localStorage для токена авторизации
    const TOKEN_KEY = 'token';

    // Проверяет, авторизован ли пользователь (наличие токена)
    function isLoggedIn() {
        return localStorage.getItem(TOKEN_KEY) !== null;
    }

    // Собрать объект с локальными данными пользователя для бэкапа/синхронизации
    function collectLocalData() {
        return {
            torrents_view: Lampa.Storage.get('torrents_view', '[]'),
            plugins:       Lampa.Storage.get('plugins', '[]'),
            favorite:      Lampa.Storage.get('favorite', '{}'),
            file_view:     Lampa.Storage.get('file_view', '{}'),
            search_history: Lampa.Storage.get('search_history', '[]')
        };
    }

    // Сохранить объект данных в локальное хранилище (восстановление из облака)
    function applyLocalData(data) {
        if (typeof data !== 'object' || data === null) return;
        if (data.torrents_view)   Lampa.Storage.set('torrents_view', data.torrents_view);
        if (data.plugins)         Lampa.Storage.set('plugins', data.plugins);
        if (data.favorite)        Lampa.Storage.set('favorite', data.favorite);
        if (data.file_view)       Lampa.Storage.set('file_view', data.file_view);
        if (data.search_history)  Lampa.Storage.set('search_history', data.search_history);
    }

    // Выполнить проверку токена на сервере
    function checkToken(token, onSuccess, onError) {
        const url = `${baseUrl}/lampa/backup/checkToken?token=${encodeURIComponent(token)}`;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Предполагается, что сервер возвращает JSON с результатом проверки
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.valid) {
                        console.log('Токен действителен');
                        if (onSuccess) onSuccess();
                    } else {
                        console.log('Токен недействителен');
                        if (onError) onError("Токен недействителен");
                    }
                } catch(e) {
                    console.error('Ошибка: некорректный ответ сервера при проверке токена');
                    if (onError) onError("Ошибка проверки токена");
                }
            } else {
                console.error('Ошибка запроса /checkToken:', xhr.status, xhr.statusText);
                if (onError) onError("Ошибка запроса проверки токена");
            }
        };
        xhr.onerror = function() {
            console.error('Ошибка сети при проверке токена');
            if (onError) onError("Ошибка сети при проверке токена");
        };
        xhr.send();
    }

    // Загрузить (импортировать) данные с сервера и применить их локально
    function importDataFromServer(token) {
        const url = `${baseUrl}/lampa/sync?token=${encodeURIComponent(token)}`;
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        // Ожидается, что сервер возвращает объект с данными пользователя
                        applyLocalData(response);
                        console.log('Синхронизация успешно завершена');
                        resolve(response);
                    } catch(e) {
                        console.error('Не удалось загрузить данные для синхронизации');
                        reject(new Error("Не удалось загрузить данные для синхронизации"));
                    }
                } else {
                    console.error('Ошибка запроса /sync:', xhr.status, xhr.statusText);
                    reject(new Error("Ошибка запроса синхронизации"));
                }
            };
            xhr.onerror = () => {
                console.error('Ошибка сети при синхронизации');
                reject(new Error("Ошибка сети при синхронизации"));
            };
            xhr.send();
        });
    }

    // Отправить (экспортировать) локальные данные пользователя на сервер
    function exportDataToServer(token, data) {
        const url = `${baseUrl}/lampa/backup/export?token=${encodeURIComponent(token)}`;
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    console.log('Данные успешно отправлены на сервер');
                    resolve();
                } else {
                    console.error('Ошибка запроса /backup/export:', xhr.status, xhr.statusText);
                    reject(new Error("Ошибка при экспорте данных"));
                }
            };
            xhr.onerror = () => {
                console.error('Ошибка сети при экспорте данных');
                reject(new Error("Ошибка сети при экспорте данных"));
            };
            try {
                xhr.send(JSON.stringify(data));
            } catch(e) {
                console.error('Ошибка отправки данных на сервер:', e);
                reject(new Error("Ошибка отправки данных"));
            }
        });
    }

    // Выполнить выход из аккаунта (удалить токен и обновить интерфейс)
    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        Lampa.Noty.show('Вы вышли из аккаунта');
        // Показать поле ввода токена снова
        document.querySelector('div[data-name="account_auth"]')?.classList.remove('hide');
        // Дополнительно можно обновить статус аккаунта на экране настроек
    }

    // Основная функция инициализации плагина аккаунта
    function initAccountSync() {
        // Добавить раздел настроек "Аккаунт"
        Lampa.SettingsApi.addParam({
            component: 'account', 
            param: { name: 'account_auth', type: 'input' },  // поле для ввода токена
            field: { name: 'Авторизация', description: 'Введите токен аккаунта' },
            onChange: (value) => {
                // Когда пользователь вводит токен и подтверждает
                const token = value.trim();
                if (token) {
                    // Сохранить токен и проверить его
                    localStorage.setItem(TOKEN_KEY, token);
                    checkToken(token, () => {
                        Lampa.Noty.show('Токен действителен. Выполняется синхронизация...');
                        // После успешной проверки сразу загрузить данные с сервера
                        importDataFromServer(token)
                            .then(() => {
                                Lampa.Noty.show('Синхронизация успешно завершена');
                                // Обновить статус отображения (скрыть поле ввода токена)
                                document.querySelector('div[data-name="account_auth"]')?.classList.add('hide');
                            })
                            .catch(err => {
                                console.error(err.message);
                                Lampa.Noty.show(err.message);
                            });
                    }, (errMsg) => {
                        // Ошибка проверки токена
                        localStorage.removeItem(TOKEN_KEY);
                        Lampa.Noty.show(errMsg || 'Токен недействителен');
                    });
                }
            }
        });

        // Добавить кнопку "Выйти" из аккаунта
        Lampa.SettingsApi.addParam({
            component: 'account',
            param: { name: 'account_logout', type: 'button' },
            field: { name: 'Выйти', description: '' },
            onChange: () => {
                // При нажатии на "Выйти" запросить подтверждение
                Lampa.Noty.confirm('Выполнить выход из аккаунта?', () => {
                    logout();
                });
            }
        });

        // Если токен уже сохранён, скрыть поле ввода и выполнить автоматическую синхронизацию
        if (isLoggedIn()) {
            const token = localStorage.getItem(TOKEN_KEY);
            // Скрыть поле ввода токена, так как уже авторизованы
            document.querySelector('div[data-name="account_auth"]')?.classList.add('hide');
            // Попробовать сразу загрузить актуальные данные с сервера
            importDataFromServer(token)
                .then(() => {
                    console.log('Данные аккаунта синхронизированы при запуске');
                })
                .catch(err => {
                    console.warn(err.message);
                    // Если не удалось синхронизировать, может быть токен просрочен – удалить
                    // (Чтобы поле ввода снова было доступно для ввода нового токена)
                    localStorage.removeItem(TOKEN_KEY);
                    document.querySelector('div[data-name="account_auth"]')?.classList.remove('hide');
                    Lampa.Noty.show(err.message);
                });
        }
    }

    // Инициализация при готовности приложения
    if (window.appready) {
        initAccountSync();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'appready') {
                initAccountSync();
            }
        });
    }
})();
