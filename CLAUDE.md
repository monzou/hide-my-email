# Hide My Email CLI

## Overview

Manage iCloud Hide My Email addresses from CLI, Raycast, and browser extension.

## Architecture

- `hme` — CLI built with Python 3 stdlib only. Communicates with iCloud API (`setup.icloud.com`, `premiummailsettings`)
- `browser-extension/` — Manifest V3 browser extension. Auto-detects iCloud cookies and sends them to `hme` via Native Messaging
- `raycast/` — Raycast Script Commands. Thin wrappers around the `hme` CLI
- Config: `~/.config/hide-my-email/config.json` (0600)

## Key Files

| File | Role |
|---|---|
| `hme` | CLI entry point (extensionless Python script) |
| `browser-extension/background.js` | Service worker: cookie detection + Native Messaging |
| `browser-extension/native-host/hme-native-host.py` | Native Messaging host: calls `_save_cookie_and_validate()` from `hme` |
| `browser-extension/native-host/install.sh` | Registers native host in `~/Library/Application Support/.../NativeMessagingHosts/` |

## Conventions

- No external dependencies (Python stdlib only)
- `hme` has no `.py` extension. Import via `importlib.machinery.SourceFileLoader`
- Cookies must contain `X-APPLE-WEBAUTH-*`. Validated by `_save_cookie_and_validate()`
- Native Messaging host name: `com.hide_my_email.native`
- ChatGPT Atlas shares Chrome's NativeMessagingHosts path

## Auth Flow

1. Browser extension: visit icloud.com → `chrome.cookies.getAll({domain: ".icloud.com"})` → Native Messaging → `_save_cookie_and_validate()` → config.json
2. Manual: copy Cookie to clipboard → `hme setup-clipboard` → config.json
3. On cookie expiry: revisiting icloud.com auto-resyncs (when extension is installed)
