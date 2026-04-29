(function () {
	'use strict';

	Lampa.Platform.tv();

	function initOriginalTitlePlugin() {
		if (window.original_title_display) return;

		window.original_title_display = true;

		Lampa.Listener.follow('full', function (event) {
			if (event.type !== 'complite') return;

			var activeActivity = Lampa.Activity.active();
			var render = activeActivity.activity.render();
			var card = activeActivity.card;

			if (!card || !card.original_title) return;

			var title = $('.full-start-new__title', render);

			if (title.length === 0) return;

			$('.original-title-display', render).remove();

			var originalTitle = $(
				'<div class="original-title-display" style="color: #b0b1b1; font-size: 1.5em; margin-top: 0.3em; margin-bottom: 0.3em;">' +
					card.original_title +
					'</div>'
			);

			title.before(originalTitle);
		});
	}

	if (window.appready) {
		initOriginalTitlePlugin();
	} else {
		Lampa.Listener.follow('app', function (event) {
			if (event.type === 'ready') initOriginalTitlePlugin();
		});
	}
})();
