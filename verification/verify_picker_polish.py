import os
import time
from playwright.sync_api import sync_playwright

PORT = 8130

def verify_picker_polish():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print(f"Navigating to http://localhost:{PORT}")
        page.goto(f"http://localhost:{PORT}")

        # 1. Open Picker
        print("Opening picker for Slot A...")
        page.wait_for_selector("#slotACard")

        # Use evaluate click to force open if needed
        page.evaluate("document.getElementById('slotACard').click()")

        # 2. Assert Header Text
        print("Verifying Header Text...")
        # Just wait for visibility of header
        page.wait_for_selector(".picker-header h3")

        header_text = page.text_content(".picker-header h3")
        assert header_text == "Select Fusion Protocol", f"Expected 'Select Fusion Protocol', got '{header_text}'"

        # 3. Assert Search Placeholder
        print("Verifying Search Placeholder...")
        placeholder = page.get_attribute("#pickerSearch", "placeholder")
        assert placeholder == "Filter protocols by name or role...", f"Expected placeholder 'Filter protocols by name or role...', got '{placeholder}'"

        # 4. Verify Empty State
        print("Testing Empty State...")
        page.type("#pickerSearch", "xyz_nonexistent_agent", delay=100)

        try:
            # Wait for element to not be hidden
            page.wait_for_selector("#pickerEmptyState:not([hidden])", timeout=5000)
        except:
            is_hidden = page.evaluate("document.getElementById('pickerEmptyState').hidden")
            print(f"DEBUG: pickerEmptyState hidden property is: {is_hidden}")
            page.screenshot(path="verification/screenshots/debug_empty_state_fail.png")
            raise

        empty_title = page.text_content("#pickerEmptyState .empty-title")
        assert empty_title == "No Fusion Protocols Found", f"Expected 'No Fusion Protocols Found', got '{empty_title}'"

        empty_desc = page.text_content("#pickerEmptyState .empty-desc")
        assert "We couldn't locate any agents matching your search" in empty_desc, f"Unexpected empty state description: {empty_desc}"

        if not os.path.exists("verification/screenshots"):
            os.makedirs("verification/screenshots")
        page.screenshot(path="verification/screenshots/picker_empty_state.png")

        # 5. Select Agent A
        print("Selecting Agent A...")
        page.fill("#pickerSearch", "")

        # Wait for grid
        page.wait_for_selector(".mini-agent-card[data-name='architect']:not([hidden])")

        # Force JS click
        page.evaluate("document.querySelector(\".mini-agent-card[data-name='architect']\").click()")

        # Wait for slot to be filled
        page.wait_for_selector("#slotACard.filled")

        # 6. Verify Disabled State in Slot B Picker
        print("Opening picker for Slot B...")
        page.evaluate("document.getElementById('slotBCard').click()")
        page.wait_for_selector(".picker-header h3")

        # Find the Architect card in the new picker
        architect_card = page.locator(".mini-agent-card[data-name='architect']")

        # Assert class contains 'disabled'
        classes = architect_card.get_attribute("class")
        assert "disabled" in classes, "Architect card should be disabled in Slot B picker"

        # Assert cursor style
        cursor = architect_card.evaluate("element => getComputedStyle(element).cursor")
        assert cursor == "not-allowed", f"Expected cursor 'not-allowed', got '{cursor}'"

        # Assert title attribute
        title = architect_card.get_attribute("title")
        assert title == "Protocol already active in opposing slot.", f"Unexpected title: {title}"

        # Capture screenshot of disabled state
        page.screenshot(path="verification/screenshots/picker_disabled_state.png")

        print("✅ All verification steps passed!")
        browser.close()

if __name__ == "__main__":
    verify_picker_polish()
