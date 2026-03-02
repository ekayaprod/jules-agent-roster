from playwright.sync_api import sync_playwright

def test_aligner():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000")
        page.wait_for_selector(".card")

        # Click the first card to flip it and reveal the action buttons
        card = page.locator(".card").first
        card.click()
        page.wait_for_timeout(500) # Wait for flip animation

        # Take a screenshot of the flipped card
        page.screenshot(path="verification/agent_card_flipped.png")

        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs("verification", exist_ok=True)
    test_aligner()
