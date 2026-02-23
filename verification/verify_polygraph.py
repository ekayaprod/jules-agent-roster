import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright
import json

PORT = 8095  # Changed port

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        pass

def verify_polygraph():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        print("Page loaded.")

        page.wait_for_function("() => window.rosterApp && window.rosterApp.fusionCompiler")
        print("RosterApp initialized.")

        def run_validation(data):
            return page.evaluate(f"""
                (data) => {{
                    try {{
                        const res = window.rosterApp.fusionCompiler.validateFusionOutput(data);
                        return {{ success: true, data: res }};
                    }} catch (e) {{
                        return {{ success: false, error: e.message }};
                    }}
                }}
            """, data)

        print("\n--- TEST CASE 1: Valid JSON (Upgraded Schema) ---")
        valid_json = {
            "phase1": {
                "thought_process": "Analysis complete.",
                "output": "Code refactored."
            },
            "phase2": {
                "thought_process": "Tests written.",
                "output": "Tests passed."
            },
            "pr_title": "feat: fusion complete",
            "confidence_score": 0.95,
            "warnings": ["minor complexity increase"]
        }
        res = run_validation(valid_json)
        if not res["success"]:
            raise Exception(f"Failed to validate valid JSON: {res['error']}")
        print("PASS: Valid JSON accepted.")

        print("\n--- TEST CASE 2: Missing Confidence Score ---")
        invalid_no_conf = {
            "phase1": valid_json["phase1"],
            "phase2": valid_json["phase2"],
            "pr_title": "feat: fail",
            "warnings": []
        }
        res_no_conf = run_validation(invalid_no_conf)
        if res_no_conf["success"]:
            raise Exception("Missing 'confidence_score' should have failed!")
        print(f"PASS: Missing confidence_score rejected. Error: {res_no_conf['error']}")

        print("\n--- TEST CASE 3: Invalid Confidence Score (String) ---")
        invalid_conf_type = valid_json.copy()
        invalid_conf_type["confidence_score"] = "high"
        res_conf_type = run_validation(invalid_conf_type)
        if res_conf_type["success"]:
             raise Exception("String 'confidence_score' should have failed!")
        print(f"PASS: Invalid confidence_score type rejected. Error: {res_conf_type['error']}")

        print("\n--- TEST CASE 4: Invalid Confidence Score (Out of Range) ---")
        invalid_conf_range = valid_json.copy()
        invalid_conf_range["confidence_score"] = 1.5
        res_conf_range = run_validation(invalid_conf_range)
        if res_conf_range["success"]:
             raise Exception("Out of range 'confidence_score' should have failed!")
        print(f"PASS: Out of range confidence_score rejected. Error: {res_conf_range['error']}")

        print("\n--- TEST CASE 5: Missing Warnings ---")
        invalid_no_warn = valid_json.copy()
        del invalid_no_warn["warnings"]
        res_no_warn = run_validation(invalid_no_warn)
        if res_no_warn["success"]:
             raise Exception("Missing 'warnings' should have failed!")
        print(f"PASS: Missing warnings rejected. Error: {res_no_warn['error']}")

        print("\n✅ All Polygraph Interrogations Passed (Strict Schema Enforced).")
        browser.close()

if __name__ == "__main__":
    verify_polygraph()
