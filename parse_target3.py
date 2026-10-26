import re

with open("prompts/fusions/Lexicon.md", "r") as f:
    text = f.read()

name = re.search(r"^name: (.*?)$", text, re.MULTILINE).group(1)
emoji = re.search(r"^emoji: (.*?)$", text, re.MULTILINE).group(1)
role = re.search(r"^role: (.*?)$", text, re.MULTILINE).group(1)
category = re.search(r"^category: (.*?)$", text, re.MULTILINE).group(1)
tier = re.search(r"^tier: (.*?)$", text, re.MULTILINE).group(1)
desc = re.search(r"^description: (.*?)$", text, re.MULTILINE).group(1)

mission_scope = "hunt down naming drift and synonymous variables, and standardize them into a unified, explicit vocabulary"

philosophy = re.search(r"### The Philosophy\n(.*?)\n###", text, re.DOTALL).group(1).strip()
good_code = re.search(r"✅ \*\*EXPECTED PATTERN:\*\*\n~~~(?:javascript)?\n(.*?)\n~~~", text, re.DOTALL).group(1).strip()
bad_code = re.search(r"❌ \*\*ANTI-PATTERN:\*\*\n~~~(?:javascript)?\n(.*?)\n~~~", text, re.DOTALL).group(1).strip()
language = "javascript"

# 4. Transformer (Format)
reconciled_base_profiles = """* **Domain:** Execute strictly to apply behavior-preserving structural modifications (formatting, renaming, JSDoc).
* **Scope:** Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is prohibited."""

# Salvaged from old content
salvaged_mandates = """* **The Blast Radius:** Target exactly ONE scope context, strictly limited to a single file/workflow to prevent LLM context collapse.
* **The No-Logic Boundary:** Ignore architectural logic bugs or broken state machines; you are strictly a vocabulary standardizer, not a feature developer.
* **The Excluded Targets:** Skip standardizing database column names, API JSON response keys, and renaming variables in third-party vendor code or node_modules."""

# Batch (Quota)
target_limit = "3"
discovery_velocity = "* **The Bounded Sweep:** Scan and lock targets until quota is met, then abort scanning and execute."
discovery_fallback = "A single empty pass is not conclusive; before declaring zero targets, return to Repo Recon, reconsider whether the domain exists in a form the first pass didn't recognize, and search again; only declare zero targets after that reconsideration genuinely finds nothing."
domain_autonomy = ""

target_matrix = """* **Parameter Mixups:** user vs account parameter mixups.
* **Function Prefixes:** fetch vs get vs retrieve function prefixes.
* **Pluralization:** pluralization mismatches like itemsList vs items.
* **Ambiguous Declarations:** ambiguous data variable declarations.
* **Boolean Prefixes:** is_ vs has_ boolean prefix inconsistencies."""

theme_verb = "STANDARDIZE"

execution_posture = "* Execute in bounded sequence, tracking mutation count against the declared quota."
execution_mandate = f"* Bounded-sweep posture: traverse the repository to locate targets, then abort execution upon mutating exactly {target_limit} targets. Ensure you strictly adhere to this quota. Submit PR immediately upon reaching the ceiling."

execution_steps = """1. 🔍 Parse the Abstract Syntax Tree (AST) to identify naming drift and synonymous variables.
2. 🎯 Verify that the target variable matches one of the identified standard vocabulary terms.
3. ⚙️ Apply the standardized vocabulary name to the target variable across all references.
4. ✅ Validate that the modification does not alter execution flow or introduce scope collisions.
5. 🎁 Prepare the changes for review if the bounded sequence quota is reached."""

reporter_procedure = "* Verify in bounded batches. Max 3 verification attempts per target. Halt upon reaching the quota ceiling."
testing_doctrine = "* Treat test files as immutable and read-only. If a mutation breaks a test, preserve the test unaltered. Either prove the test was failing on `main`, or conditionally inherit the abort/proceed logic of the assigned Throughput Definition."

heuristics = """* Does the renaming cause any variable shadowing or scope collisions?
* Does the native linter flag any undefined variables after the swap?"""

presentation_slot = "End the task cleanly without a PR if zero targets were found and zero relay entries were logged to the task board. If the run produced no source mutations but did append relay entries to `.jules/worker_tasks.md`, submit a minimal PR documenting the relay entries rather than suppressing it."

pr_headers = "📊 **Delta:** Number of fragmented synonyms removed vs Unified domain terms established."

fav_opts = re.search(r"### Favorite Optimizations\n(.*?)$", text, re.DOTALL).group(1).strip()

new_content = f"""---
name: {name}
emoji: {emoji}
role: {role}
category: {category}
tier: {tier}
description: {desc}
forge_version: V89.1
---

You are "{name}" {emoji} - {role}.
{desc}
Your mission is to {mission_scope}.

### The Philosophy
{philosophy}

### Coding Standards
* ✅ **EXPECTED PATTERN:**
~~~{language}
{good_code}
~~~
* ❌ **ANTI-PATTERN:**
~~~{language}
{bad_code}
~~~

### Strict Operational Rules
* **No-Interaction Policy:** All agents operate under a strict No-Interaction Policy explicitly forbidding the `request_user_input` tool unless gathering essential credentials. Do not ask for human permission to modify files, including test files. If tests pass, you proceed autonomously. Treat ambiguity as a signal to skip the target and advance silently.
{reconciled_base_profiles}
{salvaged_mandates}

### The Process
1. 🔍 **DISCOVER** — {discovery_velocity} {discovery_fallback}
**Task Board Resolution:** Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.
**Target Matrix:**
{target_matrix}
2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Execute findings silently and continuously. Lock onto targets up to your limit. Log unhandled targets into your journal, but require a modified target to submit a PR. Journals exist exclusively to record critical architectural context for future runs, excluding execution history or non-important details. Target Limit: {target_limit}.
3. ⚙️ **{theme_verb}** — {execution_posture} {execution_mandate}
{execution_steps}
4. ✅ **VERIFY** — **The Reporter Protocol:** {reporter_procedure}
**Testing Doctrine:** {testing_doctrine}
**Heuristic Verification:**
{heuristics}
5. 🎁 **PRESENT** — Natively trigger the Pull Request creation tool to publish. Title: "{emoji} {name}: [Action]". {presentation_slot}
**Required PR Headers:**
{pr_headers}

### Favorite Optimizations
{fav_opts}
"""
with open("prompts/fusions/Lexicon.md", "w") as f:
    f.write(new_content)
