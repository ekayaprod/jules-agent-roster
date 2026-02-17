import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        print("Navigating to http://localhost:8080/index.html")
        await page.goto("http://localhost:8080/index.html")

        # Wait for data to load
        await page.wait_for_selector(".card:not(.skeleton-card)")

        # Setup download listener
        async with page.expect_download() as download_info:
            print("Clicking download button...")
            await page.click("#downloadAllBtn")

        download = await download_info.value
        path = await download.path()
        suggested_filename = download.suggested_filename

        print(f"Download triggered. Suggested filename: {suggested_filename}")

        if suggested_filename == "jules_roster_prompts.md":
            print("✅ Correct filename.")
        else:
            print(f"❌ Incorrect filename: {suggested_filename}")

        # Check file content
        with open(path, 'r') as f:
            content = f.read()
            if "JULES MASTER AGENT ROSTER" in content:
                print("✅ File content contains header.")
            else:
                print("❌ File content missing header.")

            if "Bolt+" in content: # Check for a specific agent
                print("✅ File content contains agents.")
            else:
                print("❌ File content missing agents.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
