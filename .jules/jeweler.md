## 2026-02-23 - [Polished & Protected UI: Download Dropdown]
**Learning:** Simulated keyboard events (e.g., `Enter` on a button) in headless Playwright environments may not reliably trigger native `click` or `keydown` events due to focus timing or browser quirks. Explicit `keydown` handlers for activation keys (Enter/Space) provide robustness, but testing them may require workarounds (like using `.click()` to open) while still verifying the listener logic via other keys (Escape/Arrows).
**Action:** Always include explicit `keydown` handlers for interactive elements to ensure accessibility compliance, even if native `<button>` behavior covers it in most browsers. Use verification scripts that isolate specific behaviors (e.g., testing `Escape` key logic separately from activation logic).

## 2026-02-23 - [Polished & Protected UI: Download Dropdown Focus Trap]
**Learning:** Testing menu navigation keys (Home/End) requires at least two focusable items to verify focus movement; single-item menus yield misleading test results. Additionally, relying solely on `keydown` for `Tab` key behavior is insufficient; implementing a `focusout` listener on the container ensures robust closing behavior when focus naturally leaves the component via Tab or click.
**Action:** When testing list navigation, always inject a dummy second item if the default state has only one. Use `focusout` listeners to manage "close on blur" interactions instead of intercepting `Tab` keydown, which can interfere with natural focus flow.

## 2026-02-26 - [Polished & Protected UI: Agent Picker]
**Learning:** Playwright's Python `expect().to_have_class()` assertion strictly requires strings or regular expressions; lambdas are not supported, causing test failures even when logic is correct. Also, `role="button"` inside a grid/listbox context should avoid `aria-selected`; `role="option"` with Roving Tabindex is the semantic gold standard for single-select grids.
**Action:** Use `re.compile(r"pattern")` for flexible class assertions in Python tests. Implement Roving Tabindex manually for composite widgets to ensure keyboard navigation (Arrows/Home/End) works predictably across screen readers.

## 2026-02-28 - [Polished & Protected UI: Fusion Index Shelf]
**Learning:** When retrofitting interactive behavior onto `div` elements, explicit `keydown` listeners for `Enter` and `Space` are mandatory for keyboard accessibility; relying on `click` is insufficient as browsers do not auto-trigger clicks on non-buttons via keyboard. Furthermore, testing `localStorage` hydration requires careful sequencing: navigating to the page, injecting the data, and then reloading the page ensures the application initializes with the correct state.
**Action:** Always pair `role="button"` with `tabindex="0"` and an explicit `keydown` handler (`Enter`/`Space`) when upgrading non-semantic elements. For state-dependent tests, favor a "Load → Inject → Reload" pattern to guarantee clean state initialization.

## 2026-03-01 - [Polished & Protected UI: Tooltip Focus States]
**Learning:** When implementing pure CSS tooltips using `::after` pseudo-elements, relying on `:focus` to trigger visibility creates an accessibility trap for mouse users (the tooltip remains permanently visible after clicking until another element is focused). Furthermore, using a `<span>` with `role="tooltip"` and `tabindex="0"` is an anti-pattern for the *trigger* element itself.
**Action:** Always upgrade interactive tooltip triggers to semantic `<button type="button">` elements. Bind the tooltip visibility strictly to `:hover` and `:focus-visible` (never `:focus`), and ensure the button has a distinct, high-contrast `:focus-visible` ring.
