from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the application
        page.goto("http://localhost:8080/")

        # Wait for agents to load
        page.wait_for_selector(".flip-card")

        # Mock window.rosterApp.fusionLab state to bypass picker and bypass settings modal
        page.evaluate("""
            document.getElementById('settingsModal').classList.remove('visible');
            const agentA = window.rosterApp.agents.find(a => a.name === 'Architect');
            const agentB = window.rosterApp.agents.find(a => a.name === 'Helix');
            window.rosterApp.fusionLab.state.slotA = agentA;
            window.rosterApp.fusionLab.state.slotB = agentB;
            window.rosterApp.fusionLab.renderSlots();
        """)

        # Click fuse button
        page.click("#fuseBtn")

        # Wait for result animation to complete (usually 3.5 seconds)
        page.wait_for_selector("#fusionResultContainer .flip-card", state="visible", timeout=10000)

        # Wait for the card to be fully revealed and pop-in animation to finish
        page.wait_for_timeout(1000)

        # Take screenshot of the fusion lab area
        element = page.locator("#fusionLabContent").locator("..")
        element.screenshot(path="fusion_result.png")

        browser.close()

if __name__ == "__main__":
    run()
