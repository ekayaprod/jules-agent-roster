from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000")
        page.wait_for_selector(".fusion-lab-container", timeout=5000)
        print("Success loading page")
        browser.close()

if __name__ == "__main__":
    run()
