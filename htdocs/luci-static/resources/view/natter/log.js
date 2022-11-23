'use strict';
'require view';
'require fs';
'require uci';
'require ui';

return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	load: function() {
		return L.resolveDefault(fs.read('/var/natter/natter.log'), '');
	},

	render: function(logdata) {

		return E([
			E('h4', {}, _('Natter Log: <code>/var/natter/natter.log</code>')),
			E('div', {}, [
				E('textarea', {
					'style': 'width:100%',
					'readonly': 'readonly',
					'wrap': 'off',
					'rows': 30
				}, [ logdata != null ? logdata : '' ])
			])
		]);
	}
});
