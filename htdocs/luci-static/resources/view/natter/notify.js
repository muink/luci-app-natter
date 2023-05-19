'use strict';
'require view';
'require fs';
'require uci';
'require ui';
'require form';

return view.extend({
//	handleSaveApply: null,
//	handleSave: null,
//	handleReset: null,

	load: function() {
	return Promise.all([
		L.resolveDefault(fs.list('/etc/natter/notify'), []),
		uci.load('natter-plugins'),
	]);
	},

	render: function(res) {
		var notifyss = res[0];

		var m, s, o;

		m = new form.Map('natter-plugins');

		s = m.section(form.GridSection, 'notify', _('Notify Scripts'));
		s.sortable  = true;
		s.anonymous = true;
		s.addremove = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.editable = true;
		o.rmempty = false;

		o = s.option(form.Value, 'comment', _('Comment'));
		o.datatype = 'uciname';
		o.rmempty = true;

		o = s.option(form.ListValue, 'script', _('Script'));
		o.rmempty = false;

		if (notifyss.length) {
			for (var i = 0; i < notifyss.length; i++) {
				o.value( notifyss[i].name );
				//o.value( notifyss[i].name.split('.')[0] );
			}
		};

		o = s.option(form.DynamicList, 'tokens', _('Tokens'),
			_('The KEY required by the script above. ' +
				'See <a href="%s" target="_blank">%s*.sh</a> for the format of KEY required by each script. ' +
				'Add multiple entries here in KEY=VAL shell variable format to supply multiple KEY variables.')
			.format('https://github.com/muink/openwrt-Natter/tree/master/files/notify/'));
		o.datatype = 'list(string)';
		o.rmempty = false;
		o.modalonly = true;

		o = s.option(form.Value, 'custom_domain', _('Private API Domain'));
		o.datatype = 'hostname';
		o.placeholder = 'api.example.com';
		o.rmempty = true;
		o.modalonly = true;

		o = s.option(form.Value, 'text', _('Text content'));
		o.placeholder = 'Natter notification: ${protocol}: ${inner_ip}:${inner_port} -> ${outter_ip}:${outter_port}';
		o.rmempty = true;

		return m.render();
	}
});
