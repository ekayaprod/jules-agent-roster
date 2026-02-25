import threading
import time
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8126

def run_server():
    server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
    server.serve_forever()

def verify_lazy_loading():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')

        print("Verifying Lazy Loading of Agent Details...")

        # Wait for cards to render
        page.wait_for_selector('.card')

        # Get the first card
        card = page.locator('.card').first

        # Get the details container
        details = card.locator('.details-overflow')

        # Check if empty initially
        initial_content = details.inner_html()
        if not initial_content.strip():
            print("✅ PASS: Details container is initially empty.")
        else:
            print(f"❌ FAIL: Details container should be empty, but found: {initial_content[:50]}...")
            sys.exit(1)

        # Click 'Show Prompt'
        toggle_btn = card.locator('[data-action="toggle-details"]')
        toggle_btn.click()

        # Wait for expansion (and potentially rendering)
        # We can check if content is populated
        # Give it a small moment for innerHTML update (it's synchronous, but good to be safe)
        page.wait_for_timeout(100)

        updated_content = details.inner_html()
        if updated_content.strip():
             print("✅ PASS: Details container populated after click.")
             # Check if it contains expected structure (legacy or structured)
             if "details-content" in updated_content or "prompt-section" in updated_content:
                 print("✅ PASS: Content structure looks correct.")
             else:
                 print("⚠️ WARN: Content populated but structure unclear.")
        else:
             print("❌ FAIL: Details container still empty after click.")
             sys.exit(1)

        # Check visibility
        # The parent .details-grid should have class 'expanded'
        grid = card.locator('.details-grid')
        if "expanded" in grid.get_attribute("class"):
            print("✅ PASS: Grid expanded.")
        else:
            print("❌ FAIL: Grid did not expand.")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    verify_lazy_loading()
