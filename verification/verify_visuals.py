import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8091

def run_server():
    server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
    server.serve_forever()

def verify_visuals():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')

        print("Verifying Fusion Lab Visuals and Microcopy...")

        # 1. Check Select Wrappers
        wrappers = page.locator('.select-wrapper')
        if wrappers.count() == 2:
            print("✅ PASS: Found 2 .select-wrapper elements.")
        else:
            print(f"❌ FAIL: Expected 2 .select-wrapper elements, found {wrappers.count()}.")
            sys.exit(1)

        # 2. Check Custom Arrows
        arrows = page.locator('.select-arrow')
        if arrows.count() == 2:
            print("✅ PASS: Found 2 .select-arrow SVG elements.")
        else:
            print(f"❌ FAIL: Expected 2 .select-arrow SVG elements, found {arrows.count()}.")
            sys.exit(1)

        # 3. Check Placeholders
        # Wait for JS to populate options - use state='attached' because options are hidden
        page.wait_for_selector('#slotA option', state='attached')

        slotA_text = page.locator('#slotA option').first.text_content()
        if "Select Primary Protocol" in slotA_text:
            print(f"✅ PASS: Slot A placeholder is correct: '{slotA_text}'")
        else:
            print(f"❌ FAIL: Slot A placeholder incorrect: '{slotA_text}'")
            sys.exit(1)

        slotB_text = page.locator('#slotB option').first.text_content()
        if "Select Secondary Protocol" in slotB_text:
            print(f"✅ PASS: Slot B placeholder is correct: '{slotB_text}'")
        else:
            print(f"❌ FAIL: Slot B placeholder incorrect: '{slotB_text}'")
            sys.exit(1)

        # 4. Check Button Text
        btn_text = page.locator('#fuseBtn').text_content()
        if "Initialize Fusion Sequence" in btn_text:
            print(f"✅ PASS: Button text is correct: '{btn_text}'")
        else:
            print(f"❌ FAIL: Button text incorrect: '{btn_text}'")
            sys.exit(1)

        # 5. Check Button State (Disabled initially)
        is_disabled = page.locator('#fuseBtn').is_disabled()
        if is_disabled:
            print("✅ PASS: Button is disabled initially.")
        else:
            print("❌ FAIL: Button should be disabled initially.")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    verify_visuals()
