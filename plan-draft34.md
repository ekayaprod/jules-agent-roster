Oh! I just reset all my changes! I need to re-apply them!

1. **AgentCard.js**: Update `isNaN(index)` to `typeof index === 'string' && Number.isNaN(Number(index))`.
2. **RosterApp.test.js**: Remove `app.bindEvents();` from `allows pinning securely on a valid base agent index`.
3. **RosterApp.js (open-fusions-modal)**: Map matrix keys to fusion names to correctly resolve `potentialFusions` and `childAgent`.
4. **ExportController.js (downloadCustomAgentsByParent)**: Map matrix keys to fusion names to correctly resolve `fusionName` and get the custom agent object from `customAgentsMap`.
