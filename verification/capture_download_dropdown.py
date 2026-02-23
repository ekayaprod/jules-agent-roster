import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8098

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def capture_dropdown():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            page.goto(f"http://localhost:{PORT}/index.html")
            page.wait_for_selector(".card", timeout=5000)

            # Click dropdown to open
            page.click("#downloadDropdownBtn")
            page.wait_for_selector("#downloadDropdownMenu.visible", timeout=1000)

            # Take screenshot of the header area
            header = page.locator(".header")
            header.screenshot(path="verification/dropdown_open.png")
            print("Screenshot saved to verification/dropdown_open.png")

            browser.close()

    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    capture_dropdown()
