import threading
import http.server
import socketserver
import time
import sys
import re
from playwright.sync_api import sync_playwright, expect

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

def test_search_filtering():
    server_thread = ServerThread()
    server_thread.start()
    # give server a moment to bind and start
    time.sleep(1)
    port = server_thread.port

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Subscribe to console messages for debugging
            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

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

            cards_locator = page.locator(".card")
            initial_count = cards_locator.count()
            print(f"Found {initial_count} cards initially.")

            if initial_count == 0:
                print("No cards found.")
                sys.exit(1)

            search_input = page.locator("#searchInput")
            clear_btn = page.locator("#clearBtn")
            empty_state = page.locator("#emptyState")
            announcer = page.locator("#search-announcer")
            # Note: locator definitions are lazy, so ".card:visible" is evaluated when used/asserted
            visible_cards = page.locator(".card:visible")

            # --- Test Case 1: Happy Path (Search for "Bolt") ---
            print("\n--- Test Case 1: Happy Path (Search for 'Bolt') ---")
            search_input.fill("Bolt")

            # Use expect().to_have_count() to retry until condition is met
            expect(visible_cards).to_have_count(2)
            print(f"Visible cards for 'Bolt': 2 (Verified)")

            # Check announcer text
            expect(announcer).to_contain_text("Found 2 agents")
            print("Announcer text verified.")

            # --- Test Case 2: Case Insensitivity ---
            print("\n--- Test Case 2: Case Insensitivity ---")
            search_input.fill("bolt")
            expect(visible_cards).to_have_count(2)
            print(f"Visible cards for 'bolt': 2 (Verified)")

            search_input.fill("BOLT")
            expect(visible_cards).to_have_count(2)
            print(f"Visible cards for 'BOLT': 2 (Verified)")

            # --- Test Case 3: No Results / Empty State ---
            print("\n--- Test Case 3: No Results / Empty State ---")
            search_input.fill("NonExistentAgentXYZ")

            expect(visible_cards).to_have_count(0)
            print(f"Visible cards for 'NonExistentAgentXYZ': 0 (Verified)")

            # Verify empty state visibility
            # .empty-state toggles display:block via .visible class
            expect(empty_state).to_be_visible()
            print("Empty state visibility verified.")

            # Verify section headers hidden
            expect(page.locator(".section-header:visible")).to_have_count(0)
            print("Section headers hidden verified.")

            # Verify announcer
            expect(announcer).to_contain_text("No agents found")
            print("Announcer text verified.")

            # --- Test Case 4: Clear Search ---
            print("\n--- Test Case 4: Clear Search ---")
            # Verify clear button is visible (since we have text in input)
            # .clear-search-btn toggles opacity via .visible class
            # expect(locator).to_be_visible() might pass for opacity:0 if taking space,
            # but here it uses pointer-events: none too.
            # Safe to check class for opacity transition logic.
            expect(clear_btn).to_have_class(re.compile(r"visible"))
            print("Clear button visibility verified.")

            clear_btn.click()

            # Verify input is cleared
            expect(search_input).to_have_value("")
            print("Search input cleared verified.")

            # Verify all cards are visible
            expect(visible_cards).to_have_count(initial_count)
            print(f"Visible cards after clear: {initial_count} (Verified)")

            # Verify empty state hidden
            expect(empty_state).not_to_be_visible()
            print("Empty state hidden verified.")

            # Verify clear button hidden
            expect(clear_btn).not_to_have_class(re.compile(r"visible"))
            print("Clear button hidden verified.")

            print("\n✅ Search Filtering Test Passed!")
            browser.close()

    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        sys.exit(1)
    finally:
        server_thread.stop()

if __name__ == "__main__":
    test_search_filtering()
