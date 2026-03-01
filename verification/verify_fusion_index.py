from playwright.sync_api import sync_playwright

def test_fusion_index():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Start a local server to serve the static files
        import subprocess
        import time
        server = subprocess.Popen(["python3", "-m", "http.server", "3000"])
        time.sleep(2) # Wait for server to start

        try:
            page.goto("http://localhost:3000/index.html")

            # Wait for Fusion Lab to load and become visible
            page.wait_for_selector(".fusion-slot")

            # Take a screenshot of the fusion index
            page.screenshot(path="verification/fusion_index_test.png")
            print("Screenshot saved to verification/fusion_index_test.png")

        finally:
            server.terminate()
            browser.close()

if __name__ == "__main__":
    test_fusion_index()
