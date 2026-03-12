const { RarityEngine } = require('./js/Features/Fusion/index.js');
console.log(RarityEngine.calculateRarity(
  {name: "Bolt+", category: "core"},
  {name: "Palette+", category: "core"}
));
console.log(RarityEngine.getSuperDomain({name: "Bolt+", category: "core"}));
console.log(RarityEngine.getSuperDomain({name: "Palette+", category: "core"}));
