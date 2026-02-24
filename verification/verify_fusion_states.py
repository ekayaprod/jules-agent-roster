import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright, expect

PORT = 8092

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_fusion_states():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        print("Page loaded.")

        # 1. Capture Initial Empty State
        empty_state = page.locator("#fusionEmptyState")
        expect(empty_state).to_be_visible()
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_empty.png")
        print("Captured Empty State: verification/fusion_empty.png")

        # 2. Trigger Self-Fusion Error
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Bolt+")

        # Click Fuse
        page.click("#fuseBtn")

        # Wait for Error
        error_el = page.locator("#fusionError")
        expect(error_el).to_be_visible()

        # Capture Error State
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_error.png")
        print("Captured Error State: verification/fusion_error.png")

        # Verify Error Text
        error_text = page.inner_text("#fusionErrorText")
        print(f"Error Text: {error_text}")

        browser.close()

if __name__ == "__main__":
    verify_fusion_states()
