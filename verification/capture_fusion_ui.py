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

def capture_fusion_ui():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Verify Fusion Lab section exists
        expect(page.locator(".fusion-lab-container")).to_be_visible()

        # Trigger Error: Self-Fusion
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Bolt+")
        page.click("#fuseBtn")

        # Wait for error message
        error_locator = page.locator("#fusionError")
        expect(error_locator).to_be_visible()

        # Capture error screenshot
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_error_state.png")
        print("Captured error state: verification/fusion_error_state.png")

        # Reset selection
        page.select_option("#slotB", value="Palette+")

        # Trigger Loading State (Simulated via script for screenshot timing)
        page.click("#fuseBtn")

        # Quickly capture loading state (before it finishes)
        # We rely on the 400ms delay in handleFusion
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_loading_state.png")
        print("Captured loading state: verification/fusion_loading_state.png")

        browser.close()

if __name__ == "__main__":
    capture_fusion_ui()
