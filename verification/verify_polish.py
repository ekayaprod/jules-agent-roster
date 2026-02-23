import os
import time
import threading
import http.server
import socketserver
import sys
from playwright.sync_api import sync_playwright

PORT = 8085

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

def verify_polish_v2():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to local server
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        print("Page loaded.")

        # 1. Verify "Show Prompt" text (Wordsmith)
        print("Checking 'Show Prompt' text...")
        try:
            show_prompt_btn = page.locator("button.details-toggle span", has_text="Show Prompt").first
            if show_prompt_btn.count() > 0:
                print("✅ Found 'Show Prompt' text.")
            else:
                print("❌ 'Show Prompt' text NOT found.")
                # sys.exit(1) # Don't exit yet, check others
        except Exception as e:
             print(f"❌ Error checking text: {e}")
             sys.exit(1)

        # 2. Verify "Hide Prompt" text after toggle (Wordsmith)
        print("Checking 'Hide Prompt' text...")
        try:
            toggle_btn = page.locator("button.details-toggle").first
            toggle_btn.click()
            page.wait_for_timeout(300) # Wait for text change

            hide_prompt_btn = page.locator("button.details-toggle span", has_text="Hide Prompt").first
            if hide_prompt_btn.count() > 0:
                print("✅ Found 'Hide Prompt' text.")
            else:
                print("❌ 'Hide Prompt' text NOT found.")

            # Collapse again
            toggle_btn.click()
            page.wait_for_timeout(300)
        except Exception as e:
            print(f"❌ Error checking hide text: {e}")
            sys.exit(1)

        # 3. Verify Empty State Text (Wordsmith)
        print("Checking Empty State text...")
        try:
            search_input = page.locator("#searchInput")
            search_input.fill("NonExistentAgentXYZ")
            page.wait_for_timeout(500) # Wait for filter

            empty_state = page.locator("#emptyState p")
            text = empty_state.inner_text()
            expected_text = "No agents found. Try a different keyword."

            if text == expected_text:
                print(f"✅ Found correct empty state text: '{text}'")
            else:
                print(f"❌ Empty state text mismatch. Found: '{text}', Expected: '{expected_text}'")

            # Clear search
            page.locator("#clearBtn").click()
            page.wait_for_timeout(300)
        except Exception as e:
            print(f"❌ Error checking empty state: {e}")
            sys.exit(1)

        # 4. Verify Styles (Palette+)
        print("Checking .details-toggle styles...")
        try:
            toggle_btn = page.locator("button.details-toggle").first

            # Check padding and border-radius
            padding = toggle_btn.evaluate("element => window.getComputedStyle(element).padding")
            border_radius = toggle_btn.evaluate("element => window.getComputedStyle(element).borderRadius")
            transition = toggle_btn.evaluate("element => window.getComputedStyle(element).transition")

            print(f"Padding: {padding}")
            print(f"Border Radius: {border_radius}")
            print(f"Transition: {transition}")

            if "12px 16px" in padding or "0.75rem 1rem" in padding: # Approximate check
                 print("✅ Padding looks correct.")
            else:
                 print(f"⚠️ Padding might be incorrect: {padding}")

            if "8px" in border_radius or "0.5rem" in border_radius:
                 print("✅ Border Radius looks correct.")
            else:
                 print(f"⚠️ Border Radius might be incorrect: {border_radius}")

        except Exception as e:
            print(f"❌ Error checking styles: {e}")
            sys.exit(1)

        # 5. Verify Copy Success Text (Wordsmith) - Optional but good
        # Need to mock clipboard or just check text change
        # Since it's hard to verify clipboard without permissions, we check the button text change
        print("Checking Copy Success text...")
        try:
            # Mock clipboard writeText
            page.evaluate("navigator.clipboard.writeText = () => Promise.resolve()")

            copy_btn = page.locator("button[data-action='copy-agent']").first
            copy_btn.click()

            success_text = page.locator("button[data-action='copy-agent'].success-state span", has_text="Copied!")
            page.wait_for_timeout(100) # Wait for class add

            if success_text.count() > 0:
                 print("✅ Found 'Copied!' success text.")
            else:
                 print("❌ 'Copied!' success text NOT found.")

        except Exception as e:
            print(f"❌ Error checking copy success: {e}")
            # Don't fail hard on this one as it depends on mocks

        browser.close()

if __name__ == "__main__":
    verify_polish_v2()
