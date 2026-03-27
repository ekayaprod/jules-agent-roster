// Barrel file for JulesManager domain
const JulesManager = typeof require !== 'undefined' ? require('./JulesManager') : window.JulesManager;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesManager;
}
