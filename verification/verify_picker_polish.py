import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8130

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_picker_polish():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print(f"Navigating to http://localhost:{PORT}")
        page.goto(f"http://localhost:{PORT}")

        # 1. Open Picker
        print("Opening picker for Slot A...")
        # Wait for slot to be available
        page.wait_for_selector("#slotACard")

        # Click slot A
        page.click("#slotACard")

        # 2. Assert Header Text
        print("Verifying Header Text...")
        # Just wait for visibility of header
        page.wait_for_selector(".picker-header h3")

        # Get header text
        header_text = page.inner_text(".picker-header h3")
        print(f"Header Text: '{header_text}'")
        assert "Select Fusion Protocol" in header_text

        # 3. Assert Search Placeholder
        print("Verifying Search Placeholder...")
        placeholder = page.get_attribute("#pickerSearch", "placeholder")
        print(f"Placeholder: '{placeholder}'")
        assert "Filter protocols by name or role" in placeholder

        # 4. Verify Empty State
        print("Testing Empty State...")
        page.type("#pickerSearch", "xyz_nonexistent_agent", delay=100)

        # Wait for element to show
        try:
            page.wait_for_selector("#pickerEmptyState:not([hidden])", timeout=5000)
            print("Empty state visible")
        except Exception as e:
            print(f"Empty state not visible: {e}")
            page.screenshot(path="verification/debug_empty_state_fail.png")
            raise

        empty_title = page.inner_text("#pickerEmptyState .empty-title")
        assert "No Fusion Protocols Found" in empty_title

        if not os.path.exists("verification/screenshots"):
            os.makedirs("verification/screenshots", exist_ok=True)
        page.screenshot(path="verification/screenshots/picker_empty_state.png")

        # 5. Select Agent A
        print("Selecting Agent A...")
        page.fill("#pickerSearch", "") # Clear search

        # Wait for grid to repopulate
        # We need to pick a specific agent, let's say "Architect" if available, or just the first one
        # Let's wait for any card
        page.wait_for_selector(".mini-agent-card")

        # Click the first available agent
        first_agent = page.locator(".mini-agent-card").first
        agent_name = first_agent.get_attribute("data-name")
        print(f"Selecting agent: {agent_name}")
        first_agent.click()

        # Wait for slot to be filled
        page.wait_for_selector("#slotACard.filled")
        print("Slot A filled")

        # 6. Verify Disabled State in Slot B Picker
        print("Opening picker for Slot B...")
        page.click("#slotBCard")
        page.wait_for_selector(".picker-header h3")

        # Find the card corresponding to the agent selected in Slot A
        # The data-name attribute is lowercase
        disabled_card = page.locator(f".mini-agent-card[data-name='{agent_name}']")

        # Check if it has the disabled class
        classes = disabled_card.get_attribute("class")
        print(f"Card classes for {agent_name}: {classes}")
        assert "disabled" in classes, f"{agent_name} card should be disabled in Slot B picker"

        # Assert title attribute (optional, but good for UX)
        title = disabled_card.get_attribute("title")
        print(f"Card title: {title}")
        assert "Protocol already active" in title

        # Capture screenshot of disabled state
        page.screenshot(path="verification/screenshots/picker_disabled_state.png")

        print("✅ All verification steps passed!")
        browser.close()

if __name__ == "__main__":
    verify_picker_polish()
