import time
import threading
import http.server
import socketserver
import os
from playwright.sync_api import sync_playwright, expect

PORT = 8132

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_picker_interaction():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Wait for skeletons to disappear
        try:
            page.wait_for_selector(".skeleton-card", state="hidden", timeout=10000)
            print("✅ App initialized")
        except:
            print("⚠️ Timeout waiting for skeletons")

        # 1. Open Picker
        page.click("#slotACard")
        modal = page.locator("#agentPickerModal")
        expect(modal).to_be_visible()
        print("✅ Modal opened")

        # 2. Check Focus on Search
        search_input = page.locator("#pickerSearch")
        expect(search_input).to_be_focused()
        print("✅ Search input focused")

        # 3. Test Keyboard Navigation (Roving Tabindex)
        # Press Tab to move to list
        page.keyboard.press("Tab")

        # Verify first option is focused
        first_option = page.locator(".mini-agent-card:visible").first
        expect(first_option).to_be_focused()
        # Verify tabindex="0" on focused item
        expect(first_option).to_have_attribute("tabindex", "0")
        print("✅ Tab moves focus to first option")

        # Press ArrowDown to move to next option
        page.keyboard.press("ArrowDown")
        # Get second visible option
        second_option = page.locator(".mini-agent-card:visible").nth(1)
        expect(second_option).to_be_focused()
        expect(second_option).to_have_attribute("tabindex", "0")
        # Verify first option has tabindex="-1"
        expect(first_option).to_have_attribute("tabindex", "-1")
        print("✅ ArrowDown moves focus and updates tabindex")

        # Press ArrowUp to move back
        page.keyboard.press("ArrowUp")
        expect(first_option).to_be_focused()
        print("✅ ArrowUp moves focus back")

        # Press End to move to last option
        page.keyboard.press("End")
        last_option = page.locator(".mini-agent-card:visible").last
        expect(last_option).to_be_focused()
        print("✅ End key moves focus to last option")

        # Press Home to move to first option
        page.keyboard.press("Home")
        expect(first_option).to_be_focused()
        print("✅ Home key moves focus to first option")

        # 4. Test Selection via Enter
        page.keyboard.press("Enter")
        expect(modal).not_to_be_visible()
        print("✅ Enter key selects option and closes modal")

        # 5. Re-open and Verify Selection State
        page.click("#slotACard")
        expect(modal).to_be_visible()

        # Verify the selected option has aria-selected="true"
        # The first option was selected
        expect(first_option).to_have_attribute("aria-selected", "true")
        print("✅ Selected option has aria-selected='true'")

        # 6. Test Search Announcement
        search_input.fill("Bolt")
        # Wait for debounce
        page.wait_for_timeout(500)

        announcer = page.locator("#pickerAnnouncer")
        # Text should be something like "1 protocols found" or similar
        # We check if it's not empty
        expect(announcer).not_to_be_empty()
        print(f"✅ Search announcer text: {announcer.inner_text()}")

        browser.close()

if __name__ == "__main__":
    verify_picker_interaction()
