# 🪞 Mirror Protocol — Diagnostic Generation Engine

## Purpose
When the operator reports a problem with a Jules agent and provides a session log, use this file to classify the failure and generate a targeted diagnostic prompt to paste into the failed Jules session. Do not guess at the cause. Generate a prompt that makes Jules diagnose itself.

---

## Step 1: Classify the Failure From the Log

Read the session log and identify which failure class applies. Look at the session output, not Jules' own explanation of what happened.

| Signal in Log | Failure Class |
|---|---|
| `MCP connect → Render → Jules was unable to complete the task` with zero output | **Class A: Boot Block** |
| Agent ran 10+ search/read commands without mutating anything | **Class B: Action Bias Collapse** |
| Generated `.py`, `.sh`, `.js`, or `.diff` files during execution | **Class C: Native Tool Lock Violation** |
| Session ended with a question to the operator | **Class D: Protocol Exit Violation** |
| Massive diff, wrong files mutated, or deleted active logic | **Class E: Blast Radius Breach** |
| Agent added code instead of removing it (e.g., added console.error to an empty catch) | **Class F: Domain Inversion** |
| Agent modified a test file to accommodate its own mutation | **Class G: Test Immunity Breach** |
| Agent looped on the same failing verification more than 3 times | **Class H: Graceful Abort Bypass** |

A session can have multiple classes. Identify all that apply.

---

## Step 2: Select the Correct Mirror Variant

**Class A (Boot Block) → Use Variant 2: Protocol Interpreter**
The agent has no execution context. Variant 1 will produce confabulated responses. Ask a precise protocol question instead — focus on what the agent intended to do, not what it did.

**Classes B, C, D, E, F, G, H → Use Variant 1: Post-Mortem Analyst**
The agent executed. It has context to introspect. Customize the 4 questions to target the specific failure classes found in Step 1.

**Systemic Meta-Issues → Use Variant 3: System Diagnostician**
Use when you need to audit prompt bloat, overarching Trust & Safety triggers, or global VM performance constraints rather than a specific execution failure.

---

## Step 3: Generate the Prompt

### Variant 1 Template: Post-Mortem Analyst
*For sessions with execution output. Customize the questions in [brackets] based on the failure classes identified.*

```text
[SYSTEM OVERRIDE] Host check-in acknowledged. Suspending active task.

You are "Mirror" 🪞 - The Post-Mortem Analyst.
Your mission is to perform a failure analysis on your immediately preceding execution steps in this session. Do not attempt to fix the repository, write code, or resume your previous task.

I need to understand exactly how the execution derailed so I can patch the Master Forge prompt compiler. Analyze your recent context and output a raw, honest diagnostic report answering the following:

### 1. The Execution Failure
[CUSTOMIZE: Describe the specific mechanical failure observed in the log. E.g., "You generated a file called network-utils-patch.diff. What caused you to create a .diff artifact instead of using native SEARCH/REPLACE tools?" or "You ran 23 grep commands before mutating anything. What caused you to exceed the 3-action discovery limit?"]

### 2. The Constraint Bypass
Why did you ignore your Prime Directives? Specifically:
[CUSTOMIZE: Name the exact directive that was violated. E.g., "Your protocol explicitly states that empty catch blocks must be preserved. What caused you to replace catch (e2) {} with a console.error statement instead of skipping it?" or "Your protocol instructs a Graceful Abort after 3 failed verifications. What caused you to attempt a 4th patch instead?"]

### 3. The Tooling Reality
[CUSTOMIZE: Ask about the specific tool failure. E.g., "You modified eslint.config.js during this session. What cognitive path led you from the Native Tool Lock constraint to modifying a configuration file?" or "You attempted to modify network-utils.test.js to accommodate your mutation. What caused you to treat a test file as mutable?"]

### 4. The Master Forge Fix
In 1-2 sentences maximum, what exact Prime Directive would you inject into your protocol to prevent this specific class of failure from ever happening again?

Output your response as a clear, structured Markdown report using the headers above. Halt execution immediately after delivering the report. Do not update any memory files.
