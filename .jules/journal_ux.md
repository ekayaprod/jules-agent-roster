## 🐝 Hive Axioms
1. [RESILIENCE] All fetch calls must implement a 15s AbortController and handle transient network errors.
2. [HYGIENE] Prohibit empty catch blocks; use native logging.
3. [ARCHITECTURE] The physical file tree structure must directly mirror the exported PascalCase ES6 domain convention.
4. [VALIDATION] All JSON and storage parsing must be protected by explicit try/catch error boundaries.
5. [STABILITY] Limit integrations strictly to isolated, bounded contexts to prevent test collapse.
6. [UI/UX] Replace static disablement and generic errors with active, context-aware microcopy and proper aria attributes.
7. [PERFORMANCE] Flatten multi-pass array iterations into direct `for` loops for high-throughput data paths.

# Historical Archive

**Barrier:** Various hardcoded colors, pixel widths, disabled states, and keyboard traps breaking accessibility constraints and design system scales. | **Empathy:** Enforced global cohesion by swapping static disabled properties for `aria-disabled`, converting hardcoded hex/pixel values to CSS variables (e.g. `var(--text-xs)`), bounding Escape key handlers for dropdowns, validating Enter/Space dispatch on interactive slots, and enforcing strict WCAG AA/AAA scales across UI primitives.

**Barrier:** Hardcoded 13px font size breaking visual rhythm and accessibility scales. | **Empathy:** Extradited arbitrary pixel measurement and replaced it with canonical relative variable `var(--text-xs)` to enforce scale and support OS-level scaling.
