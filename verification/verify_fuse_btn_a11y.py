import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8092

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()
    except OSError:
        pass

def test_fuse_btn():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')
        page.wait_for_timeout(1000)

        # 1. Test empty state
        fuse_btn = page.locator('#fuseBtn')
        if fuse_btn.get_attribute('aria-disabled') != "true":
            print("❌ FAIL: Initial fuseBtn should have aria-disabled='true'")
            exit(1)
        else:
            print("✅ PASS: Initial fuseBtn has aria-disabled='true'")

        # 2. Test enabled state (simulate slot selection by running evaluating JS)
        page.evaluate('''
            window.rosterApp.fusionLab.state.slotA = "agent1";
            window.rosterApp.fusionLab.state.slotB = "agent2";
            window.rosterApp.fusionLab.updateState();
        ''')
        page.wait_for_timeout(500)

        if fuse_btn.get_attribute('aria-disabled') != "false":
            print(f"❌ FAIL: Ready fuseBtn should have aria-disabled='false'. Actual: {fuse_btn.get_attribute('aria-disabled')}")
            exit(1)
        else:
            print("✅ PASS: Ready fuseBtn has aria-disabled='false'")

        browser.close()

if __name__ == "__main__":
    test_fuse_btn()
