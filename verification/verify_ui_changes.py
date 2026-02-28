import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8108

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_ui():
    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(f"http://localhost:{PORT}/index.html")
            page.wait_for_selector(".agent-title", timeout=10000)
            time.sleep(1)

            # Screenshot grid
            grid = page.locator("#coreGrid")
            screenshot_path = "verification/grid_centered.png"
            grid.screenshot(path=screenshot_path)
            print(f"Grid screenshot saved to {screenshot_path}")

            # Screenshot nav
            nav = page.locator(".category-nav")
            nav_screenshot_path = "verification/nav_no_scrollbar.png"
            nav.screenshot(path=nav_screenshot_path)
            print(f"Nav screenshot saved to {nav_screenshot_path}")

            browser.close()

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e

if __name__ == "__main__":
    verify_ui()
