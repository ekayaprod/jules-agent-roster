const { RosterApp } = require('../js/app');

describe('RosterApp.filterAgents', () => {
  let app;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="search-announcer"></div>
      <input id="searchInput" type="text" />
      <button id="clearBtn" class="clear-search-btn"></button>
      <div id="emptyState" class="empty-state"></div>

      <h2 class="section-header">Core</h2>
      <div class="grid">
        <div class="card">Agent Alpha</div>
        <div class="card">Agent Beta</div>
      </div>

      <h2 class="section-header">Specialists</h2>
      <div class="grid">
        <div class="card">Agent Gamma</div>
      </div>
    `;

    app = new RosterApp();
    // Manually call cacheElements to populate this.elements
    app.cacheElements();
  });

  test('shows all agents when query is empty', () => {
    app.filterAgents('');

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      // Logic sets display to flex if matched, or doesn't touch it if empty?
      // Wait, let's check logic:
      // if (text.includes(search)) { card.style.display = "flex"; ... } else { card.style.display = "none"; }
      // Empty string "" includes in everything? "abc".includes("") is true.
      expect(card.style.display).toBe('flex');
    });

    expect(document.getElementById('emptyState').classList.contains('visible')).toBe(false);
    expect(document.getElementById('clearBtn').classList.contains('visible')).toBe(false);
  });

  test('filters agents based on query (case insensitive)', () => {
    app.filterAgents('alpha');

    const cards = document.querySelectorAll('.card');
    expect(cards[0].style.display).toBe('flex'); // Agent Alpha
    expect(cards[1].style.display).toBe('none'); // Agent Beta
    expect(cards[2].style.display).toBe('none'); // Agent Gamma

    expect(document.getElementById('emptyState').classList.contains('visible')).toBe(false);
    expect(document.getElementById('clearBtn').classList.contains('visible')).toBe(true);
  });

  test('shows empty state when no agents match', () => {
    app.filterAgents('zeta');

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      expect(card.style.display).toBe('none');
    });

    expect(document.getElementById('emptyState').classList.contains('visible')).toBe(true);

    // Section headers should be hidden
    const headers = document.querySelectorAll('.section-header');
    headers.forEach(header => {
      expect(header.style.display).toBe('none');
    });
  });

  test('updates announcer text', () => {
    app.filterAgents('beta');
    expect(document.getElementById('search-announcer').textContent).toBe('Found 1 agents.');

    app.filterAgents('zeta');
    expect(document.getElementById('search-announcer').textContent).toBe('No agents found.');

    app.filterAgents('');
    expect(document.getElementById('search-announcer').textContent).toBe('');
  });

  test('hides section headers if no visible cards in that grid', () => {
    // Search for Gamma, which is in the second grid
    app.filterAgents('Gamma');

    const headers = document.querySelectorAll('.section-header');

    // Core header (first one) should be hidden because Alpha and Beta are hidden
    expect(headers[0].style.display).toBe('none');

    // Specialists header (second one) should be visible because Gamma is visible
    expect(headers[1].style.display).toBe('block');
  });

  test('clearSearch resets search input and filters', () => {
    const input = document.getElementById('searchInput');
    input.value = 'foo';
    app.filterAgents('foo'); // setup filtered state

    app.clearSearch();

    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);

    // Should show all cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => expect(card.style.display).toBe('flex'));
  });
});
