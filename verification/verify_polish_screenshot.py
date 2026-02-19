import os
import time
import threading
import http.server
import socketserver
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

def verify_polish_visual():
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

        print("Page loaded.")

        # Focus on the first card
        card = page.locator(".card").first
        card.scroll_into_view_if_needed()

        # Hover over the toggle button
        toggle_btn = card.locator(".details-toggle")
        toggle_btn.hover()
        page.wait_for_timeout(300) # Wait for transition

        # Take screenshot of hover state
        page.screenshot(path="verification/polish_hover.png")
        print("Saved verification/polish_hover.png")

        # Click to expand
        toggle_btn.click()
        page.wait_for_timeout(500) # Wait for expansion

        # Take screenshot of expanded state
        page.screenshot(path="verification/polish_expanded.png")
        print("Saved verification/polish_expanded.png")

        browser.close()

if __name__ == "__main__":
    verify_polish_visual()
