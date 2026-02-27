import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8133

def run_server():
    try:
        server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
        server.serve_forever()
    except OSError:
        print(f"Port {PORT} in use, assuming server running.")

def capture_hero_visuals():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto(f'http://localhost:{PORT}/index.html')
        except Exception as e:
            print(f"Failed to load page: {e}")
            sys.exit(1)

        print("Capturing Hero Banner Visuals...")

        # Wait for fade-in animation to complete
        page.wait_for_timeout(1000)

        # Locate the header containing the hero banner
        header = page.locator('.header')

        # Take a screenshot of the header
        screenshot_path = "verification/hero_banner_optimized.png"
        header.screenshot(path=screenshot_path)
        print(f"📸 Captured {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    capture_hero_visuals()
