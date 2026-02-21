import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright, expect

PORT = 8089

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_ux_enhancements():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        print("Page loaded.")

        # --- Test 1: Accordion Animation Polish ---
        print("\nTest 1: Checking Accordion Animation Polish...")
        # Check if .details-content has the transform property
        details_content = page.locator(".details-content").first

        # We need to check computed style
        transform = page.evaluate("el => getComputedStyle(el).transform", details_content.element_handle())
        # Ideally it should be 'matrix(1, 0, 0, 1, 0, -10)' or similar for translateY(-10px) when hidden
        # But initial state is hidden, so let's just check if the rule exists in CSS or computed style.
        # Actually, let's check if the transition property includes transform.
        transition = page.evaluate("el => getComputedStyle(el).transition", details_content.element_handle())

        if "transform" in transition or "all" in transition:
            print("✅ Accordion has transition on transform.")
        else:
            print(f"❌ Accordion missing transition on transform. Found: {transition}")
            # We don't exit here, we continue to test other things, but this counts as fail.

        # --- Test 2: Fusion Button Disabled State ---
        print("\nTest 2: Checking Fusion Button Disabled State...")
        fuse_btn = page.locator("#fuseBtn")

        if fuse_btn.is_disabled():
             print("✅ Fuse button is disabled by default.")
        else:
             print("❌ Fuse button is ENABLED by default (Should be disabled).")

        # --- Test 3: Fusion Button Enable Logic ---
        print("\nTest 3: Checking Fusion Button Enable Logic...")
        page.select_option("#slotA", value="Bolt+")

        if fuse_btn.is_disabled():
             print("✅ Fuse button still disabled with 1 slot.")
        else:
             print("❌ Fuse button ENABLED with only 1 slot!")

        page.select_option("#slotB", value="Palette+")

        if not fuse_btn.is_disabled():
             print("✅ Fuse button enabled with 2 slots.")
        else:
             print("❌ Fuse button still DISABLED with 2 slots!")

        # --- Test 4: Focus Management after Fusion ---
        print("\nTest 4: Checking Focus Management after Fusion...")
        # Click fuse
        fuse_btn.click()

        # Wait for animation (approx 3.5s)
        print("Waiting for fusion animation...")
        time.sleep(4)

        # Check active element
        active_id = page.evaluate("document.activeElement.id")
        print(f"Active Element ID: {active_id}")

        if active_id == "fusionName":
             print("✅ Focus moved to Fusion Name header.")
        else:
             print(f"❌ Focus did NOT move to Fusion Name header. Active: {active_id}")

        browser.close()

if __name__ == "__main__":
    verify_ux_enhancements()
