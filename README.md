# Hide My Email CLI

Generate iCloud [Hide My Email](https://support.apple.com/en-us/105078) addresses from the command line — no browser required after initial setup. Includes a browser extension for automatic cookie sync and [Raycast](https://raycast.com/) Script Commands for one-keystroke access.

## Why

Creating a Hide My Email address outside Safari means logging into icloud.com, navigating to settings, and clicking through several screens. This tool reduces that to a single command (or a single Raycast keystroke).

## Requirements

- macOS (uses `pbcopy` for clipboard)
- Python 3.7+
- An iCloud account with Hide My Email (requires iCloud+ or Apple Developer)

## Setup

### 1. Install

```bash
git clone https://github.com/monzou/hide-my-email.git
cd hide-my-email
chmod +x hme
```

Optionally symlink into your PATH:

```bash
ln -s "$(pwd)/hme" /usr/local/bin/hme
```

### 2. Authenticate

There are two ways to authenticate. Your Apple ID password is never stored or transmitted by this tool.

#### Option A: Browser extension (recommended)

The browser extension automatically syncs iCloud session cookies whenever you visit icloud.com. No manual cookie copying required.

1. Open your browser's extensions page (e.g. `chrome://extensions`, `atlas://extensions`)
2. Enable **Developer mode** and click **Load unpacked** → select the `browser-extension/` folder
3. Copy the **Extension ID** shown on the extensions page
4. Register the Native Messaging host:

```bash
cd browser-extension/native-host
./install.sh <extension-id>
```

5. Open [icloud.com](https://www.icloud.com) and log in — the extension syncs cookies automatically

The extension works with Chrome, Edge, Brave, and ChatGPT Atlas (any Chromium-based browser).

#### Option B: Manual setup

```bash
./hme setup
```

Then follow the on-screen instructions:

1. icloud.com opens automatically — log in if needed
2. Open DevTools (`Cmd+Option+I`) → **Network** tab
3. Reload (`Cmd+R`)
4. Click any request → Headers → Request Headers → right-click `Cookie` → **Copy value**
5. Come back to the terminal and press Enter (the cookie is read from your clipboard)

The tool validates the session against Apple's API and caches the response. Config is stored at `~/.config/hide-my-email/config.json` with `0600` permissions.

### 3. Raycast (optional)

Open Raycast Settings → Extensions → Script Commands → Add Directory → select the `raycast/` folder.

Four commands become available:

| Command | Mode | Description |
|---|---|---|
| **Setup Hide My Email** | compact | Configures session (browser extension or clipboard cookie) |
| **Generate Hide My Email** | compact | Creates a new address, copies to clipboard |
| **Search Hide My Email** | compact | Searches by label/note, copies first match |
| **List Hide My Email** | fullOutput | Shows all existing addresses |

## Usage

### Generate

```bash
# Generate and copy to clipboard
./hme generate

# With a label
./hme generate --label "GitHub"

# With label and note
./hme generate -l "Acme Corp" -n "Trial signup"

# Without clipboard copy
./hme generate --no-clipboard
```

The generated address is printed to stdout. All status/error messages go to stderr, so the output is safe to pipe:

```bash
EMAIL=$(./hme generate -l "CI test")
```

### List

```bash
./hme list
```

```
abc123@privaterelay.appleid.com  (GitHub)  -> you@icloud.com
def456@privaterelay.appleid.com  (Acme Corp)  -> you@icloud.com  [inactive]
```

### Search

```bash
# Search by label or note (copies first match to clipboard)
./hme search "GitHub"

# Without clipboard copy
./hme search "Acme" --no-clipboard
```

### Refresh session

When cookies expire (typically after a few weeks), re-run setup or simply visit icloud.com with the browser extension installed:

```bash
./hme refresh
```

## Exit Codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Usage error (no command specified) |
| 2 | Authentication error (expired/invalid cookie) |
| 3 | Configuration error (missing config, corrupt file) |
| 4 | API error (unexpected response from iCloud) |
| 5 | Network error (connectivity issue) |
| 6 | No results (search returned no matches) |

## Project Structure

```
hide-my-email/
├── hme                                  # CLI tool (Python 3, stdlib only)
├── browser-extension/
│   ├── manifest.json                    # Manifest V3
│   ├── background.js                    # Auto-detect iCloud cookies and sync
│   ├── popup.html                       # Extension popup UI
│   ├── popup.js                         # Popup logic
│   └── native-host/
│       ├── hme-native-host.py           # Native Messaging host
│       └── install.sh                   # Register native host for your browser
└── raycast/
    ├── setup-hme.py                     # Raycast: session setup
    ├── generate-hme.py                  # Raycast: generate + clipboard
    ├── search-hme.py                    # Raycast: search by label/note
    └── list-hme.py                      # Raycast: list addresses
```

## Security

- **No password stored.** Authentication uses browser session cookies, not your Apple ID credentials.
- **Config file is owner-only** (`0600`) and written atomically to prevent corruption.
- **No external dependencies.** The CLI uses only Python standard library (`urllib`, `json`, `argparse`).
- **All traffic goes directly to Apple's servers** (`setup.icloud.com`, `*.icloud.com`). No third-party services involved.
- **Native Messaging host** runs on-demand (not a persistent process) and only accepts messages from the registered extension ID.

## License

MIT
