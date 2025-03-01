(function () {
    'use strict';
    Lampa.Platform.tv(); 
    function add() {
        var a = 's'; 
        function updateT() {
            //var element = $(".view--torrent"); 
            if(Lampa.Storage.field('BUTTONS_fix') == true) {
                //if(element.length > 0) {
                    $(".view--onlines_v1", Lampa.Activity.active().activity.render()).empty().append("<svg viewBox=\"0 0 847 847\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><circle cx=\"423\" cy=\"423\" r=\"398\" fill=\"#3498db\" class=\"fill-1fc255\"></circle><path d=\"M642 423 467 322 292 221v404l175-101z\" fill=\"#fff7f7\" stroke=\"#fff7f7\" stroke-width=\"42.33\" stroke-linejoin=\"round\" class=\"fill-fff7f7 stroke-fff7f7\"></path></svg><span>MODS's онлайн</span>");
                    $(".view--torrent", Lampa.Activity.active().activity.render()).empty().append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" width=\"48px\" height=\"48px\"><path fill=\"#4caf50\" fill-rule=\"evenodd\" d=\"M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20c-11.016,0-20,8.985-20,20C3.501,35.141,12.485,44.125,23.501,44.125z\" clip-rule=\"evenodd\"></path><path fill=\"#fff\" fill-rule=\"evenodd\" d=\"M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376c6.868,1.552,12.308-0.869,12.962-6.203c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z\" clip-rule=\"evenodd\"></path></svg><span>Торренты</span>");
                    $(".open--menu", Lampa.Activity.active().activity.render()).empty().append("<svg viewBox=\"0 0 847 847\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><circle cx=\"423\" cy=\"423\" r=\"398\" fill=\"#3498db\" class=\"fill-1fc255\"></circle><path d=\"M642 423 467 322 292 221v404l175-101z\" fill=\"#fff7f7\" stroke=\"#fff7f7\" stroke-width=\"42.33\" stroke-linejoin=\"round\" class=\"fill-fff7f7 stroke-fff7f7\"></path></svg><span>Смотреть</span>");
                    $(".view--trailer", Lampa.Activity.active().activity.render()).empty().append("<svg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"><g><path d=\"m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z\" fill=\"#191919\"></path><path d=\"m130.77 245.35h-4.49c-24.1 0-46.88-.35-64.17-.88-32.45-1-33.59-2.18-36.09-4.75s-4.54-4.72-4.42-71.52c0-16.69.25-32.56.61-44.68.69-23 1.49-24 3.26-26.29 2.61-3.34 6.09-3.48 14.52-3.83 5.12-.21 12.4-.4 21.63-.55 17.1-.28 40-.44 64.59-.44s47.61.16 64.93.44c32 .52 32.85 1.08 35.18 2.56 4 2.53 4.44 6.86 4.95 14.94 1 16.3 1.11 49.25.87 72.51-.56 53.77-1.68 54.7-5 57.45-2.44 2-4.06 3.36-36.37 4.32-16.06.46-37.23.72-60 .72zm-92.05-18c26.43 2.62 150.17 2.66 176.21.07 1.41-20.23 2-97 .31-118-27.17-1.42-148.84-1.42-176.47 0-1.58 21.46-1.62 98-.05 117.93z\" fill=\"#191919\"></path></g><g><path d=\"m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z\" fill=\"#e83a2a\"></path></g><path d=\"m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z\" fill=\"#191919\"></path><path d=\"m120.37 132.4c-28.37 0-57.78-.1-75.37-.4-4.73-.07-8.4-.15-10.92-.23-4.74-.16-8.17-.27-10.53-4-1.15-1.83-1.85-2.94-1.65-18 .08-6.37.37-14.77 1.29-18.61a9.26 9.26 0 0 1 4.13-6.05c2.23-1.34 3.46-2.08 34.93-2.73 17-.35 39.77-.57 64.21-.62 24.07 0 46.95.08 64.39.36 31.12.49 32.73 1.19 34.58 2a8.75 8.75 0 0 1 4.92 5.88c.32 1.1 1.31 4.43 1.39 19.28.08 15.72-.65 16.83-1.88 18.66-2.42 3.61-5.14 3.68-12.43 3.86-3.69.09-9 .18-15.88.25-12.8.14-30.33.24-50.71.3-9.57.04-19.94.05-30.47.05zm-82.52-16.48c29.32.63 148.34.59 177.85-.05.09-5.19 0-12.37-.26-17.08-27.44-1.5-150.44-1.22-177.2.41-.3 4.63-.43 11.64-.39 16.72z\" fill=\"#191919\"></path><path d=\"m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z\" fill=\"#fff\"></path><path d=\"m28.25 125.61s38.89-36.44 38.35-37.61c-.79-1.66-38-1.52-38.84-.43s-6.56 40.6.49 38.04z\" fill=\"#191919\"></path><path d=\"m221.34 51.57c.57-1.2-3.72-29.95-5.73-30.48-5.92-1.58-184.88 24.52-189.04 27.91-1.57 1.32 2.6 30.29 3.56 31.4s190.65-27.63 191.21-28.83z\" fill=\"#191919\"></path><path d=\"m30.56 88.4a7.85 7.85 0 0 1 -6.51-2.79c-1.4-1.61-2.25-2.61-4.28-17.56-.86-6.31-1.81-14.67-1.47-18.6a9.26 9.26 0 0 1 3.19-6.6c2-1.66 3.13-2.57 34.23-7.75 16.74-2.79 39.31-6.28 63.55-9.84 23.84-3.5 46.52-6.66 63.87-8.9 30.9-4 32.58-3.53 34.53-3a8.81 8.81 0 0 1 5.78 5.13c1.29 2.78 2.71 8.93 4.22 18.28 2.42 15 1.85 16.23.9 18.23-1.86 3.92-4.4 4.37-11.93 5.69-3.76.66-9.21 1.57-16.2 2.7-13.08 2.11-30.91 4.9-51.56 8.06-36.08 5.55-82.61 12.45-105.23 15.48-4 .54-7.1.93-9.23 1.17a35 35 0 0 1 -3.86.3zm3.83-33.23c.38 4.63 1.29 11.55 2.08 16.56 29.15-3.73 147.12-21.54 176.29-26.59-.68-4.9-1.79-11.49-2.74-15.85-27.27 2.43-149.27 20.41-175.63 25.88z\" fill=\"#191919\"></path><path d=\"m221.34 51.57c.57-1.2-3.72-29.95-5.73-30.48-5.92-1.58-184.88 24.52-189.04 27.91-1.57 1.32 2.6 30.29 3.56 31.4s190.65-27.63 191.21-28.83z\" fill=\"#fff\"></path><path d=\"m26.57 49s40.36 28.35 40 29.57c-.53 1.76-37.35 7.09-38.35 6.13s-9.01-37.16-1.65-35.7z\" fill=\"#191919\"></path><path d=\"m64.63 38.94c-.18 1 43.79 34.37 46 34l37.83-5.62c1.92-.29-44.9-35.19-47.14-34.86s-36.51 5.47-36.69 6.48z\" fill=\"#191919\"></path><path d=\"m142.53 27.36c-.18 1 43.79 34.37 46 34l37.83-5.62c1.92-.29-44.9-35.19-47.14-34.86s-36.51 5.48-36.69 6.48z\" fill=\"#191919\"></path><path d=\"m70.55 125.77c-.32-1 38.25-40.43 40.51-40.43h38.25c1.94 0-39.22 41.4-41.49 41.4s-36.95 0-37.27-.97z\" fill=\"#191919\"></path><path d=\"m149.31 125.77c-.32-1 38.25-40.43 40.51-40.43s34.36.65 34.36 2.59c0 .65-35.33 38.82-37.6 38.82s-36.95-.01-37.27-.98z\" fill=\"#191919\"></path><g><path d=\"m129.27 217.89c-15.12 0-30.17-.12-41.29-.32-20.22-.37-20.88-.8-22.06-1.57-1.94-1.25-2.44-3.15-2.83-10.66-.34-6.72-.44-17.33-.24-27 .37-18.14 1.21-18.82 2.74-20 1.37-1.1 1.48-1.19 21-1.39 10.56-.11 24.73-.17 39.89-.17 58.31 0 59.89.63 60.73 1 2.82 1.13 3.22 3.93 3.58 11.09.33 6.65.4 17.33.17 27.21-.11 4.76-.28 8.87-.49 11.87-.33 4.81-.6 7.17-2.91 8.37-1.05.43-3.25 1.57-58.29 1.57z\" fill=\"#fff\"></path><path d=\"m126.48 160.7c29 0 58.11.23 59.25.68 2.1.84 1.54 50.47 0 51.27s-28.7 1.25-56.45 1.25c-29.58 0-59.95-.44-61.19-1.25-1.93-1.25-1.65-49.94 0-51.27.57-.45 29.41-.68 58.39-.68m0-8c-15.18 0-29.36.06-39.94.17-5.71.06-10.21.13-13.38.22-5.82.15-7.78.2-10.09 2.06-3.18 2.56-3.44 6.28-3.76 11-.21 3.08-.37 7.26-.47 12.11-.2 9.8-.1 20.53.25 27.33.33 6.48.57 11.15 4.65 13.79 2.21 1.43 2.8 1.81 24.17 2.21 11.14.21 26.22.32 41.37.32 14.62 0 28.17-.11 38.17-.3 19.15-.38 20.09-.87 22-1.84 4.4-2.29 4.72-6.83 5.05-11.64.21-3.06.38-7.22.5-12 .23-10 .16-20.75-.18-27.5-.13-2.55-.29-4.53-.49-6-.25-1.83-.9-6.7-5.6-8.57-1.69-.67-2.2-.88-22.07-1.08-10.71-.11-25-.17-40.15-.17z\" fill=\"#191919\"></path></g><path d=\"m83.5 173.88c-5.25 0-5.5 7.75-.5 8.13s79.38.38 82.88 0 5.25-7.5-.37-7.87-75.51-.26-82.01-.26z\" fill=\"#191919\"></path><path d=\"m83.5 190.38c-5.25 0-5.5 7.75-.5 8.13s43.38.38 46.88 0 5.25-7.5-.37-7.87-39.51-.26-46.01-.26z\" fill=\"#191919\"></path></svg><span>Трейлеры</span>");
                    $(".view--online", Lampa.Activity.active().activity.render()).empty().append("<svg viewBox=\"0 0 847 847\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><circle cx=\"423\" cy=\"423\" r=\"398\" fill=\"#3498db\" class=\"fill-1fc255\"></circle><path d=\"M642 423 467 322 292 221v404l175-101z\" fill=\"#fff7f7\" stroke=\"#fff7f7\" stroke-width=\"42.33\" stroke-linejoin=\"round\" class=\"fill-fff7f7 stroke-fff7f7\"></path></svg><span>Смотреть</span>");
                    $(".view--streamv1", Lampa.Activity.active().activity.render()).empty().append("<svg viewBox=\"0 0 847 847\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><circle cx=\"423\" cy=\"423\" r=\"398\" fill=\"#3498db\" class=\"fill-1fc255\"></circle><path d=\"M642 423 467 322 292 221v404l175-101z\" fill=\"#fff7f7\" stroke=\"#fff7f7\" stroke-width=\"42.33\" stroke-linejoin=\"round\" class=\"fill-fff7f7 stroke-fff7f7\"></path></svg><span>Смотреть</span>");
                    $(".view--bazon", Lampa.Activity.active().activity.render()).empty().append("<svg enable-background=\"new 0 0 64 64\" height=\"64px\" id=\"Layer_1\" version=\"1.1\" viewBox=\"0 0 64 64\" width=\"64px\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><circle cx=\"32\" cy=\"32\" fill=\"#77B3D4\" r=\"32\"></circle><circle cx=\"32\" cy=\"33.917\" fill=\"#231F20\" opacity=\"0.2\" r=\"13.083\"></circle><circle cx=\"32\" cy=\"33.083\" fill=\"#4F5D73\" r=\"13.083\"></circle><circle cx=\"32\" cy=\"32\" fill=\"#4F5D73\" r=\"13.083\"></circle><g opacity=\"0.2\"><path d=\"M32,12c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,12,32,12z M14.5,30.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.037-2.463,5.5-5.5,5.5C16.962,36,14.5,33.537,14.5,30.5z M24.469,49.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,47.037,27.506,49.5,24.469,49.5z    M26.5,21.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,27,26.5,24.538,26.5,21.5z    M39.469,49.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,47.037,42.506,49.5,39.469,49.5z M44.042,36c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,33.537,47.079,36,44.042,36z\" fill=\"#231F20\"></path><g><path d=\"M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,10,32,10z M14.5,28.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,34,14.5,31.538,14.5,28.5z M24.469,47.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,45.037,27.506,47.5,24.469,47.5z    M26.5,19.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,25,26.5,22.538,26.5,19.5z    M39.469,47.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,45.037,42.506,47.5,39.469,47.5z M44.042,34c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,31.538,47.079,34,44.042,34z\" fill=\"#FFFFFF\"></path></g></svg><span>Bazon</span>");
                    $(".view--filmixpva", Lampa.Activity.active().activity.render()).empty().append("<svg enable-background=\"new 0 0 64 64\" height=\"64px\" id=\"Layer_1\" version=\"1.1\" viewBox=\"0 0 64 64\" width=\"64px\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><circle cx=\"32\" cy=\"32\" fill=\"#77B3D4\" r=\"32\"></circle><circle cx=\"32\" cy=\"33.917\" fill=\"#231F20\" opacity=\"0.2\" r=\"13.083\"></circle><circle cx=\"32\" cy=\"33.083\" fill=\"#4F5D73\" r=\"13.083\"></circle><circle cx=\"32\" cy=\"32\" fill=\"#4F5D73\" r=\"13.083\"></circle><g opacity=\"0.2\"><path d=\"M32,12c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,12,32,12z M14.5,30.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,36,14.5,33.537,14.5,30.5z M24.469,49.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,47.037,27.506,49.5,24.469,49.5z    M26.5,21.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,27,26.5,24.538,26.5,21.5z    M39.469,49.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,47.037,42.506,49.5,39.469,49.5z M44.042,36c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,33.537,47.079,36,44.042,36z\" fill=\"#231F20\"></path><g><path d=\"M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,10,32,10z M14.5,28.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,34,14.5,31.538,14.5,28.5z M24.469,47.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,45.037,27.506,47.5,24.469,47.5z    M26.5,19.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,25,26.5,22.538,26.5,19.5z    M39.469,47.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C44.969,45.037,42.506,47.5,39.469,47.5z M44.042,34c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5C49.542,31.538,47.079,34,44.042,34z\" fill=\"#FFFFFF\"></path></g></svg><span>Filmix</span>");
                //}
            }
        } /* End updateT */
            
/* Скрываем ленту трейлеров на Главной */
        Lampa.SettingsApi.addParam({
                component: 'Multi_Menu_Component',
                param: {
                    name: 'NoTrailerMainPage',
                    type: 'trigger',
                    default: false
                },
                    field: {
                        name: 'Скрыть Трейлеры-новинки',
                        description: 'Скрывает баннерную ленту на главной странице'
                    },
                    onChange: function (value) {
                            var intervalID;
                            intervalID = setInterval(function() {
                                    if (Lampa.Storage.field('NoTrailerMainPage') == true) {
                                            if (Lampa.Activity.active().component == 'main' && Lampa.Activity.active().source == 'cub') {
                                                $('#NoTrailerMainPage').remove();
                                                var banner = 'div.activity__body > div > div > div > div > div:nth-child(1)';
                                                Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0%!important;display: none;}</style></div>');
                                                $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
                                            } 
                                            if (Lampa.Activity.active().component !== 'main') {
                                                $('#NoTrailerMainPage').remove();
                                            }
                                            if (Lampa.Activity.active().component == 'category' && Lampa.Activity.active().url == 'movie' && Lampa.Activity.active().source == 'cub') {
                                                $('#NoTrailerMainPage').remove();
                                                var banner = 'div.activity__body > div > div > div > div > div:nth-child(2)';
                                                Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0%!important;display: none;}</style></div>');
                                                $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
                                            }
                                    }
                                    if (Lampa.Storage.field('NoTrailerMainPage') == false) {
                                        $('#NoTrailerMainPage').remove();
                                        clearInterval(intervalID);
                                    }
                            }, 500);
                    }
        });    
        
