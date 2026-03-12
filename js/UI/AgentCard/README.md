# AgentCard Component Architecture

## Purpose

The `AgentCard` module is responsible for the pure generation of the individual 3D interactive flip-card UI elements. It encapsulates the complex HTML structure, dynamic class assignment (for rarity tiers, scopes, and billing types), and localized state formatting.

## <a id="agentcard-architecture"></a> Architectural Implementation

The module is implemented as a static utility class designed for high-performance virtual rendering. It intentionally avoids internal state management and directly binds to the DOM environment.

### 1. DOM Generation & Structure

The primary output is an `HTMLElement` containing the nested `.flip-card-inner`, `.flip-card-front`, and `.flip-card-back` structures required for CSS-driven 3D transforms.

The back of the card serves as a mount point for the markdown-rendered protocol instructions, which are generated dynamically by the `MarkdownRenderer` utility.

### 2. Event Delegation

To support thousands of potential agents rendering concurrently (e.g., during a search), the `AgentCard` strictly **does not** attach inline event listeners to the cards it generates.

Instead, it injects semantic `data-action` and `data-index` attributes onto interactive elements (like the flip trigger, pin button, and primary action buttons). The parent container (such as the `RosterApp` grid or `SearchController` cluster) is expected to use a single delegated event listener to capture and route these interactions.

### 3. Contextual Actions

The card autonomously adapts its primary call-to-action button based on the application's global state. If a target repository is selected in the `#julesRepoPicker` global element, the card prioritizes the "Launch in Jules" execution path. If no repository is selected, it defaults to the "Copy Prompt" action.

### 4. Render Throttling

To prevent layout thrashing and provide a smooth cascading entrance effect, the `AgentCard` applies a staggered CSS `animation-delay` based on its global render index, strictly capped at a maximum threshold to ensure immediate interactivity for items lower in the list.
