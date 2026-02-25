import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8121

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def capture_ux_polish():
    # Start server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        # Capture 1: JS Disabled
        print("\n--- Capture 1: JavaScript DISABLED ---")
        browser = p.chromium.launch()
        context = browser.new_context(java_script_enabled=False)
        page = context.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Take full page screenshot
        page.screenshot(path="verification/noscript_state.png", full_page=True)
        print("📸 Captured verification/noscript_state.png")

        context.close()
        browser.close()

        # Capture 2: JS Enabled (Skeletons)
        print("\n--- Capture 2: JavaScript ENABLED (Skeletons) ---")
        browser = p.chromium.launch()
        page = browser.new_page()

        # Slow down network to capture skeletons
        # We intercept requests and delay them
        page.route("**/*", lambda route: (time.sleep(1), route.continue_()))

        page.goto(f"http://localhost:{PORT}/index.html")

        # Take screenshot immediately (should show skeletons)
        # We wait for the grid to be visible
        page.wait_for_selector("#coreGrid")

        # Wait a bit for layout to settle but before cards load (due to network delay)
        time.sleep(0.5)

        page.screenshot(path="verification/skeleton_state.png", full_page=True)
        print("📸 Captured verification/skeleton_state.png")

        browser.close()

if __name__ == "__main__":
    capture_ux_polish()