/* Скрываем часы на заставке */
        Lampa.SettingsApi.addParam({
                component: 'Multi_Menu_Component',
                param: {
                    name: 'NoTimeNoDate',
                    type: 'trigger',
                    default: false
                },
                    field: {
                        name: 'Скрыть часы на заставке CUB',
                        description: 'Если переживаете за выгорание экрана OLED'
                    },
                    onChange: function (value) {
                        if (Lampa.Storage.field('NoTimeNoDate') == true) {
                            $('#notimedatescreen').remove();
                            Lampa.Template.add('notimedatescreen', '<div id="notimedatescreen"><style>.screensaver__datetime{opacity: 0%!important;display: none;}</style></div>');
                            $('body').append(Lampa.Template.get('notimedatescreen', {}, true));
                        }                        
                        if (Lampa.Storage.field('NoTimeNoDate') == false) {
                            $('#notimedatescreen').remove();
                        }
                    }
        });
        
/* Скрываем панель навигации */
        Lampa.SettingsApi.addParam({
                component: 'Multi_Menu_Component',
                param: {
                    name: 'NavyBar',
                    type: 'trigger',
                    default: false
                },
                    field: {
                        name: 'Скрыть панель навигации',
                        description: 'Если неправильно определился тип устройства'
                    },
                    onChange: function (value) {
                        if (Lampa.Storage.field('NavyBar') == true) {
                            Lampa.Template.add('no_bar', '<div id="no_bar"><style>.navigation-bar{display: none!important;}</style></div>');
                            $('body').append(Lampa.Template.get('no_bar', {}, true));
                            var searchReturnButton = '<div id="searchReturnButton" class="head__action head__settings selector searchReturnButton">\n' +
                                    '        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                                    '            <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>\n' +
                                    '            <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>\n' +
                                    '        </svg>\n' +
                                    '    </div>\n';
                            $('.open--search').hide();
                            $('#searchReturnButton').remove();
                            $('#app > div.head > div > div.head__actions').append(searchReturnButton);
                            $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() {Lampa.Search.open();});
                            $('.menu__item').on('click', function () {
                                this.removeClass('focus'); this.addClass('focus');
                            });
                        }                        
                        if (Lampa.Storage.field('NavyBar') == false) {
                            $('.open--search').show();
                            $('#no_bar').remove();
                            $('#searchReturnButton').remove();
                        }
                    }
        });
