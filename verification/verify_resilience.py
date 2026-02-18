import threading
import http.server
import socketserver
import time
import json
from playwright.sync_api import sync_playwright

PORT = 8084

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_resilience():
    # Start server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--disable-web-security"])

        # Test 1: Successful Load (Baseline)
        print("\n--- Test 1: Baseline Success ---")
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        try:
            page.wait_for_selector(".card", timeout=5000)
            print("✅ Baseline: Cards loaded successfully.")
        except:
            print("❌ Baseline: Cards failed to load.")
            raise
        page.close()

        # Test 2: Network Failure & Retry
        print("\n--- Test 2: Network Failure & Retry ---")
        page = browser.new_page()

        # Intercept agents.json to fail twice then succeed
        failures = 0
        def handle_route(route):
            nonlocal failures
            if failures < 2:
                print(f"Simulating failure {failures + 1}...")
                failures += 1
                route.abort("failed")
            else:
                print("Allowing request...")
                route.continue_()

        page.route("**/agents.json", handle_route)

        start_time = time.time()
        page.goto(f"http://localhost:{PORT}/index.html")

        try:
            # Should take some time due to backoff (300ms + 600ms = 900ms min delay)
            page.wait_for_selector(".card", timeout=10000)
            elapsed = time.time() - start_time
            print(f"✅ Retry: Cards loaded after {elapsed:.2f}s (should be > 0.9s).")
            if failures == 2:
                print("✅ Retry logic triggered correctly.")
            else:
                print(f"❌ Retry logic suspect: failures={failures}")
        except:
            print("❌ Retry: Cards failed to load.")
            raise
        page.close()

        # Test 3: Invalid JSON (Validation)
        print("\n--- Test 3: Invalid JSON Validation ---")
        page = browser.new_page()

        # Intercept agents.json to return bad data
        bad_data = [
            {"name": "Good Agent", "category": "core", "promptFile": "prompts/good.md", "role": "Tester", "desc": "Tests things"}, # Valid
            {"name": "Bad Agent", "category": "invalid_cat", "promptFile": "prompts/bad.md"}, # Invalid category
            {"name": "Incomplete Agent", "category": "core"} # Missing promptFile
        ]

        page.route("**/agents.json", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(bad_data)
        ))

        # Mock prompt file for the good agent
        page.route("**/prompts/good.md", lambda route: route.fulfill(body="Good prompt"))

        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for potential rendering
        time.sleep(2)

        cards = page.locator(".card")
        count = cards.count()
        print(f"Cards rendered: {count}")

        # Expect 1 valid card
        if count == 1:
            print("✅ Validation: Only valid agents rendered.")
            text = cards.first.inner_text()
            if "Good Agent" in text:
                 print("✅ Validation: Correct agent rendered.")
            else:
                 print(f"❌ Validation: Unexpected agent content: {text}")
        else:
            print(f"❌ Validation Failed: Expected 1 card, got {count}.")
            for i in range(count):
                print(f"Card {i}: {cards.nth(i).inner_text()}")

        page.close()
        browser.close()

if __name__ == "__main__":
    verify_resilience()
