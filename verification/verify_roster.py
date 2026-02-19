import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright
from PIL import Image

PORT = 8083

def start_server():
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_roster():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--disable-web-security"])
        page = browser.new_page()

        # Navigate to local server
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # 1. Verify agents are rendered
        try:
            page.wait_for_selector(".card", timeout=5000)
        except Exception as e:
            print("Timeout waiting for cards.")
            raise e

        cards = page.locator(".card")
        count = cards.count()
        print(f"Found {count} agent cards.")
        if count == 0:
            raise Exception("No agent cards found! Rendering failed.")

        # 2. Verify Search
        search_input = page.locator("#searchInput")
        search_input.fill("Bolt")
        page.wait_for_timeout(500) # Wait for debounce/animation

        # Bolt should be visible, others hidden
        visible_cards = page.locator(".card:visible")
        print(f"Visible cards after search: {visible_cards.count()}")

        # 3. Verify Event Delegation (Toggle Details)
        # Click the details toggle on the first visible card
        toggle_btn = visible_cards.first.locator(".details-toggle")
        toggle_btn.click()
        page.wait_for_timeout(300) # Wait for animation

        # Check if details expanded
        is_expanded = toggle_btn.get_attribute("aria-expanded")
        print(f"Toggle expanded: {is_expanded}")
        if is_expanded != "true":
             raise Exception("Details toggle failed! Event delegation might be broken.")

        # 4. Verify Regression Fixes (Helix & Bolt+)
        # Clear search first to ensure all cards are searchable/visible
        search_input.fill("")
        page.wait_for_timeout(500)

        # Verify Bolt+ description contains merged text
        bolt_card = page.locator(".card", has_text="Bolt+").first
        if not bolt_card.is_visible():
            raise Exception("Bolt+ card not found")

        desc_text = bolt_card.locator(".description").inner_text()
        expected_text = "Scope: Micro-fix + Systemic Strategy"
        if expected_text not in desc_text:
            raise Exception(f"FAIL: Bolt+ description missing merged text. Found: {desc_text}")
        print("PASS: Bolt+ description contains merged text")

        # 5. Take Screenshot
        png_path = "verification/roster_verified.png"
        webp_path = "verification/roster_verified.webp"

        page.screenshot(path=png_path)

        # Convert to WebP
        try:
            img = Image.open(png_path)
            img.save(webp_path, "WEBP")
            os.remove(png_path)
            print(f"Screenshot saved to {webp_path}")
        except Exception as e:
            print(f"Failed to convert screenshot to WebP: {e}")

        browser.close()
        print("✅ Roster verification passed.")

if __name__ == "__main__":
    verify_roster()