//
// Отключение неиспользуемой раскладки клавиатуры
        Lampa.SettingsApi.addParam({
                component: 'Multi_Menu_Component', 
                param: {
                    name: 'KeyboardSwitchOff',
                    type: 'select',
                    values: {
                        SwitchOff_None:     'Не отключать',
                        SwitchOff_UA:       'Українська',
                        SwitchOff_RU:       'Русский',
                        SwitchOff_EN:       'English',
                    },
                        default: 'SwitchOff_None'
                    },
                    field: {
                        name: 'Неиспользуемая клавиатура',
                        description: 'Выберите язык для отключения'
                    },
                    onChange: function (value) {
                        if (Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_UA') {
                            Lampa.Storage.set('keyboard_default_lang', 'default');
                            var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
                            if(elementUA.length > 0) elementUA.parent('div').hide();
                        }
                        if (Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_RU') {
                            Lampa.Storage.set('keyboard_default_lang', 'uk');
                            var elementRU = $('.selectbox-item.selector > div:contains("Русский")');
                            if(elementRU.length > 0) elementRU.parent('div').hide();
                        }
                        if ((Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_EN') && (Lampa.Storage.field('language') == 'uk')) {
                            Lampa.Storage.set('keyboard_default_lang', 'uk');
                            var elementEN = $('.selectbox-item.selector > div:contains("English")');
                            if(elementEN.length > 0) elementEN.parent('div').hide();
                        }
                        if ((Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_EN') && (Lampa.Storage.field('language') == 'ru')) {
                            Lampa.Storage.set('keyboard_default_lang', 'default');
                            var elementEN = $('.selectbox-item.selector > div:contains("English")');
                            if(elementEN.length > 0) elementEN.parent('div').hide();
                        }
                    }
        });        
/* Торренты */
        Lampa.SettingsApi.addComponent({
            component: 'Multi_Menu_Component',
            name: 'Приятные мелочи',
            icon: '<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M527.579429 186.660571a119.954286 119.954286 0 1 1-67.949715 0V47.542857a33.938286 33.938286 0 0 1 67.949715 0v139.190857z m281.380571 604.598858a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 1 1-67.949714 0v-139.190857z m-698.441143 0a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 0 1-67.949714 0v-139.190857zM144.457143 13.531429c18.797714 0 34.011429 15.213714 34.011428 33.938285v410.038857a33.938286 33.938286 0 0 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 33.938286-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m698.514286-722.139428c18.724571 0 33.938286 15.213714 33.938285 33.938285v410.038857a33.938286 33.938286 0 1 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 34.011429-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m-349.403429 228.717714a33.938286 33.938286 0 0 1-33.938286-33.938285V520.411429a33.938286 33.938286 0 0 1 67.949715 0v410.038857a33.938286 33.938286 0 0 1-34.011429 33.938285z m0-722.139428a60.269714 60.269714 0 1 0 0 120.539428 60.269714 60.269714 0 0 0 0-120.539428z" fill="#ffffff"></path></g></svg>'
        });
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'TORRENT_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Контрастная рамка на торрентах',
                description: 'Улучшает восприятие при выборе торрента'
            },
            onChange: function(value) {
                var green1 = '<div id="green_style"><style>.torrent-item.selector.focus{box-shadow: 0 0 0 0.5em #1aff00!important;}</style></div>';
                var green2 = '<div id="greenn_style"><style>.torrent-serial.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
                var green3 = '<div id="greennn_style"><style>.torrent-file.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
                var green4 = '<div id="greennnn_style"><style>.scroll__body{margin: 5px!important;}</style></div>';
                if(Lampa.Storage.field('TORRENT_fix') == true) {
                    $('body').append(green1);
                    $('body').append(green2);
                    $('body').append(green3);
                    $('body').append(green4);
                }
                if(Lampa.Storage.field('TORRENT_fix') == false) {
                    $('#green_style').remove();
                    $('#greenn_style').remove();
                    $('#greennn_style').remove();
                    $('#greennnn_style').remove();
                }
            }
        });
