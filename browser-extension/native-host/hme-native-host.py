#!/usr/bin/env python3
"""Native Messaging host for Hide My Email browser extension.

Receives iCloud cookies from the extension and configures the HME CLI.
"""

import importlib.machinery
import importlib.util
import json
import os
import struct
import sys

# Import the hme module from the project root (no .py extension)
_project_root = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
_hme_path = os.path.join(_project_root, "hme")
_loader = importlib.machinery.SourceFileLoader("hme_cli", _hme_path)
_spec = importlib.util.spec_from_file_location("hme_cli", _hme_path, loader=_loader)
_hme = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_hme)


def read_message():
    raw = sys.stdin.buffer.read(4)
    if len(raw) < 4:
        return None
    length = struct.unpack("@I", raw)[0]
    return json.loads(sys.stdin.buffer.read(length))


def send_message(msg):
    encoded = json.dumps(msg).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("@I", len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def handle_setup(cookies):
    try:
        config = _hme._save_cookie_and_validate(cookies)
        return {"success": True, "dsid": config.get("dsid", "")}
    except Exception as e:
        return {"success": False, "error": str(e)}


def main():
    msg = read_message()
    if not msg:
        send_message({"success": False, "error": "No message received"})
        return

    action = msg.get("action")
    if action == "setup":
        result = handle_setup(msg.get("cookies", ""))
    else:
        result = {"success": False, "error": f"Unknown action: {action}"}

    send_message(result)


if __name__ == "__main__":
    main()
