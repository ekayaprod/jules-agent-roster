const { performance } = require('perf_hooks');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Setup JSDOM
const dom = new JSDOM(`<!DOCTYPE html><div id="fusion-container"></div>`);
global.document = dom.window.document;
global.window = dom.window;

// Mock dependencies
global.StorageUtils = {
  getJsonArrayItem: () => [],
  setJsonItem: () => {}
};
global.FormatUtils = {
  extractIcon: () => '❓',
  escapeHTML: (str) => str
};

const FusionIndex = require('./FusionIndex');

// Generate large dataset
const customAgents = {};
for (let i = 0; i < 5000; i++) {
  customAgents[`agent_${i}`] = `Agent ${i}`;
}

function runBenchmark(name, useFragment) {
  const fusionIndex = new FusionIndex('fusion-container', customAgents, () => {});
  fusionIndex.init();

  if (useFragment) {
    // Monkey patch render
    fusionIndex.render = function() {
      const container = this.elements.container ?? document.getElementById(this.containerId);
      if (!container) return;

      container.innerHTML = '';
      container.className = 'fusion-index-wrapper';

      const header = document.createElement('h3');
      header.textContent = 'Fusion Index';
      header.className = 'fusion-index-header';
      container.appendChild(header);

      const customAgentsSafe = this.customAgents || {};

      const grid = document.createElement('div');
      grid.className = 'fusion-shelf-grid';
      container.appendChild(grid);

      const fragment = document.createDocumentFragment();

      const sortedKeys = Object.keys(customAgentsSafe).sort((a, b) => {
        const nameA = customAgentsSafe[a] || a;
        const nameB = customAgentsSafe[b] || b;
        return nameA.localeCompare(nameB);
      });
      for (const key of sortedKeys) {
        if (
          Object.prototype.hasOwnProperty.call(customAgentsSafe, key) &&
          customAgentsSafe[key] !== ''
        ) {
          this._renderSlot(fragment, key, customAgentsSafe[key]);
        }
      }

      grid.appendChild(fragment);

      const progress = document.createElement('div');
      progress.className = 'fusion-progress';
      this.updateProgress(progress);
      container.appendChild(progress);
      this.progressEl = progress;
    };
  }

  document.getElementById('fusion-container').innerHTML = '';

  const start = performance.now();
  fusionIndex.render();
  const end = performance.now();

  console.log(`${name}: ${end - start} ms`);
}

// Warm up
runBenchmark('Warmup 1', false);
runBenchmark('Warmup 2', false);
runBenchmark('Warmup 1 (Frag)', true);
runBenchmark('Warmup 2 (Frag)', true);

runBenchmark('Baseline', false);
runBenchmark('Baseline', false);
runBenchmark('Baseline', false);

runBenchmark('Fragment', true);
runBenchmark('Fragment', true);
runBenchmark('Fragment', true);
