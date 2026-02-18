const { RosterApp, CONFIG } = require('../js/app');

describe('RosterApp.filterAgents', () => {
    let app;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <button id="clearBtn"></button>
            <div id="emptyState"></div>
            <div id="search-announcer"></div>

            <h2 class="section-header" id="header1">Section 1</h2>
            <div class="grid" id="grid1">
                <div class="card">Bolt</div>
                <div class="card">Sentinel</div>
            </div>

            <h2 class="section-header" id="header2">Section 2</h2>
            <div class="grid" id="grid2">
                <div class="card">Architect</div>
            </div>
        `;

        // Initialize app instance
        app = new RosterApp();

        // Manually populate cached elements that filterAgents uses
        app.elements = {
            clearBtn: document.getElementById('clearBtn'),
            emptyState: document.getElementById('emptyState'),
            announcer: document.getElementById('search-announcer'),
            // Note: filterAgents queries cards and grids directly from document, not from this.elements
        };
    });

    test('should show all agents when query is empty', () => {
        app.filterAgents('');

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            // Logic: if match, display is flex. If query empty, visibleCount increases, so display flex.
            // Wait, logic says:
            // if (text.includes(search)) { ... display = "flex" ... }
            // empty string is included in any string. So all should be flex.
            expect(card.style.display).toBe('flex');
        });

        expect(app.elements.clearBtn.classList.contains('visible')).toBe(false);
        expect(app.elements.emptyState.classList.contains('visible')).toBe(false);
    });

    test('should filter agents by name (case-insensitive)', () => {
        app.filterAgents('bolt');

        const cards = document.querySelectorAll('.card');
        // Index 0: Bolt, 1: Sentinel, 2: Architect
        expect(cards[0].style.display).toBe('flex');
        expect(cards[1].style.display).toBe('none');
        expect(cards[2].style.display).toBe('none');

        expect(app.elements.clearBtn.classList.contains('visible')).toBe(true);
        expect(app.elements.announcer.textContent).toContain('Found 1 agents');
    });

    test('should show empty state when no agents match', () => {
        app.filterAgents('xyz');

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            expect(card.style.display).toBe('none');
        });

        expect(app.elements.emptyState.classList.contains('visible')).toBe(true);
        expect(app.elements.announcer.textContent).toBe('No agents found.');

        // Headers should be hidden
        const headers = document.querySelectorAll('.section-header');
        headers.forEach(header => {
            expect(header.style.display).toBe('none');
        });
    });

    test('should handle partial matches', () => {
        app.filterAgents('ent'); // Matches Sentinel ('ent' in Sentinel) and Agent ('ent' in Agent?) No, "Sentinel"
        // Wait, "Sentinel" has "ent".

        const cards = document.querySelectorAll('.card');
        // Bolt doesn't have ent.
        // Sentinel has ent.
        // Architect (Archit[e]c[t]) - no ent.

        expect(cards[0].style.display).toBe('none'); // Bolt
        expect(cards[1].style.display).toBe('flex'); // Sentinel
        expect(cards[2].style.display).toBe('none'); // Architect
    });

    test('should hide section headers if no cards in that section match', () => {
         app.filterAgents('Architect');
         // Grid 1 has Bolt, Sentinel (hidden) -> Header 1 hidden
         // Grid 2 has Architect (visible) -> Header 2 visible

         const header1 = document.getElementById('header1');
         const header2 = document.getElementById('header2');

         expect(header1.style.display).toBe('none');
         expect(header2.style.display).toBe('block');
    });
});
