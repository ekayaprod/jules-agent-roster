import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8096 # Using 8096 as per memory or nearby

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_fusion_compiler():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    import json

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Wait for FusionCompiler to be available
        page.wait_for_function("() => typeof FusionCompiler !== 'undefined'")
        print("FusionCompiler loaded.")

        # Instantiate FusionCompiler for testing
        page.evaluate("window.testCompiler = new FusionCompiler([], {})")

        def test_extract(prompt, header):
            # We use JSON.stringify to safely pass strings to evaluate
            return page.evaluate(f"window.testCompiler.extractSection({json.dumps(prompt)}, {json.dumps(header)})")

        # --- Test Scenarios ---
        scenarios = [
            {
                "name": "Happy Path",
                "prompt": "## BOUNDARIES\nContent here",
                "header": "BOUNDARIES",
                "expected": "Content here"
            },
            {
                "name": "Case Insensitivity",
                "prompt": "## boundaries\nContent here",
                "header": "BOUNDARIES",
                "expected": "Content here"
            },
            {
                "name": "Multiple Sections",
                "prompt": "## BOUNDARIES\nContent B\n## PROCESS\nContent P",
                "header": "BOUNDARIES",
                "expected": "Content B"
            },
            {
                "name": "Missing Header",
                "prompt": "## SOMETHING ELSE\nContent",
                "header": "BOUNDARIES",
                "expected": "Section extraction failed. Follow standard constraints."
            },
            {
                "name": "Empty Prompt",
                "prompt": "",
                "header": "BOUNDARIES",
                "expected": "Section extraction failed. Follow standard constraints."
            },
            {
                "name": "Null Prompt",
                "prompt": None,
                "header": "BOUNDARIES",
                "expected": "Prompt data missing."
            },
            {
                "name": "Header at the end",
                "prompt": "## BOUNDARIES",
                "header": "BOUNDARIES",
                "expected": ""
            },
            {
                "name": "Regex injection/Special chars in header",
                "prompt": "## BOUNDARIES (TEST)\nContent",
                "header": "BOUNDARIES (TEST)",
                "expected": "Content" # This might fail if not escaped
            },
            {
                "name": "Next header without space",
                "prompt": "## BOUNDARIES\nContent\n##PROCESS\nMore content",
                "header": "BOUNDARIES",
                "expected": "Content" # This might fail and include ##PROCESS if regex is too strict about '## '
            },
            {
                "name": "Multiple occurrences of same header",
                "prompt": "## BOUNDARIES\nFirst\n## BOUNDARIES\nSecond",
                "header": "BOUNDARIES",
                "expected": "First"
            }
        ]

        failures = 0
        for s in scenarios:
            result = test_extract(s['prompt'], s['header'])
            if result == s['expected']:
                print(f"✅ {s['name']} passed.")
            else:
                print(f"❌ {s['name']} failed. Expected: {json.dumps(s['expected'])}, Got: {json.dumps(result)}")
                failures += 1

        browser.close()

        if failures > 0:
            print(f"\nTotal failures: {failures}")
            exit(1)
        else:
            print("\n✅ All FusionCompiler.extractSection tests passed!")

if __name__ == "__main__":
    verify_fusion_compiler()
