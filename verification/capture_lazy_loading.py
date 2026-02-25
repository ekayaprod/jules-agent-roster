import threading
import time
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8127

def run_server():
    server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
    server.serve_forever()

def capture_lazy_loading():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')

        print("Capturing Lazy Loading of Agent Details...")

        # Wait for cards to render
        page.wait_for_selector('.card')

        # Get the first card
        card = page.locator('.card').first

        # Take screenshot of collapsed state
        card.screenshot(path="verification/lazy_load_collapsed.png")
        print("Captured collapsed state.")

        # Click 'Show Prompt'
        toggle_btn = card.locator('[data-action="toggle-details"]')
        toggle_btn.click()

        # Wait for expansion and rendering
        time.sleep(1) # Visual wait

        # Take screenshot of expanded state
        card.screenshot(path="verification/lazy_load_expanded.png")
        print("Captured expanded state.")

        browser.close()

if __name__ == "__main__":
    capture_lazy_loading()
