from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(1000)

        # Click cancel on API key modal
        page.click("#closeSettingsBtn")
        page.wait_for_timeout(1000)

        page.evaluate("document.getElementById('julesRunnerPanel').scrollIntoView()")
        page.wait_for_timeout(500)

        # Inject our new dashboard item structure into julesTerminal to verify styling
        script = """
        const terminal = document.getElementById('julesTerminal');
        terminal.classList.add('active');
        terminal.innerHTML = `
          <div class="dashboard-item" id="session-123">
              <div class="dashboard-info">
                  <span class="emoji-hero" style="font-size: 1.5rem; margin-right: 0.5rem;">⚡</span>
                  <div>
                      <div class="dashboard-title">Bolt</div>
                      <div class="dashboard-meta">google/jules</div>
                  </div>
              </div>
              <div class="dashboard-status">
                  <span class="status-badge status-completed" id="status-123">Completed</span>
                  <a class="pr-link-btn" href="https://github.com/google/jules/pulls" target="_blank" rel="noopener noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4h-4"/><path d="M12 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2"/><polyline points="15 8 18 5 21 8"/></svg>
                    View PR
                  </a>
              </div>
          </div>
          <div class="dashboard-item" id="session-124">
              <div class="dashboard-info">
                  <span class="emoji-hero" style="font-size: 1.5rem; margin-right: 0.5rem;">🦅</span>
                  <div>
                      <div class="dashboard-title">Scavenger</div>
                      <div class="dashboard-meta">Analyzing dead code...</div>
                  </div>
              </div>
              <div class="dashboard-status">
                  <span class="status-badge status-in-progress" id="status-124">In Progress</span>
              </div>
          </div>
          <div class="dashboard-item" id="session-125">
              <div class="dashboard-info">
                  <span class="emoji-hero" style="font-size: 1.5rem; margin-right: 0.5rem;">🚨</span>
                  <div>
                      <div class="dashboard-title">Paramedic</div>
                      <div class="dashboard-meta" style="color: #ef4444;">Launch Error: API Key missing</div>
                  </div>
              </div>
              <div class="dashboard-status">
                  <span class="status-badge status-failed" id="status-125">Failed</span>
              </div>
          </div>
        `;
        """
        page.evaluate(script)
        page.wait_for_timeout(1000)

        page.screenshot(path="jules_dashboard.png")

        browser.close()

if __name__ == "__main__":
    run()
