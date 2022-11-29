#!/bin/sh
#
# Author: muink
# Github: https://github.com/muink/luci-app-natter
#
[ "$1" == "0" ] && port= || port="$1"
[ -n "$2" ] && output="> $2"

# ref: https://github.com/muink/openwrt-Natter/blob/master/Makefile#L57
uci show firewall | grep "name='NatTypeTest'" >/dev/null
if [ "$?" == "1" ]; then
	section=$(uci add firewall rule)
	uci -q batch <<-EOF >/dev/null
		set firewall.$section.name='NatTypeTest'
		set firewall.$section.src='wan'
		set firewall.$section.dest_port='3456'
		set firewall.$section.target='ACCEPT'
		commit firewall
	EOF
fi

/etc/init.d/firewall restart >/dev/null 2>&1

eval "natter --check-nat $port 2>&1 | sed -En \"/(UDP|TCP): \[/{s,.+(UDP|TCP): \[(.+)\]\$,\1:\2,g p}\" $output"
