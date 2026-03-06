Oh! The code reviewer is completely right.
The screenshot DID show `REF...` and `ARC...` at the very edge! I missed that when I looked at it!
This means `flex-basis: 20rem;` and `margin-left: -21rem` on the card just pulled the card to the LEFT, but left the header wherever it originally landed in the flex flow!
Because the first item in the `.grid` was pulled left by 21rem, it overlapped whatever was to its left, NOT necessarily its own header if its own header wrapped differently!

Let's rethink this entirely.
The user wants:
A row fits 3 cards.
Card 1: Refactor (has Refactor title above it)
Card 2: Refactor
Card 3: Architecture (has Architecture title above it)

This means the headers and cards are flowing continuously.
If we change `.section-header` and `.card` to flow continuously, we want the `.section-header` to NOT take up any horizontal space in the flex line, but ALWAYS sit above the first card of its category.

Wait!
If the header is inside the `.grid` container, but `.grid` is `display: contents`, it is a sibling of the cards.
What if we use `position: relative` on the FIRST card, and `position: absolute` on the header?
We can't easily position an absolute element relative to a NEXT sibling.
But wait! What if the header is just a normal block element?
If `#main` is `display: flex; flex-wrap: wrap;`, a block element with `width: 100%` will force a line break.
The user explicitly wants: "Card 3 is an architecture card so it starts the architecture category with the 'Architecture' title above it." -> IN THE SAME ROW as the Refactor cards!
So the header MUST NOT force a line break!

How can a header sit *above* a card, inside a flex container, without pushing the card down or right?
Wait! If the header has `width: 0; height: 0; overflow: visible;` it takes 0 space.
But it needs to be *at the exact same flex position* as the first card.
If the header is just before the first card in the DOM:
```html
<h2 class="section-header">Architecture</h2>
<div class="card">Arch 1</div>
```
If `h2` has `width: 0; height: 0; overflow: visible;`, it will be placed at whatever point the flex line is at.
Then the `.card` is placed immediately AFTER it.
Since `h2` has 0 width, the `.card` is placed at the EXACT SAME horizontal position as the `h2`!
And since the `.card` might wrap to the next line if it doesn't fit, the `h2` might stay on the previous line! THAT is the problem. The `h2` fits on the previous line (because it's 0 width), but the card (20rem) wraps!

To force them to wrap *together*, we must ensure that the `h2` and the `card` are treated as a single unit for wrapping.
But they are siblings.
Can we use `break-inside: avoid;`? No, doesn't work for flexbox wrapping.

Wait... Is there a way to make the *first card* itself contain the header?
Yes! In `RosterApp.js`, when we render the agents, we could inject the category header into the first card of each category!
Or, we can use CSS `::before` pseudo-element on the first card!
```css
.grid > .card:first-child::before {
  content: attr(data-category-name);
  position: absolute;
  top: -2rem; /* or whatever */
  left: 0;
  text-transform: uppercase;
  /* ... */
}
```
Wait! If we use a pseudo-element on the first card, it will naturally move WITH the first card! It will NEVER be separated from it!
Does the first card know its category name?
In `RosterApp.js`, does the `.card` have a `data-category` attribute?
Let's check `AgentCard.js` or `RosterApp.js`!
