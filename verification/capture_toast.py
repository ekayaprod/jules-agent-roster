import time
import threading
import http.server
import socketserver
import sys
from playwright.sync_api import sync_playwright

PORT = 8105

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        pass

def capture_toast():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        # Show Success Toast
        page.evaluate("window.rosterApp.toast.show('Success: Agent Copied', 'success', 0)")
        page.locator("#toast").wait_for(state="visible")
        # Small delay for animation
        time.sleep(0.5)
        page.screenshot(path="verification/toast_success.png")
        print("Captured verification/toast_success.png")

        # Show Error Toast
        page.evaluate("window.rosterApp.toast.show('Error: Fusion Failed', 'error', 0)")
        time.sleep(0.5) # Wait for transition
        page.screenshot(path="verification/toast_error.png")
        print("Captured verification/toast_error.png")

        # Show Info Toast
        page.evaluate("window.rosterApp.toast.show('Info: Update Available', 'info', 0)")
        time.sleep(0.5)
        page.screenshot(path="verification/toast_info.png")
        print("Captured verification/toast_info.png")

        browser.close()

if __name__ == "__main__":
    capture_toast()
