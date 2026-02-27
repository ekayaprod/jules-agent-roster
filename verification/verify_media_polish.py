import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

PORT = 8132

def run_server():
    try:
        server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
        server.serve_forever()
    except OSError:
        print(f"Port {PORT} in use, assuming server running.")

def verify_media_polish():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)  # Give server time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto(f'http://localhost:{PORT}/index.html')
        except Exception as e:
            print(f"Failed to load page: {e}")
            sys.exit(1)

        print("Verifying Hero Banner Optimization...")

        # Locate the hero banner
        hero_img = page.locator('img[src="assets/hero-banner.svg"]')

        if hero_img.count() == 0:
            print("❌ FAIL: Hero banner image not found.")
            sys.exit(1)

        # Check attributes
        width = hero_img.get_attribute("width")
        height = hero_img.get_attribute("height")
        cls = hero_img.get_attribute("class")
        style = hero_img.get_attribute("style")

        success = True

        if width == "800" and height == "250":
             print("✅ PASS: Hero banner has correct width and height attributes.")
        else:
             print(f"❌ FAIL: Hero banner missing or incorrect dimensions. Got width={width}, height={height}. Expected 800x250.")
             success = False

        if cls and "hero-banner" in cls:
             print("✅ PASS: Hero banner has 'hero-banner' class.")
        else:
             print(f"❌ FAIL: Hero banner missing 'hero-banner' class. Got class='{cls}'")
             success = False

        if not style:
             print("✅ PASS: Hero banner has no inline styles.")
        elif "max-width" in style:
             print(f"❌ FAIL: Hero banner inline styles still contain 'max-width': '{style}'. Move to CSS.")
             success = False
        else:
             print(f"⚠️ WARN: Hero banner still has inline styles: '{style}'.")

        if not success:
            browser.close()
            sys.exit(1)

        print("🎉 ALL CHECKS PASSED: Hero banner is optimized.")
        browser.close()

if __name__ == "__main__":
    verify_media_polish()
