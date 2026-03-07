from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock API to bypass modal blocks and errors
        page.add_init_script("""
            window.julesService = {
                apiKey: 'mock-key',
                getSources: async () => ({ sources: [] }),
                getSessions: async () => ({ sessions: [] })
            };
        """)

        page.goto("http://localhost:8080/")

        # Dismiss any modals that might prevent interaction
        page.evaluate("""
            const modal = document.getElementById('settingsModal');
            if(modal) modal.style.display = 'none';
        """)

        # Wait for the first agent card front and click it
        card = page.locator('.flip-card').first
        card.wait_for(state="visible", timeout=10000)

        card_front = card.locator('.flip-card-front')
        card_front.click(force=True)

        # Wait for the card to get the flipped class
        page.wait_for_selector('.flip-card.flipped', state='visible', timeout=5000)

        # Take a screenshot of the back of the card
        prompt_area = card.locator('.prompt-scroll-area').first
        page.wait_for_selector('.flip-card.flipped .prompt-scroll-area .details-content', state='visible', timeout=5000)

        prompt_area.screenshot(path="screenshot_prompt_preview.png")
        page.screenshot(path="screenshot_full_flipped.png")

        browser.close()

if __name__ == "__main__":
    verify()
