
import time
from playwright.sync_api import sync_playwright
import os

def benchmark():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.goto("http://localhost:8000/index.html")

        # Wait for agents to load
        try:
            page.wait_for_selector(".card", timeout=5000)
        except Exception as e:
            print("Timeout waiting for cards. Are agents.json loading?")
            page.screenshot(path="debug_error.png")
            print("Saved debug_error.png")
            raise e

        # Inject script to multiply agents
        page.evaluate("""
            () => {
                const originalCards = Array.from(document.querySelectorAll('.card'));
                if (originalCards.length === 0) {
                    console.error("No cards found!");
                    return;
                }
                const firstGrid = document.querySelector('.grid');

                let currentCount = originalCards.length;
                const targetCount = 500; // Reduce for safety first

                let i = 0;
                while (currentCount < targetCount) {
                    const card = originalCards[i % originalCards.length];
                    if (card) {
                        const clone = card.cloneNode(true);
                        firstGrid.appendChild(clone);
                        currentCount++;
                    }
                    i++;
                }
                console.log(`Expanded roster to ${currentCount} agents.`);
            }
        """)

        # Warm up
        page.fill("#searchInput", "test")
        page.fill("#searchInput", "")
        time.sleep(0.5)

        start_time = time.time()
        iterations = 20 # Reduce iterations

        print(f"Starting benchmark with {iterations} iterations...")

        for i in range(iterations):
            term = "e" if i % 2 == 0 else "z"
            page.fill("#searchInput", term)
            # Force a reflow
            page.evaluate("document.body.offsetHeight")

        end_time = time.time()
        duration = end_time - start_time

        print(f"Total time: {duration:.4f}s")
        print(f"Average time per iteration: {(duration/iterations)*1000:.2f}ms")

        browser.close()

if __name__ == "__main__":
    benchmark()
