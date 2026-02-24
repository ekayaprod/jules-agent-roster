import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8097

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_fusion_content():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Wait for Fusion Lab
        page.wait_for_selector("#slotA", state="attached", timeout=10000)

        # Fuse Palette+ and Sentinel+
        print("Selecting Palette+ and Sentinel+...")
        page.select_option("#slotA", "Palette+")
        page.select_option("#slotB", "Sentinel+")

        print("Igniting Fusion Protocol...")
        page.click("#fuseBtn")

        # Wait for result name
        try:
            page.wait_for_selector("#fusionName", state="visible", timeout=10000)
            page.wait_for_function("document.getElementById('fusionName').innerText.includes('Warden')")
            print("✅ Fusion Name Verified: Warden")

            # NOW CHECK PROMPT CONTENT
            # The prompt is in #fusionCode
            # Note: FusionCompiler stitches the prompt. It should contain the content from Warden.md IF it's a custom agent.
            # Warden IS a custom agent in custom_agents.json.
            # FusionCompiler.fuse() -> checks customAgentsMap.
            # If found, it returns the prompt from the map OR stitches if prompt is null.
            # Wait, does AgentRepository load the prompt into customAgentsData?
            # Yes:
            # const filename = `prompts/fusions/${cleanName}.md`;
            # const promptRes = await fetch(filename);
            # agent.prompt = await promptRes.text();

            # So if my file creation was correct, the prompt should be loaded.

            page.wait_for_selector("#fusionCode", state="visible", timeout=10000)
            prompt_text = page.inner_text("#fusionCode")

            expected_snippet = 'You are "Warden"'
            if expected_snippet in prompt_text:
                print(f"✅ Fusion Prompt Content Verified: Found '{expected_snippet}'")
            else:
                print(f"❌ Fusion Prompt Content Mismatch. Expected '{expected_snippet}' to be in prompt.")
                print(f"Actual prompt start: {prompt_text[:100]}...")
                exit(1)

        except Exception as e:
            print(f"❌ Error during verification: {e}")
            page.screenshot(path="verification/fusion_content_error.png")
            exit(1)

        browser.close()

if __name__ == "__main__":
    verify_fusion_content()
