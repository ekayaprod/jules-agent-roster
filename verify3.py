from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(2000)
        cards = page.locator(".card").count()
        print(f"Number of cards: {cards}")

        # also print console logs
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        browser.close()

if __name__ == "__main__":
    run()
