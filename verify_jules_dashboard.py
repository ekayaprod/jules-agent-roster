from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Mock the JulesService to prevent settings modal and simulate API data
        page.route('**/*', lambda route: route.continue_())

        page.goto('http://localhost:8080')
        page.wait_for_load_state('networkidle')

        # Bypass settings modal by directly evaluating js if needed
        page.evaluate('''() => {
            window.julesService = {
                apiKey: 'test-key',
                configure: () => {},
                getSources: async () => ({
                    sources: [{name: 'sources/github/google/jules', githubRepo: {owner: 'google', repo: 'jules'}}]
                }),
                getSessions: async () => ({
                    sessions: [
                        {
                            id: 'session-123',
                            title: 'Scavenger',
                            sourceContext: { source: 'sources/github/google/jules' },
                            outputs: []
                        },
                        {
                            id: 'session-456',
                            title: 'Bolt',
                            sourceContext: { source: 'sources/github/google/jules' },
                            outputs: [{ pullRequest: { state: 'OPEN', title: 'Performance tweaks', url: 'http://pr' } }]
                        }
                    ]
                }),
                getActivities: async () => ({ activities: [] })
            };
            if(window.rosterApp && window.rosterApp.julesManager) {
                window.rosterApp.julesManager.loadSources();
            }
            const modal = document.getElementById('settingsModal');
            if (modal) modal.classList.remove('visible');
        }''')

        # Select a repository to trigger the loading of active sessions
        page.select_option('#julesRepoPicker', value='sources/github/google/jules')

        # Wait a moment for rendering
        page.wait_for_timeout(1000)

        # Take screenshot of the execution panel
        panel = page.locator('#julesRunnerPanel')
        panel.scroll_into_view_if_needed()
        panel.screenshot(path='jules_dashboard_verified.png')

        browser.close()

if __name__ == '__main__':
    verify_dashboard()
