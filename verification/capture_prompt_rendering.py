import time
import threading
import http.server
import socketserver
import os
from playwright.sync_api import sync_playwright

PORT = 8125

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def capture_ui():
    # Start server in a separate thread
    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    time.sleep(2) # Give it a moment to start

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(f"http://localhost:{PORT}/index.html")
            print("Page loaded.")

            # Wait for cards to be rendered
            page.wait_for_selector(".agent-title", timeout=10000)
            time.sleep(1)

            # 1. Expand a card to see the prompt details
            # Find the Helix card
            helix_card = page.locator(".card").filter(has_text="Helix")
            if helix_card.count() > 0:
                print("Found Helix card. Expanding...")
                toggle_btn = helix_card.locator(".details-toggle")
                toggle_btn.click()

                # Wait for expansion and prompt content
                page.wait_for_selector(".details-grid.expanded", timeout=2000)
                # Check for structured prompt classes introduced by PromptRenderer
                # Helix prompt might not be XML, so it might just render as text.
                # Let's check for either structured or details-content
                page.wait_for_selector(".details-content", timeout=2000)

                # Take screenshot of the expanded card
                screenshot_path = "verification/helix_card_prompt.png"
                helix_card.screenshot(path=screenshot_path)
                print(f"Captured expanded card: {screenshot_path}")
            else:
                print("Helix card not found.")

            # 2. Perform a fusion to check FusionLab rendering
            print("Performing Fusion...")
            page.select_option(".fusion-controls select:nth-of-type(1)", index=1) # Select first agent (should be Architect or similar)
            page.select_option(".fusion-controls select:nth-of-type(2)", index=2) # Select second agent

            # Since visual slots are used now, we might need to simulate clicks if select isn't available/visible
            # But let's try interacting with the index or slots if available.
            # Actually, the test code above tried to use select options which might be hidden or non-existent in the new UI.
            # Let's use the visual slots logic if possible, or just check the code again.
            # FusionLab.js uses this.state.slotA/B.
            # The UI has #slotACard and #slotBCard.

            # Reset and try visual interaction
            page.reload()
            page.wait_for_selector("#slotACard", timeout=5000)

            # Click Slot A
            page.click("#slotACard")
            page.wait_for_selector("#agentPickerModal[open]", timeout=2000)
            # Pick 'Helix'
            page.click(".mini-agent-card[data-name='helix']")

            # Click Slot B
            page.click("#slotBCard")
            page.wait_for_selector("#agentPickerModal[open]", timeout=2000)
            # Pick 'Architect'
            page.click(".mini-agent-card[data-name='architect']")

            # Fuse
            page.click("#fuseBtn")

            # Wait for result
            page.wait_for_selector("#fusionOutputWrapper.open", timeout=10000)
            page.wait_for_selector(".prompt-structured", timeout=5000)

            # Screenshot Fusion Result
            screenshot_path_fusion = "verification/fusion_result_prompt.png"
            page.locator("#fusionOutput").screenshot(path=screenshot_path_fusion)
            print(f"Captured fusion result: {screenshot_path_fusion}")

            browser.close()

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e

if __name__ == "__main__":
    capture_ui()
