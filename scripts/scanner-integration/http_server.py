#!/usr/bin/env python3
"""
Vulnerability scanner HTTP server. Run from your vulnerability-scanner project root so
`from main import VulnerabilityScanner` works.

  cd /path/to/vulnerability-scanner
  python /path/to/remix-of-crimson-connect/scripts/scanner-integration/http_server.py

Then POST /scan with JSON { "target": "192.168.1.1", "quick": true } to run a scan and get JSON back.
Use this URL as SCANNER_URL in Supabase Edge Function secrets (e.g. https://your-server/scan with ngrok).
"""

import json
import sys
import os

# Ensure project root (vulnerability-scanner) is on path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Default: assume we're run from vulnerability-scanner root
SCANNER_ROOT = os.getcwd()
if __name__ == "__main__":
    # Allow override: python http_server.py /path/to/vulnerability-scanner
    if len(sys.argv) > 1:
        SCANNER_ROOT = os.path.abspath(sys.argv[1])
    if SCANNER_ROOT not in sys.path:
        sys.path.insert(0, SCANNER_ROOT)

try:
    from main import VulnerabilityScanner
except ImportError as e:
    print("Run this script from your vulnerability-scanner project root, or pass the path:", file=sys.stderr)
    print("  cd /path/to/vulnerability-scanner && python /path/to/http_server.py", file=sys.stderr)
    print("  python http_server.py /path/to/vulnerability-scanner", file=sys.stderr)
    raise SystemExit(1) from e

try:
    from flask import Flask, request, jsonify
except ImportError:
    print("Flask not found for this Python. Use the same interpreter as pip:", file=sys.stderr)
    print("  python3 -m pip install flask", file=sys.stderr)
    print("  python3", sys.argv[0], file=sys.stderr)
    raise SystemExit(1) from None

app = Flask(__name__)


@app.route("/scan", methods=["POST", "GET"])
def scan():
    target = "127.0.0.1"
    quick = True
    if request.is_json:
        body = request.get_json(silent=True) or {}
        target = body.get("target") or target
        quick = body.get("quick", quick)
    elif request.method == "GET":
        target = request.args.get("target") or target

    options = {
        "port_scan": True,
        "vulnerability_scan": True,
        "web_test": False,
        "port_range": "1-100" if quick else "1-1000",
        "timeout": 2 if quick else 3,
        "max_threads": 100 if quick else 50,
        "output_file": None,
        "output_format": "json",
    }
    scanner = VulnerabilityScanner()
    result = scanner.run_scan([target], options)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"Scanner server at http://0.0.0.0:{port}/scan (POST with {{ \"target\": \"...\", \"quick\": true }})")
    app.run(host="0.0.0.0", port=port, debug=False)
