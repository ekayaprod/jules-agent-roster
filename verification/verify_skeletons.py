from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        # Store intercepted routes
        held_routes = []

        # Intercept and HOLD agents.json
        def handle_route(route):
            print(f"Intercepted {route.request.url}, HOLDING...")
            held_routes.append(route)
            # Do NOT call continue_() here.

        # Handle requests to agents.json
        page.route("**/agents.json", handle_route)

        print("Navigating to page...")
        # Note: page.goto might wait for network idle, so we might need to use wait_until='domcontentloaded'
        # or it might hang if we hold the request.
        try:
            page.goto("http://localhost:8080/index.html", wait_until="domcontentloaded", timeout=5000)
        except Exception as e:
            print(f"Goto finished/timed out: {e}")

        # Wait for skeletons
        print("Waiting for skeletons...")
        try:
            page.wait_for_selector(".skeleton-card", state="visible", timeout=2000)
            print("Skeletons found!")
            page.screenshot(path="verification/skeletons.png")
        except Exception as e:
            print(f"Error finding skeletons: {e}")
            page.screenshot(path="verification/debug_no_skeletons.png")

        # Now release the route
        if held_routes:
            print(f"Releasing {len(held_routes)} held routes...")
            for route in held_routes:
                try:
                    route.continue_()
                except Exception as e:
                    print(f"Error continuing route: {e}")
        else:
            print("No routes were intercepted!")

        # Wait for agents to load
        print("Waiting for agents...")
        try:
            # wait for skeleton to disappear
            page.wait_for_selector(".skeleton-card", state="hidden", timeout=10000)
            # wait for cards
            page.wait_for_selector(".card", timeout=10000)
            print("Agents loaded!")
            page.screenshot(path="verification/loaded.png")
        except Exception as e:
            print(f"Error waiting for agents: {e}")

        browser.close()

if __name__ == "__main__":
    run()
