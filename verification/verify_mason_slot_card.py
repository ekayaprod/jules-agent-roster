from playwright.sync_api import sync_playwright, expect
import time

def test_slot_card_dimensions(page):
    page.goto("http://localhost:8107")
    time.sleep(1) # wait for render

    # Unlock some fusions
    page.evaluate('''() => {
        localStorage.setItem("fusion_discovery_state", JSON.stringify(["Architect,Author"]));
    }''')
    page.reload()
    time.sleep(1)

    # Click first slot
    page.locator("#slotACard").click()
    # Click an agent with a long name if possible, or just any agent
    page.locator('.mini-agent-card:has-text("Architect")').click()
    time.sleep(0.5)

    # Get bounding box of the slot card to verify it's not strictly 140x140
    box = page.locator("#slotACard").bounding_box()
    print(f"Slot A Box: {box}")

    # Take screenshot of the visual slots container
    page.locator(".fusion-visual-slots").screenshot(path="verification/mason_slot_card_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        test_slot_card_dimensions(page)
        browser.close()
