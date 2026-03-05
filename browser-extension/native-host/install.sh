#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_NAME="com.hide_my_email.native"
HOST_PATH="$SCRIPT_DIR/hme-native-host.py"

usage() {
  echo "Usage: $0 <extension-id> [browser]"
  echo ""
  echo "  extension-id  The extension ID shown in the browser's extensions page"
  echo "  browser       chrome (default), edge, brave, chromium"
  echo "                Atlas uses Chrome's path automatically."
  echo ""
  echo "Example:"
  echo "  $0 abcdefghijklmnopqrstuvwxyz123456"
}

if [ $# -lt 1 ]; then
  usage
  exit 1
fi

EXT_ID="$1"
BROWSER="${2:-chrome}"

case "$BROWSER" in
  chrome|atlas) MANIFEST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts" ;;
  edge)         MANIFEST_DIR="$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts" ;;
  brave)        MANIFEST_DIR="$HOME/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts" ;;
  chromium)     MANIFEST_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts" ;;
  *)
    echo "Error: Unknown browser '$BROWSER'"
    echo "Supported: chrome, edge, brave, chromium"
    exit 1
    ;;
esac

mkdir -p "$MANIFEST_DIR"

cat > "$MANIFEST_DIR/$HOST_NAME.json" << EOF
{
  "name": "$HOST_NAME",
  "description": "Hide My Email CLI - browser cookie sync",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$EXT_ID/"
  ]
}
EOF

chmod +x "$HOST_PATH"

echo "Installed native messaging host"
echo "  Manifest: $MANIFEST_DIR/$HOST_NAME.json"
echo "  Host:     $HOST_PATH"
