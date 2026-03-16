from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Loading local server...")
        page.goto("http://localhost:8000/")

        print("Waiting for network idle...")
        page.wait_for_load_state('networkidle')

        # Wait for the fusion index to be rendered (it uses DOMUtils)
        print("Waiting for fusion index...")
        page.wait_for_selector('.fusion-index-wrapper', state='visible')

        # Scroll down to ensure it's in view
        page.evaluate("document.querySelector('.fusion-index-wrapper').scrollIntoView()")

        print("Taking screenshot...")
        page.screenshot(path='verification/verification.png', full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_frontend()
