Yes! If we add `data-category-name="Refactoring"` to the card, we can use `::before`!
But wait, how does `AgentCard.create(agent, ...)` know the human-readable category name?
In `RosterApp.js`, it organizes by `category` (e.g., "refactoring", "coreGrid").
Wait, `index.html` has the text for the headers:
`<h2 id="refactoring" class="section-header">Refactoring</h2>`
If we just hide the original `h2.section-header` in desktop mode:
```css
@media (min-width: 640px) {
  .section-header { display: none; }
}
```
And instead, use `.grid > .card:first-child::before` to display the category!
Wait, `.grid > .card:first-child::before` won't work well if there's no way to know the *text* of the category.
But we can know it! The `.grid` elements have IDs like `refactoringGrid`, `coreGrid`.
So we can write specific CSS rules!
```css
#refactoringGrid > .card:first-child::before {
    content: "Refactoring";
}
#archGrid > .card:first-child::before {
    content: "Architecture";
}
/* ... */
```
Wait! The cards are `#refactoringGrid > .card:first-child`.
If we style the `::before` on the `.card`, where does it sit?
```css
@media (min-width: 640px) {
  .section-header { display: none; }

  .card {
    margin-top: 2.5rem; /* Room for the category header */
  }

  .grid > .card:first-child::before,
  .grid > .skeleton-card:first-child::before {
    position: absolute;
    top: -2rem; /* Sit above the card */
    left: 0.5rem; /* Align left */
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: var(--text-sm);
    font-weight: normal;
    white-space: nowrap;
    /* Other reset properties */
  }

  #coreGrid > *:first-child::before { content: "Core Maintenance"; }
  #refactoringGrid > *:first-child::before { content: "Refactoring"; }
  #archGrid > *:first-child::before { content: "Architecture"; }
  #hygieneGrid > *:first-child::before { content: "Hygiene"; }
  #testingGrid > *:first-child::before { content: "Testing"; }
  #opsGrid > *:first-child::before { content: "Operations"; }
  #documentationGrid > *:first-child::before { content: "Documentation"; }
  #strategyGrid > *:first-child::before { content: "Strategy"; }
  #uxGrid > *:first-child::before { content: "UX"; }
  #metaGrid > *:first-child::before { content: "Meta"; }
}
```
Wait, if `.card` has `position: relative`, the absolute `::before` will be relative to the card itself!
This is absolutely perfect. The header will always wrap with the card, sit exactly above the card, and never float away or take up horizontal flex line space! It is foolproof CSS layout.
Let's test this in `index.html`.
