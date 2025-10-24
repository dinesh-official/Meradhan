#!/usr/bin/env bash
# Change OpenRGB keyboard color based on Caps Lock state

DEVICE_ID=0            # your keyboard device number from `openrgb --list`
COLOR_ON="red"
COLOR_OFF="white"

# Function to update color
update_color() {
  if xset q | grep -q "Caps Lock: *on"; then
    openrgb -d "$DEVICE_ID" -c "$COLOR_ON" >/dev/null 2>&1
  else
    openrgb -d "$DEVICE_ID" -c "$COLOR_OFF" >/dev/null 2>&1
  fi
}

# Run once at start
update_color

# Listen for key events
gdbus monitor --system --dest org.freedesktop.login1 | \
grep --line-buffered "Lock" | \
while read -r _; do
  update_color
done
