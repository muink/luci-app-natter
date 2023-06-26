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
		L.resolveDefault(fs.list('/etc/natter/ddns'), []),
		uci.load('natter'),
		uci.load('natter-plugins'),
	]);
	},

	render: function(res) {
		var notifyss = res[0];

		var m, s, o;

		m = new form.Map('natter-plugins');

		s = m.section(form.GridSection, 'ddns', _('DDNS Scripts'));
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
			.format('https://github.com/muink/openwrt-Natter/tree/master/files/ddns/'));
		o.datatype = 'list(string)';
		o.placeholder = 'KEY=VAL';
		o.rmempty = false;
		o.modalonly = true;

		o = s.option(form.ListValue, 'bind_port', _('Open External Port'));
		o.datatype = "range(1, 65535)";
		o.rmempty = false;

		uci.sections('natter', 'portrule', function(s, sid) {
			let enab = uci.get('natter', sid, 'enabled') || '0';
			let acti = uci.get('natter', sid, 'action');
			let mode = uci.get('natter', sid, 'mode');
			let ifna = uci.get('natter', sid, 'bind_ifname');
			let port = uci.get('natter', sid, 'bind_port');
			let prot = uci.get('natter', sid, 'proto');
			let comm = uci.get('natter', sid, 'comment');
			if ( enab === '1' )
				if ( acti == 'bind' || (acti == 'forward' && mode == 'dnat'))
					if ( typeof(Number(port)) == 'number' )
						//alert([acti, mode, ifna, port, prot, comm]);
						o.value(port, port + ' ([' + ifna + '], ' + prot.toUpperCase() + ', ' + comm + ')');
		});

		o = s.option(form.ListValue, 'proto', _('Protocol Type'));
		o.value('udp', _('UDP'));
		o.value('tcp', _('TCP'));
		o.default = 'tcp';
		o.rmempty = false;

		o = s.option(form.Value, 'fqdn', _('FQDN'));
		o.datatype = 'hostname';
		o.placeholder = 'mc.example.com';
		o.rmempty = false;

		o = s.option(form.Flag, 'a_record', _('IPv4 Record'));
		o.default = o.disabled;
		o.rmempty = true;

		o = s.option(form.DummyValue, '_srv_dump', _('SRV Record'));
		o.rawhtml = false;
		o.cfgvalue = function(sid) {
			let fqdn = uci.get('natter-plugins', sid, 'fqdn');
			let serv = uci.get('natter-plugins', sid, 'srv_service');
			let prot = uci.get('natter-plugins', sid, 'srv_proto') || 'tcp';
			let targ = uci.get('natter-plugins', sid, 'srv_target') || fqdn;

			if ( fqdn && serv && prot && targ )
				return '_' + serv + '._' + prot + '.' + fqdn + '. <TTL> IN SRV    <Priority> <Weight> <port> ' + targ + '.';
		};

		o = s.option(form.Flag, 'srv_record', _('SRV Record'));
		o.default = o.disabled;
		o.rmempty = true;
		o.modalonly = true;

		o = s.option(form.Value, 'srv_service', _('SRV Service'));
		o.value('minecraft');
		o.value('factorio');
		o.value('http');
		o.default = 'minecraft';
		o.rmempty = false;
		o.depends('srv_record', '1');
		o.modalonly = true;

		o = s.option(form.ListValue, 'srv_proto', _('SRV Protocol'));
		o.value('udp', _('UDP'));
		o.value('tcp', _('TCP'));
		o.value('tls', _('TLS'));
		o.default = 'tcp';
		o.rmempty = false;
		o.depends('srv_record', '1');
		o.modalonly = true;

		o = s.option(form.Value, 'srv_target', _('SRV Target'));
		o.datatype = 'hostname';
		o.placeholder = 'mc.example.com';
		o.rmempty = true;
		o.depends('srv_record', '1');
		o.modalonly = true;

		o = s.option(form.Flag, 'https_record', _('HTTPS Record'));
		o.default = o.disabled;
		o.rmempty = true;

		o = s.option(form.Value, 'https_target', _('TargetName'));
		o.datatype = 'hostname';
		o.placeholder = '. or web.example.com';
		o.rmempty = true;
		o.depends('https_record', '1');
		o.modalonly = true;

		o = s.option(form.Value, 'https_svcparams', _('SvcParams'));
		o.placeholder = 'alpn="h2,http/1.1" ipv4hint= port=';
		o.default = 'alpn="h2,http/1.1"';
		o.rmempty = true;
		o.depends('https_record', '1');
		o.modalonly = true;

		return m.render();
	}
});
