from playwright.sync_api import sync_playwright

def verify_download():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.goto("http://localhost:8080/index.html")
        print("Page loaded.")

        # Wait for agents to be rendered (implies data loaded)
        try:
            page.wait_for_selector(".card", timeout=5000)
            print("Cards rendered.")
        except:
             print("Cards failed to render or timed out.")

        # Wait a bit more to ensure bindEvents finished
        page.wait_for_timeout(1000)

        # Check if button exists in DOM
        btn_exists = page.evaluate("!!document.getElementById('downloadAllBtn')")
        print(f"Button exists in DOM: {btn_exists}")

        if not btn_exists:
            raise Exception("Button not found in DOM via JS!")

        # Take screenshot of the controls area before click
        try:
            page.locator(".controls").screenshot(path="verification/controls_before.png")
        except:
            print("Could not take controls screenshot")

        # Check if click handler is attached by invoking click
        print("Clicking button via JS...")
        page.evaluate("document.getElementById('downloadAllBtn').click()")

        # Wait a bit for toast
        page.wait_for_timeout(1000)

        # Check toast
        toast = page.locator("#toast")
        if toast.is_visible():
            toast_text = toast.text_content()
            print(f"Toast message: {toast_text}")
            if "downloaded" not in toast_text.lower():
                 raise Exception("Toast message incorrect!")
        else:
             print("Toast not visible")
             raise Exception("Toast not visible!")

        # Take screenshot of the whole page
        page.screenshot(path="verification/download_verification.png")
        print("Screenshot saved to verification/download_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_download()
