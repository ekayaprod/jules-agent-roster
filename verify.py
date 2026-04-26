from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:8080/index.html")
        page.wait_for_selector("#initial-loading-overlay", state="hidden")

        page.evaluate("""
            const modal = document.getElementById("fusionsModal");
            const listArea = document.getElementById("fusionsModalList");
            const downloadBtn = document.getElementById("downloadParentFusionsBtn");

            const listItems = `
                <li class="fusion-quick-list-item">
                    <button class="fusion-quick-btn" title="Bolt+">⚡</button>
                </li>
            `;
            listArea.innerHTML = `<ul class="fusion-quick-list-wrapper">${listItems}</ul>`;
            downloadBtn.style.display = "";
            modal.classList.add('visible');
        """)

        page.wait_for_timeout(500)
        page.screenshot(path="verification_fusion.png")

        browser.close()

if __name__ == "__main__":
    run()