/*End Торренты */

/* Anime */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'ANIME_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Удалить "Аниме" в главном меню',
                description: ''
            },
            onChange: function(value) {
                 if(Lampa.Storage.field('ANIME_fix') == true) $("[data-action=anime]").eq(0).hide();
                 if(Lampa.Storage.field('ANIME_fix') == false) $("[data-action=anime]").eq(0).show();
            }
        });
/*End Anime */

/* SISI */ 
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'SISI_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Удалить "Клубника" в главном меню',
                description: ''
            },
            onChange: function(value) {
                if(Lampa.Storage.field('SISI_fix') == false) {
                    $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div:nth-child(1) > ul > li:contains("Клубничка")').show();
                }
                if(Lampa.Storage.field('SISI_fix') == true) {
                    $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div:nth-child(1) > ul > li:contains("Клубничка")').hide();
                }
            }
        });

/* СТИЛИЗАЦИЯ кнопок просмотра с учётом MODS's */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'BUTTONS_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизовать кнопки просмотра',
                description: 'Делает кнопки цветными'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('BUTTONS_fix') == true) {
                    updateT();
                }
                Lampa.Settings.update();
            },
            onRender: function(item) {
                if(Lampa.Storage.field('BUTTONS_fix') == true) {
                    updateT();
                }
            }
        });
