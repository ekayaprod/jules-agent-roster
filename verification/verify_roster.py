import os
from playwright.sync_api import sync_playwright

def verify_roster():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open the local index.html file
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        print("Page loaded.")

        # 1. Verify agents are rendered
        # We expect card elements to exist
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

        # 4. Take Screenshot
        page.screenshot(path="verification/roster_verified.png")
        print("Screenshot saved to verification/roster_verified.png")

        browser.close()

if __name__ == "__main__":
    verify_roster()
