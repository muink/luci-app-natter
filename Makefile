# Natter by MikeWang000000 <https://github.com/MikeWang000000/Natter>
# Copyright (C) 2022 muink <https://github.com/muink>
#
# This is free software, licensed under the GNU General Public License v3.
# See /LICENSE for more information.
#
include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-natter
PKG_VERSION:=0.9-20221202

LUCI_TITLE:=LuCI Support for Natter
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+natter

LUCI_DESCRIPTION:=Open Port under FullCone NAT (NAT 1)

define Package/$(LUCI_NAME)/conffiles
endef

define Package/$(LUCI_NAME)/postinst
endef

define Package/$(LUCI_NAME)/prerm
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
