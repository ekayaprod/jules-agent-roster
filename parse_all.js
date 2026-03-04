const fs = require('fs');
const path = require('path');

const agentsPath = path.join(__dirname, 'custom_agents.json');
const customAgents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));

for (const [key, config] of Object.entries(customAgents)) {
    const mdPath = path.join(__dirname, 'prompts', 'fusions', `${config.name}.md`);
    if (!fs.existsSync(mdPath)) {
        console.error(`File not found: ${mdPath}`);
        continue;
    }

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const lines = mdContent.split('\n');

    // Parse Role
    // Format: "You are "Name" [emoji] - [Role/Tagline]."
    const firstLineMatch = lines[0].match(/You are "(.*?)" [^\s]+ - (.*?)(?:\.\s|\.?$)/);
    if (firstLineMatch) {
        let role = firstLineMatch[2].trim();
        if (role.endsWith('.')) role = role.slice(0, -1);
        config.role = role;
    } else {
        console.warn(`Could not parse role for ${config.name} from: ${lines[0]}`);
    }

    // Parse Type
    // Look for "**Type:** <value>" or "Type: <value>" anywhere in the file.
    let foundType = "";
    for (const line of lines) {
        const typeMatch = line.match(/^\s*\**Type:\**\s*(.*)/i);
        if (typeMatch) {
            foundType = typeMatch[1].trim();
            break;
        }
    }
    if (foundType) {
        config.type = foundType;
    } else {
        // According to the prompt, we parse for metadata corresponding to role and type.
        // If it doesn't exist, we don't invent one, we just leave it as it was (empty string usually).
        // Let's assume there is no type if it's not found in the file, so we keep what was in custom_agents.json or set it to empty string if it's empty.
        // Actually, maybe the type is "fusion"? Let's just leave it as empty string if not found.
        config.type = "";
    }

    // Now, parse the mission/objective for the short_description
    let missionMatch = mdContent.match(/Your mission is to (.*?)\.(?:\s+The enemy is .*?\.)?\s+You (.*?)\./is);
    let objectiveMatch = mdContent.match(/The Objective:\s*(.*?)\.\s+The Enemy:\s*(.*?)\.\s+The Method:\s*(.*?)\./is);

    let combined = "";
    if (missionMatch) {
        let verb = missionMatch[1].trim();
        let method = missionMatch[2].trim();

        verb = convertToThirdPerson(verb);
        method = convertToThirdPerson(method);

        combined = `${verb}. ${method}.`;
    } else if (objectiveMatch) {
        let verb = objectiveMatch[1].trim();
        let method = objectiveMatch[3].trim();

        verb = convertToThirdPerson(verb);
        method = convertToThirdPerson(method);

        combined = `${verb}. ${method}.`;
    } else {
        let firstPara = lines[0];
        const sentences = firstPara.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
            let processed = sentences.slice(1).join(" ");
            processed = processed.replace(/You author /gi, "Authors ");
            processed = processed.replace(/Your mission is to /gi, "");
            processed = processed.replace(/you ensure /gi, "ensures ");
            processed = processed.replace(/You accomplish this by /gi, "Accomplishes this by ");
            combined = processed;
        } else {
            combined = config.short_description;
        }
    }

    // Clean up extra spaces and capitalize
    combined = combined.replace(/\s+/g, ' ').trim();
    if (combined) {
        combined = combined.charAt(0).toUpperCase() + combined.slice(1);
        if (!combined.endsWith('.')) combined += '.';
    }

    config.short_description = combined;
}

function convertToThirdPerson(text) {
    if (!text) return "";
    let words = text.split(" ");
    let firstWord = words[0];

    const verbMap = {
        "Act": "Acts",
        "Restructure": "Restructures",
        "Upgrade": "Upgrades",
        "Fix": "Fixes",
        "Modernize": "Modernizes",
        "Sweep": "Sweeps",
        "Establish": "Establishes",
        "Eradicate": "Eradicates",
        "Move": "Moves",
        "Chisel": "Chisels",
        "Enforce": "Enforces",
        "Reorganize": "Reorganizes",
        "Author": "Authors",
        "Identify": "Identifies",
        "Map": "Maps",
        "Own": "Owns",
        "Rewrite": "Rewrites",
        "Extract": "Extracts",
        "Build": "Builds",
        "Execute": "Executes",
        "Evaluate": "Evaluates",
        "Negotiate": "Negotiates",
        "Intercept": "Intercepts",
        "Ensure": "Ensures",
        "Crush": "Crushes",
        "Analyze": "Analyzes",
        "Solve": "Solves",
        "Leverage": "Leverages",
        "Reduce": "Reduces",
        "Bring": "Brings",
        "Read": "Reads",
        "Translate": "Translates",
        "Combine": "Combines",
        "Unify": "Unifies",
        "Demolish": "Demolishes",
        "Bridge": "Bridges",
        "Treat": "Treats",
        "Strip": "Strips",
        "Stop": "Stops",
        "Use": "Uses",
        "Review": "Reviews",
        "Lock": "Locks",
        "Regulate": "Regulates",
        "Secure": "Secures",
        "Bump": "Bumps",
        "Research": "Researches",
        "hunt": "hunts",
        "eliminate": "eliminates",
        "stop": "stops",
        "identify": "identifies",
        "clarify": "clarifies",
        "compress": "compresses",
        "eradicate": "eradicates",
        "enforce": "enforces",
        "evaluate": "evaluates",
        "rewrite": "rewrites",
        "standardize": "standardizes",
        "re-architect": "re-architects",
        "generate": "generates",
        "announce": "announces",
        "design": "designs",
        "extract": "extracts",
        "convert": "converts",
        "take": "takes",
        "distill": "distills",
        "write": "writes",
        "build": "builds",
        "wrap": "wraps",
        "safely": "safely",
        "meticulously": "meticulously",
        "autonomously": "autonomously",
        "completely": "completely",
        "aggressively": "aggressively",
        "ruthlessly": "ruthlessly",
        "systematically": "systematically",
        "rigorously": "rigorously",
        "strategically": "strategically",
        "read": "reads"
    };

    if (verbMap[firstWord]) {
        words[0] = verbMap[firstWord];
    } else if (verbMap[firstWord.toLowerCase()]) {
        words[0] = verbMap[firstWord.toLowerCase()].charAt(0).toUpperCase() + verbMap[firstWord.toLowerCase()].slice(1);
    } else if (!firstWord.endsWith('s') && firstWord !== "safe" && firstWord !== "autonomously") {
        words[0] = firstWord + "s";
    }

    let result = words.join(" ");

    const middleReplacements = [
        [/ and write /g, " and writes "],
        [/ and apply /g, " and applies "],
        [/ and create /g, " and creates "],
        [/ and implement /g, " and implements "],
        [/ and update /g, " and updates "],
        [/ and strip /g, " and strips "],
        [/ and ensure /g, " and ensures "],
        [/ and replace /g, " and replaces "],
        [/ and delete /g, " and deletes "],
        [/ and sever /g, " and severs "],
        [/ and inject /g, " and injects "]
    ];

    for (const [pattern, replacement] of middleReplacements) {
        result = result.replace(pattern, replacement);
    }

    result = result.replace(/you accomplish this by /gi, "accomplishes this by ");
    result = result.replace(/you /gi, "");

    return result;
}

fs.writeFileSync('custom_agents_parsed.json', JSON.stringify(customAgents, null, 2), 'utf8');
