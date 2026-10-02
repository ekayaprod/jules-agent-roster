const { performance } = require('perf_hooks');

const categoryKeys = ["plus", "strategy", "utility", "pinned", "custom"];
const pinnedManager = {
    isPinned: (key) => key % 10 === 0
};
const hasPinnedManager = true;

const generateCategorizedAgents = () => {
    const categorizedAgents = {};
    categoryKeys.forEach(k => categorizedAgents[k] = []);
    for (let i = 0; i < 50000; i++) {
        const cat = categoryKeys[i % categoryKeys.length];
        categorizedAgents[cat].push({
            agent: { tier: i % 5 === 0 ? "Plus" : "Normal", name: "Agent" + i },
            indexOrKey: i
        });
    }
    return categorizedAgents;
};

const runOld = () => {
    const categorizedAgents = generateCategorizedAgents();
    const start = performance.now();
    const flattenedAgents = categoryKeys.flatMap(key => {
      const arr = categorizedAgents[key] || [];
      return arr.map(item => {
        item.gridCategory = key;
        item._sortScore = (hasPinnedManager && pinnedManager.isPinned(item.indexOrKey) ? 4 : 0) + (item.agent?.tier === "Plus" ? 2 : 0) + (item.agent?.name?.endsWith("+") ? 1 : 0);
        return item;
      }).sort((a, b) => b._sortScore - a._sortScore);
    });
    const end = performance.now();
    return { time: end - start, res: flattenedAgents };
};

const runNew = () => {
    const categorizedAgents = generateCategorizedAgents();
    const start = performance.now();

    let totalLength = 0;
    for (let i = 0; i < categoryKeys.length; i++) {
        const arr = categorizedAgents[categoryKeys[i]];
        if (arr) totalLength += arr.length;
    }
    const flattenedAgents = new Array(totalLength);
    let offset = 0;

    for (let i = 0; i < categoryKeys.length; i++) {
        const key = categoryKeys[i];
        const arr = categorizedAgents[key];
        if (!arr || arr.length === 0) continue;

        for (let j = 0; j < arr.length; j++) {
            const item = arr[j];
            item.gridCategory = key;

            let score = 0;
            if (hasPinnedManager && pinnedManager.isPinned(item.indexOrKey)) score += 4;

            const agent = item.agent;
            if (agent) {
                if (agent.tier === "Plus") score += 2;
                const name = agent.name;
                if (name && name.endsWith("+")) score += 1;
            }
            item._sortScore = score;
        }

        arr.sort((a, b) => b._sortScore - a._sortScore);

        for (let j = 0; j < arr.length; j++) {
            flattenedAgents[offset++] = arr[j];
        }
    }

    const end = performance.now();
    return { time: end - start, res: flattenedAgents };
};

let oldSum = 0;
let newSum = 0;
for (let i = 0; i < 100; i++) {
    const { time: timeOld, res: resOld } = runOld();
    const { time: timeNew, res: resNew } = runNew();
    oldSum += timeOld;
    newSum += timeNew;
}
console.log(`Old: ${oldSum / 100} ms`);
console.log(`New: ${newSum / 100} ms`);
