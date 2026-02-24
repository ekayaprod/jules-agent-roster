const fs = require('fs');

function cleanObject(obj) {
    if (typeof obj === 'string') {
        return obj.trim();
    } else if (Array.isArray(obj)) {
        return obj.map(cleanObject);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            // Trim keys if needed (for custom_agents map)
            const cleanKey = key.trim();
            newObj[cleanKey] = cleanObject(value);
        }
        return newObj;
    }
    return obj;
}

function processFile(filepath) {
    console.log(`Cleaning ${filepath}...`);
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        const data = JSON.parse(content);
        const cleanedData = cleanObject(data);
        const newContent = JSON.stringify(cleanedData, null, 2); // 2 spaces indentation

        // Only write if changed to avoid unnecessary churn
        if (content.trim() !== newContent.trim()) {
            fs.writeFileSync(filepath, newContent + '\n'); // Add final newline
            console.log(`✅ Fixed whitespace issues in ${filepath}`);
        } else {
            console.log(`✨ ${filepath} was already clean.`);
        }
    } catch (e) {
        console.error(`❌ Error processing ${filepath}:`, e);
    }
}

processFile('agents.json');
processFile('custom_agents.json');
