import time
import threading
import http.server
import socketserver
import re
from playwright.sync_api import sync_playwright, expect

PORT = 8089

def start_server():
    # Allow address reuse to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    handler = http.server.SimpleHTTPRequestHandler
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT} likely in use, continuing anyway as it might be this process re-running: {e}")

def verify_dag_order():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Verify Fusion Lab section exists
        expect(page.locator(".fusion-lab-container")).to_be_visible()

        # Select agents: Herald (low priority) first, Janitor (high priority) second
        # Current implementation (before fix) should result in Herald -> Janitor
        # Desired implementation (after fix) should result in Janitor -> Herald

        # Herald is index 18 (last)
        # Janitor is index 0 (first)

        page.select_option("#slotA", value="Herald")
        page.select_option("#slotB", value="Janitor")

        # Click Fuse
        page.click("#fuseBtn")

        # Wait for output
        output = page.locator("#fusionOutput")
        expect(output).to_be_visible()

        # Get the generated prompt text
        prompt_text = page.inner_text("#fusionCode")

        print(f"Generated Prompt:\n{prompt_text[:200]}...") # Print first 200 chars

        # Check for Phase 1 and Phase 2
        # We expect Phase 1 to be Janitor, Phase 2 to be Herald

        phase1_match = re.search(r"Phase 1: The (\w+) Phase", prompt_text)
        phase2_match = re.search(r"Phase 2: The (\w+) Phase", prompt_text)

        if phase1_match and phase2_match:
            p1 = phase1_match.group(1)
            p2 = phase2_match.group(1)
            print(f"Detected Order: {p1} -> {p2}")

            if p1 == "Janitor" and p2 == "Herald":
                print("SUCCESS: DAG Order Enforced (Janitor -> Herald)")
            else:
                print(f"FAILURE: Incorrect Order ({p1} -> {p2}) - Expected Janitor -> Herald")
                exit(1)
        else:
            print("FAILURE: Could not parse phases from prompt.")
            print(prompt_text)
            exit(1)

        # Check PR Title
        pr_title_match = re.search(r'PR Title: "🧬 Fusion: \[(.*?)\]"', prompt_text)
        if pr_title_match:
            title_content = pr_title_match.group(1)
            print(f"PR Title Content: {title_content}")
            if "Janitor + Herald" in title_content:
                 print("SUCCESS: PR Title Correct")
            else:
                 print(f"FAILURE: PR Title Incorrect ({title_content})")
                 exit(1)
        else:
             print("FAILURE: PR Title not found")
             exit(1)

        # Screenshot the result
        page.locator("#fusionOutput").screenshot(path="verification/fusion_dag_order.png")
        print("Screenshot saved to verification/fusion_dag_order.png")

        browser.close()

if __name__ == "__main__":
    verify_dag_order()
