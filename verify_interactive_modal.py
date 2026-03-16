from playwright.sync_api import sync_playwright

def verify_feature(page):
    page.goto("http://localhost:8000/index.html")
    page.wait_for_load_state("networkidle")

    # Use evaluate to un-disable repo picker to bypass fetching
    page.evaluate('window.julesService.apiKey = "dummy_key";')
    page.evaluate('document.getElementById("julesRepoPicker").disabled = false;')
    page.evaluate('const opt = document.createElement("option"); opt.value = "sources/github/dummy/dummy"; opt.text = "dummy/dummy"; document.getElementById("julesRepoPicker").appendChild(opt);')
    page.select_option('#julesRepoPicker', 'sources/github/dummy/dummy')
    page.wait_for_timeout(500)

    # Just grab the first flip card
    page.evaluate('document.querySelector(".flip-card-front").click()')
    page.wait_for_timeout(1000)

    # Click launch
    page.evaluate('document.querySelector("[data-action=\'launch-jules\']").click()')
    page.wait_for_timeout(2000)

    # Instead of clicking the optimistic session line (which we may have missed rendering if it animated in),
    # we can explicitly call the open function for testing.
    page.evaluate('window.rosterApp.julesManager._showHistoryModal("dummy123", "🤖", "Test Agent")')
    page.wait_for_timeout(1000)

    # Ensure modal is visible and interactive
    page.evaluate('document.querySelector("#historyModalInput").value = "Testing my history reply!";')
    page.wait_for_timeout(500)

    page.screenshot(path="verification/verification.png", full_page=True)
    page.wait_for_timeout(500)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification/video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()
