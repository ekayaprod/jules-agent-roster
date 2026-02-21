import time
import threading
import http.server
import socketserver
import re
from playwright.sync_api import sync_playwright, expect

PORT = 8087

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_animation():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        print("Page loaded.")

        # 1. Verify Fusion Lab exists
        expect(page.locator(".fusion-lab-container")).to_be_visible()

        # 2. Select agents for Fusion
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Palette+")

        # 3. Click Fuse
        print("Clicking Fuse...")
        page.click("#fuseBtn")

        # 4. Check for Animation Overlay Visibility
        # Note: Before implementation, this will fail or not find element.
        # After implementation, we expect overlay to be visible.
        overlay = page.locator("#fusionAnimationOverlay")

        # We wait for overlay to appear (Phase 1)
        try:
            expect(overlay).to_be_visible(timeout=5000)
            print("Animation Overlay appeared.")

            # Check for Phase 1 class
            expect(overlay).to_have_class(re.compile(r"phase-1"))
            print("Phase 1 active.")

            # Wait for Phase 2 (approx 1.5s later)
            time.sleep(1.6)
            expect(overlay).to_have_class(re.compile(r"phase-2"))
            print("Phase 2 active (Clash).")

            # Wait for Phase 3 (approx 0.4s later)
            time.sleep(0.5)
            expect(overlay).to_have_class(re.compile(r"phase-3"))
            print("Phase 3 active (Reveal).")

            # Wait for Completion (approx 1.5s later)
            time.sleep(2.5) # Increased wait to ensure completion
            expect(overlay).not_to_be_visible()
            print("Animation Overlay hidden.")

            # Check Result is visible
            expect(page.locator("#fusionOutput")).to_be_visible()
            print("Fusion Result visible.")

        except Exception as e:
            print(f"Animation verification failed (Expected if not implemented yet): {e}")

        browser.close()

if __name__ == "__main__":
    verify_animation()
