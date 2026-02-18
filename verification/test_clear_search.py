from playwright.sync_api import sync_playwright

def test_clear_search():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load the page from the local server
        page.goto("http://localhost:8080/index.html")
        print("Page loaded.")

        # Ensure agents are loaded
        page.wait_for_selector(".card", timeout=5000)
        initial_count = page.locator(".card").count()
        print(f"Initial agent count: {initial_count}")
        if initial_count == 0:
             raise Exception("No agents loaded initially.")

        # 1. Search for non-existent agent
        search_input = page.locator("#searchInput")
        search_input.fill("NonExistentAgentZzZ")
        page.wait_for_timeout(500) # Wait for debounce/animation

        # Verify empty state
        empty_state = page.locator("#emptyState")
        if not empty_state.is_visible():
            raise Exception("Empty state not visible after search for non-existent agent.")

        print("Empty state visible.")

        # Verify no cards visible
        visible_cards = page.locator(".card:visible").count()
        if visible_cards > 0:
            raise Exception(f"Found {visible_cards} visible cards, expected 0.")

        # 2. Click Clear Search button in Empty State
        clear_btn = page.locator("#emptyStateClearBtn")
        if not clear_btn.is_visible():
             raise Exception("Clear Search button in empty state not visible.")

        clear_btn.click()
        page.wait_for_timeout(500) # Wait for animation

        # 3. Verify Search Cleared
        current_value = search_input.input_value()
        if current_value != "":
             raise Exception(f"Search input not cleared. Value: '{current_value}'")

        print("Search input cleared.")

        # Verify agents are visible again
        visible_cards_after = page.locator(".card:visible").count()
        print(f"Visible cards after clear: {visible_cards_after}")
        if visible_cards_after != initial_count:
             raise Exception(f"Not all agents visible after clear. Expected {initial_count}, got {visible_cards_after}")

        print("Test Passed: Clear Search functionality verified.")
        browser.close()

if __name__ == "__main__":
    test_clear_search()
