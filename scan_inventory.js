const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'prompts', 'fusions');

const result = {
  total_files: 0,
  highlander_file_found: false,
  void_has_meta_heuristic: false,
  weaver_has_meta_heuristic: false,
  file_details: {}
};

try {
  const files = fs.readdirSync(directoryPath);

  const mdFiles = files.filter(file => file.endsWith('.md'));
  result.total_files = mdFiles.length;

  for (const file of mdFiles) {
    const filePath = path.join(directoryPath, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Highlander Check
    if (file.toLowerCase().includes('highlander')) {
      result.highlander_file_found = file;
    }

    // Meta-Heuristic Check
    if (file === 'Void.md' || file === 'Weaver.md') {
      const hasMetaHeuristic = content.includes('META-HEURISTIC DIRECTIVE');
      if (file === 'Void.md') result.void_has_meta_heuristic = hasMetaHeuristic;
      if (file === 'Weaver.md') result.weaver_has_meta_heuristic = hasMetaHeuristic;
    }

    // Extract Headers
    const lines = content.split('\n');
    const nonEmptyLines = lines.map(line => line.trim()).filter(line => line.length > 0);

    if (nonEmptyLines.length >= 2) {
      result.file_details[file] = {
        line1: nonEmptyLines[0],
        line2: nonEmptyLines[1]
      };
    } else if (nonEmptyLines.length === 1) {
        result.file_details[file] = {
            line1: nonEmptyLines[0],
            line2: ""
        };
    } else {
         result.file_details[file] = {
            line1: "",
            line2: ""
        };
    }
  }

  fs.writeFileSync('inventory.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Inventory scan complete. Results saved to inventory.json.');
} catch (err) {
  console.error('Error reading directory:', err);
}
