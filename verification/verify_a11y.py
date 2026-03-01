import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8085

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

def verify_a11y():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Wait for server

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Test 1: Clear button focusability when hidden
        print("Test 1: Checking clear button focus when hidden...")
        search_input = page.locator("#searchInput")
        search_input.focus()
        page.keyboard.press("Tab")

        active_id = page.evaluate("document.activeElement.id")
        print(f"Active element ID after Tab: {active_id}")

        if active_id == "clearBtn":
            print("❌ FAIL: Clear button received focus while hidden!")
            sys.exit(1)
        else:
            print("✅ PASS: Clear button skipped when hidden.")

        # Test 2: Clear button focusability when visible
        print("\nTest 2: Checking clear button focus when visible...")
        search_input.focus()
        search_input.fill("test")
        time.sleep(0.5) # Wait for transition

        clear_btn = page.locator("#clearBtn")
        # Check if visible class added
        if "visible" not in clear_btn.get_attribute("class"):
             print("❌ FAIL: Clear button did not get 'visible' class after typing.")
             sys.exit(1)

        search_input.focus()
        page.keyboard.press("Tab")
        active_id = page.evaluate("document.activeElement.id")
        print(f"Active element ID after Tab (visible): {active_id}")

        if active_id != "clearBtn":
            print("❌ FAIL: Clear button NOT focused when visible!")
            sys.exit(1)
        else:
            print("✅ PASS: Clear button focused when visible.")

        # Test 3: Clear button action and return focus
        print("\nTest 3: Checking clear action and focus return...")
        page.keyboard.press("Enter")
        time.sleep(0.1)

        val = search_input.input_value()
        if val != "":
             print(f"❌ FAIL: Search input not cleared! Value: '{val}'")
             sys.exit(1)

        active_id = page.evaluate("document.activeElement.id")
        if active_id != "searchInput":
             print(f"❌ FAIL: Focus did not return to input! Active: {active_id}")
             sys.exit(1)

        print("✅ PASS: Search cleared and focus returned.")

        browser.close()

if __name__ == "__main__":
    verify_a11y()
