## Historical Learnings (Pruned & Summarized)
Previous Inspector executions added coverage across Utils, JulesManager, MarkdownRenderer, and RarityEngine.
Key insights focused on jsdom isolation boundaries, verifying unhandled promise catches in polling loops, and enforcing strict string properties on edge-case combinations.

2026-03-12
**Title**: 🕵️ Inspector - [Interrogated Boundaries: JulesManager Polling Mock Resilience]
**Learning**: Testing UI state polling requires strict DOM synchronization. Old dashboard classes (dashboard-meta) were replaced with terminal strings (term-status).
**Action**: Assured accurate boundary limit logic by testing direct node injection strings in polling tests.
