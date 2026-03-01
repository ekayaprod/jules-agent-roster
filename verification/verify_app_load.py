from playwright.sync_api import sync_playwright
import time
import threading
import http.server
import socketserver
import os

PORT = 8102

def start_server():
    os.chdir('.')
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_app_loads():
    # Start server in a separate thread
    thread = threading.Thread(target=start_server)
    thread.daemon = True
    thread.start()
    time.sleep(2) # Give it a moment to start

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(f"http://localhost:{PORT}/index.html")

            # Wait for the main app element to ensure JS loaded and rendered
            page.wait_for_selector("#main", timeout=5000)

            # Check if Fusion Lab is present (since we touched FusionCompiler)
            page.wait_for_selector(".fusion-lab-container", timeout=5000)

            # Take a screenshot
            screenshot_path = "verification/app_verification.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
