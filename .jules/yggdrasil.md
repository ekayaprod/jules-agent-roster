## 2024-05-18 - 🌳 Yggdrasil - [Paradigm Mutated: js/utils/PromptParser.js]
**Learning:** Legacy imperative DOM manipulation (`for (let i = 0...`) can be cleanly and defensively rewritten using standard `Array.from()` to cast a `NodeList` to a functional array, enabling a declarative pipeline via `.filter()` and `.map()`.
**Action:** Always favor converting `NodeList` to Array. Keep extraction functional and avoid hidden state inside loop bodies.
