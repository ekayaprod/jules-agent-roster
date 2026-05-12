const { JSDOM } = require('jsdom');
const { performance } = require('perf_hooks');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><div id="terminal"></div>`);
global.document = dom.window.document;
global.window = dom.window;

const code = fs.readFileSync('js/UI/JulesTerminal/JulesTerminal.js', 'utf8');

// Mock getFormatUtils
const JulesTerminalMock = {
    getFormatUtils: () => ({ escapeHTML: str => str })
};

function renderPullRequests(prs, terminal) {
    terminal.querySelectorAll('.term-pr-item').forEach(el => el.remove());
    if (!prs || prs.length === 0) return;

    const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
    if (fetchingIndicator) fetchingIndicator.remove();

    const formatUtils = JulesTerminalMock.getFormatUtils();

    prs.forEach(pr => {
        const item = document.createElement("div");
        item.className = "term-pr-item";

        const escapedTitle = formatUtils ? formatUtils.escapeHTML(pr.title) : pr.title;

        item.innerHTML = `
            <span style="color: var(--term-success); font-weight: 600; flex-shrink: 0;">[PR OPEN]</span>
            <a href="#" class="term-pr-title term-link pr-modal-trigger" data-pr-number="${pr.number}">#${pr.number} ${escapedTitle}</a>
        `;
        const link = item.querySelector('.pr-modal-trigger');
        if (link) {
            link.onclick = (e) => {
                e.preventDefault();
            };
        }
        terminal.insertBefore(item, terminal.firstChild);
    });
}

function renderPullRequestsOptimized(prs, terminal) {
    terminal.querySelectorAll('.term-pr-item').forEach(el => el.remove());
    if (!prs || prs.length === 0) return;

    const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
    if (fetchingIndicator) fetchingIndicator.remove();

    const formatUtils = JulesTerminalMock.getFormatUtils();
    const fragment = document.createDocumentFragment();

    prs.forEach(pr => {
        const item = document.createElement("div");
        item.className = "term-pr-item";

        const escapedTitle = formatUtils ? formatUtils.escapeHTML(pr.title) : pr.title;

        item.innerHTML = `
            <span style="color: var(--term-success); font-weight: 600; flex-shrink: 0;">[PR OPEN]</span>
            <a href="#" class="term-pr-title term-link pr-modal-trigger" data-pr-number="${pr.number}">#${pr.number} ${escapedTitle}</a>
        `;
        const link = item.querySelector('.pr-modal-trigger');
        if (link) {
            link.onclick = (e) => {
                e.preventDefault();
            };
        }
        fragment.insertBefore(item, fragment.firstChild);
    });
    terminal.insertBefore(fragment, terminal.firstChild);
}

const prs = Array.from({ length: 1000 }, (_, i) => ({ number: i, title: 'PR ' + i }));
const terminal = document.getElementById('terminal');

// Warmup
for(let i=0; i<10; i++) {
    renderPullRequests(prs, terminal);
    renderPullRequestsOptimized(prs, terminal);
}

const RUNS = 50;
let timeOriginal = 0;
let timeOptimized = 0;

for(let i=0; i<RUNS; i++) {
    const t0 = performance.now();
    renderPullRequests(prs, terminal);
    timeOriginal += (performance.now() - t0);
}

for(let i=0; i<RUNS; i++) {
    const t0 = performance.now();
    renderPullRequestsOptimized(prs, terminal);
    timeOptimized += (performance.now() - t0);
}

console.log(`Original: ${(timeOriginal/RUNS).toFixed(2)}ms`);
console.log(`Optimized: ${(timeOptimized/RUNS).toFixed(2)}ms`);
