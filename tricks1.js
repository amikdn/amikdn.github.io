(function(){
    "use strict";

    // Инициализируем платформу TV (предполагается, что Lampa.Platform.tv() отвечает за установку режима ТВ)
    Lampa.Platform.tv();

    /**
     * Функция для загрузки и отображения рейтинга для элемента.
     * Ожидается, что событие передаёт объект с информацией об элементе,
     * для которого нужно подгрузить рейтинг (например, фильм или сериал).
     *
     * @param {object} event - Объект события с параметрами:
     *   - type: тип события (например, "render")
     *   - object: объект с информацией, содержащий:
     *       - method: строка с методом запроса
     *       - id: идентификатор объекта
     *       - activity: объект, предоставляющий метод getContainer() для доступа к DOM-контейнеру элемента
     */
    function loadRatingForElement(event) {
        // Проверяем, что событие имеет нужный тип
        if (event.type === "render") {
            // Получаем контейнер, в котором нужно отобразить рейтинг
            var container = event.object.activity.getContainer();
            // Ищем уже созданный блок для рейтинга внутри контейнера
            var ratingBlock = $(container).find("div.full-start__rate.rate--lampa");

            // Если блока рейтинга нет, создаём его
            if (ratingBlock.length === 0) {
                ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                // Внутри рейтингового блока создаём дополнительные элементы для оформления
                ratingBlock.append($('<div></div>')); 
                ratingBlock.append($('<div class="rate--kp"></div>'));
                // Добавляем блок рейтинга в контейнер (например, после блока с информацией о фильме)
                $(container).find("div.full-start").append(ratingBlock);
            }

            // Формируем ключ для запроса рейтинга – составляем строку из метода и id объекта
            var ratingKey = event.object.method + "_" + event.object.id;
            // Формируем URL для получения рейтинга. В оригинальном коде использовался URL вида:
            // "http://cub.red/api/reactions/get/" + ratingKey
            var ratingUrl = "http://cub.red/api/reactions/get/" + ratingKey;
            
            // Создаём XMLHttpRequest для получения рейтинга
            var xhr = new XMLHttpRequest();
            xhr.open("GET", ratingUrl, true);
            // Устанавливаем таймаут запроса (2000 мс)
            xhr.timeout = 2000;
            xhr.send();

            // Обработчик успешного завершения запроса
            xhr.onload = function(){
                // Парсим JSON-ответ
                var data = JSON.parse(this.responseText);
                // Предполагается, что ответ имеет поле result – массив реакций
                var reactions = data.result;
                var positive = 0, negative = 0;

                // Проходим по всем реакциям и суммируем положительные и отрицательные значения
                reactions.forEach(function(item){
                    // Допустим, типы реакций "like" и "plus" считаем положительными
                    if (item.type === "like" || item.type === "plus") {
                        positive += parseInt(item.value);
                    }
                    // А типы "dislike", "minus" и "shit" – отрицательными
                    if (item.type === "dislike" || item.type === "minus" || item.type === "shit") {
                        negative += parseInt(item.value);
                    }
                });

                // Вычисляем рейтинг по формуле: positive / (positive + negative) * 10
                var rating = (positive + negative > 0) ? (positive / (positive + negative) * 10) : 0;
                // Округляем рейтинг до одного знака после запятой
                rating = rating.toFixed(1);
                // Отображаем полученный рейтинг в специально отведённом элементе внутри блока рейтинга
                ratingBlock.find("div.rate--kp").text(rating);
            };

            // Обработчик ошибки запроса
            xhr.onerror = function(){
                console.log("Ошибка при выполнении запроса на получение рейтинга");
            };

            // Обработчик таймаута запроса
            xhr.ontimeout = function(){
                console.log("Запрос тайм-аут");
            };
        }
    }

    /**
     * Функция инициализации модуля рейтингов.
     * Проверяет доступ к приложению, затем подписывается на событие, по которому 
     * подгружается рейтинг для нужного элемента.
     */
    function initRatingModule() {
        // Проверяем, что текущий Manifest соответствует ожидаемому
        if (Lampa.Manifest.name !== "bylampa") {
            // Если нет – выводим уведомление об ошибке доступа
            Lampa.Noty.show("Ошибка доступа");
            return;
        }

        // Подписываемся на событие "full" (например, рендеринг полного экрана)
        Lampa.Listener.follow("full", function(event) {
            if (event.type === "render") {
                loadRatingForElement(event);
            }
        });
    }

    // Если приложение уже готово, инициализируем модуль сразу.
    // Если нет, подписываемся на событие "appready" с помощью метода follow.
    if (window.appready) {
        initRatingModule();
    } else {
        Lampa.Listener.follow("appready", function(event) {
            if (event.type === "ready") {
                initRatingModule();
            }
        });
    }
})();
