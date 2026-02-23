import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8099

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_refactor():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Wait for initial render (skeletons gone, cards present)
        page.wait_for_selector(".card", timeout=10000)

        # Take screenshot of full roster
        page.screenshot(path="verification/roster_loaded.png", full_page=True)
        print("Screenshot saved: verification/roster_loaded.png")

        # Test Filter Transition
        print("Testing filter transition...")
        page.fill("#searchInput", "Bolt")

        # Take screenshot during transition (approx) - tough to catch exact moment but we can try
        time.sleep(0.1)
        page.screenshot(path="verification/roster_filtering.png")
        print("Screenshot saved: verification/roster_filtering.png")

        # Wait for transition to finish
        time.sleep(0.5)
        page.screenshot(path="verification/roster_filtered.png")
        print("Screenshot saved: verification/roster_filtered.png")

        browser.close()

if __name__ == "__main__":
    verify_refactor()
