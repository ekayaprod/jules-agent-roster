// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; }
};

// Mock document/window
global.document = {
  getElementById: () => null
};

// Include FusionIndex
const fs = require('fs');
const StorageService = require('./js/services/StorageService.js');
let code = fs.readFileSync('./js/FusionIndex.js', 'utf8');

const { Script } = require('vm');
const script = new Script(code + '\n\n module.exports = FusionIndex;');
const m = { exports: {} };
script.runInNewContext({
  localStorage: global.localStorage,
  document: global.document,
  console: console,
  module: m,
  Set: Set,
  Array: Array,
  JSON: JSON,
  StorageService: StorageService
});

const FusionIndex = m.exports;

const index = new FusionIndex('test-container', {}, () => {});
const storageKey = index.storageKey;

console.log("--- Test 1: Valid JSON ---");
localStorage.setItem(storageKey, JSON.stringify(["Void", "Spark"]));
index.loadState();
console.log("Unlocked Keys size:", index.unlockedKeys.size);

console.log("\n--- Test 2: Invalid JSON ---");
localStorage.setItem(storageKey, "{malformed_json:");
index.loadState();
console.log("Unlocked Keys size after failure:", index.unlockedKeys.size);
