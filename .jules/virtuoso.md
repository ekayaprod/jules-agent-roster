## 2026-02-23 - Fusion Lab Polish
**Learning:** Users hesitate when faced with technical error messages like "Self-fusion unstable".
**Action:** Replace technical jargon with actionable, empathetic guidance ("Select a different modifier").

## 2026-02-25 - Fusion Lab Error Standardization
**Learning:** The error "Cannot fuse an agent with itself" was too robotic.
**Action:** Standardized to "Unstable Reaction: Fusing an agent with itself creates a feedback loop." to match the scientific theme.

## 2026-02-26 - Agent Picker Polish
**Learning:** Disabled items in the picker were unclickable and had `pointer-events: none`, preventing users from seeing *why* they were disabled via tooltip.
**Action:** Removed `pointer-events: none` and added `cursor: not-allowed` to enable tooltips while maintaining disabled semantics. Also humanized the empty state copy.

## 2026-02-27 - Main Search Empty State Polish
**Learning:** The main search empty state used unstyled `<p>` tags with blunt, unhelpful copy ("No agents found. Try a different keyword."). This lacked the empathy and visual hierarchy found in modal empty states.
**Action:** Replaced the paragraph with structured `.empty-title` and `.empty-desc` elements. Added actionable, active-voice microcopy and harmonized the visual layout (flexbox, gap, and gradient background) with the modal's empty state.
