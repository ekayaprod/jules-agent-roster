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

def capture_ui():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')

        # Wait for the select wrappers to be present
        page.wait_for_selector('.fusion-lab-container')

        # Scroll to view
        element = page.locator('.fusion-lab-container')
        element.scroll_into_view_if_needed()

        # Capture screenshot of the container
        screenshot_path = 'verification/fusion_lab_new.png'
        element.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    capture_ui()
