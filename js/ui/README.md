# UI Components

## Purpose
This directory contains the Vanilla JavaScript functional components that define the visual layout and interaction logic for the Jules Roster UI. These modules abstract away direct DOM manipulation into reusable, declarative rendering functions and utilities.

## Quick Start
To generate an Agent Card HTML string:

```javascript
const agent = {
    name: "Architect",
    category: "engineering",
    description: "Structural refactoring and code organization.",
    prompt: "...",
    usedIn: "Code Refactoring"
};

const cardHtml = AgentCard.create(agent);
document.getElementById('roster-grid').innerHTML += cardHtml;
```

To display a Toast Notification:

```javascript
ToastNotification.show("Fusion unlocked!");
```

To copy text to the clipboard and animate the triggering button:

```javascript
const button = document.getElementById('copy-btn');
const text = "Copy this prompt.";

ClipboardUtils.copyToClipboard(text, button, "Agent Name");
```

## Architecture
These components follow a strict Vanilla JS philosophy without a build step or virtual DOM framework (like React).

1.  **Stateless Rendering:** Components like `AgentCard.js` expose static `create` methods that generate pure HTML strings based on the passed data object. This structure avoids managing internal component state.
2.  **Lazy Loading:** To minimize initial DOM size, complex nested HTML (like parsed prompts) is loaded lazily using methods like `AgentCard.getPromptHtml(agent)`.
3.  **CSS Utilities:** The JS modules manage visibility and styling exclusively by toggling CSS utility classes (e.g., `.hidden`) defined in the `css/styles.css` stylesheet, avoiding inline `style` modifications.
4.  **Global Event Delegation:** Rather than attaching an event listener to every button inside an `AgentCard`, the parent container (`RosterApp.js`) listens for events and delegates them to the appropriate child using `event.target.closest`. The UI components here merely emit semantic data attributes (e.g., `data-action`) for the parent to act on.
