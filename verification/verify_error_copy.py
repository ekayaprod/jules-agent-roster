from playwright.sync_api import sync_playwright

def verify_toast(page):
    page.goto("http://localhost:3000")
    # To test the error message from AgentRepository, we can mock the fetch response or intentionally cause a failure.
    # Since we are testing UI copy changes that happen on error, let's inject a script that directly calls the error handling logic,
    # or rename agents.json to force an error.
    pass

if __name__ == "__main__":
    import os
    import time

    # Temporarily rename agents.json to trigger HTTP error
    os.rename("agents.json", "agents.json.bak")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto("http://localhost:3000")

            # Wait for the empty state to appear
            page.wait_for_selector(".empty-state.visible", timeout=5000)

            # Take screenshot of the error state
            page.screenshot(path="verification/error_state.png")

            browser.close()
    finally:
        # Restore agents.json
        os.rename("agents.json.bak", "agents.json")
