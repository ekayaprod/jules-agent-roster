import time
import threading
import http.server
import socketserver
import re
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

        # 1. Capture Initial State (Visual Slots should be empty)
        # The old #fusionEmptyState is removed, so we check the slots instead
        slotA = page.locator("#slotACard")
        slotB = page.locator("#slotBCard")

        # Use regex to check for 'empty' class
        expect(slotA).to_have_class(re.compile(r"empty"))
        expect(slotB).to_have_class(re.compile(r"empty"))

        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_empty.png")
        print("Captured Empty State: verification/fusion_empty.png")

        # 2. Trigger Self-Fusion Error
        # New interaction: Click visual slot -> Select from modal

        # Select Bolt+ for Slot A
        page.click("#slotACard")
        modal = page.locator("#agentPickerModal")
        expect(modal).to_be_visible()

        # Filter and select
        page.fill("#pickerSearch", "Bolt+")
        # Wait for filtering
        page.wait_for_timeout(500)

        bolt_card = page.locator(".mini-agent-card:has-text('Bolt+')").first
        bolt_card.click()

        # Verify Slot A is filled
        expect(slotA).to_have_class(re.compile(r"filled"))

        # Select Bolt+ for Slot B
        page.click("#slotBCard")
        expect(modal).to_be_visible()
        page.fill("#pickerSearch", "Bolt+")
        page.wait_for_timeout(500)

        # Check if disabled
        bolt_card_b = page.locator(".mini-agent-card:has-text('Bolt+')").first
        classes = bolt_card_b.get_attribute("class")

        if "disabled" in classes:
            print("Self-fusion prevented by UI (Good!)")
            page.screenshot(path="verification/fusion_prevention.png")
        else:
            print("Self-fusion NOT prevented by UI, attempting to force error state...")
            bolt_card_b.click()
            page.click("#fuseBtn")

            # Wait for Error
            error_el = page.locator("#fusionError")
            expect(error_el).to_be_visible()

            # Capture Error State
            page.locator(".fusion-lab-container").screenshot(path="verification/fusion_error.png")
            print("Captured Error State: verification/fusion_error.png")

            # Verify Error Text
            error_text = error_el.inner_text()
            print(f"Error Text: {error_text}")

        browser.close()

if __name__ == "__main__":
    verify_fusion_states()
