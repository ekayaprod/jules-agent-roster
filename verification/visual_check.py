import time
import threading
import http.server
import socketserver
import sys
from playwright.sync_api import sync_playwright

PORT = 8086

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

def verify_visual():
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

        # Focus the search input to show the new ring style
        page.focus("#searchInput")
        time.sleep(0.5)

        # Take screenshot of the header controls
        header = page.locator(".header")
        header.screenshot(path="verification/controls_visual.png")

        print("Screenshot saved to verification/controls_visual.png")
        browser.close()

if __name__ == "__main__":
    verify_visual()
