(function() {
	'use strict';

	Lampa.Platform.tv();

	var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
	var urls = ['jacred.ru', 'jr.maxvol.pro', 'jac-red.ru', 'jacred.viewbox.dev', 'jacred.pro', 'jacblack.ru:9117'];
	var titles = ['Jacred RU', 'Jacred Maxvol Pro', 'Jacred RU', 'Viewbox', 'Jacred Pro', 'Jac Black'];

	function checkParser(index) {
		setTimeout(function() {
			var apiKey = '';
			if (urls[index] == 'jacblack.ru:9117') apiKey = '34DPECDY';
			
			var position = index + 2;
			var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + position + ') > div';
			
			if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
			
			var useProtocol = urls[index] == 'jr.maxvol.pro' ? 'https://' : protocol;
			var requestUrl = useProtocol + urls[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			var xhr = new XMLHttpRequest();
			xhr.timeout = 3000;
			xhr.open('GET', requestUrl, true);
			xhr.send();
			
			xhr.ontimeout = function() {
				if ($(selector).text() == titles[index]) {
					$(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
				}
			};
			
			xhr.onerror = function() {
				if ($(selector).text() == titles[index]) {
					$(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
				}
			};
			
			xhr.onload = function() {
				if (xhr.status == 200) {
					if ($(selector).text() == titles[index]) {
						$(selector).html('✔&nbsp;&nbsp;' + $(selector).text()).css('color', '#ffffff');
					}
				} else {
					if ($(selector).text() == titles[index]) {
						$(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
					}
				}
				if (xhr.status == 401) {
					if ($(selector).text() == titles[index]) {
						$(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
					}
				}
			};
		}, 1000);
	}

	function checkAllParsers() {
		for (var i = 0; i < urls.length; i++) {
			checkParser(i);
		}
	}

	Lampa.Listener.follow('app', function(e) {
		if (e.type == 'select') {
			setTimeout(function() {
				checkAllParsers();
			}, 10);
		}
	});

	function setParserConfig() {
		var selected = Lampa.Storage.get('jackett_urltwo');
		
		if (selected == 'no_parser') {
			Lampa.Storage.set('jackett_url', '');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'false');
			Lampa.Storage.set('parse_in_search', false);
			Lampa.Storage.set('parse_lang', 'lg');
		}
		
		if (selected == 'jacred_xyz') {
			Lampa.Storage.set('jackett_url', 'jacred.xyz');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'healthy');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'lg');
		}
		
		if (selected == 'jr_maxvol_pro') {
			Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'all');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'df');
		}
		
		if (selected == 'jacred_ru') {
			Lampa.Storage.set('jackett_url', 'jac-red.ru');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'false');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'lg');
		}
		
		if (selected == 'jacred_pro') {
			Lampa.Storage.set('jackett_url', 'jacred.pro');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'all');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'lg');
		}
		
		if (selected == 'jac_black') {
			Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'false');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'lg');
		}
		
		if (selected == 'jacred_viewbox_dev') {
			Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
			Lampa.Storage.set('jackett_key', '777');
			Lampa.Storage.set('jackett_interview', 'false');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'lg');
		}
	}

	// Основной параметр выбора парсера
	Lampa.Settings.main({
		component: 'parser',
		param: {
			name: 'jackett_urltwo',
			type: 'select',
			values: {
				'no_parser': 'Без парсера',
				'jacred_xyz': 'Jacred.xyz',
				'jr_maxvol_pro': 'Jacred Maxvol Pro',
				'jacred_ru': 'Jacred RU',
				'jacred_viewbox_dev': 'Viewbox',
				'jacred_pro': 'Jacred Pro',
				'jac_black': 'Jac Black'
			},
			default: 'jacred_xyz'
		},
		field: {
			name: 'Меню смены парсера',
			description: 'Нажмите для выбора парсера из списка'
		},
		onChange: function(value) {
			setParserConfig();
			Lampa.Settings.update();
		},
		onRender: function(html) {
			setTimeout(function() {
				$('.settings-param__name').on('hover:enter', function() {
					Lampa.Settings.main();
				});

				if (localStorage.getItem('jackett_urltwo') !== 'undefined') {
					$('.empty__title').hide();
					$('[data-name="jackett_key"]').hide();
					Lampa.Controller.toggle('settings_component');
				}

				if (Lampa.Storage.field('parser_use') == 'jackett') {
					html.show();
					$(html.find('.selector'), html).css('color', '#ffffff');
					$('[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
				} else {
					html.hide();
				}
			}, 100);
		}
	});

	Lampa.Settings.main(function(c) {
		if (c.render().find('[data-component="torrents"]').length) {
			c.render().find('[data-name="parser_torrent_type"]').remove();
		}
	});

	Lampa.Storage.listener.follow('parser_use', function(e) {
		if (Lampa.Storage.field('parser_use') !== 'jackett') {
			$('[data-name="jackett_key"]').hide();
		} else {
			$('[data-name="jackett_key"]').show();
			$('div[data-name="jackett_urltwo"]').insertAfter($('[data-name="jackett_url"]'));
		}
	});

	var initInterval = setInterval(function() {
		if (typeof Lampa !== 'undefined') {
			clearInterval(initInterval);
			if (!Lampa.Storage.get('jack', false)) initDefault();
		}
	}, 100);

	function initDefault() {
		Lampa.Storage.set('jack', 'true');
		Lampa.Storage.set('jackett_url', 'jacred.xyz');
		Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
		Lampa.Storage.set('parse_in_search', true);
		Lampa.Storage.set('jackett_key', '');
		Lampa.Storage.set('jackett_interview', 'healthy');
		Lampa.Storage.set('parse_lang', 'lg');
	}

	function showParserMenu() {
		var active = Lampa.Activity.active();
		var html = [];

		html.push({
			'title': 'Jacred.xyz',
			'url': 'jacred.xyz',
			'url_two': 'jacred_xyz',
			'jac_key': '',
			'jac_int': 'healthy',
			'jac_lang': 'lg'
		});

		html.push({
			'title': 'Jacred Maxvol Pro',
			'url': 'jr.maxvol.pro',
			'url_two': 'jr_maxvol_pro',
			'jac_key': '',
			'jac_int': 'all',
			'jac_lang': 'lg'
		});

		html.push({
			'title': 'Jacred RU',
			'url': 'jac-red.ru',
			'url_two': 'jacred_ru',
			'jac_key': '',
			'jac_int': 'false',
			'jac_lang': 'lg'
		});

		html.push({
			'title': 'Viewbox',
			'url': 'jacred.viewbox.dev',
			'url_two': 'jacred_viewbox_dev',
			'jac_key': '777',
			'jac_int': 'false',
			'jac_lang': 'lg'
		});

		html.push({
			'title': 'Jacred Pro',
			'url': 'jacred.pro',
			'url_two': 'jacred_pro',
			'jac_key': '',
			'jac_int': 'all',
			'jac_lang': 'lg'
		});

		html.push({
			'title': 'Jac Black',
			'url': 'jacblack.ru:9117',
			'url_two': 'jac_black',
			'jac_key': '',
			'jac_int': 'false',
			'jac_lang': 'lg'
		});

		checkStatus(html).then(function(items) {
			Lampa.Select.show({
				title: 'Выбрать парсер',
				items: items.map(function(item) {
					return {
						title: item.title,
						url: item.url,
						url_two: item.url_two,
						jac_key: item.jac_key,
						jac_int: item.jac_int,
						jac_lang: item.jac_lang
					};
				}),
				onBack: function() {
					Lampa.Controller.toggle(active.render());
				},
				onSelect: function(a) {
					Lampa.Storage.set('jackett_url', a.url);
					Lampa.Storage.set('jackett_urltwo', a.url_two);
					Lampa.Storage.set('jackett_key', a.jac_key);
					Lampa.Storage.set('jackett_interview', a.jac_int);
					Lampa.Storage.set('parse_lang', a.jac_lang);
					Lampa.Storage.set('parse_in_search', true);

					Lampa.Activity.back(active.render());
					var url = Lampa.Storage.field('url');
					setTimeout(function() {
						window.location.reload();
					}, 1000);
					setTimeout(function() {
						Lampa.Noty.show(url);
					}, 2000);
				}
			});
		}).catch(function(e) {
			console.error('Error:', e);
		});
	}

	function checkStatus(items) {
		var promises = [];
		for (var i = 0; i < items.length; i++) {
			var url = items[i].url;
			promises.push(checkSingleStatus(url, items[i].title, items[i]));
		}
		return Promise.all(promises);
	}

	function checkSingleStatus(url, title, item) {
		return new Promise(function(resolve) {
			var useProtocol = location.protocol === 'https:' ? 'https://' : 'http://';
			var apiKey = '';
			if (url == 'jacblack.ru:9117') apiKey = '34DPECDY';
			
			if (url == 'jr.maxvol.pro') useProtocol = 'https://';
			
			var requestUrl = useProtocol + url + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			var xhr = new XMLHttpRequest();
			
			xhr.open('GET', requestUrl, true);
			xhr.timeout = 3000;
			
			xhr.ontimeout = function() {
				item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
				resolve(item);
			};
			
			xhr.onerror = function() {
				item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
				resolve(item);
			};
			
			xhr.onload = function() {
				if (xhr.status === 200) {
					item.title = '<span style="color:#64e364;">✔&nbsp;&nbsp;' + title + '</span>';
				} else {
					item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
				}
				resolve(item);
			};
			
			xhr.send();
		});
	}

	// Обработчик клика по выбору парсера
	$(document).on('hover:enter', '[data-name="jackett_urltwo"]', function(e) {
		showParserMenu();
	});

	var observer;
	Lampa.Storage.listener.follow('parser_use', function(e) {
		if (e.value == 'url') {
			var activeActivity = Lampa.Activity.active();
			if (activeActivity && activeActivity.activity_type == 'settings') {
				initObserver();
			} else {
				stopObserver();
			}
		}
	});

	function initObserver() {
		stopObserver();
		var body = document.body;
		var config = { childList: true, subtree: true };
		
		observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if ($('div[data-children="parser"]').length && Lampa.Storage.field('parser_use') == 'url') {
					showParserMenu();
					stopObserver();
				}
			});
		});
		
		observer.observe(body, config);
	}

	function stopObserver() {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	}

	// Добавление красивого SVG иконки в меню
	var parserHtml = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716 "></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96 "></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908 "></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716 "></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96 "></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908 "></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716 "></polygon></g></g></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0;"><div style="background: #d99821;padding:0.5em;border-radius:0.4em;"><div style="line-height:0.3;">Выбрать парсер</div></div></div></div></div>';

	// Вставка HTML в DOM
	setTimeout(function() {
		if ($('[data-name="jackett_url"]').length) {
			$('[data-name="jackett_url"]').after(parserHtml);
		}
	}, 1000);

})();
