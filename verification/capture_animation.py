import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8088

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def capture_animation():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        print("Page loaded.")

        # Prepare for Fusion
        page.select_option("#slotA", value="Bolt+")
        page.select_option("#slotB", value="Palette+")

        # Trigger
        page.click("#fuseBtn")

        # Capture Phase 1 (Draw In) - at ~0.5s
        time.sleep(0.5)
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_phase_1.png")
        print("Captured Phase 1")

        # Capture Phase 2 (Clash) - at ~1.7s (starts at 1.5s)
        time.sleep(1.2)
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_phase_2.png")
        print("Captured Phase 2")

        # Capture Phase 3 (Reveal) - at ~2.2s (starts at 2.0s)
        time.sleep(0.5)
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_phase_3.png")
        print("Captured Phase 3")

        # Capture Result - at ~4.0s (ends at 3.5s)
        time.sleep(2.0)
        page.locator(".fusion-lab-container").screenshot(path="verification/fusion_result.png")
        print("Captured Result")

        browser.close()

if __name__ == "__main__":
    capture_animation()
