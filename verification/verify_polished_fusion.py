import time
import threading
import http.server
import socketserver
import re
from playwright.sync_api import sync_playwright, expect

PORT = 8100

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_polished_fusion():
    # Start server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # 1. Verify Empty State Text
        empty_state = page.locator("#fusionEmptyState p")
        expect(empty_state).to_contain_text("ignite a powerful new protocol")
        page.locator(".fusion-lab-container").screenshot(path="verification/polished_empty_state.png")
        print("Captured Empty State")

        # 2. Verify Error State (Self-Fusion)
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Bolt+")
        page.click("#fuseBtn")

        error_el = page.locator("#fusionError")
        expect(error_el).to_be_visible()
        expect(error_el).to_contain_text("Unstable Reaction")

        page.locator(".fusion-lab-container").screenshot(path="verification/polished_error_state.png")
        print("Captured Error State")

        # 3. Verify Loading State (Mocking latency or catching it quickly)
        # We'll use a valid fusion but take a screenshot immediately after click
        page.reload()
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Palette+")

        # Click and immediately screenshot
        page.click("#fuseBtn")
        # We need to wait for the button to have .loading class
        btn = page.locator("#fuseBtn")
        expect(btn).to_have_class(re.compile(r"loading"))
        expect(btn).to_contain_text("Igniting Protocol")

        page.locator(".fusion-lab-container").screenshot(path="verification/polished_loading_state.png")
        print("Captured Loading State")

        browser.close()

if __name__ == "__main__":
    verify_polished_fusion()
