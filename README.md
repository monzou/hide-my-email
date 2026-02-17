# Hide My Email CLI

Generate iCloud [Hide My Email](https://support.apple.com/en-us/105078) addresses from the command line — no browser required after initial setup. Includes [Raycast](https://raycast.com/) Script Commands for one-keystroke access.

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

The tool uses session cookies from an existing browser login — your Apple ID password is never stored or transmitted by this tool.

```bash
./hme setup
```

Then follow the on-screen instructions:

1. Open https://www.icloud.com and log in
2. Open DevTools (F12) → **Network** tab
3. Click any request → copy the `Cookie` request header value
4. Paste into the terminal prompt

The tool validates the session against Apple's API and caches the response. Config is stored at `~/.config/hide-my-email/config.json` with `0600` permissions.

### 3. Raycast (optional)

Open Raycast Settings → Extensions → Script Commands → Add Directory → select the `raycast/` folder.

Two commands become available:

| Command | Mode | Description |
|---|---|---|
| **Generate Hide My Email** | compact | Creates a new address, copies to clipboard |
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

### Refresh session

When cookies expire (typically after a few weeks), re-run setup:

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

## Project Structure

```
hide-my-email/
├── hme                       # CLI tool (Python 3, stdlib only)
└── raycast/
    ├── generate-hme.py       # Raycast: generate + clipboard
    └── list-hme.py           # Raycast: list addresses
```

## Security

- **No password stored.** Authentication uses browser session cookies, not your Apple ID credentials.
- **Config file is owner-only** (`0600`) and written atomically to prevent corruption.
- **No external dependencies.** The CLI uses only Python standard library (`urllib`, `json`, `argparse`).
- **All traffic goes directly to Apple's servers** (`setup.icloud.com`, `*.icloud.com`). No third-party services involved.

## License

MIT
