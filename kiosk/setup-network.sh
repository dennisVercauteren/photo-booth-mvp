#!/usr/bin/env bash
# The booth service runs without a login session, so NetworkManager refuses to let it scan or
# join Wi-Fi from the staff menu ("permission rule missing"). This polkit rule allows exactly
# those Wi-Fi actions for the kiosk user, nothing else. Safe to run again.
# Run as the kiosk user (not root); it asks for sudo once. Optional argument: the service user.
set -euo pipefail

user="${1:-$USER}"
rule=/etc/polkit-1/rules.d/50-photobooth-network.rules
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

cat > "$tmp" <<RULE
// Photobooth: let the booth service (user $user, no login session) scan and join Wi-Fi from the staff menu.
polkit.addRule(function (action, subject) {
  if (subject.user !== "$user") return;
  var allowed = [
    "org.freedesktop.NetworkManager.network-control",
    "org.freedesktop.NetworkManager.wifi.scan",
    "org.freedesktop.NetworkManager.enable-disable-wifi",
    "org.freedesktop.NetworkManager.settings.modify.own",
    "org.freedesktop.NetworkManager.settings.modify.system"
  ];
  if (allowed.indexOf(action.id) >= 0) return polkit.Result.YES;
});
RULE

sudo install -m 644 -o root -g root "$tmp" "$rule"
echo "Wi-Fi permission rule for user $user installed in $rule"
