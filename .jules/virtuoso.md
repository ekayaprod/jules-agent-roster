## 2026-02-23 - Fusion Lab Polish
**Learning:** Users hesitate when faced with technical error messages like "Self-fusion unstable".
**Action:** Replace technical jargon with actionable, empathetic guidance ("Select a different modifier").

## 2026-02-25 - Fusion Lab Error Standardization
**Learning:** The error "Cannot fuse an agent with itself" was too robotic.
**Action:** Standardized to "Unstable Reaction: Fusing an agent with itself creates a feedback loop." to match the scientific theme.

## 2026-02-26 - Agent Picker Polish
**Learning:** Disabled items in the picker were unclickable and had `pointer-events: none`, preventing users from seeing *why* they were disabled via tooltip.
**Action:** Removed `pointer-events: none` and added `cursor: not-allowed` to enable tooltips while maintaining disabled semantics. Also humanized the empty state copy.
