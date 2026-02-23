import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright, expect

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

def verify_prompt_parser():
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"http://localhost:{PORT}/index.html")

        print("Page loaded.")

        # Wait for PromptParser to be available (it's loaded via script tag)
        page.wait_for_function("() => typeof PromptParser !== 'undefined'")
        print("PromptParser loaded.")

        # --- Test 1: Happy Path XML ---
        print("\n--- Test 1: Happy Path XML ---")
        xml_input = """
        <system>You are a helpful assistant.</system>
        <task>Answer user questions.</task>
        <step>Read question.</step>
        <output>Provide answer.</output>
        """
        result = page.evaluate(f"PromptParser.parsePrompt(`{xml_input}`)")

        if result['format'] != 'xml':
            raise Exception(f"FAIL: Expected format 'xml', got '{result['format']}'")

        sections = result['sections']
        expected_tags = ['system', 'task', 'step', 'output']
        if len(sections) != 4:
            raise Exception(f"FAIL: Expected 4 sections, got {len(sections)}")

        for i, tag in enumerate(expected_tags):
            if sections[i]['tag'] != tag:
                raise Exception(f"FAIL: Expected tag '{tag}', got '{sections[i]['tag']}'")

        print("✅ Happy Path XML passed.")

        # --- Test 2: Happy Path Legacy ---
        print("\n--- Test 2: Happy Path Legacy ---")
        legacy_input = "This is a simple prompt without any XML structure."
        result = page.evaluate(f"PromptParser.parsePrompt(`{legacy_input}`)")

        if result['format'] != 'legacy':
            raise Exception(f"FAIL: Expected format 'legacy', got '{result['format']}'")

        if result['raw'] != legacy_input:
             raise Exception(f"FAIL: Expected raw content to match input. Got: {result['raw']}")

        print("✅ Happy Path Legacy passed.")

        # --- Test 3: Mixed Content (XML tags mixed with text) ---
        print("\n--- Test 3: Mixed Content ---")
        mixed_input = """
        <system>System</system>
        Some random text outside tags.
        <task>Task</task>
        """
        # Based on implementation, wrapping in <root> handles this. Text nodes are ignored in current implementation (only element nodes processed).
        # Let's verify that behavior.
        result = page.evaluate(f"PromptParser.parsePrompt(`{mixed_input}`)")

        if result['format'] != 'xml':
             raise Exception(f"FAIL: Expected format 'xml' for mixed content, got '{result['format']}'")

        sections = result['sections']
        if len(sections) != 2:
             raise Exception(f"FAIL: Expected 2 sections (system, task), got {len(sections)}")

        if sections[0]['tag'] != 'system' or sections[1]['tag'] != 'task':
             raise Exception("FAIL: Incorrect section tags in mixed content.")

        print("✅ Mixed Content passed.")

        # --- Test 4: Malformed XML (Unclosed Tag) ---
        print("\n--- Test 4: Malformed XML (Unclosed Tag) ---")
        malformed_input = "<system>Unclosed tag"
        # Should fallback to legacy
        result = page.evaluate(f"PromptParser.parsePrompt(`{malformed_input}`)")

        if result['format'] != 'legacy':
             raise Exception(f"FAIL: Expected fallback to 'legacy' for malformed XML, got '{result['format']}'")

        print("✅ Malformed XML (Unclosed Tag) passed.")

        # --- Test 5: Malformed XML (Invalid Characters) ---
        print("\n--- Test 5: Malformed XML (Invalid Characters) ---")
        # '&' without escape is invalid in XML
        invalid_char_input = "<task>Tom & Jerry</task>"
        result = page.evaluate(f"PromptParser.parsePrompt(`{invalid_char_input}`)")

        if result['format'] != 'legacy':
             raise Exception(f"FAIL: Expected fallback to 'legacy' for invalid XML chars, got '{result['format']}'")

        print("✅ Malformed XML (Invalid Characters) passed.")

        # --- Test 6: Attributes ---
        print("\n--- Test 6: Attributes ---")
        attr_input = '<step id="1" name="init">Initialize system.</step>'
        result = page.evaluate(f"PromptParser.parsePrompt(`{attr_input}`)")

        if result['format'] != 'xml':
             raise Exception(f"FAIL: Expected format 'xml' with attributes, got '{result['format']}'")

        section = result['sections'][0]
        if section['id'] != '1' or section['name'] != 'init':
             raise Exception(f"FAIL: Attributes not parsed correctly. Got id={section.get('id')}, name={section.get('name')}")

        print("✅ Attributes passed.")

        # --- Test 7: Empty/Null Input ---
        print("\n--- Test 7: Empty/Null Input ---")
        result_empty = page.evaluate("PromptParser.parsePrompt('')")
        if result_empty['format'] != 'legacy' or result_empty['raw'] != '':
             raise Exception("FAIL: Empty string failed.")

        result_null = page.evaluate("PromptParser.parsePrompt(null)")
        if result_null['format'] != 'legacy': # Should handle null gracefully
             raise Exception("FAIL: Null input failed.")

        print("✅ Empty/Null Input passed.")

        # --- Test 8: Case Insensitivity ---
        print("\n--- Test 8: Case Insensitivity ---")
        case_input = "<SYSTEM>Upper case tag</SYSTEM>"
        result = page.evaluate(f"PromptParser.parsePrompt(`{case_input}`)")

        if result['format'] != 'xml':
             raise Exception(f"FAIL: Expected format 'xml' for uppercase tags, got '{result['format']}'")

        if result['sections'][0]['tag'] != 'system':
             # Note: logic converts tag to lowercase: node.tagName.toLowerCase()
             raise Exception(f"FAIL: Expected tag normalized to 'system', got '{result['sections'][0]['tag']}'")

        print("✅ Case Insensitivity passed.")

        browser.close()
        print("\n✅ All PromptParser tests passed!")

if __name__ == "__main__":
    verify_prompt_parser()
