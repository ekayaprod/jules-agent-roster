import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright
import json

PORT = 8093

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        # Port might be in use if script runs too fast after another
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

        # Ensure RosterApp is initialized
        page.wait_for_function("() => window.rosterApp !== undefined")
        print("RosterApp initialized.")

        # Helper to run validation
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

        print("\n--- TEST CASE 1: Valid JSON ---")
        valid_json = {
            "phase1": {
                "thought_process": "Analysis complete.",
                "output": "Code refactored."
            },
            "phase2": {
                "thought_process": "Tests written.",
                "output": "Tests passed."
            },
            "pr_title": "feat: fusion complete"
        }
        res = run_validation(valid_json)
        if not res["success"]:
            raise Exception(f"Failed to validate valid JSON: {res['error']}")
        print("PASS: Valid JSON accepted.")

        print("\n--- TEST CASE 2: Valid JSON String ---")
        res_str = run_validation(json.dumps(valid_json))
        if not res_str["success"]:
            raise Exception(f"Failed to validate valid JSON string: {res_str['error']}")
        print("PASS: Valid JSON string accepted.")

        print("\n--- TEST CASE 3: Malformed JSON String ---")
        res_malformed = run_validation("{ 'phase1': ... invalid ... }")
        if res_malformed["success"]:
             raise Exception("Malformed JSON should have failed!")
        print(f"PASS: Malformed JSON rejected. Error: {res_malformed['error']}")

        print("\n--- TEST CASE 4: Missing Phase 2 ---")
        invalid_missing_phase = {
            "phase1": {
                "thought_process": "...",
                "output": "..."
            },
            "pr_title": "..."
        }
        res_missing = run_validation(invalid_missing_phase)
        if res_missing["success"]:
            raise Exception("Missing 'phase2' should have failed!")
        print(f"PASS: Missing field rejected. Error: {res_missing['error']}")

        print("\n--- TEST CASE 5: Missing Inner Field ---")
        invalid_inner = {
            "phase1": {
                "output": "..."
                # Missing thought_process
            },
            "phase2": {
                "thought_process": "...",
                "output": "..."
            },
            "pr_title": "..."
        }
        res_inner = run_validation(invalid_inner)
        if res_inner["success"]:
            raise Exception("Missing inner field should have failed!")
        print(f"PASS: Missing inner field rejected. Error: {res_inner['error']}")

        print("\n✅ All Polygraph Interrogations Passed.")
        browser.close()

if __name__ == "__main__":
    verify_polygraph()
