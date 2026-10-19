# Agents Journal
- Consolidated early operations: Successfully propagated canonical header emojis across several early domain files.
- Insight: Complex markdown parsing requires careful handling of structural markers and zero-width joiners in emojis to avoid accidental false positives.
- Echo Insight: Using regex matching for emoji presentation (`\p{Emoji_Presentation}|\p{Emoji}\uFE0F`) while ignoring universal structural markers (`✅`, `❌`, `🔍`, `🎯`, `⚙️`, `🎁`) allows safe propagation of canonical emoji to body elements.
