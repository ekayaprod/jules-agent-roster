import threading
import http.server
import socketserver
import time
import os
import sys
from playwright.sync_api import sync_playwright, expect

PORT = 8102

def start_server():
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
            print(f"Server started at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_dropdown_polish():
    # Kill any existing process on port
    os.system(f"kill $(lsof -t -i :{PORT}) 2>/dev/null || true")

    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Debug console
        # page.on("console", lambda msg: print(f"Console: {msg.text}"))

        try:
            page.goto(f"http://localhost:{PORT}/index.html")
            print("Page loaded.")

            # Wait for JS
            page.wait_for_timeout(1000)

            # Inject a second item for testing navigation
            print("Injecting second dropdown item...")
            page.evaluate("""
                const menu = document.getElementById('downloadDropdownMenu');
                const item = document.createElement('button');
                item.className = 'dropdown-item';
                item.role = 'menuitem';
                item.id = 'secondItem';
                item.innerText = 'Second Item';
                menu.appendChild(item);
            """)

            dropdown_btn = page.locator("#downloadDropdownBtn")
            dropdown_menu = page.locator("#downloadDropdownMenu")
            first_item = page.locator(".dropdown-item").first
            second_item = page.locator("#secondItem")

            # Open dropdown
            print("Clicking dropdown button...")
            dropdown_btn.click()
            expect(dropdown_menu).to_be_visible(timeout=3000)
            print("✅ Dropdown opened.")

            # Test Home/End keys
            print("\n--- Testing Home/End Keys ---")

            # Focus the first item
            # page.keyboard.press("ArrowDown") # Click already focuses first item
            expect(first_item).to_be_focused()
            print("Focused first item.")

            # Press End -> Should go to second item
            page.keyboard.press("End")
            page.wait_for_timeout(200)

            if second_item.evaluate("el => document.activeElement === el"):
                print("✅ End key moves focus to last item.")
            else:
                print("❌ End key did NOT move focus to last item.")

            # Press Home -> Should go to first item
            page.keyboard.press("Home")
            page.wait_for_timeout(200)

            if first_item.evaluate("el => document.activeElement === el"):
                print("✅ Home key moves focus to first item.")
            else:
                print("❌ Home key did NOT move focus to first item.")

            # Test Tab Key (Close on Tab)
            print("\n--- Testing Tab Key ---")

            # Ensure menu is open and focused
            if not dropdown_menu.is_visible():
                dropdown_btn.click()
                expect(dropdown_menu).to_be_visible()

            # Focus the LAST item to test tabbing OUT
            second_item.focus()

            page.keyboard.press("Tab")
            page.wait_for_timeout(500)

            if not dropdown_menu.is_visible():
                print("✅ Tab key closed the dropdown.")
            else:
                 print("❌ Tab key did NOT close the dropdown.")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dropdown_polish()
