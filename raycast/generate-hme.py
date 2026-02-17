#!/usr/bin/env python3

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Generate Hide My Email
# @raycast.mode compact
# @raycast.packageName iCloud HME

# Optional parameters:
# @raycast.icon 📧
# @raycast.argument1 { "type": "text", "placeholder": "Label (site name)", "optional": true }

# Documentation:
# @raycast.description Generate a new iCloud Hide My Email address and copy to clipboard
# @raycast.author monzou

import os
import subprocess
import sys

HME_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))), "hme"
)

label = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else ""

cmd = [sys.executable, HME_PATH, "generate", "--clipboard"]
if label:
    cmd.extend(["--label", label])

try:
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode == 0:
        address = result.stdout.strip()
        if label:
            print(f"Copied: {address} ({label})")
        else:
            print(f"Copied: {address}")
    else:
        error = result.stderr.strip() or "Unknown error"
        print(f"Error: {error}")
except subprocess.TimeoutExpired:
    print("Error: Request timed out")
except Exception as e:
    print(f"Error: {e}")
