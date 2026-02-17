import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        # Intercept and delay agents.json to see skeletons
        async def handle_route(route):
            if "agents.json" in route.request.url:
                print("Intercepted agents.json, delaying...")
                await asyncio.sleep(2) # Delay for 2 seconds
                await route.continue_()
            else:
                await route.continue_()

        await page.route("**/*", handle_route)

        print("Navigating to http://localhost:8080/index.html")
        await page.goto("http://localhost:8080/index.html")

        # Wait a bit for JS to run and render skeletons
        await page.wait_for_timeout(500)

        # Take screenshot of skeletons
        print("Taking screenshot of skeletons...")
        await page.screenshot(path="verification/skeletons.png")

        # Wait for data to load
        print("Waiting for agents to load...")
        await page.wait_for_selector(".card:not(.skeleton-card)", timeout=5000)

        # Take screenshot of final state
        print("Taking screenshot of final state...")
        await page.screenshot(path="verification/final.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
