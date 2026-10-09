#!/usr/bin/env bash
# Booth touchscreens must deliver real touch events to Chromium (swipe-scrolling), never
# emulated mouse events. Raspberry Pi OS ships labwc rules with mouseEmulation="yes" per
# known panel; this turns them all off and adds a catch-all for any other (new) touchscreen.
# Safe to run again. Run as the kiosk user (not root).
set -euo pipefail

rc="$HOME/.config/labwc/rc.xml"
mkdir -p "$(dirname "$rc")"
[ -f "$rc" ] || cp /etc/xdg/labwc/rc.xml "$rc"
cp "$rc" "$rc.bak-$(date +%Y%m%d-%H%M%S)"

sed -i 's/mouseEmulation="yes"/mouseEmulation="no"/g' "$rc"
if ! grep -q '<touch deviceName="" ' "$rc"; then
  sed -i 's#</openbox_config>#  <!-- Photobooth: any other touchscreen gets real touch, never mouse emulation. -->\n  <touch deviceName="" mouseEmulation="no" />\n</openbox_config>#' "$rc"
fi

python3 -c "import sys, xml.etree.ElementTree as E; E.parse(sys.argv[1])" "$rc"
pkill -HUP -x labwc 2>/dev/null || true
echo "Touch set to real touch (no mouse emulation) in $rc"
