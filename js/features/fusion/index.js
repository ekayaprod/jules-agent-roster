if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
  module.exports = {
    FusionCompiler: require('./FusionCompiler.js'),
    FusionIndex: require('./FusionIndex.js'),
    FusionLab: require('./FusionLab.js'),
    FusionAnimation: require('./FusionAnimation.js')
  };
}