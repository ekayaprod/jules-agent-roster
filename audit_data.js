const fs = require('fs').promises;
const path = require('path');

// Helper to check string for whitespace
function hasIssues(str) {
    if (typeof str !== 'string') return false;
    return str !== str.trim() || str.includes("  ");
}

function deriveFilename(name) {
    return name
        .replace(/[^\x00-\x7F]/g, "")
        .trim()
        .replace(/ /g, "_") + ".md";
}

async function run() {
    let issuesFound = false;

    // 1. Audit agents.json
    console.log("Auditing agents.json...");
    try {
        const content = await fs.readFile('agents.json', 'utf8');
        const agents = JSON.parse(content);
        agents.forEach((agent, index) => {
            if (hasIssues(agent.name)) {
                console.log(`[agents.json] Index ${index}: Name '${agent.name}' has whitespace issues.`);
                issuesFound = true;
            }
            if (hasIssues(agent.category)) {
                console.log(`[agents.json] Index ${index}: Category '${agent.category}' has whitespace issues.`);
                issuesFound = true;
            }
        });
    } catch (e) {
        console.error("Failed to read agents.json", e);
    }

    // 2. Audit custom_agents.json
    console.log("\nAuditing custom_agents.json...");
    try {
        const content = await fs.readFile('custom_agents.json', 'utf8');
        const customAgents = JSON.parse(content);

        // Get actual files in prompts/fusions
        const files = await fs.readdir('prompts/fusions');

        for (const [key, agent] of Object.entries(customAgents)) {
            // Check Key
            const parts = key.split(",");
            parts.forEach(p => {
                if (p !== p.trim()) {
                    console.log(`[custom_agents.json] Key '${key}' has untrimmed parts.`);
                    issuesFound = true;
                }
            });

            // Check Name
            if (hasIssues(agent.name)) {
                console.log(`[custom_agents.json] Key '${key}': Name '${agent.name}' has whitespace issues.`);
                issuesFound = true;
            }

            // Check Filename match
            const expectedFilename = deriveFilename(agent.name);
            if (!files.includes(expectedFilename)) {
                console.log(`[custom_agents.json] Key '${key}': Expected file '${expectedFilename}' not found in prompts/fusions/.`);

                // Try to find close match
                const match = files.find(f => f.toLowerCase() === expectedFilename.toLowerCase());
                if (match) {
                    console.log(`  -> Found case-mismatch: '${match}'`);
                } else {
                    // Check if maybe it exists with a slightly different name
                    const simpleName = agent.name.split(" ")[0]; // e.g. "Void" from "Void 🗑️"
                    const fuzzy = files.find(f => f.includes(simpleName));
                    if (fuzzy) {
                        console.log(`  -> Found potential match: '${fuzzy}'`);
                    }
                }
                issuesFound = true;
            }
        }

    } catch (e) {
        console.error("Failed to read custom_agents.json or prompts/fusions directory", e);
    }

    if (!issuesFound) {
        console.log("\n✅ No data issues found.");
    } else {
        console.log("\n❌ Issues found. Please fix manually or update script.");
    }
}

run().catch(console.error);
