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
        print("Injecting localStorage...")
        await page.evaluate("""
            localStorage.setItem('fusion_discovery_state', JSON.stringify(['Helix,Scavenger']));
        """)

        print("Reloading to apply state...")
        await page.reload()

        # Wait for JS to initialize
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_selector(".fusion-index-wrapper", timeout=5000)

        # 3. Focus the unlocked slot
        slot_selector = '.fusion-slot[data-key="Helix,Scavenger"]'
        await page.wait_for_selector(slot_selector)

        # Scroll to element to ensure it's in viewport
        slot = page.locator(slot_selector)
        await slot.scroll_into_view_if_needed()

        print("Focusing unlocked slot...")
        await slot.focus()

        # 4. Take screenshot of the focused state
        screenshot_path = "verification/fusion_index_focus.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
