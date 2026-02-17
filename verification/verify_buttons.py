import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        print("Navigating to http://localhost:8080/index.html")
        await page.goto("http://localhost:8080/index.html")

        await page.wait_for_selector(".card:not(.skeleton-card)")

        print("Taking screenshot of buttons...")
        # Screenshot the controls area
        await page.locator(".controls").screenshot(path="verification/buttons.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
