from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(1000)
        page.click("#closeSettingsBtn")
        page.wait_for_timeout(1000)

        # Find the first card's flip button
        page.click(".flip-card-front[data-index='0']")
        page.wait_for_timeout(1000)

        page.screenshot(path="screenshot_flip.png")
        browser.close()

if __name__ == "__main__":
    run()
