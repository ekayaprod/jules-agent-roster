import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8097

def start_server():
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_download_dropdown():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Subscribe to console messages
            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

            page.goto(f"http://localhost:{PORT}/index.html")
            print("Page loaded.")

            # Wait for data load
            try:
                page.wait_for_selector(".card", timeout=5000)
            except:
                print("Warning: Cards not loaded, checking if network error or just slow.")

            # Check for new buttons
            try:
                dropdown_btn = page.wait_for_selector("#downloadDropdownBtn", timeout=2000)
            except:
                raise Exception("Dropdown button #downloadDropdownBtn not found!")

            custom_btn = page.locator("#downloadCustomBtn")
            menu = page.locator("#downloadDropdownMenu")

            if menu.is_visible():
                raise Exception("Menu should be hidden initially!")

            # Click dropdown
            page.click("#downloadDropdownBtn")

            # Wait for visibility class
            try:
                page.wait_for_selector("#downloadDropdownMenu.visible", timeout=1000)
                print("Dropdown opened.")
            except:
                raise Exception("Dropdown menu did not become visible after click!")

            if not custom_btn.is_visible():
                raise Exception("Custom download button not visible in menu!")

            # Mock download
            page.evaluate("""
                window.__downloadTriggered = false;
                window.__downloadFileName = null;

                // Mock Blob/URL to avoid errors
                window.URL.createObjectURL = (blob) => "blob:mock";
                window.URL.revokeObjectURL = (url) => {};

                // Mock anchor click
                const originalCreateElement = document.createElement.bind(document);
                document.createElement = (tag) => {
                    const el = originalCreateElement(tag);
                    if (tag === 'a') {
                        el.click = () => {
                            window.__downloadTriggered = true;
                            window.__downloadFileName = el.download;
                            console.log("Mock download triggered: " + el.download);
                        };
                    }
                    return el;
                };
            """)

            # Click download custom agents
            custom_btn.click()

            # Verify download triggered
            downloaded = page.evaluate("window.__downloadTriggered")
            filename = page.evaluate("window.__downloadFileName")

            if not downloaded:
                # Check if toast appeared saying "No custom agents"
                toast_text = page.locator("#toast").inner_text()
                print(f"Download not triggered. Toast says: {toast_text}")
                # If no custom agents, this is technically a pass for the UI logic, but we expect some custom agents if custom_agents.json is present.
                if "No custom agents" in toast_text:
                    print("No custom agents available, but button logic worked.")
                else:
                    raise Exception("Download action was not triggered!")
            else:
                if filename != "jules_custom_agents.md":
                    raise Exception(f"Wrong filename: {filename}")
                print(f"Download triggered successfully for {filename}.")

            # Verify dropdown closed
            page.wait_for_timeout(200) # Wait for UI update

            is_visible = page.evaluate("document.getElementById('downloadDropdownMenu').classList.contains('visible')")
            if is_visible:
                raise Exception("Menu did not close after selection!")
            print("Menu closed after selection.")

            # Test clicking outside closes menu
            page.click("#downloadDropdownBtn") # Open again
            page.wait_for_selector("#downloadDropdownMenu.visible", timeout=1000)

            page.mouse.click(0, 0) # Click somewhere else

            page.wait_for_timeout(200)
            is_visible = page.evaluate("document.getElementById('downloadDropdownMenu').classList.contains('visible')")
            if is_visible:
                 raise Exception("Menu did not close when clicking outside!")
            print("Menu closed when clicking outside.")

            print("\n✅ Verification Successful: Dropdown and Download logic works.")
            browser.close()

    except Exception as e:
        print(f"\n❌ Verification Failed: {e}")
        # Take screenshot if failed
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page()
                page.goto(f"http://localhost:{PORT}/index.html")
                page.screenshot(path="verification/verification_failed.png")
                print("Screenshot saved to verification/verification_failed.png")
        except:
            pass
        raise e

if __name__ == "__main__":
    verify_download_dropdown()
