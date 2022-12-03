'use strict';
'require baseclass';
'require fs';
'require uci';

return baseclass.extend({
	title: _('Active Natter Portmap'),

	load: function() {
		return Promise.all([
			L.resolveDefault(fs.read('/var/natter/natter-status.json'), null)
		]);
	},

	render: function(res) {

		var table = E('table', { 'class': 'table cbi-section-table', 'id': 'natter_status_table' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th' }, _('Protocol')),
				E('th', { 'class': 'th' }, _('Internal Addr')),
				E('th', { 'class': 'th' }, _('Internal Port')),
				E('th', { 'class': 'th' }, _('Internet Addr')),
				E('th', { 'class': 'th' }, _('Internet Port')),
				E('th', { 'class': 'th cbi-section-actions' }, '')
			])
		]);

		var maps = JSON.parse(res[0] ? res[0].trim() : null);
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

		return table;
	}
});
