#!/usr/bin/env python3

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Setup Hide My Email
# @raycast.mode compact
# @raycast.packageName iCloud HME

# Optional parameters:
# @raycast.icon 🔑

# Documentation:
# @raycast.description Setup HME session from clipboard cookie
# @raycast.author monzou

import os
import subprocess
import sys

HME_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))), "hme"
)

try:
    result = subprocess.run(
        [sys.executable, HME_PATH, "setup-clipboard"],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode == 0:
        print("Session configured!")
    else:
        error = result.stderr.strip() or "Setup failed"
        print(f"Error: {error}")
except subprocess.TimeoutExpired:
    print("Error: Request timed out")
except Exception as e:
    print(f"Error: {e}")
