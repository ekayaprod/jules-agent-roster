import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright, expect

PORT = 8086

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_fusion():
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

        # Select agents
        # Use values as defined in populateFusionDropdowns
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Palette+")

        # Click Fuse
        page.click("#fuseBtn")

        # Wait for output
        output = page.locator("#fusionOutput")
        expect(output).to_be_visible()

        # Verify Header
        name = page.inner_text("#fusionName")
        print(f"Fusion Name: {name}")

        # Screenshot the container
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_lab.png")
        print("Screenshot saved to verification/fusion_lab.png")

        browser.close()

if __name__ == "__main__":
    verify_fusion()
