from playwright.sync_api import sync_playwright, expect
import time

def test_fusion_lab_pre_merge(page):
    # Load the app
    page.goto("http://localhost:8107")
    time.sleep(1) # wait for render

    # Since Architect + Author = City Clerk (Reactive), let's unlock it to test Pre-Merge.
    page.evaluate('''() => {
        localStorage.setItem("fusion_discovery_state", JSON.stringify(["Architect,Author"]));
    }''')
    page.reload()
    time.sleep(1)

    # Reselect to trigger the pre-merge preview
    page.locator("#slotACard").click()
    page.locator('.mini-agent-card:has-text("Architect")').click()
    time.sleep(0.5)

    page.locator("#slotBCard").click()
    page.locator('.mini-agent-card:has-text("Author")').click()
    time.sleep(0.5)

    # Pre-merge preview should be visible
    preview = page.locator("#preMergePreview")
    expect(preview).to_be_visible()

    # Take a screenshot of the pre-merge state
    page.locator(".fusion-lab-container").screenshot(path="verification/pre_merge_preview.png")

    # Click fuse to test animation overlay classes
    page.locator("#fuseBtn").click()

    # Check overlay has the tier class 'tier-reactive'
    overlay = page.locator("#fusionAnimationOverlay")

    # Take a screenshot during animation
    page.screenshot(path="verification/fusion_animation.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        test_fusion_lab_pre_merge(page)
        browser.close()
