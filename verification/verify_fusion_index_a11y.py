import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Navigate
        url = "http://localhost:8080/index.html"
        print(f"Loading {url}...")
        await page.goto(url)

        # 2. Inject localStorage and reload
        # Key needs to match the sorting logic of FusionLab/FusionIndex
        # FusionLab.handleFusion sorts: key = [agentA.name, agentB.name].sort().join(",");
        # Let's use 'Scavenger' and 'Helix'. Sorted: 'Helix', 'Scavenger'.
        # Key should be "Helix,Scavenger"
        print("Injecting localStorage...")
        await page.evaluate("""
            localStorage.setItem('fusion_discovery_state', JSON.stringify(['Helix,Scavenger']));
        """)

        print("Reloading to apply state...")
        await page.reload()

        # Wait for JS to initialize
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_selector(".fusion-index-wrapper", timeout=5000)

        print("🔍 Inspecting Fusion Index Accessibility...")

        # 3. Verify the unlocked slot attributes
        # Key: Helix,Scavenger
        slot_selector = '.fusion-slot[data-key="Helix,Scavenger"]'

        try:
            await page.wait_for_selector(slot_selector, timeout=5000)
        except:
             # Fallback debug
             keys = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('.fusion-slot')).map(el => el.getAttribute('data-key'));
             }""")
             print(f"❌ FAIL: Slot {slot_selector} not found. Available keys: {keys}")
             exit(1)

        slot = page.locator(slot_selector)

        # Check attributes
        role = await slot.get_attribute("role")
        tabindex = await slot.get_attribute("tabindex")
        aria_label = await slot.get_attribute("aria-label")

        if role != "button":
            print(f"❌ FAIL: Expected role='button', got '{role}'")
            exit(1)
        if tabindex != "0":
            print(f"❌ FAIL: Expected tabindex='0', got '{tabindex}'")
            exit(1)
        if "Void" not in aria_label: # Name of Scavenger,Helix fusion
             print(f"❌ FAIL: Expected aria-label to contain 'Void', got '{aria_label}'")
             exit(1)

        print("✅ Attributes verified: role=button, tabindex=0, aria-label set.")

        # 4. Keyboard Interaction Test: ENTER
        print("⌨️ Testing Keyboard Interaction (ENTER)...")

        # Focus the slot
        await slot.focus()

        # Press Enter
        await page.keyboard.press("Enter")

        # Verify result - Fusion Name should be "Void 🕳️"
        fusion_name_loc = page.locator("#fusionName")
        # Wait for text to not be empty
        try:
            await page.wait_for_function("document.getElementById('fusionName') && document.getElementById('fusionName').innerText.length > 0", timeout=5000)
        except:
            print("❌ FAIL: Fusion name did not populate after pressing Enter.")
            exit(1)

        fusion_text = await fusion_name_loc.text_content()

        if "Void" not in fusion_text:
            print(f"❌ FAIL: Enter key did not load fusion. Got: '{fusion_text}'")
            exit(1)

        print("✅ ENTER key successfully loaded the fusion.")

        # Reset (Clear the output to be sure)
        await page.evaluate("document.getElementById('fusionName').innerText = ''")

        # 5. Keyboard Interaction Test: SPACE
        print("⌨️ Testing Keyboard Interaction (SPACE)...")

        # Focus the slot again
        await slot.focus()

        # Press Space
        await page.keyboard.press("Space")

        # Verify result
        try:
            await page.wait_for_function("document.getElementById('fusionName') && document.getElementById('fusionName').innerText.length > 0", timeout=5000)
        except:
             print("❌ FAIL: Fusion name did not populate after pressing Space.")
             exit(1)

        fusion_text = await fusion_name_loc.text_content()

        if "Void" not in fusion_text:
            print(f"❌ FAIL: Space key did not load fusion. Got: '{fusion_text}'")
            exit(1)

        print("✅ SPACE key successfully loaded the fusion.")

        print("💎 The Jeweler: Verify Complete. Visual & Interaction Polish Locked.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
