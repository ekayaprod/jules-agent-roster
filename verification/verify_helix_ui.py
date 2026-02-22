from playwright.sync_api import sync_playwright, expect
import time
import sys

def verify_helix_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to localhost:8080...")
        page.goto("http://localhost:8080")

        # Wait for agents to load
        print("Waiting for cards...")
        page.wait_for_selector(".card")

        # Search for Helix to filter the view
        print("Searching for Helix...")
        page.fill("#searchInput", "Helix")

        # Wait for filtering
        time.sleep(1)

        # Find the Helix card
        helix_card = page.locator(".card").filter(has_text="Helix").first
        if not helix_card.is_visible():
            print("❌ Helix card not visible")
            sys.exit(1)

        print("Helix card found.")

        # Click "Show Prompt"
        print("Expanding details...")
        toggle = helix_card.locator(".details-toggle")
        toggle.click()

        # Wait for expansion
        expect(helix_card.locator(".details-content")).to_be_visible()

        # Check if the text contains the new tactics
        content = helix_card.locator(".details-content").text_content()
        print(f"Content snippet: {content[:100]}...")

        if "[TACTIC: Role Priming]" not in content:
            print("❌ Tactic tags not found in UI")
            print(f"Full content: {content}")
            sys.exit(1)

        print("✅ Tactic tags found in UI")

        # Take screenshot
        page.screenshot(path="verification/helix_card.png")
        print("Screenshot saved to verification/helix_card.png")

        browser.close()

if __name__ == "__main__":
    verify_helix_ui()
