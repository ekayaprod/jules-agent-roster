from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(1000)
        page.click("#closeSettingsBtn")
        page.wait_for_timeout(1000)
        page.screenshot(path="screenshot2.png")
        browser.close()

if __name__ == "__main__":
    run()