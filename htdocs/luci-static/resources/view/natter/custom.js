'use strict';
'require view';
'require fs';
'require ui';

var isReadonlyView = !L.hasViewPermission() || null;

return view.extend({
handleSaveApply: null,
handleReset: null,

	load: function() {
	return Promise.all([
		L.resolveDefault(fs.read('/etc/natter/custom-script.sh'), ''),
		L.resolveDefault(fs.read('/usr/share/natter/natter-hook.sh'), '')
	]);
	},

	handleSave: function(ev) {
		var value = (document.querySelector('textarea').value || '').trim().replace(/\r\n/g, '\n') + '\n';

		return fs.write('/etc/natter/custom-script.sh', value).then(function(rc) {
			document.querySelector('textarea').value = value;
			ui.addNotification(null, E('p', _('Contents have been saved.')), 'info');
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Unable to save contents: %s').format(e.message)));
		});
	},

	render: function(conf) {
		return E([
			E('h4', _('Edit Natter Custom script: <code>/etc/natter/custom-script.sh</code>')),
			E('p', {}, E('textarea', { 'style': 'width:100%', 'rows': 25, 'disabled': isReadonlyView }, [ conf[0] != null ? conf[0] : '' ])),
			E('h4', _('View Natter Hook script: <code>/usr/share/natter/natter-hook.sh</code>')),
			E('p', {}, E('textarea', { 'style': 'width:100%', 'rows': 12, 'readonly': 'readonly', 'disabled': true }, [ conf[1] != null ? conf[1] : '' ]))
		]);
	}
});
