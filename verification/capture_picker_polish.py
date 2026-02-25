import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright, expect

PORT = 8131

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def capture_picker_polish():
    # Start server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for skeletons to disappear
        try:
            page.wait_for_selector(".skeleton-card", state="hidden", timeout=5000)
        except:
            pass

        # 1. Capture Normal State
        page.click("#slotACard")
        modal = page.locator("#agentPickerModal")
        expect(modal).to_be_visible()

        # Wait a bit for stagger animation
        time.sleep(0.5)

        page.screenshot(path="verification/picker_normal_state.png")
        print("Captured picker_normal_state.png")

        # 2. Capture Empty State
        search_input = page.locator("#pickerSearch")
        search_input.fill("XYZ_NONEXISTENT_AGENT")

        # Wait for debounce and filter
        time.sleep(0.5)

        page.screenshot(path="verification/picker_empty_state.png")
        print("Captured picker_empty_state.png")

        browser.close()

if __name__ == "__main__":
    capture_picker_polish()
