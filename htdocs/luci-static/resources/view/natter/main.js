'use strict';
'require view';
'require poll';
'require fs';
'require rpc';
'require uci';
'require ui';
'require form';
'require tools.widgets as widgets';

var callHostHints;

callHostHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getHostHints',
	expect: { '': {} }
});

return view.extend({
//	handleSaveApply: null,
//	handleSave: null,
//	handleReset: null,

	load: function() {
	return Promise.all([
		L.resolveDefault(fs.read('/tmp/natter_type_fixed'), null),
		L.resolveDefault(fs.read('/tmp/natter_type_random'), null),
		L.resolveDefault(fs.read('/var/natter/natter-status.json'), null),
		callHostHints(),
		uci.load('natter'),
	]);
	},

	poll_status: function(nodes, json) {
		var maps = JSON.parse(json[0] ? json[0].trim() : null);
		var rows = [];
		if (maps) {
			Object.keys(maps).forEach(key => {
			    for (var i = 0; i < maps[key].length; i++) {
					rows.push([
						key,
						maps[key][i].inner.split(':')[0],
						maps[key][i].inner.split(':')[1],
						maps[key][i].outer.split(':')[0],
						maps[key][i].outer.split(':')[1]
					]);
			    }
			});
		};
		cbi_update_table(nodes.querySelector('#natter_status_table'), rows.sort(), E('em', _('There are no active portmap')));
		return;
	},

	render: function(res) {
		var natter_type_fixed  = res[0] ? res[0].trim().split("\n") : [],
			natter_type_random = res[1] ? res[1].trim().split("\n") : [],
			natter_status_json = res[2] ? res[2].trim() : null,
			hosts = res[3];

		var m, s, o;

		m = new form.Map('natter', _('Natter'),
			_('Open Port under FullCone NAT (NAT 1)'));

		s = m.section(form.GridSection, '_active_maps');

		s.render = L.bind(function(view, section_id) {
			var table = E('table', { 'class': 'table cbi-section-table', 'id': 'natter_status_table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Protocol')),
					E('th', { 'class': 'th' }, _('External Addr')),
					E('th', { 'class': 'th' }, _('External Port')),
					E('th', { 'class': 'th' }, _('Internet Addr')),
					E('th', { 'class': 'th' }, _('Internet Port')),
					E('th', { 'class': 'th cbi-section-actions' }, '')
				])
			]);
			var maps = JSON.parse(natter_status_json);
			var rows = [];
			if (maps) {
				Object.keys(maps).forEach(key => {
				    for (var i = 0; i < maps[key].length; i++) {
						rows.push([
							key,
							maps[key][i].inner.split(':')[0],
							maps[key][i].inner.split(':')[1],
							maps[key][i].outer.split(':')[0],
							maps[key][i].outer.split(':')[1]
						]);
				    }
				});
			};
			cbi_update_table(table, rows.sort(), E('em', _('There are no active portmap')));
			return E('div', { 'class': 'cbi-section cbi-tblsection' }, [
					E('h3', _('Active Portmap')), table ]);
		}, o, this);

		s = m.section(form.TypedSection, 'natter', _('Natter Settings'));
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Button, '_check_fixed', _('Check NAT Status (Port 3456)'),
			_('Please check if the <a href="%s"><b>rule</b></a> <b>\'NatTypeTest\'</b> exists and enabled first.').format(L.url('admin', 'network', 'firewall', 'rules')));
		o.inputtitle = _('Check');
		o.inputstyle = 'apply';
		o.onclick = function() {
			window.setTimeout(function() {
				window.location = window.location.href.split('#')[0];
			}, 4500);

			return fs.exec('/usr/libexec/natter/natcheck.sh', ['3456', '/tmp/natter_type_fixed'])
				.catch(function(e) { ui.addNotification(null, E('p', e.message), 'error') });
		};

		if (natter_type_fixed.length) {
			o = s.option(form.DummyValue, '_status_fixed', '　');
			o.rawhtml = true;
			o.cfgvalue = function(s) {
				//return natter_type_fixed[0] + '<br>' + natter_type_fixed[1];
				return E('div', {}, [
					E('span', [
						E('b', [natter_type_fixed[0]]),
						E('br'),
						E('b', [natter_type_fixed[1]])
					])
				]);
			}
		};

		o = s.option(form.Button, '_check_random', _('Check NAT Status (Random port)'),
			_('If the result is not NAT 1,') + ' ' + _('Via Natter') + ' ' + _('mode will not be available.'));
		o.inputtitle = _('Check');
		o.inputstyle = 'apply';
		o.onclick = function() {
			window.setTimeout(function() {
				window.location = window.location.href.split('#')[0];
			}, 4500);

			return fs.exec('/usr/libexec/natter/natcheck.sh', ['0', '/tmp/natter_type_random'])
				.catch(function(e) { ui.addNotification(null, E('p', e.message), 'error') });
		};

		if (natter_type_random.length) {
			o = s.option(form.DummyValue, '_status_fixed', '　');
			o.rawhtml = true;
			o.cfgvalue = function(s) {
				return E('div', {}, [
					E('span', [
						E('b', [natter_type_random[0]]),
						E('br'),
						E('b', [natter_type_random[1]])
					])
				]);
			}
		};

		o = s.option(form.ListValue, 'log_level', _('Log level'));
		o.value('debug', _('Debug'));
		o.value('info', _('Info'));
		o.value('warning', _('Warning'));
		o.value('error', _('Error'));
		o.default = 'info';
		o.rmempty = false;

		o = s.option(form.Value, 'keepalive_server', _('Keep-Alive Server'));
		o.datatype = 'host';
		o.placeholder = 'www.qq.com';
		o.default = 'www.baidu.com';
		o.rmempty = false;

		o = s.option(form.DynamicList, 'tcp_stun', _('TCP STUN Server'));
		o.datatype = "list(host)";
		o.placeholder = 'stun.sipnet.com';
		o.default = 'stun.nextcloud.com';
		o.rmempty = false;

		o = s.option(form.DynamicList, 'udp_stun', _('UDP STUN Server'));
		o.datatype = "list(host)";
		o.placeholder = 'stun.qq.com';
		o.default = 'stun.miwifi.com';
		o.rmempty = false;

		s = m.section(form.GridSection, 'portrule', _('Port Rules'));
		s.sortable  = true;
		s.anonymous = true;
		s.addremove = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.enabled;
		o.editable = true;
		o.rmempty = false;

		//o = s.option(form.Value, 'id', _('ID'), _('Just keep default, or ensure uniqueness'));
		//o.modalonly = true;
		//o.rmempty = false;

		o = s.option(form.Value, 'comment', _('Comment'));
		o.datatype = 'uciname';
		o.rmempty = false;

		o = s.option(form.ListValue, 'action', _('Action'));
		o.value('bind', 'bind - ' + _('Just Open Ports'));
		o.value('forward', 'forward - ' + _('Service Instances'));
		o.default = 'bind';
		o.rmempty = false;
		//o.modalonly = true;

		o = s.option(form.ListValue, 'mode', _('Forward Mode'),
			_('Via Natter') + ' ' + _('mode requires Random port test is NAT 1'));
		o.value('dnat', 'dnat - ' + _('Firewall DNAT'));
		o.value('via', 'via - ' + _('Via Natter'));
		o.default = 'dnat';
		o.rmempty = false;
		o.retain = true;
		o.depends('action', 'forward');

		o = s.option(widgets.DeviceSelect, 'bind_ifname', _('External Listen Interface'));
		o.multiple = true;
		o.noaliases = true;
		o.nobridges = true;
		o.nocreate = false;
		o.rmempty = true;
		o.depends('action', 'bind');
		o.depends('mode', 'dnat');

		//o = s.option(form.Value, 'bind_ip', _('External Listen Addr'));
		//o.datatype = 'ip4addr(1)';
		//o.default = '0.0.0.0';
		//o.rmempty = false;
		//o.depends('action', 'bind');
		//o.depends('mode', 'dnat');

		o = s.option(form.Value, 'bind_port', _('Open External Port'));
		o.datatype = "range(1, 65535)";
		o.rmempty = false;
		o.retain = true;
		o.depends('action', 'bind');
		o.depends('mode', 'dnat');

		o = s.option(form.Value, 'server_ip', _('Internal Server IP'));
		o.datatype = 'ip4addr(1)';
		o.value('127.0.0.1', '127.0.0.1 ' + _('(This device default Lan)'));
		o.value('0.0.0.0', '0.0.0.0 ' + _('(This device default Wan)'));
		o.default = '127.0.0.1';
		o.rmempty = false;
		o.retain = true;
		o.depends('action', 'forward');

		var ipaddrs = {};
		Object.keys(hosts).forEach(function(mac) {
			var addrs = L.toArray(hosts[mac].ipaddrs || hosts[mac].ipv4);

			for (var i = 0; i < addrs.length; i++)
				ipaddrs[addrs[i]] = hosts[mac].name || mac;
		});
		L.sortedKeys(ipaddrs, null, 'addr').forEach(function(ipv4) {
			o.value(ipv4, ipaddrs[ipv4] ? '%s (%s)'.format(ipv4, ipaddrs[ipv4]) : ipv4);
		});

		//o = s.option(form.Value, 'server_ip', _('Internal Server IP'));
		//o.datatype = "host(1)";
		//o.rmempty = false;
		//o.depends('action', 'forward');

		o = s.option(form.Flag, 'follow_pub_port', _('Dynport'),
			_('Internal Port follow Internet Port'));
		o.default = o.disabled;
		o.rmempty = false;
		o.retain = true;
		o.depends('mode', 'dnat');

		o = s.option(form.Value, 'server_port', _('Internal Server Port'));
		o.datatype = "range(1, 65535)";
		o.rmempty = false;
		o.retain = true;
		o.depends('mode', 'via');
		o.depends({ mode: 'dnat', follow_pub_port: '0' });

		o = s.option(form.ListValue, 'proto', _('Protocol Type'),
			_('When Dynport is enabled, please donot select ') + _('Both'));
		o.value('udp', _('UDP'));
		o.value('tcp', _('TCP'));
		o.value('both', _('Both'));
		o.default = 'both';
		o.rmempty = false;
		o.write = function(section, value) {
			let dyn = uci.get('natter', section, 'follow_pub_port') || '0';
			if ( value == 'both' && dyn == '1' ) {
				uci.set('natter', section, 'proto', 'udp');
			} else {
				uci.set('natter', section, 'proto', value);
			}
		};

		o = s.option(form.Flag, 'loopback', _('NAT loopback'));
		o.default = o.enabled;
		o.rmempty = true;
		o.depends('mode', 'dnat');

		o = s.option(form.Flag, 'refresh_port', _('Refresh client listen port'));
		o.default = o.enabled;
		o.rmempty = false;
		o.retain = true;
		o.depends({ mode: 'dnat', follow_pub_port: '1' });
		o.modalonly = true;

		o = s.option(form.ListValue, 'appname', _('Client Name'));
		o.value('qbt', _('qBittorrent'));
		o.value('tr', _('Transmission'));
		o.default = 'qbt';
		o.rmempty = false;
		o.retain = true;
		o.depends('refresh_port', '1');
		o.modalonly = true;

		o = s.option(form.ListValue, 'scheme', _('URI Scheme'));
		o.value('http', 'HTTP');
		o.value('https', 'HTTPS');
		o.default = 'http';
		o.rmempty = true;
		o.depends('refresh_port', '1');
		o.modalonly = true;

		o = s.option(form.Value, 'web_port', _('Web UI Port'));
		o.datatype = "range(1, 65535)";
		o.default = '8080';
		o.rmempty = false;
		o.retain = true;
		o.depends('refresh_port', '1');
		o.modalonly = true;

		o = s.option(form.Value, 'username', _('Username'));
		o.rmempty = false;
		o.retain = true;
		o.depends('refresh_port', '1');
		o.modalonly = true;

		o = s.option(form.Value, 'password', _('Password'));
		o.password = true;
		o.rmempty = true;
		o.depends('refresh_port', '1');
		o.modalonly = true;

		return m.render()
		.then(L.bind(function(m, nodes) {
			poll.add(L.bind(function() {
				return Promise.all([
					L.resolveDefault(fs.read('/var/natter/natter-status.json'), null)
				]).then(L.bind(this.poll_status, this, nodes));
			}, this), 5);
			return nodes;
		}, this, m));
	}
});
