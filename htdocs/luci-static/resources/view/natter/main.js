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
		L.resolveDefault(fs.read('/tmp/natter_type_fixed'), null),
		L.resolveDefault(fs.read('/tmp/natter_type_random'), null),
		uci.load('natter'),
	]);
	},

	render: function(res) {
		var natter_type_fixed  = res[0] ? res[0].split("\n") : [],
			natter_type_random = res[1] ? res[1].split("\n") : [];

		var m, s, o;

		m = new form.Map('natter', _('Natter'),
			_('Open Port under FullCone NAT (NAT 1)'));

		s = m.section(form.TypedSection, 'natter');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Button, '_check_fixed', _('Check NAT Status (Port 3456)'),
			_('Please check if the <a href="%s"><b>rule</b></a> <b>\'NatTypeTest\'</b> exists first.').format(L.url('admin', 'network', 'firewall', 'rules')));
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
			o = s.option(form.DummyValue, '_status_fixed', ' ');
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
			_('If the result is not NAT 1, forward mode will not be available.'));
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
			o = s.option(form.DummyValue, '_status_fixed', ' ');
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

		return m.render();
	}
});
