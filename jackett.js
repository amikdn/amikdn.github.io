(function() {
	'use strict';

	Lampa.Platform.tv();

	// Упрощенная обфускация БЕЗ поврежденных строк
	var strings = [
		'jacred.xyz','div[data-children="parser"]','bind','no_parser','viewbox','open','title','url','34DPECDY',
		'<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="32" width="32" viewBox="0 0 512 512"><polygon fill="#074761" points="187.305,27.642 324.696,27.642 256,236.716"/><polygon fill="#10BAFC" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"/></svg></div><div style="font-size:1em"><div style="padding:0.3em 0.3em;padding-top:0"><div style="background:#d99821;padding:0.5em;border-radius:0.4em"><div style="line-height:0.3">Выбрать парсер</div></div></div></div></div>',
		'Jac Black','jackett_interview','Свой вариант','color','onload','select','Jacred Pro','disconnect','follow','jac_lang','then','ff2121',
		'div[data-name="jackett_urltwo"]','jackett','Jacred RU','Storage','.settings-param__name','parser','back','observe','hide',
		'https:','html','jacblack.ru:9117','jack','Controller','https://','jac_key','set','jacred_ru','error','ontimeout','remove',
		'Меню смены парсера','toggle','parse_lang','/api/v2.0/indexers/status:healthy/results?apikey=','torrents','insertAfter',
		'healthy','Activity','parser_use','timeout','jackett_url','css','http://','777','console','parse_in_search','Jacred.xyz',
		'parser_torrent_type','<span style="color:#ff2121">✘  ','status','length','jr.maxvol.pro','jacred.viewbox.dev','false',
		'Settings','GET','</span>','jacred_pro','jac-red.ru','all','url_two','Нажмите для выбора парсера из списка','update',
		'div[data-name="jackett_key"]','push','map','show','Jacred Maxvol Pro','jr_maxvol_pro','✔  ','jackett_key','jacred_xyz'
	];

	var idx = 0;
	function _s(key) { return strings[idx++]; }

	Lampa.Storage.field('parser', true);

	var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
	var urls = ['jacred.xyz','jr.maxvol.pro','jac-red.ru','jacred.viewbox.dev','jacred.pro','jacblack.ru:9117'];
	var titles = ['Jacred.xyz','Jacred Maxvol Pro','Jacred RU','Viewbox','Jacred Pro','Jac Black'];

	function checkParser(i) {
		setTimeout(function() {
			var apiKey = urls[i] === 'jacblack.ru:9117' ? '34DPECDY' : '';
			var pos = i + 2;
			var sel = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + pos + ') > div';
			
			if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
			
			var p = urls[i] === 'jr.maxvol.pro' ? 'https://' : protocol;
			var url = p + urls[i] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			var xhr = new XMLHttpRequest();
			
			xhr.timeout = 3000;
			xhr.open('GET', url, true);
			xhr.send();
			
			xhr.onload = function() {
				if ($(sel).text() === titles[i]) {
					var status = xhr.status === 200 ? '✔&nbsp;&nbsp;' : '✘&nbsp;&nbsp;';
					var color = xhr.status === 200 ? '#64e364' : '#ff2121';
					$(sel).html('<span style="color:' + color + '">' + status + titles[i] + '</span>').css('color', xhr.status === 200 ? '#ffffff' : '#ff2121');
				}
			};
			
			xhr.onerror = xhr.ontimeout = function() {
				if ($(sel).text() === titles[i]) {
					$(sel).html('<span style="color:#ff2121">✘&nbsp;&nbsp;' + titles[i] + '</span>').css('color', '#ff2121');
				}
			};
		}, 1000);
	}

	function checkAll() {
		for (var i = 0; i < urls.length; i++) {
			checkParser(i);
		}
	}

	Lampa.Listener.follow('app', function(e) {
		if (e.type == 'select') setTimeout(checkAll, 10);
	});

	function setConfig() {
		var sel = Lampa.Storage.get('jackett_urltwo');
		var configs = {
			'no_parser': {u:'', k:'', i:'false', s:false, l:'lg'},
			'jacred_xyz': {u:'jacred.xyz', k:'', i:'healthy', s:true, l:'lg'},
			'jr_maxvol_pro': {u:'jr.maxvol.pro', k:'', i:'all', s:true, l:'df'},
			'jacred_ru': {u:'jac-red.ru', k:'', i:'false', s:true, l:'lg'},
			'jacred_viewbox_dev': {u:'jacred.viewbox.dev', k:'777', i:'false', s:true, l:'lg'},
			'jacred_pro': {u:'jacred.pro', k:'', i:'all', s:true, l:'lg'},
			'jac_black': {u:'jacblack.ru:9117', k:'34DPECDY', i:'false', s:true, l:'lg'}
		};
		var c = configs[sel] || configs['jacred_xyz'];
		Lampa.Storage.set('jackett_url', c.u);
		Lampa.Storage.set('jackett_key', c.k);
		Lampa.Storage.set('jackett_interview', c.i);
		Lampa.Storage.set('parse_in_search', c.s);
		Lampa.Storage.set('parse_lang', c.l);
	}

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
		onChange: function(v) {
			setConfig();
			Lampa.Settings.update();
		},
		onRender: function(html) {
			setTimeout(function() {
				if (Lampa.Storage.field('parser_use') == 'jackett') {
					html.show();
					$(html.find('.selector')).css('color', '#ffffff');
					
					// ТОЧНО как в оригинале - добавляем после jackett_url
					setTimeout(function() {
						var parserBtn = strings[11]; // SVG HTML
						if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
							$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">' + parserBtn + '</div>');
						}
					}, 200);
				}
			}, 50);
		}
	});

	// ТОЧНЫЙ обработчик как в оригинале
	$(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', function() {
		showMenu();
	});

	Lampa.Storage.listener.follow('parser_use', function(e) {
		if (Lampa.Storage.field('parser_use') !== 'jackett') {
			$('div[data-name="jackett_key"]').hide();
		} else {
			$('div[data-name="jackett_key"]').show();
			setTimeout(function() {
				var parserBtn = strings[11];
				if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
					$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">' + parserBtn + '</div>');
				}
			}, 500);
		}
	});

	function showMenu() {
		var items = [
			{title:'Jacred.xyz', url:'jacred.xyz', url_two:'jacred_xyz', key:'', int:'healthy', lang:'lg'},
			{title:'Jacred Maxvol Pro', url:'jr.maxvol.pro', url_two:'jr_maxvol_pro', key:'', int:'all', lang:'lg'},
			{title:'Jacred RU', url:'jac-red.ru', url_two:'jacred_ru', key:'', int:'false', lang:'lg'},
			{title:'Viewbox', url:'jacred.viewbox.dev', url_two:'jacred_viewbox_dev', key:'777', int:'false', lang:'lg'},
			{title:'Jacred Pro', url:'jacred.pro', url_two:'jacred_pro', key:'', int:'all', lang:'lg'},
			{title:'Jac Black', url:'jacblack.ru:9117', url_two:'jac_black', key:'34DPECDY', int:'false', lang:'lg'}
		];

		Promise.all(items.map((item,i) => new Promise(r => {
			var p = item.url == 'jr.maxvol.pro' ? 'https://' : protocol;
			var u = p + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + item.key;
			var x = new XMLHttpRequest();
			x.open('GET', u, true);
			x.timeout = 2000;
			x.onload = () => {
				item.title = x.status == 200 ? '✔ ' + item.title : '✘ ' + item.title;
				r(item);
			};
			x.onerror = x.ontimeout = () => { item.title = '✘ ' + item.title; r(item); };
			x.send();
		}))).then(items => {
			Lampa.Select.show({
				title: 'Выбрать парсер',
				items: items,
				onBack: () => Lampa.Controller.toggle('settings_component'),
				onSelect: item => {
					Lampa.Storage.set('jackett_url', item.url);
					Lampa.Storage.set('jackett_urltwo', item.url_two);
					Lampa.Storage.set('jackett_key', item.key);
					Lampa.Storage.set('jackett_interview', item.int);
					Lampa.Storage.set('parse_lang', item.lang);
					Lampa.Storage.set('parse_in_search', true);
					Lampa.Activity.back();
					setTimeout(() => window.location.reload(), 1000);
				}
			});
		});
	}

	// Инициализация
	setInterval(() => {
		if (typeof Lampa !== 'undefined' && !Lampa.Storage.get('jack')) {
			Lampa.Storage.set('jack', 'true');
			Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
			setConfig();
		}
	}, 100);

	// Observer как в оригинале
	var obs;
	Lampa.Storage.listener.follow('parser_use', e => {
		if (e.value === 'jackett') {
			if (obs) obs.disconnect();
			obs = new MutationObserver(m => {
				m.forEach(n => {
					if (n.type === 'childList' && $('div[data-children="parser"]').length) {
						setTimeout(() => {
							var parserBtn = strings[11];
							if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
								$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">' + parserBtn + '</div>');
							}
						}, 100);
					}
				});
			});
			obs.observe(document.body, {childList:true, subtree:true});
		}
	});

})();
