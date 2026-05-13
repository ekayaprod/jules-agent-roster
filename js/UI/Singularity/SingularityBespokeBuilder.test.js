const SingularityBespokeBuilder = require('./SingularityBespokeBuilder');

describe('SingularityBespokeBuilder', () => {
  let builder;
  let mockTerminal;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'singularityBuilderContainer';
    document.body.appendChild(container);

    mockTerminal = {
      launchSession: jest.fn(),
    };

    builder = new SingularityBespokeBuilder(mockTerminal);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('init', () => {
    it('should bail if container does not exist', () => {
      document.body.innerHTML = ''; // Remove container

      // Need to manually set container to null because the constructor sets it once
      builder.container = null;

      const renderSpy = jest.spyOn(builder, 'render');
      builder.init();
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should render and bind events if container exists', () => {
      const renderSpy = jest.spyOn(builder, 'render');
      const bindEventsSpy = jest.spyOn(builder, 'bindEvents');
      builder.init();
      expect(renderSpy).toHaveBeenCalled();
      expect(bindEventsSpy).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('should inject UI template into container', () => {
      builder.init();
      expect(container.querySelector('#sgAgentName')).not.toBeNull();
      expect(container.querySelector('#sgSubmit')).not.toBeNull();
    });
  });

  describe('bindEvents', () => {
    it('should toggle advanced options view on click', () => {
      builder.init();
      const toggleBtn = container.querySelector('#sgAdvancedBtn');
      const advancedOpts = container.querySelector('#sgAdvancedPanel');

      expect(advancedOpts.classList.contains('open')).toBe(false);

      toggleBtn.click();
      expect(advancedOpts.classList.contains('open')).toBe(true);

      toggleBtn.click();
      expect(advancedOpts.classList.contains('open')).toBe(false);
    });

    it('should handle mission input archetype badge updates', () => {
      builder.init();
      const missionInput = container.querySelector('#sgMission');
      const badge = container.querySelector('#sgPredictionBadge');

      missionInput.value = 'remove old files';
      missionInput.dispatchEvent(new Event('input'));
      expect(badge.innerHTML).toBe('🗡️ Assassin');

      missionInput.value = 'enforce strict types';
      missionInput.dispatchEvent(new Event('input'));
      expect(badge.innerHTML).toBe('🛡️ Sentinel');

      missionInput.value = 'document the codebase';
      missionInput.dispatchEvent(new Event('input'));
      expect(badge.innerHTML).toBe('🔮 Oracle');

      missionInput.value = 'build a new feature';
      missionInput.dispatchEvent(new Event('input'));
      expect(badge.innerHTML).toBe('🛠️ Maker');
    });

    it('should handle quick fill pill clicks', () => {
      builder.init();
      const pill = container.querySelector('.sg-pill[data-mission="Prune dead code and remove all unused files and exports."]');
      const missionInput = container.querySelector('#sgMission');

      pill.click();
      expect(missionInput.value).toBe('Prune dead code and remove all unused files and exports.');
    });
  });

  describe('handleForge', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      global.window.rosterApp = { showToast: jest.fn() };
      global.DOMUtils = { setButtonState: jest.fn() };
    });

    afterEach(() => {
      delete global.fetch;
      delete global.window.rosterApp;
      delete global.DOMUtils;
    });

    it('should handle successful forge request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Template with {{UI_AGENT_NAME}}'),
      });

      builder.init();
      builder.elements.nameInput.value = 'Test Agent';

      await builder.handleForge();

      expect(mockTerminal.launchSession).toHaveBeenCalled();
      const payload = mockTerminal.launchSession.mock.calls[0][0];
      expect(payload.prompt).toContain('Test Agent');
    });

    it('should handle fetch failure gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      builder.init();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await builder.handleForge();

      expect(consoleSpy).toHaveBeenCalledWith('Unable to forge bespoke agent:', expect.any(Error));
      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith(expect.stringContaining('Unable to forge bespoke agent:'));
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
    });

    it('should handle missing template response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      builder.init();
      await builder.handleForge();

      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith('Unable to load the Singularity template. Please try again.');
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
    });
  });
});

describe('SingularityBespokeBuilder - Edge Cases', () => {
  let builder;
  let mockTerminal;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'singularityBuilderContainer';
    document.body.appendChild(container);

    mockTerminal = {
      launchSession: jest.fn(),
    };

    builder = new SingularityBespokeBuilder(mockTerminal);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('handleForge properly constructs constraints string from checkboxes', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Constraints: {{UI_CHECKLIST_CONSTRAINTS}}'),
    });

    builder.init();

    // Manually check some boxes
    const cb1 = builder.elements.constraintsContainer.querySelector('input[value="No UI Mutations"]');
    const cb2 = builder.elements.constraintsContainer.querySelector('input[value="Do not modify tests"]');

    cb1.checked = true;
    cb2.checked = true;

    await builder.handleForge();

    expect(mockTerminal.launchSession).toHaveBeenCalled();
    const payload = mockTerminal.launchSession.mock.calls[0][0];
    expect(payload.prompt).toContain('Constraints: No UI Mutations, Do not modify tests');

    delete global.fetch;
  });

  it('should not throw if julesTerminal is null', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Template'),
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    builder.julesTerminal = null;
    builder.init();
    await builder.handleForge();

    expect(consoleWarnSpy).toHaveBeenCalledWith("Singularity Builder: julesTerminal instance is missing.");

    delete global.fetch;
  });
});

describe('SingularityBespokeBuilder - Global Export Bounds', () => {
  it('should export cleanly via module.exports if defined', () => {
    // 🕵️ Asserting the tail end of the isomorphic mapping
    expect(typeof module !== 'undefined' && module.exports).toBeTruthy();
    expect(SingularityBespokeBuilder).toBeDefined();
  });
});
