import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8107

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_card_ui():
    # Start server in a separate thread
    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    time.sleep(2) # Give it a moment to start

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(f"http://localhost:{PORT}/index.html")

            # Wait for cards to be rendered (they are dynamically loaded)
            # The skeleton cards are there initially, then replaced.
            # RosterApp.init() -> loadAgents() -> render()
            # We should wait for a real card, e.g. with .agent-title
            page.wait_for_selector(".agent-title", timeout=10000)

            # Wait a bit for animations/transitions
            time.sleep(1)

            # Take a screenshot of the first grid
            grid = page.locator("#coreGrid")
            screenshot_path = "verification/card_ui_verification.png"
            grid.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

            # Also verify computed styles if possible, but visual inspection is key.
            # I'll print computed styles for the first card to the log for debugging.
            card = page.locator(".card").first
            padding = card.evaluate("el => getComputedStyle(el).padding")
            print(f"Card Padding: {padding}")

            title = page.locator(".agent-title").first
            font_size = title.evaluate("el => getComputedStyle(el).fontSize")
            print(f"Title Font Size: {font_size}")

            browser.close()

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e

if __name__ == "__main__":
    verify_card_ui()
