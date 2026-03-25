Plan:
1. Create `js/Utils/agent-utils.js`
2. Update `index.html` to include `<script src="js/Utils/agent-utils.js"></script>`
3. Remove `getCustomAgent` from `js/Features/Fusion/FusionIndex.js` and use `AgentUtils.getCustomAgent(this.customAgents, key)`
4. Remove `getCustomAgent` from `js/core/RosterApp.js` and use `AgentUtils.getCustomAgent(this.customAgents, key)`
5. Update `js/Features/Search/SearchController.js` to use `AgentUtils.getCustomAgent(this.app.customAgents, key)`
6. Update test `js/UI/AgentCard/AgentCard.test.js`: remove mock of `getCustomAgent`.
7. Update test `js/Features/Search/SearchController.test.js` to mock `global.AgentUtils`.
8. Check `js/Features/Export/ExportController.js` and test it (optional but good).
9. Run `npm test` and `npm run test:unit`
10. Pre-commit check.
