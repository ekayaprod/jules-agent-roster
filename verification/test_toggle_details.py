import threading
import http.server
import socketserver
import time
import sys
from playwright.sync_api import sync_playwright

# Use port 0 to let the OS assign a free port
PORT = 0

class ServerThread(threading.Thread):
    def __init__(self):
        super().__init__()
        # Allow address reuse to prevent "Address already in use" errors
        socketserver.TCPServer.allow_reuse_address = True
        self.httpd = socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler)
        self.port = self.httpd.server_address[1]
        self.daemon = True

    def run(self):
        print(f"Starting server on port {self.port}...")
        self.httpd.serve_forever()

    def stop(self):
        print("Stopping server...")
        self.httpd.shutdown()
        self.httpd.server_close()

def test_toggle_details():
    server_thread = ServerThread()
    server_thread.start()
    port = server_thread.port

    # Give server a moment to start
    time.sleep(1)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            url = f"http://localhost:{port}/index.html"
            print(f"Navigating to {url}")
            page.goto(url)

            # Wait for agents to load
            print("Waiting for agent cards...")
            try:
                page.wait_for_selector(".card", timeout=5000)
            except Exception as e:
                print(f"Timeout waiting for cards: {e}")
                sys.exit(1)

            cards = page.locator(".card")
            count = cards.count()
            print(f"Found {count} cards.")

            if count == 0:
                print("No cards found.")
                sys.exit(1)

            # Test logic on the first card
            first_card = cards.first
            toggle_btn = first_card.locator(".details-toggle")
            details_grid = first_card.locator(".details-grid")

            print("Verifying initial state...")
            # Initial State: Should be collapsed
            assert toggle_btn.get_attribute("aria-expanded") == "false", "Initial aria-expanded should be false"
            assert "Show Details" in toggle_btn.inner_text(), "Initial text should be 'Show Details'"
            assert "expanded" not in details_grid.get_attribute("class"), "Initial class should not have 'expanded'"

            # Click to Expand
            print("Clicking to expand...")
            toggle_btn.click()
            page.wait_for_timeout(300) # Wait for transition

            # Expanded State
            print("Verifying expanded state...")
            assert toggle_btn.get_attribute("aria-expanded") == "true", "Expanded aria-expanded should be true"
            assert "Hide Details" in toggle_btn.inner_text(), "Expanded text should be 'Hide Details'"
            assert "expanded" in details_grid.get_attribute("class"), "Expanded class should be present"

            # Click to Collapse
            print("Clicking to collapse...")
            toggle_btn.click()
            page.wait_for_timeout(300) # Wait for transition

            # Collapsed State Again
            print("Verifying collapsed state...")
            assert toggle_btn.get_attribute("aria-expanded") == "false", "Collapsed aria-expanded should be false"
            assert "Show Details" in toggle_btn.inner_text(), "Collapsed text should be 'Show Details'"
            assert "expanded" not in details_grid.get_attribute("class"), "Collapsed class should not be present"

            print("✅ Toggle Details Test Passed!")
            browser.close()

    except Exception as e:
        print(f"Test Failed: {e}")
        sys.exit(1)
    finally:
        server_thread.stop()

if __name__ == "__main__":
    test_toggle_details()
