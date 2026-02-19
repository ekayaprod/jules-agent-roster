import os
import time
import threading
import http.server
import socketserver
import sys
from playwright.sync_api import sync_playwright

PORT = 8087

def start_server():
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        pass # Port already in use

def verify_visuals():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to local server
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        # Screenshot 1: Button Text
        print("Taking screenshot of buttons...")
        page.screenshot(path="verification/wordsmith_buttons.png")

        # Screenshot 2: Empty State
        print("Triggering empty state...")
        page.fill("#searchInput", "NonExistentAgentXYZ")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/wordsmith_empty_state.png")

        browser.close()

if __name__ == "__main__":
    verify_visuals()
