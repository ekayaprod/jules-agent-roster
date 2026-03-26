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
    prompt: "..."
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

1.  **Stateless Rendering:** Components expose static methods that generate DOM elements or pure HTML strings based on passed data objects. This avoids internal component state management.
2.  **CSS Utilities:** The JS modules manage visibility and styling exclusively by toggling CSS utility classes (e.g., `.hidden`, `.success-state`) defined in the stylesheet, strictly avoiding inline `style` modifications.
3.  **Global Event Delegation:** Rather than attaching an event listener to every button inside an `AgentCard`, the parent container (`RosterApp.js`) listens for events and delegates them to the appropriate child using `event.target.closest`. The UI components here merely emit semantic data attributes (e.g., `data-action`) for the parent to act on.

### <a id="agentcard-architecture"></a> AgentCard Architecture

The `AgentCard.js` module renders individual agents as 3D interactive flip-cards.

*   **Lazy Loading:** To minimize initial DOM size and prevent rendering bottlenecks, complex nested elements (like parsed prompts) are loaded lazily using `AgentCard.getPromptNode(agent)`. The prompt content is injected only when the card is flipped.
*   **Encapsulation:** The `create` method strictly constructs the HTML string for the component without attaching any inner loop event listeners. It relies entirely on the global event delegation defined in `RosterApp.js`.
*   **Security:** To prevent XSS vulnerabilities, raw markdown content is securely rendered into pure DOM nodes using a custom `MarkdownRenderer` in `AgentCard.getPromptNode(agent)`, avoiding `innerHTML` entirely.

### <a id="clipboardutils-architecture"></a> ClipboardUtils Architecture

The `clipboard-utils.js` module centralizes logic for handling clipboard operations and managing momentary visual button states across the application.

*   **Graceful Degradation:** The `copyText` utility attempts to use the modern `navigator.clipboard` API first. If it is unavailable or blocked, it seamlessly falls back to a hidden `textarea` element utilizing `document.execCommand('copy')` to maintain functionality on older or strictly permitted browser environments.
*   **Visual State Management:** The `animateButtonSuccess` utility temporarily transitions button styles (swapping icons, modifying text) and automatically reverts them after a timeout. This is purely visual and completely decoupled from the data fetching or parsing layers.

### <a id="toastnotification-architecture"></a> ToastNotification Architecture

The `ToastNotification.js` manages an accessible, queued alert system.

*   **Accessibility:** The module automatically injects standard accessibility attributes based on the notification type. For example, `type="error"` uses `role="alert"` and `aria-live="assertive"` to immediately notify screen readers, while a `success` type uses a `polite` notification.
*   **Lifecycle Management:** It utilizes an internal timeout to auto-dismiss notifications. This timeout logic includes `pointerenter` and `pointerleave` event handlers to pause the auto-dismiss behavior, ensuring users are never rushed when reading a notification payload.
*   **Collision Prevention:** When a new `show()` command executes while an existing toast is visible, it immediately clears the previous timeout and overwrites the content, preventing multiple overlapping timeouts from abruptly dismissing the new alert.
