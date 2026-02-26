import time
import threading
import http.server
import socketserver
import os
from playwright.sync_api import sync_playwright

PORT = 8133

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def capture_picker_interaction():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for load
        page.wait_for_selector(".skeleton-card", state="hidden")

        # Open Picker
        page.click("#slotACard")
        page.wait_for_selector("#agentPickerModal")
        time.sleep(0.5) # Wait for animation

        # Screenshot 1: Search Focused
        page.screenshot(path="verification/picker_search_focused.png")

        # Tab to list
        page.keyboard.press("Tab")
        time.sleep(0.2)
        # Screenshot 2: First Item Focused
        page.screenshot(path="verification/picker_item_focused.png")

        # Filter
        page.fill("#pickerSearch", "Bolt")
        time.sleep(0.5) # Wait for debounce
        page.keyboard.press("Tab") # Focus first result
        time.sleep(0.2)
        # Screenshot 3: Filtered Item Focused
        page.screenshot(path="verification/picker_filtered_focused.png")

        browser.close()

if __name__ == "__main__":
    capture_picker_interaction()
