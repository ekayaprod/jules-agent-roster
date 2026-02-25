import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8120

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_ux_polish():
    # Start server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        # Test 1: JS Disabled
        print("\n--- Test 1: JavaScript DISABLED ---")
        browser = p.chromium.launch()
        context = browser.new_context(java_script_enabled=False)
        page = context.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        # Check for noscript content
        # Note: Playwright can see hidden elements, so we check visibility
        try:
            noscript_msg = page.locator(".no-js-message")
            if noscript_msg.count() > 0:
                 # Check if visible (it should be visible because of the noscript style block)
                 # However, Playwright's visibility check might be tricky with noscript as it renders differently.
                 # Let's check computed style or presence.
                 print("✅ <noscript> message found in DOM.")

                 # Verify grid is hidden
                 grid = page.locator(".grid").first
                 # If we use display: none !important in noscript style, it should be hidden.
                 # But verify if it's actually hidden.
                 if grid.is_visible():
                     print("❌ Grid is visible! It should be hidden when JS is disabled.")
                 else:
                     print("✅ Grid is hidden as expected.")
            else:
                 print("❌ <noscript> message NOT found. (Expected failure before implementation)")
        except Exception as e:
            print(f"Error checking noscript: {e}")

        context.close()
        browser.close()

        # Test 2: JS Enabled (Skeletons)
        print("\n--- Test 2: JavaScript ENABLED ---")
        browser = p.chromium.launch()
        page = browser.new_page()

        # Slow down network to see skeletons
        page.route("**/*", lambda route: (time.sleep(0.5), route.continue_()))

        page.goto(f"http://localhost:{PORT}/index.html")

        # Check for skeletons immediately
        skeletons = page.locator(".skeleton-card")
        count = skeletons.count()
        if count > 0:
            print(f"✅ Found {count} skeletons initially.")
        else:
            print("❌ No skeletons found initially. (Expected failure before implementation)")

        # Wait for cards to load
        try:
            page.wait_for_selector(".card", timeout=5000)
            print("✅ Real cards loaded successfully.")

            # Verify skeletons are gone
            if skeletons.count() == 0:
                print("✅ Skeletons removed after load.")
            else:
                print(f"❌ Skeletons still present: {skeletons.count()}")
        except:
            print("❌ Real cards failed to load.")

        browser.close()

if __name__ == "__main__":
    verify_ux_polish()
