import os
from playwright.sync_api import sync_playwright
from PIL import Image

def verify_roster():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Use localhost instead of file://
        page.goto("http://localhost:8080/index.html")

        print("Page loaded.")

        # 1. Verify agents are rendered
        # We expect card elements to exist
        try:
            page.wait_for_selector(".card", timeout=2000)
        except:
            print("Timeout waiting for cards.")

        cards = page.locator(".card")
        count = cards.count()
        print(f"Found {count} agent cards.")
        if count == 0:
            # Debug: Check console logs
            print("Checking console logs...")
            page.on("console", lambda msg: print(f"Console: {msg.text}"))
            # Reload to trigger logs
            page.reload()
            page.wait_for_timeout(1000)
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
        png_path = "verification/roster_verified_server.png"
        webp_path = "verification/roster_verified_server.webp"

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

if __name__ == "__main__":
    verify_roster()
