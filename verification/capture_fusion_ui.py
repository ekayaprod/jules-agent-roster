import http.server
import socketserver
import threading
import time
from playwright.sync_api import sync_playwright

PORT = 8092

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        pass

def capture_fusion():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for data load
        page.wait_for_selector(".card", state="visible")

        # Select Agents
        # Using value is safer than label with icons
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Helix")

        # Click Fuse
        page.click("#fuseBtn")

        # Wait for result
        page.wait_for_selector("#fusionOutputWrapper.open", state="visible", timeout=10000)

        # Wait a bit for animation to settle
        time.sleep(1)

        # Screenshot the fusion output area
        element = page.locator("#fusionOutput")
        element.screenshot(path="verification/fusion_result.png")
        print("Screenshot saved to verification/fusion_result.png")

        browser.close()

if __name__ == "__main__":
    capture_fusion()
