import sys
from playwright.sync_api import sync_playwright

def test_click_behavior(page):
    page.goto("http://localhost:8080")

    # Wait for the app to initialize
    page.wait_for_selector(".flip-card")

    # Mock window.julesService so settings modal doesn't pop up
    page.evaluate("window.localStorage.setItem('jules_api_key', 'mock_key');")
    page.goto("http://localhost:8080")
    page.wait_for_selector(".flip-card")

    # Get the first card
    card = page.locator(".flip-card").first

    # Simulate a touch start and move to simulate scrolling (which should NOT trigger a click)
    card_box = card.bounding_box()
    x, y = card_box["x"] + card_box["width"] / 2, card_box["y"] + card_box["height"] / 2

    # Touch sequence
    page.mouse.move(x, y)
    page.mouse.down()
    page.mouse.move(x, y - 100) # Simulate swipe up
    page.mouse.up()

    # Wait a bit
    page.wait_for_timeout(500)

    # Check if the card flipped (it should NOT have flipped because we simulated a scroll, not a clean click)
    is_flipped_after_scroll = "flipped" in card.get_attribute("class")

    # Now simulate a clean click
    card.click()
    page.wait_for_timeout(500)

    is_flipped_after_click = "flipped" in card.get_attribute("class")

    print(f"Flipped after scroll (should be False): {is_flipped_after_scroll}")
    print(f"Flipped after click (should be True): {is_flipped_after_click}")

    if not is_flipped_after_scroll and is_flipped_after_click:
        print("SUCCESS: Click behavior is correct.")
        page.screenshot(path="screenshot_flip.png")
    else:
        print("FAILURE: Click behavior is incorrect.")
        page.screenshot(path="screenshot_flip_error.png")
        sys.exit(1)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_click_behavior(page)
        finally:
            browser.close()
