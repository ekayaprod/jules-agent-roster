import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright
from PIL import Image

# --- CONSTANTS ---
SERVER_PORT = 8083
SERVER_START_DELAY_S = 2

# Timeouts
PAGE_LOAD_TIMEOUT_MS = 5000
SEARCH_DEBOUNCE_DELAY_MS = 500
ANIMATION_DELAY_MS = 300

# Selectors
SELECTOR_CARD = ".card"
SELECTOR_SEARCH_INPUT = "#searchInput"
SELECTOR_DETAILS_TOGGLE = ".details-toggle"

# Paths
SCREENSHOT_PNG_PATH = "verification/roster_verified.png"
SCREENSHOT_WEBP_PATH = "verification/roster_verified.webp"


def start_server() -> None:
    """
    Starts a simple HTTP server on the specified port.
    Uses allow_reuse_address to prevent 'Address already in use' errors.
    """
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", SERVER_PORT), handler) as httpd:
        print(f"Serving at port {SERVER_PORT}")
        httpd.serve_forever()


def verify_roster() -> None:
    """
    Runs Playwright verification tests for the Roster App.
    - Verifies page load and card rendering.
    - Verifies search functionality.
    - Verifies event delegation (details toggle).
    - Takes a screenshot on success.
    """
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(SERVER_START_DELAY_S)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=["--disable-web-security"])
        page = browser.new_page()

        # Navigate to local server
        page.goto(f"http://localhost:{SERVER_PORT}/index.html")

        print("Page loaded.")

        # 1. Verify agents are rendered
        try:
            page.wait_for_selector(SELECTOR_CARD, timeout=PAGE_LOAD_TIMEOUT_MS)
        except Exception as e:
            print("Timeout waiting for cards.")
            raise e

        cards = page.locator(SELECTOR_CARD)
        count = cards.count()
        print(f"Found {count} agent cards.")
        if count == 0:
            raise Exception("No agent cards found! Rendering failed.")

        # 2. Verify Search
        search_input = page.locator(SELECTOR_SEARCH_INPUT)
        search_input.fill("Bolt")
        page.wait_for_timeout(SEARCH_DEBOUNCE_DELAY_MS) # Wait for debounce/animation

        # Bolt should be visible, others hidden
        visible_cards = page.locator(f"{SELECTOR_CARD}:visible")
        print(f"Visible cards after search: {visible_cards.count()}")

        # 3. Verify Event Delegation (Toggle Details)
        # Click the details toggle on the first visible card
        toggle_btn = visible_cards.first.locator(SELECTOR_DETAILS_TOGGLE)
        toggle_btn.click()
        page.wait_for_timeout(ANIMATION_DELAY_MS) # Wait for animation

        # Check if details expanded
        is_expanded = toggle_btn.get_attribute("aria-expanded")
        print(f"Toggle expanded: {is_expanded}")
        if is_expanded != "true":
             raise Exception("Details toggle failed! Event delegation might be broken.")

        # 4. Take Screenshot
        page.screenshot(path=SCREENSHOT_PNG_PATH)

        # Convert to WebP
        try:
            img = Image.open(SCREENSHOT_PNG_PATH)
            img.save(SCREENSHOT_WEBP_PATH, "WEBP")
            os.remove(SCREENSHOT_PNG_PATH)
            print(f"Screenshot saved to {SCREENSHOT_WEBP_PATH}")
        except Exception as e:
            print(f"Failed to convert screenshot to WebP: {e}")

        browser.close()
        print("✅ Roster verification passed.")


if __name__ == "__main__":
    verify_roster()
