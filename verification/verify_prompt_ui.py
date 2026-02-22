import os
import threading
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright, expect

PORT = 8093

def run_server():
    # Serve from current directory
    server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
    server.serve_forever()

def verify_prompt_ui():
    # Start server
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f'http://localhost:{PORT}/index.html')

        print("Verifying 'The Prompt Engineer' UI...")

        # 1. Search for the agent
        # Wait for agents to load
        page.wait_for_selector('.card')

        print("Searching for Prompt Engineer...")
        page.fill('#searchInput', 'Prompt Engineer')

        # 2. Wait for the card to be isolated
        card = page.locator('.card').filter(has_text="Prompt Engineer").first
        expect(card).to_be_visible()

        # 3. Click 'Show Prompt'
        print("Expanding prompt...")
        toggle = card.locator('.details-toggle')
        toggle.click()

        # 4. Wait for content
        content = card.locator('.details-content')
        expect(content).to_be_visible()

        # 5. Verify Text
        text = content.text_content()
        # Clean up whitespace for comparison if needed, but 'in' check should work
        print(f"Prompt Content Preview: {text[:100]}...")

        # Check for a specific phrase from the new prompt
        target_phrase = "Your output is always precise, structured, and documented"

        if target_phrase in text:
            print("✅ PASS: New prompt text found.")
        else:
            print("❌ FAIL: New prompt text NOT found.")
            print(f"Found (first 200 chars): {text[:200]}")

        # 6. Screenshot
        os.makedirs('/home/jules/verification', exist_ok=True)
        screenshot_path = '/home/jules/verification/prompt_engineer_ui.png'
        # Screenshot the card specifically
        card.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_prompt_ui()
