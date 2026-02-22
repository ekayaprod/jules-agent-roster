import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright, expect

PORT = 8094

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_search_filter():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Wait for initial render
        page.wait_for_selector(".card", timeout=5000)
        initial_count = page.locator(".card").count()
        print(f"Initial card count: {initial_count}")
        if initial_count == 0:
            raise Exception("No cards found initially!")

        search_input = page.locator("#searchInput")
        clear_btn = page.locator("#clearBtn")
        empty_state = page.locator("#emptyState")

        # --- Test 1: Basic Search (Happy Path) ---
        print("\n--- Test 1: Basic Search ---")
        search_input.fill("Bolt")
        page.wait_for_timeout(500) # Wait for debounce/animation

        visible_cards = page.locator(".card:visible")
        visible_count = visible_cards.count()
        print(f"Visible cards for 'Bolt': {visible_count}")

        # Verify only Bolt matches are shown
        for i in range(visible_count):
            text = visible_cards.nth(i).inner_text().lower()
            if "bolt" not in text:
                 raise Exception(f"FAIL: Search leaked non-matching card: {text}")

        expect(visible_cards.first).to_contain_text("Bolt")
        print("✅ Basic Search passed.")

        # --- Test 2: Case Insensitivity ---
        print("\n--- Test 2: Case Insensitivity ---")
        search_input.fill("BOLT") # All caps
        page.wait_for_timeout(500)

        visible_count_upper = page.locator(".card:visible").count()
        if visible_count_upper != visible_count:
             raise Exception(f"FAIL: Case sensitivity mismatch. 'Bolt': {visible_count}, 'BOLT': {visible_count_upper}")
        print("✅ Case Insensitivity passed.")

        # --- Test 3: Partial Match ---
        print("\n--- Test 3: Partial Match ---")
        search_input.fill("Navigator") # Specific match
        page.wait_for_timeout(500)

        visible_cards_nav = page.locator(".card:visible")
        if visible_cards_nav.count() == 0:
            raise Exception("FAIL: Partial match 'Navigator' returned no results.")

        first_card_text = visible_cards_nav.first.inner_text().lower()
        if "navigator" not in first_card_text:
             raise Exception(f"FAIL: Partial match 'Navigator' did not find expected result. Found: {first_card_text}")
        print("✅ Partial Match passed.")

        # --- Test 4: No Results ---
        print("\n--- Test 4: No Results ---")
        search_input.fill("XYZ_NON_EXISTENT_AGENT_123")
        page.wait_for_timeout(500)

        visible_cards_none = page.locator(".card:visible").count()
        if visible_cards_none > 0:
             raise Exception(f"FAIL: Expected 0 results, got {visible_cards_none}")

        expect(empty_state).to_be_visible()
        print("✅ No Results (Empty State) passed.")

        # --- Test 5: Clear Search ---
        print("\n--- Test 5: Clear Search ---")
        expect(clear_btn).to_be_visible()
        clear_btn.click()
        page.wait_for_timeout(500)

        final_count = page.locator(".card:visible").count()
        if final_count != initial_count:
             raise Exception(f"FAIL: Clear search did not restore all cards. Expected {initial_count}, got {final_count}")

        expect(empty_state).not_to_be_visible()
        expect(search_input).to_have_value("")
        print("✅ Clear Search passed.")

        # --- Test 6: Focus Management ---
        print("\n--- Test 6: Focus Management ---")
        # Verify focus is back on input
        expect(search_input).to_be_focused()
        print("✅ Focus Management passed.")

        # --- Test 7: Special Characters ---
        print("\n--- Test 7: Special Characters ---")
        search_input.fill("Bolt+")
        page.wait_for_timeout(500)

        visible_cards_plus = page.locator(".card:visible")
        count_plus = visible_cards_plus.count()

        if count_plus == 0:
             raise Exception("FAIL: Search for 'Bolt+' returned no results.")

        first_text_plus = visible_cards_plus.first.inner_text()
        if "Bolt+" not in first_text_plus:
             raise Exception(f"FAIL: Search for 'Bolt+' did not prioritize exact match. Found: {first_text_plus}")

        print("✅ Special Characters passed.")

        browser.close()
        print("\n✅ All search & filter tests passed!")

if __name__ == "__main__":
    verify_search_filter()
