import http.server
import socketserver
import threading
import time
from playwright.sync_api import sync_playwright

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1) # wait for server to start

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/")

        # wait for render
        time.sleep(2)

        # 1. Check aria-labels
        assert page.locator('#slotACard').get_attribute('aria-label') == 'Select Primary Protocol'
        assert page.locator('#slotBCard').get_attribute('aria-label') == 'Select Secondary Protocol'
        assert page.locator('#fuseBtn').get_attribute('aria-label') == 'Fuse Selected Protocols'
        assert page.locator('#masterCopyBtn').get_attribute('aria-label') == 'Copy All Core Prompts to Clipboard'
        assert page.locator('#masterDropdownBtn').get_attribute('aria-label') == 'Toggle Export Options'
        assert page.locator('#masterDownloadCoreBtn').get_attribute('aria-label') == 'Download Core Prompts as JSON'
        assert page.locator('#masterCopyFusionsBtn').get_attribute('aria-label') == 'Copy Unlocked Fusions to Clipboard'
        assert page.locator('#masterDownloadFusionsBtn').get_attribute('aria-label') == 'Download Unlocked Fusions as JSON'
        assert page.locator('#closePickerBtn').get_attribute('aria-label') == 'Close Protocol Selection'
        assert page.locator('#clearSearchEmptyBtn').get_attribute('aria-label') == 'Clear Search Filters'

        # 2. Trigger empty state
        page.locator('#searchInput').type('asdasdasdasd', delay=50)
        time.sleep(1)

        # check empty state text
        empty_title = page.locator('#emptyState h2').inner_text()
        assert empty_title == 'No Protocols Found', f"Expected 'No Protocols Found', got '{empty_title}'"

        empty_desc = page.locator('#emptyState p').inner_text()
        assert empty_desc == "We couldn't find any protocols matching your search. Clear your filters to explore the matrix.", f"Expected 'We couldn't find any protocols matching your search. Clear your filters to explore the matrix.', got '{empty_desc}'"

        # take screenshot of empty state
        page.screenshot(path="verification_empty.png")

        # 3. To test error state, we can use route interception to abort fetching agents.json
        page2 = browser.new_page()
        page2.route("**/agents.json", lambda route: route.abort())
        page2.goto(f"http://localhost:{PORT}/")
        time.sleep(2)

        error_title = page2.locator('.empty-title').inner_text()
        assert error_title == 'Unable to Load Protocols', f"Expected 'Unable to Load Protocols', got '{error_title}'"
        error_desc = page2.locator('.empty-desc').inner_text()
        assert error_desc == 'Check your internet connection and refresh the page.', f"Expected 'Check your internet connection and refresh the page.', got '{error_desc}'"

        page2.screenshot(path="verification_error.png")

        # 4. To test data error state, we can intercept and provide invalid JSON
        page3 = browser.new_page()
        page3.route("**/agents.json", lambda route: route.fulfill(status=200, body="invalid json"))
        page3.goto(f"http://localhost:{PORT}/")
        time.sleep(2)

        data_error_title = page3.locator('.empty-title').inner_text()
        assert data_error_title == 'Unable to Load Protocols', f"Expected 'Unable to Load Protocols', got '{data_error_title}'"
        data_error_desc = page3.locator('.empty-desc').inner_text()
        assert data_error_desc == 'Check your configuration file formatting and try again.', f"Expected 'Check your configuration file formatting and try again.', got '{data_error_desc}'"

        page3.screenshot(path="verification_data_error.png")

        browser.close()
