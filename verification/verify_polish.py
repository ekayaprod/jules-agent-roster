import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8084

def start_server():
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        pass # Port already in use

def verify_polish():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to local server
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        print("Page loaded.")

        # 1. Verify "View Prompt" text (Wordsmith)
        # Currently it says "Show Details", so this should fail if not updated
        try:
            view_prompt_btn = page.locator("button.details-toggle span", has_text="View Prompt").first
            if view_prompt_btn.count() > 0:
                print("✅ Found 'View Prompt' text.")
            else:
                print("❌ 'View Prompt' text NOT found (Expected for baseline).")
        except Exception as e:
             print(f"❌ Error checking text: {e}")

        # 2. Verify Copy Icon (Curator)
        # Currently no .copy-icon, so this should fail
        try:
            copy_icon = page.locator(".copy-icon").first
            if copy_icon.count() > 0:
                print("✅ Found .copy-icon.")
            else:
                print("❌ .copy-icon NOT found (Expected for baseline).")
        except Exception as e:
            print(f"❌ Error checking icon: {e}")

        # 3. Verify Active State (Palette+)
        # Toggle a button and check for .active class on card
        try:
            toggle_btn = page.locator(".details-toggle").first
            toggle_btn.click()
            page.wait_for_timeout(300)

            card = toggle_btn.locator("xpath=../..") # Parent card? No, sibling structure.
            # Structure: .card > .details-toggle
            # Actually toggle is a child of card.
            # Let's find the card container.
            card = page.locator(".card").first

            # Check if card has class 'active'
            classes = card.get_attribute("class")
            if "active" in classes:
                print("✅ Card has 'active' class.")
            else:
                print(f"❌ Card classes: '{classes}'. 'active' NOT found (Expected for baseline).")

        except Exception as e:
             print(f"❌ Error checking active state: {e}")

        browser.close()

if __name__ == "__main__":
    verify_polish()
