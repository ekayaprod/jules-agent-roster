from playwright.sync_api import sync_playwright
import http.server
import threading
import time
import sys
import socketserver

PORT = 8090

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()
    except OSError:
        pass

def verify_stagger():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_selector(".card")

        # Get all cards
        cards = page.locator(".card").all()
        print(f"Found {len(cards)} cards.")

        delays = []
        for i, card in enumerate(cards):
            delay = card.evaluate("el => el.style.animationDelay")
            delays.append(delay)
            # Verify pop-in class
            classes = card.get_attribute("class")
            if "pop-in" not in classes:
                print(f"❌ Card {i} missing pop-in class")
                sys.exit(1)

            # Verify Computed Style Animation Name
            anim_name = card.evaluate("el => window.getComputedStyle(el).animationName")
            if "popIn" not in anim_name:
                 print(f"❌ Card {i} has incorrect animation name: {anim_name}. CSS might be missing.")
                 sys.exit(1)

        print("Animation Delays:", delays[:5], "...")

        # Verify staggering
        # Expected: "0ms", "30ms", "60ms", ...
        if delays[0] == "0ms" and delays[1] == "30ms":
             print("✅ Staggering detected.")
        else:
             print("❌ Staggering incorrect.")
             sys.exit(1)

        # Take a screenshot for frontend verification
        page.screenshot(path="verification/stagger_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_stagger()
