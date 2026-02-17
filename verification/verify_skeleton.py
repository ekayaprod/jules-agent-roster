import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Intercept and delay agents.json to see skeletons
        async def handle_route(route):
            if "agents.json" in route.request.url:
                print("Intercepted agents.json, delaying...")
                await asyncio.sleep(2) # Delay for 2 seconds
                await route.continue_()
            else:
                await route.continue_()

        await page.route("**/*", handle_route)

        try:
            # We assume the server is running on port 8080
            print("Navigating to http://localhost:8080/index.html")
            await page.goto("http://localhost:8080/index.html")

            # Allow a brief moment for init to fire and render skeletons
            await page.wait_for_timeout(100)

            # Check for skeletons immediately/during delay
            print("Checking for skeletons...")
            skeletons = await page.locator(".skeleton-card").count()
            print(f"Found {skeletons} skeletons.")

            if skeletons > 0:
                print("✅ Skeletons are visible.")
            else:
                print("❌ Skeletons NOT found.")
                # We don't fail immediately, maybe it loaded super fast? But with 2s delay it should be there.

            # Wait for data to load (agents.json delay is 2s)
            print("Waiting for agents to load...")
            # We wait for the real cards.
            # Real cards have class 'card' but NOT 'skeleton-card'.
            # Wait up to 5 seconds.
            await page.wait_for_selector(".card:not(.skeleton-card)", timeout=5000)

            # Check skeletons are gone
            skeletons_after = await page.locator(".skeleton-card").count()
            print(f"Skeletons after load: {skeletons_after}")

            if skeletons_after == 0:
                print("✅ Skeletons are gone.")
            else:
                print("❌ Skeletons still present.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