/* End СТИЛИЗАЦИЯ кнопок */

        if(Lampa.Storage.field('ANIME_fix') == true) $("[data-action=anime]").eq(0).hide();
        if(Lampa.Storage.field('SISI_fix') == true) $("[data-action=sisi]").eq(0).show();
        var d = 'dn'; 

/* Кнопка Перезагрузки и Консоли*/
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'Reloadbutton',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Добавить кнопку перезагрузки',
                description: 'Иконка рядом с часами'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('Reloadbutton') == false) {
                    $('#RELOAD').addClass('hide');
                }
                if (Lampa.Storage.field('Reloadbutton') == true) {
                    $('#RELOAD').removeClass('hide');
                }
                if (Lampa.Storage.field('Reloadbutton') == false) {
                    $('#CONSOLE').addClass('hide');
                }
                if (Lampa.Storage.field('Reloadbutton') == true) {
                    $('#CONSOLE').removeClass('hide');
                }
                if (Lampa.Storage.field('Reloadbutton') == false) {
                    $('#ExitButton').addClass('hide');
                }                
                if (Lampa.Storage.field('Reloadbutton') == true) {
                    $('#ExitButton').removeClass('hide');
                }
            }
        });

        var my_reload = '<div id="RELOAD" class="head__action selector reload-screen hide"><svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></g></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_reload);
        
        $('#RELOAD').on('hover:enter hover:click hover:touch', function() {
            location.reload();
        });
        if(Lampa.Storage.field('Reloadbutton') == false) {
                $('#RELOAD').addClass('hide');
        }
        if(Lampa.Storage.field('Reloadbutton') == true) {
                $('#RELOAD').removeClass('hide');
        }
    
    /* Кнопка Консоли */
        var my_console = '<div id="CONSOLE" class="head__action selector console-screen hide"><svg width="64px" height="64px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" stroke-width="20.48"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M877.685565 727.913127l-0.584863-0.365539a32.898541 32.898541 0 0 1-8.041866-46.423497 411.816631 411.816631 0 1 0-141.829267 145.777092c14.621574-8.992268 33.62962-5.117551 43.645398 8.772944l0.146216 0.073108a30.412874 30.412874 0 0 1-7.968758 43.206751l-6.141061 4.020933a475.201154 475.201154 0 1 1 163.615412-164.419599 29.974227 29.974227 0 0 1-42.841211 9.357807z m-537.342843-398.584106c7.164571-7.091463 24.71046-9.650239 33.26408 0 10.600641 11.185504 7.164571 29.462472 0 37.138798l-110.612207 107.468569L370.901811 576.14119c7.164571 7.091463 8.114974 27.342343 0 35.384209-9.796455 9.723347-29.828011 8.188081-36.480827 1.535265L208.309909 487.388236a18.423183 18.423183 0 0 1 0-25.953294l132.032813-132.032813z m343.314556 0l132.032813 132.032813a18.423183 18.423183 0 0 1 0 25.953294L689.652124 613.133772c-6.652816 6.579708-25.587754 10.746857-36.553935 0-10.30821-10.235102-7.091463-31.290168 0-38.381632l108.345863-100.669537-111.855041-108.638294c-7.164571-7.676326-9.504023-26.611265 0-36.04218 9.284699-9.138484 26.903696-7.091463 34.068267 0z m-135.54199-26.318833c3.582286-9.504023 21.347498-15.498868 32.679217-11.258612 10.819965 4.020933 17.180349 19.008046 14.256035 28.512069l-119.896906 329.716493c-3.509178 9.504023-20.616419 13.305632-30.193551 9.723347-10.161994-3.509178-21.201282-17.545889-17.545888-26.976804l120.627985-329.716493z" fill="currentColor"></path></g></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_console);
        
        $('#CONSOLE').on('hover:enter hover:click hover:touch', function() {
            Lampa.Controller.toggle('console');
        });
        if(Lampa.Storage.field('Reloadbutton') == false) {
                $('#CONSOLE').addClass('hide');
        }
        if(Lampa.Storage.field('Reloadbutton') == true) {
                $('#CONSOLE').removeClass('hide');
        }       
    /* Кнопка Выхода в верхнем баре */
        var my_top_exit = '<div id="my_top_exit" class="head__action selector exit-screen hide"><svg fill="#ffffff" width="256px" height="256px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z" fill="currentColor"></path></g></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_top_exit);

        $('#my_top_exit').on('hover:enter hover:click hover:touch', function() {
                Lampa.Activity.out();
                if(Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
                if(Lampa.Platform.is('webos')) window.close();
                if(Lampa.Platform.is('android')) Lampa.Android.exit();
                if(Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
        });
        if(Lampa.Storage.field('Reloadbutton') == false) {
                $('#my_top_exit').addClass('hide');
        }
        if(Lampa.Storage.field('Reloadbutton') == true) {
                $('#my_top_exit').removeClass('hide');
        }
        
/* Стиль в плеере - YouTube */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'YouTubeStyle',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизация встроенного плеера',
                description: 'В стиле YouTube'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('YouTubeStyle') == false) {
                    $('#YOUTUBESTYLE').remove();
                    $('#YOUTUBESTYLE-POSITION').remove();
                    $('#YOUTUBESTYLE-POSITION-focus').remove();
                }
                if(Lampa.Storage.field('YouTubeStyle') == true) {
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE', {}, true));
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE-POSITION', {}, true));
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE-POSITION-focus', {}, true));
                }
            },
            onRender: function(item) {
                Lampa.Template.add('YOUTUBESTYLE', '<div id="YOUTUBESTYLE" class="hide"><style>div.player-panel__position{background-color: #f00!important;}</style></div>');
                Lampa.Template.add('YOUTUBESTYLE-POSITION', '<div id="YOUTUBESTYLE-POSITION" class="hide"><style>div.player-panel__position>div:after{background-color: #f00!important; box-shadow: 0 0 3px 0.2em!important;}</style></div>');
                Lampa.Template.add('YOUTUBESTYLE-POSITION-focus', '<div id="YOUTUBESTYLE-POSITION-focus" class="hide"><style>body > div.player > div.player-panel.panel--paused > div > div.player-panel__timeline.selector.focus > div.player-panel__position > div:after{box-shadow: 0 0 3px 0.2em!important;}</style></div>');
            }
        });
