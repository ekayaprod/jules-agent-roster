import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8092

def run_server():
    server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
    server.serve_forever()

def capture_cards():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')

        print("Capturing Agent Cards (Efficient)...")

        # Wait for the grid to populate
        page.wait_for_selector('.card', state='attached')

        # Take a screenshot of the grid area
        grid = page.locator('#coreGrid')
        if grid.count() > 0:
            grid.screenshot(path='verification/cards_efficient.png')
            print("✅ Captured cards_efficient.png")
        else:
            print("❌ FAIL: No #coreGrid found.")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    capture_cards()
