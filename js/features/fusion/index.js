// js/features/fusion/index.js
// Barrel export for Fusion feature

if (typeof module !== 'undefined' && module.exports) {
    const FusionCompiler = require('./FusionCompiler.js');
    const FusionIndex = require('./FusionIndex.js');
    const FusionLab = require('./FusionLab.js');
    module.exports = {
        FusionCompiler,
        FusionIndex,
        FusionLab
    };
}