/* End Стиль в плеере - YouTube */

/* Часы в плеере - МЕНЮ */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'ClockInPlayer',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Часы во встроенном плеере',
                description: 'Через 5 секунд после включения плеера'
            },
            onChange: function(value) {
            }
        });
    
        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
        var e = 2; 
        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        if (Lampa.Storage.field('ClockInPlayerPosition') == 'Center_Up'){    
            $('#clockstyle').remove();
            Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle" class="head__time-now time--clock hide"><style>#MyClockDiv{position: absolute!important; display: flex !important; z-index: 51!important; top: 2%;left: 49%;transform: translate(-50%, -50%);}</style></div>');
            $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        }
    
        function updateClock() {
            var MyTime = document.querySelector("[class='head__time-now time--clock']").innerHTML;
            $("#MyClockDiv").remove();
            $("#MyLogoDiv").remove();
            var MyDiv = '<div id="MyClockDiv" class="head__time-now time--clock hide"></div>';
            var MyLogo = '<div id="MyLogoDiv" class="hide" style="z-index: 51!important; position: fixed!important; visibility: hidden;"><img src="./tricks1_files/FreeTv_Egypt_Logo.png" width="100" height="100"></div>';
            $('.player').append(MyDiv);
            if(Lampa.Storage.field('ClockInPlayer') == true) {
                if (($('body > div.player > div.player-panel').hasClass("panel--visible") == false) || ($('body > div.player > div.player-info').hasClass("info--visible") == false)) {
                    $('#MyClockDiv').removeClass('hide');
                }
            }
            $("#MyClockDiv").text(MyTime);
        }
    
        Lampa.Template.add('clockcenter', '<style>.hide{visibility: hidden!important;}</style>');
        $('body').append(Lampa.Template.get('clockcenter', {}, true));
        setInterval(updateClock, 200);
    
