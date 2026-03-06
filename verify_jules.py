from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(1000)

        # Click settings btn if present? No, Jules API runner panel is already visible

        # Scroll down to jules runner panel
        page.evaluate("document.getElementById('julesRunnerPanel').scrollIntoView()")
        page.wait_for_timeout(1000)

        page.screenshot(path="jules_runner.png")

        # We can't really click 'Launch in Jules' because there are no repos available or API key

        browser.close()

if __name__ == "__main__":
    run()
