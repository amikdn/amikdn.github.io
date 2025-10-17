(function() {
	'use strict';

	Lampa.Platform.tv();

	var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
	
	// Только разрешенные парсеры
	var urls = ['jacred.xyz', 'jr.maxvol.pro', 'jac-red.ru', 'jacred.viewbox.dev', 'jacred.pro', 'jacblack.ru:9117'];
	var titles = ['Jacred.xyz', 'Jacred Maxvol Pro', 'Jacred RU', 'Viewbox', 'Jacred Pro', 'Jac Black'];
	var url_keys = ['jacred_xyz', 'jr_maxvol_pro', 'jacred_ru', 'jacred_viewbox_dev', 'jacred_pro', 'jac_black'];
	var api_keys = ['', '', '', '777', '', '34DPECDY'];

	// Функция проверки статуса парсера (как в оригинале)
	function checkParser(index) {
		setTimeout(function() {
			var apiKey = api_keys[index] || '';
			var pos = index + 2;
			var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + pos + ') > div';
			
			if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') {
				return;
			}
			
			var useProtocol = urls[index] === 'jr.maxvol.pro' ? 'https://' : protocol;
			var url = useProtocol + urls[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			var xhr = new XMLHttpRequest();
			xhr.timeout = 3000;
			xhr.open('GET', url, true);
			xhr.send();
			
			xhr.ontimeout = function() {
				if ($(selector).text() === titles[index]) {
					$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
				}
			};
			
			xhr.onerror = function() {
				if ($(selector).text() === titles[index]) {
					$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
				}
			};
			
			xhr.onload = function() {
				if (xhr.status === 200) {
					if ($(selector).text() === titles[index]) {
						$(selector).html('<span style="color:#64e364;">✔&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ffffff');
					}
				} else {
					if ($(selector).text() === titles[index]) {
						$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
					}
				}
			};
		}, 1000);
	}

	function checkAll(indexStart = 0) {
		for (var i = indexStart; i < urls.length; i++) {
			checkParser(i);
		}
	}

	// Настройка при выборе парсера
	function setParserConfig(selected) {
		var configs = {
			'no_parser': {url:'', key:'', interview:'false', search:false, lang:'lg'},
			'jacred_xyz': {url:'jacred.xyz', key:'', interview:'healthy', search:true, lang:'lg'},
			'jr_maxvol_pro': {url:'jr.maxvol.pro', key:'', interview:'all', search:true, lang:'df'},
			'jacred_ru': {url:'jac-red.ru', key:'', interview:'false', search:true, lang:'lg'},
			'jacred_viewbox_dev': {url:'jacred.viewbox.dev', key:'777', interview:'false', search:true, lang:'lg'},
			'jacred_pro': {url:'jacred.pro', key:'', interview:'all', search:true, lang:'lg'},
			'jac_black': {url:'jacblack.ru:9117', key:'34DPECDY', interview:'false', search:true, lang:'lg'}
		};
		
		var config = configs[selected] || configs['jacred_xyz'];
		Lampa.Storage.set('jackett_url', config.url);
		Lampa.Storage.set('jackett_key', config.key);
		Lampa.Storage.set('jackett_interview', config.interview);
		Lampa.Storage.set('parse_in_search', config.search);
		Lampa.Storage.set('parse_lang', config.lang);
	}

	// Основная настройка
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
		onChange: function(val) {
			setParserConfig(val);
			Lampa.Settings.update();
		},
		onRender: function(html) {
			setTimeout(function() {
				$('.settings-param__name').on('hover:enter', function() {
					Lampa.Settings.main();
				});
				
				if (localStorage.getItem('jackett_urltwo') !== null) {
					$('.empty__title').hide();
					$('div[data-name="jackett_key"]').hide();
					Lampa.Controller.toggle('settings_component');
				}
				
				if (Lampa.Storage.field('parser_use') === 'jackett' && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
					html.show();
					$(html.find('.selector'), html).css('color', '#ffffff');
					
					// Добавляем элемент выбора парсера
					var parserSelect = '<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>';
					$('div[data-name="jackett_url"]').after(parserSelect);
				} else {
					html.hide();
				}
			}, 100);
		}
	});

	// Обработчик клика по "Выбрать парсер"
	$(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', function() {
		showParserMenu();
	});

	function showParserMenu() {
		var items = [];
		
		for (var i = 0; i < urls.length; i++) {
			items.push({
				title: titles[i],
				url: urls[i],
				url_two: url_keys[i],
				jac_key: api_keys[i],
				jac_int: getInterview(urls[i]),
				jac_lang: getLang(urls[i])
			});
		}
		
		// Проверяем статусы параллельно
		Promise.all(items.map(function(item, index) {
			return checkSingleStatus(item, index);
		})).then(function(checkedItems) {
			Lampa.Select.show({
				title: 'Выбрать парсер',
				items: checkedItems.map(function(item) {
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
					Lampa.Controller.toggle('settings_component');
				},
				onSelect: function(item) {
					Lampa.Storage.set('jackett_url', item.url);
					Lampa.Storage.set('jackett_urltwo', item.url_two);
					Lampa.Storage.set('jackett_key', item.jac_key);
					Lampa.Storage.set('jackett_interview', item.jac_int);
					Lampa.Storage.set('parse_lang', item.jac_lang);
					Lampa.Storage.set('parse_in_search', true);
					
					Lampa.Activity.back();
					var currentUrl = Lampa.Storage.field('url');
					setTimeout(function() {
						window.location.reload();
					}, 1000);
					setTimeout(function() {
						Lampa.Noty.show(currentUrl);
					}, 2000);
				}
			});
		}).catch(function(e) {
			console.error('Parser check error:', e);
		});
	}

	function checkSingleStatus(item, index) {
		return new Promise(function(resolve) {
			var useProtocol = item.url === 'jr.maxvol.pro' ? 'https://' : protocol;
			var apiKey = item.jac_key || '';
			var url = useProtocol + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.timeout = 3000;
			
			xhr.onload = function() {
				if (xhr.status === 200) {
					item.title = '<span style="color:#64e364;">✔&nbsp;&nbsp;' + item.title + '</span>';
				} else {
					item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
				}
				resolve(item);
			};
			
			xhr.onerror = xhr.ontimeout = function() {
				item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
				resolve(item);
			};
			
			xhr.send();
		});
	}

	function getInterview(url) {
		switch(url) {
			case 'jacred.xyz': return 'healthy';
			case 'jr.maxvol.pro': return 'all';
			case 'jacred.pro': return 'all';
			default: return 'false';
		}
	}

	function getLang(url) {
		return url === 'jr.maxvol.pro' ? 'df' : 'lg';
	}

	// Слушатель для проверки статусов
	Lampa.Listener.follow('app', function(e) {
		if (e.type === 'select') {
			setTimeout(function() {
				checkAll();
			}, 10);
		}
	});

	// Observer для динамических изменений
	var observer;
	Lampa.Storage.listener.follow('parser_use', function(e) {
		if (e.value === 'jackett') {
			if (observer) observer.disconnect();
			
			observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.type === 'childList') {
						if ($('div[data-children="parser"]').length) {
							setTimeout(function() {
								if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
									$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
								}
							}, 100);
						}
					}
				});
			});
			
			observer.observe(document.body, {childList: true, subtree: true});
		}
	});

	// Инициализация по умолчанию
	setTimeout(function() {
		if (!Lampa.Storage.get('jack')) {
			Lampa.Storage.set('jack', 'true');
			Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
			setParserConfig('jacred_xyz');
		}
	}, 1000);

	// Дополнительная проверка при загрузке настроек
	setInterval(function() {
		if (Lampa.Storage.field('parser_use') === 'jackett' && $('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
			$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
		}
	}, 2000);

})();