/* Положение часов в плеере */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component', 
            param: {
                name: 'ClockInPlayerPosition',
                type: 'select',
                values: {
                    Left_Up:   'Слева сверху ',
                    Left_Down: 'Слева снизу',
                    Right_Up:  'Справа сверху',
                    Right_Down:'Справа снизу',
                    Center_Up: 'В центре сверху',
                },
                    default: 'Left_Up'
                },
                field: {
                    name: 'Положение часов на экране',
                    description: 'Выберите угол экрана'
                },
                onChange: function (value) {
                    document.querySelector("#clockstyle").remove();
                    if (Lampa.Storage.field('ClockInPlayerPosition') == 'Left_Up')       Lampa.Storage.set('Clock_coordinates', 'bottom: 90%!important; right: 90%!important');
                    if (Lampa.Storage.field('ClockInPlayerPosition') == 'Left_Down')     Lampa.Storage.set('Clock_coordinates', 'bottom: 10%!important; right: 90%!important');
                    if (Lampa.Storage.field('ClockInPlayerPosition') == 'Right_Up')      Lampa.Storage.set('Clock_coordinates', 'bottom: 90%!important; right: 12%!important');
                    if (Lampa.Storage.field('ClockInPlayerPosition') == 'Right_Down')    Lampa.Storage.set('Clock_coordinates', 'bottom: 10%!important; right: 5%!important');
                    
                    Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
                    $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
                    
                    if (Lampa.Storage.field('ClockInPlayerPosition') == 'Center_Up'){    
                        $('#clockstyle').remove();
                        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle" class="head__time-now time--clock hide"><style>#MyClockDiv{position: absolute!important; display: flex !important; z-index: 51!important; top: 2%;left: 49%;transform: translate(-50%, -50%);}</style></div>');
                        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
                    }
                }
        });        
/*End Положение часов в плеере */

/* Кнопка YouTube */
        var tubemenu = $('<li id="YouTubeButton" class="menu__item selector"><div class="menu__ico">' + TubeSVG + '</div><div class="menu__text">YouTube</div></li>');
$('.menu .menu__list').eq(0).append(tubemenu);
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'YouTube',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Раздел YouTube',
                description: 'Добавляет YouTube в главном меню'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('YouTube') == false) {
                    $('#YouTubeButton').addClass('hide');
                }
                if(Lampa.Storage.field('YouTube') == true) {
                    $('#YouTubeButton').removeClass('hide');
                }
            }
        });
/* End Кнопка YouTube */

/* Кнопка RuTube */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'RuTube',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Раздел RuTube',
                description: 'Добавляет RuTube в главном меню'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('RuTube') == false) {
                    $('#RuTubeButton').addClass('hide');
                }
                if(Lampa.Storage.field('RuTube') == true) {
                    $('#RuTubeButton').removeClass('hide');
                }
            }
        });
/* End Кнопка RuTube */

