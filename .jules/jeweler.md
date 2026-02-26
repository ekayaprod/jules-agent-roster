## 2026-02-23 - [Polished & Protected UI: Download Dropdown]
**Learning:** Simulated keyboard events (e.g., `Enter` on a button) in headless Playwright environments may not reliably trigger native `click` or `keydown` events due to focus timing or browser quirks. Explicit `keydown` handlers for activation keys (Enter/Space) provide robustness, but testing them may require workarounds (like using `.click()` to open) while still verifying the listener logic via other keys (Escape/Arrows).
**Action:** Always include explicit `keydown` handlers for interactive elements to ensure accessibility compliance, even if native `<button>` behavior covers it in most browsers. Use verification scripts that isolate specific behaviors (e.g., testing `Escape` key logic separately from activation logic).

## 2026-02-23 - [Polished & Protected UI: Download Dropdown Focus Trap]
**Learning:** Testing menu navigation keys (Home/End) requires at least two focusable items to verify focus movement; single-item menus yield misleading test results. Additionally, relying solely on `keydown` for `Tab` key behavior is insufficient; implementing a `focusout` listener on the container ensures robust closing behavior when focus naturally leaves the component via Tab or click.
**Action:** When testing list navigation, always inject a dummy second item if the default state has only one. Use `focusout` listeners to manage "close on blur" interactions instead of intercepting `Tab` keydown, which can interfere with natural focus flow.

## 2026-02-26 - [Polished & Protected UI: Agent Picker]
**Learning:** Playwright's Python `expect().to_have_class()` assertion strictly requires strings or regular expressions; lambdas are not supported, causing test failures even when logic is correct. Also, `role="button"` inside a grid/listbox context should avoid `aria-selected`; `role="option"` with Roving Tabindex is the semantic gold standard for single-select grids.
**Action:** Use `re.compile(r"pattern")` for flexible class assertions in Python tests. Implement Roving Tabindex manually for composite widgets to ensure keyboard navigation (Arrows/Home/End) works predictably across screen readers.
