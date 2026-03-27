const fs = require('fs');

global.document = {
    createElement: () => ({ classList: { remove: () => {}, add: () => {} }, appendChild: () => {} }),
    getElementById: () => null
};

global.FusionCompiler = require('./js/Features/Fusion/FusionCompiler.js');
global.AgentCard = { create: () => ({ classList: { remove: () => {} } }) };
const FusionLab = require('./js/Features/Fusion/FusionLab.js');

const lab = new FusionLab();
const mockBase = [{name: 'A'}, {name: 'B'}];
const mockCustom = {};
for (let i = 0; i < 50000; i++) {
  mockCustom[`Custom,${i}`] = {name: `Target ${i}`};
}
mockCustom[`A,B`] = {name: `The One`};

lab.init(mockBase, mockCustom);
lab.elements = {
  fusionResultContainer: { classList: { add: () => {}, remove: () => {} }, innerHTML: '', appendChild: () => {} }
};

const start = performance.now();
for (let i = 0; i < 100; i++) {
  lab.renderFusionResult({name: 'The One'});
}
const end = performance.now();
console.log(`Baseline Time: ${(end - start).toFixed(2)}ms`);
