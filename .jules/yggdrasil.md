## 2024-05-18 - 🌳 Yggdrasil - [Paradigm Mutated: js/utils/PromptParser.js]
**Learning:** Legacy imperative DOM manipulation (`for (let i = 0...`) can be cleanly and defensively rewritten using standard `Array.from()` to cast a `NodeList` to a functional array, enabling a declarative pipeline via `.filter()` and `.map()`.
**Action:** Always favor converting `NodeList` to Array. Keep extraction functional and avoid hidden state inside loop bodies.
## 2025-02-13 - 🌳 Yggdrasil - [Mutated FusionCompiler from OOP to Functional Pipeline]
**Learning:** Legacy Object-Oriented classes that strictly provide data normalization and pure logical operations (like string stitching) are prone to `this.` context leakage and imperative boilerplate loops (e.g., `Object.keys(data).forEach()`).
**Action:** Reincarnated `FusionCompiler` into a pure functional module (factory closure) returning a frozen object interface. Replaced `forEach` push mutations with declarative `Object.fromEntries(Object.entries().map(...))` pipelines. This perfectly preserved the public API (passing all Jest tests via `new FusionCompiler()`) while eliminating hidden state mutations.
