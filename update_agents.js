const fs = require('fs');

const agentsPath = 'agents.json';
const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));

const updates = {
  "Bolt+": {
    short_description: "Hunts down and eliminates structural latency, sequential friction, and rendering bottlenecks. Autonomously rewires isolated execution paths to maximize concurrency, throughput, and overall application velocity.",
    category: "core"
  },
  "Palette+": {
    short_description: "Sculpts the visual space and smooths interactive flows by harmonizing aesthetics and removing UX friction. Autonomously isolates and upgrades clunky components to deliver a cohesive, premium, and accessible experience.",
    category: "core"
  },
  "Sentinel+": {
    short_description: "Fortifies the application's perimeter by neutralizing injection vectors, securing hardcoded secrets, and erecting rigid schema validation boundaries. Autonomously prioritizes critical threats to ensure zero-trust resilience at the data layer.",
    category: "core"
  },
  "Helix": {
    short_description: "Ruthlessly hunts down duplicated logic and abstracts it into pure global utilities or highly focused local helpers. Acts as the ultimate guardian against WET code by targeting exact clones and semantic near-clones.",
    category: "refactoring"
  },
  "Architect": {
    short_description: "Reinforces the repository's foundation by dismantling unmaintainable monoliths, erecting cohesive domain structures, and laying clean, load-bearing paths. Acts autonomously as the decisive foreman of the physical file tree to ensure infinite scalability.",
    category: "architecture"
  },
  "Scavenger": {
    short_description: "Systematically eradicates codebase bloat by identifying and safely deleting mathematically proven dead code, unreachable execution paths, and visual debris. Autonomously picks the carcass clean to ensure the repository remains lean and compiling perfectly.",
    category: "hygiene"
  },
  "Superintendent": {
    short_description: "Maintains structural stability by systematically executing safe, isolated dependency updates, deduplicating lockfiles, and standardizing environment configurations. Autonomously prevents rot at the foundation without introducing breaking architectural shifts.",
    category: "hygiene"
  },
  "Modernizer": {
    short_description: "Systematically mutates fossilized syntax and extinct patterns into modern, native language standards. Autonomously targets isolated genetic upgrades to ensure the ecosystem remains performant, readable, and free of evolutionary dead ends.",
    category: "refactoring"
  },
  "Inspector": {
    short_description: "Rigorously interrogates fragile code boundaries by generating isolated, mathematically definitive unit and integration tests. Autonomously assaults execution paths with concurrency stress and edge cases to map fault lines and prove runtime resilience.",
    category: "testing"
  },
  "Paramedic": {
    short_description: "Arrives on the scene of a Dead on Arrival (DOA) application to execute deep structural triage and resuscitate it. Autonomously hunts down and cures fatal startup crashes, uninitialized global states, and load-order race conditions at the boot layer.",
    category: "operations"
  },
  "Cortex": {
    short_description: "Upgrades AI integrations exclusively at the API, SDK, and model layer. Autonomously enforces strictly typed outputs and resilient connectivity, hardening the repository with deterministic boundaries around non-deterministic cores.",
    category: "operations"
  },
  "Scribe": {
    short_description: "Illuminates complex, undocumented logic by weaving precise language-native documentation directly into the source code. Autonomously unearths invisible business constraints, mathematical proofs, and architectural workarounds to preserve institutional memory.",
    category: "documentation"
  },
  "Author": {
    short_description: "Synthesizes, edits, and maintains structural macro-documentation like READMEs, architectural overviews, and Quick Start guides. Autonomously ensures the repository is navigable while seamlessly mirroring the exact tone and culture of the project.",
    category: "documentation"
  },
  "Navigator": {
    short_description: "Synchronizes project strategy documents with codebase reality, ensuring ROADMAP.md is the absolute single source of truth. Autonomously aligns checkboxes, PR links, and active milestones with the physical git history to bridge execution and planning.",
    category: "strategy"
  },
  "Curator": {
    short_description: "Optimizes static assets by compressing heavy images, upgrading to modern formats, and stripping metadata from bloated SVGs. Autonomously updates source code references to drastically reduce bundle sizes and network payloads without degrading visual fidelity.",
    category: "ux"
  },
  "Herald": {
    short_description: "Translates raw git history and internal ticketing jargon into beautifully structured, user-facing semantic changelogs. Autonomously filters out internal noise and highlights human impact to broadcast codebase reality with professional clarity.",
    category: "documentation"
  },
  "Wordsmith": {
    short_description: "Eradicates developer jargon, passive voice, and dead-end error states by rewriting them into active, actionable microcopy. Autonomously ensures every string explicitly defines failure states and provides a clear resolution path for the user.",
    category: "ux"
  },
  "Pedant": {
    short_description: "Obsessively enforces line-level style, strict naming conventions, absolute typological safety, and perfect structural order. Autonomously acts as the uncompromising gatekeeper against entropy, magic strings, and loose types to ensure absolute conformity.",
    category: "hygiene"
  },
  "Untangler": {
    short_description: "Unknots cognitive complexity by weaving deeply threaded, unreadable 'Arrow Code' into a flat, breathable fabric. Autonomously hunts for dense branching logic, applying early returns, guard clauses, and local helpers to smooth the codebase's tapestry.",
    category: "refactoring"
  },
  "Overseer": {
    short_description: "Executes deep, unrestricted forensic codebase scans to generate objective intelligence reports (AGENTS_AUDIT.md). Autonomously acts as the omniscient triage engine, finding systemic decay that localized agents miss to guide the Core Roster.",
    category: "meta"
  },
  "Cartographer": {
    short_description: "Executes exhaustive, repository-wide deep scans to translate complex folder structures, ecosystems, and hidden boundaries into beautiful Mermaid.js diagrams. Autonomously maps the entire repository using the C4 Model to provide unparalleled structural insight.",
    category: "meta"
  },
  "Spark": {
    short_description: "Executes exhaustive, repository-wide deep scans to push the envelope of the codebase. Autonomously identifies UX blindspots, DX friction, and technical obsolescence, authoring roadmap proposals to replace stagnant patterns with industry-standard solutions.",
    category: "meta"
  }
};

agents.forEach(agent => {
  if (updates[agent.name]) {
    agent.short_description = updates[agent.name].short_description;
    agent.category = updates[agent.name].category;
  }
});

fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2) + '\n');
console.log("Updated agents.json");
