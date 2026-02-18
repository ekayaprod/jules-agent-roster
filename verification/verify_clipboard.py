import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8082

def start_server():
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_clipboard():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Subscribe to console messages
            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

            # Navigate to local server
            page.goto(f"http://localhost:{PORT}/index.html")

            print("Page loaded.")

            # Wait for cards to load
            try:
                page.wait_for_selector(".card", timeout=5000)
            except Exception as e:
                print("Timeout waiting for cards. Check console logs above.")
                raise e

            cards = page.locator(".card")
            count = cards.count()
            print(f"Found {count} agent cards.")
            if count == 0:
                raise Exception("No agent cards found! Cannot test copy.")

            # Get the first copy button
            first_card = cards.first
            copy_btn = first_card.locator('[data-action="copy-agent"]')

            # --- Test Case 1: Clipboard API Success ---
            print("\n--- Test Case 1: Clipboard API Success ---")

            # Mock navigator.clipboard.writeText
            # We assign it to a window property so we can check it later
            page.evaluate("""
                window.__clipboardText = null;
                navigator.clipboard.writeText = async (text) => {
                    window.__clipboardText = text;
                    return Promise.resolve();
                };
            """)

            # Click the button
            copy_btn.click()

            # Wait a bit for async operation and toast
            page.wait_for_timeout(500)

            # Verify the text was "copied"
            clipboard_text = page.evaluate("window.__clipboardText")
            # print(f"Clipboard API called with text: {clipboard_text[:50]}...")

            if not clipboard_text:
                raise Exception("Clipboard API was not called!")

            # Verify Toast
            toast = page.locator("#toast")
            if "show" not in toast.get_attribute("class"):
                 raise Exception("Toast did not appear on success!")
            print("Toast appeared successfully.")

            # Reset toast state (hide it)
            page.evaluate("document.getElementById('toast').classList.remove('show')")


            # --- Test Case 2: Fallback (execCommand) ---
            print("\n--- Test Case 2: Fallback (execCommand) ---")

            # Mock navigator.clipboard.writeText to FAIL
            # Mock document.execCommand to track calls
            page.evaluate("""
                window.__clipboardText = null;
                window.__execCommandCalled = false;

                // Override the previous mock to fail
                navigator.clipboard.writeText = async (text) => {
                    return Promise.reject(new Error("Mocked Clipboard Failure"));
                };

                const originalExec = document.execCommand.bind(document);
                document.execCommand = (command) => {
                    if (command === 'copy') {
                        window.__execCommandCalled = true;
                        return true;
                    }
                    return originalExec(command);
                };
            """)

            # Click the button again
            copy_btn.click()

            # Wait a bit
            page.wait_for_timeout(500)

            # Verify execCommand was called
            exec_called = page.evaluate("window.__execCommandCalled")
            print(f"Fallback execCommand called: {exec_called}")

            if not exec_called:
                raise Exception("Fallback mechanism (execCommand) was not triggered!")

            # Verify Toast appears even on fallback
            toast_class = toast.get_attribute("class")
            if "show" not in toast_class:
                 raise Exception("Toast did not appear on fallback!")
            print("Toast appeared on fallback.")

            print("\n✅ Verification Successful: Clipboard logic handles both API success and fallback.")

            browser.close()

    except Exception as e:
        print(f"\n❌ Verification Failed: {e}")
        raise e

if __name__ == "__main__":
    verify_clipboard()
