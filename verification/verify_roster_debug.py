from playwright.sync_api import sync_playwright

def verify_roster():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Attach console listener
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        # Use localhost instead of file://
        page.goto("http://localhost:8080/index.html")

        print("Page loaded.")

        try:
            page.wait_for_selector(".card", timeout=2000)
        except:
            print("Timeout waiting for cards.")

        cards = page.locator(".card")
        count = cards.count()
        print(f"Found {count} agent cards.")

        if count > 0:
             # 4. Take Screenshot
            page.screenshot(path="verification/roster_verified_server.png")
            print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_roster()
