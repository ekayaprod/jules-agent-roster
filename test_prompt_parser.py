from playwright.sync_api import sync_playwright
import os
import json
import sys

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load PromptParser.js
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "js/PromptParser.js")

        if not os.path.exists(script_path):
            print(f"Error: {script_path} not found")
            sys.exit(1)

        # We need an HTML context for DOMParser to work
        page.goto("about:blank")
        page.add_script_tag(path=script_path)

        test_cases = [
            {
                "name": "Null input",
                "input": None,
                "expected": {"format": "legacy", "raw": ""}
            },
            {
                "name": "Undefined input",
                "input": None, # In JS evaluate, None becomes null
                "expected": {"format": "legacy", "raw": ""}
            },
            {
                "name": "Empty string",
                "input": "",
                "expected": {"format": "legacy", "raw": ""}
            },
            {
                "name": "Non-string input (number)",
                "input": 123,
                "expected": {"format": "legacy", "raw": 123}
            },
            {
                "name": "Legacy text (no XML tags)",
                "input": "This is a legacy prompt.",
                "expected": {"format": "legacy", "raw": "This is a legacy prompt."}
            },
            {
                "name": "Valid XML tags",
                "input": "<system>System content</system><task>Task content</task>",
                "expected": {
                    "format": "xml",
                    "sections": [
                        {"tag": "system", "content": "System content", "id": None, "name": None},
                        {"tag": "task", "content": "Task content", "id": None, "name": None}
                    ]
                }
            },
             {
                "name": "XML tags with attributes",
                "input": '<step id="step1" name="First Step">Step content</step>',
                "expected": {
                    "format": "xml",
                    "sections": [
                        {"tag": "step", "content": "Step content", "id": "step1", "name": "First Step"}
                    ]
                }
            },
            {
                "name": "Malformed XML (missing closing tag)",
                "input": "<system>Malformed",
                "expected": {"format": "legacy", "raw": "<system>Malformed"}
            },
            {
                "name": "Unknown tags should be ignored",
                "input": "<system>Valid</system><unknown>Ignored</unknown>",
                "expected": {
                    "format": "xml",
                    "sections": [
                        {"tag": "system", "content": "Valid", "id": None, "name": None}
                    ]
                }
            },
            {
                "name": "Mixed text and XML",
                "input": "Random text <system>Valid</system>",
                "expected": {
                    "format": "xml",
                    "sections": [
                        {"tag": "system", "content": "Valid", "id": None, "name": None}
                    ]
                }
            },
            {
                "name": "XML with no valid tags",
                "input": "<other>Something</other>",
                "expected": {"format": "legacy", "raw": "<other>Something</other>"}
            }
        ]

        passed = 0
        failed = 0

        for case in test_cases:
            print(f"Running test: {case['name']}...", end=" ")
            try:
                # We pass the input to the browser and execute PromptParser.parsePrompt
                result = page.evaluate("(input) => PromptParser.parsePrompt(input)", case['input'])

                if result == case['expected']:
                    print(f"✅ PASSED")
                    passed += 1
                else:
                    print(f"❌ FAILED")
                    print(f"   Input: {case['input']}")
                    print(f"   Expected: {json.dumps(case['expected'])}")
                    print(f"   Actual:   {json.dumps(result)}")
                    failed += 1
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                failed += 1

        print(f"\nResults: {passed} passed, {failed} failed")
        browser.close()

        if failed > 0:
            sys.exit(1)

if __name__ == "__main__":
    run_tests()
