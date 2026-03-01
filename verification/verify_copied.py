from playwright.sync_api import sync_playwright

def test_copied_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/index.html")
            page.wait_for_selector(".card")

            # Find a copy button. It seems it has a 'data-index' attribute or a role
            copy_btn = page.locator("#copyAllBtn")
            copy_btn.click()

            # Wait for the toast to appear
            page.wait_for_selector(".toast.show")

            # Take a screenshot
            page.screenshot(path="verification/toast_and_button.png")

        finally:
            browser.close()

if __name__ == "__main__":
    test_copied_button()
