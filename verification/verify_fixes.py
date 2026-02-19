import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8086

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_fixes():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for cards to load
        page.wait_for_selector(".card")

        # 1. Verify Helix has no diff-list
        # Helix is the 4th agent in the list (index 3), but searching by text is safer.
        helix_card = page.locator(".card", has_text="Helix").first
        if not helix_card.is_visible():
            raise Exception("Helix card not found")

        if helix_card.locator(".diff-list").count() > 0:
            raise Exception("FAIL: Helix card still has .diff-list")
        print("PASS: Helix card has no .diff-list")

        # Screenshot Helix
        helix_card.scroll_into_view_if_needed()
        page.screenshot(path="verification/helix_fixed.png")

        # 2. Verify Bolt+ has no diff-list
        bolt_card = page.locator(".card", has_text="Bolt+").first
        if not bolt_card.is_visible():
            raise Exception("Bolt+ card not found")

        if bolt_card.locator(".diff-list").count() > 0:
            raise Exception("FAIL: Bolt+ card still has .diff-list")
        print("PASS: Bolt+ card has no .diff-list")

        # 3. Verify Bolt+ description contains merged text
        desc_text = bolt_card.locator(".description").inner_text()
        expected_text = "Scope: Micro-fix + Systemic Strategy"
        if expected_text not in desc_text:
            raise Exception(f"FAIL: Bolt+ description missing merged text. Found: {desc_text}")
        print("PASS: Bolt+ description contains merged text")

        # Screenshot Bolt+
        bolt_card.scroll_into_view_if_needed()
        page.screenshot(path="verification/bolt_fixed.png")

        browser.close()
        print("✅ Fixes verification passed.")

if __name__ == "__main__":
    verify_fixes()
