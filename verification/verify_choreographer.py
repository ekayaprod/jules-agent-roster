import time
from playwright.sync_api import sync_playwright

def verify_skeleton(page):
    # Set a slower network condition to intercept and delay getAgents
    page.route("**/*", lambda route: (time.sleep(2), route.continue_()))

    # Load the app
    page.goto("http://localhost:8123/index.html")

    # Instantly the skeleton should be visible in the DOM
    skeleton = page.locator("#fusionLabSkeleton")
    skeleton.wait_for(state="visible", timeout=1000)

    # Save screenshot of the skeleton
    page.screenshot(path="verification/fusion_lab_skeleton.png")

    print("✅ Skeleton found before data loads")

    # Now let the requests finish and verify it gets hidden
    page.unroute("**/*")

    # Wait for the content to appear and skeleton to hide
    content = page.locator("#fusionLabContent")
    content.wait_for(state="visible", timeout=5000)
    skeleton.wait_for(state="hidden", timeout=5000)

    page.screenshot(path="verification/fusion_lab_loaded.png")
    print("✅ Skeleton successfully hidden and content visible")

if __name__ == "__main__":
    import threading
    import http.server
    import socketserver

    PORT = 8123
    Handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), Handler)
    thread = threading.Thread(target=httpd.serve_forever)
    thread.daemon = True
    thread.start()
    print(f"Serving at port {PORT}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_skeleton(page)
        finally:
            browser.close()
