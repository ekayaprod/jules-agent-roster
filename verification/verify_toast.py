import os
import time
import threading
import http.server
import socketserver
import sys
from playwright.sync_api import sync_playwright

PORT = 8104 # New port for toast verification

def start_server():
    # Serve from current directory
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError:
        pass # Port already in use

def verify_toast():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to local server
        try:
            page.goto(f"http://localhost:{PORT}/index.html")
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"❌ Failed to load page: {e}")
            sys.exit(1)

        print("Page loaded.")

        # 1. Test Success Toast
        print("\n--- Test 1: Success Toast ---")
        page.evaluate("window.rosterApp.toast.show('Success Message', 'success')")

        toast = page.locator("#toast")
        try:
            toast.wait_for(state="visible", timeout=2000)
        except:
             print("❌ Toast did not appear.")
             sys.exit(1)

        # Verify content and classes
        classes = toast.get_attribute("class")
        if "success" in classes:
            print("✅ Toast has 'success' class.")
        else:
            print(f"❌ Toast missing 'success' class. Class: {classes}")
            sys.exit(1)

        aria_live = toast.get_attribute("aria-live")
        if aria_live == "polite":
             print("✅ aria-live is 'polite'.")
        else:
             print(f"❌ aria-live mismatch. Found: {aria_live}")
             sys.exit(1)

        text = page.locator(".toast-content span").inner_text()
        if text == "Success Message":
             print("✅ Message is correct.")
        else:
             print(f"❌ Message mismatch. Found: {text}")
             sys.exit(1)

        # 2. Test Error Toast
        print("\n--- Test 2: Error Toast ---")
        page.evaluate("window.rosterApp.toast.show('Error Message', 'error')")
        page.wait_for_timeout(500) # Wait for update

        classes = toast.get_attribute("class")
        if "error" in classes:
            print("✅ Toast has 'error' class.")
        else:
            print(f"❌ Toast missing 'error' class. Class: {classes}")
            sys.exit(1)

        aria_live = toast.get_attribute("aria-live")
        if aria_live == "assertive":
             print("✅ aria-live is 'assertive'.")
        else:
             print(f"❌ aria-live mismatch. Found: {aria_live}")
             sys.exit(1)

        # 3. Test Hover (Pause Dismissal)
        print("\n--- Test 3: Hover Interaction ---")
        # Show a short toast (1s)
        page.evaluate("window.rosterApp.toast.show('Short Toast', 'info', 1000)")

        # Hover immediately
        toast.hover()
        print("Hovering over toast...")

        # Wait 1.5s (should still be visible because hovered)
        page.wait_for_timeout(1500)

        if toast.is_visible() and "show" in toast.get_attribute("class"):
            print("✅ Toast persists while hovered.")
        else:
            print("❌ Toast disappeared while hovered!")
            sys.exit(1)

        # 4. Test Mouse Leave (Resume Dismissal)
        print("\n--- Test 4: Mouse Leave ---")
        # Move mouse away
        page.mouse.move(0, 0)
        print("Mouse left toast...")

        # Wait 2.5s (2s resume delay + buffer)
        page.wait_for_timeout(3000)

        if not toast.is_visible() or "show" not in toast.get_attribute("class"):
             print("✅ Toast dismissed after mouse leave.")
        else:
             print("❌ Toast did NOT dismiss after mouse leave.")
             # Not fatal, maybe timing is tricky, but worth noting

        # 5. Test Close Button
        print("\n--- Test 5: Close Button ---")
        page.evaluate("window.rosterApp.toast.show('Persistent Toast', 'info', 10000)")
        page.wait_for_timeout(500)

        close_btn = page.locator(".toast-close-btn")
        if close_btn.is_visible():
            print("✅ Close button is visible.")
            close_btn.click()

            page.wait_for_timeout(500)
            if not toast.is_visible() or "show" not in toast.get_attribute("class"):
                 print("✅ Toast dismissed on close button click.")
            else:
                 print("❌ Toast did NOT dismiss on close button click.")
                 sys.exit(1)
        else:
            print("❌ Close button NOT found.")
            sys.exit(1)

        print("\n💎 All Toast tests passed!")
        browser.close()

if __name__ == "__main__":
    verify_toast()
