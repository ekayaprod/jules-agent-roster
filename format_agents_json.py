import json
import os

BASE_AGENTS_FILE = 'agents.json'

# The pristine FTUE metadata dictionary with actionable, ultra-clear roles
FTUE_METADATA = {
    "Bolt+": {
        "role": "Speed Optimizer",
        "desc": "Hunts down sluggish code and structural bottlenecks. Wraps heavy calculations in system caches to make your app run at lightning speed."
    },
    "Palette+": {
        "role": "UI Polisher",
        "desc": "Transforms clunky interactions into delightful experiences. Injects loading skeletons, smooth animations, and accessibility to make your app feel premium."
    },
    "Sentinel+": {
        "role": "Security Guard",
        "desc": "Hardens your application's trust boundaries. Injects strict schema validations and sanitizes data payloads to protect your system from malicious inputs."
    },
    "Helix": {
        "role": "Code Consolidator",
        "desc": "Hunts down duplicated spaghetti code scattered across your files. Extracts it into clean, shared utility functions to give your app a single source of truth."
    },
    "Architect": {
        "role": "Folder Organizer",
        "desc": "Untangles chaotic directories and unmaintainable monoliths. Splits massive files and enforces clean folder structures to keep your repository highly organized."
    },
    "Scavenger": {
        "role": "Trash Collector",
        "desc": "A ruthless cleanup specialist. Hunts down and permanently deletes orphaned files, dead code, and resolved TODOs to reduce technical debt and codebase bloat."
    },
    "Superintendent": { # Also handles "Janitor" depending on local state
        "role": "Dependency Manager",
        "desc": "Keeps your underlying infrastructure healthy. Safely bumps outdated packages, cleans up lockfiles, and standardizes configuration manifests."
    },
    "Janitor": {
        "role": "Dependency Manager",
        "desc": "Keeps your underlying infrastructure healthy. Safely bumps outdated packages, cleans up lockfiles, and standardizes configuration manifests."
    },
    "Modernizer": {
        "role": "Code Upgrader",
        "desc": "Upgrades legacy syntax to modern standards. Transmutes old callbacks, heavy loops, and outdated libraries into clean, modern language paradigms."
    },
    "Inspector": {
        "role": "Test Writer",
        "desc": "A paranoid quality-assurance agent. Seeks out your application's most fragile logic and locks it down with rigorous boundary and edge-case test suites."
    },
    "Medic": {
        "role": "Crash Responder",
        "desc": "Cures inexplicable system crashes. Wraps fragile network calls and dangerous parsers in safe error boundaries, fallback states, and structured logs."
    },
    "Cortex": {
        "role": "AI Integrator",
        "desc": "The AI infrastructure specialist. Upgrades legacy LLM tools, bumps model versions, and enforces strict JSON schemas for resilient AI integrations."
    },
    "Scribe": {
        "role": "Code Commenter",
        "desc": "Clarifies complex, undocumented logic. Weaves precise inline comments, Docstrings, and critical warning labels directly into the source code to explain the 'Why'."
    },
    "Author": {
        "role": "Readme Writer",
        "desc": "Writes your high-level architecture guides. Generates clear README files and 'Quick Start' instructions to help developers instantly understand the repository."
    },
    "Navigator": {
        "role": "Roadmap Tracker",
        "desc": "Synchronizes your project strategy with reality. Reads your git history to mark features complete on your roadmap, keeping your tracking documents perfectly aligned."
    },
    "Curator": {
        "role": "Asset Optimizer",
        "desc": "Optimizes your static assets to drastically reduce bundle sizes. Compresses heavy images into modern formats and strips bloated metadata from SVGs."
    },
    "Overseer": {
        "role": "System Auditor",
        "desc": "The all-seeing intelligence engine. Runs deep forensic scans on file age, churn, and complexity to generate a master audit report guiding the rest of the agents."
    },
    "Cartographer": {
        "role": "Diagram Generator",
        "desc": "Translates complex folder structures and data flows into beautiful, readable architectural diagrams so you can understand your system at a glance."
    },
    "Spark": {
        "role": "Idea Generator",
        "desc": "Audits your custom logic and UX friction points, suggesting modern, battle-tested open-source solutions to replace them and logging the ideas to your roadmap."
    },
    "Herald": {
        "role": "Changelog Writer",
        "desc": "Parses your raw git history and translates chaotic developer commits into beautifully structured, user-facing semantic changelogs."
    },
    "Wordsmith": {
        "role": "UX Copywriter",
        "desc": "Red-pens passive, robotic UI strings and developer jargon. Rewrites errors and buttons into clear, actionable, and highly empathetic microcopy."
    },
    "Pedant": {
        "role": "Style Enforcer",
        "desc": "An uncompromising enforcer of style. Eradicates implicit types, fixes casing violations, and extracts rogue magic numbers into strict constants."
    },
    "Untangler": {
        "role": "Logic Flattener",
        "desc": "Takes deeply nested, unreadable 'spaghetti code' and flattens it out using early returns, clean guard clauses, and local helper functions."
    }
}

if os.path.exists(BASE_AGENTS_FILE):
    with open(BASE_AGENTS_FILE, 'r', encoding='utf-8') as f:
        agents = json.load(f)

    updated_count = 0
    for agent in agents:
        name = agent.get("name")

        # Completely remove the redundant scope field
        if "scope" in agent:
            del agent["scope"]

        if name in FTUE_METADATA:
            agent["role"] = FTUE_METADATA[name]["role"]
            agent["desc"] = FTUE_METADATA[name]["desc"]
            updated_count += 1

    with open(BASE_AGENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(agents, f, indent=2, ensure_ascii=False)

    print(f"Successfully upgraded {updated_count} agents for FTUE in {BASE_AGENTS_FILE}.")
