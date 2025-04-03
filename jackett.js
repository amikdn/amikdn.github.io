(function () {
  'use strict';

  // Устанавливаем тип парсера по умолчанию, если не задан
  const defaultParserType = "jackett";
  if (!Lampa.Storage.get("parser_torrent_type")) {
    Lampa.Storage.set("parser_torrent_type", defaultParserType);
  }
  Lampa.Platform.tv();

  // Конфигурация парсеров для проверки
  const parsersToCheck = [
    { title: "jacblack.ru:9117", url: "jacblack.ru:9117", apiKey: "" },
    { title: "jacred.xyz",         url: "jacred.xyz",         apiKey: "" },
    { title: "jacred.pro",         url: "jacred.pro",         apiKey: "" },
    { title: "jacred.viewbox.dev", url: "jacred.viewbox.dev", apiKey: "viewbox" },
    { title: "https://jr.maxvol.pro",     url: "jr.maxvol.pro",     apiKey: "" },
    { title: "altjacred.duckdns.org", url: "altjacred.duckdns.org", apiKey: "" }
  ];

  // Функция проверки одного парсера с использованием fetch и AbortController
  const checkParser = async (parser) => {
    const protocol = location.protocol === "https:" ? "https://" : "http://";
    const trimmedUrl = parser.url.trim();
    const apiUrl = `${protocol}${trimmedUrl}/api/v2.0/indexers/status:healthy/results?apikey=${parser.apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(apiUrl, { signal: controller.signal });
      const isViewbox = trimmedUrl.toLowerCase() === "jacred.viewbox.dev";
      // Парсер считается рабочим, если response.ok или (для jacred.viewbox.dev) статус 403 или 200
      parser.status = response.ok || (isViewbox && (response.status === 403 || response.status === 200));
    } catch (error) {
      parser.status = false;
    } finally {
      clearTimeout(timeoutId);
    }
    return parser;
  };

  // Проверяем все парсеры параллельно
  const checkAllParsers = () => Promise.all(parsersToCheck.map(parser => checkParser(parser)));

  // Асинхронное обновление кеша статусов парсеров
  const updateParserCache = async () => {
    const results = await checkAllParsers();
    Lampa.Storage.set("parser_statuses", results);
    console.log("Статусы парсеров обновлены:", results);
    return results;
  };

  // Функция обновления отображаемого выбранного парсера (заголовок)
  const updateParserField = (text) => {
    $("div[data-name='jackett_urltwo']").html(
      `<div class="settings-folder" tabindex="0" style="padding:0!important">
         <div style="width:1.3em;height:1.3em;padding-right:.1em"></div>
         <div style="font-size:1.2em; font-weight:bold;">
           <div style="padding:0.5em 0.5em; padding-top:0;">
             <div style="background:#d99821; padding:0.7em; border-radius:0.5em; border:4px solid #d99821;">
               <div style="line-height:0.3; color:black; text-align:center;">${text}</div>
             </div>
           </div>
         </div>
       </div>`
    );
  };

  // Асинхронная функция открытия меню выбора парсера
  const openParserSelectionMenu = async () => {
    await updateParserCache();

    const cachedParsers = Lampa.Storage.get("parser_statuses") || [];
    const defaultOption = { title: "Свой вариант", url: "", apiKey: "", status: null };
    const parsers = [defaultOption, ...cachedParsers];
    const currentSelected = Lampa.Storage.get("selected_parser");

    const buildItems = () =>
      parsers.map(parser => {
        let color = "#cccccc";
        if (parser.status === true) color = "#64e364";
        else if (parser.status === false) color = "#ff2121";
        const activeMark = parser.title === currentSelected
          ? '<span style="color: #4285f4; margin-right: 5px;">&#10004;</span>'
          : '';
        return {
          title: activeMark + `<span style="color: ${color} !important;">${parser.title}</span>`,
          parser
        };
      });

    Lampa.Select.show({
      title: "Меню смены парсера",
      items: buildItems(),
      onBack: () => Lampa.Controller.toggle("settings_component"),
      onSelect: (item) => {
        const selected = item.parser;
        if (selected.title === "Свой вариант") {
          Lampa.Storage.set("jackett_url", "");
          Lampa.Storage.set("jackett_key", "");
          Lampa.Storage.set("selected_parser", "Свой вариант");
        } else {
          Lampa.Storage.set("jackett_url", selected.url);
          Lampa.Storage.set("jackett_key", selected.apiKey);
          Lampa.Storage.set("selected_parser", selected.title);
          Lampa.Storage.set("parser_torrent_type", defaultParserType);
        }
        console.log("Выбран парсер:", selected);
        updateParserField(item.title);

        // Закрываем окно выбора парсера
        Lampa.Select.hide();
        
          Lampa.Settings.update();

        const toggleAction = selected.title !== "Свой вариант" ? "hide" : "show";
        $("div[data-name='jackett_url']")[toggleAction]();
        $("div[data-name='jackett_key']")[toggleAction]();
      }
    });
  };

  // Обновляем кеш статусов при запуске
  updateParserCache();

  // Добавляем параметр в настройки – кнопку "Выбрать парсер"
  Lampa.SettingsApi.addParam({
    component: "parser",
    param: {
      name: "jackett_urltwo",
      type: "select",
      values: {
        no_parser: "Свой вариант",
        jac_lampa32_ru: "jacblack.ru:9117",
        jacred_xyz: "jacred.xyz",
        jacred_my_to: "jacred.pro",
        jacred_viewbox_dev: "jacred.viewbox.dev",
        spawn_jacred: "https://jr.maxvol.pro",
        altjacred_duckdns_org: "altjacred.duckdns.org"
      },
      default: "jacred_my_to"
    },
    field: {
      name: `<div class="settings-folder" style="padding:0!important">
                <div style="width:1.3em;height:1.3em;padding-right:.1em"></div>
                <div style="font-size:1.0em">
                  <div style="padding:0.3em 0.3em; padding-top:0;">
                    <div style="background:#d99821; padding:0.5em; border-radius:0.4em; border:3px solid #d99821;">
                      <div style="line-height:0.3;">Выбрать парсер</div>
                    </div>
                  </div>
                </div>
              </div>`,
      description: "Нажмите для выбора парсера из списка"
    },
    onChange: () => Lampa.Settings.update(),
    onRender: (elem) => {
      setTimeout(() => {
        $("div[data-children='parser']").on("hover:enter", () => Lampa.Settings.update());
        if (Lampa.Storage.field("parser_use")) {
          elem.show();
          $(".settings-param__name", elem).css("color", "ffffff");
          $("div[data-name='jackett_urltwo']").insertAfter("div[data-name='parser_torrent_type']");
          elem.off("click hover:enter keydown").on("click hover:enter keydown", (e) => {
            if (
              e.type === "click" ||
              e.type === "hover:enter" ||
              (e.type === "keydown" && (e.key === "Enter" || e.keyCode === 13))
            ) {
              openParserSelectionMenu();
            }
          });
          const current = Lampa.Storage.get("selected_parser");
          if (current) updateParserField(current);
        } else {
          elem.hide();
        }
        const toggleAction = Lampa.Storage.get("selected_parser") !== "Свой вариант" ? "hide" : "show";
        $("div[data-name='jackett_url']")[toggleAction]();
        $("div[data-name='jackett_key']")[toggleAction]();
      }, 5);
    }
  });
})();
