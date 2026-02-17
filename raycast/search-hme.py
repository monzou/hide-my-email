#!/usr/bin/env python3

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Search Hide My Email
# @raycast.mode compact
# @raycast.packageName iCloud HME

# Optional parameters:
# @raycast.icon 📧
# @raycast.argument1 { "type": "text", "placeholder": "Search (label or note)" }

# Documentation:
# @raycast.description Search iCloud Hide My Email addresses by label or note
# @raycast.author monzou

import os
import subprocess
import sys

HME_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))), "hme"
)

query = sys.argv[1] if len(sys.argv) > 1 else ""
if not query:
    print("Error: No search query provided")
    sys.exit(1)

try:
    result = subprocess.run(
        [sys.executable, HME_PATH, "search", "--clipboard", query],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode == 0:
        first_line = result.stdout.strip().split("\n")[0]
        print(f"Copied: {first_line}")
    else:
        error = result.stderr.strip() or "No matches found"
        print(f"Error: {error}")
except subprocess.TimeoutExpired:
    print("Error: Request timed out")
except Exception as e:
    print(f"Error: {e}")
