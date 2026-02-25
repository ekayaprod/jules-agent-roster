const fs = require('fs').promises;

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

async function processFile(filepath) {
    console.log(`Cleaning ${filepath}...`);
    try {
        const content = await fs.readFile(filepath, 'utf8');
        const data = JSON.parse(content);
        const cleanedData = cleanObject(data);
        const newContent = JSON.stringify(cleanedData, null, 2); // 2 spaces indentation

        // Only write if changed to avoid unnecessary churn
        if (content.trim() !== newContent.trim()) {
            await fs.writeFile(filepath, newContent + '\n'); // Add final newline
            console.log(`✅ Fixed whitespace issues in ${filepath}`);
        } else {
            console.log(`✨ ${filepath} was already clean.`);
        }
    } catch (e) {
        console.error(`❌ Error processing ${filepath}:`, e);
    }
}

async function main() {
  const files = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['agents.json', 'custom_agents.json'];

  for (const file of files) {
      await processFile(file);
  }
}

main().catch(console.error);
