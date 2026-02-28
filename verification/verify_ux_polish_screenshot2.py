import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8122

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_empty_state_screenshot():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for cards to load
        page.wait_for_selector(".card", timeout=5000)

        # Trigger empty state by searching for nonsense
        page.fill("#searchInput", "XYZ_NONSENSE_QUERY_123")
        page.wait_for_timeout(500) # Wait for debounce

        # Wait for empty state to be visible
        page.wait_for_selector("#emptyState:not([hidden])", timeout=5000)

        # Scroll empty state into view
        page.locator("#emptyState").scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        # Take a screenshot
        page.screenshot(path="verification/screenshots/main_empty_state2.png")
        print("Screenshot saved to verification/screenshots/main_empty_state2.png")

        browser.close()

if __name__ == "__main__":
    verify_empty_state_screenshot()