/* Кнопка Twitch */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'Twitch',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Раздел Twitch',
                description: 'Добавляет Twitch в главном меню'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('Twitch') == false) {
                    $('#TwitchButton').addClass('hide');
                }
                if(Lampa.Storage.field('Twitch') == true) {
                    $('#TwitchButton').removeClass('hide');
                }
            }
        });
/* End Кнопка Twitch */

/* Активация торрентов при старте */
            var green1 = '<div id="green_style"><style>.torrent-item.selector.focus{box-shadow: 0 0 0 0.5em #1aff00!important;}</style></div>';
            var green2 = '<div id="greenn_style"><style>.torrent-serial.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
            var green3 = '<div id="greennn_style"><style>.torrent-file.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
            var green4 = '<div id="greennnn_style"><style>.scroll__body{margin: 5px!important;}</style></div>';
            if(Lampa.Storage.field('TORRENT_fix') == true) {
                $('body').append(green1);
                $('body').append(green2);
                $('body').append(green3);
                $('body').append(green4);
            }

            var timerId;
            timerId = setInterval(updateT, 1000);
    
/* Отключение языков при старте */
        setInterval(function() {
            var elementCHlang = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded')
            if (elementCHlang.length > 0){
                    if (Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_UA') {
                        Lampa.Storage.set('keyboard_default_lang', 'default');
                        var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
                        if(elementUA.length > 0) elementUA.parent('div').hide();
                    }
                    if (Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_RU') {
                        Lampa.Storage.set('keyboard_default_lang', 'uk');
                        var elementRU = $('.selectbox-item.selector > div:contains("Русский")');
                        if(elementRU.length > 0) elementRU.parent('div').hide();
                    }
                    if ((Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_EN')&&(Lampa.Storage.field('language') == 'uk')) {
                        Lampa.Storage.set('keyboard_default_lang', 'uk');
                        var elementEN = $('.selectbox-item.selector > div:contains("English")');
                        if(elementEN.length > 0) elementEN.parent('div').hide();
                    }
                    if ((Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_EN')&&(Lampa.Storage.field('language') == 'ru')) {
                        Lampa.Storage.set('keyboard_default_lang', 'default');
                        var elementEN = $('.selectbox-item.selector > div:contains("English")');
                        if(elementEN.length > 0) elementEN.parent('div').hide();
                    }
                }
            }, 0);

/* Удаление SISI при старте */
if(Lampa.Storage.field('SISI_fix') == true) {
    setTimeout(function() {
        $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div:nth-child(1) > ul > li:contains("Клубничка")').hide();
    }, 3000);
}

/* Активация кнопки возврата при старте */
    $('body').append('<div id="backit" class="elem-mobile-back hide"><svg width="131" height="262" viewBox="0 0 131 262" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M131 0C58.6507 0 0 58.6507 0 131C0 203.349 58.6507 262 131 262V0Z" fill="white"></path><path d="M50.4953 125.318C50.9443 124.878 51.4313 124.506 51.9437 124.183L86.2229 90.4663C89.5671 87.1784 94.9926 87.1769 98.3384 90.4679C101.684 93.7573 101.684 99.0926 98.3384 102.385L68.8168 131.424L98.4907 160.614C101.836 163.904 101.836 169.237 98.4907 172.531C96.817 174.179 94.623 175 92.4338 175C90.2445 175 88.0489 174.179 86.3768 172.531L51.9437 138.658C51.4313 138.335 50.9411 137.964 50.4953 137.524C48.7852 135.842 47.9602 133.626 48.0015 131.421C47.9602 129.216 48.7852 127.002 50.4953 125.318Z" fill="black"></path></svg></div>');
    Lampa.Template.add('butt_style', '<style>.elem-mobile-back{right: 0;position: fixed;z-index:49;top: 50%;width: 3em;height: 6em;background-repeat: no-repeat;background-position: 100% 50%;background-size: contain;margin-top: -3em;font-size: .72em;display: block}</style>');
    $('body').append(Lampa.Template.get('butt_style', {}, true));
    $(".elem-mobile-back").on("click", function () {
        Lampa.Activity.back();
    });
    if (Lampa.Storage.field('BackButton') == true) {
        $('#backit').removeClass('hide');
    }
    /* Добавляем кнопку выхода из плеера */
    setInterval(function() {
        var exitSVG = '<div id="ExitButton" class="button selector" data-controller="player_panel"><svg viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="#000000" stroke-width="2"></path> <path d="M9 9L15 15M15 9L9 15" stroke="#000000" stroke-width="2" stroke-linecap="round"></path> </g></svg></div>';
        $('#ExitButton').remove();
        if (Lampa.Storage.field('BackButton') == true){
            $('.player-panel__right').append(exitSVG);
            $('#ExitButton').css("padding","0.05em");
            $('#ExitButton').on('hover:enter hover:click hover:touch', function() {
                $('#ExitButton').remove();
                $('.player').remove();
            });
        }
    }, 3000);
/* End Активация кнопки возврата при старте */

    } // end of add (main function)

if(window.appready) add();
    else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                add();
            }
        });
    }
})();
